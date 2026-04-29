'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Settings, 
  LogOut,
  X 
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  // { title: 'Restaurants', href: '/super-admin/restaurants', icon: Store },
  { title: 'Users ', href: '/super-admin/users', icon: Users },
];

interface SuperAdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuperAdminSidebar({ isOpen, onClose }: SuperAdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Simple Frontend Logout (No API needed)
  const handleLogout = () => {
    // Clear any authentication data stored in browser
    localStorage.removeItem('superadmin-token');     // if you're using localStorage
    sessionStorage.removeItem('superadmin-token');   // if you're using sessionStorage

    // Optional: Clear all auth-related items
    // localStorage.clear();   // Use only if you want to clear everything

    // Redirect to login page
    router.push('/superadmin-login');
    
    // Optional: Force a full page reload to clear any cached state
    // router.refresh();
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

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#513012]/10 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        <div className="p-6 border-b border-[#513012]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#513012] to-[#5D0565] rounded-xl flex items-center justify-center">
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight text-[#513012]">Food</h1>
              <p className="text-xs text-gray-500 -mt-1">Super Admin</p>
            </div>
          </div>

          {/* Close Button - Mobile Only */}
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
            className="flex items-center gap-3 px-4 py-3.5 w-full text-[#47034E] hover:bg-[#47034E]/5 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}