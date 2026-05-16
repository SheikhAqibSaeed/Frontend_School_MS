'use client';

import { useQuery } from '@tanstack/react-query';
import { Award, BarChart3, ClipboardList, TrendingUp } from 'lucide-react';
import { RouterLink } from '@/components/common/RouterLink';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getResultsSummary } from '@/services/api/auth.api';
import { listResults } from '@/services/api/academics.api';

function formatAverage(raw: unknown): string {
  if (raw == null) return '—';
  const n =
    typeof raw === 'number'
      ? raw
      : typeof raw === 'object' && raw !== null && 'toString' in raw
        ? Number((raw as { toString: () => string }).toString())
        : Number(String(raw));
  if (Number.isNaN(n)) return '—';
  return n.toFixed(1);
}

function averageTone(avg: number): { label: string; className: string; bar: string } {
  if (avg >= 75) return { label: 'Strong', className: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500' };
  if (avg >= 50) return { label: 'Moderate', className: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' };
  return { label: 'Needs attention', className: 'bg-red-100 text-red-800', bar: 'bg-red-500' };
}

export default function ResultsPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['results', 'summary'],
    queryFn: getResultsSummary,
  });

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['results', 'list'],
    queryFn: () => listResults({ page: 1, limit: 15 }),
  });

  const totalResults = data ? Number(data.totalResults ?? 0) : 0;
  const avgNum = data ? Number(formatAverage(data.averageMarks)) : NaN;
  const avgDisplay = formatAverage(data?.averageMarks);
  const tone = !Number.isNaN(avgNum) ? averageTone(avgNum) : null;
  const barWidth = !Number.isNaN(avgNum) ? Math.min(100, Math.max(0, avgNum)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results</h1>
          <p className="text-muted-foreground">
            School-wide exam performance based on recorded marks.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl sm:col-span-2 lg:col-span-1" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Could not load results</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total mark records
                </CardTitle>
                <ClipboardList className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">{totalResults.toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Exam results entered for this school
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average marks
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold tabular-nums">{avgDisplay}</p>
                  {tone && totalResults > 0 && (
                    <Badge className={tone.className} variant="outline">
                      {tone.label}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Mean score across all results</p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quick actions
                </CardTitle>
                <Award className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button type="button" variant="secondary" className="w-full justify-start" asChild>
                  <RouterLink href="/admin/marks">Open marks entry</RouterLink>
                </Button>
                <Button type="button" variant="outline" className="w-full justify-start" asChild>
                  <RouterLink href="/admin/exams">Manage exams</RouterLink>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle>Performance overview</CardTitle>
                  <CardDescription>
                    {totalResults === 0
                      ? 'No exam results yet. Add marks to see analytics here.'
                      : `Based on ${totalResults.toLocaleString()} recorded result${totalResults === 1 ? '' : 's'}.`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {totalResults === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                  <Award className="mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium">No results to summarize</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Enter marks from the marks entry screen after exams are scheduled.
                  </p>
                  <Button type="button" className="mt-4" asChild>
                    <RouterLink href="/admin/marks">Go to marks entry</RouterLink>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average score</span>
                    <span className="font-semibold tabular-nums">{avgDisplay}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${tone?.bar ?? 'bg-primary'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  {tone && (
                    <p className="text-xs text-muted-foreground">
                      Overall performance is rated{' '}
                      <span className="font-medium">{tone.label.toLowerCase()}</span> for the current
                      dataset.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent results</CardTitle>
              <CardDescription>Latest exam results entered for this school.</CardDescription>
            </CardHeader>
            <CardContent>
              {listLoading && <Skeleton className="h-32 w-full" />}
              {!listLoading && (listData?.items ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No results to show yet.</p>
              )}
              {!listLoading && (listData?.items ?? []).length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(listData?.items ?? []).map((row) => {
                      const student = row.student as { firstName?: string; lastName?: string } | undefined;
                      const exam = row.exam as { name?: string } | undefined;
                      const subject = row.subject as { name?: string } | undefined;
                      const obtained =
                        row.marksObtained != null &&
                        typeof row.marksObtained === 'object' &&
                        'toString' in row.marksObtained
                          ? (row.marksObtained as { toString: () => string }).toString()
                          : String(row.marksObtained ?? '—');
                      const max =
                        row.maxMarks != null &&
                        typeof row.maxMarks === 'object' &&
                        'toString' in row.maxMarks
                          ? (row.maxMarks as { toString: () => string }).toString()
                          : String(row.maxMarks ?? '—');
                      return (
                        <TableRow key={String(row.id)}>
                          <TableCell>
                            {student
                              ? `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim()
                              : '—'}
                          </TableCell>
                          <TableCell>{String(exam?.name ?? '—')}</TableCell>
                          <TableCell>{String(subject?.name ?? '—')}</TableCell>
                          <TableCell>
                            {obtained} / {max}
                          </TableCell>
                          <TableCell>{String(row.grade ?? '—')}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
