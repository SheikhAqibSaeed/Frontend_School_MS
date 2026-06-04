'use client';

import Link from 'next/link';
import { FileText, GraduationCap, UserCog, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { QueryState } from '@/components/common/QueryState';
import { useSchoolOverviewData } from '@/hooks/useSchoolOverview';
import { moduleToAdminHref } from '@/config/role-modules';

export default function ReportsPage() {
  const { overview, isLoading, error, refetch, isFetching, dataUpdatedAt } =
    useSchoolOverviewData();

  const totalPeople =
    (overview.students ?? 0) + (overview.teachers ?? 0) + (overview.staff ?? 0);

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="School-wide metrics and summaries."
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      <QueryState isLoading={false} error={error}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active students"
            value={overview.students ?? 0}
            description="Enrolled and active"
            icon={GraduationCap}
            accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            loading={isLoading}
          />
          <StatCard
            label="Active teachers"
            value={overview.teachers ?? 0}
            description="Teaching staff on record"
            icon={Users}
            accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            loading={isLoading}
          />
          <StatCard
            label="Active staff"
            value={overview.staff ?? 0}
            description="Non-teaching staff"
            icon={UserCog}
            accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            loading={isLoading}
          />
          <StatCard
            label="Open invoices"
            value={overview.openInvoices ?? 0}
            description="Issued or partially paid"
            icon={FileText}
            accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            href={moduleToAdminHref('invoices')}
            loading={isLoading}
          />
        </div>
      </QueryState>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Quick snapshot for your school</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Total people (students + staff)</span>
                  <span className="font-semibold tabular-nums">{totalPeople}</span>
                </li>
                <li className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Classes / sections</span>
                  <span className="font-semibold tabular-nums">
                    {overview.classes ?? 0} / {overview.sections ?? 0}
                  </span>
                </li>
                <li className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Student-to-teacher ratio</span>
                  <span className="font-semibold tabular-nums">
                    {overview.teachers
                      ? `${((overview.students ?? 0) / overview.teachers).toFixed(1)} : 1`
                      : '—'}
                  </span>
                </li>
                <li className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Attendance marked today</span>
                  <span className="font-semibold tabular-nums">{overview.attendanceToday ?? 0}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Outstanding fee invoices</span>
                  <span className="font-semibold tabular-nums">{overview.openInvoices ?? 0}</span>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
            <CardDescription>Jump to related modules</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={moduleToAdminHref('students')}>Students</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={moduleToAdminHref('teachers')}>Teachers</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={moduleToAdminHref('invoices')}>Invoices</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={moduleToAdminHref('transport')}>Transport</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={moduleToAdminHref('results')}>Results</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {lastUpdated && !isLoading && (
        <p className="text-center text-xs text-muted-foreground">
          Last updated {lastUpdated}
        </p>
      )}
    </div>
  );
}
