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
  QUICK_PARENT_TEMPLATES,
  QUICK_TEACHER_TEMPLATES,
  DIRECT_CHAT_STORAGE_EVENT,
} from '../utils/directChatLogic';
import {
  ALL_SCHOOL_CLASSES,
  isSameSchoolClass,
  getSchoolClassNameBn,
  toBengaliNumber,
} from '../utils/schoolLogic';
import { SCHOOL_TEACHERS } from '../data/mockData';
import {
  MessageSquare,
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
  Sparkles,
  Users,
  ChevronLeft,
  X,
  MessageCircle,
  Bell,
  ArrowRight,
} from 'lucide-react';

interface ParentTeacherChatModuleProps {
  students: Student[];
  currentRole: UserRole;
  loggedInAccount: PortalAccount | null;
  onSendChatNotification?: (notif: FcmNotification) => void;
  initialSelectedStudentId?: string;
  onNavigateTab?: (tab: string) => void;
}

export const ParentTeacherChatModule: React.FC<ParentTeacherChatModuleProps> = ({
  students,
  currentRole,
  loggedInAccount,
  onSendChatNotification,
  initialSelectedStudentId,
  onNavigateTab,
}) => {
  const isParent = currentRole === 'parent';
  const isTeacher = currentRole === 'teacher';
  const isAdmin = currentRole === 'principal' || currentRole === 'super_admin' || currentRole === 'director';

  // Identify default student
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
  const [showMobileChatView, setShowMobileChatView] = useState<boolean>(!isParent);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Filter students for the left list
  const filteredStudentsList = useMemo(() => {
    if (isParent) {
      // Parents only see their own child
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

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatMessages.length, selectedStudentId]);

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

    // Show banner
    const targetLabel = isParent
      ? `${activeTeacher.nameBn} (শ্রেণি শিক্ষক)`
      : `${activeStudent.nameBn}-এর অভিভাবক`;
    setToastBanner(`✓ ${targetLabel}-এর কাছে বার্তা সফলভাবে পৌঁছে দেওয়া হয়েছে!`);
    setTimeout(() => setToastBanner(null), 4000);
  };

  // Quick template selection
  const handleApplyTemplate = (tplText: string, tplCategory: MessageCategory) => {
    setInputText(tplText);
    setSelectedCategory(tplCategory);
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
    <div className="space-y-4">
      {/* Toast Alert Banner */}
      {toastBanner && (
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in border border-emerald-400/30">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCheck className="w-5 h-5 text-emerald-300" />
            <span>{toastBanner}</span>
          </div>
          <button
            onClick={() => setToastBanner(null)}
            className="text-xs text-white/80 hover:text-white cursor-pointer px-2 py-1 rounded-lg bg-white/10"
          >
            ✕ বন্ধ
          </button>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[680px] max-h-[800px]">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Student / Class Directory & Conversation Selector           */}
        {/* ========================================================================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/70 shrink-0 ${
            showMobileChatView ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200/80 bg-white">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    {isParent ? 'শ্রেণি শিক্ষক ও অভিভাবক চ্যাট' : 'শিক্ষার্থী ও অভিভাবক বার্তা'}
                  </h3>
                  <span className="text-[10.5px] text-slate-500">
                    {isParent ? 'নিরাপদ সরাসরি যোগাযোগ' : `মোট ${filteredStudentsList.length} টি কথোপকথন`}
                  </span>
                </div>
              </div>
            </div>

            {/* Class filter for teachers/admins */}
            {!isParent && (
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setFilterClass('all')}
                    className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
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
                      className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
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
            )}
          </div>

          {/* Student Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {isParent ? (
              // Parent Child Card
              <div className="p-3 bg-white rounded-2xl border border-teal-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs shrink-0 ${parentDefaultChild.avatarColor}`}
                  >
                    {parentDefaultChild.rollNo}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {parentDefaultChild.nameBn}
                    </h4>
                    <span className="text-xs text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 inline-block mt-0.5">
                      {getSchoolClassNameBn(parentDefaultChild.className)} শ্রেণি · রোল {toBengaliNumber(parentDefaultChild.rollNo)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold">শ্রেণি শিক্ষক:</span>
                    <span className="font-bold text-slate-900">{activeTeacher.nameBn}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold">পদবি:</span>
                    <span className="text-slate-700">{activeTeacher.designationBn}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold">জরুরি ফোন:</span>
                    <a
                      href={`tel:${activeTeacher.phone}`}
                      className="text-teal-700 font-mono font-bold hover:underline"
                    >
                      {activeTeacher.phone}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              // Teacher/Admin Student List
              filteredStudentsList.map((std) => {
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
                    className={`w-full p-3 rounded-2xl text-left transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border border-teal-300 shadow-2xs'
                        : 'bg-white hover:bg-slate-100/80 border border-slate-100'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${std.avatarColor}`}
                    >
                      {std.rollNo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {std.nameBn}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {getSchoolClassNameBn(std.className)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {lastMsg ? lastMsg.text : 'কোনো বার্তা আদান-প্রদান হয়নি'}
                      </p>
                      <div className="flex items-center justify-between gap-1 mt-1 text-[10px] text-slate-400">
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
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Active Chat Thread Window                                  */}
        {/* ========================================================================= */}
        <div
          className={`flex-1 flex flex-col bg-slate-100/50 min-h-0 ${
            !showMobileChatView ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Chat Header Bar */}
          <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Back button on mobile for teachers */}
              {!isParent && (
                <button
                  type="button"
                  onClick={() => setShowMobileChatView(false)}
                  className="md:hidden p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                  title="তালিকা দেখুন"
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
                    ? `শ্রেণি শিক্ষক: ${activeTeacher.nameBn} (${activeTeacher.phone})`
                    : `অভিভাবক: ${activeStudent.fatherNameBn || 'সুব্রত রায়'} · ${activeStudent.emergencyPhone}`}
                </p>
              </div>
            </div>

            {/* Quick action button: Call */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`tel:${isParent ? activeTeacher.phone : activeStudent.emergencyPhone}`}
                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1.5 border border-teal-200 shadow-2xs"
                title="সরাসরি ফোন কল করুন"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">সরাসরি কল</span>
              </a>
            </div>
          </div>

          {/* Messages Feed Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Conversation Start Banner */}
            <div className="text-center my-2">
              <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10.5px] rounded-full shadow-2xs font-medium">
                🔒 আনন্দ পাঠশালা এন্ড-টু-এন্ড সুরক্ষিত প্যারেন্ট-টিচার যোগাযোগ
              </span>
            </div>

            {activeChatMessages.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
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
                // Alignment: If logged in as parent, parent messages are on the right.
                // If logged in as teacher/admin, teacher messages are on the right.
                const isOutgoing = isParent ? isMsgFromParent : !isMsgFromParent;
                const catMeta = MESSAGE_CATEGORIES_META[msg.category] || MESSAGE_CATEGORIES_META.general;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    {/* Sender Label */}
                    <div className="flex items-center gap-1.5 px-1 text-[10.5px] text-slate-500 font-semibold">
                      <span>{msg.senderNameBn}</span>
                      <span>·</span>
                      <span className="font-mono text-[10px]">{msg.timestamp}</span>
                    </div>

                    {/* Message Bubble Card */}
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-xs space-y-2 ${
                        isOutgoing
                          ? 'bg-gradient-to-br from-teal-700 to-teal-800 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
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
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
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
                              className="w-48 sm:w-60 h-32 sm:h-40 object-cover transition group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition flex items-center justify-center">
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
                            isOutgoing ? 'text-teal-200' : 'text-slate-400'
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
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips Strip */}
          <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200/80 overflow-x-auto flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              রেডিমেড টেমপ্লেট:
            </span>
            {(isParent ? QUICK_PARENT_TEMPLATES : QUICK_TEACHER_TEMPLATES).map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(tpl.text, tpl.category)}
                className="px-2.5 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 rounded-lg text-[10.5px] font-medium whitespace-nowrap transition cursor-pointer shrink-0 shadow-2xs"
              >
                {tpl.text.slice(0, 32)}...
              </button>
            ))}
          </div>

          {/* Message Input & Category Toolbar */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            {/* Category selection chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
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
                <img src={attachedPhotoUrl} alt="সংযুক্ত ছবি" className="h-20 w-24 object-cover" />
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

            {/* Input & Action Buttons */}
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
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
                      ? `${activeTeacher.nameBn} আপাকে সরাসরি মেসেজ লিখুন... (Enter চাপলে পাঠানো হবে)`
                      : `${activeStudent.nameBn}-এর অভিভাবককে বার্তা পাঠান... (Enter চাপলে পাঠানো হবে)`
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
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
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200 shadow-2xs"
                  title="ছবি বা নোট সংযুক্ত করুন"
                >
                  <ImageIcon className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() && !attachedPhotoUrl}
                className={`p-2.5 sm:px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                  inputText.trim() || attachedPhotoUrl
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">পাঠান</span>
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
    </div>
  );
};
