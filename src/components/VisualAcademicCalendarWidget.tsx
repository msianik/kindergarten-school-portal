import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  AcademicCalendarEvent,
  AcademicEventCategory,
  UserRole,
} from '../types/school';
import {
  generateMonthCalendarGrid,
  getCalendarCategoryMeta,
  toBengaliDigits,
  BN_WEEKDAYS,
  BN_MONTH_NAMES,
  EN_MONTH_NAMES,
  CalendarDayCell,
} from '../utils/calendarLogic';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Coffee,
  GraduationCap,
  Users,
  Clock,
  MapPin,
  ExternalLink,
  Plus,
  Sparkles,
  Info,
  CalendarDays,
  CheckCircle2,
  Bell,
  X,
  Layers,
  FileText,
  Printer,
  Download,
} from 'lucide-react';

interface VisualAcademicCalendarWidgetProps {
  events: AcademicCalendarEvent[];
  currentRole: UserRole;
  onOpenAddEvent?: () => void;
  onSelectEventDetail?: (event: AcademicCalendarEvent) => void;
  onPrint?: () => void;
  onDownloadPdf?: () => void;
  createGoogleCalendarLink?: (event: AcademicCalendarEvent) => string;
}

export const VisualAcademicCalendarWidget: React.FC<VisualAcademicCalendarWidgetProps> = ({
  events,
  currentRole,
  onOpenAddEvent,
  onSelectEventDetail,
  onPrint,
  onDownloadPdf,
  createGoogleCalendarLink,
}) => {
  // Current calendar view state: default to November 2026 (index 10)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // November is index 10 (0-indexed)
  const [selectedCell, setSelectedCell] = useState<CalendarDayCell | null>(null);

  // Tooltip hover state
  const [hoveredCell, setHoveredCell] = useState<CalendarDayCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active view toggle: 'grid' (visual month calendar) vs 'agenda' (month event cards list)
  const [activeWidgetView, setActiveWidgetView] = useState<'grid' | 'agenda'>('grid');

  // Filter state inside the visual widget
  const [categoryFilter, setCategoryFilter] = useState<'all' | AcademicEventCategory>('all');

  // Today reference (1 November 2026)
  const todayRef = useMemo(() => new Date(2026, 10, 1), []);

  // Filter events if category is selected
  const displayEvents = useMemo(() => {
    if (categoryFilter === 'all') return events;
    return events.filter((e) => e.category === categoryFilter);
  }, [events, categoryFilter]);

  // Generate month grid
  const monthData = useMemo(() => {
    return generateMonthCalendarGrid(currentYear, currentMonth, displayEvents, todayRef);
  }, [currentYear, currentMonth, displayEvents, todayRef]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedCell(null);
    setHoveredCell(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedCell(null);
    setHoveredCell(null);
  };

  const handleGoToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(10);
    // Auto-select today
    const novGrid = generateMonthCalendarGrid(2026, 10, displayEvents, todayRef);
    const todayCell = novGrid.cells.find((c) => c.isToday && c.isCurrentMonth);
    if (todayCell) setSelectedCell(todayCell);
  };

  // Month jumper options (Covering 2026-2027 Academic Year)
  const academicMonthOptions = [
    { year: 2026, month: 7, labelBn: 'আগস্ট ২০২৬ (August 2026)' },
    { year: 2026, month: 8, labelBn: 'সেপ্টেম্বর ২০২৬ (September 2026)' },
    { year: 2026, month: 9, labelBn: 'অক্টোবর ২০২৬ (October 2026)' },
    { year: 2026, month: 10, labelBn: 'নভেম্বর ২০২৬ (November 2026) · চলতি মাস' },
    { year: 2026, month: 11, labelBn: 'ডিসেম্বর ২০২৬ (December 2026)' },
    { year: 2027, month: 0, labelBn: 'জানুয়ারি ২০২৭ (January 2027)' },
    { year: 2027, month: 1, labelBn: 'ফেব্রুয়ারি ২০২৭ (February 2027)' },
    { year: 2027, month: 2, labelBn: 'মার্চ ২০২৭ (March 2027)' },
    { year: 2027, month: 3, labelBn: 'এপ্রিল ২০২৭ (April 2027)' },
  ];

  // Tooltip mouse enter / leave
  const handleCellMouseEnter = (cell: CalendarDayCell, e: React.MouseEvent<HTMLButtonElement>) => {
    if (cell.events.length === 0) {
      setHoveredCell(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0, width: 800 };

    // Calculate position relative to container
    let x = rect.left - containerRect.left + rect.width / 2;
    let y = rect.top - containerRect.top;

    // Bounds checking to prevent overflowing right or left
    if (x < 140) x = 140;
    if (x > containerRect.width - 140) x = containerRect.width - 140;

    setTooltipPos({ x, y });
    setHoveredCell(cell);
  };

  const handleCellMouseLeave = () => {
    setHoveredCell(null);
  };

  // Default select today on mount
  useEffect(() => {
    const todayCell = monthData.cells.find((c) => c.isToday && c.isCurrentMonth);
    if (todayCell && !selectedCell) {
      setSelectedCell(todayCell);
    }
  }, [monthData]);

  // Get all unique events occurring in this displayed month
  const currentMonthEvents = useMemo(() => {
    const eventMap = new Map<string, AcademicCalendarEvent>();
    for (const cell of monthData.cells) {
      if (cell.isCurrentMonth) {
        for (const ev of cell.events) {
          eventMap.set(ev.id, ev);
        }
      }
    }
    return Array.from(eventMap.values());
  }, [monthData]);

  const canManageEvents = ['principal', 'teacher', 'super_admin'].includes(currentRole);

  return (
    <div
      ref={containerRef}
      className="relative bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all print:border-none print:shadow-none"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER WITH MONTH CONTROLS, VIEW TOGGLE & ACTIONS                  */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Title & Session Info */}
        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>ভিজ্যুয়াল একাডেমিক ক্যালেন্ডার</span>
            </span>
            <span className="text-[11px] font-semibold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
              সেশন ২০২৬-২০২৭
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>
                {monthData.monthNameBn} {monthData.yearBn}
              </span>
            </h3>
            <span className="text-xs font-semibold text-emerald-300/80">
              ({monthData.monthNameEn} {currentYear})
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            স্কুল ছুটি, পরীক্ষা ও অভিভাবক সমাবেশের ইন্টারঅ্যাক্টিভ মাসভিত্তিক ক্যালেন্ডার ভিউ। যেকোনো দিনের উপর মাউস রেখে বা ক্লিক করে বিস্তারিত তথ্য দেখুন।
          </p>
        </div>

        {/* Right: Month Controls & Jump Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Jump Selector */}
          <select
            value={`${currentYear}-${currentMonth}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-').map(Number);
              setCurrentYear(y);
              setCurrentMonth(m);
              setSelectedCell(null);
            }}
            className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            title="অন্যান্য মাসে যান"
          >
            {academicMonthOptions.map((opt) => (
              <option
                key={`${opt.year}-${opt.month}`}
                value={`${opt.year}-${opt.month}`}
                className="bg-slate-900 text-white"
              >
                {opt.labelBn}
              </option>
            ))}
          </select>

          {/* Prev Month Button */}
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="পূর্ববর্তী মাস"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/15 transition cursor-pointer"
            title="পূর্ববর্তী মাস"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Today Button */}
          <button
            type="button"
            onClick={handleGoToToday}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            title="চলতি মাস (নভেম্বর ২০২৬)-এ ফিরে যান"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>আজকের মাস</span>
          </button>

          {/* Next Month Button */}
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="পরবর্তী মাস"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/15 transition cursor-pointer"
            title="পরবর্তী মাস"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Add Event Button if Authorized */}
          {canManageEvents && onOpenAddEvent && (
            <button
              type="button"
              onClick={onOpenAddEvent}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 ml-1"
              title="নতুন একাডেমিক ইভেন্ট যোগ করুন"
            >
              <Plus className="w-4 h-4" />
              <span>ইভেন্ট যোগ</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUMMARY METRICS & CATEGORY FILTER STRIP                                */}
      {/* ========================================================================= */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        {/* Metric Badges for the displayed Month */}
        <div className="flex items-center flex-wrap gap-2 text-slate-700">
          <span className="font-semibold text-slate-500 text-[11px] mr-1">
            {monthData.monthNameBn} মাসের পরিসংখ্যান:
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-medium shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>মোট ইভেন্ট: <strong>{monthData.totalEventsInMonth}</strong> টি</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 font-medium shadow-2xs">
            <Coffee className="w-3.5 h-3.5 text-rose-600" />
            <span>স্কুল ছুটি: <strong>{monthData.holidaysCountInMonth}</strong> টি</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>পরীক্ষা: <strong>{monthData.examsCountInMonth}</strong> টি</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium shadow-2xs">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>সমাবেশ: <strong>{monthData.meetingsCountInMonth}</strong> টি</span>
          </span>
        </div>

        {/* Category Filters + View Switcher */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Category Filter Pills */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সকল
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('holiday')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                categoryFilter === 'holiday'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <Coffee className="w-3 h-3" />
              <span>ছুটি</span>
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('exam')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                categoryFilter === 'exam'
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>পরীক্ষা</span>
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('meeting')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                categoryFilter === 'meeting'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>সমাবেশ</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveWidgetView('grid')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeWidgetView === 'grid'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="ক্যালেন্ডার গ্রিড ভিউ"
            >
              <CalendarIcon className="w-3 h-3" />
              <span>গ্রিড</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveWidgetView('agenda')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeWidgetView === 'agenda'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="এজেন্ডা তালিকা ভিউ"
            >
              <FileText className="w-3 h-3" />
              <span>এজেন্ডা</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. VISUAL MONTH CALENDAR GRID (7 COLUMNS)                                 */}
      {/* ========================================================================= */}
      {activeWidgetView === 'grid' ? (
        <div className="p-4 sm:p-6 space-y-4">
          {/* Weekday Header Columns */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {BN_WEEKDAYS.map((wd, idx) => (
              <div
                key={wd.shortBn}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                  wd.isWeekend
                    ? 'bg-amber-50/80 text-amber-900 border-amber-200/70'
                    : 'bg-slate-100/70 text-slate-700 border-slate-200/60'
                }`}
              >
                <div className="leading-tight">{wd.shortBn}</div>
                <div className="text-[10px] font-medium opacity-70 leading-none mt-0.5">
                  {wd.shortEn} {wd.isWeekend && '🏖️'}
                </div>
              </div>
            ))}
          </div>

          {/* 35/42 Days Calendar Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {monthData.cells.map((cell, idx) => {
              const hasEvents = cell.events.length > 0;
              const isSelected = selectedCell?.dateKey === cell.dateKey;
              const categoryMeta = cell.primaryCategory ? getCalendarCategoryMeta(cell.primaryCategory) : null;

              // Cell Color determination based on event category or weekend
              let cellClasses = 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400';

              if (!cell.isCurrentMonth) {
                cellClasses = 'bg-slate-50/50 text-slate-400 border-slate-100 opacity-60';
              } else if (cell.hasHoliday) {
                cellClasses = 'bg-rose-50/90 text-rose-950 border-rose-300 ring-1 ring-rose-200 hover:bg-rose-100';
              } else if (cell.hasExam) {
                cellClasses = 'bg-indigo-50/90 text-indigo-950 border-indigo-300 ring-1 ring-indigo-200 hover:bg-indigo-100';
              } else if (cell.hasMeeting) {
                cellClasses = 'bg-emerald-50/90 text-emerald-950 border-emerald-300 ring-1 ring-emerald-200 hover:bg-emerald-100';
              } else if (cell.isWeekend) {
                cellClasses = 'bg-amber-50/30 text-amber-950 border-amber-200/50 hover:bg-amber-50/70';
              }

              // Selected cell highlight
              if (isSelected) {
                cellClasses += ' ring-2 ring-slate-900 shadow-md scale-[1.02] z-10';
              }

              return (
                <button
                  key={`${cell.dateKey}-${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedCell(cell);
                  }}
                  onMouseEnter={(e) => handleCellMouseEnter(cell, e)}
                  onMouseLeave={handleCellMouseLeave}
                  aria-label={`${cell.dayNumberBn} ${monthData.monthNameBn}, ${cell.events.length} টি ইভেন্ট`}
                  className={`min-h-[76px] sm:min-h-[92px] p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer relative group ${cellClasses}`}
                >
                  {/* Top Row: Day Number + Weekend / Today Indicator */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-sm sm:text-base font-black ${
                        cell.isToday
                          ? 'w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs'
                          : ''
                      }`}
                    >
                      {cell.dayNumberBn}
                    </span>

                    {/* Small Status Pill: Holiday / Exam / Meeting / Weekend / Today */}
                    {cell.isCurrentMonth && (
                      <div className="flex items-center gap-1">
                        {cell.isToday && !cell.hasHoliday && (
                          <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            আজ
                          </span>
                        )}
                        {cell.hasHoliday && (
                          <span className="text-[10px]" title="স্কুল ছুটি">
                            🏖️
                          </span>
                        )}
                        {cell.hasExam && (
                          <span className="text-[10px]" title="পরীক্ষা">
                            📝
                          </span>
                        )}
                        {cell.hasMeeting && (
                          <span className="text-[10px]" title="সমাবেশ">
                            👥
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Middle / Bottom Content: Event Indicators */}
                  <div className="w-full space-y-1 mt-1">
                    {cell.isCurrentMonth && hasEvents && (
                      <div className="space-y-0.5">
                        {cell.events.slice(0, 1).map((ev) => {
                          const meta = getCalendarCategoryMeta(ev.category);
                          return (
                            <div
                              key={ev.id}
                              className={`truncate text-[9.5px] sm:text-[10.5px] font-bold px-1.5 py-0.5 rounded-md border ${meta.badgeColor} shadow-2xs`}
                              title={ev.titleBn}
                            >
                              {ev.titleBn}
                            </div>
                          );
                        })}

                        {cell.events.length > 1 && (
                          <span className="text-[9px] font-bold text-slate-500 block truncate">
                            +{toBengaliDigits(cell.events.length - 1)} টি আরও
                          </span>
                        )}
                      </div>
                    )}

                    {cell.isCurrentMonth && !hasEvents && cell.isWeekend && (
                      <span className="hidden sm:inline-block text-[9px] font-medium text-amber-700/70">
                        সাপ্তাহিক ছুটি
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* FLOATING HOVER TOOLTIP (PREVENTS CUTOFF & PROVIDES RICH EVENT DETAILS)    */}
          {/* ========================================================================= */}
          {hoveredCell && tooltipPos && (
            <div
              className="absolute z-50 pointer-events-none transition-all duration-150 animate-fade-in"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y - 12}px`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="w-72 sm:w-80 bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl border border-emerald-500/30 text-xs space-y-2 backdrop-blur-md">
                {/* Tooltip Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-emerald-300">
                      {hoveredCell.dayNumberBn} {monthData.monthNameBn} {monthData.yearBn}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    ({hoveredCell.events.length} টি কর্মসূচি)
                  </span>
                </div>

                {/* Event Items in Tooltip */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {hoveredCell.events.map((ev) => {
                    const meta = getCalendarCategoryMeta(ev.category);
                    return (
                      <div key={ev.id} className="space-y-1">
                        <div className="flex items-start gap-1.5">
                          <span className="text-xs shrink-0">{meta.iconEmoji}</span>
                          <div>
                            <p className="font-bold text-white text-[11.5px] leading-tight">
                              {ev.titleBn}
                            </p>
                            <p className="text-[9.5px] text-slate-400 font-sans">
                              {ev.titleEn}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-1 text-[10px] text-slate-300 pt-0.5">
                          <span className={`px-1.5 py-0.2 rounded font-semibold ${meta.badgeColor}`}>
                            {ev.statusBadgeBn || meta.labelBn}
                          </span>
                          {ev.timeBn && (
                            <span className="flex items-center gap-0.5 opacity-80">
                              <Clock className="w-2.5 h-2.5" />
                              {ev.timeBn}
                            </span>
                          )}
                        </div>

                        {ev.targetClassesBn && (
                          <p className="text-[10px] text-emerald-200/90 leading-tight">
                            🎯 প্রযোজ্য: {ev.targetClassesBn}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-1 border-t border-slate-800 text-[9.5px] text-slate-400 text-center">
                  💡 বিস্তারিত দেখতে বা নোটিফিকেশন পেতে দিনটিতে ক্লিক করুন
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* MONTH AGENDA LIST VIEW                                                    */
        /* ========================================================================= */
        <div className="p-4 sm:p-6 space-y-3">
          {currentMonthEvents.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <CalendarDays className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                {monthData.monthNameBn} মাসে কোনো নির্ধারিত ইভেন্ট নেই
              </p>
              <p className="text-xs text-slate-500">
                অন্যান্য মাসের এজেন্ডা দেখতে উপরের মাস নির্বাচন করুন।
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {currentMonthEvents.map((ev) => {
                const meta = getCalendarCategoryMeta(ev.category);
                return (
                  <div
                    key={ev.id}
                    className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-14 sm:w-16 rounded-xl p-2 text-center shrink-0 border ${meta.badgeColor}`}
                      >
                        <span className="text-[10px] font-bold block">{meta.labelBn}</span>
                        <span className="text-base font-black leading-tight block">
                          {ev.startDate.split(' ')[0]}
                        </span>
                        <span className="text-[9px] font-medium block">
                          {ev.startDate.split(' ')[1]}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badgeColor}`}
                          >
                            {meta.iconEmoji} {ev.statusBadgeBn || meta.labelBn}
                          </span>
                          {ev.daysCountBn && (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {ev.daysCountBn}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{ev.titleBn}</h4>
                        <p className="text-xs text-slate-600 line-clamp-1">{ev.descriptionBn}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onSelectEventDetail && (
                        <button
                          type="button"
                          onClick={() => onSelectEventDetail(ev)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                        >
                          বিজ্ঞপ্তি বিস্তারিত
                        </button>
                      )}
                      {createGoogleCalendarLink && (
                        <a
                          href={createGoogleCalendarLink(ev)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
                          title="Google Calendar এ যোগ করুন"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SELECTED DAY DETAIL DRAWER (SHOWN WHEN A DAY CELL IS CLICKED)          */}
      {/* ========================================================================= */}
      {selectedCell && (
        <div className="mx-4 sm:mx-6 mb-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md space-y-3.5 animate-fade-in border border-emerald-500/30">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>
                    {selectedCell.dayNumberBn} {monthData.monthNameBn} {monthData.yearBn} ({selectedCell.dayOfWeekBn})
                  </span>
                  {selectedCell.isToday && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                      আজকের দিন
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-300">
                  {selectedCell.events.length > 0
                    ? `এই দিনে ${toBengaliDigits(selectedCell.events.length)} টি নির্ধারিত কর্মসূচি রয়েছে`
                    : selectedCell.isWeekend
                    ? 'সাপ্তাহিক ছুটির দিন (Weekend)'
                    : 'স্বাভাবিক পাঠদান ও ক্লাস দিবস (Regular Class Day)'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCell(null)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* If Events Exist for Selected Day */}
          {selectedCell.events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedCell.events.map((ev) => {
                const meta = getCalendarCategoryMeta(ev.category);
                return (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-white/10 border border-white/10 hover:border-emerald-400/50 transition space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-md ${meta.badgeColor}`}>
                        {meta.iconEmoji} {ev.statusBadgeBn || meta.labelBn}
                      </span>
                      {ev.daysCountBn && (
                        <span className="text-[10px] font-medium text-emerald-300">
                          {ev.daysCountBn}
                        </span>
                      )}
                    </div>

                    <div>
                      <h5 className="font-bold text-white text-xs sm:text-sm">{ev.titleBn}</h5>
                      <p className="text-[10px] text-slate-300">{ev.titleEn}</p>
                    </div>

                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                      {ev.descriptionBn}
                    </p>

                    <div className="space-y-1 text-[11px] text-slate-300 pt-1">
                      {ev.timeBn && (
                        <div className="flex items-center gap-1.5 text-emerald-200">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{ev.timeBn}</span>
                        </div>
                      )}
                      {ev.venueBn && (
                        <div className="flex items-center gap-1.5 opacity-90">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{ev.venueBn}</span>
                        </div>
                      )}
                      {ev.targetClassesBn && (
                        <div className="text-[10.5px] text-amber-300">
                          🎯 শ্রেণি: {ev.targetClassesBn}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                      {onSelectEventDetail && (
                        <button
                          type="button"
                          onClick={() => onSelectEventDetail(ev)}
                          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                        >
                          বিজ্ঞপ্তি বিস্তারিত দেখুন →
                        </button>
                      )}
                      {createGoogleCalendarLink && (
                        <a
                          href={createGoogleCalendarLink(ev)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto inline-flex items-center gap-1 text-[11px] text-white/80 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg"
                        >
                          <span>Google Calendar</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-3 px-4 rounded-xl bg-white/5 text-xs text-slate-300 flex items-center justify-between">
              <span>
                {selectedCell.isWeekend
                  ? '🏖️ এটি সাপ্তাহিক ছুটির দিন। ক্যাম্পাসে কোনো নিয়মিত শ্রেণি কার্যক্রম নেই।'
                  : '🏫 এই দিনে কোনো বিশেষ ছুটি বা পরীক্ষা নেই। রুটিন অনুযায়ী শ্রেণি পাঠদান পরিচালিত হবে।'}
              </span>
              {canManageEvents && onOpenAddEvent && (
                <button
                  type="button"
                  onClick={onOpenAddEvent}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                  এই তারিখে ইভেন্ট যোগ করুন +
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. COLOR-CODED LEGEND BAR & ACTION FOOTER                                */}
      {/* ========================================================================= */}
      <div className="px-5 sm:px-6 py-4 bg-slate-100/70 border-t border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        {/* Visual Color Legend */}
        <div className="flex items-center flex-wrap gap-3 text-slate-700">
          <span className="font-bold text-slate-500 text-[11px] flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            কালার কোডিং গাইড:
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-2xs" />
            <span className="font-medium text-slate-800">স্কুল ও সরকারি ছুটি</span>
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-2xs" />
            <span className="font-medium text-slate-800">পরীক্ষা ও মূল্যায়ন</span>
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-2xs" />
            <span className="font-medium text-slate-800">অভিভাবক সমাবেশ (PTM)</span>
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
            <span className="font-medium text-slate-800">সাপ্তাহিক ছুটি (শুক্র-শনি)</span>
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 ring-2 ring-emerald-300" />
            <span className="font-medium text-slate-800">আজকের দিন</span>
          </span>
        </div>

        {/* Quick Print and PDF Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto print:hidden">
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
              title="একাডেমিক ক্যালেন্ডার প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>প্রিন্ট</span>
            </button>
          )}

          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              title="PDF হিসেবে ক্যালেন্ডার সেভ বা ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5 text-emerald-200" />
              <span>Download as PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
