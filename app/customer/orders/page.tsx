'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Clock, ChevronDown, ChevronUp,
  Phone, Mail, FileText, User, RefreshCw,UtensilsCrossed, Truck, ShoppingBag
} from 'lucide-react';

interface MenuPhoto {
  id: number;
  photo_url: string;
}

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: string;
  photos?: MenuPhoto[];
  seo?: { title?: string; description?: string };
}

interface OrderItem {
  id: number;
  menu: MenuItem | null;
  menu_name?: string;
  quantity: number;
  price_at_order: string;
  subtotal: string;
  notes?: string;
}

interface Order {
  id: number;
  restaurant?: number;
  restaurant_name?: string;
  table_number: number | null;
  status: string;
  status_display: string;
  total_price: string;
  items: OrderItem[];
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes: string;
  created_on: string;
  updated_on: string;
}


const STATUS_CONFIG: Record<string, { bg: string; color: string; icon: string; label: string }> = {
  pending:   { bg: '#fef3e2', color: '#b45309', icon: '⏳', label: 'Pending' },
  confirmed: { bg: '#eff6ff', color: '#1d4ed8', icon: '✅', label: 'Confirmed' },
  preparing: { bg: '#fdf4ff', color: '#7e22ce', icon: '👨‍🍳', label: 'Preparing' },
  ready:     { bg: '#f0fdf4', color: '#15803d', icon: '🎉', label: 'Ready' },
  delivered: { bg: '#f0faf4', color: '#16a34a', icon: '📦', label: 'Delivered' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', icon: '❌', label: 'Cancelled' },
};

const STATUS_FILTERS = [
  { value: '',          label: 'All Orders' },
  { value: 'pending',   label: '⏳ Pending' },
  { value: 'confirmed', label: '✅ Confirmed' },
  { value: 'preparing', label: '👨‍🍳 Preparing' },
  { value: 'ready',     label: '🎉 Ready' },
  { value: 'delivered', label: '📦 Delivered' },
  { value: 'cancelled', label: '❌ Cancelled' },
];


function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getItemName(item: OrderItem): string {
  return item.menu?.name ?? item.menu_name ?? `Item #${item.id}`;
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_CONFIG[order.status?.toLowerCase()] ?? { bg: '#f3f4f6', color: '#6b7280', icon: '📋', label: order.status };

  const isTableOrder = !!order.table_number;

  const lines           = (order.notes || '').split('\n');
  const addressLine     = lines.find(l => l.toLowerCase().startsWith('delivery address:'));
  const deliveryAddress = addressLine?.replace(/delivery address:\s*/i, '').trim();
  const otherNotes      = lines.filter(l => l !== addressLine).join('\n').trim();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Status bar */}
      <div className="h-1 w-full" style={{ background: s.color, opacity: 0.7 }} />

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
            style={{ background: s.bg }}>
            {s.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-gray-800 truncate">
                {order.restaurant_name || `Order #${order.id}`}
              </span>
              <span className="text-xs text-secondary font-mono shrink-0">#{order.id}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <div className="flex items-center gap-1 text-xs text-secondary">
                <Clock size={10} />
                {formatTime(order.created_on)}
              </div>
              {isTableOrder && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: '#fef3e2', color: '#b45309' }}>
                  🍽️ Table {order.table_number}
                </span>
              )}
              {!isTableOrder && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: '#f0faf4', color: '#16a34a' }}>
                  🚚 Delivery
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: s.bg, color: s.color }}>
              {s.label}
            </span>
            <p className="text-sm font-bold mt-1" style={{ color: '#513012' }}>
              Rs. {parseFloat(order.total_price || '0').toFixed(0)}
            </p>
          </div>
          <span className="text-secondary ml-1">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-5" style={{ background: '#fafafa' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Items */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#b8936a' }}>
                Order Items ({order.items.length})
              </p>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: '#513012', color: '#fff' }}>
                        {item.quantity}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-700 truncate">{getItemName(item)}</p>
                        {item.notes && (
                          <p className="text-xs text-secondary italic truncate">{item.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold shrink-0" style={{ color: '#513012' }}>
                      Rs. {parseFloat(item.subtotal || '0').toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-3"
                style={{ borderTop: '1px dashed rgba(184,147,106,0.4)' }}>
                <span className="text-sm font-bold text-gray-800">Total</span>
                <span className="font-bold text-base" style={{ color: '#513012' }}>
                  Rs. {parseFloat(order.total_price || '0').toFixed(0)}
                </span>
              </div>
            </div>

            {/* Info */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#b8936a' }}>
                {isTableOrder ? 'Table Info' : 'Delivery Info'}
              </p>
              <div className="space-y-2.5">
                {order.customer_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={13} className="text-secondary shrink-0" />
                    {order.customer_name}
                  </div>
                )}
                {order.customer_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={13} className="text-secondary shrink-0" />
                    {order.customer_phone}
                  </div>
                )}
                {order.customer_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={13} className="text-secondary shrink-0" />
                    {order.customer_email}
                  </div>
                )}
                {isTableOrder && (
                  <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl font-medium"
                    style={{ background: '#fef3e2', color: '#b45309' }}>
                    <UtensilsCrossed size={13} />
                    Dine-in · Table {order.table_number}
                  </div>
                )}
                {!isTableOrder && deliveryAddress && (
                  <div className="flex items-start gap-2 text-sm px-3 py-2 rounded-xl"
                    style={{ background: '#f0faf4', color: '#16a34a' }}>
                    <Truck size={13} className="shrink-0 mt-0.5" />
                    {deliveryAddress}
                  </div>
                )}
                {otherNotes && (
                  <div className="flex items-start gap-2 text-sm text-secondary">
                    <FileText size={13} className="text-secondary shrink-0 mt-0.5" />
                    <span className="italic">{otherNotes}</span>
                  </div>
                )}
              </div>

              {/* Status timeline */}
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid #f0ebe5' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#b8936a' }}>
                  Status
                </p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: s.bg }}>
                  <span className="text-base">{s.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: s.color }}>{s.label}</span>
                </div>
                <p className="text-xs text-secondary mt-1.5">
                  Last updated: {formatTime(order.updated_on)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerOrdersPage() {
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [refreshing,    setRefreshing]    = useState(false);
  const [statusFilter,  setStatusFilter]  = useState('');

  // Update page title with SEO
  useEffect(() => {
    document.title = 'My Orders | Order History';
  }, []);

  const fetchMyOrders = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      // Use /api/v1/my-orders/ — returns only current user's orders
      const params = new URLSearchParams({ page_size: '100' });
      if (statusFilter) params.set('status', statusFilter);

      const res = await apiFetch(`/api/v1/my-orders/?${params}`);

      if (res.status === 401) { setError('Session expired. Please log in again.'); return; }
      if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);

      const data  = await res.json();
      const raw   = data.data ?? data;
      const list: Order[] = Array.isArray(raw) ? raw : (raw.results ?? []);

      const sorted = [...list].sort(
        (a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
      );
      setOrders(sorted);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchMyOrders(); }, [fetchMyOrders]);

  const totalSpent   = orders.reduce((s, o) => s + parseFloat(o.total_price || '0'), 0);
  const activeOrders = orders.filter(o =>
    !['delivered', 'cancelled'].includes(o.status.toLowerCase())
  ).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#513012', borderTopColor: 'transparent' }} />
      <p className="text-sm text-secondary">Loading your orders…</p>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#513012', fontFamily: 'Georgia, serif' }}>
            My Orders
          </h1>
          <p className="text-sm text-secondary mt-0.5">Your complete order history</p>
        </div>
        <button
          onClick={() => fetchMyOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
          <button onClick={() => fetchMyOrders(true)} className="ml-auto underline">Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',   value: orders.length,                    color: '#513012' },
          { label: 'Active',  value: activeOrders,                     color: '#16a34a' },
          { label: 'Spent',   value: `Rs. ${totalSpent.toFixed(0)}`,   color: '#7e22ce' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-xs text-secondary uppercase tracking-widest">{label}</p>
            <p className="text-lg sm:text-xl font-bold mt-1 truncate" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={
              statusFilter === f.value
                ? { background: '#513012', color: '#fff' }
                : { background: '#f3f4f6', color: '#6b7280' }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed"
          style={{ borderColor: 'rgba(184,147,106,0.3)', background: '#fffdf8' }}>
          <ShoppingBag size={40} className="mb-3 opacity-30" style={{ color: '#513012' }} />
          <p className="font-medium" style={{ color: '#9a7458' }}>
            {statusFilter ? `No ${statusFilter} orders` : 'No orders yet'}
          </p>
          <p className="text-sm mt-1 text-secondary">
            {statusFilter ? 'Try a different filter' : 'Your orders will appear here'}
          </p>
          {statusFilter && (
            <button onClick={() => setStatusFilter('')}
              className="mt-3 text-xs underline" style={{ color: '#513012' }}>
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}