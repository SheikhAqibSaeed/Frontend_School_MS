'use client';

import { EntityListPage } from '@/components/common/EntityListPage';
import { deleteTeacher, listTeachers } from '@/services/api/teachers.api';

type Row = Record<string, unknown>;

function teacherName(row: Row) {
  const u = row.user as { firstName?: string; lastName?: string } | undefined;
  const parts = [u?.firstName, u?.lastName].filter(Boolean);
  return parts.length ? parts.join(' ') : '—';
}

function teacherEmail(row: Row) {
  const u = row.user as { email?: string } | undefined;
  return u?.email ?? '—';
}

export default function TeachersPage() {
  return (
    <EntityListPage
      title="Teachers"
      description="Teaching staff for the active school."
      queryKey={['teachers']}
      fetcher={listTeachers}
      columns={[
        { key: 'employeeNo', label: 'Employee no.' },
        { key: 'name', label: 'Name', value: teacherName },
        { key: 'email', label: 'Email', value: teacherEmail },
      ]}
      addHref="/admin/teachers/add"
      linkColumn="employeeNo"
      rowHref={(row) => `/admin/teachers/${String(row.id)}`}
      rowActions={{
        editHref: (row) => `/admin/teachers/${String(row.id)}`,
        onDelete: (id) => deleteTeacher(id),
        deleteTitle: 'Deactivate teacher',
        deleteDescription: (row) =>
          `Deactivate teacher ${String(row.employeeNo ?? row.id)}? You can reactivate them from the profile page.`,
      }}
    />
  );
}
