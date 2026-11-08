import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  UserRole,
  PortalAccount,
  StaffInternalMessage,
  StaffRoomType,
  StaffActionType,
  SchoolClass,
  FcmNotification,
} from '../types/school';
import {
  getStoredStaffMessages,
  saveStaffInternalMessage,
  acceptStaffSubstituteRequest,
  STAFF_CHANNELS,
  getDirectRoomId,
  STAFF_CHAT_STORAGE_EVENT,
  StaffChannelMeta,
} from '../utils/staffChatLogic';
import { SCHOOL_TEACHERS } from '../data/mockData';
import { ALL_SCHOOL_CLASSES, getSchoolClassNameBn, toBengaliNumber } from '../utils/schoolLogic';
import {
  MessageSquare,
  Send,
  Users,
  Building2,
  Smile,
  Palette,
  Pin,
  Clock,
  CalendarCheck,
  AlertCircle,
  Package,
  CheckCircle2,
  CheckCheck,
  Check,
  Phone,
  Search,
  ChevronLeft,
  X,
  Sparkles,
  PlusCircle,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';

interface StaffRoomChatModuleProps {
  currentRole: UserRole;
  loggedInAccount: PortalAccount | null;
  onSendNotification?: (notif: FcmNotification) => void;
}

export const StaffRoomChatModule: React.FC<StaffRoomChatModuleProps> = ({
  currentRole,
  loggedInAccount,
  onSendNotification,
}) => {
  // Current logged in teacher identity
  const currentTeacher = useMemo(() => {
    if (loggedInAccount?.nameBn) {
      const match = SCHOOL_TEACHERS.find(
        (t) =>
          t.nameBn.includes(loggedInAccount.nameBn) ||
          loggedInAccount.nameBn.includes(t.nameBn) ||
          t.username === loggedInAccount.username
      );
      if (match) return match;
    }
    return SCHOOL_TEACHERS[1] || SCHOOL_TEACHERS[0]; // Default: Fatema Akter or Shafee Abdullah
  }, [loggedInAccount]);

  // Selected room state
  const [selectedRoomType, setSelectedRoomType] = useState<StaffRoomType>('channel');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all_staff');
  const [selectedColleagueId, setSelectedColleagueId] = useState<string>('tch-1'); // Default direct chat with Principal
  const [showMobileChatView, setShowMobileChatView] = useState<boolean>(true);

  // Search colleague
  const [colleagueSearchQuery, setColleagueSearchQuery] = useState('');

  // Messages list state
  const [messages, setMessages] = useState<StaffInternalMessage[]>(() =>
    getStoredStaffMessages()
  );

  useEffect(() => {
    const handleSync = () => {
      setMessages(getStoredStaffMessages());
    };
    window.addEventListener(STAFF_CHAT_STORAGE_EVENT, handleSync);
    return () => window.removeEventListener(STAFF_CHAT_STORAGE_EVENT, handleSync);
  }, []);

  // Compute active Room ID and Title
  const activeRoomMeta = useMemo(() => {
    if (selectedRoomType === 'channel') {
      const chan = STAFF_CHANNELS.find((c) => c.id === selectedChannelId) || STAFF_CHANNELS[0];
      return {
        roomId: chan.id,
        roomNameBn: chan.titleBn,
        subtitleBn: chan.subtitleBn,
        memberCount: chan.memberCount,
        isDirect: false,
      };
    } else {
      const colleague =
        SCHOOL_TEACHERS.find((t) => t.id === selectedColleagueId) || SCHOOL_TEACHERS[0];
      return {
        roomId: getDirectRoomId(currentTeacher.id, colleague.id),
        roomNameBn: colleague.nameBn,
        subtitleBn: `${colleague.designationBn} · ফোন: ${colleague.phone}`,
        memberCount: 2,
        isDirect: true,
        colleague,
      };
    }
  }, [selectedRoomType, selectedChannelId, selectedColleagueId, currentTeacher]);

  // Messages for active room
  const activeRoomMessages = useMemo(() => {
    return messages
      .filter((m) => m.roomId === activeRoomMeta.roomId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [messages, activeRoomMeta.roomId]);

  // Pinned message in this room
  const pinnedMessage = useMemo(() => {
    return [...activeRoomMessages].reverse().find((m) => m.isPinned);
  }, [activeRoomMessages]);

  // Text inputs & modal states
  const [inputText, setInputText] = useState('');
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  // Modal: Substitute Request
  const [showSubModal, setShowSubModal] = useState(false);
  const [subPeriod, setSubPeriod] = useState('২য় পিরিয়ড (সকাল ০৯:৪০ - ১০:২০)');
  const [subClass, setSubClass] = useState<SchoolClass>('Nursery');
  const [subSubject, setSubSubject] = useState('বাংলা ভাষা ও বর্ণমালা');
  const [subReason, setSubReason] = useState('জরুরি ক্লাসরুম মিটিং / শারীরিক অসুস্থতা');

  // Modal: Emergency Meeting Briefing
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [briefingTime, setBriefingTime] = useState('আজ দুপুর ০১:১৫ (টিফিন বিরতিতে)');
  const [briefingTopic, setBriefingTopic] = useState('আগামীকালের শিশু শিক্ষা কার্নিভালের প্রস্তুতি ও শৃঙ্খলা সভা');

  // Modal: Requisition
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [requisitionItemsText, setRequisitionItemsText] = useState(
    'রঙিন ড্রয়িং আর্ট পেপার (৫০টি)\nশিশু-বান্ধব নন-টক্সিক গ্লু স্টিক (১০টি)\nবক্স রঙ পেন্সিল (৫টি)'
  );

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Scroll to bottom
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
  }, [activeRoomMeta.roomId]);

  useEffect(() => {
    scrollToBottom(true);
  }, [activeRoomMessages.length]);

  // Send regular message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend) return;

    const now = new Date();
    const timeFormatted = `${now.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
    })}, ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

    const saved = saveStaffInternalMessage({
      roomId: activeRoomMeta.roomId,
      roomType: selectedRoomType,
      roomNameBn: activeRoomMeta.roomNameBn,
      senderId: currentTeacher.id,
      senderNameBn: currentTeacher.nameBn,
      senderRoleTitleBn: currentTeacher.designationBn,
      senderAvatarUrl: currentTeacher.photoUrl,
      receiverId: activeRoomMeta.isDirect ? selectedColleagueId : undefined,
      receiverNameBn: activeRoomMeta.isDirect ? activeRoomMeta.roomNameBn : undefined,
      text: textToSend,
      actionType: 'chat',
      timestamp: timeFormatted,
    });

    setMessages((prev) => [...prev, saved]);
    setInputText('');
    setTimeout(() => scrollToBottom(true), 50);

    // Dispatch FCM Notification for colleagues
    if (onSendNotification) {
      onSendNotification({
        id: `notif-staff-${Date.now()}`,
        type: 'staff_internal_message',
        priority: 'high',
        titleBn: `📢 শিক্ষক রুম: ${currentTeacher.nameBn}-এর নতুন বার্তা`,
        bodyBn: `${activeRoomMeta.roomNameBn}: ${textToSend.slice(0, 75)}`,
        targetRole: 'all_staff',
        studentOrApplicantNameBn: currentTeacher.nameBn,
        className: 'Nursery',
        guardianNameBn: currentTeacher.nameBn,
        timestamp: timeFormatted,
        read: false,
        actionTab: 'messages',
        fcmMessageId: `fcm-staff-${Date.now()}`,
      });
    }
  };

  // Submit Substitute Request
  const handleSubmitSubstitute = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeFormatted = `${now.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
    })}, ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

    const text = `🔄 জরুরি প্রক্সি অনুরোধ: আমার ${getSchoolClassNameBn(subClass)} শ্রেণির "${subPeriod}" এ ${subSubject} ক্লাসটি নেওয়ার জন্য একজন সহকর্মীর সহযোগিতা প্রয়োজন। কারণ: ${subReason}।`;

    const saved = saveStaffInternalMessage({
      roomId: activeRoomMeta.roomId,
      roomType: selectedRoomType,
      roomNameBn: activeRoomMeta.roomNameBn,
      senderId: currentTeacher.id,
      senderNameBn: currentTeacher.nameBn,
      senderRoleTitleBn: currentTeacher.designationBn,
      senderAvatarUrl: currentTeacher.photoUrl,
      text,
      actionType: 'substitute_request',
      actionDetails: {
        substitute: {
          id: `sub-${Date.now()}`,
          requesterTeacherId: currentTeacher.id,
          requesterNameBn: currentTeacher.nameBn,
          className: subClass,
          periodLabelBn: subPeriod,
          subjectBn: subSubject,
          dateStr: 'আজ, ০৮ নভেম্বর',
          reasonBn: subReason,
          status: 'pending',
          timestamp: timeFormatted,
        },
      },
      timestamp: timeFormatted,
    });

    setMessages((prev) => [...prev, saved]);
    setShowSubModal(false);
    setToastBanner('✓ আপনার প্রক্সি ক্লাসের অনুরোধ শিক্ষক চ্যাটরুমে পোস্ট করা হয়েছে!');
    setTimeout(() => setToastBanner(null), 5000);
  };

  // Accept Substitute Request
  const handleAcceptSubstitute = (msgId: string) => {
    const success = acceptStaffSubstituteRequest(
      msgId,
      currentTeacher.id,
      currentTeacher.nameBn
    );
    if (success) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.actionDetails?.substitute
            ? {
                ...m,
                actionDetails: {
                  ...m.actionDetails,
                  substitute: {
                    ...m.actionDetails.substitute,
                    status: 'accepted',
                    acceptedByTeacherId: currentTeacher.id,
                    acceptedByTeacherNameBn: currentTeacher.nameBn,
                  },
                },
              }
            : m
        )
      );

      // Post automatic confirmation in chat
      saveStaffInternalMessage({
        roomId: activeRoomMeta.roomId,
        roomType: selectedRoomType,
        roomNameBn: activeRoomMeta.roomNameBn,
        senderId: currentTeacher.id,
        senderNameBn: currentTeacher.nameBn,
        senderRoleTitleBn: currentTeacher.designationBn,
        senderAvatarUrl: currentTeacher.photoUrl,
        text: `✅ আমি এই প্রক্সি ক্লাসটি নেওয়ার দায়িত্ব গ্রহণ করলাম। সম্মানিত সহকর্মী নিশ্চিত থাকুন।`,
        actionType: 'chat',
        timestamp: 'এখনই',
      });

      setToastBanner(`✓ আপনি সফলভাবে প্রক্সি ক্লাসের দায়িত্ব গ্রহণ করেছেন!`);
      setTimeout(() => setToastBanner(null), 4000);
    }
  };

  // Submit Briefing / Meeting Notice
  const handleSubmitBriefing = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeFormatted = `${now.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
    })}, ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

    const text = `📢 জরুরি শিক্ষক ও স্টাফ ব্রিফিং নোটিশ: সময়: ${briefingTime}। বিষয়: ${briefingTopic}। সকল শিক্ষক ও সংশ্লিষ্ট স্টাফদের যথাসময়ে উপস্থিত থাকার অনুরোধ করা হচ্ছে।`;

    const saved = saveStaffInternalMessage({
      roomId: activeRoomMeta.roomId,
      roomType: selectedRoomType,
      roomNameBn: activeRoomMeta.roomNameBn,
      senderId: currentTeacher.id,
      senderNameBn: currentTeacher.nameBn,
      senderRoleTitleBn: currentTeacher.designationBn,
      senderAvatarUrl: currentTeacher.photoUrl,
      text,
      actionType: 'emergency_briefing',
      actionDetails: {
        meetingTime: briefingTime,
        meetingTopic: briefingTopic,
      },
      timestamp: timeFormatted,
      isPinned: true,
    });

    setMessages((prev) => [...prev, saved]);
    setShowBriefingModal(false);
    setToastBanner('✓ জরুরি স্টাফ মিটিং নোটিশ পিন করা হয়েছে!');
    setTimeout(() => setToastBanner(null), 5000);
  };

  // Submit Material Requisition
  const handleSubmitRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    const items = requisitionItemsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length === 0) return;

    const now = new Date();
    const timeFormatted = `${now.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
    })}, ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

    const text = `📦 ক্লাসরুম ও মন্টেসরি সামগ্রী রিকুইজিশন নোট (${items.length}টি আইটেম)`;

    const saved = saveStaffInternalMessage({
      roomId: activeRoomMeta.roomId,
      roomType: selectedRoomType,
      roomNameBn: activeRoomMeta.roomNameBn,
      senderId: currentTeacher.id,
      senderNameBn: currentTeacher.nameBn,
      senderRoleTitleBn: currentTeacher.designationBn,
      senderAvatarUrl: currentTeacher.photoUrl,
      text,
      actionType: 'resource_requisition',
      actionDetails: {
        requisitionItems: items,
      },
      timestamp: timeFormatted,
    });

    setMessages((prev) => [...prev, saved]);
    setShowRequisitionModal(false);
    setToastBanner('✓ শিক্ষা সামগ্রী রিকুইজিশন সফলভাবে পোস্ট করা হয়েছে!');
    setTimeout(() => setToastBanner(null), 4000);
  };

  // Filtered colleagues for Direct Messaging list
  const filteredColleagues = useMemo(() => {
    return SCHOOL_TEACHERS.filter((t) => {
      if (t.id === currentTeacher.id) return false;
      if (!colleagueSearchQuery.trim()) return true;
      const q = colleagueSearchQuery.toLowerCase().trim();
      return (
        t.nameBn.toLowerCase().includes(q) ||
        t.nameEn.toLowerCase().includes(q) ||
        t.designationBn.toLowerCase().includes(q) ||
        (t.phone && t.phone.includes(q))
      );
    });
  }, [currentTeacher.id, colleagueSearchQuery]);

  return (
    <div className="space-y-3">
      {/* Toast Alert */}
      {toastBanner && (
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-3 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in border border-emerald-400/30">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCheck className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{toastBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastBanner(null)}
            className="text-xs text-white/80 hover:text-white cursor-pointer px-2 py-1 rounded-lg bg-white/10"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Staff Room Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-175px)] min-h-[520px] max-h-[820px] relative">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Channels & 1-on-1 Colleague Directory                        */}
        {/* ========================================================================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/80 shrink-0 h-full overflow-hidden ${
            showMobileChatView ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Top Identity Header */}
          <div className="p-3.5 border-b border-slate-200/80 bg-white space-y-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold shadow-2xs">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    শিক্ষক ও স্টাফ কমিউনিকেশন
                  </h3>
                  <span className="text-[10px] text-slate-500 block">
                    লগইনকৃত: <strong>{currentTeacher.nameBn}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Room Type Segmenter: Channels vs Direct Messages */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedRoomType('channel')}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedRoomType === 'channel'
                    ? 'bg-white text-indigo-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>গ্রুপ রুম ({STAFF_CHANNELS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoomType('direct')}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedRoomType === 'direct'
                    ? 'bg-white text-indigo-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>১-অন-১ চ্যাট ({filteredColleagues.length})</span>
              </button>
            </div>
          </div>

          {/* Directory Feed */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100">
            {selectedRoomType === 'channel' ? (
              // Departmental Channels List
              STAFF_CHANNELS.map((chan) => {
                const isSelected = selectedChannelId === chan.id;
                const lastMsg = messages
                  .filter((m) => m.roomId === chan.id)
                  .slice(-1)[0];

                return (
                  <button
                    key={chan.id}
                    type="button"
                    onClick={() => {
                      setSelectedChannelId(chan.id);
                      setShowMobileChatView(true);
                    }}
                    className={`w-full p-3 rounded-2xl text-left transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border border-indigo-200/90 shadow-2xs'
                        : 'bg-white hover:bg-slate-100/80 border border-slate-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${chan.badgeBg} ${chan.textColor}`}
                    >
                      #
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">
                          {chan.titleBn}
                        </h4>
                        <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                          {chan.memberCount} সদস্য
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                        {lastMsg ? `${lastMsg.senderNameBn}: ${lastMsg.text}` : chan.subtitleBn}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              // 1-on-1 Direct Colleague List
              <>
                <div className="p-1 pb-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={colleagueSearchQuery}
                      onChange={(e) => setColleagueSearchQuery(e.target.value)}
                      placeholder="শিক্ষকের নাম বা পদবি দিয়ে খুঁজুন..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                {filteredColleagues.map((colleague) => {
                  const isSelected = selectedColleagueId === colleague.id;
                  const dirRoomId = getDirectRoomId(currentTeacher.id, colleague.id);
                  const lastMsg = messages
                    .filter((m) => m.roomId === dirRoomId)
                    .slice(-1)[0];

                  return (
                    <button
                      key={colleague.id}
                      type="button"
                      onClick={() => {
                        setSelectedColleagueId(colleague.id);
                        setShowMobileChatView(true);
                      }}
                      className={`w-full p-2.5 rounded-2xl text-left transition flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50 border border-teal-300 shadow-2xs'
                          : 'bg-white hover:bg-slate-100/80 border border-slate-100'
                      }`}
                    >
                      <img
                        src={colleague.photoUrl}
                        alt={colleague.nameBn}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {colleague.nameBn}
                          </h4>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {colleague.designationBn}
                        </p>
                        <p className="text-[10.5px] text-teal-800 font-medium truncate mt-0.5">
                          {lastMsg ? lastMsg.text : 'সরাসরি ব্যক্তিগত বার্তা শুরু করুন'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Active Chat Feed & Staff Action Controls                     */}
        {/* ========================================================================= */}
        <div
          className={`flex-1 flex flex-col bg-slate-100/60 h-full overflow-hidden min-h-0 ${
            !showMobileChatView ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Top Room Header Bar */}
          <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-2.5 shadow-2xs shrink-0 z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Back button on mobile */}
              <button
                type="button"
                onClick={() => setShowMobileChatView(false)}
                className="md:hidden p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer shrink-0"
                title="রুম ও শিক্ষক তালিকা"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                {activeRoomMeta.isDirect ? '💬' : '#'}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-extrabold text-slate-900 truncate">
                    {activeRoomMeta.roomNameBn}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {activeRoomMeta.isDirect ? '১-অন-১ ব্যক্তিগত চ্যাট' : 'অফিসিয়াল ফোরাম'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {activeRoomMeta.subtitleBn}
                </p>
              </div>
            </div>

            {/* Quick Actions Menu Bar */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Substitute Class Action */}
              <button
                type="button"
                onClick={() => setShowSubModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition flex items-center gap-1 border border-amber-300 shadow-2xs cursor-pointer"
                title="প্রক্সি বা সাবস্টিটিউট ক্লাসের অনুরোধ পাঠান"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">প্রক্সি অনুরোধ</span>
              </button>

              {/* Emergency Meeting / Briefing Action */}
              <button
                type="button"
                onClick={() => setShowBriefingModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition flex items-center gap-1 border border-indigo-300 shadow-2xs cursor-pointer"
                title="জরুরি ব্রিফিং বা নোটিশ পিন করুন"
              >
                <AlertCircle className="w-3.5 h-3.5 text-indigo-700" />
                <span className="hidden sm:inline">মিটিং নোটিশ</span>
              </button>

              {/* Material Requisition Action */}
              <button
                type="button"
                onClick={() => setShowRequisitionModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition flex items-center gap-1 border border-purple-300 shadow-2xs cursor-pointer"
                title="শিক্ষা ও মন্টেসরি সামগ্রী রিকুইজিশন"
              >
                <Package className="w-3.5 h-3.5 text-purple-700" />
                <span className="hidden sm:inline">রিকুইজিশন</span>
              </button>
            </div>
          </div>

          {/* Pinned Announcement Bar if any */}
          {pinnedMessage && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-xs text-amber-900 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Pin className="w-4 h-4 text-amber-600 shrink-0 rotate-45" />
                <div className="truncate">
                  <strong>পিনকৃত নোটিশ:</strong> {pinnedMessage.text}
                </div>
              </div>
              <span className="text-[10px] text-amber-700 font-mono shrink-0">
                {pinnedMessage.timestamp}
              </span>
            </div>
          )}

          {/* Messages Feed Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto pt-4 pb-6 px-3 sm:px-6 space-y-4 min-h-0"
          >
            {activeRoomMessages.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <Building2 className="w-10 h-10 text-slate-300 stroke-1" />
                <p className="text-xs font-bold text-slate-600">
                  এই রুমে এখনো কোনো আলোচনা হয়নি
                </p>
                <p className="text-[11px] max-w-xs">
                  সহকর্মীদের সাথে কথা বলতে বা ক্লাসরুমের প্রয়োজনীয় ব্যবস্থা নিতে নিচে লিখুন।
                </p>
              </div>
            ) : (
              activeRoomMessages.map((msg) => {
                const isOutgoing = msg.senderId === currentTeacher.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    {/* Sender Identity */}
                    <div
                      className={`flex items-center gap-1.5 px-1 text-[10.5px] text-slate-500 font-semibold ${
                        isOutgoing ? 'justify-end mr-1' : 'justify-start ml-1'
                      }`}
                    >
                      <span className="font-bold text-slate-800">{msg.senderNameBn}</span>
                      <span className="text-[10px] text-slate-400">({msg.senderRoleTitleBn})</span>
                      <span>·</span>
                      <span className="font-mono text-[10px]">{msg.timestamp}</span>
                    </div>

                    {/* Regular Message or Action Card */}
                    {msg.actionType === 'substitute_request' && msg.actionDetails?.substitute ? (
                      // =======================================================
                      // ACTION CARD: SUBSTITUTE REQUEST
                      // =======================================================
                      <div className="max-w-[92%] sm:max-w-[80%] rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-sm space-y-2.5">
                        <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
                          <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                            <CalendarCheck className="w-4 h-4 text-amber-700" />
                            জরুরি প্রক্সি / সাবস্টিটিউট ক্লাসের অনুরোধ
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              msg.actionDetails.substitute.status === 'accepted'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-500 text-white animate-pulse'
                            }`}
                          >
                            {msg.actionDetails.substitute.status === 'accepted'
                              ? '✓ প্রক্সি নিশ্চিত'
                              : 'অপেক্ষমান'}
                          </span>
                        </div>

                        <div className="text-xs text-amber-950 space-y-1">
                          <p>
                            <strong>শ্রেণি:</strong> {getSchoolClassNameBn(msg.actionDetails.substitute.className)} ·{' '}
                            <strong>সময়:</strong> {msg.actionDetails.substitute.periodLabelBn}
                          </p>
                          <p>
                            <strong>পাঠের বিষয়:</strong> {msg.actionDetails.substitute.subjectBn}
                          </p>
                          <p className="text-amber-800 text-[11px]">
                            <strong>কারণ:</strong> {msg.actionDetails.substitute.reasonBn}
                          </p>
                        </div>

                        {/* Action status / Accept Button */}
                        <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between gap-2">
                          {msg.actionDetails.substitute.status === 'accepted' ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-100/80 px-3 py-1.5 rounded-xl w-full">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>
                                প্রক্সি গ্রহণ করেছেন:{' '}
                                <strong>{msg.actionDetails.substitute.acceptedByTeacherNameBn}</strong>
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAcceptSubstitute(msg.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer w-full justify-center"
                            >
                              <Check className="w-4 h-4" />
                              <span>আমি এই প্রক্সি ক্লাসটি নেব (গ্রহণ করুন)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : msg.actionType === 'emergency_briefing' ? (
                      // =======================================================
                      // ACTION CARD: EMERGENCY MEETING / BRIEFING
                      // =======================================================
                      <div className="max-w-[92%] sm:max-w-[80%] rounded-2xl p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-300 shadow-sm space-y-2">
                        <div className="flex items-center justify-between gap-2 border-b border-indigo-200/80 pb-1.5">
                          <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-indigo-700" />
                            📢 জরুরি শিক্ষক ও স্টাফ মিটিং নোটিশ
                          </span>
                          <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            অফিসিয়াল
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-indigo-950 font-medium whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      </div>
                    ) : msg.actionType === 'resource_requisition' && msg.actionDetails?.requisitionItems ? (
                      // =======================================================
                      // ACTION CARD: REQUISITION ITEMS
                      // =======================================================
                      <div className="max-w-[92%] sm:max-w-[80%] rounded-2xl p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-sm space-y-2">
                        <div className="flex items-center justify-between gap-2 border-b border-purple-200/80 pb-1.5">
                          <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-purple-700" />
                            মন্টেসরি ও শিক্ষা সামগ্রী রিকুইজিশন
                          </span>
                          <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                            স্টোর রিকুইজিশন
                          </span>
                        </div>
                        <ul className="text-xs text-purple-950 space-y-1 list-disc list-inside">
                          {msg.actionDetails.requisitionItems.map((item, idx) => (
                            <li key={idx} className="font-medium">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      // =======================================================
                      // REGULAR MESSAGE BUBBLE
                      // =======================================================
                      <div
                        className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-1.5 break-words [word-break:break-word] overflow-hidden ${
                          isOutgoing
                            ? 'bg-gradient-to-br from-indigo-700 to-indigo-800 text-white rounded-tr-xs ml-auto mr-1'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs mr-auto ml-1'
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Message Input Bar */}
          <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 space-y-2 shrink-0">
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
                  placeholder={`${activeRoomMeta.roomNameBn}-এ বার্তা বা মতামত লিখুন...`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs shrink-0 min-h-[42px] ${
                  inputText.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
                title="বার্তা পাঠান"
              >
                <Send className="w-4 h-4" />
                <span>পাঠান</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REQUEST SUBSTITUTE CLASS (প্রক্সি ক্লাসের অনুরোধ)               */}
      {/* ========================================================================= */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-amber-300 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-5 h-5 text-amber-200" />
                <div>
                  <h3 className="text-base font-bold">প্রক্সি / সাবস্টিটিউট ক্লাসের অনুরোধ</h3>
                  <p className="text-xs text-amber-100">সহকর্মীদের কাছে ক্লাসের দায়িত্ব ভাগ করে নিন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubModal(false)}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSubstitute} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">শ্রেণি নির্বাচন করুন:</label>
                <select
                  value={subClass}
                  onChange={(e) => setSubClass(e.target.value as SchoolClass)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {ALL_SCHOOL_CLASSES.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.nameBn} শ্রেণি
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">পিরিয়ড ও সময়:</label>
                <select
                  value={subPeriod}
                  onChange={(e) => setSubPeriod(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="১ম পিরিয়ড (সকাল ০৯:০০ - ০৯:৪০)">১ম পিরিয়ড (সকাল ০৯:০০ - ০৯:৪০)</option>
                  <option value="২য় পিরিয়ড (সকাল ০৯:৪০ - ১০:২০)">২য় পিরিয়ড (সকাল ০৯:৪০ - ১০:২০)</option>
                  <option value="৩য় পিরিয়ড (সকাল ১০:৫০ - ১১:৩০)">৩য় পিরিয়ড (সকাল ১০:৫০ - ১১:৩০)</option>
                  <option value="৪র্থ পিরিয়ড (সকাল ১১:৩০ - ১২:১০)">৪র্থ পিরিয়ড (সকাল ১১:৩০ - ১২:১০)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">পাঠদানের বিষয়:</label>
                <input
                  type="text"
                  value={subSubject}
                  onChange={(e) => setSubSubject(e.target.value)}
                  placeholder="যেমন: বাংলা ভাষা ও বর্ণমালা"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">অনুরোধের কারণ:</label>
                <input
                  type="text"
                  value={subReason}
                  onChange={(e) => setSubReason(e.target.value)}
                  placeholder="যেমন: জরুরি অভিভাবক কাউন্সিলিং / অসুস্থতা"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  অনুরোধ পোস্ট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EMERGENCY BRIEFING / MEETING NOTICE                              */}
      {/* ========================================================================= */}
      {showBriefingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-indigo-300 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-700 to-blue-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-indigo-200" />
                <div>
                  <h3 className="text-base font-bold">জরুরি শিক্ষক ও স্টাফ মিটিং ব্রিফিং</h3>
                  <p className="text-xs text-indigo-100">সকল সহকর্মীকে মিটিংয়ের বিজ্ঞপ্তি পাঠান</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBriefingModal(false)}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBriefing} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">মিটিংয়ের সময়সূচি:</label>
                <input
                  type="text"
                  value={briefingTime}
                  onChange={(e) => setBriefingTime(e.target.value)}
                  placeholder="যেমন: আজ দুপুর ০১:১৫ (টিফিন বিরতিতে)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">আলোচ্য বিষয় / সারসংক্ষেপ:</label>
                <textarea
                  value={briefingTopic}
                  onChange={(e) => setBriefingTopic(e.target.value)}
                  rows={3}
                  placeholder="মিটিংয়ের মূল আলোচ্য বিষয়বস্তু লিখুন..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBriefingModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  মিটিং নোটিশ জারি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RESOURCE REQUISITION                                            */}
      {/* ========================================================================= */}
      {showRequisitionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-pink-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-purple-200" />
                <div>
                  <h3 className="text-base font-bold">মন্টেসরি ও শিক্ষা সামগ্রী রিকুইজিশন</h3>
                  <p className="text-xs text-purple-100">প্রয়োজনীয় উপকরণের তালিকা পোস্ট করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRequisitionModal(false)}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequisition} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">প্রয়োজনীয় উপকরণের তালিকা (প্রতি লাইনে একটি):</label>
                <textarea
                  value={requisitionItemsText}
                  onChange={(e) => setRequisitionItemsText(e.target.value)}
                  rows={4}
                  placeholder="আইটেম ১&#10;আইটেম ২&#10;আইটেম ৩"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequisitionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  রিকুইজিশন পাঠান
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
