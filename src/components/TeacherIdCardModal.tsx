import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { TeacherMember } from '../types/school';
import {
  Printer,
  QrCode,
  X,
  ShieldCheck,
  Phone,
  Mail,
  Heart,
  User,
  Sparkles,
  Building2,
  Calendar,
  Award,
} from 'lucide-react';

interface TeacherIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherMember | null;
}

export const TeacherIdCardModal: React.FC<TeacherIdCardModalProps> = ({
  isOpen,
  onClose,
  teacher,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (teacher) {
      const qrPayload = JSON.stringify({
        school: 'আনন্দ পাঠশালা, কুষ্টিয়া',
        id: teacher.id,
        name: teacher.nameBn,
        designation: teacher.designationBn,
        phone: teacher.phone || '০১৭১১-xxxxxx',
        validity: '২০২৬-২০২৭ শিক্ষাবর্ষ',
        portal: 'https://anandapathshala.netlify.app',
      });
      QRCode.toDataURL(qrPayload, {
        width: 160,
        margin: 1,
        color: {
          dark: '#065f46',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code error:', err));
    }
  }, [teacher]);

  if (!isOpen || !teacher) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden print:border-none print:shadow-none print:w-full">
        {/* Header (Non-print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-800 text-white print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-lg">শিক্ষক ও স্টাফ ডিজিটাল সার্ভিস কার্ড</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold transition-all shadow-sm"
              title="আইডি কার্ড প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 flex flex-col items-center print:p-4 print:m-0">
          <div className="w-[330px] rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-xl bg-gradient-to-b from-emerald-50 via-white to-amber-50/40 relative">
            {/* Top School Branding Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white text-center py-3.5 px-4 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-sm" />
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-white text-emerald-800 flex items-center justify-center font-black text-sm shadow">
                  আ
                </div>
                <h4 className="font-black text-base tracking-wide">আনন্দ পাঠশালা</h4>
              </div>
              <p className="text-[10px] text-emerald-200 font-medium">
                কেজি ও প্লে-স্কুল ক্যাম্পাস • কুষ্টিয়া সদর
              </p>
              <div className="mt-1.5 inline-block px-2.5 py-0.5 bg-amber-400 text-slate-900 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                TEACHER & STAFF ID CARD
              </div>
            </div>

            {/* Profile Image & Badges */}
            <div className="flex flex-col items-center pt-5 pb-3 px-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-3 border-emerald-600 shadow-lg bg-emerald-100 flex items-center justify-center">
                  {teacher.photoUrl ? (
                    <img
                      src={teacher.photoUrl}
                      alt={teacher.nameBn}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="w-12 h-12 text-emerald-700" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </div>
              </div>

              {/* Names & Designation */}
              <h3 className="font-black text-slate-800 text-lg mt-3 text-center leading-tight">
                {teacher.nameBn}
              </h3>
              <p className="text-xs text-slate-500 font-semibold tracking-wide">
                {teacher.nameEn}
              </p>

              <div className="mt-2 px-3 py-1 bg-emerald-100/90 text-emerald-800 rounded-lg text-xs font-bold text-center border border-emerald-200 shadow-xs">
                {teacher.designationBn}
              </div>
              {teacher.departmentBn && (
                <p className="text-[11px] text-slate-600 mt-1 font-medium text-center">
                  {teacher.departmentBn}
                </p>
              )}
            </div>

            {/* Information Grid */}
            <div className="px-5 py-2 space-y-1.5 text-xs text-slate-700 border-t border-slate-100 bg-white/70">
              <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  আইডি নম্বর:
                </span>
                <span className="font-mono font-bold text-slate-800">
                  APS-{teacher.id.toUpperCase()}
                </span>
              </div>

              {teacher.assignedClass && (
                <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    দায়িত্বপ্রাপ্ত শ্রেণি:
                  </span>
                  <span className="font-bold text-emerald-700">
                    {teacher.assignedClass} শ্রেণি
                  </span>
                </div>
              )}

              {teacher.phone && (
                <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    মোবাইল নম্বর:
                  </span>
                  <span className="font-bold text-slate-800">{teacher.phone}</span>
                </div>
              )}

              {teacher.bloodGroup && (
                <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    রক্তের গ্রুপ:
                  </span>
                  <span className="font-black text-rose-600 px-1.5 py-0.5 bg-rose-50 rounded">
                    {teacher.bloodGroup}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  মেয়াদকাল:
                </span>
                <span className="font-bold text-slate-700">২০২৬ - ২০২৭ শিক্ষাবর্ষ</span>
              </div>
            </div>

            {/* QR Code & Signatures Bottom Footer */}
            <div className="p-4 bg-emerald-900/5 border-t border-emerald-100 flex items-center justify-between">
              <div className="flex flex-col items-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Teacher Verification QR"
                    className="w-14 h-14 rounded-lg bg-white p-0.5 border border-emerald-200 shadow-xs"
                  />
                ) : (
                  <QrCode className="w-12 h-12 text-emerald-700" />
                )}
                <span className="text-[8px] text-slate-500 font-bold mt-0.5">
                  স্কুল পোর্টাল ভেরিফায়েড
                </span>
              </div>

              <div className="text-right">
                <div className="w-24 border-b border-dashed border-slate-400 mb-1" />
                <span className="text-[9px] font-bold text-slate-700 block">
                  প্রধান শিক্ষক / প্রিন্সিপাল
                </span>
                <span className="text-[8px] text-emerald-800 font-semibold block">
                  আনন্দ পাঠশালা, কুষ্টিয়া
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
