import React, { useState } from 'react';
import { Plus, Coffee, GraduationCap, Users } from 'lucide-react';
import { AcademicCalendarEvent, AcademicEventCategory } from '../../types/school';

interface AddAcademicEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (newEvent: AcademicCalendarEvent) => void;
}

export const AddAcademicEventModal: React.FC<AddAcademicEventModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
}) => {
  const [newEventTitleBn, setNewEventTitleBn] = useState('');
  const [newEventTitleEn, setNewEventTitleEn] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<AcademicEventCategory>('exam');
  const [newEventStartDate, setNewEventStartDate] = useState('');
  const [newEventEndDate, setNewEventEndDate] = useState('');
  const [newEventDaysCount, setNewEventDaysCount] = useState('১ দিন');
  const [newEventTime, setNewEventTime] = useState('সকাল ০৯:৩০ - দুপুর ১২:০০');
  const [newEventClasses, setNewEventClasses] = useState('সকল শ্রেণি (হাতেখড়ি, প্লে, নার্সারি, কেজি ও ১ম)');
  const [newEventVenue, setNewEventVenue] = useState('আনন্দ পাঠশালা ক্যাম্পাস');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventStatus, setNewEventStatus] = useState('আসন্ন');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitleBn.trim() || !newEventStartDate.trim()) return;

    const newEvent: AcademicCalendarEvent = {
      id: `custom-event-${Date.now()}`,
      titleBn: newEventTitleBn.trim(),
      titleEn: newEventTitleEn.trim() || 'Official School Event',
      category: newEventCategory,
      startDate: newEventStartDate.trim(),
      endDate: newEventEndDate.trim() || undefined,
      daysCountBn: newEventDaysCount.trim() || '১ দিন',
      timeBn: newEventTime.trim(),
      targetClassesBn: newEventClasses.trim(),
      venueBn: newEventVenue.trim() || 'আনন্দ পাঠশালা মূল ক্যাম্পাস',
      descriptionBn:
        newEventDesc.trim() ||
        'আনন্দ পাঠশালার সকল শিক্ষার্থী ও অভিভাবকদের নির্ধারিত সময়ে উপস্থিত থাকার অনুরোধ করা হচ্ছে।',
      statusBadgeBn:
        newEventStatus.trim() ||
        (newEventCategory === 'holiday'
          ? 'ছুটি'
          : newEventCategory === 'exam'
          ? 'পরীক্ষা'
          : 'সমাবেশ'),
      isUpcoming: true,
      priority: 'high',
    };

    onAddEvent(newEvent);
    // Reset Form
    setNewEventTitleBn('');
    setNewEventTitleEn('');
    setNewEventStartDate('');
    setNewEventEndDate('');
    setNewEventDesc('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-8"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">
              অ্যাডমিন ও শিক্ষক কনসোল
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-1">
              নতুন একাডেমিক ইভেন্ট যুক্ত করুন (Add Event)
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Category Picker */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              ইভেন্টের ধরন নির্বাচন করুন *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setNewEventCategory('holiday')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  newEventCategory === 'holiday'
                    ? 'bg-rose-50 border-rose-400 text-rose-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Coffee className="w-4 h-4 text-rose-600" />
                <span>স্কুল ছুটি</span>
              </button>

              <button
                type="button"
                onClick={() => setNewEventCategory('exam')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  newEventCategory === 'exam'
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>পরীক্ষা / মূল্যায়ন</span>
              </button>

              <button
                type="button"
                onClick={() => setNewEventCategory('meeting')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  newEventCategory === 'meeting'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>অভিভাবক সমাবেশ</span>
              </button>
            </div>
          </div>

          {/* Event Title Bangla */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              ইভেন্টের নাম (বাংলায়) *
            </label>
            <input
              type="text"
              required
              value={newEventTitleBn}
              onChange={(e) => setNewEventTitleBn(e.target.value)}
              placeholder="যেমন: বার্ষিক ক্রীড়া প্রতিযোগিতা ও সাংস্কৃতিক উৎসব ২০২৬"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Event Title English */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              Title in English (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={newEventTitleEn}
              onChange={(e) => setNewEventTitleEn(e.target.value)}
              placeholder="e.g. Annual Sports & Cultural Meet 2026"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                শুরুর তারিখ *
              </label>
              <input
                type="text"
                required
                value={newEventStartDate}
                onChange={(e) => setNewEventStartDate(e.target.value)}
                placeholder="যেমন: ১৫ ডিসেম্বর ২০২৬"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                শেষ তারিখ (যদি থাকে)
              </label>
              <input
                type="text"
                value={newEventEndDate}
                onChange={(e) => setNewEventEndDate(e.target.value)}
                placeholder="যেমন: ১৭ ডিসেম্বর ২০২৬"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                স্থায়িত্বকাল (Duration)
              </label>
              <input
                type="text"
                value={newEventDaysCount}
                onChange={(e) => setNewEventDaysCount(e.target.value)}
                placeholder="যেমন: ১ দিন / ৩ দিন"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Time & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                সময়সূচি (Time)
              </label>
              <input
                type="text"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                placeholder="যেমন: সকাল ১০:০০ - দুপুর ১২:০০"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                স্থান (Venue)
              </label>
              <input
                type="text"
                value={newEventVenue}
                onChange={(e) => setNewEventVenue(e.target.value)}
                placeholder="যেমন: আনন্দ পাঠশালা মূল ক্যাম্পাস"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Target Classes & Status Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                প্রযোজ্য শ্রেণি (Target Classes)
              </label>
              <input
                type="text"
                value={newEventClasses}
                onChange={(e) => setNewEventClasses(e.target.value)}
                placeholder="যেমন: প্লে, নার্সারি, কেজি ও ১ম শ্রেণি"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                স্ট্যাটাস ট্যাগ (Status Badge)
              </label>
              <input
                type="text"
                value={newEventStatus}
                onChange={(e) => setNewEventStatus(e.target.value)}
                placeholder="যেমন: আসন্ন, বাধ্যতামূলক, সরকারি ছুটি"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              বিস্তারিত নোটিশ ও নির্দেশনা
            </label>
            <textarea
              rows={2}
              value={newEventDesc}
              onChange={(e) => setNewEventDesc(e.target.value)}
              placeholder="অভিভাবক ও শিক্ষার্থীদের উদ্দেশ্যে জরুরি নির্দেশনা..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ক্যালেন্ডারে যোগ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
