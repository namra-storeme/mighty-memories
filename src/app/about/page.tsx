import { Info, Heart, Camera, Star } from "lucide-react";

export default async function About() {

  const highlights = [
    { icon: <Heart className="w-5 h-5" />, label: "Made with Love", color: "from-pink-500 to-rose-500" },
    { icon: <Star className="w-5 h-5" />, label: "Premium Quality", color: "from-yellow-500 to-orange-500" },
    { icon: <Camera className="w-5 h-5" />, label: "Your Memories", color: "from-blue-500 to-purple-500" },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-blue-700 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Info className="w-4 h-4" />
            Our Story
          </div>
          <h1 className="text-5xl font-extrabold mb-4">About Us</h1>
          <p className="text-purple-100 text-lg">Learn about the passion behind m2 mighty memories.</p>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 bg-gradient-to-br ${h.color} rounded-xl flex items-center justify-center text-white shadow-md shrink-0`}>
                {h.icon}
              </div>
              <span className="font-bold text-gray-900">{h.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <div className="prose prose-lg text-gray-600 max-w-none">
              <p className="leading-relaxed">
                Welcome to <strong>m2 mighty memories</strong>! We specialize in turning your beautiful memories into custom magnet stickers. Each piece is crafted with care and attention to detail, so you can cherish your favourite moments every day.
              </p>
          </div>
        </div>
      </section>
    </div>
  );
}
