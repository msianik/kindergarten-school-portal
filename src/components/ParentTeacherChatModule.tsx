import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Student,
  UserRole,
  PortalAccount,
  SchoolClass,
  ParentTeacherMessage,
  MessageCategory,
  FcmNotification,
} from '../types/school';
import {
  getStoredDirectChatMessages,
  saveDirectChatMessage,
  markStudentMessagesAsRead,
  createDirectMessageFcmPayload,
  MESSAGE_CATEGORIES_META,
  DIRECT_CHAT_STORAGE_EVENT,
} from '../utils/directChatLogic';
import {
  ALL_SCHOOL_CLASSES,
  isSameSchoolClass,
  getSchoolClassNameBn,
  toBengaliNumber,
} from '../utils/schoolLogic';
import { SCHOOL_TEACHERS } from '../data/mockData';
import { StaffRoomChatModule } from './StaffRoomChatModule';
import {
  MessageSquare,
  Building2,
  Send,
  Smile,
  Heart,
  BookOpen,
  Clock,
  ShieldAlert,
  Search,
  CheckCheck,
  Check,
  Phone,
  Paperclip,
  Image as ImageIcon,
  Users,
  ChevronLeft,
  X,
  MessageCircle,
  Bell,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ParentTeacherChatModuleProps {
  students: Student[];
  currentRole: UserRole;
  loggedInAccount: PortalAccount | null;
  onSendChatNotification?: (notif: FcmNotification) => void;
  initialSelectedStudentId?: string;
  onNavigateTab?: (tab: string) => void;
  initialChatMode?: 'parent_chat' | 'staff_room';
}

export const ParentTeacherChatModule: React.FC<ParentTeacherChatModuleProps> = ({
  students,
  currentRole,
  loggedInAccount,
  onSendChatNotification,
  initialSelectedStudentId,
  onNavigateTab,
  initialChatMode,
}) => {
  const isParent = currentRole === 'parent';
  const isTeacher = currentRole === 'teacher';
  const isAdmin = currentRole === 'principal' || currentRole === 'super_admin' || currentRole === 'director';

  const [activeChatSection, setActiveChatSection] = useState<'parent_chat' | 'staff_room'>(() => {
    if (currentRole === 'parent') return 'parent_chat';
    if (currentRole === 'director' || currentRole === 'super_admin' || currentRole === 'accountant' || currentRole === 'gate_security') {
      return 'staff_room';
    }
    return initialChatMode || 'parent_chat';
  });

  useEffect(() => {
    if (isParent) {
      setActiveChatSection('parent_chat');
    }
  }, [isParent]);

  // Identify default student for logged-in parent
  const parentDefaultChild = useMemo(() => {
    if (loggedInAccount?.studentId) {
      const match = students.find((s) => s.id === loggedInAccount.studentId);
      if (match) return match;
    }
    return students.find((s) => s.id === 'std-1') || students[0];
  }, [students, loggedInAccount]);

  // Selected student state for chat
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (initialSelectedStudentId) return initialSelectedStudentId;
    if (isParent) return parentDefaultChild.id;
    return students[0]?.id || 'std-1';
  });

  // Messages state
  const [messages, setMessages] = useState<ParentTeacherMessage[]>(() =>
    getStoredDirectChatMessages()
  );

  // Sync with storage events
  useEffect(() => {
    const handleSync = () => {
      setMessages(getStoredDirectChatMessages());
    };
    window.addEventListener(DIRECT_CHAT_STORAGE_EVENT, handleSync);
    return () => window.removeEventListener(DIRECT_CHAT_STORAGE_EVENT, handleSync);
  }, []);

  // Class filter for teachers/admins
  const [filterClass, setFilterClass] = useState<SchoolClass | 'all'>(() => {
    if (isTeacher && loggedInAccount?.assignedClass) {
      return loggedInAccount.assignedClass;
    }
    return 'all';
  });

  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>('general');
  const [inputText, setInputText] = useState('');
  const [attachedPhotoUrl, setAttachedPhotoUrl] = useState<string | null>(null);
  const [toastBanner, setToastBanner] = useState<string | null>(null);
  const [activePhotoLightbox, setActivePhotoLightbox] = useState<string | null>(null);
  const [showChildDetailsDrawer, setShowChildDetailsDrawer] = useState<boolean>(false);

  // For teachers on mobile: show chat view by default if a student is selected
  const [showMobileChatView, setShowMobileChatView] = useState<boolean>(true);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Active student object
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || parentDefaultChild;
  }, [students, selectedStudentId, parentDefaultChild]);

  // Find class teacher for active student
  const activeTeacher = useMemo(() => {
    const matched = SCHOOL_TEACHERS.find(
      (t) => t.assignedClass && isSameSchoolClass(t.assignedClass, activeStudent.className)
    );
    return matched || SCHOOL_TEACHERS[1] || SCHOOL_TEACHERS[0];
  }, [activeStudent]);

  // Filter students for the left directory list (teacher view)
  const filteredStudentsList = useMemo(() => {
    if (isParent) {
      return [parentDefaultChild];
    }

    return students.filter((std) => {
      const matchClass =
        filterClass === 'all' || isSameSchoolClass(std.className, filterClass);
      if (!matchClass) return false;

      if (!studentSearchQuery.trim()) return true;
      const q = studentSearchQuery.toLowerCase().trim();
      return (
        std.nameBn.toLowerCase().includes(q) ||
        std.nameEn.toLowerCase().includes(q) ||
        std.rollNo.includes(q) ||
        (std.fatherNameBn && std.fatherNameBn.toLowerCase().includes(q)) ||
        (std.emergencyPhone && std.emergencyPhone.includes(q))
      );
    });
  }, [students, filterClass, studentSearchQuery, isParent, parentDefaultChild]);

  // Messages for active student
  const activeChatMessages = useMemo(() => {
    return messages
      .filter((m) => m.studentId === activeStudent.id)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [messages, activeStudent]);

  // Mark messages as read when opening student chat
  useEffect(() => {
    if (activeStudent?.id) {
      const readerRole = isParent ? 'parent' : isTeacher ? 'teacher' : 'principal';
      markStudentMessagesAsRead(activeStudent.id, readerRole);
    }
  }, [activeStudent?.id, isParent, isTeacher, messages.length]);

  // Inner container scrolling only (NEVER scrolls page window)
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [selectedStudentId]);

  useEffect(() => {
    scrollToBottom(true);
  }, [activeChatMessages.length]);

  // Send message handler
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend && !attachedPhotoUrl) return;

    const now = new Date();
    const timeFormatted = `${now.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}, ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

    let senderName = 'অভিভাবক';
    let senderRole: 'parent' | 'teacher' | 'principal' = 'parent';
    let receiverName = `${activeTeacher.nameBn} (শ্রেণি শিক্ষক)`;
    let receiverRole: 'parent' | 'teacher' | 'principal' = 'teacher';

    if (isParent) {
      senderName = loggedInAccount?.nameBn
        ? `${loggedInAccount.nameBn} (${activeStudent.fatherNameBn ? 'পিতা' : 'অভিভাবক'})`
        : `${activeStudent.fatherNameBn || 'সুব্রত রায়'} (পিতা)`;
      senderRole = 'parent';
      receiverName = `${activeTeacher.nameBn} (শ্রেণি শিক্ষক)`;
      receiverRole = 'teacher';
    } else if (isTeacher) {
      senderName = loggedInAccount?.nameBn
        ? `${loggedInAccount.nameBn} (শ্রেণি শিক্ষক)`
        : `${activeTeacher.nameBn} (শ্রেণি শিক্ষক)`;
      senderRole = 'teacher';
      receiverName = `${activeStudent.fatherNameBn || activeStudent.nameBn + '-এর অভিভাবক'}`;
      receiverRole = 'parent';
    } else {
      senderName = loggedInAccount?.nameBn || 'শাফী আব্দুল্লাহ (প্রিন্সিপাল)';
      senderRole = 'principal';
      receiverName = `${activeStudent.fatherNameBn || activeStudent.nameBn + '-এর অভিভাবক'}`;
      receiverRole = 'parent';
    }

    const categoryMeta = MESSAGE_CATEGORIES_META[selectedCategory];

    const saved = saveDirectChatMessage({
      studentId: activeStudent.id,
      studentNameBn: activeStudent.nameBn,
      className: activeStudent.className,
      senderRole,
      senderNameBn: senderName,
      senderAvatarUrl: isParent ? undefined : activeTeacher.photoUrl,
      receiverRole,
      receiverNameBn: receiverName,
      text: textToSend,
      category: selectedCategory,
      categoryLabelBn: categoryMeta.labelBn,
      photoUrl: attachedPhotoUrl || undefined,
      timestamp: timeFormatted,
      isRead: false,
    });

    // Directly update local state immediately so UI updates without lag
    setMessages((prev) => [...prev, saved]);

    // Dispatch FCM Notification
    if (onSendChatNotification) {
      const targetRole = isParent ? 'teacher' : 'parent';
      const fcmPayload = createDirectMessageFcmPayload(saved, targetRole);
      onSendChatNotification(fcmPayload);
    }

    // Reset inputs
    setInputText('');
    setAttachedPhotoUrl(null);
    setSelectedCategory('general');

    // Scroll to bottom
    setTimeout(() => scrollToBottom(true), 50);

    // Show banner
    const targetLabel = isParent
      ? `${activeTeacher.nameBn} (শ্রেণি শিক্ষক)`
      : `${activeStudent.nameBn}-এর অভিভাবক`;
    setToastBanner(`✓ ${targetLabel}-এর কাছে বার্তা সফলভাবে পৌঁছে দেওয়া হয়েছে!`);
    setTimeout(() => setToastBanner(null), 4000);
  };

  // Handle image upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      {/* Toast Alert Banner */}
      {toastBanner && (
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-3 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in border border-emerald-400/30">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCheck className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{toastBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastBanner(null)}
            className="text-xs text-white/80 hover:text-white cursor-pointer px-2 py-1 rounded-lg bg-white/10 shrink-0"
          >
            ✕ বন্ধ
          </button>
        </div>
      )}

      {/* Role Navigation Switcher for Teachers & Staff */}
      {!isParent && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs transition-colors shrink-0 ${
                activeChatSection === 'staff_room'
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white'
                  : 'bg-gradient-to-br from-teal-600 to-emerald-700 text-white'
              }`}
            >
              {activeChatSection === 'staff_room' ? (
                <Building2 className="w-5 h-5" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                  {activeChatSection === 'staff_room'
                    ? 'স্কুল চ্যাট রুম ও ফোরাম (পরিচালক ও স্টাফ)'
                    : 'শিক্ষার্থী ও অভিভাবক সরাসরি বার্তা আদান-প্রদান'}
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {activeChatSection === 'staff_room' ? 'পরিচালক ও স্টাফ হাব' : 'অভিভাবক সংযোগ'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {activeChatSection === 'staff_room'
                  ? 'পরিচালনা পর্ষদ ফোরাম, সর্বজনীন স্টাফ লাউঞ্জ, উইং গ্রুপ ও ১-অন-১ চ্যাট'
                  : 'শ্রেণির প্রতিটি শিক্ষার্থীর অভিভাবকের সাথে সরাসরি ওয়ান-অন-ওয়ান চ্যাট'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl self-stretch sm:self-auto border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveChatSection('parent_chat')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeChatSection === 'parent_chat'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>অভিভাবক চ্যাট</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveChatSection('staff_room')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeChatSection === 'staff_room'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>স্কুল চ্যাট রুম</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white">
                পরিচালক ও স্টাফ
              </span>
            </button>
          </div>
        </div>
      )}

      {/* RENDER VIEW BASED ON ACTIVE SECTION */}
      {!isParent && activeChatSection === 'staff_room' ? (
        <StaffRoomChatModule
          currentRole={currentRole}
          loggedInAccount={loggedInAccount}
          onSendNotification={onSendChatNotification}
        />
      ) : (
        <>
          {/* Main Responsive Chat Container (Fits dynamically in viewport, no page scroll) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-175px)] min-h-[520px] max-h-[820px] relative">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Student Directory (Visible for Teachers/Admins on Desktop)   */}
        {/* ========================================================================= */}
        {!isParent && (
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/70 shrink-0 h-full overflow-hidden ${
              showMobileChatView ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Header & Filter */}
            <div className="p-3.5 border-b border-slate-200/80 bg-white space-y-2.5 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                      শিক্ষার্থী ও অভিভাবক বার্তা
                    </h3>
                    <span className="text-[10px] text-slate-500">
                      মোট {toBengaliNumber(filteredStudentsList.length)} টি কথোপকথন
                    </span>
                  </div>
                </div>
              </div>

              {/* Class filter */}
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setFilterClass('all')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    filterClass === 'all'
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  সকল শ্রেণি
                </button>
                {ALL_SCHOOL_CLASSES.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setFilterClass(cls.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      filterClass === cls.id
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cls.nameBn}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="শিক্ষার্থীর নাম, রোল বা ফোন..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-teal-500"
                />
              </div>
            </div>

            {/* Students List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
              {filteredStudentsList.map((std) => {
                const isSelected = std.id === selectedStudentId;
                const studentMsgs = messages.filter((m) => m.studentId === std.id);
                const lastMsg = studentMsgs[studentMsgs.length - 1];
                const unreadCount = studentMsgs.filter(
                  (m) => m.senderRole === 'parent' && !m.isRead
                ).length;

                return (
                  <button
                    key={std.id}
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(std.id);
                      setShowMobileChatView(true);
                    }}
                    className={`w-full p-2.5 rounded-2xl text-left transition flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border border-teal-300 shadow-2xs'
                        : 'bg-white hover:bg-slate-100/80 border border-slate-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${std.avatarColor}`}
                    >
                      {std.rollNo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {std.nameBn}
                        </h4>
                        <span className="text-[9.5px] text-slate-400 shrink-0 font-medium">
                          {getSchoolClassNameBn(std.className)}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                        {lastMsg ? lastMsg.text : 'কোনো বার্তা আদান-প্রদান হয়নি'}
                      </p>
                      <div className="flex items-center justify-between gap-1 mt-1 text-[9.5px] text-slate-400">
                        <span>পিতা: {std.fatherNameBn || '—'}</span>
                        {unreadCount > 0 && (
                          <span className="bg-rose-600 text-white font-black px-1.5 py-0.2 rounded-full text-[9px] animate-pulse">
                            {unreadCount} নতুন
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Active Chat Thread Window (Full-Width for Parent)           */}
        {/* ========================================================================= */}
        <div
          className={`flex-1 flex flex-col bg-slate-100/60 h-full overflow-hidden min-h-0 ${
            !showMobileChatView && !isParent ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Chat Header Bar */}
          <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-2.5 shadow-2xs shrink-0 z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Back button on mobile for teachers */}
              {!isParent && (
                <button
                  type="button"
                  onClick={() => setShowMobileChatView(false)}
                  className="md:hidden p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer shrink-0"
                  title="শিক্ষার্থী তালিকা দেখুন"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${activeStudent.avatarColor}`}
              >
                {activeStudent.rollNo}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-extrabold text-slate-900 truncate">
                    {activeStudent.nameBn}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    {getSchoolClassNameBn(activeStudent.className)} শ্রেণি
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {isParent
                    ? `শ্রেণি শিক্ষক: ${activeTeacher.nameBn} (${activeTeacher.designationBn})`
                    : `অভিভাবক: ${activeStudent.fatherNameBn || 'সুব্রত রায়'} · ${activeStudent.emergencyPhone}`}
                </p>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isParent && (
                <button
                  type="button"
                  onClick={() => setShowChildDetailsDrawer(!showChildDetailsDrawer)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1 border border-slate-200 cursor-pointer"
                  title="সন্তানের বিবরণ দেখুন"
                >
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">বিবরণ</span>
                </button>
              )}

              <a
                href={`tel:${isParent ? activeTeacher.phone : activeStudent.emergencyPhone}`}
                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1.5 border border-teal-200 shadow-2xs cursor-pointer"
                title="সরাসরি ফোন কল করুন"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">সরাসরি কল</span>
              </a>
            </div>
          </div>

          {/* Collapsible Child Info Card for Parents */}
          {isParent && showChildDetailsDrawer && (
            <div className="bg-teal-50/90 border-b border-teal-200 p-3 text-xs text-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in shrink-0">
              <div>
                <span className="text-[10px] text-slate-500 block">রোল নম্বর:</span>
                <span className="font-bold text-slate-900">{activeStudent.rollNo}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">ব্লাড গ্রুপ:</span>
                <span className="font-bold text-slate-900">{activeStudent.bloodGroup || 'A+'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">শিক্ষকের ফোন:</span>
                <a href={`tel:${activeTeacher.phone}`} className="font-mono font-bold text-teal-800">
                  {activeTeacher.phone}
                </a>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">জরুরি হেল্পলাইন:</span>
                <span className="font-mono font-bold text-slate-800">০১৯১৪-০৫৭৫১২</span>
              </div>
            </div>
          )}

          {/* Messages Feed Area (Scrolls independently, with top/bottom breathing space) */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto pt-4 pb-6 px-3 sm:px-6 space-y-4 min-h-0"
          >
            {/* Conversation Start Banner */}
            <div className="text-center pt-1 pb-2">
              <span className="px-3.5 py-1 bg-white border border-slate-200 text-slate-600 text-[10.5px] rounded-full shadow-2xs font-medium inline-block">
                🔒 আনন্দ পাঠশালা এন্ড-টু-এন্ড সুরক্ষিত প্যারেন্ট-টিচার যোগাযোগ
              </span>
            </div>

            {activeChatMessages.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 stroke-1" />
                <p className="text-xs font-bold text-slate-600">
                  এখনো কোনো বার্তা বিনিময় হয়নি
                </p>
                <p className="text-[11px] max-w-xs">
                  নিচের প্রস্তুতকৃত টেমপ্লেট থেকে সিলেক্ট করে অথবা সরাসরি লিখে চ্যাট শুরু করুন।
                </p>
              </div>
            ) : (
              activeChatMessages.map((msg) => {
                const isMsgFromParent = msg.senderRole === 'parent';
                // Alignment: If logged in as parent, parent messages are on the right (outgoing).
                // If logged in as teacher/admin, teacher messages are on the right (outgoing).
                const isOutgoing = isParent ? isMsgFromParent : !isMsgFromParent;
                const catMeta = MESSAGE_CATEGORIES_META[msg.category] || MESSAGE_CATEGORIES_META.general;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    {/* Sender Label */}
                    <div
                      className={`flex items-center gap-1.5 px-1 text-[10.5px] text-slate-500 font-semibold ${
                        isOutgoing ? 'justify-end mr-1' : 'justify-start ml-1'
                      }`}
                    >
                      <span>{msg.senderNameBn}</span>
                      <span>·</span>
                      <span className="font-mono text-[10px]">{msg.timestamp}</span>
                    </div>

                    {/* Message Bubble Card */}
                    <div
                      className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-1.5 break-words [word-break:break-word] overflow-hidden ${
                        isOutgoing
                          ? 'bg-gradient-to-br from-teal-700 to-teal-800 text-white rounded-tr-xs ml-auto mr-1'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs mr-auto ml-1'
                      }`}
                    >
                      {/* Category Tag */}
                      {msg.category && msg.category !== 'general' && (
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[9.5px] font-black px-2 py-0.5 rounded-md border ${
                              isOutgoing
                                ? 'bg-white/20 text-teal-100 border-white/20'
                                : `${catMeta.badgeBg} ${catMeta.textColor} ${catMeta.borderColor}`
                            }`}
                          >
                            🏷️ {catMeta.labelBn}
                          </span>
                        </div>
                      )}

                      {/* Text */}
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words [word-break:break-word]">
                        {msg.text}
                      </p>

                      {/* Attached Photo */}
                      {msg.photoUrl && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setActivePhotoLightbox(msg.photoUrl || null)}
                            className="cursor-pointer group relative overflow-hidden rounded-xl border border-white/20 block"
                          >
                            <img
                              src={msg.photoUrl}
                              alt="চ্যাট ছবি"
                              className="w-48 sm:w-64 h-32 sm:h-44 object-cover transition group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition flex items-center justify-center">
                              <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                                🔍 বড় করে দেখুন
                              </span>
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Read status indicator */}
                      <div className="flex items-center justify-end gap-1 pt-0.5">
                        <span
                          className={`text-[9.5px] ${
                            isOutgoing ? 'text-teal-200 font-medium' : 'text-slate-400'
                          }`}
                        >
                          {msg.isRead ? (
                            <span className="inline-flex items-center gap-0.5">
                              <CheckCheck className="w-3 h-3 text-emerald-300" />
                              দেখা হয়েছে
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5">
                              <Check className="w-3 h-3 opacity-70" />
                              পাঠানো হয়েছে
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input & Action Toolbar (Fixed at bottom of chat card) */}
          <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 space-y-2 shrink-0">
            {/* Category selection chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              <span className="text-[10px] text-slate-400 font-bold mr-1 shrink-0">ক্যাটাগরি:</span>
              {(Object.keys(MESSAGE_CATEGORIES_META) as MessageCategory[]).map((catKey) => {
                const meta = MESSAGE_CATEGORIES_META[catKey];
                const isActive = selectedCategory === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategory(catKey)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : `${meta.badgeBg} ${meta.textColor} hover:opacity-80`
                    }`}
                  >
                    {meta.labelBn}
                  </button>
                );
              })}
            </div>

            {/* Photo Attachment Preview if selected */}
            {attachedPhotoUrl && (
              <div className="relative inline-block border border-teal-300 rounded-xl overflow-hidden shadow-2xs">
                <img src={attachedPhotoUrl} alt="সংযুক্ত ছবি" className="h-16 w-20 object-cover" />
                <button
                  type="button"
                  onClick={() => setAttachedPhotoUrl(null)}
                  className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-xs cursor-pointer hover:bg-rose-700"
                  title="ছবি মুছুন"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  placeholder={
                    isParent
                      ? `${activeTeacher.nameBn} আপাকে সরাসরি মেসেজ লিখুন...`
                      : `${activeStudent.nameBn}-এর অভিভাবককে বার্তা পাঠান...`
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none leading-relaxed"
                />
              </div>

              {/* Photo Upload Attachment Button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200 shadow-2xs shrink-0"
                  title="ছবি বা প্রেসক্রিপশন নোট সংযুক্ত করুন"
                >
                  <ImageIcon className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() && !attachedPhotoUrl}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs shrink-0 min-h-[42px] ${
                  inputText.trim() || attachedPhotoUrl
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
                title="মেসেজ পাঠান"
              >
                <Send className="w-4 h-4" />
                <span>পাঠান</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lightbox for full size photo preview */}
      {activePhotoLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActivePhotoLightbox(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={activePhotoLightbox}
              alt="বড় ছবি"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            <button
              onClick={() => setActivePhotoLightbox(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-900 font-bold flex items-center justify-center shadow-lg hover:bg-slate-200 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
