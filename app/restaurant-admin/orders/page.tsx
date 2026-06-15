
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock, User, RefreshCw, AlertCircle, Calendar,
  Truck, UtensilsCrossed, ChevronDown, ChevronUp, Phone, Mail, FileText,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRequirePermission } from "@/hooks/usePermission";
import SubscriptionGuard from '@/components/restaurant-admin/SubscriptionGuard';

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

const REFRESH_INTERVAL = 30_000;
type TabType = "all" | "online" | "table";

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  pending:    { label: "Pending",     bg: "#fef9c3", color: "#854d0e", border: "rgba(133,77,14,0.3)" },
  confirmed:  { label: "Confirmed",   bg: "#dbeafe", color: "#1d4ed8", border: "rgba(29,78,216,0.3)" },
  preparing:  { label: "Preparing",   bg: "#fef3c7", color: "#b45309", border: "rgba(180,83,9,0.3)"  },
  ready:      { label: "Ready",       bg: "#d1fae5", color: "#065f46", border: "rgba(6,95,70,0.3)"   },
  delivered:  { label: "Delivered",   bg: "#f0fdf4", color: "#16a34a", border: "rgba(22,163,74,0.3)" },
  cancelled:  { label: "Cancelled",   bg: "#fee2e2", color: "#991b1b", border: "rgba(153,27,27,0.3)" },
};

// Next valid status transitions
const STATUS_FLOW: Record<string, string[]> = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready:     ["delivered"],
  delivered: [],
  cancelled: [],
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

async function fetchQRToken(): Promise<string> {
  try {
    const res = await apiFetch("/api/v1/menu-tokens/my_tokens/");
    if (!res.ok) return "";
    const data = await res.json();
    const list: { id: number; is_active: boolean }[] =
      Array.isArray(data) ? data : (data.results ?? []);
    const active = list.find((t) => t.is_active) ?? list[0];
    if (!active) return "";
    const savedUrl = localStorage.getItem(`qr_token_url_${active.id}`);
    if (savedUrl?.includes("token=")) {
      const token = new URL(savedUrl).searchParams.get("token");
      if (token) return token;
    }
    return String(active.id);
  } catch {
    return "";
  }
}

function isOnlineOrder(order: Order): boolean {
  return !order.table_number || order.table_number === 0;
}

function dedupeOrders(orders: Order[]): Order[] {
  const seen = new Set<number>();
  return orders.filter(o => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: "#f3f4f6", color: "#374151", border: "rgba(0,0,0,0.1)" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Status Changer ───────────────────────────────────────────────────────────
function StatusChanger({
  order,
  onStatusChanged,
}: {
  order: Order;
  onStatusChanged: (orderId: number, newStatus: string) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const nextStatuses = STATUS_FLOW[order.status] ?? [];

  if (nextStatuses.length === 0) {
    return (
      <div className="mt-3 flex items-center gap-2">
        <StatusBadge status={order.status} />
        <span className="text-xs text-secondary italic">No further actions</span>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    setError("");
    try {
      const res = await apiFetch(`/api/v1/orders/${order.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || `Failed (${res.status})`);
      }
      onStatusChanged(order.id, newStatus);
    } catch (e: any) {
      setError(e.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mt-3">
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#b8936a" }}>
        Update Status
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={order.status} />
        <span className="text-gray-300 text-sm">→</span>
        {nextStatuses.map((s) => {
          const cfg = STATUS_CONFIG[s] ?? { label: s, bg: "#513012", color: "#fff", border: "transparent" };
          const isDanger = s === "cancelled";
          return (
            <button
              key={s}
              disabled={updating}
              onClick={(e) => { e.stopPropagation(); handleStatusChange(s); }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: isDanger ? "#fee2e2" : cfg.bg,
                color: isDanger ? "#991b1b" : cfg.color,
                border: `1.5px solid ${isDanger ? "rgba(153,27,27,0.4)" : cfg.border}`,
                opacity: updating ? 0.6 : 1,
                cursor: updating ? "not-allowed" : "pointer",
              }}
            >
              {updating ? "..." : `→ ${cfg.label}`}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Order Type Badge ─────────────────────────────────────────────────────────
function OrderTypeBadge({ order }: { order: Order }) {
  if (isOnlineOrder(order)) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
        style={{ background: "#f0faf4", color: "#16a34a", border: "1px solid rgba(34,197,94,0.3)" }}
      >
        <Truck size={10} /> Online
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: "#fef3e2", color: "#b45309", border: "1px solid rgba(180,83,9,0.25)" }}
    >
      <UtensilsCrossed size={10} /> Table {order.table_number}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1"
      style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9ca3af" }}>{label}</p>
      <p className="text-3xl font-bold" style={{ color: accent }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: "#b8936a" }}>{sub}</p>}
    </div>
  );
}

// ─── Expandable Order Row ─────────────────────────────────────────────────────
function OrderRow({
  order,
  onStatusChanged,
}: {
  order: Order;
  onStatusChanged: (orderId: number, newStatus: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const online = isOnlineOrder(order);

  const lines = (order.notes || "").split("\n");
  const addressLine = lines.find((l) => l.toLowerCase().startsWith("delivery address:"));
  const deliveryAddress = addressLine?.replace(/delivery address:\s*/i, "").trim();
  const otherNotes = lines.filter((l) => l !== addressLine).join("\n").trim();

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <td className="py-4 px-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-sm text-secondary">#{order.id}</span>
            <OrderTypeBadge order={order} />
          </div>
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: online ? "#f0faf4" : "#fef3e2", color: online ? "#16a34a" : "#b45309" }}
            >
              {online ? <Truck size={13} /> : <UtensilsCrossed size={13} />}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">{order.customer_name || "Guest"}</p>
              {order.customer_phone && (
                <p className="text-xs text-secondary flex items-center gap-1">
                  <Phone size={9} /> {order.customer_phone}
                </p>
              )}
            </div>
          </div>
        </td>

        <td className="py-4 px-4">
          {online ? (
            <div className="text-sm" style={{ color: "#16a34a" }}>
              <p className="font-medium">🚚 Delivery</p>
              {deliveryAddress && (
                <p className="text-xs text-secondary truncate max-w-[160px]">{deliveryAddress}</p>
              )}
            </div>
          ) : (
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold"
              style={{ background: "#fef3e2", color: "#b45309" }}
            >
              <UtensilsCrossed size={12} />
              Table {order.table_number}
            </div>
          )}
        </td>

        <td className="py-4 px-4">
          {/* Status badge in table row */}
          <StatusBadge status={order.status} />
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-1.5 text-sm text-secondary">
            <Clock size={12} />
            {formatTime(order.created_on)}
          </div>
        </td>

        <td className="py-4 px-4">
          <p className="text-sm text-gray-700 font-medium">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </p>
          {order.items.length > 0 && (
            <p className="text-xs text-secondary truncate max-w-[180px]">
              {order.items[0].menu_name}
              {order.items.length > 1 && ` +${order.items.length - 1} more`}
            </p>
          )}
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center justify-end gap-3">
            <span className="font-bold text-base" style={{ color: "#513012" }}>
              Rs. {parseFloat(order.total_price || "0").toFixed(0)}
            </span>
            <span className="text-secondary">
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </span>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr style={{ background: online ? "#f8fff9" : "#fffbf5" }}>
          <td colSpan={7} className="px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Items */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#b8936a" }}>
                  Order Items
                </p>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: "#513012", color: "#fff" }}
                        >
                          {item.quantity}
                        </span>
                        <span className="text-sm text-gray-700">{item.menu_name}</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: "#513012" }}>
                        Rs. {parseFloat(item.subtotal || "0").toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className="flex justify-between items-center mt-4 pt-3"
                  style={{ borderTop: "1px dashed rgba(184,147,106,0.35)" }}
                >
                  <span className="text-sm font-bold text-gray-800">Total</span>
                  <span className="font-bold text-base" style={{ color: "#513012" }}>
                    Rs. {parseFloat(order.total_price || "0").toFixed(0)}
                  </span>
                </div>

                {/* ✅ Status changer — inline in expanded row */}
                <StatusChanger order={order} onStatusChanged={onStatusChanged} />
              </div>

              {/* Customer / delivery info */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#b8936a" }}>
                  {online ? "Delivery Info" : "Table Info"}
                </p>
                {order.customer_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={13} className="shrink-0 text-secondary" />
                    {order.customer_name}
                  </div>
                )}
                {order.customer_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={13} className="shrink-0 text-secondary" />
                    {order.customer_phone}
                  </div>
                )}
                {order.customer_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={13} className="shrink-0 text-secondary" />
                    {order.customer_email}
                  </div>
                )}
                {online && deliveryAddress && (
                  <div
                    className="flex items-start gap-2 text-sm px-3 py-2 rounded-xl"
                    style={{ background: "#f0faf4", color: "#16a34a" }}
                  >
                    <Truck size={13} className="shrink-0 mt-0.5" />
                    <span>{deliveryAddress}</span>
                  </div>
                )}
                {!online && (
                  <div
                    className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl font-bold"
                    style={{ background: "#fef3e2", color: "#b45309" }}
                  >
                    <UtensilsCrossed size={13} />
                    Dine-in · Table {order.table_number}
                  </div>
                )}
                {otherNotes && (
                  <div className="flex items-start gap-2 text-sm text-secondary">
                    <FileText size={13} className="shrink-0 mt-0.5 text-secondary" />
                    <span className="italic">{otherNotes}</span>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [token,         setToken]         = useState<string>("");
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshing,    setRefreshing]    = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(true);
  const [activeTab,     setActiveTab]     = useState<TabType>("all");

  useRequirePermission("viewOrders");
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

const monthlyOrders = orders.filter(o => {
  const d = new Date(o.created_on);
  return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
});

const monthlyRevenue = monthlyOrders.reduce((s, o) => s + parseFloat(o.total_price || '0'), 0);
  // ✅ Status update handler — updates local state without refetch
  const handleStatusChanged = useCallback((orderId: number, newStatus: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, status: newStatus, status_display: STATUS_CONFIG[newStatus]?.label ?? newStatus }
          : o
      )
    );
  }, []);

  const fetchOrders = useCallback(async (currentToken: string, isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const results: Order[] = [];

      if (currentToken) {
        try {
          const tokenRes = await apiFetch(
            `/api/v1/admin/orders/?token=${encodeURIComponent(currentToken)}&page_size=100`,
          );
          if (tokenRes.ok) {
            const data = await tokenRes.json();
            const list: Order[] = Array.isArray(data) ? data : (data.results ?? []);
            results.push(...list);
          }
        } catch { /* silent */ }
      }

      try {
        const jwtRes = await apiFetch(`/api/v1/admin/orders/?page_size=100`);
        if (jwtRes.ok) {
          const data = await jwtRes.json();
          const list: Order[] = Array.isArray(data) ? data : (data.results ?? []);
          results.push(...list);
        } else if (jwtRes.status === 401) {
          setError("Session expired. Please log in again.");
          return;
        }
      } catch { /* silent */ }

      if (results.length === 0 && !currentToken) {
        setError("NO_TOKEN");
        return;
      }

      const merged = dedupeOrders(results).sort(
        (a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime(),
      );

      setOrders(merged);
      setError("");
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQRToken().then((t) => {
      setToken(t);
      fetchOrders(t);
    });
  }, [fetchOrders]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => fetchOrders(token), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [token, fetchOrders]);

  const todayOrders = useMemo(() => {
    if (!showTodayOnly) return orders;
    const today = new Date().toISOString().split("T")[0];
    return orders.filter((o) => new Date(o.created_on).toISOString().split("T")[0] === today);
  }, [orders, showTodayOnly]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "online") return todayOrders.filter(isOnlineOrder);
    if (activeTab === "table")  return todayOrders.filter((o) => !isOnlineOrder(o));
    return todayOrders;
  }, [todayOrders, activeTab]);

  const onlineCount   = todayOrders.filter(isOnlineOrder).length;
  const tableCount    = todayOrders.filter((o) => !isOnlineOrder(o)).length;
  const totalRevenue  = todayOrders.reduce((s, o) => s + parseFloat(o.total_price || "0"), 0);
  const onlineRevenue = todayOrders.filter(isOnlineOrder).reduce((s, o) => s + parseFloat(o.total_price || "0"), 0);
  const tableRevenue  = todayOrders.filter((o) => !isOnlineOrder(o)).reduce((s, o) => s + parseFloat(o.total_price || "0"), 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      <p className="text-secondary text-sm">Loading orders...</p>
    </div>
  );

  return (
    <SubscriptionGuard>
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Orders Management</h1>
            <p className="text-secondary text-sm mt-1">
              {lastRefreshed
                ? `Last updated: ${lastRefreshed.toLocaleTimeString()} · Auto-refreshes every 30s`
                : "Loading..."}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={showTodayOnly ? "default" : "outline"}
              onClick={() => setShowTodayOnly(true)}
              className="flex items-center gap-2 text-sm"
              style={showTodayOnly ? { background: "#513012" } : {}}
            >
              <Calendar className="w-4 h-4" /> Today
            </Button>
            <Button
              variant={!showTodayOnly ? "default" : "outline"}
              onClick={() => setShowTodayOnly(false)}
              className="text-sm"
              style={!showTodayOnly ? { background: "#513012" } : {}}
            >
              All Orders
            </Button>
            <Button
              onClick={() => fetchOrders(token, true)}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && error !== "NO_TOKEN" && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
            <button onClick={() => fetchOrders(token, true)} className="ml-auto underline">Retry</button>
          </div>
        )}

        {!token && (
          <div className="flex items-center gap-3 p-4 bg-accent border border-accent rounded-xl text-accent text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>QR token not found — table orders won't appear. <a href="/dashboard/qr" className="underline font-semibold">Generate a QR code →</a></span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard label="Total Orders"  value={todayOrders.length} sub={`Rs. ${totalRevenue.toFixed(0)}`}  accent="#513012" />
          <StatCard label="Online Orders" value={onlineCount}         sub={`Rs. ${onlineRevenue.toFixed(0)}`} accent="#16a34a" />
          <StatCard label="Table Orders"  value={tableCount}          sub={`Rs. ${tableRevenue.toFixed(0)}`}  accent="#b45309" />
          <StatCard label="Today Revenue"   value={`Rs. ${totalRevenue.toFixed(0)}`}   sub={`${todayOrders.length} orders`}   accent="#513012" />
<StatCard label="Monthly Revenue" value={`Rs. ${monthlyRevenue.toFixed(0)}`} sub={`${monthlyOrders.length} orders`} accent="#7e22ce" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: "#f3f4f6" }}>
          {(
            [
              { key: "all",    label: "All",             icon: null },
              { key: "online", label: "Online",          icon: <Truck size={13} /> },
              { key: "table",  label: "Table / Dine-in", icon: <UtensilsCrossed size={13} /> },
            ] as { key: TabType; label: string; icon: React.ReactNode }[]
          ).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={
                activeTab === key
                  ? {
                      background: key === "online" ? "#16a34a" : key === "table" ? "#b45309" : "#513012",
                      color: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    }
                  : { color: "#6b7280" }
              }
            >
              {icon} {label}
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: activeTab === key ? "rgba(255,255,255,0.2)" : "secondary",
                  color: activeTab === key ? "#fff" : "#374151",
                }}
              >
                {key === "all" ? todayOrders.length : key === "online" ? onlineCount : tableCount}
              </span>
            </button>
          ))}
        </div>

        {/* Orders table */}
        <Card style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {activeTab === "all" ? "All Orders" : activeTab === "online" ? "🚚 Online Orders" : "🍽️ Table Orders"}
                <span className="text-sm font-normal text-secondary ml-2">({filteredOrders.length})</span>
              </h2>
              <p className="text-xs text-secondary">Click a row to expand · Change status in expanded view</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 text-secondary">
                <div className="text-5xl mb-4">
                  {activeTab === "online" ? "🚚" : activeTab === "table" ? "🍽️" : "📋"}
                </div>
                <p className="font-medium">No orders found</p>
                <p className="text-sm mt-1">
                  {showTodayOnly ? "No orders placed today yet." : "No orders available."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                      <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Order</th>
                      <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Customer</th>
                      <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Location</th>
                      <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Status</th>
                      <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Time</th>
                      <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Items</th>
                      <th className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider text-secondary">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredOrders.map((order) => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        onStatusChanged={handleStatusChanged}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SubscriptionGuard>
  );
}
