import React, { useState, useEffect } from 'react';
import { GraduationCap, ShieldCheck, UserCheck, Trash2 } from 'lucide-react';
import {
  TeacherMember,
  PortalAccountRole,
  SchoolClass,
} from '../../types/school';
import { ALL_SCHOOL_CLASSES, getPortalNameForRoleBn } from '../../utils/schoolLogic';

interface EditTeacherModalProps {
  isOpen: boolean;
  isAddingNew: boolean;
  initialStaffCategory?: 'teacher' | 'support_staff';
  teacher: TeacherMember | null;
  teachersCount: number;
  onClose: () => void;
  onSave: (
    teacherData: Omit<TeacherMember, 'id'> & { id?: string },
    isNew: boolean
  ) => void;
  onDelete?: (id: string, nameBn: string) => void;
}

export const EditTeacherModal: React.FC<EditTeacherModalProps> = ({
  isOpen,
  isAddingNew,
  initialStaffCategory = 'teacher',
  teacher,
  teachersCount,
  onClose,
  onSave,
  onDelete,
}) => {
  const [teacherFormNameBn, setTeacherFormNameBn] = useState('');
  const [teacherFormNameEn, setTeacherFormNameEn] = useState('');
  const [teacherFormDesignationBn, setTeacherFormDesignationBn] = useState('');
  const [teacherFormDepartmentBn, setTeacherFormDepartmentBn] = useState('');
  const [teacherFormPhotoUrl, setTeacherFormPhotoUrl] = useState('');
  const [teacherFormStaffCategory, setTeacherFormStaffCategory] = useState<
    'teacher' | 'support_staff' | 'principal'
  >('teacher');
  const [teacherFormPortalRole, setTeacherFormPortalRole] =
    useState<PortalAccountRole>('teacher');
  const [teacherFormUsername, setTeacherFormUsername] = useState('');
  const [teacherFormPassword, setTeacherFormPassword] = useState('123456');
  const [teacherFormPhone, setTeacherFormPhone] = useState('');
  const [teacherFormEmail, setTeacherFormEmail] = useState('');
  const [teacherFormAssignedClass, setTeacherFormAssignedClass] =
    useState<SchoolClass>('Nursery');

  useEffect(() => {
    if (!isOpen) return;

    if (isAddingNew) {
      setTeacherFormNameBn('');
      setTeacherFormNameEn('');
      if (initialStaffCategory === 'support_staff') {
        setTeacherFormDesignationBn('গেট সিকিউরিটি ও সহায়ক স্টাফ (Support Staff)');
        setTeacherFormDepartmentBn('ক্যাম্পাস নিরাপত্তা ও সহায়ক সেবা বিভাগ');
        setTeacherFormPhotoUrl('/assets/fb/logo.jpg');
        setTeacherFormStaffCategory('support_staff');
        setTeacherFormPortalRole('gate_security');
        setTeacherFormUsername(`staff${teachersCount + 1}`);
        setTeacherFormAssignedClass('HateKhori');
      } else {
        setTeacherFormDesignationBn('সহকারী শিক্ষক (Teacher)');
        setTeacherFormDepartmentBn('প্লে ও নার্সারি শাখা');
        setTeacherFormPhotoUrl('/assets/biddalay/mahmuda_haque.jpg');
        setTeacherFormStaffCategory('teacher');
        setTeacherFormPortalRole('teacher');
        setTeacherFormUsername(`teacher${teachersCount + 1}`);
        setTeacherFormAssignedClass('Nursery');
      }
      setTeacherFormPassword('123456');
      setTeacherFormPhone('');
      setTeacherFormEmail('');
    } else if (teacher) {
      setTeacherFormNameBn(teacher.nameBn);
      setTeacherFormNameEn(teacher.nameEn);
      setTeacherFormDesignationBn(teacher.designationBn);
      setTeacherFormDepartmentBn(teacher.departmentBn);
      setTeacherFormPhotoUrl(teacher.photoUrl);
      const cat =
        teacher.staffCategory ||
        (teacher.designationBn.includes('প্রিন্সিপাল')
          ? 'principal'
          : teacher.designationBn.includes('স্টাফ') ||
            teacher.designationBn.includes('সিকিউরিটি')
          ? 'support_staff'
          : 'teacher');
      setTeacherFormStaffCategory(cat);
      const defaultRole: PortalAccountRole =
        teacher.portalRole ||
        (cat === 'principal'
          ? 'principal'
          : cat === 'support_staff'
          ? 'gate_security'
          : 'teacher');
      setTeacherFormPortalRole(defaultRole);
      setTeacherFormUsername(
        teacher.username ||
          teacher.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) ||
          teacher.id
      );
      setTeacherFormPassword(teacher.password || '123456');
      setTeacherFormPhone(teacher.phone || '01914057511');
      setTeacherFormEmail(
        teacher.email || `${teacher.username || teacher.id}@anandapathshala.edu.bd`
      );
      setTeacherFormAssignedClass(teacher.assignedClass || 'Nursery');
    }
  }, [isOpen, isAddingNew, teacher, initialStaffCategory, teachersCount]);

  if (!isOpen) return null;

  const handleTeacherPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTeacherFormPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherFormNameBn.trim()) return;

    const cleanUsername =
      teacherFormUsername.trim() ||
      teacherFormNameEn.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) ||
      `staff_${Date.now().toString().slice(-4)}`;
    const cleanPassword = teacherFormPassword.trim() || '123456';
    const assignedRole: PortalAccountRole = teacherFormPortalRole || 'teacher';

    const teacherData = {
      id: teacher?.id,
      nameBn: teacherFormNameBn.trim(),
      nameEn: teacherFormNameEn.trim() || teacherFormNameBn.trim(),
      designationBn:
        teacherFormDesignationBn.trim() || 'সহকারী শিক্ষক (Teacher)',
      designationEn:
        teacherFormStaffCategory === 'support_staff'
          ? 'Support Staff'
          : teacherFormStaffCategory === 'principal'
          ? 'Principal'
          : 'Teacher',
      photoUrl:
        teacherFormPhotoUrl.trim() || '/assets/biddalay/mahmuda_haque.jpg',
      departmentBn: teacherFormDepartmentBn.trim() || 'সাধারণ বিভাগ',
      staffCategory: teacherFormStaffCategory,
      portalRole: assignedRole,
      username: cleanUsername,
      password: cleanPassword,
      phone: teacherFormPhone.trim() || '01914057511',
      email:
        teacherFormEmail.trim() ||
        `${cleanUsername}@anandapathshala.edu.bd`,
      assignedClass: teacherFormAssignedClass,
    };

    onSave(teacherData, isAddingNew);
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
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-8 max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
              👩‍🏫 শিক্ষক পর্ষদ ব্যবস্থাপনা
            </span>
            <h4 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
              <span>
                {isAddingNew
                  ? teacherFormStaffCategory === 'support_staff'
                    ? 'নতুন সহায়ক স্টাফ যুক্ত করুন'
                    : 'নতুন শিক্ষক পর্ষদে যুক্ত করুন'
                  : `${
                      teacherFormStaffCategory === 'support_staff'
                        ? 'সহায়ক স্টাফ'
                        : 'শিক্ষক'
                    } "${teacher?.nameBn}" এর প্রোফাইল ও অ্যাকাউন্ট এডিট`}
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              নাম, পদবি, ক্যাটাগরি এবং পোর্টাল লগইন আইডি, পাসওয়ার্ড ও রোল নির্ধারণ করুন
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

        {/* Teacher / Support Staff Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Category Selector: Teacher vs Support Staff */}
          <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setTeacherFormStaffCategory('teacher');
                if (teacherFormPortalRole === 'gate_security') {
                  setTeacherFormPortalRole('teacher');
                }
              }}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                teacherFormStaffCategory === 'teacher'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              👩‍🏫 শিক্ষক মন্ডলী (Teacher)
            </button>
            <button
              type="button"
              onClick={() => {
                setTeacherFormStaffCategory('support_staff');
                setTeacherFormPortalRole('gate_security');
              }}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                teacherFormStaffCategory === 'support_staff'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              🛡️ সহায়ক স্টাফ / সিকিউরিটি (Support Staff)
            </button>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                {teacherFormStaffCategory === 'support_staff'
                  ? 'স্টাফের নাম (বাংলা) *'
                  : 'শিক্ষকের নাম (বাংলা) *'}
              </label>
              <input
                type="text"
                required
                value={teacherFormNameBn}
                onChange={(e) => setTeacherFormNameBn(e.target.value)}
                placeholder="যেমন: সৈয়দা ফারহানা আক্তার"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">নাম (English)</label>
              <input
                type="text"
                value={teacherFormNameEn}
                onChange={(e) => setTeacherFormNameEn(e.target.value)}
                placeholder="e.g. Syeda Farhana Akter"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Designation & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">পদবি (Designation) *</label>
              <input
                type="text"
                required
                value={teacherFormDesignationBn}
                onChange={(e) => setTeacherFormDesignationBn(e.target.value)}
                placeholder="যেমন: সহকারী শিক্ষক (Teacher)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">বিভাগ বা শ্রেণি দায়িত্ব *</label>
              <input
                type="text"
                required
                value={teacherFormDepartmentBn}
                onChange={(e) => setTeacherFormDepartmentBn(e.target.value)}
                placeholder="যেমন: প্লে ও নার্সারি বিভাগ / আর্ট ল্যাব"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Contact Phone, Email & Assigned Class */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                মোবাইল নম্বর (লগইন ও যোগাযোগ)
              </label>
              <input
                type="text"
                value={teacherFormPhone}
                onChange={(e) => setTeacherFormPhone(e.target.value)}
                placeholder="01722334455"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">ইমেইল ঠিকানা</label>
              <input
                type="email"
                value={teacherFormEmail}
                onChange={(e) => setTeacherFormEmail(e.target.value)}
                placeholder="teacher@anandapathshala.edu.bd"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">নির্ধারিত শ্রেণি (Class)</label>
              <select
                value={teacherFormAssignedClass}
                onChange={(e) =>
                  setTeacherFormAssignedClass(e.target.value as SchoolClass)
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                {ALL_SCHOOL_CLASSES.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.nameBn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PORTAL LOGIN ACCOUNT & ROLE ASSIGNMENT SECTION */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>🔐 পোর্টাল অ্যাকাউন্ট, লগইন আইডি, পাসওয়ার্ড ও রোল নির্ধারণ</span>
              </span>
              <span className="text-[10px] font-bold bg-emerald-700 text-white px-2.5 py-0.5 rounded-full">
                {getPortalNameForRoleBn(teacherFormPortalRole)}
              </span>
            </div>
            <p className="text-[11px] text-emerald-900/90 leading-relaxed">
              প্রোফাইল তৈরির সাথে সাথে এই ব্যক্তির নিজস্ব পোর্টাল লগইন অ্যাকাউন্ট সক্রিয় হবে। তিনি নিচের ইউজার আইডি, মোবাইল বা ইমেইল এবং পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  লগইন ইউজার আইডি (User ID) *
                </label>
                <input
                  type="text"
                  required
                  value={teacherFormUsername}
                  onChange={(e) => setTeacherFormUsername(e.target.value)}
                  placeholder="যেমন: teacher1 / staff1"
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  লগইন পাসওয়ার্ড (Password) *
                </label>
                <input
                  type="text"
                  required
                  value={teacherFormPassword}
                  onChange={(e) => setTeacherFormPassword(e.target.value)}
                  placeholder="যেমন: 123456"
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  পোর্টাল অ্যাক্সেস রোল (Role) *
                </label>
                <select
                  value={teacherFormPortalRole}
                  onChange={(e) =>
                    setTeacherFormPortalRole(e.target.value as PortalAccountRole)
                  }
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="teacher">👩‍🏫 শিক্ষক (Teacher)</option>
                  <option value="principal">🎓 প্রিন্সিপাল (Principal)</option>
                  <option value="gate_security">
                    🛡️ সহায়ক স্টাফ / গেট সিকিউরিটি (Support Staff)
                  </option>
                  <option value="director">🏛️ পরিচালক (Director)</option>
                  <option value="parent">👨‍👧 অভিভাবক / শিক্ষার্থী (Guardian)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Photo Upload & Presets */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="font-bold text-slate-800 block">ছবি পরিবর্তন / আপলোড</label>
            <div className="flex items-center gap-3">
              {teacherFormPhotoUrl && (
                <img
                  src={teacherFormPhotoUrl}
                  alt="ছবি প্রিভিউ"
                  referrerPolicy="no-referrer"
                  className="w-14 h-16 rounded-xl object-cover border-2 border-emerald-500 bg-white shrink-0"
                />
              )}
              <div className="space-y-1.5 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTeacherPhotoUpload}
                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white cursor-pointer"
                />
                <input
                  type="text"
                  value={teacherFormPhotoUrl}
                  onChange={(e) => setTeacherFormPhotoUrl(e.target.value)}
                  placeholder="বা ছবির URL লিখুন..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
            <div>
              {!isAddingNew && teacher && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(teacher.id, teacher.nameBn)}
                  className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
                  title="শিক্ষককে তালিকা থেকে অপসারিত করুন"
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
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
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
