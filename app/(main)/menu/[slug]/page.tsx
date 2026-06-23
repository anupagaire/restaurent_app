'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: string;
  status: boolean;
  category: number;
  image?: string | null;
  photo_url?: string | null;
  photos?: { id: number; photo_url: string | null }[];
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
  table_count: number;     
  photos?: { id: number; photo_url: string }[];
  categories?: Category[];
  menus?: MenuItem[];
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  categoryName: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

function resolveImage(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function getCategoryEmoji(category?: string): string {
  const map: Record<string, string> = {
    pizza: '🍕', burger: '🍔', drink: '🥤', drinks: '🥤', coffee: '☕',
    dessert: '🍰', desserts: '🍰', soup: '🍜', salad: '🥗',
    starter: '🥗', starters: '🥗', food: '🍛', noodle: '🍜',
    noodles: '🍜', rice: '🍚', chicken: '🍗', fish: '🐟',
    sushi: '🍣', sandwich: '🥪', pasta: '🍝', bread: '🥖',
  };
  const key = (category ?? '').toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (key.includes(k)) return v;
  }
  return '🍽️';
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

function CartBar({ cart, onOpen }: { cart: CartItem[]; onOpen: () => void }) {
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + parseFloat(c.menuItem.price) * c.quantity, 0);
  if (totalItems === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pointer-events-none">
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

function TablePicker({ tableCount, selected, onSelect }: {
  tableCount: number;
  selected: number | null;
  onSelect: (n: number) => void;
}) {
  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))' }}>
      {tables.map((n) => (
        <button
          key={n}
          onClick={() => onSelect(n)}
          style={{
            padding: '10px 0',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            border: selected === n ? '2px solid #513012' : '1.5px solid rgba(184,147,106,0.4)',
            background: selected === n ? '#513012' : '#fdf6ec',
            color: selected === n ? '#fdf6ec' : '#513012',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function OrderDrawer({ cart, restaurant, token, onClose, onUpdateQty, onSuccess }: {
  cart: CartItem[];
  restaurant: Restaurant;
  token: string;
  onClose: () => void;
  onUpdateQty: (itemId: number, delta: number) => void;
  onSuccess: (tableNumber: number) => void;
}) {
  const [tableNumber, setTableNumber] = useState<number | null>(null);
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

    if (!tableNumber) {
      setError('Please select your table number before placing the order.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (!token) throw new Error('Invalid QR token. Please scan again.');
      if (!restaurant?.id) throw new Error('Restaurant not found.');

      const payload = {
        restaurant: restaurant.id,
        table_number: tableNumber,
        customer_name: name.trim() || 'Guest',
        customer_phone: phone.trim() || null,
        customer_email: email.trim() || null,
        notes: notes.trim() || null,
        items: cart.map((c) => ({ menu_id: c.menuItem.id, quantity: c.quantity })),
      };

      const res = await fetch(`${API}/api/v1/orders/?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      if (!res.ok) {
        let errorMsg = `Error ${res.status}`;
        try {
          const errJson = JSON.parse(responseText);
          if (errJson.detail) errorMsg = errJson.detail;
          else if (errJson.error) errorMsg = errJson.error;
          else if (errJson.non_field_errors) errorMsg = errJson.non_field_errors[0];
          else {
            const firstKey = Object.keys(errJson)[0];
            const firstVal = errJson[firstKey];
            errorMsg = `${firstKey}: ${Array.isArray(firstVal) ? firstVal[0] : firstVal}`;
          }
        } catch { errorMsg = responseText.slice(0, 200); }
        throw new Error(errorMsg);
      }

      onSuccess(tableNumber);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(30,15,2,0.55)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-y-auto"
        style={{ background: '#fffdf8', maxHeight: '90vh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#d4b896' }} />
        </div>

        <div className="px-5 pb-10 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between py-4">
            <h2 className="font-bold text-xl" style={{ color: 'secondary', fontFamily: 'Playfair Display, serif' }}>
              Your Order
            </h2>
            <button onClick={onClose} style={{ color: '#9a7458', fontSize: 22 }}>✕</button>
          </div>
          <OrnamentDivider />

          <div className="mt-4">
            {cart.map((c) => (
              <div
                key={c.menuItem.id}
                className="flex items-center justify-between gap-3 py-3"
                style={{ borderBottom: '1px dashed rgba(184,147,106,0.28)' }}
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'secondary' }}>{c.menuItem.name}</p>
                  <p className="text-xs" style={{ color: '#9a7458' }}>{c.categoryName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQty(c.menuItem.id, -1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                    style={{ background: '#f0e6d3', color: '#513012', border: 'none', cursor: 'pointer' }}
                  >−</button>
                  <span className="w-5 text-center font-bold text-sm" style={{ color: 'secondary' }}>{c.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(c.menuItem.id, 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                    style={{ background: '#513012', color: '#fdf6ec', border: 'none', cursor: 'pointer' }}
                  >+</button>
                </div>
                <span className="font-bold text-sm w-16 text-right" style={{ color: '#513012' }}>
                  Rs. {(parseFloat(c.menuItem.price) * c.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center py-4 mt-2">
            <span className="font-bold" style={{ color: 'secondary', fontFamily: 'Playfair Display, serif' }}>Total</span>
            <span className="font-bold text-xl" style={{ color: '#513012' }}>Rs. {totalPrice.toFixed(0)}</span>
          </div>
          <OrnamentDivider />

          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b8936a' }}>
                Select Your Table *
              </p>
              {tableNumber && (
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: '#513012', color: '#fdf6ec' }}
                >
                  Table {tableNumber} selected ✓
                </span>
              )}
            </div>

            {restaurant.table_count > 0 ? (
              <TablePicker
                tableCount={restaurant.table_count}
                selected={tableNumber}
                onSelect={setTableNumber}
              />
            ) : (
              <p className="text-sm text-center py-3" style={{ color: '#9a7458' }}>
                No tables configured. Please ask staff for help.
              </p>
            )}
          </div>

          <OrnamentDivider />

          <div className="mt-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b8936a' }}>
              Your Details (optional)
            </p>
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
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: '#fdf6ec',
                    border: '1px solid rgba(184,147,106,0.35)',
                    color: 'secondary',
                    fontFamily: 'Lato, sans-serif',
                  }}
                />
              </div>
            ))}
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#9a7458' }}>Special Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{
                  background: '#fdf6ec',
                  border: '1px solid rgba(184,147,106,0.35)',
                  color: 'secondary',
                  fontFamily: 'Lato, sans-serif',
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-3 text-sm text-center" style={{ color: '#c0392b' }}>{error}</p>
          )}

          {/* Place order button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || cart.length === 0 || !tableNumber}
            className="mt-6 w-full py-4 rounded-2xl font-bold text-base tracking-wide"
            style={{
              background: submitting || !tableNumber ? '#b8936a' : '#513012',
              color: '#fdf6ec',
              fontFamily: 'Lato, sans-serif',
              border: 'none',
              cursor: submitting || !tableNumber ? 'not-allowed' : 'pointer',
              opacity: !tableNumber ? 0.75 : 1,
            }}
          >
            {submitting
              ? 'Placing Order...'
              : !tableNumber
              ? 'Select a table to continue'
              : `Place Order · Table ${tableNumber} · Rs. ${totalPrice.toFixed(0)}`}
          </button>
        </div>
      </div>
    </>
  );
}

function OrderSuccess({
  restaurantName,
  tableNumber,
  onBack,
}: {
  restaurantName: string;
  tableNumber: number;
  onBack: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-8"
      style={{ background: '#fdf6ec', fontFamily: 'Lato, sans-serif' }}
    >
      <div className="text-7xl mb-6">🎉</div>
      <h2 className="font-bold text-3xl mb-1" style={{ color: '#513012', fontFamily: 'Playfair Display, serif' }}>
        Order Placed!
      </h2>
      <p className="text-base font-bold mb-3" style={{ color: '#b8936a' }}>Table {tableNumber}</p>
      <OrnamentDivider />
      <p className="text-sm mt-4 mb-8" style={{ color: '#9a7458' }}>
        Your order has been sent to {restaurantName}. Staff will serve you at Table {tableNumber} shortly.
      </p>
      <button
        onClick={onBack}
        className="px-8 py-3 rounded-2xl font-bold"
        style={{ background: '#513012', color: '#fdf6ec', border: 'none', cursor: 'pointer' }}
      >
        Back to Menu
      </button>
    </div>
  );
}

function MenuItemCard({ item, categoryName, qty, onAdd, onUpdate }: {
  item: MenuItem;
  categoryName: string;
  qty: number;
  onAdd: () => void;
  onUpdate: (delta: number) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const rawImage = item.image || item.photo_url || (item as any).photos?.[0]?.photo_url || null;
  const imageUrl = resolveImage(rawImage);
  const showImage = imageUrl && !imgError;

  return (
    <div className="menu-card rounded-2xl overflow-hidden flex flex-col" style={{ background: '#fffdf8' }}>
      {/* Image */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{ height: 130, background: 'linear-gradient(135deg, #fdf6ec 0%, #f0e6d3 100%)', flexShrink: 0 }}
      >
        {showImage ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 560px) 50vw, 300px"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{ fontSize: 44, lineHeight: 1 }}>{getCategoryEmoji(categoryName)}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3">
        <h4 className="menu-serif font-semibold leading-tight" style={{ fontSize: 14, color: 'secondary', marginBottom: 4 }}>
          {item.name}
        </h4>
        {item.description && (
          <p
            className="menu-serif italic leading-relaxed flex-1"
            style={{
              fontSize: 11, color: '#9a7458', marginBottom: 8,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}
          >
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto gap-1">
          <span className="font-bold menu-serif" style={{ fontSize: 15, color: '#513012' }}>
            Rs. {item.price}
          </span>
          {qty === 0 ? (
            <button onClick={onAdd} className="qty-btn add-btn">+</button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => onUpdate(-1)} className="qty-btn sub-btn">−</button>
              <span style={{ width: 20, textAlign: 'center', fontWeight: 700, fontSize: 13, color: 'secondary' }}>{qty}</span>
              <button onClick={() => onUpdate(1)} className="qty-btn add-btn">+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  if (!slug || slug === '_enterprise' || slug.startsWith('_')) {
    return null
  }

 


  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderedTable, setOrderedTable] = useState<number>(1);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    console.log('Slug from URL:', slug);
    console.log('Token from URL:', token);
  }, [slug, token]);

  useEffect(() => {
    const fetchMenu = async () => {
      console.log('QR Scan Debug:', { slug, token, tokenLength: token.length });

      if (!token) {
        setError('Token not found in URL.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${API}/api/v1/qr-menu/menu/?token=${encodeURIComponent(token)}`,
          { cache: 'no-store' },
        );

        console.log('Menu API Status:', res.status);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('Error from backend:', errData);
          throw new Error(errData.detail || `Invalid QR Code (${res.status})`);
        }
 
        const data = await res.json();
        console.log('✅ Menu Loaded Successfully');

        const restaurantData: Restaurant = data.restaurant ?? data;
        setRestaurant(restaurantData);
        const firstActive = restaurantData.categories?.find((c) => c.status !== false);
        if (firstActive) setActiveCategory(firstActive.name);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [slug, token, API]);

  const addToCart = (item: MenuItem, categoryName: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) return prev.map((c) => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: item, quantity: 1, categoryName }];
    });
  };

  const updateQty = (itemId: number, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.menuItem.id === itemId ? { ...c, quantity: c.quantity + delta } : c)
        .filter((c) => c.quantity > 0),
    );
  };

  const getQty = (itemId: number) => cart.find((c) => c.menuItem.id === itemId)?.quantity || 0;

  const getItemsForCategory = (category: Category): MenuItem[] => {
    if (category.menus && category.menus.length > 0) return category.menus.filter((i) => i.status !== false);
    if (restaurant?.menus && restaurant.menus.length > 0) return restaurant.menus.filter((i) => i.category === category.id && i.status !== false);
    return [];
  };

  if (loading) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Lato:wght@300;400;700&display=swap');`}</style>
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#fdf6ec' }}>
        <div className="w-12 h-12 rounded-full border-4 animate-spin" style={{ borderColor: '#b8936a', borderTopColor: 'transparent' }} />
        <p style={{ color: '#8a6040', fontSize: 15, fontFamily: 'Lato, sans-serif' }}>Loading menu...</p>
      </div>
    </>
  );

  if (error || !restaurant) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Lato:wght@300;400;700&display=swap');`}</style>
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: '#fdf6ec' }}>
        <div className="text-6xl mb-6">😕</div>
        <h1 className="font-bold text-3xl mb-3" style={{ color: '#513012', fontFamily: 'Playfair Display, serif' }}>Menu Unavailable</h1>
        <p style={{ color: '#a0856b' }}>{error || 'Something went wrong.'}</p>
        <p className="text-xs text-secondary mt-10">Please ask the restaurant staff for a new QR code.</p>
      </div>
    </>
  );

  if (orderSuccess) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Lato:wght@300;400;700&display=swap');`}</style>
      <OrderSuccess
        restaurantName={restaurant.name}
        tableNumber={orderedTable}
        onBack={() => { setOrderSuccess(false); setCart([]); }}
      />
    </>
  );

  const categories = restaurant.categories?.filter((c) => c.status !== false) || [];
  const coverPhoto = restaurant.photos?.[0]?.photo_url;

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        .menu-serif { font-family: 'Playfair Display', Georgia, serif; }
        .menu-sans  { font-family: 'Lato', sans-serif; }
        .paper-bg {
          background-color: #fdf6ec;
          background-image:
            radial-gradient(ellipse at 20% 0%, rgba(184,147,106,0.10) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 100%, rgba(81,48,18,0.07) 0%, transparent 55%);
          min-height: 100vh;
        }
        .menu-card {
          border: 1px solid rgba(184,147,106,0.2);
          box-shadow: 0 2px 12px rgba(81,48,18,0.07);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .menu-card:hover { box-shadow: 0 6px 24px rgba(81,48,18,0.14); transform: translateY(-2px); }
        .cat-pill {
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          border-radius: 999px; padding: 6px 16px; border: 1px solid #d4b896; color: #8a6040;
          background: transparent; transition: all 0.2s; white-space: nowrap; cursor: pointer;
        }
        .cat-pill.active { background: #513012; color: #fdf6ec; border-color: #513012; }
        .qty-btn {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 16px; transition: all 0.15s;
          cursor: pointer; border: none; flex-shrink: 0;
        }
        .add-btn { background: #513012; color: #fdf6ec; }
        .add-btn:hover { background: #7a4820; }
        .sub-btn { background: #f0e6d3; color: #513012; }
        .sub-btn:hover { background: #e8d5be; }
        .menu-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 480px) {
          .menu-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
      `}</style>

      <div className="paper-bg menu-sans" style={{ paddingBottom: 100 }}>

        {/* HERO */}
        <div className="relative">
          {coverPhoto && (
            <div className="relative w-full overflow-hidden" style={{ height: 210 }}>
              <Image src={coverPhoto} alt={restaurant.name} fill priority sizes="100vw" className="object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.05) 50%, #fdf6ec 100%)' }} />
            </div>
          )}
          <div className={`text-center px-5 ${coverPhoto ? '-mt-14 relative z-10' : 'pt-12'} pb-6`}>
            <div
              className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2d1600, #7a3f1a)' }}
            >
              <span className="text-4xl font-bold text-white menu-serif">{restaurant.name?.[0] || '?'}</span>
            </div>
            <h1 className="menu-serif font-bold leading-tight" style={{ fontSize: 'clamp(26px, 7vw, 38px)', color: 'secondary' }}>
              {restaurant.name}
            </h1>
            <div className="mt-3 mb-2 max-w-xs mx-auto"><OrnamentDivider /></div>
            {(restaurant.address || restaurant.city) && (
              <p className="text-sm" style={{ color: '#9a7458' }}>
                📍 {[restaurant.address, restaurant.city].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* CATEGORY NAV */}
        {categories.length > 0 && (
          <div
            className="sticky top-0 z-20 border-b"
            style={{ background: 'rgba(253,246,236,0.95)', backdropFilter: 'blur(8px)', borderColor: 'rgba(184,147,106,0.25)' }}
          >
            <div className="flex gap-2 px-4 py-3 overflow-x-auto max-w-2xl mx-auto" style={{ scrollbarWidth: 'none' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`cat-pill ${activeCategory === cat.name ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.name);
                    document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 sm:px-5 py-6 max-w-2xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {categories.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🥗</div>
              <p className="menu-serif italic text-xl" style={{ color: '#b8936a' }}>No menu items available yet.</p>
            </div>
          )}

          {categories.map((category) => {
            const items = getItemsForCategory(category);
            if (items.length === 0) return null;
            return (
              <div key={category.id} id={`cat-${category.id}`} style={{ scrollMarginTop: 60 }}>
                <div className="text-center mb-4">
                  <OrnamentDivider />
                  <h2 className="menu-serif font-bold mt-3 mb-1" style={{ fontSize: 22, color: 'secondary' }}>
                    {category.name}
                  </h2>
                  <OrnamentDivider />
                </div>
                <div className="menu-grid">
                  {items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      categoryName={category.name}
                      qty={getQty(item.id)}
                      onAdd={() => addToCart(item, category.name)}
                      onUpdate={(delta) => updateQty(item.id, delta)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {categories.length > 0 && (
            <div className="text-center pt-2 pb-6">
              <OrnamentDivider />
              <p className="uppercase tracking-widest font-bold mt-3" style={{ color: '#c9a87a', fontSize: 12 }}>
                {restaurant.name} • {restaurant.city}
              </p>
              <OrnamentDivider />
            </div>
          )}
        </div>
      </div>

      <CartBar cart={cart} onOpen={() => setDrawerOpen(true)} />

      {drawerOpen && (
        <OrderDrawer
          cart={cart}
          restaurant={restaurant}
          token={token}
          onClose={() => setDrawerOpen(false)}
          onUpdateQty={updateQty}
          onSuccess={(tableNum) => {
            setOrderedTable(tableNum);
            setDrawerOpen(false);
            setOrderSuccess(true);
          }}
        />
      )}
    </>
  );
}