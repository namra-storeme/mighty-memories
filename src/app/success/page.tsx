import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center border border-gray-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Order Processing!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Thank you for choosing m2 Mighty Memories! We have successfully received your photos and shipping details. We will email you shortly to confirm your order and provide payment instructions.
        </p>
        <Link
          href="/"
          className="inline-block w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-md"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
