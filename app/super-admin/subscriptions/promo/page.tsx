'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, RefreshCw, Tag, CheckCircle2,
  XCircle, Loader2, X, Save, Calendar, Users,
} from 'lucide-react';
import { promosApi, plansApi, PromoCode, Plan } from '@/lib/subscription-api';

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' });
}

function isExpired(d: string) {
  return new Date(d) < new Date();
}

function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

// ─── Promo Form Modal ─────────────────────────────────────────────────────────

interface PromoFormData {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  valid_from: string;
  valid_until: string;
  max_usage: number;
  active: boolean;
  one_time_per_user: boolean;
  stackable: boolean;
  applicable_plans: number[];
  applicable_restaurants: number[];
}

function nowIso() {
  return new Date().toISOString().slice(0, 16);
}

function futureIso(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 16);
}

const EMPTY_FORM: PromoFormData = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '10',
  valid_from: nowIso(),
  valid_until: futureIso(30),
  max_usage: 100,
  active: true,
  one_time_per_user: true,
  stackable: false,
  applicable_plans: [],
  applicable_restaurants: [],
};

function PromoFormModal({
  initial,
  plans,
  onClose,
  onSaved,
}: {
  initial: PromoCode | null;
  plans: Plan[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<PromoFormData>(
    initial
      ? {
          code:                   initial.code,
          description:            initial.description,
          discount_type:          initial.discount_type,
          discount_value:         initial.discount_value,
          valid_from:             initial.valid_from.slice(0, 16),
          valid_until:            initial.valid_until.slice(0, 16),
          max_usage:              initial.max_usage,
          active:                 initial.active,
          one_time_per_user:      initial.one_time_per_user,
          stackable:              initial.stackable,
          applicable_plans:       initial.applicable_plans,
          applicable_restaurants: initial.applicable_restaurants,
        }
      : EMPTY_FORM,
  );

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k: keyof PromoFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const togglePlan = (id: number) => {
    setForm(f => ({
      ...f,
      applicable_plans: f.applicable_plans.includes(id)
        ? f.applicable_plans.filter(x => x !== id)
        : [...f.applicable_plans, id],
    }));
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.discount_value) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        valid_from:  new Date(form.valid_from).toISOString(),
        valid_until: new Date(form.valid_until).toISOString(),
      };
      if (initial) {
        await promosApi.update(initial.id, payload as any);
      } else {
        await promosApi.create(payload as any);
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={{ color: '#9a7458' }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-secondary";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-secondary/40 backdrop-blur-sm" onClick={onClose} />
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-xl" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>
              {initial ? 'Edit Promo Code' : 'Create Promo Code'}
            </h2>
            <button onClick={onClose}><X size={20} className="text-secondary" /></button>
          </div>

          <div className="space-y-4">
            <Field label="Promo Code" required>
              <input
                type="text"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SAVE30"
                className={`${inputCls} font-mono uppercase`}
              />
            </Field>

            <Field label="Description">
              <input type="text" value={form.description} onChange={set('description')} placeholder="What does this promo do?" className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Discount Type" required>
                <select value={form.discount_type} onChange={set('discount_type')} className={inputCls}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (Rs.)</option>
                </select>
              </Field>
              <Field label={form.discount_type === 'percentage' ? 'Discount (%)' : 'Discount (Rs.)'} required>
                <input
                  type="number"
                  value={form.discount_value}
                  onChange={set('discount_value')}
                  min="0"
                  max={form.discount_type === 'percentage' ? '100' : undefined}
                  step="0.01"
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Valid From" required>
                <input type="datetime-local" value={form.valid_from} onChange={set('valid_from')} className={inputCls} />
              </Field>
              <Field label="Valid Until" required>
                <input type="datetime-local" value={form.valid_until} onChange={set('valid_until')} className={inputCls} />
              </Field>
            </div>

            <Field label="Max Total Usages">
              <input
                type="number"
                value={form.max_usage}
                onChange={e => setForm(f => ({ ...f, max_usage: parseInt(e.target.value) || 1 }))}
                min="1"
                className={inputCls}
              />
            </Field>

            <div className="flex flex-wrap gap-4">
              {([
                { key: 'active' as const,           label: 'Active'            },
                { key: 'one_time_per_user' as const, label: 'One-time per user' },
                { key: 'stackable' as const,         label: 'Stackable'         },
              ]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                    className="w-10 h-5 rounded-full transition-all relative shrink-0"
                    style={{ background: form[key] ? '#513012' : '#d1d5db' }}
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

            {plans.length > 0 && (
              <Field label="Applicable Plans (leave empty = all plans)">
                <div className="flex flex-wrap gap-2 mt-1">
                  {plans.map(p => {
                    const selected = form.applicable_plans.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlan(p.id)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                        style={
                          selected
                            ? { background: '#513012', color: '#fff', borderColor: '#513012' }
                            : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                        }
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </Field>
            )}
          </div>

          {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.code.trim()}
              className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: '#513012', color: '#fff', opacity: saving || !form.code.trim() ? 0.7 : 1 }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Promo'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function SuperAdminPromosPage() {
  const [promos,      setPromos]      = useState<PromoCode[]>([]);
  const [plans,       setPlans]       = useState<Plan[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [refreshing,  setRefreshing]  = useState(false);
  const [editPromo,   setEditPromo]   = useState<PromoCode | null | undefined>(undefined);
  const [showExpired, setShowExpired] = useState(false);
  const [page,        setPage]        = useState(1);

  const planNames: Record<number, string> = Object.fromEntries(plans.map(p => [p.id, p.name]));

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    try {
      const [promosRes, plansRes] = await Promise.all([
        promosApi.list('page_size=100'),
        plansApi.list('page_size=50'),
      ]);
      setPromos(promosRes.results);
      setPlans(plansRes.results);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to load.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (promo: PromoCode) => {
    if (!confirm(`Delete promo "${promo.code}"?`)) return;
    try {
      await promosApi.delete(promo.id);
      setPromos(prev => prev.filter(p => p.id !== promo.id));
    } catch (e: any) {
      alert(e.message || 'Delete failed.');
    }
  };

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      const updated = await promosApi.patch(promo.id, { active: !promo.active });
      setPromos(prev => prev.map(p => p.id === promo.id ? updated : p));
    } catch (e: any) {
      alert(e.message || 'Update failed.');
    }
  };

  const visible = promos.filter(p => showExpired ? true : !isExpired(p.valid_until));
  const totalPages = Math.ceil(visible.length / PAGE_SIZE);
  const paginated = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total:   promos.length,
    active:  promos.filter(p => p.active && !isExpired(p.valid_until)).length,
    expired: promos.filter(p => isExpired(p.valid_until)).length,
    used:    promos.reduce((sum, p) => sum + p.used_count, 0),
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>
            Promo Codes
          </h1>
          <p className="text-secondary text-sm mt-1">Create and manage discount codes</p>
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
            onClick={() => setEditPromo(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: '#513012', color: '#fff' }}
          >
            <Plus size={14} /> New Promo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',      value: stats.total,   color: '#513012' },
          { label: 'Active',     value: stats.active,  color: '#16a34a' },
          { label: 'Expired',    value: stats.expired, color: '#6b7280' },
          { label: 'Total Uses', value: stats.used,    color: '#7e22ce' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-1">{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header row */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-gray-800">
            Promo Codes
            <span className="text-sm font-normal text-secondary ml-2">({visible.length})</span>
          </h2>
          <button
            onClick={() => { setShowExpired(x => !x); setPage(1); }}
            className="text-xs font-semibold underline text-secondary hover:text-gray-600"
          >
            {showExpired ? 'Hide expired' : `Show expired (${stats.expired})`}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-secondary">
            <Tag size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium mb-4">No promo codes yet</p>
            <button
              onClick={() => setEditPromo(null)}
              className="px-6 py-3 rounded-xl text-sm font-bold"
              style={{ background: '#513012', color: '#fff' }}
            >
              Create your first promo
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['S.N.', 'Code', 'Discount', 'Validity', 'Usage', 'Plans', 'Flags', 'Status', 'Actions'].map(h => (
                      <th key={h} className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-secondary whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((promo, index) => {
                    const expired = isExpired(promo.valid_until);
                    const discLabel = promo.discount_type === 'percentage'
                      ? `${parseFloat(promo.discount_value)}% off`
                      : `Rs. ${parseFloat(promo.discount_value).toLocaleString()} off`;

                    return (
                      <tr
                        key={promo.id}
                        className="hover:bg-gray-50 transition-colors"
                        style={{ opacity: expired ? 0.65 : 1 }}
                      >
                        {/* S.N. */}
                        <td className="py-3 px-4 text-xs text-gray-400 font-mono">
                          {(page - 1) * PAGE_SIZE + index + 1}
                        </td>

                        {/* Code + description */}
                        <td className="py-3 px-4">
                          <p className="font-mono font-bold tracking-widest" style={{ color: '#513012' }}>
                            {promo.code}
                          </p>
                          {promo.description && (
                            <p className="text-xs text-secondary mt-0.5">{promo.description}</p>
                          )}
                        </td>

                        {/* Discount */}
                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                            style={{ background: '#fef3e2', color: '#b45309' }}
                          >
                            <Tag size={11} /> {discLabel}
                          </span>
                        </td>

                        {/* Validity */}
                        <td className="py-3 px-4 text-xs text-secondary">
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            <Calendar size={11} /> {fmtDate(promo.valid_from)}
                          </div>
                          <div className="flex items-center gap-1 whitespace-nowrap mt-0.5">
                            <Calendar size={11} /> {fmtDate(promo.valid_until)}
                          </div>
                        </td>

                        {/* Usage */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-xs text-secondary whitespace-nowrap">
                            <Users size={11} />
                            <span>
                              <span className="font-semibold text-gray-700">{promo.used_count}</span>
                              {' / '}{promo.max_usage}
                            </span>
                          </div>
                          {/* Usage bar */}
                          <div className="mt-1 h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, (promo.used_count / promo.max_usage) * 100)}%`,
                                background: '#513012',
                              }}
                            />
                          </div>
                        </td>

                        {/* Plans */}
                        <td className="py-3 px-4">
                          {promo.applicable_plans.length === 0 ? (
                            <span className="text-xs text-gray-400">All plans</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {promo.applicable_plans.map(id => (
                                <span
                                  key={id}
                                  className="px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                                  style={{ background: '#f0faf4', color: '#16a34a' }}
                                >
                                  {planNames[id] ?? `#${id}`}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Flags */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            {promo.one_time_per_user && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-secondary whitespace-nowrap">
                                1x/user
                              </span>
                            )}
                            {promo.stackable && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-secondary whitespace-nowrap">
                                stackable
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {promo.active && !expired ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 whitespace-nowrap">
                              <CheckCircle2 size={11} /> Active
                            </span>
                          ) : expired ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 whitespace-nowrap">
                              <XCircle size={11} /> Expired
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 whitespace-nowrap">
                              <XCircle size={11} /> Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {!expired && (
                              <button
                                onClick={() => handleToggleActive(promo)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-50 text-gray-600 whitespace-nowrap"
                              >
                                {promo.active ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                            <button
                              onClick={() => setEditPromo(promo)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                            >
                              <Pencil size={13} className="text-secondary" />
                            </button>
                            <button
                              onClick={() => handleDelete(promo)}
                              className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50"
                            >
                              <Trash2 size={13} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 flex-wrap gap-2">
                <p className="text-xs text-secondary">
                  Page {page} of {totalPages} · {visible.length} results
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40"
                  >
                    ←
                  </button>
                  {getPageNumbers(page, totalPages).map((p, i) =>
                    p === '…' ? (
                      <span key={`e-${i}`} className="px-2 text-xs text-gray-400 select-none">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(Number(p))}
                        className="min-w-[32px] px-2 py-1.5 rounded-lg text-xs border transition"
                        style={p === page
                          ? { background: '#513012', color: '#fff', borderColor: '#513012', fontWeight: 600 }
                          : { borderColor: '#e5e7eb', color: '#6b7280' }}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form modal */}
      {editPromo !== undefined && (
        <PromoFormModal
          initial={editPromo}
          plans={plans}
          onClose={() => setEditPromo(undefined)}
          onSaved={() => load(true)}
        />
      )}
    </div>
  );
}