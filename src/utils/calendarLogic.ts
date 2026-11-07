import { AcademicCalendarEvent, AcademicEventCategory } from '../types/school';

export const BN_MONTH_NAMES = [
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

export const EN_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const BN_WEEKDAYS = [
  { shortBn: 'রবি', fullBn: 'রবিবার', shortEn: 'Sun', isWeekend: false },
  { shortBn: 'সোম', fullBn: 'সোমবার', shortEn: 'Mon', isWeekend: false },
  { shortBn: 'মঙ্গল', fullBn: 'মঙ্গলবার', shortEn: 'Tue', isWeekend: false },
  { shortBn: 'বুধ', fullBn: 'বুধবার', shortEn: 'Wed', isWeekend: false },
  { shortBn: 'বৃহঃ', fullBn: 'বৃহস্পতিবার', shortEn: 'Thu', isWeekend: false },
  { shortBn: 'শুক্র', fullBn: 'শুক্রবার', shortEn: 'Fri', isWeekend: true },
  { shortBn: 'শনি', fullBn: 'শনিবার', shortEn: 'Sat', isWeekend: true },
];

/**
 * Converts English digits to Bengali digits.
 */
export function toBengaliDigits(input: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return input.toString().replace(/\d/g, (digit) => bnDigits[parseInt(digit, 10)]);
}

/**
 * Converts Bengali digits to English digits.
 */
export function fromBengaliDigits(input: string): string {
  const bnDigits: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  return input.replace(/[০-৯]/g, (char) => bnDigits[char] || char);
}

/**
 * Parses date string in multiple potential formats:
 * - "১৫ নভেম্বর ২০২৬"
 * - "15 November 2026"
 * - "2026-11-15"
 */
export function parseDateString(dateStr?: string): { year: number; month: number; day: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const normalized = fromBengaliDigits(dateStr.trim());

  // ISO Format: YYYY-MM-DD
  const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return { year, month, day };
  }

  // Bengali month names matching
  for (let m = 0; m < BN_MONTH_NAMES.length; m++) {
    const bnName = BN_MONTH_NAMES[m];
    if (dateStr.includes(bnName)) {
      // Find day (first number before month) and year (number after month)
      const parts = normalized.split(/\s+/);
      let day = 1;
      let year = 2026;

      for (const part of parts) {
        const num = parseInt(part, 10);
        if (!isNaN(num)) {
          if (num >= 1900 && num <= 2100) {
            year = num;
          } else if (num >= 1 && num <= 31) {
            day = num;
          }
        }
      }
      return { year, month: m, day };
    }
  }

  // English month names matching
  for (let m = 0; m < EN_MONTH_NAMES.length; m++) {
    const enName = EN_MONTH_NAMES[m].toLowerCase();
    if (dateStr.toLowerCase().includes(enName)) {
      const parts = normalized.split(/\s+/);
      let day = 1;
      let year = 2026;

      for (const part of parts) {
        const num = parseInt(part, 10);
        if (!isNaN(num)) {
          if (num >= 1900 && num <= 2100) {
            year = num;
          } else if (num >= 1 && num <= 31) {
            day = num;
          }
        }
      }
      return { year, month: m, day };
    }
  }

  return null;
}

export interface CalendarDayCell {
  date: Date;
  dayNumber: number;
  dayNumberBn: string;
  dateKey: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean; // Friday or Saturday in BD
  dayOfWeekBn: string;
  events: AcademicCalendarEvent[];
  primaryCategory: AcademicEventCategory | null;
  hasHoliday: boolean;
  hasExam: boolean;
  hasMeeting: boolean;
}

/**
 * Checks if a specific date falls within an event's date range (inclusive).
 */
export function isDateInEventRange(
  date: Date,
  event: AcademicCalendarEvent
): boolean {
  const start = parseDateString(event.startDate);
  if (!start) return false;

  const startDate = new Date(start.year, start.month, start.day, 0, 0, 0, 0);

  let endDate: Date;
  if (event.endDate) {
    const end = parseDateString(event.endDate);
    endDate = end
      ? new Date(end.year, end.month, end.day, 23, 59, 59, 999)
      : new Date(start.year, start.month, start.day, 23, 59, 59, 999);
  } else {
    endDate = new Date(start.year, start.month, start.day, 23, 59, 59, 999);
  }

  const targetTime = date.getTime();
  return targetTime >= startDate.getTime() && targetTime <= endDate.getTime();
}

/**
 * Generates the full 35-42 calendar day grid for a given month and year.
 */
export function generateMonthCalendarGrid(
  year: number,
  month: number, // 0-indexed (0 = Jan, 10 = Nov)
  events: AcademicCalendarEvent[],
  todayDate: Date = new Date()
): {
  cells: CalendarDayCell[];
  monthNameBn: string;
  monthNameEn: string;
  yearBn: string;
  totalEventsInMonth: number;
  holidaysCountInMonth: number;
  examsCountInMonth: number;
  meetingsCountInMonth: number;
} {
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarDayCell[] = [];

  const todayYear = todayDate.getFullYear();
  const todayMonth = todayDate.getMonth();
  const todayDay = todayDate.getDate();

  // 1. Previous Month Leading Days (padding to align with starting day of week)
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, day);
    const dayOfWeek = prevMonthDate.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
    const dateKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const matchingEvents = events.filter((ev) => isDateInEventRange(prevMonthDate, ev));
    const hasHoliday = matchingEvents.some((e) => e.category === 'holiday');
    const hasExam = matchingEvents.some((e) => e.category === 'exam');
    const hasMeeting = matchingEvents.some((e) => e.category === 'meeting');

    let primaryCategory: AcademicEventCategory | null = null;
    if (hasHoliday) primaryCategory = 'holiday';
    else if (hasExam) primaryCategory = 'exam';
    else if (hasMeeting) primaryCategory = 'meeting';

    cells.push({
      date: prevMonthDate,
      dayNumber: day,
      dayNumberBn: toBengaliDigits(day),
      dateKey,
      isCurrentMonth: false,
      isToday: false,
      isWeekend,
      dayOfWeekBn: BN_WEEKDAYS[dayOfWeek].shortBn,
      events: matchingEvents,
      primaryCategory,
      hasHoliday,
      hasExam,
      hasMeeting,
    });
  }

  // 2. Current Month Days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const isToday = todayYear === year && todayMonth === month && todayDay === day;
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const matchingEvents = events.filter((ev) => isDateInEventRange(currentDate, ev));
    const hasHoliday = matchingEvents.some((e) => e.category === 'holiday');
    const hasExam = matchingEvents.some((e) => e.category === 'exam');
    const hasMeeting = matchingEvents.some((e) => e.category === 'meeting');

    let primaryCategory: AcademicEventCategory | null = null;
    if (hasHoliday) primaryCategory = 'holiday';
    else if (hasExam) primaryCategory = 'exam';
    else if (hasMeeting) primaryCategory = 'meeting';

    cells.push({
      date: currentDate,
      dayNumber: day,
      dayNumberBn: toBengaliDigits(day),
      dateKey,
      isCurrentMonth: true,
      isToday,
      isWeekend,
      dayOfWeekBn: BN_WEEKDAYS[dayOfWeek].shortBn,
      events: matchingEvents,
      primaryCategory,
      hasHoliday,
      hasExam,
      hasMeeting,
    });
  }

  // 3. Next Month Trailing Days (fill up the last row to complete 35 or 42 grid cells)
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthDate = new Date(year, month + 1, day);
    const dayOfWeek = nextMonthDate.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const dateKey = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const matchingEvents = events.filter((ev) => isDateInEventRange(nextMonthDate, ev));
    const hasHoliday = matchingEvents.some((e) => e.category === 'holiday');
    const hasExam = matchingEvents.some((e) => e.category === 'exam');
    const hasMeeting = matchingEvents.some((e) => e.category === 'meeting');

    let primaryCategory: AcademicEventCategory | null = null;
    if (hasHoliday) primaryCategory = 'holiday';
    else if (hasExam) primaryCategory = 'exam';
    else if (hasMeeting) primaryCategory = 'meeting';

    cells.push({
      date: nextMonthDate,
      dayNumber: day,
      dayNumberBn: toBengaliDigits(day),
      dateKey,
      isCurrentMonth: false,
      isToday: false,
      isWeekend,
      dayOfWeekBn: BN_WEEKDAYS[dayOfWeek].shortBn,
      events: matchingEvents,
      primaryCategory,
      hasHoliday,
      hasExam,
      hasMeeting,
    });
  }

  // Calculate statistics for current month
  const currentMonthCells = cells.filter((c) => c.isCurrentMonth);
  const eventsInMonthSet = new Set<string>();
  let holidaysCountInMonth = 0;
  let examsCountInMonth = 0;
  let meetingsCountInMonth = 0;

  for (const c of currentMonthCells) {
    for (const ev of c.events) {
      if (!eventsInMonthSet.has(ev.id)) {
        eventsInMonthSet.add(ev.id);
        if (ev.category === 'holiday') holidaysCountInMonth++;
        else if (ev.category === 'exam') examsCountInMonth++;
        else if (ev.category === 'meeting') meetingsCountInMonth++;
      }
    }
  }

  return {
    cells,
    monthNameBn: BN_MONTH_NAMES[month],
    monthNameEn: EN_MONTH_NAMES[month],
    yearBn: toBengaliDigits(year),
    totalEventsInMonth: eventsInMonthSet.size,
    holidaysCountInMonth,
    examsCountInMonth,
    meetingsCountInMonth,
  };
}

/**
 * Returns color tokens and visual styles for a given calendar category.
 */
export function getCalendarCategoryMeta(category: AcademicEventCategory) {
  switch (category) {
    case 'holiday':
      return {
        labelBn: 'স্কুল ছুটি',
        labelEn: 'Holiday',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        cellBg: 'bg-rose-50/90 hover:bg-rose-100 text-rose-950 border-rose-200',
        dotColor: 'bg-rose-500',
        accentBar: 'bg-rose-500',
        iconEmoji: '🏖️',
        descriptionText: 'সরকারি ও প্রাতিষ্ঠানিক ছুটির দিন',
      };
    case 'exam':
      return {
        labelBn: 'পরীক্ষা ও মূল্যায়ন',
        labelEn: 'Exam & Assessment',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        cellBg: 'bg-indigo-50/90 hover:bg-indigo-100 text-indigo-950 border-indigo-200',
        dotColor: 'bg-indigo-600',
        accentBar: 'bg-indigo-600',
        iconEmoji: '📝',
        descriptionText: 'শিখন মূল্যায়ন ও মৌখিক পরীক্ষা',
      };
    case 'meeting':
      return {
        labelBn: 'অভিভাবক সমাবেশ',
        labelEn: 'Parent Meeting (PTM)',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        cellBg: 'bg-emerald-50/90 hover:bg-emerald-100 text-emerald-950 border-emerald-200',
        dotColor: 'bg-emerald-600',
        accentBar: 'bg-emerald-600',
        iconEmoji: '👨‍👩‍👧‍👦',
        descriptionText: 'শিক্ষক-অভিভাবক মতবিনিময় সভা',
      };
    case 'cultural':
      return {
        labelBn: 'সাংস্কৃতিক ও মেলা',
        labelEn: 'Cultural & Funfair',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        cellBg: 'bg-purple-50/90 hover:bg-purple-100 text-purple-950 border-purple-200',
        dotColor: 'bg-purple-600',
        accentBar: 'bg-purple-600',
        iconEmoji: '🎨',
        descriptionText: 'আর্ট, বিজ্ঞান উৎসব ও সাংস্কৃতিক অনুষ্ঠান',
      };
    case 'sports':
      return {
        labelBn: 'খেলাধুলা ও শরীরচর্চা',
        labelEn: 'Sports & Athletics',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
        cellBg: 'bg-teal-50/90 hover:bg-teal-100 text-teal-950 border-teal-200',
        dotColor: 'bg-teal-600',
        accentBar: 'bg-teal-600',
        iconEmoji: '⚽',
        descriptionText: 'বার্ষিক ক্রীড়া ও আনন্দ খেলা',
      };
    case 'event':
    default:
      return {
        labelBn: 'বিশেষ একাডেমি ইভেন্ট',
        labelEn: 'Special School Event',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        cellBg: 'bg-amber-50/90 hover:bg-amber-100 text-amber-950 border-amber-200',
        dotColor: 'bg-amber-500',
        accentBar: 'bg-amber-500',
        iconEmoji: '⭐',
        descriptionText: 'বিশেষ দিবস ও প্রাতিষ্ঠানিক কর্মসূচি',
      };
  }
}

/**
 * Converts ISO "YYYY-MM-DD" to standard Bengali date string (e.g. "১৫ নভেম্বর ২০২৬")
 */
export function formatDateToBengali(isoDateStr: string): string {
  if (!isoDateStr) return '';
  const parsed = parseDateString(isoDateStr);
  if (!parsed) return isoDateStr;
  const dayBn = toBengaliDigits(parsed.day.toString().padStart(2, '0'));
  const monthBn = BN_MONTH_NAMES[parsed.month] || '';
  const yearBn = toBengaliDigits(parsed.year);
  return `${dayBn} ${monthBn} ${yearBn}`;
}

/**
 * Converts Bengali date string or ISO string to standard ISO "YYYY-MM-DD" for form inputs
 */
export function formatBengaliToIso(dateStr?: string): string {
  if (!dateStr) return '';
  const parsed = parseDateString(dateStr);
  if (!parsed) return '';
  const monthNum = String(parsed.month + 1).padStart(2, '0');
  const dayNum = String(parsed.day).padStart(2, '0');
  return `${parsed.year}-${monthNum}-${dayNum}`;
}

/**
 * Calculates human-readable duration in Bengali (e.g. "১ দিন", "৫ দিনব্যাপী")
 */
export function calculateDaysCountBn(startDateStr: string, endDateStr?: string): string {
  if (!endDateStr || !endDateStr.trim() || startDateStr === endDateStr) {
    return '১ দিন';
  }
  const s = parseDateString(startDateStr);
  const e = parseDateString(endDateStr);
  if (!s || !e) return '১ দিন';
  const start = new Date(s.year, s.month, s.day);
  const end = new Date(e.year, e.month, e.day);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return `${toBengaliDigits(diffDays)} দিনব্যাপী`;
}

/**
 * Generates a direct Google Calendar add event URL
 */
export function createGoogleCalendarUrl(event: AcademicCalendarEvent): string {
  const title = encodeURIComponent(`${event.titleBn} - আনন্দ পাঠশালা`);
  const details = encodeURIComponent(
    `${event.descriptionBn}\n\nধরন: ${event.category}\nশ্রেণি: ${event.targetClassesBn}\nসময়: ${event.timeBn || 'নির্ধারিত সময়ে'}\nস্থান: ${event.venueBn}`
  );
  const location = encodeURIComponent(event.venueBn || 'আনন্দ পাঠশালা, কুষ্টিয়া');

  const start = parseDateString(event.startDate);
  if (!start) return '#';

  const startIso = `${start.year}${String(start.month + 1).padStart(2, '0')}${String(start.day).padStart(2, '0')}`;
  let endIso = startIso;

  if (event.endDate) {
    const end = parseDateString(event.endDate);
    if (end) {
      const nextDay = new Date(end.year, end.month, end.day + 1);
      endIso = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, '0')}${String(nextDay.getDate()).padStart(2, '0')}`;
    }
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}
