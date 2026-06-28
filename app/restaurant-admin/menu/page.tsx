'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Image as ImageIcon, RefreshCw, UtensilsCrossed, X } from 'lucide-react';
import MenuModal from '@/components/restaurant-admin/MenuModal';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { useRequirePermission } from '@/hooks/usePermission';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SubscriptionGuard from '@/components/restaurant-admin/SubscriptionGuard';
import { useAuth } from '@/context/AuthContext';
interface MenuItem {
  id: number;
  name: string;
  description?: string | null;
  price: string;
  category: number;
  category_name?: string;
  image?: string;
  status: boolean;
}

interface Category {
  id: number;
  name: string;
  status: boolean;
}

interface MenuPhoto {
  id: number;
  object_id: number;
  photo_url: string;
}

interface Restaurant {
  id: number;
  name: string;
  table_count: number;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuPhotos, setMenuPhotos] = useState<Record<number, MenuPhoto>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'All'>('All');
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
const [previewImage, setPreviewImage] = useState<string | null>(null);
  // Table count gate
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tableCountInput, setTableCountInput] = useState('');
  const [savingTableCount, setSavingTableCount] = useState(false);
  const [tableCountError, setTableCountError] = useState<string | null>(null);
const { profile } = useAuth();
 useRequirePermission(null); 

 useEffect(() => {
  if (profile?.restaurant) {
    setRestaurantId(profile.restaurant);
    fetchRestaurant(profile.restaurant);
  }
}, [profile]);

  const fetchRestaurant = async (id: number) => {
    try {
      const res = await apiFetch(`/api/v1/restaurant/${id}/`);
      const data = await res.json();
      setRestaurant(data);
    } catch (err) {
      console.error('Failed to fetch restaurant details', err);
    }
  };

 
  useEffect(() => { if (restaurantId) fetchAll(); }, [restaurantId]);

  const fetchCategories = async () => {
    if (!restaurantId) return;
    try {
      const res = await apiFetch(`/api/v1/category/?restaurant=${restaurantId}`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.results || []);
    } catch (err) { console.error(err); }
  };

  const fetchMenuItems = async () => {
    if (!restaurantId) return;
    try {
      const res = await apiFetch(`/api/v1/menu/?restaurant=${restaurantId}`);
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : data.results || []);
    } catch (err) { console.error(err); }
  };

  const fetchMenuPhotos = async () => {
    if (!restaurantId) return;
    try {
      const res = await apiFetch(`/api/v1/photo/?type=menu&page_size=500`);
      const data = await res.json();
      const photos: MenuPhoto[] = data.results || [];
      const photoMap: Record<number, MenuPhoto> = {};
      photos.forEach((photo) => {
        if (photo.object_id && photo.photo_url) {
          photoMap[photo.object_id] = photo;
        }
      });
      setMenuPhotos(photoMap);
    } catch (err) {
      console.error('Failed to fetch menu photos', err);
    }
  };

const fetchAll = async () => {
  setLoading(true);
  try {
    await Promise.all([fetchCategories(), fetchMenuItems(), fetchMenuPhotos()]);
    if (restaurantId) await fetchRestaurant(restaurantId);
  } catch (err) {
    console.error('fetchAll error:', err);
  } finally {
    setLoading(false); 
  }
};
  // ── Save table count ──────────────────────────────────────────────────────
  const handleSaveTableCount = async () => {
    if (!restaurantId) return;
    const count = parseInt(tableCountInput, 10);
    if (!count || count < 1) {
      setTableCountError('Please enter a valid number of tables (minimum 1).');
      return;
    }
    setSavingTableCount(true);
    setTableCountError(null);
    try {
      const res = await apiFetch(`/api/v1/restaurant/${restaurantId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ table_count: count }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
// Extract field-level errors like errors.table_count[0]
const fieldError = err?.errors?.table_count?.[0] 
  || err?.errors?.non_field_errors?.[0]
  || err?.detail 
  || 'Failed to update table count';
throw new Error(fieldError);      }
      await fetchRestaurant(restaurantId);
      setTableCountInput('');
    } catch (err: any) {
      setTableCountError(err.message || 'Something went wrong');
    } finally {
      setSavingTableCount(false);
    }
  };

  // ── Menu CRUD ─────────────────────────────────────────────────────────────
  const handleMenuSubmit = async (payload: any, selectedFile: File | null) => {
    if (!restaurantId) return;
    const isEditing = !!editingItem;
    const url = isEditing ? `/api/v1/menu/${editingItem!.id}/` : `/api/v1/menu/`;

    const res = await apiFetch(url, {
      method: isEditing ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || 'Failed to save menu item');
    }

    const menuData = await res.json();
    const menuId: number = isEditing ? editingItem!.id : menuData.id;

    if (selectedFile && menuId) {
      const existingPhoto = menuPhotos[menuId];
      const formData = new FormData();
      formData.append('type', 'menu');
      formData.append('object_id', menuId.toString());
      formData.append('photo', selectedFile);

      if (existingPhoto) {
        await apiFetch(`/api/v1/photo/${existingPhoto.id}/`, {
          method: 'PUT',
          body: formData,
        }).catch(console.error);
      } else {
        await apiFetch('/api/v1/photo/', {
          method: 'POST',
          body: formData,
        }).catch(console.error);
      }
    }

    await fetchAll();
    setIsModalOpen(false);
    setEditingItem(null);
  };

const handleEdit = (item: MenuItem) => {
  const photo = menuPhotos[item.id];
  setEditingItem({
    ...item,
    image: photo?.photo_url || item.image || '',
  });
  setIsModalOpen(true);
};

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiFetch(`/api/v1/menu/${id}/`, { method: 'DELETE' });
      await fetchAll();
    } catch {
      alert('Failed to delete');
    }
  };

  const filteredItems = selectedCategoryId === 'All'
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategoryId);

  // ── Table count not set → show blocker ───────────────────────────────────
  const hasNoTables = restaurant && (!restaurant.table_count || restaurant.table_count < 1);

  if (!loading && hasNoTables) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-secondary">Menu Management</h2>
          <p className="text-gray-600 mt-1">Manage your restaurant menu items and categories</p>
        </div>

        <Card className="max-w-lg mx-auto mt-16 border-2 border-dashed border-secondary/30">
          <CardContent className="flex flex-col items-center text-center py-12 gap-6">
            <div className="bg-secondary/10 rounded-full p-5">
              <UtensilsCrossed className="w-10 h-10 text-secondary" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-secondary mb-2">
                Set Up Tables First
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                You need to add tables to your restaurant before managing menu items.
                Tables let customers choose their seat while ordering.
              </p>
            </div>

            <div className="w-full space-y-3">
              <Label htmlFor="table_count" className="text-left block text-sm font-medium">
                How many tables does your restaurant have?
              </Label>
              <div className="flex gap-2">
                <Input
                  id="table_count"
                  type="number"
                  min={1}
                  placeholder="e.g. 10"
                  value={tableCountInput}
                  onChange={(e) => {
                    setTableCountInput(e.target.value);
                    setTableCountError(null);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTableCount(); }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSaveTableCount}
                  disabled={savingTableCount || !tableCountInput}
                  className="bg-secondary hover:bg-[#3d2209] whitespace-nowrap"
                >
                  {savingTableCount ? 'Saving…' : 'Save & Continue'}
                </Button>
              </div>

              {tableCountError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 text-left">
                  {tableCountError}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    
        <SubscriptionGuard>

    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-secondary">Menu Management</h2>
          <p className="text-gray-600 mt-1">
            Manage your restaurant menu items and categories
            {restaurant?.table_count ? (
              <span className="ml-2 inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                <UtensilsCrossed className="w-3 h-3" />
                {restaurant.table_count} tables
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={fetchAll} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="bg-secondary hover:bg-[#3d2209]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategoryId === 'All' ? 'default' : 'outline'}
          onClick={() => setSelectedCategoryId('All')}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategoryId === cat.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategoryId(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-12">Loading menu...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const imageUrl = menuPhotos[item.id]?.photo_url || item.image;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
  {imageUrl ? (
    <Image
      src={imageUrl}
      alt={item.name}
      width={48}
      height={48}
      className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80 transition"
      onClick={() => setPreviewImage(imageUrl)}
    />
  ) : (
    <ImageIcon className="w-8 h-8 text-secondary" />
  )}
</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {item.category_name
                          || categories.find((c) => c.id === item.category)?.name
                          || '-'}
                      </TableCell>
                      <TableCell>Rs. {item.price}</TableCell>
                      <TableCell>
                        <Badge variant={item.status ? 'default' : 'secondary'}>
                          {item.status ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MenuModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        editingItem={editingItem}
        onSubmit={handleMenuSubmit}
        categories={categories}
        restaurantId={restaurantId!}
        onCategoryCreated={fetchCategories}
      />
    </div>
    {previewImage && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/70 backdrop-blur-sm"
    onClick={() => setPreviewImage(null)}
  >
    <div className="relative max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setPreviewImage(null)}
        className="absolute -top-10 right-0 text-white text-sm flex items-center gap-1 hover:opacity-70"
      >
        <X className="w-5 h-5" /> Close
      </button>
      <Image
        src={previewImage}
        alt="preview"
        width={800}
        height={600}
        className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
      />
    </div>
  </div>
)}
      </SubscriptionGuard>
  );
}