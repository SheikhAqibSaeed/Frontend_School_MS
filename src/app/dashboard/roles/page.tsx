'use client';

import { EntityListPage } from '@/components/common/EntityListPage';
import { listRoles } from '@/services/api/roles.api';

export default function RolesPage() {
  return (
    <EntityListPage
      title="Roles"
      description="System roles and their permission bundles. Open a role to edit which permissions it grants."
      queryKey={['roles']}
      fetcher={listRoles}
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
      ]}
      linkColumn="code"
      rowHref={(row) => `/admin/roles/${String(row.id)}`}
      rowActions={{
        editHref: (row) => `/admin/roles/${String(row.id)}`,
      }}
      defaultLimit={20}
    />
  );
}
