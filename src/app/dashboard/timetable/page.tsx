'use client';

import { EntityListPage } from '@/components/common/EntityListPage';
import { deleteTimetableSlot, listTimetable } from '@/services/api/academics.api';

export default function TimetablePage() {
  return (
    <EntityListPage
      title="Timetable"
      description="Scheduled periods for classes."
      queryKey={['timetable']}
      fetcher={listTimetable}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'weekday', label: 'Weekday' },
        { key: 'startTime', label: 'Start' },
        { key: 'endTime', label: 'End' },
      ]}
      rowActions={{
        onDelete: (id) => deleteTimetableSlot(id),
        deleteTitle: 'Delete slot',
        deleteDescription: () => 'Remove this timetable slot permanently?',
      }}
    />
  );
}
