'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api/errors';

type ToastMutationOptions<TData, TVariables> = UseMutationOptions<TData, Error, TVariables> & {
  successMessage?: string;
  errorMessage?: string;
};

/** Mutation wrapper with consistent toast error/success handling. */
export function useMutationToast<TData = unknown, TVariables = void>(
  options: ToastMutationOptions<TData, TVariables>,
) {
  const { successMessage, errorMessage, onSuccess, onError, ...rest } = options;

  return useMutation({
    ...rest,
    onSuccess: (data, variables, context) => {
      if (successMessage) toast.success(successMessage);
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(errorMessage ?? parseApiError(error));
      onError?.(error, variables, context);
    },
  });
}
