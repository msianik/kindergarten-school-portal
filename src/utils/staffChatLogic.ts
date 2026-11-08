import { StaffInternalMessage, StaffRoomType, StaffActionType, StaffSubstituteRequest, SchoolClass } from '../types/school';
import { SCHOOL_TEACHERS } from '../data/mockData';

export const STAFF_CHAT_STORAGE_KEY = 'ananda_staff_internal_messages_v1';
export const STAFF_CHAT_STORAGE_EVENT = 'ananda-staff-chat-updated';

export interface StaffChannelMeta {
  id: string;
  titleBn: string;
  subtitleBn: string;
  iconType: string;
  badgeBg: string;
  textColor: string;
  memberCount: number;
}

export const STAFF_CHANNELS: StaffChannelMeta[] = [
  {
    id: 'all_staff',
    titleBn: 'শিক্ষক কমনরুম ও স্টাফ লাউঞ্জ',
    subtitleBn: 'স্কুলের সকল শিক্ষক, প্রিন্সিপাল ও স্টাফদের মূল অফিসিয়াল ফোরাম',
    iconType: 'Building2',
    badgeBg: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    memberCount: 8,
  },
  {
    id: 'preschool_wing',
    titleBn: 'প্রি-স্কুল ও নার্সারি উইং',
    subtitleBn: 'হাতেখড়ি, প্লে ও নার্সারি ক্লাসের শিক্ষিকাদের বিশেষ টিম রুম',
    iconType: 'Smile',
    badgeBg: 'bg-amber-100',
    textColor: 'text-amber-800',
    memberCount: 4,
  },
  {
    id: 'activity_lab',
    titleBn: 'আর্ট, ক্রাফট ও মন্টেসরি ল্যাব',
    subtitleBn: 'সৃজনশীল শিক্ষা উপকরণ, ড্রয়িং ও শিশু বিকাশ কার্যক্রম সমন্বয়',
    iconType: 'Palette',
    badgeBg: 'bg-purple-100',
    textColor: 'text-purple-800',
    memberCount: 3,
  },
];

export function getDirectRoomId(idA: string, idB: string): string {
  const sorted = [idA, idB].sort();
  return `direct_${sorted[0]}_${sorted[1]}`;
}

export const INITIAL_STAFF_MESSAGES: StaffInternalMessage[] = [
  // Channel: all_staff (General Lounge)
  {
    id: 'smsg-1',
    roomId: 'all_staff',
    roomType: 'channel',
    roomNameBn: 'শিক্ষক কমনরুম ও স্টাফ লাউঞ্জ',
    senderId: 'tch-1',
    senderNameBn: 'শাফী আব্দুল্লাহ',
    senderRoleTitleBn: 'প্রিন্সিপাল (Principal)',
    senderAvatarUrl: '/assets/biddalay/shafee_abdullah.jpg',
    text: 'সুপ্রিয় সহকর্মীগণ, আসসালামু আলাইকুম। আগামীকালের প্রাতঃকালীন অ্যাসেম্বলিতে শিশুদের বর্ণমালা ছড়া আবৃত্তি প্রতিযোগিতা অনুষ্ঠিত হবে। সংশ্লিষ্ট শ্রেণি শিক্ষিকাগণ শিক্ষার্থীদের প্রাক-প্রস্তুতি তদারকি করবেন।',
    actionType: 'emergency_briefing',
    actionDetails: {
      meetingTime: 'আগামীকাল সকাল ০৮:৪০',
      meetingTopic: 'প্রাতঃকালীন ছড়া আবৃত্তি প্রতিযোগিতা ও শৃঙ্খলা ব্রিফিং',
    },
    timestamp: '০৮ নভেম্বর ২০২৬, সকাল ০৮:৩০',
    createdAt: 1794126600000,
    isPinned: true,
  },
  {
    id: 'smsg-2',
    roomId: 'all_staff',
    roomType: 'channel',
    roomNameBn: 'শিক্ষক কমনরুম ও স্টাফ লাউঞ্জ',
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
    roomNameBn: 'শিক্ষক কমনরুম ও স্টাফ লাউঞ্জ',
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
    roomNameBn: 'শিক্ষক কমনরুম ও স্টাফ লাউঞ্জ',
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

export function getStoredStaffMessages(): StaffInternalMessage[] {
  try {
    const raw = localStorage.getItem(STAFF_CHAT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STAFF_CHAT_STORAGE_KEY, JSON.stringify(INITIAL_STAFF_MESSAGES));
      return INITIAL_STAFF_MESSAGES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
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
