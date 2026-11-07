import React, { useState, useEffect, useMemo } from 'react';
import {
  ClassRoutinePeriod,
  DayOfWeek,
  HomeworkSubmissionType,
  SchoolClass,
  UserRole,
  WeeklyClassProgressRecord,
} from '../types/school';
import {
  DAYS_OF_WEEK_CONFIG,
  STANDARD_SUBJECTS,
  CLASS_ROOMS,
} from '../data/mockRoutines';
import {
  getClassRoutines,
  saveClassRoutines,
  resetClassRoutines,
  updatePeriodLessonPlan,
  assignPeriodHomework,
  getTodayDayOfWeek,
  getDayNameBn,
  getPeriodLiveStatus,
  exportClassRoutineToCsv,
  downloadClassRoutineCsv,
  isFridayToday,
  ROUTINE_UPDATE_EVENT,
  LESSON_PLAN_QUICK_TEMPLATES,
  HOMEWORK_SUBMISSION_TYPES,
  HOMEWORK_QUICK_TEMPLATES,
  getHomeworkSubmissionTypeLabelBn,
  WEEK_OPTIONS,
  getClassWeeklyProgress,
  toggleWholeWeekStatus,
  togglePeriodCompletionInWeek,
  updateClassWeeklySummaryDetails,
  WEEKLY_PROGRESS_UPDATE_EVENT,
  detectTeacherOverlappingTimeSlots,
  findAllTeacherScheduleConflicts,
  suggestNextAvailableSlotForTeacher,
  parseTimeToMinutes,
  TeacherTimeSlotConflict,
  SCHOOL_RESOURCES,
  getResourceById,
  getResourceNamesBn,
  SchoolResourceItem,
} from '../utils/routineLogic';
import { getSchoolClassNameBn, isSameSchoolClass } from '../utils/schoolLogic';
import { SCHOOL_TEACHERS } from '../data/mockData';
import { ExamScheduleTab } from './ExamScheduleTab';
import {
  Calendar,
  Clock,
  BookOpen,
  UserCheck,
  Plus,
  Edit3,
  Trash2,
  FileSpreadsheet,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  RefreshCw,
  GraduationCap,
  MapPin,
  Coffee,
  FileText,
  Home,
  Target,
  Package,
  Eye,
  BarChart3,
  CheckSquare,
  Hourglass,
  ListChecks,
  ClipboardList,
} from 'lucide-react';

/**
 * Helper function in ClassRoutineModule that detects overlapping time slots
 * when a teacher attempts to schedule two classes simultaneously on the same day.
 */
export function detectOverlappingTimeSlots(
  routines: ClassRoutinePeriod[],
  candidatePeriod: {
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    teacherId?: string;
    teacherNameBn?: string;
    className?: SchoolClass | string;
    isBreak?: boolean;
  },
  excludePeriodId?: string
): TeacherTimeSlotConflict[] {
  return detectTeacherOverlappingTimeSlots(routines, candidatePeriod, excludePeriodId);
}

interface ClassRoutineModuleProps {
  currentRole: UserRole;
  initialClass?: SchoolClass;
  readOnly?: boolean;
}

const CLASS_OPTIONS: { id: SchoolClass; nameBn: string; color: string; badge: string }[] = [
  { id: 'HateKhori', nameBn: 'হাতেখড়ি (Pre-Play)', color: 'border-pink-300 bg-pink-50/50', badge: 'bg-pink-600' },
  { id: 'Play', nameBn: 'প্লে (Play)', color: 'border-emerald-300 bg-emerald-50/50', badge: 'bg-emerald-600' },
  { id: 'Nursery', nameBn: 'নার্সারি (Nursery)', color: 'border-teal-300 bg-teal-50/50', badge: 'bg-teal-600' },
  { id: 'KG', nameBn: 'কেজি (KG)', color: 'border-amber-300 bg-amber-50/50', badge: 'bg-amber-600' },
  { id: 'Class-1', nameBn: 'ওয়ান (Class 1)', color: 'border-indigo-300 bg-indigo-50/50', badge: 'bg-indigo-600' },
  { id: 'Class-2', nameBn: 'টু (Class 2)', color: 'border-purple-300 bg-purple-50/50', badge: 'bg-purple-600' },
];

export const ClassRoutineModule: React.FC<ClassRoutineModuleProps> = ({
  currentRole,
  initialClass = 'Nursery',
  readOnly = false,
}) => {
  const isAdmin =
    !readOnly &&
    (currentRole === 'super_admin' ||
      currentRole === 'principal' ||
      currentRole === 'director');

  const isTeacher = !readOnly && currentRole === 'teacher';
  const canEditLessonPlan = isAdmin || isTeacher;

  const [routines, setRoutines] = useState<ClassRoutinePeriod[]>(() => getClassRoutines());
  const [selectedClass, setSelectedClass] = useState<SchoolClass>(initialClass);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all' | 'today'>('today');
  const [teacherFilter, setTeacherFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [showOnlyHomeworkFilter, setShowOnlyHomeworkFilter] = useState<boolean>(false);
  const [showOnlyOverlappingFilter, setShowOnlyOverlappingFilter] = useState<boolean>(false);
  const [allowOverlapOverride, setAllowOverlapOverride] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDetailedLessonPlans, setShowDetailedLessonPlans] = useState<boolean>(true);

  // Weekly Summary View & Whole-Week Progress State
  const [activeRoutineTab, setActiveRoutineTab] = useState<'daily_routine' | 'weekly_summary' | 'exam_schedule'>('daily_routine');
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>('nov-2026-w1');
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyClassProgressRecord>(() =>
    getClassWeeklyProgress(initialClass, 'nov-2026-w1')
  );
  const [isWeeklySummaryEditModalOpen, setIsWeeklySummaryEditModalOpen] = useState<boolean>(false);
  const [weeklyEditForm, setWeeklyEditForm] = useState({
    status: 'completed' as 'completed' | 'pending',
    teacherSummaryNoteBn: '',
    parentActionNoteBn: '',
    keyHighlightsText: '',
  });

  // Add/Edit Period Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<ClassRoutinePeriod | null>(null);
  const [periodToDelete, setPeriodToDelete] = useState<ClassRoutinePeriod | null>(null);

  // Dedicated Teacher Homework Assignment Modal State
  const [homeworkModalPeriod, setHomeworkModalPeriod] = useState<ClassRoutinePeriod | null>(null);
  const [homeworkForm, setHomeworkForm] = useState({
    topicBn: '',
    homeworkAssignmentBn: '',
    homeworkDueDateBn: 'পরবর্তী ক্লাসে জমা',
    homeworkSubmissionType: 'written_notebook' as HomeworkSubmissionType,
  });

  // Dedicated Teacher Daily Lesson Plan Modal State
  const [lessonPlanModalPeriod, setLessonPlanModalPeriod] = useState<ClassRoutinePeriod | null>(null);
  const [lessonPlanForm, setLessonPlanForm] = useState({
    topicBn: '',
    lessonPlanSummaryBn: '',
    learningObjectivesBn: '',
    homeworkAssignmentBn: '',
    homeworkDueDateBn: 'পরবর্তী ক্লাসে জমা',
    homeworkSubmissionType: 'written_notebook' as HomeworkSubmissionType,
    homeworkOrActivityBn: '',
    materialsNeededBn: '',
    resources: [] as string[],
    bookedResourcesBn: '',
  });

  // View Full Lesson Plan Modal for Parents/Teachers
  const [viewingLessonPlanPeriod, setViewingLessonPlanPeriod] = useState<ClassRoutinePeriod | null>(null);

  // Full Period Form State
  const [formData, setFormData] = useState({
    className: initialClass,
    day: 'saturday' as DayOfWeek,
    periodNo: 1,
    periodLabelBn: '১ম পিরিয়ড',
    startTime: '09:00 AM',
    endTime: '09:40 AM',
    subjectBn: 'বাংলা ভাষা ও বর্ণমালা',
    teacherId: 'tch-2',
    teacherNameBn: 'ফাতেমা আক্তার',
    roomBn: 'রুম ১০৩',
    topicBn: '',
    resources: [] as string[],
    bookedResourcesBn: '',
    lessonPlanSummaryBn: '',
    learningObjectivesBn: '',
    homeworkAssignmentBn: '',
    homeworkDueDateBn: 'পরবর্তী ক্লাসে জমা',
    homeworkSubmissionType: 'written_notebook' as HomeworkSubmissionType,
    homeworkOrActivityBn: '',
    materialsNeededBn: '',
    isBreak: false,
  });

  // Keep weeklyProgress in sync when selectedClass or selectedWeekKey changes
  useEffect(() => {
    setWeeklyProgress(getClassWeeklyProgress(selectedClass, selectedWeekKey));
  }, [selectedClass, selectedWeekKey, routines]);

  // Sync across windows or other components
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEv = e as CustomEvent<{ routines: ClassRoutinePeriod[] }>;
      if (customEv.detail?.routines) {
        setRoutines(customEv.detail.routines);
      } else {
        setRoutines(getClassRoutines());
      }
      setWeeklyProgress(getClassWeeklyProgress(selectedClass, selectedWeekKey));
    };
    const handleWeeklySync = () => {
      setWeeklyProgress(getClassWeeklyProgress(selectedClass, selectedWeekKey));
    };
    window.addEventListener(ROUTINE_UPDATE_EVENT, handleSync);
    window.addEventListener(WEEKLY_PROGRESS_UPDATE_EVENT, handleWeeklySync);
    return () => {
      window.removeEventListener(ROUTINE_UPDATE_EVENT, handleSync);
      window.removeEventListener(WEEKLY_PROGRESS_UPDATE_EVENT, handleWeeklySync);
    };
  }, [selectedClass, selectedWeekKey]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Teacher / Admin 1-Click Whole Week Completed / Pending Toggle
  const handleMarkWholeWeek = (newStatus: 'completed' | 'pending') => {
    const actorBn = isAdmin ? 'প্রধান শিক্ষক / অ্যাডমিন' : 'শ্রেণি শিক্ষক';
    const updated = toggleWholeWeekStatus(selectedClass, selectedWeekKey, newStatus, actorBn);
    setWeeklyProgress(updated);
    showToast(
      newStatus === 'completed'
        ? `✅ ${getSchoolClassNameBn(selectedClass)}-এর সম্পূর্ণ সপ্তাহের পাঠ অগ্রগতি 'সম্পন্ন (Completed)' হিসেবে মার্ক করা হয়েছে!`
        : `⏳ ${getSchoolClassNameBn(selectedClass)}-এর সাপ্তাহিক পাঠ অগ্রগতি 'পেন্ডিং / চলমান (Pending)' হিসেবে আপডেট করা হয়েছে!`
    );
  };

  // Teacher / Admin Toggle Single Period Completion in Weekly Progress
  const handleTogglePeriodWeeklyCompletion = (periodId: string, subjectBn: string) => {
    if (!canEditLessonPlan) return;
    const actorBn = isAdmin ? 'প্রধান শিক্ষক / অ্যাডমিন' : 'শ্রেণি শিক্ষক';
    const updated = togglePeriodCompletionInWeek(selectedClass, selectedWeekKey, periodId, actorBn);
    setWeeklyProgress(updated);
    const isNowDone = updated.completedPeriodIds.includes(periodId);
    showToast(
      isNowDone
        ? `✓ "${subjectBn}" পিরিয়ডটি এই সপ্তাহের অগ্রগতিতে সম্পন্ন হিসেবে চিহ্নিত হয়েছে (${updated.completionPercentage}%)`
        : `⏳ "${subjectBn}" পিরিয়ডটি পেন্ডিং তালিকায় রাখা হয়েছে (${updated.completionPercentage}%)`
    );
  };

  // Open Weekly Summary Note Editor Modal for Teachers/Admins
  const handleOpenWeeklySummaryEditModal = () => {
    setWeeklyEditForm({
      status: weeklyProgress.status,
      teacherSummaryNoteBn: weeklyProgress.teacherSummaryNoteBn,
      parentActionNoteBn: weeklyProgress.parentActionNoteBn,
      keyHighlightsText: weeklyProgress.keyHighlightsBn.join('\n'),
    });
    setIsWeeklySummaryEditModalOpen(true);
  };

  // Save Weekly Summary Evaluation & Status
  const handleSaveWeeklySummaryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const actorBn = isAdmin ? 'প্রধান শিক্ষক / অ্যাডমিন' : 'শ্রেণি শিক্ষক';
    const parsedHighlights = weeklyEditForm.keyHighlightsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    // First apply whole week status if changed
    if (weeklyEditForm.status !== weeklyProgress.status) {
      toggleWholeWeekStatus(
        selectedClass,
        selectedWeekKey,
        weeklyEditForm.status,
        actorBn,
        weeklyEditForm.teacherSummaryNoteBn.trim(),
        weeklyEditForm.parentActionNoteBn.trim()
      );
    }

    const updated = updateClassWeeklySummaryDetails(selectedClass, selectedWeekKey, {
      status: weeklyEditForm.status,
      teacherSummaryNoteBn: weeklyEditForm.teacherSummaryNoteBn.trim(),
      parentActionNoteBn: weeklyEditForm.parentActionNoteBn.trim(),
      keyHighlightsBn:
        parsedHighlights.length > 0 ? parsedHighlights : weeklyProgress.keyHighlightsBn,
      updatedByBn: actorBn,
    });

    setWeeklyProgress(updated);
    setIsWeeklySummaryEditModalOpen(false);
    showToast('✅ সাপ্তাহিক অগ্রগতি সারসংক্ষেপ ও অভিভাবক নির্দেশনা সফলভাবে আপডেট করা হয়েছে!');
  };

  const todayDay = getTodayDayOfWeek();
  const effectiveDay = selectedDay === 'today' ? todayDay : selectedDay;

  // All non-break periods for the selected class across the entire week
  const allClassPeriodsForWeek = useMemo(() => {
    const dayOrder: Record<DayOfWeek, number> = {
      saturday: 1,
      sunday: 2,
      monday: 3,
      tuesday: 4,
      wednesday: 5,
      thursday: 6,
    };
    return routines
      .filter((r) => isSameSchoolClass(r.className, selectedClass) && !r.isBreak)
      .sort((a, b) => {
        if (a.day !== b.day) return dayOrder[a.day] - dayOrder[b.day];
        return a.periodNo - b.periodNo;
      });
  }, [routines, selectedClass]);

  // Subject-by-Subject Weekly Summary Aggregation for Parents
  const subjectWeeklySummaryList = useMemo(() => {
    const map = new Map<
      string,
      {
        subjectBn: string;
        teacherNameBn: string;
        totalPeriods: number;
        completedPeriods: number;
        topicsCovered: string[];
        homeworks: string[];
        summaries: string[];
      }
    >();

    for (const p of allClassPeriodsForWeek) {
      const key = p.subjectBn;
      const existing = map.get(key) || {
        subjectBn: p.subjectBn,
        teacherNameBn: p.teacherNameBn || 'নির্ধারিত শিক্ষক',
        totalPeriods: 0,
        completedPeriods: 0,
        topicsCovered: [],
        homeworks: [],
        summaries: [],
      };
      existing.totalPeriods += 1;
      if (
        weeklyProgress.status === 'completed' ||
        weeklyProgress.completedPeriodIds.includes(p.id)
      ) {
        existing.completedPeriods += 1;
      }
      const topic = p.topicBn || p.topic;
      if (topic && !existing.topicsCovered.includes(topic)) {
        existing.topicsCovered.push(topic);
      }
      const hwText = p.homeworkAssignmentBn || p.homeworkOrActivityBn;
      if (hwText && !existing.homeworks.includes(hwText)) {
        existing.homeworks.push(hwText);
      }
      if (p.lessonPlanSummaryBn && !existing.summaries.includes(p.lessonPlanSummaryBn)) {
        existing.summaries.push(p.lessonPlanSummaryBn);
      }
      map.set(key, existing);
    }

    return Array.from(map.values());
  }, [allClassPeriodsForWeek, weeklyProgress]);

  // Global Conflict Map: periodId -> TeacherTimeSlotConflict[] across all routines
  const routineConflictMap = useMemo(
    () => findAllTeacherScheduleConflicts(routines),
    [routines]
  );

  const totalOverlappingPeriodsCount = useMemo(
    () => routineConflictMap.size,
    [routineConflictMap]
  );

  // Real-time overlap detection for the Add/Edit Period Modal
  const activeFormSlotConflicts = useMemo(() => {
    const selectedTeacher = SCHOOL_TEACHERS.find((t) => t.id === formData.teacherId);
    const teacherNameBn = selectedTeacher ? selectedTeacher.nameBn : formData.teacherNameBn;
    return detectOverlappingTimeSlots(
      routines,
      {
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        teacherId: formData.teacherId,
        teacherNameBn,
        className: formData.className,
        isBreak: formData.isBreak,
      },
      editingPeriod?.id
    );
  }, [routines, formData, editingPeriod]);

  const isInvalidFormTimeRange = useMemo(() => {
    const startMin = parseTimeToMinutes(formData.startTime);
    const endMin = parseTimeToMinutes(formData.endTime);
    return startMin <= 0 || endMin <= startMin;
  }, [formData.startTime, formData.endTime]);

  const suggestedFreeSlot = useMemo(() => {
    const selectedTeacher = SCHOOL_TEACHERS.find((t) => t.id === formData.teacherId);
    const teacherNameBn = selectedTeacher ? selectedTeacher.nameBn : formData.teacherNameBn;
    return suggestNextAvailableSlotForTeacher(
      routines,
      formData.day,
      formData.teacherId,
      teacherNameBn,
      formData.className,
      40,
      editingPeriod?.id
    );
  }, [routines, formData, editingPeriod]);

  // All periods already scheduled for the currently selected teacher on formData.day (for visual timeline)
  const teacherSameDayScheduledPeriods = useMemo(() => {
    const selectedTeacher = SCHOOL_TEACHERS.find((t) => t.id === formData.teacherId);
    const targetName = (selectedTeacher ? selectedTeacher.nameBn : formData.teacherNameBn)
      .trim()
      .toLowerCase();
    return routines
      .filter((r) => {
        if (r.isBreak) return false;
        if (editingPeriod && r.id === editingPeriod.id) return false;
        if (r.day !== formData.day) return false;
        const idMatch = r.teacherId && r.teacherId === formData.teacherId;
        const nameMatch =
          r.teacherNameBn && r.teacherNameBn.trim().toLowerCase().includes(targetName);
        return Boolean(idMatch || nameMatch);
      })
      .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
  }, [routines, formData.teacherId, formData.teacherNameBn, formData.day, editingPeriod]);

  // Apply suggested conflict-free time slot in 1 click
  const handleApplySuggestedFreeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      startTime: suggestedFreeSlot.startTime,
      endTime: suggestedFreeSlot.endTime,
    }));
    setAllowOverlapOverride(false);
  };

  // Filtered Routine Periods
  const filteredPeriods = useMemo(() => {
    return routines
      .filter((r) => isSameSchoolClass(r.className, selectedClass))
      .filter((r) => {
        if (effectiveDay === 'all') return true;
        return r.day === effectiveDay;
      })
      .filter((r) => {
        if (teacherFilter === 'all') return true;
        return (
          r.teacherId === teacherFilter ||
          (r.teacherNameBn && r.teacherNameBn.includes(teacherFilter))
        );
      })
      .filter((r) => {
        if (resourceFilter === 'all') return true;
        if (r.isBreak) return false;
        return Array.isArray(r.resources) && r.resources.includes(resourceFilter);
      })
      .filter((r) => {
        if (!showOnlyHomeworkFilter) return true;
        if (r.isBreak) return false;
        const hw = r.homeworkAssignmentBn || r.homeworkOrActivityBn;
        return Boolean(hw && hw.trim().length > 0);
      })
      .filter((r) => {
        if (!showOnlyOverlappingFilter) return true;
        return routineConflictMap.has(r.id);
      })
      .sort((a, b) => {
        const dayOrder: Record<DayOfWeek, number> = {
          saturday: 1,
          sunday: 2,
          monday: 3,
          tuesday: 4,
          wednesday: 5,
          thursday: 6,
        };
        if (a.day !== b.day) return dayOrder[a.day] - dayOrder[b.day];
        return a.periodNo - b.periodNo;
      });
  }, [
    routines,
    selectedClass,
    effectiveDay,
    teacherFilter,
    resourceFilter,
    showOnlyHomeworkFilter,
    showOnlyOverlappingFilter,
    routineConflictMap,
  ]);

  const classPeriodsWithoutBreak = useMemo(
    () => filteredPeriods.filter((p) => !p.isBreak),
    [filteredPeriods]
  );

  const periodsWithLessonPlansCount = useMemo(
    () =>
      classPeriodsWithoutBreak.filter(
        (p) => p.lessonPlanSummaryBn && p.lessonPlanSummaryBn.trim().length > 0
      ).length,
    [classPeriodsWithoutBreak]
  );

  const periodsWithHomeworkCount = useMemo(
    () =>
      classPeriodsWithoutBreak.filter((p) => {
        const hw = p.homeworkAssignmentBn || p.homeworkOrActivityBn;
        return Boolean(hw && hw.trim().length > 0);
      }).length,
    [classPeriodsWithoutBreak]
  );

  // Open Dedicated Homework Assignment Modal for Teachers / Admins
  const handleOpenHomeworkModal = (period: ClassRoutinePeriod) => {
    setHomeworkModalPeriod(period);
    setHomeworkForm({
      topicBn: period.topicBn || period.topic || '',
      homeworkAssignmentBn: period.homeworkAssignmentBn || period.homeworkOrActivityBn || '',
      homeworkDueDateBn: period.homeworkDueDateBn || 'পরবর্তী ক্লাসে জমা',
      homeworkSubmissionType: period.homeworkSubmissionType || 'written_notebook',
    });
  };

  // Apply 1-Click Quick Homework Template
  const handleApplyHomeworkTemplate = (tplId: string) => {
    const found = HOMEWORK_QUICK_TEMPLATES.find((t) => t.id === tplId);
    if (!found) return;
    setHomeworkForm((prev) => ({
      ...prev,
      homeworkAssignmentBn: found.homeworkAssignmentBn,
      homeworkDueDateBn: found.homeworkDueDateBn,
      homeworkSubmissionType: found.homeworkSubmissionType,
    }));
  };

  // Save Teacher's Homework Assignment
  const handleSaveHomeworkAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkModalPeriod) return;

    const updatedList = assignPeriodHomework(homeworkModalPeriod.id, {
      topicBn: homeworkForm.topicBn.trim(),
      homeworkAssignmentBn: homeworkForm.homeworkAssignmentBn.trim(),
      homeworkDueDateBn: homeworkForm.homeworkDueDateBn.trim() || 'পরবর্তী ক্লাসে জমা',
      homeworkSubmissionType: homeworkForm.homeworkSubmissionType,
      assignedByBn: homeworkModalPeriod.teacherNameBn || 'শ্রেণি শিক্ষক',
    });

    setRoutines(updatedList);
    setHomeworkModalPeriod(null);
    showToast(
      `📚 "${homeworkModalPeriod.subjectBn}" ক্লাসের বাড়ির কাজ (Homework Assignment) সফলভাবে নির্ধারণ করা হয়েছে এবং অভিভাবক পোর্টালে প্রকাশিত হয়েছে!`
    );
  };

  // Open Dedicated Lesson Plan Modal for Teachers / Admins
  const handleOpenLessonPlanModal = (period: ClassRoutinePeriod) => {
    setLessonPlanModalPeriod(period);
    const hw = period.homeworkAssignmentBn || period.homeworkOrActivityBn || '';
    setLessonPlanForm({
      topicBn: period.topicBn || period.topic || '',
      lessonPlanSummaryBn: period.lessonPlanSummaryBn || '',
      learningObjectivesBn: period.learningObjectivesBn || '',
      homeworkAssignmentBn: hw,
      homeworkDueDateBn: period.homeworkDueDateBn || 'পরবর্তী ক্লাসে জমা',
      homeworkSubmissionType: period.homeworkSubmissionType || 'written_notebook',
      homeworkOrActivityBn: hw,
      materialsNeededBn: period.materialsNeededBn || '',
      resources: period.resources ? [...period.resources] : [],
      bookedResourcesBn: period.bookedResourcesBn || '',
    });
  };

  // Apply a Quick Template inside the Lesson Plan Modal
  const handleApplyLessonPlanTemplate = (tplId: string) => {
    const found = LESSON_PLAN_QUICK_TEMPLATES.find((t) => t.id === tplId);
    if (!found) return;
    setLessonPlanForm((prev) => ({
      ...prev,
      lessonPlanSummaryBn: found.summaryBn,
      learningObjectivesBn: found.objectivesBn,
      homeworkAssignmentBn: found.homeworkBn,
      homeworkDueDateBn: found.homeworkDueDateBn,
      homeworkSubmissionType: found.homeworkSubmissionType,
      homeworkOrActivityBn: found.homeworkBn,
      materialsNeededBn: found.materialsBn,
    }));
  };

  // Save Teacher's Daily Lesson Plan Summary & Homework Assignment
  const handleSaveLessonPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonPlanModalPeriod) return;

    const hwText = (
      lessonPlanForm.homeworkAssignmentBn ||
      lessonPlanForm.homeworkOrActivityBn ||
      ''
    ).trim();

    const updatedList = updatePeriodLessonPlan(lessonPlanModalPeriod.id, {
      topicBn: lessonPlanForm.topicBn.trim(),
      lessonPlanSummaryBn: lessonPlanForm.lessonPlanSummaryBn.trim(),
      learningObjectivesBn: lessonPlanForm.learningObjectivesBn.trim(),
      homeworkAssignmentBn: hwText,
      homeworkDueDateBn: lessonPlanForm.homeworkDueDateBn.trim() || 'পরবর্তী ক্লাসে জমা',
      homeworkSubmissionType: lessonPlanForm.homeworkSubmissionType,
      homeworkOrActivityBn: hwText,
      materialsNeededBn: lessonPlanForm.materialsNeededBn.trim(),
      resources: lessonPlanForm.resources,
      bookedResourcesBn: getResourceNamesBn(lessonPlanForm.resources),
      updatedByBn: lessonPlanModalPeriod.teacherNameBn || 'শ্রেণি শিক্ষক',
    });

    setRoutines(updatedList);
    setLessonPlanModalPeriod(null);
    showToast(
      `✅ "${lessonPlanModalPeriod.subjectBn}" ক্লাসের দৈনিক পাঠ পরিকল্পনা ও বুকিংকৃত রিসোর্স সংরক্ষিত হয়েছে!`
    );
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    const defaultDay = effectiveDay === 'all' ? 'saturday' : effectiveDay;
    const existingInClassDay = routines.filter(
      (r) => isSameSchoolClass(r.className, selectedClass) && r.day === defaultDay
    );
    const nextPeriodNo = existingInClassDay.length + 1;
    const defaultRoom = CLASS_ROOMS[selectedClass] || 'রুম ১০১';

    setEditingPeriod(null);
    setAllowOverlapOverride(false);
    setFormData({
      className: selectedClass,
      day: defaultDay,
      periodNo: nextPeriodNo,
      periodLabelBn: `${nextPeriodNo}ম পিরিয়ড`,
      startTime: '09:00 AM',
      endTime: '09:40 AM',
      subjectBn: 'বাংলা ভাষা ও বর্ণমালা',
      teacherId: 'tch-2',
      teacherNameBn: 'ফাতেমা আক্তার',
      roomBn: defaultRoom,
      topicBn: '',
      resources: [],
      bookedResourcesBn: '',
      lessonPlanSummaryBn: '',
      learningObjectivesBn: '',
      homeworkAssignmentBn: '',
      homeworkDueDateBn: 'পরবর্তী ক্লাসে জমা',
      homeworkSubmissionType: 'written_notebook',
      homeworkOrActivityBn: '',
      materialsNeededBn: '',
      isBreak: false,
    });
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (period: ClassRoutinePeriod) => {
    setEditingPeriod(period);
    setAllowOverlapOverride(false);
    const hw = period.homeworkAssignmentBn || period.homeworkOrActivityBn || '';
    setFormData({
      className: period.className,
      day: period.day,
      periodNo: period.periodNo,
      periodLabelBn: period.periodLabelBn,
      startTime: period.startTime,
      endTime: period.endTime,
      subjectBn: period.subjectBn,
      teacherId: period.teacherId || 'tch-2',
      teacherNameBn: period.teacherNameBn,
      roomBn: period.roomBn,
      topicBn: period.topicBn || '',
      resources: period.resources ? [...period.resources] : [],
      bookedResourcesBn: period.bookedResourcesBn || '',
      lessonPlanSummaryBn: period.lessonPlanSummaryBn || '',
      learningObjectivesBn: period.learningObjectivesBn || '',
      homeworkAssignmentBn: hw,
      homeworkDueDateBn: period.homeworkDueDateBn || 'পরবর্তী ক্লাসে জমা',
      homeworkSubmissionType: period.homeworkSubmissionType || 'written_notebook',
      homeworkOrActivityBn: hw,
      materialsNeededBn: period.materialsNeededBn || '',
      isBreak: Boolean(period.isBreak),
    });
    setIsAddEditModalOpen(true);
  };

  // Submit Add or Edit (with Overlapping Teacher Time Slot Guard)
  const handleSubmitAddEdit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isInvalidFormTimeRange) {
      showToast('⚠️ ক্লাসের শেষের সময় অবশ্যই শুরুর সময়ের পরে হতে হবে!');
      return;
    }

    if (activeFormSlotConflicts.length > 0 && !allowOverlapOverride) {
      showToast(
        `⚠️ সময়সূচি ওভারল্যাপ সনাক্ত হয়েছে! ${activeFormSlotConflicts[0].conflictReasonBn}`
      );
      return;
    }

    const selectedTeacher = SCHOOL_TEACHERS.find((t) => t.id === formData.teacherId);
    const finalTeacherName = selectedTeacher ? selectedTeacher.nameBn : formData.teacherNameBn;
    const nowStr = `আজ ${new Date().toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    const hwText = (formData.homeworkAssignmentBn || formData.homeworkOrActivityBn || '').trim();
    const bookedResBn = getResourceNamesBn(formData.resources);

    if (editingPeriod) {
      const updated = routines.map((r) =>
        r.id === editingPeriod.id
          ? {
              ...r,
              ...formData,
              resources: formData.resources,
              bookedResourcesBn: bookedResBn,
              subject: formData.subjectBn,
              room: formData.roomBn,
              topic: formData.topicBn,
              teacherNameBn: finalTeacherName,
              homeworkAssignmentBn: hwText,
              homeworkOrActivityBn: hwText,
              homeworkAssignedByBn: finalTeacherName,
              homeworkAssignedAtBn: nowStr,
              lessonPlanUpdatedAtBn: nowStr,
              lessonPlanUpdatedByBn: finalTeacherName,
            }
          : r
      );
      setRoutines(updated);
      saveClassRoutines(updated);
      showToast(
        activeFormSlotConflicts.length > 0
          ? '⚠️ ওভারল্যাপ ওভাররাইডসহ ক্লাস রুটিন আপডেট করা হয়েছে (কার্ডে লাল হাইলাইট দেখুন)।'
          : '✅ ক্লাস রুটিন, রিসোর্স বুকিং ও বাড়ির কাজ সফলভাবে আপডেট করা হয়েছে!'
      );
    } else {
      const newPeriod: ClassRoutinePeriod = {
        id: `rtn-${Date.now()}`,
        ...formData,
        resources: formData.resources,
        bookedResourcesBn: bookedResBn,
        subject: formData.subjectBn,
        room: formData.roomBn,
        topic: formData.topicBn,
        teacherNameBn: finalTeacherName,
        homeworkAssignmentBn: hwText,
        homeworkOrActivityBn: hwText,
        homeworkAssignedByBn: finalTeacherName,
        homeworkAssignedAtBn: nowStr,
        lessonPlanUpdatedAtBn: nowStr,
        lessonPlanUpdatedByBn: finalTeacherName,
      };
      const updated = [...routines, newPeriod];
      setRoutines(updated);
      saveClassRoutines(updated);
      showToast(
        activeFormSlotConflicts.length > 0
          ? '⚠️ ওভারল্যাপ ওভাররাইডসহ নতুন পিরিয়ড যুক্ত হয়েছে (কার্ডে লাল ওভারল্যাপ সতর্কতা হাইলাইট করা হয়েছে)।'
          : '✅ নতুন ক্লাস রুটিন পিরিয়ড ও সম্পদ বুকিং সফলভাবে তৈরি করা হয়েছে!'
      );
    }

    setIsAddEditModalOpen(false);
  };

  // Delete Period
  const handleConfirmDelete = () => {
    if (!periodToDelete) return;
    const updated = routines.filter((r) => r.id !== periodToDelete.id);
    setRoutines(updated);
    saveClassRoutines(updated);
    setPeriodToDelete(null);
    showToast('🗑️ পিরিয়ডটি রুটিন থেকে মুছে ফেলা হয়েছে।');
  };

  // Reset to default
  const handleResetRoutines = () => {
    const resetted = resetClassRoutines();
    setRoutines(resetted);
    showToast('🔄 সকল ক্লাস রুটিন ও পাঠ পরিকল্পনা ডিফল্ট অবস্থায় রিসেট করা হয়েছে!');
  };

  // CSV Export
  const handleExportCsv = () => {
    const csv = exportClassRoutineToCsv(routines, selectedClass);
    const filename = `ananda_pathshala_routine_lesson_plans_${selectedClass.toLowerCase()}_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    downloadClassRoutineCsv(csv, filename);
    showToast('📥 ক্লাস রুটিন ও পাঠ পরিকল্পনা সফলভাবে CSV ফরম্যাটে ডাউনলোড হয়েছে!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in print:hidden max-w-md">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Routine & Daily Lesson Plan Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-sm border border-emerald-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-5 print:hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Clock className="w-3.5 h-3.5" />
              একাডেমিক ক্লাস রুটিন ও দৈনিক পাঠ পরিকল্পনা ২০২৬-২০২৭
            </span>
            <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {isAdmin
                ? '👑 অ্যাডমিন রুটিন ও লেসন প্ল্যান কন্ট্রোল'
                : isTeacher
                ? '👩‍🏫 শিক্ষক পাঠ পরিকল্পনা (Lesson Plan) এডিটর'
                : '👨‍👩‍👧 অভিভাবক ক্লাস রুটিন ও পাঠ পরিকল্পনা ভিউ'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            ক্লাস ভিত্তিক রুটিন ও দৈনিক পাঠ পরিকল্পনা (Daily Lesson Plans)
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
            {canEditLessonPlan
              ? 'প্রতিটি নির্ধারিত ক্লাসের জন্য সংক্ষিপ্ত দৈনিক পাঠ পরিকল্পনা সারসংক্ষেপ (Lesson Plan Summary), শিখনফল ও বাসার অনুশীলন যুক্ত করুন — যা অভিভাবকগণ তাদের পোর্টালে সরাসরি দেখতে পারবেন।'
              : 'আপনার সন্তানের প্রতিটি ক্লাসে আজ কী পড়ানো হবে, শিখনফল কী এবং বাসায় কী অনুশীলন করাতে হবে তার বিস্তারিত দৈনিক পাঠ পরিকল্পনা একনজরে দেখুন।'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {canEditLessonPlan && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ নতুন পিরিয়ড যুক্ত / শিডিউল করুন</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold rounded-xl text-xs border border-white/20 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="বর্তমান শ্রেণির রুটিন ও পাঠ পরিকল্পনা CSV ফরম্যাটে ডাউনলোড করুন"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>CSV রুটিন ও লেসন প্ল্যান</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
            title="ক্লাস রুটিন ও পাঠ পরিকল্পনা প্রিন্ট করুন"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>প্রিন্ট</span>
          </button>

          {canEditLessonPlan && (
            <button
              type="button"
              onClick={handleResetRoutines}
              className="px-3 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold rounded-xl text-xs border border-rose-500/30 transition flex items-center gap-1 cursor-pointer"
              title="ডিফল্ট রুটিনে রিসেট"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          )}
        </div>
      </div>

      {/* Role-Specific Guidance Strip for Teachers or Parents */}
      <div
        className={`rounded-2xl border p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 print:hidden ${
          canEditLessonPlan
            ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
              canEditLessonPlan
                ? 'bg-indigo-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-xs">
            <h3 className="font-black text-sm">
              {canEditLessonPlan
                ? '📚 শিক্ষকদের জন্য বাড়ির কাজ, পাঠ পরিকল্পনা ও সময়সূচি ওভারল্যাপ চেকার প্যানেল'
                : '📚 অভিভাবকদের জন্য প্রতিদিনের নির্ধারিত বাড়ির কাজ (Homework Assignment) ও পাঠ পরিকল্পনা ড্যাশবোর্ড'}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {canEditLessonPlan
                ? 'নতুন পিরিয়ড শিডিউল করার সময় কোনো শিক্ষকের একই সময়ে দুটি ক্লাস পড়ে গেলে স্বয়ংক্রিয় ওভারল্যাপ ডিটেক্টর তা লাল রঙে হাইলাইট করে সতর্ক করবে এবং পরবর্তী ফাঁকা স্লট সাজেস্ট করবে।'
                : 'শ্রেণি শিক্ষিকা প্রতিটি ক্লাসে কী পাঠদান করছেন এবং কোন বিষয়ে কী বাড়ির কাজ (Homework Assignment) দিয়েছেন তা প্রতিটি পিরিয়ড কার্ডে সরাসরি যুক্ত করা হয়েছে।'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
          {/* Live Teacher Schedule Conflict Status Badge */}
          {totalOverlappingPeriodsCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowOnlyOverlappingFilter((prev) => !prev)}
              className={`text-xs font-black px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                showOnlyOverlappingFilter
                  ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
              }`}
              title="ওভারল্যাপ হওয়া ক্লাসগুলো ফিল্টার করে দেখুন"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                {showOnlyOverlappingFilter
                  ? '✓ সব ক্লাস দেখুন'
                  : `⚠️ সময় ওভারল্যাপ: ${totalOverlappingPeriodsCount}টি পিরিয়ড`}
              </span>
            </button>
          ) : (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>ওভারল্যাপ মুক্ত শিডিউল</span>
            </span>
          )}

          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 shadow-2xs flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5 text-amber-700" />
            <span>
              বাড়ির কাজ (Homework): <strong>{periodsWithHomeworkCount}</strong> / {classPeriodsWithoutBreak.length} ক্লাস
            </span>
          </span>
          <button
            type="button"
            onClick={() => setShowOnlyHomeworkFilter((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              showOnlyHomeworkFilter
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs'
                : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300'
            }`}
          >
            {showOnlyHomeworkFilter ? '✓ সব ক্লাস দেখুন' : '📚 শুধু বাড়ির কাজ দেখুন'}
          </button>
          <button
            type="button"
            onClick={() => setShowDetailedLessonPlans((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
          >
            {showDetailedLessonPlans ? 'সংক্ষিপ্ত ভিউ' : 'বিস্তারিত ভিউ'}
          </button>
        </div>
      </div>

      {/* Class Selector Cards */}
      <div className="space-y-2 print:hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            শ্রেণি নির্বাচন করুন:
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            বর্তমান শ্রেণি: {getSchoolClassNameBn(selectedClass)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CLASS_OPTIONS.map((cls) => {
            const isSelected = isSameSchoolClass(selectedClass, cls.id);
            const classCount = routines.filter((r) => isSameSchoolClass(r.className, cls.id)).length;

            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClass(cls.id)}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? `${cls.color} shadow-xs ring-2 ring-emerald-500/20 bg-white`
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500">{cls.id}</span>
                  <span className={`text-[10px] font-black font-mono px-2 py-0.2 rounded-full text-white ${cls.badge}`}>
                    {classCount} পিরিয়ড
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 mt-1.5 truncate">
                  {cls.nameBn}
                </h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Persistent Weekly Progress Status & Whole-Week Completion Control Bar (For Parents & Teachers) */}
      <div
        className={`rounded-3xl border-2 p-4 sm:p-5 shadow-2xs transition-all space-y-4 ${
          weeklyProgress.status === 'completed'
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50/80 to-white border-emerald-300'
            : 'bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-white border-amber-300'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black bg-slate-900 text-white">
                <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
                <span>সাপ্তাহিক পাঠ অগ্রগতি ট্র্যাকার (Weekly Progress Summary)</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                  weeklyProgress.status === 'completed'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                    : 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs'
                }`}
              >
                {weeklyProgress.status === 'completed' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ সম্পূর্ণ সপ্তাহের পাঠ সম্পন্ন (Completed)</span>
                  </>
                ) : (
                  <>
                    <Hourglass className="w-3.5 h-3.5" />
                    <span>⏳ সপ্তাহের পাঠ চলমান / পেন্ডিং (Pending)</span>
                  </>
                )}
              </span>

              <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                {weeklyProgress.weekLabelBn}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {getSchoolClassNameBn(selectedClass)} — সাপ্তাহিক পাঠ ও অনুশীলন অগ্রগতি:{' '}
              <span
                className={
                  weeklyProgress.status === 'completed' ? 'text-emerald-700' : 'text-amber-700'
                }
              >
                {weeklyProgress.completionPercentage}% সম্পন্ন
              </span>
            </h3>

            <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
              <strong>শিক্ষকের সাপ্তাহিক নোট:</strong> {weeklyProgress.teacherSummaryNoteBn}
            </p>
          </div>

          {/* Right Controls: View Switcher Tabs & Teacher Whole-Week Completed/Pending Buttons */}
          <div className="flex flex-col sm:items-end gap-2.5 shrink-0 print:hidden">
            {/* Primary View Mode Tabs: Daily Routine vs Weekly Summary View */}
            <div className="inline-flex p-1 rounded-2xl bg-slate-900/95 text-white shadow-xs self-start sm:self-end">
              <button
                type="button"
                onClick={() => setActiveRoutineTab('daily_routine')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  activeRoutineTab === 'daily_routine'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>দৈনিক রুটিন ভিউ</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRoutineTab('weekly_summary')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  activeRoutineTab === 'weekly_summary'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>📊 সাপ্তাহিক সারসংক্ষেপ ভিউ (Weekly Summary)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRoutineTab('exam_schedule')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  activeRoutineTab === 'exam_schedule'
                    ? 'bg-purple-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>📝 পরীক্ষার সময়সূচি (Exam Schedule)</span>
              </button>
            </div>

            {/* Teacher / Admin 1-Click Whole Week Completed / Pending Action Buttons */}
            {canEditLessonPlan && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkWholeWeek('completed')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer border ${
                    weeklyProgress.status === 'completed'
                      ? 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-400/40'
                      : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ সম্পূর্ণ সপ্তাহ &lsquo;সম্পন্ন&rsquo; মার্ক করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkWholeWeek('pending')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer border ${
                    weeklyProgress.status === 'pending'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-400/40'
                      : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300'
                  }`}
                >
                  <Hourglass className="w-4 h-4" />
                  <span>⏳ সম্পূর্ণ সপ্তাহ &lsquo;পেন্ডিং&rsquo; মার্ক করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenWeeklySummaryEditModal}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>সাপ্তাহিক নোট সম্পাদনা</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar & Metadata Strip */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-3 bg-white/90 rounded-full overflow-hidden border border-slate-200 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                weeklyProgress.status === 'completed'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${Math.max(8, weeklyProgress.completionPercentage)}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
            <span>
              🏠 <strong className="text-slate-900">অভিভাবকের জন্য সাপ্তাহিক পরামর্শ:</strong>{' '}
              {weeklyProgress.parentActionNoteBn}
            </span>
            <span className="font-semibold text-slate-500">
              সর্বশেষ আপডেট: {weeklyProgress.updatedByBn} ({weeklyProgress.updatedAtBn})
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VIEW 1: WEEKLY SUMMARY VIEW FOR PARENTS & TEACHERS                     */}
      {/* ===================================================================== */}
      {activeRoutineTab === 'weekly_summary' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Week Selector Bar & Quick Status Filter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>সপ্তাহ নির্বাচন করুন:</span>
              </span>
              {WEEK_OPTIONS.map((wk) => {
                const isSelected = selectedWeekKey === wk.key;
                const wkRecord = getClassWeeklyProgress(selectedClass, wk.key);
                return (
                  <button
                    key={wk.key}
                    type="button"
                    onClick={() => setSelectedWeekKey(wk.key)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{wk.labelBn}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        wkRecord.status === 'completed'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-400 text-slate-950'
                      }`}
                    >
                      {wkRecord.status === 'completed' ? '✓ সম্পন্ন' : '⏳ পেন্ডিং'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveRoutineTab('daily_routine')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                ← দৈনিক রুটিনে ফিরে যান
              </button>
            </div>
          </div>

          {/* Whole-Week Overview Hero Card for Parents */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-indigo-50 text-indigo-800 border border-indigo-200">
                    📊 অভিভাবক সাপ্তাহিক ড্যাশবোর্ড ভিউ
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {weeklyProgress.weekLabelBn}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {getSchoolClassNameBn(selectedClass)} — সম্পূর্ণ সপ্তাহের পাঠ ও অগ্রগতি সারসংক্ষেপ
                </h3>
                <p className="text-xs text-slate-500">
                  এই সপ্তাহে শ্রেণিকক্ষে পঠিত সকল বিষয়, সম্পন্ন পিরিয়ড সংখ্যা এবং বাসায় অনুশীলনের সমন্বিত রিপোর্ট
                </p>
              </div>

              {/* Status Pill & Teacher Toggle Box */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    সাপ্তাহিক অগ্রগতি স্ট্যাটাস
                  </span>
                  <span
                    className={`text-sm font-black flex items-center gap-1.5 mt-0.5 ${
                      weeklyProgress.status === 'completed'
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {weeklyProgress.status === 'completed' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>সম্পন্ন (Completed — ১০০%)</span>
                      </>
                    ) : (
                      <>
                        <Hourglass className="w-4 h-4 text-amber-600" />
                        <span>পেন্ডিং / চলমান ({weeklyProgress.completionPercentage}%)</span>
                      </>
                    )}
                  </span>
                </div>

                {canEditLessonPlan && (
                  <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                    <button
                      type="button"
                      onClick={() =>
                        handleMarkWholeWeek(
                          weeklyProgress.status === 'completed' ? 'pending' : 'completed'
                        )
                      }
                      className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                        weeklyProgress.status === 'completed'
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      {weeklyProgress.status === 'completed'
                        ? '⏳ পেন্ডিং হিসেবে পরিবর্তন করুন'
                        : '✓ পুরো সপ্তাহ সম্পন্ন মার্ক করুন'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 4 Key Weekly KPI Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 block">
                  সাপ্তাহিক পাঠ অগ্রগতি হার
                </span>
                <div className="text-2xl font-black text-emerald-950 font-mono">
                  {weeklyProgress.completionPercentage}%
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold block">
                  স্ট্যাটাস:{' '}
                  {weeklyProgress.status === 'completed' ? 'সম্পূর্ণ সম্পন্ন ✓' : 'চলমান / পেন্ডিং ⏳'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                <span className="text-[11px] font-bold text-indigo-800 block">
                  সপ্তাহের মোট নির্ধারিত ক্লাস
                </span>
                <div className="text-2xl font-black text-indigo-950 font-mono">
                  {allClassPeriodsForWeek.length} টি পিরিয়ড
                </div>
                <span className="text-[11px] text-indigo-700 font-semibold block">
                  শনিবার থেকে বৃহস্পতিবার (৬ কার্যদিবস)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1">
                <span className="text-[11px] font-bold text-teal-800 block">
                  পঠিত বিষয়ের সংখ্যা
                </span>
                <div className="text-2xl font-black text-teal-950 font-mono">
                  {subjectWeeklySummaryList.length} টি বিষয়
                </div>
                <span className="text-[11px] text-teal-700 font-semibold block">
                  প্রতিটি বিষয়ের পাঠ পরিকল্পনা সংযুক্ত
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                <span className="text-[11px] font-bold text-amber-900 block">
                  সর্বশেষ মূল্যায়ন ও আপডেট
                </span>
                <div className="text-sm font-black text-amber-950 truncate">
                  {weeklyProgress.updatedByBn}
                </div>
                <span className="text-[11px] text-amber-800 font-semibold block">
                  সময়: {weeklyProgress.updatedAtBn}
                </span>
              </div>
            </div>

            {/* Teacher's Weekly Summary Note, Key Highlights & Parent Weekend Guidance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>শিক্ষকের সাপ্তাহিক মূল্যায়ন সারসংক্ষেপ</span>
                  </span>
                  {canEditLessonPlan && (
                    <button
                      type="button"
                      onClick={handleOpenWeeklySummaryEditModal}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      সম্পাদনা
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {weeklyProgress.teacherSummaryNoteBn}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-emerald-700" />
                  <span>এই সপ্তাহের মূল শিখন অর্জনসমূহ (Key Highlights)</span>
                </span>
                <ul className="space-y-1.5 text-xs text-emerald-950">
                  {weeklyProgress.keyHighlightsBn.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2">
                <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-amber-700" />
                  <span>অভিভাবকদের জন্য সাপ্তাহিক বাসার অনুশীলন গাইড</span>
                </span>
                <p className="text-xs text-amber-950 leading-relaxed font-medium">
                  {weeklyProgress.parentActionNoteBn}
                </p>
              </div>
            </div>
          </div>

          {/* Subject-by-Subject Weekly Summary Cards for Parents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-700" />
                  <span>বিষয়ভিত্তিক সাপ্তাহিক পাঠ ও হোমওয়ার্ক সারসংক্ষেপ ({subjectWeeklySummaryList.length}টি বিষয়)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  সপ্তাহজুড়ে প্রতিটি বিষয়ে কী কী টপিক পড়ানো হয়েছে এবং বাসায় কী অনুশীলন করাবেন তার বিষয়ভিত্তিক তালিকা
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectWeeklySummaryList.map((subj) => {
                const isSubjComplete =
                  subj.totalPeriods > 0 && subj.completedPeriods === subj.totalPeriods;
                const subjPercent =
                  subj.totalPeriods > 0
                    ? Math.round((subj.completedPeriods / subj.totalPeriods) * 100)
                    : 0;

                return (
                  <div
                    key={subj.subjectBn}
                    className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{subj.subjectBn}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <UserCheck className="w-3 h-3 text-indigo-600" />
                            <span>শিক্ষক: {subj.teacherNameBn}</span>
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                            isSubjComplete
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {subj.completedPeriods}/{subj.totalPeriods} পিরিয়ড সম্পন্ন ({subjPercent}%)
                        </span>
                      </div>

                      {subj.topicsCovered.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1 text-xs">
                          <span className="font-bold text-indigo-950 block text-[11px]">
                            📖 সপ্তাহের পঠিত টপিকসমূহ:
                          </span>
                          <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px]">
                            {subj.topicsCovered.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {subj.summaries.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-[11px]">
                          <span className="font-bold text-slate-800 block">
                            📝 সাপ্তাহিক পাঠ সারসংক্ষেপ:
                          </span>
                          <p className="text-slate-600 leading-relaxed line-clamp-3">
                            {subj.summaries.join(' · ')}
                          </p>
                        </div>
                      )}

                      {subj.homeworks.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 space-y-1 text-[11px]">
                          <span className="font-bold text-amber-950 block">
                            🏠 বাসার অনুশীলন (অভিভাবক নোট):
                          </span>
                          <p className="text-amber-900 leading-relaxed">
                            {subj.homeworks.join(' | ')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isSubjComplete ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.max(10, subjPercent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day-by-Day (Saturday - Thursday) Weekly Progress Checklist */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-700" />
                  <span>বার-ভিত্তিক (শনিবার — বৃহস্পতিবার) সাপ্তাহিক ক্লাস ও অগ্রগতি তালিকা</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {canEditLessonPlan
                    ? 'শিক্ষকগণ প্রতিটি পিরিয়ডের পাশে ক্লিক করে সম্পন্ন/পেন্ডিং চিহ্নিত করতে পারেন অথবা উপরের বাটনে পুরো সপ্তাহ এক ক্লিকে সম্পন্ন করতে পারেন।'
                    : 'সপ্তাহের কোন দিন কোন ক্লাস সম্পন্ন হয়েছে এবং কী পড়ানো হয়েছে তার ধারাবাহিক তালিকা।'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {DAYS_OF_WEEK_CONFIG.map((dayObj) => {
                const dayPeriods = allClassPeriodsForWeek.filter((p) => p.day === dayObj.id);
                const completedInDay = dayPeriods.filter(
                  (p) =>
                    weeklyProgress.status === 'completed' ||
                    weeklyProgress.completedPeriodIds.includes(p.id)
                ).length;
                const isDayAllCompleted =
                  dayPeriods.length > 0 && completedInDay === dayPeriods.length;

                return (
                  <div
                    key={dayObj.id}
                    className="rounded-2xl border border-slate-200 overflow-hidden"
                  >
                    <div
                      className={`px-4 py-2.5 flex items-center justify-between text-xs font-bold ${
                        isDayAllCompleted
                          ? 'bg-emerald-50/90 text-emerald-950 border-b border-emerald-200'
                          : 'bg-slate-50 text-slate-800 border-b border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm">{dayObj.nameBn}</span>
                        <span className="text-[11px] text-slate-500">
                          ({dayPeriods.length}টি ক্লাস পিরিয়ড)
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                          isDayAllCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-200 text-amber-950'
                        }`}
                      >
                        {isDayAllCompleted
                          ? '✓ দিনের সকল পাঠ সম্পন্ন'
                          : `${completedInDay}/${dayPeriods.length} পিরিয়ড সম্পন্ন`}
                      </span>
                    </div>

                    {dayPeriods.length === 0 ? (
                      <div className="p-4 text-xs text-slate-400 italic">
                        এই দিনে কোনো ক্লাস নির্ধারিত নেই।
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {dayPeriods.map((period) => {
                          const isPeriodDone =
                            weeklyProgress.status === 'completed' ||
                            weeklyProgress.completedPeriodIds.includes(period.id);

                          return (
                            <div
                              key={period.id}
                              className="p-3.5 sm:px-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/70 transition"
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                                    {period.periodLabelBn} ({period.startTime} - {period.endTime})
                                  </span>
                                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                                    {period.subjectBn}
                                  </h4>
                                  <span className="text-[11px] text-slate-500">
                                    · শিক্ষক: {period.teacherNameBn}
                                  </span>
                                </div>

                                {(period.topicBn || period.topic) && (
                                  <p className="text-xs font-bold text-indigo-900">
                                    📖 টপিক: {period.topicBn || period.topic}
                                  </p>
                                )}

                                {period.lessonPlanSummaryBn && (
                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    📝 <strong>সারসংক্ষেপ:</strong> {period.lessonPlanSummaryBn}
                                  </p>
                                )}

                                {(period.homeworkAssignmentBn || period.homeworkOrActivityBn) && (
                                  <div className="mt-1 p-2 rounded-xl bg-amber-50/90 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                    <span className="text-amber-950 font-semibold">
                                      📚 <strong>বাড়ির কাজ (Homework):</strong>{' '}
                                      {period.homeworkAssignmentBn || period.homeworkOrActivityBn}
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-900 font-bold text-[10px]">
                                        {getHomeworkSubmissionTypeLabelBn(period.homeworkSubmissionType)}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950 font-bold text-[10px]">
                                        জমা: {period.homeworkDueDateBn || 'পরবর্তী ক্লাসে জমা'}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {period.resources && period.resources.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1 pt-1 border-t border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-500">
                                      🏫 রিসোর্স:
                                    </span>
                                    {period.resources.map((resId) => {
                                      const res = getResourceById(resId);
                                      return (
                                        <span
                                          key={resId}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-900"
                                          title={res?.descriptionBn}
                                        >
                                          <span>{res?.icon || '📦'}</span>
                                          <span>{res?.nameBn.split(' (')[0] || resId}</span>
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                                {canEditLessonPlan ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleTogglePeriodWeeklyCompletion(
                                          period.id,
                                          period.subjectBn
                                        )
                                      }
                                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer border ${
                                        isPeriodDone
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                          : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                      }`}
                                    >
                                      {isPeriodDone ? (
                                        <>
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>✓ সম্পন্ন (পেন্ডিং করতে ক্লিক)</span>
                                        </>
                                      ) : (
                                        <>
                                          <Hourglass className="w-3.5 h-3.5 text-amber-600" />
                                          <span>⏳ পেন্ডিং (সম্পন্ন মার্ক করুন)</span>
                                        </>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenHomeworkModal(period)}
                                      className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[11px] transition cursor-pointer flex items-center gap-1 border border-amber-300"
                                      title="বাড়ির কাজ (Homework Assignment) নির্ধারণ করুন"
                                    >
                                      <ClipboardList className="w-3.5 h-3.5 text-amber-800" />
                                      <span>বাড়ির কাজ</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenLessonPlanModal(period)}
                                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer"
                                      title="পাঠ পরিকল্পনা সম্পাদনা করুন"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 ${
                                      isPeriodDone
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                                    }`}
                                  >
                                    {isPeriodDone ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>✓ পাঠ সম্পন্ন</span>
                                      </>
                                    ) : (
                                      <>
                                        <Hourglass className="w-3.5 h-3.5 text-amber-600" />
                                        <span>⏳ পেন্ডিং / চলমান</span>
                                      </>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeRoutineTab === 'exam_schedule' ? (
        <div className="animate-in fade-in duration-200">
          <ExamScheduleTab
            currentRole={currentRole}
            canEdit={canEditLessonPlan}
            selectedClass={selectedClass}
            onSelectClass={(cls) => setSelectedClass(cls)}
            onNavigateBackToRoutine={() => setActiveRoutineTab('daily_routine')}
          />
        </div>
      ) : (
        <>
          {/* ===================================================================== */}
          {/* VIEW 2: DAILY / SCHEDULE ROUTINE VIEW                                 */}
          {/* ===================================================================== */}
          {/* Day Selector & Teacher Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs space-y-3 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Day Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedDay('today')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    selectedDay === 'today'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>আজকের রুটিন ({getDayNameBn(todayDay)})</span>
                </button>

                {DAYS_OF_WEEK_CONFIG.map((d) => {
                  const isSelected = selectedDay === d.id;
                  const isToday = d.id === todayDay;

                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDay(d.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{d.nameBn}</span>
                      {isToday && <span className="text-[10px] opacity-75 ml-1">(আজ)</span>}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setSelectedDay('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    selectedDay === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>সাপ্তাহিক শিডিউল</span>
                </button>
              </div>

              {/* Filter Controls: Teacher & Booked School Resource */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {/* Teacher Filter Dropdown */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    শিক্ষক:
                  </span>
                  <select
                    value={teacherFilter}
                    onChange={(e) => setTeacherFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="all">সকল শিক্ষক</option>
                    {SCHOOL_TEACHERS.map((t) => (
                      <option key={t.id} value={t.nameBn}>
                        {t.nameBn} ({t.designationBn.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resource Booking Filter Dropdown */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-indigo-600" />
                    রিসোর্স:
                  </span>
                  <select
                    value={resourceFilter}
                    onChange={(e) => setResourceFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">সকল সম্পদ / রিসোর্স</option>
                    {SCHOOL_RESOURCES.map((res) => (
                      <option key={res.id} value={res.id}>
                        {res.icon} {res.nameBn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Friday Notice Banner if Friday */}
            {isFridayToday() && selectedDay === 'today' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  আজ <strong>শুক্রবার</strong> — বিদ্যালয়ের সাপ্তাহিক ছুটির দিন। উপরে শনিবার বা সপ্তাহের অন্যান্য দিন নির্বাচন করে ওই দিনের রুটিন ও পাঠ পরিকল্পনা দেখতে পারেন।
                </span>
              </div>
            )}
          </div>

          {/* Routine & Lesson Plan Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {getSchoolClassNameBn(selectedClass)} —{' '}
                    {effectiveDay === 'all'
                      ? 'সম্পূর্ণ সাপ্তাহিক রুটিন ও পাঠ পরিকল্পনা'
                      : `${getDayNameBn(effectiveDay as DayOfWeek)}-এর সময়সূচি ও দৈনিক পাঠ পরিকল্পনা`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    শ্রেণিকক্ষ: {CLASS_ROOMS[selectedClass]} · মোট পিরিয়ড: {filteredPeriods.length}টি
                  </p>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                {filteredPeriods.length}টি পিরিয়ড
              </div>
            </div>

            {filteredPeriods.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800">
                  এই দিনে কোনো পিরিয়ড নির্ধারিত নেই
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  নির্বাচিত শ্রেণি বা শিক্ষকের জন্য কোনো ক্লাস পাওয়া যায়নি। নতুন ক্লাস পিরিয়ড যুক্ত করতে পারেন।
                </p>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ নতুন ক্লাস পিরিয়ড যোগ করুন</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPeriods.map((period) => {
                  const liveStatus = getPeriodLiveStatus(period, true);
                  const isOngoing = liveStatus === 'ongoing';
                  const isUpcoming = liveStatus === 'upcoming';
                  const isPeriodWeeklyCompleted =
                    weeklyProgress.status === 'completed' ||
                    weeklyProgress.completedPeriodIds.includes(period.id);
                  const periodConflicts = routineConflictMap.get(period.id) || [];
                  const hasOverlapConflict = periodConflicts.length > 0;

                  return (
                    <div
                      key={period.id}
                      className={`rounded-2xl border p-4.5 transition-all flex flex-col justify-between space-y-3 bg-white ${
                        hasOverlapConflict
                          ? 'border-2 border-rose-500 bg-rose-50/30 ring-2 ring-rose-500/20 shadow-md'
                          : period.isBreak
                          ? 'border-amber-200 bg-amber-50/40'
                          : isOngoing
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                          : 'border-slate-200 hover:border-emerald-300 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Period Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-black font-mono px-2.5 py-1 rounded-xl flex items-center gap-1 ${
                                hasOverlapConflict
                                  ? 'bg-rose-600 text-white border border-rose-700'
                                  : period.isBreak
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}
                            >
                              {hasOverlapConflict ? (
                                <AlertTriangle className="w-3 h-3 text-amber-200" />
                              ) : period.isBreak ? (
                                <Coffee className="w-3 h-3 text-amber-700" />
                              ) : (
                                <Clock className="w-3 h-3 text-emerald-700" />
                              )}
                              <span>{period.periodLabelBn}</span>
                            </span>
                            {selectedDay === 'all' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border">
                                {getDayNameBn(period.day)}
                              </span>
                            )}
                            {hasOverlapConflict && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                                ⚠️ সময় ওভারল্যাপ!
                              </span>
                            )}
                          </div>

                          {/* Live Status Badge */}
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${
                              isOngoing
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black'
                                : isUpcoming
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {isOngoing && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                            )}
                            <span>{isOngoing ? 'চলমান ক্লাস' : isUpcoming ? 'আসন্ন' : 'সমাপ্ত'}</span>
                          </span>
                        </div>

                        {/* Time Range & Weekly Progress Status Pill */}
                        <div
                          className={`flex items-center justify-between gap-2 text-xs font-bold px-2.5 py-1 rounded-xl border ${
                            hasOverlapConflict
                              ? 'bg-rose-100/90 text-rose-950 border-rose-300'
                              : 'bg-emerald-50/70 text-emerald-800 border-emerald-100'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Clock
                              className={`w-3.5 h-3.5 shrink-0 ${
                                hasOverlapConflict ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            />
                            <span>
                              {period.startTime} — {period.endTime}
                            </span>
                          </span>
                          {!period.isBreak ? (
                            <button
                              type="button"
                              disabled={!canEditLessonPlan}
                              onClick={() =>
                                handleTogglePeriodWeeklyCompletion(period.id, period.subjectBn)
                              }
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                isPeriodWeeklyCompleted
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-200 text-amber-950'
                              } ${canEditLessonPlan ? 'cursor-pointer hover:opacity-90' : ''}`}
                              title={
                                canEditLessonPlan
                                  ? 'ক্লিক করে সাপ্তাহিক অগ্রগতি সম্পন্ন/পেন্ডিং পরিবর্তন করুন'
                                  : 'সাপ্তাহিক পাঠ অগ্রগতি স্ট্যাটাস'
                              }
                            >
                              {isPeriodWeeklyCompleted ? '✓ সপ্তাহে সম্পন্ন' : '⏳ পেন্ডিং'}
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-mono">
                              {period.durationMinutes || 40} মিনিট
                            </span>
                          )}
                        </div>

                        {/* Highlighted Overlapping Teacher Time Slot Alert Box on Card */}
                        {hasOverlapConflict && (
                          <div className="p-2.5 rounded-xl bg-rose-50 border-2 border-rose-300 space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between gap-1 text-rose-900 font-black">
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>⚠️ শিক্ষকের সময়সূচি ওভারল্যাপ সনাক্ত!</span>
                              </span>
                            </div>
                            {periodConflicts.map((c, idx) => (
                              <p
                                key={`${period.id}-conflict-${idx}`}
                                className="text-rose-950 font-semibold leading-relaxed"
                              >
                                • {c.conflictReasonBn}
                              </p>
                            ))}
                            {canEditLessonPlan && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(period)}
                                className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] transition cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>🛠️ সময় স্লট পরিবর্তন করে ওভারল্যাপ সমাধান করুন</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Subject Title & Topic */}
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-snug">
                            {period.subjectBn}
                          </h4>
                          {period.topicBn && (
                            <p className="text-xs font-bold text-indigo-900 mt-1 bg-indigo-50/80 px-2.5 py-1.5 rounded-xl border border-indigo-100 flex items-start gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                              <span>পাঠের টপিক: {period.topicBn}</span>
                            </p>
                          )}
                        </div>

                        {/* Daily Lesson Plan Summary Section (For Non-Break Classes) */}
                        {!period.isBreak && (
                          <div className="space-y-2.5">
                            {/* Dedicated Homework Assignment Card (Always Visible to Parents & Teachers) */}
                            <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/70 to-amber-50/40 border-2 border-amber-300/90 p-3 space-y-2 shadow-2xs">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-[11px] font-black text-amber-950 flex items-center gap-1.5">
                                  <ClipboardList className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>📚 নির্ধারিত বাড়ির কাজ (Homework Assignment)</span>
                                </span>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-950 border border-amber-300">
                                  জমা: {period.homeworkDueDateBn || 'পরবর্তী ক্লাসে জমা'}
                                </span>
                              </div>

                              {period.homeworkAssignmentBn || period.homeworkOrActivityBn ? (
                                <p className="text-xs font-bold text-slate-900 leading-relaxed bg-white/90 p-2.5 rounded-xl border border-amber-200/80">
                                  {period.homeworkAssignmentBn || period.homeworkOrActivityBn}
                                </p>
                              ) : (
                                <p className="text-[11px] text-amber-800/80 italic">
                                  এই পিরিয়ডের জন্য এখনো কোনো বাড়ির কাজ নির্ধারণ করা হয়নি।
                                </p>
                              )}

                              <div className="flex items-center justify-between gap-2 flex-wrap text-[10px]">
                                <span className="font-bold text-amber-900 bg-white/80 px-2 py-0.5 rounded-lg border border-amber-200">
                                  {getHomeworkSubmissionTypeLabelBn(period.homeworkSubmissionType)}
                                </span>
                                {period.homeworkAssignedAtBn && (
                                  <span className="text-amber-800 font-semibold">
                                    আপডেট: {period.homeworkAssignedAtBn}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Lesson Plan Summary Box */}
                            <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-3 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-black text-emerald-900 flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                  <span>দৈনিক পাঠ পরিকল্পনা সারসংক্ষেপ</span>
                                </span>
                                {period.lessonPlanUpdatedAtBn && (
                                  <span className="text-[10px] text-emerald-700 font-semibold">
                                    আপডেট: {period.lessonPlanUpdatedAtBn}
                                  </span>
                                )}
                              </div>

                              {period.lessonPlanSummaryBn ? (
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  {period.lessonPlanSummaryBn}
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">
                                  এই পিরিয়ডের জন্য এখনো বিস্তারিত পাঠ পরিকল্পনা যোগ করা হয়নি।
                                </p>
                              )}

                              {showDetailedLessonPlans && (
                                <div className="space-y-1.5 pt-1.5 border-t border-slate-200/70 text-[11px]">
                                  {period.learningObjectivesBn && (
                                    <div className="flex items-start gap-1.5 text-slate-700">
                                      <Target className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                      <span>
                                        <strong className="text-slate-900">শিখনফল:</strong>{' '}
                                        {period.learningObjectivesBn}
                                      </span>
                                    </div>
                                  )}
                                  {period.materialsNeededBn && (
                                    <div className="flex items-start gap-1.5 text-slate-600">
                                      <Package className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                                      <span>
                                        <strong className="text-slate-800">উপকরণ:</strong>{' '}
                                        {period.materialsNeededBn}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Teacher & Room Info */}
                        {!period.isBreak && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span className="font-bold truncate">
                                {period.teacherNameBn || 'নির্ধারিত শিক্ষক'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-[11px] shrink-0">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{period.roomBn || CLASS_ROOMS[period.className]}</span>
                            </div>
                          </div>
                        )}

                        {/* Booked School Resources Strip */}
                        {!period.isBreak && period.resources && period.resources.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                              🏫 সম্পদ:
                            </span>
                            {period.resources.map((resId) => {
                              const res = getResourceById(resId);
                              return (
                                <span
                                  key={resId}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs"
                                  title={res?.descriptionBn}
                                >
                                  <span>{res?.icon || '📦'}</span>
                                  <span>{res?.nameBn.split(' (')[0] || resId}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Action Controls Footer (Teacher Homework Assignment + Lesson Plan Editor + Parent Detail View + Admin Edit) */}
                      {!period.isBreak && (
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
                          {canEditLessonPlan ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <button
                                type="button"
                                onClick={() => handleOpenHomeworkModal(period)}
                                className="flex-1 py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition flex items-center justify-center gap-1 cursor-pointer text-[11px] shadow-2xs"
                                title="এই ক্লাসের জন্য বাড়ির কাজ (Homework Assignment) নির্ধারণ করুন"
                              >
                                <ClipboardList className="w-3.5 h-3.5 shrink-0" />
                                <span>📚 বাড়ির কাজ দিন</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenLessonPlanModal(period)}
                                className="flex-1 py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer text-[11px] shadow-2xs"
                              >
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span>পাঠ পরিকল্পনা</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setViewingLessonPlanPeriod(period)}
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-700" />
                              <span>বাড়ির কাজ ও পূর্ণাঙ্গ পাঠ পরিকল্পনা দেখুন</span>
                            </button>
                          )}

                          {canEditLessonPlan && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(period)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                title="পিরিয়ড সময় ও শিক্ষক পরিবর্তন করুন"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => setPeriodToDelete(period)}
                                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                                  title="পিরিয়ড মুছুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {period.isBreak && isAdmin && (
                        <div className="pt-3 border-t border-amber-200/60 flex items-center justify-end gap-1.5 text-xs print:hidden">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(period)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold transition flex items-center gap-1 cursor-pointer text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>এডিট</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPeriodToDelete(period)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                            title="পিরিয়ড মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Teacher / Admin Weekly Summary Note & Whole-Week Status Editor Modal */}
      {isWeeklySummaryEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 block">
                    {getSchoolClassNameBn(selectedClass)} · {weeklyProgress.weekLabelBn}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    📊 সাপ্তাহিক অগ্রগতি স্ট্যাটাস ও অভিভাবক সারসংক্ষেপ সম্পাদনা
                  </h3>
                  <p className="text-xs text-slate-500">
                    পুরো সপ্তাহের পাঠ অগ্রগতি সম্পন্ন/পেন্ডিং নির্ধারণ করুন এবং অভিভাবকদের জন্য সাপ্তাহিক নোট লিখুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWeeklySummaryEditModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeeklySummaryEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  ১. সম্পূর্ণ সপ্তাহের পাঠ অগ্রগতির স্ট্যাটাস (Whole Week Progress Status):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWeeklyEditForm({ ...weeklyEditForm, status: 'completed' })}
                    className={`p-3 rounded-2xl border-2 font-black text-left flex items-center gap-2.5 cursor-pointer transition ${
                      weeklyEditForm.status === 'completed'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-black">✓ সম্পন্ন (Completed)</div>
                      <div className="text-[10px] font-normal text-slate-500">
                        সপ্তাহের সকল ক্লাস শতভাগ সম্পন্ন
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWeeklyEditForm({ ...weeklyEditForm, status: 'pending' })}
                    className={`p-3 rounded-2xl border-2 font-black text-left flex items-center gap-2.5 cursor-pointer transition ${
                      weeklyEditForm.status === 'pending'
                        ? 'border-amber-500 bg-amber-50 text-amber-950'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Hourglass className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-xs font-black">⏳ পেন্ডিং / চলমান (Pending)</div>
                      <div className="text-[10px] font-normal text-slate-500">
                        সপ্তাহের পাঠদান এখনো চলমান
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  ২. শিক্ষকের সাপ্তাহিক মূল্যায়ন সারসংক্ষেপ (Weekly Teacher Evaluation Note):
                </label>
                <textarea
                  rows={3}
                  required
                  value={weeklyEditForm.teacherSummaryNoteBn}
                  onChange={(e) =>
                    setWeeklyEditForm({
                      ...weeklyEditForm,
                      teacherSummaryNoteBn: e.target.value,
                    })
                  }
                  placeholder="এই সপ্তাহে শিক্ষার্থীদের সার্বিক অংশগ্রহণ ও অগ্রগতির সারসংক্ষেপ লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-amber-900 block mb-1">
                  ৩. অভিভাবকদের জন্য সাপ্তাহিক বাসার অনুশীলন পরামর্শ (Parent Weekend Guidance):
                </label>
                <textarea
                  rows={2}
                  required
                  value={weeklyEditForm.parentActionNoteBn}
                  onChange={(e) =>
                    setWeeklyEditForm({
                      ...weeklyEditForm,
                      parentActionNoteBn: e.target.value,
                    })
                  }
                  placeholder="শুক্রবার ও ছুটির দিনে বাসায় শিশুকে কী অনুশীলন করাবেন তার নির্দেশনা..."
                  className="w-full px-3.5 py-2 bg-amber-50/60 border border-amber-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  ৪. সপ্তাহের মূল শিখন অর্জনসমূহ (প্রতি লাইনে একটি করে লিখুন):
                </label>
                <textarea
                  rows={3}
                  value={weeklyEditForm.keyHighlightsText}
                  onChange={(e) =>
                    setWeeklyEditForm({
                      ...weeklyEditForm,
                      keyHighlightsText: e.target.value,
                    })
                  }
                  placeholder="যেমন: স্বরবর্ণ ও ব্যঞ্জনবর্ণ উচ্চারণ অনুশীলন&#10;১ থেকে ২০ পর্যন্ত সংখ্যা গণনা"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWeeklySummaryEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>সাপ্তাহিক সারসংক্ষেপ সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Teacher Daily Lesson Plan Summary Modal */}
      {lessonPlanModalPeriod && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-indigo-700 block">
                    {getSchoolClassNameBn(lessonPlanModalPeriod.className)} ·{' '}
                    {getDayNameBn(lessonPlanModalPeriod.day)} · {lessonPlanModalPeriod.periodLabelBn} (
                    {lessonPlanModalPeriod.startTime} - {lessonPlanModalPeriod.endTime})
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    📝 দৈনিক পাঠ পরিকল্পনা সংযোজন — {lessonPlanModalPeriod.subjectBn}
                  </h3>
                  <p className="text-xs text-slate-500">
                    শিক্ষক: {lessonPlanModalPeriod.teacherNameBn} · এখানে লেখা সারসংক্ষেপ অভিভাবক পোর্টালে সরাসরি দেখা যাবে
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLessonPlanModalPeriod(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Template Selector for Teachers */}
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 block">
                ⚡ দ্রুত পাঠ পরিকল্পনা টেমপ্লেট (১-ক্লিকে পূরণ করুন):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {LESSON_PLAN_QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyLessonPlanTemplate(tpl.id)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 text-[11px] font-semibold transition cursor-pointer"
                  >
                    + {tpl.labelBn}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveLessonPlan} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  ১. আজকের পাঠের মূল টপিক / অধ্যায় (Lesson Topic):
                </label>
                <input
                  type="text"
                  required
                  value={lessonPlanForm.topicBn}
                  onChange={(e) =>
                    setLessonPlanForm({ ...lessonPlanForm, topicBn: e.target.value })
                  }
                  placeholder="যেমন: স্বরবর্ণ (অ, আ, ই, ঈ) ছবি দেখে চেনা ও খাতায় লেখা"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  ২. দৈনিক পাঠ পরিকল্পনার সংক্ষিপ্ত সারসংক্ষেপ (Daily Lesson Plan Summary for Parents):
                </label>
                <textarea
                  rows={3}
                  required
                  value={lessonPlanForm.lessonPlanSummaryBn}
                  onChange={(e) =>
                    setLessonPlanForm({
                      ...lessonPlanForm,
                      lessonPlanSummaryBn: e.target.value,
                    })
                  }
                  placeholder="আজকের ক্লাসে শিশুদের কী শেখানো হবে এবং কীভাবে ক্লাসটি পরিচালিত হবে তার সংক্ষিপ্ত বিবরণ লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  ৩. আজকের শিখনফল / ক্লাসের মূল লক্ষ্য (Learning Objectives):
                </label>
                <input
                  type="text"
                  value={lessonPlanForm.learningObjectivesBn}
                  onChange={(e) =>
                    setLessonPlanForm({
                      ...lessonPlanForm,
                      learningObjectivesBn: e.target.value,
                    })
                  }
                  placeholder="যেমন: শুদ্ধ উচ্চারণ, বর্ণ শনাক্তকরণ ও হাতের লেখার দক্ষতা"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3">
                <label className="font-black text-amber-950 block">
                  ৪. 📚 নির্ধারিত বাড়ির কাজ (Homework Assignment — অভিভাবক ড্যাশবোর্ডে প্রদর্শিত হবে):
                </label>
                <textarea
                  rows={2}
                  value={lessonPlanForm.homeworkAssignmentBn}
                  onChange={(e) =>
                    setLessonPlanForm({
                      ...lessonPlanForm,
                      homeworkAssignmentBn: e.target.value,
                      homeworkOrActivityBn: e.target.value,
                    })
                  }
                  placeholder="যেমন: পাঠ্যবইয়ের ৫নং পৃষ্ঠার ছবিগুলো দেখে নাম বলা ও খাতায় ১ পৃষ্ঠা হাতের লেখা অনুশীলন করা।"
                  className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-amber-900 block mb-1 text-[11px]">
                      জমা দেওয়ার ধরন (Submission Type):
                    </label>
                    <select
                      value={lessonPlanForm.homeworkSubmissionType}
                      onChange={(e) =>
                        setLessonPlanForm({
                          ...lessonPlanForm,
                          homeworkSubmissionType: e.target.value as HomeworkSubmissionType,
                        })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-slate-900 font-bold text-xs"
                    >
                      {HOMEWORK_SUBMISSION_TYPES.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.labelBn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-amber-900 block mb-1 text-[11px]">
                      জমা দেওয়ার শেষ সময় (Due Date):
                    </label>
                    <input
                      type="text"
                      value={lessonPlanForm.homeworkDueDateBn}
                      onChange={(e) =>
                        setLessonPlanForm({
                          ...lessonPlanForm,
                          homeworkDueDateBn: e.target.value,
                        })
                      }
                      placeholder="যেমন: আগামীকালের ক্লাসে জমা"
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-slate-900 font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  ৫. প্রয়োজনীয় শিক্ষা উপকরণ (Learning Materials):
                </label>
                <input
                  type="text"
                  value={lessonPlanForm.materialsNeededBn}
                  onChange={(e) =>
                    setLessonPlanForm({
                      ...lessonPlanForm,
                      materialsNeededBn: e.target.value,
                    })
                  }
                  placeholder="যেমন: ফ্ল্যাশকার্ড, রঙিন পেন্সিল, স্লেট ও ছবির বই"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 6. School Resource / Asset Booking Selector */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-black text-indigo-950 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-indigo-700 shrink-0" />
                    <span>৬. 🏫 স্কুলের সম্পদ ও রিসোর্স বুকিং (Book School Resources):</span>
                  </label>
                  {lessonPlanForm.resources.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setLessonPlanForm((prev) => ({ ...prev, resources: [] }))
                      }
                      className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      ক্লিয়ার করুন
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                  এই ক্লাসের জন্য স্কুলের কোন সম্পদ বুক করতে চান তা সিলেক্ট করুন (যেমন: প্রজেক্টর, আর্ট ল্যাব, খেলার মাঠ)।
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {SCHOOL_RESOURCES.map((res) => {
                    const isSelected = lessonPlanForm.resources.includes(res.id);
                    return (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => {
                          setLessonPlanForm((prev) => {
                            const current = prev.resources || [];
                            const next = isSelected
                              ? current.filter((id) => id !== res.id)
                              : [...current, res.id];
                            return { ...prev, resources: next };
                          });
                        }}
                        className={`p-2 rounded-xl border text-left flex items-start gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-400/40'
                            : 'bg-white hover:bg-indigo-50/60 text-slate-800 border-indigo-100'
                        }`}
                      >
                        <span className="text-base shrink-0">{res.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-black truncate">
                            {res.nameBn}
                          </div>
                          <div
                            className={`text-[10px] line-clamp-1 ${
                              isSelected ? 'text-indigo-100' : 'text-slate-500'
                            }`}
                          >
                            {res.descriptionBn}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLessonPlanModalPeriod(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>পাঠ পরিকল্পনা ও বাড়ির কাজ সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Teacher Homework Assignment Modal */}
      {homeworkModalPeriod && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-amber-200 space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between gap-3 border-b border-amber-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-800 block">
                    {getSchoolClassNameBn(homeworkModalPeriod.className)} ·{' '}
                    {getDayNameBn(homeworkModalPeriod.day)} · {homeworkModalPeriod.periodLabelBn} (
                    {homeworkModalPeriod.startTime} - {homeworkModalPeriod.endTime})
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    📚 বাড়ির কাজ নির্ধারণ (Assign Homework) — {homeworkModalPeriod.subjectBn}
                  </h3>
                  <p className="text-xs text-slate-500">
                    শিক্ষক: {homeworkModalPeriod.teacherNameBn} · এখানে দেওয়া বাড়ির কাজ অভিভাবকদের রুটিন ড্যাশবোর্ডে সাথে সাথে দেখা যাবে
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHomeworkModalPeriod(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Homework Template Selector */}
            <div className="space-y-1.5 bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
              <span className="text-[11px] font-bold text-amber-950 block">
                ⚡ দ্রুত বাড়ির কাজ টেমপ্লেট (১-ক্লিকে পূরণ করুন):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {HOMEWORK_QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyHomeworkTemplate(tpl.id)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-bold transition cursor-pointer"
                  >
                    + {tpl.labelBn}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveHomeworkAssignment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  ১. আজকের পাঠের টপিক (Lesson Topic):
                </label>
                <input
                  type="text"
                  required
                  value={homeworkForm.topicBn}
                  onChange={(e) =>
                    setHomeworkForm({ ...homeworkForm, topicBn: e.target.value })
                  }
                  placeholder="যেমন: স্বরবর্ণ পরিচিতি ও শব্দ গঠন"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-black text-amber-950 block mb-1">
                  ২. 📚 নির্ধারিত বাড়ির কাজ / হোমওয়ার্ক টাস্ক (Homework Assignment Task):
                </label>
                <textarea
                  rows={3}
                  required
                  value={homeworkForm.homeworkAssignmentBn}
                  onChange={(e) =>
                    setHomeworkForm({
                      ...homeworkForm,
                      homeworkAssignmentBn: e.target.value,
                    })
                  }
                  placeholder="যেমন: খাতায় সুন্দর করে ১ পৃষ্ঠা বর্ণ/শব্দ লিখে আনা এবং পাঠ্যবই দেখে ২ বার সরব পাঠ অনুশীলন করা।"
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border-2 border-amber-300 rounded-xl text-slate-900 font-semibold leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    ৩. বাড়ির কাজের ধরন (Submission Type):
                  </label>
                  <select
                    value={homeworkForm.homeworkSubmissionType}
                    onChange={(e) =>
                      setHomeworkForm({
                        ...homeworkForm,
                        homeworkSubmissionType: e.target.value as HomeworkSubmissionType,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {HOMEWORK_SUBMISSION_TYPES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.labelBn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    ৪. জমা দেওয়ার শেষ সময় (Due Date):
                  </label>
                  <input
                    type="text"
                    required
                    value={homeworkForm.homeworkDueDateBn}
                    onChange={(e) =>
                      setHomeworkForm({
                        ...homeworkForm,
                        homeworkDueDateBn: e.target.value,
                      })
                    }
                    placeholder="যেমন: আগামীকালের ক্লাসে জমা"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHomeworkModalPeriod(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>বাড়ির কাজ প্রকাশ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parent / Student Full Lesson Plan & Homework Reader Modal */}
      {viewingLessonPlanPeriod && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 block">
                    {getSchoolClassNameBn(viewingLessonPlanPeriod.className)} ·{' '}
                    {getDayNameBn(viewingLessonPlanPeriod.day)} ·{' '}
                    {viewingLessonPlanPeriod.periodLabelBn}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {viewingLessonPlanPeriod.subjectBn}
                  </h3>
                  <p className="text-xs text-slate-500">
                    শিক্ষক: {viewingLessonPlanPeriod.teacherNameBn} · সময়:{' '}
                    {viewingLessonPlanPeriod.startTime} - {viewingLessonPlanPeriod.endTime}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingLessonPlanPeriod(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {viewingLessonPlanPeriod.topicBn && (
                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 block">
                    আজকের পাঠের টপিক
                  </span>
                  <p className="text-sm font-black text-indigo-950 mt-0.5">
                    {viewingLessonPlanPeriod.topicBn}
                  </p>
                </div>
              )}

              {(viewingLessonPlanPeriod.homeworkAssignmentBn ||
                viewingLessonPlanPeriod.homeworkOrActivityBn) && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase text-amber-950 flex items-center gap-1.5">
                      <ClipboardList className="w-4 h-4 text-amber-700" />
                      <span>📚 নির্ধারিত বাড়ির কাজ (Homework Assignment)</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black text-[10px]">
                      জমা: {viewingLessonPlanPeriod.homeworkDueDateBn || 'পরবর্তী ক্লাসে জমা'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-900 font-bold leading-relaxed bg-white p-2.5 rounded-xl border border-amber-200">
                    {viewingLessonPlanPeriod.homeworkAssignmentBn ||
                      viewingLessonPlanPeriod.homeworkOrActivityBn}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-amber-900 font-semibold">
                    <span>
                      ধরন: {getHomeworkSubmissionTypeLabelBn(viewingLessonPlanPeriod.homeworkSubmissionType)}
                    </span>
                    {viewingLessonPlanPeriod.homeworkAssignedByBn && (
                      <span>নির্ধারণে: {viewingLessonPlanPeriod.homeworkAssignedByBn}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                  📖 দৈনিক পাঠ পরিকল্পনা সারসংক্ষেপ (Lesson Plan Summary)
                </span>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {viewingLessonPlanPeriod.lessonPlanSummaryBn ||
                    'নিয়মিত পাঠ্যসূচি অনুযায়ী ক্লাস পরিচালিত হবে।'}
                </p>
              </div>

              {viewingLessonPlanPeriod.learningObjectivesBn && (
                <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-teal-800 block">
                    🎯 ক্লাসের শিখনফল (Learning Objectives)
                  </span>
                  <p className="text-xs text-teal-950 font-medium">
                    {viewingLessonPlanPeriod.learningObjectivesBn}
                  </p>
                </div>
              )}

              {viewingLessonPlanPeriod.materialsNeededBn && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">প্রয়োজনীয় শিক্ষা উপকরণ:</span>
                  <span className="font-bold text-slate-900">
                    {viewingLessonPlanPeriod.materialsNeededBn}
                  </span>
                </div>
              )}

              {/* Booked School Resources in Reader Modal */}
              {viewingLessonPlanPeriod.resources && viewingLessonPlanPeriod.resources.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-indigo-900 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-indigo-700" />
                    <span>🏫 বুকিংকৃত স্কুলের সম্পদ ও রিসোর্স (Booked School Assets):</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {viewingLessonPlanPeriod.resources.map((resId) => {
                      const res = getResourceById(resId);
                      return (
                        <div
                          key={resId}
                          className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 shadow-2xs flex items-center gap-2"
                        >
                          <span className="text-base">{res?.icon || '📦'}</span>
                          <div>
                            <span className="text-xs font-black text-slate-900 block">
                              {res?.nameBn || resId}
                            </span>
                            {res?.descriptionBn && (
                              <span className="text-[10px] text-slate-500 block">
                                {res.descriptionBn}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                {viewingLessonPlanPeriod.lessonPlanUpdatedAtBn
                  ? `সর্বশেষ আপডেট: ${viewingLessonPlanPeriod.lessonPlanUpdatedAtBn}`
                  : 'আনন্দ পাঠশালা একাডেমিক কারিকুলাম'}
              </span>
              <button
                type="button"
                onClick={() => setViewingLessonPlanPeriod(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Period Modal (Admin) */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {editingPeriod ? 'পিরিয়ড ও পাঠ পরিকল্পনা সম্পাদনা' : 'নতুন ক্লাস পিরিয়ড যুক্ত করুন'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    শ্রেণি, শিক্ষক ও দৈনিক পাঠ পরিকল্পনা নির্ধারণ করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAddEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">শ্রেণি (Class):</label>
                  <select
                    value={formData.className}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        className: e.target.value as SchoolClass,
                        roomBn: CLASS_ROOMS[e.target.value as SchoolClass] || formData.roomBn,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameBn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">বার (Day of Week):</label>
                  <select
                    value={formData.day}
                    onChange={(e) =>
                      setFormData({ ...formData, day: e.target.value as DayOfWeek })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {DAYS_OF_WEEK_CONFIG.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameBn} ({d.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    পিরিয়ড নম্বর ও লেবেল:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.periodLabelBn}
                    onChange={(e) =>
                      setFormData({ ...formData, periodLabelBn: e.target.value })
                    }
                    placeholder="যেমন: ১ম পিরিয়ড বা টিফিন"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">ক্রমিক নম্বর:</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={formData.periodNo}
                    onChange={(e) =>
                      setFormData({ ...formData, periodNo: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`font-bold block mb-1 ${
                      activeFormSlotConflicts.length > 0 || isInvalidFormTimeRange
                        ? 'text-rose-700'
                        : 'text-slate-800'
                    }`}
                  >
                    শুরুর সময় (Start):
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.startTime}
                    onChange={(e) => {
                      setFormData({ ...formData, startTime: e.target.value });
                      setAllowOverlapOverride(false);
                    }}
                    placeholder="যেমন: 09:00 AM"
                    className={`w-full px-3 py-2 border rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none ${
                      activeFormSlotConflicts.length > 0 || isInvalidFormTimeRange
                        ? 'bg-rose-50/80 border-2 border-rose-500 text-rose-950 ring-2 ring-rose-500/20'
                        : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`font-bold block mb-1 ${
                      activeFormSlotConflicts.length > 0 || isInvalidFormTimeRange
                        ? 'text-rose-700'
                        : 'text-slate-800'
                    }`}
                  >
                    শেষের সময় (End):
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.endTime}
                    onChange={(e) => {
                      setFormData({ ...formData, endTime: e.target.value });
                      setAllowOverlapOverride(false);
                    }}
                    placeholder="যেমন: 09:40 AM"
                    className={`w-full px-3 py-2 border rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none ${
                      activeFormSlotConflicts.length > 0 || isInvalidFormTimeRange
                        ? 'bg-rose-50/80 border-2 border-rose-500 text-rose-950 ring-2 ring-rose-500/20'
                        : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                </div>
              </div>

              {/* Invalid Time Range Warning */}
              {isInvalidFormTimeRange && (
                <div className="p-3 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-bold">
                    অবৈধ সময়সীমা: ক্লাস শেষের সময় অবশ্যই শুরুর সময়ের পরে হতে হবে (যেমন: 09:00 AM থেকে 09:40 AM)।
                  </span>
                </div>
              )}

              {/* Real-Time Overlapping Time Slot Detection & Highlighting Box */}
              {!formData.isBreak && activeFormSlotConflicts.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 shadow-xs space-y-2.5 animate-in fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-rose-900 font-black text-xs sm:text-sm">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
                      <span>
                        ⚠️ সময়সূচি ওভারল্যাপ সনাক্ত হয়েছে! ({activeFormSlotConflicts.length}টি সংঘর্ষ)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] shrink-0">
                      OVERLAP DETECTED
                    </span>
                  </div>

                  <p className="text-[11px] text-rose-800 font-medium">
                    নির্বাচিত সময়ে ({formData.startTime} — {formData.endTime}) একই শিক্ষকের বা শ্রেণির অন্য ক্লাস ইতিমধ্যে শিডিউল করা রয়েছে:
                  </p>

                  <div className="space-y-1.5">
                    {activeFormSlotConflicts.map((conflict, idx) => (
                      <div
                        key={`modal-conflict-${idx}`}
                        className="p-2.5 rounded-xl bg-white border border-rose-300 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2 font-black text-rose-950">
                          <span>
                            {getSchoolClassNameBn(conflict.conflictingPeriod.className)} —{' '}
                            {conflict.conflictingPeriod.subjectBn}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[10px]">
                            {conflict.conflictingPeriod.startTime} -{' '}
                            {conflict.conflictingPeriod.endTime}
                          </span>
                        </div>
                        <p className="text-slate-700 font-semibold leading-relaxed">
                          {conflict.conflictReasonBn}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-rose-200">
                    <button
                      type="button"
                      onClick={handleApplySuggestedFreeSlot}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        ⚡ পরবর্তী ফাঁকা স্লট বসান ({suggestedFreeSlot.startTime} -{' '}
                        {suggestedFreeSlot.endTime})
                      </span>
                    </button>

                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-rose-900 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allowOverlapOverride}
                        onChange={(e) => setAllowOverlapOverride(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>ওভারল্যাপ সত্ত্বেও সংরক্ষণ করুন</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Teacher's Existing Day Schedule Timeline Strip (Highlights Overlapping Slots in Red) */}
              {!formData.isBreak && teacherSameDayScheduledPeriods.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        {getDayNameBn(formData.day)}-এ এই শিক্ষকের নির্ধারিত ক্লাসসমূহ (
                        {teacherSameDayScheduledPeriods.length}টি):
                      </span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      লাল রঙ = সময় ওভারল্যাপ
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {teacherSameDayScheduledPeriods.map((tp) => {
                      const isSlotOverlapping = activeFormSlotConflicts.some(
                        (c) => c.conflictingPeriod.id === tp.id
                      );
                      return (
                        <div
                          key={`Timeline-${tp.id}`}
                          className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition ${
                            isSlotOverlapping
                              ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-400/50 animate-pulse'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="font-mono">
                            {tp.startTime} - {tp.endTime}
                          </span>
                          <span>·</span>
                          <span>{getSchoolClassNameBn(tp.className)}</span>
                          {isSlotOverlapping && (
                            <span className="px-1.5 py-0.2 rounded bg-white text-rose-700 font-black text-[9px]">
                              ⚠️ ওভারল্যাপ
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-800 block mb-1">বিষয় (Subject):</label>
                <div className="space-y-1.5">
                  <select
                    value={formData.subjectBn}
                    onChange={(e) => setFormData({ ...formData, subjectBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {STANDARD_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={formData.subjectBn}
                    onChange={(e) => setFormData({ ...formData, subjectBn: e.target.value })}
                    placeholder="কাস্টম বিষয়ের নাম..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`font-bold block mb-1 ${
                      activeFormSlotConflicts.some((c) => c.conflictType === 'same_teacher')
                        ? 'text-rose-700'
                        : 'text-slate-800'
                    }`}
                  >
                    নির্ধারিত শিক্ষক (Teacher):
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => {
                      const t = SCHOOL_TEACHERS.find((tch) => tch.id === e.target.value);
                      setFormData({
                        ...formData,
                        teacherId: e.target.value,
                        teacherNameBn: t ? t.nameBn : formData.teacherNameBn,
                      });
                      setAllowOverlapOverride(false);
                    }}
                    className={`w-full px-3 py-2 border rounded-xl font-bold text-slate-900 focus:bg-white ${
                      activeFormSlotConflicts.some((c) => c.conflictType === 'same_teacher')
                        ? 'bg-rose-50/80 border-2 border-rose-500 text-rose-950'
                        : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  >
                    {SCHOOL_TEACHERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameBn} ({t.designationBn.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">রুম / স্থান (Venue):</label>
                  <input
                    type="text"
                    value={formData.roomBn}
                    onChange={(e) => setFormData({ ...formData, roomBn: e.target.value })}
                    placeholder="যেমন: রুম ১০৩"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  আজকের পাঠ / পাঠ্যসূচি টপিক (Lesson Topic):
                </label>
                <input
                  type="text"
                  value={formData.topicBn}
                  onChange={(e) => setFormData({ ...formData, topicBn: e.target.value })}
                  placeholder="যেমন: স্বরবর্ণ পরিচিতি ও ছড়া আবৃত্তি"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {!formData.isBreak && (
                <>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      দৈনিক পাঠ পরিকল্পনা সারসংক্ষেপ (Daily Lesson Plan Summary):
                    </label>
                    <textarea
                      rows={2}
                      value={formData.lessonPlanSummaryBn}
                      onChange={(e) =>
                        setFormData({ ...formData, lessonPlanSummaryBn: e.target.value })
                      }
                      placeholder="অভিভাবকদের জন্য ক্লাসের সংক্ষিপ্ত পাঠ পরিকল্পনা লিখুন..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                    <label className="font-bold text-amber-950 block">
                      📚 নির্ধারিত বাড়ির কাজ (Homework Assignment):
                    </label>
                    <input
                      type="text"
                      value={formData.homeworkAssignmentBn}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          homeworkAssignmentBn: e.target.value,
                          homeworkOrActivityBn: e.target.value,
                        })
                      }
                      placeholder="যেমন: বাসায় বর্ণগুলো ২ বার বলা ও খাতায় ১ পৃষ্ঠা লেখা"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-amber-900 block mb-1 text-[11px]">
                          বাড়ির কাজের ধরন:
                        </label>
                        <select
                          value={formData.homeworkSubmissionType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              homeworkSubmissionType: e.target.value as HomeworkSubmissionType,
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-xl text-slate-900 font-bold text-[11px]"
                        >
                          {HOMEWORK_SUBMISSION_TYPES.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.labelBn}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-amber-900 block mb-1 text-[11px]">
                          জমা দেওয়ার সময়:
                        </label>
                        <input
                          type="text"
                          value={formData.homeworkDueDateBn}
                          onChange={(e) =>
                            setFormData({ ...formData, homeworkDueDateBn: e.target.value })
                          }
                          placeholder="পরবর্তী ক্লাসে জমা"
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-xl text-slate-900 text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* School Assets & Resource Booking Selector */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-black text-indigo-950 flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-indigo-700 shrink-0" />
                        <span>স্কুলের সম্পদ ও রিসোর্স বুকিং (Book School Resources):</span>
                      </label>
                      {formData.resources.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, resources: [] }))}
                          className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                        >
                          রিসোর্স ক্লিয়ার করুন
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                      এই ক্লাসের জন্য স্কুলের কোন সম্পদ বুক করতে চান তা সিলেক্ট করুন (যেমন: প্রজেক্টর, আর্ট ল্যাব, খেলার মাঠ)।
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {SCHOOL_RESOURCES.map((res) => {
                        const isSelected = formData.resources.includes(res.id);
                        return (
                          <button
                            key={res.id}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => {
                                const current = prev.resources || [];
                                const next = isSelected
                                  ? current.filter((id) => id !== res.id)
                                  : [...current, res.id];
                                return { ...prev, resources: next };
                              });
                            }}
                            className={`p-2 rounded-xl border text-left flex items-start gap-2 transition cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-400/40'
                                : 'bg-white hover:bg-indigo-50/60 text-slate-800 border-indigo-100'
                            }`}
                          >
                            <span className="text-base shrink-0">{res.icon}</span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-black truncate">
                                {res.nameBn}
                              </div>
                              <div
                                className={`text-[10px] line-clamp-1 ${
                                  isSelected ? 'text-indigo-100' : 'text-slate-500'
                                }`}
                              >
                                {res.descriptionBn}
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isBreakCheckbox"
                  checked={formData.isBreak}
                  onChange={(e) => setFormData({ ...formData, isBreak: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label
                  htmlFor="isBreakCheckbox"
                  className="font-bold text-slate-700 cursor-pointer"
                >
                  এটি টিফিন বা বিরতির সময় (Break/Tiffin Time)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={
                    isInvalidFormTimeRange ||
                    (activeFormSlotConflicts.length > 0 && !allowOverlapOverride)
                  }
                  className={`px-5 py-2 font-black rounded-xl transition shadow-xs flex items-center gap-1.5 ${
                    isInvalidFormTimeRange ||
                    (activeFormSlotConflicts.length > 0 && !allowOverlapOverride)
                      ? 'bg-rose-200 text-rose-900 cursor-not-allowed opacity-80'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                  }`}
                >
                  {activeFormSlotConflicts.length > 0 && !allowOverlapOverride ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>সময় ওভারল্যাপ সমাধান করুন</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {periodToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">পিরিয়ডটি মুছে ফেলতে চান?</h4>
              <p className="text-xs text-slate-500 mt-1">
                &ldquo;{periodToDelete.periodLabelBn} — {periodToDelete.subjectBn}&rdquo; পিরিয়ডটি রুটিন থেকে বাদ দেওয়া হবে।
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPeriodToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
