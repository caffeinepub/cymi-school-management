# CYMI School Management System

## Current State
A school management app with a login page and dashboard. The login uses username/password credentials stored in the backend. The current backend `seedDemoUsers` function requires admin authorization (via `AccessControl.isAdmin`) but is called by an anonymous browser user, so it always fails silently. As a result, no credentials are ever seeded and login with admin/admin123 always returns null.

## Requested Changes (Diff)

### Add
- Auto-seed demo credentials at actor initialization (not requiring admin access)
- Token-based session management that doesn't depend on Internet Identity / Principal
- `getUserProfileByToken(token)` query to fetch profile from session token
- `getDashboardStats(token)` accepting a token parameter to verify session

### Modify
- `seedDemoUsers` - remove admin authorization requirement; seed admin/admin123, teacher1/teacher123, student1/student123
- `login(username, password)` - remove Principal/AccessControl dependency; return a simple text token on success
- `logout(token)` - remove Principal/AccessControl dependency
- `validateToken(token)` - return username (Text) instead of Principal
- `getDashboardStats` - accept token param instead of requiring authenticated Principal caller
- Frontend `useQueries.ts` - update `useDashboardStats` to pass token; update `useLogin` return/flow
- Frontend `LoginPage.tsx` - remove actor not-ready guard from seed call; improve UX
- Frontend `DashboardPage.tsx` - pass stored token to dashboard stats query

### Remove
- Authorization / AccessControl dependency from main.mo (replace with simple credential map)

## Implementation Plan
1. Regenerate backend with token-based auth, no Principal/AccessControl, auto-seeding of demo users
2. Update frontend useQueries.ts to match new API signatures
3. Update DashboardPage to pass token to getDashboardStats
4. Validate and deploy
