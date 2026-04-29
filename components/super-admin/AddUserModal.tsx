'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { User } from '@/app/super-admin/users/page';
import { apiFetch } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL;

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUser: User) => void;
}

export default function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [userForm, setUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password1: '',
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

  const handleClose = () => {
    setError('');
    setLoading(false);
    setUserForm({ first_name: '', last_name: '', email: '', password1: '', contact_no: '' });
    setRestaurantForm({ name: '', address: '', city: '', zip: '', availability: '', amenities: '' });
    onClose();
  };

  const formatError = (data: any): string => {
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) return data.join(', ');
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([k, v]) => {
          if (Array.isArray(v)) return `${k}: ${v.join(', ')}`;
          if (typeof v === 'string') return `${k}: ${v}`;
          return `${k}: ${JSON.stringify(v)}`;
        })
        .join(' | ');
    }
    return JSON.stringify(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('Please login again (no token found)');
        setLoading(false);
        return;
      }

      // ================================
      // STEP 1: CREATE RESTAURANT FIRST
      // ================================
const restaurantRes = await apiFetch('/api/v1/restaurant/', {
  method: 'POST',
  body: JSON.stringify({
          name: restaurantForm.name,
          address: restaurantForm.address,
          city: restaurantForm.city,
          zip: restaurantForm.zip || null,
          availability: restaurantForm.availability || null,
          amenities: restaurantForm.amenities || null,
          status: true,
        }),
      });

      const restaurantData = await restaurantRes.json();
      console.log('RESTAURANT CREATED:', restaurantData);

      if (!restaurantRes.ok) {
        setError('Restaurant creation failed: ' + formatError(restaurantData));
        setLoading(false);
        return;
      }

      const restaurantId = restaurantData.id; // ✅ get ID to link with user

      // ================================
      // STEP 2: CREATE USER WITH RESTAURANT ID
      // ================================
      const registerRes = await fetch(`${API}/api/v1/user/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: userForm.email,
          password1: userForm.password1,
          first_name: userForm.first_name,
          last_name: userForm.last_name,
          contact_no: userForm.contact_no || null,
          role: 'admin',
          restaurant: restaurantId, // ✅ link restaurant to user
        }),
      });

      const registerData = await registerRes.json();
      console.log('USER CREATED:', registerData);

      if (!registerRes.ok) {
        setError(formatError(registerData));
        setLoading(false);
        return;
      }

      // ================================
      // SUCCESS
      // ================================
      onSuccess({
        id: registerData.id,
        email: registerData.email,
        first_name: registerData.first_name,
        last_name: registerData.last_name,
        contact_no: registerData.contact_no || '',
        role: registerData.role,
        restaurantId: restaurantId,
      });

      handleClose();
      alert('✅ Admin + Restaurant created successfully!');

    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#513012]">Add Restaurant Admin</DialogTitle>
          <DialogDescription>
            Creates a restaurant and links an admin account to it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {/* RESTAURANT SECTION FIRST (matches API order) */}
          <div className="border border-[#513012]/10 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-[#513012]">🍽️ Restaurant Details</p>

            <div className="space-y-1">
              <Label>Restaurant Name *</Label>
              <Input required value={restaurantForm.name}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>City *</Label>
                <Input required value={restaurantForm.city}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, city: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>ZIP</Label>
                <Input value={restaurantForm.zip}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, zip: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Address *</Label>
              <Input required value={restaurantForm.address}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label>Available From *</Label>
              <Input required type="date" value={restaurantForm.availability}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, availability: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label>Amenities</Label>
              <Input placeholder="e.g. WiFi, Parking, AC" value={restaurantForm.amenities}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, amenities: e.target.value })} />
            </div>
          </div>

          {/* USER SECTION SECOND */}
          <div className="border border-[#513012]/10 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-[#513012]">👤 Admin Account</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name *</Label>
                <Input required value={userForm.first_name}
                  onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input value={userForm.last_name}
                  onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Email *</Label>
              <Input required type="email" value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label>Password *</Label>
              <Input required type="password" minLength={8}
                placeholder="Min. 8 characters"
                value={userForm.password1}
                onChange={(e) => setUserForm({ ...userForm, password1: e.target.value })} />
            </div>

            <div className="space-y-1">
              <Label>Phone</Label>
              <Input placeholder="+977 98XXXXXXXX" value={userForm.contact_no}
                onChange={(e) => setUserForm({ ...userForm, contact_no: e.target.value })} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#513012] hover:bg-[#3f260f]">
              {loading ? 'Creating...' : 'Create Admin + Restaurant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}