import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  UserRole,
  PortalAccount,
  StaffInternalMessage,
  StaffRoomType,
  StaffActionType,
  SchoolClass,
  FcmNotification,
  StaffChannelMeta,
  StaffChatMember,
} from '../types/school';
import {
  getStoredStaffMessages,
  saveStaffInternalMessage,
  deleteStaffInternalMessage,
  togglePinStaffMessage,
  toggleStaffMessageReaction,
  acceptStaffSubstituteRequest,
  getStoredStaffChannels,
  createStaffChannel,
  updateStaffChannel,
  deleteStaffChannel,
  resetStaffChannelsToDefault,
  getAllStaffChatMembers,
  getStaffMemberIdentity,
  canUserAccessChannel,
  canUserEditChat,
  getDirectRoomId,
  DEFAULT_STAFF_CHANNELS,
  STAFF_CHAT_STORAGE_EVENT,
  STAFF_CHANNELS_STORAGE_EVENT,
} from '../utils/staffChatLogic';
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
  Edit3,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Settings,
  Lock,
  Unlock,
  MoreVertical,
  Copy,
  CornerUpLeft,
  Paperclip,
  Image as ImageIcon,
  SmilePlus,
  Eye,
  Crown,
  Heart,
  ThumbsUp,
  Share2,
} from 'lucide-react';

interface StaffRoomChatModuleProps {
  currentRole: UserRole;
  loggedInAccount: PortalAccount | null;
  onSendNotification?: (notif: FcmNotification) => void;
}

const COLOR_PRESETS = [
  { key: 'amber', label: 'সোনালী / অ্যাম্বার (পরিচালক)', badgeBg: 'bg-amber-100', textColor: 'text-amber-900', dot: 'bg-amber-500' },
  { key: 'emerald', label: 'সবুজ (ইমারাল্ড)', badgeBg: 'bg-emerald-100', textColor: 'text-emerald-800', dot: 'bg-emerald-500' },
  { key: 'indigo', label: 'নীল (ইন্ডিগো)', badgeBg: 'bg-indigo-100', textColor: 'text-indigo-800', dot: 'bg-indigo-500' },
  { key: 'purple', label: 'বেগুনি (পার্পল)', badgeBg: 'bg-purple-100', textColor: 'text-purple-800', dot: 'bg-purple-500' },
  { key: 'rose', label: 'গোলাপি/লাল (রোজ)', badgeBg: 'bg-rose-100', textColor: 'text-rose-800', dot: 'bg-rose-500' },
  { key: 'cyan', label: 'আকাশি (সায়ান)', badgeBg: 'bg-cyan-100', textColor: 'text-cyan-800', dot: 'bg-cyan-500' },
];

const ICON_OPTIONS = [
  { id: 'ShieldAlert', label: 'পরিচালনা পর্ষদ' },
  { id: 'Building2', label: 'কমনরুম' },
  { id: 'Smile', label: 'প্রি-স্কুল' },
  { id: 'Palette', label: 'আর্ট/ল্যাব' },
  { id: 'Users', label: 'টিম পরিষদ' },
  { id: 'Sparkles', label: 'ইভেন্ট' },
  { id: 'Briefcase', label: 'অফিসিয়াল' },
  { id: 'MessageSquare', label: 'ফোরাম' },
];

const QUICK_EMOJIS = ['👍', '❤️', '👏', '🎉', '💡', '🔥', '🙏', '😊', '✅', '✨'];

const renderChannelIcon = (iconType: string, className = 'w-4 h-4') => {
  switch (iconType) {
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Building2':
      return <Building2 className={className} />;
    case 'Smile':
      return <Smile className={className} />;
    case 'Palette':
      return <Palette className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'MessageSquare':
      return <MessageSquare className={className} />;
    default:
      return <span className="font-bold text-xs">#</span>;
  }
};

export const StaffRoomChatModule: React.FC<StaffRoomChatModuleProps> = ({
  currentRole,
  loggedInAccount,
  onSendNotification,
}) => {
  // Current logged in user accurately resolved as a StaffChatMember
  const currentUser: StaffChatMember = useMemo(
    () => getStaffMemberIdentity(currentRole, loggedInAccount),
    [currentRole, loggedInAccount]
  );

  // Edit Permission: Strictly restricted to Principal or Admin!
  // Satisfies user request: "এবং এডিট করার ক্ষমতা শুধুমাত্র প্রিন্সিপাল অথবা এডমিনকে দেওয়ার জন্য অনুরোধ করছি।"
  const canEdit = useMemo(
    () => canUserEditChat(currentRole, loggedInAccount),
    [currentRole, loggedInAccount]
  );

  // Unified roster of all staff & directors
  const allStaffMembers = useMemo(() => getAllStaffChatMembers(), []);

  // Dynamic Channels State
  const [channels, setChannels] = useState<StaffChannelMeta[]>(() =>
    getStoredStaffChannels()
  );

  useEffect(() => {
    const handleChannelSync = () => {
      setChannels(getStoredStaffChannels());
    };
    window.addEventListener(STAFF_CHANNELS_STORAGE_EVENT, handleChannelSync);
    return () => window.removeEventListener(STAFF_CHANNELS_STORAGE_EVENT, handleChannelSync);
  }, []);

  // Filter channels accessible to the current user!
  // Restricts rooms like directors_board strictly within the directors & principal group
  const accessibleChannels = useMemo(() => {
    return channels.filter((ch) => canUserAccessChannel(ch, currentRole, currentUser.id));
  }, [channels, currentRole, currentUser.id]);

  // Selected room state: channel vs 1-on-1 direct
  const [selectedRoomType, setSelectedRoomType] = useState<StaffRoomType>('channel');
  const [selectedChannelId, setSelectedChannelId] = useState<string>(() => {
    // If director, default to directors_board if accessible, otherwise all_staff
    if (currentRole === 'director' || currentRole === 'super_admin') {
      return 'directors_board';
    }
    return 'all_staff';
  });

  // Default direct chat recipient: Principal or Head Teacher
  const [selectedColleagueId, setSelectedColleagueId] = useState<string>(() => {
    if (currentUser.id === 'tch-1') return 'tch-2';
    return 'tch-1';
  });

  const [showMobileChatView, setShowMobileChatView] = useState<boolean>(true);

  // Guard: if current selected channel is not accessible, fall back to first accessible channel
  useEffect(() => {
    if (selectedRoomType === 'channel') {
      const isStillAccessible = accessibleChannels.some((c) => c.id === selectedChannelId);
      if (!isStillAccessible && accessibleChannels.length > 0) {
        setSelectedChannelId(accessibleChannels[0].id);
      }
    }
  }, [accessibleChannels, selectedChannelId, selectedRoomType]);

  // Messages State
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

  // Active room members calculation
  const activeRoomMembersList = useMemo(() => {
    if (selectedRoomType === 'channel') {
      const chan =
        channels.find((c) => c.id === selectedChannelId) ||
        accessibleChannels[0] ||
        DEFAULT_STAFF_CHANNELS[0];
      if (chan.memberIds && Array.isArray(chan.memberIds) && chan.memberIds.length > 0) {
        return allStaffMembers.filter((m) => chan.memberIds!.includes(m.id));
      }
      return allStaffMembers;
    } else {
      const colleague =
        allStaffMembers.find((m) => m.id === selectedColleagueId) || allStaffMembers[0];
      return [currentUser, colleague].filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i
      );
    }
  }, [selectedRoomType, selectedChannelId, selectedColleagueId, channels, accessibleChannels, allStaffMembers, currentUser]);

  // Active room metadata
  const activeRoomMeta = useMemo(() => {
    if (selectedRoomType === 'channel') {
      const chan =
        channels.find((c) => c.id === selectedChannelId) ||
        accessibleChannels[0] ||
        DEFAULT_STAFF_CHANNELS[0];
      return {
        roomId: chan.id,
        roomNameBn: chan.titleBn,
        subtitleBn: chan.subtitleBn,
        memberCount: activeRoomMembersList.length,
        channel: chan,
        isDirect: false,
        isDirectorsOnly: chan.id === 'directors_board',
      };
    } else {
      const colleague =
        allStaffMembers.find((m) => m.id === selectedColleagueId) || allStaffMembers[0];
      return {
        roomId: getDirectRoomId(currentUser.id, colleague.id),
        roomNameBn: colleague.nameBn,
        subtitleBn: `${colleague.designationBn} · ফোন: ${colleague.phone || 'স্কুল প্রশাসন'}`,
        memberCount: activeRoomMembersList.length,
        isDirect: true,
        isDirectorsOnly: false,
        colleague,
      };
    }
  }, [selectedRoomType, selectedChannelId, selectedColleagueId, currentUser.id, channels, accessibleChannels, allStaffMembers, activeRoomMembersList.length]);

  // Active room messages
  const activeRoomMessages = useMemo(() => {
    return messages
      .filter((m) => m.roomId === activeRoomMeta.roomId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [messages, activeRoomMeta.roomId]);

  // In-room message search query
  const [inRoomSearchQuery, setInRoomSearchQuery] = useState<string>('');
  const [showInRoomSearch, setShowInRoomSearch] = useState<boolean>(false);

  const displayedMessages = useMemo(() => {
    if (!inRoomSearchQuery.trim()) return activeRoomMessages;
    const q = inRoomSearchQuery.toLowerCase().trim();
    return activeRoomMessages.filter(
      (m) =>
        m.text.toLowerCase().includes(q) ||
        m.senderNameBn.toLowerCase().includes(q) ||
        m.senderRoleTitleBn.toLowerCase().includes(q)
    );
  }, [activeRoomMessages, inRoomSearchQuery]);

  // Pinned message
  const pinnedMessage = useMemo(() => {
    return [...activeRoomMessages].reverse().find((m) => m.isPinned);
  }, [activeRoomMessages]);

  // Text inputs & modal states
  const [inputText, setInputText] = useState('');
  const [toastBanner, setToastBanner] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<StaffInternalMessage | null>(null);
  const [attachedPhotoUrl, setAttachedPhotoUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [photoLightboxUrl, setPhotoLightboxUrl] = useState<string | null>(null);

  // Message Deletion Confirmation Modal (Principal / Admin only)
  const [deletingMessage, setDeletingMessage] = useState<StaffInternalMessage | null>(null);

  // Super Admin Channel Management Modal State (Principal / Admin only)
  const [showChannelModal, setShowChannelModal] = useState<boolean>(false);
  const [editingChannel, setEditingChannel] = useState<StaffChannelMeta | null>(null);
  const [channelTitleInput, setChannelTitleInput] = useState<string>('');
  const [channelSubtitleInput, setChannelSubtitleInput] = useState<string>('');
  const [channelIconInput, setChannelIconInput] = useState<string>('Building2');
  const [channelColorInput, setChannelColorInput] = useState<string>('emerald');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');

  // View Members Modal State
  const [showMembersModal, setShowMembersModal] = useState<boolean>(false);
  const [memberRosterSearch, setMemberRosterSearch] = useState<string>('');

  // Modals for Action Types
  const [showSubModal, setShowSubModal] = useState(false);
  const [subPeriod, setSubPeriod] = useState('২য় পিরিয়ড (সকাল ০৯:৪০ - ১০:২০)');
  const [subClass, setSubClass] = useState<SchoolClass>('Nursery');
  const [subSubject, setSubSubject] = useState('বাংলা ভাষা ও বর্ণমালা');
  const [subReason, setSubReason] = useState('জরুরি ক্লাসরুম মিটিং / শারীরিক অসুস্থতা');

  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [briefingTime, setBriefingTime] = useState('আজ দুপুর ০১:১৫ (টিফিন বিরতিতে)');
  const [briefingTopic, setBriefingTopic] = useState('শিশু শিক্ষা কার্নিভালের প্রস্তুতি ও প্রাতঃকালীন শৃঙ্খলা সভা');

  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [requisitionItemsText, setRequisitionItemsText] = useState(
    'রঙিন ড্রয়িং আর্ট পেপার (৫০টি)\nশিশু-বান্ধব নন-টক্সিক গ্লু স্টিক (১০টি)\nবক্স রঙ পেন্সিল (৫টি)'
  );

  // Colleague search query for direct messaging
  const [colleagueSearchQuery, setColleagueSearchQuery] = useState('');

  // Colleague categories for direct messaging
  const categorizedColleagues = useMemo(() => {
    const list = allStaffMembers.filter((m) => {
      if (m.id === currentUser.id) return false;
      if (!colleagueSearchQuery.trim()) return true;
      const q = colleagueSearchQuery.toLowerCase().trim();
      return (
        m.nameBn.toLowerCase().includes(q) ||
        m.nameEn.toLowerCase().includes(q) ||
        m.designationBn.toLowerCase().includes(q) ||
        (m.phone && m.phone.includes(q))
      );
    });

    return {
      directors: list.filter((m) => m.category === 'director' || m.role === 'super_admin'),
      principal: list.filter((m) => m.role === 'principal' || m.category === 'principal'),
      teachers: list.filter((m) => m.category === 'teacher'),
      support: list.filter((m) => m.category === 'support_staff' || m.role === 'accountant' || m.role === 'gate_security'),
    };
  }, [allStaffMembers, currentUser.id, colleagueSearchQuery]);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll
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

  // Send regular chat message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend && !attachedPhotoUrl) return;

    const now = new Date();
    const timeFormatted = `${now.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
    })}, ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

    const saved = saveStaffInternalMessage({
      roomId: activeRoomMeta.roomId,
      roomType: selectedRoomType,
      roomNameBn: activeRoomMeta.roomNameBn,
      senderId: currentUser.id,
      senderNameBn: currentUser.nameBn,
      senderRoleTitleBn: currentUser.designationBn,
      senderAvatarUrl: currentUser.photoUrl,
      receiverId: activeRoomMeta.isDirect ? selectedColleagueId : undefined,
      receiverNameBn: activeRoomMeta.isDirect ? activeRoomMeta.roomNameBn : undefined,
      text: textToSend || (attachedPhotoUrl ? '📷 ছবি সংযুক্ত করা হয়েছে' : ''),
      actionType: 'chat',
      timestamp: timeFormatted,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderNameBn: replyingTo.senderNameBn,
            text: replyingTo.text.slice(0, 80),
          }
        : undefined,
      attachmentUrl: attachedPhotoUrl || undefined,
    });

    setMessages((prev) => [...prev, saved]);
    setInputText('');
    setReplyingTo(null);
    setAttachedPhotoUrl(null);
    setShowEmojiPicker(false);
    setTimeout(() => scrollToBottom(true), 50);

    // FCM Notification dispatch
    if (onSendNotification) {
      onSendNotification({
        id: `notif-staff-${Date.now()}`,
        type: 'staff_internal_message',
        priority: 'high',
        titleBn: `📢 ${activeRoomMeta.roomNameBn}: ${currentUser.nameBn}`,
        bodyBn: textToSend.slice(0, 80) || 'নতুন বার্তা পাঠানো হয়েছে',
        targetRole: activeRoomMeta.isDirectorsOnly ? 'director' : 'all_staff',
        studentOrApplicantNameBn: currentUser.nameBn,
        className: 'Nursery',
        guardianNameBn: currentUser.nameBn,
        timestamp: timeFormatted,
        read: false,
        actionTab: 'messages',
        fcmMessageId: `fcm-staff-${Date.now()}`,
      });
    }
  };

  // Delete Message Handler (Principal or Admin ONLY)
  const handleOpenDeleteMessageModal = (msg: StaffInternalMessage) => {
    if (!canEdit) {
      alert('বার্তা মুছে ফেলার ক্ষমতা শুধুমাত্র প্রিন্সিপাল অথবা অ্যাডমিনের জন্য সংরক্ষিত।');
      return;
    }
    setDeletingMessage(msg);
  };

  const handleConfirmDeleteMessage = () => {
    if (!deletingMessage) return;

    if (!canEdit) {
      alert('বার্তা মুছে ফেলার ক্ষমতা শুধুমাত্র প্রিন্সিপাল অথবা অ্যাডমিনের জন্য সংরক্ষিত।');
      return;
    }

    const success = deleteStaffInternalMessage(deletingMessage.id);
    if (success) {
      setMessages(getStoredStaffMessages());
      setToastBanner('✓ বার্তা সফলভাবে মুছে ফেলা হয়েছে।');
      setTimeout(() => setToastBanner(null), 3000);
    }
    setDeletingMessage(null);
  };

  // Pin/Unpin Message Handler (Principal or Admin ONLY)
  const handleTogglePin = (msgId: string) => {
    if (!canEdit) {
      alert('বার্তা পিন/আনপিন করার ক্ষমতা শুধুমাত্র প্রিন্সিপাল অথবা অ্যাডমিনের জন্য সংরক্ষিত।');
      return;
    }
    const success = togglePinStaffMessage(msgId);
    if (success) {
      setMessages(getStoredStaffMessages());
      setToastBanner('✓ বার্তার পিন স্ট্যাটাস পরিবর্তিত হয়েছে।');
      setTimeout(() => setToastBanner(null), 3000);
    }
  };

  // Toggle Emoji Reaction (Available to all)
  const handleToggleReaction = (msgId: string, emoji: string) => {
    toggleStaffMessageReaction(msgId, emoji, currentUser.nameBn);
    setMessages(getStoredStaffMessages());
  };

  // Copy Message Text
  const handleCopyMessageText = (text: string) => {
    navigator.clipboard?.writeText(text);
    setToastBanner('✓ বার্তা টেক্সট ক্লিপবোর্ডে কপি করা হয়েছে');
    setTimeout(() => setToastBanner(null), 2500);
  };

  // Accept Substitute Request
  const handleAcceptSubstitute = (msgId: string) => {
    const success = acceptStaffSubstituteRequest(
      msgId,
      currentUser.id,
      currentUser.nameBn
    );
    if (success) {
      setMessages(getStoredStaffMessages());

      // Auto confirmation message in room
      saveStaffInternalMessage({
        roomId: activeRoomMeta.roomId,
        roomType: selectedRoomType,
        roomNameBn: activeRoomMeta.roomNameBn,
        senderId: currentUser.id,
        senderNameBn: currentUser.nameBn,
        senderRoleTitleBn: currentUser.designationBn,
        senderAvatarUrl: currentUser.photoUrl,
        text: `✅ আমি এই প্রক্সি ক্লাসটি নেওয়ার দায়িত্ব গ্রহণ করলাম। সম্মানিত সহকর্মী নিশ্চিত থাকুন।`,
        actionType: 'chat',
        timestamp: 'এখনই',
      });

      setToastBanner(`✓ আপনি সফলভাবে প্রক্সি ক্লাসের দায়িত্ব গ্রহণ করেছেন!`);
      setTimeout(() => setToastBanner(null), 4000);
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
      senderId: currentUser.id,
      senderNameBn: currentUser.nameBn,
      senderRoleTitleBn: currentUser.designationBn,
      senderAvatarUrl: currentUser.photoUrl,
      text,
      actionType: 'substitute_request',
      actionDetails: {
        substitute: {
          id: `sub-${Date.now()}`,
          requesterTeacherId: currentUser.id,
          requesterNameBn: currentUser.nameBn,
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
    setToastBanner('✓ আপনার প্রক্সি ক্লাসের অনুরোধ চ্যাটরুমে পোস্ট করা হয়েছে!');
    setTimeout(() => setToastBanner(null), 5000);
  };

  // Submit Briefing / Meeting Notice
  const handleSubmitBriefing = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeFormatted = `${now.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
    })}, ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;

    const text = `📢 জরুরি ব্রিফিং নোটিশ: সময়: ${briefingTime}। বিষয়: ${briefingTopic}। সংশ্লিষ্ট সকলকে যথাসময়ে উপস্থিত থাকার অনুরোধ করা হচ্ছে।`;

    const saved = saveStaffInternalMessage({
      roomId: activeRoomMeta.roomId,
      roomType: selectedRoomType,
      roomNameBn: activeRoomMeta.roomNameBn,
      senderId: currentUser.id,
      senderNameBn: currentUser.nameBn,
      senderRoleTitleBn: currentUser.designationBn,
      senderAvatarUrl: currentUser.photoUrl,
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
    setToastBanner('✓ জরুরি ব্রিফিং নোটিশ পিন করা হয়েছে!');
    setTimeout(() => setToastBanner(null), 5000);
  };

  // Submit Requisition
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

    const text = `📦 ক্লাসরুম ও মন্টেসরি সামগ্রী রিকুইজিশন নোট (${toBengaliNumber(items.length)}টি আইটেম)`;

    const saved = saveStaffInternalMessage({
      roomId: activeRoomMeta.roomId,
      roomType: selectedRoomType,
      roomNameBn: activeRoomMeta.roomNameBn,
      senderId: currentUser.id,
      senderNameBn: currentUser.nameBn,
      senderRoleTitleBn: currentUser.designationBn,
      senderAvatarUrl: currentUser.photoUrl,
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

  // Photo Attachment Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAttachedPhotoUrl(event.target.result as string);
        setToastBanner('✓ ছবি সফলভাবে যুক্ত হয়েছে! বার্তা পাঠাতে "পাঠান" ক্লিক করুন।');
        setTimeout(() => setToastBanner(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Super Admin Channel Handlers (Restricted to Principal/Admin)
  const handleOpenCreateChannelModal = () => {
    if (!canEdit) {
      alert('নতুন রুম বা চ্যানেল তৈরির ক্ষমতা শুধুমাত্র প্রিন্সিপাল অথবা অ্যাডমিনের রয়েছে।');
      return;
    }
    setEditingChannel(null);
    setChannelTitleInput('');
    setChannelSubtitleInput('');
    setChannelIconInput('Building2');
    setChannelColorInput('emerald');
    setSelectedMemberIds(allStaffMembers.map((m) => m.id));
    setMemberSearchQuery('');
    setShowChannelModal(true);
  };

  const handleOpenEditChannelModal = (chan: StaffChannelMeta) => {
    if (!canEdit) {
      alert('রুম সেটিংস ও তথ্য পরিবর্তনের ক্ষমতা শুধুমাত্র প্রিন্সিপাল অথবা অ্যাডমিনের রয়েছে।');
      return;
    }
    setEditingChannel(chan);
    setChannelTitleInput(chan.titleBn);
    setChannelSubtitleInput(chan.subtitleBn);
    setChannelIconInput(chan.iconType || 'Building2');
    const matchedColor = COLOR_PRESETS.find((p) => p.badgeBg === chan.badgeBg)?.key || 'emerald';
    setChannelColorInput(matchedColor);
    if (chan.memberIds && Array.isArray(chan.memberIds) && chan.memberIds.length > 0) {
      setSelectedMemberIds(chan.memberIds);
    } else {
      setSelectedMemberIds(allStaffMembers.map((m) => m.id));
    }
    setMemberSearchQuery('');
    setShowChannelModal(true);
  };

  const handleToggleMemberSelection = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const handleSaveChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert('রুম পরিচালনার ক্ষমতা শুধুমাত্র প্রিন্সিপাল অথবা অ্যাডমিনের রয়েছে।');
      return;
    }

    if (!channelTitleInput.trim()) {
      alert('অনুগ্রহ করে গ্রুপ রুমের একটি নাম লিখুন।');
      return;
    }

    if (selectedMemberIds.length === 0) {
      alert('অনুগ্রহ করে কমপক্ষে একজন সদস্য নির্বাচন করুন।');
      return;
    }

    const selectedColor =
      COLOR_PRESETS.find((p) => p.key === channelColorInput) || COLOR_PRESETS[0];

    if (editingChannel) {
      updateStaffChannel(editingChannel.id, {
        titleBn: channelTitleInput.trim(),
        subtitleBn: channelSubtitleInput.trim() || 'স্কুলের অভ্যন্তরীণ কার্যক্রম ও নোটিশ সমন্বয়',
        iconType: channelIconInput,
        badgeBg: selectedColor.badgeBg,
        textColor: selectedColor.textColor,
        memberIds: selectedMemberIds,
        memberCount: selectedMemberIds.length,
      });
      setToastBanner(`✓ গ্রুপ "${channelTitleInput.trim()}" আপডেট করা হয়েছে!`);
    } else {
      const created = createStaffChannel({
        titleBn: channelTitleInput.trim(),
        subtitleBn: channelSubtitleInput.trim() || 'স্কুলের অভ্যন্তরীণ কার্যক্রম ও নোটিশ সমন্বয়',
        iconType: channelIconInput,
        badgeBg: selectedColor.badgeBg,
        textColor: selectedColor.textColor,
        memberIds: selectedMemberIds,
        memberCount: selectedMemberIds.length,
      });
      setSelectedChannelId(created.id);
      setToastBanner(`✓ নতুন গ্রুপ "${created.titleBn}" সফলভাবে তৈরি হয়েছে!`);
    }

    setShowChannelModal(false);
    setTimeout(() => setToastBanner(null), 4000);
  };

  const handleDeleteChannel = (chan: StaffChannelMeta) => {
    if (!canEdit) {
      alert('রুম মুছে ফেলার ক্ষমতা শুধুমাত্র প্রিন্সিপাল অথবা অ্যাডমিনের রয়েছে।');
      return;
    }
    if (chan.isDefault || chan.id === 'directors_board' || chan.id === 'all_staff') {
      alert('পরিচালনা পর্ষদ বা সাধারণ ফোরামের মতো ডিফল্ট গুরুত্বপূর্ণ রুম মুছে ফেলা যাবে না।');
      return;
    }

    const confirmDel = window.confirm(`আপনি কি নিশ্চিত যে "${chan.titleBn}" রুমটি মুছে ফেলতে চান?`);
    if (!confirmDel) return;

    deleteStaffChannel(chan.id);
    setSelectedChannelId('all_staff');
    setToastBanner(`✓ গ্রুপ "${chan.titleBn}" সফলভাবে মুছে ফেলা হয়েছে`);
    setTimeout(() => setToastBanner(null), 3000);
  };

  const filteredMembersForRoster = useMemo(() => {
    if (!memberRosterSearch.trim()) return activeRoomMembersList;
    const q = memberRosterSearch.toLowerCase().trim();
    return activeRoomMembersList.filter(
      (m) =>
        m.nameBn.toLowerCase().includes(q) ||
        m.nameEn.toLowerCase().includes(q) ||
        m.designationBn.toLowerCase().includes(q) ||
        (m.phone && m.phone.includes(q))
    );
  }, [activeRoomMembersList, memberRosterSearch]);

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
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-170px)] min-h-[560px] max-h-[850px] relative">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Channels & 1-on-1 Directory                                  */}
        {/* ========================================================================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/90 shrink-0 h-full overflow-hidden ${
            showMobileChatView ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Top Identity Header */}
          <div className="p-3.5 border-b border-slate-200/80 bg-white space-y-2.5 shrink-0 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.nameBn}
                    className="w-10 h-10 rounded-2xl object-cover border-2 border-indigo-200 shadow-2xs"
                  />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5 ring-1 ring-emerald-600/30" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {currentUser.nameBn}
                    </h3>
                    {canEdit && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0">
                        {currentRole === 'principal' ? 'প্রিন্সিপাল' : 'অ্যাডমিন'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {currentUser.designationBn}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Segmenter: Channels vs Direct Messages */}
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
                <span>গ্রুপ ফোরাম ({toBengaliNumber(accessibleChannels.length)})</span>
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
                <span>১-অন-১ চ্যাট ({toBengaliNumber(allStaffMembers.length - 1)})</span>
              </button>
            </div>
          </div>

          {/* Directory Feed */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100">
            {selectedRoomType === 'channel' ? (
              <div className="space-y-1.5">
                {/* Principal / Admin Room Management Bar */}
                {canEdit && (
                  <div className="p-2 mb-1.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-200/90 shadow-2xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
                      <span className="text-[11px] font-black text-indigo-950 truncate">
                        {currentRole === 'principal' ? 'প্রিন্সিপাল' : 'অ্যাডমিন'} রুম কন্ট্রোল
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenCreateChannelModal}
                      className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer shrink-0"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>নতুন গ্রুপ তৈরি</span>
                    </button>
                  </div>
                )}

                {/* Channels List (Strictly filtered by user permission) */}
                {accessibleChannels.map((chan) => {
                  const isSelected = selectedChannelId === chan.id;
                  const isDirectorsOnly = chan.id === 'directors_board';
                  const lastMsg = messages
                    .filter((m) => m.roomId === chan.id)
                    .slice(-1)[0];

                  return (
                    <div
                      key={chan.id}
                      className={`relative group rounded-2xl transition border ${
                        isSelected
                          ? isDirectorsOnly
                            ? 'bg-amber-50 border-amber-300 shadow-2xs'
                            : 'bg-indigo-50/80 border-indigo-300 shadow-2xs'
                          : 'bg-white hover:bg-slate-100/90 border-slate-100'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedChannelId(chan.id);
                          setShowMobileChatView(true);
                        }}
                        className="w-full p-2.5 text-left flex items-start gap-2.5 cursor-pointer"
                      >
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-2xs ${chan.badgeBg} ${chan.textColor}`}
                        >
                          {renderChannelIcon(chan.iconType, 'w-4 h-4')}
                        </div>
                        <div className={`flex-1 min-w-0 ${canEdit ? 'pr-14' : ''}`}>
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1 min-w-0">
                              <h4 className="text-xs font-black text-slate-900 truncate">
                                {chan.titleBn}
                              </h4>
                              {isDirectorsOnly && (
                                <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-black bg-amber-200 text-amber-900 flex items-center gap-0.5 shrink-0">
                                  <Lock className="w-2.5 h-2.5" />
                                  সংরক্ষিত
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                              {toBengaliNumber(chan.memberCount)} সদস্য
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                            {lastMsg
                              ? `${lastMsg.senderNameBn}: ${lastMsg.text}`
                              : chan.subtitleBn}
                          </p>
                        </div>
                      </button>

                      {/* Principal / Admin Quick Actions on this channel */}
                      {canEdit && (
                        <div className="absolute right-2 top-2.5 flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditChannelModal(chan);
                            }}
                            className="p-1.5 rounded-lg bg-white/95 hover:bg-indigo-100 text-slate-600 hover:text-indigo-800 shadow-2xs border border-slate-200 transition-colors cursor-pointer"
                            title="রুমের হেডিং ও তথ্য পরিবর্তন করুন"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          {!chan.isDefault && chan.id !== 'directors_board' && chan.id !== 'all_staff' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChannel(chan);
                              }}
                              className="p-1.5 rounded-lg bg-white/95 hover:bg-rose-100 text-slate-600 hover:text-rose-800 shadow-2xs border border-slate-200 transition-colors cursor-pointer"
                              title="এই গ্রুপ রুম বাদ দিন"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // 1-on-1 Direct Colleague List (Grouped by Directors, Principal, Teachers, Staff)
              <div className="space-y-3">
                <div className="p-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={colleagueSearchQuery}
                      onChange={(e) => setColleagueSearchQuery(e.target.value)}
                      placeholder="নাম বা পদবি দিয়ে সহকর্মী খুঁজুন..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Section 1: Directors */}
                {categorizedColleagues.directors.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider px-2 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-600" />
                      পরিচালনা পর্ষদ ও নীতিনির্ধারক
                    </span>
                    {categorizedColleagues.directors.map((colleague) => {
                      const isSelected = selectedColleagueId === colleague.id;
                      const dirRoomId = getDirectRoomId(currentUser.id, colleague.id);
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
                              ? 'bg-amber-50 border border-amber-300 shadow-2xs ring-1 ring-amber-300'
                              : 'bg-white hover:bg-slate-100/80 border border-slate-100'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={colleague.photoUrl}
                              alt={colleague.nameBn}
                              className="w-9 h-9 rounded-xl object-cover border border-amber-200 shadow-2xs"
                            />
                            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-1 ring-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {colleague.nameBn}
                              </h4>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold shrink-0">
                                পরিচালক
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">
                              {colleague.designationBn}
                            </p>
                            <p className="text-[10.5px] text-amber-900 font-medium truncate mt-0.5">
                              {lastMsg ? lastMsg.text : 'সরাসরি ব্যক্তিগত বার্তা শুরু করুন'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Section 2: Principal */}
                {categorizedColleagues.principal.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-indigo-800 tracking-wider px-2 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-indigo-600" />
                      প্রিন্সিপাল ও একাডেমিক প্রধান
                    </span>
                    {categorizedColleagues.principal.map((colleague) => {
                      const isSelected = selectedColleagueId === colleague.id;
                      const dirRoomId = getDirectRoomId(currentUser.id, colleague.id);
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
                              ? 'bg-indigo-50 border border-indigo-300 shadow-2xs ring-1 ring-indigo-300'
                              : 'bg-white hover:bg-slate-100/80 border border-slate-100'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={colleague.photoUrl}
                              alt={colleague.nameBn}
                              className="w-9 h-9 rounded-xl object-cover border border-indigo-200 shadow-2xs"
                            />
                            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-1 ring-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {colleague.nameBn}
                              </h4>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-900 font-bold shrink-0">
                                প্রিন্সিপাল
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">
                              {colleague.designationBn}
                            </p>
                            <p className="text-[10.5px] text-indigo-900 font-medium truncate mt-0.5">
                              {lastMsg ? lastMsg.text : 'সরাসরি ব্যক্তিগত বার্তা শুরু করুন'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Section 3: Teachers */}
                {categorizedColleagues.teachers.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-teal-800 tracking-wider px-2 flex items-center gap-1">
                      <Users className="w-3 h-3 text-teal-600" />
                      শিক্ষক ও শিক্ষিকাবৃন্দ
                    </span>
                    {categorizedColleagues.teachers.map((colleague) => {
                      const isSelected = selectedColleagueId === colleague.id;
                      const dirRoomId = getDirectRoomId(currentUser.id, colleague.id);
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
                          <div className="relative shrink-0">
                            <img
                              src={colleague.photoUrl}
                              alt={colleague.nameBn}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                            />
                            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-1 ring-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {colleague.nameBn}
                              </h4>
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
                  </div>
                )}

                {/* Section 4: Support Staff & Accounts */}
                {categorizedColleagues.support.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider px-2 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-500" />
                      হিসাব ও প্রশাসন কর্মকর্তা
                    </span>
                    {categorizedColleagues.support.map((colleague) => {
                      const isSelected = selectedColleagueId === colleague.id;
                      const dirRoomId = getDirectRoomId(currentUser.id, colleague.id);
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
                              ? 'bg-slate-100 border border-slate-300 shadow-2xs'
                              : 'bg-white hover:bg-slate-100/80 border border-slate-100'
                          }`}
                        >
                          <img
                            src={colleague.photoUrl}
                            alt={colleague.nameBn}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {colleague.nameBn}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">
                              {colleague.designationBn}
                            </p>
                            <p className="text-[10.5px] text-slate-700 font-medium truncate mt-0.5">
                              {lastMsg ? lastMsg.text : 'সরাসরি বার্তা শুরু করুন'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Active Chat Stream & Message Center                          */}
        {/* ========================================================================= */}
        <div
          className={`flex-1 flex flex-col bg-slate-100/70 h-full overflow-hidden min-h-0 ${
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

              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                  activeRoomMeta.isDirectorsOnly
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-indigo-100 text-indigo-900'
                }`}
              >
                {activeRoomMeta.isDirect ? (
                  '💬'
                ) : activeRoomMeta.isDirectorsOnly ? (
                  <Crown className="w-5 h-5 text-amber-700" />
                ) : (
                  renderChannelIcon(
                    activeRoomMeta.channel?.iconType || 'Building2',
                    'w-5 h-5 text-indigo-800'
                  )
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-extrabold text-slate-900 truncate">
                    {activeRoomMeta.roomNameBn}
                  </h3>
                  {activeRoomMeta.isDirectorsOnly && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700" />
                      পরিচালনা পর্ষদ সংরক্ষিত ফোরাম
                    </span>
                  )}
                  {activeRoomMeta.isDirect && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      ১-অন-১ প্রাইভেট চ্যাট
                    </span>
                  )}

                  {/* View Members Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setMemberRosterSearch('');
                      setShowMembersModal(true);
                    }}
                    className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200 transition cursor-pointer flex items-center gap-1"
                  >
                    <Users className="w-3 h-3" />
                    <span>{toBengaliNumber(activeRoomMeta.memberCount)} জন সদস্য</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{activeRoomMeta.subtitleBn}</p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* In-room Search Toggle */}
              <button
                type="button"
                onClick={() => setShowInRoomSearch((prev) => !prev)}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer border ${
                  showInRoomSearch
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="রুমে বার্তা অনুসন্ধান করুন"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Principal / Admin: Room Title, Topic & Member Editing */}
              {canEdit && !activeRoomMeta.isDirect && activeRoomMeta.channel && (
                <button
                  type="button"
                  onClick={() => handleOpenEditChannelModal(activeRoomMeta.channel!)}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  title="চ্যাট রুমের শিরোনাম, বিষয় ও সদস্য তালিকা এডিট করুন (প্রিন্সিপাল/অ্যাডমিন)"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-700" />
                  <span className="hidden sm:inline">রুম ও সদস্য এডিট</span>
                </button>
              )}
            </div>
          </div>

          {/* In-Room Search Bar */}
          {showInRoomSearch && (
            <div className="bg-white border-b border-indigo-200 px-4 py-2 flex items-center gap-2 animate-in fade-in">
              <Search className="w-4 h-4 text-indigo-600 shrink-0" />
              <input
                type="text"
                value={inRoomSearchQuery}
                onChange={(e) => setInRoomSearchQuery(e.target.value)}
                placeholder="এই রুমের প্রেরক বা বার্তা লিখে ফিল্টার করুন..."
                className="w-full text-xs text-slate-900 bg-transparent focus:outline-hidden"
                autoFocus
              />
              {inRoomSearchQuery && (
                <button
                  type="button"
                  onClick={() => setInRoomSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Pinned Announcement Bar */}
          {pinnedMessage && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-xs text-amber-900 shrink-0 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <Pin className="w-4 h-4 text-amber-700 shrink-0 rotate-45" />
                <div className="truncate">
                  <span className="font-black text-amber-950">পিনকৃত নোটিশ ({pinnedMessage.senderNameBn}):</span>{' '}
                  <span className="font-medium text-amber-900">{pinnedMessage.text}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-amber-700 font-mono hidden sm:inline">
                  {pinnedMessage.timestamp}
                </span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleTogglePin(pinnedMessage.id)}
                    className="text-[10px] font-bold text-amber-800 hover:text-amber-950 bg-amber-200/60 hover:bg-amber-200 px-2 py-0.5 rounded-lg transition cursor-pointer"
                  >
                    আনপিন
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Messages Feed Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto pt-4 pb-6 px-3 sm:px-6 space-y-4 min-h-0"
          >
            {displayedMessages.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <Building2 className="w-10 h-10 text-slate-300 stroke-1" />
                <p className="text-xs font-bold text-slate-600">
                  {inRoomSearchQuery ? 'কোনো বার্তা খুঁজে পাওয়া যায়নি' : 'এই রুমে এখনো কোনো আলোচনা হয়নি'}
                </p>
                <p className="text-[11px] max-w-xs text-slate-500">
                  {inRoomSearchQuery
                    ? 'অন্য কোনো শব্দ বা নাম দিয়ে অনুসন্ধান করে দেখুন।'
                    : 'গ্রুপের সদস্যদের সাথে আলোচনা শুরু করতে নিচে লিখুন।'}
                </p>
              </div>
            ) : (
              displayedMessages.map((msg) => {
                const isOutgoing = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col group/msg ${
                      isOutgoing ? 'items-end' : 'items-start'
                    } space-y-1 relative`}
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
                      {msg.isPinned && (
                        <span className="text-[9.5px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                          <Pin className="w-2.5 h-2.5 rotate-45" /> পিনকৃত
                        </span>
                      )}
                    </div>

                    {/* Quoted Reply reference inside bubble */}
                    {msg.replyTo && (
                      <div
                        className={`text-[10.5px] p-2 rounded-xl max-w-[85%] border flex items-start gap-1.5 ${
                          isOutgoing
                            ? 'bg-indigo-800/40 border-indigo-400/40 text-indigo-100 mr-1'
                            : 'bg-slate-100 border-slate-200 text-slate-700 ml-1'
                        }`}
                      >
                        <CornerUpLeft className="w-3.5 h-3.5 shrink-0 opacity-70 mt-0.5" />
                        <div className="truncate">
                          <strong>{msg.replyTo.senderNameBn}:</strong> {msg.replyTo.text}
                        </div>
                      </div>
                    )}

                    {/* Action Card: Substitute Request */}
                    {msg.actionType === 'substitute_request' && msg.actionDetails?.substitute ? (
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
                            <strong>শ্রেণি:</strong>{' '}
                            {getSchoolClassNameBn(msg.actionDetails.substitute.className)} ·{' '}
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
                                <strong>
                                  {msg.actionDetails.substitute.acceptedByTeacherNameBn}
                                </strong>
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAcceptSubstitute(msg.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer w-full justify-center"
                            >
                              <Check className="w-4 h-4" />
                              <span>আমি এই প্রক্সি ক্লাসটি নেব (দায়িত্ব গ্রহণ করুন)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : msg.actionType === 'emergency_briefing' ? (
                      /* Action Card: Emergency Meeting / Briefing */
                      <div className="max-w-[92%] sm:max-w-[80%] rounded-2xl p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-300 shadow-sm space-y-2">
                        <div className="flex items-center justify-between gap-2 border-b border-indigo-200/80 pb-1.5">
                          <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-indigo-700" />
                            📢 জরুরি মিটিং / ব্রিফিং নোটিশ
                          </span>
                          <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            অফিসিয়াল
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-indigo-950 font-medium whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      </div>
                    ) : msg.actionType === 'resource_requisition' &&
                      msg.actionDetails?.requisitionItems ? (
                      /* Action Card: Requisition */
                      <div className="max-w-[92%] sm:max-w-[80%] rounded-2xl p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-sm space-y-2">
                        <div className="flex items-center justify-between gap-2 border-b border-purple-200/80 pb-1.5">
                          <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-purple-700" />
                            মন্টেসরি ও ক্লাসরুম সামগ্রী রিকুইজিশন
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
                      /* Regular Chat Bubble */
                      <div
                        className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-1.5 break-words [word-break:break-word] overflow-hidden relative ${
                          isOutgoing
                            ? 'bg-gradient-to-br from-indigo-700 to-indigo-900 text-white rounded-tr-xs ml-auto mr-1'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs mr-auto ml-1'
                        }`}
                      >
                        {/* Attached Image if any */}
                        {msg.attachmentUrl && (
                          <div className="mb-2">
                            <img
                              src={msg.attachmentUrl}
                              alt="Attachment"
                              onClick={() => setPhotoLightboxUrl(msg.attachmentUrl!)}
                              className="max-h-60 rounded-xl object-cover cursor-pointer hover:opacity-95 transition border border-white/20"
                            />
                          </div>
                        )}

                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      </div>
                    )}

                    {/* Reactions Pill Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div
                        className={`flex flex-wrap items-center gap-1 px-1.5 py-0.5 ${
                          isOutgoing ? 'justify-end mr-1' : 'justify-start ml-1'
                        }`}
                      >
                        {Object.entries(msg.reactions).map(([emoji, userNames]) => {
                          const hasReacted = userNames.includes(currentUser.nameBn);
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                                hasReacted
                                  ? 'bg-indigo-100 text-indigo-900 border-indigo-300 shadow-2xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                              title={userNames.join(', ')}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px]">{toBengaliNumber(userNames.length)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Message Actions Floating Toolbar */}
                    <div
                      className={`flex items-center gap-1 bg-white border border-slate-200/90 shadow-md rounded-xl p-1 opacity-0 group-hover/msg:opacity-100 transition-opacity z-10 ${
                        isOutgoing ? 'mr-1' : 'ml-1'
                      }`}
                    >
                      {/* Quick Reactions */}
                      {['👍', '❤️', '👏', '💡'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => handleToggleReaction(msg.id, em)}
                          className="hover:scale-125 transition-transform p-0.5 text-xs cursor-pointer"
                          title={`${em} রিঅ্যাকশন দিন`}
                        >
                          {em}
                        </button>
                      ))}

                      <div className="w-px h-3 bg-slate-200 mx-0.5" />

                      {/* Reply Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(msg);
                          textareaRef.current?.focus();
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        title="এই বার্তার উত্তর দিন"
                      >
                        <CornerUpLeft className="w-3.5 h-3.5" />
                      </button>

                      {/* Copy Text Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyMessageText(msg.text)}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                        title="বার্তা কপি করুন"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Principal / Admin ONLY Controls (Pin & Moderation) */}
                      {canEdit && (
                        <>
                          <div className="w-px h-3 bg-slate-200 mx-0.5" />

                          {/* Pin Message Button */}
                          <button
                            type="button"
                            onClick={() => handleTogglePin(msg.id)}
                            className={`p-1 rounded-lg transition cursor-pointer ${
                              msg.isPinned
                                ? 'text-amber-700 bg-amber-50'
                                : 'text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                            title={msg.isPinned ? 'আনপিন করুন' : 'বার্তাকে রুমে পিন করুন'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Message Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteMessageModal(msg)}
                            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="বার্তা মুছে ফেলুন (প্রিন্সিপাল/অ্যাডমিন)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Message Input & Quick Action Bar */}
          <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 space-y-2 shrink-0 shadow-lg">
            {/* Replying banner if active */}
            {replyingTo && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2 flex items-center justify-between text-xs text-indigo-950">
                <div className="flex items-center gap-2 truncate">
                  <CornerUpLeft className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">
                    <strong>{replyingTo.senderNameBn}</strong>-এর বার্তার উত্তর:{' '}
                    <em>{replyingTo.text.slice(0, 70)}...</em>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-indigo-600 hover:text-indigo-950 font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Attached Photo Preview banner if active */}
            {attachedPhotoUrl && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <img
                    src={attachedPhotoUrl}
                    alt="Attached preview"
                    className="w-10 h-10 object-cover rounded-lg border border-emerald-300"
                  />
                  <span>১টি ছবি সংযুক্ত করা হয়েছে</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedPhotoUrl(null)}
                  className="text-rose-600 hover:text-rose-900 font-bold p-1 cursor-pointer"
                >
                  ✕ মুছে ফেলুন
                </button>
              </div>
            )}

            {/* Quick Action Buttons Row */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {/* Emergency Meeting Briefing */}
              <button
                type="button"
                onClick={() => setShowBriefingModal(true)}
                className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold transition flex items-center gap-1 border border-indigo-200 shadow-2xs cursor-pointer shrink-0"
              >
                <AlertCircle className="w-3.5 h-3.5 text-indigo-700" />
                <span>জরুরি ব্রিফিং</span>
              </button>

              {/* Substitute Request */}
              <button
                type="button"
                onClick={() => setShowSubModal(true)}
                className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold transition flex items-center gap-1 border border-amber-200 shadow-2xs cursor-pointer shrink-0"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>প্রক্সি অনুরোধ</span>
              </button>

              {/* Material Requisition */}
              <button
                type="button"
                onClick={() => setShowRequisitionModal(true)}
                className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold transition flex items-center gap-1 border border-purple-200 shadow-2xs cursor-pointer shrink-0"
              >
                <Package className="w-3.5 h-3.5 text-purple-700" />
                <span>উপকরণ রিকুইজিশন</span>
              </button>

              {/* Photo Upload Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-1 border border-slate-200 shadow-2xs cursor-pointer shrink-0"
              >
                <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                <span>ছবি পাঠান</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Emoji bar toggle */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="px-2 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-1 border border-slate-200 shadow-2xs cursor-pointer shrink-0"
              >
                <Smile className="w-3.5 h-3.5 text-amber-500" />
                <span>ইমোজি</span>
              </button>
            </div>

            {/* Emoji Quick Picker Row */}
            {showEmojiPicker && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center gap-2 overflow-x-auto">
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      setInputText((prev) => prev + em);
                      setShowEmojiPicker(false);
                      textareaRef.current?.focus();
                    }}
                    className="p-1.5 hover:bg-white rounded-lg text-lg transition-transform hover:scale-125 cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
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
                  placeholder={`${activeRoomMeta.roomNameBn}-এ বার্তা লিখুন (Enter চাপলে সেন্ড হবে)...`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() && !attachedPhotoUrl}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs shrink-0 min-h-[46px] ${
                  inputText.trim() || attachedPhotoUrl
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
      {/* MODAL: DELETE MESSAGE CONFIRMATION (Principal or Admin ONLY)               */}
      {/* ========================================================================= */}
      {deletingMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-200 overflow-hidden">
            <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5 text-rose-200" />
                <div>
                  <h3 className="text-base font-bold">বার্তা মুছে ফেলা নিশ্চিতকরণ</h3>
                  <p className="text-xs text-rose-100">প্রিন্সিপাল/অ্যাডমিন মডারেশন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeletingMessage(null)}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700">
                আপনি কি নিশ্চিত যে <strong>{deletingMessage.senderNameBn}</strong>-এর এই বার্তাটি রুম থেকে স্থায়ীভাবে মুছে ফেলতে চান?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 italic">
                "{deletingMessage.text.slice(0, 120)}..."
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingMessage(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteMessage}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  হ্যাঁ, মুছে ফেলুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW ACTIVE ROOM MEMBERS                                           */}
      {/* ========================================================================= */}
      {showMembersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-indigo-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-indigo-200" />
                <div>
                  <h3 className="text-base font-bold">{activeRoomMeta.roomNameBn}</h3>
                  <p className="text-xs text-indigo-100">
                    এই রুমের মোট সদস্য: {toBengaliNumber(activeRoomMembersList.length)} জন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMembersModal(false)}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberRosterSearch}
                  onChange={(e) => setMemberRosterSearch(e.target.value)}
                  placeholder="সদস্যের নাম বা পদবি দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredMembersForRoster.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-white transition shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={member.photoUrl}
                      alt={member.nameBn}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {member.nameBn}
                        </h4>
                        {member.role === 'principal' && (
                          <span className="text-[9px] font-black px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-800">
                            প্রিন্সিপাল
                          </span>
                        )}
                        {(member.role === 'director' || member.role === 'super_admin') && (
                          <span className="text-[9px] font-black px-2 py-0.2 rounded-full bg-amber-100 text-amber-900">
                            পরিচালক
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-500 truncate">{member.designationBn}</p>
                    </div>
                  </div>
                  {member.phone && (
                    <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200 shrink-0">
                      {member.phone}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowMembersModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT GROUP CHANNEL (Principal / Admin ONLY)                */}
      {/* ========================================================================= */}
      {showChannelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-indigo-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-indigo-200" />
                <div>
                  <h3 className="text-base font-bold">
                    {editingChannel ? 'চ্যাট রুমের শিরোনাম, বিবরণ ও সদস্য এডিট' : 'নতুন চ্যাট রুম তৈরি'}
                  </h3>
                  <p className="text-xs text-indigo-100">
                    শুধুমাত্র প্রিন্সিপাল অথবা অ্যাডমিন কর্তৃক নিয়ন্ত্রণযোগ্য
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChannelModal(false)}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChannel} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">চ্যাট রুমের শিরোনাম / নাম (বাংলা):</label>
                <input
                  type="text"
                  value={channelTitleInput}
                  onChange={(e) => setChannelTitleInput(e.target.value)}
                  placeholder="যেমন: পরিচালনা পর্ষদ, প্রি-স্কুল উইং, অ্যাকাডেমিক কমিটি ইত্যাদি"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">রুমের বিষয় / সাবটাইটেল (আলোচনার বিষয়বস্তু):</label>
                <input
                  type="text"
                  value={channelSubtitleInput}
                  onChange={(e) => setChannelSubtitleInput(e.target.value)}
                  placeholder="এই রুমের আলোচনার বিষয়বস্তু..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Color Preset */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">রুমের থিম কালার:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLOR_PRESETS.map((col) => (
                    <button
                      key={col.key}
                      type="button"
                      onClick={() => setChannelColorInput(col.key)}
                      className={`p-2 rounded-xl flex items-center gap-2 border cursor-pointer transition ${
                        channelColorInput === col.key
                          ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${col.dot} shrink-0`} />
                      <span className="text-[11px] font-bold text-slate-800 truncate">
                        {col.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Member Selection from Unified Roster */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800">
                    রুমের অনুমোদিত সদস্য নির্বাচন ({toBengaliNumber(selectedMemberIds.length)} জন নির্বাচিত):
                  </label>
                  <div className="flex items-center gap-1.5 text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => setSelectedMemberIds(allStaffMembers.map((m) => m.id))}
                      className="text-indigo-600 hover:text-indigo-900 font-bold cursor-pointer"
                    >
                      সবাইকে যুক্ত করুন
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setSelectedMemberIds([])}
                      className="text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                    >
                      খালি করুন
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl p-2 space-y-1 bg-slate-50">
                  {allStaffMembers.map((member) => {
                    const isChecked = selectedMemberIds.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() => handleToggleMemberSelection(member.id)}
                        className={`p-2 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition ${
                          isChecked ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={member.photoUrl}
                            alt={member.nameBn}
                            className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 truncate block">
                              {member.nameBn}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block">
                              {member.designationBn}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isChecked
                              ? 'bg-indigo-600 text-white'
                              : 'border border-slate-300 text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowChannelModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingChannel ? 'পরিবর্তন সংরক্ষণ করুন' : 'গ্রুপ তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBSTITUTE REQUEST                                                 */}
      {/* ========================================================================= */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-amber-300 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-5 h-5 text-amber-200" />
                <div>
                  <h3 className="text-base font-bold">প্রক্সি / সাবস্টিটিউট ক্লাসের অনুরোধ</h3>
                  <p className="text-xs text-amber-100">সহকর্মীদের সাথে ক্লাসের দায়িত্ব ভাগ করে নিন</p>
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
                <label className="text-xs font-bold text-slate-700">বিষয়:</label>
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
                  placeholder="যেমন: জরুরি মিটিং বা অসুস্থতা"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  অনুরোধ পোস্ট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EMERGENCY BRIEFING                                                 */}
      {/* ========================================================================= */}
      {showBriefingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-indigo-300 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-700 to-blue-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-indigo-200" />
                <div>
                  <h3 className="text-base font-bold">জরুরি ব্রিফিং ও মিটিং নোটিশ</h3>
                  <p className="text-xs text-indigo-100">রুমের শীর্ষে পিন করা হবে</p>
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
                <label className="text-xs font-bold text-slate-700">মিটিং / ব্রিফিংয়ের সময়:</label>
                <input
                  type="text"
                  value={briefingTime}
                  onChange={(e) => setBriefingTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">আলোচনার বিষয়বস্তু:</label>
                <textarea
                  value={briefingTopic}
                  onChange={(e) => setBriefingTopic(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBriefingModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  নোটিশ পিন ও পোস্ট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REQUISITION ITEMS                                                  */}
      {/* ========================================================================= */}
      {showRequisitionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-pink-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-purple-200" />
                <div>
                  <h3 className="text-base font-bold">শিক্ষা ও মন্টেসরি সামগ্রী রিকুইজিশন</h3>
                  <p className="text-xs text-purple-100">স্টোর ও প্রশাসনের দৃষ্টি আকর্ষণ করুন</p>
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
                <label className="text-xs font-bold text-slate-700">
                  প্রয়োজনীয় উপকরণের তালিকা (প্রতি লাইনে একটি করে আইটেম):
                </label>
                <textarea
                  value={requisitionItemsText}
                  onChange={(e) => setRequisitionItemsText(e.target.value)}
                  rows={5}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                  placeholder="আইটেম ১&#10;আইটেম ২&#10;আইটেম ৩"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequisitionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  রিকুইজিশন জমা দিন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX FOR ATTACHED PHOTO                                               */}
      {/* ========================================================================= */}
      {photoLightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPhotoLightboxUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={photoLightboxUrl}
              alt="Enlarged preview"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setPhotoLightboxUrl(null)}
              className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
