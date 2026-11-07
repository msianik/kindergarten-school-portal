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
  MapPin
} from 'lucide-react';

interface PickupModuleProps {
  students: Student[];
  onUpdateStudentStatus: (studentId: string, status: 'in_class' | 'picked_up' | 'absent', event?: PickupEvent) => void;
  pickupLogs: PickupEvent[];
  onAddPickupLog: (event: PickupEvent) => void;
  onSendUrgentPickupAlert: (student: Student, guardianNameBn: string, relationBn: string, noteBn?: string) => void;
  currentRole: UserRole;
}

export const PickupModule: React.FC<PickupModuleProps> = ({
  students,
  onUpdateStudentStatus,
  pickupLogs,
  onAddPickupLog,
  onSendUrgentPickupAlert,
  currentRole,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedPersonId, setSelectedPersonId] = useState<string>(students[0]?.authorizedPickups[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [simulatedSmsToast, setSimulatedSmsToast] = useState<{ show: boolean; msg: string; recipient: string } | null>(null);
  const [isScanningQr, setIsScanningQr] = useState(false);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [urgentNoteBn, setUrgentNoteBn] = useState('');

  // New pickup form state
  const [newNameBn, setNewNameBn] = useState('');
  const [newRelationBn, setNewRelationBn] = useState('পারিবারিক সদস্য');
  const [newPhone, setNewPhone] = useState('');
  const [newNid, setNewNid] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

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

  const handleSimulateQrScan = () => {
    setIsScanningQr(true);
    setTimeout(() => {
      setIsScanningQr(false);
      // Auto pick primary authorized person
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

      {/* Main 2-Column Workflow */}
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

              {/* Previous Pickup Log Samples Chips */}
              <div className="pt-1 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-200 block">
                  📊 ট্রেন্ড ক্যালকুলেশনে ব্যবহৃত বিগত পিক-আপ লগসমূহ:
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentStudentArrivalTrend.samples.map((sample) => (
                    <div
                      key={sample.id}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] border flex items-center gap-2 ${
                        sample.isLiveLog
                          ? 'bg-emerald-500/25 border-emerald-300 text-white font-bold'
                          : 'bg-black/25 border-white/15 text-emerald-100'
                      }`}
                    >
                      <Clock className="w-3 h-3 text-amber-300 shrink-0" />
                      <span>
                        {sample.dayLabelBn}: <strong>{sample.pickupTimeBn}</strong> ({sample.guardianNameBn} - {sample.relationBn})
                      </span>
                    </div>
                  ))}
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

                          {person.notes && (
                            <p className="text-[11px] text-slate-500 mt-2 italic bg-slate-50 p-1.5 rounded">
                              নোট: {person.notes}
                            </p>
                          )}
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

            {/* Real-Time FCM Urgent Pickup Request Box (Alerts Class Teacher Instantly) */}
            <div className="mt-6 p-4 rounded-xl bg-rose-50/75 border border-rose-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <BellRing className="w-4 h-4 text-rose-600" />
                    <span>🚨 জরুরি পিক-আপ রিকোয়েস্ট পাঠান (FCM Instant Teacher Alert)</span>
                  </h4>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    অভিভাবক গেটে পৌঁছালে শ্রেণি-শিক্ষককে তাৎক্ষণিক রিয়েল-টাইম FCM পুশ অ্যালার্ট পাঠান যেন শিশুকে দ্রুত প্রস্তুত করা হয়।
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-200/80 text-rose-900 shrink-0 self-start">
                  Firebase Cloud Messaging
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={urgentNoteBn}
                  onChange={(e) => setUrgentNoteBn(e.target.value)}
                  placeholder="জরুরি নোট (ঐচ্ছিক): যেমন—অভিভাবক গেট ১-এ অপেক্ষা করছেন, বৃষ্টি শুরু হচ্ছে..."
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

            {/* Gate Verification Action Box */}
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
  );
};
