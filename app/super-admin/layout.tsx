'use client';

import { ReactNode, useState } from 'react';
import SuperAdminSidebar from '@/components/layout/SuperAdminSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SuperAdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          title="Super Admin Dashboard" 
          onMenuClick={() => setSidebarOpen(true)} 
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}