'use client';

import { EntityListPage } from '@/components/common/EntityListPage';
import { deletePayment, listPayments } from '@/services/api/academics.api';

export default function PaymentsPage() {
  return (
    <EntityListPage
      title="Payments"
      description="Recorded payments against invoices."
      queryKey={['payments']}
      fetcher={listPayments}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'amount', label: 'Amount' },
        { key: 'status', label: 'Status' },
      ]}
      rowActions={{
        onDelete: (id) => deletePayment(id),
        deleteTitle: 'Delete payment',
        deleteDescription: () => 'Remove this payment record permanently?',
      }}
    />
  );
}
