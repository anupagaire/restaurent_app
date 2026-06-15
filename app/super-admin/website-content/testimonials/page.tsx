'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Restaurant {
  id: number;
  name: string;
  description: string;
  image: string;
  image_id?: number; 
  rating: number;
  status: string;
}

interface TestimonialsData {
  testimonials_section: {
    title: string;
    description: string;
    restaurants: Restaurant[];
  };
}

export default function TestimonialsAdminPage() {
  const [data, setData] = useState<TestimonialsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    setToken(localStorage.getItem('access_token'));
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/website-content/testimonials/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch testimonials", error);
      }
    };
    fetchData();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const res = await fetch(`${BASE_URL}/api/v1/website-content/update-testimonials/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setMessage(res.ok ? '✓ Saved successfully!' : '✗ Error saving. Try again.');
  };

  const updateSection = (field: 'title' | 'description', value: string) =>
    setData(prev => prev ? {
      ...prev,
      testimonials_section: { ...prev.testimonials_section, [field]: value }
    } : prev);

  const updateRestaurant = (idx: number, field: keyof Restaurant, value: any) =>
    setData(prev => {
      if (!prev) return prev;
      const restaurants = [...prev.testimonials_section.restaurants];
      restaurants[idx] = { ...restaurants[idx], [field]: value };
      return { ...prev, testimonials_section: { ...prev.testimonials_section, restaurants } };
    });

  const handleImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingIdx(idx);
    const formData = new FormData();
    
    formData.append('photo', file);
    formData.append('type', 'testimonials_section'); 
    formData.append('purpose', 'testimonial');
    formData.append('alt', data?.testimonials_section.restaurants[idx].name || 'Testimonial');

    try {
      const res = await fetch(`${BASE_URL}/api/v1/photo/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData,
      });

      const responseData = await res.json();
      
      if (res.ok) {
        updateRestaurant(idx, 'image', responseData.photo_url);
        updateRestaurant(idx, 'image_id', responseData.id);
      } else {
        console.error("❌ Upload Error:", responseData);
        alert(`Upload failed: ${JSON.stringify(responseData.errors || responseData)}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Something went wrong during upload.');
    } finally {
      setUploadingIdx(null);
    }
  };

  const addRestaurant = () =>
    setData(prev => {
      if (!prev) return prev;
      const newItem: Restaurant = {
        id: Date.now(),
        name: '',
        description: '',
        image: '',
        rating: 5.0,
        status: 'Verified Customer',
      };
      return {
        ...prev,
        testimonials_section: {
          ...prev.testimonials_section,
          restaurants: [...prev.testimonials_section.restaurants, newItem],
        },
      };
    });

  const removeRestaurant = (idx: number) =>
    setData(prev => {
      if (!prev) return prev;
      const restaurants = prev.testimonials_section.restaurants.filter((_, i) => i !== idx);
      return { ...prev, testimonials_section: { ...prev.testimonials_section, restaurants } };
    });

  if (!data || !data.testimonials_section) return <div className="p-6 text-secondary">Loading...</div>;

  const { title, description, restaurants } = data.testimonials_section;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-secondary hover:text-secondary mb-2">
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-secondary">Testimonials Content</h1>

      <section className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg mb-2">Section Header</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            value={title}
            onChange={e => updateSection('title', e.target.value)}
          />
        </div>
        
        {/* ✅ Section Description with React Quill */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <ReactQuill
            value={description || ''}
            onChange={(val) => updateSection('description', val)}
            theme="snow"
            className="rounded-lg bg-white"
            placeholder="Enter section description..."
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Restaurants / Testimonials</h2>
        {restaurants.map((r, idx) => (
          <div key={r.id} className="border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-600">#{idx + 1} {r.name && `- ${r.name}`}</span>
              <button
                onClick={() => removeRestaurant(idx)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* ✅ IMAGE UPLOAD UI */}
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <div className="flex items-center gap-4">
                {r.image && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-300">
                    <Image src={r.image} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <label className="cursor-pointer flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition">
                  {uploadingIdx === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploadingIdx === idx ? 'Uploading...' : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(idx, e)}
                    disabled={uploadingIdx !== null}
                  />
                </label>
              </div>
              {r.image && <p className="text-xs text-secondary mt-1 truncate max-w-xs">{r.image}</p>}
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                value={r.name}
                onChange={e => updateRestaurant(idx, 'name', e.target.value)}
              />
            </div>

            {/* Status Field */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                value={r.status}
                onChange={e => updateRestaurant(idx, 'status', e.target.value)}
              />
            </div>
            
            {/* ✅ Restaurant Description with React Quill */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <ReactQuill
                value={r.description || ''}
                onChange={(val) => updateRestaurant(idx, 'description', val)}
                theme="snow"
                className="rounded-lg bg-white"
                placeholder="Enter testimonial description..."
              />
            </div>
            
            {/* Rating Field */}
            <div>
              <label className="block text-sm font-medium mb-1">Rating (0–5)</label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                value={r.rating}
                onChange={e => updateRestaurant(idx, 'rating', parseFloat(e.target.value))}
              />
            </div>
          </div>
        ))}
        <button
          onClick={addRestaurant}
          className="flex items-center gap-2 text-sm text-secondary hover:bg-secondary/5 px-3 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-secondary text-white px-8 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition font-medium"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {message && (
          <span className={`text-sm font-medium ${message.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}