# CYMI School Management

## Current State
The app has a multi-role login (SuperAdmin, Admin, Parent, Student) with a dynamic dashboard featuring animated stat cards, pie/donut charts, weekly attendance bar chart, monthly fee collection area chart, quick actions, activity feed, and role-specific panels. Pages exist for User Management, System Settings, and Reports. The backend has DemiUser CRUD, login/session tokens, dashboard stats, and user profiles. There is no dedicated Students page or student-specific data model beyond the generic UserProfile.

## Requested Changes (Diff)

### Add
- **Student data model** in the backend: `Student` record with fields: id, admissionNo, firstName, lastName, grade, section, gender, dob, phone, parentName, parentPhone, email, address, feeStatus, attendancePct, joinDate
- **Backend student CRUD**: `addStudent`, `getStudentById`, `getAllStudents`, `updateStudent`, `deleteStudent`, `getStudentCount`, `seedStudents` (seeds 520 realistic students)
- **Students page** (`/students`) accessible to Admin and SuperAdmin from the sidebar
- Student list with search (name / admission number), filter by grade (1–12) and section (A/B/C/D), pagination (25 per page), and total count badge
- Add New Student modal with all fields and validation
- Edit Student modal pre-filled with existing data
- Delete confirmation dialog
- Student detail view (modal/drawer) showing full profile, attendance ring, and fee status badge
- Attendance sub-section: mark attendance for the selected student (present/absent/late)
- Route `/students` registered in App.tsx and added to sidebar nav under the "Students" group

### Modify
- `Sidebar.tsx` – add "All Students" link under the Students group pointing to `/students`
- `App.tsx` – register `/students` route pointing to the new `StudentsPage`
- Dashboard student count stat card to show 520

### Remove
- Nothing removed
