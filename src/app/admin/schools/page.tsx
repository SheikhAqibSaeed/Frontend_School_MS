'use client';

import { EntityListPage } from '@/components/common/EntityListPage';
import { listSchools, deleteSchool } from '@/services/api/schools.api';

export default function SchoolsPage() {
  return (
    <EntityListPage
      title="Schools"
      description="Platform tenants — super admin only."
      queryKey={['schools']}
      fetcher={listSchools}
      addHref="/admin/schools/add"
      linkColumn="name"
      rowHref={(row) => `/admin/schools/${String(row.id)}`}
      rowActions={{
        editHref: (row) => `/admin/schools/${String(row.id)}`,
        onDelete: (id) => deleteSchool(id),
        deleteTitle: 'Deactivate school',
        deleteDescription: () => 'This school will be hidden from lists (soft delete).',
      }}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'schoolCode', label: 'Code' },
        { key: 'slug', label: 'Slug' },
        { key: 'email', label: 'Email' },
        { key: 'city', label: 'City' },
        {
          key: 'isActive',
          label: 'Active',
          value: (row) => (row.isActive === false ? 'No' : 'Yes'),
        },
      ]}
    />
  );
}
