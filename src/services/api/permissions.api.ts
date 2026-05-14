import { apiClient, unwrapList } from '@/lib/api-client';

export async function listPermissionsCatalog(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/permissions', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}
