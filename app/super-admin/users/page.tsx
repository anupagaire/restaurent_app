'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import AddUserModal from '@/components/super-admin/AddUserModal';
import EditUserModal from '@/components/super-admin/EditUserModal';

export interface RestaurantAdmin {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  restaurantName: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<RestaurantAdmin[]>([
    {
      id: 1,
      fullName: "Rajesh Sharma",
      email: "rajesh@royalspice.com",
      phone: "+977 9841234567",
      restaurantName: "The Royal Spice",
      role: "Restaurant Admin",
      createdAt: "2025-01-20",
    },
    {
      id: 2,
      fullName: "Sita Gurung",
      email: "sita@himalayan.com",
      phone: "+977 9812345678",
      restaurantName: "Himalayan Flavors",
      role: "Restaurant Admin",
      createdAt: "2025-02-25",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RestaurantAdmin | null>(null);

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.restaurantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this restaurant admin?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleAddUser = (newUser: Omit<RestaurantAdmin, 'id' | 'createdAt'>) => {
    const user: RestaurantAdmin = {
      id: Date.now(),
      ...newUser,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([user, ...users]);
    alert('Restaurant Admin added successfully!');
  };

  const handleEditClick = (user: RestaurantAdmin) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedUser: RestaurantAdmin) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    alert('Restaurant Admin updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#513012]">Restaurant Admins</h1>
          <p className="text-gray-600 mt-1">Manage all restaurant administrators</p>
        </div>

        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#513012] hover:bg-[#3f260f] text-white"
        >
          <Plus className="mr-2 h-6 w-6" />
          Add New Admin
        </Button>
      </div>

      <Card className="border-[#513012]/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#513012]/60 h-5 w-5" />
              <Input
                placeholder="Search by name, email or restaurant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#513012]/20 focus:border-[#47034E]"
              />
            </div>
            <div className="text-lg">
              Total Admins: <span className="font-semibold text-[#513012]">{users.length}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#513012]/10">
                <TableHead className="text-[#513012]">Full Name</TableHead>
                <TableHead className="text-[#513012]">Email</TableHead>
                <TableHead className="text-[#513012]">Phone</TableHead>
                <TableHead className="text-[#513012]">Restaurant</TableHead>
                <TableHead className="text-right text-[#513012]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-[#513012]/10 hover:bg-[#513012]/5">
                  <TableCell className="font-bold">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell className="text-sm">{user.restaurantName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditClick(user)}
                      >
                        <Edit className="h-4 w-4" />
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
        </CardContent>
      </Card>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveEdit}
      />
    </div>
  );
}