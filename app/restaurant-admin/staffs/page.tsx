'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import StaffModal from '@/components/restaurant-admin/StaffModal';
import { apiFetch } from '@/lib/api';
import { useRequirePermission } from '@/hooks/usePermission';

interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  role: string;
  restaurant: number;
}

const availableRoles = ['staff', 'admin'];

export default function StaffsPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [submitting, setSubmitting] = useState(false);
  useRequirePermission('manageStaff');

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/user/restaurant_users/');
      if (!res.ok) throw new Error(`Failed to fetch staff (${res.status})`);
      const data = await res.json();
      const list: Staff[] = Array.isArray(data) ? data : (data.results ?? []);
      setStaffList(list);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load staff.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleAddNew = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const res = await apiFetch(`/api/v1/user/${id}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setStaffList(prev => prev.filter(s => s.id !== id));
    } catch {
      alert('Failed to delete staff member.');
    }
  };

 const handleSubmitStaff = async (formData: any) => {
  setSubmitting(true);
  try {
    const meRes = await apiFetch('/api/v1/user/me/');
    const me = await meRes.json();
    const restaurantId = me.restaurant;

    if (editingStaff) {
      const res = await apiFetch(`/api/v1/user/${editingStaff.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          contact_no: formData.contact_no,
          role: formData.role,
          ...(formData.password1 && { password1: formData.password1 }),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }
    } else {
      const res = await apiFetch('/api/v1/user/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password1: formData.password1,
          first_name: formData.first_name,
          last_name: formData.last_name,
          contact_no: formData.contact_no,
          address: formData.address || '',
          role: formData.role,
          restaurant: restaurantId,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }
    }

    // ✅ Permissions localStorage ma save garo
    const allPerms = JSON.parse(localStorage.getItem('staff_permissions') || '{}');
    allPerms[formData.email] = formData.permissions;
    localStorage.setItem('staff_permissions', JSON.stringify(allPerms));

    await fetchStaff();
    setIsModalOpen(false);
    setEditingStaff(null);
  } catch (err: any) {
    alert(`Failed: ${err.message}`);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#513012]">Staff Management</h2>
          <p className="text-gray-600 mt-1">Manage your restaurant team</p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-[#513012] hover:bg-[#513012]/90 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Staff
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
          <button onClick={fetchStaff} className="ml-2 underline">Retry</button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Staff Members ({staffList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#513012]" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                      No staff members yet. Add your first staff member!
                    </TableCell>
                  </TableRow>
                ) : (
                  staffList.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">
                        {staff.first_name} {staff.last_name}
                      </TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>{staff.contact_no || '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            staff.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {staff.role}
                        </Badge>
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
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingStaff(null); }}
        editingStaff={editingStaff}
        onSubmit={handleSubmitStaff}
        submitting={submitting}
        availableRoles={availableRoles}
      />
    </div>
  );
}