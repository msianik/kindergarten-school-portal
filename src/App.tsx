import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Student,
  ActivityPost,
  PickupEvent,
  SkillAssessment,
  FeeInvoice,
  AttendanceRecord,
  AdmissionApplication,
  FacebookGalleryItem,
  FcmNotification,
  PortalAccount,
  SchoolProfile,
  LeadershipProfiles,
  SchoolAssetItem,
  SchoolNotice,
} from './types/school';
import {
  INITIAL_STUDENTS,
  INITIAL_PICKUP_LOGS,
  INITIAL_ACTIVITY_POSTS,
  INITIAL_SKILL_ASSESSMENTS,
  INITIAL_INVOICES,
  INITIAL_ATTENDANCE,
  INITIAL_ADMISSIONS,
  INITIAL_FB_GALLERY,
  INITIAL_FCM_NOTIFICATIONS,
  INITIAL_SCHOOL_NOTICES,
  SCHOOL_PROFILE,
  PRINCIPAL_AND_DIRECTOR_PROFILES,
  INITIAL_SCHOOL_ASSETS,
} from './data/mockData';
import {
  PORTAL_ACCOUNTS,
  getAllPortalAccounts,
  createAdmissionFcmPayload,
  createUrgentPickupFcmPayload,
  mergeNotificationsIdempotent,
  getPermissionForDirector,
  ALL_PORTAL_MODULE_IDS,
} from './utils/schoolLogic';
import { TopNavigation } from './components/TopNavigation';
import { OverviewDashboard } from './components/OverviewDashboard';
import { TeacherPortalDashboard, ParentPortalDashboard } from './components/RolePortals';
import { PickupModule } from './components/PickupModule';
import { DigitalDiaryModule } from './components/DigitalDiaryModule';
import { SkillAssessmentModule } from './components/SkillAssessmentModule';
import { FeeAccountsModule } from './components/FeeAccountsModule';
import { AttendanceModule } from './components/AttendanceModule';
import { ParentTeacherChatModule } from './components/ParentTeacherChatModule';
import { PublicWebsite } from './components/PublicWebsite';
import { GoogleWorkspaceModule } from './components/GoogleWorkspaceModule';
import { SchoolAssetsModule } from './components/SchoolAssetsModule';
import { StudentDirectoryModule } from './components/StudentDirectoryModule';
import { StudentIdCardModule } from './components/StudentIdCardModule';
import { ClassRoutineModule } from './components/ClassRoutineModule';
import { AcademicCalendarModule } from './components/AcademicCalendarModule';
import { ExamResultsModule } from './components/ExamResultsModule';
import { ChildHealthModule } from './components/ChildHealthModule';
import { NoticeBoard } from './components/NoticeBoard';
import { ModuleSubNavPills } from './components/ModuleSubNavPills';
import { FcmNotificationCenter } from './components/FcmNotificationCenter';
import { LoginModal } from './components/LoginModal';
import {
  MobileAppModal,
  MobileBottomNav,
  OfflineIndicator,
} from './components/MobileAppShell';
import {
  checkAndTriggerFeeDueReminders,
  checkAndTriggerFeeDueRemindersForParent,
  createDemoThreeDaysDueInvoice,
} from './utils/feeReminderLogic';
import { Monitor, Smartphone } from 'lucide-react';
import {
  initAuth,
  initFcmMessaging,
  requestFcmPermissionAndToken,
  triggerBrowserDesktopNotification,
  saveDiaryPostToCloud,
  saveGalleryItemToCloud,
  savePickupLogToCloud,
  saveFcmNotificationToCloud,
  markFcmNotificationReadInCloud,
  subscribeUserNotifications,
  FcmRegistrationResult,
} from './lib/firebase';

export default function App() {
  // Default view is the Public Website open to everyone; logging in automatically selects role & opens that role's portal
  const [loggedInAccount, setLoggedInAccount] = useState<PortalAccount | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('public');
  const [currentTab, setCurrentTab] = useState<string>('public');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);

  // Branding & Connected Facebook Gallery State
  const [logoUrl, setLogoUrl] = useState<string>(SCHOOL_PROFILE.logoUrl);
  const [fbGallery, setFbGallery] = useState<FacebookGalleryItem[]>(() => {
    try {
      const stored = localStorage.getItem('ananda_custom_gallery_photos');
      if (stored) {
        const parsed: FacebookGalleryItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...INITIAL_FB_GALLERY];
        }
      }
    } catch {}
    return INITIAL_FB_GALLERY;
  });

  // School Profile & Leadership Bios Reactive State
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const stored = localStorage.getItem('ananda_school_profile_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return SCHOOL_PROFILE;
  });

  const [leadershipProfiles, setLeadershipProfiles] = useState<LeadershipProfiles>(() => {
    try {
      const stored = localStorage.getItem('ananda_leadership_profiles_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return PRINCIPAL_AND_DIRECTOR_PROFILES;
  });

  // Real-time custom event sync across tabs and views
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

  // Application Data States
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const stored = localStorage.getItem('ananda_students_v1');
      if (stored) {
        const parsed: Student[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure all 6 classes from INITIAL_STUDENTS are available
          const hasHateKhori = parsed.some((s) => s.className === 'HateKhori');
          const hasClass2 = parsed.some((s) => s.className === 'Class-2');
          let updatedList = parsed;

          // Sync birthday for std-1 to current week if old data exists
          const std1Idx = updatedList.findIndex((s) => s.id === 'std-1');
          if (std1Idx !== -1 && updatedList[std1Idx].birthDate !== '২০২১-১১-১০') {
            updatedList[std1Idx] = { ...updatedList[std1Idx], birthDate: '২০২১-১১-১০' };
          }

          if (!hasHateKhori || !hasClass2) {
            const missing = INITIAL_STUDENTS.filter(
              (initS) => !updatedList.some((p) => p.id === initS.id)
            );
            updatedList = [...updatedList, ...missing];
          }

          localStorage.setItem('ananda_students_v1', JSON.stringify(updatedList));
          return updatedList;
        }
      }
    } catch {}
    return INITIAL_STUDENTS;
  });
  const [pickupLogs, setPickupLogs] = useState<PickupEvent[]>(INITIAL_PICKUP_LOGS);
  const [activityPosts, setActivityPosts] = useState<ActivityPost[]>(INITIAL_ACTIVITY_POSTS);
  const [assessments, setAssessments] =
    useState<Record<string, SkillAssessment>>(INITIAL_SKILL_ASSESSMENTS);
  const [invoices, setInvoices] = useState<FeeInvoice[]>(() => {
    try {
      const stored = localStorage.getItem('ananda_invoices_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_INVOICES;
  });
  const [attendanceRecords, setAttendanceRecords] =
    useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [, setAdmissions] = useState<AdmissionApplication[]>(INITIAL_ADMISSIONS);

  // School Assets & Inventory Tracking State
  const [schoolAssets, setSchoolAssets] = useState<SchoolAssetItem[]>(() => {
    try {
      const stored = localStorage.getItem('ananda_school_assets_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_SCHOOL_ASSETS;
  });

  const handleUpdateSchoolAssets = (updated: SchoolAssetItem[]) => {
    setSchoolAssets(updated);
    try {
      localStorage.setItem('ananda_school_assets_v1', JSON.stringify(updated));
    } catch {}
  };

  // School Notices State (Synced with localStorage and custom event)
  const [notices, setNotices] = useState<SchoolNotice[]>(() => {
    try {
      const stored = localStorage.getItem('ananda_school_notices_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SCHOOL_NOTICES;
  });

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

  // Real-Time Firebase Cloud Messaging (FCM) Notification States
  const [fcmNotifications, setFcmNotifications] = useState<FcmNotification[]>(
    INITIAL_FCM_NOTIFICATIONS
  );
  const [activeFcmToast, setActiveFcmToast] = useState<FcmNotification | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [fcmStatus, setFcmStatus] = useState<FcmRegistrationResult | null>(null);

  // Initialize FCM foreground listener & Firestore real-time subscription when signed in
  useEffect(() => {
    requestFcmPermissionAndToken()
      .then((res) => setFcmStatus(res))
      .catch(() => {});

    initFcmMessaging((payload) => {
      const incoming: FcmNotification = {
        id: `fcm-push-${Date.now()}`,
        type:
          payload.data?.type === 'admission_application'
            ? 'admission_application'
            : 'urgent_pickup',
        priority: 'urgent',
        titleBn: payload.title || '🔔 নতুন FCM নোটিফিকেশন (আনন্দ পাঠশালা)',
        bodyBn: payload.body || 'একটি জরুরি বার্তা এসেছে।',
        targetRole: 'all_staff',
        studentOrApplicantNameBn: payload.data?.studentName || 'শিক্ষার্থী',
        className: 'Nursery',
        guardianNameBn: payload.data?.guardianName || 'অভিভাবক',
        timestamp: 'এইমাত্র (FCM Push)',
        read: false,
        actionTab: payload.data?.type === 'admission_application' ? 'overview' : 'pickup',
        fcmMessageId: `projects/gen-lang-client-0036381817/messages/fcm_${Date.now()}`,
      };
      setFcmNotifications((prev) => mergeNotificationsIdempotent(prev, incoming));
      setActiveFcmToast(incoming);
    }).catch(() => {});

    let unsubNotifications: (() => void) | null = null;
    const unsubAuth = initAuth(
      (user) => {
        if (unsubNotifications) unsubNotifications();
        unsubNotifications = subscribeUserNotifications(user.uid, (cloudItems) => {
          setFcmNotifications((prev) => {
            let next = prev;
            for (const item of cloudItems) {
              next = mergeNotificationsIdempotent(next, item);
            }
            return next;
          });
        });
      },
      () => {
        if (unsubNotifications) {
          unsubNotifications();
          unsubNotifications = null;
        }
      }
    );

    return () => {
      unsubAuth();
      if (unsubNotifications) unsubNotifications();
    };
  }, []);

  const dispatchRealTimeFcmNotification = (notif: FcmNotification) => {
    setFcmNotifications((prev) => mergeNotificationsIdempotent(prev, notif));
    setActiveFcmToast(notif);
    triggerBrowserDesktopNotification(notif);
    saveFcmNotificationToCloud(notif).catch(() => {});
  };

  // Trigger fee due notification ONLY for a logged-in parent whose child has pending/unpaid fees
  const triggerParentFeeReminderIfDue = (parentAccount: PortalAccount) => {
    if (parentAccount.role !== 'parent') return;
    const studentId = parentAccount.studentId || 'std-1';
    checkAndTriggerFeeDueRemindersForParent(
      studentId,
      invoices,
      students,
      dispatchRealTimeFcmNotification
    );
  };

  const handleEnableFcmPush = async () => {
    const res = await requestFcmPermissionAndToken();
    setFcmStatus(res);
  };

  const handleMarkNotificationRead = (id: string) => {
    setFcmNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    markFcmNotificationReadInCloud(id, true).catch(() => {});
  };

  const handleMarkAllNotificationsRead = () => {
    setFcmNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSendUrgentPickupAlert = (
    student: Student,
    guardianNameBn: string,
    relationBn: string,
    noteBn?: string
  ) => {
    const nowLabel = `আজ ${new Date().toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    const notif = createUrgentPickupFcmPayload(
      student,
      guardianNameBn,
      relationBn,
      noteBn,
      nowLabel
    );
    dispatchRealTimeFcmNotification(notif);
  };

  // Smart Role-Auto-Detect Login Handler
  const handleLoginSuccess = (account: PortalAccount) => {
    setLoggedInAccount(account);
    setCurrentRole(account.role);
    if (account.role === 'super_admin') {
      setCurrentTab('overview');
    } else if (account.role === 'gate_security') {
      setCurrentTab('pickup');
    } else if (account.role === 'accountant') {
      setCurrentTab('fees');
    } else if (account.role === 'director') {
      const perm = getPermissionForDirector(account.directorId);
      const firstMod =
        perm && !perm.viewAllModules && perm.allowedModules.length > 0
          ? perm.allowedModules[0]
          : 'overview';
      setCurrentTab(firstMod);
    } else if (account.role === 'parent') {
      setCurrentTab('overview');
      // Trigger payment due notification ONLY when a parent logs in and their child has unpaid fees
      triggerParentFeeReminderIfDue(account);
    } else {
      setCurrentTab('overview');
    }
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setLoggedInAccount(null);
    setCurrentRole('public');
    setCurrentTab('public');
    setActiveFcmToast(null);
  };

  const handleRoleChange = (role: UserRole) => {
    if (role === 'public') {
      setLoggedInAccount(null);
      setCurrentRole('public');
      setCurrentTab('public');
      setActiveFcmToast(null);
      return;
    }
    const allAccounts = getAllPortalAccounts();
    const matchingAcc =
      allAccounts.find((a) => a.role === role) || PORTAL_ACCOUNTS[0];
    setLoggedInAccount(matchingAcc);
    setCurrentRole(matchingAcc.role);
    if (role === 'super_admin') {
      setCurrentTab('overview');
    } else if (role === 'gate_security') {
      setCurrentTab('pickup');
    } else if (role === 'accountant') {
      setCurrentTab('fees');
    } else if (role === 'director') {
      const perm = getPermissionForDirector(matchingAcc.directorId);
      const firstMod =
        perm && !perm.viewAllModules && perm.allowedModules.length > 0
          ? perm.allowedModules[0]
          : 'overview';
      setCurrentTab(firstMod);
    } else if (role === 'parent') {
      setCurrentTab('overview');
      // Trigger payment due notification ONLY when a parent switches/logs in and their child has unpaid fees
      triggerParentFeeReminderIfDue(matchingAcc);
    } else {
      setCurrentTab('overview');
    }
  };

  const handleSelectDirectorAccount = (directorId: string) => {
    const allAccounts = getAllPortalAccounts();
    const dirAcc =
      allAccounts.find((a) => a.role === 'director' && a.directorId === directorId) ||
      allAccounts.find((a) => a.role === 'director');
    if (!dirAcc) return;
    setLoggedInAccount(dirAcc);
    setCurrentRole('director');
    const perm = getPermissionForDirector(directorId);
    const firstMod =
      perm && !perm.viewAllModules && perm.allowedModules.length > 0
        ? perm.allowedModules[0]
        : 'overview';
    setCurrentTab(firstMod);
  };

  // Status updates
  const handleUpdateStudentStatus = (
    studentId: string,
    status: 'in_class' | 'picked_up' | 'absent',
    event?: PickupEvent
  ) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, currentStatus: status, lastPickupEvent: event } : s
      )
    );
  };

  const handleAddPickupLog = (event: PickupEvent) => {
    setPickupLogs((prev) => [event, ...prev]);
    savePickupLogToCloud(event).catch(() => {});
  };

  const handleAddPost = (post: ActivityPost) => {
    setActivityPosts((prev) => [post, ...prev]);
    saveDiaryPostToCloud(post).catch(() => {});
  };

  const handleAddGalleryPhoto = (item: FacebookGalleryItem) => {
    setFbGallery((prev) => [item, ...prev]);
    saveGalleryItemToCloud(item).catch(() => {});
  };

  const handleAddMultipleGalleryPhotos = (newItems: FacebookGalleryItem[]) => {
    setFbGallery((prev) => [...newItems, ...prev]);
    try {
      const stored = localStorage.getItem('ananda_custom_gallery_photos');
      const existing: FacebookGalleryItem[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem('ananda_custom_gallery_photos', JSON.stringify([...newItems, ...existing]));
    } catch {}
    newItems.forEach((item) => {
      saveGalleryItemToCloud(item).catch(() => {});
    });
  };

  const handleDeleteGalleryPhoto = (photoId: string) => {
    setFbGallery((prev) => prev.filter((p) => p.id !== photoId));
    try {
      const stored = localStorage.getItem('ananda_custom_gallery_photos');
      if (stored) {
        const existing: FacebookGalleryItem[] = JSON.parse(stored);
        const updated = existing.filter((p) => p.id !== photoId);
        localStorage.setItem('ananda_custom_gallery_photos', JSON.stringify(updated));
      }
    } catch {}
  };

  const handleLikePost = (postId: string) => {
    setActivityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const handleAddComment = (
    postId: string,
    text: string,
    authorBn: string,
    roleBn: string
  ) => {
    const newComment = {
      id: `c-${Date.now()}`,
      authorBn,
      roleBn,
      text,
      timeAgo: 'এইমাত্র',
    };
    setActivityPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );
  };

  const handleUpdateAssessment = (studentId: string, updated: SkillAssessment) => {
    setAssessments((prev) => ({
      ...prev,
      [studentId]: updated,
    }));
  };

  const handlePayInvoice = (
    invoiceId: string,
    method: 'bKash' | 'Nagad',
    transactionId: string
  ) => {
    setInvoices((prev) => {
      const updated = prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'paid' as const,
              paymentMethod: method,
              transactionId,
              paidAt: 'আজ, ০৫ নভেম্বর ২০২৬',
            }
          : inv
      );
      try {
        localStorage.setItem('ananda_invoices_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleUpdateInvoices = (updatedInvoices: FeeInvoice[]) => {
    setInvoices(updatedInvoices);
    try {
      localStorage.setItem('ananda_invoices_v1', JSON.stringify(updatedInvoices));
    } catch {}
  };

  const handleUpdateAttendance = (records: AttendanceRecord[]) => {
    setAttendanceRecords(records);
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => {
      const updated = [newStudent, ...prev];
      try {
        localStorage.setItem('ananda_students_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
      try {
        localStorage.setItem('ananda_students_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== studentId);
      try {
        localStorage.setItem('ananda_students_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleAddAdmission = (newApp: AdmissionApplication) => {
    setAdmissions((prev) => [newApp, ...prev]);
    const nowLabel = `আজ ${new Date().toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    const admNotif = createAdmissionFcmPayload(newApp, nowLabel);
    dispatchRealTimeFcmNotification(admNotif);
  };

  const handleTriggerUrgentPickupTest = () => {
    const targetStudent = students[0];
    handleSendUrgentPickupAlert(
      targetStudent,
      'সুব্রত রায়',
      'বাবা',
      'অভিভাবক মেইন গেটে উপস্থিত হয়েছেন — অনুগ্রহ করে দ্রুত আদিত্য রায়কে প্রস্তুত করুন।'
    );
  };

  const handleTriggerAdmissionTest = () => {
    const sampleApp: AdmissionApplication = {
      id: `adm-${Date.now()}`,
      applicantNameBn: 'তাহসিন আহমেদ আরিশ',
      applicantNameEn: 'Tahsin Ahmed Arish',
      dateOfBirth: '2022-08-14',
      gender: 'male',
      applyingClass: 'Playgroup',
      guardianNameBn: 'মাহমুদুল হাসান',
      guardianPhone: '০১৭১২-৮৮৯৯০০',
      addressBn: 'কোর্টপাড়া, গোশালা, কুষ্টিয়া',
      submittedAt: 'আজ, ৩১ অক্টোবর ২০২৬',
      status: 'pending',
    };
    handleAddAdmission(sampleApp);
  };

  const handleTriggerFeeDueReminderTest = () => {
    // 1. Force scan existing invoices for 3-day due status
    const result = checkAndTriggerFeeDueReminders(
      invoices,
      students,
      dispatchRealTimeFcmNotification,
      { forceTrigger: true }
    );

    // 2. If no eligible invoice existed, create a realistic 3-day due invoice for the student
    if (result.triggeredCount === 0) {
      const targetStudent = students[0];
      const demoInvoice = createDemoThreeDaysDueInvoice(targetStudent);
      const updated = [demoInvoice, ...invoices];
      setInvoices(updated);
      try {
        localStorage.setItem('ananda_invoices_v1', JSON.stringify(updated));
      } catch {}
      checkAndTriggerFeeDueReminders(
        updated,
        students,
        dispatchRealTimeFcmNotification,
        { forceTrigger: true }
      );
    }
  };

  const unreadAlertsCount = fcmNotifications.filter((n) => !n.read).length;
  const isShowingPublicWebsite = currentTab === 'public' || currentRole === 'public';

  return (
    <div
      className={`min-h-screen text-slate-900 flex flex-col font-sans ${
        isMobilePreview ? 'bg-slate-900 py-4 px-2 items-center' : 'bg-[#FFFDF9]'
      }`}
    >
      {/* Mobile App Preview Top Control Banner when active on desktop */}
      {isMobilePreview && (
        <div className="w-full max-w-[420px] mb-3 px-4 py-2 rounded-2xl bg-slate-800 border border-slate-700 text-white flex items-center justify-between gap-2 text-xs shadow-lg">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>মোবাইল অ্যাপ ভিউ (390×844 PWA)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobilePreview(false)}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition-colors"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>ফুল-স্ক্রিন</span>
          </button>
        </div>
      )}

      {/* Smart Role-Detecting Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        logoUrl={logoUrl}
      />

      {/* PWA Mobile App Install & Preview Modal */}
      <MobileAppModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        isMobilePreview={isMobilePreview}
        onToggleMobilePreview={setIsMobilePreview}
        logoUrl={logoUrl}
      />

      {/* Offline Mode Connectivity Banner */}
      <OfflineIndicator />

      {/* Real-Time FCM Notification Center Drawer & Live Toast */}
      <FcmNotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={fcmNotifications}
        activeToast={activeFcmToast}
        onDismissToast={() => setActiveFcmToast(null)}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onNavigateTab={(tab) => {
          if (currentRole === 'public') {
            handleRoleChange('teacher');
          }
          setCurrentTab(tab);
        }}
        fcmStatus={fcmStatus}
        onEnableFcmPush={handleEnableFcmPush}
        onTriggerUrgentPickupTest={handleTriggerUrgentPickupTest}
        onTriggerAdmissionTest={handleTriggerAdmissionTest}
        onTriggerFeeReminderTest={handleTriggerFeeDueReminderTest}
        currentRole={currentRole}
      />

      <div
        className={
          isMobilePreview
            ? 'w-full max-w-[412px] bg-[#FFFDF9] rounded-[36px] border-[8px] border-slate-950 shadow-2xl overflow-x-hidden relative flex flex-col min-h-[844px]'
            : 'w-full flex-1 flex flex-col'
        }
      >
        {isShowingPublicWebsite ? (
          /* Standalone Public Website (Open to Everyone by Default) */
          <PublicWebsite
            onEnterPortal={(tab) => {
              if (!loggedInAccount) {
                setIsLoginModalOpen(true);
              } else {
                setCurrentRole(loggedInAccount.role);
                setCurrentTab(tab || 'overview');
              }
            }}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onOpenMobileModal={() => setIsMobileModalOpen(true)}
            isMobilePreview={isMobilePreview}
            onAddAdmission={handleAddAdmission}
            logoUrl={logoUrl}
            fbGallery={fbGallery}
            isLoggedIn={Boolean(loggedInAccount)}
            onAddMultipleGalleryPhotos={handleAddMultipleGalleryPhotos}
            onDeleteGalleryPhoto={handleDeleteGalleryPhoto}
            schoolProfile={schoolProfile}
            leadershipProfiles={leadershipProfiles}
          />
        ) : (
          /* Authenticated Role-Specific Portal (Principal/Admin, Teacher, or Parent) */
          <>
            <TopNavigation
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              currentRole={currentRole}
              loggedInAccount={loggedInAccount}
              onSelectRole={handleRoleChange}
              unreadAlertsCount={unreadAlertsCount}
              onOpenNotifications={() => setIsNotifOpen(true)}
              onOpenMobileModal={() => setIsMobileModalOpen(true)}
              isMobilePreview={isMobilePreview}
              onLogout={handleLogout}
              logoUrl={logoUrl}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-8 pb-24 lg:pb-8 space-y-5">
              {/* Check if a Director is trying to view a module turned OFF by Super Admin */}
              {currentRole === 'director' &&
              (() => {
                const perm = getPermissionForDirector(loggedInAccount?.directorId);
                if (!perm || perm.viewAllModules) return false;
                return !perm.allowedModules.includes(currentTab);
              })() ? (
                <div className="bg-white rounded-3xl border-2 border-rose-200 p-8 text-center max-w-xl mx-auto my-8 space-y-4 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto font-black text-2xl">
                    🔒
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    এই মডিউলটির ভিউ অ্যাক্সেস বর্তমানে সীমাবদ্ধ রয়েছে
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    সম্মানিত পরিচালক <strong>{loggedInAccount?.nameBn}</strong>, এই মডিউলটি বর্তমানে আপনার অ্যাকাউন্টের জন্য সক্রিয় নেই। অনুগ্রহ করে অনুমোদিত মডিউলসমূহ ব্যবহার করুন।
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentTab('overview')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black cursor-pointer transition"
                    >
                      হোম ড্যাশবোর্ডে ফিরে যান
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {currentTab !== 'overview' && currentTab !== 'public' && (
                    <ModuleSubNavPills
                      currentTab={currentTab}
                      onSelectTab={setCurrentTab}
                      currentRole={currentRole}
                    />
                  )}

                  {currentTab === 'overview' && (
                    <>
                      {currentRole === 'teacher' && loggedInAccount ? (
                        <TeacherPortalDashboard
                          account={loggedInAccount}
                          students={students}
                          invoices={invoices}
                          activityPosts={activityPosts}
                          attendanceRecords={attendanceRecords}
                          fcmNotifications={fcmNotifications}
                          onNavigateTab={setCurrentTab}
                          onOpenNotifications={() => setIsNotifOpen(true)}
                          onMarkNotificationRead={handleMarkNotificationRead}
                        />
                      ) : currentRole === 'parent' && loggedInAccount ? (
                        <ParentPortalDashboard
                          account={loggedInAccount}
                          students={students}
                          activityPosts={activityPosts}
                          assessments={assessments}
                          invoices={invoices}
                          pickupLogs={pickupLogs}
                          onNavigateTab={setCurrentTab}
                          onSendUrgentPickupAlert={handleSendUrgentPickupAlert}
                        />
                      ) : (
                        <OverviewDashboard
                          students={students}
                          activityPosts={activityPosts}
                          pickupLogs={pickupLogs}
                          invoices={invoices}
                          attendanceRecords={attendanceRecords}
                          fcmNotifications={fcmNotifications}
                          onOpenNotifications={() => setIsNotifOpen(true)}
                          onNavigateTab={setCurrentTab}
                          currentRole={currentRole}
                          loggedInAccount={loggedInAccount}
                          onSelectRole={handleRoleChange}
                          logoUrl={logoUrl}
                          onUpdateLogo={setLogoUrl}
                          fbGallery={fbGallery}
                          onAddGalleryPhoto={handleAddGalleryPhoto}
                          onSendBroadcastNotification={dispatchRealTimeFcmNotification}
                          schoolProfile={schoolProfile}
                          onUpdateSchoolProfile={setSchoolProfile}
                          leadershipProfiles={leadershipProfiles}
                          onUpdateLeadershipProfiles={setLeadershipProfiles}
                        />
                      )}
                    </>
                  )}

                  {currentTab === 'students' && (
                    <StudentDirectoryModule
                      students={students}
                      assessments={assessments}
                      onAddStudent={handleAddStudent}
                      onUpdateStudent={handleUpdateStudent}
                      onDeleteStudent={handleDeleteStudent}
                      currentRole={currentRole}
                      loggedInAccount={loggedInAccount}
                      onNavigateTab={setCurrentTab}
                    />
                  )}

                  {currentTab === 'idcards' && (
                    <StudentIdCardModule
                      students={students}
                      currentRole={currentRole}
                      loggedInAccount={loggedInAccount}
                      onNavigateTab={setCurrentTab}
                    />
                  )}

                  {currentTab === 'routine' && (
                    <ClassRoutineModule
                      currentRole={currentRole}
                      initialClass={
                        currentRole === 'parent' && loggedInAccount?.assignedClass
                          ? (loggedInAccount.assignedClass as any)
                          : undefined
                      }
                    />
                  )}

                  {currentTab === 'calendar' && (
                    <AcademicCalendarModule
                      currentRole={currentRole}
                      loggedInAccount={loggedInAccount}
                      onNavigateTab={setCurrentTab}
                      onSendBroadcastNotification={(title, body) => {
                        const notif: FcmNotification = {
                          id: `notif-event-${Date.now()}`,
                          type: 'broadcast_announcement',
                          priority: 'high',
                          titleBn: title,
                          bodyBn: body,
                          targetRole: 'parent',
                          studentOrApplicantNameBn: 'সকল শিক্ষার্থী ও অভিভাবক',
                          className: 'HateKhori',
                          guardianNameBn: loggedInAccount?.nameBn || 'অ্যাডমিন',
                          guardianPhone: '01914057512',
                          timestamp: 'এইমাত্র',
                          read: false,
                          actionTab: 'calendar',
                          fcmMessageId: `projects/gen-lang-client-0036381817/messages/event-${Date.now()}`,
                        };
                        dispatchRealTimeFcmNotification(notif);
                      }}
                    />
                  )}

                  {currentTab === 'results' && (
                    <ExamResultsModule
                      students={students}
                      currentRole={currentRole}
                      schoolProfile={schoolProfile}
                      initialClass={
                        loggedInAccount?.assignedClass
                          ? (loggedInAccount.assignedClass as any)
                          : 'Nursery'
                      }
                      loggedInStudentId={loggedInAccount?.studentId}
                    />
                  )}

                  {currentTab === 'health' && (
                    <ChildHealthModule
                      students={students}
                      currentRole={currentRole}
                      schoolProfile={schoolProfile}
                      initialClass={
                        loggedInAccount?.assignedClass
                          ? (loggedInAccount.assignedClass as any)
                          : 'Nursery'
                      }
                      loggedInStudentId={loggedInAccount?.studentId}
                    />
                  )}

                  {currentTab === 'pickup' && (
                    <PickupModule
                      students={students}
                      onUpdateStudentStatus={handleUpdateStudentStatus}
                      pickupLogs={pickupLogs}
                      onAddPickupLog={handleAddPickupLog}
                      onSendUrgentPickupAlert={handleSendUrgentPickupAlert}
                      currentRole={currentRole}
                    />
                  )}

                  {currentTab === 'diary' && (
                    <DigitalDiaryModule
                      activityPosts={activityPosts}
                      onAddPost={handleAddPost}
                      onLikePost={handleLikePost}
                      onAddComment={handleAddComment}
                      currentRole={currentRole}
                      onSendHomeworkNotification={dispatchRealTimeFcmNotification}
                      loggedInTeacherNameBn={loggedInAccount?.nameBn}
                    />
                  )}

                  {currentTab === 'messages' && (
                    <ParentTeacherChatModule
                      students={students}
                      currentRole={currentRole}
                      loggedInAccount={loggedInAccount}
                      onSendChatNotification={dispatchRealTimeFcmNotification}
                      onNavigateTab={(tab) => setCurrentTab(tab as any)}
                    />
                  )}

                  {currentTab === 'notices' && (
                    <NoticeBoard
                      notices={notices}
                      isAdmin={currentRole === 'super_admin' || currentRole === 'principal'}
                      onNavigateApply={() => setCurrentTab('public')}
                      onSendBroadcastNotification={dispatchRealTimeFcmNotification}
                    />
                  )}

                  {currentTab === 'skills' && (
                    <SkillAssessmentModule
                      students={students}
                      assessments={assessments}
                      onUpdateAssessment={handleUpdateAssessment}
                      currentRole={currentRole}
                    />
                  )}

                  {currentTab === 'fees' && (
                    <FeeAccountsModule
                      invoices={invoices}
                      onPayInvoice={handlePayInvoice}
                      onUpdateInvoices={handleUpdateInvoices}
                      onUpdateStudent={handleUpdateStudent}
                      currentRole={currentRole}
                      students={students}
                      loggedInAccount={loggedInAccount}
                      onTriggerFeeReminderTest={handleTriggerFeeDueReminderTest}
                    />
                  )}

                  {currentTab === 'attendance' && (
                    <AttendanceModule
                      students={students}
                      attendanceRecords={attendanceRecords}
                      onUpdateAttendance={handleUpdateAttendance}
                      currentRole={currentRole}
                      loggedInTeacherNameBn={loggedInAccount?.nameBn}
                      onSendAttendanceNotification={dispatchRealTimeFcmNotification}
                    />
                  )}

                  {currentTab === 'workspace' && (
                    <GoogleWorkspaceModule
                      students={students}
                      activityPosts={activityPosts}
                      invoices={invoices}
                      attendanceRecords={attendanceRecords}
                      onAddGalleryPhoto={handleAddGalleryPhoto}
                    />
                  )}

                  {currentTab === 'inventory' && (
                    <SchoolAssetsModule
                      assets={schoolAssets}
                      onUpdateAssets={handleUpdateSchoolAssets}
                      currentRole={currentRole}
                      loggedInAccount={loggedInAccount}
                      onSendLowStockNotification={dispatchRealTimeFcmNotification}
                    />
                  )}
                </>
              )}
            </main>
          </>
        )}

        {/* Native Mobile App Bottom Navigation Bar */}
        <MobileBottomNav
          currentRole={currentRole}
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenMobileModal={() => setIsMobileModalOpen(true)}
          forceVisible={isMobilePreview}
        />
      </div>
    </div>
  );
}
