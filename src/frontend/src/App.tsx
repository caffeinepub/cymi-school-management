import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AttendancePage from "./pages/AttendancePage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportsPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentsPage from "./pages/StudentsPage";
import SystemSettingsPage from "./pages/SystemSettingsPage";
import UserManagementPage from "./pages/UserManagementPage";
import FeeCollectionPage from "./pages/fees/FeeCollectionPage";
import FeeHistoryPage from "./pages/fees/FeeHistoryPage";
import FeeReceiptsPage from "./pages/fees/FeeReceiptsPage";
import FeeRegisterPage from "./pages/fees/FeeRegisterPage";
import FeeReportsPage from "./pages/fees/FeeReportsPage";
import FeeStructurePage from "./pages/fees/FeeStructurePage";
import TransportAssignmentsPage from "./pages/transport/TransportAssignmentsPage";
import TransportDriversPage from "./pages/transport/TransportDriversPage";
import TransportReportsPage from "./pages/transport/TransportReportsPage";
import TransportRoutesPage from "./pages/transport/TransportRoutesPage";
import TransportVehiclesPage from "./pages/transport/TransportVehiclesPage";

// Root layout — just renders the outlet + toaster
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
});

const userManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/user-management",
  component: UserManagementPage,
});

const systemSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/system-settings",
  component: SystemSettingsPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: ReportsPage,
});

const studentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/students",
  component: StudentsPage,
});

const studentProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/students/$id",
  component: StudentProfilePage,
});

const attendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendance",
  component: AttendancePage,
});

const transportRoutesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transport/routes",
  component: TransportRoutesPage,
});

const transportVehiclesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transport/vehicles",
  component: TransportVehiclesPage,
});

const transportDriversRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transport/drivers",
  component: TransportDriversPage,
});

const transportAssignmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transport/assignments",
  component: TransportAssignmentsPage,
});

const transportReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transport/reports",
  component: TransportReportsPage,
});

const feeStructureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fees/structure",
  component: FeeStructurePage,
});

const feeCollectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fees/collection",
  component: FeeCollectionPage,
});

const feeRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fees/register",
  component: FeeRegisterPage,
});

const feeReceiptsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fees/receipts",
  component: FeeReceiptsPage,
});

const feeHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fees/history",
  component: FeeHistoryPage,
});

const feeReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fees/reports",
  component: FeeReportsPage,
});

const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => <Navigate to="/" />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  forgotPasswordRoute,
  userManagementRoute,
  systemSettingsRoute,
  reportsRoute,
  studentsRoute,
  studentProfileRoute,
  attendanceRoute,
  transportRoutesRoute,
  transportVehiclesRoute,
  transportDriversRoute,
  transportAssignmentsRoute,
  transportReportsRoute,
  feeStructureRoute,
  feeCollectionRoute,
  feeRegisterRoute,
  feeReceiptsRoute,
  feeHistoryRoute,
  feeReportsRoute,
  catchAllRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
