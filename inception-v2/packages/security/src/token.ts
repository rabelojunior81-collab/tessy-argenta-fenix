import { randomBytes, createHmac } from 'node:crypto';

// Unambiguous character set (no 0/O, 1/I/l)
const PAIRING_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generates a 6-character alphanumeric pairing code.
 */
export function generatePairingCode(): string {
  const bytes = randomBytes(6);
  return Array.from(bytes)
    .map((b) => PAIRING_CHARS[b % PAIRING_CHARS.length])
    .join('');
}

/**
 * Generates a 64-character hex bearer token.
 */
export function generateBearerToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * HMAC-SHA256 of a token with a given secret.
 */
export function hashToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex');
}
