'use client';

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { syncUiSessionCookie } from '@/lib/ui-session-cookie';
import { removeSensitiveAuthQueryParams } from '@/lib/sanitize-auth-url';
import { dashboardHrefForRole } from '@/config/navigation';

/**
 * If the user still has a persisted Nest access token but lost the HttpOnly UI cookie
 * (new tab, hard refresh), re-mint the cookie on /login or /register then continue to `from` or dashboard.
 */
function AuthPagesSessionBootstrapInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptForToken = useRef<string | null>(null);

  useEffect(() => {
    if (pathname !== '/login' && pathname !== '/register') return;
    if (typeof window === 'undefined') return;
    const u = new URL(window.location.href);
    if (removeSensitiveAuthQueryParams(u, pathname)) {
      router.replace(`${u.pathname}${u.search}`, { scroll: false });
    }
  }, [pathname, router]);

  useEffect(() => {
    if (pathname !== '/login' && pathname !== '/register') return;

    let cancelled = false;

    const run = async () => {
      await new Promise<void>((resolve) => {
        if (useAuthStore.persist.hasHydrated()) resolve();
        else useAuthStore.persist.onFinishHydration(() => resolve());
      });
      if (cancelled) return;

      const token = useAuthStore.getState().accessToken;
      if (!token) return;
      if (attemptForToken.current === token) return;
      attemptForToken.current = token;

      const ok = await syncUiSessionCookie(token);
      if (cancelled || !ok) {
        attemptForToken.current = null;
        return;
      }

      const from = searchParams.get('from');
      const role = useAuthStore.getState().primaryRole;
      const fallback = dashboardHrefForRole(role);
      const dest = from && from.startsWith('/') ? from : fallback;
      router.replace(dest);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [pathname, router, searchParams]);

  return null;
}

export function AuthPagesSessionBootstrap() {
  return (
    <Suspense fallback={null}>
      <AuthPagesSessionBootstrapInner />
    </Suspense>
  );
}
