import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Loader2,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
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
import Sidebar from "../components/Sidebar";
import {
  useCallerUserProfile,
  useDashboardStats,
  useLogout,
} from "../hooks/useQueries";

// ── AnimatedCounter ───────────────────────────────────────────────────────────

function AnimatedCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1000;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return <>{display}</>;
}

// ── Live Clock ────────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString("en-IN", { hour12: false });
  });

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="text-white font-mono text-sm tabular-nums tracking-wider">
      {time}
    </span>
  );
}

// ── Time-based greeting ───────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning! Have a productive day.";
  if (h >= 12 && h < 18) return "Good afternoon! Keep up the great work.";
  return "Good evening! Review today's progress.";
}

// ── Chart data ────────────────────────────────────────────────────────────────

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
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
    >
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-800">
          School Composition Overview
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Distribution of all members across categories
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
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

// ── Recent Activity Feed data ─────────────────────────────────────────────────

const ACTIVITY_FEED = [
  {
    type: "admission",
    text: "New student Riya Patel admitted to Grade 7",
    time: "2 min ago",
    Icon: GraduationCap,
    color: "blue",
    bg: "bg-blue-50",
    fg: "text-blue-600",
  },
  {
    type: "fee",
    text: "Fee payment received from Arjun Kumar – ₹12,500",
    time: "15 min ago",
    Icon: CreditCard,
    color: "green",
    bg: "bg-green-50",
    fg: "text-green-600",
  },
  {
    type: "attendance",
    text: "Attendance marked for Grade 5 – Section A",
    time: "1 hr ago",
    Icon: CalendarCheck,
    color: "amber",
    bg: "bg-amber-50",
    fg: "text-amber-600",
  },
  {
    type: "admission",
    text: "New student Dev Sharma admitted to Grade 9",
    time: "3 hrs ago",
    Icon: GraduationCap,
    color: "blue",
    bg: "bg-blue-50",
    fg: "text-blue-600",
  },
  {
    type: "fee",
    text: "Fee payment received from Meena Reddy – ₹8,200",
    time: "5 hrs ago",
    Icon: CreditCard,
    color: "green",
    bg: "bg-green-50",
    fg: "text-green-600",
  },
  {
    type: "exam",
    text: "Exam schedule published for Grade 10",
    time: "Yesterday",
    Icon: BookOpenCheck,
    color: "purple",
    bg: "bg-purple-50",
    fg: "text-purple-600",
  },
];

// ── Attendance Ring (SVG donut) ────────────────────────────────────────────────

function AttendanceRing({ pct }: { pct: number }) {
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOffset(circ * (1 - pct / 100));
    }, 100);
    return () => clearTimeout(timeout);
  }, [pct, circ]);

  return (
    <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* track */}
        <circle
          cx={48}
          cy={48}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={10}
        />
        {/* progress */}
        <circle
          cx={48}
          cy={48}
          r={radius}
          fill="none"
          stroke="#10B981"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-800">{pct}%</span>
      </div>
    </div>
  );
}

// ── Grades color helper ───────────────────────────────────────────────────────

function gradeColor(grade: string) {
  if (grade === "A+") return "text-green-700 bg-green-50 border-green-200";
  if (grade === "A") return "text-blue-700 bg-blue-50 border-blue-200";
  if (grade === "B+") return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-gray-700 bg-gray-50 border-gray-200";
}

// ── Shared sub-components ─────────────────────────────────────────────────────

const GRADES_DATA = [
  { subject: "Maths", test: "Unit Test 3", marks: "47/50", grade: "A+" },
  { subject: "Science", test: "Lab Exam", marks: "38/40", grade: "A+" },
  { subject: "English", test: "Essay", marks: "18/20", grade: "A" },
  { subject: "History", test: "Quiz", marks: "15/20", grade: "B+" },
];

const SCHEDULE_DATA = [
  { time: "8:00 AM", subject: "Mathematics", teacher: "Mr. Sharma" },
  { time: "9:00 AM", subject: "Science", teacher: "Ms. Patel" },
  { time: "10:00 AM", subject: "English", teacher: "Mrs. Kumar" },
  { time: "11:00 AM", subject: "History", teacher: "Mr. Verma" },
  { time: "12:00 PM", subject: "Physical Ed", teacher: "Mr. Singh" },
];

// Days remaining from today (Mar 07 2026) hard-coded for demo
const EXAM_LIST = [
  { subject: "Maths Final", date: "Mar 12, 2026", daysLeft: 5 },
  { subject: "Science Final", date: "Mar 14, 2026", daysLeft: 7 },
  { subject: "English Final", date: "Mar 16, 2026", daysLeft: 9 },
];

const FEE_HISTORY = [
  { term: "Term 1", period: "Jan 2026", amount: "₹14,500", status: "Paid" },
  {
    term: "Term 2",
    period: "Apr 2026",
    amount: "₹14,500",
    status: "Upcoming",
  },
  {
    term: "Term 3",
    period: "Aug 2026",
    amount: "₹14,500",
    status: "Upcoming",
  },
];

// ── Quick Actions ─────────────────────────────────────────────────────────────

function QuickActionsPanel() {
  const actions = [
    {
      label: "Add Student",
      Icon: Users,
      bg: "bg-blue-50 hover:bg-blue-100",
      fg: "text-blue-700",
      ocid: "dashboard.add_student.button",
    },
    {
      label: "Mark Attendance",
      Icon: CalendarCheck,
      bg: "bg-green-50 hover:bg-green-100",
      fg: "text-green-700",
      ocid: "dashboard.mark_attendance.button",
    },
    {
      label: "View Reports",
      Icon: BarChart2,
      bg: "bg-purple-50 hover:bg-purple-100",
      fg: "text-purple-700",
      ocid: "dashboard.view_reports.button",
    },
    {
      label: "Fee Collection",
      Icon: CreditCard,
      bg: "bg-amber-50 hover:bg-amber-100",
      fg: "text-amber-700",
      ocid: "dashboard.fee_collection.button",
    },
  ];

  return (
    <motion.div
      data-ocid="dashboard.quick_actions.panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.28 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ label, Icon, bg, fg, ocid }) => (
          <motion.button
            key={label}
            data-ocid={ocid}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl ${bg} transition-colors cursor-pointer`}
          >
            <Icon className={`w-6 h-6 ${fg}`} />
            <span className={`text-xs font-semibold ${fg}`}>{label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Recent Activity Feed ──────────────────────────────────────────────────────

function RecentActivityPanel() {
  return (
    <motion.div
      data-ocid="dashboard.activity_feed.panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.32 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
        Recent Activity
      </h2>
      <div className="max-h-64 overflow-y-auto space-y-0 pr-1">
        {ACTIVITY_FEED.map((item, idx) => (
          <div key={item.text}>
            <div className="flex items-start gap-3 py-2.5">
              <div
                className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
              >
                <item.Icon className={`w-4 h-4 ${item.fg}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 leading-relaxed">
                  {item.text}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
              </div>
            </div>
            {idx < ACTIVITY_FEED.length - 1 && (
              <div className="border-t border-gray-50" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Charts row (attendance + fee) ─────────────────────────────────────────────

function ChartsRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
      {/* Attendance Bar Chart */}
      <motion.div
        data-ocid="dashboard.attendance_chart.panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Weekly Attendance Trend
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Percentage of students present each day
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
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Fee Collection Area Chart */}
      <motion.div
        data-ocid="dashboard.fee_chart.panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Monthly Fee Collection (₹)
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Total fees collected per month
          </p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={FEE_DATA}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="feeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
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
              fill="url(#feeGradient)"
              dot={{ r: 3, fill: "#10B981", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#10B981" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

// ── Admin & SuperAdmin shared panel content ───────────────────────────────────

function AdminPanelContent({
  stats,
  statsLoading,
  isSuperAdmin,
}: {
  stats: { totalStudents: bigint; totalTeachers: bigint } | undefined;
  statsLoading: boolean;
  isSuperAdmin: boolean;
}) {
  const navigate = useNavigate();
  const studentCount = Number(stats?.totalStudents ?? 0);
  const teacherCount = Number(stats?.totalTeachers ?? 0);

  return (
    <>
      {/* ── 4-col stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Students */}
        <motion.div
          data-ocid="dashboard.stats.students_card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Students
            </div>
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
            ) : (
              <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
                <AnimatedCounter target={studentCount} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Teachers */}
        <motion.div
          data-ocid="dashboard.stats.teachers_card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.09 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Teachers
            </div>
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
            ) : (
              <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
                <AnimatedCounter target={teacherCount} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Active Classes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.13 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Classes
            </div>
            <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
              <AnimatedCounter target={24} />
            </div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
        </motion.div>

        {/* Pending Fees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.17 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Pending Fees
            </div>
            <div className="text-3xl font-bold text-amber-600 leading-none mt-1">
              <AnimatedCounter target={18} />
            </div>
            <div className="text-xs text-gray-400">Overdue</div>
          </div>
        </motion.div>
      </div>

      {/* ── Charts row ── */}
      <ChartsRow />

      {/* ── Quick Actions + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <QuickActionsPanel />
        <RecentActivityPanel />
      </div>

      {/* ── School Composition ── */}
      <SchoolCompositionChart />

      {/* ── Info box ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.55 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        {isSuperAdmin ? (
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
                  { label: "User Management", to: "/user-management" },
                  { label: "System Settings", to: "/system-settings" },
                  { label: "Reports", to: "/reports" },
                  { label: "Audit Logs", to: "/dashboard" },
                ].map((chip) => (
                  <button
                    type="button"
                    key={chip.label}
                    onClick={() => navigate({ to: chip.to })}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
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
        )}
      </motion.div>
    </>
  );
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
    <AdminPanelContent
      stats={stats}
      statsLoading={statsLoading}
      isSuperAdmin={true}
    />
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
    <AdminPanelContent
      stats={stats}
      statsLoading={statsLoading}
      isSuperAdmin={false}
    />
  );
}

// ── Parent panel ──────────────────────────────────────────────────────────────

function ParentPanel() {
  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 col-span-1 sm:col-span-2 lg:col-span-1 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <AttendanceRing pct={92} />
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Attendance
            </div>
            <div className="text-xs text-gray-400 mt-1">This month</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
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

      {/* Child's Marks + Upcoming Exams + Fee History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Recent Marks */}
        <motion.div
          data-ocid="dashboard.parent_marks.panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
            Child's Recent Marks
          </h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-100">
                <th className="pb-2 font-semibold">Subject</th>
                <th className="pb-2 font-semibold">Test</th>
                <th className="pb-2 font-semibold">Marks</th>
                <th className="pb-2 font-semibold">Grade</th>
              </tr>
            </thead>
            <tbody>
              {GRADES_DATA.map((row) => (
                <tr
                  key={`${row.subject}-${row.test}`}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 font-medium text-gray-700">
                    {row.subject}
                  </td>
                  <td className="py-2 text-gray-500">{row.test}</td>
                  <td className="py-2 text-gray-700">{row.marks}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${gradeColor(row.grade)}`}
                    >
                      {row.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Upcoming Exams */}
        <motion.div
          data-ocid="dashboard.parent_exams.panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
            Upcoming Exams
          </h2>
          <div className="space-y-3">
            {EXAM_LIST.map((exam) => (
              <div
                key={exam.subject}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {exam.subject}
                  </div>
                  <div className="text-xs text-gray-400">{exam.date}</div>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                  {exam.daysLeft}d left
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Fee Payment History */}
      <motion.div
        data-ocid="dashboard.parent_fees.panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.26 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
      >
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
          Fee Payment History
        </h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-100" />
          <div className="space-y-4">
            {FEE_HISTORY.map((fee) => (
              <div
                key={fee.term}
                className="flex items-start gap-4 pl-9 relative"
              >
                <div
                  className={`absolute left-0 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    fee.status === "Paid" ? "bg-green-100" : "bg-amber-100"
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      fee.status === "Paid" ? "bg-green-500" : "bg-amber-400"
                    }`}
                  />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {fee.term}
                    </div>
                    <div className="text-xs text-gray-400">{fee.period}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-700">
                      {fee.amount}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        fee.status === "Paid"
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {fee.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Parent portal info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
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
      {/* Stat cards with attendance ring */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Attendance ring card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <AttendanceRing pct={92} />
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Attendance
            </div>
            <div className="text-xs text-gray-400 mt-1">This month</div>
          </div>
        </motion.div>

        {/* Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Assignments
            </div>
            <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
              <AnimatedCounter target={3} />
            </div>
            <div className="text-xs text-gray-400">Pending</div>
          </div>
        </motion.div>

        {/* Tests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <BookOpenCheck className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Tests
            </div>
            <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
              <AnimatedCounter target={2} />
            </div>
            <div className="text-xs text-gray-400">This week</div>
          </div>
        </motion.div>
      </div>

      {/* Schedule + Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Today's Schedule */}
        <motion.div
          data-ocid="dashboard.student_schedule.panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
            Today's Schedule
          </h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-100">
                <th className="pb-2 font-semibold">Time</th>
                <th className="pb-2 font-semibold">Subject</th>
                <th className="pb-2 font-semibold">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULE_DATA.map((row) => (
                <tr
                  key={row.time}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 font-mono text-gray-500">{row.time}</td>
                  <td className="py-2 font-semibold text-gray-800">
                    {row.subject}
                  </td>
                  <td className="py-2 text-gray-500">{row.teacher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Recent Grades */}
        <motion.div
          data-ocid="dashboard.student_grades.panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
            Recent Grades
          </h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-100">
                <th className="pb-2 font-semibold">Subject</th>
                <th className="pb-2 font-semibold">Test</th>
                <th className="pb-2 font-semibold">Marks</th>
                <th className="pb-2 font-semibold">Grade</th>
              </tr>
            </thead>
            <tbody>
              {GRADES_DATA.map((row) => (
                <tr
                  key={`student-${row.subject}-${row.test}`}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 font-medium text-gray-700">
                    {row.subject}
                  </td>
                  <td className="py-2 text-gray-500">{row.test}</td>
                  <td className="py-2 text-gray-700">{row.marks}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${gradeColor(row.grade)}`}
                    >
                      {row.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Student portal info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.26 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
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

// ── Notification bell with badge ──────────────────────────────────────────────

function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        data-ocid="dashboard.notification_bell.button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white" />
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
          3
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-800">
                Notifications
              </span>
              <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                3
              </span>
            </div>
            {[
              {
                text: "New admission: Riya Patel – Grade 7",
                time: "2 min ago",
                dot: "bg-blue-400",
              },
              {
                text: "Fee payment received – Arjun Kumar ₹12,500",
                time: "15 min ago",
                dot: "bg-green-400",
              },
              {
                text: "Exam schedule published for Grade 10",
                time: "1 hr ago",
                dot: "bg-purple-400",
              },
            ].map((n) => (
              <div
                key={n.text}
                className="px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-0 cursor-pointer"
              >
                <span
                  className={`w-2 h-2 rounded-full ${n.dot} mt-1.5 flex-shrink-0`}
                />
                <div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {n.text}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("cymi_token");

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
  const greeting = getGreeting();

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

          {/* Right: clock + bell + user info */}
          <div className="flex items-center gap-4">
            {/* Live clock */}
            <LiveClock />

            {/* Notification bell */}
            <NotificationBell />

            {/* User info */}
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
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-gray-500 text-sm">{greeting}</span>
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
