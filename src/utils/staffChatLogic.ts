import {
  StaffInternalMessage,
  StaffRoomType,
  StaffActionType,
  StaffSubstituteRequest,
  SchoolClass,
  StaffChannelMeta,
  StaffChatMember,
  UserRole,
  PortalAccount,
} from '../types/school';
import { SCHOOL_TEACHERS, MANAGEMENT_COMMITTEE } from '../data/mockData';

export const STAFF_CHAT_STORAGE_KEY = 'ananda_staff_internal_messages_v2';
export const STAFF_CHAT_STORAGE_EVENT = 'ananda-staff-chat-updated';

export const STAFF_CHANNELS_STORAGE_KEY = 'ananda_staff_channels_v2';
export const STAFF_CHANNELS_STORAGE_EVENT = 'ananda-staff-channels-updated';

export type { StaffChannelMeta, StaffChatMember };

// ==========================================
// UNIFIED STAFF & DIRECTORS ROSTER
// ==========================================

export function getAllStaffChatMembers(): StaffChatMember[] {
  const members: StaffChatMember[] = [];
  const seenIds = new Set<string>();

  // 1. Directors & Governing Body
  for (const dir of MANAGEMENT_COMMITTEE) {
    const role: UserRole =
      dir.portalRole === 'super_admin' || dir.id === 'dir-3' || dir.username === 'superadmin'
        ? 'super_admin'
        : 'director';

    const memberId = dir.id;
    if (!seenIds.has(memberId)) {
      seenIds.add(memberId);
      members.push({
        id: memberId,
        directorId: dir.id,
        nameBn: dir.nameBn,
        nameEn: dir.nameEn,
        role,
        designationBn: dir.designationBn || dir.roleBn,
        departmentBn: 'পরিচালনা পর্ষদ ও নীতিনির্ধারণ',
        photoUrl: dir.photoUrl || '/assets/fb/logo.jpg',
        phone: dir.phone,
        email: dir.email,
        username: dir.username,
        category: role === 'super_admin' ? 'principal' : 'director',
      });
    }
  }

  // 2. Principal, Teachers & Support Staff
  for (const tch of SCHOOL_TEACHERS) {
    const isPrincipal = tch.id === 'tch-1' || tch.designationBn.includes('প্রিন্সিপাল');
    const isSupport = tch.staffCategory === 'support_staff' || tch.designationBn.includes('হিসাবরক্ষক') || tch.designationBn.includes('নিরাপত্তা');
    const role: UserRole = isPrincipal
      ? 'principal'
      : tch.designationBn.includes('হিসাবরক্ষক')
      ? 'accountant'
      : tch.designationBn.includes('নিরাপত্তা')
      ? 'gate_security'
      : 'teacher';

    const memberId = tch.id;
    if (!seenIds.has(memberId)) {
      seenIds.add(memberId);
      members.push({
        id: memberId,
        teacherId: tch.id,
        nameBn: tch.nameBn,
        nameEn: tch.nameEn,
        role,
        designationBn: tch.designationBn,
        departmentBn: tch.departmentBn,
        photoUrl: tch.photoUrl || '/assets/fb/logo.jpg',
        phone: tch.phone,
        email: tch.email,
        username: tch.username,
        category: isPrincipal ? 'principal' : isSupport ? 'support_staff' : 'teacher',
      });
    }
  }

  return members;
}

/**
 * Accurately resolves the current logged-in user to a StaffChatMember
 */
export function getStaffMemberIdentity(
  currentRole: UserRole,
  loggedInAccount: PortalAccount | null
): StaffChatMember {
  const allMembers = getAllStaffChatMembers();

  if (loggedInAccount) {
    // 1. Match by directorId
    if (loggedInAccount.directorId) {
      const match = allMembers.find((m) => m.directorId === loggedInAccount.directorId || m.id === loggedInAccount.directorId);
      if (match) return match;
    }

    // 2. Match by username
    if (loggedInAccount.username) {
      const match = allMembers.find((m) => m.username === loggedInAccount.username);
      if (match) return match;
    }

    // 3. Match by name
    if (loggedInAccount.nameBn) {
      const match = allMembers.find(
        (m) => m.nameBn.includes(loggedInAccount.nameBn) || loggedInAccount.nameBn.includes(m.nameBn)
      );
      if (match) return match;
    }
  }

  // Role based intelligent fallbacks
  if (currentRole === 'super_admin') {
    return allMembers.find((m) => m.id === 'dir-3') || allMembers[0];
  }
  if (currentRole === 'director') {
    return allMembers.find((m) => m.id === 'dir-4') || allMembers[0];
  }
  if (currentRole === 'principal') {
    return allMembers.find((m) => m.id === 'tch-1') || allMembers[0];
  }
  if (currentRole === 'accountant') {
    return allMembers.find((m) => m.id === 'tch-8') || allMembers[1];
  }
  if (currentRole === 'gate_security') {
    return allMembers.find((m) => m.id === 'tch-9') || allMembers[1];
  }

  // Teacher fallback
  return allMembers.find((m) => m.id === 'tch-2') || allMembers[0];
}

// ==========================================
// PERMISSION CHECKERS
// ==========================================

/**
 * Checks whether user can access a specific group channel.
 * Restricts rooms like 'directors_board' strictly to Directors, Super Admin, and Principal!
 */
export function canUserAccessChannel(
  channel: StaffChannelMeta,
  currentRole: UserRole,
  memberId: string
): boolean {
  // Directors Lounge is strictly restricted to Directors, Super Admin, and Principal
  if (channel.id === 'directors_board') {
    return (
      currentRole === 'director' ||
      currentRole === 'super_admin' ||
      currentRole === 'principal' ||
      Boolean(channel.memberIds && channel.memberIds.includes(memberId))
    );
  }

  // All Staff lounge is open to all staff and directors
  if (channel.id === 'all_staff') {
    return currentRole !== 'parent' && currentRole !== 'public';
  }

  // Super Admin & Principal have supervisor access across all school channels
  if (currentRole === 'super_admin' || currentRole === 'principal') {
    return true;
  }

  // For other channels, check allowed roles if set
  if (channel.allowedRoles && channel.allowedRoles.length > 0) {
    if (!channel.allowedRoles.includes(currentRole)) return false;
  }

  // Check specific memberIds if specified
  if (channel.memberIds && Array.isArray(channel.memberIds) && channel.memberIds.length > 0) {
    return channel.memberIds.includes(memberId);
  }

  return true;
}

/**
 * Editing power is strictly restricted to Principal or Admin!
 * Satisfies: "এবং এডিট করার ক্ষমতা শুধুমাত্র প্রিন্সিপাল অথবা এডমিনকে দেওয়ার জন্য অনুরোধ করছি।"
 */
export function canUserEditChat(
  currentRole: UserRole,
  loggedInAccount?: PortalAccount | null
): boolean {
  if (currentRole === 'principal' || currentRole === 'super_admin') return true;
  if (loggedInAccount?.role === 'principal' || loggedInAccount?.role === 'super_admin') return true;
  return false;
}

// ==========================================
// DEFAULT CHANNELS
// ==========================================

export const DEFAULT_STAFF_CHANNELS: StaffChannelMeta[] = [
  {
    id: 'directors_board',
    titleBn: 'পরিচালনা পর্ষদ ফোরাম (Directors Lounge)',
    subtitleBn: 'শুধুমাত্র সম্মানিত পরিচালনা পর্ষদ ও প্রিন্সিপালের জন্য সংরক্ষিত উচ্চপর্যায়ের নীতিনির্ধারণী ফোরাম',
    iconType: 'ShieldAlert',
    badgeBg: 'bg-amber-100',
    textColor: 'text-amber-900',
    allowedRoles: ['director', 'super_admin', 'principal'],
    memberIds: ['dir-4', 'dir-5', 'dir-3', 'dir-1', 'dir-2', 'tch-1'],
    memberCount: 6,
    isDefault: true,
    isLocked: true,
  },
  {
    id: 'all_staff',
    titleBn: 'সকল শিক্ষক, স্টাফ ও পরিচালনা পরিষদ ফোরাম',
    subtitleBn: 'পরিচালকবৃন্দ, প্রিন্সিপাল, শিক্ষক ও সকল কর্মকর্তা-কর্মচারীদের সমন্বিত সাধারণ ফোরাম',
    iconType: 'Building2',
    badgeBg: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    allowedRoles: ['director', 'super_admin', 'principal', 'teacher', 'accountant', 'gate_security'],
    memberIds: [
      'dir-4', 'dir-5', 'dir-3', 'dir-1', 'dir-2',
      'tch-1', 'tch-2', 'tch-3', 'tch-4', 'tch-5', 'tch-6', 'tch-7', 'tch-8', 'tch-9'
    ],
    memberCount: 14,
    isDefault: true,
  },
  {
    id: 'preschool_wing',
    titleBn: 'প্রি-স্কুল ও নার্সারি উইং',
    subtitleBn: 'হাতেখড়ি, প্লে ও নার্সারি ক্লাসের শিক্ষিকাদের বিশেষ টিম রুম',
    iconType: 'Smile',
    badgeBg: 'bg-sky-100',
    textColor: 'text-sky-800',
    memberIds: ['tch-1', 'tch-2', 'tch-3', 'tch-4', 'tch-5', 'dir-2'],
    memberCount: 6,
    isDefault: true,
  },
  {
    id: 'activity_lab',
    titleBn: 'আর্ট, ক্রাফট ও মন্টেসরি ল্যাব',
    subtitleBn: 'সৃজনশীল শিক্ষা উপকরণ, ড্রয়িং ও শিশু বিকাশ কার্যক্রম সমন্বয়',
    iconType: 'Palette',
    badgeBg: 'bg-purple-100',
    textColor: 'text-purple-800',
    memberIds: ['tch-1', 'tch-2', 'tch-3', 'tch-6', 'dir-5'],
    memberCount: 5,
    isDefault: true,
  },
];

export const STAFF_CHANNELS: StaffChannelMeta[] = DEFAULT_STAFF_CHANNELS;

export function getDirectRoomId(idA: string, idB: string): string {
  const sorted = [idA, idB].sort();
  return `direct_${sorted[0]}_${sorted[1]}`;
}

// ==========================================
// INITIAL SEED MESSAGES
// ==========================================

export const INITIAL_STAFF_MESSAGES: StaffInternalMessage[] = [
  // Channel: directors_board (Restricted: Directors & Principal Only)
  {
    id: 'dir-msg-1',
    roomId: 'directors_board',
    roomType: 'channel',
    roomNameBn: 'পরিচালনা পর্ষদ ফোরাম (Directors Lounge)',
    senderId: 'dir-4',
    senderNameBn: 'আল নোমান',
    senderRoleTitleBn: 'সভাপতি ও চেয়ারম্যান, পরিচালনা পর্ষদ',
    senderAvatarUrl: '/assets/fb/photo-3.jpg',
    text: 'সম্মানিত পরিচালনা পর্ষদ সদস্যবৃন্দ ও প্রিন্সিপাল মহোদয়, আসসালামু আলাইকুম। আগামী শিক্ষাবর্ষের বার্ষিক উন্নয়ন বাজেট, নতুন মন্টেসরি ক্লাসরুম সম্প্রসারণ ও শিক্ষক প্রশিক্ষণের খসড়া প্রস্তাবনা প্রস্তুত হয়েছে। আগামী শনিবারের বোর্ড সভায় এটি উপস্থাপন করা হবে।',
    actionType: 'emergency_briefing',
    actionDetails: {
      meetingTime: 'শনিবার সকাল ১১:০০',
      meetingTopic: 'বার্ষিক উন্নয়ন বাজেট ও মন্টেসরি অবকাঠামো আধুনিকায়ন পর্যালোচনা',
    },
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৯:০০',
    createdAt: 1794128400000,
    isPinned: true,
    reactions: {
      '👍': ['এম এস আই অনিক', 'শাফী আব্দুল্লাহ', 'মোস্তফা আল মামুন'],
      '👏': ['সাম্মী আক্তার'],
    },
  },
  {
    id: 'dir-msg-2',
    roomId: 'directors_board',
    roomType: 'channel',
    roomNameBn: 'পরিচালনা পর্ষদ ফোরাম (Directors Lounge)',
    senderId: 'tch-1',
    senderNameBn: 'শাফী আব্দুল্লাহ',
    senderRoleTitleBn: 'প্রিন্সিপাল (Principal)',
    senderAvatarUrl: '/assets/biddalay/shafee_abdullah.jpg',
    text: 'চেয়ারম্যান মহোদয়, একাডেমিক কাউন্সিলের পক্ষ থেকে নতুন মন্টেসরি শিক্ষা উপকরণ, মাল্টিমিডিয়া প্রজেক্টর ও আর্ট ল্যাবের চাহিদাপত্র ও অগ্রাধিকার তালিকা চূড়ান্ত করে সংযুক্ত করা হয়েছে। শিশুদের আনন্দের সাথে পাঠদানে এটি অত্যন্ত ফলপ্রসূ হবে।',
    actionType: 'chat',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৯:১৫',
    createdAt: 1794129300000,
    reactions: {
      '💡': ['আল নোমান', 'আলী আদনান'],
    },
  },
  {
    id: 'dir-msg-3',
    roomId: 'directors_board',
    roomType: 'channel',
    roomNameBn: 'পরিচালনা পর্ষদ ফোরাম (Directors Lounge)',
    senderId: 'dir-5',
    senderNameBn: 'এম এস আই অনিক',
    senderRoleTitleBn: 'সম্মানিত পরিচালক (Director)',
    senderAvatarUrl: '/assets/fb/photo-5.jpg',
    text: 'ধন্যবাদ প্রিন্সিপাল মহোদয়। শিশুদের ক্লাসরুম নিরাপত্তা নিশ্চিতকরণে আধুনিক সিসিটিভি ক্যামেরা বৃদ্ধি, সাউন্ডপ্রুফ সিলিং ও শীতকালীন শিশু উৎসবের ফান্ড বরাদ্দ রাখা হয়েছে। ইনশাআল্লাহ দ্রুত বাস্তবায়ন হবে।',
    actionType: 'chat',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৯:২৫',
    createdAt: 1794129900000,
    reactions: {
      '❤️': ['শাফী আব্দুল্লাহ', 'আল নোমান'],
    },
  },
  {
    id: 'dir-msg-4',
    roomId: 'directors_board',
    roomType: 'channel',
    roomNameBn: 'পরিচালনা পর্ষদ ফোরাম (Directors Lounge)',
    senderId: 'dir-3',
    senderNameBn: 'মোস্তফা আল মামুন',
    senderRoleTitleBn: 'সদস্য সচিব ও সুপার অ্যাডমিন',
    senderAvatarUrl: '/assets/biddalay/mostofa_mamun.jpg',
    text: 'পরিচালনা পর্ষদের সকল সদস্যের জন্য পূর্ণাঙ্গ অডিট ও পরিকল্পনা ড্রাফট সিস্টেমে আপলোড করা হয়েছে। শনিবারের সভায় সর্বসম্মত অনুমোদনের ব্যবস্থা নেওয়া হবে।',
    actionType: 'chat',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৯:৩৫',
    createdAt: 1794130500000,
  },

  // Channel: all_staff (General Lounge for All Staff + Directors)
  {
    id: 'smsg-1',
    roomId: 'all_staff',
    roomType: 'channel',
    roomNameBn: 'সকল শিক্ষক, স্টাফ ও পরিচালনা পরিষদ ফোরাম',
    senderId: 'tch-1',
    senderNameBn: 'শাফী আব্দুল্লাহ',
    senderRoleTitleBn: 'প্রিন্সিপাল (Principal)',
    senderAvatarUrl: '/assets/biddalay/shafee_abdullah.jpg',
    text: 'সুপ্রিয় সহকর্মী ও সম্মানিত পরিচালকবৃন্দ, আসসালামু আলাইকুম। আগামীকালের প্রাতঃকালীন অ্যাসেম্বলিতে শিশুদের বর্ণমালা ছড়া আবৃত্তি প্রতিযোগিতা অনুষ্ঠিত হবে। সংশ্লিষ্ট শ্রেণি শিক্ষিকাগণ শিক্ষার্থীদের প্রাক-প্রস্তুতি তদারকি করবেন।',
    actionType: 'emergency_briefing',
    actionDetails: {
      meetingTime: 'আগামীকাল সকাল ০৮:৪০',
      meetingTopic: 'প্রাতঃকালীন ছড়া আবৃত্তি প্রতিযোগিতা ও শৃঙ্খলা ব্রিফিং',
    },
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৮:৩০',
    createdAt: 1794126600000,
    isPinned: true,
    reactions: {
      '👍': ['ফাতেমা আক্তার', 'মোছাঃ মাহমুদা হক', 'মুক্তা পারভীন'],
    },
  },
  {
    id: 'smsg-2',
    roomId: 'all_staff',
    roomType: 'channel',
    roomNameBn: 'সকল শিক্ষক, স্টাফ ও পরিচালনা পরিষদ ফোরাম',
    senderId: 'tch-2',
    senderNameBn: 'ফাতেমা আক্তার',
    senderRoleTitleBn: 'প্রধান শিক্ষক (Head Teacher)',
    senderAvatarUrl: '/assets/biddalay/fatema_akter.jpg',
    text: 'জি স্যার, প্লে এবং নার্সারি শ্রেণির প্রস্তুতি সম্পন্ন হয়েছে। মুক্তা আপা হাতেখড়ির শিশুদের ছড়া রিহার্সাল করিয়ে দিচ্ছেন।',
    actionType: 'chat',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৮:৪৫',
    createdAt: 1794127500000,
  },
  {
    id: 'smsg-3',
    roomId: 'all_staff',
    roomType: 'channel',
    roomNameBn: 'সকল শিক্ষক, স্টাফ ও পরিচালনা পরিষদ ফোরাম',
    senderId: 'tch-5',
    senderNameBn: 'মুক্তা পারভীন',
    senderRoleTitleBn: 'সহকারী শিক্ষক (হাতেখড়ি)',
    senderAvatarUrl: '/assets/biddalay/mukta_parvin.jpg',
    text: 'সম্মানিত সহকর্মীবৃন্দ, আমার হঠাৎ জরুরি স্বাস্থ্য সমস্যার কারণে আজ ৩য় পিরিয়ডে (সকাল ১০:৫০ - ১১:৩০) হাতেখড়ি শ্রেণিতে প্রক্সি ক্লাস নেওয়া প্রয়োজন। কেউ কি অনুগ্রহ করে এই পিরিয়ডে ক্লাস নিতে পারবেন?',
    actionType: 'substitute_request',
    actionDetails: {
      substitute: {
        id: 'sub-101',
        requesterTeacherId: 'tch-5',
        requesterNameBn: 'মুক্তা পারভীন',
        className: 'HateKhori',
        periodLabelBn: '৩য় পিরিয়ড (সকাল ১০:৫০ - ১১:৩০)',
        subjectBn: 'হাতেখড়ি ও বর্ণমালা ছড়া',
        dateStr: 'আজ, ০৮ নভেম্বর',
        reasonBn: 'জরুরি স্বাস্থ্য সমস্যা',
        status: 'accepted',
        acceptedByTeacherId: 'tch-6',
        acceptedByTeacherNameBn: 'ঐশী বিনতে মোস্তফা (ঐশী মিস)',
        timestamp: 'সকাল ০৯:১৫',
      },
    },
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৯:০০',
    createdAt: 1794128400000,
  },
  {
    id: 'smsg-4',
    roomId: 'all_staff',
    roomType: 'channel',
    roomNameBn: 'সকল শিক্ষক, স্টাফ ও পরিচালনা পরিষদ ফোরাম',
    senderId: 'tch-6',
    senderNameBn: 'ঐশী বিনতে মোস্তফা (ঐশী মিস)',
    senderRoleTitleBn: 'সহকারী শিক্ষক (আর্ট ও ক্রাফট)',
    senderAvatarUrl: '/assets/biddalay/oaisy_mostofa.jpg',
    text: 'মুক্তা আপা, আমি ৩য় পিরিয়ডে আপনার হাতেখড়ি শ্রেণির বর্ণমালা ক্লাসের দায়িত্ব নিচ্ছি। আপনি বিশ্রাম নিন।',
    actionType: 'chat',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৯:১৫',
    createdAt: 1794129300000,
  },

  // Channel: preschool_wing
  {
    id: 'smsg-5',
    roomId: 'preschool_wing',
    roomType: 'channel',
    roomNameBn: 'প্রি-স্কুল ও নার্সারি উইং',
    senderId: 'tch-3',
    senderNameBn: 'মোছাঃ মাহমুদা হক (রিয়া মিস)',
    senderRoleTitleBn: 'সহকারী শিক্ষক (প্লে)',
    senderAvatarUrl: '/assets/biddalay/mahmuda_haque.jpg',
    text: 'আপারা, প্লে-গ্রুপের নতুন ব্ল্যাকবোর্ড ও রঙিন ফ্লাশকার্ডগুলো আজ খুব কাজে দিয়েছে। শিশুরা রঙের নামগুলো খুব দ্রুত শিখে নিচ্ছে।',
    actionType: 'chat',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ১০:২০',
    createdAt: 1794133200000,
  },
  {
    id: 'smsg-6',
    roomId: 'preschool_wing',
    roomType: 'channel',
    roomNameBn: 'প্রি-স্কুল ও নার্সারি উইং',
    senderId: 'tch-2',
    senderNameBn: 'ফাতেমা আক্তার',
    senderRoleTitleBn: 'প্রধান শিক্ষক',
    senderAvatarUrl: '/assets/biddalay/fatema_akter.jpg',
    text: 'চমৎকার মাহমুদা! নার্সারিতেও কালকে আমরা শেপ ও রঙের প্রাক্টিক্যাল গেম করাব। আর্ট রুম থেকে কিছু ক্লে-মডেলিং নিয়ে যাব।',
    actionType: 'chat',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ১০:৪৫',
    createdAt: 1794134700000,
  },

  // Channel: activity_lab
  {
    id: 'smsg-7',
    roomId: 'activity_lab',
    roomType: 'channel',
    roomNameBn: 'আর্ট, ক্রাফট ও মন্টেসরি ল্যাব',
    senderId: 'tch-6',
    senderNameBn: 'ঐশী বিনতে মোস্তফা',
    senderRoleTitleBn: 'ল্যাব কোঅর্ডিনেটর',
    senderAvatarUrl: '/assets/biddalay/oaisy_mostofa.jpg',
    text: 'অফিস ও স্টোর ইনচার্জের দৃষ্টি আকর্ষণ করছি: আগামী সপ্তাহের পেপার-ক্রাফট ইভেন্টের জন্য ৫০টি রঙিন আর্ট পেপার ও আঠার রিকুইজিশন প্রদান করা হলো।',
    actionType: 'resource_requisition',
    actionDetails: {
      requisitionItems: [
        '৫০টি রঙিন আর্ট পেপার (A4 সাইজ)',
        '১০টি নিরাপদ শিশু-বান্ধব গ্লু স্টিক',
        '৫ বক্স শিশুদের ওয়াটার কালার',
      ],
    },
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ১১:১০',
    createdAt: 1794136200000,
  },

  // 1-on-1 Direct Chat: Principal (tch-1) <-> Head Teacher (tch-2)
  {
    id: 'smsg-8',
    roomId: getDirectRoomId('tch-1', 'tch-2'),
    roomType: 'direct',
    roomNameBn: 'শাফী আব্দুল্লাহ ও ফাতেমা আক্তার',
    senderId: 'tch-1',
    senderNameBn: 'শাফী আব্দুল্লাহ',
    senderRoleTitleBn: 'প্রিন্সিপাল',
    senderAvatarUrl: '/assets/biddalay/shafee_abdullah.jpg',
    receiverId: 'tch-2',
    receiverNameBn: 'ফাতেমা আক্তার',
    text: 'ফাতেমা আপা, চলতি সপ্তাহের শিক্ষক হাজিরা এবং ক্লাস রুটিন অগ্রগতি কি ঠিকঠাক আছে? আজকের পর একটু সামারি আপডেট দেবেন।',
    actionType: 'chat',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৯:০০',
    createdAt: 1794128400000,
  },
  {
    id: 'smsg-9',
    roomId: getDirectRoomId('tch-1', 'tch-2'),
    roomType: 'direct',
    roomNameBn: 'শাফী আব্দুল্লাহ ও ফাতেমা আক্তার',
    senderId: 'tch-2',
    senderNameBn: 'ফাতেমা আক্তার',
    senderRoleTitleBn: 'প্রধান শিক্ষক',
    senderAvatarUrl: '/assets/biddalay/fatema_akter.jpg',
    receiverId: 'tch-1',
    receiverNameBn: 'শাফী আব্দুল্লাহ',
    text: 'জি স্যার, আলহামদুলিল্লাহ সব শিক্ষকের ডিজিটাল চেক-ইন সম্পূর্ণ হয়েছে এবং উপস্থিতি ৯৫%। ছুটির পর পূর্ণাঙ্গ উইকলি রিপোর্ট প্রিন্ট করে দিচ্ছি।',
    actionType: 'chat',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৯:২০',
    createdAt: 1794129600000,
  },
];

// ==========================================
// MESSAGE PERSISTENCE & ACTIONS
// ==========================================

export function getStoredStaffMessages(): StaffInternalMessage[] {
  try {
    const raw = localStorage.getItem(STAFF_CHAT_STORAGE_KEY);
    if (!raw) {
      // Check legacy v1 key if migrating
      const legacyRaw = localStorage.getItem('ananda_staff_internal_messages_v1');
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
          // Merge directors_board seed messages with legacy messages
          const dirSeedMsgs = INITIAL_STAFF_MESSAGES.filter((m) => m.roomId === 'directors_board');
          const merged = [...dirSeedMsgs, ...legacyParsed];
          localStorage.setItem(STAFF_CHAT_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      }
      localStorage.setItem(STAFF_CHAT_STORAGE_KEY, JSON.stringify(INITIAL_STAFF_MESSAGES));
      return INITIAL_STAFF_MESSAGES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Check if directors_board messages exist, if not merge them
      const hasDirBoard = parsed.some((m: StaffInternalMessage) => m.roomId === 'directors_board');
      if (!hasDirBoard) {
        const dirSeedMsgs = INITIAL_STAFF_MESSAGES.filter((m) => m.roomId === 'directors_board');
        const updated = [...dirSeedMsgs, ...parsed];
        localStorage.setItem(STAFF_CHAT_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to read staff messages from localStorage:', err);
  }
  return INITIAL_STAFF_MESSAGES;
}

export function saveStaffInternalMessage(
  msg: Omit<StaffInternalMessage, 'id' | 'createdAt'>
): StaffInternalMessage {
  const currentList = getStoredStaffMessages();
  const now = Date.now();
  const newMsg: StaffInternalMessage = {
    ...msg,
    id: `smsg-${now}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: now,
  };

  const updatedList = [...currentList, newMsg];
  try {
    localStorage.setItem(STAFF_CHAT_STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent(STAFF_CHAT_STORAGE_EVENT, { detail: newMsg }));
  } catch (err) {
    console.error('Failed to save staff message to localStorage:', err);
  }

  return newMsg;
}

// Note: In accordance with school audit policy, sent messages/texts are permanent & immutable and cannot be edited by anyone.


/**
 * Delete a message from the room.
 * Only Principal or Admin can delete messages.
 */
export function deleteStaffInternalMessage(messageId: string): boolean {
  const currentList = getStoredStaffMessages();
  const updatedList = currentList.filter((m) => m.id !== messageId);
  if (updatedList.length === currentList.length) return false;

  try {
    localStorage.setItem(STAFF_CHAT_STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent(STAFF_CHAT_STORAGE_EVENT, { detail: { messageId, action: 'deleted' } }));
  } catch (err) {
    console.error('Failed to delete staff message from localStorage:', err);
  }

  return true;
}

/**
 * Toggle pin/unpin status of a message.
 * Only Principal or Admin can pin/unpin messages.
 */
export function togglePinStaffMessage(messageId: string): boolean {
  const currentList = getStoredStaffMessages();
  let found = false;

  const updatedList = currentList.map((m) => {
    if (m.id === messageId) {
      found = true;
      return {
        ...m,
        isPinned: !m.isPinned,
      };
    }
    return m;
  });

  if (found) {
    try {
      localStorage.setItem(STAFF_CHAT_STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent(STAFF_CHAT_STORAGE_EVENT, { detail: { messageId, action: 'pinned' } }));
    } catch (err) {
      console.error('Failed to toggle pinned status in localStorage:', err);
    }
  }

  return found;
}

/**
 * Add or remove an emoji reaction to a message.
 */
export function toggleStaffMessageReaction(
  messageId: string,
  emoji: string,
  userNameBn: string
): boolean {
  const currentList = getStoredStaffMessages();
  let found = false;

  const updatedList = currentList.map((m) => {
    if (m.id === messageId) {
      found = true;
      const reactions = { ...(m.reactions || {}) };
      const currentUsers = reactions[emoji] || [];

      if (currentUsers.includes(userNameBn)) {
        // remove
        reactions[emoji] = currentUsers.filter((u) => u !== userNameBn);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      } else {
        // add
        reactions[emoji] = [...currentUsers, userNameBn];
      }

      return {
        ...m,
        reactions,
      };
    }
    return m;
  });

  if (found) {
    try {
      localStorage.setItem(STAFF_CHAT_STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent(STAFF_CHAT_STORAGE_EVENT, { detail: { messageId, action: 'reaction' } }));
    } catch (err) {
      console.error('Failed to toggle reaction in localStorage:', err);
    }
  }

  return found;
}

export function acceptStaffSubstituteRequest(
  messageId: string,
  acceptingTeacherId: string,
  acceptingTeacherNameBn: string
): boolean {
  const currentList = getStoredStaffMessages();
  let found = false;

  const updatedList = currentList.map((m) => {
    if (m.id === messageId && m.actionDetails?.substitute) {
      found = true;
      return {
        ...m,
        actionDetails: {
          ...m.actionDetails,
          substitute: {
            ...m.actionDetails.substitute,
            status: 'accepted' as const,
            acceptedByTeacherId: acceptingTeacherId,
            acceptedByTeacherNameBn: acceptingTeacherNameBn,
          },
        },
      };
    }
    return m;
  });

  if (found) {
    try {
      localStorage.setItem(STAFF_CHAT_STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent(STAFF_CHAT_STORAGE_EVENT, { detail: { messageId } }));
    } catch (err) {
      console.error('Failed to update substitute status in localStorage:', err);
    }
  }

  return found;
}

// ==========================================
// CHANNEL / ROOM MANAGEMENT LOGIC
// ==========================================

export function getStoredStaffChannels(): StaffChannelMeta[] {
  try {
    const raw = localStorage.getItem(STAFF_CHANNELS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure directors_board exists
        let channelsList: StaffChannelMeta[] = [...parsed];
        const hasDirectorsBoard = channelsList.some((c) => c.id === 'directors_board');
        if (!hasDirectorsBoard) {
          const dirBoardMeta = DEFAULT_STAFF_CHANNELS.find((d) => d.id === 'directors_board')!;
          channelsList = [dirBoardMeta, ...channelsList];
          saveStaffChannels(channelsList);
        }

        return channelsList.map((ch: StaffChannelMeta) => {
          if (!ch.memberIds || !Array.isArray(ch.memberIds) || ch.memberIds.length === 0) {
            const defMatch = DEFAULT_STAFF_CHANNELS.find((d) => d.id === ch.id);
            const memberIds = defMatch?.memberIds || ['tch-1', 'tch-2', 'tch-3', 'tch-4'];
            return {
              ...ch,
              memberIds,
              memberCount: memberIds.length,
            };
          }
          return {
            ...ch,
            memberCount: ch.memberIds.length,
          };
        });
      }
    }
  } catch (err) {
    console.error('Failed to read staff channels from localStorage:', err);
  }
  return DEFAULT_STAFF_CHANNELS;
}

export function saveStaffChannels(channels: StaffChannelMeta[]): void {
  try {
    localStorage.setItem(STAFF_CHANNELS_STORAGE_KEY, JSON.stringify(channels));
    window.dispatchEvent(new CustomEvent(STAFF_CHANNELS_STORAGE_EVENT, { detail: channels }));
  } catch (err) {
    console.error('Failed to save staff channels to localStorage:', err);
  }
}

export function createStaffChannel(channel: Omit<StaffChannelMeta, 'id'>): StaffChannelMeta {
  const currentList = getStoredStaffChannels();
  const newChan: StaffChannelMeta = {
    ...channel,
    id: `chan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now(),
  };

  const updatedList = [...currentList, newChan];
  saveStaffChannels(updatedList);
  return newChan;
}

export function updateStaffChannel(
  id: string,
  updates: Partial<Omit<StaffChannelMeta, 'id'>>
): boolean {
  const currentList = getStoredStaffChannels();
  let found = false;
  let oldTitle = '';

  const updatedList = currentList.map((ch) => {
    if (ch.id === id) {
      found = true;
      oldTitle = ch.titleBn;
      return { ...ch, ...updates };
    }
    return ch;
  });

  if (found) {
    saveStaffChannels(updatedList);

    // If title was updated, also update any stored messages in this room to keep roomNameBn in sync
    if (updates.titleBn && updates.titleBn !== oldTitle) {
      try {
        const msgs = getStoredStaffMessages();
        const updatedMsgs = msgs.map((m) =>
          m.roomId === id ? { ...m, roomNameBn: updates.titleBn! } : m
        );
        localStorage.setItem(STAFF_CHAT_STORAGE_KEY, JSON.stringify(updatedMsgs));
        window.dispatchEvent(new CustomEvent(STAFF_CHAT_STORAGE_EVENT, { detail: { roomId: id } }));
      } catch (e) {
        console.error('Failed to update roomNameBn in messages:', e);
      }
    }
  }

  return found;
}

export function deleteStaffChannel(id: string): boolean {
  const currentList = getStoredStaffChannels();
  // Prevent deleting default critical channels
  if (id === 'directors_board' || id === 'all_staff') {
    return false;
  }
  const updatedList = currentList.filter((ch) => ch.id !== id);
  if (updatedList.length === currentList.length) return false;

  saveStaffChannels(updatedList);
  return true;
}

export function resetStaffChannelsToDefault(): StaffChannelMeta[] {
  saveStaffChannels(DEFAULT_STAFF_CHANNELS);
  return DEFAULT_STAFF_CHANNELS;
}
