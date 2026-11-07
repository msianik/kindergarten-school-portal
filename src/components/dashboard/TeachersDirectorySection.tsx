import React from 'react';
import {
  GraduationCap,
  Users,
  Clock,
  Building2,
  Edit3,
  Palette,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import {
  TeacherMember,
  LeadershipProfiles,
  SchoolProfile,
} from '../../types/school';
import { getPortalRoleLabelBn } from '../../utils/schoolLogic';

interface TeachersDirectorySectionProps {
  teachersList: TeacherMember[];
  leadershipProfiles: LeadershipProfiles;
  schoolProfile: SchoolProfile;
  isPrincipal: boolean;
  onOpenEditProfileModal: (
    tab: 'principal' | 'headTeacher' | 'contact' | 'theme'
  ) => void;
  onOpenAddNewTeacher: () => void;
  onOpenAddNewSupportStaff: () => void;
  onOpenEditTeacher: (teacher: TeacherMember) => void;
}

export const TeachersDirectorySection: React.FC<
  TeachersDirectorySectionProps
> = ({
  teachersList,
  leadershipProfiles,
  schoolProfile,
  isPrincipal,
  onOpenEditProfileModal,
  onOpenAddNewTeacher,
  onOpenAddNewSupportStaff,
  onOpenEditTeacher,
}) => {
  return (
    <div
      id="teachers-directory-section"
      className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-2xs space-y-5 print:hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            <span>একাডেমিক শিক্ষক ও কর্মকর্তা পর্ষদ (Academic Teaching Staff)</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <span>
              প্রিন্সিপাল, প্রধান শিক্ষক ও শিক্ষক পর্ষদ ({teachersList.length} জন)
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            আনন্দ পাঠশালার প্রিন্সিপাল শাফী আব্দুল্লাহ, প্রধান শিক্ষক ফাতেমা আক্তার ও পাঠদানকারী শিক্ষকবৃন্দ। (নীতিনির্ধারণী পরিচালনা পর্ষদ নিচের স্বতন্ত্র বোর্ডে সাজানো)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="#class-routine-section"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
            title="ক্লাস রুটিন ও সময়সূচি সেকশনে যান"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-700" />
            <span>ক্লাস রুটিন ⬇</span>
          </a>
          <a
            href="#board-of-directors-management"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
            title="পরিচালনা পর্ষদ ব্যবস্থাপনা সেকশনে যান"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            <span>পরিচালনা পর্ষদ কনসোল ⬇</span>
          </a>
          {isPrincipal && (
            <>
              <button
                type="button"
                onClick={() => onOpenEditProfileModal('principal')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
                title="স্কুল প্রোফাইল, প্রিন্সিপাল ও প্রধান শিক্ষকের বাণী এবং যোগাযোগ তথ্য এডিট করুন"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                <span>স্কুল প্রোফাইল ও বাণী এডিট</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenEditProfileModal('theme')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
                title="স্কুলের ব্র্যান্ড ও থিম কালার কাস্টমাইজ করুন"
              >
                <Palette className="w-3.5 h-3.5 text-purple-700" />
                <span>স্কুল থিম ও কালার</span>
              </button>
              <button
                type="button"
                onClick={onOpenAddNewTeacher}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ নতুন শিক্ষক যুক্ত করুন</span>
              </button>
              <button
                type="button"
                onClick={onOpenAddNewSupportStaff}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-indigo-700" />
                <span>+ সহায়ক স্টাফ যুক্ত করুন</span>
              </button>
            </>
          )}
          <a
            href={schoolProfile.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto"
          >
            <span>অফিশিয়াল ফেসবুক পেজ</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Principal (Left) & Head Teacher (Right) Highlight Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Principal Shafee Abdullah */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-4 relative">
          <img
            src={leadershipProfiles.principal.photoUrl}
            alt={leadershipProfiles.principal.nameBn}
            referrerPolicy="no-referrer"
            className="w-20 h-24 rounded-2xl object-cover border-2 border-emerald-500 bg-white shrink-0"
          />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded inline-block">
                প্রিন্সিপালের বাণী (Principal&apos;s Message)
              </span>
              {isPrincipal && (
                <button
                  type="button"
                  onClick={() => onOpenEditProfileModal('principal')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="প্রিন্সিপালের বাণী ও বায়ো এডিট করুন"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>বাণী এডিট</span>
                </button>
              )}
            </div>
            <h4 className="text-sm font-black text-slate-900">
              {leadershipProfiles.principal.nameBn} ({leadershipProfiles.principal.nameEn})
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
              “{leadershipProfiles.principal.quoteBn}”
            </p>
          </div>
        </div>

        {/* RIGHT: Head Teacher Fatema Akter */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-4 relative">
          <img
            src={leadershipProfiles.headTeacher.photoUrl}
            alt={leadershipProfiles.headTeacher.nameBn}
            referrerPolicy="no-referrer"
            className="w-20 h-24 rounded-2xl object-cover border-2 border-amber-500 bg-white shrink-0"
          />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded inline-block">
                প্রধান শিক্ষকের বাণী (Head Teacher&apos;s Message)
              </span>
              {isPrincipal && (
                <button
                  type="button"
                  onClick={() => onOpenEditProfileModal('headTeacher')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-white hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="প্রধান শিক্ষকের বাণী ও বায়ো এডিট করুন"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  <span>বাণী এডিট</span>
                </button>
              )}
            </div>
            <h4 className="text-sm font-black text-slate-900">
              {leadershipProfiles.headTeacher.nameBn} ({leadershipProfiles.headTeacher.nameEn})
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
              “{leadershipProfiles.headTeacher.quoteBn}”
            </p>
          </div>
        </div>
      </div>

      {/* All Teachers & Support Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {teachersList.map((t) => {
          const roleBadgeLabel = getPortalRoleLabelBn(
            t.portalRole ||
              (t.staffCategory === 'support_staff'
                ? 'gate_security'
                : t.designationBn.includes('প্রিন্সিপাল')
                ? 'principal'
                : 'teacher')
          );
          const isSupport = t.staffCategory === 'support_staff';
          return (
            <div
              key={t.id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors group relative ${
                isSupport
                  ? 'border-indigo-200 bg-indigo-50/40 hover:border-indigo-400'
                  : 'border-slate-200 bg-slate-50/70 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={t.photoUrl}
                  alt={t.nameBn}
                  referrerPolicy="no-referrer"
                  className="w-14 h-16 rounded-xl object-cover border border-slate-300 bg-white shrink-0"
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-emerald-800 truncate">
                      {t.designationBn}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${
                        isSupport
                          ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                          : t.portalRole === 'principal'
                          ? 'bg-amber-100 text-amber-900 border-amber-200'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      রোল: {roleBadgeLabel}
                    </span>
                  </div>
                  <h5 className="text-xs font-black text-slate-900 truncate">{t.nameBn}</h5>
                  <span className="text-[10px] text-slate-500 block truncate">{t.nameEn}</span>
                  <span className="text-[10px] text-slate-600 block truncate">{t.departmentBn}</span>
                  {t.username && (
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                      <span className="text-[9.5px] font-mono font-bold bg-white text-slate-800 px-1.5 py-0.2 rounded border border-slate-200">
                        🔐 ID: {t.username}
                      </span>
                      {t.phone && (
                        <span className="text-[9.5px] font-mono text-slate-500">
                          📱 {t.phone}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Edit Button for Teachers & Support Staff */}
              {isPrincipal && (
                <button
                  type="button"
                  onClick={() => onOpenEditTeacher(t)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-white border border-transparent hover:border-emerald-200 transition-colors shrink-0 cursor-pointer"
                  title={`${t.nameBn} এর প্রোফাইল, রোল ও লগইন আইডি এডিট করুন`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
