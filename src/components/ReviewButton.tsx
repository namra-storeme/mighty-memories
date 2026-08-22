"use client";

import { useState } from "react";
import { Loader2, Star, X } from "lucide-react";

export default function ReviewButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      userName: formData.get("userName"),
      text: formData.get("text"),
      rating,
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to submit review");
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        window.location.reload(); // Quick way to show the new review on the server component
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="mt-12 bg-[#1a73e8] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-blue-700 transition"
      >
        Leave a review
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold mb-6 text-gray-900 text-center">Write a Review</h3>

            {success ? (
              <div className="text-center py-8">
                <p className="text-green-600 font-semibold mb-2">Thank you!</p>
                <p className="text-sm text-gray-500">Your review has been published.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</p>}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-1 text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setRating(star)}
                        className="hover:scale-110 transition"
                      >
                        <Star className={`w-8 h-8 ${rating >= star ? "fill-current" : "text-gray-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    name="userName"
                    type="text"
                    required
                    placeholder="Your Name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <textarea
                    name="text"
                    required
                    rows={4}
                    placeholder="Share your experience..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black resize-y"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a73e8] text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Post Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

