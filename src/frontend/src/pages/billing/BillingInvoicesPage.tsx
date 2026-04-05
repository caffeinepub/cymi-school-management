import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import {
  Eye,
  FileSpreadsheet,
  FileText,
  Plus,
  Printer,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { BILLING_INVOICES, type Invoice } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;
const PAGE_SIZE = 15;

const STATUS_COLORS: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Partial: "bg-blue-100 text-blue-700",
  Unpaid: "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
};

export default function BillingInvoicesPage() {
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

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const filtered = useMemo(
    () =>
      BILLING_INVOICES.filter((inv) => {
        const matchS =
          search === "" ||
          inv.recipientName.toLowerCase().includes(search.toLowerCase()) ||
          inv.invoiceNo.toLowerCase().includes(search.toLowerCase());
        const matchSt = filterStatus === "all" || inv.status === filterStatus;
        return matchS && matchSt;
      }),
    [search, filterStatus],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleExcel() {
    exportToExcel("invoices", [
      {
        name: "Invoices",
        rows: filtered.map((inv) => ({
          "Invoice No": inv.invoiceNo,
          Recipient: inv.recipientName,
          "Issue Date": inv.issueDate,
          "Due Date": inv.dueDate,
          Amount: inv.amount,
          Paid: inv.paid,
          Balance: inv.balance,
          Status: inv.status,
        })),
      },
    ]);
    toast.success("Exported as Excel");
  }
  function handlePDF() {
    exportToPDF(
      "invoices",
      "Billing Invoices",
      [
        "Invoice No",
        "Recipient",
        "Issue Date",
        "Due Date",
        "Amount",
        "Paid",
        "Balance",
        "Status",
      ],
      filtered.map((inv) => [
        inv.invoiceNo,
        inv.recipientName,
        inv.issueDate,
        inv.dueDate,
        fmt(inv.amount),
        fmt(inv.paid),
        fmt(inv.balance),
        inv.status,
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
            <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
            <p className="text-gray-500 text-sm mt-1">
              All billing invoices and payment status
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
              onClick={() => navigate({ to: "/billing/create" })}
            >
              <Plus className="w-4 h-4 mr-1" /> Create Invoice
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
                placeholder="Search invoice or recipient..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1">
              {["all", "Paid", "Partial", "Unpaid", "Overdue"].map((s) => (
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
                    "Invoice No",
                    "Recipient",
                    "Issue Date",
                    "Due Date",
                    "Amount",
                    "Paid",
                    "Balance",
                    "Status",
                    "Actions",
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
                {paginated.map((inv, i) => (
                  <tr
                    key={inv.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">
                      {inv.invoiceNo}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {inv.recipientName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{inv.issueDate}</td>
                    <td className="px-4 py-3 text-gray-600">{inv.dueDate}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {fmt(inv.amount)}
                    </td>
                    <td className="px-4 py-3 text-green-600">
                      {fmt(inv.paid)}
                    </td>
                    <td className="px-4 py-3 text-red-600">
                      {fmt(inv.balance)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status] ?? ""}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-500"
                        onClick={() => setViewInvoice(inv)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">{filtered.length} invoices</p>
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

      <Dialog
        open={!!viewInvoice}
        onOpenChange={(o) => !o && setViewInvoice(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice {viewInvoice?.invoiceNo}</DialogTitle>
          </DialogHeader>
          {viewInvoice && (
            <div className="text-sm">
              <div className="text-center mb-4 border-b pb-3">
                <p className="font-bold text-gray-800">
                  CYMI Computer Institute
                </p>
                <p className="text-gray-500 text-xs">Tax Invoice</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div>
                  <span className="text-gray-500">Invoice No:</span>{" "}
                  <span className="font-medium">{viewInvoice.invoiceNo}</span>
                </div>
                <div>
                  <span className="text-gray-500">Issue Date:</span>{" "}
                  <span className="font-medium">{viewInvoice.issueDate}</span>
                </div>
                <div>
                  <span className="text-gray-500">Recipient:</span>{" "}
                  <span className="font-medium">
                    {viewInvoice.recipientName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Due Date:</span>{" "}
                  <span className="font-medium">{viewInvoice.dueDate}</span>
                </div>
              </div>
              <table className="w-full text-xs border-collapse border border-gray-200 mb-3">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left">
                      Description
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">
                      Tuition Fee
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-right">
                      {fmt(Math.round(viewInvoice.amount * 0.7))}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">
                      Transport Charges
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-right">
                      {fmt(Math.round(viewInvoice.amount * 0.15))}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">
                      Other Charges
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-right">
                      {fmt(Math.round(viewInvoice.amount * 0.15))}
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="border border-gray-200 px-3 py-2">Total</td>
                    <td className="border border-gray-200 px-3 py-2 text-right">
                      {fmt(viewInvoice.amount)}
                    </td>
                  </tr>
                  <tr className="text-green-700">
                    <td className="border border-gray-200 px-3 py-2">
                      Amount Paid
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-right">
                      {fmt(viewInvoice.paid)}
                    </td>
                  </tr>
                  <tr className="text-red-600 font-bold">
                    <td className="border border-gray-200 px-3 py-2">
                      Balance Due
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-right">
                      {fmt(viewInvoice.balance)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-end">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[viewInvoice.status] ?? ""}`}
                >
                  {viewInvoice.status}
                </span>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewInvoice(null)}
            >
              Close
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                toast.success("Opening print view...");
              }}
            >
              <Printer className="w-4 h-4 mr-1" /> Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
