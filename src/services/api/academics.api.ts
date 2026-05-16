import { apiClient, unwrapList, unwrapData } from '@/lib/api-client';

export async function listClasses(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/classes', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function listSections(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/sections', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function createSection(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/sections', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function updateSection(id: string, body: Record<string, unknown>) {
  const res = await apiClient.patch<unknown>(`/sections/${id}`, body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deleteSection(id: string) {
  const res = await apiClient.delete<unknown>(`/sections/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function listSubjects(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/subjects', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function createSubject(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/subjects', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function updateSubject(id: string, body: Record<string, unknown>) {
  const res = await apiClient.patch<unknown>(`/subjects/${id}`, body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deleteSubject(id: string) {
  const res = await apiClient.delete<unknown>(`/subjects/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function listAttendance(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/attendance', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function listExams(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/exams', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function createExam(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/exams', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function updateExam(id: string, body: Record<string, unknown>) {
  const res = await apiClient.patch<unknown>(`/exams/${id}`, body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deleteExam(id: string) {
  const res = await apiClient.delete<unknown>(`/exams/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function listMarks(params?: {
  page?: number;
  limit?: number;
  examId?: string;
  studentId?: string;
  classId?: string;
}) {
  const res = await apiClient.get<unknown>('/marks', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function createMark(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/marks', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function updateMark(id: string, body: Record<string, unknown>) {
  const res = await apiClient.patch<unknown>(`/marks/${id}`, body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deleteMark(id: string) {
  const res = await apiClient.delete<unknown>(`/marks/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function listResults(params?: { page?: number; limit?: number }) {
  const res = await apiClient.get<unknown>('/results', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function listExamSchedules(params?: {
  page?: number;
  limit?: number;
  examId?: string;
  classId?: string;
}) {
  const res = await apiClient.get<unknown>('/exam-schedules', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function createExamSchedule(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/exam-schedules', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deleteExamSchedule(id: string) {
  const res = await apiClient.delete<unknown>(`/exam-schedules/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function listFees(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/fees', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function createFeeStructure(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/fees', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function updateFeeStructure(id: string, body: Record<string, unknown>) {
  const res = await apiClient.patch<unknown>(`/fees/${id}`, body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deleteFeeStructure(id: string) {
  const res = await apiClient.delete<unknown>(`/fees/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function listInvoices(params?: {
  page?: number;
  limit?: number;
  studentId?: string;
  status?: string;
}) {
  const res = await apiClient.get<unknown>('/invoices', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function createInvoice(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/invoices', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function updateInvoice(id: string, body: Record<string, unknown>) {
  const res = await apiClient.patch<unknown>(`/invoices/${id}`, body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deleteInvoice(id: string) {
  const res = await apiClient.delete<unknown>(`/invoices/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function listPayments(params?: {
  page?: number;
  limit?: number;
  studentId?: string;
  invoiceId?: string;
}) {
  const res = await apiClient.get<unknown>('/payments', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function createPayment(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/payments', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deletePayment(id: string) {
  const res = await apiClient.delete<unknown>(`/payments/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function listTimetable(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/timetable', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function deleteTimetableSlot(id: string) {
  const res = await apiClient.delete<unknown>(`/timetable/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function listHomework(params?: {
  page?: number;
  limit?: number;
  classId?: string;
  teacherId?: string;
}) {
  const res = await apiClient.get<unknown>('/homework', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function createHomework(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/homework', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function updateHomework(id: string, body: Record<string, unknown>) {
  const res = await apiClient.patch<unknown>(`/homework/${id}`, body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deleteHomework(id: string) {
  const res = await apiClient.delete<unknown>(`/homework/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function listLibraryBooks(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/library/books', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function createLibraryBook(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/library/books', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function updateLibraryBook(id: string, body: Record<string, unknown>) {
  const res = await apiClient.patch<unknown>(`/library/books/${id}`, body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deleteLibraryBook(id: string) {
  const res = await apiClient.delete<unknown>(`/library/books/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function listAnnouncements(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/announcements', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function deleteAnnouncement(id: string) {
  const res = await apiClient.delete<unknown>(`/announcements/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}
