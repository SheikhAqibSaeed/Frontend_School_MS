'use client';

import { EntityListPage } from '@/components/common/EntityListPage';
import { deleteInvoice, listInvoices } from '@/services/api/academics.api';

export default function InvoicesPage() {
  return (
    <EntityListPage
      title="Invoices"
      description="Fee invoices for the active school."
      queryKey={['invoices']}
      fetcher={listInvoices}
      columns={[
        { key: 'invoiceNo', label: 'Invoice no.' },
        { key: 'status', label: 'Status' },
        { key: 'totalAmount', label: 'Total' },
      ]}
      rowActions={{
        onDelete: (id) => deleteInvoice(id),
        deleteTitle: 'Delete invoice',
        deleteDescription: (row) => `Delete invoice ${String(row.invoiceNo ?? row.id)}? This cannot be undone.`,
      }}
    />
  );
}
