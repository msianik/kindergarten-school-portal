import React from 'react';
import { AcademicCalendarEvent } from '../../types/school';

interface PrintableAcademicCalendarDocumentProps {
  eventsToRender: AcademicCalendarEvent[];
  logoUrl?: string;
  isPreview?: boolean;
  holidayCount: number;
  examCount: number;
  meetingCount: number;
  currentDateBn: string;
}

export const PrintableAcademicCalendarDocument: React.FC<
  PrintableAcademicCalendarDocumentProps
> = ({
  eventsToRender,
  logoUrl,
  isPreview = false,
  holidayCount,
  examCount,
  meetingCount,
  currentDateBn,
}) => {
  const toBn = (n: number | string) =>
    n.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);

  return (
    <div
      className={`academic-print-document text-slate-900 bg-white ${
        isPreview ? 'p-6 sm:p-8 max-w-4xl mx-auto' : 'p-0 w-full'
      } space-y-4`}
    >
      {/* Official Institutional Letterhead */}
      <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={logoUrl || '/assets/fb/logo.jpg'}
            alt="আনন্দ পাঠশালা মনোগ্রাম"
            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-700 bg-white p-0.5 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-950 tracking-tight leading-none">
                আনন্দ পাঠশালা
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                স্থাপিত ২০১৬
              </span>
            </div>
            <p className="text-xs font-bold text-emerald-800 tracking-wide uppercase mt-0.5">
              Ananda Pathshala Kindergarten &amp; Junior School
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              একটি আধুনিক শিশুবান্ধব আনন্দময় বিদ্যাপীঠ (হাতেখড়ি, প্লে, নার্সারি, কেজি ও জুনিয়র শাখা)
            </p>
            <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
              কোর্টপাড়া, কুষ্টিয়া সদর, কুষ্টিয়া · ফোন: ০১৭১১-৯৮৭৬৫৪ / ০১৭০০-১২৩৪৫৬ · ইমেইল: info@anandapathshala.edu.bd
            </p>
          </div>
        </div>

        {/* Right: Institutional Session & Reference */}
        <div className="text-right shrink-0">
          <div className="inline-block border border-slate-800 px-3 py-1.5 rounded-lg text-center bg-slate-50">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">
              শিক্ষাবর্ষ সেশন
            </span>
            <span className="text-sm font-black text-slate-900 font-mono">
              ২০২৬–২০২৭
            </span>
          </div>
          <p className="text-[8.5px] text-slate-500 mt-1 font-mono">
            স্মারক: AP/CAL-2026/04
          </p>
          <span className="inline-block mt-0.5 text-[8.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            অফিশিয়াল কপি
          </span>
        </div>
      </div>

      {/* Document Title Banner */}
      <div className="text-center py-2 bg-slate-100/90 rounded-lg border border-slate-300">
        <h2 className="text-base font-extrabold text-slate-900 tracking-wide">
          বার্ষিক একাডেমিক ক্যালেন্ডার ও ইভেন্ট নির্দেশিকা — শিক্ষাবর্ষ ২০২৬-২০২৭
        </h2>
        <p className="text-[10.5px] text-slate-600 font-medium">
          Official Academic Calendar, Examination Schedules, School Holidays &amp; Parent Meetings
        </p>
      </div>

      {/* Metadata & Executive Summary Strip */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="border border-slate-300 rounded-lg p-2 bg-slate-50">
          <span className="text-[9.5px] text-slate-500 font-medium block">মুদ্রণের তারিখ</span>
          <span className="font-bold text-slate-900">{currentDateBn}</span>
        </div>
        <div className="border border-rose-200 rounded-lg p-2 bg-rose-50/70">
          <span className="text-[9.5px] text-rose-700 font-bold block">স্কুল ছুটির দিন</span>
          <span className="font-black text-rose-950">{toBn(holidayCount)} টি (ক্লাস বন্ধ)</span>
        </div>
        <div className="border border-indigo-200 rounded-lg p-2 bg-indigo-50/70">
          <span className="text-[9.5px] text-indigo-700 font-bold block">পরীক্ষা ও মূল্যায়ন</span>
          <span className="font-black text-indigo-950">{toBn(examCount)} টি পর্ব</span>
        </div>
        <div className="border border-emerald-200 rounded-lg p-2 bg-emerald-50/70">
          <span className="text-[9.5px] text-emerald-700 font-bold block">অভিভাবক সমাবেশ</span>
          <span className="font-black text-emerald-950">{toBn(meetingCount)} টি (PTM)</span>
        </div>
      </div>

      {/* Official Summary Table */}
      <div className="border border-slate-300 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-extrabold border-b border-slate-300">
              <th className="py-2 px-2 border-r border-slate-300 w-8 text-center">ক্র.</th>
              <th className="py-2 px-2.5 border-r border-slate-300 w-36">তারিখ ও সময়</th>
              <th className="py-2 px-3 border-r border-slate-300">ইভেন্টের শিরোনাম ও বিবরণ</th>
              <th className="py-2 px-2.5 border-r border-slate-300 w-24 text-center">ধরন</th>
              <th className="py-2 px-2.5 border-r border-slate-300 w-28">প্রযোজ্য শ্রেণি</th>
              <th className="py-2 px-2.5 border-r border-slate-300 w-28">স্থান / ভেন্যু</th>
              <th className="py-2 px-2 text-center w-20">স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {eventsToRender.map((event, idx) => {
              const isHoliday = event.category === 'holiday';
              const isExam = event.category === 'exam';

              return (
                <tr
                  key={event.id}
                  className={`break-inside-avoid print-avoid-break ${
                    idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                  }`}
                >
                  <td className="py-2 px-1 text-center font-bold text-slate-600 border-r border-slate-200">
                    {toBn(idx + 1)}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200 font-semibold text-slate-900">
                    <div>
                      {event.startDate} {event.endDate ? `– ${event.endDate}` : ''}
                    </div>
                    {event.timeBn && (
                      <div className="text-[9px] text-slate-500 font-normal">{event.timeBn}</div>
                    )}
                    {event.daysCountBn && (
                      <span className="text-[8.5px] px-1 py-0.2 bg-slate-100 rounded text-slate-600 font-medium">
                        {event.daysCountBn}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200">
                    <div className="font-bold text-slate-950 text-[10.5px]">{event.titleBn}</div>
                    <div className="text-[9px] text-slate-400 font-mono">{event.titleEn}</div>
                    <p className="text-[9px] text-slate-600 leading-tight mt-0.5">
                      {event.descriptionBn}
                    </p>
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[8.5px] font-bold ${
                        isHoliday
                          ? 'bg-rose-100 text-rose-900 border border-rose-200'
                          : isExam
                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {isHoliday ? 'স্কুল ছুটি' : isExam ? 'পরীক্ষা' : 'অভিভাবক সমাবেশ'}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200 text-[9px] font-medium text-slate-800">
                    {event.targetClassesBn}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200 text-[9px] text-slate-700">
                    {event.venueBn || 'আনন্দ পাঠশালা ক্যাম্পাস'}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {event.statusBadgeBn}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Institutional Notice & General Instructions */}
      <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-[9.5px] space-y-1 text-slate-700 break-inside-avoid print-avoid-break">
        <div className="font-bold text-slate-900 text-[10px]">
          📌 অভিভাবক ও শিক্ষার্থীদের জন্য সাধারণ নিয়ামাবলী ও জরুরি নোটিশ:
        </div>
        <ul className="list-disc list-inside space-y-0.5 pl-1 leading-snug">
          <li>
            সরকারি প্রজ্ঞাপন বা বিশেষ জরুরি কারণে কোনো ছুটির দিন পরিবর্তিত হলে বিদ্যালয়ের নোটিশ বোর্ড ও এসএমএসের মাধ্যমে অগ্রিম অবহিত করা হবে।
          </li>
          <li>
            অভিভাবক সমাবেশ (PTM) এ প্রতিটি শিক্ষার্থীর পিতা/মাতা অথবা অনুমোদিত অভিভাবকের উপস্থিতি বাধ্যতামূলক।
          </li>
          <li>
            শিখন মূল্যায়ন ও পরীক্ষার দিনে শিক্ষার্থীদের নির্ধারিত সময়ের অন্তত ১৫ মিনিট পূর্বে প্রবেশপত্র ও প্রয়োজনীয় শিক্ষা উপকরণসহ শ্রেণিকক্ষে উপস্থিত হতে হবে।
          </li>
          <li>
            ছুটির দিনগুলোতে বিদ্যালয়ের ডিজিটাল ক্লাসরুম ডায়েরি ও রিভিশন টাস্ক নিয়মিত অনুসরণ করতে অনুরোধ করা হচ্ছে।
          </li>
          <li>
            ছুটির পর শিক্ষার্থীদের নিরাপদে হস্তান্তরের জন্য বিদ্যালয়ের ডিজিটাল গেট-পাস ভেরিফিকেশন ব্যবস্থা কার্যকর থাকবে।
          </li>
        </ul>
      </div>

      {/* Official Signatures, Seal & Authority Approval */}
      <div className="pt-4 border-t border-slate-300 flex items-end justify-between text-center break-inside-avoid print-avoid-break text-[10px]">
        {/* Coordinator */}
        <div className="space-y-1">
          <div className="h-9 flex items-end justify-center font-serif italic text-slate-400 text-xs">
            (স্বাক্ষরিত)
          </div>
          <div className="border-t border-slate-400 w-36 mx-auto pt-1">
            <p className="font-bold text-slate-900">একাডেমিক কোঅর্ডিনেটর</p>
            <p className="text-[9px] text-slate-500">পরীক্ষা ও ইভেন্ট সেল</p>
          </div>
        </div>

        {/* Official Seal Emblem */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-700 p-1 flex flex-col items-center justify-center text-center bg-white shadow-2xs">
            <span className="text-[7.5px] font-extrabold uppercase text-emerald-900 tracking-tighter">
              আনন্দ পাঠশালা
            </span>
            <span className="text-[9px] font-black text-amber-700 my-0.2">★ সিল মহর ★</span>
            <span className="text-[7px] text-slate-600 font-mono">কুষ্টিয়া · ২০১৬</span>
            <span className="text-[6.5px] text-emerald-800 font-bold">অনুমোদিত</span>
          </div>
          <span className="text-[8px] text-slate-400 mt-1">অফিসিয়াল সিল</span>
        </div>

        {/* Head Teacher Fatema Akter */}
        <div className="space-y-1">
          <div className="h-9 flex items-end justify-center font-serif italic text-slate-600 text-xs font-bold">
            ফাতেমা আক্তার
          </div>
          <div className="border-t border-slate-400 w-36 mx-auto pt-1">
            <p className="font-bold text-slate-900">ফাতেমা আক্তার</p>
            <p className="text-[9px] text-slate-500">প্রধান শিক্ষক, আনন্দ পাঠশালা</p>
          </div>
        </div>

        {/* Principal Shafi Abdullah */}
        <div className="space-y-1">
          <div className="h-9 flex items-end justify-center font-serif italic text-emerald-800 text-xs font-bold">
            শাফী আব্দুল্লাহ
          </div>
          <div className="border-t border-slate-400 w-36 mx-auto pt-1">
            <p className="font-bold text-slate-900">শাফী আব্দুল্লাহ</p>
            <p className="text-[9px] text-slate-500">অধ্যক্ষ ও প্রতিষ্ঠাতা পরিচালক</p>
          </div>
        </div>
      </div>

      {/* Footer System Verification Note */}
      <div className="pt-2 text-center text-[8.5px] text-slate-400 border-t border-slate-200 flex items-center justify-between">
        <span>আনন্দ পাঠশালা স্কুল ম্যানেজমেন্ট সিস্টেম কর্তৃক স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত অফিসিয়াল কপি।</span>
        <span>কপিরাইট © ২০২৬ আনন্দ পাঠশালা, কুষ্টিয়া। সর্বস্বত্ব সংরক্ষিত।</span>
      </div>
    </div>
  );
};
