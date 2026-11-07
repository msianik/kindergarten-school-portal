import React, { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';
import { LeadershipProfiles } from '../../types/school';

interface EditLeaderProfileModalProps {
  leaderKey: 'principal' | 'headTeacher' | null;
  onClose: () => void;
  leadershipProfiles: LeadershipProfiles;
  onSave: (
    updated: LeadershipProfiles,
    leaderKey: 'principal' | 'headTeacher'
  ) => void;
}

export const EditLeaderProfileModal: React.FC<EditLeaderProfileModalProps> = ({
  leaderKey,
  onClose,
  leadershipProfiles,
  onSave,
}) => {
  const [leaderFormNameBn, setLeaderFormNameBn] = useState('');
  const [leaderFormNameEn, setLeaderFormNameEn] = useState('');
  const [leaderFormRoleBn, setLeaderFormRoleBn] = useState('');
  const [leaderFormQuoteBn, setLeaderFormQuoteBn] = useState('');
  const [leaderFormQuoteEn, setLeaderFormQuoteEn] = useState('');
  const [leaderFormPhotoUrl, setLeaderFormPhotoUrl] = useState('');

  useEffect(() => {
    if (leaderKey) {
      const target = leadershipProfiles[leaderKey];
      setLeaderFormNameBn(target.nameBn);
      setLeaderFormNameEn(target.nameEn);
      setLeaderFormRoleBn(target.roleBn);
      setLeaderFormQuoteBn(target.quoteBn);
      setLeaderFormQuoteEn(target.quoteEn || '');
      setLeaderFormPhotoUrl(target.photoUrl);
    }
  }, [leaderKey, leadershipProfiles]);

  if (!leaderKey) return null;

  const handleLeaderPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLeaderFormPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLeaderProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderKey || !leaderFormNameBn.trim()) return;

    const updated = {
      ...leadershipProfiles,
      [leaderKey]: {
        ...leadershipProfiles[leaderKey],
        nameBn: leaderFormNameBn.trim(),
        nameEn: leaderFormNameEn.trim(),
        roleBn: leaderFormRoleBn.trim(),
        quoteBn: leaderFormQuoteBn.trim(),
        quoteEn: leaderFormQuoteEn.trim(),
        photoUrl:
          leaderFormPhotoUrl.trim() || leadershipProfiles[leaderKey].photoUrl,
      },
    };
    onSave(updated, leaderKey);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-8 max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase border border-amber-200">
              👑 প্রশাসনিক প্রোফাইল এডিটর
            </span>
            <h4 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-600" />
              <span>
                {leaderKey === 'principal'
                  ? 'প্রিন্সিপাল (শাফী আব্দুল্লাহ)'
                  : 'প্রধান শিক্ষক (ফাতেমা আক্তার)'}{' '}
                এর বাণী ও তথ্য পরিবর্তন
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              ড্যাশবোর্ড ও ওয়েবসাইটে প্রদর্শিত অফিসিয়াল বাণী, পরিচিতি ও ছবি আপডেট করুন
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

        {/* Form */}
        <form onSubmit={handleSaveLeaderProfile} className="space-y-4 text-xs">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">নাম (বাংলা) *</label>
              <input
                type="text"
                required
                value={leaderFormNameBn}
                onChange={(e) => setLeaderFormNameBn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">নাম (English)</label>
              <input
                type="text"
                value={leaderFormNameEn}
                onChange={(e) => setLeaderFormNameEn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">পদবি ও দায়িত্ব (Role)</label>
            <input
              type="text"
              value={leaderFormRoleBn}
              onChange={(e) => setLeaderFormRoleBn(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Quote in Bengali */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              অফিসিয়াল বাণী (বাংলা Message) *
            </label>
            <textarea
              rows={4}
              required
              value={leaderFormQuoteBn}
              onChange={(e) => setLeaderFormQuoteBn(e.target.value)}
              placeholder="বিদ্যালয়ের দর্শন ও শিশুদের উদ্দেশ্যে মমতাময়ী অনুপ্রেরণামূলক বার্তা..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 leading-relaxed font-medium"
            />
          </div>

          {/* Quote in English */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              Message in English (ঐচ্ছিক)
            </label>
            <textarea
              rows={3}
              value={leaderFormQuoteEn}
              onChange={(e) => setLeaderFormQuoteEn(e.target.value)}
              placeholder="English inspirational message for institutional summary..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          {/* Photo Upload & URL */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="font-bold text-slate-800 block">প্রোফাইল ছবি পরিবর্তন</label>
            <div className="flex items-center gap-3">
              {leaderFormPhotoUrl && (
                <img
                  src={leaderFormPhotoUrl}
                  alt="ছবি প্রিভিউ"
                  referrerPolicy="no-referrer"
                  className="w-14 h-16 rounded-xl object-cover border-2 border-amber-500 bg-white shrink-0"
                />
              )}
              <div className="space-y-1.5 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLeaderPhotoUpload}
                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white cursor-pointer"
                />
                <input
                  type="text"
                  value={leaderFormPhotoUrl}
                  onChange={(e) => setLeaderFormPhotoUrl(e.target.value)}
                  placeholder="বা ছবির URL লিখুন..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>বাণী ও প্রোফাইল সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
