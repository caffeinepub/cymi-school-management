import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Save,
  UserX,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";
import { SEED_DATA, type Student } from "../data/students";
import { useCallerUserProfile, useLogout } from "../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";

// ─── AnimatedCounter (local copy) ─────────────────────────────────────────────

function AnimatedCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1000;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return <>{display}</>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceStatus = "Present" | "Absent" | "Late";

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  delay?: number;
}

function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
  borderColor,
  delay = 0,
}: StatCardProps) {
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
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Attendance Toggle ────────────────────────────────────────────────────────

function AttendanceToggle({
  status,
  onChange,
}: {
  status: AttendanceStatus;
  onChange: (s: AttendanceStatus) => void;
}) {
  const options: {
    value: AttendanceStatus;
    label: string;
    active: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "Present",
      label: "P",
      active: "bg-green-500 text-white border-green-500",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    {
      value: "Absent",
      label: "A",
      active: "bg-red-500 text-white border-red-500",
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    {
      value: "Late",
      label: "L",
      active: "bg-amber-500 text-white border-amber-500",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.value}
          className={`flex items-center justify-center w-7 h-7 rounded-lg border text-xs font-bold transition-all duration-150 ${
            status === opt.value
              ? opt.active
              : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main AttendancePage ──────────────────────────────────────────────────────

export default function AttendancePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [gradeFilter, setGradeFilter] = useState("5");
  const [sectionFilter, setSectionFilter] = useState("A");
  const [saving, setSaving] = useState(false);

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

  // Filtered students
  const filteredStudents = useMemo(() => {
    return SEED_DATA.filter(
      (s) => String(s.grade) === gradeFilter && s.section === sectionFilter,
    );
  }, [gradeFilter, sectionFilter]);

  // Attendance state — default all to "Present"
  const [attendance, setAttendance] = useState<Map<number, AttendanceStatus>>(
    () => new Map(),
  );

  // Reset attendance when filter changes
  useEffect(() => {
    const initial = new Map<number, AttendanceStatus>();
    for (const s of filteredStudents) {
      initial.set(s.id, "Present");
    }
    setAttendance(initial);
  }, [filteredStudents]);

  function setStudentAttendance(id: number, status: AttendanceStatus) {
    setAttendance((prev) => {
      const next = new Map(prev);
      next.set(id, status);
      return next;
    });
  }

  // Stats
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    for (const s of filteredStudents) {
      const st = attendance.get(s.id) ?? "Present";
      if (st === "Present") present++;
      else if (st === "Absent") absent++;
      else late++;
    }
    return { total: filteredStudents.length, present, absent, late };
  }, [filteredStudents, attendance]);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success(`Attendance saved for ${stats.total} students`, {
      description: `${selectedDate} — Grade ${gradeFilter}${sectionFilter}: ${stats.present} Present, ${stats.absent} Absent, ${stats.late} Late`,
    });
  }

  // ── Mark All helpers ──
  function markAll(status: AttendanceStatus) {
    setAttendance((prev) => {
      const next = new Map(prev);
      for (const s of filteredStudents) {
        next.set(s.id, status);
      }
      return next;
    });
    toast.success(`All students marked as ${status}`);
  }

  // ── Export helpers ──
  const exportFilename = `attendance-grade${gradeFilter}-section${sectionFilter}-${selectedDate}`;

  function handleExportExcel() {
    const rows = filteredStudents.map((s, i) => ({
      "#": i + 1,
      "Admission No": s.admissionNo,
      Name: `${s.firstName} ${s.lastName}`,
      Grade: s.grade,
      Section: s.section,
      Status: attendance.get(s.id) ?? "Present",
      Date: selectedDate,
    }));
    exportToExcel(exportFilename, [{ name: "Attendance", rows }]);
    toast.success("Excel file downloaded");
  }

  function handleExportPDF() {
    const columns = [
      "#",
      "Admission No",
      "Name",
      "Grade",
      "Section",
      "Status",
      "Date",
    ];
    const rows: (string | number)[][] = filteredStudents.map((s, i) => [
      i + 1,
      s.admissionNo,
      `${s.firstName} ${s.lastName}`,
      s.grade,
      s.section,
      attendance.get(s.id) ?? "Present",
      selectedDate,
    ]);
    exportToPDF(
      exportFilename,
      `Attendance Report — Grade ${gradeFilter} Section ${sectionFilter} — ${selectedDate}`,
      columns,
      rows,
      `Total: ${stats.present} Present, ${stats.absent} Absent, ${stats.late} Late`,
    );
    toast.success("PDF file downloaded");
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="attendance.loading_state"
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
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
                Attendance
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Mark and track daily student attendance
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-blue-50 text-blue-700 border border-blue-100 text-sm px-3 py-1">
                {selectedDate}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-ocid="attendance.export.button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    data-ocid="attendance.export.excel_button"
                    onClick={handleExportExcel}
                    className="gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-ocid="attendance.export.pdf_button"
                    onClick={handleExportPDF}
                    className="gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        {/* School-wide Summary Stats */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              {
                label: "Total Students",
                value: 520,
                icon: <Users className="w-5 h-5" />,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
                delay: 0.04,
              },
              {
                label: "Present Today",
                value: 478,
                icon: <CheckCircle2 className="w-5 h-5" />,
                color: "text-green-600",
                bg: "bg-green-50",
                border: "border-green-100",
                delay: 0.08,
              },
              {
                label: "Absent Today",
                value: 30,
                icon: <UserX className="w-5 h-5" />,
                color: "text-red-600",
                bg: "bg-red-50",
                border: "border-red-100",
                delay: 0.12,
              },
              {
                label: "Late Today",
                value: 12,
                icon: <Clock className="w-5 h-5" />,
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-100",
                delay: 0.16,
              },
            ].map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: s.delay }}
                className={`bg-white rounded-xl border ${s.border} p-3 flex items-center gap-3 shadow-sm`}
              >
                <div
                  className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <span className={s.color}>{s.icon}</span>
                </div>
                <div>
                  <p className={`text-xl font-bold ${s.color}`}>
                    <AnimatedCounter target={s.value} />
                  </p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Attendance Rate Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-gray-50 rounded-xl p-3 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">
                Today's Attendance Rate
              </span>
              <span className="text-sm font-bold text-green-700">91.9%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="bg-green-500 h-2.5 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "91.9%" }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">0%</span>
              <span className="text-xs text-gray-400">Target: 95%</span>
              <span className="text-xs text-gray-400">100%</span>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white border-b border-gray-100 px-6 py-3 flex-shrink-0"
        >
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <label
                htmlFor="attendance-date"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                Date
              </label>
              <input
                id="attendance-date"
                data-ocid="attendance.input"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={today}
                className="h-8 px-3 rounded-md border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Grade
              </span>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger
                  data-ocid="attendance.select"
                  className="h-8 text-sm w-[110px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                    <SelectItem key={g} value={String(g)}>
                      Grade {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Section
              </span>
              <Select value={sectionFilter} onValueChange={setSectionFilter}>
                <SelectTrigger
                  data-ocid="attendance.select"
                  className="h-8 text-sm w-[110px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D"].map((s) => (
                    <SelectItem key={s} value={s}>
                      Section {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Mark All quick-action bar */}
        {filteredStudents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="bg-white border-b border-gray-100 px-6 py-2.5 flex-shrink-0"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
                Mark All:
              </span>
              <Button
                data-ocid="attendance.mark_all_present.button"
                size="sm"
                variant="outline"
                onClick={() => markAll("Present")}
                className="h-7 text-xs gap-1.5 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                All Present
              </Button>
              <Button
                data-ocid="attendance.mark_all_absent.button"
                size="sm"
                variant="outline"
                onClick={() => markAll("Absent")}
                className="h-7 text-xs gap-1.5 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
              >
                <XCircle className="w-3.5 h-3.5" />
                All Absent
              </Button>
              <Button
                data-ocid="attendance.mark_all_late.button"
                size="sm"
                variant="outline"
                onClick={() => markAll("Late")}
                className="h-7 text-xs gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
              >
                <Clock className="w-3.5 h-3.5" />
                All Late
              </Button>
            </div>
          </motion.div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Total Students"
              value={stats.total}
              icon={<Users className="w-5 h-5" />}
              color="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-100"
              delay={0.1}
            />
            <StatCard
              label="Present"
              value={stats.present}
              icon={<CheckCircle2 className="w-5 h-5" />}
              color="text-green-600"
              bgColor="bg-green-50"
              borderColor="border-green-100"
              delay={0.15}
            />
            <StatCard
              label="Absent"
              value={stats.absent}
              icon={<UserX className="w-5 h-5" />}
              color="text-red-600"
              bgColor="bg-red-50"
              borderColor="border-red-100"
              delay={0.2}
            />
            <StatCard
              label="Late"
              value={stats.late}
              icon={<Clock className="w-5 h-5" />}
              color="text-amber-600"
              bgColor="bg-amber-50"
              borderColor="border-amber-100"
              delay={0.25}
            />
          </div>

          {/* Student list */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* List header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
              <p className="text-sm font-semibold text-gray-700">
                Grade {gradeFilter} — Section {sectionFilter}
              </p>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-green-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> P = Present
                </span>
                <span className="flex items-center gap-1 text-red-600 font-semibold">
                  <XCircle className="w-3.5 h-3.5" /> A = Absent
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Clock className="w-3.5 h-3.5" /> L = Late
                </span>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div
                data-ocid="attendance.empty_state"
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <Users className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-600">
                  No students in this class
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Try a different grade or section
                </p>
              </div>
            ) : (
              <div data-ocid="attendance.list">
                {filteredStudents.map((student: Student, idx: number) => {
                  const status = attendance.get(student.id) ?? "Present";
                  const ocidIdx = idx + 1;
                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.02 }}
                      data-ocid={`attendance.item.${ocidIdx}`}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                        status === "Absent"
                          ? "bg-red-50/30"
                          : status === "Late"
                            ? "bg-amber-50/30"
                            : "hover:bg-gray-50/50"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                          status === "Present"
                            ? "bg-green-100 text-green-700"
                            : status === "Absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </div>

                      {/* Name & info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {student.admissionNo}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${
                          status === "Present"
                            ? "bg-green-100 text-green-700"
                            : status === "Absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {status}
                      </span>

                      {/* Toggle */}
                      <AttendanceToggle
                        status={status}
                        onChange={(s) => setStudentAttendance(student.id, s)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Save button */}
          {filteredStudents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.5 }}
              className="flex justify-end pb-4"
            >
              <Button
                data-ocid="attendance.primary_button"
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Attendance
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
