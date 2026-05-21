'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import {
  CheckCircle2, Clock, XCircle, RefreshCw,
  Search, Crown, Zap, Gift, Phone, Mail,
  Building2, Calendar, DollarSign, Filter,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Subscription {
  id: number;
  plan: 'free' | 'basic' | 'pro';
  plan_name: string;
  duration_months: number;
  promo_code: string | null;
  original_price: number;
  final_price: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  restaurant_name: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  notes: string | null;
}

type StatusFilter = 'all' | 'pending' | 'active' | 'expired' | 'cancelled';

// ─── Mock Data (remove when API is ready) ─────────────────────────────────────
// TODO: Delete MOCK_DATA and use only the API fetch below

const MOCK_DATA: Subscription[] = [
  {
    id: 1, plan: 'pro', plan_name: 'Pro', duration_months: 12,
    promo_code: 'SAVE30', original_price: 8999, final_price: 6299,
    customer_name: 'Anu Pagaire', customer_phone: '+9779860077724',
    customer_email: 'anu@gmail.com', restaurant_name: 'Anu Restaurant',
    status: 'active', starts_at: '2026-05-01', expires_at: '2027-05-01',
    created_at: '2026-04-30T10:00:00Z', notes: null,
  },
  {
    id: 2, plan: 'basic', plan_name: 'Basic', duration_months: 1,
    promo_code: null, original_price: 999, final_price: 999,
    customer_name: 'Ram Sharma', customer_phone: '+9779812345678',
    customer_email: 'ram@gmail.com', restaurant_name: 'Ram\'s Kitchen',
    status: 'pending', starts_at: null, expires_at: null,
    created_at: '2026-05-20T14:30:00Z', notes: null,
  },
  {
    id: 3, plan: 'free', plan_name: 'Free Trial', duration_months: 1,
    promo_code: 'WELCOME', original_price: 0, final_price: 0,
    customer_name: 'Sita Thapa', customer_phone: '+9779856789012',
    customer_email: 'sita@gmail.com', restaurant_name: 'Sita Cafe',
    status: 'expired', starts_at: '2026-04-01', expires_at: '2026-05-01',
    created_at: '2026-04-01T09:00:00Z', notes: null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('en-NP', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  pending:   { bg: '#fef3e2', color: '#b45309', icon: <Clock size={11} />,        label: 'Pending'   },
  active:    { bg: '#f0faf4', color: '#16a34a', icon: <CheckCircle2 size={11} />, label: 'Active'    },
  expired:   { bg: '#f3f4f6', color: '#6b7280', icon: <XCircle size={11} />,      label: 'Expired'   },
  cancelled: { bg: '#fef2f2', color: '#dc2626', icon: <XCircle size={11} />,      label: 'Cancelled' },
};

function StatusBadge({ status }: { status: Subscription['status'] }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.icon} {s.label}
    </span>
  );
}

const PLAN_ICON = {
  free:  <Gift  size={14} color="#16a34a" />,
  basic: <Zap   size={14} color="#1d4ed8" />,
  pro:   <Crown size={14} color="#7e22ce" />,
};

// ─── Subscription Row ─────────────────────────────────────────────────────────

function SubRow({ sub, onActivate, onCancel }: {
  sub: Subscription;
  onActivate: (id: number) => void;
  onCancel: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setExpanded(p => !p)}
      >
        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            {PLAN_ICON[sub.plan]}
            <div>
              <p className="font-semibold text-sm text-gray-800">{sub.plan_name}</p>
              <p className="text-xs text-gray-400">{sub.duration_months} month{sub.duration_months > 1 ? 's' : ''}</p>
            </div>
          </div>
        </td>

        <td className="py-4 px-4">
          <p className="font-semibold text-sm text-gray-800">{sub.customer_name}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Building2 size={10} /> {sub.restaurant_name}
          </p>
        </td>

        <td className="py-4 px-4">
          <StatusBadge status={sub.status} />
        </td>

        <td className="py-4 px-4">
          <div>
            <p className="font-bold text-sm" style={{ color: '#513012' }}>
              {sub.final_price === 0 ? 'Free' : `Rs. ${sub.final_price.toLocaleString()}`}
            </p>
            {sub.promo_code && (
              <p className="text-xs" style={{ color: '#16a34a' }}>🎟 {sub.promo_code}</p>
            )}
            {sub.final_price < sub.original_price && sub.original_price > 0 && (
              <p className="text-xs text-gray-400 line-through">Rs. {sub.original_price.toLocaleString()}</p>
            )}
          </div>
        </td>

        <td className="py-4 px-4">
          <p className="text-xs text-gray-500">{formatDate(sub.starts_at)} →</p>
          <p className="text-xs text-gray-500">{formatDate(sub.expires_at)}</p>
        </td>

        <td className="py-4 px-4">
          <p className="text-xs text-gray-400">{formatDateTime(sub.created_at)}</p>
        </td>

        <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
          <div className="flex gap-2">
            {sub.status === 'pending' && (
              <button
                onClick={() => onActivate(sub.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: '#16a34a', color: '#fff' }}
              >
                Activate
              </button>
            )}
            {sub.status === 'active' && (
              <button
                onClick={() => onCancel(sub.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
              >
                Cancel
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded details */}
      {expanded && (
        <tr style={{ background: '#fafaf9' }}>
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-400">Contact</p>
                <p className="flex items-center gap-1 text-gray-600"><Phone size={11} /> {sub.customer_phone}</p>
                <p className="flex items-center gap-1 text-gray-600 mt-1"><Mail size={11} /> {sub.customer_email}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-400">Invoice</p>
                <p className="text-gray-600">Original: Rs. {sub.original_price.toLocaleString()}</p>
                <p className="text-gray-600">Paid: Rs. {sub.final_price.toLocaleString()}</p>
                {sub.promo_code && <p style={{ color: '#16a34a' }}>Promo: {sub.promo_code}</p>}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-400">Subscription ID</p>
                <p className="font-mono text-gray-600">#{sub.id}</p>
              </div>
              {sub.notes && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-400">Notes</p>
                  <p className="text-gray-600 italic">{sub.notes}</p>
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

export default function SuperAdminSubscriptionsPage() {
  const [subs,       setSubs]       = useState<Subscription[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubs = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      // TODO: Replace mock with real API when ready:
      // const res = await apiFetch('/api/v1/subscriptions/?page_size=100');
      // const data = await res.json();
      // setSubs(Array.isArray(data) ? data : data.results ?? []);

      // Using mock data for now
      await new Promise(r => setTimeout(r, 500));
      setSubs(MOCK_DATA);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const handleActivate = async (id: number) => {
    // TODO: PATCH /api/v1/subscriptions/{id}/  →  { status: 'active', starts_at: today, expires_at: today + duration }
    setSubs(prev => prev.map(s =>
      s.id === id
        ? { ...s, status: 'active', starts_at: new Date().toISOString().split('T')[0] }
        : s,
    ));
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this subscription?')) return;
    // TODO: PATCH /api/v1/subscriptions/{id}/  →  { status: 'cancelled' }
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' } : s));
  };

  // Filtered list
  const filtered = subs.filter(s => {
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.customer_name.toLowerCase().includes(q) ||
      s.restaurant_name.toLowerCase().includes(q) ||
      s.customer_email.toLowerCase().includes(q) ||
      s.customer_phone.includes(q);
    return matchStatus && matchSearch;
  });

  // Stats
  const stats = {
    total:    subs.length,
    active:   subs.filter(s => s.status === 'active').length,
    pending:  subs.filter(s => s.status === 'pending').length,
    revenue:  subs.filter(s => s.status === 'active').reduce((sum, s) => sum + s.final_price, 0),
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-10 h-10 border-4 border-[#513012] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">Loading subscriptions…</p>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>
            Subscriptions
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage all restaurant plans and payments</p>
        </div>
        <button
          onClick={() => fetchSubs(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-gray-200 hover:bg-gray-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',   value: stats.total,                            color: '#513012', icon: <Crown size={16} />        },
          { label: 'Active',  value: stats.active,                           color: '#16a34a', icon: <CheckCircle2 size={16} /> },
          { label: 'Pending', value: stats.pending,                          color: '#b45309', icon: <Clock size={16} />        },
          { label: 'Revenue', value: `Rs. ${stats.revenue.toLocaleString()}`, color: '#7e22ce', icon: <DollarSign size={16} />  },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2" style={{ color }}>
              {icon}
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
            </div>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, restaurant, email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none bg-white"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100">
          {(['all', 'pending', 'active', 'expired', 'cancelled'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={
                statusFilter === s
                  ? { background: '#513012', color: '#fff' }
                  : { color: '#6b7280' }
              }
            >
              {s}
              <span
                className="ml-1 text-xs"
                style={{ opacity: 0.7 }}
              >
                ({s === 'all' ? subs.length : subs.filter(x => x.status === s).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            {statusFilter === 'all' ? 'All Subscriptions' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Subscriptions`}
            <span className="text-sm font-normal text-gray-400 ml-2">({filtered.length})</span>
          </h2>
          <p className="text-xs text-gray-400">Click a row to expand</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Crown size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">No subscriptions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                  {['Plan', 'Customer', 'Status', 'Price', 'Period', 'Requested', 'Actions'].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(sub => (
                  <SubRow
                    key={sub.id}
                    sub={sub}
                    onActivate={handleActivate}
                    onCancel={handleCancel}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}