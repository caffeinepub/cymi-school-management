import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Clock, IndianRupee, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import Sidebar from "../../components/Sidebar";
import { PAYROLL_RECORDS } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;

const PAYROLL_TREND = [
  { month: "Oct", amount: 1820000 },
  { month: "Nov", amount: 1835000 },
  { month: "Dec", amount: 1850000 },
  { month: "Jan", amount: 1842000 },
  { month: "Feb", amount: 1860000 },
  { month: "Mar", amount: 1875000 },
  { month: "Apr", amount: 1890000 },
];

export default function PayrollOverviewPage() {
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

  const totalStaff = PAYROLL_RECORDS.length;
  const processed = PAYROLL_RECORDS.filter(
    (r) => r.processStatus !== "Pending",
  ).length;
  const pending = PAYROLL_RECORDS.filter(
    (r) => r.processStatus === "Pending",
  ).length;
  const totalSalary = PAYROLL_RECORDS.reduce((s, r) => s + r.netPay, 0);

  const recentActivity = PAYROLL_RECORDS.slice(0, 6);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Payroll Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            Monthly payroll summary — April 2026
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Staff",
              value: String(totalStaff),
              icon: <Users className="w-6 h-6 text-blue-600" />,
              color: "bg-blue-50",
              delay: 0,
            },
            {
              label: "Payroll Processed",
              value: String(processed),
              icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
              color: "bg-green-50",
              delay: 0.08,
            },
            {
              label: "Pending",
              value: String(pending),
              icon: <Clock className="w-6 h-6 text-amber-600" />,
              color: "bg-amber-50",
              delay: 0.16,
            },
            {
              label: "Month's Total Salary",
              value: fmt(totalSalary),
              icon: <IndianRupee className="w-6 h-6 text-purple-600" />,
              color: "bg-purple-50",
              delay: 0.24,
            },
          ].map((kpi) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: kpi.delay }}
              className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.color}`}
              >
                {kpi.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <h2 className="font-semibold text-gray-700 mb-4">
              Monthly Payroll Trend
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={PAYROLL_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 11 }}
                />
                <RechartTooltip formatter={(v: number) => fmt(v)} />
                <Bar
                  dataKey="amount"
                  name="Payroll"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <h2 className="font-semibold text-gray-700 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[130px]">
                      {r.name}
                    </p>
                    <p className="text-xs text-gray-400">{r.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">
                      {fmt(r.netPay)}
                    </p>
                    <Badge
                      className={`text-xs ${r.processStatus === "Paid" ? "bg-green-100 text-green-700" : r.processStatus === "Processed" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}
                      variant="secondary"
                    >
                      {r.processStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
