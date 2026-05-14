'use client';

export async function syncUiSessionCookie(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ accessToken }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function clearUiSessionCookie(): Promise<void> {
  try {
    await fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' });
  } catch {
    /* ignore */
  }
}
