'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useRequirePermission } from '@/hooks/usePermission';
import StaffModal from '@/components/restaurant-admin/StaffModal';
import { useAuth } from '@/context/AuthContext';
interface Role {
  id: number;
  name: string;
}

interface Staff {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  contact_no: string;
  address: string;
  roles: Role[];
  restaurant: number;
}

const CUSTOMER_ROLE_ID = 7; 

export default function StaffsPage() {
  const [staffList, setStaffList]     = useState<Staff[]>([]);
  const [roles, setRoles]             = useState<Role[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [submitting, setSubmitting]   = useState(false);
const { profile } = useAuth()
  useRequirePermission('manageStaff');

  // ── Fetch staff list ───────────────────────────────────────────────────────
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiFetch('/api/v1/user/restaurant_users/');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to fetch staff');

      const list: Staff[] = data.data ?? data.results ?? [];

      // Show only staff — hide admin and customer roles
      const staffOnly = list.filter(u =>
        u.roles?.some(r => r.name.toLowerCase().includes('staff')) &&
        !u.roles?.some(r =>
          r.name.toLowerCase().includes('admin') ||
          r.name.toLowerCase().includes('customer')
        )
      );

      setStaffList(staffOnly);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load staff.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch roles ────────────────────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    try {
      const res  = await apiFetch('/api/v1/roles/?page_size=50');
      const data = await res.json();
      const list: Role[] = (data.data ?? data.results ?? []).map((r: any) => ({
        id: r.id, name: r.name,
      }));
      // Only show Staff-related roles
setRoles(list.filter(r =>
  r.name.toLowerCase().includes('staff') &&
  !r.name.toLowerCase().includes('admin') &&
  !r.name.toLowerCase().includes('customer') &&
  !r.name.toLowerCase().includes('super')
));    } catch {
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, [fetchStaff, fetchRoles]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const res = await apiFetch(`/api/v1/user/${id}/`, { method: 'DELETE' });
      if (res.status === 204 || res.ok) {
        setStaffList(prev => prev.filter(s => s.id !== id));
      } else {
        alert('Failed to delete staff member.');
      }
    } catch {
      alert('Network error while deleting.');
    }
  };

  // ── Create / Update ────────────────────────────────────────────────────────
  const handleSubmitStaff = async (formData: any) => {
    setSubmitting(true);
    try {
 
   const restaurantId = profile?.restaurant;

      if (editingStaff) {
        // ── PATCH user ───────────────────────────────────────────────────────
        const payload: any = {
          first_name: formData.first_name,
          last_name:  formData.last_name || '',
        };
        if (formData.contact_no) payload.contact_no = formData.contact_no;
        if (formData.password1)  payload.password1  = formData.password1;

        const res  = await apiFetch(`/api/v1/user/${editingStaff.id}/`, {
          method: 'PATCH',
          body:   JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data.errors ?? data));

        // ── Update role if changed ───────────────────────────────────────────
        if (formData.role_id) {
          const currentRoles = editingStaff.roles ?? [];
          for (const r of currentRoles) {
            await apiFetch(`/api/v1/user/${editingStaff.id}/remove-role/`, {
              method: 'POST',
              body:   JSON.stringify({ role_id: r.id }),
            }).catch(() => {});
          }
          await apiFetch(`/api/v1/user/${editingStaff.id}/assign-role/`, {
            method: 'POST',
            body:   JSON.stringify({ role_id: formData.role_id }),
          });
        }

      } else {
        // ── CREATE user ──────────────────────────────────────────────────────
        const res  = await apiFetch('/api/v1/user/', {
          method: 'POST',
          body:   JSON.stringify({
            email:      formData.email,
            password1:  formData.password1,
            first_name: formData.first_name,
            last_name:  formData.last_name || '',
            ...(formData.contact_no && { contact_no: formData.contact_no }),
            restaurant: restaurantId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data.errors ?? data));

        const newUserId = data.data?.id ?? data.id;

        // ── Remove default Customer role ─────────────────────────────────────
        await apiFetch(`/api/v1/user/${newUserId}/remove-role/`, {
          method: 'POST',
          body:   JSON.stringify({ role_id: CUSTOMER_ROLE_ID }),
        }).catch(() => {}); // silent — may not have Customer role

        // ── Assign selected role ─────────────────────────────────────────────
        if (formData.role_id && newUserId) {
          await apiFetch(`/api/v1/user/${newUserId}/assign-role/`, {
            method: 'POST',
            body:   JSON.stringify({ role_id: formData.role_id }),
          });
        }
      }

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
          <h2 className="text-3xl font-bold text-secondary">Staff Management</h2>
          <p className="text-gray-600 mt-1">Manage your restaurant team</p>
        </div>
        <Button
          onClick={() => { setEditingStaff(null); setIsModalOpen(true); }}
          className="bg-secondary hover:bg-secondary/90 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Staff
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
          <button onClick={fetchStaff} className="ml-2 underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Staff Members ({staffList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-secondary" />
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
                    <TableCell colSpan={5} className="text-center py-12 text-secondary">
                      No staff members yet. Add your first staff member!
                    </TableCell>
                  </TableRow>
                ) : (
                  staffList.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">
                        {staff.first_name} {staff.last_name}
                      </TableCell>
                      <TableCell className="text-gray-600">{staff.email}</TableCell>
                      <TableCell className="text-gray-600">{staff.contact_no || '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {staff.roles?.length > 0 ? staff.roles.map(r => (
                            <Badge key={r.id} variant="secondary"
                              className="bg-primary text-blue-700">
                              {r.name}
                            </Badge>
                          )) : (
                            <Badge variant="secondary" className="bg-gray-100 text-secondary">
                              No role
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm"
                            onClick={() => { setEditingStaff(staff); setIsModalOpen(true); }}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(staff.id)}>
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
        roles={roles}
      />
    </div>
  );
}