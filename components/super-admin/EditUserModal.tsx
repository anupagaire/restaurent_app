'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { RestaurantAdmin } from '@/app/super-admin/users/page';
import { apiFetch } from '@/lib/api';

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

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onSave,
  restaurants,
  users,
}: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingRestaurant, setFetchingRestaurant] = useState(false);
  const [error, setError] = useState('');

  const [userForm, setUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    availability: '',
    amenities: '',
  });

  // ✅ Fetch full restaurant details when modal opens
  const fetchRestaurantDetails = async (restaurantId: number) => {
    setFetchingRestaurant(true);
    try {
      const res = await apiFetch(`/api/v1/restaurant/${restaurantId}/`);
      const data = await res.json();
      console.log('RESTAURANT DETAILS:', data);

      setRestaurantForm({
        name: data.name || '',
        address: data.address || '',
        city: data.city || '',
        zip: data.zip || '',
        availability: data.availability || '',
        amenities: data.amenities || '',
      });
    } catch (err) {
      console.error('Failed to fetch restaurant details:', err);
      setError('Failed to load restaurant details');
    } finally {
      setFetchingRestaurant(false);
    }
  };

  useEffect(() => {
    if (user) {
      const nameParts = user.fullName.trim().split(' ');
      setUserForm({
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: user.email,
        phone: user.phone === '-' ? '' : user.phone,
      });

      if (user.restaurantId) {
        fetchRestaurantDetails(user.restaurantId);
      }
    }
  }, [user]);

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
  if (!user) return;

  setError('');
  setLoading(true);

  try {
    // Update Restaurant Only
    if (user.restaurantId) {
      const restaurantPayload: any = {
        name: restaurantForm.name,
        address: restaurantForm.address,
        city: restaurantForm.city,
      };

      if (restaurantForm.zip?.trim()) restaurantPayload.zip = restaurantForm.zip;
      if (restaurantForm.amenities?.trim()) restaurantPayload.amenities = restaurantForm.amenities;
      if (restaurantForm.availability && /^\d{4}-\d{2}-\d{2}$/.test(restaurantForm.availability)) {
        restaurantPayload.availability = restaurantForm.availability;
      }

      console.log('SENDING RESTAURANT PATCH:', restaurantPayload);

      const restaurantRes = await apiFetch(
        `/api/v1/restaurant/${user.restaurantId}/`,
        {
          method: 'PATCH',
          body: JSON.stringify(restaurantPayload),
        }
      );

      if (!restaurantRes.ok) {
        const data = await restaurantRes.json().catch(() => ({}));
        setError('Restaurant update failed: ' + formatError(data));
        return;
      }

      console.log('✅ RESTAURANT UPDATED SUCCESSFULLY');
    }

    // Update UI only
    onSave({
      ...user,
      fullName: `${userForm.first_name} ${userForm.last_name}`.trim(),
      email: userForm.email,
      phone: userForm.phone || '-',
      restaurantName: restaurantForm.name,
    });

    onClose();
    alert('✅ Restaurant details updated successfully!');

  } catch (err: any) {
    console.error(err);
    setError('Network error while updating restaurant.');
  } finally {
    setLoading(false);
  }
};
  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#513012]">Edit Restaurant Admin</DialogTitle>
          <DialogDescription>
            Update restaurant and admin account details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {/* RESTAURANT SECTION */}
          <div className="border border-[#513012]/10 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-[#513012]">
              🍽️ Restaurant Details
              {fetchingRestaurant && (
                <span className="text-xs text-gray-400 ml-2">Loading details...</span>
              )}
            </p>

            <div className="space-y-1">
              <Label>Restaurant Name *</Label>
              <Input
                required
                disabled={fetchingRestaurant}
                value={restaurantForm.name}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>City *</Label>
                <Input
                  required
                  disabled={fetchingRestaurant}
                  value={restaurantForm.city}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>ZIP</Label>
                <Input
                  disabled={fetchingRestaurant}
                  value={restaurantForm.zip}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, zip: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Address *</Label>
              <Input
                required
                disabled={fetchingRestaurant}
                value={restaurantForm.address}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label>Available From *</Label>
              <Input
                required
                type="date"
                disabled={fetchingRestaurant}
                value={restaurantForm.availability}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, availability: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label>Amenities</Label>
              <Input
                disabled={fetchingRestaurant}
                placeholder="e.g. WiFi, Parking, AC"
                value={restaurantForm.amenities}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, amenities: e.target.value })}
              />
            </div>
          </div>

          {/* USER SECTION */}
          <div className="border border-[#513012]/10 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-[#513012]">👤 Admin Account</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name *</Label>
                <Input
                  required
                  value={userForm.first_name}
                  onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input
                  value={userForm.last_name}
                  onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Email *</Label>
              <Input
                required
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                placeholder="+977 98XXXXXXXX"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || fetchingRestaurant}
              className="bg-[#513012] hover:bg-[#3f260f]"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}