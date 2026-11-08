import React, { useRef, useState } from 'react';
import { FeeInvoice, Student, StudentFeeConfig, SchoolProfile } from '../types/school';
import { toBengaliNumber, getSchoolClassNameBn } from '../utils/schoolLogic';
import { convertNumberToBengaliWords } from '../utils/numberToBengaliWords';
import { SCHOOL_PROFILE } from '../data/mockData';
import {
  Printer,
  Download,
  X,
  Receipt,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldCheck,
  Scissors,
  Layers,
  FileText,
} from 'lucide-react';

interface ThreePartMoneyReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: FeeInvoice | null;
  student?: Student;
  feeConfig?: StudentFeeConfig;
  schoolProfile?: SchoolProfile;
}

export const ThreePartMoneyReceiptModal: React.FC<ThreePartMoneyReceiptModalProps> = ({
  isOpen,
  onClose,
  invoice,
  student,
  feeConfig,
  schoolProfile = SCHOOL_PROFILE,
}) => {
  const [printMode, setPrintMode] = useState<'three_part' | 'single'>('three_part');

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentNameBn = student?.nameBn || invoice.studentNameBn;
  const studentRoll = student?.rollNo || invoice.rollNo || '১০১';
  const classNameBn = getSchoolClassNameBn(student?.className || invoice.className);
  const section = student?.section || 'গোলাপ';
  const guardianName = student?.fatherNameBn || student?.motherNameBn || 'অভিভাবক';
  const guardianPhone = student?.emergencyPhone || '০১৭১১-২২৩৩৪৪';
  const amountInWords = convertNumberToBengaliWords(invoice.netAmount);

  // Reusable Single Receipt Voucher Section Component
  const renderVoucherSection = (copyType: 'parent' | 'office' | 'bank', copyLabelBn: string, badgeColor: string) => {
    return (
      <div className="p-4 sm:p-5 bg-white border border-slate-300 rounded-2xl relative space-y-3 text-xs text-slate-800">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-emerald-600 pb-2.5">
          <div className="flex items-center gap-2.5">
            <img
              src={schoolProfile.logoUrl || '/assets/biddalay/logo.png'}
              alt="Logo"
              className="w-9 h-9 object-contain"
            />
            <div>
              <h3 className="font-extrabold text-sm text-emerald-900 leading-tight">
                {schoolProfile.nameBn || 'আনন্দ পাঠশালা'}
              </h3>
              <p className="text-[10px] text-slate-500">
                {schoolProfile.addressBn || 'মজমপুর, কুষ্টিয়া সদর'} · ফোন: {schoolProfile.phone || '০১৯১৪-০৫৭৫১১'}
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
              {copyLabelBn}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-600">
              রসিদ নং: #{invoice.invoiceNo}
            </span>
          </div>
        </div>

        {/* Bio Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[10px]">শিক্ষার্থীর নাম:</span>
            <strong className="text-slate-900 block truncate">{studentNameBn}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">শ্রেণি ও রোল:</span>
            <strong className="text-slate-900 block">{classNameBn} (রোল: {studentRoll})</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">শাখা ও মাস:</span>
            <strong className="text-slate-900 block">{section} · {invoice.monthBn}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">পরিশোধ তারিখ:</span>
            <strong className="text-emerald-700 block">{invoice.paidAt || 'নভেম্বর ২০২৬'}</strong>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-1.5 px-3">বিবরণ (Fees Description)</th>
                <th className="py-1.5 px-3 text-right">টাকা (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-1 px-3 text-slate-700 font-medium">{item.nameBn}</td>
                  <td className="py-1 px-3 text-right font-mono font-bold text-slate-900">
                    ৳ {toBengaliNumber(item.amount)}
                  </td>
                </tr>
              ))}
              {invoice.discountAmount > 0 && (
                <tr className="text-emerald-700 font-bold">
                  <td className="py-1 px-3">বিশেষ ছাড় (Scholarship/Discount)</td>
                  <td className="py-1 px-3 text-right font-mono">
                    - ৳ {toBengaliNumber(invoice.discountAmount)}
                  </td>
                </tr>
              )}
              <tr className="bg-emerald-50/80 font-black text-slate-900 border-t border-emerald-300">
                <td className="py-1.5 px-3">সর্বমোট পরিশোধিত অর্থ (Net Amount):</td>
                <td className="py-1.5 px-3 text-right font-mono text-emerald-900 text-xs sm:text-sm">
                  ৳ {toBengaliNumber(invoice.netAmount.toLocaleString())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Bengali Words Strip */}
        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 flex flex-wrap items-center justify-between gap-1">
          <span>
            <strong>কথায়:</strong> {amountInWords}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            মাধ্যম: {invoice.paymentMethod || 'Cash'} · TrxID: {invoice.transactionId || invoice.invoiceNo}
          </span>
        </div>

        {/* Signatures & Seal */}
        <div className="pt-3 border-t border-slate-200 flex items-end justify-between text-center text-[10px]">
          <div>
            <div className="w-24 border-t border-slate-700 pt-0.5 font-bold text-slate-700">
              অভিভাবকের স্বাক্ষর
            </div>
          </div>
          <div>
            <div className="px-2 py-0.5 border border-dashed border-emerald-600 rounded-full text-[8px] text-emerald-700 font-bold uppercase">
              ★ PAID ★
            </div>
          </div>
          <div>
            <div className="w-24 border-t border-slate-700 pt-0.5 font-bold text-slate-800">
              আদায়কারী / ক্যাশিয়ার
            </div>
          </div>
          <div>
            <div className="w-28 border-t border-slate-700 pt-0.5 font-bold text-slate-800">
              অধ্যক্ষ / পরিচালনা পর্ষদ
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4 print:my-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-800 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Receipt className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                অফিসিয়াল মানি রিসিট ও ক্যাশ ভাউচার
                <span className="text-xs bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded-full">
                  ৩-পার্ট প্রিন্ট রেডি
                </span>
              </h3>
              <p className="text-xs text-emerald-100">
                {studentNameBn} · রোল: {studentRoll} · {classNameBn} · রসিদ #{invoice.invoiceNo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Print Mode Selector */}
            <div className="inline-flex rounded-xl bg-white/10 p-1 border border-white/20 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPrintMode('three_part')}
                className={`px-3 py-1 rounded-lg transition ${
                  printMode === 'three_part'
                    ? 'bg-white text-slate-950 font-bold shadow-xs'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                ৩-পার্ট ভাউচার
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('single')}
                className={`px-3 py-1 rounded-lg transition ${
                  printMode === 'single'
                    ? 'bg-white text-slate-950 font-bold shadow-xs'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                একক কপি
              </button>
            </div>

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
              className="p-2 hover:bg-white/20 rounded-xl text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheets Area */}
        <div className="p-4 sm:p-8 bg-white print:p-4 space-y-4 font-sans">
          {printMode === 'three_part' ? (
            <div className="space-y-4">
              {/* Part 1: Parent Copy */}
              {renderVoucherSection('parent', '১ম কপি: অভিভাবক কপি (Parent Copy)', 'bg-emerald-100 text-emerald-900 border border-emerald-300')}

              {/* Perforation Cut Line */}
              <div className="flex items-center gap-2 text-slate-400 text-[10px] justify-center print:my-2">
                <Scissors className="w-3.5 h-3.5" />
                <span className="tracking-widest">------------------ ✂ কাটার স্থান (Cut Along Line) ------------------</span>
              </div>

              {/* Part 2: Office Copy */}
              {renderVoucherSection('office', '২য় কপি: অফিস রেকর্ড কপি (Office Copy)', 'bg-amber-100 text-amber-900 border border-amber-300')}

              {/* Perforation Cut Line */}
              <div className="flex items-center gap-2 text-slate-400 text-[10px] justify-center print:my-2">
                <Scissors className="w-3.5 h-3.5" />
                <span className="tracking-widest">------------------ ✂ কাটার স্থান (Cut Along Line) ------------------</span>
              </div>

              {/* Part 3: Bank / Audit Copy */}
              {renderVoucherSection('bank', '৩য় কপি: ব্যাংক / নিরীক্ষা কপি (Bank/Audit Copy)', 'bg-indigo-100 text-indigo-900 border border-indigo-300')}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {renderVoucherSection('parent', 'অফিসিয়াল মানি রিসিট (Official Money Receipt)', 'bg-emerald-100 text-emerald-900 border border-emerald-300')}
            </div>
          )}

          {/* Micro Footer */}
          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed border-slate-200 print:text-[8px]">
            আনন্দ পাঠশালা ম্যানেজমেন্ট সিস্টেম · স্বয়ংক্রিয়ভাবে জেনারেটকৃত ৩-পার্ট মানি রিসিট ও ক্যাশ ভাউচার · প্রিন্ট তারিখ: {new Date().toLocaleDateString('bn-BD')}
          </div>
        </div>
      </div>
    </div>
  );
};
