import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  SchoolClass,
  UserRole,
  SkillAssessment,
  SkillCriterion,
} from '../types/school';
import {
  getSchoolClassNameBn,
  calculateHolisticGrade,
  toBengaliNumber,
} from '../utils/schoolLogic';
import { INITIAL_SKILL_ASSESSMENTS } from '../data/mockData';
import {
  Printer,
  Download,
  X,
  Award,
  Star,
  Heart,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Phone,
  ChevronLeft,
  ChevronRight,
  FileText,
  Baby,
  ShieldCheck,
  Search,
  Filter,
  Check,
  Smile,
  GraduationCap,
} from 'lucide-react';

interface StudentProgressCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialStudentId?: string;
  initialClass?: SchoolClass | 'all';
  assessments?: Record<string, SkillAssessment>;
  currentRole?: UserRole;
  onNavigateTab?: (tab: string) => void;
}

/**
 * Generates a realistic fallback assessment if not present in storage/mockData
 */
function getStudentAssessment(
  student: Student,
  assessments?: Record<string, SkillAssessment>
): SkillAssessment {
  if (assessments && assessments[student.id]) {
    return assessments[student.id];
  }
  if (INITIAL_SKILL_ASSESSMENTS[student.id]) {
    return INITIAL_SKILL_ASSESSMENTS[student.id];
  }

  const rollNumber = parseInt(student.rollNo, 10) || 1;
  const baseScore = rollNumber % 2 === 0 ? 5 : 4;

  const defaultSkills: SkillCriterion[] = [
    {
      category: 'social_emotional',
      categoryTitleBn: '১. সামাজিক ও আবেগীয় মেলবন্ধন (Social & Emotional Growth)',
      score: 5,
      descriptionBn: 'খেলনা শেয়ার করা, সহপাঠীকে সাহায্য করা ও দলবদ্ধ খেলা',
      observationBn: `${student.nameBn} সহপাঠীদের সাথে সবসময় অমায়িক ও হাসিখুশি আচরণ বজায় রাখে। যেকোনো খেলায় দলগত মনোভাব প্রশংসনীয়।`,
    },
    {
      category: 'fine_motor',
      categoryTitleBn: '২. সূক্ষ্ম মোটর স্কিল ও কর্মদক্ষতা (Fine Motor Coordination)',
      score: baseScore,
      descriptionBn: 'ক্রেয়ন সঠিকভাবে গ্রিপ করা, কাঁচি/কাগজ ক্রাফট ও পাজল মেলানো',
      observationBn: 'আঙুল দিয়ে সূক্ষ্ম বস্তু নিখুঁতভাবে ধরতে পারে এবং ড্রয়িং ও ক্রাফটিংয়ে চমৎকার পরিচ্ছন্নতা দেখায়।',
    },
    {
      category: 'gross_motor',
      categoryTitleBn: '৩. স্থূল শারীরিক মোটর স্কিল (Gross Motor & Agility)',
      score: 5,
      descriptionBn: 'শারীরিক ব্যালান্স, দৌড়ঝাঁপ ও খেলার মাঠে সক্রিয় অংশগ্রহণ',
      observationBn: 'প্রতিদিনের পিটি, ইয়োগা ও ফ্রি-প্লে সেশনে দুর্দান্ত প্রাণচাঞ্চল্য ও শারীরিক সমন্বয় প্রদর্শন করে।',
    },
    {
      category: 'language_rhymes',
      categoryTitleBn: '৪. ভাষা, ছড়া ও শব্দভাণ্ডার (Language, Speech & Rhymes)',
      score: 5,
      descriptionBn: 'স্পষ্ট উচ্চারণে কথা বলা ও ছড়া মনে রেখে সুন্দর অভিনয় করা',
      observationBn: 'বাংলা ও ইংরেজি সাধারণ ছড়া সুন্দর অঙ্গভঙ্গিমার সাথে স্পষ্ট উচ্চারণে আবৃত্তি করতে পারে।',
    },
    {
      category: 'creativity_art',
      categoryTitleBn: '৫. সৃজনশীলতা ও চিত্রাঙ্কন (Creativity & Art)',
      score: baseScore,
      descriptionBn: 'রঙের সীমানা মেনে ড্রয়িং করা ও ক্লে দিয়ে নতুন অবয়ব তৈরি',
      observationBn: 'উজ্জ্বল রঙের চমৎকার সংমিশ্রণ করতে ভালোবাসে এবং মুক্ত চিন্তায় নতুন কিছু তৈরি করতে আগ্রহী।',
    },
    {
      category: 'curiosity_cognition',
      categoryTitleBn: '৬. কৌতূহল, শৃঙ্খলা ও প্রাথমিক বোধ (Curiosity & Early Math)',
      score: 5,
      descriptionBn: 'নতুন বিষয় জানার আগ্রহ, নিয়ম মেনে চলা ও সংখ্যা গণনা',
      observationBn: 'ক্লাসে অত্যন্ত মনোযোগী, শিক্ষকের নির্দেশনা নিয়ম মেনে অনুসরণ করে এবং যৌক্তিক প্রশ্ন করে।',
    },
  ];

  return {
    id: `ska-${student.id}`,
    studentId: student.id,
    studentNameBn: student.nameBn,
    className: student.className,
    termBn: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Holistic Evaluation)',
    evaluationDate: 'নভেম্বর ২০২৬',
    growth: {
      heightCm: 94.5 + (rollNumber % 5) * 0.8,
      weightKg: 14.2 + (rollNumber % 4) * 0.6,
      bmiStatusBn: 'আদর্শ ও সুঠাম বৃদ্ধি (Healthy & On-Track)',
      milestoneBn: 'বয়সোচিত শারীরিক ও মানসিক বিকাশে সম্পূর্ণ স্বাভাবিক ও চটপটে',
    },
    overallBadgeBn: '🌟 নক্ষত্র প্রতিভা (Star Explorer)',
    teacherRemarksBn: `${student.nameBn} ক্লাসরুমের এক উজ্জ্বল ও প্রিয় মুখ। শিক্ষকের প্রতি বিনয়ী ও সহপাঠীদের প্রতি স্নেহশীল। নিয়মিত উপস্থিতি ও পাঠদানে স্বতঃস্ফূর্ত অংশগ্রহণ অত্যন্ত প্রশংসনীয়।`,
    principalRemarksBn: 'আনন্দ পাঠশালায় শিশুর সার্বিক মানসিক ও শারীরিক বিকাশ খুবই সন্তোষজনক। আগামী দিনের জন্য অফুরন্ত শুভকামনা।',
    skills: defaultSkills,
  };
}

export const StudentProgressCardModal: React.FC<StudentProgressCardModalProps> = ({
  isOpen,
  onClose,
  students,
  initialStudentId,
  initialClass = 'all',
  assessments,
  currentRole,
  onNavigateTab,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || ''
  );
  const [selectedClassFilter, setSelectedClassFilter] = useState<SchoolClass | 'all'>(initialClass);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [isCopiedSuccess, setIsCopiedSuccess] = useState(false);

  // Sync initial student whenever modal opens or props change
  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
      const matched = students.find((s) => s.id === initialStudentId);
      if (matched && initialClass === 'all') {
        setSelectedClassFilter(matched.className);
      }
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [initialStudentId, isOpen, students]);

  // Filter students for the switcher
  const filteredStudents = useMemo(() => {
    return students.filter((std) => {
      const matchClass =
        selectedClassFilter === 'all' || std.className === selectedClassFilter;
      const q = studentSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        std.nameBn.toLowerCase().includes(q) ||
        std.nameEn.toLowerCase().includes(q) ||
        std.rollNo.includes(q) ||
        std.id.toLowerCase().includes(q);
      return matchClass && matchSearch;
    });
  }, [students, selectedClassFilter, studentSearchQuery]);

  const currentStudent = useMemo(() => {
    return (
      students.find((s) => s.id === selectedStudentId) ||
      filteredStudents[0] ||
      students[0]
    );
  }, [students, selectedStudentId, filteredStudents]);

  const assessment = useMemo(() => {
    if (!currentStudent) return null;
    return getStudentAssessment(currentStudent, assessments);
  }, [currentStudent, assessments]);

  const holisticMeta = useMemo(() => {
    if (!assessment) {
      return {
        averageScore: 5.0,
        badgeBn: '🌟 নক্ষত্র প্রতিভা',
        badgeEn: 'Star Explorer',
        summaryFeedbackBn: 'চমৎকার সার্বিক অগ্রগতি',
      };
    }
    return calculateHolisticGrade(assessment.skills);
  }, [assessment]);

  if (!isOpen || !currentStudent || !assessment) return null;

  /**
   * Triggers the high-fidelity native print-out dialog
   * Sets custom page title so Chrome/Edge default filename is nicely formatted as PDF
   */
  const handlePrintOrDownloadPdf = () => {
    const originalTitle = document.title;
    const sanitizedStudentName = currentStudent.nameEn.replace(/\s+/g, '_');
    const filename = `Ananda_Pathshala_Progress_Card_${sanitizedStudentName}_Roll_${currentStudent.rollNo}_2026`;
    document.title = filename;

    window.print();

    // Restore title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 1200);
  };

  // Helper to switch student
  const currentIndex = filteredStudents.findIndex((s) => s.id === currentStudent.id);
  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      setSelectedStudentId(filteredStudents[currentIndex - 1].id);
    }
  };
  const handleNextStudent = () => {
    if (currentIndex < filteredStudents.length - 1) {
      setSelectedStudentId(filteredStudents[currentIndex + 1].id);
    }
  };

  // Primary pickup guardian info
  const primaryGuardian =
    currentStudent.authorizedPickups?.find((p) => p.isPrimary) ||
    currentStudent.authorizedPickups?.[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-100 rounded-3xl max-w-4xl w-full p-4 sm:p-6 space-y-4 shadow-2xl border border-slate-300 my-4 max-h-[96vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:max-h-none print:w-full print:bg-white"
      >
        {/* ========================================================================= */}
        {/* SCREEN ONLY HEADER & ACTION CONTROLS (Hidden during printing)             */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 shrink-0 print:hidden no-print">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  স্কিল ও আচরণগত প্রগ্রেস রিপোর্ট কার্ড
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  বার্ষিক ২০২৬
                </span>
              </div>
              <p className="text-xs text-slate-500">
                A4 স্ট্যান্ডার্ড প্রিন্ট-ফ্রেন্ডলি ফরম্যাট · ব্রাউজার দিয়ে সরাসরি প্রিন্ট অথবা PDF সংরক্ষণ করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Download / Print PDF Button */}
            <button
              type="button"
              onClick={handlePrintOrDownloadPdf}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              title="প্রিন্টার ডায়ালগ ওপেন করুন অথবা 'Save as PDF' নির্বাচন করে সরাসরি ডাউনলোড করুন"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>ডাউনলোড / প্রিন্ট PDF</span>
            </button>

            {/* Quick Print Button */}
            <button
              type="button"
              onClick={handlePrintOrDownloadPdf}
              className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
              title="প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition cursor-pointer"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCREEN-ONLY TOOLBAR: STUDENT SELECTOR, CLASS FILTER & NAVIGATION         */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs print:hidden no-print shrink-0 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[280px]">
            {/* Class Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedClassFilter}
                onChange={(e) => {
                  const val = e.target.value as SchoolClass | 'all';
                  setSelectedClassFilter(val);
                  const matched = students.find((s) => val === 'all' || s.className === val);
                  if (matched) setSelectedStudentId(matched.id);
                }}
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">সকল শ্রেণি ({students.length})</option>
                <option value="HateKhori">হাতেখড়ি (Pre-Play)</option>
                <option value="Play">প্লে (Playgroup)</option>
                <option value="Nursery">নার্সারি (Nursery)</option>
                <option value="KG">কেজি (KG)</option>
                <option value="Class-1">১ম শ্রেণি (Class 1)</option>
                <option value="Class-2">২য় শ্রেণি (Class 2)</option>
              </select>
            </div>

            {/* Student Search & Select Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={currentStudent.id}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent font-bold text-slate-900 w-full focus:outline-hidden cursor-pointer"
              >
                {filteredStudents.map((std) => (
                  <option key={std.id} value={std.id}>
                    রোল {std.rollNo}: {std.nameBn} ({getSchoolClassNameBn(std.className)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prev / Next Switcher */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handlePrevStudent}
              disabled={currentIndex <= 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="পূর্ববর্তী শিক্ষার্থী"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-600 font-bold">
              {currentIndex + 1} / {filteredStudents.length}
            </span>
            <button
              type="button"
              onClick={handleNextStudent}
              disabled={currentIndex >= filteredStudents.length - 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="পরবর্তী শিক্ষার্থী"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRINTABLE PROGRESS CARD CANVAS (A4 Portrait Layout with print utilities)  */}
        {/* ========================================================================= */}
        <div className="overflow-y-auto flex-1 pr-1 print:overflow-visible print:p-0 print:m-0 print:w-full">
          <div
            id="student-progress-card-canvas"
            className="bg-white rounded-2xl border-4 border-double border-amber-400 p-5 sm:p-7 space-y-5 shadow-sm print:border-2 print:border-amber-600 print:shadow-none print:p-6 print:m-0 print:rounded-none print:w-full break-inside-avoid print-avoid-break"
            style={{
              fontFamily: "'Ruhul Amin', 'Ruhul Amin Unicode', 'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
            }}
          >
            {/* ===================================================================== */}
            {/* 1. OFFICIAL CREST & INSTITUTION HEADER                                 */}
            {/* ===================================================================== */}
            <div className="text-center relative border-b-2 border-amber-300 pb-4 space-y-1">
              <div className="flex items-center justify-center gap-3.5 mb-1.5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 border-2 border-emerald-400 shadow-xs overflow-hidden shrink-0 print:shadow-none print:border-emerald-600">
                  <img
                    src="/assets/fb/logo.jpg"
                    alt="আনন্দ পাঠশালা লোগো"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                    আনন্দ পাঠশালা
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-800 font-extrabold uppercase tracking-wide mt-0.5">
                    ANANDA PATHSHALA · কিন্ডারগার্টেন ও প্রি-স্কুল
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 leading-tight">
                    ২২, পূর্ণ চন্দ্র লাহিড়ী লেন, গোশালা, কোর্টপাড়া, কুষ্টিয়া · হটলাইন: ০১৯১৪-০৫৭৫১১
                  </p>
                </div>
              </div>

              {/* Title Badge Strip */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 via-teal-700 to-amber-600 text-white px-5 py-1.5 rounded-full text-xs font-black shadow-xs print:bg-emerald-800 print:text-white print:border print:border-emerald-900 print:shadow-none">
                <Award className="w-3.5 h-3.5 text-amber-200" />
                <span>শিশুর সার্বিক বিকাশ ও আচরণগত প্রগ্রেস কার্ড — ২০২৬</span>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 2. STUDENT DEMOGRAPHICS & PROFILE STRIP                                */}
            {/* ===================================================================== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-xs print:bg-amber-50/50 print:border-slate-300">
              <div className="flex items-start gap-2.5 col-span-2 sm:col-span-1">
                <div className="w-11 h-11 rounded-xl bg-white border border-amber-300 overflow-hidden shrink-0 shadow-2xs">
                  <img
                    src={currentStudent.photoUrl || '/assets/biddalay/student_hasin.jpg'}
                    alt={currentStudent.nameBn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-slate-500 text-[10px] block font-medium">শিক্ষার্থীর নাম:</span>
                  <span className="font-black text-slate-950 text-sm truncate block">
                    {currentStudent.nameBn}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium truncate block font-mono">
                    {currentStudent.nameEn}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block font-medium">শ্রেণি ও শাখা:</span>
                <span className="font-bold text-slate-900 text-xs">
                  {getSchoolClassNameBn(currentStudent.className)}
                </span>
                <span className="text-[11px] text-emerald-800 font-bold block">
                  শাখা: {currentStudent.section || 'শাপলা'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block font-medium">রোল ও স্টুডেন্ট আইডি:</span>
                <span className="font-black text-slate-900 font-mono text-sm">
                  রোল #{currentStudent.rollNo}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  ID: {currentStudent.id}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block font-medium">অভিভাবক ও যোগাযোগ:</span>
                <span className="font-bold text-slate-900 text-xs truncate block">
                  {primaryGuardian?.nameBn || currentStudent.fatherNameBn || currentStudent.motherNameBn || 'অভিভাবক'}
                </span>
                <span className="text-[10px] text-slate-600 font-mono block">
                  {primaryGuardian?.phone || currentStudent.emergencyPhone || '০১৯১৪-০৫৭৫১১'}
                </span>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 3. CORE DEVELOPMENTAL & BEHAVIORAL DIMENSIONS TABLE                   */}
            {/* ===================================================================== */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>সামগ্রিক বিকাশ ও আচরণগত মূল্যায়নের ক্ষেত্রসমূহ (Developmental Dimensions)</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-semibold">
                  সর্বোচ্চ রেটিং: ৫ স্টার (★★★★★)
                </span>
              </div>

              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-amber-300 bg-amber-100/70 text-slate-900 font-black print:bg-slate-100">
                      <th className="py-2 px-3 w-1/3">মূল্যায়ন ক্ষেত্র ও আচরণগত দক্ষতা</th>
                      <th className="py-2 px-2 text-center w-28">স্টার রেটিং (Rating)</th>
                      <th className="py-2 px-3">শ্রেণি শিক্ষকের পর্যবেক্ষণ ও আচরণগত মন্তব্য</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {assessment.skills.map((c, idx) => {
                      const starsEarned = '★'.repeat(c.score);
                      const starsEmpty = '☆'.repeat(5 - c.score);
                      const isTopScore = c.score === 5;

                      return (
                        <tr
                          key={c.category || idx}
                          className={`hover:bg-amber-50/40 print:hover:bg-transparent ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50 print:bg-white'
                          } break-inside-avoid print-avoid-break`}
                        >
                          <td className="py-2 px-3 align-top">
                            <span className="font-bold text-slate-900 block leading-tight">
                              {c.categoryTitleBn}
                            </span>
                            <span className="text-[10px] text-slate-500 leading-tight">
                              {c.descriptionBn}
                            </span>
                          </td>

                          <td className="py-2 px-2 text-center align-top whitespace-nowrap">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-amber-500 font-mono text-xs font-black tracking-widest leading-none">
                                {starsEarned}
                                <span className="text-slate-300">{starsEmpty}</span>
                              </span>
                              <span
                                className={`text-[10px] font-bold mt-1 px-1.5 py-0.2 rounded-md ${
                                  isTopScore
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : 'bg-amber-100 text-amber-900'
                                } print:border print:border-slate-300`}
                              >
                                {toBengaliNumber(c.score)} / ৫.০ ({isTopScore ? 'অসাধারণ' : 'উত্তম'})
                              </span>
                            </div>
                          </td>

                          <td className="py-2 px-3 text-slate-700 text-[11px] leading-relaxed align-top">
                            {c.observationBn}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 4. HEALTH, PHYSICAL GROWTH & OVERALL RECOGNITION                      */}
            {/* ===================================================================== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs print:bg-white print:border-slate-300 break-inside-avoid print-avoid-break">
              <div>
                <span className="text-slate-400 text-[10px] block font-medium">উচ্চতা (Height):</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {toBengaliNumber(assessment.growth.heightCm)} সেমি
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block font-medium">ওজন (Weight):</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {toBengaliNumber(assessment.growth.weightKg)} কেজি
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block font-medium">বৃদ্ধি ও বিকাশ স্তর:</span>
                <span className="font-bold text-emerald-800 text-[11px] block leading-tight">
                  {assessment.growth.bmiStatusBn}
                </span>
              </div>

              <div className="border-l border-slate-200 pl-2">
                <span className="text-slate-400 text-[10px] block font-medium">সার্বিক স্বীকৃতি ও ব্যাজ:</span>
                <span className="font-black text-amber-800 text-xs block leading-tight">
                  {assessment.overallBadgeBn || holisticMeta.badgeBn}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  গড় স্কোর: {toBengaliNumber(holisticMeta.averageScore)} / ৫.০
                </span>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 5. FORMAL TEACHER & PRINCIPAL BEHAVIORAL REMARKS                     */}
            {/* ===================================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 break-inside-avoid print-avoid-break">
              {/* Class Teacher's Remarks */}
              <div className="bg-amber-50/40 p-3 rounded-2xl border border-amber-200 text-xs print:bg-white print:border-slate-300">
                <span className="font-black text-slate-900 block mb-1 text-[11px] flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-amber-700" />
                  <span>শ্রেণি শিক্ষকের পর্যবেক্ষণ ও আচরণগত মূল্যায়ন:</span>
                </span>
                <p className="text-slate-700 italic text-[11px] leading-relaxed">
                  "{assessment.teacherRemarksBn}"
                </p>
              </div>

              {/* Principal's Directive */}
              <div className="bg-emerald-50/40 p-3 rounded-2xl border border-emerald-200 text-xs print:bg-white print:border-slate-300">
                <span className="font-black text-slate-900 block mb-1 text-[11px] flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                  <span>অধ্যক্ষ / প্রতিষ্ঠান প্রধানের বাণী:</span>
                </span>
                <p className="text-slate-700 italic text-[11px] leading-relaxed">
                  "{assessment.principalRemarksBn}"
                </p>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 6. OFFICIAL AUTHENTICATION SIGNATURE BLOCKS                           */}
            {/* ===================================================================== */}
            <div className="pt-6 sm:pt-8 grid grid-cols-3 gap-4 text-center text-xs text-slate-700 break-inside-avoid print-avoid-break">
              <div className="border-t-2 border-slate-400 pt-1.5">
                <span className="block font-bold text-slate-900">শ্রেণি শিক্ষকের স্বাক্ষর</span>
                <span className="text-[10px] text-slate-500 block">আনন্দ পাঠশালা ক্যাম্পাস</span>
                <span className="text-[9px] text-slate-400 font-mono">তারিখ: ১৫/১১/২০২৬</span>
              </div>

              <div className="border-t-2 border-slate-400 pt-1.5">
                <span className="block font-bold text-slate-900">অভিভাবকের স্বাক্ষর ও প্রাপ্তিস্বীকার</span>
                <span className="text-[10px] text-slate-500 block">স্বাক্ষর: ..........................</span>
                <span className="text-[9px] text-slate-400 font-mono">তারিখ: ..............</span>
              </div>

              <div className="border-t-2 border-slate-400 pt-1.5 relative">
                {/* Official seal watermark look in print */}
                <div className="absolute -top-6 right-2 sm:right-6 text-[10px] font-bold text-emerald-700 border-2 border-emerald-600 rounded-full w-12 h-12 flex items-center justify-center -rotate-12 opacity-80 pointer-events-none print:opacity-100">
                  <span className="text-center leading-tight text-[8px] font-black">
                    সিলমোহর<br />অফিসিয়াল
                  </span>
                </div>
                <span className="block font-bold text-slate-900">অধ্যক্ষ / প্রিন্সিপাল</span>
                <span className="text-[10px] text-emerald-800 font-bold block">শাফী আব্দুল্লাহ</span>
                <span className="text-[9px] text-slate-500">আনন্দ পাঠশালা, কুষ্টিয়া</span>
              </div>
            </div>

            {/* Print Footer Notice */}
            <div className="text-center pt-2 border-t border-slate-100 text-[9px] text-slate-400 font-mono flex items-center justify-between print:flex">
              <span>অফিসিয়াল একাডেমি রেকর্ড · আনন্দ পাঠশালা কুষ্টিয়া</span>
              <span>মুদ্রণ তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
