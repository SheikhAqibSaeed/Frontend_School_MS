'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useApi, useMutation } from '@/lib/hooks/useApi';
import { getClasses, createClass, updateClass, deleteClass } from '@/lib/api/classes';

export default function ClassesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    capacity: '30',
    isActive: true,
  });

  const { data: classesData, loading, execute: refetchClasses } = useApi(() => getClasses(), { immediate: true });

  const { mutate: createMutate, loading: creating } = useMutation(createClass, {
    onSuccess: () => {
      setIsModalOpen(false);
      setSelectedClass(null);
      setFormData({ name: '', level: '', capacity: '30', isActive: true });
      refetchClasses();
    },
  });

  const { mutate: updateMutate, loading: updating } = useMutation(
    (data: any) => updateClass(selectedClass?.id, data),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedClass(null);
        refetchClasses();
      },
    }
  );

  const { mutate: deleteMutate } = useMutation(
    () => deleteClass(selectedClass?.id),
    {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedClass(null);
        refetchClasses();
      },
    }
  );

  const handleCreate = () => {
    setSelectedClass(null);
    setFormData({ name: '', level: '', capacity: '30', isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (classItem: any) => {
    setSelectedClass(classItem);
    setFormData({
      name: classItem.name,
      level: classItem.level.toString(),
      capacity: classItem.capacity.toString(),
      isActive: classItem.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (classItem: any) => {
    setSelectedClass(classItem);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClass) {
      await updateMutate(formData);
    } else {
      await createMutate(formData);
    }
  };

  const handleConfirmDelete = async () => {
    await deleteMutate();
  };

  const classes = classesData || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Classes & Sections</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-5 h-5 mr-2" />
          Add Class
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No classes found. Create your first class to get started.
            </div>
          ) : (
            classes.map((classItem: any) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{classItem.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      classItem.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {classItem.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{classItem.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sections:</span>
                    <span className="font-medium">{classItem.sections?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">{classItem._count?.students || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{classItem.capacity}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(classItem)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(classItem)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClass(null);
        }}
        title={selectedClass ? 'Edit Class' : 'Add New Class'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={creating || updating}>
              {creating || updating ? 'Saving...' : selectedClass ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Class Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Class 1, Grade 10"
            required
          />
          <Input
            label="Level *"
            type="number"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            placeholder="e.g., 1, 10"
            min="1"
            required
          />
          <Input
            label="Capacity *"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            min="1"
            required
          />
          <Select
            label="Status"
            value={formData.isActive ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedClass(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Class"
        message={`Are you sure you want to deactivate ${selectedClass?.name}? This will also deactivate all associated sections.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
