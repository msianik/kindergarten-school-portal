import React, { useState, useMemo, useEffect } from 'react';
import { 
  Student, 
  AttendanceRecord, 
  SchoolClass, 
  UserRole, 
  ConsistencyTier,
  StaffAttendanceRecord,
  StaffAttendanceStatus,
  FcmNotification
} from '../types/school';
import {
  calculateAttendanceStats,
  MONTH_OPTIONS,
  generateMonthlyAttendanceSummary,
  exportAttendanceToCsv,
  downloadAttendanceCsvFile,
  ALL_SCHOOL_CLASSES,
  isSameSchoolClass,
  toBengaliNumber,
  getSchoolClassNameBn,
} from '../utils/schoolLogic';
import { INITIAL_STAFF_ATTENDANCE, SCHOOL_TEACHERS } from '../data/mockData';
import { 
  CalendarCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  Smartphone,
  Users,
  Download,
  FileSpreadsheet,
  TrendingUp,
  Sparkles,
  Search,
  Copy,
  Check,
  Printer,
  Calendar,
  AlertTriangle,
  Award,
  Eye,
  SlidersHorizontal,
  FileText,
  Briefcase,
  UserCheck,
  UserX,
  ShieldCheck,
  CheckCheck,
  Building2,
  RefreshCw,
  X,
  BellRing,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { exportMonthlyAttendancePdf, generateAttendancePdfHtml } from '../utils/attendancePdfExport';
import { AbsentAlertModal } from './dashboard/AbsentAlertModal';

const PRE_SCHOOL_LATE_REASONS = [
  'দেরিতে ঘুম থেকে ওঠা',
  'যানজট ও রাস্তায় দেরি',
  'বৃষ্টি ও বৈরী আবহাওয়া',
  'ডাক্তারের কাছে যাওয়া',
  'অভিভাবকের জরুরি কাজ',
  'অন্যান্য কারণ',
];

const PRE_SCHOOL_ABSENT_REASONS = [
  'জ্বর ও শারীরিক অসুস্থতা',
  'পারিবারিক অনুষ্ঠান বা সফর',
  'বৃষ্টি ও যাতায়াত সমস্যা',
  'পূর্বানুমোদিত বিশেষ ছুটি',
  'অন্যান্য কারণ',
];

interface AttendanceModuleProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  currentRole: UserRole;
  loggedInTeacherNameBn?: string;
  onSendAttendanceNotification?: (notif: FcmNotification) => void;
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({
  students,
  attendanceRecords,
  onUpdateAttendance,
  currentRole,
  loggedInTeacherNameBn,
  onSendAttendanceNotification,
}) => {
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('HateKhori');
  const [smsSentToast, setSmsSentToast] = useState<string | null>(null);
  const [attendanceDateStr, setAttendanceDateStr] = useState<string>('আজ, ০৮ নভেম্বর ২০২৬ (রবিবার)');
  const [isAbsentModalOpen, setIsAbsentModalOpen] = useState(false);
  const [dailySearchQuery, setDailySearchQuery] = useState('');
  const [dailyStatusFilter, setDailyStatusFilter] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [activeLateStudentId, setActiveLateStudentId] = useState<string | null>(null);
  const [activeAbsentStudentId, setActiveAbsentStudentId] = useState<string | null>(null);
  const [alertSuccessBanner, setAlertSuccessBanner] = useState<string | null>(null);

  // ==========================================
  // Staff Attendance & Digital Check-In State
  // ==========================================
  const [attendanceViewTab, setAttendanceViewTab] = useState<'students' | 'staff'>('students');
  const [staffAttendanceList, setStaffAttendanceList] = useState<StaffAttendanceRecord[]>(INITIAL_STAFF_ATTENDANCE);
  const [selectedStaffTeacherId, setSelectedStaffTeacherId] = useState<string>(() => {
    if (loggedInTeacherNameBn) {
      const match = SCHOOL_TEACHERS.find(
        (t) => t.nameBn.includes(loggedInTeacherNameBn) || loggedInTeacherNameBn.includes(t.nameBn)
      );
      if (match) return match.id;
    }
    return SCHOOL_TEACHERS[1]?.id || 'tch-2';
  });
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffStatusFilter, setStaffStatusFilter] = useState<'all' | StaffAttendanceStatus>('all');
  const [staffCheckInToast, setStaffCheckInToast] = useState<string | null>(null);
  const [currentLiveClock, setCurrentLiveClock] = useState<string>(() => {
    return new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  // Keep live clock updated every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLiveClock(
        new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Digital check-in for teacher with timestamp
  const handleTeacherDigitalCheckIn = (teacherId: string) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    // Standard morning arrival cut-off: 08:00 AM; grace period up to 08:15 AM
    const isLateCheckIn = currentHour > 8 || (currentHour === 8 && currentMin > 15);
    const lateMinutes = isLateCheckIn ? Math.max(1, (currentHour - 8) * 60 + (currentMin - 15)) : 0;

    const teacher = SCHOOL_TEACHERS.find((t) => t.id === teacherId);
    const teacherName = teacher?.nameBn || 'শিক্ষক';

    setStaffAttendanceList((prev) =>
      prev.map((rec) => {
        if (rec.teacherId === teacherId) {
          return {
            ...rec,
            status: isLateCheckIn ? 'late' : 'present',
            checkInTime: timeFormatted,
            checkInTimestamp: now.getTime(),
            checkInMethod: 'self_digital',
            isLate: isLateCheckIn,
            lateMinutes: isLateCheckIn ? lateMinutes : undefined,
            remarksBn: isLateCheckIn
              ? `${toBengaliNumber(lateMinutes)} মিনিট বিলম্বে ডিজিটাল চেক-ইন সম্পন্ন হয়েছে।`
              : 'নির্ধারিত সময়ে প্রাতঃকালীন ডিজিটাল চেক-ইন সফল হয়েছে।',
          };
        }
        return rec;
      })
    );

    setStaffCheckInToast(
      `✓ ${teacherName} এর ডিজিটাল চেক-ইন সম্পন্ন হয়েছে (সময়: ${timeFormatted}${
        isLateCheckIn ? `, ${toBengaliNumber(lateMinutes)} মিনিট বিলম্ব` : ', অন-টাইম'
      })!`
    );
    setTimeout(() => setStaffCheckInToast(null), 6000);
  };

  const handleSetStaffStatus = (teacherId: string, status: StaffAttendanceStatus) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    setStaffAttendanceList((prev) =>
      prev.map((rec) => {
        if (rec.teacherId === teacherId) {
          return {
            ...rec,
            status,
            checkInTime: status === 'present' ? timeFormatted : status === 'late' ? timeFormatted : undefined,
            checkInMethod: 'admin_manual',
            isLate: status === 'late',
            remarksBn: status === 'leave' ? 'ছুটি অনুমোদিত।' : status === 'absent' ? 'অনুপস্থিত।' : rec.remarksBn,
          };
        }
        return rec;
      })
    );
  };

  const handleBulkCheckInStaff = () => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    let updatedCount = 0;
    setStaffAttendanceList((prev) =>
      prev.map((rec) => {
        if (rec.status === 'absent') {
          updatedCount++;
          return {
            ...rec,
            status: 'present',
            checkInTime: timeFormatted,
            checkInTimestamp: now.getTime(),
            checkInMethod: 'admin_manual',
            remarksBn: 'প্রশাসনিক তত্ত্বাবধানে একযোগে চেক-ইন সম্পন্ন।',
          };
        }
        return rec;
      })
    );
    setStaffCheckInToast(`✓ ${toBengaliNumber(updatedCount)} জন শিক্ষক ও কর্মীর চেক-ইন সম্পন্ন করা হয়েছে!`);
    setTimeout(() => setStaffCheckInToast(null), 5000);
  };

  const staffStats = useMemo(() => {
    const total = staffAttendanceList.length;
    const present = staffAttendanceList.filter((s) => s.status === 'present').length;
    const late = staffAttendanceList.filter((s) => s.status === 'late').length;
    const leave = staffAttendanceList.filter((s) => s.status === 'leave').length;
    const absent = staffAttendanceList.filter((s) => s.status === 'absent').length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { total, present, late, leave, absent, rate };
  }, [staffAttendanceList]);

  const filteredStaffRecords = useMemo(() => {
    return staffAttendanceList.filter((stf) => {
      const matchesStatus = staffStatusFilter === 'all' || stf.status === staffStatusFilter;
      if (!staffSearchQuery.trim()) return matchesStatus;

      const q = staffSearchQuery.toLowerCase().trim();
      const matchesSearch =
        stf.teacherNameBn.toLowerCase().includes(q) ||
        stf.teacherNameEn.toLowerCase().includes(q) ||
        stf.designationBn.toLowerCase().includes(q) ||
        (stf.departmentBn && stf.departmentBn.toLowerCase().includes(q)) ||
        (stf.phone && stf.phone.includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [staffAttendanceList, staffStatusFilter, staffSearchQuery]);

  const handleExportStaffCsv = () => {
    const headers = [
      'Teacher ID',
      'Name (Bengali)',
      'Name (English)',
      'Designation',
      'Department',
      'Phone',
      'Date',
      'Check-In Time',
      'Status',
      'Check-In Method',
      'Late Minutes',
      'Remarks',
    ];
    const rows = filteredStaffRecords.map((r) => [
      `"${r.teacherId}"`,
      `"${r.teacherNameBn}"`,
      `"${r.teacherNameEn}"`,
      `"${r.designationBn}"`,
      `"${r.departmentBn || ''}"`,
      `"${r.phone || ''}"`,
      `"${r.date}"`,
      `"${r.checkInTime || '—'}"`,
      `"${
        r.status === 'present'
          ? 'Present (উপস্থিত)'
          : r.status === 'late'
          ? 'Late (বিলম্বিত)'
          : r.status === 'leave'
          ? 'Leave (ছুটি)'
          : 'Absent / Pending'
      }"`,
      `"${
        r.checkInMethod === 'self_digital'
          ? 'Digital Self'
          : r.checkInMethod === 'biometric'
          ? 'Biometric'
          : 'Admin'
      }"`,
      `"${r.lateMinutes || 0}"`,
      `"${r.remarksBn || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadAttendanceCsvFile(csvContent, 'ananda_pathshala_staff_attendance_2026-11-06.csv');
    setStaffCheckInToast('📥 শিক্ষক ও স্টাফ হাজিরা CSV ফাইল সফলভাবে ডাউনলোড হয়েছে!');
    setTimeout(() => setStaffCheckInToast(null), 5000);
  };

  // ==========================================
  // Monthly Attendance Summary & CSV State
  // ==========================================
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-10');
  const [selectedReportClass, setSelectedReportClass] = useState<SchoolClass | 'all'>('all');
  const [consistencyFilter, setConsistencyFilter] = useState<'all' | ConsistencyTier>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const isStaffOrAdmin = ['principal', 'teacher', 'super_admin'].includes(currentRole);

  const classStudents = useMemo(() => {
    return students.filter((s) => isSameSchoolClass(s.className, selectedClass));
  }, [students, selectedClass]);

  const classRecords = useMemo(() => {
    return attendanceRecords.filter((r) => isSameSchoolClass(r.className, selectedClass));
  }, [attendanceRecords, selectedClass]);

  const stats = calculateAttendanceStats(classRecords);

  const filteredClassStudents = useMemo(() => {
    return classStudents.filter((std) => {
      const record = attendanceRecords.find((r) => r.studentId === std.id);
      const currentStat = record?.status || 'present';

      if (dailyStatusFilter !== 'all' && currentStat !== dailyStatusFilter) {
        return false;
      }

      if (dailySearchQuery.trim()) {
        const q = dailySearchQuery.toLowerCase().trim();
        const matches =
          std.nameBn.toLowerCase().includes(q) ||
          std.nameEn.toLowerCase().includes(q) ||
          std.rollNo.includes(q) ||
          (std.fatherNameBn && std.fatherNameBn.toLowerCase().includes(q)) ||
          (std.emergencyPhone && std.emergencyPhone.includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [classStudents, attendanceRecords, dailyStatusFilter, dailySearchQuery]);

  const absentStudentsList = useMemo(() => {
    return classStudents
      .map((std) => {
        const record = attendanceRecords.find((r) => r.studentId === std.id);
        return { student: std, record };
      })
      .filter((item) => item.record?.status === 'absent');
  }, [classStudents, attendanceRecords]);

  // Generate monthly attendance summary for the chosen month and class scope
  const { summaries: allMonthlySummaries, meta: reportMeta } = useMemo(() => {
    return generateMonthlyAttendanceSummary(
      students,
      attendanceRecords,
      selectedMonthKey,
      selectedReportClass
    );
  }, [students, attendanceRecords, selectedMonthKey, selectedReportClass]);

  // Filtered summaries based on user search and consistency tier
  const filteredSummaries = useMemo(() => {
    return allMonthlySummaries.filter((item) => {
      const matchesTier =
        consistencyFilter === 'all' || item.consistencyTier === consistencyFilter;

      if (!searchQuery.trim()) return matchesTier;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        item.nameBn.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.rollNo.toLowerCase().includes(q) ||
        item.className.toLowerCase().includes(q) ||
        item.remarksBn.toLowerCase().includes(q) ||
        item.guardianNameBn.toLowerCase().includes(q);

      return matchesTier && matchesSearch;
    });
  }, [allMonthlySummaries, consistencyFilter, searchQuery]);

  // Export & Download CSV
  const handleExportCsv = (scopeOverride?: SchoolClass | 'all') => {
    const targetScope = scopeOverride ?? selectedReportClass;
    const { summaries: exportData, meta: exportMeta } = generateMonthlyAttendanceSummary(
      students,
      attendanceRecords,
      selectedMonthKey,
      targetScope
    );

    const classLabelBn =
      targetScope === 'all' ? 'সকল শ্রেণি (All Classes)' : `${targetScope} শ্রেণি`;

    const csvContent = exportAttendanceToCsv(exportData, exportMeta, classLabelBn);
    const monthSlug = exportMeta.monthNameEn.toLowerCase();
    const classSlug = targetScope.toLowerCase();
    const filename = `ananda_pathshala_monthly_attendance_${classSlug}_${monthSlug}_${exportMeta.year}.csv`;

    downloadAttendanceCsvFile(csvContent, filename);

    setSmsSentToast(
      `📥 "${classLabelBn}" এর ${exportMeta.monthNameBn} এর মাসিক হাজিরা CSV রিপোর্ট সফলভাবে ডাউনলোড হয়েছে!`
    );
    setTimeout(() => setSmsSentToast(null), 5000);
  };

  // Export & Download / Print Official PDF Record
  const handleExportPdf = (scopeOverride?: SchoolClass | 'all') => {
    const targetScope = scopeOverride ?? selectedReportClass;
    const { summaries: exportData, meta: exportMeta } = generateMonthlyAttendanceSummary(
      students,
      attendanceRecords,
      selectedMonthKey,
      targetScope
    );

    const classLabelBn =
      targetScope === 'all' ? 'সকল শ্রেণি (All Classes)' : `${targetScope} শ্রেণি`;

    const success = exportMonthlyAttendancePdf(exportData, exportMeta, classLabelBn);
    if (success) {
      setSmsSentToast(
        `📄 "${classLabelBn}" এর ${exportMeta.monthNameBn} এর অফিশিয়াল মাসিক হাজিরা PDF প্রিন্ট ও সেভ ডায়ালগ প্রস্তুত হয়েছে!`
      );
    } else {
      setShowPdfPreviewModal(true);
    }
    setTimeout(() => setSmsSentToast(null), 6000);
  };

  // Copy CSV to Clipboard
  const handleCopyCsvToClipboard = () => {
    const classLabelBn =
      selectedReportClass === 'all' ? 'সকল শ্রেণি' : `${selectedReportClass} শ্রেণি`;
    const csvContent = exportAttendanceToCsv(filteredSummaries, reportMeta, classLabelBn);

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(csvContent).then(() => {
        setCopyFeedback('✅ CSV ডেটা ক্লিপবোর্ডে কপি করা হয়েছে! Excel বা Google Sheets-এ পেস্ট করতে পারবেন।');
        setTimeout(() => setCopyFeedback(null), 4000);
      });
    } else {
      setCopyFeedback('ক্লিপবোর্ডে কপি সমর্থন করে না। ডাউনলোড বাটন ব্যবহার করুন।');
      setTimeout(() => setCopyFeedback(null), 4000);
    }
  };

  const handleSetStatus = (studentId: string, status: 'present' | 'absent' | 'late', reason?: string) => {
    const existingIndex = attendanceRecords.findIndex((r) => r.studentId === studentId);
    let updated: AttendanceRecord[];

    if (existingIndex >= 0) {
      updated = attendanceRecords.map((r) => {
        if (r.studentId === studentId) {
          return {
            ...r,
            status,
            checkInTime: status === 'present' ? (r.checkInTime || 'সকাল ০৮:৪৫') : status === 'late' ? (r.checkInTime || 'সকাল ০৯:১৫') : undefined,
            lateReasonBn: status === 'late' ? (reason ?? r.lateReasonBn ?? 'দেরিতে ঘুম থেকে ওঠা') : undefined,
            absentReasonBn: status === 'absent' ? (reason ?? r.absentReasonBn) : undefined,
          };
        }
        return r;
      });
    } else {
      const std = students.find((s) => s.id === studentId);
      if (std) {
        const newRecord: AttendanceRecord = {
          studentId: std.id,
          studentNameBn: std.nameBn,
          rollNo: std.rollNo,
          className: std.className,
          status,
          checkInTime: status === 'present' ? 'সকাল ০৮:৪৫' : status === 'late' ? 'সকাল ০৯:১৫' : undefined,
          lateReasonBn: status === 'late' ? (reason || 'দেরিতে প্রবেশ') : undefined,
          absentReasonBn: status === 'absent' ? reason : undefined,
        };
        updated = [...attendanceRecords, newRecord];
      } else {
        updated = attendanceRecords;
      }
    }
    onUpdateAttendance(updated);
  };

  const handleMarkAllPresent = () => {
    const updated = [...attendanceRecords];
    classStudents.forEach((std) => {
      const idx = updated.findIndex((r) => r.studentId === std.id);
      if (idx >= 0) {
        updated[idx] = {
          ...updated[idx],
          status: 'present',
          checkInTime: 'সকাল ০৮:৪৫',
          lateReasonBn: undefined,
          absentReasonBn: undefined,
        };
      } else {
        updated.push({
          studentId: std.id,
          studentNameBn: std.nameBn,
          rollNo: std.rollNo,
          className: std.className,
          status: 'present',
          checkInTime: 'সকাল ০৮:৪৫',
        });
      }
    });

    onUpdateAttendance(updated);
    setSmsSentToast(`✓ ${getSchoolClassNameBn(selectedClass)} শ্রেণির সকল (${toBengaliNumber(classStudents.length)} জন) শিক্ষার্থীকে সফলভাবে উপস্থিত মার্ক করা হয়েছে!`);
    setTimeout(() => setSmsSentToast(null), 4000);
  };

  const handleResetAttendance = () => {
    if (!confirm(`${getSchoolClassNameBn(selectedClass)} শ্রেণির আজকের হাজিরা রিসেট করতে চান?`)) return;
    const updated = attendanceRecords.filter(
      (r) => !classStudents.some((std) => std.id === r.studentId)
    );
    onUpdateAttendance(updated);
    setSmsSentToast(`✓ ${getSchoolClassNameBn(selectedClass)} শ্রেণির হাজিরা রিসেট করা হয়েছে।`);
    setTimeout(() => setSmsSentToast(null), 3000);
  };

  const handleSendAbsentSms = () => {
    if (absentStudentsList.length === 0) {
      alert(`এই শ্রেণিতে (${getSchoolClassNameBn(selectedClass)}) বর্তমানে কোনো অনুপস্থিত শিক্ষার্থী নেই।`);
      return;
    }
    setIsAbsentModalOpen(true);
  };

  const handleSendAlertsFromModal = ({
    selectedStudentIds,
    channel,
    messageTemplate,
    notifications,
  }: {
    selectedStudentIds: string[];
    channel: 'sms' | 'push' | 'both';
    messageTemplate: string;
    notifications: FcmNotification[];
  }) => {
    if (onSendAttendanceNotification) {
      notifications.forEach((notif) => {
        onSendAttendanceNotification(notif);
      });
    }

    const channelText =
      channel === 'both' ? 'এসএমএস ও পুশ নোটিফিকেশন' : channel === 'sms' ? 'মোবাইল এসএমএস' : 'অ্যাপ পুশ অ্যালার্ট';
    const msg = `✓ সফলভাবে ${toBengaliNumber(selectedStudentIds.length)} জন শিক্ষার্থীর অভিভাবকের কাছে ${channelText} পাঠানো হয়েছে!`;
    setAlertSuccessBanner(msg);
    setTimeout(() => setAlertSuccessBanner(null), 8000);
  };

  return (
    <div className="space-y-6">
      {/* Top Segment Controller: Student Attendance vs Staff Attendance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAttendanceViewTab('students')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              attendanceViewTab === 'students'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>শিক্ষার্থী হাজিরা (Student Attendance)</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                attendanceViewTab === 'students' ? 'bg-teal-900 text-teal-100' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {students.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAttendanceViewTab('staff')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              attendanceViewTab === 'staff'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>শিক্ষক ও স্টাফ ডিজিটাল হাজিরা (Staff Attendance)</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                attendanceViewTab === 'staff' ? 'bg-indigo-900 text-indigo-100' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {staffAttendanceList.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 px-2">
          <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="hidden md:inline text-slate-400">আজ:</span>
          <span className="font-bold text-slate-800">০৬ নভেম্বর ২০২৬ (শুক্রবার)</span>
          <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {currentLiveClock}
          </span>
        </div>
      </div>

      {/* Staff Check-In Feedback Toast */}
      {staffCheckInToast && (
        <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 text-white shadow-xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{staffCheckInToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setStaffCheckInToast(null)}
            className="text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {attendanceViewTab === 'students' ? (
        <div className="space-y-6">
          {/* Banner */}
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-teal-400/30 text-teal-100 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
              দৈনিক ডিজিটাল রোল কল
            </span>
            <span className="text-white/60 text-xs">·</span>
            <span className="text-white/90 text-xs font-medium">স্মার্ট অ্যাটেনডেন্স ও অভিভাবক এলার্ট</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">দৈনিক ক্লাসরুম হাজিরা ও বাল্ক এসএমএস</h2>
          <p className="text-teal-100/90 text-sm max-w-2xl mt-1">
            এক ক্লিকে উপস্থিতি নিশ্চিত করুন। কোনো শিশু অনুপস্থিত থাকলে তাৎক্ষণিকভাবে অভিভাবকের ফোনে সতর্কবার্তা এসএমএস চলে যাবে।
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {isStaffOrAdmin && (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedReportClass(selectedClass);
                  setShowMonthlyModal(true);
                }}
                className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                title="শিক্ষার্থীদের ধারাবাহিকতা পর্যবেক্ষণ ও মাসিক সামারি CSV ডাউনলোড করুন"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-950" />
                <span>মাসিক রিপোর্ট ও CSV Export</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportCsv(selectedClass)}
                className="px-3.5 py-2.5 bg-teal-900/80 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border border-teal-400/40"
                title={`${selectedClass} শ্রেণির চলতি মাসের CSV ফাইল সরাসরি ডাউনলোড করুন`}
              >
                <Download className="w-4 h-4 text-teal-200" />
                <span className="hidden sm:inline">CSV ডাউনলোড</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportPdf(selectedClass)}
                className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border border-rose-300/40"
                title={`${selectedClass} শ্রেণির চলতি মাসের অফিশিয়াল PDF হাজিরা রেকর্ড ডাউনলোড ও প্রিন্ট করুন`}
              >
                <FileText className="w-4 h-4 text-rose-100" />
                <span className="hidden sm:inline">PDF রেকর্ড</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleSendAbsentSms}
            className="px-4 py-2.5 bg-white text-teal-900 hover:bg-teal-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4 text-teal-600" />
            অনুপস্থিতির SMS পাঠান
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {smsSentToast && (
        <div className="bg-slate-900 border border-teal-500 rounded-xl p-4 text-white shadow-xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs">
            <Smartphone className="w-4 h-4 text-teal-400" />
            <span>{smsSentToast}</span>
          </div>
          <button onClick={() => setSmsSentToast(null)} className="text-xs text-slate-400 hover:text-white cursor-pointer font-bold">
            ✕ বন্ধ
          </button>
        </div>
      )}

      {/* Alert Success Banner */}
      {alertSuccessBanner && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-3 animate-in fade-in border border-emerald-400/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">{alertSuccessBanner}</p>
              <p className="text-[11px] text-teal-100">অভিভাবকের স্মার্টফোনে পুশ নোটিফিকেশন ও মেসেজ পৌঁছে দেওয়া হয়েছে।</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAlertSuccessBanner(null)}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg cursor-pointer font-semibold transition shrink-0"
          >
            ঠিক আছে
          </button>
        </div>
      )}

      {/* Class Selector & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <label className="text-xs font-bold text-slate-700 block">শ্রেণি পরিবর্তন করুন:</label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_SCHOOL_CLASSES.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedClass === cls.id
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cls.nameBn}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[11px] text-emerald-800 font-medium block">উপস্থিত শিক্ষার্থী (Present)</span>
          <span className="text-2xl font-bold text-emerald-700 font-mono mt-1 block">
            {stats.present} জন
          </span>
          <span className="text-[10px] text-emerald-600">উপস্থিতির হার: {stats.presentRate}%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-[11px] text-rose-800 font-medium block">অনুপস্থিত (Absent)</span>
          <span className="text-2xl font-bold text-rose-700 font-mono mt-1 block">
            {stats.absent} জন
          </span>
          <span className="text-[10px] text-rose-500">স্বয়ংক্রিয় এসএমএস সক্রিয়</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-[11px] text-amber-800 font-medium block">বিলম্বে উপস্থিতি (Late)</span>
          <span className="text-2xl font-bold text-amber-700 font-mono mt-1 block">
            {stats.late} জন
          </span>
          <span className="text-[10px] text-amber-600">দেরিতে প্রবেশ</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Monthly Attendance Consistency Tracker Strip (Student Consistency Over Time)*/}
      {/* ========================================================================= */}
      {isStaffOrAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-5 text-white border border-teal-500/40 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>শিক্ষার্থীদের উপস্থিতি ধারাবাহিকতা ট্র্যাকার</span>
                  <span className="text-teal-300 font-normal">({reportMeta.monthNameBn})</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  গড় উপস্থিতি হার: {reportMeta.avgAttendanceRate}%
                </span>
              </div>
              <p className="text-xs text-teal-200/90 mt-0.5">
                দীর্ঘমেয়াদী শিক্ষার্থীর উপস্থিতি প্যাটার্ন ট্র্যাক করুন, নিয়মিত উপস্থিতি নিশ্চিত করুন এবং এক ক্লিকে অফিশিয়াল CSV ফাইল এক্সপোর্ট করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Quick Metrics Pills */}
            <div className="hidden xl:flex items-center gap-2.5 text-xs pr-2 border-r border-white/10">
              <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                অসাধারণ: {reportMeta.excellentCount} জন
              </span>
              <span className="inline-flex items-center gap-1 text-teal-200 font-semibold bg-teal-950/60 px-2 py-1 rounded-lg border border-teal-500/30">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                নিয়মিত: {reportMeta.regularCount} জন
              </span>
              <span className="inline-flex items-center gap-1 text-rose-300 font-semibold bg-rose-950/60 px-2 py-1 rounded-lg border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                নজরদারি: {reportMeta.needsAttentionCount} জন
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedReportClass('all');
                setShowMonthlyModal(true);
              }}
              className="px-3.5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>মাসিক সামারি ও ফিল্টার</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportCsv('all')}
              className="px-4 py-2.5 bg-white hover:bg-teal-50 text-teal-900 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="সকল শ্রেণির পূর্ণাঙ্গ মাসিক CSV রিপোর্ট সরাসরি ডাউনলোড করুন"
            >
              <Download className="w-4 h-4 text-teal-700" />
              <span>সকল শ্রেণির CSV ডাউনলোড</span>
            </button>
          </div>
        </div>
      )}

      {/* Attendance Sheet Table (Daily Roll Call) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {selectedClass} শ্রেণির শিক্ষার্থীদের দৈনিক রোল কল তালিকা (৩১ অক্টোবর ২০২৬)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">মোট {classStudents.length} জন শিক্ষার্থী</span>
            {isStaffOrAdmin && (
              <button
                type="button"
                onClick={() => handleExportCsv(selectedClass)}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline inline-flex items-center gap-1 cursor-pointer ml-2"
                title={`${selectedClass} শ্রেণির মাসিক রিপোর্ট CSV ডাউনলোড করুন`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{selectedClass} CSV এক্সপোর্ট</span>
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {classStudents.map((std) => {
            const record = attendanceRecords.find((r) => r.studentId === std.id);
            const currentStat = record?.status || 'present';

            return (
              <div key={std.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${std.avatarColor}`}>
                    {std.rollNo}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{std.nameBn}</h4>
                    <span className="text-xs text-slate-500">{std.nameEn} · পিতা: {std.fatherNameBn}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSetStatus(std.id, 'present')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      currentStat === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    উপস্থিত
                  </button>

                  <button
                    onClick={() => handleSetStatus(std.id, 'late')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      currentStat === 'late'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    বিলম্বে
                  </button>

                  <button
                    onClick={() => handleSetStatus(std.id, 'absent')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      currentStat === 'absent'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    অনুপস্থিত
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
      ) : (
        /* ========================================================================= */
        /* SECTION B: STAFF ATTENDANCE & DIGITAL CHECK-IN                            */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Staff Attendance Header Banner */}
          <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-amber-400">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-200">
                <Briefcase className="w-3.5 h-3.5" />
                <span>প্রাতঃকালীন ডিজিটাল হাজিরা ও স্টাফ রোস্টার</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                শিক্ষক ও স্টাফ ডিজিটাল চেক-ইন ও হাজিরা
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl leading-relaxed">
                বিদ্যালয় শুরুর প্রাক্কালে সকল শিক্ষক ও স্টাফ মেম্বারদের ডিজিটাল চেক-ইন টাইমস্ট্যাম্প নিশ্চিত করুন। নির্ধারিত সময়: সকাল ০৮:০০ ঘটিকা (০৮:১৫ এর পর বিলম্বিত হিসেবে গণ্য)।
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleExportStaffCsv}
                className="px-4 py-3 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold rounded-2xl text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                title="আজকের শিক্ষক ও স্টাফ হাজিরা CSV ডাউনলোড করুন"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                <span>স্টাফ হাজিরা CSV</span>
              </button>

              {isStaffOrAdmin && (
                <button
                  type="button"
                  onClick={handleBulkCheckInStaff}
                  className="px-4 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  title="অপেক্ষমাণ সকল শিক্ষক ও কর্মীকে বর্তমান সময়ে চেক-ইন করান"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>এক ক্লিকে সবাইকে উপস্থিত করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Digital Check-In Hero Card */}
          <div className="bg-white rounded-3xl border-2 border-indigo-200 p-5 sm:p-6 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Live Clock & Shift Rule Info */}
              <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-inner">
                <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-indigo-500/10 pointer-events-none"></div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                    লাইভ ডিজিটাল ঘড়ি · কুষ্টিয়া
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>

                <div className="pt-1">
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white flex items-baseline gap-2">
                    <span>{currentLiveClock}</span>
                  </div>
                  <span className="text-xs text-indigo-200 block mt-1">
                    আজকের তারিখ: ০৬ নভেম্বর ২০২৬ (শুক্রবার)
                  </span>
                </div>

                <div className="pt-2 border-t border-indigo-700/50 text-[11px] text-indigo-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">প্রাতঃকালীন নির্ধারিত সময়:</span>
                    <strong className="text-amber-300">সকাল ০৮:০০ ঘটিকা</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">বিলম্বিত সময় বিবেচনা:</span>
                    <strong className="text-rose-300">সকাল ০৮:১৫ এর পর</strong>
                  </div>
                </div>
              </div>

              {/* Right Column: Teacher Digital Check-In Action Console */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>প্রাতঃকালীন ডিজিটাল চেক-ইন কনসোল</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      সংশ্লিষ্ট শিক্ষক নির্বাচন করে "ডিজিটাল চেক-ইন" বাটনে ক্লিক করুন
                    </p>
                  </div>
                </div>

                {/* Teacher Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    চেক-ইনকারী শিক্ষক / কর্মী নির্বাচন করুন:
                  </label>
                  <select
                    value={selectedStaffTeacherId}
                    onChange={(e) => setSelectedStaffTeacherId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-indigo-200 rounded-xl text-xs sm:text-sm font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {SCHOOL_TEACHERS.map((t) => {
                      const att = staffAttendanceList.find((s) => s.teacherId === t.id);
                      const isCheckedIn = att?.status === 'present' || att?.status === 'late';
                      return (
                        <option key={t.id} value={t.id}>
                          {t.nameBn} — {t.designationBn} {isCheckedIn ? `✓ (চেক-ইন: ${att?.checkInTime})` : '⏳ (অপেক্ষমাণ)'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Status Card & Check-In Button for Selected Teacher */}
                {(() => {
                  const currentTeacher = SCHOOL_TEACHERS.find((t) => t.id === selectedStaffTeacherId);
                  const currentRecord = staffAttendanceList.find((s) => s.teacherId === selectedStaffTeacherId);
                  const isCheckedIn = currentRecord?.status === 'present' || currentRecord?.status === 'late';

                  return (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-base shrink-0 overflow-hidden border border-indigo-200">
                          {currentTeacher?.photoUrl ? (
                            <img
                              src={currentTeacher.photoUrl}
                              alt={currentTeacher.nameBn}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            currentTeacher?.nameBn.slice(0, 1) || 'টি'
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {currentTeacher?.nameBn}
                          </h4>
                          <span className="text-[11px] text-slate-500 block">
                            {currentTeacher?.designationBn}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                currentRecord?.status === 'present'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : currentRecord?.status === 'late'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : currentRecord?.status === 'leave'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}
                            >
                              {currentRecord?.status === 'present'
                                ? '✓ অন-টাইম উপস্থিত'
                                : currentRecord?.status === 'late'
                                ? '⏰ বিলম্বিত উপস্থিতি'
                                : currentRecord?.status === 'leave'
                                ? '🏖️ ছুটি অনুমোদিত'
                                : '⏳ চেক-ইন অপেক্ষমাণ'}
                            </span>
                            {currentRecord?.checkInTime && (
                              <span className="text-[11px] font-mono font-bold text-slate-700">
                                সময়: {currentRecord.checkInTime}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Check-In Action Button */}
                      <div>
                        {isCheckedIn ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>চেক-ইন নিশ্চিত হয়েছে</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleTeacherDigitalCheckIn(selectedStaffTeacherId)}
                              className="px-3 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition cursor-pointer"
                              title="বর্তমান সময়ে টাইমস্ট্যাম্প আপডেট করুন"
                            >
                              সময় আপডেট
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleTeacherDigitalCheckIn(selectedStaffTeacherId)}
                            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:scale-95 text-white text-xs sm:text-sm font-black rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer ring-4 ring-emerald-500/20"
                          >
                            <UserCheck className="w-4 h-4 text-amber-200" />
                            <span>📲 ডিজিটাল চেক-ইন করুন (Check-In Now)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Staff Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-bold block">মোট কর্মী (Total Staff)</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 block">
                {toBengaliNumber(staffStats.total)} জন
              </span>
              <span className="text-[10px] text-slate-400 font-medium">নিবন্ধিত পদ</span>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
              <span className="text-[11px] text-emerald-800 font-bold block">অন-টাইম উপস্থিত</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-1 block">
                {toBengaliNumber(staffStats.present)} জন
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">সকাল ৮:১৫ এর পূর্বে</span>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
              <span className="text-[11px] text-amber-800 font-bold block">বিলম্বিত (Late)</span>
              <span className="text-xl sm:text-2xl font-black text-amber-700 font-mono mt-1 block">
                {toBengaliNumber(staffStats.late)} জন
              </span>
              <span className="text-[10px] text-amber-600 font-medium">দেরিতে আগমন</span>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
              <span className="text-[11px] text-blue-800 font-bold block">অনুমোদিত ছুটি (Leave)</span>
              <span className="text-xl sm:text-2xl font-black text-blue-700 font-mono mt-1 block">
                {toBengaliNumber(staffStats.leave)} জন
              </span>
              <span className="text-[10px] text-blue-600 font-medium">আবেদনকৃত</span>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
              <span className="text-[11px] text-rose-800 font-bold block">অপেক্ষমাণ (Pending)</span>
              <span className="text-xl sm:text-2xl font-black text-rose-700 font-mono mt-1 block">
                {toBengaliNumber(staffStats.absent)} জন
              </span>
              <span className="text-[10px] text-rose-600 font-medium">চেক-ইন বাকি</span>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-teal-200 bg-teal-50/20 shadow-2xs">
              <span className="text-[11px] text-teal-800 font-bold block">উপস্থিতির সামগ্রিক হার</span>
              <span className="text-xl sm:text-2xl font-black text-teal-700 font-mono mt-1 block">
                {toBengaliNumber(staffStats.rate)}%
              </span>
              <span className="text-[10px] text-teal-600 font-medium">আজকের লক্ষ্য: ১০০%</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                placeholder="শিক্ষক বা কর্মীর নাম, পদবি, বিভাগ বা ফোন লিখে খুঁজুন..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
              />
              {staffSearchQuery && (
                <button
                  type="button"
                  onClick={() => setStaffSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-500 mr-1">ফিল্টার:</span>
              <button
                type="button"
                onClick={() => setStaffStatusFilter('all')}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  staffStatusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                সকল স্টাফ ({staffStats.total})
              </button>
              <button
                type="button"
                onClick={() => setStaffStatusFilter('present')}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  staffStatusFilter === 'present'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                }`}
              >
                উপস্থিত ({staffStats.present})
              </button>
              <button
                type="button"
                onClick={() => setStaffStatusFilter('late')}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  staffStatusFilter === 'late'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                }`}
              >
                বিলম্বিত ({staffStats.late})
              </button>
              <button
                type="button"
                onClick={() => setStaffStatusFilter('leave')}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  staffStatusFilter === 'leave'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
                }`}
              >
                ছুটিতে ({staffStats.leave})
              </button>
              <button
                type="button"
                onClick={() => setStaffStatusFilter('absent')}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  staffStatusFilter === 'absent'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800'
                }`}
              >
                অপেক্ষমাণ ({staffStats.absent})
              </button>
            </div>
          </div>

          {/* Staff Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-700" />
                <span>শিক্ষক ও স্টাফ প্রাতঃকালীন হাজিরা তালিকা</span>
                <span className="text-slate-500 font-mono font-normal">
                  ({filteredStaffRecords.length} জন কর্মী)
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                রিয়েল-টাইম টাইমস্ট্যাম্প সক্রিয়
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">শিক্ষক / স্টাফের নাম</th>
                    <th className="py-3 px-3">পদবি ও বিভাগ</th>
                    <th className="py-3 px-3">যোগাযোগ</th>
                    <th className="py-3 px-3 text-center">চেক-ইন সময়</th>
                    <th className="py-3 px-3 text-center">হাজিরা অবস্থা</th>
                    <th className="py-3 px-3">মন্তব্য / নোট</th>
                    <th className="py-3 px-4 text-right">ডিজিটাল অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredStaffRecords.map((stf) => {
                    const isCheckedIn = stf.status === 'present' || stf.status === 'late';

                    return (
                      <tr key={stf.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Name & Photo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-indigo-700">
                              {stf.photoUrl ? (
                                <img
                                  src={stf.photoUrl}
                                  alt={stf.teacherNameBn}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                stf.teacherNameBn.slice(0, 1)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">
                                {stf.teacherNameBn}
                              </div>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {stf.teacherNameEn}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Designation & Department */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{stf.designationBn}</div>
                          <div className="text-[10px] text-slate-500">{stf.departmentBn || 'একাডেমিক শাখা'}</div>
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          {stf.phone ? (
                            <a href={`tel:${stf.phone}`} className="hover:underline hover:text-indigo-600">
                              {stf.phone}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* Check-In Time & Timestamp */}
                        <td className="py-3 px-3 text-center">
                          {stf.checkInTime ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-xs font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              <span>{stf.checkInTime}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">—</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${
                              stf.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : stf.status === 'late'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : stf.status === 'leave'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {stf.status === 'present'
                              ? 'অন-টাইম উপস্থিত'
                              : stf.status === 'late'
                              ? `বিলম্বে (${toBengaliNumber(stf.lateMinutes || 5)} মি.)`
                              : stf.status === 'leave'
                              ? 'ছুটি অনুমোদিত'
                              : 'অপেক্ষমাণ'}
                          </span>
                        </td>

                        {/* Remarks */}
                        <td className="py-3 px-3 text-[11px] text-slate-500 max-w-[180px] truncate">
                          {stf.remarksBn || 'স্বাভাবিক কার্যক্রম'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isCheckedIn ? (
                              <button
                                type="button"
                                onClick={() => handleTeacherDigitalCheckIn(stf.teacherId)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="ডিজিটাল চেক-ইন করুন"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>চেক-ইন</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleTeacherDigitalCheckIn(stf.teacherId)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition cursor-pointer"
                                title="পুনরায় চেক-ইন বা সময় আপডেট"
                              >
                                রিনিউ
                              </button>
                            )}

                            {/* Dropdown status toggle for Admin / Head Teacher */}
                            <select
                              value={stf.status}
                              onChange={(e) => handleSetStaffStatus(stf.teacherId, e.target.value as StaffAttendanceStatus)}
                              className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
                              title="স্ট্যাটাস পরিবর্তন"
                            >
                              <option value="present">উপস্থিত</option>
                              <option value="late">বিলম্বিত</option>
                              <option value="leave">ছুটি</option>
                              <option value="absent">অনুপস্থিত</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MONTHLY ATTENDANCE SUMMARY & CSV EXPORT DIALOG                     */}
      {/* ========================================================================= */}
      {showMonthlyModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowMonthlyModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-5xl w-full p-5 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-8 max-h-[94vh] flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full uppercase border border-teal-200">
                    📊 শিক্ষক ও অ্যাডমিন রিপোর্ট কনসোল
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    RFC 4180 CSV / Excel Ready
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                  <span>মাসিক হাজিরা সামারি রিপোর্ট ও ধারাবাহিকতা বিশ্লেষণ</span>
                </h3>
                <p className="text-xs text-slate-500">
                  শিক্ষার্থীদের উপস্থিতি ধারাবাহিকতা ট্র্যাক করুন, নিয়মিত উপস্থিতি পর্যবেক্ষণ করুন এবং এক্সেল/CSV ফরম্যাটে রিপোর্ট সংগ্রহ করুন
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowMonthlyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1.5 self-end sm:self-auto cursor-pointer rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Filter Bar: Month, Class, Consistency, Search */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Month Picker */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>রিপোর্ট মাস নির্বাচন করুন:</span>
                  </label>
                  <select
                    value={selectedMonthKey}
                    onChange={(e) => setSelectedMonthKey(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.nameBn} ({m.totalWorkingDays} কার্যদিবস)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Scope */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    <span>শ্রেণি নির্বাচন (Scope):</span>
                  </label>
                  <select
                    value={selectedReportClass}
                    onChange={(e) => setSelectedReportClass(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">সকল শ্রেণি (All Classes)</option>
                    {ALL_SCHOOL_CLASSES.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.fullNameBn}</option>
                    ))}
                  </select>
                </div>

                {/* Consistency Status Filter */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                    <span>ধারাবাহিকতার স্ট্যাটাস:</span>
                  </label>
                  <select
                    value={consistencyFilter}
                    onChange={(e) => setConsistencyFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">সকল ধারাবাহিকতা</option>
                    <option value="excellent">🌟 অসাধারণ (≥ ৯২%)</option>
                    <option value="regular">✅ সন্তোষজনক ও নিয়মিত (৮০-৯১%)</option>
                    <option value="needs_attention">⚠️ নিবিড় নজরদারি প্রয়োজন (&lt; ৮০%)</option>
                  </select>
                </div>

                {/* Search Box */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Search className="w-3.5 h-3.5 text-teal-600" />
                    <span>খুঁজুন (Search):</span>
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="নাম, রোল বা অভিভাবক..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick KPI Overview Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-800 uppercase block">মোট শিক্ষার্থী</span>
                  <span className="text-xl font-black text-teal-950 font-mono mt-0.5 block">{reportMeta.totalStudents} জন</span>
                </div>
                <span className="text-[10px] text-teal-700 font-semibold bg-white px-2 py-0.5 rounded-lg border border-teal-200">
                  {reportMeta.totalWorkingDays} কার্যদিবস
                </span>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">গড় উপস্থিতি হার</span>
                  <span className="text-xl font-black text-emerald-950 font-mono mt-0.5 block">{reportMeta.avgAttendanceRate}%</span>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">অসাধারণ ধারাবাহিকতা</span>
                  <span className="text-xl font-black text-emerald-800 font-mono mt-0.5 block">{reportMeta.excellentCount} জন</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-lg">
                  ≥৯২%
                </span>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-rose-800 uppercase block">নজরদারি প্রয়োজন</span>
                  <span className="text-xl font-black text-rose-700 font-mono mt-0.5 block">{reportMeta.needsAttentionCount} জন</span>
                </div>
                <span className="text-[10px] text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-lg">
                  &lt;৮০%
                </span>
              </div>
            </div>

            {/* Scrollable Data Table Preview */}
            <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 sticky top-0 z-10 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">রোল</th>
                    <th className="py-2.5 px-3">শিক্ষার্থী ও শ্রেণি</th>
                    <th className="py-2.5 px-2 text-center">কার্যদিবস</th>
                    <th className="py-2.5 px-2 text-center text-emerald-700">উপস্থিত</th>
                    <th className="py-2.5 px-2 text-center text-amber-700">বিলম্বে</th>
                    <th className="py-2.5 px-2 text-center text-rose-700">অনুপস্থিত</th>
                    <th className="py-2.5 px-3 text-center">উপস্থিতি হার</th>
                    <th className="py-2.5 px-3">ধারাবাহিকতা মূল্যায়ন</th>
                    <th className="py-2.5 px-3 hidden md:table-cell">মন্তব্য ও পর্যবেক্ষণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredSummaries.map((s) => (
                      <tr key={s.studentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {s.rollNo}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{s.nameBn}</div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {s.nameEn} · {s.className} (শাখা {s.section})
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-semibold text-slate-600">
                          {s.totalWorkingDays}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40">
                          {s.presentDays}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-amber-700 bg-amber-50/40">
                          {s.lateDays}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-rose-700 bg-rose-50/40">
                          {s.absentDays}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  s.attendanceRate >= 92
                                    ? 'bg-emerald-600'
                                    : s.attendanceRate >= 80
                                    ? 'bg-teal-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${s.attendanceRate}%` }}
                              />
                            </div>
                            <span className="font-mono font-extrabold text-slate-900 text-xs">
                              {s.attendanceRate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${
                              s.consistencyTier === 'excellent'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : s.consistencyTier === 'regular'
                                ? 'bg-teal-100 text-teal-800 border-teal-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {s.consistencyLabelBn}
                          </span>
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell text-slate-600 text-[11px] leading-relaxed max-w-xs">
                          {s.remarksBn}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Copy Feedback Toast */}
            {copyFeedback && (
              <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shrink-0 animate-in fade-in">
                <span>{copyFeedback}</span>
                <button type="button" onClick={() => setCopyFeedback(null)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            )}

            {/* Action Buttons Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 shrink-0">
              <div className="text-[11px] text-slate-500">
                💡 টিপ: ডাউনলোডকৃত CSV ফাইলে UTF-8 BOM যুক্ত রয়েছে, যা সরাসরি <strong>Microsoft Excel</strong> বা <strong>Google Sheets</strong>-এ কোনো কোডিং সমস্যা ছাড়াই বাংলায় খুলবে।
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={handleCopyCsvToClipboard}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="CSV টেক্সট কপি করুন"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>ক্লিপবোর্ডে কপি</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPdfPreviewModal(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="PDF ডকুমেন্টের ফুল প্রিভিউ দেখুন"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-700" />
                  <span>PDF প্রিভিউ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportPdf(selectedReportClass)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
                  title="স্কুল রেকর্ডের জন্য অফিসিয়াল PDF হাজিরা রিপোর্ট ডাউনলোড ও প্রিন্ট করুন"
                >
                  <FileText className="w-4 h-4 text-rose-100" />
                  <span>PDF রিপোর্ট এক্সপোর্ট</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportCsv(selectedReportClass)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
                  title="CSV রিপোর্ট ফাইল ডাউনলোড করুন"
                >
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>CSV রিপোর্ট ডাউনলোড</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL ATTENDANCE PDF DOCUMENT PREVIEW & PRINT DIALOG            */}
      {/* ========================================================================= */}
      {showPdfPreviewModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowPdfPreviewModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-6 space-y-4 shadow-2xl border border-slate-200 my-6 max-h-[95vh] flex flex-col overflow-hidden"
          >
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-rose-100 text-rose-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    মাসিক হাজিরা মূল্যায়ন — অফিশিয়াল PDF রেকর্ড প্রিভিউ
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {reportMeta.monthNameBn} · শ্রেণি: {selectedReportClass === 'all' ? 'সকল শ্রেণি' : `${selectedReportClass} শ্রেণি`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportPdf(selectedReportClass)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট / PDF হিসেবে সংরক্ষণ করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPdfPreviewModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body (Styled Paper View) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 max-w-4xl mx-auto space-y-4 text-slate-900">
                {/* Official Letterhead */}
                <div className="border-b-2 border-teal-600 pb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/fb/logo.jpg"
                      alt="আনন্দ পাঠশালা লোগো"
                      className="w-12 h-12 rounded-xl object-cover border border-amber-400 p-0.5"
                    />
                    <div>
                      <h2 className="text-lg font-black text-emerald-900 leading-tight">
                        আনন্দ পাঠশালা — কিন্ডারগার্টেন ও প্লে স্কুল
                      </h2>
                      <p className="text-xs font-bold text-teal-700">
                        প্রাক-প্রাথমিক ও কিন্ডারগার্টেন স্কুল · কুষ্টিয়া ক্যাম্পাস
                      </p>
                      <p className="text-[10px] text-slate-500">
                        ১৯/২২ পূর্ণ চন্দ্র লাহিড়ী লেন (গোশালা), কোর্টপাড়া, কুষ্টিয়া | ফোন: ০১৯১৪-০৫৭৫১১
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 bg-teal-800 text-white text-[10px] font-bold rounded-full uppercase">
                      অফিশিয়াল স্কুল রেকর্ড
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      রিপোর্ট কোড: AP-ATT-{reportMeta.monthKey}
                    </div>
                  </div>
                </div>

                {/* Banner */}
                <div className="bg-emerald-50/80 border border-emerald-200 border-l-4 border-l-emerald-600 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-emerald-950">
                      মাসিক শিক্ষার্থী উপস্থিতি ও ধারাবাহিকতা মূল্যায়ন বিবরণী
                    </h3>
                    <p className="text-[10px] text-emerald-800">
                      Monthly Attendance & Student Consistency Record
                    </p>
                  </div>
                  <div className="text-xs font-bold text-emerald-900 text-right">
                    মাস: {reportMeta.monthNameBn} | শ্রেণি: {selectedReportClass === 'all' ? 'সকল শ্রেণি' : `${selectedReportClass} শ্রেণি`}
                  </div>
                </div>

                {/* KPI Strip */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-500 font-bold block">কার্যদিবস</span>
                    <span className="font-mono font-black text-sm">{reportMeta.totalWorkingDays} দিন</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-500 font-bold block">শিক্ষার্থী</span>
                    <span className="font-mono font-black text-sm">{reportMeta.totalStudents} জন</span>
                  </div>
                  <div className="bg-teal-50 p-2 rounded-lg border border-teal-200">
                    <span className="text-[9px] text-teal-700 font-bold block">গড় উপস্থিতি</span>
                    <span className="font-mono font-black text-sm text-teal-800">{reportMeta.avgAttendanceRate}%</span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <span className="text-[9px] text-emerald-700 font-bold block">অসাধারণ</span>
                    <span className="font-mono font-black text-sm text-emerald-800">{reportMeta.excellentCount} জন</span>
                  </div>
                  <div className="bg-teal-50 p-2 rounded-lg border border-teal-200">
                    <span className="text-[9px] text-teal-700 font-bold block">নিয়মিত</span>
                    <span className="font-mono font-black text-sm text-teal-800">{reportMeta.regularCount} জন</span>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-lg border border-rose-200">
                    <span className="text-[9px] text-rose-700 font-bold block">নজরদারি</span>
                    <span className="font-mono font-black text-sm text-rose-800">{reportMeta.needsAttentionCount} জন</span>
                  </div>
                </div>

                {/* Printable Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-900 text-white font-bold text-[10px]">
                      <tr>
                        <th className="p-2 text-center">ক্রমিক</th>
                        <th className="p-2 text-center">রোল</th>
                        <th className="p-2">শিক্ষার্থীর নাম</th>
                        <th className="p-2 text-center">শ্রেণি</th>
                        <th className="p-2 text-center">উপস্থিত</th>
                        <th className="p-2 text-center">বিলম্ব</th>
                        <th className="p-2 text-center">অনুপস্থিত</th>
                        <th className="p-2 text-center">%</th>
                        <th className="p-2 text-center">ধারাবাহিকতা</th>
                        <th className="p-2">অভিভাবক ও যোগাযোগ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {filteredSummaries.map((s, idx) => (
                        <tr key={s.studentId} className={idx % 2 === 1 ? 'bg-slate-50/60' : ''}>
                          <td className="p-2 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-2 text-center font-mono font-bold">{s.rollNo}</td>
                          <td className="p-2">
                            <span className="font-bold text-slate-900">{s.nameBn}</span>
                            <span className="text-[9.5px] text-slate-500 block">{s.nameEn}</span>
                          </td>
                          <td className="p-2 text-center font-semibold">{s.className}</td>
                          <td className="p-2 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40">
                            {s.presentDays}
                          </td>
                          <td className="p-2 text-center font-mono font-bold text-amber-700 bg-amber-50/40">
                            {s.lateDays}
                          </td>
                          <td className="p-2 text-center font-mono font-bold text-rose-700 bg-rose-50/40">
                            {s.absentDays}
                          </td>
                          <td className="p-2 text-center font-mono font-extrabold text-slate-900">
                            {s.attendanceRate}%
                          </td>
                          <td className="p-2 text-center">
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                s.consistencyTier === 'excellent'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : s.consistencyTier === 'regular'
                                  ? 'bg-teal-100 text-teal-800 border-teal-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}
                            >
                              {s.consistencyTier === 'excellent' ? '🌟 অসাধারণ' : s.consistencyTier === 'regular' ? '✅ নিয়মিত' : '⚠️ নজরদারি'}
                            </span>
                          </td>
                          <td className="p-2 text-[10px]">
                            <div className="font-bold text-slate-800">{s.guardianNameBn}</div>
                            <div className="font-mono text-slate-500 text-[9px]">{s.guardianPhone}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Signatures */}
                <div className="flex items-end justify-between pt-6 text-xs text-slate-700">
                  <div className="text-center w-40 border-t border-dashed border-slate-400 pt-2">
                    <span className="font-bold block">শ্রেণি শিক্ষক / শিক্ষিকা</span>
                    <span className="text-[10px] text-slate-500">আনন্দ পাঠশালা, কুষ্টিয়া</span>
                  </div>

                  <div className="w-24 h-14 rounded-full border border-dashed border-teal-500 flex items-center justify-center text-center text-[8px] text-teal-800 font-bold rotate-[-6deg] bg-teal-50/30">
                    আনন্দ পাঠশালা<br />অফিশিয়াল সীলমোহর
                  </div>

                  <div className="text-center w-40 border-t border-dashed border-slate-400 pt-2">
                    <span className="font-bold block">শাফী আব্দুল্লাহ</span>
                    <span className="text-[10px] text-slate-500">অধ্যক্ষ / প্রিন্সিপাল</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Absent Alert Modal */}
      <AbsentAlertModal
        isOpen={isAbsentModalOpen}
        onClose={() => setIsAbsentModalOpen(false)}
        absentStudents={absentStudentsList}
        className={selectedClass}
        dateStr={attendanceDateStr}
        loggedInTeacherNameBn={loggedInTeacherNameBn}
        onSendAlerts={handleSendAlertsFromModal}
      />
    </div>
  );
};
