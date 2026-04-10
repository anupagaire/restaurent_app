// app/super-admin/layout.tsx
import { ReactNode } from 'react';
import SuperAdminSidebar from '@/components/layout/SuperAdminSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <DashboardHeader title="Super Admin Dashboard" />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}