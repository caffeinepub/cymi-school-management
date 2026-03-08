import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Printer,
  Receipt,
  Search,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { FEE_RECEIPTS, type Receipt as ReceiptType } from "../../data/fees";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const PAGE_SIZE = 20;

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// ─── Receipt Detail Modal ─────────────────────────────────────────────────────
function ReceiptDetailModal({
  receipt,
  onClose,
}: { receipt: ReceiptType; onClose: () => void }) {
  const [schoolCopy, setSchoolCopy] = useState(true);
  const [parentCopy, setParentCopy] = useState(true);

  // Derive a plausible father's name from student name (demo data)
  const fatherName = receipt.studentName
    .split(" ")
    .slice(1)
    .map((n) => `${n[0].toUpperCase()}${n.slice(1)}`)
    .join(" ");
  const fatherDisplay = fatherName
    ? `${fatherName.split(" ")[0]} Prasad ${fatherName}`
    : "Father Name";

  function buildPrintHtml(copies: string[]) {
    const rows = receipt.feeHeads
      .map(
        (f, i) =>
          `<tr>
            <td style="padding:7px 10px;border:1px solid #ccc;">${i + 1}</td>
            <td style="padding:7px 10px;border:1px solid #ccc;">${f.name}</td>
            <td style="padding:7px 10px;border:1px solid #ccc;text-align:right;">${(f.amount - f.discount).toLocaleString("en-IN")}</td>
          </tr>`,
      )
      .join("");

    const receiptBlock = (copyLabel: string) => `
      <div style="page-break-inside:avoid;margin-bottom:40px;">
        <div style="text-align:center;margin-bottom:16px;">
          <div style="font-size:22px;font-weight:800;">CYMI Computer Institute</div>
          <div style="font-size:14px;font-weight:600;margin-top:4px;">Fee Receipt</div>
        </div>
        <table style="width:100%;font-size:13px;margin-bottom:16px;border-collapse:collapse;">
          <tr>
            <td style="width:50%;padding:4px 0;"><b>Admission Number :</b> ${receipt.admissionNo}</td>
            <td style="width:50%;padding:4px 0;text-align:right;"><b>Date :</b> ${receipt.date}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><b>Name :</b> ${receipt.studentName}</td>
            <td style="padding:4px 0;text-align:right;"><b>Receipt No :</b> ${receipt.receiptNo}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><b>Father's Name :</b> ${fatherDisplay}</td>
            <td style="padding:4px 0;text-align:right;"><b>Class :</b> ${receipt.grade}-${receipt.section}</td>
          </tr>
        </table>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:8px 10px;border:1px solid #ccc;text-align:left;width:15%;">Sl. No.</th>
              <th style="padding:8px 10px;border:1px solid #ccc;text-align:left;">Particular</th>
              <th style="padding:8px 10px;border:1px solid #ccc;text-align:right;width:20%;">Amount</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:8px 10px;border:1px solid #ccc;text-align:right;font-weight:700;">Total</td>
              <td style="padding:8px 10px;border:1px solid #ccc;text-align:right;font-weight:700;">${receipt.totalAmount.toLocaleString("en-IN")}</td>
            </tr>
          </tfoot>
        </table>
        <div style="text-align:right;font-size:13px;margin-bottom:28px;">Principal / Accountant</div>
        <div style="font-size:11px;color:#666;text-align:center;">${copyLabel}</div>
      </div>`;

    const copyBlocks = copies
      .map((c) => receiptBlock(c))
      .join('<hr style="border:1px dashed #aaa;margin:20px 0;"/>');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Fee Receipt - ${receipt.receiptNo}</title>
      <style>*{box-sizing:border-box;}body{font-family:Arial,sans-serif;padding:28px;max-width:700px;margin:0 auto;color:#111;}@media print{@page{margin:12mm;}}</style>
      </head><body>${copyBlocks}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script></body></html>`;
  }

  function handlePrint() {
    const copies: string[] = [];
    if (schoolCopy) copies.push("School Copy");
    if (parentCopy) copies.push("Parent Copy");
    if (copies.length === 0) copies.push("Copy");
    const win = window.open("", "_blank_rcp");
    if (!win) return;
    win.document.write(buildPrintHtml(copies));
    win.document.close();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="fee-receipts.dialog"
        className="max-w-xl max-h-[92vh] overflow-y-auto p-0"
      >
        {/* Modal title bar */}
        <div className="bg-[#4a90c4] text-white px-6 py-3 rounded-t-lg flex items-center justify-between">
          <DialogTitle className="text-base font-semibold text-white m-0">
            Fee Receipt
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            data-ocid="fee-receipts.close_button"
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt body */}
        <div className="bg-white p-6 space-y-4">
          {/* School heading */}
          <div className="text-center border border-gray-200 rounded p-4 bg-white">
            <h2 className="text-xl font-bold text-gray-900">
              CYMI Computer Institute
            </h2>
            <p className="text-sm font-semibold text-gray-700 mt-1">
              Fee Receipt
            </p>
          </div>

          {/* Student info two-column grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm border border-gray-200 rounded p-4">
            <div className="flex gap-1">
              <span className="font-semibold whitespace-nowrap">
                Admission Number :
              </span>
              <span className="text-gray-700">{receipt.admissionNo}</span>
            </div>
            <div className="flex gap-1 justify-end">
              <span className="font-semibold">Date :</span>
              <span className="text-gray-700">{receipt.date}</span>
            </div>
            <div className="flex gap-1">
              <span className="font-semibold">Name :</span>
              <span className="text-gray-700">{receipt.studentName}</span>
            </div>
            <div className="flex gap-1 justify-end">
              <span className="font-semibold">Receipt No :</span>
              <span className="text-gray-700">{receipt.receiptNo}</span>
            </div>
            <div className="flex gap-1">
              <span className="font-semibold whitespace-nowrap">
                Father's Name :
              </span>
              <span className="text-gray-700">{fatherDisplay}</span>
            </div>
            <div className="flex gap-1 justify-end">
              <span className="font-semibold">Class :</span>
              <span className="text-gray-700">
                {receipt.grade}-{receipt.section}
              </span>
            </div>
          </div>

          {/* Fee table */}
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left w-16">
                  Sl. No.
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  Particular
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right w-28">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {receipt.feeHeads.map((f, i) => (
                <tr key={f.name}>
                  <td className="border border-gray-300 px-3 py-2">{i + 1}</td>
                  <td className="border border-gray-300 px-3 py-2">{f.name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    {(f.amount - f.discount).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  colSpan={2}
                  className="border border-gray-300 px-3 py-2 text-right font-semibold"
                >
                  Total
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                  {receipt.totalAmount.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signature */}
          <div className="text-right text-sm text-gray-700 pr-1">
            Principal / Accountant
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center gap-3 rounded-b-lg">
          <Button
            data-ocid="fee-receipts.close_button"
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Close
          </Button>
          <Button
            data-ocid="fee-receipts.primary_button"
            onClick={handlePrint}
            className="px-6 bg-[#4a90c4] hover:bg-[#3a7ab0] text-white gap-2"
          >
            <Printer className="w-4 h-4" /> Print
          </Button>
          <div className="ml-auto flex flex-col gap-1 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={schoolCopy}
                onChange={(e) => setSchoolCopy(e.target.checked)}
                className="w-4 h-4 accent-[#4a90c4]"
              />
              <span>School Copy</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={parentCopy}
                onChange={(e) => setParentCopy(e.target.checked)}
                className="w-4 h-4 accent-[#4a90c4]"
              />
              <span>Parent Copy</span>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FeeReceiptsPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptType | null>(
    null,
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!profileLoading && !profile) navigate({ to: "/login" });
  }, [profile, profileLoading, navigate]);

  async function handleLogout() {
    await logoutMutation.mutateAsync("token");
    navigate({ to: "/login" });
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return FEE_RECEIPTS.filter((r) => {
      if (
        q &&
        !r.studentName.toLowerCase().includes(q) &&
        !r.receiptNo.toLowerCase().includes(q)
      )
        return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      return true;
    });
  }, [search, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, totalPages));
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="fee-receipts.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading receipts...</p>
        </div>
      </div>
    );
  }

  const userName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : "User";
  const role = profile?.schoolRole ?? "Admin";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        role={String(role)}
        userName={userName}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0"
        >
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Fee Receipts
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Search and view all generated receipts
            </p>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Total Receipts",
                value: String(FEE_RECEIPTS.length),
                border: "border-blue-100",
              },
              {
                label: "Filtered",
                value: String(filtered.length),
                border: "border-gray-200",
              },
              {
                label: "Total Value",
                value: fmt(filtered.reduce((s, r) => s + r.totalAmount, 0)),
                border: "border-green-100",
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-xl border ${s.border} p-4 shadow-sm`}
              >
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                data-ocid="fee-receipts.search_input"
                placeholder="Search by name or receipt no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>From</span>
              <Input
                data-ocid="fee-receipts.input"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-8 text-sm w-36"
              />
              <span>To</span>
              <Input
                data-ocid="fee-receipts.input"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-8 text-sm w-36"
              />
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table data-ocid="fee-receipts.table">
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-100">
                    {[
                      "Receipt No",
                      "Date",
                      "Student Name",
                      "Class",
                      "Fee Heads",
                      "Amount",
                      "Method",
                    ].map((h) => (
                      <TableHead
                        key={h}
                        className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 whitespace-nowrap"
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div
                          data-ocid="fee-receipts.empty_state"
                          className="flex flex-col items-center py-14 text-center"
                        >
                          <Receipt className="w-10 h-10 text-gray-300 mb-3" />
                          <p className="text-sm font-semibold text-gray-600">
                            No receipts found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((r, idx) => (
                      <TableRow
                        key={r.id}
                        data-ocid={`fee-receipts.row.${idx + 1}`}
                        onClick={() => setSelectedReceipt(r)}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                      >
                        <TableCell className="py-3 font-mono text-xs text-blue-700 font-semibold whitespace-nowrap">
                          {r.receiptNo}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-600 whitespace-nowrap">
                          {r.date}
                        </TableCell>
                        <TableCell className="py-3 text-sm font-medium text-gray-800 whitespace-nowrap">
                          {r.studentName}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-600">
                          {r.grade}-{r.section}
                        </TableCell>
                        <TableCell className="py-3 text-xs text-gray-500 max-w-[180px] truncate">
                          {r.feeHeads.map((f) => f.name).join(", ")}
                        </TableCell>
                        <TableCell className="py-3 font-bold text-sm text-gray-900 whitespace-nowrap">
                          {fmt(r.totalAmount)}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-600">
                          {r.paymentMethod}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    data-ocid="fee-receipts.pagination_prev"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg = safePage <= 3 ? i + 1 : safePage + i - 2;
                    if (pg < 1 || pg > totalPages) return null;
                    return (
                      <Button
                        key={pg}
                        variant={pg === safePage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pg)}
                        className={`h-7 w-7 p-0 text-xs ${pg === safePage ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                      >
                        {pg}
                      </Button>
                    );
                  })}
                  <Button
                    data-ocid="fee-receipts.pagination_next"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          <p className="text-xs text-center text-gray-400">
            Click any row to view and print the receipt
          </p>
        </div>
      </main>

      {selectedReceipt && (
        <ReceiptDetailModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
