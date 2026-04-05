import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { FileSpreadsheet, FileText } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;

const IE_DATA = [
  { month: "Apr", income: 420000, expense: 280000 },
  { month: "May", income: 395000, expense: 310000 },
  { month: "Jun", income: 510000, expense: 340000 },
  { month: "Jul", income: 480000, expense: 295000 },
  { month: "Aug", income: 530000, expense: 360000 },
  { month: "Sep", income: 445000, expense: 320000 },
  { month: "Oct", income: 560000, expense: 380000 },
  { month: "Nov", income: 490000, expense: 330000 },
  { month: "Dec", income: 575000, expense: 390000 },
  { month: "Jan", income: 520000, expense: 345000 },
  { month: "Feb", income: 460000, expense: 310000 },
  { month: "Mar", income: 610000, expense: 410000 },
];

const IE_SUMMARY = [
  { category: "Tuition Fees", budget: 5000000, actual: 4890000 },
  { category: "Transport Fees", budget: 480000, actual: 462000 },
  { category: "Hostel Fees", budget: 800000, actual: 788000 },
  { category: "Staff Salaries", budget: 3600000, actual: 3620000 },
  { category: "Maintenance", budget: 280000, actual: 310000 },
  { category: "Utilities", budget: 150000, actual: 138000 },
  { category: "Stationery", budget: 120000, actual: 115000 },
  { category: "Sports", budget: 80000, actual: 92000 },
  { category: "IT & Computer", budget: 200000, actual: 185000 },
  { category: "Miscellaneous", budget: 100000, actual: 112000 },
];

export default function IncomeExpensePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();
  useEffect(() => {
    if (!isLoading && !profile) navigate({ to: "/login" });
  }, [isLoading, profile, navigate]);
  async function handleLogout() {
    await logoutMutation.mutateAsync("token");
    navigate({ to: "/login" });
  }
  const role = profile?.schoolRole ?? "Admin";
  const userName = profile ? `${profile.firstName} ${profile.lastName}` : "";

  const [year, setYear] = useState("2025-26");

  const summary = useMemo(
    () =>
      IE_SUMMARY.map((r) => ({
        ...r,
        variance: r.actual - r.budget,
        pct: (((r.actual - r.budget) / r.budget) * 100).toFixed(1),
      })),
    [],
  );

  function handleExcel() {
    exportToExcel("income_expense", [
      {
        name: "Summary",
        rows: summary.map((r) => ({
          Category: r.category,
          Budget: r.budget,
          Actual: r.actual,
          Variance: r.variance,
          "% Var": `${r.pct}%`,
        })),
      },
    ]);
    toast.success("Exported as Excel");
  }
  function handlePDF() {
    exportToPDF(
      "income_expense",
      `Income & Expense - ${year}`,
      ["Category", "Budget", "Actual", "Variance", "% Var"],
      summary.map((r) => [
        r.category,
        fmt(r.budget),
        fmt(r.actual),
        (r.variance >= 0 ? "+" : "") + fmt(r.variance),
        `${r.pct}%`,
      ]),
    );
    toast.success("Exported as PDF");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Income & Expense
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Budget vs actual analysis
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["2023-24", "2024-25", "2025-26"].map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={handleExcel}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handlePDF}
            >
              <FileText className="w-4 h-4 mr-1" /> PDF
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6"
        >
          <h2 className="font-semibold text-gray-700 mb-4">
            Monthly Income vs Expense ({year})
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={IE_DATA} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                tick={{ fontSize: 11 }}
              />
              <RechartTooltip formatter={(v: number) => fmt(v)} />
              <Legend />
              <Bar
                dataKey="income"
                name="Income"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">
              Budget vs Actual Summary ({year})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Category", "Budget", "Actual", "Variance", "% Var"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {summary.map((r, i) => (
                  <tr
                    key={r.category}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {r.category}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fmt(r.budget)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt(r.actual)}</td>
                    <td
                      className={`px-4 py-3 font-medium ${r.variance >= 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {(r.variance >= 0 ? "+" : "") + fmt(Math.abs(r.variance))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          Number.parseFloat(r.pct) > 0
                            ? "destructive"
                            : "default"
                        }
                        className="text-xs"
                      >
                        {r.pct}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
