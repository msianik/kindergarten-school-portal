import React, { useState, useEffect, useMemo } from 'react';
import { FacebookGalleryItem } from '../types/school';
import {
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Download,
  Search,
  Sparkles,
  Eye,
  Trash2,
} from 'lucide-react';

export interface PhotoGalleryProps {
  photos?: FacebookGalleryItem[];
  onAddPhotos?: (newPhotos: FacebookGalleryItem[]) => void;
  onDeletePhoto?: (photoId: string) => void;
  isLoggedIn?: boolean;
  currentUserRole?: string;
  currentUserName?: string;
}

export type GalleryCategoryKey = 'all' | 'classroom' | 'craft' | 'outdoor' | 'event' | 'branding';

interface CategoryMeta {
  key: GalleryCategoryKey;
  labelBn: string;
  badgeClass: string;
}

const CATEGORIES: CategoryMeta[] = [
  { key: 'all', labelBn: 'সকল ছবি (All)', badgeClass: 'bg-slate-100 text-slate-800 border-slate-300' },
  { key: 'classroom', labelBn: 'শ্রেণিকক্ষ ও শিক্ষা', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { key: 'event', labelBn: 'বার্ষিক ক্রীড়া ও উৎসব', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  { key: 'craft', labelBn: 'আর্ট, ক্রাফট ও ড্রয়িং', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300' },
  { key: 'outdoor', labelBn: 'খেলাধুলা ও আউটডোর', badgeClass: 'bg-teal-50 text-teal-800 border-teal-300' },
  { key: 'branding', labelBn: 'ক্যাম্পাস ও অন্যান্য', badgeClass: 'bg-rose-50 text-rose-800 border-rose-300' },
];

// Convert English numerals to Bengali
function toBengaliDigits(n: number | string): string {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bn[parseInt(d, 10)]);
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos = [],
  onDeletePhoto,
  isLoggedIn = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter photos by category and search term
  const filteredPhotos = useMemo(() => {
    return photos.filter((item) => {
      // Category match
      if (selectedCategory !== 'all') {
        const itemCat = item.category || (item.categoryBn?.includes('ক্লাস') ? 'classroom' : 'branding');
        if (itemCat !== selectedCategory) {
          return false;
        }
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.titleBn?.toLowerCase().includes(q);
        const captionMatch = item.captionBn?.toLowerCase().includes(q);
        const categoryMatch = item.categoryBn?.toLowerCase().includes(q);
        return titleMatch || captionMatch || categoryMatch;
      }
      return true;
    });
  }, [photos, selectedCategory, searchQuery]);

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  const activePhoto = lightboxIndex !== null && filteredPhotos[lightboxIndex] ? filteredPhotos[lightboxIndex] : null;

  return (
    <section id="gallery" className="space-y-6 pt-4 scroll-mt-20">
      {/* Gallery Header Card */}
      <div className="bg-white rounded-3xl border border-amber-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
        <div className="border-b border-amber-100/80 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-emerald-100/80 text-emerald-900 px-3 py-0.5 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>ফটোগ্রাফিক অ্যালবাম ও স্মৃতিমালা · আনন্দ পাঠশালা কুষ্টিয়া</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ImageIcon className="w-7 h-7 text-emerald-600" />
              <span>স্কুল ফটো গ্যালারি (Photo Gallery)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              আনন্দ পাঠশালার ছোট্ট সোনামণিদের শ্রেণিকক্ষের সৃজনশীল পাঠদান, আর্ট ও ক্রাফট, ক্রীড়া প্রতিযোগিতা এবং জাতীয় উৎসবের রঙিন মুহূর্তসমূহ।
            </p>
          </div>
        </div>

        {/* Toolbar: Category Filters & Keyword Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.key;
              const count = cat.key === 'all'
                ? photos.length
                : photos.filter((p) => (p.category || (p.categoryBn?.includes('ক্লাস') ? 'classroom' : 'branding')) === cat.key).length;

              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    active
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{cat.labelBn}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {toBengaliDigits(count)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="অ্যালবাম বা ছবি খুঁজুন..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Grid View */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">কোনো ছবি পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            আপনার নির্বাচিত ক্যাটাগরি বা অনুসন্ধানে কোনো ছবি নেই। ক্যাটাগরি পরিবর্তন করুন অথবা অনুসন্ধান ফিল্টার রিসেট করুন।
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-block"
          >
            সকল ছবি দেখুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPhotos.map((photo, index) => {
            const catMeta = CATEGORIES.find((c) => c.key === photo.category) || CATEGORIES[1];

            return (
              <div
                key={photo.id || index}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                {/* Photo Container with Hover Zoom & Overlay */}
                <div
                  onClick={() => setLightboxIndex(index)}
                  className="relative h-56 w-full overflow-hidden bg-slate-100 cursor-pointer"
                  title="বড় আকারে দেখতে ক্লিক করুন"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.titleBn}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <span className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                      <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>পূর্ণাঙ্গ ভিউ</span>
                    </span>
                  </div>

                  {/* Category Pill Tag */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border backdrop-blur-xs shadow-2xs ${catMeta.badgeClass}`}>
                      {catMeta.labelBn.split(' (')[0]}
                    </span>
                  </div>

                  {/* Date Tag */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs shadow-2xs">
                      {photo.dateBn}
                    </span>
                  </div>
                </div>

                {/* Card Caption Info */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3
                      onClick={() => setLightboxIndex(index)}
                      className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {photo.titleBn}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {photo.captionBn}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <button
                      onClick={() => setLightboxIndex(index)}
                      className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>বড় করে দেখুন</span>
                    </button>

                    {/* Delete Option for Staff/Admin */}
                    {isLoggedIn && onDeletePhoto && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('আপনি কি এই ছবিটি গ্যালারি থেকে মুছে ফেলতে চান?')) {
                            onDeletePhoto(photo.id);
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded cursor-pointer"
                        title="ছবি মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX MODAL PREVIEW */}
      {activePhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between text-white animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Lightbox Top Header */}
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono">
                ছবি {toBengaliDigits(lightboxIndex + 1)} / {toBengaliDigits(filteredPhotos.length)}
              </span>
              <span className="hidden sm:inline-block text-xs bg-white/15 px-2.5 py-0.5 rounded-full text-slate-200 font-medium">
                {activePhoto.categoryBn || 'আনন্দ পাঠশালা অ্যালবাম'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={activePhoto.imageUrl}
                download={`ananda_pathshala_photo_${lightboxIndex + 1}.jpg`}
                className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                title="ডাউনলোড করুন"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">ডাউনলোড</span>
              </a>

              <button
                onClick={() => setLightboxIndex(null)}
                className="p-1.5 rounded-xl bg-white/15 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                title="বন্ধ করুন (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Image & Nav Arrows Stage */}
          <div
            className="flex-1 relative flex items-center justify-center p-2 sm:p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1
                )
              }
              aria-label="পূর্ববর্তী ছবি"
              className="absolute left-2 sm:left-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Central High-Res Image */}
            <div className="max-w-5xl max-h-[72vh] flex items-center justify-center">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.titleBn}
                referrerPolicy="no-referrer"
                className="max-h-[72vh] max-w-full w-auto object-contain rounded-2xl shadow-2xl transition-all"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0
                )
              }
              aria-label="পরবর্তী ছবি"
              className="absolute right-2 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Bottom Caption Strip & Thumbnails */}
          <div
            className="p-4 sm:p-5 bg-black/60 backdrop-blur-md border-t border-white/10 shrink-0 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">{activePhoto.titleBn}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  {activePhoto.captionBn}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] text-amber-300 block">{activePhoto.dateBn}</span>
                <span className="text-[10px] text-slate-400 block">আনন্দ পাঠশালা অফিশিয়াল গ্যালারি</span>
              </div>
            </div>

            {/* Quick Thumbnail Strip */}
            <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {filteredPhotos.map((thumb, idx) => (
                <button
                  key={thumb.id || idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    idx === lightboxIndex
                      ? 'border-emerald-400 scale-105 shadow-md'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={thumb.imageUrl}
                    alt={thumb.titleBn}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
