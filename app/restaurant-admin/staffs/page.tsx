'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import StaffModal from '@/components/restaurant-admin/StaffModal';

interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'Active' | 'Inactive';
  password: string;                    // ← Added password
  permissions: {
    viewOrders: boolean;
    manageOrders: boolean;
    addMenuItems: boolean;
    editMenuItems: boolean;
    globalSettings: boolean;
    manageStaff: boolean;
  };
}

const initialStaff: Staff[] = [
  {
    id: 1,
    name: 'Rahul Sharma',
    email: 'rahul@yoh.com',
    phone: '+977 9801234567',
    role: 'Manager',
    status: 'Active',
    password: 'manager123',               // ← Mock password
    permissions: {
      viewOrders: true,
      manageOrders: true,
      addMenuItems: true,
      editMenuItems: true,
      globalSettings: false,
      manageStaff: true,
    },
  },
  {
    id: 2,
    name: 'Priya Thapa',
    email: 'priya@yoh.com',
    phone: '+977 9809876543',
    role: 'Waiter',
    status: 'Active',
    password: 'waiter123',                // ← Mock password
    permissions: {
      viewOrders: true,
      manageOrders: false,
      addMenuItems: false,
      editMenuItems: false,
      globalSettings: false,
      manageStaff: false,
    },
  },
  {
    id: 3,
    name: 'Aakash KC',
    email: 'aakash@yoh.com',
    phone: '+977 9812345678',
    role: 'Chef',
    status: 'Inactive',
    password: 'chef123',                  // ← Mock password
    permissions: {
      viewOrders: false,
      manageOrders: false,
      addMenuItems: true,
      editMenuItems: true,
      globalSettings: false,
      manageStaff: false,
    },
  },
];

const availableRoles = ['Manager', 'Waiter', 'Chef', 'Cashier', 'Admin'];

export default function StaffsPage() {
  const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const handleAddNew = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      setStaffList((prev) => prev.filter((staff) => staff.id !== id));
    }
  };

const handleSubmitStaff = (newOrUpdatedStaff: any) => {
  if (editingStaff) {
    setStaffList((prev) =>
      prev.map((staff) =>
        staff.id === editingStaff.id ? { ...staff, ...newOrUpdatedStaff } : staff
      )
    );
  } else {
    const newStaff = {
      id: Date.now(),
      ...newOrUpdatedStaff,
      password: newOrUpdatedStaff.password || 'password123',
    };

    const updatedList = [...staffList, newStaff];
    setStaffList(updatedList);

    // Save to localStorage so Login Page can see it
    localStorage.setItem('staffList', JSON.stringify(updatedList));

    console.log('New staff created successfully!', newStaff);
  }

  setIsModalOpen(false);
  setEditingStaff(null);
};
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#513012] cinzel">Staff Management</h2>
          <p className="text-gray-600 mt-1">Manage your restaurant team, assign roles &amp; permissions</p>
        </div>

        <Button
          onClick={handleAddNew}
          className="bg-[#513012] hover:bg-[#513012]/90 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Staff
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Staff Members ({staffList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Password (Demo)</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-[#5D0565]/10 text-[#5D0565]">
                      {staff.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={staff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {staff.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-600">
                    {staff.password}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {staff.permissions.manageOrders && <Badge variant="outline" className="text-[10px]">Orders</Badge>}
                      {(staff.permissions.addMenuItems || staff.permissions.editMenuItems) && <Badge variant="outline" className="text-[10px]">Menu</Badge>}
                      {staff.permissions.globalSettings && <Badge variant="outline" className="text-[10px]">Settings</Badge>}
                      {staff.permissions.manageStaff && <Badge variant="outline" className="text-[10px]">Staff</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(staff)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(staff.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStaff(null);
        }}
        editingStaff={editingStaff}
        onSubmit={handleSubmitStaff}
        availableRoles={availableRoles}
      />
    </div>
  );
}