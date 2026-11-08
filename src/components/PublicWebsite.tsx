import React, { useState, useEffect } from 'react';
import {
  SchoolClass,
  AdmissionApplication,
  FacebookGalleryItem,
  TeacherMember,
  CommitteeDirector,
  SchoolProfile,
  LeadershipProfiles,
  SchoolNotice,
} from '../types/school';
import {
  SCHOOL_PROFILE,
  PRINCIPAL_AND_DIRECTOR_PROFILES,
  SCHOOL_TEACHERS,
  MANAGEMENT_COMMITTEE,
  BEST_STUDENTS_BIDDALAY,
  INITIAL_SCHOOL_NOTICES,
} from '../data/mockData';
import { ALL_SCHOOL_CLASSES } from '../utils/schoolLogic';
import {
  Sparkles,
  ShieldCheck,
  Heart,
  BookOpen,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Send,
  Star,
  ArrowRight,
  ExternalLink,
  LogIn,
  GraduationCap,
  Award,
  Users,
  Quote,
  Facebook,
  LayoutDashboard,
  Bell,
  X,
  Printer,
  Share2,
  MessageSquareQuote,
  Building2,
  Briefcase,
} from 'lucide-react';
import { PWAInstallButton } from './MobileAppShell';
import { HomeCarousel } from './HomeCarousel';
import { NoticeBoard, NoticeTicker } from './NoticeBoard';

interface PublicWebsiteProps {
  onEnterPortal: (tab?: string) => void;
  onOpenLoginModal: () => void;
  onOpenMobileModal?: () => void;
  isMobilePreview?: boolean;
  onAddAdmission: (app: AdmissionApplication) => void;
  logoUrl?: string;
  fbGallery?: FacebookGalleryItem[];
  isLoggedIn?: boolean;
  onAddMultipleGalleryPhotos?: (photos: FacebookGalleryItem[]) => void;
  onDeleteGalleryPhoto?: (photoId: string) => void;
  schoolProfile?: SchoolProfile;
  leadershipProfiles?: LeadershipProfiles;
  notices?: SchoolNotice[];
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({
  onEnterPortal,
  onOpenLoginModal,
  onOpenMobileModal = () => {},
  isMobilePreview = false,
  onAddAdmission,
  logoUrl = '/assets/fb/logo.jpg',
  fbGallery = [],
  isLoggedIn = false,
  onAddMultipleGalleryPhotos,
  onDeleteGalleryPhoto,
  schoolProfile: propSchoolProfile,
  leadershipProfiles: propLeadershipProfiles,
  notices: propNotices,
}) => {
  const [leadershipProfiles, setLeadershipProfiles] = useState<LeadershipProfiles>(() => {
    if (propLeadershipProfiles) return propLeadershipProfiles;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ananda_leadership_profiles_v1');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return PRINCIPAL_AND_DIRECTOR_PROFILES;
  });

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    if (propSchoolProfile) return propSchoolProfile;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ananda_school_profile_v1');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return SCHOOL_PROFILE;
  });

  const [notices, setNotices] = useState<SchoolNotice[]>(() => {
    if (propNotices && propNotices.length > 0) return propNotices;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ananda_school_notices_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_SCHOOL_NOTICES;
  });

  const [selectedNoticeForModal, setSelectedNoticeForModal] = useState<SchoolNotice | null>(null);

  // Sync props if provided
  useEffect(() => {
    if (propLeadershipProfiles) setLeadershipProfiles(propLeadershipProfiles);
  }, [propLeadershipProfiles]);

  useEffect(() => {
    if (propSchoolProfile) setSchoolProfile(propSchoolProfile);
  }, [propSchoolProfile]);

  useEffect(() => {
    if (propNotices && propNotices.length > 0) setNotices(propNotices);
  }, [propNotices]);

  // Real-time custom event sync
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEv = e as CustomEvent<{
        schoolProfile?: SchoolProfile;
        leadershipProfiles?: LeadershipProfiles;
      }>;
      if (customEv.detail?.schoolProfile) {
        setSchoolProfile(customEv.detail.schoolProfile);
      }
      if (customEv.detail?.leadershipProfiles) {
        setLeadershipProfiles(customEv.detail.leadershipProfiles);
      }
    };
    window.addEventListener('school-profile-updated', handleSync);
    return () => window.removeEventListener('school-profile-updated', handleSync);
  }, []);

  useEffect(() => {
    const handleNoticesSync = (e: Event) => {
      const customEv = e as CustomEvent<{ notices?: SchoolNotice[] }>;
      if (customEv.detail?.notices) {
        setNotices(customEv.detail.notices);
      } else {
        try {
          const stored = localStorage.getItem('ananda_school_notices_v1');
          if (stored) setNotices(JSON.parse(stored));
        } catch {}
      }
    };
    window.addEventListener('ananda-notices-updated', handleNoticesSync);
    return () => window.removeEventListener('ananda-notices-updated', handleNoticesSync);
  }, []);

  const [teachersList, setTeachersList] = useState<TeacherMember[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ananda_teachers_list_v1');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return SCHOOL_TEACHERS;
  });

  // Dedicated Management Committee & Board of Directors State
  const [directorsList, setDirectorsList] = useState<CommitteeDirector[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ananda_management_directors_v3');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return MANAGEMENT_COMMITTEE;
  });

  const [viewingDirector, setViewingDirector] = useState<CommitteeDirector | null>(null);

  // Sync directors & teachers across tabs and admin updates
  useEffect(() => {
    const handleSyncDirectors = (e: Event) => {
      const customEv = e as CustomEvent<{ directors?: CommitteeDirector[] }>;
      let nextList: CommitteeDirector[] | null = null;
      if (customEv.detail?.directors) {
        nextList = customEv.detail.directors;
      } else {
        try {
          const stored = localStorage.getItem('ananda_management_directors_v3');
          if (stored) nextList = JSON.parse(stored);
        } catch {}
      }
      if (nextList && Array.isArray(nextList) && nextList.length > 0) {
        setDirectorsList(nextList);
      }
    };
    window.addEventListener('ananda-directors-updated', handleSyncDirectors);
    return () => window.removeEventListener('ananda-directors-updated', handleSyncDirectors);
  }, []);

  useEffect(() => {
    const handleSyncTeachers = (e: Event) => {
      const customEv = e as CustomEvent<{ teachers?: TeacherMember[] }>;
      if (customEv.detail?.teachers) {
        setTeachersList(customEv.detail.teachers);
      } else {
        try {
          const stored = localStorage.getItem('ananda_teachers_list_v1');
          if (stored) setTeachersList(JSON.parse(stored));
        } catch {}
      }
    };
    window.addEventListener('ananda-teachers-updated', handleSyncTeachers);
    return () => window.removeEventListener('ananda-teachers-updated', handleSyncTeachers);
  }, []);

  const [applicantNameBn, setApplicantNameBn] = useState('');
  const [applicantNameEn, setApplicantNameEn] = useState('');
  const [dob, setDob] = useState('2022-05-15');
  const [gender] = useState<'male' | 'female'>('male');
  const [applyingClass, setApplyingClass] = useState<SchoolClass>('HateKhori');
  const [guardianNameBn, setGuardianNameBn] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [addressBn, setAddressBn] = useState('');
  const [submittedApp, setSubmittedApp] = useState<AdmissionApplication | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter out the Principal and Head Teacher from the faculty roster grid, as they are already prominently highlighted in the leadership section right above
  const generalFacultyList = teachersList.filter(
    (teacher) =>
      teacher.id !== 'tch-1' &&
      teacher.id !== 'tch-2' &&
      !teacher.isHeadTeacher &&
      teacher.staffCategory !== 'principal'
  );

  const handleSubmitAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantNameBn.trim() || !guardianNameBn.trim() || !guardianPhone.trim()) {
      setFormError('অনুগ্রহ করে শিশুর নাম, অভিভাবকের নাম ও মোবাইল নম্বর পূরণ করুন।');
      return;
    }
    setFormError(null);

    const newApp: AdmissionApplication = {
      id: `adm-${Date.now()}`,
      applicantNameBn: applicantNameBn.trim(),
      applicantNameEn: applicantNameEn.trim() || applicantNameBn.trim(),
      dateOfBirth: dob,
      gender,
      applyingClass,
      guardianNameBn: guardianNameBn.trim(),
      guardianPhone: guardianPhone.trim(),
      addressBn: addressBn.trim() || 'গোশালা, কোর্টপাড়া, কুষ্টিয়া',
      submittedAt: 'আজ, ৩১ অক্টোবর ২০২৬',
      status: 'pending',
    };

    onAddAdmission(newApp);
    setSubmittedApp(newApp);
  };

  return (
    <div id="top" className="min-h-screen bg-[#FFFDF9] text-slate-900 pb-20 md:pb-8 overflow-x-hidden">
      {/* Standalone Public Website Header (Open to Everyone) */}
      <header className="bg-white/95 backdrop-blur-md border-b border-amber-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src={logoUrl}
              alt="আনন্দ পাঠশালা কুষ্টিয়া লোগো"
              referrerPolicy="no-referrer"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl object-cover border-2 border-emerald-500 bg-white p-0.5 shadow-2xs shrink-0"
            />
            <div className="min-w-0 truncate">
              <span className="text-sm sm:text-lg font-black tracking-tight text-slate-900 block leading-none truncate">
                {schoolProfile.nameBn}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mt-0.5 truncate">
                Ananda Pathshala · কুষ্টিয়া
              </span>
            </div>
          </div>

          <nav className="hidden md:flex flex-1 min-w-0 flex-wrap items-center justify-center gap-1.5 lg:gap-2.5 text-[11px] lg:text-xs font-bold text-slate-700 px-1">
            <a href="#notice-board" className="text-emerald-800 hover:text-emerald-950 font-extrabold transition-colors whitespace-nowrap flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              <Bell className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>নোটিশ বোর্ড</span>
            </a>
            <a href="#teachers" className="px-2 py-1 rounded-lg hover:bg-slate-100 hover:text-emerald-700 transition-colors whitespace-nowrap">
              শিক্ষকবৃন্দ
            </a>
            <a href="#governing-body" className="hover:text-amber-800 transition-colors whitespace-nowrap flex items-center gap-1 text-amber-900 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80 font-bold">
              <Users className="w-3 h-3 text-amber-600" />
              <span>পরিচালনা পর্ষদ</span>
            </a>
            <a href="#students" className="px-2 py-1 rounded-lg hover:bg-slate-100 hover:text-emerald-700 transition-colors whitespace-nowrap">
              কৃতি শিক্ষার্থী
            </a>
            <a href="#curriculum" className="px-2 py-1 rounded-lg hover:bg-slate-100 hover:text-emerald-700 transition-colors whitespace-nowrap">
              পাঠক্রম
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Facebook Page Button (Square box matching logo) */}
            <a
              href={schoolProfile.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 transition-all shadow-2xs shrink-0 relative group"
              title={`আনন্দ পাঠশালা ফেসবুক পেজ (${schoolProfile.followers})`}
              aria-label="ফেসবুক পেজ"
            >
              <Facebook className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span className="sr-only">ফেসবুক পেজ</span>
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded-lg whitespace-nowrap shadow-lg z-50">
                ফেসবুক পেজ
              </span>
            </a>

            {/* Mobile App Button (Square box matching logo) */}
            <PWAInstallButton
              onOpenMobileModal={onOpenMobileModal}
              isMobilePreview={isMobilePreview}
              square
            />

            {/* Back to Portal (if logged in) */}
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => onEnterPortal('overview')}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all shadow-2xs shrink-0 relative group"
                title="ড্যাশবোর্ডে ফিরুন"
                aria-label="ড্যাশবোর্ডে ফিরুন"
              >
                <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="sr-only">ড্যাশবোর্ড</span>
                <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded-lg whitespace-nowrap shadow-lg z-50">
                  ড্যাশবোর্ডে ফিরুন
                </span>
              </button>
            )}

            {/* Login Button (Square box matching logo) */}
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-sm transition-all shrink-0 relative group"
              title="লগইন করুন"
              aria-label="লগইন করুন"
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="sr-only">লগইন করুন</span>
              <span className="pointer-events-none absolute -bottom-8 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded-lg whitespace-nowrap shadow-lg z-50">
                লগইন করুন
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Top Scrolling Live Announcement Ticker */}
      <NoticeTicker
        notices={notices}
        onSelectNotice={(notice) => setSelectedNoticeForModal(notice)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12 pb-12">
        {/* Hero Section with Official Ananda Pathshala Kushtia Cover & Logo */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-800 to-amber-700 text-white p-8 sm:p-12 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>ভর্তি চলছে: হাতেখড়ি থেকে ২য় শ্রেণি (২.৫+ বছর থেকে)</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <img
                  src={logoUrl}
                  alt="আনন্দ পাঠশালা কুষ্টিয়া লোগো"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-white p-1 border-2 border-amber-300 shadow-md shrink-0"
                />
                <div>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                    {schoolProfile.nameBn}
                  </h1>
                  <p className="text-amber-200 font-bold text-sm sm:text-base mt-0.5">
                    “{schoolProfile.sloganBn}” — {schoolProfile.taglineBn}
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-white/95 leading-relaxed font-normal">
                আনন্দ পাঠশালা (গোশালা, কুষ্টিয়া)—শিশুর আনন্দময় শৈশব ও আধুনিক প্রাক-প্রাথমিক শিক্ষার এক নির্ভরযোগ্য ঠিকানা। শিশুবান্ধব মন্টেসরি পদ্ধতি, সুসজ্জিত ক্লাসরুম, বর্ণিল খেলার প্রাঙ্গণ ও দক্ষ শিক্ষকদের নিবিড় ও স্নেহময় তত্ত্বাবধানে এখানে প্রতিটি শিশু আনন্দের সাথে শেখে ও সুনাগরিক হিসেবে গড়ে ওঠে।
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="#apply"
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2"
                >
                  অনলাইন ভর্তি আবেদন করুন
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#teachers"
                  className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl text-sm font-bold transition-all"
                >
                  প্রিন্সিপাল ও শিক্ষকদের দেখুন
                </a>
              </div>
            </div>

          {/* Official Campus Cover Photo Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl bg-slate-900">
              <img
                src={schoolProfile.coverUrl}
                alt="আনন্দ পাঠশালা কুষ্টিয়া ক্যাম্পাসের শিক্ষক ও শিক্ষার্থীবৃন্দ"
                referrerPolicy="no-referrer"
                className="w-full h-64 sm:h-72 object-cover"
              />
              <div className="p-3 bg-slate-900/90 text-xs text-amber-200 font-medium text-center">
                📍 ১৯/২২, পূর্ণ চন্দ্র লাহিড়ী লেন (গোশালা), কুষ্টিয়া · ফোন: ০১৯১৪-০৫৭৫১১
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Carousel: Announcements, Gallery Highlights & Seasonal Notices */}
      <HomeCarousel
        fbGalleryImages={fbGallery}
        onScrollToSection={(sectionId) => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Comprehensive Interactive Notice Board & Upcoming Events Section */}
      <NoticeBoard
        notices={notices}
        onOpenNoticeDetail={(notice) => setSelectedNoticeForModal(notice)}
      />

      {/* Academic Leadership & Teachers Section */}
      <section id="teachers" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
              একাডেমিক নেতৃত্ব ও দিকনির্দেশনা
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              প্রিন্সিপাল ও প্রধান শিক্ষকের অনুপ্রেরণাদায়ী বাণী
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            আনন্দ পাঠশালা প্রাতিষ্ঠানিক বার্তা ও পরিচিতি
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT CARD (বাম দিকে): Principal's Message — Shafee Abdullah */}
          <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-7 shadow-2xs flex flex-col sm:flex-row items-start gap-5">
            <img
              src={leadershipProfiles.principal.photoUrl}
              alt={leadershipProfiles.principal.nameBn}
              referrerPolicy="no-referrer"
              className="w-28 h-32 sm:w-32 sm:h-36 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0 bg-slate-100"
            />
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  প্রিন্সিপালের বাণী (Principal&apos;s Message)
                </span>
                <Quote className="w-5 h-5 text-emerald-300 shrink-0" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {leadershipProfiles.principal.nameBn}
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  {leadershipProfiles.principal.nameEn} · {leadershipProfiles.principal.roleBn || 'প্রিন্সিপাল, আনন্দ পাঠশালা, কুষ্টিয়া'}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                “{leadershipProfiles.principal.quoteBn}”
              </p>
              {leadershipProfiles.principal.quoteEn && (
                <p className="text-[11px] text-slate-500 italic leading-relaxed line-clamp-3">
                  "{leadershipProfiles.principal.quoteEn}"
                </p>
              )}
            </div>
          </div>

          {/* RIGHT CARD (ডান দিকে): Head Teacher's Message — Fatema Akter */}
          <div className="bg-white rounded-3xl border border-amber-200 p-6 sm:p-7 shadow-2xs flex flex-col sm:flex-row items-start gap-5">
            <img
              src={leadershipProfiles.headTeacher.photoUrl}
              alt={leadershipProfiles.headTeacher.nameBn}
              referrerPolicy="no-referrer"
              className="w-28 h-32 sm:w-32 sm:h-36 rounded-2xl object-cover border-2 border-amber-500 shadow-sm shrink-0 bg-slate-100"
            />
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md">
                  প্রধান শিক্ষকের বাণী (Head Teacher&apos;s Message)
                </span>
                <Quote className="w-5 h-5 text-amber-300 shrink-0" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {leadershipProfiles.headTeacher.nameBn}
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  {leadershipProfiles.headTeacher.nameEn} · {leadershipProfiles.headTeacher.roleBn || 'প্রধান শিক্ষক, আনন্দ পাঠশালা, কুষ্টিয়া'}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                “{leadershipProfiles.headTeacher.quoteBn}”
              </p>
              {leadershipProfiles.headTeacher.quoteEn && (
                <p className="text-[11px] text-slate-500 italic leading-relaxed">
                  "{leadershipProfiles.headTeacher.quoteEn}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* All Teachers & Staff Members Grid (Principal & Head Teacher excluded to eliminate duplicate appearance) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-emerald-700" />
              <span>আমাদের সম্মানিত সহকারী শিক্ষক ও কর্মকর্তা পর্ষদ</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              আনন্দ পাঠশালা কুষ্টিয়ার নিবেদিতপ্রাণ শিক্ষক ও প্রশাসনিক কর্মকর্তা
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {generalFacultyList.map((teacher) => (
              <div
                key={teacher.id}
                className="rounded-2xl border p-4 flex items-center gap-4 transition-all hover:shadow-md bg-slate-50/60 border-slate-200 hover:border-emerald-300"
              >
                <img
                  src={teacher.photoUrl}
                  alt={teacher.nameBn}
                  referrerPolicy="no-referrer"
                  className="w-20 h-24 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0 bg-slate-200"
                />
                <div className="min-w-0 space-y-1">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                      teacher.isDirector
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-indigo-50 text-indigo-800'
                    }`}
                  >
                    {teacher.designationBn}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 truncate">{teacher.nameBn}</h4>
                  <p className="text-[11px] font-semibold text-slate-500 truncate">
                    {teacher.nameEn}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-medium truncate">
                    {teacher.departmentBn}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SEPARATE DEDICATED SECTION: INSTITUTION GOVERNING BODY & DIRECTORS' MESSAGES */}
      {/* ========================================================================= */}
      <section
        id="governing-body"
        className="bg-white rounded-3xl border border-amber-200/90 p-6 sm:p-8 shadow-2xs space-y-7"
      >
        {/* Section Header */}
        <div className="border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                <Building2 className="w-3.5 h-3.5 text-amber-700" />
                <span>প্রাতিষ্ঠানিক প্রশাসন ও নীতিনির্ধারণ</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <Users className="w-7 h-7 text-amber-600 shrink-0" />
              <span>প্রতিষ্ঠান পরিচালনা পর্ষদ ও দিকনির্দেশনা (Governing Body)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              আনন্দ পাঠশালা কুষ্টিয়ার সার্বিক নীতি নির্ধারণ, প্রাতিষ্ঠানিক উৎকর্ষ, শিশু অধিকার ও আধুনিক শিশুবান্ধব মন্টেসরি শিক্ষা নিশ্চিতকরণে নিবেদিতপ্রাণ সম্মানিত পরিচালনা পর্ষদ
            </p>
          </div>
        </div>

        {/* Board of Directors Presentation: Chairman on Top, Fellow Directors in Grid Below */}
        <div className="space-y-6">
          {/* Chairman / President Message (উপরে সভাপতির বাণী বড় বক্স আকারে) */}
          {(() => {
            const chairman = directorsList.find((d) => d.isChairman) || directorsList[0];
            if (!chairman) return null;
            return (
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/70 to-orange-50/40 rounded-3xl border border-amber-300/90 p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Chairman Avatar & Bio */}
                  <div className="flex sm:flex-col items-center sm:items-start gap-4 shrink-0 w-full md:w-64 border-b md:border-b-0 md:border-r border-amber-200/80 pb-4 md:pb-0 md:pr-6">
                    <div className="relative">
                      <img
                        src={chairman.photoUrl || logoUrl}
                        alt={chairman.nameBn}
                        referrerPolicy="no-referrer"
                        className="w-24 h-28 sm:w-28 sm:h-34 rounded-2xl object-cover border-2 border-amber-500 shadow-md bg-white p-0.5"
                      />
                      <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[9.5px] font-black px-2 py-0.5 rounded-full shadow-xs">
                        👑 সভাপতি
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950 border border-amber-300">
                        {chairman.roleBn}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                        {chairman.nameBn}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600">
                        {chairman.nameEn}
                      </p>
                      {chairman.professionBn && (
                        <p className="text-[11px] text-amber-900 font-medium flex items-center gap-1 pt-0.5">
                          <Briefcase className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>{chairman.professionBn}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Chairman Message Body */}
                  <div className="space-y-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 border-b border-amber-200/70 pb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquareQuote className="w-5 h-5 text-amber-600" />
                        <h4 className="text-sm sm:text-base font-black text-amber-950">
                          {chairman.roleBn} এর অফিসিয়াল বাণী ও দিকনির্দেশনা
                        </h4>
                      </div>
                      <Quote className="w-6 h-6 text-amber-400 shrink-0 opacity-70" />
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-white/80 p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-2xs">
                      “{chairman.messageBn}”
                    </p>

                    {chairman.messageEn && (
                      <p className="text-xs text-slate-600 italic leading-relaxed px-1">
                        "{chairman.messageEn}"
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-600">
                      <div className="flex items-center gap-4 flex-wrap">
                        {chairman.phone && (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-amber-600" />
                            <span>{chairman.phone}</span>
                          </div>
                        )}
                        {chairman.email && (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <Mail className="w-3.5 h-3.5 text-amber-600" />
                            <span>{chairman.email}</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewingDirector(chairman)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>পূর্ণাঙ্গ বিবরণ ও বাণী দেখুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Board Directors & Member Secretary Grid (ব্যবস্থাপনা পরিচালকসহ সকল পরিচালক ছোট বক্স আকারে) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span>পরিচালনা পর্ষদের সম্মানিত পরিচালক ও সদস্য সচিববৃন্দ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {directorsList
                .filter((d) => !d.isChairman)
                .map((director) => (
                  <div
                    key={director.id}
                    onClick={() => setViewingDirector(director)}
                    className="rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-amber-300 cursor-pointer group bg-gradient-to-b from-slate-50/40 to-white"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border ${
                            director.isManagingDirector
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : director.roleBn?.includes('সদস্য সচিব')
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {director.roleBn}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <img
                          src={director.photoUrl || logoUrl}
                          alt={director.nameBn}
                          referrerPolicy="no-referrer"
                          className="w-16 h-20 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                            {director.nameBn}
                          </h4>
                          <p className="text-[11px] font-semibold text-slate-500 truncate">
                            {director.nameEn}
                          </p>
                          {director.professionBn && (
                            <p className="text-[10.5px] text-slate-600 font-medium truncate pt-0.5">
                              {director.professionBn}
                            </p>
                          )}
                        </div>
                      </div>

                      {director.messageBn && (
                        <div className="text-xs text-slate-600 bg-amber-50/40 p-3 rounded-xl border border-amber-100/80 leading-relaxed line-clamp-3">
                          “{director.messageBn}”
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3 text-slate-500">
                        {director.phone && (
                          <span className="text-[11px] font-semibold flex items-center gap-1">
                            <Phone className="w-3 h-3 text-amber-600" />
                            <span>{director.phone}</span>
                          </span>
                        )}
                      </div>

                      <span className="text-amber-700 font-bold group-hover:underline inline-flex items-center gap-0.5 shrink-0">
                        <span>বাণী পড়ুন</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DIRECTOR DETAIL & SPEECH MODAL (পরিচালকের পূর্ণাঙ্গ বাণী ও প্রোফাইল)        */}
      {/* ========================================================================= */}
      {viewingDirector && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setViewingDirector(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-amber-200 my-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={viewingDirector.photoUrl || logoUrl}
                  alt={viewingDirector.nameBn}
                  referrerPolicy="no-referrer"
                  className="w-16 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-sm shrink-0 bg-white"
                />
                <div className="space-y-0.5">
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    {viewingDirector.roleBn}
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    {viewingDirector.nameBn}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {viewingDirector.nameEn}
                  </p>
                  {viewingDirector.professionBn && (
                    <p className="text-xs text-amber-900 font-medium">
                      {viewingDirector.professionBn}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingDirector(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {viewingDirector.phone && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">মোবাইল</span>
                  <span className="font-bold text-slate-800">{viewingDirector.phone}</span>
                </div>
              )}
              {viewingDirector.email && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">ইমেইল</span>
                  <span className="font-bold text-slate-800 truncate block">{viewingDirector.email}</span>
                </div>
              )}
              {viewingDirector.addressBn && (
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold block">ঠিকানা / এলাকা</span>
                  <span className="font-bold text-slate-800">{viewingDirector.addressBn}</span>
                </div>
              )}
            </div>

            {/* Official Message (পরিচালকের বাণী) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-black text-slate-900">
                  পরিচালকের দিকনির্দেশনা ও শুভবার্তা (Official Message)
                </h4>
              </div>
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 font-medium whitespace-pre-line">
                “{viewingDirector.messageBn || 'আনন্দ পাঠশালার সাথে শিশুদের ভবিষ্যৎ হোক আলোকোজ্জ্বল।'}”
              </div>
              {viewingDirector.messageEn && (
                <p className="text-xs text-slate-500 italic leading-relaxed pt-1">
                  "{viewingDirector.messageEn}"
                </p>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 font-medium">
                আনন্দ পাঠশালা পরিচালনা পর্ষদ · গোশালা, কুষ্টিয়া
              </div>

              <button
                type="button"
                onClick={() => setViewingDirector(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Best & Running Students Showcase */}
      <section id="students" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block">
              কৃতি শিক্ষার্থী · শিক্ষাবর্ষ ২০২৫-২০২৬
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Award className="w-7 h-7 text-amber-500" />
              <span>আমাদের কৃতি শিক্ষার্থীবৃন্দ (Best Students)</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {BEST_STUDENTS_BIDDALAY.map((stu) => (
            <div
              key={stu.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden hover:border-emerald-400 hover:shadow-sm transition-all flex flex-col"
            >
              <div className="h-36 bg-slate-200 overflow-hidden">
                <img
                  src={stu.photoUrl}
                  alt={stu.nameBn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-3 space-y-1 flex-1 flex flex-col justify-center bg-white">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded block w-fit">
                  {stu.classBn}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                  {stu.nameBn}
                </h4>
                <p className="text-[10px] text-slate-500 truncate">{stu.nameEn}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Core Pillars for Joyful Play School */}
      <section id="features" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block">
            কেন আনন্দ পাঠশালা সেরা?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            আমাদের ৪টি প্রধান বিশেষত্ব ও নিরাপত্তা ব্যবস্থা
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-amber-400 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">ভেরিফাইড গেট-পাস নিরাপত্তা</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ছুটির সময় অনুমোদিত ব্যক্তি ছাড়া কাউকে বাচ্চা দেওয়া হয় না। ছবি যাচাই, কিউআর স্ক্যান এবং ফোনে ইনস্ট্যান্ট কনফার্মেশন এসএমএস।
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-indigo-400 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">ডিজিটাল ক্লাসরুম ডায়েরি</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              আজ ক্লাসে শিশু কী ছড়া শিখেছে, ড্রয়িং করেছে কিংবা টিফিন কতটুকু খেয়েছে—অভিভাবকরা সরাসরি অ্যাপে ছবি ও অডিও ক্লিপসহ দেখতে পান।
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-rose-400 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">মমতাময়ী মায়াময় পরিবেশ</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ছোট শ্রেণিকক্ষে প্রতি ৮ জন শিশুর জন্য ১ জন যত্নশীল শিক্ষক। বকাঝকা মুক্ত, খেলাধুলা ও মায়াময় স্নেহমাখা পরিবেশ।
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-amber-400 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">হোলিস্টিক স্কিল রিপোর্ট কার্ড</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              মুখস্থ পরীক্ষার চাপ নয়; শিশুর সামাজিক গুণাবলী, শারীরিক বৃদ্ধি, সূক্ষ্ম মোটর স্কিল ও কল্পনাশক্তির আকর্ষণীয় রঙিন প্রগ্রেস কার্ড।
            </p>
          </div>
        </div>
      </section>

      {/* Curriculum Levels */}
      <section id="curriculum" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-black text-slate-900">আমাদের শ্রেণি ও পাঠক্রম ({schoolProfile.classesBn})</h2>
          <p className="text-xs text-slate-500">শিশুর সঠিক বয়সের সাথে সামঞ্জস্যপূর্ণ আনন্দময় পাঠক্রম</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* ১. হাতেখড়ি */}
          <div className="p-5 rounded-2xl bg-pink-50/70 border border-pink-200 space-y-2">
            <span className="text-[10px] font-bold text-pink-800 bg-pink-200/80 px-2 py-0.5 rounded uppercase">
              বয়স: ২.৫+ বছর
            </span>
            <h3 className="text-lg font-bold text-slate-900">হাতেখড়ি (Pre-Play)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              রঙের সাথে পরিচয়, সেন্সরি অ্যাক্টিভিটি, হাততালি ছড়া ও জড়িয়ে থাকার মায়াময় পরিবেশ
            </p>
          </div>

          {/* ২. প্লে */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded uppercase">
              বয়স: ৩+ বছর
            </span>
            <h3 className="text-lg font-bold text-slate-900">প্লে (Play)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              বর্ণমালা ও সুরের পরিচয়, রঙিন কাগজের ক্রাফট, ক্লে প্লে ও সামাজিক মেলামেশা
            </p>
          </div>

          {/* ৩. নার্সারি */}
          <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
            <span className="text-[10px] font-bold text-teal-800 bg-teal-200/80 px-2 py-0.5 rounded uppercase">
              বয়স: ৪+ বছর
            </span>
            <h3 className="text-lg font-bold text-slate-900">নার্সারি (Nursery)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              বাংলা ও ইংরেজি বর্ণ স্পষ্ট চেনা, ড্রয়িং ও সংখ্যা মেলানো ওয়ার্কশিট
            </p>
          </div>

          {/* ৪. কেজি */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded uppercase">
              বয়স: ৫+ বছর
            </span>
            <h3 className="text-lg font-bold text-slate-900">কেজি (KG)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ধ্বনি উচ্চারণ Phonics, গণনা, পরিবেশ ও স্বতঃস্ফূর্ত গল্প বলা
            </p>
          </div>

          {/* ৫. ওয়ান */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
            <span className="text-[10px] font-bold text-indigo-800 bg-indigo-200/80 px-2 py-0.5 rounded uppercase">
              বয়স: ৬+ বছর
            </span>
            <h3 className="text-lg font-bold text-slate-900">ওয়ান (Class 1)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              সহজ বাক্য গঠন, অনর্গল রিডিং, প্রাথমিক গণিত ও বিজ্ঞান কৌতূহল
            </p>
          </div>

          {/* ৬. টু */}
          <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
            <span className="text-[10px] font-bold text-purple-800 bg-purple-200/80 px-2 py-0.5 rounded uppercase">
              বয়স: ৭+ বছর
            </span>
            <h3 className="text-lg font-bold text-slate-900">টু (Class 2)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              পরিশীলিত হস্তলিপি, কৌতূহলী গণিত সমাধান, দ্বিভাষিক ভাষা চর্চা ও নেতৃত্ব বিকাশ
            </p>
          </div>
        </div>
      </section>

      {/* Online Admission Section */}
      <section id="apply" className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
            অনলাইন অ্যাডমিশন পোর্টাল ২০২৬ · আনন্দ পাঠশালা কুষ্টিয়া
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            আপনার সন্তানের ভর্তি আবেদনপত্র জমা দিন
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            ঘরে বসেই আবেদন করুন। আবেদন জমা দেওয়ার ২৪ ঘণ্টার মধ্যে আমাদের কুষ্টিয়া ক্যাম্পাস থেকে ফোনে যোগাযোগ করা হবে।
          </p>
        </div>

        {submittedApp ? (
          <div className="bg-emerald-950/80 border border-emerald-500/60 p-6 rounded-2xl text-center space-y-3 max-w-xl mx-auto">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-emerald-200">আবেদন সফলভাবে গৃহীত হয়েছে!</h3>
            <p className="text-xs text-slate-300">
              শিক্ষার্থী <span className="font-bold text-white">{submittedApp.applicantNameBn}</span>-এর আবেদন আইডি:
              <span className="font-mono font-bold text-emerald-400 ml-1">{submittedApp.id}</span>
            </p>
            <p className="text-xs text-slate-400">
              অভিভাবক ({submittedApp.guardianPhone}) নম্বরে কনফার্মেশন এসএমএস পাঠানো হয়েছে।
            </p>
            <button
              onClick={() => setSubmittedApp(null)}
              className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl"
            >
              আরেকটি নতুন আবেদন করুন
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitAdmission} className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/20 space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400 text-xs text-rose-100">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-200 block mb-1">শিশুর পূর্ণ নাম (বাংলায়):</label>
                <input
                  type="text"
                  required
                  value={applicantNameBn}
                  onChange={(e) => setApplicantNameBn(e.target.value)}
                  placeholder="যেমন: অন্বেষা মজুমদার"
                  className="w-full px-3.5 py-2 text-xs bg-white text-slate-900 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-200 block mb-1">শিশুর নাম (ইংরেজিতে):</label>
                <input
                  type="text"
                  value={applicantNameEn}
                  onChange={(e) => setApplicantNameEn(e.target.value)}
                  placeholder="e.g. Anwesha Mazumder"
                  className="w-full px-3.5 py-2 text-xs bg-white text-slate-900 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-200 block mb-1">জন্ম তারিখ:</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white text-slate-900 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-200 block mb-1">ভর্তি ইচ্ছুক শ্রেণি:</label>
                <select
                  value={applyingClass}
                  onChange={(e) => setApplyingClass(e.target.value as SchoolClass)}
                  className="w-full px-3.5 py-2 text-xs bg-white text-slate-900 rounded-xl focus:outline-none"
                >
                  {ALL_SCHOOL_CLASSES.map((cls, idx) => (
                    <option key={cls.id} value={cls.id}>
                      {idx + 1}. {cls.fullNameBn} ({cls.ageRangeBn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-200 block mb-1">পিতা / মাতার নাম:</label>
                <input
                  type="text"
                  required
                  value={guardianNameBn}
                  onChange={(e) => setGuardianNameBn(e.target.value)}
                  placeholder="যেমন: মো. রফিকুল ইসলাম"
                  className="w-full px-3.5 py-2 text-xs bg-white text-slate-900 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-200 block mb-1">অভিভাবকের মোবাইল নম্বর:</label>
                <input
                  type="text"
                  required
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="যেমন: ০১৯১৪-০৫৭৫১১"
                  className="w-full px-3.5 py-2 text-xs bg-white text-slate-900 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-200 block mb-1">বর্তমান বাসস্থান ঠিকানা:</label>
              <input
                type="text"
                value={addressBn}
                onChange={(e) => setAddressBn(e.target.value)}
                placeholder="যেমন: গোশালা / কোর্টপাড়া / মজমপুর, কুষ্টিয়া"
                className="w-full px-3.5 py-2 text-xs bg-white text-slate-900 rounded-xl focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                আবেদনপত্র জমা দিন (Submit Application)
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Authentic Kushtia Campus Info & Contacts */}
      <footer className="border-t border-slate-200 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-sm">আনন্দ পাঠশালা কুষ্টিয়া ক্যাম্পাস</h4>
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{schoolProfile.addressBn}</span>
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-sm">যোগাযোগ ও হেল্পলাইন</h4>
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{schoolProfile.phoneBn}</span>
          </p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{schoolProfile.email}</span>
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-sm">অফিশিয়াল সোশ্যাল ও ওয়েব</h4>
          <p>রবিবার — বৃহস্পতিবার: সকাল ০৮:০০ — দুপুর ০১:৩০</p>
          <a
            href={schoolProfile.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
          >
            <span>facebook.com/AnandaPathshalaKushtia</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
      </div>

      {/* Global Notice Detail Modal (Triggered by Ticker or Direct Link) */}
      {selectedNoticeForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  {selectedNoticeForModal.badgeBn}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {selectedNoticeForModal.titleBn}
                </h3>
                {selectedNoticeForModal.titleEn && (
                  <p className="text-xs text-slate-400 font-mono">{selectedNoticeForModal.titleEn}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedNoticeForModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">প্রকাশের তারিখ:</span>
                <span className="font-bold text-slate-800">{selectedNoticeForModal.dateBn}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">প্রাপক / লক্ষ্য দল:</span>
                <span className="font-bold text-slate-800">{selectedNoticeForModal.targetAudienceBn}</span>
              </div>
              {selectedNoticeForModal.validUntilBn && (
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">কার্যকাল / শেষ সময়:</span>
                  <span className="font-bold text-rose-700">{selectedNoticeForModal.validUntilBn}</span>
                </div>
              )}
              {selectedNoticeForModal.attachmentName && (
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">সংযুক্ত ফাইল:</span>
                  <span className="font-bold text-emerald-700">{selectedNoticeForModal.attachmentName}</span>
                </div>
              )}
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white">
              {selectedNoticeForModal.descriptionBn}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>প্রিন্ট</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedNoticeForModal.actionLink && (
                  <a
                    href={selectedNoticeForModal.actionLink}
                    onClick={() => setSelectedNoticeForModal(null)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{selectedNoticeForModal.actionTextBn || 'ফর্ম দেখুন'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedNoticeForModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

