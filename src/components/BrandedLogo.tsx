import React from 'react';

interface BrandedLogoProps {
  onNavigateHome?: () => void;
}

export const BrandedLogo: React.FC<BrandedLogoProps> = ({ onNavigateHome }) => {
  return (
    <a
      href="#home"
      onClick={(e) => {
        e.preventDefault();
        onNavigateHome?.();
      }}
      className="group flex items-center gap-3 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl transition-all"
      aria-label="আনন্দ পাঠশালা হোমপেজ"
    >
      {/* Branded Preschool Crest Logo */}
      <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-xs group-hover:shadow-md transition-shadow">
        <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 transform group-hover:scale-105 transition-transform"
          >
            {/* Sun Rays / Joyful Learning Corona */}
            <circle cx="24" cy="18" r="7" fill="#FBBF24" />
            <path d="M24 6V9" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 9L17 11.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            <path d="M33 9L31 11.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            
            {/* Open Book Wings */}
            <path
              d="M10 36C14 34 20 33.5 24 37C28 33.5 34 34 38 36V23C34 21 28 20.5 24 24C20 20.5 14 21 10 23V36Z"
              fill="#F43F5E"
            />
            <path
              d="M24 24V37"
              stroke="#BE123C"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M14 27C17 26 21 26 23 28.5"
              stroke="#FFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M34 27C31 26 27 26 25 28.5"
              stroke="#FFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Playful Floating Educational Elements (Montessori Sparks) */}
            <circle cx="9" cy="16" r="2.5" fill="#3B82F6" />
            <circle cx="39" cy="16" r="2.5" fill="#10B981" />
            <path d="M24 13L25 15.5L27.5 16L25 16.5L24 19L23 16.5L20.5 16L23 15.5L24 13Z" fill="#F59E0B" />
          </svg>
        </div>
      </div>

      {/* Brand Typography & Tagline */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors whitespace-nowrap">
            আনন্দ পাঠশালা
          </span>
          <span className="hidden sm:inline-block bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
            কেজি ও প্লে
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-amber-800 font-semibold tracking-wider uppercase -mt-0.5">
          <span>Joyful Kindergarten</span>
          <span className="text-amber-400">·</span>
          <span className="text-slate-500 font-medium lowercase first-letter:uppercase">স্মার্ট ক্যাম্পাস</span>
        </div>
      </div>
    </a>
  );
};
