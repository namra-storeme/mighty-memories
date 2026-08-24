"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2, X, Plus, Minus, Truck, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

type ProductType = "Custom Photo Magnets" | "Single Picture Magnets";

// ── Pricing helpers ──────────────────────────────────────────────────────────
const SHIPPING = 8.99;
const FREE_SHIPPING_THRESHOLD = 40; // free shipping when subtotal >= $40

function getUnitPrice(product: ProductType, qty: number): number {
  if (product === "Custom Photo Magnets") {
    return qty >= 6 ? 4 : 5;
  }
  return 3.5;
}

function getSubtotal(product: ProductType, qty: number): number {
  return getUnitPrice(product, qty) * qty;
}

function getShippingCost(subtotal: number, localPickup: boolean): number {
  if (localPickup) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING;
}

const MIN_QTY: Record<ProductType, number> = {
  "Custom Photo Magnets": 3,
  "Single Picture Magnets": 10,
};

export default function ShopPage() {
  const router = useRouter();

  const [productType, setProductType] = useState<ProductType>("Custom Photo Magnets");
  const [quantity, setQuantity] = useState<number>(MIN_QTY["Custom Photo Magnets"]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [comments, setComments] = useState("");
  const [localPickup, setLocalPickup] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Switch Product ─────────────────────────────────────────────────────────
  function handleProductSwitch(p: ProductType) {
    setProductType(p);
    setQuantity(MIN_QTY[p]);
    setPhotos([]);
    setError("");
  }

  // ── Quantity stepper ────────────────────────────────────────────────────────
  function changeQty(delta: number) {
    const min = MIN_QTY[productType];
    const next = Math.max(min, quantity + delta);
    setQuantity(next);
    if (productType === "Custom Photo Magnets") {
      setPhotos((prev) => prev.slice(0, next));
    }
  }

  // ── Photo upload ───────────────────────────────────────────────────────────
  async function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    
    const allFiles = Array.from(incoming);
    
    // Validate file types
    const validFiles = allFiles.filter(file => {
      const type = file.type.toLowerCase();
      const name = file.name.toLowerCase();
      return type === "image/jpeg" || type === "image/png" || type === "image/heic" || type === "image/heif" || 
             name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".heic");
    });

    if (validFiles.length < allFiles.length) {
      setError("Some files were skipped. Please only upload PNG, JPG, JPEG, or HEIC images.");
    } else {
      setError("");
    }

    if (validFiles.length === 0) return;
    
    // Compress valid files before adding them to state
    const compressedFiles = await Promise.all(
      validFiles.map(async (file) => {
        try {
          // Compress to max 800KB, 1920px max dimension
          return await imageCompression(file, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1920,
            useWebWorker: true
          });
        } catch (e) {
          console.error("Compression failed for", file.name, e);
          return file; // fallback to original if compression fails
        }
      })
    );

    if (productType === "Single Picture Magnets") {
      setPhotos([compressedFiles[0] as File]);
    } else {
      setPhotos((prev) => {
        const combined = [...prev, ...compressedFiles as File[]];
        return combined.slice(0, quantity);
      });
    }
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate() {
    if (productType === "Custom Photo Magnets" && photos.length < quantity)
      return `Please upload all ${quantity} photo${quantity > 1 ? "s" : ""} (${photos.length}/${quantity} uploaded).`;
    if (productType === "Single Picture Magnets" && photos.length === 0)
      return "Please upload 1 photo.";
    return "";
  }

  function handleProceed() {
    const err = validate();
    if (err) return setError(err);
    setError("");
    setStep(2);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("productType", productType);
    formData.set(
      "packageDetails",
      `${quantity} magnets @ $${unitPrice.toFixed(2)} each${localPickup ? " — Local Pickup (Toongabbie)" : ""}`
    );
    formData.set("quantity", quantity.toString());
    formData.set("subtotalAmount", subtotal.toFixed(2));
    formData.set("shippingAmount", shippingCost.toFixed(2));
    formData.set("totalAmount", total.toFixed(2));
    formData.set("localPickup", localPickup ? "yes" : "no");

    photos.forEach((file, i) => formData.append(`photo-${i}`, file));

    try {
      const res = await fetch("/api/order/submit", { method: "POST", body: formData });
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        // Handle non-JSON responses (e.g. 413 Payload Too Large from Vercel)
        if (res.status === 413) {
          throw new Error("The uploaded photos are still too large for the server. Please try using fewer or smaller images.");
        }
        throw new Error("Received an unexpected response from the server. Please try again.");
      }

      if (!res.ok) throw new Error(data?.error || "Failed to process order.");
      router.push("/success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const unitPrice = getUnitPrice(productType, quantity);
  const subtotal = getSubtotal(productType, quantity);
  const qualifiesFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = getShippingCost(subtotal, localPickup);
  const total = subtotal + shippingCost;
  const isSingle = productType === "Single Picture Magnets";

  return (
    <div className="bg-[#fafafa] min-h-screen py-6 pb-24">
      <div className="max-w-[480px] mx-auto px-4">

        {step === 1 && (
          <div className="space-y-4">

            {/* PRODUCT TABS */}
            <div className="flex bg-gray-200 p-1 rounded-lg">
              <button
                onClick={() => handleProductSwitch("Custom Photo Magnets")}
                className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition ${productType === "Custom Photo Magnets" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}
              >
                Custom Photo Magnets
              </button>
              <button
                onClick={() => handleProductSwitch("Single Picture Magnets")}
                className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition ${productType === "Single Picture Magnets" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}
              >
                Single Picture Magnets
              </button>
            </div>

            {/* PRODUCT HERO CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Image with overlay title */}
              <div className="relative w-full aspect-[4/3] bg-gray-100">
                <img
                  src={productType === "Custom Photo Magnets" ? "/photo_magnets.jpg" : "/single_bulk_magnets.jpg"}
                  alt={productType}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h1 className="text-white font-extrabold text-lg leading-tight drop-shadow">{productType}</h1>
                  <p className="text-white/80 text-[12px] mt-0.5">
                    {productType === "Custom Photo Magnets"
                      ? "Personalized magnets from your photos, quotes, logos & more."
                      : "One photo printed on every magnet — perfect for events & gifts."}
                  </p>
                </div>
              </div>

              {/* Pricing pills */}
              <div className="p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pricing</p>
                <div className="flex flex-wrap gap-2">
                  {productType === "Custom Photo Magnets" ? (
                    <>
                      <div className="flex-1 min-w-0 bg-[#fafafa] border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400 font-semibold mb-1">3 – 5 pieces</p>
                        <p className="text-[18px] font-extrabold text-[#111827] leading-none">$5.00</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">each</p>
                      </div>
                      <div className="flex-1 min-w-0 bg-[#111827] rounded-xl p-3 text-center relative">
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#C49B76] text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">SAVE $6</span>
                        <p className="text-[10px] text-white/60 font-semibold mb-1">6+ pieces</p>
                        <p className="text-[18px] font-extrabold text-white leading-none">$4.00</p>
                        <p className="text-[10px] text-white/50 mt-0.5">each</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 bg-[#111827] rounded-xl p-3 text-center">
                      <p className="text-[10px] text-white/60 font-semibold mb-1">10+ pieces</p>
                      <p className="text-[18px] font-extrabold text-white leading-none">$3.50</p>
                      <p className="text-[10px] text-white/50 mt-0.5">each</p>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#2563eb] font-semibold mt-3 flex items-center gap-1.5">
                  🚚 FREE Australia-wide delivery on orders over $40!
                </p>
              </div>
            </div>

            {/* QUANTITY + PRICE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[12px] font-bold text-[#111827] uppercase tracking-widest">1. Quantity</h2>
                  {qualifiesFreeShipping ? (
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Free shipping!
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Free on $40+
                    </span>
                  )}
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 mb-4">
                  <button
                    type="button"
                    onClick={() => changeQty(-1)}
                    disabled={quantity <= MIN_QTY[productType]}
                    className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black disabled:opacity-25 transition shadow-sm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-center">
                    <span className="text-3xl font-black text-[#111827] tabular-nums">{quantity}</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">${unitPrice.toFixed(2)} each</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => changeQty(1)}
                    className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Price breakdown */}
                <div className="space-y-2 text-[12px] mb-4">
                  <div className="flex justify-between text-gray-500">
                    <span>{quantity} × ${unitPrice.toFixed(2)}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    {shippingCost === 0
                      ? <span className="text-green-600 font-semibold">{localPickup ? "Free (Pickup)" : "FREE 🎉"}</span>
                      : <span>${SHIPPING.toFixed(2)}</span>
                    }
                  </div>
                </div>
              </div>

              {/* Total strip */}
              <div className="bg-[#111827] px-5 py-3.5 flex items-center justify-between">
                <span className="text-white/60 text-[12px] font-semibold uppercase tracking-wider">Total</span>
                <span className="text-white font-black text-[18px]">${total.toFixed(2)} <span className="text-white/50 text-[12px] font-semibold">AUD</span></span>
              </div>

              {/* LOCAL PICKUP */}
              <div className="px-5 py-3 border-t border-gray-100">
                <label className={`flex items-start gap-3 cursor-pointer rounded-xl p-3 transition ${localPickup ? "bg-green-50 border border-green-200" : "border border-gray-100 hover:bg-gray-50"}`}>
                  <input
                    type="checkbox"
                    checked={localPickup}
                    onChange={(e) => setLocalPickup(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-black rounded shrink-0"
                  />
                  <div>
                    <p className="text-[12px] font-bold text-[#111827] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      Free Local Pickup — Toongabbie, Sydney
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                      Based in Sydney? Save on shipping — we'll email you the pickup address and arrange a convenient time once your order is ready.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* UPLOAD SECTION */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-[12px] font-bold text-[#111827] mb-0.5 uppercase tracking-wider">
                2. Upload Images {isSingle ? "" : `(${photos.length}/${quantity})`} *
              </h2>
              <p className="text-[11px] text-gray-400 mb-3">
                {isSingle ? "Upload exactly 1 photo." : `Upload exactly ${quantity} photos — one per magnet.`}
              </p>

              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {photos.map((file, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(file)} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  {!isSingle && photos.length < quantity && (
                    <label className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 cursor-pointer transition">
                      <Plus className="w-4 h-4" />
                      <input type="file" multiple accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic,image/heif" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                    </label>
                  )}
                </div>
              )}

              {(photos.length === 0 || (isSingle && photos.length === 0)) && (
                <label className="block border-2 border-dashed border-gray-200 rounded-lg py-6 px-4 text-center text-gray-400 hover:border-gray-400 cursor-pointer">
                  <UploadCloud className="w-6 h-6 mx-auto mb-1.5 text-gray-400" />
                  <span className="text-[12px] font-semibold block text-gray-500">Click to browse or drag & drop</span>
                  <span className="text-[10px] mt-0.5 block">PNG, JPG, HEIC accepted</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={!isSingle}
                    accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic,image/heif"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
              )}
            </div>

            {/* SPECIAL INSTRUCTIONS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-[12px] font-bold text-[#111827] mb-0.5 uppercase tracking-wider">3. Special Instructions</h2>
              <p className="text-[11px] text-gray-400 mb-3">Any notes about layout, sizing, or your order? Let us know here.</p>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={2}
                placeholder="e.g. Please keep the photos in the order I uploaded them..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:border-black transition resize-none placeholder-gray-300"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 border border-red-100 rounded-lg text-[12px] font-medium">{error}</div>
            )}

            <button
              type="button"
              onClick={handleProceed}
              className="w-full bg-[#1c1c1c] text-white py-3.5 rounded-lg font-bold uppercase tracking-wider hover:bg-black transition text-[12px]"
            >
              CONTINUE TO YOUR DETAILS →
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Order Summary Bar */}
            <div className="bg-[#1c1c1c] text-white rounded-xl px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] opacity-60 uppercase tracking-wider">{productType}</p>
                <button type="button" onClick={() => setStep(1)} className="text-[11px] font-semibold opacity-80 hover:opacity-100 underline underline-offset-2 transition">
                  ← Edit order
                </button>
              </div>
              <div className="flex justify-between text-[12px] text-white/70 mt-1">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-white/70 mt-0.5">
                <span>{localPickup ? "📍 Local Pickup (Toongabbie)" : "Shipping"}</span>
                <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2 border-t border-white/20 pt-2">
                <span>Total</span><span>${total.toFixed(2)} AUD</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-[12px] font-bold text-[#111827] mb-4 uppercase tracking-wider">
                {localPickup ? "Your Contact Details" : "Your Shipping Details"}
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name *</label>
                    <input type="text" name="name" required className="w-full border border-gray-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-black transition" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address *</label>
                    <input type="email" name="email" required className="w-full border border-gray-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-black transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number *</label>
                  <input type="tel" name="phone" required className="w-full border border-gray-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-black transition" />
                </div>
                {localPickup ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-[11px] text-green-700 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      Local Pickup — Toongabbie, Sydney NSW
                    </p>
                    <p className="text-[11px] text-green-600 mt-1 leading-relaxed">
                      We'll email you the exact address and arrange a convenient pickup time once your order is ready.
                    </p>
                    <input type="hidden" name="address" value="LOCAL PICKUP — Toongabbie, Sydney NSW" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Shipping Address *</label>
                    <textarea name="address" required rows={2} className="w-full border border-gray-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-black transition resize-none" placeholder="Street, Suburb, State, Postcode" />
                  </div>
                )}
                <input type="hidden" name="comments" value={comments} />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 border border-red-100 rounded-lg text-[12px] font-medium">{error}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1c1c1c] text-white py-3.5 rounded-lg font-bold uppercase tracking-wider hover:bg-black transition text-[12px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "SUBMIT ORDER"}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-black font-medium text-[12px] transition text-center mt-1">
                ← Back
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
