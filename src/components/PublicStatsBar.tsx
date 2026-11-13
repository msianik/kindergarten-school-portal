import React from 'react';
import { Users, GraduationCap, ShieldCheck, Award, Sparkles, HeartHandshake } from 'lucide-react';

interface StatItem {
  id: string;
  icon: React.ReactNode;
  valueBn: string;
  labelBn: string;
  sublabelBn: string;
  gradient: string;
  borderColor: string;
}

export const PublicStatsBar: React.FC = () => {
  const stats: StatItem[] = [
    {
      id: 'students',
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      valueBn: '২৫০+',
      labelBn: 'আনন্দিত শিক্ষার্থী',
      sublabelBn: 'হাতেখড়ি থেকে ২য় শ্রেণি পর্যন্ত',
      gradient: 'from-emerald-50 to-teal-50/50',
      borderColor: 'border-emerald-200/80',
    },
    {
      id: 'teachers',
      icon: <GraduationCap className="w-5 h-5 text-sky-600" />,
      valueBn: '১৮+',
      labelBn: 'স্নেহশীল ও দক্ষ শিক্ষক',
      sublabelBn: 'আধুনিক মন্টেসরি প্রশিক্ষিত',
      gradient: 'from-sky-50 to-blue-50/50',
      borderColor: 'border-sky-200/80',
    },
    {
      id: 'safety',
      icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
      valueBn: '১০০%',
      labelBn: 'নিরাপদ ডিজিটাল গেট-পাস',
      sublabelBn: 'ভেরিফাইড অভিভাবক হস্তান্তর',
      gradient: 'from-amber-50 to-orange-50/50',
      borderColor: 'border-amber-200/80',
    },
    {
      id: 'ratio',
      icon: <HeartHandshake className="w-5 h-5 text-purple-600" />,
      valueBn: '১ : ১৫',
      labelBn: 'শিক্ষক-শিক্ষার্থী অনুপাত',
      sublabelBn: 'প্রতিটি শিশুর প্রতি নিবিড় যত্ন',
      gradient: 'from-purple-50 to-pink-50/50',
      borderColor: 'border-purple-200/80',
    },
    {
      id: 'classes',
      icon: <Award className="w-5 h-5 text-teal-600" />,
      valueBn: '৬টি',
      labelBn: 'শ্রেণি কার্যক্রম',
      sublabelBn: '২.৫+ বছর বয়স থেকে শুরু',
      gradient: 'from-teal-50 to-cyan-50/50',
      borderColor: 'border-teal-200/80',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
        <span className="text-xs font-bold text-slate-700 tracking-wide">
          এক নজরে আনন্দ পাঠশালা কুষ্টিয়া · লাইভ পরিসংখ্যান
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((st) => (
          <div
            key={st.id}
            className={`bg-gradient-to-br ${st.gradient} border ${st.borderColor} rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between group cursor-default`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-white shadow-2xs border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                {st.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-500 font-mono">
                ২০২৬–২৭
              </span>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                {st.valueBn}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">
                {st.labelBn}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 leading-tight line-clamp-1">
                {st.sublabelBn}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
