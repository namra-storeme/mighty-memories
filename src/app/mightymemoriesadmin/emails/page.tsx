import { getDb } from "@/lib/firebase";
import { Mail, ShieldAlert, CheckCircle, Package, Truck, CheckCheck, XCircle } from "lucide-react";
import TemplateForm from "./TemplateForm";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  const db = getDb();
  const settingsSnap = await db.ref("settings/config").get();
  const settings = settingsSnap.val() || {};

  const templates = [
    {
      id: "adminNewOrder",
      title: "Admin Alert: New Order Received",
      desc: "Sent to YOU when a customer places a new order.",
      icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
      bg: "bg-red-50",
      defaultSub: "New Order Received! - m2 Mighty Memories",
      defaultBody: "You have received a new order. Please check the admin dashboard for details."
    },
    {
      id: "receiptEmail",
      title: "Customer: Order Confirmation (Receipt)",
      desc: "Sent to the CUSTOMER immediately after checkout.",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      bg: "bg-green-50",
      defaultSub: "Order Confirmation - m2 Mighty Memories",
      defaultBody: "Thank you for your order! We are preparing your custom stickers."
    },
    {
      id: "processingEmail",
      title: "Customer: Order Processing",
      desc: "Sent to the CUSTOMER when you change status to 'Processing'.",
      icon: <Package className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50",
      defaultSub: "We're working on your order! - m2 Mighty Memories",
      defaultBody: "We have started processing your custom magnets! We will let you know when they ship."
    },
    {
      id: "shippingEmail",
      title: "Customer: Order Shipped",
      desc: "Sent to the CUSTOMER when you change status to 'Shipped'.",
      icon: <Truck className="w-5 h-5 text-purple-500" />,
      bg: "bg-purple-50",
      defaultSub: "Your Order has Shipped! - m2 Mighty Memories",
      defaultBody: "Great news! Your custom stickers have been shipped."
    },
    {
      id: "completedEmail",
      title: "Customer: Order Completed",
      desc: "Sent to the CUSTOMER when you change status to 'Completed'.",
      icon: <CheckCheck className="w-5 h-5 text-teal-500" />,
      bg: "bg-teal-50",
      defaultSub: "Your order is complete! - m2 Mighty Memories",
      defaultBody: "Your order is now marked as completed. We hope you love your magnets!"
    },
    {
      id: "cancelledEmail",
      title: "Customer: Order Cancelled",
      desc: "Sent to the CUSTOMER when you change status to 'Cancelled'.",
      icon: <XCircle className="w-5 h-5 text-gray-500" />,
      bg: "bg-gray-100",
      defaultSub: "Order Cancelled - m2 Mighty Memories",
      defaultBody: "Your order has been cancelled. If you have any questions, please contact us."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
          <Mail className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Email Templates</h1>
          <p className="text-gray-500 mt-1">Customize the automated emails sent to you and your customers.</p>
        </div>
      </div>

      <div className="space-y-6">
        {templates.map((tpl) => (
          <TemplateForm 
            key={tpl.id} 
            tpl={tpl} 
            currentSubject={settings[`${tpl.id}Subject`]} 
            currentBody={settings[`${tpl.id}Body`]} 
          />
        ))}
      </div>
    </div>
  );
}
