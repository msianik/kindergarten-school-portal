import React, { useState, useMemo, useEffect } from 'react';
import { SchoolNotice, SchoolNoticeCategory } from '../types/school';
import { SCHOOL_PROFILE } from '../data/mockData';
import {
  Bell,
  Calendar,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  ExternalLink,
  Printer,
  Download,
  Pin,
  Clock,
  Tag,
  Users,
  GraduationCap,
  Coffee,
  CheckCircle2,
  Share2,
  Pause,
  Play,
  MessageCircle,
  Copy,
  Check,
  Facebook,
  Link2,
  Settings,
  Globe,
  RefreshCw,
  CheckCheck,
  Megaphone,
  Phone,
} from 'lucide-react';
import { EmergencyNoticeBroadcastModal } from './EmergencyNoticeBroadcastModal';
import { OfficialCircularPrintModal } from './OfficialCircularPrintModal';

// =========================================================================
// 1. TOP SCROLLING ANNOUNCEMENT TICKER COMPONENT
// =========================================================================
interface NoticeTickerProps {
  notices: SchoolNotice[];
  onSelectNotice: (notice: SchoolNotice) => void;
  onNavigateApply?: () => void;
  helplinePhone?: string;
}

export const NoticeTicker: React.FC<NoticeTickerProps> = ({
  notices,
  onSelectNotice,
  onNavigateApply,
  helplinePhone,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  // Only show 'Urgent' category / priority notices in the ticker to keep the scrolling area uncluttered
  const tickerNotices = useMemo(() => {
    return notices.filter(
      (n) => n.category === 'urgent' || n.priority === 'urgent'
    );
  }, [notices]);

  // Duplicate notices appropriately for smooth continuous infinite marquee loop
  const duplicatedNotices = useMemo(() => {
    if (tickerNotices.length === 0) return [];
    if (tickerNotices.length === 1) {
      return [...tickerNotices, ...tickerNotices, ...tickerNotices, ...tickerNotices];
    }
    return [...tickerNotices, ...tickerNotices];
  }, [tickerNotices]);

  if (tickerNotices.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-slate-950 via-rose-950 to-slate-950 text-white border-y border-rose-800/40 shadow-sm relative z-30 select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-3 text-xs">
        {/* Left Live Badge: Pulsing red indicator dot + Clean text (No exclamation icon) */}
        <div className="notice-ticker-header flex items-center shrink-0 bg-slate-950/95 pr-1.5 sm:pr-2.5 z-20 border-r border-rose-800/40">
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs"
            title="লাইভ জরুরি নোটিশ"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-black tracking-tight whitespace-nowrap text-rose-200">
              জরুরি নোটিশ
            </span>
          </div>
        </div>

        {/* Center Marquee Container: Maximized width on mobile phones */}
        <div
          className="flex-1 overflow-hidden relative group cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          title="মাউস রাখলে নোটিশ স্ক্রলিং থেমে যাবে · বিস্তারিত পড়তে ক্লিক করুন"
        >
          {/* Edge masks: only on desktop/tablet to give full 100% width on mobile */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10 hidden sm:block" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10 hidden sm:block" />

          {/* Marquee Track: pauses instantly on hover */}
          <div
            className={`animate-marquee-scroll flex items-center gap-4 sm:gap-8 whitespace-nowrap will-change-transform py-0.5 ${
              isPaused ? 'marquee-paused' : ''
            }`}
            style={{
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {duplicatedNotices.map((notice, idx) => (
              <div
                key={`${notice.id}-${idx}`}
                onClick={() => onSelectNotice(notice)}
                className="inline-flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3 py-1 rounded-full bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 hover:border-amber-400/60 transition-all cursor-pointer group/item hover:scale-[1.02] shadow-2xs"
              >
                <span className="px-1.5 py-0.5 rounded text-[9.5px] sm:text-[10px] font-extrabold shrink-0 bg-rose-500/30 text-rose-200 border border-rose-500/40">
                  {notice.badgeBn || 'জরুরি'}
                </span>

                <span className="font-bold text-white group-hover/item:text-amber-300 transition-colors text-xs">
                  {notice.titleBn}
                </span>

                <span className="text-slate-300 text-[11px] font-medium hidden md:inline">
                  · {notice.dateBn}
                </span>

                <span className="text-amber-300 text-[10px] font-bold group-hover/item:underline flex items-center gap-0.5 shrink-0">
                  <span>[পড়ুন ↗]</span>
                </span>

                {/* Decorative separator symbol */}
                <span className="text-rose-400/60 font-black ml-1.5 sm:ml-2 select-none">✦</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Action Controls: High-Contrast Vibrant Admission Helpline */}
        <div className="flex items-center shrink-0 z-20 pl-1.5 sm:pl-2 bg-slate-950/95 border-l border-rose-800/40">
          <a
            href={`tel:${helplinePhone || '01914057511'}`}
            className="group relative inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-400/60 hover:ring-emerald-300 transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title={`ভর্তি হেল্পলাইনে কল করুন: ${helplinePhone || '০১৯১৪-০৫৭৫১১'}`}
          >
            {/* Phone Icon with ringing animation effect */}
            <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-emerald-700/80 group-hover:bg-emerald-600 text-white shrink-0 shadow-inner">
              <Phone className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-white transition-transform group-hover:rotate-12 animate-pulse" />
            </span>
            <div className="flex flex-col text-left leading-[1.05]">
              <span className="text-[10px] sm:text-[11px] font-black text-white tracking-tight drop-shadow-xs">
                ভর্তি
              </span>
              <span className="text-[8.5px] sm:text-[9.5px] font-bold text-emerald-100 tracking-tight">
                হেল্পলাইন
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 2. MAIN NOTICE BOARD COMPONENT WITH CATEGORY TABS & SEARCH
// =========================================================================
interface NoticeBoardProps {
  notices: SchoolNotice[];
  onOpenNoticeDetail?: (notice: SchoolNotice) => void;
  onNavigateApply?: () => void;
  isAdmin?: boolean;
  onAddNotice?: () => void;
  onEditNotice?: (notice: SchoolNotice) => void;
  onDeleteNotice?: (noticeId: string) => void;
  onSendBroadcastNotification?: (title: string, body: string) => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({
  notices,
  onOpenNoticeDetail,
  onNavigateApply,
  isAdmin = false,
  onAddNotice,
  onEditNotice,
  onDeleteNotice,
  onSendBroadcastNotification,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SchoolNoticeCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalNotice, setActiveModalNotice] = useState<SchoolNotice | null>(null);
  const [sharingNotice, setSharingNotice] = useState<SchoolNotice | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEmergencyBroadcastModal, setShowEmergencyBroadcastModal] = useState<boolean>(false);
  const [printCircularNotice, setPrintCircularNotice] = useState<SchoolNotice | null>(null);

  // Social Media Connect: Facebook Page URL & automated link generator state
  const [facebookPageUrl, setFacebookPageUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ananda_school_facebook_page_v1');
        if (stored && stored.trim().length > 0) return stored.trim();
      } catch {}
    }
    return SCHOOL_PROFILE.facebookUrl || 'https://www.facebook.com/AnandaPathshalaKushtia';
  });

  const [adminFbInput, setAdminFbInput] = useState<string>(facebookPageUrl);
  const [showSocialConfigModal, setShowSocialConfigModal] = useState<boolean>(false);
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);

  // Sync across tabs and other components
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEv = e as CustomEvent<{ facebookUrl?: string }>;
      if (customEv.detail?.facebookUrl) {
        setFacebookPageUrl(customEv.detail.facebookUrl);
        setAdminFbInput(customEv.detail.facebookUrl);
      }
    };
    window.addEventListener('ananda-facebook-url-updated', handleSync);
    return () => window.removeEventListener('ananda-facebook-url-updated', handleSync);
  }, []);

  // Automated link generator helper for notice cards
  const generateNoticeFacebookUrl = (notice: SchoolNotice, baseUrl: string) => {
    if (notice.facebookPostUrl && notice.facebookPostUrl.trim().length > 0) {
      return notice.facebookPostUrl.trim();
    }
    const cleanBase = baseUrl.trim().replace(/\/$/, '');
    return cleanBase;
  };

  const handleSaveFacebookUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let trimmed = adminFbInput.trim();
    if (!trimmed) {
      setUrlValidationError('অনুগ্রহ করে স্কুলের একটি বৈধ ফেসবুক পেজ লিংক প্রদান করুন।');
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }
    if (!trimmed.includes('facebook.com')) {
      setUrlValidationError('লিংকটিতে facebook.com থাকতে হবে (যেমন: https://www.facebook.com/AnandaPathshalaKushtia)');
      return;
    }

    setUrlValidationError(null);
    setFacebookPageUrl(trimmed);
    setAdminFbInput(trimmed);
    setShowSocialConfigModal(false);
    try {
      localStorage.setItem('ananda_school_facebook_page_v1', trimmed);
      window.dispatchEvent(
        new CustomEvent('ananda-facebook-url-updated', { detail: { facebookUrl: trimmed } })
      );
    } catch {}

    setToastMessage('✅ অফিসিয়াল ফেসবুক পেজ URL সংরক্ষিত হয়েছে ও সকল নোটিশে অটো-লিঙ্ক জেনারেট হয়েছে!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResetFacebookUrl = () => {
    const defaultUrl = SCHOOL_PROFILE.facebookUrl || 'https://www.facebook.com/AnandaPathshalaKushtia';
    setAdminFbInput(defaultUrl);
    setFacebookPageUrl(defaultUrl);
    setUrlValidationError(null);
    try {
      localStorage.setItem('ananda_school_facebook_page_v1', defaultUrl);
      window.dispatchEvent(
        new CustomEvent('ananda-facebook-url-updated', { detail: { facebookUrl: defaultUrl } })
      );
    } catch {}
    setToastMessage('🔄 অফিসিয়াল ফেসবুক পেজ URL ডিফল্টে রিসেট করা হয়েছে!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBroadcastNotice = (newNoticeData: Omit<SchoolNotice, 'id'>, targetAudience: string) => {
    const newNotice: SchoolNotice = {
      ...newNoticeData,
      id: `notice-${Date.now()}`,
    };
    try {
      const stored = localStorage.getItem('ananda_school_notices_v1');
      const currentList: SchoolNotice[] = stored ? JSON.parse(stored) : notices;
      const updatedList = [newNotice, ...currentList];
      localStorage.setItem('ananda_school_notices_v1', JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('ananda-notices-updated', { detail: { notices: updatedList } }));
    } catch {}

    if (onSendBroadcastNotification) {
      onSendBroadcastNotification(newNotice.titleBn, newNotice.contentBn);
    }
    setToastMessage('🚨 জরুরি নোটিশ সফলভাবে ব্রডকাস্ট হয়েছে!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Category Counts
  const counts = useMemo(() => {
    return {
      all: notices.length,
      urgent: notices.filter((n) => n.priority === 'urgent' || n.category === 'urgent').length,
      admission: notices.filter((n) => n.category === 'admission').length,
      event: notices.filter((n) => n.category === 'event').length,
      exam: notices.filter((n) => n.category === 'exam').length,
      holiday: notices.filter((n) => n.category === 'holiday').length,
    };
  }, [notices]);

  // Filtered Notices
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'urgent'
          ? notice.priority === 'urgent' || notice.category === 'urgent'
          : notice.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        notice.titleBn.toLowerCase().includes(q) ||
        notice.descriptionBn.toLowerCase().includes(q) ||
        notice.badgeBn.toLowerCase().includes(q) ||
        notice.targetAudienceBn.toLowerCase().includes(q) ||
        notice.dateBn.toLowerCase().includes(q)
      );
    });
  }, [notices, selectedCategory, searchQuery]);

  const handleOpenNotice = (notice: SchoolNotice) => {
    if (onOpenNoticeDetail) {
      onOpenNoticeDetail(notice);
    } else {
      setActiveModalNotice(notice);
    }
  };

  const handlePrintNotice = (notice: SchoolNotice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${notice.titleBn} - আনন্দ পাঠশালা কুষ্টিয়া</title>
          <style>
            body { font-family: 'SolaimanLipi', 'Noto Sans Bengali', Arial, sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 25px; }
            .school-name { font-size: 24px; font-weight: bold; color: #065f46; margin: 0; }
            .school-sub { font-size: 13px; color: #64748b; margin-top: 5px; }
            .badge { display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 12px; font-weight: bold; }
            .title { font-size: 20px; font-weight: bold; margin: 20px 0 10px 0; color: #0f172a; }
            .meta { font-size: 13px; color: #64748b; margin-bottom: 20px; }
            .body { font-size: 14px; line-height: 1.8; color: #334155; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="school-name">আনন্দ পাঠশালা</h1>
            <p class="school-sub">কুষ্টিয়ার একমাত্র প্রি-স্কুল ও কিন্ডারগার্টেন · ২২, পূর্ণ চন্দ্র লাহিড়ী লেন, গোশালা, কুষ্টিয়া</p>
          </div>
          <div>
            <span class="badge">${notice.badgeBn}</span>
            <h2 class="title">${notice.titleBn}</h2>
            <div class="meta">
              <strong>তারিখ:</strong> ${notice.dateBn} | <strong>প্রাপক:</strong> ${notice.targetAudienceBn}
            </div>
            <div class="body">${notice.descriptionBn}</div>
          </div>
          <div class="footer">
            <div>অধ্যক্ষ ও প্রধান শিক্ষক কার্যালয়<br>আনন্দ পাঠশালা, কুষ্টিয়া</div>
            <div>মুদ্রণ সময়: ${new Date().toLocaleDateString('bn-BD')}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getShareContent = (notice: SchoolNotice) => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : 'https://anandapathshala.edu.bd';
    const postOrPageUrl = generateNoticeFacebookUrl(notice, facebookPageUrl);
    const text = `📢 *${notice.titleBn}*\n🏷 বিষয়: ${notice.badgeBn}\n🗓 তারিখ: ${notice.dateBn}${notice.validUntilBn ? ` (শেষ সময়: ${notice.validUntilBn})` : ''}\n👥 প্রাপক: ${notice.targetAudienceBn}\n\n${notice.descriptionBn.slice(0, 240)}${notice.descriptionBn.length > 240 ? '...' : ''}\n\n🏫 আনন্দ পাঠশালা কুষ্টিয়া (২২, পূর্ণ চন্দ্র লাহিড়ী লেন, গোশালা)\n🔗 ফেসবুক পেজ ও নোটিশ: ${postOrPageUrl}\n🌐 বিস্তারিত জানুন: ${currentUrl}#notice-board`;
    return {
      title: `${notice.titleBn} - আনন্দ পাঠশালা`,
      text,
      url: `${currentUrl}#notice-board`,
    };
  };

  const handleShareFacebook = (notice: SchoolNotice) => {
    const { url, title } = getShareContent(notice);
    const noticeUrl = `${url}?notice=${encodeURIComponent(notice.id)}`;
    const postOrPageUrl = generateNoticeFacebookUrl(notice, facebookPageUrl);
    const quote = `${title}\n${notice.descriptionBn.slice(0, 160)}...\n\nঅফিসিয়াল ফেসবুক পেজ: ${postOrPageUrl}\nআনন্দ পাঠশালা, কুষ্টিয়া`;
    const fbSharerUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(noticeUrl)}&quote=${encodeURIComponent(quote)}`;

    const width = 640;
    const height = 540;
    const left = typeof window !== 'undefined' ? window.screen.width / 2 - width / 2 : 100;
    const top = typeof window !== 'undefined' ? window.screen.height / 2 - height / 2 : 100;
    const popup = window.open(
      fbSharerUrl,
      'facebook-share-dialog',
      `toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=no,width=${width},height=${height},top=${top},left=${left}`
    );

    if (popup) {
      popup.focus();
    } else {
      window.open(fbSharerUrl, '_blank', 'noopener,noreferrer');
    }

    setToastMessage('Facebook Sharer ডায়ালগ চালু হয়েছে!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyNoticeText = (notice: SchoolNotice) => {
    const { text } = getShareContent(notice);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setToastMessage('✅ বিজ্ঞপ্তির বিস্তারিত তথ্য ও লিংক ক্লিপবোর্ডে কপি করা হয়েছে!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleNativeShare = (notice: SchoolNotice) => {
    const { title, text, url } = getShareContent(notice);
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
    } else {
      handleCopyNoticeText(notice);
    }
  };

  const handleShareNotice = (notice: SchoolNotice) => {
    setSharingNotice(notice);
  };

  return (
    <section id="notice-board" className="scroll-mt-24 bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-8 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs animate-bounce font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
              <span>অফিসিয়াল সার্কুলার ও আপডেট</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            প্রাতিষ্ঠানিক ডিজিটাল নোটিশ বোর্ড
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            আনন্দ পাঠশালার অভ্যন্তরীণ একাডেমিক কার্যক্রম, শিখন মূল্যায়ন, ছুটির তালিকা ও প্রাতিষ্ঠানিক সর্বশেষ নোটিশসমূহ।
          </p>
        </div>

        {/* Right Header Controls (Admin Only - No Redundant Public Apply Buttons) */}
        {isAdmin && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setShowEmergencyBroadcastModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="সকল অভিভাবক ও শিক্ষকের মোবাইলে জরুরি নোটিশ ও তাৎক্ষণিক পুশ অ্যালার্ট পাঠান"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>জরুরি পুশ ব্রডকাস্ট</span>
            </button>
            {onAddNotice && (
              <button
                type="button"
                onClick={onAddNotice}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>+ নতুন নোটিশ যুক্ত করুন</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs Bar (Category Pills) & Search - Side by Side on Right */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Category Buttons - Compact width, taller height, two-line text (Top on top, Bottom on bottom) */}
        <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar scroll-smooth pb-1">
          <div className="flex items-center gap-2 w-max">
            {/* ১. সকল নোটিশ */}
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-2xl border text-center transition-all duration-150 shrink-0 cursor-pointer min-w-[72px] sm:min-w-[78px] h-[68px] sm:h-[72px] active:scale-95 shadow-2xs ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-100/90 text-slate-800 hover:bg-slate-200 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs">📌</span>
                <span
                  className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${
                    selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {counts.all}
                </span>
              </div>
              <span className="text-xs font-black tracking-tight leading-tight block">সকল</span>
              <span
                className={`text-[10px] font-bold leading-tight block ${
                  selectedCategory === 'all' ? 'text-white/80' : 'text-slate-500'
                }`}
              >
                নোটিশ
              </span>
            </button>

            {/* ২. জরুরি নোটিশ */}
            <button
              type="button"
              onClick={() => setSelectedCategory('urgent')}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-2xl border text-center transition-all duration-150 shrink-0 cursor-pointer min-w-[72px] sm:min-w-[78px] h-[68px] sm:h-[72px] active:scale-95 shadow-2xs ${
                selectedCategory === 'urgent'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-rose-50/90 text-rose-800 hover:bg-rose-100 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs">🚨</span>
                <span
                  className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${
                    selectedCategory === 'urgent' ? 'bg-white/25 text-white' : 'bg-rose-200/70 text-rose-900'
                  }`}
                >
                  {counts.urgent}
                </span>
              </div>
              <span className="text-xs font-black tracking-tight leading-tight block">জরুরি</span>
              <span
                className={`text-[10px] font-bold leading-tight block ${
                  selectedCategory === 'urgent' ? 'text-white/80' : 'text-rose-600'
                }`}
              >
                নোটিশ
              </span>
            </button>

            {/* ৩. ভর্তি বিজ্ঞপ্তি */}
            <button
              type="button"
              onClick={() => setSelectedCategory('admission')}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-2xl border text-center transition-all duration-150 shrink-0 cursor-pointer min-w-[72px] sm:min-w-[78px] h-[68px] sm:h-[72px] active:scale-95 shadow-2xs ${
                selectedCategory === 'admission'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-teal-50/90 text-teal-800 hover:bg-teal-100 border-teal-200'
              }`}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs">🎓</span>
                <span
                  className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${
                    selectedCategory === 'admission' ? 'bg-white/25 text-white' : 'bg-teal-200/70 text-teal-900'
                  }`}
                >
                  {counts.admission}
                </span>
              </div>
              <span className="text-xs font-black tracking-tight leading-tight block">ভর্তি</span>
              <span
                className={`text-[10px] font-bold leading-tight block ${
                  selectedCategory === 'admission' ? 'text-white/80' : 'text-teal-600'
                }`}
              >
                বিজ্ঞপ্তি
              </span>
            </button>

            {/* ৪. আপকামিং নোটিশ */}
            <button
              type="button"
              onClick={() => setSelectedCategory('event')}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-2xl border text-center transition-all duration-150 shrink-0 cursor-pointer min-w-[72px] sm:min-w-[78px] h-[68px] sm:h-[72px] active:scale-95 shadow-2xs ${
                selectedCategory === 'event'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50/90 text-amber-900 hover:bg-amber-100 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs">🎈</span>
                <span
                  className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${
                    selectedCategory === 'event' ? 'bg-white/25 text-white' : 'bg-amber-200/70 text-amber-900'
                  }`}
                >
                  {counts.event}
                </span>
              </div>
              <span className="text-xs font-black tracking-tight leading-tight block">আপকামিং</span>
              <span
                className={`text-[10px] font-bold leading-tight block ${
                  selectedCategory === 'event' ? 'text-white/80' : 'text-amber-700'
                }`}
              >
                নোটিশ
              </span>
            </button>

            {/* ৫. পরীক্ষা */}
            <button
              type="button"
              onClick={() => setSelectedCategory('exam')}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-2xl border text-center transition-all duration-150 shrink-0 cursor-pointer min-w-[72px] sm:min-w-[78px] h-[68px] sm:h-[72px] active:scale-95 shadow-2xs ${
                selectedCategory === 'exam'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-indigo-50/90 text-indigo-800 hover:bg-indigo-100 border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs">📝</span>
                <span
                  className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${
                    selectedCategory === 'exam' ? 'bg-white/25 text-white' : 'bg-indigo-200/70 text-indigo-900'
                  }`}
                >
                  {counts.exam}
                </span>
              </div>
              <span className="text-xs font-black tracking-tight leading-tight block">পরীক্ষা</span>
              <span
                className={`text-[10px] font-bold leading-tight block ${
                  selectedCategory === 'exam' ? 'text-white/80' : 'text-indigo-600'
                }`}
              >
                নোটিশ
              </span>
            </button>

            {/* ৬. স্কুল ছুটি */}
            <button
              type="button"
              onClick={() => setSelectedCategory('holiday')}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-2xl border text-center transition-all duration-150 shrink-0 cursor-pointer min-w-[72px] sm:min-w-[78px] h-[68px] sm:h-[72px] active:scale-95 shadow-2xs ${
                selectedCategory === 'holiday'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-50/90 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs">🏖️</span>
                <span
                  className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${
                    selectedCategory === 'holiday' ? 'bg-white/25 text-white' : 'bg-emerald-200/70 text-emerald-900'
                  }`}
                >
                  {counts.holiday}
                </span>
              </div>
              <span className="text-xs font-black tracking-tight leading-tight block">স্কুল</span>
              <span
                className={`text-[10px] font-bold leading-tight block ${
                  selectedCategory === 'holiday' ? 'text-white/80' : 'text-emerald-700'
                }`}
              >
                ছুটি
              </span>
            </button>
          </div>
        </div>

        {/* Search Bar - Positioned Permanently on the Right Side */}
        <div className="relative w-36 sm:w-52 md:w-60 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নোটিশ খুঁজুন..."
            className="w-full pl-9 pr-7 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Notices Grid with Reduced Height and Right-side Scrollbar */}
      {filteredNotices.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700">নির্বাচিত ক্যাটাগরিতে কোনো নোটিশ নেই</p>
          <p className="text-xs text-slate-500">অনুসন্ধান ফিল্টার পরিবর্তন করুন অথবা 'সকল নোটিশ' দেখুন</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
          >
            সকল নোটিশে ফিরে যান
          </button>
        </div>
      ) : (
        <div className="notice-board-scroll max-h-[500px] sm:max-h-[540px] overflow-y-auto pr-1 sm:pr-2.5 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotices.map((notice) => {
            const isUrgent = notice.priority === 'urgent';
            const isPinned = notice.isPinned;

            const categoryStyle =
              notice.category === 'admission'
                ? 'bg-teal-50 border-teal-200 text-teal-800'
                : notice.category === 'exam'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                : notice.category === 'holiday'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : notice.category === 'event'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-rose-50 border-rose-200 text-rose-800';

            return (
              <div
                key={notice.id}
                className={`relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
                  isPinned
                    ? 'border-emerald-300 bg-gradient-to-b from-emerald-50/40 to-white ring-1 ring-emerald-400/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Top Badges Strip */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${categoryStyle}`}>
                      {notice.badgeBn}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                          <Pin className="w-3 h-3 text-amber-600 fill-amber-500" />
                          <span>পিন্ড</span>
                        </span>
                      )}

                      {isUrgent && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold animate-pulse">
                          জরুরি
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => handleOpenNotice(notice)}
                    className="text-base font-bold text-slate-900 hover:text-emerald-700 transition cursor-pointer leading-snug line-clamp-2"
                  >
                    {notice.titleBn}
                  </h3>

                  {/* Meta: Target Audience & Date */}
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{notice.dateBn}</span>
                      {notice.validUntilBn && (
                        <span className="text-[10px] text-slate-400">· শেষ: {notice.validUntilBn}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{notice.targetAudienceBn}</span>
                    </div>
                  </div>

                  {/* Description Snippet (Strictly 2 lines) */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {notice.descriptionBn}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleOpenNotice(notice)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-0.5 cursor-pointer mr-0.5"
                    >
                      <span>বিস্তারিত</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Dedicated Facebook Share Button - explicitly states 'ফেসবুক শেয়ার' */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareFacebook(notice);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1877F2] hover:bg-blue-700 active:scale-95 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                      title="ফেসবুকে এই নোটিশটি সরাসরি শেয়ার করুন (Facebook Share)"
                    >
                      <Facebook className="w-3.5 h-3.5 fill-current text-white" />
                      <span>ফেসবুক শেয়ার</span>
                    </button>

                    {/* Secondary Link / Text Copy Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyNoticeText(notice);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                      title="নোটিশের লেখা ও লিংক কপি করুন"
                    >
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>কপি</span>
                    </button>

                    {/* Official Circular Print Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrintCircularNotice(notice);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition cursor-pointer"
                      title="অফিসিয়াল লেটারহেড সংবলিত সার্কুলার প্রিন্ট বা PDF ডাউনলোড করুন"
                    >
                      <Printer className="w-3 h-3 text-emerald-600" />
                      <span>সার্কুলার</span>
                    </button>
                  </div>

                  {/* Admin controls only (Edit / Delete) */}
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      {onEditNotice && (
                        <button
                          type="button"
                          onClick={() => onEditNotice(notice)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                          title="নোটিশ সম্পাদনা করুন"
                        >
                          এডিট
                        </button>
                      )}
                      {onDeleteNotice && (
                        <button
                          type="button"
                          onClick={() => onDeleteNotice(notice.id)}
                          className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold cursor-pointer transition-colors"
                          title="নোটিশ মুছে ফেলুন"
                        >
                          মুছুন
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}



      {/* Notice Detail Modal */}
      {activeModalNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  {activeModalNotice.badgeBn}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {activeModalNotice.titleBn}
                </h3>
                {activeModalNotice.titleEn && (
                  <p className="text-xs text-slate-400 font-mono">{activeModalNotice.titleEn}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveModalNotice(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">প্রকাশের তারিখ:</span>
                <span className="font-bold text-slate-800">{activeModalNotice.dateBn}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">প্রাপক / লক্ষ্য দল:</span>
                <span className="font-bold text-slate-800">{activeModalNotice.targetAudienceBn}</span>
              </div>
              {activeModalNotice.validUntilBn && (
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">কার্যকাল / শেষ সময়:</span>
                  <span className="font-bold text-rose-700">{activeModalNotice.validUntilBn}</span>
                </div>
              )}
              {activeModalNotice.attachmentName && (
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">সংযুক্ত ফাইল:</span>
                  <span className="font-bold text-emerald-700">{activeModalNotice.attachmentName}</span>
                </div>
              )}
            </div>

            {/* Notice Body */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line bg-white">
              {activeModalNotice.descriptionBn}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintNotice(activeModalNotice)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 transition"
                  title="নোটিশ প্রিন্ট করুন"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>প্রিন্ট করুন</span>
                </button>

                {/* Modal Primary Facebook Share Button */}
                <button
                  type="button"
                  onClick={() => handleShareFacebook(activeModalNotice)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1877F2] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                  title="সরাসরি ফেসবুকে নোটিশটি শেয়ার করুন (Facebook Share)"
                >
                  <Facebook className="w-3.5 h-3.5 fill-current text-white" />
                  <span>ফেসবুক শেয়ার</span>
                </button>

                {/* Modal Copy Text / Link Button */}
                <button
                  type="button"
                  onClick={() => handleCopyNoticeText(activeModalNotice)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                  title="বিজ্ঞপ্তির বিবরণ ও লিংক কপি করুন"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>কপি করুন</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {activeModalNotice.actionLink && (
                  <a
                    href={activeModalNotice.actionLink}
                    onClick={() => setActiveModalNotice(null)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{activeModalNotice.actionTextBn || 'ফর্ম দেখুন'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setActiveModalNotice(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DEDICATED SHARE NOTICE MODAL (WHATSAPP, FACEBOOK, CLIPBOARD)           */}
      {/* ========================================================================= */}
      {sharingNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  {sharingNotice.badgeBn}
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  বিজ্ঞপ্তিটি শেয়ার করুন
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSharingNotice(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notice Title Preview */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-800 block line-clamp-2">
                {sharingNotice.titleBn}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {sharingNotice.dateBn} · প্রাপক: {sharingNotice.targetAudienceBn}
              </span>
            </div>

            {/* Connected Facebook Page Status Strip */}
            <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Facebook className="w-4 h-4 text-[#1877F2] fill-[#1877F2] shrink-0" />
                <span className="text-[11px] font-bold text-blue-950 truncate">
                  অফিসিয়াল পেজ: আনন্দ পাঠশালা কুষ্টিয়া
                </span>
              </div>
              <a
                href={facebookPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#1877F2] font-bold hover:underline inline-flex items-center gap-1 shrink-0 ml-2"
              >
                <span>পেজ ভিজিট ↗</span>
              </a>
            </div>

            {/* Quick Share Buttons Grid */}
            <div className="space-y-2 pt-1">
              {/* Facebook Button (Primary - Facebook Sharer API) */}
              <button
                type="button"
                onClick={() => {
                  handleShareFacebook(sharingNotice);
                  setSharingNotice(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-between transition shadow-2xs cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Facebook className="w-4 h-4 fill-current text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block leading-tight font-extrabold text-sm">ফেসবুক শেয়ার (Facebook Share)</span>
                    <span className="text-[10px] text-blue-200 font-normal">
                      ফেসবুক টাইমলাইন, প্যারেন্টস গ্রুপ বা পেজে সরাসরি পোস্ট করুন
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Native Mobile Share Button */}
              <button
                type="button"
                onClick={() => {
                  handleNativeShare(sharingNotice);
                  setSharingNotice(null);
                }}
                className="w-full py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-slate-600" />
                  <span>অন্যান্য অ্যাপ (Messenger, Telegram, SMS)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Copy Message & Link Button */}
              <button
                type="button"
                onClick={() => handleCopyNoticeText(sharingNotice)}
                className="w-full py-2 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>বিজ্ঞপ্তির তথ্য ও লিংক কপি করুন</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold">Copy Text</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSharingNotice(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADMINISTRATIVE CONFIGURATION: SOCIAL MEDIA CONNECT MODAL (ADMIN ONLY)  */}
      {/* ========================================================================= */}
      {showSocialConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Facebook className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      সোশ্যাল মিডিয়া কানেক্ট কনফিগারেশন
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      অ্যাডমিন কনসোল
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    বিদ্যালয়ের অফিসিয়াল ফেসবুক পেজ URL ইনপুট ও অটো-লিঙ্ক পরিচালনা করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSocialConfigModal(false);
                  setUrlValidationError(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveFacebookUrl} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-blue-600" />
                  <span>অফিসিয়াল ফেসবুক পেজ URL ইনপুট করুন:</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Facebook className="w-4 h-4 text-blue-600 fill-blue-600" />
                  </div>
                  <input
                    type="url"
                    value={adminFbInput}
                    onChange={(e) => {
                      setAdminFbInput(e.target.value);
                      if (urlValidationError) setUrlValidationError(null);
                    }}
                    placeholder="যেমন: https://www.facebook.com/AnandaPathshalaKushtia"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                {urlValidationError && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 pt-1 bg-rose-50 p-2 rounded-lg border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{urlValidationError}</span>
                  </p>
                )}
              </div>

              {/* Live Preview of UI rendering */}
              <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 space-y-2">
                <span className="text-[11px] font-bold text-blue-900 block">
                  💡 UI রেন্ডার প্রিভিউ (NoticeBoard UI Preview):
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-600">১. হেডার ও ফুটার 'Follow Us' আইকন:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1877F2] text-white text-[10px] font-bold">
                    <Facebook className="w-3 h-3 fill-current" />
                    <span>Follow Us on Facebook ↗</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-600">২. নোটিশ কার্ড অটো-লিঙ্ক:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                    <Facebook className="w-3 h-3 text-blue-600 fill-blue-600" />
                    <span>অফিসিয়াল পেজে নোটিশ ↗</span>
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (adminFbInput.trim()) {
                        let url = adminFbInput.trim();
                        if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                    title="লিংকটি টেস্ট করুন"
                  >
                    <span>টেস্ট লিংক ↗</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFacebookUrl}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition cursor-pointer"
                    title="ডিফল্ট URL রিসেট করুন"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSocialConfigModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Emergency Notice Broadcast Modal */}
      <EmergencyNoticeBroadcastModal
        isOpen={showEmergencyBroadcastModal}
        onClose={() => setShowEmergencyBroadcastModal(false)}
        onBroadcast={handleBroadcastNotice}
      />

      {/* Official Circular Print-ready Modal */}
      <OfficialCircularPrintModal
        isOpen={Boolean(printCircularNotice)}
        onClose={() => setPrintCircularNotice(null)}
        notice={printCircularNotice}
      />
    </section>
  );
};
