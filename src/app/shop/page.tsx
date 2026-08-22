"use client";

import { useState } from "react";
import { UploadCloud, Loader2, CheckCircle2, ChevronRight, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type ProductType = "Photo Magnets" | "Bulk Orders" | "Single Picture Bulk" | null;

interface PackageOption {
  label: string;
  qty: number;
  priceStr?: string;
  price?: number;
}

const PRODUCTS: Record<string, PackageOption[]> = {
  "Photo Magnets": [
    { label: "4 Magnets - $20", qty: 4, price: 20 },
    { label: "6 Magnets - $28.99", qty: 6, price: 28.99 },
    { label: "10 Magnets - $40.50", qty: 10, price: 40.50 },
  ],
  "Bulk Orders - Photo Magnets": [
    { label: "50 Magnets - $180", qty: 50, price: 180 },
    { label: "80 Magnets - $280", qty: 80, price: 280 },
    { label: "100 Magnets - $340", qty: 100, price: 340 },
  ],
  "Single picture bulk orders": [
    { label: "20 Magnets - $65", qty: 20, price: 65 },
    { label: "50 Magnets - $160", qty: 50, price: 160 },
    { label: "100 Magnets - $300", qty: 100, price: 300 },
  ],
};

export default function ShopPage() {
  const router = useRouter();
  
  // State
  const [productType, setProductType] = useState<string | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<PackageOption | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setPhotos(Array.from(e.target.files));
    e.target.value = ''; // Reset input
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleProceedToDetails = () => {
    if (!productType) return setError("Please select a product.");
    if (!selectedPkg) return setError("Please select a quantity package.");
    if (photos.length === 0) return setError("Please upload at least one photo.");

    if (productType === "Single picture bulk orders") {
      if (photos.length > 1) {
        return setError("For single picture bulk orders, please upload exactly 1 photo.");
      }
    } else {
      if (photos.length > selectedPkg.qty) {
        return setError(`You selected a package for ${selectedPkg.qty} magnets, but uploaded ${photos.length} photos. Please remove ${photos.length - selectedPkg.qty} photo(s).`);
      }
    }

    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("productType", productType!);
    formData.append("packageDetails", selectedPkg!.label);
    formData.append("quantity", selectedPkg!.qty.toString());
    
    // Estimate total amount if defined, else fallback to a standard calculation
    const estimatedTotal = selectedPkg!.price || (selectedPkg!.qty * 3.25);
    formData.append("totalAmount", estimatedTotal.toString());
    
    photos.forEach((file, index) => {
      formData.append(`photo-${index}`, file);
    });

    try {
      const res = await fetch("/api/order/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process order.");
      
      router.push(`/success`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Place Your Order</h1>
          <p className="text-gray-500">Select a package, upload your photos, and we'll handle the rest!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: PRODUCT & PHOTOS */}
          <div className={step === 1 ? "block" : "hidden"}>
            
            {/* Product Selection */}
            <div className="bg-white p-6 md:p-8 border border-gray-100 shadow-sm rounded-xl mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">1. Select Product</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {Object.keys(PRODUCTS).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setProductType(type); setSelectedPkg(null); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col items-center gap-2 ${
                      productType === type 
                      ? "border-black bg-gray-50 ring-1 ring-black shadow-md" 
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
                    }`}
                  >
                    <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-100">
                      <img 
                        src={type === "Photo Magnets" ? "/photo_magnets.jpg" : type === "Bulk Orders - Photo Magnets" ? "/bulk_magnets.jpg" : "/single_bulk_magnets.jpg"} 
                        alt={type} 
                        className={`w-full h-full object-cover transition-transform duration-500 ${productType === type ? 'scale-105' : 'hover:scale-105'}`}
                      />
                    </div>
                    <div className="flex flex-col items-center text-center w-full">
                      <div className="flex items-center justify-center gap-2 mb-1.5">
                        <span className="font-bold text-[13px] text-gray-900 leading-tight">{type}</span>
                        {productType === type && <CheckCircle2 className="w-4 h-4 text-black shrink-0" />}
                      </div>
                      <span className="text-[11px] text-gray-500 leading-relaxed px-1">
                        {type === "Photo Magnets" ? "Turn different photos into beautiful custom magnets." 
                        : type === "Bulk Orders - Photo Magnets" ? "A fun mix of many different custom photo magnets." 
                        : "Perfect for events: the exact same photo on many magnets."}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Package Selection */}
            {productType && (
              <div className="bg-white p-6 md:p-8 border border-gray-100 shadow-sm rounded-xl mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">2. Choose Quantity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PRODUCTS[productType].map((pkg) => (
                    <button
                      key={pkg.label}
                      type="button"
                      onClick={() => setSelectedPkg(pkg)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        selectedPkg?.label === pkg.label 
                        ? "border-black bg-gray-50 ring-1 ring-black" 
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-bold text-sm text-gray-900">{pkg.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Upload */}
            {selectedPkg && (
              <div className="bg-white p-6 md:p-8 border border-gray-100 shadow-sm rounded-xl mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">3. Upload Photos</h3>
                
                {photos.length === 0 ? (
                  <label className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-12 px-4 text-gray-400 hover:text-black hover:border-black hover:bg-gray-50 transition-colors cursor-pointer text-center">
                    <UploadCloud className="w-10 h-10 mb-3" />
                    <span className="text-sm font-semibold">Click to browse or drag and drop</span>
                    <span className="text-xs mt-1">PNG, JPG, HEIC</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                ) : (
                  <div>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {photos.map((file, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={URL.createObjectURL(file)} alt="Upload preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(i)}
                            className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-500 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      
                      <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-black hover:border-black cursor-pointer transition">
                        <Plus className="w-6 h-6" />
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-4 border border-red-100 text-sm mb-6 rounded-xl font-medium">{error}</div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleProceedToDetails}
                disabled={!selectedPkg || photos.length === 0}
                className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wide hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Proceed to Details
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* STEP 2: DETAILS */}
          <div className={step === 2 ? "block" : "hidden"}>
            <div className="bg-white p-6 md:p-8 border border-gray-100 shadow-sm rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">Contact & Shipping Details</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Full Name</label>
                    <input type="text" name="name" required className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email Address</label>
                    <input type="email" name="email" required className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Phone Number</label>
                  <input type="tel" name="phone" required className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Shipping Address</label>
                  <textarea name="address" required rows={3} className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition resize-y" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Comments / Instructions (Optional)</label>
                  <textarea name="comment" rows={2} className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition resize-y" />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 border border-red-100 text-sm mt-6 rounded-xl font-medium">{error}</div>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-black font-medium text-sm transition"
                >
                  ← Back to Selection
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-black text-white px-10 py-4 rounded-xl font-bold uppercase tracking-wide hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
