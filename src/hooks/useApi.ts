'use client';

import { useState, useEffect } from 'react';
import { ApiResponse } from '@/types';

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(
  apiCall: () => Promise<Response>,
  options: UseApiOptions = { immediate: true },
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      
      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText) as { error?: string; message?: string | string[] };
          const m = errorJson.message;
          const fromMessage = Array.isArray(m) ? m.join(', ') : typeof m === 'string' ? m : undefined;
          errorMessage = fromMessage ?? errorJson.error ?? errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        setError(errorMessage);
        options.onError?.(errorMessage);
        setLoading(false);
        return;
      }

      const result: ApiResponse<T> = await response.json();
      
      if (result.success && result.data !== undefined) {
        setData(result.data);
        options.onSuccess?.(result.data);
      } else {
        const m = (result as { message?: string | string[] }).message;
        const fromMessage = Array.isArray(m) ? m.join(', ') : typeof m === 'string' ? m : undefined;
        const errorMessage = fromMessage ?? result.error ?? 'An error occurred';
        setError(errorMessage);
        options.onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, execute, setData };
}

export function useMutation<T = any, P = any>(
  apiCall: (params: P) => Promise<Response>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (params: P) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(params);
      const result = (await response.json()) as ApiResponse<T> & { message?: string | string[] };

      if (!response.ok) {
        const m = result.message;
        const fromMessage = Array.isArray(m) ? m.join(', ') : typeof m === 'string' ? m : undefined;
        const errorMessage = fromMessage ?? result.error ?? `Request failed with status ${response.status}`;
        setError(errorMessage);
        options.onError?.(errorMessage);
        throw new Error(errorMessage);
      }

      if (result.success) {
        options.onSuccess?.(result.data as T);
        return result.data as T;
      }
      const m = result.message;
      const fromMessage = Array.isArray(m) ? m.join(', ') : typeof m === 'string' ? m : undefined;
      const errorMessage = fromMessage ?? result.error ?? 'An error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
