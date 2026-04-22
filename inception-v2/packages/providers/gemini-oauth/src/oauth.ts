// ============================================================================
// OAuth Token Store — disk-backed access/refresh token management
// ============================================================================

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * Token payload persisted to disk and used for Google OAuth 2.0 flows.
 */
export interface TokenData {
  readonly access_token: string;
  readonly refresh_token?: string;
  /** Unix milliseconds at which the access token expires */
  readonly expires_at: number;
  readonly token_type: string;
}

/**
 * Persists and loads OAuth tokens to/from a local JSON file.
 */
export class OAuthTokenStore {
  constructor(private readonly storePath: string) {}

  /**
   * Load token data from disk.
   * Returns `undefined` if the file does not exist or cannot be parsed.
   */
  async load(): Promise<TokenData | undefined> {
    try {
      const raw = await readFile(this.storePath, 'utf-8');
      const parsed: unknown = JSON.parse(raw);
      if (isTokenData(parsed)) {
        return parsed;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Persist token data to disk, creating parent directories as needed.
   */
  async save(token: TokenData): Promise<void> {
    await mkdir(dirname(this.storePath), { recursive: true });
    await writeFile(this.storePath, JSON.stringify(token, null, 2), 'utf-8');
  }

  /**
   * Returns `true` if the token expires within the next 60 seconds.
   */
  isExpired(token: TokenData): boolean {
    return token.expires_at < Date.now() + 60_000;
  }
}

// ── type guard ────────────────────────────────────────────────────────────────

function isTokenData(value: unknown): value is TokenData {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['access_token'] === 'string' &&
    typeof obj['expires_at'] === 'number' &&
    typeof obj['token_type'] === 'string'
  );
}

// ── Token refresh ─────────────────────────────────────────────────────────────

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

/**
 * Refresh an expired access token using the Google OAuth 2.0 token endpoint.
 *
 * POST https://oauth2.googleapis.com/token
 */
export async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<TokenData> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const json: unknown = await response.json();

  if (!response.ok || !isGoogleTokenResponse(json) || json.error) {
    const errMsg =
      isGoogleTokenResponse(json) && json.error_description
        ? json.error_description
        : `HTTP ${response.status}`;
    throw new Error(`Failed to refresh OAuth token: ${errMsg}`);
  }

  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token ?? refreshToken,
    expires_at: Date.now() + json.expires_in * 1000,
    token_type: json.token_type,
  };
}

function isGoogleTokenResponse(value: unknown): value is GoogleTokenResponse {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj['access_token'] === 'string' && typeof obj['expires_in'] === 'number';
}
