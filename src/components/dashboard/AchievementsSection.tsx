import React, { useState } from 'react';
import {
  Trophy,
  GraduationCap,
  Flag,
  Medal,
  Star,
  Ribbon,
  Award,
  Calendar,
  BadgeCheck,
  Eye,
  Trash2,
  Sparkles,
  Plus,
  Search,
} from 'lucide-react';
import {
  Achievement,
  AchievementBadge,
  AchievementCategory,
} from '../../types/school';

interface AchievementsSectionProps {
  achievements: Achievement[];
  isPrincipal: boolean;
  onOpenAddAchievement: () => void;
  onSelectAchievementDetail: (achievement: Achievement) => void;
  onToggleFeatured: (id: string) => void;
  onDeleteAchievement: (id: string, titleBn: string) => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
  isPrincipal,
  onOpenAddAchievement,
  onSelectAchievementDetail,
  onToggleFeatured,
  onDeleteAchievement,
}) => {
  const [selectedAchievementCategory, setSelectedAchievementCategory] =
    useState<string>('all');
  const [achievementSearchQuery, setAchievementSearchQuery] =
    useState<string>('');

  const studentAwardsCount = achievements.filter(
    (a) => a.category === 'student_award'
  ).length;
  const milestonesCount = achievements.filter(
    (a) => a.category === 'milestone'
  ).length;
  const academicAchievementsCount = achievements.filter(
    (a) => a.category === 'academic'
  ).length;
  const sportsCulturalCount = achievements.filter(
    (a) => a.category === 'sports' || a.category === 'cultural'
  ).length;

  const renderBadgeVisual = (badgeType: AchievementBadge, size = 'w-5 h-5') => {
    switch (badgeType) {
      case 'gold_trophy':
        return <Trophy className={`${size} text-amber-500`} />;
      case 'medal':
        return <Medal className={`${size} text-yellow-600`} />;
      case 'star_award':
        return <Star className={`${size} text-amber-400 fill-amber-400`} />;
      case 'ribbon':
        return <Ribbon className={`${size} text-rose-500`} />;
      case 'milestone_flag':
        return <Flag className={`${size} text-emerald-600`} />;
      case 'certificate':
      default:
        return <Award className={`${size} text-indigo-600`} />;
    }
  };

  const getBadgeMeta = (badgeType: AchievementBadge) => {
    switch (badgeType) {
      case 'gold_trophy':
        return {
          labelBn: 'চ্যাম্পিয়ন ট্রফি',
          color: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'medal':
        return {
          labelBn: 'মেধাবী পদক',
          color: 'bg-yellow-100 text-yellow-900 border-yellow-300',
        };
      case 'star_award':
        return {
          labelBn: 'স্টার সম্মাননা',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'ribbon':
        return {
          labelBn: 'বিশেষ স্বীকৃতি রিবন',
          color: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      case 'milestone_flag':
        return {
          labelBn: 'প্রাতিষ্ঠানিক মাইলফলক',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'certificate':
      default:
        return {
          labelBn: 'বিশেষ মানপত্র',
          color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
    }
  };

  const getCategoryMeta = (cat: AchievementCategory) => {
    switch (cat) {
      case 'student_award':
        return {
          labelBn: 'শিক্ষার্থী পুরস্কার',
          tagColor: 'bg-amber-100 text-amber-900',
          icon: '🎓',
        };
      case 'milestone':
        return {
          labelBn: 'প্রাতিষ্ঠানিক মাইলফলক',
          tagColor: 'bg-emerald-100 text-emerald-900',
          icon: '🚩',
        };
      case 'academic':
        return {
          labelBn: 'অ্যাকাডেমিক কৃতিত্ব',
          tagColor: 'bg-blue-100 text-blue-900',
          icon: '📚',
        };
      case 'sports':
        return {
          labelBn: 'ক্রীড়া ও খেলাধুলা',
          tagColor: 'bg-teal-100 text-teal-900',
          icon: '🏃',
        };
      case 'cultural':
        return {
          labelBn: 'সাংস্কৃতিক ও আর্ট',
          tagColor: 'bg-purple-100 text-purple-900',
          icon: '🎨',
        };
      default:
        return {
          labelBn: 'অর্জন',
          tagColor: 'bg-slate-100 text-slate-900',
          icon: '🏆',
        };
    }
  };

  // Filtered achievements
  const filteredAchievements = achievements.filter((item) => {
    const matchesCategory =
      selectedAchievementCategory === 'all' ||
      item.category === selectedAchievementCategory;

    if (!achievementSearchQuery.trim()) return matchesCategory;

    const q = achievementSearchQuery.toLowerCase().trim();
    const matchesSearch =
      item.titleBn.toLowerCase().includes(q) ||
      (item.titleEn && item.titleEn.toLowerCase().includes(q)) ||
      item.recipientNameBn.toLowerCase().includes(q) ||
      item.awardTitleBn.toLowerCase().includes(q) ||
      item.dateBn.toLowerCase().includes(q) ||
      item.dateStamp.includes(q) ||
      item.descriptionBn.toLowerCase().includes(q) ||
      item.awardedByBn.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="bg-white rounded-3xl border border-amber-200 shadow-xs overflow-hidden p-6 sm:p-7 space-y-6 print:hidden">
      {/* Section Header with Principal Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>আনন্দ পাঠশালা সম্মাননা গ্যালারি</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              অফিশিয়াল মাইলফলক ও পুরস্কার রেকর্ড
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <span>কৃতিত্ব ও অর্জনসমূহ</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 hidden sm:inline">
              (Achievements & Milestones)
            </span>
          </h3>
          <p className="text-xs text-slate-600 max-w-2xl">
            বিদ্যালয়ের গৌরবময় মাইলফলক, শিক্ষার্থীদের জাতীয় ও স্থানীয় প্রতিযোগিতা জয়, শতভাগ উপস্থিতি মেডেল ও বিশেষ সম্মাননার তারিখভিত্তিক স্মারক
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {isPrincipal ? (
            <button
              type="button"
              onClick={onOpenAddAchievement}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white rounded-2xl text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>নতুন অর্জন / মাইলফলক যোগ করুন</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-semibold">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              <span>অধ্যক্ষ কর্তৃক প্রত্যয়িত রেকর্ড</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Quick Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-[11px] font-bold">মোট গৌরবময় অর্জন</span>
            <Trophy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {achievements.length}{' '}
            <span className="text-xs font-normal text-slate-500">টি</span>
          </div>
          <span className="text-[10px] text-amber-700 block mt-0.5 font-medium">
            প্রতিষ্ঠাতা ও অধ্যক্ষ কর্তৃক অনুমোদিত
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-200">
          <div className="flex items-center justify-between text-indigo-800 mb-1">
            <span className="text-[11px] font-bold">শিক্ষার্থী সম্মাননা ও ট্রফি</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {studentAwardsCount}{' '}
            <span className="text-xs font-normal text-slate-500">জন</span>
          </div>
          <span className="text-[10px] text-indigo-700 block mt-0.5 font-medium">
            আর্ট, মেধা, উপস্থিতি ও সদাচরণ
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-bold">প্রাতিষ্ঠানিক মাইলফলক</span>
            <Flag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {milestonesCount}{' '}
            <span className="text-xs font-normal text-slate-500">টি</span>
          </div>
          <span className="text-[10px] text-emerald-700 block mt-0.5 font-medium">
            ক্যাম্পাস ও শিক্ষা পরিকাঠামো
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50/50 border border-rose-200">
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-[11px] font-bold">ক্রীড়া ও সাংস্কৃতিক পুরস্কার</span>
            <Medal className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {academicAchievementsCount + sportsCulturalCount}{' '}
            <span className="text-xs font-normal text-slate-500">টি</span>
          </div>
          <span className="text-[10px] text-rose-700 block mt-0.5 font-medium">
            অলিম্পিয়াড, ছড়া গান ও দৌড়
          </span>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Category Filter Pills */}
        <div className="flex items-center flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedAchievementCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedAchievementCategory === 'all'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            সব অর্জন ({achievements.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedAchievementCategory('student_award')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              selectedAchievementCategory === 'student_award'
                ? 'bg-amber-600 text-white shadow-2xs font-bold'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
            }`}
          >
            <span>🎓 শিক্ষার্থী পুরস্কার</span>
            <span className="text-[10px] opacity-80 font-mono">
              ({studentAwardsCount})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedAchievementCategory('milestone')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              selectedAchievementCategory === 'milestone'
                ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900'
            }`}
          >
            <span>🚩 প্রাতিষ্ঠানিক মাইলফলক</span>
            <span className="text-[10px] opacity-80 font-mono">
              ({milestonesCount})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedAchievementCategory('academic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              selectedAchievementCategory === 'academic'
                ? 'bg-blue-600 text-white shadow-2xs font-bold'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-900'
            }`}
          >
            <span>📚 অ্যাকাডেমিক</span>
            <span className="text-[10px] opacity-80 font-mono">
              ({academicAchievementsCount})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedAchievementCategory('sports')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              selectedAchievementCategory === 'sports'
                ? 'bg-teal-700 text-white shadow-2xs font-bold'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-900'
            }`}
          >
            <span>🏃 ক্রীড়া ও সহপাঠ্য</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={achievementSearchQuery}
            onChange={(e) => setAchievementSearchQuery(e.target.value)}
            placeholder="শিক্ষার্থী, পুরস্কার বা তারিখ দিয়ে খুঁজুন..."
            className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
          />
          {achievementSearchQuery && (
            <button
              type="button"
              onClick={() => setAchievementSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Achievement Cards Display Grid */}
      {filteredAchievements.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 space-y-3">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">
            কোনো অর্জন বা পুরস্কার পাওয়া যায়নি
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            অনুগ্রহ করে সার্চ কিওয়ার্ড পরিবর্তন করুন অথবা ফিল্টার রিসেট করুন।
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedAchievementCategory('all');
              setAchievementSearchQuery('');
            }}
            className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAchievements.map((item) => {
            const catMeta = getCategoryMeta(item.category);
            const badgeMeta = getBadgeMeta(item.badgeType);

            return (
              <div
                key={item.id}
                className={`group relative rounded-2xl border bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden ${
                  item.featured
                    ? 'border-amber-300 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                {/* Top Decorative Color Accent Bar */}
                <div
                  className={`h-1.5 w-full ${
                    item.category === 'student_award'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                      : item.category === 'milestone'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                      : item.category === 'academic'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                      : 'bg-gradient-to-r from-purple-500 to-pink-600'
                  }`}
                />

                <div className="p-5 space-y-4 flex-1 flex flex-col">
                  {/* Header Row: Category Badge + Date Stamp */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${catMeta.tagColor}`}
                      >
                        <span>{catMeta.icon}</span>
                        <span>{catMeta.labelBn}</span>
                      </span>
                      {item.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                          <Star className="w-3 h-3 fill-slate-950" />
                          <span>ফিচার্ড</span>
                        </span>
                      )}
                    </div>

                    {/* Prominent Date Stamp */}
                    <div
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg shrink-0"
                      title={`তারিখ স্ট্যাম্প: ${item.dateStamp}`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{item.dateBn}</span>
                    </div>
                  </div>

                  {/* Recipient Profile & Award Name Banner */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-11 h-11 rounded-xl bg-white shadow-2xs border border-amber-200 flex items-center justify-center shrink-0">
                      {renderBadgeVisual(item.badgeType, 'w-6 h-6')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                        প্রাপক / সম্মানিত পক্ষ
                      </span>
                      <h4 className="text-sm font-black text-slate-900 truncate">
                        {item.recipientNameBn}
                      </h4>
                      <span className="text-xs font-bold text-emerald-800 block truncate mt-0.5">
                        {item.awardTitleBn}
                      </span>
                    </div>
                  </div>

                  {/* Photo / Trophy Visual Preview */}
                  {item.imageUrl && (
                    <div
                      onClick={() => onSelectAchievementDetail(item)}
                      className="relative h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group/img"
                      title="সনদপত্র ও বড় ছবি দেখতে ক্লিক করুন"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.titleBn}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          <span>সনদপত্র ও বিবরণ প্রিভিউ</span>
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${badgeMeta.color}`}
                        >
                          {badgeMeta.labelBn}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Main Title & Narrative Description */}
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-amber-800 transition-colors">
                      {item.titleBn}
                    </h4>
                    {item.titleEn && (
                      <p className="text-[11px] text-slate-400 font-medium leading-tight">
                        {item.titleEn}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 pt-1">
                      “{item.descriptionBn}”
                    </p>
                  </div>

                  {/* Awarded By & Authority Seal Stamp */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 truncate">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">স্বাক্ষরিত: {item.awardedByBn}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {item.dateStamp}
                    </span>
                  </div>
                </div>

                {/* Card Bottom Action Bar */}
                <div className="bg-slate-50/80 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectAchievementDetail(item)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    <span>সনদ ও বিস্তারিত</span>
                  </button>

                  {/* Principal Actions: Toggle Featured & Delete */}
                  {isPrincipal && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onToggleFeatured(item.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          item.featured
                            ? 'text-amber-600 bg-amber-100 hover:bg-amber-200'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                        }`}
                        title={
                          item.featured
                            ? 'ফিচার্ড স্ট্যাটাস প্রত্যাহার'
                            : 'ফিচার্ড হিসেবে চিহ্নিত করুন'
                        }
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            item.featured ? 'fill-amber-500' : ''
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onDeleteAchievement(item.id, item.titleBn)
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="মুছে ফেলুন (শুধুমাত্র প্রিন্সিপাল)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Motivational Footnote Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>আনন্দ পাঠশালার মূল দর্শন:</strong> প্রতিটি শিশুই সম্ভাবনাময় ও অদ্বিতীয়। নিয়মিত উপস্থিতি, সদাচরণ, ড্রয়িং ও যে কোনো ইতিবাচক অগ্রগতিকে আমরা আনুষ্ঠানিকভাবে স্বীকৃতি জানাই।
          </span>
        </div>
        {isPrincipal && (
          <button
            type="button"
            onClick={onOpenAddAchievement}
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer transition shadow-2xs"
          >
            + নতুন পুরস্কার যোগ
          </button>
        )}
      </div>
    </section>
  );
};
