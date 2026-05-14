import { apiClient, unwrapData, unwrapList } from '@/lib/api-client';

export async function listRoles(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/roles', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function getRole(id: string) {
  const res = await apiClient.get<unknown>(`/roles/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function syncRolePermissions(roleId: string, permissionIds: string[]) {
  const res = await apiClient.put<unknown>(`/roles/${roleId}/permissions`, { permissionIds });
  return unwrapData<Record<string, unknown>>(res.data as never);
}
