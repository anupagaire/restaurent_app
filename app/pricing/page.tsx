'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Crown, Gift, Tag, ArrowRight, X } from 'lucide-react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Plan {
  id: 'free' | 'basic' | 'pro';
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  durationMonths: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
  accent: string;
  popular?: boolean;
}

// ─── Promo Codes ──────────────────────────────────────────────────────────────
// TODO: Replace with API call → GET /api/v1/subscriptions/validate-promo/?code=XXX

const PROMO_CODES: Record<string, { discount: number; type: 'percent' | 'fixed'; plans: string[]; freeMonths?: number }> = {
  'WELCOME':   { discount: 100, type: 'percent', plans: ['free'],          freeMonths: 1 },
  'SAVE20':    { discount: 20,  type: 'percent', plans: ['basic', 'pro']                 },
  'SAVE30':    { discount: 30,  type: 'percent', plans: ['pro']                          },
  'FLAT500':   { discount: 500, type: 'fixed',   plans: ['basic', 'pro']                 },
};

// ─── Plans Config ─────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    duration: '1 Month',
    durationMonths: 1,
    description: 'Try everything free for 1 month. No card required.',
    icon: <Gift size={22} />,
    accent: '#16a34a',
    features: [
      'QR menu for 1 restaurant',
      'Online orders (delivery)',
      'Table orders via QR',
      'Customer dashboard',
      'Up to 50 orders/month',
      'Email support',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 999,
    duration: '1 Month',
    durationMonths: 1,
    description: 'Perfect for small restaurants getting started.',
    icon: <Zap size={22} />,
    accent: '#1d4ed8',
    popular: true,
    features: [
      'Everything in Free',
      'Unlimited orders',
      'Multiple menu categories',
      'Order history & reports',
      'Staff management',
      'Priority support',
      'Custom restaurant branding',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 8999,
    duration: '1 Year',
    durationMonths: 12,
    description: 'Best value for growing restaurants. Full power for a year.',
    icon: <Crown size={22} />,
    accent: '#7e22ce',
    features: [
      'Everything in Basic',
      'Multiple restaurants',
      'Advanced analytics',
      'Custom domain support',
      'API access',
      'Dedicated account manager',
      'Invoice & billing management',
      '2 months free vs monthly',
    ],
  },
];

// ─── Promo Input ──────────────────────────────────────────────────────────────

function PromoInput({ onApply }: {
  onApply: (code: string, discount: number, type: 'percent' | 'fixed', plans: string[]) => void;
}) {
  const [code,    setCode]    = useState('');
  const [status,  setStatus]  = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [message, setMessage] = useState('');

  const handleApply = () => {
    const upper = code.trim().toUpperCase();
    const promo = PROMO_CODES[upper];
    if (promo) {
      setStatus('valid');
      setMessage(
        promo.type === 'percent'
          ? `${promo.discount}% off applied!`
          : `Rs. ${promo.discount} off applied!`,
      );
      onApply(upper, promo.discount, promo.type, promo.plans);
    } else {
      setStatus('invalid');
      setMessage('Invalid promo code. Try again.');
    }
  };

  return (
  
    <div className="max-w-md mx-auto mb-10">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus('idle'); }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Enter promo code"
            className="w-full pl-9 pr-4 py-3 rounded-xl text-sm border outline-none"
            style={{
              borderColor: status === 'valid' ? '#16a34a' : status === 'invalid' ? '#dc2626' : '#e5e7eb',
              background: '#fff',
            }}
          />
        </div>
        <button
          onClick={handleApply}
          className="px-5 py-3 rounded-xl text-sm font-bold"
          style={{ background: '#513012', color: '#fff' }}
        >
          Apply
        </button>
      </div>
      {message && (
        <p
          className="text-xs mt-2 text-center font-semibold"
          style={{ color: status === 'valid' ? '#16a34a' : '#dc2626' }}
        >
          {status === 'valid' ? '🎉 ' : '❌ '}{message}
        </p>
      )}
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan, discountedPrice, promoApplied, promoPlans, onSelect,
}: {
  plan: Plan;
  discountedPrice: number | null;
  promoApplied: boolean;
  promoPlans: string[];
  onSelect: (plan: Plan) => void;
}) {
  const hasDiscount = promoApplied && promoPlans.includes(plan.id) && discountedPrice !== null;
  const displayPrice = hasDiscount ? discountedPrice! : plan.price;
  const isFree = displayPrice === 0;

  return (
    <div
      className="relative rounded-3xl flex flex-col overflow-hidden transition-all hover:-translate-y-1"
      style={{
        border: plan.popular ? `2px solid ${plan.accent}` : '1px solid #e5e7eb',
        background: '#fff',
        boxShadow: plan.popular ? `0 8px 32px ${plan.accent}22` : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div
          className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: plan.accent, color: '#fff' }}
        >
          Most Popular
        </div>
      )}

      {/* Header */}
      <div className="p-6 pb-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: `${plan.accent}15`, color: plan.accent }}
        >
          {plan.icon}
        </div>

        <h3 className="font-bold text-xl mb-1" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>
          {plan.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

        {/* Price */}
        <div className="flex items-end gap-2 mb-1">
          {isFree ? (
            <span className="text-4xl font-bold" style={{ color: plan.accent }}>Free</span>
          ) : (
            <>
              <span className="text-4xl font-bold" style={{ color: '#1e0f02' }}>
                Rs. {displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through mb-1">
                  Rs. {plan.price.toLocaleString()}
                </span>
              )}
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-5">
          {isFree ? 'No credit card required' : `for ${plan.duration}`}
          {hasDiscount && <span className="ml-2 font-bold" style={{ color: plan.accent }}>Promo applied ✓</span>}
        </p>

        <button
          onClick={() => onSelect(plan)}
          className="w-full py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
          style={{
            background: plan.id === 'free' ? '#f0faf4' : plan.accent,
            color: plan.id === 'free' ? '#16a34a' : '#fff',
            border: plan.id === 'free' ? '1.5px solid #16a34a' : 'none',
          }}
        >
          {plan.id === 'free' ? 'Start Free Trial' : `Get ${plan.name}`}
          <ArrowRight size={14} className="inline ml-2" />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-6" style={{ borderTop: '1px dashed #e5e7eb' }} />

      {/* Features */}
      <div className="p-6 pt-4 flex-1">
        <p className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-400">What's included</p>
        <ul className="space-y-2.5">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
              <Check size={14} className="mt-0.5 shrink-0" style={{ color: plan.accent }} />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Payment Request Modal ────────────────────────────────────────────────────

function PaymentModal({
  plan, finalPrice, promoCode, onClose, onSubmit,
}: {
  plan: Plan;
  finalPrice: number;
  promoCode: string;
  onClose: () => void;
  onSubmit: (details: { name: string; phone: string; email: string; restaurantName: string }) => void;
}) {
  const [name,           setName]           = useState('');
  const [phone,          setPhone]          = useState('');
  const [email,          setEmail]          = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [submitting,     setSubmitting]     = useState(false);
  const [error,          setError]          = useState('');

  const canSubmit = name.trim() && phone.trim() && email.trim() && restaurantName.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ name, phone, email, restaurantName });
    } catch (e: any) {
      setError(e.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div
        className="fixed z-50 rounded-3xl overflow-y-auto w-full max-w-md"
        style={{
          background: '#fffdf8',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: '90vh',
          border: '1px solid rgba(184,147,106,0.3)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-xl" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>
                Complete Your Order
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">We'll call you to confirm payment</p>
            </div>
            <button onClick={onClose} style={{ color: '#9a7458' }}><X size={20} /></button>
          </div>

          {/* Plan summary */}
          <div
            className="rounded-2xl p-4 mb-6"
            style={{ background: '#f8f4f0', border: '1px solid rgba(184,147,106,0.25)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm" style={{ color: '#513012' }}>{plan.name} Plan</p>
                <p className="text-xs text-gray-500">{plan.duration}</p>
                {promoCode && (
                  <p className="text-xs font-semibold mt-1" style={{ color: '#16a34a' }}>
                    🎉 Promo: {promoCode}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-xl" style={{ color: '#513012' }}>
                  {finalPrice === 0 ? 'Free' : `Rs. ${finalPrice.toLocaleString()}`}
                </p>
                {finalPrice === 0 && (
                  <p className="text-xs text-gray-400">No payment needed</p>
                )}
              </div>
            </div>
          </div>

          {/* How it works */}
          <div
            className="rounded-xl p-4 mb-6 text-xs space-y-2"
            style={{ background: '#f0faf4', border: '1px solid rgba(34,197,94,0.2)', color: '#16a34a' }}
          >
            <p className="font-bold">📞 How payment works:</p>
            <p>1. Fill your details below and submit</p>
            <p>2. Our team will call you to confirm</p>
            <p>3. Pay via eSewa / bank transfer / cash</p>
            <p>4. We activate your plan immediately after</p>
          </div>

          {/* Form */}
          <div className="space-y-3">
            {[
              { label: 'Your Name',       value: name,           set: setName,           type: 'text',  placeholder: 'Full name',          required: true  },
              { label: 'Phone Number',    value: phone,          set: setPhone,          type: 'tel',   placeholder: '98XXXXXXXX',         required: true  },
              { label: 'Email Address',   value: email,          set: setEmail,          type: 'email', placeholder: 'you@email.com',      required: true  },
              { label: 'Restaurant Name', value: restaurantName, set: setRestaurantName, type: 'text',  placeholder: 'Your restaurant name', required: true },
            ].map(({ label, value, set, type, placeholder, required }) => (
              <div key={label}>
                <label className="text-xs mb-1 flex items-center gap-1" style={{ color: '#9a7458' }}>
                  {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
                </label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => { set(e.target.value); setError(''); }}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: '#fdf6ec',
                    border: `1px solid ${value.trim() ? 'rgba(34,197,94,0.4)' : 'rgba(184,147,106,0.35)'}`,
                    color: '#1e0f02',
                  }}
                />
              </div>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-center" style={{ color: '#dc2626' }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="mt-6 w-full py-4 rounded-2xl font-bold text-base"
            style={{
              background: submitting || !canSubmit ? '#b8936a' : '#513012',
              color: '#fdf6ec',
              border: 'none',
              cursor: submitting || !canSubmit ? 'not-allowed' : 'pointer',
              opacity: !canSubmit ? 0.75 : 1,
            }}
          >
            {submitting ? 'Submitting…' : finalPrice === 0 ? 'Activate Free Trial' : 'Request Plan — We\'ll Call You'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ plan, phone, onDone }: { plan: Plan; phone: string; onDone: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: '#fdf6ec' }}>
      <div className="text-7xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>
        {plan.id === 'free' ? 'Free Trial Activated!' : 'Request Submitted!'}
      </h1>
      <p className="text-gray-500 mb-6 max-w-sm">
        {plan.id === 'free'
          ? 'Your free trial has been activated. Login to get started!'
          : `We'll call you at ${phone} within 24 hours to confirm your ${plan.name} plan payment.`}
      </p>
      <div
        className="rounded-2xl p-5 mb-8 text-left max-w-sm w-full"
        style={{ background: '#fff', border: '1px solid rgba(184,147,106,0.25)' }}
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#b8936a' }}>Order Summary</p>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Plan</span>
          <span className="font-semibold" style={{ color: '#1e0f02' }}>{plan.name}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Duration</span>
          <span className="font-semibold" style={{ color: '#1e0f02' }}>{plan.duration}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className="font-semibold" style={{ color: '#16a34a' }}>
            {plan.id === 'free' ? '✅ Active' : '⏳ Pending confirmation'}
          </span>
        </div>
      </div>
      <button
        onClick={onDone}
        className="px-8 py-3 rounded-2xl font-bold"
        style={{ background: '#513012', color: '#fdf6ec', border: 'none', cursor: 'pointer' }}
      >
        {plan.id === 'free' ? 'Wait for getting your login credentials then Go to Login' : 'Back to Home'}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const router = useRouter();

  const [promoCode,       setPromoCode]       = useState('');
  const [promoDiscount,   setPromoDiscount]   = useState(0);
  const [promoType,       setPromoType]       = useState<'percent' | 'fixed'>('percent');
  const [promoPlans,      setPromoPlans]      = useState<string[]>([]);
  const [promoApplied,    setPromoApplied]    = useState(false);
  const [selectedPlan,    setSelectedPlan]    = useState<Plan | null>(null);
  const [showModal,       setShowModal]       = useState(false);
  const [showSuccess,     setShowSuccess]     = useState(false);
  const [submittedPhone,  setSubmittedPhone]  = useState('');

  const handlePromoApply = (code: string, discount: number, type: 'percent' | 'fixed', plans: string[]) => {
    setPromoCode(code);
    setPromoDiscount(discount);
    setPromoType(type);
    setPromoPlans(plans);
    setPromoApplied(true);
  };

  const getDiscountedPrice = (plan: Plan): number | null => {
    if (!promoApplied || !promoPlans.includes(plan.id)) return null;
    if (promoType === 'percent') {
      return Math.max(0, Math.round(plan.price * (1 - promoDiscount / 100)));
    }
    return Math.max(0, plan.price - promoDiscount);
  };

  const getFinalPrice = (plan: Plan): number => {
    const discounted = getDiscountedPrice(plan);
    return discounted !== null ? discounted : plan.price;
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleSubmitPayment = async (details: {
    name: string; phone: string; email: string; restaurantName: string;
  }) => {
    // TODO: Replace with real API call
    // POST /api/v1/subscriptions/request/
    // Body: { plan: selectedPlan.id, promo_code: promoCode, final_price: getFinalPrice(selectedPlan), ...details }

    const payload = {
      plan:            selectedPlan!.id,
      plan_name:       selectedPlan!.name,
      duration_months: selectedPlan!.durationMonths,
      promo_code:      promoCode || null,
      original_price:  selectedPlan!.price,
      final_price:     getFinalPrice(selectedPlan!),
      customer_name:   details.name,
      customer_phone:  details.phone,
      customer_email:  details.email,
      restaurant_name: details.restaurantName,
      status:          selectedPlan!.id === 'free' ? 'active' : 'pending',
    };

    console.log('📦 Subscription request payload:', payload);

    // Simulate API call — replace with real fetch when API is ready
    await new Promise(r => setTimeout(r, 1000));

    setSubmittedPhone(details.phone);
    setShowModal(false);
    setShowSuccess(true);
  };

  if (showSuccess && selectedPlan) {
    return (
      <SuccessScreen
        plan={selectedPlan}
        phone={submittedPhone}
        onDone={() => {
          if (selectedPlan.id === 'free') router.push('/login');
          else router.push('/');
        }}
      />
    );
  }

  return (
    <>
        <Navbar/>

    <div className="min-h-screen" style={{ background: '#faf8f5' }}>

      {/* Hero */}
      <div className="text-center px-6 pt-16 pb-10">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6"
          style={{ background: '#f0faf4', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <Gift size={13} /> Start free — no credit card required
        </div>
        <h1
          className="text-4xl sm:text-5xl font-bold mb-4"
          style={{ color: '#1e0f02', fontFamily: 'Georgia, serif', lineHeight: 1.15 }}
        >
          Simple, Honest Pricing
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg">
          Start free for 1 month. Upgrade when you're ready. Cancel anytime.
        </p>
      </div>

      {/* Promo code */}
      <div className="px-6">
        <PromoInput onApply={handlePromoApply} />
        {promoApplied && (
          <p className="text-center text-sm font-semibold mb-6" style={{ color: '#16a34a' }}>
            ✅ Promo code <strong>{promoCode}</strong> applied to eligible plans!
          </p>
        )}
      </div>

      {/* Plans grid */}
      <div className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              discountedPrice={getDiscountedPrice(plan)}
              promoApplied={promoApplied}
              promoPlans={promoPlans}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>

        {/* FAQ note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            All plans include QR menu, online orders, and customer dashboard.
            Have questions? <a href="tel:+977-98XXXXXXXX" className="underline" style={{ color: '#513012' }}>Call us</a>
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          finalPrice={getFinalPrice(selectedPlan)}
          promoCode={promoCode}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitPayment}
        />
      )}
    </div>
    <Footer />
   </>
  );
}