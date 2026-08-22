import { getDb } from "@/lib/firebase";
import { ShoppingBag, Image as ImageIcon, Star } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const db = getDb();
  
  const [ordersSnap, portfolioSnap, reviewsSnap] = await Promise.all([
    db.ref("orders").get(),
    db.ref("portfolioImages").get(),
    db.ref("reviews").get()
  ]);

  const orders = ordersSnap.exists() ? Object.values(ordersSnap.val()) : [];
  const newOrdersCount = orders.filter((o: any) => o.status === "New").length;
  const portfolioCount = portfolioSnap.exists() ? Object.keys(portfolioSnap.val()).length : 0;
  const reviewsCount = reviewsSnap.exists() ? Object.keys(reviewsSnap.val()).length : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Orders Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-4xl font-black text-gray-900 mb-1">{orders.length}</h3>
          <p className="text-gray-500 font-semibold text-sm mb-4">Total Orders</p>
          {newOrdersCount > 0 && (
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold mb-4">
              {newOrdersCount} New Orders
            </span>
          )}
          <Link href="/mightymemoriesadmin/orders" className="mt-auto text-blue-600 font-bold text-sm hover:underline">
            Manage Orders &rarr;
          </Link>
        </div>

        {/* Portfolio Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="text-4xl font-black text-gray-900 mb-1">{portfolioCount}</h3>
          <p className="text-gray-500 font-semibold text-sm mb-4">Portfolio Photos</p>
          <Link href="/mightymemoriesadmin/uploads" className="mt-auto text-purple-600 font-bold text-sm hover:underline">
            Manage Gallery &rarr;
          </Link>
        </div>

        {/* Reviews Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mb-4">
            <Star className="w-7 h-7" />
          </div>
          <h3 className="text-4xl font-black text-gray-900 mb-1">{reviewsCount}</h3>
          <p className="text-gray-500 font-semibold text-sm mb-4">Customer Reviews</p>
          <Link href="/mightymemoriesadmin/reviews" className="mt-auto text-yellow-600 font-bold text-sm hover:underline">
            View Activity &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
