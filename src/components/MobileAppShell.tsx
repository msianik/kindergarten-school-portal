import React, { useState } from 'react';
import { UserRole } from '../types/school';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  Home,
  Image,
  Sparkles,
  Send,
  UserCheck,
  ShieldCheck,
  BookOpen,
  Award,
  CreditCard,
  CalendarCheck,
  Heart,
  Share,
  WifiOff,
  Monitor,
  Users,
  MessageSquare,
} from 'lucide-react';

interface PWAInstallButtonProps {
  onOpenMobileModal: () => void;
  isMobilePreview: boolean;
  compact?: boolean;
  square?: boolean;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenMobileModal,
  isMobilePreview,
  compact = false,
  square = false,
  className = '',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        onOpenMobileModal();
      }
    } else {
      onOpenMobileModal();
    }
  };

  const labelText = isInstalled
    ? 'মোবাইল অ্যাপ সক্রিয়'
    : isMobilePreview
    ? 'মোবাইল অ্যাপ মোড'
    : 'মোবাইল অ্যাপ';

  if (square) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={
          className ||
          'w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all shadow-2xs shrink-0 relative group'
        }
        title={labelText}
      >
        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 shrink-0" />
        {isInstallable && !isInstalled && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
        )}
        <span className="sr-only">{labelText}</span>
        <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded-lg whitespace-nowrap shadow-lg z-50">
          {labelText}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition-all shrink-0 ${
        compact
          ? 'px-2.5 py-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
          : 'px-3 py-2 text-xs bg-amber-100/90 hover:bg-amber-200 text-amber-950 border border-amber-300/80 shadow-2xs'
      }`}
      title="মোবাইল অ্যাপ ইনস্টল ও মোবাইল ভিউ"
    >
      <Smartphone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
      <span className="hidden sm:inline">{labelText}</span>
      {isInstallable && !isInstalled && (
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
      )}
    </button>
  );
};

interface MobileBottomNavProps {
  currentRole: UserRole;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMobileModal: () => void;
  forceVisible?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRole,
  currentTab,
  onSelectTab,
  onOpenMobileModal,
  forceVisible = false,
}) => {
  const [activePublicAnchor, setActivePublicAnchor] = useState<string>('top');
  const isPublic = currentRole === 'public' || currentTab === 'public';
  const isPrincipal =
    currentRole === 'principal' ||
    currentRole === 'super_admin' ||
    currentRole === 'director';
  const isTeacher = currentRole === 'teacher';
  const isParent = currentRole === 'parent';

  const scrollToSection = (id: string) => {
    setActivePublicAnchor(id);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isPublic) {
    return (
      <nav
        aria-label="মোবাইল বটম নেভিগেশন"
        className={`${
          forceVisible ? 'flex' : 'flex md:hidden'
        } fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200/90 shadow-lg px-2 py-1.5 items-center justify-around print:hidden no-print`}
      >
        <button
          type="button"
          onClick={() => scrollToSection('top')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-bold transition-colors ${
            activePublicAnchor === 'top' ? 'text-emerald-700 bg-emerald-50/80' : 'text-slate-600'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>হোম</span>
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('teachers')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-bold transition-colors ${
            activePublicAnchor === 'teachers'
              ? 'text-emerald-700 bg-emerald-50/80'
              : 'text-slate-600'
          }`}
        >
          <UserCheck className="w-4 h-4 mb-0.5" />
          <span>শিক্ষকবৃন্দ</span>
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('gallery')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-bold transition-colors ${
            activePublicAnchor === 'gallery'
              ? 'text-emerald-700 bg-emerald-50/80'
              : 'text-slate-600'
          }`}
        >
          <Image className="w-4 h-4 mb-0.5" />
          <span>গ্যালারি</span>
        </button>

        <button
          type="button"
          onClick={onOpenMobileModal}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-bold text-amber-800 bg-amber-50/90"
        >
          <Smartphone className="w-4 h-4 mb-0.5 text-emerald-700" />
          <span>মোবাইল অ্যাপ</span>
        </button>
      </nav>
    );
  }

  const portalTabs = isPrincipal
    ? [
        { id: 'overview', labelBn: 'হোম', icon: UserCheck },
        { id: 'students', labelBn: 'শিক্ষার্থী', icon: Users },
        { id: 'pickup', labelBn: 'গেট-পাস', icon: ShieldCheck },
        { id: 'diary', labelBn: 'ডায়েরি', icon: BookOpen },
        { id: 'attendance', labelBn: 'হাজিরা', icon: CalendarCheck },
      ]
    : isTeacher
    ? [
        { id: 'overview', labelBn: 'হোম', icon: UserCheck },
        { id: 'attendance', labelBn: 'হাজিরা', icon: CalendarCheck },
        { id: 'messages', labelBn: 'চ্যাট', icon: MessageSquare },
        { id: 'diary', labelBn: 'ডায়েরি', icon: BookOpen },
        { id: 'students', labelBn: 'শিক্ষার্থী', icon: Users },
      ]
    : isParent
    ? [
        { id: 'overview', labelBn: 'সন্তান', icon: Heart },
        { id: 'messages', labelBn: 'চ্যাট', icon: MessageSquare },
        { id: 'diary', labelBn: 'ডায়েরি', icon: BookOpen },
        { id: 'pickup', labelBn: 'গেট-পাস', icon: ShieldCheck },
        { id: 'fees', labelBn: 'বেতন/ফি', icon: CreditCard },
      ]
    : [
        { id: 'pickup', labelBn: 'গেট-পাস', icon: ShieldCheck },
        { id: 'overview', labelBn: 'হোম', icon: UserCheck },
      ];

  return (
    <nav
      aria-label="পোর্টাল মোবাইল বটম নেভিগেশন"
      className={`${
        forceVisible ? 'flex' : 'flex lg:hidden'
      } fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200/90 shadow-lg px-1.5 py-1 items-center justify-around print:hidden no-print`}
    >
      {portalTabs.map((item) => {
        const Icon = item.icon;
        const active = currentTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer ${
              active
                ? 'text-emerald-800 bg-emerald-100/90 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${active ? 'text-emerald-700' : 'text-slate-500'}`} />
            <span>{item.labelBn}</span>
          </button>
        );
      })}
    </nav>
  );
};

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobilePreview: boolean;
  onToggleMobilePreview: (val: boolean) => void;
  logoUrl?: string;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({
  isOpen,
  onClose,
  isMobilePreview,
  onToggleMobilePreview,
  logoUrl = '/assets/fb/logo.jpg',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installNotice, setInstallNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallNotice('আনন্দ পাঠশালা মোবাইল অ্যাপ আপনার ডিভাইসে সফলভাবে ইনস্টল হয়েছে!');
      }
    } else {
      setInstallNotice(
        'আপনার ব্রাউজারের মেনু (⋮ বা Share আইকন) থেকে "Add to Home Screen" / "Install App" সিলেক্ট করে সরাসরি হোম-স্ক্রিনে মোবাইল অ্যাপ হিসেবে যুক্ত করুন, অথবা নিচের "লাইভ মোবাইল অ্যাপ ভিউ" চালু করুন।'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-amber-200 shadow-2xl overflow-hidden my-auto">
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-amber-700 text-white p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="আনন্দ পাঠশালা লোগো"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-2xl object-cover bg-white p-0.5 border-2 border-amber-300"
            />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200 block">
                Android · iOS · Progressive Web App
              </span>
              <h3 className="text-lg font-black leading-tight">
                আনন্দ পাঠশালা মোবাইল অ্যাপ
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-slate-800">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong>আনন্দ পাঠশালা (কুষ্টিয়া)</strong> প্ল্যাটফর্মটি সম্পূর্ণ মোবাইল রেসপন্সিভ এবং
            <strong> মোবাইল অ্যাপ (PWA)</strong> হিসেবে অ্যান্ড্রয়েড ও আইফোনের হোম-স্ক্রিনে সরাসরি ইনস্টলযোগ্য।
            অভিভাবক, শিক্ষক ও প্রিন্সিপালরা এক ক্লিকে অ্যাপটি ব্যবহার করতে পারবেন।
          </p>

          {/* Toggle between Responsive Fullscreen & Smartphone App Simulator Frame */}
          <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>লাইভ স্মার্টফোন অ্যাপ ভিউ (Mobile App Preview)</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                ডেস্কটপ বা ট্যাবলেট থেকে সরাসরি মোবাইল অ্যাপের ইন্টারফেস ও বটম নেভিগেশন দেখুন
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onToggleMobilePreview(!isMobilePreview);
                onClose();
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 ${
                isMobilePreview
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm'
              }`}
            >
              {isMobilePreview ? (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span>ফুল-স্ক্রিন ভিউতে ফিরুন</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>মোবাইল অ্যাপ ভিউ চালু করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Direct PWA Install Action */}
          <div className="space-y-3">
            {isInstalled ? (
              <div className="p-3.5 rounded-2xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>মোবাইল অ্যাপটি ইতিমধ্যে আপনার ডিভাইসে ইনস্টল করা আছে!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>মোবাইল অ্যাপ ইনস্টল করুন (Install Mobile App)</span>
              </button>
            )}

            {installNotice && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 leading-relaxed">
                {installNotice}
              </div>
            )}

            {isIOS && !isInstalled && (
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Share className="w-3.5 h-3.5 text-blue-600" />
                  <span>iPhone / iPad-এ ইনস্টল করার নিয়ম:</span>
                </div>
                <p>১. Safari ব্রাউজারের নিচে <strong>Share</strong> আইকনে ট্যাপ করুন।</p>
                <p>২. নিচে স্ক্রল করে <strong>Add to Home Screen</strong> সিলেক্ট করুন।</p>
              </div>
            )}
          </div>

          {/* Key Mobile App Features */}
          <div className="grid grid-cols-2 gap-2.5 text-[11px]">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
              <span className="font-bold text-slate-900 block">📲 ওয়ান-হ্যান্ড বটম বার</span>
              <span className="text-slate-600">মোবাইল স্ক্রিনের নিচে দ্রুত ট্যাব পরিবর্তনের সুবিধা</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
              <span className="font-bold text-slate-900 block">🔔 ইনস্ট্যান্ট FCM পুশ</span>
              <span className="text-slate-600">ভর্তি ও গেট পিক-আপের সাথে সাথে ফোনে অ্যালার্ট</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
              <span className="font-bold text-slate-900 block">🛡️ কিউআর গেট-পাস স্ক্যান</span>
              <span className="text-slate-600">অভিভাবকের ফোন থেকেই ডিজিটাল পিক-আপ কার্ড</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
              <span className="font-bold text-slate-900 block">📶 অফলাইন সাপোর্ট</span>
              <span className="text-slate-600">ইন্টারনেট ধীর হলেও ক্যাশ থেকে ডায়েরি ও রুটিন প্রদর্শন</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>অফলাইন মোড — সংরক্ষিত ডেটা প্রদর্শিত হচ্ছে</span>
    </div>
  );
};
