import React from 'react';
import { Eye, ShieldCheck, Check, Sparkles, Building2, GraduationCap, DollarSign, Bell, KeyRound } from 'lucide-react';
import { DirectorAccessPermission } from '../../types/school';

export interface SuperAdminAccessPanelProps {
  isSuperAdmin: boolean;
  directorPermissions: DirectorAccessPermission[];
  onToggleMasterEdit: (directorId: string) => void;
  onToggleEditPermission: (
    directorId: string,
    permissionKey:
      | 'canEditSchoolAndBoard'
      | 'canManageStudentsAndAdmissions'
      | 'canManageFeesAndAccounts'
      | 'canManageNoticesAndEvents'
      | 'canApproveGatePassAndDiary'
  ) => void;
  onSetAllEditAccess?: (enable: boolean) => void;
  logoUrl?: string;
  // Backward compatibility
  onToggleViewAll?: (directorId: string) => void;
  onToggleEditAccess?: (directorId: string) => void;
  onToggleModule?: (directorId: string, moduleId: string) => void;
  onSetAllAccess?: (enable: boolean) => void;
}

const EDIT_PERMISSION_OPTIONS = [
  {
    key: 'canEditSchoolAndBoard' as const,
    label: 'স্কুল ও পর্ষদ',
    description: 'স্কুল প্রোফাইল, পরিচালনা পর্ষদ ও শিক্ষক তালিকা এডিট ও সেভ করার অনুমোদন',
    icon: Building2,
  },
  {
    key: 'canManageStudentsAndAdmissions' as const,
    label: 'শিক্ষার্থী ও ভর্তি',
    description: 'নতুন শিক্ষার্থী যোগ, তথ্য এডিট ও শিক্ষার্থী ডাটাবেজ নিয়ন্ত্রণ অনুমোদন',
    icon: GraduationCap,
  },
  {
    key: 'canManageFeesAndAccounts' as const,
    label: 'ফি ও হিসাব',
    description: 'টিউশন ফি কালেকশন অনুমোদন, ইনভয়েস তৈরি ও স্কুল একাউন্টস এডিট সুবিধা',
    icon: DollarSign,
  },
  {
    key: 'canManageNoticesAndEvents' as const,
    label: 'নোটিশ ও ইভেন্ট',
    description: 'জরুরি নোটিশ প্রকাশ, অর্জন এডিট ও একাডেমিক ক্যালেন্ডার আপডেট অনুমোদন',
    icon: Bell,
  },
  {
    key: 'canApproveGatePassAndDiary' as const,
    label: 'গেট-পাস ও ডায়েরি',
    description: 'ডিজিটাল গেট-পাস ছাড়পত্র প্রদান ও ক্লাসরুম ডায়েরি অনুমোদন সুবিধা',
    icon: KeyRound,
  },
];

export const SuperAdminAccessPanel: React.FC<SuperAdminAccessPanelProps> = ({
  isSuperAdmin,
  directorPermissions,
  onToggleMasterEdit,
  onToggleEditPermission,
  onSetAllEditAccess,
  onSetAllAccess,
  logoUrl,
}) => {
  if (!isSuperAdmin) return null;

  const nonSuperAdminDirectors = directorPermissions.filter((perm) => !perm.isSuperAdmin);

  const handleSetAll = (enable: boolean) => {
    if (onSetAllEditAccess) {
      onSetAllEditAccess(enable);
    } else if (onSetAllAccess) {
      onSetAllAccess(enable);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-200/90 p-4 sm:p-5 shadow-xs space-y-3.5 print:hidden">
      {/* Compact Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-amber-100/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-2xs shrink-0 text-base">
            👑
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2 flex-wrap">
              <span>পরিচালনা পর্ষদের এডিট ও নিয়ন্ত্রণ ক্ষমতা</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                সুপার অ্যাডমিন
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 leading-tight">
              সুপার অ্যাডমিন ও পরিচালকের মধ্যে ভিউ ১০০% উন্মুক্ত। পরিচালকের নামের পাশে এক লাইনে এডিট অপশনসমূহ রয়েছে; যেটিতে টিক দিবেন, কেবল তিনি সেটি এডিট করতে পারবেন।
            </p>
          </div>
        </div>

        {/* Global Batch Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleSetAll(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black transition cursor-pointer shadow-2xs flex items-center gap-1.5"
            title="সকল পরিচালকের জন্য পূর্ণ এডিট ক্ষমতা উন্মুক্ত করুন"
          >
            <Check className="w-3.5 h-3.5" />
            <span>সবাইকে পূর্ণ এডিট দিন</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetAll(false)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-black transition cursor-pointer flex items-center gap-1.5"
            title="সকল পরিচালকের জন্য শুধুমাত্র ভিউ মোড সক্রিয় করুন (এডিট বন্ধ)"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>সবাইকে শুধু ভিউ মোড</span>
          </button>
        </div>
      </div>

      {/* Vertical list of Directors with side-by-side single-line options filling the row */}
      <div className="space-y-2">
        {nonSuperAdminDirectors.map((perm) => {
          const isFullEdit = Boolean(
            perm.canEditSchoolAndBoard &&
              perm.canManageNoticesAndEvents &&
              perm.canManageStudentsAndAdmissions &&
              perm.canManageFeesAndAccounts &&
              perm.canApproveGatePassAndDiary
          );

          const activeCount = [
            perm.canEditSchoolAndBoard,
            perm.canManageStudentsAndAdmissions,
            perm.canManageFeesAndAccounts,
            perm.canManageNoticesAndEvents,
            perm.canApproveGatePassAndDiary,
          ].filter(Boolean).length;

          return (
            <div
              key={perm.directorId}
              className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200/90 hover:border-amber-300/80 bg-slate-50/60 hover:bg-white shadow-2xs transition-all"
            >
              {/* Director Identity (Photo, Name, Designation & Mode Pill) */}
              <div className="flex items-center gap-2.5 min-w-[210px] shrink-0">
                <img
                  src={perm.photoUrl || logoUrl || '/assets/fb/logo.jpg'}
                  alt={perm.nameBn}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover border border-amber-300 shrink-0 bg-white shadow-2xs"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {perm.nameBn}
                    </h4>
                    {isFullEdit ? (
                      <span className="text-[9.5px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md border border-amber-300">
                        পূর্ণ এডিট
                      </span>
                    ) : activeCount > 0 ? (
                      <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded-md border border-emerald-300">
                        {activeCount} এডিট
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded-md">
                        ভিউ অনলি
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] font-semibold text-slate-500 truncate">
                    {perm.roleTitleBn}
                  </p>
                </div>
              </div>

              {/* Side-by-Side Single-Line Options: View Pill + Full Edit + Specific Edit Options */}
              <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2 flex-wrap xl:flex-nowrap justify-start xl:justify-end py-0.5">
                {/* 1. ভিউ স্ট্যাটাস (View Status: All Open) */}
                <div
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 shrink-0 select-none cursor-default"
                  title="সুপার অ্যাডমিনের মতোই সকল পরিচালক সম্পূর্ণ পোর্টাল ভিউ করতে পারেন (উন্মুক্ত)"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>সব ভিউ: উন্মুক্ত</span>
                </div>

                {/* 2. মাস্টার পূর্ণ এডিট (Full Edit Toggle) */}
                <label
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer shrink-0 select-none ${
                    isFullEdit
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs ring-1 ring-amber-400/40'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                  title="পরিচালককে সকল সেকশনের এডিট ক্ষমতা একসাথে প্রদান করুন"
                >
                  <input
                    type="checkbox"
                    checked={isFullEdit}
                    onChange={() => onToggleMasterEdit(perm.directorId)}
                    className="w-3.5 h-3.5 rounded text-slate-900 focus:ring-0 cursor-pointer accent-amber-500"
                  />
                  <span>✏️ পূর্ণ এডিট</span>
                </label>

                {/* Vertical Divider */}
                <span className="hidden xl:inline-block h-6 w-px bg-slate-300/80 shrink-0 mx-0.5" />

                {/* 3. Specific Edit Options (এক লাইনে পাশাপাশি) */}
                {EDIT_PERMISSION_OPTIONS.map((opt) => {
                  const isChecked = Boolean(perm[opt.key]);
                  const Icon = opt.icon;

                  return (
                    <label
                      key={opt.key}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer shrink-0 select-none ${
                        isChecked
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-400/90 shadow-2xs font-black'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200/90 hover:border-slate-300'
                      }`}
                      title={opt.description}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleEditPermission(perm.directorId, opt.key)}
                        className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-0 cursor-pointer accent-emerald-600"
                      />
                      <Icon className={`w-3.5 h-3.5 ${isChecked ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
