'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export function PageHeader({
  title,
  description,
  action,
  onRefresh,
  isRefreshing,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onRefresh && (
          <Button type="button" variant="outline" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}
