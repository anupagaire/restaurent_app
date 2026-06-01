'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(
  () => import('react-quill-new'),
  {
    ssr: false,
    loading: () => <p>Loading editor...</p>,
  }
);
import 'react-quill-new/dist/quill.snow.css';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { useRouter } from 'next/navigation';

const ICON_OPTIONS = ['qr_code', 'menu', 'utensils_crossed', 'star', 'heart', 'phone', 'map_pin', 'clock'];

interface Step {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface HowItWorksData {
  how_it_works_section: {
    title: string;
    description: string;
    steps: Step[];
  };
}

export default function HowItWorksAdminPage() {
  const [data, setData] = useState<HowItWorksData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
const router = useRouter();

  useEffect(() => { setToken(localStorage.getItem('access_token')); }, []);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const res = await fetch(`${BASE_URL}/api/v1/website-content/how-it-works/`, {
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
    const res = await fetch(`${BASE_URL}/api/v1/website-content/update-how-it-works/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setMessage(res.ok ? '✓ Saved successfully!' : '✗ Error saving.');
  };

  const updateSection = (field: 'title' | 'description', value: string) =>
    setData(prev => prev ? {
      ...prev,
      how_it_works_section: { ...prev.how_it_works_section, [field]: value }
    } : prev);

  const updateStep = (idx: number, field: keyof Step, value: string) =>
    setData(prev => {
      if (!prev) return prev;
      const steps = [...prev.how_it_works_section.steps];
      steps[idx] = { ...steps[idx], [field]: value };
      return { ...prev, how_it_works_section: { ...prev.how_it_works_section, steps } };
    });

  const addStep = () =>
    setData(prev => {
      if (!prev) return prev;
      const newStep: Step = { id: Date.now(), icon: 'qr_code', title: '', description: '' };
      return { ...prev, how_it_works_section: { ...prev.how_it_works_section, steps: [...prev.how_it_works_section.steps, newStep] } };
    });

  const removeStep = (idx: number) =>
    setData(prev => {
      if (!prev) return prev;
      const steps = prev.how_it_works_section.steps.filter((_, i) => i !== idx);
      return { ...prev, how_it_works_section: { ...prev.how_it_works_section, steps } };
    });

  if (!data?.how_it_works_section) return <div className="p-6 text-gray-500">Loading...</div>;

  const { title, description, steps } = data.how_it_works_section;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#513012] mb-2">
  ← Back
</button>
      <h1 className="text-2xl font-bold text-[#513012]">How It Works Content</h1>

      {/* Section Header */}
      <section className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-lg">Section Header</h2>
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
          {/* <textarea
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30 resize-none"
            value={description}
            onChange={e => updateSection('description', e.target.value)}
          /> */}
          <ReactQuill
  value={description}
  onChange={val => updateSection('description', val)}
  className="rounded-lg"
/>
        </div>
      </section>

      {/* Steps */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Steps</h2>
        {steps.map((step, idx) => (
          <div key={step.id} className="border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Step #{idx + 1}</span>
              <button onClick={() => removeStep(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Icon</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                value={step.icon}
                onChange={e => updateStep(idx, 'icon', e.target.value)}
              >
                {ICON_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#513012]/30"
                value={step.title}
                onChange={e => updateStep(idx, 'title', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
<ReactQuill
  value={step.description}
  onChange={val => updateStep(idx, 'description', val)}
  className="rounded-lg"
/>
            </div>
          </div>
        ))}

        <button onClick={addStep} className="flex items-center gap-2 text-sm text-[#513012] hover:bg-[#513012]/5 px-3 py-2 rounded-lg transition">
          <Plus className="w-4 h-4" /> Add Step
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