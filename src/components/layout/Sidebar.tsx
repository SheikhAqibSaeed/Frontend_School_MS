'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { RouterLink } from '@/components/common/RouterLink';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { navItemsForSession, dashboardHrefForRole } from '@/config/navigation';
import { LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Sidebar() {
  const pathname = usePathname();
  const { logout, primaryRole, authUser } = useAuth();
  const items = useMemo(
    () => navItemsForSession(primaryRole, authUser?.permissions),
    [primaryRole, authUser?.permissions],
  );
  const homeHref = useMemo(() => dashboardHrefForRole(primaryRole), [primaryRole]);

  const handleLogout = async () => {
    await logout();
    window.location.assign('/login');
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-card md:flex">
      <div className="shrink-0 p-6">
        <RouterLink
          href={dashboardHrefForRole(primaryRole)}
          className="block text-left text-xl font-bold tracking-tight text-primary hover:opacity-90"
        >
          SchoolMS
        </RouterLink>
        <p className="mt-1 text-xs text-muted-foreground capitalize">{primaryRole?.replace(/_/g, ' ') ?? 'User'}</p>
      </div>
      <Separator className="shrink-0" />
      <div className="flex min-h-0 flex-1 flex-col">
        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4" aria-label="Main navigation">
          <div className="flex flex-col gap-1">
            {items.length === 0 ? (
              <p className="px-3 text-xs text-muted-foreground">No menu items for your access.</p>
            ) : (
              items.map((item) => {
                const Icon = item.icon;
                const isOverview = item.module === 'overview';
                const isActive = isOverview
                  ? pathname === homeHref ||
                    pathname.startsWith(`${homeHref}/`) ||
                    (homeHref !== '/admin' && pathname === `/admin${homeHref}`)
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <RouterLink
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.title}
                  </RouterLink>
                );
              })
            )}
          </div>
        </nav>
        <Separator className="shrink-0" />
        <div className="shrink-0 bg-card p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
