'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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

export default function FooterContentPage() {
  const [data, setData] = useState<FooterData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { currentUser } = useAuth();
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  useEffect(() => {
    const fetchFooter = async () => {
      const res = await fetch(`${BASE_URL}/api/v1/website-content/footer/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    };
    fetchFooter();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const res = await fetch(`${BASE_URL}/api/v1/website-content/update-footer/`, {
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

  const updateBrand = (field: string, value: string) =>
    setData(prev => prev ? { ...prev, brand: { ...prev.brand, [field]: value } } : prev);

  const updateLinkItem = (colIdx: number, itemIdx: number, field: 'href' | 'label', value: string) =>
    setData(prev => {
      if (!prev) return prev;
      const columns = [...prev.columns];
      const items = [...(columns[colIdx].items as LinkItem[])];
      items[itemIdx] = { ...items[itemIdx], [field]: value };
      columns[colIdx] = { ...columns[colIdx], items };
      return { ...prev, columns };
    });

  const addLinkItem = (colIdx: number) =>
    setData(prev => {
      if (!prev) return prev;
      const columns = [...prev.columns];
      const items = [...(columns[colIdx].items as LinkItem[]), { href: '', label: '' }];
      columns[colIdx] = { ...columns[colIdx], items };
      return { ...prev, columns };
    });

  const removeLinkItem = (colIdx: number, itemIdx: number) =>
    setData(prev => {
      if (!prev) return prev;
      const columns = [...prev.columns];
      const items = (columns[colIdx].items as LinkItem[]).filter((_, i) => i !== itemIdx);
      columns[colIdx] = { ...columns[colIdx], items };
      return { ...prev, columns };
    });

  const updateContact = (colIdx: number, field: keyof ContactItems, value: string) =>
    setData(prev => {
      if (!prev) return prev;
      const columns = [...prev.columns];
      columns[colIdx] = { ...columns[colIdx], items: { ...(columns[colIdx].items as ContactItems), [field]: value } };
      return { ...prev, columns };
    });

  const updateSocial = (idx: number, field: keyof Social, value: string) =>
    setData(prev => {
      if (!prev) return prev;
      const socials = [...prev.socials];
      socials[idx] = { ...socials[idx], [field]: value };
      return { ...prev, socials };
    });

  const addSocial = () =>
    setData(prev => prev ? { ...prev, socials: [...prev.socials, { href: '', icon: '', name: '' }] } : prev);

  const removeSocial = (idx: number) =>
    setData(prev => prev ? { ...prev, socials: prev.socials.filter((_, i) => i !== idx) } : prev);

  if (!data) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#513012] mb-2">
  ← Back
</button>
      <h1 className="text-2xl font-bold text-[#513012]">Footer Content</h1>

      {/* BRAND */}
      <section className="border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-lg mb-4">Brand</h2>
        <div className="space-y-3">
          {(['name', 'tagline', 'description', 'logo'] as const).map(field => (
            <div key={field}>
              <label className="block text-sm font-medium capitalize mb-1">{field}</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                value={data.brand[field] ?? ''}
                onChange={e => updateBrand(field, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* COLUMNS */}
      {data.columns.map((col, colIdx) => (
        <section key={colIdx} className="border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-4">{col.title}</h2>
          {col.type === 'links' ? (
            <div className="space-y-3">
              {(col.items as LinkItem[]).map((item, itemIdx) => (
                <div key={itemIdx} className="flex gap-2 items-center">
                  <input
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                    placeholder="Label"
                    value={item.label}
                    onChange={e => updateLinkItem(colIdx, itemIdx, 'label', e.target.value)}
                  />
                  <input
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                    placeholder="URL (e.g. /about)"
                    value={item.href}
                    onChange={e => updateLinkItem(colIdx, itemIdx, 'href', e.target.value)}
                  />
                  <button
                    onClick={() => removeLinkItem(colIdx, itemIdx)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addLinkItem(colIdx)}
                className="flex items-center gap-2 text-sm text-[#513012] hover:bg-[#513012]/5 px-3 py-2 rounded-lg transition"
              >
                <Plus className="w-4 h-4" /> Add Link
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(['addressLine1', 'addressLine2', 'phone', 'email'] as const).map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium capitalize mb-1">
                    {field.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                    value={(col.items as ContactItems)[field] ?? ''}
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
                className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                placeholder="facebook"
                value={s.icon}
                onChange={e => updateSocial(idx, 'icon', e.target.value)}
              />
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                placeholder="Name"
                value={s.name}
                onChange={e => updateSocial(idx, 'name', e.target.value)}
              />
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                placeholder="URL"
                value={s.href}
                onChange={e => updateSocial(idx, 'href', e.target.value)}
              />
              <button
                onClick={() => removeSocial(idx)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addSocial}
            className="flex items-center gap-2 text-sm text-[#513012] hover:bg-[#513012]/5 px-3 py-2 rounded-lg transition"
          >
            <Plus className="w-4 h-4" /> Add Social
          </button>
        </div>
      </section>

      {/* SAVE */}
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