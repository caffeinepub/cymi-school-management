# CYMI School Management

## Current State
- Full-stack school management app with Motoko backend + React/TypeScript frontend
- Pages: Login, Dashboard, Students, Attendance, StudentProfile, UserManagement, SystemSettings, Reports
- Sidebar with collapsible groups for Admin/SuperAdmin/Parent/Student roles
- 520 student records in frontend data layer
- Charts (donut, bar, area) on dashboard
- Export to Excel/PDF on students, attendance, reports

## Requested Changes (Diff)

### Add
- Complete Transportation module with:
  - **Routes Management**: CRUD for bus routes (route number, name, start/end points, stops list, distance)
  - **Vehicles Management**: CRUD for vehicles (bus number, model, capacity, driver assigned, status: Active/Maintenance/Inactive)
  - **Drivers Management**: CRUD for drivers (name, license, phone, assigned vehicle, experience)
  - **Student Assignment**: Assign students to routes/buses with pickup point and time
  - **Route Tracking**: Overview page showing all routes with stop details and assigned students count
  - **Transportation Reports**: Ridership stats, route utilization, export to Excel/PDF
- Sidebar entry: "Transportation" group with children: Routes, Vehicles, Drivers, Student Assignment, Reports
- New routes: `/transport/routes`, `/transport/vehicles`, `/transport/drivers`, `/transport/assignments`, `/transport/reports`

### Modify
- `Sidebar.tsx`: Add Transportation group (bus icon) with 5 sub-items for Admin/SuperAdmin
- `App.tsx`: Register all 5 new transportation routes

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/data/transportation.ts` with mock data: 10 routes, 15 vehicles, 12 drivers, ~100 student assignments
2. Create `src/pages/transport/TransportRoutesPage.tsx` - routes CRUD table with stops drawer
3. Create `src/pages/transport/TransportVehiclesPage.tsx` - vehicles CRUD table
4. Create `src/pages/transport/TransportDriversPage.tsx` - drivers CRUD table
5. Create `src/pages/transport/TransportAssignmentsPage.tsx` - student-route assignment manager
6. Create `src/pages/transport/TransportReportsPage.tsx` - charts + stats + export
7. Update `Sidebar.tsx` to add Transportation group
8. Update `App.tsx` to register new routes
