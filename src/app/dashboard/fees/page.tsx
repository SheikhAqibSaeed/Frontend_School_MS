'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  createFeeStructure,
  deleteFeeStructure,
  listClasses,
  listFees,
  updateFeeStructure,
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

export default function FeesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [form, setForm] = useState({
    name: '',
    feeType: 'MONTHLY_FEE',
    amount: '',
    frequency: 'MONTHLY',
    classId: '',
    academicYear: '',
    dueDay: '',
    lateFeeAmount: '',
    remarks: '',
    isActive: 'true',
  });

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['fees', page, limit],
    queryFn: () => listFees({ page, limit }),
    placeholderData: (p) => p,
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'fees-dd'],
    queryFn: () => listClasses({ limit: 100 }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const amt = Number(form.amount);
      if (Number.isNaN(amt) || amt < 0) throw new Error('Invalid amount');
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        feeType: form.feeType.trim() || undefined,
        amount: amt,
        frequency: form.frequency.trim() || 'MONTHLY',
        academicYear: form.academicYear.trim() || undefined,
        dueDay: form.dueDay.trim() ? Number(form.dueDay) : undefined,
        lateFeeAmount: form.lateFeeAmount.trim() ? Number(form.lateFeeAmount) : undefined,
        remarks: form.remarks.trim() || undefined,
        isActive: form.isActive === 'true',
      };
      if (form.classId) body.classId = form.classId;
      else if (editing) body.classId = null;
      if (editing?.id) return updateFeeStructure(String(editing.id), body);
      return createFeeStructure(body);
    },
    onSuccess: () => {
      toast.success(editing ? 'Fee updated' : 'Fee created');
      setModalOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ['fees'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFeeStructure(id),
    onSuccess: () => {
      toast.success('Fee structure deactivated');
      setPendingDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['fees'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Delete failed'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      feeType: 'MONTHLY_FEE',
      amount: '',
      frequency: 'MONTHLY',
      classId: '',
      academicYear: '',
      dueDay: '',
      lateFeeAmount: '',
      remarks: '',
      isActive: 'true',
    });
    setModalOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    const raw = row.amount as { toString?: () => string } | number | string | undefined;
    const amountStr =
      raw != null && typeof raw === 'object' && 'toString' in raw && typeof raw.toString === 'function'
        ? raw.toString()
        : String(raw ?? '');
    const late = row.lateFeeAmount as { toString?: () => string } | number | string | undefined;
    const lateStr =
      late != null && typeof late === 'object' && 'toString' in late && typeof late.toString === 'function'
        ? late.toString()
        : String(late ?? '');
    setForm({
      name: String(row.name ?? ''),
      feeType: String(row.feeType ?? 'MONTHLY_FEE'),
      amount: amountStr,
      frequency: String(row.frequency ?? 'MONTHLY'),
      classId: row.classId ? String(row.classId) : '',
      academicYear: row.academicYear != null ? String(row.academicYear) : '',
      dueDay: row.dueDay != null ? String(row.dueDay) : '',
      lateFeeAmount: lateStr,
      remarks: row.remarks != null ? String(row.remarks) : '',
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
          <h1 className="text-3xl font-bold tracking-tight">Fees</h1>
          <p className="text-muted-foreground">Fee structures used for invoicing.</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add fee structure
        </Button>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete?.id && deleteMutation.mutate(String(pendingDelete.id))}
        title="Deactivate fee"
        message={pendingDelete ? `Deactivate fee "${String(pendingDelete.name)}"?` : ''}
        confirmText="Deactivate"
        variant="danger"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit fee structure' : 'Add fee structure'}
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saveMutation.isPending || !form.name.trim() || !form.amount.trim()}
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
            label="Fee type"
            value={form.feeType}
            onChange={(e) => setForm({ ...form, feeType: e.target.value })}
            options={[
              { value: 'ADMISSION_FEE', label: 'Admission fee' },
              { value: 'MONTHLY_FEE', label: 'Monthly fee' },
              { value: 'EXAM_FEE', label: 'Exam fee' },
              { value: 'TRANSPORT_FEE', label: 'Transport fee' },
              { value: 'LIBRARY_FEE', label: 'Library fee' },
              { value: 'FINE', label: 'Fine' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />
          <Input
            label="Amount *"
            type="number"
            min={0}
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <LabeledSelect
            label="Frequency *"
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            options={[
              { value: 'ONE_TIME', label: 'One time' },
              { value: 'MONTHLY', label: 'Monthly' },
              { value: 'QUARTERLY', label: 'Quarterly' },
              { value: 'YEARLY', label: 'Yearly' },
            ]}
          />
          <LabeledSelect
            label="Class (optional)"
            value={form.classId}
            onChange={(e) => setForm({ ...form, classId: e.target.value })}
            options={[{ value: '', label: 'All classes' }, ...classOptions]}
          />
          <Input
            label="Academic year"
            value={form.academicYear}
            onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
          />
          <Input
            label="Due day (1–31)"
            type="number"
            min={1}
            max={31}
            value={form.dueDay}
            onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
          />
          <Input
            label="Late fee"
            type="number"
            min={0}
            step="0.01"
            value={form.lateFeeAmount}
            onChange={(e) => setForm({ ...form, lateFeeAmount: e.target.value })}
          />
          <Input
            label="Remarks"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
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
              <AlertDescription>Add a fee structure or change page size.</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && items.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => {
                    const raw = row.amount as { toString?: () => string } | number | string | undefined;
                    const amt =
                      raw != null && typeof raw === 'object' && 'toString' in raw
                        ? String(raw.toString?.())
                        : String(raw ?? '');
                    return (
                      <TableRow key={String(row.id)}>
                        <TableCell>{String(row.name ?? '')}</TableCell>
                        <TableCell>{String(row.feeType ?? '—')}</TableCell>
                        <TableCell>{amt}</TableCell>
                        <TableCell>{String(row.frequency ?? '')}</TableCell>
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
