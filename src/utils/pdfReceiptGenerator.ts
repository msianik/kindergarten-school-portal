import { FeeInvoice, Student, StudentFeeConfig } from '../types/school';
import { toBengaliNumber, getSchoolClassNameBn } from './schoolLogic';
import { getStudentFeeConfig } from './feeManagementLogic';

/**
 * Converts a base64 Data URL (image/jpeg) into a raw Uint8Array of bytes.
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || '';
  const binaryStr = atob(base64);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes an ASCII string into a Uint8Array.
 */
function asciiToBytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return bytes;
}

/**
 * Wraps a JPEG image byte stream into a valid single-page A4 PDF-1.4 document Blob.
 */
function wrapJpegInPdfDocument(
  jpegBytes: Uint8Array,
  imgWidth: number,
  imgHeight: number
): Blob {
  const pageWidthPt = 595.28; // A4 width in points
  const pageHeightPt = 841.89; // A4 height in points

  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0]; // index 0 is free object
  let currentOffset = 0;

  const pushAscii = (str: string) => {
    const b = asciiToBytes(str);
    chunks.push(b);
    currentOffset += b.length;
  };

  const pushBytes = (b: Uint8Array) => {
    chunks.push(b);
    currentOffset += b.length;
  };

  // PDF Header
  pushAscii('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  // Object 1: Catalog
  offsets.push(currentOffset);
  pushAscii('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Object 2: Pages
  offsets.push(currentOffset);
  pushAscii('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Object 3: Page
  offsets.push(currentOffset);
  pushAscii(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im1 4 0 R >> >> /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] /Contents 5 0 R >>\nendobj\n`
  );

  // Object 4: Image XObject (DCTDecode / JPEG)
  offsets.push(currentOffset);
  pushAscii(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  pushBytes(jpegBytes);
  pushAscii('\nendstream\nendobj\n');

  // Object 5: Page Content Stream
  const contentStream = `q\n${pageWidthPt} 0 0 ${pageHeightPt} 0 0 cm\n/Im1 Do\nQ\n`;
  offsets.push(currentOffset);
  pushAscii(
    `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`
  );

  // XRef Table
  const xrefStart = currentOffset;
  pushAscii(`xref\n0 ${offsets.length}\n`);
  pushAscii('0000000000 65535 f \n');
  for (let i = 1; i < offsets.length; i++) {
    const padded = String(offsets[i]).padStart(10, '0');
    pushAscii(`${padded} 00000 n \n`);
  }

  // Trailer
  pushAscii(
    `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
  );

  return new Blob(chunks as BlobPart[], { type: 'application/pdf' });
}

/**
 * Draws a rounded rectangle on a 2D canvas context.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function getReceiptPdfFileName(invoice: FeeInvoice): string {
  if (invoice.pdfReceiptFileName) return invoice.pdfReceiptFileName;
  const cleanNo = (invoice.invoiceNo || invoice.id).replace(/[^a-zA-Z0-9-_]/g, '_');
  return `Ananda_Pathshala_Receipt_${cleanNo}.pdf`;
}

/**
 * Renders the Official Bengali + English Money Receipt onto a high-DPI A4 Canvas
 * and returns both the PDF Blob and the file name.
 */
export async function generateOfficialReceiptPdf(
  invoice: FeeInvoice,
  student?: Student | null,
  customFeeConfig?: StudentFeeConfig | null
): Promise<{ blob: Blob; fileName: string }> {
  const width = 1240;
  const height = 1754;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  const feeConfig =
    customFeeConfig || (student ? getStudentFeeConfig(student) : null);

  const fontStack = `'Ruhul Amin', 'Ruhul Amin Unicode', 'Hind Siliguri', 'Noto Sans Bengali', 'Segoe UI', sans-serif`;

  // 1. Page Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Outer Decorative Border
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 6;
  drawRoundedRect(ctx, 45, 45, width - 90, height - 90, 28);
  ctx.stroke();

  // Inner Subtle Border
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 60, 60, width - 120, height - 120, 20);
  ctx.stroke();

  // 2. Top Header Banner (Emerald-Teal Gradient)
  const headerGrad = ctx.createLinearGradient(60, 60, width - 60, 290);
  headerGrad.addColorStop(0, '#065F46');
  headerGrad.addColorStop(0.5, '#047857');
  headerGrad.addColorStop(1, '#0F766E');

  ctx.save();
  drawRoundedRect(ctx, 60, 60, width - 120, 230, 20);
  ctx.fillStyle = headerGrad;
  ctx.fill();
  ctx.restore();

  // Header Badge Pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  drawRoundedRect(ctx, width / 2 - 220, 88, 440, 38, 19);
  ctx.fill();

  ctx.fillStyle = '#FDE68A';
  ctx.font = `bold 18px ${fontStack}`;
  ctx.textAlign = 'center';
  ctx.fillText('✓ অফিসিয়াল ডিজিটাল মানি রসিদ (OFFICIAL MONEY RECEIPT)', width / 2, 113);

  // School Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 50px ${fontStack}`;
  ctx.fillText('আনন্দ পাঠশালা (Ananda Pathshala)', width / 2, 178);

  // School Subtitle & Contact
  ctx.fillStyle = '#D1FAE5';
  ctx.font = `600 20px ${fontStack}`;
  ctx.fillText(
    'প্রি-স্কুল, নার্সারি ও প্রাথমিক শিক্ষা প্রতিষ্ঠান · কুষ্টিয়া ক্যাম্পাস · হেল্পলাইন: ০১৯১৪-০৫৭৫১১',
    width / 2,
    218
  );

  ctx.fillStyle = '#A7F3D0';
  ctx.font = `500 17px ${fontStack}`;
  ctx.fillText(
    'অ্যাডমিন প্যানেল থেকে স্বয়ংক্রিয়ভাবে ভেরিফাইড ও জেনারেটেড পিডিএফ কপি',
    width / 2,
    254
  );

  // 3. Receipt Serial & Date Strip
  drawRoundedRect(ctx, 95, 325, width - 190, 95, 16);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = `600 17px ${fontStack}`;
  ctx.fillText('রসিদ / ইনভয়েস নম্বর (Receipt No):', 125, 362);
  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 24px monospace, ${fontStack}`;
  ctx.fillText(invoice.invoiceNo, 125, 396);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  ctx.font = `600 17px ${fontStack}`;
  ctx.fillText('পিডিএফ সিরিয়াল (PDF Serial):', width / 2, 362);
  ctx.fillStyle = '#4F46E5';
  ctx.font = `bold 21px monospace, ${fontStack}`;
  ctx.fillText(
    invoice.pdfReceiptSerialNo || `PDF-RCPT-${invoice.invoiceNo}`,
    width / 2,
    396
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748B';
  ctx.font = `600 17px ${fontStack}`;
  ctx.fillText('পরিশোধের তারিখ (Payment Date):', width - 125, 362);
  ctx.fillStyle = '#047857';
  ctx.font = `bold 22px ${fontStack}`;
  ctx.fillText(invoice.paidAt || 'আজ, ০৫ নভেম্বর ২০২৬', width - 125, 396);

  // 4. Student & Admission Details Box
  drawRoundedRect(ctx, 95, 445, width - 190, 230, 18);
  ctx.fillStyle = '#FFFBEB';
  ctx.fill();
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#92400E';
  ctx.font = `bold 21px ${fontStack}`;
  ctx.fillText('শিক্ষার্থী ও ভর্তি সংক্রান্ত তথ্য (Student & Admission Info)', 125, 485);

  ctx.strokeStyle = '#FDE68A';
  ctx.beginPath();
  ctx.moveTo(125, 500);
  ctx.lineTo(width - 125, 500);
  ctx.stroke();

  const col1X = 125;
  const col2X = width / 2 + 30;

  // Row 1
  ctx.fillStyle = '#64748B';
  ctx.font = `600 18px ${fontStack}`;
  ctx.fillText('শিক্ষার্থীর নাম:', col1X, 540);
  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 23px ${fontStack}`;
  ctx.fillText(invoice.studentNameBn, col1X + 165, 540);

  ctx.fillStyle = '#64748B';
  ctx.font = `600 18px ${fontStack}`;
  ctx.fillText('শ্রেণি ও রোল:', col2X, 540);
  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 22px ${fontStack}`;
  ctx.fillText(
    `${getSchoolClassNameBn(invoice.className)} (রোল: ${student?.rollNo || '১০১'})`,
    col2X + 145,
    540
  );

  // Row 2
  const admDateText =
    invoice.admissionDateBn || feeConfig?.admissionDateBn || '০১ মে ২০২৬';
  ctx.fillStyle = '#64748B';
  ctx.font = `600 18px ${fontStack}`;
  ctx.fillText('ভর্তির তারিখ:', col1X, 590);
  ctx.fillStyle = '#B45309';
  ctx.font = `bold 21px ${fontStack}`;
  ctx.fillText(admDateText, col1X + 165, 590);

  ctx.fillStyle = '#64748B';
  ctx.font = `600 18px ${fontStack}`;
  ctx.fillText('নির্ধারিত ভর্তি ফি:', col2X, 590);
  ctx.fillStyle = '#1E1B4B';
  ctx.font = `bold 21px ${fontStack}`;
  ctx.fillText(
    `৳ ${toBengaliNumber((feeConfig?.admissionFee || 5000).toLocaleString())} টাকা`,
    col2X + 165,
    590
  );

  // Row 3
  ctx.fillStyle = '#64748B';
  ctx.font = `600 18px ${fontStack}`;
  ctx.fillText('অভিভাবকের নাম:', col1X, 640);
  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 20px ${fontStack}`;
  ctx.fillText(student?.fatherNameBn || 'সুব্রত রায় / অভিভাবক', col1X + 165, 640);

  ctx.fillStyle = '#64748B';
  ctx.font = `600 18px ${fontStack}`;
  ctx.fillText('প্রত্যেক মাসিক ফি:', col2X, 640);
  ctx.fillStyle = '#047857';
  ctx.font = `bold 21px ${fontStack}`;
  ctx.fillText(
    `৳ ${toBengaliNumber((feeConfig?.monthlyFee || 4000).toLocaleString())} / মাস`,
    col2X + 165,
    640
  );

  // 5. Itemized Fee Breakdown Table
  const tableTop = 710;
  drawRoundedRect(ctx, 95, tableTop, width - 190, 58, 12);
  ctx.fillStyle = '#0F172A';
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 20px ${fontStack}`;
  ctx.textAlign = 'left';
  ctx.fillText('ক্রমিক', 125, tableTop + 36);
  ctx.fillText(`ফিসের বিবরণ (${invoice.monthBn})`, 235, tableTop + 36);
  ctx.textAlign = 'right';
  ctx.fillText('টাকার পরিমাণ (৳)', width - 125, tableTop + 36);

  let rowY = tableTop + 58;
  const items =
    invoice.items && invoice.items.length > 0
      ? invoice.items
      : [{ nameBn: `টিউশন ও শিক্ষাদান ফি (${invoice.monthBn})`, amount: invoice.totalAmount }];

  items.forEach((item, index) => {
    const rowHeight = 68;
    ctx.fillStyle = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(95, rowY, width - 190, rowHeight);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(95, rowY + rowHeight);
    ctx.lineTo(width - 95, rowY + rowHeight);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = `bold 20px ${fontStack}`;
    ctx.fillText(`${toBengaliNumber(index + 1)}.`, 130, rowY + 42);

    ctx.fillStyle = '#0F172A';
    ctx.font = `600 21px ${fontStack}`;
    ctx.fillText(item.nameBn, 235, rowY + 42);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0F172A';
    ctx.font = `bold 23px monospace, ${fontStack}`;
    ctx.fillText(`৳ ${toBengaliNumber(item.amount.toLocaleString())}`, width - 125, rowY + 42);

    rowY += rowHeight;
  });

  // Subtotal & Discount Rows
  if (invoice.discountAmount > 0) {
    const discHeight = 58;
    ctx.fillStyle = '#ECFDF5';
    ctx.fillRect(95, rowY, width - 190, discHeight);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#047857';
    ctx.font = `bold 20px ${fontStack}`;
    ctx.fillText('বিশেষ ছাড় / ওয়েভার (Discount / Waiver):', 235, rowY + 37);

    ctx.textAlign = 'right';
    ctx.font = `bold 22px monospace, ${fontStack}`;
    ctx.fillText(
      `- ৳ ${toBengaliNumber(invoice.discountAmount.toLocaleString())}`,
      width - 125,
      rowY + 37
    );
    rowY += discHeight;
  }

  // Total Net Paid Highlight Bar
  const totalBoxHeight = 82;
  drawRoundedRect(ctx, 95, rowY + 12, width - 190, totalBoxHeight, 16);
  ctx.fillStyle = '#ECFDF5';
  ctx.fill();
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#065F46';
  ctx.font = `900 25px ${fontStack}`;
  ctx.fillText('সর্বমোট পরিশোধিত অর্থ (Net Paid Amount):', 130, rowY + 62);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#047857';
  ctx.font = `900 32px monospace, ${fontStack}`;
  ctx.fillText(
    `৳ ${toBengaliNumber(invoice.netAmount.toLocaleString())} টাকা`,
    width - 125,
    rowY + 63
  );

  // 6. Payment Verification & Official Stamp Section
  const verifyY = Math.max(rowY + 140, 1240);
  drawRoundedRect(ctx, 95, verifyY, width - 190, 185, 18);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#334155';
  ctx.font = `bold 20px ${fontStack}`;
  ctx.fillText(
    `পেমেন্ট মাধ্যম (Payment Method): ${invoice.paymentMethod || 'Cash (নগদ ক্যাশ)'}`,
    125,
    verifyY + 48
  );

  ctx.fillStyle = '#475569';
  ctx.font = `600 19px ${fontStack}`;
  ctx.fillText(
    `ট্রানজেকশন / রেফারেন্স আইডি (TrxID): ${invoice.transactionId || invoice.invoiceNo}`,
    125,
    verifyY + 88
  );

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 20px ${fontStack}`;
  ctx.fillText(
    `কনফার্ম ও অনুমোদনকারী (Confirmed By): ${
      invoice.confirmedByBn || 'সুপার অ্যাডমিন / হিসাবরক্ষক'
    }`,
    125,
    verifyY + 128
  );

  ctx.fillStyle = '#64748B';
  ctx.font = `500 16px ${fontStack}`;
  ctx.fillText(
    `মন্তব্য: ${invoice.collectorNoteBn || 'অ্যাডমিন প্যানেল থেকে পেমেন্ট কনফার্ম ও পিডিএফ জেনারেটেড'}`,
    125,
    verifyY + 162
  );

  // Official Green Stamp Seal on the Right
  const stampCenterX = width - 255;
  const stampCenterY = verifyY + 92;

  ctx.save();
  ctx.translate(stampCenterX, stampCenterY);
  ctx.rotate(-0.08);

  drawRoundedRect(ctx, -135, -52, 270, 104, 16);
  ctx.fillStyle = '#D1FAE5';
  ctx.fill();
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#065F46';
  ctx.font = `900 24px ${fontStack}`;
  ctx.fillText('✓ PAID & VERIFIED', 0, -10);

  ctx.fillStyle = '#047857';
  ctx.font = `bold 17px ${fontStack}`;
  ctx.fillText('আনন্দ পাঠশালা কর্তৃপক্ষ', 0, 22);
  ctx.restore();

  // 7. Signature & Footer Line
  const footerY = 1580;
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;

  // Left signature line
  ctx.beginPath();
  ctx.moveTo(125, footerY);
  ctx.lineTo(405, footerY);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#475569';
  ctx.font = `bold 18px ${fontStack}`;
  ctx.fillText('অভিভাবকের স্বাক্ষর', 265, footerY + 32);

  // Right signature line
  ctx.beginPath();
  ctx.moveTo(width - 425, footerY);
  ctx.lineTo(width - 125, footerY);
  ctx.stroke();

  ctx.fillStyle = '#047857';
  ctx.font = `bold 20px ${fontStack}`;
  ctx.fillText(invoice.confirmedByBn || 'সুপার অ্যাডমিন', width - 275, footerY - 14);

  ctx.fillStyle = '#475569';
  ctx.font = `bold 18px ${fontStack}`;
  ctx.fillText('অধ্যক্ষ / হিসাবরক্ষক (অনুমোদিত স্বাক্ষর)', width - 275, footerY + 32);

  // Bottom Computer Generated Note
  ctx.fillStyle = '#94A3B8';
  ctx.font = `500 16px ${fontStack}`;
  ctx.fillText(
    'এই রসিদটি আনন্দ পাঠশালা ডিজিটাল একাউন্টস সিস্টেম কর্তৃক স্বয়ংক্রিয়ভাবে জেনারেটেড।',
    width / 2,
    1675
  );

  // Convert Canvas to JPEG and wrap into a valid A4 PDF Blob
  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const jpegBytes = dataUrlToUint8Array(jpegDataUrl);
  const pdfBlob = wrapJpegInPdfDocument(jpegBytes, width, height);
  const fileName = getReceiptPdfFileName(invoice);

  return { blob: pdfBlob, fileName };
}

/**
 * Triggers a direct browser download of the generated PDF Money Receipt (.pdf).
 */
export async function downloadInvoicePdfReceipt(
  invoice: FeeInvoice,
  student?: Student | null,
  customFeeConfig?: StudentFeeConfig | null
): Promise<string> {
  const { blob, fileName } = await generateOfficialReceiptPdf(
    invoice,
    student,
    customFeeConfig
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return fileName;
}

export type FeeReportScopeOption = 'single_student' | 'entire_class';
export type FeeReportPeriodOption =
  | 'current_month'
  | 'last_6_months'
  | 'last_3_months'
  | 'all_with_admission';

export interface FeeReportRow {
  studentId: string;
  studentNameBn: string;
  rollNo: string;
  classNameBn: string;
  admissionDateBn: string;
  monthBn: string;
  invoiceNo: string;
  billedAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  statusBn: string;
  paymentMethodBn: string;
  paidDateBn: string;
}

export interface ClassMonthlySummaryRow {
  classId: string;
  classNameBn: string;
  totalStudents: number;
  paidStudents: number;
  pendingStudents: number;
  totalBilled: number;
  collectedAmount: number;
  pendingAmount: number;
  collectionRate: number;
}

export interface CurrentMonthSummaryReportData {
  currentMonthBn: string;
  scopeTitleBn: string;
  totalStudents: number;
  paidStudentsCount: number;
  pendingStudentsCount: number;
  totalBilled: number;
  collectedAmount: number;
  pendingAmount: number;
  collectionRate: number;
  pendingRate: number;
  classBreakdown: ClassMonthlySummaryRow[];
  studentRows: FeeReportRow[];
  fileSlug: string;
}

export interface FeeReportSummaryData {
  rows: FeeReportRow[];
  totalBilled: number;
  totalPaid: number;
  totalDue: number;
  collectionRate: number;
  paidCount: number;
  dueCount: number;
  reportTitleBn: string;
  reportSubtitleBn: string;
  fileSlug: string;
}

export function buildFeeHistoryReportData(params: {
  students: Student[];
  invoices: FeeInvoice[];
  scope: FeeReportScopeOption;
  selectedStudentId?: string;
  selectedClass?: string; // SchoolClass or 'ALL'
  period: FeeReportPeriodOption;
  currentMonthBn?: string;
}): FeeReportSummaryData {
  const {
    students,
    invoices,
    scope,
    selectedStudentId,
    selectedClass = 'ALL',
    period,
    currentMonthBn = 'নভেম্বর ২০২৬',
  } = params;

  let targetStudents: Student[] = [];
  if (scope === 'single_student') {
    const found =
      students.find((s) => s.id === selectedStudentId) || students[0];
    if (found) targetStudents = [found];
  } else {
    if (selectedClass === 'ALL') {
      targetStudents = students;
    } else {
      targetStudents = students.filter(
        (s) =>
          s.className === selectedClass ||
          (selectedClass === 'Play' && s.className === 'Playgroup') ||
          (selectedClass === 'KG' && (s.className === 'KG-1' || s.className === 'KG-2'))
      );
    }
  }

  const currentShortMonth = currentMonthBn.split(' ')[0] || 'নভেম্বর';
  const last3ShortNames = ['আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর'];
  const last6ShortNames = ['মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর'];

  const rows: FeeReportRow[] = [];

  targetStudents.forEach((student) => {
    const cfg = getStudentFeeConfig(student);
    const allStdInvoices = generateStudentInvoicesForReport(student, cfg, invoices);

    const filteredInvs = allStdInvoices.filter((inv) => {
      const isAdm = inv.invoiceType === 'admission' || inv.monthBn.includes('ভর্তি ফি');
      if (period === 'all_with_admission') {
        return true;
      }
      if (isAdm) {
        return false;
      }
      if (period === 'current_month') {
        return inv.monthBn.includes(currentShortMonth) || inv.monthBn === currentMonthBn;
      }
      if (period === 'last_3_months') {
        return last3ShortNames.some((m) => inv.monthBn.includes(m));
      }
      // default last_6_months
      return last6ShortNames.some((m) => inv.monthBn.includes(m));
    });

    filteredInvs.forEach((inv) => {
      const isPaid = inv.status === 'paid';
      rows.push({
        studentId: student.id,
        studentNameBn: student.nameBn,
        rollNo: student.rollNo || '১০১',
        classNameBn: getSchoolClassNameBn(student.className),
        admissionDateBn: inv.admissionDateBn || cfg.admissionDateBn,
        monthBn: inv.monthBn,
        invoiceNo: inv.invoiceNo,
        billedAmount: inv.netAmount,
        paidAmount: isPaid ? inv.netAmount : 0,
        dueAmount: isPaid ? 0 : inv.netAmount,
        status: inv.status,
        statusBn: isPaid ? 'আদায়কৃত (Paid)' : 'বকেয়া (Pending)',
        paymentMethodBn: isPaid ? inv.paymentMethod || 'bKash' : '—',
        paidDateBn: isPaid ? inv.paidAt || 'পরিশোধিত' : `শেষ: ${inv.dueDate}`,
      });
    });
  });

  const totalBilled = rows.reduce((sum, r) => sum + r.billedAmount, 0);
  const totalPaid = rows.reduce((sum, r) => sum + r.paidAmount, 0);
  const totalDue = rows.reduce((sum, r) => sum + r.dueAmount, 0);
  const collectionRate =
    totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 100;
  const paidCount = rows.filter((r) => r.status === 'paid').length;
  const dueCount = rows.filter((r) => r.status !== 'paid').length;

  const periodLabelBn =
    period === 'current_month'
      ? `চলতি মাসের ফি সামারি রিপোর্ট (${currentMonthBn}) — আদায়কৃত বনাম বকেয়া`
      : period === 'last_3_months'
      ? 'বিগত ৩ মাসের পেমেন্ট হিস্ট্রি (আগস্ট — নভেম্বর ২০২৬)'
      : period === 'all_with_admission'
      ? 'ভর্তির তারিখ থেকে সম্পূর্ণ পেমেন্ট হিস্ট্রি (ভর্তি ফি + মাসিক ফি)'
      : 'বিগত ৬ মাসের পেমেন্ট হিস্ট্রি (মে — নভেম্বর ২০২৬)';

  let reportTitleBn = '';
  let fileSlug = '';

  if (scope === 'single_student' && targetStudents[0]) {
    const st = targetStudents[0];
    reportTitleBn =
      period === 'current_month'
        ? `চলতি মাসের (${currentMonthBn}) ফি সামারি: ${st.nameBn} (${getSchoolClassNameBn(
            st.className
          )} - রোল ${st.rollNo})`
        : `শিক্ষার্থীর পেমেন্ট হিস্ট্রি রিপোর্ট: ${st.nameBn} (${getSchoolClassNameBn(
            st.className
          )} - রোল ${st.rollNo})`;
    fileSlug = `Student_${st.id}_${period}`;
  } else {
    const clsTitle =
      selectedClass === 'ALL'
        ? 'সকল শ্রেণি (All Classes)'
        : `${getSchoolClassNameBn(selectedClass as any)} শ্রেণি`;
    reportTitleBn =
      period === 'current_month'
        ? `চলতি মাসের (${currentMonthBn}) ফি সামারি রিপোর্ট: ${clsTitle} (${toBengaliNumber(
            targetStudents.length
          )} জন শিক্ষার্থী)`
        : `ক্লাস ভিত্তিক পেমেন্ট হিস্ট্রি রিপোর্ট: ${clsTitle} (${toBengaliNumber(
            targetStudents.length
          )} জন শিক্ষার্থী)`;
    fileSlug = `Class_${selectedClass}_${period}`;
  }

  return {
    rows,
    totalBilled,
    totalPaid,
    totalDue,
    collectionRate,
    paidCount,
    dueCount,
    reportTitleBn,
    reportSubtitleBn: periodLabelBn,
    fileSlug: fileSlug.replace(/[^a-zA-Z0-9-_]/g, '_'),
  };
}

/**
 * Helper to synthesize a student's complete invoice list without mutating storage.
 */
function generateStudentInvoicesForReport(
  student: Student,
  config: StudentFeeConfig,
  liveInvoices: FeeInvoice[]
): FeeInvoice[] {
  const stdLive = liveInvoices.filter((i) => i.studentId === student.id);
  const result: FeeInvoice[] = [];

  // Admission fee
  const matchedAdm = stdLive.find(
    (i) => i.invoiceType === 'admission' || i.monthBn.includes('ভর্তি ফি')
  );
  if (matchedAdm) {
    result.push(matchedAdm);
  } else {
    const isPaid = config.admissionFeeStatus === 'paid';
    result.push({
      id: `inv-adm-${student.id}`,
      invoiceNo: config.admissionReceiptNo || `AP-ADM-${student.rollNo || '101'}`,
      studentId: student.id,
      studentNameBn: student.nameBn,
      className: student.className,
      monthBn: `ভর্তি ফি (${config.admissionDateBn})`,
      invoiceType: 'admission',
      admissionDateBn: config.admissionDateBn,
      totalAmount: config.admissionFee,
      discountAmount: 0,
      netAmount: config.admissionFee,
      dueDate: config.admissionDateBn,
      status: isPaid ? 'paid' : 'unpaid',
      items: [{ nameBn: 'নতুন ভর্তি ও রেজিস্ট্রেশন ফি', amount: config.admissionFee }],
      paymentMethod: isPaid ? config.admissionPaymentMethod || 'Cash' : undefined,
      paidAt: isPaid ? config.admissionPaidAt || config.admissionDateBn : undefined,
    });
  }

  const reportMonths = [
    { key: 'may', nameBn: 'মে ২০২৬', shortBn: 'মে', dueDayBn: '১০ মে ২০২৬' },
    { key: 'jun', nameBn: 'জুন ২০২৬', shortBn: 'জুন', dueDayBn: '১০ জুন ২০২৬' },
    { key: 'jul', nameBn: 'জুলাই ২০২৬', shortBn: 'জুলাই', dueDayBn: '১০ জুলাই ২০২৬' },
    { key: 'aug', nameBn: 'আগস্ট ২০২৬', shortBn: 'আগস্ট', dueDayBn: '১০ আগস্ট ২০২৬' },
    { key: 'sep', nameBn: 'সেপ্টেম্বর ২০২৬', shortBn: 'সেপ্টেম্বর', dueDayBn: '১০ সেপ্টেম্বর ২০২৬' },
    { key: 'oct', nameBn: 'অক্টোবর ২০২৬', shortBn: 'অক্টোবর', dueDayBn: '০৭ নভেম্বর ২০২৬' },
    { key: 'nov', nameBn: 'নভেম্বর ২০২৬', shortBn: 'নভেম্বর', dueDayBn: '১০ নভেম্বর ২০২৬' },
  ];

  const netMonthly = Math.max(0, (config.monthlyFee || 4000) - (config.monthlyDiscount || 0));

  reportMonths.forEach((m, idx) => {
    const existing = stdLive.find(
      (inv) =>
        inv.invoiceType !== 'admission' &&
        (inv.monthBn.includes(m.shortBn) || inv.monthBn === m.nameBn)
    );
    if (existing) {
      result.push(existing);
    } else {
      // Deterministic realistic status for current/recent months when not overridden in liveInvoices
      const rollNum = parseInt(String(student.rollNo || '101').replace(/\D/g, ''), 10) || 101;
      const isPaid = idx < 5 ? true : idx === 5 ? rollNum % 2 === 1 : rollNum % 3 === 1;
      result.push({
        id: `inv-${m.key}-${student.id}`,
        invoiceNo: `AP-${m.key.toUpperCase()}-${student.rollNo || '101'}`,
        studentId: student.id,
        studentNameBn: student.nameBn,
        className: student.className,
        monthBn: m.nameBn,
        invoiceType: 'monthly',
        admissionDateBn: config.admissionDateBn,
        totalAmount: config.monthlyFee || netMonthly,
        discountAmount: config.monthlyDiscount || 0,
        netAmount: netMonthly,
        dueDate: m.dueDayBn,
        status: isPaid ? 'paid' : 'unpaid',
        items: [{ nameBn: `মাসিক টিউশন ফি (${m.nameBn})`, amount: netMonthly }],
        paymentMethod: isPaid ? 'bKash' : undefined,
        paidAt: isPaid ? `০৫ ${m.nameBn}` : undefined,
      });
    }
  });

  return result;
}

/**
 * Builds a dedicated Current Month Summary Fee Report showing Collected vs Pending amounts
 * with both class-by-class breakdown and student-by-student status for the selected month.
 */
export function buildCurrentMonthSummaryReport(params: {
  students: Student[];
  invoices: FeeInvoice[];
  currentMonthBn?: string;
  selectedClass?: string; // SchoolClass or 'ALL'
}): CurrentMonthSummaryReportData {
  const {
    students,
    invoices,
    currentMonthBn = 'নভেম্বর ২০২৬',
    selectedClass = 'ALL',
  } = params;

  const shortMonth = currentMonthBn.split(' ')[0] || 'নভেম্বর';

  const targetStudents =
    selectedClass === 'ALL'
      ? students
      : students.filter(
          (s) =>
            s.className === selectedClass ||
            (selectedClass === 'Play' && s.className === 'Playgroup') ||
            (selectedClass === 'KG' && (s.className === 'KG-1' || s.className === 'KG-2'))
        );

  const studentRows: FeeReportRow[] = [];
  const classMap = new Map<string, ClassMonthlySummaryRow>();

  targetStudents.forEach((student) => {
    const cfg = getStudentFeeConfig(student);
    const allStdInvoices = generateStudentInvoicesForReport(student, cfg, invoices);

    // Match the invoice for the selected current month (fallback to latest monthly invoice if needed)
    const monthInv =
      allStdInvoices.find(
        (inv) =>
          inv.invoiceType !== 'admission' &&
          !inv.monthBn.includes('ভর্তি ফি') &&
          (inv.monthBn.includes(shortMonth) || inv.monthBn === currentMonthBn)
      ) ||
      allStdInvoices[allStdInvoices.length - 1];

    if (!monthInv) return;

    const isPaid = monthInv.status === 'paid';
    const billed = monthInv.netAmount;
    const paidAmt = isPaid ? billed : 0;
    const pendingAmt = isPaid ? 0 : billed;
    const classBn = getSchoolClassNameBn(student.className);

    studentRows.push({
      studentId: student.id,
      studentNameBn: student.nameBn,
      rollNo: student.rollNo || '১০১',
      classNameBn: classBn,
      admissionDateBn: monthInv.admissionDateBn || cfg.admissionDateBn,
      monthBn: monthInv.monthBn,
      invoiceNo: monthInv.invoiceNo,
      billedAmount: billed,
      paidAmount: paidAmt,
      dueAmount: pendingAmt,
      status: monthInv.status,
      statusBn: isPaid ? 'আদায়কৃত (Collected)' : 'বকেয়া (Pending)',
      paymentMethodBn: isPaid ? monthInv.paymentMethod || 'bKash' : 'অপরিশোধিত',
      paidDateBn: isPaid ? monthInv.paidAt || 'পরিশোধিত' : `শেষ: ${monthInv.dueDate}`,
    });

    const existingClass = classMap.get(student.className) || {
      classId: student.className,
      classNameBn: classBn,
      totalStudents: 0,
      paidStudents: 0,
      pendingStudents: 0,
      totalBilled: 0,
      collectedAmount: 0,
      pendingAmount: 0,
      collectionRate: 0,
    };

    existingClass.totalStudents += 1;
    if (isPaid) {
      existingClass.paidStudents += 1;
      existingClass.collectedAmount += paidAmt;
    } else {
      existingClass.pendingStudents += 1;
      existingClass.pendingAmount += pendingAmt;
    }
    existingClass.totalBilled += billed;
    existingClass.collectionRate =
      existingClass.totalBilled > 0
        ? Math.round((existingClass.collectedAmount / existingClass.totalBilled) * 100)
        : 100;

    classMap.set(student.className, existingClass);
  });

  const totalStudents = studentRows.length;
  const paidStudentsCount = studentRows.filter((r) => r.status === 'paid').length;
  const pendingStudentsCount = totalStudents - paidStudentsCount;
  const totalBilled = studentRows.reduce((s, r) => s + r.billedAmount, 0);
  const collectedAmount = studentRows.reduce((s, r) => s + r.paidAmount, 0);
  const pendingAmount = studentRows.reduce((s, r) => s + r.dueAmount, 0);
  const collectionRate =
    totalBilled > 0 ? Math.round((collectedAmount / totalBilled) * 100) : 100;
  const pendingRate = totalBilled > 0 ? Math.max(0, 100 - collectionRate) : 0;

  const scopeTitleBn =
    selectedClass === 'ALL'
      ? 'সকল শ্রেণি (All Classes)'
      : `${getSchoolClassNameBn(selectedClass as any)} শ্রেণি`;

  const monthSlugMap: Record<string, string> = {
    নভেম্বর: 'Nov_2026',
    অক্টোবর: 'Oct_2026',
    সেপ্টেম্বর: 'Sep_2026',
    আগস্ট: 'Aug_2026',
    জুলাই: 'Jul_2026',
    জুন: 'Jun_2026',
    মে: 'May_2026',
  };
  const mSlug = monthSlugMap[shortMonth] || 'Current_Month';

  return {
    currentMonthBn,
    scopeTitleBn,
    totalStudents,
    paidStudentsCount,
    pendingStudentsCount,
    totalBilled,
    collectedAmount,
    pendingAmount,
    collectionRate,
    pendingRate,
    classBreakdown: Array.from(classMap.values()),
    studentRows,
    fileSlug: `Monthly_Fee_Summary_${mSlug}_${selectedClass}`.replace(/[^a-zA-Z0-9-_]/g, '_'),
  };
}

/**
 * Exports the Current Month Summary Report (Collected vs Pending) as a UTF-8 CSV file.
 */
export function downloadCurrentMonthSummaryCsv(
  summaryReport: CurrentMonthSummaryReportData
): string {
  const escapeCsvCell = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  lines.push(
    escapeCsvCell(
      `আনন্দ পাঠশালা - চলতি মাসের ফি সামারি রিপোর্ট (${summaryReport.currentMonthBn})`
    )
  );
  lines.push(
    escapeCsvCell(
      `পরিধি: ${summaryReport.scopeTitleBn} | আদায়কৃত (Collected): ৳${summaryReport.collectedAmount} (${summaryReport.collectionRate}%) | বকেয়া (Pending): ৳${summaryReport.pendingAmount} (${summaryReport.pendingRate}%)`
    )
  );
  lines.push('');

  // Section 1: Executive Summary (Collected vs Pending)
  lines.push(escapeCsvCell('১. সামগ্রিক মাসিক ফি আদায় বনাম বকেয়া সারসংক্ষেপ (Collected vs Pending Summary)'));
  lines.push(
    [
      'মাসের নাম',
      'মোট শিক্ষার্থী',
      'পরিশোধকারী শিক্ষার্থী (Paid)',
      'বকেয়া শিক্ষার্থী (Pending)',
      'মোট ধার্যকৃত ফি (৳)',
      'মোট আদায়কৃত অর্থ - Collected (৳)',
      'মোট বকেয়া অর্থ - Pending (৳)',
      'আদায়ের হার (%)',
    ]
      .map(escapeCsvCell)
      .join(',')
  );
  lines.push(
    [
      summaryReport.currentMonthBn,
      summaryReport.totalStudents,
      summaryReport.paidStudentsCount,
      summaryReport.pendingStudentsCount,
      summaryReport.totalBilled,
      summaryReport.collectedAmount,
      summaryReport.pendingAmount,
      `${summaryReport.collectionRate}%`,
    ]
      .map(escapeCsvCell)
      .join(',')
  );
  lines.push('');

  // Section 2: Class-by-Class Collected vs Pending Breakdown
  lines.push(escapeCsvCell('২. শ্রেণিভিত্তিক আদায় বনাম বকেয়া বিবরণী (Class-wise Collected vs Pending)'));
  lines.push(
    [
      'শ্রেণি',
      'মোট শিক্ষার্থী',
      'পরিশোধিত শিক্ষার্থী',
      'বকেয়া শিক্ষার্থী',
      'মোট ধার্যকৃত ফি (৳)',
      'আদায়কৃত ফি - Collected (৳)',
      'বকেয়া ফি - Pending (৳)',
      'আদায়ের হার (%)',
    ]
      .map(escapeCsvCell)
      .join(',')
  );
  summaryReport.classBreakdown.forEach((cls) => {
    lines.push(
      [
        cls.classNameBn,
        cls.totalStudents,
        cls.paidStudents,
        cls.pendingStudents,
        cls.totalBilled,
        cls.collectedAmount,
        cls.pendingAmount,
        `${cls.collectionRate}%`,
      ]
        .map(escapeCsvCell)
        .join(',')
    );
  });
  lines.push('');

  // Section 3: Student-by-Student Current Month Status
  lines.push(
    escapeCsvCell(
      `৩. শিক্ষার্থীভিত্তিক চলতি মাসের (${summaryReport.currentMonthBn}) ফি স্ট্যাটাস`
    )
  );
  lines.push(
    [
      'ক্রমিক নং',
      'শিক্ষার্থীর নাম',
      'রোল নম্বর',
      'শ্রেণি',
      'মাস',
      'ইনভয়েস নম্বর',
      'মাসিক ধার্যকৃত ফি (৳)',
      'আদায়কৃত অর্থ - Collected (৳)',
      'বকেয়া অর্থ - Pending (৳)',
      'পেমেন্ট স্ট্যাটাস',
      'পেমেন্ট মাধ্যম',
      'পরিশোধের তারিখ / শেষ তারিখ',
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  summaryReport.studentRows.forEach((row, idx) => {
    lines.push(
      [
        idx + 1,
        row.studentNameBn,
        row.rollNo,
        row.classNameBn,
        row.monthBn,
        row.invoiceNo,
        row.billedAmount,
        row.paidAmount,
        row.dueAmount,
        row.statusBn,
        row.paymentMethodBn,
        row.paidDateBn,
      ]
        .map(escapeCsvCell)
        .join(',')
    );
  });

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const fileName = `Ananda_Pathshala_${summaryReport.fileSlug}.csv`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  return fileName;
}

/**
 * Generates and downloads an Official A4 PDF Summary Monthly Fee Report
 * for the current month showing Collected vs Pending amounts, Class Breakdown, and Student Roster.
 */
export async function downloadCurrentMonthSummaryPdf(
  summaryReport: CurrentMonthSummaryReportData
): Promise<string> {
  const width = 1240;
  const maxClassRows = summaryReport.classBreakdown.length;
  const maxStudentRows = Math.min(summaryReport.studentRows.length, 18);
  const height = Math.max(1754, 860 + maxClassRows * 48 + maxStudentRows * 48 + 260);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  const fontStack = `'Ruhul Amin', 'Ruhul Amin Unicode', 'Hind Siliguri', 'Noto Sans Bengali', 'Segoe UI', sans-serif`;

  // 1. Background & Outer Border
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 5;
  drawRoundedRect(ctx, 40, 40, width - 80, height - 80, 24);
  ctx.stroke();

  // 2. Header Banner
  const headerGrad = ctx.createLinearGradient(55, 55, width - 55, 265);
  headerGrad.addColorStop(0, '#0F172A');
  headerGrad.addColorStop(0.5, '#065F46');
  headerGrad.addColorStop(1, '#1E1B4B');

  ctx.save();
  drawRoundedRect(ctx, 55, 55, width - 110, 210, 18);
  ctx.fillStyle = headerGrad;
  ctx.fill();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FDE68A';
  ctx.font = `bold 18px ${fontStack}`;
  ctx.fillText(
    '📊 চলতি মাসের ফি সামারি রিপোর্ট — আদায়কৃত বনাম বকেয়া (MONTHLY FEE SUMMARY REPORT)',
    width / 2,
    98
  );

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 42px ${fontStack}`;
  ctx.fillText('আনন্দ পাঠশালা (Ananda Pathshala)', width / 2, 152);

  ctx.fillStyle = '#A7F3D0';
  ctx.font = `bold 22px ${fontStack}`;
  ctx.fillText(
    `মাস: ${summaryReport.currentMonthBn} · পরিধি: ${summaryReport.scopeTitleBn}`,
    width / 2,
    196
  );

  ctx.fillStyle = '#E2E8F0';
  ctx.font = `500 16px ${fontStack}`;
  ctx.fillText(
    `মোট শিক্ষার্থী: ${toBengaliNumber(summaryReport.totalStudents)} জন · পরিশোধিত: ${toBengaliNumber(
      summaryReport.paidStudentsCount
    )} জন · বকেয়া: ${toBengaliNumber(summaryReport.pendingStudentsCount)} জন`,
    width / 2,
    234
  );

  // 3. 4 KPI Cards (Total Billed, Collected Amount, Pending Amount, Collection Rate)
  const kpiTop = 290;
  const kpiWidth = (width - 170) / 4;
  const kpis = [
    {
      label: 'মোট ধার্যকৃত মাসিক ফি',
      val: `৳ ${toBengaliNumber(summaryReport.totalBilled.toLocaleString())}`,
      sub: `মোট শিক্ষার্থী: ${toBengaliNumber(summaryReport.totalStudents)} জন`,
      bg: '#F8FAFC',
      border: '#CBD5E1',
      color: '#0F172A',
    },
    {
      label: 'আদায়কৃত অর্থ (Collected)',
      val: `৳ ${toBengaliNumber(summaryReport.collectedAmount.toLocaleString())}`,
      sub: `${toBengaliNumber(summaryReport.paidStudentsCount)} জন পরিশোধিত (${toBengaliNumber(
        summaryReport.collectionRate
      )}%)`,
      bg: '#ECFDF5',
      border: '#6EE7B7',
      color: '#047857',
    },
    {
      label: 'বকেয়া অর্থ (Pending)',
      val: `৳ ${toBengaliNumber(summaryReport.pendingAmount.toLocaleString())}`,
      sub: `${toBengaliNumber(summaryReport.pendingStudentsCount)} জন বকেয়া (${toBengaliNumber(
        summaryReport.pendingRate
      )}%)`,
      bg: '#FFF1F2',
      border: '#FDA4AF',
      color: '#BE123C',
    },
    {
      label: 'চলতি মাসের আদায় হার',
      val: `${toBengaliNumber(summaryReport.collectionRate)}%`,
      sub: `বকেয়া হার: ${toBengaliNumber(summaryReport.pendingRate)}%`,
      bg: '#EEF2FF',
      border: '#A5B4FC',
      color: '#3730A3',
    },
  ];

  kpis.forEach((k, idx) => {
    const x = 65 + idx * (kpiWidth + 13);
    drawRoundedRect(ctx, x, kpiTop, kpiWidth, 115, 14);
    ctx.fillStyle = k.bg;
    ctx.fill();
    ctx.strokeStyle = k.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = `bold 15px ${fontStack}`;
    ctx.fillText(k.label, x + 18, kpiTop + 34);

    ctx.fillStyle = k.color;
    ctx.font = `900 25px monospace, ${fontStack}`;
    ctx.fillText(k.val, x + 18, kpiTop + 72);

    ctx.fillStyle = '#64748B';
    ctx.font = `600 13px ${fontStack}`;
    ctx.fillText(k.sub, x + 18, kpiTop + 98);
  });

  // 4. Visual Collected vs Pending Progress Bar
  const barSectionY = 425;
  drawRoundedRect(ctx, 65, barSectionY, width - 130, 74, 12);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#047857';
  ctx.font = `bold 15px ${fontStack}`;
  ctx.fillText(
    `✓ আদায়কৃত (Collected): ৳${toBengaliNumber(
      summaryReport.collectedAmount.toLocaleString()
    )} (${toBengaliNumber(summaryReport.collectionRate)}%)`,
    85,
    barSectionY + 26
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#BE123C';
  ctx.font = `bold 15px ${fontStack}`;
  ctx.fillText(
    `⚠️ বকেয়া / পেন্ডিং (Pending): ৳${toBengaliNumber(
      summaryReport.pendingAmount.toLocaleString()
    )} (${toBengaliNumber(summaryReport.pendingRate)}%)`,
    width - 85,
    barSectionY + 26
  );

  const trackX = 85;
  const trackY = barSectionY + 40;
  const trackW = width - 170;
  const trackH = 18;
  drawRoundedRect(ctx, trackX, trackY, trackW, trackH, 9);
  ctx.fillStyle = '#FFE4E6';
  ctx.fill();

  const collectedW = Math.max(0, Math.min(trackW, (trackW * summaryReport.collectionRate) / 100));
  if (collectedW > 0) {
    drawRoundedRect(ctx, trackX, trackY, collectedW, trackH, 9);
    ctx.fillStyle = '#10B981';
    ctx.fill();
  }

  // 5. Class-by-Class Collected vs Pending Breakdown Table
  let currentY = 520;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F172A';
  ctx.font = `900 18px ${fontStack}`;
  ctx.fillText(
    '১. শ্রেণিভিত্তিক আদায়কৃত বনাম বকেয়া সারসংক্ষেপ (Class-wise Collected vs Pending)',
    65,
    currentY
  );
  currentY += 14;

  drawRoundedRect(ctx, 65, currentY, width - 130, 46, 10);
  ctx.fillStyle = '#1E293B';
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 15px ${fontStack}`;
  ctx.textAlign = 'left';
  ctx.fillText('শ্রেণির নাম', 85, currentY + 29);
  ctx.fillText('মোট শিক্ষার্থী', 310, currentY + 29);
  ctx.fillText('পরিশোধিত / বকেয়া', 465, currentY + 29);
  ctx.textAlign = 'right';
  ctx.fillText('মোট ধার্যকৃত (৳)', 760, currentY + 29);
  ctx.fillText('আদায়কৃত - Collected (৳)', 960, currentY + 29);
  ctx.fillText('বকেয়া - Pending (৳)', width - 85, currentY + 29);
  currentY += 46;

  summaryReport.classBreakdown.forEach((cls, idx) => {
    const rowH = 44;
    ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(65, currentY, width - 130, rowH);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(65, currentY + rowH);
    ctx.lineTo(width - 65, currentY + rowH);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.font = `bold 15px ${fontStack}`;
    ctx.fillText(cls.classNameBn, 85, currentY + 28);

    ctx.fillStyle = '#334155';
    ctx.font = `bold 15px ${fontStack}`;
    ctx.fillText(`${toBengaliNumber(cls.totalStudents)} জন`, 310, currentY + 28);

    ctx.fillStyle = '#475569';
    ctx.font = `600 14px ${fontStack}`;
    ctx.fillText(
      `পরিশোধিত ${toBengaliNumber(cls.paidStudents)} | বকেয়া ${toBengaliNumber(
        cls.pendingStudents
      )} (${toBengaliNumber(cls.collectionRate)}%)`,
      465,
      currentY + 28
    );

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0F172A';
    ctx.font = `bold 15px monospace, ${fontStack}`;
    ctx.fillText(`৳${toBengaliNumber(cls.totalBilled.toLocaleString())}`, 760, currentY + 28);

    ctx.fillStyle = '#047857';
    ctx.fillText(`৳${toBengaliNumber(cls.collectedAmount.toLocaleString())}`, 960, currentY + 28);

    ctx.fillStyle = cls.pendingAmount > 0 ? '#E11D48' : '#64748B';
    ctx.fillText(
      `৳${toBengaliNumber(cls.pendingAmount.toLocaleString())}`,
      width - 85,
      currentY + 28
    );

    currentY += rowH;
  });

  // 6. Student-by-Student Current Month Table
  currentY += 34;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F172A';
  ctx.font = `900 18px ${fontStack}`;
  ctx.fillText(
    `২. শিক্ষার্থীভিত্তিক চলতি মাসের (${summaryReport.currentMonthBn}) ফি আদায় ও বকেয়া তালিকা`,
    65,
    currentY
  );
  currentY += 14;

  drawRoundedRect(ctx, 65, currentY, width - 130, 46, 10);
  ctx.fillStyle = '#0F172A';
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 15px ${fontStack}`;
  ctx.textAlign = 'left';
  ctx.fillText('ক্রমিক', 82, currentY + 29);
  ctx.fillText('শিক্ষার্থী ও রোল', 145, currentY + 29);
  ctx.fillText('শ্রেণি', 410, currentY + 29);
  ctx.fillText('ইনভয়েস নম্বর', 560, currentY + 29);
  ctx.textAlign = 'right';
  ctx.fillText('আদায়কৃত (৳)', 880, currentY + 29);
  ctx.fillText('বকেয়া (৳)', 1030, currentY + 29);
  ctx.fillText('স্ট্যাটাস', width - 82, currentY + 29);
  currentY += 46;

  const displayStudents = summaryReport.studentRows.slice(0, maxStudentRows);
  displayStudents.forEach((r, idx) => {
    const rowH = 44;
    ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(65, currentY, width - 130, rowH);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(65, currentY + rowH);
    ctx.lineTo(width - 65, currentY + rowH);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748B';
    ctx.font = `bold 14px ${fontStack}`;
    ctx.fillText(`${toBengaliNumber(idx + 1)}.`, 82, currentY + 28);

    ctx.fillStyle = '#0F172A';
    ctx.font = `bold 15px ${fontStack}`;
    ctx.fillText(`${r.studentNameBn} (রোল ${toBengaliNumber(r.rollNo)})`, 145, currentY + 28);

    ctx.fillStyle = '#334155';
    ctx.font = `600 14px ${fontStack}`;
    ctx.fillText(r.classNameBn, 410, currentY + 28);

    ctx.fillStyle = '#475569';
    ctx.font = `bold 14px monospace, ${fontStack}`;
    ctx.fillText(r.invoiceNo, 560, currentY + 28);

    ctx.textAlign = 'right';
    ctx.fillStyle = r.paidAmount > 0 ? '#047857' : '#94A3B8';
    ctx.font = `bold 15px monospace, ${fontStack}`;
    ctx.fillText(`৳${toBengaliNumber(r.paidAmount.toLocaleString())}`, 880, currentY + 28);

    ctx.fillStyle = r.dueAmount > 0 ? '#E11D48' : '#94A3B8';
    ctx.fillText(`৳${toBengaliNumber(r.dueAmount.toLocaleString())}`, 1030, currentY + 28);

    ctx.fillStyle = r.status === 'paid' ? '#047857' : '#E11D48';
    ctx.font = `bold 14px ${fontStack}`;
    ctx.fillText(
      r.status === 'paid' ? '✓ আদায়কৃত' : '⚠️ পেন্ডিং',
      width - 82,
      currentY + 28
    );

    currentY += rowH;
  });

  // Total Footer Box
  drawRoundedRect(ctx, 65, currentY + 14, width - 130, 56, 12);
  ctx.fillStyle = '#ECFDF5';
  ctx.fill();
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#065F46';
  ctx.font = `900 18px ${fontStack}`;
  ctx.fillText(
    `সর্বমোট (${summaryReport.currentMonthBn}): ধার্যকৃত ৳${toBengaliNumber(
      summaryReport.totalBilled.toLocaleString()
    )}`,
    85,
    currentY + 48
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#047857';
  ctx.font = `900 18px ${fontStack}`;
  ctx.fillText(
    `আদায়কৃত (Collected): ৳${toBengaliNumber(
      summaryReport.collectedAmount.toLocaleString()
    )}   |   বকেয়া (Pending): ৳${toBengaliNumber(summaryReport.pendingAmount.toLocaleString())}`,
    width - 85,
    currentY + 48
  );

  // Signature Footer
  const footerLineY = height - 115;
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(95, footerLineY);
  ctx.lineTo(365, footerLineY);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#475569';
  ctx.font = `bold 16px ${fontStack}`;
  ctx.fillText('হিসাবরক্ষক (Accountant)', 230, footerLineY + 28);

  ctx.beginPath();
  ctx.moveTo(width - 385, footerLineY);
  ctx.lineTo(width - 95, footerLineY);
  ctx.stroke();
  ctx.fillStyle = '#475569';
  ctx.font = `bold 16px ${fontStack}`;
  ctx.fillText('অধ্যক্ষ / সুপার অ্যাডমিন (Principal / Admin)', width - 240, footerLineY + 28);

  ctx.fillStyle = '#94A3B8';
  ctx.font = `500 14px ${fontStack}`;
  ctx.fillText(
    'আনন্দ পাঠশালা ডিজিটাল একাউন্টস সিস্টেম কর্তৃক স্বয়ংক্রিয়ভাবে জেনারেটেড চলতি মাসের ফি সামারি রিপোর্ট।',
    width / 2,
    height - 55
  );

  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const jpegBytes = dataUrlToUint8Array(jpegDataUrl);
  const pdfBlob = wrapJpegInPdfDocument(jpegBytes, width, height);
  const fileName = `Ananda_Pathshala_${summaryReport.fileSlug}.pdf`;

  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  return fileName;
}

/**
 * Downloads the multi-month Payment History Report (for a student or an entire class) as a UTF-8 CSV file.
 */
export function downloadFeeHistoryReportCsv(report: FeeReportSummaryData): string {
  const headers = [
    'ক্রমিক নং',
    'শিক্ষার্থীর নাম',
    'রোল নম্বর',
    'শ্রেণি',
    'ভর্তির তারিখ',
    'মাস / ফিসের বিবরণ',
    'ইনভয়েস / রসিদ নম্বর',
    'নির্ধারিত ফি (৳)',
    'পরিশোধিত ফি (৳)',
    'বকেয়া ফি (৳)',
    'পেমেন্ট স্ট্যাটাস',
    'পেমেন্ট মাধ্যম',
    'পরিশোধের তারিখ / শেষ তারিখ',
  ];

  const escapeCsvCell = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  lines.push(escapeCsvCell(`আনন্দ পাঠশালা - ${report.reportTitleBn}`));
  lines.push(escapeCsvCell(`সময়কাল: ${report.reportSubtitleBn} | কালেকশন হার: ${report.collectionRate}%`));
  lines.push('');
  lines.push(headers.map(escapeCsvCell).join(','));

  report.rows.forEach((row, index) => {
    lines.push(
      [
        index + 1,
        row.studentNameBn,
        row.rollNo,
        row.classNameBn,
        row.admissionDateBn,
        row.monthBn,
        row.invoiceNo,
        row.billedAmount,
        row.paidAmount,
        row.dueAmount,
        row.statusBn,
        row.paymentMethodBn,
        row.paidDateBn,
      ]
        .map(escapeCsvCell)
        .join(',')
    );
  });

  lines.push('');
  lines.push(
    [
      '',
      'সর্বমোট সারসংক্ষেপ (Total Summary)',
      '',
      '',
      '',
      `মোট রেকর্ড: ${report.rows.length}টি`,
      '',
      report.totalBilled,
      report.totalPaid,
      report.totalDue,
      `কালেকশন হার: ${report.collectionRate}%`,
      '',
      '',
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  // Add UTF-8 BOM (\uFEFF) so Excel opens Bengali text cleanly
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const fileName = `Ananda_Pathshala_Fee_Report_${report.fileSlug}.csv`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  return fileName;
}

/**
 * Generates and downloads an Official A4 PDF Payment History Report
 * for either a single student or an entire class.
 */
export async function downloadFeeHistoryReportPdf(
  report: FeeReportSummaryData
): Promise<string> {
  const width = 1240;
  // Dynamically scale canvas height if there are many rows, while keeping A4 width ratio
  const maxVisibleRows = Math.min(report.rows.length, 22);
  const height = Math.max(1754, 720 + maxVisibleRows * 52 + 280);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  const fontStack = `'Ruhul Amin', 'Ruhul Amin Unicode', 'Hind Siliguri', 'Noto Sans Bengali', 'Segoe UI', sans-serif`;

  // 1. White Page Background & Border
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 5;
  drawRoundedRect(ctx, 40, 40, width - 80, height - 80, 24);
  ctx.stroke();

  // 2. Top Header Banner
  const headerGrad = ctx.createLinearGradient(55, 55, width - 55, 265);
  headerGrad.addColorStop(0, '#0F172A');
  headerGrad.addColorStop(0.5, '#1E1B4B');
  headerGrad.addColorStop(1, '#065F46');

  ctx.save();
  drawRoundedRect(ctx, 55, 55, width - 110, 210, 18);
  ctx.fillStyle = headerGrad;
  ctx.fill();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FDE68A';
  ctx.font = `bold 18px ${fontStack}`;
  ctx.fillText(
    '📊 অফিসিয়াল পেমেন্ট হিস্ট্রি ও ফি আদায় প্রতিবেদন (OFFICIAL FEE STATEMENT - PDF)',
    width / 2,
    98
  );

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 44px ${fontStack}`;
  ctx.fillText('আনন্দ পাঠশালা (Ananda Pathshala)', width / 2, 155);

  ctx.fillStyle = '#A7F3D0';
  ctx.font = `bold 21px ${fontStack}`;
  ctx.fillText(report.reportTitleBn, width / 2, 198);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = `500 17px ${fontStack}`;
  ctx.fillText(
    `${report.reportSubtitleBn} · প্রকাশের তারিখ: ০৫ নভেম্বর ২০২৬`,
    width / 2,
    235
  );

  // 3. 4 KPI Summary Cards
  const kpiTop = 290;
  const kpiWidth = (width - 170) / 4;
  const kpis = [
    {
      label: 'মোট ধার্যকৃত ফি (Total Billed)',
      val: `৳ ${toBengaliNumber(report.totalBilled.toLocaleString())}`,
      sub: `মোট রেকর্ড: ${toBengaliNumber(report.rows.length)}টি`,
      bg: '#F8FAFC',
      border: '#CBD5E1',
      color: '#0F172A',
    },
    {
      label: 'মোট পরিশোধিত (Total Paid)',
      val: `৳ ${toBengaliNumber(report.totalPaid.toLocaleString())}`,
      sub: `${toBengaliNumber(report.paidCount)}টি বিল পরিশোধিত ✓`,
      bg: '#ECFDF5',
      border: '#6EE7B7',
      color: '#047857',
    },
    {
      label: 'মোট বকেয়া ফি (Total Due)',
      val: `৳ ${toBengaliNumber(report.totalDue.toLocaleString())}`,
      sub: `${toBengaliNumber(report.dueCount)}টি বিল বকেয়া ⚠️`,
      bg: '#FFF1F2',
      border: '#FDA4AF',
      color: '#BE123C',
    },
    {
      label: 'ফি আদায় হার (Collection Rate)',
      val: `${toBengaliNumber(report.collectionRate)}%`,
      sub: 'অ্যাডমিন প্যানেল ভেরিফাইড',
      bg: '#EEF2FF',
      border: '#A5B4FC',
      color: '#3730A3',
    },
  ];

  kpis.forEach((k, idx) => {
    const x = 65 + idx * (kpiWidth + 13);
    drawRoundedRect(ctx, x, kpiTop, kpiWidth, 115, 14);
    ctx.fillStyle = k.bg;
    ctx.fill();
    ctx.strokeStyle = k.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = `bold 15px ${fontStack}`;
    ctx.fillText(k.label, x + 18, kpiTop + 34);

    ctx.fillStyle = k.color;
    ctx.font = `900 26px monospace, ${fontStack}`;
    ctx.fillText(k.val, x + 18, kpiTop + 72);

    ctx.fillStyle = '#64748B';
    ctx.font = `600 14px ${fontStack}`;
    ctx.fillText(k.sub, x + 18, kpiTop + 98);
  });

  // 4. Table Header
  const tableTop = 430;
  drawRoundedRect(ctx, 65, tableTop, width - 130, 52, 10);
  ctx.fillStyle = '#0F172A';
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 16px ${fontStack}`;
  ctx.textAlign = 'left';
  ctx.fillText('ক্রমিক', 82, tableTop + 32);
  ctx.fillText('শিক্ষার্থী ও রোল', 145, tableTop + 32);
  ctx.fillText('শ্রেণি', 380, tableTop + 32);
  ctx.fillText('মাস / বিবরণ', 495, tableTop + 32);
  ctx.fillText('ইনভয়েস নং', 695, tableTop + 32);
  ctx.textAlign = 'right';
  ctx.fillText('পরিশোধিত (৳)', 935, tableTop + 32);
  ctx.fillText('বকেয়া (৳)', 1055, tableTop + 32);
  ctx.fillText('স্ট্যাটাস', width - 82, tableTop + 32);

  // 5. Table Rows
  let currentY = tableTop + 52;
  const displayRows = report.rows.slice(0, maxVisibleRows);

  displayRows.forEach((r, idx) => {
    const rowH = 50;
    ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(65, currentY, width - 130, rowH);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(65, currentY + rowH);
    ctx.lineTo(width - 65, currentY + rowH);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748B';
    ctx.font = `bold 15px ${fontStack}`;
    ctx.fillText(`${toBengaliNumber(idx + 1)}.`, 82, currentY + 31);

    ctx.fillStyle = '#0F172A';
    ctx.font = `bold 16px ${fontStack}`;
    ctx.fillText(`${r.studentNameBn} (${r.rollNo})`, 145, currentY + 31);

    ctx.fillStyle = '#334155';
    ctx.font = `600 15px ${fontStack}`;
    ctx.fillText(r.classNameBn, 380, currentY + 31);

    ctx.fillStyle = '#0F172A';
    ctx.font = `600 15px ${fontStack}`;
    ctx.fillText(r.monthBn.slice(0, 18), 495, currentY + 31);

    ctx.fillStyle = '#475569';
    ctx.font = `bold 14px monospace, ${fontStack}`;
    ctx.fillText(r.invoiceNo, 695, currentY + 31);

    ctx.textAlign = 'right';
    ctx.fillStyle = r.paidAmount > 0 ? '#047857' : '#94A3B8';
    ctx.font = `bold 16px monospace, ${fontStack}`;
    ctx.fillText(`৳${toBengaliNumber(r.paidAmount)}`, 935, currentY + 31);

    ctx.fillStyle = r.dueAmount > 0 ? '#E11D48' : '#94A3B8';
    ctx.font = `bold 16px monospace, ${fontStack}`;
    ctx.fillText(`৳${toBengaliNumber(r.dueAmount)}`, 1055, currentY + 31);

    ctx.fillStyle = r.status === 'paid' ? '#047857' : '#E11D48';
    ctx.font = `bold 15px ${fontStack}`;
    ctx.fillText(r.status === 'paid' ? '✓ পরিশোধিত' : '⚠️ বকেয়া', width - 82, currentY + 31);

    currentY += rowH;
  });

  if (report.rows.length > maxVisibleRows) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748B';
    ctx.font = `italic 15px ${fontStack}`;
    ctx.fillText(
      `... এবং আরও ${toBengaliNumber(
        report.rows.length - maxVisibleRows
      )}টি রেকর্ড (সম্পূর্ণ তালিকার জন্য CSV ডাউনলোড করুন)`,
      width / 2,
      currentY + 28
    );
    currentY += 40;
  }

  // Total Summary Row
  drawRoundedRect(ctx, 65, currentY + 12, width - 130, 58, 12);
  ctx.fillStyle = '#ECFDF5';
  ctx.fill();
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#065F46';
  ctx.font = `900 19px ${fontStack}`;
  ctx.fillText(
    `সর্বমোট হিসাব (${toBengaliNumber(report.rows.length)}টি ইনভয়েস): ধার্যকৃত ৳${toBengaliNumber(
      report.totalBilled.toLocaleString()
    )}`,
    85,
    currentY + 48
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#047857';
  ctx.font = `900 19px ${fontStack}`;
  ctx.fillText(
    `পরিশোধিত: ৳${toBengaliNumber(
      report.totalPaid.toLocaleString()
    )}   |   বকেয়া: ৳${toBengaliNumber(report.totalDue.toLocaleString())}`,
    width - 85,
    currentY + 48
  );

  // 6. Signature & Verification Footer
  const footerLineY = height - 115;
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(95, footerLineY);
  ctx.lineTo(365, footerLineY);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#475569';
  ctx.font = `bold 16px ${fontStack}`;
  ctx.fillText('হিসাবরক্ষক (Accountant)', 230, footerLineY + 28);

  ctx.beginPath();
  ctx.moveTo(width - 385, footerLineY);
  ctx.lineTo(width - 95, footerLineY);
  ctx.stroke();
  ctx.fillStyle = '#475569';
  ctx.font = `bold 16px ${fontStack}`;
  ctx.fillText('অধ্যক্ষ / সুপার অ্যাডমিন (Principal / Admin)', width - 240, footerLineY + 28);

  ctx.fillStyle = '#94A3B8';
  ctx.font = `500 14px ${fontStack}`;
  ctx.fillText(
    'আনন্দ পাঠশালা ডিজিটাল একাউন্টস সিস্টেম কর্তৃক স্বয়ংক্রিয়ভাবে জেনারেটেড পেমেন্ট রিপোর্ট।',
    width / 2,
    height - 55
  );

  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const jpegBytes = dataUrlToUint8Array(jpegDataUrl);
  const pdfBlob = wrapJpegInPdfDocument(jpegBytes, width, height);
  const fileName = `Ananda_Pathshala_Fee_Report_${report.fileSlug}.pdf`;

  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  return fileName;
}


