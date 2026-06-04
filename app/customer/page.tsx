'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';   
import { apiFetch } from '@/lib/api';
import { ShoppingBag, User, ChevronRight, Truck, Clock, UtensilsCrossed } from 'lucide-react';

interface Order {
  id: number;
  restaurant_name: string;
  status: string;
  total_price: string;
  created_on: string;
  items?: { menu_name: string; quantity: number }[];
}

interface RestaurantVisit {
  name: string;
  orderCount: number;
  lastOrder: string;
  totalSpent: number;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#fef3e2', color: '#b45309', label: 'Pending' },
  confirmed: { bg: '#eff6ff', color: '#1d4ed8', label: 'Confirmed' },
  preparing: { bg: '#fdf4ff', color: '#7e22ce', label: 'Preparing' },
  ready:     { bg: '#f0fdf4', color: '#15803d', label: 'Ready' },
  delivered: { bg: '#f0faf4', color: '#16a34a', label: 'Delivered' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function CustomerDashboard() {
  const router = useRouter();

  // ── user comes from Context — no API call needed ──
  const { user, loading: userLoading } = useUser();

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res  = await apiFetch('/api/v1/my-orders/?page_size=50');
        const raw  = await res.json();
        const data = raw.data ?? raw;
        const list: Order[] = Array.isArray(data) ? data : (data.results ?? []);
        const sorted = [...list].sort(
          (a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
        );
        setAllOrders(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setOrdersLoading(false);
      }
    };
    loadOrders();
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalOrders  = allOrders.length;
  const totalSpent   = allOrders.reduce((s, o) => s + parseFloat(o.total_price || '0'), 0);
  const recentOrders = allOrders.slice(0, 4);

  const restaurantMap: Record<string, RestaurantVisit> = {};
  allOrders.forEach(o => {
    const name = o.restaurant_name || 'Unknown';
    if (!restaurantMap[name]) {
      restaurantMap[name] = { name, orderCount: 0, lastOrder: o.created_on, totalSpent: 0 };
    }
    restaurantMap[name].orderCount++;
    restaurantMap[name].totalSpent += parseFloat(o.total_price || '0');
    if (new Date(o.created_on) > new Date(restaurantMap[name].lastOrder)) {
      restaurantMap[name].lastOrder = o.created_on;
    }
  });
  const restaurants = Object.values(restaurantMap)
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 4);

  const firstName = user?.first_name || user?.email?.split('@')[0] || 'there';
  const loading   = userLoading || ordersLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: '#513012', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Hero */}
      <div
        className="rounded-3xl px-6 py-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e0f02 0%, #513012 60%, #7a4a20 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10" style={{ background: '#b8936a' }} />
        <div className="absolute -bottom-6 right-4 w-24 h-24 rounded-full opacity-10" style={{ background: '#fdf6ec' }} />
        <p className="text-sm font-medium mb-1" style={{ color: 'rgba(184,147,106,0.9)' }}>{greeting()},</p>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 capitalize" style={{ color: '#fdf6ec', fontFamily: 'Georgia, serif' }}>
          {firstName} 👋
        </h1>
        <p className="text-sm" style={{ color: 'rgba(253,246,236,0.6)' }}>
          {totalOrders > 0
            ? `You've placed ${totalOrders} order${totalOrders !== 1 ? 's' : ''} so far`
            : 'Welcome! Start exploring restaurants'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Orders', value: totalOrders,                    sub: 'All time', color: '#513012' },
          { label: 'Total Spent',  value: `Rs. ${totalSpent.toFixed(0)}`, sub: 'All time', color: '#16a34a' },
          { label: 'Restaurants',  value: restaurants.length,             sub: 'Visited',  color: '#1d4ed8' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/customer/orders',  icon: ShoppingBag, label: 'My Orders',  sub: 'View order history', bg: '#f0faf4', color: '#16a34a' },
          { href: '/customer/profile', icon: User,        label: 'My Profile', sub: 'Edit your details',  bg: '#eff6ff', color: '#1d4ed8' },
        ].map(({ href, icon: Icon, label, sub, bg, color }) => (
          <button key={href} onClick={() => router.push(href)}
            className="flex flex-col items-start p-5 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all text-left group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon size={18} color={color} />
            </div>
            <p className="font-bold text-sm" style={{ color: '#1e0f02' }}>{label}</p>
            <p className="text-xs mt-0.5 text-gray-400">{sub}</p>
            <ChevronRight size={13} className="mt-2 transition-transform group-hover:translate-x-1" style={{ color: '#b8936a' }} />
          </button>
        ))}
      </div>

      {/* Restaurants visited */}
      {restaurants.length > 0 && (
        <div>
          <h2 className="font-bold text-base mb-3" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>
            Restaurants You've Visited
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {restaurants.map(r => (
              <div key={r.name} className="bg-white rounded-2xl px-4 py-4 border border-gray-100 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#fdf6ec' }}>
                  <UtensilsCrossed size={18} color="#b8936a" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#1e0f02' }}>{r.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {r.orderCount} order{r.orderCount !== 1 ? 's' : ''} · Rs. {r.totalSpent.toFixed(0)} total
                  </p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">{formatTime(r.lastOrder)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>Recent Orders</h2>
          {allOrders.length > 4 && (
            <button onClick={() => router.push('/customer/orders')}
              className="text-xs font-semibold flex items-center gap-1" style={{ color: '#513012' }}>
              View all <ChevronRight size={12} />
            </button>
          )}
        </div>
        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed"
            style={{ borderColor: 'rgba(184,147,106,0.3)', background: '#fffdf8' }}>
            <ShoppingBag size={32} className="mb-3 opacity-30" style={{ color: '#513012' }} />
            <p className="text-sm font-medium" style={{ color: '#9a7458' }}>No orders yet</p>
            <p className="text-xs mt-1 text-gray-400">Your orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(order => {
              const s = STATUS_STYLES[order.status?.toLowerCase()] ?? { bg: '#f3f4f6', color: '#6b7280', label: order.status };
              return (
                <div key={order.id}
                  onClick={() => router.push('/customer/orders')}
                  className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 border border-gray-100 cursor-pointer hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#fdf6ec' }}>
                    <Truck size={16} color="#b8936a" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: '#1e0f02' }}>
                      {order.restaurant_name || `Order #${order.id}`}
                    </p>
                    <div className="flex items-center gap-1 text-xs mt-0.5 text-gray-400">
                      <Clock size={10} />
                      {formatTime(order.created_on)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                    <span className="text-sm font-bold" style={{ color: '#513012' }}>
                      Rs. {parseFloat(order.total_price || '0').toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}