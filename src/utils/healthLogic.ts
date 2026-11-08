import {
  SchoolClass,
  StudentHealthProfile,
  StudentAllergyItem,
  VaccinationRecord,
  ChildGrowthEntry,
} from '../types/school';
import { toBengaliNumber } from './schoolLogic';

export const HEALTH_PROFILES_STORAGE_KEY = 'ananda_health_profiles_v1';
export const HEALTH_PROFILES_UPDATE_EVENT = 'ananda-health-profiles-updated';

export interface BmiResult {
  bmi: number;
  statusBn: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  adviceBn: string;
}

/**
 * Calculates BMI and evaluates childhood growth tier for Early Childhood / Kindergarten (ages 3-8)
 */
export function calculateBmi(heightCm: number, weightKg: number): BmiResult {
  if (heightCm <= 0 || weightKg <= 0) {
    return {
      bmi: 0,
      statusBn: 'তথ্য অসম্পূর্ণ',
      color: 'border-slate-200 text-slate-500 bg-slate-50',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-600',
      adviceBn: 'উচ্চতা ও ওজন পরিমাপ করুন',
    };
  }

  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  if (bmi < 13.8) {
    return {
      bmi,
      statusBn: 'কম ওজন (Underweight)',
      color: 'border-amber-300 text-amber-800 bg-amber-50',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      adviceBn: 'পুষ্টিকর খাদ্য ও প্রোটিন সমৃদ্ধ খাবার দেওয়া প্রয়োজন',
    };
  } else if (bmi <= 17.2) {
    return {
      bmi,
      statusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
      color: 'border-emerald-300 text-emerald-800 bg-emerald-50',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      adviceBn: 'শারীরিক বৃদ্ধি ও উচ্চতা চমৎকার অনুপাতে রয়েছে',
    };
  } else if (bmi <= 19.0) {
    return {
      bmi,
      statusBn: 'কিছুটা ভারী (Overweight)',
      color: 'border-orange-300 text-orange-800 bg-orange-50',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-800',
      adviceBn: 'নিয়মিত খেলাধুলা ও চিনিযুক্ত খাবার কমানো দরকার',
    };
  } else {
    return {
      bmi,
      statusBn: 'অতিরিক্ত স্থূলতা (Obese)',
      color: 'border-rose-300 text-rose-800 bg-rose-50',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      adviceBn: 'শিশু বিশেষজ্ঞ ও পুষ্টিবিদের পরামর্শ গ্রহণ করুন',
    };
  }
}

const DEFAULT_VACCINATION_SCHEDULE: VaccinationRecord[] = [
  {
    id: 'vac-1',
    nameBn: 'বিসিজি (BCG - যক্ষ্মা)',
    doseLabelBn: '১ম ডোজ (জন্মের পর)',
    isCompleted: true,
    administeredDateBn: 'সম্পূর্ণ ✓',
  },
  {
    id: 'vac-2',
    nameBn: 'পেন্টাভ্যালেন্ট (Pentavalent - ডিপিটি, হেপাটাইটিস-বি ও হিব)',
    doseLabelBn: '৩টি ডোজ সম্পূর্ণ',
    isCompleted: true,
    administeredDateBn: 'সম্পূর্ণ ✓',
  },
  {
    id: 'vac-3',
    nameBn: 'পোলিও (OPV & IPV)',
    doseLabelBn: '৪টি ডোজ সম্পূর্ণ',
    isCompleted: true,
    administeredDateBn: 'সম্পূর্ণ ✓',
  },
  {
    id: 'vac-4',
    nameBn: 'নিউমোকক্কাল (PCV - নিউমোনিয়া)',
    doseLabelBn: '৩টি ডোজ সম্পূর্ণ',
    isCompleted: true,
    administeredDateBn: 'সম্পূর্ণ ✓',
  },
  {
    id: 'vac-5',
    nameBn: 'এমআর (MR - হাম ও রুবেলা)',
    doseLabelBn: '২টি ডোজ সম্পূর্ণ',
    isCompleted: true,
    administeredDateBn: 'সম্পূর্ণ ✓',
  },
  {
    id: 'vac-6',
    nameBn: 'টাইফয়েড ও বুস্টার ডোজ',
    doseLabelBn: 'বুস্টার ডোজ',
    isCompleted: true,
    administeredDateBn: 'সম্পূর্ণ ✓',
  },
];

export const INITIAL_STUDENT_HEALTH_PROFILES: StudentHealthProfile[] = [
  // std-0: তানিশা ইসলাম (HateKhori, Roll 100)
  {
    studentId: 'std-0',
    studentNameBn: 'তানিশা ইসলাম',
    studentNameEn: 'Tanisha Islam',
    rollNo: '১০০',
    className: 'HateKhori',
    sectionBn: 'ক (গোলাপ)',
    bloodGroup: 'A+',
    heightCm: 88.0,
    weightKg: 12.2,
    bmi: 15.7,
    bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
    growthMilestoneBn: 'চটপটে শারীরিক ভারসাম্য ও দৌড়ঝাঁপ',
    allergiesList: [],
    criticalHealthAlertBn: undefined,
    regularMedicationsBn: 'কোনো নিয়মিত ওষুধ নেই',
    emergencyDoctorNameBn: 'ডা. আব্দুল্লাহ আল মাহমুদ',
    emergencyDoctorPhone: '০১৯১২-৩৩৪৪৫৫',
    vaccinations: DEFAULT_VACCINATION_SCHEDULE,
    growthHistory: [
      {
        date: '2026-03-10',
        dateBn: '১০ মার্চ ২০২৬',
        heightCm: 84.0,
        weightKg: 11.2,
        bmi: 15.9,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'ভর্তিকালীন প্রাথমিক স্বাস্থ্য চেকআপ',
      },
      {
        date: '2026-07-15',
        dateBn: '১৫ জুলাই ২০২৬',
        heightCm: 86.0,
        weightKg: 11.8,
        bmi: 15.9,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'মধ্যবর্তী মূল্যায়ন',
      },
      {
        date: '2026-10-25',
        dateBn: '২৫ অক্টোবর ২০২৬',
        heightCm: 88.0,
        weightKg: 12.2,
        bmi: 15.7,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'বার্ষিক সামগ্রিক স্বাস্থ্য পরীক্ষা',
      },
    ],
    lastCheckedDateBn: '২৫ অক্টোবর ২০২৬',
    updatedByTeacherBn: 'ফাতেমা আক্তার',
    updatedAt: '2026-10-25T10:00:00Z',
  },

  // std-1: আদিত্য রায় (Nursery, Roll 101) - Critical Peanut & Shrimp Allergy
  {
    studentId: 'std-1',
    studentNameBn: 'আদিত্য রায়',
    studentNameEn: 'Aditya Roy',
    rollNo: '১০১',
    className: 'Nursery',
    sectionBn: 'ক (শাপলা)',
    bloodGroup: 'B+',
    heightCm: 92.0,
    weightKg: 13.5,
    bmi: 15.9,
    bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
    growthMilestoneBn: 'শারীরিক অঙ্গবিন্যাস ও ফাইন মোটর গ্রিপ আদর্শ',
    allergiesList: [
      {
        allergenBn: 'চিনাবাদাম (Peanut)',
        severity: 'critical',
        reactionBn: 'গলায় চুলকানি, ফুসকুড়ি ও শ্বাসকষ্ট',
        actionGuideBn: 'টিফিনে কখনও চিনাবাদাম বা বাদামযুক্ত কুকিজ/কেক দেওয়া যাবে না। সহপাঠীর খাবার শেয়ার করার সময় নজর রাখুন।',
      },
      {
        allergenBn: 'চিংড়ি মাছ (Shrimp)',
        severity: 'moderate',
        reactionBn: 'ত্বকে অ্যালার্জি ও পেটে ব্যথা',
        actionGuideBn: 'টিফিন বক্স থেকে চিংড়িজাতীয় খাবার বর্জন নিশ্চিত করতে হবে।',
      },
    ],
    criticalHealthAlertBn: '🚨 সতর্কতা: চিনাবাদাম ও চিংড়ি সম্পূর্ণ নিষিদ্ধ! হঠাৎ ফুসকুড়ি বা শ্বাসকষ্ট দেখা দিলে তাৎক্ষণিক অভিভাবক ও স্কুল মেডিসিন কিট ব্যবহার করুন।',
    regularMedicationsBn: 'দুপুর ১২:০০ টায় টিফিনের পর ১ চামচ মাল্টিভিটামিন ও জিংক সিরাপ (অভিভাবকের অনুরোধে)।',
    emergencyDoctorNameBn: 'ডা. প্রদ্যুৎ কুমার সেন (শিশু বিশেষজ্ঞ)',
    emergencyDoctorPhone: '০১৭১২-১১২২৩৩',
    vaccinations: DEFAULT_VACCINATION_SCHEDULE,
    growthHistory: [
      {
        date: '2026-02-15',
        dateBn: '১৫ ফেব্রুয়ারি ২০২৬',
        heightCm: 88.5,
        weightKg: 12.4,
        bmi: 15.8,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'সেশন শুরুর নিয়মিত চেকআপ',
      },
      {
        date: '2026-06-20',
        dateBn: '২০ জুন ২০২৬',
        heightCm: 90.0,
        weightKg: 13.0,
        bmi: 16.0,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'ষান্মাসিক বৃদ্ধি রেকর্ড',
      },
      {
        date: '2026-10-28',
        dateBn: '২৮ অক্টোবর ২০২৬',
        heightCm: 92.0,
        weightKg: 13.5,
        bmi: 15.9,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'বার্ষিক হেলথ স্ক্রিনিং: স্বাভাবিক গ্রোথ ও সুস্থ শারীরিক অবস্থা',
      },
    ],
    lastCheckedDateBn: '২৮ অক্টোবর ২০২৬',
    updatedByTeacherBn: 'ফাতেমা আক্তার',
    updatedAt: '2026-10-28T11:00:00Z',
  },

  // std-2: সুমাইয়া জাহান (Play, Roll 102) - Egg & Dust Allergy
  {
    studentId: 'std-2',
    studentNameBn: 'সুমাইয়া জাহান',
    studentNameEn: 'Sumaiya Jahan',
    rollNo: '১০২',
    className: 'Play',
    sectionBn: 'ক (টিউলিপ)',
    bloodGroup: 'O+',
    heightCm: 90.0,
    weightKg: 12.8,
    bmi: 15.8,
    bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
    growthMilestoneBn: 'খুব প্রাণবন্ত ও হাসিখুশি চঞ্চলতা',
    allergiesList: [
      {
        allergenBn: 'ডিমের সাদা অংশ (Egg white)',
        severity: 'moderate',
        reactionBn: 'ত্বকে চুলকানি ও পেটে অস্বস্তি',
        actionGuideBn: 'টিফিনে ডিম বর্জন করতে হবে।',
      },
      {
        allergenBn: 'ধুলাবালি (Dust)',
        severity: 'mild',
        reactionBn: 'হাঁচি ও চোখের পানি',
        actionGuideBn: 'মাঠের ধুলোযুক্ত খেলা শেষে হাত-মুখ ধুতে সাহায্য করুন।',
      },
    ],
    criticalHealthAlertBn: '⚠️ ডিমের অ্যালার্জি রয়েছে। টিফিনে ডিম যুক্ত কোনো খাবার থাকলে পরিহার করুন।',
    regularMedicationsBn: 'কোনো নিয়মিত ওষুধ নেই',
    emergencyDoctorNameBn: 'ডা. সানজিদা আফরোজ',
    emergencyDoctorPhone: '০১৯১১-৫৬৭৮৯০',
    vaccinations: DEFAULT_VACCINATION_SCHEDULE,
    growthHistory: [
      {
        date: '2026-03-01',
        dateBn: '০১ মার্চ ২০২৬',
        heightCm: 86.5,
        weightKg: 11.9,
        bmi: 15.9,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'প্রাথমিক চেকআপ',
      },
      {
        date: '2026-10-25',
        dateBn: '২৫ অক্টোবর ২০২৬',
        heightCm: 90.0,
        weightKg: 12.8,
        bmi: 15.8,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'আদর্শ শারীরিক বৃদ্ধি',
      },
    ],
    lastCheckedDateBn: '২৫ অক্টোবর ২০২৬',
    updatedByTeacherBn: 'তানজিলা হক',
    updatedAt: '2026-10-25T11:30:00Z',
  },

  // std-3: আরিয়ান খান (KG, Roll 103)
  {
    studentId: 'std-3',
    studentNameBn: 'আরিয়ান খান',
    studentNameEn: 'Aaryan Khan',
    rollNo: '১০৩',
    className: 'KG',
    sectionBn: 'খ (সূর্যমুখী)',
    bloodGroup: 'A+',
    heightCm: 102.0,
    weightKg: 16.5,
    bmi: 15.9,
    bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
    growthMilestoneBn: 'দৃঢ় শারীরিক কাঠামো ও চমৎকার স্ট্যামিনা',
    allergiesList: [],
    criticalHealthAlertBn: undefined,
    regularMedicationsBn: 'কোনো নিয়মিত ওষুধ নেই',
    emergencyDoctorNameBn: 'ডা. মোস্তাফিজুর রহমান',
    emergencyDoctorPhone: '০১৬৭৭-১১২২৩৩',
    vaccinations: DEFAULT_VACCINATION_SCHEDULE,
    growthHistory: [
      {
        date: '2026-01-20',
        dateBn: '২০ জানুয়ারি ২০২৬',
        heightCm: 98.0,
        weightKg: 15.0,
        bmi: 15.6,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'কেজি ক্লাসে অন্তর্ভুক্তি চেকআপ',
      },
      {
        date: '2026-10-26',
        dateBn: '২৬ অক্টোবর ২০২৬',
        heightCm: 102.0,
        weightKg: 16.5,
        bmi: 15.9,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'বার্ষিক চেকআপ',
      },
    ],
    lastCheckedDateBn: '২৬ অক্টোবর ২০২৬',
    updatedByTeacherBn: 'ফাতেমা আক্তার',
    updatedAt: '2026-10-26T09:30:00Z',
  },

  // std-4: জারা তাবাসসুম (Class-1, Roll 104) - Lactose Allergy
  {
    studentId: 'std-4',
    studentNameBn: 'জারা তাবাসসুম',
    studentNameEn: 'Zara Tabassum',
    rollNo: '১০৪',
    className: 'Class-1',
    sectionBn: 'ক (পদ্মা)',
    bloodGroup: 'AB+',
    heightCm: 110.0,
    weightKg: 18.2,
    bmi: 15.0,
    bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
    growthMilestoneBn: 'শারীরিক অঙ্গবিন্যাস ও ভারসাম্য প্রশংসনীয়',
    allergiesList: [
      {
        allergenBn: 'গরুর দুধ ও দুগ্ধজাত খাদ্য (Lactose)',
        severity: 'moderate',
        reactionBn: 'পেট ফাঁপা, ব্যথা ও হজমে সমস্যা',
        actionGuideBn: 'দুধ, চিজ বা মাখনযুক্ত খাবার পরিহার নিশ্চিত করতে হবে।',
      },
    ],
    criticalHealthAlertBn: '⚠️ দুধে অ্যালার্জি (Lactose Intolerance): দুগ্ধজাত খাবার টিফিনে না দেওয়ার অনুরোধ।',
    regularMedicationsBn: 'কোনো নিয়মিত ওষুধ নেই',
    emergencyDoctorNameBn: 'ডা. কাজী শামসুল হক',
    emergencyDoctorPhone: '০১৭৫২-৯৯৮৮৭৭',
    vaccinations: DEFAULT_VACCINATION_SCHEDULE,
    growthHistory: [
      {
        date: '2026-02-10',
        dateBn: '১০ ফেব্রুয়ারি ২০২৬',
        heightCm: 106.0,
        weightKg: 17.0,
        bmi: 15.1,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'ক্লাস-১ সেশন শুরু',
      },
      {
        date: '2026-10-27',
        dateBn: '২৭ অক্টোবর ২০২৬',
        heightCm: 110.0,
        weightKg: 18.2,
        bmi: 15.0,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'বার্ষিক হেলথ চেকআপ',
      },
    ],
    lastCheckedDateBn: '২৭ অক্টোবর ২০২৬',
    updatedByTeacherBn: 'তানজিলা হক',
    updatedAt: '2026-10-27T10:15:00Z',
  },

  // std-5: রায়ান চৌধুরী (Class-2, Roll 105)
  {
    studentId: 'std-5',
    studentNameBn: 'রায়ান চৌধুরী',
    studentNameEn: 'Rayan Chowdhury',
    rollNo: '১০৫',
    className: 'Class-2',
    sectionBn: 'ক (মেঘনা)',
    bloodGroup: 'B+',
    heightCm: 116.0,
    weightKg: 20.5,
    bmi: 15.2,
    bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
    growthMilestoneBn: 'খেলাধুলা ও অ্যাথলেটিক্সে দুর্দান্ত চপলতা',
    allergiesList: [],
    criticalHealthAlertBn: undefined,
    regularMedicationsBn: 'কোনো নিয়মিত ওষুধ নেই',
    emergencyDoctorNameBn: 'ডা. নাজমুল হাসান',
    emergencyDoctorPhone: '০১৭৩১-৯৯০০১১',
    vaccinations: DEFAULT_VACCINATION_SCHEDULE,
    growthHistory: [
      {
        date: '2026-02-01',
        dateBn: '০১ ফেব্রুয়ারি ২০২৬',
        heightCm: 112.0,
        weightKg: 19.2,
        bmi: 15.3,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'বার্ষিক মূল্যায়ন ১',
      },
      {
        date: '2026-10-28',
        dateBn: '২৮ অক্টোবর ২০২৬',
        heightCm: 116.0,
        weightKg: 20.5,
        bmi: 15.2,
        bmiStatusBn: 'স্বাভাবিক ও আদর্শ (Normal)',
        notesBn: 'আদর্শ বৃদ্ধি ও ওজন',
      },
    ],
    lastCheckedDateBn: '২৮ অক্টোবর ২০২৬',
    updatedByTeacherBn: 'ফাতেমা আক্তার',
    updatedAt: '2026-10-28T14:00:00Z',
  },
];

/**
 * Retrieves student health profiles from localStorage or falls back to defaults
 */
export function getStoredHealthProfiles(): StudentHealthProfile[] {
  if (typeof window === 'undefined') return INITIAL_STUDENT_HEALTH_PROFILES;
  try {
    const raw = localStorage.getItem(HEALTH_PROFILES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse stored health profiles:', err);
  }
  return INITIAL_STUDENT_HEALTH_PROFILES;
}

/**
 * Saves student health profiles
 */
export function saveHealthProfiles(profiles: StudentHealthProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HEALTH_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
    window.dispatchEvent(new CustomEvent(HEALTH_PROFILES_UPDATE_EVENT, { detail: profiles }));
  } catch (err) {
    console.error('Failed to save health profiles:', err);
  }
}

/**
 * Updates a student's health profile
 */
export function updateStudentHealthProfile(
  studentId: string,
  updates: Partial<StudentHealthProfile>
): StudentHealthProfile | null {
  const all = getStoredHealthProfiles();
  const idx = all.findIndex((p) => p.studentId === studentId);
  if (idx === -1) return null;

  const current = all[idx];
  const heightCm = updates.heightCm !== undefined ? updates.heightCm : current.heightCm;
  const weightKg = updates.weightKg !== undefined ? updates.weightKg : current.weightKg;
  const bmiCalc = calculateBmi(heightCm, weightKg);

  const updatedProfile: StudentHealthProfile = {
    ...current,
    ...updates,
    heightCm,
    weightKg,
    bmi: bmiCalc.bmi,
    bmiStatusBn: bmiCalc.statusBn,
    updatedAt: new Date().toISOString(),
  };

  all[idx] = updatedProfile;
  saveHealthProfiles(all);
  return updatedProfile;
}

/**
 * Resets health profiles to default mock data
 */
export function resetHealthProfilesToDefault(): StudentHealthProfile[] {
  saveHealthProfiles(INITIAL_STUDENT_HEALTH_PROFILES);
  return INITIAL_STUDENT_HEALTH_PROFILES;
}

/**
 * Exports health summary to RFC 4180 CSV with UTF-8 BOM
 */
export function exportHealthProfilesCsv(
  className: SchoolClass | 'all',
  profiles: StudentHealthProfile[]
): void {
  const filtered =
    className === 'all' ? profiles : profiles.filter((p) => p.className === className);
  if (filtered.length === 0) return;

  const header = `\uFEFF"রোল","শিক্ষার্থীর নাম","শ্রেণি","রক্তের গ্রুপ","উচ্চতা (সেমি)","ওজন (কেজি)","BMI","বৃদ্ধি স্ট্যাটাস","অ্যালার্জি সতর্কতা","নিয়মিত ওষুধ","জরুরি ডাক্তার ফোন","সর্বশেষ চেকআপ"\r\n`;

  const rows = filtered
    .map((p) => {
      const allergyText =
        p.allergiesList.length > 0
          ? p.allergiesList.map((a) => `${a.allergenBn} (${a.severity})`).join('; ')
          : 'নেই';
      return `"${p.rollNo}","${p.studentNameBn}","${p.className}","${p.bloodGroup}","${toBengaliNumber(p.heightCm)}","${toBengaliNumber(p.weightKg)}","${toBengaliNumber(p.bmi)}","${p.bmiStatusBn}","${allergyText}","${p.regularMedicationsBn || 'নেই'}","${p.emergencyDoctorPhone || '-'}","${p.lastCheckedDateBn}"`;
    })
    .join('\r\n');

  const csvContent = header + rows;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ananda-student-health-records-${className}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
