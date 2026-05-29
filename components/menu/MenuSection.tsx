'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed, ShoppingCart, X, Plus, Minus,
  Truck, CheckCircle2, LogIn, Star, MessageSquare,
  Send, Loader2,
} from 'lucide-react';
import Image from 'next/image';

// ── Import the new review section ──────────────────────────────────────────
import MenuReviewSection from './MenuReviewSection';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const AUTH_KEY = 'qr_menu_auth';


interface MenuItem {
  id: string | number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category?: string;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface AuthData {
  access: string;
  refresh: string;
  email: string;
}

interface MenuReviewSummary {
  avgRating: number | null;
  count: number;
}

interface Props {
  menuItems: MenuItem[];
  restaurantId: number;
  acceptsOnlineOrders?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getAuth(): AuthData | null {
  try {
    const s = localStorage.getItem(AUTH_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}
function saveAuth(d: AuthData) { localStorage.setItem(AUTH_KEY, JSON.stringify(d)); }
function clearAuth() { localStorage.removeItem(AUTH_KEY); }

// ─────────────────────────────────────────────────────────────────────────────
// API — ORDERS
// ─────────────────────────────────────────────────────────────────────────────
async function apiRegister(params: {
  email: string; password: string; name: string;
  phone: string | null; restaurantId: number;
}) {
  const res = await fetch(`${BASE_URL}/api/v1/user/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email.trim(),
      password1: params.password,
      password2: params.password,
      first_name: params.name.trim() || 'Guest',
      contact_no: params.phone || null,
      role: 'customer',
      restaurant: params.restaurantId,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = `Registration failed (${res.status})`;
    try {
      const err = JSON.parse(text);
      if (err.email) msg = Array.isArray(err.email) ? err.email[0] : err.email;
      else if (err.password1) msg = Array.isArray(err.password1) ? err.password1[0] : err.password1;
      else if (err.detail) msg = err.detail;
      else msg = JSON.stringify(err).slice(0, 200);
    } catch { /* use default */ }
    throw new Error(msg);
  }
}

async function apiLogin(email: string, password: string): Promise<AuthData> {
  const res = await fetch(`${BASE_URL}/api/v1/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = `Login failed (${res.status})`;
    try {
      const err = JSON.parse(text);
      msg = err.detail || err.non_field_errors?.[0] || msg;
    } catch { /* use default */ }
    throw new Error(msg);
  }
  const data = JSON.parse(text);
  if (!data.access) throw new Error('Login response did not contain an access token.');
  return { access: data.access, refresh: data.refresh, email };
}

async function apiPlaceOrder(payload: object, accessToken: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/orders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = `Order failed (${res.status})`;
    try {
      const err = JSON.parse(text);
      if (err.detail) msg = err.detail;
      else if (err.non_field_errors) msg = err.non_field_errors[0];
      else {
        const key = Object.keys(err)[0];
        const val = err[key];
        msg = `${key}: ${Array.isArray(val) ? val[0] : val}`;
      }
    } catch { msg = text.slice(0, 200); }
    throw new Error(msg);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API — MENU REVIEW SUMMARY (for the card teaser)
// ─────────────────────────────────────────────────────────────────────────────
async function apiFetchReviewSummary(menuId: number): Promise<MenuReviewSummary> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/menu-reviews/?menu=${menuId}&page_size=200`,
      { cache: 'no-store' },
    );
    if (!res.ok) return { avgRating: null, count: 0 };
    const data = await res.json();
    const reviews = (data.results ?? []).filter(
      (r: { parent: number | null }) => r.parent === null || r.parent === undefined,
    );
    if (!reviews.length) return { avgRating: null, count: 0 };
    const avg = reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length;
    return { avgRating: avg, count: reviews.length };
  } catch {
    return { avgRating: null, count: 0 };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
function getCategoryEmoji(category?: string): string {
  const map: Record<string, string> = {
    pizza: '🍕', burger: '🍔', drink: '🥤', drinks: '🥤', coffee: '☕',
    dessert: '🍰', desserts: '🍰', soup: '🍜', salad: '🥗',
    starter: '🥗', starters: '🥗', food: '🍛', noodle: '🍜',
    sushi: '🍣', sandwich: '🥪', pasta: '🍝', bread: '🥖',
  };
  const key = (category ?? '').toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (key.includes(k)) return v;
  }
  return '🍽️';
}

// ─────────────────────────────────────────────────────────────────────────────
// MOTION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

// ─────────────────────────────────────────────────────────────────────────────
// STAR DISPLAY (read-only)
// ─────────────────────────────────────────────────────────────────────────────
function StarDisplay({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          fill={rating >= s ? '#f59e0b' : 'none'}
          color={rating >= s ? '#f59e0b' : '#d1d5db'}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ONLINE ORDER BADGE
// ─────────────────────────────────────────────────────────────────────────────
function OnlineOrderBadge() {
  return (
    <div className="flex items-center justify-center mb-8">
      <div
        className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border"
        style={{
          background: 'linear-gradient(135deg, #f0faf4 0%, #e6f7ed 100%)',
          borderColor: '#22c55e',
          boxShadow: '0 2px 12px rgba(34,197,94,0.12)',
        }}
      >
        <span className="flex items-center justify-center w-7 h-7 rounded-full" style={{ background: '#22c55e' }}>
          <Truck size={14} color="#fff" />
        </span>
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#16a34a' }}>
            We Accept Online Orders
          </p>
          <p className="text-xs" style={{ color: '#4ade80' }}>Order now · Pay on delivery</p>
        </div>
        <CheckCircle2 size={18} color="#22c55e" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CART BAR
// ─────────────────────────────────────────────────────────────────────────────
function CartBar({ cart, onOpen }: { cart: CartItem[]; onOpen: () => void }) {
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);
  if (totalItems === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pointer-events-none">
      <button
        onClick={onOpen}
        className="pointer-events-auto w-full max-w-2xl mx-auto flex items-center justify-between px-6 py-4 rounded-2xl shadow-2xl"
        style={{ background: '#513012', color: '#fdf6ec', display: 'flex' }}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
          style={{ background: '#b8936a' }}
        >
          {totalItems}
        </span>
        <span className="font-bold tracking-wide flex items-center gap-2">
          <ShoppingCart size={16} /> View Order
        </span>
        <span className="font-bold">Rs. {totalPrice.toFixed(0)}</span>
      </button>
    </div>
  );
}


function OrderDrawer({
  cart, restaurantId, auth, onClose, onUpdateQty, onSuccess, onAuthChange,
}: {
  cart: CartItem[];
  restaurantId: number;
  auth: AuthData | null;
  onClose: () => void;
  onUpdateQty: (itemId: string | number, delta: number) => void;
  onSuccess: () => void;
  onAuthChange: (a: AuthData | null) => void;
}) {
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [address, setAddress] = useState('');
  const [notes,   setNotes]   = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [step,       setStep]       = useState<'idle' | 'registering' | 'logging_in' | 'placing'>('idle');

  const isLoggedIn = !!auth;
  const totalPrice = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);

  const deliveryReady   = phone.trim().length > 0 && address.trim().length > 0;
  const registrationReady =
    email.trim().length > 0 && password.length >= 8 && password === confirmPassword;
  const canSubmit = cart.length > 0 && deliveryReady && (isLoggedIn || registrationReady);

  const handleLogout = () => { clearAuth(); onAuthChange(null); };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      let currentAuth = auth;
      if (!currentAuth) {
  if (authMode === 'register') {
    setStep('registering');
    await apiRegister({ email, password, name: name.trim() || 'Guest', phone: phone.trim() || null, restaurantId });
  }
  setStep('logging_in');
  currentAuth = await apiLogin(email, password);
  saveAuth(currentAuth);
  onAuthChange(currentAuth);
}
     
      setStep('placing');
      await apiPlaceOrder({
        restaurant:     restaurantId,
        customer_name:  name.trim() || 'Guest',
        customer_phone: phone.trim() || null,
        customer_email: currentAuth.email || null,
        notes: [
          address.trim() ? `Delivery address: ${address.trim()}` : '',
          notes.trim(),
        ].filter(Boolean).join('\n') || null,
        items: cart.map((c) => ({ menu_id: c.item.id, quantity: c.quantity })),
      }, currentAuth.access);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
      setStep('idle');
    }
  };

  const stepLabel =
    step === 'registering' ? 'Creating your account…'
    : step === 'logging_in' ? 'Logging in…'
    : step === 'placing' ? 'Placing your order…'
    : '';

  const inputStyle = (value: string, required = false): React.CSSProperties => ({
    background: '#fdf6ec',
    border: `1px solid ${value.trim() && required ? 'rgba(34,197,94,0.5)' : 'rgba(184,147,106,0.35)'}`,
    color: '#1e0f02',
  });

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(30,15,2,0.55)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-y-auto"
        style={{ background: '#fffdf8', maxHeight: '92vh' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#d4b896' }} />
        </div>
        <div className="px-5 pb-12 max-w-2xl mx-auto">
          <div className="flex items-center justify-between py-4">
            <div>
              <h2 className="font-bold text-xl" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>
                Your Order
              </h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold mt-0.5" style={{ color: '#22c55e' }}>
                <Truck size={11} /> Online Delivery
              </span>
            </div>
            <button onClick={onClose} style={{ color: '#9a7458' }}><X size={22} /></button>
          </div>

          {isLoggedIn && (
            <div
              className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-4"
              style={{ background: '#f0faf4', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} color="#22c55e" />
                <span className="text-xs font-semibold" style={{ color: '#16a34a' }}>
                  Ordering as {auth!.email}
                </span>
              </div>
              <button onClick={handleLogout} className="text-xs underline" style={{ color: '#9a7458' }}>Switch</button>
            </div>
          )}

          <hr style={{ borderColor: 'rgba(184,147,106,0.25)', marginBottom: 12 }} />

          {/* Cart Items */}
          <div className="mt-2">
            {cart.map((c) => (
              <div
                key={c.item.id}
                className="flex items-center justify-between gap-3 py-3"
                style={{ borderBottom: '1px dashed rgba(184,147,106,0.28)' }}
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: '#1e0f02' }}>{c.item.name}</p>
                  {c.item.category && <p className="text-xs" style={{ color: '#9a7458' }}>{c.item.category}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateQty(c.item.id, -1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#f0e6d3', color: '#513012', border: 'none', cursor: 'pointer' }}>
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center font-bold text-sm" style={{ color: '#1e0f02' }}>{c.quantity}</span>
                  <button onClick={() => onUpdateQty(c.item.id, 1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#513012', color: '#fdf6ec', border: 'none', cursor: 'pointer' }}>
                    <Plus size={12} />
                  </button>
                </div>
                <span className="font-bold text-sm w-16 text-right" style={{ color: '#513012' }}>
                  Rs. {(c.item.price * c.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center py-4 mt-2">
            <span className="font-bold" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>Total</span>
            <span className="font-bold text-xl" style={{ color: '#513012' }}>Rs. {totalPrice.toFixed(0)}</span>
          </div>

          <hr style={{ borderColor: 'rgba(184,147,106,0.3)', marginBottom: 20 }} />


bash



{/* ── Auth Section (Login or Register) ── */}
{!isLoggedIn && (
  <div className="mb-6 p-4 rounded-xl" style={{ background: '#fffbf5', border: '1px solid rgba(184,147,106,0.35)' }}>
    <div className="flex items-center gap-2 mb-3">
      <LogIn size={15} color="#513012" />
      <p className="text-sm font-bold" style={{ color: '#513012' }}>Sign in to order</p>
    </div>

    {/* Mode toggle */}
    <div className="flex gap-2 mb-4">
      {(['login', 'register'] as const).map((m) => (
        <button key={m} onClick={() => { setAuthMode(m); setError(''); }}
          style={{
            padding: '6px 14px', borderRadius: 20,
            border: '1px solid #513012',
            background: authMode === m ? '#513012' : 'transparent',
            color: authMode === m ? '#fdf6ec' : '#513012',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
          {m === 'login' ? 'I have an account' : 'New account'}
        </button>
      ))}
    </div>

    <div className="space-y-3">
      {authMode === 'register' && (
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={inputStyle(name)} />
      )}
      <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
        placeholder="Email *"
        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
        style={inputStyle(email, true)} />
      <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
        placeholder={authMode === 'register' ? 'Password (min 8 chars) *' : 'Password *'}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
        style={inputStyle(password, true)} />
      {authMode === 'register' && (
        <div>
          <input type="password" value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
            placeholder="Confirm password *"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              ...inputStyle(confirmPassword, true),
              ...(confirmPassword && password !== confirmPassword ? { borderColor: 'rgba(192,57,43,0.5)' } : {}),
            }} />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs mt-1" style={{ color: '#c0392b' }}>Passwords don't match</p>
          )}
        </div>
      )}
    </div>
  </div>
)}




































          {/* Registration Section */}
          {/* {!isLoggedIn && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: '#fffbf5', border: '1px solid rgba(184,147,106,0.35)' }}>
              <div className="flex items-center gap-2 mb-4">
                <LogIn size={15} color="#513012" />
                <p className="text-sm font-bold" style={{ color: '#513012' }}>Create a free account to order</p>
              </div>
              <p className="text-xs mb-4" style={{ color: '#9a7458', lineHeight: 1.6 }}>
                We'll create your account automatically so next time you don't need to fill this in again.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs mb-1 flex items-center gap-1" style={{ color: '#9a7458' }}>
                    Email <span style={{ color: '#c0392b' }}>*</span>
                  </label>
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="you@email.com" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle(email, true)} />
                </div>
                <div>
                  <label className="text-xs mb-1 flex items-center gap-1" style={{ color: '#9a7458' }}>
                    Password <span style={{ color: '#c0392b' }}>*</span>
                    <span className="text-xs" style={{ color: '#b8936a' }}>(min 8 characters)</span>
                  </label>
                  <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle(password, true)} />
                </div>
                <div>
                  <label className="text-xs mb-1 flex items-center gap-1" style={{ color: '#9a7458' }}>
                    Confirm Password <span style={{ color: '#c0392b' }}>*</span>
                    {password && confirmPassword && password !== confirmPassword && (
                      <span style={{ color: '#c0392b' }}>— doesn't match</span>
                    )}
                  </label>
                  <input
                    type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ ...inputStyle(confirmPassword, true), ...(confirmPassword && password !== confirmPassword ? { borderColor: 'rgba(192,57,43,0.5)' } : {}) }}
                  />
                </div>
              </div>
            </div>
          )} */}

          {/* Delivery Details */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b8936a' }}>Delivery Details</p>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#9a7458' }}>Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle(name)} />
            </div>
            <div>
              <label className="text-xs mb-1 flex items-center gap-1" style={{ color: '#9a7458' }}>Phone <span style={{ color: '#c0392b' }}>*</span></label>
              <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setError(''); }} placeholder="98XXXXXXXX" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle(phone, true)} />
            </div>
            <div>
              <label className="text-xs mb-1 flex items-center gap-1" style={{ color: '#9a7458' }}>Delivery Address <span style={{ color: '#c0392b' }}>*</span></label>
              <textarea value={address} onChange={(e) => { setAddress(e.target.value); setError(''); }} placeholder="e.g. Baneshwor, Kathmandu…" rows={2} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={inputStyle(address, true)} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#9a7458' }}>Special Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, preferences…" rows={2} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={{ background: '#fdf6ec', border: '1px solid rgba(184,147,106,0.35)', color: '#1e0f02' }} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: '#f0faf4', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle2 size={16} color="#22c55e" />
            <p className="text-xs" style={{ color: '#16a34a' }}>Payment on delivery · No advance required</p>
          </div>

          {error && <p className="mt-3 text-sm text-center" style={{ color: '#c0392b' }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="mt-6 w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all"
            style={{
              background: submitting || !canSubmit ? '#b8936a' : '#513012',
              color: '#fdf6ec', border: 'none',
              cursor: submitting || !canSubmit ? 'not-allowed' : 'pointer',
              opacity: !canSubmit ? 0.75 : 1,
            }}
          >
            {submitting ? stepLabel
              : !deliveryReady ? 'Add phone & address to continue'
              : !isLoggedIn && !registrationReady ? 'Complete account details to continue'
              : `Place Order · Rs. ${totalPrice.toFixed(0)}`}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER SUCCESS
// ─────────────────────────────────────────────────────────────────────────────
function OrderSuccess({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-8" style={{ background: '#fdf6ec' }}>
      <div className="text-7xl mb-6">🎉</div>
      <h2 className="font-bold text-3xl mb-2" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>Order Placed!</h2>
      <span className="inline-flex items-center gap-1 text-sm font-semibold mb-4" style={{ color: '#22c55e' }}>
        <Truck size={14} /> On its way to you
      </span>
      <hr style={{ borderColor: 'rgba(184,147,106,0.3)', width: '80%', marginBottom: 20 }} />
      <p className="text-sm mb-8" style={{ color: '#9a7458' }}>
        Your order has been received. We will contact you shortly to confirm delivery.
      </p>
      <button onClick={onBack} className="px-8 py-3 rounded-2xl font-bold" style={{ background: '#513012', color: '#fdf6ec', border: 'none', cursor: 'pointer' }}>
        Back to Menu
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MENU CARD  ← now opens MenuReviewSection as drawer
// ─────────────────────────────────────────────────────────────────────────────
function MenuCard({
  item, restaurantId, qty, onAdd, onUpdate,
}: {
  item: MenuItem;
  restaurantId: number;
  qty: number;
  onAdd: () => void;
  onUpdate: (delta: number) => void;
}) {
  const [imgError,          setImgError]          = useState(false);
  const [reviewDrawerOpen,  setReviewDrawerOpen]  = useState(false);
  const [summary,           setSummary]           = useState<MenuReviewSummary>({ avgRating: null, count: 0 });

  const showPlaceholder = !item.image || imgError;

  // Load review summary on mount
  useEffect(() => {
    apiFetchReviewSummary(Number(item.id)).then(setSummary);
  }, [item.id]);

  // Re-fetch summary when drawer closes (user may have posted a review)
  const handleDrawerClose = useCallback(() => {
    setReviewDrawerOpen(false);
    apiFetchReviewSummary(Number(item.id)).then(setSummary);
  }, [item.id]);

  return (
    <>
      <motion.div
        variants={cardVariant}
        layout
        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#513012]/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
      >
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-[#fdf6ec] to-[#e8ddd0] flex items-center justify-center">
          {showPlaceholder ? (
            <span style={{ fontSize: 56 }}>{getCategoryEmoji(item.category)}</span>
          ) : (
            <Image
              src={item.image!}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImgError(true)}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-semibold text-[15px] leading-tight text-gray-900 line-clamp-2">
            {item.name}
          </h3>

          {/* Review teaser */}
          <button
            onClick={() => setReviewDrawerOpen(true)}
            className="flex items-center gap-1.5 mt-1.5 w-fit"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {summary.avgRating !== null ? (
              <>
                <StarDisplay rating={Math.round(summary.avgRating)} size={12} />
                <span className="text-xs font-semibold" style={{ color: '#513012' }}>
                  {summary.avgRating.toFixed(1)}
                </span>
                <span className="text-xs" style={{ color: '#9a7458' }}>({summary.count})</span>
              </>
            ) : (
              <>
                <StarDisplay rating={0} size={12} />
                <span className="text-xs" style={{ color: '#b8936a' }}>No reviews yet</span>
              </>
            )}
            <MessageSquare size={11} style={{ color: '#b8936a', marginLeft: 1 }} />
          </button>

          {item.description && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-3 flex-1">{item.description}</p>
          )}

          {/* Price + Add to cart */}
          <div className="mt-auto pt-4 flex items-center justify-between">
            <span className="font-bold text-xl text-[#513012]">Rs. {item.price}</span>
            {qty === 0 ? (
              <button
                onClick={onAdd}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-all"
                style={{ background: '#513012', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                <Plus size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => onUpdate(-1)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#f0e6d3', color: '#513012', border: 'none', cursor: 'pointer' }}>
                  <Minus size={12} />
                </button>
                <span className="w-5 text-center font-bold text-sm" style={{ color: '#1e0f02' }}>{qty}</span>
                <button onClick={() => onUpdate(1)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#513012', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  <Plus size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── MenuReviewSection as drawer (replaces old MenuReviewDrawer) ── */}
      {reviewDrawerOpen && (
        <MenuReviewSection
          menuId={Number(item.id)}
          menuName={item.name}
          restaurantId={restaurantId}
          onClose={handleDrawerClose}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function MenuSection({
  menuItems,
  restaurantId,
  acceptsOnlineOrders = true,
}: Props) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart,           setCart]           = useState<CartItem[]>([]);
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [orderSuccess,   setOrderSuccess]   = useState(false);
  const [auth,           setAuth]           = useState<AuthData | null>(null);

  useEffect(() => { setAuth(getAuth()); }, []);

  const handleAuthChange = (a: AuthData | null) => {
    if (a) saveAuth(a); else clearAuth();
    setAuth(a);
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((i) => i.category ?? 'Other')));
    return ['All', ...cats];
  }, [menuItems]);

  const filtered = useMemo(() =>
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((i) => (i.category ?? 'Other') === activeCategory),
    [menuItems, activeCategory],
  );

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) return prev.map((c) => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQty = (itemId: string | number, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c)
          .filter((c) => c.quantity > 0),
    );
  };

  const getQty = (itemId: string | number) =>
    cart.find((c) => c.item.id === itemId)?.quantity || 0;

  if (orderSuccess) {
    return <OrderSuccess onBack={() => { setOrderSuccess(false); setCart([]); }} />;
  }

  return (
    <>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10" style={{ paddingBottom: cart.length > 0 ? 120 : 40 }}>
        {acceptsOnlineOrders && <OnlineOrderBadge />}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-3xl border p-6 sticky top-24">
              <h3 className="font-bold text-[#513012] mb-4 text-lg">Filters</h3>
              <div className="space-y-2 mb-8">
                <button
                  onClick={() => setActiveCategory('All')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${activeCategory === 'All' ? 'bg-[#513012] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <UtensilsCrossed size={18} /> All
                </button>
              </div>
              <h3 className="font-bold text-[#513012] mb-4 text-lg">Category</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all ${activeCategory === cat ? 'bg-[#513012] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {acceptsOnlineOrders && (
                <div className="mt-6 flex items-start gap-2 p-3 rounded-xl" style={{ background: '#f0faf4', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <Truck size={14} color="#22c55e" className="mt-0.5 shrink-0" />
                  <p className="text-xs" style={{ color: '#16a34a', lineHeight: 1.5 }}>
                    We deliver to your door. Add items and place your order!
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Main grid */}
          <main className="flex-1 min-w-0">
            {/* Mobile category pills */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 lg:hidden" style={{ scrollbarWidth: 'none' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all"
                  style={{
                    background: activeCategory === cat ? '#513012' : '#fff',
                    color: activeCategory === cat ? '#fff' : '#513012',
                    borderColor: '#513012',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-500 mb-6">{filtered.length} items found</p>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    restaurantId={restaurantId}
                    qty={getQty(item.id)}
                    onAdd={() => addToCart(item)}
                    onUpdate={(delta) => updateQty(item.id, delta)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </main>
        </div>
      </div>

      <CartBar cart={cart} onOpen={() => setDrawerOpen(true)} />

      {drawerOpen && (
        <OrderDrawer
          cart={cart}
          restaurantId={restaurantId}
          auth={auth}
          onClose={() => setDrawerOpen(false)}
          onUpdateQty={updateQty}
          onAuthChange={handleAuthChange}
          onSuccess={() => { setDrawerOpen(false); setOrderSuccess(true); }}
        />
      )}
    </>
  );
}