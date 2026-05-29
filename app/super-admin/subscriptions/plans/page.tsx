'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, RefreshCw, Crown, Zap, Gift,
  CheckCircle2, XCircle, Loader2, X, Save,
} from 'lucide-react';
import { plansApi, Plan } from '@/lib/subscription-api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_CODES = [
  { value: 'free_trial', label: 'Free Trial' },
  { value: 'basic',      label: 'Basic'      },
  { value: 'pro',        label: 'Pro'        },
  { value: 'custom',     label: 'Custom'     },
];

function planAccent(plan: Plan) {
  if (plan.is_trial) return '#16a34a';
  const p = parseFloat(plan.price);
  if (p < 2000) return '#1d4ed8';
  return '#7e22ce';
}

function PlanIcon({ plan }: { plan: Plan }) {
  const accent = planAccent(plan);
  if (plan.is_trial) return <Gift size={18} color={accent} />;
  if (parseFloat(plan.price) < 2000) return <Zap size={18} color={accent} />;
  return <Crown size={18} color={accent} />;
}

// ─── Plan Form Modal ──────────────────────────────────────────────────────────

interface PlanFormData {
  code: string;
  name: string;
  description: string;
  price: string;
  duration_days: number;
  features: string;
  limits: string;
  is_trial: boolean;
  is_active: boolean;
  ordering: number;
}

const EMPTY_FORM: PlanFormData = {
  code: 'free_trial',
  name: '',
  description: '',
  price: '0',
  duration_days: 30,
  features: '',
  limits: '',
  is_trial: false,
  is_active: true,
  ordering: 0,
};

function PlanFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Plan | null;       
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<PlanFormData>(
    initial
      ? {
          code:         initial.code,
          name:         initial.name,
          description:  initial.description,
          price:        initial.price,
          duration_days:initial.duration_days,
          features:      typeof initial.features === 'string' ? initial.features : JSON.stringify(initial.features ?? ''),
          limits:        typeof initial.limits === 'string' ? initial.limits : JSON.stringify(initial.limits ?? ''),
          is_trial:     initial.is_trial,
          is_active:    initial.is_active,
          ordering:     initial.ordering,
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k: keyof PlanFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    setError('');
    try {
      if (initial) {
        await plansApi.update(initial.id, form as any);
      } else {
        await plansApi.create(form as any);
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({
    label, children, required,
  }: { label: string; children: React.ReactNode; required?: boolean }) => (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={{ color: '#9a7458' }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#513012]";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed z-50 rounded-3xl overflow-y-auto w-full max-w-lg bg-white"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          maxHeight: '90vh',
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-xl" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>
              {initial ? 'Edit Plan' : 'Create New Plan'}
            </h2>
            <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
          </div>

          <div className="space-y-4">
            {/* Code */}
            <Field label="Plan Code" required>
              <select value={form.code} onChange={set('code')} className={inputCls}>
                {PLAN_CODES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>

            {/* Name */}
            <Field label="Plan Name" required>
              <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Pro Plan" className={inputCls} />
            </Field>

            {/* Description */}
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={set('description')}
                placeholder="Short description shown to customers"
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <Field label="Price (Rs.)" required>
                <input
                  type="number"
                  value={form.price}
                  onChange={set('price')}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className={inputCls}
                />
              </Field>

              {/* Duration */}
              <Field label="Duration (days)" required>
                <input
                  type="number"
                  value={form.duration_days}
                  onChange={e => setForm(f => ({ ...f, duration_days: parseInt(e.target.value) || 30 }))}
                  min="1"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Features */}
            <Field label="Features (one per line)">
              <textarea
                value={form.features}
                onChange={set('features')}
                placeholder={"QR menu for 1 restaurant\nUnlimited orders\nPriority support"}
                rows={5}
                className={`${inputCls} resize-none font-mono text-xs`}
              />
            </Field>

            {/* Limits */}
            <Field label="Limits (one per line)">
              <textarea
                value={form.limits}
                onChange={set('limits')}
                placeholder={"Max 50 orders/month\n1 restaurant only"}
                rows={3}
                className={`${inputCls} resize-none font-mono text-xs`}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              {/* Ordering */}
              <Field label="Display Order">
                <input
                  type="number"
                  value={form.ordering}
                  onChange={e => setForm(f => ({ ...f, ordering: parseInt(e.target.value) || 0 }))}
                  className={inputCls}
                />
              </Field>

              {/* Toggles */}
              <div className="flex flex-col gap-3 pt-5">
                {[
                  { key: 'is_trial' as const, label: 'Is Trial Plan' },
                  { key: 'is_active' as const, label: 'Is Active' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                      className="w-10 h-5 rounded-full transition-all relative"
                      style={{
                        background: form[key] ? '#513012' : '#d1d5db',
                      }}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                        style={{ left: form[key] ? '1.25rem' : '0.125rem' }}
                      />
                    </button>
                    <span className="text-sm text-gray-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-center text-red-600">{error}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: '#513012', color: '#fff', opacity: saving || !form.name.trim() ? 0.7 : 1 }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onToggleActive: (plan: Plan) => void;
}) {
  const accent = planAccent(plan);
const features = plan.features ? String(plan.features).split('\n').filter(Boolean) : [];
  return (
    <div
      className="rounded-2xl border bg-white p-5 flex flex-col gap-4"
      style={{ borderColor: plan.is_active ? `${accent}44` : '#e5e7eb' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <PlanIcon plan={plan} />
          <div>
            <p className="font-bold text-gray-800">{plan.name}</p>
            <p className="text-xs text-gray-400 font-mono">{plan.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {plan.is_active ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
              <CheckCircle2 size={12} /> Active
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
              <XCircle size={12} /> Inactive
            </span>
          )}
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold" style={{ color: '#1e0f02' }}>
          {parseFloat(plan.price) === 0 ? 'Free' : `Rs. ${parseFloat(plan.price).toLocaleString()}`}
        </p>
        <p className="text-xs text-gray-400">{plan.duration_days} days · Order {plan.ordering}</p>
        {plan.description && <p className="text-xs text-gray-500 mt-1">{plan.description}</p>}
      </div>

      {features.length > 0 && (
        <ul className="space-y-1">
          {features.slice(0, 4).map(f => (
            <li key={f} className="text-xs text-gray-500 flex items-center gap-1.5">
              <CheckCircle2 size={10} color={accent} className="shrink-0" /> {f}
            </li>
          ))}
          {features.length > 4 && (
            <li className="text-xs text-gray-400">+{features.length - 4} more…</li>
          )}
        </ul>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
        <button
          onClick={() => onToggleActive(plan)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          {plan.is_active ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={() => onEdit(plan)}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
        >
          <Pencil size={13} className="text-gray-500" />
        </button>
        <button
          onClick={() => onDelete(plan)}
          className="p-2 rounded-xl border border-red-100 hover:bg-red-50"
        >
          <Trash2 size={13} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SuperAdminPlansPage() {
  const [plans,     setPlans]     = useState<Plan[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [refreshing,setRefreshing]= useState(false);
  const [editPlan,  setEditPlan]  = useState<Plan | null | undefined>(undefined); // undefined=closed, null=create, Plan=edit

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await plansApi.list('ordering=ordering&page_size=50');
      setPlans(res.results);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to load plans.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Delete "${plan.name}"? This cannot be undone.`)) return;
    try {
      await plansApi.delete(plan.id);
      setPlans(prev => prev.filter(p => p.id !== plan.id));
    } catch (e: any) {
      alert(e.message || 'Delete failed.');
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      const updated = await plansApi.patch(plan.id, { is_active: !plan.is_active });
      setPlans(prev => prev.map(p => p.id === plan.id ? updated : p));
    } catch (e: any) {
      alert(e.message || 'Update failed.');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>
            Subscription Plans
          </h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage pricing plans</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-gray-200 hover:bg-gray-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setEditPlan(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: '#513012', color: '#fff' }}
          >
            <Plus size={14} /> New Plan
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#513012] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Crown size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium mb-4">No plans yet</p>
          <button
            onClick={() => setEditPlan(null)}
            className="px-6 py-3 rounded-xl text-sm font-bold"
            style={{ background: '#513012', color: '#fff' }}
          >
            Create your first plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={p => setEditPlan(p)}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {editPlan !== undefined && (
        <PlanFormModal
          initial={editPlan}
          onClose={() => setEditPlan(undefined)}
          onSaved={() => load(true)}
        />
      )}
    </div>
  );
}