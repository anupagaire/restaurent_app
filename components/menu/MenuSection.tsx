'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 ShoppingCart, X, Plus, Minus,
  Truck, CheckCircle2, LogIn, Star, 
} from 'lucide-react';
import Image from 'next/image';
import MenuReviewSection from './MenuReviewSection';
import CategorySlider from '@/components/home/CategorySlider';

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
interface CartItem { item: MenuItem; quantity: number; }
interface AuthData { access: string; refresh: string; email: string; }
interface MenuReviewSummary { avgRating: number | null; count: number; }
interface Props { menuItems: MenuItem[]; restaurantId: number; acceptsOnlineOrders?: boolean; }

function getAuth(): AuthData | null {
  try { const s = localStorage.getItem(AUTH_KEY); return s ? JSON.parse(s) : null; }
  catch { return null; }
}
function saveAuth(d: AuthData) { localStorage.setItem(AUTH_KEY, JSON.stringify(d)); }
function clearAuth() { localStorage.removeItem(AUTH_KEY); }

async function apiRegister(params: { email: string; password: string; name: string; phone: string | null; restaurantId: number; }) {
  const res = await fetch(`${BASE_URL}/api/v1/user/register/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: params.email.trim(), password1: params.password, password2: params.password, first_name: params.name.trim() || 'Guest', contact_no: params.phone || null, role: 'customer', restaurant: params.restaurantId }),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = `Registration failed (${res.status})`;
    try { const err = JSON.parse(text); if (err.email) msg = Array.isArray(err.email) ? err.email[0] : err.email; else if (err.password1) msg = Array.isArray(err.password1) ? err.password1[0] : err.password1; else if (err.detail) msg = err.detail; else msg = JSON.stringify(err).slice(0, 200); } catch { }
    throw new Error(msg);
  }
}

async function apiLogin(email: string, password: string): Promise<AuthData> {
  const res = await fetch(`${BASE_URL}/api/v1/login/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), password }) });
  const text = await res.text();
  if (!res.ok) { let msg = `Login failed (${res.status})`; try { const err = JSON.parse(text); msg = err.detail || err.non_field_errors?.[0] || msg; } catch { } throw new Error(msg); }
  const data = JSON.parse(text);
  if (!data.access) throw new Error('Login response did not contain an access token.');
  return { access: data.access, refresh: data.refresh, email };
}

async function apiPlaceOrder(payload: object, accessToken: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/orders/`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(payload) });
  const text = await res.text();
  if (!res.ok) {
    let msg = `Order failed (${res.status})`;
    try { const err = JSON.parse(text); if (err.detail) msg = err.detail; else if (err.non_field_errors) msg = err.non_field_errors[0]; else { const key = Object.keys(err)[0]; const val = err[key]; msg = `${key}: ${Array.isArray(val) ? val[0] : val}`; } } catch { msg = text.slice(0, 200); }
    throw new Error(msg);
  }
}

async function apiFetchReviewSummary(menuId: number): Promise<MenuReviewSummary> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/menu-reviews/?menu=${menuId}&page_size=200`, { cache: 'no-store' });
    if (!res.ok) return { avgRating: null, count: 0 };
    const data = await res.json();
    const reviews = (data.results ?? []).filter((r: { parent: number | null }) => r.parent === null || r.parent === undefined);
    if (!reviews.length) return { avgRating: null, count: 0 };
    const avg = reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length;
    return { avgRating: avg, count: reviews.length };
  } catch { return { avgRating: null, count: 0 }; }
}

function getCategoryEmoji(category?: string): string {
  const map: Record<string, string> = { pizza: '🍕', burger: '🍔', drink: '🥤', drinks: '🥤', coffee: '☕', dessert: '🍰', desserts: '🍰', soup: '🍜', salad: '🥗', starter: '🥗', starters: '🥗', food: '🍛', noodle: '🍜', sushi: '🍣', sandwich: '🥪', pasta: '🍝', bread: '🥖' };
  const key = (category ?? '').toLowerCase();
  for (const [k, v] of Object.entries(map)) { if (key.includes(k)) return v; }
  return '🍽️';
}

const cardVariant = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

function StarDisplay({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} fill={rating >= s ? '#f59e0b' : 'none'} color={rating >= s ? '#f59e0b' : '#d1d5db'} strokeWidth={1.5} />
      ))}
    </span>
  );
}

// ── CART BAR (Swiggy style) ──────────────────────────────────────────────────
function CartBar({ cart, onOpen }: { cart: CartItem[]; onOpen: () => void }) {
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);
  if (totalItems === 0) return null;
  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
      <button
        onClick={onOpen}
        className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl shadow-2xl w-full max-w-sm"
        style={{ background: '#513012', color: '#fff' }}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span className="bg-white/20 rounded-lg px-2 py-0.5 text-xs font-bold">{totalItems}</span>
          items in cart
        </span>
        <span className="flex items-center gap-1.5 text-sm font-bold">
          <ShoppingCart size={15} />
          View Order · Rs. {totalPrice.toFixed(0)}
        </span>
      </button>
    </div>
  );
}

// ── ORDER DRAWER ─────────────────────────────────────────────────────────────
function OrderDrawer({ cart, restaurantId, auth, onClose, onUpdateQty, onSuccess, onAuthChange }: {
  cart: CartItem[]; restaurantId: number; auth: AuthData | null; onClose: () => void;
  onUpdateQty: (itemId: string | number, delta: number) => void; onSuccess: () => void; onAuthChange: (a: AuthData | null) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+977');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'idle' | 'registering' | 'logging_in' | 'placing'>('idle');

  const isLoggedIn = !!auth;
  const totalPrice = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);
  const deliveryReady = phone.trim().length > 0 && address.trim().length > 0;
  const registrationReady = email.trim().length > 0 && password.length >= 8 && password === confirmPassword;
  const canSubmit = cart.length > 0 && deliveryReady && (isLoggedIn || registrationReady);
  const handleLogout = () => { clearAuth(); onAuthChange(null); };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true); setError('');
    try {
      let currentAuth = auth;
      if (!currentAuth) {
        if (authMode === 'register') { setStep('registering'); await apiRegister({ email, password, name: name.trim() || 'Guest', phone: phone.trim() || null, restaurantId }); }
        setStep('logging_in'); currentAuth = await apiLogin(email, password); saveAuth(currentAuth); onAuthChange(currentAuth);
      }
      setStep('placing');
      await apiPlaceOrder({ restaurant: restaurantId, customer_name: name.trim() || 'Guest', customer_phone: phone.trim() || null, customer_email: currentAuth.email || null, notes: [address.trim() ? `Delivery address: ${address.trim()}` : '', notes.trim()].filter(Boolean).join('\n') || null, items: cart.map((c) => ({ menu_id: c.item.id, quantity: c.quantity })) }, currentAuth.access);
      onSuccess();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Something went wrong.'); }
    finally { setSubmitting(false); setStep('idle'); }
  };

  const stepLabel = step === 'registering' ? 'Creating account…' : step === 'logging_in' ? 'Logging in…' : step === 'placing' ? 'Placing order…' : '';
  const inp = (val: string, req = false): React.CSSProperties => ({ background: '#f9f9f9', border: `1.5px solid ${val.trim() && req ? '#22c55e' : '#e5e7eb'}`, borderRadius: 12, color: '#111', padding: '12px 14px', width: '100%', fontSize: 14, outline: 'none' });

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-y-auto bg-white" style={{ maxHeight: '92vh' }}>
        <div className="flex justify-center pt-3"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
        <div className="px-5 pb-12 max-w-2xl mx-auto">
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-lg text-gray-900">Your Order</h2>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5"><Truck size={11} /> Online Delivery</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><X size={16} /></button>
          </div>

          {isLoggedIn && (
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl mt-3 bg-green-50 border border-green-100">
              <span className="text-xs font-semibold text-green-700 flex items-center gap-1.5"><CheckCircle2 size={13} /> {auth!.email}</span>
              <button onClick={handleLogout} className="text-xs text-gray-400 underline">Switch</button>
            </div>
          )}

          {/* Cart items */}
          <div className="mt-4 space-y-1">
            {cart.map((c) => (
              <div key={c.item.id} className="flex items-center justify-between py-3 border-b border-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{c.item.name}</p>
                  {c.item.category && <p className="text-xs text-gray-400">{c.item.category}</p>}
                </div>
                <div className="flex items-center gap-2 mx-3">
                  <button onClick={() => onUpdateQty(c.item.id, -1)} className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-secondary"><Minus size={11} /></button>
                  <span className="text-sm font-bold text-gray-900 w-4 text-center">{c.quantity}</span>
                  <button onClick={() => onUpdateQty(c.item.id, 1)} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-white"><Plus size={11} /></button>
                </div>
                <span className="text-sm font-bold text-secondary w-16 text-right">Rs. {(c.item.price * c.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center py-4 border-t border-dashed border-gray-200 mt-2">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-xl text-secondary">Rs. {totalPrice.toFixed(0)}</span>
          </div>

          {/* Auth section */}
          {!isLoggedIn && (
            <div className="mb-5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3"><LogIn size={15} className="text-secondary" /> Sign in to order</p>
              <div className="flex gap-2 mb-4">
                {(['login', 'register'] as const).map((m) => (
                  <button key={m} onClick={() => { setAuthMode(m); setError(''); }}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold border transition-all"
                    style={{ background: authMode === m ? '#513012' : 'transparent', color: authMode === m ? '#fff' : '#513012', borderColor: '#513012' }}>
                    {m === 'login' ? 'I have an account' : 'New account'}
                  </button>
                ))}
              </div>
              <div className="space-y-2.5">
                {authMode === 'register' && <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" style={inp(name)} />}
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="Email *" style={inp(email, true)} />
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder={authMode === 'register' ? 'Password (min 8 chars) *' : 'Password *'} style={inp(password, true)} />
                {authMode === 'register' && (
                  <div>
                    <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} placeholder="Confirm password *" style={{ ...inp(confirmPassword, true), ...(confirmPassword && password !== confirmPassword ? { borderColor: '#ef4444' } : {}) }} />
                    {confirmPassword && password !== confirmPassword && <p className="text-xs text-red-500 mt-1">Passwords don&apos;t match</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery details */}
          <div className="space-y-3 mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery Details</p>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={inp(name)} />
        
<input
  type="tel"
  value={phone}
  onChange={(e) => {
    const value = e.target.value;
    if (!value.startsWith('+977')) {
      setPhone('+977');
      return;
    }

    setPhone(value);
    setError('');
  }}
  placeholder="Phone number *"
  style={inp(phone, true)}
/>




            <textarea value={address} onChange={(e) => { setAddress(e.target.value); setError(''); }} placeholder="Delivery address *" rows={2} style={{ ...inp(address, true), resize: 'none' }} />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special notes (optional)" rows={2} style={{ ...inp(notes), resize: 'none' }} />
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-100 mb-4">
            <CheckCircle2 size={14} className="text-green-600 shrink-0" />
            <p className="text-xs text-green-700">Payment on delivery · No advance required</p>
          </div>

          {error && <p className="text-sm text-red-500 text-center mb-3">{error}</p>}

          <button onClick={handleSubmit} disabled={submitting || !canSubmit}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all"
            style={{ background: submitting || !canSubmit ? '#d1d5db' : '#513012', color: submitting || !canSubmit ? '#9ca3af' : '#fff', cursor: !canSubmit ? 'not-allowed' : 'pointer' }}>
            {submitting ? stepLabel : !deliveryReady ? 'Add phone & address to continue' : !isLoggedIn && !registrationReady ? 'Complete account details' : `Place Order · Rs. ${totalPrice.toFixed(0)}`}
          </button>
        </div>
      </div>
    </>
  );
}

// ── ORDER SUCCESS ─────────────────────────────────────────────────────────────
function OrderSuccess({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-8 bg-white">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="font-bold text-2xl text-gray-900 mb-1">Order Placed!</h2>
      <p className="text-sm text-green-600 font-semibold flex items-center gap-1 mb-4"><Truck size={14} /> On its way to you</p>
      <p className="text-sm text-gray-500 mb-8 max-w-xs">Your order has been received. We&apos;ll contact you shortly to confirm delivery.</p>
      <button onClick={onBack} className="px-8 py-3 rounded-2xl font-bold bg-secondary text-white">Back to Menu</button>
    </div>
  );
}

// ── MENU CARD (Swiggy style — horizontal on mobile, vertical on desktop) ──────
function MenuCard({ item, restaurantId, qty, onAdd, onUpdate }: {
  item: MenuItem; restaurantId: number; qty: number; onAdd: () => void; onUpdate: (delta: number) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [summary, setSummary] = useState<MenuReviewSummary>({ avgRating: null, count: 0 });
  const showPlaceholder = !item.image || imgError;

  useEffect(() => { apiFetchReviewSummary(Number(item.id)).then(setSummary); }, [item.id]);
  const handleDrawerClose = useCallback(() => {
    setReviewDrawerOpen(false);
    apiFetchReviewSummary(Number(item.id)).then(setSummary);
  }, [item.id]);

  return (
    <>
      <motion.div variants={cardVariant} layout
        className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
      >
       <div className="relative w-full h-40 bg-gray-50">
          {showPlaceholder ? (
            <div className="w-full h-full min-h-[112px] flex items-center justify-center text-4xl bg-orange-50">
              {getCategoryEmoji(item.category)}
            </div>
          ) : (
            <Image src={item.image!} alt={item.name} fill sizes="(max-width: 640px) 112px, 33vw"
              onError={() => setImgError(true)} className="object-cover" />
          )}
         
        </div>

        <div className="flex flex-col flex-1 p-3 sm:p-4 min-w-0">
          {item.category && (
            <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full w-fit mb-1.5 uppercase tracking-wide">
              {item.category}
            </span>
          )}

          <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">{item.name}</h3>

         <button onClick={() => setReviewDrawerOpen(true)}
  className="flex items-center gap-1 mt-1.5 w-fit cursor-pointer hover:opacity-80 transition-opacity"
  style={{ background: 'none', border: 'none', padding: 0 }}
  title="Tap to read or write a review">
            {summary.avgRating !== null ? (
 <span className="inline-flex flex-col gap-0.5">
  <span className="inline-flex items-center gap-1 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
    {summary.avgRating.toFixed(1)} ★
    <span className="font-normal text-green-100">({summary.count})</span>
  </span>
  <span className="text-[10px] text-orange-500 font-semibold flex items-center gap-0.5">
    ✏️ Write a review & rate
  </span>
</span>
) : (
  <span className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
    ✏️ Write a review
  </span>
)}
          </button>

          {item.description && (
            <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed flex-1">{item.description}</p>
          )}

          {/* Price + Add button */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
            <div>
              <span className="font-bold text-base text-gray-900">Rs. {item.price}</span>
            </div>
            {qty === 0 ? (
              <button onClick={onAdd}
                className="px-4 py-1.5 rounded-xl text-xs font-bold border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all">
                ADD
              </button>
            ) : (
              <div 
              className="flex items-center gap-1.5 bg-secondary rounded-xl px-2 py-1">
                <button
                 onClick={() => onUpdate(-1)} className="w-5 h-5 flex items-center justify-center text-white"><Minus size={11} /></button>
                <span
                 className="text-white font-bold text-sm w-4 text-center">{qty}</span>
                <button
                 onClick={() => onUpdate(1)} className="w-5 h-5 flex items-center justify-center text-white"><Plus size={11} /></button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {reviewDrawerOpen && (
        <MenuReviewSection 
        menuId={Number(item.id)} 
        menuName={item.name}
         restaurantId={restaurantId}
          onClose={handleDrawerClose} />
      )}
    </>
  );
}

export default function MenuSection({ menuItems, restaurantId, acceptsOnlineOrders = true }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [auth, setAuth] = useState<AuthData | null>(null);

  useEffect(() => { setAuth(getAuth()); }, []);

  const handleAuthChange = (a: AuthData | null) => { if (a) saveAuth(a); else clearAuth(); setAuth(a); };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((i) => i.category ?? 'Other')));
    return ['All', ...cats];
  }, [menuItems]);

  const filtered = useMemo(() =>
    activeCategory === 'All' ? menuItems : menuItems.filter((i) => (i.category ?? 'Other') === activeCategory),
    [menuItems, activeCategory]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) return prev.map((c) => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQty = (itemId: string | number, delta: number) => {
    setCart((prev) => prev.map((c) => c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c).filter((c) => c.quantity > 0));
  };

  const getQty = (itemId: string | number) => cart.find((c) => c.item.id === itemId)?.quantity || 0;

  if (orderSuccess) 
    return <OrderSuccess onBack={() => { setOrderSuccess(false); setCart([]); }} />;

  return (
    <>
      <div style={{ paddingBottom: cart.length > 0 ? 100 : 24 }}>

        {acceptsOnlineOrders && (
          <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-6">
            <span className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <Truck size={13} color="#fff" />
            </span>
            <div className="flex-1">
              <p className="text-xs font-bold text-green-800">Delivery available</p>
              <p className="text-xs text-green-600">Order now · Pay on delivery</p>
            </div>
            <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          </div>
        )}

        <CategorySlider
  categories={categories}
  activeCategory={activeCategory}
  onSelect={setActiveCategory}
/>
        <p className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wide">
          {filtered.length} items
        </p>

        <motion.div variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <MenuCard
              key={item.id}
               item={item}
              
               restaurantId={restaurantId}
                qty={getQty(item.id)}
                
                onAdd={() => addToCart(item)} onUpdate={(delta) => updateQty(item.id, delta)} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <CartBar 
      cart={cart} 
      onOpen={() => setDrawerOpen(true)} />

      {drawerOpen && (
        <OrderDrawer
         cart={cart} 
         restaurantId={restaurantId} auth={auth}
          onClose={() => setDrawerOpen(false)} 
          onUpdateQty={updateQty} 
          onAuthChange={handleAuthChange}
          onSuccess={() => { setDrawerOpen(false); setOrderSuccess(true); }} />
      )}
    </>
  );
}