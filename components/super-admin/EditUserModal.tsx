'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { RestaurantAdmin } from '@/app/super-admin/users/page';

interface Restaurant {
  id: number;
  name: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: RestaurantAdmin | null;
  onSave: (updatedUser: RestaurantAdmin) => void;

  // ✅ NEW PROPS (IMPORTANT)
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

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    restaurantName: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        restaurantName: user.restaurantName,
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // ❌ prevent duplicate admin (except current user)
    const exists = users.find(
      (u) =>
        u.restaurantName === formData.restaurantName &&
        u.id !== user.id
    );

    if (exists) {
      alert("❌ This restaurant already has an admin!");
      return;
    }

    const updatedUser: RestaurantAdmin = {
      ...user,
      ...formData,
    };

    onSave(updatedUser);
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#513012]">
            Edit Restaurant Admin
          </DialogTitle>
          <DialogDescription>
            Update administrator information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Restaurant Name</Label>

              {/* ✅ DROPDOWN SAME AS ADD MODAL */}
              <select
                required
                value={formData.restaurantName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    restaurantName: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              >
                <option value="">Select Restaurant</option>

                {restaurants.map((r) => {
                  const isAssigned = users.some(
                    (u) =>
                      u.restaurantName === r.name &&
                      u.id !== user.id // allow current user
                  );

                  return (
                    <option
                      key={r.id}
                      value={r.name}
                      disabled={isAssigned}
                    >
                      {r.name} {isAssigned ? "(Already Assigned)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#513012] hover:bg-[#3f260f]">
              Save Changes
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}