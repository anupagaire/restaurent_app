'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Search, Trash2, RefreshCw, Pencil } from 'lucide-react';
import AddUserModal from '@/components/super-admin/AddUserModal';
import EditUserModal from '@/components/super-admin/EditUserModal';
import { apiFetch } from '@/lib/api';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export interface RestaurantAdmin {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  restaurantName: string;
  restaurantId?: number;
  restaurantStatus?: boolean;
  // Extra fields if you want to show more in future
  address?: string;
  city?: string;
}

interface Restaurant {
  id: number;
  name: string;
}
async function toggleRestaurantStatus(id: number, currentStatus: boolean, token: string) {
  const res = await fetch(`${BASE_URL}/api/v1/restaurant/${id}/`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: !currentStatus }),
  });
  return res.ok;
}
export default function UsersPage() {
  const [users, setUsers] = useState<RestaurantAdmin[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<RestaurantAdmin | null>(null);
const [token, setToken] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 10;

useEffect(() => {
  const t = localStorage.getItem('access_token') ?? '';
  setToken(t);
}, []);
  const fetchUsers = async () => {
  setLoading(true);
  try {
    const [restaurantsRes, usersRes] = await Promise.all([
      apiFetch('/api/v1/restaurant/?page_size=100'),
      apiFetch('/api/v1/user/?page_size=100'),
    ]);

    const restaurantsData = await restaurantsRes.json();
    const usersData = await usersRes.json();

    const rawRestaurants = restaurantsData.results ?? restaurantsData.data ?? [];
    const rawUsers = usersData.data ?? usersData.results ?? [];

    setRestaurants(rawRestaurants.map((r: any) => ({ id: r.id, name: r.name })));

    // Admin users with restaurant
    const adminUsers: RestaurantAdmin[] = rawUsers
      .filter((u: any) =>
        u.roles?.some((r: any) => r.name === 'Admin' || r.name === 'AdminGroup')
      )
      .map((u: any) => {
        const restaurant = rawRestaurants.find((r: any) => r.id === u.restaurant);
        return {
          id: u.id,
          email: u.email,
          fullName: `${u.first_name || ''} ${u.last_name || ''}`.trim() || '-',
          phone: u.contact_no || '-',
          role: u.roles?.[0]?.name ?? 'Admin',
          restaurantId: u.restaurant,
          restaurantName: restaurant?.name ?? '-',
          restaurantStatus: restaurant?.status ?? true,
          address: restaurant?.address ?? '',
          city: restaurant?.city ?? '',
        };
      });

    // Admin user भएका restaurant IDs
    const assignedRestaurantIds = new Set(adminUsers.map((u) => u.restaurantId));

    // Admin नभएका restaurants — no-admin row बनाउने
    const unassignedRestaurants: RestaurantAdmin[] = rawRestaurants
      .filter((r: any) => !assignedRestaurantIds.has(r.id))
      .map((r: any) => ({
        id: -r.id, 
        email: '-',
        fullName: '-',
        phone: '-',
        role: 'No Admin',
        restaurantId: r.id,
        restaurantName: r.name,
        restaurantStatus: r.status ?? true,
        address: r.address ?? '',
        city: r.city ?? '',
      }));

    setUsers([...adminUsers, ...unassignedRestaurants]);
  } catch (err) {
    console.error('Error fetching users:', err);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = () => {
    fetchUsers();        // Refresh after edit
  };

  const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this admin?')) return;
  try {
    const res = await apiFetch(`/api/v1/user/${id}/`, {
      method: 'DELETE',
    });

    console.log('Delete response status:', res.status);

    if (res.status === 204 || res.status === 200) {
      setUsers(prev => prev.filter(u => u.id !== id));
    } else {
      const err = await res.json().catch(() => ({}));
      console.log('Delete error:', err);
      alert(`Failed to delete: ${JSON.stringify(err)}`);
    }
  } catch (err) {
    console.error(err);
    alert('Network error while deleting');
  }
};




  const filteredUsers = users.filter((u) =>
  (u.fullName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (u.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (u.restaurantName ?? '').toLowerCase().includes(searchTerm.toLowerCase())
);
const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
const paginatedUsers = filteredUsers.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Restaurant Admins</h1>
          <p className="text-gray-600 mt-1">Manage all restaurant administrators</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchUsers} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-secondary hover:bg-secondary"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Admin
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary h-5 w-5" />
              <Input
                placeholder="Search by name, email or restaurant..."
                value={searchTerm}
               
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="text-lg">
              Total: <span className="font-semibold text-secondary">{users.length}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-12 text-secondary">Loading admins...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-secondary py-12">No admins found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin Details</TableHead>
                  <TableHead>Restaurant Details</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
         
                  {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    {/* Admin Details Column */}
                    <TableCell>
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-secondary">{user.email}</div>
                      <div className="text-sm text-secondary">{user.phone}</div>
                    </TableCell>

                    {/* Restaurant Details Column - More Informative */}
                    <TableCell>
                      <div className="font-medium text-secondary">{user.restaurantName}</div>
                      {user.address && (
                        <div className="text-sm text-gray-600 mt-1">{user.address}</div>
                      )}
                      {user.city && (
                        <div className="text-xs text-secondary">{user.city}</div>
                      )}
                    </TableCell>

                    {/* <TableCell>
                      <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-medium">
                        {user.role}
                      </span>
                    </TableCell> */}
                    <TableCell>
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
    user.role === 'No Admin' 
      ? 'bg-gray-100 text-gray-500' 
      : 'bg-secondary/10 text-secondary'
  }`}>
    {user.role}
  </span>
</TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <button
  onClick={async () => {
    const ok = await toggleRestaurantStatus(user.restaurantId!, user.restaurantStatus!, token);
    if (ok) {
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, restaurantStatus: !u.restaurantStatus } : u
      ));
    }
  }}
  className={`px-3 py-1 rounded text-xs font-medium ${
    user.restaurantStatus ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
  }`}
>
  {user.restaurantStatus ? 'Deactivate' : 'Activate'}
</button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {totalPages > 1 && (
  <div className="flex justify-center items-center gap-2 mt-6">
    <button
      onClick={() => setCurrentPage(p => p - 1)}
      disabled={currentPage === 1}
      className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50"
    >
      Prev
    </button>

    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <button
        key={page}
        onClick={() => setCurrentPage(page)}
        className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
          currentPage === page
            ? 'bg-secondary text-white border-secondary'
            : 'hover:bg-gray-50'
        }`}
      >
        {page}
      </button>
    ))}

    <button
      onClick={() => setCurrentPage(p => p + 1)}
      disabled={currentPage === totalPages}
      className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50"
    >
      Next
    </button>
  </div>
)}
      </Card>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newUser) => setUsers(prev => [newUser, ...prev])}
      />

      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSave={handleSave}
        restaurants={restaurants}
        users={users}
      />
    </div>
  );
}