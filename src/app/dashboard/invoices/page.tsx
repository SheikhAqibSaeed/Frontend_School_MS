'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, FileStack, Plus, Printer } from 'lucide-react';
import { createInvoice, deleteInvoice, listInvoices } from '@/services/api/academics.api';
import {
  downloadInvoicePdf,
  downloadInvoicesPdfBundle,
  invoiceRowToPdfData,
  printInvoice,
  printInvoicesBundle,
  type InvoicePdfData,
} from '@/lib/invoice-pdf';
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

async function fetchAllInvoices() {
  const limit = 100;
  const first = await listInvoices({ page: 1, limit });
  const all = [...first.items];
  for (let p = 2; p <= (first.meta.totalPages || 1); p++) {
    const next = await listInvoices({ page: p, limit });
    all.push(...next.items);
  }
  return all;
}

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const schoolName = 'School Management System';
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [bulkExportLoading, setBulkExportLoading] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printQueue, setPrintQueue] = useState<InvoicePdfData[] | null>(null);
  const [form, setForm] = useState({
    studentId: '',
    dueDate: '',
    lineDescription: '',
    lineAmount: '',
    status: 'DRAFT',
  });

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['invoices', page, limit],
    queryFn: () => listInvoices({ page, limit }),
    placeholderData: (p) => p,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'inv-dd'],
    queryFn: () => listStudents({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const amount = Number(form.lineAmount);
      if (Number.isNaN(amount) || amount < 0) throw new Error('Invalid amount');
      return createInvoice({
        studentId: form.studentId,
        dueDate: new Date(form.dueDate).toISOString(),
        status: form.status,
        lines: [
          {
            description: form.lineDescription.trim() || 'Fee',
            unitPrice: amount,
            quantity: 1,
          },
        ],
      });
    },
    onSuccess: () => {
      toast.success('Invoice created');
      setModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Create failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      toast.success('Invoice deactivated');
      setPendingDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Delete failed'),
  });

  const handleDownloadPdf = (row: Row) => {
    try {
      downloadInvoicePdf(invoiceRowToPdfData(row, schoolName));
      toast.success('PDF downloaded');
    } catch (e) {
      toast.error((e as Error).message ?? 'PDF failed');
    }
  };

  const handlePrint = (row: Row) => {
    try {
      printInvoice(invoiceRowToPdfData(row, schoolName));
    } catch (e) {
      toast.error((e as Error).message ?? 'Print failed');
    }
  };

  const handleConfirmBulkPrint = () => {
    if (!printQueue?.length) return;
    try {
      printInvoicesBundle(printQueue);
      setPrintModalOpen(false);
      setPrintQueue(null);
    } catch (e) {
      toast.error((e as Error).message ?? 'Print failed');
    }
  };

  const handleDownloadAllPdf = async () => {
    setBulkExportLoading(true);
    try {
      const all = await fetchAllInvoices();
      if (!all.length) {
        toast.error('No invoices to export');
        return;
      }
      const pdfRows = all.map((row) => invoiceRowToPdfData(row, schoolName));
      downloadInvoicesPdfBundle(pdfRows, `student-invoices-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success(`Downloaded ${all.length} invoice(s) in one PDF`);
    } catch (e) {
      toast.error((e as Error).message ?? 'Bulk PDF failed');
    } finally {
      setBulkExportLoading(false);
    }
  };

  const handlePrintAll = async () => {
    setBulkExportLoading(true);
    try {
      const all = await fetchAllInvoices();
      if (!all.length) {
        toast.error('No invoices to print');
        return;
      }
      const pdfRows = all.map((row) => invoiceRowToPdfData(row, schoolName));
      setPrintQueue(pdfRows);
      setPrintModalOpen(true);
    } catch (e) {
      toast.error((e as Error).message ?? 'Could not prepare invoices for print');
    } finally {
      setBulkExportLoading(false);
    }
  };

  const openCreate = () => {
    setForm({
      studentId: '',
      dueDate: new Date().toISOString().slice(0, 10),
      lineDescription: 'Tuition fee',
      lineAmount: '',
      status: 'DRAFT',
    });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Fee invoices for the active school.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={bulkExportLoading || total === 0}
            onClick={() => void handlePrintAll()}
          >
            <Printer className="mr-2 h-4 w-4" />
            {bulkExportLoading ? 'Preparing…' : 'Print all'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={bulkExportLoading || total === 0}
            onClick={() => void handleDownloadAllPdf()}
          >
            <FileStack className="mr-2 h-4 w-4" />
            {bulkExportLoading ? 'Preparing…' : 'Download all PDFs'}
          </Button>
          <Button type="button" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create invoice
          </Button>
        </div>
      </div>

      <Modal
        isOpen={printModalOpen}
        onClose={() => {
          setPrintModalOpen(false);
          setPrintQueue(null);
        }}
        title="Print all invoices"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setPrintModalOpen(false);
                setPrintQueue(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmBulkPrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print {printQueue?.length ?? 0} invoice(s)
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {printQueue?.length ?? 0} invoice(s) are ready. Click <strong>Print</strong> to open
          your browser&apos;s print dialog (one page per student).
        </p>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete?.id && deleteMutation.mutate(String(pendingDelete.id))}
        title="Deactivate invoice"
        message={`Deactivate invoice ${String(pendingDelete?.invoiceNo ?? pendingDelete?.id)}?`}
        confirmText="Deactivate"
        variant="danger"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create invoice"
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                createMutation.isPending ||
                !form.studentId ||
                !form.dueDate ||
                !form.lineAmount.trim()
              }
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <LabeledSelect
            label="Student *"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            options={[{ value: '', label: 'Select student' }, ...studentOptions]}
          />
          <Input
            label="Due date *"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <Input
            label="Line description"
            value={form.lineDescription}
            onChange={(e) => setForm({ ...form, lineDescription: e.target.value })}
          />
          <Input
            label="Amount *"
            type="number"
            min={0}
            value={form.lineAmount}
            onChange={(e) => setForm({ ...form, lineAmount: e.target.value })}
          />
          <LabeledSelect
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'ISSUED', label: 'Issued' },
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
              <AlertTitle>No invoices</AlertTitle>
              <AlertDescription>Create an invoice for a student.</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && items.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice no.</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Due</TableHead>
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
                        <TableCell>{String(row.invoiceNo ?? row.id)}</TableCell>
                        <TableCell>{name}</TableCell>
                        <TableCell>{String(row.status ?? '')}</TableCell>
                        <TableCell>{dec(row.totalAmount)}</TableCell>
                        <TableCell>
                          {row.dueDate ? String(row.dueDate).slice(0, 10) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint(row)}
                          >
                            <Printer className="mr-1 h-3.5 w-3.5" />
                            Print
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPdf(row)}
                          >
                            <Download className="mr-1 h-3.5 w-3.5" />
                            PDF
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
                          </div>
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
