// components/layout/SuperAdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';

const menuItems = [
  { 
    title: 'Dashboard', 
    href: '/super-admin', 
    icon: LayoutDashboard 
  },
  { 
    title: 'Restaurants', 
    href: '/super-admin/restaurants', 
    icon: Store 
  },
  { 
    title: 'Users (Admins)', 
    href: '/super-admin/users', 
    icon: Users 
  },
  { 
    title: 'Analytics', 
    href: '/super-admin/analytics', 
    icon: BarChart3 
  },
  { 
    title: 'Settings', 
    href: '/super-admin/settings', 
    icon: Settings 
  },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-tight">FoodHub</h1>
            <p className="text-xs text-gray-500 -mt-1">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
                           pathname.startsWith(item.href + '/');
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-orange-500 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}