import type { AxiosError } from 'axios';
import type { ApiErrorBody } from './types';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly path?: string;
  readonly details?: unknown;

  constructor(message: string, statusCode = 500, path?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.path = path;
    this.details = details;
  }
}

/** Normalize axios / fetch / unknown errors into a user-facing message. */
export function parseApiError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error && typeof error === 'object' && 'apiMessage' in error) {
    const m = (error as { apiMessage?: string }).apiMessage;
    if (m) return m;
  }
  const ax = error as AxiosError<ApiErrorBody>;
  const data = ax.response?.data;
  if (data?.message) {
    return Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
  }
  if (ax.message === 'Network Error') return 'Cannot reach the server. Check your connection and API URL.';
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

export function toApiError(error: unknown): ApiError {
  const ax = error as AxiosError<ApiErrorBody>;
  const data = ax.response?.data;
  const status = data?.statusCode ?? ax.response?.status ?? 500;
  const message = parseApiError(error);
  return new ApiError(message, status, data?.path, data?.details);
}
