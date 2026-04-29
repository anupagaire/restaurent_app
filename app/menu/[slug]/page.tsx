'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: string;
  status: boolean;
  category: number;
}

interface Category {
  id: number;
  name: string;
  status: boolean;
  menus?: MenuItem[];
}

interface Restaurant {
  id: number;
  name: string;
  address: string;
  city: string;
  photos?: { id: number; photo: string }[];
  categories?: Category[];
  menus?: MenuItem[];
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  categoryName: string;
}

function OrnamentDivider() {
  return (
    <div className="flex items-center justify-center gap-2 my-1">
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #b8936a)' }} />
      <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
        <path d="M10 6 L6 2 L2 6 L6 10 Z" fill="#b8936a" opacity="0.7" />
        <path d="M10 6 L14 2 L18 6 L14 10 Z" fill="#b8936a" opacity="0.7" />
        <circle cx="10" cy="6" r="1.5" fill="#b8936a" />
      </svg>
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #b8936a)' }} />
    </div>
  );
}

// ============================================================
// CART BUTTON (floating bottom bar)
// ============================================================
function CartBar({ cart, onOpen }: { cart: CartItem[]; onOpen: () => void }) {
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + parseFloat(c.menuItem.price) * c.quantity, 0);
  if (totalItems === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <button
        onClick={onOpen}
        className="pointer-events-auto w-full max-w-2xl mx-auto flex items-center justify-between px-6 py-4 rounded-2xl shadow-2xl"
        style={{ background: '#513012', color: '#fdf6ec', display: 'flex' }}
      >
        <span className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#b8936a' }}>
          {totalItems}
        </span>
        <span className="font-bold tracking-wide" style={{ fontFamily: 'Lato, sans-serif' }}>View Order</span>
        <span className="font-bold">Rs. {totalPrice.toFixed(0)}</span>
      </button>
    </div>
  );
}

// ============================================================
// ORDER DRAWER
// ============================================================
function OrderDrawer({
  cart,
  restaurant,
  token,
  onClose,
  onUpdateQty,
  onSuccess,
}: {
  cart: CartItem[];
  restaurant: Restaurant;
  token: string;
  onClose: () => void;
  onUpdateQty: (itemId: number, delta: number) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = cart.reduce((s, c) => s + parseFloat(c.menuItem.price) * c.quantity, 0);
  const API = process.env.NEXT_PUBLIC_API_URL;

const handleSubmit = async () => {
  if (cart.length === 0) return;

  setSubmitting(true);
  setError('');

  try {
    // ✅ Validate token
    if (!token) {
      throw new Error("Invalid QR token. Please scan again.");
    }

    // ✅ Build correct payload (NO price field)
    const payload = {
      restaurant: restaurant.id,
      customer_name: name?.trim() || null,
      customer_phone: phone?.trim() || null,
      customer_email: email?.trim() || null,
      notes: notes?.trim() || null,
      items: cart.map((c) => ({
        menu: c.menuItem.id,     // ✅ correct
        quantity: c.quantity,    // ✅ correct
      })),
    };

    // ✅ Debug logs (VERY IMPORTANT)
    console.log("API:", API);
    console.log("TOKEN:", token);
    console.log("PAYLOAD:", payload);

    const res = await fetch(
      `${API}/api/v1/orders/?token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const responseText = await res.text();

    console.log("STATUS:", res.status);
    console.log("RESPONSE:", responseText);

    if (!res.ok) {
      let errorMsg = `Error ${res.status}`;
      try {
        const errJson = JSON.parse(responseText);
        errorMsg =
          errJson.detail ||
          errJson.error ||
          errJson.message ||
          JSON.stringify(errJson);
      } catch {
        // if not JSON (HTML error page etc)
        errorMsg = responseText.slice(0, 200);
      }
      throw new Error(errorMsg);
    }

    // ✅ Success
    onSuccess();
  } catch (err: any) {
    console.error("Order submission failed:", err);
    setError(err.message || "Failed to place order.");
  } finally {
    setSubmitting(false);
  }
};
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(30,15,2,0.55)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-y-auto"
        style={{ background: '#fffdf8', maxHeight: '90vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#d4b896' }} />
        </div>

        <div className="px-5 pb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between py-4">
            <h2 className="font-bold text-xl" style={{ color: '#1e0f02', fontFamily: 'Playfair Display, serif' }}>
              Your Order
            </h2>
            <button onClick={onClose} style={{ color: '#9a7458', fontSize: 22 }}>✕</button>
          </div>

          <OrnamentDivider />

          {/* Cart Items */}
          <div className="mt-4 space-y-3">
            {cart.map(c => (
              <div key={c.menuItem.id} className="flex items-center justify-between gap-3 py-3"
                style={{ borderBottom: '1px dashed rgba(184,147,106,0.28)' }}>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: '#1e0f02' }}>{c.menuItem.name}</p>
                  <p className="text-xs" style={{ color: '#9a7458' }}>{c.categoryName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQty(c.menuItem.id, -1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                    style={{ background: '#f0e6d3', color: '#513012' }}
                  >−</button>
                  <span className="w-5 text-center font-bold text-sm" style={{ color: '#1e0f02' }}>{c.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(c.menuItem.id, 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                    style={{ background: '#513012', color: '#fdf6ec' }}
                  >+</button>
                </div>
                <span className="font-bold text-sm w-16 text-right" style={{ color: '#513012' }}>
                  Rs. {(parseFloat(c.menuItem.price) * c.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-4 mt-2">
            <span className="font-bold" style={{ color: '#1e0f02', fontFamily: 'Playfair Display, serif' }}>Total</span>
            <span className="font-bold text-xl" style={{ color: '#513012' }}>Rs. {totalPrice.toFixed(0)}</span>
          </div>

          <OrnamentDivider />

          {/* Customer Info */}
          <div className="mt-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b8936a' }}>Your Details (optional)</p>
            {[
              { label: 'Name', value: name, set: setName, type: 'text', placeholder: 'Your name' },
              { label: 'Phone', value: phone, set: setPhone, type: 'tel', placeholder: '98XXXXXXXX' },
              { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'you@email.com' },
            ].map(({ label, value, set, type, placeholder }) => (
              <div key={label}>
                <label className="text-xs mb-1 block" style={{ color: '#9a7458' }}>{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={e => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: '#fdf6ec',
                    border: '1px solid rgba(184,147,106,0.35)',
                    color: '#1e0f02',
                    fontFamily: 'Lato, sans-serif',
                  }}
                />
              </div>
            ))}
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#9a7458' }}>Special Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special requests..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{
                  background: '#fdf6ec',
                  border: '1px solid rgba(184,147,106,0.35)',
                  color: '#1e0f02',
                  fontFamily: 'Lato, sans-serif',
                }}
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-center" style={{ color: '#c0392b' }}>{error}</p>
          )}

          {/* Place Order */}
          <button
            onClick={handleSubmit}
            disabled={submitting || cart.length === 0}
            className="mt-6 w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all"
            style={{
              background: submitting ? '#b8936a' : '#513012',
              color: '#fdf6ec',
              fontFamily: 'Lato, sans-serif',
              opacity: submitting ? 0.8 : 1,
            }}
          >
            {submitting ? 'Placing Order...' : `Place Order · Rs. ${totalPrice.toFixed(0)}`}
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================================
// SUCCESS SCREEN
// ============================================================
function OrderSuccess({ restaurantName, onBack }: { restaurantName: string; onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-8"
      style={{ background: '#fdf6ec', fontFamily: 'Lato, sans-serif' }}>
      <div className="text-7xl mb-6">🎉</div>
      <h2 className="font-bold text-3xl mb-3" style={{ color: '#513012', fontFamily: 'Playfair Display, serif' }}>
        Order Placed!
      </h2>
      <OrnamentDivider />
      <p className="text-sm mt-4 mb-8" style={{ color: '#9a7458' }}>
        Your order has been sent to {restaurantName}. Staff will serve you shortly.
      </p>
      <button
        onClick={onBack}
        className="px-8 py-3 rounded-2xl font-bold"
        style={{ background: '#513012', color: '#fdf6ec' }}
      >
        Back to Menu
      </button>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchMenu = async () => {
      if (!slug || !token) {
        setError('Invalid QR code link. Please scan the QR code again.');
        setLoading(false);
        return;
      }
      try {
        const url = `${API}/api/v1/qr-menu/${slug}/?token=${encodeURIComponent(token)}`;
        const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store' });
        if (!res.ok) {
          let msg = `Failed to load menu (${res.status})`;
          if (res.status === 403) msg = 'This QR code has expired or is invalid.';
          else if (res.status === 404) msg = 'Restaurant not found.';
          throw new Error(msg);
        }
        const data = await res.json();
        const restaurantData: Restaurant = data.restaurant ?? data;
        setRestaurant(restaurantData);
        const firstActive = restaurantData.categories?.find(c => c.status !== false);
        if (firstActive) setActiveCategory(firstActive.name);
      } catch (err: any) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [slug, token, API]);

  // Cart helpers
  const addToCart = (item: MenuItem, categoryName: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: item, quantity: 1, categoryName }];
    });
  };

  const updateQty = (itemId: number, delta: number) => {
    setCart(prev => {
      const updated = prev.map(c => c.menuItem.id === itemId ? { ...c, quantity: c.quantity + delta } : c);
      return updated.filter(c => c.quantity > 0);
    });
  };

  const getQty = (itemId: number) => cart.find(c => c.menuItem.id === itemId)?.quantity || 0;

  const getItemsForCategory = (category: Category): MenuItem[] => {
    if (category.menus && category.menus.length > 0) return category.menus.filter(i => i.status !== false);
    if (restaurant?.menus && restaurant.menus.length > 0) return restaurant.menus.filter(i => i.category === category.id && i.status !== false);
    return [];
  };

  // ── Loading ──
  if (loading) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Lato:wght@300;400;700&display=swap');`}</style>
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#fdf6ec' }}>
        <div className="w-12 h-12 rounded-full border-4 animate-spin" style={{ borderColor: '#b8936a', borderTopColor: 'transparent' }} />
        <p style={{ color: '#8a6040', fontSize: 15, fontFamily: 'Lato, sans-serif' }}>Loading menu...</p>
      </div>
    </>
  );

  // ── Error ──
  if (error || !restaurant) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Lato:wght@300;400;700&display=swap');`}</style>
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: '#fdf6ec' }}>
        <div className="text-6xl mb-6">😕</div>
        <h1 className="font-bold text-3xl mb-3" style={{ color: '#513012', fontFamily: 'Playfair Display, serif' }}>Menu Unavailable</h1>
        <p style={{ color: '#a0856b' }}>{error || 'Something went wrong.'}</p>
        <p className="text-xs text-gray-500 mt-10">Please ask the restaurant staff for a new QR code.</p>
      </div>
    </>
  );

  // ── Order Success ──
  if (orderSuccess) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Lato:wght@300;400;700&display=swap');`}</style>
      <OrderSuccess restaurantName={restaurant.name} onBack={() => { setOrderSuccess(false); setCart([]); }} />
    </>
  );

  const categories = restaurant.categories?.filter(c => c.status !== false) || [];
  const coverPhoto = restaurant.photos?.[0]?.photo;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        .menu-serif { font-family: 'Playfair Display', Georgia, serif; }
        .menu-sans  { font-family: 'Lato', sans-serif; }
        .paper-bg {
          background-color: #fdf6ec;
          background-image: radial-gradient(ellipse at 20% 0%, rgba(184,147,106,0.10) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 100%, rgba(81,48,18,0.07) 0%, transparent 55%);
          min-height: 100vh;
        }
        .menu-card { background: #fffdf8; border: 1px solid rgba(184,147,106,0.18); box-shadow: 0 2px 16px rgba(81,48,18,0.07); }
        .item-row { border-bottom: 1px dashed rgba(184,147,106,0.28); }
        .item-row:last-child { border-bottom: none; }
        .cat-pill {
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          border-radius: 999px; padding: 6px 16px; border: 1px solid #d4b896; color: #8a6040;
          background: transparent; transition: all 0.2s; white-space: nowrap;
        }
        .cat-pill.active { background: #513012; color: #fdf6ec; border-color: #513012; }
        .qty-btn { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; transition: all 0.15s; }
        .add-btn { background:#513012; color:#fdf6ec; border:none; cursor:pointer; }
        .add-btn:hover { background:#7a4820; }
        .sub-btn { background:#f0e6d3; color:#513012; border:none; cursor:pointer; }
      `}</style>

      <div className="paper-bg menu-sans" style={{ paddingBottom: 100 }}>
        {/* HERO */}
        <div className="relative">
          {coverPhoto && (
            <div className="relative w-full h-[220px] overflow-hidden">
              <img src={coverPhoto} alt={restaurant.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[#fdf6ec]" />
            </div>
          )}
          <div className={`text-center px-5 ${coverPhoto ? '-mt-14 relative z-10' : 'pt-12'} pb-6`}>
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-[#513012] flex items-center justify-center ring-8 ring-white shadow-md">
              <span className="text-4xl font-bold text-white menu-serif">{restaurant.name?.[0] || '?'}</span>
            </div>
            <h1 className="menu-serif font-bold text-4xl leading-tight" style={{ color: '#1e0f02' }}>{restaurant.name}</h1>
            <div className="mt-4 mb-2"><OrnamentDivider /></div>
            {(restaurant.address || restaurant.city) && (
              <p className="text-sm text-[#9a7458]">📍 {[restaurant.address, restaurant.city].filter(Boolean).join(', ')}</p>
            )}
          </div>
        </div>

        {/* CATEGORY NAV */}
        {categories.length > 0 && (
          <div className="sticky top-0 z-20 bg-[#fdf6ec]/95 backdrop-blur-md border-b border-[#d4b896]/30">
            <div className="flex gap-2 px-4 py-4 overflow-x-auto max-w-2xl mx-auto" style={{ scrollbarWidth: 'none' }}>
              {categories.map(cat => (
                <button key={cat.id} className={`cat-pill ${activeCategory === cat.name ? 'active' : ''}`}
                  onClick={() => { setActiveCategory(cat.name); document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MENU CONTENT */}
        <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto space-y-12">
          {categories.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🥗</div>
              <p className="menu-serif italic text-xl text-[#b8936a]">No menu items available yet.</p>
            </div>
          )}

          {categories.map(category => {
            const items = getItemsForCategory(category);
            if (items.length === 0) return null;
            return (
              <div key={category.id} id={`cat-${category.id}`} className="scroll-mt-24">
                <div className="text-center mb-8">
                  <OrnamentDivider />
                  <h2 className="menu-serif font-bold text-2xl mt-3 mb-1" style={{ color: '#1e0f02' }}>{category.name}</h2>
                  <OrnamentDivider />
                </div>

                <div className="menu-card rounded-2xl overflow-hidden px-6 py-2">
                  {items.map(item => {
                    const qty = getQty(item.id);
                    return (
                      <div key={item.id} className="item-row py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="font-semibold text-[15px] leading-tight" style={{ color: '#1e0f02' }}>{item.name}</div>
                            {item.description && (
                              <p className="menu-serif italic text-xs mt-1.5 leading-relaxed text-[#9a7458]">{item.description}</p>
                            )}
                            <div className="font-bold mt-2" style={{ color: '#513012' }}>Rs. {item.price}</div>
                          </div>

                          {/* ✅ ADD TO CART CONTROLS */}
                          <div className="flex items-center gap-2 shrink-0">
                            {qty === 0 ? (
                              <button className="qty-btn add-btn" onClick={() => addToCart(item, category.name)}>+</button>
                            ) : (
                              <>
                                <button className="qty-btn sub-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                                <span className="w-5 text-center font-bold text-sm" style={{ color: '#1e0f02' }}>{qty}</span>
                                <button className="qty-btn add-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="text-center pt-10 pb-12">
            <OrnamentDivider />
            <p className="uppercase tracking-widest text-[#c9a87a] font-bold text-lg">{restaurant.name} • {restaurant.city}</p>
            <OrnamentDivider />
          </div>
        </div>
      </div>

      {/* FLOATING CART BAR */}
      <CartBar cart={cart} onOpen={() => setDrawerOpen(true)} />

      {/* ORDER DRAWER */}
      {drawerOpen && (
        <OrderDrawer
          cart={cart}
          restaurant={restaurant}
          token={token}
          onClose={() => setDrawerOpen(false)}
          onUpdateQty={updateQty}
          onSuccess={() => { setDrawerOpen(false); setOrderSuccess(true); }}
        />
      )}
    </>
  );
}