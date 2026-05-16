/** @type {import('next').NextConfig} */
const ADMIN_APP_MODULES = [
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
];

const ROLE_HOME_PAGES = ['principal', 'teacher', 'student', 'accountant', 'librarian', 'transport'];

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    const moduleRewrites = ADMIN_APP_MODULES.flatMap((segment) => [
      { source: `/admin/${segment}`, destination: `/dashboard/${segment}` },
      { source: `/admin/${segment}/:path*`, destination: `/dashboard/${segment}/:path*` },
    ]);

    const roleHomeRewrites = ROLE_HOME_PAGES.map((role) => ({
      source: `/${role}`,
      destination: `/admin/${role}`,
    }));

    const roleHomeNested = ROLE_HOME_PAGES.map((role) => ({
      source: `/${role}/:path*`,
      destination: `/admin/${role}/:path*`,
    }));

    return [...moduleRewrites, ...roleHomeRewrites, ...roleHomeNested];
  },
};

module.exports = nextConfig;
