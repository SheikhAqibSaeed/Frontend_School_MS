'use client';

import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { listSchools } from '@/services/api/auth.api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function Header() {
  const { user, primaryRole } = useAuth();
  const schoolId = useAuthStore((s) => s.schoolId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSchoolId = useAuthStore((s) => s.setSchoolId);

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: () => listSchools({ limit: 100 }),
    enabled: primaryRole === 'SUPER_ADMIN' && Boolean(accessToken),
  });

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'Guest';
  const displayEmail = user?.email ?? '';

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search modules…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {primaryRole === 'SUPER_ADMIN' && schools?.items && (
            <div className="w-56">
              <Select
                value={schoolId ?? ''}
                onValueChange={(v) => setSchoolId(v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select school (API)" />
                </SelectTrigger>
                <SelectContent>
                  {schools.items.map((s: Record<string, unknown>) => (
                    <SelectItem key={String(s.id)} value={String(s.id)}>
                      {String(s.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {primaryRole && <Badge variant="secondary">{primaryRole.replace(/_/g, ' ')}</Badge>}
          <button
            type="button"
            className="relative rounded-md p-2 text-muted-foreground hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <p className="font-medium leading-tight">{displayName}</p>
              <p className="text-xs text-muted-foreground">{displayEmail}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
