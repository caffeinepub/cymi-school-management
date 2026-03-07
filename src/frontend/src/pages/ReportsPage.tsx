import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  Download,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import {
  Area,
  AreaChart,
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
import Sidebar from "../components/Sidebar";
import { useCallerUserProfile, useLogout } from "../hooks/useQueries";

// ── Chart Data ────────────────────────────────────────────────────────────────

const ATTENDANCE_DATA = [
  { day: "Mon", attendance: 94 },
  { day: "Tue", attendance: 87 },
  { day: "Wed", attendance: 91 },
  { day: "Thu", attendance: 96 },
  { day: "Fri", attendance: 89 },
];

const FEE_DATA = [
  { month: "Jan", collected: 240000 },
  { month: "Feb", collected: 185000 },
  { month: "Mar", collected: 320000 },
  { month: "Apr", collected: 290000 },
  { month: "May", collected: 210000 },
  { month: "Jun", collected: 350000 },
  { month: "Jul", collected: 275000 },
  { month: "Aug", collected: 300000 },
  { month: "Sep", collected: 260000 },
  { month: "Oct", collected: 330000 },
  { month: "Nov", collected: 195000 },
  { month: "Dec", collected: 280000 },
];

const ENROLLMENT_DATA = [
  { name: "Grade 1–5", value: 35, color: "#3B82F6" },
  { name: "Grade 6–8", value: 28, color: "#10B981" },
  { name: "Grade 9–10", value: 22, color: "#8B5CF6" },
  { name: "Grade 11–12", value: 15, color: "#F59E0B" },
];

// ── Summary Card ──────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
  fg: string;
  delay: number;
  ocid: string;
}

function SummaryCard({
  label,
  value,
  icon,
  bg,
  fg,
  delay,
  ocid,
}: SummaryCardProps) {
  return (
    <motion.div
      data-ocid={ocid}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
    >
      <div
        className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}
      >
        <span className={fg}>{icon}</span>
      </div>
      <div>
        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {label}
        </div>
        <div className="text-2xl font-bold text-gray-800 leading-none mt-1">
          {value}
        </div>
      </div>
    </motion.div>
  );
}

// ── Custom Tooltips ───────────────────────────────────────────────────────────

interface FeeTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function FeeTooltip({ active, payload, label }: FeeTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <div className="font-semibold text-gray-800 mb-1">{label}</div>
      <div className="text-gray-500">
        Collected:{" "}
        <span className="font-medium text-green-700">
          ₹{payload[0].value.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}

interface EnrollTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { color: string };
  }>;
}

function EnrollTooltip({ active, payload }: EnrollTooltipProps) {
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
        Share: <span className="font-medium text-gray-700">{item.value}%</span>
      </div>
    </div>
  );
}

// ── Pie label renderer ────────────────────────────────────────────────────────

const RADIAN = Math.PI / 180;

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
}

function renderLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
}: LabelProps) {
  if (value < 8) return null;
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("cymi_token");

  useEffect(() => {
    if (!token) navigate({ to: "/" });
  }, [token, navigate]);

  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const role = (profile?.schoolRole as string) ?? "";

  useEffect(() => {
    if (!profileLoading && role && role !== "SuperAdmin" && role !== "Admin") {
      navigate({ to: "/dashboard" });
    }
  }, [role, profileLoading, navigate]);

  const handleLogout = async () => {
    if (token) {
      try {
        await logoutMutation.mutateAsync(token);
      } catch {
        // ignore
      }
    }
    localStorage.removeItem("cymi_token");
    localStorage.removeItem("cymi_profile");
    navigate({ to: "/" });
  };

  const userName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "User";

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Navbar ── */}
        <nav
          className="navbar-cymi flex items-center justify-between px-4 py-2 shadow-md z-10 flex-shrink-0"
          style={{ minHeight: 56 }}
        >
          <div className="flex items-center gap-3">
            <BarChart2 className="w-5 h-5 text-white/80" />
            <span className="text-white font-semibold text-base tracking-wide hidden sm:inline">
              Reports & Analytics
            </span>
            <span className="text-white font-semibold text-sm tracking-wide sm:hidden">
              Reports
            </span>
          </div>
          <div className="flex items-center gap-4">
            {profileLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white/70" />
            ) : profile ? (
              <div className="text-right hidden sm:block">
                <div className="text-white text-sm font-semibold leading-tight">
                  {profile.firstName} {profile.lastName}
                </div>
                <div className="text-white/70 text-xs">{role}</div>
              </div>
            ) : null}
            <button
              type="button"
              data-ocid="reports.notification.button"
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="overflow-y-auto flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {/* ── Header row ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Reports & Analytics
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Overview of attendance, fee collection, and enrollment data
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Date range display inputs */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600">
                  <span>From:</span>
                  <input
                    data-ocid="reports.date_from.input"
                    type="date"
                    defaultValue="2026-01-01"
                    className="border-none outline-none bg-transparent text-sm text-gray-700 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600">
                  <span>To:</span>
                  <input
                    data-ocid="reports.date_to.input"
                    type="date"
                    defaultValue="2026-12-31"
                    className="border-none outline-none bg-transparent text-sm text-gray-700 cursor-pointer"
                  />
                </div>
                <Button
                  data-ocid="reports.export.button"
                  onClick={() =>
                    toast.info("Export feature coming soon.", {
                      description:
                        "PDF and Excel export will be available in the next release.",
                    })
                  }
                  variant="outline"
                  className="flex items-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </div>
            </motion.div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <SummaryCard
                ocid="reports.stats.students_card"
                label="Total Students"
                value="520"
                icon={<Users className="w-6 h-6" />}
                bg="bg-blue-50"
                fg="text-blue-500"
                delay={0.05}
              />
              <SummaryCard
                ocid="reports.stats.teachers_card"
                label="Total Teachers"
                value="160"
                icon={<Users className="w-6 h-6" />}
                bg="bg-green-50"
                fg="text-green-600"
                delay={0.09}
              />
              <SummaryCard
                ocid="reports.stats.attendance_card"
                label="Avg Attendance"
                value="91%"
                icon={<TrendingUp className="w-6 h-6" />}
                bg="bg-purple-50"
                fg="text-purple-500"
                delay={0.13}
              />
              <SummaryCard
                ocid="reports.stats.fees_card"
                label="Fee Collected"
                value="₹32.4L"
                icon={<BarChart2 className="w-6 h-6" />}
                bg="bg-amber-50"
                fg="text-amber-500"
                delay={0.17}
              />
            </div>

            {/* ── Attendance Bar Chart ── */}
            <motion.div
              data-ocid="reports.attendance_chart.panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5"
            >
              <div className="mb-4">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Attendance Report
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Weekly attendance percentage across all grades
                </p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={ATTENDANCE_DATA}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v}%`, "Attendance"]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="attendance"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={56}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* ── Fee Collection Area Chart ── */}
            <motion.div
              data-ocid="reports.fee_chart.panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5"
            >
              <div className="mb-4">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Fee Collection Report
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Monthly fee collection totals (₹)
                </p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={FEE_DATA}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="reportFeeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10B981"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10B981"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                    }
                    width={48}
                  />
                  <Tooltip content={<FeeTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fill="url(#reportFeeGradient)"
                    dot={{ r: 3, fill: "#10B981", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#10B981" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* ── Enrollment Pie Chart ── */}
            <motion.div
              data-ocid="reports.enrollment_chart.panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="mb-4">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Student Enrollment by Grade
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Distribution of students across grade groups
                </p>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-full lg:w-auto flex-shrink-0">
                  <ResponsiveContainer
                    width="100%"
                    height={260}
                    className="lg:!w-[280px]"
                  >
                    <PieChart>
                      <Pie
                        data={ENROLLMENT_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                        isAnimationActive={true}
                        animationBegin={200}
                        animationDuration={900}
                        label={renderLabel}
                        labelLine={false}
                      >
                        {ENROLLMENT_DATA.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<EnrollTooltip />} />
                      <Legend
                        iconType="circle"
                        iconSize={10}
                        formatter={(value) => (
                          <span className="text-xs text-gray-600">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ENROLLMENT_DATA.map((item) => (
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
                          {Math.round((item.value / 100) * 520)} students
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
            </motion.div>
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
