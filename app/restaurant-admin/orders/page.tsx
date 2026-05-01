"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, RefreshCw, AlertCircle, Calendar } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRequirePermission } from '@/hooks/usePermission';

interface OrderItem {
  id: number;
  menu_name: string;
  quantity: number;
  subtotal: string;
  notes: string;
}

interface Order {
  id: number;
  restaurant_name: string;
  status: string;
  status_display: string;
  total_price: string;
  items: OrderItem[];
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes: string;
  created_on: string;
}

const REFRESH_INTERVAL = 30000;
const STORAGE_KEY = 'qr_menu_token_data';

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", 
    day: "numeric",
    hour: "2-digit", 
    minute: "2-digit",
  });
}



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
  const [showTodayOnly, setShowTodayOnly] = useState(true); // Default: Today's orders

  useRequirePermission('viewOrders');

  const fetchOrders = useCallback(async (currentToken: string, isManual = false) => {
    if (!currentToken) return;
    if (isManual) setRefreshing(true);

    try {
      const res = await apiFetch(
        `/api/v1/orders/?token=${encodeURIComponent(currentToken)}&page_size=100`
      );

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }
      if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);

      const data = await res.json();
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

  // Initialize token and fetch orders
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

  // Auto-refresh
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => fetchOrders(token), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [token, fetchOrders]);

  // Filter orders for today
  const filteredOrders = useMemo(() => {
    if (!showTodayOnly) return orders;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    return orders.filter(order => {
      const orderDate = new Date(order.created_on).toISOString().split('T')[0];
      return orderDate === today;
    });
  }, [orders, showTodayOnly]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-[#513012] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading orders...</p>
      </div>
    );
  }

  if (error === 'NO_TOKEN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-6">
        <div className="text-6xl">📵</div>
        <h2 className="text-xl font-bold text-[#513012]">QR Token not found</h2>
        <p className="text-gray-500 text-sm max-w-sm">
          Please go to the QR Generator page first and generate a QR code.
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
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#513012]">Orders Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            {lastRefreshed
              ? `Last updated: ${lastRefreshed.toLocaleTimeString()} · Auto-refreshes every 30s`
              : "Loading..."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={showTodayOnly ? "default" : "outline"}
            onClick={() => setShowTodayOnly(true)}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Today's Orders
          </Button>

          <Button
            variant={!showTodayOnly ? "default" : "outline"}
            onClick={() => setShowTodayOnly(false)}
          >
            All Orders
          </Button>

          <Button
            onClick={() => fetchOrders(token, true)}
            disabled={refreshing || !token}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && error !== 'NO_TOKEN' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => fetchOrders(token, true)} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {showTodayOnly ? "Today's Orders" : "All Orders"} 
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredOrders.length})
              </span>
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">📋</div>
              <p className="font-medium">No orders found</p>
              <p className="text-sm mt-1">
                {showTodayOnly ? "No orders placed today yet." : "No orders available."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="py-3 px-4 font-medium">Order ID</th>
                    <th className="py-3 px-4 font-medium">Customer</th>
                    <th className="py-3 px-4 font-medium">Phone</th>
                    <th className="py-3 px-4 font-medium">Time</th>
                    <th className="py-3 px-4 font-medium">Items</th>
                    <th className="py-3 px-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 font-mono text-gray-500">#{order.id}</td>
                      <td className="py-4 px-4 font-medium">
                        {order.customer_name || "Guest"}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {order.customer_phone || "-"}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatTime(order.created_on)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-700">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                        {order.items.length > 0 && (
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {order.items[0].menu_name}
                            {order.items.length > 1 && ` +${order.items.length - 1} more`}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-[#513012]">
                        Rs. {parseFloat(order.total_price || "0").toFixed(0)}
                      </td>
                    
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}