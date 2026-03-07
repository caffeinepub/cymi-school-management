import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { FEE_TRANSACTIONS } from "../../data/fees";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const PAGE_SIZE = 25;
const SECTIONS = ["A", "B", "C", "D"];
const FEE_HEADS = [
  "Tuition Fee",
  "Transport Fee",
  "Library Fee",
  "Lab Fee",
  "Sports Fee",
  "Exam Fee",
  "Miscellaneous Fee",
];
const MONTHS = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid: "bg-green-100 text-green-700 border-green-200",
    Partial: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Pending: "bg-blue-100 text-blue-700 border-blue-200",
    Overdue: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <Badge
      className={`${map[status] ?? "bg-gray-100 text-gray-600"} hover:opacity-90`}
    >
      {status}
    </Badge>
  );
}

export default function FeeRegisterPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [feeTypeFilter, setFeeTypeFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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
    return FEE_TRANSACTIONS.filter((t) => {
      if (
        q &&
        !t.studentName.toLowerCase().includes(q) &&
        !t.receiptNo.toLowerCase().includes(q)
      )
        return false;
      if (classFilter !== "all" && t.grade !== Number(classFilter))
        return false;
      if (sectionFilter !== "all" && t.section !== sectionFilter) return false;
      if (feeTypeFilter !== "all" && t.feeHead !== feeTypeFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (
        monthFilter !== "all" &&
        t.paymentDate &&
        !t.paymentDate.includes(monthFilter)
      )
        return false;
      return true;
    });
  }, [
    search,
    classFilter,
    sectionFilter,
    feeTypeFilter,
    monthFilter,
    statusFilter,
  ]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, totalPages));
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const stats = useMemo(
    () => ({
      totalRecords: filtered.length,
      totalAmount: filtered.reduce((s, t) => s + t.amount, 0),
      totalPaid: filtered.reduce((s, t) => s + t.paidAmount, 0),
      totalBalance: filtered.reduce((s, t) => s + t.balance, 0),
    }),
    [filtered],
  );

  function handleExportExcel() {
    exportToExcel("fee-register", [
      {
        name: "Fee Register",
        rows: filtered.map((t, i) => ({
          "#": i + 1,
          "Receipt No": t.receiptNo,
          "Student Name": t.studentName,
          "Admission No": t.admissionNo,
          Class: `${t.grade}-${t.section}`,
          "Fee Type": t.feeHead,
          Amount: t.amount,
          Paid: t.paidAmount,
          Balance: t.balance,
          Method: t.paymentMethod,
          Date: t.paymentDate || "—",
          Status: t.status,
        })),
      },
    ]);
    toast.success("Excel downloaded");
  }

  function handleExportPDF() {
    exportToPDF(
      "fee-register",
      "CYMI — Fee Register",
      [
        "#",
        "Receipt No",
        "Student",
        "Class",
        "Fee Type",
        "Amount",
        "Paid",
        "Balance",
        "Method",
        "Date",
        "Status",
      ],
      filtered.map((t, i) => [
        i + 1,
        t.receiptNo,
        t.studentName,
        `${t.grade}-${t.section}`,
        t.feeHead,
        fmt(t.amount),
        fmt(t.paidAmount),
        fmt(t.balance),
        t.paymentMethod,
        t.paymentDate || "—",
        t.status,
      ]),
      `${filtered.length} records | Generated ${new Date().toLocaleDateString("en-IN")}`,
    );
    toast.success("PDF downloaded");
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="fee-register.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading register...</p>
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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> Fee Register
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Complete ledger of all fee transactions
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-ocid="fee-register.secondary_button"
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  data-ocid="fee-register.export.excel_button"
                  onClick={handleExportExcel}
                  className="gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" /> Export
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="fee-register.export.pdf_button"
                  onClick={handleExportPDF}
                  className="gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-red-500" /> Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Total Records",
                value: String(stats.totalRecords),
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
              },
              {
                label: "Total Amount",
                value: fmt(stats.totalAmount),
                color: "text-gray-700",
                bg: "bg-gray-50",
                border: "border-gray-200",
              },
              {
                label: "Total Paid",
                value: fmt(stats.totalPaid),
                color: "text-green-600",
                bg: "bg-green-50",
                border: "border-green-100",
              },
              {
                label: "Outstanding",
                value: fmt(stats.totalBalance),
                color: "text-red-600",
                bg: "bg-red-50",
                border: "border-red-100",
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.05 }}
                className={`bg-white rounded-xl border ${s.border} p-4 shadow-sm`}
              >
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                data-ocid="fee-register.search_input"
                placeholder="Search by name or receipt..."
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
            {[
              {
                value: classFilter,
                onChange: setClassFilter,
                w: "w-[110px]",
                placeholder: "Class",
                options: Array.from({ length: 12 }, (_, i) => ({
                  value: String(i + 1),
                  label: `Class ${i + 1}`,
                })),
              },
              {
                value: sectionFilter,
                onChange: setSectionFilter,
                w: "w-[110px]",
                placeholder: "Section",
                options: SECTIONS.map((s) => ({
                  value: s,
                  label: `Section ${s}`,
                })),
              },
              {
                value: feeTypeFilter,
                onChange: setFeeTypeFilter,
                w: "w-[140px]",
                placeholder: "Fee Type",
                options: FEE_HEADS.map((h) => ({ value: h, label: h })),
              },
              {
                value: statusFilter,
                onChange: setStatusFilter,
                w: "w-[120px]",
                placeholder: "Status",
                options: ["Paid", "Partial", "Pending", "Overdue"].map((s) => ({
                  value: s,
                  label: s,
                })),
              },
              {
                value: monthFilter,
                onChange: setMonthFilter,
                w: "w-[110px]",
                placeholder: "Month",
                options: MONTHS.map((m) => ({ value: m, label: m })),
              },
            ].map((f) => (
              <Select
                key={f.placeholder}
                value={f.value}
                onValueChange={f.onChange}
              >
                <SelectTrigger
                  data-ocid="fee-register.select"
                  className={`h-8 text-sm ${f.w}`}
                >
                  <SelectValue placeholder={f.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {f.placeholder}s</SelectItem>
                  {f.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table data-ocid="fee-register.table">
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-100">
                    {[
                      "#",
                      "Receipt No",
                      "Student Name",
                      "Class",
                      "Fee Type",
                      "Amount",
                      "Paid",
                      "Balance",
                      "Method",
                      "Date",
                      "Status",
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
                      <TableCell colSpan={11}>
                        <div
                          data-ocid="fee-register.empty_state"
                          className="flex flex-col items-center py-14 text-center"
                        >
                          <BookOpen className="w-10 h-10 text-gray-300 mb-3" />
                          <p className="text-sm font-semibold text-gray-600">
                            No records found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((t, idx) => (
                      <TableRow
                        key={t.id}
                        data-ocid={`fee-register.row.${idx + 1}`}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <TableCell className="text-xs text-gray-400 font-mono py-2.5">
                          {(safePage - 1) * PAGE_SIZE + idx + 1}
                        </TableCell>
                        <TableCell className="py-2.5 font-mono text-xs text-blue-700 font-semibold whitespace-nowrap">
                          {t.receiptNo}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm font-medium text-gray-800 whitespace-nowrap">
                          {t.studentName}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm text-gray-600 whitespace-nowrap">
                          {t.grade}-{t.section}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm text-gray-600 whitespace-nowrap">
                          {t.feeHead}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {fmt(t.amount)}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm font-medium text-green-700 whitespace-nowrap">
                          {fmt(t.paidAmount)}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm font-medium text-red-600 whitespace-nowrap">
                          {fmt(t.balance)}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm text-gray-600 whitespace-nowrap">
                          {t.paymentMethod}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm text-gray-600 whitespace-nowrap">
                          {t.paymentDate || "—"}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <StatusBadge status={t.status} />
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
                  {filtered.length} records
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    data-ocid="fee-register.pagination_prev"
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
                    data-ocid="fee-register.pagination_next"
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
        </div>
      </main>
    </div>
  );
}
