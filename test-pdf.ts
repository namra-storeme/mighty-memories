import { generateInvoiceBuffer } from "./src/lib/invoiceGenerator";
import fs from "fs";

async function main() {
  try {
    const data = {
      orderId: "MM-TEST",
      date: "24/08/2026",
      customerName: "Test User",
      customerAddress: "123 Test St\nSydney NSW 2000",
      productType: "Magnets",
      packageDetails: "25pcs",
      subtotal: 45,
      shipping: 0,
      localPickup: false,
      tax: 0,
      total: 45
    };
    
    const settings = {
      businessName: "Mighty Memories",
      address: "Sydney",
      abn: "123",
      email: "test@test.com",
      taxLabel: "Tax",
      taxRate: 10,
      notes: "Test",
      footerText: "Test",
      logoUrl: ""
    };

    console.log("Generating...");
    const buffer = await generateInvoiceBuffer(data, settings);
    fs.writeFileSync("test.pdf", buffer);
    console.log("Done");
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
