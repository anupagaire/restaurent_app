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
import type { RestaurantAdmin } from '@/types/user';
import { apiFetch } from '@/lib/api';

interface Role {
  id: number;
  name: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUser: RestaurantAdmin) => void;
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

export default function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
  const [step,    setStep]    = useState<1 | 2 | 3>(1); // 1=restaurant, 2=user, 3=role
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Fetched roles
  const [roles,        setRoles]        = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Created IDs
  const [restaurantId,   setRestaurantId]   = useState<number | null>(null);
  const [createdUserId,  setCreatedUserId]  = useState<number | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  // Forms
  const [restaurantForm, setRestaurantForm] = useState({
    name: '', address: '', city: '', availability: '', amenities: '',
  });

  const [userForm, setUserForm] = useState({
    first_name: '', last_name: '', email: '', password1: '', contact_no: '',
  });

  // Load roles once modal opens
  useEffect(() => {
    if (!isOpen) return;
    setRolesLoading(true);
    apiFetch('/api/v1/roles/?page_size=50')
      .then(r => r.json())
      .then(d => {
const list: Role[] = (d.data ?? d.results ?? []).map((r: any) => ({ id: r.id, name: r.name }));
        // Filter out Customer role — superadmin should only assign Admin roles
        setRoles(list.filter(r => !r.name.toLowerCase().includes('customer')));
      })
      .catch(() => setRoles([]))
      .finally(() => setRolesLoading(false));
  }, [isOpen]);

  const handleClose = () => {
    setStep(1);
    setError('');
    setRestaurantId(null);
    setCreatedUserId(null);
    setSelectedRoleId(null);
    setRestaurantForm({ name: '', address: '', city: '', availability: '', amenities: '' });
    setUserForm({ first_name: '', last_name: '', email: '', password1: '', contact_no: '' });
    onClose();
  };

  // ── Step 1: Create Restaurant ──────────────────────────────────────────────
  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await apiFetch('/api/v1/restaurant/', {
        method: 'POST',
        body: JSON.stringify({
          name:         restaurantForm.name,
          address:      restaurantForm.address,
          city:         restaurantForm.city,
          availability: restaurantForm.availability || null,
          amenities:    restaurantForm.amenities    || null,
          status:       true,
        }),
      });
      const data = await res.json();
      console.log('400 error body:', JSON.stringify(data, null, 2)); // <-- add this

      if (!res.ok) { setError('Restaurant creation failed: ' + formatError(data)); return; }
      setRestaurantId(data.id);
      setStep(2);
    } catch (e: any) {
      setError('Network error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Create User (POST /api/v1/user/) ───────────────────────────────
  // Uses authenticated endpoint, assigns restaurant
  
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await apiFetch('/api/v1/user/', {
        method: 'POST',
        body: JSON.stringify({
          email:      userForm.email,
          password1:  userForm.password1,
          first_name: userForm.first_name,
          last_name:  userForm.last_name  || '',
          contact_no: userForm.contact_no || null,
          restaurant: restaurantId,
          // DO NOT send role or roles — API rejects it
        }),
      });
    const data = await res.json();
if (!res.ok || data.success === false) { setError(formatError(data.errors ?? data)); return; }
setCreatedUserId(data.data?.id ?? data.id);
      setStep(3);
    } catch (e: any) {
      setError('Network error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Assign Role (POST /api/v1/user/{id}/assign-role/) ─────────────
  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId || !createdUserId) return;
    setLoading(true);
    setError('');
    try {
      const res  = await apiFetch(`/api/v1/user/${createdUserId}/assign-role/`, {
        method: 'POST',
        body: JSON.stringify({ role_id: selectedRoleId }),
      });
      const data = await res.json();
if (!res.ok || data.success === false) { setError(formatError(data.errors ?? data)); return; }

      const assignedRole = roles.find(r => r.id === selectedRoleId);
      onSuccess({
        id:             createdUserId,
        email:          userForm.email,
        fullName:       `${userForm.first_name} ${userForm.last_name}`.trim() || '-',
        first_name:     userForm.first_name,  
        last_name:      userForm.last_name, 
        phone:          userForm.contact_no || '-',
        role:           assignedRole?.name ?? 'Admin',
        restaurantId:   restaurantId!,
        restaurantName: restaurantForm.name,
        address:        restaurantForm.address,
        city:           restaurantForm.city,
      });
      handleClose();
    } catch (e: any) {
      setError('Network error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Step indicator
  const steps = ['Restaurant', 'Admin Account', 'Assign Role'];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#513012]">Add Restaurant Admin</DialogTitle>
          <DialogDescription>
            Creates a restaurant and links an admin account to it.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          {steps.map((label, i) => {
            const n = i + 1;
            const done    = step > n;
            const current = step === n;
            return (
              <div key={label} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${done ? 'bg-green-500 text-white' : current ? 'bg-[#513012] text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {done ? '✓' : n}
                </div>
                <span className={`text-xs ${current ? 'font-semibold text-[#513012]' : 'text-gray-400'}`}>{label}</span>
                {i < steps.length - 1 && <div className="h-px flex-1 bg-gray-200 mx-1" />}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* ── Step 1: Restaurant ── */}
        {step === 1 && (
          <form onSubmit={handleCreateRestaurant} className="space-y-3">
            <p className="text-sm font-semibold text-[#513012]">🍽️ Restaurant Details</p>

            <div className="space-y-1">
              <Label>Restaurant Name <span className="text-red-500">*</span></Label>
              <Input required value={restaurantForm.name}
                onChange={e => setRestaurantForm({ ...restaurantForm, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>City <span className="text-red-500">*</span></Label>
                <Input required value={restaurantForm.city}
                  onChange={e => setRestaurantForm({ ...restaurantForm, city: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Available From</Label>
                <Input type="date" value={restaurantForm.availability}
                  onChange={e => setRestaurantForm({ ...restaurantForm, availability: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Address <span className="text-red-500">*</span></Label>
              <Input required value={restaurantForm.address}
                onChange={e => setRestaurantForm({ ...restaurantForm, address: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label>Amenities</Label>
              <Input placeholder="e.g. WiFi, Parking, AC" value={restaurantForm.amenities}
                onChange={e => setRestaurantForm({ ...restaurantForm, amenities: e.target.value })} />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-[#513012] hover:bg-[#3f260f]">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : 'Next: Admin Account →'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* ── Step 2: User ── */}
        {step === 2 && (
          <form onSubmit={handleCreateUser} className="space-y-3">
            <p className="text-sm font-semibold text-[#513012]">👤 Admin Account</p>
            <p className="text-xs text-gray-400">
              Restaurant: <strong>{restaurantForm.name}</strong> (ID: {restaurantId})
            </p>

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
              <Label>Password <span className="text-red-500">*</span></Label>
              <Input required type="password" minLength={8}
                placeholder="Min. 8 characters" value={userForm.password1}
                onChange={e => setUserForm({ ...userForm, password1: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label>Phone</Label>
              <Input placeholder="+977 98XXXXXXXX" value={userForm.contact_no}
                onChange={e => setUserForm({ ...userForm, contact_no: e.target.value })} />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setStep(1); setError(''); }} disabled={loading}>
                ← Back
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#513012] hover:bg-[#3f260f]">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : 'Next: Assign Role →'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* ── Step 3: Assign Role ── */}
        {step === 3 && (
          <form onSubmit={handleAssignRole} className="space-y-4">
            <p className="text-sm font-semibold text-[#513012]">🎭 Assign Role</p>
            <p className="text-xs text-gray-400">
              User <strong>{userForm.email}</strong> created. Now assign a role.
            </p>

            {rolesLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading roles…
              </div>
            ) : roles.length === 0 ? (
              <p className="text-sm text-red-500">No roles available. Contact system admin.</p>
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
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{role.name}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setStep(2); setError(''); }} disabled={loading}>
                ← Back
              </Button>
              <Button type="submit" disabled={loading || !selectedRoleId} className="bg-[#513012] hover:bg-[#3f260f]">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Assigning…</> : '✓ Create Admin'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}