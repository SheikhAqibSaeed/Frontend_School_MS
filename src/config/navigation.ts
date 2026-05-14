import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  FileText,
  Library,
  Bus,
  Megaphone,
  Settings,
  ClipboardList,
  Layers,
  BookMarked,
  Award,
  BarChart3,
  Clock,
  Receipt,
  CreditCard,
  UserCog,
  Shield,
  KeyRound,
} from 'lucide-react';
import type { UserRole } from '@/types/auth';
import { userHasAnyPermission } from '@/lib/nav-access';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** If set, only these roles see the item (unless super admin). */
  roles?: UserRole[];
  /**
   * If set, user must have `*` or at least one of these API permission codes to see the item.
   * Codes match Nest `@Permissions('…')` and Prisma seed (`resource.action`).
   * Admins customize the sidebar via Dashboard → Roles → Permissions.
   * If `permissions` is missing on the session (`undefined`/`null`), `userHasAnyPermission` allows through
   * (legacy). An empty array still denies gated items until at least one code matches.
   * When JWT has only `['*']`, all gated items are shown; when `*` appears with other codes, a
   * concrete code must match each item’s `requiredAnyPermission` (wildcard does not imply every module).
   */
  requiredAnyPermission?: string[];
};

const allStudents: NavItem = {
  title: 'Students',
  href: '/admin/students',
  icon: GraduationCap,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'RECEPTIONIST'],
  requiredAnyPermission: ['student.read'],
};
const allTeachers: NavItem = {
  title: 'Teachers',
  href: '/admin/teachers',
  icon: Users,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'RECEPTIONIST'],
  requiredAnyPermission: ['teacher.read'],
};
const classes: NavItem = {
  title: 'Classes',
  href: '/admin/classes',
  icon: BookOpen,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'],
  requiredAnyPermission: ['class.read'],
};
const sections: NavItem = {
  title: 'Sections',
  href: '/admin/sections',
  icon: Layers,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'],
  requiredAnyPermission: ['section.read'],
};
const subjects: NavItem = {
  title: 'Subjects',
  href: '/admin/subjects',
  icon: BookMarked,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'],
  requiredAnyPermission: ['subject.read'],
};
const attendance: NavItem = {
  title: 'Attendance',
  href: '/admin/attendance',
  icon: Calendar,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'RECEPTIONIST'],
  requiredAnyPermission: ['attendance.read'],
};
const exams: NavItem = {
  title: 'Exams',
  href: '/admin/exams',
  icon: FileText,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'],
  requiredAnyPermission: ['exam.read'],
};
const marks: NavItem = {
  title: 'Marks entry',
  href: '/admin/marks',
  icon: Award,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'],
  requiredAnyPermission: ['mark.read'],
};
const results: NavItem = {
  title: 'Results',
  href: '/admin/results',
  icon: BarChart3,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'],
  requiredAnyPermission: ['result.read', 'mark.read', 'exam.read'],
};
const fees: NavItem = {
  title: 'Fees',
  href: '/admin/fees',
  icon: DollarSign,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'],
  requiredAnyPermission: ['fee.read'],
};
const invoices: NavItem = {
  title: 'Invoices',
  href: '/admin/invoices',
  icon: Receipt,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'],
  requiredAnyPermission: ['invoice.read'],
};
const payments: NavItem = {
  title: 'Payments',
  href: '/admin/payments',
  icon: CreditCard,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'],
  requiredAnyPermission: ['payment.read'],
};
const timetable: NavItem = {
  title: 'Timetable',
  href: '/admin/timetable',
  icon: Clock,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'],
  requiredAnyPermission: ['timetable.read'],
};
const homework: NavItem = {
  title: 'Homework',
  href: '/admin/homework',
  icon: ClipboardList,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'],
  requiredAnyPermission: ['homework.read'],
};
const announcements: NavItem = {
  title: 'Announcements',
  href: '/admin/announcements',
  icon: Megaphone,
  roles: [
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'TEACHER',
    'STUDENT',
    'RECEPTIONIST',
    'ACCOUNTANT',
    'LIBRARIAN',
    'TRANSPORT_MANAGER',
  ],
  requiredAnyPermission: ['announcement.read'],
};
const reports: NavItem = {
  title: 'Reports',
  href: '/admin/reports',
  icon: BarChart3,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'],
  requiredAnyPermission: ['report.read'],
};
const library: NavItem = {
  title: 'Library',
  href: '/admin/library',
  icon: Library,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'LIBRARIAN'],
  requiredAnyPermission: ['library.read'],
};
const transport: NavItem = {
  title: 'Transport',
  href: '/admin/transport',
  icon: Bus,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TRANSPORT_MANAGER'],
  requiredAnyPermission: ['transport.read'],
};
const schoolUsers: NavItem = {
  title: 'School users',
  href: '/admin/users',
  icon: UserCog,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  requiredAnyPermission: ['user.read'],
};
const rolesNav: NavItem = {
  title: 'Roles',
  href: '/admin/roles',
  icon: Shield,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  requiredAnyPermission: ['role.read'],
};
const permissionsNav: NavItem = {
  title: 'Permissions',
  href: '/admin/permissions',
  icon: KeyRound,
  roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  requiredAnyPermission: ['permission.read'],
};
const settings: NavItem = {
  title: 'Settings',
  href: '/admin/settings',
  icon: Settings,
  requiredAnyPermission: ['setting.read'],
};

export function dashboardHrefForRole(role: UserRole | null): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin';
    case 'SCHOOL_ADMIN':
    case 'RECEPTIONIST':
    case 'LIBRARIAN':
    case 'TRANSPORT_MANAGER':
      return '/admin/school-admin';
    case 'TEACHER':
      return '/admin/teacher';
    case 'STUDENT':
      return '/admin/student';
    case 'ACCOUNTANT':
      return '/admin/accountant';
    default:
      return '/admin/school-admin';
  }
}

const navPool = (role: UserRole | null): NavItem[] => {
  const home: NavItem = {
    title: 'Overview',
    href: dashboardHrefForRole(role),
    icon: LayoutDashboard,
  };
  return [
    home,
    allStudents,
    allTeachers,
    classes,
    sections,
    subjects,
    attendance,
    exams,
    marks,
    results,
    fees,
    invoices,
    payments,
    timetable,
    homework,
    announcements,
    reports,
    library,
    transport,
    schoolUsers,
    rolesNav,
    permissionsNav,
    settings,
  ];
};

/**
 * Sidebar items for the signed-in user: role gates + optional permission gates.
 * Super admin sees the full pool. School admins customize staff menus via Roles → permissions.
 */
export function navItemsForSession(role: UserRole | null, permissions?: string[] | null): NavItem[] {
  const pool = navPool(role);
  return pool.filter((item) => {
    if (role === 'SUPER_ADMIN') return true;

    if (item.roles?.length) {
      if (!role || !item.roles.includes(role)) return false;
    }

    if (item.requiredAnyPermission?.length) {
      if (!userHasAnyPermission(permissions, item.requiredAnyPermission)) return false;
    }

    return true;
  });
}

/** @deprecated Prefer `navItemsForSession(role, permissions)` so the menu respects RBAC. */
export function navItemsForRole(role: UserRole | null): NavItem[] {
  return navItemsForSession(role, undefined);
}
