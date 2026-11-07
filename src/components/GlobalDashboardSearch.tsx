import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Student, 
  AttendanceRecord, 
  ActivityPost, 
  PickupEvent, 
  UserRole 
} from '../types/school';
import { 
  Search, 
  X, 
  User, 
  CalendarCheck, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  Phone, 
  Clock, 
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface GlobalDashboardSearchProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  activityPosts: ActivityPost[];
  pickupLogs?: PickupEvent[];
  onNavigateTab: (tab: string) => void;
  currentRole: UserRole;
  onSelectStudent?: (student: Student) => void;
}

type SearchCategory = 'all' | 'students' | 'attendance' | 'diary' | 'pickup';

export const GlobalDashboardSearch: React.FC<GlobalDashboardSearchProps> = ({
  students,
  attendanceRecords,
  activityPosts,
  pickupLogs = [],
  onNavigateTab,
  currentRole,
  onSelectStudent,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Press "/" or Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  // 1. Matched Students
  const matchedStudents = useMemo(() => {
    if (!normalizedQuery) return [];
    return students.filter((std) => {
      const nameBnMatch = std.nameBn.toLowerCase().includes(normalizedQuery);
      const nameEnMatch = std.nameEn.toLowerCase().includes(normalizedQuery);
      const rollMatch = std.rollNo.toLowerCase().includes(normalizedQuery);
      const classMatch = std.className.toLowerCase().includes(normalizedQuery);
      const fatherMatch = std.fatherNameBn?.toLowerCase().includes(normalizedQuery);
      const motherMatch = std.motherNameBn?.toLowerCase().includes(normalizedQuery);
      const phoneMatch = std.emergencyPhone?.includes(normalizedQuery);
      const addressMatch = std.homeAddressBn?.toLowerCase().includes(normalizedQuery);
      const guardianMatch = std.authorizedPickups?.some(
        (p) =>
          p.nameBn.toLowerCase().includes(normalizedQuery) ||
          p.phone.includes(normalizedQuery) ||
          p.relationBn.toLowerCase().includes(normalizedQuery)
      );

      const statusMatch =
        (normalizedQuery.includes('উপস্থিত') && std.currentStatus === 'in_class') ||
        (normalizedQuery.includes('প্রস্থান') && std.currentStatus === 'picked_up') ||
        (normalizedQuery.includes('অনুপস্থিত') && std.currentStatus === 'absent');

      return (
        nameBnMatch ||
        nameEnMatch ||
        rollMatch ||
        classMatch ||
        fatherMatch ||
        motherMatch ||
        phoneMatch ||
        addressMatch ||
        guardianMatch ||
        statusMatch
      );
    });
  }, [students, normalizedQuery]);

  // 2. Matched Attendance Records
  const matchedAttendance = useMemo(() => {
    if (!normalizedQuery) return [];
    return attendanceRecords.filter((rec) => {
      const nameMatch = rec.studentNameBn?.toLowerCase().includes(normalizedQuery);
      const rollMatch = rec.rollNo?.toLowerCase().includes(normalizedQuery);
      const classMatch = rec.className?.toLowerCase().includes(normalizedQuery);
      const remarksMatch = (rec as any).remarks?.toLowerCase().includes(normalizedQuery);
      const statusMatch =
        (normalizedQuery.includes('উপস্থিত') && rec.status === 'present') ||
        (normalizedQuery.includes('অনুপস্থিত') && rec.status === 'absent') ||
        (normalizedQuery.includes('বিলম্ব') && rec.status === 'late') ||
        rec.status.toLowerCase().includes(normalizedQuery);

      return nameMatch || rollMatch || classMatch || remarksMatch || statusMatch;
    });
  }, [attendanceRecords, normalizedQuery]);

  // 3. Matched Activity & Classroom Diary Posts
  const matchedActivities = useMemo(() => {
    if (!normalizedQuery) return [];
    return activityPosts.filter((post) => {
      const titleMatch = post.titleBn?.toLowerCase().includes(normalizedQuery);
      const descMatch = post.descriptionBn?.toLowerCase().includes(normalizedQuery);
      const classMatch = post.className?.toLowerCase().includes(normalizedQuery);
      const teacherMatch = post.teacherNameBn?.toLowerCase().includes(normalizedQuery);
      const snackMatch = post.snackDetail?.itemBn?.toLowerCase().includes(normalizedQuery);
      const typeMatch = post.activityType?.toLowerCase().includes(normalizedQuery);

      return titleMatch || descMatch || classMatch || teacherMatch || snackMatch || typeMatch;
    });
  }, [activityPosts, normalizedQuery]);

  // 4. Matched Gate Pickup Logs
  const matchedPickups = useMemo(() => {
    if (!normalizedQuery) return [];
    return pickupLogs.filter((log) => {
      const stdNameMatch = log.studentNameBn?.toLowerCase().includes(normalizedQuery);
      const personNameMatch = log.pickupPersonNameBn?.toLowerCase().includes(normalizedQuery);
      const relationMatch = log.relationBn?.toLowerCase().includes(normalizedQuery);
      const classMatch = log.className?.toLowerCase().includes(normalizedQuery);
      const officerMatch = log.gateOfficerNameBn?.toLowerCase().includes(normalizedQuery);
      const gateMatch = log.gateCode?.toLowerCase().includes(normalizedQuery);

      return stdNameMatch || personNameMatch || relationMatch || classMatch || officerMatch || gateMatch;
    });
  }, [pickupLogs, normalizedQuery]);

  const totalResultsCount =
    matchedStudents.length +
    matchedAttendance.length +
    matchedActivities.length +
    matchedPickups.length;

  const handleSelectQuickSearch = (term: string) => {
    setQuery(term);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchContainerRef} className="relative z-30 w-full print:hidden">
      {/* Search Bar Input Container */}
      <div className="bg-white rounded-2xl border-2 border-emerald-500/80 shadow-md hover:border-emerald-600 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/20 transition-all p-1.5 sm:p-2">
        <div className="flex items-center gap-2 px-2 sm:px-3">
          <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="গ্লোবাল সার্চ: শিক্ষার্থীর নাম, রোল, ফোন, আজকের হাজিরা বা ক্লাসরুম ডায়েরি..."
            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none py-1.5"
            aria-label="গ্লোবাল সার্চ বার"
          />

          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="সার্চ মুছুন"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500 shrink-0">
              <span className="font-sans font-bold">কীবোর্ড:</span>
              <kbd className="px-1 bg-white rounded border border-slate-300 font-bold">/</kbd>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {!query && (
          <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-[11px] text-slate-500 overflow-x-auto no-scrollbar border-t border-slate-100 mt-1">
            <span className="text-slate-400 shrink-0 flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-amber-500" />
              দ্রুত সার্চ:
            </span>
            <button
              type="button"
              onClick={() => handleSelectQuickSearch('আদিত্য রায়')}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer text-[10.5px]"
            >
              আদিত্য রায়
            </button>
            <button
              type="button"
              onClick={() => handleSelectQuickSearch('Playgroup')}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer text-[10.5px]"
            >
              Playgroup
            </button>
            <button
              type="button"
              onClick={() => handleSelectQuickSearch('অনুপস্থিত')}
              className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors whitespace-nowrap cursor-pointer text-[10.5px] font-medium"
            >
              অনুপস্থিত শিক্ষার্থী
            </button>
            <button
              type="button"
              onClick={() => handleSelectQuickSearch('ক্রাফট')}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer text-[10.5px]"
            >
              কাগজের ক্রাফট ডায়েরি
            </button>
            <button
              type="button"
              onClick={() => handleSelectQuickSearch('KG-1')}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer text-[10.5px]"
            >
              কেজি-১
            </button>
          </div>
        )}
      </div>

      {/* Dropdown Live Results Panel */}
      {isOpen && query && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl border-2 border-emerald-500/70 shadow-2xl overflow-hidden max-h-[82vh] flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Strip with Result Count & Category Filters */}
          <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  সার্চ ফলাফল: <span className="text-emerald-700 font-mono font-black">{totalResultsCount}টি</span> আইটেম পাওয়া গেছে
                </span>
                <span className="text-[10px] text-slate-400 font-mono">“{query}”</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-1 rounded-lg hover:bg-slate-200/60"
              >
                ✕ বন্ধ
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeCategory === 'all'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>সবগুলো</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/15">
                  {totalResultsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('students')}
                className={`px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeCategory === 'students'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>শিক্ষার্থী</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/15">
                  {matchedStudents.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('attendance')}
                className={`px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeCategory === 'attendance'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>হাজিরা</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/15">
                  {matchedAttendance.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('diary')}
                className={`px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeCategory === 'diary'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>ডায়েরি ও অ্যাক্টিভিটি</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/15">
                  {matchedActivities.length}
                </span>
              </button>

              {matchedPickups.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategory('pickup')}
                  className={`px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    activeCategory === 'pickup'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>গেট-পাস লগ</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/15">
                  {matchedPickups.length}
                </span>
              </button>
            )}
            </div>
          </div>

          {/* Results Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-slate-100 space-y-4">
            {totalResultsCount === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  “{query}” দিয়ে কোনো তথ্য খুঁজে পাওয়া যায়নি
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  বানান সঠিক আছে কিনা পরীক্ষা করুন, অথবা কোনো রোল নম্বর (যেমন: 01), শ্রেণি (Playgroup) বা সাধারণ কিওয়ার্ড দিয়ে আবার চেষ্টা করুন।
                </p>
              </div>
            ) : null}

            {/* SECTION 1: STUDENTS MATCHES */}
            {(activeCategory === 'all' || activeCategory === 'students') && matchedStudents.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    শিক্ষার্থীবৃন্দ ({matchedStudents.length})
                  </h4>
                  <span className="text-[10px] text-slate-400">আনন্দ পাঠশালা ছাত্রছাত্রী তালিকা</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {matchedStudents.map((std) => {
                    const statusText =
                      std.currentStatus === 'in_class'
                        ? 'শ্রেণিকক্ষে উপস্থিত'
                        : std.currentStatus === 'picked_up'
                        ? 'ছুটিপ্রাপ্ত (Picked Up)'
                        : 'অনুপস্থিত';
                    const statusBadgeClass =
                      std.currentStatus === 'in_class'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : std.currentStatus === 'picked_up'
                        ? 'bg-teal-100 text-teal-800 border-teal-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300';

                    return (
                      <div
                        key={std.id}
                        className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${std.avatarColor}`}>
                              {std.rollNo}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {std.nameBn}
                              </h5>
                              <span className="text-[10px] text-slate-500 font-medium block truncate">
                                {std.nameEn} · {std.className} (শাখা {std.section})
                              </span>
                            </div>
                          </div>

                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${statusBadgeClass}`}>
                            {statusText}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-slate-50/80 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                          <div className="truncate">
                            <span className="text-slate-400">অভিভাবক: </span>
                            <span className="font-semibold text-slate-800">{std.fatherNameBn || std.authorizedPickups[0]?.nameBn}</span>
                          </div>
                          {std.emergencyPhone && (
                            <a
                              href={`tel:${std.emergencyPhone}`}
                              className="font-mono text-emerald-700 hover:underline flex items-center gap-1 shrink-0 font-bold ml-2"
                              title="অভিভাবককে কল করুন"
                            >
                              <Phone className="w-3 h-3" />
                              {std.emergencyPhone}
                            </a>
                          )}
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              onNavigateTab('attendance');
                            }}
                            className="flex-1 py-1 px-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-center transition-colors cursor-pointer"
                          >
                            হাজিরা
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              onNavigateTab('pickup');
                            }}
                            className="flex-1 py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-center transition-colors cursor-pointer"
                          >
                            গেট-পাস
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              onNavigateTab('skills');
                            }}
                            className="flex-1 py-1 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-center transition-colors cursor-pointer"
                          >
                            রিপোর্ট কার্ড
                          </button>
                          {onSelectStudent && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsOpen(false);
                                onSelectStudent(std);
                              }}
                              className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
                              title="প্রোফাইল বিবরণ"
                            >
                              বিস্তারিত
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 2: ATTENDANCE RECORDS MATCHES */}
            {(activeCategory === 'all' || activeCategory === 'attendance') && matchedAttendance.length > 0 && (
              <div className="space-y-2.5 pt-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
                    ক্লাসরুম হাজিরা রেকর্ড ({matchedAttendance.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateTab('attendance');
                    }}
                    className="text-[10px] text-teal-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    হাজিরা মডিউলে যান <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {matchedAttendance.map((rec) => {
                    const isPresent = rec.status === 'present';
                    const isLate = rec.status === 'late';
                    return (
                      <div
                        key={rec.studentId + '-' + rec.className}
                        onClick={() => {
                          setIsOpen(false);
                          onNavigateTab('attendance');
                        }}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 transition-all flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            isPresent ? 'bg-emerald-100 text-emerald-700' : isLate ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {isPresent ? <CheckCircle className="w-4 h-4" /> : isLate ? <Clock className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {rec.studentNameBn}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              রোল: {rec.rollNo} · {rec.className}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isPresent 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : isLate 
                              ? 'bg-amber-50 text-amber-800 border-amber-200' 
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {isPresent ? 'উপস্থিত' : isLate ? 'বিলম্বে' : 'অনুপস্থিত'}
                          </span>
                          <span className="text-slate-400 hover:text-teal-700">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 3: ACTIVITY POSTS & DIARY MATCHES */}
            {(activeCategory === 'all' || activeCategory === 'diary') && matchedActivities.length > 0 && (
              <div className="space-y-2.5 pt-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    ক্লাসরুম ডায়েরি ও অ্যাক্টিভিটি পোস্ট ({matchedActivities.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateTab('diary');
                    }}
                    className="text-[10px] text-indigo-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    ডায়েরি ফিডে যান <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {matchedActivities.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => {
                        setIsOpen(false);
                        onNavigateTab('diary');
                      }}
                      className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-2xs transition-all flex items-start gap-3 cursor-pointer group"
                    >
                      {post.photoUrl && (
                        <img
                          src={post.photoUrl}
                          alt={post.titleBn}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 group-hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] font-bold px-2 py-0.2 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                            {post.className}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {post.dateStr} · {post.timeStr}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
                          {post.titleBn}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {post.descriptionBn}
                        </p>
                        <div className="text-[10px] text-slate-400 font-semibold pt-0.5">
                          পোস্টকারী: <span className="text-slate-600">{post.teacherNameBn}</span>
                        </div>
                      </div>
                      <div className="self-center p-1 text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: GATE PICKUP LOGS MATCHES */}
            {(activeCategory === 'all' || activeCategory === 'pickup') && matchedPickups.length > 0 && (
              <div className="space-y-2.5 pt-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    গেট-পাস প্রস্থান লগ ({matchedPickups.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateTab('pickup');
                    }}
                    className="text-[10px] text-teal-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    গেট কনসোলে যান <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {matchedPickups.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => {
                        setIsOpen(false);
                        onNavigateTab('pickup');
                      }}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 transition-all flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{log.studentNameBn}</span>
                          <span className="text-[10px] text-slate-500">({log.className})</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">
                          গ্রহীতা: <strong className="text-slate-700">{log.pickupPersonNameBn}</strong> ({log.relationBn}) · {log.timestamp}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                        SMS প্রেরিত ✓
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
