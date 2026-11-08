import React from 'react';
import { DirectorAccessPermission } from '../../types/school';
import { Check, X } from 'lucide-react';

interface SuperAdminAccessPanelProps {
  isSuperAdmin: boolean;
  directorPermissions: DirectorAccessPermission[];
  onToggleDirectorAccess: (directorId: string) => void;
  onSetAllAccess?: (enable: boolean) => void;
  logoUrl?: string;
  // Optional for backwards compatibility
  showAccessControlPanel?: boolean;
  setShowAccessControlPanel?: (show: boolean) => void;
  onResetPermissions?: () => void;
  onSetPreset?: (directorId: string, preset: 'view_only' | 'full_edit') => void;
  onTogglePermission?: (
    directorId: string,
    field:
      | 'viewAllModules'
      | 'canEditSchoolAndBoard'
      | 'canManageNoticesAndEvents'
      | 'canManageStudentsAndAdmissions'
      | 'canManageFeesAndAccounts'
      | 'canApproveGatePassAndDiary'
  ) => void;
  onToggleModule?: (directorId: string, moduleId: string) => void;
}

export const SuperAdminAccessPanel: React.FC<SuperAdminAccessPanelProps> = ({
  isSuperAdmin,
  directorPermissions,
  onToggleDirectorAccess,
  onSetAllAccess,
  logoUrl,
}) => {
  if (!isSuperAdmin) return null;

  const nonSuperAdminDirectors = directorPermissions.filter((perm) => !perm.isSuperAdmin);

  return (
    <div className="bg-white rounded-2xl border border-amber-200/90 p-4 sm:p-5 shadow-xs space-y-4 print:hidden">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-2xs shrink-0 text-base">
            👑
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
              <span>পরিচালনা পর্ষদের ভিউ ও অ্যাক্সেস সুইচ</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                সুপার অ্যাডমিন
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              পরিচালকদের নাম নিচে দেওয়া হলো। পাশের অপশনে টিক দিলে ভিউ/অ্যাক্সেস সক্রিয় হবে, টিক না দিলে বন্ধ থাকবে।
            </p>
          </div>
        </div>

        {onSetAllAccess && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onSetAllAccess(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold transition cursor-pointer"
            >
              সব চালু
            </button>
            <button
              type="button"
              onClick={() => onSetAllAccess(false)}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-bold transition cursor-pointer"
            >
              সব বন্ধ
            </button>
          </div>
        )}
      </div>

      {/* Vertical list of Directors with single clean checkbox toggle */}
      <div className="space-y-2">
        {nonSuperAdminDirectors.map((perm) => {
          const isActive = Boolean(perm.viewAllModules);

          return (
            <div
              key={perm.directorId}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isActive
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-slate-50/70 border-slate-200 opacity-80'
              }`}
            >
              {/* Director Info */}
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={perm.photoUrl || logoUrl || '/assets/fb/logo.jpg'}
                  alt={perm.nameBn}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover border border-amber-200 shrink-0 bg-white"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-black text-slate-900 truncate">
                      {perm.nameBn}
                    </h4>
                    {isActive ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.2 rounded-full">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>সক্রিয়</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.2 rounded-full">
                        <X className="w-3 h-3 text-rose-600" />
                        <span>বন্ধ</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {perm.roleTitleBn}
                  </p>
                </div>
              </div>

              {/* Single Checkbox Option */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 px-3 py-1.5 rounded-xl border bg-white hover:bg-slate-50 transition-all shadow-2xs">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => onToggleDirectorAccess(perm.directorId)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                />
                <span
                  className={`text-xs font-bold ${
                    isActive ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {isActive ? 'ভিউ ও অ্যাক্সেস চালু' : 'অ্যাক্সেস বন্ধ'}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
