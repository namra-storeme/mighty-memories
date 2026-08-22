import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Image as ImageIcon, Star, Zap, Heart } from "lucide-react";
import ReviewButton from "@/components/ReviewButton";
import { getDb } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = getDb();
  const [portfolioSnap, reviewsSnap] = await Promise.all([
    db.ref("portfolioImages").orderByChild("createdAt").limitToLast(6).get(),
    db.ref("reviews").orderByChild("createdAt").limitToLast(6).get(),
  ]);

  const photos: any[] = [];
  if (portfolioSnap.exists()) {
    portfolioSnap.forEach((child) => {
      photos.unshift({ id: child.key, ...child.val() });
      return undefined;
    });
  }

  const reviews: any[] = [];
  if (reviewsSnap.exists()) {
    reviewsSnap.forEach((child) => {
      reviews.unshift({ id: child.key, ...child.val() });
      return undefined;
    });
  }

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] bg-black">
        <div className="absolute inset-0 opacity-60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/back.jpeg"
            alt="Magnets on a fridge"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <p className="text-white/80 text-xs md:text-base font-semibold tracking-wider mb-3 md:mb-4">
            m2 mighty memories - Turning your favourite memories into beautiful custom magnets.
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white max-w-3xl leading-tight mb-6 md:mb-8">
              Save Your Memories Forever With Custom Magnets
          </h1>
          <Link
            href="/shop"
            className="inline-block border-2 border-white text-white px-6 md:px-8 py-3 text-sm font-semibold hover:bg-white hover:text-black transition uppercase tracking-wider"
          >
            Shop all
          </Link>
        </div>
      </section>

      {/* 3-Column Feature Banner */}
      <section className="bg-[#fafafa] py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="pt-8 md:pt-0">
            <h3 className="font-bold text-gray-900 mb-2 text-sm flex items-center justify-center gap-2">
              🚚 Australia Wide Shipping
            </h3>
            <p className="text-xs text-gray-500">Fast and reliable delivery across Australia</p>
          </div>
          <div className="pt-8 md:pt-0">
            <h3 className="font-bold text-gray-900 mb-2 text-sm flex items-center justify-center gap-2">
              ♡ Made With Care
            </h3>
            <p className="text-xs text-gray-500">Thoughtfully prepared for your memories</p>
          </div>
          <div className="pt-8 md:pt-0">
            <h3 className="font-bold text-gray-900 mb-2 text-sm flex items-center justify-center gap-2">
              ✓ Premium Quality
            </h3>
            <p className="text-xs text-gray-500">Beautiful photo prints made to last</p>
          </div>
        </div>
      </section>

      {/* Our Creations Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Our Creations</h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">Take a look at some of the beautiful custom magnets we've made for our amazing customers.</p>
          </div>
          
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt="Customer Creation"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>More creations coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section (Google Style) */}
      <section className="py-24 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 flex flex-col items-center">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-6 uppercase tracking-widest">
              Excellent
              <div className="flex text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              {reviews.length || 18} reviews
              <span className="text-blue-500 text-lg font-bold ml-1">G</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              {reviews.length === 0 ? (
                // Dummy reviews if db is empty to match layout
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#f9f9f9] rounded-2xl p-6 text-left shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-lg">
                            J
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">Jared Newman</p>
                            <p className="text-[10px] text-gray-400">last month</p>
                          </div>
                        </div>
                        <span className="text-blue-500 font-bold text-lg">G</span>
                      </div>
                      <div className="flex text-yellow-400 mb-3">
                        <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                      </div>
                      <p className="text-xs text-gray-600">Lovely people, good product</p>
                    </div>
                  ))}
                </>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-[#f9f9f9] rounded-2xl p-6 text-left shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {review.userImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={review.userImage} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                            {review.userName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm text-gray-900">{review.userName}</p>
                          <p className="text-[10px] text-gray-400">last month</p>
                        </div>
                      </div>
                      <span className="text-blue-500 font-bold text-lg">G</span>
                    </div>
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">"{review.text}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
