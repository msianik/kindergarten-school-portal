import { SchoolClass, StudentExamResult, SubjectMark, ExamTerm } from '../types/school';
import { toBengaliNumber } from './schoolLogic';

export const EXAM_RESULTS_STORAGE_KEY = 'ananda_exam_results_v1';
export const EXAM_TERMS_STORAGE_KEY = 'ananda_exam_terms_v1';
export const EXAM_RESULTS_UPDATE_EVENT = 'ananda-exam-results-updated';

export interface GradeMeta {
  letterGrade: string;
  gradePoint: number;
  labelBn: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  remarksBn: string;
}

/**
 * Standard Kindergarten / Primary Grading Scale in Bangladesh
 */
export const GRADING_SCALE_TIERS = [
  { range: '৮০ - ১০০%', grade: 'A+', point: '৫.০০', performanceBn: 'অসাধারণ (Outstanding)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { range: '৭০ - ৭৯%', grade: 'A', point: '৪.০০', performanceBn: 'খুব ভালো (Very Good)', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { range: '৬০ - ৬৯%', grade: 'A-', point: '৩.৫০', performanceBn: 'ভালো (Good)', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { range: '৫০ - ৫৯%', grade: 'B', point: '৩.০০', performanceBn: 'সন্তোষজনক (Satisfactory)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { range: '৪০ - ৪৯%', grade: 'C', point: '২.০০', performanceBn: 'উন্নতি প্রয়োজন (Needs Improvement)', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { range: '৪০% এর নিচে', grade: 'F', point: '০.০০', performanceBn: 'অকৃতকার্য / ফেল (Fail)', color: 'bg-rose-100 text-rose-800 border-rose-300' },
];

export function calculateSubjectGrade(obtained: number, total: number): GradeMeta {
  if (total <= 0) {
    return {
      letterGrade: 'F',
      gradePoint: 0.0,
      labelBn: 'ফেল (F)',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200',
      remarksBn: 'মূল্যায়ন অসম্পূর্ণ',
    };
  }

  const percentage = (obtained / total) * 100;

  if (percentage >= 80) {
    return {
      letterGrade: 'A+',
      gradePoint: 5.0,
      labelBn: 'অসাধারণ (A+)',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
      remarksBn: 'চমৎকার পারফরম্যান্স',
    };
  } else if (percentage >= 70) {
    return {
      letterGrade: 'A',
      gradePoint: 4.0,
      labelBn: 'খুব ভালো (A)',
      badgeBg: 'bg-teal-50',
      badgeText: 'text-teal-700',
      badgeBorder: 'border-teal-200',
      remarksBn: 'খুব ভালো প্রস্তুতি',
    };
  } else if (percentage >= 60) {
    return {
      letterGrade: 'A-',
      gradePoint: 3.5,
      labelBn: 'ভালো (A-)',
      badgeBg: 'bg-cyan-50',
      badgeText: 'text-cyan-700',
      badgeBorder: 'border-cyan-200',
      remarksBn: 'ভালো প্রচেষ্টা',
    };
  } else if (percentage >= 50) {
    return {
      letterGrade: 'B',
      gradePoint: 3.0,
      labelBn: 'সন্তোষজনক (B)',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-700',
      badgeBorder: 'border-amber-200',
      remarksBn: 'সন্তোষজনক অগ্রগতি',
    };
  } else if (percentage >= 40) {
    return {
      letterGrade: 'C',
      gradePoint: 2.0,
      labelBn: 'উন্নতি প্রয়োজন (C)',
      badgeBg: 'bg-orange-50',
      badgeText: 'text-orange-700',
      badgeBorder: 'border-orange-200',
      remarksBn: 'আরও যত্নবান হতে হবে',
    };
  } else {
    return {
      letterGrade: 'F',
      gradePoint: 0.0,
      labelBn: 'অকৃতকার্য (F)',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200',
      remarksBn: 'পুনরায় নিবিড় অনুশীলন প্রয়োজন',
    };
  }
}

export function calculateOverallResult(subjects: SubjectMark[]): {
  totalMarks: number;
  totalObtained: number;
  percentage: number;
  gpa: number;
  overallGrade: string;
  status: 'passed' | 'needs_improvement';
} {
  if (!subjects || subjects.length === 0) {
    return {
      totalMarks: 0,
      totalObtained: 0,
      percentage: 0,
      gpa: 0,
      overallGrade: 'F',
      status: 'needs_improvement',
    };
  }

  const totalMarks = subjects.reduce((acc, sub) => acc + (sub.totalMarks || 0), 0);
  const totalObtained = subjects.reduce((acc, sub) => acc + (sub.obtainedMarks || 0), 0);
  const percentage = totalMarks > 0 ? Math.round((totalObtained / totalMarks) * 1000) / 10 : 0;

  const anyFailed = subjects.some((sub) => sub.letterGrade === 'F' || sub.obtainedMarks < sub.passMarks);
  const totalPoints = subjects.reduce((acc, sub) => acc + (sub.gradePoint || 0), 0);
  const averagePoint = subjects.length > 0 ? totalPoints / subjects.length : 0;

  const gpa = anyFailed ? 0 : Math.round(averagePoint * 100) / 100;

  let overallGrade = 'F';
  if (!anyFailed) {
    if (gpa >= 5.0) overallGrade = 'A+';
    else if (gpa >= 4.0) overallGrade = 'A';
    else if (gpa >= 3.5) overallGrade = 'A-';
    else if (gpa >= 3.0) overallGrade = 'B';
    else if (gpa >= 2.0) overallGrade = 'C';
    else overallGrade = 'F';
  }

  return {
    totalMarks,
    totalObtained,
    percentage,
    gpa,
    overallGrade,
    status: anyFailed ? 'needs_improvement' : 'passed',
  };
}

export const DEFAULT_EXAM_TERMS: ExamTerm[] = [
  {
    id: 'term-first-2026',
    titleBn: '১ম সাময়িক পরীক্ষা ২০২৬ (First Term)',
    academicYear: '২০২৬',
    termType: 'first_term',
    startDate: '2026-03-12',
    endDate: '2026-03-22',
    publishDateBn: '২৭ মার্চ ২০২৬',
    isPublished: true,
  },
  {
    id: 'term-second-2026',
    titleBn: '২য় সাময়িক পরীক্ষা ২০২৬ (Mid-Term Exam)',
    academicYear: '২০২৬',
    termType: 'second_term',
    startDate: '2026-07-10',
    endDate: '2026-07-20',
    publishDateBn: '২৫ জুলাই ২০২৬',
    isPublished: true,
  },
  {
    id: 'term-annual-2026',
    titleBn: 'বার্ষিক পরীক্ষা ২০২৬ (Annual Assessment)',
    academicYear: '২০২৬',
    termType: 'annual',
    startDate: '2026-11-15',
    endDate: '2026-11-25',
    publishDateBn: '২৮ নভেম্বর ২০২৬',
    isPublished: true,
  },
];

export const INITIAL_STUDENT_EXAM_RESULTS: StudentExamResult[] = [
  // std-0: তানিশা ইসলাম (HateKhori, Roll 100)
  {
    id: 'res-std-0-annual',
    studentId: 'std-0',
    studentNameBn: 'তানিশা ইসলাম',
    studentNameEn: 'Tanisha Islam',
    rollNo: '১০০',
    className: 'HateKhori',
    sectionBn: 'ক (গোলাপ)',
    examTermId: 'term-annual-2026',
    examTitleBn: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)',
    academicYear: '২০২৬',
    publishDateBn: '২৮ নভেম্বর ২০২৬',
    subjects: [
      {
        subjectCode: 'hk-1',
        subjectNameBn: 'বাংলা ছড়া ও বর্ণ পরিচিতি',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 47,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'ছবি দেখে স্বরবর্ণ সুন্দরভাবে বলতে পারে',
      },
      {
        subjectCode: 'hk-2',
        subjectNameBn: 'সংখ্যা গণনা ও ডট ম্যাচিং',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 48,
        highestMarksInClass: 50,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: '১ থেকে ১০ পর্যন্ত সংখ্যা গণনা নির্ভুল',
      },
      {
        subjectCode: 'hk-3',
        subjectNameBn: 'English Rhymes & Objects',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 46,
        highestMarksInClass: 48,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'ছড়ার সুরে হাততালি ও অঙ্গভঙ্গি খুব সুন্দর',
      },
      {
        subjectCode: 'hk-4',
        subjectNameBn: 'রং চেনা ও ড্রয়িং ক্রেয়ন গ্রিপ',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 48,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'রং মেলানো ও গোল বৃত্তে রং ভরাট চমৎকার',
      },
    ],
    totalMarks: 200,
    totalObtained: 189,
    percentage: 94.5,
    gpa: 5.0,
    overallGrade: 'A+',
    meritPosition: 1,
    status: 'passed',
    attendanceSummary: {
      totalWorkingDays: 90,
      presentDays: 88,
      attendancePercentage: 97.8,
    },
    coCurricularSkills: {
      disciplineBn: 'খুব শান্ত ও সুশৃঙ্খল',
      cleanlinessBn: 'পরিচ্ছন্ন ও ফিটফাট',
      friendlinessBn: 'সহপাঠীদের সাথে আনন্দ ভাগ করে নেয়',
      creativityBn: 'রং ও খেলনা সাজাতে ভালোবাসে',
    },
    classTeacherRemarksBn: 'তানিশা ক্লাসের একজন অত্যন্ত আদুরে ও মনোযোগী শিশু। অল্প বয়সেই তার স্মৃতিশক্তি ও শেখার আগ্রহ দারুণ প্রশংসনীয়।',
    principalRemarksBn: 'হাতেখড়ি পর্বে এমন চমৎকার সূচনা তার ভবিষ্যৎ শিক্ষাজীবনকে উজ্জ্বল করে তুলবে। শুভকামনা রইল!',
    isPublished: true,
    updatedAt: '2026-11-08T18:00:00Z',
  },

  // std-1: আদিত্য রায় (Nursery, Roll 101) - Demo Parent Subrata Roy
  // ১ম সাময়িক পরীক্ষা ২০২৬
  {
    id: 'res-std-1-first',
    studentId: 'std-1',
    studentNameBn: 'আদিত্য রায়',
    studentNameEn: 'Aditya Roy',
    rollNo: '১০১',
    className: 'Nursery',
    sectionBn: 'ক (শাপলা)',
    examTermId: 'term-first-2026',
    examTitleBn: '১ম সাময়িক পরীক্ষা ২০২৬ (First Term)',
    academicYear: '২০২৬',
    publishDateBn: '২৭ মার্চ ২০২৬',
    subjects: [
      {
        subjectCode: 'nur-1',
        subjectNameBn: 'বাংলা ও বর্ণমালা জ্ঞান',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 46,
        highestMarksInClass: 48,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'স্বরবর্ণ চেনা ও স্পষ্ট উচ্চারণে খুব ভালো',
      },
      {
        subjectCode: 'nur-2',
        subjectNameBn: 'সংখ্যা ও মৌলিক গণিত',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 47,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: '১ থেকে ২০ পর্যন্ত সুন্দর গণনা করে',
      },
      {
        subjectCode: 'nur-3',
        subjectNameBn: 'ইংরেজি ছড়া ও শব্দ পরিচিতি',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 45,
        highestMarksInClass: 48,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'A to M পর্যন্ত ছড়া ও ছবি সুন্দর বলতে পারে',
      },
      {
        subjectCode: 'nur-4',
        subjectNameBn: 'সৃজনশীল অঙ্কন ও রং মেলানো',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 47,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'রং চেনা ও সোজা-বাঁকা রেখা টানায় দারুণ দক্ষতা',
      },
      {
        subjectCode: 'nur-5',
        subjectNameBn: 'সাধারণ জ্ঞান ও স্বাস্থ্যবিধি',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 46,
        highestMarksInClass: 48,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'পরিষ্কার-পরিচ্ছন্নতা ও আদব-কায়দা খুবই ভালো',
      },
    ],
    totalMarks: 250,
    totalObtained: 231,
    percentage: 92.4,
    gpa: 5.0,
    overallGrade: 'A+',
    meritPosition: 2,
    status: 'passed',
    attendanceSummary: {
      totalWorkingDays: 52,
      presentDays: 50,
      attendancePercentage: 96.2,
    },
    coCurricularSkills: {
      disciplineBn: 'খুবই শান্ত ও মনোযোগী',
      cleanlinessBn: 'প্রতিদিন পরিপাটি ইউনিফর্ম',
      friendlinessBn: 'বন্ধুদের সাথে মিলেমিশে খেলাধুলা করে',
      creativityBn: 'ছড়া ও অভিনয়ে আনন্দিত অংশগ্রহণ',
    },
    classTeacherRemarksBn: 'আদিত্য ১ম সাময়িকে অত্যন্ত চমৎকার সূচনা করেছে। ক্লাসের সব কার্যক্রমে তার স্বতঃস্ফূর্ত আগ্রহ প্রশংসনীয়।',
    principalRemarksBn: 'শিক্ষাজীবনের শুরুতে আদিত্যের এমন একাগ্রতা ও সুশৃঙ্খলতা অত্যন্ত আশাব্যঞ্জক। শুভকামনা রইল!',
    isPublished: true,
    updatedAt: '2026-03-27T14:00:00Z',
  },

  // ২য় সাময়িক পরীক্ষা ২০২৬
  {
    id: 'res-std-1-second',
    studentId: 'std-1',
    studentNameBn: 'আদিত্য রায়',
    studentNameEn: 'Aditya Roy',
    rollNo: '১০১',
    className: 'Nursery',
    sectionBn: 'ক (শাপলা)',
    examTermId: 'term-second-2026',
    examTitleBn: '২য় সাময়িক পরীক্ষা ২০২৬ (Mid-Term Exam)',
    academicYear: '২০২৬',
    publishDateBn: '২৫ জুলাই ২০২৬',
    subjects: [
      {
        subjectCode: 'nur-1',
        subjectNameBn: 'বাংলা ও বর্ণমালা জ্ঞান',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 47,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'ব্যঞ্জনবর্ণ চেনা ও সাধারণ শব্দ গঠন খুব ভালো',
      },
      {
        subjectCode: 'nur-2',
        subjectNameBn: 'সংখ্যা ও মৌলিক গণিত',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 48,
        highestMarksInClass: 50,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'বস্তু গণনা ও ছোট-বড় তুলনা নিখুঁত',
      },
      {
        subjectCode: 'nur-3',
        subjectNameBn: 'ইংরেজি ছড়া ও শব্দ পরিচিতি',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 46,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'A to Z বলতে ও লিখতে পারে, সুন্দর উচ্চারণ',
      },
      {
        subjectCode: 'nur-4',
        subjectNameBn: 'সৃজনশীল অঙ্কন ও রং মেলানো',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 48,
        highestMarksInClass: 50,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'ছবি আঁকা ও রঙের সঠিক ব্যবহারে অসাধারণ অগ্রগতি',
      },
      {
        subjectCode: 'nur-5',
        subjectNameBn: 'সাধারণ জ্ঞান ও স্বাস্থ্যবিধি',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 47,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'জাতীয় ফল, ফুল ও পশুর নাম সুন্দরভাবে বলতে পারে',
      },
    ],
    totalMarks: 250,
    totalObtained: 236,
    percentage: 94.4,
    gpa: 5.0,
    overallGrade: 'A+',
    meritPosition: 1,
    status: 'passed',
    attendanceSummary: {
      totalWorkingDays: 68,
      presentDays: 66,
      attendancePercentage: 97.1,
    },
    coCurricularSkills: {
      disciplineBn: 'অনুকরণীয় নিয়মানুবর্তিতা',
      cleanlinessBn: 'খাবার আগে ও পরে হাত ধোয়ার অভ্যাস চমৎকার',
      friendlinessBn: 'ক্লাসে সবার সাথে সহযোগিতাপূর্ণ অমায়িক আচরণ',
      creativityBn: 'হাতের কাজ ও চিত্রাঙ্কনে বিশেষ পারদর্শী',
    },
    classTeacherRemarksBn: '২য় সাময়িকে আদিত্যের মেধা ও শৃঙ্খলার ধারাবাহিক উন্নতি ঘটেছে। প্রতিটি বিষয়ের প্রস্তুতি অত্যন্ত সুদৃঢ়।',
    principalRemarksBn: 'আদিত্যের ধারাবাহিক কৃতিত্ব ও চমৎকার আচরণ আনন্দ পাঠশালাকে গর্বিত করেছে।',
    isPublished: true,
    updatedAt: '2026-07-25T14:00:00Z',
  },

  // বার্ষিক পরীক্ষা ২০২৬
  {
    id: 'res-std-1-annual',
    studentId: 'std-1',
    studentNameBn: 'আদিত্য রায়',
    studentNameEn: 'Aditya Roy',
    rollNo: '১০১',
    className: 'Nursery',
    sectionBn: 'ক (শাপলা)',
    examTermId: 'term-annual-2026',
    examTitleBn: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)',
    academicYear: '২০২৬',
    publishDateBn: '২৮ নভেম্বর ২০২৬',
    subjects: [
      {
        subjectCode: 'nur-1',
        subjectNameBn: 'বাংলা ও বর্ণমালা জ্ঞান',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 48,
        highestMarksInClass: 50,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'স্বরবর্ণ ও ব্যঞ্জনবর্ণ নিখুঁত ও পরিচ্ছন্নভাবে লিখেছে',
      },
      {
        subjectCode: 'nur-2',
        subjectNameBn: 'সংখ্যা ও মৌলিক গণিত',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 49,
        highestMarksInClass: 50,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: '১-৩০ গণনা ও ব্লকের সাহায্যে হিসাব চমৎকার',
      },
      {
        subjectCode: 'nur-3',
        subjectNameBn: 'ইংরেজি ছড়া ও শব্দ পরিচিতি',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 47,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'A-Z বর্ণ ও চমৎকার উচ্চারণে ছড়া আবৃত্তি',
      },
      {
        subjectCode: 'nur-4',
        subjectNameBn: 'সৃজনশীল অঙ্কন ও রং মেলানো',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 46,
        highestMarksInClass: 48,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'জাতীয় পতাকা ও ফুলের রঙে সঠিক শেড ফুটিয়ে তুলেছে',
      },
      {
        subjectCode: 'nur-5',
        subjectNameBn: 'সাধারণ জ্ঞান ও স্বাস্থ্যবিধি',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 48,
        highestMarksInClass: 50,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'দৈনন্দিন স্বাস্থ্যবিধি ও জাতীয় প্রতীক সম্পর্কে স্পষ্ট ধারণা',
      },
    ],
    totalMarks: 250,
    totalObtained: 238,
    percentage: 95.2,
    gpa: 5.0,
    overallGrade: 'A+',
    meritPosition: 1,
    status: 'passed',
    attendanceSummary: {
      totalWorkingDays: 92,
      presentDays: 89,
      attendancePercentage: 96.7,
    },
    coCurricularSkills: {
      disciplineBn: 'অসাধারণ ও শতভাগ সুশৃঙ্খল',
      cleanlinessBn: 'প্রতিদিন পরিপাটি ও স্বাস্থ্যসচেতন',
      friendlinessBn: 'সহপাঠীদের সাথে অত্যন্ত আন্তরিক ও অমায়িক',
      creativityBn: 'ড্রয়িং, ক্রাফট ও উপস্থিত বুদ্ধিতে অত্যন্ত সক্রিয়',
    },
    classTeacherRemarksBn: 'আদিত্য ক্লাসের একজন অত্যন্ত ভদ্র, বিনয়ী ও মেধাবী ছাত্র। প্রতিটি বিষয়ে তার দখল ও নিয়মানুবর্তিতা সহপাঠীদের জন্য দৃষ্টান্তস্বরূপ।',
    principalRemarksBn: 'আনন্দ পাঠশালায় আদিত্য রায়ের মেধা, নীতিশিক্ষা ও বহুমুখী বিকাশ অত্যন্ত আনন্দদায়ক ও প্রশংসনীয়। ভবিষ্যৎ পথচলার জন্য প্রাণঢালা দোয়া রইল!',
    isPublished: true,
    updatedAt: '2026-11-08T18:30:00Z',
  },

  // std-2: সুমাইয়া জাহান (Play, Roll 102)
  {
    id: 'res-std-2-annual',
    studentId: 'std-2',
    studentNameBn: 'সুমাইয়া জাহান',
    studentNameEn: 'Sumaiya Jahan',
    rollNo: '১০২',
    className: 'Play',
    sectionBn: 'ক (টিউলিপ)',
    examTermId: 'term-annual-2026',
    examTitleBn: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)',
    academicYear: '২০২৬',
    publishDateBn: '২৮ নভেম্বর ২০২৬',
    subjects: [
      {
        subjectCode: 'pl-1',
        subjectNameBn: 'মৌখিক বাংলা ও ছড়া গান',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 48,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'মিষ্টি সুরে স্পষ্ট উচ্চারণে ছড়া গান গাইতে পারে',
      },
      {
        subjectCode: 'pl-2',
        subjectNameBn: 'গণিত গণনা ও আকৃতি মেলানো',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 47,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'বৃত্ত, ত্রিভুজ ও চতুর্ভুজ সুন্দরভাবে শনাক্ত করতে পারে',
      },
      {
        subjectCode: 'pl-3',
        subjectNameBn: 'English Phonics & Alphabet Rhymes',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 46,
        highestMarksInClass: 48,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'ইংরেজি বর্ণ ও ছবির উচ্চারণ স্পষ্ট',
      },
      {
        subjectCode: 'pl-4',
        subjectNameBn: 'মন্টেসরি অ্যাক্টিভিটি ও ড্রয়িং',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 47,
        highestMarksInClass: 48,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'হাতের গ্রিপ ও রঙের পছন্দ চমৎকার',
      },
    ],
    totalMarks: 200,
    totalObtained: 188,
    percentage: 94.0,
    gpa: 5.0,
    overallGrade: 'A+',
    meritPosition: 1,
    status: 'passed',
    attendanceSummary: {
      totalWorkingDays: 91,
      presentDays: 87,
      attendancePercentage: 95.6,
    },
    coCurricularSkills: {
      disciplineBn: 'খুব বিনয়ী ও বাধ্য',
      cleanlinessBn: 'সবসময় পরিচ্ছন্ন পোশাক ও আচরণ',
      friendlinessBn: 'খেলার সাথীদের সাথে সহজে ভাব জমায়',
      creativityBn: 'ক্লে দিয়ে পুতুল ও ফুল তৈরি করতে ভালোবাসে',
    },
    classTeacherRemarksBn: 'সুমাইয়া ক্লাসের প্রতিটি অ্যাক্টিভিটিতে হাসিমুখে অংশ নেয়। তার দ্রুত শেখার ক্ষমতা প্রশংসনীয়।',
    principalRemarksBn: 'প্লে গ্রুপে সুমাইয়ার সার্বিক বিকাশ আনন্দদায়ক। আগামী ক্লাসেও এই মেধার ধারাবাহিকতা বজায় থাকুক!',
    isPublished: true,
    updatedAt: '2026-11-08T18:00:00Z',
  },

  // std-3: আরিয়ান খান (KG, Roll 103)
  {
    id: 'res-std-3-annual',
    studentId: 'std-3',
    studentNameBn: 'আরিয়ান খান',
    studentNameEn: 'Aaryan Khan',
    rollNo: '১০৩',
    className: 'KG',
    sectionBn: 'খ (সূর্যমুখী)',
    examTermId: 'term-annual-2026',
    examTitleBn: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)',
    academicYear: '২০২৬',
    publishDateBn: '২৮ নভেম্বর ২০২৬',
    subjects: [
      {
        subjectCode: 'kg-1',
        subjectNameBn: 'বাংলা ভাষা ও যুক্তবর্ণ পরিচিতি',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 46,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'হাতের লেখা খুব সুন্দর ও স্পষ্ট',
      },
      {
        subjectCode: 'kg-2',
        subjectNameBn: 'প্রাথমিক গণিত ও নামতা',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 48,
        highestMarksInClass: 50,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'সহজ যোগ ও বিয়োগে চমৎকার দক্ষতা',
      },
      {
        subjectCode: 'kg-3',
        subjectNameBn: 'English Reading & Spelling',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 45,
        highestMarksInClass: 48,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'বানান শুদ্ধ ও আত্মবিশ্বাসের সাথে রিডিং পড়ে',
      },
      {
        subjectCode: 'kg-4',
        subjectNameBn: 'বিজ্ঞান ও পরিবেশ সচেতনতা',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 44,
        highestMarksInClass: 47,
        letterGrade: 'A',
        gradePoint: 4.0,
        remarksBn: 'গাছপালা ও পশুপাখি সম্পর্কে চমৎকার কৌতূহল',
      },
      {
        subjectCode: 'kg-5',
        subjectNameBn: 'চারু ও কারুকলা',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 45,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'কালার কম্বিনেশন ও চিত্রাঙ্কনে অসাধারণ মুনশিয়ানা',
      },
    ],
    totalMarks: 250,
    totalObtained: 228,
    percentage: 91.2,
    gpa: 4.8,
    overallGrade: 'A+',
    meritPosition: 2,
    status: 'passed',
    attendanceSummary: {
      totalWorkingDays: 92,
      presentDays: 88,
      attendancePercentage: 95.7,
    },
    coCurricularSkills: {
      disciplineBn: 'প্রাণবন্ত ও সময়নিষ্ঠ',
      cleanlinessBn: 'ক্লাসরুম পরিষ্কার রাখতে সাহায্য করে',
      friendlinessBn: 'নেতৃত্বসুলভ ও দলবদ্ধ খেলায় দারুণ',
      creativityBn: 'নতুন নতুন ছবি আঁকায় উৎসাহী',
    },
    classTeacherRemarksBn: 'আরিয়ান গণিত ও যুক্তিতে বেশ অগ্রসর। ক্লাসে নিয়মিত পড়াশোনার পাশাপাশি খেলাধুলাতেও সমান দক্ষ।',
    principalRemarksBn: 'আরিয়ানের আত্মবিশ্বাস ও অনুসন্ধিৎসু মন সত্যিই চমৎকার। শুভকামনা রইল!',
    isPublished: true,
    updatedAt: '2026-11-08T18:00:00Z',
  },

  // std-4: জারা তাবাসসুম (Class-1, Roll 104)
  {
    id: 'res-std-4-annual',
    studentId: 'std-4',
    studentNameBn: 'জারা তাবাসসুম',
    studentNameEn: 'Zara Tabassum',
    rollNo: '১০৪',
    className: 'Class-1',
    sectionBn: 'ক (পদ্মা)',
    examTermId: 'term-annual-2026',
    examTitleBn: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)',
    academicYear: '২০২৬',
    publishDateBn: '২৮ নভেম্বর ২০২৬',
    subjects: [
      {
        subjectCode: 'c1-1',
        subjectNameBn: 'আমার বাংলা বই ও ব্যাকরণ',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 48,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'কবিতা আবৃত্তি ও বাক্য গঠন নির্ভুল',
      },
      {
        subjectCode: 'c1-2',
        subjectNameBn: 'প্রাথমিক গণিত',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 49,
        highestMarksInClass: 50,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'যোগ, বিয়োগ ও জ্যামিতিক ধারণা নিখুঁত',
      },
      {
        subjectCode: 'c1-3',
        subjectNameBn: 'English For Today',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 47,
        highestMarksInClass: 48,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'সাবলীল ইংরেজি পাঠ ও ডায়ালগে দারুণ',
      },
      {
        subjectCode: 'c1-4',
        subjectNameBn: 'পরিবেশ পরিচিতি ও সমাজ',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 46,
        highestMarksInClass: 48,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'সমাজ ও নিয়মানুবর্তিতা সম্পর্কে গভীর উপলব্ধি',
      },
      {
        subjectCode: 'c1-5',
        subjectNameBn: 'সৃজনশীল চিত্রাঙ্কন',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 47,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'গ্রাম্য দৃশ্যের চিত্রাঙ্কন চমৎকার হয়েছে',
      },
    ],
    totalMarks: 250,
    totalObtained: 237,
    percentage: 94.8,
    gpa: 5.0,
    overallGrade: 'A+',
    meritPosition: 1,
    status: 'passed',
    attendanceSummary: {
      totalWorkingDays: 92,
      presentDays: 90,
      attendancePercentage: 97.8,
    },
    coCurricularSkills: {
      disciplineBn: 'অনুশাসন ও নীতিশিক্ষায় আদর্শ',
      cleanlinessBn: 'নিখুঁত পরিচ্ছন্নতা ও শালীনতা',
      friendlinessBn: 'সকলের প্রতি সহানুভূতিশীল ও ভদ্র',
      creativityBn: 'রচনা ও চিত্রাঙ্কনে অসাধারণ কল্পনাশক্তি',
    },
    classTeacherRemarksBn: 'জারা তার প্রতিটি বিষয়ের হোমওয়ার্ক ও ক্লাসরুম কাজে শতভাগ দায়িত্বশীলতা প্রদর্শন করে।',
    principalRemarksBn: 'জারার সার্বিক ফলাফল ও চরিত্র আনন্দ পাঠশালার মুখ উজ্জ্বল করেছে। সাফল্য অব্যাহত থাকুক!',
    isPublished: true,
    updatedAt: '2026-11-08T18:00:00Z',
  },

  // std-5: রায়ান চৌধুরী (Class-2, Roll 105)
  {
    id: 'res-std-5-annual',
    studentId: 'std-5',
    studentNameBn: 'রায়ান চৌধুরী',
    studentNameEn: 'Rayan Chowdhury',
    rollNo: '১০৫',
    className: 'Class-2',
    sectionBn: 'ক (মেঘনা)',
    examTermId: 'term-annual-2026',
    examTitleBn: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)',
    academicYear: '২০২৬',
    publishDateBn: '২৮ নভেম্বর ২০২৬',
    subjects: [
      {
        subjectCode: 'c2-1',
        subjectNameBn: 'বাংলা পাঠ ও ব্যাকরণ',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 46,
        highestMarksInClass: 48,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'অনুচ্ছেদ লিখন ও বানান নির্ভুল',
      },
      {
        subjectCode: 'c2-2',
        subjectNameBn: 'প্রাথমিক গণিত ও সমাধান',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 47,
        highestMarksInClass: 50,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'গুণ ও ভাগের কথায় অঙ্কে দারুণ সাবলীল',
      },
      {
        subjectCode: 'c2-3',
        subjectNameBn: 'English Grammar & Composition',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 44,
        highestMarksInClass: 48,
        letterGrade: 'A',
        gradePoint: 4.0,
        remarksBn: 'ছোট ছোট প্যারাগ্রাফ ও ভোকাবুলারি সমৃদ্ধ',
      },
      {
        subjectCode: 'c2-4',
        subjectNameBn: 'প্রাথমিক বিজ্ঞান ও তথ্য',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 45,
        highestMarksInClass: 47,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'বিজ্ঞানভিত্তিক ছোট ছোট প্রজেক্টে আগ্রহী',
      },
      {
        subjectCode: 'c2-5',
        subjectNameBn: 'ইসলাম ও নৈতিক শিক্ষা / অঙ্কন',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 46,
        highestMarksInClass: 49,
        letterGrade: 'A+',
        gradePoint: 5.0,
        remarksBn: 'শিষ্টাচার ও নৈতিক গুণাবলী প্রশংসনীয়',
      },
    ],
    totalMarks: 250,
    totalObtained: 228,
    percentage: 91.2,
    gpa: 4.8,
    overallGrade: 'A+',
    meritPosition: 1,
    status: 'passed',
    attendanceSummary: {
      totalWorkingDays: 92,
      presentDays: 89,
      attendancePercentage: 96.7,
    },
    coCurricularSkills: {
      disciplineBn: 'সময়ানুবর্তী ও দায়িত্বশীল',
      cleanlinessBn: 'বই-খাতা পরিপাটি রাখা প্রশংসনীয়',
      friendlinessBn: 'বন্ধুদের সহযোগিতায় সবসময় প্রস্তুত',
      creativityBn: 'বিজ্ঞান প্রজেক্ট ও কুইজে দারুণ চটপটে',
    },
    classTeacherRemarksBn: 'রায়ান একজন অত্যন্ত উদ্যমী ও কৌতূহলী শিক্ষার্থী। কঠিন বিষয়ও দ্রুত আত্মস্থ করতে পারে।',
    principalRemarksBn: 'ক্লাস-২ এ রায়ানের মেধার স্বীকৃতি আনন্দদায়ক। আগামী দিনে তার আরও বড় সাফল্য কামনা করি!',
    isPublished: true,
    updatedAt: '2026-11-08T18:00:00Z',
  },
];

/**
 * Retrieves exam results from localStorage, or falls back to INITIAL_STUDENT_EXAM_RESULTS
 */
export function getStoredExamResults(): StudentExamResult[] {
  if (typeof window === 'undefined') return INITIAL_STUDENT_EXAM_RESULTS;
  try {
    const raw = localStorage.getItem(EXAM_RESULTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure new initial items (such as 1st/2nd term results) are merged in
        const existingIds = new Set(parsed.map((r: any) => r.id));
        const missingInitial = INITIAL_STUDENT_EXAM_RESULTS.filter((r) => !existingIds.has(r.id));
        if (missingInitial.length > 0) {
          const merged = [...parsed, ...missingInitial];
          localStorage.setItem(EXAM_RESULTS_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse stored exam results:', err);
  }
  return INITIAL_STUDENT_EXAM_RESULTS;
}

/**
 * Saves exam results to localStorage and dispatches a change event
 */
export function saveExamResults(results: StudentExamResult[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXAM_RESULTS_STORAGE_KEY, JSON.stringify(results));
    window.dispatchEvent(new CustomEvent(EXAM_RESULTS_UPDATE_EVENT, { detail: results }));
  } catch (err) {
    console.error('Failed to save exam results:', err);
  }
}

/**
 * Retrieves exam terms
 */
export function getStoredExamTerms(): ExamTerm[] {
  if (typeof window === 'undefined') return DEFAULT_EXAM_TERMS;
  try {
    const raw = localStorage.getItem(EXAM_TERMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((t: any) => t.id));
        const missingTerms = DEFAULT_EXAM_TERMS.filter((t) => !existingIds.has(t.id));
        if (missingTerms.length > 0) {
          const merged = [...DEFAULT_EXAM_TERMS];
          localStorage.setItem(EXAM_TERMS_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse stored exam terms:', err);
  }
  return DEFAULT_EXAM_TERMS;
}

/**
 * Saves exam terms
 */
export function saveExamTerms(terms: ExamTerm[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXAM_TERMS_STORAGE_KEY, JSON.stringify(terms));
    window.dispatchEvent(new CustomEvent(EXAM_RESULTS_UPDATE_EVENT));
  } catch (err) {
    console.error('Failed to save exam terms:', err);
  }
}

/**
 * Updates a single student's exam result with recalculations of totals, grades, and GPA
 */
export function updateStudentExamResult(
  studentId: string,
  examTermId: string,
  subjects: SubjectMark[],
  teacherRemarks?: string,
  principalRemarks?: string,
  coCurricular?: StudentExamResult['coCurricularSkills']
): StudentExamResult | null {
  const allResults = getStoredExamResults();
  const index = allResults.findIndex((r) => r.studentId === studentId && r.examTermId === examTermId);
  if (index === -1) return null;

  const current = allResults[index];
  const overall = calculateOverallResult(subjects);

  const updated: StudentExamResult = {
    ...current,
    subjects,
    totalMarks: overall.totalMarks,
    totalObtained: overall.totalObtained,
    percentage: overall.percentage,
    gpa: overall.gpa,
    overallGrade: overall.overallGrade,
    status: overall.status,
    teacherRemarksBn: teacherRemarks !== undefined ? teacherRemarks : current.classTeacherRemarksBn,
    principalRemarksBn: principalRemarks !== undefined ? principalRemarks : current.principalRemarksBn,
    coCurricularSkills: coCurricular || current.coCurricularSkills,
    updatedAt: new Date().toISOString(),
  };

  allResults[index] = updated;

  // Recalculate merit positions for this class and exam term
  recalculateMeritPositions(allResults, current.className, examTermId);

  saveExamResults(allResults);
  return allResults[index];
}

/**
 * Sorts and updates merit positions based on totalObtained marks and GPA
 */
function recalculateMeritPositions(
  results: StudentExamResult[],
  className: SchoolClass,
  examTermId: string
): void {
  const classResults = results.filter((r) => r.className === className && r.examTermId === examTermId);
  classResults.sort((a, b) => {
    if (b.totalObtained !== a.totalObtained) {
      return b.totalObtained - a.totalObtained;
    }
    return b.gpa - a.gpa;
  });

  classResults.forEach((res, rank) => {
    res.meritPosition = rank + 1;
  });
}

/**
 * Toggles or sets the published status of an exam term or class
 */
export function toggleExamPublishStatus(examTermId: string, isPublished: boolean): void {
  const terms = getStoredExamTerms();
  const termIdx = terms.findIndex((t) => t.id === examTermId);
  if (termIdx !== -1) {
    terms[termIdx].isPublished = isPublished;
    saveExamTerms(terms);
  }

  const results = getStoredExamResults();
  const updatedResults = results.map((r) => {
    if (r.examTermId === examTermId) {
      return { ...r, isPublished };
    }
    return r;
  });
  saveExamResults(updatedResults);
}

/**
 * Resets exam results to default
 */
export function resetExamResultsToDefault(): StudentExamResult[] {
  saveExamResults(INITIAL_STUDENT_EXAM_RESULTS);
  saveExamTerms(DEFAULT_EXAM_TERMS);
  return INITIAL_STUDENT_EXAM_RESULTS;
}

/**
 * Exports exam results for a class to RFC 4180 CSV with UTF-8 BOM
 */
export function exportClassResultsCsv(
  className: SchoolClass,
  examTermId: string,
  results: StudentExamResult[]
): void {
  const filtered = results.filter((r) => r.className === className && r.examTermId === examTermId);
  if (filtered.length === 0) return;

  const firstStudent = filtered[0];
  const subjectHeaders = firstStudent.subjects.map((s) => `"${s.subjectNameBn} (${toBengaliNumber(s.totalMarks)})"`).join(',');

  const header = `\uFEFF"রোল","শিক্ষার্থীর নাম","শ্রেণি","পরীক্ষা",${subjectHeaders},"মোট নম্বর","প্রাপ্ত নম্বর","শতকরা হার (%)","GPA","গ্রেড","মেধা স্থান","স্ট্যাটাস"\r\n`;

  const rows = filtered
    .map((res) => {
      const subjectCols = res.subjects.map((s) => `"${toBengaliNumber(s.obtainedMarks)} (${s.letterGrade})"`).join(',');
      return `"${res.rollNo}","${res.studentNameBn}","${res.className}","${res.examTitleBn}",${subjectCols},"${toBengaliNumber(res.totalMarks)}","${toBengaliNumber(res.totalObtained)}","${toBengaliNumber(res.percentage)}%","${toBengaliNumber(res.gpa.toFixed(2))}","${res.overallGrade}","${toBengaliNumber(res.meritPosition)}","${res.status === 'passed' ? 'উত্তীর্ণ' : 'উন্নতি প্রয়োজন'}"`;
    })
    .join('\r\n');

  const csvContent = header + rows;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ananda-exam-results-${className}-${examTermId}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
