import React, { useState } from 'react';
import { FcmNotification, UserRole } from '../types/school';
import { FcmRegistrationResult } from '../lib/firebase';
import {
  Bell,
  BellRing,
  CheckCheck,
  ShieldAlert,
  GraduationCap,
  X,
  ArrowRight,
  Radio,
  Smartphone,
  CheckCircle2,
  Send,
  Phone,
  CreditCard,
  BookMarked,
  Package,
  AlertTriangle,
} from 'lucide-react';

interface FcmNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: FcmNotification[];
  activeToast: FcmNotification | null;
  onDismissToast: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigateTab: (tab: string) => void;
  fcmStatus: FcmRegistrationResult | null;
  onEnableFcmPush: () => void;
  onTriggerUrgentPickupTest: () => void;
  onTriggerAdmissionTest: () => void;
  onTriggerFeeReminderTest?: () => void;
  currentRole: UserRole;
}

export const FcmNotificationCenter: React.FC<FcmNotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  activeToast,
  onDismissToast,
  onMarkRead,
  onMarkAllRead,
  onNavigateTab,
  fcmStatus,
  onEnableFcmPush,
  onTriggerUrgentPickupTest,
  onTriggerAdmissionTest,
  onTriggerFeeReminderTest,
  currentRole,
}) => {
  const [filterType, setFilterType] = useState<
    'all' | 'urgent_pickup' | 'admission_application' | 'fee_due_reminder' | 'homework_task_assigned' | 'inventory_low_stock'
  >('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  return (
    <>
      {/* Real-Time Floating FCM Push Alert Toast Banner */}
      {activeToast && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] bg-slate-950 text-white rounded-2xl border-2 border-amber-400 shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  activeToast.type === 'urgent_pickup'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50'
                    : activeToast.type === 'inventory_low_stock'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50'
                    : activeToast.type === 'fee_due_reminder'
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                    : activeToast.type === 'homework_task_assigned'
                    ? 'bg-orange-500/25 text-orange-300 border border-orange-500/50'
                    : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50'
                }`}
              >
                {activeToast.type === 'urgent_pickup' ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : activeToast.type === 'inventory_low_stock' ? (
                  <Package className="w-4 h-4 text-rose-300" />
                ) : activeToast.type === 'fee_due_reminder' ? (
                  <CreditCard className="w-4 h-4 text-amber-300" />
                ) : activeToast.type === 'homework_task_assigned' ? (
                  <BookMarked className="w-4 h-4 text-amber-300" />
                ) : (
                  <GraduationCap className="w-4 h-4" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                    <Radio className="w-3 h-3" />
                    FCM Live Push
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {activeToast.timestamp}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mt-1 leading-snug">
                  {activeToast.titleBn}
                </h4>
              </div>
            </div>
            <button
              onClick={onDismissToast}
              aria-label="নোটিফিকেশন টোস্ট বন্ধ করুন"
              className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            {activeToast.bodyBn}
          </p>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-[10px] text-emerald-300 font-mono truncate">
              ID: {activeToast.fcmMessageId.split('/').pop()}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  onMarkRead(activeToast.id);
                  onNavigateTab(activeToast.actionTab);
                  onDismissToast();
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>
                  {activeToast.type === 'urgent_pickup'
                    ? 'গেট-পাস মডিউলে যান'
                    : activeToast.type === 'inventory_low_stock'
                    ? 'ইনভেন্টরি দেখুন'
                    : activeToast.type === 'fee_due_reminder'
                    ? 'বিকাশ ফি পরিশোধ করুন'
                    : activeToast.type === 'homework_task_assigned'
                    ? 'হোমওয়ার্ক দেখুন'
                    : 'ভর্তি আবেদন দেখুন'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FCM Notification Center Modal / Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="FCM রিয়েল-টাইম শিক্ষক নোটিফিকেশন সেন্টার"
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-sm shrink-0">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold">
                        FCM রিয়েল-টাইম শিক্ষক নোটিফিকেশন সেন্টার
                      </h3>
                      <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        LIVE
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100/90">
                      Firebase Cloud Messaging (FCM) · নতুন ভর্তি আবেদন ও জরুরি পিক-আপ অ্যালার্ট
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* FCM Connection & Device Registration Status Box */}
              <div className="bg-black/30 rounded-xl p-3 border border-white/15 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-semibold text-amber-200">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>FCM Sender ID: 597589396096</span>
                  </span>
                  <button
                    onClick={onEnableFcmPush}
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>
                      {fcmStatus?.permission === 'granted'
                        ? 'FCM টোকেন সক্রিয় ✓'
                        : 'ব্রাউজার পুশ সক্রিয় করুন'}
                    </span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  {fcmStatus?.statusMessageBn ||
                    'FCM রিয়েল-টাইম ক্লাউড লিসেনার সক্রিয় আছে। নতুন ভর্তি বা জরুরি পিক-আপের সাথে সাথে তাৎক্ষণিক অ্যালার্ট আসবে।'}
                </p>
                {fcmStatus?.token && (
                  <div className="text-[10px] font-mono text-emerald-300 bg-black/40 px-2 py-1 rounded truncate">
                    Token: {fcmStatus.token}
                  </div>
                )}
              </div>
            </div>

            {/* Instant Real-Time FCM Dispatch Bar (For Teachers / Gate Staff / Admins) */}
            <div className="bg-amber-50/90 border-b border-amber-200/80 px-5 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-950">
                  ⚡ তাৎক্ষণিক রিয়েল-টাইম FCM পুশ টেস্ট ট্রিগার (भूमিকা: {currentRole}):
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>সবগুলো পঠিত করুন ({unreadCount})</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={onTriggerUrgentPickupTest}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>জরুরি পিক-আপ পুশ</span>
                </button>
                <button
                  onClick={onTriggerAdmissionTest}
                  className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>নতুন ভর্তি পুশ</span>
                </button>
                {onTriggerFeeReminderTest && (
                  <button
                    onClick={onTriggerFeeReminderTest}
                    className="px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>৩-দিন ফি পুশ টেস্ট</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50 overflow-x-auto">
              <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  সব ({notifications.length})
                </button>
                <button
                  onClick={() => setFilterType('fee_due_reminder')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === 'fee_due_reminder'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  💳 ফি স্মারক (
                  {notifications.filter((n) => n.type === 'fee_due_reminder').length})
                </button>
                <button
                  onClick={() => setFilterType('urgent_pickup')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === 'urgent_pickup'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  🚨 পিক-আপ (
                  {notifications.filter((n) => n.type === 'urgent_pickup').length})
                </button>
                <button
                  onClick={() => setFilterType('admission_application')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === 'admission_application'
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  🎓 ভর্তি (
                  {notifications.filter((n) => n.type === 'admission_application').length})
                </button>
                <button
                  onClick={() => setFilterType('inventory_low_stock')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === 'inventory_low_stock'
                      ? 'bg-rose-700 text-white'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  📦 লো-স্টক (
                  {notifications.filter((n) => n.type === 'inventory_low_stock').length})
                </button>
              </div>
            </div>

            {/* Notification Feed List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center space-y-2 text-slate-400">
                  <Bell className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-xs">এই ক্যাটাগরিতে কোনো নোটিফিকেশন নেই।</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const isUrgent = notif.type === 'urgent_pickup';
                  const isLowStock = notif.type === 'inventory_low_stock';
                  const isFeeReminder = notif.type === 'fee_due_reminder';

                  return (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        !notif.read
                          ? isUrgent || isLowStock
                            ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                            : isFeeReminder
                            ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                            : 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                          : 'bg-white border-slate-200 opacity-85'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isUrgent || isLowStock
                                ? 'bg-rose-600 text-white'
                                : isFeeReminder
                                ? 'bg-amber-600 text-white'
                                : notif.type === 'homework_task_assigned'
                                ? 'bg-orange-500 text-white'
                                : 'bg-emerald-700 text-white'
                            }`}
                          >
                            {isUrgent
                              ? '🚨 জরুরি পিক-আপ'
                              : isLowStock
                              ? '📦 লো-স্টক ইনভেন্টরি'
                              : isFeeReminder
                              ? '💳 ফি পরিশোধের স্মারক'
                              : notif.type === 'homework_task_assigned'
                              ? '📚 বাড়ির কাজ / হোমওয়ার্ক'
                              : '🎓 নতুন ভর্তি আবেদন'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {notif.className}
                          </span>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {notif.titleBn}
                      </h4>

                      <p className="text-xs text-slate-700 leading-relaxed">{notif.bodyBn}</p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-xs">
                        <div className="flex items-center gap-3 text-[11px] text-slate-600">
                          <span>
                            {isLowStock ? 'ইনচার্জ: ' : 'অভিভাবক: '}
                            <strong className="text-slate-900">{notif.guardianNameBn}</strong>
                          </span>
                          {notif.guardianPhone && (
                            <span className="flex items-center gap-1 font-mono text-emerald-800">
                              <Phone className="w-3 h-3" />
                              {notif.guardianPhone}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!notif.read && (
                            <button
                              onClick={() => onMarkRead(notif.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              পঠিত মার্ক করুন
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onMarkRead(notif.id);
                              onNavigateTab(notif.actionTab);
                              onClose();
                            }}
                            className={`px-3 py-1 text-[11px] font-bold text-white rounded-lg flex items-center gap-1 cursor-pointer ${
                              isUrgent || isLowStock
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : isFeeReminder
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : notif.type === 'homework_task_assigned'
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : 'bg-emerald-700 hover:bg-emerald-800'
                            }`}
                          >
                            <span>
                              {isUrgent
                                ? 'গেট-পাস দেখুন'
                                : isLowStock
                                ? 'ইনভেন্টরি দেখুন'
                                : isFeeReminder
                                ? 'বিকাশ ফি পে করুন'
                                : notif.type === 'homework_task_assigned'
                                ? 'হোমওয়ার্ক দেখুন'
                                : 'ভর্তি বিস্তারিত'}
                            </span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Firebase Cloud Messaging · সার্ভিস ওয়ার্কার সক্রিয়</span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
