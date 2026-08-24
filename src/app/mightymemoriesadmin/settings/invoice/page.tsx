import { getDb } from "@/lib/firebase";
import { FileText, Save } from "lucide-react";
import { saveInvoiceSettings } from "../../actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InvoiceSettingsPage() {
  const db = getDb();
  const snap = await db.ref("settings/invoice").get();
  
  const defaultInvoice = {
    businessName: "Gujarati Lavari",
    address: "Sydney New South Wales\nAustralia",
    abn: "ABN 38238820266",
    email: "gujarativari@gmail.com",
    logoUrl: "",
    taxLabel: "Australian Tax (10%)",
    taxRate: 10,
    notes: "Account details:\n\nRAVI SHAH\n\nBSB: 082365\nAccount number: 894047798\n\nThanks for your business.",
    footerText: "POWERED BY"
  };

  const invoice = snap.exists() ? snap.val() : defaultInvoice;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/mightymemoriesadmin/settings" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Settings
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Invoice Configuration</h1>
            <p className="text-sm text-gray-500">Configure how your PDF invoices look when sent to customers.</p>
          </div>
        </div>

        <form action={saveInvoiceSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
              <input type="text" name="businessName" defaultValue={invoice.businessName} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ABN / Business ID</label>
              <input type="text" name="abn" defaultValue={invoice.abn} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
              <input type="text" name="email" defaultValue={invoice.email} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Logo Image URL</label>
              <input type="text" name="logoUrl" defaultValue={invoice.logoUrl} placeholder="https://..." className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition" />
              <p className="text-xs text-gray-500 mt-1">Optional. Link to a hosted image (PNG/JPG).</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Business Address</label>
            <textarea name="address" defaultValue={invoice.address} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Label (e.g. GST, VAT)</label>
              <input type="text" name="taxLabel" defaultValue={invoice.taxLabel} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Rate (%)</label>
              <input type="number" step="0.1" name="taxRate" defaultValue={invoice.taxRate} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes & Bank Details</label>
            <textarea name="notes" defaultValue={invoice.notes} rows={6} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition" />
            <p className="text-xs text-gray-500 mt-1">This appears at the bottom left of the invoice.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Footer Text</label>
            <input type="text" name="footerText" defaultValue={invoice.footerText} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition" />
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Invoice Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
