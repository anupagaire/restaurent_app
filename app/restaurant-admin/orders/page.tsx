"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Clock, User, RefreshCw, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface OrderItem {
  id: number;
  menu: number;
  menu_name: string;
  quantity: number;
  price_at_order: string;
  subtotal: string;
  notes: string;
}

interface Order {
  id: number;
  restaurant: number;
  restaurant_name: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
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

const REFRESH_INTERVAL = 30000;
const STORAGE_KEY = 'qr_menu_token_data';

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "pending":   return "bg-yellow-100 text-yellow-700";
    case "confirmed": return "bg-blue-100 text-blue-700";
    case "preparing": return "bg-orange-100 text-orange-700";
    case "ready":     return "bg-green-100 text-green-700";
    case "delivered": return "bg-emerald-100 text-emerald-700";
    case "cancelled": return "bg-red-100 text-red-700";
    default:          return "bg-gray-100 text-gray-700";
  }
};

// ✅ NEVER generates new token — only reads from localStorage
// QR Generator page le save gareko token matra use garcha
function getStoredToken(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return '';
    const parsed = JSON.parse(saved);
    const url = parsed.frontendUrl || '';
    if (url.includes('token=')) {
      return new URL(url).searchParams.get('token') || '';
    }
  } catch {}
  return '';
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async (currentToken: string, isManual = false) => {
    if (!currentToken) return;
    if (isManual) setRefreshing(true);
    try {
      const res = await apiFetch(
        `/api/v1/orders/?token=${encodeURIComponent(currentToken)}&page_size=100`
      );
      if (res.status === 401) { setError("Session expired. Please log in again."); return; }
      if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);

      const data = await res.json();
      console.log('📦 Orders response:', JSON.stringify(data)); // ADD YO
      JSON.parse(localStorage.getItem('qr_menu_token_data'))
      const list: Order[] = Array.isArray(data) ? data : (data.results ?? []);
      list.sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime());
      setOrders(list);
      setError("");
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Init — localStorage bata token liyau, generate NAGARO
  useEffect(() => {
    const t = getStoredToken();
    if (t) {
      setToken(t);
      fetchOrders(t);
    } else {
      setError('NO_TOKEN');
      setLoading(false);
    }
  }, [fetchOrders]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => fetchOrders(token), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [token, fetchOrders]);

  const updateOrderStatus = async (orderId: number, newStatus: Order["status"]) => {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      const res = await apiFetch(
        `/api/v1/orders/${orderId}/?token=${encodeURIComponent(token)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
    } catch {
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Loading
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-10 h-10 border-4 border-[#513012] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">Loading orders...</p>
    </div>
  );

 // Token nai chhaina — QR page jaau
  if (error === 'NO_TOKEN') return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-6">
      <div className="text-6xl">📵</div>
      <h2 className="text-xl font-bold text-[#513012]">QR Token not found</h2>
      <p className="text-gray-500 text-sm max-w-sm">
        Please go to the QR Generator page first and generate a QR code. That will activate your token.
      </p>
      <a
        href="/dashboard/qr"
        className="mt-2 px-6 py-3 rounded-xl font-semibold text-white"
        style={{ background: '#513012' }}
      >
        Go to QR Generator →
      </a>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#513012]">Orders Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            {lastRefreshed
              ? `Last updated: ${lastRefreshed.toLocaleTimeString()} · Auto-refreshes every 30s`
              : "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Total: <span className="font-semibold text-[#513012]">{orders.length}</span>
          </span>
          <button
            onClick={() => fetchOrders(token, true)}
            disabled={refreshing || !token}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#513012]/20 hover:bg-[#513012]/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && error !== 'NO_TOKEN' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => fetchOrders(token, true)}
            className="ml-auto underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Orders */}
      <div className="grid gap-4 sm:gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="border-[#513012]/10 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-mono text-xs text-gray-500">#{order.id}</p>
                  <p className="text-base sm:text-lg font-semibold mt-1">
                    {order.customer_name || "Guest"}
                  </p>
                  {order.restaurant_name && (
                    <p className="text-xs text-gray-400">{order.restaurant_name}</p>
                  )}
                </div>
                <Badge className={`${getStatusColor(order.status)} text-xs`}>
                  {order.status_display || order.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{formatTime(order.created_on)}</span>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{order.customer_phone}</span>
                  </div>
                )}
                {order.customer_email && (
                  <div className="text-xs text-gray-400">{order.customer_email}</div>
                )}
                {order.notes && (
                  <div className="text-xs text-gray-500 italic sm:col-span-2">
                    Note: {order.notes}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Items Ordered:</p>
                <ul className="text-sm space-y-1 pl-5 list-disc">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.menu_name} × {item.quantity}
                      <span className="text-gray-400 ml-2">(Rs. {item.subtotal})</span>
                      {item.notes && (
                        <span className="text-xs text-gray-400 ml-1 italic">— {item.notes}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#513012]">
                    Rs. {parseFloat(order.total_price || "0").toFixed(0)}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-sm text-gray-600">Update Status:</span>
                  <Select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onValueChange={(value: Order["status"]) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      {updatingId === order.id
                        ? <span className="text-gray-400 text-sm">Updating...</span>
                        : <SelectValue />}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!error && orders.length === 0 && (
        <Card>
          <CardContent className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-medium">No orders yet</p>
            <p className="text-sm mt-1">Orders will appear here automatically</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}