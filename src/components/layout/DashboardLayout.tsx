import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SuperAdminSchoolBootstrap } from './SuperAdminSchoolBootstrap';
import { RouteGuard } from '@/components/common/RouteGuard';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <SuperAdminSchoolBootstrap />
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <RouteGuard>{children}</RouteGuard>
        </main>
      </div>
    </div>
  );
}

