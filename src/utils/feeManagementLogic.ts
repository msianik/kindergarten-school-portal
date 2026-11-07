import { Student, StudentFeeConfig, FeeInvoice, SchoolClass } from '../types/school';
import { toBengaliNumber } from './schoolLogic';

export const STUDENT_FEE_CONFIG_STORAGE_KEY = 'ananda_student_fee_configs_v1';
export const STUDENT_FEE_CONFIG_EVENT = 'student-fee-config-updated';

export interface BillingMonthMeta {
  key: string;
  monthIndex: number; // 0 = Jan, 4 = May, 9 = Oct, 10 = Nov
  year: number;
  nameBn: string;
  shortBn: string;
  dueDayBn: string;
}

export const ALL_2026_MONTHS: BillingMonthMeta[] = [
  { key: 'jan', monthIndex: 0, year: 2026, nameBn: 'জানুয়ারি ২০২৬', shortBn: 'জানুয়ারি', dueDayBn: '১০ জানুয়ারি ২০২৬' },
  { key: 'feb', monthIndex: 1, year: 2026, nameBn: 'ফেব্রুয়ারি ২০২৬', shortBn: 'ফেব্রুয়ারি', dueDayBn: '১০ ফেব্রুয়ারি ২০২৬' },
  { key: 'mar', monthIndex: 2, year: 2026, nameBn: 'মার্চ ২০২৬', shortBn: 'মার্চ', dueDayBn: '১০ মার্চ ২০২৬' },
  { key: 'apr', monthIndex: 3, year: 2026, nameBn: 'এপ্রিল ২০২৬', shortBn: 'এপ্রিল', dueDayBn: '১০ এপ্রিল ২০২৬' },
  { key: 'may', monthIndex: 4, year: 2026, nameBn: 'মে ২০২৬', shortBn: 'মে', dueDayBn: '১০ মে ২০২৬' },
  { key: 'jun', monthIndex: 5, year: 2026, nameBn: 'জুন ২০২৬', shortBn: 'জুন', dueDayBn: '১০ জুন ২০২৬' },
  { key: 'jul', monthIndex: 6, year: 2026, nameBn: 'জুলাই ২০২৬', shortBn: 'জুলাই', dueDayBn: '১০ জুলাই ২০২৬' },
  { key: 'aug', monthIndex: 7, year: 2026, nameBn: 'আগস্ট ২০২৬', shortBn: 'আগস্ট', dueDayBn: '১০ আগস্ট ২০২৬' },
  { key: 'sep', monthIndex: 8, year: 2026, nameBn: 'সেপ্টেম্বর ২০২৬', shortBn: 'সেপ্টেম্বর', dueDayBn: '১০ সেপ্টেম্বর ২০২৬' },
  { key: 'oct', monthIndex: 9, year: 2026, nameBn: 'অক্টোবর ২০২৬', shortBn: 'অক্টোবর', dueDayBn: '০৭ নভেম্বর ২০২৬' },
  { key: 'nov', monthIndex: 10, year: 2026, nameBn: 'নভেম্বর ২০২৬', shortBn: 'নভেম্বর', dueDayBn: '১০ নভেম্বর ২০২৬' },
  { key: 'dec', monthIndex: 11, year: 2026, nameBn: 'ডিসেম্বর ২০২৬', shortBn: 'ডিসেম্বর', dueDayBn: '১০ ডিসেম্বর ২০২৬' },
];

const BENGALI_MONTH_NAMES = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export function formatIsoDateToBengali(isoDate: string): string {
  if (!isoDate) return '০১ মে ২০২৬';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(monthIdx) || isNaN(day) || monthIdx < 0 || monthIdx > 11) {
    return isoDate;
  }
  const dayStr = day < 10 ? `০${toBengaliNumber(day)}` : toBengaliNumber(day);
  const monthBn = BENGALI_MONTH_NAMES[monthIdx];
  const yearBn = toBengaliNumber(year);
  return `${dayStr} ${monthBn} ${yearBn}`;
}

export function getDefaultClassMonthlyFee(className: SchoolClass): number {
  if (className === 'HateKhori' || className === 'Play' || className === 'Playgroup') return 3800;
  if (className === 'Nursery') return 4000;
  if (className === 'KG' || className === 'KG-1') return 4500;
  if (className === 'KG-2' || className === 'Class-1' || className === 'Class-2') return 4800;
  return 4000;
}

export function getDefaultClassAdmissionFee(className: SchoolClass): number {
  if (className === 'HateKhori' || className === 'Play' || className === 'Playgroup') return 4500;
  if (className === 'Nursery') return 5000;
  if (className === 'KG' || className === 'KG-1') return 5500;
  if (className === 'KG-2' || className === 'Class-1' || className === 'Class-2') return 6000;
  return 5000;
}

export function getDefaultStudentFeeConfig(student: Student): StudentFeeConfig {
  const defaultMonthly = student.monthlyFee || getDefaultClassMonthlyFee(student.className);
  const defaultAdmission = student.admissionFee || getDefaultClassAdmissionFee(student.className);
  const isoDate = student.admissionDate || '2026-05-01';
  const dateBn = student.admissionDateBn || formatIsoDateToBengali(isoDate);

  return {
    studentId: student.id,
    admissionDate: isoDate,
    admissionDateBn: dateBn,
    admissionFee: defaultAdmission,
    admissionFeeStatus: 'paid',
    admissionReceiptNo: `AP-ADM-${student.rollNo || '101'}`,
    admissionPaidAt: dateBn,
    admissionPaymentMethod: 'Cash',
    monthlyFee: defaultMonthly,
    monthlyDiscount: 0,
    sessionFee: 0,
    updatedByBn: 'সুপার অ্যাডমিন',
    updatedAtBn: '০১ মে ২০২৬',
  };
}

export function getAllStudentFeeConfigs(): Record<string, StudentFeeConfig> {
  try {
    const raw = localStorage.getItem(STUDENT_FEE_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {}
  return {};
}

export function getStudentFeeConfig(student: Student): StudentFeeConfig {
  const all = getAllStudentFeeConfigs();
  if (all[student.id]) {
    return all[student.id];
  }
  return getDefaultStudentFeeConfig(student);
}

export function saveStudentFeeConfig(config: StudentFeeConfig): Record<string, StudentFeeConfig> {
  const all = getAllStudentFeeConfigs();
  const updated = {
    ...all,
    [config.studentId]: {
      ...config,
      admissionDateBn: formatIsoDateToBengali(config.admissionDate),
    },
  };
  try {
    localStorage.setItem(STUDENT_FEE_CONFIG_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(STUDENT_FEE_CONFIG_EVENT, { detail: updated }));
  } catch {}
  return updated;
}

/**
 * Given a student's admissionDate (e.g. '2026-05-01'), returns the list of billing months
 * starting from the admission month up to October 2026 (or at least the 6-month window).
 */
export function getActiveMonthsFromAdmission(admissionDateIso: string): BillingMonthMeta[] {
  const parts = (admissionDateIso || '2026-05-01').split('-');
  let startMonthIdx = 4; // Default May (index 4)
  if (parts.length === 3) {
    const parsedMonth = parseInt(parts[1], 10) - 1;
    if (!isNaN(parsedMonth) && parsedMonth >= 0 && parsedMonth <= 11) {
      startMonthIdx = parsedMonth;
    }
  }
  // End month is October (index 9) or startMonthIdx if admission is in Nov/Dec
  const endMonthIdx = Math.max(9, startMonthIdx);
  return ALL_2026_MONTHS.filter(
    (m) => m.monthIndex >= startMonthIdx && m.monthIndex <= endMonthIdx
  );
}

/**
 * Generates or updates a student's Admission Invoice and Monthly Invoices
 * starting from their configured Admission Date.
 */
export function generateStudentInvoicesFromConfig(
  student: Student,
  config: StudentFeeConfig,
  existingInvoices: FeeInvoice[],
  options?: {
    markPastMonthsPaid?: boolean;
    currentUnpaidMonthKey?: string;
    confirmedByBn?: string;
  }
): FeeInvoice[] {
  const markPastPaid = options?.markPastMonthsPaid ?? true;
  const unpaidMonthKey = options?.currentUnpaidMonthKey ?? 'oct';
  const confirmedBy = options?.confirmedByBn || 'সুপার অ্যাডমিন';
  const admissionDateBn = formatIsoDateToBengali(config.admissionDate);

  // Keep invoices belonging to OTHER students untouched
  const otherStudentsInvoices = existingInvoices.filter((inv) => inv.studentId !== student.id);
  const currentStudentExisting = existingInvoices.filter((inv) => inv.studentId === student.id);

  const generatedForStudent: FeeInvoice[] = [];

  // 1. Admission Fee Invoice (ভর্তি ফি ও সেশন ফি ইনভয়েস)
  const existingAdmissionInv = currentStudentExisting.find(
    (inv) => inv.invoiceType === 'admission' || inv.monthBn.includes('ভর্তি ফি')
  );
  const admissionNet = Math.max(0, (config.admissionFee || 0) + (config.sessionFee || 0));
  const isAdmissionPaid = config.admissionFeeStatus === 'paid';

  const admissionItems = [
    { nameBn: `নতুন ভর্তি ও রেজিস্ট্রেশন ফি (ভর্তির তারিখ: ${admissionDateBn})`, amount: config.admissionFee || 0 },
  ];
  if (config.sessionFee && config.sessionFee > 0) {
    admissionItems.push({
      nameBn: 'বার্ষিক সেশন ও শিক্ষা উপকরণ চার্জ',
      amount: config.sessionFee,
    });
  }

  const admInvNo =
    config.admissionReceiptNo || existingAdmissionInv?.invoiceNo || `AP-ADM-${student.rollNo || '101'}`;

  const admissionInvoice: FeeInvoice = {
    id: existingAdmissionInv?.id || `inv-adm-${student.id}`,
    invoiceNo: admInvNo,
    studentId: student.id,
    studentNameBn: student.nameBn,
    className: student.className,
    monthBn: `ভর্তি ফি (${admissionDateBn})`,
    invoiceType: 'admission',
    admissionDateBn,
    totalAmount: admissionNet,
    discountAmount: 0,
    netAmount: admissionNet,
    dueDate: admissionDateBn,
    status: isAdmissionPaid ? 'paid' : 'unpaid',
    items: admissionItems,
    paymentMethod: isAdmissionPaid ? (config.admissionPaymentMethod || 'Cash') : undefined,
    transactionId: isAdmissionPaid
      ? existingAdmissionInv?.transactionId || `ADM${student.rollNo || '101'}VRF`
      : undefined,
    paidAt: isAdmissionPaid ? (config.admissionPaidAt || admissionDateBn) : undefined,
    confirmedByBn: isAdmissionPaid ? confirmedBy : undefined,
    pdfReceiptGenerated: isAdmissionPaid,
    pdfReceiptFileName: isAdmissionPaid ? `Ananda_Pathshala_Receipt_${admInvNo}.pdf` : undefined,
    pdfReceiptGeneratedAt: isAdmissionPaid ? (config.admissionPaidAt || admissionDateBn) : undefined,
    pdfReceiptSerialNo: isAdmissionPaid ? `PDF-RCPT-${admInvNo}` : undefined,
  };

  generatedForStudent.push(admissionInvoice);

  // 2. Monthly Tuition Fee Invoices from Admission Month
  const activeMonths = getActiveMonthsFromAdmission(config.admissionDate);
  const monthlyGross = Math.max(0, config.monthlyFee || 0);
  const monthlyDisc = Math.max(0, config.monthlyDiscount || 0);
  const monthlyNet = Math.max(0, monthlyGross - monthlyDisc);

  // Split monthly fee into clear breakdown items
  const tuitionPortion = Math.round(monthlyGross * 0.65);
  const snacksPortion = Math.round(monthlyGross * 0.22);
  const activityPortion = Math.max(0, monthlyGross - tuitionPortion - snacksPortion);

  activeMonths.forEach((mMeta, idx) => {
    const existingMonthInv = currentStudentExisting.find(
      (inv) =>
        inv.invoiceType !== 'admission' &&
        (inv.monthBn.includes(mMeta.shortBn) || inv.monthBn === mMeta.nameBn)
    );

    const isLastOrTargetUnpaid = mMeta.key === unpaidMonthKey || idx === activeMonths.length - 1;
    let status: 'paid' | 'unpaid' | 'overdue' = 'unpaid';

    if (existingMonthInv) {
      status = existingMonthInv.status;
    } else {
      status = markPastPaid && !isLastOrTargetUnpaid ? 'paid' : 'unpaid';
    }

    const mInvNo =
      existingMonthInv?.invoiceNo || `AP-${mMeta.key.toUpperCase()}-${student.rollNo || '101'}`;
    const mPaidAt =
      status === 'paid' ? existingMonthInv?.paidAt || `০৫ ${mMeta.nameBn}` : undefined;

    const monthInvoice: FeeInvoice = {
      id: existingMonthInv?.id || `inv-${mMeta.key}-${student.id}`,
      invoiceNo: mInvNo,
      studentId: student.id,
      studentNameBn: student.nameBn,
      className: student.className,
      monthBn: mMeta.nameBn,
      invoiceType: 'monthly',
      admissionDateBn,
      totalAmount: monthlyGross,
      discountAmount: monthlyDisc,
      netAmount: monthlyNet,
      dueDate: mMeta.dueDayBn,
      status,
      items: [
        { nameBn: `মাসিক টিউশন ফি (${mMeta.nameBn})`, amount: tuitionPortion },
        { nameBn: 'পুষ্টিকর নাশতা ও হেলদি স্ন্যাক্স ফি', amount: snacksPortion },
        { nameBn: 'আর্ট, ক্রাফট ও স্মার্ট ক্লাসরুম অ্যাক্টিভিটি', amount: activityPortion },
      ],
      paymentMethod:
        status === 'paid' ? existingMonthInv?.paymentMethod || 'bKash' : undefined,
      transactionId:
        status === 'paid'
          ? existingMonthInv?.transactionId || `BK${mMeta.key.toUpperCase()}84${student.rollNo || '101'}`
          : undefined,
      paidAt: mPaidAt,
      confirmedByBn: status === 'paid' ? existingMonthInv?.confirmedByBn || confirmedBy : undefined,
      pdfReceiptGenerated: status === 'paid',
      pdfReceiptFileName:
        status === 'paid' ? `Ananda_Pathshala_Receipt_${mInvNo}.pdf` : undefined,
      pdfReceiptGeneratedAt: mPaidAt,
      pdfReceiptSerialNo: status === 'paid' ? `PDF-RCPT-${mInvNo}` : undefined,
    };

    generatedForStudent.push(monthInvoice);
  });

  // Preserve any custom extra invoices for this student not in activeMonths
  currentStudentExisting.forEach((inv) => {
    const alreadyIncluded = generatedForStudent.some(
      (g) => g.id === inv.id || g.monthBn === inv.monthBn
    );
    if (!alreadyIncluded) {
      generatedForStudent.push(inv);
    }
  });

  return [...generatedForStudent, ...otherStudentsInvoices];
}

/**
 * Returns the complete list of invoices (Admission + Monthly from Admission Date) for a single student,
 * merging live state invoices with their configured fee schedule so parents & admins see all receipts.
 */
export function getStudentCompleteInvoicesList(
  student: Student,
  liveInvoices: FeeInvoice[]
): FeeInvoice[] {
  const config = getStudentFeeConfig(student);
  const allMerged = generateStudentInvoicesFromConfig(student, config, liveInvoices);
  return allMerged.filter((inv) => inv.studentId === student.id);
}

// ============================================================================
// TEACHER SALARY & PAYROLL LEDGER (শিক্ষকের মাসিক বেতন ও সম্মানী বিবরণী)
// ============================================================================

export interface TeacherMonthlySalarySlip {
  id: string;
  teacherId: string;
  teacherNameBn: string;
  designationBn: string;
  assignedClass?: SchoolClass;
  monthKey: string;
  monthNameBn: string;
  basicSalary: number;
  allowance: number;
  netSalary: number;
  status: 'paid' | 'pending';
  paidDateBn?: string;
  paymentMethodBn?: string;
  transactionId?: string;
  approvedByBn?: string;
}

const TEACHER_SALARY_STORAGE_KEY = 'ananda_teacher_payroll_slips_v1';

const DEFAULT_TEACHER_SALARIES: Record<
  string,
  { basic: number; allowance: number; nameBn: string; designationBn: string; assignedClass?: SchoolClass }
> = {
  'tch-2': {
    basic: 15000,
    allowance: 3000,
    nameBn: 'ফাতেমা আক্তার',
    designationBn: 'প্রধান শিক্ষক (Head Teacher)',
    assignedClass: 'Nursery',
  },
  'tch-3': {
    basic: 12000,
    allowance: 2500,
    nameBn: 'মোছাঃ মাহমুদা হক (রিয়া মিস)',
    designationBn: 'সহকারী শিক্ষক (Teacher)',
    assignedClass: 'Play',
  },
  'tch-4': {
    basic: 12000,
    allowance: 2500,
    nameBn: 'সৈয়দ ফাহমিদ বিন নূর',
    designationBn: 'সহকারী শিক্ষক (Teacher)',
    assignedClass: 'Class-1',
  },
  'tch-5': {
    basic: 11500,
    allowance: 2000,
    nameBn: 'মুক্তা পারভীন',
    designationBn: 'সহকারী শিক্ষক (Teacher)',
    assignedClass: 'HateKhori',
  },
  'tch-6': {
    basic: 12000,
    allowance: 2500,
    nameBn: 'ঐশী বিনতে মোস্তফা (ঐশী মিস)',
    designationBn: 'সহকারী শিক্ষক (Teacher)',
    assignedClass: 'Nursery',
  },
  'tch-7': {
    basic: 12000,
    allowance: 2500,
    nameBn: 'জান্নাতুল ফেরদৌস মীম (মীম ম্যাম)',
    designationBn: 'সহকারী শিক্ষক (Teacher)',
    assignedClass: 'KG',
  },
  'tch-8': {
    basic: 12500,
    allowance: 2500,
    nameBn: 'আরাফাত হক',
    designationBn: 'সহকারী শিক্ষক (Teacher)',
    assignedClass: 'Class-2',
  },
};

export function getTeacherSalarySlips(
  teacherNameBn?: string,
  assignedClass?: SchoolClass
): TeacherMonthlySalarySlip[] {
  const payMonths = ALL_2026_MONTHS.slice(4, 10); // May to Oct 2026
  const matchedEntry =
    Object.entries(DEFAULT_TEACHER_SALARIES).find(
      ([, v]) =>
        (teacherNameBn && v.nameBn.includes(teacherNameBn.split(' ')[0])) ||
        (assignedClass && v.assignedClass === assignedClass)
    ) || ['tch-2', DEFAULT_TEACHER_SALARIES['tch-2']];

  const [teacherId, meta] = matchedEntry as [
    string,
    { basic: number; allowance: number; nameBn: string; designationBn: string; assignedClass?: SchoolClass }
  ];

  try {
    const raw = localStorage.getItem(`${TEACHER_SALARY_STORAGE_KEY}_${teacherId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  const net = meta.basic + meta.allowance;
  return payMonths.map((m, idx) => {
    const isPaid = idx < payMonths.length - 1; // May to Sep paid, Oct pending/current
    return {
      id: `sal-${teacherId}-${m.key}`,
      teacherId,
      teacherNameBn: teacherNameBn || meta.nameBn,
      designationBn: meta.designationBn,
      assignedClass: assignedClass || meta.assignedClass || 'Nursery',
      monthKey: m.key,
      monthNameBn: m.nameBn,
      basicSalary: meta.basic,
      allowance: meta.allowance,
      netSalary: net,
      status: isPaid ? 'paid' : 'pending',
      paidDateBn: isPaid ? `০৩ ${m.nameBn}` : undefined,
      paymentMethodBn: isPaid ? 'ব্যাংক ট্রান্সফার / বিকাশ পে-রোল' : undefined,
      transactionId: isPaid ? `SAL-2026-${m.key.toUpperCase()}-${idx + 101}` : undefined,
      approvedByBn: isPaid ? 'প্রিন্সিপাল ও সুপার অ্যাডমিন' : undefined,
    };
  });
}

