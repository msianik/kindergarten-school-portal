import React, { useState } from 'react';
import { Student, SkillAssessment, UserRole } from '../types/school';
import { calculateHolisticGrade } from '../utils/schoolLogic';
import { 
  Award, 
  Star, 
  Printer, 
  Heart, 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  Baby, 
  FileText
} from 'lucide-react';

interface SkillAssessmentModuleProps {
  students: Student[];
  assessments: Record<string, SkillAssessment>;
  onUpdateAssessment: (studentId: string, updated: SkillAssessment) => void;
  currentRole: UserRole;
}

export const SkillAssessmentModule: React.FC<SkillAssessmentModuleProps> = ({
  students,
  assessments,
  onUpdateAssessment,
  currentRole,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'std-1');
  const [showPrintModal, setShowPrintModal] = useState(false);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const assessment = assessments[selectedStudentId] || {
    id: `ska-${selectedStudentId}`,
    studentId: selectedStudentId,
    studentNameBn: currentStudent?.nameBn || '',
    className: currentStudent?.className || 'Playgroup',
    termBn: 'বার্ষিক মূল্যায়ন ২০২৬ (Annual Assessment)',
    evaluationDate: 'অক্টোবর ২০২৬',
    growth: {
      heightCm: 92.0,
      weightKg: 13.5,
      bmiStatusBn: 'আদর্শ ও স্বাভাবিক বৃদ্ধি (Normal BMI)',
      milestoneBn: 'চমৎকার শারীরিক চঞ্চলতা ও হাসিখুশি ভাব',
    },
    overallBadgeBn: '🌟 নক্ষত্র প্রতিভা (Star Explorer)',
    teacherRemarksBn: 'খুব সুন্দর বন্ধুভাবাপন্ন আচরণ এবং ক্লাসের প্রতিটি খেলায় স্বতঃস্ফূর্ত অংশগ্রহণ।',
    principalRemarksBn: 'আনন্দ পাঠশালায় শিশুর সর্বাঙ্গীণ বিকাশ প্রশংসনীয়।',
    skills: [
      {
        category: 'social_emotional',
        categoryTitleBn: '১. সামাজিক ও আবেগীয় মেলবন্ধন (Social & Emotional Growth)',
        score: 5,
        descriptionBn: 'খেলনা শেয়ার করা, সহপাঠীকে সাহায্য করা ও দলবদ্ধ খেলা',
        observationBn: 'সহপাঠীদের সাথে খুব সহজে মানিয়ে নেয় এবং আনন্দ ভাগাভাগি করে।',
      },
      {
        category: 'fine_motor',
        categoryTitleBn: '২. সূক্ষ্ম মোটর স্কিল (Fine Motor Coordination)',
        score: 4,
        descriptionBn: 'ক্রেয়ন সঠিকভাবে ধরা, বোতাম লাগানো ও পাজল মেলানো',
        observationBn: 'আঙুল দিয়ে সূক্ষ্ম বস্তু নিখুঁতভাবে ধরতে পারে।',
      },
      {
        category: 'gross_motor',
        categoryTitleBn: '৩. স্থূল শারীরিক মোটর স্কিল (Gross Motor & Agility)',
        score: 5,
        descriptionBn: 'লাফানো, ব্যালান্স বজায় রেখে দৌড়ানো ও বল ধরা',
        observationBn: 'শারীরিক খেলায় চমৎকার আত্মবিশ্বাস ও ভারসাম্য রয়েছে।',
      },
      {
        category: 'language_rhymes',
        categoryTitleBn: '৪. ভাষা, ছড়া ও শব্দভাণ্ডার (Language & Rhymes)',
        score: 5,
        descriptionBn: 'স্পষ্ট উচ্চারণে কথা বলা ও ছড়া মনে রেখে অভিনয় করা',
        observationBn: 'ছড়ার প্রতিটি পংক্তি সুন্দর সুর ও অভিনয়ে প্রকাশ করে।',
      },
      {
        category: 'creativity_art',
        categoryTitleBn: '৫. সৃজনশীলতা ও চিত্রাঙ্কন (Creativity & Art)',
        score: 4,
        descriptionBn: 'রঙের সীমানা মেনে আঁকা ও ক্লে দিয়ে গঠন তৈরি',
        observationBn: 'উজ্জ্বল রঙের সংমিশ্রণ ব্যবহার করতে পছন্দ করে।',
      },
      {
        category: 'curiosity_cognition',
        categoryTitleBn: '৬. কৌতূহল ও প্রাথমিক গণিত (Curiosity & Early Math)',
        score: 5,
        descriptionBn: 'নতুন বিষয় জানতে চাওয়া ও বস্তু গণনা করা',
        observationBn: 'নতুন বিষয় দ্রুত শিখে ফেলে এবং কৌতূহলী প্রশ্ন করে।',
      },
    ],
  };

  const holisticMeta = calculateHolisticGrade(assessment.skills);

  const handleScoreChange = (index: number, newScore: number) => {
    const updatedSkills = [...assessment.skills];
    updatedSkills[index] = { ...updatedSkills[index], score: newScore };
    const newGrade = calculateHolisticGrade(updatedSkills);

    const updatedAssessment: SkillAssessment = {
      ...assessment,
      skills: updatedSkills,
      overallBadgeBn: newGrade.badgeBn,
    };
    onUpdateAssessment(selectedStudentId, updatedAssessment);
  };

  const handleObservationChange = (index: number, text: string) => {
    const updatedSkills = [...assessment.skills];
    updatedSkills[index] = { ...updatedSkills[index], observationBn: text };
    const updatedAssessment: SkillAssessment = {
      ...assessment,
      skills: updatedSkills,
    };
    onUpdateAssessment(selectedStudentId, updatedAssessment);
  };

  const handleTeacherRemarksChange = (text: string) => {
    onUpdateAssessment(selectedStudentId, {
      ...assessment,
      teacherRemarksBn: text,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-400/30 text-amber-100 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
              কেজি ও প্লে স্কুলের বিশেষ মডিউল #৩
            </span>
            <span className="text-white/60 text-xs">·</span>
            <span className="text-white/90 text-xs font-medium">হোলিস্টিক শিশু বিকাশ ও দক্ষতা মূল্যায়ন</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">স্কিল ও বিহেভিওরাল প্রগ্রেস কার্ড (Growth Assessment)</h2>
          <p className="text-amber-100/90 text-sm max-w-2xl mt-1">
            প্রচলিত লিখিত পরীক্ষার বাইরেও শিশুদের আচরণ, সামাজিক মেলামেশা, মোটর স্কিল, ছড়া আবৃত্তি ও সৃজনশীলতার পূর্ণাঙ্গ গ্রেডিং
            এবং আকর্ষণীয় রঙিন রিপোর্ট কার্ড জেনারেশন।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-600" />
            রঙিন রিপোর্ট কার্ড প্রিন্ট / প্রিভিউ
          </button>
        </div>
      </div>

      {/* Student Selector Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs text-slate-500 font-medium px-2 whitespace-nowrap">শিক্ষার্থী নির্বাচন:</span>
        {students.map((std) => (
          <button
            key={std.id}
            onClick={() => setSelectedStudentId(std.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedStudentId === std.id
                ? 'bg-amber-500 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{std.nameBn}</span>
            <span className="text-[10px] opacity-80 font-normal">({std.className})</span>
          </button>
        ))}
      </div>

      {/* Main Assessment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Student Summary & Growth Milestone Tracker (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Badge & Overall Achievement Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-white border border-amber-200/80 rounded-2xl p-6 text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-4xl shadow-md border-2 border-white">
              ⭐
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                সার্বিক পারফরম্যান্স অ্যাওয়ার্ড
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{holisticMeta.badgeBn}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {holisticMeta.summaryFeedbackBn}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3.5 py-1.5 rounded-full text-xs font-bold">
              <span>গড় রেটিং:</span>
              <span className="text-sm font-mono">{holisticMeta.averageScore} / ৫.০</span>
            </div>
          </div>

          {/* Child Growth & Physical Milestones Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Baby className="w-4 h-4 text-rose-500" />
                শারীরিক বৃদ্ধি ট্র্যাকার (Growth Tracker)
              </h4>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
                <span className="text-[11px] text-amber-800 font-medium block">উচ্চতা (Height)</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {assessment.growth.heightCm} সেমি
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">স্বাভাবিক বৃদ্ধির গতি</span>
              </div>

              <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200/60">
                <span className="text-[11px] text-rose-800 font-medium block">ওজন (Weight)</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {assessment.growth.weightKg} কেজি
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">আদর্শ শিশু ওজন</span>
              </div>
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">BMI স্ট্যাটাস:</span>
                <span className="font-bold text-emerald-700">{assessment.growth.bmiStatusBn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">শারীরিক মাইলস্টোন:</span>
                <span className="font-medium text-slate-800">{assessment.growth.milestoneBn}</span>
              </div>
            </div>
          </div>

          {/* Teacher Remarks Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              শ্রেণি শিক্ষকের মমতাময়ী মন্তব্য
            </h4>
            <textarea
              rows={3}
              value={assessment.teacherRemarksBn}
              onChange={(e) => handleTeacherRemarksChange(e.target.value)}
              placeholder="শিশুর অগ্রগতি ও উৎসাহব্যঞ্জক মন্তব্য..."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed text-slate-700"
            />
            <span className="text-[11px] text-slate-400 block text-right">
              — শ্রেণি শিক্ষক: রোকেয়া পারভীন
            </span>
          </div>
        </div>

        {/* Right Column: 6 Developmental Assessment Dimensions (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  ৬টি প্রধান ক্ষেত্রে দক্ষতা পর্যবেক্ষণ ও রেটিং
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  প্রতিটি ক্ষেত্রে শিশুর স্বতঃস্ফূর্ত আগ্রহ ও উন্নতি অনুযায়ী তারকা রেটিং (১-৫) ও শিক্ষক পর্যবেক্ষণ।
                </p>
              </div>

              <div className="text-xs text-slate-400">
                টার্ম: {assessment.termBn}
              </div>
            </div>

            {/* Criteria Rows */}
            <div className="space-y-4">
              {assessment.skills.map((criterion, idx) => (
                <div
                  key={criterion.category}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{criterion.categoryTitleBn}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{criterion.descriptionBn}</p>
                    </div>

                    {/* Star Rating interactive buttons */}
                    <div className="flex items-center gap-1 shrink-0 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => handleScoreChange(idx, starVal)}
                          className="p-0.5 text-slate-300 hover:text-amber-400 transition-colors"
                          title={`${starVal} স্টার রেটিং`}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              starVal <= criterion.score
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-mono font-bold text-slate-700 ml-1">
                        {criterion.score}/৫
                      </span>
                    </div>
                  </div>

                  {/* Teacher observation text input */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">শিক্ষকের পর্যবেক্ষণ নোট:</label>
                    <input
                      type="text"
                      value={criterion.observationBn}
                      onChange={(e) => handleObservationChange(idx, e.target.value)}
                      placeholder="নির্দিষ্ট পর্যবেক্ষণ লিখুন..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Principal's Endorsement Note */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 flex items-start gap-3 text-xs">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 block">প্রিন্সিপালের আশীর্বানী ও অনুমোদন:</span>
                <p className="text-amber-800 mt-1 leading-relaxed">{assessment.principalRemarksBn}</p>
                <span className="text-[10px] text-amber-700 block mt-2 font-medium">
                  স্বাক্ষরিত: ড. মাহমুদা খাতুন (অধ্যক্ষ, আনন্দ পাঠশালা) · তারিখ: ৩১ অক্টোবর ২০২৬
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Certificate-Style Report Card Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs overflow-y-auto p-4 flex items-start justify-center">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-amber-300 shadow-2xl p-6 sm:p-8 relative space-y-6 my-6">
            {/* Header controls */}
            <div className="no-print sticky top-0 bg-white/95 backdrop-blur-xs z-10 py-2 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>অফিসিয়াল কেজি ও প্লে স্কুল প্রগ্রেস কার্ড</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  প্রিন্ট করুন (Print Card)
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  বন্ধ
                </button>
              </div>
            </div>

            {/* The Certificate / Report Card Canvas */}
            <div className="border-4 border-double border-amber-400 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-amber-50/20 via-white to-amber-50/30 space-y-6">
              {/* Card Header with Official Ananda Pathshala Kushtia Crest */}
              <div className="text-center space-y-1">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-1 shadow-md border border-emerald-300 overflow-hidden">
                  <img
                    src="/assets/fb/logo.jpg"
                    alt="আনন্দ পাঠশালা কুষ্টিয়া লোগো"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">আনন্দ পাঠশালা</h1>
                <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">
                  ANANDA PATHSHALA · কুষ্টিয়ার একমাত্র প্রি-স্কুল
                </p>
                <p className="text-[11px] text-slate-500">
                  ২২, পূর্ণ চন্দ্র লাহিড়ী লেন, গোশালা, কোর্টপাড়া, কুষ্টিয়া · হেল্পলাইন: ০১৯১৪-০৫৭৫১১
                </p>
                <div className="inline-block mt-2 bg-gradient-to-r from-emerald-600 to-amber-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-xs">
                  শিশুর সামগ্রিক বিকাশ ও প্রগ্রেস কার্ড — ২০২৬
                </div>
              </div>

              {/* Student Info Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">শিক্ষার্থীর নাম:</span>
                  <span className="font-bold text-slate-900">{currentStudent.nameBn}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">শ্রেণি ও শাখা:</span>
                  <span className="font-bold text-slate-900">{currentStudent.className} ({currentStudent.section})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">রোল নম্বর:</span>
                  <span className="font-bold text-slate-900">{currentStudent.rollNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">মূল্যায়ন কাল:</span>
                  <span className="font-bold text-slate-900">{assessment.termBn}</span>
                </div>
              </div>

              {/* Skills Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-amber-300 bg-amber-100/60 text-slate-800 font-bold">
                      <th className="py-2.5 px-3">মূল্যায়ন ক্ষেত্র (Development Dimension)</th>
                      <th className="py-2.5 px-3 text-center">স্টার রেটিং (Rating)</th>
                      <th className="py-2.5 px-3">শ্রেণি শিক্ষকের মন্তব্য ও পর্যবেক্ষণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assessment.skills.map((c) => (
                      <tr key={c.category} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {c.categoryTitleBn}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            {'★'.repeat(c.score)}{'☆'.repeat(5 - c.score)} ({c.score}/৫)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {c.observationBn}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Growth strip */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">উচ্চতা:</span>
                  <span className="font-bold text-slate-900 font-mono">{assessment.growth.heightCm} সেমি</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">ওজন:</span>
                  <span className="font-bold text-slate-900 font-mono">{assessment.growth.weightKg} কেজি</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">সামগ্রিক অ্যাওয়ার্ড:</span>
                  <span className="font-bold text-amber-700">{holisticMeta.badgeBn}</span>
                </div>
              </div>

              {/* Teacher Remarks */}
              <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-200/60 text-xs">
                <span className="font-bold text-slate-900 block mb-1">শ্রেণি শিক্ষকের মন্তব্য:</span>
                <p className="text-slate-700 italic">"{assessment.teacherRemarksBn}"</p>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs text-slate-600">
                <div className="border-t border-slate-300 pt-2">
                  <span className="block font-medium">শ্রেণি শিক্ষক</span>
                  <span className="text-[10px] text-slate-400">রোকেয়া পারভীন</span>
                </div>
                <div className="border-t border-slate-300 pt-2">
                  <span className="block font-medium">অভিভাবকের স্বাক্ষর</span>
                  <span className="text-[10px] text-slate-400">তারিখ: ..............</span>
                </div>
                <div className="border-t border-slate-300 pt-2">
                  <span className="block font-medium">অধ্যক্ষ / প্রিন্সিপাল</span>
                  <span className="text-[10px] text-slate-400">ড. মাহমুদা খাতুন</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
