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

export interface RestaurantAdmin {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  restaurantName: string;
  restaurantId?: number;
  // Extra fields if you want to show more in future
  address?: string;
  city?: string;
}

interface Restaurant {
  id: number;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<RestaurantAdmin[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<RestaurantAdmin | null>(null);

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

    const admins: RestaurantAdmin[] = rawUsers
      .filter((u: any) =>
        u.roles?.some((r: any) =>
          r.name === 'Admin' || r.name === 'AdminGroup'
        )
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
          address: restaurant?.address ?? '',
          city: restaurant?.city ?? '',
        };
      });

    setUsers(admins);
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                {filteredUsers.map((user) => (
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

                    <TableCell>
                      <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-medium">
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
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