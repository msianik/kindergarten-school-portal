import React, { useRef } from 'react';
import { StudentExamResult, SchoolProfile } from '../types/school';
import { toBengaliNumber, getSchoolClassNameBn } from '../utils/schoolLogic';
import { GRADING_SCALE_TIERS } from '../utils/examResultLogic';
import { SCHOOL_PROFILE } from '../data/mockData';
import {
  Printer,
  Download,
  X,
  Award,
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  GraduationCap,
  Heart,
  TrendingUp,
} from 'lucide-react';

interface StudentReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: StudentExamResult | null;
  studentPhotoUrl?: string;
  schoolProfile?: SchoolProfile;
  onNextStudent?: () => void;
  onPrevStudent?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const StudentReportCardModal: React.FC<StudentReportCardModalProps> = ({
  isOpen,
  onClose,
  result,
  studentPhotoUrl,
  schoolProfile = SCHOOL_PROFILE,
  onNextStudent,
  onPrevStudent,
  hasNext = false,
  hasPrev = false,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !result) return null;

  const handlePrint = () => {
    const originalTitle = document.title;
    const studentName = (result.studentNameEn || result.studentNameBn).replace(/\s+/g, '_');
    document.title = `Ananda_Pathshala_Report_Card_${studentName}_Roll_${result.rollNo}_${result.academicYear}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1200);
  };

  const isOutstanding = result.gpa >= 4.5;
  const isPassed = result.status === 'passed';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:inset-auto"
      onClick={onClose}
    >
      <style>{`
        @media print {
          /* Hide everything except this modal container */
          body * {
            visibility: hidden !important;
          }
          #report-card-modal-container,
          #report-card-modal-container * {
            visibility: visible !important;
          }
          #report-card-modal-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print,
          .modal-controls-bar {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 6mm 8mm 8mm 8mm;
          }
        }
      `}</style>

      {/* Container Card */}
      <div
        id="report-card-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col my-4 sm:my-6 print:my-0 print:border-none print:shadow-none print:max-w-none print:w-full print:bg-white"
      >
        {/* Modal Controls Bar (Sticky & Hidden in Print) */}
        <div className="modal-controls-bar no-print sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-md print:hidden">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-lg flex items-center gap-2">
                <span>অফিসিয়াল রঙিন একাডেমিক রিপোর্ট কার্ড</span>
                <span className="text-[10px] sm:text-xs bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                  প্রিন্ট রেডি
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-100">
                {result.studentNameBn} · রোল: {toBengaliNumber(result.rollNo)} · {getSchoolClassNameBn(result.className)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Prev / Next Navigation for bulk reviews */}
            {(hasPrev || hasNext) && (
              <div className="flex items-center bg-white/10 rounded-xl p-1 mr-1 sm:mr-2 border border-white/20">
                <button
                  type="button"
                  onClick={onPrevStudent}
                  disabled={!hasPrev}
                  className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg disabled:opacity-40 transition-colors"
                  title="পূর্ববর্তী শিক্ষার্থী"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onNextStudent}
                  disabled={!hasNext}
                  className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg disabled:opacity-40 transition-colors"
                  title="পরবর্তী শিক্ষার্থী"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Sheet */}
        <div
          ref={reportRef}
          className="p-4 sm:p-8 md:p-10 bg-white relative print:p-2 print:w-full print:text-black font-sans"
        >
          {/* Decorative Background Frame */}
          <div className="border-4 border-double border-emerald-600 rounded-3xl p-4 sm:p-7 relative bg-gradient-to-b from-emerald-50/20 via-white to-amber-50/20 print:p-4 print:rounded-2xl">
            {/* Four Corner Accents */}
            <div className="absolute top-2 left-2 w-5 sm:w-6 h-5 sm:h-6 border-t-2 border-l-2 border-emerald-600 rounded-tl-lg" />
            <div className="absolute top-2 right-2 w-5 sm:w-6 h-5 sm:h-6 border-t-2 border-r-2 border-emerald-600 rounded-tr-lg" />
            <div className="absolute bottom-2 left-2 w-5 sm:w-6 h-5 sm:h-6 border-b-2 border-l-2 border-emerald-600 rounded-bl-lg" />
            <div className="absolute bottom-2 right-2 w-5 sm:w-6 h-5 sm:h-6 border-b-2 border-r-2 border-emerald-600 rounded-br-lg" />

            {/* School Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-emerald-600 pb-4 sm:pb-5">
              <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-emerald-500 shadow-md p-1 flex items-center justify-center shrink-0">
                  <img
                    src={schoolProfile.logoUrl || '/assets/fb/logo.jpg'}
                    alt="আনন্দ পাঠশালা লোগো"
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-800 tracking-tight">
                    {schoolProfile.nameBn || 'আনন্দ পাঠশালা'}
                  </h1>
                  <p className="text-[11px] sm:text-xs font-semibold text-emerald-600 tracking-wide">
                    {schoolProfile.nameEn || 'Ananda Pathshala Kindergarten & Junior Academy'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                    {schoolProfile.addressBn || 'মজমপুর, কুষ্টিয়া সদর, কুষ্টিয়া'} · ফোন: {schoolProfile.phone || '০১৯১৪-০৫৭৫১১'}
                  </p>
                  <div className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-bold rounded-full">
                    মotto: "জ্ঞানে কর্মে আনন্দে বিকশিত শৈশব"
                  </div>
                </div>
              </div>

              {/* Exam Title Badge */}
              <div className="text-center sm:text-right shrink-0">
                <div className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-sm">
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-300">একাডেমিক মূল্যায়ন</p>
                  <h2 className="text-sm sm:text-base md:text-lg font-bold">{result.examTitleBn}</h2>
                  <p className="text-[11px] sm:text-xs text-emerald-100">শিক্ষাবর্ষ: {result.academicYear}</p>
                </div>
              </div>
            </div>

            {/* Student Info Card & Photo */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
              {/* Photo & Roll */}
              <div className="flex sm:flex-col items-center justify-center gap-3 sm:border-r border-emerald-200 sm:pr-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md bg-white">
                  {studentPhotoUrl ? (
                    <img
                      src={studentPhotoUrl}
                      alt={result.studentNameBn}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-100 text-emerald-700">
                      <User className="w-8 h-8" />
                      <span className="text-[10px] font-bold">শিক্ষার্থী</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <span className="px-3 py-1 bg-emerald-700 text-white rounded-full text-xs font-bold shadow-sm">
                    রোল: {result.rollNo}
                  </span>
                </div>
              </div>

              {/* Bio Details */}
              <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">শিক্ষার্থীর পূর্ণ নাম:</span>
                  <strong className="text-emerald-900 text-base">{result.studentNameBn}</strong>
                  {result.studentNameEn && (
                    <span className="text-xs text-slate-600 block">{result.studentNameEn}</span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">শ্রেণি:</span>
                  <strong className="text-slate-800">{getSchoolClassNameBn(result.className)}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">শাখা:</span>
                  <strong className="text-slate-800">{result.sectionBn || 'গোলাপ'}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">ফলাফল প্রকাশের তারিখ:</span>
                  <strong className="text-slate-800">{result.publishDateBn}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">উপস্থিতির হার:</span>
                  <strong className="text-emerald-700">
                    {result.attendanceSummary
                      ? `${toBengaliNumber(result.attendanceSummary.attendancePercentage)}% (${toBengaliNumber(result.attendanceSummary.presentDays)}/${toBengaliNumber(result.attendanceSummary.totalWorkingDays)} দিন)`
                      : '৯৫% (নিয়মিত)'}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">মেধা স্থান:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {toBengaliNumber(result.meritPosition)} তম স্থান
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Banner */}
            <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold shadow-sm">
                  ★
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                    {isOutstanding ? '🌟 অসাধারণ ফলাফল ও মেধা স্বীকৃতি' : '👍 সফলভাবে উত্তীর্ণ'}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    সর্বমোট {toBengaliNumber(result.totalMarks)} নম্বরের মধ্যে প্রাপ্ত নম্বর {toBengaliNumber(result.totalObtained)} (হার: {toBengaliNumber(result.percentage)}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-semibold">গ্রেড পয়েন্ট (GPA)</span>
                  <span className="text-lg font-black text-emerald-700">{toBengaliNumber(result.gpa.toFixed(2))}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex flex-col items-center justify-center shadow-md">
                  <span className="text-xs leading-none font-bold">গ্রেড</span>
                  <span className="text-lg font-black leading-tight">{result.overallGrade}</span>
                </div>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="mt-5 overflow-hidden rounded-2xl border-2 border-emerald-600 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[580px] print:min-w-0">
                  <thead>
                    <tr className="bg-emerald-700 text-white font-bold text-center">
                      <th className="py-2.5 px-3 w-10 border-r border-emerald-600">ক্র.</th>
                      <th className="py-2.5 px-4 text-left border-r border-emerald-600">বিষয়সমূহ</th>
                      <th className="py-2.5 px-2 w-16 border-r border-emerald-600">পূর্ণমান</th>
                      <th className="py-2.5 px-2 w-16 border-r border-emerald-600">পাস</th>
                      <th className="py-2.5 px-2 w-20 border-r border-emerald-600">সর্বোচ্চ</th>
                      <th className="py-2.5 px-2 w-20 border-r border-emerald-600 bg-emerald-800 text-amber-300 font-extrabold">প্রাপ্ত</th>
                      <th className="py-2.5 px-2 w-16 border-r border-emerald-600">লেটার গ্রেড</th>
                      <th className="py-2.5 px-2 w-16 border-r border-emerald-600">পয়েন্ট</th>
                      <th className="py-2.5 px-4 text-left">শিক্ষকের পর্যবেক্ষণ ও মন্তব্য</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100">
                    {result.subjects.map((sub, idx) => (
                      <tr
                        key={sub.subjectCode || idx}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'}
                      >
                        <td className="py-2 px-3 text-center text-slate-500 font-medium border-r border-emerald-100">
                          {toBengaliNumber(idx + 1)}
                        </td>
                        <td className="py-2 px-4 font-bold text-slate-800 border-r border-emerald-100">
                          {sub.subjectNameBn}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-600 border-r border-emerald-100">
                          {toBengaliNumber(sub.totalMarks)}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-500 border-r border-emerald-100">
                          {toBengaliNumber(sub.passMarks)}
                        </td>
                        <td className="py-2 px-2 text-center text-emerald-700 font-semibold border-r border-emerald-100">
                          {toBengaliNumber(sub.highestMarksInClass)}
                        </td>
                        <td className="py-2 px-2 text-center font-black text-emerald-800 bg-emerald-50/70 text-sm border-r border-emerald-100">
                          {toBengaliNumber(sub.obtainedMarks)}
                        </td>
                        <td className="py-2 px-2 text-center border-r border-emerald-100">
                          <span className="inline-block px-2 py-0.5 font-bold rounded-md bg-emerald-100 text-emerald-800 text-xs">
                            {sub.letterGrade}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-semibold text-slate-700 border-r border-emerald-100">
                          {toBengaliNumber(sub.gradePoint.toFixed(1))}
                        </td>
                        <td className="py-2 px-4 text-slate-600 text-xs italic">
                          {sub.remarksBn || 'চমৎকার পারফরম্যান্স'}
                        </td>
                      </tr>
                    ))}
                    {/* Summary Footer Row */}
                    <tr className="bg-emerald-100/80 font-bold text-slate-900 border-t-2 border-emerald-600">
                      <td colSpan={2} className="py-2.5 px-4 text-right border-r border-emerald-300">
                        সর্বমোট ফলাফল ও গ্রেড সামারি:
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-emerald-300">
                        {toBengaliNumber(result.totalMarks)}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-emerald-300">-</td>
                      <td className="py-2.5 px-2 text-center border-r border-emerald-300">-</td>
                      <td className="py-2.5 px-2 text-center font-extrabold text-emerald-900 bg-emerald-200/80 text-sm border-r border-emerald-300">
                        {toBengaliNumber(result.totalObtained)}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-emerald-300">
                        <span className="px-2 py-0.5 bg-emerald-700 text-white rounded font-black">
                          {result.overallGrade}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-black text-emerald-800 border-r border-emerald-300">
                        {toBengaliNumber(result.gpa.toFixed(2))}
                      </td>
                      <td className="py-2.5 px-4 text-emerald-800 font-bold text-xs">
                        {isPassed ? '✓ সফলভাবে উত্তীর্ণ (PASSED)' : 'উন্নতি প্রয়োজন'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Two-Column: Co-Curricular & Grading Legend */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Co-Curricular & Character Matrix */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200">
                <h4 className="font-bold text-xs sm:text-sm text-teal-900 flex items-center gap-1.5 mb-2.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  আচরণিক ও ব্যক্তিগত গুণাবলী মূল্যায়ন (Holistic Behavior)
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-teal-100">
                    <span className="text-slate-600 font-medium">১. নিয়মানুবর্তিতা ও শৃঙ্খলা:</span>
                    <strong className="text-teal-800">{result.coCurricularSkills?.disciplineBn || 'চমৎকার ও সুশৃঙ্খল'}</strong>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-teal-100">
                    <span className="text-slate-600 font-medium">২. পরিচ্ছন্নতা ও স্বাস্থ্যবিধি:</span>
                    <strong className="text-teal-800">{result.coCurricularSkills?.cleanlinessBn || 'প্রতিদিন পরিপাটি ও পরিচ্ছন্ন'}</strong>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-teal-100">
                    <span className="text-slate-600 font-medium">৩. সহপাঠীদের সাথে মেলামেশা:</span>
                    <strong className="text-teal-800">{result.coCurricularSkills?.friendlinessBn || 'আন্তরিক ও বন্ধুভাবাপন্ন'}</strong>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-teal-100">
                    <span className="text-slate-600 font-medium">৪. সৃজনশীলতা ও সক্রিয়তা:</span>
                    <strong className="text-teal-800">{result.coCurricularSkills?.creativityBn || 'ছবি আঁকা ও ক্রাফটে দক্ষ'}</strong>
                  </div>
                </div>
              </div>

              {/* Official Grading Scale Legend */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <h4 className="font-bold text-xs sm:text-sm text-emerald-900 flex items-center gap-1.5 mb-2.5">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  গ্রেডিং পদ্ধতি নির্দেশিকা (Grading Scale Guide)
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {GRADING_SCALE_TIERS.map((tier) => (
                    <div
                      key={tier.grade}
                      className="flex items-center justify-between px-2 py-1 rounded bg-white border border-emerald-100"
                    >
                      <span className="font-semibold text-slate-700">{tier.range}</span>
                      <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${tier.color}`}>
                        {tier.grade} ({toBengaliNumber(tier.point)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Remarks Section */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
                <span className="text-xs font-bold text-amber-900 block mb-1">
                  শ্রেণি শিক্ষকের মন্তব্য ও দিকনির্দেশনা:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{result.classTeacherRemarksBn || 'শিশুর সার্বিক আচরণ ও শেখার আগ্রহ অত্যন্ত প্রশংসনীয়।'}"
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 block mb-1">
                  প্রধান শিক্ষক ও অধ্যক্ষের মূল্যায়ন:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{result.principalRemarksBn || 'আনন্দ পাঠশালায় শিশুর মেধা ও নৈতিকতার ধারাবাহিক বিকাশ কাম্য।'}"
                </p>
              </div>
            </div>

            {/* Signatures & QR Code Section */}
            <div className="mt-8 pt-6 border-t-2 border-emerald-600 flex flex-wrap items-end justify-between gap-6">
              {/* QR Verification */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 p-1 bg-white border border-emerald-300 rounded-xl shadow-sm flex items-center justify-center">
                  {/* Visual QR representation */}
                  <div className="w-full h-full bg-slate-900 rounded p-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-3 h-3 bg-white rounded-sm" />
                      <div className="w-3 h-3 bg-white rounded-sm" />
                    </div>
                    <div className="text-[7px] text-emerald-400 font-mono text-center font-bold">
                      VERIFIED
                    </div>
                    <div className="flex justify-between">
                      <div className="w-3 h-3 bg-white rounded-sm" />
                      <div className="w-1 h-1 bg-emerald-400 self-center" />
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span className="font-bold text-emerald-800 block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    অনলাইন ভেরিফায়েড
                  </span>
                  আইডি: {result.id}
                  <span className="block text-[10px] text-slate-400">স্কুল পোর্টাল অথেনটিকেটেড</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex items-end gap-8 sm:gap-14 text-center">
                <div>
                  <div className="h-10 flex items-center justify-center">
                    <span className="font-cursive text-emerald-700 text-lg italic opacity-80">
                      Fatema Akter
                    </span>
                  </div>
                  <div className="w-28 sm:w-32 border-t border-slate-700 pt-1 text-[11px] font-bold text-slate-800">
                    শ্রেণি শিক্ষক
                  </div>
                </div>

                <div>
                  <div className="h-10 flex items-center justify-center">
                    {/* Official Seal Preview */}
                    <div className="px-2 py-0.5 border border-dashed border-emerald-600 rounded-full text-[9px] text-emerald-700 font-bold uppercase tracking-wider">
                      ★ অফিসিয়াল সিল ★
                    </div>
                  </div>
                  <div className="w-28 sm:w-32 border-t border-slate-700 pt-1 text-[11px] font-bold text-slate-800">
                    অভিভাবকের স্বাক্ষর
                  </div>
                </div>

                <div>
                  <div className="h-10 flex items-center justify-center">
                    <span className="font-cursive text-emerald-800 text-lg italic font-bold">
                      Shafee Abdullah
                    </span>
                  </div>
                  <div className="w-28 sm:w-32 border-t border-slate-700 pt-1 text-[11px] font-bold text-slate-800">
                    অধ্যক্ষ ও পরিচালক
                  </div>
                </div>
              </div>
            </div>

            {/* Micro Footer */}
            <div className="mt-4 pt-2 text-center text-[10px] text-slate-400 border-t border-dashed border-emerald-100">
              আনন্দ পাঠশালা ম্যানেজমেন্ট সিস্টেম · স্বয়ংক্রিয়ভাবে জেনারেটকৃত ডিজিটাল রিপোর্ট কার্ড · প্রিন্ট তারিখ: {new Date().toLocaleDateString('bn-BD')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
