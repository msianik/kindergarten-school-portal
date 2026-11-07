import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Student, 
  SchoolClass, 
  UserRole 
} from '../types/school';
import { 
  getSchoolClassNameBn, 
  toBengaliNumber 
} from '../utils/schoolLogic';
import { 
  Printer, 
  QrCode, 
  X, 
  ShieldCheck, 
  Phone, 
  Calendar, 
  Heart, 
  User, 
  Sparkles, 
  Check, 
  Copy, 
  Layers, 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Download,
  AlertCircle,
  Building2
} from 'lucide-react';

interface StudentIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialStudentId?: string;
  initialClass?: SchoolClass | 'all';
  currentRole?: UserRole;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  isOpen,
  onClose,
  students,
  initialStudentId,
  initialClass = 'all',
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || ''
  );
  const [selectedClassFilter, setSelectedClassFilter] = useState<SchoolClass | 'all'>(initialClass);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [cardSideView, setCardSideView] = useState<'both' | 'front' | 'back'>('both');
  const [copiedQrText, setCopiedQrText] = useState(false);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [batchQrMap, setBatchQrMap] = useState<Record<string, string>>({});

  // Sync initial student when modal opens
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
  }, [initialStudentId, students]);

  // Current selected student
  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Students filtered for batch view or quick navigation
  const filteredStudents = selectedClassFilter === 'all'
    ? students
    : students.filter((s) => s.className === selectedClassFilter);

  // Generate QR payload for a student
  const getStudentQrPayload = (std: Student) => {
    const primaryPickup = std.authorizedPickups?.find((p) => p.isPrimary) || std.authorizedPickups?.[0];
    const guardianName = primaryPickup?.nameBn || std.fatherNameBn || std.motherNameBn || 'অভিভাবক';
    return JSON.stringify({
      app: 'AnandaPathshala',
      type: 'STUDENT_PICKUP_PASS',
      studentId: std.id,
      rollNo: std.rollNo,
      nameBn: std.nameBn,
      nameEn: std.nameEn,
      className: std.className,
      section: std.section,
      guardianPhone: std.emergencyPhone,
      guardianName: guardianName,
      guardianRelation: primaryPickup?.relationBn || 'বাবা',
      pickupPassCode: `AP-GATE-${std.className.toUpperCase()}-${std.rollNo}`,
      academicYear: '2026',
      verifiedSchool: 'Ananda Pathshala Kindergarten, Kushtia',
    });
  };

  // Generate QR code data URL for single student
  useEffect(() => {
    if (!currentStudent) return;
    const payload = getStudentQrPayload(currentStudent);
    QRCode.toDataURL(payload, {
      width: 220,
      margin: 1,
      color: {
        dark: '#064e3b', // Deep emerald
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR Code:', err));
  }, [currentStudent]);

  // Generate QR codes for batch view
  useEffect(() => {
    if (activeTab !== 'batch') return;
    const map: Record<string, string> = {};
    const generateAll = async () => {
      for (const std of filteredStudents) {
        try {
          const payload = getStudentQrPayload(std);
          const url = await QRCode.toDataURL(payload, {
            width: 180,
            margin: 1,
            color: {
              dark: '#064e3b',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'M',
          });
          map[std.id] = url;
        } catch (e) {
          console.error(e);
        }
      }
      setBatchQrMap(map);
    };
    generateAll();
  }, [activeTab, filteredStudents, selectedClassFilter]);

  if (!isOpen || !currentStudent) return null;

  const primaryPickup = currentStudent.authorizedPickups?.find((p) => p.isPrimary) || currentStudent.authorizedPickups?.[0];
  const guardianDisplayName = primaryPickup?.nameBn || currentStudent.fatherNameBn || currentStudent.motherNameBn || 'অভিভাবক';
  const guardianRelation = primaryPickup?.relationBn || 'পিতা';

  // Navigate to previous/next student
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

  const handlePrint = () => {
    window.print();
  };

  const handleCopyQrData = () => {
    const payload = getStudentQrPayload(currentStudent);
    navigator.clipboard.writeText(payload);
    setCopiedQrText(true);
    setTimeout(() => setCopiedQrText(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_Pickup_${currentStudent.nameEn.replace(/\s+/g, '_')}_Roll_${currentStudent.rollNo}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-100 rounded-3xl max-w-5xl w-full p-4 sm:p-6 space-y-5 shadow-2xl border border-slate-300 my-4 max-h-[95vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:max-h-none print:w-full print:bg-white"
      >
        {/* ========================================================================= */}
        {/* SCREEN ONLY HEADER (Hidden during printing)                               */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  ডিজিটাল আইডি কার্ড ও ভেরিফায়েড পিকআপ কিউআর
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  শিক্ষাবর্ষ ২০২৬
                </span>
              </div>
              <p className="text-xs text-slate-500">
                প্রিন্ট-রেডি কার্ড ফরম্যাট · নিরাপদ ছুটি ও অভিভাবক ভেরিফিকেশন গেট-পাস
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'single'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>একক কার্ড</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('batch')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'batch'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>শ্রেণি শিট ({filteredStudents.length})</span>
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
              title="আইডি কার্ড সরাসরি প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STUDENT SELECTOR & CONTROLS (Hidden during printing)                      */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 print:hidden text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              শ্রেণি ফিল্টার:
            </span>
            <select
              value={selectedClassFilter}
              onChange={(e) => {
                const newCls = e.target.value as SchoolClass | 'all';
                setSelectedClassFilter(newCls);
                const first = newCls === 'all' ? students[0] : students.find((s) => s.className === newCls);
                if (first) setSelectedStudentId(first.id);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">সকল শ্রেণি ({students.length})</option>
              <option value="HateKhori">হাতেখড়ি (Pre-Play)</option>
              <option value="Play">প্লে (Play)</option>
              <option value="Nursery">নার্সারি (Nursery)</option>
              <option value="KG">কেজি (KG)</option>
              <option value="Class-1">ওয়ান (Class 1)</option>
              <option value="Class-2">টু (Class 2)</option>
            </select>

            {activeTab === 'single' && (
              <>
                <span className="text-slate-400">|</span>
                <span className="font-bold text-slate-700">শিক্ষার্থী:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-600 max-w-[200px] truncate cursor-pointer"
                >
                  {filteredStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      রোল {toBengaliNumber(s.rollNo)}: {s.nameBn} ({s.className})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevStudent}
                    disabled={currentIndex <= 0}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="পূর্ববর্তী শিক্ষার্থী"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="font-mono text-[11px] text-slate-500 font-bold px-1">
                    {currentIndex + 1} / {filteredStudents.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextStudent}
                    disabled={currentIndex >= filteredStudents.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="পরবর্তী শিক্ষার্থী"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </>
            )}
          </div>

          {activeTab === 'single' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">পিঠ প্রদর্শন:</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCardSideView('both')}
                  className={`px-2 py-1 rounded font-bold cursor-pointer ${
                    cardSideView === 'both' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  উভয় পিঠ
                </button>
                <button
                  type="button"
                  onClick={() => setCardSideView('front')}
                  className={`px-2 py-1 rounded font-bold cursor-pointer ${
                    cardSideView === 'front' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  সম্মুখভাগ
                </button>
                <button
                  type="button"
                  onClick={() => setCardSideView('back')}
                  className={`px-2 py-1 rounded font-bold cursor-pointer ${
                    cardSideView === 'back' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  পেছনভাগ (QR)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CARD CONTENT AREA (Scrollable on screen, Full bleed on Print)             */}
        {/* ========================================================================= */}
        <div className="overflow-y-auto flex-1 pr-1 print:overflow-visible print:p-0">
          {activeTab === 'single' ? (
            /* ===================================================================== */
            /* SINGLE STUDENT VIEW                                                   */
            /* ===================================================================== */
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-2 print:gap-4 print:py-0">
                {/* ---------------- FRONT SIDE ---------------- */}
                {(cardSideView === 'both' || cardSideView === 'front') && (
                  <div className="student-id-card-front print-avoid-break break-inside-avoid w-[320px] sm:w-[340px] h-[520px] rounded-3xl bg-white shadow-xl border-2 border-emerald-700/30 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-2 print:border-slate-800">
                    {/* Lanyard Hole Visual */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-2.5 rounded-full bg-slate-200 border border-slate-300 print:hidden z-20"></div>

                    {/* Card Top Branding Header */}
                    <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 text-white p-4 pt-5 text-center relative overflow-hidden shrink-0 border-b-4 border-amber-400">
                      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none"></div>
                      <div className="absolute -left-6 -bottom-6 w-20 h-20 rounded-full bg-amber-400/10 pointer-events-none"></div>
                      
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-white text-emerald-800 flex items-center justify-center font-black shadow-xs">
                          <Building2 className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-black text-sm tracking-tight text-white leading-tight">
                            আনন্দ পাঠশালা কিন্ডারগার্টেন
                          </h4>
                          <span className="text-[9px] text-amber-300 block font-medium">
                            কোর্টপাড়া, কুষ্টিয়া-৭০০০ · স্থাপিত ২০২৩
                          </span>
                        </div>
                      </div>

                      <div className="inline-block bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-2xs mt-1">
                        স্টুডেন্ট আইডি কার্ড · ২০২৬
                      </div>
                    </div>

                    {/* Card Body with Photo & Core Info */}
                    <div className="p-4 flex-1 flex flex-col items-center justify-between text-center">
                      {/* Avatar / Photo */}
                      <div className="relative mt-1">
                        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center font-black text-3xl shadow-md border-3 border-emerald-600 ${currentStudent.avatarColor}`}>
                          {toBengaliNumber(currentStudent.rollNo)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-800 text-white text-[10px] font-black px-2 py-0.5 rounded-lg border border-white shadow-xs">
                          রোল: {toBengaliNumber(currentStudent.rollNo)}
                        </div>
                      </div>

                      {/* Name & Class Badges */}
                      <div className="space-y-1 mt-2">
                        <h3 className="text-lg font-black text-slate-900 leading-tight">
                          {currentStudent.nameBn}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          {currentStudent.nameEn}
                        </p>
                        
                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-xl text-xs font-black">
                          <span>শ্রেণি: {getSchoolClassNameBn(currentStudent.className)}</span>
                          <span className="text-emerald-400">|</span>
                          <span>শাখা: {currentStudent.section}</span>
                        </div>
                      </div>

                      {/* Details Table */}
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-left text-xs space-y-1.5 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-semibold">অভিভাবক:</span>
                          <span className="font-bold text-slate-800 truncate max-w-[170px]">
                            {guardianDisplayName} ({guardianRelation})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-emerald-600" />
                            যোগাযোগ ফোন:
                          </span>
                          <span className="font-mono font-black text-emerald-800">
                            {currentStudent.emergencyPhone}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-semibold">রক্তের গ্রুপ:</span>
                          <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            {currentStudent.bloodGroup || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Hologram & Security Mark */}
                      <div className="w-full flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1 text-emerald-700 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>ভেরিফায়েড শিক্ষার্থী</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-600">ID: {currentStudent.rollNo}-{currentStudent.className.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Stripe */}
                    <div className="bg-emerald-800 text-white text-[9px] py-1 text-center font-medium">
                      আনন্দময় শৈশব · আলোকিত ভবিষ্যৎ
                    </div>
                  </div>
                )}

                {/* ---------------- BACK SIDE (QR Code & Pickup Verification) ---------------- */}
                {(cardSideView === 'both' || cardSideView === 'back') && (
                  <div className="student-id-card-back print-avoid-break break-inside-avoid w-[320px] sm:w-[340px] h-[520px] rounded-3xl bg-white shadow-xl border-2 border-teal-700/30 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-2 print:border-slate-800">
                    {/* Lanyard Hole Visual */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-2.5 rounded-full bg-slate-200 border border-slate-300 print:hidden z-20"></div>

                    {/* Top Security Banner */}
                    <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 text-white p-3 pt-5 text-center shrink-0 border-b-2 border-amber-400">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>ডিজিটাল গেট-পাস ও পিকআপ কিউআর কোড</span>
                      </div>
                      <span className="text-[9.5px] text-teal-200 block mt-0.5">
                        ছুটির সময় গেটে প্রদর্শন করুন
                      </span>
                    </div>

                    {/* Main Back Content */}
                    <div className="p-4 flex-1 flex flex-col items-center justify-between text-center">
                      {/* Crisp Dynamic QR Code */}
                      <div className="p-2 bg-white rounded-2xl border-2 border-emerald-600 shadow-sm flex flex-col items-center">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt="Pickup QR Code"
                            className="w-36 h-36 object-contain"
                          />
                        ) : (
                          <div className="w-36 h-36 flex items-center justify-center bg-slate-100 text-slate-400">
                            কিউআর তৈরি হচ্ছে...
                          </div>
                        )}
                        <span className="font-mono text-[9.5px] font-bold text-emerald-900 mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          PASS: AP-GATE-{currentStudent.className.toUpperCase()}-{currentStudent.rollNo}
                        </span>
                      </div>

                      {/* Instructions */}
                      <div className="w-full bg-amber-50/80 border border-amber-200 rounded-xl p-2 text-left text-[10px] text-amber-950 space-y-1">
                        <div className="flex items-start gap-1 font-bold text-amber-900">
                          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                          <span>অভিভাবকদের জন্য জরুরি নির্দেশনা:</span>
                        </div>
                        <p className="leading-tight text-slate-700">
                          ১. ছুটির সময় গেটে এই কিউআর কোডটি স্ক্যান করে শিক্ষার্থীকে গ্রহণ করুন।
                        </p>
                        <p className="leading-tight text-slate-700">
                          ২. কার্ডটি হারিয়ে গেলে তাৎক্ষণিক প্রধান শিক্ষককে জানান।
                        </p>
                      </div>

                      {/* Authorized Pickup List */}
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-left text-[10.5px] space-y-1">
                        <span className="text-[9.5px] font-bold text-slate-400 block">অনুমোদিত পিকআপ পারসন:</span>
                        <div className="font-bold text-slate-800 flex items-center justify-between">
                          <span>{guardianDisplayName}</span>
                          <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            {guardianRelation} · অনুমোদিত
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-600">
                          ফোন: {currentStudent.emergencyPhone}
                        </div>
                      </div>

                      {/* Official Signature Seal */}
                      <div className="w-full flex items-end justify-between pt-2 border-t border-slate-200 text-[9.5px]">
                        <div className="text-left">
                          <span className="text-slate-400 block">ঠিকানা:</span>
                          <span className="text-slate-600 font-medium">কোর্টপাড়া, কুষ্টিয়া</span>
                          <span className="text-slate-500 font-mono block">০১৯১৪-০৫৭৫১১</span>
                        </div>

                        <div className="text-center">
                          <div className="w-20 border-b border-dashed border-slate-400 pb-1 mb-0.5">
                            <span className="font-serif italic text-emerald-900 font-bold text-xs tracking-tight">
                              Habibur R.
                            </span>
                          </div>
                          <span className="text-slate-500 font-bold block text-[8.5px]">
                            অধ্যক্ষ / অনুমোদিত সিল
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Disclaimer */}
                    <div className="bg-slate-800 text-slate-300 text-[8.5px] py-1 text-center font-medium">
                      এই কার্ডটি আনন্দ পাঠশালার সম্পত্তি · পাওয়া গেলে ফেরত দেওয়ার অনুরোধ
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Action Tools & Inspector (Hidden on print) */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3 print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      পিকআপ কিউআর ডাটা ও সিকিউরিটি অ্যাকশন:
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <button
                      type="button"
                      onClick={() => setIsSimulatingScan(!isSimulatingScan)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        isSimulatingScan
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isSimulatingScan ? 'স্ক্যান টেস্ট বন্ধ করুন' : 'গেট স্ক্যান টেস্ট করুন'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyQrData}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedQrText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>কিউআর টেক্সট কপি</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition cursor-pointer flex items-center gap-1.5 border border-emerald-200"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>কিউআর ছবি ডাউনলোড</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Gate Scan Result Box */}
                {isSimulatingScan && (
                  <div className="p-3.5 bg-emerald-50/90 border border-emerald-300 rounded-xl space-y-2 text-xs animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-black text-emerald-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>গেট সিকিউরিটি স্ক্যানার সিমুলেশন (Verifying QR Code...)</span>
                      </div>
                      <span className="bg-emerald-200 text-emerald-900 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                        STATUS: AUTHORIZED
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                      <div className="bg-white p-2 rounded-lg border border-emerald-200">
                        <span className="text-slate-400 block text-[10px]">শিক্ষার্থী:</span>
                        <strong className="text-slate-800">{currentStudent.nameBn}</strong> (রোল {toBengaliNumber(currentStudent.rollNo)})
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-200">
                        <span className="text-slate-400 block text-[10px]">শ্রেণি ও শাখা:</span>
                        <strong className="text-slate-800">{getSchoolClassNameBn(currentStudent.className)}</strong> ({currentStudent.section})
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-200">
                        <span className="text-slate-400 block text-[10px]">অনুমোদিত অভিভাবক ও ফোন:</span>
                        <strong className="text-emerald-800">{guardianDisplayName}</strong> · {currentStudent.emergencyPhone}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ===================================================================== */
            /* BATCH PRINT SHEET (Entire Class Cards)                                */
            /* ===================================================================== */
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>{selectedClassFilter === 'all' ? 'সকল শ্রেণির' : getSchoolClassNameBn(selectedClassFilter)}</strong> শিক্ষার্থীদের আইডি কার্ড ব্যাচ প্রিন্ট শিট ({filteredStudents.length} জন শিক্ষার্থী)। উপরে "প্রিন্ট করুন" বাটনে ক্লিক করলে স্ট্যান্ডার্ড A4 সাইজে কার্ডগুলো সুন্দরভাবে প্রিন্ট হবে।
                  </span>
                </div>
              </div>

              {/* Grid of Student Cards for Print Sheet */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 print:w-full">
                {filteredStudents.map((std) => {
                  const stdQr = batchQrMap[std.id];
                  const stdPickup = std.authorizedPickups?.find((p) => p.isPrimary) || std.authorizedPickups?.[0];
                  const stdGuardianName = stdPickup?.nameBn || std.fatherNameBn || std.motherNameBn || 'অভিভাবক';

                  return (
                    <div
                      key={std.id}
                      className="print-avoid-break break-inside-avoid bg-white rounded-3xl border-2 border-slate-300 p-4 space-y-3 shadow-md print:shadow-none print:border-2 print:border-slate-800 flex flex-col justify-between"
                      style={{ minHeight: '440px' }}
                    >
                      {/* Header */}
                      <div className="bg-emerald-800 text-white p-2.5 rounded-2xl text-center border-b-2 border-amber-400">
                        <h4 className="font-black text-xs">আনন্দ পাঠশালা কিন্ডারগার্টেন</h4>
                        <span className="text-[9px] text-amber-300 font-medium block">
                          স্টুডেন্ট আইডি ও পিকআপ গেট-পাস · ২০২৬
                        </span>
                      </div>

                      {/* Content Row: Photo & Details */}
                      <div className="flex items-start gap-3 pt-1">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-black text-xl shrink-0 border-2 border-emerald-600 ${std.avatarColor}`}>
                          {toBengaliNumber(std.rollNo)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-sm text-slate-900 leading-tight truncate">
                            {std.nameBn}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-semibold block truncate">
                            {std.nameEn}
                          </span>
                          <div className="inline-block mt-1 bg-emerald-50 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-300">
                            {getSchoolClassNameBn(std.className)} · শাখা {std.section}
                          </div>
                        </div>
                      </div>

                      {/* Middle Row: QR Code & Guardian info */}
                      <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                        <div className="shrink-0 bg-white p-1 rounded-xl border border-emerald-500">
                          {stdQr ? (
                            <img src={stdQr} alt="QR" className="w-20 h-20 object-contain" />
                          ) : (
                            <div className="w-20 h-20 flex items-center justify-center bg-slate-100 text-[9px] text-slate-400">
                              QR...
                            </div>
                          )}
                        </div>

                        <div className="text-[10.5px] space-y-1 min-w-0">
                          <div>
                            <span className="text-slate-400 block text-[9px]">রোল নম্বর:</span>
                            <span className="font-bold text-slate-800 font-mono">{toBengaliNumber(std.rollNo)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">অভিভাবকের ফোন:</span>
                            <span className="font-bold font-mono text-emerald-800 truncate block">
                              {std.emergencyPhone}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">পিতা / অভিভাবক:</span>
                            <span className="font-semibold text-slate-700 truncate block">
                              {stdGuardianName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
                        <span>কোর্টপাড়া, কুষ্টিয়া</span>
                        <span className="font-mono font-bold text-emerald-800">
                          AP-GATE-{std.className.toUpperCase()}-{std.rollNo}
                        </span>
                        <span>অধ্যক্ষ স্বাক্ষর</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
