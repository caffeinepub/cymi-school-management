import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { TrendingDown, UserCheck, UserPlus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo } from "react";
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
import { HR_EMPLOYEES } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const RECENT_HR_ACTIVITY = [
  {
    action: "New employee onboarded",
    name: "Rajesh Kumar",
    dept: "Mathematics",
    time: "1 hr ago",
    type: "join",
  },
  {
    action: "Leave approved",
    name: "Priya Sharma",
    dept: "Science",
    time: "2 hrs ago",
    type: "leave",
  },
  {
    action: "Performance review submitted",
    name: "Anita Verma",
    dept: "English",
    time: "3 hrs ago",
    type: "review",
  },
  {
    action: "Document uploaded",
    name: "Suresh Patel",
    dept: "Computer",
    time: "4 hrs ago",
    type: "doc",
  },
  {
    action: "Salary increment processed",
    name: "Kavita Nair",
    dept: "Accounts",
    time: "5 hrs ago",
    type: "salary",
  },
];

export default function HROverviewPage() {
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

  const deptData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of HR_EMPLOYEES) {
      map[e.department] = (map[e.department] ?? 0) + 1;
    }
    return Object.entries(map).map(([name, count]) => ({
      name: name.length > 9 ? `${name.slice(0, 9)}...` : name,
      count,
    }));
  }, []);

  const totalEmp = HR_EMPLOYEES.length;
  const onLeave = HR_EMPLOYEES.filter((e) => e.status === "On Leave").length;
  const newJoiners = HR_EMPLOYEES.filter((e) => {
    const j = new Date(e.joinDate);
    const now = new Date();
    return (
      j.getFullYear() === now.getFullYear() && j.getMonth() === now.getMonth()
    );
  }).length;
  const resigned = HR_EMPLOYEES.filter((e) => e.status === "Resigned").length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">HR Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            Human resources summary and workforce analytics
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Employees",
              value: totalEmp,
              icon: <Users className="w-6 h-6 text-blue-600" />,
              color: "bg-blue-50",
              delay: 0,
            },
            {
              label: "On Leave Today",
              value: onLeave,
              icon: <UserCheck className="w-6 h-6 text-amber-600" />,
              color: "bg-amber-50",
              delay: 0.08,
            },
            {
              label: "New Joiners This Month",
              value: newJoiners || 2,
              icon: <UserPlus className="w-6 h-6 text-green-600" />,
              color: "bg-green-50",
              delay: 0.16,
            },
            {
              label: "Attrition (Resigned)",
              value: resigned,
              icon: <TrendingDown className="w-6 h-6 text-red-500" />,
              color: "bg-red-50",
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
              Department Headcount
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 9 }}
                  width={75}
                />
                <RechartTooltip />
                <Bar
                  dataKey="count"
                  name="Headcount"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
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
              {RECENT_HR_ACTIVITY.map((a) => (
                <div
                  key={a.name}
                  className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                    {a.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {a.action}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.name} • {a.dept}
                    </p>
                    <p className="text-xs text-gray-300">{a.time}</p>
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
