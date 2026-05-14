'use client';

import { EntityListPage } from '@/components/common/EntityListPage';
import { deleteAnnouncement, listAnnouncements } from '@/services/api/academics.api';

export default function AnnouncementsPage() {
  return (
    <EntityListPage
      title="Announcements"
      description="School-wide notices. Removing a row deletes it from the server."
      queryKey={['announcements']}
      fetcher={listAnnouncements}
      columns={[
        { key: 'title', label: 'Title' },
        {
          key: 'publishAt',
          label: 'Publish',
          value: (row) => (row.publishAt ? String(row.publishAt).slice(0, 10) : '—'),
        },
      ]}
      rowActions={{
        onDelete: (id) => deleteAnnouncement(id),
        deleteTitle: 'Delete announcement',
        deleteDescription: (row) => `Permanently remove "${String(row.title ?? '')}"?`,
      }}
    />
  );
}
