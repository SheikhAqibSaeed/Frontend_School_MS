'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
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
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/students', label: 'Students', icon: GraduationCap },
  { href: '/dashboard/teachers', label: 'Teachers', icon: Users },
  { href: '/dashboard/classes', label: 'Classes', icon: BookOpen },
  { href: '/dashboard/attendance', label: 'Attendance', icon: Calendar },
  { href: '/dashboard/fees', label: 'Fees', icon: DollarSign },
  { href: '/dashboard/exams', label: 'Exams', icon: FileText },
  { href: '/dashboard/library', label: 'Library', icon: Library },
  { href: '/dashboard/transport', label: 'Transport', icon: Bus },
  { href: '/dashboard/announcements', label: 'Announcements', icon: MessageSquare },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    // Clear authentication token and user data
    logout();
    // Redirect to login page
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">SchoolMS</h2>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}

