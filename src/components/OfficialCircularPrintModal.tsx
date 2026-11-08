import React, { useRef } from 'react';
import { SchoolNotice, SchoolProfile } from '../types/school';
import { toBengaliNumber } from '../utils/schoolLogic';
import { SCHOOL_PROFILE } from '../data/mockData';
import { Printer, Download, X, FileText, CheckCircle2 } from 'lucide-react';

interface OfficialCircularPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: SchoolNotice | null;
  schoolProfile?: SchoolProfile;
}

export const OfficialCircularPrintModal: React.FC<OfficialCircularPrintModalProps> = ({
  isOpen,
  onClose,
  notice,
  schoolProfile = SCHOOL_PROFILE,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !notice) return null;

  const handlePrint = () => {
    window.print();
  };

  const memoNo = `আ.পা/কুষ্টিয়া/বিজ্ঞপ্তি-২০২৬/${toBengaliNumber((notice.id ? parseInt(notice.id.replace(/\D/g, ''), 10) || 45 : 45) % 100 + 10)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4 print:my-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm sm:text-base">
              অফিসিয়াল প্রাতিষ্ঠানিক সার্কুলার / নোটিশ
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-xl text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Letterhead Circular Sheet */}
        <div
          ref={printRef}
          className="p-8 sm:p-12 bg-white print:p-10 text-slate-900 font-sans space-y-6 relative"
        >
          {/* Letterhead Top Banner */}
          <div className="border-b-4 border-double border-emerald-700 pb-5 text-center relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img
                src={schoolProfile.logoUrl || '/assets/biddalay/logo.png'}
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tracking-tight">
                  {schoolProfile.nameBn || 'আনন্দ পাঠশালা'}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-emerald-700">
                  {schoolProfile.nameEn || 'Ananda Pathshala Kindergarten & Junior Academy'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {schoolProfile.addressBn || 'মজমপুর, কুষ্টিয়া সদর, কুষ্টিয়া'} · হেল্পলাইন: {schoolProfile.phone || '০১৯১৪-০৫৭৫১১'}
                </p>
              </div>
            </div>
            <div className="inline-block mt-1 px-3 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
              “জ্ঞানে কর্মে আনন্দে বিকশিত শৈশব”
            </div>
          </div>

          {/* Memo & Date Meta */}
          <div className="flex items-center justify-between text-xs sm:text-sm border-b border-slate-200 pb-3">
            <div>
              <span className="text-slate-500">স্মারক নং: </span>
              <strong className="text-slate-800 font-mono">{memoNo}</strong>
            </div>
            <div>
              <span className="text-slate-500">তারিখ: </span>
              <strong className="text-slate-800">{notice.publishDateBn || 'নভেম্বর ২০২৬'}</strong>
            </div>
          </div>

          {/* Notice Subject Banner */}
          <div className="text-center py-2 bg-emerald-50 rounded-2xl border border-emerald-200 px-4">
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
              অফিসিয়াল বিজ্ঞপ্তি / সার্কুলার
            </span>
            <h2 className="text-base sm:text-lg font-black text-emerald-950 mt-0.5">
              বিষয়: {notice.titleBn}
            </h2>
          </div>

          {/* Notice Body */}
          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed space-y-3 pt-2 text-justify">
            <p className="font-semibold text-slate-900">
              সংশ্লিষ্ট সকল অভিভাবক, শিক্ষক, শিক্ষার্থী ও কর্মচারীদের অবগতির জন্য জানানো যাচ্ছে যে,
            </p>
            <p className="text-slate-700 whitespace-pre-line leading-loose text-base">
              {notice.contentBn}
            </p>
            <p className="pt-2 text-slate-700">
              উক্ত বিষয়ে সকলের আন্তরিক সহযোগিতা ও সার্বিক নিয়মশৃঙ্খলা বজায় রাখার জন্য বিনীতভাবে অনুরোধ করা যাচ্ছে।
            </p>
          </div>

          {/* Official Signatures and Seal */}
          <div className="pt-12 flex items-end justify-between text-center text-xs">
            <div>
              <div className="px-3 py-1 border-2 border-dashed border-emerald-600 rounded-full text-[9px] text-emerald-700 font-bold uppercase tracking-wider mb-2">
                ★ অফিসিয়াল সিলমোহর ★
              </div>
              <span className="text-[10px] text-slate-400">আনন্দ পাঠশালা, কুষ্টিয়া</span>
            </div>

            <div className="space-y-1">
              <div className="font-cursive text-emerald-800 text-lg italic font-bold">
                Shafee Abdullah
              </div>
              <div className="w-36 border-t-2 border-slate-800 pt-1 font-bold text-slate-900">
                অধ্যক্ষ ও পরিচালক
              </div>
              <span className="text-[10px] text-slate-500 block">আনন্দ পাঠশালা</span>
            </div>
          </div>

          {/* Micro Footer */}
          <div className="text-center text-[9px] text-slate-400 pt-6 border-t border-dashed border-slate-200">
            আনন্দ পাঠশালা ডিজিটাল ম্যানেজমেন্ট সিস্টেম · স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত সার্কুলার
          </div>
        </div>
      </div>
    </div>
  );
};
