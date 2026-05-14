'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { dashboardHrefForRole } from '@/config/navigation';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { primaryRole, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    router.replace(dashboardHrefForRole(primaryRole));
  }, [isAuthenticated, primaryRole, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
      Redirecting to your workspace…
    </div>
  );
}
