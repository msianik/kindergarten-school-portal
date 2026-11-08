import React, { useState } from 'react';
import { SchoolNotice, UserRole } from '../types/school';
import {
  Megaphone,
  BellRing,
  Send,
  X,
  AlertCircle,
  CheckCircle2,
  Users,
  Calendar,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface EmergencyNoticeBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcast: (notice: Omit<SchoolNotice, 'id'>, broadcastTarget: 'all' | 'parents' | 'teachers') => void;
}

const PRESET_TEMPLATES = [
  {
    titleBn: 'তীব্র শৈত্যপ্রবাহ ও কুয়াশার কারণে স্কুল ছুটি সংক্রান্ত জরুরি বিজ্ঞপ্তি',
    category: 'urgent',
    priority: 'urgent',
    contentBn: 'সম্মানিত অভিভাবকবৃন্দ, তীব্র শৈত্যপ্রবাহ ও ঘন কুয়াশাজনিত বৈরী আবহাওয়ার কারণে শিশু শিক্ষার্থীদের স্বাস্থ্য সুরক্ষায় আগামীকাল আনন্দ পাঠশালার সকল শ্রেণির পাঠদান কার্যক্রম বন্ধ থাকবে। পরিস্থিতি স্বাভাবিক হলে ক্লাস পুনরায় যথারীতি শুরু হবে।',
  },
  {
    titleBn: 'বার্ষিক পরীক্ষার চূড়ান্ত সময়সূচি ও অ্যাডমিট কার্ড বিতরণ সংক্রান্ত',
    category: 'exam',
    priority: 'urgent',
    contentBn: 'সকল অভিভাবক ও শিক্ষার্থীদের অবগতির জন্য জানানো যাচ্ছে যে, আগামী ১৫ নভেম্বর থেকে সকল শ্রেণির বার্ষিক মূল্যায়ন পরীক্ষা অনুষ্ঠিত হবে। অফিস কক্ষ থেকে শিক্ষার্থীদের পরীক্ষার রুটিন ও প্রবেশপত্র (Admit Card) সংগ্রহের জন্য অনুরোধ করা হচ্ছে।',
  },
  {
    titleBn: 'বার্ষিক আনন্দ ভ্রমণ, পিকনিক ও সাংস্কৃতিক উৎসব ২০২৬',
    category: 'event',
    priority: 'normal',
    contentBn: 'আনন্দ পাঠশালার বার্ষিক আনন্দ ভ্রমণ ও পিকনিক আগামী মাসের প্রথম সপ্তাহে অনুষ্ঠিত হতে যাচ্ছে। শিশুদের অংশগ্রহণ নিশ্চিত করতে আগামী ২০ নভেম্বরের মধ্যে অভিভাবক সম্মতিপত্র জমা দেওয়ার জন্য অনুরোধ করা হলো।',
  },
  {
    titleBn: 'চলতি মাসের টিউশন ফি পরিশোধের বিনীত অনুরোধ',
    category: 'fee',
    priority: 'normal',
    contentBn: 'সম্মানিত অভিভাবক, চলতি মাসের স্কুল ফি পরিশোধের নির্ধারিত তারিখ আগামী ১০ তারিখ। বিকাশ অ্যাপ বা অনলাইন পোর্টাল থেকে সরাসরি পেমেন্ট করে অফিসিয়াল মানি রিসিট সংগ্রহ করুন।',
  },
];

export const EmergencyNoticeBroadcastModal: React.FC<EmergencyNoticeBroadcastModalProps> = ({
  isOpen,
  onClose,
  onBroadcast,
}) => {
  const [titleBn, setTitleBn] = useState<string>(PRESET_TEMPLATES[0].titleBn);
  const [contentBn, setContentBn] = useState<string>(PRESET_TEMPLATES[0].contentBn);
  const [priority, setPriority] = useState<'urgent' | 'normal'>('urgent');
  const [category, setCategory] = useState<SchoolNotice['category']>('urgent');
  const [targetGroup, setTargetGroup] = useState<'all' | 'parents' | 'teachers'>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setTitleBn(tpl.titleBn);
    setContentBn(tpl.contentBn);
    setPriority(tpl.priority as any);
    setCategory(tpl.category as any);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn.trim() || !contentBn.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onBroadcast(
        {
          titleBn: titleBn.trim(),
          contentBn: contentBn.trim(),
          category,
          priority,
          publishDate: new Date().toISOString().split('T')[0],
          publishDateBn: new Date().toLocaleDateString('bn-BD', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          isPinned: priority === 'urgent',
          authorBn: 'অধ্যক্ষ ও পরিচালনা পর্ষদ',
          targetAudience: targetGroup,
        },
        targetGroup
      );
      setIsSubmitting(false);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 2000);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-700 via-rose-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <Megaphone className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                জরুরি নোটিশ ও তাৎক্ষণিক পুশ ব্রডকাস্ট
              </h3>
              <p className="text-xs text-rose-100">
                এক ক্লিকে সকল অভিভাবক ও শিক্ষকের মোবাইলে FCM পুশ অ্যালার্ট ও নোটিশ বোর্ডে প্রকাশ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              ✓ জরুরি নোটিশ সফলভাবে ব্রডকাস্ট হয়েছে!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              স্কুল নোটিশ বোর্ডে সার্কুলারটি যুক্ত হয়েছে এবং নির্বাচিত সকল অভিভাবক ও শিক্ষকের ডিভাইসে পুশ নোটিফিকেশন পৌঁছে দেওয়া হয়েছে।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendBroadcast} className="p-6 space-y-4 text-xs sm:text-sm">
            {/* Quick Templates Strip */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                💡 দ্রুত নোটিশ টেমপ্লেট নির্বাচন করুন:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 border border-slate-200 text-[11px] font-semibold text-slate-700 transition cursor-pointer text-left"
                  >
                    {tpl.titleBn.split(' ')[0]} {tpl.titleBn.split(' ')[1]} {tpl.titleBn.split(' ')[2]}...
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ব্রডকাস্ট প্রাপক (Target Audience):
                </label>
                <select
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="all">👥 সকল অভিভাবক ও শিক্ষক (All Parents & Teachers)</option>
                  <option value="parents">👨‍👧 শুধুমাত্র অভিভাবকবৃন্দ (Parents Only)</option>
                  <option value="teachers">👩‍🏫 শুধুমাত্র শিক্ষক ও স্টাফ (Staff Only)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  নোটিশের ধরন ও অগ্রাধিকার (Priority):
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPriority('urgent');
                      setCategory('urgent');
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                      priority === 'urgent'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>🚨 জরুরি লাল অ্যালার্ট</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPriority('normal');
                      setCategory('holiday');
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                      priority === 'normal'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>সাধারণ সার্কুলার</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                বিজ্ঞপ্তির শিরোনাম (Headline):
              </label>
              <input
                type="text"
                required
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="বিজ্ঞপ্তির মূল বিষয়..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Content Body */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                বিজ্ঞপ্তির পূর্ণাঙ্গ বিবরণ (Notice Message):
              </label>
              <textarea
                rows={4}
                required
                value={contentBn}
                onChange={(e) => setContentBn(e.target.value)}
                placeholder="বিজ্ঞপ্তির বিস্তারিত বার্তা লিখুন..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
              />
            </div>

            {/* Notification Delivery Guarantee Badge */}
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[11px] text-rose-950 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                ব্রডকাস্ট বোতাম চাপলে নোটিশটি ওয়েবসাইটের স্ক্রোলিং টিকারে যুক্ত হবে এবং অভিভাবকদের অ্যাপসে রিয়েল-টাইম পুশ সাউন্ড অ্যালার্ট হিসেবে প্রদর্শিত হবে।
              </span>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold text-xs sm:text-sm cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'পাঠানো হচ্ছে...' : 'তাৎক্ষণিক ব্রডকাস্ট করুন'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
