import React, { useState, useEffect, useRef } from 'react';
import { UserRole, PortalAccount } from '../types/school';
import { getRoleNavMetadata, getGroupedNavPillars, NavPillar } from '../utils/schoolLogic';
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
  ChevronDown,
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
  MessageSquare,
  FileCheck2,
  HeartPulse,
  Megaphone,
} from 'lucide-react';
import { PWAInstallButton } from './MobileAppShell';
import {
  PRESET_SCHOOL_THEMES,
  DEFAULT_THEME_COLOR,
  applySchoolTheme,
  getStoredThemeColor,
} from '../utils/themeManager';
import {
  getStoredDirectChatMessages,
  getUnreadMessagesCount,
  DIRECT_CHAT_STORAGE_EVENT,
} from '../utils/directChatLogic';

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

const PILLAR_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  pillar_overview: UserCheck,
  pillar_students: Users,
  pillar_academics: BookOpen,
  pillar_operations: CalendarCheck,
  pillar_chat: MessageSquare,
  pillar_notices: Megaphone,
  pillar_finance: CreditCard,
};

const ITEM_ICON_MAP: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  overview: { icon: UserCheck, color: 'text-emerald-600' },
  students: { icon: Users, color: 'text-amber-600' },
  idcards: { icon: IdCard, color: 'text-teal-700' },
  health: { icon: HeartPulse, color: 'text-rose-600' },
  routine: { icon: Clock, color: 'text-indigo-600' },
  calendar: { icon: CalendarDays, color: 'text-purple-600' },
  results: { icon: FileCheck2, color: 'text-indigo-700' },
  skills: { icon: Award, color: 'text-amber-500' },
  attendance: { icon: CalendarCheck, color: 'text-emerald-600' },
  pickup: { icon: ShieldCheck, color: 'text-teal-600' },
  diary: { icon: BookOpen, color: 'text-indigo-600' },
  messages: { icon: MessageSquare, color: 'text-teal-600' },
  notices: { icon: Megaphone, color: 'text-rose-600' },
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
  const [activeDropdownPillarId, setActiveDropdownPillarId] = useState<string | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setActiveDropdownPillarId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const [directChatUnreadCount, setDirectChatUnreadCount] = useState<number>(() => {
    return getUnreadMessagesCount(
      getStoredDirectChatMessages(),
      currentRole,
      loggedInAccount?.studentId,
      loggedInAccount?.assignedClass
    );
  });

  useEffect(() => {
    const handleChatSync = () => {
      setDirectChatUnreadCount(
        getUnreadMessagesCount(
          getStoredDirectChatMessages(),
          currentRole,
          loggedInAccount?.studentId,
          loggedInAccount?.assignedClass
        )
      );
    };
    window.addEventListener(DIRECT_CHAT_STORAGE_EVENT, handleChatSync);
    return () => window.removeEventListener(DIRECT_CHAT_STORAGE_EVENT, handleChatSync);
  }, [currentRole, loggedInAccount]);

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

  // 6 Core Clean Pillars
  const pillars: NavPillar[] = getGroupedNavPillars(currentRole, loggedInAccount?.directorId);

  const handleSelectTab = (tabId: string) => {
    onSelectTab(tabId);
    setActiveDropdownPillarId(null);
    setIsSideMenuOpen(false);
  };

  return (
    <>
      <header
        ref={navContainerRef}
        className="bg-white border-b border-amber-200/80 sticky top-0 z-40 shadow-xs w-full print:hidden no-print"
      >
        {/* Role Portal Banner & Instant Role Switcher (Compact) */}
        <div className={`${topStripBg} text-white text-xs py-1 border-b border-black/10`}>
          <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 min-w-0 shrink">
              <span className="font-bold tracking-wide bg-white/15 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] truncate shrink-0">
                {portalLabelBn}
              </span>
              {loggedInAccount && (
                <span className="hidden md:inline text-amber-200 text-[11px] font-semibold truncate">
                  · {loggedInAccount.nameBn} ({loggedInAccount.roleTitleBn})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 bg-black/25 px-2 py-0.5 rounded-xl border border-white/10 shrink-0">
              {isSuperAdmin && (
                <span className="hidden sm:inline text-[10px] font-bold opacity-80 mr-0.5 whitespace-nowrap">
                  রোল:
                </span>
              )}
              {isSuperAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => onSelectRole('super_admin')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] transition-all whitespace-nowrap cursor-pointer ${
                      isSuperAdmin
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white/15 hover:bg-white/25 text-white font-medium'
                    }`}
                  >
                    সুপার অ্যাডমিন
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectRole('principal')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] transition-all whitespace-nowrap cursor-pointer ${
                      isPrincipal
                        ? 'bg-white text-emerald-950 font-black shadow-xs'
                        : 'bg-white/15 hover:bg-white/25 text-white font-medium'
                    }`}
                  >
                    প্রিন্সিপাল
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectRole('teacher')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] transition-all whitespace-nowrap cursor-pointer ${
                      isTeacher
                        ? 'bg-white text-indigo-950 font-black shadow-xs'
                        : 'bg-white/15 hover:bg-white/25 text-white font-medium'
                    }`}
                  >
                    শিক্ষক
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectRole('parent')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] transition-all whitespace-nowrap cursor-pointer ${
                      isParent
                        ? 'bg-white text-amber-950 font-black shadow-xs'
                        : 'bg-white/15 hover:bg-white/25 text-white font-medium'
                    }`}
                  >
                    অভিভাবক
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectRole('accountant')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] transition-all whitespace-nowrap cursor-pointer ${
                      currentRole === 'accountant'
                        ? 'bg-white text-emerald-950 font-black shadow-xs'
                        : 'bg-white/15 hover:bg-white/25 text-white font-medium'
                    }`}
                  >
                    হিসাবরক্ষক
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectRole('gate_security')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] transition-all whitespace-nowrap cursor-pointer ${
                      currentRole === 'gate_security'
                        ? 'bg-white text-teal-950 font-black shadow-xs'
                        : 'bg-white/15 hover:bg-white/25 text-white font-medium'
                    }`}
                  >
                    সিকিউরিটি
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => onSelectTab('public')}
                className="px-2 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-amber-200 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ml-1"
              >
                <Globe className="w-2.5 h-2.5 text-amber-300" />
                <span>পাবলিক সাইট</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Clean Top Bar */}
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2.5 sm:gap-4 relative">
          {/* Brand & Logo with Safe Right Boundary */}
          <div className="flex items-center gap-2.5 shrink-0 pr-3 lg:pr-5 border-r border-slate-200/80">
            {/* Hamburger Trigger for Mobile */}
            <button
              type="button"
              onClick={() => setIsSideMenuOpen(true)}
              aria-label="সাইড মেনু খুলুন"
              className={`${
                isMobilePreview ? 'inline-flex' : 'inline-flex lg:hidden'
              } items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/90 shadow-2xs transition-colors shrink-0 cursor-pointer`}
              title="মেনু খুলুন"
            >
              <Menu className="w-4 h-4 text-emerald-800" />
            </button>

            {/* School Logo */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-amber-500 to-lime-500 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={logoUrl}
                alt="আনন্দ পাঠশালা লোগো"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[10px] bg-white"
              />
            </div>

            {/* School Title */}
            <div className="shrink-0">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('overview');
                }}
                className="text-xs sm:text-sm lg:text-base font-black tracking-tight text-slate-900 hover:text-emerald-700 transition-colors whitespace-nowrap block leading-tight"
              >
                আনন্দ পাঠশালা
              </a>
              <span className="text-[9px] sm:text-[10px] text-emerald-800 font-bold block tracking-wider uppercase whitespace-nowrap leading-none mt-0.5">
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

          {/* Desktop Clean Pillar Navigation Dock (Unified, Responsive, Breathing Room on Both Sides) */}
          <nav
            aria-label="ডেস্কটপ পোর্টাল মেনু"
            className={`${
              isMobilePreview ? 'hidden' : 'hidden lg:flex'
            } flex-1 min-w-0 items-center justify-center px-1 sm:px-2`}
          >
            <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100/90 border border-slate-200/90 shadow-2xs gap-0.5 xl:gap-1 max-w-full overflow-x-auto scrollbar-none">
              {pillars.map((pillar) => {
                const PillarIcon = PILLAR_ICON_MAP[pillar.id] || UserCheck;
                const isPillarActive = pillar.itemIds.includes(currentTab);
                const isDropdownOpen = activeDropdownPillarId === pillar.id;
                const hasSubItems = pillar.items.length > 1;
                const hasChatAlert =
                  (pillar.id === 'pillar_chat' || pillar.defaultTab === 'messages') && directChatUnreadCount > 0;

                return (
                  <div
                    key={pillar.id}
                    className="relative shrink-0"
                    onMouseEnter={() => hasSubItems && setActiveDropdownPillarId(pillar.id)}
                    onMouseLeave={() => setActiveDropdownPillarId(null)}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectTab(pillar.defaultTab)}
                      className={`inline-flex items-center gap-1 xl:gap-1.5 px-2.5 py-1.5 xl:px-3 rounded-xl text-[11px] xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap select-none ${
                        isPillarActive
                          ? 'bg-slate-900 text-white shadow-xs font-black'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-white/90'
                      }`}
                      title={`${pillar.labelBn} বিভাগ খুলুন`}
                    >
                      <PillarIcon
                        className={`w-3.5 h-3.5 ${
                          isPillarActive ? 'text-amber-400' : pillar.color
                        } shrink-0`}
                      />
                      <span>{pillar.labelBn}</span>
                      {hasChatAlert && (
                        <span className="min-w-[15px] h-[15px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                          {directChatUnreadCount}
                        </span>
                      )}
                      {hasSubItems && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownPillarId(isDropdownOpen ? null : pillar.id);
                          }}
                          className={`p-0.5 rounded transition ${
                            isPillarActive ? 'text-amber-300' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title="উপ-অপশনসমূহ দেখুন"
                        >
                          <ChevronDown
                            className={`w-3 h-3 transition-transform duration-200 ${
                              isDropdownOpen ? 'rotate-180 text-amber-400' : ''
                            }`}
                          />
                        </span>
                      )}
                    </button>

                    {/* Clean Floating Sub-Items Dropdown */}
                    {hasSubItems && isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-50 animate-fade-in space-y-0.5">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          {pillar.labelBn} বিভাগ
                        </div>
                        {pillar.items.map((subItem) => {
                          const isSubActive = currentTab === subItem.id;
                          const subIconConfig = ITEM_ICON_MAP[subItem.id] || {
                            icon: ChevronRight,
                            color: 'text-slate-600',
                          };
                          const SubIcon = subIconConfig.icon;

                          return (
                            <button
                              key={subItem.id}
                              type="button"
                              onClick={() => {
                                handleSelectTab(subItem.id);
                                setActiveDropdownPillarId(null);
                              }}
                              className={`w-full flex items-start gap-2.5 px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                                isSubActive
                                  ? 'bg-emerald-50 text-emerald-950 font-black border border-emerald-200'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                  isSubActive
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-slate-100 ' + subIconConfig.color
                                }`}
                              >
                                <SubIcon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold truncate">
                                  {subItem.labelBn}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {subItem.descriptionBn}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Right Header Controls with Safe Left Boundary */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-3 lg:pr-1 lg:pl-5 border-l border-slate-200/80">
            <PWAInstallButton
              onOpenMobileModal={onOpenMobileModal}
              isMobilePreview={isMobilePreview}
              square
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all shadow-2xs shrink-0 relative group cursor-pointer"
            />

            {/* School Theme Toggle */}
            <button
              type="button"
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              aria-label="স্কুল থিম"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 transition-all shadow-2xs shrink-0 relative group cursor-pointer"
              title="স্কুল থিম ও ব্র্যান্ড কালার"
            >
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-700" />
              <span
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow-2xs"
                style={{ backgroundColor: activeThemeColor }}
              />
            </button>

            {/* FCM Alert Bell */}
            <button
              type="button"
              onClick={onOpenNotifications}
              aria-label="FCM অ্যালার্ট"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-amber-50 hover:bg-amber-100 border border-amber-300 text-slate-800 transition-all shadow-2xs shrink-0 relative group cursor-pointer"
              title="FCM অ্যালার্ট ও নোটিফিকেশন"
            >
              <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-black bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              aria-label="লগআউট"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-all shadow-2xs shrink-0 relative group cursor-pointer"
              title="লগআউট"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Responsive Compact 6-Pillar Row for Tablet & Mobile (<lg) */}
        <nav
          aria-label="মোবাইল স্তম্ভ মেনু"
          className={`${
            isMobilePreview ? 'flex' : 'flex lg:hidden'
          } w-full items-center justify-around px-2 py-1 bg-slate-50 border-t border-slate-200/80 overflow-x-auto`}
        >
          {pillars.map((pillar) => {
            const PillarIcon = PILLAR_ICON_MAP[pillar.id] || UserCheck;
            const isPillarActive = pillar.itemIds.includes(currentTab);
            const hasChatAlert =
              (pillar.id === 'pillar_chat' || pillar.defaultTab === 'messages') && directChatUnreadCount > 0;

            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => handleSelectTab(pillar.defaultTab)}
                className={`flex-1 py-1 px-1 rounded-lg text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer min-w-[55px] ${
                  isPillarActive
                    ? 'bg-slate-900 text-white font-black shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={pillar.labelBn}
              >
                <div className="relative">
                  <PillarIcon
                    className={`w-3.5 h-3.5 ${
                      isPillarActive ? 'text-amber-400' : pillar.color
                    }`}
                  />
                  {hasChatAlert && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  )}
                </div>
                <span className="text-[10px] leading-tight truncate">
                  {pillar.shortLabelBn}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Side Menu Drawer for Mobile / Tablet */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSideMenuOpen(false)}
          />

          <div className="relative ml-0 mr-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            {/* Header */}
            <div className={`p-4 ${topStripBg} text-white space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white p-0.5 overflow-hidden">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm">আনন্দ পাঠশালা</h3>
                    <span className="text-[10px] text-amber-200 font-bold block">
                      {portalLabelBn}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSideMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white"
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

            {/* Hierarchical Grouped Pillar List in Drawer */}
            <div className="p-3 space-y-4 flex-1 overflow-y-auto">
              {pillars.map((pillar) => {
                const PillarIcon = PILLAR_ICON_MAP[pillar.id] || UserCheck;
                const isPillarActive = pillar.itemIds.includes(currentTab);

                return (
                  <div key={pillar.id} className="space-y-1">
                    {/* Pillar Title */}
                    <div className="flex items-center gap-2 px-2 py-1 text-xs font-black text-slate-800 bg-slate-50 rounded-lg border border-slate-100">
                      <PillarIcon className={`w-3.5 h-3.5 ${pillar.color}`} />
                      <span>{pillar.labelBn}</span>
                    </div>

                    {/* Sub-Items */}
                    <div className="space-y-0.5 pl-2">
                      {pillar.items.map((item) => {
                        const isSubActive = currentTab === item.id;
                        const subConfig = ITEM_ICON_MAP[item.id] || {
                          icon: ChevronRight,
                          color: 'text-slate-600',
                        };
                        const SubIcon = subConfig.icon;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectTab(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                              isSubActive
                                ? 'bg-slate-900 text-white font-bold shadow-xs'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <SubIcon
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isSubActive ? 'text-amber-400' : subConfig.color
                                }`}
                              />
                              <span className="truncate">{item.labelBn}</span>
                              {item.id === 'messages' && directChatUnreadCount > 0 && (
                                <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                                  {directChatUnreadCount}
                                </span>
                              )}
                            </div>
                            <ChevronRight
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSubActive ? 'text-amber-300' : 'text-slate-400'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
              <button
                type="button"
                onClick={() => {
                  handleSelectTab('public');
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                <span>পাবলিক ওয়েবসাইটে যান</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Picker Modal */}
      {isThemeMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-purple-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-700" />
                <h3 className="font-bold text-sm text-slate-900">স্কুল থিম কালার</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsThemeMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PRESET_SCHOOL_THEMES.map((theme) => {
                const isSelected = activeThemeColor === theme.color;
                return (
                  <button
                    key={theme.color}
                    type="button"
                    onClick={() => {
                      applySchoolTheme(theme.color);
                      setActiveThemeColor(theme.color);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 text-purple-950 shadow-xs'
                        : 'border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 border border-black/20"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="truncate">{theme.nameBn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
