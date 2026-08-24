import PDFDocument from 'pdfkit';

interface InvoiceData {
  orderId: string;
  date: string;
  customerName: string;
  productType: string;
  packageDetails: string;
  subtotal: number;
  tax: number;
  total: number;
}

interface InvoiceSettings {
  businessName: string;
  address: string;
  abn: string;
  email: string;
  logoUrl?: string;
  taxLabel: string;
  taxRate: number;
  notes: string;
  footerText: string;
}

export async function generateInvoiceBuffer(data: InvoiceData, settings: InvoiceSettings): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // We will skip loading external image logos in pdfkit if it's a URL because
      // pdfkit only natively supports Buffer/ArrayBuffer or file paths.
      // We can fetch the logo if provided.
      let logoBuffer: Buffer | null = null;
      if (settings.logoUrl && settings.logoUrl.startsWith('http')) {
        try {
          const res = await fetch(settings.logoUrl);
          if (res.ok) {
            logoBuffer = Buffer.from(await res.arrayBuffer());
          }
        } catch (e) {
          console.warn("Could not fetch logo for PDF:", e);
        }
      }

      const topY = 40;
      
      // Header: Logo and Business Details
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, 40, topY, { width: 80, height: 80 });
          doc.y = topY + 90;
        } catch (e) {
          // Fallback if image format not supported by pdfkit (e.g. webp)
          doc.y = topY;
        }
      } else {
        doc.y = topY;
      }

      doc.font('Helvetica-Bold').fontSize(14).text(settings.businessName || 'Business Name');
      doc.font('Helvetica').fontSize(10).fillColor('#4b5563');
      settings.address.split('\\n').forEach(line => doc.text(line));
      if (settings.abn) doc.moveDown(0.2).text(settings.abn);
      if (settings.email) doc.text(settings.email);

      // Header: INVOICE and Balance
      doc.font('Helvetica-Bold').fontSize(24).fillColor('#111827').text('INVOICE', 350, topY, { align: 'right' });
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#6b7280').text(`# ${data.orderId}`, 350, topY + 28, { align: 'right' });
      
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#6b7280').text('BALANCE DUE', 350, topY + 60, { align: 'right' });
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#111827').text(`$${data.total.toFixed(2)}`, 350, topY + 72, { align: 'right' });

      // Bill To & Dates
      const midY = doc.y + 30;
      
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#6b7280').text('BILL TO', 40, midY);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827').text(data.customerName, 40, midY + 14);

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#6b7280').text('Invoice Date:', 350, midY);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text(data.date, 450, midY, { align: 'right' });
      
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#6b7280').text('Terms:', 350, midY + 18);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('Due on Receipt', 450, midY + 18, { align: 'right' });

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#6b7280').text('Due Date:', 350, midY + 36);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text(data.date, 450, midY + 36, { align: 'right' });

      // Table Header
      const tableY = midY + 80;
      doc.rect(40, tableY, 515, 25).fill('#f3f4f6');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#374151');
      doc.text('#', 50, tableY + 8);
      doc.text('ITEM & DESCRIPTION', 80, tableY + 8);
      doc.text('QTY', 360, tableY + 8, { width: 30, align: 'right' });
      doc.text('RATE', 410, tableY + 8, { width: 60, align: 'right' });
      doc.text('AMOUNT', 480, tableY + 8, { width: 60, align: 'right' });

      // Table Row
      const rowY = tableY + 35;
      doc.font('Helvetica').fontSize(10).fillColor('#111827');
      doc.text('1', 50, rowY);
      doc.font('Helvetica-Bold').text(data.productType, 80, rowY);
      doc.font('Helvetica').fontSize(9).fillColor('#6b7280').text(data.packageDetails, 80, rowY + 14);
      
      doc.font('Helvetica').fontSize(10).fillColor('#111827');
      doc.text('1.00', 360, rowY, { width: 30, align: 'right' });
      doc.text(`$${data.subtotal.toFixed(2)}`, 410, rowY, { width: 60, align: 'right' });
      doc.text(`$${data.subtotal.toFixed(2)}`, 480, rowY, { width: 60, align: 'right' });
      
      doc.moveTo(40, rowY + 40).lineTo(555, rowY + 40).strokeColor('#e5e7eb').stroke();

      // Totals
      const totalY = rowY + 60;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#6b7280').text('Sub Total', 350, totalY);
      doc.font('Helvetica-Bold').fillColor('#111827').text(`$${data.subtotal.toFixed(2)}`, 480, totalY, { width: 60, align: 'right' });

      doc.font('Helvetica-Bold').fillColor('#6b7280').text(settings.taxLabel, 350, totalY + 20);
      if (data.tax === 0) {
        doc.font('Helvetica-Bold').fillColor('#059669').text('Included', 480, totalY + 20, { width: 60, align: 'right' });
      } else {
        doc.font('Helvetica-Bold').fillColor('#111827').text(`$${data.tax.toFixed(2)}`, 480, totalY + 20, { width: 60, align: 'right' });
      }

      doc.rect(340, totalY + 45, 215, 30).fill('#f9fafb');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827');
      doc.text('Balance Due', 350, totalY + 55);
      doc.text(`$${data.total.toFixed(2)}`, 480, totalY + 55, { width: 60, align: 'right' });

      // Notes
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('NOTES', 40, totalY + 100);
      doc.rect(40, totalY + 115, 300, 100).fill('#f9fafb');
      doc.font('Helvetica').fontSize(9).fillColor('#6b7280');
      let noteY = totalY + 125;
      settings.notes.split('\\n').forEach(line => {
        doc.text(line || ' ', 50, noteY);
        noteY += 12;
      });

      // Footer
      doc.moveTo(40, 780).lineTo(555, 780).strokeColor('#e5e7eb').stroke();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#9ca3af').text(settings.footerText, 40, 795);
      doc.text('PAGE 1 OF 1', 500, 795, { align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
