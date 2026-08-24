import { getDb } from "@/lib/firebase";
import { Star, Trash2 } from "lucide-react";
import { deleteReview } from "../actions";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const db = getDb();
  
  const reviewsSnap = await db.ref("reviews").orderByChild("createdAt").get();
  const reviews: any[] = [];
  
  if (reviewsSnap.exists()) {
    reviewsSnap.forEach((child) => {
      reviews.unshift({ id: child.key, ...child.val() });
    });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center">
          <Star className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Customer Reviews</h1>
          <p className="text-gray-500 mt-1">Manage the reviews displayed on the Home page.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No customer reviews yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => {
              const deleteAction = deleteReview.bind(null, review.id);
              return (
                <div key={review.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-gray-50 transition">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4">
                      {review.photoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={review.photoUrl} alt="Review attachment" className="w-14 h-14 object-cover rounded-xl shadow-sm border border-gray-200" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-lg">{review.userName || "Anonymous"}</h3>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < (review.rating || 5) ? 'fill-current' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(review.createdAt).toLocaleDateString()} at {new Date(review.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 italic bg-gray-50 p-4 rounded-xl border border-gray-100">"{review.text}"</p>
                  </div>
                  
                  <form action={deleteAction} className="shrink-0">
                    <button type="submit" className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-300 transition shadow-sm">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
