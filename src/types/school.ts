export type UserRole = 
  | 'super_admin'
  | 'director'
  | 'principal' 
  | 'teacher' 
  | 'accountant' 
  | 'parent' 
  | 'gate_security' 
  | 'public';

export type SchoolClass = 
  | 'HateKhori'  // ১. হাতের ঘড়ি (বা হাতেখড়ি)
  | 'Play'       // ২. প্লে
  | 'Nursery'    // ৩. নার্সারি
  | 'KG'         // ৪. কেজি
  | 'Class-1'    // ৫. ওয়ান
  | 'Class-2'    // ৬. টু
  // Backward compatibility aliases
  | 'Playgroup'
  | 'KG-1'
  | 'KG-2';

export type DayOfWeek =
  | 'saturday'
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday';

export type HomeworkSubmissionType =
  | 'written_notebook'
  | 'oral_practice'
  | 'worksheet'
  | 'drawing_craft';

export interface ClassRoutinePeriod {
  id: string;
  className: SchoolClass;
  day: DayOfWeek;
  periodNo: number; // 1, 2, 3, 4, 5
  periodLabelBn: string; // যেমন: "১ম পিরিয়ড", "টিফিন বিরতি"
  startTime: string; // "09:00 AM" বা "০৯:০০"
  endTime: string; // "09:40 AM" বা "০৯:৪০"
  subjectBn: string; // যেমন: "বাংলা ভাষা ও বর্ণমালা", "গণিত ও সংখ্যা", "ছড়া ও সঙ্গীত", "আর্ট ও ক্রাফট"
  subject?: string;
  subjectEn?: string;
  teacherId?: string;
  teacherNameBn: string; // যেমন: "ফাতেমা আক্তার", "মোছাঃ মাহমুদা হক (রিয়া মিস)"
  roomBn: string; // যেমন: "রুম ১০১", "রুম ১০২", "আর্ট অ্যান্ড ক্রাফট ল্যাব"
  room?: string;
  topicBn?: string; // যেমন: "স্বরবর্ণ লেখা ও ছড়া আবৃত্তি", "১-১০ সংখ্যা গণনা"
  topic?: string;
  /** সংক্ষিপ্ত দৈনিক পাঠ পরিকল্পনা সারসংক্ষেপ (Brief daily lesson plan summary added by teachers for parents) */
  lessonPlanSummaryBn?: string;
  /** শিখনফল বা ক্লাসের মূল লক্ষ্য (Learning objectives) */
  learningObjectivesBn?: string;
  /** শিক্ষকের নির্ধারিত নির্দিষ্ট বাড়ির কাজ (Specific Homework Assignment assigned by teacher for parents/students) */
  homeworkAssignmentBn?: string;
  /** বাড়ির কাজ জমা দেওয়ার সময়সীমা / তারিখ (Homework Due Date / Submission Schedule) */
  homeworkDueDateBn?: string;
  /** বাড়ির কাজের ধরন: খাতায় লেখা, মৌখিক পড়া, ওয়ার্কশিট বা ড্রয়িং/ক্রাফট */
  homeworkSubmissionType?: HomeworkSubmissionType;
  /** বাড়ির কাজ প্রদানকারী শিক্ষকের নাম */
  homeworkAssignedByBn?: string;
  /** বাড়ির কাজ সর্বশেষ অ্যাসাইন করার সময় */
  homeworkAssignedAtBn?: string;
  /** বাসার অনুশীলন বা অভিভাবকদের জন্য নির্দেশনা (Home activity / parent note - synced with homeworkAssignmentBn) */
  homeworkOrActivityBn?: string;
  /** প্রয়োজনীয় শিক্ষা উপকরণ (Classroom / learning materials) */
  materialsNeededBn?: string;
  /** পাঠের জন্য বুকিংকৃত স্কুলের স্পেশাল রিসোর্স ও সম্পদ (e.g., Projector, Playground, Art Lab, Smart TV) */
  resources?: string[];
  /** বাংলা লেবেলসহ বুকিংকৃত রিসোর্স তালিকা বা বর্ণনা (e.g., "মাল্টিমিডিয়া প্রজেক্টর, খেলার মাঠ") */
  bookedResourcesBn?: string;
  /** পাঠ পরিকল্পনা সর্বশেষ আপডেটের সময় */
  lessonPlanUpdatedAtBn?: string;
  /** পাঠ পরিকল্পনা আপডেটকারী শিক্ষকের নাম */
  lessonPlanUpdatedByBn?: string;
  durationMinutes?: number;
  isBreak?: boolean;
}

export interface WeeklyClassProgressRecord {
  id: string;
  className: SchoolClass;
  weekKey: string; // e.g. 'nov-2026-w1'
  weekLabelBn: string; // যেমন: "১ম সপ্তাহ, নভেম্বর ২০২৬ (০১ - ০৫ নভেম্বর)"
  status: 'completed' | 'pending'; // সম্পূর্ণ সপ্তাহের অগ্রগতি: সম্পন্ন অথবা চলমান/পেন্ডিং
  completionPercentage: number; // 0 to 100
  teacherSummaryNoteBn: string; // শিক্ষকের সাপ্তাহিক পাঠ মূল্যায়ন ও সারসংক্ষেপ
  keyHighlightsBn: string[]; // সপ্তাহের প্রধান অর্জিত বিষয়সমূহ
  parentActionNoteBn: string; // অভিভাবকদের জন্য সাপ্তাহিক বাসার অনুশীলন পরামর্শ
  completedPeriodIds: string[]; // এই সপ্তাহে সম্পন্ন হওয়া পিরিয়ডগুলোর আইডি
  updatedByBn: string;
  updatedAtBn: string;
}

export interface PickupPerson {
  id: string;
  nameBn: string;
  nameEn: string;
  relationBn: string; // যেমন: বাবা, মা, মামা, অনুমোদিত ড্রাইভার
  relationEn: string;
  phone: string;
  nid: string;
  avatarBg: string;
  avatarIcon: string;
  isPrimary: boolean;
  approved: boolean;
  notes?: string;
}

export interface PickupEvent {
  id: string;
  studentId: string;
  studentNameBn: string;
  className: SchoolClass;
  pickupPersonId: string;
  pickupPersonNameBn: string;
  relationBn: string;
  gateOfficerNameBn: string;
  timestamp: string;
  gateCode: string;
  status: 'completed' | 'flagged' | 'in_progress';
  smsNotificationSent: boolean;
  smsMessage: string;
}

export type PortalAccountRole =
  | 'super_admin'
  | 'director'
  | 'principal'
  | 'teacher'
  | 'parent'
  | 'gate_security';

export interface Student {
  id: string;
  rollNo: string;
  nameBn: string;
  nameEn: string;
  className: SchoolClass;
  section: string;
  birthDate: string;
  bloodGroup: string;
  gender: 'male' | 'female';
  allergies: string;
  emergencyPhone: string;
  email?: string;
  fatherNameBn: string;
  motherNameBn: string;
  homeAddressBn: string;
  currentStatus: 'in_class' | 'picked_up' | 'absent';
  lastPickupEvent?: PickupEvent;
  authorizedPickups: PickupPerson[];
  avatarColor: string;
  photoUrl?: string;
  username?: string;
  password?: string;
  portalRole?: PortalAccountRole;
  admissionDate?: string; // যেমন: '2026-05-01'
  admissionDateBn?: string; // যেমন: '০১ মে ২০২৬'
  admissionFee?: number; // যেমন: 5000
  monthlyFee?: number; // যেমন: 4000
}

export interface StudentFeeConfig {
  studentId: string;
  admissionDate: string; // ISO YYYY-MM-DD, e.g. '2026-05-01'
  admissionDateBn: string; // যেমন: '০১ মে ২০২৬'
  admissionFee: number; // ভর্তি ফি (৳)
  admissionFeeStatus: 'paid' | 'unpaid';
  admissionReceiptNo?: string;
  admissionPaidAt?: string;
  admissionPaymentMethod?: 'bKash' | 'Nagad' | 'Bank' | 'Cash';
  monthlyFee: number; // প্রত্যেক মাসিক ফি (৳)
  monthlyDiscount: number; // মাসিক বিশেষ ছাড় (৳)
  sessionFee?: number; // সেশন বা শিক্ষা উপকরণ ফি (৳)
  updatedByBn?: string;
  updatedAtBn?: string;
}

export type ActivityType = 
  | 'rhyme' 
  | 'art_craft' 
  | 'block_play' 
  | 'snack_time' 
  | 'outdoor' 
  | 'circle_time' 
  | 'nap'
  | 'homework_task';

export type ChildMood = 'joyful' | 'creative' | 'curious' | 'peaceful' | 'playful';

export interface ActivityComment {
  id: string;
  authorBn: string;
  roleBn: string;
  text: string;
  timeAgo: string;
}

export interface HomeworkTaskDetail {
  subjectBn: string;
  dueDateBn: string;
  materialsNeededBn?: string;
  submissionInstructionsBn?: string;
  estimatedMinutes?: number;
}

export interface ActivityPost {
  id: string;
  className: SchoolClass;
  titleBn: string;
  dateStr: string;
  timeStr: string;
  activityType: ActivityType;
  mood: ChildMood;
  teacherNameBn: string;
  descriptionBn: string;
  illustrationTheme: 'painting' | 'music' | 'blocks' | 'sand' | 'fruits' | 'story';
  photoUrl?: string;
  galleryUrls?: string[];
  fbPostUrl?: string;
  snackDetail?: {
    itemBn: string;
    intake: 'full' | 'half' | 'few_bites' | 'none';
  };
  homeworkTask?: HomeworkTaskDetail;
  likes: number;
  comments: ActivityComment[];
}

export interface FacebookGalleryItem {
  id: string;
  titleBn: string;
  captionBn: string;
  imageUrl: string;
  categoryBn?: string;
  category?: 'classroom' | 'craft' | 'outdoor' | 'event' | 'branding';
  dateBn: string;
  fbUrl?: string;
}

export type SkillCategory = 
  | 'social_emotional'
  | 'fine_motor'
  | 'gross_motor'
  | 'language_rhymes'
  | 'creativity_art'
  | 'curiosity_cognition';

export interface SkillCriterion {
  category: SkillCategory;
  categoryTitleBn: string;
  score: number; // 1 to 5
  descriptionBn: string;
  observationBn: string;
}

export interface SkillAssessment {
  id: string;
  studentId: string;
  studentNameBn: string;
  className: SchoolClass;
  termBn: string;
  evaluationDate: string;
  skills: SkillCriterion[];
  growth: {
    heightCm: number;
    weightKg: number;
    bmiStatusBn: string;
    milestoneBn: string;
  };
  overallBadgeBn: string;
  teacherRemarksBn: string;
  principalRemarksBn: string;
}

export interface FeeItem {
  nameBn: string;
  amount: number;
}

export interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentNameBn: string;
  className: SchoolClass;
  monthBn: string;
  invoiceType?: 'monthly' | 'admission' | 'combined';
  admissionDateBn?: string;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  items: FeeItem[];
  paymentMethod?: 'bKash' | 'Nagad' | 'Bank' | 'Cash';
  transactionId?: string;
  paidAt?: string;
  confirmedByBn?: string;
  collectorNoteBn?: string;
  pdfReceiptGenerated?: boolean;
  pdfReceiptFileName?: string;
  pdfReceiptGeneratedAt?: string;
  pdfReceiptSerialNo?: string;
}

export interface AttendanceRecord {
  studentId: string;
  studentNameBn: string;
  rollNo: string;
  className: SchoolClass;
  status: 'present' | 'absent' | 'late';
  checkInTime?: string;
  lateReasonBn?: string;
  absentReasonBn?: string;
  dateStr?: string;
  remarks?: string;
}

export type StaffAttendanceStatus = 'present' | 'late' | 'leave' | 'absent';

export interface StaffAttendanceRecord {
  id: string;
  teacherId: string;
  teacherNameBn: string;
  teacherNameEn: string;
  designationBn: string;
  departmentBn?: string;
  photoUrl?: string;
  phone?: string;
  date: string;
  dateBn: string;
  checkInTime?: string;
  checkInTimestamp?: number;
  status: StaffAttendanceStatus;
  checkInMethod?: 'self_digital' | 'biometric' | 'admin_manual';
  remarksBn?: string;
  isLate?: boolean;
  lateMinutes?: number;
}

export type ConsistencyTier = 'excellent' | 'regular' | 'needs_attention';

export interface StudentMonthlyAttendanceSummary {
  studentId: string;
  rollNo: string;
  nameBn: string;
  nameEn: string;
  className: SchoolClass;
  section: string;
  monthNameBn: string;
  monthKey: string;
  year: number;
  totalWorkingDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  attendanceRate: number;
  consistencyTier: ConsistencyTier;
  consistencyLabelBn: string;
  remarksBn: string;
  guardianNameBn: string;
  guardianPhone: string;
  dailyStatusMap?: Record<string, 'present' | 'late' | 'absent'>;
}

export interface MonthlyAttendanceReportMeta {
  monthKey: string;
  monthNameBn: string;
  monthNameEn: string;
  year: number;
  totalWorkingDays: number;
  totalStudents: number;
  avgAttendanceRate: number;
  excellentCount: number;
  regularCount: number;
  needsAttentionCount: number;
  generatedAtBn: string;
}

export interface AdmissionApplication {
  id: string;
  applicantNameBn: string;
  applicantNameEn: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  applyingClass: SchoolClass;
  guardianNameBn: string;
  guardianPhone: string;
  email?: string;
  addressBn: string;
  submittedAt: string;
  status: 'pending' | 'interview_scheduled' | 'admitted';
  fatherNameBn?: string;
  motherNameBn?: string;
  guardianRelationBn?: string;
  bloodGroup?: string;
  sessionYear?: string;
  previousSchoolBn?: string;
  specialNotesBn?: string;
}

export type FcmNotificationType =
  | 'admission_application'
  | 'urgent_pickup'
  | 'gate_pass_completed'
  | 'broadcast_announcement'
  | 'fee_due_reminder'
  | 'homework_task_assigned'
  | 'absence_alert'
  | 'parent_teacher_message'
  | 'staff_internal_message'
  | 'inventory_low_stock';

export interface FcmNotification {
  id: string;
  type: FcmNotificationType;
  priority: 'urgent' | 'high' | 'normal';
  titleBn: string;
  bodyBn: string;
  targetRole: 'teacher' | 'principal' | 'all_staff' | 'all' | 'parent';
  studentOrApplicantNameBn: string;
  className: SchoolClass;
  guardianNameBn: string;
  guardianPhone?: string;
  timestamp: string;
  read: boolean;
  actionTab: 'pickup' | 'overview' | 'public' | 'diary' | 'fees' | 'students' | 'routine' | 'inventory' | 'calendar' | 'skills' | 'workspace' | 'idcards' | 'attendance' | 'messages';
  fcmMessageId: string;
  invoiceId?: string;
  dueAmount?: number;
  dueDate?: string;
  daysRemaining?: number;
  assetId?: string;
  assetCode?: string;
  lowStockThreshold?: number;
  availableQuantity?: number;
}

export interface PortalAccount {
  id: string;
  nameBn: string;
  nameEn: string;
  role: 'super_admin' | 'director' | 'principal' | 'teacher' | 'parent' | 'gate_security';
  roleTitleBn: string;
  portalNameBn: string;
  email: string;
  phone: string;
  username: string;
  passwordHint: string;
  avatarUrl?: string;
  assignedClass?: SchoolClass;
  studentId?: string;
  directorId?: string;
}

export type MessageCategory =
  | 'daily_mood'        // দৈনিক আচরণ ও মানসিক অবস্থা
  | 'tiffin_health'     // টিফিন ও স্বাস্থ্য জিজ্ঞাসা
  | 'homework_study'    // বাড়ির কাজ / পড়া বিষয়ক প্রশ্ন
  | 'late_pickup_note'  // দেরিতে আসা বা পিক-আপ নোট
  | 'medication_care'   // ওষুধ খাওয়ানোর বিশেষ অনুরোধ
  | 'general';          // সাধারণ বার্তা

export interface ParentTeacherMessage {
  id: string;
  studentId: string;
  studentNameBn: string;
  className: SchoolClass;
  senderRole: 'parent' | 'teacher' | 'principal' | 'super_admin';
  senderNameBn: string;
  senderAvatarUrl?: string;
  receiverRole: 'parent' | 'teacher' | 'principal';
  receiverNameBn: string;
  text: string;
  category: MessageCategory;
  categoryLabelBn?: string;
  photoUrl?: string;
  timestamp: string;
  createdAt: number;
  isRead: boolean;
  readAt?: string;
  isUrgent?: boolean;
}

export type StaffRoomType = 'channel' | 'direct';

export type StaffActionType = 
  | 'chat'
  | 'substitute_request'   // প্রক্সি / সাবস্টিটিউট ক্লাসের অনুরোধ
  | 'emergency_briefing'   // জরুরি মিটিং বা ব্রিফিং নোটিশ
  | 'resource_requisition' // মন্টেসরি ও শিক্ষা উপকরণ রিকুইজিশন
  | 'duty_roster';         // দায়িত্ব বা ডিউটি নোটিশ

export interface StaffSubstituteRequest {
  id: string;
  requesterTeacherId: string;
  requesterNameBn: string;
  className: SchoolClass;
  periodLabelBn: string;
  subjectBn: string;
  dateStr: string;
  reasonBn: string;
  status: 'pending' | 'accepted' | 'declined';
  acceptedByTeacherId?: string;
  acceptedByTeacherNameBn?: string;
  timestamp: string;
}

export interface StaffChannelMeta {
  id: string;
  titleBn: string;
  subtitleBn: string;
  iconType: string;
  badgeBg: string;
  textColor: string;
  memberCount: number;
  memberIds?: string[];
  allowedRoles?: UserRole[];
  isDefault?: boolean;
  isLocked?: boolean;
  createdBy?: string;
  createdAt?: number;
}

export interface StaffChatMember {
  id: string;
  teacherId?: string;
  directorId?: string;
  nameBn: string;
  nameEn: string;
  role: UserRole;
  designationBn: string;
  departmentBn?: string;
  photoUrl: string;
  phone?: string;
  email?: string;
  username?: string;
  category: 'director' | 'principal' | 'teacher' | 'support_staff' | 'accountant';
}

export interface StaffInternalMessage {
  id: string;
  roomId: string;
  roomType: StaffRoomType;
  roomNameBn: string;
  senderId: string;
  senderNameBn: string;
  senderRoleTitleBn: string;
  senderAvatarUrl?: string;
  receiverId?: string;
  receiverNameBn?: string;
  text: string;
  actionType: StaffActionType;
  actionDetails?: {
    substitute?: StaffSubstituteRequest;
    meetingTime?: string;
    meetingTopic?: string;
    requisitionItems?: string[];
  };
  timestamp: string;
  createdAt: number;
  isPinned?: boolean;
  replyTo?: {
    id: string;
    senderNameBn: string;
    text: string;
  };
  reactions?: Record<string, string[]>; // emoji -> array of user names
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface DirectorAccessPermission {
  directorId: string;
  nameBn: string;
  nameEn: string;
  roleTitleBn: string;
  photoUrl?: string;
  email: string;
  phone: string;
  username: string;
  isSuperAdmin?: boolean;
  viewAllModules: boolean; // সিস্টেমের সবকিছু ভিউ করার অপশন (Default: true)
  canEditSchoolAndBoard: boolean; // স্কুল প্রোফাইল, পরিচালনা পর্ষদ ও শিক্ষক এডিট
  canManageNoticesAndEvents: boolean; // নোটিশ বোর্ড, ক্যালেন্ডার ও অর্জন এডিট
  canManageStudentsAndAdmissions: boolean; // শিক্ষার্থী ও ভর্তি ব্যবস্থাপনা এডিট
  canManageFeesAndAccounts: boolean; // ফি ও একাউন্টস কন্ট্রোল
  canApproveGatePassAndDiary: boolean; // গেট-পাস ও ডায়েরি অনুমোদন
  allowedModules: string[]; // কোন কোন ট্যাব ভিউ করতে পারবে
  lastUpdatedByBn?: string;
  lastUpdatedAtBn?: string;
}

export interface RolePolicyConfig {
  teacher: {
    canTakeAttendance: boolean;
    canEnterExamMarks: boolean;
    canPostClassDiary: boolean;
    canEvaluateSkills: boolean;
    canViewClassFeesDue: boolean;
    canChatWithParents: boolean;
  };
  parent: {
    childDataOnly: boolean;
    canCommentOnDiary: boolean;
    canPayFeesOnline: boolean;
    canChatWithTeacher: boolean;
    canUpdateChildHealth: boolean;
    canRequestUrgentPickup: boolean;
  };
  accountant: {
    canCollectFees: boolean;
    canGenerateInvoice: boolean;
    canGenerateSalarySlips: boolean;
    canManageAssets: boolean;
    canViewFinancialReports: boolean;
  };
  gateSecurity: {
    canScanQrCode: boolean;
    canAuthorizeRelease: boolean;
    canSendSmsAlerts: boolean;
    canSendEmergencyAlert: boolean;
  };
  principal: {
    fullAcademicControl: boolean;
    fullOperationalControl: boolean;
    canBroadcastNotices: boolean;
    canApproveAdmissions: boolean;
  };
}

export const DEFAULT_ROLE_POLICY_CONFIG: RolePolicyConfig = {
  teacher: {
    canTakeAttendance: true,
    canEnterExamMarks: true,
    canPostClassDiary: true,
    canEvaluateSkills: true,
    canViewClassFeesDue: true,
    canChatWithParents: true,
  },
  parent: {
    childDataOnly: true,
    canCommentOnDiary: true,
    canPayFeesOnline: true,
    canChatWithTeacher: true,
    canUpdateChildHealth: true,
    canRequestUrgentPickup: true,
  },
  accountant: {
    canCollectFees: true,
    canGenerateInvoice: true,
    canGenerateSalarySlips: true,
    canManageAssets: true,
    canViewFinancialReports: true,
  },
  gateSecurity: {
    canScanQrCode: true,
    canAuthorizeRelease: true,
    canSendSmsAlerts: true,
    canSendEmergencyAlert: true,
  },
  principal: {
    fullAcademicControl: true,
    fullOperationalControl: true,
    canBroadcastNotices: true,
    canApproveAdmissions: true,
  },
};

export interface TeacherMember {
  id: string;
  nameBn: string;
  nameEn: string;
  designationBn: string;
  designationEn: string;
  photoUrl: string;
  departmentBn: string;
  isHeadTeacher?: boolean;
  isDirector?: boolean;
  staffCategory?: 'teacher' | 'support_staff' | 'principal';
  phone?: string;
  email?: string;
  username?: string;
  password?: string;
  portalRole?: PortalAccountRole;
  assignedClass?: SchoolClass;
  qualificationBn?: string;
  bloodGroup?: string;
  joiningDateBn?: string;
  status?: 'active' | 'on_leave' | 'inactive';
}

export type TeacherLeaveType = 'casual' | 'sick' | 'maternity' | 'emergency';
export type TeacherLeaveStatus = 'pending' | 'approved' | 'rejected';

export interface TeacherLeaveApplication {
  id: string;
  teacherId: string;
  teacherNameBn: string;
  designationBn: string;
  photoUrl?: string;
  leaveType: TeacherLeaveType;
  leaveTypeBn: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reasonBn: string;
  appliedAtBn: string;
  status: TeacherLeaveStatus;
  approvedByBn?: string;
  reviewedAtBn?: string;
  adminRemarksBn?: string;
  substituteTeacherNameBn?: string;
}

export type TeacherAttendanceStatus = 'present' | 'absent' | 'leave' | 'late';

export interface TeacherAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  teacherId: string;
  teacherNameBn: string;
  designationBn: string;
  departmentBn?: string;
  photoUrl?: string;
  status: TeacherAttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  remarksBn?: string;
}

export interface TeacherLeaveBalance {
  teacherId: string;
  totalCasualAllowed: number;
  casualTaken: number;
  totalSickAllowed: number;
  sickTaken: number;
  totalEmergencyAllowed: number;
  emergencyTaken: number;
}

export interface CommitteeDirector {
  id: string;
  nameBn: string;
  nameEn: string;
  roleBn: string; // পর্ষদীয় ভূমিকা / দায়িত্ব (Board Role, e.g. সভাপতি / চেয়ারম্যান, ব্যবস্থাপনা পরিচালক)
  roleEn: string;
  designationBn?: string; // প্রাতিষ্ঠানিক পদবি (Designation, e.g. প্রতিষ্ঠাতা চেয়ারম্যান, সিইও ও ট্রাস্টি)
  designationEn?: string;
  photoUrl?: string;
  messageBn?: string; // পরিচালকদের বাণী (Message from the Director / inspiring speech)
  messageEn?: string;
  professionBn?: string; // পেশাগত পরিচয় / যোগ্যতা
  phone?: string;
  email?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  addressBn?: string;
  termBn?: string; // যেমন: ২০২৫ - ২০২৭
  isChairman?: boolean;
  isManagingDirector?: boolean;
  order?: number;
  username?: string;
  password?: string;
  portalRole?: PortalAccountRole;
}

export interface SchoolProfile {
  nameBn: string;
  nameEn: string;
  sloganBn: string;
  taglineBn: string;
  classesSummaryBn?: string;
  classesBn: string;
  addressBn: string;
  addressEn: string;
  phoneBn: string;
  phoneRaw: string;
  email: string;
  website: string;
  facebookUrl: string;
  followers: string;
  fbFollowers?: string;
  visitingHoursBn?: string;
  logoUrl: string;
  coverUrl: string;
  totalStudentsCount?: number;
  totalTeachersCount?: number;
  totalClassroomsCount?: number;
  themeColor?: string;
}

export interface LeaderBio {
  nameBn: string;
  nameEn: string;
  roleBn: string;
  photoUrl: string;
  quoteBn: string;
  quoteEn?: string;
}

export interface LeadershipProfiles {
  principal: LeaderBio;
  headTeacher: LeaderBio;
  directorMessage?: LeaderBio;
}

export interface BestStudentHighlight {
  id: string;
  nameBn: string;
  nameEn: string;
  classBn: string;
  classEn: string;
  rollBn: string;
  session: string;
  photoUrl: string;
}

export type AcademicEventCategory =
  | 'holiday'
  | 'exam'
  | 'meeting'
  | 'cultural'
  | 'sports'
  | 'event';

export interface AcademicCalendarEvent {
  id: string;
  titleBn: string;
  titleEn: string;
  category: AcademicEventCategory;
  startDate: string; // e.g. "১৫ নভেম্বর ২০২৬"
  endDate?: string;  // e.g. "১৯ নভেম্বর ২০২৬"
  daysCountBn?: string; // e.g. "১ দিন", "৫ দিন"
  timeBn?: string;   // e.g. "সকাল ০৯:৩০ - দুপুর ১২:০০"
  targetClassesBn: string; // e.g. "প্লে, নার্সারি, কেজি ও ১ম শ্রেণি"
  venueBn: string;   // e.g. "আনন্দ পাঠশালা মূল ক্যাম্পাস"
  descriptionBn: string;
  statusBadgeBn: string; // e.g. "আসন্ন", "বাধ্যতামূলক", "স্কুল বন্ধ"
  isUpcoming: boolean;
  priority?: 'urgent' | 'high' | 'normal';
}

export type AchievementCategory = 'student_award' | 'milestone' | 'academic' | 'sports' | 'cultural';

export type AchievementBadge =
  | 'gold_trophy'
  | 'star_award'
  | 'medal'
  | 'ribbon'
  | 'milestone_flag'
  | 'certificate';

export interface Achievement {
  id: string;
  titleBn: string;
  titleEn?: string;
  category: AchievementCategory;
  recipientNameBn: string;
  recipientType: 'student' | 'class' | 'institution';
  awardTitleBn: string;
  dateBn: string;
  dateStamp: string;
  descriptionBn: string;
  badgeType: AchievementBadge;
  imageUrl?: string;
  awardedByBn: string;
  featured?: boolean;
}

export type SchoolNoticeCategory = 'all' | 'urgent' | 'admission' | 'event' | 'exam' | 'holiday';

export interface SchoolNotice {
  id: string;
  titleBn: string;
  titleEn?: string;
  category: 'urgent' | 'admission' | 'event' | 'exam' | 'holiday';
  dateBn: string;
  validUntilBn?: string;
  priority: 'urgent' | 'high' | 'normal';
  badgeBn: string;
  targetAudienceBn: string;
  descriptionBn: string;
  actionLink?: string;
  actionTextBn?: string;
  attachmentName?: string;
  isPinned?: boolean;
  createdAt?: string;
  facebookPostUrl?: string;
}

// ==========================================
// School Assets & Inventory Tracker Types
// ==========================================
export type AssetCategory = 
  | 'montessori_toys'      // মন্টেসরি ও কাঠের শিক্ষামূলক খেলনা
  | 'classroom_supplies'  // ক্লাসরুম স্টেশনারি ও খাতা-কলম
  | 'art_craft'           // আর্ট, পেইন্ট ও ক্রাফট উপকরণ
  | 'electronics_digital' // সাউন্ড সিস্টেম, প্রজেক্টর, ট্যাবলেট, ক্যামেরা
  | 'sports_play'         // ইনডোর ও আউটডোর খেলার সামগ্রী
  | 'medical_safety'      // প্রাথমিক চিকিৎসা কিট ও নিরাপত্তা সামগ্রী
  | 'furniture_fixtures'; // শিশু-বান্ধব টেবিল-চেয়ার ও বুকশেলফ

export type AssetCondition = 'excellent' | 'good' | 'needs_repair' | 'damaged';

export interface AssetCheckoutUsage {
  id: string;
  assetId: string;
  assetNameBn: string;
  checkedOutByTeacherNameBn: string;
  checkedOutByTeacherId?: string;
  className?: SchoolClass;
  purposeBn: string;
  borrowDateBn: string;
  borrowTimeBn: string;
  expectedReturnDateBn?: string;
  returnedDateBn?: string;
  status: 'active_borrowed' | 'returned';
  quantityBorrowed: number;
  remarksBn?: string;
}

export interface SchoolAssetItem {
  id: string;
  assetCode: string;
  nameBn: string;
  nameEn: string;
  category: AssetCategory;
  categoryBn: string;
  locationRoomBn: string;
  totalQuantity: number;
  availableQuantity: number;
  inUseQuantity: number;
  unitBn: string;
  condition: AssetCondition;
  conditionBn: string;
  purchaseDateBn?: string;
  costEstimateBdt?: number;
  photoUrl?: string;
  assignedTeacherNameBn?: string;
  lastAuditedDateBn?: string;
  maintenanceNoteBn?: string;
  activeUsages?: AssetCheckoutUsage[];
  lowStockThreshold?: number;
}

export type AssessmentType = 'written' | 'oral' | 'practical_activity' | 'creative_drawing';

export interface ExamScheduleItem {
  id: string;
  className: SchoolClass;
  examTitle: string;
  subject: string;
  examDate: string; // YYYY-MM-DD
  examDateBn?: string;
  dayNameBn: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  room: string;
  syllabusTopics: string;
  totalMarks: number;
  passMarks?: number;
  examinerTeacherNameBn: string;
  assessmentType: AssessmentType;
  instructionsBn?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ExamTerm {
  id: string;
  titleBn: string; // যেমন: "বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)", "১ম সাময়িক মূল্যায়ন ২০২৬"
  academicYear: string; // "২০২৬"
  termType: 'first_term' | 'second_term' | 'annual' | 'monthly';
  startDate: string;
  endDate: string;
  publishDateBn: string;
  isPublished: boolean;
}

export interface SubjectMark {
  subjectCode: string;
  subjectNameBn: string;
  totalMarks: number;
  passMarks: number;
  obtainedMarks: number;
  highestMarksInClass: number;
  letterGrade: string; // 'A+', 'A', 'A-', 'B', 'C', 'F'
  gradePoint: number; // 5.0, 4.0, 3.5, 3.0, 2.0, 0.0
  remarksBn?: string;
}

export interface ChildGrowthEntry {
  date: string; // e.g. '2026-10-15'
  dateBn: string; // e.g. '১৫ অক্টোবর ২০২৬'
  heightCm: number;
  weightKg: number;
  bmi: number;
  bmiStatusBn: string;
  notesBn?: string;
}

export interface VaccinationRecord {
  id: string;
  nameBn: string; // e.g. 'বিসিজি (BCG)', 'পেন্টাভ্যালেন্ট (Pentavalent)', 'পোলিও (OPV)', 'এমআর (MR)'
  doseLabelBn: string;
  isCompleted: boolean;
  administeredDateBn?: string;
  nextDueDateBn?: string;
  notesBn?: string;
}

export type AllergySeverity = 'critical' | 'moderate' | 'mild' | 'none';

export interface StudentAllergyItem {
  allergenBn: string;
  severity: AllergySeverity;
  reactionBn: string;
  actionGuideBn: string;
}

export interface StudentHealthProfile {
  studentId: string;
  studentNameBn: string;
  studentNameEn?: string;
  rollNo: string;
  className: SchoolClass;
  sectionBn: string;
  bloodGroup: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  bmiStatusBn: string;
  growthMilestoneBn: string;
  allergiesList: StudentAllergyItem[];
  criticalHealthAlertBn?: string;
  regularMedicationsBn?: string;
  emergencyDoctorNameBn?: string;
  emergencyDoctorPhone?: string;
  vaccinations: VaccinationRecord[];
  growthHistory: ChildGrowthEntry[];
  lastCheckedDateBn: string;
  updatedByTeacherBn: string;
  updatedAt: string;
}

export interface StudentExamResult {
  id: string;
  studentId: string;
  studentNameBn: string;
  studentNameEn?: string;
  rollNo: string;
  className: SchoolClass;
  sectionBn: string;
  examTermId: string;
  examTitleBn: string;
  academicYear: string;
  publishDateBn: string;
  subjects: SubjectMark[];
  totalMarks: number;
  totalObtained: number;
  percentage: number;
  gpa: number;
  overallGrade: string;
  meritPosition: number;
  status: 'passed' | 'needs_improvement';
  attendanceSummary?: {
    totalWorkingDays: number;
    presentDays: number;
    attendancePercentage: number;
  };
  coCurricularSkills?: {
    disciplineBn: string;
    cleanlinessBn: string;
    friendlinessBn: string;
    creativityBn: string;
  };
  classTeacherRemarksBn: string;
  principalRemarksBn: string;
  isPublished: boolean;
  updatedAt: string;
}


