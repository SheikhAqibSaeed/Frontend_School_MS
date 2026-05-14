'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { RouterLink } from '@/components/common/RouterLink';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/Button';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type Row = Record<string, unknown>;

export type EntityColumn = {
  key: string;
  label: string;
  /** When set, cell text comes from this instead of `row[key]` (for nested or joined fields). */
  value?: (row: Row) => string;
};

export type EntityRowActions = {
  editHref?: (row: Row) => string;
  onDelete?: (id: string) => Promise<unknown>;
  deleteTitle?: string;
  deleteDescription?: (row: Row) => string;
};

type Props = {
  title: string;
  description?: string;
  queryKey: string[];
  fetcher: (params?: { page?: number; limit?: number; search?: string }) => Promise<{
    items: Row[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>;
  columns: EntityColumn[];
  addHref?: string;
  rowHref?: (row: Row) => string;
  linkColumn?: string;
  /** Per-row Edit / Delete (e.g. navigate to edit route or call API delete). */
  rowActions?: EntityRowActions;
  /** Default page size (default 20). */
  defaultLimit?: number;
  /** Page-size dropdown values (default 10, 20, 50, 100). */
  pageSizes?: number[];
};

export function EntityListPage({
  title,
  description,
  queryKey,
  fetcher,
  columns,
  addHref,
  rowHref,
  linkColumn = 'id',
  rowActions,
  defaultLimit = 20,
  pageSizes = [10, 20, 50, 100],
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  const showActions = Boolean(rowActions?.editHref || rowActions?.onDelete);

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: [...queryKey, page, limit],
    queryFn: () => fetcher({ page, limit }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!rowActions?.onDelete) return Promise.resolve();
      return rowActions.onDelete(id);
    },
    onSuccess: () => {
      setPendingDelete(null);
      void queryClient.invalidateQueries({ queryKey });
      toast.success('Record removed');
    },
    onError: (e: Error) =>
      toast.error((e as Error & { apiMessage?: string }).apiMessage ?? e.message ?? 'Delete failed'),
  });

  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const total = meta?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            Refresh
          </Button>
          {addHref && (
            <Button type="button" onClick={() => router.push(addHref)}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete?.id) deleteMutation.mutate(String(pendingDelete.id));
        }}
        title={rowActions?.deleteTitle ?? 'Delete record'}
        message={
          pendingDelete && rowActions?.deleteDescription
            ? rowActions.deleteDescription(pendingDelete)
            : 'This action cannot be undone.'
        }
        confirmText="Delete"
        variant="danger"
      />

      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
          <CardDescription>
            {data ? `${total} total` : isLoading ? 'Loading…' : 'No data yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Could not load</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && data && data.items.length === 0 && (
            <Alert>
              <AlertTitle>No rows</AlertTitle>
              <AlertDescription>Try another page, change page size, or add your first record.</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && data && data.items.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((c) => (
                      <TableHead key={c.key}>{c.label}</TableHead>
                    ))}
                    {showActions && <TableHead className="w-[120px] text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((row, idx) => (
                    <TableRow key={String(row.id ?? idx)}>
                      {columns.map((c) => {
                        const text = c.value ? c.value(row) : String(row[c.key] ?? '');
                        const cell =
                          rowHref && c.key === linkColumn ? (
                            <RouterLink
                              href={rowHref(row)}
                              className="text-left font-medium text-primary hover:underline"
                            >
                              {text}
                            </RouterLink>
                          ) : (
                            text
                          );
                        return <TableCell key={c.key}>{cell}</TableCell>;
                      })}
                      {showActions && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {rowActions?.editHref && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => router.push(rowActions.editHref!(row))}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {rowActions?.onDelete && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-destructive hover:text-destructive"
                                disabled={deleteMutation.isPending}
                                onClick={() => setPendingDelete(row)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <DataTablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                pageSizeOptions={pageSizes}
                disabled={isFetching}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
