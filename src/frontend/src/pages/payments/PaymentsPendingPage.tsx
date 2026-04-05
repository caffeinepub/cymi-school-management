import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BellRing,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { PAYMENTS_PENDING } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;

function overdueBadge(days: number) {
  if (days > 30) return "bg-red-100 text-red-700";
  if (days >= 15) return "bg-amber-100 text-amber-700";
  return "bg-yellow-100 text-yellow-700";
}

export default function PaymentsPendingPage() {
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

  const [records, setRecords] = useState(PAYMENTS_PENDING);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const filtered = useMemo(
    () =>
      records.filter(
        (p) =>
          search === "" ||
          p.payerName.toLowerCase().includes(search.toLowerCase()) ||
          p.refNo.toLowerCase().includes(search.toLowerCase()),
      ),
    [records, search],
  );

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
      s.size === filtered.length
        ? new Set()
        : new Set(filtered.map((r) => r.id)),
    );
  }
  function sendReminder(name: string) {
    toast.success(`Reminder sent to ${name}`);
  }
  function sendBulkReminder() {
    if (selected.size === 0) {
      toast.error("No records selected");
      return;
    }
    toast.success(`Reminder sent to ${selected.size} payees`);
    setSelected(new Set());
  }
  function markPaid(id: number) {
    setRecords((r) => r.filter((p) => p.id !== id));
    toast.success("Marked as Paid");
  }

  function handleExcel() {
    exportToExcel("payments_pending", [
      {
        name: "Pending",
        rows: filtered.map((p) => ({
          Ref: p.refNo,
          Payer: p.payerName,
          Description: p.description,
          Amount: p.amount,
          "Due Date": p.dueDate,
          "Days Overdue": p.daysOverdue,
        })),
      },
    ]);
    toast.success("Exported as Excel");
  }
  function handlePDF() {
    exportToPDF(
      "payments_pending",
      "Pending Payments",
      ["Ref No", "Payer", "Description", "Amount", "Due Date", "Days Overdue"],
      filtered.map((p) => [
        p.refNo,
        p.payerName,
        p.description,
        fmt(p.amount),
        p.dueDate,
        `${p.daysOverdue} days`,
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
              Pending Payments
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Outstanding payments requiring follow-up
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

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
            onClick={sendBulkReminder}
          >
            <BellRing className="w-4 h-4 mr-1" /> Send Bulk Reminder (
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
                      checked={
                        selected.size === filtered.length && filtered.length > 0
                      }
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  {[
                    "Ref No",
                    "Payer Name",
                    "Description",
                    "Amount",
                    "Due Date",
                    "Days Overdue",
                    "Actions",
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
                {filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-2.5">
                      <Checkbox
                        checked={selected.has(p.id)}
                        onCheckedChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-blue-600">
                      {p.refNo}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-700 whitespace-nowrap">
                      {p.payerName}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs">
                      {p.description}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-gray-800">
                      {fmt(p.amount)}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{p.dueDate}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${overdueBadge(p.daysOverdue)}`}
                      >
                        {p.daysOverdue} days
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-orange-500"
                          onClick={() => sendReminder(p.payerName)}
                        >
                          <Bell className="w-3 h-3 mr-1" />
                          Remind
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-green-600"
                          onClick={() => markPaid(p.id)}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Paid
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-gray-100 text-sm text-gray-500">
            {filtered.length} outstanding records
          </div>
        </motion.div>
      </main>
    </div>
  );
}
