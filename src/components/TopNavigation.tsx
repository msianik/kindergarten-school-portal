import React, { useState, useEffect } from 'react';
import { UserRole, PortalAccount } from '../types/school';
import { getRoleNavMetadata } from '../utils/schoolLogic';
import {
  ShieldCheck,
  BookOpen,
  Award,
  CreditCard,
  Cloud,
  UserCheck,
  Globe,
  CalendarCheck,
  BellRing,
  LogOut,
  Heart,
  Menu,
  X,
  ChevronRight,
  Smartphone,
  Users,
  Sliders,
  Clock,
  Package,
  Palette,
  Sparkles,
  Check,
  CalendarDays,
  IdCard,
} from 'lucide-react';
import { PWAInstallButton } from './MobileAppShell';
import {
  PRESET_SCHOOL_THEMES,
  DEFAULT_THEME_COLOR,
  applySchoolTheme,
  getStoredThemeColor,
} from '../utils/themeManager';

interface TopNavigationProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: UserRole;
  loggedInAccount: PortalAccount | null;
  onSelectRole: (role: UserRole) => void;
  unreadAlertsCount: number;
  onOpenNotifications: () => void;
  onOpenMobileModal?: () => void;
  isMobilePreview?: boolean;
  onLogout: () => void;
  logoUrl?: string;
}

const ICON_MAP: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  super_admin_panel: { icon: Sliders, color: 'text-amber-600' },
  overview: { icon: UserCheck, color: 'text-emerald-600' },
  students: { icon: Users, color: 'text-amber-600' },
  idcards: { icon: IdCard, color: 'text-teal-700' },
  routine: { icon: Clock, color: 'text-indigo-600' },
  calendar: { icon: CalendarDays, color: 'text-purple-600' },
  pickup: { icon: ShieldCheck, color: 'text-teal-600' },
  diary: { icon: BookOpen, color: 'text-indigo-600' },
  skills: { icon: Award, color: 'text-amber-500' },
  attendance: { icon: CalendarCheck, color: 'text-emerald-600' },
  fees: { icon: CreditCard, color: 'text-rose-500' },
  workspace: { icon: Cloud, color: 'text-blue-600' },
  inventory: { icon: Package, color: 'text-amber-600' },
};

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  loggedInAccount,
  onSelectRole,
  unreadAlertsCount,
  onOpenNotifications,
  onOpenMobileModal = () => {},
  isMobilePreview = false,
  onLogout,
  logoUrl = '/assets/fb/logo.jpg',
}) => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [activeThemeColor, setActiveThemeColor] = useState<string>(() => getStoredThemeColor());
  const [, setPermTick] = useState(0);

  useEffect(() => {
    const handlePermSync = () => setPermTick((t) => t + 1);
    window.addEventListener('ananda-director-permissions-updated', handlePermSync);
    return () => window.removeEventListener('ananda-director-permissions-updated', handlePermSync);
  }, []);

  useEffect(() => {
    const handleThemeSync = (e: any) => {
      setActiveThemeColor(e.detail?.color || getStoredThemeColor());
    };
    window.addEventListener('school-theme-updated', handleThemeSync);
    return () => window.removeEventListener('school-theme-updated', handleThemeSync);
  }, []);

  const isSuperAdmin = currentRole === 'super_admin';
  const isDirector = currentRole === 'director';
  const isPrincipal = currentRole === 'principal';
  const isTeacher = currentRole === 'teacher';
  const isParent = currentRole === 'parent';

  const topStripBg = isSuperAdmin
    ? 'bg-gradient-to-r from-amber-800 via-emerald-900 to-slate-950'
    : isDirector
    ? 'bg-gradient-to-r from-teal-900 via-emerald-800 to-amber-800'
    : isPrincipal
    ? 'bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900'
    : isTeacher
    ? 'bg-gradient-to-r from-indigo-900 via-violet-800 to-teal-800'
    : isParent
    ? 'bg-gradient-to-r from-amber-800 via-rose-800 to-emerald-900'
    : 'bg-gradient-to-r from-slate-800 to-emerald-800';

  const portalLabelBn = isSuperAdmin
    ? '👑 সুপার অ্যাডমিন পোর্টাল (সেক্রেটারি)'
    : isDirector
    ? '🏛️ পরিচালক পর্ষদ পোর্টাল (সবকিছু ভিউ)'
    : isPrincipal
    ? '🎓 প্রিন্সিপাল ও অ্যাডমিন পোর্টাল'
    : isTeacher
    ? '👩‍🏫 শিক্ষক ক্লাসরুম পোর্টাল'
    : isParent
    ? '👨‍👧 অভিভাবক ও সন্তান পোর্টাল'
    : '🛡️ গেট সিকিউরিটি পোর্টাল';

  const rawNavMeta = getRoleNavMetadata(currentRole, loggedInAccount?.directorId);
  const navItems = rawNavMeta.map((meta) => {
    const mapped =
      meta.id === 'overview' && isParent
        ? { icon: Heart, color: 'text-rose-600' }
        : ICON_MAP[meta.id] || { icon: UserCheck, color: 'text-emerald-600' };
    return {
      ...meta,
      icon: mapped.icon,
      color: mapped.color,
    };
  });

  const handleSelectFromMenu = (tabId: string) => {
    onSelectTab(tabId);
    setIsSideMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-amber-200/80 sticky top-0 z-40 shadow-xs w-full print:hidden no-print">
        {/* Role Portal Banner & Instant Role Switcher (Responsive & Wrapped) */}
        <div
          className={`${topStripBg} text-white text-xs px-2 sm:px-4 py-1 flex flex-wrap items-center justify-between gap-1.5`}
        >
          <div className="flex items-center gap-1.5 min-w-0 max-w-full">
            <span className="font-bold tracking-wide bg-white/15 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] truncate">
              {portalLabelBn}
            </span>
            {loggedInAccount && (
              <span className="hidden md:inline text-amber-200 text-[11px] font-semibold truncate">
                · লগইনকৃত: {loggedInAccount.nameBn} ({loggedInAccount.roleTitleBn})
              </span>
            )}
          </div>

          {isSuperAdmin ? (
            <div className="flex flex-wrap items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded-xl">
              <span className="hidden sm:inline text-[10px] font-medium opacity-80 mr-0.5 whitespace-nowrap">
                পোর্টাল:
              </span>
              <button
                type="button"
                onClick={() => onSelectRole('super_admin')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSuperAdmin
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                সুপার অ্যাডমিন
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('director')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isDirector
                    ? 'bg-white text-teal-950 font-bold shadow-xs'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                পরিচালক
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('principal')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isPrincipal
                    ? 'bg-white text-emerald-950 font-bold shadow-xs'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                প্রিন্সিপাল
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('teacher')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isTeacher
                    ? 'bg-white text-indigo-950 font-bold shadow-xs'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                শিক্ষক
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('parent')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isParent
                    ? 'bg-white text-amber-950 font-bold shadow-xs'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                অভিভাবক
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('public')}
                className="px-1.5 py-0.5 rounded bg-white/15 hover:bg-white/25 text-amber-200 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
              >
                <Globe className="w-2.5 h-2.5 text-amber-300" />
                <span>পাবলিক সাইট</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              {loggedInAccount && (
                <span className="inline-flex md:hidden items-center px-2 py-0.5 rounded-full bg-black/25 text-amber-200 text-[10px] font-semibold truncate max-w-[150px]">
                  {loggedInAccount.nameBn}
                </span>
              )}
              <button
                type="button"
                onClick={() => onSelectTab('public')}
                className="px-2 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
              >
                <Globe className="w-3 h-3 text-amber-300" />
                <span>পাবলিক ওয়েবসাইট</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Role-Tailored Portal Top Bar (Compact & Single-Page Responsive) */}
        <div className="max-w-7xl w-full mx-auto px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-2 relative">
          {/* Zone 1: Left Brand & Logo (Compact & Anchored cleanly to the left) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 3-Dash Left Hamburger Menu Trigger for Mobile / Tablet / Preview */}
            <button
              type="button"
              onClick={() => setIsSideMenuOpen(true)}
              aria-label="সাইড মেনু খুলুন"
              aria-expanded={isSideMenuOpen}
              className={`${
                isMobilePreview ? 'inline-flex' : 'inline-flex lg:hidden'
              } items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/90 shadow-2xs transition-colors shrink-0 cursor-pointer`}
              title="বাম পাশের সাইড মেনু খুলুন"
            >
              <Menu className="w-4 h-4 text-emerald-800" />
            </button>

            {/* School Logo */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-amber-500 to-lime-500 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={logoUrl}
                alt="আনন্দ পাঠশালা কুষ্টিয়া অফিশিয়াল লোগো"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[10px] bg-white"
              />
            </div>

            {/* School Name & Portal Subtitle */}
            <div className="shrink-0">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTab('overview');
                }}
                className="text-xs sm:text-sm lg:text-base font-black tracking-tight text-slate-900 hover:text-emerald-700 transition-colors whitespace-nowrap block leading-tight"
              >
                আনন্দ পাঠশালা
              </a>
              <span className="text-[9px] sm:text-[10px] text-emerald-800 font-bold block tracking-wider uppercase whitespace-nowrap leading-none">
                {isSuperAdmin
                  ? 'সুপার অ্যাডমিন · কুষ্টিয়া'
                  : isDirector
                  ? 'পরিচালক পোর্টাল · কুষ্টিয়া'
                  : isPrincipal
                  ? 'অ্যাডমিন পোর্টাল · কুষ্টিয়া'
                  : isTeacher
                  ? 'শিক্ষক পোর্টাল · কুষ্টিয়া'
                  : 'অভিভাবক পোর্টাল · কুষ্টিয়া'}
              </span>
            </div>
          </div>

          {/* Zone 2: Desktop Role-Specific Nav Links (Compact & Wrapped so it never overflows right) */}
          <nav
            aria-label="ডেস্কটপ পোর্টাল মেনু"
            className={`${
              isMobilePreview ? 'hidden' : 'hidden lg:flex'
            } flex-1 min-w-0 flex-wrap items-center justify-center gap-1 text-[11px] xl:text-xs font-semibold text-slate-700 px-1`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`px-2 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    active
                      ? 'text-slate-950 bg-amber-100/95 border border-amber-300/90 font-extrabold shadow-2xs'
                      : 'hover:text-slate-950 hover:bg-slate-100/90 border border-transparent'
                  }`}
                  title={item.descriptionBn}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                  <span>{item.labelBn}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Mobile App PWA Button, School Theme, FCM Notification Bell & Logout (Compact & Anchored inside page) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <PWAInstallButton
              onOpenMobileModal={onOpenMobileModal}
              isMobilePreview={isMobilePreview}
              square
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all shadow-2xs shrink-0 relative group cursor-pointer"
            />

            {/* School Theme Quick Palette Toggle Button */}
            <button
              type="button"
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              aria-label="স্কুল থিম ও কালার প্যালেট"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 transition-all shadow-2xs shrink-0 relative group cursor-pointer"
              title="স্কুল থিম ও ব্র্যান্ড কালার"
            >
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-700" />
              <span
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow-2xs"
                style={{ backgroundColor: activeThemeColor }}
              />
              <span className="sr-only">স্কুল থিম</span>
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded-lg whitespace-nowrap shadow-lg z-50">
                স্কুল থিম
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenNotifications}
              aria-label="FCM শিক্ষক নোটিফিকেশন"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-amber-50 hover:bg-amber-100 border border-amber-300 text-slate-800 transition-all shadow-2xs shrink-0 relative group cursor-pointer"
              title="FCM অ্যালার্ট ও নোটিফিকেশন"
            >
              <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-black bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  {unreadAlertsCount}
                </span>
              )}
              <span className="sr-only">FCM অ্যালার্ট</span>
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded-lg whitespace-nowrap shadow-lg z-50">
                FCM অ্যালার্ট
              </span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              aria-label="লগআউট"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-all shadow-2xs shrink-0 relative group cursor-pointer"
              title="লগআউট"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="sr-only">লগআউট</span>
              <span className="pointer-events-none absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded-lg whitespace-nowrap shadow-lg z-50">
                লগআউট
              </span>
            </button>
          </div>
        </div>

        {/* Responsive Compact Menu Bar for Tablet / Small Laptop / Mobile (<lg or Mobile Preview) */}
        <nav
          aria-label="রেসপন্সিভ কমপ্যাক্ট পোর্টাল মেনু"
          className={`${
            isMobilePreview ? 'flex' : 'flex lg:hidden'
          } w-full flex-wrap items-center justify-center gap-1 px-2 py-1.5 bg-amber-50/50 border-t border-amber-200/70`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-2 py-1 rounded-lg text-[10.5px] sm:text-[11px] transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  active
                    ? 'text-slate-950 bg-amber-200/90 border border-amber-400 font-extrabold shadow-2xs'
                    : 'bg-white/90 text-slate-700 hover:text-slate-950 hover:bg-amber-100/60 border border-amber-200/80 font-semibold'
                }`}
                title={item.descriptionBn}
              >
                <Icon className={`w-3 h-3 ${item.color} shrink-0`} />
                <span>{item.labelBn}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Left-Side Slide-Out Navigation Drawer (সাইড মেনু ড্রয়ার) */}
      {isSideMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="পোর্টাল সাইড নেভিগেশন মেনু"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSideMenuOpen(false)}
          />

          {/* Left Slide-Out Drawer Panel */}
          <aside className="relative z-10 w-72 max-w-[84vw] bg-white h-full shadow-2xl border-r border-amber-200 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header with Brand & Active Role */}
              <div className={`${topStripBg} text-white p-4 space-y-3`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={logoUrl}
                      alt="আনন্দ পাঠশালা লোগো"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-2xl object-cover bg-white p-0.5 border border-amber-300 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-black tracking-tight truncate">
                        আনন্দ পাঠশালা
                      </h3>
                      <span className="text-[10px] text-amber-200 font-bold block truncate">
                        {portalLabelBn}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSideMenuOpen(false)}
                    aria-label="সাইড মেনু বন্ধ করুন"
                    className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {loggedInAccount && (
                  <div className="bg-black/25 rounded-xl p-2.5 border border-white/15 text-xs">
                    <div className="font-bold text-white truncate">{loggedInAccount.nameBn}</div>
                    <div className="text-[10px] text-amber-200 truncate">
                      {loggedInAccount.roleTitleBn}
                    </div>
                  </div>
                )}
              </div>

              {/* Vertical Navigation Menu List */}
              <div className="p-3 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  পোর্টাল মেনু অপশনসমূহ ({navItems.length}টি)
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectFromMenu(item.id)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl text-left transition-all ${
                        active
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'hover:bg-amber-50/80 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            active ? 'bg-white/20 text-white' : 'bg-slate-100 ' + item.color
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{item.labelBn}</span>
                          <span
                            className={`text-[10px] block truncate ${
                              active ? 'text-emerald-100' : 'text-slate-500'
                            }`}
                          >
                            {item.descriptionBn}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-amber-300' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer: Role Switcher & Quick Portal Actions */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2.5">
              {isSuperAdmin && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 px-1 block">
                    দ্রুত রোল ভিউ পরিবর্তন:
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRole('super_admin');
                        setIsSideMenuOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition-colors ${
                        isSuperAdmin
                          ? 'bg-amber-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      সুপার অ্যাডমিন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRole('director');
                        setIsSideMenuOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition-colors ${
                        isDirector
                          ? 'bg-teal-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      পরিচালক পর্ষদ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRole('principal');
                        setIsSideMenuOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition-colors ${
                        isPrincipal
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      প্রিন্সিপাল
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRole('teacher');
                        setIsSideMenuOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition-colors ${
                        isTeacher
                          ? 'bg-indigo-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      শিক্ষক
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRole('parent');
                        setIsSideMenuOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition-colors ${
                        isParent
                          ? 'bg-amber-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      অভিভাবক
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('public');
                    setIsSideMenuOpen(false);
                  }}
                  className="py-2 px-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-700" />
                  <span>পাবলিক সাইট</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSideMenuOpen(false);
                    onOpenMobileModal();
                  }}
                  className="py-2 px-2.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>মোবাইল অ্যাপ</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSideMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>পোর্টাল থেকে লগআউট করুন</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING TOP THEME SWITCHER MODAL (Always on top, responsive & zero-leak) */}
      {/* ========================================================================= */}
      {isThemeMenuOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center sm:justify-end p-3 sm:p-5 pt-14 sm:pt-16 sm:pr-8 pointer-events-none">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs pointer-events-auto transition-opacity"
            onClick={() => setIsThemeMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Popover Card */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-theme-title"
            className="relative pointer-events-auto w-full max-w-[360px] bg-white rounded-3xl shadow-2xl border-2 border-slate-100 p-4 sm:p-5 z-10 animate-fade-in space-y-4 max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs transition-colors duration-200"
                  style={{ backgroundColor: activeThemeColor }}
                >
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3
                    id="quick-theme-title"
                    className="text-sm font-black text-slate-900 flex items-center gap-1.5"
                  >
                    <span>স্কুল থিম ও কালার</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    ৯টি প্রি-সেট কালার থেকে নির্বাচন করুন
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsThemeMenuOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Theme Status Pill */}
            {(() => {
              const currentPreset = PRESET_SCHOOL_THEMES.find(
                (p) => p.primaryColor.toLowerCase() === activeThemeColor.toLowerCase()
              );
              return (
                <div
                  className="px-3.5 py-2 rounded-2xl border flex items-center justify-between text-xs"
                  style={{
                    backgroundColor: `${activeThemeColor}12`,
                    borderColor: `${activeThemeColor}30`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full shadow-inner border border-white shrink-0"
                      style={{ backgroundColor: activeThemeColor }}
                    />
                    <span className="font-bold text-slate-900 text-xs">
                      {currentPreset ? currentPreset.nameBn : 'কাস্টম থিম'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-600 bg-white/70 px-2 py-0.5 rounded-lg border border-slate-200/60">
                    {activeThemeColor}
                  </span>
                </div>
              );
            })()}

            {/* 9 Preset Themes Grid (3x3) */}
            <div className="grid grid-cols-3 gap-2">
              {PRESET_SCHOOL_THEMES.map((preset) => {
                const isSelected = activeThemeColor.toLowerCase() === preset.primaryColor.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      applySchoolTheme(preset.primaryColor);
                      setActiveThemeColor(preset.primaryColor);
                    }}
                    className={`p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 relative group ${
                      isSelected
                        ? 'border-2 shadow-sm ring-2 ring-offset-1 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: preset.primaryColor,
                            backgroundColor: preset.lightBg,
                          }
                        : {}
                    }
                    title={`${preset.nameBn} (${preset.primaryColor})`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs transition-transform group-hover:scale-105"
                      style={{ backgroundColor: preset.primaryColor }}
                    >
                      {isSelected ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/40" />
                      )}
                    </div>
                    <span className="text-[10.5px] font-bold text-slate-800 leading-tight truncate w-full">
                      {preset.nameEn.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 font-medium leading-none">
                      {preset.primaryColor}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsThemeMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open-school-theme-settings'));
                }}
                className="w-full py-2.5 px-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs hover:opacity-95"
                style={{ backgroundColor: activeThemeColor }}
              >
                <Palette className="w-3.5 h-3.5 text-white" />
                <span>সম্পূর্ণ কালার হুইল ও বিস্তারিত সেটিংস</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  applySchoolTheme(DEFAULT_THEME_COLOR);
                  setActiveThemeColor(DEFAULT_THEME_COLOR);
                }}
                className="w-full py-1.5 px-3 rounded-xl hover:bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>মূল পান্না সবুজ (#065f46) এ রিসেট</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

