'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StudentForm } from '@/components/forms/StudentForm';
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { useApi, useMutation } from '@/lib/hooks/useApi';
import { getStudents, createStudent, updateStudent, deleteStudent, StudentFilters } from '@/lib/api/students';
import { getClasses } from '@/lib/api/classes';
import { getSections } from '@/lib/api/sections';

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [filters, setFilters] = useState<StudentFilters>({});

  // Fetch classes and sections
  const { data: classesData, error: classesError } = useApi(() => getClasses(), { immediate: true });
  const { data: sectionsData, error: sectionsError } = useApi(() => getSections({ classId: classFilter }), { immediate: true }, [classFilter]);

  // Fetch students with filters
  const { data: studentsData, loading, execute: refetchStudents } = useApi(() => {
    const currentFilters: StudentFilters = {};
    if (searchTerm) currentFilters.search = searchTerm;
    if (classFilter) currentFilters.classId = classFilter;
    if (sectionFilter) currentFilters.sectionId = sectionFilter;
    setFilters(currentFilters);
    return getStudents(currentFilters);
  }, { immediate: true }, [searchTerm, classFilter, sectionFilter]);

  const { mutate: createMutate, loading: creating } = useMutation(createStudent, {
    onSuccess: () => {
      setIsModalOpen(false);
      setSelectedStudent(null);
      refetchStudents();
    },
  });

  const { mutate: updateMutate, loading: updating } = useMutation(
    (data: any) => updateStudent(selectedStudent?.id, data),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
        refetchStudents();
      },
    }
  );

  const { mutate: deleteMutate, loading: deleting } = useMutation(
    () => deleteStudent(selectedStudent?.id),
    {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedStudent(null);
        refetchStudents();
      },
    }
  );

  const handleCreate = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student: any) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = (student: any) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (selectedStudent) {
      await updateMutate(data);
    } else {
      await createMutate(data);
    }
  };

  const handleConfirmDelete = async () => {
    await deleteMutate(selectedStudent?.id);
  };

  const students = studentsData || [];
  // Ensure classes is always an array
  const classes = Array.isArray(classesData) ? classesData : [];
  const sections = Array.isArray(sectionsData) ? sectionsData : [];

  // Debug: Log classes data
  useEffect(() => {
    if (classesError) {
      console.error('Error fetching classes:', classesError);
    }
    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
    }
    console.log('Classes data:', classesData);
    console.log('Classes array:', classes);
  }, [classesData, classes, classesError, sectionsError]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-5 h-5 mr-2" />
          Add Student
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setSectionFilter('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Classes</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            disabled={!classFilter}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
          >
            <option value="">All Sections</option>
            {sections.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
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
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((student: any) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.user?.firstName} {student.user?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.user?.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.class?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.section?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
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
          setSelectedStudent(null);
        }}
        title={selectedStudent ? 'Edit Student' : 'Add New Student'}
        size="lg"
      >
        <StudentForm
          initialData={selectedStudent}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedStudent(null);
          }}
          loading={creating || updating}
          classes={classes}
          sections={sections}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedStudent(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        message={`Are you sure you want to deactivate ${selectedStudent?.user?.firstName} ${selectedStudent?.user?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
