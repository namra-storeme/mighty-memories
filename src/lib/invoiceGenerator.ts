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

// Safely split a string on any line ending (\r\n, \r, or \n) and trim whitespace from each line
function splitLines(text: string): string[] {
  return (text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
}

export async function generateInvoiceBuffer(data: InvoiceData, settings: InvoiceSettings): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // ── PAGE SETUP ─────────────────────────────────────────────────────────
      const PAGE_H = 841.89;  // A4 height in points
      const PAGE_W = 595.28;  // A4 width
      const M = 40;           // margin

      const doc = new PDFDocument({
        size: 'A4',
        margin: M,
        // Disable auto-page — we control layout manually to guarantee 1 page
        autoFirstPage: true,
        bufferPages: true,
      });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ── LOGO FETCH ─────────────────────────────────────────────────────────
      let logoBuffer: Buffer | null = null;
      if (settings.logoUrl && settings.logoUrl.startsWith('http')) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(settings.logoUrl, { signal: controller.signal });
          clearTimeout(timeout);
          if (res.ok) logoBuffer = Buffer.from(await res.arrayBuffer());
        } catch { /* skip */ }
      }

      // ── HELPERS ────────────────────────────────────────────────────────────
      const drawLine = (y: number, color = '#e5e7eb') => {
        doc.moveTo(M, y).lineTo(PAGE_W - M, y).strokeColor(color).lineWidth(0.5).stroke();
      };

      // ── BACKGROUND ACCENT ──────────────────────────────────────────────────
      // Subtle top-right accent block
      doc.rect(PAGE_W - 220, 0, 220, 130).fill('#f8fafc');

      // ── HEADER ─────────────────────────────────────────────────────────────
      let curY = M;

      // Logo (top-left, capped at 72x72, preserving aspect ratio)
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, M, curY, { fit: [72, 72] });
        } catch { /* skip bad image */ }
      }

      // "INVOICE" title — top right
      doc.font('Helvetica-Bold').fontSize(28).fillColor('#0f172a')
         .text('INVOICE', M, curY, { width: PAGE_W - M * 2, align: 'right' });

      // Invoice number
      doc.font('Helvetica').fontSize(10).fillColor('#64748b')
         .text(`# ${data.orderId}`, M, curY + 34, { width: PAGE_W - M * 2, align: 'right' });

      // Balance due pill (top right)
      const balY = curY + 54;
      doc.roundedRect(PAGE_W - M - 130, balY, 130, 42, 6).fill('#0f172a');
      doc.font('Helvetica').fontSize(7.5).fillColor('#94a3b8')
         .text('BALANCE DUE', PAGE_W - M - 126, balY + 7, { width: 122, align: 'center' });
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#ffffff')
         .text(`$${data.total.toFixed(2)}`, PAGE_W - M - 126, balY + 20, { width: 122, align: 'center' });

      // Business name + details (below logo)
      const bizY = (logoBuffer ? curY + 80 : curY + 36);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a')
         .text(settings.businessName || '', M, bizY, { width: 280 });
      doc.font('Helvetica').fontSize(8.5).fillColor('#64748b');
      let bizDetailY = doc.y + 2;

      splitLines(settings.address).forEach(line => {
        doc.text(line.trim(), M, bizDetailY, { width: 280 });
        bizDetailY = doc.y;
      });
      if (settings.abn) { doc.text(settings.abn.trim(), M, bizDetailY, { width: 280 }); bizDetailY = doc.y; }
      if (settings.email) { doc.text(settings.email.trim(), M, bizDetailY, { width: 280 }); bizDetailY = doc.y; }

      curY = Math.max(bizDetailY, balY + 48) + 16;

      // ── DIVIDER ────────────────────────────────────────────────────────────
      drawLine(curY);
      curY += 16;

      // ── BILL-TO + DATES ────────────────────────────────────────────────────
      const LEFT_W = 260;
      const DATE_X = PAGE_W - M - 200;
      const DATE_VAL_X = PAGE_W - M - 100;
      const DATE_VAL_W = 100;

      doc.font('Helvetica').fontSize(7.5).fillColor('#94a3b8')
         .text('BILL TO', M, curY, { width: LEFT_W });
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a')
         .text(data.customerName, M, curY + 11, { width: LEFT_W });

      const dateRows: [string, string][] = [
        ['Invoice Date', data.date],
        ['Payment Terms', 'Due on Receipt'],
        ['Due Date', data.date],
      ];
      let dY = curY;
      dateRows.forEach(([label, value]) => {
        doc.font('Helvetica').fontSize(8.5).fillColor('#64748b')
           .text(label, DATE_X, dY, { width: 95 });
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0f172a')
           .text(value, DATE_VAL_X, dY, { width: DATE_VAL_W, align: 'right' });
        dY += 16;
      });

      curY = Math.max(curY + 40, dY) + 14;

      // ── TABLE ──────────────────────────────────────────────────────────────
      const COL = {
        hash: M, desc: M + 20, qty: 360, rate: 415, amt: 470,
        hashW: 16, descW: 220, numW: 50, amtW: 60,
      };
      const TH = 20;

      // Header bar
      doc.rect(M, curY, PAGE_W - M * 2, TH).fill('#0f172a');
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#cbd5e1');
      doc.text('#', COL.hash, curY + 6, { width: COL.hashW });
      doc.text('ITEM & DESCRIPTION', COL.desc, curY + 6, { width: COL.descW });
      doc.text('QTY', COL.qty, curY + 6, { width: COL.numW, align: 'right' });
      doc.text('RATE', COL.rate, curY + 6, { width: COL.numW, align: 'right' });
      doc.text('AMOUNT', COL.amt, curY + 6, { width: COL.amtW, align: 'right' });
      curY += TH;

      // Row background
      doc.rect(M, curY, PAGE_W - M * 2, 40).fill('#f8fafc');

      const rowY = curY + 8;
      doc.font('Helvetica').fontSize(9).fillColor('#64748b')
         .text('1', COL.hash, rowY, { width: COL.hashW });
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f172a')
         .text(data.productType, COL.desc, rowY, { width: COL.descW });
      doc.font('Helvetica').fontSize(8).fillColor('#64748b')
         .text(data.packageDetails, COL.desc, rowY + 13, { width: COL.descW });

      doc.font('Helvetica').fontSize(9).fillColor('#0f172a')
         .text('1.00', COL.qty, rowY, { width: COL.numW, align: 'right' })
         .text(`$${data.subtotal.toFixed(2)}`, COL.rate, rowY, { width: COL.numW, align: 'right' });
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a')
         .text(`$${data.subtotal.toFixed(2)}`, COL.amt, rowY, { width: COL.amtW, align: 'right' });

      curY += 40;
      drawLine(curY);
      curY += 12;

      // ── TOTALS ─────────────────────────────────────────────────────────────
      const TOT_X = PAGE_W - M - 220;
      const TOT_VAL_X = PAGE_W - M - 100;
      const TOT_VAL_W = 100;

      const totRow = (label: string, value: string, color = '#64748b', bold = false) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor('#64748b')
           .text(label, TOT_X, curY, { width: 115 });
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor(color)
           .text(value, TOT_VAL_X, curY, { width: TOT_VAL_W, align: 'right' });
        curY += 16;
      };

      totRow('Sub Total', `$${data.subtotal.toFixed(2)}`);
      totRow(
        settings.taxLabel || 'Tax',
        data.tax === 0 ? 'Included' : `$${data.tax.toFixed(2)}`,
        data.tax === 0 ? '#059669' : '#64748b'
      );

      if (data.localPickup) {
        totRow('Shipping', 'Free — Local Pickup', '#059669');
      } else if (data.shipping > 0) {
        totRow('Shipping', `+ $${data.shipping.toFixed(2)}`);
      }

      curY += 4;
      // Balance due banner
      doc.rect(TOT_X, curY, PAGE_W - M - TOT_X, 28).fill('#0f172a');
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#94a3b8')
         .text('BALANCE DUE', TOT_X + 8, curY + 8, { width: 90 });
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#ffffff')
         .text(`$${data.total.toFixed(2)}`, TOT_VAL_X, curY + 8, { width: TOT_VAL_W, align: 'right' });
      curY += 28 + 24;

      // ── PAYMENT DETAILS (renamed from NOTES) ───────────────────────────────
      const noteLines = splitLines(settings.notes);
      // Each note line is 11pt tall + 10px top/bottom padding
      const NOTE_BOX_H = Math.min(noteLines.length * 11 + 20, 130);

      // Guarantee the section fits before the footer (footer at PAGE_H - 50)
      const FOOTER_Y = PAGE_H - 50;
      if (curY + NOTE_BOX_H + 10 > FOOTER_Y - 5) {
        curY = FOOTER_Y - NOTE_BOX_H - 40; // push up if too far down
      }

      // Left accent stripe
      doc.rect(M, curY, 3, NOTE_BOX_H).fill('#0f172a');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#0f172a')
         .text('PAYMENT DETAILS', M + 10, curY);
      curY += 14;

      doc.rect(M + 10, curY, 300, NOTE_BOX_H - 14).fill('#f8fafc');
      let nY = curY + 8;
      doc.font('Helvetica').fontSize(8.5).fillColor('#374151');
      noteLines.forEach(rawLine => {
        const line = rawLine.trim(); // ← removes \r and whitespace
        if (nY + 11 > curY + NOTE_BOX_H - 14) return; // don't overflow box
        doc.text(line === '' ? ' ' : line, M + 16, nY, { width: 285 });
        nY += 11;
      });

      curY += NOTE_BOX_H - 14 + 8;

      // ── FOOTER ─────────────────────────────────────────────────────────────
      drawLine(FOOTER_Y - 8);
      doc.font('Helvetica').fontSize(7.5).fillColor('#94a3b8')
         .text(settings.footerText || 'Thank you for your business!', M, FOOTER_Y, {
           width: (PAGE_W - M * 2) / 2
         });
      doc.font('Helvetica').fontSize(7.5).fillColor('#94a3b8')
         .text('Page 1 of 1', M, FOOTER_Y, { width: PAGE_W - M * 2, align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
