import { FeeInvoice, Student, FcmNotification } from '../types/school';
import { toBengaliNumber } from './schoolLogic';

const FEE_REMINDER_STORAGE_KEY = 'ananda_fee_due_notified_records_v1';
export const FEE_REMINDER_TRIGGERED_EVENT = 'ananda-fee-reminder-triggered';

/**
 * Bengali month name to 0-indexed month mapping
 */
const BN_MONTH_MAP: Record<string, number> = {
  জানুয়ারি: 0,
  জানুয়ারি: 0,
  ফেব্রুয়ারি: 1,
  ফেব্রুয়ারি: 1,
  মার্চ: 2,
  এপ্রিল: 3,
  মে: 4,
  জুন: 5,
  জুলাই: 6,
  আগস্ট: 7,
  সেপ্টেম্বর: 8,
  অক্টোবর: 9,
  নভেম্বর: 10,
  ডিসেম্বর: 11,
};

const EN_MONTH_MAP: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

/**
 * Normalize Bengali numerals (০-৯) to Western digits (0-9)
 */
export function normalizeBnDigits(input: string): string {
  const bnToEnMap: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return input.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
}

/**
 * Parses an invoice dueDate string into a JavaScript Date object.
 * Supports:
 * - Bengali dates: "১০ নভেম্বর ২০২৬", "০৭ নভেম্বর ২০২৬"
 * - English dates: "10 November 2026", "Nov 7, 2026"
 * - ISO strings: "2026-11-10", "2026-11-07"
 */
export function parseInvoiceDueDate(dueDateStr: string): Date | null {
  if (!dueDateStr) return null;

  const trimmed = dueDateStr.trim();

  // 1. Try standard ISO or RFC date parsing first (e.g. 2026-11-07)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day, 23, 59, 59);
    if (!isNaN(d.getTime())) return d;
  }

  // 2. Normalize Bengali digits to English digits
  const normalized = normalizeBnDigits(trimmed).toLowerCase();

  // 3. Match format: [day] [monthName] [year] (e.g., "10 নভেম্বর 2026" or "7 november 2026")
  const parts = normalized.split(/[\s,/-]+/);
  if (parts.length >= 2) {
    let day = -1;
    let month = -1;
    let year = new Date().getFullYear();

    for (const part of parts) {
      // Check if month name
      if (BN_MONTH_MAP[part] !== undefined) {
        month = BN_MONTH_MAP[part];
      } else if (EN_MONTH_MAP[part] !== undefined) {
        month = EN_MONTH_MAP[part];
      } else if (/^\d{4}$/.test(part)) {
        year = parseInt(part, 10);
      } else if (/^\d{1,2}$/.test(part)) {
        if (day === -1) {
          day = parseInt(part, 10);
        }
      }
    }

    if (day > 0 && month >= 0) {
      const d = new Date(year, month, day, 23, 59, 59);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Fallback direct Date parse
  const fallbackDate = new Date(trimmed);
  if (!isNaN(fallbackDate.getTime())) return fallbackDate;

  return null;
}

/**
 * Calculates remaining whole calendar days until an invoice's due date
 * Positive = upcoming days left (e.g. 3 = due in 3 days)
 * 0 = due today
 * Negative = overdue (e.g. -1 = 1 day overdue)
 */
export function getDaysUntilDueDate(dueDateStr: string, referenceDate: Date = new Date()): number | null {
  const due = parseInvoiceDueDate(dueDateStr);
  if (!due) return null;

  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const refMidnight = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()).getTime();

  const diffMs = dueMidnight - refMidnight;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formats a Date into Bengali Date string (e.g. "০৭ নভেম্বর ২০২৬")
 */
export function formatBengaliDueDate(date: Date): string {
  const bnMonths = [
    'জানুয়ারি',
    'ফেব্রুয়ারি',
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
  const dayBn = toBengaliNumber(date.getDate().toString().padStart(2, '0'));
  const monthBn = bnMonths[date.getMonth()];
  const yearBn = toBengaliNumber(date.getFullYear().toString());
  return `${dayBn} ${monthBn} ${yearBn}`;
}

/**
 * Checks whether an invoice reminder record has already been triggered in localStorage
 */
export function hasFeeReminderBeenTriggered(invoiceId: string, dueDate: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(FEE_REMINDER_STORAGE_KEY);
    if (!raw) return false;
    const records: Record<string, boolean> = JSON.parse(raw);
    const key = `${invoiceId}_${dueDate.replace(/\s+/g, '_')}`;
    return Boolean(records[key]);
  } catch {
    return false;
  }
}

/**
 * Records that a reminder has been triggered to prevent duplicate notifications
 */
export function markFeeReminderAsTriggered(invoiceId: string, dueDate: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(FEE_REMINDER_STORAGE_KEY);
    const records: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    const key = `${invoiceId}_${dueDate.replace(/\s+/g, '_')}`;
    records[key] = true;
    localStorage.setItem(FEE_REMINDER_STORAGE_KEY, JSON.stringify(records));
  } catch {}
}

/**
 * Resets reminder tracking records (useful for testing)
 */
export function resetFeeReminderTracking(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(FEE_REMINDER_STORAGE_KEY);
  } catch {}
}

/**
 * Constructs an in-app FcmNotification payload for a school fee due reminder
 */
export function createFeeDueReminderFcmPayload(
  invoice: FeeInvoice,
  student?: Student,
  daysRemaining?: number,
  customTimeLabel?: string
): FcmNotification {
  const remaining = daysRemaining !== undefined ? daysRemaining : 3;
  const timeLabel =
    customTimeLabel ||
    `আজ ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

  const guardianName = student
    ? student.authorizedPickups?.[0]?.nameBn || student.fatherNameBn || student.motherNameBn || 'সম্মানিত অভিভাবক'
    : 'সম্মানিত অভিভাবক';

  const daysLabelBn =
    remaining === 3
      ? '৩ দিন বাকি'
      : remaining === 2
      ? '২ দিন বাকি'
      : remaining === 1
      ? 'আগামীকাল শেষ দিন'
      : remaining === 0
      ? 'আজই শেষ দিন'
      : `${toBengaliNumber(Math.abs(remaining))} দিন অতিবাহিত`;

  const priorityLevel = remaining <= 1 ? 'urgent' : 'high';

  return {
    id: `fcm-fee-${invoice.id}-${Date.now()}`,
    type: 'fee_due_reminder',
    priority: priorityLevel,
    titleBn: `💳 স্কুল ফি পরিশোধের স্মারক (${daysLabelBn}): ${invoice.studentNameBn}`,
    bodyBn: `সম্মানিত অভিভাবক (${guardianName}), আপনার সন্তান ${invoice.studentNameBn}-এর (${invoice.className}) ${invoice.monthBn}-এর স্কুল ফি ৳${toBengaliNumber(invoice.netAmount)} জমা দেওয়ার শেষ সময়সীমা ${invoice.dueDate} (${daysLabelBn})। বিলম্ব ফি এড়াতে বিকাশ বা স্কুল অফিসে ফি পরিশোধ করুন।`,
    targetRole: 'parent',
    studentOrApplicantNameBn: invoice.studentNameBn,
    className: invoice.className,
    guardianNameBn: guardianName,
    guardianPhone: student?.emergencyPhone,
    timestamp: timeLabel,
    read: false,
    actionTab: 'fees',
    fcmMessageId: `projects/gen-lang-client-0036381817/messages/fee_due_${invoice.id}_${Date.now()}`,
    invoiceId: invoice.id,
    dueAmount: invoice.netAmount,
    dueDate: invoice.dueDate,
    daysRemaining: remaining,
  };
}

export interface FeeReminderCheckResult {
  triggeredCount: number;
  upcomingCount: number;
  evaluatedInvoices: {
    invoice: FeeInvoice;
    daysRemaining: number | null;
    isEligible: boolean;
    alreadyTriggered: boolean;
    triggeredNow: boolean;
  }[];
}

/**
 * Automated system to check all unpaid school fee invoices and trigger in-app notifications
 * for parents 3 days before their invoice is due (or within 3 days).
 *
 * @param invoices List of current invoices
 * @param students List of current students
 * @param onTriggerNotification Callback invoked to dispatch the in-app notification
 * @param options.forceTrigger If true, bypasses duplicate check (e.g. for testing)
 * @param options.targetDays Number of days threshold (default: 3)
 * @param options.referenceDate Date against which to compare due dates (default: new Date())
 */
export function checkAndTriggerFeeDueReminders(
  invoices: FeeInvoice[],
  students: Student[],
  onTriggerNotification: (notif: FcmNotification) => void,
  options: {
    forceTrigger?: boolean;
    targetDays?: number;
    referenceDate?: Date;
  } = {}
): FeeReminderCheckResult {
  const { forceTrigger = false, targetDays = 3, referenceDate = new Date() } = options;

  let triggeredCount = 0;
  let upcomingCount = 0;
  const evaluatedInvoices: FeeReminderCheckResult['evaluatedInvoices'] = [];

  for (const inv of invoices) {
    // Only check unpaid or overdue invoices
    if (inv.status === 'paid') {
      continue;
    }

    const daysRemaining = getDaysUntilDueDate(inv.dueDate, referenceDate);
    if (daysRemaining === null) {
      continue;
    }

    // Is within 3 days threshold (e.g., 3 days, 2 days, 1 day, or 0 days)
    const isEligible = daysRemaining <= targetDays && daysRemaining >= 0;
    if (isEligible) {
      upcomingCount++;
    }

    const alreadyTriggered = hasFeeReminderBeenTriggered(inv.id, inv.dueDate);
    let triggeredNow = false;

    if (isEligible && (!alreadyTriggered || forceTrigger)) {
      const student = students.find((s) => s.id === inv.studentId);
      const notif = createFeeDueReminderFcmPayload(inv, student, daysRemaining);
      onTriggerNotification(notif);
      markFeeReminderAsTriggered(inv.id, inv.dueDate);
      triggeredNow = true;
      triggeredCount++;

      // Dispatch browser custom event for UI reactivity
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(FEE_REMINDER_TRIGGERED_EVENT, { detail: { invoice: inv, notification: notif } })
        );
      }
    }

    evaluatedInvoices.push({
      invoice: inv,
      daysRemaining,
      isEligible,
      alreadyTriggered,
      triggeredNow,
    });
  }

  return {
    triggeredCount,
    upcomingCount,
    evaluatedInvoices,
  };
}

/**
 * Checks unpaid invoices specifically for a logged-in parent's child
 * and triggers in-app notification ONLY when that parent logs in.
 */
export function checkAndTriggerFeeDueRemindersForParent(
  parentStudentId: string,
  invoices: FeeInvoice[],
  students: Student[],
  onTriggerNotification: (notif: FcmNotification) => void,
  options: {
    forceTrigger?: boolean;
    referenceDate?: Date;
  } = {}
): FeeReminderCheckResult {
  const childInvoices = invoices.filter(
    (inv) => inv.studentId === parentStudentId && inv.status !== 'paid'
  );
  if (childInvoices.length === 0) {
    return {
      triggeredCount: 0,
      upcomingCount: 0,
      evaluatedInvoices: [],
    };
  }

  const student = students.find((s) => s.id === parentStudentId);
  const { forceTrigger = false, referenceDate = new Date() } = options;

  let triggeredCount = 0;
  const evaluatedInvoices: FeeReminderCheckResult['evaluatedInvoices'] = [];

  for (const inv of childInvoices) {
    const daysRemaining = getDaysUntilDueDate(inv.dueDate, referenceDate) ?? 3;
    const alreadyTriggered = hasFeeReminderBeenTriggered(inv.id, inv.dueDate);
    let triggeredNow = false;

    if (!alreadyTriggered || forceTrigger) {
      const notif = createFeeDueReminderFcmPayload(inv, student, daysRemaining);
      onTriggerNotification(notif);
      markFeeReminderAsTriggered(inv.id, inv.dueDate);
      triggeredNow = true;
      triggeredCount++;

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(FEE_REMINDER_TRIGGERED_EVENT, { detail: { invoice: inv, notification: notif } })
        );
      }
    }

    evaluatedInvoices.push({
      invoice: inv,
      daysRemaining,
      isEligible: true,
      alreadyTriggered,
      triggeredNow,
    });
  }

  return {
    triggeredCount,
    upcomingCount: childInvoices.length,
    evaluatedInvoices,
  };
}

/**
 * Creates or ensures a sample invoice that is due exactly 3 days from now
 * for testing the automated notification system.
 */
export function createDemoThreeDaysDueInvoice(
  student: Student,
  baseDate: Date = new Date()
): FeeInvoice {
  const threeDaysLater = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 3, 23, 59, 59);
  const formattedDueDate = formatBengaliDueDate(threeDaysLater);
  const currentMonthBn = 'নভেম্বর ২০২৬';

  return {
    id: `inv-auto-3d-${student.id}-${Date.now()}`,
    invoiceNo: `AP-DUE3D-${Math.floor(100 + Math.random() * 900)}`,
    studentId: student.id,
    studentNameBn: student.nameBn,
    className: student.className,
    monthBn: currentMonthBn,
    totalAmount: 4500,
    discountAmount: 300,
    netAmount: 4200,
    dueDate: formattedDueDate,
    status: 'unpaid',
    items: [
      { nameBn: 'মাসিক টিউশন ফি (Tuition Fee)', amount: 2600 },
      { nameBn: 'পুষ্টিকর খাদ্য ও ফ্রুটস নাস্তা', amount: 1100 },
      { nameBn: 'আর্ট, ক্রাফট ও শিখন ম্যাটেরিয়ালস', amount: 800 },
    ],
  };
}

