import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RestaurantAdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#513012] cinzel">Welcome back,</h2>
        <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening across your restaurants</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-900">Total Orders Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">1,284</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-900">Revenue This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹8,45,920</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">Coming soon -Orders list will appear here</p>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}