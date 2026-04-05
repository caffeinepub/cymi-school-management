import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { FileSpreadsheet, FileText } from "lucide-react";
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
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { STAFF_SALARY_DATA } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;

export default function PayrollReportsPage() {
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

  const deptSummary = useMemo(() => {
    const map: Record<
      string,
      {
        staff: number;
        basic: number;
        allowances: number;
        deductions: number;
        net: number;
      }
    > = {};
    for (const s of STAFF_SALARY_DATA) {
      if (!map[s.department])
        map[s.department] = {
          staff: 0,
          basic: 0,
          allowances: 0,
          deductions: 0,
          net: 0,
        };
      const d = map[s.department];
      d.staff++;
      d.basic += s.basic;
      d.allowances += s.hra + s.da + s.otherAllowances;
      d.deductions += s.pfDeduction + s.tds;
      d.net += s.netPay;
    }
    return Object.entries(map).map(([dept, v]) => ({ dept, ...v }));
  }, []);

  const chartData = deptSummary.map((d) => ({
    name: d.dept.length > 8 ? `${d.dept.slice(0, 8)}...` : d.dept,
    netPay: d.net,
  }));

  function handleExcel() {
    exportToExcel("payroll_reports", [
      {
        name: "Dept Summary",
        rows: deptSummary.map((d) => ({
          Department: d.dept,
          "Staff Count": d.staff,
          "Total Basic": d.basic,
          "Total Allowances": d.allowances,
          "Total Deductions": d.deductions,
          "Net Payroll": d.net,
        })),
      },
    ]);
    toast.success("Exported as Excel");
  }
  function handlePDF() {
    exportToPDF(
      "payroll_reports",
      "Payroll Department Summary",
      [
        "Department",
        "Staff",
        "Total Basic",
        "Total Allowances",
        "Total Deductions",
        "Net Payroll",
      ],
      deptSummary.map((d) => [
        d.dept,
        d.staff,
        fmt(d.basic),
        fmt(d.allowances),
        fmt(d.deductions),
        fmt(d.net),
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
              Payroll Reports
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Department-wise payroll analysis
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

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6"
        >
          <h2 className="font-semibold text-gray-700 mb-4">
            Department-wise Net Payroll
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                type="number"
                tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10 }}
                width={80}
              />
              <RechartTooltip formatter={(v: number) => fmt(v)} />
              <Bar
                dataKey="netPay"
                name="Net Payroll"
                fill="#6366f1"
                radius={[0, 4, 4, 0]}
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
              Department-wise Summary
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Department",
                    "Staff Count",
                    "Total Basic",
                    "Total Allowances",
                    "Total Deductions",
                    "Net Payroll",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptSummary.map((d, i) => (
                  <tr
                    key={d.dept}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {d.dept}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.staff}</td>
                    <td className="px-4 py-3 text-gray-700">{fmt(d.basic)}</td>
                    <td className="px-4 py-3 text-green-600">
                      {fmt(d.allowances)}
                    </td>
                    <td className="px-4 py-3 text-red-600">
                      {fmt(d.deductions)}
                    </td>
                    <td className="px-4 py-3 font-bold text-indigo-700">
                      {fmt(d.net)}
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
