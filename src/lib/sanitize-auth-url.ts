/**
 * Query keys that must never appear on /login or /register (history, logs, Referer leaks).
 * Only POST bodies or trusted server flows should carry credentials.
 */
const SENSITIVE_AUTH_QUERY_KEYS = new Set([
  'email',
  'e-mail',
  'mail',
  'password',
  'passwd',
  'pwd',
  'pass',
  'passphrase',
  'secret',
  'client_secret',
  'token',
  'access_token',
  'refresh_token',
  'accesstoken',
  'refreshtoken',
  'id_token',
  'authorization',
  'apikey',
  'api_key',
  'bearer',
  'credential',
  'credentials',
]);

/**
 * Removes sensitive search params from `url` (mutates). Returns whether anything was removed.
 * `schoolId` on `/login` only is stripped (never use GET for tenant hints with credentials).
 */
export function removeSensitiveAuthQueryParams(url: URL, pathname?: string): boolean {
  let changed = false;
  for (const key of [...url.searchParams.keys()]) {
    const k = key.toLowerCase();
    if (SENSITIVE_AUTH_QUERY_KEYS.has(k)) {
      url.searchParams.delete(key);
      changed = true;
    } else if (pathname === '/login' && k === 'schoolid') {
      url.searchParams.delete(key);
      changed = true;
    }
  }
  return changed;
}
