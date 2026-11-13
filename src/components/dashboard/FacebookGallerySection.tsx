import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Cloud,
  Camera,
  Image,
  Upload,
  X,
  Sparkles,
  Calendar,
  ExternalLink,
  Eye,
  Check,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { FacebookGalleryItem } from '../../types/school';
import { SCHOOL_PROFILE } from '../../data/mockData';

interface FacebookGallerySectionProps {
  fbGallery: FacebookGalleryItem[];
  logoUrl: string;
  onOpenMediaManager?: () => void;
  onAddGalleryPhoto?: (item: FacebookGalleryItem) => void;
  onNavigateTab: (tab: string) => void;
  onSelectPhoto: (photo: FacebookGalleryItem) => void;
}

type GalleryCategoryFilter = 'all' | 'classroom' | 'craft' | 'outdoor' | 'event' | 'branding';

const PRESET_SAMPLE_PHOTOS = [
  {
    url: '/assets/biddalay/gallery_annual_day.jpg',
    label: 'বার্ষিক ক্রীড়া ও উৎসব',
    category: 'event' as const,
    categoryBn: 'বার্ষিক অনুষ্ঠান ও উৎসব',
  },
  {
    url: '/assets/biddalay/gallery_classroom.jpg',
    label: 'শ্রেণিকক্ষ ও পাঠদান',
    category: 'classroom' as const,
    categoryBn: 'ক্লাসরুম ও পাঠদান',
  },
  {
    url: '/assets/fb/cover.jpg',
    label: 'ক্যাম্পাস প্রাঙ্গণ',
    category: 'outdoor' as const,
    categoryBn: 'ক্যাম্পাস ও খেলাধুলা',
  },
  {
    url: '/assets/fb/photo-2.jpg',
    label: 'পেপার ক্রাফট ও আর্ট',
    category: 'craft' as const,
    categoryBn: 'আর্ট ও ক্রাফট ওয়ার্ক',
  },
  {
    url: '/assets/fb/photo-3.jpg',
    label: 'ওয়েলকাম বেবি কার্ড',
    category: 'craft' as const,
    categoryBn: 'হাতেখড়ি ও ক্রাফট',
  },
  {
    url: '/assets/fb/photo-4.jpg',
    label: 'সংখ্যার খেলা ও অনুশীলন',
    category: 'classroom' as const,
    categoryBn: 'ক্লাসরুম ও বুদ্ধিমত্তা',
  },
];

export const FacebookGallerySection: React.FC<FacebookGallerySectionProps> = ({
  fbGallery,
  logoUrl,
  onOpenMediaManager,
  onAddGalleryPhoto,
  onNavigateTab,
  onSelectPhoto,
}) => {
  // Modal & Toast States
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<GalleryCategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form States for adding new photo
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newCategory, setNewCategory] = useState<'classroom' | 'craft' | 'outdoor' | 'event' | 'branding'>('classroom');
  const [newImageUrl, setNewImageUrl] = useState('/assets/biddalay/gallery_annual_day.jpg');
  const [newDateBn, setNewDateBn] = useState('আজ, ১৪ নভেম্বর ২০২৬');
  const [newFbUrl, setNewFbUrl] = useState(SCHOOL_PROFILE.facebookUrl || 'https://facebook.com/AnandaPathshalaKushtia');
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 3500);
  };

  // Handle local file upload
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setFormError('ছবির সাইজ ৮ মেগাবাইটের কম হতে হবে।');
      return;
    }

    setFormError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Open add photo modal
  const handleOpenAddModal = () => {
    setNewTitle('');
    setNewCaption('');
    setNewCategory('classroom');
    setNewImageUrl('/assets/biddalay/gallery_annual_day.jpg');
    setNewDateBn('আজ, ১৪ নভেম্বর ২০২৬');
    setFormError(null);
    setIsAddPhotoModalOpen(true);
  };

  // Submit new photo
  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('অনুগ্রহ করে ছবির একটি শিরোনাম লিখুন।');
      return;
    }
    if (!newImageUrl.trim()) {
      setFormError('অনুগ্রহ করে কম্পিউটার/ফোন থেকে একটি ছবি সিলেক্ট করুন বা URL দিন।');
      return;
    }

    const categoryBnMap: Record<string, string> = {
      classroom: 'ক্লাসরুম ও পাঠদান',
      craft: 'আর্ট ও ক্রাফট ওয়ার্ক',
      outdoor: 'ক্যাম্পাস ও খেলাধুলা',
      event: 'বার্ষিক অনুষ্ঠান ও উৎসব',
      branding: 'বিশেষ সম্মাননা ও ব্র্যান্ডিং',
    };

    const newItem: FacebookGalleryItem = {
      id: `fbg-custom-${Date.now()}`,
      titleBn: newTitle.trim(),
      captionBn:
        newCaption.trim() ||
        'আনন্দ পাঠশালা কুষ্টিয়া ক্যাম্পাসের ক্লাসরুম ও শিক্ষার্থীদের আনন্দঘন মুহূর্ত।',
      imageUrl: newImageUrl.trim(),
      category: newCategory,
      categoryBn: categoryBnMap[newCategory] || 'ক্যাম্পাস গ্যালারি',
      dateBn: newDateBn.trim() || 'আজ, ১৪ নভেম্বর ২০২৬',
      fbUrl: newFbUrl.trim() || SCHOOL_PROFILE.facebookUrl,
    };

    // 1. Call onAddGalleryPhoto if provided
    if (onAddGalleryPhoto) {
      onAddGalleryPhoto(newItem);
    }

    // 2. Persist to localStorage
    try {
      const stored = localStorage.getItem('ananda_custom_gallery_photos');
      const existing: FacebookGalleryItem[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem('ananda_custom_gallery_photos', JSON.stringify([newItem, ...existing]));
    } catch {}

    setIsAddPhotoModalOpen(false);
    showToast(`✅ "${newItem.titleBn}" ছবিটি সফলভাবে ফটোগ্যালারিতে যুক্ত হয়েছে!`);
  };

  // Filter gallery items
  const filteredGallery = fbGallery.filter((item) => {
    if (activeCategoryFilter !== 'all') {
      if (item.category && item.category !== activeCategoryFilter) {
        // Also check categoryBn as fallback
        const catBn = item.categoryBn || '';
        if (activeCategoryFilter === 'classroom' && !catBn.includes('ক্লাসরুম')) return false;
        if (activeCategoryFilter === 'craft' && !catBn.includes('ক্রাফট') && !catBn.includes('আর্ট')) return false;
        if (activeCategoryFilter === 'outdoor' && !catBn.includes('আউটডোর') && !catBn.includes('ক্যাম্পাস')) return false;
        if (activeCategoryFilter === 'event' && !catBn.includes('অনুষ্ঠান') && !catBn.includes('উৎসব')) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (item.titleBn || '').toLowerCase();
      const caption = (item.captionBn || '').toLowerCase();
      const cat = (item.categoryBn || '').toLowerCase();
      return title.includes(q) || caption.includes(q) || cat.includes(q);
    }

    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-emerald-200 p-4 sm:p-6 shadow-2xs space-y-5 print:hidden">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 border border-emerald-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white text-xs cursor-pointer font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Gallery Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3.5">
          <img
            src={logoUrl}
            alt="আনন্দ পাঠশালা লোগো"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shrink-0 bg-white shadow-2xs"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                আনন্দ পাঠশালা কুষ্টিয়া — অফিশিয়াল ফটোগ্যালারি
              </h3>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                লাইভ ফটোগ্যালারি
              </span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                মোট ছবি: {fbGallery.length}টি
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ক্যাম্পাস প্রাঙ্গণ, আধুনিক ক্লাসরুম, পেপার ক্রাফট, ড্রয়িং ও সহশিক্ষা কার্যক্রমের জীবন্ত ছবির সংগ্রহ।
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Main User Requested Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="ফটোগ্যালারিতে নতুন ছবি যোগ করুন"
          >
            <Camera className="w-4 h-4" />
            <span>ফটোগ্যালারিতে ছবি যোগ করুন</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('workspace')}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Google Drive ব্যাকআপ ও ক্লাউড ড্রাইভ"
          >
            <Cloud className="w-4 h-4 text-indigo-600" />
            <span>Google Drive ও ব্যাকআপ</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 overflow-x-auto max-w-full scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeCategoryFilter === 'all'
                ? 'bg-slate-900 text-white font-black shadow-2xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            🌟 সকল ছবি ({fbGallery.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('classroom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeCategoryFilter === 'classroom'
                ? 'bg-emerald-700 text-white font-black shadow-2xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            🏫 ক্লাসরুম
          </button>
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('craft')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeCategoryFilter === 'craft'
                ? 'bg-indigo-700 text-white font-black shadow-2xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            🎨 ক্রাফট ও আর্ট
          </button>
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('outdoor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeCategoryFilter === 'outdoor'
                ? 'bg-amber-600 text-white font-black shadow-2xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            🎈 ক্যাম্পাস ও খেলাধুলা
          </button>
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('event')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeCategoryFilter === 'event'
                ? 'bg-rose-700 text-white font-black shadow-2xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            🏆 বার্ষিক উৎসব
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-60">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ছবির শিরোনাম দিয়ে খুঁজুন..."
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      {filteredGallery.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
          <Camera className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-600">কোনো ছবি পাওয়া যায়নি</p>
          <p className="text-xs text-slate-400">সার্চ ফিল্টার পরিবর্তন করুন অথবা নতুন ছবি যোগ করুন।</p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-2"
          >
            <Camera className="w-4 h-4" />
            <span>ফটোগ্যালারিতে ছবি যোগ করুন</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectPhoto(item)}
              className="group cursor-pointer rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col relative"
            >
              <div className="relative h-48 overflow-hidden bg-slate-200">
                <img
                  src={item.imageUrl}
                  alt={item.titleBn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-black/65 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  {item.dateBn}
                </span>

                {item.categoryBn && (
                  <span className="absolute top-2.5 right-2.5 bg-emerald-700/80 backdrop-blur-xs text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full">
                    {item.categoryBn}
                  </span>
                )}

                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1 rounded-xl bg-white/90 text-slate-900 text-xs font-bold flex items-center gap-1 shadow-md">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>বড় করে দেখুন</span>
                  </span>
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-1.5 bg-white">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 leading-snug">
                  {item.titleBn}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {item.captionBn}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          ADD PHOTO TO GALLERY MODAL (ফটোগ্যালারিতে ছবি যোগ করার মোডাল)
      ======================================================== */}
      {isAddPhotoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsAddPhotoModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-4 space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <Camera className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    ফটোগ্যালারিতে ছবি যোগ করুন
                  </h3>
                  <p className="text-xs text-slate-500">
                    আনন্দ পাঠশালা ক্যাম্পাসের নতুন ছবি আপলোড ও শিরোনাম যুক্ত করুন।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPhotoModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
              {/* Photo Source / Upload Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  ১. ছবি নির্বাচন বা আপলোড করুন *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  {/* File Upload Box */}
                  <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition">
                    <Upload className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">
                        ডিভাইস থেকে ছবি বেছে নিন
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        JPG, PNG বা WEBP (সর্বোচ্চ ৮ MB)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="hidden"
                    />
                  </label>

                  {/* Image Preview Box */}
                  <div className="relative h-32 rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                    {newImageUrl ? (
                      <img
                        src={newImageUrl}
                        alt="প্রিভিউ"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400 font-bold">ছবির প্রিভিউ</span>
                    )}
                    <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-md font-semibold">
                      লাইভ প্রিভিউ
                    </span>
                  </div>
                </div>

                {/* Or Paste URL */}
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    অথবা ছবির অনলাইন লিংক / URL পেস্ট করুন:
                  </label>
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://... অথবা /assets/..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Preset sample choices */}
                <div className="pt-1">
                  <span className="text-[10.5px] font-bold text-slate-500 block mb-1">
                    দ্রুত নির্বাচন করার প্রিসেট ছবি:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {PRESET_SAMPLE_PHOTOS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewImageUrl(preset.url);
                          setNewCategory(preset.category);
                          if (!newTitle) setNewTitle(preset.label);
                        }}
                        className={`p-1 rounded-xl border text-[10px] font-bold shrink-0 flex items-center gap-1.5 transition cursor-pointer ${
                          newImageUrl === preset.url
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-6 h-6 rounded-lg object-cover"
                        />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ২. ছবির শিরোনাম (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="উদাঃ বার্ষিক পুরস্কার বিতরণী উৎসব ২০২৬"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ৩. অ্যালবাম / ক্যাটাগরি
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white font-semibold cursor-pointer"
                  >
                    <option value="classroom">🏫 ক্লাসরুম ও পাঠদান</option>
                    <option value="craft">🎨 আর্ট ও ক্রাফট ওয়ার্ক</option>
                    <option value="outdoor">🎈 ক্যাম্পাস ও আউটডোর খেলাধুলা</option>
                    <option value="event">🏆 বার্ষিক অনুষ্ঠান ও উৎসব</option>
                    <option value="branding">🌟 বিশেষ অর্জন ও ব্রান্ডিং</option>
                  </select>
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ৪. ছবির বিবরণ / ক্যাপশন
                </label>
                <textarea
                  rows={2}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="উদাঃ আনন্দ পাঠশালা কুষ্টিয়া প্রাঙ্গণে শিক্ষক ও ছোট্ট সোনামণিদের আনন্দঘন মুহূর্ত..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 leading-relaxed"
                />
              </div>

              {/* Date & FB Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ৫. তারিখ
                  </label>
                  <input
                    type="text"
                    value={newDateBn}
                    onChange={(e) => setNewDateBn(e.target.value)}
                    placeholder="উদাঃ আজ, ১৪ নভেম্বর ২০২৬"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ফেসবুক পেজ / পোস্ট লিংক
                  </label>
                  <input
                    type="url"
                    value={newFbUrl}
                    onChange={(e) => setNewFbUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>ফটোগ্যালারিতে সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
