import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toBengaliDigits,
  fromBengaliDigits,
  parseDateString,
  isDateInEventRange,
  generateMonthCalendarGrid,
  getCalendarCategoryMeta,
} from './calendarLogic';
import { AcademicCalendarEvent } from '../types/school';

test('Bengali digit conversion works both directions', () => {
  assert.equal(toBengaliDigits(2026), '২০২৬');
  assert.equal(toBengaliDigits('15'), '১৫');
  assert.equal(fromBengaliDigits('২০২৬'), '2026');
  assert.equal(fromBengaliDigits('১৫ নভেম্বর ২০২৬'), '15 নভেম্বর 2026');
});

test('parseDateString handles Bengali textual dates', () => {
  const result1 = parseDateString('১৫ নভেম্বর ২০২৬');
  assert.notEqual(result1, null);
  assert.equal(result1?.year, 2026);
  assert.equal(result1?.month, 10); // November is index 10 (0-indexed)
  assert.equal(result1?.day, 15);

  const result2 = parseDateString('১৪ ডিসেম্বর ২০২৬');
  assert.notEqual(result2, null);
  assert.equal(result2?.year, 2026);
  assert.equal(result2?.month, 11); // December is index 11
  assert.equal(result2?.day, 14);

  const result3 = parseDateString('2026-11-28');
  assert.notEqual(result3, null);
  assert.equal(result3?.year, 2026);
  assert.equal(result3?.month, 10);
  assert.equal(result3?.day, 28);
});

test('isDateInEventRange detects single and multi-day events', () => {
  const multiDayExam: AcademicCalendarEvent = {
    id: 'exam-1',
    titleBn: 'বার্ষিক শিখন মূল্যায়ন',
    titleEn: 'Annual Exam',
    category: 'exam',
    startDate: '১৫ নভেম্বর ২০২৬',
    endDate: '১৯ নভেম্বর ২০২৬',
    targetClassesBn: 'সকল শ্রেণি',
    venueBn: 'ক্যাম্পাস',
    descriptionBn: 'পরীক্ষা',
    statusBadgeBn: 'আসন্ন',
    isUpcoming: true,
  };

  // 14 Nov - Before range
  assert.equal(isDateInEventRange(new Date(2026, 10, 14), multiDayExam), false);
  // 15 Nov - First day
  assert.equal(isDateInEventRange(new Date(2026, 10, 15), multiDayExam), true);
  // 17 Nov - Middle day
  assert.equal(isDateInEventRange(new Date(2026, 10, 17), multiDayExam), true);
  // 19 Nov - Last day
  assert.equal(isDateInEventRange(new Date(2026, 10, 19), multiDayExam), true);
  // 20 Nov - After range
  assert.equal(isDateInEventRange(new Date(2026, 10, 20), multiDayExam), false);
});

test('generateMonthCalendarGrid creates accurate grid with weekend and event markers', () => {
  const sampleEvents: AcademicCalendarEvent[] = [
    {
      id: 'holiday-1',
      titleBn: 'শহীদ বুদ্ধিজীবী দিবস ও মহান বিজয় দিবস',
      titleEn: 'Victory Day Holidays',
      category: 'holiday',
      startDate: '১৪ ডিসেম্বর ২০২৬',
      endDate: '১৬ ডিসেম্বর ২০২৬',
      targetClassesBn: 'সকল শ্রেণি',
      venueBn: 'ক্যাম্পাস',
      descriptionBn: 'ছুটি',
      statusBadgeBn: 'সরকারি ছুটি',
      isUpcoming: true,
    },
    {
      id: 'ptm-1',
      titleBn: 'অভিভাবক সমাবেশ',
      titleEn: 'PTM',
      category: 'meeting',
      startDate: '২৮ নভেম্বর ২০২৬',
      targetClassesBn: 'সকল অভিভাবক',
      venueBn: 'অডিটোরিয়াম',
      descriptionBn: 'মিটিং',
      statusBadgeBn: 'বাধ্যতামূলক',
      isUpcoming: true,
    },
  ];

  // November 2026 (year 2026, month 10)
  const novGrid = generateMonthCalendarGrid(2026, 10, sampleEvents, new Date(2026, 10, 1));
  assert.equal(novGrid.monthNameBn, 'নভেম্বর');
  assert.equal(novGrid.monthNameEn, 'November');
  assert.equal(novGrid.yearBn, '২০২৬');
  assert.equal(novGrid.meetingsCountInMonth, 1);
  assert.equal(novGrid.totalEventsInMonth, 1);

  // November 28 should have the PTM event
  const nov28Cell = novGrid.cells.find((c) => c.isCurrentMonth && c.dayNumber === 28);
  assert.notEqual(nov28Cell, undefined);
  assert.equal(nov28Cell?.hasMeeting, true);
  assert.equal(nov28Cell?.primaryCategory, 'meeting');
  assert.equal(nov28Cell?.events.length, 1);

  // November 1, 2026 should be marked today
  const nov1Cell = novGrid.cells.find((c) => c.isCurrentMonth && c.dayNumber === 1);
  assert.notEqual(nov1Cell, undefined);
  assert.equal(nov1Cell?.isToday, true);

  // Grid length must be multiple of 7
  assert.equal(novGrid.cells.length % 7, 0);
});

test('getCalendarCategoryMeta returns correct theme and styling', () => {
  const holidayMeta = getCalendarCategoryMeta('holiday');
  assert.equal(holidayMeta.labelBn, 'স্কুল ছুটি');
  assert.match(holidayMeta.badgeColor, /rose/);

  const examMeta = getCalendarCategoryMeta('exam');
  assert.equal(examMeta.labelBn, 'পরীক্ষা ও মূল্যায়ন');
  assert.match(examMeta.badgeColor, /indigo/);

  const meetingMeta = getCalendarCategoryMeta('meeting');
  assert.equal(meetingMeta.labelBn, 'অভিভাবক সমাবেশ');
  assert.match(meetingMeta.badgeColor, /emerald/);
});
