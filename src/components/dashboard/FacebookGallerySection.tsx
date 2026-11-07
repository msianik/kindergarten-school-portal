import React from 'react';
import { CheckCircle2, Plus, Cloud } from 'lucide-react';
import { FacebookGalleryItem } from '../../types/school';

interface FacebookGallerySectionProps {
  fbGallery: FacebookGalleryItem[];
  logoUrl: string;
  onOpenMediaManager: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectPhoto: (photo: FacebookGalleryItem) => void;
}

export const FacebookGallerySection: React.FC<FacebookGallerySectionProps> = ({
  fbGallery,
  logoUrl,
  onOpenMediaManager,
  onNavigateTab,
  onSelectPhoto,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-2xs space-y-5 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt="আনন্দ পাঠশালা লোগো"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-2xl object-cover border border-emerald-300"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                আনন্দ পাঠশালা কুষ্টিয়া — অফিশিয়াল ফেসবুক ফটো গ্যালারি
              </h3>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Synced
              </span>
            </div>
            <p className="text-xs text-slate-500">
              ফেসবুক পেজ (facebook.com/AnandaPathshalaKushtia) থেকে সংযুক্ত ক্লাসরুম, ক্রাফট ও ক্যাম্পাসের বাস্তব ছবি
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenMediaManager}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ছবি / লোগো যোগ করুন</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('workspace')}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Cloud className="w-4 h-4 text-indigo-600" />
            <span>Google Drive ও Picker</span>
          </button>
        </div>
      </div>

      {/* 6-Photo Grid from Ananda Pathshala Kushtia Facebook Page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fbGallery.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectPhoto(item)}
            className="group cursor-pointer rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col"
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
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-1.5 bg-white">
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                {item.titleBn}
              </h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                {item.captionBn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
