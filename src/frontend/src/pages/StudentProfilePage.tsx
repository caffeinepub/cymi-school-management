import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { SEED_DATA, type Student, seededRandom } from "../data/students";
import { useCallerUserProfile, useLogout } from "../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";

// ─── Attendance Ring ──────────────────────────────────────────────────────────

function AttendanceRingLarge({ pct }: { pct: number }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(circ * (1 - pct / 100));
    }, 120);
    return () => clearTimeout(t);
  }, [pct, circ]);

  const color = pct >= 85 ? "#10B981" : pct >= 70 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
      <svg
        width="128"
        height="128"
        viewBox="0 0 128 128"
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={64}
          cy={64}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={12}
        />
        <circle
          cx={64}
          cy={64}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{pct}%</span>
        <span className="text-xs text-gray-400">Attendance</span>
      </div>
    </div>
  );
}

// ─── Fee Status Badge ─────────────────────────────────────────────────────────

function FeeStatusBadge({ status }: { status: string }) {
  if (status === "Paid")
    return (
      <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">
        Paid
      </Badge>
    );
  if (status === "Pending")
    return (
      <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100">
        Pending
      </Badge>
    );
  return (
    <Badge className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">
      Overdue
    </Badge>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ student }: { student: Student }) {
  const fields = [
    { label: "Date of Birth", value: student.dob },
    { label: "Gender", value: student.gender },
    { label: "Phone", value: student.phone },
    { label: "Email", value: student.email },
    { label: "Parent Name", value: student.parentName },
    { label: "Parent Phone", value: student.parentPhone },
    { label: "Join Date", value: student.joinDate },
    { label: "Fee Status", value: null, badge: student.feeStatus },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Info grid */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Personal Information
        </h3>
        <div className="space-y-3">
          {fields.map(({ label, value, badge }) => (
            <div key={label} className="flex items-start justify-between gap-2">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide flex-shrink-0 w-32">
                {label}
              </span>
              <span className="text-sm text-gray-800 font-medium text-right">
                {badge ? <FeeStatusBadge status={badge} /> : value || "—"}
              </span>
            </div>
          ))}
        </div>

        {/* Address */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
            Address
          </p>
          <p className="text-sm text-gray-700">{student.address || "—"}</p>
        </div>
      </div>

      {/* Attendance ring */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center gap-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide self-start">
          Attendance Overview
        </h3>
        <AttendanceRingLarge pct={student.attendancePct} />
        <p className="text-xs text-gray-400 text-center">
          Overall attendance this academic year
        </p>
      </div>
    </div>
  );
}

// ─── Attendance Tab ───────────────────────────────────────────────────────────

function AttendanceTab({ student }: { student: Student }) {
  const rng = seededRandom(student.id * 13 + 7);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const monthName = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Generate deterministic status for each past day
  const dayStatuses: Record<
    number,
    "present" | "absent" | "late" | "future" | "weekend"
  > = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month, d).getDay();
    if (d > today) {
      dayStatuses[d] = "future";
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      dayStatuses[d] = "weekend";
    } else {
      const roll = rng();
      if (roll < 0.78) dayStatuses[d] = "present";
      else if (roll < 0.92) dayStatuses[d] = "late";
      else dayStatuses[d] = "absent";
    }
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const statusColor: Record<string, string> = {
    present: "bg-green-100 text-green-700 border border-green-200",
    absent: "bg-red-100 text-red-700 border border-red-200",
    late: "bg-amber-100 text-amber-700 border border-amber-200",
    future: "bg-gray-50 text-gray-300 border border-dashed border-gray-200",
    weekend: "bg-gray-100 text-gray-400 border border-gray-100",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
        {monthName} — Monthly Attendance
      </h3>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {days.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Blank cells before month starts */}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`blank-pad-${i + 1}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const status = dayStatuses[d];
          return (
            <div
              key={d}
              title={
                status === "future"
                  ? "Future"
                  : status === "weekend"
                    ? "Weekend"
                    : status
              }
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-semibold ${statusColor[status]} ${
                d === today ? "ring-2 ring-blue-400 ring-offset-1" : ""
              }`}
            >
              {d}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
        {[
          { label: "Present", cls: "bg-green-100 border border-green-200" },
          { label: "Absent", cls: "bg-red-100 border border-red-200" },
          { label: "Late", cls: "bg-amber-100 border border-amber-200" },
          { label: "Weekend", cls: "bg-gray-100 border border-gray-100" },
        ].map(({ label, cls }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${cls}`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared data types ────────────────────────────────────────────────────────

export interface FeeRecord {
  term: string;
  amount: string;
  dueDate: string;
  paidDate: string | null;
  status: string;
}

export interface AcademicRow {
  subject: string;
  marks: number;
  grade: { letter: string; color: string };
}

export function generateFeeTerms(student: Student): FeeRecord[] {
  const rng = seededRandom(student.id * 7 + 3);
  return [
    {
      term: "Term 1 (April – July)",
      amount: "₹12,500",
      dueDate: "2025-04-15",
      paidDate: rng() < 0.85 ? "2025-04-10" : null,
      status: rng() < 0.85 ? "Paid" : "Overdue",
    },
    {
      term: "Term 2 (August – November)",
      amount: "₹12,500",
      dueDate: "2025-08-15",
      paidDate: rng() < 0.75 ? "2025-08-12" : null,
      status: rng() < 0.75 ? "Paid" : "Pending",
    },
    {
      term: "Term 3 (December – March)",
      amount: "₹12,500",
      dueDate: "2025-12-15",
      paidDate: null,
      status: "Pending",
    },
  ];
}

function getGrade(marks: number): { letter: string; color: string } {
  if (marks >= 90)
    return { letter: "A+", color: "text-green-700 bg-green-100" };
  if (marks >= 80) return { letter: "A", color: "text-green-600 bg-green-50" };
  if (marks >= 70) return { letter: "B", color: "text-blue-700 bg-blue-100" };
  if (marks >= 60) return { letter: "C", color: "text-amber-700 bg-amber-100" };
  if (marks >= 50)
    return { letter: "D", color: "text-orange-700 bg-orange-100" };
  return { letter: "F", color: "text-red-700 bg-red-100" };
}

export function generateAcademicRows(student: Student): AcademicRow[] {
  const rng = seededRandom(student.id * 11 + 5);
  const subjects = [
    "Mathematics",
    "Science",
    "English",
    "Hindi",
    "Social Studies",
    "Computer Science",
  ];
  return subjects.map((subject) => {
    const marks = Math.floor(rng() * 40) + 55;
    return { subject, marks, grade: getGrade(marks) };
  });
}

// ─── Fees Tab ─────────────────────────────────────────────────────────────────

function FeesTab({ terms }: { terms: FeeRecord[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Fee History — Academic Year 2025–26
        </h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/40">
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Term
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Amount
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Due Date
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Paid Date
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {terms.map((row, idx) => (
            <TableRow
              key={row.term}
              data-ocid={`profile.fees.row.${idx + 1}`}
              className="border-b border-gray-50 last:border-0"
            >
              <TableCell className="text-sm text-gray-800 font-medium py-3">
                {row.term}
              </TableCell>
              <TableCell className="text-sm font-semibold text-gray-900 py-3">
                {row.amount}
              </TableCell>
              <TableCell className="text-sm text-gray-600 py-3">
                {row.dueDate}
              </TableCell>
              <TableCell className="text-sm text-gray-600 py-3">
                {row.paidDate ?? "—"}
              </TableCell>
              <TableCell className="py-3">
                <FeeStatusBadge status={row.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Academics Tab ────────────────────────────────────────────────────────────

function AcademicsTab({ rows }: { rows: AcademicRow[] }) {
  const total = rows.reduce((sum, r) => sum + r.marks, 0);
  const avg = Math.round(total / rows.length);
  const avgGrade = getGrade(avg);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Academic Performance — Latest Term
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Average:</span>
          <span className="text-sm font-bold text-gray-900">{avg}/100</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${avgGrade.color}`}
          >
            {avgGrade.letter}
          </span>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/40">
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Subject
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Marks
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Out of
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Percentage
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Grade
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow
              key={row.subject}
              data-ocid={`profile.academics.row.${idx + 1}`}
              className="border-b border-gray-50 last:border-0"
            >
              <TableCell className="text-sm font-semibold text-gray-800 py-3">
                {row.subject}
              </TableCell>
              <TableCell className="text-sm font-bold text-gray-900 py-3">
                {row.marks}
              </TableCell>
              <TableCell className="text-sm text-gray-500 py-3">100</TableCell>
              <TableCell className="py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 max-w-[100px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-700"
                      style={{ width: `${row.marks}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {row.marks}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-3">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.grade.color}`}
                >
                  {row.grade.letter}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Main StudentProfilePage ──────────────────────────────────────────────────

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id: string };
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  // Auth redirect
  useEffect(() => {
    if (!profileLoading && !profile) {
      navigate({ to: "/login" });
    }
  }, [profile, profileLoading, navigate]);

  async function handleLogout() {
    await logoutMutation.mutateAsync("token");
    navigate({ to: "/login" });
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="profile.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const userName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : "User";
  const role = profile?.schoolRole ?? "Admin";

  const student: Student | undefined = SEED_DATA.find(
    (s) => s.id === Number(id),
  );

  // Generate data at page level so it can be used for export AND passed to tabs
  const feeTerms = student ? generateFeeTerms(student) : [];
  const academicRows = student ? generateAcademicRows(student) : [];

  // ── Export handlers ──
  function handleExportOverviewExcel() {
    if (!student) return;
    const rows = [
      { Field: "Name", Value: `${student.firstName} ${student.lastName}` },
      { Field: "Admission No", Value: student.admissionNo },
      { Field: "Grade", Value: student.grade },
      { Field: "Section", Value: student.section },
      { Field: "Gender", Value: student.gender },
      { Field: "Date of Birth", Value: student.dob },
      { Field: "Phone", Value: student.phone },
      { Field: "Email", Value: student.email },
      { Field: "Parent Name", Value: student.parentName },
      { Field: "Parent Phone", Value: student.parentPhone },
      { Field: "Join Date", Value: student.joinDate },
      { Field: "Fee Status", Value: student.feeStatus },
      { Field: "Attendance %", Value: `${student.attendancePct}%` },
      { Field: "Address", Value: student.address },
    ];
    exportToExcel(`student-${student.admissionNo}-overview`, [
      { name: "Overview", rows },
    ]);
  }

  function handleExportFeesExcel() {
    if (!student) return;
    const rows = feeTerms.map((t) => ({
      Term: t.term,
      Amount: t.amount,
      "Due Date": t.dueDate,
      "Paid Date": t.paidDate ?? "—",
      Status: t.status,
    }));
    exportToExcel(`student-${student.admissionNo}-fees`, [
      { name: "Fees", rows },
    ]);
  }

  function handleExportFeesPDF() {
    if (!student) return;
    const columns = ["Term", "Amount", "Due Date", "Paid Date", "Status"];
    const rows: (string | number)[][] = feeTerms.map((t) => [
      t.term,
      t.amount,
      t.dueDate,
      t.paidDate ?? "—",
      t.status,
    ]);
    exportToPDF(
      `student-${student.admissionNo}-fees`,
      `Fee History — ${student.firstName} ${student.lastName}`,
      columns,
      rows,
      `${student.admissionNo} | Grade ${student.grade}-${student.section}`,
    );
  }

  function handleExportAcademicsExcel() {
    if (!student) return;
    const rows = academicRows.map((r) => ({
      Subject: r.subject,
      Marks: r.marks,
      "Out of": 100,
      "Percentage (%)": r.marks,
      Grade: r.grade.letter,
    }));
    exportToExcel(`student-${student.admissionNo}-academics`, [
      { name: "Academics", rows },
    ]);
  }

  function handleExportAcademicsPDF() {
    if (!student) return;
    const columns = ["Subject", "Marks", "Out of", "Percentage", "Grade"];
    const rows: (string | number)[][] = academicRows.map((r) => [
      r.subject,
      r.marks,
      100,
      `${r.marks}%`,
      r.grade.letter,
    ]);
    exportToPDF(
      `student-${student.admissionNo}-academics`,
      `Academic Performance — ${student.firstName} ${student.lastName}`,
      columns,
      rows,
      `${student.admissionNo} | Grade ${student.grade}-${student.section} | Latest Term`,
    );
  }

  if (!student) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar
          role={String(role)}
          userName={userName}
          onLogout={handleLogout}
        />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <div data-ocid="profile.error_state" className="text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <User className="w-9 h-9 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Student Not Found
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              No student found with ID {id}.
            </p>
            <Button
              data-ocid="profile.secondary_button"
              onClick={() => navigate({ to: "/students" })}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Students
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const initials =
    `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

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
          <div className="flex items-center gap-4">
            {/* Back button */}
            <Button
              data-ocid="profile.secondary_button"
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/students" })}
              className="gap-1.5 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Students
            </Button>

            {/* Export dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-ocid="profile.export.button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  data-ocid="profile.export.overview_excel_button"
                  onClick={handleExportOverviewExcel}
                  className="gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Export Overview (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="profile.export.fees_excel_button"
                  onClick={handleExportFeesExcel}
                  className="gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Export Fees (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="profile.export.fees_pdf_button"
                  onClick={handleExportFeesPDF}
                  className="gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-red-500" />
                  Export Fees (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="profile.export.academics_excel_button"
                  onClick={handleExportAcademicsExcel}
                  className="gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Export Academics (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="profile.export.academics_pdf_button"
                  onClick={handleExportAcademicsPDF}
                  className="gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-red-500" />
                  Export Academics (PDF)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Avatar + name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {student.firstName} {student.lastName}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-gray-400">
                    {student.admissionNo}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0.5 border-blue-200 text-blue-700 bg-blue-50"
                  >
                    Grade {student.grade} – Section {student.section}
                  </Badge>
                  <FeeStatusBadge status={student.feeStatus} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs content */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <Tabs defaultValue="overview" data-ocid="profile.panel">
              <TabsList className="mb-4 bg-white border border-gray-100 shadow-sm rounded-xl p-1">
                <TabsTrigger
                  data-ocid="profile.tab"
                  value="overview"
                  className="gap-1.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <User className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="profile.tab"
                  value="attendance"
                  className="gap-1.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Attendance
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="profile.tab"
                  value="fees"
                  className="gap-1.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <CreditCard className="w-4 h-4" />
                  Fees
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="profile.tab"
                  value="academics"
                  className="gap-1.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <BookOpen className="w-4 h-4" />
                  Academics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <OverviewTab student={student} />
              </TabsContent>

              <TabsContent value="attendance">
                <AttendanceTab student={student} />
              </TabsContent>

              <TabsContent value="fees">
                <FeesTab terms={feeTerms} />
              </TabsContent>

              <TabsContent value="academics">
                <AcademicsTab rows={academicRows} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
