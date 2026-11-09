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
  const [progress, setProgress] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const fallbackGallery1 = fbGalleryImages[0]?.imageUrl || '/assets/fb/fb_photo_1.jpg';
  const fallbackGallery2 = fbGalleryImages[1]?.imageUrl || '/assets/fb/fb_photo_2.jpg';
  const fallbackCover = '/assets/fb/cover.jpg';

  const slides: CarouselSlide[] = [
    {
      id: 'slide-online-admissions',
      type: 'seasonal',
      badgeBn: '🎓 ২০২৭ শিক্ষাবর্ষে ভর্তি চলছে',
      badgeColor: 'bg-emerald-500/30 text-emerald-100 border-emerald-400/40',
      titleBn: '২০২৭ শিক্ষাবর্ষে আপনার সন্তানের আনন্দময় শিক্ষার সূচনা',
      titleEn: 'Admissions Open for Session 2027 · Ananda Pathshala Kushtia',
      descriptionBn:
        'হাতেখড়ি (২.৫+ বছর), প্লে, নার্সারি, কেজি ও প্রাথমিক শ্রেণিতে সীমিত আসনে ভর্তি চলছে। শিশুর ভীতিহীন পাঠদান ও ব্যক্তিত্ব বিকাশে ঘরে বসেই মাত্র ২ মিনিটে আবেদন করুন।',
      dateOrTimeBn: 'ভর্তি কার্যক্রম চলমান · সীমিত আসন',
      imageUrl: fallbackCover,
      ctaTextBn: 'অনলাইনে ভর্তি আবেদন করুন (২০২৭)',
      ctaLink: '#apply',
    },
    {
      id: 'slide-joyful-learning',
      type: 'announcement',
      badgeBn: '🌟 প্রাক-প্রাথমিক শিক্ষা দর্শন',
      badgeColor: 'bg-teal-500/20 text-teal-200 border-teal-400/30',
      titleBn: 'ভয়হীন আনন্দময় পরিবেশ ও আধুনিক মন্টেসরি পদ্ধতি',
      titleEn: 'Joyful Early Childhood Education & Montessori Care',
      descriptionBn:
        'মুখস্থ বিদ্যার চাপ নয়; আনন্দ পাঠশালায় খেলাধুলা, ছড়া, সুর ও আকর্ষণীয় রঙিন উপকরণের মাধ্যমে শিশুর সুপ্ত মেধা ও কৌতূহল প্রস্ফুটিত হয়।',
      dateOrTimeBn: 'হাতেখড়ি থেকে ২য় শ্রেণি পর্যন্ত',
      imageUrl: '/assets/biddalay/gallery_classroom.jpg',
      ctaTextBn: 'আমাদের শ্রেণি ও পাঠক্রম দেখুন',
      ctaLink: '#curriculum',
    },
    {
      id: 'slide-craft-arts',
      type: 'gallery',
      badgeBn: '🎨 সৃজনশীলতা ও মনন বিকাশ',
      badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
      titleBn: 'আর্ট, পেপার ক্রাফট ও সেন্সরি অ্যাক্টিভিটি ল্যাব',
      titleEn: 'Creative Arts, Paper Crafts & Sensory Activities',
      descriptionBn:
        'কাগজের ক্রাফট, ক্লে মডেলিং ও বর্ণিল ক্যানভাসে ছবি আঁকার মাধ্যমে শিশুর সূক্ষ্ম মোটর স্কিল, কল্পনাশক্তি ও সামাজিক বন্ধন সুদৃঢ় হয়।',
      dateOrTimeBn: 'দৈনন্দিন ক্লাসরুম অ্যাক্টিভিটি',
      imageUrl: fallbackGallery2,
      ctaTextBn: 'বিদ্যালয়ের বিশেষত্বসমূহ জানুন',
      ctaLink: '#features',
    },
    {
      id: 'slide-safety-first',
      type: 'announcement',
      badgeBn: '🛡️ শিশু সুরক্ষা ও ক্যাম্পাস নিরাপত্তা',
      badgeColor: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
      titleBn: 'ভেরিফাইড গেট-পাস ও নিশ্ছিদ্র নিরাপত্তা ব্যবস্থা',
      titleEn: 'Verified QR Gate-Pass & Absolute Child Security',
      descriptionBn:
        'অভিভাবক ছবি যাচাই ও ডিজিটাল এসএমএস নোটিফিকেশন ছাড়া কাউকে শিশু হস্তান্তর করা হয় না। সিসিটিভি সার্বক্ষণিক নজরদারি ও দায়িত্বশীল সহকারী স্টাফ।',
      dateOrTimeBn: 'নিরাপদ শিশুবান্ধব ক্যাম্পাস',
      imageUrl: fallbackGallery1,
      ctaTextBn: 'নিরাপত্তা ব্যবস্থা সম্পর্কে জানুন',
      ctaLink: '#features',
    },
    {
      id: 'slide-student-excellence',
      type: 'gallery',
      badgeBn: '🏆 মেধা ও মানবিক গুণাবলী',
      badgeColor: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
      titleBn: 'কৃতি শিক্ষার্থীদের নৈতিক ও সুষম ব্যক্তিত্ব গঠন',
      titleEn: 'Inspiring Excellence & Holistic Growth',
      descriptionBn:
        'বার্ষিক মূল্যায়ন, সাংস্কৃতিক পরিবেশনা ও খেলাধুলার মাধ্যমে প্রতিটি শিশুর আত্মবিশ্বাস বৃদ্ধি ও নৈতিক মূল্যবোধ সম্পন্ন সুনাগরিক হিসেবে গড়ে তোলা।',
      dateOrTimeBn: 'শিক্ষাবর্ষ সাফল্য',
      imageUrl: '/assets/biddalay/gallery_annual_day.jpg',
      ctaTextBn: 'কৃতি শিক্ষার্থীদের তালিকা দেখুন',
      ctaLink: '#students',
    },
  ];

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
    setProgress(0);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setProgress(0);
  }, [total]);

  // Smooth progress bar autoplay ticker
  useEffect(() => {
    setProgress(0);
    if (!isPlaying) return;

    const interval = 50;
    const duration = 5500;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, nextSlide, currentIndex]);

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
      className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-teal-900 border-2 border-indigo-300/30 shadow-2xl"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Autoplay Progress Bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-black/30 z-20 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 transition-all duration-75"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Background Graphic & Atmosphere (Luminous, refined) */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.imageUrl || fallbackCover}
          alt={current.titleBn}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transition-all duration-700 blur-[1px] opacity-40 brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-blue-950/70 to-indigo-900/40" />
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-sky-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between">
        {/* Top Bar inside Carousel: Category Filter/Indicators + Play/Pause & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-2xs ${current.badgeColor}`}
            >
              {current.type === 'announcement' && <Bell className="w-3.5 h-3.5" />}
              {current.type === 'gallery' && <ImageIcon className="w-3.5 h-3.5" />}
              {current.type === 'seasonal' && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              <span>{current.badgeBn}</span>
            </span>
            {current.dateOrTimeBn && (
              <span className="hidden sm:inline-flex items-center gap-1 bg-white/10 backdrop-blur-md text-slate-200 text-[11px] font-medium px-3 py-1 rounded-full border border-white/15">
                <Clock className="w-3 h-3 text-amber-300" />
                <span>{current.dateOrTimeBn}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Live Indicator Pill */}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>লাইভ স্লাইড</span>
            </span>

            {/* Slide counter */}
            <span className="text-xs font-mono font-bold text-slate-200 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15">
              {toBnNumber(currentIndex + 1)} / {toBnNumber(total)}
            </span>

            {/* Play/Pause control */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md flex items-center justify-center text-white transition-colors cursor-pointer"
              title={isPlaying ? 'স্বয়ংক্রিয় প্লে থামান' : 'স্বয়ংক্রিয় প্লে চালু করুন'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Center Headline & Body */}
        <div className="my-6 max-w-3xl space-y-3.5">
          {current.titleEn && (
            <p className="text-xs uppercase tracking-widest font-black text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{current.titleEn}</span>
            </p>
          )}

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-snug drop-shadow-sm">
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
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer transform"
              >
                <span>{current.ctaTextBn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleCtaClick('#teachers')}
              className="px-5 py-3 bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/25 font-bold text-xs sm:text-sm rounded-xl transition-all backdrop-blur-md cursor-pointer"
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
                onClick={() => {
                  setCurrentIndex(idx);
                  setProgress(0);
                }}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 sm:w-10 h-2.5 bg-amber-400 shadow-sm shadow-amber-400/50'
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
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer"
              aria-label="পূর্ববর্তী স্লাইড"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer"
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
