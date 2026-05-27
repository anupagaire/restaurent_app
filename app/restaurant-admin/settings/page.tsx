'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Save, Trash2, Loader2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
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
  photos: { id: number; photo_url: string }[];
}

function Alert({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl text-sm border ${
      type === 'success'
        ? 'bg-green-50 border-green-200 text-green-700'
        : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      {type === 'success'
        ? <CheckCircle2 className="w-5 h-5 shrink-0" />
        : <AlertCircle className="w-5 h-5 shrink-0" />}
      {msg}
    </div>
  );
}

export default function GlobalSettingsPage() {
  const [restaurant, setRestaurant]       = useState<RestaurantData | null>(null);
  const [form, setForm]                   = useState({ name: '', address: '', city: '', zip: '' });
  const [loadingPage, setLoadingPage]     = useState(true);
  const [isSaving, setIsSaving]           = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto]   = useState<number | null>(null);
  const [error, setError]                 = useState('');
  const [successMsg, setSuccessMsg]       = useState('');

  // Password
  const [pw, setPw]             = useState({ password1: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError]   = useState('');

  useRequirePermission('globalSettings');

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
      const res  = await apiFetch(`/api/v1/restaurant/${restaurantId}/`);
      if (!res.ok) { setError('Failed to load restaurant data.'); return; }
      const raw  = await res.json();
      const data: RestaurantData = raw.data ?? raw;
      setRestaurant(data);
      setForm({
        name:    data.name    ?? '',
        address: data.address ?? '',
        city:    data.city    ?? '',
        zip:     data.zip     ?? '',
      });
    } catch {
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
        body:   JSON.stringify({
          name:    form.name,
          address: form.address,
          city:    form.city,
          zip:     form.zip || null,
        }),
      });
      if (!res.ok) { setError('Failed to save.'); return; }
      const raw  = await res.json();
      const data = raw.data ?? raw;
      setRestaurant(data);
      setSuccessMsg('✅ Restaurant info saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
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
      formData.append('object_id', restaurantId);
      formData.append('photo', file);
      const res = await apiFetch('/api/v1/photo/', { method: 'POST', body: formData });
      if (!res.ok) { setError(`Photo upload failed (${res.status}).`); return; }
      await fetchRestaurant();
      setSuccessMsg('✅ Photo uploaded successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Network error uploading photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Delete this photo?')) return;
    setIsDeletingPhoto(photoId);
    try {
      const res = await apiFetch(`/api/v1/photo/${photoId}/`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) { setError('Failed to delete photo.'); return; }
      setRestaurant(prev =>
        prev ? { ...prev, photos: prev.photos.filter(p => p.id !== photoId) } : prev
      );
      setSuccessMsg('Photo deleted.');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch {
      setError('Network error deleting photo.');
    } finally {
      setIsDeletingPhoto(null);
    }
  };
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');
    if (pw.password1.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    if (pw.password1 !== pw.confirm) { setPwError('Passwords do not match.'); return; }
    setPwSaving(true);
    try {
      const res  = await apiFetch('/api/v1/user/me/', {
        method: 'PATCH',
        body:   JSON.stringify({ password1: pw.password1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail ?? data?.password1?.[0] ?? JSON.stringify(data));
      setPwSuccess('✅ Password updated successfully!');
      setPw({ password1: '', confirm: '' });
    } catch (e: any) {
      setPwError(e.message);
    } finally {
      setPwSaving(false);
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#513012]">Global Settings</h2>
        <p className="text-gray-600 mt-1">Manage your restaurant profile and account</p>
      </div>

      {error      && <Alert type="error"   msg={error}      />}
      {successMsg && <Alert type="success" msg={successMsg} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#513012] font-bold">Restaurant Photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {restaurant?.photos && restaurant.photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {restaurant.photos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <Image src={photo.photo_url} alt="Restaurant photo"
                      width={120} height={120}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={isDeletingPhoto === photo.id}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isDeletingPhoto === photo.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Trash2 className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#513012]/20 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No photos uploaded yet</p>
              </div>
            )}
            <div className="flex justify-center">
              <label htmlFor="photo-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#513012] text-[#513012] text-sm font-medium cursor-pointer hover:bg-[#513012]/5 transition-colors ${isUploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                {isUploadingPhoto
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                  : <><Upload className="h-4 w-4" /> Upload Photo</>}
              </label>
              <input id="photo-upload" type="file" accept="image/*" className="hidden"
                onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-[#513012] font-bold">Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Restaurant Name <span className="text-red-500">*</span></Label>
              <Input value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Restaurant name" />
            </div>
            <div className="space-y-1">
              <Label>Address <span className="text-red-500">*</span></Label>
              <Textarea value={form.address} rows={3}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Full address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>City <span className="text-red-500">*</span></Label>
                <Input value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="Kathmandu" />
              </div>
              <div className="space-y-1">
                <Label>ZIP Code</Label>
                <Input value={form.zip}
                  onChange={e => setForm({ ...form, zip: e.target.value })}
                  placeholder="44600" />
              </div>
            </div>
            <Button onClick={handleSaveInfo} disabled={isSaving}
              className="w-full bg-[#513012] hover:bg-[#513012]/90">
              {isSaving
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#513012]">
            <Lock className="w-5 h-5" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pwSuccess && <div className="mb-4"><Alert type="success" msg={pwSuccess} /></div>}
          {pwError   && <div className="mb-4"><Alert type="error"   msg={pwError}   /></div>}

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div className="space-y-1">
              <Label>New Password <span className="text-red-500">*</span></Label>
              <Input type="password" value={pw.password1} required
                onChange={e => setPw({ ...pw, password1: e.target.value })}
                placeholder="Min 8 characters" />
            </div>
            <div className="space-y-1">
              <Label>Confirm New Password <span className="text-red-500">*</span></Label>
              <Input type="password" value={pw.confirm} required
                onChange={e => setPw({ ...pw, confirm: e.target.value })}
                placeholder="Repeat new password" />
              {pw.confirm && pw.confirm !== pw.password1 && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {pw.confirm && pw.confirm === pw.password1 && pw.password1.length >= 8 && (
                <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
              )}
            </div>
            <Button type="submit"
              disabled={pwSaving || pw.password1 !== pw.confirm || pw.password1.length < 8}
              className="w-full bg-[#513012] hover:bg-[#513012]/90">
              {pwSaving
                ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Updating...</>
                : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}