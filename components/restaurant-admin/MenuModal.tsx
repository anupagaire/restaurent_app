'use client';

import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, X, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  status: boolean;
}

interface MenuItem {
  id?: number;
  name: string;
  description?: string;
  price: string | number;
  category: number;
  image?: string;
  status?: boolean;
}

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: MenuItem | null;
  // onSubmit now receives the selectedFile so the parent can upload after creating the menu item
  onSubmit: (data: any, imageFile: File | null) => Promise<void>;
  categories: Category[];
  restaurantId: number;
  onCategoryCreated: () => Promise<void>;
}

export default function MenuModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  categories,
  restaurantId,
  onCategoryCreated,
}: MenuModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 0,
    isAvailable: true,
    image: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description || '',
        price: editingItem.price.toString(),
        category: editingItem.category,
        isAvailable: editingItem.status ?? true,
        image: editingItem.image || '',
      });
      setPreviewUrl(editingItem.image || '');
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: categories[0]?.id || 0,
        isAvailable: true,
        image: '',
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setNewCategoryName('');
    setShowAddCategory(false);
    setCategoryError('');
    setUploadError('');
  }, [editingItem, categories, isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    setSelectedFile(file);
    setUploadError('');

    const reader = new FileReader();
    reader.onload = (event) => setPreviewUrl(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCategoryError('Category name is required');
      return;
    }

    setIsCreatingCategory(true);
    setCategoryError('');

    try {
      const res = await apiFetch('/api/v1/category/', {
        method: 'POST',
        body: JSON.stringify({
          restaurant: restaurantId,
          name: trimmed,
          status: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCategoryError(data?.detail || 'Failed to create category');
        return;
      }

      await onCategoryCreated();
      setFormData((prev) => ({ ...prev, category: data.id }));
      setNewCategoryName('');
      setShowAddCategory(false);
    } catch (err) {
      setCategoryError('Failed to create category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      alert('Please select or create a category');
      return;
    }

    setIsSubmitting(true);
    setUploadError('');

    const payload = {
      restaurant: restaurantId,
      category: formData.category,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price: formData.price.toString(),
      status: formData.isAvailable,
      // Only pass image URL if no file selected (URL input fallback)
      image: selectedFile ? null : formData.image || null,
    };

    try {
      // Pass selectedFile to parent — parent will upload after getting the menu item ID
      await onSubmit(payload, selectedFile);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#513012]">
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </DialogTitle>
          <DialogDescription>
            {editingItem ? 'Update menu item details' : 'Create a new item for your restaurant menu'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Name */}
          <div className="space-y-2">
            <Label>Item Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Butter Chicken"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short description of the dish"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-2">
              <Label>Price (Rs.) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Category *</Label>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="text-xs text-[#513012] underline hover:opacity-80 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New Category
                </button>
              </div>

              <Select
                value={formData.category ? formData.category.toString() : ''}
                onValueChange={(value) => setFormData({ ...formData, category: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* New Category Input */}
          {showAddCategory && (
            <div className="p-4 bg-gray-50 border border-dashed border-[#513012]/30 rounded-xl space-y-3">
              <Label>New Category Name</Label>
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Starters, Main Course..."
                />
                <Button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={isCreatingCategory || !newCategoryName.trim()}
                  className="bg-[#513012]"
                >
                  {isCreatingCategory ? 'Creating...' : 'Create'}
                </Button>
              </div>
              {categoryError && <p className="text-red-600 text-sm">{categoryError}</p>}
            </div>
          )}

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label>Menu Item Image</Label>

            <label className="cursor-pointer block">
              <div className="border-2 border-dashed border-gray-300 hover:border-[#513012] rounded-xl p-8 text-center transition-all">
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="font-medium text-sm">Click to upload image</p>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG, JPEG • Max 5MB</p>
              </div>
              {/* ✅ Fixed: type="file" instead of type="menu" */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {previewUrl && (
              <div className="relative w-40 h-40 mx-auto border rounded-xl overflow-hidden">
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl('');
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-center text-xs text-gray-500">— OR —</p>

            <Input
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="Paste direct image URL"
              disabled={!!selectedFile}
            />
          </div>

          {/* Available */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Available on Menu</Label>
              <p className="text-xs text-gray-500">Show this item to customers</p>
            </div>
            <Switch
              checked={formData.isAvailable}
              onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
            />
          </div>

          {uploadError && <p className="text-red-600 text-sm">{uploadError}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#513012]">
              {isSubmitting ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}