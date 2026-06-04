import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { parseApiError, toApiError } from '@/lib/api/errors';
import { useAuthStore } from '@/store/auth-store';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

function getState() {
  return useAuthStore.getState();
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken, schoolId } = getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (schoolId) {
    config.headers['X-School-Id'] = schoolId;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await getState().logout();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    const apiErr = toApiError(error);
    const wrapped = error as Error & { apiMessage?: string };
    wrapped.apiMessage = apiErr.message;
    return Promise.reject(wrapped);
  },
);

export { parseApiError, toApiError };
export { unwrapData, unwrapList } from '@/lib/api/unwrap';
export type { ApiError } from '@/lib/api/errors';
export type { PaginatedResult, SchoolOverview, PaginationMeta } from '@/lib/api/types';
