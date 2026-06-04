import { jsPDF } from 'jspdf';

export type InvoiceLinePdf = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export type InvoicePdfData = {
  schoolName?: string;
  invoiceNo: string;
  status: string;
  issueDate?: string;
  dueDate?: string;
  studentName: string;
  admissionNo?: string;
  lines: InvoiceLinePdf[];
  subtotal?: number;
  discount?: number;
  lateFee?: number;
  tax?: number;
  totalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  remarks?: string;
};

function money(v: number): string {
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function invoiceLines(inv: InvoicePdfData): InvoiceLinePdf[] {
  return inv.lines.length
    ? inv.lines
    : [{ description: 'Fee', quantity: 1, unitPrice: inv.totalAmount, amount: inv.totalAmount }];
}

function buildInvoiceSectionHtml(inv: InvoicePdfData): string {
  const lines = invoiceLines(inv);
  const lineRows = lines
    .map(
      (l) => `<tr>
        <td>${esc(l.description)}</td>
        <td class="num">${l.quantity}</td>
        <td class="num">${money(l.unitPrice)}</td>
        <td class="num">${money(l.amount)}</td>
      </tr>`,
    )
    .join('');

  const totals: string[] = [];
  if (inv.subtotal != null && inv.subtotal !== inv.totalAmount) {
    totals.push(`<div class="total-row"><span>Subtotal</span><span>${money(inv.subtotal)}</span></div>`);
  }
  if (inv.discount && inv.discount > 0) {
    totals.push(`<div class="total-row"><span>Discount</span><span>-${money(inv.discount)}</span></div>`);
  }
  if (inv.lateFee && inv.lateFee > 0) {
    totals.push(`<div class="total-row"><span>Late fee</span><span>${money(inv.lateFee)}</span></div>`);
  }
  if (inv.tax && inv.tax > 0) {
    totals.push(`<div class="total-row"><span>Tax</span><span>${money(inv.tax)}</span></div>`);
  }
  totals.push(`<div class="total-row grand"><span>Total</span><span>${money(inv.totalAmount)}</span></div>`);
  if (inv.paidAmount != null && inv.paidAmount > 0) {
    totals.push(`<div class="total-row"><span>Paid</span><span>${money(inv.paidAmount)}</span></div>`);
  }
  if (inv.remainingAmount != null && inv.remainingAmount > 0) {
    totals.push(
      `<div class="total-row grand"><span>Balance due</span><span>${money(inv.remainingAmount)}</span></div>`,
    );
  }

  return `<section class="invoice-page">
    <header class="inv-header">
      <div>
        <h1>${esc(inv.schoolName ?? 'School Management System')}</h1>
        <p class="subtitle">Fee Invoice</p>
      </div>
      <div class="inv-meta">
        <p><strong>${esc(inv.invoiceNo)}</strong></p>
        <p>Status: ${esc(inv.status)}</p>
        ${inv.issueDate ? `<p>Issue: ${esc(inv.issueDate)}</p>` : ''}
        ${inv.dueDate ? `<p>Due: ${esc(inv.dueDate)}</p>` : ''}
      </div>
    </header>
    <div class="bill-to">
      <h2>Bill to</h2>
      <p>${esc(inv.studentName)}</p>
      ${inv.admissionNo ? `<p>Admission no.: ${esc(inv.admissionNo)}</p>` : ''}
    </div>
    <table>
      <thead>
        <tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr>
      </thead>
      <tbody>${lineRows}</tbody>
    </table>
    <div class="totals">${totals.join('')}</div>
    ${inv.remarks ? `<p class="remarks"><strong>Remarks:</strong> ${esc(inv.remarks)}</p>` : ''}
  </section>`;
}

const PRINT_STYLES = `
  * { box-sizing: border-box; }
  body { font-family: system-ui, Segoe UI, sans-serif; color: #111; margin: 0; padding: 24px; }
  .invoice-page { max-width: 720px; margin: 0 auto 32px; page-break-after: always; }
  .invoice-page:last-child { page-break-after: auto; }
  .inv-header { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
  h1 { margin: 0; font-size: 1.5rem; }
  .subtitle { margin: 4px 0 0; color: #555; }
  .inv-meta { text-align: right; font-size: 0.9rem; }
  .inv-meta p { margin: 2px 0; }
  .bill-to { margin-bottom: 20px; }
  .bill-to h2 { margin: 0 0 8px; font-size: 0.85rem; text-transform: uppercase; color: #555; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
  th { background: #f4f4f5; font-size: 0.8rem; }
  td.num, th:nth-child(n+2) { text-align: right; }
  .totals { margin-left: auto; width: 240px; }
  .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 0.9rem; }
  .total-row.grand { font-weight: 700; font-size: 1rem; border-top: 1px solid #ccc; margin-top: 6px; padding-top: 8px; }
  .remarks { font-size: 0.85rem; color: #444; margin-top: 12px; }
  @media print {
    body { padding: 0; }
    .invoice-page { margin: 0; max-width: none; }
  }
`;

/** Print via hidden iframe — works without pop-up permission (unlike window.open). */
function openPrintDocument(title: string, bodyHtml: string) {
  if (typeof document === 'undefined') return;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', title);
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText =
    'position:fixed;left:-9999px;top:0;width:210mm;height:297mm;border:0;visibility:hidden;';

  const html = `<!DOCTYPE html><html><head>
    <meta charset="utf-8" /><title>${esc(title)}</title>
    <style>${PRINT_STYLES}</style>
  </head><body>${bodyHtml}</body></html>`;

  document.body.appendChild(iframe);

  const frameWin = iframe.contentWindow;
  const frameDoc = frameWin?.document;
  if (!frameWin || !frameDoc) {
    iframe.remove();
    throw new Error('Print is not available in this browser');
  }

  const cleanup = () => {
    iframe.remove();
  };

  const doPrint = () => {
    try {
      frameWin.focus();
      frameWin.print();
    } catch {
      cleanup();
      throw new Error('Could not open the print dialog');
    }
    frameWin.addEventListener('afterprint', cleanup, { once: true });
    window.setTimeout(cleanup, 5000);
  };

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  // Must run in the same turn as the click — setTimeout breaks user-gesture rules in Chrome.
  if (frameDoc.readyState === 'complete') {
    doPrint();
  } else {
    iframe.onload = () => doPrint();
  }
}

export function printInvoice(invoice: InvoicePdfData) {
  openPrintDocument(`Invoice ${invoice.invoiceNo}`, buildInvoiceSectionHtml(invoice));
}

export function printInvoicesBundle(invoices: InvoicePdfData[]) {
  if (!invoices.length) return;
  const html = invoices.map((inv) => buildInvoiceSectionHtml(inv)).join('');
  openPrintDocument('Student invoices', html);
}

function drawInvoicePage(doc: jsPDF, inv: InvoicePdfData) {
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(inv.schoolName ?? 'School Management System', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y += 8;
  doc.text('Fee Invoice', margin, y);

  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Invoice: ${inv.invoiceNo}`, margin, y);
  doc.text(`Status: ${inv.status}`, pageWidth - margin, y, { align: 'right' });

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (inv.issueDate) doc.text(`Issue date: ${inv.issueDate}`, margin, y);
  if (inv.dueDate) doc.text(`Due date: ${inv.dueDate}`, pageWidth - margin, y, { align: 'right' });

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.text('Bill to', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(inv.studentName, margin, y);
  y += 5;
  if (inv.admissionNo) {
    doc.text(`Admission no.: ${inv.admissionNo}`, margin, y);
    y += 5;
  }

  y += 8;
  const colDesc = margin;
  const colQty = pageWidth - margin - 70;
  const colUnit = pageWidth - margin - 45;
  const colAmt = pageWidth - margin;

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Description', colDesc, y);
  doc.text('Qty', colQty, y, { align: 'right' });
  doc.text('Unit', colUnit, y, { align: 'right' });
  doc.text('Amount', colAmt, y, { align: 'right' });

  y += 10;
  doc.setFont('helvetica', 'normal');
  const lines = invoiceLines(inv);

  for (const line of lines) {
    if (y > 250) {
      doc.addPage();
      y = 22;
    }
    const desc =
      line.description.length > 55 ? `${line.description.slice(0, 52)}...` : line.description;
    doc.text(desc, colDesc, y);
    doc.text(String(line.quantity), colQty, y, { align: 'right' });
    doc.text(money(line.unitPrice), colUnit, y, { align: 'right' });
    doc.text(money(line.amount), colAmt, y, { align: 'right' });
    y += 7;
  }

  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  const totalsX = pageWidth - margin - 55;
  const addTotal = (label: string, value: number) => {
    doc.text(label, totalsX, y);
    doc.text(money(value), colAmt, y, { align: 'right' });
    y += 6;
  };

  if (inv.subtotal != null && inv.subtotal !== inv.totalAmount) addTotal('Subtotal', inv.subtotal);
  if (inv.discount && inv.discount > 0) {
    doc.text('Discount', totalsX, y);
    doc.text(`-${money(inv.discount)}`, colAmt, y, { align: 'right' });
    y += 6;
  }
  if (inv.lateFee && inv.lateFee > 0) addTotal('Late fee', inv.lateFee);
  if (inv.tax && inv.tax > 0) addTotal('Tax', inv.tax);

  doc.setFont('helvetica', 'bold');
  addTotal('Total', inv.totalAmount);
  doc.setFont('helvetica', 'normal');
  if (inv.paidAmount != null && inv.paidAmount > 0) addTotal('Paid', inv.paidAmount);
  if (inv.remainingAmount != null && inv.remainingAmount > 0) {
    doc.setFont('helvetica', 'bold');
    addTotal('Balance due', inv.remainingAmount);
    doc.setFont('helvetica', 'normal');
  }

  if (inv.remarks) {
    y += 4;
    doc.setFontSize(9);
    doc.text(`Remarks: ${inv.remarks}`, margin, y, { maxWidth: pageWidth - margin * 2 });
  }

  y = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Generated by School Management System', pageWidth / 2, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);
}

export function downloadInvoicePdf(invoice: InvoicePdfData, filename?: string) {
  const doc = new jsPDF();
  drawInvoicePage(doc, invoice);
  const safeName = (filename ?? `${invoice.invoiceNo}-${invoice.studentName}`)
    .replace(/[^\w.-]+/g, '_')
    .slice(0, 80);
  doc.save(`${safeName}.pdf`);
}

export function downloadInvoicesPdfBundle(invoices: InvoicePdfData[], filename = 'student-invoices.pdf') {
  if (!invoices.length) return;
  const doc = new jsPDF();
  invoices.forEach((inv, index) => {
    if (index > 0) doc.addPage();
    drawInvoicePage(doc, inv);
  });
  doc.save(filename);
}

export function invoiceRowToPdfData(
  row: Record<string, unknown>,
  schoolName?: string,
): InvoicePdfData {
  const student = row.student as
    | { firstName?: string; lastName?: string; admissionNo?: string }
    | undefined;
  const name = student
    ? `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() || 'Student'
    : 'Student';
  const lines = (row.lines as Array<Record<string, unknown>> | undefined) ?? [];

  const toNum = (v: unknown) => {
    if (v == null) return 0;
    if (typeof v === 'object' && v !== null && 'toString' in v) return Number((v as { toString: () => string }).toString());
    return Number(v);
  };

  return {
    schoolName,
    invoiceNo: String(row.invoiceNo ?? row.id),
    status: String(row.status ?? ''),
    issueDate: row.issueDate ? String(row.issueDate).slice(0, 10) : undefined,
    dueDate: row.dueDate ? String(row.dueDate).slice(0, 10) : undefined,
    studentName: name,
    admissionNo: student?.admissionNo ? String(student.admissionNo) : undefined,
    lines: lines.map((l) => ({
      description: String(l.description ?? 'Fee'),
      quantity: Number(l.quantity ?? 1),
      unitPrice: toNum(l.unitPrice),
      amount: toNum(l.amount ?? l.unitPrice),
    })),
    subtotal: toNum(row.subtotal),
    discount: toNum(row.discount),
    lateFee: toNum(row.lateFee),
    tax: toNum(row.tax),
    totalAmount: toNum(row.totalAmount),
    paidAmount: toNum(row.paidAmount),
    remainingAmount: toNum(row.remainingAmount),
    remarks: row.remarks ? String(row.remarks) : undefined,
  };
}
