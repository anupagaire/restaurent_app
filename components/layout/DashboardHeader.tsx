'use client';

import { LogOut, User, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface DashboardHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function DashboardHeader({ title, onMenuClick }: DashboardHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "refresh_token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";

    window.location.href = "/login";
  };

  // ✅ CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <header className="bg-white border-b border-[#513012]/10 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">

      {/* Left side */}
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

      {/* Right side */}
      <div className="flex items-center gap-4 md:gap-6">

        {/* Profile */}
        <div className="relative" ref={menuRef}>

          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:bg-[#513012]/5 p-1.5 pr-3 rounded-xl transition-colors"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[#513012] to-[#47034E] rounded-full flex items-center justify-center text-white font-medium border-2 border-white shadow-sm">
              SA
            </div>
          </button>

          {/* Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#513012]/10 py-2 z-50">

              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="font-medium text-[#513012]">Super Admin</p>

                {/* Close button */}
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="p-1 hover:bg-gray-100 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Menu */}
              <div className="py-1">

                {/* Profile Settings */}
                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-black"
                >
                  <User className="w-4 h-4 text-black" />
                  Profile Settings
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
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