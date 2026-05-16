'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RouterLink } from '@/components/common/RouterLink';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import { dashboardHrefForRole } from '@/config/navigation';

export default function ForbiddenPage() {
  const router = useRouter();
  const { primaryRole, isAuthenticated } = useAuth();
  const home = dashboardHrefForRole(primaryRole);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">403 — Forbidden</h1>
      <p className="max-w-md text-muted-foreground">
        You do not have permission to view this page. Contact your school administrator if you believe this is
        an error.
      </p>
      <RouterLink href={home} className="text-primary underline-offset-4 hover:underline">
        Back to dashboard
      </RouterLink>
    </div>
  );
}
