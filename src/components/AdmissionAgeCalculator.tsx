import React, { useState, useMemo } from 'react';
import { SchoolClass } from '../types/school';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Baby,
  Smile,
  AlertCircle,
  GraduationCap,
  CalendarCheck2,
} from 'lucide-react';

interface AdmissionAgeCalculatorProps {
  onSelectClassAndApply: (schoolClass: SchoolClass) => void;
}

interface ClassRecommendation {
  classId: SchoolClass | null;
  classNameBn: string;
  ageRangeBn: string;
  descriptionBn: string;
  status: 'eligible' | 'too_young' | 'older';
  accentColor: string;
  badgeBg: string;
}

export const AdmissionAgeCalculator: React.FC<AdmissionAgeCalculatorProps> = ({
  onSelectClassAndApply,
}) => {
  // Default child DOB: ~3 years old on Jan 1, 2027 (e.g. 2023-08-15)
  const [dobInput, setDobInput] = useState<string>('2023-08-15');

  // Convert numbers to Bengali digits
  const toBnNumber = (n: number | string) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(n)
      .split('')
      .map((ch) => bnDigits[parseInt(ch, 10)] || ch)
      .join('');
  };

  // Calculate age on Jan 1, 2027
  const calculation = useMemo(() => {
    if (!dobInput) return null;
    const dob = new Date(dobInput);
    if (isNaN(dob.getTime())) return null;

    // Session start anchor date: January 1, 2027
    const sessionDate = new Date(2027, 0, 1);

    let years = sessionDate.getFullYear() - dob.getFullYear();
    let months = sessionDate.getMonth() - dob.getMonth();
    let days = sessionDate.getDate() - dob.getDate();

    if (days < 0) {
      months -= 1;
      days += 30;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalDecimalYears = years + months / 12 + days / 365;

    let recommendation: ClassRecommendation;

    if (totalDecimalYears < 2.5) {
      recommendation = {
        classId: null,
        classNameBn: 'বয়স এখনও কিছুটা কম',
        ageRangeBn: '২.৫ বছর পূর্ণ হলে যোগ্য',
        descriptionBn:
          '২০২৭ শিক্ষাবর্ষের শুরুতে আপনার শিশুর বয়স ২.৫ বছরের কম হচ্ছে। শিশু ২.৫ বছর পূর্ণ করলে হাতেখড়ি শ্রেণিতে ভর্তির সুযোগ পাবে। তবে আপনি চাইলে এখনই ক্যাম্পাসে এসে শিশুশিক্ষা প্রাথমিক কাউন্সেলিং ও ভর্তি তথ্য জেনে রাখতে পারেন।',
        status: 'too_young',
        accentColor: 'border-amber-400 bg-amber-50/80 text-amber-950',
        badgeBg: 'bg-amber-500 text-white',
      };
    } else if (totalDecimalYears >= 2.5 && totalDecimalYears < 3.5) {
      recommendation = {
        classId: 'HateKhori',
        classNameBn: 'হাতেখড়ি (Pre-Play)',
        ageRangeBn: '২.৫ থেকে ৩.৫ বছর',
        descriptionBn:
          'খেলাধুলা, ছড়া, বর্ণমালার সাথে প্রাথমিক ভাববিনিময় ও বর্ণিল মন্টেসরি উপকরণের মাধ্যমে ভয়হীন আনন্দের সূচনা।',
        status: 'eligible',
        accentColor: 'border-pink-300 bg-pink-50/80 text-pink-950',
        badgeBg: 'bg-pink-600 text-white',
      };
    } else if (totalDecimalYears >= 3.5 && totalDecimalYears < 4.5) {
      recommendation = {
        classId: 'Play',
        classNameBn: 'প্লে (Play Group)',
        ageRangeBn: '৩.৫ থেকে ৪.৫ বছর',
        descriptionBn:
          'সুর, ছন্দ, উচ্চারণ, সেন্সরি অ্যাক্টিভিটি ও বর্ণ-সংখ্যার পরিচয় দিয়ে সামাজিক যোগাযোগ ও আত্মবিশ্বাস গড়ে তোলা।',
        status: 'eligible',
        accentColor: 'border-emerald-300 bg-emerald-50/80 text-emerald-950',
        badgeBg: 'bg-emerald-600 text-white',
      };
    } else if (totalDecimalYears >= 4.5 && totalDecimalYears < 5.5) {
      recommendation = {
        classId: 'Nursery',
        classNameBn: 'নার্সারি (Nursery)',
        ageRangeBn: '৪.৫ থেকে ৫.৫ বছর',
        descriptionBn:
          'শব্দ গঠন, ড্রইং, হাতের লেখার সুন্দর চর্চা, প্রাথমিক পরিবেশ বিজ্ঞান ও সৃজনশীল আর্ট-ক্রাফট শিক্ষা।',
        status: 'eligible',
        accentColor: 'border-teal-300 bg-teal-50/80 text-teal-950',
        badgeBg: 'bg-teal-600 text-white',
      };
    } else if (totalDecimalYears >= 5.5 && totalDecimalYears < 6.5) {
      recommendation = {
        classId: 'KG',
        classNameBn: 'কেজি (Kindergarten)',
        ageRangeBn: '৫.৫ থেকে ৬.৫ বছর',
        descriptionBn:
          'বাক্য গঠন, সহজ গণিত, ইংরেজি ধ্বনি (Phonics), বিজ্ঞান কৌতূহল ও প্রাথমিক আনুষ্ঠানিক ক্লাসের পূর্ণ প্রস্তুতি।',
        status: 'eligible',
        accentColor: 'border-amber-300 bg-amber-50/80 text-amber-950',
        badgeBg: 'bg-amber-600 text-white',
      };
    } else if (totalDecimalYears >= 6.5 && totalDecimalYears < 7.5) {
      recommendation = {
        classId: 'Class-1',
        classNameBn: '১ম শ্রেণি (Class One)',
        ageRangeBn: '৬.৫ থেকে ৭.৫ বছর',
        descriptionBn:
          'জাতীয় পাঠ্যক্রম ও আন্তর্জাতিক মানের সমন্বয়, সৃজনশীল গণিত, পাঠ্যাভ্যাস ও নৈতিক মূল্যবোধ শিক্ষা।',
        status: 'eligible',
        accentColor: 'border-indigo-300 bg-indigo-50/80 text-indigo-950',
        badgeBg: 'bg-indigo-600 text-white',
      };
    } else {
      recommendation = {
        classId: 'Class-2',
        classNameBn: '২য় শ্রেণি (Class Two)',
        ageRangeBn: '৭.৫+ বছর',
        descriptionBn:
          'উন্নত পঠন-পাঠন, সমস্যা সমাধানের দক্ষতা ও সহ-শিক্ষামূলক কার্যক্রমে সক্রিয় অংশগ্রহণ।',
        status: 'eligible',
        accentColor: 'border-blue-300 bg-blue-50/80 text-blue-950',
        badgeBg: 'bg-blue-600 text-white',
      };
    }

    return {
      years,
      months,
      days,
      recommendation,
    };
  }, [dobInput]);

  return (
    <div className="bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 rounded-3xl sm:rounded-4xl border-2 border-emerald-300/80 p-5 sm:p-9 shadow-xl shadow-emerald-950/5 space-y-6 sm:space-y-8 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Intro */}
      <div className="relative z-10 space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-sm shadow-emerald-700/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>স্মার্ট অ্যাডমিশন অ্যাসিস্ট্যান্ট · শিক্ষাবর্ষ ২০২৭</span>
        </div>
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          শিশুর বয়স ও শ্রেণি নির্ধারণ ক্যালকুলেটর
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
          শিশুর সঠিক জন্মতারিখ নির্বাচন করুন—সিস্টেম স্বয়ংক্রিয়ভাবে বয়স হিসাব করে ২০২৭ শিক্ষাবর্ষের সরকারি ও প্রাতিষ্ঠানিক নীতিমালা অনুযায়ী উপযুক্ত শ্রেণি সুপারিশ করবে।
        </p>
      </div>

      {/* High-Visibility Dedicated Birth Date Selector Bar */}
      <div className="relative z-10 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg shadow-emerald-950/25 border border-emerald-400/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Label & Instructions */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-white/15 text-amber-300 border border-white/20 shadow-inner">
                <Calendar className="w-5 sm:w-6 h-5 sm:h-6" />
              </span>
              <label htmlFor="child-dob-input" className="text-lg sm:text-xl font-black text-white tracking-tight cursor-pointer">
                শিশুর জন্ম তারিখ নির্বাচন করুন:
              </label>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium pl-1">
              ক্যালেন্ডার চিহ্নে চাপ দিয়ে শিশুর জন্ম তারিখ বাছাই করুন বা টাইপ করুন (দিন/মাস/বছর)।
            </p>
          </div>

          {/* Large Prominent Date Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="relative flex-1 sm:w-72">
              <input
                id="child-dob-input"
                type="date"
                value={dobInput}
                onChange={(e) => setDobInput(e.target.value)}
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-white text-slate-900 text-base sm:text-lg font-black rounded-2xl border-2 border-amber-400 focus:border-amber-300 focus:ring-4 focus:ring-emerald-300/40 shadow-md outline-none cursor-pointer transition-all"
                title="শিশুর জন্মতারিখ নির্বাচন করুন"
              />
            </div>
          </div>
        </div>

        {/* Quick Helper Presets */}
        <div className="mt-4 pt-3.5 border-t border-white/15 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] sm:text-xs text-emerald-200 font-bold flex items-center gap-1">
            <CalendarCheck2 className="w-3.5 h-3.5 text-amber-300" />
            <span>দ্রুত যাচাই করুন:</span>
          </span>
          <button
            type="button"
            onClick={() => setDobInput('2024-02-15')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              dobInput === '2024-02-15'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
          >
            হাতেখড়ি (~২.৫ বছর)
          </button>
          <button
            type="button"
            onClick={() => setDobInput('2023-08-15')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              dobInput === '2023-08-15'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
          >
            প্লে গ্রুপ (~৩.৫ বছর)
          </button>
          <button
            type="button"
            onClick={() => setDobInput('2022-07-15')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              dobInput === '2022-07-15'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
          >
            নার্সারি (~৪.৫ বছর)
          </button>
          <button
            type="button"
            onClick={() => setDobInput('2021-08-15')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              dobInput === '2021-08-15'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
          >
            কেজি (~৫.৫ বছর)
          </button>
          <button
            type="button"
            onClick={() => setDobInput('2020-07-15')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              dobInput === '2020-07-15'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
          >
            ১ম শ্রেণি (~৬.৫ বছর)
          </button>
        </div>
      </div>

      {/* Dynamic Results Section (বড় ও সুপার হাইলাইটেড) */}
      {calculation ? (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch animate-in fade-in zoom-in-95 duration-200">
          {/* Card 1: Exact Age Result Breakdown */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border-2 border-emerald-200 shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>০১ জানুয়ারি ২০২৭ (সেশন শুরুর দিন) শিশুর বয়স হবে:</span>
              </div>

              {/* Huge Age Counter */}
              <div className="space-y-1 pt-1">
                <div className="text-3xl sm:text-4xl font-black text-emerald-800 tracking-tight flex flex-wrap items-baseline gap-2">
                  <span>
                    <span className="text-4xl sm:text-5xl font-black text-emerald-700">{toBnNumber(calculation.years)}</span>{' '}
                    <span className="text-base sm:text-lg font-bold text-slate-700">বছর</span>
                  </span>
                  <span>
                    <span className="text-4xl sm:text-5xl font-black text-emerald-700">{toBnNumber(calculation.months)}</span>{' '}
                    <span className="text-base sm:text-lg font-bold text-slate-700">মাস</span>
                  </span>
                  <span>
                    <span className="text-4xl sm:text-5xl font-black text-emerald-700">{toBnNumber(calculation.days)}</span>{' '}
                    <span className="text-base sm:text-lg font-bold text-slate-700">দিন</span>
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-semibold pt-1">
                  জন্ম তারিখ: <span className="font-bold text-slate-800">{new Date(dobInput).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                এই বয়স হিসাবটি জাতীয় প্রাক-প্রাথমিক ও প্রাথমিক শিক্ষা নীতিমালা অনুযায়ী স্বয়ংক্রিয়ভাবে নিরূপিত।
              </span>
            </div>
          </div>

          {/* Card 2: Recommended Class & Action CTA */}
          <div
            className={`lg:col-span-7 p-6 sm:p-7 rounded-3xl border-2 ${calculation.recommendation.accentColor} shadow-md flex flex-col justify-between gap-5 relative overflow-hidden`}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`text-xs font-black px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5 ${calculation.recommendation.badgeBg}`}>
                  {calculation.recommendation.status === 'eligible' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ভর্তির জন্য উপযুক্ত শ্রেণি</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>বয়স বিষয়ক পরামর্শ</span>
                    </>
                  )}
                </span>

                <span className="text-xs font-bold text-slate-700 bg-white/90 px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                  নির্ধারিত বয়সসীমা: <strong className="text-slate-900">{calculation.recommendation.ageRangeBn}</strong>
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <GraduationCap className="w-7 h-7 text-emerald-700" />
                  <span>{calculation.recommendation.classNameBn}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {calculation.recommendation.descriptionBn}
                </p>
              </div>
            </div>

            {/* Application Action Button */}
            <div className="pt-2">
              {calculation.recommendation.classId ? (
                <button
                  type="button"
                  onClick={() => {
                    if (calculation.recommendation.classId) {
                      onSelectClassAndApply(calculation.recommendation.classId);
                    }
                  }}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:scale-95 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-emerald-900/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:scale-[1.02]"
                >
                  <span>{calculation.recommendation.classNameBn} তে অনলাইনে আবেদন করুন</span>
                  <ArrowRight className="w-5 h-5 animate-pulse" />
                </button>
              ) : (
                <div className="p-3 bg-amber-100/80 rounded-2xl border border-amber-300 text-xs font-bold text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>শিশু ২.৫ বছর পূর্ণ করা সাপেক্ষে ভর্তির সুযোগ দেওয়া হবে। বিস্তারিত জানতে বিদ্যালয় হেল্পলাইনে যোগাযোগ করুন।</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border-2 border-dashed border-emerald-300 text-slate-500 space-y-2">
          <Calendar className="w-10 h-10 text-emerald-500 mx-auto animate-pulse" />
          <h4 className="text-base font-bold text-slate-800">অনুগ্রহ করে উপরে শিশুর জন্ম তারিখ নির্বাচন করুন</h4>
          <p className="text-xs text-slate-500">জন্ম তারিখ দিলে নিচে তাৎক্ষণিকভাবে শিশুর বয়স ও উপযুক্ত শ্রেণি চলে আসবে।</p>
        </div>
      )}
    </div>
  );
};
