'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { dashboardHrefForRole } from '@/config/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminHomePage() {
  const router = useRouter();
  const { primaryRole, authUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!authUser?.isSuperAdmin) {
      router.replace(dashboardHrefForRole(primaryRole));
    }
  }, [isAuthenticated, authUser?.isSuperAdmin, primaryRole, router]);

  if (!authUser?.isSuperAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Redirecting to your dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin</h1>
        <p className="text-muted-foreground">Platform-wide visibility and school onboarding.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Schools</CardTitle>
            <CardDescription>Create and manage tenant schools.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Use the sidebar to open Schools or Settings.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Roles and permissions are managed in the Nest API.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Select a school above to send scoped API calls.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Cross-school analytics (coming soon).</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
