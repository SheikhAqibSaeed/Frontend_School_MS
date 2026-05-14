export type { AttendanceStatus, PaymentStatus, ExamType } from '@prisma/client';
export * from './auth';
export * from './api';

/** Legacy API envelope used by some Next API routes */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
