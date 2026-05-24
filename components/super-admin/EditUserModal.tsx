'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { apiFetch } from '@/lib/api';

export interface RestaurantAdmin {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  restaurantId?: number;
  restaurantName: string;
  address?: string;
  city?: string;
}

interface Role {
  id: number;
  name: string;
}

interface Restaurant {
  id: number;
  name: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: RestaurantAdmin | null;
  onSave: (updatedUser: RestaurantAdmin) => void;
  restaurants: Restaurant[];
  users: RestaurantAdmin[];
}

function formatError(data: any): string {
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.map(formatError).join(', ');
  if (typeof data === 'object' && data !== null) {
    return Object.entries(data)
      .map(([k, v]) => `${k}: ${formatError(v)}`)
      .join(' | ');
  }
  return JSON.stringify(data);
}

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onSave,
}: EditUserModalProps) {
  const [loading, setLoading]                 = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [error, setError]                     = useState('');

  // Roles
  const [roles, setRoles]               = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const [userForm, setUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_no: '',
  });

  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    availability: '',
    amenities: '',
  });

  // Load roles
  useEffect(() => {
    if (!isOpen) return;
    setRolesLoading(true);
    apiFetch('/api/v1/roles/?page_size=50')
      .then(r => r.json())
      .then(d => {
        const list: Role[] = (d.data ?? d.results ?? []).map((r: any) => ({
          id: r.id,
          name: r.name,
        }));
        setRoles(list.filter(r => !r.name.toLowerCase().includes('customer')));
      })
      .catch(() => setRoles([]))
      .finally(() => setRolesLoading(false));
  }, [isOpen]);

  // Populate forms when user changes
  useEffect(() => {
    if (!isOpen || !user) return;

    const nameParts = user.fullName.trim().split(' ');
    setUserForm({
      first_name: nameParts[0] || '',
      last_name:  nameParts.slice(1).join(' ') || '',
      email:      user.email,
      contact_no: user.phone === '-' ? '' : user.phone,
    });

    // Pre-select current role
    setSelectedRoleId(null); // reset first

    // Fetch restaurant details
    if (user.restaurantId) {
      setFetchingDetails(true);
      apiFetch(`/api/v1/restaurant/${user.restaurantId}/`)
        .then(r => r.json())
        .then(data => {
          const r = data.data ?? data;
          setRestaurantForm({
            name:         r.name         || '',
            address:      r.address      || '',
            city:         r.city         || '',
            zip:          r.zip          || '',
            availability: r.availability || '',
            amenities:    r.amenities    || '',
          });
        })
        .catch(() => setError('Failed to load restaurant details'))
        .finally(() => setFetchingDetails(false));
    }

    // Fetch user details to get current role id
    apiFetch(`/api/v1/user/${user.id}/`)
      .then(r => r.json())
      .then(d => {
        const u = d.data ?? d;
        const currentRole = u.roles?.[0];
        if (currentRole?.id) setSelectedRoleId(currentRole.id);
      })
      .catch(() => {});
  }, [isOpen, user]);

  const handleClose = () => {
    setError('');
    setSelectedRoleId(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      // ── 1. PATCH User ────────────────────────────────────────
      const userPayload: any = {
        first_name: userForm.first_name,
        last_name:  userForm.last_name || '',
        email:      userForm.email,
      };
      if (userForm.contact_no) userPayload.contact_no = userForm.contact_no;

      const userRes  = await apiFetch(`/api/v1/user/${user.id}/`, {
        method: 'PATCH',
        body:   JSON.stringify(userPayload),
      });
      const userData = await userRes.json();
      if (!userRes.ok || userData.success === false) {
        setError('User update failed: ' + formatError(userData.errors ?? userData));
        return;
      }

      // ── 2. Assign Role (if changed) ──────────────────────────
      // ── 2. Role update (remove old, assign new) ──────────────────
if (selectedRoleId) {
  // First fetch current roles to remove them
  const rolesRes  = await apiFetch(`/api/v1/user/${user.id}/`);
  const rolesData = await rolesRes.json();
  const currentRoles: any[] = (rolesData.data ?? rolesData).roles ?? [];

  // Remove all existing roles
  for (const r of currentRoles) {
    await apiFetch(`/api/v1/user/${user.id}/remove-role/`, {
      method: 'POST',
      body:   JSON.stringify({ role_id: r.id }),
    });
  }

  // Assign new role
  const assignRes  = await apiFetch(`/api/v1/user/${user.id}/assign-role/`, {
    method: 'POST',
    body:   JSON.stringify({ role_id: selectedRoleId }),
  });
  const assignData = await assignRes.json();
  if (!assignRes.ok || assignData.success === false) {
    setError('Role update failed: ' + formatError(assignData.errors ?? assignData));
    return;
  }
}

      // ── 3. PATCH Restaurant ──────────────────────────────────
      if (user.restaurantId) {
        const restaurantPayload: any = {
          name:    restaurantForm.name,
          address: restaurantForm.address,
          city:    restaurantForm.city,
        };
        if (restaurantForm.zip?.trim())       restaurantPayload.zip       = restaurantForm.zip;
        if (restaurantForm.amenities?.trim()) restaurantPayload.amenities = restaurantForm.amenities;
        if (restaurantForm.availability && /^\d{4}-\d{2}-\d{2}$/.test(restaurantForm.availability)) {
          restaurantPayload.availability = restaurantForm.availability;
        }

        const restaurantRes  = await apiFetch(`/api/v1/restaurant/${user.restaurantId}/`, {
          method: 'PATCH',
          body:   JSON.stringify(restaurantPayload),
        });
        const restaurantData = await restaurantRes.json();
        if (!restaurantRes.ok || restaurantData.success === false) {
          setError('Restaurant update failed: ' + formatError(restaurantData.errors ?? restaurantData));
          return;
        }
      }

      // ── 4. Update UI ─────────────────────────────────────────
      const assignedRole = roles.find(r => r.id === selectedRoleId);
      onSave({
        ...user,
        fullName:       `${userForm.first_name} ${userForm.last_name}`.trim() || '-',
        email:          userForm.email,
        phone:          userForm.contact_no || '-',
        role:           assignedRole?.name ?? user.role,
        restaurantName: restaurantForm.name,
        address:        restaurantForm.address,
        city:           restaurantForm.city,
      });

      handleClose();
    } catch (err: any) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const sections = ['Restaurant', 'Admin Account', 'Role'];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#513012]">Edit Restaurant Admin</DialogTitle>
          <DialogDescription>
            Update restaurant, admin account, and role.
          </DialogDescription>
        </DialogHeader>

        {/* Section indicator */}
        <div className="flex items-center gap-2 mb-2">
          {sections.map((label, i) => (
            <div key={label} className="flex items-center gap-1 flex-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-[#513012] text-white">
                {i + 1}
              </div>
              <span className="text-xs font-semibold text-[#513012]">{label}</span>
              {i < sections.length - 1 && <div className="h-px flex-1 bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── 1. Restaurant ── */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#513012]">
              🍽️ Restaurant Details
              {fetchingDetails && (
                <span className="text-xs text-gray-400 ml-2 font-normal">
                  <Loader2 className="inline h-3 w-3 animate-spin mr-1" />Loading…
                </span>
              )}
            </p>

            <div className="space-y-1">
              <Label>Restaurant Name <span className="text-red-500">*</span></Label>
              <Input required disabled={fetchingDetails}
                value={restaurantForm.name}
                onChange={e => setRestaurantForm({ ...restaurantForm, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>City <span className="text-red-500">*</span></Label>
                <Input required disabled={fetchingDetails}
                  value={restaurantForm.city}
                  onChange={e => setRestaurantForm({ ...restaurantForm, city: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>ZIP</Label>
                <Input disabled={fetchingDetails}
                  value={restaurantForm.zip}
                  onChange={e => setRestaurantForm({ ...restaurantForm, zip: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Address <span className="text-red-500">*</span></Label>
              <Input required disabled={fetchingDetails}
                value={restaurantForm.address}
                onChange={e => setRestaurantForm({ ...restaurantForm, address: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Available From</Label>
                <Input type="date" disabled={fetchingDetails}
                  value={restaurantForm.availability}
                  onChange={e => setRestaurantForm({ ...restaurantForm, availability: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Amenities</Label>
                <Input disabled={fetchingDetails} placeholder="e.g. WiFi, Parking"
                  value={restaurantForm.amenities}
                  onChange={e => setRestaurantForm({ ...restaurantForm, amenities: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── 2. Admin Account ── */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#513012]">👤 Admin Account</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name <span className="text-red-500">*</span></Label>
                <Input required value={userForm.first_name}
                  onChange={e => setUserForm({ ...userForm, first_name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input value={userForm.last_name}
                  onChange={e => setUserForm({ ...userForm, last_name: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input required type="email" value={userForm.email}
                onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label>Phone</Label>
              <Input placeholder="+977 98XXXXXXXX" value={userForm.contact_no}
                onChange={e => setUserForm({ ...userForm, contact_no: e.target.value })} />
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── 3. Role ── */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#513012]">🎭 Role</p>

            {rolesLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading roles…
              </div>
            ) : roles.length === 0 ? (
              <p className="text-sm text-red-500">No roles available.</p>
            ) : (
              <div className="space-y-2">
                {roles.map(role => (
                  <label key={role.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                      selectedRoleId === role.id
                        ? 'border-[#513012] bg-[#513012]/5'
                        : 'border-gray-200 hover:border-[#513012]/40'
                    }`}>
                    <input type="radio" name="role" value={role.id}
                      checked={selectedRoleId === role.id}
                      onChange={() => setSelectedRoleId(role.id)}
                      className="accent-[#513012]" />
                    <p className="font-semibold text-sm text-gray-800">{role.name}</p>
                  </label>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || fetchingDetails}
              className="bg-[#513012] hover:bg-[#3f260f]">
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                : '✓ Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}