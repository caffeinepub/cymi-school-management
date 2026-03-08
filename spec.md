# CYMI School Management

## Current State
- Super Admin logs in and sees a dashboard with charts, stat cards, and an info panel
- System Settings page allows editing school info, notifications, and security config
- User Management allows add/edit/delete users
- All modules (Students, Attendance, Fees, Transport) exist but Super Admin has no dedicated full control panel
- No "Super Admin Control Center" page exists -- Super Admin just sees the same dashboard as Admin

## Requested Changes (Diff)

### Add
- **Super Admin Control Center page** (`/superadmin`) accessible only by SuperAdmin role
  - School Branding section: edit school name, logo URL, tagline, contact info, address, academic year
  - Module Management section: enable/disable modules (Students, Attendance, Fee Management, Transport, Exams, Library, Staff) with toggles
  - Role & Permission Management: view/edit what each role (Admin, Teacher, Parent, Student) can access (checkboxes per module)
  - Academic Settings: set current academic year, grading system (percentage/GPA/grade letter), pass mark threshold, max marks per exam
  - Fee Configuration: set fee types, due dates, late fee percentage, concession categories
  - Announcement Board: add/edit/delete system-wide announcements that appear on all dashboards
  - Backup & Data section: export all data (students, fees, attendance) as Excel/JSON, reset demo data button
  - System Health panel: shows counts (students, teachers, staff, parents), last login info, active sessions count
- **Sidebar Super Admin link** under System Settings leading to `/superadmin`

### Modify
- System Settings page: add a prominent link/button to "Super Admin Control Center"
- Dashboard Super Admin info box: add a chip link to "Control Center"
- Sidebar: add "Control Center" link for SuperAdmin role under System Settings

### Remove
- Nothing removed

## Implementation Plan
1. Create `SuperAdminControlPage.tsx` at `/superadmin` route
2. Add the route to App.tsx
3. Add "Control Center" nav item to Sidebar for SuperAdmin role
4. Build all sections using tabs: Branding, Modules, Permissions, Academics, Fees Config, Announcements, Data & Backup, System Health
5. Use localStorage to persist control center settings (branding, module toggles, permissions, etc.)
6. Wire announcement board: store announcements in component state, show "active" announcements on dashboard
7. All fields fully editable with save/toast confirmation
