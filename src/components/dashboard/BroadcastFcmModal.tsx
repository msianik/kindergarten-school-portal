import React, { useState } from 'react';
import { Megaphone, Send, UserCheck } from 'lucide-react';
import { FcmNotification, SchoolClass } from '../../types/school';
import { ALL_SCHOOL_CLASSES } from '../../utils/schoolLogic';

interface BroadcastFcmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendNotification?: (notif: FcmNotification) => void;
  onSuccessToast?: (msg: string) => void;
}

export const BroadcastFcmModal: React.FC<BroadcastFcmModalProps> = ({
  isOpen,
  onClose,
  onSendNotification,
  onSuccessToast,
}) => {
  const [broadcastTitleBn, setBroadcastTitleBn] = useState('');
  const [broadcastBodyBn, setBroadcastBodyBn] = useState('');
  const [broadcastTargetRole, setBroadcastTargetRole] = useState<
    'all' | 'teacher' | 'all_staff'
  >('all');
  const [broadcastPriority, setBroadcastPriority] = useState<
    'urgent' | 'high' | 'normal'
  >('high');
  const [broadcastClass, setBroadcastClass] =
    useState<SchoolClass>('HateKhori');
  const [broadcastActionTab, setBroadcastActionTab] = useState<
    'overview' | 'pickup' | 'diary' | 'public'
  >('overview');

  if (!isOpen) return null;

  const handleSendBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitleBn.trim() || !broadcastBodyBn.trim()) return;

    const nowTime = new Date().toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newNotif: FcmNotification = {
      id: `fcm-broadcast-${Date.now()}`,
      type: 'broadcast_announcement',
      priority: broadcastPriority,
      titleBn: broadcastTitleBn.trim(),
      bodyBn: broadcastBodyBn.trim(),
      targetRole: broadcastTargetRole,
      studentOrApplicantNameBn:
        broadcastTargetRole === 'all'
          ? 'সকল শিক্ষার্থী ও অভিভাবক'
          : 'শিক্ষক ও কর্মচারী পর্ষদ',
      className: broadcastClass,
      guardianNameBn: 'অধ্যক্ষ শাফী আব্দুল্লাহ',
      timestamp: `আজ ${nowTime} (ব্রডকাস্ট)`,
      read: false,
      actionTab: broadcastActionTab,
      fcmMessageId: `projects/gen-lang-client-0036381817/messages/broadcast_${Date.now()}`,
    };

    if (onSendNotification) {
      onSendNotification(newNotif);
    }
    setBroadcastTitleBn('');
    setBroadcastBodyBn('');
    onClose();
    if (onSuccessToast) {
      onSuccessToast('📢 সবাইকে নতুন পুশ নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-8 max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
              👑 অধ্যক্ষ কনসোল · রিয়েল-টাইম পুশ ব্রডকাস্ট
            </span>
            <h4 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-600" />
              <span>সবাইকে নতুন নোটিফিকেশন পাঠান</span>
            </h4>
            <p className="text-xs text-slate-500">
              বিদ্যালয়ের সকল শিক্ষক, স্টাফ ও অভিভাবকদের কাছে মোবাইল অ্যাপ ও ব্রাউজারে সরাসরি পুশ অ্যালার্ট যাবে
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Broadcast Form */}
        <form onSubmit={handleSendBroadcastSubmit} className="space-y-4 text-xs">
          {/* Target Audience & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                প্রাপক (Target Audience) *
              </label>
              <select
                value={broadcastTargetRole}
                onChange={(e) => setBroadcastTargetRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">📢 সবাইকে (সকল শিক্ষক ও অভিভাবক)</option>
                <option value="teacher">👩‍🏫 শুধু শিক্ষক পর্ষদ (Teachers Only)</option>
                <option value="all_staff">🛡️ সকল স্টাফ ও গেট সিকিউরিটি</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                গুরুত্ব (Priority Level) *
              </label>
              <select
                value={broadcastPriority}
                onChange={(e) => setBroadcastPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="high">🔔 গুরুত্বপূর্ণ বিজ্ঞপ্তি (High)</option>
                <option value="urgent">🚨 জরুরি লাল সংকেত (Urgent Alert)</option>
                <option value="normal">ℹ️ সাধারণ তথ্য (Normal Info)</option>
              </select>
            </div>
          </div>

          {/* Class & Tab Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                প্রাসঙ্গিক শ্রেণি (Class Scope)
              </label>
              <select
                value={broadcastClass}
                onChange={(e) => setBroadcastClass(e.target.value as SchoolClass)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {ALL_SCHOOL_CLASSES.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.fullNameBn}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                নোটিফিকেশনে ক্লিকে যে ট্যাবে যাবে:
              </label>
              <select
                value={broadcastActionTab}
                onChange={(e) => setBroadcastActionTab(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="overview">ড্যাশবোর্ড ও নোটিশ বোর্ড (Overview)</option>
                <option value="diary">ডিজিটাল ক্লাসরুম ডায়েরি (Diary)</option>
                <option value="pickup">গেট-পাস ও পিক-আপ সিকিউরিটি (Pickup)</option>
                <option value="public">পাবলিক হোমপেজ (Public Website)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              নোটিফিকেশনের শিরোনাম (বাংলা) *
            </label>
            <input
              type="text"
              required
              value={broadcastTitleBn}
              onChange={(e) => setBroadcastTitleBn(e.target.value)}
              placeholder="যেমন: শৈত্যপ্রবাহ ও কুয়াশার কারণে আগামীকালের ক্লাস সময়সূচি পরিবর্তন"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Body */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              বিস্তারিত বার্তা / নোটিশ বিবরণ *
            </label>
            <textarea
              rows={4}
              required
              value={broadcastBodyBn}
              onChange={(e) => setBroadcastBodyBn(e.target.value)}
              placeholder="অভিভাবক ও শিক্ষকদের উদ্দেশ্যে পূর্ণাঙ্গ জরুরি বার্তা লিখুন..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 leading-relaxed font-medium"
            />
          </div>

          {/* Sender Tag info */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-emerald-950">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-[11px] font-semibold">
                প্রেরক: শাফী আব্দুল্লাহ (অধ্যক্ষ ও পরিচালক) · স্বয়ংক্রিয় পুশ ডেলিভারি
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
              FCM Push
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>সবাইকে নোটিফিকেশন পাঠান</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
