import React from 'react';
import { DirectorAccessPermission } from '../../types/school';

interface SuperAdminAccessPanelProps {
  isSuperAdmin: boolean;
  directorPermissions: DirectorAccessPermission[];
  showAccessControlPanel: boolean;
  setShowAccessControlPanel: (show: boolean) => void;
  onResetPermissions: () => void;
  onSetPreset: (directorId: string, preset: 'view_only' | 'full_edit') => void;
  onTogglePermission: (
    directorId: string,
    field:
      | 'viewAllModules'
      | 'canEditSchoolAndBoard'
      | 'canManageNoticesAndEvents'
      | 'canManageStudentsAndAdmissions'
      | 'canManageFeesAndAccounts'
      | 'canApproveGatePassAndDiary'
  ) => void;
  onToggleModule: (directorId: string, moduleId: string) => void;
  logoUrl?: string;
}

export const SuperAdminAccessPanel: React.FC<SuperAdminAccessPanelProps> = ({
  isSuperAdmin,
  directorPermissions,
  showAccessControlPanel,
  setShowAccessControlPanel,
  onResetPermissions,
  onSetPreset,
  onTogglePermission,
  onToggleModule,
  logoUrl,
}) => {
  if (!isSuperAdmin) return null;

  const moduleLabels: { id: string; label: string }[] = [
    { id: 'overview', label: 'ড্যাশবোর্ড' },
    { id: 'students', label: 'শিক্ষার্থী' },
    { id: 'pickup', label: 'গেট-পাস' },
    { id: 'diary', label: 'ডায়েরি' },
    { id: 'skills', label: 'স্কিল কার্ড' },
    { id: 'attendance', label: 'হাজিরা' },
    { id: 'fees', label: 'বেতন/ফি' },
    { id: 'workspace', label: 'ড্রাইভ' },
  ];

  return (
    <div className="bg-gradient-to-br from-amber-50/90 via-white to-emerald-50/60 rounded-3xl border-2 border-amber-300/90 p-5 sm:p-6 shadow-xs space-y-5 print:hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <img
            src="/assets/biddalay/mostofa_mamun.jpg"
            alt="মোস্তফা আল মামুন — সুপার অ্যাডমিন"
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-sm shrink-0 bg-white"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-600 text-white shadow-2xs">
                👑 সুপার অ্যাডমিন কন্ট্রোল সেন্টার
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                সকল পরিচালকের সবকিছু ভিউ অপশন সক্রিয়
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              সুপার অ্যাডমিন: মোস্তফা আল মামুন (পরিচালক ও সদস্য সচিব — Director &amp; Secretary)
            </h3>
            <p className="text-xs text-slate-600">
              সিস্টেমের প্রত্যেক পরিচালককেই সবকিছু ভিউয়ের অপশন দেওয়া আছে। কখন কোন পরিচালককে কোন এডিট বা মডিউল অ্যাক্সেস দেওয়া হবে তা এখান থেকে সুপার অ্যাডমিন নির্ধারণ করেন।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={onResetPermissions}
            className="px-3 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition cursor-pointer"
          >
            ডিফল্ট ভিউ মোডে রিসেট
          </button>
          <button
            type="button"
            onClick={() => setShowAccessControlPanel(!showAccessControlPanel)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            {showAccessControlPanel
              ? 'অ্যাক্সেস সুইচ প্যানেল সংক্ষিপ্ত করুন'
              : 'অ্যাক্সেস সুইচ প্যানেল খুলুন'}
          </button>
        </div>
      </div>

      {/* Granular Director Permission Matrix */}
      {showAccessControlPanel && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {directorPermissions
            .filter((perm) => !perm.isSuperAdmin)
            .map((perm) => {
              const isFullEdit =
                perm.canEditSchoolAndBoard &&
                perm.canManageNoticesAndEvents &&
                perm.canManageStudentsAndAdmissions &&
                perm.canManageFeesAndAccounts &&
                perm.canApproveGatePassAndDiary;

              return (
                <div
                  key={perm.directorId}
                  className="bg-white rounded-2xl border border-amber-200/90 p-4 shadow-2xs space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Director Header */}
                    <div className="flex items-start justify-between gap-2.5 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={perm.photoUrl || logoUrl}
                          alt={perm.nameBn}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-2xl object-cover border border-amber-300 shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-slate-900 truncate">
                            {perm.nameBn}
                          </h4>
                          <p className="text-[11px] font-bold text-amber-800 truncate">
                            {perm.roleTitleBn}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">
                            ID: {perm.username} · {perm.phone}
                          </p>
                        </div>
                      </div>

                      {/* Quick Preset Buttons */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            isFullEdit
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {isFullEdit ? '✏️ পূর্ণ এডিট ও ভিউ' : '👁️ সবকিছু ভিউ মোড'}
                        </span>
                        <div className="flex items-center gap-1 pt-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              onSetPreset(perm.directorId, 'view_only')
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                              !isFullEdit
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            শুধু ভিউ
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onSetPreset(perm.directorId, 'full_edit')
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                              isFullEdit
                                ? 'bg-emerald-700 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            পূর্ণ অ্যাক্সেস
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Permission Toggles Grid */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        সুপার অ্যাডমিন নির্ধারিত অ্যাক্সেস ও পারমিশনসমূহ:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                        {(
                          [
                            {
                              key: 'viewAllModules',
                              label: '👁️ সবকিছু ভিউ অপশন',
                            },
                            {
                              key: 'canEditSchoolAndBoard',
                              label: '🏛️ প্রোফাইল ও পর্ষদ এডিট',
                            },
                            {
                              key: 'canManageNoticesAndEvents',
                              label: '📢 নোটিশ ও ইভেন্ট এডিট',
                            },
                            {
                              key: 'canManageStudentsAndAdmissions',
                              label: '🎓 শিক্ষার্থী ও ভর্তি এডিট',
                            },
                            {
                              key: 'canManageFeesAndAccounts',
                              label: '💳 ফি ও হিসাব অনুমোদন',
                            },
                            {
                              key: 'canApproveGatePassAndDiary',
                              label: '🛡️ গেট-পাস ও ডায়েরি কন্ট্রোল',
                            },
                          ] as const
                        ).map((item) => {
                          const active = Boolean(perm[item.key]);
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() =>
                                onTogglePermission(perm.directorId, item.key)
                              }
                              className={`px-2.5 py-1.5 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer hover:border-amber-400 ${
                                active
                                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              <span className="text-[11px] truncate">
                                {item.label}
                              </span>
                              <span
                                className={`text-[9.5px] font-black px-1.5 py-0.2 rounded ${
                                  active
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {active ? 'চালু' : 'বন্ধ'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Allowed View Modules Strip */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-500 block">
                        মডিউল ভিউ অ্যাক্সেস ({perm.allowedModules.length}/৮টি সক্রিয়):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {moduleLabels.map((mod) => {
                          const modActive =
                            perm.viewAllModules ||
                            perm.allowedModules.includes(mod.id);
                          return (
                            <button
                              key={mod.id}
                              type="button"
                              onClick={() =>
                                onToggleModule(perm.directorId, mod.id)
                              }
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                                modActive
                                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                                  : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                              }`}
                            >
                              {mod.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span>নিয়ন্ত্রক: মোস্তফা আল মামুন (সুপার অ্যাডমিন)</span>
                    <span className="font-semibold text-emerald-700">
                      {perm.lastUpdatedAtBn || 'সকল ভিউ চালু'}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};
