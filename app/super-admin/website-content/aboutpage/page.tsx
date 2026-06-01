'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AboutAdminPage() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
const router = useRouter();

  useEffect(() => { setToken(localStorage.getItem('access_token')); }, []);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const res = await fetch(`${BASE_URL}/api/v1/website-content/about-page/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const json = await res.json();
      setData(json.aboutPageContent ?? json);
    };
    fetchData();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const res = await fetch(`${BASE_URL}/api/v1/website-content/update-about-page/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ aboutPageContent: data }),
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

  if (!data) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#513012] mb-2">
  ← Back
</button>
      <h1 className="text-2xl font-bold text-[#513012]">About Page Content</h1>

      {/* ── HERO ── */}
      <section className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg">Hero Section</h2>
        {[
          { field: 'title',    label: 'Title' },
          { field: 'subtitle', label: 'Subtitle' },
          { field: 'image',    label: 'Image URL' },
        ].map(({ field, label }) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
              value={data.hero?.[field] ?? ''}
              onChange={e => updatePath(['hero', field], e.target.value)}
            />
          </div>
        ))}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="overlay"
            checked={data.hero?.overlay ?? true}
            onChange={e => updatePath(['hero', 'overlay'], e.target.checked)}
          />
          <label htmlFor="overlay" className="text-sm font-medium">Dark overlay on hero image</label>
        </div>
        {data.hero?.image && (
          <img src={data.hero.image} alt="Hero preview" className="w-full h-32 object-cover rounded-lg mt-2" />
        )}
      </section>

      {/* ── INTRO ── */}
      <section className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg">Intro Section</h2>
        {[
          { field: 'heading',    label: 'Heading' },
          { field: 'subHeading', label: 'Sub Heading' },
          { field: 'image',      label: 'Image URL' },
        ].map(({ field, label }) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
              value={data.introSection?.[field] ?? ''}
              onChange={e => updatePath(['introSection', field], e.target.value)}
            />
          </div>
        ))}
        {data.introSection?.image && (
          <img src={data.introSection.image} alt="Intro preview" className="w-full h-32 object-cover rounded-lg" />
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Paragraphs</label>
          <div className="space-y-2">
            {(data.introSection?.paragraphs ?? []).map((p: string, i: number) => (
              <div key={i} className="flex gap-2">
                <textarea
                  rows={2}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30 resize-none"
                  value={p}
                  onChange={e => {
                    const arr = [...data.introSection.paragraphs];
                    arr[i] = e.target.value;
                    updatePath(['introSection', 'paragraphs'], arr);
                  }}
                />
                <button
                  onClick={() => updatePath(['introSection', 'paragraphs'], data.introSection.paragraphs.filter((_: any, j: number) => j !== i))}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => updatePath(['introSection', 'paragraphs'], [...(data.introSection?.paragraphs ?? []), ''])}
            className="flex items-center gap-2 text-sm text-[#513012] hover:bg-[#513012]/5 px-3 py-2 rounded-lg transition mt-2"
          >
            <Plus className="w-4 h-4" /> Add Paragraph
          </button>
        </div>
      </section>

      {/* ── VISION ── */}
      <section className="border border-gray-200 rounded-xl p-5 space-y-5">
        <h2 className="font-semibold text-lg">Vision Section</h2>
        {(['left', 'right'] as const).map(side => (
          <div key={side} className="space-y-3">
            <p className="text-sm font-semibold text-gray-600 capitalize">{side} Column</p>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                value={data.visionSection?.[side]?.title ?? ''}
                onChange={e => updatePath(['visionSection', side, 'title'], e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content Lines</label>
              <div className="space-y-2">
                {(data.visionSection?.[side]?.content ?? []).map((line: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                      value={line}
                      onChange={e => {
                        const arr = [...data.visionSection[side].content];
                        arr[i] = e.target.value;
                        updatePath(['visionSection', side, 'content'], arr);
                      }}
                    />
                    <button
                      onClick={() => updatePath(['visionSection', side, 'content'], data.visionSection[side].content.filter((_: any, j: number) => j !== i))}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => updatePath(['visionSection', side, 'content'], [...(data.visionSection?.[side]?.content ?? []), ''])}
                className="flex items-center gap-2 text-sm text-[#513012] hover:bg-[#513012]/5 px-3 py-2 rounded-lg transition mt-2"
              >
                <Plus className="w-4 h-4" /> Add Line
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* ── VIBES ── */}
      <section className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg">Vibes Section</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Section Title</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
            value={data.vibes?.title ?? ''}
            onChange={e => updatePath(['vibes', 'title'], e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Image URLs</label>
          <div className="space-y-2">
            {(data.vibes?.images ?? []).map((url: string, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex gap-2">
                  <input
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                    placeholder="Image URL"
                    value={url}
                    onChange={e => {
                      const arr = [...data.vibes.images];
                      arr[i] = e.target.value;
                      updatePath(['vibes', 'images'], arr);
                    }}
                  />
                  <button
                    onClick={() => updatePath(['vibes', 'images'], data.vibes.images.filter((_: any, j: number) => j !== i))}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {url && <img src={url} alt={`Vibe ${i + 1}`} className="w-full h-24 object-cover rounded-lg" />}
              </div>
            ))}
          </div>
          <button
            onClick={() => updatePath(['vibes', 'images'], [...(data.vibes?.images ?? []), ''])}
            className="flex items-center gap-2 text-sm text-[#513012] hover:bg-[#513012]/5 px-3 py-2 rounded-lg transition mt-2"
          >
            <Plus className="w-4 h-4" /> Add Image
          </button>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Features</h2>
        {(data.features ?? []).map((feature: any, idx: number) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Feature #{idx + 1}</span>
              <button
                onClick={() => updatePath(['features'], data.features.filter((_: any, i: number) => i !== idx))}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {[
              { field: 'title',       label: 'Title' },
              { field: 'description', label: 'Description' },
              { field: 'image',       label: 'Image URL (optional)' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                  value={feature[field] ?? ''}
                  onChange={e => {
                    const arr = [...data.features];
                    arr[idx] = { ...arr[idx], [field]: e.target.value };
                    updatePath(['features'], arr);
                  }}
                />
              </div>
            ))}
            {feature.image && (
              <img src={feature.image} alt={feature.title} className="w-20 h-20 object-contain rounded-lg border" />
            )}
          </div>
        ))}
        <button
          onClick={() => updatePath(['features'], [...(data.features ?? []), { title: '', description: '', image: '' }])}
          className="flex items-center gap-2 text-sm text-[#513012] hover:bg-[#513012]/5 px-3 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> Add Feature
        </button>
      </section>

      {/* ── SAVE ── */}
      <div className="flex items-center gap-4 pb-8">
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