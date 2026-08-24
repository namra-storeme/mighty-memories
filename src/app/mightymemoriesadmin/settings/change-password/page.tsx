"use client";
import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { submitNewPassword } from "../../actions";

export default function Page() {
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await submitNewPassword(formData);
  }, null);

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Enter New Password</h1>
          <p className="text-gray-500 text-sm">Your identity is verified. Please enter your new password.</p>
        </div>

        {state?.error && (
          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 border border-red-100 font-medium text-center">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-gray-50 focus:bg-white transition"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
