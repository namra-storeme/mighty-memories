import React from 'react';
import { Page, Text, View, Document, StyleSheet, renderToBuffer, Image, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Open Sans',
    fontSize: 10,
    color: '#333333'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    objectFit: 'cover',
    marginBottom: 10
  },
  businessDetails: {
    lineHeight: 1.5,
    color: '#555555'
  },
  businessName: {
    fontSize: 11,
    fontWeight: 700,
    color: '#111111',
    marginBottom: 2
  },
  invoiceTitle: {
    fontSize: 28,
    color: '#111111',
    fontWeight: 400,
    textAlign: 'right',
    letterSpacing: 1,
    marginBottom: 8
  },
  invoiceNumber: {
    fontSize: 10,
    fontWeight: 700,
    textAlign: 'right',
    marginBottom: 20
  },
  balanceBox: {
    alignItems: 'flex-end'
  },
  balanceLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: '#555555',
    marginBottom: 2
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: 700,
    color: '#111111'
  },
  customerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  billToLabel: {
    fontSize: 10,
    color: '#555555',
    marginBottom: 4
  },
  billToName: {
    fontSize: 11,
    fontWeight: 700,
    color: '#111111'
  },
  datesGrid: {
    width: 200,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  dateLabel: {
    color: '#555555'
  },
  dateValue: {
    color: '#333333'
  },
  table: {
    width: '100%',
    marginBottom: 30
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3f3f3f',
    color: '#ffffff',
    padding: 8,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: '12 8',
    fontSize: 10
  },
  colId: { width: '10%' },
  colDesc: { width: '50%' },
  colQty: { width: '10%', textAlign: 'right' },
  colRate: { width: '15%', textAlign: 'right' },
  colAmt: { width: '15%', textAlign: 'right' },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40
  },
  totalsGrid: {
    width: 250,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  boldTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  totalLabel: {
    color: '#333333'
  },
  totalValue: {
    textAlign: 'right'
  },
  balanceDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    padding: 10,
    marginTop: 4,
    fontWeight: 700
  },
  notesTitle: {
    fontSize: 10,
    color: '#555555',
    marginBottom: 8
  },
  notesContent: {
    fontSize: 9,
    color: '#555555',
    lineHeight: 1.5
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 9,
    color: '#777777',
    marginRight: 6
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: '#777777'
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
        <View style={{ width: '50%' }}>
          {settings.logoUrl && (
             <Image src={settings.logoUrl} style={styles.logo} />
          )}
          <View style={styles.businessDetails}>
            <Text style={styles.businessName}>{settings.businessName}</Text>
            {settings.address.split('\\n').map((line, i) => <Text key={i}>{line}</Text>)}
            {settings.abn && <Text>{settings.abn}</Text>}
            {settings.email && <Text>{settings.email}</Text>}
          </View>
        </View>
        
        <View style={{ width: '50%' }}>
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
        <View>
          <Text style={styles.billToLabel}>Bill To</Text>
          <Text style={styles.billToName}>{data.customerName}</Text>
        </View>
        
        <View style={styles.datesGrid}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Invoice Date :</Text>
            <Text style={styles.dateValue}>{data.date}</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Terms :</Text>
            <Text style={styles.dateValue}>Due on Receipt</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Due Date :</Text>
            <Text style={styles.dateValue}>{data.date}</Text>
          </View>
        </View>
      </View>

      {/* TABLE */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colId}>#</Text>
          <Text style={styles.colDesc}>Item & Description</Text>
          <Text style={styles.colQty}>Qty</Text>
          <Text style={styles.colRate}>Rate</Text>
          <Text style={styles.colAmt}>Amount</Text>
        </View>
        
        <View style={styles.tableRow}>
          <Text style={styles.colId}>1</Text>
          <Text style={styles.colDesc}>{data.productType} - {data.packageDetails}</Text>
          <Text style={styles.colQty}>1.00</Text>
          <Text style={styles.colRate}>{data.subtotal.toFixed(2)}</Text>
          <Text style={styles.colAmt}>{data.subtotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* TOTALS */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsGrid}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sub Total</Text>
            <Text style={styles.totalValue}>{data.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{settings.taxLabel}</Text>
            <Text style={styles.totalValue}>{data.tax.toFixed(2)}</Text>
          </View>
          <View style={styles.boldTotalRow}>
            <Text style={{ fontWeight: 700 }}>Total</Text>
            <Text style={{ fontWeight: 700 }}>${data.total.toFixed(2)}</Text>
          </View>
          <View style={styles.balanceDueRow}>
            <Text>Balance Due</Text>
            <Text>${data.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* NOTES */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.notesTitle}>Notes</Text>
        {settings.notes.split('\\n').map((line, i) => (
          <Text key={i} style={styles.notesContent}>{line}</Text>
        ))}
      </View>

      {/* FOOTER */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>{settings.footerText}</Text>
        {/* We can render the default logo or a tiny generic shape here if desired */}
      </View>
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `${pageNumber}`
      )} fixed />

    </Page>
  </Document>
);

export async function generateInvoiceBuffer(data: InvoiceData, settings: InvoiceSettings): Promise<Buffer> {
  const pdfStream = await renderToBuffer(<InvoiceDocument data={data} settings={settings} />);
  return pdfStream;
}
