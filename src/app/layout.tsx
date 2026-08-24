import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { Camera } from "lucide-react";
import Link from "next/link";

import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "m2 mighty memories | Custom Magnet Stickers",
  description: "Turn your beautiful memories into custom magnet stickers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-gray-100 border-t border-gray-200 pt-12 pb-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-center md:text-left">
                {/* Contact Info (Text) */}
                <div className="flex flex-col items-center md:items-start gap-2.5">
                  <h4 className="font-bold text-gray-900 mb-1 uppercase tracking-wider text-xs">Contact Us</h4>
                  <a href="https://wa.me/61419151930" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 font-medium transition text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    WhatsApp: +61 419 151 930
                  </a>
                  <a href="mailto:m2mightymemories@gmail.com" className="text-gray-500 hover:text-gray-900 font-medium transition text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    m2mightymemories@gmail.com
                  </a>
                </div>

                {/* Socials (Buttons/Icons) */}
                <div className="flex flex-col items-center md:items-end gap-3">
                  <h4 className="font-bold text-gray-900 mb-1 uppercase tracking-wider text-xs">Follow Us</h4>
                  <div className="flex items-center gap-3">
                    <a href="https://www.instagram.com/m2mightymemories.au?igsi=MTU1ODNiNmhlcG9wbQ==" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:scale-105 transition shadow-sm">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      Instagram
                    </a>
                    <a href="https://www.facebook.com/share/1BpZGvaaH3/" target="_blank" rel="noopener noreferrer" className="bg-[#1877F2] text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:scale-105 transition shadow-sm">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom: Copyright */}
              <div className="border-t border-gray-200 pt-8 flex flex-col items-center gap-4 text-[11px] text-gray-500 font-medium tracking-wide">
                <p>© {new Date().getFullYear()} m2 mighty memories</p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
