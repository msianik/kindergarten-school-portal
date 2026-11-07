import React from 'react';
import { Phone } from 'lucide-react';
import { Student } from '../../types/school';

interface StudentInspectModalProps {
  student: Student | null;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const StudentInspectModal: React.FC<StudentInspectModalProps> = ({
  student,
  onClose,
  onNavigateTab,
}) => {
  if (!student) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-xs ${student.avatarColor}`}
            >
              {student.rollNo}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                {student.nameBn}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {student.nameEn} · {student.className} (শাখা {student.section})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Quick Status & Bio Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block">
              বর্তমান অবস্থান
            </span>
            <span
              className={`inline-block mt-0.5 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                student.currentStatus === 'in_class'
                  ? 'bg-emerald-100 text-emerald-800'
                  : student.currentStatus === 'picked_up'
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {student.currentStatus === 'in_class'
                ? 'শ্রেণিকক্ষে উপস্থিত'
                : student.currentStatus === 'picked_up'
                ? 'ছুটিপ্রাপ্ত (Picked Up)'
                : 'অনুপস্থিত'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block">
              রক্তের গ্রুপ
            </span>
            <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">
              {student.bloodGroup || 'জানা নেই'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-bold block">
              জন্ম তারিখ
            </span>
            <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">
              {student.birthDate}
            </span>
          </div>
        </div>

        {/* Parents & Contact Information */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-950">
              পিতা: {student.fatherNameBn}
            </span>
            <span className="font-bold text-amber-950">
              মাতা: {student.motherNameBn}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[11px]">
            <span className="text-slate-600 truncate">
              ঠিকানা: {student.homeAddressBn}
            </span>
            {student.emergencyPhone && (
              <a
                href={`tel:${student.emergencyPhone}`}
                className="font-mono text-emerald-700 font-bold hover:underline flex items-center gap-1 shrink-0 ml-2"
              >
                <Phone className="w-3 h-3" />
                {student.emergencyPhone}
              </a>
            )}
          </div>
        </div>

        {/* Authorized Pickups */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-700 block">
            অনুমোদিত গেট-পাস অভিভাবক ({student.authorizedPickups?.length || 0} জন):
          </span>
          <div className="space-y-1">
            {student.authorizedPickups?.map((p) => (
              <div
                key={p.id}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">
                    {p.relationBn[0]}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">{p.nameBn}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">
                      ({p.relationBn})
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10.5px] text-slate-600">
                  {p.phone}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateTab('attendance');
            }}
            className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition cursor-pointer"
          >
            হাজিরা শিট
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateTab('pickup');
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition cursor-pointer"
          >
            গেট-পাস লগ
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateTab('skills');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-xs cursor-pointer"
          >
            স্কিল রিপোর্ট কার্ড দেখুন
          </button>
        </div>
      </div>
    </div>
  );
};
