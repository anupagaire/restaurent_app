'use client';

import {Menu, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
interface TopHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function TopHeader({ title, onMenuClick }: TopHeaderProps) {
  const { logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string>('Loading...');
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const load = async () => {
      try {
        // const token = localStorage.getItem('access_token');
        const res = await apiFetch('/api/v1/user/me/');
if (!res.ok) throw new Error('Failed');
const raw = await res.json();
const data = raw.data ?? raw;
setUser(data);

if (data?.restaurant) {
  try {
    const rRes = await apiFetch(`/api/v1/restaurant/${data.restaurant}/`);
    if (rRes.ok) {
      const r = await rRes.json();
      const rData = r.data ?? r;
      setRestaurantName(rData.name || `Restaurant #${data.restaurant}`);
    } else {
      setRestaurantName(`Restaurant #${data.restaurant}`);
    }
  } catch {
    setRestaurantName(`Restaurant #${data.restaurant}`);
  }
} else {
  setRestaurantName('No Restaurant');
}
      } catch {
        setRestaurantName('Restaurant');
      }
    };
    load();
  }, []);

  const displayName =
    user?.first_name
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : user?.email?.split('@')[0] || 'Admin';

  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-secondary/10 px-3 sm:px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-3">

        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-secondary/5 flex-shrink-0"
            >
              <Menu className="w-6 h-6 text-secondary" />
            </button>
          )}
          <div className="min-w-0">
            <p className="text-sm sm:text-lg md:text-2xl font-bold text-secondary truncate">
              {restaurantName}
            </p>
            <h1 className="text-xs sm:text-sm md:text-base text-secondary truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(p => !p)}
              className="flex items-center gap-2 rounded-xl p-1.5 sm:pr-3 hover:bg-secondary/5 transition-colors"
            >
              <div className="hidden md:block text-right max-w-[140px]">
                <p className="text-sm font-semibold text-secondary truncate">{displayName}</p>
                <p className="text-xs text-secondary truncate">{restaurantName}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-sm">
                {initials}
              </div>
              <ChevronDown className="hidden md:block w-4 h-4 text-secondary" />
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-secondary/10 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white text-sm font-bold">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-secondary truncate">{displayName}</p>
                        <p className="text-xs text-secondary truncate">{user?.email}</p>
                        <p className="text-xs text-accent truncate mt-0.5">{restaurantName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1 px-2">
                    <button
                      onClick={() => { setShowProfileMenu(false); logout(); }}
                      className="w-full px-3 py-2.5 text-left text-sm rounded-xl hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
