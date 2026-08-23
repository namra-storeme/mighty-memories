"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Photo = { id: string; url: string };

export default function PhotoSlider({ photos }: { photos: Photo[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  }

  return (
    <div className="relative">
      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

      {/* Scrollable Strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="flex-none w-64 h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-sm bg-gray-100 snap-start"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt="Customer Creation"
              className="w-full h-full object-cover hover:scale-105 transition duration-500"
            />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}
