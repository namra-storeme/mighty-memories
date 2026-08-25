"use client";

import { useTransition } from "react";
import { Settings } from "lucide-react";
import { login } from "./actions";

export function AdminLoginForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      login(formData);
    });
  }

  if (isPending) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="m2 mighty memories" className="w-48 h-auto object-contain mb-8 animate-pulse" />
        
        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-black rounded-full animate-[loading_1.5s_ease-in-out_infinite] w-full origin-left" style={{ animation: "loadingBar 1.5s ease-in-out infinite" }} />
        </div>
        
        <p className="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Authenticating...</p>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes loadingBar {
            0% { transform: scaleX(0); transform-origin: left; }
            50% { transform: scaleX(1); transform-origin: left; }
            51% { transform: scaleX(1); transform-origin: right; }
            100% { transform: scaleX(0); transform-origin: right; }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 relative overflow-hidden">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Admin Access</h1>
        <p className="text-gray-500 text-sm">Please enter the admin password</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
  );
}
