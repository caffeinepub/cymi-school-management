import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  AlertTriangle,
  Bell,
  BellRing,
  FileSpreadsheet,
  FileText,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { FEE_DEFAULTERS } from "../../data/feeConcessions";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const ALL_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const PAGE_SIZE = 20;

function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
  borderColor,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`bg-white rounded-xl border ${borderColor} p-4 flex items-center gap-4 shadow-sm`}
    >
      <div
        className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}
      >
        <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </motion.div>
  );
}

function overdueBadge(days: number) {
  if (days > 30) return "bg-red-100 text-red-700";
  if (days >= 15) return "bg-amber-100 text-amber-700";
  return "bg-yellow-100 text-yellow-700";
}

export default function FeeDefaultersPage() {
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
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterFeeHead, setFilterFeeHead] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);

  const allFeeHeads = useMemo(
    () => [...new Set(FEE_DEFAULTERS.map((d) => d.feeHead))],
    [],
  );

  const filtered = useMemo(() => {
    return FEE_DEFAULTERS.filter((d) => {
      const matchSearch =
        search === "" ||
        d.studentName.toLowerCase().includes(search.toLowerCase());
      const matchGrade =
        filterGrade === "all" || String(d.grade) === filterGrade;
      const matchFeeHead =
        filterFeeHead === "all" || d.feeHead === filterFeeHead;
      const matchStatus = filterStatus === "all" || d.status === filterStatus;
      return matchSearch && matchGrade && matchFeeHead && matchStatus;
    });
  }, [search, filterGrade, filterFeeHead, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(
    () => ({
      total: FEE_DEFAULTERS.length,
      outstanding: FEE_DEFAULTERS.reduce((s, d) => s + d.balance, 0),
      overdue30: FEE_DEFAULTERS.filter((d) => d.overdueDays > 30).length,
      noticesSent: Math.floor(FEE_DEFAULTERS.length * 0.6),
    }),
    [],
  );

  function sendReminder(name: string) {
    toast.success(`Reminder sent to ${name}`);
  }

  function sendBulkReminder() {
    toast.success(`Bulk reminder sent to ${filtered.length} defaulters`);
  }

  function handleExportExcel() {
    exportToExcel("fee_defaulters", [
      {
        name: "Fee Defaulters",
        rows: filtered.map((d) => ({
          "#": d.id,
          Student: d.studentName,
          "Admission No": d.admissionNo,
          Class: `${d.grade}-${d.section}`,
          "Fee Head": d.feeHead,
          "Amount Due": d.amount,
          Paid: d.paidAmount,
          Balance: d.balance,
          "Overdue Days": d.overdueDays,
          "Last Payment": d.lastPayment,
          Status: d.status,
        })),
      },
    ]);
    toast.success("Excel downloaded");
  }

  function handleExportPDF() {
    exportToPDF(
      "fee_defaulters",
      "CYMI \u2014 Fee Defaulters",
      [
        "#",
        "Student",
        "Class",
        "Fee Head",
        "Amount",
        "Paid",
        "Balance",
        "Overdue Days",
        "Status",
      ],
      filtered.map((d) => [
        d.id,
        d.studentName,
        `${d.grade}-${d.section}`,
        d.feeHead,
        `\u20b9${d.amount}`,
        `\u20b9${d.paidAmount}`,
        `\u20b9${d.balance}`,
        d.overdueDays,
        d.status,
      ]),
    );
    toast.success("PDF downloaded");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        role={String(role)}
        userName={userName}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-red-700 to-red-500 px-6 py-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Fee Defaulters</h1>
                <p className="text-red-100 text-sm">
                  Track overdue fees and send reminders
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={handleExportExcel}
                data-ocid="fee-defaulters.secondary_button"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={handleExportPDF}
                data-ocid="fee-defaulters.secondary_button"
              >
                <FileText className="w-4 h-4 mr-1" /> PDF
              </Button>
              <Button
                size="sm"
                className="bg-white text-red-700 hover:bg-red-50 font-semibold"
                onClick={sendBulkReminder}
                data-ocid="fee-defaulters.primary_button"
              >
                <BellRing className="w-4 h-4 mr-1" /> Send Bulk Reminder
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="p-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Defaulters"
              value={String(stats.total)}
              icon={<AlertTriangle className="w-5 h-5" />}
              color="text-red-600"
              bgColor="bg-red-50"
              borderColor="border-red-100"
              delay={0}
            />
            <StatCard
              label="Total Outstanding"
              value={`\u20b9${stats.outstanding.toLocaleString("en-IN")}`}
              icon={<FileText className="w-5 h-5" />}
              color="text-orange-600"
              bgColor="bg-orange-50"
              borderColor="border-orange-100"
              delay={0.05}
            />
            <StatCard
              label="Overdue > 30 Days"
              value={String(stats.overdue30)}
              icon={<Bell className="w-5 h-5" />}
              color="text-rose-600"
              bgColor="bg-rose-50"
              borderColor="border-rose-100"
              delay={0.1}
            />
            <StatCard
              label="Notices Sent"
              value={String(stats.noticesSent)}
              icon={<BellRing className="w-5 h-5" />}
              color="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-100"
              delay={0.15}
            />
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center"
          >
            <div className="relative flex-1 min-w-48">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by student name..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                data-ocid="fee-defaulters.search_input"
              />
            </div>
            <Select
              value={filterGrade}
              onValueChange={(v) => {
                setFilterGrade(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36" data-ocid="fee-defaulters.select">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {ALL_GRADES.map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    Class {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterFeeHead}
              onValueChange={(v) => {
                setFilterFeeHead(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44" data-ocid="fee-defaulters.select">
                <SelectValue placeholder="All Fee Heads" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fee Heads</SelectItem>
                {allFeeHeads.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterStatus}
              onValueChange={(v) => {
                setFilterStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36" data-ocid="fee-defaulters.select">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <Table data-ocid="fee-defaulters.table">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Fee Head</TableHead>
                  <TableHead className="text-right">Amount Due</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Overdue Days</TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="text-center py-12 text-gray-400"
                      data-ocid="fee-defaulters.empty_state"
                    >
                      No defaulters found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((d, idx) => (
                    <TableRow
                      key={d.id}
                      className="hover:bg-red-50/30"
                      data-ocid={`fee-defaulters.item.${idx + 1}`}
                    >
                      <TableCell className="text-gray-500 text-xs">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">
                        {d.studentName}
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs">
                        {d.admissionNo}
                      </TableCell>
                      <TableCell>
                        {d.grade}-{d.section}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {d.feeHead}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        \u20b9{d.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-green-700">
                        \u20b9{d.paidAmount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        \u20b9{d.balance.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${overdueBadge(d.overdueDays)} border-0 text-xs`}
                        >
                          {d.overdueDays}d
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs">
                        {d.lastPayment}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`border-0 text-xs ${
                            d.status === "Overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {d.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => sendReminder(d.studentName)}
                          data-ocid={`fee-defaulters.button.${idx + 1}`}
                        >
                          <Bell className="w-3 h-3 mr-1" /> Remind
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}\u2013
                  {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    data-ocid="fee-defaulters.pagination_prev"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    data-ocid="fee-defaulters.pagination_next"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
