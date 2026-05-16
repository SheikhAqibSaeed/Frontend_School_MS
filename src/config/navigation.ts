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
  Building2,
} from 'lucide-react';
import type { UserRole } from '@/types/auth';
import { userHasAnyPermission } from '@/lib/nav-access';
import {
  MODULE_PATHS,
  ROLE_HOME,
  ROLE_MODULES,
  SUPER_ADMIN_ONLY_MODULES,
  moduleToAdminHref,
  type ModuleKey,
} from '@/config/role-modules';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  module: ModuleKey | 'overview';
  requiredAnyPermission?: string[];
};

const MODULE_META: Record<ModuleKey, { title: string; icon: LucideIcon; permission: string[] }> = {
  schools: { title: 'Schools', icon: Building2, permission: ['school.read'] },
  students: { title: 'Students', icon: GraduationCap, permission: ['student.read'] },
  teachers: { title: 'Teachers', icon: Users, permission: ['teacher.read'] },
  classes: { title: 'Classes', icon: BookOpen, permission: ['class.read'] },
  sections: { title: 'Sections', icon: Layers, permission: ['section.read'] },
  subjects: { title: 'Subjects', icon: BookMarked, permission: ['subject.read'] },
  attendance: { title: 'Attendance', icon: Calendar, permission: ['attendance.read'] },
  exams: { title: 'Exams', icon: FileText, permission: ['exam.read'] },
  marks: { title: 'Marks entry', icon: Award, permission: ['mark.read'] },
  results: { title: 'Results', icon: BarChart3, permission: ['result.read', 'mark.read', 'exam.read'] },
  fees: { title: 'Fees', icon: DollarSign, permission: ['fee.read'] },
  invoices: { title: 'Invoices', icon: Receipt, permission: ['invoice.read'] },
  payments: { title: 'Payments', icon: CreditCard, permission: ['payment.read'] },
  timetable: { title: 'Timetable', icon: Clock, permission: ['timetable.read'] },
  homework: { title: 'Homework', icon: ClipboardList, permission: ['homework.read'] },
  announcements: { title: 'Announcements', icon: Megaphone, permission: ['announcement.read'] },
  reports: { title: 'Reports', icon: BarChart3, permission: ['report.read'] },
  library: { title: 'Library', icon: Library, permission: ['library.read'] },
  transport: { title: 'Transport', icon: Bus, permission: ['transport.read'] },
  users: { title: 'School users', icon: UserCog, permission: ['user.read'] },
  roles: { title: 'Roles', icon: Shield, permission: ['role.read'] },
  permissions: { title: 'Permissions', icon: KeyRound, permission: ['permission.read'] },
  settings: { title: 'Settings', icon: Settings, permission: ['setting.read'] },
};

function overviewTitle(role: UserRole | null): string {
  if (role === 'TEACHER') return 'My Dashboard';
  if (role === 'STUDENT') return 'My Dashboard';
  if (role === 'ACCOUNTANT') return 'Finance Dashboard';
  return 'Overview';
}

function moduleTitle(module: ModuleKey, role: UserRole | null): string {
  if (role === 'TEACHER' && module === 'classes') return 'My Classes';
  return MODULE_META[module].title;
}

export function dashboardHrefForRole(role: UserRole | null): string {
  if (!role) return '/principal';
  return ROLE_HOME[role] ?? '/principal';
}

export function navItemsForSession(role: UserRole | null, permissions?: string[] | null): NavItem[] {
  if (!role) return [];

  const home: NavItem = {
    title: overviewTitle(role),
    href: dashboardHrefForRole(role),
    icon: LayoutDashboard,
    module: 'overview',
  };

  const allowedModules =
    role === 'SUPER_ADMIN'
      ? ([...ROLE_MODULES.SUPER_ADMIN] as ModuleKey[])
      : (ROLE_MODULES[role] ?? []);

  const seen = new Set<string>();
  const items: NavItem[] = [home];

  for (const moduleKey of allowedModules) {
    const href = moduleToAdminHref(moduleKey);
    if (seen.has(href)) continue;
    seen.add(href);

    const meta = MODULE_META[moduleKey];
    if (
      role !== 'SUPER_ADMIN' &&
      SUPER_ADMIN_ONLY_MODULES.includes(moduleKey) &&
      !permissions?.includes('*')
    ) {
      continue;
    }

    if (meta.permission.length && !userHasAnyPermission(permissions, meta.permission)) {
      continue;
    }

    items.push({
      title: moduleTitle(moduleKey, role),
      href,
      icon: meta.icon,
      module: moduleKey,
      requiredAnyPermission: meta.permission,
    });
  }

  return items;
}

/** @deprecated Prefer `navItemsForSession(role, permissions)`. */
export function navItemsForRole(role: UserRole | null): NavItem[] {
  return navItemsForSession(role, undefined);
}
