import React, { useState, useMemo } from 'react';
import { Student, PickupPerson, PickupEvent, UserRole } from '../types/school';
import {
  validatePickupPerson,
  generateBtrcSmsMessage,
  calculateStudentExpectedArrival,
  toBengaliNumber,
} from '../utils/schoolLogic';
import { 
  ShieldCheck, 
  QrCode, 
  UserCheck, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Phone, 
  Clock, 
  UserPlus, 
  Search, 
  Check, 
  Smartphone, 
  BellRing, 
  Sparkles, 
  MapPin,
  LogIn,
  LogOut,
  Calendar,
  BadgeCheck,
  Shield,
  User
} from 'lucide-react';

interface PickupModuleProps {
  students: Student[];
  onUpdateStudentStatus: (studentId: string, status: 'in_class' | 'picked_up' | 'absent', event?: PickupEvent) => void;
  pickupLogs: PickupEvent[];
  onAddPickupLog: (event: PickupEvent) => void;
  onSendUrgentPickupAlert: (student: Student, guardianNameBn: string, relationBn: string, noteBn?: string) => void;
  currentRole: UserRole;
  loggedInStudentId?: string;
}

export const PickupModule: React.FC<PickupModuleProps> = ({
  students,
  onUpdateStudentStatus,
  pickupLogs,
  onAddPickupLog,
  onSendUrgentPickupAlert,
  currentRole,
  loggedInStudentId,
}) => {
  const isParent = currentRole === 'parent';
  const effectiveStudentId = isParent ? (loggedInStudentId || 'std-1') : undefined;

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    effectiveStudentId || students[0]?.id || ''
  );
  
  // For parents, strictly force currentStudent to the logged-in student
  const activeStudentId = isParent ? (effectiveStudentId || 'std-1') : selectedStudentId;
  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const [selectedPersonId, setSelectedPersonId] = useState<string>(
    currentStudent?.authorizedPickups[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [simulatedSmsToast, setSimulatedSmsToast] = useState<{ show: boolean; msg: string; recipient: string } | null>(null);
  const [isScanningQr, setIsScanningQr] = useState(false);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [urgentNoteBn, setUrgentNoteBn] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // New pickup form state
  const [newNameBn, setNewNameBn] = useState('');
  const [newRelationBn, setNewRelationBn] = useState('পারিবারিক সদস্য');
  const [newPhone, setNewPhone] = useState('');
  const [newNid, setNewNid] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const currentStudentArrivalTrend = useMemo(
    () => (currentStudent ? calculateStudentExpectedArrival(currentStudent, pickupLogs) : null),
    [currentStudent, pickupLogs]
  );

  const filteredStudents = students.filter(
    (s) =>
      s.nameBn.includes(searchQuery) ||
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.includes(searchQuery)
  );

  // Student specific logs
  const studentPickupLogs = useMemo(() => {
    return pickupLogs.filter((l) => l.studentId === currentStudent?.id);
  }, [pickupLogs, currentStudent?.id]);

  // Comprehensive daily In-Time (প্রবেশ সময়) and Out-Time (প্রস্থান সময়) records for this student
  const dailyGateHistory = useMemo(() => {
    if (!currentStudent) return [];

    const todayLiveLog = studentPickupLogs.find((l) => l.timestamp.includes('আজ') || l.id.startsWith('pke-'));
    const isPickedUpToday = currentStudent.currentStatus === 'picked_up' || Boolean(todayLiveLog);

    return [
      {
        id: 'gate-rec-today',
        dateBn: 'আজ, ০৬ নভেম্বর ২০২৬',
        dayLabelBn: 'আজ (শুক্রবার)',
        checkInTimeBn: 'সকাল ০৮:৫০',
        checkInStatusBn: 'সঠিক সময়ে উপস্থিত',
        checkInMethodBn: 'ডিজিটাল বায়োমেট্রিক গেট স্ক্যান',
        checkOutTimeBn: isPickedUpToday
          ? (todayLiveLog?.timestamp.replace('আজ ', '') || 'দুপুর ১২:১০')
          : 'শ্রেণিকক্ষে অবস্থানরত',
        checkOutStatus: (isPickedUpToday ? 'completed' : 'in_school') as 'completed' | 'in_school',
        checkOutStatusBn: isPickedUpToday ? 'নিরাপদ প্রস্থান সম্পন্ন' : 'ক্লাস রানিং (ছুটি অপেক্ষমাণ)',
        guardianNameBn: isPickedUpToday
          ? (todayLiveLog?.pickupPersonNameBn || currentStudent.authorizedPickups[0]?.nameBn || currentStudent.motherNameBn)
          : '—',
        relationBn: isPickedUpToday
          ? (todayLiveLog?.relationBn || currentStudent.authorizedPickups[0]?.relationBn || 'মা')
          : '—',
        gateCode: todayLiveLog?.gateCode || `GP-9821-${currentStudent.className.toUpperCase()}`,
        gateOfficerNameBn: todayLiveLog?.gateOfficerNameBn || 'হাবিবুর রহমান (মেইন গেট - পোস্ট ১)',
        smsSent: isPickedUpToday,
        isToday: true,
      },
      {
        id: 'gate-rec-1',
        dateBn: '০৫ নভেম্বর ২০২৬',
        dayLabelBn: 'গতকাল (বৃহস্পতিবার)',
        checkInTimeBn: 'সকাল ০৮:৪৮',
        checkInStatusBn: 'সঠিক সময়ে উপস্থিত',
        checkInMethodBn: 'ডিজিটাল বায়োমেট্রিক গেট স্ক্যান',
        checkOutTimeBn: 'দুপুর ১২:২৫',
        checkOutStatus: 'completed' as const,
        checkOutStatusBn: 'নিরাপদ প্রস্থান সম্পন্ন',
        guardianNameBn: currentStudent.authorizedPickups[1]?.nameBn || 'রূপালী রায়',
        relationBn: currentStudent.authorizedPickups[1]?.relationBn || 'মা',
        gateCode: `GP-7610-${currentStudent.className.toUpperCase()}`,
        gateOfficerNameBn: 'হাবিবুর রহমান (গেট সিকিউরিটি ইন-চার্জ)',
        smsSent: true,
        isToday: false,
      },
      {
        id: 'gate-rec-2',
        dateBn: '০৪ নভেম্বর ২০২৬',
        dayLabelBn: 'বুধবার',
        checkInTimeBn: 'সকাল ০৮:৫২',
        checkInStatusBn: 'সঠিক সময়ে উপস্থিত',
        checkInMethodBn: 'ডিজিটাল বায়োমেট্রিক গেট স্ক্যান',
        checkOutTimeBn: 'দুপুর ১২:৩০',
        checkOutStatus: 'completed' as const,
        checkOutStatusBn: 'নিরাপদ প্রস্থান সম্পন্ন',
        guardianNameBn: currentStudent.authorizedPickups[0]?.nameBn || currentStudent.fatherNameBn,
        relationBn: currentStudent.authorizedPickups[0]?.relationBn || 'বাবা',
        gateCode: `GP-7402-${currentStudent.className.toUpperCase()}`,
        gateOfficerNameBn: 'হাবিবুর রহমান (গেট সিকিউরিটি ইন-চার্জ)',
        smsSent: true,
        isToday: false,
      },
      {
        id: 'gate-rec-3',
        dateBn: '০৩ নভেম্বর ২০২৬',
        dayLabelBn: 'মঙ্গলবার',
        checkInTimeBn: 'সকাল ০৮:৪৫',
        checkInStatusBn: 'সঠিক সময়ে উপস্থিত',
        checkInMethodBn: 'ডিজিটাল বায়োমেট্রিক গেট স্ক্যান',
        checkOutTimeBn: 'দুপুর ১২:১৮',
        checkOutStatus: 'completed' as const,
        checkOutStatusBn: 'নিরাপদ প্রস্থান সম্পন্ন',
        guardianNameBn: currentStudent.authorizedPickups[1]?.nameBn || 'রূপালী রায়',
        relationBn: currentStudent.authorizedPickups[1]?.relationBn || 'মা',
        gateCode: `GP-7190-${currentStudent.className.toUpperCase()}`,
        gateOfficerNameBn: 'হাবিবুর রহমান (গেট সিকিউরিটি ইন-চার্জ)',
        smsSent: true,
        isToday: false,
      },
      {
        id: 'gate-rec-4',
        dateBn: '০২ নভেম্বর ২০২৬',
        dayLabelBn: 'সোমবার',
        checkInTimeBn: 'সকাল ০৮:৪৭',
        checkInStatusBn: 'সঠিক সময়ে উপস্থিত',
        checkInMethodBn: 'ডিজিটাল বায়োমেট্রিক গেট স্ক্যান',
        checkOutTimeBn: 'দুপুর ১২:২২',
        checkOutStatus: 'completed' as const,
        checkOutStatusBn: 'নিরাপদ প্রস্থান সম্পন্ন',
        guardianNameBn: currentStudent.authorizedPickups[0]?.nameBn || currentStudent.fatherNameBn,
        relationBn: currentStudent.authorizedPickups[0]?.relationBn || 'বাবা',
        gateCode: `GP-6844-${currentStudent.className.toUpperCase()}`,
        gateOfficerNameBn: 'হাবিবুর রহমান (গেট সিকিউরিটি ইন-চার্জ)',
        smsSent: true,
        isToday: false,
      },
      {
        id: 'gate-rec-5',
        dateBn: '০১ নভেম্বর ২০২৬',
        dayLabelBn: 'রবিবার',
        checkInTimeBn: 'সকাল ০৮:৪০',
        checkInStatusBn: 'সঠিক সময়ে উপস্থিত',
        checkInMethodBn: 'ডিজিটাল বায়োমেট্রিক গেট স্ক্যান',
        checkOutTimeBn: 'দুপুর ১২:১৫',
        checkOutStatus: 'completed' as const,
        checkOutStatusBn: 'নিরাপদ প্রস্থান সম্পন্ন',
        guardianNameBn: currentStudent.authorizedPickups[1]?.nameBn || 'রূপালী রায়',
        relationBn: currentStudent.authorizedPickups[1]?.relationBn || 'মা',
        gateCode: `GP-6612-${currentStudent.className.toUpperCase()}`,
        gateOfficerNameBn: 'হাবিবুর রহমান (গেট সিকিউরিটি ইন-চার্জ)',
        smsSent: true,
        isToday: false,
      },
    ];
  }, [currentStudent, studentPickupLogs]);

  const handleSimulateQrScan = () => {
    setIsScanningQr(true);
    setTimeout(() => {
      setIsScanningQr(false);
      if (currentStudent && currentStudent.authorizedPickups.length > 0) {
        setSelectedPersonId(currentStudent.authorizedPickups[0].id);
      }
    }, 1200);
  };

  const handleDispatchUrgentPickupFcm = () => {
    if (!currentStudent) return;
    const person =
      currentStudent.authorizedPickups.find((p) => p.id === selectedPersonId) ||
      currentStudent.authorizedPickups[0];
    const guardianName = person ? person.nameBn : currentStudent.fatherNameBn;
    const relation = person ? person.relationBn : 'অভিভাবক';
    onSendUrgentPickupAlert(currentStudent, guardianName, relation, urgentNoteBn);
    setUrgentNoteBn('');
  };

  const handleAuthorizeRelease = () => {
    if (!currentStudent || !selectedPersonId) return;

    const validation = validatePickupPerson(currentStudent, selectedPersonId);
    if (!validation.isValid) {
      alert(`⚠️ সতর্কবার্তা: ${validation.reason}`);
      return;
    }

    const person = validation.person!;
    const nowTimeStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const gateCode = `GP-${Math.floor(1000 + Math.random() * 9000)}-${currentStudent.className.toUpperCase()}`;
    const smsText = generateBtrcSmsMessage(currentStudent.nameBn, person.nameBn, person.relationBn, nowTimeStr);

    const newEvent: PickupEvent = {
      id: `pke-${Date.now()}`,
      studentId: currentStudent.id,
      studentNameBn: currentStudent.nameBn,
      className: currentStudent.className,
      pickupPersonId: person.id,
      pickupPersonNameBn: person.nameBn,
      relationBn: person.relationBn,
      gateOfficerNameBn: 'হাবিবুর রহমান (গেট সিকিউরিটি ইন-চার্জ)',
      timestamp: `আজ ${nowTimeStr}`,
      gateCode,
      status: 'completed',
      smsNotificationSent: true,
      smsMessage: smsText,
    };

    onUpdateStudentStatus(currentStudent.id, 'picked_up', newEvent);
    onAddPickupLog(newEvent);

    // Fire simulated Push & SMS Notification
    setSimulatedSmsToast({
      show: true,
      msg: smsText,
      recipient: currentStudent.emergencyPhone,
    });

    setTimeout(() => {
      setSimulatedSmsToast(null);
    }, 7000);
  };

  const handleResetStudentStatus = (id: string) => {
    onUpdateStudentStatus(id, 'in_class');
  };

  const handleSaveNewPickupPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameBn || !newPhone) {
      alert('অনুগ্রহ করে নাম এবং মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    const newPerson: PickupPerson = {
      id: `pk-${Date.now()}`,
      nameBn: newNameBn,
      nameEn: 'Authorized Guardian',
      relationBn: newRelationBn,
      relationEn: 'Guardian',
      phone: newPhone,
      nid: newNid || 'যাচাইকৃত জন্মনিবন্ধন/NID',
      avatarBg: 'bg-emerald-100 text-emerald-800',
      avatarIcon: '👤',
      isPrimary: false,
      approved: true,
      notes: newNotes,
    };

    currentStudent.authorizedPickups.push(newPerson);
    setIsAddingPerson(false);
    setNewNameBn('');
    setNewPhone('');
    setNewNid('');
    setNewNotes('');
    setSelectedPersonId(newPerson.id);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          PARENT SPECIFIC VIEW: Focused ONLY on Logged-in Student & In/Out History
          ========================================================================= */}
      {isParent ? (
        <div className="space-y-6">
          {/* Top Banner for Parent */}
          <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentStudent.photoUrl ? (
                <img
                  src={currentStudent.photoUrl}
                  alt={currentStudent.nameBn}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-300 shadow-md shrink-0"
                />
              ) : (
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-md shrink-0 ${currentStudent.avatarColor}`}>
                  {currentStudent.nameBn.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="bg-emerald-400/30 text-emerald-100 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                    অভিভাবক নিরাপত্তা প্যানেল
                  </span>
                  <span className="text-white/60 text-xs">·</span>
                  <span className="text-emerald-200 text-xs font-medium">স্মার্ট চাইল্ড সেফটি ও গেট পাস</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  <span>{currentStudent.nameBn}-এর ডিজিটাল গেট পাস ও প্রবেশ-প্রস্থান তথ্য</span>
                </h2>
                <p className="text-emerald-100/90 text-xs sm:text-sm mt-1">
                  শ্রেণি: <span className="font-bold text-white">{currentStudent.className} ({currentStudent.section})</span> · রোল: <span className="font-bold text-white">{currentStudent.rollNo}</span> · আইডি: <span className="font-mono font-bold text-amber-200">{currentStudent.id.toUpperCase()}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                onClick={() => setShowQrModal(true)}
                className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>গেট পাস কিউআর কার্ড</span>
              </button>
              <button
                onClick={() => {
                  const elem = document.getElementById('urgent-pickup-box');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <BellRing className="w-4 h-4" />
                <span>জরুরি শিক্ষক অ্যালার্ট</span>
              </button>
            </div>
          </div>

          {/* Today's Live In-Time & Out-Time Status Summary Cards (৩টি স্ট্যাটাস কার্ড) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. In-Time / স্কুলের প্রবেশ সময় */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-2xs hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <LogIn className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>উপস্থিত</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  আজকের স্কুলে প্রবেশের সময় (In-Time)
                </span>
                <div className="text-2xl font-black text-slate-900 mt-0.5 flex items-baseline gap-2">
                  <span>{dailyGateHistory[0]?.checkInTimeBn || 'সকাল ০৮:৫০'}</span>
                  <span className="text-xs font-medium text-emerald-700 font-sans">মিনিট</span>
                </div>
                <div className="mt-2 text-xs text-slate-600 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100/60 flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ডিজিটাল বায়োমেট্রিক গেট এন্ট্রি সম্পন্ন</span>
                </div>
              </div>
            </div>

            {/* 2. Out-Time / স্কুল থেকে প্রস্থান সময় */}
            <div className="bg-white rounded-2xl border border-teal-200 p-5 shadow-2xs hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  dailyGateHistory[0]?.checkOutStatus === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  <LogOut className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                  dailyGateHistory[0]?.checkOutStatus === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{dailyGateHistory[0]?.checkOutStatusBn}</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  ছুটির পর প্রস্থান সময় (Out-Time)
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 truncate">
                  {dailyGateHistory[0]?.checkOutTimeBn}
                </div>
                <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60 flex items-center justify-between">
                  <span>সম্ভাব্য পিক-আপ:</span>
                  <span className="font-bold text-teal-800">
                    {currentStudentArrivalTrend?.expectedGatePickupTimeBn || 'দুপুর ১২:২০'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Gate Code & Safety Info */}
            <div className="bg-white rounded-2xl border border-cyan-200 p-5 shadow-2xs hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800 font-mono">
                  {dailyGateHistory[0]?.gateCode}
                </span>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  গেট সিকিউরিটি ও ভেরিফিকেশন
                </span>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  অফিসার: {dailyGateHistory[0]?.gateOfficerNameBn}
                </div>
                <div className="mt-2 text-xs text-slate-600 bg-cyan-50/70 p-2 rounded-lg border border-cyan-100/60 flex items-center justify-between">
                  <span>জরুরি হেল্পলাইন:</span>
                  <span className="font-mono font-bold text-cyan-900">{currentStudent.emergencyPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Feature: কবে কোন সময় ঢুকেছে এবং কোন সময় বের হয়েছে (Daily Entry & Exit Logs Table) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-emerald-50/20 to-teal-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>দৈনিক প্রবেশ ও প্রস্থান বিস্তারিত হিস্ট্রি</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  📅 {currentStudent.nameBn}-এর প্রতিদিনের স্কুলে প্রবেশ ও প্রস্থান রেকর্ড
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  আপনার সন্তান কবে কোন সময় স্কুলে ঢুকেছে (In-Time) এবং ছুটির পর কোন সময় স্কুল থেকে বের হয়েছে (Out-Time)—তার প্রমাণ্য ডিজিটাল লগ।
                </p>
              </div>

              <div className="bg-emerald-100/70 text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto flex items-center gap-1.5 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>ক্লাউড ভেরিফাইড গেট রেকর্ড</span>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">তারিখ ও বার</th>
                    <th className="py-3 px-4 font-bold text-emerald-800">
                      <div className="flex items-center gap-1.5">
                        <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                        <span>স্কুলে প্রবেশের সময় (In-Time)</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 font-bold text-teal-800">
                      <div className="flex items-center gap-1.5">
                        <LogOut className="w-3.5 h-3.5 text-teal-600" />
                        <span>স্কুল থেকে প্রস্থান সময় (Out-Time)</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 font-bold">গ্রহণকারী অভিভাবক</th>
                    <th className="py-3 px-4 font-bold">গেট পাস কোড ও সিকিউরিটি অফিসার</th>
                    <th className="py-3 px-4 font-bold text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {dailyGateHistory.map((rec) => (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        rec.isToday ? 'bg-emerald-50/30 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 block">{rec.dateBn}</span>
                            <span className="text-[11px] text-slate-500">{rec.dayLabelBn}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold font-mono text-xs">
                            <LogIn className="w-3 h-3 text-emerald-600" />
                            <span>{rec.checkInTimeBn}</span>
                          </span>
                          <span className="text-[11px] text-slate-500">({rec.checkInStatusBn})</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs ${
                            rec.checkOutStatus === 'completed'
                              ? 'bg-teal-100 text-teal-800 font-mono'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            <LogOut className="w-3 h-3" />
                            <span>{rec.checkOutTimeBn}</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {rec.checkOutStatus === 'completed' ? (
                          <div>
                            <span className="font-bold text-slate-900">{rec.guardianNameBn}</span>
                            <span className="text-slate-500 text-[11px] ml-1">({rec.relationBn})</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">এখনও নেওয়া হয়নি</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-mono font-bold text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {rec.gateCode}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{rec.gateOfficerNameBn}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {rec.checkOutStatus === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>প্রস্থান সম্পন্ন ✓</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            <span>শ্রেণিকক্ষে আছে</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden divide-y divide-slate-100 p-4 space-y-3">
              {dailyGateHistory.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-3.5 rounded-xl border ${
                    rec.isToday ? 'bg-emerald-50/40 border-emerald-300' : 'bg-slate-50/50 border-slate-200'
                  } space-y-2.5`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{rec.dateBn}</span>
                      <span className="text-[10px] text-slate-500">{rec.dayLabelBn}</span>
                    </div>
                    {rec.checkOutStatus === 'completed' ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✓ প্রস্থান সম্পন্ন
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        শ্রেণিকক্ষে আছে
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">
                        প্রবেশ সময় (In-Time):
                      </span>
                      <span className="font-mono font-bold text-slate-900">{rec.checkInTimeBn}</span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] font-bold text-teal-700 block mb-0.5">
                        প্রস্থান সময় (Out-Time):
                      </span>
                      <span className="font-bold text-slate-900 truncate block">{rec.checkOutTimeBn}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                    <span>গ্রহণকারী: {rec.guardianNameBn} ({rec.relationBn})</span>
                    <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                      {rec.gateCode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2 Columns: Gate Pass QR Card & Authorized Guardians */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Digital Gate Pass Card (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-300">
                        ডিজিটাল চাইল্ড গেট পাস
                      </h4>
                      <span className="text-[10px] text-slate-400">আনন্দ পাঠশালা চাইল্ড সেফটি কার্ড</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                    {currentStudent.rollNo} · {currentStudent.className}
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10">
                  {currentStudent.photoUrl ? (
                    <img
                      src={currentStudent.photoUrl}
                      alt={currentStudent.nameBn}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-400 shrink-0"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl shrink-0 ${currentStudent.avatarColor}`}>
                      {currentStudent.nameBn.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white truncate">{currentStudent.nameBn}</h3>
                    <p className="text-xs text-emerald-200">শ্রেণি: {currentStudent.className} ({currentStudent.section})</p>
                    <p className="text-xs text-slate-300 font-mono">আইডি: {currentStudent.id.toUpperCase()}</p>
                    <span className="inline-block mt-1 text-[10px] bg-rose-500/20 border border-rose-400/30 text-rose-300 font-bold px-1.5 py-0.2 rounded">
                      ব্লাড গ্রুপ: {currentStudent.bloodGroup}
                    </span>
                  </div>
                </div>

                {/* Simulated QR Code for Gate Scanner */}
                <div className="bg-white p-4 rounded-xl text-slate-900 flex flex-col items-center justify-center text-center shadow-inner">
                  <div className="w-36 h-36 border-4 border-slate-900 p-2 rounded-xl flex items-center justify-center bg-white relative">
                    <div className="grid grid-cols-5 gap-1 w-full h-full p-1">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-xs ${
                            [0, 1, 3, 4, 5, 9, 12, 14, 15, 19, 20, 21, 23, 24].includes(i)
                              ? 'bg-slate-900'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        GATE
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                      GP-{currentStudent.rollNo}-{currentStudent.className.toUpperCase()}-SECURE
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      স্কুল গেটের সিকিউরিটি স্ক্যানারে এই কিউআর প্রদর্শন করে দ্রুত প্রবেশ বা প্রস্থান নিশ্চিত করুন
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-200/80 bg-white/5 p-2.5 rounded-lg border border-white/10 space-y-1">
                  <div className="flex justify-between">
                    <span>জরুরি যোগাযোগ (SMS):</span>
                    <span className="font-mono text-white font-bold">{currentStudent.emergencyPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ঠিকানা:</span>
                    <span className="text-slate-300 truncate max-w-[180px]">{currentStudent.homeAddressBn}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Authorized Whitelist Guardians & Teacher FCM Alert (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      অনুমোদিত পিক-আপ অভিভাবক তালিকা (Authorized Whitelist)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      স্কুল ছুটির সময় শিশুকে শুধুমাত্র এই নিবন্ধিত ব্যক্তিদের হাতে তুলে দেওয়া যাবে।
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddingPerson(!isAddingPerson)}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {isAddingPerson ? 'বাতিল' : 'নতুন অভিভাবক যোগ'}
                  </button>
                </div>

                {/* Add new person drawer/form */}
                {isAddingPerson && (
                  <form onSubmit={handleSaveNewPickupPerson} className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-900">অনুমোদিত নতুন পিক-আপ ব্যক্তির তথ্য</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-700 block mb-1">পূর্ণ নাম (বাংলায়):</label>
                        <input
                          type="text"
                          required
                          value={newNameBn}
                          onChange={(e) => setNewNameBn(e.target.value)}
                          placeholder="যেমন: মো. কামরুল ইসলাম"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-700 block mb-1">সম্পর্ক (Relation):</label>
                        <select
                          value={newRelationBn}
                          onChange={(e) => setNewRelationBn(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="বাবা">বাবা</option>
                          <option value="মা">মা</option>
                          <option value="দাদা / নানা">দাদা / নানা</option>
                          <option value="দাদি / নানি">দাদি / নানি</option>
                          <option value="মামা / চাচা">মামা / চাচা</option>
                          <option value="খালা / ফুফু">খালা / ফুফু</option>
                          <option value="অনুমোদিত ড্রাইভার">অনুমোদিত ড্রাইভার</option>
                          <option value="পারিবারিক প্রতিনিধি">পারিবারিক প্রতিনিধি</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-700 block mb-1">মোবাইল নম্বর:</label>
                        <input
                          type="text"
                          required
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="যেমন: ০১৭১১-০০০০০০"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-700 block mb-1">জাতীয় পরিচয়পত্র (NID) নম্বর:</label>
                        <input
                          type="text"
                          value={newNid}
                          onChange={(e) => setNewNid(e.target.value)}
                          placeholder="NID নম্বর"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingPerson(false)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                      >
                        তালিকাভুক্ত করুন
                      </button>
                    </div>
                  </form>
                )}

                {/* Authorized Person Cards */}
                <div className="space-y-3">
                  {currentStudent.authorizedPickups.map((person) => {
                    const isSelected = selectedPersonId === person.id;
                    return (
                      <div
                        key={person.id}
                        onClick={() => setSelectedPersonId(person.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${person.avatarBg}`}>
                              {person.avatarIcon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{person.nameBn}</h4>
                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  {person.relationBn}
                                </span>
                                {person.isPrimary && (
                                  <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                                    প্রধান অভিভাবক
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="font-mono text-slate-700">{person.phone}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="font-mono text-slate-600 text-[11px]">NID: {person.nid}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isSelected ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                <Check className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border border-slate-300" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Instant Teacher FCM Alert for Pickup */}
                <div id="urgent-pickup-box" className="p-4 rounded-xl bg-rose-50/75 border border-rose-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                        <BellRing className="w-4 h-4 text-rose-600" />
                        <span>🚨 আপনি কি গেটে পৌঁছেছেন? শ্রেণি-শিক্ষককে দ্রুত অ্যালার্ট পাঠান</span>
                      </h4>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        গেট ১/২-এ পৌঁছালে শিক্ষককে তাৎক্ষণিক পুশ নোটিফিকেশন পাঠান যেন সন্তানকে দ্রুত প্রস্তুত করে গেটে পাঠানো হয়।
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-200/80 text-rose-900 shrink-0 self-start">
                      FCM Instant Alert
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={urgentNoteBn}
                      onChange={(e) => setUrgentNoteBn(e.target.value)}
                      placeholder="যেমন: গেট ১-এ দাঁড়িয়ে আছি, বৃষ্টি শুরু হচ্ছে..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleDispatchUrgentPickupFcm}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>শিক্ষককে জরুরি FCM অ্যালার্ট পাঠান</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            TEACHER / ADMIN VIEW: Multi-Student Selector, Authorizations & Full School
            ========================================================================= */
        <div className="space-y-6">
          {/* Top Banner & Module Explanation */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-400/30 text-emerald-100 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                  কেজি ও প্লে স্কুলের বিশেষ মডিউল #১
                </span>
                <span className="text-white/60 text-xs">·</span>
                <span className="text-white/90 text-xs font-medium">স্মার্ট চাইল্ড সেফটি ও গেট-পাস</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">পিক-আপ সিকিউরিটি ও ভেরিফাইড গেট-পাস</h2>
              <p className="text-emerald-100/90 text-sm max-w-2xl mt-1">
                ছুটির সময় শিশুকে নিরাপদ ব্যক্তির হাতে তুলে দেওয়ার সার্বিক নিরাপত্তা ফ্রেমওয়ার্ক। বায়োমেট্রিক আইডি/ছবি ভেরিফিকেশন,
                কিউআর গেট কোড স্ক্যান এবং অভিভাবকদের ফোনে রিয়েল-টাইম বাল্ক এসএমএস বার্তা প্রেরণ।
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleSimulateQrScan}
                disabled={isScanningQr}
                className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                {isScanningQr ? 'কিউআর কোড স্ক্যান হচ্ছে...' : 'ডিজিটাল গেট পাস স্ক্যান করুন'}
              </button>
            </div>
          </div>

          {/* Main 2-Column Workflow for Teachers / Admins */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Student Selector & Student Profile (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">শিক্ষার্থী নির্বাচন (Select Student)</h3>
                  <span className="text-xs text-slate-500">{students.length} জন শিক্ষার্থী নিবন্ধিত</span>
                </div>

                {/* Quick search */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="নাম বা রোল নম্বর দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Student list tiles */}
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {filteredStudents.map((std) => {
                    const stdTrend = calculateStudentExpectedArrival(std, pickupLogs);
                    return (
                      <div
                        key={std.id}
                        onClick={() => {
                          setSelectedStudentId(std.id);
                          setSelectedPersonId(std.authorizedPickups[0]?.id || '');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          selectedStudentId === std.id
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {std.photoUrl ? (
                            <img
                              src={std.photoUrl}
                              alt={std.nameBn}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-xl object-cover border border-emerald-200 shrink-0"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${std.avatarColor}`}>
                              {std.nameBn.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 truncate">{std.nameBn}</span>
                              <span className="text-[10px] text-slate-500">({std.nameEn})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              শ্রেণি: {std.className} · রোল: {std.rollNo}
                            </div>
                            <div className="text-[10px] text-teal-800 font-bold flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-teal-600 shrink-0" />
                              <span>সম্ভাব্য আগমন: {stdTrend.expectedHomeArrivalTimeBn}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {std.currentStatus === 'picked_up' ? (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                              ✓ প্রস্থান সম্পন্ন
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                              শ্রেণিকক্ষে আছে
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Student Detail Card */}
              {currentStudent && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      {currentStudent.photoUrl ? (
                        <img
                          src={currentStudent.photoUrl}
                          alt={currentStudent.nameBn}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shrink-0"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${currentStudent.avatarColor}`}>
                          {currentStudent.nameBn.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{currentStudent.nameBn}</h4>
                        <p className="text-xs text-slate-500">
                          শ্রেণি: {currentStudent.className} ({currentStudent.section}) · রোল: {currentStudent.rollNo}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">ব্লাড গ্রুপ</span>
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        {currentStudent.bloodGroup}
                      </span>
                    </div>
                  </div>

                  {/* Health and safety notes */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">অ্যালার্জি ও জরুরি নোট: </span>
                        <span>{currentStudent.allergies}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                      <div>
                        <span className="text-[11px] text-slate-400 block">পিতা:</span>
                        <span className="font-medium text-slate-800">{currentStudent.fatherNameBn}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">মাতা:</span>
                        <span className="font-medium text-slate-800">{currentStudent.motherNameBn}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="text-[11px] text-slate-400 block">জরুরি ফোন নম্বর (SMS রিসিভার):</span>
                      <span className="font-mono font-medium text-slate-800">{currentStudent.emergencyPhone}</span>
                    </div>

                    <div className="pt-1">
                      <span className="text-[11px] text-slate-400 block">ঠিকানা:</span>
                      <span className="text-slate-700">{currentStudent.homeAddressBn}</span>
                    </div>
                  </div>

                  {/* Reset Status button if picked up */}
                  {currentStudent.currentStatus === 'picked_up' && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-emerald-700 font-medium">নিরাপদ প্রস্থান রেকর্ড সম্পন্ন হয়েছে।</span>
                      <button
                        onClick={() => handleResetStudentStatus(currentStudent.id)}
                        className="text-xs text-slate-500 hover:text-slate-800 underline"
                      >
                        শ্রেণিকক্ষে ফেরত আনুন
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Whitelist Verification & Gate Action (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Expected Arrival Time Card Based on Previous Pickup Log Trends */}
              {currentStudent && currentStudentArrivalTrend && (
                <div className="bg-gradient-to-br from-teal-900 via-emerald-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-emerald-400/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3.5">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[10px] font-black uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>অভিভাবক পিক-আপ ট্রেন্ড বিশ্লেষণ (Expected Arrival Time)</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black">
                        ⏱️ {currentStudent.nameBn}-এর সম্ভাব্য পৌঁছানোর সময় (Expected Arrival)
                      </h3>
                      <p className="text-xs text-emerald-100/90">
                        বিগত {toBengaliNumber(currentStudentArrivalTrend.totalAnalyzedLogs)} দিনের পিক-আপ লগের সময় ট্রেন্ড ও বাসার দূরত্ব ({currentStudent.homeAddressBn}) বিশ্লেষণ করে নির্ণীত
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/20 text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-amber-200 block">
                        পিক-আপ ধারাবাহিকতা
                      </span>
                      <span className="text-base font-black font-mono text-emerald-300">
                        {toBengaliNumber(currentStudentArrivalTrend.consistencyRate)}% ({currentStudentArrivalTrend.trendLabelBn.split(' ')[0]})
                      </span>
                    </div>
                  </div>

                  {/* 3 Expected Arrival Metric Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-200 uppercase block">
                        সম্ভাব্য গেট পিক-আপ সময়
                      </span>
                      <div className="text-lg font-black font-mono text-white">
                        {currentStudentArrivalTrend.expectedGatePickupTimeBn}
                      </div>
                      <span className="text-[11px] text-emerald-200/90 block">
                        সময়সীমা: {currentStudentArrivalTrend.expectedPickupWindowBn}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-400/20 border border-amber-300/40 space-y-1">
                      <span className="text-[10px] font-black text-amber-200 uppercase block">
                        🏠 বাসায় সম্ভাব্য আগমন (Expected Arrival)
                      </span>
                      <div className="text-lg font-black font-mono text-amber-300">
                        {currentStudentArrivalTrend.expectedHomeArrivalTimeBn}
                      </div>
                      <span className="text-[11px] text-amber-100 block flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                        <span>যাতায়াত সময়: ~{toBengaliNumber(currentStudentArrivalTrend.commuteDurationMinutes)} মিনিট</span>
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-200 uppercase block">
                        নিয়মিত গ্রহণকারী অভিভাবক
                      </span>
                      <div className="text-sm font-black text-white truncate">
                        {currentStudentArrivalTrend.usualGuardianNameBn}
                      </div>
                      <span className="text-[11px] text-emerald-200/90 block">
                        সম্পর্ক: {currentStudentArrivalTrend.usualRelationBn} · {currentStudentArrivalTrend.trendLabelBn}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      অনুমোদিত পিক-আপ অভিভাবক তালিকা (Authorized Whitelist)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      স্কুল ছুটির সময় শিশুকে শুধুমাত্র এই নিবন্ধিত ব্যক্তিদের হাতে তুলে দেওয়া যাবে।
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddingPerson(!isAddingPerson)}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {isAddingPerson ? 'বাতিল' : 'নতুন অভিভাবক যোগ'}
                  </button>
                </div>

                {/* Add new person drawer/form */}
                {isAddingPerson && (
                  <form onSubmit={handleSaveNewPickupPerson} className="mb-5 p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-900">অনুমোদিত নতুন পিক-আপ ব্যক্তির তথ্য</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-700 block mb-1">পূর্ণ নাম (বাংলায়):</label>
                        <input
                          type="text"
                          required
                          value={newNameBn}
                          onChange={(e) => setNewNameBn(e.target.value)}
                          placeholder="যেমন: মো. কামরুল ইসলাম"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-700 block mb-1">সম্পর্ক (Relation):</label>
                        <select
                          value={newRelationBn}
                          onChange={(e) => setNewRelationBn(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="বাবা">বাবা</option>
                          <option value="মা">মা</option>
                          <option value="দাদা / নানা">দাদা / নানা</option>
                          <option value="দাদি / নানি">দাদি / নানি</option>
                          <option value="মামা / চাচা">মামা / চাচা</option>
                          <option value="খালা / ফুফু">খালা / ফুফু</option>
                          <option value="অনুমোদিত ড্রাইভার">অনুমোদিত ড্রাইভার</option>
                          <option value="পারিবারিক প্রতিনিধি">পারিবারিক প্রতিনিধি</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-700 block mb-1">মোবাইল নম্বর:</label>
                        <input
                          type="text"
                          required
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="যেমন: ০১৭১১-০০০০০০"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-700 block mb-1">জাতীয় পরিচয়পত্র (NID) নম্বর:</label>
                        <input
                          type="text"
                          value={newNid}
                          onChange={(e) => setNewNid(e.target.value)}
                          placeholder="NID নম্বর"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-700 block mb-1">বিশেষ নির্দেশনা বা নোট:</label>
                      <input
                        type="text"
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        placeholder="যেমন: ছুটির দিনে বা বিশেষ অনুমোদনে আসেন..."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingPerson(false)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                      >
                        তালিকাভুক্ত করুন
                      </button>
                    </div>
                  </form>
                )}

                {/* Authorized Person Cards */}
                <div className="space-y-3">
                  {currentStudent.authorizedPickups.map((person) => {
                    const isSelected = selectedPersonId === person.id;
                    return (
                      <div
                        key={person.id}
                        onClick={() => setSelectedPersonId(person.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${person.avatarBg}`}>
                              {person.avatarIcon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{person.nameBn}</h4>
                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  {person.relationBn}
                                </span>
                                {person.isPrimary && (
                                  <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                                    প্রধান অভিভাবক
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="font-mono text-slate-700">{person.phone}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="font-mono text-slate-600 text-[11px]">NID: {person.nid}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isSelected ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                <Check className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border border-slate-300" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Gate Verification Action Box for Teachers */}
                <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] text-slate-500 block">বর্তমান গেট সিকিউরিটি অফিসার:</span>
                    <span className="text-xs font-bold text-slate-800">হাবিবুর রহমান (মেইন গেট - পোস্ট ১)</span>
                    <span className="text-[11px] text-emerald-700 block mt-0.5">
                      ● গেট পাস কোড জেনারেটর সক্রিয় | এসএমএস ও FCM অটোপাইলট অন
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleAuthorizeRelease}
                      disabled={!selectedPersonId || currentStudent.currentStatus === 'picked_up'}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                        currentStudent.currentStatus === 'picked_up'
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : !selectedPersonId
                          ? 'bg-emerald-300 text-white cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      {currentStudent.currentStatus === 'picked_up'
                        ? 'প্রস্থান ইতোমধ্যে সম্পন্ন'
                        : 'নিরাপদ প্রস্থান অনুমোদন ও SMS পাঠান'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Gate Pass Log */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    লাইভ গেট প্রস্থান ও এসএমএস লগ (Live Security Log)
                  </h3>
                  <span className="text-xs text-slate-500">স্বয়ংক্রিয় ক্লাউড সিঙ্ক</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {pickupLogs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      আজকে এখনো কোনো প্রস্থান রেকর্ড নেই।
                    </div>
                  ) : (
                    pickupLogs.map((log) => (
                      <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                        <div className="flex items-start gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{log.studentNameBn}</span>
                              <span className="text-[11px] text-slate-500">({log.className})</span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                {log.gateCode}
                              </span>
                            </div>
                            <p className="text-slate-600 mt-0.5">
                              গ্রহণকারী: <span className="font-semibold">{log.pickupPersonNameBn}</span> ({log.relationBn})
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              যাচাইকারী: {log.gateOfficerNameBn}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-medium text-slate-700 block">{log.timestamp}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
                            SMS Sent ✓
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulated SMS Notification Alert Toast */}
      {simulatedSmsToast && (
        <div className="bg-slate-900 border border-emerald-500/50 rounded-xl p-4 text-white shadow-xl animate-bounce flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-emerald-400">গ্রিনওয়েব টেলিকম বিটিআরসি এসএমএস গেটওয়ে</span>
              <span className="text-slate-400">প্রাপক: {simulatedSmsToast.recipient}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
              {simulatedSmsToast.msg}
            </p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ডেলিভারি স্ট্যাটাস: সফলভাবে প্রেরিত (Delivered via SMS Gateway & FCM Notification)</span>
            </div>
          </div>
          <button
            onClick={() => setSimulatedSmsToast(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
          >
            বন্ধ
          </button>
        </div>
      )}

      {/* QR Pass Fullscreen Modal for Parent */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-left">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">ডিজিটাল গেট পাস কিউআর</h4>
                  <span className="text-[10px] text-slate-500">আনন্দ পাঠশালা</span>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-2">
              <h3 className="text-lg font-black text-slate-900">{currentStudent.nameBn}</h3>
              <p className="text-xs text-slate-500">শ্রেণি: {currentStudent.className} · রোল: {currentStudent.rollNo}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center">
              <div className="w-48 h-48 border-4 border-slate-900 p-2.5 rounded-2xl flex items-center justify-center bg-white shadow-sm relative">
                <div className="grid grid-cols-7 gap-1 w-full h-full p-1">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        [0, 1, 2, 4, 5, 6, 7, 13, 14, 20, 24, 28, 34, 35, 41, 42, 43, 47, 48].includes(i)
                          ? 'bg-slate-900'
                          : (i % 2 === 0 ? 'bg-emerald-950' : 'bg-slate-200')
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                    GATE PASS
                  </span>
                </div>
              </div>
              <span className="font-mono font-bold text-xs text-slate-800 mt-3 tracking-widest">
                GP-2026-{currentStudent.rollNo}-{currentStudent.className.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              স্কুলে আসা বা ছুটির সময় গেটের গার্ডের ডিজিটাল স্ক্যানারে এই কোডটি দেখান।
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
