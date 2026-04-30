'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, QrCode, Settings, Menu, Eye, RefreshCw } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import MenuModal from '@/components/restaurant-admin/MenuModal';
import { apiFetch } from '@/lib/api';

interface MenuItem {
  id: number;
  name: string;
  price: string;
  category_name?: string;
  status: boolean;
  image?: string;
}

interface Category {
  id: number;
  name: string;
}

export default function RestaurantAdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Menu Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Fetch User
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
      }
    };

    loadUser();
  }, []);

  // Fetch Restaurant + Menu + Categories
  const fetchDashboardData = async (restaurantId: number) => {
    try {
      setLoading(true);
      const [restRes, menuRes, catRes] = await Promise.all([
        apiFetch(`/api/v1/restaurant/${restaurantId}/`),
        apiFetch(`/api/v1/menu/?restaurant=${restaurantId}&limit=6`), // recent 6 items
        apiFetch(`/api/v1/category/?restaurant=${restaurantId}`),
      ]);

      const restData = await restRes.json();
      const menuData = await menuRes.json();
      const catData = await catRes.json();

      setRestaurant(restData);
      setMenuItems(Array.isArray(menuData) ? menuData : menuData.results || []);
      setCategories(Array.isArray(catData) ? catData : catData.results || []);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.restaurant) {
      fetchDashboardData(user.restaurant);
    }
  }, [user]);

  const activeMenuItems = menuItems.filter(item => item.status).length;

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleMenuSubmit = async (payload: any, selectedFile: File | null) => {
    // MenuPage ma jasto handleMenuSubmit cha, tyo logic yaha pani copy garna sakinchha
    // Simple version: refresh after submit
    if (user?.restaurant) {
      await fetchDashboardData(user.restaurant);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#513012]" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-bold text-[#513012]">
            Welcome back, {user?.first_name || "Admin"}!
          </h1>
          <p className="text-gray-600 text-lg mt-1">
            {restaurant?.name || "Manage your restaurant efficiently"}
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/restaurant-admin/menu">
              <Menu className="mr-2 h-4 w-4" /> Manage Full Menu
            </Link>
          </Button>
          <Button asChild className="bg-[#513012]">
            <Link href="/restaurant-admin/menu/qr">
              <QrCode className="mr-2 h-4 w-4" /> QR Generator
            </Link>
          </Button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-6">{error}</p>}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{menuItems.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Active Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{activeMenuItems}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{categories.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold truncate">{restaurant?.name || '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={handleAddNew} 
            className="h-20 flex-col bg-[#513012] hover:bg-[#513012]/90"
          >
            <Plus className="h-6 w-6 mb-1" />
            Add New Item
          </Button>

          <Button asChild variant="outline" className="h-20 flex-col">
            <Link href="/restaurant-admin/settings">
              <Settings className="h-6 w-6 mb-1" />
              Restaurant Settings
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-20 flex-col">
            <Link href="/restaurant-admin/menu">
              <Menu className="h-6 w-6 mb-1" />
              Manage Menu
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-20 flex-col">
            <Link href="/restaurant-admin/menu/qr">
              <QrCode className="h-6 w-6 mb-1" />
              QR Code
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Menu Items + QR Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Menu Items */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Recent Menu Items</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/restaurant-admin/menu">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {menuItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.slice(0, 5).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>Rs. {item.price}</TableCell>
                      <TableCell>
                        <Badge variant={item.status ? "default" : "secondary"}>
                          {item.status ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                     
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 py-8 text-center">No menu items yet. Add your first item!</p>
            )}
          </CardContent>
        </Card>

        {/* QR Code Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Table QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <QrCode className="w-16 h-16 text-[#513012] mb-4" />
            <p className="text-gray-600 mb-6">
              Generate QR code for your tables so customers can easily view the menu.
            </p>
            <Button asChild className="w-full max-w-xs">
              <Link href="/restaurant-admin/menu/qr">
                Open QR Generator
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Menu Modal */}
      <MenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        onSubmit={handleMenuSubmit}
        categories={categories}
        restaurantId={user?.restaurant || 0}
        onCategoryCreated={() => {
          if (user?.restaurant) fetchDashboardData(user.restaurant);
        }}
      />
    </div>
  );
}