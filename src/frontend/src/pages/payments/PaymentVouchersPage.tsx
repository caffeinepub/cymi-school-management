import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Plus,
  Search,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { PAYMENT_VOUCHERS, type PaymentVoucher } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;
const PAGE_SIZE = 15;

const STATUS_COLORS: Record<string, string> = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function PaymentVouchersPage() {
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

  const [vouchers, setVouchers] = useState<PaymentVoucher[]>(PAYMENT_VOUCHERS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    payee: "",
    purpose: "",
    amount: "",
    date: "",
  });

  const filtered = useMemo(
    () =>
      vouchers.filter((v) => {
        const matchS =
          search === "" ||
          v.payee.toLowerCase().includes(search.toLowerCase()) ||
          v.voucherNo.toLowerCase().includes(search.toLowerCase());
        const matchSt = filterStatus === "all" || v.status === filterStatus;
        return matchS && matchSt;
      }),
    [vouchers, search, filterStatus],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleApprove(id: number) {
    setVouchers((v) =>
      v.map((vv) => (vv.id === id ? { ...vv, status: "Approved" } : vv)),
    );
    toast.success("Voucher approved");
  }
  function handleReject(id: number) {
    setVouchers((v) =>
      v.map((vv) => (vv.id === id ? { ...vv, status: "Rejected" } : vv)),
    );
    toast.error("Voucher rejected");
  }
  function handleCreate() {
    if (!newVoucher.payee || !newVoucher.amount) {
      toast.error("Fill all required fields");
      return;
    }
    const id = Math.max(...vouchers.map((v) => v.id)) + 1;
    setVouchers((v) => [
      {
        id,
        voucherNo: `PV-${5000 + id}`,
        date: newVoucher.date || new Date().toISOString().split("T")[0],
        payee: newVoucher.payee,
        purpose: newVoucher.purpose,
        amount: Number(newVoucher.amount),
        approvedBy: "-",
        status: "Pending",
      },
      ...v,
    ]);
    toast.success("Voucher created");
    setShowCreate(false);
    setNewVoucher({ payee: "", purpose: "", amount: "", date: "" });
  }

  function handleExcel() {
    exportToExcel("payment_vouchers", [
      {
        name: "Vouchers",
        rows: filtered.map((v) => ({
          "Voucher No": v.voucherNo,
          Date: v.date,
          Payee: v.payee,
          Purpose: v.purpose,
          Amount: v.amount,
          "Approved By": v.approvedBy,
          Status: v.status,
        })),
      },
    ]);
    toast.success("Exported as Excel");
  }
  function handlePDF() {
    exportToPDF(
      "payment_vouchers",
      "Payment Vouchers",
      ["Voucher No", "Date", "Payee", "Purpose", "Amount", "Status"],
      filtered.map((v) => [
        v.voucherNo,
        v.date,
        v.payee,
        v.purpose,
        fmt(v.amount),
        v.status,
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
              Payment Vouchers
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Create and approve payment vouchers
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
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4 mr-1" /> New Voucher
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search payee or voucher no..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1">
              {["all", "Approved", "Pending", "Rejected"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setFilterStatus(s);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {[
                    "Voucher No",
                    "Date",
                    "Payee",
                    "Purpose",
                    "Amount",
                    "Approved By",
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
                {paginated.map((v, i) => (
                  <tr
                    key={v.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">
                      {v.voucherNo}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{v.date}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {v.payee}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {v.purpose}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {fmt(v.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {v.approvedBy}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v.status] ?? ""}`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {v.status === "Pending" && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-green-600"
                            onClick={() => handleApprove(v.id)}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-500"
                            onClick={() => handleReject(v.id)}
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
            <p className="text-sm text-gray-500">{filtered.length} vouchers</p>
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

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Voucher</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div>
              <Label className="text-xs">Payee Name *</Label>
              <Input
                className="mt-1"
                value={newVoucher.payee}
                onChange={(e) =>
                  setNewVoucher((v) => ({ ...v, payee: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                className="mt-1"
                value={newVoucher.date}
                onChange={(e) =>
                  setNewVoucher((v) => ({ ...v, date: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Purpose</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={newVoucher.purpose}
                onChange={(e) =>
                  setNewVoucher((v) => ({ ...v, purpose: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-xs">Amount (\u20b9) *</Label>
              <Input
                type="number"
                className="mt-1"
                value={newVoucher.amount}
                onChange={(e) =>
                  setNewVoucher((v) => ({ ...v, amount: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleCreate}
            >
              Create Voucher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
