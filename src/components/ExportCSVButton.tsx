"use client";

import { Download } from "lucide-react";

export default function ExportCSVButton({ orders }: { orders: any[] }) {
  const handleDownload = () => {
    // Find max photos to create enough columns
    const maxPhotos = Math.max(...orders.map(o => (o.photos || []).length), 1);
    const imageHeaders = Array.from({ length: maxPhotos }, (_, i) => `Image ${i + 1}`);

    // Define CSV Headers
    const headers = [
      "No.",
      "Order ID",
      "Date",
      "Time",
      "Status",
      "Name",
      "Email",
      "Phone",
      "Address",
      "Product",
      "Quantity / Package",
      "Price",
      "Comments",
      ...imageHeaders
    ];

    // Map orders to CSV rows
    const rows = orders.map((order, index) => {
      const dateObj = new Date(order.createdAt);
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toLocaleTimeString();
      
      const images = Array.from({ length: maxPhotos }, (_, i) => {
        const photo = (order.photos || [])[i];
        return photo ? `"${photo.url}"` : '""';
      });

      return [
        orders.length - index,
        `="${order.id}"`, // Force Excel to treat as string to prevent #NAME? from leading '-'
        date,
        time,
        order.status,
        `"${(order.name || "").replace(/"/g, '""')}"`,
        `"${(order.email || "").replace(/"/g, '""')}"`,
        `"${(order.phone || "").replace(/"/g, '""')}"`,
        `"${(order.address || "").replace(/"/g, '""').replace(/\n/g, ', ')}"`,
        `"${(order.productType || "").replace(/"/g, '""')}"`,
        `"${(order.packageDetails || "").replace(/"/g, '""')}"`,
        `$${order.totalAmount}`,
        `"${(order.comments || "").replace(/"/g, '""')}"`,
        ...images
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mighty-memories-orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-green-700 transition"
    >
      <Download className="w-4 h-4" />
      Export to PC (Excel / CSV)
    </button>
  );
}
