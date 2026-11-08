import React, { useState, useEffect } from 'react';
import {
  Student,
  ActivityPost,
  PickupEvent,
  FeeInvoice,
  AttendanceRecord,
  SkillAssessment,
  FcmNotification,
  PortalAccount,
  ClassRoutinePeriod,
  DayOfWeek,
  SchoolClass,
  WeeklyClassProgressRecord,
} from '../types/school';
import { calculateAttendanceStats, getSchoolClassNameBn, toBengaliNumber, isSameSchoolClass } from '../utils/schoolLogic';
import {
  getClassRoutines,
  getPeriodsForClass,
  getPeriodsForTeacher,
  getTodayDayOfWeek,
  getDayNameBn,
  getPeriodLiveStatus,
  isFridayToday,
  ROUTINE_UPDATE_EVENT,
  DAYS_OF_WEEK_CONFIG,
  exportClassRoutineToCsv,
  downloadClassRoutineCsv,
  getClassWeeklyProgress,
  WEEKLY_PROGRESS_UPDATE_EVENT,
  getHomeworkSubmissionTypeLabelBn,
  getResourceById,
} from '../utils/routineLogic';
import { getDaysUntilDueDate } from '../utils/feeReminderLogic';
import {
  getStudentFeeConfig,
  getStudentCompleteInvoicesList,
  STUDENT_FEE_CONFIG_EVENT,
} from '../utils/feeManagementLogic';
import {
  downloadInvoicePdfReceipt,
  getReceiptPdfFileName,
} from '../utils/pdfReceiptGenerator';
import {
  getStudentBirthdayInfo,
  getStudentsWithBirthdayThisWeek,
  StudentBirthdayMatch,
} from '../utils/birthdayLogic';
import { SCHOOL_TEACHERS } from '../data/mockData';
import { ClassroomAttendanceOverviewChart } from './ClassroomAttendanceOverviewChart';
import {
  BookOpen,
  CalendarCheck,
  Award,
  ShieldAlert,
  BellRing,
  CheckCircle2,
  ArrowRight,
  Heart,
  ShieldCheck,
  CreditCard,
  Clock,
  Phone,
  Sparkles,
  Send,
  AlertTriangle,
  Smile,
  UserCheck,
  FileSpreadsheet,
  Calendar,
  Printer,
  Eye,
  Coffee,
  X,
  GraduationCap,
  MapPin,
  ClipboardList,
  Download,
  FileText,
  BadgeCheck,
  Receipt,
  Cake,
  PartyPopper,
  Gift,
  IdCard,
  MessageSquare,
} from 'lucide-react';

interface TeacherPortalDashboardProps {
  account: PortalAccount;
  students: Student[];
  invoices?: FeeInvoice[];
  activityPosts: ActivityPost[];
  attendanceRecords: AttendanceRecord[];
  fcmNotifications: FcmNotification[];
  onNavigateTab: (tab: string) => void;
  onOpenNotifications: () => void;
  onMarkNotificationRead: (id: string) => void;
}

export const TeacherPortalDashboard: React.FC<TeacherPortalDashboardProps> = ({
  account,
  students,
  invoices = [],
  activityPosts,
  attendanceRecords,
  fcmNotifications,
  onNavigateTab,
  onOpenNotifications,
  onMarkNotificationRead,
}) => {
  const teacherAssignedClass: SchoolClass =
    (account.assignedClass as SchoolClass) || 'Nursery';
  const teacherClassStudents = React.useMemo(() => {
    const matched = students.filter((s) => s.className === teacherAssignedClass);
    return matched.length > 0 ? matched : students;
  }, [students, teacherAssignedClass]);

  const teacherClassDueRows = React.useMemo(() => {
    return teacherClassStudents.map((std) => {
      const stdInvs = getStudentCompleteInvoicesList(std, invoices);
      const unpaidInvs = stdInvs.filter((inv) => inv.status !== 'paid');
      const dueAmount = unpaidInvs.reduce((sum, inv) => sum + inv.netAmount, 0);
      return {
        student: std,
        unpaidInvoices: unpaidInvs,
        dueAmount,
        unpaidMonths: unpaidInvs.map((i) => i.monthBn),
      };
    });
  }, [teacherClassStudents, invoices]);

  const studentsWithDues = React.useMemo(
    () => teacherClassDueRows.filter((r) => r.dueAmount > 0),
    [teacherClassDueRows]
  );

  const totalClassDueAmount = React.useMemo(
    () => studentsWithDues.reduce((sum, r) => sum + r.dueAmount, 0),
    [studentsWithDues]
  );

  const attendanceStats = calculateAttendanceStats(attendanceRecords);
  const urgentPickups = fcmNotifications.filter((n) => n.type === 'urgent_pickup');
  const inClassStudents = teacherClassStudents.filter((s) => s.currentStatus === 'in_class');

  // Real-time Class Routines State
  const [allRoutines, setAllRoutines] = useState<ClassRoutinePeriod[]>(() => getClassRoutines());
  const [showWeeklyModal, setShowWeeklyModal] = useState<boolean>(false);
  const [selectedDayTab, setSelectedDayTab] = useState<DayOfWeek>(() => getTodayDayOfWeek());

  useEffect(() => {
    const handleRoutineSync = () => {
      setAllRoutines(getClassRoutines());
    };
    window.addEventListener(ROUTINE_UPDATE_EVENT, handleRoutineSync);
    return () => window.removeEventListener(ROUTINE_UPDATE_EVENT, handleRoutineSync);
  }, []);

  // Birthday Celebrations This Week State
  const classBirthdayMatches = React.useMemo(
    () => getStudentsWithBirthdayThisWeek(teacherClassStudents),
    [teacherClassStudents]
  );
  const allSchoolBirthdayMatches = React.useMemo(
    () => getStudentsWithBirthdayThisWeek(students),
    [students]
  );
  const [birthdayScope, setBirthdayScope] = useState<'class' | 'school'>('class');
  const [selectedBirthdayStudent, setSelectedBirthdayStudent] = useState<StudentBirthdayMatch | null>(null);
  const [customWishMessage, setCustomWishMessage] = useState<string>('');
  const [birthdayWishToast, setBirthdayWishToast] = useState<{
    studentName: string;
    message: string;
  } | null>(null);

  const todayDay = getTodayDayOfWeek();
  const isFriday = isFridayToday();

  // Find all periods for this teacher across all days
  const teacherPeriods = getPeriodsForTeacher(allRoutines, account.nameBn || account.username);
  const assignedClassPeriods = account.assignedClass
    ? getPeriodsForClass(allRoutines, account.assignedClass)
    : [];
  const effectiveTeacherPeriods = teacherPeriods.length > 0 ? teacherPeriods : assignedClassPeriods;
  const todayPeriods = effectiveTeacherPeriods.filter((p) => p.day === todayDay && !p.isBreak);
  const weeklyPeriodsForSelectedDay = effectiveTeacherPeriods.filter((p) => p.day === selectedDayTab);

  return (
    <div className="space-y-6">
      {/* Dedicated Teacher Classroom Banner (Indigo-Violet Academic Theme) */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-violet-800 to-teal-800 text-white p-6 sm:p-8 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <img
            src={account.avatarUrl || '/assets/fb/photo-2.jpg'}
            alt={account.nameBn}
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-300 bg-white p-0.5 shrink-0"
          />
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-0.5 rounded-full text-xs font-bold text-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>👩‍🏫 শিক্ষক ডেডিকেটেড ওয়েবসাইট ও ক্লাসরুম পোর্টাল</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              স্বাগতম, {account.nameBn}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 font-medium">
              {account.roleTitleBn} · দায়িত্বপ্রাপ্ত শ্রেণি: প্লে-গ্রুপ ও নার্সারি (আনন্দ পাঠশালা, কুষ্টিয়া)
            </p>
          </div>
        </div>

        {/* Teacher Quick Classroom Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('attendance')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>ক্লাসরুম হাজিরা নিন</span>
          </button>
          <button
            onClick={() => onNavigateTab('messages')}
            className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>প্যারেন্ট চ্যাট ও মেসেজ</span>
          </button>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            title="মাসিক হাজিরা সামারি রিপোর্ট ও CSV এক্সপোর্ট করুন"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>মাসিক হাজিরা CSV</span>
          </button>
          <button
            onClick={() => onNavigateTab('diary')}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>ডিজিটাল ডায়েরিতে ছবি পোস্ট</span>
          </button>
          <button
            onClick={() => onNavigateTab('fees')}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>ক্লাসের ডিউ তথ্য (৳{toBengaliNumber(totalClassDueAmount.toLocaleString())})</span>
          </button>
          <button
            onClick={() => onNavigateTab('skills')}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>স্কিল প্রগ্রেস মূল্যায়ন</span>
          </button>
          <button
            onClick={() => onNavigateTab('idcards')}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <IdCard className="w-4 h-4 text-amber-300" />
            <span>আইডি কার্ড প্রিন্ট</span>
          </button>
        </div>
      </div>

      {/* Teacher Classroom KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs hover:border-teal-400 hover:shadow-xs transition-all cursor-pointer group"
          title="হাজিরা মডিউলে যান ও মাসিক সামারি CSV ডাউনলোড করুন"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium group-hover:text-teal-700 transition-colors">শ্রেণিকক্ষে উপস্থিত শিশু</span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 group-hover:bg-teal-600 group-hover:text-white transition-colors">মাসিক CSV 📊</span>
          </div>
          <span className="text-2xl font-black text-indigo-700 font-mono mt-1 block">
            {inClassStudents.length} জন
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">
            হাজিরা হার: {attendanceStats.presentRate}% · রিপোর্ট দেখুন
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">গেটে জরুরি পিক-আপ কল</span>
          <span className="text-2xl font-black text-rose-600 font-mono mt-1 block">
            {urgentPickups.filter((n) => !n.read).length} টি
          </span>
          <span className="text-[10px] text-rose-600 font-semibold">
            FCM তাৎক্ষণিক অ্যালার্ট সক্রিয়
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">আজকের ডায়েরি আপডেট</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
            {activityPosts.length} টি
          </span>
          <span className="text-[10px] text-indigo-600 font-semibold">
            অভিভাবকদের ফিডে প্রকাশিত
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">নতুন ভর্তি আবেদন</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
            {fcmNotifications.filter((n) => n.type === 'admission_application').length} টি
          </span>
          <span className="text-[10px] text-slate-500">সাক্ষাৎকার ও যাচাইয়ের অপেক্ষায়</span>
        </div>

        {/* Birthday Celebrations KPI Card */}
        <div
          onClick={() => {
            const el = document.getElementById('teacher-birthday-celebrations-widget');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 p-4 rounded-2xl border-2 border-pink-200 shadow-2xs hover:border-pink-400 hover:shadow-xs transition-all cursor-pointer group"
          title="চলতি সপ্তাহের জন্মদিন তালিকা দেখুন"
        >
          <div className="flex items-center justify-between text-pink-700">
            <span className="text-xs font-bold flex items-center gap-1 group-hover:text-pink-900 transition-colors">
              <Cake className="w-4 h-4 text-pink-600 animate-bounce" />
              <span>চলতি সপ্তাহে জন্মদিন</span>
            </span>
            <span className="text-[10px] font-black text-pink-800 bg-pink-100 px-2 py-0.5 rounded-full border border-pink-200">
              🎂 Party
            </span>
          </div>
          <span className="text-2xl font-black text-pink-700 font-mono mt-1 block">
            {toBengaliNumber(classBirthdayMatches.length)} জন
          </span>
          <span className="text-[10px] text-pink-800 font-bold block truncate">
            {classBirthdayMatches.length > 0
              ? `${classBirthdayMatches[0].student.nameBn} (${classBirthdayMatches[0].dayNameBn})`
              : allSchoolBirthdayMatches.length > 0
              ? `স্কুলে মোট ${toBengaliNumber(allSchoolBirthdayMatches.length)} জন`
              : 'চলতি সপ্তাহে নেই'}
          </span>
        </div>
      </div>

      {/* Classroom Attendance Overview Chart (Recharts Visualization of Daily Attendance % by Class) */}
      <ClassroomAttendanceOverviewChart
        students={students}
        attendanceRecords={attendanceRecords}
        onNavigateTab={onNavigateTab}
      />

      {/* Real-Time FCM Gate Pickup & Admission Alerts for Teachers */}
      <div className="bg-white rounded-3xl border-2 border-rose-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  🚨 শিক্ষকের তাৎক্ষণিক FCM অ্যালার্ট বোর্ড (জরুরি পিক-আপ ও নতুন ভর্তি)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  LIVE FCM
                </span>
              </div>
              <p className="text-xs text-slate-500">
                গেটে অভিভাবক পৌঁছালে বা নতুন ভর্তির আবেদন জমা পড়লে শিক্ষকের স্ক্রিনে সাথে সাথে নোটিফিকেশন আসে
              </p>
            </div>
          </div>

          <button
            onClick={onOpenNotifications}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>সব FCM নোটিফিকেশন দেখুন</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fcmNotifications.slice(0, 4).map((notif) => {
            const isUrgent = notif.type === 'urgent_pickup';
            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isUrgent
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-emerald-50/70 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isUrgent ? 'bg-rose-600 text-white' : 'bg-emerald-700 text-white'
                    }`}
                  >
                    {isUrgent ? '🚨 জরুরি গেট পিক-আপ কল' : '🎓 নতুন ভর্তি আবেদন'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{notif.timestamp}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{notif.titleBn}</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{notif.bodyBn}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-600">
                    অভিভাবক: {notif.guardianNameBn}
                  </span>
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <button
                        onClick={() => onMarkNotificationRead(notif.id)}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        ✓ প্রস্তুতি সম্পন্ন
                      </button>
                    )}
                    <button
                      onClick={() => onNavigateTab(notif.actionTab)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <span>বিস্তারিত</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Teacher Teaching Schedule & Live Routine Widget */}
      <div className="bg-white rounded-3xl border-2 border-indigo-200 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  📚 আজকের শিক্ষক ক্লাস শিডিউল ও পাঠদান সময়সূচি
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  {getDayNameBn(todayDay)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                শিক্ষক: <strong>{account.nameBn}</strong> · আজকের নির্ধারিত পাঠদান ও পিরিয়ড তালিকা ({todayPeriods.length} টি ক্লাস)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowWeeklyModal(true)}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>সাপ্তাহিক রুটিন দেখুন</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('routine')}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>রুটিন ম্যানেজার</span>
            </button>
          </div>
        </div>

        {/* Friday / Weekend Notice */}
        {isFriday && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs text-amber-900 flex items-center gap-3">
            <span className="text-xl">🕌</span>
            <div>
              <p className="font-bold">আজ শুক্রবার (সাপ্তাহিক ছুটি)</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                স্কুলের সাপ্তাহিক ছুটি চলছে। আগামী শনিবারের পাঠদান সময়সূচি দেখতে উপরের &apos;সাপ্তাহিক রুটিন&apos; বোতামে ক্লিক করুন।
              </p>
            </div>
          </div>
        )}

        {/* Live Period Banner if any class is ongoing or next upcoming */}
        {(() => {
          const ongoing = todayPeriods.find((p) => getPeriodLiveStatus(p) === 'ongoing');
          const upcoming = todayPeriods.find((p) => getPeriodLiveStatus(p) === 'upcoming');

          if (ongoing) {
            return (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300"></span>
                  </span>
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-white/20 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                      🟢 বর্তমানে শ্রেণিকক্ষে পাঠদান চলছে
                    </div>
                    <h4 className="text-sm sm:text-base font-black mt-0.5">
                      {ongoing.subject} · {getSchoolClassNameBn(ongoing.className)} ({ongoing.room})
                    </h4>
                    <p className="text-xs text-emerald-100 font-medium">
                      সময়: {ongoing.startTime} - {ongoing.endTime} · আজকের বিষয়বস্তু: {ongoing.topic || 'নিয়মিত পাঠ'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold text-white self-start sm:self-center">
                  পিরিয়ড #{ongoing.periodNo}
                </span>
              </div>
            );
          } else if (upcoming) {
            return (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-slate-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-900">পরবর্তী আসন্ন ক্লাস: </span>
                    <strong className="text-slate-900 font-bold">{upcoming.subject}</strong> ({getSchoolClassNameBn(upcoming.className)}) — সময়: {upcoming.startTime} ({upcoming.room})
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md shrink-0">
                  আসন্ন
                </span>
              </div>
            );
          }
          return null;
        })()}

        {/* Today's Period Cards List */}
        {todayPeriods.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 space-y-2">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              আজ {getDayNameBn(todayDay)} আপনার কোনো ক্লাস নির্ধারিত নেই।
            </p>
            <p className="text-[11px] text-slate-500">
              অন্যান্য দিনের ক্লাস দেখতে নিচের সাপ্তাহিক রুটিন বাটনে ক্লিক করুন।
            </p>
            <button
              type="button"
              onClick={() => setShowWeeklyModal(true)}
              className="mt-2 px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer"
            >
              সাপ্তাহিক রুটিন দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {todayPeriods.map((period) => {
              const liveStatus = getPeriodLiveStatus(period);
              const isOngoing = liveStatus === 'ongoing';
              const isUpcoming = liveStatus === 'upcoming';

              return (
                <div
                  key={period.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isOngoing
                      ? 'bg-emerald-50/70 border-emerald-400 shadow-xs ring-2 ring-emerald-400/40'
                      : isUpcoming
                      ? 'bg-white border-indigo-100 hover:border-indigo-300'
                      : 'bg-slate-50/70 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                        পিরিয়ড {period.periodNo}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOngoing
                            ? 'bg-emerald-600 text-white'
                            : isUpcoming
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isOngoing ? '🟢 লাইভ ক্লাস' : isUpcoming ? 'আসন্ন' : '✓ সমাপ্ত'}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 line-clamp-1">
                      {period.subject}
                    </h4>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {getSchoolClassNameBn(period.className)}
                      </span>
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {period.room}
                      </span>
                    </div>

                    {(period.topic || period.topicBn) && (
                      <p className="text-[11px] text-indigo-900 bg-indigo-50/70 p-2 rounded-xl border border-indigo-100 leading-relaxed">
                        📖 <strong>আজকের টপিক:</strong> {period.topicBn || period.topic}
                      </p>
                    )}

                    {(period.homeworkAssignmentBn || period.homeworkOrActivityBn) && (
                      <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-black text-amber-950 flex items-center gap-1">
                            <ClipboardList className="w-3 h-3 text-amber-700" />
                            <span>📚 বাড়ির কাজ (Homework):</span>
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-950">
                            {period.homeworkDueDateBn || 'পরবর্তী ক্লাসে জমা'}
                          </span>
                        </div>
                        <p className="text-amber-950 font-semibold leading-relaxed line-clamp-2">
                          {period.homeworkAssignmentBn || period.homeworkOrActivityBn}
                        </p>
                      </div>
                    )}

                    {period.lessonPlanSummaryBn && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-[11px]">
                        <span className="font-bold text-slate-800 block">
                          📝 দৈনিক পাঠ পরিকল্পনা সারসংক্ষেপ:
                        </span>
                        <p className="text-slate-600 leading-relaxed line-clamp-2">
                          {period.lessonPlanSummaryBn}
                        </p>
                      </div>
                    )}

                    {period.resources && period.resources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-[10px]">
                        <span className="font-bold text-slate-500">🏫 সম্পদ:</span>
                        {period.resources.map((resId) => {
                          const res = getResourceById(resId);
                          return (
                            <span
                              key={resId}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold"
                              title={res?.descriptionBn}
                            >
                              <span>{res?.icon || '📦'}</span>
                              <span>{res?.nameBn.split(' (')[0] || resId}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-mono font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {period.startTime} - {period.endTime}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('routine')}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      📚 বাড়ির কাজ ও পাঠ পরিকল্পনা
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Teacher's Full Weekly Timetable Modal */}
      {showWeeklyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-violet-800 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-amber-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">
                    সাপ্তাহিক পাঠদান রুটিন — {account.nameBn}
                  </h3>
                  <p className="text-xs text-indigo-100">
                    আনন্দ পাঠশালা, কুষ্টিয়া · মোট পাঠদান পিরিয়ড: {effectiveTeacherPeriods.length} টি
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWeeklyModal(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Day Switcher Tabs */}
            <div className="p-3 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                {DAYS_OF_WEEK_CONFIG.map((d: { id: DayOfWeek; nameBn: string }) => {
                  const dayPeriodsCount = effectiveTeacherPeriods.filter((p) => p.day === d.id).length;
                  const isActive = selectedDayTab === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDayTab(d.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-indigo-700 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>{d.nameBn}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {dayPeriodsCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>প্রিন্ট</span>
              </button>
            </div>

            {/* Modal Body / Periods for Selected Day */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">
                  {getDayNameBn(selectedDayTab)}-এর ক্লাসের তালিকা
                </span>
                <span>মোট ক্লাস: {weeklyPeriodsForSelectedDay.length} টি</span>
              </div>

              {weeklyPeriodsForSelectedDay.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                  <p className="text-xs font-bold text-slate-700">
                    {getDayNameBn(selectedDayTab)} কোনো ক্লাস নির্ধারিত নেই।
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {weeklyPeriodsForSelectedDay.map((p) => (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        p.isBreak
                          ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {p.periodNo}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              {p.subject}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                              {getSchoolClassNameBn(p.className)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            রুম: {p.room} {p.topic && `· পাঠ: ${p.topic}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-700 shrink-0 self-end sm:self-center">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{p.startTime} - {p.endTime}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          ({p.durationMinutes} মি.)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                আনন্দ পাঠশালা স্মার্ট রুটিন সিস্টেম · কুষ্টিয়া
              </span>
              <button
                type="button"
                onClick={() => setShowWeeklyModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Teacher Class Due Data View Widget (শুধুমাত্র শিক্ষকের ক্লাসের ডিউ সংক্রান্ত তথ্য) */}
      <div className="bg-white rounded-3xl border-2 border-rose-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900">
                  📊 আমার ক্লাসের ({getSchoolClassNameBn(teacherAssignedClass)}) ডিউ / বকেয়া ফি ডাটা ভিউ
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                  শুধুমাত্র ক্লাসের ডিউ তথ্য
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                শিক্ষক পোর্টালে শুধুমাত্র আপনার দায়িত্বপ্রাপ্ত শ্রেণির ({getSchoolClassNameBn(teacherAssignedClass)}) শিক্ষার্থীদের বকেয়া ফি সংক্রান্ত তথ্য প্রদর্শিত হচ্ছে
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('fees')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition cursor-pointer"
          >
            <span>পূর্ণাঙ্গ ক্লাস ডিউ ডাটা ভিউ দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
            <span className="text-xs font-bold text-indigo-800 block">
              নির্ধারিত শ্রেণির মোট শিক্ষার্থী
            </span>
            <span className="text-xl font-black text-indigo-950 font-mono mt-1 block">
              {toBengaliNumber(teacherClassStudents.length)} জন ({getSchoolClassNameBn(teacherAssignedClass)})
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
            <span className="text-xs font-bold text-rose-800 block">
              বকেয়া (Due) থাকা শিক্ষার্থী
            </span>
            <span className="text-xl font-black text-rose-700 font-mono mt-1 block">
              {toBengaliNumber(studentsWithDues.length)} জন শিক্ষার্থী
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
            <span className="text-xs font-bold text-amber-900 block">
              ক্লাসের মোট বকেয়া অর্থ (Class Due)
            </span>
            <span className="text-xl font-black text-rose-700 font-mono mt-1 block">
              ৳ {toBengaliNumber(totalClassDueAmount.toLocaleString())}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {studentsWithDues.map((row) => (
            <div
              key={row.student.id}
              className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/30 flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">{row.student.nameBn}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    রোল {toBengaliNumber(row.student.rollNo)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  অভিভাবক: {row.student.fatherNameBn} · 📞 {row.student.emergencyPhone}
                </p>
                <p className="text-[10px] text-rose-700 font-bold mt-0.5">
                  বকেয়া মাস: {row.unpaidMonths.join(', ')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-rose-700 block">মোট ডিউ</span>
                <span className="text-base font-black font-mono text-rose-700">
                  ৳ {toBengaliNumber(row.dueAmount.toLocaleString())}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dedicated Birthday Celebrations This Week Showcase Widget */}
      <div
        id="teacher-birthday-celebrations-widget"
        className="bg-gradient-to-br from-pink-50/90 via-rose-50/70 to-amber-50/80 rounded-3xl border-2 border-pink-300 p-6 shadow-xs space-y-4 relative overflow-hidden"
      >
        {/* Decorative background element */}
        <div className="absolute top-2 right-4 text-7xl select-none opacity-10 pointer-events-none">
          🎂
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-200 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 text-white flex items-center justify-center shadow-xs shrink-0">
              <Cake className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>🎂 চলতি সপ্তাহের জন্মদিন উদযাপন ও শুভেচ্ছা বোর্ড</span>
                  <span className="text-xs font-black text-white bg-gradient-to-r from-pink-600 to-amber-500 px-2.5 py-0.5 rounded-full shadow-2xs">
                    Birthday Celebrations
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                চলতি সপ্তাহে আপনার ক্লাসের এবং আনন্দ পাঠশালার যেসব প্রিয় ক্ষুদে শিক্ষার্থীর জন্মদিন তাদের বিশেষ সেলিব্রেশন ব্যাজ ও তালিকা
              </p>
            </div>
          </div>

          {/* Toggle between Teacher Class vs All School */}
          <div className="flex items-center gap-1.5 bg-white/80 p-1 rounded-2xl border border-pink-200 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setBirthdayScope('class')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                birthdayScope === 'class'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-pink-50'
              }`}
            >
              <span>আমার শ্রেণি ({getSchoolClassNameBn(teacherAssignedClass)})</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  birthdayScope === 'class' ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-800'
                }`}
              >
                {toBengaliNumber(classBirthdayMatches.length)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setBirthdayScope('school')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                birthdayScope === 'school'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-pink-50'
              }`}
            >
              <span>সমগ্র স্কুল</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  birthdayScope === 'school' ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-800'
                }`}
              >
                {toBengaliNumber(allSchoolBirthdayMatches.length)}
              </span>
            </button>
          </div>
        </div>

        {/* Celebrations Grid or Empty State */}
        {(() => {
          const currentList = birthdayScope === 'class' ? classBirthdayMatches : allSchoolBirthdayMatches;

          if (currentList.length === 0) {
            return (
              <div className="p-8 text-center bg-white/80 rounded-2xl border border-dashed border-pink-300 text-slate-500 space-y-2">
                <span className="text-3xl block">🎈</span>
                <p className="text-xs font-bold text-slate-700">
                  {birthdayScope === 'class'
                    ? `আপনার নির্ধারিত শ্রেণিতে (${getSchoolClassNameBn(teacherAssignedClass)}) চলতি সপ্তাহে কারো জন্মদিন নেই।`
                    : 'আনন্দ পাঠশালায় চলতি সপ্তাহে কারো জন্মদিন নির্ধারিত নেই।'}
                </p>
                {birthdayScope === 'class' && allSchoolBirthdayMatches.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setBirthdayScope('school')}
                    className="text-xs font-bold text-pink-700 hover:underline"
                  >
                    সমগ্র স্কুলের {toBengaliNumber(allSchoolBirthdayMatches.length)} জন শিক্ষার্থীর জন্মদিন দেখুন →
                  </button>
                )}
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {currentList.map((match) => {
                const std = match.student;
                return (
                  <div
                    key={std.id}
                    className="p-4 rounded-2xl bg-white border-2 border-pink-200/90 hover:border-pink-400 shadow-sm transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="relative shrink-0">
                        {std.photoUrl ? (
                          <img
                            src={std.photoUrl}
                            alt={std.nameBn}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-300 ring-2 ring-pink-100"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-400 to-amber-300 text-white flex items-center justify-center font-black text-xl border-2 border-pink-300">
                            {std.nameBn.charAt(0)}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white flex items-center justify-center text-xs shadow-md border-2 border-white">
                          🎂
                        </span>
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-pink-700 transition-colors">
                            {std.nameBn}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                            {getSchoolClassNameBn(std.className)} · রোল {toBengaliNumber(std.rollNo)}
                          </span>
                        </div>

                        {/* Birthday Celebration Badge */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white text-[11px] font-black shadow-xs">
                            <Cake className="w-3.5 h-3.5" />
                            <span>Birthday Celebration</span>
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              match.isToday
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                                : 'bg-pink-100 text-pink-800 border border-pink-200'
                            }`}
                          >
                            {match.isToday
                              ? '🎉 আজ জন্মদিন!'
                              : match.daysUntil > 0
                              ? `⏳ আর মাত্র ${toBengaliNumber(match.daysUntil)} দিন বাকি`
                              : 'চলতি সপ্তাহে'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex items-center gap-2 pt-0.5">
                          <span>📅 তারিখ: <strong>{match.formattedDateBn}</strong></span>
                          <span>·</span>
                          <span className="text-amber-800 font-bold">
                            🎁 {match.ageTurningBn} পূর্ণ হচ্ছে
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-pink-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 truncate">
                        অভিভাবক: {std.fatherNameBn || std.motherNameBn} (📞 {std.emergencyPhone})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBirthdayStudent(match);
                          setCustomWishMessage(
                            `শুভ জন্মদিন প্রিয় ${std.nameBn}! আনন্দ পাঠশালা পরিবারের পক্ষ থেকে একরাশ ভালোবাসা, দোয়া ও শুভকামনা। বড় হয়ে অনেক বড় মানুষ হও!`
                          );
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs transition cursor-pointer shrink-0"
                      >
                        <PartyPopper className="w-3.5 h-3.5" />
                        <span>শুভেচ্ছা জানান</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Classroom Students Live Status & Allergy Roster for Teacher (Scoped to Assigned Class) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {getSchoolClassNameBn(teacherAssignedClass)} শ্রেণিকক্ষের শিক্ষার্থীদের লাইভ রোস্টার ও স্বাস্থ্য/অ্যালার্জি সতর্কতা
            </h3>
            <p className="text-xs text-slate-500">
              টিফিন দেওয়ার সময় এবং ছুটির সময় শিক্ষকের বিশেষ চেকলিস্ট ({toBengaliNumber(teacherClassStudents.length)} জন)
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('pickup')}
            className="text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1"
          >
            <span>গেট-পাস ভেরিফিকেশন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teacherClassStudents.map((std) => {
            const bdayInfo = getStudentBirthdayInfo(std);
            const isBirthdayThisWeek = bdayInfo?.isThisWeek;

            return (
              <div
                key={std.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isBirthdayThisWeek
                    ? 'border-2 border-pink-300 bg-gradient-to-br from-pink-50/70 via-white to-amber-50/50 shadow-xs ring-2 ring-pink-300/30'
                    : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    {std.photoUrl ? (
                      <img
                        src={std.photoUrl}
                        alt={std.nameBn}
                        referrerPolicy="no-referrer"
                        className={`w-12 h-12 rounded-2xl object-cover shrink-0 ${
                          isBirthdayThisWeek
                            ? 'border-2 border-pink-400 ring-2 ring-pink-200'
                            : 'border border-indigo-200'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                          isBirthdayThisWeek
                            ? 'bg-gradient-to-tr from-pink-400 to-amber-300 text-white border-2 border-pink-300'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {std.nameBn.charAt(0)}
                      </div>
                    )}
                    {isBirthdayThisWeek && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white flex items-center justify-center text-[10px] shadow-sm border border-white">
                        🎂
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{std.nameBn}</h4>
                      <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                        {std.className} · রোল {std.rollNo}
                      </span>
                    </div>

                    {/* Prominent Birthday Celebration Badge if student's birthday is this week */}
                    {isBirthdayThisWeek && bdayInfo && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5 pb-0.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white text-[11px] font-black shadow-2xs">
                          <Cake className="w-3.5 h-3.5 animate-bounce" />
                          <span>Birthday Celebration</span>
                          <span className="bg-white/20 px-1.5 py-0.2 rounded-sm text-[10px] font-bold">
                            {bdayInfo.isToday ? 'আজকে!' : bdayInfo.formattedDateBn}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBirthdayStudent(bdayInfo);
                            setCustomWishMessage(
                              `শুভ জন্মদিন প্রিয় ${std.nameBn}! আনন্দ পাঠশালা পরিবারের পক্ষ থেকে একরাশ ভালোবাসা, দোয়া ও শুভকামনা।`
                            );
                          }}
                          className="px-2 py-0.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-800 text-[10px] font-black transition cursor-pointer border border-pink-200 flex items-center gap-1"
                        >
                          <PartyPopper className="w-3 h-3 text-pink-600" />
                          <span>শুভেচ্ছা পাঠান</span>
                        </button>
                      </div>
                    )}

                    <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/70 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>অ্যালার্জি: {std.allergies}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      পিতা/মাতা: {std.fatherNameBn} · জরুরি ফোন: {std.emergencyPhone}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    std.currentStatus === 'picked_up'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {std.currentStatus === 'picked_up' ? '✓ ছুটি সম্পন্ন' : 'শ্রেণিকক্ষে আছে'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fellow Teachers & Head Teacher Roster */}
      <div className="bg-white rounded-3xl border border-indigo-100 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-700" />
              <span>সহকর্মী শিক্ষক ও প্রধান শিক্ষক পর্ষদ ({SCHOOL_TEACHERS.length} জন)</span>
            </h3>
            <p className="text-xs text-slate-500">
              আনন্দ পাঠশালা কুষ্টিয়ার অফিশিয়াল শিক্ষক ও কর্মকর্তা তালিকা
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SCHOOL_TEACHERS.map((t) => (
            <div
              key={t.id}
              className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center gap-3"
            >
              <img
                src={t.photoUrl}
                alt={t.nameBn}
                referrerPolicy="no-referrer"
                className="w-12 h-14 rounded-xl object-cover border border-indigo-200 bg-white shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-indigo-700 block">
                  {t.designationBn}
                </span>
                <h4 className="text-xs font-bold text-slate-900 truncate">{t.nameBn}</h4>
                <span className="text-[10px] text-slate-500 block truncate">{t.departmentBn}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Birthday Celebration Greeting Modal */}
      {selectedBirthdayStudent && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-pink-300 space-y-0">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setSelectedBirthdayStudent(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center text-2xl shadow-inner shrink-0">
                  🎂
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-pink-100 block">
                    Birthday Celebration · আনন্দ পাঠশালা
                  </span>
                  <h3 className="text-lg font-black text-white">
                    {selectedBirthdayStudent.student.nameBn}-কে জন্মদিনের শুভেচ্ছা
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-amber-50 border border-pink-200 flex items-center gap-4">
                {selectedBirthdayStudent.student.photoUrl ? (
                  <img
                    src={selectedBirthdayStudent.student.photoUrl}
                    alt={selectedBirthdayStudent.student.nameBn}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-400 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-pink-500 text-white flex items-center justify-center text-2xl font-black shrink-0">
                    {selectedBirthdayStudent.student.nameBn.charAt(0)}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900">
                      {selectedBirthdayStudent.student.nameBn}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      রোল {toBengaliNumber(selectedBirthdayStudent.student.rollNo)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    শ্রেণি: <strong>{getSchoolClassNameBn(selectedBirthdayStudent.student.className)}</strong> · 
                    তারিখ: <strong className="text-pink-700">{selectedBirthdayStudent.formattedDateBn}</strong>
                  </p>
                  <p className="text-xs font-bold text-amber-900">
                    🎉 {selectedBirthdayStudent.ageTurningBn} পূর্ণ হচ্ছে!
                  </p>
                </div>
              </div>

              {/* Quick Preset Wish Messages */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  দ্রুত শুভেচ্ছা বার্তা নির্বাচন করুন:
                </label>
                <div className="space-y-1.5">
                  {[
                    `শুভ জন্মদিন প্রিয় ${selectedBirthdayStudent.student.nameBn}! আনন্দ পাঠশালা পরিবারের পক্ষ থেকে একরাশ ভালোবাসা, দোয়া ও শুভকামনা। মহান আল্লাহ তোমাকে সুস্থ রাখুন ও সুন্দর ভবিষ্যৎ দান করুন।`,
                    `Happy Birthday ${selectedBirthdayStudent.student.nameBn}! শ্রেণিকক্ষে তোমার হাসিমাখা উপস্থিতি আমাদের প্রতিদিন আনন্দ দেয়। অনেক বড় হও!`,
                    `জন্মদিনের অফুরন্ত আদর ও ভালোবাসা! তোমার নতুন বছরটি পড়াশোনা ও খেলায় আনন্দে কাটুক।`,
                  ].map((presetMsg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomWishMessage(presetMsg)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                        customWishMessage === presetMsg
                          ? 'border-pink-500 bg-pink-50 text-pink-900 font-bold'
                          : 'border-slate-200 hover:border-pink-300 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {presetMsg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Editor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  শুভেচ্ছা বার্তা (কাস্টমাইজ করুন):
                </label>
                <textarea
                  value={customWishMessage}
                  onChange={(e) => setCustomWishMessage(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-xs text-slate-900 resize-none outline-none"
                  placeholder="আপনার আন্তরিক শুভেচ্ছা লিখুন..."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedBirthdayStudent(null)}
                  className="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const studentName = selectedBirthdayStudent.student.nameBn;
                    setBirthdayWishToast({
                      studentName,
                      message: customWishMessage || `শুভ জন্মদিন প্রিয় ${studentName}!`,
                    });
                    setSelectedBirthdayStudent(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>শুভেচ্ছা পাঠান ও নোটিফিকেশন দিন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Birthday Wish Confirmation Toast */}
      {birthdayWishToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white border-2 border-pink-400 p-4 rounded-2xl shadow-xl flex items-start gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center text-xl shrink-0">
            🎉
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-xs font-black text-slate-900">
              জন্মদিনের শুভেচ্ছা সফলভাবে পাঠানো হয়েছে! 🎂
            </h4>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              <strong>{birthdayWishToast.studentName}</strong>-এর জন্য বার্তা: &ldquo;{birthdayWishToast.message}&rdquo;
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBirthdayWishToast(null)}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

interface ParentPortalDashboardProps {
  account: PortalAccount;
  students: Student[];
  activityPosts: ActivityPost[];
  assessments: Record<string, SkillAssessment>;
  invoices: FeeInvoice[];
  pickupLogs: PickupEvent[];
  onNavigateTab: (tab: string) => void;
  onSendUrgentPickupAlert: (
    student: Student,
    guardianNameBn: string,
    relationBn: string,
    noteBn?: string
  ) => void;
}

export const ParentPortalDashboard: React.FC<ParentPortalDashboardProps> = ({
  account,
  students,
  activityPosts,
  assessments,
  invoices,
  onNavigateTab,
  onSendUrgentPickupAlert,
}) => {
  const myChild =
    students.find((s) => s.id === (account.studentId || 'std-1')) || students[0];
  const childAssessment = assessments[myChild.id];
  const childClassTeacher = React.useMemo(() => {
    return (
      SCHOOL_TEACHERS.find(
        (t) => t.assignedClass && isSameSchoolClass(t.assignedClass, myChild.className)
      ) || SCHOOL_TEACHERS[1]
    );
  }, [myChild.className]);
  const [feeConfigSyncVer, setFeeConfigSyncVer] = useState<number>(0);
  const [parentPreviewReceipt, setParentPreviewReceipt] = useState<FeeInvoice | null>(null);
  const [downloadedBannerFile, setDownloadedBannerFile] = useState<string | null>(null);

  useEffect(() => {
    const onFeeCfgSync = () => setFeeConfigSyncVer((v) => v + 1);
    window.addEventListener(STUDENT_FEE_CONFIG_EVENT, onFeeCfgSync);
    return () => window.removeEventListener(STUDENT_FEE_CONFIG_EVENT, onFeeCfgSync);
  }, []);

  const childFeeConfig = React.useMemo(
    () => getStudentFeeConfig(myChild),
    [myChild, feeConfigSyncVer]
  );
  const allChildInvoices = React.useMemo(
    () => getStudentCompleteInvoicesList(myChild, invoices),
    [myChild, invoices, feeConfigSyncVer]
  );
  const paidChildReceipts = React.useMemo(
    () => allChildInvoices.filter((inv) => inv.status === 'paid'),
    [allChildInvoices]
  );
  const childInvoices = invoices.filter((inv) => inv.studentId === myChild.id);
  const unpaidInvoice =
    childInvoices.find((inv) => inv.status !== 'paid') ||
    allChildInvoices.find((inv) => inv.status !== 'paid');
  const childDiaryPosts = activityPosts.filter(
    (p) => p.className === myChild.className || p.className === 'Playgroup'
  );

  const handleParentDownloadPdf = async (inv: FeeInvoice) => {
    const fileName = await downloadInvoicePdfReceipt(inv, myChild, childFeeConfig);
    setDownloadedBannerFile(fileName);
    setTimeout(() => setDownloadedBannerFile(null), 5000);
  };

  const [parentPickupNote, setParentPickupNote] = useState('');
  const [pickupSentBanner, setPickupSentBanner] = useState(false);

  // Child's Class Routine State & Live Sync
  const childClass = (myChild.className || 'Nursery') as SchoolClass;
  const [allRoutines, setAllRoutines] = useState<ClassRoutinePeriod[]>(() => getClassRoutines());
  const [showChildWeeklyModal, setShowChildWeeklyModal] = useState<boolean>(false);
  const [selectedChildDayTab, setSelectedChildDayTab] = useState<DayOfWeek>(() => getTodayDayOfWeek());
  const [childWeeklyProgress, setChildWeeklyProgress] = useState<WeeklyClassProgressRecord>(() =>
    getClassWeeklyProgress(childClass, 'nov-2026-w1')
  );

  useEffect(() => {
    setChildWeeklyProgress(getClassWeeklyProgress(childClass, 'nov-2026-w1'));
  }, [childClass, allRoutines]);

  useEffect(() => {
    const handleRoutineSync = () => {
      setAllRoutines(getClassRoutines());
      setChildWeeklyProgress(getClassWeeklyProgress(childClass, 'nov-2026-w1'));
    };
    const handleWeeklyProgressSync = () => {
      setChildWeeklyProgress(getClassWeeklyProgress(childClass, 'nov-2026-w1'));
    };
    window.addEventListener(ROUTINE_UPDATE_EVENT, handleRoutineSync);
    window.addEventListener(WEEKLY_PROGRESS_UPDATE_EVENT, handleWeeklyProgressSync);
    return () => {
      window.removeEventListener(ROUTINE_UPDATE_EVENT, handleRoutineSync);
      window.removeEventListener(WEEKLY_PROGRESS_UPDATE_EVENT, handleWeeklyProgressSync);
    };
  }, [childClass]);

  const todayDay = getTodayDayOfWeek();
  const isFriday = isFridayToday();
  const childTodayPeriods = getPeriodsForClass(allRoutines, childClass, todayDay);
  const childWeeklyPeriodsForSelectedDay = getPeriodsForClass(allRoutines, childClass, selectedChildDayTab);

  const daysUntilDue = unpaidInvoice ? getDaysUntilDueDate(unpaidInvoice.dueDate) : null;
  const isFeeDueSoon =
    unpaidInvoice !== undefined && daysUntilDue !== null && daysUntilDue <= 3;

  // Dedicated In-Portal Popup Modal for Parent's Unpaid School Fees upon login
  const [showFeeDuePopupModal, setShowFeeDuePopupModal] = useState<boolean>(() => {
    if (!unpaidInvoice) return false;
    const sessionDismissedKey = `fee_popup_dismissed_${account.username}_${unpaidInvoice.id}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(sessionDismissedKey)) {
      return false;
    }
    return true;
  });

  const handleDismissFeePopupModal = () => {
    setShowFeeDuePopupModal(false);
    if (unpaidInvoice && typeof window !== 'undefined') {
      sessionStorage.setItem(`fee_popup_dismissed_${account.username}_${unpaidInvoice.id}`, 'true');
    }
  };

  const handleParentArrivedAtGate = (e: React.FormEvent) => {
    e.preventDefault();
    onSendUrgentPickupAlert(
      myChild,
      account.nameBn,
      'বাবা (অভিভাবক পোর্টাল থেকে)',
      parentPickupNote || 'আমি স্কুলের মেইন গেটে পৌঁছেছি, অনুগ্রহ করে আদিত্যকে পাঠানোর ব্যবস্থা করুন।'
    );
    setParentPickupNote('');
    setPickupSentBanner(true);
  };

  return (
    <div className="space-y-6">
      {/* Dedicated Unpaid Fee In-Portal Popup Modal (Appears only after Parent login if child has pending dues) */}
      {showFeeDuePopupModal && unpaidInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-rose-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white p-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 text-amber-200 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
                    💳 বকেয়া স্কুল ফি নোটিফিকেশন
                  </span>
                  <h3 className="text-base font-black mt-1">
                    স্কুল ফি পরিশোধের জরুরি স্মারক
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissFeePopupModal}
                className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Student info box */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <img
                  src={myChild.photoUrl || '/assets/fb/photo-1.jpg'}
                  alt={myChild.nameBn}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-300"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    {myChild.nameBn}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    শ্রেণি: {getSchoolClassNameBn(myChild.className)} · রোল: {myChild.rollNo}
                  </p>
                  <p className="text-[10px] text-indigo-700 font-bold">
                    আইডি: {myChild.id}
                  </p>
                </div>
              </div>

              {/* Fee Breakdown Alert */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                  <span>ইনভয়েস মাস: {unpaidInvoice.monthBn}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white border border-amber-300 text-slate-700">
                    #{unpaidInvoice.invoiceNo}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-amber-200">
                  <span className="text-xs text-slate-700 font-semibold">বকেয়া মোট ফি:</span>
                  <span className="text-2xl font-black text-rose-600 font-mono">
                    ৳{unpaidInvoice.netAmount.toLocaleString('bn-BD')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 pt-1">
                  <span>জমা দেওয়ার শেষ তারিখ:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                    {unpaidInvoice.dueDate}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                সম্মানিত অভিভাবক ({account.nameBn}), আপনার সন্তান {myChild.nameBn}-এর চলতি মাসের স্কুল ফি এখনো বকেয়া রয়েছে। বিলম্ব ফি এড়াতে বিকাশ অথবা অনলাইন পেমেন্টের মাধ্যমে দ্রুত ফি পরিশোধ করুন।
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleDismissFeePopupModal();
                    onNavigateTab('fees');
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-amber-200" />
                  <span>বিকাশ দিয়ে ফি পরিশোধ করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDismissFeePopupModal}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  পরে পরিশোধ করব
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Automated In-App 3-Days Fee Due Reminder Alert Banner for Parents */}
      {isFeeDueSoon && unpaidInvoice && (
        <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white p-5 sm:p-6 shadow-lg border-2 border-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-amber-200 shrink-0">
              <CreditCard className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white text-rose-700 tracking-wider">
                  ⚠️ জরুরি ফি পরিশোধ স্মারক (FCM ALERT)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  {daysUntilDue === 3
                    ? 'আর ৩ দিন বাকি'
                    : daysUntilDue === 2
                    ? 'আর ২ দিন বাকি'
                    : daysUntilDue === 1
                    ? 'আগামীকাল শেষ দিন'
                    : daysUntilDue === 0
                    ? 'আজই শেষ দিন'
                    : 'সময় অতিক্রান্ত'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {myChild.nameBn}-এর {unpaidInvoice.monthBn}-এর স্কুল ফি ৳{unpaidInvoice.netAmount} জমা দিন
              </h3>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                পরিশোধের নির্ধারিত শেষ তারিখ: <strong>{unpaidInvoice.dueDate}</strong>। বিলম্ব ফি পরিহার করতে বিকাশ অ্যাপ বা অনলাইন পোর্টাল থেকে তাৎক্ষণিক পরিশোধ করুন।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={() => onNavigateTab('fees')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-rose-700 font-black text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
            >
              <CreditCard className="w-4 h-4 text-rose-600" />
              <span>বিকাশ দিয়ে ফি পরিশোধ করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Dedicated Parent & Child Family Banner (Warm Amber-Rose-Emerald Theme) */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-700 via-rose-700 to-emerald-800 text-white p-6 sm:p-8 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <img
            src={myChild.photoUrl || '/assets/fb/photo-3.jpg'}
            alt={myChild.nameBn}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-3xl object-cover border-3 border-amber-300 bg-white p-0.5 shadow-md shrink-0"
          />
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-0.5 rounded-full text-xs font-bold text-amber-200">
              <Heart className="w-3.5 h-3.5" />
              <span>👨‍👧 অভিভাবক ডেডিকেটেড ওয়েবসাইট ও সন্তান ড্যাশবোর্ড</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              আপনার সন্তান: {myChild.nameBn} ({myChild.nameEn})
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 font-medium">
              শ্রেণি: {myChild.className} ({myChild.section}) · রোল: {myChild.rollNo} · ব্লাড গ্রুপ:{' '}
              {myChild.bloodGroup} · অভিভাবক: {account.nameBn}
            </p>
          </div>
        </div>

        <div className="bg-black/25 backdrop-blur-xs p-4 rounded-2xl border border-white/20 space-y-2 shrink-0">
          <span className="text-[11px] text-amber-200 font-bold block uppercase">
            সন্তানের আজকের লাইভ স্ট্যাটাস:
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-sm font-black text-white">
              {myChild.currentStatus === 'picked_up'
                ? '✓ নিরাপদে স্কুল ত্যাগ করেছে'
                : 'স্কুলের শ্রেণিকক্ষে নিরাপদে আছে (সকাল ০৮:৫০ থেকে)'}
            </span>
          </div>
          <p className="text-[11px] text-white/85">
            শ্রেণি শিক্ষিকা: {childClassTeacher.nameBn} · জরুরি হেল্পলাইন: {childClassTeacher.phone}
          </p>
        </div>
      </div>

      {/* Direct Parent-Teacher Chat & Feedback Card */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white border border-teal-500/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-400 text-slate-950 tracking-wider">
                💬 সরাসরি যোগাযোগ (Parent-Teacher Chat)
              </span>
              <span className="text-teal-200 text-xs font-semibold">
                শ্রেণি শিক্ষিকা: {childClassTeacher.nameBn} ({childClassTeacher.designationBn})
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              সন্তানের শ্রেণি শিক্ষকের সাথে সরাসরি চ্যাট বা ফিডব্যাক দিন
            </h3>
            <p className="text-xs text-teal-100/90 max-w-xl">
              আজকের আচরণ, টিফিন ও স্বাস্থ্য জিজ্ঞাসা, দেরিতে আসার পূর্বসতর্কতা বা ওষুধ খাওয়ানোর বিশেষ নোট সরাসরি শ্রেণি শিক্ষককে পাঠান।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => onNavigateTab('messages')}
            className="px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>চ্যাট খুলুন ও মেসেজ পাঠান</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Parent 1-Click Urgent Pickup Request to Class Teacher via FCM */}
      <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-rose-600" />
              <span>🚗 স্কুল গেটে পৌঁছেছেন? শ্রেণি শিক্ষককে তাৎক্ষণিক পিক-আপ মেসেজ পাঠান</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              এখানে ক্লিক করলে শ্রেণি শিক্ষকের মোবাইলে ও ড্যাশবোর্ডে সাথে সাথে FCM পুশ অ্যালার্ট যাবে এবং আপনার সন্তানকে গেটে প্রস্তুত করে পাঠানো হবে।
            </p>
          </div>
          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full shrink-0 self-start">
            ইনস্ট্যান্ট শিক্ষক নোটিফিকেশন
          </span>
        </div>

        {pickupSentBanner && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              শ্রেণি শিক্ষিকা রোকেয়া পারভীনের কাছে আপনার জরুরি পিক-আপ রিকোয়েস্ট সফলভাবে পৌঁছেছে!
            </span>
            <button
              onClick={() => setPickupSentBanner(false)}
              className="text-emerald-700 underline text-[11px]"
            >
              ঠিক আছে
            </button>
          </div>
        )}

        <form
          onSubmit={handleParentArrivedAtGate}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <input
            type="text"
            value={parentPickupNote}
            onChange={(e) => setParentPickupNote(e.target.value)}
            placeholder="শিক্ষকের জন্য বার্তা (ঐচ্ছিক): যেমন—আমি মেইন গেটে আছি, আদিত্যকে ব্যাগসহ পাঠিয়ে দিন..."
            className="flex-1 px-4 py-2.5 text-xs bg-amber-50/50 border border-amber-300 rounded-xl focus:outline-none focus:bg-white"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            <span>আমি গেটে আছি — শিক্ষককে জানান</span>
          </button>
        </form>
      </div>

      {/* Child's Class Routine & Upcoming Periods Widget */}
      <div className="bg-white rounded-3xl border-2 border-emerald-300 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  📅 {myChild.nameBn}-এর আজকের ক্লাস রুটিন ও সময়সূচি
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {getDayNameBn(todayDay)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                শ্রেণি: <strong>{getSchoolClassNameBn(childClass)}</strong> ({myChild.section}) · রোল: {myChild.rollNo} · আজ মোট {childTodayPeriods.length} টি পিরিয়ড
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowChildWeeklyModal(true)}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>সাপ্তাহিক রুটিন ও প্রিন্ট</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('routine')}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>সাপ্তাহিক সারসংক্ষেপ ও সকল রুটিন</span>
            </button>
          </div>
        </div>

        {/* Child's Weekly Progress Summary Card for Parents */}
        <div
          className={`rounded-2xl border p-4 space-y-2.5 ${
            childWeeklyProgress.status === 'completed'
              ? 'bg-emerald-50/80 border-emerald-300'
              : 'bg-amber-50/80 border-amber-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-900">
                📊 সাপ্তাহিক পাঠ ও অগ্রগতি সারসংক্ষেপ ({childWeeklyProgress.weekLabelBn}):
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                  childWeeklyProgress.status === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-400 text-slate-950'
                }`}
              >
                {childWeeklyProgress.status === 'completed'
                  ? '✓ সম্পূর্ণ সপ্তাহ সম্পন্ন (Completed)'
                  : `⏳ চলমান / পেন্ডিং (${childWeeklyProgress.completionPercentage}%)`}
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              মূল্যায়ন: {childWeeklyProgress.updatedByBn} ({childWeeklyProgress.updatedAtBn})
            </span>
          </div>

          <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                childWeeklyProgress.status === 'completed'
                  ? 'bg-emerald-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.max(10, childWeeklyProgress.completionPercentage)}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200/80">
              <strong className="text-slate-900 block text-[11px]">
                📝 শিক্ষকের সাপ্তাহিক মূল্যায়ন নোট:
              </strong>
              <p className="text-slate-700 mt-0.5 leading-relaxed">
                {childWeeklyProgress.teacherSummaryNoteBn}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
              <strong className="text-amber-950 block text-[11px]">
                🏠 অভিভাবকের জন্য সাপ্তাহিক বাসার অনুশীলন গাইড:
              </strong>
              <p className="text-amber-900 mt-0.5 leading-relaxed">
                {childWeeklyProgress.parentActionNoteBn}
              </p>
            </div>
          </div>
        </div>

        {/* Friday / Weekend Notice */}
        {isFriday && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs text-amber-900 flex items-center gap-3">
            <span className="text-xl">🕌</span>
            <div>
              <p className="font-bold">আজ শুক্রবার (সাপ্তাহিক ছুটি)</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                আজ আনন্দ পাঠশালার সাপ্তাহিক ছুটি। সন্তানের আগামী শনিবারের ক্লাস রুটিন দেখতে উপরের &apos;সাপ্তাহিক রুটিন&apos; বাটনে ক্লিক করুন।
              </p>
            </div>
          </div>
        )}

        {/* Real-Time Live Status Banner for the Child */}
        {(() => {
          const ongoing = childTodayPeriods.find((p) => getPeriodLiveStatus(p) === 'ongoing' && !p.isBreak);
          const ongoingBreak = childTodayPeriods.find((p) => getPeriodLiveStatus(p) === 'ongoing' && p.isBreak);
          const upcoming = childTodayPeriods.find((p) => getPeriodLiveStatus(p) === 'upcoming' && !p.isBreak);
          const allCompleted = childTodayPeriods.length > 0 && childTodayPeriods.every((p) => getPeriodLiveStatus(p) === 'completed');

          if (ongoing) {
            return (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300"></span>
                  </span>
                  <div>
                    <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                      🟢 বর্তমানে শ্রেণিকক্ষে ক্লাস চলছে
                    </div>
                    <h4 className="text-sm sm:text-base font-black mt-0.5">
                      {ongoing.subject} · শিক্ষক: {ongoing.teacherNameBn}
                    </h4>
                    <p className="text-xs text-emerald-100 font-medium">
                      সময়: {ongoing.startTime} - {ongoing.endTime} · কক্ষ: {ongoing.room} {ongoing.topic && `· পাঠ: ${ongoing.topic}`}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold text-white self-start sm:self-center">
                  পিরিয়ড #{ongoing.periodNo}
                </span>
              </div>
            );
          } else if (ongoingBreak) {
            return (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Coffee className="w-5 h-5 text-white" />
                  <div>
                    <span className="text-[10px] uppercase font-black bg-white/20 px-2 py-0.5 rounded">
                      🍎 টিফিন ও স্বাস্থ্যকর নাস্তা বিরতি
                    </span>
                    <h4 className="text-sm font-bold mt-0.5">{ongoingBreak.subject}</h4>
                    <p className="text-xs text-amber-100 font-medium">
                      সময়: {ongoingBreak.startTime} - {ongoingBreak.endTime} · শিশুদের হাত ধোয়া ও টিফিন গ্রহণ
                    </p>
                  </div>
                </div>
              </div>
            );
          } else if (upcoming) {
            return (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-slate-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-900">পরবর্তী আসন্ন ক্লাস: </span>
                    <strong className="text-slate-900 font-bold">{upcoming.subject}</strong> — শিক্ষক: {upcoming.teacherNameBn} · সময়: {upcoming.startTime} ({upcoming.room})
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md shrink-0">
                  আসন্ন ক্লাস
                </span>
              </div>
            );
          } else if (allCompleted) {
            return (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>আজকের সকল নির্ধারিত পিরিয়ড ও ক্লাস সফলভাবে সমাপ্ত হয়েছে।</span>
              </div>
            );
          }
          return null;
        })()}

        {/* Today's Assigned Homework Summary Board for Parents */}
        {(() => {
          const homeworkPeriods = childTodayPeriods.filter(
            (p) => !p.isBreak && (p.homeworkAssignmentBn || p.homeworkOrActivityBn)
          );
          if (homeworkPeriods.length === 0) return null;

          return (
            <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50/40 border-2 border-amber-300 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      📚 আজকের নির্ধারিত বাড়ির কাজসমূহ (Today&apos;s Homework Assignments — {homeworkPeriods.length}টি বিষয়)
                    </h4>
                    <p className="text-[11px] text-amber-900">
                      শ্রেণি শিক্ষকদের নির্ধারিত আজকের বাড়ির কাজ ও জমা দেওয়ার নির্দেশনা
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('routine')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition cursor-pointer self-start sm:self-center shrink-0"
                >
                  সকল বাড়ির কাজ দেখুন →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {homeworkPeriods.map((hw) => (
                  <div
                    key={`hw-summary-${hw.id}`}
                    className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-slate-900">
                        {hw.subjectBn || hw.subject} ({hw.periodLabelBn})
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
                        জমা: {hw.homeworkDueDateBn || 'পরবর্তী ক্লাসে জমা'}
                      </span>
                    </div>
                    <p className="text-slate-800 font-semibold leading-relaxed">
                      {hw.homeworkAssignmentBn || hw.homeworkOrActivityBn}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="font-bold text-amber-900">
                        {getHomeworkSubmissionTypeLabelBn(hw.homeworkSubmissionType)}
                      </span>
                      <span>শিক্ষক: {hw.teacherNameBn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Periods List for the Child */}
        {childTodayPeriods.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 space-y-2">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              আজ {getDayNameBn(todayDay)} {getSchoolClassNameBn(childClass)} শ্রেণির কোনো ক্লাস তালিকা পাওয়া যায়নি।
            </p>
            <button
              type="button"
              onClick={() => setShowChildWeeklyModal(true)}
              className="mt-2 px-3.5 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 cursor-pointer"
            >
              সাপ্তাহিক রুটিন দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {childTodayPeriods.map((period) => {
              const liveStatus = getPeriodLiveStatus(period);
              const isOngoing = liveStatus === 'ongoing';
              const isUpcoming = liveStatus === 'upcoming';

              return (
                <div
                  key={period.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    period.isBreak
                      ? 'bg-amber-50/60 border-amber-200'
                      : isOngoing
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-xs ring-2 ring-emerald-400/40'
                      : isUpcoming
                      ? 'bg-white border-slate-200 hover:border-emerald-300'
                      : 'bg-slate-50/70 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          period.isBreak
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {period.isBreak ? '☕ বিরতি' : `পিরিয়ড ${period.periodNo}`}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          period.isBreak
                            ? 'bg-amber-100 text-amber-800'
                            : isOngoing
                            ? 'bg-emerald-600 text-white'
                            : isUpcoming
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {period.isBreak ? 'টিফিন' : isOngoing ? '🟢 লাইভ' : isUpcoming ? 'আসন্ন' : '✓ সম্পন্ন'}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 line-clamp-1">
                      {period.subject}
                    </h4>

                    {!period.isBreak && (
                      <div className="space-y-1 text-xs">
                        <p className="text-slate-700 font-medium flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>শিক্ষক: <strong>{period.teacherNameBn}</strong></span>
                        </p>
                        <p className="text-slate-500 text-[11px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{period.room}</span>
                        </p>
                      </div>
                    )}

                    {(period.topicBn || period.topic) && (
                      <p className="text-[11px] font-semibold text-indigo-950 bg-indigo-50/80 p-2 rounded-xl border border-indigo-100 leading-relaxed">
                        📖 <strong>পাঠের টপিক:</strong> {period.topicBn || period.topic}
                      </p>
                    )}

                    {/* Dedicated Homework Assignment Box on Parent Routine Card */}
                    {!period.isBreak &&
                      (period.homeworkAssignmentBn || period.homeworkOrActivityBn) && (
                        <div className="p-2.5 rounded-xl bg-amber-50/95 border-2 border-amber-300/90 space-y-1.5 text-[11px] shadow-2xs">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span className="font-black text-amber-950 flex items-center gap-1">
                              <ClipboardList className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>📚 বাড়ির কাজ (Homework):</span>
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                              {period.homeworkDueDateBn || 'পরবর্তী ক্লাসে জমা'}
                            </span>
                          </div>
                          <p className="text-slate-900 font-bold leading-relaxed bg-white p-2 rounded-lg border border-amber-200">
                            {period.homeworkAssignmentBn || period.homeworkOrActivityBn}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-amber-900 font-semibold">
                            <span>
                              {getHomeworkSubmissionTypeLabelBn(period.homeworkSubmissionType)}
                            </span>
                          </div>
                        </div>
                      )}

                    {!period.isBreak && period.lessonPlanSummaryBn && (
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-200/90 space-y-1.5 text-[11px] shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-emerald-900">
                            📝 শিক্ষকের দৈনিক পাঠ পরিকল্পনা:
                          </span>
                          {period.lessonPlanUpdatedAtBn && (
                            <span className="text-[10px] text-emerald-700 font-medium">
                              {period.lessonPlanUpdatedAtBn}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {period.lessonPlanSummaryBn}
                        </p>
                        {period.learningObjectivesBn && (
                          <p className="text-[10px] text-teal-900 bg-teal-50/70 px-2 py-1 rounded-lg border border-teal-100">
                            🎯 <strong>শিখনফল:</strong> {period.learningObjectivesBn}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {period.startTime} - {period.endTime}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {period.durationMinutes} মি.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Child's Weekly Class Routine Modal for Parents */}
      {showChildWeeklyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-teal-700 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-amber-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">
                    {myChild.nameBn}-এর সাপ্তাহিক ক্লাস রুটিন
                  </h3>
                  <p className="text-xs text-emerald-100">
                    শ্রেণি: {getSchoolClassNameBn(childClass)} ({myChild.section}) · আনন্দ পাঠশালা, কুষ্টিয়া
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChildWeeklyModal(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Day Switcher Tabs */}
            <div className="p-3 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                {DAYS_OF_WEEK_CONFIG.map((d: { id: DayOfWeek; nameBn: string }) => {
                  const dayCount = getPeriodsForClass(allRoutines, childClass, d.id).length;
                  const isActive = selectedChildDayTab === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedChildDayTab(d.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>{d.nameBn}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {dayCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const csv = exportClassRoutineToCsv(allRoutines, childClass);
                    downloadClassRoutineCsv(csv, `${childClass}_routine.csv`);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="CSV এক্সপোর্ট করুন"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>প্রিন্ট</span>
                </button>
              </div>
            </div>

            {/* Modal Body / Periods for Selected Day */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">
                  {getDayNameBn(selectedChildDayTab)}-এর সময়সূচি
                </span>
                <span>মোট পিরিয়ড: {childWeeklyPeriodsForSelectedDay.length} টি</span>
              </div>

              {childWeeklyPeriodsForSelectedDay.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                  <p className="text-xs font-bold text-slate-700">
                    {getDayNameBn(selectedChildDayTab)} কোনো ক্লাস নির্ধারিত নেই।
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {childWeeklyPeriodsForSelectedDay.map((p) => (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        p.isBreak
                          ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            p.isBreak
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {p.isBreak ? '☕' : p.periodNo}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              {p.subject}
                            </h4>
                            {p.isBreak ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                বিরতি
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-700">
                                ({p.teacherNameBn})
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            রুম: {p.roomBn || p.room} {(p.topicBn || p.topic) && `· পাঠ: ${p.topicBn || p.topic}`}
                          </p>
                          {!p.isBreak && p.lessonPlanSummaryBn && (
                            <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 text-[11px]">
                              <p className="text-slate-700 leading-relaxed">
                                <strong className="text-emerald-950">📝 পাঠ পরিকল্পনা:</strong>{' '}
                                {p.lessonPlanSummaryBn}
                              </p>
                              {(p.homeworkAssignmentBn || p.homeworkOrActivityBn) && (
                                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-amber-950 font-bold">
                                    📚 <strong>বাড়ির কাজ (Homework):</strong>{' '}
                                    {p.homeworkAssignmentBn || p.homeworkOrActivityBn}
                                  </p>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-950">
                                    জমা: {p.homeworkDueDateBn || 'পরবর্তী ক্লাসে জমা'}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {!p.isBreak && p.resources && p.resources.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 text-[10px] mt-1.5">
                              <span className="font-bold text-slate-500">🏫 ক্লাসরুম রিসোর্স:</span>
                              {p.resources.map((resId) => {
                                const res = getResourceById(resId);
                                return (
                                  <span
                                    key={resId}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold"
                                    title={res?.descriptionBn}
                                  >
                                    <span>{res?.icon || '📦'}</span>
                                    <span>{res?.nameBn.split(' (')[0] || resId}</span>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-700 shrink-0 self-end sm:self-center">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{p.startTime} - {p.endTime}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          ({p.durationMinutes} মি.)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                আনন্দ পাঠশালা স্মার্ট প্যারেন্ট পোর্টাল · কুষ্টিয়া
              </span>
              <button
                type="button"
                onClick={() => setShowChildWeeklyModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Card Summary for Parent: Today's Diary & Tiffin, Holistic Skill Card, and bKash Fee */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Today's Classroom Diary & Tiffin */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                আজকের ক্লাস ডায়েরি ও টিফিন
              </span>
              <Smile className="w-4 h-4 text-amber-500" />
            </div>
            {childDiaryPosts[0] && (
              <>
                {childDiaryPosts[0].activityType === 'homework_task' && childDiaryPosts[0].homeworkTask && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>📚</span>
                      <span>বাড়ির কাজ: <strong>{childDiaryPosts[0].homeworkTask.subjectBn}</strong></span>
                    </span>
                    <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full">
                      জমা: {childDiaryPosts[0].homeworkTask.dueDateBn}
                    </span>
                  </div>
                )}
                {childDiaryPosts[0].photoUrl && (
                  <img
                    src={childDiaryPosts[0].photoUrl}
                    alt={childDiaryPosts[0].titleBn}
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover rounded-xl border border-slate-200"
                  />
                )}
                <h4 className="text-sm font-bold text-slate-900">
                  {childDiaryPosts[0].titleBn}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {childDiaryPosts[0].descriptionBn}
                </p>
                {childDiaryPosts[0].snackDetail && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                    🍎 <strong>আজকের টিফিন:</strong> {childDiaryPosts[0].snackDetail.itemBn} (সম্পূর্ণ খেয়েছে ✓)
                  </div>
                )}
              </>
            )}
          </div>
          <button
            onClick={() => onNavigateTab('diary')}
            className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
          >
            <span>ডায়েরির সব ছবি দেখুন ও কমেন্ট করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Child's Skill & Growth Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800">
                হোলিস্টিক স্কিল প্রগ্রেস কার্ড
              </span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <span className="text-xs font-black text-amber-950 block">
                {childAssessment?.overallBadgeBn || '🌟 নক্ষত্র প্রতিভা (Star Explorer)'}
              </span>
              <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                {childAssessment?.teacherRemarksBn}
              </p>
            </div>
            {childAssessment && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">উচ্চতা (Height)</span>
                  <span className="font-bold text-slate-900">
                    {childAssessment.growth.heightCm} সে.মি.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">ওজন (Weight)</span>
                  <span className="font-bold text-slate-900">
                    {childAssessment.growth.weightKg} কেজি
                  </span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigateTab('skills')}
            className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
          >
            <span>পূর্ণাঙ্গ রিপোর্ট কার্ড দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Authorized Pickup Whitelist & Tuition Fee */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700">
                টিউশন ফি ও গেট-পাস কার্ড
              </span>
              <CreditCard className="w-4 h-4 text-rose-500" />
            </div>

            {unpaidInvoice ? (
              <div
                className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  isFeeDueSoon
                    ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                    : 'bg-rose-50/70 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-950">{unpaidInvoice.monthBn}</span>
                  <span className="text-base font-black text-rose-600 font-mono">
                    ৳ {unpaidInvoice.netAmount}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <span className="text-slate-600">শেষ তারিখ: {unpaidInvoice.dueDate}</span>
                  {daysUntilDue !== null && daysUntilDue <= 3 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                      {daysUntilDue === 3
                        ? 'আর ৩ দিন বাকি'
                        : daysUntilDue === 2
                        ? 'আর ২ দিন বাকি'
                        : daysUntilDue === 1
                        ? 'আগামীকাল শেষ'
                        : daysUntilDue === 0
                        ? 'আজই শেষ দিন'
                        : 'অতিবাহিত'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  বিকাশ পেমেন্ট গেটওয়ে প্রস্তুত · এক ক্লিকে পরিশোধ করুন
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                ✓ চলতি মাসের সকল টিউশন ফি পরিশোধিত রয়েছে।
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-700 block">
                অনুমোদিত পিক-আপ অভিভাবক ({myChild.authorizedPickups.length} জন):
              </span>
              {myChild.authorizedPickups.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/70"
                >
                  <span className="font-semibold text-slate-800">
                    {p.avatarIcon} {p.nameBn} ({p.relationBn})
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">ভেরিফাইড ✓</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigateTab('fees')}
              className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>বিকাশ পেমেন্ট ও হিস্ট্রি</span>
            </button>
            <button
              onClick={() => onNavigateTab('pickup')}
              className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>গেট-পাস কার্ড</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Parent Portal Section: Auto-Generated Downloadable PDF Money Receipts */}
      <div className="bg-white rounded-3xl border-2 border-emerald-300 p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                  📄 অটো-জেনারেটেড PDF রসিদ ভল্ট (Parent Receipt Vault)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                  ভর্তির তারিখ: {childFeeConfig.admissionDateBn}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                {myChild.nameBn}-এর পরিশোধিত ফিসের ডাউনলোডযোগ্য PDF মানি রসিদসমূহ ({toBengaliNumber(paidChildReceipts.length)}টি)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                অ্যাডমিন প্যানেল থেকে পেমেন্ট কনফার্ম হওয়ার সাথে সাথে স্বয়ংক্রিয়ভাবে তৈরিকৃত অফিসিয়াল PDF মানি রসিদ সরাসরি ডাউনলোড করুন।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('fees')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 self-start lg:self-center shrink-0 cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>সম্পূর্ণ ফি চার্ট ও সকল ইনভয়েস দেখুন</span>
          </button>
        </div>

        {downloadedBannerFile && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                অফিসিয়াল PDF মানি রসিদ (<strong>{downloadedBannerFile}</strong>) আপনার ডিভাইসে সফলভাবে ডাউনলোড হয়েছে!
              </span>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {paidChildReceipts.map((rcpt) => (
            <div
              key={rcpt.id}
              className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 hover:border-emerald-400 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-black text-slate-900 truncate">
                    {rcpt.monthBn}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1 shrink-0">
                    <BadgeCheck className="w-3 h-3" />
                    <span>PDF প্রস্তুত</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>রসিদ নং: {rcpt.invoiceNo}</span>
                  <span>মাধ্যম: {rcpt.paymentMethod || 'Cash'}</span>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-emerald-100">
                  <span className="text-[11px] text-slate-600 font-semibold">পরিশোধিত অর্থ:</span>
                  <span className="text-base font-black font-mono text-emerald-700">
                    ৳ {toBengaliNumber(rcpt.netAmount.toLocaleString())}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>তারিখ: {rcpt.paidAt || childFeeConfig.admissionDateBn}</span>
                  <span className="text-emerald-800 font-semibold">
                    {rcpt.confirmedByBn || 'অ্যাডমিন ভেরিফাইড'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleParentDownloadPdf(rcpt)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF রসিদ ডাউনলোড (.pdf)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setParentPreviewReceipt(rcpt)}
                  className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                  title="রসিদ প্রিভিউ দেখুন"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parent Portal Receipt Preview & Direct PDF Download Modal */}
      {parentPreviewReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-emerald-300 space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-1 border-b-2 border-dashed border-slate-200 pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>অফিসিয়াল ডিজিটাল মানি রসিদ (Official PDF Receipt)</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1">আনন্দ পাঠশালা</h3>
              <p className="text-[11px] text-slate-500">
                ফাইল:{' '}
                <span className="font-mono font-bold text-indigo-700">
                  {getReceiptPdfFileName(parentPreviewReceipt)}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">রসিদ নম্বর:</span>
                <span className="font-mono font-black text-slate-900">
                  {parentPreviewReceipt.invoiceNo}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">পরিশোধের তারিখ:</span>
                <span className="font-bold text-slate-800">
                  {parentPreviewReceipt.paidAt || childFeeConfig.admissionDateBn}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">শিক্ষার্থী:</span>
                <span className="font-black text-slate-900">{myChild.nameBn}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">ভর্তির তারিখ:</span>
                <span className="font-bold text-amber-900">
                  {parentPreviewReceipt.admissionDateBn || childFeeConfig.admissionDateBn}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-slate-100 px-3.5 py-2 flex justify-between font-black text-slate-700">
                <span>ফিসের বিবরণ ({parentPreviewReceipt.monthBn})</span>
                <span>টাকার পরিমাণ (৳)</span>
              </div>
              <div className="p-3.5 space-y-2 divide-y divide-slate-100">
                {parentPreviewReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between pt-1.5 first:pt-0">
                    <span className="text-slate-700 font-medium">{item.nameBn}</span>
                    <span className="font-mono font-bold text-slate-900">
                      ৳ {toBengaliNumber(item.amount)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-2.5 text-sm font-black text-slate-900">
                  <span>সর্বমোট পরিশোধিত অর্থ:</span>
                  <span className="font-mono text-emerald-700 text-base">
                    ৳ {toBengaliNumber(parentPreviewReceipt.netAmount.toLocaleString())}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleParentDownloadPdf(parentPreviewReceipt)}
                className="flex-1 py-2.5 px-4 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>সরাসরি PDF রসিদ ডাউনলোড করুন (.pdf)</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-3.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>প্রিন্ট</span>
              </button>
              <button
                type="button"
                onClick={() => setParentPreviewReceipt(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                বন্ধ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
