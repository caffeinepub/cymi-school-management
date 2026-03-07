import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
  Download,
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
  function handlePrint() {
    const win = window.open("", "_blank_rcp");
    if (!win) return;
    const rows = receipt.feeHeads
      .map(
        (f) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${f.name}</td>
       <td style="padding:8px;text-align:right;border-bottom:1px solid #e5e7eb;">₹${f.amount.toLocaleString("en-IN")}</td>
       <td style="padding:8px;text-align:right;border-bottom:1px solid #e5e7eb;">${f.discount > 0 ? `₹${f.discount.toLocaleString("en-IN")}` : "—"}</td>
       <td style="padding:8px;text-align:right;border-bottom:1px solid #e5e7eb;font-weight:600;">₹${(f.amount - f.discount).toLocaleString("en-IN")}</td></tr>`,
      )
      .join("");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${receipt.receiptNo}</title>
    <style>
    *{box-sizing:border-box;}body{font-family:Arial,sans-serif;padding:32px;max-width:680px;margin:0 auto;color:#1f2937;}
    .header{display:flex;align-items:center;gap:16px;border-bottom:3px solid #1e40af;padding-bottom:16px;margin-bottom:20px;}
    .school-name{font-size:20px;font-weight:800;color:#1e40af;}
    .receipt-title{font-size:13px;color:#6b7280;margin:2px 0;}
    .receipt-num{font-family:monospace;font-weight:700;font-size:15px;color:#1e40af;}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;margin-bottom:20px;}
    .info-label{color:#6b7280;} .info-val{font-weight:600;}
    table{width:100%;border-collapse:collapse;}
    th{background:#1e40af;color:#fff;padding:10px 8px;text-align:left;font-size:12px;}
    td{font-size:13px;}
    .total-row{background:#eff6ff;font-weight:700;font-size:15px;}
    .footer{margin-top:24px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px;text-align:center;}
    @media print{@page{margin:14mm;}}
    </style></head><body>
    <div class="header">
    <img src="/assets/uploads/cymi-1.PNG" width="60" height="60" style="object-fit:contain;"/>
    <div><div class="school-name">CYMI Computer Institute</div><div class="receipt-title">Official Fee Receipt</div></div>
    <div style="margin-left:auto;text-align:right;">
    <div class="receipt-num">${receipt.receiptNo}</div>
    <div style="font-size:12px;color:#6b7280;margin-top:4px;">${receipt.date}</div>
    </div></div>
    <div class="info-grid">
    <div><span class="info-label">Student Name: </span><span class="info-val">${receipt.studentName}</span></div>
    <div><span class="info-label">Admission No: </span><span class="info-val">${receipt.admissionNo}</span></div>
    <div><span class="info-label">Class: </span><span class="info-val">${receipt.grade}-${receipt.section}</span></div>
    <div><span class="info-label">Payment Method: </span><span class="info-val">${receipt.paymentMethod}</span></div>
    </div>
    <table><thead><tr><th>Fee Head</th><th style="text-align:right">Amount</th><th style="text-align:right">Discount</th><th style="text-align:right">Net Amount</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr class="total-row"><td colspan="3" style="padding:10px 8px;">Total Amount Paid</td>
    <td style="padding:10px 8px;text-align:right;">₹${receipt.totalAmount.toLocaleString("en-IN")}</td></tr></tfoot></table>
    ${receipt.remarks ? `<p style="margin-top:12px;font-size:12px;color:#374151;"><b>Remarks:</b> ${receipt.remarks}</p>` : ""}
    <div class="footer">This is a computer generated receipt. No signature required. | CYMI Computer Institute</div>
    <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
    </body></html>`);
    win.document.close();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="fee-receipts.dialog"
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" /> Receipt Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4">
            <img
              src="/assets/uploads/cymi-1.PNG"
              alt="CYMI"
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className="flex-1">
              <p className="font-bold text-blue-900">CYMI Computer Institute</p>
              <p className="text-xs text-blue-700">Official Fee Receipt</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-bold text-blue-900">
                {receipt.receiptNo}
              </p>
              <p className="text-xs text-blue-700">{receipt.date}</p>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Student:</span>{" "}
              <span className="font-medium">{receipt.studentName}</span>
            </div>
            <div>
              <span className="text-gray-500">Adm No:</span>{" "}
              <span className="font-medium font-mono text-xs">
                {receipt.admissionNo}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Class:</span>{" "}
              <span className="font-medium">
                {receipt.grade}-{receipt.section}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Method:</span>{" "}
              <span className="font-medium">{receipt.paymentMethod}</span>
            </div>
          </div>

          <Separator />

          {/* Fee Lines */}
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-500 uppercase px-1">
              <span className="col-span-2">Fee Head</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Discount</span>
            </div>
            {receipt.feeHeads.map((f) => (
              <div key={f.name} className="grid grid-cols-4 gap-2 text-sm px-1">
                <span className="col-span-2 text-gray-700">{f.name}</span>
                <span className="text-right font-medium">{fmt(f.amount)}</span>
                <span className="text-right text-green-600">
                  {f.discount > 0 ? fmt(f.discount) : "—"}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold text-base px-1">
              <span>Total Paid</span>
              <span className="text-blue-700">{fmt(receipt.totalAmount)}</span>
            </div>
          </div>

          {receipt.remarks && (
            <p className="text-xs text-gray-500 italic bg-gray-50 rounded p-2">
              Remarks: {receipt.remarks}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              data-ocid="fee-receipts.primary_button"
              onClick={handlePrint}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </Button>
            <Button
              data-ocid="fee-receipts.secondary_button"
              variant="outline"
              onClick={handlePrint}
              className="flex-1 gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF
            </Button>
          </div>
          <Button
            data-ocid="fee-receipts.close_button"
            variant="ghost"
            onClick={onClose}
            className="w-full text-gray-500"
          >
            Close
          </Button>
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
