import React, { useState, useMemo, useEffect } from 'react';
import {
  AcademicCalendarEvent,
  AcademicEventCategory,
  UserRole,
  PortalAccount,
} from '../types/school';
import {
  generateMonthCalendarGrid,
  getCalendarCategoryMeta,
  toBengaliDigits,
  BN_WEEKDAYS,
  BN_MONTH_NAMES,
  EN_MONTH_NAMES,
  CalendarDayCell,
  formatDateToBengali,
  formatBengaliToIso,
  calculateDaysCountBn,
  createGoogleCalendarUrl,
  parseDateString,
} from '../utils/calendarLogic';
import { useAcademicEvents } from '../utils/calendarStorage';
import { getPermissionForDirector } from '../utils/schoolLogic';
import {
  CalendarDays,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Download,
  Printer,
  Sparkles,
  ExternalLink,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  GraduationCap,
  Coffee,
  RotateCcw,
  Check,
  CalendarCheck,
  Tag,
  Eye,
  Info,
} from 'lucide-react';

interface AcademicCalendarModuleProps {
  currentRole: UserRole;
  loggedInAccount?: PortalAccount | null;
  onNavigateTab?: (tab: string) => void;
  onSendBroadcastNotification?: (title: string, body: string, category: string) => void;
}

export const AcademicCalendarModule: React.FC<AcademicCalendarModuleProps> = ({
  currentRole,
  loggedInAccount,
  onNavigateTab,
  onSendBroadcastNotification,
}) => {
  const { events, addEvent, editEvent, removeEvent, resetAll } = useAcademicEvents();

  // Role permissions: Viewing is open to all, editing requires admin or director with notice/event permission
  const dirPerm =
    currentRole === 'director' ? getPermissionForDirector(loggedInAccount?.directorId) : null;
  const isAdmin =
    currentRole === 'super_admin' ||
    currentRole === 'principal' ||
    Boolean(currentRole === 'director' && dirPerm?.canManageNoticesAndEvents);

  // View state: 'grid' (visual month) | 'agenda' (timeline cards) | 'list' (compact table)
  const [activeView, setActiveView] = useState<'grid' | 'agenda' | 'list'>('grid');

  // Month navigation state: default to current date or November 2026
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // November is 10 (0-indexed)

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | AcademicEventCategory>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicCalendarEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [inspectedCell, setInspectedCell] = useState<CalendarDayCell | null>(null);
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<AcademicCalendarEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for Create / Edit
  const [formTitleBn, setFormTitleBn] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formCategory, setFormCategory] = useState<AcademicEventCategory>('exam');
  const [formStartDateIso, setFormStartDateIso] = useState('2026-11-15');
  const [formEndDateIso, setFormEndDateIso] = useState('');
  const [formTimeBn, setFormTimeBn] = useState('সকাল ০৯:৩০ - দুপুর ১২:০০');
  const [formVenueBn, setFormVenueBn] = useState('আনন্দ পাঠশালা ক্যাম্পাস');
  const [formTargetClasses, setFormTargetClasses] = useState<string[]>([
    'প্লে',
    'নার্সারি',
    'কেজি',
    '১ম শ্রেণি',
  ]);
  const [formDescriptionBn, setFormDescriptionBn] = useState('');
  const [formStatusBadgeBn, setFormStatusBadgeBn] = useState('আসন্ন');
  const [formPriority, setFormPriority] = useState<'normal' | 'high' | 'urgent'>('high');
  const [formNotifyBroadcast, setFormNotifyBroadcast] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const ALL_CLASSES = [
    'সকল শ্রেণি',
    'হাতেখড়ি',
    'প্লে',
    'নার্সারি',
    'কেজি',
    '১ম শ্রেণি',
    '২য় শ্রেণি',
  ];

  // Helper Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setInspectedCell(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setInspectedCell(null);
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentYear(2026);
    setCurrentMonth(10); // November 2026
    setInspectedCell(null);
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Category filter
      if (selectedCategory !== 'all' && ev.category !== selectedCategory) {
        return false;
      }

      // Class filter
      if (selectedClassFilter !== 'all') {
        const matchesClass =
          ev.targetClassesBn.includes('সকল') ||
          ev.targetClassesBn.includes(selectedClassFilter);
        if (!matchesClass) return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inBn = ev.titleBn?.toLowerCase().includes(q);
        const inEn = ev.titleEn?.toLowerCase().includes(q);
        const inDesc = ev.descriptionBn?.toLowerCase().includes(q);
        const inVenue = ev.venueBn?.toLowerCase().includes(q);
        const inClass = ev.targetClassesBn?.toLowerCase().includes(q);
        if (!inBn && !inEn && !inDesc && !inVenue && !inClass) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedCategory, selectedClassFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = events.length;
    const holidays = events.filter((e) => e.category === 'holiday').length;
    const exams = events.filter((e) => e.category === 'exam').length;
    const meetings = events.filter((e) => e.category === 'meeting').length;
    const culturalAndSports = events.filter(
      (e) => e.category === 'cultural' || e.category === 'sports' || e.category === 'event'
    ).length;
    return { total, holidays, exams, meetings, culturalAndSports };
  }, [events]);

  // Month Calendar Grid Data
  const monthData = useMemo(() => {
    const todayRef = new Date(2026, 10, 1);
    return generateMonthCalendarGrid(currentYear, currentMonth, filteredEvents, todayRef);
  }, [currentYear, currentMonth, filteredEvents]);

  // Reset Form
  const resetForm = () => {
    setFormTitleBn('');
    setFormTitleEn('');
    setFormCategory('exam');
    setFormStartDateIso('2026-11-15');
    setFormEndDateIso('');
    setFormTimeBn('সকাল ০৯:৩০ - দুপুর ১২:০০');
    setFormVenueBn('আনন্দ পাঠশালা ক্যাম্পাস');
    setFormTargetClasses(['প্লে', 'নার্সারি', 'কেজি', '১ম শ্রেণি']);
    setFormDescriptionBn('');
    setFormStatusBadgeBn('আসন্ন');
    setFormPriority('high');
    setFormNotifyBroadcast(true);
    setFormError(null);
    setEditingEvent(null);
  };

  // Open Create Modal
  const handleOpenCreateModal = (defaultDateIso?: string) => {
    resetForm();
    if (defaultDateIso) {
      setFormStartDateIso(defaultDateIso);
    }
    setShowEventModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (event: AcademicCalendarEvent) => {
    setEditingEvent(event);
    setFormTitleBn(event.titleBn);
    setFormTitleEn(event.titleEn || '');
    setFormCategory(event.category);
    setFormStartDateIso(formatBengaliToIso(event.startDate) || '2026-11-15');
    setFormEndDateIso(formatBengaliToIso(event.endDate) || '');
    setFormTimeBn(event.timeBn || '');
    setFormVenueBn(event.venueBn || 'আনন্দ পাঠশালা ক্যাম্পাস');
    setFormDescriptionBn(event.descriptionBn || '');
    setFormStatusBadgeBn(event.statusBadgeBn || 'আসন্ন');
    setFormPriority(event.priority || 'normal');
    setFormNotifyBroadcast(false);

    // Parse classes
    const classes = ALL_CLASSES.filter((c) => event.targetClassesBn.includes(c));
    setFormTargetClasses(classes.length > 0 ? classes : ['সকল শ্রেণি']);

    setFormError(null);
    setShowEventModal(true);
    setInspectedCell(null);
    setSelectedDetailEvent(null);
  };

  // Toggle Class selection
  const handleToggleClass = (className: string) => {
    if (className === 'সকল শ্রেণি') {
      setFormTargetClasses(['সকল শ্রেণি']);
      return;
    }
    const filtered = formTargetClasses.filter((c) => c !== 'সকল শ্রেণি');
    if (filtered.includes(className)) {
      const next = filtered.filter((c) => c !== className);
      setFormTargetClasses(next.length === 0 ? ['সকল শ্রেণি'] : next);
    } else {
      setFormTargetClasses([...filtered, className]);
    }
  };

  // Save Event (Create / Update)
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitleBn.trim()) {
      setFormError('অনুগ্রহ করে ইভেন্টের শিরোনাম (বাংলায়) প্রদান করুন।');
      return;
    }
    if (!formStartDateIso) {
      setFormError('অনুগ্রহ করে ইভেন্টের শুরুর তারিখ নির্বাচন করুন।');
      return;
    }

    const startDateBn = formatDateToBengali(formStartDateIso);
    const endDateBn = formEndDateIso ? formatDateToBengali(formEndDateIso) : undefined;
    const daysCountBn = calculateDaysCountBn(startDateBn, endDateBn);
    const targetClassesBn =
      formTargetClasses.length === 0 ? 'সকল শ্রেণি' : formTargetClasses.join(', ');

    if (editingEvent) {
      // Update
      const updated: AcademicCalendarEvent = {
        ...editingEvent,
        titleBn: formTitleBn.trim(),
        titleEn: formTitleEn.trim() || formTitleBn.trim(),
        category: formCategory,
        startDate: startDateBn,
        endDate: endDateBn,
        daysCountBn,
        timeBn: formTimeBn.trim() || 'সারাদিন',
        venueBn: formVenueBn.trim() || 'আনন্দ পাঠশালা ক্যাম্পাস',
        targetClassesBn,
        descriptionBn: formDescriptionBn.trim(),
        statusBadgeBn: formStatusBadgeBn.trim() || 'আসন্ন',
        priority: formPriority,
        isUpcoming: true,
      };

      editEvent(updated);
      showToast(`✓ ইভেন্ট "${updated.titleBn}" সফলভাবে আপডেট করা হয়েছে!`);
    } else {
      // Create
      const newEventData: Omit<AcademicCalendarEvent, 'id'> = {
        titleBn: formTitleBn.trim(),
        titleEn: formTitleEn.trim() || formTitleBn.trim(),
        category: formCategory,
        startDate: startDateBn,
        endDate: endDateBn,
        daysCountBn,
        timeBn: formTimeBn.trim() || 'সারাদিন',
        venueBn: formVenueBn.trim() || 'আনন্দ পাঠশালা ক্যাম্পাস',
        targetClassesBn,
        descriptionBn: formDescriptionBn.trim(),
        statusBadgeBn: formStatusBadgeBn.trim() || 'আসন্ন',
        priority: formPriority,
        isUpcoming: true,
      };

      const created = addEvent(newEventData);
      showToast(`✓ নতুন ইভেন্ট "${created.titleBn}" সফলভাবে তৈরি ও সিঙ্ক হয়েছে!`);

      // Optional FCM Notification trigger
      if (formNotifyBroadcast && onSendBroadcastNotification) {
        onSendBroadcastNotification(
          `📅 নতুন একাডেমি ইভেন্ট: ${created.titleBn}`,
          `${created.startDate} · ${created.targetClassesBn} · বিস্তারিত দিনপঞ্জি দেখুন`,
          'academic'
        );
      }
    }

    setShowEventModal(false);
    resetForm();
  };

  // Delete Event Handler
  const handleConfirmDelete = () => {
    if (!deletingEventId) return;
    const eventToDelete = events.find((e) => e.id === deletingEventId);
    removeEvent(deletingEventId);
    setDeletingEventId(null);
    setInspectedCell(null);
    setSelectedDetailEvent(null);
    showToast(
      eventToDelete
        ? `✓ ইভেন্ট "${eventToDelete.titleBn}" তালিকা থেকে মুছে ফেলা হয়েছে!`
        : '✓ ইভেন্টটি সফলভাবে মুছে ফেলা হয়েছে!'
    );
  };

  // Reset to Default Events
  const handleResetDefaults = () => {
    const ok = window.confirm(
      'আপনি কি সকল একাডেমিক ইভেন্ট আনন্দ পাঠশালার মূল ডিফল্ট তালিকায় ফিরিয়ে নিতে চান?'
    );
    if (!ok) return;
    resetAll();
    showToast('✓ সকল একাডেমি ইভেন্ট মূল ডিফল্ট তালিকায় রিস্টোর করা হয়েছে।');
  };

  // Print Calendar
  const handlePrint = () => {
    window.print();
  };

  // Calculate countdown tag for an event
  const getEventCountdownLabel = (event: AcademicCalendarEvent) => {
    const parsedStart = parseDateString(event.startDate);
    if (!parsedStart) return null;
    const today = new Date(2026, 10, 8); // reference current time in mock
    const eventDate = new Date(parsedStart.year, parsedStart.month, parsedStart.day);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { text: 'আজকে অনুষ্ঠিত', color: 'bg-emerald-600 text-white animate-pulse' };
    } else if (diffDays > 0 && diffDays <= 7) {
      return {
        text: `আর ${toBengaliDigits(diffDays)} দিন বাকি`,
        color: 'bg-amber-500 text-slate-950 font-bold',
      };
    } else if (diffDays > 7) {
      return {
        text: `${toBengaliDigits(diffDays)} দিন বাকি`,
        color: 'bg-slate-100 text-slate-700 font-semibold',
      };
    } else {
      return { text: 'সম্পন্ন', color: 'bg-slate-100 text-slate-500' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MODULE BANNER & QUICK STATS BAR                                       */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white rounded-3xl p-5 sm:p-7 shadow-sm border border-emerald-500/20 relative overflow-hidden">
        {/* Soft decorative background circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>একাডেমিক ক্যালেন্ডার ও দিনপঞ্জি ২০২৬–২৭</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-emerald-200 border border-white/20">
                {isAdmin
                  ? '👑 অ্যাডমিন ও অধ্যক্ষ কনসোল (লাইভ সিঙ্ক ও CRUD)'
                  : currentRole === 'teacher'
                  ? '👩‍🏫 শিক্ষক রোস্টার ও পরীক্ষার সময়সূচি'
                  : '👨‍👧 অভিভাবক ও সন্তান দিনপঞ্জি'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <CalendarDays className="w-7 h-7 text-emerald-400 shrink-0" />
              <span>আনন্দ পাঠশালা একাডেমি ইভেন্ট, পরীক্ষা ও ছুটির ক্যালেন্ডার</span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              শিখন মূল্যায়ন, সরকারি ও প্রাতিষ্ঠানিক ছুটি, অভিভাবক সমাবেশ (PTM) এবং ক্যাম্পাসের সাংস্কৃতিক ও বিজ্ঞান মেলার রিয়েল-টাইম তথ্য।
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleOpenCreateModal()}
                className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md flex items-center gap-2 transition cursor-pointer hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ নতুন ইভেন্ট যোগ করুন</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
              title="ক্যালেন্ডার প্রিন্ট বা PDF ডাউনলোড করুন"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>প্রিন্ট / PDF</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={handleResetDefaults}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white border border-white/20 transition cursor-pointer"
                title="ডিফল্ট একাডেমি ইভেন্টে রিসেট করুন"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Stat Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-500/20">
          {/* Holidays */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center text-lg shrink-0">
              🏖️
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
                স্কুল ছুটি
              </span>
              <span className="text-lg font-black text-white">
                {toBengaliDigits(stats.holidays)} টি ছুটি
              </span>
            </div>
          </div>

          {/* Exams */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-lg shrink-0">
              📝
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
                পরীক্ষা ও মূল্যায়ন
              </span>
              <span className="text-lg font-black text-white">
                {toBengaliDigits(stats.exams)} টি সেশন
              </span>
            </div>
          </div>

          {/* Meetings */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-lg shrink-0">
              👨‍👩‍👧‍👦
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
                PTM সমাবেশ
              </span>
              <span className="text-lg font-black text-white">
                {toBengaliDigits(stats.meetings)} টি মিটিং
              </span>
            </div>
          </div>

          {/* Cultural & Events */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-lg shrink-0">
              🎨
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
                উৎসব ও ক্রীড়া
              </span>
              <span className="text-lg font-black text-white">
                {toBengaliDigits(stats.culturalAndSports)} টি ইভেন্ট
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FILTER & VIEW MODE CONTROL TOOLBAR                                    */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* View mode buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveView('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
              <span>মাসিক গ্রিড ভিউ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('agenda')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'agenda'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>এজেন্ডা কার্ড ভিউ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>তালিকা ভিউ</span>
            </button>
          </div>

          {/* Search bar & Class filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-xl justify-end">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ইভেন্ট, পরীক্ষা বা ছুটির নাম দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">সকল শ্রেণির ইভেন্ট</option>
              <option value="হাতেখড়ি">হাতেখড়ি (Pre-Play)</option>
              <option value="প্লে">প্লে (Play)</option>
              <option value="নার্সারি">নার্সারি (Nursery)</option>
              <option value="কেজি">কেজি (KG)</option>
              <option value="১ম শ্রেণি">১ম শ্রেণি (Class 1)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            <span>ফিল্টার:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer text-xs ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            সকল ইভেন্ট ({events.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('holiday')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
              selectedCategory === 'holiday'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span>🏖️ স্কুল ছুটি</span>
            <span className="text-[10px] font-mono opacity-80">({stats.holidays})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('exam')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
              selectedCategory === 'exam'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <span>📝 পরীক্ষা ও মূল্যায়ন</span>
            <span className="text-[10px] font-mono opacity-80">({stats.exams})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('meeting')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
              selectedCategory === 'meeting'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span>👨‍👩‍👧‍👦 অভিভাবক সমাবেশ</span>
            <span className="text-[10px] font-mono opacity-80">({stats.meetings})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('cultural')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
              selectedCategory === 'cultural'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <span>🎨 মেলা ও উৎসব</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('sports')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
              selectedCategory === 'sports'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            <span>⚽ খেলাধুলা</span>
          </button>

          {/* Result counter */}
          <span className="ml-auto text-[11px] font-medium text-slate-500">
            প্রদর্শিত: <strong>{toBengaliDigits(filteredEvents.length)}</strong> টি ইভেন্ট
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. VIEW 1: INTERACTIVE MONTHLY VISUAL GRID                               */}
      {/* ========================================================================= */}
      {activeView === 'grid' && (
        <section className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          {/* Month Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-xl hover:bg-white text-slate-700 transition cursor-pointer"
                  title="পূর্ববর্তী মাস"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-xl hover:bg-white text-slate-700 transition cursor-pointer"
                  title="পরবর্তী মাস"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>{monthData.monthNameBn}</span>
                  <span className="text-emerald-700">{monthData.yearBn}</span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    ({monthData.monthNameEn})
                  </span>
                </h3>
                <span className="text-[11px] text-slate-500">
                  এই মাসে সর্বমোট {toBengaliDigits(monthData.totalEventsInMonth)} টি ইভেন্ট রয়েছে
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGoToToday}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                নভেম্বর ২০২৬
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() =>
                    handleOpenCreateModal(
                      `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ইভেন্ট যোগ করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Weekday Labels Header (Bangla + English) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
            {BN_WEEKDAYS.map((wd) => (
              <div
                key={wd.shortBn}
                className={`py-2 px-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  wd.isWeekend
                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                    : 'bg-slate-50 text-slate-700'
                }`}
              >
                <span className="block">{wd.fullBn}</span>
                <span className="text-[9px] font-mono opacity-60 block">{wd.shortEn}</span>
              </div>
            ))}
          </div>

          {/* 35-42 Calendar Grid Cells Matrix */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {monthData.cells.map((cell) => {
              const hasEvents = cell.events.length > 0;
              const isSelected = inspectedCell?.dateKey === cell.dateKey;
              const holidayEvent = cell.events.find((e) => e.category === 'holiday');
              const examEvent = cell.events.find((e) => e.category === 'exam');
              const meetingEvent = cell.events.find((e) => e.category === 'meeting');
              const culturalEvent = cell.events.find(
                (e) => e.category === 'cultural' || e.category === 'sports' || e.category === 'event'
              );

              return (
                <div
                  key={cell.dateKey}
                  onClick={() => {
                    if (hasEvents) {
                      setInspectedCell(cell);
                    } else if (isAdmin) {
                      handleOpenCreateModal(cell.dateKey);
                    }
                  }}
                  className={`min-h-[85px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50 shadow-sm'
                      : !cell.isCurrentMonth
                      ? 'bg-slate-50/50 border-slate-100 text-slate-300 opacity-60'
                      : cell.isWeekend
                      ? 'bg-rose-50/30 border-rose-100/60 hover:bg-rose-50/70 hover:border-rose-200'
                      : cell.isToday
                      ? 'bg-amber-50/60 border-amber-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  {/* Top Day Number & Today indicator */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-black rounded-lg w-6 h-6 flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : cell.isWeekend
                          ? 'text-rose-600'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumberBn}
                    </span>

                    {/* Quick Add Button for Admins on hover */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCreateModal(cell.dateKey);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition text-[10px]"
                        title="এই তারিখে ইভেন্ট যোগ করুন"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Event Badges inside Cell */}
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {cell.events.slice(0, 2).map((ev) => {
                      const meta = getCalendarCategoryMeta(ev.category);
                      return (
                        <div
                          key={ev.id}
                          className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md truncate leading-tight border transition-transform group-hover:scale-[1.02] ${meta.badgeColor}`}
                          title={`${ev.titleBn} (${meta.labelBn})`}
                        >
                          <span className="mr-0.5">{meta.iconEmoji}</span>
                          <span>{ev.titleBn}</span>
                        </div>
                      );
                    })}

                    {cell.events.length > 2 && (
                      <span className="text-[9px] font-bold text-slate-500 px-1 block truncate">
                        +{toBengaliDigits(cell.events.length - 2)} টি আরও
                      </span>
                    )}
                  </div>

                  {/* Weekend label or subtle tag */}
                  {cell.isWeekend && cell.events.length === 0 && (
                    <span className="text-[8.5px] font-bold text-rose-400 self-end">ছুটি</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar Color Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-2xs" />
                <span className="font-semibold text-slate-700">স্কুল ছুটি (Holidays)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-2xs" />
                <span className="font-semibold text-slate-700">পরীক্ষা ও শিখন মূল্যায়ন (Exams)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-2xs" />
                <span className="font-semibold text-slate-700">অভিভাবক সমাবেশ (PTM)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-600 shadow-2xs" />
                <span className="font-semibold text-slate-700">সাংস্কৃতিক ও মেলা (Festivals)</span>
              </div>
            </div>

            <span className="text-[11px] text-slate-500 font-medium">
              * শুক্র ও শনিবার সাপ্তাহিক নিয়মিত ছুটি
            </span>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW 2: AGENDA TIMELINE CARDS                                         */}
      {/* ========================================================================= */}
      {activeView === 'agenda' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>আসন্ন একাডেমি ইভেন্ট ও সময়রেখা তালিকা</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              সর্বমোট {toBengaliDigits(filteredEvents.length)} টি ইভেন্ট তালিকাভুক্ত
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">কোনো ইভেন্ট পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-400">
                অনুসন্ধান বা ফিল্টারের সাথে মিলে এমন কোনো একাডেমিক ইভেন্ট নেই।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((event) => {
                const meta = getCalendarCategoryMeta(event.category);
                const countdown = getEventCountdownLabel(event);
                const gCalUrl = createGoogleCalendarUrl(event);

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
                  >
                    {/* Top colored accent line */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${meta.accentBar}`} />

                    {/* Top status bar */}
                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 ${meta.badgeColor}`}
                        >
                          <span>{meta.iconEmoji}</span>
                          <span>{meta.labelBn}</span>
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                          {event.targetClassesBn}
                        </span>
                      </div>

                      {countdown && (
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0 ${countdown.color}`}
                        >
                          {countdown.text}
                        </span>
                      )}
                    </div>

                    {/* Main Title & Description */}
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {event.titleBn}
                      </h4>
                      {event.titleEn && (
                        <p className="text-xs font-semibold text-slate-400 font-sans">
                          {event.titleEn}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 leading-relaxed pt-1 line-clamp-3">
                        {event.descriptionBn}
                      </p>
                    </div>

                    {/* Date, Time & Venue */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold">তারিখ:</span>
                        <span>
                          {event.startDate}
                          {event.endDate && ` – ${event.endDate}`}
                        </span>
                        {event.daysCountBn && (
                          <span className="text-[10.5px] font-semibold text-slate-500">
                            ({event.daysCountBn})
                          </span>
                        )}
                      </div>

                      {event.timeBn && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="font-bold">সময়:</span>
                          <span>{event.timeBn}</span>
                        </div>
                      )}

                      {event.venueBn && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-bold">স্থান:</span>
                          <span className="truncate">{event.venueBn}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Bar (Details, GCal, Edit/Delete for Admins) */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailEvent(event)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>বিস্তারিত</span>
                        </button>

                        <a
                          href={gCalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Google Calendar-এ যুক্ত করুন"
                        >
                          <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">Google Cal</span>
                        </a>
                      </div>

                      {/* Admin CRUD controls */}
                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(event)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition cursor-pointer"
                            title="ইভেন্ট এডিট করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingEventId(event.id)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 transition cursor-pointer"
                            title="ইভেন্ট মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. VIEW 3: COMPACT ANNUAL / MONTHLY LIST VIEW                            */}
      {/* ========================================================================= */}
      {activeView === 'list' && (
        <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-purple-600" />
              <span>বার্ষিক একাডেমি ইভেন্ট তালিকা</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {toBengaliDigits(filteredEvents.length)} টি রেকর্ড
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">তারিখ ও সময়</th>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4">ইভেন্টের নাম</th>
                  <th className="py-3 px-4">প্রযোজ্য শ্রেণি</th>
                  <th className="py-3 px-4">স্থান / ভেন্যু</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((event) => {
                  const meta = getCalendarCategoryMeta(event.category);
                  return (
                    <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div>{event.startDate}</div>
                        {event.endDate && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            পর্যন্ত: {event.endDate}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${meta.badgeColor}`}
                        >
                          <span>{meta.iconEmoji}</span>
                          <span>{meta.labelBn}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 max-w-xs">
                        <div className="truncate">{event.titleBn}</div>
                        <div className="text-[10px] text-slate-400 truncate font-normal">
                          {event.titleEn}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {event.targetClassesBn}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[150px] truncate">
                        {event.venueBn}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailEvent(event)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(event)}
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition cursor-pointer"
                                title="এডিট"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingEventId(event.id)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. DAY EVENTS INSPECTION MODAL (When clicking a cell on Month Grid)       */}
      {/* ========================================================================= */}
      {inspectedCell && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                  {inspectedCell.dayNumberBn}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {inspectedCell.dayNumberBn} {monthData.monthNameBn} {monthData.yearBn}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {inspectedCell.dayOfWeekBn}বার · {toBengaliDigits(inspectedCell.events.length)}{' '}
                    টি ইভেন্ট নির্ধারিত
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectedCell(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Cards inside Day */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {inspectedCell.events.map((event) => {
                const meta = getCalendarCategoryMeta(event.category);
                return (
                  <div
                    key={event.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${meta.badgeColor}`}
                      >
                        {meta.iconEmoji} {meta.labelBn}
                      </span>

                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(event)}
                            className="p-1 rounded-lg bg-white hover:bg-amber-100 text-slate-600 hover:text-amber-800 transition cursor-pointer shadow-2xs"
                            title="এডিট করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingEventId(event.id)}
                            className="p-1 rounded-lg bg-white hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer shadow-2xs"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-slate-900">{event.titleBn}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {event.descriptionBn}
                    </p>

                    <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-200/60 font-medium">
                      <div>🎯 শ্রেণি: {event.targetClassesBn}</div>
                      <div>⏰ সময়: {event.timeBn || 'নির্ধারিত সময়ে'}</div>
                      <div>📍 স্থান: {event.venueBn}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenCreateModal(inspectedCell.dateKey);
                    setInspectedCell(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>এই তারিখে আরও ইভেন্ট যোগ করুন</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setInspectedCell(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer ml-auto"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. EVENT DETAIL MODAL (Focused single event inspection)                   */}
      {/* ========================================================================= */}
      {selectedDetailEvent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              {(() => {
                const meta = getCalendarCategoryMeta(selectedDetailEvent.category);
                return (
                  <div className="space-y-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${meta.badgeColor}`}
                    >
                      <span>{meta.iconEmoji}</span>
                      <span>{meta.labelBn}</span>
                    </span>
                    <h3 className="text-lg font-black text-slate-900 leading-snug">
                      {selectedDetailEvent.titleBn}
                    </h3>
                    {selectedDetailEvent.titleEn && (
                      <p className="text-xs text-slate-400 font-sans">
                        {selectedDetailEvent.titleEn}
                      </p>
                    )}
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={() => setSelectedDetailEvent(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">তারিখ:</span>
                  <span>
                    {selectedDetailEvent.startDate}
                    {selectedDetailEvent.endDate && ` – ${selectedDetailEvent.endDate}`}
                  </span>
                  {selectedDetailEvent.daysCountBn && (
                    <span className="font-semibold text-slate-500">
                      ({selectedDetailEvent.daysCountBn})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-bold">সময়:</span>
                  <span>{selectedDetailEvent.timeBn || 'নির্ধারিত সময়ে'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-bold">ভেন্যু:</span>
                  <span>{selectedDetailEvent.venueBn}</span>
                </div>

                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold">অংশগ্রহণকারী:</span>
                  <span>{selectedDetailEvent.targetClassesBn}</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">ইভেন্টের বিবরণ ও নির্দেশনা:</h5>
                <p className="p-3 bg-white border border-slate-200 rounded-xl leading-relaxed text-slate-700">
                  {selectedDetailEvent.descriptionBn}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <a
                href={createGoogleCalendarUrl(selectedDetailEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Calendar-এ সেভ</span>
              </a>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedDetailEvent)}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>এডিট</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingEventId(selectedDetailEvent.id)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedDetailEvent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. CREATE / EDIT EVENT MODAL (CRUD ADMIN FORM)                           */}
      {/* ========================================================================= */}
      {showEventModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 my-auto max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between gap-4 shrink-0 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                  {editingEvent ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {editingEvent ? 'একাডেমিক ইভেন্ট সম্পাদনা' : 'নতুন একাডেমি ইভেন্ট তৈরি করুন'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    ইভেন্টটি সংরক্ষণ করলে সকল শিক্ষক, শিক্ষার্থী ও অভিভাবক পোর্টালে রিয়েল-টাইমে সিঙ্ক হবে
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEventModal(false);
                  resetForm();
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEvent} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title Bangla & English */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইভেন্টের শিরোনাম (বাংলায়) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitleBn}
                    onChange={(e) => setFormTitleBn(e.target.value)}
                    placeholder="যেমন: বার্ষিক ক্রীড়া প্রতিযোগিতা ও সাংস্কৃতিক মেলা"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইভেন্টের নাম (English - ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    placeholder="e.g. Annual Sports & Cultural Festival 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ইভেন্ট ক্যাটাগরি <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'holiday', label: '🏖️ স্কুল ছুটি', bg: 'hover:border-rose-300' },
                    { key: 'exam', label: '📝 পরীক্ষা ও মূল্যায়ন', bg: 'hover:border-indigo-300' },
                    { key: 'meeting', label: '👨‍👩‍👧‍👦 অভিভাবক সমাবেশ', bg: 'hover:border-emerald-300' },
                    { key: 'cultural', label: '🎨 সাংস্কৃতিক মেলা', bg: 'hover:border-purple-300' },
                    { key: 'sports', label: '⚽ খেলাধুলা ও ক্রীড়া', bg: 'hover:border-teal-300' },
                    { key: 'event', label: '⭐ বিশেষ অনুষ্ঠান', bg: 'hover:border-amber-300' },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setFormCategory(cat.key as AcademicEventCategory)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                        formCategory === cat.key
                          ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                          : `bg-slate-50 border-slate-200 text-slate-700 ${cat.bg}`
                      }`}
                    >
                      <span>{cat.label}</span>
                      {formCategory === cat.key && (
                        <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    শুরুর তারিখ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formStartDateIso}
                    onChange={(e) => setFormStartDateIso(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                    বাংলা তারিখ: {formatDateToBengali(formStartDateIso) || 'তারিখ নির্বাচন করুন'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    শেষের তারিখ (একাধিক দিন হলে)
                  </label>
                  <input
                    type="date"
                    value={formEndDateIso}
                    onChange={(e) => setFormEndDateIso(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                    {formEndDateIso
                      ? `বাংলা তারিখ: ${formatDateToBengali(formEndDateIso)}`
                      : 'একদিন হলে ফাঁকা রাখুন'}
                  </span>
                </div>
              </div>

              {/* Time & Venue Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">সময়সূচি</label>
                  <input
                    type="text"
                    value={formTimeBn}
                    onChange={(e) => setFormTimeBn(e.target.value)}
                    placeholder="যেমন: সকাল ১০:০০ - দুপুর ১২:৩০"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">স্থান / ভেন্যু</label>
                  <input
                    type="text"
                    value={formVenueBn}
                    onChange={(e) => setFormVenueBn(e.target.value)}
                    placeholder="যেমন: আনন্দ পাঠশালা ক্যাম্পাস ও অডিটোরিয়াম"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Target Classes Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  প্রযোজ্য শ্রেণি (Target Classes)
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {ALL_CLASSES.map((cls) => {
                    const isSelected = formTargetClasses.includes(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => handleToggleClass(cls)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিস্তারিত বিবরণ ও নির্দেশনা
                </label>
                <textarea
                  value={formDescriptionBn}
                  onChange={(e) => setFormDescriptionBn(e.target.value)}
                  rows={3}
                  placeholder="ইভেন্টের বিস্তারিত তথ্য, সিলেবাস বা অভিভাবকদের জন্য বিশেষ কোনো নির্দেশনা..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              {/* Status Badge & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    স্ট্যাটাস ব্যাজ টেক্সট
                  </label>
                  <input
                    type="text"
                    value={formStatusBadgeBn}
                    onChange={(e) => setFormStatusBadgeBn(e.target.value)}
                    placeholder="যেমন: আসন্ন, সরকারি ছুটি, বাধ্যতামূলক"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অগ্রাধিকার</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="normal">সাধারণ (Normal)</option>
                    <option value="high">উচ্চ অগ্রাধিকার (High)</option>
                    <option value="urgent">জরুরি / নোটিশ (Urgent)</option>
                  </select>
                </div>
              </div>

              {/* FCM Notification toggle */}
              {!editingEvent && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="notify-broadcast"
                    checked={formNotifyBroadcast}
                    onChange={(e) => setFormNotifyBroadcast(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label
                    htmlFor="notify-broadcast"
                    className="text-xs font-bold text-slate-800 cursor-pointer select-none"
                  >
                    ইভেন্টটি তৈরি হওয়ার সাথে সাথে শিক্ষক ও অভিভাবকদের FCM নোটিফিকেশন পাঠান
                  </label>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingEvent ? 'আপডেট সংরক্ষণ করুন' : 'ইভেন্ট প্রকাশ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. DELETE CONFIRMATION DIALOG                                             */}
      {/* ========================================================================= */}
      {deletingEventId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
        >
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">ইভেন্টটি মুছে ফেলতে চান?</h3>
              <p className="text-xs text-slate-500">
                এই একাডেমি ইভেন্টটি মুছে ফেললে তা সকল পোর্টালে আর প্রদর্শিত হবে না। আপনি কি নিশ্চিত?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEventId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                বাতিল
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
