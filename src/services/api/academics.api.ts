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

export async function listMarks(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/marks', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function deleteMark(id: string) {
  const res = await apiClient.delete<unknown>(`/marks/${id}`);
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

export async function listInvoices(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/invoices', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function deleteInvoice(id: string) {
  const res = await apiClient.delete<unknown>(`/invoices/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function listPayments(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/payments', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
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

export async function listHomework(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/homework', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function deleteHomework(id: string) {
  const res = await apiClient.delete<unknown>(`/homework/${id}`);
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
