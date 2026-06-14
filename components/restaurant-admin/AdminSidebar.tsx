'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Settings, 
  LogOut, 
  X,
  Menu as MenuIcon,
  QrCode,
  History,
  Star, 

} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permissionKey: null | 'viewOrders' | 'manageStaff' | 'menuSettings' | 'globalSettings';
}

const menuItems: MenuItem[] = [
  { 
    title: 'Dashboard', 
    href: '/restaurant-admin', 
    icon: LayoutDashboard,
    permissionKey: null,
  },
  { 
    title: 'Orders', 
    href: '/restaurant-admin/orders', 
    icon: Store,
    permissionKey: null,
  },

  { 
    title: 'Menu', 
    href: '/restaurant-admin/menu', 
    icon: MenuIcon,
    permissionKey: null, 
  },
  { 
    title: 'QR Codes', 
    href: '/restaurant-admin/menu/qr', 
    icon: QrCode,
    permissionKey: 'menuSettings', 
  },
  { 
    title: 'Staff', 
    href: '/restaurant-admin/staffs', 
    icon: Users,
    permissionKey: 'manageStaff', 
  },
  { 
    title: 'Gallery', 
    href: '/restaurant-admin/gallery', 
    icon: LayoutDashboard,
    permissionKey: null,
  },
  { 
    title: 'Reviews', 
    href: '/restaurant-admin/review', 
    icon: Star,
    permissionKey: null, 
  },
  { 
    title: 'Subscription History', 
    href: '/restaurant-admin/subscription/history', 
    icon: History,
    permissionKey: 'globalSettings', 
  },
 { 
    title: 'About Page', 
    href: '/restaurant-admin/about', 
    icon: MenuIcon,
    permissionKey: null, 
  },
  { 
    title: 'Service Page', 
    href: '/restaurant-admin/services', 
    icon: MenuIcon,
    permissionKey: null, 
  },
  { 
    title: 'Settings', 
    href: '/restaurant-admin/settings', 
    icon: Settings,
    permissionKey: 'globalSettings', 
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  const visibleMenuItems = menuItems.filter((item) => {
    // Always show items with no permission requirement
    if (item.permissionKey === null) return true;

    if (!currentUser) return false;

    // Admin/Owner sees everything
    const role = currentUser.role?.toLowerCase();
    if (role === 'owner' || role === 'admin') return true;

    // Staff — check specific permission
    return currentUser.permissions?.[item.permissionKey] === true;
  });

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}
    
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-secondary/10 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Logo */}
        <div className="p-6 border-b border-secondary/10 flex items-center justify-between">
          <Link href="/restaurant-admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-[#5D0565] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight text-secondary">ABC</h1>
              <p className="text-xs text-gray-500 -mt-1">
                {currentUser?.role || 'Restaurant Admin'}
              </p>
            </div>
          </Link>

          <button 
            onClick={onClose}
            className="md:hidden p-2 text-secondary hover:bg-secondary/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav */}
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
                          ? 'bg-secondary text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-secondary/5 hover:text-secondary'
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
                No accessible menu items
              </li>
            )}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-secondary/10 mt-auto">
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