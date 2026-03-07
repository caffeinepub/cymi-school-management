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
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  TrendingDown,
  TrendingUp,
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
import Sidebar from "../../components/Sidebar";
import {
  CLASSWISE_FEE_SUMMARY,
  FEE_BY_CLASS_PIE,
  MONTHLY_COLLECTION,
  OUTSTANDING_TREND,
} from "../../data/fees";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

function fmt(n: number) {
  return `₹${(n / 100000).toFixed(1)}L`;
}

function fmtFull(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

const PIE_COLORS = [
  "#1e40af",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
  "#dbeafe",
  "#eff6ff",
];

// Custom tooltip for charts
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ₹{p.value.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
}

export default function FeeReportsPage() {
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

  function handleExportExcel() {
    exportToExcel("fee-reports", [
      {
        name: "Monthly Collection",
        rows: MONTHLY_COLLECTION.map((m) => ({
          Month: m.month,
          Collected: m.amount,
          Target: m.target,
          "Achievement %": Math.round((m.amount / m.target) * 100),
        })),
      },
      {
        name: "Class-wise Summary",
        rows: CLASSWISE_FEE_SUMMARY.map((c) => ({
          Class: c.class,
          Students: c.students,
          "Total Assessed": c.assessed,
          Collected: c.collected,
          Outstanding: c.outstanding,
          "Collection %": c.percentage,
        })),
      },
    ]);
    toast.success("Excel downloaded");
  }

  function handleExportPDF() {
    exportToPDF(
      "fee-reports",
      "CYMI — Fee Reports Summary",
      ["Class", "Students", "Assessed", "Collected", "Outstanding", "%"],
      CLASSWISE_FEE_SUMMARY.map((c) => [
        c.class,
        c.students,
        fmtFull(c.assessed),
        fmtFull(c.collected),
        fmtFull(c.outstanding),
        `${c.percentage}%`,
      ]),
      `Generated ${new Date().toLocaleDateString("en-IN")} | Total Collected: ₹4,25,00,000`,
    );
    toast.success("PDF downloaded");
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="fee-reports.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  const userName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : "User";
  const role = profile?.schoolRole ?? "Admin";

  const totalCollected = MONTHLY_COLLECTION.reduce((s, m) => s + m.amount, 0);
  const pending = 8750000;
  const overdue = 2300000;
  const collectionRate = 83;

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
                <TrendingUp className="w-5 h-5 text-blue-600" /> Fee Reports
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Analytics and reports on fee collection
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-ocid="fee-reports.secondary_button"
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  data-ocid="fee-reports.export.excel_button"
                  onClick={handleExportExcel}
                  className="gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" /> Export
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="fee-reports.export.pdf_button"
                  onClick={handleExportPDF}
                  className="gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-red-500" /> Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Total Collected",
                value: `₹${(totalCollected / 10000000).toFixed(2)}Cr`,
                trend: "+12%",
                positive: true,
                color: "text-green-600",
                bg: "bg-green-50",
                border: "border-green-100",
              },
              {
                label: "Pending",
                value: fmt(pending),
                trend: "-5%",
                positive: true,
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-100",
              },
              {
                label: "Overdue",
                value: fmt(overdue),
                trend: "+3%",
                positive: false,
                color: "text-red-600",
                bg: "bg-red-50",
                border: "border-red-100",
              },
              {
                label: "Collection Rate",
                value: `${collectionRate}%`,
                trend: "+2%",
                positive: true,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.05 }}
                className={`bg-white rounded-xl border ${s.border} p-4 shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold flex items-center gap-0.5 ${s.positive ? "text-green-600" : "text-red-500"}`}
                  >
                    {s.positive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {s.trend}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Monthly Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <h3 className="font-semibold text-gray-800 mb-4">
                Monthly Fee Collection (₹)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY_COLLECTION} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                  <Bar
                    dataKey="amount"
                    name="Collected"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="target"
                    name="Target"
                    fill="#bfdbfe"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <h3 className="font-semibold text-gray-800 mb-4">
                Collection by Class
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={FEE_BY_CLASS_PIE}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {FEE_BY_CLASS_PIE.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) =>
                      `₹${val.toLocaleString("en-IN")}`
                    }
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <h3 className="font-semibold text-gray-800 mb-4">
              Outstanding Dues Trend (₹)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={OUTSTANDING_TREND}>
                <defs>
                  <linearGradient
                    id="outstandingGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="outstanding"
                  name="Outstanding"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#outstandingGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Class-wise Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">
                Class-wise Fee Summary
              </h3>
            </div>
            <div className="overflow-x-auto">
              <Table data-ocid="fee-reports.table">
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-100">
                    {[
                      "Class",
                      "Students",
                      "Total Assessed",
                      "Collected",
                      "Outstanding",
                      "Collection %",
                      "Progress",
                    ].map((h) => (
                      <TableHead
                        key={h}
                        className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 whitespace-nowrap"
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CLASSWISE_FEE_SUMMARY.map((c, idx) => (
                    <TableRow
                      key={c.class}
                      data-ocid={`fee-reports.row.${idx + 1}`}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <TableCell className="py-3 font-semibold text-sm text-gray-800">
                        {c.class}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-600">
                        {c.students}
                      </TableCell>
                      <TableCell className="py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {fmtFull(c.assessed)}
                      </TableCell>
                      <TableCell className="py-3 text-sm font-medium text-green-700 whitespace-nowrap">
                        {fmtFull(c.collected)}
                      </TableCell>
                      <TableCell className="py-3 text-sm font-medium text-red-600 whitespace-nowrap">
                        {fmtFull(c.outstanding)}
                      </TableCell>
                      <TableCell className="py-3">
                        <span
                          className={`text-sm font-bold ${c.percentage >= 80 ? "text-green-600" : c.percentage >= 60 ? "text-amber-600" : "text-red-600"}`}
                        >
                          {c.percentage}%
                        </span>
                      </TableCell>
                      <TableCell className="py-3 min-w-[120px]">
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${c.percentage >= 80 ? "bg-green-500" : c.percentage >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${c.percentage}%` }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
