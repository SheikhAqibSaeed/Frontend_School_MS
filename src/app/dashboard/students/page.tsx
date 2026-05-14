'use client';

import { EntityListPage } from '@/components/common/EntityListPage';
import { listStudents, deleteStudent } from '@/services/api/students.api';

type Row = Record<string, unknown>;

function classLabel(row: Row) {
  const c = row.class as { name?: string } | undefined;
  return c?.name ?? '—';
}

function sectionLabel(row: Row) {
  const s = row.section as { name?: string } | undefined;
  return s?.name ?? '—';
}

export default function StudentsPage() {
  return (
    <EntityListPage
      title="Students"
      description="Students enrolled in the active school. Open a row to view the profile."
      queryKey={['students']}
      fetcher={listStudents}
      columns={[
        { key: 'admissionNo', label: 'Admission no.' },
        { key: 'firstName', label: 'First name' },
        { key: 'lastName', label: 'Last name' },
        { key: 'className', label: 'Class', value: classLabel },
        { key: 'sectionName', label: 'Section', value: sectionLabel },
      ]}
      addHref="/admin/students/add"
      linkColumn="admissionNo"
      rowHref={(row) => `/admin/students/${String(row.id)}`}
      rowActions={{
        editHref: (row) => `/admin/students/${String(row.id)}`,
        onDelete: (id) => deleteStudent(id),
        deleteTitle: 'Deactivate student',
        deleteDescription: (row) =>
          `Deactivate student ${String(row.admissionNo ?? row.id)}? You can reactivate them from the profile page.`,
      }}
    />
  );
}
