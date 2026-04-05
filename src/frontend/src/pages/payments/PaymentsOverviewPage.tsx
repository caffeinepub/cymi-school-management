import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Banknote, Clock, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../../components/Sidebar";
import { PAYMENTS_RECEIVED } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

const RECENT_FEED = [
  {
    name: "Priya Sharma",
    amount: 15000,
    time: "2 min ago",
    mode: "UPI",
    initials: "PS",
  },
  {
    name: "Rahul Verma",
    amount: 8500,
    time: "18 min ago",
    mode: "Cash",
    initials: "RV",
  },
  {
    name: "Anita Gupta",
    amount: 22000,
    time: "45 min ago",
    mode: "Bank Transfer",
    initials: "AG",
  },
  {
    name: "Vikram Singh",
    amount: 12500,
    time: "1 hr ago",
    mode: "Cheque",
    initials: "VS",
  },
  {
    name: "Deepa Nair",
    amount: 7800,
    time: "2 hrs ago",
    mode: "UPI",
    initials: "DN",
  },
];

export default function PaymentsOverviewPage() {
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

  const totalReceived = PAYMENTS_RECEIVED.filter(
    (p) => p.status === "Confirmed",
  ).reduce((s, p) => s + p.amount, 0);
  const pending = PAYMENTS_RECEIVED.filter(
    (p) => p.status === "Pending",
  ).reduce((s, p) => s + p.amount, 0);
  const failed = PAYMENTS_RECEIVED.filter((p) => p.status === "Failed").reduce(
    (s, p) => s + p.amount,
    0,
  );

  const modeData = ["Cash", "UPI", "Cheque", "Bank Transfer"].map((mode) => ({
    name: mode,
    value: PAYMENTS_RECEIVED.filter((p) => p.mode === mode).length,
  }));

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Payments Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time payment activity and collection summary
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Received",
              value: fmt(totalReceived),
              icon: <TrendingUp className="w-6 h-6 text-green-600" />,
              color: "bg-green-50",
              delay: 0,
            },
            {
              label: "Pending",
              value: fmt(pending),
              icon: <Clock className="w-6 h-6 text-amber-600" />,
              color: "bg-amber-50",
              delay: 0.08,
            },
            {
              label: "Failed / Overdue",
              value: fmt(failed),
              icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
              color: "bg-red-50",
              delay: 0.16,
            },
            {
              label: "Today's Collections",
              value: fmt(65800),
              icon: <Banknote className="w-6 h-6 text-blue-600" />,
              color: "bg-blue-50",
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
                <p className="text-xl font-bold text-gray-800">{kpi.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <h2 className="font-semibold text-gray-700 mb-4">
              Payment Mode Distribution
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={modeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                >
                  {modeData.map((md, i) => (
                    <Cell key={md.name} fill={PIE_COLORS[i % 4]} />
                  ))}
                </Pie>
                <RechartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <h2 className="font-semibold text-gray-700 mb-4">
              Recent Payment Activity
            </h2>
            <div className="space-y-3">
              {RECENT_FEED.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                    {p.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.mode} • {p.time}
                    </p>
                  </div>
                  <span className="font-bold text-green-700 text-sm">
                    {fmt(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
