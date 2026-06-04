'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { parseApiError } from '@/lib/api/errors';

type QueryStateProps = {
  isLoading: boolean;
  error: unknown;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  loadingRows?: number;
  children: React.ReactNode;
};

/** Shared loading / error / empty wrapper for data views. */
export function QueryState({
  isLoading,
  error,
  isEmpty,
  emptyTitle = 'No records',
  emptyDescription = 'Nothing to show yet.',
  loadingRows = 3,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: loadingRows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load data</AlertTitle>
        <AlertDescription>{parseApiError(error)}</AlertDescription>
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <Alert>
        <AlertTitle>{emptyTitle}</AlertTitle>
        <AlertDescription>{emptyDescription}</AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
