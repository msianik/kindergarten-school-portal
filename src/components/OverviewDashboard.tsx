import React, { useState, useEffect } from 'react';
import {
  Student,
  ActivityPost,
  PickupEvent,
  FeeInvoice,
  AttendanceRecord,
  UserRole,
  FacebookGalleryItem,
  FcmNotification,
  Achievement,
  TeacherMember,
  CommitteeDirector,
  SchoolProfile,
  LeadershipProfiles,
  SchoolNotice,
  PortalAccount,
  PortalAccountRole,
  DirectorAccessPermission,
} from '../types/school';
import {
  calculateFeeSummary,
  calculateAttendanceStats,
  getDirectorPermissions,
  saveDirectorPermissions,
  INITIAL_DIRECTOR_PERMISSIONS,
  ALL_PORTAL_MODULE_IDS,
  upsertPortalAccount,
  removePortalAccountByEntityId,
  getPortalRoleLabelBn,
  getPortalNameForRoleBn,
  normalizeIdentifier,
} from '../utils/schoolLogic';
import {
  SCHOOL_PROFILE,
  PRINCIPAL_AND_DIRECTOR_PROFILES,
  SCHOOL_TEACHERS,
  MANAGEMENT_COMMITTEE,
  INITIAL_ACHIEVEMENTS,
  INITIAL_SCHOOL_NOTICES,
} from '../data/mockData';
import {
  ShieldCheck,
  BookOpen,
  Award,
  CreditCard,
  Users,
  CalendarCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Smile,
  Camera,
  ExternalLink,
  Plus,
  MapPin,
  Phone,
  CheckCircle2,
  BellRing,
  ShieldAlert,
  GraduationCap,
  Package,
  IdCard,
  Edit3,
  Palette,
  Megaphone,
  ChevronRight,
} from 'lucide-react';
import { EditSchoolProfileModal } from './EditSchoolProfileModal';
import { GlobalDashboardSearch } from './GlobalDashboardSearch';
import { NoticeBoard } from './NoticeBoard';
import { BirthdayCelebrationWidget } from './BirthdayCelebrationWidget';

// Modular Dashboard Subcomponents & Modals
import { SuperAdminAccessPanel } from './dashboard/SuperAdminAccessPanel';
import { MediaManagerDrawer } from './dashboard/MediaManagerDrawer';
import { PhotoLightboxModal } from './dashboard/PhotoLightboxModal';
import { AddAchievementModal } from './dashboard/AddAchievementModal';
import { AchievementDetailModal } from './dashboard/AchievementDetailModal';
import { BroadcastFcmModal } from './dashboard/BroadcastFcmModal';
import { EditLeaderProfileModal } from './dashboard/EditLeaderProfileModal';
import { EditTeacherModal } from './dashboard/EditTeacherModal';
import { EditDirectorModal } from './dashboard/EditDirectorModal';
import { StudentInspectModal } from './dashboard/StudentInspectModal';
import { AddEditNoticeModal } from './dashboard/AddEditNoticeModal';
import { BoardOfDirectorsSection } from './dashboard/BoardOfDirectorsSection';
import { AchievementsSection } from './dashboard/AchievementsSection';
import { TeachersDirectorySection } from './dashboard/TeachersDirectorySection';
import { FacebookGallerySection } from './dashboard/FacebookGallerySection';

interface OverviewDashboardProps {
  students: Student[];
  activityPosts: ActivityPost[];
  pickupLogs: PickupEvent[];
  invoices: FeeInvoice[];
  attendanceRecords: AttendanceRecord[];
  fcmNotifications: FcmNotification[];
  onOpenNotifications: () => void;
  onNavigateTab: (tab: string) => void;
  currentRole: UserRole;
  loggedInAccount?: PortalAccount | null;
  onSelectRole: (role: UserRole) => void;
  logoUrl: string;
  onUpdateLogo: (newUrl: string) => void;
  fbGallery: FacebookGalleryItem[];
  onAddGalleryPhoto: (item: FacebookGalleryItem) => void;
  onSendBroadcastNotification?: (notif: FcmNotification) => void;
  schoolProfile?: SchoolProfile;
  onUpdateSchoolProfile?: (profile: SchoolProfile) => void;
  leadershipProfiles?: LeadershipProfiles;
  onUpdateLeadershipProfiles?: (profiles: LeadershipProfiles) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  students,
  activityPosts,
  pickupLogs,
  invoices,
  attendanceRecords,
  fcmNotifications,
  onOpenNotifications,
  onNavigateTab,
  currentRole,
  loggedInAccount,
  onSelectRole,
  logoUrl,
  onUpdateLogo,
  fbGallery,
  onAddGalleryPhoto,
  onSendBroadcastNotification,
  schoolProfile: propSchoolProfile,
  onUpdateSchoolProfile,
  leadershipProfiles: propLeadershipProfiles,
  onUpdateLeadershipProfiles,
}) => {
  const feeSummary = calculateFeeSummary(invoices);
  const attendanceStats = calculateAttendanceStats(attendanceRecords);
  const pickedUpCount = students.filter((s) => s.currentStatus === 'picked_up').length;
  const inClassCount = students.filter((s) => s.currentStatus === 'in_class').length;

  // Media Manager & Lightbox State
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<FacebookGalleryItem | null>(null);
  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);

  // Helper date function for Bengali UI
  const getBengaliCurrentDate = () => {
    const bnMonths = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
    ];
    const toBn = (n: number | string) =>
      n.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
    const now = new Date();
    const day = toBn(now.getDate());
    const month = bnMonths[now.getMonth()];
    const year = toBn(now.getFullYear());
    return `${day} ${month} ${year}`;
  };



  // Super Admin & Director Access Permissions State
  const [directorPermissions, setDirectorPermissions] = useState<DirectorAccessPermission[]>(() =>
    getDirectorPermissions()
  );
  const [showAccessControlPanel, setShowAccessControlPanel] = useState<boolean>(true);

  useEffect(() => {
    const handleSyncPerms = () => {
      setDirectorPermissions(getDirectorPermissions());
    };
    window.addEventListener('ananda-director-permissions-updated', handleSyncPerms);
    return () => window.removeEventListener('ananda-director-permissions-updated', handleSyncPerms);
  }, []);

  const isSuperAdmin = currentRole === 'super_admin';
  const isDirector = currentRole === 'director';

  const activeDirectorPerm = isDirector
    ? directorPermissions.find((p) => p.directorId === loggedInAccount?.directorId) ||
      directorPermissions.find((p) => !p.isSuperAdmin) ||
      null
    : null;

  const hasDirectorEditAccess = Boolean(
    activeDirectorPerm &&
      (activeDirectorPerm.canEditSchoolAndBoard ||
        activeDirectorPerm.canManageNoticesAndEvents ||
        activeDirectorPerm.canManageStudentsAndAdmissions)
  );

  const isPrincipal =
    currentRole === 'super_admin' ||
    currentRole === 'principal' ||
    (currentRole === 'director' && hasDirectorEditAccess);

  const [achievementToast, setAchievementToast] = useState<string | null>(null);
  const [institutionTab, setInstitutionTab] = useState<'teachers' | 'directors' | 'gallery' | 'achievements'>('teachers');

  const handleToggleDirectorViewAll = (directorId: string) => {
    const updated = directorPermissions.map((perm) => {
      if (perm.directorId !== directorId || perm.isSuperAdmin) return perm;
      const willEnable = !perm.viewAllModules;
      return {
        ...perm,
        viewAllModules: willEnable,
        allowedModules: willEnable ? [...ALL_PORTAL_MODULE_IDS] : ['overview'],
        lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন)',
        lastUpdatedAtBn: willEnable ? 'সকল ভিউ সক্রিয়' : 'কাস্টম ভিউ মোড',
      };
    });
    setDirectorPermissions(updated);
    saveDirectorPermissions(updated);
    const targetDir = updated.find((d) => d.directorId === directorId);
    if (targetDir) {
      setAchievementToast(
        targetDir.viewAllModules
          ? `👁️ পরিচালক "${targetDir.nameBn}"-এর সকল ভিউ চালু করা হয়েছে!`
          : `🔒 পরিচালক "${targetDir.nameBn}"-এর সব ভিউ বন্ধ করে কাস্টম করা হয়েছে।`
      );
      setTimeout(() => setAchievementToast(null), 3000);
    }
  };

  const handleToggleDirectorEditAccess = (directorId: string) => {
    const updated = directorPermissions.map((perm) => {
      if (perm.directorId !== directorId || perm.isSuperAdmin) return perm;
      const isFull = Boolean(
        perm.canEditSchoolAndBoard &&
          perm.canManageNoticesAndEvents &&
          perm.canManageStudentsAndAdmissions &&
          perm.canManageFeesAndAccounts &&
          perm.canApproveGatePassAndDiary
      );
      const willEnable = !isFull;
      return {
        ...perm,
        canEditSchoolAndBoard: willEnable,
        canManageNoticesAndEvents: willEnable,
        canManageStudentsAndAdmissions: willEnable,
        canManageFeesAndAccounts: willEnable,
        canApproveGatePassAndDiary: willEnable,
        lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন)',
        lastUpdatedAtBn: willEnable ? 'এডিট অ্যাক্সেস চালু' : 'এডিট অ্যাক্সেস বন্ধ',
      };
    });
    setDirectorPermissions(updated);
    saveDirectorPermissions(updated);
    const targetDir = updated.find((d) => d.directorId === directorId);
    if (targetDir) {
      const isNowFull = targetDir.canEditSchoolAndBoard;
      setAchievementToast(
        isNowFull
          ? `✏️ পরিচালক "${targetDir.nameBn}"-কে এডিট ও পরিচালনা অ্যাক্সেস দেওয়া হয়েছে!`
          : `👁️ পরিচালক "${targetDir.nameBn}"-এর এডিট অ্যাক্সেস বন্ধ (শুধু ভিউ) করা হয়েছে।`
      );
      setTimeout(() => setAchievementToast(null), 3000);
    }
  };

  const handleToggleDirectorModule = (directorId: string, moduleId: string) => {
    const updated = directorPermissions.map((perm) => {
      if (perm.directorId !== directorId || perm.isSuperAdmin) return perm;
      const baseModules = perm.viewAllModules
        ? [...ALL_PORTAL_MODULE_IDS]
        : perm.allowedModules || ['overview'];
      const exists = baseModules.includes(moduleId);
      const nextModules = exists
        ? baseModules.filter((m) => m !== moduleId)
        : Array.from(new Set([...baseModules, moduleId]));
      const allSelected = ALL_PORTAL_MODULE_IDS.every((id) => nextModules.includes(id));
      return {
        ...perm,
        viewAllModules: allSelected,
        allowedModules: nextModules,
        lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন · সদস্য সচিব)',
        lastUpdatedAtBn: 'মডিউল ভিউ আপডেটকৃত',
      };
    });
    setDirectorPermissions(updated);
    saveDirectorPermissions(updated);
    const targetDir = updated.find((d) => d.directorId === directorId);
    if (targetDir) {
      const isNowAllowed = targetDir.viewAllModules || targetDir.allowedModules.includes(moduleId);
      setAchievementToast(
        isNowAllowed
          ? `✅ পরিচালক "${targetDir.nameBn}"-কে এই অপশন দেখার অনুমতি দেওয়া হয়েছে!`
          : `🔒 পরিচালক "${targetDir.nameBn}"-এর এই অপশন দেখার অনুমতি বন্ধ করা হয়েছে।`
      );
      setTimeout(() => setAchievementToast(null), 2500);
    }
  };

  const handleSetAllDirectorsAccess = (enable: boolean) => {
    const updated = directorPermissions.map((perm) => {
      if (perm.isSuperAdmin) return perm;
      return {
        ...perm,
        viewAllModules: enable,
        allowedModules: enable ? [...ALL_PORTAL_MODULE_IDS] : [],
        lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন)',
        lastUpdatedAtBn: enable ? 'সকল ভিউ চালু' : 'সকল অ্যাক্সেস বন্ধ',
      };
    });
    setDirectorPermissions(updated);
    saveDirectorPermissions(updated);
    setAchievementToast(
      enable
        ? '✅ সকল পরিচালকের ভিউ ও অ্যাক্সেস চালু করা হয়েছে!'
        : '🔒 সকল পরিচালকের ভিউ ও অ্যাক্সেস বন্ধ করা হয়েছে।'
    );
    setTimeout(() => setAchievementToast(null), 3500);
  };

  const handleToggleDirectorPermission = (
    directorId: string,
    field:
      | 'viewAllModules'
      | 'canEditSchoolAndBoard'
      | 'canManageNoticesAndEvents'
      | 'canManageStudentsAndAdmissions'
      | 'canManageFeesAndAccounts'
      | 'canApproveGatePassAndDiary'
  ) => {
    const updated = directorPermissions.map((perm) => {
      if (perm.directorId !== directorId || perm.isSuperAdmin) return perm;
      const nextVal = !perm[field];
      return {
        ...perm,
        [field]: nextVal,
        allowedModules:
          field === 'viewAllModules' && nextVal ? [...ALL_PORTAL_MODULE_IDS] : perm.allowedModules,
        lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন · সদস্য সচিব)',
        lastUpdatedAtBn: `আপডেট: ${getBengaliCurrentDate()}`,
      };
    });
    setDirectorPermissions(updated);
    saveDirectorPermissions(updated);
    const targetDir = updated.find((d) => d.directorId === directorId);
    if (targetDir) {
      setAchievementToast(
        `🛡️ পরিচালক "${targetDir.nameBn}"-এর অ্যাক্সেস পারমিশন সুপার অ্যাডমিন কর্তৃক আপডেট করা হয়েছে!`
      );
      setTimeout(() => setAchievementToast(null), 3500);
    }
  };

  const handleSetDirectorAccessPreset = (directorId: string, mode: 'view_only' | 'full_edit') => {
    const isFull = mode === 'full_edit';
    const updated = directorPermissions.map((perm) => {
      if (perm.directorId !== directorId || perm.isSuperAdmin) return perm;
      return {
        ...perm,
        viewAllModules: true,
        canEditSchoolAndBoard: isFull,
        canManageNoticesAndEvents: isFull,
        canManageStudentsAndAdmissions: isFull,
        canManageFeesAndAccounts: isFull,
        canApproveGatePassAndDiary: isFull,
        allowedModules: [...ALL_PORTAL_MODULE_IDS],
        lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন · সদস্য সচিব)',
        lastUpdatedAtBn: isFull ? 'পূর্ণ এডিট অ্যাক্সেস প্রদানকৃত' : 'সবকিছু ভিউ অ্যাক্সেস সক্রিয়',
      };
    });
    setDirectorPermissions(updated);
    saveDirectorPermissions(updated);
    const targetDir = updated.find((d) => d.directorId === directorId);
    if (targetDir) {
      setAchievementToast(
        isFull
          ? `✅ পরিচালক "${targetDir.nameBn}"-কে পূর্ণ এডিট ও ম্যানেজমেন্ট অ্যাক্সেস দেওয়া হয়েছে!`
          : `👁️ পরিচালক "${targetDir.nameBn}"-কে শুধুমাত্র ভিউ (সবকিছু দেখার অপশন) মোডে রাখা হয়েছে।`
      );
      setTimeout(() => setAchievementToast(null), 3500);
    }
  };



  const handleResetDirectorPermissions = () => {
    setDirectorPermissions(INITIAL_DIRECTOR_PERMISSIONS);
    saveDirectorPermissions(INITIAL_DIRECTOR_PERMISSIONS);
    setAchievementToast(
      '🔄 সকল পরিচালকের অ্যাক্সেস ডিফল্ট "সবকিছু ভিউ" মোডে রিসেট করা হয়েছে!'
    );
    setTimeout(() => setAchievementToast(null), 3500);
  };

  // Broadcast FCM Notification State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // School Profile & Leadership Profiles State
  const [leadershipProfiles, setLeadershipProfiles] = useState<LeadershipProfiles>(() => {
    if (propLeadershipProfiles) return propLeadershipProfiles;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ananda_leadership_profiles_v1');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return PRINCIPAL_AND_DIRECTOR_PROFILES;
  });

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    if (propSchoolProfile) return propSchoolProfile;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ananda_school_profile_v1');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return SCHOOL_PROFILE;
  });

  useEffect(() => {
    if (propLeadershipProfiles) setLeadershipProfiles(propLeadershipProfiles);
  }, [propLeadershipProfiles]);

  useEffect(() => {
    if (propSchoolProfile) setSchoolProfile(propSchoolProfile);
  }, [propSchoolProfile]);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEv = e as CustomEvent<{
        schoolProfile?: SchoolProfile;
        leadershipProfiles?: LeadershipProfiles;
      }>;
      if (customEv.detail?.schoolProfile) {
        setSchoolProfile(customEv.detail.schoolProfile);
      }
      if (customEv.detail?.leadershipProfiles) {
        setLeadershipProfiles(customEv.detail.leadershipProfiles);
      }
    };
    window.addEventListener('school-profile-updated', handleSync);
    return () => window.removeEventListener('school-profile-updated', handleSync);
  }, []);

  const [showEditSchoolProfileModal, setShowEditSchoolProfileModal] = useState(false);
  const [profileModalInitialTab, setProfileModalInitialTab] = useState<
    'principal' | 'headTeacher' | 'contact' | 'theme'
  >('principal');

  const openEditProfileModal = (
    tab: 'principal' | 'headTeacher' | 'contact' | 'theme' = 'principal'
  ) => {
    setProfileModalInitialTab(tab);
    setShowEditSchoolProfileModal(true);
  };

  useEffect(() => {
    const handleOpenThemeSettings = () => {
      openEditProfileModal('theme');
    };
    window.addEventListener('open-school-theme-settings', handleOpenThemeSettings);
    return () => window.removeEventListener('open-school-theme-settings', handleOpenThemeSettings);
  }, []);

  const [teachersList, setTeachersList] = useState<TeacherMember[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ananda_teachers_list_v1');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return SCHOOL_TEACHERS;
  });

  const persistLeadershipProfiles = (updated: LeadershipProfiles) => {
    setLeadershipProfiles(updated);
    if (onUpdateLeadershipProfiles) onUpdateLeadershipProfiles(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ananda_leadership_profiles_v1', JSON.stringify(updated));
      } catch {}
    }
  };

  const persistSchoolProfile = (updated: SchoolProfile) => {
    setSchoolProfile(updated);
    if (onUpdateSchoolProfile) onUpdateSchoolProfile(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ananda_school_profile_v1', JSON.stringify(updated));
      } catch {}
    }
  };

  const persistTeachersList = (updated: TeacherMember[]) => {
    setTeachersList(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ananda_teachers_list_v1', JSON.stringify(updated));
        window.dispatchEvent(
          new CustomEvent('ananda-teachers-updated', { detail: { teachers: updated } })
        );
      } catch {}
    }
  };

  // Directors Management State
  const [directorsList, setDirectorsList] = useState<CommitteeDirector[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ananda_management_directors_v4');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return MANAGEMENT_COMMITTEE;
  });

  const persistDirectorsList = (updated: CommitteeDirector[]) => {
    setDirectorsList(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ananda_management_directors_v4', JSON.stringify(updated));
        window.dispatchEvent(
          new CustomEvent('ananda-directors-updated', { detail: { directors: updated } })
        );
      } catch {}
    }
  };

  useEffect(() => {
    const handleSyncDirectors = (e: Event) => {
      const customEv = e as CustomEvent<{ directors?: CommitteeDirector[] }>;
      if (customEv.detail?.directors) {
        setDirectorsList(customEv.detail.directors);
      }
    };
    window.addEventListener('ananda-directors-updated', handleSyncDirectors);
    return () => window.removeEventListener('ananda-directors-updated', handleSyncDirectors);
  }, []);

  const [showDirectorModal, setShowDirectorModal] = useState(false);
  const [editingDirector, setEditingDirector] = useState<CommitteeDirector | null>(null);
  const [isAddingNewDirector, setIsAddingNewDirector] = useState(false);

  const openAddNewDirectorModal = () => {
    setEditingDirector(null);
    setIsAddingNewDirector(true);
    setShowDirectorModal(true);
  };

  const openEditDirectorModal = (dir: CommitteeDirector) => {
    setEditingDirector(dir);
    setIsAddingNewDirector(false);
    setShowDirectorModal(true);
  };

  const handleSaveDirector = (
    directorData: Omit<CommitteeDirector, 'id'> & { id?: string },
    isNew: boolean
  ) => {
    const cleanUsername = directorData.username || `dir_${Date.now().toString().slice(-4)}`;
    const cleanPassword = directorData.password || '123456';
    const assignedRole: PortalAccountRole = directorData.portalRole || 'director';

    if (!isNew && editingDirector) {
      let updated = directorsList.map((d) => {
        if (d.id === editingDirector.id) {
          return {
            ...d,
            ...directorData,
            id: editingDirector.id,
          };
        }
        return directorData.isChairman ? { ...d, isChairman: false } : d;
      });
      if (directorData.isChairman) {
        const chairmanItem = updated.find((d) => d.id === editingDirector.id);
        const others = updated.filter((d) => d.id !== editingDirector.id);
        if (chairmanItem) updated = [chairmanItem, ...others];
      }
      persistDirectorsList(updated);

      upsertPortalAccount({
        id: editingDirector.id === 'dir-3' ? 'acc-super-admin' : `acc-dir-${editingDirector.id}`,
        nameBn: directorData.nameBn,
        nameEn: directorData.nameEn || directorData.nameBn,
        role: assignedRole,
        roleTitleBn: `${directorData.roleBn} (${getPortalRoleLabelBn(assignedRole)})`,
        portalNameBn: getPortalNameForRoleBn(assignedRole),
        email: directorData.email || `${cleanUsername}@anandapathshala.edu.bd`,
        phone: normalizeIdentifier(directorData.phone || '01914057511'),
        username: cleanUsername,
        passwordHint: cleanPassword,
        avatarUrl: directorData.photoUrl || '/assets/fb/photo-6.jpg',
        directorId: editingDirector.id,
      });

      const currentPerms = getDirectorPermissions();
      const existsInPerms = currentPerms.some((p) => p.directorId === editingDirector.id);
      const nextPerms = existsInPerms
        ? currentPerms.map((p) =>
            p.directorId === editingDirector.id
              ? {
                  ...p,
                  nameBn: directorData.nameBn,
                  nameEn: directorData.nameEn || directorData.nameBn,
                  roleTitleBn: directorData.roleBn,
                  photoUrl: directorData.photoUrl || p.photoUrl,
                  email: directorData.email || p.email,
                  phone: normalizeIdentifier(directorData.phone || p.phone),
                  username: cleanUsername,
                  isSuperAdmin: assignedRole === 'super_admin',
                }
              : p
          )
        : [
            ...currentPerms,
            {
              directorId: editingDirector.id,
              nameBn: directorData.nameBn,
              nameEn: directorData.nameEn || directorData.nameBn,
              roleTitleBn: directorData.roleBn,
              photoUrl: directorData.photoUrl || '/assets/fb/photo-6.jpg',
              email: directorData.email || `${cleanUsername}@anandapathshala.edu.bd`,
              phone: normalizeIdentifier(directorData.phone || '01914057511'),
              username: cleanUsername,
              isSuperAdmin: assignedRole === 'super_admin',
              viewAllModules: true,
              canEditSchoolAndBoard: assignedRole === 'super_admin',
              canManageNoticesAndEvents: assignedRole === 'super_admin',
              canManageStudentsAndAdmissions: assignedRole === 'super_admin',
              canManageFeesAndAccounts: assignedRole === 'super_admin',
              canApproveGatePassAndDiary: assignedRole === 'super_admin',
              allowedModules: [...ALL_PORTAL_MODULE_IDS],
              lastUpdatedByBn: 'প্রোফাইল এডিট সিঙ্ক',
              lastUpdatedAtBn: 'সকল মডিউল ভিউ অ্যাক্সেস সক্রিয়',
            },
          ];
      setDirectorPermissions(nextPerms);
      saveDirectorPermissions(nextPerms);

      setAchievementToast(
        `✅ পরিচালক "${directorData.nameBn}"-এর প্রোফাইল ও লগইন আইডি সংরক্ষিত হয়েছে!`
      );
    } else {
      const newDirId = `dir-${Date.now()}`;
      const newDir: CommitteeDirector = {
        ...directorData,
        id: newDirId,
        order: directorsList.length + 1,
      };
      const baseList = directorData.isChairman
        ? directorsList.map((d) => ({ ...d, isChairman: false }))
        : directorsList;
      persistDirectorsList(directorData.isChairman ? [newDir, ...baseList] : [...baseList, newDir]);

      upsertPortalAccount({
        id: `acc-dir-${newDirId}`,
        nameBn: newDir.nameBn,
        nameEn: newDir.nameEn,
        role: assignedRole,
        roleTitleBn: `${newDir.roleBn} (${getPortalRoleLabelBn(assignedRole)})`,
        portalNameBn: getPortalNameForRoleBn(assignedRole),
        email: newDir.email || `${cleanUsername}@anandapathshala.edu.bd`,
        phone: normalizeIdentifier(newDir.phone || '01914057511'),
        username: cleanUsername,
        passwordHint: cleanPassword,
        avatarUrl: newDir.photoUrl || '/assets/fb/photo-6.jpg',
        directorId: newDirId,
      });

      const currentPerms = getDirectorPermissions();
      const nextPerms: DirectorAccessPermission[] = [
        ...currentPerms,
        {
          directorId: newDirId,
          nameBn: newDir.nameBn,
          nameEn: newDir.nameEn,
          roleTitleBn: newDir.roleBn,
          photoUrl: newDir.photoUrl || '/assets/fb/photo-6.jpg',
          email: newDir.email || `${cleanUsername}@anandapathshala.edu.bd`,
          phone: normalizeIdentifier(newDir.phone || '01914057511'),
          username: cleanUsername,
          isSuperAdmin: assignedRole === 'super_admin',
          viewAllModules: true,
          canEditSchoolAndBoard: assignedRole === 'super_admin',
          canManageNoticesAndEvents: assignedRole === 'super_admin',
          canManageStudentsAndAdmissions: assignedRole === 'super_admin',
          canManageFeesAndAccounts: assignedRole === 'super_admin',
          canApproveGatePassAndDiary: assignedRole === 'super_admin',
          allowedModules: [...ALL_PORTAL_MODULE_IDS],
          lastUpdatedByBn: 'নতুন প্রোফাইল তৈরি',
          lastUpdatedAtBn: 'সকল মডিউল ভিউ অ্যাক্সেস সক্রিয়',
        },
      ];
      setDirectorPermissions(nextPerms);
      saveDirectorPermissions(nextPerms);

      setAchievementToast(
        `🎉 নতুন পরিচালক "${newDir.nameBn}" যুক্ত হয়েছেন! লগইন আইডি: ${cleanUsername}`
      );
    }
    setShowDirectorModal(false);
    setTimeout(() => setAchievementToast(null), 4000);
  };

  const handleDeleteDirector = (id: string, name: string) => {
    const updated = directorsList.filter((d) => d.id !== id);
    persistDirectorsList(updated);
    removePortalAccountByEntityId(id);
    setAchievementToast(`🗑️ পরিচালক "${name}" কে তালিকা থেকে সরানো হয়েছে।`);
    setTimeout(() => setAchievementToast(null), 3000);
  };

  const handleResetDirectorsToDefault = () => {
    if (
      window.confirm(
        'আপনি কি পরিচালনা পর্ষদের সকল ডাটা রিসেট করে প্রাতিষ্ঠানিক ডিফল্ট ৫ সদস্যের পর্ষদে ফিরতে চান?'
      )
    ) {
      persistDirectorsList(MANAGEMENT_COMMITTEE);
      setAchievementToast('🔄 পরিচালনা পর্ষদের ডাটা ডিফল্টে রিসেট করা হয়েছে!');
      setTimeout(() => setAchievementToast(null), 3000);
    }
  };

  // Notices Management State
  const [notices, setNotices] = useState<SchoolNotice[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ananda_school_notices_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_SCHOOL_NOTICES;
  });

  const persistNotices = (updated: SchoolNotice[]) => {
    setNotices(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ananda_school_notices_v1', JSON.stringify(updated));
        window.dispatchEvent(
          new CustomEvent('ananda-notices-updated', { detail: { notices: updated } })
        );
      } catch {}
    }
  };

  useEffect(() => {
    const handleNoticeSync = (e: Event) => {
      const customEv = e as CustomEvent<{ notices?: SchoolNotice[] }>;
      if (customEv.detail?.notices) {
        setNotices(customEv.detail.notices);
      }
    };
    window.addEventListener('ananda-notices-updated', handleNoticeSync);
    return () => window.removeEventListener('ananda-notices-updated', handleNoticeSync);
  }, []);

  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<SchoolNotice | null>(null);

  const openAddNoticeModal = () => {
    setEditingNotice(null);
    setShowNoticeModal(true);
  };

  const openEditNoticeModal = (notice: SchoolNotice) => {
    setEditingNotice(notice);
    setShowNoticeModal(true);
  };

  const handleSaveNotice = (noticeData: Partial<SchoolNotice>, isEditing: boolean) => {
    if (isEditing && editingNotice) {
      const updated = notices.map((n) =>
        n.id === editingNotice.id
          ? ({ ...n, ...noticeData } as SchoolNotice)
          : n
      );
      persistNotices(updated);
      setAchievementToast(`✅ নোটিশ "${noticeData.titleBn}" সফলভাবে আপডেট করা হয়েছে!`);
    } else {
      const newNotice: SchoolNotice = {
        id: `notice-custom-${Date.now()}`,
        titleBn: noticeData.titleBn || '',
        titleEn: noticeData.titleEn,
        category: noticeData.category || 'admission',
        priority: noticeData.priority || 'high',
        badgeBn: noticeData.badgeBn || 'সাধারণ নোটিশ',
        targetAudienceBn: noticeData.targetAudienceBn || 'সকল শিক্ষার্থী ও অভিভাবক',
        dateBn: noticeData.dateBn || getBengaliCurrentDate(),
        validUntilBn: noticeData.validUntilBn,
        descriptionBn: noticeData.descriptionBn || '',
        actionLink: noticeData.actionLink,
        actionTextBn: noticeData.actionTextBn,
        attachmentName: noticeData.attachmentName,
        isPinned: noticeData.isPinned,
        facebookPostUrl: noticeData.facebookPostUrl,
        createdAt: new Date().toISOString(),
      };
      persistNotices([newNotice, ...notices]);
      setAchievementToast(`🎉 নতুন নোটিশ "${newNotice.titleBn}" পাবলিক নোটিশবোর্ডে প্রকাশিত হয়েছে!`);
    }
    setShowNoticeModal(false);
    setTimeout(() => setAchievementToast(null), 4000);
  };

  const handleDeleteNotice = (noticeId: string) => {
    const target = notices.find((n) => n.id === noticeId);
    const title = target?.titleBn || 'এই নোটিশটি';
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${title}" নোটিশবোর্ড থেকে স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      return;
    }
    const updated = notices.filter((n) => n.id !== noticeId);
    persistNotices(updated);
    setAchievementToast(`🗑️ নোটিশটি সফলভাবে মুছে ফেলা হয়েছে।`);
    setTimeout(() => setAchievementToast(null), 3000);
  };

  const handleResetNoticesToDefault = () => {
    if (
      window.confirm('আপনি কি নোটিশবোর্ডের সকল ডাটা রিসেট করে প্রাথমিক ডিফল্ট নোটিশে ফিরে যেতে চান?')
    ) {
      persistNotices(INITIAL_SCHOOL_NOTICES);
      setAchievementToast('🔄 নোটিশবোর্ডের ডাটা রিসেট করা হয়েছে!');
      setTimeout(() => setAchievementToast(null), 3000);
    }
  };

  // Leadership Profile Edit State
  const [editingLeaderKey, setEditingLeaderKey] = useState<'principal' | 'headTeacher' | null>(null);

  const handleSaveLeaderProfile = (
    updated: LeadershipProfiles,
    leaderKey: 'principal' | 'headTeacher'
  ) => {
    persistLeadershipProfiles(updated);
    setEditingLeaderKey(null);
    setAchievementToast(
      `✅ ${leaderKey === 'principal' ? 'প্রিন্সিপাল' : 'প্রধান শিক্ষক'} এর বাণী ও প্রোফাইল আপডেট করা হয়েছে!`
    );
    setTimeout(() => setAchievementToast(null), 4000);
  };

  // Teacher Edit State
  const [editingTeacher, setEditingTeacher] = useState<TeacherMember | null>(null);
  const [isAddingNewTeacher, setIsAddingNewTeacher] = useState(false);
  const [teacherModalCategory, setTeacherModalCategory] = useState<'teacher' | 'support_staff'>('teacher');

  const openAddNewTeacherModal = () => {
    setEditingTeacher(null);
    setIsAddingNewTeacher(true);
    setTeacherModalCategory('teacher');
  };

  const openAddNewSupportStaffModal = () => {
    setEditingTeacher(null);
    setIsAddingNewTeacher(true);
    setTeacherModalCategory('support_staff');
  };

  const openEditTeacherModal = (teacher: TeacherMember) => {
    setEditingTeacher(teacher);
    setIsAddingNewTeacher(false);
    setTeacherModalCategory(
      teacher.staffCategory === 'support_staff' ? 'support_staff' : 'teacher'
    );
  };

  const handleSaveTeacher = (
    teacherData: Omit<TeacherMember, 'id'> & { id?: string },
    isNew: boolean
  ) => {
    const cleanUsername = teacherData.username || `staff_${Date.now().toString().slice(-4)}`;
    const cleanPassword = teacherData.password || '123456';
    const assignedRole: PortalAccountRole = teacherData.portalRole || 'teacher';

    if (isNew) {
      const newTchId = `tch-${Date.now()}`;
      const newTch: TeacherMember = {
        ...teacherData,
        id: newTchId,
      };
      const updated = [...teachersList, newTch];
      persistTeachersList(updated);

      upsertPortalAccount({
        id: `acc-tch-${newTchId}`,
        nameBn: newTch.nameBn,
        nameEn: newTch.nameEn,
        role: assignedRole,
        roleTitleBn: `${newTch.designationBn} (${getPortalRoleLabelBn(assignedRole)})`,
        portalNameBn: getPortalNameForRoleBn(assignedRole),
        email: newTch.email || `${cleanUsername}@anandapathshala.edu.bd`,
        phone: normalizeIdentifier(newTch.phone || '01914057511'),
        username: cleanUsername,
        passwordHint: cleanPassword,
        avatarUrl: newTch.photoUrl,
        assignedClass: newTch.assignedClass,
      });

      setIsAddingNewTeacher(false);
      setAchievementToast(
        `✅ "${newTch.nameBn}" যুক্ত হয়েছেন! লগইন আইডি: ${cleanUsername} · রোল: ${getPortalRoleLabelBn(assignedRole)}`
      );
    } else if (editingTeacher) {
      const updated = teachersList.map((t) =>
        t.id === editingTeacher.id
          ? ({ ...t, ...teacherData, id: editingTeacher.id } as TeacherMember)
          : t
      );
      persistTeachersList(updated);

      upsertPortalAccount({
        id:
          cleanUsername === 'principal'
            ? 'acc-principal'
            : cleanUsername === 'teacher'
            ? 'acc-teacher'
            : cleanUsername === 'gate'
            ? 'acc-gate'
            : `acc-tch-${editingTeacher.id}`,
        nameBn: teacherData.nameBn,
        nameEn: teacherData.nameEn || teacherData.nameBn,
        role: assignedRole,
        roleTitleBn: `${teacherData.designationBn} (${getPortalRoleLabelBn(assignedRole)})`,
        portalNameBn: getPortalNameForRoleBn(assignedRole),
        email: teacherData.email || `${cleanUsername}@anandapathshala.edu.bd`,
        phone: normalizeIdentifier(teacherData.phone || '01914057511'),
        username: cleanUsername,
        passwordHint: cleanPassword,
        avatarUrl: teacherData.photoUrl || editingTeacher.photoUrl,
        assignedClass: teacherData.assignedClass,
      });

      setEditingTeacher(null);
      setAchievementToast(`✅ "${teacherData.nameBn}"-এর প্রোফাইল ও লগইন অ্যাকাউন্ট আপডেট হয়েছে!`);
    }
    setTimeout(() => setAchievementToast(null), 4000);
  };

  const handleDeleteTeacher = (teacherId: string, name: string) => {
    if (!isPrincipal) return;
    const updated = teachersList.filter((t) => t.id !== teacherId);
    persistTeachersList(updated);
    removePortalAccountByEntityId(teacherId);
    setEditingTeacher(null);
    setAchievementToast(`🗑️ "${name}" তালিকা ও লগইন অ্যাকাউন্ট থেকে অপসারিত হয়েছেন।`);
    setTimeout(() => setAchievementToast(null), 4000);
  };

  // Achievements State
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ananda_pathshala_achievements_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_ACHIEVEMENTS;
  });

  const [showAddAchievementModal, setShowAddAchievementModal] = useState<boolean>(false);
  const [selectedAchievementForModal, setSelectedAchievementForModal] =
    useState<Achievement | null>(null);

  const persistAchievements = (updated: Achievement[]) => {
    setAchievements(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ananda_pathshala_achievements_v1', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleCreateAchievement = (newRecord: Achievement) => {
    const updated = [newRecord, ...achievements];
    persistAchievements(updated);
    setShowAddAchievementModal(false);
    setAchievementToast(`🎉 "${newRecord.titleBn}" সফলভাবে অর্জন ও মাইলফলক তালিকায় যোগ করা হয়েছে!`);
    setTimeout(() => setAchievementToast(null), 4500);
  };

  const handleDeleteAchievement = (achId: string, title: string) => {
    if (!isPrincipal) return;
    const confirmDelete = window.confirm(
      `আপনি কি নিশ্চিত যে "${title}" অর্জনটি তালিকা থেকে মুছে ফেলতে চান?`
    );
    if (!confirmDelete) return;

    const updated = achievements.filter((a) => a.id !== achId);
    persistAchievements(updated);
    setAchievementToast(`🗑️ "${title}" তালিকা থেকে অপসারিত হয়েছে।`);
    setTimeout(() => setAchievementToast(null), 4000);
  };

  const handleToggleFeaturedAchievement = (achId: string) => {
    if (!isPrincipal) return;
    const updated = achievements.map((a) =>
      a.id === achId ? { ...a, featured: !a.featured } : a
    );
    persistAchievements(updated);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Cover & Logo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-amber-700 text-white shadow-sm print:hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src={schoolProfile.coverUrl}
            alt="আনন্দ পাঠশালা কুষ্টিয়া কভার ফটো"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 max-w-2xl">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white p-1.5 shadow-lg shrink-0 border-2 border-amber-300">
              <img
                src={logoUrl}
                alt="আনন্দ পাঠশালা কুষ্টিয়া অফিশিয়াল লোগো"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>{schoolProfile.taglineBn}</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {schoolProfile.nameBn} — স্মার্ট পোর্টাল
              </h2>

              <p className="text-amber-200 font-semibold text-xs sm:text-sm">
                “{schoolProfile.sloganBn}” · শ্রেণি: {schoolProfile.classesBn}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-white/90 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  {schoolProfile.addressBn}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  {schoolProfile.phoneBn}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Account Info & Settings */}
          <div className="bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs shrink-0 space-y-3">
            <div className="flex items-center justify-between gap-2.5">
              <span className="font-bold text-white/90">লগইনকৃত অ্যাকাউন্ট:</span>
              <div className="flex items-center gap-1.5">
                {isPrincipal && (
                  <button
                    type="button"
                    onClick={() => openEditProfileModal('contact')}
                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg flex items-center gap-1 transition-colors border border-white/30 cursor-pointer shadow-2xs"
                    title="প্রিন্সিপালের বাণী, প্রধান শিক্ষকের পরিচিতি ও স্কুলের যোগাযোগের তথ্য এডিট করুন"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                    <span>প্রোফাইল এডিট</span>
                  </button>
                )}
                {isPrincipal && (
                  <button
                    type="button"
                    onClick={() => setShowMediaManager(!showMediaManager)}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>লোগো ও ছবি</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-2.5 border border-white/15">
              {loggedInAccount?.avatarUrl ? (
                <img
                  src={loggedInAccount.avatarUrl}
                  alt={loggedInAccount.nameBn}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover border border-amber-300 shrink-0 bg-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black">
                  👑
                </div>
              )}
              <div className="min-w-0">
                <div className="font-black text-white text-xs sm:text-sm truncate flex items-center gap-1.5">
                  <span>{loggedInAccount?.nameBn || (isSuperAdmin ? 'মোস্তফা আল মামুন' : 'সম্মানিত ব্যবহারকারী')}</span>
                  {isSuperAdmin && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                      সুপার অ্যাডমিন
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-amber-200 font-semibold truncate">
                  {loggedInAccount?.roleTitleBn || (isSuperAdmin ? 'পরিচালক ও সদস্য সচিব (Secretary)' : 'আনন্দ পাঠশালা পোর্টাল')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Super Admin Access Control Panel */}
      <SuperAdminAccessPanel
        isSuperAdmin={isSuperAdmin}
        directorPermissions={directorPermissions}
        onToggleMasterEdit={handleToggleDirectorEditAccess}
        onToggleEditPermission={(directorId, permKey) =>
          handleToggleDirectorPermission(directorId, permKey)
        }
        onSetAllEditAccess={(enable) => {
          const updated = directorPermissions.map((perm) => {
            if (perm.isSuperAdmin) return perm;
            return {
              ...perm,
              viewAllModules: true,
              allowedModules: [...ALL_PORTAL_MODULE_IDS],
              canEditSchoolAndBoard: enable,
              canManageNoticesAndEvents: enable,
              canManageStudentsAndAdmissions: enable,
              canManageFeesAndAccounts: enable,
              canApproveGatePassAndDiary: enable,
              lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন)',
              lastUpdatedAtBn: enable ? 'সকল পরিচালকে পূর্ণ এডিট প্রদান' : 'সকল পরিচালক ভিউ-অনলি মোডে',
            };
          });
          setDirectorPermissions(updated);
          saveDirectorPermissions(updated);
          setAchievementToast(
            enable
              ? '✅ সকল পরিচালকের পূর্ণ এডিট ক্ষমতা উন্মুক্ত করা হয়েছে!'
              : '👁️ সকল পরিচালকের জন্য শুধু ভিউ মোড সক্রিয় করা হয়েছে (সবকিছু দেখতে পারবেন, এডিট বন্ধ)।'
          );
          setTimeout(() => setAchievementToast(null), 3500);
        }}
        onToggleViewAll={handleToggleDirectorViewAll}
        onToggleEditAccess={handleToggleDirectorEditAccess}
        onToggleModule={handleToggleDirectorModule}
        onSetAllAccess={handleSetAllDirectorsAccess}
        logoUrl={logoUrl}
        onSelectRole={onSelectRole}
      />

      {/* Media Manager Drawer */}
      <MediaManagerDrawer
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        logoUrl={logoUrl}
        onUpdateLogo={onUpdateLogo}
        onAddGalleryPhoto={onAddGalleryPhoto}
      />

      {/* Birthday Celebration & Greeting Card Widget */}
      <BirthdayCelebrationWidget
        students={students}
        schoolProfile={schoolProfile}
      />

      {/* Global Interactive Search Bar */}
      <GlobalDashboardSearch
        students={students}
        attendanceRecords={attendanceRecords}
        activityPosts={activityPosts}
        pickupLogs={pickupLogs}
        onNavigateTab={onNavigateTab}
        currentRole={currentRole}
        onSelectStudent={(s) => setInspectedStudent(s)}
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">নিবন্ধিত শিক্ষার্থী</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900 font-mono">{students.length} জন</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {SCHOOL_PROFILE.classesBn}
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-400 hover:shadow-xs transition-all cursor-pointer group"
          title="হাজিরা মডিউল খুলুন ও মাসিক CSV রিপোর্ট এক্সপোর্ট করুন"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium group-hover:text-teal-700 transition-colors">
              আজকের ক্লাসরুম হাজিরা
            </span>
            <CalendarCheck className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-teal-700 font-mono">
              {attendanceStats.presentRate}%
            </span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              মাসিক CSV 📊
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 block mt-0.5">
            সবাই আজ উপস্থিত · রিপোর্ট দেখুন
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">নিরাপদ গেট প্রস্থান</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-emerald-700 font-mono">{pickedUpCount} জন</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            শ্রেণিকক্ষে আছে: {inClassCount} জন
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">বিকাশ ফি কালেকশন</span>
            <CreditCard className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900 font-mono">
            ৳ {feeSummary.totalCollected}
          </span>
          <span className="text-[10px] text-rose-500 block mt-0.5">
            বকেয়া: ৳ {feeSummary.totalOutstanding}
          </span>
        </div>
      </div>

      {/* Real-Time FCM Teacher Notification Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-5 text-white border border-amber-400/40 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  তাৎক্ষণিক শিক্ষক নোটিফিকেশন (Firebase Cloud Messaging - FCM)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  {fcmNotifications.filter((n) => !n.read).length} অপঠিত
                </span>
              </div>
              <p className="text-xs text-emerald-200/90">
                নতুন ভর্তি আবেদন এবং গেট থেকে জরুরি পিক-আপ রিকোয়েস্টের রিয়েল-টাইম পুশ অ্যালার্ট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {isPrincipal && (
              <button
                type="button"
                onClick={() => setShowBroadcastModal(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Megaphone className="w-3.5 h-3.5 text-slate-950" />
                <span>সবাইকে নতুন নোটিফিকেশন পাঠান</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenNotifications}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>নোটিফিকেশন সেন্টার ও টেস্ট ট্রিগার খুলুন</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fcmNotifications.slice(0, 2).map((notif) => {
            const isUrgent = notif.type === 'urgent_pickup';
            return (
              <div
                key={notif.id}
                onClick={onOpenNotifications}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isUrgent
                    ? 'bg-rose-950/50 border-rose-500/50 hover:border-rose-400'
                    : 'bg-emerald-950/50 border-emerald-500/50 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isUrgent
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {isUrgent ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : (
                      <GraduationCap className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {notif.titleBn}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {notif.bodyBn}
                    </p>
                    <span className="text-[10px] text-amber-300 font-mono block">
                      {notif.timestamp} · অভিভাবক: {notif.guardianNameBn}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast Notification Alert for Reminders / Status Updates */}
      {achievementToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/40 animate-fade-in text-xs max-w-md print:hidden">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="flex-1">{achievementToast}</p>
          <button
            type="button"
            onClick={() => {
              setAchievementToast(null);
            }}
            className="text-slate-400 hover:text-white font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Recent School Notices & Circulars Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-4 sm:p-5 text-white border border-emerald-500/30 shadow-md space-y-3.5 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  সর্বশেষ নোটিশ ও প্রাতিষ্ঠানিক সার্কুলার
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  {notices.length}টি নোটিশ
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                ছুটি, পরীক্ষা, ভর্তি মেলা ও জরুরি পুশ ব্রডকাস্ট আপডেট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {isPrincipal && (
              <button
                type="button"
                onClick={openAddNoticeModal}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-slate-950" />
                <span>+ নতুন নোটিশ</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigateTab('notices')}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-white/20 cursor-pointer"
            >
              <span>সকল নোটিশ ও সার্কুলার দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </div>

        {/* Top 2 Recent Notices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notices.slice(0, 2).map((notice) => {
            const isUrgent = notice.priority === 'urgent';
            return (
              <div
                key={notice.id}
                onClick={() => onNavigateTab('notices')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isUrgent
                    ? 'bg-rose-950/40 border-rose-500/40 hover:border-rose-400'
                    : 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400'
                }`}
                title="সম্পূর্ণ নোটিশ ও সার্কুলার পড়তে ক্লিক করুন"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isUrgent
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-amber-400 text-slate-950'
                      }`}
                    >
                      {notice.badgeBn || (isUrgent ? 'জরুরি বিজ্ঞপ্তি' : 'সাধারণ নোটিশ')}
                    </span>
                    <span className="text-[10px] text-emerald-200/90 font-mono">
                      {notice.dateBn}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 leading-snug">
                    {notice.titleBn}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {notice.descriptionBn}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-amber-300 font-semibold pt-1 border-t border-white/10">
                  <span>প্রাপক: {notice.targetAudienceBn || 'সকল অভিভাবক ও শিক্ষক'}</span>
                  <span className="flex items-center gap-0.5 text-white/90">
                    <span>বিস্তারিত</span>
                    <ChevronRight className="w-3 h-3 text-amber-300" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Institutional Hub: Tabbed Switcher (Teachers, Directors, Gallery, Achievements) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <span>🏛️ প্রতিষ্ঠান পরিচিতি ও পরিচালনা পর্ষদ</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              শিক্ষক ও স্টাফ, পরিচালনা পর্ষদ, ক্যাম্পাস ফটো গ্যালারি ও সম্মাননা
            </p>
          </div>

          {/* 4 Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setInstitutionTab('teachers')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                institutionTab === 'teachers'
                  ? 'bg-slate-900 text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              👨‍🏫 শিক্ষক ও স্টাফ ({teachersList.length})
            </button>
            <button
              type="button"
              onClick={() => setInstitutionTab('directors')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                institutionTab === 'directors'
                  ? 'bg-slate-900 text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              👑 পরিচালনা পর্ষদ ({directorsList.length})
            </button>
            <button
              type="button"
              onClick={() => setInstitutionTab('gallery')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                institutionTab === 'gallery'
                  ? 'bg-slate-900 text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              📸 ক্যাম্পাস গ্যালারি ({fbGallery.length})
            </button>
            <button
              type="button"
              onClick={() => setInstitutionTab('achievements')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                institutionTab === 'achievements'
                  ? 'bg-slate-900 text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              🏆 অর্জন ও সম্মাননা ({achievements.length})
            </button>
          </div>
        </div>

        {/* Active Tab Panel */}
        {institutionTab === 'teachers' && (
          <TeachersDirectorySection
            teachersList={teachersList}
            leadershipProfiles={leadershipProfiles}
            schoolProfile={schoolProfile}
            isPrincipal={isPrincipal}
            onOpenEditProfileModal={openEditProfileModal}
            onOpenAddNewTeacher={openAddNewTeacherModal}
            onOpenAddNewSupportStaff={openAddNewSupportStaffModal}
            onOpenEditTeacher={openEditTeacherModal}
          />
        )}

        {institutionTab === 'directors' && (
          <BoardOfDirectorsSection
            directorsList={directorsList}
            isPrincipal={isPrincipal}
            logoUrl={logoUrl}
            onAddNewDirector={openAddNewDirectorModal}
            onEditDirector={openEditDirectorModal}
            onDeleteDirector={handleDeleteDirector}
            onResetDirectorsToDefault={handleResetDirectorsToDefault}
            onNavigateTab={onNavigateTab}
          />
        )}

        {institutionTab === 'gallery' && (
          <FacebookGallerySection
            fbGallery={fbGallery}
            logoUrl={logoUrl}
            onOpenMediaManager={() => setShowMediaManager(true)}
            onNavigateTab={onNavigateTab}
            onSelectPhoto={(photo) => setActiveLightboxPhoto(photo)}
          />
        )}

        {institutionTab === 'achievements' && (
          <AchievementsSection
            achievements={achievements}
            isPrincipal={isPrincipal}
            onOpenAddAchievement={() => setShowAddAchievementModal(true)}
            onSelectAchievementDetail={(a) => setSelectedAchievementForModal(a)}
            onToggleFeatured={handleToggleFeaturedAchievement}
            onDeleteAchievement={handleDeleteAchievement}
          />
        )}
      </div>

      {/* Photo Lightbox Modal */}
      <PhotoLightboxModal
        photo={activeLightboxPhoto}
        onClose={() => setActiveLightboxPhoto(null)}
      />

      {/* Add Achievement Modal */}
      <AddAchievementModal
        isOpen={showAddAchievementModal}
        onClose={() => setShowAddAchievementModal(false)}
        students={students}
        onAddAchievement={handleCreateAchievement}
      />

      {/* Achievement Detail Certificate Modal */}
      <AchievementDetailModal
        achievement={selectedAchievementForModal}
        onClose={() => setSelectedAchievementForModal(null)}
        logoUrl={logoUrl}
      />

      {/* Broadcast FCM Modal */}
      <BroadcastFcmModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        onSendNotification={(notif) => {
          if (onSendBroadcastNotification) {
            onSendBroadcastNotification(notif);
          }
          setAchievementToast('📢 সবাইকে নতুন পুশ নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!');
          setTimeout(() => setAchievementToast(null), 4000);
        }}
      />

      {/* Edit Leader Profile Modal */}
      <EditLeaderProfileModal
        leaderKey={editingLeaderKey}
        leadershipProfiles={leadershipProfiles}
        onClose={() => setEditingLeaderKey(null)}
        onSave={handleSaveLeaderProfile}
      />

      {/* Edit Teacher Modal */}
      <EditTeacherModal
        isOpen={Boolean(editingTeacher || isAddingNewTeacher)}
        isAddingNew={isAddingNewTeacher}
        initialStaffCategory={teacherModalCategory}
        teacher={editingTeacher}
        teachersCount={teachersList.length}
        onClose={() => {
          setEditingTeacher(null);
          setIsAddingNewTeacher(false);
        }}
        onSave={handleSaveTeacher}
        onDelete={handleDeleteTeacher}
      />

      {/* Edit Director Modal */}
      <EditDirectorModal
        isOpen={showDirectorModal}
        isAddingNew={isAddingNewDirector}
        director={editingDirector}
        directorsCount={directorsList.length}
        onClose={() => setShowDirectorModal(false)}
        onSave={handleSaveDirector}
        onDelete={handleDeleteDirector}
      />

      {/* Edit School Profile Modal */}
      <EditSchoolProfileModal
        isOpen={showEditSchoolProfileModal}
        schoolProfile={schoolProfile}
        leadershipProfiles={leadershipProfiles}
        onSaveSchoolProfile={persistSchoolProfile}
        onSaveLeadershipProfiles={persistLeadershipProfiles}
        initialTab={profileModalInitialTab}
        onClose={() => setShowEditSchoolProfileModal(false)}
      />

      {/* Inspected Student Detail Modal */}
      <StudentInspectModal
        student={inspectedStudent}
        onClose={() => setInspectedStudent(null)}
        onNavigateTab={onNavigateTab}
      />

      {/* Add / Edit School Notice Modal */}
      <AddEditNoticeModal
        isOpen={showNoticeModal}
        editingNotice={editingNotice}
        onClose={() => setShowNoticeModal(false)}
        onSave={handleSaveNotice}
        onDelete={handleDeleteNotice}
        currentDateBn={getBengaliCurrentDate()}
      />
    </div>
  );
};
