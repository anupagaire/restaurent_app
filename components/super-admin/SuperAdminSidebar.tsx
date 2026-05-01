'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  LogOut,Settings,
  X 
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { title: 'Users', href: '/super-admin/users', icon: Users },
  { title: 'Settings', href: '/super-admin/settings', icon: Settings }
];

interface SuperAdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuperAdminSidebar({ isOpen, onClose }: SuperAdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
  // Clear everything
  localStorage.clear();
  sessionStorage.clear();

  // Clear cookies
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

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}                   
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-[#513012] text-white' 
                        : 'text-gray-700 hover:bg-[#513012]/5 hover:text-[#513012]'
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