# Implementation Plan: Parent-Only Fee Due Notification on Login

## User Request
- **Issue**: A payment due popup notification was appearing immediately upon page load for all users/visitors.
- **Goal**: Remove the popup from page load. Show the payment due popup/notification ONLY when a parent logs into their account, and ONLY if their specific child has an unpaid/due fee invoice.

## Changes Completed
1. **Removed Global Page-Load Fee Reminder Scan (`src/App.tsx`)**:
   - Removed the automated `useEffect` on mount that executed `checkAndTriggerFeeDueReminders` at 1500ms and on 60s intervals across all school invoices.
   - Initial page loads (public visitors, guest view, teachers, admin) no longer trigger any fee payment popups.

2. **Added Parent-Specific Fee Reminder Trigger (`src/utils/feeReminderLogic.ts` & `src/App.tsx`)**:
   - Implemented `checkAndTriggerFeeDueRemindersForParent(parentStudentId, invoices, students, onTriggerNotification)`.
   - In `App.tsx`, hooked `triggerParentFeeReminderIfDue` into `handleLoginSuccess` and `handleRoleChange` ONLY when `account.role === 'parent'`.
   - If the logged-in parent's child has NO unpaid fees, no notification is fired.
   - On logout (`handleLogout`), any active toast is automatically cleared.

3. **Parent Portal In-App Fee Due Popup Modal (`src/components/RolePortals.tsx`)**:
   - Added `showFeeDuePopupModal` in `ParentPortalDashboard`.
   - When a parent logs in, if their child has an unpaid invoice, a focused in-app popup modal displays:
     - Student photo, name, class, roll, ID.
     - Unpaid month, invoice number, due date, and net amount in bold Bengali (`৳...`).
     - 1-click action: "বিকাশ দিয়ে ফি পরিশোধ করুন" to navigate directly to the fees tab.
     - Dismiss button: "পরে পরিশোধ করব" with session persistence.

4. **Verification**:
   - `compile_applet` succeeded.
   - `lint_applet` passed with 0 errors.
   - Development server restarted and verified.
