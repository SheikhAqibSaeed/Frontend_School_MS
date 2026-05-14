'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getResultsSummary } from '@/services/api/auth.api';

export default function ResultsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['results', 'summary'],
    queryFn: getResultsSummary,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Results</h1>
        <p className="text-muted-foreground">Aggregated performance for the active school.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>From Nest `GET /results/summary`</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Skeleton className="h-24 w-full" />}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          )}
          {data && (
            <pre className="rounded-md bg-muted p-4 text-sm">{JSON.stringify(data, null, 2)}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
