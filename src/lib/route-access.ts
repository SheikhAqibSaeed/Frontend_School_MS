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

/** Role home may be served under `/admin/principal` etc. after Next rewrites. */
function matchesRoleHome(pathname: string, role: UserRole): boolean {
  const home = ROLE_HOME[role];
  if (!home) return false;
  if (pathname === home || matchesPrefix(pathname, home)) return true;
  if (home !== '/admin') {
    const mirrored = `/admin${home}`;
    if (pathname === mirrored || matchesPrefix(pathname, mirrored)) return true;
  }
  return false;
}

function pathToModule(path: string): ModuleKey | 'overview' | null {
  if (path === '/admin' || path === '/admin/') return 'overview';
  for (const role of Object.keys(ROLE_HOME) as UserRole[]) {
    const home = ROLE_HOME[role];
    if (matchesPrefix(path, home)) return 'overview';
    if (home !== '/admin') {
      const mirrored = `/admin${home}`;
      if (matchesPrefix(path, mirrored)) return 'overview';
    }
  }
  for (const [key, segment] of Object.entries(MODULE_PATHS) as [ModuleKey, string][]) {
    if (!segment) continue;
    const prefix = `/admin/${segment}`;
    if (matchesPrefix(path, prefix)) return key;
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

  if (matchesRoleHome(pathname, role)) {
    return true;
  }

  if (path === '/admin' || path === '/admin/') {
    return role === 'SUPER_ADMIN';
  }

  if (moduleKey === 'overview') {
    return true;
  }

  if (moduleKey === null) {
    return true;
  }

  return ROLE_MODULES[role]?.includes(moduleKey) ?? false;
}
