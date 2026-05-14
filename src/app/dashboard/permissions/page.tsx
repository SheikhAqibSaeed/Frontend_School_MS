'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { listPermissionsCatalog } from '@/services/api/permissions.api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { PermissionGroupsPanel } from '@/components/permissions/PermissionGroupsPanel';

export default function PermissionsCatalogPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['permissions', 'catalog', page, limit],
    queryFn: () => listPermissionsCatalog({ page, limit }),
    placeholderData: (prev) => prev,
  });

  const items = (data?.items ?? []) as Array<{
    id: string;
    code: string;
    module: string;
    description?: string | null;
  }>;
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permissions catalog</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Reference for RBAC. Each card is a module; badges are actions. Hover a badge to see the underlying
              permission code.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg">Modules on this page</CardTitle>
          <CardDescription>
            {meta != null
              ? `Showing ${items.length} of ${meta.total} permissions (page ${meta.page} of ${meta.totalPages}).`
              : isLoading
                ? 'Loading catalog…'
                : 'No metadata yet.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {isLoading && !data && (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Could not load</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && data && items.length === 0 && (
            <Alert>
              <AlertTitle>No permissions</AlertTitle>
              <AlertDescription>Try another page or page size.</AlertDescription>
            </Alert>
          )}
          {!error && items.length > 0 && (
            <>
              <PermissionGroupsPanel variant="catalog" permissions={items} />
              {meta && meta.total > 0 && (
                <DataTablePagination
                  page={page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  limit={limit}
                  onPageChange={setPage}
                  onLimitChange={setLimit}
                  pageSizeOptions={[25, 50, 100]}
                  disabled={isFetching}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
