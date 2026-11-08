import { ParentTeacherMessage, MessageCategory, UserRole, SchoolClass, FcmNotification } from '../types/school';

export const DIRECT_CHAT_STORAGE_KEY = 'ananda_parent_teacher_messages_v1';
export const DIRECT_CHAT_STORAGE_EVENT = 'ananda-direct-chat-updated';

export interface MessageCategoryMeta {
  id: MessageCategory;
  labelBn: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  iconType: string;
}

export const MESSAGE_CATEGORIES_META: Record<MessageCategory, MessageCategoryMeta> = {
  general: {
    id: 'general',
    labelBn: 'সাধারণ বার্তা',
    badgeBg: 'bg-slate-100',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-300',
    iconType: 'MessageSquare',
  },
  daily_mood: {
    id: 'daily_mood',
    labelBn: 'আচরণ ও মেজাজ',
    badgeBg: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    iconType: 'Smile',
  },
  tiffin_health: {
    id: 'tiffin_health',
    labelBn: 'টিফিন ও স্বাস্থ্য',
    badgeBg: 'bg-rose-50',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-300',
    iconType: 'Heart',
  },
  homework_study: {
    id: 'homework_study',
    labelBn: 'পড়ালেখা ও কাজ',
    badgeBg: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    iconType: 'BookOpen',
  },
  late_pickup_note: {
    id: 'late_pickup_note',
    labelBn: 'দেরি বা পিক-আপ',
    badgeBg: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
    iconType: 'Clock',
  },
  medication_care: {
    id: 'medication_care',
    labelBn: 'ওষুধ ও যত্ন',
    badgeBg: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
    iconType: 'ShieldAlert',
  },
};

export const QUICK_PARENT_TEMPLATES = [
  {
    category: 'tiffin_health' as MessageCategory,
    text: 'বাচ্চা আজ সকালে কিছুটা অসুস্থ ছিল, দয়া করে ক্লাসে একটু বিশেষ নজর রাখবেন।',
  },
  {
    category: 'late_pickup_note' as MessageCategory,
    text: 'আজ সকালে পারিবারিক প্রয়োজনে স্কুলে পৌঁছাতে কিছুটা বিলম্ব হতে পারে (আনুমানিক সকাল ০৯:১৫)।',
  },
  {
    category: 'late_pickup_note' as MessageCategory,
    text: 'আজ ছুটির সময় ওর নানা/অভিভাবক এসে নিয়ে যাবেন (অনুমোদিত গেট-পাস কার্ড সাথে থাকবে)।',
  },
  {
    category: 'medication_care' as MessageCategory,
    text: 'দুপুরের টিফিনের পর শিশুর এক চামচ নির্ধারিত সিরাপ খাওয়ানোর বিনীত অনুরোধ রইল।',
  },
  {
    category: 'homework_study' as MessageCategory,
    text: 'আজকের বর্ণমালা লেখার বাড়ির কাজটি বুঝতে ওর একটু কষ্ট হচ্ছিল, ক্লাসে একটু বুঝিয়ে দিলে ভালো হতো।',
  },
  {
    category: 'general' as MessageCategory,
    text: 'আসসালামু আলাইকুম আপা, ক্লাসে ওর আজকের অংশগ্রহণ ও আচরণ কেমন ছিল জানাবেন কি?',
  },
];

export const QUICK_TEACHER_TEMPLATES = [
  {
    category: 'daily_mood' as MessageCategory,
    text: 'মাশাল্লাহ! আদিত্য আজ পুরোটা ক্লাসে অনেক হাসিখুশি ছিল এবং বন্ধুদের সাথে দলগত খেলায় চমৎকার অংশ নিয়েছে।',
  },
  {
    category: 'homework_study' as MessageCategory,
    text: 'আজকের ক্লাসে বর্ণমালা হাত ঘুরিয়ে লেখার কাজটি ও খুব মনোযোগ সহকারে এবং নির্ভুলভাবে সম্পন্ন করেছে।',
  },
  {
    category: 'tiffin_health' as MessageCategory,
    text: 'টিফিনের পুরো খাবার ও আগ্রহ নিয়ে শেষ করেছে। ওর পর্যাপ্ত পানি পান নিশ্চিত করা হয়েছে।',
  },
  {
    category: 'daily_mood' as MessageCategory,
    text: 'আজকের ড্রয়িং ও ক্লে-মডেলিং কার্যক্রমে ও অসাধারণ একটি ফুল বানিয়েছে, ওর এই সৃজনশীলতার প্রশংসা করবেন।',
  },
  {
    category: 'general' as MessageCategory,
    text: 'ধন্যবাদ আপনার সুন্দর ফিডব্যাকের জন্য। আমরা শ্রেণিকক্ষে প্রতিটি শিশুর সুরক্ষায় সর্বোচ্চ যত্নশীল।',
  },
];

export const INITIAL_PARENT_TEACHER_MESSAGES: ParentTeacherMessage[] = [
  // Child: আদিত্য রায় (Nursery - std-1)
  {
    id: 'msg-101',
    studentId: 'std-1',
    studentNameBn: 'আদিত্য রায়',
    className: 'Nursery',
    senderRole: 'parent',
    senderNameBn: 'সুব্রত রায় (পিতা)',
    receiverRole: 'teacher',
    receiverNameBn: 'ফাতেমা আক্তার (শ্রেণি শিক্ষক)',
    text: 'নমস্কার দিদি, আদিত্য আজ সকালে সামান্য সর্দি ভাব অনুভব করছিল। দয়া করে ক্লাসে ঠান্ডা পানি খেতে দেবেন না।',
    category: 'tiffin_health',
    categoryLabelBn: 'টিফিন ও স্বাস্থ্য',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৮:১৫',
    createdAt: 1794125700000,
    isRead: true,
    readAt: 'সকাল ০৮:২০',
  },
  {
    id: 'msg-102',
    studentId: 'std-1',
    studentNameBn: 'আদিত্য রায়',
    className: 'Nursery',
    senderRole: 'teacher',
    senderNameBn: 'ফাতেমা আক্তার (শ্রেণি শিক্ষক)',
    senderAvatarUrl: '/assets/biddalay/fatema_akter.jpg',
    receiverRole: 'parent',
    receiverNameBn: 'সুব্রত রায় (পিতা)',
    text: 'নমস্কার দাদা। একদম চিন্তা করবেন না, ওর জন্য ক্লাসরুমে হালকা কুসুম গরম পানির ব্যবস্থা করেছি এবং এখন ও সম্পূর্ণ স্বাভাবিকভাবে ড্রয়িং করছে।',
    category: 'tiffin_health',
    categoryLabelBn: 'টিফিন ও স্বাস্থ্য',
    photoUrl: '/assets/fb/photo-3.jpg',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ১০:৩০',
    createdAt: 1794133800000,
    isRead: true,
    readAt: 'সকাল ১০:৩৫',
  },
  {
    id: 'msg-103',
    studentId: 'std-1',
    studentNameBn: 'আদিত্য রায়',
    className: 'Nursery',
    senderRole: 'teacher',
    senderNameBn: 'ফাতেমা আক্তার (শ্রেণি শিক্ষক)',
    senderAvatarUrl: '/assets/biddalay/fatema_akter.jpg',
    receiverRole: 'parent',
    receiverNameBn: 'সুব্রত রায় (পিতা)',
    text: 'আজ আদিত্য নিজের টিফিন পুরোটা শেষ করেছে এবং বন্ধুদের সাথে বর্ণমালার কার্ড খেলায় ১ম হয়েছে! ওর আজকের পারফরম্যান্স দারুণ ছিল। ⭐',
    category: 'daily_mood',
    categoryLabelBn: 'আচরণ ও মেজাজ',
    timestamp: '০৮ নভেম্বর ২০২৬, দুপুর ১২:১৫',
    createdAt: 1794140100000,
    isRead: false,
  },

  // Child: তানিশা ইসলাম (HateKhori - std-0)
  {
    id: 'msg-104',
    studentId: 'std-0',
    studentNameBn: 'তানিশা ইসলাম',
    className: 'HateKhori',
    senderRole: 'parent',
    senderNameBn: 'রাশেদুল ইসলাম (অভিভাবক)',
    receiverRole: 'teacher',
    receiverNameBn: 'মুক্তা পারভীন (হাতেখড়ি শিক্ষক)',
    text: 'আসসালামু আলাইকুম আপা, তানিশা আজ রঙিন কাঠি দিয়ে ১ থেকে ৫ পর্যন্ত চমৎকারভাবে সাজিয়েছে বাসায়। ওর আগ্রহ বাড়ছে।',
    category: 'homework_study',
    categoryLabelBn: 'পড়ালেখা ও কাজ',
    timestamp: '০৭ নভেম্বর ২০২৬, বিকাল ০৪:১০',
    createdAt: 1794067800000,
    isRead: true,
  },
  {
    id: 'msg-105',
    studentId: 'std-0',
    studentNameBn: 'তানিশা ইসলাম',
    className: 'HateKhori',
    senderRole: 'teacher',
    senderNameBn: 'মুক্তা পারভীন (হাতেখড়ি শিক্ষক)',
    senderAvatarUrl: '/assets/biddalay/mukta_parvin.jpg',
    receiverRole: 'parent',
    receiverNameBn: 'রাশেদুল ইসলাম (অভিভাবক)',
    text: 'ওয়ালাইকুম আসসালাম ভাইয়া। তানিশা খুব মনোযোগী শিশু। কালকে ক্লাসে ওকে আমরা ছড়ার সাথে অভিনয় শেখাব। সাথে একটি রঙিন রুমাল দেবেন।',
    category: 'homework_study',
    categoryLabelBn: 'পড়ালেখা ও কাজ',
    timestamp: '০৭ নভেম্বর ২০২৬, বিকাল ০৫:০০',
    createdAt: 1794070800000,
    isRead: true,
  },

  // Child: সুমাইয়া জাহান (Playgroup - std-2)
  {
    id: 'msg-106',
    studentId: 'std-2',
    studentNameBn: 'সুমাইয়া জাহান',
    className: 'Playgroup',
    senderRole: 'parent',
    senderNameBn: 'আহসান হাবীব (পিতা)',
    receiverRole: 'teacher',
    receiverNameBn: 'মোছাঃ মাহমুদা হক (রিয়া মিস)',
    text: 'ম্যাডাম, আজ ছুটির সময় সুমাইয়ার ফুফু ওকে নিতে যাবেন। উনার গেট-পাস কিউআর কার্ড আগেই আপডেট করা আছে।',
    category: 'late_pickup_note',
    categoryLabelBn: 'দেরি বা পিক-আপ',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৯:০০',
    createdAt: 1794128400000,
    isRead: true,
  },
  {
    id: 'msg-107',
    studentId: 'std-2',
    studentNameBn: 'সুমাইয়া জাহান',
    className: 'Playgroup',
    senderRole: 'teacher',
    senderNameBn: 'মোছাঃ মাহমুদা হক (রিয়া মিস)',
    senderAvatarUrl: '/assets/biddalay/mahmuda_haque.jpg',
    receiverRole: 'parent',
    receiverNameBn: 'আহসান হাবীব (পিতা)',
    text: 'জি ভাইয়া, নোটটি রেকর্ড করে রেখেছি। গেট সিকিউরিটিতে কিউআর স্ক্যান করে আপার কাছে নিরাপদে হ্যান্ডওভার করা হবে।',
    category: 'late_pickup_note',
    categoryLabelBn: 'দেরি বা পিক-আপ',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৯:৩০',
    createdAt: 1794130200000,
    isRead: true,
  },

  // Child: আরিয়ান খান (KG-1 - std-3)
  {
    id: 'msg-108',
    studentId: 'std-3',
    studentNameBn: 'আরিয়ান খান',
    className: 'KG-1',
    senderRole: 'teacher',
    senderNameBn: 'ঐশী বিনতে মোস্তফা (শিক্ষক)',
    senderAvatarUrl: '/assets/biddalay/oaisy_mostofa.jpg',
    receiverRole: 'parent',
    receiverNameBn: 'কামরুল হাসান (পিতা)',
    text: 'সম্মানিত অভিভাবক, আরিয়ান আজ গণিত ক্লাসে ১০ পর্যন্ত যোগ-বিয়োগের কার্ড খেলায় চমৎকার করেছে! ওর জন্য শুভকামনা।',
    category: 'homework_study',
    categoryLabelBn: 'পড়ালেখা ও কাজ',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ১১:৪৫',
    createdAt: 1794138300000,
    isRead: false,
  },

  // Child: জারা তাবাসসুম (KG-2 - std-4)
  {
    id: 'msg-109',
    studentId: 'std-4',
    studentNameBn: 'জারা তাবাসসুম',
    className: 'KG-2',
    senderRole: 'parent',
    senderNameBn: 'সুলতানা পারভীন (মাতা)',
    receiverRole: 'teacher',
    receiverNameBn: 'সৈয়দ ফাহমিদ বিন নূর (শিক্ষক)',
    text: 'স্যার, জারা আজ সকালে কিছুটা দেরিতে ঘুম থেকে ওঠায় সকাল ০৯:১০ মিনিটে স্কুলে পৌঁছাবে। অনুগ্রহ করে ক্লাসে প্রবেশ করতে দেবেন।',
    category: 'late_pickup_note',
    categoryLabelBn: 'দেরি বা পিক-আপ',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৮:৪০',
    createdAt: 1794127200000,
    isRead: true,
  },
  {
    id: 'msg-110',
    studentId: 'std-4',
    studentNameBn: 'জারা তাবাসসুম',
    className: 'KG-2',
    senderRole: 'teacher',
    senderNameBn: 'সৈয়দ ফাহমিদ বিন নূর (শিক্ষক)',
    senderAvatarUrl: '/assets/biddalay/syed_fhamid.jpg',
    receiverRole: 'parent',
    receiverNameBn: 'সুলতানা পারভীন (মাতা)',
    text: 'অবশ্যই আপা, নো প্রবলেম। জারা ক্লাসে এসে স্বাভাবিকভাবেই বন্ধুদের সাথে যোগ দিয়েছে।',
    category: 'general',
    categoryLabelBn: 'সাধারণ বার্তা',
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৯:১৫',
    createdAt: 1794129300000,
    isRead: true,
  },
];

export function getStoredDirectChatMessages(): ParentTeacherMessage[] {
  try {
    const raw = localStorage.getItem(DIRECT_CHAT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DIRECT_CHAT_STORAGE_KEY, JSON.stringify(INITIAL_PARENT_TEACHER_MESSAGES));
      return INITIAL_PARENT_TEACHER_MESSAGES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to read direct chat messages from localStorage:', err);
  }
  return INITIAL_PARENT_TEACHER_MESSAGES;
}

export function saveDirectChatMessage(
  message: Omit<ParentTeacherMessage, 'id' | 'createdAt'>
): ParentTeacherMessage {
  const currentList = getStoredDirectChatMessages();
  const now = Date.now();
  const newMsg: ParentTeacherMessage = {
    ...message,
    id: `msg-${now}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: now,
  };

  const updatedList = [...currentList, newMsg];
  try {
    localStorage.setItem(DIRECT_CHAT_STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent(DIRECT_CHAT_STORAGE_EVENT, { detail: newMsg }));
  } catch (err) {
    console.error('Failed to save message to localStorage:', err);
  }

  return newMsg;
}

export function markStudentMessagesAsRead(
  studentId: string,
  readerRole: 'parent' | 'teacher' | 'principal'
): void {
  const currentList = getStoredDirectChatMessages();
  let modified = false;

  const updatedList = currentList.map((m) => {
    if (m.studentId === studentId && !m.isRead) {
      // If parent is reading, mark teacher/principal messages as read
      if (readerRole === 'parent' && m.senderRole !== 'parent') {
        modified = true;
        return { ...m, isRead: true, readAt: 'দেখা হয়েছে' };
      }
      // If teacher/principal is reading, mark parent messages as read
      if ((readerRole === 'teacher' || readerRole === 'principal') && m.senderRole === 'parent') {
        modified = true;
        return { ...m, isRead: true, readAt: 'দেখা হয়েছে' };
      }
    }
    return m;
  });

  if (modified) {
    try {
      localStorage.setItem(DIRECT_CHAT_STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent(DIRECT_CHAT_STORAGE_EVENT, { detail: { studentId } }));
    } catch (err) {
      console.error('Failed to update read status in localStorage:', err);
    }
  }
}

export function getUnreadMessagesCount(
  messages: ParentTeacherMessage[],
  role: UserRole,
  studentId?: string,
  assignedClass?: SchoolClass
): number {
  if (role === 'parent') {
    // Count unread messages sent by teachers/principals for this parent's child
    return messages.filter(
      (m) => (!studentId || m.studentId === studentId) && m.senderRole !== 'parent' && !m.isRead
    ).length;
  }

  if (role === 'teacher') {
    // Count unread messages from parents in teacher's assigned class
    return messages.filter((m) => {
      const isFromParent = m.senderRole === 'parent';
      const isUnread = !m.isRead;
      const classMatch = assignedClass ? m.className === assignedClass : true;
      return isFromParent && isUnread && classMatch;
    }).length;
  }

  if (role === 'principal' || role === 'super_admin' || role === 'director') {
    // Count all unread messages from parents across school
    return messages.filter((m) => m.senderRole === 'parent' && !m.isRead).length;
  }

  return 0;
}

export function createDirectMessageFcmPayload(
  msg: ParentTeacherMessage,
  targetRole: 'parent' | 'teacher' | 'principal' = 'parent'
): FcmNotification {
  const isFromParent = msg.senderRole === 'parent';
  const titleBn = isFromParent
    ? `💬 ${msg.studentNameBn}-এর অভিভাবকের নতুন বার্তা`
    : `💬 শ্রেণি শিক্ষকের সরাসরি বার্তা (${msg.studentNameBn})`;

  const prefix = msg.categoryLabelBn ? `[${msg.categoryLabelBn}] ` : '';

  return {
    id: `notif-chat-${Date.now()}`,
    type: 'parent_teacher_message',
    priority: msg.isUrgent ? 'urgent' : 'high',
    titleBn,
    bodyBn: `${prefix}${msg.text.slice(0, 85)}${msg.text.length > 85 ? '...' : ''}`,
    targetRole,
    studentOrApplicantNameBn: msg.studentNameBn,
    className: msg.className,
    guardianNameBn: isFromParent ? msg.senderNameBn : msg.receiverNameBn,
    timestamp: msg.timestamp,
    read: false,
    actionTab: 'messages',
    fcmMessageId: `fcm-chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };
}
