'use client';

import { useQuery } from '@tanstack/react-query';
import { getReportsOverview } from '@/services/api/auth.api';
import type { SchoolOverview } from '@/lib/api/types';

const QUERY_KEY = ['reports', 'overview'] as const;

export function useSchoolOverview(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getReportsOverview,
    refetchInterval: options?.refetchInterval,
    staleTime: 30_000,
  });
}

export function useSchoolOverviewData(options?: { refetchInterval?: number }) {
  const { data, ...rest } = useSchoolOverview(options);
  return { overview: (data ?? {}) as SchoolOverview, ...rest };
}
