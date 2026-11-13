import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
  DollarSign,
  UserCheck,
  Lock,
  Unlock,
  KeyRound,
  RotateCcw,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Eye,
  EyeOff,
  Copy,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Shield,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import {
  DirectorAccessPermission,
  PortalAccount,
  PortalAccountRole,
  SchoolClass,
  UserRole,
} from '../../types/school';
import {
  getAllPortalAccounts,
  createPortalUserAccount,
  updatePortalUserAccount,
  deletePortalUserAccount,
  togglePortalUserAccess,
  setAllPortalUsersAccess,
  getDirectorPermissions,
  saveDirectorPermissions,
  toBengaliNumber,
  getPortalRoleLabelBn,
  normalizeIdentifier,
} from '../../utils/schoolLogic';

export interface SuperAdminAccessPanelProps {
  isSuperAdmin: boolean;
  directorPermissions: DirectorAccessPermission[];
  onToggleMasterEdit: (directorId: string) => void;
  onToggleEditPermission: (
    directorId: string,
    permissionKey:
      | 'canEditSchoolAndBoard'
      | 'canManageStudentsAndAdmissions'
      | 'canManageFeesAndAccounts'
      | 'canManageNoticesAndEvents'
      | 'canApproveGatePassAndDiary'
  ) => void;
  onSetAllEditAccess?: (enable: boolean) => void;
  onSelectRole?: (role: UserRole) => void;
  logoUrl?: string;
  onToggleViewAll?: (directorId: string) => void;
  onToggleEditAccess?: (directorId: string) => void;
  onToggleModule?: (directorId: string, moduleId: string) => void;
  onSetAllAccess?: (enable: boolean) => void;
}

type UserCategoryFilter = 'all' | 'director' | 'principal' | 'teacher' | 'staff' | 'parent';

export const SuperAdminAccessPanel: React.FC<SuperAdminAccessPanelProps> = ({
  isSuperAdmin,
  directorPermissions,
  onToggleMasterEdit,
  onToggleEditPermission,
  onSetAllEditAccess,
  onSelectRole,
  logoUrl,
}) => {
  if (!isSuperAdmin) return null;

  // Live Accounts List
  const [accounts, setAccounts] = useState<PortalAccount[]>(() => getAllPortalAccounts());
  const [activeTab, setActiveTab] = useState<UserCategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [panelToast, setPanelToast] = useState<string | null>(null);

  // Password visibility tracking per account ID
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PortalAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<PortalAccount | null>(null);

  // Form state for creating user
  const [newRole, setNewRole] = useState<PortalAccountRole>('teacher');
  const [newNameBn, setNewNameBn] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRoleTitleBn, setNewRoleTitleBn] = useState('');
  const [newAssignedClass, setNewAssignedClass] = useState<SchoolClass>('Nursery');
  const [newCanFullEdit, setNewCanFullEdit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync accounts list on storage events
  useEffect(() => {
    const handleSync = () => {
      setAccounts(getAllPortalAccounts());
    };
    window.addEventListener('ananda-portal-accounts-updated', handleSync);
    window.addEventListener('ananda-directors-updated', handleSync);
    window.addEventListener('ananda-teachers-updated', handleSync);
    return () => {
      window.removeEventListener('ananda-portal-accounts-updated', handleSync);
      window.removeEventListener('ananda-directors-updated', handleSync);
      window.removeEventListener('ananda-teachers-updated', handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setPanelToast(msg);
    setTimeout(() => setPanelToast((prev) => (prev === msg ? null : prev)), 3500);
  };

  const togglePasswordVisibility = (accId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [accId]: !prev[accId],
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    showToast(`📋 ${label} কপি করা হয়েছে: ${text}`);
  };

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    // Role filter
    if (activeTab === 'director' && acc.role !== 'director' && acc.role !== 'super_admin') return false;
    if (activeTab === 'principal' && acc.role !== 'principal') return false;
    if (activeTab === 'teacher' && acc.role !== 'teacher') return false;
    if (activeTab === 'staff' && acc.role !== 'accountant' && acc.role !== 'gate_security') return false;
    if (activeTab === 'parent' && acc.role !== 'parent') return false;

    // Status filter
    if (statusFilter === 'active' && acc.isAccessDisabled) return false;
    if (statusFilter === 'disabled' && !acc.isAccessDisabled) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = normalizeIdentifier(searchQuery);
      const nameBn = (acc.nameBn || '').toLowerCase();
      const nameEn = (acc.nameEn || '').toLowerCase();
      const username = (acc.username || '').toLowerCase();
      const phone = normalizeIdentifier(acc.phone || '');
      const email = (acc.email || '').toLowerCase();
      const roleTitle = (acc.roleTitleBn || '').toLowerCase();

      return (
        nameBn.includes(searchQuery.toLowerCase()) ||
        nameEn.includes(searchQuery.toLowerCase()) ||
        username.includes(searchQuery.toLowerCase()) ||
        phone.includes(q) ||
        email.includes(searchQuery.toLowerCase()) ||
        roleTitle.includes(searchQuery.toLowerCase())
      );
    }

    return true;
  });

  // Role Counts
  const counts = {
    all: accounts.length,
    director: accounts.filter((a) => a.role === 'director' || a.role === 'super_admin').length,
    principal: accounts.filter((a) => a.role === 'principal').length,
    teacher: accounts.filter((a) => a.role === 'teacher').length,
    staff: accounts.filter((a) => a.role === 'accountant' || a.role === 'gate_security').length,
    parent: accounts.filter((a) => a.role === 'parent').length,
  };

  // Open Add Modal
  const openAddModal = (defaultRole: PortalAccountRole = 'teacher') => {
    setNewRole(defaultRole);
    setNewNameBn('');
    setNewNameEn('');
    setNewUsername('');
    setNewPassword('123456');
    setNewPhone('');
    setNewEmail('');
    setNewRoleTitleBn(
      defaultRole === 'director'
        ? 'সম্মানিত পরিচালক, পরিচালনা পর্ষদ'
        : defaultRole === 'teacher'
        ? 'সহকারী শিক্ষক'
        : defaultRole === 'accountant'
        ? 'হিসাবরক্ষণ কর্মকর্তা'
        : defaultRole === 'gate_security'
        ? 'গেট সিকিউরিটি ও কেয়ারটেকার'
        : defaultRole === 'principal'
        ? 'প্রিন্সিপাল ও একাডেমিক প্রধান'
        : 'অভিভাবক'
    );
    setNewAssignedClass('Nursery');
    setNewCanFullEdit(defaultRole === 'director');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Handle Create User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameBn.trim()) {
      setFormError('অনুগ্রহ করে ব্যবহারকারীর পুরো নাম (বাংলা) লিখুন।');
      return;
    }
    if (!newUsername.trim()) {
      setFormError('অনুগ্রহ করে ইউজার আইডি (Username) লিখুন।');
      return;
    }
    const cleanUser = newUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const exists = accounts.some((a) => a.username.toLowerCase() === cleanUser);
    if (exists) {
      setFormError(`"${cleanUser}" ইউজার আইডিটি ইতিমধ্যে ব্যবহৃত হয়েছে। অন্য ইউজার আইডি দিন।`);
      return;
    }
    if (!newPhone.trim()) {
      setFormError('অনুগ্রহ করে মোবাইল নম্বর লিখুন।');
      return;
    }
    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setFormError('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    try {
      const created = createPortalUserAccount({
        nameBn: newNameBn.trim(),
        nameEn: newNameEn.trim() || cleanUser,
        role: newRole,
        roleTitleBn: newRoleTitleBn.trim() || getPortalRoleLabelBn(newRole),
        email: newEmail.trim() || `${cleanUser}@anandapathshala.edu.bd`,
        phone: newPhone.trim(),
        username: cleanUser,
        passwordHint: newPassword.trim(),
        assignedClass: newRole === 'teacher' || newRole === 'parent' ? newAssignedClass : undefined,
        canFullEdit: newRole === 'director' ? newCanFullEdit : undefined,
      });

      setAccounts(getAllPortalAccounts());
      setIsAddModalOpen(false);
      showToast(`✅ ${created.nameBn} (${getPortalRoleLabelBn(created.role)})-এর ইউজার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!`);
    } catch {
      setFormError('অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  // Handle Edit User
  const handleUpdateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    if (!editingAccount.nameBn.trim()) {
      showToast('⚠️ নাম খালি রাখা যাবে না।');
      return;
    }
    if (!editingAccount.username.trim()) {
      showToast('⚠️ ইউজার আইডি খালি রাখা যাবে না।');
      return;
    }

    const success = updatePortalUserAccount(editingAccount);
    if (success) {
      setAccounts(getAllPortalAccounts());
      setEditingAccount(null);
      showToast(`✅ ${editingAccount.nameBn}-এর অ্যাকাউন্ট সফলভাবে আপডেট করা হয়েছে!`);
    } else {
      showToast('❌ আপডেট করা সম্ভব হয়নি।');
    }
  };

  // Handle Delete User
  const handleConfirmDelete = () => {
    if (!deletingAccount) return;
    if (deletingAccount.role === 'super_admin' || deletingAccount.username === 'superadmin') {
      showToast('⚠️ সুপার অ্যাডমিন অ্যাকাউন্ট ডিলিট করা সম্ভব নয়!');
      setDeletingAccount(null);
      return;
    }

    const success = deletePortalUserAccount(deletingAccount.id);
    if (success) {
      setAccounts(getAllPortalAccounts());
      showToast(`🗑️ ${deletingAccount.nameBn}-এর অ্যাকাউন্ট সম্পূর্ণ ডিলিট করা হয়েছে।`);
    } else {
      showToast('❌ ডিলিট করা সম্ভব হয়নি।');
    }
    setDeletingAccount(null);
  };

  // Toggle Single User Access (Active / Disabled)
  const handleToggleAccess = (acc: PortalAccount) => {
    if (acc.role === 'super_admin' || acc.username === 'superadmin') {
      showToast('⚠️ সুপার অ্যাডমিন অ্যাকাউন্ট স্থগিত করা যাবে না।');
      return;
    }
    const nextState = !acc.isAccessDisabled;
    togglePortalUserAccess(acc.id, nextState);
    setAccounts(getAllPortalAccounts());
    showToast(
      nextState
        ? `🔒 ${acc.nameBn}-এর অ্যাক্সেস স্থগিত (Blocked) করা হয়েছে।`
        : `✅ ${acc.nameBn}-এর অ্যাক্সেস পুনরায় সক্রিয় (Active) করা হয়েছে!`
    );
  };

  // Director Edit Access Helper
  const getDirectorEditStatus = (directorId?: string) => {
    if (!directorId) return false;
    const perm = directorPermissions.find((p) => p.directorId === directorId);
    if (!perm) return false;
    return Boolean(
      perm.canEditSchoolAndBoard &&
        perm.canManageStudentsAndAdmissions &&
        perm.canManageFeesAndAccounts &&
        perm.canManageNoticesAndEvents &&
        perm.canApproveGatePassAndDiary
    );
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-md p-4 sm:p-6 space-y-5 print:hidden">
      {/* Toast Alert */}
      {panelToast && (
        <div className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 border border-amber-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{panelToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setPanelToast(null)}
            className="text-white/70 hover:text-white text-xs cursor-pointer font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-100 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0 text-2xl border-2 border-white ring-2 ring-amber-400">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                সুপার অ্যাডমিন সেন্ট্রাল অ্যাক্সেস ও ইউজার কন্ট্রোল হাব
              </h2>
              <span className="text-[10px] font-black bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300 uppercase">
                মাস্টার কন্ট্রোল
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              সকল পরিচালক, প্রিন্সিপাল, শিক্ষক, কর্মচারী ও অভিভাবকদের অ্যাকাউন্ট তৈরি, এডিট, অ্যাক্সেস প্রদান ও ডিলিট করুন।
            </p>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => openAddModal('teacher')}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
            title="নতুন ইউজার তৈরি করুন"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ নতুন ইউজার তৈরি</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onSetAllEditAccess) {
                onSetAllEditAccess(true);
              }
              showToast('✅ সকল পরিচালকের পূর্ণ এডিট ক্ষমতা উন্মুক্ত করা হয়েছে!');
            }}
            className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1"
            title="সকল পরিচালকের পূর্ণ এডিট ক্ষমতা দিন"
          >
            <Check className="w-3.5 h-3.5" />
            <span>সবাইকে পূর্ণ এডিট</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onSetAllEditAccess) {
                onSetAllEditAccess(false);
              }
              showToast('👁️ সকল পরিচালকের জন্য শুধু ভিউ মোড সক্রিয় করা হয়েছে।');
            }}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
            title="সকল পরিচালকের শুধু ভিউ মোড সক্রিয় করুন"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>সবাইকে শুধু ভিউ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAllPortalUsersAccess(true);
              setAccounts(getAllPortalAccounts());
              showToast('✅ সকল ব্যবহারকারীর অ্যাকাউন্ট সক্রিয় রাখা হয়েছে!');
            }}
            className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
            title="সকল অ্যাকাউন্ট সক্রিয় করুন"
          >
            <Unlock className="w-3.5 h-3.5 text-teal-700" />
            <span>সকলকে সক্রিয়</span>
          </button>
        </div>
      </div>

      {/* Role Navigation Pills & Live Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 overflow-x-auto max-w-full scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white font-black shadow-xs'
                : 'hover:bg-white text-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>সকল ইউজার ({counts.all})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('director')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'director'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'hover:bg-white text-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>পরিচালনা পর্ষদ ({counts.director})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('principal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'principal'
                ? 'bg-teal-700 text-white font-black shadow-xs'
                : 'hover:bg-white text-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>প্রিন্সিপাল ({counts.principal})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'teacher'
                ? 'bg-indigo-700 text-white font-black shadow-xs'
                : 'hover:bg-white text-slate-700'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>শিক্ষকবৃন্দ ({counts.teacher})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'staff'
                ? 'bg-emerald-700 text-white font-black shadow-xs'
                : 'hover:bg-white text-slate-700'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>কর্মচারীবৃন্দ ({counts.staff})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('parent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'parent'
                ? 'bg-rose-700 text-white font-black shadow-xs'
                : 'hover:bg-white text-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>অভিভাবকবৃন্দ ({counts.parent})</span>
          </button>
        </div>

        {/* Live Search & Status Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, ইউজার আইডি, মোবাইল..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50 focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400 shrink-0 cursor-pointer text-slate-700"
          >
            <option value="all">সকল অবস্থা</option>
            <option value="active">শুধু সক্রিয়</option>
            <option value="disabled">শুধু স্থগিত</option>
          </select>
        </div>
      </div>

      {/* User Accounts List */}
      <div className="space-y-2.5">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">কোনো ইউজার অ্যাকাউন্ট পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400">সার্চ ফিল্টার পরিবর্তন করুন অথবা নতুন ইউজার যোগ করুন।</p>
            <button
              type="button"
              onClick={() => openAddModal(activeTab === 'all' ? 'teacher' : (activeTab as any))}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition cursor-pointer inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ইউজার তৈরি করুন</span>
            </button>
          </div>
        ) : (
          filteredAccounts.map((acc) => {
            const isSuper = acc.role === 'super_admin' || acc.username === 'superadmin';
            const isDir = acc.role === 'director';
            const isFullEdit = isDir && getDirectorEditStatus(acc.directorId);
            const isPasswordVisible = visiblePasswords[acc.id] || false;
            const isDisabled = Boolean(acc.isAccessDisabled);

            // Role styling
            const roleBadgeClass = isSuper
              ? 'bg-amber-400 text-slate-950 border-amber-400'
              : acc.role === 'director'
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : acc.role === 'principal'
              ? 'bg-teal-100 text-teal-900 border-teal-300'
              : acc.role === 'teacher'
              ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
              : acc.role === 'accountant'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : acc.role === 'gate_security'
              ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
              : 'bg-rose-100 text-rose-900 border-rose-300';

            return (
              <div
                key={acc.id}
                className={`flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                  isDisabled
                    ? 'bg-rose-50/50 border-rose-200 opacity-75'
                    : isSuper
                    ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
                } shadow-2xs`}
              >
                {/* User Identity Column */}
                <div className="flex items-center gap-3 min-w-[280px]">
                  <img
                    src={acc.avatarUrl || logoUrl || '/assets/fb/logo.jpg'}
                    alt={acc.nameBn}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-2xl object-cover border border-amber-300 shrink-0 bg-white shadow-2xs"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {acc.nameBn}
                      </h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${roleBadgeClass}`}>
                        {isSuper ? '👑 সুপার অ্যাডমিন' : getPortalRoleLabelBn(acc.role)}
                      </span>
                      {isDisabled && (
                        <span className="text-[9.5px] font-black bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded">
                          স্থগিত (Blocked)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="font-semibold text-slate-700">{acc.roleTitleBn}</span>
                      {acc.assignedClass && (
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono text-[10px]">
                          ক্লাস: {acc.assignedClass}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Credentials Strip (User ID, Phone, Password) */}
                <div className="flex-1 flex flex-wrap items-center gap-2 sm:gap-3 text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
                  {/* Username / ID */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-slate-400 text-[10.5px] font-bold">আইডি:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(acc.username, 'ইউজার আইডি')}
                      className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 hover:border-amber-400 hover:bg-amber-50 cursor-pointer transition flex items-center gap-1 text-[11px]"
                      title="ইউজার আইডি কপি করুন"
                    >
                      <span>{acc.username}</span>
                      <Copy className="w-2.5 h-2.5 text-slate-400" />
                    </button>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-slate-400 text-[10.5px] font-bold">মোবাইল:</span>
                    <a
                      href={`tel:${acc.phone}`}
                      className="font-mono text-emerald-800 font-bold hover:underline text-[11px]"
                    >
                      {acc.phone}
                    </a>
                  </div>

                  {/* Password Hint with Show/Hide toggle */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-slate-400 text-[10.5px] font-bold">পাসওয়ার্ড:</span>
                    <div className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-[11px]">
                      <span className="font-bold text-slate-900">
                        {isPasswordVisible ? acc.passwordHint : '••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(acc.id)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                        title={isPasswordVisible ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                      >
                        {isPasswordVisible ? (
                          <EyeOff className="w-3 h-3 text-amber-600" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Controls & Actions */}
                <div className="flex items-center gap-2 justify-end shrink-0 pt-1 xl:pt-0">
                  {/* Director Master Edit Toggle */}
                  {isDir && acc.directorId && (
                    <button
                      type="button"
                      onClick={() => onToggleMasterEdit(acc.directorId!)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer flex items-center gap-1 border select-none ${
                        isFullEdit
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                      title={
                        isFullEdit
                          ? 'পরিচালকের পূর্ণ এডিট ক্ষমতা চালু রয়েছে (ক্লিক করে শুধু ভিউ করুন)'
                          : 'পরিচালককে পূর্ণ এডিট ক্ষমতা দিন'
                      }
                    >
                      {isFullEdit ? (
                        <>
                          <Check className="w-3 h-3 text-slate-950 font-black" />
                          <span>পূর্ণ এডিট</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>শুধু ভিউ</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Active / Disable Toggle Switch (for non-super admin) */}
                  {!isSuper && (
                    <button
                      type="button"
                      onClick={() => handleToggleAccess(acc)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-1 border select-none ${
                        isDisabled
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                      title={
                        isDisabled
                          ? 'অ্যাকাউন্টটি বর্তমানে স্থগিত। ক্লিক করে পুনরায় সক্রিয় করুন।'
                          : 'অ্যাকাউন্টটি সক্রিয়। ক্লিক করে সাময়িক স্থগিত করুন।'
                      }
                    >
                      {isDisabled ? (
                        <>
                          <Lock className="w-3 h-3 text-rose-600" />
                          <span>স্থগিত</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>সক্রিয়</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Edit User Button */}
                  <button
                    type="button"
                    onClick={() => setEditingAccount(acc)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-300 transition cursor-pointer"
                    title="ইউজার তথ্য ও পাসওয়ার্ড এডিট করুন"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete User Button (Hidden for super admin) */}
                  {!isSuper && (
                    <button
                      type="button"
                      onClick={() => setDeletingAccount(acc)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-300 transition cursor-pointer"
                      title="ইউজার অ্যাকাউন্ট চিরতরে ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================
          MODAL 1: ADD NEW USER (নতুন ইউজার তৈরি)
      ======================================================== */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-4 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    নতুন পোর্টাল ইউজার তৈরি করুন
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    লগইনের জন্য নাম, ইউজার আইডি, মোবাইল নম্বর ও পাসওয়ার্ড নির্ধারণ করুন।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইউজারের ভূমিকা (Role) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { role: 'teacher' as const, label: '👨‍🏫 শিক্ষক' },
                    { role: 'director' as const, label: '🏛️ পরিচালক' },
                    { role: 'principal' as const, label: '🎓 প্রিন্সিপাল' },
                    { role: 'accountant' as const, label: '💼 হিসাবরক্ষক' },
                    { role: 'gate_security' as const, label: '🛡️ সিকিউরিটি' },
                    { role: 'parent' as const, label: '👨‍👩‍👧 অভিভাবক' },
                  ].map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => {
                        setNewRole(r.role);
                        setNewRoleTitleBn(
                          r.role === 'director'
                            ? 'সম্মানিত পরিচালক, পরিচালনা পর্ষদ'
                            : r.role === 'teacher'
                            ? 'সহকারী শিক্ষক'
                            : r.role === 'accountant'
                            ? 'হিসাবরক্ষণ কর্মকর্তা'
                            : r.role === 'gate_security'
                            ? 'গেট সিকিউরিটি ও কেয়ারটেকার'
                            : r.role === 'principal'
                            ? 'প্রিন্সিপাল ও একাডেমিক প্রধান'
                            : 'অভিভাবক'
                        );
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border text-center cursor-pointer ${
                        newRole === r.role
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পুরো নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newNameBn}
                    onChange={(e) => setNewNameBn(e.target.value)}
                    placeholder="উদাঃ মোছাঃ নাজমুন নাহার"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    নাম (English)
                  </label>
                  <input
                    type="text"
                    value={newNameEn}
                    onChange={(e) => {
                      setNewNameEn(e.target.value);
                      if (!newUsername) {
                        setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                      }
                    }}
                    placeholder="Ex: Nazmun Nahar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইউজার আইডি (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="উদাঃ nazmun / fatema"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    লগইনের জন্য ছোট হাতের ইংরেজি অক্ষর ও সংখ্যা
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    লগইন পাসওয়ার্ড *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="ডিফল্ট: 123456"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড
                  </span>
                </div>
              </div>

              {/* Mobile & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="উদাঃ 01711000000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইমেইল এড্রেস
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="উদাঃ user@anandapathshala.edu.bd"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Role Title / Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পদবী বা পরিচিতি
                  </label>
                  <input
                    type="text"
                    value={newRoleTitleBn}
                    onChange={(e) => setNewRoleTitleBn(e.target.value)}
                    placeholder="উদাঃ সিনিয়র শিক্ষক / সহকারী শিক্ষক"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {(newRole === 'teacher' || newRole === 'parent') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      নির্ধারিত শ্রেণি
                    </label>
                    <select
                      value={newAssignedClass}
                      onChange={(e) => setNewAssignedClass(e.target.value as SchoolClass)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white cursor-pointer"
                    >
                      <option value="HateKhori">১. হাতেখড়ি</option>
                      <option value="Play">২. প্লে</option>
                      <option value="Nursery">৩. নার্সারি</option>
                      <option value="KG">৪. কেজি</option>
                      <option value="Class_1">৫. ১ম শ্রেণি</option>
                      <option value="Class_2">৬. ২য় শ্রেণি</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Director Full Edit Option */}
              {newRole === 'director' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanFullEdit}
                      onChange={(e) => setNewCanFullEdit(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-0 cursor-pointer accent-amber-600"
                    />
                    <span className="text-xs font-black text-slate-900">
                      ✏️ এই পরিচালককে শুরু থেকেই পূর্ণ এডিট ক্ষমতা প্রদান করুন
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1 pl-6">
                    চালু থাকলে পরিচালক নোটিশ, শিক্ষার্থী, ফি ও ক্যালেন্ডার এডিট করতে পারবেন।
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ইউজার সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: EDIT USER (ইউজার তথ্য এডিট)
      ======================================================== */}
      {editingAccount && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setEditingAccount(null)}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-4 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    ইউজার অ্যাকাউন্ট ও তথ্য এডিট
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingAccount.nameBn} ({editingAccount.username})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পুরো নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAccount.nameBn}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, nameBn: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    নাম (English)
                  </label>
                  <input
                    type="text"
                    value={editingAccount.nameEn}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, nameEn: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইউজার আইডি (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingAccount.role === 'super_admin'}
                    value={editingAccount.username}
                    onChange={(e) =>
                      setEditingAccount({
                        ...editingAccount,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    লগইন পাসওয়ার্ড *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAccount.passwordHint}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, passwordHint: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editingAccount.phone}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইমেইল এড্রেস
                  </label>
                  <input
                    type="email"
                    value={editingAccount.email}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পদবী বা পরিচিতি
                </label>
                <input
                  type="text"
                  value={editingAccount.roleTitleBn}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, roleTitleBn: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Access Active / Disable switch */}
              {editingAccount.role !== 'super_admin' && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!editingAccount.isAccessDisabled}
                      onChange={(e) =>
                        setEditingAccount({
                          ...editingAccount,
                          isAccessDisabled: !e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-900">
                      অ্যাকাউন্ট সক্রিয় রাখুন (Active)
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1 pl-6">
                    টিক চিহ্ন তুলে দিলে এই আইডি দিয়ে লগইন সাময়িক বন্ধ থাকবে।
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>পরিবর্তন সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: DELETE CONFIRMATION (ইউজার ডিলিট নিশ্চিতকরণ)
      ======================================================== */}
      {deletingAccount && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setDeletingAccount(null)}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-4 space-y-4 animate-in fade-in zoom-in-95 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto text-xl">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                ইউজার অ্যাকাউন্ট ডিলিট নিশ্চিতকরণ
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                আপনি কি নিশ্চিতভাবে{' '}
                <strong className="text-slate-950">
                  "{deletingAccount.nameBn}" ({deletingAccount.username})
                </strong>
                -এর অ্যাকাউন্টটি সিস্টেম থেকে চিরতরে ডিলিট করতে চান?
              </p>
              <p className="text-[11px] text-rose-600 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200 mt-2">
                ⚠️ ডিলিট করার পর এই আইডি ও পাসওয়ার্ড দিয়ে কেউ আর পোর্টাল লগইন করতে পারবেন না।
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAccount(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                না, ফিরে যান
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, সম্পূর্ণ ডিলিট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
