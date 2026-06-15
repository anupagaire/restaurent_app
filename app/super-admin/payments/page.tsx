'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Clock, XCircle, RefreshCw, Search,
  Crown, DollarSign, Loader2, X, Eye,
  ThumbsUp, ThumbsDown, Plus, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') ?? '' : '';
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token()}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail ?? data?.errors?.detail ?? data?.message ?? JSON.stringify(data));
  return data as T;
}

async function post<T>(path: string, body: Record<string, any>): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail ?? data?.errors?.detail ?? data?.message ?? JSON.stringify(data));
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentRequest {
  id: number;
  restaurant: number;
  restaurant_name?: string;
  plan: number;
  plan_detail?: { id: number; name: string; price: string; duration_days: number; is_trial: boolean };
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  amount: string;
  discount_amount: string;
  final_amount: string;
  payment_instructions: any;
  transaction_reference: string;
  payment_note: string;
  proof_image_url: string | null;
  uploaded_at: string | null;
  verified_at: string | null;
  admin_notes: string;
  created_on: string;
}

interface Restaurant { id: number; name: string; }

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-NP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtMoney(v: string | null) {
  if (!v) return '—';
  const n = parseFloat(v);
  return isNaN(n) ? '—' : `Rs. ${n.toLocaleString()}`;
}

const STATUS_CFG = {
  pending:   { bg: '#fef3e2', color: '#b45309', icon: <Clock size={11} />,        label: 'Pending'   },
  approved:  { bg: '#f0faf4', color: '#16a34a', icon: <CheckCircle2 size={11} />, label: 'Approved'  },
  rejected:  { bg: '#fef2f2', color: '#dc2626', icon: <XCircle size={11} />,      label: 'Rejected'  },
  expired:   { bg: '#f3f4f6', color: '#6b7280', icon: <XCircle size={11} />,      label: 'Expired'   },
  cancelled: { bg: '#f3f4f6', color: '#6b7280', icon: <XCircle size={11} />,      label: 'Cancelled' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CFG[status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>{s.icon} {s.label}</span>
  );
}

// ─── Approve / Reject Modal ───────────────────────────────────────────────────

function VerifyModal({ payment, action, onClose, onDone }: {
  payment: PaymentRequest;
  action: 'approve' | 'reject';
  onClose: () => void;
  onDone: () => void;
}) {
  const [notes, setNotes]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const isApprove = action === 'approve';

  // const handleSubmit = async () => {
  //   if (!isApprove && !notes.trim()) {
  //     setError('Please provide a reason for rejection.');
  //     return;
  //   }
  //   setSaving(true);
  //   setError('');
  //   try {
  //     const endpoint = isApprove
  //       ? `/api/v1/subscription/payments/${payment.id}/admin-verify/`
  //       : `/api/v1/subscription/payments/${payment.id}/admin-reject/`;

  //     // Always send admin_notes — even empty string for approve
  //     // Some backends require this field to be present
  //     await post(endpoint, { admin_notes: notes.trim() || '' });
  //     onDone();
  //     onClose();
  //   } catch (e: any) {
  //     // Show the full error so we can debug the 500
  //     setError(`Error: ${e.message}`);
  //   } finally {
  //     setSaving(false);
  //   }
  // };
// Temporarily replace handleSubmit in VerifyModal with this:
const handleSubmit = async () => {
  setSaving(true);
  setError('');
  try {
    const endpoint = isApprove
      ? `/api/v1/subscription/payments/${payment.id}/admin-verify/`
      : `/api/v1/subscription/payments/${payment.id}/admin-reject/`;

    const res = await fetch(`${API}${endpoint}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: notes.trim() || '' }),
    });

    const text = await res.text(); 
    console.log('STATUS:', res.status);
    
    if (!res.ok) throw new Error(text);
    onDone();
    onClose();
  } catch (e: any) {
    setError(e.message);
  } finally {
    setSaving(false);
  }
};
  return (
    <>
      <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed z-50 rounded-3xl w-full max-w-md bg-white overflow-y-auto"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          maxHeight: '90vh', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-xl" style={{ color: 'secondary', fontFamily: 'Georgia, serif' }}>
              {isApprove ? '✅ Approve Payment' : '❌ Reject Payment'}
            </h2>
            <button onClick={onClose}><X size={20} className="text-secondary" /></button>
          </div>

          {/* Payment summary */}
          <div className="rounded-xl p-4 mb-4 text-sm"
            style={{ background: '#f8f4f0', border: '1px solid rgba(184,147,106,0.25)' }}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-secondary">Payment #</p>
                <p className="font-semibold">#{payment.id}</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Restaurant</p>
                <p className="font-semibold">{payment.restaurant_name ?? `#${payment.restaurant}`}</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Plan</p>
                <p className="font-semibold">{payment.plan_detail?.name ?? `Plan #${payment.plan}`}</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Amount</p>
                <p className="font-bold" style={{ color: '#513012' }}>{fmtMoney(payment.final_amount)}</p>
              </div>
            </div>
            {payment.transaction_reference && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-secondary">TXN Reference</p>
                <p className="font-mono text-xs">{payment.transaction_reference}</p>
              </div>
            )}
            {payment.payment_note && (
              <div className="mt-2">
                <p className="text-xs text-secondary">Customer Note</p>
                <p className="text-xs">{payment.payment_note}</p>
              </div>
            )}
          </div>

          {/* Proof image */}
          {payment.proof_image_url ? (
            <div className="mb-4">
              <p className="text-xs font-semibold mb-2" style={{ color: '#9a7458' }}>Payment Proof Screenshot</p>
              <img src={payment.proof_image_url} alt="Payment proof"
                className="w-full rounded-xl object-contain border border-gray-100 cursor-pointer"
                style={{ maxHeight: 200 }}
                onClick={() => window.open(payment.proof_image_url!, '_blank')} />
              <p className="text-xs text-secondary mt-1">Click to open full size</p>
            </div>
          ) : (
            <div className="mb-4 p-3 rounded-xl text-xs flex items-center gap-2"
              style={{ background: '#fef3e2', color: '#b45309' }}>
              <AlertCircle size={13} />
              No payment proof uploaded yet.
            </div>
          )}

          {/* Admin notes */}
          <div className="mb-5">
            <label className="text-xs font-semibold mb-1 block" style={{ color: '#9a7458' }}>
              Admin Notes {isApprove ? '(optional)' : <span style={{ color: '#dc2626' }}>* required</span>}
            </label>
            <textarea value={notes} onChange={(e) => { setNotes(e.target.value); setError(''); }}
              placeholder={isApprove
                ? 'e.g. Verified against bank statement. (optional)'
                : 'Reason for rejection — customer will see this message'}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none border border-gray-200" />
          </div>

          {/* Warning about no proof for approve */}
          {isApprove && !payment.proof_image_url && (
            <div className="mb-4 p-3 rounded-xl text-xs"
              style={{ background: '#fef3e2', border: '1px solid rgba(180,83,9,0.2)', color: '#b45309' }}>
              ⚠️ No proof image uploaded. Are you sure you want to approve without proof?
            </div>
          )}

          {error && (
            <div className="mb-3 p-3 rounded-xl text-xs"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-gray-200 text-gray-600">
              Cancel
            </button>
            <button onClick={handleSubmit}
              disabled={saving || (!isApprove && !notes.trim())}
              className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
              style={{
                background: isApprove ? '#16a34a' : '#dc2626',
                color: '#fff',
                opacity: saving || (!isApprove && !notes.trim()) ? 0.7 : 1,
              }}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Processing…' : isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Manual Activate Modal ────────────────────────────────────────────────────

function ManualActivateModal({ plans, restaurants, onClose, onDone }: {
  plans: { id: number; name: string }[];
  restaurants: Restaurant[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [restaurantId, setRestaurantId] = useState('');
  const [planId, setPlanId]             = useState('');
  const [notes, setNotes]               = useState('');
  const [unlimited, setUnlimited]       = useState(false);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');

  const handleSubmit = async () => {
    if (!restaurantId || !planId) return;
    setSaving(true);
    setError('');
    try {
      await post('/api/v1/subscription/admin/subscriptions/manual-activate/', {
        restaurant: parseInt(restaurantId),
        plan: parseInt(planId),
        notes,
        unlimited,
      });
      onDone();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to activate.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-secondary/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed z-50 rounded-3xl w-full max-w-md bg-white overflow-y-auto"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          maxHeight: '90vh', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-xl" style={{ color: 'secondary', fontFamily: 'Georgia, serif' }}>
              Manual Activation
            </h2>
            <button onClick={onClose}><X size={20} className="text-secondary" /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: '#9a7458' }}>
                Restaurant <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} className={inputCls}>
                <option value="">Select restaurant…</option>
                {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: '#9a7458' }}>
                Plan <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select value={planId} onChange={(e) => setPlanId(e.target.value)} className={inputCls}>
                <option value="">Select plan…</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: '#9a7458' }}>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Activated after offline confirmation."
                rows={3} className={`${inputCls} resize-none`} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <button type="button" onClick={() => setUnlimited(u => !u)}
                className="w-10 h-5 rounded-full transition-all relative shrink-0"
                style={{ background: unlimited ? '#513012' : '#d1d5db' }}>
                <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                  style={{ left: unlimited ? '1.25rem' : '0.125rem' }} />
              </button>
              <span className="text-sm text-gray-600">Unlimited access (no expiry)</span>
            </label>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl text-xs"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-gray-200 text-gray-600">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving || !restaurantId || !planId}
              className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: '#513012', color: '#fff',
                opacity: saving || !restaurantId || !planId ? 0.7 : 1 }}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Activating…' : 'Activate Plan'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Payment Row ──────────────────────────────────────────────────────────────

function PaymentRow({ payment, onAction }: {
  payment: PaymentRequest;
  onAction: (p: PaymentRequest, a: 'approve' | 'reject') => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
        onClick={() => setExpanded(p => !p)}>
        <td className="py-4 px-4">
          <p className="font-mono font-bold text-sm text-gray-700">#{payment.id}</p>
          <p className="text-xs text-secondary">{fmtDate(payment.created_on)}</p>
        </td>
        <td className="py-4 px-4">
          <p className="font-semibold text-sm text-gray-800">
            {payment.restaurant_name ?? `Restaurant #${payment.restaurant}`}
          </p>
        </td>
        <td className="py-4 px-4">
          <p className="text-sm text-gray-700">{payment.plan_detail?.name ?? `Plan #${payment.plan}`}</p>
          <p className="text-xs text-secondary">{payment.plan_detail?.duration_days ?? '—'} days</p>
        </td>
        <td className="py-4 px-4">
          <p className="font-bold text-sm" style={{ color: '#513012' }}>{fmtMoney(payment.final_amount)}</p>
          {parseFloat(payment.discount_amount || '0') > 0 && (
            <p className="text-xs text-green-600">-{fmtMoney(payment.discount_amount)}</p>
          )}
        </td>
        <td className="py-4 px-4"><StatusBadge status={payment.status} /></td>
        <td className="py-4 px-4">
          {payment.proof_image_url
            ? <a href={payment.proof_image_url} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                <Eye size={11} /> View
              </a>
            : <span className="text-xs text-gray-300">No proof</span>
          }
        </td>
        <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
          {payment.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => onAction(payment, 'approve')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: '#f0faf4', color: '#16a34a', border: '1px solid rgba(22,163,74,0.3)' }}>
                <ThumbsUp size={11} /> Approve
              </button>
              <button onClick={() => onAction(payment, 'reject')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
                <ThumbsDown size={11} /> Reject
              </button>
            </div>
          )}
          {payment.admin_notes && payment.status !== 'pending' && (
            <p className="text-xs text-secondary italic max-w-[160px] truncate" title={payment.admin_notes}>
              "{payment.admin_notes}"
            </p>
          )}
        </td>
        <td className="py-4 px-4">
          {expanded ? <ChevronUp size={14} className="text-secondary" /> : <ChevronDown size={14} className="text-secondary" />}
        </td>
      </tr>

      {expanded && (
        <tr style={{ background: '#fafaf9' }}>
          <td colSpan={8} className="px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-secondary">TXN Reference</p>
                <p className="text-gray-600 font-mono text-xs">{payment.transaction_reference || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-secondary">Customer Note</p>
                <p className="text-gray-600 text-xs">{payment.payment_note || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-secondary">Uploaded At</p>
                <p className="text-gray-600 text-xs">{fmtDate(payment.uploaded_at)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-secondary">Admin Notes</p>
                <p className="text-gray-600 text-xs italic">{payment.admin_notes || '—'}</p>
              </div>
              {payment.verified_at && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1 text-secondary">Verified At</p>
                  <p className="text-gray-600 text-xs">{fmtDate(payment.verified_at)}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';

export default function SuperAdminPaymentsPage() {
  const [payments,    setPayments]    = useState<PaymentRequest[]>([]);
  const [plans,       setPlans]       = useState<{ id: number; name: string }[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState<FilterStatus>('pending');
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const PAGE_SIZE = 20;

  const [verifyTarget, setVerifyTarget] = useState<{ payment: PaymentRequest; action: 'approve' | 'reject' } | null>(null);
  const [showManual,   setShowManual]   = useState(false);

  const loadPayments = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true); else setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(PAGE_SIZE),
        ...(filter !== 'all' ? { status: filter } : {}),
        ...(search ? { search } : {}),
      });
      const data = await get<{ count: number; results: PaymentRequest[] }>(
        `/api/v1/subscription/payments/?${params}`,
      );
      setPayments(data.results ?? []);
      setTotal(data.count ?? 0);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to load payments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, filter, search]);

  const loadMeta = useCallback(async () => {
    try {
      const [plansData, restData] = await Promise.all([
        get<{ results: { id: number; name: string }[] }>('/api/v1/subscription/plans/?page_size=50'),
        get<{ results: Restaurant[] } | Restaurant[]>('/api/v1/restaurant/?page_size=200'),
      ]);
      setPlans(plansData.results ?? []);
      const rList = Array.isArray(restData) ? restData : (restData as any).results ?? [];
      setRestaurants(rList);
    } catch (e) {
      console.warn('Could not load meta:', e);
    }
  }, []);

  useEffect(() => { loadPayments(); }, [loadPayments]);
  useEffect(() => { loadMeta(); }, [loadMeta]);

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const approvedRevenue = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + parseFloat(p.final_amount || '0'), 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>
            Payment Requests
          </h1>
          <p className="text-secondary text-sm mt-1">Review and approve restaurant subscription payments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => loadPayments(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-gray-200 hover:bg-gray-50">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowManual(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: '#513012', color: '#fff' }}>
            <Plus size={14} /> Manual Activate
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',    value: total,                                  color: '#513012' },
          { label: 'Pending',  value: pendingCount,                           color: '#b45309' },
          { label: 'Approved', value: payments.filter(p => p.status === 'approved').length, color: '#16a34a' },
          { label: 'Revenue',  value: `Rs. ${approvedRevenue.toLocaleString()}`, color: '#7e22ce' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-1">{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search payments…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none bg-white" />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected', 'expired', 'cancelled'] as FilterStatus[]).map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={filter === s ? { background: '#513012', color: '#fff' } : { color: '#6b7280' }}>
              {s}{s === 'pending' && pendingCount > 0
                ? <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: '#b45309', color: '#fff' }}>{pendingCount}</span>
                : null}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            {filter === 'all' ? 'All Payments' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Payments`}
            <span className="text-sm font-normal text-secondary ml-2">({total})</span>
          </h2>
          <p className="text-xs text-secondary">Click row to expand · View proof before approving</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 text-secondary">
            <DollarSign size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">No {filter === 'all' ? '' : filter} payments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                    {['ID / Date', 'Restaurant', 'Plan', 'Amount', 'Status', 'Proof', 'Actions', ''].map(h => (
                      <th key={h} className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <PaymentRow key={p.id} payment={p}
                      onAction={(payment, action) => setVerifyTarget({ payment, action })} />
                  ))}
                </tbody>
              </table>
            </div>

            {total > PAGE_SIZE && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-xs text-secondary">Page {page} of {Math.ceil(total / PAGE_SIZE)}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40">Previous</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / PAGE_SIZE)}
                    className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {verifyTarget && (
        <VerifyModal
          payment={verifyTarget.payment}
          action={verifyTarget.action}
          onClose={() => setVerifyTarget(null)}
          onDone={() => { setVerifyTarget(null); loadPayments(true); }}
        />
      )}

      {showManual && (
        <ManualActivateModal
          plans={plans}
          restaurants={restaurants}
          onClose={() => setShowManual(false)}
          onDone={() => { setShowManual(false); loadPayments(true); }}
        />
      )}
    </div>
  );
}