'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Save, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { useRequirePermission } from '@/hooks/usePermission';

interface RestaurantData {
  id: number;
  name: string;
  address: string;
  city: string;
  zip: string;
  availability: string | null;
  status: boolean;
  photos: { id: number; photo: string }[];
}

export default function GlobalSettingsPage() {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
  });

  const [loadingPage, setLoadingPage] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  useRequirePermission('globalSettings'); // ← YO ADD GARO

  const restaurantId =
    typeof window !== 'undefined' ? localStorage.getItem('restaurant_id') : null;

  useEffect(() => {
    if (!restaurantId) {
      setError('Restaurant ID not found. Please login again.');
      setLoadingPage(false);
      return;
    }
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      setLoadingPage(true);
      const res = await apiFetch(`/api/v1/restaurant/${restaurantId}/`);
      if (!res.ok) {
        setError('Failed to load restaurant data.');
        return;
      }
      const data: RestaurantData = await res.json();
      setRestaurant(data);
      setForm({
        name: data.name ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        zip: data.zip ?? '',
      });
    } catch (err) {
      setError('Network error loading restaurant.');
    } finally {
      setLoadingPage(false);
    }
  };

  const handleSaveInfo = async () => {
    if (!restaurantId) return;
    setIsSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await apiFetch(`/api/v1/restaurant/${restaurantId}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          city: form.city,
          zip: form.zip || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Save failed:', text);
        setError('Failed to save. Check console for details.');
        return;
      }

      const data = await res.json();
      setRestaurant(data);
      setSuccessMsg('✅ Restaurant info saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Network error while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restaurantId) return;

    setIsUploadingPhoto(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('type', 'restaurant');      
      formData.append('object_id', restaurantId);  // ← change 'restaurant' to 'object_id'
      formData.append('photo', file);

      const res = await apiFetch(`/api/v1/photo/`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Photo upload failed:', res.status, text);
        setError(`Photo upload failed (${res.status}). Check console.`);
        return;
      }

      await fetchRestaurant();
      setSuccessMsg('✅ Photo uploaded successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Network error uploading photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Delete this photo?')) return;
    setIsDeletingPhoto(photoId);

    try {
      const res = await apiFetch(`/api/v1/photo/${photoId}/`, {
        method: 'DELETE',
      });

      if (!res.ok && res.status !== 204) {
        setError('Failed to delete photo.');
        return;
      }

      setRestaurant((prev) =>
        prev
          ? { ...prev, photos: prev.photos.filter((p) => p.id !== photoId) }
          : prev
      );
      setSuccessMsg('Photo deleted.');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      setError('Network error deleting photo.');
    } finally {
      setIsDeletingPhoto(null);
    }
  };

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#513012]" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#513012]">Global Settings</h2>
        <p className="text-gray-600 mt-1">Manage your restaurant profile and branding</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#513012] font-bold">Restaurant Photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {restaurant?.photos && restaurant.photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {restaurant.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <Image
                      src={photo.photo}
                      alt="Restaurant photo"
                      width={120}
                      height={120}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={isDeletingPhoto === photo.id}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isDeletingPhoto === photo.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#513012]/20 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500">No photos uploaded yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Upload photos to show on your restaurant page
                </p>
              </div>
            )}

            {/* ✅ Plain label wrapping hidden input — most reliable cross-browser */}
            <div className="flex justify-center">
              <label
                htmlFor="photo-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#513012] text-[#513012] text-sm font-medium cursor-pointer hover:bg-[#513012]/5 transition-colors ${isUploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {isUploadingPhoto ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </>
                )}
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
              />
            </div>

          </CardContent>
        </Card>

        {/* Restaurant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#513012] font-bold">Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Restaurant Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Restaurant name"
              />
            </div>

            <div className="space-y-2">
              <Label>Address *</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                placeholder="Full address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Kathmandu"
                />
              </div>
              <div className="space-y-2">
                <Label>ZIP Code</Label>
                <Input
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  placeholder="44600"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveInfo}
          disabled={isSaving}
          className="bg-[#513012] hover:bg-[#513012]/90 px-10 py-6 text-lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save Changes
              <Save className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}