# CYMI School Management

## Current State
The app has: Login (4 roles), Dashboard, Students (520 members), Attendance, Transport (Routes, Vehicles, Drivers, Assignments, Reports), User Management, System Settings, Reports. Sidebar is collapsible with scroll support.

Finance section in the sidebar currently has non-functional "Fee Management" and "Reports" placeholders.

## Requested Changes (Diff)

### Add
- `/fees/structure` — Fee Structure page: define fee categories (Tuition, Transport, Library, Lab, Sports, Exam, etc.), amounts per class/grade, due dates, late fee rules. Table with add/edit/delete. Export Excel/PDF.
- `/fees/collection` — Fee Collection page: collect fees for a student by searching name/admission number. Select fee heads, apply discounts/waivers, generate receipt. Shows collection summary stats (today's collection, pending, overdue).
- `/fees/register` — Fee Register page: full ledger view of all fee transactions across all students. Filters by class, section, fee type, month, status (paid/partial/pending/overdue). Pagination. Export Excel/PDF.
- `/fees/receipts` — Receipts page: search and view/print/download individual payment receipts. Each receipt shows student details, fee heads, amount paid, payment method, receipt number, date.
- `/fees/history` — Fee History page: per-student fee payment history timeline. Search student, view all past payments, outstanding balance, dues summary.
- `/fees/reports` — Fee Reports page: charts for monthly collection trend, fee collection by class, outstanding dues breakdown. Export options.

### Modify
- `Sidebar.tsx`: Update Finance group children with hrefs for all 6 new fee pages.
- `App.tsx`: Register 6 new routes for fee pages.

### Remove
- Nothing removed.

## Implementation Plan
1. Create 6 fee page components in `src/frontend/src/pages/fees/`:
   - `FeeStructurePage.tsx`
   - `FeeCollectionPage.tsx`
   - `FeeRegisterPage.tsx`
   - `FeeReceiptsPage.tsx`
   - `FeeHistoryPage.tsx`
   - `FeeReportsPage.tsx`
2. Each page includes: header with title + export dropdown, filter bar, data table or form, mock data, add/edit dialogs, fully wired export (Excel via SheetJS + PDF via jsPDF or print).
3. Update `Sidebar.tsx` Finance group children with route hrefs.
4. Update `App.tsx` with 6 new route definitions and imports.
5. Validate (typecheck + lint + build).
