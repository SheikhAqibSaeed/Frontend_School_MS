'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  GraduationCap,
  Layers,
  Megaphone,
  Receipt,
  Bus,
  UserCog,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { QueryState } from '@/components/common/QueryState';
import { useSchoolOverviewData } from '@/hooks/useSchoolOverview';
import { moduleToAdminHref } from '@/config/role-modules';
import { cn } from '@/lib/utils';

function MiniStat({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-1.5 h-7 w-12" />
      ) : (
        <p className="text-xl font-bold tabular-nums tracking-tight">{value}</p>
      )}
    </div>
  );
}

function CategoryCard({
  title,
  description,
  icon: Icon,
  accent,
  stats,
  links,
  loading,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  stats: { label: string; value: number }[];
  links: { label: string; href: string }[];
  loading: boolean;
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              accent,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {stats.map((s) => (
            <MiniStat key={s.label} label={s.label} value={s.value} loading={loading} />
          ))}
        </div>
        <div className="mt-auto flex flex-wrap gap-2 border-t pt-4">
          {links.map((link) => (
            <Button key={link.href} variant="outline" size="sm" asChild>
              <Link href={link.href}>
                {link.label}
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PrincipalOverview() {
  const { overview: o, isLoading, error, refetch, isFetching, dataUpdatedAt } =
    useSchoolOverviewData({ refetchInterval: 60_000 });
  const loading = isLoading;

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Principal"
        description="Live overview of your school — people, academics, finance, and operations. Platform schools and roles are managed by super admin only."
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      <QueryState isLoading={false} error={error}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Students"
            value={o.students ?? 0}
            icon={GraduationCap}
            accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            href={moduleToAdminHref('students')}
            loading={loading}
          />
          <StatCard
            label="Teachers"
            value={o.teachers ?? 0}
            icon={Users}
            accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            href={moduleToAdminHref('teachers')}
            loading={loading}
          />
          <StatCard
            label="Classes"
            value={o.classes ?? 0}
            icon={BookOpen}
            accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            href={moduleToAdminHref('classes')}
            loading={loading}
          />
          <StatCard
            label="Open invoices"
            value={o.openInvoices ?? 0}
            icon={Receipt}
            accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            href={moduleToAdminHref('invoices')}
            loading={loading}
          />
        </div>
      </QueryState>

      <div className="grid gap-4 lg:grid-cols-3">
        <CategoryCard
          title="People"
          description="Students, teachers, and school users"
          icon={Users}
          accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          loading={loading}
          stats={[
            { label: 'Students', value: o.students ?? 0 },
            { label: 'Teachers', value: o.teachers ?? 0 },
            { label: 'Staff', value: o.staff ?? 0 },
          ]}
          links={[
            { label: 'Students', href: moduleToAdminHref('students') },
            { label: 'Teachers', href: moduleToAdminHref('teachers') },
            { label: 'Users', href: moduleToAdminHref('users') },
          ]}
        />
        <CategoryCard
          title="Academics"
          description="Classes, sections, exams, marks, and attendance"
          icon={BookOpen}
          accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          loading={loading}
          stats={[
            { label: 'Classes', value: o.classes ?? 0 },
            { label: 'Sections', value: o.sections ?? 0 },
            { label: 'Exams', value: o.activeExams ?? 0 },
            { label: 'Today attendance', value: o.attendanceToday ?? 0 },
          ]}
          links={[
            { label: 'Classes', href: moduleToAdminHref('classes') },
            { label: 'Attendance', href: moduleToAdminHref('attendance') },
            { label: 'Exams', href: moduleToAdminHref('exams') },
          ]}
        />
        <CategoryCard
          title="Finance"
          description="Fees, invoices, and payments"
          icon={CreditCard}
          accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          loading={loading}
          stats={[
            { label: 'Open invoices', value: o.openInvoices ?? 0 },
            { label: 'Fee payers', value: o.students ?? 0 },
          ]}
          links={[
            { label: 'Fees', href: moduleToAdminHref('fees') },
            { label: 'Invoices', href: moduleToAdminHref('invoices') },
            { label: 'Payments', href: moduleToAdminHref('payments') },
          ]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="h-5 w-5 text-primary" />
              Communications &amp; ops
            </CardTitle>
            <CardDescription>Announcements, transport, and library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="Announcements" value={o.announcements ?? 0} loading={loading} />
              <MiniStat label="Bus routes" value={o.activeRoutes ?? 0} loading={loading} />
              <MiniStat
                label="On transport"
                value={o.studentsOnTransport ?? 0}
                loading={loading}
              />
              <MiniStat label="Staff" value={o.staff ?? 0} loading={loading} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={moduleToAdminHref('announcements')}>
                  Announcements
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={moduleToAdminHref('transport')}>
                  <Bus className="mr-1 h-3.5 w-3.5" />
                  Transport
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={moduleToAdminHref('reports')}>
                  <FileText className="mr-1 h-3.5 w-3.5" />
                  Full reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Quick actions
            </CardTitle>
            <CardDescription>Common tasks for today</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={moduleToAdminHref('attendance')}>Mark attendance</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={moduleToAdminHref('invoices')}>View invoices</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={moduleToAdminHref('homework')}>Homework</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={moduleToAdminHref('sections')}>
                <Layers className="mr-1 h-3.5 w-3.5" />
                Sections
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={moduleToAdminHref('users')}>
                <UserCog className="mr-1 h-3.5 w-3.5" />
                School users
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {lastUpdated && !loading && (
        <p className="text-center text-xs text-muted-foreground">
          Live data · last updated {lastUpdated}
          {isFetching ? ' · refreshing…' : ''}
        </p>
      )}
    </div>
  );
}
