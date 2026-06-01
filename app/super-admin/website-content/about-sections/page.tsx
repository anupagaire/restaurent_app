'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const ICON_OPTIONS = ['users', 'globe', 'compass', 'star', 'heart', 'zap', 'shield', 'check'];

export default function AboutSectionsAdminPage() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
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

  const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30';

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#513012] mb-2">
  ← Back
</button>
      <h1 className="text-2xl font-bold text-[#513012]">About Sections Content</h1>

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
            <button onClick={() => update(['commitment_section', 'experience_points'], [...c.experience_points, ''])} className="flex items-center gap-2 text-sm text-[#513012] hover:bg-[#513012]/5 px-3 py-2 rounded-lg transition">
              <Plus className="w-4 h-4" /> Add Point
            </button>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-2">Images (4 images)</label>
          <div className="space-y-2">
            {c.images.map((img: any, idx: number) => (
              <div key={img.id} className="flex gap-2 items-center">
                <span className="text-xs text-gray-400 w-4">{idx + 1}</span>
                <input className={inputCls} placeholder="Image URL" value={img.image} onChange={e => { const imgs = [...c.images]; imgs[idx] = { ...imgs[idx], image: e.target.value }; update(['commitment_section', 'images'], imgs); }} />
                <input className="w-40 border rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="Alt text" value={img.alt} onChange={e => { const imgs = [...c.images]; imgs[idx] = { ...imgs[idx], alt: e.target.value }; update(['commitment_section', 'images'], imgs); }} />
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
                  className="w-36 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
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
            <button onClick={() => update(['why_choose_us_section', 'benefits'], [...w.benefits, { id: Date.now(), icon: 'star', text: '' }])} className="flex items-center gap-2 text-sm text-[#513012] hover:bg-[#513012]/5 px-3 py-2 rounded-lg transition">
              <Plus className="w-4 h-4" /> Add Benefit
            </button>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button onClick={handleSave} disabled={saving} className="bg-[#513012] text-white px-8 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition font-medium">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {message && <span className={`text-sm font-medium ${message.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{message}</span>}
      </div>
    </div>
  );
}