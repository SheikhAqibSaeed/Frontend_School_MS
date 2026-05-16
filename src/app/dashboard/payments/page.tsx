'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { createPayment, deletePayment, listInvoices, listPayments } from '@/services/api/academics.api';
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

const METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'CHEQUE', label: 'Cheque' },
];

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [form, setForm] = useState({
    studentId: '',
    invoiceId: '',
    amount: '',
    method: 'CASH',
    remarks: '',
  });

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['payments', page, limit],
    queryFn: () => listPayments({ page, limit }),
    placeholderData: (p) => p,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'pay-dd'],
    queryFn: () => listStudents({ limit: 200 }),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['invoices', 'pay-dd'],
    queryFn: () => listInvoices({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const amount = Number(form.amount);
      if (Number.isNaN(amount) || amount <= 0) throw new Error('Invalid amount');
      const body: Record<string, unknown> = {
        amount,
        method: form.method,
        remarks: form.remarks.trim() || undefined,
        status: 'COMPLETED',
      };
      if (form.studentId) body.studentId = form.studentId;
      if (form.invoiceId) body.invoiceId = form.invoiceId;
      return createPayment(body);
    },
    onSuccess: () => {
      toast.success('Payment recorded');
      setModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['payments'] });
      void queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Create failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => {
      toast.success('Payment removed');
      setPendingDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Delete failed'),
  });

  const openCreate = () => {
    setForm({ studentId: '', invoiceId: '', amount: '', method: 'CASH', remarks: '' });
    setModalOpen(true);
  };

  const items = data?.items ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 0;

  const studentOptions = (studentsData?.items ?? []).map((s) => ({
    value: String(s.id),
    label: `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || String(s.admissionNo ?? s.id),
  }));

  const invoiceOptions = (invoicesData?.items ?? []).map((inv) => ({
    value: String(inv.id),
    label: `${inv.invoiceNo ?? inv.id} — ${dec(inv.totalAmount)}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Recorded payments against invoices.</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Record payment
        </Button>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete?.id && deleteMutation.mutate(String(pendingDelete.id))}
        title="Remove payment"
        message="Remove this payment record?"
        confirmText="Remove"
        variant="danger"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record payment"
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={createMutation.isPending || !form.amount.trim()}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <LabeledSelect
            label="Student (optional)"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            options={[{ value: '', label: 'Not linked' }, ...studentOptions]}
          />
          <LabeledSelect
            label="Invoice (optional)"
            value={form.invoiceId}
            onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}
            options={[{ value: '', label: 'No invoice' }, ...invoiceOptions]}
          />
          <Input
            label="Amount *"
            type="number"
            min={0.01}
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <LabeledSelect
            label="Method *"
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            options={METHODS}
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
              <AlertTitle>No payments</AlertTitle>
              <AlertDescription>Record a payment when fees are collected.</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && items.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => {
                    const student = row.student as { firstName?: string; lastName?: string } | undefined;
                    const name = student
                      ? `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim()
                      : '—';
                    return (
                      <TableRow key={String(row.id)}>
                        <TableCell>{String(row.receiptNumber ?? row.id)}</TableCell>
                        <TableCell>{name}</TableCell>
                        <TableCell>{dec(row.amount)}</TableCell>
                        <TableCell>{String(row.method ?? '')}</TableCell>
                        <TableCell>{String(row.status ?? '')}</TableCell>
                        <TableCell className="text-right">
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
