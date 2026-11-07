import React, { useState, useRef, useMemo } from 'react';
import { ActivityPost, SchoolClass, ActivityType, ChildMood, UserRole, FcmNotification } from '../types/school';
import { ALL_SCHOOL_CLASSES, isSameSchoolClass, getSchoolClassNameBn, toBengaliNumber } from '../utils/schoolLogic';
import { 
  BookOpen, 
  Plus, 
  Heart, 
  MessageSquare, 
  Volume2, 
  Sparkles, 
  Smile, 
  Apple, 
  Palette, 
  Music, 
  Send,
  Coffee,
  CheckCircle2,
  Calendar,
  Clock,
  BellRing,
  BookMarked,
  FileText,
  AlertCircle,
  Camera,
  Smartphone,
  Trash2,
  ArrowUpDown,
  Image as ImageIcon
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';

const BN_MONTHS_MAP: Record<string, number> = {
  জানুয়ারি: 0,
  ফেব্রুয়ারি: 1,
  মার্চ: 2,
  এপ্রিল: 3,
  মে: 4,
  জুন: 5,
  জুলাই: 6,
  আগস্ট: 7,
  সেপ্টেম্বর: 8,
  অক্টোবর: 9,
  নভেম্বর: 10,
  ডিসেম্বর: 11,
};

const normalizeBengaliDigits = (str: string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)));
};

export const parseActivityPostTimestamp = (post: ActivityPost): number => {
  const dateStr = post.dateStr || '';
  const timeStr = post.timeStr || '';
  const normalizedDateStr = normalizeBengaliDigits(dateStr);

  const yearMatch = normalizedDateStr.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;

  let month = 10;
  for (const [bnName, mIdx] of Object.entries(BN_MONTHS_MAP)) {
    if (dateStr.includes(bnName)) {
      month = mIdx;
      break;
    }
  }

  const numbers = normalizedDateStr.match(/\b\d{1,2}\b/g);
  let day = 1;
  if (numbers && numbers.length > 0) {
    for (const num of numbers) {
      const val = parseInt(num, 10);
      if (val >= 1 && val <= 31) {
        day = val;
        break;
      }
    }
  }

  const normalizedTimeStr = normalizeBengaliDigits(timeStr);
  const timeMatch = normalizedTimeStr.match(/(\d{1,2}):(\d{2})/);
  let hours = 10;
  let minutes = 0;
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    const isPM = /দুপুর|বিকাল|সন্ধ্যা|রাত|pm/i.test(timeStr);
    const isAM = /সকাল|am/i.test(timeStr);
    if (isPM && hours < 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }
  }

  const d = new Date(year, month, day, hours, minutes, 0, 0);
  const timestamp = d.getTime();
  if (!isNaN(timestamp)) {
    return timestamp;
  }

  const idTimestamp = parseInt(post.id.replace(/\D/g, ''), 10);
  if (!isNaN(idTimestamp) && idTimestamp > 1600000000000) {
    return idTimestamp;
  }

  return 0;
};

interface DigitalDiaryModuleProps {
  activityPosts: ActivityPost[];
  onAddPost: (post: ActivityPost) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string, authorBn: string, roleBn: string) => void;
  currentRole: UserRole;
  onSendHomeworkNotification?: (notif: FcmNotification) => void;
  loggedInTeacherNameBn?: string;
}

export const DigitalDiaryModule: React.FC<DigitalDiaryModuleProps> = ({
  activityPosts,
  onAddPost,
  onLikePost,
  onAddComment,
  currentRole,
  onSendHomeworkNotification,
  loggedInTeacherNameBn,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedFilterType, setSelectedFilterType] = useState<'all' | 'activities' | 'homework'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [notifSuccessBanner, setNotifSuccessBanner] = useState<string | null>(null);

  // New post form fields
  const [newTitle, setNewTitle] = useState('');
  const [newClass, setNewClass] = useState<SchoolClass>('HateKhori');
  const [newActivityType, setNewActivityType] = useState<ActivityType>('art_craft');
  const [newMood, setNewMood] = useState<ChildMood>('joyful');
  const [newDesc, setNewDesc] = useState('');
  const [newSnackItem, setNewSnackItem] = useState('');
  const [newSnackIntake, setNewSnackIntake] = useState<'full' | 'half' | 'few_bites' | 'none'>('full');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('/assets/fb/photo-1.jpg');
  const [formError, setFormError] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isCapturedFromCamera, setIsCapturedFromCamera] = useState(false);
  const deviceCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Specific Homework / Task fields
  const [hwSubjectBn, setHwSubjectBn] = useState('বাংলা ও হাতের লেখা');
  const [hwDueDateBn, setHwDueDateBn] = useState('আগামীকাল, সকাল ০৯:০০');
  const [hwMaterialsBn, setHwMaterialsBn] = useState('বড় খাতা, পেন্সিল ও রঙিন কাঠি');
  const [hwInstructionsBn, setHwInstructionsBn] = useState('অভিভাবক পাশে বসে শিশুকে বর্ণমালা হাত ঘুরিয়ে লিখতে উৎসাহিত করবেন।');
  const [hwEstimatedMinutes, setHwEstimatedMinutes] = useState<number>(20);

  const filteredAndSortedPosts = useMemo(() => {
    const list = activityPosts.filter((p) => {
      const classMatch = selectedClass === 'All' ? true : isSameSchoolClass(p.className, selectedClass);
      if (!classMatch) return false;
      if (selectedFilterType === 'homework') return p.activityType === 'homework_task';
      if (selectedFilterType === 'activities') return p.activityType !== 'homework_task';
      return true;
    });

    return [...list].sort((a, b) => {
      const timeA = parseActivityPostTimestamp(a);
      const timeB = parseActivityPostTimestamp(b);
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [activityPosts, selectedClass, selectedFilterType, sortOrder]);

  const filteredPosts = filteredAndSortedPosts;

  const handleToggleAudio = (postId: string) => {
    if (playingAudioId === postId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(postId);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 5000);
    }
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const authorBn = currentRole === 'teacher' ? (loggedInTeacherNameBn || 'রোকেয়া পারভীন (শিক্ষক)') : 'ফারহানা আফরোজ (অভিভাবক)';
    const roleBn = currentRole === 'teacher' ? 'শিক্ষক' : 'অভিভাবক';

    onAddComment(postId, text, authorBn, roleBn);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleDiaryPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPhotoUrl(reader.result);
        setIsCapturedFromCamera(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCameraPhotoCaptured = (photoDataUrl: string) => {
    setNewPhotoUrl(photoDataUrl);
    setIsCapturedFromCamera(true);
  };

  const handleDirectDeviceCamera = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPhotoUrl(reader.result);
        setIsCapturedFromCamera(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      setFormError('অনুগ্রহ করে শিরোনাম ও ক্লাসের বিবরণ লিখুন।');
      return;
    }
    setFormError(null);

    const isHomework = newActivityType === 'homework_task';
    const teacherName = loggedInTeacherNameBn || 'রোকেয়া পারভীন (ক্লাস টিচার)';

    const post: ActivityPost = {
      id: `act-${Date.now()}`,
      className: newClass,
      titleBn: newTitle.trim(),
      dateStr: 'আজ, ০৬ নভেম্বর ২০২৬',
      timeStr: 'দুপুর ১২:৩০',
      activityType: newActivityType,
      mood: newMood,
      teacherNameBn: teacherName,
      descriptionBn: newDesc.trim(),
      illustrationTheme: isHomework ? 'story' : newActivityType === 'rhyme' ? 'music' : newActivityType === 'art_craft' ? 'painting' : 'blocks',
      photoUrl: newPhotoUrl || undefined,
      fbPostUrl: 'https://www.facebook.com/AnandaPathshalaKushtia',
      snackDetail: !isHomework && newSnackItem ? { itemBn: newSnackItem, intake: newSnackIntake } : undefined,
      homeworkTask: isHomework
        ? {
            subjectBn: hwSubjectBn.trim() || 'সাধারণ পাঠ',
            dueDateBn: hwDueDateBn.trim() || 'আগামীকাল সকাল ৯টা',
            materialsNeededBn: hwMaterialsBn.trim() || undefined,
            submissionInstructionsBn: hwInstructionsBn.trim() || undefined,
            estimatedMinutes: hwEstimatedMinutes || 20,
          }
        : undefined,
      likes: 1,
      comments: [],
    };

    onAddPost(post);

    // If it's a Homework/Task post, automatically send Push Notification to respective class parents
    if (isHomework && onSendHomeworkNotification) {
      const classNameBn = getSchoolClassNameBn(newClass);
      const pushNotif: FcmNotification = {
        id: `fcm-hw-${Date.now()}`,
        type: 'homework_task_assigned',
        priority: 'high',
        titleBn: `📚 নতুন বাড়ির কাজ / হোমওয়ার্ক (${classNameBn}): ${newTitle.trim()}`,
        bodyBn: `${teacherName} আপনার সন্তানের ${classNameBn} শ্রেণিতে বাড়ির কাজ দিয়েছেন: "${newDesc.trim()}". জমা দেওয়ার শেষ সময়: ${hwDueDateBn}.`,
        targetRole: 'parent',
        studentOrApplicantNameBn: `${classNameBn} শ্রেণির সকল শিক্ষার্থী`,
        className: newClass,
        guardianNameBn: `${classNameBn} শ্রেণির সকল সম্মানিত অভিভাবক`,
        timestamp: 'এইমাত্র',
        read: false,
        actionTab: 'diary',
        fcmMessageId: `projects/gen-lang-client-0036381817/messages/hw_${Date.now()}`,
      };

      onSendHomeworkNotification(pushNotif);
      setNotifSuccessBanner(
        `✓ হোমওয়ার্কটি সফলভাবে প্রকাশিত হয়েছে এবং ${classNameBn} শ্রেণির সকল অভিভাবকের ফোনে স্বয়ংক্রিয় পুশ নোটিফিকেশন পাঠানো হয়েছে!`
      );
      setTimeout(() => setNotifSuccessBanner(null), 7000);
    } else {
      setNotifSuccessBanner('✓ ডায়েরি পোস্ট সফলভাবে প্রকাশিত হয়েছে!');
      setTimeout(() => setNotifSuccessBanner(null), 4000);
    }

    setIsCreatingPost(false);
    setIsCapturedFromCamera(false);
    setNewTitle('');
    setNewDesc('');
    setNewSnackItem('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-400/30 text-indigo-100 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
              কেজি ও প্লে স্কুলের বিশেষ মডিউল #২
            </span>
            <span className="text-white/60 text-xs">·</span>
            <span className="text-white/90 text-xs font-medium">প্রতিদিনের লাইভ ক্লাসরুম ডায়রি ও হোমওয়ার্ক</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">ডিজিটাল ডায়রি ও হোমওয়ার্ক ফিড</h2>
          <p className="text-indigo-100/90 text-sm max-w-2xl mt-1">
            ছোট শিশুদের প্রতিদিনের আনন্দের গল্প, ছড়া গান, ড্রয়িং, পুষ্টিকর খাবার এবং শিক্ষকদের দেওয়া বাড়ির কাজ (Homework/Task) সরাসরি অভিভাবকদের কাছে তাৎক্ষণিক পুশ নোটিফিকেশনে পৌঁছে যায়।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCreatingPost(!isCreatingPost)}
            className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            {isCreatingPost ? 'বাতিল' : 'নতুন ডায়রি / হোমওয়ার্ক পোস্ট'}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {notifSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{notifSuccessBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotifSuccessBanner(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Class & Type Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Post Type Filter (All / Classroom Activities / Homework Only) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সকল পোস্ট ({activityPosts.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilterType('homework')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedFilterType === 'homework'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>হোমওয়ার্ক / টাস্ক ({activityPosts.filter((p) => p.activityType === 'homework_task').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilterType('activities')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilterType === 'activities'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ক্লাসরুম অ্যাক্টিভিটি ({activityPosts.filter((p) => p.activityType !== 'homework_task').length})
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <label htmlFor="diary-sort-dropdown" className="font-semibold text-slate-600 whitespace-nowrap">
                তারিখ সাজান:
              </label>
              <select
                id="diary-sort-dropdown"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer py-0.5 text-xs"
              >
                <option value="newest">নতুন তারিখ আগে (Newest first)</option>
                <option value="oldest">পুরাতন তারিখ আগে (Oldest first)</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              প্রদর্শিত হচ্ছে: <span className="font-bold text-slate-900">{toBengaliNumber(filteredAndSortedPosts.length)}</span> টি পোস্ট
            </div>
          </div>
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-semibold mr-1 shrink-0">শ্রেণি:</span>
          <button
            onClick={() => setSelectedClass('All')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedClass === 'All'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            সকল শ্রেণি
          </button>
          {ALL_SCHOOL_CLASSES.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedClass === cls.id
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cls.nameBn}
            </button>
          ))}
        </div>
      </div>

      {/* Create New Post Form */}
      {isCreatingPost && (
        <form onSubmit={handleCreatePostSubmit} className="bg-white rounded-2xl border-2 border-indigo-200 p-6 shadow-md space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              আজকের ক্লাসরুমের নতুন অ্যাক্টিভিটি অথবা হোমওয়ার্ক পোস্ট করুন
            </h3>
            <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              শিক্ষক প্যানেল
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">শ্রেণি (Class):</label>
              <select
                value={newClass}
                onChange={(e) => setNewClass(e.target.value as SchoolClass)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
              >
                {ALL_SCHOOL_CLASSES.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.fullNameBn}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">পোস্টের ধরণ (Post Type):</label>
              <select
                value={newActivityType}
                onChange={(e) => {
                  const val = e.target.value as ActivityType;
                  setNewActivityType(val);
                  if (val === 'homework_task' && !newTitle.trim()) {
                    setNewTitle('📚 বাংলা হাতের লেখা ও বর্ণমালা অনুশীলন');
                  }
                }}
                className="w-full px-3 py-2 text-xs border-2 border-indigo-300 bg-indigo-50/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-black text-indigo-950"
              >
                <option value="homework_task">📚 বাড়ির কাজ / হোমওয়ার্ক (Homework/Task — অটো পুশ নোটিফিকেশন)</option>
                <option value="art_craft">🎨 আর্ট ও রঙিন ক্রাফট (Art & Craft)</option>
                <option value="rhyme">🎵 ছড়া আবৃত্তি ও সংগীত (Rhymes & Singing)</option>
                <option value="block_play">🧱 কাঠের ব্লক ও পাজল নির্মাণ</option>
                <option value="snack_time">🍎 টিফিন ও পুষ্টিকর নাশতা</option>
                <option value="outdoor">⚽ আউটডোর ও খেলার মাঠ</option>
                <option value="circle_time">🌟 সার্কেল টাইম ও গল্প বলা</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">শিশুদের মেজাজ (Mood):</label>
              <select
                value={newMood}
                onChange={(e) => setNewMood(e.target.value as ChildMood)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
              >
                <option value="joyful">আনন্দিত ও হাসিখুশি (Joyful)</option>
                <option value="creative">সৃজনশীল ও কল্পনাপ্রবণ (Creative)</option>
                <option value="curious">কৌতূহলী ও মনোযোগী (Curious)</option>
                <option value="playful">চঞ্চল ও দলবদ্ধ (Playful)</option>
                <option value="peaceful">শান্ত ও আরামদায়ক (Peaceful)</option>
              </select>
            </div>
          </div>

          {/* Dedicated Section for Homework/Task with Push Notification Indicator */}
          {newActivityType === 'homework_task' && (
            <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                    <BookMarked className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-950">
                      হোমওয়ার্ক / বাড়ির কাজের বিবরণ ও স্বয়ংক্রিয় পুশ অ্যালার্ট
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      পোস্ট করার সাথে সাথে {getSchoolClassNameBn(newClass)} শ্রেণির সকল অভিভাবকের ফোনে সরাসরি রিয়েল-টাইম পুশ নোটিফিকেশন পৌঁছে যাবে।
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase shrink-0">
                  <BellRing className="w-3 h-3 animate-bounce" />
                  <span>অটো পুশ সক্রিয়</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-amber-950 block mb-1">বিষয় / অধ্যায় (Subject):</label>
                  <input
                    type="text"
                    value={hwSubjectBn}
                    onChange={(e) => setHwSubjectBn(e.target.value)}
                    placeholder="যেমন: বাংলা ও হাতের লেখা"
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-950 block mb-1">জমা দেওয়ার শেষ সময় (Due Date):</label>
                  <input
                    type="text"
                    value={hwDueDateBn}
                    onChange={(e) => setHwDueDateBn(e.target.value)}
                    placeholder="যেমন: আগামীকাল, সকাল ০৯:০০"
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-950 block mb-1">আনুমানিক সময় (মিনিট):</label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={hwEstimatedMinutes}
                    onChange={(e) => setHwEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-amber-950 block mb-1">প্রয়োজনীয় শিক্ষা উপকরণ:</label>
                  <input
                    type="text"
                    value={hwMaterialsBn}
                    onChange={(e) => setHwMaterialsBn(e.target.value)}
                    placeholder="যেমন: বড় মার্জিনের খাতা, পেন্সিল ও ইরেজার"
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-amber-950 block mb-1">অভিভাবকের প্রতি নির্দেশনা:</label>
                  <input
                    type="text"
                    value={hwInstructionsBn}
                    onChange={(e) => setHwInstructionsBn(e.target.value)}
                    placeholder="যেমন: শিশুকে হাত ঘুরিয়ে লিখতে উৎসাহিত করুন"
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {newActivityType === 'homework_task' ? 'হোমওয়ার্ক শিরোনাম:' : 'পোস্টের আকর্ষণীয় শিরোনাম:'}
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={newActivityType === 'homework_task' ? 'যেমন: 📚 বাংলা স্বরবর্ণ (অ-ঐ) হাত ঘোরানো ও মৌখিক ছড়া' : 'যেমন: 🎨 আঙুলের ছাপ দিয়ে প্রজাপতি আঁকা ও গানের আসর'}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {newActivityType === 'homework_task' ? 'টাস্কের সম্পূর্ণ বিবরণ ও পড়ার বিষয়:' : 'আজকের ক্লাসের ঘটনা ও শেখার বিবরণ:'}
            </label>
            <textarea
              required
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder={newActivityType === 'homework_task' ? 'আজ ক্লাসে যা পড়ানো হয়েছে তার উপর ভিত্তি করে বাড়ি থেকে যে পৃষ্ঠা পূরণ করে আনতে হবে তা বিস্তারিত লিখুন...' : 'শিশুরা কীভাবে অংশ নিয়েছে, কী কী নতুন শব্দ শিখেছে এবং তাদের অভিব্যক্তি কেমন ছিল...'}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Classroom Photo Selector & Instant Camera Capture */}
          <div className="bg-indigo-50/60 p-4 rounded-2xl border-2 border-indigo-200/80 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <label className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>
                    {newActivityType === 'homework_task'
                      ? 'হোমওয়ার্ক বা পাঠ্যপুস্তকের ছবি সংযুক্ত করুন:'
                      : 'ক্লাসরুম অ্যাক্টিভিটি বা শিশুদের ছবি সংযুক্ত করুন:'}
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ডিভাইসের ক্যামেরা দিয়ে সরাসরি ছবি তুলুন অথবা গ্যালারি থেকে সিলেক্ট করুন
                </p>
              </div>

              {/* Action Buttons: Camera Capture & File Upload */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Hidden native camera capture input */}
                <input
                  ref={deviceCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleDirectDeviceCamera}
                  className="hidden"
                />

                {/* Primary Camera Capture Button */}
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer ring-2 ring-emerald-500/20"
                  title="ডিভাইসের ক্যামেরা দিয়ে তাৎক্ষণিক ছবি তুলুন"
                >
                  <Camera className="w-4 h-4 text-amber-200" />
                  <span>ক্যামেরা দিয়ে ছবি তুলুন</span>
                </button>

                {/* Native Mobile Camera App Fallback */}
                <button
                  type="button"
                  onClick={() => deviceCameraInputRef.current?.click()}
                  className="px-3 py-2 bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="ডিভাইস ক্যামেরা অ্যাপ দিয়ে ছবি তুলুন"
                >
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ডিভাইস ক্যামেরা</span>
                </button>

                {/* File picker */}
                <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                  <span>ফাইল পছন্দ</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDiaryPhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Current Attached Photo Preview Banner */}
            {newPhotoUrl && (
              <div className="bg-white rounded-xl p-3 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-14 rounded-lg overflow-hidden border-2 border-indigo-500 shrink-0 relative bg-slate-100 shadow-2xs">
                    <img
                      src={newPhotoUrl}
                      alt="Attached Photo Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        isCapturedFromCamera
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>
                        {isCapturedFromCamera ? '📷 ক্যামেরা দিয়ে সরাসরি তোলা ছবি' : '🖼️ সংযুক্ত ছবি'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                      পোস্টটি প্রকাশ করার সাথে সাথে এই ছবিটি পোস্টের সাথে প্রদর্শিত হবে।
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                    title="ক্যামেরা দিয়ে পুনরায় ছবি তুলুন"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>পুনরায় তুলুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPhotoUrl('');
                      setIsCapturedFromCamera(false);
                    }}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 transition cursor-pointer"
                    title="ছবি মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Preset Library Thumbnails */}
            <div className="pt-1">
              <span className="text-[10.5px] font-bold text-indigo-900 block mb-1.5">
                অথবা স্কুলের অফিসিয়াল লাইব্রেরি থেকে ছবি পছন্দ করুন:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {[
                  '/assets/fb/photo-1.jpg',
                  '/assets/fb/photo-2.jpg',
                  '/assets/fb/photo-3.jpg',
                  '/assets/fb/photo-4.jpg',
                  '/assets/fb/photo-5.jpg',
                  '/assets/fb/cover.jpg',
                ].map((imgPath) => (
                  <button
                    key={imgPath}
                    type="button"
                    onClick={() => {
                      setNewPhotoUrl(imgPath);
                      setIsCapturedFromCamera(false);
                    }}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      newPhotoUrl === imgPath && !isCapturedFromCamera
                        ? 'border-indigo-600 ring-2 ring-indigo-400/40 scale-105'
                        : 'border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgPath}
                      alt="ক্লাসরুম ছবি অপশন"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {formError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Optional snack intake details if NOT a homework post */}
          {newActivityType !== 'homework_task' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60">
              <div>
                <label className="text-xs font-bold text-amber-900 block mb-1">টিফিন আইটেম (Snack Menu):</label>
                <input
                  type="text"
                  value={newSnackItem}
                  onChange={(e) => setNewSnackItem(e.target.value)}
                  placeholder="যেমন: নরম সুজি পায়েস ও আপেলের স্লাইস"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-amber-900 block mb-1">শিশুদের খাওয়ার পরিমাণ:</label>
                <select
                  value={newSnackIntake}
                  onChange={(e) => setNewSnackIntake(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none"
                >
                  <option value="full">সম্পূর্ণ খেয়েছে (Full Meal Finished)</option>
                  <option value="half">অর্ধেক খেয়েছে (Half Eaten)</option>
                  <option value="few_bites">কয়েক লোকমা খেয়েছে (Few Bites)</option>
                  <option value="none">খেতে চায়নি (Declined / Mood Low)</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingPost(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-black text-white rounded-xl shadow-md flex items-center gap-2 cursor-pointer ${
                newActivityType === 'homework_task'
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {newActivityType === 'homework_task' ? (
                <>
                  <BellRing className="w-4 h-4" />
                  <span>হোমওয়ার্ক পোস্ট ও পুশ নোটিফিকেশন পাঠান</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>ডায়রি পোস্ট করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Feed Stream */}
      <div className="space-y-6">
        {filteredAndSortedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-2xs">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700">কোনো পোস্ট পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400 mt-1">নির্বাচিত ফিল্টারের অধীনে কোনো ডায়রি বা হোমওয়ার্ক পোস্ট নেই।</p>
          </div>
        ) : (
          filteredAndSortedPosts.map((post) => {
          const isHomework = post.activityType === 'homework_task';
          return (
            <div
              key={post.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-2xs hover:shadow-xs transition-shadow ${
                isHomework ? 'border-2 border-amber-300 ring-1 ring-amber-400/20' : 'border-slate-200'
              }`}
            >
              {/* Specialized Banner for Homework Posts */}
              {isHomework && (
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-2 text-white flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-black">
                    <BookMarked className="w-4 h-4 text-white" />
                    <span>📚 অফিসিয়াল ক্লাসরুম হোমওয়ার্ক / বাড়ির কাজ (Homework/Task)</span>
                  </div>
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
                    অভিভাবক পুশ নোটিফিকেশন প্রেরিত ✓
                  </span>
                </div>
              )}

              {/* Post Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                      isHomework
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {isHomework && <BookMarked className="w-6 h-6 text-amber-700" />}
                    {post.activityType === 'art_craft' && <Palette className="w-5 h-5 text-indigo-600" />}
                    {post.activityType === 'rhyme' && <Music className="w-5 h-5 text-purple-600" />}
                    {post.activityType === 'block_play' && <Sparkles className="w-5 h-5 text-amber-600" />}
                    {post.activityType === 'outdoor' && <Smile className="w-5 h-5 text-emerald-600" />}
                    {post.activityType === 'snack_time' && <Apple className="w-5 h-5 text-rose-600" />}
                    {post.activityType === 'circle_time' && <Sparkles className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{post.titleBn}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        শ্রেণি: {getSchoolClassNameBn(post.className)}
                      </span>
                      <span>·</span>
                      <span className="font-medium text-slate-600">{post.dateStr} ({post.timeStr})</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700">শিক্ষক: {post.teacherNameBn}</span>
                    </div>
                  </div>
                </div>

                {/* Mood or Homework Status Badge */}
                <div className="shrink-0 flex items-center gap-1.5">
                  {isHomework ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                      <span>{post.homeworkTask?.dueDateBn ? `শেষ সময়: ${post.homeworkTask.dueDateBn}` : 'বাড়ির কাজ'}</span>
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full text-xs text-amber-800 font-medium">
                      <Smile className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {post.mood === 'joyful' && 'আনন্দিত'}
                        {post.mood === 'creative' && 'সৃজনশীল'}
                        {post.mood === 'curious' && 'কৌতূহলী'}
                        {post.mood === 'playful' && 'চঞ্চল'}
                        {post.mood === 'peaceful' && 'শান্ত'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Post Body */}
              <div className="p-5 space-y-4">
                {/* Specific Homework Detail Box */}
                {isHomework && post.homeworkTask && (
                  <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-50/70 border-2 border-amber-200 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-700" />
                        <span className="text-xs font-black text-amber-950">
                          বিষয়: <span className="text-indigo-900 bg-white px-2 py-0.5 rounded-lg border border-amber-300">{post.homeworkTask.subjectBn}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-amber-900 font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-700" />
                          <span>জমা: {post.homeworkTask.dueDateBn}</span>
                        </span>
                        {post.homeworkTask.estimatedMinutes && (
                          <span className="flex items-center gap-1 text-slate-700 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{toBengaliNumber(post.homeworkTask.estimatedMinutes)} মিনিট</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-800 leading-relaxed font-medium">
                      <strong className="text-amber-950 block mb-1">টাস্ক বিবরণ:</strong>
                      {post.descriptionBn}
                    </div>

                    {(post.homeworkTask.materialsNeededBn || post.homeworkTask.submissionInstructionsBn) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-amber-200/60 text-xs">
                        {post.homeworkTask.materialsNeededBn && (
                          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/80">
                            <span className="font-bold text-amber-900 block text-[11px]">প্রয়োজনীয় উপকরণ:</span>
                            <span className="text-slate-700">{post.homeworkTask.materialsNeededBn}</span>
                          </div>
                        )}
                        {post.homeworkTask.submissionInstructionsBn && (
                          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/80">
                            <span className="font-bold text-amber-900 block text-[11px]">অভিভাবকের প্রতি পরামর্শ:</span>
                            <span className="text-slate-700">{post.homeworkTask.submissionInstructionsBn}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!isHomework && (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {post.descriptionBn}
                  </p>
                )}

              {/* Real Classroom Photos from Ananda Pathshala Kushtia Facebook Page */}
              {post.photoUrl && (
                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-96 flex items-center justify-center">
                    <img
                      src={post.photoUrl}
                      alt={post.titleBn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover max-h-96"
                    />
                  </div>
                  {post.galleryUrls && post.galleryUrls.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {post.galleryUrls.map((gUrl, idx) => (
                        <img
                          key={idx}
                          src={gUrl}
                          alt={`${post.titleBn} ছবি ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="h-24 w-full object-cover rounded-xl border border-slate-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Visual illustration box (with styled SVG kindergarten craft motif) */}
              <div className="bg-gradient-to-br from-indigo-50/60 via-amber-50/40 to-pink-50/50 rounded-xl p-4 border border-indigo-100/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white shadow-2xs border border-indigo-200/60 flex items-center justify-center text-2xl">
                    {post.illustrationTheme === 'painting' ? '🎨' : post.illustrationTheme === 'music' ? '🎵' : '🧱'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {post.activityType === 'rhyme' ? 'রেকর্ডকৃত ছড়ার অডিও স্নিপেট' : 'আনন্দ পাঠশালা কুষ্টিয়া ক্লাসরুম স্ন্যাপশট'}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>ফেসবুক পেজ ও ক্লাসরুম ক্যামেরা দ্বারা সংযুক্ত</span>
                      {post.fbPostUrl && (
                        <a
                          href={post.fbPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          · Facebook পেজে দেখুন
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Audio Player Simulation for Rhymes */}
                {post.activityType === 'rhyme' && (
                  <button
                    onClick={() => handleToggleAudio(post.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                      playingAudioId === post.id
                        ? 'bg-purple-600 text-white animate-pulse'
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    {playingAudioId === post.id ? 'বাজছে: "ভোর হলো দোর খোলো..."' : 'ছড়ার অডিও শুনুন (Audio Play)'}
                  </button>
                )}
              </div>

              {/* Snack Intake Card if present */}
              {post.snackDetail && (
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900">পুষ্টিকর টিফিন পর্যবেক্ষণ: </span>
                      <span className="text-emerald-800">{post.snackDetail.itemBn}</span>
                    </div>
                  </div>

                  <div className="shrink-0 bg-white border border-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700">
                    {post.snackDetail.intake === 'full' && '✓ সম্পূর্ণ খেয়েছে'}
                    {post.snackDetail.intake === 'half' && '½ অর্ধেক খেয়েছে'}
                    {post.snackDetail.intake === 'few_bites' && 'সামান্য খেয়েছে'}
                  </div>
                </div>
              )}
            </div>

            {/* Interaction Bar */}
            <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onLikePost(post.id)}
                  className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-semibold"
                >
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>{post.likes} টি ভালোবাসা</span>
                </button>

                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>{post.comments.length} টি অভিভাবক মন্তব্য</span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400">
                অভিভাবক ও শিক্ষক ফিড
              </span>
            </div>

            {/* Comments Thread */}
            <div className="p-5 bg-slate-50/40 border-t border-slate-100 space-y-3">
              {post.comments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {post.comments.map((c) => (
                    <div key={c.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{c.authorBn}</span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {c.roleBn}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{c.timeAgo}</span>
                      </div>
                      <p className="text-slate-700">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  placeholder={
                    currentRole === 'teacher'
                      ? 'শিক্ষক হিসেবে উত্তর দিন...'
                      : 'টিচারকে ধন্যবাদ জানান বা শিশুর অনুভূতি লিখুন...'
                  }
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  পাঠান
                </button>
              </form>
            </div>
          </div>
        );
      })
    )}
      </div>

      {/* Camera Capture Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraPhotoCaptured}
        titleBn={newActivityType === 'homework_task' ? 'হোমওয়ার্ক বা পাঠ্যবইয়ের ছবি তুলুন' : 'আজকের ক্লাসরুম অ্যাক্টিভিটির ছবি তুলুন'}
      />
    </div>
  );
};
