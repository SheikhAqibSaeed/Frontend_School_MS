import { apiClient, unwrapList, unwrapData } from '@/lib/api-client';

export async function listStudents(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/students', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function getStudent(id: string) {
  const res = await apiClient.get<unknown>(`/students/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function createStudent(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/students', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function updateStudent(id: string, body: Record<string, unknown>) {
  const res = await apiClient.patch<unknown>(`/students/${id}`, body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deleteStudent(id: string) {
  const res = await apiClient.delete<unknown>(`/students/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}
