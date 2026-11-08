import React, { useState } from 'react';
import { Student, AttendanceRecord, SchoolClass, FcmNotification } from '../../types/school';
import { getSchoolClassNameBn, toBengaliNumber } from '../../utils/schoolLogic';
import { 
  X, 
  Send, 
  Smartphone, 
  BellRing, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Users, 
  CheckCheck,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export interface AbsentAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  absentStudents: { student: Student; record?: AttendanceRecord }[];
  className: SchoolClass;
  dateStr: string;
  loggedInTeacherNameBn?: string;
  onSendAlerts: (payload: {
    selectedStudentIds: string[];
    channel: 'sms' | 'push' | 'both';
    messageTemplate: string;
    notifications: FcmNotification[];
  }) => void;
}

export const AbsentAlertModal: React.FC<AbsentAlertModalProps> = ({
  isOpen,
  onClose,
  absentStudents,
  className,
  dateStr,
  loggedInTeacherNameBn,
  onSendAlerts,
}) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(() =>
    absentStudents.map((s) => s.student.id)
  );
  const [channel, setChannel] = useState<'sms' | 'push' | 'both'>('both');
  const [templateKey, setTemplateKey] = useState<'standard' | 'health_check' | 'custom'>('standard');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  // Sync selectedStudentIds when absentStudents change
  React.useEffect(() => {
    setSelectedStudentIds(absentStudents.map((s) => s.student.id));
    setSuccessCount(null);
  }, [absentStudents]);

  if (!isOpen) return null;

  const classNameBn = getSchoolClassNameBn(className);

  const getTemplateText = (key: 'standard' | 'health_check' | 'custom', studentName: string = '{শিক্ষার্থীর নাম}') => {
    switch (key) {
      case 'standard':
        return `সম্মানিত অভিভাবক, আনন্দ পাঠশালায় আপনার সন্তান ${studentName} আজ (${dateStr}) ক্লাসে উপস্থিত হয়নি। কোনো অসুবিধা থাকলে স্কুল অফিসে অবগত করুন। ধন্যবাদ, আনন্দ পাঠশালা।`;
      case 'health_check':
        return `স্নেহের ${studentName}-এর সম্মানিত অভিভাবক, শিশুটি আজ স্কুলে আসেনি। সোনামণি কি ভালো আছে? কোনো অসুস্থতা বা সমস্যা থাকলে জানান, আমরা প্রয়োজনীয় সহায়তা ও ক্লাসের পড়া পাঠিয়ে দেব।`;
      case 'custom':
        return customMessage || `সম্মানিত অভিভাবক, আজ (${dateStr}) আনন্দ পাঠশালায় আপনার সন্তানের অনুপস্থিতি বিষয়ে দৃষ্টি আকর্ষণ করা হচ্ছে।`;
    }
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === absentStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(absentStudents.map((s) => s.student.id));
    }
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      alert('অনুগ্রহ করে অন্তত একজন শিক্ষার্থী নির্বাচন করুন।');
      return;
    }

    setIsSending(true);

    const teacherName = loggedInTeacherNameBn || 'শ্রেণি শিক্ষক';
    const targetStudents = absentStudents.filter((item) => selectedStudentIds.includes(item.student.id));

    // Construct FCM notifications
    const notifications: FcmNotification[] = targetStudents.map((item) => {
      const studentName = item.student.nameBn;
      const body = templateKey === 'custom' 
        ? (customMessage || getTemplateText('standard', studentName))
        : getTemplateText(templateKey, studentName);

      return {
        id: `fcm-absent-${item.student.id}-${Date.now()}`,
        type: 'absence_alert',
        priority: 'urgent',
        titleBn: `⚠️ ক্লাসরুম অনুপস্থিতি সতর্কতা: ${studentName}`,
        bodyBn: body,
        targetRole: 'parent',
        studentOrApplicantNameBn: studentName,
        className: item.student.className,
        guardianNameBn: item.student.fatherNameBn || 'সম্মানিত অভিভাবক',
        guardianPhone: item.student.emergencyPhone,
        timestamp: 'এইমাত্র',
        read: false,
        actionTab: 'attendance',
        fcmMessageId: `projects/gen-lang-client-0036381817/messages/absent_${item.student.id}_${Date.now()}`,
      };
    });

    onSendAlerts({
      selectedStudentIds,
      channel,
      messageTemplate: getTemplateText(templateKey),
      notifications,
    });

    setTimeout(() => {
      setIsSending(false);
      setSuccessCount(targetStudents.length);
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 text-rose-100 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>অভিভাবক নোটিফিকেশন সেন্টার</span>
            </span>
            <span className="text-white/60 text-xs">·</span>
            <span className="text-white/90 text-xs font-semibold">{classNameBn} শ্রেণি</span>
          </div>

          <h3 className="text-xl font-black tracking-tight">অনুপস্থিতি সতর্কতা ও স্বয়ংক্রিয় অ্যালার্ট প্রেরণ</h3>
          <p className="text-xs text-rose-100 mt-1 max-w-lg">
            আজকের ক্লাসরুমে অনুপস্থিত শিশুদের অভিভাবকদের কাছে সরাসরি এসএমএস ও পুশ নোটিফিকেশন পাঠান।
          </p>
        </div>

        {/* Success Banner */}
        {successCount !== null ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              {toBengaliNumber(successCount)} জন অভিভাবকের কাছে সতর্কবার্তা পাঠানো হয়েছে!
            </h4>
            <p className="text-xs text-slate-500">
              এসএমএস গেটওয়ে ও অভিভাবক পোর্টালে রিয়েল-টাইম পুশ অ্যালার্ট সফলভাবে ডেলিভারি হয়েছে।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendSubmit} className="p-6 space-y-5">
            {/* Absent Student Selection List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-rose-600" />
                  <span>অনুপস্থিত শিক্ষার্থী তালিকা ({toBengaliNumber(absentStudents.length)} জন):</span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>
                    {selectedStudentIds.length === absentStudents.length ? 'সবগুলো আনচেক করুন' : 'সবগুলো সিলেক্ট করুন'}
                  </span>
                </button>
              </div>

              {absentStudents.length === 0 ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                  ✓ এই শ্রেণিতে বর্তমানে কোনো অনুপস্থিত শিক্ষার্থী নেই!
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                  {absentStudents.map(({ student, record }) => {
                    const isChecked = selectedStudentIds.includes(student.id);
                    return (
                      <div
                        key={student.id}
                        onClick={() => handleToggleStudent(student.id)}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isChecked
                            ? 'bg-rose-50/80 border-rose-300 shadow-2xs'
                            : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent div
                            className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                          />
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${student.avatarColor}`}>
                            {student.rollNo}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{student.nameBn}</span>
                              <span className="text-[10px] font-mono font-medium text-slate-500">({student.nameEn})</span>
                            </div>
                            <div className="text-[10.5px] text-slate-500">
                              পিতা: {student.fatherNameBn} · 📞 {student.emergencyPhone}
                            </div>
                          </div>
                        </div>

                        {record?.absentReasonBn ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                            নোট: {record.absentReasonBn}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                            অনুপস্থিত
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Template Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>বার্তা টেমপ্লেট নির্বাচন করুন:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTemplateKey('standard')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                    templateKey === 'standard'
                      ? 'border-indigo-500 bg-indigo-50/70 font-bold text-indigo-950 ring-1 ring-indigo-400'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1 text-[11px] mb-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    সাধারণ অনুপস্থিতি
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2">
                    আজকের ক্লাসরুমে উপস্থিত না থাকার আনুষ্ঠানিক বার্তা
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateKey('health_check')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                    templateKey === 'health_check'
                      ? 'border-indigo-500 bg-indigo-50/70 font-bold text-indigo-950 ring-1 ring-indigo-400'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1 text-[11px] mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    সুস্থতার খোঁজখবর
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2">
                    শিশু অসুস্থ কি না এবং পড়া পাঠানোর সস্নেহ পরামর্শ
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateKey('custom')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                    templateKey === 'custom'
                      ? 'border-indigo-500 bg-indigo-50/70 font-bold text-indigo-950 ring-1 ring-indigo-400'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1 text-[11px] mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    কাস্টম বার্তা
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2">
                    শিক্ষক নিজের ভাষায় বার্তা টাইপ করবেন
                  </p>
                </button>
              </div>

              {templateKey === 'custom' ? (
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="যেমন: জরুরি নোটিশ: আগামীকাল ক্লাসে উপস্থিত থাকার জন্য বিশেষ অনুরোধ করা যাচ্ছে..."
                  className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="p-3 bg-slate-100 rounded-xl text-slate-700 text-xs italic border border-slate-200">
                  "{getTemplateText(templateKey)}"
                </div>
              )}
            </div>

            {/* Delivery Channel Radio/Toggles */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-rose-600" />
                <span>বার্তা পাঠানোর মাধ্যম:</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('both')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    channel === 'both'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>এসএমএস + পুশ উভয়ই</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    channel === 'sms'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>শুধু এসএমএস</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('push')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    channel === 'push'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>শুধু অ্যাপ পুশ</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSending || selectedStudentIds.length === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>বার্তা পাঠানো হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {selectedStudentIds.length > 0
                        ? `${toBengaliNumber(selectedStudentIds.length)} জন অভিভাবককে সতর্কবার্তা পাঠান`
                        : 'সতর্কবার্তা পাঠান'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
