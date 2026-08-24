"use client";
import { useActionState } from "react";
import { Mail } from "lucide-react";
import { submitNewEmail } from "../../actions";

export default function Page() {
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await submitNewEmail(formData);
  }, null);

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Enter New Email</h1>
          <p className="text-gray-500 text-sm">Your identity is verified. Please enter the new email address you want to use.</p>
        </div>

        {state?.error && (
          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 border border-red-100 font-medium text-center">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Email Address</label>
            <input
              type="email"
              name="newEmail"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {isPending ? "Sending OTP..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
