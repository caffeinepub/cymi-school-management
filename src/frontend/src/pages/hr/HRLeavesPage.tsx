import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Search,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { LEAVE_RECORDS, type LeaveRecord } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const PAGE_SIZE = 15;
const STATUS_COLORS: Record<string, string> = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-700",
};
const LEAVE_TYPE_COLORS: Record<string, string> = {
  CL: "bg-blue-100 text-blue-700",
  SL: "bg-purple-100 text-purple-700",
  EL: "bg-teal-100 text-teal-700",
  LWP: "bg-red-100 text-red-700",
};

export default function HRLeavesPage() {
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

  const [records, setRecords] = useState<LeaveRecord[]>(LEAVE_RECORDS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      records.filter(
        (r) =>
          search === "" ||
          r.empName.toLowerCase().includes(search.toLowerCase()),
      ),
    [records, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function approve(id: number) {
    setRecords((r) =>
      r.map((rr) => (rr.id === id ? { ...rr, status: "Approved" } : rr)),
    );
    toast.success("Leave approved");
  }
  function reject(id: number) {
    setRecords((r) =>
      r.map((rr) => (rr.id === id ? { ...rr, status: "Rejected" } : rr)),
    );
    toast.error("Leave rejected");
  }

  function handleExcel() {
    exportToExcel("hr_leaves", [
      {
        name: "Leaves",
        rows: filtered.map((r) => ({
          Employee: r.empName,
          "Leave Type": r.leaveType,
          From: r.from,
          To: r.to,
          Days: r.days,
          Reason: r.reason,
          Status: r.status,
        })),
      },
    ]);
    toast.success("Exported as Excel");
  }
  function handlePDF() {
    exportToPDF(
      "hr_leaves",
      "HR Leave Records",
      ["Employee", "Type", "From", "To", "Days", "Status"],
      filtered.map((r) => [
        r.empName,
        r.leaveType,
        r.from,
        r.to,
        r.days,
        r.status,
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
              Leave Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Employee leave requests and approvals
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
          className="bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search employee..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {[
                    "Employee",
                    "Leave Type",
                    "From",
                    "To",
                    "Days",
                    "Reason",
                    "Status",
                    "Actions",
                  ].map((h) => (
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
                {paginated.map((r, i) => (
                  <tr
                    key={r.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {r.empName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEAVE_TYPE_COLORS[r.leaveType] ?? ""}`}
                      >
                        {r.leaveType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.from}</td>
                    <td className="px-4 py-3 text-gray-600">{r.to}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {r.days}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {r.reason}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] ?? ""}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "Pending" && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-green-600"
                            onClick={() => approve(r.id)}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-500"
                            onClick={() => reject(r.id)}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filtered.length} leave records
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="px-3 py-1.5 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
