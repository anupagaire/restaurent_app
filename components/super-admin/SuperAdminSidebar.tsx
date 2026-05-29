'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Settings,
  Contact,
  ClipboardList,
  CreditCard,Globe ,
  FileText,
  Tag,
  X
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { title: 'Users', href: '/super-admin/users', icon: Users },
  { title: 'Applications', href: '/super-admin/restaurant-applications', icon: ClipboardList },
  { title: 'Subscriptions', href: '/super-admin/payments', icon: CreditCard },
  { title: 'Invoices', href: '/super-admin/subscriptions/invoices', icon: FileText },
  { title: 'Plans', href: '/super-admin/subscriptions/plans', icon: CreditCard },
  { title: 'Promo Codes', href: '/super-admin/subscriptions/promo', icon: Tag },
  { title: 'Contact', href: '/super-admin/contact', icon: Contact },
    {
  title: 'Website Content',
  href: '/super-admin/website-content',
  icon: Globe
},
  { title: 'Settings', href: '/super-admin/settings', icon: Settings },
];

interface SuperAdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuperAdminSidebar({ isOpen, onClose }: SuperAdminSidebarProps) {
  const pathname = usePathname();

  // ✅ FIXED ACTIVE ROUTE LOGIC
  const isActive = (href: string) => {
    if (href === '/super-admin') {
      return pathname === '/super-admin';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "refresh_token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";

    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#513012]/10 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Header */}
        <div className="p-6 border-b border-[#513012]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#513012] to-[#5D0565] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 -mt-1">Super Admin Panel</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-2 text-[#513012] hover:bg-[#513012]/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all
                      ${active
                        ? 'bg-[#513012] text-white'
                        : 'text-gray-700 hover:bg-[#513012]/5 hover:text-[#513012]'
                      }
                    `}
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
        <div className="p-4 border-t border-[#513012]/10 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 w-full text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}