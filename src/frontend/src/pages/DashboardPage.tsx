import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  Loader2,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Sidebar from "../components/Sidebar";
import {
  useCallerUserProfile,
  useDashboardStats,
  useLogout,
} from "../hooks/useQueries";

// ── School Composition Chart ──────────────────────────────────────────────────

const COMPOSITION_DATA = [
  { name: "Students", value: 65, count: 520, color: "#3B82F6" },
  { name: "Teachers", value: 20, count: 160, color: "#10B981" },
  { name: "Staff", value: 10, count: 80, color: "#8B5CF6" },
  { name: "Parents", value: 3, count: 24, color: "#F59E0B" },
  { name: "Others", value: 2, count: 16, color: "#6B7280" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { count: number; color: string };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: item.payload.color }}
        />
        <span className="font-semibold text-gray-800">{item.name}</span>
      </div>
      <div className="text-gray-500">
        Count:{" "}
        <span className="font-medium text-gray-700">{item.payload.count}</span>
      </div>
      <div className="text-gray-500">
        Share: <span className="font-medium text-gray-700">{item.value}%</span>
      </div>
    </div>
  );
}

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
}

const RADIAN = Math.PI / 180;

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
}: LabelProps) {
  if (value < 5) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${value}%`}
    </text>
  );
}

function SchoolCompositionChart() {
  return (
    <motion.div
      data-ocid="dashboard.chart.panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8"
    >
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-800">
          School Composition Overview
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Distribution of all members across categories
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="w-full lg:w-auto flex-shrink-0">
          <ResponsiveContainer
            data-ocid="dashboard.chart.canvas_target"
            width="100%"
            height={260}
            className="lg:!w-[280px]"
          >
            <PieChart>
              <Pie
                data={COMPOSITION_DATA}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={true}
                animationBegin={200}
                animationDuration={900}
                label={renderCustomLabel}
                labelLine={false}
              >
                {COMPOSITION_DATA.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {COMPOSITION_DATA.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5 hover:bg-gray-100 transition-colors"
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-700 truncate">
                  {item.name}
                </div>
                <div className="text-xs text-gray-400">
                  {item.count} members
                </div>
              </div>
              <div
                className="text-sm font-bold flex-shrink-0"
                style={{ color: item.color }}
              >
                {item.value}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total count footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Total members across all categories
        </span>
        <span className="text-sm font-bold text-gray-700">
          {COMPOSITION_DATA.reduce((s, d) => s + d.count, 0)} members
        </span>
      </div>
    </motion.div>
  );
}

// ── Role-specific badge colours ───────────────────────────────────────────────

function roleBadgeColor(role: string) {
  switch (role) {
    case "SuperAdmin":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "Admin":
      return "bg-red-100 text-red-700 border-red-200";
    case "Parent":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Student":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function roleDisplayName(role: string) {
  switch (role) {
    case "SuperAdmin":
      return "Super Admin";
    default:
      return role;
  }
}

// ── Super Admin panel ─────────────────────────────────────────────────────────

function SuperAdminPanel({
  stats,
  statsLoading,
}: {
  stats: { totalStudents: bigint; totalTeachers: bigint } | undefined;
  statsLoading: boolean;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* Students Card */}
        <motion.div
          data-ocid="dashboard.stats.students_card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Total Students
            </div>
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
            ) : (
              <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
                {stats?.totalStudents?.toString() ?? "0"}
              </div>
            )}
          </div>
        </motion.div>

        {/* Teachers Card */}
        <motion.div
          data-ocid="dashboard.stats.teachers_card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Total Teachers
            </div>
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
            ) : (
              <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
                {stats?.totalTeachers?.toString() ?? "0"}
              </div>
            )}
          </div>
        </motion.div>

        {/* System Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Access Level
            </div>
            <div className="text-sm font-semibold text-indigo-700 mt-1">
              Super Admin
            </div>
            <div className="text-xs text-gray-400">Full Access</div>
          </div>
        </motion.div>
      </div>

      {/* School Composition Chart */}
      <SchoolCompositionChart />

      {/* Admin info box */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Settings className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Super Admin Panel
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              You have full system access. Manage all users, configure system
              settings, generate reports, and review audit logs.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "User Management",
                "System Settings",
                "Reports",
                "Audit Logs",
              ].map((chip) => (
                <span
                  key={chip}
                  className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium border border-indigo-100"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Admin panel ───────────────────────────────────────────────────────────────

function AdminPanel({
  stats,
  statsLoading,
}: {
  stats: { totalStudents: bigint; totalTeachers: bigint } | undefined;
  statsLoading: boolean;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <motion.div
          data-ocid="dashboard.stats.students_card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Total Students
            </div>
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
            ) : (
              <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
                {stats?.totalStudents?.toString() ?? "0"}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          data-ocid="dashboard.stats.teachers_card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Total Teachers
            </div>
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
            ) : (
              <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
                {stats?.totalTeachers?.toString() ?? "0"}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              System
            </div>
            <div className="text-sm font-semibold text-gray-700 mt-1 leading-tight">
              CYMI SMS
            </div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
        </motion.div>
      </div>

      {/* School Composition Chart */}
      <SchoolCompositionChart />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-start gap-4">
          <img
            src="/assets/generated/cymi-logo-transparent.dim_200x200.png"
            alt="CYMI"
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
          />
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              CYMI School Management System – Dashboard
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Welcome to the Christ Youth Mission Institute management portal.
              Use this system to manage student records, teacher assignments,
              and school operations efficiently.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "Student Records", color: "blue" },
                { label: "Teacher Management", color: "green" },
                { label: "Attendance", color: "amber" },
                { label: "Reports", color: "purple" },
              ].map(({ label, color }) => (
                <span
                  key={label}
                  className={`px-2.5 py-1 bg-${color}-50 text-${color}-700 text-xs rounded-full font-medium border border-${color}-100`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Parent panel ──────────────────────────────────────────────────────────────

function ParentPanel() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* My Child Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 col-span-1 sm:col-span-2 lg:col-span-1 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              My Child
            </div>
          </div>
          <div className="text-base font-bold text-gray-800">Alice Brown</div>
          <div className="text-sm text-gray-500 mt-0.5">
            Grade 5 – Section A
          </div>
        </motion.div>

        {/* Attendance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Attendance
            </div>
            <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
              92%
            </div>
            <div className="text-xs text-gray-400">This month</div>
          </div>
        </motion.div>

        {/* Fee Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Fee Status
            </div>
            <div className="text-sm font-semibold text-green-600 mt-1">
              Paid
            </div>
            <div className="text-xs text-gray-400">Term 2 – 2026</div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Parent Portal</h2>
            <p className="text-sm text-gray-500 mt-1">
              Stay connected with your child's academic journey. Track
              attendance, fees, timetable, and communicate with teachers.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Attendance", "Fee Status", "Timetable", "Communication"].map(
                (chip) => (
                  <span
                    key={chip}
                    className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-full font-medium border border-amber-100"
                  >
                    {chip}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Student panel ─────────────────────────────────────────────────────────────

function StudentPanel() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* Attendance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Attendance
            </div>
            <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
              92%
            </div>
            <div className="text-xs text-gray-400">This month</div>
          </div>
        </motion.div>

        {/* Assignments Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Assignments
            </div>
            <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
              3
            </div>
            <div className="text-xs text-gray-400">Pending</div>
          </div>
        </motion.div>

        {/* Upcoming Tests Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
            <BookOpenCheck className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Upcoming Tests
            </div>
            <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
              2
            </div>
            <div className="text-xs text-gray-400">This week</div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Student Portal</h2>
            <p className="text-sm text-gray-500 mt-1">
              Access your timetable, submit homework, check results, and browse
              the digital library — all from one place.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Timetable", "Homework", "Results", "Library"].map((chip) => (
                <span
                  key={chip}
                  className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium border border-green-100"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("cymi_token");

  // Guard: redirect if no token
  useEffect(() => {
    if (!token) {
      navigate({ to: "/" });
    }
  }, [token, navigate]);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    if (token) {
      try {
        await logoutMutation.mutateAsync(token);
      } catch {
        // ignore logout errors — still clear local state
      }
    }
    localStorage.removeItem("cymi_token");
    localStorage.removeItem("cymi_profile");
    navigate({ to: "/" });
  };

  const role = (profile?.schoolRole as string) ?? "";

  const renderDashboardContent = () => {
    switch (role) {
      case "SuperAdmin":
        return <SuperAdminPanel stats={stats} statsLoading={statsLoading} />;
      case "Admin":
        return <AdminPanel stats={stats} statsLoading={statsLoading} />;
      case "Parent":
        return <ParentPanel />;
      case "Student":
        return <StudentPanel />;
      default:
        return <AdminPanel stats={stats} statsLoading={statsLoading} />;
    }
  };

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar ── */}
      <Sidebar
        role={role}
        userName={
          profile ? `${profile.firstName} ${profile.lastName}`.trim() : "User"
        }
        onLogout={handleLogout}
      />

      {/* ── Right column: navbar + main + footer ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Top Navbar ── */}
        <nav
          className="navbar-cymi flex items-center justify-between px-4 py-2 shadow-md z-10 flex-shrink-0"
          style={{ minHeight: 56 }}
        >
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold text-base tracking-wide hidden sm:inline">
              CYMI – Christ Youth Mission Institute
            </span>
            <span className="text-white font-semibold text-sm tracking-wide sm:hidden">
              CYMI
            </span>
          </div>

          {/* Right: User info */}
          <div className="flex items-center gap-3">
            {profileLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white/70" />
            ) : profile ? (
              <div className="text-right hidden sm:block">
                <div className="text-white text-sm font-semibold leading-tight">
                  {profile.firstName} {profile.lastName}
                </div>
                <div className="text-white/70 text-xs">
                  {roleDisplayName(role)}
                </div>
              </div>
            ) : null}
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="overflow-y-auto flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {/* Welcome heading */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {profile?.firstName ?? "User"}!
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-500 text-sm">
                  CYMI School Management System
                </span>
                {role && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeColor(role)}`}
                  >
                    {roleDisplayName(role)}
                  </span>
                )}
              </div>
            </motion.div>

            {/* ── Role-specific content ── */}
            {renderDashboardContent()}
          </div>
        </main>

        {/* ── Footer ── */}
        <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-400 flex-shrink-0">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Built with ♥ using caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
