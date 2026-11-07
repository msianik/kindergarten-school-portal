import React, { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle2 } from 'lucide-react';
import { SchoolNotice } from '../../types/school';

interface AddEditNoticeModalProps {
  isOpen: boolean;
  editingNotice: SchoolNotice | null;
  onClose: () => void;
  onSave: (
    noticeData: Omit<SchoolNotice, 'id'> & { id?: string },
    isEdit: boolean
  ) => void;
  onDelete?: (id: string) => void;
  currentDateBn: string;
}

export const AddEditNoticeModal: React.FC<AddEditNoticeModalProps> = ({
  isOpen,
  editingNotice,
  onClose,
  onSave,
  onDelete,
  currentDateBn,
}) => {
  const [noticeFormTitleBn, setNoticeFormTitleBn] = useState('');
  const [noticeFormTitleEn, setNoticeFormTitleEn] = useState('');
  const [noticeFormCategory, setNoticeFormCategory] = useState<
    'admission' | 'urgent' | 'event' | 'exam' | 'holiday'
  >('admission');
  const [noticeFormPriority, setNoticeFormPriority] = useState<
    'urgent' | 'high' | 'normal'
  >('high');
  const [noticeFormBadgeBn, setNoticeFormBadgeBn] = useState('');
  const [noticeFormTargetAudienceBn, setNoticeFormTargetAudienceBn] = useState('');
  const [noticeFormDateBn, setNoticeFormDateBn] = useState('');
  const [noticeFormValidUntilBn, setNoticeFormValidUntilBn] = useState('');
  const [noticeFormDescriptionBn, setNoticeFormDescriptionBn] = useState('');
  const [noticeFormActionLink, setNoticeFormActionLink] = useState('');
  const [noticeFormActionTextBn, setNoticeFormActionTextBn] = useState('');
  const [noticeFormAttachmentName, setNoticeFormAttachmentName] = useState('');
  const [noticeFormIsPinned, setNoticeFormIsPinned] = useState(false);
  const [noticeFormFacebookPostUrl, setNoticeFormFacebookPostUrl] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (editingNotice) {
      setNoticeFormTitleBn(editingNotice.titleBn);
      setNoticeFormTitleEn(editingNotice.titleEn || '');
      setNoticeFormCategory(editingNotice.category);
      setNoticeFormPriority(editingNotice.priority);
      setNoticeFormBadgeBn(editingNotice.badgeBn);
      setNoticeFormTargetAudienceBn(editingNotice.targetAudienceBn);
      setNoticeFormDateBn(editingNotice.dateBn);
      setNoticeFormValidUntilBn(editingNotice.validUntilBn || '');
      setNoticeFormDescriptionBn(editingNotice.descriptionBn);
      setNoticeFormActionLink(editingNotice.actionLink || '');
      setNoticeFormActionTextBn(editingNotice.actionTextBn || '');
      setNoticeFormAttachmentName(editingNotice.attachmentName || '');
      setNoticeFormIsPinned(!!editingNotice.isPinned);
      setNoticeFormFacebookPostUrl(editingNotice.facebookPostUrl || '');
    } else {
      setNoticeFormTitleBn('');
      setNoticeFormTitleEn('');
      setNoticeFormCategory('admission');
      setNoticeFormPriority('high');
      setNoticeFormBadgeBn('ভর্তি বিজ্ঞপ্তি');
      setNoticeFormTargetAudienceBn('সকল অভিভাবক ও ভর্তিচ্ছু শিক্ষার্থী');
      setNoticeFormDateBn(currentDateBn);
      setNoticeFormValidUntilBn('');
      setNoticeFormDescriptionBn('');
      setNoticeFormActionLink('#apply');
      setNoticeFormActionTextBn('ভর্তি আবেদন করুন');
      setNoticeFormAttachmentName('');
      setNoticeFormIsPinned(false);
      setNoticeFormFacebookPostUrl('');
    }
  }, [isOpen, editingNotice, currentDateBn]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeFormTitleBn.trim() || !noticeFormDescriptionBn.trim()) return;

    const noticeData = {
      id: editingNotice?.id,
      titleBn: noticeFormTitleBn.trim(),
      titleEn: noticeFormTitleEn.trim() || undefined,
      category: noticeFormCategory,
      priority: noticeFormPriority,
      badgeBn: noticeFormBadgeBn.trim() || 'সাধারণ নোটিশ',
      targetAudienceBn:
        noticeFormTargetAudienceBn.trim() || 'সকল শিক্ষার্থী ও অভিভাবক',
      dateBn: noticeFormDateBn.trim() || currentDateBn,
      validUntilBn: noticeFormValidUntilBn.trim() || undefined,
      descriptionBn: noticeFormDescriptionBn.trim(),
      actionLink: noticeFormActionLink.trim() || undefined,
      actionTextBn: noticeFormActionTextBn.trim() || undefined,
      attachmentName: noticeFormAttachmentName.trim() || undefined,
      isPinned: noticeFormIsPinned,
      facebookPostUrl: noticeFormFacebookPostUrl.trim() || undefined,
    };

    onSave(noticeData, !!editingNotice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              {editingNotice ? 'নোটিশ সম্পাদনা' : 'নতুন প্রাতিষ্ঠানিক নোটিশ'}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {editingNotice
                ? 'বিজ্ঞপ্তি সম্পাদনা ও আপডেট'
                : 'পাবলিক নোটিশবোর্ডে নতুন বিজ্ঞপ্তি প্রকাশ'}
            </h3>
            <p className="text-xs text-slate-500">
              এই বিজ্ঞপ্তিটি তাৎক্ষণিকভাবে পাবলিক ওয়েবসাইট ও শীর্ষ লাইভ টিকারে দৃশ্যমান হবে।
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Notice Title (বাংলা) */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              বিজ্ঞপ্তির শিরোনাম (বাংলা) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={noticeFormTitleBn}
              onChange={(e) => setNoticeFormTitleBn(e.target.value)}
              placeholder="যেমন: অভ্যন্তরীণ ভর্তি মেলা ২০২৬ উপলক্ষে বিশেষ ছাড় ও অগ্রাধিকার তালিকা"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Notice Title (English) */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              বিজ্ঞপ্তির শিরোনাম (English - ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={noticeFormTitleEn}
              onChange={(e) => setNoticeFormTitleEn(e.target.value)}
              placeholder="e.g. Internal Admission Fair 2026 Special Discount & Priority List"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">
                বিজ্ঞপ্তির ক্যাটাগরি <span className="text-rose-500">*</span>
              </label>
              <select
                value={noticeFormCategory}
                onChange={(e) =>
                  setNoticeFormCategory(
                    e.target.value as 'admission' | 'urgent' | 'event' | 'exam' | 'holiday'
                  )
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="admission">🎓 ভর্তি ও ফি নোটিশ (Admission & Fees)</option>
                <option value="urgent">🚨 জরুরি বিজ্ঞপ্তি (Urgent Notice)</option>
                <option value="event">🎈 আপকামিং ইভেন্ট ও কার্যক্রম (Upcoming Events)</option>
                <option value="exam">📝 পরীক্ষার সময়সূচি (Exam Schedule)</option>
                <option value="holiday">🏖️ স্কুল ছুটির দিন (School Holidays)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">
                অগ্রাধিকার মাত্রা (Priority)
              </label>
              <select
                value={noticeFormPriority}
                onChange={(e) => setNoticeFormPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="urgent">জরুরি (Urgent - শীর্ষে লাল হাইলাইট)</option>
                <option value="high">উচ্চ অগ্রাধিকার (High Priority)</option>
                <option value="normal">সাধারণ বিজ্ঞপ্তি (Normal)</option>
              </select>
            </div>
          </div>

          {/* Badge & Target Audience Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">
                ব্যাজ লেবেল <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={noticeFormBadgeBn}
                onChange={(e) => setNoticeFormBadgeBn(e.target.value)}
                placeholder="যেমন: ভর্তি মেলা ২০২৬, পরীক্ষার নোটিশ, স্কুল বন্ধ"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">
                প্রাপক / টার্গেট অডিয়েন্স <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={noticeFormTargetAudienceBn}
                onChange={(e) => setNoticeFormTargetAudienceBn(e.target.value)}
                placeholder="যেমন: সকল শ্রেণি, প্লে ও নার্সারি অভিভাবক"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Date & Valid Until Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">
                প্রকাশের তারিখ (বাংলা) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={noticeFormDateBn}
                onChange={(e) => setNoticeFormDateBn(e.target.value)}
                placeholder="যেমন: ০৩ নভেম্বর ২০২৬"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">
                কার্যকর সময়সীমা / শেষ তারিখ (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={noticeFormValidUntilBn}
                onChange={(e) => setNoticeFormValidUntilBn(e.target.value)}
                placeholder="যেমন: ১৯ নভেম্বর ২০২৬"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Action Link & Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">
                অ্যাকশন লিংক (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={noticeFormActionLink}
                onChange={(e) => setNoticeFormActionLink(e.target.value)}
                placeholder="যেমন: #apply অথবা #curriculum"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">
                বাটন টেক্সট (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={noticeFormActionTextBn}
                onChange={(e) => setNoticeFormActionTextBn(e.target.value)}
                placeholder="যেমন: ভর্তি আবেদন করুন"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Attachment Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              সংযুক্ত ফাইলের নাম (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={noticeFormAttachmentName}
              onChange={(e) => setNoticeFormAttachmentName(e.target.value)}
              placeholder="যেমন: Admission_Documents.pdf অথবা Free_Class_Discount.pdf"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Pinned Checkbox */}
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              id="noticePinned"
              checked={noticeFormIsPinned}
              onChange={(e) => setNoticeFormIsPinned(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label
              htmlFor="noticePinned"
              className="text-slate-800 font-semibold cursor-pointer"
            >
              📌 শীর্ষ লাইভ স্ক্রলিং টিকারে এবং নোটিশবোর্ডের শীর্ষে পিন করে রাখুন
            </label>
          </div>

          {/* Specific Facebook Post URL */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 flex items-center justify-between">
              <span>অফিসিয়াল ফেসবুক পোস্ট লিংক (ঐচ্ছিক)</span>
              <span className="text-[10px] text-slate-400 font-normal">
                খালি রাখলে স্বয়ংক্রিয়ভাবে মূল ফেসবুক পেজে লিংক হবে
              </span>
            </label>
            <input
              type="url"
              value={noticeFormFacebookPostUrl}
              onChange={(e) => setNoticeFormFacebookPostUrl(e.target.value)}
              placeholder="যেমন: https://www.facebook.com/AnandaPathshalaKushtia/posts/..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
            />
          </div>

          {/* Notice Body / Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              বিজ্ঞপ্তির বিস্তারিত বিবরণ (বাংলা) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={noticeFormDescriptionBn}
              onChange={(e) => setNoticeFormDescriptionBn(e.target.value)}
              placeholder="বিজ্ঞপ্তির পূর্ণাঙ্গ বিবরণ লিখুন..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div>
              {editingNotice && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(editingNotice.id);
                    onClose();
                  }}
                  className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>মুছে ফেলুন</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {editingNotice ? 'আপডেট সম্পন্ন করুন' : 'বিজ্ঞপ্তি প্রকাশ করুন'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
