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
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { FEE_STUDENTS, FEE_TRANSACTIONS } from "../../data/fees";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function TimelineIcon({ status }: { status: string }) {
  if (status === "Paid")
    return <CheckCircle2 className="w-5 h-5 text-green-600" />;
  if (status === "Partial")
    return <Clock className="w-5 h-5 text-yellow-600" />;
  if (status === "Overdue")
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  return <CalendarClock className="w-5 h-5 text-blue-600" />;
}

function TimelineDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid: "bg-green-500",
    Partial: "bg-yellow-500",
    Pending: "bg-blue-400",
    Overdue: "bg-red-500",
  };
  return (
    <div
      className={`w-3 h-3 rounded-full ${map[status] ?? "bg-gray-400"} flex-shrink-0 mt-1`}
    />
  );
}

const MONTHS = [
  "All",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTH_MAP: Record<string, string> = {
  Jan: "-01-",
  Feb: "-02-",
  Mar: "-03-",
  Apr: "-04-",
  May: "-05-",
  Jun: "-06-",
  Jul: "-07-",
  Aug: "-08-",
  Sep: "-09-",
  Oct: "-10-",
  Nov: "-11-",
  Dec: "-12-",
};

export default function FeeHistoryPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<
    (typeof FEE_STUDENTS)[0] | null
  >(null);

  // Filters
  const [filterYear, setFilterYear] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    if (!profileLoading && !profile) navigate({ to: "/login" });
  }, [profile, profileLoading, navigate]);

  async function handleLogout() {
    await logoutMutation.mutateAsync("token");
    navigate({ to: "/login" });
  }

  const searchResults = useMemo(() => {
    if (!search.trim() || search.length < 2) return [];
    const q = search.toLowerCase();
    return FEE_STUDENTS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [search]);

  function selectStudent(s: (typeof FEE_STUDENTS)[0]) {
    setSelectedStudent(s);
    setSearch(s.name);
    setShowDropdown(false);
  }

  // Get ALL transactions for selected student (unfiltered, for summary use)
  const allStudentTransactions = useMemo(() => {
    if (!selectedStudent) return [];
    return FEE_TRANSACTIONS.filter(
      (t) => t.studentId === selectedStudent.id,
    ).sort((a, b) => {
      if (a.paymentDate && b.paymentDate)
        return b.paymentDate.localeCompare(a.paymentDate);
      if (a.paymentDate) return -1;
      if (b.paymentDate) return 1;
      return 0;
    });
  }, [selectedStudent]);

  // Apply filters
  const studentTransactions = useMemo(() => {
    let txns = allStudentTransactions;
    if (filterYear !== "All") {
      txns = txns.filter(
        (t) =>
          t.paymentDate?.startsWith(filterYear) || (!t.paymentDate && false),
      );
    }
    if (filterMonth !== "All") {
      const monthPart = MONTH_MAP[filterMonth] ?? "";
      txns = txns.filter((t) => t.paymentDate?.includes(monthPart));
    }
    if (filterStatus !== "All") {
      txns = txns.filter((t) => t.status === filterStatus);
    }
    return txns;
  }, [allStudentTransactions, filterYear, filterMonth, filterStatus]);

  const summary = useMemo(() => {
    if (!selectedStudent) return null;
    const totalAssessed = allStudentTransactions.reduce(
      (s, t) => s + t.amount,
      0,
    );
    const totalPaid = allStudentTransactions.reduce(
      (s, t) => s + t.paidAmount,
      0,
    );
    const outstanding = totalAssessed - totalPaid;
    const paidTxns = allStudentTransactions
      .filter((t) => t.paymentDate)
      .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
    const lastPayment = paidTxns[0]?.paymentDate;
    return { totalAssessed, totalPaid, outstanding, lastPayment };
  }, [selectedStudent, allStudentTransactions]);

  // Filtered summary (for visible rows)
  const filteredSummary = useMemo(() => {
    const totalPaid = studentTransactions
      .filter((t) => t.status === "Paid")
      .reduce((s, t) => s + t.paidAmount, 0);
    const totalPending = studentTransactions
      .filter(
        (t) =>
          t.status === "Pending" ||
          t.status === "Partial" ||
          t.status === "Overdue",
      )
      .reduce((s, t) => s + t.balance, 0);
    const grandTotal = studentTransactions.reduce((s, t) => s + t.amount, 0);
    return { totalPaid, totalPending, grandTotal };
  }, [studentTransactions]);

  function handleExportExcel() {
    if (!studentTransactions.length) return;
    exportToExcel(`fee-history-${selectedStudent?.name}`, [
      {
        name: "Fee History",
        rows: studentTransactions.map((t, i) => ({
          "#": i + 1,
          Date: t.paymentDate || "—",
          "Receipt No": t.receiptNo,
          "Fee Type": t.feeHead,
          Amount: t.amount,
          Paid: t.paidAmount,
          Balance: t.balance,
          Method: t.paymentMethod,
          Status: t.status,
          Remarks: t.remarks || "",
        })),
      },
    ]);
  }

  function handleExportPDF() {
    if (!studentTransactions.length) return;
    exportToPDF(
      `fee-history-${selectedStudent?.name}`,
      `CYMI — Fee History: ${selectedStudent?.name}`,
      [
        "#",
        "Date",
        "Receipt No",
        "Fee Type",
        "Amount",
        "Paid",
        "Balance",
        "Method",
        "Status",
      ],
      studentTransactions.map((t, i) => [
        i + 1,
        t.paymentDate || "—",
        t.receiptNo,
        t.feeHead,
        fmt(t.amount),
        fmt(t.paidAmount),
        fmt(t.balance),
        t.paymentMethod,
        t.status,
      ]),
      `${selectedStudent?.name} | ${selectedStudent?.admissionNo}`,
    );
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="fee-history.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
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
                <CalendarClock className="w-5 h-5 text-blue-600" /> Fee History
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Student-wise fee payment history and timeline
              </p>
            </div>
            {selectedStudent && studentTransactions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-ocid="fee-history.secondary_button"
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    data-ocid="fee-history.export.excel_button"
                    onClick={handleExportExcel}
                    className="gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />{" "}
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-ocid="fee-history.export.pdf_button"
                    onClick={handleExportPDF}
                    className="gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-red-500" /> Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* Student Search */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                data-ocid="fee-history.search_input"
                placeholder="Search student by name or admission number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) {
                    setSelectedStudent(null);
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                className="pl-9"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedStudent(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <AnimatePresence>
                {showDropdown && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                  >
                    {searchResults.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectStudent(s)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                          {s.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {s.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.admissionNo} · Class {s.grade}-{s.section}
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {selectedStudent && summary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Summary Panel */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Total Assessed",
                      value: fmt(summary.totalAssessed),
                      icon: <TrendingUp className="w-5 h-5" />,
                      color: "text-gray-700",
                      bg: "bg-gray-50",
                      border: "border-gray-200",
                    },
                    {
                      label: "Total Paid",
                      value: fmt(summary.totalPaid),
                      icon: <CheckCircle2 className="w-5 h-5" />,
                      color: "text-green-600",
                      bg: "bg-green-50",
                      border: "border-green-100",
                    },
                    {
                      label: "Outstanding",
                      value: fmt(summary.outstanding),
                      icon: <AlertCircle className="w-5 h-5" />,
                      color: "text-red-600",
                      bg: "bg-red-50",
                      border: "border-red-100",
                    },
                    {
                      label: "Last Payment",
                      value: summary.lastPayment || "N/A",
                      icon: <CalendarClock className="w-5 h-5" />,
                      color: "text-blue-600",
                      bg: "bg-blue-50",
                      border: "border-blue-100",
                    },
                  ].map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`bg-white rounded-xl border ${s.border} p-4 flex items-center gap-3 shadow-sm`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className={s.color}>{s.icon}</span>
                      </div>
                      <div>
                        <p className={`text-base font-bold ${s.color}`}>
                          {s.value}
                        </p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Student Card + Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Student Info */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {selectedStudent.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {selectedStudent.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Class {selectedStudent.grade}-
                          {selectedStudent.section}
                        </p>
                      </div>
                    </div>
                    <Separator className="mb-4" />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Admission No</span>
                        <span className="font-mono text-xs font-medium">
                          {selectedStudent.admissionNo}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Total Transactions
                        </span>
                        <span className="font-medium">
                          {studentTransactions.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Paid</span>
                        <span className="font-medium text-green-600">
                          {
                            studentTransactions.filter(
                              (t) => t.status === "Paid",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pending</span>
                        <span className="font-medium text-amber-600">
                          {
                            studentTransactions.filter(
                              (t) =>
                                t.status === "Pending" ||
                                t.status === "Partial",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Overdue</span>
                        <span className="font-medium text-red-600">
                          {
                            studentTransactions.filter(
                              (t) => t.status === "Overdue",
                            ).length
                          }
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Collection progress</span>
                        <span>
                          {Math.round(
                            (summary.totalPaid /
                              Math.max(1, summary.totalAssessed)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.round((summary.totalPaid / Math.max(1, summary.totalAssessed)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <h3 className="font-semibold text-gray-800">
                        Payment Timeline
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-3.5 h-3.5 text-gray-400" />
                        <Select
                          value={filterYear}
                          onValueChange={setFilterYear}
                        >
                          <SelectTrigger
                            data-ocid="fee-history.year.select"
                            className="h-7 text-xs w-[80px]"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["All", "2024", "2025", "2026"].map((y) => (
                              <SelectItem key={y} value={y}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={filterMonth}
                          onValueChange={setFilterMonth}
                        >
                          <SelectTrigger
                            data-ocid="fee-history.month.select"
                            className="h-7 text-xs w-[80px]"
                          >
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
                        <Select
                          value={filterStatus}
                          onValueChange={setFilterStatus}
                        >
                          <SelectTrigger
                            data-ocid="fee-history.status.select"
                            className="h-7 text-xs w-[90px]"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "All",
                              "Paid",
                              "Pending",
                              "Partial",
                              "Overdue",
                            ].map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {studentTransactions.length === 0 ? (
                      <div
                        data-ocid="fee-history.empty_state"
                        className="flex flex-col items-center py-10 text-center text-gray-400"
                      >
                        <CalendarClock className="w-10 h-10 mb-2 opacity-30" />
                        <p className="text-sm">
                          No transactions match the selected filters
                        </p>
                      </div>
                    ) : (
                      <>
                        <AnimatePresence>
                          <div className="space-y-0 max-h-72 overflow-y-auto pr-2">
                            {studentTransactions.map((t, i) => (
                              <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2, delay: i * 0.03 }}
                                data-ocid={`fee-history.item.${i + 1}`}
                                className="flex gap-3 group"
                              >
                                {/* Timeline line */}
                                <div className="flex flex-col items-center">
                                  <TimelineDot status={t.status} />
                                  {i < studentTransactions.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-gray-100 my-1" />
                                  )}
                                </div>
                                {/* Content */}
                                <div
                                  className={`flex-1 pb-3 ${i < studentTransactions.length - 1 ? "border-b border-gray-50" : ""}`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <TimelineIcon status={t.status} />
                                        <span className="text-sm font-semibold text-gray-800">
                                          {t.feeHead}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-gray-500 font-mono">
                                          {t.receiptNo}
                                        </span>
                                        {t.paymentDate && (
                                          <span className="text-xs text-gray-500">
                                            {t.paymentDate}
                                          </span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                          {t.paymentMethod}
                                        </span>
                                      </div>
                                      {t.remarks && (
                                        <p className="text-xs text-amber-600 mt-0.5 italic">
                                          {t.remarks}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-sm font-bold text-gray-900">
                                        {fmt(t.paidAmount)}
                                      </p>
                                      {t.balance > 0 && (
                                        <p className="text-xs text-red-500">
                                          Bal: {fmt(t.balance)}
                                        </p>
                                      )}
                                      <Badge
                                        className={`text-xs mt-1 ${
                                          t.status === "Paid"
                                            ? "bg-green-100 text-green-700"
                                            : t.status === "Partial"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : t.status === "Overdue"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-blue-100 text-blue-700"
                                        } hover:opacity-90`}
                                      >
                                        {t.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </AnimatePresence>
                        {/* Summary footer */}
                        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-gray-400">Total Paid</p>
                            <p className="text-sm font-bold text-green-700">
                              {fmt(filteredSummary.totalPaid)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">
                              Total Pending
                            </p>
                            <p className="text-sm font-bold text-amber-700">
                              {fmt(filteredSummary.totalPending)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Grand Total</p>
                            <p className="text-sm font-bold text-gray-800">
                              {fmt(filteredSummary.grandTotal)}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedStudent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center justify-center py-16 text-center text-gray-400"
            >
              <Search className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-base font-medium text-gray-500">
                Search for a student to view their fee history
              </p>
              <p className="text-sm mt-1">
                Enter a name or admission number above
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
