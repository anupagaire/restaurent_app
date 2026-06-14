'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const ICON_OPTIONS = ['users', 'globe', 'compass', 'star', 'heart', 'zap', 'shield', 'check'];

export default function AboutSectionsAdminPage() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [uploading, setUploading] = useState<number | null>(null); // Track which image is uploading (0-3)
  const router = useRouter();

  useEffect(() => { setToken(localStorage.getItem('access_token')); }, []);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const res = await fetch(`${BASE_URL}/api/v1/website-content/about-sections/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      setData(await res.json());
    };
    fetchData();
  }, [token]);

  // ✅ IMAGE UPLOAD HANDLER
  const handleImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(idx);
    
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('purpose', 'images');
    formData.append('type', 'commitment_section');
    formData.append('alt', '');
    // formData.append('object_id', '0'); // Removed to avoid 400 error

    try {
      const res = await fetch(`${BASE_URL}/api/v1/photo/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const responseData = await res.json();
      
      if (res.ok) {
        const imageUrl = responseData.photo_url;
        const imgs = [...data.commitment_section.images];
        imgs[idx] = { ...imgs[idx], image: imageUrl };
        update(['commitment_section', 'images'], imgs);
      } else {
        console.error('Upload failed:', responseData);
        alert(`Upload failed: ${JSON.stringify(responseData.errors || responseData.message)}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Something went wrong during upload.');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const res = await fetch(`${BASE_URL}/api/v1/website-content/update-about-sections/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setMessage(res.ok ? '✓ Saved successfully!' : '✗ Error saving.');
  };

  const update = (path: string[], value: any) => {
    setData((prev: any) => {
      const next = structuredClone(prev);
      let obj = next;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
      obj[path[path.length - 1]] = value;
      return next;
    });
  };

  if (!data) return <div className="p-6 text-gray-500">Loading...</div>;

  const c = data.commitment_section;
  const w = data.why_choose_us_section;

  const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30';

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-secondary mb-2">
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-secondary">About Sections Content</h1>

      {/* ── COMMITMENT ── */}
      <section className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg">Commitment Section</h2>

        {[
          { label: 'Title', path: ['commitment_section', 'title'] },
          { label: 'Highlight Text (e.g. "to You")', path: ['commitment_section', 'highlight_text'] },
          { label: 'Experience Title', path: ['commitment_section', 'experience_title'] },
        ].map(({ label, path }) => (
          <div key={label}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input className={inputCls} value={path.reduce((o, k) => o?.[k], data) ?? ''} onChange={e => update(path, e.target.value)} />
          </div>
        ))}

        {[
          { label: 'Description', path: ['commitment_section', 'description'] },
          { label: 'Bottom Text', path: ['commitment_section', 'bottom_text'] },
        ].map(({ label, path }) => (
          <div key={label}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <ReactQuill
              value={path.reduce((o, k) => o?.[k], data) ?? ''}
              onChange={val => update(path, val)}
              className="rounded-lg"
            />
          </div>
        ))}
        
        {/* Experience Points */}
        <div>
          <label className="block text-sm font-medium mb-2">Experience Points</label>
          <div className="space-y-2">
            {c.experience_points.map((pt: string, idx: number) => (
              <div key={idx} className="flex gap-2 items-center">
                <input className={inputCls} value={pt} onChange={e => { const pts = [...c.experience_points]; pts[idx] = e.target.value; update(['commitment_section', 'experience_points'], pts); }} />
                <button onClick={() => { const pts = c.experience_points.filter((_: any, i: number) => i !== idx); update(['commitment_section', 'experience_points'], pts); }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={() => update(['commitment_section', 'experience_points'], [...c.experience_points, ''])} className="flex items-center gap-2 text-sm text-secondary hover:bg-secondary/5 px-3 py-2 rounded-lg transition">
              <Plus className="w-4 h-4" /> Add Point
            </button>
          </div>
        </div>

        {/* ✅ Images with Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Images (4 images)</label>
          <div className="space-y-3">
            {c.images.map((img: any, idx: number) => (
              <div key={img.id} className="flex gap-3 items-start p-3 border border-gray-200 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 w-6 pt-2">#{idx + 1}</span>
                
                {/* Image Preview */}
                {img.image && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300 bg-gray-100 flex-shrink-0">
                    <Image 
                      src={img.image} 
                      alt={img.alt || `Image ${idx + 1}`} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                )}
                
                <div className="flex-1 space-y-2">
                  {/* Upload Button */}
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">
                      {uploading === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploading === idx ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(idx, e)}
                        disabled={uploading !== null}
                      />
                    </label>
                    {img.image && (
                      <span className="text-xs text-gray-400 truncate flex-1">{img.image}</span>
                    )}
                  </div>
                  
                  {/* Alt Text */}
                  <input 
                    className={inputCls} 
                    placeholder="Alt text" 
                    value={img.alt} 
                    onChange={e => { 
                      const imgs = [...c.images]; 
                      imgs[idx] = { ...imgs[idx], alt: e.target.value }; 
                      update(['commitment_section', 'images'], imgs); 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg">Why Choose Us Section</h2>

        {[
          { label: 'Title', path: ['why_choose_us_section', 'title'] },
        ].map(({ label, path }) => (
          <div key={label}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input className={inputCls} value={path.reduce((o, k) => o?.[k], data) ?? ''} onChange={e => update(path, e.target.value)} />
          </div>
        ))}

        {[
          { label: 'Description', path: ['why_choose_us_section', 'description'] },
          { label: 'Bottom Text', path: ['why_choose_us_section', 'bottom_text'] },
        ].map(({ label, path }) => (
          <div key={label}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <ReactQuill
              value={path.reduce((o, k) => o?.[k], data) ?? ''}
              onChange={val => update(path, val)}
              className="rounded-lg"
            />
          </div>
        ))}
        
        {/* Benefits */}
        <div>
          <label className="block text-sm font-medium mb-2">Benefits</label>
          <div className="space-y-3">
            {w.benefits.map((b: any, idx: number) => (
              <div key={b.id} className="flex gap-2 items-center">
                <select
                  className="w-36 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  value={b.icon}
                  onChange={e => { const benefits = [...w.benefits]; benefits[idx] = { ...benefits[idx], icon: e.target.value }; update(['why_choose_us_section', 'benefits'], benefits); }}
                >
                  {ICON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <input className={inputCls} placeholder="Benefit text" value={b.text}
                  onChange={e => { const benefits = [...w.benefits]; benefits[idx] = { ...benefits[idx], text: e.target.value }; update(['why_choose_us_section', 'benefits'], benefits); }}
                />
                <button onClick={() => { const benefits = w.benefits.filter((_: any, i: number) => i !== idx); update(['why_choose_us_section', 'benefits'], benefits); }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={() => update(['why_choose_us_section', 'benefits'], [...w.benefits, { id: Date.now(), icon: 'star', text: '' }])} className="flex items-center gap-2 text-sm text-secondary hover:bg-secondary/5 px-3 py-2 rounded-lg transition">
              <Plus className="w-4 h-4" /> Add Benefit
            </button>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button onClick={handleSave} disabled={saving} className="bg-secondary text-white px-8 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition font-medium">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {message && <span className={`text-sm font-medium ${message.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{message}</span>}
      </div>
    </div>
  );
}