import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, PlayCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { PAYROLL_RECORDS, type PayrollRecord } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;
const MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];
const YEARS = ["2024-25", "2025-26"];

export default function PayrollProcessPage() {
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

  const [month, setMonth] = useState("April");
  const [year, setYear] = useState("2025-26");
  const [records, setRecords] = useState<PayrollRecord[]>(PAYROLL_RECORDS);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function toggleSelect(id: number) {
    setSelected((s) => {
      const ns = new Set(s);
      if (ns.has(id)) ns.delete(id);
      else ns.add(id);
      return ns;
    });
  }
  function toggleAll() {
    setSelected((s) =>
      s.size === records.length ? new Set() : new Set(records.map((r) => r.id)),
    );
  }
  function processSelected() {
    if (selected.size === 0) {
      toast.error("No records selected");
      return;
    }
    setRecords((r) =>
      r.map((rec) =>
        selected.has(rec.id) && rec.processStatus === "Pending"
          ? { ...rec, processStatus: "Processed" }
          : rec,
      ),
    );
    toast.success(`${selected.size} payrolls processed for ${month} ${year}`);
    setSelected(new Set());
  }
  function markPaid() {
    if (selected.size === 0) {
      toast.error("No records selected");
      return;
    }
    setRecords((r) =>
      r.map((rec) =>
        selected.has(rec.id) ? { ...rec, processStatus: "Paid" } : rec,
      ),
    );
    toast.success(`${selected.size} payrolls marked as Paid`);
    setSelected(new Set());
  }

  const statusColor = (s: string) =>
    s === "Paid"
      ? "bg-green-100 text-green-700"
      : s === "Processed"
        ? "bg-blue-100 text-blue-700"
        : "bg-amber-100 text-amber-700";

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Process Payroll
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Process and disburse monthly salary
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={processSelected}
          >
            <PlayCircle className="w-4 h-4 mr-1" /> Process Selected (
            {selected.size})
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50"
            onClick={markPaid}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" /> Mark as Paid (
            {selected.size})
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3">
                    <Checkbox
                      checked={selected.size === records.length}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  {[
                    "Emp ID",
                    "Name",
                    "Department",
                    "Basic",
                    "Allowances",
                    "Deductions",
                    "Net Pay",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr
                    key={r.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-2.5">
                      <Checkbox
                        checked={selected.has(r.id)}
                        onCheckedChange={() => toggleSelect(r.id)}
                      />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-blue-600">
                      {r.empId}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-700 whitespace-nowrap">
                      {r.name}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs">
                      {r.department}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700">
                      {fmt(r.basic)}
                    </td>
                    <td className="px-3 py-2.5 text-green-600">
                      {fmt(r.allowances)}
                    </td>
                    <td className="px-3 py-2.5 text-red-600">
                      {fmt(r.deductions)}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-gray-800">
                      {fmt(r.netPay)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.processStatus)}`}
                      >
                        {r.processStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-blue-600"
                        onClick={() => {
                          setRecords((rec) =>
                            rec.map((re) =>
                              re.id === r.id
                                ? {
                                    ...re,
                                    processStatus:
                                      re.processStatus === "Pending"
                                        ? "Processed"
                                        : "Paid",
                                  }
                                : re,
                            ),
                          );
                          toast.success("Updated");
                        }}
                      >
                        <CreditCard className="w-3.5 h-3.5 mr-1" />
                        {r.processStatus === "Paid"
                          ? "Paid"
                          : r.processStatus === "Processed"
                            ? "Mark Paid"
                            : "Process"}
                      </Button>
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
