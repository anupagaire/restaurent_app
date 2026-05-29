'use client';

import { useState, useEffect, useCallback} from 'react';
import {
  Search, RefreshCw, Loader2, Download,
  CheckCircle2, Clock, XCircle, Building2, 
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

interface PaymentRequest {
  id: number;
  restaurant: number;
  restaurant_name?: string;
  plan_detail?: { name: string; price: string; duration_days: number };
  status: string;
  amount: string;
  discount_amount: string;
  final_amount: string;
  plan?: number;
  transaction_reference: string;
  payment_note: string;
  admin_notes: string;
  created_on: string;
  verified_at: string | null;
  uploaded_at: string | null;
}

interface Restaurant {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  owner_name?: string;
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtMoney(v: string) {
  const n = parseFloat(v || '0');
  return isNaN(n) ? '0' : n.toLocaleString();
}

function durationLabel(days: number) {
  if (days <= 31) return '1 Month';
  if (days <= 93) return '3 Months';
  if (days <= 186) return '6 Months';
  if (days <= 370) return '1 Year';
  return `${days} Days`;
}

// ─── Invoice Preview ──────────────────────────────────────────────────────────

function InvoicePreview({ payment, restaurant }: {
  payment: PaymentRequest;
  restaurant: Restaurant | null;
}) {
  const invoiceNo = `INV-${String(payment.id).padStart(5, '0')}`;
  const discount = parseFloat(payment.discount_amount || '0');
  const amount   = parseFloat(payment.amount || '0');
  const final    = parseFloat(payment.final_amount || '0');

  return (
    <div id="invoice-print-area" className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      style={{ fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <div className="p-8 pb-6" style={{ background: 'linear-gradient(135deg, #513012 0%, #7c4a1e 100%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">INVOICE</h1>
            <p className="text-orange-200 mt-1 text-sm">{invoiceNo}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-lg">Restaurant SaaS</p>
            <p className="text-orange-200 text-xs mt-0.5">Subscription Management</p>
            <p className="text-orange-200 text-xs">Kathmandu, Nepal</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Bill To + Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Bill To</p>
            <p className="font-bold text-gray-800 text-base">
              {restaurant?.name ?? payment.restaurant_name ?? `Restaurant #${payment.restaurant}`}
            </p>
            {restaurant?.owner_name && <p className="text-gray-600 text-sm mt-0.5">{restaurant.owner_name}</p>}
            {restaurant?.email     && <p className="text-gray-500 text-sm">{restaurant.email}</p>}
            {restaurant?.phone     && <p className="text-gray-500 text-sm">{restaurant.phone}</p>}
            {restaurant?.address   && <p className="text-gray-500 text-sm mt-1">{restaurant.address}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Invoice Details</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-8">
                <span className="text-gray-500">Invoice No</span>
                <span className="font-semibold text-gray-800">{invoiceNo}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-gray-500">Date Issued</span>
                <span className="font-semibold text-gray-800">{fmtDate(payment.created_on)}</span>
              </div>
              {payment.verified_at && (
                <div className="flex justify-between gap-8">
                  <span className="text-gray-500">Date Approved</span>
                  <span className="font-semibold text-gray-800">{fmtDate(payment.verified_at)}</span>
                </div>
              )}
              <div className="flex justify-between gap-8">
                <span className="text-gray-500">Status</span>
                <span className="font-bold" style={{
                  color: payment.status === 'approved' ? '#16a34a' : payment.status === 'pending' ? '#b45309' : '#dc2626'
                }}>
                  {payment.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th className="py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Description</th>
                <th className="py-3 text-center text-xs font-bold uppercase tracking-widest text-gray-400">Duration</th>
                <th className="py-3 text-right text-xs font-bold uppercase tracking-widest text-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td className="py-4">
                  <p className="font-semibold text-gray-800">
                    {payment.plan_detail?.name ?? 'Subscription Plan'} — Subscription
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Restaurant subscription service</p>
                </td>
                <td className="py-4 text-center text-sm text-gray-600">
                  {payment.plan_detail ? durationLabel(payment.plan_detail.duration_days) : '—'}
                </td>
                <td className="py-4 text-right font-semibold text-gray-800">
                  NPR {fmtMoney(payment.amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold">NPR {fmtMoney(payment.amount)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: '#16a34a' }}>Discount</span>
                <span className="font-semibold" style={{ color: '#16a34a' }}>- NPR {fmtMoney(payment.discount_amount)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-bold text-gray-800">Total Due</span>
              <span className="font-bold text-lg" style={{ color: '#513012' }}>NPR {fmtMoney(payment.final_amount)}</span>
            </div>
          </div>
        </div>

        {/* TXN ref */}
        {payment.transaction_reference && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: '#f8f4f0', border: '1px solid rgba(184,147,106,0.25)' }}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Transaction Reference</p>
            <p className="font-mono text-sm text-gray-700">{payment.transaction_reference}</p>
          </div>
        )}

        {/* Admin notes */}
        {payment.admin_notes && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: '#f0faf4', border: '1px solid rgba(22,163,74,0.2)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#166534' }}>Verified Note</p>
            <p className="text-sm" style={{ color: '#166534' }}>{payment.admin_notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-6 text-center">
          <p className="text-xs text-gray-400">
            This is a computer-generated invoice. For queries, contact support.
          </p>
          <p className="text-xs text-gray-300 mt-1">Payment processed manually and verified by superadmin.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Send Invoice Modal ───────────────────────────────────────────────────────

function SendInvoiceModal({ payment, restaurant, onClose }: {
  payment: PaymentRequest;
  restaurant: Restaurant | null;
  onClose: () => void;
}) {
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState('');

  // Since there's no send-invoice API endpoint, we print/download the invoice
  // The "send" action downloads the invoice as a printable HTML page
  // which the superadmin can then email manually, or
  // you can add an email endpoint later

  const handleDownloadAndSend = () => {
    setSending(true);
    try {
      const invoiceEl = document.getElementById('invoice-print-area');
      if (!invoiceEl) return;

      const invoiceNo = `INV-${String(payment.id).padStart(5, '0')}`;
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${invoiceNo}</title>
  <style>
    body { font-family: Georgia, serif; margin: 0; padding: 40px; color: #1e0f02; }
    * { box-sizing: border-box; }
    .header { background: #513012; color: white; padding: 40px; border-radius: 12px 12px 0 0; }
    .header h1 { margin: 0; font-size: 2rem; letter-spacing: 4px; }
    .header-sub { color: #fbbf89; font-size: 0.85rem; margin-top: 4px; }
    .header-right { text-align: right; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; }
    .body { padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; font-weight: bold; margin-bottom: 8px; }
    .bill-name { font-weight: bold; font-size: 1rem; }
    .bill-detail { font-size: 0.875rem; color: #6b7280; margin-top: 2px; }
    .detail-row { display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 4px; }
    .detail-row span:first-child { color: #6b7280; }
    .detail-row span:last-child { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    thead th { border-bottom: 2px solid #e5e7eb; padding: 12px 0; text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; }
    thead th:last-child { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    tbody td { padding: 16px 0; border-bottom: 1px solid #f3f4f6; font-size: 0.875rem; vertical-align: top; }
    tbody td:last-child { text-align: right; font-weight: 600; }
    tbody td:nth-child(2) { text-align: center; color: #6b7280; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 32px; }
    .totals-inner { width: 260px; }
    .total-row { display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 8px; }
    .total-row span:first-child { color: #6b7280; }
    .total-final { border-top: 2px solid #e5e7eb; padding-top: 8px; display: flex; justify-content: space-between; }
    .total-final span:first-child { font-weight: bold; }
    .total-final span:last-child { font-weight: bold; font-size: 1.1rem; color: #513012; }
    .discount { color: #16a34a !important; }
    .note-box { background: #f8f4f0; border: 1px solid rgba(184,147,106,0.25); border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .note-box .label { color: #9a7458; }
    .footer { border-top: 1px solid #f3f4f6; padding-top: 24px; text-align: center; color: #9ca3af; font-size: 0.75rem; }
    .status-approved { color: #16a34a; font-weight: bold; }
    .status-pending  { color: #b45309; font-weight: bold; }
    .status-rejected { color: #dc2626; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-row">
      <div>
        <h1>INVOICE</h1>
        <p class="header-sub">${invoiceNo}</p>
      </div>
      <div class="header-right" style="color:white">
        <p style="font-weight:bold;font-size:1.1rem">Restaurant SaaS</p>
        <p style="color:#fbbf89;font-size:0.8rem">Subscription Management</p>
        <p style="color:#fbbf89;font-size:0.8rem">Kathmandu, Nepal</p>
      </div>
    </div>
  </div>
  <div class="body">
    <div class="grid-2">
      <div>
        <p class="label">Bill To</p>
        <p class="bill-name">${restaurant?.name ?? payment.restaurant_name ?? `Restaurant #${payment.restaurant}`}</p>
        ${restaurant?.owner_name ? `<p class="bill-detail">${restaurant.owner_name}</p>` : ''}
        ${restaurant?.email ? `<p class="bill-detail">${restaurant.email}</p>` : ''}
        ${restaurant?.phone ? `<p class="bill-detail">${restaurant.phone}</p>` : ''}
        ${restaurant?.address ? `<p class="bill-detail">${restaurant.address}</p>` : ''}
      </div>
      <div style="text-align:right">
        <p class="label">Invoice Details</p>
        <div class="detail-row"><span>Invoice No</span><span>${invoiceNo}</span></div>
        <div class="detail-row"><span>Date</span><span>${fmtDate(payment.created_on)}</span></div>
        ${payment.verified_at ? `<div class="detail-row"><span>Approved</span><span>${fmtDate(payment.verified_at)}</span></div>` : ''}
        <div class="detail-row"><span>Status</span><span class="status-${payment.status}">${payment.status.toUpperCase()}</span></div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Duration</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${payment.plan_detail?.name ?? 'Subscription Plan'}</strong><br>
            <span style="color:#6b7280;font-size:0.8rem">Restaurant subscription service</span>
          </td>
          <td>${payment.plan_detail ? durationLabel(payment.plan_detail.duration_days) : '—'}</td>
          <td>NPR ${fmtMoney(payment.amount)}</td>
        </tr>
      </tbody>
    </table>
    <div class="totals">
      <div class="totals-inner">
        <div class="total-row"><span>Subtotal</span><span>NPR ${fmtMoney(payment.amount)}</span></div>
        ${parseFloat(payment.discount_amount || '0') > 0
          ? `<div class="total-row"><span class="discount">Discount</span><span class="discount">- NPR ${fmtMoney(payment.discount_amount)}</span></div>`
          : ''}
        <div class="total-final"><span>Total Due</span><span>NPR ${fmtMoney(payment.final_amount)}</span></div>
      </div>
    </div>
    ${payment.transaction_reference
      ? `<div class="note-box"><p class="label">Transaction Reference</p><p style="font-family:monospace">${payment.transaction_reference}</p></div>`
      : ''}
    ${payment.admin_notes
      ? `<div class="note-box" style="background:#f0faf4;border-color:rgba(22,163,74,0.2)"><p class="label" style="color:#166534">Verified Note</p><p style="color:#166534">${payment.admin_notes}</p></div>`
      : ''}
    <div class="footer">
      <p>This is a computer-generated invoice. For queries, contact support.</p>
      <p style="margin-top:4px">Payment processed manually and verified by superadmin.</p>
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${invoiceNo}.html`;
      a.click();
      URL.revokeObjectURL(url);
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed z-50 rounded-3xl w-full max-w-sm bg-white p-6"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
        {sent ? (
          <div className="text-center py-4">
            <CheckCircle2 size={48} className="mx-auto mb-3" style={{ color: '#16a34a' }} />
            <p className="font-bold text-lg" style={{ color: '#166534' }}>Invoice Downloaded!</p>
            <p className="text-sm text-gray-500 mt-2 mb-5">
              Open the downloaded HTML file and print/share it with the restaurant admin.
            </p>
            <button onClick={onClose}
              className="w-full py-3 rounded-2xl font-bold text-sm"
              style={{ background: '#513012', color: '#fff' }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-bold text-xl mb-2" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>
              Download Invoice
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Download invoice <strong>INV-{String(payment.id).padStart(5, '0')}</strong> for{' '}
              <strong>{restaurant?.name ?? `Restaurant #${payment.restaurant}`}</strong>.
              Open and print it or send via email.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-gray-200 text-gray-600">
                Cancel
              </button>
              <button onClick={handleDownloadAndSend} disabled={sending}
                className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: '#513012', color: '#fff' }}>
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {sending ? 'Preparing…' : 'Download'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SuperAdminInvoicePage() {
  const [payments,    setPayments]    = useState<PaymentRequest[]>([]);
  const [restaurants, setRestaurants] = useState<Record<number, Restaurant>>({});
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const PAGE_SIZE = 15;

  const [previewPayment, setPreviewPayment] = useState<PaymentRequest | null>(null);
  const [sendPayment,    setSendPayment]    = useState<PaymentRequest | null>(null);

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true); else setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), page_size: String(PAGE_SIZE),
        ordering: '-created_on',
        ...(search ? { search } : {}),
      });
      const data = await get<{ count: number; results: PaymentRequest[] }>(
        `/api/v1/subscription/payments/?${params}`,
      );
      setPayments(data.results ?? []);
      setTotal(data.count ?? 0);
      setError('');

      // Load restaurant details for each unique restaurant
      const ids = [...new Set((data.results ?? []).map(p => p.restaurant))];
      const restMap: Record<number, Restaurant> = { ...restaurants };
      await Promise.allSettled(
        ids.filter(id => !restMap[id]).map(async id => {
          try {
            const r = await get<Restaurant>(`/api/v1/restaurant/${id}/`);
            restMap[id] = r;
          } catch {}
        })
      );
      setRestaurants({ ...restMap });
    } catch (e: any) {
      setError(e.message || 'Failed to load.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const STATUS_CFG = {
    pending:   { bg: '#fef3e2', color: '#b45309', icon: <Clock size={10} />,        label: 'Pending'   },
    approved:  { bg: '#f0faf4', color: '#16a34a', icon: <CheckCircle2 size={10} />, label: 'Approved'  },
    rejected:  { bg: '#fef2f2', color: '#dc2626', icon: <XCircle size={10} />,      label: 'Rejected'  },
    expired:   { bg: '#f3f4f6', color: '#6b7280', icon: <XCircle size={10} />,      label: 'Expired'   },
    cancelled: { bg: '#f3f4f6', color: '#6b7280', icon: <XCircle size={10} />,      label: 'Cancelled' },
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>
            Invoices
          </h1>
          <p className="text-gray-500 text-sm mt-1">Generate and send invoices to restaurant admins</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-gray-200 hover:bg-gray-50">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by restaurant or plan…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none bg-white" />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      {/* Invoice preview */}
      {previewPayment && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg" style={{ color: '#513012' }}>
              Invoice Preview — INV-{String(previewPayment.id).padStart(5, '0')}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setSendPayment(previewPayment)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: '#513012', color: '#fff' }}>
                <Download size={14} /> Download Invoice
              </button>
              <button onClick={() => setPreviewPayment(null)}
                className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-500">
                Close Preview
              </button>
            </div>
          </div>
          <InvoicePreview
            payment={previewPayment}
            restaurant={restaurants[previewPayment.restaurant] ?? null}
          />
        </div>
      )}

      {/* Payments table */}
      {!previewPayment && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">
              All Payments
              <span className="text-sm font-normal text-gray-400 ml-2">({total})</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#513012] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="font-medium">No payments found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                      {['Invoice', 'Restaurant', 'Plan', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                        <th key={h} className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => {
                      const s = STATUS_CFG[p.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;
                      const rest = restaurants[p.restaurant];
                      return (
                        <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <p className="font-mono font-bold text-sm" style={{ color: '#513012' }}>
                              INV-{String(p.id).padStart(5, '0')}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Building2 size={13} className="text-gray-400" />
                              <p className="font-semibold text-sm text-gray-800">
                                {rest?.name ?? p.restaurant_name ?? `Restaurant #${p.restaurant}`}
                              </p>
                            </div>
                            {rest?.email && <p className="text-xs text-gray-400 mt-0.5 ml-5">{rest.email}</p>}
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-700">{p.plan_detail?.name ?? `Plan #${p.plan}`}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-sm" style={{ color: '#513012' }}>
                              Rs. {parseFloat(p.final_amount || '0').toLocaleString()}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{ background: s.bg, color: s.color }}>
                              {s.icon} {s.label}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-xs text-gray-500">{fmtDate(p.created_on)}</p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button onClick={() => setPreviewPayment(p)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 hover:bg-gray-50 text-gray-600">
                                Preview
                              </button>
                              <button onClick={() => { setPreviewPayment(p); setSendPayment(p); }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                                style={{ background: '#513012', color: '#fff' }}>
                                <Download size={11} /> Invoice
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {total > PAGE_SIZE && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Page {page} of {Math.ceil(total / PAGE_SIZE)}</p>
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
      )}

      {sendPayment && (
        <SendInvoiceModal
          payment={sendPayment}
          restaurant={restaurants[sendPayment.restaurant] ?? null}
          onClose={() => setSendPayment(null)}
        />
      )}
    </div>
  );
}