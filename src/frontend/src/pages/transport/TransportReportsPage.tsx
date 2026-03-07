import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import {
  Bus,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Route,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import {
  DRIVERS,
  ROUTES,
  STUDENT_ASSIGNMENTS,
  VEHICLES,
} from "../../data/transportation";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  icon,
  bg,
  fg,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  bg: string;
  fg: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div
          className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}
        >
          <span className={fg}>{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Chart data ───────────────────────────────────────────────────────────────

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransportReportsPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (!profileLoading && !profile) navigate({ to: "/login" });
  }, [profile, profileLoading, navigate]);

  async function handleLogout() {
    await logoutMutation.mutateAsync("token");
    navigate({ to: "/login" });
  }

  // ── Derived data ──
  const studentsPerRoute = useMemo(
    () =>
      ROUTES.map((r) => ({
        name: r.routeNumber,
        students: r.totalStudents,
        route: r.routeName,
      })),
    [],
  );

  const vehicleStatusData = useMemo(() => {
    const counts: Record<string, number> = {
      Active: 0,
      Maintenance: 0,
      Inactive: 0,
    };
    for (const v of VEHICLES) counts[v.status]++;
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const driverExpData = useMemo(() => {
    const buckets: Record<string, number> = {
      "0-5 yrs": 0,
      "6-10 yrs": 0,
      "11-15 yrs": 0,
      "16+ yrs": 0,
    };
    for (const d of DRIVERS) {
      if (d.experience <= 5) buckets["0-5 yrs"]++;
      else if (d.experience <= 10) buckets["6-10 yrs"]++;
      else if (d.experience <= 15) buckets["11-15 yrs"]++;
      else buckets["16+ yrs"]++;
    }
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, []);

  const routeSummary = useMemo(
    () =>
      ROUTES.map((r) => {
        const vehicle = VEHICLES[r.id - 1] ?? VEHICLES[0];
        const driver = DRIVERS.find((d) => d.assignedVehicleId === vehicle.id);
        const utilization = Math.round(
          (r.totalStudents / vehicle.capacity) * 100,
        );
        return {
          routeNo: r.routeNumber,
          routeName: r.routeName,
          bus: vehicle.busNumber,
          driver: driver?.name ?? "—",
          students: r.totalStudents,
          capacity: vehicle.capacity,
          utilization,
          status: r.status,
        };
      }),
    [],
  );

  const summaryStats = useMemo(() => {
    const totalRidership = ROUTES.reduce((s, r) => s + r.totalStudents, 0);
    const activeRoutes = ROUTES.filter((r) => r.status === "Active").length;
    const utilPct = Math.round((totalRidership / (ROUTES.length * 45)) * 100);
    return {
      totalRidership,
      utilPct,
      activeVehicles: VEHICLES.filter((v) => v.status === "Active").length,
      activeDrivers: DRIVERS.filter((d) => d.status === "Active").length,
      activeRoutes,
    };
  }, []);

  // ── Export ──
  function handleExportExcel() {
    exportToExcel("transport-report", [
      {
        name: "Summary",
        rows: [
          { Metric: "Total Ridership", Value: summaryStats.totalRidership },
          { Metric: "Route Utilization %", Value: `${summaryStats.utilPct}%` },
          { Metric: "Active Vehicles", Value: summaryStats.activeVehicles },
          { Metric: "Active Drivers", Value: summaryStats.activeDrivers },
          { Metric: "Active Routes", Value: summaryStats.activeRoutes },
        ],
      },
      {
        name: "Routes",
        rows: ROUTES.map((r) => ({
          "Route No": r.routeNumber,
          "Route Name": r.routeName,
          Start: r.startPoint,
          End: r.endPoint,
          Stops: r.stops.length,
          "Distance (km)": r.distanceKm,
          Students: r.totalStudents,
          Status: r.status,
        })),
      },
      {
        name: "Vehicles",
        rows: VEHICLES.map((v) => ({
          "Bus No": v.busNumber,
          Model: v.model,
          Capacity: v.capacity,
          Fuel: v.fuelType,
          "Reg No": v.regNumber,
          Status: v.status,
          "Last Service": v.lastService,
        })),
      },
      {
        name: "Drivers",
        rows: DRIVERS.map((d) => ({
          Name: d.name,
          License: d.licenseNumber,
          Phone: d.phone,
          "Experience (yrs)": d.experience,
          Status: d.status,
          "Joining Date": d.joiningDate,
        })),
      },
    ]);
    toast.success("Excel report downloaded (4 sheets)");
  }

  function handleExportPDF() {
    exportToPDF(
      "transport-report",
      "CYMI — Transportation Report",
      [
        "Route No",
        "Route Name",
        "Bus",
        "Driver",
        "Students",
        "Capacity",
        "Utilization %",
        "Status",
      ],
      routeSummary.map((r) => [
        r.routeNo,
        r.routeName,
        r.bus,
        r.driver,
        r.students,
        r.capacity,
        `${r.utilization}%`,
        r.status,
      ]),
      `Generated ${new Date().toLocaleDateString("en-IN")} | Total Ridership: ${summaryStats.totalRidership} | Active Routes: ${summaryStats.activeRoutes}`,
    );
    toast.success("PDF report downloaded");
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="transport-reports.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading report...</p>
        </div>
      </div>
    );
  }

  const userName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : "User";
  const role = profile?.schoolRole ?? "Admin";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        role={String(role)}
        userName={userName}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" /> Transportation
                Reports
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Analytics and summary for transport operations
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-ocid="transport-reports.secondary_button"
                  variant="outline"
                  className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" /> Export Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  data-ocid="transport-reports.export.excel_button"
                  onClick={handleExportExcel}
                  className="gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" /> Export
                  Excel (4 sheets)
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="transport-reports.export.pdf_button"
                  onClick={handleExportPDF}
                  className="gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-red-500" /> Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard
              label="Total Ridership"
              value={String(summaryStats.totalRidership)}
              sub="Students daily"
              icon={<Users className="w-5 h-5" />}
              bg="bg-blue-50"
              fg="text-blue-600"
              delay={0.05}
            />
            <SummaryCard
              label="Route Utilization"
              value={`${summaryStats.utilPct}%`}
              sub="Avg capacity used"
              icon={<TrendingUp className="w-5 h-5" />}
              bg="bg-green-50"
              fg="text-green-600"
              delay={0.1}
            />
            <SummaryCard
              label="Active Vehicles"
              value={String(summaryStats.activeVehicles)}
              sub={`of ${VEHICLES.length} total`}
              icon={<Bus className="w-5 h-5" />}
              bg="bg-amber-50"
              fg="text-amber-600"
              delay={0.15}
            />
            <SummaryCard
              label="Active Drivers"
              value={String(summaryStats.activeDrivers)}
              sub={`of ${DRIVERS.length} total`}
              icon={<Route className="w-5 h-5" />}
              bg="bg-purple-50"
              fg="text-purple-600"
              delay={0.2}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Students per route */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Students per Route
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={studentsPerRoute}
                  margin={{ left: -10, right: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value, _name, props) => [
                      value,
                      props.payload?.route ?? "Students",
                    ]}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar
                    dataKey="students"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Vehicle status donut */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Vehicle Status
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={vehicleStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {vehicleStatusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Driver experience chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Driver Experience Distribution
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={driverExpData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="count"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  name="Drivers"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Route Summary Table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                Route-wise Summary
              </h3>
              <span className="text-xs text-gray-400">
                {routeSummary.length} routes
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table data-ocid="transport-reports.table">
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Route
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Vehicle
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Driver
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Students
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Capacity
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Utilization
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routeSummary.map((r, idx) => (
                    <TableRow
                      key={r.routeNo}
                      data-ocid={`transport-reports.row.${idx + 1}`}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <TableCell className="py-3 font-mono text-xs text-blue-700 font-semibold">
                        {r.routeNo}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-800 whitespace-nowrap">
                        {r.routeName}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-600 whitespace-nowrap">
                        {r.bus}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-700 whitespace-nowrap">
                        {r.driver}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-600">
                        {r.students}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-600">
                        {r.capacity}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
                            <div
                              className={`h-1.5 rounded-full ${r.utilization >= 80 ? "bg-red-400" : r.utilization >= 60 ? "bg-amber-400" : "bg-green-400"}`}
                              style={{
                                width: `${Math.min(r.utilization, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 w-8">
                            {r.utilization}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        {r.status === "Active" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>

          {/* Bottom spacer */}
          <div className="pb-4" />
        </div>
      </main>
    </div>
  );
}
