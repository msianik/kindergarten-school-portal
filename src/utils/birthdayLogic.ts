import { Student } from '../types/school';
import { toBengaliNumber } from './schoolLogic';

export interface StudentBirthdayMatch {
  student: Student;
  birthMonth: number; // 1-12
  birthDay: number; // 1-31
  birthYear: number;
  ageTurning: number;
  ageTurningBn: string;
  formattedDateBn: string; // e.g. "১০ নভেম্বর (মঙ্গলবার)"
  dayNameBn: string; // e.g. "মঙ্গলবার"
  isToday: boolean;
  isThisWeek: boolean;
  daysUntil: number; // 0 = today, 1 = tomorrow, etc.
  birthdayDateThisYear: Date;
}

const BN_MONTH_NAMES = [
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

const BN_WEEKDAY_NAMES = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার',
];

/**
 * Normalizes any Bengali digits to standard English digits
 */
export function normalizeBengaliDigits(input: string): string {
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  return input.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
}

/**
 * Parses raw birthDate string into year, month, day components
 */
export function parseBirthDate(
  rawBirthDate?: string
): { year: number; month: number; day: number } | null {
  if (!rawBirthDate || typeof rawBirthDate !== 'string') return null;

  const normalized = normalizeBengaliDigits(rawBirthDate.trim());

  // Format 1: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = normalized.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year, month, day };
    }
  }

  // Format 2: DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = normalized.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year, month, day };
    }
  }

  // Format 3: Named Bengali month e.g. "১০ নভেম্বর ২০২১"
  for (let m = 0; m < BN_MONTH_NAMES.length; m++) {
    const mName = BN_MONTH_NAMES[m];
    if (rawBirthDate.includes(mName)) {
      const parts = normalized.split(/\s+/);
      let day = 1;
      let year = 2021;
      for (const part of parts) {
        const num = parseInt(part, 10);
        if (!isNaN(num)) {
          if (num >= 1900 && num <= 2100) year = num;
          else if (num >= 1 && num <= 31) day = num;
        }
      }
      return { year, month: m + 1, day };
    }
  }

  return null;
}

/**
 * Checks if a student's birthday occurs in the current school week
 * In Bangladesh, the standard school week runs Saturday through Friday.
 */
export function getStudentBirthdayInfo(
  student: Student,
  referenceDate?: Date
): StudentBirthdayMatch | null {
  const parsed = parseBirthDate(student.birthDate);
  if (!parsed) return null;

  const now = referenceDate ? new Date(referenceDate) : new Date();
  const currentYear = now.getFullYear();

  // Birthday date for current reference year
  const bdayThisYear = new Date(currentYear, parsed.month - 1, parsed.day);

  // In Bangladesh / school calendar, week begins on Saturday (getDay() === 6)
  const currentDayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
  const diffToSaturday = (currentDayOfWeek + 1) % 7; // Saturday = 0, Sunday = 1, etc.

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diffToSaturday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Calculate day difference from today
  const oneDayMs = 1000 * 60 * 60 * 24;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfBday = new Date(currentYear, parsed.month - 1, parsed.day);
  const diffDays = Math.round((startOfBday.getTime() - startOfToday.getTime()) / oneDayMs);

  // Check if birthday falls in the calendar week OR within a rolling 7-day window
  const inCalendarWeek = bdayThisYear >= startOfWeek && bdayThisYear <= endOfWeek;
  const inRollingWeek = diffDays >= 0 && diffDays <= 6;
  const isThisWeek = inCalendarWeek || inRollingWeek;

  const isToday =
    now.getMonth() === parsed.month - 1 && now.getDate() === parsed.day;

  const ageTurning = currentYear - parsed.year;
  const dayNameBn = BN_WEEKDAY_NAMES[bdayThisYear.getDay()] || 'দিন';
  const monthNameBn = BN_MONTH_NAMES[parsed.month - 1] || 'মাস';
  const formattedDateBn = `${toBengaliNumber(parsed.day)} ${monthNameBn} (${dayNameBn})`;

  return {
    student,
    birthMonth: parsed.month,
    birthDay: parsed.day,
    birthYear: parsed.year,
    ageTurning,
    ageTurningBn: `${toBengaliNumber(ageTurning)} বছর`,
    formattedDateBn,
    dayNameBn,
    isToday,
    isThisWeek,
    daysUntil: diffDays,
    birthdayDateThisYear: bdayThisYear,
  };
}

/**
 * Filters a list of students to find all students with birthdays occurring in the current week
 */
export function getStudentsWithBirthdayThisWeek(
  students: Student[],
  referenceDate?: Date
): StudentBirthdayMatch[] {
  const matches: StudentBirthdayMatch[] = [];

  for (const std of students) {
    const info = getStudentBirthdayInfo(std, referenceDate);
    if (info && info.isThisWeek) {
      matches.push(info);
    }
  }

  // Sort: Today first, then by earliest day this week
  return matches.sort((a, b) => {
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;
    return a.daysUntil - b.daysUntil;
  });
}
