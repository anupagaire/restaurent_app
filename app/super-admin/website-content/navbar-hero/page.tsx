'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NavbarHeroAdminPage() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => { setToken(localStorage.getItem('access_token')); }, []);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const res = await fetch(`${BASE_URL}/api/v1/website-content/navbar-hero/`, {
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
    const res = await fetch(`${BASE_URL}/api/v1/website-content/update-navbar-hero/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setMessage(res.ok ? '✓ Saved successfully!' : '✗ Error saving.');
  };

  const updatePath = (path: string[], value: any) => {
    setData((prev: any) => {
      const next = structuredClone(prev);
      let obj = next;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
      obj[path[path.length - 1]] = value;
      return next;
    });
  };

  const addSlide = () => {
    setData((prev: any) => ({
      ...prev,
      hero_section: {
        ...prev.hero_section,
        slides: [...prev.hero_section.slides, { id: Date.now(), image: '', alt: '', title: '', button_text: '', button_link: '' }],
      },
    }));
  };

  const removeSlide = (idx: number) => {
    setData((prev: any) => ({
      ...prev,
      hero_section: { ...prev.hero_section, slides: prev.hero_section.slides.filter((_: any, i: number) => i !== idx) },
    }));
  };

  const addNavLink = () => {
    setData((prev: any) => ({
      ...prev,
      navbar: { ...prev.navbar, links: [...prev.navbar.links, { name: '', url: '' }] },
    }));
  };

  const removeNavLink = (idx: number) => {
    setData((prev: any) => ({
      ...prev,
      navbar: { ...prev.navbar, links: prev.navbar.links.filter((_: any, i: number) => i !== idx) },
    }));
  };

  if (!data) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-[#513012]">Navbar & Hero Content</h1>

      {/* Site Settings */}
      <section className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg">Site Settings</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Site Name</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
            value={data.site_settings?.site_name ?? ''}
            onChange={e => updatePath(['site_settings', 'site_name'], e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logo URL</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
            value={data.site_settings?.logo?.image ?? ''}
            onChange={e => updatePath(['site_settings', 'logo', 'image'], e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logo Alt Text</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
            value={data.site_settings?.logo?.alt ?? ''}
            onChange={e => updatePath(['site_settings', 'logo', 'alt'], e.target.value)} />
        </div>
      </section>

      {/* Navbar Links */}
      <section className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg">Navbar Links</h2>
        {data.navbar?.links?.map((link: any, idx: number) => (
          <div key={idx} className="flex gap-2 items-center">
            <input className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
              placeholder="Name" value={link.name}
              onChange={e => { const links = [...data.navbar.links]; links[idx] = { ...links[idx], name: e.target.value }; updatePath(['navbar', 'links'], links); }} />
            <input className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
              placeholder="URL" value={link.url}
              onChange={e => { const links = [...data.navbar.links]; links[idx] = { ...links[idx], url: e.target.value }; updatePath(['navbar', 'links'], links); }} />
            <button onClick={() => removeNavLink(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={addNavLink} className="flex items-center gap-2 text-sm text-[#513012] hover:bg-[#513012]/5 px-3 py-2 rounded-lg transition">
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </section>

      {/* Navbar Buttons */}
      <section className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg">Navbar Buttons</h2>
        {['login', 'register_restaurant'].map((key) => (
          <div key={key}>
            <p className="text-sm font-medium capitalize mb-2">{key.replace('_', ' ')}</p>
            <div className="flex gap-2">
              <input className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                placeholder="Text" value={data.navbar?.buttons?.[key]?.text ?? ''}
                onChange={e => updatePath(['navbar', 'buttons', key, 'text'], e.target.value)} />
              <input className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                placeholder="URL" value={data.navbar?.buttons?.[key]?.url ?? ''}
                onChange={e => updatePath(['navbar', 'buttons', key, 'url'], e.target.value)} />
            </div>
          </div>
        ))}
      </section>

      {/* Hero Slides */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Hero Slides</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Autoplay</label>
          <input type="checkbox" checked={data.hero_section?.autoplay ?? true}
            onChange={e => updatePath(['hero_section', 'autoplay'], e.target.checked)} />
          <label className="text-sm font-medium ml-4">Delay (ms)</label>
          <input type="number" className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
            value={data.hero_section?.autoplay_delay ?? 4000}
            onChange={e => updatePath(['hero_section', 'autoplay_delay'], parseInt(e.target.value))} />
        </div>

        {data.hero_section?.slides?.map((slide: any, idx: number) => (
          <div key={slide.id} className="border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Slide #{idx + 1}</span>
              <button onClick={() => removeSlide(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {[
              { field: 'image', label: 'Image URL' },
              { field: 'alt', label: 'Alt Text' },
              { field: 'title', label: 'Title' },
              { field: 'button_text', label: 'Button Text' },
              { field: 'button_link', label: 'Button Link' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                  value={slide[field] ?? ''}
                  onChange={e => {
                    const slides = [...data.hero_section.slides];
                    slides[idx] = { ...slides[idx], [field]: e.target.value };
                    updatePath(['hero_section', 'slides'], slides);
                  }} />
              </div>
            ))}
          </div>
        ))}
        <button onClick={addSlide} className="flex items-center gap-2 text-sm text-[#513012] hover:bg-[#513012]/5 px-3 py-2 rounded-lg transition">
          <Plus className="w-4 h-4" /> Add Slide
        </button>
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