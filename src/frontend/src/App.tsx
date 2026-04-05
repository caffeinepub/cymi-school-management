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
import SuperAdminControlPage from "./pages/SuperAdminControlPage";
import SystemSettingsPage from "./pages/SystemSettingsPage";
import UserManagementPage from "./pages/UserManagementPage";
import AccountsJournalPage from "./pages/accounts/AccountsJournalPage";
import AccountsLedgerPage from "./pages/accounts/AccountsLedgerPage";
// Accounts
import AccountsOverviewPage from "./pages/accounts/AccountsOverviewPage";
import BalanceSheetPage from "./pages/accounts/BalanceSheetPage";
import IncomeExpensePage from "./pages/accounts/IncomeExpensePage";
import AdmissionReportsPage from "./pages/admissions/AdmissionReportsPage";
import AllAdmissionsPage from "./pages/admissions/AllAdmissionsPage";
import NewAdmissionPage from "./pages/admissions/NewAdmissionPage";
import BillingCreatePage from "./pages/billing/BillingCreatePage";
// Billing
import BillingInvoicesPage from "./pages/billing/BillingInvoicesPage";
import BillingRecurringPage from "./pages/billing/BillingRecurringPage";
import BillingReportsPage from "./pages/billing/BillingReportsPage";
import ExamSchedulePage from "./pages/exam/ExamSchedulePage";
import HallTicketsPage from "./pages/exam/HallTicketsPage";
import ResultsPage from "./pages/exam/ResultsPage";
import FeeCollectionPage from "./pages/fees/FeeCollectionPage";
import FeeConcessionPage from "./pages/fees/FeeConcessionPage";
import FeeDefaultersPage from "./pages/fees/FeeDefaultersPage";
import FeeHistoryPage from "./pages/fees/FeeHistoryPage";
import FeeReceiptsPage from "./pages/fees/FeeReceiptsPage";
import FeeRegisterPage from "./pages/fees/FeeRegisterPage";
import FeeReportsPage from "./pages/fees/FeeReportsPage";
import FeeSettingsPage from "./pages/fees/FeeSettingsPage";
import FeeStructurePage from "./pages/fees/FeeStructurePage";
import HRDocumentsPage from "./pages/hr/HRDocumentsPage";
import HREmployeesPage from "./pages/hr/HREmployeesPage";
import HRLeavesPage from "./pages/hr/HRLeavesPage";
// HR
import HROverviewPage from "./pages/hr/HROverviewPage";
import HRPerformancePage from "./pages/hr/HRPerformancePage";
import HRPoliciesPage from "./pages/hr/HRPoliciesPage";
import HRRecruitmentPage from "./pages/hr/HRRecruitmentPage";
import PaymentModesPage from "./pages/payments/PaymentModesPage";
import PaymentVouchersPage from "./pages/payments/PaymentVouchersPage";
// Payments
import PaymentsOverviewPage from "./pages/payments/PaymentsOverviewPage";
import PaymentsPendingPage from "./pages/payments/PaymentsPendingPage";
import PaymentsReceivedPage from "./pages/payments/PaymentsReceivedPage";
// Payroll
import PayrollOverviewPage from "./pages/payroll/PayrollOverviewPage";
import PayrollProcessPage from "./pages/payroll/PayrollProcessPage";
import PayrollReportsPage from "./pages/payroll/PayrollReportsPage";
import PayslipsPage from "./pages/payroll/PayslipsPage";
import StaffSalaryPage from "./pages/payroll/StaffSalaryPage";
import SmsComposePage from "./pages/sms/SmsComposePage";
import SmsHistoryPage from "./pages/sms/SmsHistoryPage";
import TeacherProfilePage from "./pages/staff/TeacherProfilePage";
import TeachersPage from "./pages/staff/TeachersPage";
import TransportAssignmentsPage from "./pages/transport/TransportAssignmentsPage";
import TransportDriversPage from "./pages/transport/TransportDriversPage";
import TransportReportsPage from "./pages/transport/TransportReportsPage";
import TransportRoutesPage from "./pages/transport/TransportRoutesPage";
import TransportVehiclesPage from "./pages/transport/TransportVehiclesPage";

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
const feeSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fees/settings",
  component: FeeSettingsPage,
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
const feeConcessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fees/concession",
  component: FeeConcessionPage,
});
const feeDefaultersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fees/defaulters",
  component: FeeDefaultersPage,
});
const superAdminControlRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/superadmin",
  component: SuperAdminControlPage,
});
const teachersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/teachers",
  component: TeachersPage,
});
const teacherProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/teachers/$id",
  component: TeacherProfilePage,
});
const examScheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exam/schedule",
  component: ExamSchedulePage,
});
const hallTicketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exam/hall-tickets",
  component: HallTicketsPage,
});
const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exam/results",
  component: ResultsPage,
});
const smsComposeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sms/compose",
  component: SmsComposePage,
});
const smsHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sms/history",
  component: SmsHistoryPage,
});
const admissionsAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admissions/all",
  component: AllAdmissionsPage,
});
const admissionsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admissions/new",
  component: NewAdmissionPage,
});
const admissionsReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admissions/reports",
  component: AdmissionReportsPage,
});
// Accounts routes
const accountsOverviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accounts/overview",
  component: AccountsOverviewPage,
});
const accountsLedgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accounts/ledger",
  component: AccountsLedgerPage,
});
const accountsJournalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accounts/journal",
  component: AccountsJournalPage,
});
const balanceSheetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accounts/balance-sheet",
  component: BalanceSheetPage,
});
const incomeExpenseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accounts/income-expense",
  component: IncomeExpensePage,
});
// Payroll routes
const payrollOverviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payroll/overview",
  component: PayrollOverviewPage,
});
const staffSalaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payroll/staff-salary",
  component: StaffSalaryPage,
});
const payrollProcessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payroll/process",
  component: PayrollProcessPage,
});
const payslipsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payroll/payslips",
  component: PayslipsPage,
});
const payrollReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payroll/reports",
  component: PayrollReportsPage,
});
// Payments routes
const paymentsOverviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payments/overview",
  component: PaymentsOverviewPage,
});
const paymentsReceivedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payments/received",
  component: PaymentsReceivedPage,
});
const paymentsPendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payments/pending",
  component: PaymentsPendingPage,
});
const paymentVouchersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payments/vouchers",
  component: PaymentVouchersPage,
});
const paymentModesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payments/modes",
  component: PaymentModesPage,
});
// Billing routes
const billingInvoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/billing/invoices",
  component: BillingInvoicesPage,
});
const billingCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/billing/create",
  component: BillingCreatePage,
});
const billingRecurringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/billing/recurring",
  component: BillingRecurringPage,
});
const billingReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/billing/reports",
  component: BillingReportsPage,
});
// HR routes
const hrOverviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/overview",
  component: HROverviewPage,
});
const hrEmployeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/employees",
  component: HREmployeesPage,
});
const hrRecruitmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/recruitment",
  component: HRRecruitmentPage,
});
const hrLeavesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/leaves",
  component: HRLeavesPage,
});
const hrPerformanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/performance",
  component: HRPerformancePage,
});
const hrDocumentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/documents",
  component: HRDocumentsPage,
});
const hrPoliciesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/policies",
  component: HRPoliciesPage,
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
  feeSettingsRoute,
  feeCollectionRoute,
  feeRegisterRoute,
  feeReceiptsRoute,
  feeHistoryRoute,
  feeReportsRoute,
  feeConcessionRoute,
  feeDefaultersRoute,
  superAdminControlRoute,
  teachersRoute,
  teacherProfileRoute,
  examScheduleRoute,
  hallTicketsRoute,
  resultsRoute,
  smsComposeRoute,
  smsHistoryRoute,
  admissionsAllRoute,
  admissionsNewRoute,
  admissionsReportsRoute,
  // Accounts
  accountsOverviewRoute,
  accountsLedgerRoute,
  accountsJournalRoute,
  balanceSheetRoute,
  incomeExpenseRoute,
  // Payroll
  payrollOverviewRoute,
  staffSalaryRoute,
  payrollProcessRoute,
  payslipsRoute,
  payrollReportsRoute,
  // Payments
  paymentsOverviewRoute,
  paymentsReceivedRoute,
  paymentsPendingRoute,
  paymentVouchersRoute,
  paymentModesRoute,
  // Billing
  billingInvoicesRoute,
  billingCreateRoute,
  billingRecurringRoute,
  billingReportsRoute,
  // HR
  hrOverviewRoute,
  hrEmployeesRoute,
  hrRecruitmentRoute,
  hrLeavesRoute,
  hrPerformanceRoute,
  hrDocumentsRoute,
  hrPoliciesRoute,
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
