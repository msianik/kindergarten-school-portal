import React, { useState, useEffect } from 'react';
import { PortalAccount } from '../types/school';
import {
  PORTAL_ACCOUNTS,
  getAllPortalAccounts,
  detectAccountFromIdentifier,
  findAccountByEmailOrPhone,
  resetPortalAccountCredentials,
} from '../utils/schoolLogic';
import {
  Lock,
  UserCheck,
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Crown,
  Users,
  RotateCcw,
  ArrowLeft,
  Send,
  Key,
  AlertCircle,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (account: PortalAccount) => void;
  logoUrl?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  logoUrl = '/assets/fb/logo.jpg',
}) => {
  const [allAccounts, setAllAccounts] = useState<PortalAccount[]>(() => getAllPortalAccounts());
  const superAdminDefault = allAccounts.find((a) => a.role === 'super_admin') || PORTAL_ACCOUNTS[0];

  const [emailInput, setEmailInput] = useState(superAdminDefault.email);
  const [phoneInput, setPhoneInput] = useState(superAdminDefault.phone);
  const [userIdInput, setUserIdInput] = useState(superAdminDefault.username);
  const [password, setPassword] = useState(superAdminDefault.passwordHint);
  const [showPassword, setShowPassword] = useState(false);
  const [lastEditedField, setLastEditedField] = useState<'email' | 'phone' | 'userId'>('userId');
  const [errorBn, setErrorBn] = useState<string | null>(null);
  const [resetNoticeBn, setResetNoticeBn] = useState<string | null>(null);

  // Forgot Password Flow State
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<'verify' | 'reset' | 'success'>('verify');
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'phone'>('phone');
  const [verifiedAccount, setVerifiedAccount] = useState<PortalAccount | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotErrorBn, setForgotErrorBn] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const refresh = () => setAllAccounts(getAllPortalAccounts());
    refresh();
    window.addEventListener('ananda-portal-accounts-updated', refresh);
    window.addEventListener('ananda-directors-updated', refresh);
    window.addEventListener('ananda-teachers-updated', refresh);
    return () => {
      window.removeEventListener('ananda-portal-accounts-updated', refresh);
      window.removeEventListener('ananda-directors-updated', refresh);
      window.removeEventListener('ananda-teachers-updated', refresh);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Resolve account prioritizing the field the user most recently edited, falling back to any filled field
  const resolveDetectedAccount = (): PortalAccount | null => {
    const orderedInputs =
      lastEditedField === 'email'
        ? [emailInput, userIdInput, phoneInput]
        : lastEditedField === 'phone'
        ? [phoneInput, userIdInput, emailInput]
        : [userIdInput, emailInput, phoneInput];

    for (const val of orderedInputs) {
      if (val && val.trim()) {
        const match = detectAccountFromIdentifier(val);
        if (match) return match;
      }
    }
    return null;
  };

  const detectedAccount = resolveDetectedAccount();
  const matchedRecoveryAccount = recoveryIdentifier.trim()
    ? findAccountByEmailOrPhone(recoveryIdentifier)
    : null;

  const openForgotPasswordFlow = () => {
    setIsForgotMode(true);
    setForgotStep('verify');
    setForgotErrorBn(null);
    setResetNoticeBn(null);
    const initialIdentifier =
      lastEditedField === 'email' && emailInput.trim()
        ? emailInput.trim()
        : phoneInput.trim() || emailInput.trim();
    setRecoveryIdentifier(initialIdentifier);
    setRecoveryMethod(initialIdentifier.includes('@') ? 'email' : 'phone');
    setOtpInput('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const closeForgotPasswordFlow = () => {
    setIsForgotMode(false);
    setForgotStep('verify');
    setForgotErrorBn(null);
  };

  const handleSendVerificationCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier.trim()) {
      setForgotErrorBn('অনুগ্রহ করে আপনার নিবন্ধিত ইমেইল এড্রেস অথবা মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    const found = findAccountByEmailOrPhone(recoveryIdentifier);
    if (!found) {
      setForgotErrorBn(
        'প্রদত্ত ইমেইল বা মোবাইল নম্বরের সাথে কোনো নিবন্ধিত পোর্টাল অ্যাকাউন্ট পাওয়া যায়নি। সঠিক ইমেইল বা মোবাইল নম্বর দিন।'
      );
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    setVerifiedAccount(found);
    setGeneratedOtp(code);
    setOtpInput(code);
    setNewUserId(found.username);
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotErrorBn(null);
    setForgotStep('reset');
  };

  const handleResendOtp = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpInput(code);
    setForgotErrorBn(null);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedAccount) return;

    if (otpInput.trim() !== generatedOtp) {
      setForgotErrorBn(`ভেরিফিকেশন কোড সঠিক নয়। প্রেরিত কোড (${generatedOtp}) সঠিকভাবে লিখুন।`);
      return;
    }

    if (!newPassword || newPassword.trim().length < 4) {
      setForgotErrorBn('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    if (newPassword.trim() !== confirmNewPassword.trim()) {
      setForgotErrorBn('নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড দুটি মেলেনি।');
      return;
    }

    const updated = resetPortalAccountCredentials(
      verifiedAccount.id,
      newPassword.trim(),
      newUserId.trim() || verifiedAccount.username
    );

    if (!updated) {
      setForgotErrorBn('পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      return;
    }

    setVerifiedAccount(updated);
    setAllAccounts(getAllPortalAccounts());
    setEmailInput(updated.email);
    setPhoneInput(updated.phone);
    setUserIdInput(updated.username);
    setPassword(updated.passwordHint);
    setLastEditedField('userId');
    setErrorBn(null);
    setForgotErrorBn(null);
    setResetNoticeBn(
      `${updated.nameBn}-এর অ্যাকাউন্ট পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে (নতুন পাসওয়ার্ড: ${updated.passwordHint})।`
    );
    setForgotStep('success');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() && !phoneInput.trim() && !userIdInput.trim()) {
      setErrorBn('অনুগ্রহ করে ইমেইল, মোবাইল নম্বর অথবা ইউজার আইডি যেকোনো একটি প্রদান করুন।');
      return;
    }
    if (!password || password.trim().length < 3) {
      setErrorBn('অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    const account = resolveDetectedAccount();
    if (!account) {
      setErrorBn('প্রদত্ত ইমেইল, মোবাইল নম্বর বা ইউজার আইডি কোনো নিবন্ধিত অ্যাকাউন্টের সাথে মেলেনি।');
      return;
    }

    const expectedPassword = account.passwordHint || '123456';
    if (password.trim() !== expectedPassword) {
      setErrorBn(
        `পাসওয়ার্ড সঠিক নয়। সঠিক পাসওয়ার্ড দিন অথবা 'পাসওয়ার্ড ভুলে গেছেন?' অপশন ব্যবহার করে রিসেট করুন।`
      );
      return;
    }

    setErrorBn(null);
    onLoginSuccess(account);
  };

  const handleSelectAccountToFill = (acc: PortalAccount, autoLogin = false) => {
    setEmailInput(acc.email);
    setPhoneInput(acc.phone);
    setUserIdInput(acc.username);
    setPassword(acc.passwordHint || '123456');
    setLastEditedField('userId');
    setErrorBn(null);
    if (isForgotMode) {
      setRecoveryIdentifier(acc.phone || acc.email);
      setForgotErrorBn(null);
    }
    if (autoLogin) {
      onLoginSuccess(acc);
    }
  };

  const superAdminAcc = allAccounts.find((a) => a.role === 'super_admin') || PORTAL_ACCOUNTS[0];
  const directorAccounts = allAccounts.filter((a) => a.role === 'director');
  const academicAccounts = allAccounts.filter((a) =>
    ['principal', 'teacher', 'parent', 'gate_security'].includes(a.role)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="আনন্দ পাঠশালা স্মার্ট পোর্টাল লগইন"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-4 max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95"
      >
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-amber-700 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            aria-label="লগইন উইন্ডো বন্ধ করুন"
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <img
              src={logoUrl}
              alt="আনন্দ পাঠশালা লোগো"
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover bg-white p-1 border-2 border-amber-300 shadow-sm shrink-0"
            />
            <div>
              <span className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-200" />
                সুপার অ্যাডমিন, পরিচালক পর্ষদ ও একাডেমিক পোর্টাল লগইন
              </span>
              <h2 className="text-lg sm:text-xl font-black tracking-tight mt-1">
                আনন্দ পাঠশালা — কেন্দ্রীয় পোর্টাল লগইন
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                ইমেইল, মোবাইল নম্বর এবং ইউজার আইডি ও নিচে পাসওয়ার্ড দিয়ে লগইন করুন।
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {resetNoticeBn && !isForgotMode && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-2 text-xs text-emerald-900 font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resetNoticeBn}</span>
              </div>
              <button
                type="button"
                onClick={() => setResetNoticeBn(null)}
                className="text-[11px] text-emerald-700 hover:underline shrink-0 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          )}

          {isForgotMode ? (
            /* =================================================================== */
            /* FORGOT PASSWORD & CREDENTIAL RECOVERY FLOW                          */
            /* =================================================================== */
            <div className="bg-amber-50/70 p-4 sm:p-5 rounded-2xl border-2 border-amber-300 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      পাসওয়ার্ড ও লগইন তথ্য পুনরুদ্ধার (Forgot Password)
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      নিবন্ধিত ইমেইল অথবা মোবাইল নম্বর যাচাই করে নতুন পাসওয়ার্ড সেট করুন
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeForgotPasswordFlow}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>লগইনে ফিরুন</span>
                </button>
              </div>

              {/* Step Progress Indicator */}
              <div className="grid grid-cols-3 gap-2">
                <div
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border ${
                    forgotStep === 'verify'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  <span>১. ইমেইল/মোবাইল যাচাই</span>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border ${
                    forgotStep === 'reset'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : forgotStep === 'success'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                >
                  <span>২. কোড ও নতুন পাসওয়ার্ড</span>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border ${
                    forgotStep === 'success'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                >
                  <span>৩. সম্পন্ন ও লগইন</span>
                </div>
              </div>

              {forgotErrorBn && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{forgotErrorBn}</span>
                </div>
              )}

              {forgotStep === 'verify' && (
                <form onSubmit={handleSendVerificationCode} className="space-y-4">
                  {/* Method Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryMethod('phone');
                        if (detectedAccount?.phone) setRecoveryIdentifier(detectedAccount.phone);
                        setForgotErrorBn(null);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        recoveryMethod === 'phone'
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>মোবাইল নম্বর দিয়ে যাচাই</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryMethod('email');
                        if (detectedAccount?.email) setRecoveryIdentifier(detectedAccount.email);
                        setForgotErrorBn(null);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        recoveryMethod === 'email'
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>ইমেইল এড্রেস দিয়ে যাচাই</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      {recoveryMethod === 'phone'
                        ? 'আপনার নিবন্ধিত মোবাইল নম্বর লিখুন:'
                        : 'আপনার নিবন্ধিত ইমেইল এড্রেস লিখুন:'}
                    </label>
                    <div className="relative">
                      {recoveryMethod === 'phone' ? (
                        <Phone className="w-4 h-4 text-amber-600 absolute left-3.5 top-2.5" />
                      ) : (
                        <Mail className="w-4 h-4 text-emerald-600 absolute left-3.5 top-2.5" />
                      )}
                      <input
                        type="text"
                        value={recoveryIdentifier}
                        onChange={(e) => {
                          setRecoveryIdentifier(e.target.value);
                          setForgotErrorBn(null);
                        }}
                        placeholder={
                          recoveryMethod === 'phone'
                            ? 'যেমন: 01788990011 অথবা ০১৭৮৮৯৯০০১১'
                            : 'যেমন: mostofa.mamun@anandapathshala.edu.bd'
                        }
                        className="w-full pl-10 pr-3 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Live Account Match Preview */}
                  <div
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                      matchedRecoveryAccount
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {matchedRecoveryAccount?.avatarUrl ? (
                        <img
                          src={matchedRecoveryAccount.avatarUrl}
                          alt={matchedRecoveryAccount.nameBn}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                          যাচাইকৃত নিবন্ধিত অ্যাকাউন্ট:
                        </span>
                        {matchedRecoveryAccount ? (
                          <div>
                            <p className="text-xs font-black text-slate-900 truncate">
                              {matchedRecoveryAccount.nameBn} ({matchedRecoveryAccount.roleTitleBn})
                            </p>
                            <p className="text-[10px] text-slate-600 font-mono truncate">
                              User ID: {matchedRecoveryAccount.username} · Mobile: {matchedRecoveryAccount.phone} · Email: {matchedRecoveryAccount.email}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">
                            নিবন্ধিত মোবাইল নম্বর বা ইমেইল লিখলে অ্যাকাউন্ট এখানে দেখা যাবে
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2.5 text-xs font-black text-white bg-gradient-to-r from-amber-600 to-emerald-700 hover:from-amber-700 hover:to-emerald-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ভেরিফিকেশন কোড পাঠান</span>
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 'reset' && verifiedAccount && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  {/* Verified Account & OTP Notification Box */}
                  <div className="p-3.5 rounded-2xl bg-white border border-emerald-300 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-black text-slate-900">
                          অ্যাকাউন্ট যাচাইকৃত: {verifiedAccount.nameBn}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                          {verifiedAccount.roleTitleBn}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                      >
                        পুনরায় কোড পাঠান
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-[11px] text-amber-950">
                        <span className="font-bold">
                          {recoveryIdentifier.includes('@')
                            ? `ইমেইলে (${verifiedAccount.email})`
                            : `মোবাইল নম্বরে (${verifiedAccount.phone})`}
                        </span>{' '}
                        ৬-সংখ্যার ভেরিফিকেশন কোড পাঠানো হয়েছে:{' '}
                        <strong className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-900">
                          {generatedOtp}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpInput(generatedOtp)}
                        className="text-[10px] font-bold bg-amber-600 text-white px-2.5 py-1 rounded-lg hover:bg-amber-700 cursor-pointer"
                      >
                        কোড বসান
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* OTP Verification Input */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        ১. ৬-সংখ্যার ভেরিফিকেশন কোড (OTP):
                      </label>
                      <input
                        type="text"
                        required
                        value={otpInput}
                        onChange={(e) => {
                          setOtpInput(e.target.value);
                          setForgotErrorBn(null);
                        }}
                        placeholder="যেমন: 123456"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono font-bold text-slate-900"
                      />
                    </div>

                    {/* User ID (Read/Update) */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        ২. ইউজার আইডি (User ID):
                      </label>
                      <input
                        type="text"
                        required
                        value={newUserId}
                        onChange={(e) => {
                          setNewUserId(e.target.value);
                          setForgotErrorBn(null);
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* New Password */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        ৩. নতুন পাসওয়ার্ড দিন:
                      </label>
                      <div className="relative">
                        <Key className="w-3.5 h-3.5 text-emerald-700 absolute left-3 top-2.5" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setForgotErrorBn(null);
                          }}
                          placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৪ অক্ষর)"
                          className="w-full pl-8 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono font-bold text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        ৪. পুনরায় নতুন পাসওয়ার্ড লিখুন:
                      </label>
                      <div className="relative">
                        <KeyRound className="w-3.5 h-3.5 text-emerald-700 absolute left-3 top-2.5" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={confirmNewPassword}
                          onChange={(e) => {
                            setConfirmNewPassword(e.target.value);
                            setForgotErrorBn(null);
                          }}
                          placeholder="নতুন পাসওয়ার্ড নিশ্চিত করুন"
                          className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep('verify');
                        setForgotErrorBn(null);
                      }}
                      className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 cursor-pointer"
                    >
                      পূর্ববর্তী ধাপ
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>পাসওয়ার্ড রিসেট ও সংরক্ষণ করুন</span>
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 'success' && verifiedAccount && (
                <div className="p-4 rounded-2xl bg-white border-2 border-emerald-400 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        পাসওয়ার্ড সফলভাবে রিসেট হয়েছে!
                      </h4>
                      <p className="text-xs text-slate-600">
                        {verifiedAccount.nameBn} ({verifiedAccount.roleTitleBn})-এর নতুন লগইন তথ্য নিচে সংরক্ষিত হয়েছে।
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block">ইউজার আইডি:</span>
                      <strong className="font-mono text-slate-900">{verifiedAccount.username}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block">মোবাইল নম্বর:</span>
                      <strong className="font-mono text-slate-900">{verifiedAccount.phone}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block">নতুন পাসওয়ার্ড:</span>
                      <strong className="font-mono text-emerald-800">{verifiedAccount.passwordHint}</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={closeForgotPasswordFlow}
                      className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      লগইন ফর্মে ফিরে যান
                    </button>
                    <button
                      type="button"
                      onClick={() => onLoginSuccess(verifiedAccount)}
                      className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>নতুন পাসওয়ার্ড দিয়ে সরাসরি লগইন করুন</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* =================================================================== */
            /* 1. LOGIN CREDENTIALS FORM (ইমেইল, মোবাইল নম্বর, ইউজার আইডি ও নিচে পাসওয়ার্ড) */
            /* =================================================================== */
            <form
              onSubmit={handleFormSubmit}
              className="bg-slate-50/90 p-4 sm:p-5 rounded-2xl border-2 border-emerald-200/80 space-y-4 shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">
                    লগইন তথ্য প্রদান করুন (ইমেইল, মোবাইল নম্বর ও ইউজার আইডি)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openForgotPasswordFlow}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-100/90 hover:bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>পাসওয়ার্ড ভুলে গেছেন?</span>
                  </button>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    পাসওয়ার্ড: {detectedAccount?.passwordHint || '123456'}
                  </span>
                </div>
              </div>

              {errorBn && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center justify-between gap-2 flex-wrap">
                  <span>{errorBn}</span>
                  <button
                    type="button"
                    onClick={openForgotPasswordFlow}
                    className="text-[11px] font-black text-rose-800 underline hover:text-rose-950 cursor-pointer shrink-0"
                  >
                    পাসওয়ার্ড রিসেট করুন
                  </button>
                </div>
              )}

              {/* 3 Dedicated Credential Fields: Email, Mobile Number, and User ID */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Email Address / Number */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    ১. ইমেইল এড্রেস / ইমেইল:
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setLastEditedField('email');
                        setErrorBn(null);
                      }}
                      placeholder="mostofa.mamun@..."
                      className="w-full pl-8 pr-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* 2. Mobile Number */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    ২. মোবাইল নম্বর:
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-amber-600 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => {
                        setPhoneInput(e.target.value);
                        setLastEditedField('phone');
                        setErrorBn(null);
                      }}
                      placeholder="01788990011"
                      className="w-full pl-8 pr-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 font-mono font-semibold text-slate-900"
                    />
                  </div>
                </div>

                {/* 3. User ID */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    ৩. ইউজার আইডি (User ID):
                  </label>
                  <div className="relative">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={userIdInput}
                      onChange={(e) => {
                        setUserIdInput(e.target.value);
                        setLastEditedField('userId');
                        setErrorBn(null);
                      }}
                      placeholder="superadmin / noman / principal"
                      className="w-full pl-8 pr-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Underneath: Password Input Box (নিচে পাসওয়ার্ড বসানোর জায়গা) */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    পাসওয়ার্ড (Password):
                  </label>
                  <button
                    type="button"
                    onClick={openForgotPasswordFlow}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>পাসওয়ার্ড ভুলে গেছেন? (Forgot Password?)</span>
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-emerald-700 absolute left-3.5 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড লিখুন (যেমন: 123456)"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono font-bold text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Live Automatic Role Detection Banner */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                  detectedAccount?.role === 'super_admin'
                    ? 'bg-amber-50/90 border-amber-400 text-amber-950'
                    : detectedAccount
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {detectedAccount?.avatarUrl ? (
                    <img
                      src={detectedAccount.avatarUrl}
                      alt={detectedAccount.nameBn}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      শনাক্তকৃত অ্যাকাউন্ট ও অ্যাক্সেস রোল:
                    </span>
                    {detectedAccount ? (
                      <p className="text-xs font-black text-slate-900 truncate">
                        {detectedAccount.nameBn} —{' '}
                        <span className="text-amber-800 font-bold">{detectedAccount.roleTitleBn}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        সঠিক ইমেইল, মোবাইল নম্বর অথবা ইউজার আইডি লিখুন
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* =================================================================== */}
          {/* 2. SUPER ADMIN & BOARD OF DIRECTORS (সুপার অ্যাডমিন ও পরিচালনা পর্ষদ)    */}
          {/* =================================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>সুপার অ্যাডমিন ও পরিচালনা পর্ষদ (১-ক্লিক লগইন ও ভিউ অ্যাক্সেস):</span>
              </span>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                সকল পরিচালকের ভিউ অপশন চালু
              </span>
            </div>

            {/* Highlighted Super Admin Card: Mostofa Al Mamun (Director & Secretary) */}
            <div
              onClick={() => handleSelectAccountToFill(superAdminAcc, true)}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                detectedAccount?.id === superAdminAcc.id
                  ? 'border-amber-500 bg-gradient-to-r from-amber-50 via-yellow-50/70 to-emerald-50 shadow-sm'
                  : 'border-amber-300 bg-amber-50/40 hover:border-amber-400 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={superAdminAcc.avatarUrl || logoUrl}
                  alt={superAdminAcc.nameBn}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500 shadow-xs shrink-0 bg-white"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-600 text-white shadow-2xs">
                      👑 সুপার অ্যাডমিন (Super Admin)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200">
                      পরিচালক ও সদস্য সচিব (Secretary)
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">{superAdminAcc.nameBn}</h4>
                  <p className="text-[11px] text-slate-600 font-mono">
                    ID: <strong className="text-slate-900">{superAdminAcc.username}</strong> · Mobile:{' '}
                    <strong className="text-slate-900">{superAdminAcc.phone}</strong> · Email:{' '}
                    <span className="text-slate-700">{superAdminAcc.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-end justify-between gap-1 shrink-0">
                <span className="text-[10px] font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                  পূর্ণ নিয়ন্ত্রণ ও অ্যাক্সেস নির্ধারক
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 hover:underline">
                  <span>সুপার অ্যাডমিন প্রবেশ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* All Other 4 Directors Grid (View Everything + Super Admin Controlled Access) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {directorAccounts.map((dirAcc) => {
                const isSelected = detectedAccount?.id === dirAcc.id;
                return (
                  <button
                    key={dirAcc.id}
                    type="button"
                    onClick={() => handleSelectAccountToFill(dirAcc, true)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={dirAcc.avatarUrl || logoUrl}
                        alt={dirAcc.nameBn}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-amber-300 shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-black text-slate-900 truncate">
                            {dirAcc.nameBn}
                          </span>
                          <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 shrink-0">
                            সবকিছু ভিউ
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold text-amber-900 truncate">
                          {dirAcc.roleTitleBn}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          ID: {dirAcc.username} · {dirAcc.phone}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================================== */}
          {/* 3. ACADEMIC, STAFF & GUARDIAN PORTAL ACCOUNTS                       */}
          {/* =================================================================== */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>প্রিন্সিপাল, শিক্ষক, সহায়ক স্টাফ ও অভিভাবক অ্যাকাউন্ট ({academicAccounts.length} টি):</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                নতুন প্রোফাইল ক্রিয়েট করলেই এখানে যুক্ত হবে
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {academicAccounts.map((acc) => {
                const isSelected = detectedAccount?.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectAccountToFill(acc, true)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                          {acc.role === 'principal'
                            ? '🎓 প্রিন্সিপাল'
                            : acc.role === 'teacher'
                            ? '👩‍🏫 শিক্ষক'
                            : acc.role === 'gate_security'
                            ? '🛡️ সহায়ক স্টাফ'
                            : '👨‍👧 অভিভাবক/শিক্ষার্থী'}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">{acc.nameBn}</h4>
                      <p className="text-[10px] text-slate-500 font-mono truncate">
                        ID: {acc.username} · Pass: {acc.passwordHint || '123456'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

