'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Settings, 
  LogOut,
  X 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  { 
    title: 'Dashboard', 
    href: '/restaurant-admin/dashboard', 
    icon: LayoutDashboard,
    permissionKey: null as const
  },
  { 
    title: 'Orders', 
    href: '/restaurant-admin/orders', 
    icon: Store,
    permissionKey: 'viewOrders' as const
  },
  { 
    title: 'Staff', 
    href: '/restaurant-admin/staffs', 
    icon: Users,
    permissionKey: 'manageStaff' as const
  },
  { 
    title: 'Settings', 
    href: '/restaurant-admin/settings', 
    icon: Settings,
    permissionKey: 'globalSettings' as const
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  // Filter logic with fallback for Owner/Admin
  const visibleMenuItems = menuItems.filter((item) => {
    if (item.permissionKey === null) return true;           // Dashboard always visible
    if (!currentUser) return false;

    // If user is Owner or Admin → show everything
    if (currentUser.role === 'Owner' || currentUser.role === 'Admin') {
      return true;
    }

    // Normal staff → check specific permission
    return currentUser.permissions?.[item.permissionKey] === true;
  });

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
              <span className="text-white text-xl font-bold">Y</span>
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight text-[#513012]">YOH</h1>
              <p className="text-xs text-gray-500 -mt-1">
                {currentUser?.role || 'Restaurant Admin'}
              </p>
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
            {visibleMenuItems.length > 0 ? (
              visibleMenuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}                   
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all
                        ${isActive 
                          ? 'bg-[#513012] text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-[#513012]/5 hover:text-[#513012]'
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.title}
                    </Link>
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-8 text-center text-gray-400 text-sm">
                No menu items available
              </li>
            )}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#513012]/10 mt-auto">
          <button 
            onClick={() => {
              console.log('Logging out...');
              window.location.href = '/login';
            }}
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