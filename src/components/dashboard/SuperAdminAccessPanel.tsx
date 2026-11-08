import React from 'react';
import { DirectorAccessPermission } from '../../types/school';

interface SuperAdminAccessPanelProps {
  isSuperAdmin: boolean;
  directorPermissions: DirectorAccessPermission[];
  onToggleViewAll: (directorId: string) => void;
  onToggleEditAccess: (directorId: string) => void;
  onToggleModule: (directorId: string, moduleId: string) => void;
  onSetAllAccess?: (enable: boolean) => void;
  logoUrl?: string;
  onToggleDirectorAccess?: (directorId: string) => void;
}

const MODULE_OPTIONS = [
  { id: 'students', label: 'শিক্ষার্থী' },
  { id: 'routine', label: 'রুটিন' },
  { id: 'calendar', label: 'ক্যালেন্ডার' },
  { id: 'pickup', label: 'গেট-পাস' },
  { id: 'diary', label: 'ডায়েরি' },
  { id: 'messages', label: 'চ্যাট' },
  { id: 'skills', label: 'স্কিল' },
  { id: 'attendance', label: 'হাজিরা' },
  { id: 'fees', label: 'বেতন/ফি' },
  { id: 'inventory', label: 'অ্যাসেট' },
];

export const SuperAdminAccessPanel: React.FC<SuperAdminAccessPanelProps> = ({
  isSuperAdmin,
  directorPermissions,
  onToggleViewAll,
  onToggleEditAccess,
  onToggleModule,
  onSetAllAccess,
  logoUrl,
}) => {
  if (!isSuperAdmin) return null;

  const nonSuperAdminDirectors = directorPermissions.filter((perm) => !perm.isSuperAdmin);

  return (
    <div className="bg-white rounded-2xl border border-amber-200/90 p-4 sm:p-5 shadow-xs space-y-3.5 print:hidden">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-2xs shrink-0 text-sm">
            👑
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>পরিচালনা পর্ষদের ভিউ ও অ্যাক্সেস নিয়ন্ত্রণ প্যানেল</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.2 rounded-full border border-amber-200">
                সুপার অ্যাডমিন
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              পরিচালকের নামের পাশে এক লাইনে অপশন দেওয়া আছে। যে অপশনে টিক দিবেন, সে কেবল সেই অপশনটি দেখতে ও ব্যবহার করতে পারবে।
            </p>
          </div>
        </div>

        {onSetAllAccess && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onSetAllAccess(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold transition cursor-pointer shadow-2xs"
            >
              সবাইকে সব ভিউ দিন
            </button>
            <button
              type="button"
              onClick={() => onSetAllAccess(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 text-[10.5px] font-bold transition cursor-pointer"
            >
              সব বন্ধ করুন
            </button>
          </div>
        )}
      </div>

      {/* Vertical list of Directors with side-by-side single-line options */}
      <div className="space-y-2">
        {nonSuperAdminDirectors.map((perm) => {
          const isViewAll = Boolean(perm.viewAllModules);
          const isFullEdit = Boolean(
            perm.canEditSchoolAndBoard &&
              perm.canManageNoticesAndEvents &&
              perm.canManageStudentsAndAdmissions &&
              perm.canManageFeesAndAccounts &&
              perm.canApproveGatePassAndDiary
          );

          return (
            <div
              key={perm.directorId}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl border border-slate-200/90 hover:border-amber-300 bg-slate-50/50 hover:bg-white shadow-2xs transition-all"
            >
              {/* Director Identity (Name & Designation) */}
              <div className="flex items-center gap-2.5 min-w-[200px] shrink-0">
                <img
                  src={perm.photoUrl || logoUrl || '/assets/fb/logo.jpg'}
                  alt={perm.nameBn}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-xl object-cover border border-amber-300 shrink-0 bg-white"
                />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                    {perm.nameBn}
                  </h4>
                  <p className="text-[10.5px] font-semibold text-slate-500 truncate">
                    {perm.roleTitleBn}
                  </p>
                </div>
              </div>

              {/* Side-by-Side Single-Line Options: View, Access, and Modules */}
              <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap py-0.5">
                {/* 1. সব ভিউ (Master View) */}
                <label
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black border transition-all cursor-pointer shrink-0 select-none ${
                    isViewAll
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                  title="সকল মডিউল দেখার অপশন একসাথে চালু বা বন্ধ করুন"
                >
                  <input
                    type="checkbox"
                    checked={isViewAll}
                    onChange={() => onToggleViewAll(perm.directorId)}
                    className="w-3.5 h-3.5 rounded text-emerald-700 focus:ring-0 cursor-pointer accent-emerald-600"
                  />
                  <span>সব ভিউ</span>
                </label>

                {/* 2. এডিট অ্যাক্সেস (Master Edit / Access) */}
                <label
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black border transition-all cursor-pointer shrink-0 select-none ${
                    isFullEdit
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                  title="স্কুল প্রোফাইল, শিক্ষার্থী ও ফি এডিট ও অনুমোদন সুবিধা"
                >
                  <input
                    type="checkbox"
                    checked={isFullEdit}
                    onChange={() => onToggleEditAccess(perm.directorId)}
                    className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-0 cursor-pointer accent-amber-600"
                  />
                  <span>এডিট অ্যাক্সেস</span>
                </label>

                {/* Divider between master toggles and module pills */}
                <span className="h-5 w-px bg-slate-300 shrink-0 mx-0.5 hidden sm:inline-block" />

                {/* 3. Individual Modules (যে অপশনগুলো টিক দিলে দেখতে পারবে) */}
                {MODULE_OPTIONS.map((mod) => {
                  const isChecked = isViewAll || (perm.allowedModules || []).includes(mod.id);

                  return (
                    <label
                      key={mod.id}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer shrink-0 select-none ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 opacity-60'
                      }`}
                      title={`${mod.label} মডিউলের ভিউ অ্যাক্সেস`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleModule(perm.directorId, mod.id)}
                        className="w-3 h-3 rounded text-emerald-600 focus:ring-0 cursor-pointer accent-emerald-600"
                      />
                      <span>{mod.label}</span>
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
