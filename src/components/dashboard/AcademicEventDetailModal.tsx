import React from 'react';
import { CalendarDays, Bell } from 'lucide-react';
import { AcademicCalendarEvent } from '../../types/school';

interface AcademicEventDetailModalProps {
  event: AcademicCalendarEvent | null;
  onClose: () => void;
  isReminded: boolean;
  onToggleReminder: (event: AcademicCalendarEvent) => void;
  googleCalendarLink: string;
}

export const AcademicEventDetailModal: React.FC<AcademicEventDetailModalProps> = ({
  event,
  onClose,
  isReminded,
  onToggleReminder,
  googleCalendarLink,
}) => {
  if (!event) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">
                আনন্দ পাঠশালা অফিশিয়াল নোটিশ
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                {event.titleBn}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono">
                {event.titleEn}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Information Grid */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500">ইভেন্টের ধরন:</span>
            <span className="font-bold text-slate-800">
              {event.category === 'holiday'
                ? '🏖️ স্কুল ছুটির দিন'
                : event.category === 'exam'
                ? '📝 পরীক্ষার সময়সূচি / মূল্যায়ন'
                : '👨‍👩‍👧‍👦 অভিভাবক সমাবেশ'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500">তারিখ:</span>
            <span className="font-bold text-emerald-800">
              {event.startDate}{' '}
              {event.endDate ? `থেকে ${event.endDate}` : ''}{' '}
              {event.daysCountBn ? `(${event.daysCountBn})` : ''}
            </span>
          </div>

          {event.timeBn && (
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">সময়:</span>
              <span className="font-bold text-slate-800">{event.timeBn}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500">প্রযোজ্য শ্রেণি:</span>
            <span className="font-bold text-amber-800">{event.targetClassesBn}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">স্থান:</span>
            <span className="font-bold text-slate-800">{event.venueBn}</span>
          </div>
        </div>

        {/* Detailed Instructions */}
        <div className="space-y-1.5 text-xs">
          <h5 className="font-bold text-slate-900">নির্দেশনা ও বিস্তারিত তথ্য:</h5>
          <p className="text-slate-600 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
            {event.descriptionBn}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onToggleReminder(event)}
            className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              isReminded
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>
              {isReminded
                ? 'রিমাইন্ডার অন রয়েছে ✓'
                : 'রিমাইন্ডার অন করুন'}
            </span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={googleCalendarLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Google Calendar-এ যুক্ত করুন</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
