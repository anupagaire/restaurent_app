'use client';

import { Bell, User, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface TopHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function TopHeader({ 
  title, 
  onMenuClick 
}: TopHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Fallback if somehow no user
  const displayName = currentUser?.name || "Restaurant Admin";
  const displayEmail = currentUser?.email || "admin@yoh.com";   

  // Initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-[#513012]/10 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
      
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-[#513012] hover:bg-[#513012]/5 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        <h1 className="text-xl md:text-2xl font-semibold text-[#513012] truncate">
          {title}
        </h1>
      </div>

      {/* Right Side - Notifications + Profile */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* Notification Bell */}
        <button className="relative p-2 hover:bg-[#513012]/5 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-[#513012]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#5D0565] rounded-full ring-2 ring-white"></span>
        </button>

        {/* Profile Section */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:bg-[#513012]/5 p-1.5 pr-3 rounded-xl transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-[#513012]">{displayName}</p>
              <p className="text-xs text-gray-500">{displayEmail}</p>
            </div>
            
            {/* Profile Avatar */}
            <div className="w-9 h-9 bg-gradient-to-br from-[#513012] to-[#47034E] rounded-full flex items-center justify-center text-white font-medium border-2 border-white shadow-sm">
              {getInitials(displayName)}
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#513012]/10 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-[#513012]">{displayName}</p>
                <p className="text-sm text-gray-500">{displayEmail}</p>
                <p className="text-xs text-gray-400 mt-1">{currentUser?.role}</p>
              </div>
              
              <div className="py-1">
                <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                  <User className="w-4 h-4" />
                  Profile Settings
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}