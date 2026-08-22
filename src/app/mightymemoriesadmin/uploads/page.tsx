import { getDb } from "@/lib/firebase";
import { Image as ImageIcon } from "lucide-react";
import PortfolioUploadForm from "@/components/PortfolioUploadForm";
import { deletePortfolioPhoto } from "../actions";

export const dynamic = "force-dynamic";

export default async function UploadsPage() {
  const db = getDb();
  
  const portfolioSnap = await db.ref("portfolioImages").orderByChild("createdAt").get();
  const portfolio: any[] = [];
  
  if (portfolioSnap.exists()) {
    portfolioSnap.forEach((child) => {
      portfolio.unshift({ id: child.key, ...child.val() });
    });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Portfolio Uploads</h1>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Creations</h2>
            <p className="text-sm text-gray-500">Upload and manage photos displayed in the Home page gallery.</p>
          </div>
        </div>
        
        <div className="mb-12">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Upload New Photo</h3>
          <PortfolioUploadForm />
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Current Gallery</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {portfolio.map((photo) => {
              const deleteAction = deletePortfolioPhoto.bind(null, photo.id as string, photo.url);
              return (
                <div key={photo.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="Portfolio" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <form action={deleteAction}>
                      <button type="submit" className="bg-red-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-red-600 hover:scale-105 transition-all">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
            {portfolio.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No photos in the gallery yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
