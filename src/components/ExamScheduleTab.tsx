import React, { useState, useEffect, useMemo } from 'react';
import {
  SchoolClass,
  UserRole,
  ExamScheduleItem,
  AssessmentType,
} from '../types/school';
import {
  getSchoolClassNameBn,
  toBengaliNumber,
} from '../utils/schoolLogic';
import {
  getExamSchedules,
  addExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  resetExamSchedulesToDefault,
  downloadExamScheduleCsv,
  getExamDaysRemaining,
  getAssessmentTypeLabelBn,
  BN_WEEKDAY_NAMES,
  EXAM_SCHEDULE_UPDATE_EVENT,
} from '../utils/examScheduleLogic';
import { SCHOOL_TEACHERS } from '../data/mockData';
import { CLASS_ROOMS } from '../data/mockRoutines';
import {
  Calendar,
  Clock,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Printer,
  Download,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Award,
  FileText,
  Eye,
  Table,
  LayoutGrid,
  RefreshCw,
  MapPin,
  Building2,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export interface ExamScheduleTabProps {
  currentRole: UserRole;
  canEdit: boolean;
  selectedClass: SchoolClass;
  onSelectClass?: (cls: SchoolClass) => void;
  onNavigateBackToRoutine?: () => void;
}

const CLASS_OPTIONS: { id: SchoolClass; nameBn: string; color: string; badge: string }[] = [
  { id: 'HateKhori', nameBn: 'হাতেখড়ি', color: 'border-pink-300 bg-pink-50/50', badge: 'bg-pink-600' },
  { id: 'Play', nameBn: 'প্লে', color: 'border-emerald-300 bg-emerald-50/50', badge: 'bg-emerald-600' },
  { id: 'Nursery', nameBn: 'নার্সারি', color: 'border-teal-300 bg-teal-50/50', badge: 'bg-teal-600' },
  { id: 'KG', nameBn: 'কেজি', color: 'border-amber-300 bg-amber-50/50', badge: 'bg-amber-600' },
  { id: 'Class-1', nameBn: 'ওয়ান', color: 'border-indigo-300 bg-indigo-50/50', badge: 'bg-indigo-600' },
  { id: 'Class-2', nameBn: 'টু', color: 'border-purple-300 bg-purple-50/50', badge: 'bg-purple-600' },
];

const STANDARD_SUBJECT_TEMPLATES = [
  'বাংলা ও বর্ণমালা জ্ঞান',
  'বাংলা ব্যাকরণ ও সহজ বাক্য গঠন',
  'ইংরেজি ছড়া ও শব্দ পরিচিতি',
  'English Phonics & Vocabulary',
  'সংখ্যা ও মৌলিক গণিত',
  'প্রাথমিক গণিত ও নামতা',
  'সাধারণ জ্ঞান ও ড্রয়িং',
  'সৃজনশীল অঙ্কন ও রং মেলানো',
  'ইসলামিয়াত ও নৈতিক শিক্ষা',
  'মন্টেসরি অ্যাক্টিভিটি মূল্যায়ন',
];

export const ExamScheduleTab: React.FC<ExamScheduleTabProps> = ({
  currentRole,
  canEdit,
  selectedClass,
  onSelectClass,
  onNavigateBackToRoutine,
}) => {
  // Schedules State
  const [examSchedules, setExamSchedules] = useState<ExamScheduleItem[]>(() => getExamSchedules());
  const [filterClass, setFilterClass] = useState<SchoolClass | 'all'>(selectedClass);
  const [filterType, setFilterType] = useState<AssessmentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewFormat, setViewFormat] = useState<'cards' | 'table'>('cards');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with ClassRoutineModule's selectedClass when it changes
  useEffect(() => {
    if (selectedClass) {
      setFilterClass(selectedClass);
    }
  }, [selectedClass]);

  // Sync with custom event across browser windows & components
  useEffect(() => {
    const handleUpdate = () => {
      setExamSchedules(getExamSchedules());
    };
    window.addEventListener(EXAM_SCHEDULE_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(EXAM_SCHEDULE_UPDATE_EVENT, handleUpdate);
  }, []);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    className: SchoolClass;
    examTitle: string;
    subject: string;
    examDate: string;
    dayNameBn: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    room: string;
    syllabusTopics: string;
    totalMarks: number;
    passMarks: number;
    examinerTeacherNameBn: string;
    assessmentType: AssessmentType;
    instructionsBn: string;
    status: 'upcoming' | 'ongoing' | 'completed';
  }>({
    className: selectedClass,
    examTitle: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)',
    subject: 'বাংলা ও বর্ণমালা জ্ঞান',
    examDate: '2026-11-15',
    dayNameBn: 'রবিবার',
    startTime: '০৯:৩০ AM',
    endTime: '১১:০০ AM',
    durationMinutes: 90,
    room: 'রুম ১০২',
    syllabusTopics: 'স্বরবর্ণ ও ব্যঞ্জনবর্ণ লেখা, ছড়া আবৃত্তি',
    totalMarks: 50,
    passMarks: 20,
    examinerTeacherNameBn: 'ফাতেমা আক্তার',
    assessmentType: 'written',
    instructionsBn: 'প্রয়োজনীয় পেন্সিল ও ইরেজার সঙ্গে রাখতে হবে।',
    status: 'upcoming',
  });

  // Calculate day name automatically when date changes
  const handleDateChange = (dateVal: string) => {
    let dayBn = 'রবিবার';
    if (dateVal) {
      const [y, m, d] = dateVal.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayIdx = dateObj.getDay();
      dayBn = BN_WEEKDAY_NAMES[dayIdx] || 'দিন';
    }
    setFormData((prev) => ({
      ...prev,
      examDate: dateVal,
      dayNameBn: dayBn,
    }));
  };

  // Open modal for new exam
  const handleOpenAddModal = (targetClass?: SchoolClass) => {
    const cls = targetClass || (filterClass === 'all' ? selectedClass : filterClass);
    setEditingExamId(null);
    setFormData({
      className: cls,
      examTitle: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)',
      subject: 'বাংলা ও বর্ণমালা জ্ঞান',
      examDate: '2026-11-15',
      dayNameBn: 'রবিবার',
      startTime: '০৯:৩০ AM',
      endTime: '১১:০০ AM',
      durationMinutes: 90,
      room: cls === 'Play' ? 'প্লে-জোন হল রুম' : 'রুম ১০২',
      syllabusTopics: '',
      totalMarks: 50,
      passMarks: 20,
      examinerTeacherNameBn: SCHOOL_TEACHERS[0]?.nameBn || 'ফাতেমা আক্তার',
      assessmentType: 'written',
      instructionsBn: 'সকল শিক্ষার্থীকে যথাসময়ে উপস্থিত থাকতে হবে।',
      status: 'upcoming',
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (exam: ExamScheduleItem) => {
    setEditingExamId(exam.id);
    setFormData({
      className: exam.className,
      examTitle: exam.examTitle,
      subject: exam.subject,
      examDate: exam.examDate,
      dayNameBn: exam.dayNameBn,
      startTime: exam.startTime,
      endTime: exam.endTime,
      durationMinutes: exam.durationMinutes,
      room: exam.room,
      syllabusTopics: exam.syllabusTopics,
      totalMarks: exam.totalMarks,
      passMarks: exam.passMarks || 20,
      examinerTeacherNameBn: exam.examinerTeacherNameBn,
      assessmentType: exam.assessmentType,
      instructionsBn: exam.instructionsBn || '',
      status: exam.status,
    });
    setIsModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      alert('অনুগ্রহ করে পরীক্ষার বিষয় লিখুন।');
      return;
    }

    if (!formData.examDate) {
      alert('অনুগ্রহ করে পরীক্ষার তারিখ নির্ধারণ করুন।');
      return;
    }

    // Format Bengali date e.g. "১৫ নভেম্বর ২০২৬"
    const [y, m, d] = formData.examDate.split('-').map(Number);
    const monthsBn = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const examDateBn = `${toBengaliNumber(d)} ${monthsBn[m - 1]} ${toBengaliNumber(y)}`;

    if (editingExamId) {
      updateExamSchedule(editingExamId, {
        ...formData,
        examDateBn,
      });
      showToast('পরীক্ষার সময়সূচি সফলভাবে আপডেট করা হয়েছে! ✓');
    } else {
      addExamSchedule({
        ...formData,
        examDateBn,
      });
      showToast('নতুন পরীক্ষার তারিখ ও সূচি সফলভাবে যুক্ত করা হয়েছে! ✓');
    }

    setIsModalOpen(false);
    setExamSchedules(getExamSchedules());
  };

  // Delete Exam
  const handleDeleteExam = (id: string, subjectName: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${subjectName}" পরীক্ষার সূচি মুছে ফেলতে চান?`)) {
      deleteExamSchedule(id);
      setExamSchedules(getExamSchedules());
      showToast('পরীক্ষার সূচি মুছে ফেলা হয়েছে।');
    }
  };

  // Reset to default
  const handleReset = () => {
    if (confirm('আপনি কি সকল পরীক্ষার সময়সূচি প্রাথমিক ডিফল্ট তালিকায় ফিরিয়ে নিতে চান?')) {
      resetExamSchedulesToDefault();
      setExamSchedules(getExamSchedules());
      showToast('সকল পরীক্ষার সময়সূচি ডিফল্ট অবস্থায় ফিরিয়ে আনা হয়েছে।');
    }
  };

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered Exam List
  const filteredExams = useMemo(() => {
    return examSchedules
      .filter((exam) => {
        const matchClass = filterClass === 'all' || exam.className === filterClass;
        const matchType = filterType === 'all' || exam.assessmentType === filterType;
        const remaining = getExamDaysRemaining(exam.examDate);
        const matchStatus =
          filterStatus === 'all' ||
          (filterStatus === 'upcoming' && !remaining.isPast) ||
          (filterStatus === 'completed' && remaining.isPast);

        const q = searchQuery.trim().toLowerCase();
        if (!q) return matchClass && matchType && matchStatus;

        const matchSubject = exam.subject.toLowerCase().includes(q);
        const matchTitle = exam.examTitle.toLowerCase().includes(q);
        const matchTeacher = exam.examinerTeacherNameBn.toLowerCase().includes(q);
        const matchSyllabus = exam.syllabusTopics.toLowerCase().includes(q);
        const matchRoom = exam.room.toLowerCase().includes(q);

        return (
          matchClass &&
          matchType &&
          matchStatus &&
          (matchSubject || matchTitle || matchTeacher || matchSyllabus || matchRoom)
        );
      })
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
  }, [examSchedules, filterClass, filterType, filterStatus, searchQuery]);

  // Overall Statistics
  const totalExamsCount = examSchedules.length;
  const currentClassExamsCount = examSchedules.filter(
    (e) => filterClass === 'all' || e.className === filterClass
  ).length;
  const upcomingExamsCount = examSchedules.filter((e) => !getExamDaysRemaining(e.examDate).isPast).length;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. EXAM SCHEDULE HERO BANNER & STATS (Screen only)                       */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-purple-400 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-0.5 rounded-full text-xs font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ক্লাস রুটিন মডিউল · পরীক্ষার সময়সূচি (Exam Schedule Tab)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                শ্রেণিভিত্তিক পরীক্ষার তারিখ ও মূল্যায়ন সময়সূচি
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl leading-relaxed">
                শিক্ষকগণ প্রতিটি শ্রেণির জন্য আসন্ন মূল্যায়ন পরীক্ষার তারিখ, বিষয়, সময়, রুম ও সিলেবাস ইনপুট দিতে পারেন।
                অভিভাবক ও শিক্ষার্থীরা সহজে পরীক্ষার প্রস্তুতি গ্রহণ ও প্রিন্টযোগ্য রুটিন সংগ্রহ করতে পারেন।
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {canEdit && (
              <button
                type="button"
                onClick={() => handleOpenAddModal()}
                className="px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>পরীক্ষার তারিখ যুক্ত করুন (Input)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer border border-white/20"
              title="পরীক্ষার রুটিন শিট প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
              <span>রুটিন প্রিন্ট</span>
            </button>

            <button
              type="button"
              onClick={() => downloadExamScheduleCsv(filteredExams)}
              className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer border border-white/20"
              title="CSV ফাইল হিসেবে ডাউনলোড করুন"
            >
              <Download className="w-4 h-4" />
              <span>CSV এক্সপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-indigo-100">
              মোট নির্ধারিত পরীক্ষা: <strong>{toBengaliNumber(totalExamsCount)}</strong> টি
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-indigo-100">
              আসন্ন মূল্যায়ন: <strong>{toBengaliNumber(upcomingExamsCount)}</strong> টি
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-indigo-100">
              বর্তমান ফিল্টারে: <strong>{toBengaliNumber(currentClassExamsCount)}</strong> টি
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-amber-300 font-bold">শিক্ষকদের ইনপুট ও এডিট সুবিধা সক্রিয়</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CLASS SWITCHER & FILTER TOOLBAR (Screen only)                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4 print:hidden">
        {/* Class Selection Pills */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-purple-700" />
              <span>শ্রেণি নির্বাচন করুন:</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setFilterClass('all');
                if (onSelectClass) onSelectClass('Nursery');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                filterClass === 'all'
                  ? 'bg-purple-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>সকল শ্রেণি</span>
              <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.2 rounded-full">
                {toBengaliNumber(examSchedules.length)}
              </span>
            </button>

            {CLASS_OPTIONS.map((cls) => {
              const count = examSchedules.filter((e) => e.className === cls.id).length;
              const isSelected = filterClass === cls.id;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => {
                    setFilterClass(cls.id);
                    if (onSelectClass) onSelectClass(cls.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-purple-800 text-white border-purple-900 shadow-2xs ring-2 ring-purple-400/30'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{cls.nameBn}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {toBengaliNumber(count)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Format Toggle: Cards vs Table */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewFormat('cards')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewFormat === 'cards'
                  ? 'bg-purple-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>কার্ড ভিউ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewFormat('table')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewFormat === 'table'
                  ? 'bg-purple-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>রুটিন শিট (টেবিল)</span>
            </button>
          </div>
        </div>

        {/* Search & Secondary Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            {/* Search Input */}
            <div className="relative min-w-[220px] sm:min-w-[280px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বিষয়, সিলেবাস বা শিক্ষকের নাম দিয়ে খুঁজুন..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-purple-600"
              />
            </div>

            {/* Assessment Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">ধরন:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-purple-600 cursor-pointer"
              >
                <option value="all">সকল ধরন</option>
                <option value="written">📝 লিখিত</option>
                <option value="oral">🗣️ মৌখিক ও ছড়া</option>
                <option value="practical_activity">🧩 ব্যবহারিক</option>
                <option value="creative_drawing">🎨 অঙ্কন ও ক্রাফট</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">অবস্থা:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-purple-600 cursor-pointer"
              >
                <option value="all">সব পরীক্ষা</option>
                <option value="upcoming">⏳ শুধুমাত্র আসন্ন</option>
                <option value="completed">✓ সম্পন্ন</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 self-end md:self-center">
            <span>
              প্রদর্শিত হচ্ছে: <strong>{toBengaliNumber(filteredExams.length)}</strong> টি পরীক্ষা
            </span>
            {currentRole === 'super_admin' && (
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
                title="ডিফল্ট পরীক্ষার তালিকায় রিসেট করুন"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. EXAM SCHEDULE CONTENT: CARDS VIEW OR PRINTABLE ROUTINE SHEET          */}
      {/* ========================================================================= */}
      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 text-slate-500 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">কোনো পরীক্ষার সূচি পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            আপনার নির্বাচিত ফিল্টারে কোনো পরীক্ষা নির্ধারিত নেই। উপরে &apos;পরীক্ষার তারিখ যুক্ত করুন&apos; বাটনে ক্লিক করে নতুন মূল্যায়ন যোগ করুন।
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="mt-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              ➕ নতুন পরীক্ষার তারিখ ইনপুট দিন
            </button>
          )}
        </div>
      ) : viewFormat === 'cards' ? (
        /* ======================================================================= */
        /* CARDS GRID VIEW                                                         */
        /* ======================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 print:grid-cols-2 print:gap-4">
          {filteredExams.map((exam) => {
            const daysInfo = getExamDaysRemaining(exam.examDate);
            return (
              <div
                key={exam.id}
                className="print-avoid-break break-inside-avoid bg-white rounded-3xl border-2 border-slate-200/90 hover:border-purple-300 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Top Badge Row */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                      {getSchoolClassNameBn(exam.className)}
                    </span>

                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        daysInfo.isToday
                          ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                          : daysInfo.isPast
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {daysInfo.labelBn}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block truncate">
                      {exam.examTitle}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5 leading-snug">
                      {exam.subject}
                    </h3>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs text-purple-800 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200/70 font-semibold">
                    <span>{getAssessmentTypeLabelBn(exam.assessmentType)}</span>
                  </div>
                </div>

                {/* Date, Time & Location Specs */}
                <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-purple-700" />
                      তারিখ ও বার:
                    </span>
                    <strong className="text-slate-900 font-bold">
                      {exam.examDateBn || exam.examDate} ({exam.dayNameBn})
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-700" />
                      সময় ও ব্যাপ্তি:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {exam.startTime} - {exam.endTime} ({toBengaliNumber(exam.durationMinutes)} মি.)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      পরীক্ষার রুম:
                    </span>
                    <span className="font-bold text-emerald-900">{exam.room}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
                    <span className="text-slate-500 font-medium">পূর্ণমান ও পাস:</span>
                    <span className="font-mono font-bold text-slate-900">
                      পূর্ণমান: {toBengaliNumber(exam.totalMarks)} | পাস: {toBengaliNumber(exam.passMarks || 20)}
                    </span>
                  </div>
                </div>

                {/* Syllabus Box */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-purple-600" />
                    <span>সিলেবাস ও পরীক্ষার পাঠ্যক্রম:</span>
                  </span>
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                    {exam.syllabusTopics}
                  </p>
                </div>

                {/* Instructions & Teacher Examiner */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block">পরিদর্শক শিক্ষক:</span>
                    <span className="font-bold text-slate-800 truncate block">
                      👩‍🏫 {exam.examinerTeacherNameBn}
                    </span>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1 shrink-0 print:hidden">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(exam)}
                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-purple-50 text-purple-700 transition cursor-pointer"
                        title="পরীক্ষার তথ্য এডিট করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExam(exam.id, exam.subject)}
                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-700 transition cursor-pointer"
                        title="মুছে ফেলুন"
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
      ) : (
        /* ======================================================================= */
        /* PRINTABLE TABLE / ROUTINE SHEET VIEW                                   */
        /* ======================================================================= */
        <div className="print-avoid-break break-inside-avoid bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header for Routine Sheet (Displays on print too) */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-800 to-indigo-900 text-white text-center border-b-2 border-amber-400">
            <h3 className="font-black text-base sm:text-lg">আনন্দ পাঠশালা কিন্ডারগার্টেন · কুষ্টিয়া</h3>
            <p className="text-xs text-amber-300 font-medium mt-0.5">
              অফিশিয়াল পরীক্ষার সময়সূচি ও মূল্যায়ন রুটিন শিট · শিক্ষাবর্ষ ২০২৬
            </p>
            <div className="inline-block bg-white/20 px-3 py-0.5 rounded-full text-[11px] font-bold mt-2">
              শ্রেণি: {filterClass === 'all' ? 'সকল শ্রেণি' : getSchoolClassNameBn(filterClass)}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-black">
                  <th className="py-3 px-4">তারিখ ও বার</th>
                  <th className="py-3 px-4">শ্রেণি</th>
                  <th className="py-3 px-4">বিষয় ও মূল্যায়ন</th>
                  <th className="py-3 px-4">ধরন</th>
                  <th className="py-3 px-4">সময় ও রুম</th>
                  <th className="py-3 px-4">পূর্ণমান</th>
                  <th className="py-3 px-4">সিলেবাস</th>
                  <th className="py-3 px-4">পরিদর্শক</th>
                  {canEdit && <th className="py-3 px-4 print:hidden text-center">অ্যাকশন</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {exam.examDateBn || exam.examDate}
                      <span className="block text-[10px] text-purple-700 font-normal">
                        ({exam.dayNameBn})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">
                        {getSchoolClassNameBn(exam.className)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900 max-w-[160px]">
                      {exam.subject}
                      <span className="block text-[10px] font-normal text-slate-500 truncate">
                        {exam.examTitle}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {getAssessmentTypeLabelBn(exam.assessmentType)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-800">
                        {exam.startTime} - {exam.endTime}
                      </span>
                      <span className="block text-[10px] text-emerald-800 font-semibold">
                        {exam.room}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {toBengaliNumber(exam.totalMarks)}
                      <span className="text-[10px] text-slate-500 font-normal block">
                        পাস: {toBengaliNumber(exam.passMarks || 20)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[220px] text-[11px] leading-relaxed">
                      {exam.syllabusTopics}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {exam.examinerTeacherNameBn}
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 print:hidden text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(exam)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-purple-50 text-purple-700 transition"
                            title="এডিট করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExam(exam.id, exam.subject)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-700 transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Routine Sheet Signatures on Print */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-end justify-between text-xs">
            <div className="text-slate-500">
              <span>আনন্দ পাঠশালা কিন্ডারগার্টেন পরীক্ষা নিয়ন্ত্রণ শাখা</span>
              <span className="block text-[10px]">কোর্টপাড়া, কুষ্টিয়া-৭০০০ · ০১৯১৪-০৫৭৫১১</span>
            </div>

            <div className="text-center">
              <div className="w-28 border-b border-dashed border-slate-400 pb-1 mb-1">
                <span className="font-serif italic font-bold text-emerald-900">Habibur R.</span>
              </div>
              <span className="text-slate-600 font-bold block text-[10px]">অধ্যক্ষ / পরীক্ষা নিয়ন্ত্রক</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: TEACHER INPUT FOR UPCOMING ASSESSMENT DATES                     */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col space-y-0">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-800 to-indigo-800 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {editingExamId ? 'পরীক্ষার সময়সূচি সংশোধন করুন' : 'নতুন পরীক্ষার সময়সূচি ইনপুট দিন'}
                  </h3>
                  <p className="text-xs text-purple-200">
                    শিক্ষক পোর্টাল মূল্যায়ন ও পরীক্ষার তারিখ এন্ট্রি
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveExam} className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Quick Template Picker for Subjects */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>দ্রুত বিষয় নির্বাচন (টেমপ্লেট):</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {STANDARD_SUBJECT_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, subject: tmpl }))}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                        formData.subject === tmpl
                          ? 'bg-purple-100 text-purple-900 border-purple-400'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class & Exam Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">শ্রেণি নির্ধারণ *</label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value as SchoolClass })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
                  >
                    {CLASS_OPTIONS.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.nameBn} ({getSchoolClassNameBn(cls.id)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">পরীক্ষার নাম / শিরোনাম *</label>
                  <input
                    type="text"
                    value={formData.examTitle}
                    onChange={(e) => setFormData({ ...formData, examTitle: e.target.value })}
                    placeholder="যেমন: বার্ষিক মূল্যায়ন ২০২৬"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-purple-600"
                    required
                  />
                </div>
              </div>

              {/* Subject & Assessment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">পরীক্ষার বিষয় *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="যেমন: বাংলা ও ছড়া"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">মূল্যায়ন পরীক্ষার ধরন *</label>
                  <select
                    value={formData.assessmentType}
                    onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value as AssessmentType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
                  >
                    <option value="written">📝 লিখিত পরীক্ষা (Written)</option>
                    <option value="oral">🗣️ মৌখিক ও ছড়া মূল্যায়ন (Oral)</option>
                    <option value="practical_activity">🧩 ব্যবহারিক ও অ্যাক্টিভিটি (Practical)</option>
                    <option value="creative_drawing">🎨 অঙ্কন ও সৃজনশীল ক্রাফট (Art)</option>
                  </select>
                </div>
              </div>

              {/* Date & Weekday */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">পরীক্ষার তারিখ (Date) *</label>
                  <input
                    type="date"
                    value={formData.examDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">বার (Weekday - স্বয়ংক্রিয়)</label>
                  <input
                    type="text"
                    value={formData.dayNameBn}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-purple-900 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Time Slot & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">শুরুর সময়</label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="০৯:৩০ AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">শেষের সময়</label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="১১:০০ AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">রুম নম্বর / হল</label>
                  <select
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
                  >
                    {Object.values(CLASS_ROOMS).map((r, idx) => (
                      <option key={idx} value={r}>
                        {r}
                      </option>
                    ))}
                    <option value="প্লে-জোন হল রুম">প্লে-জোন হল রুম</option>
                    <option value="আর্ট অ্যান্ড ক্রাফট জোন">আর্ট অ্যান্ড ক্রাফট জোন</option>
                  </select>
                </div>
              </div>

              {/* Total Marks & Pass Marks & Examiner Teacher */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">পূর্ণমান (Marks)</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">পাস মার্ক</label>
                  <input
                    type="number"
                    value={formData.passMarks}
                    onChange={(e) => setFormData({ ...formData, passMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">পরিদর্শক শিক্ষক</label>
                  <select
                    value={formData.examinerTeacherNameBn}
                    onChange={(e) => setFormData({ ...formData, examinerTeacherNameBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
                  >
                    {SCHOOL_TEACHERS.map((t) => (
                      <option key={t.id} value={t.nameBn}>
                        {t.nameBn} ({t.designationBn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Syllabus Topics */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">সিলেবাস ও পাঠ্যক্রমের বিষয়বস্তু *</label>
                <textarea
                  value={formData.syllabusTopics}
                  onChange={(e) => setFormData({ ...formData, syllabusTopics: e.target.value })}
                  placeholder="পরীক্ষায় কোন কোন অধ্যায় বা বিষয় থাকবে তা লিখুন..."
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-purple-600 resize-none"
                  required
                />
              </div>

              {/* Special Instructions */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">অভিভাবক ও শিক্ষার্থীদের জন্য নির্দেশনা</label>
                <textarea
                  value={formData.instructionsBn}
                  onChange={(e) => setFormData({ ...formData, instructionsBn: e.target.value })}
                  placeholder="যেমন: জ্যামিতি বক্স, রং পেন্সিল সঙ্গে আনতে হবে..."
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-purple-600 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-black rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingExamId ? 'সংরক্ষণ ও আপডেট করুন' : 'পরীক্ষার সূচি যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
