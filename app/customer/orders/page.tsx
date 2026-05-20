'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Clock, Truck, ChevronDown, ChevronUp,
  Phone, Mail, FileText, User, RefreshCw, Package
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: number;
  menu_name: string;
  quantity: number;
  subtotal: string;
  notes?: string;
}

interface Order {
  id: number;
  restaurant_name: string;
  status: string;
  status_display: string;
  total_price: string;
  items: OrderItem[];
  table_number: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes: string;
  created_on: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function isOnlineOrder(order: Order): boolean {
  return !order.table_number || order.table_number === 0;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: '#fef3e2', color: '#b45309', label: 'Pending' },
  confirmed:  { bg: '#eff6ff', color: '#1d4ed8', label: 'Confirmed' },
  preparing:  { bg: '#fdf4ff', color: '#7e22ce', label: 'Preparing' },
  ready:      { bg: '#f0fdf4', color: '#15803d', label: 'Ready' },
  delivered:  { bg: '#f0faf4', color: '#16a34a', label: 'Delivered' },
  cancelled:  { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status.toLowerCase()] ?? { bg: '#f3f4f6', color: '#6b7280', label: status };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}


function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  const lines = (order.notes || '').split('\n');
  const addressLine = lines.find(l => l.toLowerCase().startsWith('delivery address:'));
  const deliveryAddress = addressLine?.replace(/delivery address:\s*/i, '').trim();
  const otherNotes = lines.filter(l => l !== addressLine).join('\n').trim();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
   
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: '#f0faf4' }}>
            <Truck size={18} color="#16a34a" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-800">
                {order.restaurant_name}
              </span>
              <span className="text-xs text-gray-400 font-mono">#{order.id}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
              <Clock size={10} />
              {formatTime(order.created_on)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <span className="font-bold text-sm" style={{ color: '#513012' }}>
            Rs. {parseFloat(order.total_price || '0').toFixed(0)}
          </span>
          <span className="text-gray-400">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: '#b8936a' }}>Order Items</p>
              <div className="space-y-2.5">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: '#513012', color: '#fff' }}>
                        {item.quantity}
                      </span>
                      <span className="text-sm text-gray-700">{item.menu_name}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: '#513012' }}>
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

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: '#b8936a' }}>Delivery Info</p>
              <div className="space-y-2.5">
                {order.customer_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={13} className="text-gray-400 shrink-0" />
                    {order.customer_name}
                  </div>
                )}
                {order.customer_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={13} className="text-gray-400 shrink-0" />
                    {order.customer_phone}
                  </div>
                )}
                {order.customer_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={13} className="text-gray-400 shrink-0" />
                    {order.customer_email}
                  </div>
                )}
                {deliveryAddress && (
                  <div className="flex items-start gap-2 text-sm px-3 py-2 rounded-xl mt-1"
                    style={{ background: '#f0faf4', color: '#16a34a' }}>
                    <Truck size={13} className="shrink-0 mt-0.5" />
                    {deliveryAddress}
                  </div>
                )}
                {otherNotes && (
                  <div className="flex items-start gap-2 text-sm text-gray-500">
                    <FileText size={13} className="text-gray-400 shrink-0 mt-0.5" />
                    <span className="italic">{otherNotes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyOrders = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      // ✅ Fetch only THIS customer's orders
      // The API uses the auth token from the logged-in user session
      // so it returns only their own orders automatically
      const res = await apiFetch('/api/v1/orders/my-orders/?page_size=100');

      if (res.status === 401) {
        setError('Session expired. Please log in again.');
        return;
      }
      if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);

      const data = await res.json();
      const list: Order[] = Array.isArray(data) ? data : (data.results ?? []);

      // ✅ Filter: online orders only (no table orders)
      const onlineOnly = list
        .filter(isOnlineOrder)
        .sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime());

      setOrders(onlineOnly);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchMyOrders(); }, [fetchMyOrders]);

  const totalSpent = orders.reduce((s, o) => s + parseFloat(o.total_price || '0'), 0);
  const activeOrders = orders.filter(o =>
    !['delivered', 'cancelled'].includes(o.status.toLowerCase())
  ).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <div className="w-8 h-8 border-4 border-[#513012] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading your orders...</p>
    </div>
  );

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#513012]">My Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your online delivery order history</p>
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

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
          <button onClick={() => fetchMyOrders(true)} className="ml-auto underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Orders', value: orders.length, color: '#513012' },
          { label: 'Active', value: activeOrders, color: '#16a34a' },
          { label: 'Total Spent', value: `Rs. ${totalSpent.toFixed(0)}`, color: '#7e22ce' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-xl font-bold mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Package size={48} className="mb-4 opacity-30" />
          <p className="font-medium">No online orders yet</p>
          <p className="text-sm mt-1">Your delivery orders will appear here</p>
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