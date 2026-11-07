import { SchoolClass, ExamScheduleItem, AssessmentType } from '../types/school';
import { toBengaliNumber, getSchoolClassNameBn } from './schoolLogic';

export const EXAM_SCHEDULE_STORAGE_KEY = 'ananda_exam_schedules_v1';
export const EXAM_SCHEDULE_UPDATE_EVENT = 'ananda-exam-schedule-updated';

export const BN_WEEKDAY_NAMES: Record<number, string> = {
  0: 'রবিবার',
  1: 'সোমবার',
  2: 'মঙ্গলবার',
  3: 'বুধবার',
  4: 'বৃহস্পতিবার',
  5: 'শুক্রবার',
  6: 'শনিবার',
};

export const INITIAL_EXAM_SCHEDULES: ExamScheduleItem[] = [
  // --- Nursery Class Assessments ---
  {
    id: 'exam-nur-1',
    className: 'Nursery',
    examTitle: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)',
    subject: 'বাংলা ও বর্ণমালা জ্ঞান',
    examDate: '2026-11-15',
    examDateBn: '১৫ নভেম্বর ২০২৬',
    dayNameBn: 'রবিবার',
    startTime: '০৯:৩০ AM',
    endTime: '১১:০০ AM',
    durationMinutes: 90,
    room: 'রুম ১০২ (নার্সারি শাখা)',
    syllabusTopics: 'স্বরবর্ণ (অ-ঔ) ও ব্যঞ্জনবর্ণ (ক-ঞ) নির্ভুল লেখা, ছবি দেখে অক্ষর মেলানো, ছড়া "আমাদের ছোট নদী"',
    totalMarks: 50,
    passMarks: 20,
    examinerTeacherNameBn: 'ফাতেমা আক্তার',
    assessmentType: 'written',
    instructionsBn: 'শিশুদের সাথে প্রয়োজনীয় পেন্সিল, ইরেজার ও শার্পনার দিতে হবে। পরীক্ষা চলাকালীন অভিভাবকগণ ওয়েটিং শেডে অপেক্ষা করবেন।',
    status: 'upcoming',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'exam-nur-2',
    className: 'Nursery',
    examTitle: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)',
    subject: 'সংখ্যা ও মৌলিক গণিত',
    examDate: '2026-11-17',
    examDateBn: '১৭ নভেম্বর ২০২৬',
    dayNameBn: 'মঙ্গলবার',
    startTime: '০৯:৩০ AM',
    endTime: '১১:০০ AM',
    durationMinutes: 90,
    room: 'রুম ১০২ (নার্সারি শাখা)',
    syllabusTopics: 'সংখ্যা ১ থেকে ৩০ গণনা ও লেখা, ছবি দেখে গণনা করে সঠিক সংখ্যা গোল দাগ দেওয়া, ছোট-বড় পার্থক্য',
    totalMarks: 50,
    passMarks: 20,
    examinerTeacherNameBn: 'ফাতেমা আক্তার',
    assessmentType: 'written',
    instructionsBn: 'গণিতের কাউন্টিং ব্লকের সাহায্যে মৌখিক পরীক্ষা নেওয়া হবে।',
    status: 'upcoming',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'exam-nur-3',
    className: 'Nursery',
    examTitle: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)',
    subject: 'ইংরেজি ছড়া ও শব্দ পরিচিতি',
    examDate: '2026-11-19',
    examDateBn: '১৯ নভেম্বর ২০২৬',
    dayNameBn: 'বৃহস্পতিবার',
    startTime: '০৯:৩০ AM',
    endTime: '১১:০০ AM',
    durationMinutes: 90,
    room: 'রুম ১০২ (নার্সারি শাখা)',
    syllabusTopics: 'Capital & Small Letters (A-Z), Phonics sounds, Rhymes: "Twinkle Twinkle" & "Baa Baa Black Sheep"',
    totalMarks: 50,
    passMarks: 20,
    examinerTeacherNameBn: 'তানজিলা হক',
    assessmentType: 'oral',
    instructionsBn: 'মৌখিক কথোপকথন ও ফ্ল্যাশকার্ড শনাক্তকরণ পরীক্ষা অনুষ্ঠিত হবে।',
    status: 'upcoming',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'exam-nur-4',
    className: 'Nursery',
    examTitle: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)',
    subject: 'সৃজনশীল অঙ্কন ও রং মেলানো',
    examDate: '2026-11-22',
    examDateBn: '২২ নভেম্বর ২০২৬',
    dayNameBn: 'রবিবার',
    startTime: '১০:০০ AM',
    endTime: '১১:৩০ AM',
    durationMinutes: 90,
    room: 'আর্ট অ্যান্ড ক্রাফট জোন',
    syllabusTopics: 'জাতীয় পতাকা, সহজ ফুল ও ফল আঁকা ও রং করা, ক্লে দিয়ে সহজ আকৃতি তৈরি',
    totalMarks: 50,
    passMarks: 20,
    examinerTeacherNameBn: 'তানজিলা হক',
    assessmentType: 'creative_drawing',
    instructionsBn: '১২ রঙের পেস্টেল কালার বক্স ও ড্রয়িং প্যাড সঙ্গে আনতে হবে।',
    status: 'upcoming',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },

  // --- Play Class Assessments ---
  {
    id: 'exam-play-1',
    className: 'Play',
    examTitle: 'আনন্দ মেলা মূল্যায়ন ২০২৬ (Play Assessment)',
    subject: 'ছড়া গান ও কথা বলা (Oral Assessment)',
    examDate: '2026-11-16',
    examDateBn: '১৬ নভেম্বর ২০২৬',
    dayNameBn: 'সোমবার',
    startTime: '০৯:৩০ AM',
    endTime: '১০:৩০ AM',
    durationMinutes: 60,
    room: 'প্লে-জোন হল রুম',
    syllabusTopics: 'নিজের নাম ও মা-বাবার নাম স্পষ্টভাবে বলা, পশু-পাখির ডাক অনুকরণ, ১টি প্রিয় ছড়া গান',
    totalMarks: 30,
    passMarks: 12,
    examinerTeacherNameBn: 'তানজিলা হক',
    assessmentType: 'oral',
    instructionsBn: 'খেলার ছলে বন্ধুত্বপূর্ণ পরিবেশে মূল্যায়ন অনুষ্ঠিত হবে। কোনো মানসিক চাপ দেওয়া যাবে না।',
    status: 'upcoming',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'exam-play-2',
    className: 'Play',
    examTitle: 'আনন্দ মেলা মূল্যায়ন ২০২৬ (Play Assessment)',
    subject: 'রং চেনা ও অ্যাক্টিভিটি গেম',
    examDate: '2026-11-18',
    examDateBn: '১৮ নভেম্বর ২০২৬',
    dayNameBn: 'বুধবার',
    startTime: '০৯:৩০ AM',
    endTime: '১০:৩০ AM',
    durationMinutes: 60,
    room: 'প্লে-জোন হল রুম',
    syllabusTopics: 'লাল, সবুজ, নীল ও হলুদ রং আলাদা করা, বল ঝুড়িতে ফেলা, খেলনা গোছানো',
    totalMarks: 30,
    passMarks: 12,
    examinerTeacherNameBn: 'তানজিলা হক',
    assessmentType: 'practical_activity',
    instructionsBn: 'আরামদায়ক স্কুলের পোশাক পরে উপস্থিত হতে হবে।',
    status: 'upcoming',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },

  // --- KG Class Assessments ---
  {
    id: 'exam-kg-1',
    className: 'KG',
    examTitle: 'বার্ষিক চূড়ান্ত মূল্যায়ন ২০২৬ (KG Final)',
    subject: 'বাংলা ব্যাকরণ ও সহজ বাক্য গঠন',
    examDate: '2026-11-15',
    examDateBn: '১৫ নভেম্বর ২০২৬',
    dayNameBn: 'রবিবার',
    startTime: '১০:০০ AM',
    endTime: '১১:৩০ AM',
    durationMinutes: 90,
    room: 'রুম ২০৩ (কেজি শাখা)',
    syllabusTopics: 'স্বরচিহ্ন (কার চিহ্ন) যোগে শব্দ গঠন, যুক্তবর্ণের প্রাথমিক ধারণা, নিজের সম্পর্কে ৩টি বাক্য',
    totalMarks: 100,
    passMarks: 40,
    examinerTeacherNameBn: 'মোস্তফা আল মামুন',
    assessmentType: 'written',
    instructionsBn: 'হস্তাক্ষর স্পষ্ট ও পরিচ্ছন্ন হতে হবে।',
    status: 'upcoming',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'exam-kg-2',
    className: 'KG',
    examTitle: 'বার্ষিক চূড়ান্ত মূল্যায়ন ২০২৬ (KG Final)',
    subject: 'English Phonics & Vocabulary',
    examDate: '2026-11-17',
    examDateBn: '১৭ নভেম্বর ২০২৬',
    dayNameBn: 'মঙ্গলবার',
    startTime: '১০:০০ AM',
    endTime: '১১:৩০ AM',
    durationMinutes: 90,
    room: 'রুম ২০৩ (কেজি শাখা)',
    syllabusTopics: 'Sight words, 3-letter CVC words, Sentence reading, Fill in the blanks',
    totalMarks: 100,
    passMarks: 40,
    examinerTeacherNameBn: 'মোস্তফা আল মামুন',
    assessmentType: 'written',
    instructionsBn: 'বানান শুদ্ধতার ওপর অতিরিক্ত ৫ নম্বর থাকবে।',
    status: 'upcoming',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'exam-kg-3',
    className: 'KG',
    examTitle: 'বার্ষিক চূড়ান্ত মূল্যায়ন ২০২৬ (KG Final)',
    subject: 'প্রাথমিক গণিত ও নামতা',
    examDate: '2026-11-19',
    examDateBn: '১৯ নভেম্বর ২০২৬',
    dayNameBn: 'বৃহস্পতিবার',
    startTime: '১০:০০ AM',
    endTime: '১১:৩০ AM',
    durationMinutes: 90,
    room: 'রুম ২০৩ (কেজি শাখা)',
    syllabusTopics: '১ থেকে ৫০ সংখ্যা ও কথায় লেখা, সহজ ১ অঙ্কের যোগ ও বিয়োগ, ২ ও ৩ এর নামতা',
    totalMarks: 100,
    passMarks: 40,
    examinerTeacherNameBn: 'ফাতেমা আক্তার',
    assessmentType: 'written',
    instructionsBn: 'রাফ কাজের জন্য পরীক্ষার খাতার ডানপাশে মার্জিন টানতে হবে।',
    status: 'upcoming',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },

  // --- Class 1 Assessments ---
  {
    id: 'exam-c1-1',
    className: 'Class-1',
    examTitle: 'বার্ষিক সমাপনী পরীক্ষা ২০২৬ (Class 1)',
    subject: 'বাংলা ১ম পত্র',
    examDate: '2026-11-15',
    examDateBn: '১৫ নভেম্বর ২০২৬',
    dayNameBn: 'রবিবার',
    startTime: '১১:৩০ AM',
    endTime: '০১:০০ PM',
    durationMinutes: 90,
    room: 'রুম ২০৫',
    syllabusTopics: 'আমার বই ১ম শ্রেণি সম্পূর্ণ, শব্দার্থ, বাক্য তৈরি ও সঠিক উত্তর নির্বাচন',
    totalMarks: 100,
    passMarks: 40,
    examinerTeacherNameBn: 'মোস্তফা আল মামুন',
    assessmentType: 'written',
    instructionsBn: 'পরীক্ষার ৩০ মিনিট পূর্বে শ্রেণিকক্ষে প্রবেশ বাধ্যতামূলক।',
    status: 'upcoming',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'exam-c1-2',
    className: 'Class-1',
    examTitle: 'বার্ষিক সমাপনী পরীক্ষা ২০২৬ (Class 1)',
    subject: 'English For Today',
    examDate: '2026-11-17',
    examDateBn: '১৭ নভেম্বর ২০২৬',
    dayNameBn: 'মঙ্গলবার',
    startTime: '১১:৩০ AM',
    endTime: '০১:০০ PM',
    durationMinutes: 90,
    room: 'রুম ২০৫',
    syllabusTopics: 'English for Today Units 15-28, Rhyme recitation, Simple comprehension',
    totalMarks: 100,
    passMarks: 40,
    examinerTeacherNameBn: 'তানজিলা হক',
    assessmentType: 'written',
    instructionsBn: 'Please carry pencil box and ruler.',
    status: 'upcoming',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },

  // --- Class 2 Assessments ---
  {
    id: 'exam-c2-1',
    className: 'Class-2',
    examTitle: 'বার্ষিক সমাপনী পরীক্ষা ২০২৬ (Class 2)',
    subject: 'প্রাথমিক গণিত ও জ্যামিতি',
    examDate: '2026-11-19',
    examDateBn: '১৯ নভেম্বর ২০২৬',
    dayNameBn: 'বৃহস্পতিবার',
    startTime: '০১:৩০ PM',
    endTime: '০৩:০০ PM',
    durationMinutes: 90,
    room: 'রুম ২০৬',
    syllabusTopics: '২ অঙ্কের যোগ, বিয়োগ, গুণ ও ভাগ, জ্যামিতিক আকৃতি (ত্রিভুজ, চতুর্ভুজ ও বৃত্ত)',
    totalMarks: 100,
    passMarks: 40,
    examinerTeacherNameBn: 'মোস্তফা আল মামুন',
    assessmentType: 'written',
    instructionsBn: 'স্কেল ও পেনসিল জ্যামিতির জন্য আবশ্যক।',
    status: 'upcoming',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },

  // --- HateKhori Assessments ---
  {
    id: 'exam-hk-1',
    className: 'HateKhori',
    examTitle: 'হাতেখড়ি প্রাথমিক মেধা বিকাশ মূল্যায়ন',
    subject: 'শব্দ ও বস্তু মেলানো (মৌখিক খেলা)',
    examDate: '2026-11-16',
    examDateBn: '১৬ নভেম্বর ২০২৬',
    dayNameBn: 'সোমবার',
    startTime: '০৯:০০ AM',
    endTime: '১০:০০ AM',
    durationMinutes: 60,
    room: 'মন্টেসরি আর্লি লার্নিং ল্যাব',
    syllabusTopics: 'পশুপাখির ছবি দেখে নাম বলা, ফল ও ফুলের পরিচিতি, মিষ্টি কথায় কুশল বিনিময়',
    totalMarks: 25,
    passMarks: 10,
    examinerTeacherNameBn: 'ফাতেমা আক্তার',
    assessmentType: 'oral',
    instructionsBn: 'মন্টেশরি উপকরণ দিয়ে আনন্দমুখর খেলাধুলায় পরীক্ষা নেওয়া হবে।',
    status: 'upcoming',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },
];

/**
 * Retrieve all exam schedules from localStorage or fallback to default initial list
 */
export function getExamSchedules(): ExamScheduleItem[] {
  if (typeof window === 'undefined') return INITIAL_EXAM_SCHEDULES;

  try {
    const raw = localStorage.getItem(EXAM_SCHEDULE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EXAM_SCHEDULE_STORAGE_KEY, JSON.stringify(INITIAL_EXAM_SCHEDULES));
      return INITIAL_EXAM_SCHEDULES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_EXAM_SCHEDULES;
  } catch (err) {
    console.error('Error reading exam schedules from localStorage:', err);
    return INITIAL_EXAM_SCHEDULES;
  }
}

/**
 * Save exam schedules to localStorage and dispatch event for cross-tab reactivity
 */
export function saveExamSchedules(items: ExamScheduleItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(EXAM_SCHEDULE_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(
      new CustomEvent(EXAM_SCHEDULE_UPDATE_EVENT, {
        detail: { count: items.length },
      })
    );
  } catch (err) {
    console.error('Error saving exam schedules to localStorage:', err);
  }
}

/**
 * Add a new exam schedule item
 */
export function addExamSchedule(
  item: Omit<ExamScheduleItem, 'id' | 'createdAt' | 'updatedAt'>
): ExamScheduleItem {
  const all = getExamSchedules();
  const newItem: ExamScheduleItem = {
    ...item,
    id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newItem, ...all];
  saveExamSchedules(updated);
  return newItem;
}

/**
 * Update an existing exam schedule item
 */
export function updateExamSchedule(
  id: string,
  updates: Partial<Omit<ExamScheduleItem, 'id' | 'createdAt'>>
): ExamScheduleItem | null {
  const all = getExamSchedules();
  const index = all.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const updatedItem: ExamScheduleItem = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updatedItem;
  saveExamSchedules(all);
  return updatedItem;
}

/**
 * Delete an exam schedule item
 */
export function deleteExamSchedule(id: string): boolean {
  const all = getExamSchedules();
  const filtered = all.filter((i) => i.id !== id);
  if (filtered.length === all.length) return false;

  saveExamSchedules(filtered);
  return true;
}

/**
 * Reset all exam schedules to default data
 */
export function resetExamSchedulesToDefault(): ExamScheduleItem[] {
  saveExamSchedules(INITIAL_EXAM_SCHEDULES);
  return INITIAL_EXAM_SCHEDULES;
}

/**
 * Calculate days remaining until exam
 */
export function getExamDaysRemaining(examDateStr: string): {
  days: number;
  labelBn: string;
  isToday: boolean;
  isPast: boolean;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = examDateStr.split('-').map(Number);
  const examDate = new Date(y, m - 1, d);
  examDate.setHours(0, 0, 0, 0);

  const diffTime = examDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { days: 0, labelBn: '🔴 আজ অনুষ্ঠিত হচ্ছে!', isToday: true, isPast: false };
  } else if (diffDays === 1) {
    return { days: 1, labelBn: '⏳ আগামীকাল পরীক্ষা', isToday: false, isPast: false };
  } else if (diffDays > 1) {
    return {
      days: diffDays,
      labelBn: `⏳ আর ${toBengaliNumber(diffDays)} দিন বাকি`,
      isToday: false,
      isPast: false,
    };
  } else {
    return {
      days: diffDays,
      labelBn: `✓ ${toBengaliNumber(Math.abs(diffDays))} দিন পূর্বে সম্পন্ন`,
      isToday: false,
      isPast: true,
    };
  }
}

/**
 * Human friendly label for Assessment Type
 */
export function getAssessmentTypeLabelBn(type: AssessmentType): string {
  switch (type) {
    case 'written':
      return '📝 লিখিত পরীক্ষা';
    case 'oral':
      return '🗣️ মৌখিক ও ছড়া মূল্যায়ন';
    case 'practical_activity':
      return '🧩 ব্যবহারিক ও অ্যাক্টিভিটি';
    case 'creative_drawing':
      return '🎨 অঙ্কন ও সৃজনশীল ক্রাফট';
    default:
      return 'মূল্যায়ন পরীক্ষা';
  }
}

/**
 * Export exam schedule to CSV formatted text
 */
export function exportExamScheduleToCsv(exams: ExamScheduleItem[]): string {
  const headers = [
    'ID',
    'Class',
    'Exam Title',
    'Subject',
    'Date',
    'Day',
    'Time',
    'Duration (Min)',
    'Room',
    'Assessment Type',
    'Total Marks',
    'Pass Marks',
    'Examiner',
    'Syllabus Topics',
    'Special Instructions',
  ];

  const escapeCsv = (str: string | number | undefined) => {
    if (str === undefined || str === null) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = exams.map((e) => [
    escapeCsv(e.id),
    escapeCsv(getSchoolClassNameBn(e.className)),
    escapeCsv(e.examTitle),
    escapeCsv(e.subject),
    escapeCsv(e.examDateBn || e.examDate),
    escapeCsv(e.dayNameBn),
    escapeCsv(`${e.startTime} - ${e.endTime}`),
    escapeCsv(e.durationMinutes),
    escapeCsv(e.room),
    escapeCsv(getAssessmentTypeLabelBn(e.assessmentType)),
    escapeCsv(e.totalMarks),
    escapeCsv(e.passMarks || 0),
    escapeCsv(e.examinerTeacherNameBn),
    escapeCsv(e.syllabusTopics),
    escapeCsv(e.instructionsBn || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Download CSV file for exam schedule
 */
export function downloadExamScheduleCsv(
  exams: ExamScheduleItem[],
  fileName = 'Ananda_Pathshala_Exam_Schedule_2026.csv'
): void {
  const csvContent = exportExamScheduleToCsv(exams);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
