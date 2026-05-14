'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { listSchools } from '@/services/api/auth.api';

/** Super admins have no school on the JWT until they pick one; backend requires `X-School-Id` for school routes. */
export function SuperAdminSchoolBootstrap() {
  const primaryRole = useAuthStore((s) => s.primaryRole);
  const schoolId = useAuthStore((s) => s.schoolId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSchoolId = useAuthStore((s) => s.setSchoolId);

  const { data } = useQuery({
    queryKey: ['schools'],
    queryFn: () => listSchools({ limit: 100 }),
    enabled: primaryRole === 'SUPER_ADMIN' && Boolean(accessToken) && !schoolId,
  });

  useEffect(() => {
    if (primaryRole !== 'SUPER_ADMIN' || schoolId) return;
    const items = data?.items;
    if (items?.length) {
      setSchoolId(String((items[0] as Record<string, unknown>).id));
    }
  }, [primaryRole, schoolId, data, setSchoolId]);

  return null;
}
