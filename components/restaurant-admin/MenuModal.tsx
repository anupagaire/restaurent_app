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
  Select,SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Image as ImageIcon, Plus, X } from 'lucide-react';

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
  // Pass categories from parent so they're shared per restaurant
  categories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
}

export default function MenuModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  categories,
  onAddCategory,
  onDeleteCategory,
}: MenuModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    isAvailable: true,
    isVeg: false,
  });

  // New category input state
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');

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
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: categories[0] || '',
        image: '',
        isAvailable: true,
        isVeg: false,
      });
    }
    // Reset category input on open/close
    setNewCategory('');
    setShowAddCategory(false);
    setCategoryError('');
  }, [editingItem, isOpen]);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();

    if (!trimmed) {
      setCategoryError('Category name cannot be empty.');
      return;
    }

    if (categories.map((c) => c.toLowerCase()).includes(trimmed.toLowerCase())) {
      setCategoryError('This category already exists.');
      return;
    }

    onAddCategory(trimmed);
    setFormData((prev) => ({ ...prev, category: trimmed })); // auto-select new category
    setNewCategory('');
    setShowAddCategory(false);
    setCategoryError('');
  };

  const handleDeleteCategory = (cat: string) => {
    // If the deleted category is currently selected, reset selection
    if (formData.category === cat) {
      setFormData((prev) => ({
        ...prev,
        category: categories.filter((c) => c !== cat)[0] || '',
      }));
    }
    onDeleteCategory(cat);
  };

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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="420"
                required
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Category</Label>
                <button
                  type="button"
                  onClick={() => setShowAddCategory((prev) => !prev)}
                  className="text-xs text-[#513012] underline hover:opacity-80 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {showAddCategory ? 'Cancel' : 'Add Category'}
                </button>
              </div>

              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center justify-between w-full gap-6">
                        <span>{cat}</span>                        
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add New Category Input — shown inline when toggled */}
          {showAddCategory && (
            <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-dashed border-[#513012]/30">
              <Label>New Category Name</Label>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => {
                    setNewCategory(e.target.value);
                    setCategoryError('');
                  }}
                  placeholder="e.g. Starters, Soups..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddCategory}
                  className="bg-[#513012] hover:bg-[#513012]/90 text-white shrink-0"
                >
                  Add
                </Button>
              </div>
              {categoryError && (
                <p className="text-xs text-red-500">{categoryError}</p>
              )}
            </div>
          )}

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image">Image URL (optional)</Label>
            <div className="flex gap-3">
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="flex-1"
              />
              <div className="w-12 h-12 border rounded-md flex items-center justify-center bg-gray-50 shrink-0">
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