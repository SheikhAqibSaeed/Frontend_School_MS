'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface StudentFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  classId: string;
  sectionId: string;
  admissionDate: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  emergencyContact: string;
  previousSchool: string;
}

interface StudentFormProps {
  initialData?: any;
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  classes?: any[];
  sections?: any[];
}

// Static class options as fallback
const STATIC_CLASSES = [
  { id: 'class1', name: 'Grade 1', level: 1 },
  { id: 'class2', name: 'Grade 2', level: 2 },
  { id: 'class3', name: 'Grade 3', level: 3 },
  { id: 'class4', name: 'Grade 4', level: 4 },
  { id: 'class5', name: 'Grade 5', level: 5 },
  { id: 'class6', name: 'Grade 6', level: 6 },
  { id: 'class7', name: 'Grade 7', level: 7 },
  { id: 'class8', name: 'Grade 8', level: 8 },
  { id: 'class9', name: 'Grade 9', level: 9 },
  { id: 'class10', name: 'Grade 10', level: 10 },
  { id: 'class11', name: 'Grade 11', level: 11 },
  { id: 'class12', name: 'Grade 12', level: 12 },
];

// Static section options as fallback
const STATIC_SECTIONS = [
  { id: 'section1', name: 'Section A', classId: 'class1' },
  { id: 'section2', name: 'Section B', classId: 'class1' },
  { id: 'section3', name: 'Section A', classId: 'class2' },
  { id: 'section4', name: 'Section B', classId: 'class2' },
  { id: 'section5', name: 'Section A', classId: 'class3' },
  { id: 'section6', name: 'Section B', classId: 'class3' },
  { id: 'section7', name: 'Section A', classId: 'class4' },
  { id: 'section8', name: 'Section B', classId: 'class4' },
  { id: 'section9', name: 'Section A', classId: 'class5' },
  { id: 'section10', name: 'Section B', classId: 'class5' },
  { id: 'section11', name: 'Section A', classId: 'class6' },
  { id: 'section12', name: 'Section B', classId: 'class6' },
  { id: 'section13', name: 'Section A', classId: 'class7' },
  { id: 'section14', name: 'Section B', classId: 'class7' },
  { id: 'section15', name: 'Section A', classId: 'class8' },
  { id: 'section16', name: 'Section B', classId: 'class8' },
  { id: 'section17', name: 'Section A', classId: 'class9' },
  { id: 'section18', name: 'Section B', classId: 'class9' },
  { id: 'section19', name: 'Section A', classId: 'class10' },
  { id: 'section20', name: 'Section B', classId: 'class10' },
  { id: 'section21', name: 'Section A', classId: 'class11' },
  { id: 'section22', name: 'Section B', classId: 'class11' },
  { id: 'section23', name: 'Section A', classId: 'class12' },
  { id: 'section24', name: 'Section B', classId: 'class12' },
];

export function StudentForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  classes = [],
  sections = [],
}: StudentFormProps) {
  // Use static classes if no classes from API, or merge both
  const availableClasses = Array.isArray(classes) && classes.length > 0 
    ? classes 
    : STATIC_CLASSES;

  const [formData, setFormData] = useState<StudentFormData>({
    email: initialData?.user?.email || '',
    password: '',
    firstName: initialData?.user?.firstName || '',
    lastName: initialData?.user?.lastName || '',
    phone: initialData?.user?.phone || '',
    address: initialData?.user?.address || '',
    classId: initialData?.classId || '',
    sectionId: initialData?.sectionId || '',
    admissionDate: initialData?.admissionDate
      ? new Date(initialData.admissionDate).toISOString().split('T')[0]
      : '',
    dateOfBirth: initialData?.dateOfBirth
      ? new Date(initialData.dateOfBirth).toISOString().split('T')[0]
      : '',
    gender: initialData?.gender || '',
    bloodGroup: initialData?.bloodGroup || '',
    emergencyContact: initialData?.emergencyContact || '',
    previousSchool: initialData?.previousSchool || '',
  });

  // Use static sections if no sections from API
  const availableSections = Array.isArray(sections) && sections.length > 0 
    ? sections 
    : STATIC_SECTIONS;

  const [filteredSections, setFilteredSections] = useState<any[]>([]);

  // Debug: Log classes and sections props
  useEffect(() => {
    console.log('StudentForm - Classes prop:', classes);
    console.log('StudentForm - Available classes:', availableClasses);
    console.log('StudentForm - Sections prop:', sections);
    console.log('StudentForm - Available sections:', availableSections);
  }, [classes, availableClasses, sections, availableSections]);

  useEffect(() => {
    if (formData.classId) {
      // Filter sections by selected class
      const classSections = availableSections.filter((s: any) => s.classId === formData.classId);
      setFilteredSections(classSections);
      
      // Reset section if current selection doesn't belong to selected class
      if (!classSections.find((s: any) => s.id === formData.sectionId)) {
        setFormData((prev) => ({ ...prev, sectionId: '' }));
      }
    } else {
      setFilteredSections([]);
      setFormData((prev) => ({ ...prev, sectionId: '' }));
    }
  }, [formData.classId, availableSections]);

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
          label="Date of Birth *"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          required
        />
        <Select
          label="Gender *"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          options={[
            { value: '', label: 'Select Gender' },
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' },
          ]}
          required
        />
        <Input
          label="Admission Date *"
          type="date"
          value={formData.admissionDate}
          onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
          required
        />
        <Select
          label="Class *"
          value={formData.classId}
          onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
          options={[
            { value: '', label: 'Select Class' },
            ...availableClasses.map((c: any) => ({ 
              value: c.id, 
              label: c.name || `Class ${c.level || c.id}` 
            })),
          ]}
          required
        />
        <Select
          label="Section"
          value={formData.sectionId}
          onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
          options={[
            { value: '', label: 'Select Section' },
            ...filteredSections.map((s: any) => ({ value: s.id, label: s.name })),
          ]}
          disabled={!formData.classId}
        />
        <Input
          label="Blood Group"
          value={formData.bloodGroup}
          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
        />
        <Input
          label="Emergency Contact"
          value={formData.emergencyContact}
          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
        />
      </div>
      <Input
        label="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />
      <Input
        label="Previous School"
        value={formData.previousSchool}
        onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
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

