'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  createMark,
  deleteMark,
  listExams,
  listMarks,
  listSubjects,
  updateMark,
} from '@/services/api/academics.api';
import { listStudents } from '@/services/api/students.api';
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

function dec(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'object' && v !== null && 'toString' in v) return (v as { toString: () => string }).toString();
  return String(v);
}

function studentLabel(row: Row): string {
  const s = row.student as { firstName?: string; lastName?: string; admissionNo?: string } | undefined;
  if (!s) return '—';
  const name = [s.firstName, s.lastName].filter(Boolean).join(' ');
  return s.admissionNo ? `${name} (${s.admissionNo})` : name || '—';
}

export default function MarksPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [form, setForm] = useState({
    examId: '',
    studentId: '',
    subjectId: '',
    marksObtained: '',
    maxMarks: '100',
    remarks: '',
  });

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['marks', page, limit],
    queryFn: () => listMarks({ page, limit }),
    placeholderData: (p) => p,
  });

  const { data: examsData } = useQuery({
    queryKey: ['exams', 'marks-dd'],
    queryFn: () => listExams({ limit: 100 }),
  });
  const { data: studentsData } = useQuery({
    queryKey: ['students', 'marks-dd'],
    queryFn: () => listStudents({ limit: 100 }),
  });
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'marks-dd'],
    queryFn: () => listSubjects({ limit: 100 }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const obtained = Number(form.marksObtained);
      const max = Number(form.maxMarks);
      if (Number.isNaN(obtained) || Number.isNaN(max) || max <= 0) throw new Error('Invalid marks');
      if (editing?.id) {
        return updateMark(String(editing.id), {
          marksObtained: obtained,
          maxMarks: max,
          remarks: form.remarks.trim() || undefined,
        });
      }
      return createMark({
        examId: form.examId,
        studentId: form.studentId,
        subjectId: form.subjectId,
        marksObtained: obtained,
        maxMarks: max,
        remarks: form.remarks.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success(editing ? 'Mark updated' : 'Mark recorded');
      setModalOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ['marks'] });
      void queryClient.invalidateQueries({ queryKey: ['results'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMark(id),
    onSuccess: () => {
      toast.success('Mark removed');
      setPendingDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['marks'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Delete failed'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      examId: '',
      studentId: '',
      subjectId: '',
      marksObtained: '',
      maxMarks: '100',
      remarks: '',
    });
    setModalOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    setForm({
      examId: String(row.examId ?? ''),
      studentId: String(row.studentId ?? ''),
      subjectId: String(row.subjectId ?? ''),
      marksObtained: dec(row.marksObtained),
      maxMarks: dec(row.maxMarks),
      remarks: row.remarks != null ? String(row.remarks) : '',
    });
    setModalOpen(true);
  };

  const items = data?.items ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 0;

  const examOptions = (examsData?.items ?? []).map((e) => ({
    value: String(e.id),
    label: String(e.name ?? e.id),
  }));
  const studentOptions = (studentsData?.items ?? []).map((s) => ({
    value: String(s.id),
    label: `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || String(s.admissionNo ?? s.id),
  }));
  const subjectOptions = (subjectsData?.items ?? []).map((s) => ({
    value: String(s.id),
    label: String(s.name ?? s.code ?? s.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marks entry</h1>
          <p className="text-muted-foreground">Record exam results per student and subject.</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add marks
        </Button>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete?.id && deleteMutation.mutate(String(pendingDelete.id))}
        title="Remove mark"
        message="Remove this exam result record?"
        confirmText="Remove"
        variant="danger"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit marks' : 'Add marks'}
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
                !form.marksObtained.trim() ||
                !form.maxMarks.trim() ||
                (!editing && (!form.examId || !form.studentId || !form.subjectId))
              }
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {!editing && (
            <>
              <LabeledSelect
                label="Exam *"
                value={form.examId}
                onChange={(e) => setForm({ ...form, examId: e.target.value })}
                options={[{ value: '', label: 'Select exam' }, ...examOptions]}
              />
              <LabeledSelect
                label="Student *"
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                options={[{ value: '', label: 'Select student' }, ...studentOptions]}
              />
              <LabeledSelect
                label="Subject *"
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                options={[{ value: '', label: 'Select subject' }, ...subjectOptions]}
              />
            </>
          )}
          <Input
            label="Marks obtained *"
            type="number"
            min={0}
            value={form.marksObtained}
            onChange={(e) => setForm({ ...form, marksObtained: e.target.value })}
          />
          <Input
            label="Max marks *"
            type="number"
            min={1}
            value={form.maxMarks}
            onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
          />
          <Input
            label="Remarks"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
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
              <AlertDescription>Add marks after scheduling exams.</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && items.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => {
                    const exam = row.exam as { name?: string } | undefined;
                    const subject = row.subject as { name?: string } | undefined;
                    return (
                      <TableRow key={String(row.id)}>
                        <TableCell>{studentLabel(row)}</TableCell>
                        <TableCell>{String(exam?.name ?? '—')}</TableCell>
                        <TableCell>{String(subject?.name ?? '—')}</TableCell>
                        <TableCell>
                          {dec(row.marksObtained)} / {dec(row.maxMarks)}
                        </TableCell>
                        <TableCell>{String(row.grade ?? '—')}</TableCell>
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