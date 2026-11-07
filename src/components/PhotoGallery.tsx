import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FacebookGalleryItem } from '../types/school';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Sparkles,
  Lock,
  Unlock,
  ExternalLink,
  Layers,
  Calendar,
  Tag,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { SCHOOL_PROFILE } from '../data/mockData';

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

interface StagedUploadFile {
  id: string;
  file: File;
  previewUrl: string;
  compressedDataUrl: string;
  titleBn: string;
  captionBn: string;
  category: 'classroom' | 'craft' | 'outdoor' | 'event' | 'branding';
  sizeFormatted: string;
}

// Convert English numerals to Bengali
function toBengaliDigits(n: number | string): string {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bn[parseInt(d, 10)]);
}

// Format current date in Bengali
function getBengaliToday(): string {
  const bnMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ];
  const now = new Date();
  const day = toBengaliDigits(now.getDate());
  const month = bnMonths[now.getMonth()];
  const year = toBengaliDigits(now.getFullYear());
  return `${day} ${month} ${year}`;
}

// Canvas-based image resizer & compressor to ensure photos fit safely in memory/storage
async function compressImageFile(file: File, maxDim = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Prefer webp with fallback to jpeg
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve(dataUrl);
        } catch {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos = [],
  onAddPhotos,
  onDeletePhoto,
  isLoggedIn = false,
  currentUserRole = 'staff',
  currentUserName = 'শিক্ষক/স্টাফ',
}) => {
  // Gallery display states
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Staff upload modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(isLoggedIn);
  const [staffPasscode, setStaffPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedUploadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);

  // Batch defaults for upload
  const [batchCategory, setBatchCategory] = useState<'classroom' | 'craft' | 'outdoor' | 'event' | 'branding'>('classroom');
  const [batchCaption, setBatchCaption] = useState('আনন্দ পাঠশালা কুষ্টিয়ায় শিক্ষার্থীদের আনন্দমুখর কার্যক্রম।');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoggedIn) {
      setIsStaffAuthenticated(true);
    }
  }, [isLoggedIn]);

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

  // Handle staff passcode unlock
  const handleVerifyStaffPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (staffPasscode === '1234' || staffPasscode === '123456' || staffPasscode.toLowerCase() === 'admin') {
      setIsStaffAuthenticated(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  // Process multiple selected image files
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsProcessing(true);

    const newStaged: StagedUploadFile[] = [];
    const filesArray = Array.from(fileList);

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const compressed = await compressImageFile(file, 1360, 0.85);
        const previewUrl = URL.createObjectURL(file);
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

        // Derive friendly title from filename or index
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        const defaultTitle = cleanName.length > 2 && !cleanName.startsWith('IMG')
          ? cleanName
          : `আনন্দ পাঠশালা অ্যালবাম ছবি ${toBengaliDigits(stagedFiles.length + i + 1)}`;

        newStaged.push({
          id: `staged-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
          file,
          previewUrl,
          compressedDataUrl: compressed,
          titleBn: defaultTitle,
          captionBn: batchCaption,
          category: batchCategory,
          sizeFormatted: `${sizeMb} MB`,
        });
      } catch (err) {
        console.error('Failed to compress image:', err);
      }
    }

    setStagedFiles((prev) => [...prev, ...newStaged]);
    setIsProcessing(false);
  };

  // Remove a staged photo before submitting
  const handleRemoveStagedPhoto = (id: string) => {
    setStagedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Update specific staged photo field
  const handleUpdateStagedPhoto = (id: string, field: 'titleBn' | 'captionBn' | 'category', value: string) => {
    setStagedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Apply batch defaults to all currently staged photos
  const handleApplyBatchDefaults = () => {
    setStagedFiles((prev) =>
      prev.map((item) => ({
        ...item,
        category: batchCategory,
        captionBn: batchCaption,
      }))
    );
  };

  // Finalize multi-image upload
  const handleCommitUpload = () => {
    if (stagedFiles.length === 0) return;

    const dateToday = getBengaliToday();
    const newItems: FacebookGalleryItem[] = stagedFiles.map((staged, idx) => {
      const catMeta = CATEGORIES.find((c) => c.key === staged.category);
      return {
        id: `photo-${Date.now()}-${idx}`,
        titleBn: staged.titleBn.trim() || `আনন্দ পাঠশালা স্মৃতি অ্যালবাম ${toBengaliDigits(idx + 1)}`,
        captionBn: staged.captionBn.trim() || 'আনন্দ পাঠশালা কুষ্টিয়ায় আনন্দময় ক্লাসরুম ও সহশিক্ষামূলক কার্যক্রম।',
        imageUrl: staged.compressedDataUrl,
        category: staged.category,
        categoryBn: catMeta ? catMeta.labelBn.split(' (')[0] : 'শ্রেণিকক্ষ ও পাঠদান',
        dateBn: dateToday,
        fbUrl: SCHOOL_PROFILE.facebookUrl,
      };
    });

    if (onAddPhotos) {
      onAddPhotos(newItems);
    }

    const countBn = toBengaliDigits(newItems.length);
    setUploadSuccessToast(`${countBn}টি নতুন ছবি সফলভাবে গ্যালারিতে যোগ করা হয়েছে!`);
    setTimeout(() => setUploadSuccessToast(null), 4500);

    // Reset upload modal
    setStagedFiles([]);
    setIsUploadModalOpen(false);
  };

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
      {/* Success Feedback Toast */}
      {uploadSuccessToast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{uploadSuccessToast}</span>
          <button
            onClick={() => setUploadSuccessToast(null)}
            className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Gallery Header Card */}
      <div className="bg-white rounded-3xl border border-amber-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-100/80 pb-5">
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

          {/* Action Buttons: Staff Upload & Facebook Page Link */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>স্টাফ ফটো আপলোড (Multi-Upload)</span>
            </button>

            <a
              href={SCHOOL_PROFILE.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <span>ফেসবুক অ্যালবাম ({SCHOOL_PROFILE.followers})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
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
            আপনার নির্বাচিত ক্যাটাগরি বা অনুসন্ধানে কোনো ছবি নেই। ক্যাটাগরি পরিবর্তন করুন অথবা নতুন ছবি আপলোড করুন।
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
                      className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>বড় করে দেখুন</span>
                    </button>

                    {/* Delete Option for Staff/Admin */}
                    {isStaffAuthenticated && onDeletePhoto && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('আপনি কি এই ছবিটি গ্যালারি থেকে মুছে ফেলতে চান?')) {
                            onDeletePhoto(photo.id);
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded"
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
                className="p-1.5 rounded-xl bg-white/15 hover:bg-rose-600 text-white transition-colors"
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
              className="absolute left-2 sm:left-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-105"
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
              className="absolute right-2 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-105"
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
                  className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
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

      {/* STAFF MULTI-IMAGE UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-amber-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">স্টাফ মাল্টি-ইমেজ ফটো আপলোড</h3>
                  <p className="text-xs text-emerald-100">
                    ওয়েবসাইটে প্রদর্শনের জন্য এক সাথে একাধিক ছবি আপলোড ও অপ্টিমাইজ করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setStagedFiles([]);
                }}
                className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {/* Staff Authentication Gate if not logged in */}
              {!isStaffAuthenticated ? (
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 space-y-4 text-center max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">শিক্ষক ও স্টাফ ভেরিফিকেশন</h4>
                    <p className="text-xs text-slate-600">
                      পাবলিক ওয়েবসাইটে ছবি প্রকাশের ক্ষমতা শুধুমাত্র স্কুলের শিক্ষক ও অনুমোদিত স্টাফদের জন্য সংরক্ষিত।
                    </p>
                  </div>

                  <form onSubmit={handleVerifyStaffPasscode} className="space-y-3">
                    <div>
                      <input
                        type="password"
                        value={staffPasscode}
                        onChange={(e) => setStaffPasscode(e.target.value)}
                        placeholder="স্টাফ পিন কোড দিন (যেমন: 1234)"
                        className="w-full text-center tracking-widest px-4 py-2.5 text-sm rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                      />
                      {passcodeError && (
                        <p className="text-xs text-rose-600 font-semibold mt-1">
                          ভুল পিন কোড! শিক্ষক পিন (1234) ব্যবহার করুন।
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>আনলক করুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStaffPasscode('1234');
                          setIsStaffAuthenticated(true);
                        }}
                        className="px-3 py-2.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl text-xs font-bold"
                      >
                        কুইক ডেমো পিন
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  {/* Uploader Drag & Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFilesSelected(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-emerald-600 bg-emerald-50 scale-[0.99]'
                        : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFilesSelected(e.target.files)}
                    />

                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center mb-3 shadow-2xs">
                      <Upload className="w-7 h-7" />
                    </div>

                    <h4 className="text-base font-bold text-slate-900">
                      এক সাথে একাধিক ছবি নির্বাচন করুন
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      ছবিগুলো ড্র্যাগ করে এখানে এনে ছেড়ে দিন অথবা ক্লিক করে আপনার ডিভাইস থেকে এক বা একাধিক ছবি নির্বাচন করুন।
                    </p>
                    <div className="inline-flex items-center gap-2 mt-3 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      <span>✓ একাধিক ফাইল নির্বাচন সমর্থিত</span>
                      <span>·</span>
                      <span>✓ অটো কম্প্রেসড</span>
                    </div>
                  </div>

                  {isProcessing && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold animate-pulse">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>ছবিগুলো প্রসেসিং ও অপ্টিমাইজ করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
                    </div>
                  )}

                  {/* Batch Global Controls */}
                  {stagedFiles.length > 0 && (
                    <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-amber-700" />
                          <span>নির্বাচিত {toBengaliDigits(stagedFiles.length)}টি ছবির কমন সেটিংস (Batch):</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleApplyBatchDefaults}
                          className="text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg"
                        >
                          সবগুলোতে প্রয়োগ করুন
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            ক্যাটাগরি নির্ধারণ
                          </label>
                          <select
                            value={batchCategory}
                            onChange={(e) =>
                              setBatchCategory(
                                e.target.value as 'classroom' | 'craft' | 'outdoor' | 'event' | 'branding'
                              )
                            }
                            className="w-full text-xs p-2 rounded-xl border border-amber-300 bg-white font-medium"
                          >
                            <option value="classroom">শ্রেণিকক্ষ ও পাঠদান</option>
                            <option value="event">বার্ষিক ক্রীড়া ও উৎসব</option>
                            <option value="craft">আর্ট, ক্রাফট ও ড্রয়িং</option>
                            <option value="outdoor">খেলাধুলা ও আউটডোর</option>
                            <option value="branding">ক্যাম্পাস ও অন্যান্য</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            ডিফল্ট বিবরণ / ক্যাপশন
                          </label>
                          <input
                            type="text"
                            value={batchCaption}
                            onChange={(e) => setBatchCaption(e.target.value)}
                            placeholder="ক্যাপশন..."
                            className="w-full text-xs p-2 rounded-xl border border-amber-300 bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Staged Photo List */}
                  {stagedFiles.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          আপলোড লিস্ট ({toBengaliDigits(stagedFiles.length)}টি ছবি)
                        </h4>
                        <button
                          type="button"
                          onClick={() => setStagedFiles([])}
                          className="text-[11px] text-rose-600 hover:underline font-bold"
                        >
                          সবগুলো মুছুন
                        </button>
                      </div>

                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {stagedFiles.map((item, index) => (
                          <div
                            key={item.id}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                              <img
                                src={item.previewUrl}
                                alt="প্রিভিউ"
                                className="w-14 h-14 rounded-xl object-cover border border-slate-300 bg-white shrink-0"
                              />
                              <div className="min-w-0 flex-1 space-y-1">
                                <input
                                  type="text"
                                  value={item.titleBn}
                                  onChange={(e) =>
                                    handleUpdateStagedPhoto(item.id, 'titleBn', e.target.value)
                                  }
                                  placeholder="ছবির শিরোনাম..."
                                  className="w-full text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200"
                                />
                                <input
                                  type="text"
                                  value={item.captionBn}
                                  onChange={(e) =>
                                    handleUpdateStagedPhoto(item.id, 'captionBn', e.target.value)
                                  }
                                  placeholder="ছবির ক্যাপশন..."
                                  className="w-full text-[11px] text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.sizeFormatted}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveStagedPhoto(item.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                                title="তালিকা থেকে বাদ দিন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500">
                {isStaffAuthenticated && stagedFiles.length > 0
                  ? `মোট ${toBengaliDigits(stagedFiles.length)}টি ছবি নির্বাচিত`
                  : 'প্রথমে ছবি নির্বাচন করুন'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setStagedFiles([]);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  বাতিল
                </button>

                {isStaffAuthenticated && (
                  <button
                    type="button"
                    disabled={stagedFiles.length === 0 || isProcessing}
                    onClick={handleCommitUpload}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {stagedFiles.length > 0
                        ? `একত্রে ${toBengaliDigits(stagedFiles.length)}টি ছবি আপলোড করুন`
                        : 'আপলোড করুন'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
