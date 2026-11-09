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
          '২০২৭ শিক্ষাবর্ষে আপনার শিশুর বয়স ২.৫ বছরের কম হচ্ছে। শিশু ২.৫ বছর পূর্ণ করলে হাতেখড়ি শ্রেণিতে ভর্তির সুযোগ পাবে। তবে ক্যাম্পাসে এসে প্রাথমিক কাউন্সেলিং নিতে পারেন।',
        status: 'too_young',
        accentColor: 'border-amber-300 bg-amber-50 text-amber-900',
      };
    } else if (totalDecimalYears >= 2.5 && totalDecimalYears < 3.5) {
      recommendation = {
        classId: 'HateKhori',
        classNameBn: 'হাতেখড়ি (Pre-Play)',
        ageRangeBn: '২.৫ থেকে ৩.৫ বছর',
        descriptionBn:
          'খেলাধুলা, ছড়া, বর্ণমালার সাথে প্রাথমিক ভাববিনিময় ও বর্ণিল মন্টেসরি উপকরণের মাধ্যমে ভয়হীন আনন্দের সূচনা।',
        status: 'eligible',
        accentColor: 'border-emerald-300 bg-emerald-50 text-emerald-950',
      };
    } else if (totalDecimalYears >= 3.5 && totalDecimalYears < 4.5) {
      recommendation = {
        classId: 'Play',
        classNameBn: 'প্লে (Play Group)',
        ageRangeBn: '৩.৫ থেকে ৪.৫ বছর',
        descriptionBn:
          'সুর, ছন্দ, উচ্চারণ, সেন্সরি অ্যাক্টিভিটি ও বর্ণ-সংখ্যার পরিচয় দিয়ে সামাজিক যোগাযোগ ও আত্মবিশ্বাস গড়ে তোলা।',
        status: 'eligible',
        accentColor: 'border-teal-300 bg-teal-50 text-teal-950',
      };
    } else if (totalDecimalYears >= 4.5 && totalDecimalYears < 5.5) {
      recommendation = {
        classId: 'Nursery',
        classNameBn: 'নার্সারি (Nursery)',
        ageRangeBn: '৪.৫ থেকে ৫.৫ বছর',
        descriptionBn:
          'শব্দ গঠন, ড্রইং, হাতের লেখার সুন্দর চর্চা, প্রাথমিক পরিবেশ বিজ্ঞান ও সৃজনশীল আর্ট-ক্রাফট শিক্ষা।',
        status: 'eligible',
        accentColor: 'border-sky-300 bg-sky-50 text-sky-950',
      };
    } else if (totalDecimalYears >= 5.5 && totalDecimalYears < 6.5) {
      recommendation = {
        classId: 'KG',
        classNameBn: 'কেজি (Kindergarten)',
        ageRangeBn: '৫.৫ থেকে ৬.৫ বছর',
        descriptionBn:
          'বাক্য গঠন, সহজ গণিত, ইংরেজি ধ্বনি (Phonics), বিজ্ঞান কৌতূহল ও প্রাথমিক আনুষ্ঠানিক ক্লাসের পূর্ণ প্রস্তুতি।',
        status: 'eligible',
        accentColor: 'border-purple-300 bg-purple-50 text-purple-950',
      };
    } else if (totalDecimalYears >= 6.5 && totalDecimalYears < 7.5) {
      recommendation = {
        classId: 'Class1',
        classNameBn: '১ম শ্রেণি (Class One)',
        ageRangeBn: '৬.৫ থেকে ৭.৫ বছর',
        descriptionBn:
          'জাতীয় পাঠ্যক্রম ও আন্তর্জাতিক মানের সমন্বয়, সৃজনশীল গণিত, পাঠ্যাভ্যাস ও নৈতিক মূল্যবোধ শিক্ষা।',
        status: 'eligible',
        accentColor: 'border-rose-300 bg-rose-50 text-rose-950',
      };
    } else {
      recommendation = {
        classId: 'Class2',
        classNameBn: '২য় শ্রেণি (Class Two)',
        ageRangeBn: '৭.৫+ বছর',
        descriptionBn:
          'উন্নত পঠন-পাঠন, সমস্যা সমাধানের দক্ষতা ও সাংস্কৃতিক কার্যক্রমে অংশগ্রহণ।',
        status: 'eligible',
        accentColor: 'border-indigo-300 bg-indigo-50 text-indigo-950',
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
    <div className="bg-gradient-to-br from-white via-amber-50/20 to-emerald-50/30 rounded-3xl border-2 border-emerald-100 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>স্মার্ট অ্যাডমিশন অ্যাসিস্ট্যান্ট · শিক্ষাবর্ষ ২০২৭</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            আপনার শিশুর বয়স অনুযায়ী উপযুক্ত শ্রেণি নির্বাচন করুন
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            শিশুর জন্মতারিখ দিন—সিস্টেম জানিয়ে দেবে ২০২৭ সালের শুরুতে সে কোন শ্রেণির জন্য আদর্শ।
          </p>
        </div>

        <div className="shrink-0">
          <label className="text-xs font-bold text-slate-700 block mb-1">
            শিশুর জন্মতারিখ নির্বাচন করুন:
          </label>
          <div className="relative">
            <input
              type="date"
              value={dobInput}
              onChange={(e) => setDobInput(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {calculation && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Age Summary Pill */}
          <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 text-xs font-bold">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>০১ জানুয়ারি ২০২৭ তারিখে বয়স:</span>
            </div>
            <div className="text-3xl font-black text-emerald-800 tracking-tight">
              {toBnNumber(calculation.years)} বছর {toBnNumber(calculation.months)} মাস
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              সেশন শুরুর দিনে এই হিসাবটি সরকারি ও প্রাতিষ্ঠানিক কারিকুলাম নীতিমালা অনুযায়ী প্রস্তুতকৃত।
            </p>
          </div>

          {/* Recommended Class Card */}
          <div
            className={`md:col-span-8 p-5 sm:p-6 rounded-2xl border-2 ${calculation.recommendation.accentColor} shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-5`}
          >
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-white/80 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  সুপারিশকৃত শ্রেণি
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  বয়সসীমা: {calculation.recommendation.ageRangeBn}
                </span>
              </div>
              <h4 className="text-2xl font-black text-slate-900">
                {calculation.recommendation.classNameBn}
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed max-w-lg">
                {calculation.recommendation.descriptionBn}
              </p>
            </div>

            {calculation.recommendation.classId && (
              <button
                type="button"
                onClick={() => {
                  if (calculation.recommendation.classId) {
                    onSelectClassAndApply(calculation.recommendation.classId);
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>এই শ্রেণিতে আবেদন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
