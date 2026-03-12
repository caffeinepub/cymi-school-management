import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";
import { useCallerUserProfile, useLogout } from "../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";

// ── Types ────────────────────────────────────────────────────────────────────

interface ReportItem {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface YearFolder {
  id: string;
  label: string;
  type: "academic" | "financial";
  period: string;
  reports: ReportItem[];
}

// ── Data ─────────────────────────────────────────────────────────────────────

const REPORT_TYPES: ReportItem[] = [
  {
    id: "attendance",
    name: "Attendance Report",
    description: "Daily / monthly attendance by class and student",
    category: "Attendance",
  },
  {
    id: "fee-collection",
    name: "Fee Collection Report",
    description: "Fee collected, pending, and waived amounts",
    category: "Finance",
  },
  {
    id: "fee-defaulter",
    name: "Fee Defaulter Report",
    description: "Students with outstanding fee dues",
    category: "Finance",
  },
  {
    id: "student-enrollment",
    name: "Student Enrollment Report",
    description: "Enrollment counts by class, gender, and status",
    category: "Students",
  },
  {
    id: "student-progress",
    name: "Student Progress Report",
    description: "Academic performance and grade distribution",
    category: "Students",
  },
  {
    id: "teacher-attendance",
    name: "Teacher Attendance Report",
    description: "Staff attendance summary by department",
    category: "Staff",
  },
  {
    id: "teacher-performance",
    name: "Teacher Performance Report",
    description: "Assessment scores and performance rankings",
    category: "Staff",
  },
  {
    id: "exam-results",
    name: "Exam Results Report",
    description: "Results summary by exam, class, and subject",
    category: "Academics",
  },
  {
    id: "transport",
    name: "Transport Report",
    description: "Route-wise student count and vehicle utilization",
    category: "Transport",
  },
  {
    id: "admissions",
    name: "Admissions Report",
    description: "New admissions, enquiries, and conversion rates",
    category: "Admissions",
  },
];

const YEAR_FOLDERS: YearFolder[] = [
  {
    id: "ay-2025-26",
    label: "Academic Year 2025–26",
    type: "academic",
    period: "June 2025 – May 2026",
    reports: REPORT_TYPES,
  },
  {
    id: "fy-2025-26",
    label: "Financial Year 2025–26",
    type: "financial",
    period: "April 2025 – March 2026",
    reports: REPORT_TYPES,
  },
  {
    id: "ay-2024-25",
    label: "Academic Year 2024–25",
    type: "academic",
    period: "June 2024 – May 2025",
    reports: REPORT_TYPES,
  },
  {
    id: "fy-2024-25",
    label: "Financial Year 2024–25",
    type: "financial",
    period: "April 2024 – March 2025",
    reports: REPORT_TYPES,
  },
  {
    id: "ay-2023-24",
    label: "Academic Year 2023–24",
    type: "academic",
    period: "June 2023 – May 2024",
    reports: REPORT_TYPES,
  },
  {
    id: "fy-2023-24",
    label: "Financial Year 2023–24",
    type: "financial",
    period: "April 2023 – March 2024",
    reports: REPORT_TYPES,
  },
];

// ── Category badge colors ────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Attendance: "bg-blue-50 text-blue-600 border-blue-100",
  Finance: "bg-green-50 text-green-600 border-green-100",
  Students: "bg-purple-50 text-purple-600 border-purple-100",
  Staff: "bg-amber-50 text-amber-600 border-amber-100",
  Academics: "bg-indigo-50 text-indigo-600 border-indigo-100",
  Transport: "bg-cyan-50 text-cyan-600 border-cyan-100",
  Admissions: "bg-rose-50 text-rose-600 border-rose-100",
};

// ── Sample export data generators ────────────────────────────────────────────

function getSampleRows(reportId: string, yearLabel: string) {
  const base = {
    Report: reportId
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    Year: yearLabel,
  };
  if (reportId === "attendance") {
    return [
      {
        ...base,
        Class: "Grade 1",
        "Present Days": 210,
        "Absent Days": 15,
        "Attendance %": "93%",
      },
      {
        ...base,
        Class: "Grade 2",
        "Present Days": 205,
        "Absent Days": 20,
        "Attendance %": "91%",
      },
      {
        ...base,
        Class: "Grade 3",
        "Present Days": 215,
        "Absent Days": 10,
        "Attendance %": "96%",
      },
    ];
  }
  if (reportId === "fee-collection") {
    return [
      {
        ...base,
        Month: "April",
        "Collected (₹)": 320000,
        "Pending (₹)": 45000,
        "Waived (₹)": 5000,
      },
      {
        ...base,
        Month: "May",
        "Collected (₹)": 290000,
        "Pending (₹)": 60000,
        "Waived (₹)": 0,
      },
      {
        ...base,
        Month: "June",
        "Collected (₹)": 350000,
        "Pending (₹)": 20000,
        "Waived (₹)": 3000,
      },
    ];
  }
  if (reportId === "student-enrollment") {
    return [
      { ...base, Class: "Grade 1", Boys: 26, Girls: 22, Total: 48 },
      { ...base, Class: "Grade 2", Boys: 24, Girls: 21, Total: 45 },
      { ...base, Class: "Grade 3", Boys: 27, Girls: 23, Total: 50 },
    ];
  }
  return [
    { ...base, Item: "Row 1", Value: "Sample Data" },
    { ...base, Item: "Row 2", Value: "Sample Data" },
    { ...base, Item: "Row 3", Value: "Sample Data" },
  ];
}

function getSamplePDFColumns(reportId: string) {
  if (reportId === "attendance")
    return ["Class", "Present Days", "Absent Days", "Attendance %"];
  if (reportId === "fee-collection")
    return ["Month", "Collected (₹)", "Pending (₹)", "Waived (₹)"];
  if (reportId === "student-enrollment")
    return ["Class", "Boys", "Girls", "Total"];
  return ["Item", "Value"];
}

function getSamplePDFRows(
  reportId: string,
  yearLabel: string,
): (string | number)[][] {
  return getSampleRows(reportId, yearLabel).map(
    (row) => Object.values(row).slice(2) as (string | number)[],
  );
}

// ── Summary Card ──────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  icon,
  bg,
  fg,
  delay,
  ocid,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
  fg: string;
  delay: number;
  ocid: string;
}) {
  return (
    <motion.div
      data-ocid={ocid}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
    >
      <div
        className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}
      >
        <span className={fg}>{icon}</span>
      </div>
      <div>
        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {label}
        </div>
        <div className="text-2xl font-bold text-gray-800 leading-none mt-1">
          {value}
        </div>
      </div>
    </motion.div>
  );
}

// ── Folder Row ────────────────────────────────────────────────────────────────

function FolderRow({ folder, index }: { folder: YearFolder; index: number }) {
  const [open, setOpen] = useState(index === 0);

  function handleExcelDownload(report: ReportItem) {
    const rows = getSampleRows(report.id, folder.label);
    exportToExcel(`${folder.id}-${report.id}`, [{ name: report.name, rows }]);
    toast.success(`Excel downloaded: ${report.name} (${folder.label})`);
  }

  function handlePDFDownload(report: ReportItem) {
    const cols = getSamplePDFColumns(report.id);
    const rows = getSamplePDFRows(report.id, folder.label);
    exportToPDF(
      `${folder.id}-${report.id}`,
      `${report.name} — ${folder.label}`,
      cols,
      rows,
      `Period: ${folder.period}`,
    );
    toast.success(`PDF downloaded: ${report.name} (${folder.label})`);
  }

  const folderColor =
    folder.type === "academic" ? "bg-blue-600" : "bg-emerald-600";
  const folderBorder =
    folder.type === "academic"
      ? "border-blue-200 hover:border-blue-400"
      : "border-emerald-200 hover:border-emerald-400";
  const folderBg = folder.type === "academic" ? "bg-blue-50" : "bg-emerald-50";

  return (
    <motion.div
      data-ocid={`reports.folder.item.${index + 1}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={`bg-white rounded-xl border-2 ${folderBorder} overflow-hidden shadow-sm transition-all`}
    >
      {/* Folder Header */}
      <button
        type="button"
        data-ocid={`reports.folder.toggle.${index + 1}`}
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${open ? folderBg : "hover:bg-gray-50"}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg ${folderColor} flex items-center justify-center flex-shrink-0`}
          >
            <FolderOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-800 text-sm">
              {folder.label}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {folder.period} &middot; {folder.reports.length} reports
            </div>
          </div>
          <span
            className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium border ${
              folder.type === "academic"
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-emerald-50 text-emerald-600 border-emerald-200"
            }`}
          >
            {folder.type === "academic" ? "Academic Year" : "Financial Year"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-xs hidden sm:inline">
            {open ? "Collapse" : "Expand"}
          </span>
          {open ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Reports List */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="divide-y divide-gray-100">
              {folder.reports.map((report, rIdx) => (
                <div
                  key={report.id}
                  data-ocid={`reports.folder.report.item.${rIdx + 1}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${
                          CATEGORY_COLORS[report.category] ??
                          "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {report.category}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {report.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {report.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-12 sm:ml-0">
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`reports.folder.excel_button.${rIdx + 1}`}
                      onClick={() => handleExcelDownload(report)}
                      className="flex items-center gap-1.5 text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300 h-8 px-3 text-xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Excel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`reports.folder.pdf_button.${rIdx + 1}`}
                      onClick={() => handlePDFDownload(report)}
                      className="flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-8 px-3 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("cymi_token");

  useEffect(() => {
    if (!token) navigate({ to: "/" });
  }, [token, navigate]);

  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();
  const role = (profile?.schoolRole as string) ?? "";
  const [activeTab, setActiveTab] = useState<"all" | "academic" | "financial">(
    "all",
  );

  useEffect(() => {
    if (!profileLoading && role && role !== "SuperAdmin" && role !== "Admin") {
      navigate({ to: "/dashboard" });
    }
  }, [role, profileLoading, navigate]);

  const handleLogout = async () => {
    if (token) {
      try {
        await logoutMutation.mutateAsync(token);
      } catch {
        /* ignore */
      }
    }
    localStorage.removeItem("cymi_token");
    localStorage.removeItem("cymi_profile");
    navigate({ to: "/" });
  };

  const userName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "User";

  const filteredFolders = YEAR_FOLDERS.filter((f) =>
    activeTab === "all" ? true : f.type === activeTab,
  );

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Navbar ── */}
        <nav
          className="navbar-cymi flex items-center justify-between px-4 py-2 shadow-md z-10 flex-shrink-0"
          style={{ minHeight: 56 }}
        >
          <div className="flex items-center gap-3">
            <BarChart2 className="w-5 h-5 text-white/80" />
            <span className="text-white font-semibold text-base tracking-wide hidden sm:inline">
              Reports & Downloads
            </span>
            <span className="text-white font-semibold text-sm tracking-wide sm:hidden">
              Reports
            </span>
          </div>
          <div className="flex items-center gap-4">
            {profileLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white/70" />
            ) : profile ? (
              <div className="text-right hidden sm:block">
                <div className="text-white text-sm font-semibold leading-tight">
                  {profile.firstName} {profile.lastName}
                </div>
                <div className="text-white/70 text-xs">{role}</div>
              </div>
            ) : null}
            <button
              type="button"
              data-ocid="reports.notification.button"
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="overflow-y-auto flex-1 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto w-full">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-gray-800">
                Reports & Downloads
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Download reports by academic or financial year in PDF or Excel
                format
              </p>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <SummaryCard
                ocid="reports.stats.students_card"
                label="Total Students"
                value="520"
                icon={<Users className="w-6 h-6" />}
                bg="bg-blue-50"
                fg="text-blue-500"
                delay={0.05}
              />
              <SummaryCard
                ocid="reports.stats.teachers_card"
                label="Total Teachers"
                value="160"
                icon={<Users className="w-6 h-6" />}
                bg="bg-green-50"
                fg="text-green-600"
                delay={0.09}
              />
              <SummaryCard
                ocid="reports.stats.attendance_card"
                label="Avg Attendance"
                value="91%"
                icon={<TrendingUp className="w-6 h-6" />}
                bg="bg-purple-50"
                fg="text-purple-500"
                delay={0.13}
              />
              <SummaryCard
                ocid="reports.stats.fees_card"
                label="Fee Collected"
                value="₹32.4L"
                icon={<BarChart2 className="w-6 h-6" />}
                bg="bg-amber-50"
                fg="text-amber-500"
                delay={0.17}
              />
            </div>

            {/* Filter Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center gap-2 mb-5"
            >
              {(["all", "academic", "financial"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  data-ocid={`reports.filter.${tab}.tab`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {tab === "all"
                    ? "All Years"
                    : tab === "academic"
                      ? "Academic Years"
                      : "Financial Years"}
                </button>
              ))}
              <span className="ml-auto text-xs text-gray-400">
                {filteredFolders.length} folders
              </span>
            </motion.div>

            {/* Folder list */}
            <div className="flex flex-col gap-4">
              {filteredFolders.map((folder, i) => (
                <FolderRow key={folder.id} folder={folder} index={i} />
              ))}
            </div>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-400 flex-shrink-0">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Built with ♥ using caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
