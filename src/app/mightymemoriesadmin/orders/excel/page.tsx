import { getDb } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ExportCSVButton from "@/components/ExportCSVButton";
import OrderSearch from "@/components/OrderSearch";

export const dynamic = "force-dynamic";

export default async function OrdersExcelView({ searchParams }: { searchParams: { q?: string } }) {
  const db = getDb();
  const snap = await db.ref("orders").orderByChild("createdAt").get();
  let orders: any[] = [];
  
  if (snap.exists()) {
    snap.forEach((child) => {
      orders.unshift({ id: child.key, ...child.val() });
    });
  }

  const query = (searchParams?.q || "").toLowerCase();
  if (query) {
    orders = orders.filter((o) => 
      (o.id && o.id.toLowerCase().includes(query)) ||
      (o.name && o.name.toLowerCase().includes(query)) ||
      (o.email && o.email.toLowerCase().includes(query)) ||
      (o.phone && o.phone.toLowerCase().includes(query))
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/mightymemoriesadmin/orders" className="text-gray-500 hover:text-gray-900 transition bg-white p-2 rounded-xl shadow-sm border border-gray-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Excel Format View</h1>
        </div>
        <div className="flex items-center gap-4">
          <OrderSearch placeholder="Search by name, email, or ID..." />
          <ExportCSVButton orders={orders} />
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
              <th className="p-3 border-r border-gray-200">No.</th>
              <th className="p-3 border-r border-gray-200">Order ID</th>
              <th className="p-3 border-r border-gray-200">Date</th>
              <th className="p-3 border-r border-gray-200">Time</th>
              <th className="p-3 border-r border-gray-200">Status</th>
              <th className="p-3 border-r border-gray-200">Name</th>
              <th className="p-3 border-r border-gray-200">Email</th>
              <th className="p-3 border-r border-gray-200">Phone</th>
              <th className="p-3 border-r border-gray-200">Address</th>
              <th className="p-3 border-r border-gray-200">Product</th>
              <th className="p-3 border-r border-gray-200">Quantity / Package</th>
              <th className="p-3 border-r border-gray-200">Price</th>
              <th className="p-3 border-r border-gray-200">Comments</th>
              <th className="p-3">Uploaded Images</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => {
              const dateObj = new Date(order.createdAt);
              return (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-3 border-r border-gray-200 font-medium">{orders.length - index}</td>
                  <td className="p-3 border-r border-gray-200 font-mono text-xs">{order.id}</td>
                  <td className="p-3 border-r border-gray-200">{dateObj.toLocaleDateString()}</td>
                  <td className="p-3 border-r border-gray-200">{dateObj.toLocaleTimeString()}</td>
                  <td className="p-3 border-r border-gray-200">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      order.status === 'New' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 border-r border-gray-200 font-semibold">{order.name}</td>
                <td className="p-3 border-r border-gray-200">{order.email}</td>
                <td className="p-3 border-r border-gray-200">{order.phone}</td>
                <td className="p-3 border-r border-gray-200 max-w-[200px] truncate" title={order.address}>{order.address}</td>
                <td className="p-3 border-r border-gray-200">{order.productType}</td>
                <td className="p-3 border-r border-gray-200">{order.packageDetails}</td>
                <td className="p-3 border-r border-gray-200">${order.totalAmount}</td>
                <td className="p-3 border-r border-gray-200 max-w-[200px] truncate" title={order.comments}>{order.comments || "-"}</td>
                <td className="p-3">
                  <div className="flex flex-col gap-1">
                    {(order.photos || []).map((photo: any, i: number) => (
                      <a key={i} href={photo.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Image {i + 1}
                      </a>
                    ))}
                    {(!order.photos || order.photos.length === 0) && <span className="text-gray-400">No images</span>}
                  </div>
                </td>
              </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={14} className="p-6 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
