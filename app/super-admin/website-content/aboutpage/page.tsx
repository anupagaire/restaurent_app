'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AboutAdminPage() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
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

  const handleImageUpload = async (section: string, index: number | null, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(index !== null ? `${section}-${index}` : section);
    
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('purpose', section);
    formData.append('type', 'about_page_content');
    formData.append('alt', '');

    try {
      const res = await fetch(`${BASE_URL}/api/v1/photo/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const responseData = await res.json();
      
      if (res.ok) {
        const imageUrl = responseData.photo_url;
        
        if (section === 'hero') {
          updatePath(['hero', 'image'], imageUrl);
        } else if (section === 'introSection') {
          updatePath(['introSection', 'image'], imageUrl);
        } else if (section === 'vibes.images' && index !== null) {
          const arr = [...(data.vibes?.images ?? [])];
          arr[index] = imageUrl;
          updatePath(['vibes', 'images'], arr);
        } else if (section === 'features' && index !== null) {
          const arr = [...(data.features ?? [])];
          arr[index] = { ...arr[index], image: imageUrl };
          updatePath(['features'], arr);
        }
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

  if (!data) return <div className="p-6 text-secondary">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-secondary hover:text-secondary mb-2">
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-secondary">About Page Content</h1>

      <section className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg">Hero Section</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            value={data.hero?.title ?? ''}
            onChange={e => updatePath(['hero', 'title'], e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Subtitle</label>
          <ReactQuill
            value={data.hero?.subtitle ?? ''}
            onChange={(val) => updatePath(['hero', 'subtitle'], val)}
            theme="snow"
            className="rounded-lg bg-white"
            placeholder="Enter hero subtitle..."
          />
        </div>
        
        {/* ✅ IMAGE UPLOAD */}
        <div>
          <label className="block text-sm font-medium mb-1">Hero Image</label>
          <div className="flex items-center gap-4">
            {data.hero?.image && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
                <Image src={data.hero.image} alt="Hero" fill className="object-cover" />
              </div>
            )}
            <label className="cursor-pointer flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition">
              {uploading === 'hero' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading === 'hero' ? 'Uploading...' : 'Choose File'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload('hero', null, e)}
                disabled={uploading !== null}
              />
            </label>
          </div>
          {data.hero?.image && <p className="text-xs text-secondary mt-1 truncate">{data.hero.image}</p>}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="overlay"
            checked={data.hero?.overlay ?? true}
            onChange={e => updatePath(['hero', 'overlay'], e.target.checked)}
          />
          <label htmlFor="overlay" className="text-sm font-medium">Dark overlay on hero image</label>
        </div>
      </section>

      {/* ── INTRO ─ */}
      <section className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg">Intro Section</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Heading</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            value={data.introSection?.heading ?? ''}
            onChange={e => updatePath(['introSection', 'heading'], e.target.value)}
          />
        </div>
        
        {/* ✅ Sub Heading with React Quill */}
        <div>
          <label className="block text-sm font-medium mb-1">Sub Heading</label>
          <ReactQuill
            value={data.introSection?.subHeading ?? ''}
            onChange={(val) => updatePath(['introSection', 'subHeading'], val)}
            theme="snow"
            className="rounded-lg bg-white"
            placeholder="Enter sub heading..."
          />
        </div>

        {/* ✅ IMAGE UPLOAD */}
        <div>
          <label className="block text-sm font-medium mb-1">Intro Image</label>
          <div className="flex items-center gap-4">
            {data.introSection?.image && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
                <Image src={data.introSection.image} alt="Intro" fill className="object-cover" />
              </div>
            )}
            <label className="cursor-pointer flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition">
              {uploading === 'introSection' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading === 'introSection' ? 'Uploading...' : 'Choose File'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload('introSection', null, e)}
                disabled={uploading !== null}
              />
            </label>
          </div>
          {data.introSection?.image && <p className="text-xs text-secondary mt-1 truncate">{data.introSection.image}</p>}
        </div>

        {/* ✅ Paragraphs with React Quill */}
        <div>
          <label className="block text-sm font-medium mb-2">Paragraphs</label>
          <div className="space-y-4">
            {(data.introSection?.paragraphs ?? []).map((p: string, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-secondary">Paragraph #{i + 1}</span>
                  <button
                    onClick={() => updatePath(['introSection', 'paragraphs'], data.introSection.paragraphs.filter((_: any, j: number) => j !== i))}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <ReactQuill
                  value={p}
                  onChange={(val) => {
                    const arr = [...data.introSection.paragraphs];
                    arr[i] = val;
                    updatePath(['introSection', 'paragraphs'], arr);
                  }}
                  theme="snow"
                  className="rounded-lg bg-white"
                  placeholder="Enter paragraph content..."
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => updatePath(['introSection', 'paragraphs'], [...(data.introSection?.paragraphs ?? []), ''])}
            className="flex items-center gap-2 text-sm text-secondary hover:bg-secondary/5 px-3 py-2 rounded-lg transition mt-2"
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
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                value={data.visionSection?.[side]?.title ?? ''}
                onChange={e => updatePath(['visionSection', side, 'title'], e.target.value)}
              />
            </div>
            
            {/* ✅ Content Lines with React Quill */}
            <div>
              <label className="block text-sm font-medium mb-2">Content Lines</label>
              <div className="space-y-4">
                {(data.visionSection?.[side]?.content ?? []).map((line: string, i: number) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-secondary">Line #{i + 1}</span>
                      <button
                        onClick={() => updatePath(['visionSection', side, 'content'], data.visionSection[side].content.filter((_: any, j: number) => j !== i))}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <ReactQuill
                      value={line}
                      onChange={(val) => {
                        const arr = [...data.visionSection[side].content];
                        arr[i] = val;
                        updatePath(['visionSection', side, 'content'], arr);
                      }}
                      theme="snow"
                      className="rounded-lg bg-white"
                      placeholder="Enter content line..."
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => updatePath(['visionSection', side, 'content'], [...(data.visionSection?.[side]?.content ?? []), ''])}
                className="flex items-center gap-2 text-sm text-secondary hover:bg-secondary/5 px-3 py-2 rounded-lg transition mt-2"
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
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            value={data.vibes?.title ?? ''}
            onChange={e => updatePath(['vibes', 'title'], e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <div className="space-y-3">
            {(data.vibes?.images ?? []).map((url: string, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex gap-2 items-center">
                  <label className="cursor-pointer flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition">
                    {uploading === `vibes.images-${i}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading === `vibes.images-${i}` ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload('vibes.images', i, e)}
                      disabled={uploading !== null}
                    />
                  </label>
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
            className="flex items-center gap-2 text-sm text-secondary hover:bg-secondary/5 px-3 py-2 rounded-lg transition mt-2"
          >
            <Plus className="w-4 h-4" /> Add Image Slot
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
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                value={feature.title ?? ''}
                onChange={e => {
                  const arr = [...data.features];
                  arr[idx] = { ...arr[idx], title: e.target.value };
                  updatePath(['features'], arr);
                }}
              />
            </div>
            
            {/* ✅ Description with React Quill */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <ReactQuill
                value={feature.description ?? ''}
                onChange={(val) => {
                  const arr = [...data.features];
                  arr[idx] = { ...arr[idx], description: val };
                  updatePath(['features'], arr);
                }}
                theme="snow"
                className="rounded-lg bg-white"
                placeholder="Enter feature description..."
              />
            </div>
            
            {/* ✅ IMAGE UPLOAD FOR FEATURE */}
            <div>
              <label className="block text-sm font-medium mb-1">Feature Image (optional)</label>
              <div className="flex items-center gap-4">
                {feature.image && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-300">
                    <Image src={feature.image} alt={feature.title} fill className="object-contain" />
                  </div>
                )}
                <label className="cursor-pointer flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition">
                  {uploading === `features-${idx}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading === `features-${idx}` ? 'Uploading...' : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload('features', idx, e)}
                    disabled={uploading !== null}
                  />
                </label>
              </div>
              {feature.image && <p className="text-xs text-secondary mt-1 truncate">{feature.image}</p>}
            </div>
          </div>
        ))}
        <button
          onClick={() => updatePath(['features'], [...(data.features ?? []), { title: '', description: '', image: '' }])}
          className="flex items-center gap-2 text-sm text-secondary hover:bg-secondary/5 px-3 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> Add Feature
        </button>
      </section>

      {/* ── SAVE ── */}
      <div className="flex items-center gap-4 pb-8">
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