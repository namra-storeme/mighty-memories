import React from 'react';
import { Page, Text, View, Document, StyleSheet, renderToBuffer, Image, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/inter@1.0.4/Inter-Regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/inter@1.0.4/Inter-Medium.ttf', fontWeight: 500 },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/inter@1.0.4/Inter-SemiBold.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/inter@1.0.4/Inter-Bold.ttf', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: 'Inter',
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 35
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    objectFit: 'contain',
    marginBottom: 10
  },
  businessDetails: {
    color: '#6b7280'
  },
  businessName: {
    fontSize: 12,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  invoiceTitle: {
    fontSize: 26,
    color: '#111827',
    fontWeight: 600,
    textAlign: 'right',
    letterSpacing: 1,
    marginBottom: 6
  },
  invoiceNumber: {
    fontSize: 10,
    fontWeight: 600,
    textAlign: 'right',
    color: '#4b5563',
    marginBottom: 20
  },
  balanceBox: {
    alignItems: 'flex-end',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  balanceLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 700,
    color: '#111827'
  },
  customerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  billToLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 6
  },
  billToName: {
    fontSize: 12,
    fontWeight: 700,
    color: '#111827'
  },
  datesGrid: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 6
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3
  },
  dateLabel: {
    color: '#6b7280',
    fontWeight: 500
  },
  dateValue: {
    color: '#111827',
    fontWeight: 600
  },
  table: {
    width: '100%',
    marginBottom: 25
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    padding: '8 12',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  thText: {
    color: '#374151',
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: 8,
    letterSpacing: 0.5
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    padding: '12 12',
  },
  colId: { width: '8%' },
  colDesc: { width: '47%' },
  colQty: { width: '15%', textAlign: 'right' },
  colRate: { width: '15%', textAlign: 'right' },
  colAmt: { width: '15%', textAlign: 'right' },
  descTitle: {
    fontWeight: 600,
    color: '#111827',
    marginBottom: 2
  },
  descSub: {
    fontSize: 8,
    color: '#6b7280'
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30
  },
  totalsGrid: {
    width: 250,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb'
  },
  totalLabel: {
    color: '#6b7280',
    fontWeight: 500
  },
  totalValue: {
    textAlign: 'right',
    color: '#111827',
    fontWeight: 500
  },
  balanceDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: '10 12',
    marginTop: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  balanceDueLabel: {
    fontWeight: 700,
    color: '#111827',
    fontSize: 11
  },
  balanceDueValue: {
    fontWeight: 700,
    color: '#111827',
    fontSize: 11
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: '#111827',
    textTransform: 'uppercase',
    marginBottom: 6
  },
  notesContent: {
    fontSize: 8,
    color: '#6b7280',
    lineHeight: 1.5,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    width: '60%'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 35,
    right: 35,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  pageNumber: {
    fontSize: 8,
    color: '#9ca3af'
  }
});

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

const InvoiceDocument = ({ data, settings }: { data: InvoiceData, settings: InvoiceSettings }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ width: '55%' }}>
          {settings.logoUrl && (
             <Image src={settings.logoUrl} style={styles.logo} />
          )}
          <View style={styles.businessDetails}>
            <Text style={styles.businessName}>{settings.businessName}</Text>
            {settings.address.split('\\n').map((line, i) => <Text key={i}>{line}</Text>)}
            {settings.abn && <Text style={{ marginTop: 4 }}>{settings.abn}</Text>}
            {settings.email && <Text>{settings.email}</Text>}
          </View>
        </View>
        
        <View style={{ width: '45%' }}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceNumber}># {data.orderId}</Text>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Balance Due</Text>
            <Text style={styles.balanceAmount}>${data.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* BILL TO & DATES */}
      <View style={styles.customerSection}>
        <View style={{ width: '55%' }}>
          <Text style={styles.billToLabel}>Bill To</Text>
          <Text style={styles.billToName}>{data.customerName}</Text>
        </View>
        
        <View style={styles.datesGrid}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Invoice Date:</Text>
            <Text style={styles.dateValue}>{data.date}</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Terms:</Text>
            <Text style={styles.dateValue}>Due on Receipt</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Due Date:</Text>
            <Text style={styles.dateValue}>{data.date}</Text>
          </View>
        </View>
      </View>

      {/* TABLE */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colId, styles.thText]}>#</Text>
          <Text style={[styles.colDesc, styles.thText]}>Item & Description</Text>
          <Text style={[styles.colQty, styles.thText]}>Qty</Text>
          <Text style={[styles.colRate, styles.thText]}>Rate</Text>
          <Text style={[styles.colAmt, styles.thText]}>Amount</Text>
        </View>
        
        <View style={styles.tableRow}>
          <Text style={styles.colId}>1</Text>
          <View style={styles.colDesc}>
            <Text style={styles.descTitle}>{data.productType}</Text>
            <Text style={styles.descSub}>{data.packageDetails}</Text>
          </View>
          <Text style={styles.colQty}>1.00</Text>
          <Text style={styles.colRate}>${data.subtotal.toFixed(2)}</Text>
          <Text style={styles.colAmt}>${data.subtotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* TOTALS */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsGrid}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sub Total</Text>
            <Text style={styles.totalValue}>${data.subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{settings.taxLabel}</Text>
            {/* Display "Included" if tax is strictly 0 (inclusive logic as requested) or actual tax if tax > 0 */}
            <Text style={[styles.totalValue, data.tax === 0 ? { color: '#059669', fontWeight: 600 } : undefined]}>
              {data.tax > 0 ? `$${data.tax.toFixed(2)}` : 'Included'}
            </Text>
          </View>
          
          <View style={styles.balanceDueRow}>
            <Text style={styles.balanceDueLabel}>Balance Due</Text>
            <Text style={styles.balanceDueValue}>${data.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* NOTES */}
      <View>
        <Text style={styles.notesTitle}>Notes</Text>
        <View style={styles.notesContent}>
          {settings.notes.split('\\n').map((line, i) => (
            <Text key={i} style={{ marginBottom: line.trim() === '' ? 4 : 2 }}>{line || ' '}</Text>
          ))}
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>{settings.footerText}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} />
      </View>

    </Page>
  </Document>
);

export async function generateInvoiceBuffer(data: InvoiceData, settings: InvoiceSettings): Promise<Buffer> {
  const pdfStream = await renderToBuffer(<InvoiceDocument data={data} settings={settings} />);
  return pdfStream;
}
