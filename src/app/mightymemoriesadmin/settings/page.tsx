import { getDb } from "@/lib/firebase";
import { Settings as SettingsIcon, FileText } from "lucide-react";
import { updateAbout } from "../actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const db = getDb();
  
  const [settingsSnap, aboutSnap] = await Promise.all([
    db.ref("settings/config").get(),
    db.ref("settings/about").get()
  ]);

  const settings = settingsSnap.val() || {};
  const about = aboutSnap.val() || {};
  const defaultAbout = "Welcome to m2 mighty memories! We specialize in turning your beautiful memories into custom magnet stickers.";

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Store Settings</h1>
      
      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">General Configuration</h2>
              <p className="text-sm text-gray-500">Configure email addresses and store details.</p>
            </div>
          </div>

          <form action={async () => {
            "use server";
            const { initiateEmailChange } = await import("../actions");
            await initiateEmailChange();
          }} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Notification Email</label>
              <input
                type="email"
                disabled
                value={settings.email || "admin@mightymemories.com"}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">To change this email, you must first verify your identity with an OTP sent to your current email.</p>
            </div>

            <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg">
              Change Email
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-500">Update your admin login password securely.</p>
            </div>
          </div>

          <form action={async () => {
            "use server";
            const { initiatePasswordChange } = await import("../actions");
            await initiatePasswordChange();
          }} className="space-y-6">
            <p className="text-sm text-gray-700 mb-4">
              To change your password, we will first send an OTP to your admin email address to verify your identity.
            </p>
            <button type="submit" className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg">
              Initiate Password Change
            </button>
          </form>
        </div>

        {/* About Us */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">About Us Content</h2>
              <p className="text-sm text-gray-500">Shown on the About Us page</p>
            </div>
          </div>
          
          <form action={updateAbout} className="space-y-4">
            <textarea
              name="content"
              rows={6}
              defaultValue={about.content || defaultAbout}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-y bg-gray-50 focus:bg-white transition"
            ></textarea>
            <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg">
              Save About Us
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
