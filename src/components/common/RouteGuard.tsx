'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import { dashboardHrefForRole } from '@/config/navigation';
import { canAccessAdminPath } from '@/lib/route-access';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { primaryRole, authUser, isAuthenticated } = useAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  const allowed = useMemo(
    () => canAccessAdminPath(pathname, primaryRole, authUser?.isSuperAdmin ?? false),
    [pathname, primaryRole, authUser?.isSuperAdmin],
  );

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowed) {
      if (primaryRole) {
        router.replace(dashboardHrefForRole(primaryRole));
        return;
      }
      router.replace('/forbidden');
    }
  }, [hydrated, isAuthenticated, allowed, pathname, router, primaryRole]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated || !allowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
