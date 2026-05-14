import { apiClient, unwrapList, unwrapData } from '@/lib/api-client';

export async function listTeachers(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/teachers', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function getTeacher(id: string) {
  const res = await apiClient.get<unknown>(`/teachers/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function createTeacher(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/teachers', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function updateTeacher(id: string, body: Record<string, unknown>) {
  const res = await apiClient.patch<unknown>(`/teachers/${id}`, body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deleteTeacher(id: string) {
  const res = await apiClient.delete<unknown>(`/teachers/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}
