'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Restaurant {
  id: number;
  name: string;
  description: string;
  image: string;
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
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('access_token'));
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const res = await fetch(`${BASE_URL}/api/v1/website-content/testimonials/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
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

  const updateRestaurant = (idx: number, field: keyof Restaurant, value: string | number) =>
    setData(prev => {
      if (!prev) return prev;
      const restaurants = [...prev.testimonials_section.restaurants];
      restaurants[idx] = { ...restaurants[idx], [field]: value };
      return { ...prev, testimonials_section: { ...prev.testimonials_section, restaurants } };
    });

  const addRestaurant = () =>
    setData(prev => {
      if (!prev) return prev;
      const newItem: Restaurant = {
        id: Date.now(),
        name: '',
        description: '',
        image: '',
        rating: 5.0,
        status: 'Available to Order',
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

  if (!data || !data.testimonials_section) return <div className="p-6 text-gray-500">Loading...</div>;

  const { title, description, restaurants } = data.testimonials_section;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-[#513012]">Testimonials Content</h1>

      <section className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg mb-2">Section Header</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
            value={title}
            onChange={e => updateSection('title', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30 resize-none"
            value={description}
            onChange={e => updateSection('description', e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Restaurants</h2>
        {restaurants.map((r, idx) => (
          <div key={r.id} className="border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-600">#{idx + 1}</span>
              <button
                onClick={() => removeRestaurant(idx)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {([
              { field: 'name',        label: 'Name',        type: 'text' },
              { field: 'image',       label: 'Image URL',   type: 'text' },
              { field: 'status',      label: 'Status',      type: 'text' },
              { field: 'description', label: 'Description', type: 'textarea' },
            ] as const).map(({ field, label, type }) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                {type === 'textarea' ? (
                  <textarea
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30 resize-none"
                    value={r[field] as string}
                    onChange={e => updateRestaurant(idx, field, e.target.value)}
                  />
                ) : (
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                    value={r[field] as string}
                    onChange={e => updateRestaurant(idx, field, e.target.value)}
                  />
                )}
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1">Rating (0–5)</label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                value={r.rating}
                onChange={e => updateRestaurant(idx, 'rating', parseFloat(e.target.value))}
              />
            </div>
          </div>
        ))}
        <button
          onClick={addRestaurant}
          className="flex items-center gap-2 text-sm text-[#513012] hover:bg-[#513012]/5 px-3 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> Add Restaurant
        </button>
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#513012] text-white px-8 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition font-medium"
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