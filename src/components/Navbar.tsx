"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname?.startsWith("/mightymemoriesadmin")) return null;

  const links = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Order Now" },
    { href: "/reviews", label: "Reviews" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Announcement Bar */}
      <div className="bg-white border-b border-gray-100 py-1.5 px-4 text-center text-[10px] tracking-widest text-gray-600 uppercase font-medium flex justify-center items-center gap-4">
        <span>&lt;</span>
        <span>$8.95 FLAT RATE SHIPPING AUSTRALIA WIDE</span>
        <span>&gt;</span>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">

          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="inline-block hover:opacity-90 transition">
              <img
                src="/logo.png"
                alt="m2 mighty memories"
                style={{ width: "160px", height: "auto" }}
                className="object-contain max-h-[70px]"
              />
            </Link>
          </div>

          {/* Middle: Navigation Links (Desktop only) */}
          <nav className="hidden md:flex justify-center gap-8 text-[13px] font-bold tracking-wider text-gray-800 uppercase">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-black hover:underline underline-offset-4 transition"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right placeholder to keep logo centered on desktop */}
          <div className="hidden md:block w-[160px]" />

          {/* Mobile: Hamburger Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <nav className="flex flex-col divide-y divide-gray-50">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="px-6 py-4 text-sm font-bold tracking-wider text-gray-800 uppercase hover:bg-gray-50 transition active:bg-gray-100"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
