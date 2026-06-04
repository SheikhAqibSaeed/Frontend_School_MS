import { apiClient, unwrapData, unwrapList } from '@/lib/api-client';
import type { SchoolOverview } from '@/lib/api/types';
import type { LoginPayload, LoginResponse, RegisterPayload, RegisterSchoolOption } from '@/types/auth';

export async function loginRequest(payload: LoginPayload) {
  const res = await apiClient.post<unknown>('/auth/login', payload);
  return unwrapData<LoginResponse>(res.data as never);
}

export async function listRegisterSchools() {
  const res = await apiClient.get<unknown>('/auth/register/schools');
  return unwrapData<RegisterSchoolOption[]>(res.data as never);
}

export async function registerSchoolUser(payload: RegisterPayload) {
  const res = await apiClient.post<unknown>('/auth/register', payload);
  return unwrapData<LoginResponse>(res.data as never);
}

export async function refreshRequest(refreshToken: string) {
  const res = await apiClient.post<unknown>('/auth/refresh', { refreshToken });
  return unwrapData<{ accessToken: string; refreshToken: string }>(res.data as never);
}

export async function forgotPasswordRequest(email: string) {
  // Placeholder until backend endpoint exists
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true as const, email };
}

export async function resetPasswordRequest(_token: string, _password: string) {
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true as const };
}

export async function listSchools(params?: { page?: number; limit?: number; search?: string }) {
  const res = await apiClient.get<unknown>('/schools', { params });
  return unwrapList<Record<string, unknown>>(res.data as never);
}

export async function getReportsOverview() {
  const res = await apiClient.get<unknown>('/reports/overview');
  return unwrapData<SchoolOverview>(res.data as never);
}

export async function getResultsSummary() {
  const res = await apiClient.get<unknown>('/results/summary');
  return unwrapData<Record<string, unknown>>(res.data as never);
}
