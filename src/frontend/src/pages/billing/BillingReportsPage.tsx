import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { FileSpreadsheet, FileText } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import {
  Area,
  AreaChart,
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
import { BILLING_INVOICES } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;

const CATEGORY_DATA = [
  { category: "Tuition Fee", revenue: 4890000 },
  { category: "Transport", revenue: 462000 },
  { category: "Hostel", revenue: 788000 },
  { category: "Library", revenue: 95000 },
  { category: "Sports", revenue: 142000 },
  { category: "Computer Lab", revenue: 215000 },
];

const OVERDUE_DATA = [
  { bucket: "0-30 days", amount: 185000 },
  { bucket: "31-60 days", amount: 142000 },
  { bucket: "61-90 days", amount: 98000 },
  { bucket: "90+ days", amount: 60000 },
];

const MONTHLY_TREND = [
  { month: "Apr", billed: 520000, collected: 480000 },
  { month: "May", billed: 495000, collected: 460000 },
  { month: "Jun", billed: 610000, collected: 575000 },
  { month: "Jul", billed: 580000, collected: 540000 },
  { month: "Aug", billed: 630000, collected: 600000 },
  { month: "Sep", billed: 545000, collected: 510000 },
];

export default function BillingReportsPage() {
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

  function handleExcel() {
    exportToExcel("billing_reports", [
      {
        name: "Category Revenue",
        rows: CATEGORY_DATA.map((c) => ({
          Category: c.category,
          Revenue: c.revenue,
        })),
      },
      {
        name: "Overdue Analysis",
        rows: OVERDUE_DATA.map((o) => ({
          "Age Bucket": o.bucket,
          Amount: o.amount,
        })),
      },
    ]);
    toast.success("Exported as Excel");
  }
  function handlePDF() {
    exportToPDF(
      "billing_reports",
      "Billing Reports Summary",
      ["Category", "Revenue"],
      CATEGORY_DATA.map((c) => [c.category, fmt(c.revenue)]),
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
              Billing Reports
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Revenue analysis and overdue tracking
            </p>
          </div>
          <div className="flex gap-2">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <h2 className="font-semibold text-gray-700 mb-4">
              Revenue by Category
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CATEGORY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 9 }} />
                <YAxis
                  tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 10 }}
                />
                <RechartTooltip formatter={(v: number) => fmt(v)} />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <h2 className="font-semibold text-gray-700 mb-4">
              Overdue Analysis
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={OVERDUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  tick={{ fontSize: 10 }}
                />
                <RechartTooltip formatter={(v: number) => fmt(v)} />
                <Bar
                  dataKey="amount"
                  name="Overdue Amount"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
        >
          <h2 className="font-semibold text-gray-700 mb-4">
            Monthly Billing Trend
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_TREND}>
              <defs>
                <linearGradient id="billedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                tick={{ fontSize: 11 }}
              />
              <RechartTooltip formatter={(v: number) => fmt(v)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="billed"
                stroke="#6366f1"
                fill="url(#billedGrad)"
                strokeWidth={2}
                name="Billed"
              />
              <Area
                type="monotone"
                dataKey="collected"
                stroke="#22c55e"
                fill="url(#collectedGrad)"
                strokeWidth={2}
                name="Collected"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </main>
    </div>
  );
}
