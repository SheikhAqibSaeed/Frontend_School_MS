import type { UserRole } from '@/types/auth';

/** Canonical module path segments (under /admin or /dashboard). */
export const MODULE_PATHS = {
  schools: 'schools',
  students: 'students',
  teachers: 'teachers',
  classes: 'classes',
  sections: 'sections',
  subjects: 'subjects',
  attendance: 'attendance',
  exams: 'exams',
  marks: 'marks',
  results: 'results',
  fees: 'fees',
  invoices: 'invoices',
  payments: 'payments',
  timetable: 'timetable',
  homework: 'homework',
  announcements: 'announcements',
  reports: 'reports',
  library: 'library',
  transport: 'transport',
  users: 'users',
  roles: 'roles',
  permissions: 'permissions',
  settings: 'settings',
} as const;

export type ModuleKey = keyof typeof MODULE_PATHS;

/** Default landing route per role (spec). */
export const ROLE_HOME: Record<UserRole, string> = {
  SUPER_ADMIN: '/admin',
  PRINCIPAL: '/principal',
  TEACHER: '/teacher',
  STUDENT: '/student',
  ACCOUNTANT: '/accountant',
  LIBRARIAN: '/librarian',
  TRANSPORT_MANAGER: '/transport',
};

/** Modules each role may see (deduped). Super admin uses all keys except empty overview. */
export const ROLE_MODULES: Record<UserRole, ModuleKey[]> = {
  SUPER_ADMIN: [
    'schools',
    'students',
    'teachers',
    'classes',
    'sections',
    'subjects',
    'attendance',
    'exams',
    'marks',
    'results',
    'fees',
    'invoices',
    'payments',
    'timetable',
    'homework',
    'announcements',
    'reports',
    'library',
    'transport',
    'users',
    'roles',
    'permissions',
    'settings',
  ],
  PRINCIPAL: [
    'students',
    'teachers',
    'classes',
    'sections',
    'subjects',
    'attendance',
    'exams',
    'marks',
    'results',
    'fees',
    'invoices',
    'payments',
    'timetable',
    'homework',
    'announcements',
    'reports',
    'library',
    'transport',
    'users',
    'settings',
  ],
  TEACHER: [
    'classes',
    'attendance',
    'marks',
    'homework',
    'timetable',
    'exams',
    'results',
    'announcements',
  ],
  STUDENT: [
    'attendance',
    'timetable',
    'homework',
    'exams',
    'results',
    'fees',
    'library',
    'transport',
    'announcements',
  ],
  ACCOUNTANT: ['fees', 'invoices', 'payments', 'reports'],
  LIBRARIAN: ['library', 'students', 'reports'],
  TRANSPORT_MANAGER: ['transport', 'students', 'reports'],
};

/** Super-admin-only modules. */
export const SUPER_ADMIN_ONLY_MODULES: ModuleKey[] = ['schools', 'roles', 'permissions'];

export function moduleToAdminHref(module: ModuleKey): string {
  const segment = MODULE_PATHS[module];
  return segment ? `/admin/${segment}` : '/admin';
}

export function roleCanAccessModule(role: UserRole | null, module: ModuleKey, isSuperAdmin: boolean): boolean {
  if (isSuperAdmin) return true;
  if (!role) return false;
  if (SUPER_ADMIN_ONLY_MODULES.includes(module)) return false;
  return ROLE_MODULES[role]?.includes(module) ?? false;
}
