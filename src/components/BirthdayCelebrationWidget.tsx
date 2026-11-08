import React, { useState, useMemo } from 'react';
import { Student, SchoolProfile } from '../types/school';
import {
  getStudentsWithBirthdayThisWeek,
  StudentBirthdayMatch,
  getStudentBirthdayInfo,
} from '../utils/birthdayLogic';
import { BirthdayGreetingCardModal } from './BirthdayGreetingCardModal';
import { toBengaliNumber, getSchoolClassNameBn } from '../utils/schoolLogic';
import {
  Cake,
  Sparkles,
  Calendar,
  Gift,
  Heart,
  ChevronRight,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface BirthdayCelebrationWidgetProps {
  students: Student[];
  schoolProfile?: SchoolProfile;
  onSendWishNotification?: (student: Student, message: string) => void;
  compact?: boolean;
}

export const BirthdayCelebrationWidget: React.FC<BirthdayCelebrationWidgetProps> = ({
  students,
  schoolProfile,
  onSendWishNotification,
  compact = false,
}) => {
  const [selectedMatchForCard, setSelectedMatchForCard] = useState<StudentBirthdayMatch | null>(null);
  const [wishedStudentIds, setWishedStudentIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const birthdayMatches = useMemo(() => {
    return getStudentsWithBirthdayThisWeek(students);
  }, [students]);

  const todayMatches = useMemo(() => {
    return birthdayMatches.filter((m) => m.isToday);
  }, [birthdayMatches]);

  const upcomingThisWeek = useMemo(() => {
    return birthdayMatches.filter((m) => !m.isToday);
  }, [birthdayMatches]);

  const handleSendWish = (match: StudentBirthdayMatch) => {
    setWishedStudentIds((prev) => ({ ...prev, [match.student.id]: true }));
    const msg = `🎂 শুভ জন্মদিন প্রিয় ${match.student.nameBn}! আনন্দ পাঠশালা পরিবারের পক্ষ থেকে একরাশ ভালোবাসা ও শুভকামনা রইল।`;
    if (onSendWishNotification) {
      onSendWishNotification(match.student, msg);
    }
    setToastMessage(`✓ ${match.student.nameBn}-এর জন্মদিনের শুভেচ্ছা পাঠানো হয়েছে!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (birthdayMatches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-amber-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Celebration Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white p-5 sm:p-6 shadow-lg border border-amber-200">
        {/* Subtle decorative shapes */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-rose-600 flex items-center justify-center shrink-0 shadow-md">
              <Cake className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                  🎂 সেলিব্রেশন উইজেট
                </span>
                <span className="text-amber-100 text-xs font-semibold">
                  চলতি সপ্তাহের জন্মদিন ({toBengaliNumber(birthdayMatches.length)} জন)
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold mt-0.5">
                {todayMatches.length > 0
                  ? `আজকের জন্মদিনের তারকা: ${todayMatches.map((m) => m.student.nameBn).join(', ')} 🎉`
                  : 'আসন্ন জন্মদিনের আনন্দ বার্তা ও শুভেচ্ছা কার্ড'}
              </h3>
            </div>
          </div>
        </div>

        {/* Birthday Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {birthdayMatches.map((match) => {
            const isWished = Boolean(wishedStudentIds[match.student.id]);
            return (
              <div
                key={match.student.id}
                className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/25 flex items-center justify-between gap-3 text-white transition hover:bg-white/20"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-300 shrink-0 bg-white shadow-sm">
                    {match.student.photoUrl ? (
                      <img
                        src={match.student.photoUrl}
                        alt={match.student.nameBn}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-900 font-bold text-xs">
                        {match.student.nameBn.slice(0, 2)}
                      </div>
                    )}
                    {match.isToday && (
                      <span className="absolute -top-1 -right-1 text-xs">👑</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm truncate flex items-center gap-1.5">
                      <span>{match.student.nameBn}</span>
                      {match.isToday && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 text-[9px] font-black uppercase">
                          আজ
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-amber-100 truncate">
                      {getSchoolClassNameBn(match.student.className)} · রোল: {match.student.rollNo}
                    </p>
                    <p className="text-[10px] text-pink-100 mt-0.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      {match.isToday
                        ? `${match.ageTurningBn} পূর্ণ হলো!`
                        : `${match.formattedDateBn} (${match.ageTurningBn})`}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedMatchForCard(match)}
                    className="px-2.5 py-1 bg-white text-slate-900 hover:bg-amber-100 font-bold rounded-xl text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>কার্ড</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendWish(match)}
                    disabled={isWished}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      isWished
                        ? 'bg-emerald-400 text-slate-900'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-xs'
                    }`}
                  >
                    {isWished ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>শুভেচ্ছা ✓</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>উইশ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Greeting Card Modal */}
      <BirthdayGreetingCardModal
        isOpen={Boolean(selectedMatchForCard)}
        onClose={() => setSelectedMatchForCard(null)}
        birthdayMatch={selectedMatchForCard}
        schoolProfile={schoolProfile}
      />
    </div>
  );
};
