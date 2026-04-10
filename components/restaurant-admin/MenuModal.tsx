'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Image as ImageIcon } from 'lucide-react';

interface MenuItem {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  isVeg: boolean;
}

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: MenuItem | null;
  onSubmit: (data: Omit<MenuItem, 'id'>) => void;
}

const categoryOptions = [
  'Appetizers',
  'Main Course',
  'Rice & Biryani',
  'Breads',
  'Beverages',
  'Desserts',
];

export default function MenuModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: MenuModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Main Course',
    image: '',
    isAvailable: true,
    isVeg: false,
  });

  // Prefill form when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
        category: editingItem.category,
        image: editingItem.image || '',
        isAvailable: editingItem.isAvailable,
        isVeg: editingItem.isVeg,
      });
    } else {
      // Reset form for new item
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'Main Course',
        image: '',
        isAvailable: true,
        isVeg: false,
      });
    }
  }, [editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category,
      image: formData.image.trim() || undefined,
      isAvailable: formData.isAvailable,
      isVeg: formData.isVeg,
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#513012]">
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </DialogTitle>
          <DialogDescription>
            {editingItem
              ? 'Update the details of this menu item'
              : 'Create a new item for your restaurant menu'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Butter Chicken"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Short description of the dish"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (Rs.)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                placeholder="420"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image">Image URL (optional)</Label>
            <div className="flex gap-3">
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://images.unsplash.com/..."
                className="flex-1"
              />
              <div className="w-12 h-12 border rounded-md flex items-center justify-center bg-gray-50">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="preview"
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Available</Label>
                <p className="text-xs text-gray-500">Show this item on the menu</p>
              </div>
              <Switch
                checked={formData.isAvailable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isAvailable: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Vegetarian</Label>
                <p className="text-xs text-gray-500">Mark as Veg item</p>
              </div>
              <Switch
                checked={formData.isVeg}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isVeg: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#513012] hover:bg-[#513012]/90"
            >
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}