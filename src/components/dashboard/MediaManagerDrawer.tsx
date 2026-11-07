import React, { useState } from 'react';
import { Camera, Plus } from 'lucide-react';
import { FacebookGalleryItem } from '../../types/school';
import { SCHOOL_PROFILE } from '../../data/mockData';

interface MediaManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logoUrl: string;
  onUpdateLogo: (newUrl: string) => void;
  onAddGalleryPhoto: (item: FacebookGalleryItem) => void;
}

export const MediaManagerDrawer: React.FC<MediaManagerDrawerProps> = ({
  isOpen,
  onClose,
  logoUrl,
  onUpdateLogo,
  onAddGalleryPhoto,
}) => {
  const [customLogoInput, setCustomLogoInput] = useState(logoUrl);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<
    'classroom' | 'craft' | 'outdoor' | 'event' | 'branding'
  >('classroom');
  const [newPhotoUrl, setNewPhotoUrl] = useState('/assets/fb/photo-4.jpg');

  if (!isOpen) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'logo' | 'gallery'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'logo') {
          setCustomLogoInput(reader.result);
          onUpdateLogo(reader.result);
        } else {
          setNewPhotoUrl(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle.trim() || !newPhotoUrl.trim()) return;
    const newItem: FacebookGalleryItem = {
      id: `fb-custom-${Date.now()}`,
      titleBn: newPhotoTitle.trim(),
      captionBn:
        newPhotoCaption.trim() ||
        'আনন্দ পাঠশালা কুষ্টিয়ার ক্লাসরুম ও ক্যাম্পাসের আনন্দময় মুহূর্ত।',
      imageUrl: newPhotoUrl.trim(),
      category: newPhotoCategory,
      dateBn: 'আজ, ৩১ অক্টোবর ২০২৬',
      fbUrl: SCHOOL_PROFILE.facebookUrl,
    };
    onAddGalleryPhoto(newItem);
    setNewPhotoTitle('');
    setNewPhotoCaption('');
    onClose();
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-md space-y-5 print:hidden">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            স্কুল লোগো এবং ফেসবুক গ্যালারি ছবি ম্যানেজার
          </h3>
          <p className="text-xs text-slate-500">
            আপনার কম্পিউটার/ফোন থেকে নতুন লোগো ও ক্লাসরুমের ছবি আপলোড করুন অথবা ফেসবুক পেজের ছবি সিলেক্ট করুন
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
        >
          বন্ধ করুন
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Update School Logo */}
        <div className="lg:col-span-5 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-3">
          <h4 className="text-xs font-bold text-emerald-950">
            ১. পোর্টালের অফিশিয়াল লোগো পরিবর্তন করুন
          </h4>
          <div className="flex items-center gap-4">
            <img
              src={logoUrl}
              alt="বর্তমান লোগো"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 bg-white shrink-0"
            />
            <div className="space-y-2 flex-1">
              <label className="block text-[11px] font-semibold text-slate-700">
                ডিভাইস থেকে লোগো ফাইল নিন:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'logo')}
                className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customLogoInput}
              onChange={(e) => setCustomLogoInput(e.target.value)}
              placeholder="লোগো ইমেজ URL..."
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg"
            />
            <button
              type="button"
              onClick={() => onUpdateLogo(customLogoInput)}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
            >
              লোগো সেভ
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomLogoInput('/assets/fb/logo.jpg');
                onUpdateLogo('/assets/fb/logo.jpg');
              }}
              className="px-2.5 py-1.5 text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              ডিফল্ট FB লোগো
            </button>
          </div>
        </div>

        {/* Right: Add New Classroom Photo to Gallery */}
        <form
          onSubmit={handleAddPhotoSubmit}
          className="lg:col-span-7 bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-3"
        >
          <h4 className="text-xs font-bold text-amber-950">
            ২. ফটো গ্যালারিতে নতুন ছবি যোগ করুন
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                ছবির শিরোনাম (বাংলায়):
              </label>
              <input
                type="text"
                required
                value={newPhotoTitle}
                onChange={(e) => setNewPhotoTitle(e.target.value)}
                placeholder="যেমন: প্লে-গ্রুপের সংখ্যা চেনা ও ক্রাফট ক্লাস"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                ক্যাটাগরি:
              </label>
              <select
                value={newPhotoCategory}
                onChange={(e) => setNewPhotoCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              >
                <option value="classroom">ক্লাসরুম অ্যাক্টিভিটি (Classroom)</option>
                <option value="craft">আর্ট ও ক্রাফট (Art & Craft)</option>
                <option value="outdoor">আউটডোর ও খেলার মাঠ (Outdoor)</option>
                <option value="event">স্কুল উৎসব (Event)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                ছবি আপলোড করুন অথবা নিচের প্রিসেট নিন:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'gallery')}
                className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                সংক্ষিপ্ত ক্যাপশন:
              </label>
              <input
                type="text"
                value={newPhotoCaption}
                onChange={(e) => setNewPhotoCaption(e.target.value)}
                placeholder="ছবির বিবরণ..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>গ্যালারিতে ছবি যুক্ত করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
