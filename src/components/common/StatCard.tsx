'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type StatCardProps = {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
  href?: string;
  loading?: boolean;
  description?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'bg-primary/10 text-primary',
  href,
  loading,
  description,
}: StatCardProps) {
  const inner = (
    <Card
      className={cn(
        'transition-shadow',
        href && 'cursor-pointer hover:border-primary/30 hover:shadow-md',
      )}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            accent,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
