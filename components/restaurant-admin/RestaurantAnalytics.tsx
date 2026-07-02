'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ── Types (matches OrdersPage.tsx shape exactly) ──────────────────────────────

interface OrderItem {
  id: number;
  menu_name: string;
  quantity: number;
  subtotal: string;
}

interface Order {
  id: number;
  status: string;
  total_price: string;
  items: OrderItem[];
  table_number: number | null;
  created_on: string;
}

function isOnlineOrder(order: Order): boolean {
  return !order.table_number || order.table_number === 0;
}

interface SubscriptionResponse {
  is_active: boolean;
  current_subscription: {
    plan: {
      code: string;
      name: string;
      limits: {
        analytics_enabled: boolean;
        [key: string]: any;
      };
    };
    status: string;
  } | null;
}

// ── Hook: subscription / analytics access ────────────────────────────────────

function useAnalyticsAccess() {
  const [loading, setLoading] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [planName, setPlanName] = useState('');

  useEffect(() => {
    const check = async () => {
      try {
        const res = await apiFetch('/api/v1/subscription/subscriptions/current/');
        const data: SubscriptionResponse = await res.json();
        const limits = data?.current_subscription?.plan?.limits;
        setAnalyticsEnabled(Boolean(limits?.analytics_enabled));
        setPlanName(data?.current_subscription?.plan?.name || '');
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
        setAnalyticsEnabled(false);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []);

  return { loading, analyticsEnabled, planName };
}

// ── Data shaping helpers ──────────────────────────────────────────────────────

function shapeRevenueTrend(orders: Order[], days = 14) {
  const today = new Date();
  const buckets: { date: string; label: string; revenue: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.push({
      date: key,
      label: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      revenue: 0,
    });
  }

  const map = new Map(buckets.map((b) => [b.date, b]));
  orders.forEach((o) => {
    const key = new Date(o.created_on).toISOString().slice(0, 10);
    const bucket = map.get(key);
    if (bucket) bucket.revenue += parseFloat(o.total_price || '0');
  });

  return buckets;
}

function shapeTopItems(orders: Order[], limit = 5) {
  const counts = new Map<string, number>();
  orders.forEach((o) => {
    o.items.forEach((item) => {
      counts.set(item.menu_name, (counts.get(item.menu_name) || 0) + item.quantity);
    });
  });
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function shapePeakHours(orders: Order[]) {
  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, label: `${h}:00`, count: 0 }));
  orders.forEach((o) => {
    const h = new Date(o.created_on).getHours();
    hours[h].count += 1;
  });
  // Trim to active hours only (e.g. 8am - 11pm) for a cleaner chart
  return hours.slice(7, 23);
}

function shapeStatusBreakdown(orders: Order[]) {
  const counts: Record<string, number> = {};
  orders.forEach((o) => {
    const s = o.status || 'unknown';
    counts[s] = (counts[s] || 0) + 1;
  });
  const total = orders.length || 1;
  return Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    pct: Math.round((count / total) * 100),
  }));
}

function shapeOnlineVsTable(orders: Order[], days = 7) {
  const today = new Date();
  const buckets: { date: string; label: string; online: number; table: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.push({
      date: key,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      online: 0,
      table: 0,
    });
  }

  const map = new Map(buckets.map((b) => [b.date, b]));
  orders.forEach((o) => {
    const key = new Date(o.created_on).toISOString().slice(0, 10);
    const bucket = map.get(key);
    if (!bucket) return;
    if (isOnlineOrder(o)) bucket.online += 1;
    else bucket.table += 1;
  });

  return buckets;
}

const STATUS_COLORS: Record<string, string> = {
  completed: '#1baf7a',
  delivered: '#1baf7a',
  pending: '#eda100',
  preparing: '#eda100',
  cancelled: '#e34948',
  rejected: '#e34948',
  unknown: '#94a3b8',
};

// ── Metric card ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: { pct: number; direction: 'up' | 'down' | 'flat' };
}) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14 }}>
      <p style={{ fontSize: 11, color: '#64748b', fontWeight: 500, margin: 0 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', margin: '4px 0 0' }}>{value}</p>
      {delta && (
        <p
          style={{
            fontSize: 11,
            marginTop: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            color: delta.direction === 'up' ? '#16a34a' : delta.direction === 'down' ? '#dc2626' : '#64748b',
          }}
        >
          {delta.direction === 'up' && <TrendingUp size={11} />}
          {delta.direction === 'down' && <TrendingDown size={11} />}
          {delta.direction === 'flat' && <Minus size={11} />}
          {Math.abs(delta.pct)}% vs last period
        </p>
      )}
    </div>
  );
}

// ── Locked state (free / monthly plan) ────────────────────────────────────────

function AnalyticsLocked({ planName }: { planName: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '40px 16px',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <Lock size={20} color="#64748b" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, color: '#0f172a', margin: 0 }}>
            Analytics is a yearly plan feature
          </p>
          <p style={{ fontSize: 13, color: '#64748b', maxWidth: 320, margin: 0 }}>
            {planName ? `You're on the ${planName}. ` : ''}
            Upgrade to see revenue trends, top items, peak hours, and order insights.
          </p>
          <Button asChild className="mt-3">
            <Link href="/restaurant-admin/settings/billing">View plans</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RestaurantAnalytics({ orders }: { orders: Order[] }) {
  const { loading, analyticsEnabled, planName } = useAnalyticsAccess();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            Loading analytics…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsEnabled) {
    return <AnalyticsLocked planName={planName} />;
  }

  const revenueTrend = shapeRevenueTrend(orders);
  const topItems = shapeTopItems(orders);
  const peakHours = shapePeakHours(orders);
  const statusBreakdown = shapeStatusBreakdown(orders);
  const onlineVsTable = shapeOnlineVsTable(orders);

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total_price || '0'), 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

  const onlineOrders = orders.filter(isOnlineOrder);
  const tableOrders = orders.filter((o) => !isOnlineOrder(o));
  const onlineAOV = onlineOrders.length
    ? onlineOrders.reduce((s, o) => s + parseFloat(o.total_price || '0'), 0) / onlineOrders.length
    : 0;
  const tableAOV = tableOrders.length
    ? tableOrders.reduce((s, o) => s + parseFloat(o.total_price || '0'), 0) / tableOrders.length
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <MetricCard label="Total revenue" value={`Rs ${totalRevenue.toFixed(0)}`} />
        <MetricCard label="Total orders" value={`${orders.length}`} />
        <MetricCard label="Avg order value" value={`Rs ${avgOrderValue.toFixed(0)}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Online vs Table split */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Online vs table orders (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <BarChart data={onlineVsTable}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={28} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="online" stackId="a" fill="#16a34a" name="Online" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="table" stackId="a" fill="#b45309" name="Table" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#16a34a', display: 'inline-block' }} />
                Online · avg Rs {onlineAOV.toFixed(0)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#b45309', display: 'inline-block' }} />
                Table · avg Rs {tableAOV.toFixed(0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Top items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top selling items</CardTitle>
          </CardHeader>
          <CardContent>
            {topItems.length === 0 ? (
              <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '50px 0' }}>
                Not enough order data yet.
              </p>
            ) : (
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={topItems} layout="vertical" margin={{ left: 8 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1baf7a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Revenue trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue trend (14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fontSize: 10 }} width={40} />


                    <Tooltip
  formatter={(value) => [
    `Rs ${Number(value).toFixed(0)}`,
    "Revenue",
  ]}
/>
                  <Line type="monotone" dataKey="revenue" stroke="#2a78d6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Peak hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Peak order hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer>
                <BarChart data={peakHours}>
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={1} />
                  <YAxis tick={{ fontSize: 10 }} width={30} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4a3aa7" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status breakdown — full width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Order status breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {statusBreakdown.length === 0 ? (
            <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '30px 0' }}>
              No orders yet.
            </p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 110, height: 110, flexShrink: 0 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={30}
                      outerRadius={52}
                      paddingAngle={2}
                    >
                      {statusBreakdown.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.status.toLowerCase()] || '#94a3b8'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 24px', flex: 1 }}>
                {statusBreakdown.map((s) => (
                  <div key={s.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 120 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151' }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: STATUS_COLORS[s.status.toLowerCase()] || '#94a3b8',
                          display: 'inline-block',
                        }}
                      />
                      {s.status}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginLeft: 8 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}