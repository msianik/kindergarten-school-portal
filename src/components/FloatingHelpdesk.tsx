import React, { useState } from 'react';
import { Phone, MessageCircle, X, MapPin, Clock, Sparkles, Send } from 'lucide-react';

interface FloatingHelpdeskProps {
  phone1?: string;
  phone2?: string;
  addressBn?: string;
}

export const FloatingHelpdesk: React.FC<FloatingHelpdeskProps> = ({
  phone1 = '০১৯১৪-০৫৭৫১১',
  phone2 = '০১৭৩৬-২০৭৭৬০',
  addressBn = 'গোশালা মোড়, কোর্টপাড়া, কুষ্টিয়া সদর',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const cleanPhone = (phone: string) => {
    // English digits mapping
    const bnToEn: Record<string, string> = {
      '০': '0',
      '১': '1',
      '২': '2',
      '৩': '3',
      '৪': '4',
      '৫': '5',
      '৬': '6',
      '৭': '7',
      '৮': '8',
      '৯': '9',
    };
    return phone.replace(/[০-৯]/g, (d) => bnToEn[d] || d).replace(/[^0-9]/g, '');
  };

  const rawPhone1 = cleanPhone(phone1);
  const waUrl = `https://wa.me/88${rawPhone1}?text=${encodeURIComponent(
    'আসসালামু আলাইকুম, আনন্দ পাঠশালা কুষ্টিয়ায় ২০২৭ শিক্ষাবর্ষের ভর্তি সম্পর্কে বিস্তারিত জানতে চাচ্ছি।'
  )}`;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-4 sm:left-6 z-40">
      {/* Helpdesk Popup Card */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border-2 border-emerald-500/30 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 relative">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              aria-label="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Phone className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">ভর্তি হেল্পডেস্ক</h4>
                <p className="text-[11px] text-emerald-200">আনন্দ পাঠশালা কুষ্টিয়া</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 text-xs">
            <p className="text-slate-600 font-medium">
              ২০২৭ শিক্ষাবর্ষের ভর্তি বা স্কুল সংক্রান্ত যেকোনো তথ্যের জন্য সরাসরি যোগাযোগ করুন:
            </p>

            {/* Direct Call Button */}
            <a
              href={`tel:+88${rawPhone1}`}
              className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>সরাসরি কল করুন</span>
              </div>
              <span className="font-mono text-emerald-700">{phone1}</span>
            </a>

            {/* WhatsApp Chat Button */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-teal-600" />
                <span>হোয়াটসঅ্যাপ মেসেজ</span>
              </div>
              <span className="text-[11px] text-teal-700 font-semibold">চ্যাট শুরু করুন</span>
            </a>

            {/* Campus Info */}
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{addressBn}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>অফিস সময়: সকাল ৮:০০ — দুপুর ১:৩০</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-xl shadow-emerald-900/20 border-2 border-white/70 active:scale-95 transition-all duration-200 cursor-pointer group"
        title="ভর্তি হেল্পলাইন ও সহায়তা"
        aria-label="ভর্তি হেল্পলাইন ও সহায়তা"
      >
        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <Phone className="w-3.5 h-3.5 text-white animate-bounce" />
        </div>
        <span className="hidden sm:inline">ভর্তি হেল্পলাইন</span>
        <span className="sm:hidden">হেল্পলাইন</span>
      </button>
    </div>
  );
};
