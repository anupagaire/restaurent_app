// 'use client';

// import { useState, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { UtensilsCrossed } from 'lucide-react';
// import Image from "next/image";
// interface MenuItem {
//   id: string | number;
//   name: string;
//   description: string;
//   price: number;
//   image: string | null; 
//   category?: string;
// }

// interface Props {
//   menuItems: MenuItem[];
// }

// const cardVariant = {
//   hidden: { opacity: 0, y: 20, scale: 0.98 },
//   show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
// };

// const stagger = {
//   show: { transition: { staggerChildren: 0.06 } },
// };

// // ✅ Food emoji placeholders by category name (fallback when no image)
// function getCategoryEmoji(category?: string): string {
//   const map: Record<string, string> = {
//     pizza: '🍕', burger: '🍔', drink: '🥤', drinks: '🥤', coffee: '☕',
//     dessert: '🍰', desserts: '🍰', soup: '🍜', salad: '🥗', starter: '🥗',
//     starters: '🥗', sas: '🍽️', food: '🍛', noodle: '🍜', noodles: '🍜',
//     rice: '🍚', chicken: '🍗', fish: '🐟', sushi: '🍣', sandwich: '🥪',
//   };
//   const key = (category ?? '').toLowerCase();
//   for (const [k, v] of Object.entries(map)) {
//     if (key.includes(k)) return v;
//   }
//   return '🍽️';
// }

// function MenuCard({ item }: { item: MenuItem }) {
//   const [imgError, setImgError] = useState(false);
//   const showPlaceholder = !item.image || imgError;

//   return (
//     <motion.div
//       variants={cardVariant}
//       layout
//       className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#513012]/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
//     >
//       <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-[#fdf6ec] to-[#e8ddd0] flex items-center justify-center">
//         {showPlaceholder ? (
//           <span style={{ fontSize: 56 }}>{getCategoryEmoji(item.category)}</span>
//         ) : (
// <Image
//   src={item.image!}
//   alt={item.name}
//   fill
//   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
//   onError={() => setImgError(true)}
//   className="object-cover group-hover:scale-105 transition-transform duration-500"
// />





//         )}
//       </div>

//       <div className="p-5 flex flex-col flex-1">
//         <h3 className="font-semibold text-[15px] leading-tight text-gray-900 line-clamp-2">
//           {item.name}
//         </h3>

//         {item.description && (
//           <p className="text-xs text-gray-500 mt-3 line-clamp-3 flex-1">
//             {item.description}
//           </p>
//         )}

//         <div className="mt-auto pt-4 flex items-center justify-between">
//           <span className="font-bold text-xl text-[#513012]">
//             Rs. {item.price}
//           </span>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// export default function MenuSection({ menuItems }: Props) {
//   const [activeCategory, setActiveCategory] = useState('All');

//   const categories = useMemo(() => {
//     const cats = Array.from(new Set(menuItems.map(i => i.category ?? 'Other')));
//     return ['All', ...cats];
//   }, [menuItems]);

//   const filtered = useMemo(() => {
//     return menuItems.filter((item) =>
//       activeCategory === 'All' ? true : (item.category ?? 'Other') === activeCategory
//     );
//   }, [menuItems, activeCategory]);

//   return (
//     <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
//       <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

//         {/* Sidebar */}
//         <aside className="hidden lg:block w-72 shrink-0">
//           <div className="bg-white rounded-3xl border p-6 sticky top-24">
//             <h3 className="font-bold text-[#513012] mb-4 text-lg">Filters</h3>
//             <div className="space-y-2 mb-8">
//               <button
//                 onClick={() => setActiveCategory('All')}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
//                   activeCategory === 'All' ? 'bg-[#513012] text-white' : 'bg-gray-100 hover:bg-gray-200'
//                 }`}
//               >
//                 <UtensilsCrossed size={18} /> All
//               </button>
//             </div>

//             <h3 className="font-bold text-[#513012] mb-4 text-lg">Category</h3>
//             <div className="space-y-2">
//               {categories.map((cat) => (
//                 <button
//                   key={cat}
//                   onClick={() => setActiveCategory(cat)}
//                   className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
//                     activeCategory === cat ? 'bg-[#5D0565] text-white' : 'bg-gray-100 hover:bg-gray-200'
//                   }`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </aside>

//         <main className="flex-1 min-w-0">
//           <p className="text-sm text-gray-500 mb-6">{filtered.length} items found</p>
//           <motion.div
//             variants={stagger}
//             initial="hidden"
//             animate="show"
//             className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
//           >
//             <AnimatePresence mode="popLayout">
//               {filtered.map((item) => (
//                 <MenuCard key={item.id} item={item} />
//               ))}
//             </AnimatePresence>
//           </motion.div>
//         </main>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ShoppingCart, X, Plus, Minus } from 'lucide-react';
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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

interface Props {
  menuItems: MenuItem[];
  restaurantId: number;
}

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.06 } },
};

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

// ── Cart Bar ─────────────────────────────────────────────────
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
        <span className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
          style={{ background: '#b8936a' }}>
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

// ── Order Drawer ─────────────────────────────────────────────
function OrderDrawer({
  cart, restaurantId, onClose, onUpdateQty, onSuccess,
}: {
  cart: CartItem[];
  restaurantId: number;
  onClose: () => void;
  onUpdateQty: (itemId: string | number, delta: number) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        restaurant: restaurantId,
        customer_name: name.trim() || 'Guest',
        customer_phone: phone.trim() || null,
        customer_email: email.trim() || null,
        notes: notes.trim() || null,
        items: cart.map(c => ({ menu_id: c.item.id, quantity: c.quantity })),
      };

      const res = await fetch(`${BASE_URL}/api/v1/orders/`, {
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

      onSuccess();
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
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#d4b896' }} />
        </div>

        <div className="px-5 pb-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between py-4">
            <h2 className="font-bold text-xl" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>
              Your Order
            </h2>
            <button onClick={onClose} style={{ color: '#9a7458', fontSize: 22 }}>
              <X size={22} />
            </button>
          </div>

          {/* Cart items */}
          <div className="mt-2">
            {cart.map(c => (
              <div
                key={c.item.id}
                className="flex items-center justify-between gap-3 py-3"
                style={{ borderBottom: '1px dashed rgba(184,147,106,0.28)' }}
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: '#1e0f02' }}>{c.item.name}</p>
                  <p className="text-xs" style={{ color: '#9a7458' }}>{c.item.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQty(c.item.id, -1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: '#f0e6d3', color: '#513012', border: 'none', cursor: 'pointer' }}
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center font-bold text-sm" style={{ color: '#1e0f02' }}>
                    {c.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQty(c.item.id, 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: '#513012', color: '#fdf6ec', border: 'none', cursor: 'pointer' }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className="font-bold text-sm w-16 text-right" style={{ color: '#513012' }}>
                  Rs. {(c.item.price * c.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-4 mt-2">
            <span className="font-bold" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>Total</span>
            <span className="font-bold text-xl" style={{ color: '#513012' }}>Rs. {totalPrice.toFixed(0)}</span>
          </div>

          <hr style={{ borderColor: 'rgba(184,147,106,0.3)', marginBottom: 20 }} />

          {/* Customer details */}
          <div className="space-y-3">
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
                  onChange={e => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: '#fdf6ec', border: '1px solid rgba(184,147,106,0.35)', color: '#1e0f02' }}
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
                style={{ background: '#fdf6ec', border: '1px solid rgba(184,147,106,0.35)', color: '#1e0f02' }}
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-center" style={{ color: '#c0392b' }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || cart.length === 0}
            className="mt-6 w-full py-4 rounded-2xl font-bold text-base tracking-wide"
            style={{
              background: submitting ? '#b8936a' : '#513012',
              color: '#fdf6ec', border: 'none', cursor: 'pointer',
            }}
          >
            {submitting ? 'Placing Order...' : `Place Order · Rs. ${totalPrice.toFixed(0)}`}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Order Success ────────────────────────────────────────────
function OrderSuccess({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-8"
      style={{ background: '#fdf6ec' }}>
      <div className="text-7xl mb-6">🎉</div>
      <h2 className="font-bold text-3xl mb-3" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>
        Order Placed!
      </h2>
      <p className="text-sm mt-4 mb-8" style={{ color: '#9a7458' }}>
        Your order has been sent to the restaurant. Staff will serve you shortly.
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

// ── Menu Card ────────────────────────────────────────────────
function MenuCard({
  item, qty, onAdd, onUpdate,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onUpdate: (delta: number) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = !item.image || imgError;

  return (
    <motion.div
      variants={cardVariant}
      layout
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#513012]/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
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

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-[15px] leading-tight text-gray-900 line-clamp-2">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-gray-500 mt-3 line-clamp-3 flex-1">{item.description}</p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-bold text-xl text-[#513012]">Rs. {item.price}</span>

          {qty === 0 ? (
            <button
              onClick={onAdd}
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg transition-all hover:scale-110"
              style={{ background: '#513012', color: '#fff', border: 'none', cursor: 'pointer' }}
              aria-label="Add to cart"
            >
              <Plus size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdate(-1)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#f0e6d3', color: '#513012', border: 'none', cursor: 'pointer' }}
              >
                <Minus size={12} />
              </button>
              <span className="w-5 text-center font-bold text-sm" style={{ color: '#1e0f02' }}>
                {qty}
              </span>
              <button
                onClick={() => onUpdate(1)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#513012', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                <Plus size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main MenuSection ─────────────────────────────────────────
export default function MenuSection({ menuItems, restaurantId }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map(i => i.category ?? 'Other')));
    return ['All', ...cats];
  }, [menuItems]);

  const filtered = useMemo(() => {
    return menuItems.filter(item =>
      activeCategory === 'All' ? true : (item.category ?? 'Other') === activeCategory
    );
  }, [menuItems, activeCategory]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQty = (itemId: string | number, delta: number) => {
    setCart(prev =>
      prev.map(c => c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c)
        .filter(c => c.quantity > 0)
    );
  };

  const getQty = (itemId: string | number) =>
    cart.find(c => c.item.id === itemId)?.quantity || 0;

  if (orderSuccess) {
    return (
      <OrderSuccess onBack={() => { setOrderSuccess(false); setCart([]); }} />
    );
  }

  return (
    <>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10" style={{ paddingBottom: cart.length > 0 ? 120 : 40 }}>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

          {/* Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-3xl border p-6 sticky top-24">
              <h3 className="font-bold text-[#513012] mb-4 text-lg">Filters</h3>
              <div className="space-y-2 mb-8">
                <button
                  onClick={() => setActiveCategory('All')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    activeCategory === 'All' ? 'bg-[#513012] text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <UtensilsCrossed size={18} /> All
                </button>
              </div>

              <h3 className="font-bold text-[#513012] mb-4 text-lg">Category</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      activeCategory === cat ? 'bg-[#5D0565] text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Mobile category pills */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 lg:hidden" style={{ scrollbarWidth: 'none' }}>
              {categories.map(cat => (
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
                {filtered.map(item => (
                  <MenuCard
                    key={item.id}
                    item={item}
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

      {/* Cart bar */}
      <CartBar cart={cart} onOpen={() => setDrawerOpen(true)} />

      {/* Order drawer */}
      {drawerOpen && (
        <OrderDrawer
          cart={cart}
          restaurantId={restaurantId}
          onClose={() => setDrawerOpen(false)}
          onUpdateQty={updateQty}
          onSuccess={() => { setDrawerOpen(false); setOrderSuccess(true); }}
        />
      )}
    </>
  );
}