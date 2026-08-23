"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type Review = { id: string; userName: string; rating: number; text: string; createdAt?: string };

export default function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? reviews : reviews.slice(0, 3);

  if (reviews.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {visible.map((review) => (
          <div key={review.id} className="bg-[#f9f9f9] rounded-2xl p-6 text-left shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white"
                  style={{ background: `hsl(${(review.userName.charCodeAt(0) * 40) % 360}, 60%, 50%)` }}
                >
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{review.userName}</p>
                  {review.createdAt && (
                    <p className="text-[10px] text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-blue-500 font-bold text-lg">G</span>
            </div>
            <div className="flex text-yellow-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
              ))}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">"{review.text}"</p>
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-8 border border-gray-300 text-gray-700 font-semibold text-sm px-6 py-2.5 rounded-full hover:border-black hover:text-black transition"
        >
          {expanded ? "Show less ↑" : `Show all ${reviews.length} reviews ↓`}
        </button>
      )}
    </>
  );
}
