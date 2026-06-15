'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, Save, Trash2, Plus } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface Photo {
  id?: number;
  photo_url: string;
  alt: string;
  purpose: string;
}

interface AboutData {
  id?: number;
  restaurant: number;
  section_type: string;
  title: string;
  subtitle: string;
  content: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  photos: Photo[];
}

export default function RestaurantAboutAdminPage() {
  const { profile } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [data, setData] = useState<AboutData>({
    restaurant: profile?.restaurant || 0,
    section_type: 'about',
    title: '',
    subtitle: '',
    content: '',
    meta_title: '',
    meta_description: '',
    is_published: true,
    photos: [],
  });

  useEffect(() => {
    if (!profile?.restaurant) return;
    fetchAboutData();
  }, [profile]);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      
      const res = await apiFetch(`/api/v1/restaurant-site/restaurant/${profile?.restaurant}/about/`);
      
      if (res.ok) {
        const jsonData = await res.json();
        
        if (jsonData.id) {
          try {
            const photosRes = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/v1/photo/?type=restaurant_website_section&purpose=about&object_id=${jsonData.id}`,
  { cache: 'no-store' }
);
            
            if (photosRes.ok) {
              const photosData = await photosRes.json();
              const photos = photosData.results || photosData || [];
              
              jsonData.photos = photos.map((p: any) => ({
                id: p.id,
                photo_url: p.photo_url,
                alt: p.alt || '',
                purpose: p.purpose || 'about',
              }));
              
              console.log('✅ Photos fetched:', jsonData.photos);
            }
          } catch (photoError) {
            console.error('Photo fetch error:', photoError);
          }
        }
        
        setData(jsonData);
      } else if (res.status === 404) {
        setData(prev => ({ ...prev, restaurant: profile?.restaurant || 0 }));
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.restaurant) return;

    if (!data.id) {
      alert('⚠️ Please save the about page FIRST before uploading photos!');
      return;
    }

    setUploading(index);
    const formData = new FormData();
    formData.append('photo', file);
formData.append('type', 'restaurant_website_section');
formData.append('purpose', 'about');
formData.append('object_id', String(data.id));
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication required.');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/photo/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });



if (res.ok) {
      setMessage('✓ Image uploaded successfully!');
      // ✅ Fresh data fetch गर्ने
      await fetchAboutData();
    } else {
      const errorData = await res.json().catch(() => ({}));
      alert(`Upload failed: ${JSON.stringify(errorData)}`);
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Network error during upload.');
  } finally {
    setUploading(null);
  }
};







  //     if (res.ok) {
  //       const photoData = await res.json();
  //       const updatedPhotos = [...data.photos];
  //       updatedPhotos[index] = {
  //         ...updatedPhotos[index],
  //         photo_url: photoData.photo_url,
  //         id: photoData.id,
  //       };
  //       setData(prev => ({ ...prev, photos: updatedPhotos }));
  //       setMessage('✓ Image uploaded successfully!');
  //     } else {
  //       const errorData = await res.json().catch(() => ({}));
  //       alert(`Upload failed: ${JSON.stringify(errorData.errors || errorData)}`);
  //     }
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     alert('Network error during upload.');
  //   } finally {
  //     setUploading(null);
  //   }
  // };

  const addPhoto = () => {
    setData(prev => ({
      ...prev,
      photos: [...prev.photos, { photo_url: '', alt: '', purpose: 'about' }],
    }));
  };

  const removePhoto = async (index: number) => {
    const photo = data.photos[index];
    
    if (photo.id) {
      try {
        const token = localStorage.getItem('access_token');
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/photo/${photo.id}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch (error) {
        console.error('Photo delete error:', error);
      }
    }
    
    setData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const updatePhoto = (index: number, field: keyof Photo, value: string) => {
    const updatedPhotos = [...data.photos];
    updatedPhotos[index] = { ...updatedPhotos[index], [field]: value };
    setData(prev => ({ ...prev, photos: updatedPhotos }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const method = data.id ? 'PATCH' : 'POST';
      const url = `/api/v1/restaurant-site/restaurant/${profile?.restaurant}/about/`;

      const { photos, ...aboutData } = data;
      
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(aboutData),
      });

      if (res.ok) {
        const savedData = await res.json();
        
        setData({ ...savedData, photos: data.photos });
        setMessage('✓ Saved successfully!');
      } else {
        const errorData = await res.json();
        setMessage(`✗ Error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage('✗ Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">About Page</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant&apos;s about page content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-secondary text-white px-6 py-2.5 rounded-lg hover:bg-secondary/90 disabled:opacity-50 transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-secondary">Basic Information</h2>
        
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={data.title}
            onChange={e => setData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-secondary/30"
            placeholder="About Our Restaurant"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Subtitle</label>
          <input
            type="text"
            value={data.subtitle}
            onChange={e => setData(prev => ({ ...prev, subtitle: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-secondary/30"
            placeholder="A brief tagline"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <ReactQuill
            value={data.content}
            onChange={value => setData(prev => ({ ...prev, content: value }))}
            theme="snow"
            className="bg-white rounded-lg"
            placeholder="Write your restaurant's story..."
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_published"
            checked={data.is_published}
            onChange={e => setData(prev => ({ ...prev, is_published: e.target.checked }))}
            className="w-4 h-4"
          />
          <label htmlFor="is_published" className="text-sm font-medium">
            Published (visible to customers)
          </label>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-secondary">SEO Settings</h2>
        
        <div>
          <label className="block text-sm font-medium mb-2">Meta Title</label>
          <input
            type="text"
            value={data.meta_title}
            onChange={e => setData(prev => ({ ...prev, meta_title: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-secondary/30"
            placeholder="SEO title for search engines"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Meta Description</label>
          <textarea
            value={data.meta_description}
            onChange={e => setData(prev => ({ ...prev, meta_description: e.target.value }))}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none"
            placeholder="Brief description for search engines"
          />
        </div>
      </div>

      {/* Photos */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-secondary">Photos ({data.photos.length})</h2>
          <button
            onClick={addPhoto}
            disabled={!data.id}
            className="flex items-center gap-2 text-sm text-secondary hover:bg-secondary/5 px-3 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Add Photo
          </button>
        </div>

        {!data.id && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            ⚠️ Please save the about page first before adding photos.
          </div>
        )}

        {data.photos.length === 0 ? (
          <p className="text-secondary text-center py-8">No photos yet. Click &quot;Add Photo&quot; to get started.</p>
        ) : (
          <div className="space-y-4">
            {data.photos.map((photo, index) => (
              <div key={photo.id || index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold text-gray-600">Photo #{index + 1}</span>
                  <button
                    onClick={() => removePhoto(index)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {photo.photo_url && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
                      <Image
                        src={photo.photo_url}
                        alt={photo.alt || 'Photo'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <label className="cursor-pointer flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition">
                    {uploading === index ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading === index ? 'Uploading...' : photo.photo_url ? 'Replace Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(index, e)}
                      disabled={uploading !== null}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={photo.alt}
                    onChange={e => updatePhoto(index, 'alt', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                    placeholder="Describe this image"
                  />
                </div>

                {photo.photo_url && (
                  <p className="text-xs text-secondary truncate">{photo.photo_url}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-secondary text-white px-8 py-3 rounded-lg hover:bg-secondary/90 disabled:opacity-50 transition font-medium"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}