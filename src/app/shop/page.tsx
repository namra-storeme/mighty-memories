"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2, X, Plus, Minus, Truck, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

type ProductType = "Custom Photo Magnets" | "Single Picture Magnets";

// ── Pricing helpers ──────────────────────────────────────────────────────────
const SHIPPING = 8.99;
const FREE_SHIPPING_THRESHOLD = 40; // free shipping when subtotal > $40

function getUnitPrice(product: ProductType, qty: number): number {
  if (product === "Custom Photo Magnets") {
    return qty >= 6 ? 4 : 5;
  }
  return 3.50; // Single Picture Magnets
}

function getSubtotal(product: ProductType, qty: number): number {
  return getUnitPrice(product, qty) * qty;
}

function getShippingCost(subtotal: number, localPickup: boolean): number {
  if (localPickup) return 0;
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING;
}

const MIN_QTY: Record<ProductType, number> = {
  "Custom Photo Magnets": 3,
  "Single Picture Magnets": 10,
};

export default function ShopPage() {
  const router = useRouter();

  const [productType, setProductType] = useState<ProductType>("Custom Photo Magnets");
  const [quantity, setQuantity] = useState<number>(MIN_QTY["Custom Photo Magnets"]);

  // Each photo entry: local File for preview + upload status
  type PhotoEntry = { file: File; previewUrl: string; gcsUrl: string | null; uploading: boolean; error: boolean };
  const [photoEntries, setPhotoEntries] = useState<PhotoEntry[]>([]);

  const [comments, setComments] = useState("");
  const [localPickup, setLocalPickup] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived helpers
  const photos = photoEntries.map((e) => e.file);
  const photoUrls = photoEntries.map((e) => e.gcsUrl).filter(Boolean) as string[];
  const anyUploading = photoEntries.some((e) => e.uploading);
  const anyError = photoEntries.some((e) => e.error);

  // ── Switch Product ─────────────────────────────────────────────────────────
  function handleProductSwitch(p: ProductType) {
    setProductType(p);
    setQuantity(MIN_QTY[p]);
    setPhotoEntries([]);
    setError("");
  }

  // ── Quantity stepper ────────────────────────────────────────────────────────
  function changeQty(delta: number) {
    const min = MIN_QTY[productType];
    const next = Math.max(min, quantity + delta);
    setQuantity(next);
    if (productType === "Custom Photo Magnets") {
      setPhotoEntries((prev) => prev.slice(0, next));
    }
  }

  // ── Upload a single file to GCS and update that entry's status ─────────────
  async function uploadFile(file: File, entryIndex: number) {
    // Only compress if the file is over 4MB to stay under Vercel's 4.5MB limit.
    // For smaller files, pass through untouched (no quality loss, no delay).
    let uploadFile = file;
    if (file.size > 4 * 1024 * 1024) {
      try {
        uploadFile = await imageCompression(file, {
          maxSizeMB: 4,
          maxWidthOrHeight: 4096,
          useWebWorker: true,
          fileType: "image/jpeg",
        });
      } catch {
        // If compression fails, try with the original file anyway
        uploadFile = file;
      }
    }

    try {
      const fd = new FormData();
      fd.append("photo", uploadFile, uploadFile.name || "photo.jpg");
      const res = await fetch("/api/upload-photo", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();

      setPhotoEntries((prev) => {
        const next = [...prev];
        if (next[entryIndex]) next[entryIndex] = { ...next[entryIndex], gcsUrl: url, uploading: false, error: false };
        return next;
      });
    } catch {
      setPhotoEntries((prev) => {
        const next = [...prev];
        if (next[entryIndex]) next[entryIndex] = { ...next[entryIndex], uploading: false, error: true };
        return next;
      });
    }
  }

  // ── Photo pick handler — shows preview INSTANTLY, uploads in background ─────
  async function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const allFiles = Array.from(incoming);
    if (allFiles.length === 0) return;
    setError("");

    setPhotoEntries((prev) => {
      const limit = productType === "Single Picture Magnets" ? 1 : quantity;
      // Build new entries
      const newEntries: PhotoEntry[] = allFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file), // instant local preview — no wait
        gcsUrl: null,
        uploading: true,
        error: false,
      }));

      const combined = productType === "Single Picture Magnets"
        ? newEntries.slice(0, 1)
        : [...prev, ...newEntries].slice(0, limit);

      // Kick off background uploads for new entries
      combined.forEach((entry, idx) => {
        if (entry.uploading && !entry.gcsUrl) {
          uploadFile(entry.file, idx);
        }
      });

      return combined;
    });
  }

  function removePhoto(idx: number) {
    setPhotoEntries((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate() {
    if (anyUploading) return "Please wait — photos are still uploading.";
    if (anyError) return "Some photos failed to upload. Please remove them and try again.";
    if (productType === "Custom Photo Magnets" && photoEntries.length < quantity)
      return `Please upload all ${quantity} photo${quantity > 1 ? "s" : ""} (${photoEntries.length}/${quantity} uploaded).`;
    if (productType === "Single Picture Magnets" && photoEntries.length === 0)
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
    const email = formData.get("email") as string;
    
    // Strict email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid and complete email address.");
      setIsSubmitting(false);
      return;
    }

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

    // Photos were already uploaded — just send their GCS URLs as text fields
    photoUrls.forEach((url, i) => formData.append(`photo-url-${i}`, url));

    try {
      const res = await fetch("/api/order/submit", { method: "POST", body: formData });
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
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
  const qualifiesFreeShipping = subtotal > FREE_SHIPPING_THRESHOLD;
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
                      <Truck className="w-3 h-3" /> Free over $40
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

              {photoEntries.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {photoEntries.map((entry, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={entry.previewUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      
                      {/* Upload in progress — spinner overlay */}
                      {entry.uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        </div>
                      )}

                      {/* Upload error — red overlay */}
                      {entry.error && (
                        <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center">
                          <X className="w-5 h-5 text-white" />
                        </div>
                      )}

                      {/* Remove button (only when not uploading) */}
                      {!entry.uploading && (
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {!isSingle && photoEntries.length < quantity && (
                    <label className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 cursor-pointer transition">
                      <Plus className="w-4 h-4" />
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                    </label>
                  )}
                </div>
              )}

              {(photoEntries.length === 0 || (isSingle && photoEntries.length === 0)) && (
                <label className="block border-2 border-dashed border-gray-200 rounded-lg py-6 px-4 text-center text-gray-400 hover:border-gray-400 cursor-pointer">
                  <UploadCloud className="w-6 h-6 mx-auto mb-1.5 text-gray-400" />
                  <span className="text-[12px] font-semibold block text-gray-500">Click to browse or drag & drop</span>
                  <span className="text-[10px] mt-0.5 block">All image types accepted — any size</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={!isSingle}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
              )}

              {/* ── Image uploading banner ── */}
              {anyUploading && (
                <div className="mt-3 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
                  <div>
                    <p className="text-[12px] font-bold text-blue-700">Uploading your images…</p>
                    <p className="text-[10px] text-blue-500 mt-0.5">Please wait — your photos are being saved securely.</p>
                  </div>
                </div>
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
              disabled={anyUploading}
              className="w-full bg-[#1c1c1c] text-white py-3.5 rounded-lg font-bold uppercase tracking-wider hover:bg-black transition text-[12px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {anyUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading Images…
                </>
              ) : (
                "CONTINUE TO YOUR DETAILS →"
              )}
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
