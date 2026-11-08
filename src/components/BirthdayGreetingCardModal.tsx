import React, { useRef } from 'react';
import { Student, SchoolProfile } from '../types/school';
import { StudentBirthdayMatch } from '../utils/birthdayLogic';
import { toBengaliNumber, getSchoolClassNameBn } from '../utils/schoolLogic';
import { SCHOOL_PROFILE } from '../data/mockData';
import {
  Printer,
  X,
  Cake,
  Sparkles,
  Heart,
  Share2,
  Calendar,
  CheckCircle2,
  Award,
} from 'lucide-react';

interface BirthdayGreetingCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  birthdayMatch: StudentBirthdayMatch | null;
  schoolProfile?: SchoolProfile;
}

export const BirthdayGreetingCardModal: React.FC<BirthdayGreetingCardModalProps> = ({
  isOpen,
  onClose,
  birthdayMatch,
  schoolProfile = SCHOOL_PROFILE,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !birthdayMatch) return null;

  const { student, ageTurning, ageTurningBn, formattedDateBn, isToday } = birthdayMatch;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col my-4 print:my-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Controls Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Cake className="w-5 h-5 text-amber-200 animate-bounce" />
            <span className="font-bold text-sm sm:text-base">
              ডিজিটাল বার্থডে গ্রিটিং কার্ড
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-slate-900 hover:bg-amber-100 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-xl text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Festive Greeting Card Sheet */}
        <div
          ref={cardRef}
          className="p-6 sm:p-8 bg-gradient-to-b from-amber-50 via-pink-50/40 to-emerald-50/40 relative text-center print:p-8 print:w-full font-sans"
        >
          {/* Decorative Corner Stars */}
          <div className="absolute top-4 left-4 text-2xl animate-spin-slow">🎈</div>
          <div className="absolute top-4 right-4 text-2xl">🎉</div>
          <div className="absolute bottom-4 left-4 text-2xl">🎁</div>
          <div className="absolute bottom-4 right-4 text-2xl">🌟</div>

          {/* School Header */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <img
              src={schoolProfile.logoUrl || '/assets/biddalay/logo.png'}
              alt="Logo"
              className="w-10 h-10 object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="text-left">
              <h4 className="text-base font-extrabold text-emerald-800 leading-tight">
                {schoolProfile.nameBn || 'আনন্দ পাঠশালা'}
              </h4>
              <span className="text-[10px] text-slate-500 font-semibold block">
                কিন্ডারগার্টেন ও জুনিয়র একাডেমি · কুষ্টিয়া
              </span>
            </div>
          </div>

          {/* Big Festive Heading */}
          <div className="my-2">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm">
              {isToday ? '🎂 আজ শুভ জন্মদিন!' : '🎉 শুভ জন্মদিনের আগাম বার্তা'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-rose-600 mt-2 tracking-tight">
              শুভ জন্মদিন!
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              আনন্দ পাঠশালা পরিবারের পক্ষ থেকে একরাশ ভালোবাসা ও আশীর্বাদ
            </p>
          </div>

          {/* Student Photo with Festive Frame */}
          <div className="relative inline-block my-4">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-amber-400 shadow-xl mx-auto bg-white p-1">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.nameBn}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-amber-100 flex items-center justify-center text-3xl font-bold text-amber-800">
                  {student.nameBn.slice(0, 2)}
                </div>
              )}
            </div>
            {/* Age Badge */}
            <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-md whitespace-nowrap">
              {ageTurningBn} পূর্ণ হলো!
            </div>
          </div>

          {/* Student Name & Class Details */}
          <div className="mt-2 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {student.nameBn}
            </h2>
            <p className="text-xs font-semibold text-emerald-800">
              শ্রেণি: {getSchoolClassNameBn(student.className)} · রোল: {student.rollNo} · শাখা: {student.section}
            </p>
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              জন্মদিন: {formattedDateBn}
            </p>
          </div>

          {/* Personalized Warm Greeting Note */}
          <div className="my-5 p-4 rounded-2xl bg-white/90 border border-amber-200 shadow-xs max-w-md mx-auto text-xs text-slate-700 leading-relaxed italic">
            "স্নেহের {student.nameBn}, তোমার প্রতিটি দিন ভরে উঠুক হাসি, গান, আনন্দ আর নতুন নতুন শেখার আনন্দে। তোমার ভবিষ্যৎ হোক আলোকোজ্জ্বল ও সুন্দর। আনন্দ পাঠশালার প্রতিটি শিক্ষক ও সহপাঠী তোমার দীর্ঘায়ু ও সুস্বাস্থ্য কামনা করে।"
          </div>

          {/* Signature Strip */}
          <div className="pt-4 border-t border-amber-200/80 flex items-center justify-between text-left text-xs max-w-sm mx-auto">
            <div>
              <span className="text-[10px] text-slate-400 block">শুভেচ্ছান্তে:</span>
              <strong className="text-emerald-900 block font-bold">
                {schoolProfile.principalNameBn || 'শাফী আব্দুল্লাহ'}
              </strong>
              <span className="text-[10px] text-slate-500">অধ্যক্ষ, আনন্দ পাঠশালা</span>
            </div>
            <div className="text-right">
              <div className="inline-block px-2.5 py-1 bg-amber-100 border border-amber-300 rounded-xl text-[10px] font-bold text-amber-900">
                ★ আনন্দময় শৈশব ★
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
