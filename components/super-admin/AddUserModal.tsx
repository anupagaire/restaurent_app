'use client';

import { useState } from 'react';
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

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newUser: Omit<RestaurantAdmin, 'id' | 'createdAt'>) => void;
  restaurants: Restaurant[];   
  users: RestaurantAdmin[];   
}

export default function AddUserModal({
  isOpen,
  onClose,
  onAdd,
  restaurants,
  users,
}: AddUserModalProps) {



  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    restaurantName: '',
    role: 'Restaurant Admin',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ❌ prevent duplicate admin
    const exists = users.find(
      (u) => u.restaurantName === formData.restaurantName
    );

    if (exists) {
      alert("❌ This restaurant already has an admin!");
      return;
    }

    onAdd(formData);

    setFormData({
      fullName: '',
      email: '',
      phone: '',
      restaurantName: '',
      role: 'Restaurant Admin',
    });
    onClose();
  };
 return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#513012]">Add New Restaurant Admin</DialogTitle>
          <DialogDescription>
            Create a new administrator for a restaurant.
          </DialogDescription>
        </DialogHeader>
     <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Ram Bahadur Shrestha"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@restaurant.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+977 98XXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Restaurant *</Label>

              {/* ✅ DROPDOWN */}
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
                    (u) => u.restaurantName === r.name
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
              Create Admin
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

  




        
