"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/mightymemoriesadmin")) return null;

  return (
    <header className="w-full bg-white border-b border-gray-100 flex flex-col sticky top-0 z-50">
      {/* Announcement Bar */}
      <div className="bg-white border-b border-gray-100 py-1.5 px-4 text-center text-[10px] tracking-widest text-gray-600 uppercase font-medium flex justify-center items-center gap-4">
        <span>&lt;</span>
        <span>$8.95 FLAT RATE SHIPPING AUSTRALIA WIDE</span>
        <span>&gt;</span>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center w-1/4">
            <Link href="/" className="inline-block hover:opacity-90 transition">
              <img
                src="/logo.png"
                alt="m2 mighty memories"
                style={{ width: "200px", height: "auto" }}
                className="object-contain max-h-[80px]"
              />
            </Link>
          </div>

          {/* Middle: Navigation Links (Desktop) */}
          <nav className="hidden md:flex justify-center w-2/4 gap-8 text-[13px] font-bold tracking-wider text-gray-800 uppercase">
            <Link href="/" className="hover:text-black hover:underline underline-offset-4 transition">Home</Link>
            <Link href="/shop" className="hover:text-black hover:underline underline-offset-4 transition">Order Now</Link>
            <Link href="/reviews" className="hover:text-black hover:underline underline-offset-4 transition">Reviews</Link>
            <Link href="/contact" className="hover:text-black hover:underline underline-offset-4 transition">Contact</Link>
          </nav>

          {/* Right: Socials & Icons */}
          <div className="flex items-center justify-end gap-4 w-auto md:w-1/4 text-gray-900">
            {/* Socials Removed */}
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="md:hidden flex justify-center gap-6 pb-4 text-[12px] font-bold tracking-wider text-gray-800 uppercase">
          <Link href="/" className="hover:text-black hover:underline underline-offset-4 transition">Home</Link>
          <Link href="/shop" className="hover:text-black hover:underline underline-offset-4 transition">Order Now</Link>
          <Link href="/reviews" className="hover:text-black hover:underline underline-offset-4 transition">Reviews</Link>
          <Link href="/contact" className="hover:text-black hover:underline underline-offset-4 transition">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
