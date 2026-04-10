// components/layout/DashboardHeader.tsx
'use client';

import { Bell, User } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b h-16 px-8 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>

      <div className="flex items-center gap-6">
        {/* Notification */}
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">Super Admin</p>
            <p className="text-xs text-gray-500">admin@foodhub.com</p>
          </div>
          <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
}