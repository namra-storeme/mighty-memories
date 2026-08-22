"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      comment: formData.get("comment"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send message");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Message Sent!</h2>
        <p className="text-gray-500 mb-6">Thank you for reaching out. We will get back to you soon.</p>
        <button onClick={() => setSuccess(false)} className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-normal text-gray-900 mb-12 text-center">Contact</h1>

        {error && <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">{error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <input
                name="name"
                type="text"
                required
                placeholder="Name *"
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
              />
            </div>
            <div>
              <input
                name="email"
                type="email"
                required
                placeholder="Email *"
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
              />
            </div>
          </div>

          <div>
            <input
              name="phone"
              type="tel"
              placeholder="Phone number"
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
            />
          </div>

          <div>
            <textarea
              name="comment"
              required
              rows={5}
              placeholder="Comment *"
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition resize-y"
            ></textarea>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-8 py-3 text-sm font-semibold hover:opacity-80 transition disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
