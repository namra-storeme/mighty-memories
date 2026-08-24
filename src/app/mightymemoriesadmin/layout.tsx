import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Settings, Mail, Image as ImageIcon, ShoppingBag, LogOut, Star } from "lucide-react";
import { login } from "./actions";
import { SessionManager } from "./SessionManager";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("adminAuth")?.value === "true";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Admin Access</h1>
            <p className="text-gray-500 text-sm">Please enter the admin password</p>
          </div>
          
          <form action={login} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter admin email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/mightymemoriesadmin", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/mightymemoriesadmin/orders", label: "Orders", icon: <ShoppingBag className="w-5 h-5" /> },
    { href: "/mightymemoriesadmin/reviews", label: "Reviews", icon: <Star className="w-5 h-5" /> },
    { href: "/mightymemoriesadmin/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
    { href: "/mightymemoriesadmin/emails", label: "Email Templates", icon: <Mail className="w-5 h-5" /> },
    { href: "/mightymemoriesadmin/uploads", label: "Portfolio Uploads", icon: <ImageIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <SessionManager />
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100 flex justify-center items-center">
          {/* Big Logo */}
          <img src="/logo.png" alt="m2 mighty memories" className="w-48 h-auto object-contain" />
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-black transition"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <form action={async () => {
            "use server";
            (await cookies()).delete("adminAuth");
            redirect("/mightymemoriesadmin");
          }}>
            <button type="submit" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
