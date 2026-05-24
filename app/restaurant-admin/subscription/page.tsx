'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Clock, XCircle, Crown, Zap, Gift,
  Tag, ArrowRight, Upload, Loader2, X, Check, RefreshCw, AlertCircle,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') ?? '' : '';
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
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

async function postForm<T>(path: string, fd: FormData): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}` },
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail ?? data?.errors?.detail ?? data?.message ?? JSON.stringify(data));
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: number;
  code: string;
  name: string;
  description: string;
  price: string;
  duration_days: number;
  features: Record<string, any> | string;
  is_trial: boolean;
  is_active: boolean;
  ordering: number;
}

interface PromoResult {
  valid: boolean;
  code: string;
  discount_amount: string;
  final_amount: string;
}

interface PaymentStatus {
  id: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  amount: string;
  final_amount: string;
  admin_notes: string;
  plan_detail?: { name: string };
  created_on: string;
  verified_at: string | null;
}

interface CurrentSub {
  is_active: boolean;
  message: string | null;
  current_subscription: {
    id: number;
    status: string;
    start_date: string;
    end_date: string;
    plan: { name: string; code: string };
  } | null;
  latest_subscription: {
    id: number;
    status: string;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function planAccent(plan: Plan) {
  if (plan.is_trial) return '#16a34a';
  return parseFloat(plan.price) < 2000 ? '#1d4ed8' : '#7e22ce';
}
function planIcon(plan: Plan) {
  if (plan.is_trial) return <Gift size={18} />;
  return parseFloat(plan.price) < 2000 ? <Zap size={18} /> : <Crown size={18} />;
}
function durationLabel(days: number) {
  if (days <= 31) return '1 Month';
  if (days <= 93) return '3 Months';
  if (days <= 186) return '6 Months';
  if (days <= 370) return '1 Year';
  return `${days} Days`;
}
function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' });
}
function featuresArray(features: Record<string, any> | string | null): string[] {
  if (!features) return [];
  if (typeof features === 'string') return features.split('\n').filter(Boolean);
  return Object.entries(features)
    .filter(([, v]) => v === true || v === 1)
    .map(([k]) => k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
}

// ─── Payment Status Banner ────────────────────────────────────────────────────
// Shows after user submits payment — tells them if pending/approved/rejected

function PaymentStatusBanner({ statuses, onRefresh }: {
  statuses: PaymentStatus[];
  onRefresh: () => void;
}) {
  if (!statuses.length) return null;

  // Show the latest payment status
  const latest = statuses[0];

  if (latest.status === 'approved') {
    return (
      <div className="rounded-2xl p-5 mb-6"
        style={{ background: '#f0faf4', border: '2px solid rgba(22,163,74,0.3)' }}>
        <div className="flex items-start gap-3">
          <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1">
            <p className="font-bold text-base" style={{ color: '#166534' }}>✅ Payment Approved!</p>
            <p className="text-sm text-green-700 mt-1">
              Your payment for <strong>{latest.plan_detail?.name ?? 'your plan'}</strong> has been verified.
              Your subscription is now active.
            </p>
            {latest.admin_notes && (
              <div className="mt-2 text-xs p-2 rounded-lg" style={{ background: 'rgba(22,163,74,0.1)', color: '#166534' }}>
                Admin note: {latest.admin_notes}
              </div>
            )}
            {latest.verified_at && (
              <p className="text-xs text-green-600 mt-1">Verified on {fmtDate(latest.verified_at)}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (latest.status === 'rejected') {
    return (
      <div className="rounded-2xl p-5 mb-6"
        style={{ background: '#fef2f2', border: '2px solid rgba(220,38,38,0.3)' }}>
        <div className="flex items-start gap-3">
          <XCircle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1">
            <p className="font-bold text-base" style={{ color: '#991b1b' }}>❌ Payment Rejected</p>
            <p className="text-sm text-red-700 mt-1">
              Your payment request was rejected. Please try again with correct payment details.
            </p>
            {latest.admin_notes && (
              <div className="mt-2 text-sm p-3 rounded-lg font-medium"
                style={{ background: 'rgba(220,38,38,0.1)', color: '#991b1b' }}>
                Reason: "{latest.admin_notes}"
              </div>
            )}
            <p className="text-xs text-red-500 mt-2">You can choose a plan below to try again.</p>
          </div>
        </div>
      </div>
    );
  }

  if (latest.status === 'pending') {
    return (
      <div className="rounded-2xl p-5 mb-6"
        style={{ background: '#fef3e2', border: '2px solid rgba(180,83,9,0.25)' }}>
        <div className="flex items-start gap-3">
          <Clock size={20} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-base" style={{ color: '#92400e' }}>⏳ Payment Under Review</p>
              <button onClick={onRefresh} className="p-1 rounded-lg hover:bg-orange-100">
                <RefreshCw size={13} style={{ color: '#b45309' }} />
              </button>
            </div>
            <p className="text-sm mt-1" style={{ color: '#92400e' }}>
              Payment #{latest.id} for <strong>{latest.plan_detail?.name ?? 'your plan'}</strong> — Rs. {parseFloat(latest.final_amount).toLocaleString()} NPR
            </p>
            <p className="text-xs mt-2" style={{ color: '#b45309' }}>
              Our team is verifying your payment. This usually takes a few hours. Hit refresh to check status.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Current Subscription Card ────────────────────────────────────────────────

function CurrentSubCard({ data, onRefresh }: { data: CurrentSub; onRefresh: () => void }) {
  const sub = data.current_subscription;
  const latest = data.latest_subscription;

  const STATUS: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
    trialing:  { bg: '#eff6ff', color: '#1d4ed8', icon: <Clock size={13} />,        label: 'Trialing'  },
    active:    { bg: '#f0faf4', color: '#16a34a', icon: <CheckCircle2 size={13} />, label: 'Active'    },
    expired:   { bg: '#f3f4f6', color: '#6b7280', icon: <XCircle size={13} />,      label: 'Expired'   },
    cancelled: { bg: '#fef2f2', color: '#dc2626', icon: <XCircle size={13} />,      label: 'Cancelled' },
    pending:   { bg: '#fef3e2', color: '#b45309', icon: <Clock size={13} />,        label: 'Pending'   },
  };

  const cfg = STATUS[sub?.status ?? 'expired'] ?? STATUS.expired;

  if (!sub) return null;

  return (
    <div className="rounded-2xl p-5 mb-6 bg-white" style={{ border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>
          Current Subscription
        </h2>
        <button onClick={onRefresh} className="p-1.5 rounded-lg hover:bg-gray-100">
          <RefreshCw size={14} className="text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Plan</p>
          <p className="font-semibold text-sm text-gray-800">{sub.plan.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Status</p>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Start Date</p>
          <p className="font-semibold text-sm text-gray-800">{fmtDate(sub.start_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Expires</p>
          <p className="font-semibold text-sm text-gray-800">{fmtDate(sub.end_date)}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Promo Input ──────────────────────────────────────────────────────────────

function PromoInput({ planId, onApply, onClear }: {
  planId: number;
  onApply: (r: PromoResult & { code: string }) => void;
  onClear: () => void;
}) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [message, setMessage] = useState('');

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setStatus('loading');
    try {
      const result = await post<PromoResult>('/api/v1/subscription/promos/validate/', { code: trimmed, plan: planId });
      if (result.valid) {
        setStatus('valid');
        setMessage(`Rs. ${parseFloat(result.discount_amount).toLocaleString()} discount applied!`);
        onApply({ ...result, code: trimmed });
      } else {
        setStatus('invalid');
        setMessage('Invalid or expired promo code.');
      }
    } catch (e: any) {
      setStatus('invalid');
      setMessage(e.message || 'Failed to validate.');
    }
  };

  return (
    <div className="mb-5">
      <label className="text-xs font-semibold mb-1 block" style={{ color: '#9a7458' }}>Promo Code (optional)</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus('idle'); setMessage(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Enter promo code"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none"
            style={{ borderColor: status === 'valid' ? '#16a34a' : status === 'invalid' ? '#dc2626' : '#e5e7eb', background: '#fdf6ec' }} />
        </div>
        {status === 'valid'
          ? <button onClick={() => { setCode(''); setStatus('idle'); setMessage(''); onClear(); }}
              className="px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-500">Clear</button>
          : <button onClick={handleApply} disabled={status === 'loading' || !code.trim()}
              className="px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: '#513012', color: '#fff', opacity: !code.trim() ? 0.6 : 1 }}>
              {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
            </button>
        }
      </div>
      {message && (
        <p className="text-xs mt-1.5 font-semibold" style={{ color: status === 'valid' ? '#16a34a' : '#dc2626' }}>
          {status === 'valid' ? '🎉 ' : '❌ '}{message}
        </p>
      )}
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

function PaymentModal({ plan, onClose, onSuccess }: {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const price = parseFloat(plan.price);
  const isFree = price === 0 || plan.is_trial;

  const [step, setStep]                 = useState<'form' | 'instructions' | 'upload'>('form');
  const [paymentId, setPaymentId]       = useState<number | null>(null);
  const [instructions, setInstructions] = useState<any>(null);
  const [promo, setPromo]               = useState<(PromoResult & { code: string }) | null>(null);
  const [txRef, setTxRef]               = useState('');
  const [note, setNote]                 = useState('');
  const [proofFile, setProofFile]       = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');

  const displayPrice = promo ? parseFloat(promo.final_amount) : price;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProofFile(f);
    setProofPreview(URL.createObjectURL(f));
  };

  const handleCreateRequest = async () => {
    setSubmitting(true);
    setError('');
    try {
      const body: Record<string, any> = { plan: plan.id };
      if (promo?.code)  body.promo_code            = promo.code;
      if (txRef.trim()) body.transaction_reference = txRef.trim();
      if (note.trim())  body.payment_note          = note.trim();

      const data = await post<{ id: number; payment_instructions: any; final_amount: string; amount: string }>(
        '/api/v1/subscription/payments/', body,
      );
      setPaymentId(data.id);
      setInstructions(data.payment_instructions);
      if (isFree) { onSuccess(); } else { setStep('instructions'); }
    } catch (e: any) {
      setError(e.message || 'Failed to create payment request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !paymentId) return;
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('proof_image', proofFile);
      if (txRef.trim()) fd.append('transaction_reference', txRef.trim());
      if (note.trim())  fd.append('payment_note', note.trim());
      await postForm(`/api/v1/subscription/payments/${paymentId}/upload_proof/`, fd);
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Failed to upload proof.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div className="fixed z-50 rounded-3xl overflow-y-auto w-full max-w-md bg-[#fffdf8]"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', maxHeight: '90vh',
          border: '1px solid rgba(184,147,106,0.3)', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-xl" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>
                {step === 'instructions' ? 'Payment Instructions' : step === 'upload' ? 'Upload Proof' : 'Activate Plan'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{plan.name} · {durationLabel(plan.duration_days)}</p>
            </div>
            <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
          </div>

          {/* Plan pill */}
          <div className="rounded-2xl p-4 mb-5" style={{ background: '#f8f4f0', border: '1px solid rgba(184,147,106,0.25)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm" style={{ color: '#513012' }}>{plan.name}</p>
                {promo?.code && <p className="text-xs font-semibold mt-0.5" style={{ color: '#16a34a' }}>🎉 {promo.code}</p>}
              </div>
              <div className="text-right">
                <p className="font-bold text-xl" style={{ color: '#513012' }}>
                  {isFree ? 'Free' : `Rs. ${displayPrice.toLocaleString()}`}
                </p>
                {promo && parseFloat(promo.discount_amount) > 0 && (
                  <p className="text-xs text-gray-400 line-through">Rs. {price.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          {/* form step */}
          {step === 'form' && (
            <>
              {!isFree && (
                <div className="rounded-xl p-4 mb-5 text-xs space-y-1"
                  style={{ background: '#f0faf4', border: '1px solid rgba(34,197,94,0.2)', color: '#16a34a' }}>
                  <p className="font-bold">📞 How it works:</p>
                  <p>1. Click below → get our payment details</p>
                  <p>2. Pay via eSewa / bank / cash</p>
                  <p>3. Upload your payment screenshot</p>
                  <p>4. Our team verifies → plan activates</p>
                </div>
              )}
              <PromoInput planId={plan.id} onApply={setPromo} onClear={() => setPromo(null)} />
              {!isFree && (
                <div className="mb-4">
                  <label className="text-xs font-semibold mb-1 block" style={{ color: '#9a7458' }}>Transaction Reference (optional)</label>
                  <input type="text" value={txRef} onChange={(e) => setTxRef(e.target.value)}
                    placeholder="eSewa TXN ID / Bank ref"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: '#fdf6ec', border: '1px solid rgba(184,147,106,0.35)', color: '#1e0f02' }} />
                </div>
              )}
              {error && <p className="mb-3 text-sm text-center text-red-600">{error}</p>}
              <button onClick={handleCreateRequest} disabled={submitting}
                className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
                style={{ background: submitting ? '#b8936a' : '#513012', color: '#fdf6ec' }}>
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Creating…' : isFree ? '✅ Activate Free Trial' : 'Get Payment Details →'}
              </button>
            </>
          )}

          {/* instructions step */}
          {step === 'instructions' && (
            <>
              <div className="rounded-xl p-4 mb-5 text-sm space-y-2"
                style={{ background: '#f0fdf4', border: '1px solid rgba(34,197,94,0.25)', color: '#166534' }}>
                <p className="font-bold">💳 Payment Details</p>
                {typeof instructions === 'string'
                  ? <p>{instructions}</p>
                  : <>
                      {instructions?.message && <p>{instructions.message}</p>}
                      <div className="text-xs space-y-1 mt-1">
                        {instructions?.plan   && <p>Plan: <strong>{instructions.plan}</strong></p>}
                        {instructions?.amount && <p>Amount: <strong>Rs. {parseFloat(instructions.amount).toLocaleString()} NPR</strong></p>}
                        {instructions?.restaurant_name && <p>Restaurant: <strong>{instructions.restaurant_name}</strong></p>}
                      </div>
                    </>
                }
              </div>
              <div className="rounded-xl p-3 mb-5 text-xs"
                style={{ background: '#fef3e2', border: '1px solid rgba(180,83,9,0.2)', color: '#b45309' }}>
                Payment request <strong>#{paymentId}</strong> created. Pay the amount, then upload screenshot.
              </div>
              {error && <p className="mb-3 text-sm text-center text-red-600">{error}</p>}
              <button onClick={() => setStep('upload')}
                className="w-full py-4 rounded-2xl font-bold text-base"
                style={{ background: '#513012', color: '#fdf6ec' }}>
                I've Paid — Upload Screenshot →
              </button>
            </>
          )}

          {/* upload step */}
          {step === 'upload' && (
            <>
              <div className="mb-4">
                <label className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color: '#9a7458' }}>
                  Payment Screenshot <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <label className="flex flex-col items-center justify-center w-full rounded-xl cursor-pointer"
                  style={{ border: `2px dashed ${proofFile ? '#16a34a' : 'rgba(184,147,106,0.4)'}`,
                    background: proofFile ? '#f0faf4' : '#fdf6ec', minHeight: 96 }}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  {proofPreview
                    ? <img src={proofPreview} alt="proof" className="rounded-lg object-cover" style={{ maxHeight: 140, maxWidth: '100%' }} />
                    : <div className="flex flex-col items-center py-4 gap-2">
                        <Upload size={20} style={{ color: '#b8936a' }} />
                        <p className="text-xs text-gray-400">Click to upload screenshot</p>
                        <p className="text-xs text-gray-300">JPG, PNG, WEBP — max 5MB</p>
                      </div>
                  }
                </label>
                {proofFile && <p className="text-xs mt-1" style={{ color: '#16a34a' }}>✓ {proofFile.name}</p>}
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#9a7458' }}>Transaction Reference</label>
                <input type="text" value={txRef} onChange={(e) => setTxRef(e.target.value)}
                  placeholder="Bank ref / eSewa TXN ID"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#fdf6ec', border: '1px solid rgba(184,147,106,0.35)', color: '#1e0f02' }} />
              </div>
              <div className="mb-5">
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#9a7458' }}>Note (optional)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Any info for our team…" rows={2}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: '#fdf6ec', border: '1px solid rgba(184,147,106,0.35)', color: '#1e0f02' }} />
              </div>
              {error && <p className="mb-3 text-sm text-center text-red-600">{error}</p>}
              <button onClick={handleUploadProof} disabled={submitting || !proofFile}
                className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
                style={{ background: submitting || !proofFile ? '#b8936a' : '#513012', color: '#fdf6ec',
                  opacity: !proofFile ? 0.75 : 1, cursor: !proofFile ? 'not-allowed' : 'pointer' }}>
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Uploading…' : 'Submit Payment Proof ✓'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  const [currentSub,    setCurrentSub]    = useState<CurrentSub | null>(null);
  const [plans,         setPlans]         = useState<Plan[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedPlan,  setSelectedPlan]  = useState<Plan | null>(null);
  const [showSuccess,   setShowSuccess]   = useState(false);
  const [successPlan,   setSuccessPlan]   = useState<Plan | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subData, plansData] = await Promise.all([
        get<CurrentSub>('/api/v1/subscription/subscriptions/current/'),
        get<{ results: Plan[] }>('/api/v1/subscription/plans/?is_active=true&ordering=ordering'),
      ]);
      setCurrentSub(subData);
      setPlans(plansData.results ?? []);

      // Also load payment status to show pending/approved/rejected banner
      try {
        const statusData = await get<{ results: PaymentStatus[] } | PaymentStatus[]>(
          '/api/v1/subscription/payments/status/',
        );
        const list = Array.isArray(statusData) ? statusData : (statusData as any).results ?? [];
        setPaymentStatus(list);
      } catch {}
    } catch (e) {
      console.error('Failed to load subscription data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const hasPendingPayment  = paymentStatus.some(p => p.status === 'pending');
  const hasRejectedPayment = paymentStatus.some(p => p.status === 'rejected');
  const latestPayment      = paymentStatus[0] ?? null;

  // Show plans if: no payment, or last payment was rejected (can retry), or active sub (can renew)
  const canChoosePlan = !hasPendingPayment;

  const isRenewal = !!(currentSub?.current_subscription || currentSub?.latest_subscription);

  if (showSuccess && successPlan) {
    const isFree = parseFloat(successPlan.price) === 0 || successPlan.is_trial;
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6 max-w-lg mx-auto">
        <div className="text-6xl mb-5">🎉</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>
          {isFree ? 'Trial Activated!' : 'Payment Submitted!'}
        </h2>
        <p className="text-gray-500 text-sm mb-6 max-w-sm">
          {isFree
            ? 'Your free trial is now active. Enjoy full access!'
            : 'Our team will verify your payment screenshot and activate your plan shortly. You will see the status update here.'}
        </p>
        {!isFree && (
          <div className="rounded-xl p-4 mb-6 text-sm text-left w-full"
            style={{ background: '#fef3e2', border: '1px solid rgba(180,83,9,0.2)', color: '#92400e' }}>
            <p className="font-bold mb-1">What happens next?</p>
            <p>1. Our team reviews your payment screenshot</p>
            <p>2. If valid, your plan activates within a few hours</p>
            <p>3. If rejected, you'll see the reason here and can resubmit</p>
          </div>
        )}
        <button onClick={() => { setShowSuccess(false); setSuccessPlan(null); loadData(); }}
          className="px-8 py-3 rounded-2xl font-bold text-sm"
          style={{ background: '#513012', color: '#fff' }}>
          View Subscription Status
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>
          Subscription & Billing
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage your plan and payments</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin" style={{ color: '#513012' }} />
        </div>
      ) : (
        <>
          {/* Payment status banner — shows pending/approved/rejected with message */}
          {latestPayment && (
            <PaymentStatusBanner statuses={paymentStatus} onRefresh={loadData} />
          )}

          {/* Active subscription card */}
          {currentSub && <CurrentSubCard data={currentSub} onRefresh={loadData} />}

          {/* No active sub and no pending payment */}
          {!currentSub?.current_subscription && !hasPendingPayment && (
            <div className="rounded-xl p-4 mb-6 text-sm flex items-start gap-3"
              style={{ background: '#fef2f2', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626' }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">No Active Subscription</p>
                <p className="text-xs mt-0.5 opacity-80">{currentSub?.message ?? 'Choose a plan below to get started.'}</p>
              </div>
            </div>
          )}

          {/* Plans section */}
          <div className="mb-5">
            <h2 className="font-bold text-lg" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>
              {isRenewal ? 'Renew or Change Plan' : 'Choose a Plan'}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">Select a plan to get started</p>
          </div>

          {/* Pending = block plan selection */}
          {hasPendingPayment ? (
            <div className="rounded-2xl p-8 text-center"
              style={{ background: '#fef3e2', border: '1px solid rgba(180,83,9,0.2)' }}>
              <p className="text-4xl mb-3">⏳</p>
              <p className="font-bold text-lg" style={{ color: '#b45309' }}>Payment Under Review</p>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                You cannot choose another plan while a payment is pending verification.
              </p>
              <button onClick={loadData}
                className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm border border-orange-200 hover:bg-orange-50"
                style={{ color: '#b45309' }}>
                <RefreshCw size={13} /> Check Status
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
              {plans.map((plan) => {
                const accent   = planAccent(plan);
                const price    = parseFloat(plan.price);
                const isFree   = price === 0 || plan.is_trial;
                const features = featuresArray(plan.features);

                return (
                  <div key={plan.id}
                    className="rounded-2xl flex flex-col overflow-hidden transition-all hover:-translate-y-0.5"
                    style={{ border: `2px solid ${accent}33`, background: '#fff', boxShadow: `0 4px 20px ${accent}12` }}>
                    <div className="p-5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: `${accent}15`, color: accent }}>
                        {planIcon(plan)}
                      </div>
                      <p className="font-bold text-gray-800 mb-0.5">{plan.name}</p>
                      <p className="text-xs text-gray-400 mb-3">{plan.description}</p>
                      <div className="flex items-end gap-1.5 mb-1">
                        {isFree
                          ? <span className="text-3xl font-bold" style={{ color: accent }}>Free</span>
                          : <span className="text-3xl font-bold" style={{ color: '#1e0f02' }}>Rs. {price.toLocaleString()}</span>
                        }
                      </div>
                      <p className="text-xs text-gray-400 mb-4">
                        {isFree ? 'No payment needed' : durationLabel(plan.duration_days)}
                      </p>
                      <button onClick={() => setSelectedPlan(plan)}
                        className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                        style={{ background: isFree ? '#f0faf4' : accent, color: isFree ? '#16a34a' : '#fff',
                          border: isFree ? '1.5px solid #16a34a' : 'none' }}>
                        {isRenewal ? 'Renew with this Plan' : isFree ? 'Activate Free Trial' : `Get ${plan.name}`}
                        <ArrowRight size={12} />
                      </button>
                    </div>
                    {features.length > 0 && (
                      <>
                        <div style={{ borderTop: '1px dashed #e5e7eb', margin: '0 16px' }} />
                        <div className="p-5 pt-3 flex-1">
                          <ul className="space-y-1.5">
                            {features.slice(0, 5).map((f) => (
                              <li key={f} className="flex items-start gap-1.5 text-xs text-gray-500">
                                <Check size={11} className="mt-0.5 shrink-0" style={{ color: accent }} /> {f}
                              </li>
                            ))}
                            {features.length > 5 && <li className="text-xs text-gray-400">+{features.length - 5} more…</li>}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectedPlan && (
            <PaymentModal
              plan={selectedPlan}
              onClose={() => setSelectedPlan(null)}
              onSuccess={() => {
                setSuccessPlan(selectedPlan);
                setSelectedPlan(null);
                setShowSuccess(true);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}