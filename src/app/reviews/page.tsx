"use client";

import { useState, useEffect } from "react";
import { Star, UploadCloud, Loader2, X, Image as ImageIcon } from "lucide-react";
import Navbar from "@/components/Navbar";

type Review = {
  id: number;
  userName: string;
  rating: number;
  text: string;
  photoUrl: string | null;
  createdAt: string;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || rating < 1) {
      return setError("Please fill out your name, rating, and comment.");
    }
    
    setIsSubmitting(true);
    setError("");
    
    const formData = new FormData();
    formData.append("userName", name);
    formData.append("rating", rating.toString());
    formData.append("text", text);
    if (photo) {
      formData.append("photo", photo);
    }
    
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      
      // Reset and close
      setName("");
      setRating(5);
      setText("");
      setPhoto(null);
      setIsModalOpen(false);
      
      // Refresh list
      fetchReviews();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-black py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Customer Reviews</h1>
        <p className="text-indigo-200 max-w-xl mx-auto text-lg mb-8">See what our customers are saying about their m2 mighty memories magnets!</p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl hover:-translate-y-1 transform"
        >
          Leave a Review
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Star className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No reviews yet</h3>
            <p className="text-gray-500 mt-2">Be the first to leave a review!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-bold text-gray-900">{review.userName}</div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm flex-grow mb-6 italic">"{review.text}"</p>
                
                {review.photoUrl && (
                  <div className="mt-auto rounded-xl overflow-hidden aspect-square border border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={review.photoUrl} alt="Review attachment" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                  </div>
                )}
                <div className="mt-4 text-xs text-gray-400 font-medium">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-8 border-b border-gray-100 text-center">
              <h2 className="text-2xl font-extrabold text-gray-900">Share Your Experience</h2>
              <p className="text-gray-500 text-sm mt-1">We'd love to see a photo of your magnets!</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl font-medium border border-red-100">{error}</div>}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button 
                      key={num} 
                      type="button"
                      onClick={() => setRating(num)}
                      className="transition transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${rating >= num ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Review Comment</label>
                <textarea 
                  required
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition resize-y"
                  placeholder="I loved the quality of the magnets..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Attach a Photo (Optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-black hover:bg-gray-50 transition cursor-pointer relative">
                  <div className="space-y-1 text-center">
                    {photo ? (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-black" />
                        <span className="mt-2 text-sm text-black font-semibold">{photo.name}</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 mt-2">
                          <span className="relative rounded-md font-medium text-black focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2">
                            <span>Upload a file</span>
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => e.target.files && setPhoto(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-black text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : "Post Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
