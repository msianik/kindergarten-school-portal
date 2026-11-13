import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  SchoolClass,
  UserRole,
  StudentExamResult,
  SubjectMark,
  ExamTerm,
  SchoolProfile,
} from '../types/school';
import {
  getSchoolClassNameBn,
  toBengaliNumber,
} from '../utils/schoolLogic';
import {
  getStoredExamResults,
  getStoredExamTerms,
  updateStudentExamResult,
  toggleExamPublishStatus,
  resetExamResultsToDefault,
  exportClassResultsCsv,
  calculateSubjectGrade,
  calculateOverallResult,
  EXAM_RESULTS_UPDATE_EVENT,
} from '../utils/examResultLogic';
import { StudentReportCardModal } from './StudentReportCardModal';
import {
  Award,
  Search,
  Filter,
  Printer,
  Download,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  Trophy,
  Users,
  Check,
  X,
  Plus,
  BookOpen,
  Calendar,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface ExamResultsModuleProps {
  students: Student[];
  currentRole: UserRole;
  schoolProfile?: SchoolProfile;
  initialClass?: SchoolClass;
  loggedInStudentId?: string; // If parent is logged in
}

const CLASS_ITEMS: { id: SchoolClass; nameBn: string; color: string; badgeBg: string }[] = [
  { id: 'HateKhori', nameBn: 'হাতেখড়ি', color: 'border-pink-300 text-pink-700 bg-pink-50', badgeBg: 'bg-pink-600' },
  { id: 'Play', nameBn: 'প্লে', color: 'border-emerald-300 text-emerald-700 bg-emerald-50', badgeBg: 'bg-emerald-600' },
  { id: 'Nursery', nameBn: 'নার্সারি', color: 'border-teal-300 text-teal-700 bg-teal-50', badgeBg: 'bg-teal-600' },
  { id: 'KG', nameBn: 'কেজি', color: 'border-amber-300 text-amber-700 bg-amber-50', badgeBg: 'bg-amber-600' },
  { id: 'Class-1', nameBn: 'ওয়ান', color: 'border-indigo-300 text-indigo-700 bg-indigo-50', badgeBg: 'bg-indigo-600' },
  { id: 'Class-2', nameBn: 'টু', color: 'border-purple-300 text-purple-700 bg-purple-50', badgeBg: 'bg-purple-600' },
];

export const ExamResultsModule: React.FC<ExamResultsModuleProps> = ({
  students,
  currentRole,
  schoolProfile,
  initialClass = 'Nursery',
  loggedInStudentId,
}) => {
  // Main Data States
  const [examResults, setExamResults] = useState<StudentExamResult[]>(() => getStoredExamResults());
  const [examTerms, setExamTerms] = useState<ExamTerm[]>(() => getStoredExamTerms());
  const [selectedTermId, setSelectedTermId] = useState<string>(
    examTerms[0]?.id || 'term-annual-2026'
  );
  const [selectedClass, setSelectedClass] = useState<SchoolClass>(initialClass);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'top3'>('all');

  // Modals
  const [activeReportStudentId, setActiveReportStudentId] = useState<string | null>(null);
  const [editingStudentResult, setEditingStudentResult] = useState<StudentExamResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canEdit =
    currentRole === 'super_admin' || currentRole === 'principal' || currentRole === 'teacher';

  const isParent = currentRole === 'parent';

  // Listen to Storage Updates
  useEffect(() => {
    const handleUpdate = () => {
      setExamResults(getStoredExamResults());
      setExamTerms(getStoredExamTerms());
    };
    window.addEventListener(EXAM_RESULTS_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(EXAM_RESULTS_UPDATE_EVENT, handleUpdate);
  }, []);

  // Show toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Current active term
  const activeTerm = useMemo(() => {
    return examTerms.find((t) => t.id === selectedTermId) || examTerms[0];
  }, [examTerms, selectedTermId]);

  // Filtered results for the selected class and term
  const classResults = useMemo(() => {
    let list = examResults.filter(
      (r) => r.className === selectedClass && r.examTermId === selectedTermId
    );

    // If logged in as parent, show only their child
    if (isParent && loggedInStudentId) {
      list = list.filter((r) => r.studentId === loggedInStudentId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.studentNameBn.toLowerCase().includes(q) ||
          (r.studentNameEn && r.studentNameEn.toLowerCase().includes(q)) ||
          r.rollNo.includes(q)
      );
    }

    if (statusFilter === 'passed') {
      list = list.filter((r) => r.status === 'passed');
    } else if (statusFilter === 'top3') {
      list = list.filter((r) => r.meritPosition <= 3);
    }

    return list.sort((a, b) => a.meritPosition - b.meritPosition);
  }, [examResults, selectedClass, selectedTermId, isParent, loggedInStudentId, searchQuery, statusFilter]);

  // Class analytics stats
  const classStats = useMemo(() => {
    const allInClass = examResults.filter(
      (r) => r.className === selectedClass && r.examTermId === selectedTermId
    );
    if (allInClass.length === 0) {
      return { total: 0, passRate: 0, avgPercentage: 0, topScorer: null, aPlusCount: 0 };
    }
    const passed = allInClass.filter((r) => r.status === 'passed').length;
    const passRate = Math.round((passed / allInClass.length) * 100);
    const avgPercentage =
      Math.round(
        (allInClass.reduce((sum, r) => sum + r.percentage, 0) / allInClass.length) * 10
      ) / 10;
    const sorted = [...allInClass].sort((a, b) => b.totalObtained - a.totalObtained);
    const topScorer = sorted[0] || null;
    const aPlusCount = allInClass.filter((r) => r.overallGrade === 'A+').length;

    return {
      total: allInClass.length,
      passRate,
      avgPercentage,
      topScorer,
      aPlusCount,
    };
  }, [examResults, selectedClass, selectedTermId]);

  // Handle Publish Toggle
  const handleTogglePublish = () => {
    if (!canEdit || !activeTerm) return;
    const nextState = !activeTerm.isPublished;
    toggleExamPublishStatus(activeTerm.id, nextState);
    setExamTerms(getStoredExamTerms());
    setExamResults(getStoredExamResults());
    showToast(
      nextState
        ? '✓ ফলাফল সফলভাবে প্রকাশিত হয়েছে! অভিভাবকরা এখন দেখতে পারবেন।'
        : '✓ ফলাফল গোপন করা হয়েছে (অপ্রকাশিত)।'
    );
  };

  // Handle CSV Export
  const handleExportCsv = () => {
    exportClassResultsCsv(selectedClass, selectedTermId, examResults);
    showToast('✓ এক্সেল / সিএসভি ফাইল ডাউনলোড শুরু হয়েছে!');
  };

  // Report Card Modal Active Student
  const currentReportResult = useMemo(() => {
    if (!activeReportStudentId) return null;
    return (
      examResults.find(
        (r) => r.studentId === activeReportStudentId && r.examTermId === selectedTermId
      ) || null
    );
  }, [activeReportStudentId, examResults, selectedTermId]);

  // Next/Prev student handlers inside report card modal
  const reportIndex = useMemo(() => {
    if (!activeReportStudentId) return -1;
    return classResults.findIndex((r) => r.studentId === activeReportStudentId);
  }, [activeReportStudentId, classResults]);

  const handleNextReport = () => {
    if (reportIndex >= 0 && reportIndex < classResults.length - 1) {
      setActiveReportStudentId(classResults[reportIndex + 1].studentId);
    }
  };

  const handlePrevReport = () => {
    if (reportIndex > 0) {
      setActiveReportStudentId(classResults[reportIndex - 1].studentId);
    }
  };

  // Student Photo Helper
  const getStudentPhoto = (studentId: string) => {
    const std = students.find((s) => s.id === studentId);
    return std?.photoUrl || undefined;
  };

  // Dedicated Parent View: Shows only their student's results with 3 exam selector tabs
  if (isParent) {
    const parentStudentId = loggedInStudentId || 'std-1';
    const parentStudent = students.find((s) => s.id === parentStudentId) || students[0];
    const parentResult = examResults.find(
      (r) => r.studentId === parentStudentId && r.examTermId === selectedTermId
    );

    return (
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-emerald-500 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Parent Student Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-white/20 shrink-0 flex items-center justify-center">
                {getStudentPhoto(parentStudentId) ? (
                  <img
                    src={getStudentPhoto(parentStudentId)}
                    alt={parentStudent?.nameBn || 'শিক্ষার্থী'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-9 h-9 text-emerald-100" />
                )}
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>অভিভাবক পোর্টাল • একাডেমিক মূল্যায়ন ও ফলাফল</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {parentStudent?.nameBn || parentResult?.studentNameBn || 'আদিত্য রায়'}-এর মার্কশিট
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-emerald-100 font-medium">
                  <span>শ্রেণি: {getSchoolClassNameBn(parentStudent?.className || parentResult?.className || 'Nursery')}</span>
                  <span>•</span>
                  <span>রোল: {toBengaliNumber(parentStudent?.rollNo || parentResult?.rollNo || '১০১')}</span>
                  <span>•</span>
                  <span>শাখা: {parentStudent?.section || parentResult?.sectionBn || 'ক (শাপলা)'}</span>
                  <span>•</span>
                  <span>শিক্ষাবর্ষ: ২০২৬</span>
                </div>
              </div>
            </div>

            {/* Action Button: Print Report Card */}
            {parentResult && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveReportStudentId(parentStudentId)}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-amber-900/30 active:scale-95 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>রিপোর্ট কার্ড প্রিন্ট / সংরক্ষণ</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3 Annual Exam Selector Tabs */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm sm:text-base">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>পরীক্ষা নির্বাচন করুন (বছরে ৩টি মূল্যায়ন):</span>
            </div>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              যেকোনো একটি পরীক্ষায় ক্লিক করে বিস্তারিত মার্কশিট দেখুন
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {examTerms.map((term, idx) => {
              const isSelected = selectedTermId === term.id;
              const examIcons = [
                <BookOpen key="1" className="w-5 h-5" />,
                <TrendingUp key="2" className="w-5 h-5" />,
                <Trophy key="3" className="w-5 h-5" />,
              ];
              const hasResult = examResults.some(
                (r) => r.studentId === parentStudentId && r.examTermId === term.id
              );

              return (
                <button
                  key={term.id}
                  type="button"
                  onClick={() => setSelectedTermId(term.id)}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-700 to-teal-800 text-white border-emerald-600 shadow-lg shadow-emerald-700/20 ring-2 ring-emerald-400/40'
                      : 'bg-slate-50 hover:bg-emerald-50/60 text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2.5 rounded-xl ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                        }`}
                      >
                        {examIcons[idx % 3]}
                      </div>
                      <div>
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                            isSelected ? 'text-amber-300' : 'text-slate-400'
                          }`}
                        >
                          মূল্যায়ন #{toBengaliNumber(idx + 1)}
                        </span>
                        <span className="font-extrabold text-sm sm:text-base block">
                          {term.titleBn.split(' (')[0]}
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 shrink-0">
                        নির্বাচিত
                      </span>
                    ) : hasResult ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                        ফলাফল প্রস্তুত
                      </span>
                    ) : null}
                  </div>

                  <div
                    className={`text-[11px] pt-2 border-t flex items-center justify-between ${
                      isSelected ? 'border-white/20 text-emerald-100' : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    <span>প্রকাশ: {term.publishDateBn}</span>
                    <span>{term.academicYear}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Marksheet Body */}
        {parentResult ? (
          <div className="space-y-6">
            {/* Overall Summary KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Marks */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">প্রাপ্ত মোট নম্বর</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-800">
                    {toBengaliNumber(parentResult.totalObtained)}
                    <span className="text-sm font-semibold text-slate-400">
                      {' '}/ {toBengaliNumber(parentResult.totalMarks)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Percentage */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">শতকরা হার</span>
                  <span className="text-xl sm:text-2xl font-black text-teal-700">
                    {toBengaliNumber(parentResult.percentage)}%
                  </span>
                </div>
              </div>

              {/* GPA & Grade */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">জিপিএ ও গ্রেড</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-600">
                    {toBengaliNumber(parentResult.gpa.toFixed(2))}
                    <span className="text-base font-bold text-slate-700 ml-1">
                      ({parentResult.overallGrade})
                    </span>
                  </span>
                </div>
              </div>

              {/* Merit Position */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">মেধা স্থান ও ফলাফল</span>
                  <span className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                    <span>{toBengaliNumber(parentResult.meritPosition)}ম স্থান</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      উত্তীর্ণ
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Subject-wise Detailed Marks Table */}
            <div className="overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
                    বিষয়ভিত্তিক বিস্তারিত নম্বর ও গ্রেডশিট
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full w-fit">
                  {parentResult.examTitleBn}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="py-3 px-4 text-center w-12">#</th>
                      <th className="py-3 px-4">বিষয়ের নাম</th>
                      <th className="py-3 px-3 text-center">পূর্ণমান</th>
                      <th className="py-3 px-3 text-center">পাস নম্বর</th>
                      <th className="py-3 px-3 text-center">প্রাপ্ত নম্বর</th>
                      <th className="py-3 px-3 text-center">সর্বোচ্চ</th>
                      <th className="py-3 px-3 text-center">লেটার গ্রেড</th>
                      <th className="py-3 px-3 text-center">গ্রেড পয়েন্ট</th>
                      <th className="py-3 px-4">শিক্ষকের মূল্যায়ন ও মন্তব্য</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parentResult.subjects.map((sub, sIdx) => {
                      const gradeMeta = calculateSubjectGrade(sub.obtainedMarks, sub.totalMarks);
                      return (
                        <tr key={sub.subjectCode} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                            {toBengaliNumber(sIdx + 1)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {sub.subjectNameBn}
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-600 font-semibold">
                            {toBengaliNumber(sub.totalMarks)}
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-500 font-medium">
                            {toBengaliNumber(sub.passMarks)}
                          </td>
                          <td className="py-3.5 px-3 text-center font-black text-emerald-700 text-sm sm:text-base">
                            {toBengaliNumber(sub.obtainedMarks)}
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-500 font-semibold">
                            {toBengaliNumber(sub.highestMarksInClass || sub.totalMarks)}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black border ${gradeMeta.badgeBg} ${gradeMeta.badgeText} ${gradeMeta.badgeBorder}`}
                            >
                              {sub.letterGrade}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                            {toBengaliNumber(sub.gradePoint.toFixed(1))}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                            {sub.remarksBn || 'সন্তোষজনক অগ্রগতি'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-emerald-50/50 font-bold border-t-2 border-emerald-200 text-slate-800">
                    <tr>
                      <td colSpan={2} className="py-3.5 px-4 text-emerald-950 font-black">
                        সর্বমোট / সামগ্রিক ফলাফল
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold">
                        {toBengaliNumber(parentResult.totalMarks)}
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-400">-</td>
                      <td className="py-3.5 px-3 text-center font-black text-emerald-800 text-base">
                        {toBengaliNumber(parentResult.totalObtained)}
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-400">-</td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white">
                          {parentResult.overallGrade}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-black text-emerald-800">
                        {toBengaliNumber(parentResult.gpa.toFixed(2))}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-900 font-bold text-xs">
                        শতকরা হার: {toBengaliNumber(parentResult.percentage)}% • উত্তীর্ণ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Co-Curricular & Attendance Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Co-Curricular Skills */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>সহশিক্ষা ও চারিত্রিক মূল্যায়ন</span>
                </div>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-600 font-semibold">নিয়মানুবর্তিতা ও শৃঙ্খলা:</span>
                    <span className="font-bold text-slate-800">
                      {parentResult.coCurricularSkills?.disciplineBn || 'অসাধারণ ও শতভাগ সুশৃঙ্খল'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-600 font-semibold">পরিষ্কার-পরিচ্ছন্নতা:</span>
                    <span className="font-bold text-slate-800">
                      {parentResult.coCurricularSkills?.cleanlinessBn || 'প্রতিদিন পরিপাটি ও স্বাস্থ্যসচেতন'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-600 font-semibold">সহপাঠীদের সাথে সদ্ভাব:</span>
                    <span className="font-bold text-slate-800">
                      {parentResult.coCurricularSkills?.friendlinessBn || 'আন্তরিক ও অমায়িক'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-600 font-semibold">সৃজনশীলতা ও চিত্রাঙ্কন:</span>
                    <span className="font-bold text-slate-800">
                      {parentResult.coCurricularSkills?.creativityBn || 'ড্রয়িং ও উপস্থিত বুদ্ধিতে অত্যন্ত সক্রিয়'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ক্লাসে উপস্থিতির তথ্য</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 text-center pt-2">
                  <div className="p-3 rounded-2xl bg-slate-50">
                    <span className="text-xs text-slate-500 font-semibold block">মোট কর্মদিবস</span>
                    <span className="text-lg font-black text-slate-800">
                      {toBengaliNumber(parentResult.attendanceSummary?.totalWorkingDays || 90)} দিন
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50">
                    <span className="text-xs text-emerald-700 font-semibold block">উপস্থিতি</span>
                    <span className="text-lg font-black text-emerald-800">
                      {toBengaliNumber(parentResult.attendanceSummary?.presentDays || 88)} দিন
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-teal-50">
                    <span className="text-xs text-teal-700 font-semibold block">উপস্থিতির হার</span>
                    <span className="text-lg font-black text-teal-800">
                      {toBengaliNumber(parentResult.attendanceSummary?.attendancePercentage || 97.5)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 pt-1 text-center font-medium">
                  শিশুর নিয়মিত উপস্থিতি ক্লাসে মনোযোগ ও শেখার আনন্দ বৃদ্ধি করে।
                </p>
              </div>
            </div>

            {/* Remarks Box */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h4 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>শিক্ষক ও অধ্যক্ষের মূল্যায়ন বার্তা</span>
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <span className="font-bold text-emerald-900 block mb-1">
                    শ্রেণি শিক্ষকের মন্তব্য:
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    "{parentResult.classTeacherRemarksBn || 'ক্লাসে অত্যন্ত সুশৃঙ্খল ও মনোযোগী।'}"
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <span className="font-bold text-amber-900 block mb-1">
                    অধ্যক্ষের অনুপ্রেরণামূলক মন্তব্য:
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    "{parentResult.principalRemarksBn || 'শিশুর মেধা ও নৈতিক বিকাশ আনন্দ পাঠশালার গর্ব।'}"
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveReportStudentId(parentStudentId)}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>পূর্ণাঙ্গ প্রগ্রেস রিপোর্ট কার্ড দেখুন / ডাউনলোড করুন</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-slate-700">ফলাফল এখনও প্রকাশিত হয়নি</h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
              এই পরীক্ষার ফলাফল এখনও চূড়ান্ত বা প্রকাশিত হয়নি। পরীক্ষা সম্পন্ন হওয়ার পর শিক্ষকমণ্ডলী কর্তৃক ফলাফল মূল্যায়ন শেষে এখানে দৃশ্যমান হবে।
            </p>
          </div>
        )}

        {/* Printable Report Card Modal for Parent */}
        <StudentReportCardModal
          isOpen={Boolean(activeReportStudentId)}
          onClose={() => setActiveReportStudentId(null)}
          result={currentReportResult}
          studentPhotoUrl={currentReportResult ? getStudentPhoto(currentReportResult.studentId) : undefined}
          schoolProfile={schoolProfile}
          onNextStudent={() => {}}
          onPrevStudent={() => {}}
          hasNext={false}
          hasPrev={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-emerald-500 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>একাডেমিক মূল্যায়ন ও রিপোর্ট কার্ড জেনারেটর</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              পরীক্ষার ফলাফল ও মেধা তালিকা
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
              বিষয়ভিত্তিক নম্বর এন্ট্রি, স্বয়ংক্রিয় জিপিএ/গ্রেড হিসাব ও এক ক্লিকে শিশুদের রঙিন প্রগ্রেস রিপোর্ট কার্ড প্রিন্ট ও সংরক্ষণ।
            </p>
          </div>

          {/* Term Switcher & Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Term Dropdown */}
            <div className="relative">
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="appearance-none bg-white text-slate-800 pl-9 pr-8 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {examTerms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.titleBn}
                  </option>
                ))}
              </select>
              <Calendar className="w-4 h-4 text-emerald-700 absolute left-3 top-3 pointer-events-none" />
            </div>

            {/* Publish Toggle Button (Admin/Teacher only) */}
            {canEdit && (
              <button
                type="button"
                onClick={handleTogglePublish}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 ${
                  activeTerm?.isPublished
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {activeTerm?.isPublished ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>প্রকাশিত</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>অপ্রকাশিত (ড্রাফট)</span>
                  </>
                )}
              </button>
            )}

            {/* CSV Export */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold rounded-2xl text-xs sm:text-sm border border-white/20 transition-all backdrop-blur-md"
              title="এক্সেল সিএসভি ডাউনলোড"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV এক্সপোর্ট</span>
            </button>
          </div>
        </div>
      </div>

      {/* Class Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CLASS_ITEMS.map((cls) => {
          const count = examResults.filter(
            (r) => r.className === cls.id && r.examTermId === selectedTermId
          ).length;
          const isSelected = selectedClass === cls.id;
          return (
            <button
              key={cls.id}
              type="button"
              onClick={() => setSelectedClass(cls.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shadow-sm border ${
                isSelected
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-emerald-200'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 border-slate-200'
              }`}
            >
              <span>{cls.nameBn}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {toBengaliNumber(count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Students */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">মোট পরীক্ষার্থী</span>
            <span className="text-xl font-black text-slate-800">
              {toBengaliNumber(classStats.total)} জন
            </span>
          </div>
        </div>

        {/* KPI 2: Pass Rate */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">পাসের হার</span>
            <span className="text-xl font-black text-teal-700">
              {toBengaliNumber(classStats.passRate)}%
            </span>
          </div>
        </div>

        {/* KPI 3: Average % */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">শ্রেণি গড় নম্বর</span>
            <span className="text-xl font-black text-amber-700">
              {toBengaliNumber(classStats.avgPercentage)}%
            </span>
          </div>
        </div>

        {/* KPI 4: Top Scorer */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs text-slate-500 font-semibold block">মেধা ১ম স্থান</span>
            <span className="text-sm font-bold text-slate-800 truncate block">
              {classStats.topScorer ? classStats.topScorer.studentNameBn : 'মূল্যায়ন চলছে'}
            </span>
            {classStats.topScorer && (
              <span className="text-[11px] text-emerald-700 font-bold block">
                GPA {toBengaliNumber(classStats.topScorer.gpa.toFixed(2))} ({classStats.topScorer.overallGrade})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="রোল বা নাম দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Buttons & Reset */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সকল
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('top3')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'top3'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              মেধা ১-৩
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('passed')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'passed'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              উত্তীর্ণ
            </button>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('আপনি কি ফলাফল পূর্বনির্ধারিত ডেমো ডেটায় রিসেট করতে চান?')) {
                  resetExamResultsToDefault();
                  setExamResults(getStoredExamResults());
                  showToast('✓ ফলাফল রিসেট সম্পন্ন হয়েছে!');
                }
              }}
              className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
              title="ডিফল্ট ডেটায় রিসেট"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4 text-center w-14">মেধা</th>
                <th className="py-3 px-3 text-center w-14">রোল</th>
                <th className="py-3 px-4">শিক্ষার্থী</th>
                <th className="py-3 px-3">বিষয়ভিত্তিক গ্রেড</th>
                <th className="py-3 px-3 text-center">মোট নম্বর</th>
                <th className="py-3 px-3 text-center">শতকরা</th>
                <th className="py-3 px-3 text-center">GPA</th>
                <th className="py-3 px-3 text-center">গ্রেড</th>
                <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classResults.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    কোনো শিক্ষার্থীর ফলাফল পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                classResults.map((result) => {
                  const isTop1 = result.meritPosition === 1;
                  const isTop2 = result.meritPosition === 2;
                  const isTop3 = result.meritPosition === 3;
                  const photo = getStudentPhoto(result.studentId);

                  return (
                    <tr
                      key={result.id}
                      className="hover:bg-emerald-50/40 transition-colors group"
                    >
                      {/* Rank / Merit Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-black text-xs shadow-sm">
                            ১
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black text-xs shadow-sm">
                            ২
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white font-black text-xs shadow-sm">
                            ৩
                          </span>
                        ) : (
                          <span className="text-slate-500 font-semibold text-xs">
                            {toBengaliNumber(result.meritPosition)}
                          </span>
                        )}
                      </td>

                      {/* Roll */}
                      <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                        {result.rollNo}
                      </td>

                      {/* Student Bio */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-emerald-200 shrink-0">
                            {photo ? (
                              <img
                                src={photo}
                                alt={result.studentNameBn}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-800 font-bold text-xs">
                                {result.studentNameBn.slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block text-sm">
                              {result.studentNameBn}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              শাখা: {result.sectionBn || 'গোলাপ'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subject Marks Pill Highlights */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {result.subjects.slice(0, 4).map((sub) => (
                            <span
                              key={sub.subjectCode}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                              title={`${sub.subjectNameBn}: ${toBengaliNumber(sub.obtainedMarks)}/${toBengaliNumber(sub.totalMarks)}`}
                            >
                              {sub.subjectNameBn.split(' ')[0]}: {sub.letterGrade}
                            </span>
                          ))}
                          {result.subjects.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-bold">
                              +{toBengaliNumber(result.subjects.length - 4)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Marks */}
                      <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                        <span className="text-emerald-800 font-extrabold">
                          {toBengaliNumber(result.totalObtained)}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {' '}/ {toBengaliNumber(result.totalMarks)}
                        </span>
                      </td>

                      {/* Percentage */}
                      <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                        {toBengaliNumber(result.percentage)}%
                      </td>

                      {/* GPA */}
                      <td className="py-3.5 px-3 text-center font-extrabold text-emerald-700 text-sm">
                        {toBengaliNumber(result.gpa.toFixed(2))}
                      </td>

                      {/* Overall Grade */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {result.overallGrade}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        {result.status === 'passed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" />
                            উত্তীর্ণ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            উন্নতি কাম্য
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Marks (Admin/Teacher) */}
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => setEditingStudentResult(result)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="নম্বর এন্ট্রি / এডিট"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* View Report Card Button */}
                          <button
                            type="button"
                            onClick={() => setActiveReportStudentId(result.studentId)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-300" />
                            <span>রিপোর্ট কার্ড</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Report Card Modal */}
      <StudentReportCardModal
        isOpen={Boolean(activeReportStudentId)}
        onClose={() => setActiveReportStudentId(null)}
        result={currentReportResult}
        studentPhotoUrl={currentReportResult ? getStudentPhoto(currentReportResult.studentId) : undefined}
        schoolProfile={schoolProfile}
        onNextStudent={handleNextReport}
        onPrevStudent={handlePrevReport}
        hasNext={reportIndex >= 0 && reportIndex < classResults.length - 1}
        hasPrev={reportIndex > 0}
      />

      {/* Edit Marks Modal */}
      {editingStudentResult && (
        <EditStudentMarksModal
          result={editingStudentResult}
          isOpen={Boolean(editingStudentResult)}
          onClose={() => setEditingStudentResult(null)}
          onSave={(updated) => {
            setExamResults(getStoredExamResults());
            setEditingStudentResult(null);
            showToast(`✓ ${updated.studentNameBn}-এর নম্বর সফলভাবে সংরক্ষিত হয়েছে!`);
          }}
        />
      )}
    </div>
  );
};

interface EditStudentMarksModalProps {
  result: StudentExamResult;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: StudentExamResult) => void;
}

const EditStudentMarksModal: React.FC<EditStudentMarksModalProps> = ({
  result,
  isOpen,
  onClose,
  onSave,
}) => {
  const [subjects, setSubjects] = useState<SubjectMark[]>(() =>
    JSON.parse(JSON.stringify(result.subjects))
  );
  const [teacherRemarks, setTeacherRemarks] = useState<string>(
    result.classTeacherRemarksBn || ''
  );
  const [principalRemarks, setPrincipalRemarks] = useState<string>(
    result.principalRemarksBn || ''
  );

  if (!isOpen) return null;

  const handleMarkChange = (index: number, newObtained: number) => {
    const updated = [...subjects];
    const target = updated[index];
    const safeObtained = Math.min(Math.max(0, newObtained || 0), target.totalMarks);
    const gradeMeta = calculateSubjectGrade(safeObtained, target.totalMarks);

    updated[index] = {
      ...target,
      obtainedMarks: safeObtained,
      letterGrade: gradeMeta.letterGrade,
      gradePoint: gradeMeta.gradePoint,
    };
    setSubjects(updated);
  };

  const handleSubjectRemarkChange = (index: number, text: string) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], remarksBn: text };
    setSubjects(updated);
  };

  const overall = calculateOverallResult(subjects);

  const handleSave = () => {
    const updated = updateStudentExamResult(
      result.studentId,
      result.examTermId,
      subjects,
      teacherRemarks,
      principalRemarks
    );
    if (updated) {
      onSave(updated);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Edit3 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">নম্বর এন্ট্রি ও মূল্যায়ন</h3>
              <p className="text-xs text-emerald-100">
                {result.studentNameBn} · রোল: {result.rollNo} · {getSchoolClassNameBn(result.className)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Calculation Preview Strip */}
        <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">মোট প্রাপ্ত:</span>
              <strong className="text-emerald-900 text-base">
                {toBengaliNumber(overall.totalObtained)} / {toBengaliNumber(overall.totalMarks)}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">শতকরা:</span>
              <strong className="text-slate-800 text-base">
                {toBengaliNumber(overall.percentage)}%
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">GPA:</span>
              <strong className="text-emerald-700 text-base">
                {toBengaliNumber(overall.gpa.toFixed(2))}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">গ্রেড:</span>
              <span className="px-2 py-0.5 rounded font-black bg-emerald-200 text-emerald-800">
                {overall.overallGrade}
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-800">
            {overall.status === 'passed' ? '✓ উত্তীর্ণ' : 'পুনরায় অনুশীলন'}
          </span>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              বিষয়ভিত্তিক নম্বর ইনপুট:
            </h4>
            <div className="space-y-2">
              {subjects.map((sub, idx) => (
                <div
                  key={sub.subjectCode}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-4">
                    <span className="font-bold text-slate-800 text-sm block">
                      {sub.subjectNameBn}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      পূর্ণমান: {toBengaliNumber(sub.totalMarks)} · পাস: {toBengaliNumber(sub.passMarks)}
                    </span>
                  </div>

                  {/* Number Input */}
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-600 shrink-0">নম্বর:</label>
                    <input
                      type="number"
                      min={0}
                      max={sub.totalMarks}
                      value={sub.obtainedMarks}
                      onChange={(e) => handleMarkChange(idx, Number(e.target.value))}
                      className="w-20 px-2 py-1.5 text-center font-bold text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-800 shrink-0">
                      {sub.letterGrade}
                    </span>
                  </div>

                  {/* Remarks */}
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={sub.remarksBn || ''}
                      onChange={(e) => handleSubjectRemarkChange(idx, e.target.value)}
                      placeholder="মন্তব্য (ঐচ্ছিক)..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher and Principal Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                শ্রেণি শিক্ষকের সামগ্রিক মন্তব্য:
              </label>
              <textarea
                rows={2}
                value={teacherRemarks}
                onChange={(e) => setTeacherRemarks(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                অধ্যক্ষের মন্তব্য:
              </label>
              <textarea
                rows={2}
                value={principalRemarks}
                onChange={(e) => setPrincipalRemarks(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs sm:text-sm font-semibold"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all"
          >
            <Check className="w-4 h-4" />
            <span>সংরক্ষণ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
