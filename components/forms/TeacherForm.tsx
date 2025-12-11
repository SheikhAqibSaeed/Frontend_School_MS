'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface TeacherFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  joiningDate: string;
  qualification: string;
  experience: string;
  salary: string;
}

interface TeacherFormProps {
  initialData?: any;
  onSubmit: (data: TeacherFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function TeacherForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: TeacherFormProps) {
  const [formData, setFormData] = useState<TeacherFormData>({
    email: initialData?.user?.email || '',
    password: '',
    firstName: initialData?.user?.firstName || '',
    lastName: initialData?.user?.lastName || '',
    phone: initialData?.user?.phone || '',
    address: initialData?.user?.address || '',
    joiningDate: initialData?.joiningDate
      ? new Date(initialData.joiningDate).toISOString().split('T')[0]
      : '',
    qualification: initialData?.qualification || '',
    experience: initialData?.experience?.toString() || '',
    salary: initialData?.salary?.toString() || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name *"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
        />
        <Input
          label="Last Name *"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
        />
        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        {!initialData && (
          <Input
            label="Password *"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!initialData}
          />
        )}
        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          label="Joining Date *"
          type="date"
          value={formData.joiningDate}
          onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
          required
        />
        <Input
          label="Qualification"
          value={formData.qualification}
          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
          placeholder="e.g., M.Sc Mathematics"
        />
        <Input
          label="Experience (years)"
          type="number"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          min="0"
        />
        <Input
          label="Salary"
          type="number"
          step="0.01"
          value={formData.salary}
          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
        />
      </div>
      <Input
        label="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

