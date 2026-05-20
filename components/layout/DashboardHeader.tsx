'use client';

import {  LogOut, User, Menu, Link } from 'lucide-react';
import { useState } from 'react';
interface DashboardHeaderProps {
  title: string;
  onMenuClick?: () => void;   // For mobile sidebar toggle
}

export default function DashboardHeader({ 
  title, 
  onMenuClick 
}: DashboardHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
    <header className="bg-white border-b border-[#513012]/10 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
      
      <div className="flex items-center gap-4">
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

        {/* Profile Section */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:bg-[#513012]/5 p-1.5 pr-3 rounded-xl transition-colors"
          >
            
            
            {/* Profile Avatar */}
            <div className="w-9 h-9 bg-gradient-to-br from-[#513012] to-[#47034E] rounded-full flex items-center justify-center text-white font-medium border-2 border-white shadow-sm">
              SA
            </div>
          </button>

          {/* Profile Dropdown (Mobile + Desktop) */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#513012]/10 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-medium text-[#513012]">Super Admin</p>
              </div>
              
              <div className="py-1">
                <Link href="/settings" className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                  <User className="w-4 h-4 text-black" />
                  Profile Settings
                </button>
                </Link>
                 <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 w-full text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
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