# CYMI School Management System

## Current State

The system is a full multi-role school management platform (Super Admin, Admin, Parent, Student) built in React + TypeScript with TanStack Router. It has the following modules live:
- Dashboard, Students, Attendance, Fee Management (9 pages), Transportation (5 pages), Staff/Teachers, Exam Management, SMS, Admissions, Reports, User Management, System Settings, Super Admin Control Center
- Sidebar (`src/frontend/src/components/Sidebar.tsx`): accordion-style, auto-collapses groups, role-aware, animated gradients
- App.tsx: all routes registered via TanStack Router

## Requested Changes (Diff)

### Add

**1. Accounts Management Module** (sidebar group: "Accounts")
- `/accounts/overview` — AccountsOverviewPage: dashboard with animated KPI cards (Total Revenue, Total Expenses, Net Balance, Outstanding Receivables), monthly income vs expense area chart, recent transactions list
- `/accounts/ledger` — AccountsLedgerPage: general ledger with date/account-type filters, paginated journal entries (Date, Reference, Account, Description, Debit, Credit, Balance), export Excel/PDF
- `/accounts/journal` — AccountsJournalPage: journal voucher entry form (Date, Voucher Type, Narration, debit/credit rows), list of posted journals with search/filter
- `/accounts/balance-sheet` — BalanceSheetPage: assets vs liabilities table with sub-categories, net worth calculation, printable view
- `/accounts/income-expense` — IncomeExpensePage: income vs expense report by month/year with bar chart, summary table, export

**2. Payroll Module** (sidebar group: "Payroll")
- `/payroll/overview` — PayrollOverviewPage: KPI cards (Total Staff, Payroll Processed, Pending, Month's Total Salary), monthly payroll trend chart
- `/payroll/staff-salary` — StaffSalaryPage: 50 staff salary records (Name, Designation, Department, Basic, Allowances, Deductions, Net Pay, Status), full CRUD, search/filter, export Excel/PDF
- `/payroll/process` — PayrollProcessPage: select month/year, list staff with checkboxes, compute salary, bulk process, mark as paid
- `/payroll/payslips` — PayslipsPage: generate/view/print individual payslips per staff per month; payslip shows school header, employee details, earnings breakdown, deductions, net pay
- `/payroll/reports` — PayrollReportsPage: month-wise and department-wise salary summaries, charts, export Excel/PDF

**3. Payments Module** (sidebar group: "Payments")
- `/payments/overview` — PaymentsOverviewPage: KPI cards (Total Received, Pending, Overdue, Today's Collections), recent payment activity feed
- `/payments/received` — PaymentsReceivedPage: all incoming payments table (Date, Ref No, Payer, Category, Amount, Mode, Status), search/filter/pagination, export
- `/payments/pending` — PaymentsPendingPage: outstanding payment requests with days-overdue color coding, send-reminder action, bulk mark-paid
- `/payments/vouchers` — PaymentVouchersPage: create and list payment vouchers (vendor, purpose, amount, approval status), approve/reject workflow
- `/payments/modes` — PaymentModesPage: manage payment modes (Cash, Cheque, UPI, Bank Transfer, DD) with settings

**4. Billings Module** (sidebar group: "Billings")
- `/billing/invoices` — BillingInvoicesPage: list of all invoices (Invoice No, Student/Vendor, Date, Due Date, Amount, Paid, Balance, Status), create new invoice, view/print, export
- `/billing/create` — BillingCreatePage: invoice builder form (recipient, line items, tax, discount, total, due date), preview and save
- `/billing/recurring` — BillingRecurringPage: manage recurring billing templates (monthly fee, hostel, transport charges), enable/disable
- `/billing/reports` — BillingReportsPage: revenue by category, overdue analysis, monthly billing trend chart, export Excel/PDF

**5. HR Management Module** (sidebar group: "HR")
- `/hr/overview` — HROverviewPage: KPI cards (Total Employees, On Leave Today, New Joiners This Month, Attrition Rate), department headcount chart, recent HR activity
- `/hr/employees` — HREmployeesPage: all-staff HR directory (50+ records) with Name, Emp ID, Department, Designation, Join Date, Employment Type, Status — full CRUD, search/filter, export
- `/hr/recruitment` — HRRecruitmentPage: job openings list with applicant count, add/edit positions, application pipeline (Applied, Shortlisted, Interviewed, Offered, Joined)
- `/hr/leaves` — HRLeavesPage: leave requests table with approve/reject workflow, leave balance summary per employee, leave types management, calendar view of approved leaves
- `/hr/performance` — HRPerformancePage: performance review records per employee, rating bars, review cycle management, bulk export
- `/hr/documents` — HRDocumentsPage: employee document store (Offer Letter, ID Proof, Certificates), upload/view/download per employee
- `/hr/policies` — HRPoliciesPage: company HR policy documents list (Leave Policy, Code of Conduct, Travel Policy, etc.) with view/download

### Modify
- `src/frontend/src/components/Sidebar.tsx`: Add 5 new sidebar groups — Accounts, Payroll, Payments, Billings, HR — each with appropriate sub-items linking to the new pages. Insert after existing Finance/Fees group.
- `src/frontend/src/App.tsx`: Register all new routes (20 new routes total).

### Remove
- Nothing removed.

## Implementation Plan

1. Create 20 new page files under:
   - `src/frontend/src/pages/accounts/` (5 pages)
   - `src/frontend/src/pages/payroll/` (5 pages)
   - `src/frontend/src/pages/payments/` (5 pages)
   - `src/frontend/src/pages/billing/` (4 pages)
   - `src/frontend/src/pages/hr/` (7 pages)
2. Each page: animated KPI stat cards, data tables with search/filter/pagination, CRUD modals, export Excel/PDF buttons — matching the existing app's dynamic theme (animated gradients, glow effects, card hover, blue color scheme).
3. Update `Sidebar.tsx`: add 5 new accordion groups after the Fees group.
4. Update `App.tsx`: import and register all 20+ new route objects, add them to the routeTree.
5. Validate: typecheck + lint + build.
