'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  createSection,
  deleteSection,
  listClasses,
  listSections,
  updateSection,
} from '@/services/api/academics.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LabeledSelect } from '@/components/ui/labeled-select';

type Row = Record<string, unknown>;

export default function SectionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [form, setForm] = useState({
    classId: '',
    name: '',
    capacity: '',
    isActive: 'true',
  });

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['sections', page, limit],
    queryFn: () => listSections({ page, limit }),
    placeholderData: (p) => p,
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'sections-dd'],
    queryFn: () => listClasses({ limit: 100 }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const cap = form.capacity.trim() ? Number(form.capacity) : undefined;
      if (editing?.id) {
        const body: Record<string, unknown> = {
          name: form.name.trim(),
          isActive: form.isActive === 'true',
        };
        if (cap !== undefined && !Number.isNaN(cap)) body.capacity = cap;
        if (form.capacity.trim() === '') body.capacity = null;
        return updateSection(String(editing.id), body);
      }
      const body: Record<string, unknown> = {
        classId: form.classId,
        name: form.name.trim(),
        isActive: form.isActive === 'true',
      };
      if (cap !== undefined && !Number.isNaN(cap)) body.capacity = cap;
      return createSection(body);
    },
    onSuccess: () => {
      toast.success(editing ? 'Section updated' : 'Section created');
      setModalOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSection(id),
    onSuccess: () => {
      toast.success('Section deactivated');
      setPendingDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Delete failed'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ classId: '', name: '', capacity: '', isActive: 'true' });
    setModalOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    const cls = row.class as { id?: string } | undefined;
    setForm({
      classId: cls?.id ? String(cls.id) : String(row.classId ?? ''),
      name: String(row.name ?? ''),
      capacity: row.capacity != null ? String(row.capacity) : '',
      isActive: row.isActive === false ? 'false' : 'true',
    });
    setModalOpen(true);
  };

  const items = data?.items ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 0;

  const classOptions = (classesData?.items ?? []).map((c) => ({
    value: String(c.id),
    label: String(c.name ?? c.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sections</h1>
          <p className="text-muted-foreground">Sections belong to a class within the active school.</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add section
        </Button>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete?.id && deleteMutation.mutate(String(pendingDelete.id))}
        title="Deactivate section"
        message={
          pendingDelete
            ? `Deactivate section "${String(pendingDelete.name)}"? It will be hidden from new enrollments.`
            : ''
        }
        confirmText="Deactivate"
        variant="danger"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit section' : 'Add section'}
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saveMutation.isPending || !form.classId || !form.name.trim()}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <LabeledSelect
            label="Class *"
            value={form.classId}
            onChange={(e) => setForm({ ...form, classId: e.target.value })}
            options={[{ value: '', label: 'Select class' }, ...classOptions]}
            disabled={Boolean(editing)}
          />
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Capacity"
            type="number"
            min={0}
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />
          <LabeledSelect
            label="Status"
            value={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.value })}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />
        </div>
      </Modal>

      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
          <CardDescription>{data ? `${total} total` : isLoading ? 'Loading…' : 'No data yet'}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
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
          {!isLoading && !error && items.length === 0 && (
            <Alert>
              <AlertTitle>No rows</AlertTitle>
              <AlertDescription>Add a section or change page size.</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && items.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => {
                    const cls = row.class as { name?: string } | undefined;
                    return (
                      <TableRow key={String(row.id)}>
                        <TableCell>{String(row.name ?? '')}</TableCell>
                        <TableCell>{cls?.name ?? '—'}</TableCell>
                        <TableCell>{row.capacity != null ? String(row.capacity) : '—'}</TableCell>
                        <TableCell>{row.isActive === false ? 'No' : 'Yes'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => openEdit(row)}>
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setPendingDelete(row)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <DataTablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                disabled={isFetching}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
