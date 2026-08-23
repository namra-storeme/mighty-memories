"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2, X, Plus, Minus, Package, ImageIcon, Truck } from "lucide-react";
import { useRouter } from "next/navigation";

type ProductType = "Custom Photo Magnets" | "Single Picture Magnets" | null;

// ── Pricing helpers ──────────────────────────────────────────────────────────
const SHIPPING = 8.99;
const FREE_SHIPPING_QTY = 40;

function getUnitPrice(product: ProductType, qty: number): number {
  if (product === "Custom Photo Magnets") {
    return qty >= 6 ? 4 : 5;
  }
  // Single Picture Magnets
  return 3.5;
}

function getSubtotal(product: ProductType, qty: number): number {
  return getUnitPrice(product, qty) * qty;
}

function getShipping(qty: number): number {
  return qty >= FREE_SHIPPING_QTY ? 0 : SHIPPING;
}

function getTotal(product: ProductType, qty: number): number {
  return getSubtotal(product, qty) + getShipping(qty);
}

// ── Min quantities ───────────────────────────────────────────────────────────
const MIN_QTY: Record<string, number> = {
  "Custom Photo Magnets": 3,
  "Single Picture Magnets": 10,
};

export default function ShopPage() {
  const router = useRouter();

  const [productType, setProductType] = useState<ProductType>(null);
  const [quantity, setQuantity] = useState<number>(3);
  const [photos, setPhotos] = useState<File[]>([]);
  const [comments, setComments] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Product selection ──────────────────────────────────────────────────────
  function selectProduct(p: ProductType) {
    setProductType(p);
    setQuantity(MIN_QTY[p!]);
    setPhotos([]);
    setError("");
  }

  // ── Quantity stepper ────────────────────────────────────────────────────────
  function changeQty(delta: number) {
    if (!productType) return;
    const min = MIN_QTY[productType];
    const next = Math.max(min, quantity + delta);
    setQuantity(next);
    // Trim photos if needed
    if (productType === "Custom Photo Magnets") {
      setPhotos((prev) => prev.slice(0, next));
    }
  }

  // ── Photo upload ───────────────────────────────────────────────────────────
  function handleFiles(incoming: FileList | null) {
    if (!incoming || !productType) return;
    const files = Array.from(incoming);
    if (productType === "Single Picture Magnets") {
      setPhotos([files[0]]);
    } else {
      setPhotos((prev) => {
        const combined = [...prev, ...files];
        return combined.slice(0, quantity); // cap at chosen qty
      });
    }
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate() {
    if (!productType) return "Please select a product.";
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
    formData.set("productType", productType!);
    formData.set(
      "packageDetails",
      `${quantity} magnets @ $${getUnitPrice(productType, quantity).toFixed(2)} each`
    );
    formData.set("quantity", quantity.toString());
    formData.set("totalAmount", getTotal(productType, quantity).toFixed(2));

    photos.forEach((file, i) => formData.append(`photo-${i}`, file));

    try {
      const res = await fetch("/api/order/submit", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process order.");
      router.push("/success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const unitPrice = productType ? getUnitPrice(productType, quantity) : 0;
  const subtotal = productType ? getSubtotal(productType, quantity) : 0;
  const shipping = getShipping(quantity);
  const total = productType ? getTotal(productType, quantity) : 0;
  const freeShipping = quantity >= FREE_SHIPPING_QTY;
  const isSingle = productType === "Single Picture Magnets";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Place Your Order</h1>
          <p className="text-gray-500 text-sm">Choose your product, upload your photos, and we'll handle the rest!</p>
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-5">

            {/* Product Selector */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide">1. Choose Product</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Custom Photo Magnets */}
                <button
                  type="button"
                  onClick={() => selectProduct("Custom Photo Magnets")}
                  className={`rounded-2xl border-2 p-5 text-left transition-all ${
                    productType === "Custom Photo Magnets"
                      ? "border-black bg-gray-50 ring-2 ring-black"
                      : "border-gray-200 hover:border-gray-400 bg-white"
                  }`}
                >
                  <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100">
                    <img src="/photo_magnets.jpg" alt="Custom Photo Magnets" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <ImageIcon className="w-4 h-4 text-gray-600" />
                    <span className="font-bold text-sm text-gray-900">Custom Photo Magnets</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">Different photos, each becomes its own magnet. Mix & match your favourite memories.</p>
                  <div className="mt-3 space-y-0.5">
                    <p className="text-xs font-semibold text-gray-700">$5.00/each (min 3)</p>
                    <p className="text-xs text-green-600 font-semibold">$4.00/each for 6+</p>
                    <p className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-1">
                      <Truck className="w-3 h-3" /> Free shipping on 40+
                    </p>
                  </div>
                </button>

                {/* Single Picture Magnets */}
                <button
                  type="button"
                  onClick={() => selectProduct("Single Picture Magnets")}
                  className={`rounded-2xl border-2 p-5 text-left transition-all ${
                    productType === "Single Picture Magnets"
                      ? "border-black bg-gray-50 ring-2 ring-black"
                      : "border-gray-200 hover:border-gray-400 bg-white"
                  }`}
                >
                  <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100">
                    <img src="/single_bulk_magnets.jpg" alt="Single Picture Magnets" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="font-bold text-sm text-gray-900">Single Picture Magnets</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">One photo printed on many magnets. Perfect for events, gifts, and giveaways.</p>
                  <div className="mt-3 space-y-0.5">
                    <p className="text-xs font-semibold text-gray-700">$3.50/each (min 10)</p>
                    <p className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-1">
                      <Truck className="w-3 h-3" /> Free shipping on 40+
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Photo Upload + Comments + Quantity (shown after product selected) */}
            {productType && (
              <>
                {/* Upload Photos */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-1 uppercase tracking-wide">
                    2. Upload {isSingle ? "Your Photo" : `Photos (${photos.length}/${quantity})`}
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">
                    {isSingle
                      ? "Upload 1 photo — we'll print it on all your magnets."
                      : `Upload exactly ${quantity} photo${quantity > 1 ? "s" : ""} — one per magnet.`}
                  </p>

                  {/* Photo Grid */}
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {photos.map((file, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={URL.createObjectURL(file)} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5">#{i + 1}</span>
                        </div>
                      ))}
                      {/* Add more button (Custom Photo only, if slots remain) */}
                      {!isSingle && photos.length < quantity && (
                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black cursor-pointer transition">
                          <Plus className="w-5 h-5" />
                          <span className="text-[10px] mt-0.5">Add</span>
                          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                        </label>
                      )}
                    </div>
                  )}

                  {/* Drop Zone (shown when empty, or for single pick) */}
                  {(photos.length === 0 || (isSingle && photos.length === 0)) && (
                    <label className="block border-2 border-dashed border-gray-300 rounded-xl py-10 px-4 text-center text-gray-400 hover:border-black hover:text-black hover:bg-gray-50 transition cursor-pointer">
                      <UploadCloud className="w-10 h-10 mx-auto mb-2" />
                      <span className="text-sm font-semibold block">Click to browse or drag & drop</span>
                      <span className="text-xs mt-1 block">PNG, JPG, HEIC accepted</span>
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

                  {/* Upload button when Custom and all slots not filled */}
                  {!isSingle && photos.length > 0 && photos.length < quantity && (
                    <p className="text-xs text-amber-600 font-medium mt-3 text-center">
                      {quantity - photos.length} more photo{quantity - photos.length > 1 ? "s" : ""} needed
                    </p>
                  )}
                </div>

                {/* Comments */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-1 uppercase tracking-wide">3. Special Instructions</h2>
                  <p className="text-xs text-gray-400 mb-3">Any notes about layout, sizing, or your order? Let us know here.</p>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    placeholder="e.g. Please keep the photos in the order I uploaded them..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition resize-none"
                  />
                </div>

                {/* Quantity + Pricing */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide">4. Quantity</h2>

                  {/* Free shipping nudge */}
                  {!freeShipping && (
                    <p className="text-xs text-blue-600 font-semibold mb-4 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      Free shipping on {FREE_SHIPPING_QTY}+ pieces!
                    </p>
                  )}
                  {freeShipping && (
                    <p className="text-xs text-green-600 font-semibold mb-4 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      🎉 You qualify for FREE shipping!
                    </p>
                  )}

                  {/* Stepper */}
                  <div className="flex items-center gap-4 mb-5">
                    <button
                      type="button"
                      onClick={() => changeQty(-1)}
                      disabled={quantity <= MIN_QTY[productType]}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-black hover:text-black disabled:opacity-30 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-extrabold text-gray-900 min-w-[2ch] text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(1)}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-black hover:text-black transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-400 ml-2">${unitPrice.toFixed(2)} each</span>
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>{quantity} × ${unitPrice.toFixed(2)}</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      {freeShipping
                        ? <span className="text-green-600 font-semibold">FREE</span>
                        : <span>${SHIPPING.toFixed(2)}</span>
                      }
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2 mt-1">
                      <span>Total</span>
                      <span>${total.toFixed(2)} AUD</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 border border-red-100 rounded-xl text-sm font-medium">{error}</div>
                )}

                <button
                  type="button"
                  onClick={handleProceed}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold uppercase tracking-wide hover:bg-gray-800 transition text-sm"
                >
                  Continue to Your Details →
                </button>
              </>
            )}
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Order Summary bar */}
            <div className="bg-black text-white rounded-2xl px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs opacity-60 uppercase tracking-wide">{productType}</p>
                <p className="font-bold text-lg">${total.toFixed(2)} AUD</p>
              </div>
              <button type="button" onClick={() => setStep(1)} className="text-xs opacity-60 hover:opacity-100 underline transition">
                ← Edit order
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5 uppercase tracking-wide">Your Contact & Shipping Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Full Name *</label>
                    <input type="text" name="name" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Email Address *</label>
                    <input type="email" name="email" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Phone Number *</label>
                  <input type="tel" name="phone" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Shipping Address *</label>
                  <textarea name="address" required rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition resize-none" placeholder="Street, Suburb, State, Postcode" />
                </div>
                <input type="hidden" name="comments" value={comments} />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 border border-red-100 rounded-xl text-sm font-medium">{error}</div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-black font-medium text-sm transition text-center py-3">
                ← Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-black text-white py-4 rounded-2xl font-bold uppercase tracking-wide hover:bg-gray-800 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Submit Order"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
