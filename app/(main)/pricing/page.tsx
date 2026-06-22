'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Crown, Gift, Tag, ArrowRight, X, Loader2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { plansApi, promosApi, Plan, PromoValidateResult } from '@/lib/subscription-api';

function planIcon(plan: Plan) {
  if (plan.is_trial) return <Gift size={22} />;
  const p = parseFloat(plan.price);
  if (p < 2000) return <Zap size={22} />;
  return <Crown size={22} />;
}

function planAccent(plan: Plan) {
  if (plan.is_trial) return '#16a34a';
  const p = parseFloat(plan.price);
  if (p < 2000) return '#1d4ed8';
  return '#7e22ce';
}

function durationLabel(days: number) {
  if (days <= 31) return '1 Month';
  if (days <= 93) return '3 Months';
  if (days <= 186) return '6 Months';
  if (days <= 370) return '1 Year';
  return `${days} Days`;
}

function PromoInput({
  plans,
  selectedPlanId,
  onApply,
}: {
  plans: Plan[];
  selectedPlanId: number | null;
  onApply: (result: PromoValidateResult & { code: string }) => void;
}) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [message, setMessage] = useState('');

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setStatus('loading');
    setMessage('');
    try {
      const planId = selectedPlanId ?? plans.find((p) => p.is_active)?.id ?? 0;
      const result = await promosApi.validate(trimmed, planId);
      if (result.valid) {
        setStatus('valid');
        const disc = parseFloat(result.discount_amount);
        setMessage(`Rs. ${disc.toLocaleString()} discount applied!`);
        onApply({ ...result, code: trimmed });
      } else {
        setStatus('invalid');
        setMessage('This promo code is not valid for the selected plan.');
      }
    } catch (e: any) {
      setStatus('invalid');
      setMessage(e.message || 'Failed to validate promo code.');
    }
  };

  return (
    <div className="max-w-md mx-auto mb-10">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setStatus('idle');
              setMessage('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Enter promo code"
            className="w-full pl-9 pr-4 py-3 rounded-xl text-sm border outline-none"
            style={{
              borderColor:
                status === 'valid' ? '#16a34a' : status === 'invalid' ? '#dc2626' : 'secondary',
              background: '#fff',
            }}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={status === 'loading'}
          className="px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
          style={{ background: '#513012', color: '#fff' }}
        >
          {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
        </button>
      </div>
      {message && (
        <p
          className="text-xs mt-2 text-center font-semibold"
          style={{ color: status === 'valid' ? '#16a34a' : '#dc2626' }}
        >
          {status === 'valid' ? '🎉 ' : '❌ '}
          {message}
        </p>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  promoResult,
  onSelect,
}: {
  plan: Plan;
  promoResult: (PromoValidateResult & { code: string }) | null;
  onSelect: (plan: Plan) => void;
}) {
  const accent = planAccent(plan);
  const price = parseFloat(plan.price);
  const finalPrice = promoResult ? parseFloat(promoResult.final_amount) : price;
  const hasDiscount = promoResult && finalPrice < price;
  const isFree = price === 0 || plan.is_trial;
  const features = plan.features
    ? String(plan.features).split('\n').filter(Boolean)
    : [];

  return (
    <div
      className="relative rounded-3xl flex flex-col overflow-hidden transition-all hover:-translate-y-1"
      style={{
        border: `2px solid ${accent}33`,
        background: '#fff',
        boxShadow: `0 8px 32px ${accent}18`,
      }}
    >
      <div className="p-6 pb-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: `${accent}15`, color: accent }}
        >
          {planIcon(plan)}
        </div>
        <h3
          className="font-bold text-xl mb-1"
          style={{ color: 'secondary', fontFamily: 'Georgia, serif' }}
        >
          {plan.name}
        </h3>
        <p className="text-sm text-secondary mb-4">{plan.description}</p>

        {/* Price */}
        <div className="flex items-end gap-2 mb-1">
          {isFree ? (
            <span className="text-4xl font-bold" style={{ color: accent }}>
              Free
            </span>
          ) : (
            <>
              <span className="text-4xl font-bold" style={{ color: 'secondary' }}>
                Rs. {(hasDiscount ? finalPrice : price).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg text-secondary line-through mb-1">
                  Rs. {price.toLocaleString()}
                </span>
              )}
            </>
          )}
        </div>
        <p className="text-xs text-secondary mb-5">
          {isFree ? 'No credit card required' : `for ${durationLabel(plan.duration_days)}`}
          {hasDiscount && (
            <span className="ml-2 font-bold" style={{ color: accent }}>
              Promo applied ✓
            </span>
          )}
        </p>

        <button
          onClick={() => onSelect(plan)}
          className="w-full py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
          style={{
            background: isFree ? '#f0faf4' : accent,
            color: isFree ? '#16a34a' : '#fff',
            border: isFree ? '1.5px solid #16a34a' : 'none',
          }}
        >
          {isFree ? 'Start Free Trial' : `Get ${plan.name}`}
          <ArrowRight size={14} className="inline ml-2" />
        </button>
      </div>

      {features.length > 0 && (
        <>
          <div className="mx-6" style={{ borderTop: '1px dashed secondary' }} />
          <div className="p-6 pt-4 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-secondary">
              What&apos;s included
            </p>
            <ul className="space-y-2.5">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check size={14} className="mt-0.5 shrink-0" style={{ color: accent }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function RegisterModal({
  plan,
  onClose,
}: {
  plan: Plan;
  onClose: () => void;
}) {
  const router = useRouter();
  const accent = planAccent(plan);
  const isFree = parseFloat(plan.price) === 0 || plan.is_trial;

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className="fixed z-50 rounded-3xl w-full max-w-sm text-center"
        style={{
          background: '#fffdf8',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(184,147,106,0.3)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        }}
      >
        <div className="p-8 relative">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4"
            style={{ color: '#9a7458' }}
          >
            <X size={18} />
          </button>

          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: `${accent}15`, color: accent }}
          >
            {planIcon(plan)}
          </div>

          {/* Text */}
          <h2
            className="font-bold text-xl mb-2"
            style={{ color: 'secondary', fontFamily: 'Georgia, serif' }}
          >
            Register First!
          </h2>
          <p className="text-sm text-secondary mb-2">
            You selected{' '}
            <span className="font-semibold" style={{ color: '#513012' }}>
              {plan.name}
            </span>
          </p>
          <p className="text-sm text-secondary mb-7">
            Create your restaurant account first. You can choose and activate this plan
            from your dashboard after registration.
          </p>

          {/* Buttons */}
          <button
            onClick={() => router.push('/register-restaurant')}
            className="w-full py-3.5 rounded-2xl font-bold text-sm mb-3 flex items-center justify-center gap-2"
            style={{ background: '#513012', color: '#fff' }}
          >
            {isFree ? 'Register & Start Free Trial' : 'Register Your Restaurant'}
            <ArrowRight size={14} />
          </button>

          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 rounded-2xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </>
  );
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promoResult, setPromoResult] = useState<(PromoValidateResult & { code: string }) | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    plansApi
      .list('is_active=true&ordering=ordering')
      .then((res) => setPlans(res.results))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="min-h-screen" style={{ background: '#faf8f5' }}>
        <div className="text-center px-6 pt-16 pb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6"
            style={{
              background: '#f0faf4',
              color: '#16a34a',
              border: '1px solid rgba(34,197,94,0.3)',
            }}
          >
            <Gift size={13} /> Start free — no credit card required
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: 'secondary', fontFamily: 'Georgia, serif', lineHeight: 1.15 }}
          >
            Simple, Honest Pricing
          </h1>
          <p className="text-secondary max-w-xl mx-auto text-lg">
            Start free for 1 month. Upgrade when you&apos;re ready. Cancel anytime.
          </p>
        </div>

        {/* Promo code input */}
        {!loading && plans.length > 0 && (
          <div className="px-6">
            <PromoInput
              plans={plans}
              selectedPlanId={selectedPlan?.id ?? null}
              onApply={setPromoResult}
            />
            {promoResult?.valid && (
              <p className="text-center text-sm font-semibold mb-6" style={{ color: '#16a34a' }}>
                ✅ Promo code <strong>{promoResult.code}</strong> applied!
              </p>
            )}
          </div>
        )}

        {/* Plans grid */}
        <div className="px-6 pb-20 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin" style={{ color: '#513012' }} />
            </div>
          ) : error ? (
            <div
              className="p-4 rounded-xl text-center text-sm"
              style={{ background: '#fef2f2', color: '#dc2626' }}
            >
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  promoResult={promoResult}
                  onSelect={(p) => setSelectedPlan(p)}
                />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-sm text-secondary">
              All plans include QR menu, online orders, and customer dashboard.{' '}
              <a href="tel:+977-98XXXXXXXX" className="underline" style={{ color: '#513012' }}>
                Call us
              </a>{' '}
              with any questions.
            </p>
          </div>
        </div>

        {selectedPlan && (
          <RegisterModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
          />
        )}
      </div>
      <Footer />
    </>
  );
}

