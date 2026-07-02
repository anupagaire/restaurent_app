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
  Globe,
  Star,
  Image,
  FileText,
  Award,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permissionKey: null | 'viewOrders' | 'manageStaff' | 'menuSettings' | 'globalSettings';
  exact?: boolean;
}

const menuItems: MenuItem[] = [
  { 
    title: 'Dashboard', 
    href: '/restaurant-admin', 
    icon: LayoutDashboard,
    permissionKey: null,
    exact: true, // Only active when exactly on this path
  },
  { 
    title: 'Orders', 
    href: '/restaurant-admin/orders', 
    icon: Store,
    permissionKey: null,
  },
  { 
    title: 'Hero Slider', 
    href: '/restaurant-admin/heroslider', 
    icon: Image,
    permissionKey: null,
  },
  { 
    title: 'Menu Management', 
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
    title: 'Staff Management', 
    href: '/restaurant-admin/staffs', 
    icon: Users,
    permissionKey: 'manageStaff',
  },
  { 
    title: 'Gallery', 
    href: '/restaurant-admin/gallery', 
    icon: Image,
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
    icon: FileText,
    permissionKey: null,
  },
  { 
    title: 'Service Page', 
    href: '/restaurant-admin/services', 
    icon: FileText,
    permissionKey: null,
  },
  { 
    title: 'Custom Domain', 
    href: '/restaurant-admin/custom-domain', 
    icon: Globe,
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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.permissionKey === null) return true;
    if (!currentUser) return false;
    const role = currentUser.role?.toLowerCase();
    if (role === 'owner' || role === 'admin') return true;
    return currentUser.permissions?.[item.permissionKey] === true;
  });

  const handleLogout = async () => {
    await logout();
  };

  // Group menu items into sections
  const groupedItems = {
    main: visibleMenuItems.filter(item => 
      ['/restaurant-admin', '/restaurant-admin/orders', '/restaurant-admin/heroslider', '/restaurant-admin/menu'].includes(item.href)
    ),
    management: visibleMenuItems.filter(item => 
      ['/restaurant-admin/menu/qr', '/restaurant-admin/staffs', '/restaurant-admin/gallery', '/restaurant-admin/review'].includes(item.href)
    ),
    settings: visibleMenuItems.filter(item => 
      ['/restaurant-admin/subscription/history', '/restaurant-admin/about', '/restaurant-admin/services', '/restaurant-admin/custom-domain', '/restaurant-admin/settings'].includes(item.href)
    ),
  };

  const isItemActive = (item: MenuItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    // For non-exact items, check if path starts with the href
    // But only if it's not the dashboard path
    if (item.href === '/restaurant-admin') {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
    
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-white to-gray-50 
        border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
        shadow-xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Logo Section - Enhanced */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white">
          <Link href="/restaurant-admin" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
              <span className="text-white font-bold text-2xl tracking-tight">R</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary tracking-tight">Restaurant</h2>
              <p className="text-xs text-primary/70 -mt-0.5 font-medium">
                {currentUser?.role || 'Admin Panel'}
              </p>
            </div>
          </Link>

          <button 
            onClick={onClose}
            className="md:hidden p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Enhanced */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Main Section */}
            {groupedItems.main.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-wider px-4 mb-2">
                  Main Menu
                </p>
                <ul className="space-y-1">
                  {groupedItems.main.map((item) => {
                    const isActive = isItemActive(item);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                            ${isActive 
                              ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                              : 'text-gray-600 hover:bg-primary/5 hover:text-primary hover:translate-x-1'
                            }`}
                        >
                          <item.icon className={`w-5 h-5 transition-all ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
                          <span>{item.title}</span>
                          {isActive && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Management Section */}
            {groupedItems.management.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-wider px-4 mb-2">
                  Management
                </p>
                <ul className="space-y-1">
                  {groupedItems.management.map((item) => {
                    const isActive = isItemActive(item);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                            ${isActive 
                              ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                              : 'text-gray-600 hover:bg-primary/5 hover:text-primary hover:translate-x-1'
                            }`}
                        >
                          <item.icon className={`w-5 h-5 transition-all ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
                          <span>{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Settings Section */}
            {groupedItems.settings.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-wider px-4 mb-2">
                  Settings & More
                </p>
                <ul className="space-y-1">
                  {groupedItems.settings.map((item) => {
                    const isActive = isItemActive(item);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                            ${isActive 
                              ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                              : 'text-gray-600 hover:bg-primary/5 hover:text-primary hover:translate-x-1'
                            }`}
                        >
                          <item.icon className={`w-5 h-5 transition-all ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
                          <span>{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </nav>

        {/* User Info & Logout - Enhanced */}
        <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          {currentUser && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/5 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-sm">
                {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary truncate">
                  {currentUser.name || 'User'}
                </p>
                <p className="text-xs text-primary/60 truncate">
                  {currentUser.email || 'user@restaurant.com'}
                </p>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>Logout</span>
            <span className="ml-auto text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              ↲
            </span>
          </button>
        </div>
      </div>
    </>
  );
}