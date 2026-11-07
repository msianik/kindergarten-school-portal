import React from 'react';
import { Printer, Download } from 'lucide-react';
import { AcademicCalendarEvent } from '../../types/school';
import { PrintableAcademicCalendarDocument } from './PrintableAcademicCalendarDocument';

interface AcademicCalendarPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  academicEvents: AcademicCalendarEvent[];
  filteredAcademicEvents: AcademicCalendarEvent[];
  printScope: 'all' | 'filtered';
  setPrintScope: (scope: 'all' | 'filtered') => void;
  onDownloadPdf: (scope: 'all' | 'filtered') => void;
  onPrint: (scope: 'all' | 'filtered') => void;
  logoUrl?: string;
  holidayCount: number;
  examCount: number;
  meetingCount: number;
  currentDateBn: string;
}

export const AcademicCalendarPrintModal: React.FC<AcademicCalendarPrintModalProps> = ({
  isOpen,
  onClose,
  academicEvents,
  filteredAcademicEvents,
  printScope,
  setPrintScope,
  onDownloadPdf,
  onPrint,
  logoUrl,
  holidayCount,
  examCount,
  meetingCount,
  currentDateBn,
}) => {
  if (!isOpen) return null;

  const eventsToRender =
    printScope === 'filtered' ? filteredAcademicEvents : academicEvents;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-100 rounded-3xl max-w-4xl w-full p-4 sm:p-6 space-y-4 shadow-2xl border border-slate-300 my-6 max-h-[95vh] flex flex-col"
      >
        {/* Modal Top Control Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>একাডেমিক ক্যালেন্ডার — প্রিন্ট ও PDF প্রিভিউ</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  A4 Portrait
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                অফিশিয়াল লেটারহেড, সিল মহর ও স্বাক্ষরযুক্ত প্রিন্টযোগ্য সামারি পৃষ্ঠা
              </p>
            </div>
          </div>

          {/* Action Controls & Scope Toggle */}
          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
            {/* Scope Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPrintScope('all')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  printScope === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সকল ({academicEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setPrintScope('filtered')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  printScope === 'filtered'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ফিল্টারকৃত ({filteredAcademicEvents.length})
              </button>
            </div>

            {/* Download as PDF Button */}
            <button
              type="button"
              onClick={() => onDownloadPdf(printScope)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer group"
              title="ব্রাউজার প্রিন্ট ডায়ালগে Save as PDF হিসেবে ফাইলটি ডাউনলোড করুন"
            >
              <Download className="w-4 h-4 text-emerald-200 group-hover:translate-y-0.5 transition-transform" />
              <span>Download as PDF</span>
            </button>

            {/* Direct Print Button */}
            <button
              type="button"
              onClick={() => onPrint(printScope)}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              title="সরাসরি প্রিন্টারে পাঠান (Ctrl+P)"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>প্রিন্ট করুন</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              title="বন্ধ করুন"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sheet Frame Scroll Area */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-300 bg-slate-200/80 p-2 sm:p-5 shadow-inner">
          <div className="bg-white rounded-xl shadow-md border border-slate-300 max-w-3xl mx-auto overflow-hidden">
            <PrintableAcademicCalendarDocument
              eventsToRender={eventsToRender}
              logoUrl={logoUrl}
              isPreview={true}
              holidayCount={holidayCount}
              examCount={examCount}
              meetingCount={meetingCount}
              currentDateBn={currentDateBn}
            />
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1 shrink-0">
          <span>
            💡 প্রিন্ট ডায়ালগে Destination হিসেবে <strong>&quot;Save as PDF&quot;</strong> সিলেক্ট করে PDF ডাউনলোড করতে পারেন।
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:underline cursor-pointer"
          >
            প্রিভিউ বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
