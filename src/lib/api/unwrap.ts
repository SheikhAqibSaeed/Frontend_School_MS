import { ApiError } from './errors';
import type { PaginatedResult } from './types';

export function unwrapData<T>(body: unknown): T {
  if (body && typeof body === 'object' && 'success' in body && (body as { success: boolean }).success) {
    if (!('data' in body)) return undefined as T;
    return (body as { data: T }).data;
  }
  const msg =
    body && typeof body === 'object' && 'message' in body
      ? String((body as { message: unknown }).message)
      : 'Request failed';
  throw new ApiError(msg, 400);
}

export function unwrapList<T>(body: unknown): PaginatedResult<T> {
  if (
    !body ||
    typeof body !== 'object' ||
    !('success' in body) ||
    !(body as { success: boolean }).success ||
    !('data' in body) ||
    !('meta' in body)
  ) {
    throw new ApiError('Invalid list response', 500);
  }
  const b = body as { data: T[]; meta: PaginatedResult<T>['meta'] };
  return { items: b.data, meta: b.meta };
}
