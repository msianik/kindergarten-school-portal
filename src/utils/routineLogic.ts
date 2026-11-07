import {
  ClassRoutinePeriod,
  DayOfWeek,
  HomeworkSubmissionType,
  SchoolClass,
  WeeklyClassProgressRecord,
} from '../types/school';
import {
  DAYS_OF_WEEK_CONFIG,
  DayConfig,
  INITIAL_CLASS_ROUTINES,
  SCHOOL_RESOURCES,
  SchoolResourceItem,
} from '../data/mockRoutines';
import { getSchoolClassNameBn, isSameSchoolClass } from './schoolLogic';

export { DAYS_OF_WEEK_CONFIG, SCHOOL_RESOURCES };
export type { DayConfig, SchoolResourceItem };

/**
 * Find school resource definition by id
 */
export function getResourceById(resourceId: string): SchoolResourceItem | undefined {
  return SCHOOL_RESOURCES.find((r) => r.id === resourceId);
}

/**
 * Returns formatted Bengali labels of booked resources (e.g. "📽️ মাল্টিমিডিয়া প্রজেক্টর, 🎨 আর্ট ল্যাব")
 */
export function getResourceNamesBn(resourceIds?: string[]): string {
  if (!resourceIds || resourceIds.length === 0) return '';
  return resourceIds
    .map((id) => {
      const res = getResourceById(id);
      return res ? `${res.icon} ${res.nameBn.split(' (')[0]}` : id;
    })
    .join(', ');
}

/**
 * Infer default school resources for a subject if none explicitly set
 */
export function inferDefaultResourcesForSubject(subjectBn?: string): string[] {
  if (!subjectBn) return [];
  const s = subjectBn.toLowerCase();
  if (s.includes('আর্ট') || s.includes('ক্রাফট') || s.includes('ড্রয়িং')) {
    return ['art_lab'];
  }
  if (s.includes('মন্টেসরি') || s.includes('সংবেদনশীল')) {
    return ['montessori_lab'];
  }
  if (s.includes('শারীরিক') || s.includes('ব্যায়াম') || s.includes('খেলাধুলা') || s.includes('ফ্রি প্লে')) {
    return ['playground'];
  }
  if (s.includes('বিজ্ঞান') || s.includes('প্রকৃতি') || s.includes('পরিবেশ')) {
    return ['science_nature_corner'];
  }
  if (s.includes('ছড়া') || s.includes('গান') || s.includes('সঙ্গীত') || s.includes('কবিতা')) {
    return ['music_rhyme_box'];
  }
  if (s.includes('ইংরেজি') || s.includes('ফোনিক্স') || s.includes('কম্পিউটার')) {
    return ['smart_tv'];
  }
  return [];
}

const ROUTINES_STORAGE_KEY = 'ananda_school_class_routines_v1';
export const ROUTINE_UPDATE_EVENT = 'ananda-routines-updated';

export const HOMEWORK_SUBMISSION_TYPES: {
  id: HomeworkSubmissionType;
  labelBn: string;
  shortBn: string;
}[] = [
  {
    id: 'written_notebook',
    labelBn: '📝 খাতায় লিখে জমা (Written in Notebook)',
    shortBn: '📝 খাতায় লেখা',
  },
  {
    id: 'oral_practice',
    labelBn: '🗣️ মৌখিক পড়া ও আবৃত্তি (Oral Practice)',
    shortBn: '🗣️ মৌখিক অনুশীলন',
  },
  {
    id: 'worksheet',
    labelBn: '📄 ওয়ার্কশিট অনুশীলন (Activity Worksheet)',
    shortBn: '📄 ওয়ার্কশিট',
  },
  {
    id: 'drawing_craft',
    labelBn: '🎨 ড্রয়িং ও রঙের কাজ (Drawing & Coloring)',
    shortBn: '🎨 ড্রয়িং ও ক্রাফট',
  },
];

export function getHomeworkSubmissionTypeLabelBn(type?: HomeworkSubmissionType): string {
  const found = HOMEWORK_SUBMISSION_TYPES.find((t) => t.id === type);
  return found ? found.shortBn : '📝 খাতায় লেখা';
}

export interface HomeworkQuickTemplate {
  id: string;
  labelBn: string;
  homeworkAssignmentBn: string;
  homeworkDueDateBn: string;
  homeworkSubmissionType: HomeworkSubmissionType;
}

export const HOMEWORK_QUICK_TEMPLATES: HomeworkQuickTemplate[] = [
  {
    id: 'hw-bangla-write',
    labelBn: 'বাংলা বর্ণ ও শব্দ খাতায় লেখা',
    homeworkAssignmentBn:
      'বাংলা C.W খাতায় আজকের পঠিত বর্ণ ও শব্দগুলো সুন্দর করে ২ পৃষ্ঠা লিখে আনবে এবং পাঠ্যবই দেখে ৩ বার উচ্চারণ করবে।',
    homeworkDueDateBn: 'পরবর্তী ক্লাসে খাতা জমা',
    homeworkSubmissionType: 'written_notebook',
  },
  {
    id: 'hw-english-phonics',
    labelBn: 'ইংরেজি অ্যালফাবেট ও ওয়ার্কশিট',
    homeworkAssignmentBn:
      'ইংরেজি ট্রেসিং ওয়ার্কশিটে আজকের Capital ও Small Letter গুলো পেন্সিল দিয়ে লিখে আনবে এবং ছবি দেখে ৫টি নতুন শব্দ শিখবে।',
    homeworkDueDateBn: 'আগামীকাল সকাল ০৯:০০টায় জমা',
    homeworkSubmissionType: 'worksheet',
  },
  {
    id: 'hw-math-counting',
    labelBn: 'গণিত সংখ্যা লেখা ও গণনা',
    homeworkAssignmentBn:
      'গণিত ঘর-কাটা খাতায় নির্ধারিত সংখ্যাগুলো ক্রমানুসারে ২ বার লিখে আনবে এবং বাসার খেলনা/বস্তু গুণে সংখ্যার মান অনুশীলন করবে।',
    homeworkDueDateBn: 'পরবর্তী গণিত ক্লাসে জমা',
    homeworkSubmissionType: 'written_notebook',
  },
  {
    id: 'hw-rhyme-oral',
    labelBn: 'ছড়া ও কবিতা মৌখিক মুখস্থ',
    homeworkAssignmentBn:
      'পাঠ্যবইয়ের আজকের ছড়াটি স্পষ্ট উচ্চারণ ও হাতের অঙ্গভঙ্গিসহ বাসায় মা-বাবার সামনে ৩ বার আবৃত্তি করবে (পরবর্তী ক্লাসে মৌখিক ধরা হবে)।',
    homeworkDueDateBn: 'পরবর্তী ক্লাসে মৌখিক উপস্থাপনা',
    homeworkSubmissionType: 'oral_practice',
  },
  {
    id: 'hw-art-coloring',
    labelBn: 'ড্রয়িং ও প্যাস্টেল রং করা',
    homeworkAssignmentBn:
      'ড্রয়িং খাতায় আজকের আঁকা ছবির ভেতরে প্যাস্টেল বা ক্রেয়ন রং দিয়ে সুন্দরভাবে রং ভরাট করে আনবে।',
    homeworkDueDateBn: 'পরবর্তী আর্ট ক্লাসে প্রদর্শন',
    homeworkSubmissionType: 'drawing_craft',
  },
];

export interface LessonPlanQuickTemplate {
  id: string;
  labelBn: string;
  subjectMatch?: string;
  summaryBn: string;
  objectivesBn: string;
  homeworkBn: string;
  homeworkDueDateBn: string;
  homeworkSubmissionType: HomeworkSubmissionType;
  materialsBn: string;
}

export const LESSON_PLAN_QUICK_TEMPLATES: LessonPlanQuickTemplate[] = [
  {
    id: 'tpl-bangla',
    labelBn: 'বাংলা বর্ণ ও উচ্চারণ অনুশীলন',
    subjectMatch: 'বাংলা',
    summaryBn:
      'রঙিন চিত্রকার্ড ও বোর্ড রাইটিংয়ের মাধ্যমে আজকের নির্ধারিত বাংলা বর্ণ ও শব্দগুলোর শুদ্ধ উচ্চারণ, চেনা এবং খাতায় সুন্দরভাবে লেখার অনুশীলন করানো হবে।',
    objectivesBn: 'বর্ণ শনাক্তকরণ, স্পষ্ট উচ্চারণ ও হাতের লেখার প্রাক-প্রস্তুতি',
    homeworkBn:
      'বাসায় পাঠ্যবইয়ের নির্ধারিত পৃষ্ঠার ছবি দেখে বর্ণগুলো ২ বার মুখে বলা ও বাংলা খাতায় ১ পৃষ্ঠা হাতের লেখা সম্পন্ন করে আনা।',
    homeworkDueDateBn: 'পরবর্তী বাংলা ক্লাসে জমা',
    homeworkSubmissionType: 'written_notebook',
    materialsBn: 'বাংলা বর্ণের ফ্ল্যাশকার্ড, স্লেট/খাতা ও পেন্সিল',
  },
  {
    id: 'tpl-english',
    labelBn: 'ইংরেজি ফোনিক্স ও ভোকাবুলারি',
    subjectMatch: 'ইংরেজি',
    summaryBn:
      'অডিও-ভিজ্যুয়াল চার্ট ও খেলার ছলে ইংরেজি অক্ষরের ধ্বনি (Phonics Sound) এবং দৈনন্দিন ব্যবহৃত নতুন ইংরেজি শব্দের অর্থসহ কথোপকথন শেখানো হবে।',
    objectivesBn: 'ইংরেজি ধ্বনি উচ্চারণ (Phonics) ও মৌলিক শব্দভাণ্ডার বৃদ্ধি',
    homeworkBn:
      'বাসায় আজকের শেখা ইংরেজি শব্দগুলো ছবি দেখে বলা ও প্রদত্ত ট্রেসিং ওয়ার্কশিট পেন্সিল দিয়ে পূরণ করে আনা।',
    homeworkDueDateBn: 'পরবর্তী ইংরেজি ক্লাসে জমা',
    homeworkSubmissionType: 'worksheet',
    materialsBn: 'ফোনিক্স চার্ট, অ্যালফাবেট ব্লক ও ওয়ার্কশিট',
  },
  {
    id: 'tpl-math',
    labelBn: 'সংখ্যা গণনা ও মন্টেসরি গণিত',
    subjectMatch: 'গণিত',
    summaryBn:
      'রঙিন কাঠির বান্ডিল, ব্লক ও সংখ্যা কার্ড ব্যবহার করে বাস্তব উপকরণের সাহায্যে সংখ্যা গণনা, ছোট-বড় তুলনা এবং সহজ গাণিতিক ধারণা অনুশীলন করানো হবে।',
    objectivesBn: 'সংখ্যা গণনার দক্ষতা, যৌক্তিক চিন্তা ও আকৃতি চেনা',
    homeworkBn:
      'বাসার খেলনা বা ফল গুণে সংখ্যা বলা এবং গণিত ঘর-কাটা খাতায় নির্ধারিত সংখ্যাগুলো ১ পৃষ্ঠা লিখে আনা।',
    homeworkDueDateBn: 'পরবর্তী গণিত ক্লাসে জমা',
    homeworkSubmissionType: 'written_notebook',
    materialsBn: 'কাউন্টিং ব্লক, অ্যাবাকাস ও সংখ্যা চার্ট',
  },
  {
    id: 'tpl-rhyme',
    labelBn: 'ছড়া, গান ও আনন্দময় আবৃত্তি',
    subjectMatch: 'ছড়া',
    summaryBn:
      'সুর, তালি ও অঙ্গভঙ্গির মাধ্যমে আনন্দময় পরিবেশে শিশুতোষ ছড়া ও গান আবৃত্তি করানো হবে, যা শিশুদের জড়তা কাটিয়ে প্রমিত উচ্চারণে সহায়তা করবে।',
    objectivesBn: 'প্রমিত উচ্চারণ, ছন্দবোধ ও আত্মবিশ্বাসের সাথে প্রকাশভঙ্গি',
    homeworkBn:
      'বাসায় মা-বাবার সামনে আজকের শেখা ছড়াটি অভিনয়সহ ৩ বার আবৃত্তি করে শোনানো (পরবর্তী ক্লাসে মৌখিক উপস্থাপনা)।',
    homeworkDueDateBn: 'পরবর্তী ক্লাসে মৌখিক পড়া',
    homeworkSubmissionType: 'oral_practice',
    materialsBn: 'ছড়ার ছবির বই ও অডিও রিদম বক্স',
  },
  {
    id: 'tpl-art',
    labelBn: 'আর্ট, ক্রাফট ও সৃজনশীল আঁকা',
    subjectMatch: 'আর্ট',
    summaryBn:
      'শিশুদের কল্পনাশক্তি বিকাশে প্যাস্টেল রং ও রঙিন কাগজ দিয়ে সহজ আকৃতি আঁকা, রং ভরাট করা এবং কাগজের ক্রাফট তৈরির হাতে-কলমে কার্যক্রম পরিচালিত হবে।',
    objectivesBn: 'সূক্ষ্ম মোটর স্কিল (Fine Motor Skill), রঙের ধারণা ও সৃজনশীলতা',
    homeworkBn: 'ড্রয়িং খাতায় আজকের আঁকা ছবিটিতে নিজের পছন্দের ক্রেয়ন বা প্যাস্টেল রং ভরাট করে আনা।',
    homeworkDueDateBn: 'পরবর্তী আর্ট ক্লাসে প্রদর্শন',
    homeworkSubmissionType: 'drawing_craft',
    materialsBn: 'ড্রয়িং খাতা, ক্রেয়ন/প্যাস্টেল রং ও রঙিন কাগজ',
  },
  {
    id: 'tpl-gk',
    labelBn: 'সাধারণ জ্ঞান, পরিবেশ ও নৈতিক শিক্ষা',
    subjectMatch: 'সাধারণ জ্ঞান',
    summaryBn:
      'গল্প ও ছবির মাধ্যমে আমাদের চারপাশের প্রকৃতি, ফলমূল, পশুপাখি এবং বড়দের সম্মান ও ভালো অভ্যাসের নৈতিক শিক্ষা নিয়ে ইন্টারঅ্যাক্টিভ আলোচনা করা হবে।',
    objectivesBn: 'পরিবেশ পরিচিতি, শিষ্টাচার ও সুঅভ্যাস গঠন',
    homeworkBn:
      'বাসায় পরিবারের সবার সাথে সালাম/শুভেচ্ছা বিনিময় ও আজকের শেখা ৫টি সাধারণ জ্ঞান প্রশ্ন মুখে বলা।',
    homeworkDueDateBn: 'পরবর্তী ক্লাসে মৌখিক পড়া',
    homeworkSubmissionType: 'oral_practice',
    materialsBn: 'প্রকৃতি ও পরিবেশ বিষয়ক ছবির চার্ট',
  },
];

/**
 * Generates a realistic default lesson plan summary & homework assignment for a period based on its subject & topic
 * if no custom lesson plan or homework has been explicitly saved yet.
 */
function generateDefaultLessonPlanForPeriod(period: ClassRoutinePeriod): {
  lessonPlanSummaryBn: string;
  learningObjectivesBn: string;
  homeworkAssignmentBn: string;
  homeworkDueDateBn: string;
  homeworkSubmissionType: HomeworkSubmissionType;
  homeworkOrActivityBn: string;
  materialsNeededBn: string;
} {
  const subj = (period.subjectBn || period.subject || '').toLowerCase();
  const topicText = period.topicBn || period.topic || period.subjectBn || 'নিয়মিত পাঠ';

  if (subj.includes('বাংলা')) {
    const hw = `বাংলা খাতায় "${topicText}" সুন্দর করে ১ পৃষ্ঠা লিখে আনবে এবং পাঠ্যবই দেখে শব্দগুলো ২ বার উচ্চারণ করবে।`;
    return {
      lessonPlanSummaryBn: `আজকের ক্লাসে "${topicText}" বিষয়ে রঙিন ফ্ল্যাশকার্ড ও বোর্ডে লেখার মাধ্যমে শিশুদের আনন্দময় পরিবেশে বর্ণ ও শব্দের শুদ্ধ উচ্চারণ এবং লেখার অনুশীলন করানো হবে।`,
      learningObjectivesBn: 'শুদ্ধ বাংলা উচ্চারণ, বর্ণ চেনা ও সুন্দর হস্তাক্ষর অনুশীলন',
      homeworkAssignmentBn: hw,
      homeworkDueDateBn: 'পরবর্তী বাংলা ক্লাসে খাতা জমা',
      homeworkSubmissionType: 'written_notebook',
      homeworkOrActivityBn: hw,
      materialsNeededBn: 'বাংলা পাঠ্যবই, বর্ণ ফ্ল্যাশকার্ড, খাতা ও পেন্সিল',
    };
  }
  if (subj.includes('ইংরেজি') || subj.includes('english')) {
    const hw = `ইংরেজি খাতায়/ওয়ার্কশিটে "${topicText}" এর বর্ণ ও শব্দগুলো ট্রেসিং ও লেখা সম্পন্ন করে আনবে এবং ছবি দেখে মুখে বলবে।`;
    return {
      lessonPlanSummaryBn: `আজকের ক্লাসে "${topicText}" টপিকের ওপর ফোনিক্স সাউন্ড, ছবির চার্ট ও সংলাপের মাধ্যমে ইংরেজি বর্ণ ও নতুন শব্দের ব্যবহার হাতে-কলমে শেখানো হবে।`,
      learningObjectivesBn: 'ইংরেজি ধ্বনি উচ্চারণ (Phonics), নতুন শব্দ শেখা ও সহজ কথোপকথন',
      homeworkAssignmentBn: hw,
      homeworkDueDateBn: 'পরবর্তী ইংরেজি ক্লাসে জমা',
      homeworkSubmissionType: 'worksheet',
      homeworkOrActivityBn: hw,
      materialsNeededBn: 'ইংরেজি ছবির বই, ফোনিক্স চার্ট ও পেন্সিল',
    };
  }
  if (subj.includes('গণিত') || subj.includes('সংখ্যা')) {
    const hw = `গণিত ঘর-কাটা খাতায় "${topicText}" ১ পৃষ্ঠা লিখে আনবে এবং বাসায় বাস্তব বস্তু গুণে সংখ্যা অনুশীলন করবে।`;
    return {
      lessonPlanSummaryBn: `মন্টেসরি কাউন্টিং ব্লক ও বাস্তব উপকরণের সাহায্যে "${topicText}" বিষয়ে সংখ্যা গণনা, মান নির্ণয় ও বোর্ডে সমাধান অনুশীলন করানো হবে।`,
      learningObjectivesBn: 'সংখ্যার ধারণা, নির্ভুল গণনা ও গাণিতিক চিন্তাশক্তি বিকাশ',
      homeworkAssignmentBn: hw,
      homeworkDueDateBn: 'পরবর্তী গণিত ক্লাসে খাতা জমা',
      homeworkSubmissionType: 'written_notebook',
      homeworkOrActivityBn: hw,
      materialsNeededBn: 'গণিত বই, কাউন্টিং ব্লক/অ্যাবাকাস ও খাতা',
    };
  }
  if (subj.includes('আর্ট') || subj.includes('ক্রাফট') || subj.includes('ড্রয়িং')) {
    const hw = `ড্রয়িং খাতায় "${topicText}" আঁকা ছবিটিতে প্যাস্টেল বা ক্রেয়ন দিয়ে সুন্দরভাবে রং করে আনবে।`;
    return {
      lessonPlanSummaryBn: `শিশুদের সৃজনশীলতা বিকাশে "${topicText}" বিষয়ে ধাপে ধাপে রেখা টানা, রঙের সমন্বয় এবং কাগজের ক্রাফট তৈরির আনন্দময় কার্যক্রম পরিচালিত হবে।`,
      learningObjectivesBn: 'হাত ও আঙুলের নৈপুণ্য (Fine Motor Skill) এবং রঙের সৃজনশীল ব্যবহার',
      homeworkAssignmentBn: hw,
      homeworkDueDateBn: 'পরবর্তী আর্ট ক্লাসে প্রদর্শন',
      homeworkSubmissionType: 'drawing_craft',
      homeworkOrActivityBn: hw,
      materialsNeededBn: 'ড্রয়িং খাতা, ক্রেয়ন/জলরং ও রঙিন কাগজ',
    };
  }
  if (subj.includes('ছড়া') || subj.includes('গান') || subj.includes('কবিতা')) {
    const hw = `বাসায় মা-বাবার সামনে "${topicText}" ছড়াটি স্পষ্ট উচ্চারণ ও অঙ্গভঙ্গিসহ ৩ বার আবৃত্তি করবে (পরবর্তী ক্লাসে মৌখিক ধরা হবে)।`;
    return {
      lessonPlanSummaryBn: `তালি, ছন্দ ও দলীয় অংশগ্রহণের মাধ্যমে "${topicText}" আবৃত্তি ও সুর চর্চা করানো হবে যাতে শিশুরা আনন্দের সাথে মুখস্থ করতে পারে।`,
      learningObjectivesBn: 'ছন্দবোধ, স্পষ্ট বাচনভঙ্গি ও দলীয় অংশগ্রহণে আত্মবিশ্বাস',
      homeworkAssignmentBn: hw,
      homeworkDueDateBn: 'পরবর্তী ক্লাসে মৌখিক উপস্থাপনা',
      homeworkSubmissionType: 'oral_practice',
      homeworkOrActivityBn: hw,
      materialsNeededBn: 'ছড়ার বই ও অডিও-ভিজ্যুয়াল চার্ট',
    };
  }

  const fallbackHw = `আজকের ক্লাসে পঠিত "${topicText}" বাসায় মা-বাবার সহায়তায় ২ বার মৌখিক ও খাতায় অনুশীলন করে আসবে।`;
  return {
    lessonPlanSummaryBn: `আজকের পিরিয়ডে "${topicText}" বিষয়ে গল্প, প্রশ্নোত্তর ও ইন্টারঅ্যাক্টিভ শিক্ষা উপকরণের মাধ্যমে শিশুদের অংশগ্রহণমূলক পাঠদান সম্পন্ন করা হবে।`,
    learningObjectivesBn: 'বিষয়বস্তুর মৌলিক ধারণা লাভ, কৌতূহল বৃদ্ধি ও সামাজিক মিথস্ক্রিয়া',
    homeworkAssignmentBn: fallbackHw,
    homeworkDueDateBn: 'পরবর্তী ক্লাসে জমা / মৌখিক পড়া',
    homeworkSubmissionType: 'oral_practice',
    homeworkOrActivityBn: fallbackHw,
    materialsNeededBn: 'পাঠ্যবই, শিক্ষা চার্ট ও ক্লাসরুম অ্যাক্টিভিটি কিট',
  };
}

/**
 * Convert Bengali numerals (০-৯) to ASCII digits (0-9)
 */
function normalizeDigitsToAscii(str: string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (ch) => String(bnDigits.indexOf(ch)));
}

/**
 * Parse time string like "09:00 AM", "12:15 PM", or "০৯:৩০ AM" into minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const ascii = normalizeDigitsToAscii(timeStr).trim().toUpperCase();
  const isPM = ascii.includes('PM') || ascii.includes('দুপুর') || ascii.includes('বিকাল');
  const isAM = ascii.includes('AM') || ascii.includes('সকাল');

  const raw = ascii.replace(/[^0-9:]/g, '');
  const [hStr, mStr] = raw.split(':');
  let hours = parseInt(hStr || '0', 10);
  const minutes = parseInt(mStr || '0', 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Format minutes from midnight back into standard "09:40 AM" 12-hour string
 */
export function formatMinutesToTimeStr(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, Math.round(totalMinutes)));
  const hours24 = Math.floor(clamped / 60);
  const mins = clamped % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
}

export interface TeacherTimeSlotConflict {
  conflictingPeriod: ClassRoutinePeriod;
  overlapStartMinutes: number;
  overlapEndMinutes: number;
  overlapDurationMinutes: number;
  overlapWindowStr: string;
  conflictType: 'same_teacher' | 'same_class_slot';
  conflictReasonBn: string;
}

/**
 * Checks whether two teacher identifiers/names refer to the same teacher
 */
function isSameTeacherScheduleMatch(
  teacherIdA?: string,
  teacherNameA?: string,
  teacherIdB?: string,
  teacherNameB?: string
): boolean {
  if (teacherIdA && teacherIdB && teacherIdA.trim() === teacherIdB.trim()) {
    return true;
  }
  const cleanA = (teacherNameA || '').trim().toLowerCase();
  const cleanB = (teacherNameB || '').trim().toLowerCase();
  if (!cleanA || !cleanB) return false;
  return cleanA === cleanB || cleanA.includes(cleanB) || cleanB.includes(cleanA);
}

/**
 * Detects overlapping time slots when a teacher attempts to schedule two classes simultaneously
 * on the same day (or when another period in the same class overlaps the proposed time window).
 */
export function detectTeacherOverlappingTimeSlots(
  routines: ClassRoutinePeriod[],
  candidate: {
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
  if (candidate.isBreak) return [];

  const candStart = parseTimeToMinutes(candidate.startTime);
  const candEnd = parseTimeToMinutes(candidate.endTime);

  if (candStart <= 0 || candEnd <= candStart) {
    return [];
  }

  const conflicts: TeacherTimeSlotConflict[] = [];

  for (const existing of routines) {
    if (excludePeriodId && existing.id === excludePeriodId) continue;
    if (existing.isBreak) continue;
    if (existing.day !== candidate.day) continue;

    const exStart = parseTimeToMinutes(existing.startTime);
    const exEnd = parseTimeToMinutes(existing.endTime);
    if (exStart <= 0 || exEnd <= exStart) continue;

    // Two intervals [candStart, candEnd) and [exStart, exEnd) overlap iff max(start) < min(end)
    const overlapStart = Math.max(candStart, exStart);
    const overlapEnd = Math.min(candEnd, exEnd);

    if (overlapStart < overlapEnd) {
      const overlapDurationMinutes = overlapEnd - overlapStart;
      const overlapWindowStr = `${formatMinutesToTimeStr(overlapStart)} - ${formatMinutesToTimeStr(overlapEnd)}`;

      const isSameTeacher = isSameTeacherScheduleMatch(
        candidate.teacherId,
        candidate.teacherNameBn,
        existing.teacherId,
        existing.teacherNameBn
      );

      const isSameClass =
        Boolean(candidate.className) &&
        isSameSchoolClass(existing.className, candidate.className as string);

      if (isSameTeacher) {
        const existingClassBn = getSchoolClassNameBn(existing.className);
        conflicts.push({
          conflictingPeriod: existing,
          overlapStartMinutes: overlapStart,
          overlapEndMinutes: overlapEnd,
          overlapDurationMinutes,
          overlapWindowStr,
          conflictType: 'same_teacher',
          conflictReasonBn: `শিক্ষক "${existing.teacherNameBn}" একই সময়ে (${existing.startTime} - ${existing.endTime}) ${existingClassBn} শ্রেণিতে "${existing.subjectBn}" ক্লাসে নির্ধারিত আছেন (${overlapDurationMinutes} মিনিট সময় ওভারল্যাপ)।`,
        });
      } else if (isSameClass) {
        const existingClassBn = getSchoolClassNameBn(existing.className);
        conflicts.push({
          conflictingPeriod: existing,
          overlapStartMinutes: overlapStart,
          overlapEndMinutes: overlapEnd,
          overlapDurationMinutes,
          overlapWindowStr,
          conflictType: 'same_class_slot',
          conflictReasonBn: `${existingClassBn} শ্রেণিতে একই সময়ে (${existing.startTime} - ${existing.endTime}) "${existing.subjectBn}" (${existing.teacherNameBn}) ক্লাস ইতিমধ্যে নির্ধারিত রয়েছে।`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Scans all routine periods and returns a Map of periodId -> TeacherTimeSlotConflict[]
 * for any scheduled classes that have overlapping time slots for the same teacher or same class.
 */
export function findAllTeacherScheduleConflicts(
  routines: ClassRoutinePeriod[]
): Map<string, TeacherTimeSlotConflict[]> {
  const conflictMap = new Map<string, TeacherTimeSlotConflict[]>();

  for (const period of routines) {
    if (period.isBreak) continue;
    const periodConflicts = detectTeacherOverlappingTimeSlots(
      routines,
      {
        day: period.day,
        startTime: period.startTime,
        endTime: period.endTime,
        teacherId: period.teacherId,
        teacherNameBn: period.teacherNameBn,
        className: period.className,
        isBreak: period.isBreak,
      },
      period.id
    );

    if (periodConflicts.length > 0) {
      conflictMap.set(period.id, periodConflicts);
    }
  }

  return conflictMap;
}

/**
 * Suggests the next conflict-free time slot on the given day for the teacher and class
 */
export function suggestNextAvailableSlotForTeacher(
  routines: ClassRoutinePeriod[],
  day: DayOfWeek,
  teacherId: string,
  teacherNameBn: string,
  className: SchoolClass,
  durationMinutes: number = 40,
  excludePeriodId?: string
): { startTime: string; endTime: string; periodNoSuggestion: number } {
  const safeDuration = durationMinutes > 10 && durationMinutes <= 120 ? durationMinutes : 40;
  // Standard school slots starting from 08:30 AM to 02:30 PM in 5-minute steps
  const candidateStarts = [
    8 * 60 + 30, // 08:30 AM
    9 * 60 + 0,  // 09:00 AM
    9 * 60 + 40, // 09:40 AM
    10 * 60 + 20, // 10:20 AM
    10 * 60 + 45, // 10:45 AM
    11 * 60 + 25, // 11:25 AM
    12 * 60 + 5,  // 12:05 PM
    12 * 60 + 45, // 12:45 PM
    13 * 60 + 25, // 01:25 PM
  ];

  // Also add the end times of all existing periods on that day as candidate start points
  const dayPeriods = routines.filter((r) => r.day === day && r.id !== excludePeriodId);
  for (const p of dayPeriods) {
    const endMin = parseTimeToMinutes(p.endTime);
    if (endMin >= 8 * 60 && endMin <= 15 * 60 && !candidateStarts.includes(endMin)) {
      candidateStarts.push(endMin);
    }
  }

  candidateStarts.sort((a, b) => a - b);

  for (const startMin of candidateStarts) {
    const endMin = startMin + safeDuration;
    const startTime = formatMinutesToTimeStr(startMin);
    const endTime = formatMinutesToTimeStr(endMin);

    const conflicts = detectTeacherOverlappingTimeSlots(
      routines,
      {
        day,
        startTime,
        endTime,
        teacherId,
        teacherNameBn,
        className,
        isBreak: false,
      },
      excludePeriodId
    );

    if (conflicts.length === 0) {
      const existingClassPeriodsCount = dayPeriods.filter((p) =>
        isSameSchoolClass(p.className, className)
      ).length;
      return {
        startTime,
        endTime,
        periodNoSuggestion: existingClassPeriodsCount + 1,
      };
    }
  }

  return {
    startTime: '01:30 PM',
    endTime: '02:10 PM',
    periodNoSuggestion: 5,
  };
}

/**
 * Normalize a ClassRoutinePeriod so legacy and alias fields are always populated
 */
export function normalizeRoutinePeriod(period: ClassRoutinePeriod): ClassRoutinePeriod {
  const startMin = parseTimeToMinutes(period.startTime);
  const endMin = parseTimeToMinutes(period.endTime);
  const calcDuration = endMin > startMin ? endMin - startMin : period.isBreak ? 25 : 40;

  const subjectBn = period.subjectBn || period.subject || 'সাধারণ পাঠ';
  const roomBn = period.roomBn || period.room || 'রুম ১০১';
  const topicBn = period.topicBn ?? period.topic ?? '';

  if (period.isBreak) {
    return {
      ...period,
      subjectBn,
      subject: subjectBn,
      roomBn,
      room: roomBn,
      topicBn,
      topic: topicBn,
      durationMinutes: period.durationMinutes || calcDuration,
    };
  }

  const defaults = generateDefaultLessonPlanForPeriod({
    ...period,
    subjectBn,
    topicBn,
  });

  const resolvedHomework =
    period.homeworkAssignmentBn ||
    period.homeworkOrActivityBn ||
    defaults.homeworkAssignmentBn;

  const resolvedResources =
    Array.isArray(period.resources) && period.resources.length > 0
      ? period.resources
      : inferDefaultResourcesForSubject(subjectBn);

  const resolvedBookedResourcesBn =
    period.bookedResourcesBn || getResourceNamesBn(resolvedResources);

  return {
    ...period,
    subjectBn,
    subject: subjectBn,
    roomBn,
    room: roomBn,
    topicBn,
    topic: topicBn,
    resources: resolvedResources,
    bookedResourcesBn: resolvedBookedResourcesBn,
    lessonPlanSummaryBn: period.lessonPlanSummaryBn ?? defaults.lessonPlanSummaryBn,
    learningObjectivesBn: period.learningObjectivesBn ?? defaults.learningObjectivesBn,
    homeworkAssignmentBn: resolvedHomework,
    homeworkOrActivityBn: resolvedHomework,
    homeworkDueDateBn: period.homeworkDueDateBn || defaults.homeworkDueDateBn,
    homeworkSubmissionType:
      period.homeworkSubmissionType || defaults.homeworkSubmissionType,
    homeworkAssignedByBn: period.homeworkAssignedByBn || period.teacherNameBn,
    materialsNeededBn: period.materialsNeededBn ?? defaults.materialsNeededBn,
    durationMinutes: period.durationMinutes || calcDuration,
  };
}

/**
 * Retrieve class routines from local storage or fallback to mock data
 */
export function getClassRoutines(): ClassRoutinePeriod[] {
  if (typeof window === 'undefined') {
    return INITIAL_CLASS_ROUTINES.map(normalizeRoutinePeriod);
  }
  try {
    const stored = localStorage.getItem(ROUTINES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeRoutinePeriod);
      }
    }
  } catch (err) {
    console.error('Failed to read routines from localStorage:', err);
  }
  return INITIAL_CLASS_ROUTINES.map(normalizeRoutinePeriod);
}

/**
 * Save class routines to localStorage and broadcast real-time event
 */
export function saveClassRoutines(routines: ClassRoutinePeriod[]): void {
  if (typeof window === 'undefined') return;
  try {
    const normalized = routines.map(normalizeRoutinePeriod);
    localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent(ROUTINE_UPDATE_EVENT, { detail: { routines: normalized } }));
  } catch (err) {
    console.error('Failed to save routines to localStorage:', err);
  }
}

/**
 * Assign or update a specific period's Homework Assignment and broadcast to Parent & Teacher portals
 */
export function assignPeriodHomework(
  periodId: string,
  homeworkUpdates: {
    homeworkAssignmentBn: string;
    homeworkDueDateBn?: string;
    homeworkSubmissionType?: HomeworkSubmissionType;
    topicBn?: string;
    assignedByBn?: string;
  }
): ClassRoutinePeriod[] {
  const current = getClassRoutines();
  const nowStr = `আজ ${new Date().toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const updated = current.map((p) => {
    if (p.id !== periodId) return p;
    const nextTopic =
      homeworkUpdates.topicBn !== undefined ? homeworkUpdates.topicBn : p.topicBn;
    const hwText = homeworkUpdates.homeworkAssignmentBn.trim();
    return normalizeRoutinePeriod({
      ...p,
      topicBn: nextTopic,
      topic: nextTopic,
      homeworkAssignmentBn: hwText,
      homeworkOrActivityBn: hwText,
      homeworkDueDateBn:
        homeworkUpdates.homeworkDueDateBn?.trim() || p.homeworkDueDateBn || 'পরবর্তী ক্লাসে জমা',
      homeworkSubmissionType:
        homeworkUpdates.homeworkSubmissionType || p.homeworkSubmissionType || 'written_notebook',
      homeworkAssignedByBn: homeworkUpdates.assignedByBn || p.teacherNameBn,
      homeworkAssignedAtBn: nowStr,
      lessonPlanUpdatedAtBn: nowStr,
      lessonPlanUpdatedByBn: homeworkUpdates.assignedByBn || p.teacherNameBn,
    });
  });

  saveClassRoutines(updated);
  return updated;
}

/**
 * Update a specific period's daily lesson plan summary & homework assignment and broadcast changes
 */
export function updatePeriodLessonPlan(
  periodId: string,
  lessonPlanUpdates: {
    topicBn?: string;
    lessonPlanSummaryBn: string;
    learningObjectivesBn?: string;
    homeworkAssignmentBn?: string;
    homeworkDueDateBn?: string;
    homeworkSubmissionType?: HomeworkSubmissionType;
    homeworkOrActivityBn?: string;
    materialsNeededBn?: string;
    resources?: string[];
    bookedResourcesBn?: string;
    updatedByBn?: string;
  }
): ClassRoutinePeriod[] {
  const current = getClassRoutines();
  const nowStr = `আজ ${new Date().toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const updated = current.map((p) => {
    if (p.id !== periodId) return p;
    const nextTopic =
      lessonPlanUpdates.topicBn !== undefined ? lessonPlanUpdates.topicBn : p.topicBn;
    const nextHomework =
      lessonPlanUpdates.homeworkAssignmentBn !== undefined
        ? lessonPlanUpdates.homeworkAssignmentBn
        : lessonPlanUpdates.homeworkOrActivityBn !== undefined
        ? lessonPlanUpdates.homeworkOrActivityBn
        : p.homeworkAssignmentBn || p.homeworkOrActivityBn;

    const nextResources =
      lessonPlanUpdates.resources !== undefined
        ? lessonPlanUpdates.resources
        : p.resources;
    const nextBookedResourcesBn =
      lessonPlanUpdates.bookedResourcesBn !== undefined
        ? lessonPlanUpdates.bookedResourcesBn
        : nextResources
        ? getResourceNamesBn(nextResources)
        : p.bookedResourcesBn;

    return normalizeRoutinePeriod({
      ...p,
      topicBn: nextTopic,
      topic: nextTopic,
      resources: nextResources,
      bookedResourcesBn: nextBookedResourcesBn,
      lessonPlanSummaryBn: lessonPlanUpdates.lessonPlanSummaryBn,
      learningObjectivesBn: lessonPlanUpdates.learningObjectivesBn ?? p.learningObjectivesBn,
      homeworkAssignmentBn: nextHomework,
      homeworkOrActivityBn: nextHomework,
      homeworkDueDateBn: lessonPlanUpdates.homeworkDueDateBn ?? p.homeworkDueDateBn,
      homeworkSubmissionType:
        lessonPlanUpdates.homeworkSubmissionType ?? p.homeworkSubmissionType,
      homeworkAssignedByBn: lessonPlanUpdates.updatedByBn || p.teacherNameBn,
      homeworkAssignedAtBn: nowStr,
      materialsNeededBn: lessonPlanUpdates.materialsNeededBn ?? p.materialsNeededBn,
      lessonPlanUpdatedAtBn: nowStr,
      lessonPlanUpdatedByBn: lessonPlanUpdates.updatedByBn || p.teacherNameBn,
    });
  });

  saveClassRoutines(updated);
  return updated;
}

/**
 * Reset class routines to initial default
 */
export function resetClassRoutines(): ClassRoutinePeriod[] {
  const normalizedDefaults = INITIAL_CLASS_ROUTINES.map(normalizeRoutinePeriod);
  if (typeof window === 'undefined') return normalizedDefaults;
  try {
    localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(normalizedDefaults));
    window.dispatchEvent(
      new CustomEvent(ROUTINE_UPDATE_EVENT, { detail: { routines: normalizedDefaults } })
    );
  } catch (err) {
    console.error('Failed to reset routines in localStorage:', err);
  }
  return normalizedDefaults;
}

/**
 * Get current day of week in Bangladesh time
 * 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday
 */
export function getTodayDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay();
  switch (dayIndex) {
    case 6:
      return 'saturday';
    case 0:
      return 'sunday';
    case 1:
      return 'monday';
    case 2:
      return 'tuesday';
    case 3:
      return 'wednesday';
    case 4:
      return 'thursday';
    case 5:
    default:
      // Friday is holiday; default to Saturday for previewing next school day routine
      return 'saturday';
  }
}

/**
 * Checks if today is Friday (সাপ্তাহিক ছুটি)
 */
export function isFridayToday(): boolean {
  return new Date().getDay() === 5;
}

/**
 * Returns Bengali day name
 */
export function getDayNameBn(day: DayOfWeek): string {
  const found = DAYS_OF_WEEK_CONFIG.find((d) => d.id === day);
  return found ? found.nameBn : 'শনিবার';
}

/**
 * Returns periods for a specific class and optionally day
 */
export function getPeriodsForClass(
  routines: ClassRoutinePeriod[],
  className: SchoolClass | string,
  day?: DayOfWeek
): ClassRoutinePeriod[] {
  return routines
    .filter((r) => isSameSchoolClass(r.className, className))
    .filter((r) => (!day ? true : r.day === day))
    .sort((a, b) => a.periodNo - b.periodNo);
}

/**
 * Returns periods assigned to a specific teacher and optionally day
 */
export function getPeriodsForTeacher(
  routines: ClassRoutinePeriod[],
  teacherIdentifier: string, // teacherId, nameBn, or username
  day?: DayOfWeek
): ClassRoutinePeriod[] {
  if (!teacherIdentifier) return [];
  const query = teacherIdentifier.trim().toLowerCase();

  return routines
    .filter((r) => {
      if (r.isBreak) return false;
      const matchesId = r.teacherId && r.teacherId.toLowerCase() === query;
      const matchesName = r.teacherNameBn && r.teacherNameBn.toLowerCase().includes(query);
      return matchesId || matchesName;
    })
    .filter((r) => (!day ? true : r.day === day))
    .sort((a, b) => {
      // Sort by day order, then periodNo
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
}

/**
 * Determines live status of a period compared to current clock time
 */
export function getPeriodLiveStatus(
  period: ClassRoutinePeriod,
  checkDayMatch: boolean = true
): 'ongoing' | 'upcoming' | 'completed' {
  if (checkDayMatch) {
    const today = getTodayDayOfWeek();
    if (period.day !== today || isFridayToday()) {
      return 'upcoming';
    }
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseTimeToMinutes(period.startTime);
  const endMinutes = parseTimeToMinutes(period.endTime);

  if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
    return 'ongoing';
  } else if (currentMinutes < startMinutes) {
    return 'upcoming';
  } else {
    return 'completed';
  }
}

/**
 * Filter upcoming periods for today
 */
export function getUpcomingPeriods(periods: ClassRoutinePeriod[]): ClassRoutinePeriod[] {
  return periods.filter((p) => {
    const status = getPeriodLiveStatus(p);
    return status === 'upcoming' || status === 'ongoing';
  });
}

/**
 * Export Class Routine & Daily Lesson Plans to RFC-4180 compliant CSV string with UTF-8 BOM
 */
export function exportClassRoutineToCsv(
  routines: ClassRoutinePeriod[],
  className: SchoolClass | 'all'
): string {
  const BOM = '\uFEFF';
  const lines: string[] = [];

  const targetPeriods =
    className === 'all'
      ? routines
      : routines.filter((r) => isSameSchoolClass(r.className, className));

  const classNameBn = className === 'all' ? 'সকল শ্রেণি' : getSchoolClassNameBn(className);

  lines.push(`"আনন্দ পাঠশালা — ক্লাস রুটিন, দৈনিক পাঠ পরিকল্পনা ও বাড়ির কাজ (Class Routine, Lesson Plans & Homework Assignments)"`);
  lines.push(`"প্রতিষ্ঠান:","আনন্দ পাঠশালা, কোর্টপাড়া, কুষ্টিয়া","শ্রেণি আওতা:","${classNameBn}"`);
  lines.push(`"ডাউনলোড তারিখ:","${new Date().toLocaleDateString('bn-BD')}","মোট পিরিয়ড:","${targetPeriods.length}টি"`);
  lines.push('');

  const headers = [
    'বার (Day)',
    'পিরিয়ড (Period)',
    'সময় (Time)',
    'শ্রেণি (Class)',
    'বিষয় (Subject)',
    'শিক্ষক / শিক্ষিকা (Teacher)',
    'রুম / স্থান (Room)',
    'বুকিংকৃত রিসোর্স (Booked Resources)',
    'আজকের পাঠ / টপিক (Topic)',
    'দৈনিক পাঠ পরিকল্পনা সারসংক্ষেপ (Daily Lesson Plan Summary)',
    'শিখনফল (Learning Objectives)',
    'নির্ধারিত বাড়ির কাজ (Homework Assignment)',
    'বাড়ির কাজের ধরন (Homework Type)',
    'জমা দেওয়ার সময়সীমা (Due Date)',
    'প্রয়োজনীয় উপকরণ (Materials Needed)',
  ];
  lines.push(headers.map((h) => `"${h}"`).join(','));

  targetPeriods.forEach((p) => {
    const dayBn = getDayNameBn(p.day);
    const hwText = p.homeworkAssignmentBn || p.homeworkOrActivityBn || '—';
    const hwType = p.isBreak ? '—' : getHomeworkSubmissionTypeLabelBn(p.homeworkSubmissionType);
    const bookedRes =
      p.bookedResourcesBn ||
      (p.resources && p.resources.length > 0 ? getResourceNamesBn(p.resources) : '') ||
      '—';
    const row = [
      dayBn,
      p.periodLabelBn,
      `${p.startTime} - ${p.endTime}`,
      getSchoolClassNameBn(p.className),
      p.subjectBn,
      p.teacherNameBn || '—',
      p.roomBn || '—',
      bookedRes,
      p.topicBn || '—',
      p.lessonPlanSummaryBn || '—',
      p.learningObjectivesBn || '—',
      hwText,
      hwType,
      p.homeworkDueDateBn || '—',
      p.materialsNeededBn || '—',
    ];
    lines.push(row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','));
  });

  return BOM + lines.join('\r\n');
}

/**
 * Trigger download of routine CSV file
 */
export function downloadClassRoutineCsv(
  csvContent: string,
  filename: string = 'ananda_pathshala_class_routine.csv'
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
// Weekly Curriculum & Progress Summary Engine (Parents & Teachers)
// =========================================================================

const WEEKLY_PROGRESS_STORAGE_KEY = 'ananda_weekly_class_progress_v1';
export const WEEKLY_PROGRESS_UPDATE_EVENT = 'ananda-weekly-progress-updated';

export interface WeekOption {
  key: string;
  labelBn: string;
  shortLabelBn: string;
  isCurrent?: boolean;
}

export const WEEK_OPTIONS: WeekOption[] = [
  {
    key: 'nov-2026-w1',
    labelBn: 'চলতি সপ্তাহ: ১ম সপ্তাহ, নভেম্বর ২০২৬ (৩১ অক্টোবর — ০৫ নভেম্বর)',
    shortLabelBn: '১ম সপ্তাহ, নভেম্বর (চলতি)',
    isCurrent: true,
  },
  {
    key: 'oct-2026-w4',
    labelBn: 'পূর্ববর্তী সপ্তাহ: ৪র্থ সপ্তাহ, অক্টোবর ২০২৬ (২৪ — ২৯ অক্টোবর)',
    shortLabelBn: '৪র্থ সপ্তাহ, অক্টোবর',
  },
  {
    key: 'nov-2026-w2',
    labelBn: 'আগামী সপ্তাহ: ২য় সপ্তাহ, নভেম্বর ২০২৬ (০৭ — ১২ নভেম্বর)',
    shortLabelBn: '২য় সপ্তাহ, নভেম্বর (আসন্ন)',
  },
];

function normalizeCanonicalClass(cls: SchoolClass | string): SchoolClass {
  if (cls === 'Playgroup' || cls === 'Play') return 'Play';
  if (cls === 'KG-1' || cls === 'KG') return 'KG';
  if (cls === 'KG-2' || cls === 'Class-1') return 'Class-1';
  if (cls === 'HateKhori') return 'HateKhori';
  if (cls === 'Class-2') return 'Class-2';
  return 'Nursery';
}

function createDefaultWeeklyRecord(
  className: SchoolClass,
  weekKey: string,
  routines: ClassRoutinePeriod[]
): WeeklyClassProgressRecord {
  const canonicalClass = normalizeCanonicalClass(className);
  const weekOpt = WEEK_OPTIONS.find((w) => w.key === weekKey) || WEEK_OPTIONS[0];
  const classPeriods = routines.filter(
    (r) => isSameSchoolClass(r.className, canonicalClass) && !r.isBreak
  );

  // Previous week defaults to 'completed', upcoming week to 'pending', current week to 'pending' (or completed for some classes)
  const isPastWeek = weekKey === 'oct-2026-w4';
  const isCompletedByDefault =
    isPastWeek || (weekKey === 'nov-2026-w1' && (canonicalClass === 'Nursery' || canonicalClass === 'KG'));

  const completedPeriodIds = isCompletedByDefault
    ? classPeriods.map((p) => p.id)
    : weekKey === 'nov-2026-w2'
    ? []
    : classPeriods.filter((p) => ['saturday', 'sunday', 'monday', 'tuesday'].includes(p.day)).map((p) => p.id);

  const totalCount = classPeriods.length || 1;
  const completionPercentage = isCompletedByDefault
    ? 100
    : Math.round((completedPeriodIds.length / totalCount) * 100);

  const classLabel = getSchoolClassNameBn(canonicalClass);

  return {
    id: `${canonicalClass}_${weekKey}`,
    className: canonicalClass,
    weekKey,
    weekLabelBn: weekOpt.labelBn,
    status: isCompletedByDefault ? 'completed' : 'pending',
    completionPercentage,
    teacherSummaryNoteBn: isCompletedByDefault
      ? `${classLabel} শ্রেণির এই সপ্তাহের নির্ধারিত সকল বিষয়ের পাঠদান, মৌখিক অনুশীলন, ছড়া আবৃত্তি ও সৃজনশীল ক্লাসওয়ার্ক সফলভাবে সম্পন্ন হয়েছে। শিক্ষার্থীদের অংশগ্রহণ অত্যন্ত আনন্দময় ও সন্তোষজনক ছিল।`
      : `${classLabel} শ্রেণির এই সপ্তাহের পাঠদান কার্যক্রম রুটিন অনুযায়ী চলমান রয়েছে। সপ্তাহের অবশিষ্ট পিরিয়ডগুলোর অনুশীলন শেষে সম্পূর্ণ সপ্তাহ সম্পন্ন হিসেবে মার্ক করা হবে।`,
    keyHighlightsBn: [
      'বাংলা স্বরবর্ণ ও ব্যঞ্জনবর্ণ শুদ্ধ উচ্চারণ ও লিখন অনুশীলন',
      'ইংরেজি ফোনিক্স সাউন্ড ও ছবি দেখে শব্দ গঠন (Phonics & Vocabulary)',
      'মন্টেসরি পদ্ধতিতে সংখ্যা গণনা ও আকৃতি শনাক্তকরণ',
      'রঙিন কাগজ ও প্যাস্টেল রং দিয়ে সৃজনশীল আর্ট ও ছড়া আবৃত্তি',
    ],
    parentActionNoteBn:
      'সপ্তাহান্তে (শুক্রবার) বাসায় সন্তানের সাথে এই সপ্তাহের পঠিত বর্ণ, সংখ্যা ও ছড়াগুলো খেলার ছলে ১৫-২০ মিনিট পুনরালোচনা করার জন্য সম্মানিত অভিভাবকদের অনুরোধ করা হলো।',
    completedPeriodIds,
    updatedByBn: 'রোকেয়া পারভীন (শ্রেণি শিক্ষিকা)',
    updatedAtBn: isCompletedByDefault ? 'আজ দুপুর ১২:৩০' : 'চলমান সপ্তাহ',
  };
}

/**
 * Retrieve all stored weekly progress records
 */
export function getWeeklyProgressRecords(): WeeklyClassProgressRecord[] {
  const routines = getClassRoutines();
  const classes: SchoolClass[] = ['HateKhori', 'Play', 'Nursery', 'KG', 'Class-1', 'Class-2'];
  const defaultMap = new Map<string, WeeklyClassProgressRecord>();

  for (const cls of classes) {
    for (const wk of WEEK_OPTIONS) {
      const rec = createDefaultWeeklyRecord(cls, wk.key, routines);
      defaultMap.set(rec.id, rec);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(WEEKLY_PROGRESS_STORAGE_KEY);
      if (raw) {
        const parsed: WeeklyClassProgressRecord[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && item.id) {
              defaultMap.set(item.id, item);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to read weekly progress from localStorage:', err);
    }
  }

  return Array.from(defaultMap.values());
}

/**
 * Save weekly progress records to localStorage and dispatch sync events
 */
export function saveWeeklyProgressRecords(records: WeeklyClassProgressRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WEEKLY_PROGRESS_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(
      new CustomEvent(WEEKLY_PROGRESS_UPDATE_EVENT, { detail: { records } })
    );
    window.dispatchEvent(new CustomEvent(ROUTINE_UPDATE_EVENT, {}));
  } catch (err) {
    console.error('Failed to save weekly progress records:', err);
  }
}

/**
 * Get the weekly progress record for a specific class and weekKey
 */
export function getClassWeeklyProgress(
  className: SchoolClass | string,
  weekKey: string = 'nov-2026-w1'
): WeeklyClassProgressRecord {
  const canonicalClass = normalizeCanonicalClass(className);
  const all = getWeeklyProgressRecords();
  const targetId = `${canonicalClass}_${weekKey}`;
  const found = all.find((r) => r.id === targetId);
  if (found) return found;
  return createDefaultWeeklyRecord(canonicalClass, weekKey, getClassRoutines());
}

/**
 * Mark an entire week's progress for a class as 'completed' or 'pending'
 */
export function toggleWholeWeekStatus(
  className: SchoolClass | string,
  weekKey: string,
  newStatus: 'completed' | 'pending',
  updatedByBn: string = 'শ্রেণি শিক্ষক',
  customSummaryNoteBn?: string,
  customParentNoteBn?: string
): WeeklyClassProgressRecord {
  const canonicalClass = normalizeCanonicalClass(className);
  const routines = getClassRoutines();
  const classPeriods = routines.filter(
    (r) => isSameSchoolClass(r.className, canonicalClass) && !r.isBreak
  );

  const allRecords = getWeeklyProgressRecords();
  const targetId = `${canonicalClass}_${weekKey}`;
  const existing =
    allRecords.find((r) => r.id === targetId) ||
    createDefaultWeeklyRecord(canonicalClass, weekKey, routines);

  const nowStr = `আজ ${new Date().toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const classLabel = getSchoolClassNameBn(canonicalClass);

  const updatedRecord: WeeklyClassProgressRecord = {
    ...existing,
    status: newStatus,
    completionPercentage: newStatus === 'completed' ? 100 : 0,
    completedPeriodIds: newStatus === 'completed' ? classPeriods.map((p) => p.id) : [],
    teacherSummaryNoteBn:
      customSummaryNoteBn !== undefined
        ? customSummaryNoteBn
        : newStatus === 'completed'
        ? `${classLabel} শ্রেণির এই সপ্তাহের নির্ধারিত সকল বিষয়ের পাঠদান, ক্লাসওয়ার্ক ও মৌখিক মূল্যায়ন ১০০% সফলভাবে সম্পন্ন হয়েছে।`
        : `${classLabel} শ্রেণির এই সপ্তাহের পাঠদান কার্যক্রম চলমান (পেন্ডিং) অবস্থায় রয়েছে।`,
    parentActionNoteBn:
      customParentNoteBn !== undefined ? customParentNoteBn : existing.parentActionNoteBn,
    updatedByBn,
    updatedAtBn: nowStr,
  };

  const nextRecords = allRecords.some((r) => r.id === targetId)
    ? allRecords.map((r) => (r.id === targetId ? updatedRecord : r))
    : [...allRecords, updatedRecord];

  saveWeeklyProgressRecords(nextRecords);
  return updatedRecord;
}

/**
 * Toggle a single period's completion inside the weekly tracker and recalculate week status
 */
export function togglePeriodCompletionInWeek(
  className: SchoolClass | string,
  weekKey: string,
  periodId: string,
  updatedByBn: string = 'শ্রেণি শিক্ষক'
): WeeklyClassProgressRecord {
  const canonicalClass = normalizeCanonicalClass(className);
  const routines = getClassRoutines();
  const classPeriods = routines.filter(
    (r) => isSameSchoolClass(r.className, canonicalClass) && !r.isBreak
  );

  const allRecords = getWeeklyProgressRecords();
  const targetId = `${canonicalClass}_${weekKey}`;
  const existing =
    allRecords.find((r) => r.id === targetId) ||
    createDefaultWeeklyRecord(canonicalClass, weekKey, routines);

  const isCurrentlyCompleted = existing.completedPeriodIds.includes(periodId);
  const nextCompletedIds = isCurrentlyCompleted
    ? existing.completedPeriodIds.filter((id) => id !== periodId)
    : [...existing.completedPeriodIds, periodId];

  const validPeriodIds = new Set(classPeriods.map((p) => p.id));
  const validCompletedCount = nextCompletedIds.filter((id) => validPeriodIds.has(id)).length;
  const totalCount = classPeriods.length || 1;
  const nextPercentage = Math.round((validCompletedCount / totalCount) * 100);
  const nextStatus: 'completed' | 'pending' =
    validCompletedCount >= totalCount && totalCount > 0 ? 'completed' : 'pending';

  const nowStr = `আজ ${new Date().toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const updatedRecord: WeeklyClassProgressRecord = {
    ...existing,
    status: nextStatus,
    completionPercentage: nextPercentage,
    completedPeriodIds: nextCompletedIds,
    updatedByBn,
    updatedAtBn: nowStr,
  };

  const nextRecords = allRecords.some((r) => r.id === targetId)
    ? allRecords.map((r) => (r.id === targetId ? updatedRecord : r))
    : [...allRecords, updatedRecord];

  saveWeeklyProgressRecords(nextRecords);
  return updatedRecord;
}

/**
 * Update custom notes and highlights for a class's weekly summary
 */
export function updateClassWeeklySummaryDetails(
  className: SchoolClass | string,
  weekKey: string,
  updates: {
    status: 'completed' | 'pending';
    teacherSummaryNoteBn: string;
    parentActionNoteBn: string;
    keyHighlightsBn?: string[];
    updatedByBn?: string;
  }
): WeeklyClassProgressRecord {
  const canonicalClass = normalizeCanonicalClass(className);
  const routines = getClassRoutines();
  const classPeriods = routines.filter(
    (r) => isSameSchoolClass(r.className, canonicalClass) && !r.isBreak
  );

  const allRecords = getWeeklyProgressRecords();
  const targetId = `${canonicalClass}_${weekKey}`;
  const existing =
    allRecords.find((r) => r.id === targetId) ||
    createDefaultWeeklyRecord(canonicalClass, weekKey, routines);

  const nowStr = `আজ ${new Date().toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const nextCompletedIds =
    updates.status === 'completed'
      ? classPeriods.map((p) => p.id)
      : existing.status === 'completed'
      ? []
      : existing.completedPeriodIds;

  const totalCount = classPeriods.length || 1;
  const nextPercentage =
    updates.status === 'completed'
      ? 100
      : Math.min(95, Math.round((nextCompletedIds.length / totalCount) * 100));

  const updatedRecord: WeeklyClassProgressRecord = {
    ...existing,
    status: updates.status,
    completionPercentage: nextPercentage,
    completedPeriodIds: nextCompletedIds,
    teacherSummaryNoteBn: updates.teacherSummaryNoteBn,
    parentActionNoteBn: updates.parentActionNoteBn,
    keyHighlightsBn: updates.keyHighlightsBn || existing.keyHighlightsBn,
    updatedByBn: updates.updatedByBn || existing.updatedByBn,
    updatedAtBn: nowStr,
  };

  const nextRecords = allRecords.some((r) => r.id === targetId)
    ? allRecords.map((r) => (r.id === targetId ? updatedRecord : r))
    : [...allRecords, updatedRecord];

  saveWeeklyProgressRecords(nextRecords);
  return updatedRecord;
}

