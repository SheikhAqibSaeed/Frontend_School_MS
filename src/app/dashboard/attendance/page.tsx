'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LabeledSelect } from '@/components/ui/labeled-select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Calendar, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useApi, useMutation } from '@/hooks/useApi';
import { getAttendance, createAttendance, updateAttendance, deleteAttendance, AttendanceFilters } from '@/services/api/attendance';
import { getStudents } from '@/services/api/students';
import { getClasses } from '@/services/api/classes';
import { formatDate } from '@/utils';

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [classFilter, setClassFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    remarks: '',
  });

  // Fetch classes
  const { data: classesData } = useApi(() => getClasses(), { immediate: true });
  const classes = classesData || [];

  // Fetch students for selected class
  const { data: studentsData, execute: fetchStudents } = useApi(
    () => getStudents({ classId: classFilter }),
    { immediate: false }
  );
  
  // Fetch students when class filter changes
  useEffect(() => {
    if (classFilter) {
      fetchStudents();
    }
  }, [classFilter, fetchStudents]);
  
  const students = studentsData || [];

  // Fetch attendance records
  const { data: attendanceData, loading, execute: refetchAttendance } = useApi(() => {
    const filters: AttendanceFilters = {
      date: selectedDate,
    };
    if (classFilter) filters.classId = classFilter;
    return getAttendance(filters);
  }, { immediate: true }, [selectedDate, classFilter]);

  const { mutate: createMutate, loading: creating } = useMutation(createAttendance, {
    onSuccess: () => {
      setIsModalOpen(false);
      setFormData({
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'PRESENT',
        remarks: '',
      });
      refetchAttendance();
    },
  });

  const { mutate: updateMutate, loading: updating } = useMutation(
    (data: any) => updateAttendance(selectedAttendance?.id, data),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedAttendance(null);
        refetchAttendance();
      },
    }
  );

  const { mutate: deleteMutate } = useMutation(
    (id: string) => deleteAttendance(id),
    {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedAttendance(null);
        refetchAttendance();
      },
    }
  );

  const handleCreate = () => {
    setSelectedAttendance(null);
    setFormData({
      studentId: '',
      date: selectedDate,
      status: 'PRESENT',
      remarks: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (attendance: any) => {
    setSelectedAttendance(attendance);
    setFormData({
      studentId: attendance.studentId || '',
      date: new Date(attendance.date).toISOString().split('T')[0],
      status: attendance.status,
      remarks: attendance.remarks || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (attendance: any) => {
    setSelectedAttendance(attendance);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAttendance) {
      await updateMutate(formData);
    } else {
      await createMutate(formData);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAttendance?.id) return;
    await deleteMutate(selectedAttendance.id);
  };

  const attendances = attendanceData || [];

  // Calculate statistics
  const presentCount = attendances.filter((a: any) => a.status === 'PRESENT').length;
  const absentCount = attendances.filter((a: any) => a.status === 'ABSENT').length;
  const lateCount = attendances.filter((a: any) => a.status === 'LATE').length;
  const totalCount = attendances.length;
  const attendancePercentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <Button onClick={handleCreate}>
          <Calendar className="w-5 h-5 mr-2" />
          Mark Attendance
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Today&apos;s Attendance</p>
            <p className="text-3xl font-bold text-gray-900">{attendancePercentage}%</p>
            <p className="text-xs text-gray-500 mt-1">{presentCount} / {totalCount} students</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Present</p>
            <p className="text-3xl font-bold text-green-600">{presentCount}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Absent</p>
            <p className="text-3xl font-bold text-red-600">{absentCount}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Late</p>
            <p className="text-3xl font-bold text-yellow-600">{lateCount}</p>
          </div>
        </Card>
      </div>

      <Card title="Attendance Records">
        <div className="mb-4 flex gap-4">
          <Input
            label="Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs"
          />
          <LabeledSelect
            label="Class"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            options={[
              { value: '', label: 'All Classes' },
              ...classes.map((c: any) => ({ value: c.id, label: c.name })),
            ]}
            className="max-w-xs"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  attendances.map((attendance: any) => (
                    <tr key={attendance.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {attendance.student?.studentId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.student?.user?.firstName} {attendance.student?.user?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendance.student?.class?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            attendance.status === 'PRESENT'
                              ? 'bg-green-100 text-green-800'
                              : attendance.status === 'LATE'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {attendance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(attendance.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {attendance.remarks || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(attendance)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(attendance)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAttendance(null);
        }}
        title={selectedAttendance ? 'Edit Attendance' : 'Mark Attendance'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={creating || updating}>
              {creating || updating ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <LabeledSelect
            label="Student *"
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            options={[
              { value: '', label: 'Select Student' },
              ...students.map((s: any) => ({
                value: s.id,
                label: `${s.user?.firstName} ${s.user?.lastName} (${s.studentId})`,
              })),
            ]}
            required
            disabled={!classFilter}
          />
          <Input
            label="Date *"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <LabeledSelect
            label="Status *"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'PRESENT', label: 'Present' },
              { value: 'ABSENT', label: 'Absent' },
              { value: 'LATE', label: 'Late' },
              { value: 'LEAVE', label: 'Leave' },
            ]}
            required
          />
          <Textarea
            label="Remarks"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            rows={3}
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedAttendance(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this attendance record? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
