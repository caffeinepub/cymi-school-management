import { useNavigate } from "@tanstack/react-router";
import { BarChart2, UserPlus } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const byClass = Array.from({ length: 12 }, (_, i) => ({
  class: `Class ${i + 1}`,
  applications: Math.floor(3 + Math.random() * 6),
}));

const statusData = [
  { name: "Approved", value: 28, color: "#22c55e" },
  { name: "Pending", value: 15, color: "#f59e0b" },
  { name: "Rejected", value: 7, color: "#ef4444" },
];

const monthlyTrend = [
  { month: "Oct 2025", applications: 4 },
  { month: "Nov 2025", applications: 7 },
  { month: "Dec 2025", applications: 6 },
  { month: "Jan 2026", applications: 12 },
  { month: "Feb 2026", applications: 14 },
  { month: "Mar 2026", applications: 7 },
];

export default function AdmissionReportsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Admission Reports
            </h1>
            <p className="text-sm text-gray-500">
              Statistics and insights on admissions
            </p>
          </div>
        </div>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="text-blue-600 hover:underline"
          >
            Dashboard
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Admissions / Reports</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Applications",
              value: 50,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Approved",
              value: 28,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Pending",
              value: 15,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Rejected",
              value: 7,
              color: "text-red-600",
              bg: "bg-red-50",
            },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <p className="text-sm text-gray-600">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart - by class */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">
              Applications by Class
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={byClass}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <XAxis dataKey="class" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="applications"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart - status */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">
              Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly trend table */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              Monthly Admission Trend
            </h2>
            <button
              type="button"
              data-ocid="admission_reports.export_button"
              className="text-sm px-3 py-1.5 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              Export
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Month", "Applications", "Trend"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyTrend.map((m, i) => (
                <tr
                  key={m.month}
                  data-ocid={`admission_reports.row.${i + 1}`}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {m.month}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{m.applications}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="bg-blue-100 rounded-full h-2"
                        style={{ width: `${m.applications * 8}px` }}
                      >
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "100%" }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {m.applications}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
