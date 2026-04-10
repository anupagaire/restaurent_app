'use client';

import { ReactNode, useState } from 'react';
import AdminSidebar from '@/components/restaurant-admin/AdminSidebar';
import TopHeader from '@/components/restaurant-admin/TopHeader';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader 
          title="Restaurant Admin Dashboard" 
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}