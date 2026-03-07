# CYMI School Management System

## Current State
New project with no existing code.

## Requested Changes (Diff)

### Add
- Login page replicating the structure of https://kjapath.petrasoft.co.in/public/index.php/login but branded for CYMI (Christ Youth Mission Institute)
- School dashboard after login (placeholder for now)
- Authentication system with username + password login
- Forgot password page (placeholder)
- Role-based access: Admin, Teacher, Student roles

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend
- Authentication canister with login(username, password) -> Result<UserSession, Text>
- User management: store users with username, hashed password, role (Admin/Teacher/Student)
- Session tokens with expiry
- Seed data: demo admin user (admin/admin123), teacher (teacher/teacher123), student (student/student123)
- getProfile() -> returns logged-in user info
- logout() -> invalidates session

### Frontend
- Login page layout:
  - Top navbar with CYMI logo on left (blue navbar matching reference)
  - Full-page wallpaper background (campus image)
  - Login card aligned to the right side of the page
  - Card contains: CYMI logo (circular), Username input, Password input, Sign In button, Forgot Password link
  - Title in browser tab: "CYMI - Christ Youth Mission Institute"
- Dashboard placeholder page after login with user's name and role displayed
- Forgot password page (simple placeholder saying contact admin)
- Responsive layout
