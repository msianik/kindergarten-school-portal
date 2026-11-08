import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  SchoolClass,
  UserRole,
  StudentHealthProfile,
  StudentAllergyItem,
  VaccinationRecord,
  SchoolProfile,
} from '../types/school';
import {
  toBengaliNumber,
  getSchoolClassNameBn,
} from '../utils/schoolLogic';
import {
  getStoredHealthProfiles,
  updateStudentHealthProfile,
  resetHealthProfilesToDefault,
  exportHealthProfilesCsv,
  calculateBmi,
  HEALTH_PROFILES_UPDATE_EVENT,
} from '../utils/healthLogic';
import { SCHOOL_PROFILE } from '../data/mockData';
import {
  Heart,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  Printer,
  Download,
  Edit3,
  CheckCircle2,
  Calendar,
  Sparkles,
  User,
  Phone,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Check,
  Stethoscope,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface ChildHealthModuleProps {
  students: Student[];
  currentRole: UserRole;
  schoolProfile?: SchoolProfile;
  initialClass?: SchoolClass;
  loggedInStudentId?: string;
}

const CLASS_ITEMS: { id: SchoolClass; nameBn: string; color: string }[] = [
  { id: 'HateKhori', nameBn: 'হাতেখড়ি', color: 'border-pink-300 text-pink-700 bg-pink-50' },
  { id: 'Play', nameBn: 'প্লে', color: 'border-emerald-300 text-emerald-700 bg-emerald-50' },
  { id: 'Nursery', nameBn: 'নার্সারি', color: 'border-teal-300 text-teal-700 bg-teal-50' },
  { id: 'KG', nameBn: 'কেজি', color: 'border-amber-300 text-amber-700 bg-amber-50' },
  { id: 'Class-1', nameBn: 'ওয়ান', color: 'border-indigo-300 text-indigo-700 bg-indigo-50' },
  { id: 'Class-2', nameBn: 'টু', color: 'border-purple-300 text-purple-700 bg-purple-50' },
];

export const ChildHealthModule: React.FC<ChildHealthModuleProps> = ({
  students,
  currentRole,
  schoolProfile = SCHOOL_PROFILE,
  initialClass = 'Nursery',
  loggedInStudentId,
}) => {
  const [healthProfiles, setHealthProfiles] = useState<StudentHealthProfile[]>(() =>
    getStoredHealthProfiles()
  );
  const [selectedClass, setSelectedClass] = useState<SchoolClass>(initialClass);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAllergyOnly, setFilterAllergyOnly] = useState<boolean>(false);

  // Modals
  const [activeHealthCardStudentId, setActiveHealthCardStudentId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<StudentHealthProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canEdit =
    currentRole === 'super_admin' || currentRole === 'principal' || currentRole === 'teacher';
  const isParent = currentRole === 'parent';

  // Reactive listener
  useEffect(() => {
    const handleSync = () => setHealthProfiles(getStoredHealthProfiles());
    window.addEventListener(HEALTH_PROFILES_UPDATE_EVENT, handleSync);
    return () => window.removeEventListener(HEALTH_PROFILES_UPDATE_EVENT, handleSync);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered profiles
  const displayedProfiles = useMemo(() => {
    let list = healthProfiles.filter((p) => p.className === selectedClass);

    if (isParent && loggedInStudentId) {
      list = list.filter((p) => p.studentId === loggedInStudentId);
    }

    if (filterAllergyOnly) {
      list = list.filter((p) => p.allergiesList.length > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.studentNameBn.toLowerCase().includes(q) ||
          p.rollNo.includes(q) ||
          p.bloodGroup.toLowerCase().includes(q)
      );
    }

    return list;
  }, [healthProfiles, selectedClass, isParent, loggedInStudentId, filterAllergyOnly, searchQuery]);

  // High allergy alert items across the whole school
  const criticalAllergyStudents = useMemo(() => {
    return healthProfiles.filter((p) => p.allergiesList.length > 0);
  }, [healthProfiles]);

  // Class stats
  const stats = useMemo(() => {
    const total = healthProfiles.length;
    const withAllergies = criticalAllergyStudents.length;
    const normalBmiCount = healthProfiles.filter((p) => p.bmiStatusBn.includes('স্বাভাবিক')).length;
    const normalBmiRate = total > 0 ? Math.round((normalBmiCount / total) * 100) : 0;
    const fullVaccines = healthProfiles.filter((p) =>
      p.vaccinations.every((v) => v.isCompleted)
    ).length;
    const vaccineRate = total > 0 ? Math.round((fullVaccines / total) * 100) : 0;

    return { total, withAllergies, normalBmiRate, vaccineRate };
  }, [healthProfiles, criticalAllergyStudents]);

  // Helper for student photo
  const getStudentPhoto = (studentId: string) => {
    return students.find((s) => s.id === studentId)?.photoUrl || undefined;
  };

  const activeCardProfile = useMemo(() => {
    if (!activeHealthCardStudentId) return null;
    return healthProfiles.find((p) => p.studentId === activeHealthCardStudentId) || null;
  }, [activeHealthCardStudentId, healthProfiles]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-rose-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-700 via-pink-700 to-rose-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-200 text-xs font-bold border border-white/15">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>শিশু স্বাস্থ্য ও পুষ্টি ট্র্যাকার</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              শিশু স্বাস্থ্য, বৃদ্ধি ও অ্যালার্জি মনিটরিং
            </h2>
            <p className="text-rose-100 text-xs sm:text-sm max-w-xl">
              প্রতিটি শিশুর উচ্চতা, ওজন, BMI সূচক, রক্তের গ্রুপ, বিশেষ খাবারের অ্যালার্জি এবং নিয়মিত টিকাদান ট্র্যাক করে ক্লাসরুমকে শতভাগ নিরাপদ রাখা।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                exportHealthProfilesCsv(selectedClass, healthProfiles);
                showToast('✓ হেলথ রেকর্ড CSV ফাইল ডাউনলোড সম্পন্ন হয়েছে!');
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-semibold rounded-2xl text-xs sm:text-sm border border-white/20 transition-all backdrop-blur-md"
            >
              <Download className="w-4 h-4" />
              <span>CSV রিপোর্ট</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('আপনি কি স্বাস্থ্য রেকর্ড ডিফল্ট ডেটায় রিসেট করতে চান?')) {
                    resetHealthProfilesToDefault();
                    setHealthProfiles(getStoredHealthProfiles());
                    showToast('✓ স্বাস্থ্য রেকর্ড রিসেট সম্পন্ন হয়েছে!');
                  }
                }}
                className="p-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-2xl transition"
                title="ডিফল্ট ডেটায় রিসেট"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">মোট স্বাস্থ্য প্রোফাইল</span>
            <span className="text-xl font-black text-slate-800">
              {toBengaliNumber(stats.total)} জন
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">অ্যালার্জি সতর্কতা</span>
            <span className="text-xl font-black text-amber-800">
              {toBengaliNumber(stats.withAllergies)} জন
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">স্বাভাবিক বৃদ্ধি হার</span>
            <span className="text-xl font-black text-emerald-700">
              {toBengaliNumber(stats.normalBmiRate)}%
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">ইপিআই টিকা সম্পন্ন</span>
            <span className="text-xl font-black text-teal-700">
              {toBengaliNumber(stats.vaccineRate)}%
            </span>
          </div>
        </div>
      </div>

      {/* Critical Allergy Alert Bar (Food safety notice for teachers/staff) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <h3 className="font-extrabold text-sm sm:text-base text-amber-950">
            🚨 টিফিন ও ক্লাসরুম জরুরি স্বাস্থ্য ও খাবার সতর্কতা
          </h3>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">
          স্কুলে খাবার পরিবেশন বা সহপাঠীদের সাথে টিফিন শেয়ার করার সময় শিক্ষক ও আয়াদের নিম্নলিখিত শিক্ষার্থীদের প্রতি বিশেষ সতর্কতা অবলম্বন করতে হবে:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {criticalAllergyStudents.map((p) => (
            <div
              key={p.studentId}
              className="p-3 bg-white rounded-2xl border border-amber-200 shadow-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <strong className="text-slate-900 text-xs font-black">
                  {p.studentNameBn} ({getSchoolClassNameBn(p.className)})
                </strong>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  রক্ত: {p.bloodGroup}
                </span>
              </div>
              <p className="text-[11px] text-rose-700 font-bold">
                ⚠️ {p.allergiesList.map((a) => a.allergenBn).join(', ')}
              </p>
              <p className="text-[10px] text-slate-600 line-clamp-2">
                {p.allergiesList[0]?.actionGuideBn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Class Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CLASS_ITEMS.map((cls) => {
          const count = healthProfiles.filter((p) => p.className === cls.id).length;
          const isSelected = selectedClass === cls.id;
          return (
            <button
              key={cls.id}
              type="button"
              onClick={() => setSelectedClass(cls.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shadow-sm border ${
                isSelected
                  ? 'bg-rose-700 text-white border-rose-700 shadow-rose-200'
                  : 'bg-white text-slate-700 hover:bg-rose-50 border-slate-200'
              }`}
            >
              <span>{cls.nameBn}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {toBengaliNumber(count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, রোল বা রক্তের গ্রুপ দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setFilterAllergyOnly(!filterAllergyOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              filterAllergyOnly
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>শুধুমাত্র অ্যালার্জিযুক্ত শিক্ষার্থী</span>
          </button>
        </div>
      </div>

      {/* Health Profiles Table */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-3 text-center w-14">রোল</th>
                <th className="py-3 px-4">শিক্ষার্থী</th>
                <th className="py-3 px-3 text-center">রক্তের গ্রুপ</th>
                <th className="py-3 px-3 text-center">উচ্চতা ও ওজন</th>
                <th className="py-3 px-3 text-center">BMI সূচক</th>
                <th className="py-3 px-3">অ্যালার্জি সতর্কতা</th>
                <th className="py-3 px-3">ওষুধ ও বিশেষ যত্ন</th>
                <th className="py-3 px-3 text-center">টিকাদান</th>
                <th className="py-3 px-4 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedProfiles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Heart className="w-10 h-10 mx-auto mb-2 opacity-30 text-rose-400" />
                    কোনো স্বাস্থ্য রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                displayedProfiles.map((p) => {
                  const photo = getStudentPhoto(p.studentId);
                  const hasAllergy = p.allergiesList.length > 0;

                  return (
                    <tr
                      key={p.studentId}
                      className="hover:bg-rose-50/30 transition-colors group"
                    >
                      {/* Roll */}
                      <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                        {p.rollNo}
                      </td>

                      {/* Bio */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-rose-200 shrink-0">
                            {photo ? (
                              <img
                                src={photo}
                                alt={p.studentNameBn}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-rose-100 text-rose-800 font-bold text-xs">
                                {p.studentNameBn.slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block text-sm">
                              {p.studentNameBn}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              শাখা: {p.sectionBn}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Blood Group */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                          {p.bloodGroup}
                        </span>
                      </td>

                      {/* Height & Weight */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-bold text-slate-800 block">
                          {toBengaliNumber(p.heightCm)} সে.মি.
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {toBengaliNumber(p.weightKg)} কেজি
                        </span>
                      </td>

                      {/* BMI */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-extrabold text-emerald-800 text-sm block">
                          {toBengaliNumber(p.bmi)}
                        </span>
                        <span className="inline-block px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          স্বাভাবিক ✓
                        </span>
                      </td>

                      {/* Allergies */}
                      <td className="py-3.5 px-3">
                        {hasAllergy ? (
                          <div className="space-y-1">
                            {p.allergiesList.map((a, i) => (
                              <span
                                key={i}
                                className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 mr-1"
                              >
                                ⚠️ {a.allergenBn}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">নেই</span>
                        )}
                      </td>

                      {/* Medications / Doctor */}
                      <td className="py-3.5 px-3 text-xs text-slate-600 max-w-xs">
                        <span className="block truncate">
                          {p.regularMedicationsBn || 'কোনো নিয়মিত ওষুধ নেই'}
                        </span>
                        {p.emergencyDoctorPhone && (
                          <span className="text-[11px] text-rose-700 flex items-center gap-1 font-semibold">
                            <Phone className="w-3 h-3" />
                            {p.emergencyDoctorPhone}
                          </span>
                        )}
                      </td>

                      {/* Vaccinations */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          <Check className="w-3 h-3" />
                          সম্পূর্ণ
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => setEditingProfile(p)}
                              className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                              title="স্বাস্থ্য তথ্য সম্পাদনা"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setActiveHealthCardStudentId(p.studentId)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>হেলথ কার্ড</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Health Modal */}
      {editingProfile && (
        <EditStudentHealthModal
          isOpen={Boolean(editingProfile)}
          profile={editingProfile}
          onClose={() => setEditingProfile(null)}
          onSave={(updated) => {
            setHealthProfiles(getStoredHealthProfiles());
            setEditingProfile(null);
            showToast(`✓ ${updated.studentNameBn}-এর স্বাস্থ্য তথ্য সংরক্ষিত হয়েছে!`);
          }}
        />
      )}

      {/* Printable Health Card Modal */}
      {activeCardProfile && (
        <StudentHealthCardModal
          isOpen={Boolean(activeCardProfile)}
          profile={activeCardProfile}
          studentPhotoUrl={getStudentPhoto(activeCardProfile.studentId)}
          schoolProfile={schoolProfile}
          onClose={() => setActiveHealthCardStudentId(null)}
        />
      )}
    </div>
  );
};

interface EditStudentHealthModalProps {
  isOpen: boolean;
  profile: StudentHealthProfile;
  onClose: () => void;
  onSave: (updated: StudentHealthProfile) => void;
}

const EditStudentHealthModal: React.FC<EditStudentHealthModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSave,
}) => {
  const [heightCm, setHeightCm] = useState<number>(profile.heightCm);
  const [weightKg, setWeightKg] = useState<number>(profile.weightKg);
  const [bloodGroup, setBloodGroup] = useState<string>(profile.bloodGroup);
  const [allergiesText, setAllergiesText] = useState<string>(
    profile.allergiesList.map((a) => a.allergenBn).join(', ')
  );
  const [medications, setMedications] = useState<string>(profile.regularMedicationsBn || '');
  const [doctorPhone, setDoctorPhone] = useState<string>(profile.emergencyDoctorPhone || '');

  if (!isOpen) return null;

  const bmiCalc = calculateBmi(heightCm, weightKg);

  const handleSave = () => {
    const allergyList: StudentAllergyItem[] = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((item) => ({
        allergenBn: item,
        severity: 'critical',
        reactionBn: 'অ্যালার্জি প্রতিক্রিয়া হতে পারে',
        actionGuideBn: 'টিফিনে এই খাবার পরিহার করুন',
      }));

    const updated = updateStudentHealthProfile(profile.studentId, {
      heightCm,
      weightKg,
      bloodGroup,
      allergiesList: allergyList,
      regularMedicationsBn: medications,
      emergencyDoctorPhone: doctorPhone,
    });

    if (updated) onSave(updated);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4">
        <div className="flex items-center justify-between px-6 py-4 bg-rose-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Stethoscope className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">স্বাস্থ্য ও পুষ্টি রেকর্ড সম্পাদনা</h3>
              <p className="text-xs text-rose-100">
                {profile.studentNameBn} · রোল: {profile.rollNo} · {getSchoolClassNameBn(profile.className)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live BMI Preview Bar */}
        <div className="px-6 py-3 bg-rose-50 border-b border-rose-100 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">হিসাবকৃত BMI:</span>
              <strong className="text-rose-900 text-base font-black">
                {toBengaliNumber(bmiCalc.bmi)}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">বৃদ্ধি পর্যায়:</span>
              <span className={`px-2 py-0.5 rounded font-black text-xs ${bmiCalc.color}`}>
                {bmiCalc.statusBn}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 italic">
            "{bmiCalc.adviceBn}"
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">উচ্চতা (সে.মি.):</label>
              <input
                type="number"
                step="0.5"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">ওজন (কেজি):</label>
              <input
                type="number"
                step="0.2"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">রক্তের গ্রুপ:</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              অ্যালার্জি সতর্কতা (কমা দিয়ে একাধিক লিখতে পারেন):
            </label>
            <input
              type="text"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              placeholder="যেমন: চিনাবাদাম, ডিমের সাদা অংশ, গরুর দুধ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              নিয়মিত ওষুধ বা বিশেষ যত্ন নির্দেশিকা:
            </label>
            <textarea
              rows={2}
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="যেমন: দুপুর ১২:০০ টায় ১ চামচ সিরাপ..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              জরুরি শিশু বিশেষজ্ঞ / পারিবারিক ডাক্তারের ফোন:
            </label>
            <input
              type="text"
              value={doctorPhone}
              onChange={(e) => setDoctorPhone(e.target.value)}
              placeholder="যেমন: ০১৭১২-১১২২৩৩"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold text-xs sm:text-sm"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition"
          >
            <Check className="w-4 h-4" />
            <span>সংরক্ষণ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface StudentHealthCardModalProps {
  isOpen: boolean;
  profile: StudentHealthProfile;
  studentPhotoUrl?: string;
  schoolProfile?: SchoolProfile;
  onClose: () => void;
}

const StudentHealthCardModal: React.FC<StudentHealthCardModalProps> = ({
  isOpen,
  profile,
  studentPhotoUrl,
  schoolProfile = SCHOOL_PROFILE,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-rose-300 overflow-hidden flex flex-col my-4 print:my-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-rose-700 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm sm:text-base">
              অফিসিয়াল শিশু স্বাস্থ্য ও টিকাদান কার্ড
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl text-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-xl text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Health Sheet */}
        <div className="p-6 sm:p-8 bg-white print:p-8 space-y-5 font-sans">
          {/* Header */}
          <div className="border-b-2 border-rose-600 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={schoolProfile.logoUrl || '/assets/biddalay/logo.png'}
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h2 className="text-xl font-black text-rose-800">
                  {schoolProfile.nameBn || 'আনন্দ পাঠশালা'}
                </h2>
                <p className="text-xs text-slate-500">
                  শিশু স্বাস্থ্য, বৃদ্ধি ও জরুরি অ্যালার্জি প্রোফাইল কার্ড
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-black text-xs">
              ব্লাড গ্রুপ: {profile.bloodGroup}
            </span>
          </div>

          {/* Bio Row */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs sm:text-sm">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-rose-300 shrink-0">
              {studentPhotoUrl ? (
                <img
                  src={studentPhotoUrl}
                  alt={profile.studentNameBn}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-rose-800 bg-rose-100">
                  {profile.studentNameBn.slice(0, 2)}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1">
              <div>
                <span className="text-slate-400 block text-xs">শিক্ষার্থী:</span>
                <strong className="text-slate-900">{profile.studentNameBn}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">রোল ও শ্রেণি:</span>
                <strong className="text-slate-900">{profile.rollNo} · {getSchoolClassNameBn(profile.className)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">উচ্চতা ও ওজন:</span>
                <strong className="text-emerald-700">{toBengaliNumber(profile.heightCm)} সেমি / {toBengaliNumber(profile.weightKg)} কেজি</strong>
              </div>
            </div>
          </div>

          {/* Growth Milestones History */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              ত্রৈমাসিক বৃদ্ধি ও ওজন অগ্রগতি (Growth History):
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {profile.growthHistory.map((g, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">{g.dateBn}</span>
                  <span className="font-bold text-slate-800 block">
                    {toBengaliNumber(g.heightCm)} সেমি · {toBengaliNumber(g.weightKg)} কেজি
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    BMI: {toBengaliNumber(g.bmi)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vaccination Schedule Checklist */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              ইপিআই টিকাদান ও স্বাস্থ্য সুরক্ষা (Vaccination Status):
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {profile.vaccinations.map((v) => (
                <div key={v.id} className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">{v.nameBn}</span>
                  <span className="text-emerald-700 font-bold text-[11px]">✓ সম্পন্ন</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Allergy Alert */}
          {profile.allergiesList.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
              <strong className="block text-rose-700">🚨 খাদ্য ও পরিবেশগত অ্যালার্জি সতর্কতা:</strong>
              {profile.allergiesList.map((a, i) => (
                <p key={i}>
                  • <strong>{a.allergenBn}</strong>: {a.actionGuideBn}
                </p>
              ))}
            </div>
          )}

          {/* Footer Signatures */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-center text-xs">
            <div>
              <div className="w-28 border-t border-slate-700 pt-1 font-bold text-slate-800">
                শ্রেণি শিক্ষক
              </div>
            </div>
            <div>
              <div className="w-28 border-t border-slate-700 pt-1 font-bold text-slate-800">
                পিতামাতা / অভিভাবক
              </div>
            </div>
            <div>
              <div className="w-28 border-t border-slate-700 pt-1 font-bold text-slate-800">
                স্কুল স্বাস্থ্য পরিদর্শক
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
