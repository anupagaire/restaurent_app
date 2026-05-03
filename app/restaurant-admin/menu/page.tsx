'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import MenuModal from '@/components/restaurant-admin/MenuModal';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { useRequirePermission } from '@/hooks/usePermission';
import Image from 'next/image';

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

// Shape returned by GET /api/v1/photo/
interface MenuPhoto {
  id: number;        // photo record ID – needed for PUT (update)
  object_id: number; // menu item ID
  photo_url: string; // displayable URL
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Store the full photo record so we have the photo `id` for updates
  const [menuPhotos, setMenuPhotos] = useState<Record<number, MenuPhoto>>({});

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'All'>('All');
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  useRequirePermission('menuSettings');

  // ── Fetch restaurant ID ────────────────────────────────────────────────────
  const fetchRestaurantId = async () => {
    try {
      const res = await apiFetch('/api/v1/user/me/');
      const user = await res.json();
      if (user?.restaurant) setRestaurantId(user.restaurant);
    } catch (err) {
      console.error('Failed to fetch restaurant ID', err);
    }
  };

  useEffect(() => { fetchRestaurantId(); }, []);
  useEffect(() => { if (restaurantId) fetchAll(); }, [restaurantId]);

  // ── Individual fetchers ────────────────────────────────────────────────────
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

  /**
   * Fetch all photos of type=menu and build a map of:
   *   menuItemId → { id (photo record id), object_id, photo_url }
   *
   * We keep the full photo record so we can call PUT /api/v1/photo/{id}/
   * when the user replaces an image on an existing menu item.
   */
  const fetchMenuPhotos = async () => {
    if (!restaurantId) return;
    try {
      // Fetch all pages if needed; for most restaurants one page is enough.
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
    await Promise.all([fetchCategories(), fetchMenuItems(), fetchMenuPhotos()]);
    setLoading(false);
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filteredItems = selectedCategoryId === 'All'
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategoryId);

  // ── Create / Update menu item + photo ─────────────────────────────────────
  const handleMenuSubmit = async (payload: any, selectedFile: File | null) => {
    if (!restaurantId) return;

    const isEditing = !!editingItem;
    const url = isEditing
      ? `/api/v1/menu/${editingItem!.id}/`
      : `/api/v1/menu/`;

    // 1️⃣  Save the menu item (text fields)
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

    // 2️⃣  Handle photo upload / update
    if (selectedFile && menuId) {
      const existingPhoto = menuPhotos[menuId]; // defined only if this item already has a photo

      const formData = new FormData();
      formData.append('type', 'menu');
      formData.append('object_id', menuId.toString());
      // ✅ Correct field name is `photo`, NOT `photo_url`
      formData.append('photo', selectedFile);

      if (existingPhoto) {
        // ✅ Photo already exists → UPDATE with PUT /api/v1/photo/{id}/
        await apiFetch(`/api/v1/photo/${existingPhoto.id}/`, {
          method: 'PUT',
          body: formData,
        }).catch(console.error);
      } else {
        // ✅ No photo yet → CREATE with POST /api/v1/photo/
        await apiFetch('/api/v1/photo/', {
          method: 'POST',
          body: formData,
        }).catch(console.error);
      }
    }

    // 3️⃣  Refresh everything so the table shows the updated image
    await fetchAll();

    setIsModalOpen(false);
    setEditingItem(null);
  };

  // ── Edit / Delete ──────────────────────────────────────────────────────────
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiFetch(`/api/v1/menu/${id}/`, { method: 'DELETE' });
      await fetchAll();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#513012]">Menu Management</h2>
          <p className="text-gray-600 mt-1">Manage your restaurant menu items and categories</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={fetchAll} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="bg-[#513012]"
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
                  // ✅ Use photo_url from the photo record; fallback to item.image
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
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
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
  );
}