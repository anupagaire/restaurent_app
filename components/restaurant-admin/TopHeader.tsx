'use client';

import { Bell, User, Menu, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [user, setUser] = useState<any>(null);
  const [restaurantName, setRestaurantName] = useState<string>("Loading...");
  const router = useRouter();

  useEffect(() => {
    const loadHeaderData = async () => {
      try {
        // 1. Get User Info
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/me/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (!userRes.ok) throw new Error("Failed to fetch user");

        const userData = await userRes.json();
        setUser(userData);

        // 2. Get Restaurant Name
        if (userData?.restaurant) {
          try {
            const restRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/v1/restaurant/${userData.restaurant}/`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
              }
            );

            if (restRes.ok) {
              const restaurant = await restRes.json();
              setRestaurantName(restaurant.name || `Restaurant #${userData.restaurant}`);
            } else {
              setRestaurantName(`Restaurant #${userData.restaurant}`);
            }
          } catch (err) {
            setRestaurantName(`Restaurant #${userData.restaurant}`);
          }
        } else {
          setRestaurantName("No Restaurant");
        }
      } catch (err) {
        console.error("Header data load failed:", err);
        setRestaurantName("Restaurant");
      }
    };

    loadHeaderData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "access_token=; path=/; max-age=0";
    router.push('/login');
  };

  const displayName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`.trim() 
    : user?.email?.split('@')[0] || "Admin";

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

        <div>
         
          {restaurantName && restaurantName !== "Loading..." && (
            <p className="text-2xl text-black font-bold">{restaurantName}</p>
          )}
           <h1 className="text-lg text-[#513012]">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4 md:gap-6">
        <button className="relative p-2 hover:bg-[#513012]/5 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-[#513012]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:bg-[#513012]/5 p-1.5 pr-3 rounded-xl transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-[#513012]">{displayName}</p>
              <p className="text-xs text-gray-500">{restaurantName}</p>
            </div>
            
            <div className="w-9 h-9 bg-gradient-to-br from-[#513012] to-[#47034E] rounded-full flex items-center justify-center text-white font-medium border-2 border-white">
              {getInitials(displayName)}
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#513012]/10 py-2 z-50">
              <div className="px-4 py-3 border-b">
                <p className="font-semibold text-[#513012]">{displayName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs text-[#513012] mt-1">{restaurantName}</p>
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
    </header>
  );
}