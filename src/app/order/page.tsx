"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { UploadCloud, CheckCircle2, Loader2, LogIn, X } from "lucide-react";

export default function OrderPage() {
  const { data: session, status } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState<(string | null)[]>([]);

  useEffect(() => {
    setPreviews(Array(quantity).fill(null));
  }, [quantity]);

  const handleFileChange = (index: number, file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviews((prev) => {
      const updated = [...prev];
      updated[index] = url;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("quantity", quantity.toString());
    if (session?.user?.image) {
      formData.append("customerImage", session.user.image);
    }

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to submit order.");
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Not signed in
  if (!session) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Sign In to Order</h2>
            <p className="text-gray-500 mb-8">
              Please sign in with your Google account to place your custom magnet order. It only takes a second!
            </p>
            <button
              onClick={() => signIn("google")}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700 font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success
  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Order Received! 🎉</h2>
          <p className="text-gray-500 mb-8 text-lg">
            Thank you, <strong>{session.user?.name?.split(" ")[0]}</strong>! We have received your photos and will be in touch soon.
          </p>
          <button
            onClick={() => { setIsSuccess(false); setQuantity(1); setPreviews([]); }}
            className="text-blue-600 font-semibold hover:underline"
          >
            Place another order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Place Your Order</h1>
        <p className="text-gray-500 text-lg">Fill in your details and upload the photos for your custom magnets.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
          <X className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">Your Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                required
                type="text"
                name="name"
                defaultValue={session.user?.name || ""}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <input
                required
                type="tel"
                name="phone"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
              />
            </div>
          </div>
          <div className="mt-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input
              required
              type="email"
              name="email"
              defaultValue={session.user?.email || ""}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Quantity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">Sticker Quantity</h2>
          <label className="block text-sm font-semibold text-gray-700 mb-2">How many stickers do you want?</label>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setQuantity(num)}
                className={`py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  quantity === num
                    ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Uploads */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Upload Your Photos</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Please upload <strong>{quantity}</strong> photo{quantity > 1 ? "s" : ""} (one per magnet).
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: quantity }).map((_, i) => (
              <div key={i} className="relative">
                <label
                  htmlFor={`photo_${i}`}
                  className={`block aspect-square rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-all ${
                    previews[i]
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {previews[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previews[i]!} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <UploadCloud className="w-8 h-8 mb-1" />
                      <span className="text-xs font-medium">Photo {i + 1}</span>
                    </div>
                  )}
                </label>
                <input
                  required
                  id={`photo_${i}`}
                  type="file"
                  name={`photo_${i}`}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Additional Comments <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            name="comments"
            rows={3}
            placeholder="Any special instructions, size preferences, or notes..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none bg-gray-50 focus:bg-white"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-4 rounded-2xl hover:shadow-xl hover:scale-[1.01] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 text-lg"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {isSubmitting ? "Submitting Order..." : "Submit Order 🚀"}
        </button>
      </form>
    </div>
  );
}
