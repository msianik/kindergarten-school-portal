import React from 'react';
import { UserRole } from '../types/school';
import {
  Users,
  IdCard,
  HeartPulse,
  Clock,
  CalendarDays,
  FileCheck2,
  Award,
  CalendarCheck,
  ShieldCheck,
  BookOpen,
  MessageSquare,
  Megaphone,
  CreditCard,
  Package,
  Cloud,
  ChevronRight,
} from 'lucide-react';

interface ModuleSubNavPillsProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentRole?: UserRole;
  className?: string;
}

interface SubNavGroup {
  id: string;
  categoryLabelBn: string;
  categoryIcon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  tabs: {
    id: string;
    labelBn: string;
    icon: React.ComponentType<{ className?: string }>;
    descriptionBn: string;
  }[];
}

const SUB_NAV_GROUPS: SubNavGroup[] = [
  {
    id: 'students_group',
    categoryLabelBn: 'শিক্ষার্থী ও পরিবার',
    categoryIcon: Users,
    accentColor: 'amber',
    tabs: [
      { id: 'students', labelBn: 'শিক্ষার্থী তালিকা', icon: Users, descriptionBn: 'ক্লাস ভিত্তিক ছাত্র-ছাত্রীর তালিকা ও তথ্য' },
      { id: 'idcards', labelBn: 'স্মার্ট আইডি কার্ড', icon: IdCard, descriptionBn: 'ডাইনামিক কিউআর আইডি কার্ড জেনারেটর' },
      { id: 'health', labelBn: 'স্বাস্থ্য ও অ্যালার্জি', icon: HeartPulse, descriptionBn: 'শিশুর উচ্চতা, ওজন, BMI ও অ্যালার্জি ট্র্যাকার' },
    ],
  },
  {
    id: 'academics_group',
    categoryLabelBn: 'একাডেমিক বিভাগ',
    categoryIcon: BookOpen,
    accentColor: 'indigo',
    tabs: [
      { id: 'routine', labelBn: 'ক্লাস রুটিন', icon: Clock, descriptionBn: 'ক্লাস ভিত্তিক সাপ্তাহিক পিরিয়ড ও সময়সূচি' },
      { id: 'calendar', labelBn: 'অ্যাকাডেমিক ক্যালেন্ডার', icon: CalendarDays, descriptionBn: 'স্কুল ইভেন্ট, পরীক্ষা ও ছুটির দিনপঞ্জি' },
      { id: 'results', labelBn: 'ফলাফল ও মার্কশিট', icon: FileCheck2, descriptionBn: 'টার্ম পরীক্ষা, নম্বর ও প্রিন্ট-রেডি রিপোর্ট কার্ড' },
      { id: 'skills', labelBn: 'হোলিস্টিক স্কিল কার্ড', icon: Award, descriptionBn: 'আচরণ ও মেধা পর্যবেক্ষণ প্রগ্রেস কার্ড' },
    ],
  },
  {
    id: 'operations_group',
    categoryLabelBn: 'দৈনিক স্কুল পরিচালনা',
    categoryIcon: CalendarCheck,
    accentColor: 'teal',
    tabs: [
      { id: 'attendance', labelBn: 'দৈনিক হাজিরা', icon: CalendarCheck, descriptionBn: 'ডিজিটাল ক্লাসরুম হাজিরা ও SMS' },
      { id: 'pickup', labelBn: 'গেট-পাস ও পিক-আপ', icon: ShieldCheck, descriptionBn: 'কিউআর ভেরিফিকেশন ও নিরাপদ স্কুল প্রস্থান' },
      { id: 'diary', labelBn: 'ডিজিটাল ডায়েরি', icon: BookOpen, descriptionBn: 'আজকের ক্লাসের কাজ, টিফিন ও হোমওয়ার্ক' },
    ],
  },
  {
    id: 'finance_group',
    categoryLabelBn: 'হিসাব ও সম্পদ',
    categoryIcon: CreditCard,
    accentColor: 'emerald',
    tabs: [
      { id: 'fees', labelBn: 'বেতন ও ৩-পার্ট ভাউচার', icon: CreditCard, descriptionBn: 'টিউশন ফি, ইনভয়েস ও ৩-পার্ট ক্যাশ ভাউচার' },
      { id: 'inventory', labelBn: 'স্কুল অ্যাসেট ও উপকরণ', icon: Package, descriptionBn: 'মন্টেসরি উপকরণ ও সরঞ্জাম ইনভেন্টরি ট্র্যাকার' },
      { id: 'workspace', labelBn: 'গুগল ড্রাইভ ক্লাউড', icon: Cloud, descriptionBn: 'Google Drive, Sheets ও ক্লাউড ওয়ার্কস্পেস' },
    ],
  },
];

export const ModuleSubNavPills: React.FC<ModuleSubNavPillsProps> = ({
  currentTab,
  onSelectTab,
  className = '',
}) => {
  // Find which group contains this tab
  const activeGroup = SUB_NAV_GROUPS.find((group) =>
    group.tabs.some((t) => t.id === currentTab)
  );

  if (!activeGroup) return null;

  const CategoryIcon = activeGroup.categoryIcon;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all print:hidden ${className}`}
      aria-label="মডিউল সাব-ন্যাভিগেশন"
    >
      {/* Category Indicator */}
      <div className="flex items-center gap-2 shrink-0 px-2 py-1 bg-slate-50 rounded-xl border border-slate-200/60">
        <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
          <CategoryIcon className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
          <span>{activeGroup.categoryLabelBn}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Sibling Tabs Pills */}
      <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0 sm:justify-end">
        {activeGroup.tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = tab.id === currentTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs font-black'
                  : 'bg-slate-100 hover:bg-slate-200/90 text-slate-700 hover:text-slate-900'
              }`}
              title={tab.descriptionBn}
            >
              <TabIcon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-amber-400' : 'text-slate-500'
                }`}
              />
              <span>{tab.labelBn}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
