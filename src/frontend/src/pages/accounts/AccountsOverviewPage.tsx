import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import Sidebar from "../../components/Sidebar";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const MONTHLY_DATA = [
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

const RECENT_TXN = [
  {
    date: "2026-04-02",
    ref: "REF-1042",
    account: "School Fees A/C",
    desc: "Fee Collection - Class 10",
    amount: 125000,
    type: "Credit",
  },
  {
    date: "2026-04-01",
    ref: "REF-1041",
    account: "Salary Expense",
    desc: "April Salary Disbursement",
    amount: 387500,
    type: "Debit",
  },
  {
    date: "2026-03-31",
    ref: "REF-1040",
    account: "Transport Income",
    desc: "Monthly Transport Fee",
    amount: 42000,
    type: "Credit",
  },
  {
    date: "2026-03-30",
    ref: "REF-1039",
    account: "Maintenance Expense",
    desc: "Annual Maintenance Contract",
    amount: 68000,
    type: "Debit",
  },
  {
    date: "2026-03-29",
    ref: "REF-1038",
    account: "Canteen Income",
    desc: "Canteen Revenue March",
    amount: 18500,
    type: "Credit",
  },
  {
    date: "2026-03-28",
    ref: "REF-1037",
    account: "Utilities Expense",
    desc: "Electricity & Water Bill",
    amount: 22000,
    type: "Debit",
  },
];

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;

function KPICard({
  label,
  value,
  trend,
  icon,
  color,
  delay = 0,
}: {
  label: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-800 truncate">{value}</p>
        <Badge className="mt-1 text-xs" variant="secondary">
          {trend}
        </Badge>
      </div>
    </motion.div>
  );
}

export default function AccountsOverviewPage() {
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Accounts Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Financial summary for current academic year
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            label="Total Revenue"
            value={fmt(5990000)}
            trend="↑ 12.4% vs last year"
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
            color="bg-green-50"
            delay={0}
          />
          <KPICard
            label="Total Expenses"
            value={fmt(3870000)}
            trend="↑ 8.1% vs last year"
            icon={<TrendingDown className="w-6 h-6 text-red-500" />}
            color="bg-red-50"
            delay={0.08}
          />
          <KPICard
            label="Net Balance"
            value={fmt(2120000)}
            trend="↑ 18.7% vs last year"
            icon={<DollarSign className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50"
            delay={0.16}
          />
          <KPICard
            label="Outstanding Receivables"
            value={fmt(485000)}
            trend="↓ 5.2% vs last month"
            icon={<ReceiptText className="w-6 h-6 text-amber-600" />}
            color="bg-amber-50"
            delay={0.24}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6"
        >
          <h2 className="font-semibold text-gray-700 mb-4">
            Monthly Income vs Expenses (2025-26)
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                tick={{ fontSize: 11 }}
              />
              <RechartTooltip formatter={(v: number) => fmt(v)} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                fill="url(#incomeGrad)"
                strokeWidth={2}
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                fill="url(#expenseGrad)"
                strokeWidth={2}
                name="Expense"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Date",
                    "Ref No",
                    "Account",
                    "Description",
                    "Amount",
                    "Type",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_TXN.map((txn, i) => (
                  <tr
                    key={txn.ref}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-gray-600">{txn.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">
                      {txn.ref}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{txn.account}</td>
                    <td className="px-4 py-3 text-gray-600">{txn.desc}</td>
                    <td
                      className={`px-4 py-3 font-semibold ${txn.type === "Credit" ? "text-green-600" : "text-red-600"}`}
                    >
                      {fmt(txn.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          txn.type === "Credit" ? "default" : "destructive"
                        }
                        className="text-xs"
                      >
                        {txn.type === "Credit" ? (
                          <ArrowUpCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowDownCircle className="w-3 h-3 mr-1" />
                        )}
                        {txn.type}
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
