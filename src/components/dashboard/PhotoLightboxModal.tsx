import React from 'react';
import { FacebookGalleryItem } from '../../types/school';

interface PhotoLightboxModalProps {
  photo: FacebookGalleryItem | null;
  onClose: () => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  photo,
  onClose,
}) => {
  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 print:hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
      >
        <div className="bg-slate-900 max-h-[65vh] flex items-center justify-center overflow-hidden">
          <img
            src={photo.imageUrl}
            alt={photo.titleBn}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain max-h-[60vh]"
          />
        </div>
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {photo.dateBn}
            </span>
            <h4 className="text-base font-bold text-slate-900">
              {photo.titleBn}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {photo.captionBn}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
