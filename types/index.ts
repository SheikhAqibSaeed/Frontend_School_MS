import { UserRole, AttendanceStatus, PaymentStatus, ExamType } from '@prisma/client';

export type { UserRole, AttendanceStatus, PaymentStatus, ExamType };

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  profilePhoto?: string;
  isActive: boolean;
}

export interface Student {
  id: string;
  studentId: string;
  userId: string;
  classId: string;
  sectionId?: string;
  admissionDate: Date;
  dateOfBirth: Date;
  gender: string;
  user?: User;
}

export interface Teacher {
  id: string;
  employeeId: string;
  userId: string;
  joiningDate: Date;
  qualification?: string;
  experience?: number;
  user?: User;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  todayAttendance: number;
  pendingFees: number;
  upcomingExams: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

