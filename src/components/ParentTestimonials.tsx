import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react';

interface Testimonial {
  id: string;
  parentNameBn: string;
  relationBn: string;
  childNameBn: string;
  childClassBn: string;
  commentBn: string;
  rating: number;
  avatarBg: string;
  avatarInitial: string;
}

export const ParentTestimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const testimonials: Testimonial[] = [
    {
      id: 't-1',
      parentNameBn: 'সুব্রত রায়',
      relationBn: 'পিতা',
      childNameBn: 'আদিত্য রায়',
      childClassBn: 'প্লে শ্রেণি',
      commentBn:
        'আনন্দ পাঠশালায় ভর্তি করানোর পর আমার ছেলের পড়াশোনার প্রতি কোনো ভয় নেই। প্রতিদিন সকালে নিজেই স্কুলে যাওয়ার জন্য উৎসাহ দেখায়। এখানকার রঙিন মন্টেসরি উপকরণ আর শিক্ষকদের স্নেহময় যত্ন সত্যিই প্রশংসনীয়।',
      rating: 5,
      avatarBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      avatarInitial: 'সু',
    },
    {
      id: 't-2',
      parentNameBn: 'ডা. ফারহানা সুলতানা',
      relationBn: 'মাতা',
      childNameBn: 'তানিশা ইসলাম',
      childClassBn: 'নার্সারি শ্রেণি',
      commentBn:
        'কুষ্টিয়া শহরে এমন নিরাপদ ও শিশুবান্ধব শিক্ষালয় পেয়ে আমরা দারুণ সন্তুষ্ট। বিশেষ করে ডিজিটাল গেট-পাস ও অভিভাবক আইডি যাচাই পদ্ধতি চমৎকার। কর্মজীবী মা হিসেবে আমি মেয়ের নিরাপত্তা নিয়ে সম্পূর্ণ নিশ্চিন্ত থাকি।',
      rating: 5,
      avatarBg: 'bg-sky-100 text-sky-800 border-sky-300',
      avatarInitial: 'ফা',
    },
    {
      id: 't-3',
      parentNameBn: 'মো. রফিকুল ইসলাম',
      relationBn: 'পিতা',
      childNameBn: 'অন্বেষা ইসলাম',
      childClassBn: 'হাতেখড়ি শ্রেণি',
      commentBn:
        'বাচ্চাদের জোর করে মুখস্থ না করিয়ে গান, ছড়া ও ছবির মাধ্যমে বর্ণমালা ও সংখ্যা শেখানোর ধরনটা চমৎকার। আনন্দ পাঠশালার প্রতিটি শিক্ষক আন্তরিক ও দায়িত্বশীল।',
      rating: 5,
      avatarBg: 'bg-amber-100 text-amber-800 border-amber-300',
      avatarInitial: 'র',
    },
    {
      id: 't-4',
      parentNameBn: 'নাজমুন নাহার পারভীন',
      relationBn: 'মাতা',
      childNameBn: 'রোহান কবির',
      childClassBn: 'কেজি শ্রেণি',
      commentBn:
        'শ্রেণিকক্ষে শিক্ষার্থীর অনুপাত সীমিত হওয়ায় শিক্ষকরা প্রতিটি বাচ্চার প্রতি আলাদা নজর দিতে পারেন। নিয়মিত শিক্ষক-অভিভাবক বৈঠক ও ডিজিটাল ডায়রি আমাদের খুব সাহায্য করে।',
      rating: 5,
      avatarBg: 'bg-purple-100 text-purple-800 border-purple-300',
      avatarInitial: 'না',
    },
  ];

  const total = testimonials.length;

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      next();
    } else if (distance < -45) {
      prev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      next();
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, next]);

  const current = testimonials[currentIndex];

  return (
    <section
      aria-label="অভিভাবকদের মতামত ও অভিজ্ঞতা"
      className="bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 rounded-3xl border border-emerald-100 p-6 sm:p-10 shadow-2xs space-y-6 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
            <span>অভিভাবকদের ভালোবাসা ও আস্থা</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            আনন্দ পাঠশালা সম্পর্কে সম্মানিত অভিভাবকবৃন্দ কী বলছেন
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            আমাদের আনন্দময় শিক্ষাদান, ক্যাম্পাস নিরাপত্তা ও শিশুতোষ পরিবেশ নিয়ে অভিভাবকদের অনুভূতি।
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={prev}
            className="w-10 h-10 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-all shadow-2xs hover:border-emerald-300 cursor-pointer active:scale-95"
            aria-label="পূর্ববর্তী অভিভাবক মতামত"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="w-10 h-10 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-all shadow-2xs hover:border-emerald-300 cursor-pointer active:scale-95"
            aria-label="পরবর্তী অভিভাবক মতামত"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Review Card - Stabilized min-height prevents layout shifts */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs relative overflow-hidden transition-all duration-300 min-h-[230px] sm:min-h-[210px] flex flex-col justify-between">
        <Quote className="absolute top-4 right-6 w-16 h-16 text-emerald-100 -rotate-12 pointer-events-none" />

        <div className="relative z-10 space-y-4 flex flex-col justify-between flex-1">
          {/* Star Rating */}
          <div className="flex items-center gap-1">
            {[...Array(current.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
            <span className="text-xs font-bold text-slate-600 ml-2">৫.০ / ৫.০ স্টার রিভিউ</span>
          </div>

          {/* Testimonial Quote - Minimum height ensures stable layout */}
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal italic min-h-[72px] sm:min-h-[56px] flex items-center">
            “{current.commentBn}”
          </p>

          {/* Author Details */}
          <div className="pt-3 flex items-center gap-3 border-t border-slate-100 mt-auto">
            <div
              className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center font-black text-base shadow-2xs ${current.avatarBg}`}
            >
              {current.avatarInitial}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">
                {current.parentNameBn}{' '}
                <span className="text-xs font-semibold text-slate-500">
                  ({current.relationBn})
                </span>
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                শিক্ষার্থী: {current.childNameBn} · {current.childClassBn}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="flex items-center justify-center gap-2 pt-1">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all rounded-full cursor-pointer ${
              idx === currentIndex
                ? 'w-6 h-2 bg-emerald-600 shadow-xs'
                : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
            }`}
            title={`মতামত ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
