'use client';

import { EntityListPage } from '@/components/common/EntityListPage';
import { listSchoolUsers } from '@/services/api/users.api';

export default function SchoolUsersPage() {
  return (
    <EntityListPage
      title="School users"
      description="Users with access to the active school. Open a row to assign roles."
      queryKey={['school-users']}
      fetcher={listSchoolUsers}
      columns={[
        {
          key: 'id',
          label: 'Email',
          value: (row) => String(row.email ?? ''),
        },
        { key: 'firstName', label: 'First name' },
        { key: 'lastName', label: 'Last name' },
      ]}
      linkColumn="id"
      rowHref={(row) => `/admin/users/${String(row.id)}`}
      rowActions={{
        editHref: (row) => `/admin/users/${String(row.id)}`,
      }}
    />
  );
}
