import { StudentMonthlyAttendanceSummary, MonthlyAttendanceReportMeta } from '../types/school';

export interface SchoolPrintProfile {
  nameBn?: string;
  campusBn?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
}

const DEFAULT_SCHOOL_INFO: SchoolPrintProfile = {
  nameBn: 'আনন্দ পাঠশালা — কিন্ডারগার্টেন ও প্লে স্কুল',
  campusBn: '১৯/২২, পূর্ণ চন্দ্র লাহিড়ী লেন (গোশালা), কোর্টপাড়া, কুষ্টিয়া',
  phone: '০১৯১৪-০৫৭৫১১',
  email: 'anandapathshala.bd@gmail.com',
  website: 'facebook.com/AnandaPathshalaKushtia',
  logoUrl: '/assets/fb/logo.jpg',
};

/**
 * Builds a pristine, self-contained HTML document for printing and saving as PDF.
 * Formatted specifically for A4 landscape school record books with official typography.
 */
export function generateAttendancePdfHtml(
  summaries: StudentMonthlyAttendanceSummary[],
  meta: MonthlyAttendanceReportMeta,
  classScopeNameBn: string = 'সকল শ্রেণি',
  schoolInfo: SchoolPrintProfile = DEFAULT_SCHOOL_INFO
): string {
  const info = { ...DEFAULT_SCHOOL_INFO, ...schoolInfo };

  const rowsHtml = summaries
    .map((s, index) => {
      const consistencyBadge =
        s.consistencyTier === 'excellent'
          ? '<span style="background-color: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; padding: 2px 8px; border-radius: 9999px; font-weight: bold; font-size: 10px;">🌟 অসাধারণ</span>'
          : s.consistencyTier === 'regular'
          ? '<span style="background-color: #ccfbf1; color: #115e59; border: 1px solid #5eead4; padding: 2px 8px; border-radius: 9999px; font-weight: bold; font-size: 10px;">✅ নিয়মিত</span>'
          : '<span style="background-color: #ffe4e6; color: #9f1239; border: 1px solid #fca5a5; padding: 2px 8px; border-radius: 9999px; font-weight: bold; font-size: 10px;">⚠️ নজরদারি</span>';

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px; ${index % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
          <td style="padding: 6px 8px; text-align: center; font-weight: bold; font-family: monospace;">${index + 1}</td>
          <td style="padding: 6px 8px; text-align: center; font-weight: bold; font-family: monospace; color: #0f172a;">${s.rollNo}</td>
          <td style="padding: 6px 8px;">
            <div style="font-weight: bold; color: #0f172a;">${s.nameBn}</div>
            <div style="font-size: 9.5px; color: #64748b;">${s.nameEn}</div>
          </td>
          <td style="padding: 6px 8px; text-align: center; font-weight: 600;">${s.className} (${s.section})</td>
          <td style="padding: 6px 8px; text-align: center; font-weight: 600; font-family: monospace;">${s.totalWorkingDays}</td>
          <td style="padding: 6px 8px; text-align: center; font-weight: bold; font-family: monospace; color: #059669; background-color: #f0fdf4;">${s.presentDays}</td>
          <td style="padding: 6px 8px; text-align: center; font-weight: bold; font-family: monospace; color: #d97706; background-color: #fffbeb;">${s.lateDays}</td>
          <td style="padding: 6px 8px; text-align: center; font-weight: bold; font-family: monospace; color: #e11d48; background-color: #fff1f2;">${s.absentDays}</td>
          <td style="padding: 6px 8px; text-align: center;">
            <div style="font-weight: 800; font-family: monospace; font-size: 12px; color: ${s.attendanceRate >= 92 ? '#059669' : s.attendanceRate >= 80 ? '#0d9488' : '#e11d48'};">
              ${s.attendanceRate}%
            </div>
          </td>
          <td style="padding: 6px 8px; text-align: center;">${consistencyBadge}</td>
          <td style="padding: 6px 8px; font-size: 10px; color: #334155;">
            <div><strong>${s.guardianNameBn}</strong></div>
            <div style="font-family: monospace; color: #64748b; font-size: 9.5px;">${s.guardianPhone}</div>
          </td>
          <td style="padding: 6px 8px; font-size: 9.5px; color: #475569; max-width: 140px;">${s.remarksBn}</td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>মাসিক হাজিরা মূল্যায়ন রিপোর্ট — ${meta.monthNameBn} — আনন্দ পাঠশালা</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm 12mm 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 12px;
      font-size: 11px;
      line-height: 1.4;
    }
    .print-header {
      border-bottom: 2px solid #0d9488;
      padding-bottom: 10px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-box {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      border: 2px solid #f59e0b;
      overflow: hidden;
      flex-shrink: 0;
      background: #ffffff;
    }
    .logo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .school-title {
      font-size: 19px;
      font-weight: 900;
      color: #064e3b;
      margin: 0 0 2px 0;
      letter-spacing: -0.3px;
    }
    .school-subtitle {
      font-size: 11px;
      color: #0d9488;
      font-weight: 700;
      margin: 0 0 3px 0;
    }
    .school-contact {
      font-size: 9.5px;
      color: #475569;
      margin: 0;
    }
    .doc-badge {
      text-align: right;
    }
    .badge-pill {
      background: #0f766e;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 9999px;
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-date {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 4px;
      font-weight: 600;
    }
    .title-banner {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 4px solid #059669;
      padding: 8px 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title-banner h2 {
      margin: 0;
      font-size: 13.5px;
      font-weight: 800;
      color: #064e3b;
    }
    .title-banner .meta-info {
      font-size: 10.5px;
      font-weight: 700;
      color: #047857;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .stat-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px 8px;
      background: #f8fafc;
      text-align: center;
    }
    .stat-card.excellent {
      background: #ecfdf5;
      border-color: #a7f3d0;
    }
    .stat-card.regular {
      background: #f0fdfa;
      border-color: #99f6e4;
    }
    .stat-card.attention {
      background: #fff1f2;
      border-color: #fecdd3;
    }
    .stat-label {
      font-size: 9px;
      color: #64748b;
      font-weight: 700;
      display: block;
      margin-bottom: 2px;
    }
    .stat-val {
      font-size: 13px;
      font-weight: 900;
      color: #0f172a;
      font-family: monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
      margin-bottom: 16px;
    }
    thead th {
      background: #0f172a;
      color: #ffffff;
      padding: 7px 6px;
      font-size: 10px;
      font-weight: 800;
      border: 1px solid #334155;
      text-align: center;
    }
    .sign-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 24px;
      padding-top: 10px;
      page-break-inside: avoid;
    }
    .sign-box {
      width: 200px;
      text-align: center;
      border-top: 1.5px dashed #475569;
      padding-top: 6px;
    }
    .sign-title {
      font-size: 10.5px;
      font-weight: 800;
      color: #1e293b;
    }
    .sign-sub {
      font-size: 9px;
      color: #64748b;
    }
    .seal-box {
      width: 110px;
      height: 60px;
      border: 1.5px dashed #0d9488;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #0d9488;
      font-size: 8.5px;
      font-weight: bold;
      transform: rotate(-5deg);
      background: rgba(13, 148, 136, 0.04);
    }
    .no-print-bar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 10px 16px;
      margin: -12px -12px 14px -12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #f59e0b;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 100;
    }
    .print-btn {
      background: #059669;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 800;
      cursor: pointer;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .print-btn:hover {
      background: #047857;
    }
    .close-btn {
      background: #334155;
      color: #ffffff;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 11px;
    }
    .close-btn:hover {
      background: #475569;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        padding: 0;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <!-- Floating action bar visible only on screen -->
  <div class="no-print-bar">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 16px;">📄</span>
      <span style="font-weight: bold; font-size: 13px;">আনন্দ পাঠশালা — মাসিক হাজিরা অফিসিয়াল PDF রেকর্ড প্রিভিউ</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="print-btn" onclick="window.print()">
        🖨️ প্রিন্ট করুন বা PDF হিসেবে সংরক্ষণ করুন (Save as PDF)
      </button>
      <button class="close-btn" onclick="window.close()">
        ✕ বন্ধ করুন
      </button>
    </div>
  </div>

  <!-- Letterhead Header -->
  <div class="print-header">
    <div class="brand-section">
      <div class="logo-box">
        <img src="${info.logoUrl || '/assets/fb/logo.jpg'}" alt="আনন্দ পাঠশালা লোগো" onerror="this.style.display='none'" />
      </div>
      <div>
        <h1 class="school-title">${info.nameBn}</h1>
        <div class="school-subtitle">প্রাক-প্রাথমিক ও কিন্ডারগার্টেন স্কুল · কুষ্টিয়া ক্যাম্পাস</div>
        <p class="school-contact">${info.campusBn} | হেল্পলাইন: ${info.phone} | ${info.email}</p>
      </div>
    </div>
    <div class="doc-badge">
      <div class="badge-pill">অফিশিয়াল স্কুল রেকর্ড (School Record)</div>
      <div class="doc-date">প্রস্তুতের তারিখ: ${meta.generatedAtBn}</div>
      <div class="doc-date" style="font-family: monospace;">রিপোর্ট কোড: AP-ATT-${meta.monthKey}</div>
    </div>
  </div>

  <!-- Document Title & Scope Banner -->
  <div class="title-banner">
    <div>
      <h2>মাসিক শিক্ষার্থী উপস্থিতি ও ধারাবাহিকতা মূল্যায়ন বিবরণী</h2>
      <div style="font-size: 10px; color: #065f46; margin-top: 1px;">Monthly Attendance & Student Consistency Record</div>
    </div>
    <div class="meta-info">
      শিক্ষাবর্ষ: ২০২৬ · মাস: ${meta.monthNameBn} (${meta.monthNameEn} ${meta.year}) · শ্রেণি: ${classScopeNameBn}
    </div>
  </div>

  <!-- Key Metrics Summary Grid -->
  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-label">মোট কার্যদিবস</span>
      <span class="stat-val">${meta.totalWorkingDays} দিন</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">মোট শিক্ষার্থী</span>
      <span class="stat-val">${meta.totalStudents} জন</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">গড় উপস্থিতি হার</span>
      <span class="stat-val" style="color: #0d9488;">${meta.avgAttendanceRate}%</span>
    </div>
    <div class="stat-card excellent">
      <span class="stat-label" style="color: #065f46;">অসাধারণ (≥৯২%)</span>
      <span class="stat-val" style="color: #047857;">${meta.excellentCount} জন</span>
    </div>
    <div class="stat-card regular">
      <span class="stat-label" style="color: #115e59;">নিয়মিত (৮০-৯১%)</span>
      <span class="stat-val" style="color: #0f766e;">${meta.regularCount} জন</span>
    </div>
    <div class="stat-card attention">
      <span class="stat-label" style="color: #9f1239;">নজরদারি (&lt;৮০%)</span>
      <span class="stat-val" style="color: #be123c;">${meta.needsAttentionCount} জন</span>
    </div>
  </div>

  <!-- Detailed Attendance Table -->
  <table>
    <thead>
      <tr>
        <th style="width: 35px;">ক্রমিক</th>
        <th style="width: 45px;">রোল</th>
        <th style="width: 140px; text-align: left;">শিক্ষার্থীর পূর্ণ নাম</th>
        <th style="width: 80px;">শ্রেণি ও শাখা</th>
        <th style="width: 55px;">কার্যদিবস</th>
        <th style="width: 50px;">উপস্থিত</th>
        <th style="width: 45px;">বিলম্ব</th>
        <th style="width: 50px;">অনুপস্থিত</th>
        <th style="width: 65px;">শতকরা (%)</th>
        <th style="width: 85px;">ধারাবাহিকতা</th>
        <th style="width: 130px; text-align: left;">অভিভাবক ও যোগাযোগ</th>
        <th style="text-align: left;">শিক্ষকের মূল্যায়ন ও পর্যবেক্ষণ</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <!-- Signatures & Official Stamp -->
  <div class="sign-section">
    <div class="sign-box">
      <div style="height: 35px;"></div>
      <div class="sign-title">শ্রেণি শিক্ষক / শিক্ষিকা</div>
      <div class="sign-sub">আনন্দ পাঠশালা, কুষ্টিয়া</div>
    </div>

    <div class="seal-box">
      <div>
        আনন্দ পাঠশালা<br />
        <span style="font-size: 7.5px;">প্রাতিষ্ঠানিক রেকর্ড শাখা</span><br />
        ★ সিলমোহর ★
      </div>
    </div>

    <div class="sign-box">
      <div style="height: 35px;"></div>
      <div class="sign-title">শাফী আব্দুল্লাহ</div>
      <div class="sign-sub">অধ্যক্ষ / প্রিন্সিপাল, আনন্দ পাঠশালা</div>
    </div>
  </div>

  <div style="margin-top: 14px; font-size: 8.5px; color: #94a3b8; text-align: center; border-top: 1px dotted #cbd5e1; padding-top: 4px;">
    এটি আনন্দ পাঠশালা কুষ্টিয়া অটোমেটেড একাডেমি ম্যানেজমেন্ট সিস্টেম দ্বারা প্রস্তুতকৃত একটি অফিশিয়াল প্রাতিষ্ঠানিক রেকর্ড বিবরণী।
  </div>

  <script>
    // Automatically open print dialog when opened in new tab/window
    window.onload = function() {
      // Small timeout allows browser to finish CSS layout and fonts
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;
}

/**
 * Triggers the PDF export by writing the styled report to an isolated window or iframe,
 * opening the browser's Print-to-PDF dialog with crisp vector Bengali typography.
 */
export function exportMonthlyAttendancePdf(
  summaries: StudentMonthlyAttendanceSummary[],
  meta: MonthlyAttendanceReportMeta,
  classScopeNameBn: string = 'সকল শ্রেণি',
  schoolInfo?: SchoolPrintProfile
): boolean {
  const html = generateAttendancePdfHtml(summaries, meta, classScopeNameBn, schoolInfo);

  try {
    const printWindow = window.open('', '_blank', 'width=1100,height=850,resizable=yes,scrollbars=yes');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      return true;
    }
  } catch (e) {
    console.warn('Popup blocked, attempting iframe fallback for PDF export', e);
  }

  // Fallback: hidden iframe print for popup-blocked browsers
  try {
    let iframe = document.getElementById('ananda-pdf-print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'ananda-pdf-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 400);
      return true;
    }
  } catch (err) {
    console.error('Failed to trigger PDF print via iframe', err);
  }

  return false;
}
