import {
  Student,
  PickupPerson,
  PickupEvent,
  SkillCriterion,
  FeeInvoice,
  AttendanceRecord,
  AdmissionApplication,
  FcmNotification,
  PortalAccount,
  PortalAccountRole,
  DirectorAccessPermission,
  TeacherMember,
  CommitteeDirector,
  SchoolClass,
  ConsistencyTier,
  StudentMonthlyAttendanceSummary,
  MonthlyAttendanceReportMeta,
  ActivityPost,
  SchoolAssetItem,
  RolePolicyConfig,
  DEFAULT_ROLE_POLICY_CONFIG,
} from '../types/school';
import {
  SCHOOL_TEACHERS,
  MANAGEMENT_COMMITTEE,
  INITIAL_STUDENTS,
} from '../data/mockData';

export const ALL_PORTAL_MODULE_IDS = [
  'overview',
  'students',
  'idcards',
  'routine',
  'calendar',
  'results',
  'health',
  'pickup',
  'diary',
  'messages',
  'notices',
  'skills',
  'attendance',
  'staff',
  'fees',
  'workspace',
  'inventory',
];

/**
 * Pre-configured school accounts for automatic role detection on login
 * Super Admin: Mostofa Al Mamun (Director & Secretary)
 * All Directors: Full system view access by default; granular edit/module access controlled by Super Admin
 */
export const PORTAL_ACCOUNTS: PortalAccount[] = [
  {
    id: 'acc-super-admin',
    nameBn: 'মোস্তফা আল মামুন',
    nameEn: 'Mostofa Al Mamun',
    role: 'super_admin',
    roleTitleBn: 'সুপার অ্যাডমিন · পরিচালক ও সদস্য সচিব (Director & Secretary)',
    portalNameBn: 'সুপার অ্যাডমিন ও কেন্দ্রীয় অ্যাক্সেস নিয়ন্ত্রণ পোর্টাল',
    email: 'mostofa.mamun@anandapathshala.edu.bd',
    phone: '01788990011',
    username: 'superadmin',
    passwordHint: '123456',
    avatarUrl: '/assets/biddalay/mostofa_mamun.jpg',
    directorId: 'dir-3',
  },
  {
    id: 'acc-dir-noman',
    nameBn: 'আল নোমান',
    nameEn: 'Al Noman',
    role: 'director',
    roleTitleBn: 'সভাপতি / চেয়ারম্যান (Chairman), পরিচালনা পর্ষদ',
    portalNameBn: 'পরিচালনা পর্ষদ ভিউ ও পর্যবেক্ষণ পোর্টাল',
    email: 'al.noman@anandapathshala.edu.bd',
    phone: '01633455667',
    username: 'noman',
    passwordHint: '123456',
    avatarUrl: '/assets/fb/al_noman.jpg',
    directorId: 'dir-4',
  },
  {
    id: 'acc-dir-anik',
    nameBn: 'এম এস আই অনিক',
    nameEn: 'MSI Anik',
    role: 'director',
    roleTitleBn: 'সম্মানিত পরিচালক (Director)',
    portalNameBn: 'পরিচালনা পর্ষদ ভিউ ও পর্যবেক্ষণ পোর্টাল',
    email: 'msianik.bd@gmail.com',
    phone: '01914057511',
    username: 'anik',
    passwordHint: '123456',
    avatarUrl: '/assets/fb/msi_anik.webp',
    directorId: 'dir-5',
  },
  {
    id: 'acc-dir-adnan',
    nameBn: 'আলী আদনান',
    nameEn: 'Ali Adnan',
    role: 'director',
    roleTitleBn: 'প্রতিষ্ঠাতা ও পরিচালক (Founder & Director), পরিচালনা পর্ষদ',
    portalNameBn: 'পরিচালনা পর্ষদ ভিউ ও পর্যবেক্ষণ পোর্টাল',
    email: 'ali.adnan@anandapathshala.edu.bd',
    phone: '01711223344',
    username: 'adnan',
    passwordHint: '123456',
    avatarUrl: '/assets/fb/ali_adnan.jpg',
    directorId: 'dir-1',
  },
  {
    id: 'acc-dir-summy',
    nameBn: 'সাম্মী আক্তার',
    nameEn: 'Summy Akter',
    role: 'director',
    roleTitleBn: 'সম্মানিত পরিচালক (Director), পরিচালনা পর্ষদ',
    portalNameBn: 'পরিচালনা পর্ষদ ভিউ ও পর্যবেক্ষণ পোর্টাল',
    email: 'summy.akter@anandapathshala.edu.bd',
    phone: '01822334556',
    username: 'summy',
    passwordHint: '123456',
    avatarUrl: '/assets/fb/summy_akter.jpg',
    directorId: 'dir-2',
  },
  {
    id: 'acc-principal',
    nameBn: 'শাফী আব্দুল্লাহ',
    nameEn: 'Shafee Abdullah',
    role: 'principal',
    roleTitleBn: 'প্রিন্সিপাল (Principal), আনন্দ পাঠশালা',
    portalNameBn: 'প্রিন্সিপাল ও একাডেমিক অ্যাডমিন পোর্টাল',
    email: 'principal@anandapathshala.edu.bd',
    phone: '01914057512',
    username: 'principal',
    passwordHint: '123456',
    avatarUrl: '/assets/biddalay/shafee_abdullah.jpg',
  },
  {
    id: 'acc-teacher',
    nameBn: 'ফাতেমা আক্তার',
    nameEn: 'Fatema Akter',
    role: 'teacher',
    roleTitleBn: 'প্রধান শিক্ষক (Head Teacher), আনন্দ পাঠশালা',
    portalNameBn: 'শিক্ষক ক্লাসরুম ও একাডেমিক পোর্টাল',
    email: 'teacher@anandapathshala.edu.bd',
    phone: '01715112233',
    username: 'teacher',
    passwordHint: '123456',
    avatarUrl: '/assets/biddalay/fatema_akter.jpg',
    assignedClass: 'Nursery',
  },
  {
    id: 'acc-parent',
    nameBn: 'সুব্রত রায়',
    nameEn: 'Subrata Roy',
    role: 'parent',
    roleTitleBn: 'অভিভাবক (আদিত্য রায় — নার্সারি)',
    portalNameBn: 'অভিভাবক ও সন্তান ড্যাশবোর্ড পোর্টাল',
    email: 'parent@anandapathshala.edu.bd',
    phone: '01711223399',
    username: 'parent',
    passwordHint: '123456',
    avatarUrl: '/assets/biddalay/student_hasin.jpg',
    studentId: 'std-1',
  },
  {
    id: 'acc-accountant',
    nameBn: 'মাহমুদুল হাসান',
    nameEn: 'Mahmudul Hasan',
    role: 'accountant',
    roleTitleBn: 'হিসাবরক্ষণ কর্মকর্তা (Accounts Officer)',
    portalNameBn: 'হিসাবরক্ষণ ও বেতন/ফি পোর্টাল',
    email: 'accounts@anandapathshala.edu.bd',
    phone: '01719887766',
    username: 'accountant',
    passwordHint: '123456',
    avatarUrl: '/assets/fb/photo-4.jpg',
  },
  {
    id: 'acc-gate',
    nameBn: 'হাবিবুর রহমান',
    nameEn: 'Habibur Rahman',
    role: 'gate_security',
    roleTitleBn: 'গেট সিকিউরিটি ইন-চার্জ ও কেয়ারটেকার',
    portalNameBn: 'স্মার্ট গেট-পাস ও সিকিউরিটি পোর্টাল',
    email: 'gate@anandapathshala.edu.bd',
    phone: '01819001122',
    username: 'gate',
    passwordHint: '123456',
    avatarUrl: '/assets/fb/logo.jpg',
  },
];

export const ROLE_POLICY_STORAGE_KEY = 'ananda_role_policy_config_v1';

export function getRolePolicyConfig(): RolePolicyConfig {
  if (typeof window === 'undefined') return DEFAULT_ROLE_POLICY_CONFIG;
  try {
    const raw = localStorage.getItem(ROLE_POLICY_STORAGE_KEY);
    if (raw) return { ...DEFAULT_ROLE_POLICY_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_ROLE_POLICY_CONFIG;
}

export function saveRolePolicyConfig(config: RolePolicyConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ROLE_POLICY_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('ananda-role-policy-updated', { detail: config }));
  } catch {}
}

export const INITIAL_DIRECTOR_PERMISSIONS: DirectorAccessPermission[] = [
  {
    directorId: 'dir-3',
    nameBn: 'মোস্তফা আল মামুন',
    nameEn: 'Mostofa Al Mamun',
    roleTitleBn: 'সুপার অ্যাডমিন · পরিচালক ও সদস্য সচিব (Director & Secretary)',
    photoUrl: '/assets/biddalay/mostofa_mamun.jpg',
    email: 'mostofa.mamun@anandapathshala.edu.bd',
    phone: '01788990011',
    username: 'superadmin',
    isSuperAdmin: true,
    viewAllModules: true,
    canEditSchoolAndBoard: true,
    canManageNoticesAndEvents: true,
    canManageStudentsAndAdmissions: true,
    canManageFeesAndAccounts: true,
    canApproveGatePassAndDiary: true,
    allowedModules: [...ALL_PORTAL_MODULE_IDS],
    lastUpdatedByBn: 'সিস্টেম ডিফল্ট (সুপার অ্যাডমিন)',
    lastUpdatedAtBn: 'সার্বক্ষণিক পূর্ণ নিয়ন্ত্রণ',
  },
  {
    directorId: 'dir-4',
    nameBn: 'আল নোমান',
    nameEn: 'Al Noman',
    roleTitleBn: 'সভাপতি / চেয়ারম্যান (Chairman)',
    photoUrl: '/assets/fb/al_noman.jpg',
    email: 'al.noman@anandapathshala.edu.bd',
    phone: '01633455667',
    username: 'noman',
    isSuperAdmin: false,
    viewAllModules: true,
    canEditSchoolAndBoard: false,
    canManageNoticesAndEvents: false,
    canManageStudentsAndAdmissions: false,
    canManageFeesAndAccounts: false,
    canApproveGatePassAndDiary: false,
    allowedModules: [...ALL_PORTAL_MODULE_IDS],
    lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন)',
    lastUpdatedAtBn: 'সকল মডিউল ভিউ অ্যাক্সেস সক্রিয়',
  },
  {
    directorId: 'dir-5',
    nameBn: 'এম এস আই অনিক',
    nameEn: 'MSI Anik',
    roleTitleBn: 'সম্মানিত পরিচালক (Director)',
    photoUrl: '/assets/fb/msi_anik.webp',
    email: 'msianik.bd@gmail.com',
    phone: '01914057511',
    username: 'anik',
    isSuperAdmin: false,
    viewAllModules: true,
    canEditSchoolAndBoard: false,
    canManageNoticesAndEvents: false,
    canManageStudentsAndAdmissions: false,
    canManageFeesAndAccounts: false,
    canApproveGatePassAndDiary: false,
    allowedModules: [...ALL_PORTAL_MODULE_IDS],
    lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন)',
    lastUpdatedAtBn: 'সকল মডিউল ভিউ অ্যাক্সেস সক্রিয়',
  },
  {
    directorId: 'dir-1',
    nameBn: 'আলী আদনান',
    nameEn: 'Ali Adnan',
    roleTitleBn: 'প্রতিষ্ঠাতা ও পরিচালক (Founder & Director)',
    photoUrl: '/assets/fb/ali_adnan.jpg',
    email: 'ali.adnan@anandapathshala.edu.bd',
    phone: '01711223344',
    username: 'adnan',
    isSuperAdmin: false,
    viewAllModules: true,
    canEditSchoolAndBoard: false,
    canManageNoticesAndEvents: false,
    canManageStudentsAndAdmissions: false,
    canManageFeesAndAccounts: false,
    canApproveGatePassAndDiary: false,
    allowedModules: [...ALL_PORTAL_MODULE_IDS],
    lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন)',
    lastUpdatedAtBn: 'সকল মডিউল ভিউ অ্যাক্সেস সক্রিয়',
  },
  {
    directorId: 'dir-2',
    nameBn: 'সাম্মী আক্তার',
    nameEn: 'Summy Akter',
    roleTitleBn: 'সম্মানিত পরিচালক (Director)',
    photoUrl: '/assets/fb/summy_akter.jpg',
    email: 'summy.akter@anandapathshala.edu.bd',
    phone: '01822334556',
    username: 'summy',
    isSuperAdmin: false,
    viewAllModules: true,
    canEditSchoolAndBoard: false,
    canManageNoticesAndEvents: false,
    canManageStudentsAndAdmissions: false,
    canManageFeesAndAccounts: false,
    canApproveGatePassAndDiary: false,
    allowedModules: [...ALL_PORTAL_MODULE_IDS],
    lastUpdatedByBn: 'মোস্তফা আল মামুন (সুপার অ্যাডমিন)',
    lastUpdatedAtBn: 'সকল মডিউল ভিউ অ্যাক্সেস সক্রিয়',
  },
];

export const DIRECTOR_PERMISSIONS_STORAGE_KEY = 'ananda_director_access_permissions_v1';

export function getDirectorPermissions(): DirectorAccessPermission[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(DIRECTOR_PERMISSIONS_STORAGE_KEY);
      if (raw) {
        const parsed: DirectorAccessPermission[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }
  return INITIAL_DIRECTOR_PERMISSIONS;
}

export function saveDirectorPermissions(perms: DirectorAccessPermission[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DIRECTOR_PERMISSIONS_STORAGE_KEY, JSON.stringify(perms));
      window.dispatchEvent(
        new CustomEvent('ananda-director-permissions-updated', {
          detail: { permissions: perms },
        })
      );
    } catch {}
  }
}

export function getPermissionForDirector(directorId?: string): DirectorAccessPermission | null {
  const perms = getDirectorPermissions();
  if (!directorId) return perms.find((p) => !p.isSuperAdmin) || perms[0] || null;
  return perms.find((p) => p.directorId === directorId) || null;
}

export const PORTAL_ACCOUNTS_STORAGE_KEY = 'ananda_portal_accounts_v2';

export function getPortalRoleLabelBn(role: PortalAccountRole = 'parent'): string {
  switch (role) {
    case 'super_admin':
      return 'সুপার অ্যাডমিন (Super Admin)';
    case 'director':
      return 'পরিচালক (Director)';
    case 'principal':
      return 'প্রিন্সিপাল (Principal)';
    case 'teacher':
      return 'শিক্ষক (Teacher)';
    case 'gate_security':
      return 'সহায়ক স্টাফ / সিকিউরিটি (Support Staff)';
    case 'parent':
    default:
      return 'অভিভাবক / শিক্ষার্থী (Parent/Student)';
  }
}

export function getPortalNameForRoleBn(role: PortalAccountRole = 'parent'): string {
  switch (role) {
    case 'super_admin':
      return 'সুপার অ্যাডমিন ও কেন্দ্রীয় অ্যাক্সেস নিয়ন্ত্রণ পোর্টাল';
    case 'director':
      return 'পরিচালনা পর্ষদ ভিউ ও পর্যবেক্ষণ পোর্টাল';
    case 'principal':
      return 'প্রিন্সিপাল ও একাডেমিক অ্যাডমিন পোর্টাল';
    case 'teacher':
      return 'শিক্ষক ক্লাসরুম ও একাডেমিক পোর্টাল';
    case 'gate_security':
      return 'স্মার্ট গেট-পাস ও সহায়ক স্টাফ পোর্টাল';
    case 'parent':
    default:
      return 'অভিভাবক ও সন্তান ড্যাশবোর্ড পোর্টাল';
  }
}

/**
 * Normalizes Bengali digits to western digits and strips formatting characters for phone/ID lookup
 */
export function normalizeIdentifier(input: string): string {
  const bnToEnMap: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return (input || '')
    .trim()
    .toLowerCase()
    .replace(/[০-৯]/g, (d) => bnToEnMap[d] || d)
    .replace(/[\s\-]/g, '');
}

/**
 * Returns the live list of all PortalAccounts across Directors, Principal, Teachers, Support Staff, and Students/Parents.
 */
export function getAllPortalAccounts(): PortalAccount[] {
  const accountMap = new Map<string, PortalAccount>();

  // 1. Seed from default PORTAL_ACCOUNTS
  for (const acc of PORTAL_ACCOUNTS) {
    accountMap.set(acc.id, { ...acc });
  }

  // 2. Load Directors from localStorage or MANAGEMENT_COMMITTEE
  let directors: CommitteeDirector[] = MANAGEMENT_COMMITTEE;
  if (typeof window !== 'undefined') {
    try {
      const rawDirs = localStorage.getItem('ananda_management_directors_v9');
      if (rawDirs) {
        const parsed = JSON.parse(rawDirs);
        if (Array.isArray(parsed) && parsed.length > 0) directors = parsed;
      }
    } catch {}
  }

  for (const dir of directors) {
    const role: PortalAccountRole =
      dir.portalRole ||
      (dir.id === 'dir-3' || dir.username === 'superadmin' ? 'super_admin' : 'director');
    const cleanPhone = normalizeIdentifier(dir.phone || '01914057511');
    const username =
      dir.username?.trim() ||
      (dir.id === 'dir-3'
        ? 'superadmin'
        : dir.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || `dir_${dir.id}`);

    // Find if there's an existing seeded account for this directorId
    const existingEntry = Array.from(accountMap.values()).find((a) => a.directorId === dir.id);
    const accId = existingEntry?.id || `acc-dir-${dir.id}`;

    accountMap.set(accId, {
      id: accId,
      nameBn: dir.nameBn,
      nameEn: dir.nameEn,
      role,
      roleTitleBn:
        role === 'super_admin'
          ? `সুপার অ্যাডমিন · ${dir.roleBn}`
          : `${dir.roleBn}, পরিচালনা পর্ষদ`,
      portalNameBn: getPortalNameForRoleBn(role),
      email: dir.email || `${username}@anandapathshala.edu.bd`,
      phone: cleanPhone,
      username,
      passwordHint: dir.password || existingEntry?.passwordHint || '123456',
      avatarUrl: dir.photoUrl || existingEntry?.avatarUrl || '/assets/fb/logo.jpg',
      directorId: dir.id,
    });
  }

  // 3. Load Teachers & Support Staff from localStorage or SCHOOL_TEACHERS
  let teachers: TeacherMember[] = SCHOOL_TEACHERS;
  if (typeof window !== 'undefined') {
    try {
      const rawTch = localStorage.getItem('ananda_teachers_list_v1');
      if (rawTch) {
        const parsed = JSON.parse(rawTch);
        if (Array.isArray(parsed) && parsed.length > 0) teachers = parsed;
      }
    } catch {}
  }

  for (const tch of teachers) {
    // Skip Mostofa Al Mamun if already registered as Super Admin
    if (tch.username === 'superadmin' || tch.portalRole === 'super_admin') continue;

    const role: PortalAccountRole =
      tch.portalRole ||
      (tch.designationBn.includes('প্রিন্সিপাল')
        ? 'principal'
        : tch.staffCategory === 'support_staff' || tch.designationBn.includes('সিকিউরিটি') || tch.designationBn.includes('স্টাফ')
        ? 'gate_security'
        : 'teacher');

    const username =
      tch.username?.trim() ||
      (role === 'principal'
        ? 'principal'
        : tch.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || `tch_${tch.id}`);
    const cleanPhone = normalizeIdentifier(tch.phone || '01914057511');

    const existingEntry =
      role === 'principal' && username === 'principal'
        ? accountMap.get('acc-principal')
        : username === 'teacher'
        ? accountMap.get('acc-teacher')
        : username === 'gate'
        ? accountMap.get('acc-gate')
        : Array.from(accountMap.values()).find((a) => a.id === `acc-tch-${tch.id}` || a.username === username);

    const accId = existingEntry?.id || `acc-tch-${tch.id}`;
    accountMap.set(accId, {
      id: accId,
      nameBn: tch.nameBn,
      nameEn: tch.nameEn,
      role,
      roleTitleBn: `${tch.designationBn} (${tch.departmentBn})`,
      portalNameBn: getPortalNameForRoleBn(role),
      email: tch.email || existingEntry?.email || `${username}@anandapathshala.edu.bd`,
      phone: cleanPhone || existingEntry?.phone || '01914057511',
      username,
      passwordHint: tch.password || existingEntry?.passwordHint || '123456',
      avatarUrl: tch.photoUrl || existingEntry?.avatarUrl || '/assets/fb/logo.jpg',
      assignedClass: tch.assignedClass || existingEntry?.assignedClass || 'Nursery',
    });
  }

  // 4. Load Students / Parents from localStorage or INITIAL_STUDENTS
  let students: Student[] = INITIAL_STUDENTS;
  if (typeof window !== 'undefined') {
    try {
      const rawStd = localStorage.getItem('ananda_students_v1');
      if (rawStd) {
        const parsed = JSON.parse(rawStd);
        if (Array.isArray(parsed) && parsed.length > 0) students = parsed;
      }
    } catch {}
  }

  for (const std of students) {
    const role: PortalAccountRole = std.portalRole || 'parent';
    const normRoll = normalizeIdentifier(std.rollNo || '01');
    const username =
      std.username?.trim() ||
      (std.id === 'std-1' ? 'parent' : `std${normRoll || std.id.replace('std-', '')}`);
    const cleanPhone = normalizeIdentifier(std.emergencyPhone || '01711223399');
    const guardianNameBn = std.authorizedPickups?.[0]?.nameBn || std.fatherNameBn || std.nameBn;

    const existingEntry =
      std.id === 'std-1'
        ? accountMap.get('acc-parent')
        : Array.from(accountMap.values()).find((a) => a.studentId === std.id);

    const accId = existingEntry?.id || `acc-std-${std.id}`;
    accountMap.set(accId, {
      id: accId,
      nameBn: `${guardianNameBn} (${std.nameBn})`,
      nameEn: std.nameEn,
      role,
      roleTitleBn: `${getPortalRoleLabelBn(role)} — শিক্ষার্থী: ${std.nameBn} (${std.className}, রোল: ${std.rollNo})`,
      portalNameBn: getPortalNameForRoleBn(role),
      email: std.email || existingEntry?.email || `${username}@anandapathshala.edu.bd`,
      phone: cleanPhone,
      username,
      passwordHint: std.password || existingEntry?.passwordHint || '123456',
      avatarUrl: std.photoUrl || existingEntry?.avatarUrl || '/assets/biddalay/student_hasin.jpg',
      studentId: std.id,
      assignedClass: std.className,
    });
  }

  // 5. Merge any explicit custom portal accounts saved in localStorage
  if (typeof window !== 'undefined') {
    try {
      const rawCustom = localStorage.getItem(PORTAL_ACCOUNTS_STORAGE_KEY);
      if (rawCustom) {
        const customList: PortalAccount[] = JSON.parse(rawCustom);
        if (Array.isArray(customList)) {
          for (const customAcc of customList) {
            accountMap.set(customAcc.id, customAcc);
          }
        }
      }
    } catch {}
  }

  return Array.from(accountMap.values());
}

export function upsertPortalAccount(account: PortalAccount): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(PORTAL_ACCOUNTS_STORAGE_KEY);
    const list: PortalAccount[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(
      (a) =>
        a.id !== account.id &&
        !(account.studentId && a.studentId === account.studentId) &&
        !(account.directorId && a.directorId === account.directorId)
    );
    const updated = [...filtered, account];
    localStorage.setItem(PORTAL_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ananda-portal-accounts-updated', { detail: { accounts: updated } }));
  } catch {}
}

export function removePortalAccountByEntityId(entityId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(PORTAL_ACCOUNTS_STORAGE_KEY);
    if (!raw) return;
    const list: PortalAccount[] = JSON.parse(raw);
    const updated = list.filter(
      (a) =>
        a.id !== entityId &&
        a.studentId !== entityId &&
        a.directorId !== entityId &&
        a.id !== `acc-std-${entityId}` &&
        a.id !== `acc-dir-${entityId}` &&
        a.id !== `acc-tch-${entityId}`
    );
    localStorage.setItem(PORTAL_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ananda-portal-accounts-updated', { detail: { accounts: updated } }));
  } catch {}
}

/**
 * Finds a registered PortalAccount by matching its registered email address or mobile number.
 * Supports both English and Bengali digits for mobile numbers.
 */
export function findAccountByEmailOrPhone(emailOrPhoneInput: string): PortalAccount | null {
  const cleaned = normalizeIdentifier(emailOrPhoneInput);
  if (!cleaned) return null;

  const allAccounts = getAllPortalAccounts();

  // 1. Exact match on registered email or mobile number
  for (const acc of allAccounts) {
    const accEmail = acc.email.trim().toLowerCase();
    const accPhone = normalizeIdentifier(acc.phone);
    const strippedCleanedPhone = cleaned.replace(/^(\+?88)/, '');

    if (
      cleaned === accEmail ||
      (accPhone &&
        (cleaned === accPhone ||
          strippedCleanedPhone === accPhone ||
          cleaned === `88${accPhone}` ||
          cleaned === `+88${accPhone}`))
    ) {
      return acc;
    }
  }

  // 2. Also allow matching if user entered the exact username or email prefix
  for (const acc of allAccounts) {
    const accUser = normalizeIdentifier(acc.username);
    const emailPrefix = acc.email.split('@')[0]?.trim().toLowerCase();
    if (cleaned === accUser || (emailPrefix && cleaned === emailPrefix)) {
      return acc;
    }
  }

  return null;
}

/**
 * Resets a PortalAccount's password (and optionally username) and persists the update
 * across custom portal accounts as well as linked Director, Teacher, or Student records in localStorage.
 */
export function resetPortalAccountCredentials(
  accountId: string,
  newPassword: string,
  newUsername?: string
): PortalAccount | null {
  const allAccounts = getAllPortalAccounts();
  const target = allAccounts.find((a) => a.id === accountId);
  if (!target) return null;

  const cleanPassword = newPassword.trim();
  const cleanUsername = newUsername?.trim() || target.username;

  const updatedAccount: PortalAccount = {
    ...target,
    username: cleanUsername,
    passwordHint: cleanPassword,
  };

  // Persist in portal accounts override list
  upsertPortalAccount(updatedAccount);

  if (typeof window !== 'undefined') {
    // 1. Sync with Directors storage if applicable
    try {
      const rawDir = localStorage.getItem('ananda_management_directors_v9');
      if (rawDir) {
        const directors: CommitteeDirector[] = JSON.parse(rawDir);
        if (Array.isArray(directors)) {
          let changed = false;
          const nextDirectors = directors.map((d) => {
            if (
              d.id === target.directorId ||
              `acc-dir-${d.id}` === target.id ||
              normalizeIdentifier(d.phone || '') === normalizeIdentifier(target.phone)
            ) {
              changed = true;
              return { ...d, password: cleanPassword, username: cleanUsername };
            }
            return d;
          });
          if (changed) {
            localStorage.setItem('ananda_management_directors_v9', JSON.stringify(nextDirectors));
            window.dispatchEvent(new CustomEvent('ananda-directors-updated'));
          }
        }
      }
    } catch {}

    // 2. Sync with Teachers / Support Staff storage if applicable
    try {
      const rawTch = localStorage.getItem('ananda_teachers_list_v1');
      if (rawTch) {
        const teachers: TeacherMember[] = JSON.parse(rawTch);
        if (Array.isArray(teachers)) {
          let changed = false;
          const nextTeachers = teachers.map((t) => {
            if (
              `acc-tch-${t.id}` === target.id ||
              t.username === target.username ||
              normalizeIdentifier(t.phone || '') === normalizeIdentifier(target.phone)
            ) {
              changed = true;
              return { ...t, password: cleanPassword, username: cleanUsername };
            }
            return t;
          });
          if (changed) {
            localStorage.setItem('ananda_teachers_list_v1', JSON.stringify(nextTeachers));
            window.dispatchEvent(new CustomEvent('ananda-teachers-updated'));
          }
        }
      }
    } catch {}

    // 3. Sync with Students storage if applicable
    try {
      const rawStd = localStorage.getItem('ananda_students_v1');
      if (rawStd) {
        const students: Student[] = JSON.parse(rawStd);
        if (Array.isArray(students)) {
          let changed = false;
          const nextStudents = students.map((s) => {
            if (
              s.id === target.studentId ||
              `acc-std-${s.id}` === target.id ||
              s.username === target.username
            ) {
              changed = true;
              return { ...s, password: cleanPassword, username: cleanUsername };
            }
            return s;
          });
          if (changed) {
            localStorage.setItem('ananda_students_v1', JSON.stringify(nextStudents));
          }
        }
      }
    } catch {}
  }

  return updatedAccount;
}

/**
 * Automatically detects the user's role (Super Admin, Director, Principal, Teacher, Parent, Gate Security)
 * from their login identifier (email, phone number, or username).
 */
export function detectAccountFromIdentifier(identifier: string): PortalAccount | null {
  const cleaned = normalizeIdentifier(identifier);
  if (!cleaned) return null;

  const allAccounts = getAllPortalAccounts();

  // Exact match on username, email, or phone across all dynamic & default accounts
  for (const acc of allAccounts) {
    const accPhone = normalizeIdentifier(acc.phone);
    const accUser = normalizeIdentifier(acc.username);
    const accEmail = acc.email.trim().toLowerCase();
    if (
      cleaned === accUser ||
      cleaned === accEmail ||
      (accPhone &&
        (cleaned === accPhone ||
          cleaned === `88${accPhone}` ||
          cleaned === `+88${accPhone}`))
    ) {
      return acc;
    }
  }

  // Name or partial username match on dynamically created accounts
  for (const acc of allAccounts) {
    if (
      acc.nameBn.toLowerCase().includes(cleaned) ||
      acc.nameEn.toLowerCase().includes(cleaned)
    ) {
      return acc;
    }
  }

  // Super Admin (Mostofa Al Mamun - Secretary)
  if (
    cleaned.includes('superadmin') ||
    cleaned.includes('super_admin') ||
    cleaned.includes('mamun') ||
    cleaned.includes('mostofa') ||
    cleaned.includes('secretary') ||
    cleaned.includes('মামুন') ||
    cleaned.includes('মোস্তফা') ||
    cleaned.includes('সেক্রেটারি') ||
    cleaned.includes('সদস্যসচিব') ||
    cleaned.includes('সুপারঅ্যাডমিন')
  ) {
    return PORTAL_ACCOUNTS[0];
  }

  // Directors
  if (
    cleaned.includes('noman') ||
    cleaned.includes('chairman') ||
    cleaned.includes('নোমান') ||
    cleaned.includes('চেয়ারম্যান') ||
    cleaned.includes('সভাপতি')
  ) {
    return PORTAL_ACCOUNTS[1];
  }
  if (
    cleaned.includes('anik') ||
    cleaned.includes('msianik') ||
    cleaned.includes('অনিক') ||
    cleaned === 'md'
  ) {
    return PORTAL_ACCOUNTS[2];
  }
  if (
    cleaned.includes('adnan') ||
    cleaned.includes('আদনান')
  ) {
    return PORTAL_ACCOUNTS[3];
  }
  if (
    cleaned.includes('summy') ||
    cleaned.includes('সাম্মী') ||
    cleaned.includes('শাম্মী')
  ) {
    return PORTAL_ACCOUNTS[4];
  }
  if (cleaned === 'director' || cleaned.includes('পরিচালক')) {
    return PORTAL_ACCOUNTS[1];
  }

  // Principal
  if (
    cleaned.includes('principal') ||
    cleaned.includes('admin') ||
    cleaned.includes('shafee') ||
    cleaned.includes('shafi') ||
    cleaned.includes('প্রিন্সিপাল') ||
    cleaned.includes('শাফী') ||
    cleaned.includes('শাফি')
  ) {
    return PORTAL_ACCOUNTS.find((a) => a.role === 'principal') || null;
  }

  // Teacher
  if (
    cleaned.includes('teacher') ||
    cleaned.includes('fatema') ||
    cleaned.includes('ফাতেমা') ||
    cleaned.includes('mahmuda') ||
    cleaned.includes('ria') ||
    cleaned.includes('mukta') ||
    cleaned.includes('oaisy') ||
    cleaned.includes('oishi') ||
    cleaned.includes('meem') ||
    cleaned.includes('arafat') ||
    cleaned.includes('fhamid') ||
    cleaned.includes('rokeya') ||
    cleaned.includes('sanjida') ||
    cleaned.includes('শিক্ষক')
  ) {
    return PORTAL_ACCOUNTS.find((a) => a.role === 'teacher') || null;
  }

  // Parent
  if (
    cleaned.includes('parent') ||
    cleaned.includes('subrata') ||
    cleaned.includes('guardian') ||
    cleaned.includes('অভিভাবক') ||
    cleaned.includes('101')
  ) {
    return PORTAL_ACCOUNTS.find((a) => a.role === 'parent') || null;
  }

  // Gate Security
  if (
    cleaned.includes('gate') ||
    cleaned.includes('security') ||
    cleaned.includes('গেট')
  ) {
    return PORTAL_ACCOUNTS.find((a) => a.role === 'gate_security') || null;
  }

  return null;
}

/**
 * Detects account from any combination of Email, Mobile Number, and/or User ID fields
 */
export function detectAccountFromMultiFields(
  emailInput: string,
  phoneInput: string,
  userIdInput: string
): PortalAccount | null {
  return (
    detectAccountFromIdentifier(userIdInput) ||
    detectAccountFromIdentifier(emailInput) ||
    detectAccountFromIdentifier(phoneInput)
  );
}

/**
 * Authenticates credentials and automatically resolves the user's role and portal account
 */
export function authenticateAndDetectRole(
  identifier: string,
  password = ''
): {
  success: boolean;
  account?: PortalAccount;
  errorBn?: string;
} {
  const account = detectAccountFromIdentifier(identifier);
  if (!account) {
    return {
      success: false,
      errorBn:
        'প্রদত্ত ইমেইল, মোবাইল নম্বর বা ইউজার আইডি কোনো নিবন্ধিত অ্যাকাউন্টের সাথে মেলেনি।',
    };
  }
  if (password.trim().length > 0 && password.trim().length < 3) {
    return {
      success: false,
      errorBn: 'অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন (ডেমো পাসওয়ার্ড: 123456)।',
    };
  }
  return {
    success: true,
    account,
  };
}

/**
 * Converts English digits to Bengali numerals
 */
export function toBengaliNumber(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

/**
 * Validates whether a person is authorized to pick up the child
 */
export function validatePickupPerson(
  student: Student,
  pickupPersonId: string
): { isValid: boolean; person?: PickupPerson; reason?: string } {
  const person = student.authorizedPickups.find((p) => p.id === pickupPersonId);
  if (!person) {
    return {
      isValid: false,
      reason: 'ব্যক্তিটি অনুমোদিত পিক-আপ তালিকায় নিবন্ধিত নেই (Not in whitelist).',
    };
  }
  if (!person.approved) {
    return {
      isValid: false,
      person,
      reason: 'এই অভিভাবকের অনুমোদন পেন্ডিং রয়েছে (Authorization pending).',
    };
  }
  return {
    isValid: true,
    person,
  };
}

/**
 * Generates BTRC/Greenweb-compliant SMS notification content for child pickup
 */
export function generateBtrcSmsMessage(
  studentNameBn: string,
  personNameBn: string,
  relationBn: string,
  timeStr: string
): string {
  return `[আনন্দ পাঠশালা] সম্মানিত অভিভাবক, আপনার সন্তান ${studentNameBn}-কে আজ ${timeStr} মিনিটে ${relationBn} (${personNameBn}) নিরাপদভাবে স্কুল গেট থেকে গ্রহণ করেছেন। হেল্পলাইন: ০৯৬১১-২২৩৩৪৪`;
}

/**
 * Computes average rating and holistic achievement badge
 */
export function calculateHolisticGrade(skills: SkillCriterion[]): {
  averageScore: number;
  badgeBn: string;
  badgeEn: string;
  summaryFeedbackBn: string;
} {
  if (!skills || skills.length === 0) {
    return {
      averageScore: 0,
      badgeBn: 'মূল্যায়ন প্রক্রিয়াধীন',
      badgeEn: 'In Progress',
      summaryFeedbackBn: 'শিশুটির নিয়মিত পর্যবেক্ষণ চলছে।',
    };
  }

  const sum = skills.reduce((acc, curr) => acc + curr.score, 0);
  const avg = Number((sum / skills.length).toFixed(1));

  if (avg >= 4.5) {
    return {
      averageScore: avg,
      badgeBn: '🌟 নক্ষত্র প্রতিভা (Star Explorer)',
      badgeEn: 'Star Explorer',
      summaryFeedbackBn: 'অসাধারণ সামাজিক মেলামেশা, সৃজনশীল কল্পনা এবং ছড়া ও বর্ণে উজ্জ্বল অগ্রগতি।',
    };
  } else if (avg >= 3.8) {
    return {
      averageScore: avg,
      badgeBn: '🌱 উচ্ছল বিকাশ (Blooming Joyfully)',
      badgeEn: 'Blooming Joyfully',
      summaryFeedbackBn: 'খুব সুন্দর দলীয় কাজে অংশগ্রহণ ও একাগ্রতা। সূক্ষ্ম মোটর স্কিল দিন দিন চমৎকার হচ্ছে।',
    };
  } else if (avg >= 3.0) {
    return {
      averageScore: avg,
      badgeBn: '🎨 সৃজনশীল শিক্ষানবিস (Creative Learner)',
      badgeEn: 'Creative Learner',
      summaryFeedbackBn: 'ভালো প্রচেষ্টা ও আগ্রহ প্রকাশ করছে। ধৈর্য ও নিয়মিত অনুশীলনে আরও উন্নতি সম্ভব।',
    };
  } else {
    return {
      averageScore: avg,
      badgeBn: '🐣 আদুরে কদম (Gentle Steps)',
      badgeEn: 'Gentle Steps',
      summaryFeedbackBn: 'মমতাময় পরিবেশ ও খেলার মাধ্যমে আত্মবিশ্বাস তৈরির বিশেষ পরিচর্যা দেওয়া হচ্ছে।',
    };
  }
}

/**
 * Computes school fee summary metrics
 */
export function calculateFeeSummary(invoices: FeeInvoice[]): {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
} {
  let totalBilled = 0;
  let totalCollected = 0;

  for (const inv of invoices) {
    totalBilled += inv.netAmount;
    if (inv.status === 'paid') {
      totalCollected += inv.netAmount;
    }
  }

  const totalOutstanding = totalBilled - totalCollected;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  return {
    totalBilled,
    totalCollected,
    totalOutstanding,
    collectionRate,
  };
}

/**
 * Computes attendance summary statistics
 */
export function calculateAttendanceStats(records: AttendanceRecord[]): {
  total: number;
  present: number;
  absent: number;
  late: number;
  presentRate: number;
} {
  const total = records.length;
  if (total === 0) {
    return { total: 0, present: 0, absent: 0, late: 0, presentRate: 0 };
  }

  let present = 0;
  let absent = 0;
  let late = 0;

  for (const r of records) {
    if (r.status === 'present') present++;
    else if (r.status === 'absent') absent++;
    else if (r.status === 'late') late++;
  }

  const presentRate = Math.round(((present + late) / total) * 100);

  return {
    total,
    present,
    absent,
    late,
    presentRate,
  };
}

/**
 * Builds a structured FCM notification payload for a newly submitted admission application
 */
export function createAdmissionFcmPayload(
  app: AdmissionApplication,
  timeLabel = 'এইমাত্র'
): FcmNotification {
  return {
    id: `fcm-adm-${app.id}`,
    type: 'admission_application',
    priority: 'high',
    titleBn: `🎓 নতুন ভর্তি আবেদন: ${app.applicantNameBn} (${app.applyingClass})`,
    bodyBn: `অভিভাবক ${app.guardianNameBn} (${app.guardianPhone}) এইমাত্র ${app.applyingClass} শ্রেণিতে অনলাইন ভর্তির আবেদন জমা দিয়েছেন। ঠিকানা: ${app.addressBn}`,
    targetRole: 'all_staff',
    studentOrApplicantNameBn: app.applicantNameBn,
    className: app.applyingClass,
    guardianNameBn: app.guardianNameBn,
    guardianPhone: app.guardianPhone,
    timestamp: timeLabel,
    read: false,
    actionTab: 'overview',
    fcmMessageId: `projects/gen-lang-client-0036381817/messages/adm_${app.id}`,
  };
}

/**
 * Builds a structured FCM notification payload for an urgent child pickup request at the gate
 */
export function createUrgentPickupFcmPayload(
  student: Student,
  guardianNameBn: string,
  relationBn: string,
  noteBn?: string,
  timeLabel = 'এইমাত্র'
): FcmNotification {
  const cleanNote = noteBn?.trim()
    ? ` নির্দেশনা: "${noteBn.trim()}"`
    : ' অনুগ্রহ করে শিশুকে ব্যাগসহ দ্রুত গেটে পাঠানোর প্রস্তুতি নিন।';
  const uniqueSuffix = `${student.id}_${Date.now()}`;
  return {
    id: `fcm-urgent-${uniqueSuffix}`,
    type: 'urgent_pickup',
    priority: 'urgent',
    titleBn: `🚨 জরুরি পিক-আপ রিকোয়েস্ট: ${student.nameBn} (${student.className})`,
    bodyBn: `${student.nameBn} (রোল: ${student.rollNo})-কে নিতে ${relationBn} (${guardianNameBn}) স্কুলের মেইন গেটে অপেক্ষা করছেন।${cleanNote}`,
    targetRole: 'teacher',
    studentOrApplicantNameBn: student.nameBn,
    className: student.className,
    guardianNameBn: `${guardianNameBn} (${relationBn})`,
    guardianPhone: student.emergencyPhone,
    timestamp: timeLabel,
    read: false,
    actionTab: 'pickup',
    fcmMessageId: `projects/gen-lang-client-0036381817/messages/pk_${uniqueSuffix}`,
  };
}

/**
 * Builds a structured FCM push notification payload for a Homework/Task created by a teacher
 * to notify all parents of students in that specific class.
 */
export function createHomeworkTaskFcmPayload(
  post: ActivityPost,
  timeLabel = 'এইমাত্র'
): FcmNotification {
  const classNameBn = getSchoolClassNameBn(post.className);
  const subjectStr = post.homeworkTask?.subjectBn ? `[${post.homeworkTask.subjectBn}] ` : '';
  const dueStr = post.homeworkTask?.dueDateBn ? ` জমা দেওয়ার শেষ সময়: ${post.homeworkTask.dueDateBn}।` : '';
  const estStr = post.homeworkTask?.estimatedMinutes ? ` আনুমানিক সময়: ${toBengaliNumber(post.homeworkTask.estimatedMinutes)} মিনিট।` : '';
  const uniqueSuffix = `hw_${post.id}_${Date.now()}`;

  return {
    id: `fcm-hw-${uniqueSuffix}`,
    type: 'homework_task_assigned',
    priority: 'high',
    titleBn: `📚 নতুন বাড়ির কাজ / হোমওয়ার্ক (${classNameBn}): ${subjectStr}${post.titleBn}`,
    bodyBn: `${post.teacherNameBn} আপনার সন্তানের ${classNameBn} শ্রেণিতে নতুন বাড়ির কাজ দিয়েছেন: "${post.descriptionBn}".${dueStr}${estStr}`,
    targetRole: 'parent',
    studentOrApplicantNameBn: `${classNameBn} শ্রেণির সকল শিক্ষার্থী`,
    className: post.className,
    guardianNameBn: `${classNameBn} শ্রেণির অভিভাবকবৃন্দ`,
    timestamp: timeLabel,
    read: false,
    actionTab: 'diary',
    fcmMessageId: `projects/gen-lang-client-0036381817/messages/${uniqueSuffix}`,
  };
}

/**
 * Builds a structured FCM push notification payload when an asset's stock drops below its low stock threshold
 */
export function createLowStockFcmPayload(
  asset: SchoolAssetItem,
  timeLabel = 'এইমাত্র'
): FcmNotification {
  const threshold = asset.lowStockThreshold ?? 2;
  const isOutOfStock = asset.availableQuantity <= 0;
  const uniqueSuffix = `lowstock_${asset.id}_${Date.now()}`;

  return {
    id: `fcm-asset-${asset.id}`,
    type: 'inventory_low_stock',
    priority: isOutOfStock ? 'urgent' : 'high',
    titleBn: isOutOfStock
      ? `🚨 স্টক শূন্য সতর্কতা: ${asset.nameBn} (${asset.assetCode})`
      : `⚠️ লো-স্টক সতর্কবার্তা: ${asset.nameBn} (${asset.assetCode})`,
    bodyBn: `উপকরণ "${asset.nameBn}" এর বর্তমান মজুত কমে ${toBengaliNumber(asset.availableQuantity)} ${asset.unitBn}-এ নেমেছে (নির্ধারিত ন্যূনতম সীমা: ${toBengaliNumber(threshold)} ${asset.unitBn})। অবস্থান: ${asset.locationRoomBn}। অনুগ্রহ করে নতুন স্টক রিকুইজিশন নিশ্চিত করুন।`,
    targetRole: 'principal',
    studentOrApplicantNameBn: asset.nameBn,
    className: 'HateKhori',
    guardianNameBn: asset.assignedTeacherNameBn || 'লজিস্টিক ও অ্যাসেট ইনচার্জ',
    guardianPhone: asset.assetCode,
    timestamp: timeLabel,
    read: false,
    actionTab: 'inventory',
    fcmMessageId: `projects/gen-lang-client-0036381817/messages/${uniqueSuffix}`,
    assetId: asset.id,
    assetCode: asset.assetCode,
    lowStockThreshold: threshold,
    availableQuantity: asset.availableQuantity,
  };
}

/**
 * Idempotently merges an incoming FCM notification into existing state without duplicates
 */
export function mergeNotificationsIdempotent(
  existing: FcmNotification[],
  incoming: FcmNotification
): FcmNotification[] {
  const existingIdx = existing.findIndex((n) => n.id === incoming.id);
  if (existingIdx !== -1) {
    const copy = [...existing];
    copy[existingIdx] = { ...copy[existingIdx], ...incoming };
    return copy;
  }
  return [incoming, ...existing];
}

export interface RoleNavItemMeta {
  id: string;
  labelBn: string;
  shortLabelBn: string;
  descriptionBn: string;
}

/**
 * Returns role-specific portal navigation items with both full labels (for side drawer & desktop)
 * and ultra-compact single-line labels (for zero-scroll mobile single-line bar).
 */
export function getRoleNavMetadata(role: string, directorId?: string): RoleNavItemMeta[] {
  const fullAdminTabs: RoleNavItemMeta[] = [
    {
      id: 'overview',
      labelBn:
        role === 'super_admin'
          ? 'কেন্দ্রীয় হোম'
          : role === 'director'
          ? 'পরিচালক হোম'
          : 'অ্যাডমিন হোম',
      shortLabelBn: 'হোম',
      descriptionBn: 'স্কুল সামারি, ছবি ও পরিচালনা পর্ষদ ড্যাশবোর্ড',
    },
    {
      id: 'students',
      labelBn: 'শিক্ষার্থী',
      shortLabelBn: 'শিক্ষার্থী',
      descriptionBn: 'ক্লাস ভিত্তিক ছাত্র-ছাত্রীর তালিকা ও প্রোফাইল আপডেট',
    },
    {
      id: 'idcards',
      labelBn: 'ডিজিটাল আইডি কার্ড',
      shortLabelBn: 'আইডি কার্ড',
      descriptionBn: 'ডাইনামিক QR ও প্রিন্ট-রেডি স্মার্ট স্টুডেন্ট আইডি কার্ড জেনারেটর',
    },
    {
      id: 'routine',
      labelBn: 'ক্লাস রুটিন',
      shortLabelBn: 'রুটিন',
      descriptionBn: 'ক্লাস ভিত্তিক সময়সূচি ও পিরিয়ড ব্যবস্থাপনা',
    },
    {
      id: 'calendar',
      labelBn: 'একাডেমিক ক্যালেন্ডার',
      shortLabelBn: 'ক্যালেন্ডার',
      descriptionBn: 'স্কুল ইভেন্ট, পরীক্ষা, ছুটি ও নোটিশ দিনপঞ্জি',
    },
    {
      id: 'results',
      labelBn: 'ফলাফল ও মার্কশিট',
      shortLabelBn: 'ফলাফল',
      descriptionBn: 'টার্ম পরীক্ষা, নম্বর এন্ট্রি ও প্রিন্ট-রেডি কালারফুল রিপোর্ট কার্ড',
    },
    {
      id: 'health',
      labelBn: 'স্বাস্থ্য ও অ্যালার্জি',
      shortLabelBn: 'স্বাস্থ্য',
      descriptionBn: 'শিশুর উচ্চতা, ওজন, BMI, রক্তের গ্রুপ, অ্যালার্জি ও টিকাদান ট্র্যাকার',
    },
    {
      id: 'pickup',
      labelBn: 'গেট-পাস',
      shortLabelBn: 'গেট-পাস',
      descriptionBn: 'কিউআর ভেরিফিকেশন ও পিক-আপ লগ',
    },
    {
      id: 'diary',
      labelBn: 'ডায়েরি',
      shortLabelBn: 'ডায়েরি',
      descriptionBn: 'ক্লাসের ছবি, টিফিন ও ডিজিটাল ডায়েরি ফিডব্যাক',
    },
    {
      id: 'messages',
      labelBn: 'চ্যাট',
      shortLabelBn: 'চ্যাট',
      descriptionBn: 'অভিভাবক, শিক্ষক ও স্টাফদের সরাসরি মেসেজিং হাব',
    },
    {
      id: 'skills',
      labelBn: 'স্কিল কার্ড',
      shortLabelBn: 'স্কিল',
      descriptionBn: 'হোলিস্টিক মূল্যায়ন ও প্রগ্রেস রিপোর্ট কার্ড',
    },
    {
      id: 'attendance',
      labelBn: 'হাজিরা',
      shortLabelBn: 'হাজিরা',
      descriptionBn: 'দৈনিক উপস্থিতি ও অনুপস্থিতির SMS',
    },
    {
      id: 'staff',
      labelBn: 'শিক্ষক ও স্টাফ',
      shortLabelBn: 'স্টাফ',
      descriptionBn: 'শিক্ষক ডিরেক্টরি, ডিজিটাল সার্ভিস কার্ড, স্টাফ হাজিরা ও ছুটির অনুমোদন',
    },
    {
      id: 'fees',
      labelBn: 'বেতন/ফি',
      shortLabelBn: 'বেতন/ফি',
      descriptionBn: 'টিউশন ফি, বেতন ইনভয়েস ও পেমেন্ট কালেকশন',
    },
    {
      id: 'workspace',
      labelBn: 'গুগল ড্রাইভ',
      shortLabelBn: 'ড্রাইভ',
      descriptionBn: 'Google Drive, Sheets ও Calendar ওয়ার্কস্পেস',
    },
    {
      id: 'inventory',
      labelBn: 'স্কুল অ্যাসেট',
      shortLabelBn: 'অ্যাসেট',
      descriptionBn: 'স্কুল সামগ্রী, মন্টেসরি উপকরণ ও সরঞ্জাম ইনভেন্টরি ট্র্যাকার',
    },
  ];

  if (role === 'super_admin' || role === 'principal') {
    return fullAdminTabs;
  }

  if (role === 'director') {
    const dirPerm = getPermissionForDirector(directorId);
    if (!dirPerm || dirPerm.viewAllModules) {
      return fullAdminTabs;
    }
    const allowed = dirPerm.allowedModules?.length ? dirPerm.allowedModules : ['overview'];
    return fullAdminTabs.filter((item) => allowed.includes(item.id));
  }

  if (role === 'teacher') {
    return [
      {
        id: 'overview',
        labelBn: 'শিক্ষক হোম',
        shortLabelBn: 'হোম',
        descriptionBn: 'ক্লাসরুম রোস্টার ও FCM অ্যালার্ট ড্যাশবোর্ড',
      },
      {
        id: 'routine',
        labelBn: 'ক্লাস রুটিন',
        shortLabelBn: 'রুটিন',
        descriptionBn: 'আজকের পাঠদান ও সাপ্তাহিক সময়সূচি',
      },
      {
        id: 'calendar',
        labelBn: 'একাডেমিক ক্যালেন্ডার',
        shortLabelBn: 'ক্যালেন্ডার',
        descriptionBn: 'স্কুল ইভেন্ট, পরীক্ষা ও ছুটির তালিকা',
      },
      {
        id: 'results',
        labelBn: 'ফলাফল ও মার্কশিট',
        shortLabelBn: 'ফলাফল',
        descriptionBn: 'ক্লাসের বিষয়ভিত্তিক নম্বর এন্ট্রি ও রিপোর্ট কার্ড',
      },
      {
        id: 'health',
        labelBn: 'স্বাস্থ্য ও অ্যালার্জি',
        shortLabelBn: 'স্বাস্থ্য',
        descriptionBn: 'ক্লাসের শিক্ষার্থীদের স্বাস্থ্য, অ্যালার্জি ও গ্রোথ মনিটরিং',
      },
      {
        id: 'students',
        labelBn: 'শিক্ষার্থী',
        shortLabelBn: 'শিক্ষার্থী',
        descriptionBn: 'ক্লাস ভিত্তিক ছাত্র-ছাত্রীর তালিকা ও আপডেট',
      },
      {
        id: 'idcards',
        labelBn: 'আইডি কার্ড',
        shortLabelBn: 'আইডি কার্ড',
        descriptionBn: 'ক্লাসের শিক্ষার্থীদের ডায়নামিক কিউআর আইডি কার্ড প্রিন্ট',
      },
      {
        id: 'attendance',
        labelBn: 'হাজিরা',
        shortLabelBn: 'হাজিরা',
        descriptionBn: 'ডিজিটাল ক্লাসরুম রোল কল ও অ্যাটেনডেন্স',
      },
      {
        id: 'staff',
        labelBn: 'শিক্ষক ডিরেক্টরি ও ছুটি',
        shortLabelBn: 'স্টাফ/ছুটি',
        descriptionBn: 'ফ্যাকাল্টি ডিরেক্টরি, আইডি কার্ড ও ছুটির আবেদন',
      },
      {
        id: 'diary',
        labelBn: 'ডায়েরি পোস্ট',
        shortLabelBn: 'ডায়েরি',
        descriptionBn: 'ছবি, ক্রাফট ও টিফিন আপডেট পোস্ট',
      },
      {
        id: 'messages',
        labelBn: 'চ্যাট',
        shortLabelBn: 'চ্যাট',
        descriptionBn: 'অভিভাবকদের সাথে সরাসরি ক্লাসরুম মেসেজিং ও পরামর্শ',
      },
      {
        id: 'skills',
        labelBn: 'স্কিল কার্ড',
        shortLabelBn: 'স্কিল',
        descriptionBn: 'শিশুদের আচরণ ও মেধা মূল্যায়ন কার্ড',
      },
      {
        id: 'pickup',
        labelBn: 'গেট-পাস',
        shortLabelBn: 'গেট-পাস',
        descriptionBn: 'জরুরি পিক-আপ কল ও অভিভাবক যাচাই',
      },
      {
        id: 'fees',
        labelBn: 'বেতন/ফি',
        shortLabelBn: 'বেতন/ফি',
        descriptionBn: 'শুধুমাত্র নির্ধারিত ক্লাসের বকেয়া (Due) সংক্রান্ত তথ্য ও বেতন স্লিপ',
      },
      {
        id: 'workspace',
        labelBn: 'গুগল ড্রাইভ',
        shortLabelBn: 'ড্রাইভ',
        descriptionBn: 'ক্লাস ডকুমেন্ট ও ক্যালেন্ডার ড্রাইভ',
      },
    ];
  }

  if (role === 'parent') {
    return [
      {
        id: 'overview',
        labelBn: 'আমার সন্তান',
        shortLabelBn: 'সন্তান',
        descriptionBn: 'সন্তানের লাইভ স্ট্যাটাস ও সারসংক্ষেপ ড্যাশবোর্ড',
      },
      {
        id: 'routine',
        labelBn: 'ক্লাস রুটিন',
        shortLabelBn: 'রুটিন',
        descriptionBn: 'সন্তানের দৈনিক ও সাপ্তাহিক ক্লাস সময়সূচি',
      },
      {
        id: 'calendar',
        labelBn: 'একাডেমিক ক্যালেন্ডার',
        shortLabelBn: 'ক্যালেন্ডার',
        descriptionBn: 'ছুটি, পরীক্ষা ও স্কুলের বিশেষ অনুষ্ঠানের দিনপঞ্জি',
      },
      {
        id: 'results',
        labelBn: 'পরীক্ষার ফলাফল',
        shortLabelBn: 'ফলাফল',
        descriptionBn: 'সন্তানের একাডেমিক মার্কশিট ও কালারফুল প্রগ্রেস রিপোর্ট কার্ড',
      },
      {
        id: 'health',
        labelBn: 'স্বাস্থ্য ও গ্রোথ কার্ড',
        shortLabelBn: 'স্বাস্থ্য',
        descriptionBn: 'সন্তানের স্বাস্থ্য, BMI বৃদ্ধি ও অ্যালার্জি সতর্কতা কার্ড',
      },
      {
        id: 'diary',
        labelBn: 'ক্লাস ডায়েরি',
        shortLabelBn: 'ডায়েরি',
        descriptionBn: 'আজকের ক্লাস ও টিফিন আপডেট',
      },
      {
        id: 'messages',
        labelBn: 'চ্যাট',
        shortLabelBn: 'চ্যাট',
        descriptionBn: 'সন্তানের শ্রেণি শিক্ষক ও অধ্যক্ষের সাথে সরাসরি নিরাপদ বার্তা',
      },
      {
        id: 'skills',
        labelBn: 'প্রগ্রেস কার্ড',
        shortLabelBn: 'প্রগ্রেস',
        descriptionBn: 'হোলিস্টিক স্কিল ও স্বাস্থ্য গ্রোথ রিপোর্ট',
      },
      {
        id: 'pickup',
        labelBn: 'গেট-পাস কার্ড',
        shortLabelBn: 'গেট-পাস',
        descriptionBn: 'অনুমোদিত অভিভাবক ও কিউআর পিক-আপ কার্ড',
      },
      {
        id: 'idcards',
        labelBn: 'আইডি কার্ড',
        shortLabelBn: 'আইডি কার্ড',
        descriptionBn: 'সন্তানের ডিজিটাল আইডি ও কিউআর গেট-পাস কার্ড',
      },
      {
        id: 'fees',
        labelBn: 'বেতন/ফি',
        shortLabelBn: 'বেতন/ফি',
        descriptionBn: 'শুধুমাত্র আপনার শিশুর পেমেন্ট স্ট্যাটাস, বকেয়া ও PDF রসিদ',
      },
    ];
  }

  if (role === 'accountant') {
    return [
      {
        id: 'fees',
        labelBn: 'বেতন ও হিসাব',
        shortLabelBn: 'বেতন/ফি',
        descriptionBn: 'টিউশন ফি কালেকশন, বকেয়া, বেতন শিট ও ফিনান্সিয়াল রিপোর্ট',
      },
      {
        id: 'overview',
        labelBn: 'হিসাব ড্যাশবোর্ড',
        shortLabelBn: 'ড্যাশবোর্ড',
        descriptionBn: 'দৈনিক ফি কালেকশন হার ও ক্যাশফ্লো চার্ট',
      },
      {
        id: 'students',
        labelBn: 'শিক্ষার্থী তথ্য',
        shortLabelBn: 'শিক্ষার্থী',
        descriptionBn: 'শ্রেণি ভিত্তিক শিক্ষার্থীদের রোল ও ফি বিবরণ',
      },
      {
        id: 'inventory',
        labelBn: 'স্কুল অ্যাসেট',
        shortLabelBn: 'অ্যাসেট',
        descriptionBn: 'স্কুল সামগ্রী, মন্টেসরি উপকরণ ও সরঞ্জাম ইনভেন্টরি ট্র্যাকার',
      },
      {
        id: 'messages',
        labelBn: 'স্টাফ চ্যাট',
        shortLabelBn: 'চ্যাট',
        descriptionBn: 'প্রশাসন ও শিক্ষকদের সাথে অফিশিয়াল মেসেজিং হাব',
      },
      {
        id: 'workspace',
        labelBn: 'গুগল ড্রাইভ',
        shortLabelBn: 'ড্রাইভ',
        descriptionBn: 'হিসাব সংক্রান্ত স্প্রেডশিট ও ভাউচার ফাইল ড্রাইভ',
      },
    ];
  }

  if (role === 'gate_security') {
    return [
      {
        id: 'pickup',
        labelBn: 'গেট-পাস ভেরিফিকেশন',
        shortLabelBn: 'গেট-পাস',
        descriptionBn: 'কিউআর স্ক্যান, অনুমোদিত অভিভাবক যাচাই ও ছুটি অনুমোদন',
      },
      {
        id: 'overview',
        labelBn: 'গেট লগ ড্যাশবোর্ড',
        shortLabelBn: 'ড্যাশবোর্ড',
        descriptionBn: 'দৈনিক পিক-আপ পরিসংখ্যান ও সারসংক্ষেপ',
      },
      {
        id: 'messages',
        labelBn: 'সিকিউরিটি চ্যাট',
        shortLabelBn: 'চ্যাট',
        descriptionBn: 'জরুরি পিক-আপ অ্যালার্ট ও শিক্ষক-প্রশাসন চ্যাট',
      },
    ];
  }

  return [
    {
      id: 'pickup',
      labelBn: 'গেট-পাস ভেরিফিকেশন',
      shortLabelBn: 'গেট-পাস',
      descriptionBn: 'কিউআর স্ক্যান ও ছুটি অনুমোদন',
    },
    {
      id: 'overview',
      labelBn: 'ড্যাশবোর্ড',
      shortLabelBn: 'ড্যাশবোর্ড',
      descriptionBn: 'গেট লগ ও সারসংক্ষেপ',
    },
  ];
}

export interface NavPillarItem {
  id: string;
  labelBn: string;
  shortLabelBn: string;
  descriptionBn: string;
}

export interface NavPillar {
  id: string;
  labelBn: string;
  shortLabelBn: string;
  defaultTab: string;
  iconName: string;
  color: string;
  itemIds: string[];
  items: NavPillarItem[];
}

/**
 * Returns world-class 6 core navigation pillars for simplified, non-repetitive navigation.
 */
export function getGroupedNavPillars(role: string, directorId?: string): NavPillar[] {
  const allPillars: NavPillar[] = [
    {
      id: 'pillar_overview',
      labelBn: 'ড্যাশবোর্ড',
      shortLabelBn: 'হোম',
      defaultTab: 'overview',
      iconName: 'UserCheck',
      color: 'text-emerald-600',
      itemIds: ['overview'],
      items: [
        {
          id: 'overview',
          labelBn: role === 'super_admin' ? 'কেন্দ্রীয় হোম ড্যাশবোর্ড' : 'অ্যাডমিন ড্যাশবোর্ড',
          shortLabelBn: 'হোম',
          descriptionBn: 'স্কুল সামগ্রিক সামারি, পালস ও পরিচালনা পর্ষদ',
        },
      ],
    },
    {
      id: 'pillar_students',
      labelBn: 'শিক্ষার্থী',
      shortLabelBn: 'শিক্ষার্থী',
      defaultTab: 'students',
      iconName: 'Users',
      color: 'text-amber-600',
      itemIds: ['students', 'idcards', 'health'],
      items: [
        {
          id: 'students',
          labelBn: 'শিক্ষার্থী তালিকা ও ভর্তি',
          shortLabelBn: 'তালিকা',
          descriptionBn: 'ক্লাস ভিত্তিক ছাত্র-ছাত্রীর পূর্ণাঙ্গ প্রোফাইল ও ভর্তি',
        },
        {
          id: 'idcards',
          labelBn: 'ডিজিটাল আইডি কার্ড',
          shortLabelBn: 'আইডি কার্ড',
          descriptionBn: 'ডাইনামিক কিউআর ও প্রিন্ট-রেডি স্মার্ট স্টুডেন্ট আইডি',
        },
        {
          id: 'health',
          labelBn: 'স্বাস্থ্য ও অ্যালার্জি',
          shortLabelBn: 'স্বাস্থ্য',
          descriptionBn: 'উচ্চতা, ওজন, BMI, রক্তের গ্রুপ ও জরুরি অ্যালার্জি প্রোফাইল',
        },
      ],
    },
    {
      id: 'pillar_academics',
      labelBn: 'একাডেমিক',
      shortLabelBn: 'একাডেমিক',
      defaultTab: 'routine',
      iconName: 'BookOpen',
      color: 'text-indigo-600',
      itemIds: ['routine', 'calendar', 'results', 'skills'],
      items: [
        {
          id: 'routine',
          labelBn: 'ক্লাস রুটিন',
          shortLabelBn: 'রুটিন',
          descriptionBn: 'ক্লাস ভিত্তিক সময়সূচি ও পিরিয়ড ব্যবস্থাপনা',
        },
        {
          id: 'calendar',
          labelBn: 'একাডেমিক ক্যালেন্ডার',
          shortLabelBn: 'ক্যালেন্ডার',
          descriptionBn: 'স্কুল ইভেন্ট, পরীক্ষা, ছুটি ও নোটিশ দিনপঞ্জি',
        },
        {
          id: 'results',
          labelBn: 'ফলাফল ও মার্কশিট',
          shortLabelBn: 'ফলাফল',
          descriptionBn: 'টার্ম পরীক্ষা, নম্বর এন্ট্রি ও প্রিন্ট-রেডি রিপোর্ট কার্ড',
        },
        {
          id: 'skills',
          labelBn: 'হোলিস্টিক স্কিল কার্ড',
          shortLabelBn: 'স্কিল',
          descriptionBn: 'শিশুদের সামাজিক আচরণ ও সৃজনশীল মেধা মূল্যায়ন',
        },
      ],
    },
    {
      id: 'pillar_operations',
      labelBn: 'দৈনিক স্কুল',
      shortLabelBn: 'দৈনিক',
      defaultTab: 'attendance',
      iconName: 'CalendarCheck',
      color: 'text-teal-600',
      itemIds: ['attendance', 'staff', 'pickup', 'diary'],
      items: [
        {
          id: 'attendance',
          labelBn: 'শিক্ষার্থী হাজিরা',
          shortLabelBn: 'শিক্ষার্থী হাজিরা',
          descriptionBn: 'ডিজিটাল ক্লাসরুম হাজিরা ও অনুপস্থিতির SMS',
        },
        {
          id: 'staff',
          labelBn: 'শিক্ষক ও স্টাফ',
          shortLabelBn: 'স্টাফ',
          descriptionBn: 'শিক্ষক ডিরেক্টরি, ডিজিটাল সার্ভিস কার্ড, স্টাফ হাজিরা ও ছুটির অনুমোদন',
        },
        {
          id: 'pickup',
          labelBn: 'গেট-পাস ও পিক-আপ',
          shortLabelBn: 'গেট-পাস',
          descriptionBn: 'নিরাপদ স্কুল প্রস্থান ও অভিভাবক ভেরিফিকেশন লগ',
        },
        {
          id: 'diary',
          labelBn: 'ডিজিটাল ডায়েরি',
          shortLabelBn: 'ডায়েরি',
          descriptionBn: 'ক্লাস অ্যাক্টিভিটি, ছবির গ্যালারি ও হোমওয়ার্ক পোস্ট',
        },
      ],
    },
    {
      id: 'pillar_chat',
      labelBn: 'চ্যাট',
      shortLabelBn: 'চ্যাট',
      defaultTab: 'messages',
      iconName: 'MessageSquare',
      color: 'text-teal-600',
      itemIds: ['messages'],
      items: [
        {
          id: 'messages',
          labelBn: 'চ্যাট হাব',
          shortLabelBn: 'চ্যাট',
          descriptionBn: 'অভিভাবক, শিক্ষক ও স্টাফদের সরাসরি মেসেজিং হাব',
        },
      ],
    },
    {
      id: 'pillar_notices',
      labelBn: 'নোটিশ',
      shortLabelBn: 'নোটিশ',
      defaultTab: 'notices',
      iconName: 'Megaphone',
      color: 'text-rose-600',
      itemIds: ['notices'],
      items: [
        {
          id: 'notices',
          labelBn: 'নোটিশ বোর্ড ও সার্কুলার',
          shortLabelBn: 'নোটিশ',
          descriptionBn: 'জরুরি নোটিশ, প্রাতিষ্ঠানিক সার্কুলার ও পুশ ব্রডকাস্ট',
        },
      ],
    },
    {
      id: 'pillar_finance',
      labelBn: 'হিসাব ও সম্পদ',
      shortLabelBn: 'হিসাব',
      defaultTab: 'fees',
      iconName: 'CreditCard',
      color: 'text-emerald-700',
      itemIds: ['fees', 'inventory', 'workspace'],
      items: [
        {
          id: 'fees',
          labelBn: 'বেতন ও ৩-পার্ট ভাউচার',
          shortLabelBn: 'বেতন/ফি',
          descriptionBn: 'টিউশন ফি, ইনভয়েস ও ৩-পার্ট ক্যাশ ভাউচার প্রিন্ট',
        },
        {
          id: 'inventory',
          labelBn: 'স্কুল অ্যাসেট ও উপকরণ',
          shortLabelBn: 'অ্যাসেট',
          descriptionBn: 'স্কুল সামগ্রী, মন্টেসরি উপকরণ ও সরঞ্জাম ট্র্যাকার',
        },
        {
          id: 'workspace',
          labelBn: 'গুগল ড্রাইভ ও ক্লাউড',
          shortLabelBn: 'ড্রাইভ',
          descriptionBn: 'Google Drive, Sheets ও ক্যালেন্ডার ক্লাউড ব্যাকআপ',
        },
      ],
    },
  ];

  if (role === 'teacher') {
    return [
      {
        id: 'pillar_overview',
        labelBn: 'শিক্ষক ড্যাশবোর্ড',
        shortLabelBn: 'হোম',
        defaultTab: 'overview',
        iconName: 'UserCheck',
        color: 'text-indigo-600',
        itemIds: ['overview'],
        items: [{ id: 'overview', labelBn: 'শিক্ষক ক্লাসরুম হোম', shortLabelBn: 'হোম', descriptionBn: 'ক্লাসরুম রোস্টার ও FCM অ্যালার্ট' }],
      },
      {
        id: 'pillar_students',
        labelBn: 'শিক্ষার্থী',
        shortLabelBn: 'শিক্ষার্থী',
        defaultTab: 'students',
        iconName: 'Users',
        color: 'text-amber-600',
        itemIds: ['students', 'idcards', 'health'],
        items: [
          { id: 'students', labelBn: 'শিক্ষার্থী তালিকা', shortLabelBn: 'তালিকা', descriptionBn: 'ক্লাসের ছাত্র-ছাত্রীর প্রোফাইল' },
          { id: 'idcards', labelBn: 'আইডি কার্ড', shortLabelBn: 'আইডি কার্ড', descriptionBn: 'ক্লাসের শিক্ষার্থীদের আইডি কার্ড প্রিন্ট' },
          { id: 'health', labelBn: 'স্বাস্থ্য ও অ্যালার্জি', shortLabelBn: 'স্বাস্থ্য', descriptionBn: 'স্বাস্থ্য, বৃদ্ধি ও অ্যালার্জি সতর্কতা' },
        ],
      },
      {
        id: 'pillar_academics',
        labelBn: 'একাডেমিক',
        shortLabelBn: 'একাডেমিক',
        defaultTab: 'routine',
        iconName: 'BookOpen',
        color: 'text-indigo-600',
        itemIds: ['routine', 'calendar', 'results', 'skills'],
        items: [
          { id: 'routine', labelBn: 'ক্লাস রুটিন', shortLabelBn: 'রুটিন', descriptionBn: 'আজকের পাঠদান ও সাপ্তাহিক সময়সূচি' },
          { id: 'calendar', labelBn: 'অ্যাকাডেমিক ক্যালেন্ডার', shortLabelBn: 'ক্যালেন্ডার', descriptionBn: 'স্কুল ইভেন্ট, পরীক্ষা ও ছুটির তালিকা' },
          { id: 'results', labelBn: 'ফলাফল ও মার্কশিট', shortLabelBn: 'ফলাফল', descriptionBn: 'নম্বর এন্ট্রি ও প্রোগ্রেস রিপোর্ট কার্ড' },
          { id: 'skills', labelBn: 'স্কিল মূল্যায়ন', shortLabelBn: 'স্কিল', descriptionBn: 'শিশুদের আচরণ ও মেধা পর্যবেক্ষণ' },
        ],
      },
      {
        id: 'pillar_operations',
        labelBn: 'ক্লাসরুম ও স্টাফ',
        shortLabelBn: 'পরিচালনা',
        defaultTab: 'attendance',
        iconName: 'CalendarCheck',
        color: 'text-teal-600',
        itemIds: ['attendance', 'staff', 'pickup', 'diary'],
        items: [
          { id: 'attendance', labelBn: 'দৈনিক হাজিরা', shortLabelBn: 'হাজিরা', descriptionBn: 'ক্লাসরুম রোল কল ও হাজিরা' },
          { id: 'staff', labelBn: 'শিক্ষক ডিরেক্টরি ও ছুটি', shortLabelBn: 'স্টাফ/ছুটি', descriptionBn: 'সহকর্মী ডিরেক্টরি, আইডি কার্ড ও ছুটির আবেদন' },
          { id: 'pickup', labelBn: 'গেট-পাস', shortLabelBn: 'গেট-পাস', descriptionBn: 'পিক-আপ কল ও অভিভাবক যাচাই' },
          { id: 'diary', labelBn: 'ডায়েরি পোস্ট', shortLabelBn: 'ডায়েরি', descriptionBn: 'ছবি, ক্রাফট ও টিফিন আপডেট' },
        ],
      },
      {
        id: 'pillar_chat',
        labelBn: 'চ্যাট',
        shortLabelBn: 'চ্যাট',
        defaultTab: 'messages',
        iconName: 'MessageSquare',
        color: 'text-teal-600',
        itemIds: ['messages'],
        items: [
          { id: 'messages', labelBn: 'চ্যাট হাব', shortLabelBn: 'চ্যাট', descriptionBn: 'অভিভাবকদের সাথে সরাসরি ক্লাসরুম মেসেজিং' },
        ],
      },
      {
        id: 'pillar_notices',
        labelBn: 'নোটিশ',
        shortLabelBn: 'নোটিশ',
        defaultTab: 'notices',
        iconName: 'Megaphone',
        color: 'text-rose-600',
        itemIds: ['notices'],
        items: [
          { id: 'notices', labelBn: 'নোটিশ বোর্ড', shortLabelBn: 'নোটিশ', descriptionBn: 'স্কুল নোটিশ ও জরুরি সার্কুলার' },
        ],
      },
      {
        id: 'pillar_finance',
        labelBn: 'বেতন ও ড্রাইভ',
        shortLabelBn: 'বেতন',
        defaultTab: 'fees',
        iconName: 'CreditCard',
        color: 'text-emerald-700',
        itemIds: ['fees', 'workspace'],
        items: [
          { id: 'fees', labelBn: 'ক্লাস ফি বকেয়া ও স্লিপ', shortLabelBn: 'ফি', descriptionBn: 'নির্ধারিত ক্লাসের ফি ও বেতন স্লিপ' },
          { id: 'workspace', labelBn: 'গুগল ড্রাইভ', shortLabelBn: 'ড্রাইভ', descriptionBn: 'ক্লাস ডকুমেন্ট ও ক্যালেন্ডার ড্রাইভ' },
        ],
      },
    ];
  }

  if (role === 'parent') {
    return [
      {
        id: 'pillar_overview',
        labelBn: 'আমার সন্তান',
        shortLabelBn: 'সন্তান',
        defaultTab: 'overview',
        iconName: 'UserCheck',
        color: 'text-amber-600',
        itemIds: ['overview'],
        items: [{ id: 'overview', labelBn: 'সন্তানের হোম ড্যাশবোর্ড', shortLabelBn: 'হোম', descriptionBn: 'সন্তানের লাইভ স্ট্যাটাস ও সারসংক্ষেপ' }],
      },
      {
        id: 'pillar_academics',
        labelBn: 'পড়াশোনা ও ফলাফল',
        shortLabelBn: 'পড়াশোনা',
        defaultTab: 'routine',
        iconName: 'BookOpen',
        color: 'text-indigo-600',
        itemIds: ['routine', 'calendar', 'results', 'diary', 'skills'],
        items: [
          { id: 'routine', labelBn: 'ক্লাস রুটিন', shortLabelBn: 'রুটিন', descriptionBn: 'সন্তানের দৈনিক ও সাপ্তাহিক ক্লাস সময়সূচি' },
          { id: 'calendar', labelBn: 'অ্যাকাডেমিক ক্যালেন্ডার', shortLabelBn: 'ক্যালেন্ডার', descriptionBn: 'ছুটি, পরীক্ষা ও স্কুলের বিশেষ দিনপঞ্জি' },
          { id: 'results', labelBn: 'পরীক্ষার ফলাফল', shortLabelBn: 'ফলাফল', descriptionBn: 'একাডেমিক মার্কশিট ও কালারফুল রিপোর্ট কার্ড' },
          { id: 'diary', labelBn: 'ক্লাস ডায়েরি', shortLabelBn: 'ডায়েরি', descriptionBn: 'আজকের ক্লাসের কাজ, টিফিন ও ছবি' },
          { id: 'skills', labelBn: 'প্রগ্রেস কার্ড', shortLabelBn: 'প্রগ্রেস', descriptionBn: 'হোলিস্টিক স্কিল ও মেধা বিকাশ রিপোর্ট' },
        ],
      },
      {
        id: 'pillar_operations',
        labelBn: 'নিরাপত্তা ও স্বাস্থ্য',
        shortLabelBn: 'নিরাপত্তা',
        defaultTab: 'pickup',
        iconName: 'ShieldCheck',
        color: 'text-teal-600',
        itemIds: ['pickup', 'idcards', 'health'],
        items: [
          { id: 'pickup', labelBn: 'গেট-পাস ও কিউআর', shortLabelBn: 'গেট-পাস', descriptionBn: 'অনুমোদিত অভিভাবক ও পিক-আপ কিউআর' },
          { id: 'idcards', labelBn: 'ডিজিটাল আইডি কার্ড', shortLabelBn: 'আইডি কার্ড', descriptionBn: 'সন্তানের স্মার্ট স্টুডেন্ট আইডি' },
          { id: 'health', labelBn: 'স্বাস্থ্য ও বৃদ্ধি', shortLabelBn: 'স্বাস্থ্য', descriptionBn: 'শিশুর উচ্চতা, ওজন, BMI ও অ্যালার্জি প্রোফাইল' },
        ],
      },
      {
        id: 'pillar_finance',
        labelBn: 'বেতন ও পেমেন্ট',
        shortLabelBn: 'বেতন',
        defaultTab: 'fees',
        iconName: 'CreditCard',
        color: 'text-rose-600',
        itemIds: ['fees'],
        items: [
          { id: 'fees', labelBn: 'স্কুল ফি ও রসিদ', shortLabelBn: 'ফি', descriptionBn: 'পেমেন্ট স্ট্যাটাস, বকেয়া ও ৩-পার্ট রসিদ' },
        ],
      },
      {
        id: 'pillar_chat',
        labelBn: 'চ্যাট',
        shortLabelBn: 'চ্যাট',
        defaultTab: 'messages',
        iconName: 'MessageSquare',
        color: 'text-teal-600',
        itemIds: ['messages'],
        items: [
          { id: 'messages', labelBn: 'শিক্ষক চ্যাট', shortLabelBn: 'চ্যাট', descriptionBn: 'শ্রেণি শিক্ষকের সাথে সরাসরি চ্যাট' },
        ],
      },
      {
        id: 'pillar_notices',
        labelBn: 'নোটিশ',
        shortLabelBn: 'নোটিশ',
        defaultTab: 'notices',
        iconName: 'Megaphone',
        color: 'text-rose-600',
        itemIds: ['notices'],
        items: [
          { id: 'notices', labelBn: 'স্কুল নোটিশ বোর্ড', shortLabelBn: 'নোটিশ', descriptionBn: 'স্কুলের জরুরি ঘোষণা ও ছুটির সার্কুলার' },
        ],
      },
    ];
  }

  return allPillars;
}

// =========================================================================
// MONTHLY ATTENDANCE SUMMARY & CSV EXPORT UTILITIES (STUDENT CONSISTENCY)
// =========================================================================

export interface MonthConfig {
  key: string;
  nameBn: string;
  nameEn: string;
  year: number;
  totalWorkingDays: number;
}

export const MONTH_OPTIONS: MonthConfig[] = [
  { key: '2026-10', nameBn: 'অক্টোবর ২০২৬', nameEn: 'October', year: 2026, totalWorkingDays: 22 },
  { key: '2026-09', nameBn: 'সেপ্টেম্বর ২০২৬', nameEn: 'September', year: 2026, totalWorkingDays: 24 },
  { key: '2026-08', nameBn: 'আগস্ট ২০২৬', nameEn: 'August', year: 2026, totalWorkingDays: 21 },
  { key: '2026-11', nameBn: 'নভেম্বর ২০২৬ (চলতি মাস)', nameEn: 'November', year: 2026, totalWorkingDays: 20 },
];

/**
 * Computes the consistency tier, Bengali label, badge color, and teacher action recommendation
 */
export function getStudentConsistencyTier(attendanceRate: number): {
  tier: ConsistencyTier;
  labelBn: string;
  badgeClass: string;
  remarksBn: string;
} {
  if (attendanceRate >= 92) {
    return {
      tier: 'excellent',
      labelBn: 'অসাধারণ ধারাবাহিকতা (Excellent)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      remarksBn: 'সর্বোচ্চ ধারাবাহিকতা ও নিয়মানুবর্তিতা বজায় রেখেছে। ক্লাসে সক্রিয়।',
    };
  }
  if (attendanceRate >= 80) {
    return {
      tier: 'regular',
      labelBn: 'সন্তোষজনক ও নিয়মিত (Regular)',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
      remarksBn: 'উপস্থিতি নিয়মিত। সময়ে প্রবেশের অভ্যাস আরও বাড়াতে উৎসাহ দেওয়া প্রয়োজন।',
    };
  }
  return {
    tier: 'needs_attention',
    labelBn: 'নিবিড় নজরদারি প্রয়োজন (Needs Attention)',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    remarksBn: 'ঘন ঘন অনুপস্থিতি পরিলক্ষিত হয়েছে। অভিভাবকের সাথে অবিলম্বে সমন্বয় প্রয়োজন।',
  };
}

/**
 * Centralized definition of the 6 classes requested for Anando Pathshala
 * 1. হাতের ঘড়ি (Hate Khori)
 * 2. প্লে (Play)
 * 3. নার্সারি (Nursery)
 * 4. কেজি (KG)
 * 5. ওয়ান (Class 1)
 * 6. টু (Class 2)
 */
export interface SchoolClassDefinition {
  id: SchoolClass;
  nameBn: string;
  fullNameBn: string;
  nameEn: string;
  ageRangeBn: string;
  descriptionBn?: string;
  color: string;
  badgeBg: string;
}

export const ALL_SCHOOL_CLASSES: SchoolClassDefinition[] = [
  {
    id: 'HateKhori',
    nameBn: 'হাতেখড়ি',
    fullNameBn: 'হাতেখড়ি (Pre-Play)',
    nameEn: 'Pre-Play',
    ageRangeBn: '২.৫+ বছর',
    descriptionBn: 'রঙের সাথে পরিচয়, সেন্সরি অ্যাক্টিভিটি, হাততালি ছড়া ও জড়িয়ে থাকার মায়াময় পরিবেশ',
    color: 'border-pink-400 bg-pink-50/50',
    badgeBg: 'bg-pink-600',
  },
  {
    id: 'Play',
    nameBn: 'প্লে',
    fullNameBn: 'প্লে (Play)',
    nameEn: 'Play',
    ageRangeBn: '৩+ বছর',
    descriptionBn: 'বর্ণমালা ও সুরের পরিচয়, রঙিন কাগজের ক্রাফট, ক্লে প্লে ও সামাজিক মেলামেশা',
    color: 'border-emerald-400 bg-emerald-50/50',
    badgeBg: 'bg-emerald-600',
  },
  {
    id: 'Nursery',
    nameBn: 'নার্সারি',
    fullNameBn: 'নার্সারি (Nursery)',
    nameEn: 'Nursery',
    ageRangeBn: '৪+ বছর',
    descriptionBn: 'বাংলা ও ইংরেজি বর্ণ স্পষ্ট চেনা, ড্রয়িং ও সংখ্যা মেলানো ওয়ার্কশিট',
    color: 'border-teal-400 bg-teal-50/50',
    badgeBg: 'bg-teal-600',
  },
  {
    id: 'KG',
    nameBn: 'কেজি',
    fullNameBn: 'কেজি (KG)',
    nameEn: 'KG',
    ageRangeBn: '৫+ বছর',
    descriptionBn: 'ধ্বনি উচ্চারণ Phonics, গণনা, পরিবেশ ও স্বতঃস্ফূর্ত গল্প বলা',
    color: 'border-amber-400 bg-amber-50/50',
    badgeBg: 'bg-amber-600',
  },
  {
    id: 'Class-1',
    nameBn: 'ওয়ান',
    fullNameBn: 'ওয়ান (Class 1)',
    nameEn: 'Class 1',
    ageRangeBn: '৬+ বছর',
    descriptionBn: 'সহজ বাক্য গঠন, অনর্গল রিডিং, প্রাথমিক গণিত ও বিজ্ঞান কৌতূহল',
    color: 'border-indigo-400 bg-indigo-50/50',
    badgeBg: 'bg-indigo-600',
  },
  {
    id: 'Class-2',
    nameBn: 'টু',
    fullNameBn: 'টু (Class 2)',
    nameEn: 'Class 2',
    ageRangeBn: '৭+ বছর',
    descriptionBn: 'পরিশীলিত হস্তলিপি, কৌতূহলী গণিত সমাধান, দ্বিভাষিক ভাষা চর্চা ও নেতৃত্ব বিকাশ',
    color: 'border-purple-400 bg-purple-50/50',
    badgeBg: 'bg-purple-600',
  },
];

export function getSchoolClassNameBn(cls: SchoolClass | string): string {
  switch (cls) {
    case 'HateKhori':
      return 'হাতেখড়ি (Pre-Play)';
    case 'Play':
    case 'Playgroup':
      return 'প্লে (Play)';
    case 'Nursery':
      return 'নার্সারি (Nursery)';
    case 'KG':
    case 'KG-1':
      return 'কেজি (KG)';
    case 'Class-1':
    case 'KG-2':
      return 'ওয়ান (Class 1)';
    case 'Class-2':
      return 'টু (Class 2)';
    default:
      return cls;
  }
}

export function isSameSchoolClass(clsA: string, clsB: string): boolean {
  if (clsA === clsB) return true;
  if ((clsA === 'Play' || clsA === 'Playgroup') && (clsB === 'Play' || clsB === 'Playgroup')) return true;
  if ((clsA === 'KG' || clsA === 'KG-1') && (clsB === 'KG' || clsB === 'KG-1')) return true;
  if ((clsA === 'Class-1' || clsA === 'KG-2') && (clsB === 'Class-1' || clsB === 'KG-2')) return true;
  return false;
}

/**
 * Baseline historical monthly attendance records for students to reflect real consistency
 */
const BASELINE_MONTHLY_ATTENDANCE: Record<string, Record<string, { present: number; late: number; absent: number }>> = {
  'std-0': {
    '2026-10': { present: 21, late: 1, absent: 0 },
    '2026-09': { present: 23, late: 0, absent: 1 },
    '2026-08': { present: 20, late: 1, absent: 0 },
    '2026-11': { present: 19, late: 1, absent: 0 },
  },
  'std-1': {
    '2026-10': { present: 20, late: 1, absent: 1 },
    '2026-09': { present: 22, late: 1, absent: 1 },
    '2026-08': { present: 19, late: 1, absent: 1 },
    '2026-11': { present: 18, late: 1, absent: 1 },
  },
  'std-2': {
    '2026-10': { present: 21, late: 0, absent: 1 },
    '2026-09': { present: 23, late: 1, absent: 0 },
    '2026-08': { present: 20, late: 0, absent: 1 },
    '2026-11': { present: 19, late: 0, absent: 1 },
  },
  'std-3': {
    '2026-10': { present: 17, late: 2, absent: 3 },
    '2026-09': { present: 18, late: 3, absent: 3 },
    '2026-08': { present: 16, late: 2, absent: 3 },
    '2026-11': { present: 15, late: 2, absent: 3 },
  },
  'std-4': {
    '2026-10': { present: 22, late: 0, absent: 0 },
    '2026-09': { present: 24, late: 0, absent: 0 },
    '2026-08': { present: 21, late: 0, absent: 0 },
    '2026-11': { present: 20, late: 0, absent: 0 },
  },
  'std-5': {
    '2026-10': { present: 22, late: 1, absent: 0 },
    '2026-09': { present: 23, late: 1, absent: 0 },
    '2026-08': { present: 21, late: 0, absent: 0 },
    '2026-11': { present: 20, late: 0, absent: 0 },
  },
};

/**
 * Generates monthly attendance summaries and overall class/school consistency metrics.
 */
export function generateMonthlyAttendanceSummary(
  students: Student[],
  currentDailyRecords: AttendanceRecord[] = [],
  monthKey: string = '2026-10',
  filterClass?: SchoolClass | 'all'
): {
  summaries: StudentMonthlyAttendanceSummary[];
  meta: MonthlyAttendanceReportMeta;
} {
  const monthConfig = MONTH_OPTIONS.find((m) => m.key === monthKey) || MONTH_OPTIONS[0];
  const targetStudents =
    filterClass && filterClass !== 'all'
      ? students.filter((s) => isSameSchoolClass(s.className, filterClass))
      : students;

  const totalWorkingDays = monthConfig.totalWorkingDays;

  const summaries: StudentMonthlyAttendanceSummary[] = targetStudents.map((std) => {
    const studentHistory = BASELINE_MONTHLY_ATTENDANCE[std.id]?.[monthKey];
    let presentDays = studentHistory?.present ?? Math.max(1, totalWorkingDays - 2);
    let lateDays = studentHistory?.late ?? 1;
    let absentDays = studentHistory?.absent ?? Math.max(0, totalWorkingDays - presentDays - lateDays);

    // If viewing October 2026 (current active demo month), incorporate live daily record changes
    if (monthKey === '2026-10') {
      const todayRecord = currentDailyRecords.find((r) => r.studentId === std.id);
      if (todayRecord) {
        if (todayRecord.status === 'absent' && absentDays === 0) {
          absentDays = 1;
          presentDays = Math.max(0, presentDays - 1);
        } else if (todayRecord.status === 'late' && lateDays === 0) {
          lateDays = 1;
          presentDays = Math.max(0, presentDays - 1);
        }
      }
    }

    const rawRate = totalWorkingDays > 0 ? ((presentDays + lateDays) / totalWorkingDays) * 100 : 0;
    const attendanceRate = Math.min(100, Math.max(0, Math.round(rawRate)));

    const consistency = getStudentConsistencyTier(attendanceRate);

    return {
      studentId: std.id,
      rollNo: std.rollNo,
      nameBn: std.nameBn,
      nameEn: std.nameEn,
      className: std.className,
      section: std.section || 'ক',
      monthNameBn: monthConfig.nameBn,
      monthKey: monthConfig.key,
      year: monthConfig.year,
      totalWorkingDays,
      presentDays,
      lateDays,
      absentDays,
      attendanceRate,
      consistencyTier: consistency.tier,
      consistencyLabelBn: consistency.labelBn,
      remarksBn: consistency.remarksBn,
      guardianNameBn: std.fatherNameBn || std.motherNameBn || 'অভিভাবক',
      guardianPhone: std.emergencyPhone || '০১৯১৪-০৫৭৫১১',
    };
  });

  // Sort summaries by Roll Number ascending
  summaries.sort(
    (a, b) =>
      parseInt(a.rollNo.replace(/\D/g, '') || '0', 10) -
      parseInt(b.rollNo.replace(/\D/g, '') || '0', 10)
  );

  const totalStudents = summaries.length;
  const avgAttendanceRate =
    totalStudents > 0
      ? Math.round(summaries.reduce((acc, s) => acc + s.attendanceRate, 0) / totalStudents)
      : 0;

  const excellentCount = summaries.filter((s) => s.consistencyTier === 'excellent').length;
  const regularCount = summaries.filter((s) => s.consistencyTier === 'regular').length;
  const needsAttentionCount = summaries.filter((s) => s.consistencyTier === 'needs_attention').length;

  const meta: MonthlyAttendanceReportMeta = {
    monthKey: monthConfig.key,
    monthNameBn: monthConfig.nameBn,
    monthNameEn: monthConfig.nameEn,
    year: monthConfig.year,
    totalWorkingDays,
    totalStudents,
    avgAttendanceRate,
    excellentCount,
    regularCount,
    needsAttentionCount,
    generatedAtBn: '৩১ অক্টোবর ২০২৬',
  };

  return { summaries, meta };
}

/**
 * Escapes a cell value for RFC 4180 CSV compliance
 */
export function formatAttendanceCsvValue(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates an RFC 4180 compliant CSV string with UTF-8 BOM (\uFEFF)
 * for seamless compatibility with Microsoft Excel, Google Sheets, LibreOffice, and macOS Numbers.
 */
export function exportAttendanceToCsv(
  summaries: StudentMonthlyAttendanceSummary[],
  meta: MonthlyAttendanceReportMeta,
  classScopeNameBn: string = 'সকল শ্রেণি'
): string {
  const BOM = '\uFEFF';
  const lines: string[] = [];

  // Report Header Metadata rows
  lines.push(`${formatAttendanceCsvValue('আনন্দ পাঠশালা — মাসিক হাজিরা সামারি রিপোর্ট (Monthly Attendance Summary Report)')}`);
  lines.push(
    [
      formatAttendanceCsvValue('প্রতিষ্ঠান:'),
      formatAttendanceCsvValue('আনন্দ পাঠশালা, গোশালা, কুষ্টিয়া'),
      formatAttendanceCsvValue('রিপোর্ট মাস:'),
      formatAttendanceCsvValue(`${meta.monthNameBn} (${meta.monthNameEn} ${meta.year})`),
    ].join(',')
  );
  lines.push(
    [
      formatAttendanceCsvValue('শ্রেণি আওতা:'),
      formatAttendanceCsvValue(classScopeNameBn),
      formatAttendanceCsvValue('মোট কার্যদিবস:'),
      formatAttendanceCsvValue(`${meta.totalWorkingDays} দিন`),
      formatAttendanceCsvValue('মোট শিক্ষার্থী:'),
      formatAttendanceCsvValue(`${meta.totalStudents} জন`),
      formatAttendanceCsvValue('গড় উপস্থিতি:'),
      formatAttendanceCsvValue(`${meta.avgAttendanceRate}%`),
    ].join(',')
  );
  lines.push(
    [
      formatAttendanceCsvValue('ধারাবাহিকতা বণ্টন:'),
      formatAttendanceCsvValue(
        `অসাধারণ (≥৯২%): ${meta.excellentCount} জন | নিয়মিত (৮০-৯১%): ${meta.regularCount} জন | নিবিড় নজরদারি (<৮০%): ${meta.needsAttentionCount} জন`
      ),
    ].join(',')
  );
  lines.push(''); // Blank separator line

  // Column Headers
  const headers = [
    'ক্রমিক (SL)',
    'রোল (Roll)',
    'শিক্ষার্থীর নাম (Bangla)',
    'Student Name (English)',
    'শ্রেণি (Class)',
    'শাখা (Section)',
    'মোট কার্যদিবস (Total Days)',
    'উপস্থিত দিন (Present Days)',
    'বিলম্বে উপস্থিতি (Late Days)',
    'অনুপস্থিত দিন (Absent Days)',
    'উপস্থিতির হার % (Attendance Rate)',
    'ধারাবাহিকতার স্ট্যাটাস (Consistency Status)',
    'শিক্ষক পর্যবেক্ষণ ও মন্তব্য (Remarks)',
    'পিতা / অভিভাবকের নাম (Guardian)',
    'জরুরি মোবাইল নম্বর (Contact)',
  ];
  lines.push(headers.map(formatAttendanceCsvValue).join(','));

  // Data Rows
  summaries.forEach((s, idx) => {
    const row = [
      String(idx + 1),
      s.rollNo,
      s.nameBn,
      s.nameEn,
      s.className,
      s.section,
      String(s.totalWorkingDays),
      String(s.presentDays),
      String(s.lateDays),
      String(s.absentDays),
      `${s.attendanceRate}%`,
      s.consistencyLabelBn,
      s.remarksBn,
      s.guardianNameBn,
      s.guardianPhone,
    ];
    lines.push(row.map(formatAttendanceCsvValue).join(','));
  });

  return BOM + lines.join('\r\n');
}

/**
 * Triggers a browser download of the exported attendance CSV file.
 */
export function downloadAttendanceCsvFile(
  csvContent: string,
  filename: string = 'ananda_pathshala_monthly_attendance_summary.csv'
): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface StudentCsvExportOptions {
  classScopeBn?: string;
  searchQuery?: string;
  statusFilter?: string;
  exportDateBn?: string;
}

/**
 * Generates an RFC 4180 compliant CSV string for student directory records
 * with UTF-8 BOM (\uFEFF) for seamless display in Microsoft Excel, Google Sheets & Calc.
 */
export function exportStudentDirectoryToCsv(
  students: Student[],
  options: StudentCsvExportOptions = {}
): string {
  const BOM = '\uFEFF';
  const lines: string[] = [];

  const now = new Date();
  const dateStr =
    options.exportDateBn ||
    `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getFullYear()}`;

  // Institutional Header Metadata
  lines.push(
    formatAttendanceCsvValue(
      'আনন্দ পাঠশালা — শিক্ষার্থী তালিকা ও প্রশাসনিক রেকর্ড (Student Directory Administrative Record)'
    )
  );
  lines.push(
    [
      formatAttendanceCsvValue('প্রতিষ্ঠান:'),
      formatAttendanceCsvValue('আনন্দ পাঠশালা, কোর্টপাড়া/গোশালা, কুষ্টিয়া'),
      formatAttendanceCsvValue('ডাউনলোড তারিখ:'),
      formatAttendanceCsvValue(dateStr),
      formatAttendanceCsvValue('মোট শিক্ষার্থী:'),
      formatAttendanceCsvValue(`${students.length} জন`),
    ].join(',')
  );

  const statusLabelMap: Record<string, string> = {
    all: 'সকল অবস্থা',
    in_class: 'শ্রেণিকক্ষে উপস্থিত',
    picked_up: 'ছুটিপ্রাপ্ত (Picked Up)',
    absent: 'অনুপস্থিত',
  };

  lines.push(
    [
      formatAttendanceCsvValue('ফিল্টার আওতা:'),
      formatAttendanceCsvValue(`শ্রেণি: ${options.classScopeBn || 'সকল শ্রেণি'}`),
      formatAttendanceCsvValue('সার্চ কীওয়ার্ড:'),
      formatAttendanceCsvValue(options.searchQuery ? `"${options.searchQuery}"` : 'কোনো সার্চ নেই'),
      formatAttendanceCsvValue('উপস্থিতি ফিল্টার:'),
      formatAttendanceCsvValue(
        options.statusFilter ? statusLabelMap[options.statusFilter] || options.statusFilter : 'সকল অবস্থা'
      ),
    ].join(',')
  );
  lines.push(''); // Blank separator line

  // Column Headers
  const headers = [
    'ক্রমিক (SL)',
    'রোল (Roll No)',
    'শিক্ষার্থীর নাম (বাংলা)',
    'Student Name (English)',
    'শ্রেণি (Class)',
    'শাখা (Section)',
    'লিঙ্গ (Gender)',
    'জন্ম তারিখ (Date of Birth)',
    'রক্তের গ্রুপ (Blood Group)',
    'অ্যালার্জি / বিশেষ সতর্কতা (Allergies)',
    'পিতার নাম (Father\'s Name)',
    'মাতার নাম (Mother\'s Name)',
    'জরুরি ফোন নম্বর (Emergency Phone)',
    'ইমেইল (Email)',
    'বর্তমান স্ট্যাটাস (Current Status)',
    'ঠিকানা (Home Address)',
    'পোর্টাল লগইন ইউজার আইডি (Username)',
    'পিক-আপ অভিভাবক (Primary Pickup)',
    'অভিভাবকের সম্পর্ক (Relation)',
  ];
  lines.push(headers.map(formatAttendanceCsvValue).join(','));

  // Data Rows
  students.forEach((std, idx) => {
    const statusText =
      std.currentStatus === 'in_class'
        ? 'শ্রেণিকক্ষে উপস্থিত'
        : std.currentStatus === 'picked_up'
        ? 'ছুটিপ্রাপ্ত (Picked Up)'
        : 'অনুপস্থিত';

    const genderText = std.gender === 'female' ? 'মেয়ে (Female)' : 'ছেলে (Male)';
    const primaryPickup = std.authorizedPickups?.[0];

    const row = [
      String(idx + 1),
      std.rollNo,
      std.nameBn,
      std.nameEn,
      getSchoolClassNameBn(std.className),
      std.section || 'A',
      genderText,
      std.birthDate || '—',
      std.bloodGroup || 'অজানা',
      std.allergies || 'নেই',
      std.fatherNameBn || '—',
      std.motherNameBn || '—',
      std.emergencyPhone || '—',
      std.email || '—',
      statusText,
      std.homeAddressBn || '—',
      std.username || '—',
      primaryPickup?.nameBn || std.fatherNameBn || '—',
      primaryPickup?.relationBn || 'বাবা',
    ];

    lines.push(row.map(formatAttendanceCsvValue).join(','));
  });

  return BOM + lines.join('\r\n');
}

/**
 * Triggers a browser download of the exported student directory CSV file.
 */
export function downloadStudentDirectoryCsvFile(
  csvContent: string,
  filename: string = 'ananda_pathshala_student_directory.csv'
): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// =========================================================================
// EXPECTED ARRIVAL TIME TREND CALCULATOR FROM PICKUP LOGS
// =========================================================================

export interface PickupTrendSample {
  id: string;
  dayLabelBn: string;
  pickupTimeBn: string;
  minutesFromMidnight: number;
  guardianNameBn: string;
  relationBn: string;
  gateCode: string;
  isLiveLog: boolean;
}

export interface StudentExpectedArrivalTrend {
  studentId: string;
  studentNameBn: string;
  expectedGatePickupTimeBn: string;
  expectedPickupWindowBn: string;
  expectedHomeArrivalTimeBn: string;
  commuteDurationMinutes: number;
  usualGuardianNameBn: string;
  usualRelationBn: string;
  consistencyRate: number;
  varianceMinutes: number;
  trendLabelBn: string;
  totalAnalyzedLogs: number;
  samples: PickupTrendSample[];
}

function parsePickupMinutesFromTimestamp(timestampStr: string): number | null {
  const bnToEn: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  const normalized = (timestampStr || '').replace(/[০-৯]/g, (d) => bnToEn[d] || d);
  const match = normalized.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  if (isNaN(hours) || isNaN(mins)) return null;

  // School dismissal is between 11:00 AM and 3:30 PM
  if (hours >= 1 && hours <= 6) {
    hours += 12;
  }
  return hours * 60 + mins;
}

function formatMinutesToBengaliClock(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  const hours24 = Math.floor(rounded / 60);
  const mins = rounded % 60;
  const periodBn = hours24 < 12 ? 'সকাল' : hours24 < 15 ? 'দুপুর' : 'বিকাল';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const hh = toBengaliNumber(String(hours12).padStart(2, '0'));
  const mm = toBengaliNumber(String(mins).padStart(2, '0'));
  return `${periodBn} ${hh}:${mm}`;
}

const BASELINE_STUDENT_PICKUP_TRENDS: Record<
  string,
  Array<{ dayLabelBn: string; minutes: number; guardianNameBn?: string; relationBn?: string; gateCode: string }>
> = {
  'std-1': [
    { dayLabelBn: 'গতকাল', minutes: 12 * 60 + 25, guardianNameBn: 'রূপালী রায়', relationBn: 'মা', gateCode: 'GP-7610-NUR' },
    { dayLabelBn: '২ দিন আগে', minutes: 12 * 60 + 30, guardianNameBn: 'সুব্রত রায়', relationBn: 'বাবা', gateCode: 'GP-7402-NUR' },
    { dayLabelBn: '৩ দিন আগে', minutes: 12 * 60 + 28, guardianNameBn: 'রূপালী রায়', relationBn: 'মা', gateCode: 'GP-7198-NUR' },
    { dayLabelBn: '৪ দিন আগে', minutes: 12 * 60 + 25, guardianNameBn: 'রূপালী রায়', relationBn: 'মা', gateCode: 'GP-6904-NUR' },
  ],
  'std-2': [
    { dayLabelBn: 'গতকাল', minutes: 11 * 60 + 45, guardianNameBn: 'ফারহানা আফরোজ', relationBn: 'মা', gateCode: 'GP-8732-PG' },
    { dayLabelBn: '২ দিন আগে', minutes: 11 * 60 + 50, guardianNameBn: 'ফারহানা আফরোজ', relationBn: 'মা', gateCode: 'GP-8411-PG' },
    { dayLabelBn: '৩ দিন আগে', minutes: 11 * 60 + 42, guardianNameBn: 'আব্দুল কাদের', relationBn: 'দাদা', gateCode: 'GP-8105-PG' },
  ],
  'std-3': [
    { dayLabelBn: 'আজ', minutes: 12 * 60 + 10, guardianNameBn: 'শাকিল খান', relationBn: 'বাবা', gateCode: 'GP-9821-KG1' },
    { dayLabelBn: 'গতকাল', minutes: 12 * 60 + 15, guardianNameBn: 'শাকিল খান', relationBn: 'বাবা', gateCode: 'GP-9410-KG1' },
    { dayLabelBn: '২ দিন আগে', minutes: 12 * 60 + 12, guardianNameBn: 'নুসরাত জাহান', relationBn: 'খালা', gateCode: 'GP-9102-KG1' },
  ],
  'std-4': [
    { dayLabelBn: 'গতকাল', minutes: 12 * 60 + 40, guardianNameBn: 'ডা. সানজিদা সুলতানা', relationBn: 'মা', gateCode: 'GP-6519-KG2' },
    { dayLabelBn: '২ দিন আগে', minutes: 12 * 60 + 35, guardianNameBn: 'জাহিদ হাসান', relationBn: 'স্কুল ভ্যান', gateCode: 'GP-6201-KG2' },
    { dayLabelBn: '৩ দিন আগে', minutes: 12 * 60 + 38, guardianNameBn: 'ডা. সানজিদা সুলতানা', relationBn: 'মা', gateCode: 'GP-5980-KG2' },
  ],
  'std-5': [
    { dayLabelBn: 'গতকাল', minutes: 13 * 60 + 10, guardianNameBn: 'হাসান চৌধুরী', relationBn: 'বাবা', gateCode: 'GP-5412-CL2' },
    { dayLabelBn: '২ দিন আগে', minutes: 13 * 60 + 15, guardianNameBn: 'হাসান চৌধুরী', relationBn: 'বাবা', gateCode: 'GP-5108-CL2' },
    { dayLabelBn: '৩ দিন আগে', minutes: 13 * 60 + 12, guardianNameBn: 'হাসান চৌধুরী', relationBn: 'বাবা', gateCode: 'GP-4890-CL2' },
  ],
};

/**
 * Calculates the student's Expected Gate Pickup & Home Arrival Time based on previous pickup log trends.
 */
export function calculateStudentExpectedArrival(
  student: Student,
  pickupLogs: PickupEvent[]
): StudentExpectedArrivalTrend {
  const studentLiveLogs = pickupLogs.filter((log) => log.studentId === student.id);
  const samples: PickupTrendSample[] = [];

  for (const log of studentLiveLogs) {
    const parsedMins = parsePickupMinutesFromTimestamp(log.timestamp);
    if (parsedMins !== null) {
      samples.push({
        id: log.id,
        dayLabelBn: log.timestamp.split(' ')[0] || 'সাম্প্রতিক',
        pickupTimeBn: formatMinutesToBengaliClock(parsedMins),
        minutesFromMidnight: parsedMins,
        guardianNameBn: log.pickupPersonNameBn,
        relationBn: log.relationBn,
        gateCode: log.gateCode,
        isLiveLog: true,
      });
    }
  }

  const baseline = BASELINE_STUDENT_PICKUP_TRENDS[student.id] || [
    {
      dayLabelBn: 'গতকাল',
      minutes: 12 * 60 + 20,
      guardianNameBn: student.authorizedPickups?.[0]?.nameBn || student.fatherNameBn,
      relationBn: student.authorizedPickups?.[0]?.relationBn || 'অভিভাবক',
      gateCode: `GP-701-${student.rollNo}`,
    },
    {
      dayLabelBn: '২ দিন আগে',
      minutes: 12 * 60 + 25,
      guardianNameBn: student.authorizedPickups?.[0]?.nameBn || student.fatherNameBn,
      relationBn: student.authorizedPickups?.[0]?.relationBn || 'অভিভাবক',
      gateCode: `GP-645-${student.rollNo}`,
    },
    {
      dayLabelBn: '৩ দিন আগে',
      minutes: 12 * 60 + 18,
      guardianNameBn: student.authorizedPickups?.[0]?.nameBn || student.fatherNameBn,
      relationBn: student.authorizedPickups?.[0]?.relationBn || 'অভিভাবক',
      gateCode: `GP-599-${student.rollNo}`,
    },
  ];

  for (let i = 0; i < baseline.length; i++) {
    const b = baseline[i];
    // Avoid duplicating a baseline entry if its gateCode is already in live pickupLogs
    if (!samples.some((s) => s.gateCode === b.gateCode)) {
      samples.push({
        id: `hist-${student.id}-${i}`,
        dayLabelBn: b.dayLabelBn,
        pickupTimeBn: formatMinutesToBengaliClock(b.minutes),
        minutesFromMidnight: b.minutes,
        guardianNameBn:
          b.guardianNameBn || student.authorizedPickups?.[0]?.nameBn || student.fatherNameBn,
        relationBn: b.relationBn || student.authorizedPickups?.[0]?.relationBn || 'অভিভাবক',
        gateCode: b.gateCode,
        isLiveLog: false,
      });
    }
  }

  const totalAnalyzedLogs = samples.length;
  const avgPickupMinutes =
    totalAnalyzedLogs > 0
      ? Math.round(
          samples.reduce((sum, s) => sum + s.minutesFromMidnight, 0) / totalAnalyzedLogs
        )
      : 12 * 60 + 20;

  // Calculate average absolute variance in minutes
  const avgVariance =
    totalAnalyzedLogs > 1
      ? Math.max(
          2,
          Math.round(
            samples.reduce((sum, s) => sum + Math.abs(s.minutesFromMidnight - avgPickupMinutes), 0) /
              totalAnalyzedLogs
          )
        )
      : 4;

  // Estimate home commute duration based on student's address in Kushtia
  const addr = student.homeAddressBn || '';
  const commuteDurationMinutes = addr.includes('গোশালা') || addr.includes('কোর্টপাড়া')
    ? 14
    : addr.includes('মজমপুর')
    ? 18
    : 20;

  const expectedHomeArrivalMinutes = avgPickupMinutes + commuteDurationMinutes;
  const windowStartBn = formatMinutesToBengaliClock(avgPickupMinutes - avgVariance);
  const windowEndClockOnly = formatMinutesToBengaliClock(avgPickupMinutes + avgVariance)
    .replace(/^(সকাল|দুপুর|বিকাল)\s+/, '');

  const consistencyRate = Math.max(82, Math.min(99, 100 - avgVariance * 2));
  const primarySample = samples[0];

  const trendLabelBn =
    avgVariance <= 4
      ? `অত্যন্ত সময়ানুবর্তী ট্রেন্ড (±${toBengaliNumber(avgVariance)} মিনিট)`
      : `নিয়মিত পিক-আপ ট্রেন্ড (±${toBengaliNumber(avgVariance)} মিনিট)`;

  return {
    studentId: student.id,
    studentNameBn: student.nameBn,
    expectedGatePickupTimeBn: formatMinutesToBengaliClock(avgPickupMinutes),
    expectedPickupWindowBn: `${windowStartBn} – ${windowEndClockOnly}`,
    expectedHomeArrivalTimeBn: formatMinutesToBengaliClock(expectedHomeArrivalMinutes),
    commuteDurationMinutes,
    usualGuardianNameBn:
      primarySample?.guardianNameBn ||
      student.authorizedPickups?.[0]?.nameBn ||
      student.fatherNameBn,
    usualRelationBn:
      primarySample?.relationBn || student.authorizedPickups?.[0]?.relationBn || 'অভিভাবক',
    consistencyRate,
    varianceMinutes: avgVariance,
    trendLabelBn,
    totalAnalyzedLogs,
    samples: samples.slice(0, 5),
  };
}




