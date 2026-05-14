'use client';

import { EntityListPage } from '@/components/common/EntityListPage';
import { deleteMark, listMarks } from '@/services/api/academics.api';

export default function MarksPage() {
  return (
    <EntityListPage
      title="Marks entry"
      description="Exam results (marks) per subject."
      queryKey={['marks']}
      fetcher={listMarks}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'marksObtained', label: 'Marks' },
        { key: 'maxMarks', label: 'Max' },
        { key: 'grade', label: 'Grade' },
      ]}
      rowActions={{
        onDelete: (id) => deleteMark(id),
        deleteTitle: 'Delete mark record',
        deleteDescription: () => 'Remove this exam result row permanently?',
      }}
    />
  );
}
