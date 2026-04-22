// ============================================================================
// URL Guard — Allowlist enforcement and header sanitization
// ============================================================================

/**
 * Checks whether the given URL is permitted by the allowlist.
 * Deny by default: if the allowlist is undefined or empty, all URLs are blocked.
 *
 * Supported patterns:
 *   - Exact hostname:           "api.example.com"
 *   - Wildcard subdomain:       "*.example.com"  (matches sub.example.com and example.com)
 *   - Full URL prefix:          "https://api.example.com/v1"
 */
export function isUrlAllowed(url: string, allowlist: readonly string[] | undefined): boolean {
  if (!allowlist || allowlist.length === 0) return false; // deny by default
  try {
    const parsed = new URL(url);
    return allowlist.some((pattern) => {
      // Support exact host match or wildcard prefix *.example.com
      if (pattern.startsWith('*.')) {
        const domain = pattern.slice(2);
        return parsed.hostname === domain || parsed.hostname.endsWith('.' + domain);
      }
      // Support full URL prefix match (https://api.example.com/v1)
      return url.startsWith(pattern) || parsed.hostname === pattern;
    });
  } catch {
    return false;
  }
}

/**
 * Strips sensitive/auth-related headers from a user-supplied headers object.
 * Prevents agents from inadvertently (or deliberately) leaking credentials.
 */
export function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const blocked = ['authorization', 'cookie', 'set-cookie', 'x-api-key'];
  return Object.fromEntries(
    Object.entries(headers).filter(([k]) => !blocked.includes(k.toLowerCase()))
  );
}
