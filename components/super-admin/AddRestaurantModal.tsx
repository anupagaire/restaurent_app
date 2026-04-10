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

interface AddRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newRestaurant: Omit<Restaurant, 'id' | 'status' | 'createdAt'>) => void;
}

interface Restaurant {
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
}

export default function AddRestaurantModal({ isOpen, onClose, onAdd }: AddRestaurantModalProps) {
  const [formData, setFormData] = useState<Restaurant>({
    name: '',
    owner: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.owner || !formData.email) return;

    onAdd(formData);
    setFormData({ name: '', owner: '', email: '', phone: '', address: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#513012]">Add New Restaurant</DialogTitle>
          <DialogDescription>
            Fill in the restaurant details. Status will be set to Active by default.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Burger House"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Owner Name *</Label>
            <Input
              id="owner"
              required
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              placeholder="Full name of owner"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+977 98XXXXXXXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address (e.g. New Road, Kathmandu)"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#513012] hover:bg-[#3f260f]">
              Add Restaurant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}