import React, { useState, useEffect } from 'react';
import {
  DirectorAccessPermission,
  PortalAccount,
  UserRole,
} from '../types/school';
import {
  getDirectorPermissions,
  saveDirectorPermissions,
  INITIAL_DIRECTOR_PERMISSIONS,
  ALL_PORTAL_MODULE_IDS,
  PORTAL_ACCOUNTS,
  toBengaliNumber,
} from '../utils/schoolLogic';
import {
  ShieldCheck,
  Eye,
  Lock,
  Unlock,
  RotateCcw,
  CheckCircle2,
  Users,
  BookOpen,
  Award,
  CalendarCheck,
  CreditCard,
  Cloud,
  UserCheck,
  Building2,
  Megaphone,
  GraduationCap,
  Sliders,
  LayoutGrid,
  Table,
  Sparkles,
  ArrowRight,
  Clock,
  Search,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  currentRole: UserRole;
  loggedInAccount: PortalAccount | null;
  onSelectRole: (role: UserRole) => void;
  onSelectDirectorAccount: (directorId: string) => void;
  onNavigateTab: (tab: string) => void;
  logoUrl?: string;
}

interface AuditLogEntry {
  id: string;
  directorNameBn: string;
  roleTitleBn: string;
  actionBn: string;
  status: 'enabled' | 'disabled' | 'reset';
  timestampBn: string;
}

export const MODULE_DEFINITIONS: {
  id: string;
  titleBn: string;
  shortBn: string;
  descriptionBn: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
}[] = [
  {
    id: 'overview',
    titleBn: 'হোম ও কেন্দ্রীয় ওভারভিউ ড্যাশবোর্ড',
    shortBn: 'হোম ড্যাশবোর্ড',
    descriptionBn: 'স্কুল সামারি, একাডেমিক ক্যালেন্ডার, নোটিশ বোর্ড ও পরিচালনা পর্ষদ ভিউ',
    icon: UserCheck,
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 'students',
    titleBn: 'ছাত্র-ছাত্রীর তালিকা ও প্রোফাইল',
    shortBn: 'শিক্ষার্থী তালিকা',
    descriptionBn: 'হাতেখড়ি থেকে ২য় শ্রেণির সকল শিক্ষার্থীর ছবি, রক্তের গ্রুপ ও অভিভাবকের তথ্য ভিউ',
    icon: Users,
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-50 border-amber-200',
  },
  {
    id: 'pickup',
    titleBn: 'স্মার্ট গেট-পাস ও পিক-আপ ভেরিফিকেশন',
    shortBn: 'গেট-পাস (QR)',
    descriptionBn: 'কিউআর কার্ড স্ক্যান লগ, অনুমোদিত অভিভাবক তালিকা ও নিরাপদ ছুটি ট্র্যাকিং ভিউ',
    icon: ShieldCheck,
    colorClass: 'text-teal-700',
    bgClass: 'bg-teal-50 border-teal-200',
  },
  {
    id: 'diary',
    titleBn: 'ডিজিটাল ডায়েরি ও ক্লাসরুম অ্যাক্টিভিটি',
    shortBn: 'ডিজিটাল ডায়েরি',
    descriptionBn: 'প্রতিদিনের ক্লাসের ছবি, আর্ট-ক্রাফট, টিফিন আপডেট ও অভিভাবক ফিডব্যাক ভিউ',
    icon: BookOpen,
    colorClass: 'text-indigo-700',
    bgClass: 'bg-indigo-50 border-indigo-200',
  },
  {
    id: 'skills',
    titleBn: 'স্কিল প্রগ্রেস ও হোলিস্টিক রিপোর্ট কার্ড',
    shortBn: 'স্কিল রিপোর্ট',
    descriptionBn: 'শিশুদের মেধা, সৃজনশীলতা, আচরণ ও বিএমআই স্বাস্থ্য গ্রোথ চার্ট ভিউ',
    icon: Award,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50 border-amber-200',
  },
  {
    id: 'attendance',
    titleBn: 'দৈনিক হাজিরা ও উপস্থিতি অ্যানালিটিক্স',
    shortBn: 'হাজিরা রিপোর্ট',
    descriptionBn: 'শ্রেণিভিত্তিক দৈনিক উপস্থিতি, অনুপস্থিতির এসএমএস লগ ও মাসিক হাজিরা গ্রাফ ভিউ',
    icon: CalendarCheck,
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 'fees',
    titleBn: 'টিউশন ফি, ইনভয়েস ও বিকাশ পেমেন্ট',
    shortBn: 'বেতন/ফি',
    descriptionBn: 'মাসিক টিউশন ফি কালেকশন, বকেয়া তালিকা ও ডিজিটাল পেমেন্ট রশিদ ভিউ',
    icon: CreditCard,
    colorClass: 'text-rose-600',
    bgClass: 'bg-rose-50 border-rose-200',
  },
  {
    id: 'workspace',
    titleBn: 'গুগল ওয়ার্কস্পেস ও ক্লাউড ড্রাইভ',
    shortBn: 'গুগল ড্রাইভ',
    descriptionBn: 'Google Drive ফাইল আর্কাইভ, এক্সেল শিট ও প্রাতিষ্ঠানিক ক্লাউড ব্যাকআপ ভিউ',
    icon: Cloud,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50 border-blue-200',
  },
];

export const FEATURE_PERMISSION_DEFINITIONS: {
  key:
    | 'canEditSchoolAndBoard'
    | 'canManageNoticesAndEvents'
    | 'canManageStudentsAndAdmissions'
    | 'canManageFeesAndAccounts'
    | 'canApproveGatePassAndDiary';
  titleBn: string;
  shortBn: string;
  descriptionBn: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: 'canEditSchoolAndBoard',
    titleBn: 'স্কুল প্রোফাইল ও পরিচালনা পর্ষদ এডিট',
    shortBn: 'পর্ষদ ও প্রোফাইল এডিট',
    descriptionBn: 'স্কুলের তথ্য, পরিচালকদের বাণী ও শিক্ষক তালিকা সংযোজন বা সম্পাদনার অধিকার',
    icon: Building2,
  },
  {
    key: 'canManageNoticesAndEvents',
    titleBn: 'নোটিশ বোর্ড ও একাডেমিক ক্যালেন্ডার নিয়ন্ত্রণ',
    shortBn: 'নোটিশ ও ক্যালেন্ডার',
    descriptionBn: 'নতুন জরুরি নোটিশ প্রকাশ, পিন করা এবং পরীক্ষার ও ছুটির তালিকা আপডেট করার ক্ষমতা',
    icon: Megaphone,
  },
  {
    key: 'canManageStudentsAndAdmissions',
    titleBn: 'শিক্ষার্থী ভর্তি ও ডিরেক্টরি এডিট',
    shortBn: 'শিক্ষার্থী ও ভর্তি এডিট',
    descriptionBn: 'নতুন শিক্ষার্থী ভর্তি অনুমোদন, তথ্য সংশোধন ও শ্রেণি হালনাগাদ করার ক্ষমতা',
    icon: GraduationCap,
  },
  {
    key: 'canManageFeesAndAccounts',
    titleBn: 'টিউশন ফি ইনভয়েস ও হিসাব অনুমোদন',
    shortBn: 'ফি ও হিসাব কন্ট্রোল',
    descriptionBn: 'টিউশন ফি পেমেন্ট অনুমোদন, ইনভয়েস আপডেট ও আর্থিক হিসাব পরিচালনার ক্ষমতা',
    icon: CreditCard,
  },
  {
    key: 'canApproveGatePassAndDiary',
    titleBn: 'স্মার্ট গেট-পাস ও ডায়েরি মডারেশন',
    shortBn: 'গেট-পাস ও ডায়েরি',
    descriptionBn: 'জরুরি পিক-আপ ভেরিফিকেশন ও ডিজিটাল ডায়েরির পোস্ট অনুমোদনের ক্ষমতা',
    icon: ShieldCheck,
  },
];

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  labelSr: string;
  size?: 'sm' | 'md' | 'lg';
  activeColor?: 'emerald' | 'amber' | 'teal';
}

export const TactileToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  labelSr,
  size = 'md',
  activeColor = 'emerald',
}) => {
  const sizeClasses =
    size === 'lg'
      ? 'w-14 h-7 p-0.5'
      : size === 'sm'
      ? 'w-9 h-5 p-0.5'
      : 'w-11 h-6 p-0.5';

  const thumbClasses =
    size === 'lg'
      ? `w-6 h-6 ${checked ? 'translate-x-7' : 'translate-x-0'}`
      : size === 'sm'
      ? `w-4 h-4 ${checked ? 'translate-x-4' : 'translate-x-0'}`
      : `w-5 h-5 ${checked ? 'translate-x-5' : 'translate-x-0'}`;

  const bgActive =
    activeColor === 'amber'
      ? 'bg-amber-500 border-amber-600'
      : activeColor === 'teal'
      ? 'bg-teal-600 border-teal-700'
      : 'bg-emerald-600 border-emerald-700';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={labelSr}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      className={`relative inline-flex items-center rounded-full border transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 shrink-0 ${sizeClasses} ${
        checked ? bgActive : 'bg-slate-200 border-slate-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out flex items-center justify-center ${thumbClasses}`}
      >
        {checked ? (
          <Check className="w-2.5 h-2.5 text-emerald-700 stroke-[3]" />
        ) : (
          <X className="w-2.5 h-2.5 text-slate-400 stroke-[2.5]" />
        )}
      </span>
    </button>
  );
};

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  currentRole,
  loggedInAccount,
  onSelectRole,
  onSelectDirectorAccount,
  onNavigateTab,
  logoUrl = '/assets/fb/logo.jpg',
}) => {
  const [permissions, setPermissions] = useState<DirectorAccessPermission[]>(() =>
    getDirectorPermissions()
  );
  const [selectedDirectorFilter, setSelectedDirectorFilter] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'cards' | 'matrix'>('cards');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'init-log-1',
      directorNameBn: 'সকল সম্মানিত পরিচালক (৪ জন)',
      roleTitleBn: 'পরিচালনা পর্ষদ',
      actionBn: 'সিস্টেমের সকল মডিউল (৮/৮টি) ভিউ অ্যাক্সেস ডিফল্টভাবে চালু রাখা হয়েছে',
      status: 'enabled',
      timestampBn: 'সিস্টেম ইনিশিয়ালাইজেশন',
    },
  ]);

  const isSuperAdmin = currentRole === 'super_admin';

  useEffect(() => {
    const handleSync = () => {
      setPermissions(getDirectorPermissions());
    };
    window.addEventListener('ananda-director-permissions-updated', handleSync);
    return () => window.removeEventListener('ananda-director-permissions-updated', handleSync);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const getCurrentTimeBn = () => {
    const now = new Date();
    return now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const appendAuditLog = (
    directorNameBn: string,
    roleTitleBn: string,
    actionBn: string,
    status: 'enabled' | 'disabled' | 'reset'
  ) => {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      directorNameBn,
      roleTitleBn,
      actionBn,
      status,
      timestampBn: `আজ ${getCurrentTimeBn()}`,
    };
    setAuditLogs((prev) => [entry, ...prev.slice(0, 14)]);
  };

  const superAdminPerm = permissions.find((p) => p.isSuperAdmin) || INITIAL_DIRECTOR_PERMISSIONS[0];
  const otherDirectors = permissions.filter((p) => !p.isSuperAdmin);

  // Toggle a single module's visibility for a specific director
  const handleToggleModuleAccess = (directorId: string, moduleId: string) => {
    const modDef = MODULE_DEFINITIONS.find((m) => m.id === moduleId);
    const modLabel = modDef?.shortBn || moduleId;

    const updated = permissions.map((perm) => {
      if (perm.directorId !== directorId || perm.isSuperAdmin) return perm;

      const effectiveCurrentModules = perm.viewAllModules
        ? [...ALL_PORTAL_MODULE_IDS]
        : perm.allowedModules;

      const currentlyHasModule = effectiveCurrentModules.includes(moduleId);
      let nextModules: string[];

      if (currentlyHasModule) {
        nextModules = effectiveCurrentModules.filter((id) => id !== moduleId);
        // Ensure at least 'overview' stays active if user turns off everything, or allow empty with warning
      } else {
        nextModules = Array.from(new Set([...effectiveCurrentModules, moduleId]));
      }

      const allSelected = ALL_PORTAL_MODULE_IDS.every((id) => nextModules.includes(id));

      appendAuditLog(
        perm.nameBn,
        perm.roleTitleBn,
        `"${modLabel}" মডিউল দেখার অ্যাক্সেস ${!currentlyHasModule ? 'চালু (ON)' : 'বন্ধ (OFF)'} করা হয়েছে`,
        !currentlyHasModule ? 'enabled' : 'disabled'
      );

      showToast(
        `${!currentlyHasModule ? '✅' : '🔒'} ${perm.nameBn}-এর জন্য "${modLabel}" মডিউল ভিউ ${
          !currentlyHasModule ? 'চালু' : 'বন্ধ'
        } করা হয়েছে।`
      );

      return {
        ...perm,
        viewAllModules: allSelected,
        allowedModules: nextModules,
        lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন · সদস্য সচিব)',
        lastUpdatedAtBn: `আপডেট: ${getCurrentTimeBn()}`,
      };
    });

    setPermissions(updated);
    saveDirectorPermissions(updated);
  };

  // Master toggle for "View All 8 Modules" for a specific director
  const handleToggleAllModulesForDirector = (directorId: string) => {
    const updated = permissions.map((perm) => {
      if (perm.directorId !== directorId || perm.isSuperAdmin) return perm;

      const nextViewAll = !perm.viewAllModules;
      const nextModules = nextViewAll ? [...ALL_PORTAL_MODULE_IDS] : ['overview'];

      appendAuditLog(
        perm.nameBn,
        perm.roleTitleBn,
        nextViewAll
          ? 'সকল মডিউল (৮/৮টি) দেখার মাস্টার সুইচ চালু করা হয়েছে'
          : 'মাস্টার ভিউ সুইচ বন্ধ করে শুধুমাত্র হোম ড্যাশবোর্ড ভিউ রাখা হয়েছে',
        nextViewAll ? 'enabled' : 'disabled'
      );

      showToast(
        nextViewAll
          ? `👁️ ${perm.nameBn}-এর জন্য সকল ৮টি মডিউল দেখার অ্যাক্সেস চালু করা হয়েছে!`
          : `🔒 ${perm.nameBn}-এর জন্য শুধুমাত্র হোম ড্যাশবোর্ড ছাড়া অন্যান্য মডিউল ভিউ সীমিত করা হয়েছে।`
      );

      return {
        ...perm,
        viewAllModules: nextViewAll,
        allowedModules: nextModules,
        lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন · সদস্য সচিব)',
        lastUpdatedAtBn: `আপডেট: ${getCurrentTimeBn()}`,
      };
    });

    setPermissions(updated);
    saveDirectorPermissions(updated);
  };

  // Toggle a specific Feature / Edit Capability for a director
  const handleToggleFeaturePermission = (
    directorId: string,
    featureKey:
      | 'canEditSchoolAndBoard'
      | 'canManageNoticesAndEvents'
      | 'canManageStudentsAndAdmissions'
      | 'canManageFeesAndAccounts'
      | 'canApproveGatePassAndDiary'
  ) => {
    const featDef = FEATURE_PERMISSION_DEFINITIONS.find((f) => f.key === featureKey);
    const featLabel = featDef?.shortBn || featureKey;

    const updated = permissions.map((perm) => {
      if (perm.directorId !== directorId || perm.isSuperAdmin) return perm;
      const nextVal = !perm[featureKey];

      appendAuditLog(
        perm.nameBn,
        perm.roleTitleBn,
        `"${featLabel}" ফিচার অ্যাক্সেস ${nextVal ? 'চালু (ON)' : 'বন্ধ (OFF)'} করা হয়েছে`,
        nextVal ? 'enabled' : 'disabled'
      );

      showToast(
        `${nextVal ? '✅' : '🔒'} ${perm.nameBn}-এর "${featLabel}" ক্ষমতা ${
          nextVal ? 'চালু' : 'বন্ধ'
        } করা হয়েছে।`
      );

      return {
        ...perm,
        [featureKey]: nextVal,
        lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন · সদস্য সচিব)',
        lastUpdatedAtBn: `আপডেট: ${getCurrentTimeBn()}`,
      };
    });

    setPermissions(updated);
    saveDirectorPermissions(updated);
  };

  // Master toggle for all 5 Edit/Action Features for a specific director
  const handleToggleAllFeaturesForDirector = (directorId: string) => {
    const updated = permissions.map((perm) => {
      if (perm.directorId !== directorId || perm.isSuperAdmin) return perm;

      const currentlyAllEdit =
        perm.canEditSchoolAndBoard &&
        perm.canManageNoticesAndEvents &&
        perm.canManageStudentsAndAdmissions &&
        perm.canManageFeesAndAccounts &&
        perm.canApproveGatePassAndDiary;

      const nextState = !currentlyAllEdit;

      appendAuditLog(
        perm.nameBn,
        perm.roleTitleBn,
        nextState
          ? 'সকল ৫টি এডিট ও ম্যানেজমেন্ট ফিচার সুইচ একসাথে চালু করা হয়েছে'
          : 'সকল এডিট ফিচার বন্ধ করে শুধুমাত্র ভিউ (Read-Only) মোডে রাখা হয়েছে',
        nextState ? 'enabled' : 'disabled'
      );

      showToast(
        nextState
          ? `⚡ ${perm.nameBn}-কে সকল মডিউল ভিউসহ পূর্ণ এডিট ও ম্যানেজমেন্ট ক্ষমতা প্রদান করা হয়েছে!`
          : `👁️ ${perm.nameBn}-এর এডিট ক্ষমতা বন্ধ করে শুধুমাত্র ভিউ মোডে রাখা হয়েছে।`
      );

      return {
        ...perm,
        viewAllModules: nextState ? true : perm.viewAllModules,
        allowedModules: nextState ? [...ALL_PORTAL_MODULE_IDS] : perm.allowedModules,
        canEditSchoolAndBoard: nextState,
        canManageNoticesAndEvents: nextState,
        canManageStudentsAndAdmissions: nextState,
        canManageFeesAndAccounts: nextState,
        canApproveGatePassAndDiary: nextState,
        lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন · সদস্য সচিব)',
        lastUpdatedAtBn: `আপডেট: ${getCurrentTimeBn()}`,
      };
    });

    setPermissions(updated);
    saveDirectorPermissions(updated);
  };

  // Global Bulk Actions
  const handleBulkEnableAllViews = () => {
    const updated = permissions.map((perm) =>
      perm.isSuperAdmin
        ? perm
        : {
            ...perm,
            viewAllModules: true,
            allowedModules: [...ALL_PORTAL_MODULE_IDS],
            lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন)',
            lastUpdatedAtBn: `সকল ভিউ চালু: ${getCurrentTimeBn()}`,
          }
    );
    setPermissions(updated);
    saveDirectorPermissions(updated);
    appendAuditLog(
      'সকল পরিচালক (৪ জন)',
      'পরিচালনা পর্ষদ',
      'সকল পরিচালকের জন্য ৮টি মডিউল দেখার অ্যাক্সেস একসাথে চালু করা হয়েছে',
      'enabled'
    );
    showToast('👁️ সকল পরিচালকের জন্য ৮টি মডিউল দেখার অপশন একসাথে চালু করা হয়েছে!');
  };

  const handleBulkSetViewOnlyMode = () => {
    const updated = permissions.map((perm) =>
      perm.isSuperAdmin
        ? perm
        : {
            ...perm,
            viewAllModules: true,
            allowedModules: [...ALL_PORTAL_MODULE_IDS],
            canEditSchoolAndBoard: false,
            canManageNoticesAndEvents: false,
            canManageStudentsAndAdmissions: false,
            canManageFeesAndAccounts: false,
            canApproveGatePassAndDiary: false,
            lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন)',
            lastUpdatedAtBn: `শুধু ভিউ মোড: ${getCurrentTimeBn()}`,
          }
    );
    setPermissions(updated);
    saveDirectorPermissions(updated);
    appendAuditLog(
      'সকল পরিচালক (৪ জন)',
      'পরিচালনা পর্ষদ',
      'সকল পরিচালককে শুধুমাত্র ভিউ (Read-Only) মোডে রাখা হয়েছে',
      'reset'
    );
    showToast('🔒 সকল পরিচালককে "সবকিছু ভিউ (শুধু দেখার অপশন)" মোডে সেট করা হয়েছে।');
  };

  const handleBulkGrantFullAccess = () => {
    const updated = permissions.map((perm) =>
      perm.isSuperAdmin
        ? perm
        : {
            ...perm,
            viewAllModules: true,
            allowedModules: [...ALL_PORTAL_MODULE_IDS],
            canEditSchoolAndBoard: true,
            canManageNoticesAndEvents: true,
            canManageStudentsAndAdmissions: true,
            canManageFeesAndAccounts: true,
            canApproveGatePassAndDiary: true,
            lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন)',
            lastUpdatedAtBn: `পূর্ণ অ্যাক্সেস: ${getCurrentTimeBn()}`,
          }
    );
    setPermissions(updated);
    saveDirectorPermissions(updated);
    appendAuditLog(
      'সকল পরিচালক (৪ জন)',
      'পরিচালনা পর্ষদ',
      'সকল পরিচালককে সব মডিউল ভিউ ও পূর্ণ এডিট অ্যাক্সেস প্রদান করা হয়েছে',
      'enabled'
    );
    showToast('⚡ সকল পরিচালককে পূর্ণ ভিউ এবং এডিট অ্যাক্সেস দেওয়া হয়েছে!');
  };

  const handleResetToSystemDefault = () => {
    setPermissions(INITIAL_DIRECTOR_PERMISSIONS);
    saveDirectorPermissions(INITIAL_DIRECTOR_PERMISSIONS);
    appendAuditLog(
      'সিস্টেম রিসেট',
      'পরিচালনা পর্ষদ',
      'সকল পরিচালকের পারমিশন প্রাতিষ্ঠানিক ডিফল্টে রিসেট করা হয়েছে',
      'reset'
    );
    showToast('🔄 সকল পরিচালকের অ্যাক্সেস সেটিংস ডিফল্ট অবস্থায় রিসেট করা হয়েছে!');
  };

  const filteredDirectors = otherDirectors.filter((dir) => {
    if (selectedDirectorFilter !== 'all' && dir.directorId !== selectedDirectorFilter) {
      return false;
    }
    return true;
  });

  const filteredModules = MODULE_DEFINITIONS.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      m.titleBn.toLowerCase().includes(q) ||
      m.shortBn.toLowerCase().includes(q) ||
      m.descriptionBn.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q)
    );
  });

  const filteredFeatures = FEATURE_PERMISSION_DEFINITIONS.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      f.titleBn.toLowerCase().includes(q) ||
      f.shortBn.toLowerCase().includes(q) ||
      f.descriptionBn.toLowerCase().includes(q)
    );
  });

  const fullViewDirectorsCount = otherDirectors.filter(
    (d) => d.viewAllModules || d.allowedModules.length === ALL_PORTAL_MODULE_IDS.length
  ).length;

  const anyEditDirectorsCount = otherDirectors.filter(
    (d) =>
      d.canEditSchoolAndBoard ||
      d.canManageNoticesAndEvents ||
      d.canManageStudentsAndAdmissions ||
      d.canManageFeesAndAccounts ||
      d.canApproveGatePassAndDiary
  ).length;

  return (
    <div className="space-y-6">
      {/* Live Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/60 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. EXECUTIVE SUPER ADMIN COMMAND HEADER                               */}
      {/* ===================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-amber-950 text-white border-2 border-amber-400/70 shadow-lg p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Super Admin Identity Profile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 max-w-3xl">
            <div className="relative shrink-0">
              <img
                src={superAdminPerm.photoUrl || '/assets/biddalay/mostofa_mamun.jpg'}
                alt="মোস্তফা আল মামুন — সুপার অ্যাডমিন"
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-3 border-amber-400 shadow-xl bg-white p-0.5"
              />
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-md border border-white">
                👑 SUPER ADMIN
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>বিশেষ সুপার অ্যাডমিন অ্যাক্সেস কন্ট্রোল ড্যাশবোর্ড</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
                  টগল সুইচ সিস্টেম সক্রিয়
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {superAdminPerm.nameBn}{' '}
                <span className="text-amber-300 text-lg sm:text-xl font-bold block sm:inline">
                  (পরিচালক ও সদস্য সচিব — Director &amp; Secretary)
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                আনন্দ পাঠশালার অন্যান্য সম্মানিত পরিচালকদের কোন কোন <strong>পোর্টাল মডিউল দেখার অ্যাক্সেস (View Access)</strong> এবং কোন কোন <strong>অ্যাডমিন ফিচার এডিট করার ক্ষমতা</strong> থাকবে তা নিচের টগল বা সুইচ (Toggle Switch) অন/অফ করে তাৎক্ষণিকভাবে নিয়ন্ত্রণ করুন।
              </p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-amber-200/90 font-mono pt-0.5">
                <span>ইউজার আইডি: superadmin</span>
                <span>·</span>
                <span>মোবাইল: ০১৭৮৮-৯৯০০১১</span>
                <span>·</span>
                <span>ইমেইল: mostofa.mamun@anandapathshala.edu.bd</span>
              </div>
            </div>
          </div>

          {/* Right Quick Global Switch Presets */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2.5 shrink-0 lg:w-80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>কেন্দ্রীয় কুইক অ্যাকশন</span>
              </span>
              {!isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => onSelectRole('super_admin')}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black cursor-pointer transition"
                >
                  সুপার অ্যাডমিন হন
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={handleBulkEnableAllViews}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-between gap-2 transition cursor-pointer shadow-xs"
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-200" />
                  <span>সকল পরিচালকের সব মডিউল ভিউ চালু</span>
                </span>
                <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded font-mono">৮/৮ ON</span>
              </button>

              <button
                type="button"
                onClick={handleBulkSetViewOnlyMode}
                className="w-full py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center justify-between gap-2 transition cursor-pointer border border-white/15"
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>সকলকে শুধুমাত্র ভিউ মোডে রাখুন</span>
                </span>
                <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded">Read-Only</span>
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleBulkGrantFullAccess}
                  className="py-1.5 px-2.5 rounded-xl bg-amber-500/25 hover:bg-amber-500/35 border border-amber-400/40 text-amber-200 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Unlock className="w-3 h-3" />
                  <span>পূর্ণ এডিট চালু</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetToSystemDefault}
                  className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ডিফল্ট রিসেট</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Summary Strip inside Header */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
          <div className="bg-black/25 rounded-2xl p-3.5 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 font-black">
              {toBengaliNumber(otherDirectors.length)}
            </div>
            <div>
              <span className="text-[11px] text-slate-300 block">নিয়ন্ত্রিত পরিচালক</span>
              <span className="text-sm font-black text-white">৪ জন সম্মানিত পরিচালক</span>
            </div>
          </div>

          <div className="bg-black/25 rounded-2xl p-3.5 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 font-black">
              {toBengaliNumber(fullViewDirectorsCount)}/{toBengaliNumber(otherDirectors.length)}
            </div>
            <div>
              <span className="text-[11px] text-slate-300 block">সম্পূর্ণ মডিউল ভিউ সক্রিয়</span>
              <span className="text-sm font-black text-emerald-300">
                {toBengaliNumber(fullViewDirectorsCount)} জন পরিচালক (৮/৮ মডিউল)
              </span>
            </div>
          </div>

          <div className="bg-black/25 rounded-2xl p-3.5 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-400/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0 font-black">
              {toBengaliNumber(anyEditDirectorsCount)}/{toBengaliNumber(otherDirectors.length)}
            </div>
            <div>
              <span className="text-[11px] text-slate-300 block">এডিট ফিচার অ্যাক্সেস প্রাপ্ত</span>
              <span className="text-sm font-black text-amber-200">
                {anyEditDirectorsCount > 0
                  ? `${toBengaliNumber(anyEditDirectorsCount)} জন পরিচালক`
                  : 'শুধুমাত্র ভিউ মোড সক্রিয়'}
              </span>
            </div>
          </div>

          <div className="bg-black/25 rounded-2xl p-3.5 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-400/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0 font-black">
              ১৩
            </div>
            <div>
              <span className="text-[11px] text-slate-300 block">মোট টগল সুইচ (প্রতি পরিচালক)</span>
              <span className="text-sm font-black text-white">৮টি মডিউল + ৫টি ফিচার সুইচ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning banner if viewing as non-Super Admin */}
      {!isSuperAdmin && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <p className="text-xs sm:text-sm font-bold text-amber-950">
              আপনি বর্তমানে <strong>{loggedInAccount?.nameBn || currentRole}</strong> মোডে আছেন। টগল সুইচগুলোর মাধ্যমে পরিচালকদের অ্যাক্সেস পরিবর্তন করতে <strong>সুপার অ্যাডমিন (মোস্তফা আল মামুন)</strong> মোডে সুইচ করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectRole('super_admin')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shrink-0 cursor-pointer transition"
          >
            👑 সুপার অ্যাডমিন মোডে যান
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. FILTER BAR: DIRECTOR SELECTOR, SEARCH & VIEW MODE SWITCHER         */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-amber-200/90 p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Director Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-black text-slate-700 mr-1">পরিচালক নির্বাচন:</span>
          <button
            type="button"
            onClick={() => setSelectedDirectorFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedDirectorFilter === 'all'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            সকল পরিচালক ({toBengaliNumber(otherDirectors.length)} জন)
          </button>
          {otherDirectors.map((dir) => {
            const active = selectedDirectorFilter === dir.directorId;
            return (
              <button
                key={dir.directorId}
                type="button"
                onClick={() => setSelectedDirectorFilter(dir.directorId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-slate-950 shadow-2xs font-black'
                    : 'bg-amber-50/80 hover:bg-amber-100 text-slate-800 border border-amber-200/80'
                }`}
              >
                <img
                  src={dir.photoUrl || logoUrl}
                  alt={dir.nameBn}
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{dir.nameBn}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Search & Layout Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="মডিউল বা ফিচার খুঁজুন..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewLayout('cards')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewLayout === 'cards'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>কার্ড সুইচ ভিউ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('matrix')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewLayout === 'matrix'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>ম্যাট্রিক্স টেবিল ভিউ</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3A. DETAILED DIRECTOR TOGGLE SWITCH CARDS VIEW                        */}
      {/* ===================================================================== */}
      {viewLayout === 'cards' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredDirectors.map((dir) => {
            const activeModuleIds = dir.viewAllModules
              ? ALL_PORTAL_MODULE_IDS
              : dir.allowedModules;
            const activeModulesCount = activeModuleIds.length;

            const activeFeaturesCount = [
              dir.canEditSchoolAndBoard,
              dir.canManageNoticesAndEvents,
              dir.canManageStudentsAndAdmissions,
              dir.canManageFeesAndAccounts,
              dir.canApproveGatePassAndDiary,
            ].filter(Boolean).length;

            const isAllFeaturesOn = activeFeaturesCount === 5;
            const isAllModulesOn =
              dir.viewAllModules || activeModulesCount === ALL_PORTAL_MODULE_IDS.length;

            return (
              <div
                key={dir.directorId}
                className="bg-white rounded-3xl border-2 border-amber-200/90 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Director Card Top Header */}
                  <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={dir.photoUrl || logoUrl}
                        alt={dir.nameBn}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 bg-white shrink-0 shadow-md"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-lg font-black text-white truncate">{dir.nameBn}</h2>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40">
                            {dir.nameEn}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-amber-300 truncate">
                          {dir.roleTitleBn}
                        </p>
                        <p className="text-[11px] text-emerald-100/80 font-mono truncate">
                          ইউজার আইডি: {dir.username} · মোবাইল: {dir.phone}
                        </p>
                      </div>
                    </div>

                    {/* Preview / Test as this Director Button */}
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectDirectorAccount(dir.directorId)}
                        className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                        title={`${dir.nameBn}-এর অ্যাকাউন্টে লগইন করে কোন কোন মডিউল দৃশ্যমান তা সরাসরি পরীক্ষা করুন`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>এই পরিচালকের ভিউ পরীক্ষা করুন</span>
                      </button>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 font-bold">
                          মডিউল ভিউ: {toBengaliNumber(activeModulesCount)}/৮টি চালু
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/25 border border-amber-400/40 text-amber-200 font-bold">
                          এডিট ফিচার: {toBengaliNumber(activeFeaturesCount)}/৫টি চালু
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-6">
                    {/* ========================================================= */}
                    {/* SECTION A: MODULE VIEW ACCESS TOGGLE SWITCHES (8 MODULES) */}
                    {/* ========================================================= */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-black text-emerald-950">
                              ১. পোর্টাল মডিউল দেখার অ্যাক্সেস (Module View Toggles)
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isAllModulesOn
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-200 text-amber-950'
                              }`}
                            >
                              {toBengaliNumber(activeModulesCount)}/৮টি চালু
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            যে মডিউলগুলোর সুইচ <strong>চালু (ON)</strong> থাকবে, {dir.nameBn} পোর্টালে লগইন করলে সেগুলো দেখতে পাবেন।
                          </p>
                        </div>

                        {/* Master Switch for All 8 Modules */}
                        <div className="flex items-center gap-2.5 bg-white px-3 py-2 rounded-xl border border-emerald-200 shrink-0 self-start sm:self-center">
                          <span className="text-xs font-black text-slate-800">
                            সকল মডিউল ভিউ
                          </span>
                          <TactileToggleSwitch
                            checked={isAllModulesOn}
                            onChange={() => handleToggleAllModulesForDirector(dir.directorId)}
                            disabled={!isSuperAdmin}
                            labelSr={`${dir.nameBn}-এর জন্য সকল মডিউল ভিউ টগল করুন`}
                            activeColor="emerald"
                          />
                        </div>
                      </div>

                      {/* 8 Individual Module Toggle Switches Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {filteredModules.map((mod) => {
                          const Icon = mod.icon;
                          const isModuleEnabled =
                            dir.viewAllModules || dir.allowedModules.includes(mod.id);

                          return (
                            <div
                              key={mod.id}
                              onClick={() => {
                                if (isSuperAdmin) {
                                  handleToggleModuleAccess(dir.directorId, mod.id);
                                }
                              }}
                              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                isModuleEnabled
                                  ? 'bg-white border-emerald-300 shadow-2xs'
                                  : 'bg-slate-50/80 border-slate-200 opacity-75'
                              } ${isSuperAdmin ? 'cursor-pointer hover:border-amber-400' : ''}`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                    isModuleEnabled
                                      ? mod.bgClass + ' ' + mod.colorClass
                                      : 'bg-slate-100 border-slate-200 text-slate-400'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`text-xs font-black truncate ${
                                        isModuleEnabled ? 'text-slate-900' : 'text-slate-500'
                                      }`}
                                    >
                                      {mod.shortBn}
                                    </span>
                                    <span
                                      className={`text-[9.5px] font-black px-1.5 py-0.2 rounded ${
                                        isModuleEnabled
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-slate-200 text-slate-600'
                                      }`}
                                    >
                                      {isModuleEnabled ? 'চালু' : 'বন্ধ'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                    {mod.descriptionBn}
                                  </p>
                                </div>
                              </div>

                              <TactileToggleSwitch
                                checked={isModuleEnabled}
                                onChange={() =>
                                  handleToggleModuleAccess(dir.directorId, mod.id)
                                }
                                disabled={!isSuperAdmin}
                                labelSr={`${dir.nameBn}-এর জন্য ${mod.titleBn} মডিউল টগল সুইচ`}
                                activeColor="emerald"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ========================================================= */}
                    {/* SECTION B: FEATURE & EDIT ACCESS TOGGLE SWITCHES (5 ITEMS) */}
                    {/* ========================================================= */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-black text-amber-950">
                              ২. অ্যাডমিন ফিচার ও এডিট অ্যাক্সেস (Feature Control Switches)
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                activeFeaturesCount > 0
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {toBengaliNumber(activeFeaturesCount)}/৫টি চালু
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-900 mt-0.5">
                            ভিউ করার পাশাপাশি কোন কোন তথ্য সংযোজন, সম্পাদনা বা অনুমোদন করতে পারবেন তার সুইচ।
                          </p>
                        </div>

                        {/* Master Switch for All 5 Edit Features */}
                        <div className="flex items-center gap-2.5 bg-white px-3 py-2 rounded-xl border border-amber-200 shrink-0 self-start sm:self-center">
                          <span className="text-xs font-black text-slate-800">
                            পূর্ণ এডিট সুইচ
                          </span>
                          <TactileToggleSwitch
                            checked={isAllFeaturesOn}
                            onChange={() => handleToggleAllFeaturesForDirector(dir.directorId)}
                            disabled={!isSuperAdmin}
                            labelSr={`${dir.nameBn}-এর জন্য সকল এডিট ফিচার টগল করুন`}
                            activeColor="amber"
                          />
                        </div>
                      </div>

                      {/* 5 Individual Feature Toggle Switches */}
                      <div className="grid grid-cols-1 gap-2">
                        {filteredFeatures.map((feat) => {
                          const Icon = feat.icon;
                          const isFeatEnabled = Boolean(dir[feat.key]);

                          return (
                            <div
                              key={feat.key}
                              onClick={() => {
                                if (isSuperAdmin) {
                                  handleToggleFeaturePermission(dir.directorId, feat.key);
                                }
                              }}
                              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                isFeatEnabled
                                  ? 'bg-amber-50/50 border-amber-300 shadow-2xs'
                                  : 'bg-slate-50/70 border-slate-200'
                              } ${isSuperAdmin ? 'cursor-pointer hover:border-amber-400' : ''}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                    isFeatEnabled
                                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                                      : 'bg-slate-100 border-slate-200 text-slate-400'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`text-xs font-black ${
                                        isFeatEnabled ? 'text-slate-900' : 'text-slate-600'
                                      }`}
                                    >
                                      {feat.titleBn}
                                    </span>
                                    <span
                                      className={`text-[9.5px] font-black px-2 py-0.2 rounded-full ${
                                        isFeatEnabled
                                          ? 'bg-amber-600 text-white'
                                          : 'bg-slate-200 text-slate-600'
                                      }`}
                                    >
                                      {isFeatEnabled ? 'এডিট চালু (ON)' : 'শুধু ভিউ (OFF)'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {feat.descriptionBn}
                                  </p>
                                </div>
                              </div>

                              <TactileToggleSwitch
                                checked={isFeatEnabled}
                                onChange={() =>
                                  handleToggleFeaturePermission(dir.directorId, feat.key)
                                }
                                disabled={!isSuperAdmin}
                                labelSr={`${dir.nameBn}-এর জন্য ${feat.titleBn} টগল সুইচ`}
                                activeColor="amber"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                  <span>
                    অ্যাক্সেস নিয়ন্ত্রক: <strong>মোস্তফা আল মামুন (সুপার অ্যাডমিন)</strong>
                  </span>
                  <span className="font-bold text-emerald-800">
                    {dir.lastUpdatedAtBn || 'সকল ভিউ চালু'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ===================================================================== */
        /* 3B. MASTER COMPARISON TOGGLE SWITCH MATRIX TABLE VIEW                 */
        /* ===================================================================== */
        <div className="bg-white rounded-3xl border-2 border-amber-200/90 shadow-xs overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-black">
                মাস্টার অ্যাক্সেস টগল ম্যাট্রিক্স (সকল পরিচালক বনাম মডিউল ও ফিচার)
              </h3>
              <p className="text-xs text-emerald-200">
                একই টেবিল থেকে যেকোনো পরিচালকের মডিউল ভিউ বা এডিট ফিচারের সুইচ অন/অফ করুন
              </p>
            </div>
            <span className="text-xs font-bold bg-amber-400 text-slate-950 px-3 py-1 rounded-xl self-start sm:self-center">
              সুপার অ্যাডমিন: মোস্তফা আল মামুন
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs font-black text-slate-800">
                  <th className="py-3.5 px-4 min-w-[230px] border-r border-slate-200">
                    মডিউল / ফিচারের নাম
                  </th>
                  {otherDirectors.map((dir) => (
                    <th
                      key={dir.directorId}
                      className="py-3.5 px-3 text-center min-w-[145px] border-r border-slate-200"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={dir.photoUrl || logoUrl}
                          alt={dir.nameBn}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-amber-400"
                        />
                        <span className="text-xs font-black text-slate-900">{dir.nameBn}</span>
                        <span className="text-[10px] font-bold text-amber-800">
                          {dir.roleTitleBn.split('(')[0]}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectDirectorAccount(dir.directorId)}
                          className="mt-0.5 px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[9.5px] font-bold cursor-pointer transition"
                        >
                          👁️ ভিউ টেস্ট
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {/* Section Header Row: Module Views */}
                <tr className="bg-emerald-50/90 font-black text-emerald-950">
                  <td colSpan={otherDirectors.length + 1} className="py-2 px-4 text-xs">
                    👁️ পোর্টাল মডিউল দেখার অ্যাক্সেস সুইচ (Module View Access — ৮টি মডিউল)
                  </td>
                </tr>

                {/* Master All Modules Row */}
                <tr className="bg-emerald-50/40">
                  <td className="py-3 px-4 font-black text-slate-900 border-r border-slate-200">
                    সকল মডিউল দেখার মাস্টার সুইচ (All 8 Modules)
                  </td>
                  {otherDirectors.map((dir) => {
                    const allOn =
                      dir.viewAllModules ||
                      dir.allowedModules.length === ALL_PORTAL_MODULE_IDS.length;
                    return (
                      <td
                        key={dir.directorId}
                        className="py-3 px-3 text-center border-r border-slate-200"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <TactileToggleSwitch
                            checked={allOn}
                            onChange={() => handleToggleAllModulesForDirector(dir.directorId)}
                            disabled={!isSuperAdmin}
                            labelSr={`${dir.nameBn} সকল মডিউল মাস্টার সুইচ`}
                            activeColor="emerald"
                          />
                          <span className="text-[10px] font-bold text-emerald-800">
                            {allOn ? 'সব চালু' : 'কাস্টম'}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Individual Modules Rows */}
                {MODULE_DEFINITIONS.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <tr key={mod.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 border-r border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${mod.colorClass} shrink-0`} />
                          <div>
                            <div className="font-bold text-slate-900">{mod.shortBn}</div>
                            <div className="text-[10px] text-slate-500">{mod.titleBn}</div>
                          </div>
                        </div>
                      </td>
                      {otherDirectors.map((dir) => {
                        const enabled =
                          dir.viewAllModules || dir.allowedModules.includes(mod.id);
                        return (
                          <td
                            key={dir.directorId}
                            className="py-2.5 px-3 text-center border-r border-slate-200"
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <TactileToggleSwitch
                                checked={enabled}
                                onChange={() => handleToggleModuleAccess(dir.directorId, mod.id)}
                                disabled={!isSuperAdmin}
                                labelSr={`${dir.nameBn} ${mod.shortBn} সুইচ`}
                                size="sm"
                                activeColor="emerald"
                              />
                              <span
                                className={`text-[9.5px] font-bold ${
                                  enabled ? 'text-emerald-700' : 'text-slate-400'
                                }`}
                              >
                                {enabled ? 'চালু' : 'বন্ধ'}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Section Header Row: Feature Edit Access */}
                <tr className="bg-amber-50/90 font-black text-amber-950">
                  <td colSpan={otherDirectors.length + 1} className="py-2 px-4 text-xs">
                    ✏️ অ্যাডমিন ফিচার ও এডিট অ্যাক্সেস সুইচ (Feature &amp; Edit Capabilities — ৫টি ফিচার)
                  </td>
                </tr>

                {FEATURE_PERMISSION_DEFINITIONS.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <tr key={feat.key} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 border-r border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-amber-700 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-900">{feat.shortBn}</div>
                            <div className="text-[10px] text-slate-500">{feat.titleBn}</div>
                          </div>
                        </div>
                      </td>
                      {otherDirectors.map((dir) => {
                        const enabled = Boolean(dir[feat.key]);
                        return (
                          <td
                            key={dir.directorId}
                            className="py-2.5 px-3 text-center border-r border-slate-200"
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <TactileToggleSwitch
                                checked={enabled}
                                onChange={() =>
                                  handleToggleFeaturePermission(dir.directorId, feat.key)
                                }
                                disabled={!isSuperAdmin}
                                labelSr={`${dir.nameBn} ${feat.shortBn} সুইচ`}
                                size="sm"
                                activeColor="amber"
                              />
                              <span
                                className={`text-[9.5px] font-bold ${
                                  enabled ? 'text-amber-700' : 'text-slate-400'
                                }`}
                              >
                                {enabled ? 'চালু' : 'শুধু ভিউ'}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. REAL-TIME PERMISSION AUDIT LOG & PORTAL NAVIGATION SHORTCUTS       */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Audit Log */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  সুপার অ্যাডমিন অ্যাক্সেস পরিবর্তন লগ (Live Toggle Audit Log)
                </h3>
                <p className="text-[11px] text-slate-500">
                  মোস্তফা আল মামুন কর্তৃক পরিচালকদের মডিউল ও ফিচার সুইচ পরিবর্তনের তাৎক্ষণিক বিবরণী
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              মোট {toBengaliNumber(auditLogs.length)}টি লগ
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                      log.status === 'enabled'
                        ? 'bg-emerald-500'
                        : log.status === 'disabled'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="font-black text-slate-900">
                      {log.directorNameBn}{' '}
                      <span className="text-[10px] font-semibold text-slate-500">
                        ({log.roleTitleBn})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-0.5">{log.actionBn}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200">
                  {log.timestampBn}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Director Account Tester & Portal Module Launcher */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50 via-white to-amber-50 rounded-3xl border border-emerald-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>পরিচালকদের অ্যাকাউন্টে ১-ক্লিক লাইভ প্রিভিউ</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              কোনো পরিচালকের মডিউল সুইচ বন্ধ বা চালু করার পর তার অ্যাকাউন্টে পোর্টালটি কেমন দেখাচ্ছে তা নিচের যেকোনো নামের ওপর ক্লিক করে সরাসরি পরীক্ষা করুন:
            </p>

            <div className="space-y-2 pt-1">
              {otherDirectors.map((dir) => {
                const modCount = dir.viewAllModules
                  ? ALL_PORTAL_MODULE_IDS.length
                  : dir.allowedModules.length;
                return (
                  <button
                    key={dir.directorId}
                    type="button"
                    onClick={() => onSelectDirectorAccount(dir.directorId)}
                    className="w-full p-2.5 rounded-2xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 transition flex items-center justify-between gap-2 text-left cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={dir.photoUrl || logoUrl}
                        alt={dir.nameBn}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-xl object-cover border border-amber-300 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {dir.nameBn}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {dir.roleTitleBn}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                        {toBengaliNumber(modCount)}/৮ মডিউল
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-200/70 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('overview')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>কেন্দ্রীয় স্কুল ওভারভিউ ও পরিচালনা পর্ষদ পাতায় যান</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
