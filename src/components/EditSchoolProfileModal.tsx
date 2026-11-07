import React, { useState, useEffect } from 'react';
import { SchoolProfile, LeadershipProfiles } from '../types/school';
import {
  X,
  CheckCircle2,
  Edit3,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  Upload,
  RefreshCw,
  Sparkles,
  School,
  Save,
  Eye,
  Info,
  ShieldCheck,
  Facebook,
  Palette,
} from 'lucide-react';
import { SCHOOL_PROFILE, PRINCIPAL_AND_DIRECTOR_PROFILES } from '../data/mockData';
import { SchoolThemeSettingsSection } from './SchoolThemeSettingsSection';
import {
  DEFAULT_THEME_COLOR,
  applySchoolTheme,
  getStoredThemeColor,
} from '../utils/themeManager';

interface EditSchoolProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'principal' | 'headTeacher' | 'contact' | 'theme';
  schoolProfile: SchoolProfile;
  onSaveSchoolProfile: (profile: SchoolProfile) => void;
  leadershipProfiles: LeadershipProfiles;
  onSaveLeadershipProfiles: (profiles: LeadershipProfiles) => void;
}

export const EditSchoolProfileModal: React.FC<EditSchoolProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'principal',
  schoolProfile,
  onSaveSchoolProfile,
  leadershipProfiles,
  onSaveLeadershipProfiles,
}) => {
  const [activeTab, setActiveTab] = useState<'principal' | 'headTeacher' | 'contact' | 'theme'>(initialTab);

  // Synchronize initialTab if changed
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Local Form States for Leadership Profiles
  const [principalNameBn, setPrincipalNameBn] = useState('');
  const [principalNameEn, setPrincipalNameEn] = useState('');
  const [principalRoleBn, setPrincipalRoleBn] = useState('');
  const [principalQuoteBn, setPrincipalQuoteBn] = useState('');
  const [principalQuoteEn, setPrincipalQuoteEn] = useState('');
  const [principalPhotoUrl, setPrincipalPhotoUrl] = useState('');

  const [headTeacherNameBn, setHeadTeacherNameBn] = useState('');
  const [headTeacherNameEn, setHeadTeacherNameEn] = useState('');
  const [headTeacherRoleBn, setHeadTeacherRoleBn] = useState('');
  const [headTeacherQuoteBn, setHeadTeacherQuoteBn] = useState('');
  const [headTeacherQuoteEn, setHeadTeacherQuoteEn] = useState('');
  const [headTeacherPhotoUrl, setHeadTeacherPhotoUrl] = useState('');

  // Local Form States for School Profile & Contact Info
  const [schoolNameBn, setSchoolNameBn] = useState('');
  const [schoolNameEn, setSchoolNameEn] = useState('');
  const [sloganBn, setSloganBn] = useState('');
  const [taglineBn, setTaglineBn] = useState('');
  const [classesBn, setClassesBn] = useState('');
  const [addressBn, setAddressBn] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [phoneBn, setPhoneBn] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [email, setEmail] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [followers, setFollowers] = useState('');
  const [visitingHoursBn, setVisitingHoursBn] = useState('');
  const [themeColor, setThemeColor] = useState<string>(() => schoolProfile.themeColor || getStoredThemeColor());

  // Toast / Status state
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Populate form with current values on open
  useEffect(() => {
    if (isOpen) {
      // Principal
      setPrincipalNameBn(leadershipProfiles.principal.nameBn || '');
      setPrincipalNameEn(leadershipProfiles.principal.nameEn || '');
      setPrincipalRoleBn(leadershipProfiles.principal.roleBn || 'প্রিন্সিপাল (Principal)');
      setPrincipalQuoteBn(leadershipProfiles.principal.quoteBn || '');
      setPrincipalQuoteEn(leadershipProfiles.principal.quoteEn || '');
      setPrincipalPhotoUrl(leadershipProfiles.principal.photoUrl || '/assets/biddalay/shafee_abdullah.jpg');

      // Head Teacher
      setHeadTeacherNameBn(leadershipProfiles.headTeacher.nameBn || '');
      setHeadTeacherNameEn(leadershipProfiles.headTeacher.nameEn || '');
      setHeadTeacherRoleBn(leadershipProfiles.headTeacher.roleBn || 'প্রধান শিক্ষক (Head Teacher)');
      setHeadTeacherQuoteBn(leadershipProfiles.headTeacher.quoteBn || '');
      setHeadTeacherQuoteEn(leadershipProfiles.headTeacher.quoteEn || '');
      setHeadTeacherPhotoUrl(leadershipProfiles.headTeacher.photoUrl || '/assets/biddalay/fatema_akter.jpg');

      // School & Contact
      setSchoolNameBn(schoolProfile.nameBn || 'আনন্দ পাঠশালা');
      setSchoolNameEn(schoolProfile.nameEn || 'Ananda Pathshala | Kushtia');
      setSloganBn(schoolProfile.sloganBn || 'শিক্ষায় আছে আনন্দ, আনন্দে গড়বো দিগন্ত');
      setTaglineBn(schoolProfile.taglineBn || 'কুষ্টিয়ার একমাত্র প্রি-স্কুল ও কিন্ডারগার্টেন · গোশালা, কুষ্টিয়া');
      setClassesBn(schoolProfile.classesBn || 'হাতেখড়ি | প্লে | নার্সারি | কেজি | প্রথম শ্রেণি');
      setAddressBn(schoolProfile.addressBn || '১৯/২২, পূর্ণ চন্দ্র লাহিড়ী লেন (গোশালা), কোর্টপাড়া, কুষ্টিয়া');
      setAddressEn(schoolProfile.addressEn || '19/22, Purna Chandra Lahiri Lane (Goshala), Courtpara, Kushtia, Bangladesh');
      setPhoneBn(schoolProfile.phoneBn || '০১৯১৪-০৫৭৫১১');
      setPhoneRaw(schoolProfile.phoneRaw || '+880 1914-057511');
      setEmail(schoolProfile.email || 'anandapathshala.bd@gmail.com');
      setFacebookUrl(schoolProfile.facebookUrl || 'https://www.facebook.com/AnandaPathshalaKushtia');
      setFollowers(schoolProfile.followers || '9.1K followers');
      setVisitingHoursBn(
        schoolProfile.visitingHoursBn || 'রবিবার — বৃহস্পতিবার: সকাল ০৮:০০ — দুপুর ০১:৩০'
      );
      setThemeColor(schoolProfile.themeColor || getStoredThemeColor());

      setSaveSuccessMsg(null);
      setFormError(null);
    }
  }, [isOpen, leadershipProfiles, schoolProfile]);

  if (!isOpen) return null;

  // File upload helper for photos
  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'principal' | 'headTeacher'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'principal') {
          setPrincipalPhotoUrl(reader.result);
        } else {
          setHeadTeacherPhotoUrl(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset to original mock data defaults
  const handleResetToDefaults = () => {
    const confirmReset = window.confirm(
      'আপনি কি সকল তথ্য আনন্দ পাঠশালার মূল ডিফল্ট ডেটায় ফিরিয়ে নিতে চান?'
    );
    if (!confirmReset) return;

    // Principal
    setPrincipalNameBn(PRINCIPAL_AND_DIRECTOR_PROFILES.principal.nameBn);
    setPrincipalNameEn(PRINCIPAL_AND_DIRECTOR_PROFILES.principal.nameEn);
    setPrincipalRoleBn(PRINCIPAL_AND_DIRECTOR_PROFILES.principal.roleBn);
    setPrincipalQuoteBn(PRINCIPAL_AND_DIRECTOR_PROFILES.principal.quoteBn);
    setPrincipalQuoteEn(PRINCIPAL_AND_DIRECTOR_PROFILES.principal.quoteEn || '');
    setPrincipalPhotoUrl(PRINCIPAL_AND_DIRECTOR_PROFILES.principal.photoUrl);

    // Head Teacher
    setHeadTeacherNameBn(PRINCIPAL_AND_DIRECTOR_PROFILES.headTeacher.nameBn);
    setHeadTeacherNameEn(PRINCIPAL_AND_DIRECTOR_PROFILES.headTeacher.nameEn);
    setHeadTeacherRoleBn(PRINCIPAL_AND_DIRECTOR_PROFILES.headTeacher.roleBn);
    setHeadTeacherQuoteBn(PRINCIPAL_AND_DIRECTOR_PROFILES.headTeacher.quoteBn);
    setHeadTeacherQuoteEn(PRINCIPAL_AND_DIRECTOR_PROFILES.headTeacher.quoteEn || '');
    setHeadTeacherPhotoUrl(PRINCIPAL_AND_DIRECTOR_PROFILES.headTeacher.photoUrl);

    // School Profile
    setSchoolNameBn(SCHOOL_PROFILE.nameBn);
    setSchoolNameEn(SCHOOL_PROFILE.nameEn);
    setSloganBn(SCHOOL_PROFILE.sloganBn);
    setTaglineBn(SCHOOL_PROFILE.taglineBn);
    setClassesBn(SCHOOL_PROFILE.classesBn);
    setAddressBn(SCHOOL_PROFILE.addressBn);
    setAddressEn(SCHOOL_PROFILE.addressEn);
    setPhoneBn(SCHOOL_PROFILE.phoneBn);
    setPhoneRaw(SCHOOL_PROFILE.phoneRaw);
    setEmail(SCHOOL_PROFILE.email);
    setFacebookUrl(SCHOOL_PROFILE.facebookUrl);
    setFollowers(SCHOOL_PROFILE.followers);
    setVisitingHoursBn('রবিবার — বৃহস্পতিবার: সকাল ০৮:০০ — দুপুর ০১:৩০');
    setThemeColor(DEFAULT_THEME_COLOR);
    applySchoolTheme(DEFAULT_THEME_COLOR);

    setFormError(null);
  };

  // Save all changes in real-time
  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!principalNameBn.trim()) {
      setFormError('অনুগ্রহ করে প্রিন্সিপালের নাম (বাংলায়) প্রদান করুন।');
      setActiveTab('principal');
      return;
    }
    if (!principalQuoteBn.trim()) {
      setFormError('অনুগ্রহ করে প্রিন্সিপালের বাণী প্রদান করুন।');
      setActiveTab('principal');
      return;
    }
    if (!headTeacherNameBn.trim()) {
      setFormError('অনুগ্রহ করে প্রধান শিক্ষকের নাম প্রদান করুন।');
      setActiveTab('headTeacher');
      return;
    }
    if (!addressBn.trim() || !phoneBn.trim()) {
      setFormError('অনুগ্রহ করে স্কুলের ঠিকানা ও ফোন নম্বর পূরণ করুন।');
      setActiveTab('contact');
      return;
    }

    setFormError(null);

    // Updated Leadership
    const updatedLeadership: LeadershipProfiles = {
      ...leadershipProfiles,
      principal: {
        ...leadershipProfiles.principal,
        nameBn: principalNameBn.trim(),
        nameEn: principalNameEn.trim() || principalNameBn.trim(),
        roleBn: principalRoleBn.trim() || 'প্রিন্সিপাল (Principal)',
        photoUrl: principalPhotoUrl.trim() || leadershipProfiles.principal.photoUrl,
        quoteBn: principalQuoteBn.trim(),
        quoteEn: principalQuoteEn.trim(),
      },
      headTeacher: {
        ...leadershipProfiles.headTeacher,
        nameBn: headTeacherNameBn.trim(),
        nameEn: headTeacherNameEn.trim() || headTeacherNameBn.trim(),
        roleBn: headTeacherRoleBn.trim() || 'প্রধান শিক্ষক (Head Teacher)',
        photoUrl: headTeacherPhotoUrl.trim() || leadershipProfiles.headTeacher.photoUrl,
        quoteBn: headTeacherQuoteBn.trim(),
        quoteEn: headTeacherQuoteEn.trim(),
      },
    };

    // Updated School Profile & Contact
    const updatedSchoolProfile: SchoolProfile = {
      ...schoolProfile,
      nameBn: schoolNameBn.trim(),
      nameEn: schoolNameEn.trim(),
      sloganBn: sloganBn.trim(),
      taglineBn: taglineBn.trim(),
      classesBn: classesBn.trim(),
      addressBn: addressBn.trim(),
      addressEn: addressEn.trim(),
      phoneBn: phoneBn.trim(),
      phoneRaw: phoneRaw.trim(),
      email: email.trim(),
      facebookUrl: facebookUrl.trim(),
      followers: followers.trim(),
      visitingHoursBn: visitingHoursBn.trim(),
      themeColor: themeColor.trim(),
    };

    // Save to states & local storage
    onSaveLeadershipProfiles(updatedLeadership);
    onSaveSchoolProfile(updatedSchoolProfile);

    // Dispatch global custom event for real-time reactive subscribers
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('school-profile-updated', {
          detail: {
            schoolProfile: updatedSchoolProfile,
            leadershipProfiles: updatedLeadership,
          },
        })
      );
    }

    setSaveSuccessMsg('✅ স্কুলের প্রোফাইল, বাণী ও যোগাযোগের তথ্য সফলভাবে রিয়েল-টাইমে আপডেট করা হয়েছে!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-school-profile-title"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* ========================================================================= */}
        {/* 1. MODAL HEADER                                                           */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between gap-4 border-b border-emerald-500/20 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950">
                <Sparkles className="w-3.5 h-3.5" />
                অধ্যক্ষ ও অ্যাডমিন কমান্ড
              </span>
              <span className="text-[11px] font-medium text-emerald-300">
                রিয়েল-টাইম তথ্য আপডেট
              </span>
            </div>
            <h3
              id="edit-school-profile-title"
              className="text-lg sm:text-xl font-black text-white flex items-center gap-2"
            >
              <School className="w-5 h-5 text-emerald-400" />
              <span>স্কুল প্রোফাইল ও প্রাতিষ্ঠানিক তথ্য এডিটর</span>
            </h3>
            <p className="text-xs text-slate-300">
              প্রিন্সিপালের বাণী, প্রধান শিক্ষকের পরিচিতি ও স্কুলের যোগাযোগের তথ্য এডিট করুন যা তাৎক্ষণিক পুরো পোর্টালে দৃশ্যমান হবে।
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. TAB SELECTOR NAVIGATION                                                */}
        {/* ========================================================================= */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('principal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'principal'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-300" />
            <span>১. প্রিন্সিপালের বাণী ও বার্তা</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('headTeacher')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'headTeacher'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Edit3 className="w-4 h-4 text-amber-300" />
            <span>২. প্রধান শিক্ষকের পরিচিতি ও বাণী</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Phone className="w-4 h-4 text-teal-300" />
            <span>৩. স্কুলের যোগাযোগ ও ক্যাম্পাস তথ্য</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'theme'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-300" />
            <span>৪. স্কুল থিম ও অ্যাপ কালার</span>
          </button>
        </div>

        {/* Status Alerts */}
        {formError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <Info className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. SCROLLABLE TAB CONTENT BODY                                            */}
        {/* ========================================================================= */}
        <form onSubmit={handleSaveAll} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: PRINCIPAL'S MESSAGE & BIO                                          */}
          {/* ========================================================================= */}
          {activeTab === 'principal' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-1">
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>প্রিন্সিপাল শাফী আব্দুল্লাহর প্রাতিষ্ঠানিক বাণী ও প্রোফাইল</span>
                </h4>
                <p className="text-xs text-emerald-800">
                  এই বার্তাটি পাবলিক ওয়েবসাইটের প্রধান পৃষ্ঠায় এবং প্রিন্সিপাল ড্যাশবোর্ডে আকর্ষণীয় কোটেশন কার্ড আকারে প্রদর্শিত হবে।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    প্রিন্সিপালের নাম (বাংলায়): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={principalNameBn}
                    onChange={(e) => setPrincipalNameBn(e.target.value)}
                    placeholder="যেমন: শাফী আব্দুল্লাহ"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    নাম (ইংরেজিতে):
                  </label>
                  <input
                    type="text"
                    value={principalNameEn}
                    onChange={(e) => setPrincipalNameEn(e.target.value)}
                    placeholder="e.g. Shafee Abdullah"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    পদবী / পদবি (বাংলায়):
                  </label>
                  <input
                    type="text"
                    value={principalRoleBn}
                    onChange={(e) => setPrincipalRoleBn(e.target.value)}
                    placeholder="যেমন: প্রিন্সিপাল (Principal) ও প্রতিষ্ঠাতা পরিচালক"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    প্রোফাইল ছবি (ডিভাইস থেকে ফাইল নির্বাচন):
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'principal')}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  প্রিন্সিপালের প্রাতিষ্ঠানিক বাণী (বাংলায়): <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={principalQuoteBn}
                  onChange={(e) => setPrincipalQuoteBn(e.target.value)}
                  placeholder="আনন্দ পাঠশালার ক্ষুদে শিক্ষার্থী ও সম্মানিত অভিভাবকদের উদ্দেশ্যে প্রিন্সিপালের বার্তা লিখুন..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  শব্দসংখ্যা: {principalQuoteBn.trim().split(/\s+/).filter(Boolean).length} | অক্ষর: {principalQuoteBn.length}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Principal&apos;s Message (English translation):
                </label>
                <textarea
                  rows={3}
                  value={principalQuoteEn}
                  onChange={(e) => setPrincipalQuoteEn(e.target.value)}
                  placeholder="English version of the Principal's message..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition leading-relaxed font-sans"
                />
              </div>

              {/* LIVE CARD PREVIEW FOR PRINCIPAL */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>লাইভ কার্ড প্রিভিউ (Live Preview):</span>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200 flex items-start gap-4">
                  <img
                    src={principalPhotoUrl || '/assets/biddalay/shafee_abdullah.jpg'}
                    alt={principalNameBn}
                    className="w-20 h-24 rounded-2xl object-cover border-2 border-emerald-500 bg-white shrink-0 shadow-xs"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-[10px] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded inline-block">
                      {principalRoleBn || 'প্রিন্সিপাল (Principal)'}
                    </span>
                    <h5 className="text-sm font-black text-slate-900">
                      {principalNameBn || 'শাফী আব্দুল্লাহ'} {principalNameEn && `(${principalNameEn})`}
                    </h5>
                    <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-3">
                      “{principalQuoteBn || 'বাণীর প্রিভিউ এখানে প্রদর্শিত হবে...'}”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: HEAD TEACHER'S BIO & MESSAGE                                       */}
          {/* ========================================================================= */}
          {activeTab === 'headTeacher' && (
            <div className="space-y-6">
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-1">
                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-700" />
                  <span>প্রধান শিক্ষক ফাতেমা আক্তারের পরিচিতি ও শিক্ষাদর্শন</span>
                </h4>
                <p className="text-xs text-amber-900">
                  শ্রেণিকক্ষের পাঠদান, মমতা ও আনন্দঘন শিক্ষার গুরুত্ব নিয়ে প্রধান শিক্ষকের বাণী হালনাগাদ করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    প্রধান শিক্ষকের নাম (বাংলায়): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={headTeacherNameBn}
                    onChange={(e) => setHeadTeacherNameBn(e.target.value)}
                    placeholder="যেমন: ফাতেমা আক্তার"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    নাম (ইংরেজিতে):
                  </label>
                  <input
                    type="text"
                    value={headTeacherNameEn}
                    onChange={(e) => setHeadTeacherNameEn(e.target.value)}
                    placeholder="e.g. Fatema Akter"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    পদবী / ভূমিকা:
                  </label>
                  <input
                    type="text"
                    value={headTeacherRoleBn}
                    onChange={(e) => setHeadTeacherRoleBn(e.target.value)}
                    placeholder="যেমন: প্রধান শিক্ষক (Head Teacher)"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    প্রোফাইল ছবি (ডিভাইস থেকে ফাইল নির্বাচন):
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'headTeacher')}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  প্রধান শিক্ষকের বাণী / শিক্ষাদর্শন (বাংলায়): <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={headTeacherQuoteBn}
                  onChange={(e) => setHeadTeacherQuoteBn(e.target.value)}
                  placeholder="আনন্দ পাঠশালায় শিশুদের পাঠদান ও মমতা নিয়ে প্রধান শিক্ষকের বাণী লিখুন..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Head Teacher&apos;s Message (English):
                </label>
                <textarea
                  rows={3}
                  value={headTeacherQuoteEn}
                  onChange={(e) => setHeadTeacherQuoteEn(e.target.value)}
                  placeholder="English bio or educational philosophy..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition leading-relaxed font-sans"
                />
              </div>

              {/* LIVE CARD PREVIEW FOR HEAD TEACHER */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>লাইভ কার্ড প্রিভিউ (Live Preview):</span>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 flex items-start gap-4">
                  <img
                    src={headTeacherPhotoUrl || '/assets/biddalay/fatema_akter.jpg'}
                    alt={headTeacherNameBn}
                    className="w-20 h-24 rounded-2xl object-cover border-2 border-amber-500 bg-white shrink-0 shadow-xs"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded inline-block">
                      {headTeacherRoleBn || 'প্রধান শিক্ষক (Head Teacher)'}
                    </span>
                    <h5 className="text-sm font-black text-slate-900">
                      {headTeacherNameBn || 'ফাতেমা আক্তার'} {headTeacherNameEn && `(${headTeacherNameEn})`}
                    </h5>
                    <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-3">
                      “{headTeacherQuoteBn || 'প্রধান শিক্ষকের বাণীর প্রিভিউ...'}”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CONTACT INFORMATION & CAMPUS                                       */}
          {/* ========================================================================= */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200 space-y-1">
                <h4 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-700" />
                  <span>আনন্দ পাঠশালা ক্যাম্পাস যোগাযোগ, ঠিকানা ও হেল্পলাইন</span>
                </h4>
                <p className="text-xs text-teal-900">
                  এখানে সংরক্ষিত ফোন নম্বর, ক্যাম্পাস ঠিকানা ও ইমেইল পাবলিক ওয়েবসাইটের ফুটার, ড্যাশবোর্ড হেডার এবং নোটিফিকেশনে সরাসরি আপডেট হবে।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    স্কুলের নাম (বাংলায়):
                  </label>
                  <input
                    type="text"
                    value={schoolNameBn}
                    onChange={(e) => setSchoolNameBn(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    স্কুলের নাম (ইংরেজিতে):
                  </label>
                  <input
                    type="text"
                    value={schoolNameEn}
                    onChange={(e) => setSchoolNameEn(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    অফিশিয়াল স্লোগান:
                  </label>
                  <input
                    type="text"
                    value={sloganBn}
                    onChange={(e) => setSloganBn(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ট্যাগলাইন / পরিচিতি:
                  </label>
                  <input
                    type="text"
                    value={taglineBn}
                    onChange={(e) => setTaglineBn(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    হেল্পলাইন ফোন নম্বর (বাংলায় প্রদর্শিত): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneBn}
                    onChange={(e) => setPhoneBn(e.target.value)}
                    placeholder="যেমন: ০১৯১৪-০৫৭৫১১"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ফোন নম্বর (ডায়ালেবল / Raw Phone):
                  </label>
                  <input
                    type="text"
                    value={phoneRaw}
                    onChange={(e) => setPhoneRaw(e.target.value)}
                    placeholder="e.g. +880 1914-057511"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    অফিশিয়াল ইমেইল অ্যাড্রেস:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. anandapathshala.bd@gmail.com"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ফেসবুক পেজ লিংক:
                  </label>
                  <input
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://www.facebook.com/AnandaPathshalaKushtia"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ফেসবুক ফলোয়ার কাউন্ট টেক্সট:
                  </label>
                  <input
                    type="text"
                    value={followers}
                    onChange={(e) => setFollowers(e.target.value)}
                    placeholder="e.g. 9.1K followers"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ক্যাম্পাস অফিস ও ভিজিটিং সময়সূচি:
                  </label>
                  <input
                    type="text"
                    value={visitingHoursBn}
                    onChange={(e) => setVisitingHoursBn(e.target.value)}
                    placeholder="যেমন: রবিবার — বৃহস্পতিবার: সকাল ০৮:০০ — দুপুর ০১:৩০"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ক্যাম্পাসের পূর্ণ ঠিকানা (বাংলায়): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressBn}
                  onChange={(e) => setAddressBn(e.target.value)}
                  placeholder="যেমন: ১৯/২২, পূর্ণ চন্দ্র লাহিড়ী লেন (গোশালা), কোর্টপাড়া, কুষ্টিয়া"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Campus Address (English):
                </label>
                <input
                  type="text"
                  value={addressEn}
                  onChange={(e) => setAddressEn(e.target.value)}
                  placeholder="e.g. 19/22, Purna Chandra Lahiri Lane (Goshala), Courtpara, Kushtia, Bangladesh"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-sans"
                />
              </div>

              {/* LIVE CONTACT PREVIEW CARD */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Eye className="w-3.5 h-3.5 text-teal-600" />
                  <span>যোগাযোগ তথ্য প্রিভিউ (Contact Preview):</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h5 className="font-black text-sm text-emerald-300">{schoolNameBn}</h5>
                      <p className="text-[11px] text-slate-400">“{sloganBn}”</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {followers}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{addressBn}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-mono">{phoneBn}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="font-mono truncate">{email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{visitingHoursBn}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SCHOOL THEME & APP PRIMARY COLOR                                   */}
          {/* ========================================================================= */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <SchoolThemeSettingsSection
                onThemeChanged={(color) => setThemeColor(color)}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. MODAL FOOTER WITH SAVE, RESET & CANCEL ACTIONS                         */}
          {/* ========================================================================= */}
          <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ডিফল্ট তথ্যে রিসেট</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                বাতিল
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>রিয়েল-টাইম সেভ করুন</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
