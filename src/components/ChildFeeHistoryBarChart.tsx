import React, { useState, useMemo, useEffect } from 'react';
import { FeeInvoice, UserRole, Student, PortalAccount, StudentFeeConfig } from '../types/school';
import { toBengaliNumber, getSchoolClassNameBn } from '../utils/schoolLogic';
import {
  getStudentFeeConfig,
  saveStudentFeeConfig,
  formatIsoDateToBengali,
  generateStudentInvoicesFromConfig,
  STUDENT_FEE_CONFIG_EVENT,
  ALL_2026_MONTHS,
} from '../utils/feeManagementLogic';
import { downloadInvoicePdfReceipt } from '../utils/pdfReceiptGenerator';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowRight,
  Calendar,
  Sparkles,
  ShieldCheck,
  Receipt,
  Settings2,
  Printer,
  Edit3,
  FilePlus2,
  BadgeCheck,
  Save,
  Check,
  Download,
  FileText,
} from 'lucide-react';

export interface MonthlyFeeHistoryPoint {
  monthKey: string;
  monthNameBn: string;
  shortMonthBn: string;
  invoiceNo: string;
  totalBilled: number;
  paidAmount: number;
  dueAmount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  statusBn: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'bKash' | 'Nagad' | 'Bank' | 'Cash';
  transactionId?: string;
  confirmedByBn?: string;
  invoiceType?: 'monthly' | 'admission' | 'combined';
  admissionDateBn?: string;
  invoice?: FeeInvoice;
}

export interface ChildFeeHistoryBarChartProps {
  invoices: FeeInvoice[];
  students: Student[];
  currentRole: UserRole;
  loggedInAccount?: PortalAccount | null;
  onPayInvoice?: (invoice: FeeInvoice) => void;
  onAdminConfirmPayment?: (invoice: FeeInvoice) => void;
  onViewReceipt?: (invoice: FeeInvoice) => void;
  onOpenDownloadReportModal?: (studentId?: string) => void;
  onUpdateInvoices?: (updatedInvoices: FeeInvoice[]) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  selectedStudentId?: string;
  onSelectStudentId?: (studentId: string) => void;
}

export const ChildFeeHistoryBarChart: React.FC<ChildFeeHistoryBarChartProps> = ({
  invoices,
  students,
  currentRole,
  loggedInAccount,
  onPayInvoice,
  onAdminConfirmPayment,
  onViewReceipt,
  onOpenDownloadReportModal,
  onUpdateInvoices,
  onUpdateStudent,
  selectedStudentId,
  onSelectStudentId,
}) => {
  const isParentRole = currentRole === 'parent' || loggedInAccount?.role === 'parent';
  const isTeacherRole = currentRole === 'teacher' || loggedInAccount?.role === 'teacher';

  // Only Principal and Super Admin (and Accountant) can configure fees, edit amounts, or confirm payments
  const canConfigureAndConfirmFees =
    !isParentRole &&
    !isTeacherRole &&
    (currentRole === 'super_admin' ||
      currentRole === 'principal' ||
      currentRole === 'accountant' ||
      loggedInAccount?.role === 'super_admin' ||
      loggedInAccount?.role === 'principal');

  // Filter visible students based on role:
  // - Parent/Student: ONLY their own linked student
  // - Teacher: ONLY students in their assigned class
  // - Principal / Super Admin / Director: All students
  const accessibleStudents = useMemo(() => {
    if (isParentRole) {
      const ownId = loggedInAccount?.studentId || selectedStudentId || 'std-1';
      const ownStd = students.find((s) => s.id === ownId);
      return ownStd ? [ownStd] : students.slice(0, 1);
    }
    if (isTeacherRole && loggedInAccount?.assignedClass) {
      const classStds = students.filter((s) => s.className === loggedInAccount.assignedClass);
      return classStds.length > 0 ? classStds : students;
    }
    return students;
  }, [students, isParentRole, isTeacherRole, loggedInAccount, selectedStudentId]);

  // Determine default student
  const defaultStudentId = useMemo(() => {
    if (isParentRole) {
      return loggedInAccount?.studentId || selectedStudentId || accessibleStudents[0]?.id || 'std-1';
    }
    if (selectedStudentId && accessibleStudents.some((s) => s.id === selectedStudentId)) {
      return selectedStudentId;
    }
    if (loggedInAccount?.studentId && accessibleStudents.some((s) => s.id === loggedInAccount.studentId)) {
      return loggedInAccount.studentId;
    }
    return accessibleStudents[0]?.id || 'std-1';
  }, [isParentRole, selectedStudentId, loggedInAccount, accessibleStudents]);

  const [activeStudentId, setActiveStudentId] = useState<string>(defaultStudentId);
  const [configVersion, setConfigVersion] = useState<number>(0);

  // Keep activeStudentId strictly synced when role or loggedInAccount changes
  useEffect(() => {
    if (isParentRole) {
      const ownId = loggedInAccount?.studentId || selectedStudentId || accessibleStudents[0]?.id || 'std-1';
      if (activeStudentId !== ownId) {
        setActiveStudentId(ownId);
      }
      return;
    }
    if (!accessibleStudents.some((s) => s.id === activeStudentId)) {
      const fallbackId = accessibleStudents[0]?.id || 'std-1';
      setActiveStudentId(fallbackId);
    }
  }, [isParentRole, loggedInAccount, selectedStudentId, accessibleStudents, activeStudentId]);

  // Sync activeStudentId if parent prop changes
  useEffect(() => {
    if (!isParentRole && selectedStudentId && selectedStudentId !== activeStudentId) {
      setActiveStudentId(selectedStudentId);
    }
  }, [selectedStudentId, isParentRole]);

  useEffect(() => {
    const handleSync = () => setConfigVersion((v) => v + 1);
    window.addEventListener(STUDENT_FEE_CONFIG_EVENT, handleSync);
    return () => window.removeEventListener(STUDENT_FEE_CONFIG_EVENT, handleSync);
  }, []);

  const currentStudent = useMemo(() => {
    return (
      accessibleStudents.find((s) => s.id === activeStudentId) ||
      accessibleStudents[0] ||
      students[0] || {
        id: 'std-1',
        nameBn: 'আদিত্য রায়',
        nameEn: 'Aditya Roy',
        className: 'Nursery',
        rollNo: '১০১',
        section: 'A',
        birthDate: '2021-04-10',
        bloodGroup: 'O+',
        gender: 'male',
        allergies: 'নেই',
        emergencyPhone: '০১৭১১-২২৩৩৪৪',
        fatherNameBn: 'সুব্রত রায়',
        motherNameBn: 'অর্পিতা রায়',
        homeAddressBn: 'ধানমন্ডি, ঢাকা',
        currentStatus: 'in_class',
        authorizedPickups: [],
        avatarColor: 'bg-amber-500',
        photoUrl: '/assets/biddalay/student_hasin.jpg',
      }
    );
  }, [accessibleStudents, students, activeStudentId]);

  const studentFeeConfig: StudentFeeConfig = useMemo(() => {
    return getStudentFeeConfig(currentStudent);
  }, [currentStudent, configVersion]);

  // Admin inline fee configurator state (only for Principal & Super Admin)
  const [showAdminConfigPanel, setShowAdminConfigPanel] = useState<boolean>(canConfigureAndConfirmFees);
  const [editAdmissionDate, setEditAdmissionDate] = useState<string>(studentFeeConfig.admissionDate);
  const [editAdmissionFee, setEditAdmissionFee] = useState<number>(studentFeeConfig.admissionFee);
  const [editAdmissionStatus, setEditAdmissionStatus] = useState<'paid' | 'unpaid'>(
    studentFeeConfig.admissionFeeStatus
  );
  const [editMonthlyFee, setEditMonthlyFee] = useState<number>(studentFeeConfig.monthlyFee);
  const [editMonthlyDiscount, setEditMonthlyDiscount] = useState<number>(
    studentFeeConfig.monthlyDiscount || 0
  );
  const [markPastMonthsPaid, setMarkPastMonthsPaid] = useState<boolean>(true);
  const [configSavedBanner, setConfigSavedBanner] = useState<string | null>(null);

  // Inline single month amount edit state
  const [editingMonthKey, setEditingMonthKey] = useState<string | null>(null);
  const [editingMonthAmount, setEditingMonthAmount] = useState<number>(0);

  // Sync form fields when switching student
  useEffect(() => {
    const cfg = getStudentFeeConfig(currentStudent);
    setEditAdmissionDate(cfg.admissionDate);
    setEditAdmissionFee(cfg.admissionFee);
    setEditAdmissionStatus(cfg.admissionFeeStatus);
    setEditMonthlyFee(cfg.monthlyFee);
    setEditMonthlyDiscount(cfg.monthlyDiscount || 0);
    setEditingMonthKey(null);
  }, [currentStudent.id, configVersion]);

  const handleStudentChange = (id: string) => {
    setActiveStudentId(id);
    if (onSelectStudentId) {
      onSelectStudentId(id);
    }
  };

  // Save Fee Structure & Generate Invoices from Admission Date
  const handleSaveAndGenerateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedAdmDateBn = formatIsoDateToBengali(editAdmissionDate);
    const updatedConfig: StudentFeeConfig = {
      ...studentFeeConfig,
      studentId: currentStudent.id,
      admissionDate: editAdmissionDate,
      admissionDateBn: formattedAdmDateBn,
      admissionFee: Number(editAdmissionFee) || 0,
      admissionFeeStatus: editAdmissionStatus,
      monthlyFee: Number(editMonthlyFee) || 0,
      monthlyDiscount: Number(editMonthlyDiscount) || 0,
      updatedByBn: loggedInAccount?.nameBn || 'সুপার অ্যাডমিন',
      updatedAtBn: 'আজ, ০৫ নভেম্বর ২০২৬',
    };

    saveStudentFeeConfig(updatedConfig);
    setConfigVersion((v) => v + 1);

    if (onUpdateStudent) {
      onUpdateStudent({
        ...currentStudent,
        admissionDate: editAdmissionDate,
        admissionDateBn: formattedAdmDateBn,
        admissionFee: Number(editAdmissionFee) || 0,
        monthlyFee: Number(editMonthlyFee) || 0,
      });
    }

    if (onUpdateInvoices) {
      const nextInvoices = generateStudentInvoicesFromConfig(
        currentStudent,
        updatedConfig,
        invoices,
        {
          markPastMonthsPaid,
          currentUnpaidMonthKey: 'oct',
          confirmedByBn: loggedInAccount?.nameBn || 'সুপার অ্যাডমিন',
        }
      );
      onUpdateInvoices(nextInvoices);
    }

    setConfigSavedBanner(
      `${currentStudent.nameBn}-এর ভর্তির তারিখ (${formattedAdmDateBn}), ভর্তি ফি ৳${toBengaliNumber(
        editAdmissionFee
      )} এবং মাসিক ফি ৳${toBengaliNumber(editMonthlyFee)} অনুযায়ী পেমেন্ট শিডিউল ও ইনভয়েস জেনারেট হয়েছে!`
    );
    setTimeout(() => setConfigSavedBanner(null), 6000);
  };

  // Determine the months to display in the Bar Chart based on Admission Date (defaulting to May–Oct 2026 or starting from admission month)
  const chartMonthsConfig = useMemo(() => {
    const parts = (studentFeeConfig.admissionDate || '2026-05-01').split('-');
    let admMonthIdx = 4; // May
    if (parts.length === 3) {
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(m) && m >= 0 && m <= 11) {
        admMonthIdx = m;
      }
    }
    // Show from admission month up to October (index 9), or if admission is earlier than May, show last 6 months (May-Oct) or from admission month
    const endIdx = Math.max(9, admMonthIdx);
    const filtered = ALL_2026_MONTHS.filter(
      (m) => m.monthIndex >= admMonthIdx && m.monthIndex <= endIdx
    );
    return filtered.length > 0 ? filtered : ALL_2026_MONTHS.slice(4, 10);
  }, [studentFeeConfig.admissionDate]);

  // Construct Admission Point + Monthly Fee History Data dynamically
  const monthlyHistoryData: MonthlyFeeHistoryPoint[] = useMemo(() => {
    const studentInvoices = invoices.filter((inv) => inv.studentId === currentStudent.id);
    const netMonthlyConfigured = Math.max(
      0,
      (studentFeeConfig.monthlyFee || 4000) - (studentFeeConfig.monthlyDiscount || 0)
    );

    const points: MonthlyFeeHistoryPoint[] = [];

    // 1. Admission Fee Point (ভর্তি ফি)
    const matchedAdmInv = studentInvoices.find(
      (inv) => inv.invoiceType === 'admission' || inv.monthBn.includes('ভর্তি ফি')
    );
    const admAmount = matchedAdmInv ? matchedAdmInv.netAmount : studentFeeConfig.admissionFee;
    const isAdmPaid = matchedAdmInv
      ? matchedAdmInv.status === 'paid'
      : studentFeeConfig.admissionFeeStatus === 'paid';

    const syntheticAdmInvoice: FeeInvoice = matchedAdmInv || {
      id: `inv-adm-${currentStudent.id}`,
      invoiceNo: studentFeeConfig.admissionReceiptNo || `AP-ADM-${currentStudent.rollNo || '101'}`,
      studentId: currentStudent.id,
      studentNameBn: currentStudent.nameBn,
      className: currentStudent.className,
      monthBn: `ভর্তি ফি (${studentFeeConfig.admissionDateBn})`,
      invoiceType: 'admission',
      admissionDateBn: studentFeeConfig.admissionDateBn,
      totalAmount: admAmount,
      discountAmount: 0,
      netAmount: admAmount,
      dueDate: studentFeeConfig.admissionDateBn,
      status: isAdmPaid ? 'paid' : 'unpaid',
      items: [
        {
          nameBn: `নতুন ভর্তি ও রেজিস্ট্রেশন ফি (ভর্তির তারিখ: ${studentFeeConfig.admissionDateBn})`,
          amount: admAmount,
        },
      ],
      paymentMethod: isAdmPaid ? studentFeeConfig.admissionPaymentMethod || 'Cash' : undefined,
      transactionId: isAdmPaid ? `ADM${currentStudent.rollNo || '101'}VRF` : undefined,
      paidAt: isAdmPaid ? studentFeeConfig.admissionPaidAt || studentFeeConfig.admissionDateBn : undefined,
      confirmedByBn: isAdmPaid ? studentFeeConfig.updatedByBn || 'সুপার অ্যাডমিন' : undefined,
    };

    points.push({
      monthKey: 'admission',
      monthNameBn: `ভর্তি ফি (${studentFeeConfig.admissionDateBn})`,
      shortMonthBn: 'ভর্তি ফি',
      invoiceNo: syntheticAdmInvoice.invoiceNo,
      totalBilled: admAmount,
      paidAmount: isAdmPaid ? admAmount : 0,
      dueAmount: isAdmPaid ? 0 : admAmount,
      status: isAdmPaid ? 'paid' : 'unpaid',
      statusBn: isAdmPaid ? 'পরিশোধিত ✓' : 'বকেয়া ⚠️',
      dueDate: studentFeeConfig.admissionDateBn,
      paidDate: syntheticAdmInvoice.paidAt,
      paymentMethod: syntheticAdmInvoice.paymentMethod,
      transactionId: syntheticAdmInvoice.transactionId,
      confirmedByBn: syntheticAdmInvoice.confirmedByBn,
      invoiceType: 'admission',
      admissionDateBn: studentFeeConfig.admissionDateBn,
      invoice: syntheticAdmInvoice,
    });

    // 2. Monthly Fee Points from Admission Date
    chartMonthsConfig.forEach((cfg, index) => {
      const matchedInv = studentInvoices.find(
        (inv) =>
          inv.invoiceType !== 'admission' &&
          (inv.monthBn.includes(cfg.shortBn) ||
            inv.monthBn.includes(cfg.nameBn) ||
            (cfg.key === 'oct' && inv.monthBn.includes('অক্টোবর')))
      );

      if (matchedInv) {
        const isPaid = matchedInv.status === 'paid';
        points.push({
          monthKey: cfg.key,
          monthNameBn: matchedInv.monthBn || cfg.nameBn,
          shortMonthBn: cfg.shortBn,
          invoiceNo: matchedInv.invoiceNo,
          totalBilled: matchedInv.netAmount,
          paidAmount: isPaid ? matchedInv.netAmount : 0,
          dueAmount: isPaid ? 0 : matchedInv.netAmount,
          status: matchedInv.status,
          statusBn: isPaid ? 'পরিশোধিত ✓' : 'বকেয়া ⚠️',
          dueDate: matchedInv.dueDate || cfg.dueDayBn,
          paidDate: matchedInv.paidAt || (isPaid ? `০৫ ${cfg.nameBn}` : undefined),
          paymentMethod: matchedInv.paymentMethod || (isPaid ? 'bKash' : undefined),
          transactionId: matchedInv.transactionId,
          confirmedByBn: matchedInv.confirmedByBn,
          invoiceType: 'monthly',
          admissionDateBn: studentFeeConfig.admissionDateBn,
          invoice: matchedInv,
        });
        return;
      }

      const isCurrentMonth = cfg.key === 'oct' || index === chartMonthsConfig.length - 1;
      const isPaid = !isCurrentMonth;
      const billed = netMonthlyConfigured;
      const tuitionPortion = Math.round(billed * 0.65);
      const snacksPortion = Math.round(billed * 0.22);
      const activityPortion = Math.max(0, billed - tuitionPortion - snacksPortion);

      const syntheticMonthlyInvoice: FeeInvoice = {
        id: `inv-${cfg.key}-${currentStudent.id}`,
        invoiceNo: `AP-${cfg.key.toUpperCase()}-${currentStudent.rollNo || '101'}`,
        studentId: currentStudent.id,
        studentNameBn: currentStudent.nameBn,
        className: currentStudent.className,
        monthBn: cfg.nameBn,
        invoiceType: 'monthly',
        admissionDateBn: studentFeeConfig.admissionDateBn,
        totalAmount: studentFeeConfig.monthlyFee || billed,
        discountAmount: studentFeeConfig.monthlyDiscount || 0,
        netAmount: billed,
        dueDate: cfg.dueDayBn,
        status: isPaid ? 'paid' : 'unpaid',
        items: [
          { nameBn: `মাসিক টিউশন ফি (${cfg.nameBn})`, amount: tuitionPortion },
          { nameBn: 'পুষ্টিকর নাশতা ও হেলদি স্ন্যাক্স ফি', amount: snacksPortion },
          { nameBn: 'আর্ট, ক্রাফট ও ক্লাসরুম অ্যাক্টিভিটি', amount: activityPortion },
        ],
        paymentMethod: isPaid ? 'bKash' : undefined,
        transactionId: isPaid
          ? `BK${cfg.key.toUpperCase()}84${currentStudent.rollNo || '101'}BD`
          : undefined,
        paidAt: isPaid ? `০৫ ${cfg.nameBn}` : undefined,
        confirmedByBn: isPaid ? 'সুপার অ্যাডমিন' : undefined,
      };

      points.push({
        monthKey: cfg.key,
        monthNameBn: cfg.nameBn,
        shortMonthBn: cfg.shortBn,
        invoiceNo: syntheticMonthlyInvoice.invoiceNo,
        totalBilled: billed,
        paidAmount: isPaid ? billed : 0,
        dueAmount: isPaid ? 0 : billed,
        status: isPaid ? 'paid' : 'unpaid',
        statusBn: isPaid ? 'পরিশোধিত ✓' : 'বকেয়া ⚠️',
        dueDate: cfg.dueDayBn,
        paidDate: syntheticMonthlyInvoice.paidAt,
        paymentMethod: syntheticMonthlyInvoice.paymentMethod,
        transactionId: syntheticMonthlyInvoice.transactionId,
        confirmedByBn: syntheticMonthlyInvoice.confirmedByBn,
        invoiceType: 'monthly',
        admissionDateBn: studentFeeConfig.admissionDateBn,
        invoice: syntheticMonthlyInvoice,
      });
    });

    return points;
  }, [invoices, currentStudent, studentFeeConfig, chartMonthsConfig]);

  // Save inline single-month / admission fee edit
  const handleSaveSinglePointAmount = (point: MonthlyFeeHistoryPoint) => {
    const newAmt = Math.max(0, Number(editingMonthAmount) || 0);
    if (point.monthKey === 'admission') {
      const updatedCfg: StudentFeeConfig = {
        ...studentFeeConfig,
        admissionFee: newAmt,
      };
      saveStudentFeeConfig(updatedCfg);
      setEditAdmissionFee(newAmt);
      setConfigVersion((v) => v + 1);
    }

    if (onUpdateInvoices && point.invoice) {
      const targetInv: FeeInvoice = {
        ...point.invoice,
        totalAmount: newAmt,
        discountAmount: 0,
        netAmount: newAmt,
        items:
          point.invoiceType === 'admission'
            ? [
                {
                  nameBn: `নতুন ভর্তি ও রেজিস্ট্রেশন ফি (ভর্তির তারিখ: ${studentFeeConfig.admissionDateBn})`,
                  amount: newAmt,
                },
              ]
            : [
                {
                  nameBn: `মাসিক টিউশন ও আনুষঙ্গিক ফি (${point.monthNameBn})`,
                  amount: newAmt,
                },
              ],
      };

      const exists = invoices.some((i) => i.id === targetInv.id);
      const nextList = exists
        ? invoices.map((i) => (i.id === targetInv.id ? targetInv : i))
        : [targetInv, ...invoices];
      onUpdateInvoices(nextList);
    }

    setEditingMonthKey(null);
  };

  // Aggregate Metrics
  const summaryMetrics = useMemo(() => {
    const totalBilled = monthlyHistoryData.reduce((acc, m) => acc + m.totalBilled, 0);
    const totalPaid = monthlyHistoryData.reduce((acc, m) => acc + m.paidAmount, 0);
    const totalDue = monthlyHistoryData.reduce((acc, m) => acc + m.dueAmount, 0);
    const rate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 100;
    const paidMonthsCount = monthlyHistoryData.filter((m) => m.status === 'paid').length;
    const dueMonthsCount = monthlyHistoryData.filter((m) => m.status !== 'paid').length;

    return {
      totalBilled,
      totalPaid,
      totalDue,
      rate,
      paidMonthsCount,
      dueMonthsCount,
    };
  }, [monthlyHistoryData]);

  const primaryUnpaidMonth = useMemo(() => {
    return monthlyHistoryData.find((m) => m.dueAmount > 0 && m.invoice);
  }, [monthlyHistoryData]);

  return (
    <div className="bg-white rounded-3xl border-2 border-emerald-300/80 p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header with Title, Student Selector, and Admin Fee Setter Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 tracking-wider">
                📊 রিচার্টস বার চার্ট ও পেমেন্ট হিস্ট্রি
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                ভর্তির তারিখ: {studentFeeConfig.admissionDateBn}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                ভর্তি ফি: ৳{toBengaliNumber(studentFeeConfig.admissionFee)} · মাসিক ফি: ৳
                {toBengaliNumber(studentFeeConfig.monthlyFee)}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1">
              {currentStudent.nameBn}-এর ভর্তি ও মাসিক ফি পেমেন্ট হিস্ট্রি এবং বকেয়ার চিত্র
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              ভর্তির তারিখ ({studentFeeConfig.admissionDateBn}) থেকে নির্ধারিত ভর্তি ফি ও প্রত্যেক মাসের টিউশন ফিসের পরিশোধিত এবং বকেয়া স্ট্যাটাস।
            </p>
          </div>
        </div>

        {/* Right Controls: Download Report + Admin Config Toggle + Student Selector */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
          {onOpenDownloadReportModal && (
            <button
              type="button"
              onClick={() => onOpenDownloadReportModal(currentStudent.id)}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-amber-200" />
              <span>Download Report (PDF / CSV)</span>
            </button>
          )}

          {canConfigureAndConfirmFees && (
            <button
              type="button"
              onClick={() => setShowAdminConfigPanel((prev) => !prev)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border ${
                showAdminConfigPanel
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Settings2 className="w-4 h-4 text-amber-400" />
              <span>অ্যাডমিন ফি নির্ধারণ ও জেনারেট</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 p-2 rounded-2xl">
            <img
              src={currentStudent.photoUrl || '/assets/biddalay/student_hasin.jpg'}
              alt={currentStudent.nameBn}
              className="w-9 h-9 rounded-xl object-cover border border-amber-300 bg-white"
            />
            <div className="min-w-0 pr-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                {isParentRole
                  ? 'আমার সন্তান / নিজস্ব প্রোফাইল'
                  : isTeacherRole
                  ? `আমার ক্লাসের শিক্ষার্থী (${getSchoolClassNameBn(currentStudent.className)})`
                  : 'নির্বাচিত শিক্ষার্থী'}
              </span>
              {isParentRole ? (
                <div className="text-xs font-black text-slate-900 pr-2 truncate">
                  {currentStudent.nameBn} ({getSchoolClassNameBn(currentStudent.className)} · রোল{' '}
                  {toBengaliNumber(currentStudent.rollNo)})
                </div>
              ) : (
                <select
                  value={activeStudentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="text-xs font-black text-slate-900 bg-transparent border-0 focus:outline-none cursor-pointer pr-4 truncate max-w-[150px] sm:max-w-[180px]"
                >
                  {accessibleStudents.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.nameBn} ({getSchoolClassNameBn(std.className)})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Principal / Super Admin Fee Structure & Schedule Generator Panel */}
      {canConfigureAndConfirmFees && showAdminConfigPanel && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-indigo-500/30 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                    সুপার অ্যাডমিন ও অ্যাডমিন প্যানেল কন্ট্রোল
                  </span>
                  <span className="text-xs text-indigo-200 font-semibold">
                    শিক্ষার্থী: {currentStudent.nameBn} (রোল: {currentStudent.rollNo})
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white mt-1">
                  ভর্তির তারিখ, ভর্তি ফি ও মাসিক ফি নির্ধারণ এবং পেমেন্ট জেনারেটর
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  শিক্ষার্থী কবে ভর্তি হয়েছে তার তারিখ, ভর্তি ফি কত টাকা এবং প্রত্যেক মাসের টিউশন ফি কত টাকা তা নির্ধারণ করে পেমেন্ট হিস্ট্রি ও ইনভয়েস জেনারেট করুন।
                </p>
              </div>
            </div>
          </div>

          {configSavedBanner && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{configSavedBanner}</span>
            </div>
          )}

          <form onSubmit={handleSaveAndGenerateSchedule} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* 1. Admission Date */}
              <div className="bg-white/5 border border-white/15 rounded-2xl p-3.5 space-y-1.5">
                <label className="text-[11px] font-bold text-amber-300 block">
                  ১. ভর্তির তারিখ (Admission Date)
                </label>
                <input
                  type="date"
                  value={editAdmissionDate}
                  onChange={(e) => setEditAdmissionDate(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-300 block">
                  বাংলা তারিখ: <strong className="text-white">{formatIsoDateToBengali(editAdmissionDate)}</strong>
                </span>
              </div>

              {/* 2. Admission Fee Amount */}
              <div className="bg-white/5 border border-white/15 rounded-2xl p-3.5 space-y-1.5">
                <label className="text-[11px] font-bold text-amber-300 block">
                  ২. নির্ধারিত ভর্তি ফি (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={editAdmissionFee}
                  onChange={(e) => setEditAdmissionFee(Number(e.target.value))}
                  className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-black text-white focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-300 block">
                  বাংলায়: ৳ {toBengaliNumber(editAdmissionFee || 0)} টাকা
                </span>
              </div>

              {/* 3. Admission Fee Status */}
              <div className="bg-white/5 border border-white/15 rounded-2xl p-3.5 space-y-1.5">
                <label className="text-[11px] font-bold text-amber-300 block">
                  ৩. ভর্তি ফি পেমেন্ট স্ট্যাটাস
                </label>
                <select
                  value={editAdmissionStatus}
                  onChange={(e) => setEditAdmissionStatus(e.target.value as 'paid' | 'unpaid')}
                  className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="paid">✓ পরিশোধিত (Paid)</option>
                  <option value="unpaid">⚠️ বকেয়া (Unpaid / Due)</option>
                </select>
                <span className="text-[10px] text-slate-300 block">
                  ভর্তির সময় পরিশোধিত কি না
                </span>
              </div>

              {/* 4. Monthly Tuition Fee */}
              <div className="bg-white/5 border border-white/15 rounded-2xl p-3.5 space-y-1.5">
                <label className="text-[11px] font-bold text-emerald-300 block">
                  ৪. প্রত্যেক মাসিক ফি (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={editMonthlyFee}
                  onChange={(e) => setEditMonthlyFee(Number(e.target.value))}
                  className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-black text-emerald-300 focus:outline-none focus:border-emerald-400"
                />
                <span className="text-[10px] text-slate-300 block">
                  প্রতি মাসে: ৳ {toBengaliNumber(editMonthlyFee || 0)} টাকা
                </span>
              </div>

              {/* 5. Monthly Discount / Waiver */}
              <div className="bg-white/5 border border-white/15 rounded-2xl p-3.5 space-y-1.5">
                <label className="text-[11px] font-bold text-indigo-300 block">
                  ৫. মাসিক বিশেষ ছাড় (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={editMonthlyDiscount}
                  onChange={(e) => setEditMonthlyDiscount(Number(e.target.value))}
                  className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-indigo-200 focus:outline-none focus:border-indigo-400"
                />
                <span className="text-[10px] text-slate-300 block">
                  নিট মাসিক দেয়: ৳ {toBengaliNumber(Math.max(0, (editMonthlyFee || 0) - (editMonthlyDiscount || 0)))}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={markPastMonthsPaid}
                  onChange={(e) => setMarkPastMonthsPaid(e.target.checked)}
                  className="rounded border-slate-600 text-emerald-500 focus:ring-0"
                />
                <span>
                  ভর্তির পর থেকে পূর্ববর্তী মাসগুলো <strong>পরিশোধিত</strong> এবং চলতি মাস (অক্টোবর) <strong>বকেয়া</strong> হিসেবে জেনারেট করুন
                </span>
              </label>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>ফি নির্ধারণ ও পেমেন্ট জেনারেট করুন</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student Admission & Fee Plan Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3.5 text-xs">
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <span className="text-slate-500 font-semibold">ভর্তির তারিখ:</span>
          <span className="font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
            📅 {studentFeeConfig.admissionDateBn}
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <span className="text-slate-500 font-semibold">নির্ধারিত ভর্তি ফি:</span>
          <span className="font-black text-indigo-900 font-mono bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
            ৳ {toBengaliNumber(studentFeeConfig.admissionFee.toLocaleString())} (
            {studentFeeConfig.admissionFeeStatus === 'paid' ? 'পরিশোধিত ✓' : 'বকেয়া ⚠️'})
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <span className="text-slate-500 font-semibold">প্রত্যেক মাসিক ফি:</span>
          <span className="font-black text-emerald-800 font-mono bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
            ৳ {toBengaliNumber(studentFeeConfig.monthlyFee.toLocaleString())} / মাস
          </span>
        </div>
      </div>

      {/* 4 KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Billed */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>মোট ধার্যকৃত ফি (ভর্তি + মাসিক)</span>
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            ৳ {toBengaliNumber(summaryMetrics.totalBilled.toLocaleString())}
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            ভর্তি ফি + {toBengaliNumber(chartMonthsConfig.length)} মাসের বিল
          </span>
        </div>

        {/* 2. Total Paid */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>পরিশোধিত ফি (Paid)</span>
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
            ৳ {toBengaliNumber(summaryMetrics.totalPaid.toLocaleString())}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block">
            {toBengaliNumber(summaryMetrics.paidMonthsCount)} টি বিল পরিশোধিত ✓
          </span>
        </div>

        {/* 3. Total Due / Outstanding */}
        <div
          className={`p-4 rounded-2xl border space-y-1 transition-colors ${
            summaryMetrics.totalDue > 0
              ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/20'
              : 'bg-emerald-50/40 border-emerald-200'
          }`}
        >
          <span
            className={`text-[11px] font-bold flex items-center gap-1 ${
              summaryMetrics.totalDue > 0 ? 'text-rose-900' : 'text-emerald-800'
            }`}
          >
            <AlertCircle
              className={`w-3.5 h-3.5 ${
                summaryMetrics.totalDue > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-600'
              }`}
            />
            <span>বর্তমান বকেয়া (Due)</span>
          </span>
          <div
            className={`text-xl sm:text-2xl font-black font-mono ${
              summaryMetrics.totalDue > 0 ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            ৳ {toBengaliNumber(summaryMetrics.totalDue.toLocaleString())}
          </div>
          <span
            className={`text-[10px] font-semibold block ${
              summaryMetrics.totalDue > 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {summaryMetrics.totalDue > 0
              ? `${toBengaliNumber(summaryMetrics.dueMonthsCount)} টি ইনভয়েস বকেয়া রয়েছে`
              : 'কোনো বকেয়া নেই (সম্পূর্ণ পরিশোধিত)'}
          </span>
        </div>

        {/* 4. Clearance Rate */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>পেমেন্ট কমপ্লিশন হার</span>
            </span>
            <span className="text-xs font-black text-indigo-950 font-mono">
              {toBengaliNumber(summaryMetrics.rate)}%
            </span>
          </div>
          <div className="w-full bg-indigo-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${summaryMetrics.rate}%` }}
            />
          </div>
          <span className="text-[10px] text-indigo-800 font-medium block truncate">
            {summaryMetrics.rate === 100 ? '১০০% ফি ক্লিয়ারেন্স ও রসিদ প্রস্তুত' : 'পেমেন্ট কনফার্ম ও রসিদ জেনারেট সক্রিয়'}
          </span>
        </div>
      </div>

      {/* Main Recharts Bar Chart Area */}
      <div className="bg-slate-50/70 rounded-3xl border border-slate-200 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-xs font-bold text-slate-700">
              সবুজ বার = পরিশোধিত ফি (Paid)
            </span>
            <span className="text-slate-300">|</span>
            <div className="w-3 h-3 rounded-sm bg-rose-500" />
            <span className="text-xs font-bold text-slate-700">
              লাল বার = বকেয়া ফি (Due)
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            *ভর্তি ফি এবং ভর্তির তারিখ ({studentFeeConfig.admissionDateBn}) থেকে মাসিক ফিসের গ্রাফ
          </span>
        </div>

        {/* Responsive Recharts BarChart */}
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyHistoryData}
              margin={{ top: 20, right: 15, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="shortMonthBn"
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(val: number) => '৳' + toBengaliNumber(val)}
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]}
              />
              <Tooltip
                content={<CustomRechartsTooltip />}
                cursor={{ fill: '#F1F5F9', opacity: 0.7 }}
              />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs font-bold text-slate-700 mr-3">{value}</span>
                )}
                wrapperStyle={{ paddingTop: 10 }}
              />
              <ReferenceLine y={0} stroke="#94A3B8" />
              <Bar
                dataKey="paidAmount"
                name="পরিশোধিত ফি (Paid - ৳)"
                fill="#10B981"
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
              >
                {monthlyHistoryData.map((entry, index) => (
                  <Cell
                    key={`cell-paid-${index}`}
                    fill={entry.paidAmount > 0 ? '#10B981' : '#CBD5E1'}
                    className="transition-all hover:opacity-80 cursor-pointer"
                  />
                ))}
              </Bar>
              <Bar
                dataKey="dueAmount"
                name="বকেয়া ফি (Due - ৳)"
                fill="#F43F5E"
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
              >
                {monthlyHistoryData.map((entry, index) => (
                  <Cell
                    key={`cell-due-${index}`}
                    fill={entry.dueAmount > 0 ? '#F43F5E' : '#F1F5F9'}
                    className="transition-all hover:opacity-80 cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Month-by-Month & Admission Cards Grid with Direct Admin Confirm & Receipt Actions */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>ভর্তি ফি ও মাসিক পেমেন্ট হিস্ট্রি, কনফার্মেশন এবং রসিদ জেনারেটর:</span>
          </h4>
          <div className="flex items-center gap-2">
            {primaryUnpaidMonth && primaryUnpaidMonth.invoice && canConfigureAndConfirmFees && onAdminConfirmPayment && (
              <button
                type="button"
                onClick={() => onAdminConfirmPayment(primaryUnpaidMonth.invoice!)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <BadgeCheck className="w-4 h-4" />
                <span>অ্যাডমিন পেমেন্ট কনফার্ম ও রসিদ জেনারেট (৳{toBengaliNumber(primaryUnpaidMonth.dueAmount)})</span>
              </button>
            )}
            {primaryUnpaidMonth && primaryUnpaidMonth.invoice && !isTeacherRole && onPayInvoice && (
              <button
                type="button"
                onClick={() => onPayInvoice(primaryUnpaidMonth.invoice!)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-200" />
                <span>বকেয়া ৳{toBengaliNumber(primaryUnpaidMonth.dueAmount)} বিকাশ পে করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {monthlyHistoryData.map((m) => {
            const isPaid = m.status === 'paid';
            const isEditingThis = editingMonthKey === m.monthKey;

            return (
              <div
                key={m.monthKey}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  m.invoiceType === 'admission'
                    ? isPaid
                      ? 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-300'
                      : 'bg-rose-50/70 border-2 border-rose-400'
                    : isPaid
                    ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                    : 'bg-rose-50/60 border-2 border-rose-300 ring-2 ring-rose-400/20 shadow-xs'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {m.monthNameBn}
                      </span>
                      {m.invoiceType === 'admission' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-600 text-white shrink-0">
                          ভর্তি ফি
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shrink-0 ${
                        isPaid
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white animate-pulse'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>{m.statusBn}</span>
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span>রসিদ/ইনভয়েস: {m.invoiceNo}</span>
                    {canConfigureAndConfirmFees && !isEditingThis && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMonthKey(m.monthKey);
                          setEditingMonthAmount(m.totalBilled);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-sans font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>ফি পরিবর্তন</span>
                      </button>
                    )}
                  </div>

                  {/* Admin Quick Inline Amount Editor */}
                  {isEditingThis ? (
                    <div className="p-2 rounded-xl bg-white border border-indigo-300 flex items-center gap-2 pt-1.5">
                      <span className="text-xs font-bold text-slate-600">৳</span>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={editingMonthAmount}
                        onChange={(e) => setEditingMonthAmount(Number(e.target.value))}
                        className="w-full text-xs font-mono font-black text-slate-900 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveSinglePointAmount(m)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>সেভ</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-[11px] text-slate-500 font-medium">নির্ধারিত ফি:</span>
                        <span className="text-sm font-black text-slate-900 font-mono">
                          ৳ {toBengaliNumber(m.totalBilled)}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {isPaid ? 'পরিশোধিত:' : 'বকেয়া:'}
                        </span>
                        <span
                          className={`text-sm font-black font-mono ${
                            isPaid ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          ৳ {toBengaliNumber(isPaid ? m.paidAmount : m.dueAmount)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2.5 border-t border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate">
                      {isPaid
                        ? `মাধ্যম: ${m.paymentMethod || 'বিকাশ'} (${m.paidDate || 'পরিশোধিত'})`
                        : `শেষ তারিখ: ${m.dueDate}`}
                    </span>
                    {isPaid && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                        <FileText className="w-2.5 h-2.5" />
                        <span>অটো-PDF প্রস্তুত</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {isPaid ? (
                      m.invoice && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              downloadInvoicePdfReceipt(
                                m.invoice!,
                                currentStudent,
                                studentFeeConfig
                              )
                            }
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF রসিদ ডাউনলোড</span>
                          </button>
                          {onViewReceipt && (
                            <button
                              type="button"
                              onClick={() => onViewReceipt(m.invoice!)}
                              className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 text-emerald-400" />
                              <span>প্রিভিউ</span>
                            </button>
                          )}
                        </>
                      )
                    ) : (
                      <>
                        {canConfigureAndConfirmFees && m.invoice && onAdminConfirmPayment && (
                          <button
                            type="button"
                            onClick={() => onAdminConfirmPayment(m.invoice!)}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
                          >
                            <BadgeCheck className="w-3.5 h-3.5" />
                            <span>পেমেন্ট কনফার্ম ও অটো-PDF</span>
                          </button>
                        )}
                        {!isTeacherRole && m.invoice && onPayInvoice && (
                          <button
                            type="button"
                            onClick={() => onPayInvoice(m.invoice!)}
                            className="py-1.5 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <span>বিকাশ পে</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Custom Recharts Tooltip with formatted Bengali details
 */
const CustomRechartsTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const data: MonthlyFeeHistoryPoint = payload[0].payload;
  const isPaid = data.status === 'paid';

  return (
    <div className="bg-slate-950 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-2 min-w-[220px] animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 gap-2">
        <span className="font-black text-amber-300 text-sm">{data.monthNameBn}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
            isPaid ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
          }`}
        >
          {data.statusBn}
        </span>
      </div>

      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between text-slate-300">
          <span>নির্ধারিত ফি:</span>
          <span className="font-mono font-bold text-white">
            ৳ {toBengaliNumber(data.totalBilled)}
          </span>
        </div>
        <div className="flex justify-between text-emerald-400">
          <span>পরিশোধিত ফি:</span>
          <span className="font-mono font-bold">
            ৳ {toBengaliNumber(data.paidAmount)}
          </span>
        </div>
        <div className="flex justify-between text-rose-400">
          <span>বকেয়া ফি:</span>
          <span className="font-mono font-bold">
            ৳ {toBengaliNumber(data.dueAmount)}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5">
        <div>ইনভয়েস/রসিদ: {data.invoiceNo}</div>
        {data.admissionDateBn && <div>ভর্তির তারিখ: {data.admissionDateBn}</div>}
        {isPaid ? (
          <div>
            পদ্ধতি: {data.paymentMethod || 'বিকাশ'} ({data.paidDate || 'পরিশোধিত'})
          </div>
        ) : (
          <div className="text-amber-300">শেষ তারিখ: {data.dueDate}</div>
        )}
      </div>
    </div>
  );
};
