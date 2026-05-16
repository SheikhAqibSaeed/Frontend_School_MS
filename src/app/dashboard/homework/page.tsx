'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  createHomework,
  deleteHomework,
  listClasses,
  listHomework,
  listSections,
  listSubjects,
  updateHomework,
} from '@/services/api/academics.api';
import { listTeachers } from '@/services/api/teachers.api';
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
import { Textarea } from '@/components/ui/Textarea';

type Row = Record<string, unknown>;

function dateInput(v: unknown): string {
  if (v == null) return '';
  const s = typeof v === 'string' ? v : new Date(v as string).toISOString();
  return s.slice(0, 10);
}

export default function HomeworkPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [form, setForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    teacherId: '',
    title: '',
    description: '',
    dueDate: '',
    status: 'PUBLISHED',
  });

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['homework', page, limit],
    queryFn: () => listHomework({ page, limit }),
    placeholderData: (p) => p,
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'hw-dd'],
    queryFn: () => listClasses({ limit: 100 }),
  });
  const { data: sectionsData } = useQuery({
    queryKey: ['sections', 'hw-dd', form.classId],
    queryFn: () => listSections({ limit: 100 }),
    enabled: Boolean(form.classId),
  });
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'hw-dd'],
    queryFn: () => listSubjects({ limit: 100 }),
  });
  const { data: teachersData } = useQuery({
    queryKey: ['teachers', 'hw-dd'],
    queryFn: () => listTeachers({ limit: 100 }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        classId: form.classId,
        teacherId: form.teacherId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        dueDate: new Date(form.dueDate).toISOString(),
        status: form.status,
      };
      if (form.sectionId) body.sectionId = form.sectionId;
      else if (editing) body.sectionId = null;
      if (form.subjectId) body.subjectId = form.subjectId;
      else if (editing) body.subjectId = null;
      if (editing?.id) return updateHomework(String(editing.id), body);
      return createHomework(body);
    },
    onSuccess: () => {
      toast.success(editing ? 'Homework updated' : 'Homework published');
      setModalOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ['homework'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHomework(id),
    onSuccess: () => {
      toast.success('Homework removed');
      setPendingDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['homework'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Delete failed'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      classId: '',
      sectionId: '',
      subjectId: '',
      teacherId: '',
      title: '',
      description: '',
      dueDate: new Date().toISOString().slice(0, 10),
      status: 'PUBLISHED',
    });
    setModalOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    setForm({
      classId: String(row.classId ?? ''),
      sectionId: row.sectionId ? String(row.sectionId) : '',
      subjectId: row.subjectId ? String(row.subjectId) : '',
      teacherId: String(row.teacherId ?? ''),
      title: String(row.title ?? ''),
      description: row.description != null ? String(row.description) : '',
      dueDate: dateInput(row.dueDate),
      status: String(row.status ?? 'PUBLISHED'),
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
  const sectionOptions = (sectionsData?.items ?? [])
    .filter((s) => !form.classId || String(s.classId) === form.classId)
    .map((s) => ({ value: String(s.id), label: String(s.name ?? s.id) }));
  const subjectOptions = (subjectsData?.items ?? []).map((s) => ({
    value: String(s.id),
    label: String(s.name ?? s.code ?? s.id),
  }));
  const teacherOptions = (teachersData?.items ?? []).map((t) => {
    const u = t.user as { firstName?: string; lastName?: string } | undefined;
    const name = u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '';
    return { value: String(t.id), label: name || String(t.employeeId ?? t.id) };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homework</h1>
          <p className="text-muted-foreground">Assignments published to classes.</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add homework
        </Button>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete?.id && deleteMutation.mutate(String(pendingDelete.id))}
        title="Delete homework"
        message={pendingDelete ? `Delete "${String(pendingDelete.title)}"?` : ''}
        confirmText="Delete"
        variant="danger"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit homework' : 'Add homework'}
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                saveMutation.isPending ||
                !form.title.trim() ||
                !form.classId ||
                !form.teacherId ||
                !form.dueDate
              }
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Publish'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <LabeledSelect
            label="Class *"
            value={form.classId}
            onChange={(e) => setForm({ ...form, classId: e.target.value, sectionId: '' })}
            options={[{ value: '', label: 'Select class' }, ...classOptions]}
          />
          <LabeledSelect
            label="Section (optional)"
            value={form.sectionId}
            onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
            options={[{ value: '', label: 'All sections' }, ...sectionOptions]}
          />
          <LabeledSelect
            label="Subject (optional)"
            value={form.subjectId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            options={[{ value: '', label: 'Not linked' }, ...subjectOptions]}
          />
          <LabeledSelect
            label="Teacher *"
            value={form.teacherId}
            onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
            options={[{ value: '', label: 'Select teacher' }, ...teacherOptions]}
          />
          <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <Input
            label="Due date *"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <LabeledSelect
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: 'PUBLISHED', label: 'Published' },
              { value: 'DRAFT', label: 'Draft' },
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
              <AlertTitle>No homework</AlertTitle>
              <AlertDescription>Publish homework for a class to get started.</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && items.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => {
                    const cls = row.class as { name?: string } | undefined;
                    return (
                      <TableRow key={String(row.id)}>
                        <TableCell>{String(row.title ?? '')}</TableCell>
                        <TableCell>{String(cls?.name ?? '—')}</TableCell>
                        <TableCell>{dateInput(row.dueDate)}</TableCell>
                        <TableCell>{String(row.status ?? '')}</TableCell>
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
