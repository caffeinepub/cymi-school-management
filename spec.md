# CYMI School Management

## Current State
Full-stack school management system with:
- Role-based login (SuperAdmin, Admin, Parent, Student)
- Dashboard with animated counters, live clock, donut/bar/area charts, quick actions, activity feed
- Students module (520 records, CRUD, export Excel/PDF)
- Attendance module (mark present/absent/late, export)
- Finance module (Fee Structure, Collection, Register, Receipts, History, Fee Reports)
- Transportation module (Routes, Vehicles, Drivers, Assignments, Reports)
- Reports, User Management, System Settings pages
- Sidebar with scrollable dropdown groups, collapse toggle

## Requested Changes (Diff)

### Add
- **Dashboard**: Additional KPI cards with live-simulated trend indicators (up/down arrows + percentage change vs last week), total revenue this month, new admissions this month
- **Dashboard**: "Top Performing Students" mini-table (top 5 by marks)
- **Dashboard**: "Upcoming Events" timeline panel (5 events: exams, meetings, holidays)
- **Dashboard**: "Gender Distribution" mini donut next to existing composition chart
- **Finance / Fee Collection**: Animated progress bar showing monthly collection target vs actual (e.g. target ₹5L, collected ₹3.4L)
- **Finance / Fee History**: Filterable by year, month, status; animated row entries; summary totals
- **Attendance**: Summary stats cards at top (Total Students, Present Today, Absent Today, Late Today) with animated count-up; attendance % progress bar per class/grade filter
- **Reports page**: Add a "Grade-wise Enrollment" bar chart and a "Fee Collection vs Target" grouped bar chart; existing charts get animated entrance
- **Sidebar**: Active route highlight — currently active link should have a visually distinct active state (filled background, brighter text)
- **All pages**: Consistent page-level entrance animation (fade-in + slight slide-up) on every main content area that doesn't already have it
- **Student Profile**: Progress/performance radial chart showing subject-wise marks visually
- **Transport Reports**: Add a "Route Utilization" radial/bar chart with animated fill

### Modify
- **Dashboard stat cards**: Add trend badge (e.g. "+12 this month" in green, or "-3" in red) below each count
- **Quick Actions**: Make buttons navigate to the correct pages (Add Student → /students?action=add, Mark Attendance → /attendance, View Reports → /reports, Fee Collection → /fees/collection)
- **Notification bell dropdown**: Widen to 320px, add "Mark all read" button, timestamps on each notification
- **Activity feed**: Add "Load more" button that shows 3 additional items
- **Fee Collection stats**: Animate the 4 stat cards with count-up on mount

### Remove
- Nothing removed

## Implementation Plan
1. Update DashboardPage.tsx:
   - Add trend badges to all 4 stat cards
   - Add 2 new KPI cards (Revenue this month, New Admissions)
   - Wire Quick Actions buttons to correct routes via useNavigate
   - Expand notification bell: 320px, mark-all-read, timestamps
   - Add "Load more" to activity feed (show 6 initially, expand by 3)
   - Add "Upcoming Events" timeline panel
   - Add "Top Performing Students" mini-table
   - Add gender distribution mini-donut alongside composition chart

2. Update AttendancePage.tsx:
   - Add summary stat cards at top with animated counters
   - Add attendance % progress bar per current grade filter

3. Update ReportsPage.tsx:
   - Add Grade-wise Enrollment bar chart
   - Add Fee Collection vs Target grouped bar chart
   - Apply animated entrance to all chart panels

4. Update FeeCollectionPage.tsx:
   - Animate stat cards with count-up on mount
   - Add monthly collection target progress bar

5. Update FeeHistoryPage.tsx:
   - Add year/month/status filter controls
   - Animate row entries on filter change
   - Add summary totals footer

6. Update StudentProfilePage.tsx:
   - Add radial/spider chart for subject-wise marks

7. Update TransportReportsPage.tsx:
   - Add route utilization animated bar chart

8. Update Sidebar.tsx:
   - Add active route detection and highlight styling for current route
