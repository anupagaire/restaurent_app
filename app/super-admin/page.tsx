'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Building2, TrendingUp, RefreshCw, Eye } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Restaurant {
  id: number;
  name: string;
  city?: string;
  address?: string;
  created_at?: string;
  users?: any[];
}

interface AdminSummary {
  id: number;
  fullName: string;
  email: string;
  restaurantName: string;
  role: string;
}

export default function SuperAdminDashboard() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recentAdmins, setRecentAdmins] = useState<AdminSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0); // Future ma real API bata aaos

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/restaurant/');
      const data = await res.json();
      
      const allRestaurants: Restaurant[] = Array.isArray(data) 
        ? data 
        : data.results || [];

      setRestaurants(allRestaurants);

      // Recent Admins prepare (sabai restaurants ko users collect garera last 5)
      const admins: AdminSummary[] = [];
      allRestaurants.forEach((r: any) => {
        if (r.users && Array.isArray(r.users)) {
          r.users.forEach((u: any) => {
            admins.push({
              id: u.id,
              fullName: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'N/A',
              email: u.email,
              restaurantName: r.name,
              role: u.role || 'admin',
            });
          });
        }
      });

      // Last 5 admins (recent)
      setRecentAdmins(admins.slice(0, 5));

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalRestaurants = restaurants.length;
  const totalAdmins = recentAdmins.length; // yo real ma calculate garna sakinchha

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#513012] cinzel">
          Welcome back, Super Admin
        </h2>
        <p className="text-gray-600 mt-2">
          Here&apos;s what&apos;s happening across all restaurants
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Restaurants</CardTitle>
            <Building2 className="h-5 w-5 text-[#513012]" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#513012]">{totalRestaurants}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Admins</CardTitle>
            <Users className="h-5 w-5 text-[#513012]" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{recentAdmins.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 flex-wrap">
       
       

        <Button asChild variant="outline">
          <Link href="/super-admin/users">
            <Users className="mr-2 h-5 w-5" />
            Manage Admins
          </Link>
        </Button>

        <Button 
          onClick={fetchDashboardData} 
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Restaurants */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Recent Restaurants</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/super-admin/restaurants">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-gray-500">Loading...</p>
            ) : restaurants.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Admins</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurants.slice(0, 6).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.city || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {r.users?.length || 0} Admin{r.users?.length !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 py-8 text-center">No restaurants found.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Admins */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Recent Restaurant Admins</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/super-admin/users">View All Admins</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentAdmins.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Restaurant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="font-medium">{admin.fullName}</div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </TableCell>
                      <TableCell className="text-[#513012] font-medium">
                        {admin.restaurantName}
                      </TableCell>
                     
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 py-8 text-center">No admins yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Future Sections (Placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       

       
      </div>
    </div>
  );
}