import { apiClient, unwrapData, unwrapList } from '@/lib/api-client';

export async function listSchoolUsers(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/users', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function getSchoolUser(id: string) {
  const res = await apiClient.get<unknown>(`/users/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function replaceUserSchoolRoles(userId: string, roleIds: string[]) {
  const res = await apiClient.put<unknown>(`/users/${userId}/school-roles`, { roleIds });
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function createSchoolUser(body: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  schoolId: string;
  roleId: string;
}) {
  const res = await apiClient.post<unknown>('/users', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}
