'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { ShoppingBag, User, ChevronRight, Truck, Clock } from 'lucide-react';

interface Order {
  id: number;
  restaurant_name: string;
  status: string;
  total_price: string;
  created_on: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#fef3e2', color: '#b45309' },
  confirmed: { bg: '#eff6ff', color: '#1d4ed8' },
  preparing: { bg: '#fdf4ff', color: '#7e22ce' },
  ready:     { bg: '#f0fdf4', color: '#15803d' },
  delivered: { bg: '#f0faf4', color: '#16a34a' },
  cancelled: { bg: '#fef2f2', color: '#dc2626' },
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [user,         setUser]         = useState<{ first_name: string; email: string } | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, ordersRes] = await Promise.all([
          apiFetch('/api/v1/user/me/'),
          apiFetch('/api/v1/orders/?page_size=3'),
        ]);
        const me     = await meRes.json();
        const orders = await ordersRes.json();
        setUser(me);
        const list: Order[] = Array.isArray(orders) ? orders : (orders.results ?? []);
        setRecentOrders(
          list
            .filter(o => !o.hasOwnProperty('table_number') || !o['table_number' as keyof Order])
            .sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime())
            .slice(0, 3),
        );
      } catch {
        // silently fail — layout will redirect if auth is broken
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.first_name || user?.email?.split('@')[0] || 'there';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: '#513012', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Welcome card ──────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl px-8 py-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e0f02 0%, #513012 60%, #7a4a20 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
          style={{ background: '#b8936a' }} />
        <div className="absolute -bottom-6 -right-4 w-24 h-24 rounded-full opacity-10"
          style={{ background: '#fdf6ec' }} />

        <p className="text-sm font-medium mb-1" style={{ color: 'rgba(184,147,106,0.9)' }}>
          {greeting()},
        </p>
        <h1
          className="text-3xl font-bold mb-3 capitalize"
          style={{ color: '#fdf6ec', fontFamily: 'Georgia, serif' }}
        >
          {firstName} 👋
        </h1>
        <p className="text-sm" style={{ color: 'rgba(253,246,236,0.6)' }}>
          What would you like to do today?
        </p>
      </div>

      {/* ── Quick links ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            href:    '/customer/orders',
            icon:    ShoppingBag,
            label:   'My Orders',
            sub:     'View order history',
            iconBg:  '#f0faf4',
            iconColor: '#16a34a',
          },
          {
            href:    '/customer/profile',
            icon:    User,
            label:   'Profile',
            sub:     'Edit your details',
            iconBg:  '#eff6ff',
            iconColor: '#1d4ed8',
          },
        ].map(({ href, icon: Icon, label, sub, iconBg, iconColor }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className="flex flex-col items-start p-5 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all text-left group"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: iconBg }}
            >
              <Icon size={20} color={iconColor} />
            </div>
            <p className="font-bold text-sm" style={{ color: '#1e0f02' }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9a7458' }}>{sub}</p>
            <ChevronRight
              size={14}
              className="mt-3 transition-transform group-hover:translate-x-1"
              style={{ color: '#b8936a' }}
            />
          </button>
        ))}
      </div>

      {/* ── Recent orders ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base" style={{ color: '#1e0f02', fontFamily: 'Georgia, serif' }}>
            Recent Orders
          </h2>
          <button
            onClick={() => router.push('/customer/orders')}
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: '#513012' }}
          >
            View all <ChevronRight size={12} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed"
            style={{ borderColor: 'rgba(184,147,106,0.3)', background: '#fffdf8' }}
          >
            <ShoppingBag size={32} className="mb-3 opacity-30" style={{ color: '#513012' }} />
            <p className="text-sm font-medium" style={{ color: '#9a7458' }}>No orders yet</p>
            <p className="text-xs mt-1" style={{ color: '#b8936a' }}>
              Your orders will appear here after you place one
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(order => {
              const s = STATUS_STYLES[order.status.toLowerCase()] ?? { bg: '#f3f4f6', color: '#6b7280' };
              return (
                <div
                  key={order.id}
                  onClick={() => router.push('/customer/orders')}
                  className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 border border-gray-100 cursor-pointer hover:shadow-sm transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: '#fdf6ec' }}
                  >
                    <Truck size={18} color="#b8936a" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: '#1e0f02' }}>
                      {order.restaurant_name || `Order #${order.id}`}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: '#9a7458' }}>
                      <Clock size={10} />
                      {formatTime(order.created_on)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {order.status}
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