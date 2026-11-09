import React, { useState, useMemo } from 'react';
import { SchoolClass } from '../types/school';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  GraduationCap,
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
      };
    } else if (totalDecimalYears >= 2.5 && totalDecimalYears < 3.5) {
      recommendation = {
        classId: 'HateKhori',
        classNameBn: 'হাতেখড়ি (Pre-Play)',
        ageRangeBn: '২.৫ থেকে ৩.৫ বছর',
        descriptionBn:
          'খেলাধুলা, ছড়া, বর্ণমালার সাথে প্রাথমিক ভাববিনিময় ও বর্ণিল মন্টেসরি উপকরণের মাধ্যমে ভয়হীন আনন্দের সূচনা।',
        status: 'eligible',
      };
    } else if (totalDecimalYears >= 3.5 && totalDecimalYears < 4.5) {
      recommendation = {
        classId: 'Play',
        classNameBn: 'প্লে (Play Group)',
        ageRangeBn: '৩.৫ থেকে ৪.৫ বছর',
        descriptionBn:
          'সুর, ছন্দ, উচ্চারণ, সেন্সরি অ্যাক্টিভিটি ও বর্ণ-সংখ্যার পরিচয় দিয়ে সামাজিক যোগাযোগ ও আত্মবিশ্বাস গড়ে তোলা।',
        status: 'eligible',
      };
    } else if (totalDecimalYears >= 4.5 && totalDecimalYears < 5.5) {
      recommendation = {
        classId: 'Nursery',
        classNameBn: 'নার্সারি (Nursery)',
        ageRangeBn: '৪.৫ থেকে ৫.৫ বছর',
        descriptionBn:
          'শব্দ গঠন, ড্রইং, হাতের লেখার সুন্দর চর্চা, প্রাথমিক পরিবেশ বিজ্ঞান ও সৃজনশীল আর্ট-ক্রাফট শিক্ষা।',
        status: 'eligible',
      };
    } else if (totalDecimalYears >= 5.5 && totalDecimalYears < 6.5) {
      recommendation = {
        classId: 'KG',
        classNameBn: 'কেজি (Kindergarten)',
        ageRangeBn: '৫.৫ থেকে ৬.৫ বছর',
        descriptionBn:
          'বাক্য গঠন, সহজ গণিত, ইংরেজি ধ্বনি (Phonics), বিজ্ঞান কৌতূহল ও প্রাথমিক আনুষ্ঠানিক ক্লাসের পূর্ণ প্রস্তুতি।',
        status: 'eligible',
      };
    } else if (totalDecimalYears >= 6.5 && totalDecimalYears < 7.5) {
      recommendation = {
        classId: 'Class-1',
        classNameBn: '১ম শ্রেণি (Class One)',
        ageRangeBn: '৬.৫ থেকে ৭.৫ বছর',
        descriptionBn:
          'জাতীয় পাঠ্যক্রম ও আন্তর্জাতিক মানের সমন্বয়, সৃজনশীল গণিত, পাঠ্যাভ্যাস ও নৈতিক মূল্যবোধ শিক্ষা।',
        status: 'eligible',
      };
    } else {
      recommendation = {
        classId: 'Class-2',
        classNameBn: '২য় শ্রেণি (Class Two)',
        ageRangeBn: '৭.৫+ বছর',
        descriptionBn:
          'উন্নত পঠন-পাঠন, সমস্যা সমাধানের দক্ষতা ও সহ-শিক্ষামূলক কার্যক্রমে সক্রিয় অংশগ্রহণ।',
        status: 'eligible',
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
    <div className="w-full max-w-full bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white rounded-3xl sm:rounded-4xl border-2 sm:border-3 border-emerald-500/50 p-4 sm:p-7 md:p-9 shadow-2xl shadow-emerald-950/50 relative overflow-hidden space-y-5 sm:space-y-6 box-border">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Intro */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>স্মার্ট অ্যাডমিশন অ্যাসিস্ট্যান্ট · শিক্ষাবর্ষ ২০২৭</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
            শিশুর বয়স ও শ্রেণি নির্ধারণ ক্যালকুলেটর
          </h3>
          <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
            শিশুর জন্মতারিখ নির্বাচন করুন—সিস্টেম স্বয়ংক্রিয়ভাবে বয়স হিসাব করে ২০২৭ শিক্ষাবর্ষের উপযুক্ত শ্রেণি সুপারিশ করবে।
          </p>
        </div>
      </div>

      {/* Responsive Birth Date Selector Row (Never overflows container) */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-emerald-500/40 shadow-inner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 text-amber-300 border border-emerald-400/30 shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <div className="min-w-0">
              <label
                htmlFor="child-dob-input"
                className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight block truncate cursor-pointer"
              >
                শিশুর জন্ম তারিখ নির্বাচন করুন:
              </label>
              <span className="text-[11px] sm:text-xs text-emerald-300 font-medium block">
                ক্যালেন্ডারে চাপ দিয়ে দিন / মাস / বছর সিলেক্ট করুন
              </span>
            </div>
          </div>

          <div className="w-full md:w-auto min-w-0 shrink-0">
            <input
              id="child-dob-input"
              type="date"
              value={dobInput}
              onChange={(e) => setDobInput(e.target.value)}
              className="w-full md:w-64 max-w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white text-slate-950 text-sm sm:text-base font-black rounded-xl sm:rounded-2xl border-2 border-amber-400 focus:border-amber-300 focus:ring-4 focus:ring-emerald-400/40 shadow-md outline-none cursor-pointer transition-all box-border"
              title="শিশুর জন্মতারিখ নির্বাচন করুন"
            />
          </div>
        </div>
      </div>

      {/* Unified Results Area in the Exact Same Box */}
      {calculation ? (
        <div className="relative z-10 space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-200">
          {/* Highlighted Age Summary Banner in the Same Box */}
          <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/25 to-teal-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-amber-400/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-center md:text-left">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-300 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/40">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>১ জানুয়ারি ২০২৭ তারিখে শিশুর বয়স হবে:</span>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex flex-wrap items-baseline justify-center md:justify-start gap-1.5 sm:gap-2">
                <span className="text-amber-300 font-extrabold">{toBnNumber(calculation.years)}</span>{' '}
                <span className="text-xs sm:text-sm text-emerald-100 font-bold">বছর</span>
                <span className="text-amber-300 font-extrabold">{toBnNumber(calculation.months)}</span>{' '}
                <span className="text-xs sm:text-sm text-emerald-100 font-bold">মাস</span>
                <span className="text-amber-300 font-extrabold">{toBnNumber(calculation.days)}</span>{' '}
                <span className="text-xs sm:text-sm text-emerald-100 font-bold">দিন</span>
              </div>
            </div>

            <div className="text-xs text-emerald-200/90 font-medium bg-slate-900/60 px-3 py-2 rounded-xl border border-emerald-500/30">
              <span>জন্ম তারিখ: </span>
              <span className="font-bold text-white">
                {new Date(dobInput).toLocaleDateString('bn-BD', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Integrated Recommendation & Application Section in the Same Box */}
          <div className="bg-slate-900/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 border-emerald-400/50 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-5">
            <div className="space-y-2 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-emerald-600 px-3 py-1 rounded-full shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {calculation.recommendation.status === 'eligible'
                      ? 'ভর্তির জন্য উপযুক্ত শ্রেণি'
                      : 'বয়স বিষয়ক পরামর্শ'}
                  </span>
                </span>
                <span className="text-xs font-bold text-emerald-200 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-700/60">
                  নির্ধারিত বয়সসীমা: <strong className="text-white">{calculation.recommendation.ageRangeBn}</strong>
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center lg:justify-start gap-2">
                  <GraduationCap className="w-7 h-7 text-amber-400" />
                  <span>{calculation.recommendation.classNameBn}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  {calculation.recommendation.descriptionBn}
                </p>
              </div>
            </div>

            {/* Direct Application CTA Button */}
            <div className="w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
              {calculation.recommendation.classId ? (
                <button
                  type="button"
                  onClick={() => {
                    if (calculation.recommendation.classId) {
                      onSelectClassAndApply(calculation.recommendation.classId);
                    }
                  }}
                  className="w-full lg:w-auto px-7 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:scale-[1.02]"
                >
                  <span>{calculation.recommendation.classNameBn} তে অনলাইনে আবেদন করুন</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="p-3.5 bg-amber-950/80 rounded-2xl border border-amber-500/40 text-xs font-bold text-amber-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    শিশু ২.৫ বছর পূর্ণ করা সাপেক্ষে ভর্তির সুযোগ পাবে। প্রয়োজনে বিদ্যালয়ে যোগাযোগ করুন।
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 text-center bg-slate-900/60 rounded-3xl border border-dashed border-emerald-500/40 text-slate-300 space-y-2">
          <Calendar className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
          <h4 className="text-base font-bold text-white">অনুগ্রহ করে উপরে শিশুর জন্ম তারিখ নির্বাচন করুন</h4>
          <p className="text-xs text-emerald-200">
            জন্ম তারিখ দিলে তাৎক্ষণিকভাবে এখানে শিশুর বয়স ও উপযুক্ত শ্রেণির সুপারিশ চলে আসবে।
          </p>
        </div>
      )}
    </div>
  );
};