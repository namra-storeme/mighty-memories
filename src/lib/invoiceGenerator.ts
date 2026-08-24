import PDFDocument from 'pdfkit';

interface InvoiceData {
  orderId: string;
  date: string;
  customerName: string;
  productType: string;
  packageDetails: string;
  subtotal: number;
  shipping: number;
  localPickup: boolean;
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
      const PAGE_W = 595.28; // A4 width in points
      const MARGIN = 45;
      const CONTENT_W = PAGE_W - MARGIN * 2;
      const RIGHT_COL_X = 350;
      const RIGHT_COL_W = PAGE_W - MARGIN - RIGHT_COL_X;

      const doc = new PDFDocument({ margin: MARGIN, size: 'A4', autoFirstPage: true });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Fetch logo
      let logoBuffer: Buffer | null = null;
      if (settings.logoUrl && settings.logoUrl.startsWith('http')) {
        try {
          const res = await fetch(settings.logoUrl);
          if (res.ok) logoBuffer = Buffer.from(await res.arrayBuffer());
        } catch {
          // ignore logo fetch failure
        }
      }

      // ── TOP RIGHT: INVOICE TITLE ──────────────────────────────────────
      doc.font('Helvetica-Bold').fontSize(26).fillColor('#111827')
         .text('INVOICE', RIGHT_COL_X, MARGIN, { width: RIGHT_COL_W, align: 'right' });

      doc.font('Helvetica').fontSize(10).fillColor('#6b7280')
         .text(`# ${data.orderId}`, RIGHT_COL_X, MARGIN + 34, { width: RIGHT_COL_W, align: 'right' });

      // Balance Due box (top right)
      const balBoxY = MARGIN + 58;
      doc.rect(RIGHT_COL_X, balBoxY, RIGHT_COL_W, 38).fill('#f9fafb');
      doc.font('Helvetica').fontSize(8).fillColor('#6b7280')
         .text('BALANCE DUE', RIGHT_COL_X + 8, balBoxY + 6, { width: RIGHT_COL_W - 16, align: 'right' });
      doc.font('Helvetica-Bold').fontSize(15).fillColor('#111827')
         .text(`$${data.total.toFixed(2)}`, RIGHT_COL_X + 8, balBoxY + 18, { width: RIGHT_COL_W - 16, align: 'right' });

      // ── TOP LEFT: LOGO + BUSINESS DETAILS ────────────────────────────
      let leftY = MARGIN;
      if (logoBuffer) {
        try {
          // Use `fit` so the logo keeps its aspect ratio
          doc.image(logoBuffer, MARGIN, leftY, { fit: [90, 90] });
          leftY += 100;
        } catch { /* skip broken image */ }
      }

      doc.font('Helvetica-Bold').fontSize(13).fillColor('#111827')
         .text(settings.businessName || 'Business Name', MARGIN, leftY, { width: 280 });
      leftY = doc.y + 4;

      doc.font('Helvetica').fontSize(9).fillColor('#6b7280');
      // Fix newlines: Firebase stores real \n chars, so just split on \n (single char)
      const addressLines = (settings.address || '').split('\n');
      addressLines.forEach(line => {
        doc.text(line, MARGIN, leftY, { width: 280 });
        leftY = doc.y;
      });

      if (settings.abn) {
        doc.text(settings.abn, MARGIN, leftY + 2, { width: 280 });
        leftY = doc.y;
      }
      if (settings.email) {
        doc.text(settings.email, MARGIN, leftY + 2, { width: 280 });
        leftY = doc.y;
      }

      // ── DIVIDER ───────────────────────────────────────────────────────
      const dividerY = Math.max(leftY, balBoxY + 38) + 20;
      doc.moveTo(MARGIN, dividerY).lineTo(PAGE_W - MARGIN, dividerY)
         .strokeColor('#e5e7eb').lineWidth(1).stroke();

      // ── BILL TO + INVOICE DATES ───────────────────────────────────────
      const sectionY = dividerY + 18;

      doc.font('Helvetica').fontSize(8).fillColor('#9ca3af')
         .text('BILL TO', MARGIN, sectionY);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827')
         .text(data.customerName, MARGIN, sectionY + 12, { width: 260 });

      // Dates on the right
      const dateRows = [
        ['Invoice Date', data.date],
        ['Terms', 'Due on Receipt'],
        ['Due Date', data.date],
      ];
      let dateY = sectionY;
      dateRows.forEach(([label, value]) => {
        doc.font('Helvetica').fontSize(9).fillColor('#6b7280')
           .text(label, RIGHT_COL_X, dateY, { width: 90 });
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#111827')
           .text(value, RIGHT_COL_X + 95, dateY, { width: RIGHT_COL_W - 95, align: 'right' });
        dateY += 18;
      });

      // ── TABLE ─────────────────────────────────────────────────────────
      const tableY = sectionY + 60;
      const COL = { hash: MARGIN, desc: MARGIN + 22, qty: 370, rate: 420, amt: 480 };

      // Table header
      doc.rect(MARGIN, tableY, CONTENT_W, 22).fill('#1f2937');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');
      doc.text('#', COL.hash, tableY + 7, { width: 18 });
      doc.text('ITEM & DESCRIPTION', COL.desc, tableY + 7, { width: 200 });
      doc.text('QTY', COL.qty, tableY + 7, { width: 44, align: 'right' });
      doc.text('RATE', COL.rate, tableY + 7, { width: 44, align: 'right' });
      doc.text('AMOUNT', COL.amt, tableY + 7, { width: 60, align: 'right' });

      // Table row
      const rowY = tableY + 32;
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#111827')
         .text('1', COL.hash, rowY, { width: 18 });
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827')
         .text(data.productType, COL.desc, rowY, { width: 210 });
      doc.font('Helvetica').fontSize(8).fillColor('#6b7280')
         .text(data.packageDetails, COL.desc, rowY + 14, { width: 210 });

      // Keep numbers at rowY (not affected by left column flow)
      doc.font('Helvetica').fontSize(9).fillColor('#111827')
         .text('1.00', COL.qty, rowY, { width: 44, align: 'right' });
      doc.text(`$${data.subtotal.toFixed(2)}`, COL.rate, rowY, { width: 44, align: 'right' });
      doc.font('Helvetica-Bold').text(`$${data.subtotal.toFixed(2)}`, COL.amt, rowY, { width: 60, align: 'right' });

      const afterRowY = rowY + 42;
      doc.moveTo(MARGIN, afterRowY).lineTo(PAGE_W - MARGIN, afterRowY)
         .strokeColor('#e5e7eb').lineWidth(0.5).stroke();

      // ── TOTALS ────────────────────────────────────────────────────────
      const totX = 340;
      const totW = PAGE_W - MARGIN - totX;
      let totY = afterRowY + 14;

      const totRow = (label: string, value: string, valueColor = '#111827') => {
        doc.font('Helvetica').fontSize(9).fillColor('#6b7280').text(label, totX, totY, { width: 100 });
        doc.font('Helvetica').fontSize(9).fillColor(valueColor).text(value, totX + 105, totY, { width: totW - 105, align: 'right' });
        totY += 18;
      };

      totRow('Sub Total', `$${data.subtotal.toFixed(2)}`);
      totRow(settings.taxLabel || 'Tax', data.tax === 0 ? 'Included' : `$${data.tax.toFixed(2)}`, data.tax === 0 ? '#059669' : '#111827');

      // Shipping row
      if (data.localPickup) {
        totRow('Shipping', 'Free — Local Pickup', '#059669');
      } else if (data.shipping > 0) {
        totRow('Shipping', `+ $${data.shipping.toFixed(2)}`);
      }
      // If over $40 free shipping: no shipping row at all

      // Balance Due box
      totY += 4;
      doc.rect(totX, totY, totW, 30).fill('#1f2937');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff')
         .text('BALANCE DUE', totX + 8, totY + 10, { width: 90 });
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff')
         .text(`$${data.total.toFixed(2)}`, totX + 8, totY + 9, { width: totW - 16, align: 'right' });

      // ── NOTES ────────────────────────────────────────────────────────
      const notesY = totY + 50;
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#374151')
         .text('NOTES', MARGIN, notesY);

      const noteBoxY = notesY + 14;
      // Fix: Firebase saves real \n chars. Split on the actual newline character.
      const noteLines = (settings.notes || '').split('\n');
      const noteBoxH = Math.max(60, noteLines.length * 12 + 20);
      doc.rect(MARGIN, noteBoxY, 300, noteBoxH).fill('#f9fafb');

      doc.font('Helvetica').fontSize(8.5).fillColor('#6b7280');
      let nY = noteBoxY + 10;
      noteLines.forEach(line => {
        doc.text(line.trim() === '' ? ' ' : line, MARGIN + 10, nY, { width: 280 });
        nY += 12;
      });

      // ── FOOTER ───────────────────────────────────────────────────────
      const footerY = 785;
      doc.moveTo(MARGIN, footerY).lineTo(PAGE_W - MARGIN, footerY)
         .strokeColor('#e5e7eb').lineWidth(0.5).stroke();
      doc.font('Helvetica').fontSize(8).fillColor('#9ca3af')
         .text(settings.footerText || 'Thank you for your business!', MARGIN, footerY + 8, { width: CONTENT_W / 2 });
      doc.text('Page 1 of 1', PAGE_W - MARGIN - 80, footerY + 8, { width: 80, align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
