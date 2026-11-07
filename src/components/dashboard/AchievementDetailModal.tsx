import React from 'react';
import { Trophy, Printer, Calendar } from 'lucide-react';
import { Achievement } from '../../types/school';
import { SCHOOL_PROFILE } from '../../data/mockData';

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  onClose: () => void;
  logoUrl?: string;
}

export const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  achievement,
  onClose,
  logoUrl,
}) => {
  if (!achievement) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-7 space-y-4 shadow-2xl border border-amber-300 my-4 max-h-[96vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:p-0"
      >
        {/* Top Bar with Print and Close */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-slate-900 text-sm">
              অফিশিয়াল সম্মাননা সনদপত্র ও মাইলফলক বিবরণ
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>সনদ প্রিন্ট করুন</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Certificate Canvas / Outer Frame */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-amber-50/40 rounded-2xl border-4 border-double border-amber-600/70 relative print:p-8 print:border-amber-700 text-slate-900 space-y-6">
          {/* Corner Ornaments */}
          <div className="absolute top-2 left-2 text-amber-500 font-serif text-lg pointer-events-none">❖</div>
          <div className="absolute top-2 right-2 text-amber-500 font-serif text-lg pointer-events-none">❖</div>
          <div className="absolute bottom-2 left-2 text-amber-500 font-serif text-lg pointer-events-none">❖</div>
          <div className="absolute bottom-2 right-2 text-amber-500 font-serif text-lg pointer-events-none">❖</div>

          {/* Certificate Header */}
          <div className="text-center space-y-2 border-b border-amber-300 pb-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-1 border-2 border-amber-400 shadow-xs">
              <img
                src={logoUrl || '/assets/fb/logo.jpg'}
                alt="আনন্দ পাঠশালা মনোগ্রাম"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">
                {SCHOOL_PROFILE.nameBn}
              </h3>
              <p className="text-xs font-bold text-emerald-800">
                {SCHOOL_PROFILE.sloganBn}
              </p>
              <p className="text-[10px] text-slate-500">
                {SCHOOL_PROFILE.addressBn} · ফোন: {SCHOOL_PROFILE.phoneBn}
              </p>
            </div>

            <div className="pt-2">
              <span className="inline-block px-4 py-1 rounded-full bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-2xs">
                ★ কৃতিত্ব ও সম্মাননা স্মারক সনদ ★
              </span>
            </div>
          </div>

          {/* Certificate Body & Recipient Citation */}
          <div className="text-center space-y-4 py-2">
            <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
              এই বিশেষ মানপত্র অত্যন্ত আনন্দের সাথে প্রদান করা হচ্ছে
            </p>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 border-b-2 border-dashed border-amber-400 max-w-md mx-auto pb-1 text-emerald-900">
                {achievement.recipientNameBn}
              </h2>
              <span className="text-xs font-bold text-amber-700 block pt-1">
                {achievement.awardTitleBn}
              </span>
            </div>

            {/* Optional Image */}
            {achievement.imageUrl && (
              <div className="max-w-xs mx-auto rounded-xl overflow-hidden border-2 border-amber-300 shadow-sm">
                <img
                  src={achievement.imageUrl}
                  alt={achievement.titleBn}
                  referrerPolicy="no-referrer"
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            <div className="max-w-xl mx-auto space-y-2">
              <h4 className="text-sm font-bold text-slate-900">
                {achievement.titleBn}
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed italic bg-white/80 p-3 rounded-xl border border-amber-200">
                “{achievement.descriptionBn}”
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>তারিখ: {achievement.dateBn}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                ({achievement.dateStamp})
              </span>
            </div>
          </div>

          {/* Signatures & Seal Section */}
          <div className="pt-6 border-t border-amber-300 flex items-end justify-between text-center text-xs">
            {/* Principal Signature */}
            <div className="space-y-1">
              <div className="font-serif italic font-bold text-emerald-900 text-sm h-7 flex items-end justify-center">
                শাফী আব্দুল্লাহ
              </div>
              <div className="border-t border-slate-400 w-36 mx-auto pt-1">
                <p className="font-bold text-slate-900">শাফী আব্দুল্লাহ</p>
                <p className="text-[10px] text-slate-500">অধ্যক্ষ ও প্রতিষ্ঠাতা পরিচালক</p>
              </div>
            </div>

            {/* Seal Emblem */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-700 p-1 flex flex-col items-center justify-center bg-white shadow-2xs">
                <span className="text-[7px] font-bold text-amber-950">আনন্দ পাঠশালা</span>
                <span className="text-[8px] font-black text-emerald-800">★ সিল মহর ★</span>
                <span className="text-[6.5px] text-slate-600">কুষ্টিয়া · ২০১৬</span>
              </div>
              <span className="text-[8px] text-slate-400 mt-1">অফিসিয়াল সিল</span>
            </div>

            {/* Head Teacher Signature */}
            <div className="space-y-1">
              <div className="font-serif italic font-bold text-slate-700 text-sm h-7 flex items-end justify-center">
                ফাতেমা আক্তার
              </div>
              <div className="border-t border-slate-400 w-36 mx-auto pt-1">
                <p className="font-bold text-slate-900">ফাতেমা আক্তার</p>
                <p className="text-[10px] text-slate-500">প্রধান শিক্ষক, আনন্দ পাঠশালা</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 print:hidden">
          <span>আনন্দ পাঠশালা প্রাতিষ্ঠানিক আর্কাইভ ও মেধা স্বীকৃতি রেকর্ড।</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:underline cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
