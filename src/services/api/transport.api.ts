import { apiClient, unwrapData, unwrapList } from '@/lib/api-client';

export async function getTransportStats() {
  const res = await apiClient.get<unknown>('/transport/stats');
  return unwrapData<{
    totalVehicles: number;
    activeRoutes: number;
    studentsUsing: number;
  }>(res.data as never);
}

export async function listTransportVehicles() {
  const res = await apiClient.get<unknown>('/transport/vehicles');
  return unwrapData<Array<{ id: string; registration: string; capacity?: number }>>(res.data as never);
}

export async function listTransportRoutes(params?: { page?: number; limit?: number }) {
  const res = await apiClient.get<unknown>('/transport/routes', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function createTransportRoute(body: Record<string, unknown>) {
  const res = await apiClient.post<unknown>('/transport/routes', body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function updateTransportRoute(id: string, body: Record<string, unknown>) {
  const res = await apiClient.patch<unknown>(`/transport/routes/${id}`, body);
  return unwrapData<Record<string, unknown>>(res.data as never);
}

export async function deleteTransportRoute(id: string) {
  const res = await apiClient.delete<unknown>(`/transport/routes/${id}`);
  return unwrapData<Record<string, unknown>>(res.data as never);
}
