'use client';

import { useAuthStore } from '@/store/auth-store';
import type { AuthUser } from '@/types/auth';
import type { UserRole } from '@/types/auth';

/** Back-compat hook over Zustand auth store */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const primaryRole = useAuthStore((s) => s.primaryRole);
  const accessToken = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);
  const setSession = useAuthStore((s) => s.setSession);

  const legacyUser = user
    ? {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: (primaryRole ?? 'SCHOOL_ADMIN') as string,
        isActive: true,
      }
    : null;

  return {
    user: legacyUser,
    authUser: user as AuthUser | null,
    /** API permission codes for the active school (from login). Used with `navItemsForSession`. */
    permissions: user?.permissions ?? null,
    primaryRole: primaryRole as UserRole | null,
    loading: false,
    isAuthenticated: Boolean(accessToken && user),
    logout,
    setSession,
  };
}
