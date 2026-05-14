import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
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
      getState().logout();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const m = (data as { message: unknown }).message;
      const text = Array.isArray(m) ? m.map(String).join(', ') : String(m);
      if (text) (error as Error & { apiMessage?: string }).apiMessage = text;
    }
    return Promise.reject(error);
  },
);

export function unwrapData<T>(body: unknown): T {
  if (body && typeof body === 'object' && 'success' in body && (body as { success: boolean }).success) {
    // Nest interceptor may omit `data` when it is `undefined` (JSON drops the key).
    if (!('data' in body)) return undefined as T;
    return (body as { data: T }).data;
  }
  const msg =
    body && typeof body === 'object' && 'message' in body
      ? String((body as { message: unknown }).message)
      : 'Request failed';
  throw new Error(msg);
}

export function unwrapList<T>(
  body: unknown,
): { items: T[]; meta: { total: number; page: number; limit: number; totalPages: number } } {
  if (
    !body ||
    typeof body !== 'object' ||
    !('success' in body) ||
    !(body as { success: boolean }).success ||
    !('data' in body) ||
    !('meta' in body)
  ) {
    throw new Error('Invalid list response');
  }
  const b = body as unknown as {
    data: T[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
  return { items: b.data, meta: b.meta };
}
