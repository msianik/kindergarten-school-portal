import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, UserCheck, Trash2, Quote } from 'lucide-react';
import { CommitteeDirector, PortalAccountRole } from '../../types/school';
import { getPortalNameForRoleBn } from '../../utils/schoolLogic';

interface EditDirectorModalProps {
  isOpen: boolean;
  isAddingNew: boolean;
  director: CommitteeDirector | null;
  directorsCount: number;
  logoUrl?: string;
  onClose: () => void;
  onSave: (
    directorData: Omit<CommitteeDirector, 'id'> & { id?: string },
    isNew: boolean
  ) => void;
  onDelete?: (id: string, nameBn: string) => void;
}

export const EditDirectorModal: React.FC<EditDirectorModalProps> = ({
  isOpen,
  isAddingNew,
  director,
  directorsCount,
  logoUrl,
  onClose,
  onSave,
  onDelete,
}) => {
  const [directorFormNameBn, setDirectorFormNameBn] = useState('');
  const [directorFormNameEn, setDirectorFormNameEn] = useState('');
  const [directorFormRoleBn, setDirectorFormRoleBn] = useState('');
  const [directorFormRoleEn, setDirectorFormRoleEn] = useState('');
  const [directorFormDesignationBn, setDirectorFormDesignationBn] = useState('');
  const [directorFormDesignationEn, setDirectorFormDesignationEn] = useState('');
  const [directorFormMessageBn, setDirectorFormMessageBn] = useState('');
  const [directorFormProfessionBn, setDirectorFormProfessionBn] = useState('');
  const [directorFormPhone, setDirectorFormPhone] = useState('');
  const [directorFormEmail, setDirectorFormEmail] = useState('');
  const [directorFormFacebookUrl, setDirectorFormFacebookUrl] = useState('');
  const [directorFormAddressBn, setDirectorFormAddressBn] = useState('');
  const [directorFormPhotoUrl, setDirectorFormPhotoUrl] = useState('');
  const [directorFormIsChairman, setDirectorFormIsChairman] = useState(false);
  const [directorFormIsManagingDirector, setDirectorFormIsManagingDirector] =
    useState(false);
  const [directorFormUsername, setDirectorFormUsername] = useState('');
  const [directorFormPassword, setDirectorFormPassword] = useState('123456');
  const [directorFormPortalRole, setDirectorFormPortalRole] =
    useState<PortalAccountRole>('director');

  useEffect(() => {
    if (!isOpen) return;

    if (isAddingNew) {
      setDirectorFormNameBn('');
      setDirectorFormNameEn('');
      setDirectorFormRoleBn('সম্মানিত পরিচালক (Director)');
      setDirectorFormRoleEn('Director');
      setDirectorFormDesignationBn('সম্মানিত বোর্ড পরিচালক ও ট্রাস্টি');
      setDirectorFormDesignationEn('Board Member & Trustee');
      setDirectorFormMessageBn('');
      setDirectorFormProfessionBn('');
      setDirectorFormPhone('');
      setDirectorFormEmail('');
      setDirectorFormFacebookUrl('https://www.facebook.com/AnandaPathshalaKushtia');
      setDirectorFormAddressBn('কুষ্টিয়া সদর');
      setDirectorFormPhotoUrl('/assets/fb/photo-6.jpg');
      setDirectorFormIsChairman(false);
      setDirectorFormIsManagingDirector(false);
      setDirectorFormUsername(`director${directorsCount + 1}`);
      setDirectorFormPassword('123456');
      setDirectorFormPortalRole('director');
    } else if (director) {
      setDirectorFormNameBn(director.nameBn);
      setDirectorFormNameEn(director.nameEn);
      setDirectorFormRoleBn(director.roleBn);
      setDirectorFormRoleEn(director.roleEn || 'Director');
      setDirectorFormDesignationBn(director.designationBn || '');
      setDirectorFormDesignationEn(director.designationEn || '');
      setDirectorFormMessageBn(director.messageBn || '');
      setDirectorFormProfessionBn(director.professionBn || '');
      setDirectorFormPhone(director.phone || '');
      setDirectorFormEmail(director.email || '');
      setDirectorFormFacebookUrl(
        director.facebookUrl || 'https://www.facebook.com/AnandaPathshalaKushtia'
      );
      setDirectorFormAddressBn(director.addressBn || '');
      setDirectorFormPhotoUrl(director.photoUrl || '/assets/fb/photo-6.jpg');
      setDirectorFormIsChairman(!!director.isChairman);
      setDirectorFormIsManagingDirector(!!director.isManagingDirector);
      setDirectorFormUsername(
        director.username ||
          director.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) ||
          director.id
      );
      setDirectorFormPassword(director.password || '123456');
      setDirectorFormPortalRole(
        director.isManagingDirector
          ? 'super_admin'
          : director.portalRole || 'director'
      );
    }
  }, [isOpen, isAddingNew, director, directorsCount]);

  if (!isOpen) return null;

  const handleDirectorPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDirectorFormPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directorFormNameBn.trim()) return;

    const cleanUsername =
      directorFormUsername.trim() ||
      directorFormNameEn.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) ||
      `dir_${Date.now().toString().slice(-4)}`;
    const cleanPassword = directorFormPassword.trim() || '123456';
    const assignedRole: PortalAccountRole =
      directorFormPortalRole || (directorFormIsManagingDirector ? 'super_admin' : 'director');

    const directorData = {
      id: director?.id,
      nameBn: directorFormNameBn.trim(),
      nameEn: directorFormNameEn.trim() || directorFormNameBn.trim(),
      roleBn: directorFormRoleBn.trim() || 'পরিচালক (Director)',
      roleEn: directorFormRoleEn.trim() || 'Director',
      designationBn:
        directorFormDesignationBn.trim() ||
        (directorFormIsChairman
          ? 'সভাপতি ও চেয়ারম্যান, পরিচালনা পর্ষদ'
          : directorFormIsManagingDirector
          ? 'ব্যবস্থাপনা পরিচালক'
          : 'সম্মানিত বোর্ড পরিচালক ও ট্রাস্টি'),
      designationEn:
        directorFormDesignationEn.trim() ||
        (directorFormIsChairman
          ? 'Chairman, Governing Body'
          : directorFormIsManagingDirector
          ? 'Managing Director'
          : 'Board Director'),
      messageBn: directorFormMessageBn.trim(),
      professionBn: directorFormProfessionBn.trim() || undefined,
      phone: directorFormPhone.trim() || undefined,
      email: directorFormEmail.trim() || undefined,
      facebookUrl: directorFormFacebookUrl.trim() || undefined,
      addressBn: directorFormAddressBn.trim() || undefined,
      photoUrl: directorFormPhotoUrl.trim() || '/assets/fb/photo-6.jpg',
      isChairman: directorFormIsChairman,
      isManagingDirector: directorFormIsManagingDirector,
      portalRole: assignedRole,
      username: cleanUsername,
      password: cleanPassword,
    };

    onSave(directorData, isAddingNew);
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
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-amber-300 my-8 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase border border-amber-300">
              🏛️ পরিচালনা পর্ষদ ব্যবস্থাপনা
            </span>
            <h4 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              <span>
                {isAddingNew
                  ? '+ নতুন পরিচালক পর্ষদ সদস্য যুক্ত করুন'
                  : `পরিচালক "${director?.nameBn}" এর তথ্য ও বাণী সম্পাদনা`}
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              পরিচালকের নাম, পদবি, দিকনির্দেশনামূলক বাণী, পেশা ও যোগাযোগের তথ্য সম্পাদনা করুন
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

        {/* Director Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">পরিচালকের নাম (বাংলা) *</label>
              <input
                type="text"
                required
                value={directorFormNameBn}
                onChange={(e) => setDirectorFormNameBn(e.target.value)}
                placeholder="যেমন: আল নোমান"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">নাম (English)</label>
              <input
                type="text"
                value={directorFormNameEn}
                onChange={(e) => setDirectorFormNameEn(e.target.value)}
                placeholder="e.g. Al Noman"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Board Role & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Board Role */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block flex items-center justify-between">
                <span>পর্ষদীয় ভূমিকা / দায়িত্ব (Board Role) *</span>
                <span className="text-[10px] text-amber-700 font-semibold">
                  যেমন: সভাপতি, এমডি, সদস্য সচিব
                </span>
              </label>
              <input
                type="text"
                required
                value={directorFormRoleBn}
                onChange={(e) => setDirectorFormRoleBn(e.target.value)}
                placeholder="যেমন: সভাপতি / চেয়ারম্যান (Chairman)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-xs font-semibold"
              />
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-slate-400 font-semibold">কমন ভূমিকা:</span>
                {[
                  'সভাপতি / চেয়ারম্যান (Chairman)',
                  'ব্যবস্থাপনা পরিচালক (Managing Director)',
                  'পরিচালক ও সদস্য সচিব (Director & Secretary)',
                  'সম্মানিত পরিচালক (Director)',
                  'উপদেষ্টা (Advisor)',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setDirectorFormRoleBn(preset);
                      if (preset.includes('চেয়ারম্যান') || preset.includes('সভাপতি')) {
                        setDirectorFormIsChairman(true);
                        setDirectorFormIsManagingDirector(false);
                      } else if (preset.includes('ব্যবস্থাপনা পরিচালক')) {
                        setDirectorFormIsManagingDirector(true);
                        setDirectorFormIsChairman(false);
                      }
                    }}
                    className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md text-[10px] font-semibold transition cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Institutional Designation */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block flex items-center justify-between">
                <span>প্রাতিষ্ঠানিক পদবি (Designation)</span>
                <span className="text-[10px] text-slate-500">ঐচ্ছিক / স্পেসিফিক টাইটেল</span>
              </label>
              <input
                type="text"
                value={directorFormDesignationBn}
                onChange={(e) => setDirectorFormDesignationBn(e.target.value)}
                placeholder="যেমন: সভাপতি ও চেয়ারম্যান, পরিচালনা পর্ষদ"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-xs"
              />
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-slate-400 font-semibold">প্রস্তাবিত পদবি:</span>
                {[
                  'সভাপতি ও চেয়ারম্যান, পরিচালনা পর্ষদ',
                  'ব্যবস্থাপনা পরিচালক ও আইটি হেড',
                  'পরিচালক ও সদস্য সচিব (Director & Secretary)',
                  'সম্মানিত বোর্ড পরিচালক ও শিক্ষা উপদেষ্টা',
                  'পরিচালন উপদেষ্টা ও শিশুশিক্ষা বিশেষজ্ঞ',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDirectorFormDesignationBn(preset)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-md text-[10px] font-semibold transition cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Official Director's Message */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300">
            <div className="flex items-center justify-between">
              <label className="font-black text-amber-950 block flex items-center gap-1.5 text-xs">
                <Quote className="w-4 h-4 text-amber-700" />
                <span>Message from the Director (পরিচালকের দিকনির্দেশনামূলক বাণী) *</span>
              </label>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                পাবলিক ওয়েবসাইটে স্পটলাইটে প্রদর্শিত হবে
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80 leading-normal">
              আনন্দ পাঠশালার প্রাতিষ্ঠানিক লক্ষ্য, শিশুর স্বাভাবিক বিকাশ ও ভবিষ্যৎ পরিকল্পনা বিষয়ে পরিচালকের নিজস্ব বাণী ও দিকনির্দেশনা লিখুন।
            </p>
            <textarea
              rows={4}
              required
              value={directorFormMessageBn}
              onChange={(e) => setDirectorFormMessageBn(e.target.value)}
              placeholder="যেমন: শিশুদের জন্য একটি নিরাপদ, আধুনিক প্রযুক্তি ও বাস্তব জীবনমুখী আনন্দময় পাঠদান ব্যবস্থার প্রবর্তন করাই আমাদের বিশেষত্ব..."
              className="w-full px-3 py-2.5 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans shadow-2xs"
            />
            <div className="flex items-center justify-between text-[10px] text-amber-800 font-medium">
              <span>
                শব্দ সংখ্যা: {directorFormMessageBn.trim() ? directorFormMessageBn.trim().split(/\s+/).length : 0} টি
              </span>
              <span>অক্ষর সংখ্যা: {directorFormMessageBn.length} টি</span>
            </div>
          </div>

          {/* Profession, Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">পেশা / পরিচিতি</label>
              <input
                type="text"
                value={directorFormProfessionBn}
                onChange={(e) => setDirectorFormProfessionBn(e.target.value)}
                placeholder="যেমন: প্রযুক্তি উদ্যোক্তা"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">মোবাইল নম্বর</label>
              <input
                type="text"
                value={directorFormPhone}
                onChange={(e) => setDirectorFormPhone(e.target.value)}
                placeholder="০১৯১৪-০৫৭৫১১"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">ইমেইল ঠিকানা</label>
              <input
                type="email"
                value={directorFormEmail}
                onChange={(e) => setDirectorFormEmail(e.target.value)}
                placeholder="director@anandapathshala.edu.bd"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Address & Facebook URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">ঠিকানা / এলাকা</label>
              <input
                type="text"
                value={directorFormAddressBn}
                onChange={(e) => setDirectorFormAddressBn(e.target.value)}
                placeholder="গোশালা, কুষ্টিয়া"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">ফেসবুক প্রোফাইল লিংক</label>
              <input
                type="text"
                value={directorFormFacebookUrl}
                onChange={(e) => setDirectorFormFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Photo Upload & Presets */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="font-bold text-slate-800 block">
              পরিচালকের ছবি পরিবর্তন / আপলোড
            </label>
            <div className="flex items-center gap-3">
              <img
                src={directorFormPhotoUrl || logoUrl}
                alt="ছবি প্রিভিউ"
                referrerPolicy="no-referrer"
                className="w-14 h-16 rounded-xl object-cover border-2 border-amber-500 bg-white shrink-0"
              />
              <div className="space-y-1.5 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDirectorPhotoUpload}
                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white cursor-pointer"
                />
                <input
                  type="text"
                  value={directorFormPhotoUrl}
                  onChange={(e) => setDirectorFormPhotoUrl(e.target.value)}
                  placeholder="বা ছবির URL লিখুন..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
              <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                প্রিসেট ছবি:
              </span>
              {[
                '/assets/fb/photo-6.jpg',
                '/assets/fb/photo-5.jpg',
                '/assets/biddalay/mostofa_mamun.jpg',
                '/assets/fb/photo-2.jpg',
                '/assets/fb/photo-3.jpg',
              ].map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setDirectorFormPhotoUrl(url)}
                  className={`w-7 h-7 rounded-lg overflow-hidden border shrink-0 transition ${
                    directorFormPhotoUrl === url
                      ? 'border-amber-600 ring-2 ring-amber-400'
                      : 'border-slate-300'
                  }`}
                >
                  <img src={url} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* DIRECTOR PORTAL LOGIN ACCOUNT & ROLE ASSIGNMENT SECTION */}
          <div className="p-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-300 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>🔐 পরিচালকের পোর্টাল অ্যাকাউন্ট (লগইন আইডি, পাসওয়ার্ড ও রোল নির্ধারণ)</span>
              </span>
              <span className="text-[10px] font-bold bg-emerald-700 text-white px-2.5 py-0.5 rounded-full">
                {getPortalNameForRoleBn(directorFormPortalRole)}
              </span>
            </div>
            <p className="text-[11px] text-emerald-900/90 leading-relaxed">
              প্রোফাইল তৈরি বা আপডেটের সাথে সাথেই এই পরিচালকের জন্য একটি স্বতন্ত্র লগইন অ্যাকাউন্ট তৈরি হবে।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">লগইন ইউজার আইডি (User ID) *</label>
                <input
                  type="text"
                  required
                  value={directorFormUsername}
                  onChange={(e) => setDirectorFormUsername(e.target.value)}
                  placeholder="যেমন: noman / director6"
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">লগইন পাসওয়ার্ড (Password) *</label>
                <input
                  type="text"
                  required
                  value={directorFormPassword}
                  onChange={(e) => setDirectorFormPassword(e.target.value)}
                  placeholder="যেমন: 123456"
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">পোর্টাল রোল (Role) *</label>
                <select
                  value={directorFormPortalRole}
                  onChange={(e) =>
                    setDirectorFormPortalRole(e.target.value as PortalAccountRole)
                  }
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="director">🏛️ পরিচালক (Director)</option>
                  <option value="super_admin">👑 সুপার অ্যাডমিন (Super Admin)</option>
                  <option value="principal">🎓 প্রিন্সিপাল (Principal)</option>
                  <option value="teacher">👩‍🏫 শিক্ষক (Teacher)</option>
                  <option value="parent">👨‍👧 অভিভাবক (Guardian)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-amber-50/50 border border-amber-200">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={directorFormIsChairman}
                onChange={(e) => {
                  setDirectorFormIsChairman(e.target.checked);
                  if (e.target.checked) setDirectorFormIsManagingDirector(false);
                }}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>👑 পর্ষদের সভাপতি / চেয়ারম্যান (Chairman)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={directorFormIsManagingDirector}
                onChange={(e) => {
                  setDirectorFormIsManagingDirector(e.target.checked);
                  if (e.target.checked) setDirectorFormIsChairman(false);
                }}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>⭐ ব্যবস্থাপনা পরিচালক (Managing Director)</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
            <div>
              {!isAddingNew && director && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(director.id, director.nameBn)}
                  className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
                  title="পরিচালককে তালিকা থেকে মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>মুছে ফেলুন</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isAddingNew ? 'যুক্ত করুন' : 'সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
