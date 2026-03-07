# CYMI School Management

## Current State
- React + TanStack Router SPA with Login, Dashboard, and ForgotPassword pages
- Sidebar with role-aware navigation (SuperAdmin, Admin, Parent, Student)
- Dashboard shows animated stat cards, charts (pie/bar/area), quick actions, activity feed
- Backend provides login/logout/token auth, user profiles, dashboard stats
- Roles: SuperAdmin, Admin, Parent, Student

## Requested Changes (Diff)

### Add
- **User Management page** (`/user-management`) — SuperAdmin and Admin only:
  - Table of all users with columns: Name, Username, Role, Status (Active/Inactive)
  - Search/filter by name or role
  - Add User modal: form with First Name, Last Name, Username, Role (dropdown), Password
  - Edit User modal: same fields as Add
  - Delete User: confirmation dialog
  - Mock data: at least 8 demo users across roles (SuperAdmin, Admin, Teacher, Student, Parent)
  - Status badge (green Active / red Inactive)
  - Pagination (5 users per page)

- **System Settings page** (`/system-settings`) — SuperAdmin only:
  - School Information section: School Name, Address, Phone, Email, Academic Year (text inputs, Save button)
  - Notification Settings section: toggles for Email Notifications, SMS Alerts, Attendance Alerts, Fee Reminders
  - Security Settings section: Session Timeout (dropdown: 30min, 1hr, 2hr, 4hr, 8hr), Password Policy (dropdown: Standard, Strong, Very Strong)
  - All settings stored in local component state (no backend persistence needed)
  - Save buttons per section with success toast on save

- **Reports page** (`/reports`) — SuperAdmin and Admin only:
  - Summary cards: Total Students, Total Teachers, Average Attendance %, Total Fee Collected
  - Attendance Report section: bar chart (Mon–Fri weekly trend, reuse existing ATTENDANCE_DATA)
  - Fee Collection Report section: area chart (Jan–Dec monthly, reuse existing FEE_DATA)
  - Student Enrollment Report: pie/donut chart (grade-wise distribution: Grade 1–5, Grade 6–8, Grade 9–10, Grade 11–12)
  - Export button (shows toast "Export feature coming soon")
  - Date range filter UI (display only, no functional filtering needed for now)

### Modify
- **Sidebar** (`Sidebar.tsx`): Add "User Management", "System Settings", "Reports" as nav items under SuperAdmin/Admin menu (with appropriate icons, linking to the new routes). "System Settings" visible to SuperAdmin only.
- **App.tsx**: Register `/user-management`, `/system-settings`, `/reports` routes.
- **DashboardPage.tsx**: The "User Management", "System Settings", "Reports", "Audit Logs" chips in the Super Admin info box should become clickable buttons linking to those pages.

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/UserManagementPage.tsx` with mock data table, search, add/edit/delete modals
2. Create `src/frontend/src/pages/SystemSettingsPage.tsx` with settings sections and toggles
3. Create `src/frontend/src/pages/ReportsPage.tsx` with charts and summary cards
4. Update `Sidebar.tsx` to add new nav items with correct icons and href links
5. Update `App.tsx` to register three new routes
6. Update `DashboardPage.tsx` to make the admin chip buttons clickable with navigation links
7. Validate (typecheck + lint + build)
