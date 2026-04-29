'use client';

import { useEffect, useState } from 'react';

export default function RestaurantAdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/me/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#513012] mb-2">
          Welcome back, {user?.first_name || "Admin"}!
        </h1>
        
        <p className="text-gray-600 text-lg">
          {user?.email}
        </p>

        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}

        {/* You can add menu management section here later */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Restaurant Management</h2>
          <p className="text-gray-500">Menu and Category features coming soon...</p>
        </div>
      </div>
    </div>
  );
}