import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  Bell,
  ArrowRight,
  Pause,
  Play,
  Clock,
  ExternalLink,
} from 'lucide-react';

export interface CarouselSlide {
  id: string;
  type: 'announcement' | 'gallery' | 'seasonal';
  badgeBn: string;
  badgeColor: string;
  titleBn: string;
  titleEn?: string;
  descriptionBn: string;
  imageUrl?: string;
  dateOrTimeBn?: string;
  ctaTextBn?: string;
  ctaAction?: () => void;
  ctaLink?: string;
}

interface HomeCarouselProps {
  onScrollToSection?: (sectionId: string) => void;
  fbGalleryImages?: { id: string; imageUrl: string; titleBn: string }[];
}

export const HomeCarousel: React.FC<HomeCarouselProps> = ({
  onScrollToSection,
  fbGalleryImages = [],
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const fallbackGallery1 = fbGalleryImages[0]?.imageUrl || '/assets/fb/fb_photo_1.jpg';
  const fallbackGallery2 = fbGalleryImages[1]?.imageUrl || '/assets/fb/fb_photo_2.jpg';
  const fallbackCover = '/assets/fb/cover.jpg';

  const slides: CarouselSlide[] = [
    {
      id: 'slide-adm-2026',
      type: 'announcement',
      badgeBn: '📢 জরুরি ঘোষণা · ভর্তি কার্যক্রম',
      badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
      titleBn: 'নতুন শিক্ষাবর্ষ ২০২৬-২০২৭ ভর্তি চলছে',
      titleEn: 'Admissions Open for Playgroup to Class 1',
      descriptionBn:
        'হাতেখড়ি, প্লে, নার্সারি, কেজি ও ১ম শ্রেণিতে সীমিত আসনে ভর্তি চলছে। শিশুর আনন্দময় ও স্নেহমাখা শিক্ষাজীবনের সূচনা হোক কুষ্টিয়ার সেরা প্রি-স্কুল আনন্দ পাঠশালায়।',
      dateOrTimeBn: 'ভর্তি ফরম অনলাইনে পাওয়া যাচ্ছে',
      imageUrl: fallbackCover,
      ctaTextBn: 'অনলাইন ভর্তি ফরম পূরণ করুন',
      ctaLink: '#apply',
    },
    {
      id: 'slide-exam-eval',
      type: 'announcement',
      badgeBn: '📝 বার্ষিক মূল্যায়ন ও পরীক্ষা',
      badgeColor: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
      titleBn: 'বার্ষিক শিখন মূল্যায়ন ও আনন্দমেলা',
      titleEn: 'Annual Learning Assessment & Play Day',
      descriptionBn:
        'আগামী ১৫ নভেম্বর থেকে শুরু হচ্ছে ভয়হীন আনন্দময় শিখন মূল্যায়ন। ছড়া আবৃত্তি, বর্ণ ও সংখ্যা পরিচয়, চিত্রাঙ্কন ও সৃজনশীল মেধা প্রকাশের বিশেষ মূল্যায়ন পর্ব।',
      dateOrTimeBn: '১৫ — ১৯ নভেম্বর ২০২৬ · প্রতিদিন সকাল ৯:৩০',
      imageUrl: fallbackGallery1,
      ctaTextBn: 'শ্রেণি ও পাঠক্রম দেখুন',
      ctaLink: '#curriculum',
    },
    {
      id: 'slide-gallery-highlight',
      type: 'gallery',
      badgeBn: '📸 ফটো অ্যালবাম · ক্যাম্পাসের আনন্দ',
      badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
      titleBn: 'আনন্দ পাঠশালার প্রতিদিনের রঙ্গিন ক্লাসরুম ও খেলাধুলা',
      titleEn: 'Real Classroom Activities & Child Creativity',
      descriptionBn:
        'কাগজের ক্রাফট, ক্লে মডেলিং, বর্ণিল ক্যানভাসে চিত্রাঙ্কন এবং সহপাঠীদের সাথে সামাজিক বন্ধন গড়ে তোলার মায়াময় ক্যাম্পাসের বাস্তব কিছু মুহূর্ত।',
      dateOrTimeBn: 'আনন্দ পাঠশালা ক্যাম্পাস অ্যালবাম',
      imageUrl: fallbackGallery2,
      ctaTextBn: 'ক্যাম্পাস ফটো গ্যালারি দেখুন',
      ctaLink: '#gallery',
    },
    {
      id: 'slide-ptm-meeting',
      type: 'announcement',
      badgeBn: '🤝 অভিভাবক সমাবেশ (PTM)',
      badgeColor: 'bg-teal-500/20 text-teal-200 border-teal-400/30',
      titleBn: 'অভিভাবক সমাবেশ ও রঙিন প্রগ্রেস কার্ড পর্যালোচনা',
      titleEn: 'Parent-Teacher Meeting & Progress Report Review',
      descriptionBn:
        '২৮ নভেম্বর ২০২৬ সকাল ১০:০০ টায় প্রধান শিক্ষক ও শ্রেণি শিক্ষিকাদের সাথে ওয়ান-টু-ওয়ান আলোচনা। শিশুর মানসিক প্রবৃদ্ধি ও পরবর্তী শিক্ষাবর্ষের পরিকল্পনা বিনিময়।',
      dateOrTimeBn: '২৮ নভেম্বর ২০২৬ · সকাল ১০:০০ - দুপুর ০১:০০',
      imageUrl: '/assets/biddalay/fatema_akter.jpg',
      ctaTextBn: 'শিক্ষকদের সাথে পরিচিত হোন',
      ctaLink: '#teachers',
    },
    {
      id: 'slide-seasonal-winter',
      type: 'seasonal',
      badgeBn: '❄️ মৌসুমি নোটিশ · শীতকালীন সময়সূচি',
      badgeColor: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
      titleBn: 'শীতকালীন ক্লাস শিডিউল ও হালকা উষ্ণ পোশাক নির্দেশনা',
      titleEn: 'Winter School Hours & Health Advisory',
      descriptionBn:
        'শীতের সকালের কুয়াশা ও শিশুদের স্বাস্থ্য সুরক্ষায় সকালের ক্লাস শুরু হবে সকাল ০৯:০০ টা থেকে। সকল অভিভাবককে শিশুদের আরামদায়ক উষ্ণ পোশাক পরিধানের অনুরোধ জানানো হচ্ছে।',
      dateOrTimeBn: 'কার্যকর: ০১ ডিসেম্বর ২০২৬ থেকে',
      imageUrl: fallbackGallery1,
      ctaTextBn: 'যোগাযোগ ও সহায়তা',
      ctaLink: '#teachers',
    },
    {
      id: 'slide-seasonal-vacation',
      type: 'seasonal',
      badgeBn: '🏖️ ছুটির নোটিশ · বিজয় দিবস ও বড়দিন',
      badgeColor: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
      titleBn: 'বিজয় দিবস ও বার্ষিক শীতকালীন অবকাশ ছুটি',
      titleEn: 'Victory Day & Annual Winter Vacation',
      descriptionBn:
        'মহান বিজয় দিবস উপলক্ষে ১৪-১৬ ডিসেম্বর এবং বড়দিন ও শীতকালীন অবকাশ উপলক্ষে ২৪-৩১ ডিসেম্বর বিদ্যালয় বন্ধ থাকবে। ০১ জানুয়ারি ২০২৭ নতুন শিক্ষাবর্ষের বই উৎসব অনুষ্ঠিত হবে।',
      dateOrTimeBn: '১৪-১৬ ডিসেম্বর ও ২৪-৩১ ডিসেম্বর ২০২৬',
      imageUrl: fallbackCover,
      ctaTextBn: 'কৃতি শিক্ষার্থীদের তালিকা দেখুন',
      ctaLink: '#students',
    },
  ];

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay management
  useEffect(() => {
    if (!isPlaying) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPlaying, nextSlide]);

  // Touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50) {
      nextSlide();
    } else if (distance < -50) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const current = slides[currentIndex];

  const handleCtaClick = (link?: string) => {
    if (link && link.startsWith('#')) {
      const targetId = link.substring(1);
      if (onScrollToSection) {
        onScrollToSection(targetId);
      } else {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Convert number to Bengali numeral
  const toBnNumber = (num: number) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num)
      .split('')
      .map((ch) => bnDigits[parseInt(ch, 10)] || ch)
      .join('');
  };

  return (
    <section
      aria-label="স্কুল নোটিশ, গ্যালারি ও ঘোষণা ক্যারোসেল"
      className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Graphic & Atmosphere */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.imageUrl || fallbackCover}
          alt={current.titleBn}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transition-all duration-700 blur-[1px] opacity-40 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/60" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between">
        {/* Top Bar inside Carousel: Category Filter/Indicators + Play/Pause & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${current.badgeColor}`}
            >
              {current.type === 'announcement' && <Bell className="w-3.5 h-3.5" />}
              {current.type === 'gallery' && <ImageIcon className="w-3.5 h-3.5" />}
              {current.type === 'seasonal' && <Calendar className="w-3.5 h-3.5" />}
              <span>{current.badgeBn}</span>
            </span>
            {current.dateOrTimeBn && (
              <span className="hidden sm:inline-flex items-center gap-1 bg-white/10 backdrop-blur-md text-slate-300 text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/10">
                <Clock className="w-3 h-3 text-amber-300" />
                <span>{current.dateOrTimeBn}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Slide counter */}
            <span className="text-xs font-mono font-bold text-slate-300 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15">
              {toBnNumber(currentIndex + 1)} / {toBnNumber(total)}
            </span>

            {/* Play/Pause control */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md flex items-center justify-center text-white transition-colors"
              title={isPlaying ? 'স্বয়ংক্রিয় প্লে থামান' : 'স্বয়ংক্রিয় প্লে চালু করুন'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Center Headline & Body */}
        <div className="my-6 max-w-3xl space-y-3.5 animate-fadeIn">
          {current.titleEn && (
            <p className="text-xs uppercase tracking-widest font-bold text-amber-300/90 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{current.titleEn}</span>
            </p>
          )}

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug drop-shadow-sm">
            {current.titleBn}
          </h2>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal drop-shadow-xs">
            {current.descriptionBn}
          </p>

          {/* Action CTAs */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            {current.ctaTextBn && (
              <button
                type="button"
                onClick={() => handleCtaClick(current.ctaLink)}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2 transform active:scale-95"
              >
                <span>{current.ctaTextBn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleCtaClick('#teachers')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs sm:text-sm rounded-xl transition-all backdrop-blur-md"
            >
              প্রিন্সিপাল ও শিক্ষকদের বার্তা
            </button>
          </div>
        </div>

        {/* Bottom Navigation & Controls */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
          {/* Slide Dots / Indicators */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full ${
                  idx === currentIndex
                    ? 'w-7 sm:w-9 h-2.5 bg-amber-400 shadow-sm shadow-amber-400/50'
                    : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
                }`}
                title={`স্লাইড ${toBnNumber(idx + 1)}: ${s.titleBn}`}
              />
            ))}
          </div>

          {/* Previous / Next Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevSlide}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all active:scale-95 shadow-sm"
              aria-label="পূর্ববর্তী স্লাইড"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all active:scale-95 shadow-sm"
              aria-label="পরবর্তী স্লাইড"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
