'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSchoolUser, replaceUserSchoolRoles } from '@/services/api/users.api';
import { listRoles as fetchAllRoles } from '@/services/api/roles.api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataTablePagination } from '@/components/common/DataTablePagination';

type RoleRow = { id: string; code: string; name: string };

export default function SchoolUserRolesPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const queryClient = useQueryClient();
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['school-users', id],
    queryFn: () => getSchoolUser(id),
    enabled: Boolean(id),
  });

  const [rolePage, setRolePage] = useState(1);
  const [roleLimit, setRoleLimit] = useState(20);

  useEffect(() => {
    setRolePage(1);
  }, [roleLimit]);

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles', 'picker', rolePage, roleLimit],
    queryFn: () => fetchAllRoles({ page: rolePage, limit: roleLimit }),
    placeholderData: (prev) => prev,
  });

  const allRoles = useMemo(() => (rolesData?.items ?? []) as RoleRow[], [rolesData]);

  useEffect(() => {
    if (!user) return;
    const memberships = user.userSchoolRoles as Array<{ role: { id: string } }> | undefined;
    const ids = memberships?.map((m) => m.role.id) ?? [];
    setSelectedRoleIds(ids);
  }, [user]);

  const mutation = useMutation({
    mutationFn: (roleIds: string[]) => replaceUserSchoolRoles(id, roleIds),
    onSuccess: () => {
      toast.success('Roles updated');
      queryClient.invalidateQueries({ queryKey: ['school-users'] });
      queryClient.invalidateQueries({ queryKey: ['school-users', id] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Could not update roles'),
  });

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) => (prev.includes(roleId) ? prev.filter((x) => x !== roleId) : [...prev, roleId]));
  };

  const sortedRoles = useMemo(() => [...allRoles].sort((a, b) => a.code.localeCompare(b.code)), [allRoles]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User roles</h1>
          <p className="text-muted-foreground">Assign one or more roles for this user in the active school.</p>
        </div>
        <Button variant="outline" type="button" onClick={() => router.push('/admin/users')}>
          Back to list
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member</CardTitle>
          <CardDescription>User id: {id || '—'}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Skeleton className="h-24 w-full" />}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          )}
          {user && (
            <p className="text-sm">
              <span className="font-medium">{String(user.email)}</span> — {String(user.firstName)}{' '}
              {String(user.lastName)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles in this school</CardTitle>
          <CardDescription>
            Maps to `PUT /users/:id/school-roles` on the API.
            {rolesData?.meta.total != null ? ` ${rolesData.meta.total} role(s) in this school.` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rolesLoading && !rolesData && <Skeleton className="h-32 w-full" />}
          {!rolesLoading && sortedRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No roles returned from the API.</p>
          ) : sortedRoles.length > 0 ? (
            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {sortedRoles.map((r) => (
                <label key={r.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-muted/50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input"
                    checked={selectedRoleIds.includes(r.id)}
                    onChange={() => toggleRole(r.id)}
                  />
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.code}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : null}
          {rolesData && rolesData.meta.total > 0 && (
            <DataTablePagination
              page={rolePage}
              totalPages={rolesData.meta.totalPages}
              total={rolesData.meta.total}
              limit={roleLimit}
              onPageChange={setRolePage}
              onLimitChange={setRoleLimit}
              disabled={rolesLoading}
            />
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              disabled={selectedRoleIds.length === 0 || mutation.isPending}
              onClick={() => mutation.mutate(selectedRoleIds)}
            >
              {mutation.isPending ? 'Saving…' : 'Save roles'}
            </Button>
            {selectedRoleIds.length === 0 && (
              <span className="text-xs text-destructive">Select at least one role.</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
