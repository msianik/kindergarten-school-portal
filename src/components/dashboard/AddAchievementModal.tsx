import React, { useState } from 'react';
import { Trophy, Plus } from 'lucide-react';
import {
  Achievement,
  AchievementCategory,
  AchievementBadge,
  Student,
} from '../../types/school';

interface AddAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onAddAchievement: (newAch: Achievement) => void;
}

export const AddAchievementModal: React.FC<AddAchievementModalProps> = ({
  isOpen,
  onClose,
  students,
  onAddAchievement,
}) => {
  const [newAchTitleBn, setNewAchTitleBn] = useState('');
  const [newAchTitleEn, setNewAchTitleEn] = useState('');
  const [newAchCategory, setNewAchCategory] =
    useState<AchievementCategory>('student_award');
  const [newAchRecipientType, setNewAchRecipientType] = useState<
    'student' | 'class' | 'institution'
  >('student');
  const [newAchSelectedStudentId, setNewAchSelectedStudentId] =
    useState<string>('');
  const [newAchRecipientNameBn, setNewAchRecipientNameBn] = useState('');
  const [newAchAwardTitleBn, setNewAchAwardTitleBn] = useState('');
  const [newAchDateStamp, setNewAchDateStamp] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [newAchDateBn, setNewAchDateBn] = useState('');
  const [newAchDescriptionBn, setNewAchDescriptionBn] = useState('');
  const [newAchBadgeType, setNewAchBadgeType] =
    useState<AchievementBadge>('gold_trophy');
  const [newAchImageUrl, setNewAchImageUrl] = useState('/assets/fb/photo-2.jpg');
  const [newAchAwardedByBn, setNewAchAwardedByBn] = useState(
    'শাফী আব্দুল্লাহ (অধ্যক্ষ ও প্রতিষ্ঠাতা পরিচালক)'
  );
  const [newAchFeatured, setNewAchFeatured] = useState(false);

  if (!isOpen) return null;

  const formatIsoToBengaliDate = (isoStr: string): string => {
    if (!isoStr) return '';
    const bnMonths = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
    ];
    const toBn = (n: number | string) =>
      n.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
    try {
      const parts = isoStr.split('-');
      if (parts.length === 3) {
        const year = toBn(parts[0]);
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = toBn(parseInt(parts[2], 10));
        return `${day} ${bnMonths[monthIdx] || ''} ${year}`;
      }
      const d = new Date(isoStr);
      if (!isNaN(d.getTime())) {
        return `${toBn(d.getDate())} ${bnMonths[d.getMonth()]} ${toBn(d.getFullYear())}`;
      }
      return isoStr;
    } catch {
      return isoStr;
    }
  };

  const handleAchievementImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewAchImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAchievementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchTitleBn.trim() || !newAchAwardTitleBn.trim()) return;

    let finalRecipient = newAchRecipientNameBn.trim();
    if (!finalRecipient && newAchRecipientType === 'student' && newAchSelectedStudentId) {
      const std = students.find((s) => s.id === newAchSelectedStudentId);
      if (std) finalRecipient = `${std.nameBn} (শ্রেণি: ${std.className})`;
    }
    if (!finalRecipient) {
      finalRecipient =
        newAchRecipientType === 'institution'
          ? 'আনন্দ পাঠশালা ক্যাম্পাস পরিবার'
          : 'আনন্দ পাঠশালার শিক্ষার্থী';
    }

    const formattedDate =
      newAchDateBn.trim() || formatIsoToBengaliDate(newAchDateStamp);

    const newAchievement: Achievement = {
      id: `ach-custom-${Date.now()}`,
      titleBn: newAchTitleBn.trim(),
      titleEn: newAchTitleEn.trim() || undefined,
      category: newAchCategory,
      recipientType: newAchRecipientType,
      recipientNameBn: finalRecipient,
      awardTitleBn: newAchAwardTitleBn.trim(),
      dateStamp: newAchDateStamp || new Date().toISOString().slice(0, 10),
      dateBn: formattedDate,
      descriptionBn:
        newAchDescriptionBn.trim() ||
        'আনন্দ পাঠশালার গৌরবময় অর্জন ও কৃতি স্মারক।',
      badgeType: newAchBadgeType,
      imageUrl: newAchImageUrl.trim() || undefined,
      awardedByBn:
        newAchAwardedByBn.trim() ||
        'শাফী আব্দুল্লাহ (অধ্যক্ষ ও প্রতিষ্ঠাতা পরিচালক)',
      featured: newAchFeatured,
    };

    onAddAchievement(newAchievement);
    // Reset Form
    setNewAchTitleBn('');
    setNewAchTitleEn('');
    setNewAchRecipientNameBn('');
    setNewAchAwardTitleBn('');
    setNewAchDescriptionBn('');
    setNewAchSelectedStudentId('');
    setNewAchFeatured(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-8 max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase border border-amber-200">
              👑 অধ্যক্ষ কনসোল · অফিসিয়াল সম্মাননা
            </span>
            <h4 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span>নতুন অর্জন বা প্রাতিষ্ঠানিক মাইলফলক যোগ করুন</span>
            </h4>
            <p className="text-xs text-slate-500">
              শিক্ষার্থীদের মেধা সম্মাননা, পুরস্কার অথবা স্কুলের গুরুত্বপূর্ণ মাইলফলক তারিখসহ সংরক্ষণ করুন
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleCreateAchievementSubmit} className="space-y-4 text-xs">
          {/* Category & Badge Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                অর্জনের ক্যাটাগরি (Category) *
              </label>
              <select
                value={newAchCategory}
                onChange={(e) => setNewAchCategory(e.target.value as AchievementCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="student_award">🎓 শিক্ষার্থী পুরস্কার (Student Award)</option>
                <option value="milestone">🚩 প্রাতিষ্ঠানিক মাইলফলক (School Milestone)</option>
                <option value="academic">📚 অ্যাকাডেমিক কৃতিত্ব ও মেধা (Academic)</option>
                <option value="sports">🏃 ক্রীড়া ও খেলাধুলা (Sports)</option>
                <option value="cultural">🎨 সাংস্কৃতিক, আর্ট ও আবৃত্তি (Cultural)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                সম্মাননা প্রতীক / ব্যাজ (Badge Type) *
              </label>
              <select
                value={newAchBadgeType}
                onChange={(e) => setNewAchBadgeType(e.target.value as AchievementBadge)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="gold_trophy">🏆 গোল্ড ট্রফি (Gold Trophy)</option>
                <option value="medal">🥇 মেডেল / পদক (Medal)</option>
                <option value="star_award">⭐ স্টার সম্মাননা (Star Award)</option>
                <option value="ribbon">🎖️ বিশেষ স্বীকৃতি রিবন (Ribbon)</option>
                <option value="milestone_flag">🚩 মাইলফলক স্মারক (Milestone Flag)</option>
                <option value="certificate">📜 বিশেষ সনদপত্র (Certificate)</option>
              </select>
            </div>
          </div>

          {/* Title in Bengali & English */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              অর্জনের শিরোনাম (বাংলা) *
            </label>
            <input
              type="text"
              required
              value={newAchTitleBn}
              onChange={(e) => setNewAchTitleBn(e.target.value)}
              placeholder="যেমন: জেলা শিশু চিত্রাঙ্কন প্রতিযোগিতা ২০২৬ — ১ম স্থান ও চ্যাম্পিয়ন গোল্ড ট্রফি"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              ইংরেজি শিরোনাম (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={newAchTitleEn}
              onChange={(e) => setNewAchTitleEn(e.target.value)}
              placeholder="যেমন: District Children Art Competition 2026 - 1st Place Gold Trophy"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Recipient Setup */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">প্রাপক / সম্মানিত পক্ষ</span>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="recType"
                    checked={newAchRecipientType === 'student'}
                    onChange={() => setNewAchRecipientType('student')}
                  />
                  <span className="text-[11px] font-semibold text-slate-700">শিক্ষার্থী</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="recType"
                    checked={newAchRecipientType === 'class'}
                    onChange={() => setNewAchRecipientType('class')}
                  />
                  <span className="text-[11px] font-semibold text-slate-700">শ্রেণি / টিম</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="recType"
                    checked={newAchRecipientType === 'institution'}
                    onChange={() => setNewAchRecipientType('institution')}
                  />
                  <span className="text-[11px] font-semibold text-slate-700">বিদ্যালয়</span>
                </label>
              </div>
            </div>

            {newAchRecipientType === 'student' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">
                    নিবন্ধিত শিক্ষার্থী নির্বাচন করুন:
                  </label>
                  <select
                    value={newAchSelectedStudentId}
                    onChange={(e) => {
                      setNewAchSelectedStudentId(e.target.value);
                      const found = students.find((s) => s.id === e.target.value);
                      if (found) {
                        setNewAchRecipientNameBn(`${found.nameBn} (শ্রেণি: ${found.className})`);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- শিক্ষার্থী বেছে নিন --</option>
                    {students.map((std) => (
                      <option key={std.id} value={std.id}>
                        {std.nameBn} ({std.className} · রোল: {std.rollNo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">
                    বা সরাসরি নাম ও শ্রেণি লিখুন:
                  </label>
                  <input
                    type="text"
                    value={newAchRecipientNameBn}
                    onChange={(e) => setNewAchRecipientNameBn(e.target.value)}
                    placeholder="যেমন: আরিয়ান খান (শ্রেণি: কেজি-১)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                   শাখা, দল বা প্রাতিষ্ঠানিক নাম:
                </label>
                <input
                  type="text"
                  value={newAchRecipientNameBn}
                  onChange={(e) => setNewAchRecipientNameBn(e.target.value)}
                  placeholder={
                    newAchRecipientType === 'institution'
                      ? 'যেমন: আনন্দ পাঠশালা কুষ্টিয়া পরিবার'
                      : 'যেমন: কেজি-১ ও প্লে-গ্রুপ সম্মিলিত দল'
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-600 block mb-1">
                পুরস্কার / স্বীকৃতির উপাধি (Award Title) *
              </label>
              <input
                type="text"
                required
                value={newAchAwardTitleBn}
                onChange={(e) => setNewAchAwardTitleBn(e.target.value)}
                placeholder="যেমন: ১ম স্থান ও চ্যাম্পিয়ন গোল্ড ট্রফি / শতভাগ উপস্থিতি মেডেল"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Date Stamp Setup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                তারিখ স্ট্যাম্প (Date Stamp) *
              </label>
              <input
                type="date"
                required
                value={newAchDateStamp}
                onChange={(e) => {
                  setNewAchDateStamp(e.target.value);
                  setNewAchDateBn(formatIsoToBengaliDate(e.target.value));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono"
              />
              <span className="text-[10px] text-slate-500">ক্যালেন্ডার ও ফিল্টারিংয়ে ব্যবহারের জন্য</span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                বাংলা প্রদর্শনী তারিখ (Formatted Date)
              </label>
              <input
                type="text"
                value={newAchDateBn || formatIsoToBengaliDate(newAchDateStamp)}
                onChange={(e) => setNewAchDateBn(e.target.value)}
                placeholder="যেমন: ২৪ অক্টোবর ২০২৬"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-500">কার্ড ও সনদে এই তারিখ দৃশ্যমান হবে</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              বিস্তারিত বিবরণ ও সাইটেশন (Description & Citation)
            </label>
            <textarea
              rows={3}
              value={newAchDescriptionBn}
              onChange={(e) => setNewAchDescriptionBn(e.target.value)}
              placeholder="প্রতিযোগিতার বিষয়, শিশুর বিশেষ মেধা, অংশগ্রহণের প্রেক্ষাপট বা মাইলফলকের বিবরণ..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          {/* Photo Upload & Preset Thumbnails */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200">
            <label className="font-bold text-slate-800 block">
              ছবি বা সনদপত্রের ছবি (Image / Certificate Photo)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleAchievementImageUpload}
                className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white cursor-pointer"
              />
              {newAchImageUrl && (
                <img
                  src={newAchImageUrl}
                  alt="নির্বাচিত ছবি"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-amber-500 shrink-0"
                />
              )}
            </div>
            <div className="pt-1">
              <span className="text-[10px] text-slate-500 block mb-1.5 font-medium">
                অথবা ক্যাম্পাসের প্রিসেট ছবি থেকে নির্বাচন করুন:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  '/assets/fb/photo-1.jpg',
                  '/assets/fb/photo-2.jpg',
                  '/assets/fb/photo-3.jpg',
                  '/assets/fb/photo-4.jpg',
                  '/assets/fb/photo-5.jpg',
                  '/assets/fb/photo-6.jpg',
                ].map((presetUrl, idx) => (
                  <button
                    type="button"
                    key={presetUrl}
                    onClick={() => setNewAchImageUrl(presetUrl)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      newAchImageUrl === presetUrl ? 'border-amber-600 ring-2 ring-amber-400' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={presetUrl}
                      alt={`Preset ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Awarded By & Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                অনুমোদনকারী ও স্বাক্ষর (Awarded By)
              </label>
              <input
                type="text"
                value={newAchAwardedByBn}
                onChange={(e) => setNewAchAwardedByBn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-4">
              <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={newAchFeatured}
                  onChange={(e) => setNewAchFeatured(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-800">
                  ⭐ বিশেষ অর্জন হিসেবে ফিচার্ড করুন
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>অর্জন সংরক্ষণ ও প্রকাশ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
