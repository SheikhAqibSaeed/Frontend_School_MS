import type { UserRole } from '@/types/auth';
import {
  MODULE_PATHS,
  ROLE_HOME,
  ROLE_MODULES,
  SUPER_ADMIN_ONLY_MODULES,
  type ModuleKey,
} from '@/config/role-modules';

function normalizePath(pathname: string): string {
  let path = pathname;
  if (path.startsWith('/dashboard')) {
    path = path.replace(/^\/dashboard/, '/admin');
  }
  return path;
}

function matchesPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

function pathToModule(path: string): ModuleKey | 'overview' | null {
  if (path === '/admin' || path === '/admin/') return 'overview';
  for (const [key, segment] of Object.entries(MODULE_PATHS) as [ModuleKey, string][]) {
    if (!segment) continue;
    const prefix = `/admin/${segment}`;
    if (matchesPrefix(path, prefix)) return key;
  }
  for (const role of Object.keys(ROLE_HOME) as UserRole[]) {
    const home = ROLE_HOME[role];
    if (matchesPrefix(path, home)) return 'overview';
  }
  return null;
}

export function isSuperAdminOnlyPath(pathname: string): boolean {
  const mod = pathToModule(normalizePath(pathname));
  return mod !== null && SUPER_ADMIN_ONLY_MODULES.includes(mod as ModuleKey);
}

export function canAccessAdminPath(
  pathname: string,
  role: UserRole | null,
  isSuperAdmin: boolean,
): boolean {
  if (isSuperAdmin) return true;

  const path = normalizePath(pathname);
  const moduleKey = pathToModule(path);

  if (moduleKey && SUPER_ADMIN_ONLY_MODULES.includes(moduleKey as ModuleKey)) {
    return false;
  }

  if (!role) return false;

  const allowedHomes = Object.values(ROLE_HOME);
  if (allowedHomes.some((h) => matchesPrefix(pathname, h))) {
    return pathname === ROLE_HOME[role] || matchesPrefix(pathname, ROLE_HOME[role]);
  }

  if (moduleKey === 'overview' || moduleKey === null) {
    if (path === '/admin' || path === '/admin/') return role === 'SUPER_ADMIN';
    return true;
  }

  return ROLE_MODULES[role]?.includes(moduleKey) ?? false;
}
