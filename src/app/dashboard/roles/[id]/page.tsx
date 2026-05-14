'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';
import { getRole, syncRolePermissions } from '@/services/api/roles.api';
import { listPermissionsCatalog } from '@/services/api/permissions.api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PermissionActionMatrix } from '@/components/permissions/PermissionActionMatrix';

type PermissionRow = { id: string; code: string; module: string; description?: string | null };

const CATALOG_PAGE_SIZE = 500;

export default function RolePermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = typeof params.id === 'string' ? params.id : '';
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: role, isLoading: roleLoading, error: roleError } = useQuery({
    queryKey: ['roles', roleId],
    queryFn: () => getRole(roleId),
    enabled: Boolean(roleId),
  });

  const { data: permData, isLoading: permLoading } = useQuery({
    queryKey: ['permissions', 'catalog', 'full', CATALOG_PAGE_SIZE],
    queryFn: () => listPermissionsCatalog({ page: 1, limit: CATALOG_PAGE_SIZE }),
  });

  const permissions = useMemo(
    () => (permData?.items ?? []) as PermissionRow[],
    [permData],
  );

  const totalCatalog = permData?.meta.total ?? 0;
  const loadedAll = totalCatalog > 0 && permissions.length >= totalCatalog;

  useEffect(() => {
    if (!role) return;
    const rps = role.rolePermissions as Array<{ permissionId: string }> | undefined;
    const ids = new Set(rps?.map((x) => x.permissionId) ?? []);
    setSelected(ids);
  }, [role]);

  const mutation = useMutation({
    mutationFn: (ids: string[]) => syncRolePermissions(roleId, ids),
    onSuccess: () => {
      toast.success('Permissions saved');
      queryClient.invalidateQueries({ queryKey: ['roles', roleId] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Save failed'),
  });

  const toggle = (pid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  };

  const setMany = useCallback((ids: string[], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  const loading = roleLoading || permLoading;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
      <Card className="overflow-hidden border border-border/80 bg-card shadow-sm">
        <CardContent className="px-6 py-4">
          {roleLoading && (
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                <Skeleton className="h-7 max-w-md flex-1 rounded-md" />
              </div>
              <Skeleton className="h-9 w-28 shrink-0 rounded-md" />
            </div>
          )}
          {roleError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{(roleError as Error).message}</AlertDescription>
            </Alert>
          )}
          {role && !roleLoading && (
            <div className="flex w-full flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <KeyRound className="h-5 w-5" aria-hidden />
                </div>
                <p className="min-w-0 text-base leading-relaxed text-foreground">
                  <span className="font-semibold">Role:</span>{' '}
                  <span className="font-normal uppercase tracking-wide">
                    {String(role.code ?? role.name)
                      .replace(/_/g, ' ')
                      .toUpperCase()}
                  </span>
                </p>
              </div>
              <Button
                variant="outline"
                type="button"
                className="shrink-0 sm:ml-2"
                onClick={() => router.push('/admin/roles')}
              >
                Back to roles
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg">Permissions</CardTitle>
          <CardDescription>
            {totalCatalog > 0
              ? `${permissions.length} of ${totalCatalog} permissions loaded in one view.${loadedAll ? '' : ' Increase API limit or add paging if your catalog grows beyond 500.'}`
              : 'Loading catalog…'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {loading && <Skeleton className="min-h-[24rem] w-full rounded-xl" />}
          {!loading && permissions.length > 0 && (
            <PermissionActionMatrix
              permissions={permissions}
              selected={selected}
              onToggle={toggle}
              onSetMany={setMany}
            />
          )}
          {!loading && permissions.length === 0 && (
            <p className="text-sm text-muted-foreground">No permissions returned from the API.</p>
          )}
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {selected.size} permission{selected.size === 1 ? '' : 's'} selected for this role.
            </p>
            <Button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate([...selected])}>
              {mutation.isPending ? 'Saving…' : 'Save permissions'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
