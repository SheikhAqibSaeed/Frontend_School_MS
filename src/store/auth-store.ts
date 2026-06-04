'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, UserRole } from '@/types/auth';
import { clearUiSessionCookie } from '@/lib/ui-session-cookie';

function inferPrimaryRole(user: AuthUser): UserRole {
  if (user.isSuperAdmin) return 'SUPER_ADMIN';
  const codes = (user.roles ?? []).map((c) => {
    if (c === 'SCHOOL_ADMIN' || c === 'RECEPTIONIST' || c === 'PARENT') return 'PRINCIPAL';
    return c;
  }) as UserRole[];
  const order: UserRole[] = [
    'PRINCIPAL',
    'ACCOUNTANT',
    'TEACHER',
    'STUDENT',
    'LIBRARIAN',
    'TRANSPORT_MANAGER',
  ];
  for (const r of order) {
    if (codes.includes(r)) return r;
  }
  return 'PRINCIPAL';
}

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  schoolId: string | null;
  user: AuthUser | null;
  primaryRole: UserRole | null;
  setSession: (payload: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }) => void;
  setSchoolId: (schoolId: string | null) => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      schoolId: null,
      user: null,
      primaryRole: null,
      setSession: ({ accessToken, refreshToken, user }) => {
        const primaryRole = inferPrimaryRole(user);
        set({
          accessToken,
          refreshToken,
          user: { ...user, roles: user.roles ?? [] },
          schoolId: user.schoolId ?? null,
          primaryRole,
        });
      },
      setSchoolId: (schoolId) => set({ schoolId }),
      logout: async () => {
        await clearUiSessionCookie();
        set({
          accessToken: null,
          refreshToken: null,
          schoolId: null,
          user: null,
          primaryRole: null,
        });
      },
    }),
    {
      name: 'sms-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        schoolId: s.schoolId,
        user: s.user,
        primaryRole: s.primaryRole,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user && !state.primaryRole) {
          state.primaryRole = inferPrimaryRole(state.user);
        }
      },
    },
  ),
);
