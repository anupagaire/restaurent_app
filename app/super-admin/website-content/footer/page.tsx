'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface LinkItem { href: string; label: string; }
interface ContactItems { email: string; phone: string; addressLine1: string; addressLine2: string; }
interface Column { type: 'links' | 'contact'; title: string; items: LinkItem[] | ContactItems; }
interface Social { href: string; icon: string; name: string; }
interface FooterData {
  brand: { logo: string; name: string; tagline: string; description: string; };
  columns: Column[];
  socials: Social[];
}

const DEFAULT_FOOTER_DATA: FooterData = {
  brand: { name: '', tagline: '', description: '', logo: '' },
  columns: [],
  socials: [],
};

export default function FooterContentPage() {
  const [data, setData] = useState<FooterData>(DEFAULT_FOOTER_DATA);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const { currentUser } = useAuth();
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/website-content/footer/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch footer data');
        const json = await res.json();
        
        setData({
          brand: { ...DEFAULT_FOOTER_DATA.brand, ...(json.brand || {}) },
          columns: Array.isArray(json.columns) ? json.columns : DEFAULT_FOOTER_DATA.columns,
          socials: Array.isArray(json.socials) ? json.socials : DEFAULT_FOOTER_DATA.socials,
        });
      } catch (error) {
        console.error('Error fetching footer:', error);
        setMessage('✗ Failed to load footer data.');
      }
    };
    
    if (token) fetchFooter();
  }, [token]);

  // ✅ IMAGE UPLOAD HANDLER - Using Photo API
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('purpose', 'logo');
    formData.append('type', 'footer_content');
    formData.append('alt', data.brand.name || 'Footer Logo');
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
        setData(prev => ({ ...prev, brand: { ...prev.brand, logo: imageUrl } }));
      } else {
        console.error('Upload failed:', responseData);
        setMessage(`✗ Upload failed: ${JSON.stringify(responseData.errors || responseData.message)}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('✗ Something went wrong during upload.');
    } finally {
      setUploading(false);
    }
  };

  const updateBrand = (field: keyof typeof DEFAULT_FOOTER_DATA.brand, value: string) =>
    setData(prev => ({ ...prev, brand: { ...prev.brand, [field]: value } }));

  const updateLinkItem = (colIdx: number, itemIdx: number, field: 'href' | 'label', value: string) =>
    setData(prev => {
      const columns = [...prev.columns];
      const items = [...(columns[colIdx].items as LinkItem[])];
      items[itemIdx] = { ...items[itemIdx], [field]: value };
      columns[colIdx] = { ...columns[colIdx], items };
      return { ...prev, columns };
    });

  const addLinkItem = (colIdx: number) =>
    setData(prev => {
      const columns = [...prev.columns];
      const items = [...(columns[colIdx].items as LinkItem[]), { href: '', label: '' }];
      columns[colIdx] = { ...columns[colIdx], items };
      return { ...prev, columns };
    });

  const removeLinkItem = (colIdx: number, itemIdx: number) =>
    setData(prev => {
      const columns = [...prev.columns];
      const items = (columns[colIdx].items as LinkItem[]).filter((_, i) => i !== itemIdx);
      columns[colIdx] = { ...columns[colIdx], items };
      return { ...prev, columns };
    });

  const updateContact = (colIdx: number, field: keyof ContactItems, value: string) =>
    setData(prev => {
      const columns = [...prev.columns];
      columns[colIdx] = { 
        ...columns[colIdx], 
        items: { ...(columns[colIdx].items as ContactItems), [field]: value } 
      };
      return { ...prev, columns };
    });

  const updateSocial = (idx: number, field: keyof Social, value: string) =>
    setData(prev => {
      const socials = [...prev.socials];
      socials[idx] = { ...socials[idx], [field]: value };
      return { ...prev, socials };
    });

  const addSocial = () =>
    setData(prev => ({ ...prev, socials: [...prev.socials, { href: '', icon: '', name: '' }] }));

  const removeSocial = (idx: number) =>
    setData(prev => ({ ...prev, socials: prev.socials.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${BASE_URL}/api/v1/website-content/update-footer/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Save failed');
      setMessage('✓ Saved successfully!');
    } catch (error) {
      console.error('Error saving footer:', error);
      setMessage('✗ Error saving. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!data || !data.brand) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-secondary mb-2">
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-secondary">Footer Content</h1>

      {/* BRAND */}
      <section className="border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-lg mb-4">Brand</h2>
        <div className="space-y-4">
          
          {/* 🖼️ LOGO UPLOAD SECTION */}
          <div>
            <label className="block text-sm font-medium capitalize mb-1">Logo</label>
            <div className="flex items-start gap-4">
              {/* Image Preview */}
              <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0 relative">
                {data.brand.logo ? (
                  <Image 
                    src={data.brand.logo} 
                    alt="Logo Preview" 
                    fill 
                    className="object-contain p-2" 
                  />
                ) : (
                  <span className="text-2xl text-gray-300">🖼️</span>
                )}
              </div>
              
              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <label className="cursor-pointer flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition inline-flex">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading...' : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-400">Supports: JPG, PNG, SVG, WebP</p>
                
                {/* Fallback URL input */}
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  placeholder="Or paste image URL here..."
                  value={data.brand.logo}
                  onChange={e => updateBrand('logo', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Other Brand Fields */}
          <div>
            <label className="block text-sm font-medium capitalize mb-1">Name</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              value={data.brand.name ?? ''}
              onChange={e => updateBrand('name', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium capitalize mb-1">Tagline</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              value={data.brand.tagline ?? ''}
              onChange={e => updateBrand('tagline', e.target.value)}
            />
          </div>

          {/* ✅ Description with React Quill */}
          <div>
            <label className="block text-sm font-medium capitalize mb-1">Description</label>
            <ReactQuill
              value={data.brand.description ?? ''}
              onChange={(val) => updateBrand('description', val)}
              theme="snow"
              className="rounded-lg bg-white"
              placeholder="Enter footer brand description..."
            />
          </div>
        </div>
      </section>

      {/* COLUMNS */}
      {data.columns.map((col, colIdx) => (
        <section key={colIdx} className="border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-4">{col.title || 'Column'}</h2>
          {col.type === 'links' ? (
            <div className="space-y-3">
              {(col.items as LinkItem[]).map((item, itemIdx) => (
                <div key={itemIdx} className="flex gap-2 items-center">
                  <input
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                    placeholder="Label"
                    value={item.label ?? ''}
                    onChange={e => updateLinkItem(colIdx, itemIdx, 'label', e.target.value)}
                  />
                  <input
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                    placeholder="URL (e.g. /about)"
                    value={item.href ?? ''}
                    onChange={e => updateLinkItem(colIdx, itemIdx, 'href', e.target.value)}
                  />
                  <button onClick={() => removeLinkItem(colIdx, itemIdx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={() => addLinkItem(colIdx)} className="flex items-center gap-2 text-sm text-secondary hover:bg-secondary/5 px-3 py-2 rounded-lg transition">
                <Plus className="w-4 h-4" /> Add Link
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(['addressLine1', 'addressLine2', 'phone', 'email'] as const).map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium capitalize mb-1">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                    value={(col.items as ContactItems)?.[field] ?? ''}
                    onChange={e => updateContact(colIdx, field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* SOCIALS */}
      <section className="border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-lg mb-4">Social Links</h2>
        <div className="space-y-3">
          {data.socials.map((s, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                placeholder="facebook"
                value={s.icon ?? ''}
                onChange={e => updateSocial(idx, 'icon', e.target.value)}
              />
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                placeholder="Name"
                value={s.name ?? ''}
                onChange={e => updateSocial(idx, 'name', e.target.value)}
              />
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                placeholder="URL"
                value={s.href ?? ''}
                onChange={e => updateSocial(idx, 'href', e.target.value)}
              />
              <button onClick={() => removeSocial(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button onClick={addSocial} className="flex items-center gap-2 text-sm text-secondary hover:bg-secondary/5 px-3 py-2 rounded-lg transition">
            <Plus className="w-4 h-4" /> Add Social
            </button>
        </div>
      </section>

      {/* SAVE */}
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