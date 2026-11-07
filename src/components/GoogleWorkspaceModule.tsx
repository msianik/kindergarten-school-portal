import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Student,
  ActivityPost,
  FeeInvoice,
  AttendanceRecord,
  FacebookGalleryItem,
} from '../types/school';
import {
  googleSignIn,
  logout,
  getAccessToken,
  initAuth,
} from '../lib/firebase';
import {
  Cloud,
  FileSpreadsheet,
  Calendar,
  FileText,
  FolderOpen,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Plus,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Sparkles,
  UploadCloud,
} from 'lucide-react';

declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

interface GoogleWorkspaceModuleProps {
  students: Student[];
  activityPosts: ActivityPost[];
  invoices: FeeInvoice[];
  attendanceRecords: AttendanceRecord[];
  onAddGalleryPhoto: (item: FacebookGalleryItem) => void;
}

interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  modifiedTime?: string;
}

interface CalendarEventItem {
  id: string;
  summary: string;
  start?: { dateTime?: string; date?: string };
  htmlLink?: string;
}

interface ConfirmDialogState {
  titleBn: string;
  descriptionBn: string;
  actionLabelBn: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void>;
}

export const GoogleWorkspaceModule: React.FC<GoogleWorkspaceModuleProps> = ({
  students,
  activityPosts,
  invoices,
  attendanceRecords,
  onAddGalleryPhoto,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    linkUrl?: string;
    linkLabel?: string;
  } | null>(null);

  // Workspace data states
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [pickedFile, setPickedFile] = useState<{ name: string; url?: string; id: string } | null>(null);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [isBusyAction, setIsBusyAction] = useState(false);

  // Calendar event creation form
  const [newEventTitle, setNewEventTitle] = useState(
    'আনন্দ পাঠশালা কুষ্টিয়া — অভিভাবক ও শিক্ষক মতবিনিময় সভা'
  );
  const [newEventDate, setNewEventDate] = useState('2026-11-15');

  // Confirmation modal state (Mandatory for all mutating/destructive operations)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  useEffect(() => {
    const unsub = initAuth(
      (u, accessToken) => {
        setUser(u);
        if (accessToken) {
          setToken(accessToken);
          setNeedsAuth(false);
        } else {
          setNeedsAuth(true);
        }
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (token) {
      fetchDriveFiles(token);
      fetchCalendarEvents(token);
    }
  }, [token]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setStatusBanner(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        setStatusBanner({
          type: 'success',
          message: `স্বাগতম ${result.user.displayName || result.user.email}! আপনার Google Workspace ও Firebase অ্যাকাউন্ট সফলভাবে সংযুক্ত হয়েছে।`,
        });
      }
    } catch (error: any) {
      setStatusBanner({
        type: 'error',
        message: 'Google Sign-In সম্পন্ন হয়নি। অনুগ্রহ করে পপ-আপ ব্লকার চেক করে আবার চেষ্টা করুন।',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
    setDriveFiles([]);
    setCalendarEvents([]);
    setStatusBanner({
      type: 'info',
      message: 'আপনি সফলভাবে সাইন-আউট করেছেন।',
    });
  };

  const requireValidToken = async (): Promise<string | null> => {
    const t = (await getAccessToken()) || token;
    if (!t) {
      setNeedsAuth(true);
      setStatusBanner({
        type: 'info',
        message: 'এই ফিচারটি ব্যবহার করতে অনুগ্রহ করে "Sign in with Google" বাটনে ক্লিক করুন।',
      });
      return null;
    }
    return t;
  };

  // 1. Google Drive: List Files
  const fetchDriveFiles = async (accessToken?: string) => {
    const t = accessToken || (await requireValidToken());
    if (!t) return;
    setIsLoadingDrive(true);
    try {
      const res = await fetch(
        'https://www.googleapis.com/drive/v3/files?pageSize=8&fields=files(id,name,mimeType,webViewLink,modifiedTime)&orderBy=modifiedTime desc',
        {
          headers: { Authorization: `Bearer ${t}` },
        }
      );
      if (res.status === 401) {
        setNeedsAuth(true);
        return;
      }
      const data = await res.json();
      if (data.files) {
        setDriveFiles(data.files);
      }
    } catch (err) {
      console.error('Drive fetch error:', err);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // 2. Google Picker: Open official Picker widget
  const handleOpenGooglePicker = async () => {
    const t = await requireValidToken();
    if (!t) return;

    const launchPicker = () => {
      const pickerOrigin =
        window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
          ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
          : window.location.origin;

      const pickerCallback = (data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const file = data.docs[0];
          setPickedFile({
            id: file.id,
            name: file.name,
            url: file.url,
          });
          setStatusBanner({
            type: 'success',
            message: `Google Picker থেকে ফাইল নির্বাচন করা হয়েছে: "${file.name}"`,
            linkUrl: file.url,
            linkLabel: 'ফাইলটি খুলুন',
          });
        }
      };

      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
        .setOAuthToken(t)
        .setCallback(pickerCallback)
        .setOrigin(pickerOrigin)
        .build();
      picker.setVisible(true);
    };

    if (window.google?.picker) {
      launchPicker();
      return;
    }

    // Dynamically load Google API loader for Picker if not yet loaded
    const existingScript = document.getElementById('google-api-picker-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-api-picker-script';
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('picker', { callback: launchPicker });
      };
      document.body.appendChild(script);
    } else if (window.gapi) {
      window.gapi.load('picker', { callback: launchPicker });
    }
  };

  // 3. Google Drive: Delete File (with MANDATORY User Confirmation Modal)
  const requestDeleteDriveFile = (file: DriveFileItem) => {
    setConfirmDialog({
      titleBn: 'Google Drive থেকে ফাইল মুছে ফেলতে চান?',
      descriptionBn: `আপনি কি নিশ্চিত যে আপনি "${file.name}" ফাইলটি আপনার Google Drive থেকে স্থায়ীভাবে মুছে ফেলতে চান? এই কাজটি বাতিল করা যাবে না।`,
      actionLabelBn: 'হ্যাঁ, ফাইল ডিলিট করুন',
      isDestructive: true,
      onConfirm: async () => {
        const t = await requireValidToken();
        if (!t) return;
        setIsBusyAction(true);
        try {
          const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${t}` },
          });
          if (res.ok || res.status === 204) {
            setDriveFiles((prev) => prev.filter((f) => f.id !== file.id));
            setStatusBanner({
              type: 'success',
              message: `"${file.name}" সফলভাবে Google Drive থেকে মুছে ফেলা হয়েছে।`,
            });
          }
        } finally {
          setIsBusyAction(false);
        }
      },
    });
  };

  // 4. Google Sheets: Export School Report (with MANDATORY User Confirmation Modal)
  const requestExportToGoogleSheets = () => {
    setConfirmDialog({
      titleBn: 'Google Sheets-এ স্কুলের রিপোর্ট এক্সপোর্ট করবেন?',
      descriptionBn: `আনন্দ পাঠশালার ${students.length} জন শিক্ষার্থীর তালিকা, হাজিরা এবং বিকাশ ফি কালেকশন ডাটা দিয়ে আপনার Google Sheets-এ একটি নতুন স্প্রেডশিট তৈরি ও আপডেট করা হবে।`,
      actionLabelBn: 'হ্যাঁ, স্প্রেডশিট তৈরি করুন',
      onConfirm: async () => {
        const t = await requireValidToken();
        if (!t) return;
        setIsBusyAction(true);
        try {
          // Step 1: Create spreadsheet
          const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${t}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              properties: {
                title: `আনন্দ পাঠশালা কুষ্টিয়া — স্টুডেন্ট ও ফি রিপোর্ট (${new Date().toLocaleDateString('bn-BD')})`,
              },
            }),
          });
          const createdSheet = await createRes.json();
          const spreadsheetId = createdSheet.spreadsheetId;
          const firstSheetTitle =
            createdSheet.sheets?.[0]?.properties?.title || 'Sheet1';

          // Step 2: Populate values into the dynamically discovered first tab name
          const rows = [
            ['রোল', 'শিক্ষার্থীর নাম (বাংলা)', 'Name (English)', 'শ্রেণি', 'শাখা', 'অভিভাবকের ফোন', 'বর্তমান স্ট্যাটাস'],
            ...students.map((s) => [
              s.rollNo,
              s.nameBn,
              s.nameEn,
              s.className,
              s.section,
              s.emergencyPhone,
              s.currentStatus === 'picked_up' ? 'প্রস্থান সম্পন্ন' : 'শ্রেণিকক্ষে উপস্থিত',
            ]),
            [],
            ['ইনভয়েস আইডি', 'শিক্ষার্থী', 'মাস', 'মোট ফি (টাকা)', 'স্ট্যাটাস', 'পেমেন্ট মাধ্যম'],
            ...invoices.map((inv) => [
              inv.id,
              inv.studentNameBn,
              inv.monthBn,
              String(inv.totalAmount),
              inv.status === 'paid' ? 'পরিশোধিত' : 'বকেয়া',
              inv.paymentMethod || 'N/A',
            ]),
          ];

          await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
              `${firstSheetTitle}!A1`
            )}?valueInputOption=USER_ENTERED`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${t}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ values: rows }),
            }
          );

          setStatusBanner({
            type: 'success',
            message: 'Google Sheets-এ স্টুডেন্ট, হাজিরা ও ফি রিপোর্ট সফলভাবে তৈরি হয়েছে!',
            linkUrl: createdSheet.spreadsheetUrl,
            linkLabel: 'Google Sheet-টি খুলুন',
          });
          fetchDriveFiles(t);
        } catch (err) {
          setStatusBanner({
            type: 'error',
            message: 'Google Sheets-এ এক্সপোর্ট করতে সমস্যা হয়েছে।',
          });
        } finally {
          setIsBusyAction(false);
        }
      },
    });
  };

  // 5. Google Docs: Create Daily Diary & Progress Summary Doc (with MANDATORY User Confirmation Modal)
  const requestCreateGoogleDoc = () => {
    setConfirmDialog({
      titleBn: 'Google Docs-এ স্কুল ডায়রি ও প্রগ্রেস সামারি তৈরি করবেন?',
      descriptionBn: `আপনার Google Docs-এ "আনন্দ পাঠশালা কুষ্টিয়া — ডিজিটাল ডায়রি ও একাডেমিক প্রতিবেদন" শিরোনামে একটি নতুন ডকুমেন্ট তৈরি এবং তথ্য সংযোজন করা হবে।`,
      actionLabelBn: 'হ্যাঁ, Google Doc তৈরি করুন',
      onConfirm: async () => {
        const t = await requireValidToken();
        if (!t) return;
        setIsBusyAction(true);
        try {
          const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${t}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: `আনন্দ পাঠশালা কুষ্টিয়া — ডিজিটাল ডায়রি প্রতিবেদন (${new Date().toLocaleDateString('bn-BD')})`,
            }),
          });
          const docData = await createRes.json();
          const documentId = docData.documentId;

          const summaryText = [
            'আনন্দ পাঠশালা (Ananda Pathshala) — গোশালা, কুষ্টিয়া\n',
            'স্লোগান: শিক্ষায় আছে আনন্দ, আনন্দে গড়বো দিগন্ত\n',
            'ঠিকানা: ২২, পূর্ণ চন্দ্র লাহিড়ী লেন, গোশালা, কোর্টপাড়া, কুষ্টিয়া | ফোন: ০১৯১৪-০৫৭৫১১\n\n',
            `মোট শিক্ষার্থী: ${students.length} জন | আজকের হাজিরা রেকর্ড: ${attendanceRecords.length} জন\n\n`,
            '--- আজকের ডিজিটাল ডায়রি ও ক্লাসরুম অ্যাক্টিভিটি ---\n',
            ...activityPosts.map(
              (p, idx) =>
                `${idx + 1}. [${p.className}] ${p.titleBn} (${p.dateStr})\n   শিক্ষক: ${p.teacherNameBn}\n   বিবরণ: ${p.descriptionBn}\n\n`
            ),
          ].join('');

          await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${t}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requests: [
                {
                  insertText: {
                    location: { index: 1 },
                    text: summaryText,
                  },
                },
              ],
            }),
          });

          const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
          setStatusBanner({
            type: 'success',
            message: 'Google Docs-এ স্কুলের ডায়রি ও প্রগ্রেস প্রতিবেদন সফলভাবে তৈরি হয়েছে!',
            linkUrl: docUrl,
            linkLabel: 'Google Doc-টি খুলুন',
          });
          fetchDriveFiles(t);
        } catch (err) {
          setStatusBanner({
            type: 'error',
            message: 'Google Docs ডকুমেন্ট তৈরি করতে সমস্যা হয়েছে।',
          });
        } finally {
          setIsBusyAction(false);
        }
      },
    });
  };

  // 6. Google Calendar: List & Create School Event (with MANDATORY User Confirmation Modal)
  const fetchCalendarEvents = async (accessToken?: string) => {
    const t = accessToken || (await requireValidToken());
    if (!t) return;
    setIsLoadingCalendar(true);
    try {
      const timeMin = new Date().toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=6&singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
          timeMin
        )}`,
        {
          headers: { Authorization: `Bearer ${t}` },
        }
      );
      if (res.status === 401) {
        setNeedsAuth(true);
        return;
      }
      const data = await res.json();
      if (data.items) {
        setCalendarEvents(data.items);
      }
    } catch (err) {
      console.error('Calendar fetch error:', err);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const requestAddCalendarEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) return;

    setConfirmDialog({
      titleBn: 'Google Calendar-এ স্কুলের ইভেন্ট যুক্ত করবেন?',
      descriptionBn: `"${newEventTitle}" ইভেন্টটি আগামী ${newEventDate} তারিখে আপনার Google Calendar-এ যুক্ত করা হবে।`,
      actionLabelBn: 'হ্যাঁ, ক্যালেন্ডারে যোগ করুন',
      onConfirm: async () => {
        const t = await requireValidToken();
        if (!t) return;
        setIsBusyAction(true);
        try {
          const res = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${t}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                summary: newEventTitle,
                location: 'আনন্দ পাঠশালা, ২২ পূর্ণ চন্দ্র লাহিড়ী লেন, গোশালা, কুষ্টিয়া',
                description:
                  'আনন্দ পাঠশালা কুষ্টিয়া স্মার্ট পোর্টাল থেকে নির্ধারিত স্কুল ইভেন্ট। হেল্পলাইন: ০১৯১৪-০৫৭৫১১',
                start: { date: newEventDate },
                end: { date: newEventDate },
              }),
            }
          );
          const created = await res.json();
          if (created.id) {
            setStatusBanner({
              type: 'success',
              message: `"${newEventTitle}" সফলভাবে আপনার Google Calendar-এ যুক্ত হয়েছে!`,
              linkUrl: created.htmlLink,
              linkLabel: 'ক্যালেন্ডারে দেখুন',
            });
            fetchCalendarEvents(t);
          }
        } finally {
          setIsBusyAction(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
            <Cloud className="w-3.5 h-3.5 text-emerald-300" />
            <span>Google Workspace & Firebase Cloud Integration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            গুগল ওয়ার্কস্পেস ও ক্লাউড কমান্ড সেন্টার
          </h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            আনন্দ পাঠশালা কুষ্টিয়ার স্টুডেন্ট ডাটা, হাজিরা ও ফি রিপোর্ট সরাসরি <strong>Google Sheets</strong>,{' '}
            <strong>Google Docs</strong>, <strong>Google Drive</strong>, <strong>Google Picker</strong> এবং{' '}
            <strong>Google Calendar</strong>-এ সংরক্ষণ ও সিঙ্ক করুন।
          </p>
        </div>

        {/* Official Sign in with Google Button / User Profile Pill */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 flex flex-col items-start sm:items-end gap-3">
          {!needsAuth && user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-bold text-white block">
                  {user.displayName || 'ভেরিফাইড অ্যাডমিন'}
                </span>
                <span className="text-[11px] text-emerald-200 block">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                সাইন আউট
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[11px] text-emerald-100 block">
                Google Drive, Sheets, Docs ও Calendar ব্যবহার করতে সাইন-ইন করুন:
              </span>
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button bg-white hover:bg-slate-50 text-slate-800 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-sm flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <div className="gsi-material-button-icon w-4 h-4 shrink-0">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {isLoggingIn ? 'সংযুক্ত হচ্ছে...' : 'Sign in with Google'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Notification Banner */}
      {statusBanner && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : statusBanner.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{statusBanner.message}</span>
            {statusBanner.linkUrl && (
              <a
                href={statusBanner.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold underline text-emerald-800 ml-2"
              >
                <span>{statusBanner.linkLabel || 'লিঙ্ক খুলুন'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-slate-500 hover:text-slate-800 font-semibold"
          >
            বন্ধ
          </button>
        </div>
      )}

      {/* 4 Workspace Action Cards: Sheets, Docs, Picker, Drive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Google Sheets Card */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
              Google Sheets API
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              স্টুডেন্ট ও ফি স্প্রেডশিট এক্সপোর্ট
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              সকল শিক্ষার্থীর প্রোফাইল, হাজিরা ও বিকাশ ফি কালেকশন রিপোর্ট এক ক্লিকে নতুন Google Sheet-এ তৈরি করুন।
            </p>
          </div>
          <button
            onClick={requestExportToGoogleSheets}
            disabled={isBusyAction}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Sheet তৈরি করুন</span>
          </button>
        </div>

        {/* Google Docs Card */}
        <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
              Google Docs API
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              ডিজিটাল ডায়রি প্রতিবেদন ডক
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              আজকের ক্লাসরুম অ্যাক্টিভিটি, ছড়া ও টিফিন আপডেটগুলো দিয়ে প্রিন্টযোগ্য Google Doc তৈরি করুন।
            </p>
          </div>
          <button
            onClick={requestCreateGoogleDoc}
            disabled={isBusyAction}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Google Doc তৈরি করুন</span>
          </button>
        </div>

        {/* Google Picker Card */}
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <FolderOpen className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded uppercase">
              Google Picker API
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              ড্রাইভ থেকে ফাইল ও ছবি নির্বাচন
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              অফিশিয়াল Google Picker উইজেট ব্যবহার করে আপনার Google Drive থেকে ডকুমেন্ট বা ছবি বাছাই করুন।
            </p>
            {pickedFile && (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 truncate">
                নির্বাচিত: <strong>{pickedFile.name}</strong>
              </div>
            )}
          </div>
          <button
            onClick={handleOpenGooglePicker}
            className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Google Picker খুলুন</span>
          </button>
        </div>

        {/* Firebase Firestore Realtime Status Card */}
        <div className="bg-white rounded-2xl border border-purple-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase">
              Firebase Firestore
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              ক্লাউড ডাটাবেস সিঙ্ক (asia-southeast1)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ডিজিটাল ডায়রি পোস্ট, ফটো গ্যালারি এবং গেট-পাস লগ স্বয়ংক্রিয়ভাবে Firebase Firestore-এ সংরক্ষিত হচ্ছে।
            </p>
          </div>
          <div className="py-2 px-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-[11px] font-semibold flex items-center justify-between">
            <span>স্ট্যাটাস: সক্রিয় (Firestore)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* 2-Column Workspace Data View: Google Drive Files & Google Calendar Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Drive File Browser */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-600" />
                Google Drive ফাইলসমূহ (Recent School Files)
              </h3>
              <p className="text-[11px] text-slate-500">
                আপনার Google Drive-এ সংরক্ষিত সাম্প্রতিক শিট, ডক ও ফাইল
              </p>
            </div>
            <button
              onClick={() => fetchDriveFiles()}
              disabled={isLoadingDrive}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>
          </div>

          {needsAuth ? (
            <div className="py-8 text-center space-y-2 text-xs text-slate-500">
              <p>আপনার Google Drive ফাইলগুলো দেখতে উপরে "Sign in with Google" বাটনে ক্লিক করুন।</p>
            </div>
          ) : driveFiles.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {isLoadingDrive ? 'Google Drive ফাইল লোড হচ্ছে...' : 'কোনো ফাইল পাওয়া যায়নি।'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {driveFiles.map((file) => (
                <div
                  key={file.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <a
                      href={file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-slate-900 hover:text-emerald-700 truncate block"
                    >
                      {file.name}
                    </a>
                    <span className="text-[10px] text-slate-400 block">{file.mimeType}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100"
                        title="ফাইলটি খুলুন"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => requestDeleteDriveFile(file)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                      title="ফাইল মুছে ফেলুন"
                      aria-label={`Delete ${file.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Google Calendar Academic Scheduler */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Google Calendar একাডেমিক ইভেন্ট সিঙ্ক
              </h3>
              <p className="text-[11px] text-slate-500">
                স্কুলের ভর্তি মেলা, প্যারেন্টস মিটিং ও বার্ষিক উৎসব ক্যালেন্ডারে যুক্ত করুন
              </p>
            </div>
            <button
              onClick={() => fetchCalendarEvents()}
              disabled={isLoadingCalendar}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>
          </div>

          {/* Add Event Form */}
          <form
            onSubmit={requestAddCalendarEvent}
            className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-indigo-950 block mb-1">
                  স্কুল ইভেন্টের নাম:
                </label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-indigo-950 block mb-1">
                  তারিখ:
                </label>
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isBusyAction}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Google Calendar-এ যুক্ত করুন</span>
              </button>
            </div>
          </form>

          {/* Upcoming Events List */}
          {needsAuth ? (
            <div className="py-6 text-center text-xs text-slate-500">
              Google Calendar ইভেন্ট দেখতে উপরে "Sign in with Google" বাটনে ক্লিক করুন।
            </div>
          ) : calendarEvents.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              {isLoadingCalendar
                ? 'ক্যালেন্ডার ইভেন্ট লোড হচ্ছে...'
                : 'আসন্ন কোনো ইভেন্ট পাওয়া যায়নি।'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {calendarEvents.map((ev) => (
                <div key={ev.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{ev.summary}</span>
                    <span className="text-[11px] text-slate-500">
                      সময়: {ev.start?.date || ev.start?.dateTime || 'নির্ধারিত'}
                    </span>
                  </div>
                  {ev.htmlLink && (
                    <a
                      href={ev.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline text-[11px] font-semibold flex items-center gap-1"
                    >
                      <span>দেখুন</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog Modal for Mutating/Destructive Workspace API Actions */}
      {confirmDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{confirmDialog.titleBn}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {confirmDialog.descriptionBn}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  await action();
                }}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmDialog.actionLabelBn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
