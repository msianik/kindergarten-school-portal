import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toBengaliNumber,
  validatePickupPerson,
  generateBtrcSmsMessage,
  calculateHolisticGrade,
  calculateFeeSummary,
  calculateAttendanceStats,
  createAdmissionFcmPayload,
  createUrgentPickupFcmPayload,
  createLowStockFcmPayload,
  mergeNotificationsIdempotent,
  authenticateAndDetectRole,
  getRoleNavMetadata,
  getGroupedNavPillars,
  getStudentConsistencyTier,
  generateMonthlyAttendanceSummary,
  exportAttendanceToCsv,
} from './schoolLogic';
import {
  Student,
  SkillCriterion,
  FeeInvoice,
  AttendanceRecord,
  AdmissionApplication,
  SchoolAssetItem,
} from '../types/school';

test('toBengaliNumber converts western digits to Bengali numerals', () => {
  assert.equal(toBengaliNumber('12345'), '১২৩৪৫');
  assert.equal(toBengaliNumber(2026), '২০২৬');
  assert.equal(toBengaliNumber('01711-223344'), '০১৭১১-২২৩৩৪৪');
});

test('validatePickupPerson correctly validates approved guardians vs unlisted persons', () => {
  const dummyStudent: Student = {
    id: 'std-1',
    rollNo: '101',
    nameBn: 'আদিত্য রায়',
    nameEn: 'Aditya Roy',
    className: 'Nursery',
    section: 'A',
    birthDate: '2021-04-12',
    bloodGroup: 'B+',
    gender: 'male',
    allergies: 'চিনাবাদাম',
    emergencyPhone: '01711223344',
    fatherNameBn: 'সুব্রত রায়',
    motherNameBn: 'রূপালী রায়',
    homeAddressBn: 'ধানমন্ডি, ঢাকা',
    currentStatus: 'in_class',
    avatarColor: 'bg-amber-400',
    authorizedPickups: [
      {
        id: 'pk-father',
        nameBn: 'সুব্রত রায়',
        nameEn: 'Subrata Roy',
        relationBn: 'বাবা',
        relationEn: 'Father',
        phone: '01711223344',
        nid: '19852691234567890',
        avatarBg: 'bg-blue-100 text-blue-700',
        avatarIcon: '👨',
        isPrimary: true,
        approved: true,
      },
      {
        id: 'pk-driver',
        nameBn: 'রফিক হোসেন',
        nameEn: 'Rafiq Hossain',
        relationBn: 'নির্ধারিত ড্রাইভার',
        relationEn: 'Family Driver',
        phone: '01812345678',
        nid: '19782691234567891',
        avatarBg: 'bg-amber-100 text-amber-700',
        avatarIcon: '🚗',
        isPrimary: false,
        approved: false, // Pending
      },
    ],
  };

  // 1. Authorized father
  const resFather = validatePickupPerson(dummyStudent, 'pk-father');
  assert.equal(resFather.isValid, true);
  assert.equal(resFather.person?.relationBn, 'বাবা');

  // 2. Unapproved driver
  const resDriver = validatePickupPerson(dummyStudent, 'pk-driver');
  assert.equal(resDriver.isValid, false);
  assert.match(resDriver.reason || '', /পেন্ডিং/);

  // 3. Unlisted stranger
  const resStranger = validatePickupPerson(dummyStudent, 'pk-stranger');
  assert.equal(resStranger.isValid, false);
  assert.match(resStranger.reason || '', /নিবন্ধিত নেই/);
});

test('generateBtrcSmsMessage formats proper text with time and relation', () => {
  const msg = generateBtrcSmsMessage('আদিত্য রায়', 'সুব্রত রায়', 'বাবা', '১২:২৫');
  assert.ok(msg.includes('আদিত্য রায়'));
  assert.ok(msg.includes('সুব্রত রায়'));
  assert.ok(msg.includes('১২:২৫'));
  assert.ok(msg.includes('আনন্দ পাঠশালা'));
});

test('calculateHolisticGrade computes correct descriptive tiers', () => {
  const highSkills: SkillCriterion[] = [
    { category: 'social_emotional', categoryTitleBn: 'সামাজিক মেলবন্ধন', score: 5, descriptionBn: '', observationBn: '' },
    { category: 'fine_motor', categoryTitleBn: 'সূক্ষ্ম মোটর স্কিল', score: 5, descriptionBn: '', observationBn: '' },
    { category: 'language_rhymes', categoryTitleBn: 'ছড়া ও ভাষা', score: 4, descriptionBn: '', observationBn: '' },
    { category: 'creativity_art', categoryTitleBn: 'চিত্রাঙ্কন ও সৃজনশীলতা', score: 5, descriptionBn: '', observationBn: '' },
  ];

  const highResult = calculateHolisticGrade(highSkills);
  assert.ok(highResult.averageScore >= 4.5);
  assert.ok(highResult.badgeBn.includes('নক্ষত্র'));

  const midSkills: SkillCriterion[] = [
    { category: 'social_emotional', categoryTitleBn: 'সামাজিক মেলবন্ধন', score: 3, descriptionBn: '', observationBn: '' },
    { category: 'fine_motor', categoryTitleBn: 'সূক্ষ্ম মোটর স্কিল', score: 4, descriptionBn: '', observationBn: '' },
  ];
  const midResult = calculateHolisticGrade(midSkills);
  assert.equal(midResult.averageScore, 3.5);
  assert.ok(midResult.badgeBn.includes('সৃজনশীল'));
});

test('calculateFeeSummary sums billing and computes collection rate', () => {
  const invoices: FeeInvoice[] = [
    {
      id: 'inv-1',
      invoiceNo: 'INV-2026-001',
      studentId: 'std-1',
      studentNameBn: 'আদিত্য রায়',
      className: 'Nursery',
      monthBn: 'অক্টোবর ২০২৬',
      totalAmount: 3500,
      discountAmount: 0,
      netAmount: 3500,
      dueDate: '2026-10-15',
      status: 'paid',
      items: [{ nameBn: 'মাসিক টিউশন ও টিফিন', amount: 3500 }],
    },
    {
      id: 'inv-2',
      invoiceNo: 'INV-2026-002',
      studentId: 'std-2',
      studentNameBn: 'সুমাইয়া জাহান',
      className: 'Playgroup',
      monthBn: 'অক্টোবর ২০২৬',
      totalAmount: 3500,
      discountAmount: 500,
      netAmount: 3000,
      dueDate: '2026-10-15',
      status: 'unpaid',
      items: [{ nameBn: 'মাসিক টিউশন ও টিফিন', amount: 3000 }],
    },
  ];

  const summary = calculateFeeSummary(invoices);
  assert.equal(summary.totalBilled, 6500);
  assert.equal(summary.totalCollected, 3500);
  assert.equal(summary.totalOutstanding, 3000);
  assert.equal(summary.collectionRate, 54);
});

test('calculateAttendanceStats calculates correct rate', () => {
  const records: AttendanceRecord[] = [
    { studentId: '1', studentNameBn: 'ক', rollNo: '1', className: 'Playgroup', status: 'present' },
    { studentId: '2', studentNameBn: 'খ', rollNo: '2', className: 'Playgroup', status: 'present' },
    { studentId: '3', studentNameBn: 'গ', rollNo: '3', className: 'Playgroup', status: 'late' },
    { studentId: '4', studentNameBn: 'ঘ', rollNo: '4', className: 'Playgroup', status: 'absent' },
  ];

  const stats = calculateAttendanceStats(records);
  assert.equal(stats.total, 4);
  assert.equal(stats.present, 2);
  assert.equal(stats.late, 1);
  assert.equal(stats.absent, 1);
  assert.equal(stats.presentRate, 75);
});

test('createAdmissionFcmPayload and createUrgentPickupFcmPayload build valid FCM alerts and merge idempotently', () => {
  const app: AdmissionApplication = {
    id: 'adm-999',
    applicantNameBn: 'তাসনিম তাবাসসুম',
    applicantNameEn: 'Tasnim Tabassum',
    dateOfBirth: '2022-07-12',
    gender: 'female',
    applyingClass: 'Playgroup',
    guardianNameBn: 'কামরুল হাসান',
    guardianPhone: '০১৭১১-৯৯৮৮৭৭',
    addressBn: 'গোশালা, কুষ্টিয়া',
    submittedAt: 'আজ',
    status: 'pending',
  };

  const admNotif = createAdmissionFcmPayload(app, 'এইমাত্র');
  assert.equal(admNotif.id, 'fcm-adm-adm-999');
  assert.equal(admNotif.type, 'admission_application');
  assert.equal(admNotif.priority, 'high');
  assert.ok(admNotif.titleBn.includes('তাসনিম তাবাসসুম'));
  assert.equal(admNotif.read, false);

  const student: Student = {
    id: 'std-1',
    rollNo: '১০১',
    nameBn: 'আদিত্য রায়',
    nameEn: 'Aditya Roy',
    className: 'Nursery',
    section: 'ক',
    birthDate: '2021-04-12',
    bloodGroup: 'B+',
    gender: 'male',
    allergies: 'নেই',
    emergencyPhone: '০১৭১১-২২৩৩৪৪',
    fatherNameBn: 'সুব্রত রায়',
    motherNameBn: 'রূপালী রায়',
    homeAddressBn: 'গোশালা, কুষ্টিয়া',
    currentStatus: 'in_class',
    avatarColor: 'bg-amber-100',
    authorizedPickups: [],
  };

  const pickupNotif = createUrgentPickupFcmPayload(
    student,
    'সুব্রত রায়',
    'বাবা',
    'অভিভাবক গেট ১-এ গাড়িতে অপেক্ষা করছেন'
  );
  assert.equal(pickupNotif.type, 'urgent_pickup');
  assert.equal(pickupNotif.priority, 'urgent');
  assert.ok(pickupNotif.bodyBn.includes('অভিভাবক গেট ১-এ গাড়িতে অপেক্ষা করছেন'));

  // Idempotent merge prevents duplicates
  const list1 = mergeNotificationsIdempotent([admNotif], pickupNotif);
  assert.equal(list1.length, 2);

  const list2 = mergeNotificationsIdempotent(list1, { ...admNotif, read: true });
  assert.equal(list2.length, 2);
  assert.equal(list2.find((n) => n.id === admNotif.id)?.read, true);
});

test('authenticateAndDetectRole automatically selects principal, teacher, or parent role from credentials', () => {
  // 1. Principal auto-detection (Shafee Abdullah — Principal)
  const principalRes = authenticateAndDetectRole('principal@anandapathshala.edu.bd', '123456');
  assert.equal(principalRes.success, true);
  assert.equal(principalRes.account?.role, 'principal');
  assert.equal(principalRes.account?.nameBn, 'শাফী আব্দুল্লাহ');

  const shafeeRes = authenticateAndDetectRole('shafee', '123456');
  assert.equal(shafeeRes.success, true);
  assert.equal(shafeeRes.account?.role, 'principal');

  // 2. Head Teacher / Teacher auto-detection (Fatema Akter & Mahmuda Haque)
  const teacherRes = authenticateAndDetectRole('০১৭১৫-১১২২৩৩', '123456');
  assert.equal(teacherRes.success, true);
  assert.equal(teacherRes.account?.role, 'teacher');
  assert.equal(teacherRes.account?.nameBn, 'ফাতেমা আক্তার');

  const fatemaRes = authenticateAndDetectRole('fatema', '123456');
  assert.equal(fatemaRes.success, true);
  assert.equal(fatemaRes.account?.role, 'teacher');

  // 3. Parent auto-detection by email or phone
  const parentRes = authenticateAndDetectRole('parent@anandapathshala.edu.bd', '123456');
  assert.equal(parentRes.success, true);
  assert.equal(parentRes.account?.role, 'parent');
  assert.equal(parentRes.account?.studentId, 'std-1');

  // 4. Unknown credential returns error
  const unknownRes = authenticateAndDetectRole('stranger@unknown.com', '123456');
  assert.equal(unknownRes.success, false);
});

test('getRoleNavMetadata returns role-specific full and compact single-line menu items', () => {
  const principalNav = getRoleNavMetadata('principal');
  assert.equal(principalNav.length, 16);
  assert.ok(principalNav.every((item) => item.labelBn.length > 0 && item.shortLabelBn.length > 0));
  const chatItem = principalNav.find((i) => i.id === 'messages');
  assert.equal(chatItem?.labelBn, 'চ্যাট');
  const resultsItem = principalNav.find((i) => i.id === 'results');
  assert.equal(resultsItem?.labelBn, 'ফলাফল ও মার্কশিট');
  const healthItem = principalNav.find((i) => i.id === 'health');
  assert.equal(healthItem?.labelBn, 'স্বাস্থ্য ও অ্যালার্জি');
  const staffItem = principalNav.find((i) => i.id === 'staff');
  assert.equal(staffItem?.labelBn, 'শিক্ষক ও স্টাফ');

  const teacherNav = getRoleNavMetadata('teacher');
  assert.equal(teacherNav.length, 15);
  assert.equal(teacherNav[0].id, 'overview');

  const parentNav = getRoleNavMetadata('parent');
  assert.equal(parentNav.length, 11);
  assert.equal(parentNav[0].shortLabelBn, 'সন্তান');

  const accountantNav = getRoleNavMetadata('accountant');
  assert.equal(accountantNav.length, 6);
  assert.equal(accountantNav[0].id, 'fees');

  const gateSecurityNav = getRoleNavMetadata('gate_security');
  assert.equal(gateSecurityNav.length, 3);
  assert.equal(gateSecurityNav[0].id, 'pickup');
});

test('getStudentConsistencyTier maps percentages to correct tiers', () => {
  const high = getStudentConsistencyTier(95);
  assert.equal(high.tier, 'excellent');
  assert.match(high.labelBn, /অসাধারণ/);

  const mid = getStudentConsistencyTier(84);
  assert.equal(mid.tier, 'regular');
  assert.match(mid.labelBn, /নিয়মিত/);

  const low = getStudentConsistencyTier(70);
  assert.equal(low.tier, 'needs_attention');
  assert.match(low.labelBn, /নজরদারি/);
});

test('generateMonthlyAttendanceSummary and exportAttendanceToCsv produce accurate metrics and RFC 4180 CSV with UTF-8 BOM', () => {
  const dummyStudents: Student[] = [
    {
      id: 'std-1',
      rollNo: '১০১',
      nameBn: 'আদিত্য রায়',
      nameEn: 'Aditya Roy',
      className: 'Nursery',
      section: 'ক (পদ্ম)',
      birthDate: '২০২১-০৪-১২',
      bloodGroup: 'B+',
      gender: 'male',
      allergies: 'চিনাবাদাম',
      emergencyPhone: '০১৭১১-২২৩৩৪৪',
      fatherNameBn: 'সুব্রত রায়',
      motherNameBn: 'রূপালী রায়',
      homeAddressBn: 'গোশালা, কুষ্টিয়া',
      currentStatus: 'in_class',
      avatarColor: 'bg-amber-100',
      authorizedPickups: [],
    },
    {
      id: 'std-2',
      rollNo: '১০২',
      nameBn: 'সুমাইয়া জাহান',
      nameEn: 'Sumaiya Jahan',
      className: 'Playgroup',
      section: 'খ (গোলাপ)',
      birthDate: '২০২২-০১-১০',
      bloodGroup: 'O+',
      gender: 'female',
      allergies: 'নেই',
      emergencyPhone: '০১৭২২-৩৩৪৪৫৫',
      fatherNameBn: 'মো. রফিকুল ইসলাম',
      motherNameBn: 'সুলতানা পারভীন',
      homeAddressBn: 'কোর্টপাড়া, কুষ্টিয়া',
      currentStatus: 'in_class',
      avatarColor: 'bg-emerald-100',
      authorizedPickups: [],
    },
  ];

  const { summaries, meta } = generateMonthlyAttendanceSummary(dummyStudents, [], '2026-10', 'all');
  assert.equal(summaries.length, 2);
  assert.equal(meta.totalStudents, 2);
  assert.equal(meta.totalWorkingDays, 22);
  assert.ok(meta.avgAttendanceRate > 0);

  // Check CSV generation
  const csv = exportAttendanceToCsv(summaries, meta, 'সকল শ্রেণি');
  // 1. Must start with UTF-8 BOM
  assert.ok(csv.startsWith('\uFEFF'), 'CSV must start with UTF-8 BOM \\uFEFF for Excel compatibility');
  // 2. Must contain institution name and month
  assert.ok(csv.includes('আনন্দ পাঠশালা — মাসিক হাজিরা সামারি রিপোর্ট'));
  assert.ok(csv.includes('অক্টোবর ২০২৬'));
  // 3. Must contain students' roll and names
  assert.ok(csv.includes('১০১'));
  assert.ok(csv.includes('আদিত্য রায়'));
  assert.ok(csv.includes('Aditya Roy'));
  assert.ok(csv.includes('সুমাইয়া জাহান'));
  // 4. Must contain consistency status
  assert.ok(csv.includes('অসাধারণ'));
});

test('createLowStockFcmPayload generates high-priority administrator alerts when asset drops below threshold', () => {
  const mockLowStockAsset: SchoolAssetItem = {
    id: 'ast-test-1',
    assetCode: 'AP-AST-999',
    nameBn: 'পরীক্ষামূলক মন্টেসরি পাজল',
    nameEn: 'Experimental Montessori Puzzle',
    category: 'montessori_toys',
    categoryBn: 'মন্টেসরি খেলনা',
    locationRoomBn: 'মন্টেসরি ল্যাব',
    totalQuantity: 10,
    availableQuantity: 2,
    inUseQuantity: 8,
    unitBn: 'সেট',
    condition: 'good',
    conditionBn: 'ভালো',
    lowStockThreshold: 4,
    assignedTeacherNameBn: 'ঐশী মিস',
  };

  const payload = createLowStockFcmPayload(mockLowStockAsset, 'আজ সকাল ১০:০০');
  assert.equal(payload.type, 'inventory_low_stock');
  assert.equal(payload.priority, 'high');
  assert.equal(payload.targetRole, 'principal');
  assert.equal(payload.actionTab, 'inventory');
  assert.ok(payload.titleBn.includes('লো-স্টক সতর্কবার্তা'));
  assert.ok(payload.titleBn.includes('AP-AST-999'));
  assert.ok(payload.bodyBn.includes('পরীক্ষামূলক মন্টেসরি পাজল'));
  assert.equal(payload.lowStockThreshold, 4);
  assert.equal(payload.availableQuantity, 2);

  // Test out-of-stock urgency
  const outOfStockAsset: SchoolAssetItem = {
    ...mockLowStockAsset,
    availableQuantity: 0,
  };
  const urgentPayload = createLowStockFcmPayload(outOfStockAsset, 'এইমাত্র');
  assert.equal(urgentPayload.priority, 'urgent');
  assert.ok(urgentPayload.titleBn.includes('স্টক শূন্য সতর্কতা'));
});

test('getGroupedNavPillars returns simplified, non-repetitive core pillars', () => {
  const adminPillars = getGroupedNavPillars('principal');
  assert.equal(adminPillars.length, 7);
  assert.equal(adminPillars[0].id, 'pillar_overview');
  assert.equal(adminPillars[1].id, 'pillar_students');
  assert.equal(adminPillars[2].id, 'pillar_academics');
  assert.equal(adminPillars[3].id, 'pillar_operations');
  assert.equal(adminPillars[4].id, 'pillar_chat');
  assert.equal(adminPillars[5].id, 'pillar_notices');
  assert.equal(adminPillars[6].id, 'pillar_finance');

  // Verify all pillars have default tabs and valid items
  for (const pillar of adminPillars) {
    assert.ok(pillar.defaultTab.length > 0);
    assert.ok(pillar.labelBn.length > 0);
    assert.ok(pillar.items.length > 0);
    assert.ok(pillar.itemIds.includes(pillar.defaultTab));
  }

  // Teacher pillars
  const teacherPillars = getGroupedNavPillars('teacher');
  assert.equal(teacherPillars.length, 7);

  // Parent pillars
  const parentPillars = getGroupedNavPillars('parent');
  assert.equal(parentPillars.length, 6);
  assert.equal(parentPillars[0].labelBn, 'আমার সন্তান');
  assert.ok(parentPillars.some((p) => p.id === 'pillar_chat'));
  assert.ok(parentPillars.some((p) => p.id === 'pillar_notices'));
});




