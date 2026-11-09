import React, { useState } from 'react';
import {
  Eye,
  ShieldCheck,
  Check,
  Building2,
  GraduationCap,
  DollarSign,
  Bell,
  KeyRound,
  Users,
  UserCheck,
  Lock,
  RotateCcw,
  BookOpen,
  HeartPulse,
  CreditCard,
  MessageSquare,
  Award,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  DirectorAccessPermission,
  UserRole,
  RolePolicyConfig,
  DEFAULT_ROLE_POLICY_CONFIG,
} from '../../types/school';
import {
  getRolePolicyConfig,
  saveRolePolicyConfig,
} from '../../utils/schoolLogic';

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
  onSelectRole?: (role: UserRole) => void;
  logoUrl?: string;
  // Backward compatibility
  onToggleViewAll?: (directorId: string) => void;
  onToggleEditAccess?: (directorId: string) => void;
  onToggleModule?: (directorId: string, moduleId: string) => void;
  onSetAllAccess?: (enable: boolean) => void;
}

type AccessPanelSection = 'directors' | 'teachers' | 'parents' | 'staff' | 'principal';

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
  onSelectRole,
  onSetAllAccess,
  logoUrl,
}) => {
  if (!isSuperAdmin) return null;

  const [activeTab, setActiveTab] = useState<AccessPanelSection>('directors');
  const [rolePolicy, setRolePolicy] = useState<RolePolicyConfig>(() => getRolePolicyConfig());
  const [panelToast, setPanelToast] = useState<string | null>(null);

  const nonSuperAdminDirectors = directorPermissions.filter((perm) => !perm.isSuperAdmin);

  const showToast = (msg: string) => {
    setPanelToast(msg);
    setTimeout(() => setPanelToast(null), 3000);
  };

  const handleSetAll = (enable: boolean) => {
    if (onSetAllEditAccess) {
      onSetAllEditAccess(enable);
    } else if (onSetAllAccess) {
      onSetAllAccess(enable);
    }
  };

  const handleToggleTeacherPolicy = (key: keyof RolePolicyConfig['teacher']) => {
    const updated: RolePolicyConfig = {
      ...rolePolicy,
      teacher: {
        ...rolePolicy.teacher,
        [key]: !rolePolicy.teacher[key],
      },
    };
    setRolePolicy(updated);
    saveRolePolicyConfig(updated);
    showToast('👨‍🏫 শিক্ষকদের অ্যাক্সেস পলিসি সফলভাবে আপডেট করা হয়েছে!');
  };

  const handleToggleParentPolicy = (key: keyof RolePolicyConfig['parent']) => {
    if (key === 'childDataOnly') return; // Permanently locked for privacy
    const updated: RolePolicyConfig = {
      ...rolePolicy,
      parent: {
        ...rolePolicy.parent,
        [key]: !rolePolicy.parent[key],
      },
    };
    setRolePolicy(updated);
    saveRolePolicyConfig(updated);
    showToast('👨‍👩‍👧 অভিভাবকদের পলিসি সফলভাবে আপডেট করা হয়েছে!');
  };

  const handleToggleAccountantPolicy = (key: keyof RolePolicyConfig['accountant']) => {
    const updated: RolePolicyConfig = {
      ...rolePolicy,
      accountant: {
        ...rolePolicy.accountant,
        [key]: !rolePolicy.accountant[key],
      },
    };
    setRolePolicy(updated);
    saveRolePolicyConfig(updated);
    showToast('💰 হিসাবরক্ষকের পলিসি সফলভাবে আপডেট করা হয়েছে!');
  };

  const handleToggleGateSecurityPolicy = (key: keyof RolePolicyConfig['gateSecurity']) => {
    const updated: RolePolicyConfig = {
      ...rolePolicy,
      gateSecurity: {
        ...rolePolicy.gateSecurity,
        [key]: !rolePolicy.gateSecurity[key],
      },
    };
    setRolePolicy(updated);
    saveRolePolicyConfig(updated);
    showToast('🚪 গেট সিকিউরিটি পলিসি সফলভাবে আপডেট করা হয়েছে!');
  };

  const handleResetAllRolePolicies = () => {
    setRolePolicy(DEFAULT_ROLE_POLICY_CONFIG);
    saveRolePolicyConfig(DEFAULT_ROLE_POLICY_CONFIG);
    showToast('🔄 সকল রোলের অ্যাক্সেস পলিসি প্রাতিষ্ঠানিক ডিফল্ট নীতিতে রিসেট করা হয়েছে!');
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-200/90 p-4 sm:p-5 shadow-xs space-y-4 print:hidden">
      {/* Toast Alert */}
      {panelToast && (
        <div className="bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-md flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{panelToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setPanelToast(null)}
            className="text-white/70 hover:text-white text-xs cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Panel Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-amber-100/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0 text-lg">
            👑
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 flex-wrap">
              <span>প্রাতিষ্ঠানিক ভূমিকাভিত্তিক অ্যাক্সেস ও নিয়ন্ত্রণ সেন্টার</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                সুপার অ্যাডমিন পলিসি
              </span>
            </h3>
            <p className="text-[11.5px] text-slate-500 leading-tight">
              অভিভাবক, শিক্ষক, কর্মচারী (হিসাবরক্ষক, গেট সিকিউরিটি ও কেয়ারটেকার), প্রিন্সিপাল এবং পরিচালনা পর্ষদের নির্ধারিত ক্ষমতা ও নিরাপত্তা নিয়ন্ত্রণ।
            </p>
          </div>
        </div>

        {/* Global Reset Policies Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetAllRolePolicies}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="সকল রোলের অধিকার প্রাতিষ্ঠানিক স্ট্যান্ডার্ড নীতিতে রিসেট করুন"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>ডিফল্ট নীতিতে রিসেট</span>
          </button>
        </div>
      </div>

      {/* Role Category Selector Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('directors')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'directors'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Building2 className={`w-3.5 h-3.5 ${activeTab === 'directors' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>🏛️ পরিচালনা পর্ষদ ({nonSuperAdminDirectors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('teachers')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'teachers'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <GraduationCap className={`w-3.5 h-3.5 ${activeTab === 'teachers' ? 'text-indigo-200' : 'text-slate-500'}`} />
          <span>👨‍🏫 শিক্ষকবৃন্দ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('parents')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'parents'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Users className={`w-3.5 h-3.5 ${activeTab === 'parents' ? 'text-amber-200' : 'text-slate-500'}`} />
          <span>👨‍👩‍👧 অভিভাবকবৃন্দ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'staff'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <DollarSign className={`w-3.5 h-3.5 ${activeTab === 'staff' ? 'text-emerald-200' : 'text-slate-500'}`} />
          <span>💼 কর্মচারীবৃন্দ (হিসাবরক্ষক ও সিকিউরিটি)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('principal')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'principal'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <UserCheck className={`w-3.5 h-3.5 ${activeTab === 'principal' ? 'text-teal-200' : 'text-slate-500'}`} />
          <span>👑 প্রিন্সিপাল</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: DIRECTORS (পরিচালনা পর্ষদ)
      ======================================================== */}
      {activeTab === 'directors' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-700 shrink-0" />
              <p className="text-xs text-amber-950 font-bold leading-relaxed">
                <strong>নীতিমালা:</strong> সুপার অ্যাডমিন ও সকল পরিচালকের মধ্যে দেখার সুবিধা (ভিউ) ১০০% উন্মুক্ত। পরিচালকের নামের পাশে এক লাইনে এডিট অপশনসমূহ রয়েছে; যেটিতে টিক দেওয়া থাকবে, কেবল তিনি সেটি এডিট করতে পারবেন।
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSetAll(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-black transition cursor-pointer shadow-2xs flex items-center gap-1"
                title="সকল পরিচালকের জন্য পূর্ণ এডিট ক্ষমতা উন্মুক্ত করুন"
              >
                <Check className="w-3 h-3" />
                <span>সবাইকে পূর্ণ এডিট</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetAll(false)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[10.5px] font-black transition cursor-pointer flex items-center gap-1"
                title="সকল পরিচালকের জন্য শুধুমাত্র ভিউ মোড সক্রিয় করুন"
              >
                <Eye className="w-3 h-3 text-slate-500" />
                <span>সবাইকে শুধু ভিউ</span>
              </button>
            </div>
          </div>

          {/* Vertical list of Directors with side-by-side single-line options */}
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
                  {/* Director Identity */}
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

                  {/* Side-by-Side Single-Line Options */}
                  <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2 flex-wrap xl:flex-nowrap justify-start xl:justify-end py-0.5">
                    {/* View Status Pill */}
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 shrink-0 select-none cursor-default"
                      title="সুপার অ্যাডমিনের মতোই সকল পরিচালক সম্পূর্ণ পোর্টাল ভিউ করতে পারেন (উন্মুক্ত)"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>সব ভিউ: উন্মুক্ত</span>
                    </div>

                    {/* Master Full Edit Toggle */}
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

                    {/* Divider */}
                    <span className="hidden xl:inline-block h-6 w-px bg-slate-300/80 shrink-0 mx-0.5" />

                    {/* Specific Edit Options */}
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
      )}

      {/* ========================================================
          TAB 2: TEACHERS (শিক্ষকবৃন্দ)
      ======================================================== */}
      {activeTab === 'teachers' && (
        <div className="space-y-3.5">
          {/* Policy Overview Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-700" />
                <h4 className="text-xs sm:text-sm font-black">
                  শিক্ষকদের ক্লাসরুম ও একাডেমিক পরিচালনা নীতি (Class-Scoped Role)
                </h4>
              </div>
              {onSelectRole && (
                <button
                  type="button"
                  onClick={() => onSelectRole('teacher')}
                  className="px-3 py-1 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-[11px] font-black transition cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <span>শিক্ষক মোডে টেস্ট করুন</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-indigo-900/90 leading-relaxed">
              শিক্ষকরা তাদের নির্ধারিত শ্রেণির (Assigned Class) শিক্ষার্থীদের উপস্থিতি, হোমওয়ার্ক, ডায়েরি ও টার্ম পরীক্ষার নম্বর এন্ট্রি করবেন। পুরো স্কুলের মূল ব্যাংক একাউন্ট বা ব্যালেন্সশিট দেখার সুযোগ শিক্ষকদের থাকবে না।
            </p>
          </div>

          {/* Interactive Permission Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <label className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition flex items-start gap-2.5 cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={rolePolicy.teacher.canTakeAttendance}
                onChange={() => handleToggleTeacherPolicy('canTakeAttendance')}
                className="w-4 h-4 rounded text-indigo-600 mt-0.5 accent-indigo-600 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  <span>দৈনিক ক্লাসরুম হাজিরা ও SMS</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ক্লাসে রোল কল ও অনুপস্থিত শিক্ষার্থীদের অভিভাবকদের স্বয়ংক্রিয় SMS পাঠানো।
                </p>
              </div>
            </label>

            <label className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition flex items-start gap-2.5 cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={rolePolicy.teacher.canEnterExamMarks}
                onChange={() => handleToggleTeacherPolicy('canEnterExamMarks')}
                className="w-4 h-4 rounded text-indigo-600 mt-0.5 accent-indigo-600 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>পরীক্ষার ফলাফল ও নম্বর এন্ট্রি</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  টার্ম পরীক্ষার বিষয়ভিত্তিক নম্বর এন্ট্রি, গ্রেডিং ও রিপোর্ট কার্ডের মন্তব্য।
                </p>
              </div>
            </label>

            <label className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition flex items-start gap-2.5 cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={rolePolicy.teacher.canPostClassDiary}
                onChange={() => handleToggleTeacherPolicy('canPostClassDiary')}
                className="w-4 h-4 rounded text-indigo-600 mt-0.5 accent-indigo-600 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ডিজিটাল ডায়েরি ও ছবি পোস্ট</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ক্লাসের ছবি, ক্রাফট ওয়ার্ক, হোমওয়ার্ক ও টিফিন আপডেট অভিভাবকদের জন্য প্রকাশ।
                </p>
              </div>
            </label>

            <label className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition flex items-start gap-2.5 cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={rolePolicy.teacher.canEvaluateSkills}
                onChange={() => handleToggleTeacherPolicy('canEvaluateSkills')}
                className="w-4 h-4 rounded text-indigo-600 mt-0.5 accent-indigo-600 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>স্কিল ও আচরণ মূল্যায়ন কার্ড</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  শিশুদের ব্যবহারিক শিষ্টাচার, কথা বলা, ছবি আঁকা ও সামাজিক দক্ষতার মূল্যায়ন।
                </p>
              </div>
            </label>

            <label className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition flex items-start gap-2.5 cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={rolePolicy.teacher.canViewClassFeesDue}
                onChange={() => handleToggleTeacherPolicy('canViewClassFeesDue')}
                className="w-4 h-4 rounded text-indigo-600 mt-0.5 accent-indigo-600 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ক্লাস বকেয়া ফি তথ্য ও নিজস্ব বেতন</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  নির্ধারিত শ্রেণির বকেয়া ফি তালিকা (তাগাদার জন্য) এবং নিজের মাসিক বেতন স্লিপ দেখা।
                </p>
              </div>
            </label>

            <label className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition flex items-start gap-2.5 cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={rolePolicy.teacher.canChatWithParents}
                onChange={() => handleToggleTeacherPolicy('canChatWithParents')}
                className="w-4 h-4 rounded text-indigo-600 mt-0.5 accent-indigo-600 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  <span>পেরেন্ট চ্যাট ও স্টাফ রুম</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  অভিভাবকদের সাথে ওয়ান-অন-ওয়ান চ্যাট ও শিক্ষকদের অফিশিয়াল স্টাফ রুম অ্যাক্সেস।
                </p>
              </div>
            </label>
          </div>

          {/* Boundaries Notice */}
          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              <strong>নিরাপত্তা গার্ড:</strong> পুরো স্কুলের ব্যাংক হিসাব, মোট ক্যাশ ইন/আউট বা অন্য শিক্ষকদের বেতন কাঠামো পরিবর্তন শিক্ষকদের জন্য কঠোরভাবে সীমাবদ্ধ।
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: PARENTS (অভিভাবকবৃন্দ)
      ======================================================== */}
      {activeTab === 'parents' && (
        <div className="space-y-3.5">
          {/* Policy Overview Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-700" />
                <h4 className="text-xs sm:text-sm font-black">
                  অভিভাবক ও সন্তান নিরাপত্তা নীতি (Child Data Isolation Guard)
                </h4>
              </div>
              {onSelectRole && (
                <button
                  type="button"
                  onClick={() => onSelectRole('parent')}
                  className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black transition cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <span>অভিভাবক মোডে টেস্ট করুন</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              অভিভাবকদের জন্য সিস্টেমের নীতি হলো <strong>শতভাগ ব্যক্তিগত ও সন্তান-কেন্দ্রিক</strong>। প্রতিটি অভিভাবক কেবল নিজের সন্তানের ডাটাবেজ, রেজাল্ট, স্বাস্থ্য ও ফি দেখতে পারবেন। অন্য কোনো শিশুর সংবেদনশীল তথ্য দেখা আইনত ও প্রযুক্তিগতভাবে বন্ধ।
            </p>
          </div>

          {/* Interactive Permission Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl border border-emerald-300 bg-emerald-50/60 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>চাইল্ড ডাটা আইসোলেশন</span>
                </span>
                <span className="text-[9.5px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-md">
                  সর্বদা সক্রিয় 🔒
                </span>
              </div>
              <p className="text-[11px] text-emerald-800/90 mt-1">
                শুধুমাত্র নিজের সন্তানের লাইভ উপস্থিতি, ক্লাস রুটিন, নোটিশ ও ফলাফল দৃশ্যমান।
              </p>
            </div>

            <label className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition flex items-start gap-2.5 cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={rolePolicy.parent.canCommentOnDiary}
                onChange={() => handleToggleParentPolicy('canCommentOnDiary')}
                className="w-4 h-4 rounded text-amber-600 mt-0.5 accent-amber-600 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>ডায়েরিতে লাইক ও মন্তব্য</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  সন্তানের ক্লাসের ছবি ও শিক্ষকের ডায়েরি আপডেটে লাইক ও উৎসাহমূলক মন্তব্য করা।
                </p>
              </div>
            </label>

            <label className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition flex items-start gap-2.5 cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={rolePolicy.parent.canPayFeesOnline}
                onChange={() => handleToggleParentPolicy('canPayFeesOnline')}
                className="w-4 h-4 rounded text-amber-600 mt-0.5 accent-amber-600 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                  <span>অনলাইন ফি পেমেন্ট ও PDF রসিদ</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  bKash দিয়ে টিউশন ফি প্রদান এবং তাৎক্ষণিক ৩-পার্ট মানি রিসিট PDF ডাউনলোড।
                </p>
              </div>
            </label>

            <label className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition flex items-start gap-2.5 cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={rolePolicy.parent.canChatWithTeacher}
                onChange={() => handleToggleParentPolicy('canChatWithTeacher')}
                className="w-4 h-4 rounded text-amber-600 mt-0.5 accent-amber-600 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>শ্রেণি শিক্ষকের সাথে চ্যাট</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  সন্তানের বিষয়ে শ্রেণি শিক্ষক ও প্রধান শিক্ষকের সাথে নিরাপদ সরাসরি মেসেজিং।
                </p>
              </div>
            </label>

            <label className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition flex items-start gap-2.5 cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={rolePolicy.parent.canUpdateChildHealth}
                onChange={() => handleToggleParentPolicy('canUpdateChildHealth')}
                className="w-4 h-4 rounded text-amber-600 mt-0.5 accent-amber-600 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-amber-600" />
                  <span>অ্যালার্জি ও স্বাস্থ্য তথ্য আপডেট</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  শিশুর অ্যালার্জি, রক্তের গ্রুপ ও জরুরি স্বাস্থ্য সতর্কবার্তা আপডেট করা।
                </p>
              </div>
            </label>

            <label className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition flex items-start gap-2.5 cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={rolePolicy.parent.canRequestUrgentPickup}
                onChange={() => handleToggleParentPolicy('canRequestUrgentPickup')}
                className="w-4 h-4 rounded text-amber-600 mt-0.5 accent-amber-600 cursor-pointer"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>কিউআর গেট-পাস ও পিক-আপ রিকুয়েস্ট</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ডিজিটাল কিউআর কার্ড প্রদর্শন এবং অনুমোদিত ব্যক্তির মাধ্যমে প্রস্থান নিশ্চিতকরণ।
                </p>
              </div>
            </label>
          </div>

          {/* Isolation Notice */}
          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              <strong>গোপনীয়তা সুরক্ষা:</strong> অন্য কোনো শিক্ষার্থীর ডাটাবেজ, পারিবারিক ফোন নম্বর, নম্বর বা স্কুলের আয়-ব্যয় বিবরণী অভিভাবকদের জন্য শতভাগ অবরুদ্ধ।
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: STAFF (কর্মচারীবৃন্দ: হিসাবরক্ষক ও সিকিউরিটি)
      ======================================================== */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {/* Sub-Card 1: Accountant */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0 text-sm">
                  💰
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>হিসাবরক্ষণ কর্মকর্তা (Accountant / Accounts Officer)</span>
                    <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.2 rounded-md">
                      মাহমুদুল হাসান
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    টিউশন ফি আদায়, ইনভয়েস জেনারেট, বেতন শিট ও অ্যাসেট ইনভেন্টরি ট্র্যাকিং
                  </p>
                </div>
              </div>
              {onSelectRole && (
                <button
                  type="button"
                  onClick={() => onSelectRole('accountant')}
                  className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-black transition cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <span>হিসাবরক্ষক মোডে টেস্ট করুন</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-emerald-300 transition flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolePolicy.accountant.canCollectFees}
                  onChange={() => handleToggleAccountantPolicy('canCollectFees')}
                  className="w-3.5 h-3.5 rounded text-emerald-600 mt-0.5 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  টিউশন ফি কালেকশন ও ৩-পার্ট মানি রিসিট
                </span>
              </label>

              <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-emerald-300 transition flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolePolicy.accountant.canGenerateInvoice}
                  onChange={() => handleToggleAccountantPolicy('canGenerateInvoice')}
                  className="w-3.5 h-3.5 rounded text-emerald-600 mt-0.5 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  নতুন ইনভয়েস জেনারেট ও ফি কনফিগারেশন
                </span>
              </label>

              <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-emerald-300 transition flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolePolicy.accountant.canGenerateSalarySlips}
                  onChange={() => handleToggleAccountantPolicy('canGenerateSalarySlips')}
                  className="w-3.5 h-3.5 rounded text-emerald-600 mt-0.5 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  শিক্ষকদের মাসিক বেতন শিট তৈরি ও অনুমোদন
                </span>
              </label>

              <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-emerald-300 transition flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolePolicy.accountant.canManageAssets}
                  onChange={() => handleToggleAccountantPolicy('canManageAssets')}
                  className="w-3.5 h-3.5 rounded text-emerald-600 mt-0.5 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  স্কুল সামগ্রী ও মন্টেসরি অ্যাসেট ইনভেন্টরি
                </span>
              </label>

              <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-emerald-300 transition flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolePolicy.accountant.canViewFinancialReports}
                  onChange={() => handleToggleAccountantPolicy('canViewFinancialReports')}
                  className="w-3.5 h-3.5 rounded text-emerald-600 mt-0.5 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  ক্যাশফ্লো চার্ট ও ফিনান্সিয়াল রিপোর্ট (PDF/CSV)
                </span>
              </label>
            </div>

            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-700 shrink-0" />
              <span>সীমাবদ্ধতা: পরীক্ষার ফলাফল বা শিক্ষার্থীদের একাডেমিক নম্বর পরিবর্তনের ক্ষমতা থাকবে না।</span>
            </div>
          </div>

          {/* Sub-Card 2: Gate Security & Caretaker */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black shrink-0 text-sm">
                  🚪
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>গেট সিকিউরিটি ও কেয়ারটেকার (Gate Security & Caretaker)</span>
                    <span className="text-[9.5px] font-bold bg-teal-100 text-teal-900 px-2 py-0.2 rounded-md">
                      হাবিবুর রহমান
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    কিউআর স্ক্যান, অভিভাবক পরিচয় যাচাই, ছুটি অনুমোদন ও ক্যাম্পাস নিরাপত্তা
                  </p>
                </div>
              </div>
              {onSelectRole && (
                <button
                  type="button"
                  onClick={() => onSelectRole('gate_security')}
                  className="px-3 py-1 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-black transition cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <span>সিকিউরিটি মোডে টেস্ট করুন</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-teal-300 transition flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolePolicy.gateSecurity.canScanQrCode}
                  onChange={() => handleToggleGateSecurityPolicy('canScanQrCode')}
                  className="w-3.5 h-3.5 rounded text-teal-600 mt-0.5 accent-teal-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  কিউআর কোড স্ক্যান ও অভিভাবক যাচাই
                </span>
              </label>

              <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-teal-300 transition flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolePolicy.gateSecurity.canAuthorizeRelease}
                  onChange={() => handleToggleGateSecurityPolicy('canAuthorizeRelease')}
                  className="w-3.5 h-3.5 rounded text-teal-600 mt-0.5 accent-teal-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  এক ক্লিকে স্কুল ছাড়পত্র (Release) প্রদান
                </span>
              </label>

              <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-teal-300 transition flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolePolicy.gateSecurity.canSendSmsAlerts}
                  onChange={() => handleToggleGateSecurityPolicy('canSendSmsAlerts')}
                  className="w-3.5 h-3.5 rounded text-teal-600 mt-0.5 accent-teal-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  স্বয়ংক্রিয় প্রস্থান SMS প্রেরণ
                </span>
              </label>

              <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-teal-300 transition flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolePolicy.gateSecurity.canSendEmergencyAlert}
                  onChange={() => handleToggleGateSecurityPolicy('canSendEmergencyAlert')}
                  className="w-3.5 h-3.5 rounded text-teal-600 mt-0.5 accent-teal-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  জরুরি গেট অ্যালার্ট ও স্টাফ মেসেজিং
                </span>
              </label>
            </div>

            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-700 shrink-0" />
              <span>সীমাবদ্ধতা: একাডেমিক মার্কস বা আর্থিক কোনো তথ্যে প্রবেশাধিকার থাকবে না।</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: PRINCIPAL (প্রিন্সিপাল)
      ======================================================== */}
      {activeTab === 'principal' && (
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3.5 text-teal-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-100 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black shrink-0 text-base">
                🏛️
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>প্রিন্সিপাল ও একাডেমিক নেতৃত্ব (Principal & Academic Head)</span>
                  <span className="text-[9.5px] font-bold bg-teal-200 text-teal-900 px-2 py-0.2 rounded-md">
                    শাফী আব্দুল্লাহ
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  স্কুলের সমস্ত একাডেমিক ও প্রশাসনিক কার্যক্রমের প্রধান অপারেশনাল কর্মকর্তা
                </p>
              </div>
            </div>
            {onSelectRole && (
              <button
                type="button"
                onClick={() => onSelectRole('principal')}
                className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                <span>প্রিন্সিপাল মোডে টেস্ট করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-white border border-teal-200 shadow-2xs space-y-1">
              <div className="text-xs font-black text-teal-900 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-700" />
                <span>সার্বিক একাডেমিক সুপারভিশন</span>
              </div>
              <p className="text-[11px] text-slate-600">
                সকল শ্রেণির ক্লাস রুটিন, পাঠদান পরিকল্পনা ও পরীক্ষার ফলাফল চূড়ান্ত অনুমোদন।
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-teal-200 shadow-2xs space-y-1">
              <div className="text-xs font-black text-teal-900 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-700" />
                <span>শিক্ষার্থী ভর্তি ও প্রশাসন</span>
              </div>
              <p className="text-[11px] text-slate-600">
                নতুন ভর্তি আবেদন যাচাই, শিক্ষার্থী তথ্য সংরক্ষণ ও ক্লাসরুম বরাদ্দ।
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-teal-200 shadow-2xs space-y-1">
              <div className="text-xs font-black text-teal-900 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-700" />
                <span>জরুরি পুশ অ্যালার্ট ব্রডকাস্ট</span>
              </div>
              <p className="text-[11px] text-slate-600">
                এক ক্লিকে স্কুলের সকল অভিভাবক ও শিক্ষকদের কাছে জরুরি বিজ্ঞপ্তি ব্রডকাস্ট।
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-teal-200 shadow-2xs space-y-1">
              <div className="text-xs font-black text-teal-900 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-700" />
                <span>হাজিরা ও ক্লাসরুম মনিটরিং</span>
              </div>
              <p className="text-[11px] text-slate-600">
                শিক্ষক ও শিক্ষার্থীদের সার্বিক দৈনিক উপস্থিতি ও ক্লাসরুম কার্যক্রম পর্যবেক্ষণ।
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-teal-200 shadow-2xs space-y-1">
              <div className="text-xs font-black text-teal-900 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-700" />
                <span>আয়-ব্যয় ও ফিনান্সিয়াল অডিট</span>
              </div>
              <p className="text-[11px] text-slate-600">
                টিউশন ফি কালেকশন রেট, বকেয়া বিবরণী ও স্কুলের মাসিক ক্যাশফ্লো অডিট।
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-teal-200 shadow-2xs space-y-1">
              <div className="text-xs font-black text-teal-900 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-700" />
                <span>স্টাফ পরিচালনা ও কর্মবণ্টন</span>
              </div>
              <p className="text-[11px] text-slate-600">
                সহকারী শিক্ষক ও কর্মচারীদের দায়িত্ব নির্ধারণ ও সমন্বিত স্কুল পরিচালনা।
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-teal-200 text-xs text-teal-950 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              <strong>প্রাতিষ্ঠানিক নীতি:</strong> পরিচালনা পর্ষদের অভ্যন্তরীণ বোর্ড সিদ্ধান্ত ও সুপার অ্যাডমিনের সেন্ট্রাল পারমিশন বণ্টন ব্যতীত স্কুলের সমস্ত অপারেশনাল ক্ষমতা প্রিন্সিপালের হাতে ন্যস্ত।
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
