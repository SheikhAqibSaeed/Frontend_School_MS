import { z } from 'zod';

const opt = z.string().optional().or(z.literal(''));

export const teacherFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: opt,
  employeeNo: z.string().min(1),
  joiningDate: z.string().min(1),
  dateOfBirth: opt,
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  nationalId: opt,
  qualification: opt,
  specialization: opt,
  experienceYears: opt,
  employmentType: opt,
  designation: opt,
  department: opt,
  salary: opt,
  address: opt,
  city: opt,
  country: opt,
  remarks: opt,
  isActive: z.enum(['true', 'false']).optional(),
});

export type TeacherFormValues = z.infer<typeof teacherFormSchema>;

export function teacherFormToApi(values: TeacherFormValues, isCreate: boolean) {
  const body: Record<string, unknown> = {
    email: values.email,
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone?.trim() || undefined,
    employeeNo: values.employeeNo,
    joiningDate: new Date(values.joiningDate).toISOString(),
    dateOfBirth: values.dateOfBirth?.trim() ? new Date(values.dateOfBirth).toISOString() : undefined,
    gender: values.gender,
    nationalId: values.nationalId?.trim() || undefined,
    qualification: values.qualification?.trim() || undefined,
    specialization: values.specialization?.trim() || undefined,
    experienceYears: values.experienceYears?.trim() ? Number(values.experienceYears) : undefined,
    employmentType: values.employmentType?.trim() || undefined,
    designation: values.designation?.trim() || undefined,
    department: values.department?.trim() || undefined,
    salary: values.salary?.trim() ? Number(values.salary) : undefined,
    address: values.address?.trim() || undefined,
    city: values.city?.trim() || undefined,
    country: values.country?.trim() || undefined,
    remarks: values.remarks?.trim() || undefined,
  };
  if (isCreate && values.password) body.password = values.password;
  if (values.isActive) body.isActive = values.isActive === 'true';
  return body;
}

export function teacherRecordToForm(data: Record<string, unknown>): TeacherFormValues {
  const user = data.user as Record<string, unknown> | undefined;
  return {
    email: String(user?.email ?? ''),
    password: '',
    confirmPassword: '',
    firstName: String(user?.firstName ?? ''),
    lastName: String(user?.lastName ?? ''),
    phone: user?.phone != null ? String(user.phone) : '',
    employeeNo: String(data.employeeNo ?? ''),
    joiningDate: String(data.joiningDate ?? '').slice(0, 10),
    dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth).slice(0, 10) : '',
    gender: (['MALE', 'FEMALE', 'OTHER'].includes(String(data.gender))
      ? String(data.gender)
      : undefined) as TeacherFormValues['gender'],
    nationalId: data.nationalId != null ? String(data.nationalId) : '',
    qualification: data.qualification != null ? String(data.qualification) : '',
    specialization: data.specialization != null ? String(data.specialization) : '',
    experienceYears: data.experienceYears != null ? String(data.experienceYears) : '',
    employmentType: data.employmentType != null ? String(data.employmentType) : '',
    designation: data.designation != null ? String(data.designation) : '',
    department: data.department != null ? String(data.department) : '',
    salary: data.salary != null ? String(data.salary) : '',
    address: data.address != null ? String(data.address) : '',
    city: data.city != null ? String(data.city) : '',
    country: data.country != null ? String(data.country) : '',
    remarks: data.remarks != null ? String(data.remarks) : '',
    isActive: data.isActive === false ? 'false' : 'true',
  };
}
