'use client';

import { Bell, Menu, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TopHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function TopHeader({
  title,
  onMenuClick,
}: TopHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [restaurantName, setRestaurantName] =
    useState<string>('Loading...');
  const router = useRouter();

  useEffect(() => {
    const loadHeaderData = async () => {
      try {
        const token = localStorage.getItem('access_token');

        // User
        const userRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/me/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!userRes.ok) throw new Error('Failed to fetch user');

        const userData = await userRes.json();
        setUser(userData);

        // Restaurant
        if (userData?.restaurant) {
          try {
            const restRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/v1/restaurant/${userData.restaurant}/`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (restRes.ok) {
              const restaurant = await restRes.json();
              setRestaurantName(
                restaurant.name ||
                  `Restaurant #${userData.restaurant}`
              );
            } else {
              setRestaurantName(
                `Restaurant #${userData.restaurant}`
              );
            }
          } catch {
            setRestaurantName(
              `Restaurant #${userData.restaurant}`
            );
          }
        } else {
          setRestaurantName('No Restaurant');
        }
      } catch (err) {
        console.error('Header load failed:', err);
        setRestaurantName('Restaurant');
      }
    };

    loadHeaderData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie =
      'access_token=; path=/; max-age=0';

    router.push('/login');
  };

  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : user?.email?.split('@')[0] || 'Admin';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#513012]/10 px-3 sm:px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-3">

        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">

          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-[#513012]/5 flex-shrink-0"
            >
              <Menu className="w-6 h-6 text-[#513012]" />
            </button>
          )}

          <div className="min-w-0">
            <p className="text-sm sm:text-lg md:text-2xl font-bold text-black truncate">
              {restaurantName}
            </p>

            <h1 className="text-xs sm:text-sm md:text-lg text-[#513012] truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

          {/* Notification */}
          <button className="relative p-2 rounded-full hover:bg-[#513012]/5 transition-colors">
            <Bell className="w-5 h-5 text-[#513012]" />

            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          {/* Profile */}
          <div className="relative">

            <button
              onClick={() =>
                setShowProfileMenu(!showProfileMenu)
              }
              className="flex items-center gap-2 sm:gap-3 rounded-xl p-1.5 sm:pr-3 hover:bg-[#513012]/5 transition-colors"
            >
              {/* TEXT */}
              <div className="hidden md:block text-right max-w-[140px]">
                <p className="text-sm font-medium text-[#513012] truncate">
                  {displayName}
                </p>

                <p className="text-xs text-gray-500 truncate">
                  {restaurantName}
                </p>
              </div>

              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#513012] to-[#47034E] flex items-center justify-center text-white text-sm font-semibold border-2 border-white">
                {getInitials(displayName)}
              </div>
            </button>

            {/* DROPDOWN */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-[260px] sm:w-72 bg-white rounded-xl shadow-xl border border-[#513012]/10 py-2 z-50">

                <div className="px-4 py-3 border-b">
                  <p className="font-semibold text-[#513012] truncate">
                    {displayName}
                  </p>

                  <p className="text-sm text-gray-500 truncate">
                    {user?.email}
                  </p>

                  <p className="text-xs text-[#513012] mt-1 truncate">
                    {restaurantName}
                  </p>
                </div>

                <div className="py-1">
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
      </div>
    </header>
  );
}