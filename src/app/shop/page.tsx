"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, ChevronRight, ChevronLeft, Plus, Truck, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Pricing Logic ────────────────────────────────────────────────
type ProductType = "custom" | "single";

const FREE_SHIPPING_QTY = 40;
const SHIPPING_COST = 8.99;

function getUnitPrice(product: ProductType, qty: number): number {
  if (product === "single") return 3.5;
  // custom photo magnets
  return qty >= 6 ? 4 : 5;
}

function getSubtotal(product: ProductType, qty: number): number {
  return getUnitPrice(product, qty) * qty;
}

function getShipping(qty: number): number {
  return qty >= FREE_SHIPPING_QTY ? 0 : SHIPPING_COST;
}

function getTotal(product: ProductType, qty: number): number {
  return getSubtotal(product, qty) + getShipping(qty);
}

// ─── Component ────────────────────────────────────────────────────
export default function ShopPage() {
  const router = useRouter();

  // Step 1 state
  const [product, setProduct] = useState<ProductType | null>(null);
  const [qty, setQty] = useState<number>(3);
  const [qtyInput, setQtyInput] = useState<string>("3");
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [step1Error, setStep1Error] = useState("");

  // Step 2 state
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Derived ──
  const minQty = product === "single" ? 10 : 3;

  const handleProductSelect = (p: ProductType) => {
    setProduct(p);
    const min = p === "single" ? 10 : 3;
    setQty(min);
    setQtyInput(String(min));
    setPhotos([]);
    setStep1Error("");
  };

  const handleQtyChange = (val: string) => {
    setQtyInput(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= minQty) {
      setQty(n);
      // If single picture — only 1 photo needed regardless
      if (product === "custom" && photos.length > n) {
        setPhotos((prev) => prev.slice(0, n));
      }
    }
  };

  const handleQtyBlur = () => {
    const n = parseInt(qtyInput, 10);
    if (isNaN(n) || n < minQty) {
      setQty(minQty);
      setQtyInput(String(minQty));
    }
  };

  const handleAddPhotos = (files: FileList | null) => {
    if (!files) return;
    const maxPhotos = product === "single" ? 1 : qty;
    const incoming = Array.from(files);
    setPhotos((prev) => {
      const combined = [...prev, ...incoming];
      return combined.slice(0, maxPhotos);
    });
  };

  const handleRemovePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleProceed = () => {
    if (!product) return setStep1Error("Please select a product type.");
    const n = parseInt(qtyInput, 10);
    if (isNaN(n) || n < minQty) return setStep1Error(`Minimum quantity is ${minQty}.`);

    const requiredPhotos = product === "single" ? 1 : n;
    if (photos.length < requiredPhotos) {
      return setStep1Error(
        product === "single"
          ? "Please upload 1 photo for the single picture bulk order."
          : `Please upload all ${n} photos (you have ${photos.length}).`
      );
    }
    setStep1Error("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);

    const subtotal = getSubtotal(product!, qty);
    const shipping = getShipping(qty);
    const total = subtotal + shipping;

    formData.append("productType", product === "custom" ? "Custom Photo Magnets" : "Single Picture Bulk");
    formData.append("packageDetails", `${qty} magnets @ $${getUnitPrice(product!, qty).toFixed(2)} each`);
    formData.append("quantity", String(qty));
    formData.append("totalAmount", total.toFixed(2));
    formData.append("notes", notes);

    photos.forEach((file, i) => {
      formData.append(`photo-${i}`, file);
    });

    try {
      const res = await fetch("/api/order/submit", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order.");
      router.push("/success");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred.");
      setIsSubmitting(false);
    }
  };

  // ── Render helpers ──
  const unitPrice = product ? getUnitPrice(product, qty) : 0;
  const subtotal = product ? getSubtotal(product, qty) : 0;
  const shipping = getShipping(qty);
  const total = subtotal + shipping;
  const freeShipping = qty >= FREE_SHIPPING_QTY;
  const requiredPhotos = product === "single" ? 1 : qty;

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Place Your Order</h1>
          <p className="text-gray-500 text-sm">Select a product, upload your photos, and we'll handle the rest!</p>
        </div>

        {/* ═══ STEP 1 ═══ */}
        {step === 1 && (
          <div className="space-y-5">

            {/* 1. Product Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">1. Select Product</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Custom Photo Magnets */}
                <button
                  type="button"
                  onClick={() => handleProductSelect("custom")}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    product === "custom"
                      ? "border-black bg-gray-50 ring-1 ring-black"
                      : "border-gray-200 hover:border-gray-400 bg-white"
                  }`}
                >
                  {product === "custom" && (
                    <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-black" />
                  )}
                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3">
                    <img src="/photo_magnets.jpg" alt="Custom Photo Magnets" className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold text-sm text-gray-900">Custom Photo Magnets</p>
                  <p className="text-xs text-gray-500 mt-1">Different photo on each magnet. Min 3.</p>
                  <p className="text-xs font-semibold text-green-700 mt-1">$5/each · $4/each for 6+</p>
                </button>

                {/* Single Picture Bulk */}
                <button
                  type="button"
                  onClick={() => handleProductSelect("single")}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    product === "single"
                      ? "border-black bg-gray-50 ring-1 ring-black"
                      : "border-gray-200 hover:border-gray-400 bg-white"
                  }`}
                >
                  {product === "single" && (
                    <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-black" />
                  )}
                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3">
                    <img src="/single_bulk_magnets.jpg" alt="Single Picture Bulk" className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold text-sm text-gray-900">Single Picture Bulk</p>
                  <p className="text-xs text-gray-500 mt-1">Same photo on many magnets. Min 10.</p>
                  <p className="text-xs font-semibold text-green-700 mt-1">$3.50/each</p>
                </button>
              </div>

              {/* Free shipping badge */}
              {product && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                  <Truck className="w-3.5 h-3.5 shrink-0" />
                  Free shipping on orders of 40+ magnets!
                </div>
              )}
            </div>

            {/* 2. Quantity */}
            {product && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">2. Choose Quantity</h2>
                <p className="text-xs text-gray-400 mb-4">Minimum {minQty} magnets</p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const n = Math.max(minQty, qty - 1);
                      setQty(n); setQtyInput(String(n));
                      if (product === "custom" && photos.length > n) setPhotos((p) => p.slice(0, n));
                    }}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:border-black transition font-bold text-lg"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={qtyInput}
                    min={minQty}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    onBlur={handleQtyBlur}
                    className="w-20 text-center border-2 border-gray-300 rounded-xl py-2 text-lg font-bold focus:outline-none focus:border-black transition"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const n = qty + 1;
                      setQty(n); setQtyInput(String(n));
                    }}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:border-black transition font-bold text-lg"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">magnets</span>
                </div>

                {/* Pricing info */}
                <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm space-y-1 border border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>{qty} × ${unitPrice.toFixed(2)}</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={freeShipping ? "text-green-600 font-semibold" : ""}>
                      {freeShipping ? "FREE 🎉" : `+$${SHIPPING_COST.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>${total.toFixed(2)} AUD</span>
                  </div>
                  {!freeShipping && (
                    <p className="text-[11px] text-gray-400 pt-1">
                      Order {FREE_SHIPPING_QTY - qty} more to get free shipping!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 3. Upload Photos */}
            {product && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">3. Upload Your Photos</h2>
                <p className="text-xs text-gray-400 mb-4">
                  {product === "single"
                    ? "Upload 1 photo — we'll print it on all your magnets."
                    : `Upload up to ${qty} photo${qty > 1 ? "s" : ""} — one per magnet. (${photos.length}/${qty} uploaded)`}
                </p>

                {/* Upload box */}
                {photos.length < requiredPhotos && (
                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl py-8 cursor-pointer hover:border-black hover:bg-gray-50 transition text-center mb-4">
                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm font-semibold text-gray-700">Click to browse photos</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, HEIC — up to 50MB each</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple={product === "custom"}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAddPhotos(e.target.files)}
                    />
                  </label>
                )}

                {/* Preview grid */}
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {photos.map((file, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(i)}
                          className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] text-white bg-black/50 py-0.5">
                          Photo {i + 1}
                        </span>
                      </div>
                    ))}
                    {/* Add more button (for custom) */}
                    {product === "custom" && photos.length < qty && (
                      <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-black cursor-pointer transition">
                        <Plus className="w-5 h-5" />
                        <span className="text-[10px] mt-1">Add more</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleAddPhotos(e.target.files)}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. Notes */}
            {product && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">4. Notes / Special Instructions</h2>
                <p className="text-xs text-gray-400 mb-3">Any special requests, size preferences, or instructions for us.</p>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please make the colours slightly warmer, or crop tightly to the faces..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition resize-y"
                />
              </div>
            )}

            {/* Error */}
            {step1Error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                {step1Error}
              </div>
            )}

            {/* Proceed Button */}
            {product && (
              <button
                type="button"
                onClick={handleProceed}
                className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-wide hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm"
              >
                Proceed to Your Details
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* ═══ STEP 2 ═══ */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Order Summary</h2>
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5 border border-gray-100">
                <div className="flex justify-between text-gray-700 font-semibold">
                  <span>{product === "custom" ? "Custom Photo Magnets" : "Single Picture Bulk"}</span>
                  <span>{qty} magnets</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Price per magnet</span>
                  <span>${unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className={freeShipping ? "text-green-600 font-semibold" : ""}>{freeShipping ? "FREE 🎉" : `$${SHIPPING_COST.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)} AUD</span>
                </div>
              </div>
            </div>

            {/* Contact & Shipping */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Contact & Shipping Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Full Name *</label>
                    <input type="text" name="name" required className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email Address *</label>
                    <input type="email" name="email" required className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Phone Number *</label>
                  <input type="tel" name="phone" required className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Shipping Address *</label>
                  <textarea name="address" required rows={3} className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition resize-y" />
                </div>
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">{submitError}</div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="flex items-center justify-center gap-2 text-gray-500 hover:text-black font-semibold text-sm transition py-3 px-4 rounded-xl border border-gray-200 hover:border-gray-400"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-black text-white py-4 rounded-xl font-bold uppercase tracking-wide hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : "Submit Order"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
