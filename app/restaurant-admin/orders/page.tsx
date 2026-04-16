// app/restaurant-admin/orders/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, MapPin } from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderTime: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-1001",
      customerName: "Aarav Sharma",
      customerPhone: "+977 9841567890",
      address: "Thamel, Kathmandu",
      items: ["Chicken Momo (12 pcs)", "Buff Chowmein", "Coke"],
      totalAmount: 1250,
      status: "pending",
      orderTime: "2026-04-16 11:45",
    },
    {
      id: "ORD-1002",
      customerName: "Priya Gurung",
      customerPhone: "+977 9812345678",
      address: "Lazimpat, Kathmandu",
      items: ["Veg Thali", "Paneer Butter Masala", "Lassi"],
      totalAmount: 980,
      status: "preparing",
      orderTime: "2026-04-16 12:10",
    },
    {
      id: "ORD-1003",
      customerName: "Sujan Thapa",
      customerPhone: "+977 9865432109",
      address: "Boudha, Kathmandu",
      items: ["Buff Sekuwa", "Fried Rice", "Beer"],
      totalAmount: 1450,
      status: "ready",
      orderTime: "2026-04-16 12:30",
    },
  ]);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'preparing': return 'bg-orange-100 text-orange-700';
      case 'ready': return 'bg-green-100 text-green-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#513012]">Orders Management</h1>
          <p className="text-gray-600 mt-1">Track and update customer orders</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Orders Today: <span className="font-semibold text-[#513012]">{orders.length}</span>
        </div>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="border-[#513012]/10">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm text-gray-500">#{order.id}</p>
                  <p className="text-lg font-semibold mt-1">{order.customerName}</p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{order.orderTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{order.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="line-clamp-1">{order.address}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Items Ordered:</p>
                <ul className="text-sm space-y-1 pl-5 list-disc">
                  {order.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-[#513012]">₹{order.totalAmount}</p>
                </div>

                {/* Status Update Dropdown */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Update Status:</span>
                  <Select 
                    value={order.status} 
                    onValueChange={(value: Order['status']) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready for Delivery</SelectItem>
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

      {orders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            No orders found.
          </CardContent>
        </Card>
      )}
    </div>
  );
}