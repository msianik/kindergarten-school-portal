import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Eye,
  Printer,
  Download,
  Search,
  X,
  Filter,
  Coffee,
  GraduationCap,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  Bell,
  ExternalLink,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  AcademicCalendarEvent,
  AcademicEventCategory,
  UserRole,
} from '../../types/school';
import { VisualAcademicCalendarWidget } from '../VisualAcademicCalendarWidget';
import { PrintableAcademicCalendarDocument } from './PrintableAcademicCalendarDocument';

interface AcademicCalendarSectionProps {
  academicEvents: AcademicCalendarEvent[];
  currentRole: UserRole;
  onNavigateTab: (tab: string) => void;
  onOpenAddEvent: () => void;
  onOpenPrintPreview: () => void;
  onSelectEventDetail: (event: AcademicCalendarEvent) => void;
  onPrint: (scope: 'all' | 'filtered') => void;
  onDownloadPdf: (scope: 'all' | 'filtered') => void;
  createGoogleCalendarLink: (event: AcademicCalendarEvent) => string;
  logoUrl?: string;
  currentDateBn: string;
  printScope: 'all' | 'filtered';
  onToastMessage?: (msg: string) => void;
}

export const AcademicCalendarSection: React.FC<
  AcademicCalendarSectionProps
> = ({
  academicEvents,
  currentRole,
  onNavigateTab,
  onOpenAddEvent,
  onOpenPrintPreview,
  onSelectEventDetail,
  onPrint,
  onDownloadPdf,
  createGoogleCalendarLink,
  logoUrl,
  currentDateBn,
  printScope,
  onToastMessage,
}) => {
  const [selectedCalendarCategory, setSelectedCalendarCategory] = useState<
    'all' | AcademicEventCategory
  >('all');
  const [calendarSearchQuery, setCalendarSearchQuery] = useState('');
  const [remindedEventIds, setRemindedEventIds] = useState<
    Record<string, boolean>
  >({});

  const holidayCount = academicEvents.filter(
    (e) => e.category === 'holiday'
  ).length;
  const examCount = academicEvents.filter((e) => e.category === 'exam').length;
  const meetingCount = academicEvents.filter(
    (e) => e.category === 'meeting'
  ).length;

  const toggleEventReminder = (event: AcademicCalendarEvent) => {
    const isAlreadyReminded = !!remindedEventIds[event.id];
    setRemindedEventIds((prev) => ({
      ...prev,
      [event.id]: !isAlreadyReminded,
    }));
    const message = !isAlreadyReminded
      ? `"${event.titleBn}" এর জন্য রিমাইন্ডার সক্রিয় করা হয়েছে। আপনাকে সময়মতো অবহিত করা হবে।`
      : `"${event.titleBn}" এর রিমাইন্ডার বন্ধ করা হয়েছে।`;
    if (onToastMessage) {
      onToastMessage(message);
    }
  };

  const filteredAcademicEvents = academicEvents.filter((event) => {
    const matchCategory =
      selectedCalendarCategory === 'all' ||
      event.category === selectedCalendarCategory;
    if (!matchCategory) return false;

    if (!calendarSearchQuery.trim()) return true;

    const query = calendarSearchQuery.toLowerCase().trim();
    const searchableText = [
      event.titleBn,
      event.titleEn || '',
      event.startDate,
      event.endDate || '',
      event.descriptionBn,
      event.targetClassesBn,
      event.venueBn,
      event.statusBadgeBn,
      event.category === 'holiday'
        ? 'ছুটি holiday বন্ধ vacation'
        : event.category === 'exam'
        ? 'পরীক্ষা exam মূল্যায়ন assessment'
        : 'সমাবেশ meeting ptm অভিভাবক',
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(query);
  });

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 sm:p-7 space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:space-y-4">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
              <CalendarDays className="w-3.5 h-3.5 text-amber-700" />
              একাডেমিক সেশন ২০২৬-২০২৭
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              আনন্দ পাঠশালা বার্ষিক সূচি
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span>একাডেমিক ক্যালেন্ডার ও গুরুত্বপূর্ণ ইভেন্ট</span>
            <span className="text-xs font-normal text-slate-500 hidden sm:inline">
              (Academic Calendar)
            </span>
          </h3>
          <p className="text-xs text-slate-600">
            বিদ্যালয়ের আসন্ন ছুটির দিন (School Holidays), পরীক্ষার সময়সূচি (Exam Dates) ও অভিভাবক সমাবেশ (Parent Meetings) তালিকা
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 print:hidden">
          {/* Direct Link to Interactive Academic Calendar Module */}
          <button
            type="button"
            onClick={() => onNavigateTab('calendar')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            title="পূর্ণাঙ্গ একাডেমি ক্যালেন্ডার মডিউলে প্রবেশ করুন (CRUD ও গ্রিড/এজেন্ডা ভিউ)"
          >
            <CalendarDays className="w-4 h-4 text-purple-200" />
            <span>ইন্টারেক্টিভ ক্যালেন্ডার</span>
          </button>

          {/* Action to Add Event if Teacher/Admin/Principal */}
          {['principal', 'teacher', 'super_admin'].includes(currentRole) && (
            <button
              type="button"
              onClick={onOpenAddEvent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ইভেন্ট</span>
            </button>
          )}

          {/* Print Preview Button */}
          <button
            type="button"
            onClick={onOpenPrintPreview}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="প্রিন্ট প্রিভিউ ও পৃষ্ঠা লেআউট দেখুন"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span>প্রিভিউ</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={() =>
              onPrint(
                calendarSearchQuery || selectedCalendarCategory !== 'all'
                  ? 'filtered'
                  : 'all'
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="একাডেমিক ক্যালেন্ডার সরাসরি প্রিন্ট করুন"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>প্রিন্ট করুন</span>
          </button>

          {/* Download as PDF Button */}
          <button
            type="button"
            onClick={() =>
              onDownloadPdf(
                calendarSearchQuery || selectedCalendarCategory !== 'all'
                  ? 'filtered'
                  : 'all'
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer group"
            title="ব্রাউজার প্রিন্ট ডায়ালগ ব্যবহার করে ক্যালেন্ডারটি PDF ফাইল হিসেবে ডাউনলোড বা সেভ করুন"
          >
            <Download className="w-4 h-4 text-emerald-200 group-hover:translate-y-0.5 transition-transform" />
            <span>Download as PDF</span>
          </button>
        </div>
      </div>

      {/* Visual Academic Calendar Widget */}
      <div className="print:hidden">
        <VisualAcademicCalendarWidget
          events={academicEvents}
          currentRole={currentRole}
          onOpenAddEvent={onOpenAddEvent}
          onSelectEventDetail={onSelectEventDetail}
          onPrint={() =>
            onPrint(
              calendarSearchQuery || selectedCalendarCategory !== 'all'
                ? 'filtered'
                : 'all'
            )
          }
          onDownloadPdf={() =>
            onDownloadPdf(
              calendarSearchQuery || selectedCalendarCategory !== 'all'
                ? 'filtered'
                : 'all'
            )
          }
          createGoogleCalendarLink={createGoogleCalendarLink}
        />
      </div>

      {/* Section Subtitle for Detailed Notice Directory & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-5 print:hidden">
        <div className="space-y-0.5">
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-600" />
            <span>ইভেন্ট বিজ্ঞপ্তি ডিরেক্টরি ও অনুসন্ধান ফিল্টার</span>
          </h4>
          <p className="text-xs text-slate-500">
            নির্দিষ্ট কি-ওয়ার্ড, মাস বা ক্যাটাগরি অনুযায়ী সকল প্রাতিষ্ঠানিক নোটিশ বিস্তারিতভাবে সন্ধান করুন
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          সর্বমোট {academicEvents.length} টি ইভেন্ট তালিকাভুক্ত
        </span>
      </div>

      {/* Dedicated Search Bar & Filter Console */}
      <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 space-y-3.5 print:hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 shrink-0 pointer-events-none" />
            <input
              type="text"
              value={calendarSearchQuery}
              onChange={(e) => setCalendarSearchQuery(e.target.value)}
              placeholder="ছুটি, পরীক্ষা বা সমাবেশের নাম, শ্রেণি বা কি-ওয়ার্ড দিয়ে খুঁজুন... (যেমন: ঈদ, সাময়িক, PTM, নার্সারি)"
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition"
            />
            {calendarSearchQuery && (
              <button
                type="button"
                onClick={() => setCalendarSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                title="অনুসন্ধান ক্লিয়ার করুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results Counter Badge */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <span className="text-xs font-bold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs whitespace-nowrap">
              {filteredAcademicEvents.length} টি ইভেন্ট প্রদর্শিত
            </span>

            {(calendarSearchQuery || selectedCalendarCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setCalendarSearchQuery('');
                  setSelectedCalendarCategory('all');
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1 rounded-lg cursor-pointer"
              >
                রিসেট
              </button>
            )}
          </div>
        </div>

        {/* Quick Keyword Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            দ্রুত ফিল্টার:
          </span>

          {[
            { label: '🌙 ঈদ ও রমজান', query: 'ঈদ' },
            { label: '🏖️ সাধারণ ও সরকারি ছুটি', query: 'ছুটি' },
            { label: '📝 শিখন মূল্যায়ন ও পরীক্ষা', query: 'পরীক্ষা' },
            { label: '👨‍👩‍👧‍👦 PTM অভিভাবক সমাবেশ', query: 'সমাবেশ' },
            { label: '👶 প্লে ও নার্সারি', query: 'নার্সারি' },
            { label: '🎒 কেজি ও ১ম শ্রেণি', query: 'কেজি' },
          ].map((chip) => {
            const isActive = calendarSearchQuery === chip.query;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setCalendarSearchQuery(isActive ? '' : chip.query);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 border cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Category Filter Pills Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-200/80 pb-0.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCalendarCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              selectedCalendarCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            সকল তালিকা ({academicEvents.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCalendarCategory('holiday')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCalendarCategory === 'holiday'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>স্কুল ছুটির দিন ({holidayCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCalendarCategory('exam')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCalendarCategory === 'exam'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>পরীক্ষার সময়সূচি ({examCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCalendarCategory('meeting')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCalendarCategory === 'meeting'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>অভিভাবক সমাবেশ ({meetingCount})</span>
          </button>
        </div>
      </div>

      {/* Active Search & Filter Indicator Bar */}
      {calendarSearchQuery && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2 text-xs text-emerald-950 print:hidden animate-fade-in">
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              অনুসন্ধান কি-ওয়ার্ড: <strong>&ldquo;{calendarSearchQuery}&rdquo;</strong> অনুযায়ী{' '}
              <strong>{filteredAcademicEvents.length}</strong> টি ইভেন্ট পাওয়া গেছে
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCalendarSearchQuery('')}
            className="text-xs font-bold text-emerald-800 hover:underline shrink-0 cursor-pointer"
          >
            অনুসন্ধান ক্লিয়ার করুন ✕
          </button>
        </div>
      )}

      {/* List View of Events */}
      {filteredAcademicEvents.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3 print:hidden">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">
              {calendarSearchQuery
                ? `"${calendarSearchQuery}" কি-ওয়ার্ডের সাথে কোনো একাডেমিক ইভেন্ট খুঁজে পাওয়া যায়নি`
                : 'কোনো একাডেমিক ইভেন্ট খুঁজে পাওয়া যায়নি'}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              অন্য কোনো কি-ওয়ার্ড (যেমন: ছুটি, পরীক্ষা, সমাবেশ, শ্রেণি) দিয়ে সন্ধান করুন অথবা ফিল্টার রিসেট করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCalendarSearchQuery('');
              setSelectedCalendarCategory('all');
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>সকল ইভেন্ট রিসেট করুন</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden print:hidden">
          {filteredAcademicEvents.map((event) => {
            const isHoliday = event.category === 'holiday';
            const isExam = event.category === 'exam';
            const isMeeting = event.category === 'meeting';
            const isReminded = !!remindedEventIds[event.id];

            return (
              <div
                key={event.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Date Block & Category Badge */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Visual Date Badge */}
                  <div
                    className={`w-16 sm:w-20 rounded-2xl p-2.5 text-center shrink-0 border flex flex-col items-center justify-center ${
                      isHoliday
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : isExam
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                      {isHoliday ? 'ছুটি' : isExam ? 'পরীক্ষা' : 'মিটিং'}
                    </span>
                    <span className="text-lg sm:text-xl font-extrabold leading-none my-0.5">
                      {event.startDate.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-medium leading-tight">
                      {event.startDate.split(' ').slice(1, 2).join(' ')}
                    </span>
                    {event.daysCountBn && (
                      <span className="mt-1 text-[9px] px-1.5 py-0.2 bg-white/80 rounded-md font-semibold text-slate-600">
                        {event.daysCountBn}
                      </span>
                    )}
                  </div>

                  {/* Main Details */}
                  <div className="space-y-1.5 flex-1">
                    {/* Category and Status Tags */}
                    <div className="flex items-center flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isHoliday
                            ? 'bg-rose-100 text-rose-800'
                            : isExam
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isHoliday && <Coffee className="w-3 h-3" />}
                        {isExam && <GraduationCap className="w-3 h-3" />}
                        {isMeeting && <Users className="w-3 h-3" />}
                        <span>
                          {isHoliday
                            ? 'স্কুল ছুটির দিন'
                            : isExam
                            ? 'পরীক্ষার তারিখ / শিখন মূল্যায়ন'
                            : 'অভিভাবক সমাবেশ (PTM)'}
                        </span>
                      </span>

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {event.statusBadgeBn}
                      </span>

                      {isReminded && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          রিমাইন্ডার অন
                        </span>
                      )}
                    </div>

                    {/* Event Title */}
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 hover:text-emerald-700 transition">
                        {event.titleBn}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {event.titleEn}
                      </p>
                    </div>

                    {/* Meta Information Strip */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 pt-0.5">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800">
                          {event.startDate} {event.endDate ? `- ${event.endDate}` : ''}
                        </span>
                      </span>

                      {event.timeBn && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{event.timeBn}</span>
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                          {event.targetClassesBn}
                        </span>
                      </span>

                      {event.venueBn && (
                        <span className="inline-flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{event.venueBn}</span>
                        </span>
                      )}
                    </div>

                    {/* Event Description */}
                    <p className="text-xs text-slate-600 leading-relaxed pt-1 max-w-2xl">
                      {event.descriptionBn}
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                  <button
                    onClick={() => toggleEventReminder(event)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isReminded
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title="মোবাইলে অ্যালার্ট সেট করুন"
                  >
                    <Bell
                      className={`w-3.5 h-3.5 ${
                        isReminded ? 'fill-emerald-700' : ''
                      }`}
                    />
                    <span>{isReminded ? 'রিমাইন্ডার সেট' : 'রিমাইন্ডার'}</span>
                  </button>

                  <a
                    href={createGoogleCalendarLink(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
                    title="Google Calendar এ ইভেন্টটি যুক্ত করুন"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Google Calendar</span>
                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                  </a>

                  <button
                    onClick={() => onSelectEventDetail(event)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                  >
                    বিজ্ঞপ্তি বিস্তারিত
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notice Footer Note */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 print:hidden">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>বিশেষ দ্রষ্টব্য:</strong> সরকারি প্রজ্ঞাপন বা বিশেষ পরিস্থিতির কারণে কোনো ছুটির পরিবর্তন হলে তাৎক্ষণিক অ্যাপে এসএমএস ও নোটিফিকেশনের মাধ্যমে অবহিত করা হবে।
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              onDownloadPdf(
                calendarSearchQuery || selectedCalendarCategory !== 'all'
                  ? 'filtered'
                  : 'all'
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
            title="একাডেমিক ক্যালেন্ডার PDF ফাইল ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download as PDF</span>
          </button>
          <button
            onClick={() => onNavigateTab('diary')}
            className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>দৈনিক ক্লাসরুম ডায়েরি দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* OFFICIAL PRINT-READY ACADEMIC CALENDAR DOCUMENT */}
      <div className="hidden print:block w-full">
        <PrintableAcademicCalendarDocument
          eventsToRender={
            printScope === 'filtered' ? filteredAcademicEvents : academicEvents
          }
          logoUrl={logoUrl}
          isPreview={false}
          holidayCount={holidayCount}
          examCount={examCount}
          meetingCount={meetingCount}
          currentDateBn={currentDateBn}
        />
      </div>
    </section>
  );
};
