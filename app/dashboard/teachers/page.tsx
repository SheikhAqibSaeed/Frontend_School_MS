'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TeacherForm } from '@/components/forms/TeacherForm';
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { useApi, useMutation } from '@/lib/hooks/useApi';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher, TeacherFilters } from '@/lib/api/teachers';

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  // Fetch teachers with search
  const { data: teachersData, loading, execute: refetchTeachers } = useApi(() => {
    const filters: TeacherFilters = {};
    if (searchTerm) filters.search = searchTerm;
    return getTeachers(filters);
  }, { immediate: true }, [searchTerm]);

  const { mutate: createMutate, loading: creating } = useMutation(createTeacher, {
    onSuccess: () => {
      setIsModalOpen(false);
      setSelectedTeacher(null);
      refetchTeachers();
    },
  });

  const { mutate: updateMutate, loading: updating } = useMutation(
    (data: any) => updateTeacher(selectedTeacher?.id, data),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedTeacher(null);
        refetchTeachers();
      },
    }
  );

  const { mutate: deleteMutate, loading: deleting } = useMutation(
    () => deleteTeacher(selectedTeacher?.id),
    {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedTeacher(null);
        refetchTeachers();
      },
    }
  );

  const handleCreate = () => {
    setSelectedTeacher(null);
    setIsModalOpen(true);
  };

  const handleEdit = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleDelete = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (selectedTeacher) {
      await updateMutate(data);
    } else {
      await createMutate(data);
    }
  };

  const handleConfirmDelete = async () => {
    await deleteMutate();
  };

  const teachers = teachersData || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-5 h-5 mr-2" />
          Add Teacher
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
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
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qualification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
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
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No teachers found
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher: any) => (
                    <tr key={teacher.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {teacher.employeeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {teacher.user?.firstName} {teacher.user?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.user?.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.qualification || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.experience ? `${teacher.experience} years` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            teacher.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {teacher.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher)}
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
          setSelectedTeacher(null);
        }}
        title={selectedTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        size="lg"
      >
        <TeacherForm
          initialData={selectedTeacher}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedTeacher(null);
          }}
          loading={creating || updating}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedTeacher(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Teacher"
        message={`Are you sure you want to deactivate ${selectedTeacher?.user?.firstName} ${selectedTeacher?.user?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
