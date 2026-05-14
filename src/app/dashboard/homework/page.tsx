'use client';

import { EntityListPage } from '@/components/common/EntityListPage';
import { deleteHomework, listHomework } from '@/services/api/academics.api';

export default function HomeworkPage() {
  return (
    <EntityListPage
      title="Homework"
      description="Assignments published to classes."
      queryKey={['homework']}
      fetcher={listHomework}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Title' },
        {
          key: 'dueDate',
          label: 'Due',
          value: (row) => (row.dueDate ? String(row.dueDate).slice(0, 10) : '—'),
        },
      ]}
      rowActions={{
        onDelete: (id) => deleteHomework(id),
        deleteTitle: 'Delete homework',
        deleteDescription: (row) => `Delete homework "${String(row.title ?? '')}"?`,
      }}
    />
  );
}
