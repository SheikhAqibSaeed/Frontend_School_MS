/** Reads tokens from the same Zustand persist bucket as `useAuthStore` (`sms-auth`). */
const STORAGE_KEY = 'sms-auth';

export function readPersistedAuth(): {
  accessToken: string | null;
  schoolId: string | null;
} {
  if (typeof window === 'undefined') return { accessToken: null, schoolId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: null, schoolId: null };
    const parsed = JSON.parse(raw) as {
      state?: { accessToken?: string | null; schoolId?: string | null };
    };
    const state = parsed.state;
    return {
      accessToken: state?.accessToken ?? null,
      schoolId: state?.schoolId ?? null,
    };
  } catch {
    return { accessToken: null, schoolId: null };
  }
}

/** Headers for legacy `fetch()` API helpers so they match `apiClient` (Bearer + tenant). */
export function legacyAuthHeaders(jsonBody = false): Record<string, string> {
  const { accessToken, schoolId } = readPersistedAuth();
  const h: Record<string, string> = {};
  if (jsonBody) h['Content-Type'] = 'application/json';
  if (accessToken) h.Authorization = `Bearer ${accessToken}`;
  if (schoolId) h['X-School-Id'] = schoolId;
  return h;
}
