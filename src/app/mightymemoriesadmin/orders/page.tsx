import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ShoppingBag, Phone, Mail, MessageSquare, Calendar, Image as ImageIcon, User, Trash2 } from "lucide-react";
import Link from "next/link";
import { updateOrderStatus } from "../actions";
import { getDb } from "@/lib/firebase";
import OrderSearch from "@/components/OrderSearch";

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-indigo-100 text-indigo-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

export default async function OrdersPage({ searchParams }: { searchParams: { q?: string } }) {
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

  const newCount = orders.filter((o) => o.status === "New").length;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">All Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            {orders.length} total order{orders.length !== 1 ? "s" : ""} ·{" "}
            <span className="text-blue-600 font-semibold">{newCount} new</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <OrderSearch placeholder="Search by name, email, or ID..." />
          <Link
            href="/mightymemoriesadmin/orders/excel"
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-green-700 transition shrink-0"
          >
            Export to Excel View
          </Link>
        </div>
      </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-200">
            <ShoppingBag className="w-14 h-14 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-500">No orders yet</h3>
            <p className="text-gray-400 text-sm mt-1">Orders will appear here when customers place them.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const statusColor = STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600";
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      {order.customerImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={order.customerImage}
                          alt={order.name}
                          className="w-10 h-10 rounded-full ring-2 ring-blue-100"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-gray-900">{order.name}</span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-semibold text-gray-500">Order #{order.id}</span>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-start gap-2.5">
                      <Mail className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Email</p>
                        <a href={`mailto:${order.email}`} className="text-sm font-semibold text-blue-600 hover:underline">
                          {order.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{order.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Order Details</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.productType || "Legacy Order"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {order.packageDetails || `${order.quantity} Stickers`}
                        </p>
                        <p className="text-sm font-bold text-green-600 mt-1">
                          ${order.totalAmount.toFixed(2)} AUD
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <MessageSquare className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Comments</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{order.comments || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Photos */}
                  {order.photos && order.photos.length > 0 && (
                    <div className="px-6 pb-4">
                      <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <ImageIcon className="w-3.5 h-3.5" />
                        Uploaded Photos ({order.photos.length})
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {order.photos.map((photo: any, idx: number) => (
                          <a key={idx} href={photo.url} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.url}
                              alt="Order photo"
                              className="w-20 h-20 object-cover rounded-xl border border-gray-200 hover:scale-105 hover:shadow-md transition-all cursor-pointer"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Change */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 mr-2">Update Status:</span>
                    {["New", "Processing", "Shipped", "Completed", "Cancelled"].map((s) => {
                      const updateWithId = updateOrderStatus.bind(null, order.id, s);
                      return (
                        <form key={s} action={updateWithId} className="flex items-center gap-1">
                          {s === "Shipped" && order.status !== "Shipped" && (
                            <input
                              type="text"
                              name="trackingNumber"
                              placeholder="Tracking #"
                              className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg w-28 focus:outline-none focus:border-indigo-500"
                            />
                          )}
                          <button
                            type="submit"
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border ${
                              order.status === s
                                ? `${STATUS_COLORS[s]} border-transparent`
                                : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                            }`}
                          >
                            {s}
                          </button>
                        </form>
                      );
                    })}
                    <div className="ml-auto">
                      <a
                        href={`mailto:${order.email}?subject=Your m2 Mighty Memories Order #${order.id}`}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        ✉ Reply to Customer
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
