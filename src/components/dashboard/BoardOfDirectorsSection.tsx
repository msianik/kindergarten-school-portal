import React from 'react';
import {
  Building2,
  ShieldCheck,
  Users,
  GraduationCap,
  Plus,
  ExternalLink,
  MessageSquareQuote,
  Edit3,
  Briefcase,
  MapPin,
  Quote,
  Phone,
  Trash2,
} from 'lucide-react';
import { CommitteeDirector } from '../../types/school';
import { getPortalRoleLabelBn } from '../../utils/schoolLogic';

interface BoardOfDirectorsSectionProps {
  directorsList: CommitteeDirector[];
  isPrincipal: boolean;
  logoUrl?: string;
  onAddNewDirector: () => void;
  onEditDirector: (director: CommitteeDirector) => void;
  onDeleteDirector: (id: string, nameBn: string) => void;
  onResetDirectorsToDefault: () => void;
  onNavigateTab: (tab: string) => void;
}

export const BoardOfDirectorsSection: React.FC<BoardOfDirectorsSectionProps> = ({
  directorsList,
  isPrincipal,
  logoUrl,
  onAddNewDirector,
  onEditDirector,
  onDeleteDirector,
  onResetDirectorsToDefault,
  onNavigateTab,
}) => {
  return (
    <div
      id="board-of-directors-management"
      className="bg-white rounded-3xl border-2 border-amber-300/90 p-6 sm:p-7 shadow-xs space-y-6 print:hidden relative overflow-hidden"
    >
      {/* Subtle decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700" />

      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-100 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 border border-amber-300 px-3 py-1 rounded-full text-xs font-black shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              <span>বোর্ড অফ ডিরেক্টরস গভর্ন্যান্স (Board of Directors)</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              <span>সাধারণ শিক্ষক/স্টাফ পর্ষদ থেকে সম্পূর্ণ আলাদা ও স্বতন্ত্র</span>
            </span>
          </div>

          <h3 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Users className="w-6 h-6 text-amber-600" />
            <span>
              প্রতিষ্ঠান পরিচালনা পর্ষদ ও পরিচালকদের বাণী প্রশাসন ({directorsList.length} জন)
            </span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            আনন্দ পাঠশালার মূল নীতিনির্ধারণ, ট্রাস্টি ও পরিচালনা পর্ষদ সদস্যদের নাম, প্রাতিষ্ঠানিক পদবি (Designation), পর্ষদীয় ভূমিকা (Role in Board) এবং পরিচালকদের অনুপ্রেরণামূলক বাণী (Message from the Director) ব্যবস্থাপনা করুন।
          </p>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold">
              👥 মোট পর্ষদ সদস্য: {directorsList.length} জন
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
              💬 সক্রিয় বাণী: {directorsList.filter((d) => d.messageBn).length} টি
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <a
            href="#teachers-directory-section"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer"
            title="উপরে শিক্ষক পর্ষদ তালিকায় ফিরুন"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            <span>শিক্ষক পর্ষদ ⬆</span>
          </a>

          {isPrincipal && (
            <>
              <button
                type="button"
                onClick={onAddNewDirector}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ নতুন পরিচালক যোগ করুন</span>
              </button>
              <button
                type="button"
                onClick={onResetDirectorsToDefault}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition cursor-pointer"
                title="ডিফল্ট পরিচালনা পর্ষদ তালিকায় রিসেট করুন"
              >
                <span>রিসেট ডিফল্ট</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onNavigateTab('public')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-xl border border-amber-300 transition cursor-pointer shadow-2xs"
          >
            <span>ওয়েবসাইটে লাইভ দেখুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Featured Chairman Official Message & Guidance Spotlight */}
      {directorsList.length > 0 && (() => {
        const chairman =
          directorsList.find((d) => d.isChairman) || directorsList[0];
        return (
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/80 to-orange-50/50 rounded-2xl border-2 border-amber-300/90 p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col lg:flex-row items-start gap-5">
              <div className="flex sm:flex-col items-center sm:items-start gap-4 shrink-0 w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-amber-200/80 pb-4 lg:pb-0 lg:pr-5">
                <div className="relative">
                  <img
                    src={chairman.photoUrl || logoUrl}
                    alt={chairman.nameBn}
                    referrerPolicy="no-referrer"
                    className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl object-cover border-2 border-amber-500 shadow-sm bg-white p-0.5"
                  />
                  <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[9.5px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    👑 সভাপতি / চেয়ারম্যান
                  </span>
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950 border border-amber-300">
                    {chairman.roleBn}
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {chairman.nameBn}
                  </h4>
                  <p className="text-xs font-semibold text-slate-600">
                    {chairman.nameEn}
                  </p>
                  {chairman.designationBn && (
                    <p className="text-[11px] text-amber-900 font-bold">
                      {chairman.designationBn}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 flex-1 w-full">
                <div className="flex items-center justify-between gap-2 border-b border-amber-200/70 pb-2.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <MessageSquareQuote className="w-5 h-5 text-amber-600 shrink-0" />
                    <h4 className="text-sm sm:text-base font-black text-amber-950">
                      সভাপতি বা চেয়ারম্যানের অফিসিয়াল বাণী ও দিকনির্দেশনা ({chairman.nameBn})
                    </h4>
                  </div>
                  {isPrincipal && (
                    <button
                      type="button"
                      onClick={() => onEditDirector(chairman)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-white hover:bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl transition cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span>চেয়ারম্যানের বাণী এডিট করুন</span>
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-white/80 p-4 rounded-2xl border border-amber-200/80 shadow-2xs">
                  “{chairman.messageBn}”
                </p>

                {chairman.messageEn && (
                  <p className="text-[11px] text-slate-600 italic leading-relaxed px-1">
                    &quot;{chairman.messageEn}&quot;
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Grid of Directors in Board Management View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {directorsList.map((dir) => (
          <div
            key={dir.id}
            className="p-5 rounded-2xl border-2 border-amber-200/90 bg-gradient-to-b from-amber-50/30 via-white to-white flex flex-col justify-between space-y-4 hover:border-amber-400 hover:shadow-md transition-all shadow-2xs relative group"
          >
            <div className="space-y-3.5">
              {/* Header Badges: Role, Portal Account Role & Login ID */}
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <span
                  className={`text-[10.5px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs ${
                    dir.isChairman
                      ? 'bg-amber-600 text-white'
                      : dir.isManagingDirector
                      ? 'bg-emerald-700 text-white'
                      : dir.roleBn?.includes('সদস্য সচিব')
                      ? 'bg-blue-700 text-white'
                      : 'bg-amber-100 text-amber-950 border border-amber-200'
                  }`}
                >
                  {dir.isChairman && <span>👑</span>}
                  {dir.isManagingDirector && <span>⭐</span>}
                  {dir.roleBn?.includes('সদস্য সচিব') && <span>📋</span>}
                  <span>{dir.roleBn}</span>
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                    রোল:{' '}
                    {getPortalRoleLabelBn(
                      dir.portalRole ||
                        (dir.id === 'dir-3' ? 'super_admin' : 'director')
                    )}
                  </span>
                  {dir.username && (
                    <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                      🔐 ID: {dir.username}
                    </span>
                  )}
                </div>
              </div>

              {/* Specific Institutional Designation (পদবি) */}
              {dir.designationBn && (
                <div className="text-[11px] font-bold text-amber-950 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-amber-700 shrink-0" />
                  <span className="truncate">পদবি: {dir.designationBn}</span>
                </div>
              )}

              {/* Director Avatar & Basic Profile */}
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={dir.photoUrl || logoUrl}
                    alt={dir.nameBn}
                    className="w-16 h-20 rounded-2xl object-cover border-2 border-amber-400 bg-white p-0.5 shadow-2xs"
                  />
                  {dir.isChairman && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                      চেয়ারম্যান
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="text-base font-black text-slate-900 leading-snug truncate">
                    {dir.nameBn}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 truncate">
                    {dir.nameEn}
                  </p>
                  {dir.professionBn && (
                    <p className="text-[11px] text-amber-900 font-semibold truncate flex items-center gap-1">
                      <span>🎓</span>
                      <span>{dir.professionBn}</span>
                    </p>
                  )}
                  {dir.addressBn && (
                    <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{dir.addressBn}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Message from the Director */}
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3.5 space-y-1.5 relative">
                <div className="flex items-center justify-between text-[10.5px] font-black text-amber-950 border-b border-amber-200/60 pb-1">
                  <span className="flex items-center gap-1">
                    <Quote className="w-3.5 h-3.5 text-amber-700" />
                    <span>Message from the Director (বাণী):</span>
                  </span>
                  <span className="text-[9.5px] text-amber-700 font-semibold">
                    পাবলিক হাইলাইট
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans line-clamp-3 italic">
                  “{dir.messageBn ||
                    'কোনো বাণী যুক্ত করা হয়নি। এডিট করে বাণী যুক্ত করুন।'}”
                </p>
              </div>
            </div>

            {/* Admin Card Action Buttons */}
            <div className="pt-2 border-t border-amber-100 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-[11px] text-slate-600 truncate min-w-0">
                {dir.phone && (
                  <a
                    href={`tel:${dir.phone}`}
                    className="hover:text-amber-800 transition truncate flex items-center gap-1"
                    title={`কল করুন: ${dir.phone}`}
                  >
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-mono text-[10.5px]">{dir.phone}</span>
                  </a>
                )}
              </div>

              {isPrincipal && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEditDirector(dir)}
                    className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    title={`পরিচালক ${dir.nameBn} এর তথ্য ও বাণী সম্পাদনা করুন`}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-800" />
                    <span>এডিট ও বাণী</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteDirector(dir.id, dir.nameBn)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-transparent hover:border-rose-200"
                    title="পরিচালককে পরিচালনা পর্ষদ থেকে মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
