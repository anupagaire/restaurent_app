'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Clock, CheckCircle2, XCircle, RefreshCw, Download,
  ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') ?? '' : '';
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token()}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail ?? data?.message ?? 'Failed');
  return data as T;
}

interface PaymentRecord {
  id: number;
  plan: number;
  plan_detail: { id: number; name: string; price: string; duration_days: number };
  promo_code: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  amount: string;
  discount_amount: string;
  final_amount: string;
  transaction_reference: string;
  payment_note: string;
  proof_image_url: string | null;
  uploaded_at: string | null;
  verified_at: string | null;
  admin_notes: string;
  created_on: string;
}

const STATUS_CFG = {
  pending:   { bg: '#fef3e2', color: '#b45309', icon: <Clock size={11} />,        label: 'Pending'   },
  approved:  { bg: '#f0faf4', color: '#16a34a', icon: <CheckCircle2 size={11} />, label: 'Approved'  },
  rejected:  { bg: '#fef2f2', color: '#dc2626', icon: <XCircle size={11} />,      label: 'Rejected'  },
  expired:   { bg: '#f3f4f6', color: '#6b7280', icon: <XCircle size={11} />,      label: 'Expired'   },
  cancelled: { bg: '#f3f4f6', color: '#6b7280', icon: <XCircle size={11} />,      label: 'Cancelled' },
};

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtMoney(v: string) {
  const n = parseFloat(v);
  return isNaN(n) ? '—' : `Rs. ${n.toLocaleString()}`;
}

function durationLabel(days: number) {
  if (days <= 31) return '1 Month';
  if (days <= 93) return '3 Months';
  if (days <= 186) return '6 Months';
  if (days <= 370) return '1 Year';
  return `${days} Days`;
}

function PaymentRow({ record }: { record: PaymentRecord }) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_CFG[record.status] ?? STATUS_CFG.pending;

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setExpanded(p => !p)}>
        <td className="py-4 px-4">
          <p className="font-mono text-sm font-bold text-gray-700">#{record.id}</p>
          <p className="text-xs text-secondary">{fmtDate(record.created_on)}</p>
        </td>
        <td className="py-4 px-4">
          <p className="font-semibold text-sm text-gray-800">{record.plan_detail?.name ?? `Plan #${record.plan}`}</p>
          <p className="text-xs text-secondary">{record.plan_detail ? durationLabel(record.plan_detail.duration_days) : '—'}</p>
        </td>
        <td className="py-4 px-4">
          <p className="font-bold text-sm" style={{ color: '#513012' }}>{fmtMoney(record.final_amount)}</p>
          {parseFloat(record.discount_amount || '0') > 0 && (
            <p className="text-xs text-green-600">-{fmtMoney(record.discount_amount)} discount</p>
          )}
        </td>
        <td className="py-4 px-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: s.bg, color: s.color }}>
            {s.icon} {s.label}
          </span>
        </td>
        <td className="py-4 px-4 text-xs text-secondary">
          {record.verified_at ? fmtDate(record.verified_at) : '—'}
        </td>
        <td className="py-4 px-4">
          {expanded ? <ChevronUp size={14} className="text-secondary" /> : <ChevronDown size={14} className="text-secondary" />}
        </td>
      </tr>

      {expanded && (
        <tr style={{ background: '#fafaf9' }}>
          <td colSpan={6} className="px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-secondary">TXN Reference</p>
                <p className="font-mono text-xs text-gray-600">{record.transaction_reference || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-secondary">Uploaded At</p>
                <p className="text-xs text-gray-600">{fmtDate(record.uploaded_at)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-secondary">Note</p>
                <p className="text-xs text-gray-600">{record.payment_note || '—'}</p>
              </div>
              {record.admin_notes && (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1 text-secondary">Admin Note</p>
                  <p className="text-xs font-medium px-3 py-2 rounded-lg"
                    style={{ background: record.status === 'rejected' ? '#fef2f2' : '#f0faf4',
                      color: record.status === 'rejected' ? '#dc2626' : '#16a34a' }}>
                    "{record.admin_notes}"
                  </p>
                </div>
              )}
              {record.proof_image_url && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1 text-secondary">Proof</p>
                  <a href={record.proof_image_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold underline" style={{ color: '#1d4ed8' }}>
                    View Screenshot
                  </a>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function PaymentHistoryPage() {
  const [records,    setRecords]    = useState<PaymentRecord[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const PAGE_SIZE = 10;

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true); else setLoading(true);
    try {
      const data = await get<{ count: number; results: PaymentRecord[] }>(
        `/api/v1/subscription/payments/status/?page=${page}&page_size=${PAGE_SIZE}&ordering=-created_on`,
      );
      setRecords(data.results ?? []);
      setTotal(data.count ?? 0);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to load payment history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const totalPaid = records
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + parseFloat(r.final_amount || '0'), 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>
            Payment History
          </h1>
          <p className="text-secondary text-sm mt-1">All your subscription payment requests</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} style={{ color: '#513012' }} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Requests', value: total,                                    color: '#513012' },
          { label: 'Approved',       value: records.filter(r => r.status === 'approved').length, color: '#16a34a' },
          { label: 'Total Paid',     value: `Rs. ${totalPaid.toLocaleString()}`,      color: '#7e22ce' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-xs text-secondary mb-1">{label}</p>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            All Payments
            <span className="text-sm font-normal text-secondary ml-2">({total})</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin" style={{ color: '#513012' }} />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-secondary">
            <p className="font-medium">No payment history yet</p>
            <p className="text-xs mt-1">Your payment requests will appear here</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                    {['ID / Date', 'Plan', 'Amount', 'Status', 'Verified On', ''].map(h => (
                      <th key={h} className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => <PaymentRow key={r.id} record={r} />)}
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
    </div>
  );
}