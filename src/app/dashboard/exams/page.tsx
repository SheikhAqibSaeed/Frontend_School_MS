'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { createExam, deleteExam, listClasses, listExams, updateExam } from '@/services/api/academics.api';
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

const EXAM_TYPES = [
  { value: 'MID_TERM', label: 'Mid-term' },
  { value: 'FINAL', label: 'Final' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'PRACTICAL', label: 'Practical' },
];

function dateInput(v: unknown): string {
  if (v == null) return '';
  const s = typeof v === 'string' ? v : new Date(v as string).toISOString();
  return s.slice(0, 10);
}

export default function ExamsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [form, setForm] = useState({
    name: '',
    examType: 'MID_TERM',
    classId: '',
    startDate: '',
    endDate: '',
    description: '',
    isActive: 'true',
  });

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['exams', page, limit],
    queryFn: () => listExams({ page, limit }),
    placeholderData: (p) => p,
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'exams-dd'],
    queryFn: () => listClasses({ limit: 100 }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        examType: form.examType,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        description: form.description.trim() || undefined,
        isActive: form.isActive === 'true',
      };
      if (form.classId) body.classId = form.classId;
      else if (editing) body.classId = null;
      if (editing?.id) return updateExam(String(editing.id), body);
      return createExam(body);
    },
    onSuccess: () => {
      toast.success(editing ? 'Exam updated' : 'Exam created');
      setModalOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExam(id),
    onSuccess: () => {
      toast.success('Exam deactivated');
      setPendingDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Delete failed'),
  });

  const openCreate = () => {
    setEditing(null);
    const today = new Date().toISOString().slice(0, 10);
    setForm({
      name: '',
      examType: 'MID_TERM',
      classId: '',
      startDate: today,
      endDate: today,
      description: '',
      isActive: 'true',
    });
    setModalOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    setForm({
      name: String(row.name ?? ''),
      examType: String(row.examType ?? 'MID_TERM'),
      classId: row.classId ? String(row.classId) : '',
      startDate: dateInput(row.startDate),
      endDate: dateInput(row.endDate),
      description: row.description != null ? String(row.description) : '',
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
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground">Schedule and manage exams for the active school.</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add exam
        </Button>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete?.id && deleteMutation.mutate(String(pendingDelete.id))}
        title="Deactivate exam"
        message={pendingDelete ? `Deactivate "${String(pendingDelete.name)}"?` : ''}
        confirmText="Deactivate"
        variant="danger"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit exam' : 'Add exam'}
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
                !form.name.trim() ||
                !form.startDate ||
                !form.endDate ||
                new Date(form.endDate) < new Date(form.startDate)
              }
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <LabeledSelect
            label="Exam type *"
            value={form.examType}
            onChange={(e) => setForm({ ...form, examType: e.target.value })}
            options={EXAM_TYPES}
          />
          <LabeledSelect
            label="Class (optional)"
            value={form.classId}
            onChange={(e) => setForm({ ...form, classId: e.target.value })}
            options={[{ value: '', label: 'All / not linked' }, ...classOptions]}
          />
          <Input
            label="Start date *"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <Input
            label="End date *"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
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
              <AlertDescription>Add an exam or change page size.</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && items.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={String(row.id)}>
                      <TableCell>{String(row.name ?? '')}</TableCell>
                      <TableCell>{String(row.examType ?? '')}</TableCell>
                      <TableCell>{dateInput(row.startDate)}</TableCell>
                      <TableCell>{dateInput(row.endDate)}</TableCell>
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
                disabled={isFetching}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
