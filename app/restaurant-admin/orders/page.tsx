export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Orders</h1>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">ID</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">#1</td>
            <td>Pending</td>
            <td>$20</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}