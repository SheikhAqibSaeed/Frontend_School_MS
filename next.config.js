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

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return ADMIN_APP_MODULES.flatMap((segment) => [
      { source: `/admin/${segment}`, destination: `/dashboard/${segment}` },
      { source: `/admin/${segment}/:path*`, destination: `/dashboard/${segment}/:path*` },
    ]);
  },
};

module.exports = nextConfig;

