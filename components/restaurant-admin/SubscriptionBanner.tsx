'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw, X, ArrowRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') ?? '' : '';
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail ?? data?.message ?? 'Failed');
  return data as T;
}

interface CurrentSub {
  is_active: boolean;
  message: string | null;
  current_subscription: {
    id: number;
    status: string;
    start_date: string;
    end_date: string;
    plan: { name: string };
  } | null;
  latest_subscription: { id: number; status: string } | null;
}

interface PaymentStatus {
  id: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  final_amount: string;
  admin_notes: string;
  plan_detail?: { name: string };
  created_on: string;
  verified_at: string | null;
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NP', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function daysLeft(end: string) {
  const diff = Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function SubscriptionBanner() {
  const [sub,         setSub]         = useState<CurrentSub | null>(null);
  const [payments,    setPayments]    = useState<PaymentStatus[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [dismissed,   setDismissed]   = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);

  const load = async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const [subData, payData] = await Promise.all([
        get<CurrentSub>('/api/v1/subscription/subscriptions/current/'),
        get<{ results: PaymentStatus[] } | PaymentStatus[]>('/api/v1/subscription/payments/status/').catch(() => ({ results: [] })),
      ]);
      setSub(subData);
      const list = Array.isArray(payData) ? payData : (payData as any).results ?? [];
      setPayments(list);
    } catch (e) {
      console.error('SubscriptionBanner load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading || dismissed) return null;

  // ── Derive state ──────────────────────────────────────────────────────────

  const activeSub    = sub?.current_subscription;
  const latestPay    = payments[0] ?? null;
  const isPending    = latestPay?.status === 'pending';
  const isRejected   = latestPay?.status === 'rejected';
  const isActive     = sub?.is_active && activeSub;
  const isExpired    = !sub?.is_active && !isPending;



  // ── Active but expiring soon ──────────────────────────────────────────────
  if (isActive && activeSub) {
    const days = daysLeft(activeSub.end_date);
    return (
      <div className="rounded-2xl p-4 mb-6 flex items-start gap-3"
        style={{ background: '#fef3e2', border: '1px solid rgba(180,83,9,0.25)' }}>
        <Clock size={18} style={{ color: '#b45309', flexShrink: 0, marginTop: 1 }} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm" style={{ color: '#92400e' }}>
              ⚠️ Subscription expiring in {days} day{days !== 1 ? 's' : ''}
            </p>
            <button onClick={() => setDismissed(true)} className="p-1 rounded hover:bg-orange-100">
              <X size={14} style={{ color: '#b45309' }} />
            </button>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
            <strong>{activeSub.plan.name}</strong> — expires {fmtDate(activeSub.end_date)}.
            Renew now to avoid interruption.
          </p>
          <Link href="/restaurant-admin/subscription"
            className="inline-flex items-center gap-1 mt-2 text-xs font-bold underline"
            style={{ color: '#b45309' }}>
            Renew Plan <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Payment pending ───────────────────────────────────────────────────────
  if (isPending && latestPay) {
    return (
      <div className="rounded-2xl p-4 mb-6 flex items-start gap-3"
        style={{ background: '#fef3e2', border: '1px solid rgba(180,83,9,0.25)' }}>
        <Clock size={18} style={{ color: '#b45309', flexShrink: 0, marginTop: 1 }} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm" style={{ color: '#92400e' }}>
              ⏳ Payment Under Review
            </p>
            <button onClick={() => load(true)} className="p-1 rounded hover:bg-orange-100" title="Refresh">
              <RefreshCw size={13} style={{ color: '#b45309' }}
                className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
            Payment #{latestPay.id} for <strong>{latestPay.plan_detail?.name ?? 'your plan'}</strong> — Rs.{' '}
            {parseFloat(latestPay.final_amount || '0').toLocaleString()} NPR is pending superadmin verification.
          </p>
          <p className="text-xs mt-1 opacity-75" style={{ color: '#b45309' }}>
            Submitted {fmtDate(latestPay.created_on)}. Our team usually approves within a few hours.
          </p>
        </div>
      </div>
    );
  }

  // ── Payment rejected ──────────────────────────────────────────────────────
  if (isRejected && latestPay) {
    return (
      <div className="rounded-2xl p-4 mb-6 flex items-start gap-3"
        style={{ background: '#fef2f2', border: '1px solid rgba(220,38,38,0.25)' }}>
        <XCircle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm" style={{ color: '#991b1b' }}>
              ❌ Payment Rejected
            </p>
            <button onClick={() => setDismissed(true)} className="p-1 rounded hover:bg-red-100">
              <X size={14} style={{ color: '#dc2626' }} />
            </button>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#991b1b' }}>
            Your payment request for <strong>{latestPay.plan_detail?.name ?? 'your plan'}</strong> was rejected.
          </p>
          {latestPay.admin_notes && (
            <div className="mt-2 p-2.5 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(220,38,38,0.08)', color: '#991b1b', border: '1px solid rgba(220,38,38,0.15)' }}>
              Admin reason: "{latestPay.admin_notes}"
            </div>
          )}
          <Link href="/restaurant-admin/subscription"
            className="inline-flex items-center gap-1 mt-2 text-xs font-bold underline"
            style={{ color: '#dc2626' }}>
            Try Again <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Active subscription info card (within 7 days, show details) ───────────
  if (isActive && activeSub) {
    return (
      <div className="rounded-2xl p-4 mb-6 flex items-start gap-3"
        style={{ background: '#f0faf4', border: '1px solid rgba(22,163,74,0.25)' }}>
        <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: 1 }} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm" style={{ color: '#166534' }}>
              ✅ Subscription Active
            </p>
            <button onClick={() => setDismissed(true)} className="p-1 rounded hover:bg-green-100">
              <X size={14} style={{ color: '#16a34a' }} />
            </button>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#166534' }}>
            <strong>{activeSub.plan.name}</strong> — active from{' '}
            <strong>{fmtDate(activeSub.start_date)}</strong> to{' '}
            <strong>{fmtDate(activeSub.end_date)}</strong>
          </p>
        </div>
      </div>
    );
  }

  // ── No active sub / expired ───────────────────────────────────────────────
  if (isExpired) {
    return (
      <div className="rounded-2xl p-4 mb-6 flex items-start justify-between gap-3"
        style={{ background: '#fef2f2', border: '1px solid rgba(220,38,38,0.25)' }}>
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="font-bold text-sm" style={{ color: '#991b1b' }}>
              Subscription expired or inactive
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#dc2626' }}>
              {sub?.message ?? 'Renew to enable QR ordering and order taking.'}
            </p>
          </div>
        </div>
        <Link href="/restaurant-admin/subscription"
          className="shrink-0 text-xs font-bold underline flex items-center gap-1 mt-0.5"
          style={{ color: '#dc2626' }}>
          Choose a Plan <ArrowRight size={11} />
        </Link>
      </div>
    );
  }

  return null;
}