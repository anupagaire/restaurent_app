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
import { useAuth } from '@/context/AuthContext';
import SubscriptionBanner from '@/components/restaurant-admin/SubscriptionBanner';

import type { MenuItem, Category } from '@/types/menu';

export default function RestaurantAdminDashboard() {
  const { currentUser, profile } = useAuth();
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
  const canViewOrders = isAdmin || currentUser?.permissions?.viewOrders;
  const canManageMenu = isAdmin || currentUser?.permissions?.menuSettings;
  const canViewSettings = isAdmin || currentUser?.permissions?.globalSettings;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Menu Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [orders, setOrders] = useState<any[]>([]);


  useEffect(() => {
  if (profile?.restaurant) {
    fetchDashboardData(profile.restaurant);
  }
}, [profile]);
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();
const monthlyOrders = orders.filter(o => {
  const d = new Date(o.created_on);
  return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
});
const monthlyRevenue = monthlyOrders.reduce((s, o) => s + parseFloat(o.total_price || '0'), 0);

  const fetchDashboardData = async (restaurantId: number) => {
  try {
    setLoading(true);

    const [restRes, menuRes, catRes] = await Promise.all([
      apiFetch(`/api/v1/restaurant/${restaurantId}/`),
      apiFetch(`/api/v1/menu/?restaurant=${restaurantId}&limit=6`),
      apiFetch(`/api/v1/category/?restaurant=${restaurantId}`),
    ]);

    const restData = await restRes.json();
    const menuData = await menuRes.json();
    const catData  = await catRes.json();

    setRestaurant(restData);
    setMenuItems(Array.isArray(menuData) ? menuData : menuData.results || []);
    setCategories(Array.isArray(catData) ? catData : catData.results || []);

    try {
      const ordersRes  = await apiFetch(`/api/v1/admin/orders/?page_size=200`);
      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : ordersData.results || []);
    } catch {
      setOrders([]);
    }

  } catch (err) {
    console.error("Dashboard data fetch error:", err);
    setError("Failed to load dashboard data");
  } finally {
    setLoading(false);
  }
};

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
  if (profile?.restaurant) {  
    await fetchDashboardData(profile.restaurant);  
  }
  setIsModalOpen(false);
  setEditingItem(null);
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-secondary" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }
return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-bold text-secondary">
            Welcome back, {profile?.first_name || "Admin"}!

          </h1>
          <p className="text-gray-600 text-lg mt-1">
            {restaurant?.name || "Manage your restaurant efficiently"}
          </p>
        </div>

        {/* ✅ Permission check */}
        <div className="flex gap-3">
          {canManageMenu && (
            <Button asChild>
              <Link href="/restaurant-admin/menu">
                <Menu className="mr-2 h-4 w-4" /> Manage Full Menu
              </Link>
            </Button>
          )}
          {canManageMenu && (
            <Button asChild className="bg-secondary">
              <Link href="/restaurant-admin/menu/qr">
                <QrCode className="mr-2 h-4 w-4" /> QR Generator
              </Link>
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 mb-6">{error}</p>}
<SubscriptionBanner /> 
     
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-secondary">Total Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{menuItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-secondary">Active Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{activeMenuItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-secondary">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{categories.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-secondary">Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold truncate">{restaurant?.name || '-'}</p>
          </CardContent>
        </Card>
       

<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm text-secondary">Monthly Revenue</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold text-purple-600">Rs. {monthlyRevenue.toFixed(0)}</p>
    <p className="text-xs text-secondary mt-1">{monthlyOrders.length} orders</p>
  </CardContent>
</Card>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          {canManageMenu && (
            <Button onClick={handleAddNew} className="h-20 w-40 flex-col bg-secondary hover:bg-secondary/90">
              <Plus className="h-6 w-6 mb-1" />
              Add New Item
            </Button>
          )}
          {canViewSettings && (
            <Button asChild variant="outline" className="h-20 w-40 flex-col">
              <Link href="/restaurant-admin/settings">
                <Settings className="h-6 w-6 mb-1" />
                Settings
              </Link>
            </Button>
          )}
          {canManageMenu && (
            <Button asChild variant="outline" className="h-20 w-40 flex-col">
              <Link href="/restaurant-admin/menu">
                <Menu className="h-6 w-6 mb-1" />
                Manage Menu
              </Link>
            </Button>
          )}
          {canManageMenu && (
            <Button asChild variant="outline" className="h-20 w-40 flex-col">
              <Link href="/restaurant-admin/menu/qr">
                <QrCode className="h-6 w-6 mb-1" />
                QR Code
              </Link>
            </Button>
          )}
          {canViewOrders && (
            <Button asChild variant="outline" className="h-20 w-40 flex-col">
              <Link href="/restaurant-admin/orders">
                <Eye className="h-6 w-6 mb-1" />
                View Orders
              </Link>
            </Button>
          )}
        </div>

        {!canManageMenu && !canViewSettings && !canViewOrders && (
          <p className="text-secondary text-sm py-4">No quick actions available for your role.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Recent Menu Items</CardTitle>
            {canManageMenu && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/restaurant-admin/menu">View All</Link>
              </Button>
            )}
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
              <p className="text-secondary py-8 text-center">No menu items yet.</p>
            )}
          </CardContent>
        </Card>

        {canManageMenu && (
          <Card>
            <CardHeader>
              <CardTitle>Table QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <QrCode className="w-16 h-16 text-secondary mb-4" />
              <p className="text-gray-600 mb-6">
                Generate QR code for your tables so customers can easily view the menu.
              </p>
              <Button asChild className="w-full max-w-xs">
                <Link href="/restaurant-admin/menu/qr">Open QR Generator</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {canManageMenu && (
        <MenuModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingItem={editingItem}
          onSubmit={handleMenuSubmit}
          categories={categories}
          restaurantId={profile?.restaurant || 0}
          onCategoryCreated={async () => {
            if (profile?.restaurant) { await fetchDashboardData(profile.restaurant) 
            }
        }}
        />
      )}
    </div>
  );
}