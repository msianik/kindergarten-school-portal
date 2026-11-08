import React, { useState, useMemo } from 'react';
import { 
  Student, 
  SchoolClass, 
  UserRole, 
  PickupPerson,
  PortalAccountRole,
  SkillAssessment,
  PortalAccount,
} from '../types/school';
import {
  getSchoolClassNameBn,
  isSameSchoolClass,
  upsertPortalAccount,
  removePortalAccountByEntityId,
  getPortalRoleLabelBn,
  getPortalNameForRoleBn,
  normalizeIdentifier,
  toBengaliNumber,
  exportStudentDirectoryToCsv,
  downloadStudentDirectoryCsvFile,
  getPermissionForDirector,
} from '../utils/schoolLogic';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart, 
  ShieldCheck, 
  X, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Filter, 
  Grid, 
  List, 
  BookOpen, 
  CalendarCheck,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Download,
  FileSpreadsheet,
  QrCode,
  Award,
  IdCard,
} from 'lucide-react';
import { StudentIdCardModal } from './StudentIdCardModal';
import { StudentProgressCardModal } from './StudentProgressCardModal';

interface StudentDirectoryModuleProps {
  students: Student[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  currentRole: UserRole;
  loggedInAccount?: PortalAccount | null;
  onNavigateTab: (tab: string) => void;
  assessments?: Record<string, SkillAssessment>;
}

const CLASS_CONFIGS: { id: SchoolClass; nameBn: string; ageRangeBn: string; color: string; badgeBg: string }[] = [
  { id: 'HateKhori', nameBn: 'হাতেখড়ি (Pre-Play)', ageRangeBn: '২.৫+ বছর', color: 'border-pink-400 bg-pink-50/50', badgeBg: 'bg-pink-600' },
  { id: 'Play', nameBn: 'প্লে (Play)', ageRangeBn: '৩+ বছর', color: 'border-emerald-400 bg-emerald-50/50', badgeBg: 'bg-emerald-600' },
  { id: 'Nursery', nameBn: 'নার্সারি (Nursery)', ageRangeBn: '৪+ বছর', color: 'border-teal-400 bg-teal-50/50', badgeBg: 'bg-teal-600' },
  { id: 'KG', nameBn: 'কেজি (KG)', ageRangeBn: '৫+ বছর', color: 'border-amber-400 bg-amber-50/50', badgeBg: 'bg-amber-600' },
  { id: 'Class-1', nameBn: 'ওয়ান (Class 1)', ageRangeBn: '৬+ বছর', color: 'border-indigo-400 bg-indigo-50/50', badgeBg: 'bg-indigo-600' },
  { id: 'Class-2', nameBn: 'টু (Class 2)', ageRangeBn: '৭+ বছর', color: 'border-purple-400 bg-purple-50/50', badgeBg: 'bg-purple-600' },
];

const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-800 border border-emerald-300',
  'bg-amber-100 text-amber-800 border border-amber-300',
  'bg-indigo-100 text-indigo-800 border border-indigo-300',
  'bg-teal-100 text-teal-800 border border-teal-300',
  'bg-rose-100 text-rose-800 border border-rose-300',
  'bg-violet-100 text-violet-800 border border-violet-300',
];

export const StudentDirectoryModule: React.FC<StudentDirectoryModuleProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  currentRole,
  loggedInAccount,
  onNavigateTab,
  assessments,
}) => {
  // Access Guard: Super Admin, Directors, Principal, and Teachers can view all students
  const hasAccess =
    currentRole === 'super_admin' ||
    currentRole === 'director' ||
    currentRole === 'principal' ||
    currentRole === 'teacher';

  const dirPerm =
    currentRole === 'director' ? getPermissionForDirector(loggedInAccount?.directorId) : null;
  const canEditStudents =
    currentRole === 'super_admin' ||
    currentRole === 'principal' ||
    (currentRole === 'director' && Boolean(dirPerm?.canManageStudentsAndAdmissions));

  const [selectedClass, setSelectedClass] = useState<SchoolClass | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAcrossAllClasses, setSearchAcrossAllClasses] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_class' | 'picked_up' | 'absent'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [idCardStudentId, setIdCardStudentId] = useState<string | undefined>(undefined);
  const [isProgressCardModalOpen, setIsProgressCardModalOpen] = useState(false);
  const [progressCardStudentId, setProgressCardStudentId] = useState<string | undefined>(undefined);

  const handleOpenIdCardModal = (studentId?: string) => {
    setIdCardStudentId(studentId || (filteredStudents[0]?.id ?? students[0]?.id));
    setIsIdCardModalOpen(true);
  };

  const handleOpenProgressCardModal = (studentId?: string) => {
    setProgressCardStudentId(studentId || (filteredStudents[0]?.id ?? students[0]?.id));
    setIsProgressCardModalOpen(true);
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    rollNo: '',
    nameBn: '',
    nameEn: '',
    className: 'HateKhori' as SchoolClass,
    section: 'A',
    gender: 'male' as 'male' as 'male' | 'female',
    birthDate: '2022-05-15',
    bloodGroup: 'B+',
    fatherNameBn: '',
    motherNameBn: '',
    emergencyPhone: '',
    email: '',
    homeAddressBn: 'গোশালা, কোর্টপাড়া, কুষ্টিয়া',
    allergies: 'নেই',
    guardianNameBn: '',
    guardianRelationBn: 'বাবা',
    currentStatus: 'in_class' as 'in_class' | 'picked_up' | 'absent',
    username: '',
    password: '123456',
    portalRole: 'parent' as PortalAccountRole,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Class Counts
  const classCounts = useMemo(() => {
    const counts: Record<string, number> = { all: students.length };
    CLASS_CONFIGS.forEach((c) => {
      counts[c.id] = students.filter((s) => isSameSchoolClass(s.className, c.id)).length;
    });
    return counts;
  }, [students]);

  // Filtered Students (Real-Time Search by Name or Class)
  const filteredStudents = useMemo(() => {
    return students.filter((std) => {
      const q = searchQuery.toLowerCase().trim();
      const hasQuery = q.length > 0;

      // Class match: if searching and searchAcrossAllClasses is enabled, search across all classes; otherwise restrict to selectedClass
      const matchesClass =
        selectedClass === 'all' ||
        (hasQuery && searchAcrossAllClasses) ||
        isSameSchoolClass(std.className, selectedClass);

      const matchesStatus = statusFilter === 'all' || std.currentStatus === statusFilter;

      if (!hasQuery) return matchesClass && matchesStatus;

      // Smart comprehensive search fields
      const classNameBn = getSchoolClassNameBn(std.className).toLowerCase();
      const classNameEn = std.className.toLowerCase();
      const nameBn = std.nameBn.toLowerCase();
      const nameEn = std.nameEn.toLowerCase();
      const rollNoEn = std.rollNo.toLowerCase();
      const rollNoBn = toBengaliNumber(std.rollNo).toLowerCase();
      const fatherName = (std.fatherNameBn || '').toLowerCase();
      const motherName = (std.motherNameBn || '').toLowerCase();
      const phone = std.emergencyPhone || '';
      const address = (std.homeAddressBn || '').toLowerCase();

      // Normalize common Bengali alternate characters (e.g. ড় vs ড়, য় vs য়)
      const normalizedQ = q.replace(/ড়/g, 'ড়').replace(/য়/g, 'য়');
      const normalizedNameBn = nameBn.replace(/ড়/g, 'ড়').replace(/য়/g, 'য়');
      const normalizedClassBn = classNameBn.replace(/ড়/g, 'ড়').replace(/য়/g, 'য়');

      const matchesSearch =
        nameBn.includes(q) ||
        nameEn.includes(q) ||
        normalizedNameBn.includes(normalizedQ) ||
        classNameEn.includes(q) ||
        classNameBn.includes(q) ||
        normalizedClassBn.includes(normalizedQ) ||
        rollNoEn.includes(q) ||
        rollNoBn.includes(q) ||
        fatherName.includes(q) ||
        motherName.includes(q) ||
        phone.includes(q) ||
        address.includes(q);

      return matchesClass && matchesStatus && matchesSearch;
    });
  }, [students, selectedClass, statusFilter, searchQuery, searchAcrossAllClasses]);

  // Export Current Filtered List as CSV
  const handleExportCsv = () => {
    if (filteredStudents.length === 0) {
      showToast('⚠️ এক্সপোর্ট করার মতো কোনো শিক্ষার্থী তালিকায় নেই।');
      return;
    }

    const scopeLabelBn =
      selectedClass === 'all'
        ? searchAcrossAllClasses && searchQuery
          ? 'সকল শ্রেণি (সার্চ ফিল্টার)'
          : 'সকল শ্রেণি'
        : getSchoolClassNameBn(selectedClass);

    const csvContent = exportStudentDirectoryToCsv(filteredStudents, {
      classScopeBn: scopeLabelBn,
      searchQuery: searchQuery.trim() || undefined,
      statusFilter: statusFilter !== 'all' ? statusFilter : undefined,
    });

    const now = new Date();
    const cleanDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const cleanScope =
      selectedClass === 'all' ? 'all_students' : selectedClass.toLowerCase();
    const fileName = `ananda_pathshala_students_${cleanScope}_${cleanDate}.csv`;

    downloadStudentDirectoryCsvFile(csvContent, fileName);
    showToast(
      `📥 ${filteredStudents.length} জন শিক্ষার্থীর তালিকা সফলভাবে CSV ফাইল হিসেবে ডাউনলোড হয়েছে!`
    );
  };

  // Open Add Modal
  const handleOpenAddModal = (presetClass?: SchoolClass) => {
    const targetClass = presetClass ? presetClass : (selectedClass !== 'all' ? selectedClass : 'HateKhori');
    const existingInClass = students.filter((s) => isSameSchoolClass(s.className, targetClass));
    const nextRoll = String(existingInClass.length + 1).padStart(2, '0');
    const defaultUser = `std_${targetClass.toLowerCase().replace(/[^a-z0-9]/g, '')}_${nextRoll}`;

    setFormData({
      rollNo: nextRoll,
      nameBn: '',
      nameEn: '',
      className: targetClass,
      section: 'A',
      gender: 'male',
      birthDate: '2022-05-15',
      bloodGroup: 'B+',
      fatherNameBn: '',
      motherNameBn: '',
      emergencyPhone: '',
      email: '',
      homeAddressBn: 'গোশালা, কোর্টপাড়া, কুষ্টিয়া',
      allergies: 'নেই',
      guardianNameBn: '',
      guardianRelationBn: 'বাবা',
      currentStatus: 'in_class',
      username: defaultUser,
      password: '123456',
      portalRole: 'parent',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      rollNo: student.rollNo,
      nameBn: student.nameBn,
      nameEn: student.nameEn,
      className: student.className,
      section: student.section,
      gender: student.gender,
      birthDate: student.birthDate,
      bloodGroup: student.bloodGroup || 'B+',
      fatherNameBn: student.fatherNameBn || '',
      motherNameBn: student.motherNameBn || '',
      emergencyPhone: student.emergencyPhone || '',
      email: student.email || '',
      homeAddressBn: student.homeAddressBn || 'গোশালা, কোর্টপাড়া, কুষ্টিয়া',
      allergies: student.allergies || 'নেই',
      guardianNameBn: student.authorizedPickups[0]?.nameBn || student.fatherNameBn || '',
      guardianRelationBn: student.authorizedPickups[0]?.relationBn || 'বাবা',
      currentStatus: student.currentStatus,
      username:
        student.username ||
        student.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) ||
        student.id,
      password: student.password || '123456',
      portalRole: student.portalRole || 'parent',
    });
  };

  // Submit Add Student
  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameBn.trim()) {
      showToast('⚠️ অনুগ্রহ করে শিক্ষার্থীর নাম (বাংলায়) পূরণ করুন।');
      return;
    }

    const newId = `std-${Date.now()}`;
    const cleanUsername =
      formData.username.trim() ||
      formData.nameEn.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) ||
      `std${Date.now().toString().slice(-4)}`;
    const cleanPassword = formData.password.trim() || '123456';
    const assignedRole: PortalAccountRole = formData.portalRole || 'parent';

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const primaryPickup: PickupPerson = {
      id: `p-${Date.now()}-1`,
      nameBn: formData.guardianNameBn.trim() || formData.fatherNameBn.trim() || 'অভিভাবক',
      nameEn: formData.nameEn.trim() || 'Guardian',
      relationBn: formData.guardianRelationBn || 'বাবা',
      relationEn: 'Father/Guardian',
      phone: formData.emergencyPhone.trim() || '০১৯১৪-০৫৭৫১১',
      nid: 'NID-VERIFIED-2026',
      avatarBg: 'bg-emerald-500',
      avatarIcon: 'user',
      isPrimary: true,
      approved: true,
    };

    const newStudent: Student = {
      id: newId,
      rollNo: formData.rollNo.trim() || '01',
      nameBn: formData.nameBn.trim(),
      nameEn: formData.nameEn.trim() || formData.nameBn.trim(),
      className: formData.className,
      section: formData.section.trim() || 'A',
      gender: formData.gender,
      birthDate: formData.birthDate,
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergies,
      emergencyPhone: formData.emergencyPhone.trim() || '০১৯১৪-০৫৭৫১১',
      email: formData.email.trim() || undefined,
      fatherNameBn: formData.fatherNameBn.trim(),
      motherNameBn: formData.motherNameBn.trim(),
      homeAddressBn: formData.homeAddressBn.trim(),
      currentStatus: formData.currentStatus,
      authorizedPickups: [primaryPickup],
      avatarColor: randomColor,
      username: cleanUsername,
      password: cleanPassword,
      portalRole: assignedRole,
    };

    upsertPortalAccount({
      id: `acc-std-${newId}`,
      studentId: newId,
      username: cleanUsername,
      phone: normalizeIdentifier(newStudent.emergencyPhone) || '01914057511',
      email: newStudent.email || `${cleanUsername}@anandapathshala.edu.bd`,
      passwordHint: cleanPassword,
      role: assignedRole,
      nameBn: newStudent.fatherNameBn
        ? `${newStudent.fatherNameBn} (${newStudent.nameBn}-এর অভিভাবক)`
        : `${newStudent.nameBn} (শিক্ষার্থী/অভিভাবক)`,
      nameEn: newStudent.nameEn,
      roleTitleBn: `${getPortalRoleLabelBn(assignedRole)} · শ্রেণি: ${newStudent.className}`,
      portalNameBn: getPortalNameForRoleBn(assignedRole),
      assignedClass: newStudent.className,
      avatarUrl: newStudent.photoUrl || '/assets/fb/kids-1.jpg',
    });

    onAddStudent(newStudent);
    setIsAddModalOpen(false);
    showToast(
      `✅ "${newStudent.nameBn}" (${newStudent.className}) ও পোর্টাল লগইন আইডি (${cleanUsername}) সফলভাবে যুক্ত হয়েছে!`
    );
  };

  // Submit Edit Student
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!formData.nameBn.trim()) {
      showToast('⚠️ অনুগ্রহ করে শিক্ষার্থীর নাম পূরণ করুন।');
      return;
    }

    const cleanUsername =
      formData.username.trim() ||
      editingStudent.username ||
      formData.nameEn.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) ||
      editingStudent.id;
    const cleanPassword = formData.password.trim() || editingStudent.password || '123456';
    const assignedRole: PortalAccountRole = formData.portalRole || editingStudent.portalRole || 'parent';

    const updatedPickups = [...editingStudent.authorizedPickups];
    if (updatedPickups.length > 0) {
      updatedPickups[0] = {
        ...updatedPickups[0],
        nameBn: formData.guardianNameBn.trim() || formData.fatherNameBn.trim() || updatedPickups[0].nameBn,
        relationBn: formData.guardianRelationBn || updatedPickups[0].relationBn,
        phone: formData.emergencyPhone.trim() || updatedPickups[0].phone,
      };
    }

    const updatedStudent: Student = {
      ...editingStudent,
      rollNo: formData.rollNo.trim() || editingStudent.rollNo,
      nameBn: formData.nameBn.trim(),
      nameEn: formData.nameEn.trim() || editingStudent.nameEn,
      className: formData.className,
      section: formData.section.trim() || editingStudent.section,
      gender: formData.gender,
      birthDate: formData.birthDate,
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergies,
      emergencyPhone: formData.emergencyPhone.trim() || editingStudent.emergencyPhone,
      email: formData.email.trim() || editingStudent.email,
      fatherNameBn: formData.fatherNameBn.trim(),
      motherNameBn: formData.motherNameBn.trim(),
      homeAddressBn: formData.homeAddressBn.trim(),
      currentStatus: formData.currentStatus,
      authorizedPickups: updatedPickups,
      username: cleanUsername,
      password: cleanPassword,
      portalRole: assignedRole,
    };

    upsertPortalAccount({
      id: `acc-std-${updatedStudent.id}`,
      studentId: updatedStudent.id,
      username: cleanUsername,
      phone: normalizeIdentifier(updatedStudent.emergencyPhone) || '01914057511',
      email: updatedStudent.email || `${cleanUsername}@anandapathshala.edu.bd`,
      passwordHint: cleanPassword,
      role: assignedRole,
      nameBn: updatedStudent.fatherNameBn
        ? `${updatedStudent.fatherNameBn} (${updatedStudent.nameBn}-এর অভিভাবক)`
        : `${updatedStudent.nameBn} (শিক্ষার্থী/অভিভাবক)`,
      nameEn: updatedStudent.nameEn,
      roleTitleBn: `${getPortalRoleLabelBn(assignedRole)} · শ্রেণি: ${updatedStudent.className}`,
      portalNameBn: getPortalNameForRoleBn(assignedRole),
      assignedClass: updatedStudent.className,
      avatarUrl: updatedStudent.photoUrl || '/assets/fb/kids-1.jpg',
    });

    onUpdateStudent(updatedStudent);
    setEditingStudent(null);
    showToast(
      `✅ "${updatedStudent.nameBn}" এর প্রোফাইল, রোল (${getPortalRoleLabelBn(assignedRole)}) ও লগইন আইডি (${cleanUsername}) আপডেট হয়েছে!`
    );
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    removePortalAccountByEntityId(studentToDelete.id);
    onDeleteStudent(studentToDelete.id);
    showToast(`🗑️ "${studentToDelete.nameBn}" এর রেকর্ড ও পোর্টাল অ্যাকাউন্ট মুছে ফেলা হয়েছে।`);
    setStudentToDelete(null);
  };

  // If user is a Parent, access is strictly forbidden
  if (!hasAccess) {
    return (
      <div className="bg-white rounded-3xl border-2 border-rose-200 p-8 sm:p-12 text-center max-w-xl mx-auto my-12 space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900">
          প্রবেশাধিকার সংরক্ষিত (Access Restricted)
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          এই বিভাগটি শুধুমাত্র আনন্দ পাঠশালার <strong>প্রিন্সিপাল</strong> ও অনুমোদিত <strong>শিক্ষকদের</strong> জন্য সংরক্ষিত। অভিভাবকরা সরাসরি তাঁদের সন্তানের লাইভ ড্যাশবোর্ড থেকে প্রয়োজনীয় তথ্য দেখতে পারবেন।
        </p>
        <button
          type="button"
          onClick={() => onNavigateTab('overview')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-2"
        >
          <span>আমার সন্তান ড্যাশবোর্ডে ফিরুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-slate-900 border border-emerald-500 rounded-2xl p-4 text-white shadow-xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-amber-700 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-200">
              <Users className="w-3.5 h-3.5" />
              <span>শ্রেণিভিত্তিক শিক্ষার্থী রোস্টার ও ডাটাবেজ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              ছাত্র-ছাত্রীর পূর্ণাঙ্গ তালিকা ও শ্রেণি ব্যবস্থাপনা
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
              ক্লাসের নাম সিলেক্ট করে প্রতি শ্রেণির শিক্ষার্থীদের তালিকা দেখুন, নতুন ভর্তি হওয়া শিক্ষার্থীর তথ্য যুক্ত করুন এবং রিয়েল-টাইমে ডাটা আপডেট করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => handleOpenProgressCardModal()}
              disabled={students.length === 0}
              className="px-4 py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 disabled:opacity-50 disabled:pointer-events-none active:scale-95 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md"
              title="শিক্ষার্থীর স্কিল ও আচরণগত প্রগ্রেস কার্ড এবং PDF প্রিন্ট-আউট ভিউ খুলুন"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>স্কিল প্রগ্রেস কার্ড ({filteredStudents.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onNavigateTab) {
                  onNavigateTab('idcards');
                } else {
                  handleOpenIdCardModal();
                }
              }}
              disabled={students.length === 0}
              className="px-4 py-3 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:pointer-events-none active:scale-95 text-white font-black rounded-2xl text-xs sm:text-sm border border-white/25 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="ডিজিটাল আইডি কার্ড ও প্রিন্ট মডিউল খুলুন"
            >
              <IdCard className="w-4 h-4 text-amber-300" />
              <span>ডিজিটাল আইডি কার্ড ({filteredStudents.length})</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredStudents.length === 0}
              className="px-4 py-3 bg-white/15 hover:bg-white/25 disabled:opacity-50 disabled:pointer-events-none active:scale-95 text-white font-bold rounded-2xl text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="ফিল্টারকৃত শিক্ষার্থীদের বর্তমান তালিকা CSV ফাইল হিসেবে ডাউনলোড করুন"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>CSV এক্সপোর্ট ({filteredStudents.length})</span>
            </button>
            {canEditStudents ? (
              <button
                type="button"
                onClick={() => handleOpenAddModal()}
                className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>+ নতুন শিক্ষার্থী যোগ করুন</span>
              </button>
            ) : currentRole === 'director' ? (
              <div className="px-4 py-2.5 bg-white/20 text-white border border-white/30 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-xs">
                <span>👁️ সম্পূর্ণ ডাটাবেজ ভিউ মোড</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Real-Time Live Search Bar */}
      <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-4 sm:p-5 shadow-xs space-y-3 transition-all focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
              <Search className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  রিয়েল-টাইম শিক্ষার্থী অনুসন্ধান (Quick Student Search)
                </h3>
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    লাইভ সার্চ সক্রিয়
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                শিক্ষার্থীর নাম (বাংলা বা ইংরেজি) অথবা শ্রেণি (যেমন: নার্সারি, কেজি, প্লে, ইত্যাদি) দিয়ে তাৎক্ষণিক খুঁজুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchAcrossAllClasses(!searchAcrossAllClasses)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  searchAcrossAllClasses
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title="সকল শ্রেণিতে একসঙ্গে খুঁজুন"
              >
                {searchAcrossAllClasses ? '✓ সকল শ্রেণিতে অনুসন্ধান' : 'নির্বাচিত শ্রেণিতে সীমাবদ্ধ'}
              </button>
            )}
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-mono">
              প্রাপ্ত: <strong className="text-emerald-700 font-black">{filteredStudents.length}</strong> / {students.length} জন
            </span>
          </div>
        </div>

        {/* Big Search Input Field with Instant Clear */}
        <div className="relative">
          <Search className="w-5 h-5 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম বা শ্রেণি লিখে খুঁজুন (যেমন: আয়ান, মারিয়া, নার্সারি, কেজি, প্লে, হাতেখড়ি, ওয়ান, টু, রোল ০১...)"
            className="w-full pl-11 pr-28 py-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
          />
          {searchQuery && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 hidden sm:inline font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {filteredStudents.length} জন
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                title="সার্চ ক্লিয়ার করুন"
              >
                <X className="w-3.5 h-3.5" />
                <span>মুছুন</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            দ্রুত শ্রেণি ফিল্টার:
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedClass('all');
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
              !searchQuery && selectedClass === 'all'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            সকল শ্রেণি ({students.length})
          </button>
          {CLASS_CONFIGS.map((cls) => {
            const count = classCounts[cls.id] || 0;
            const isSelected = selectedClass === cls.id && !searchQuery;
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => {
                  setSelectedClass(cls.id);
                  setSearchQuery('');
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? `${cls.badgeBg} text-white shadow-2xs`
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{cls.nameBn}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Class Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* All Classes Card */}
        <button
          type="button"
          onClick={() => setSelectedClass('all')}
          className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
            selectedClass === 'all'
              ? 'border-emerald-600 bg-white shadow-md ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">সকল শিক্ষার্থী</span>
            <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-full text-white ${
              selectedClass === 'all' ? 'bg-emerald-700' : 'bg-slate-400'
            }`}>
              {classCounts.all}
            </span>
          </div>
          <h4 className="text-base font-black text-slate-900 mt-2">
            সর্বমোট রোস্টার
          </h4>
          <span className="text-[10px] text-slate-400 block mt-1">সবগুলো শ্রেণি</span>
        </button>

        {/* Individual Class Cards */}
        {CLASS_CONFIGS.map((cls) => {
          const count = classCounts[cls.id] || 0;
          const isActive = selectedClass === cls.id;

          return (
            <button
              key={cls.id}
              type="button"
              onClick={() => setSelectedClass(cls.id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                isActive
                  ? `${cls.color} shadow-md ring-2 ring-emerald-500/20 bg-white`
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 truncate">{cls.id}</span>
                <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-full text-white ${cls.badgeBg}`}>
                  {count} জন
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 mt-2 truncate">
                {cls.nameBn}
              </h4>
              <span className="text-[10px] text-slate-500 block mt-1">বয়স: {cls.ageRangeBn}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Active Filter Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            ফিল্টার:
          </span>
          {searchQuery ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
              <Search className="w-3 h-3 text-emerald-600" />
              <span>সার্চ: "{searchQuery}"</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-emerald-700 hover:text-emerald-900 ml-0.5 font-black cursor-pointer"
              >
                ✕
              </button>
            </span>
          ) : (
            <span className="text-slate-600 font-medium">
              শ্রেণি: <strong>{selectedClass === 'all' ? 'সবগুলো শ্রেণি' : getSchoolClassNameBn(selectedClass)}</strong>
            </span>
          )}
        </div>

        {/* Status Filter & View Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-slate-500 font-medium">অবস্থা:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">সকল অবস্থা</option>
              <option value="in_class">শ্রেণিকক্ষে উপস্থিত</option>
              <option value="picked_up">ছুটিপ্রাপ্ত (Picked Up)</option>
              <option value="absent">অনুপস্থিত</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="গ্রিড কার্ড ভিউ"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="টেবিল লিস্ট ভিউ"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredStudents.length === 0}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:pointer-events-none active:scale-95 text-emerald-800 border border-emerald-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="বর্তমান ফিল্টারকৃত শিক্ষার্থীদের তালিকা CSV ফাইল হিসেবে ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">CSV এক্সপোর্ট</span>
            <span className="sm:hidden">CSV</span>
          </button>

          <div className="text-slate-600 text-[11px] font-mono px-2 bg-slate-50 py-1.5 rounded-xl border border-slate-200">
            ফলাফল: <strong className="text-emerald-700 font-black">{filteredStudents.length}</strong> জন
          </div>
        </div>
      </div>

      {/* Student List View */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
            {searchQuery ? <Search className="w-7 h-7 text-amber-600" /> : <AlertCircle className="w-7 h-7 text-amber-600" />}
          </div>
          <div className="space-y-1.5">
            <h4 className="text-base sm:text-lg font-black text-slate-800">
              {searchQuery ? `"${searchQuery}" দিয়ে কোনো শিক্ষার্থী পাওয়া যায়নি` : 'কোনো শিক্ষার্থী পাওয়া যায়নি'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery
                ? 'নাম বা শ্রেণির বানান (যেমন: নার্সারি, কেজি, প্লে, হাতেখড়ি, ওয়ান, টু) যাচাই করুন অথবা নিচের বাটনে ক্লিক করে সার্চ রিসেট করুন।'
                : 'নির্বাচিত শ্রেণি বা অবস্থায় কোনো শিক্ষার্থীর তথ্য নেই। নতুন শিক্ষার্থী যোগ করতে পারেন।'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2.5 pt-1 flex-wrap">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedClass('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4 text-slate-500" />
                <span>সার্চ রিসেট করে সব দেখুন</span>
              </button>
            )}
            {canEditStudents && (
              <button
                type="button"
                onClick={() => handleOpenAddModal(selectedClass === 'all' ? 'HateKhori' : selectedClass)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>নতুন শিক্ষার্থী যোগ করুন</span>
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((std) => {
            const isPresent = std.currentStatus === 'in_class';
            const isPickedUp = std.currentStatus === 'picked_up';

            return (
              <div
                key={std.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Avatar, Name & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${std.avatarColor}`}>
                        {std.rollNo}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {std.nameBn}
                          </h4>
                          {searchQuery && (
                            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                              {getSchoolClassNameBn(std.className)}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium block truncate">
                          {std.nameEn}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isPresent
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : isPickedUp
                        ? 'bg-teal-100 text-teal-800 border-teal-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}>
                      {isPresent ? 'উপস্থিত' : isPickedUp ? 'ছুটিপ্রাপ্ত' : 'অনুপস্থিত'}
                    </span>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">শ্রেণি ও শাখা:</span>
                      <span className="font-bold text-slate-800">{getSchoolClassNameBn(std.className)} ({std.section})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">রক্তের গ্রুপ:</span>
                      <span className="font-mono font-bold text-slate-800">{std.bloodGroup || 'জানা নেই'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">পিতা:</span>
                      <span className="font-semibold text-slate-700 truncate block">{std.fatherNameBn || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">মাতা:</span>
                      <span className="font-semibold text-slate-700 truncate block">{std.motherNameBn || '—'}</span>
                    </div>
                  </div>

                  {/* Emergency Phone & Address */}
                  <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">যোগাযোগ ফোন:</span>
                      {std.emergencyPhone ? (
                        <a
                          href={`tel:${std.emergencyPhone}`}
                          className="font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{std.emergencyPhone}</span>
                        </a>
                      ) : (
                        <span className="font-mono text-slate-400">—</span>
                      )}
                    </div>
                    <div className="flex items-start gap-1 text-[11px] text-slate-500 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate">{std.homeAddressBn}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5 pt-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                        রোল: {getPortalRoleLabelBn(std.portalRole || 'parent')}
                      </span>
                      {std.username && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          🔐 ID: {std.username}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions: ID Card, Edit, Delete, Attendance, Report */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 text-xs flex-wrap">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenIdCardModal(std.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold flex items-center gap-1 transition cursor-pointer"
                      title="ডিজিটাল আইডি কার্ড ও পিকআপ QR কোড দেখুন বা প্রিন্ট করুন"
                    >
                      <QrCode className="w-3.5 h-3.5 text-teal-700" />
                      <span>আইডি কার্ড</span>
                    </button>
                    {canEditStudents && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(std)}
                          className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 transition cursor-pointer"
                          title="শিক্ষার্থীর তথ্য আপডেট করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>এডিট</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentToDelete(std)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                          title="তালিকা থেকে মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenProgressCardModal(std.id)}
                      className="px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer border border-amber-300 shadow-2xs"
                      title="শিক্ষার্থীর স্কিল ও আচরণগত প্রগ্রেস কার্ড এবং PDF প্রিন্ট-আউট ভিউ দেখুন"
                    >
                      <Award className="w-3 h-3 text-amber-800" />
                      <span>প্রগ্রেস কার্ড</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('attendance')}
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px]"
                      title="হাজিরা শিট"
                    >
                      হাজিরা
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">তালিকা ভিউ (Administrative Table Record)</span>
              <span className="text-slate-500 font-mono text-[11px]">({filteredStudents.length} জন শিক্ষার্থী)</span>
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredStudents.length === 0}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs text-xs"
              title="এই তালিকাটি CSV হিসেবে ডাউনলোড করুন"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV ডাউনলোড ({filteredStudents.length})</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-3 text-center">রোল</th>
                  <th className="py-3 px-3">শিক্ষার্থীর নাম</th>
                  <th className="py-3 px-3">শ্রেণি ও শাখা</th>
                  <th className="py-3 px-3">লিঙ্গ ও বয়স</th>
                  <th className="py-3 px-3">পিতা ও মাতা</th>
                  <th className="py-3 px-3">জরুরি ফোন নম্বর</th>
                  <th className="py-3 px-3 text-center">লাইভ স্ট্যাটাস</th>
                  <th className="py-3 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                      {std.rollNo}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{std.nameBn}</div>
                      <div className="text-[10px] text-slate-500">{std.nameEn}</div>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {getPortalRoleLabelBn(std.portalRole || 'parent')}
                        </span>
                        {std.username && (
                          <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            ID: {std.username}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {getSchoolClassNameBn(std.className)} (শাখা {std.section})
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{std.gender === 'male' ? 'ছেলে' : 'মেয়ে'} · {std.bloodGroup || '—'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{std.birthDate}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <div className="font-medium">{std.fatherNameBn || '—'}</div>
                      <div className="text-[10px] text-slate-400">{std.motherNameBn || '—'}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {std.emergencyPhone ? (
                        <a href={`tel:${std.emergencyPhone}`} className="hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{std.emergencyPhone}</span>
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        std.currentStatus === 'in_class'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : std.currentStatus === 'picked_up'
                          ? 'bg-teal-100 text-teal-800 border-teal-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        {std.currentStatus === 'in_class' ? 'উপস্থিত' : std.currentStatus === 'picked_up' ? 'ছুটিপ্রাপ্ত' : 'অনুপস্থিত'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenProgressCardModal(std.id)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold transition cursor-pointer border border-amber-200"
                          title="স্কিল ও আচরণগত প্রগ্রেস কার্ড এবং PDF প্রিন্ট-আউট দেখুন"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-700" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenIdCardModal(std.id)}
                          className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold transition cursor-pointer"
                          title="ডিজিটাল আইডি কার্ড ও QR কোড দেখুন"
                        >
                          <QrCode className="w-3.5 h-3.5 text-teal-700" />
                        </button>
                        {canEditStudents && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(std)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition cursor-pointer"
                              title="এডিট করুন"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setStudentToDelete(std)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW STUDENT                                                    */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-8 max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    নতুন শিক্ষার্থী ভর্তি ও তথ্য সংরক্ষণ
                  </h3>
                  <p className="text-xs text-slate-500">
                    আনন্দ পাঠশালার অফিসিয়াল ডাটাবেজে নতুন ছাত্র/ছাত্রীর প্রোফাইল যুক্ত করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 font-bold rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmitAdd} className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ভর্তি ইচ্ছুক শ্রেণি *</label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value as SchoolClass })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white"
                  >
                    <option value="HateKhori">১. হাতেখড়ি (Pre-Play) — ২.৫+ বছর</option>
                    <option value="Play">২. প্লে (Play) — ৩+ বছর</option>
                    <option value="Nursery">৩. নার্সারি (Nursery) — ৪+ বছর</option>
                    <option value="KG">৪. কেজি (KG) — ৫+ বছর</option>
                    <option value="Class-1">৫. ওয়ান (Class 1) — ৬+ বছর</option>
                    <option value="Class-2">৬. টু (Class 2) — ৭+ বছর</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">শাখা (Section)</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="e.g. A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">রোল নম্বর *</label>
                  <input
                    type="text"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder="যেমন: 05"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">শিক্ষার্থীর নাম (বাংলায়) *</label>
                  <input
                    type="text"
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    placeholder="যেমন: তাওসিফ আহমেদ আরিয়ান"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">শিক্ষার্থীর নাম (ইংরেজিতে)</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g. Tawsif Ahmed Aryan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">লিঙ্গ</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
                  >
                    <option value="male">ছেলে (Boy)</option>
                    <option value="female">মেয়ে (Girl)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">জন্ম তারিখ</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">রক্তের গ্রুপ</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:bg-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-black text-slate-800 uppercase tracking-wider text-[10px] block">
                  অভিভাবকের তথ্য ও জরুরি যোগাযোগ
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">পিতার নাম</label>
                    <input
                      type="text"
                      value={formData.fatherNameBn}
                      onChange={(e) => setFormData({ ...formData, fatherNameBn: e.target.value })}
                      placeholder="যেমন: মো. রফিকুল ইসলাম"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">মাতার নাম</label>
                    <input
                      type="text"
                      value={formData.motherNameBn}
                      onChange={(e) => setFormData({ ...formData, motherNameBn: e.target.value })}
                      placeholder="যেমন: ফারহানা আফরোজ"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">জরুরি যোগাযোগের মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="যেমন: ০১৯১৪-০৫৭৫১১"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">প্রধান পিক-আপ অভিভাবকের সম্পর্ক</label>
                    <select
                      value={formData.guardianRelationBn}
                      onChange={(e) => setFormData({ ...formData, guardianRelationBn: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                    >
                      <option value="বাবা">বাবা (Father)</option>
                      <option value="মা">মা (Mother)</option>
                      <option value="দাদা/নানা">দাদা / নানা</option>
                      <option value="চাচা/মামা">চাচা / মামা</option>
                      <option value="অনুমোদিত অভিভাবক">অনুমোদিত অভিভাবক</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">বাসস্থানের বর্তমান ঠিকানা</label>
                  <input
                    type="text"
                    value={formData.homeAddressBn}
                    onChange={(e) => setFormData({ ...formData, homeAddressBn: e.target.value })}
                    placeholder="যেমন: ১৯/২২ পূর্ণ চন্দ্র লাহিড়ী লেন (গোশালা), কুষ্টিয়া"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              {/* =============================================================== */}
              {/* STUDENT / GUARDIAN PORTAL LOGIN ACCOUNT & ROLE SECTION          */}
              {/* =============================================================== */}
              <div className="p-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-300 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>🔐 পোর্টাল অ্যাকাউন্ট (লগইন আইডি, পাসওয়ার্ড ও রোল নির্ধারণ)</span>
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-700 text-white px-2.5 py-0.5 rounded-full">
                    {getPortalNameForRoleBn(formData.portalRole)}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                  শিক্ষার্থী বা অভিভাবকের প্রোফাইল তৈরির সাথে সাথে এই লগইন আইডি, পাসওয়ার্ড ও রোল দিয়ে অ্যাকাউন্ট সক্রিয় হবে।
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">লগইন ইউজার আইডি (User ID) *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="যেমন: std_01 / parent1"
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">লগইন পাসওয়ার্ড (Password) *</label>
                    <input
                      type="text"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="123456"
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">পোর্টাল অ্যাক্সেস রোল (Role) *</label>
                    <select
                      value={formData.portalRole}
                      onChange={(e) =>
                        setFormData({ ...formData, portalRole: e.target.value as PortalAccountRole })
                      }
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900"
                    >
                      <option value="parent">👨‍👧 অভিভাবক / শিক্ষার্থী (Guardian)</option>
                      <option value="teacher">👩‍🏫 শিক্ষক (Teacher)</option>
                      <option value="principal">🎓 প্রিন্সিপাল (Principal)</option>
                      <option value="director">🏛️ পরিচালক (Director)</option>
                      <option value="gate_security">🛡️ সহায়ক স্টাফ (Support Staff)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">ইমেইল (ঐচ্ছিক লগইন)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="parent@anandapathshala.edu.bd"
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>শিক্ষার্থী সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT EXISTING STUDENT                                              */}
      {/* ========================================================================= */}
      {editingStudent && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setEditingStudent(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-8 max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    শিক্ষার্থীর তথ্য আপডেট ও পরিবর্তন
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingStudent.nameBn} (রোল: {editingStudent.rollNo} · {editingStudent.className})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 font-bold rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmitEdit} className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">শ্রেণি *</label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value as SchoolClass })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="HateKhori">১. হাতেখড়ি (Pre-Play) — ২.৫+ বছর</option>
                    <option value="Play">২. প্লে (Play) — ৩+ বছর</option>
                    <option value="Nursery">৩. নার্সারি (Nursery) — ৪+ বছর</option>
                    <option value="KG">৪. কেজি (KG) — ৫+ বছর</option>
                    <option value="Class-1">৫. ওয়ান (Class 1) — ৬+ বছর</option>
                    <option value="Class-2">৬. টু (Class 2) — ৭+ বছর</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">শাখা (Section)</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">রোল নম্বর *</label>
                  <input
                    type="text"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">শিক্ষার্থীর নাম (বাংলায়) *</label>
                  <input
                    type="text"
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">শিক্ষার্থীর নাম (ইংরেজিতে)</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">লাইভ স্ট্যাটাস</label>
                  <select
                    value={formData.currentStatus}
                    onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
                  >
                    <option value="in_class">শ্রেণিকক্ষে উপস্থিত</option>
                    <option value="picked_up">ছুটিপ্রাপ্ত (Picked Up)</option>
                    <option value="absent">অনুপস্থিত</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">জন্ম তারিখ</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">রক্তের গ্রুপ</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-black text-slate-800 uppercase tracking-wider text-[10px] block">
                  অভিভাবকের তথ্য ও যোগাযোগ
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">পিতার নাম</label>
                    <input
                      type="text"
                      value={formData.fatherNameBn}
                      onChange={(e) => setFormData({ ...formData, fatherNameBn: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">মাতার নাম</label>
                    <input
                      type="text"
                      value={formData.motherNameBn}
                      onChange={(e) => setFormData({ ...formData, motherNameBn: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">জরুরি মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">প্রধান অভিভাবক সম্পর্ক</label>
                    <input
                      type="text"
                      value={formData.guardianRelationBn}
                      onChange={(e) => setFormData({ ...formData, guardianRelationBn: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">বর্তমান ঠিকানা</label>
                  <input
                    type="text"
                    value={formData.homeAddressBn}
                    onChange={(e) => setFormData({ ...formData, homeAddressBn: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              {/* =============================================================== */}
              {/* STUDENT / GUARDIAN PORTAL LOGIN ACCOUNT & ROLE SECTION          */}
              {/* =============================================================== */}
              <div className="p-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-300 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>🔐 পোর্টাল অ্যাকাউন্ট (লগইন আইডি, পাসওয়ার্ড ও রোল নির্ধারণ)</span>
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-700 text-white px-2.5 py-0.5 rounded-full">
                    {getPortalNameForRoleBn(formData.portalRole)}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                  এই প্রোফাইলের লগইন ইউজার আইডি, পাসওয়ার্ড ও পোর্টাল রোল এখান থেকে সরাসরি পরিবর্তন করা যাবে।
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">লগইন ইউজার আইডি (User ID) *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">লগইন পাসওয়ার্ড (Password) *</label>
                    <input
                      type="text"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">পোর্টাল অ্যাক্সেস রোল (Role) *</label>
                    <select
                      value={formData.portalRole}
                      onChange={(e) =>
                        setFormData({ ...formData, portalRole: e.target.value as PortalAccountRole })
                      }
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900"
                    >
                      <option value="parent">👨‍👧 অভিভাবক / শিক্ষার্থী (Guardian)</option>
                      <option value="teacher">👩‍🏫 শিক্ষক (Teacher)</option>
                      <option value="principal">🎓 প্রিন্সিপাল (Principal)</option>
                      <option value="director">🏛️ পরিচালক (Director)</option>
                      <option value="gate_security">🛡️ সহায়ক স্টাফ (Support Staff)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">ইমেইল (ঐচ্ছিক লগইন)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="parent@anandapathshala.edu.bd"
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>তথ্য আপডেট করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      {studentToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setStudentToDelete(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                আপনি কি নিশ্চিতভাবে মুছে ফেলতে চান?
              </h3>
              <p className="text-xs text-slate-500">
                “<strong>{studentToDelete.nameBn}</strong>” (শ্রেণি: {studentToDelete.className}, রোল: {studentToDelete.rollNo}) এর তথ্য তালিকা থেকে মুছে যাবে।
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIGITAL STUDENT ID CARD & PICKUP QR MODAL                                 */}
      {/* ========================================================================= */}
      <StudentIdCardModal
        isOpen={isIdCardModalOpen}
        onClose={() => setIsIdCardModalOpen(false)}
        students={students}
        initialStudentId={idCardStudentId}
        initialClass={selectedClass}
        currentRole={currentRole}
      />

      {/* ========================================================================= */}
      {/* STUDENT SKILL & BEHAVIORAL PROGRESS REPORT CARD PRINT MODAL                */}
      {/* ========================================================================= */}
      <StudentProgressCardModal
        isOpen={isProgressCardModalOpen}
        onClose={() => setIsProgressCardModalOpen(false)}
        students={students}
        initialStudentId={progressCardStudentId}
        initialClass={selectedClass}
        assessments={assessments}
        currentRole={currentRole}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
