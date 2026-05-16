import { apiClient, unwrapData, unwrapList } from '@/lib/api-client';

export async function listSchools(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/schools', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function getSchool(id: string) {
  const res = await apiClient.get<unknown>(`/schools/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function createSchool(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/schools', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function updateSchool(id: string, body: Record<string, unknown>) {
  const res = await apiClient.patch<unknown>(`/schools/${id}`, body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deleteSchool(id: string) {
  const res = await apiClient.delete<unknown>(`/schools/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}
