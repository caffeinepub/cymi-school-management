import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  CalendarCheck,
  ClipboardCheck,
  Download,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { TEACHERS, type Teacher } from "../../data/teachers";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToPDF } from "../../utils/exportUtils";

// ─── Department color map ────────────────────────────────────────────────────

const DEPT_COLORS: Record<string, string> = {
  "Science & Mathematics": "bg-blue-600",
  Languages: "bg-purple-600",
  "Social Studies": "bg-green-600",
  "Computer Science": "bg-cyan-600",
  "Arts & Culture": "bg-pink-600",
  "Sports & Physical Education": "bg-orange-600",
  Commerce: "bg-teal-600",
  "Student Welfare": "bg-indigo-600",
  Administration: "bg-gray-600",
};

function getDeptColor(dept: string): string {
  return DEPT_COLORS[dept] ?? "bg-blue-600";
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Teacher["status"] }) {
  if (status === "Active")
    return (
      <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">
        Active
      </Badge>
    );
  if (status === "On Leave")
    return (
      <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100">
        On Leave
      </Badge>
    );
  return (
    <Badge className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">
      Inactive
    </Badge>
  );
}

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

// ─── Mock monthly attendance data ─────────────────────────────────────────────

function getMonthlyAttendance(seed: number) {
  const months = [
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
    "Apr",
    "May",
  ];
  let s = seed;
  function rng() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff) * 0.25 + 0.72;
  }
  return months.map((month) => {
    const workingDays = 25;
    const pct = Math.round(rng() * 100);
    const present = Math.round((pct / 100) * workingDays);
    return {
      month,
      workingDays,
      present,
      absent: workingDays - present,
      pct,
    };
  });
}

// ─── Timetable mock data ──────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

function generateTimetable(
  teacher: Teacher,
): Record<string, Record<number, string>> {
  const classes = teacher.assignedClasses.filter(
    (c) => c !== "All Grades" && !c.includes("All"),
  );
  if (classes.length === 0) return {};

  const timetable: Record<string, Record<number, string>> = {};
  let classIdx = 0;
  let seed = teacher.id * 31;

  for (const day of DAYS) {
    timetable[day] = {};
    const periodsToFill = 3 + (seed % 3);
    seed = (seed * 7 + 13) % 100;

    const usedPeriods = new Set<number>();
    for (let i = 0; i < periodsToFill; i++) {
      seed = (seed * 17 + 31) % 64;
      const period = (seed % 8) + 1;
      if (!usedPeriods.has(period)) {
        usedPeriods.add(period);
        timetable[day][period] =
          `${classes[classIdx % classes.length]} — ${teacher.subject}`;
        classIdx++;
      }
    }
  }
  return timetable;
}

// ─── Assessment helpers ───────────────────────────────────────────────────────

const ASSESSMENT_CATEGORIES = [
  { key: "teachingQuality", label: "Teaching Quality", prime: 37, offset: 62 },
  {
    key: "studentEngagement",
    label: "Student Engagement",
    prime: 41,
    offset: 58,
  },
  {
    key: "punctuality",
    label: "Punctuality & Discipline",
    prime: 43,
    offset: 65,
  },
  {
    key: "communication",
    label: "Communication Skills",
    prime: 47,
    offset: 60,
  },
  {
    key: "subjectKnowledge",
    label: "Subject Knowledge",
    prime: 53,
    offset: 68,
  },
  {
    key: "adminCompliance",
    label: "Administrative Compliance",
    prime: 59,
    offset: 55,
  },
];

function getAssessmentScores(teacherId: number): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const { key, prime, offset } of ASSESSMENT_CATEGORIES) {
    scores[key] = ((teacherId * prime + offset) % 35) + 60;
  }
  return scores;
}

function getOverallScore(scores: Record<string, number>): number {
  const vals = Object.values(scores);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-700";
  if (score >= 60) return "text-amber-700";
  return "text-red-600";
}

function getProgressColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

const ASSESSORS = [
  "Dr. Rajesh Kumar",
  "Mrs. Sunita Sharma",
  "Mr. Anil Mehta",
  "Dr. Priya Nair",
  "Mr. Suresh Pillai",
  "Mrs. Kavita Singh",
];

const TERMS = ["Term 1", "Term 2", "Term 3"];
const ACADEMIC_YEARS = ["2021-22", "2022-23", "2023-24", "2024-25"];
const REMARKS_POOL = [
  "Excellent performance. Highly recommended for senior roles.",
  "Good overall performance. Minor improvements needed in student engagement.",
  "Consistent and reliable. Meets all expectations.",
  "Above average in subject knowledge. Communication skills improving.",
  "Outstanding classroom management and student rapport.",
  "Satisfactory performance. Recommended for professional development training.",
];

function getAssessmentHistory(teacherId: number) {
  const rows: {
    term: string;
    year: string;
    assessor: string;
    score: number;
    grade: string;
    remarks: string;
  }[] = [];
  for (let i = 0; i < 5; i++) {
    const seed = teacherId * 13 + i * 77;
    const score = ((seed * 37 + 61) % 35) + 62;
    const termIdx = (seed * 3 + i) % 3;
    const yearIdx = (seed + i) % 4;
    const assessorIdx = (seed * 7 + i * 11) % ASSESSORS.length;
    const remarkIdx = (seed * 5 + i * 13) % REMARKS_POOL.length;
    rows.push({
      term: TERMS[termIdx],
      year: ACADEMIC_YEARS[yearIdx],
      assessor: ASSESSORS[assessorIdx],
      score,
      grade: getGrade(score),
      remarks: REMARKS_POOL[remarkIdx],
    });
  }
  return rows;
}

// ─── Assessment Score Ring ────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 56;
  const circ = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(circ * (1 - score / 100));
    }, 150);
    return () => clearTimeout(t);
  }, [score, circ]);

  const strokeColor =
    score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  const bgColor = score >= 80 ? "#D1FAE5" : score >= 60 ? "#FEF3C7" : "#FEE2E2";

  return (
    <div
      className="relative w-36 h-36 flex items-center justify-center"
      style={{ background: bgColor, borderRadius: "50%" }}
    >
      <svg
        width="144"
        height="144"
        viewBox="0 0 144 144"
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={72}
          cy={72}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={10}
        />
        <circle
          cx={72}
          cy={72}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      <div className="relative flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: strokeColor }}>
          {score}
        </span>
        <span className="text-xs font-semibold text-gray-500">out of 100</span>
      </div>
    </div>
  );
}

// ─── Assessment Tab ───────────────────────────────────────────────────────────

function AssessmentTab({
  teacher,
  role,
}: {
  teacher: Teacher;
  role: string;
}) {
  const scores = getAssessmentScores(teacher.id);
  const overall = getOverallScore(scores);
  const history = getAssessmentHistory(teacher.id);
  const radarData = ASSESSMENT_CATEGORIES.map(({ key, label }) => ({
    subject: `${label.split(" ")[0]}${label.includes("&") ? ` & ${label.split(" & ")[1]?.split(" ")[0]}` : ""}`,

    score: scores[key],
    fullMark: 100,
  }));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    term: "",
    year: "",
    assessor: "",
    score: "",
    remarks: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const canAddAssessment = role === "SuperAdmin" || role === "Admin";

  function handleSubmit() {
    if (!form.term || !form.year || !form.assessor || !form.score) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDialogOpen(false);
      setForm({ term: "", year: "", assessor: "", score: "", remarks: "" });
      toast.success(
        `Assessment recorded successfully for ${teacher.firstName} ${teacher.lastName}!`,
      );
    }, 800);
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Overall Performance Score
          </h3>
          {canAddAssessment && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  data-ocid="assessment.open_modal_button"
                  size="sm"
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                  Add Assessment
                </Button>
              </DialogTrigger>
              <DialogContent
                data-ocid="assessment.dialog"
                className="sm:max-w-md"
              >
                <DialogHeader>
                  <DialogTitle className="text-gray-900">
                    Add Assessment — {teacher.firstName} {teacher.lastName}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Term *
                      </Label>
                      <Select
                        value={form.term}
                        onValueChange={(v) =>
                          setForm((p) => ({ ...p, term: v }))
                        }
                      >
                        <SelectTrigger
                          data-ocid="assessment.select"
                          className="text-sm"
                        >
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          {TERMS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Academic Year *
                      </Label>
                      <Input
                        data-ocid="assessment.input"
                        placeholder="e.g. 2024-25"
                        value={form.year}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, year: e.target.value }))
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Assessor Name *
                    </Label>
                    <Input
                      data-ocid="assessment.input"
                      placeholder="Enter assessor name"
                      value={form.assessor}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, assessor: e.target.value }))
                      }
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Score (0–100) *
                    </Label>
                    <Input
                      data-ocid="assessment.input"
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Enter score"
                      value={form.score}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, score: e.target.value }))
                      }
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Remarks
                    </Label>
                    <Textarea
                      data-ocid="assessment.textarea"
                      placeholder="Enter assessment remarks..."
                      value={form.remarks}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, remarks: e.target.value }))
                      }
                      className="text-sm resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    data-ocid="assessment.cancel_button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    data-ocid="assessment.submit_button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Assessment"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={overall} />
            <div className="text-center">
              <span className={`text-lg font-bold ${getScoreColor(overall)}`}>
                Grade: {getGrade(overall)}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">
                {overall >= 80
                  ? "Excellent Performance"
                  : overall >= 60
                    ? "Good Performance"
                    : "Needs Improvement"}
              </p>
            </div>
          </div>

          {/* Category summary */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {ASSESSMENT_CATEGORIES.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">
                    {label}
                  </span>
                  <span
                    className={`text-xs font-bold ${getScoreColor(scores[key])}`}
                  >
                    {scores[key]}/100
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${getProgressColor(scores[key])}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${scores[key]}%` }}
                    transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Performance Radar
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart
            data={radarData}
            margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
          >
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickCount={5}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.18}
              strokeWidth={2}
              dot={{ r: 3, fill: "#3B82F6" }}
            />
            <Tooltip
              formatter={(v: number) => [`${v}/100`, "Score"]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 12,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Assessment History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Assessment History
          </h3>
        </div>
        <Table data-ocid="assessment.table">
          <TableHeader>
            <TableRow className="bg-gray-50/40">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Term
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Academic Year
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Assessor
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Score
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Grade
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Remarks
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((row, idx) => (
              <TableRow
                key={`${row.term}-${row.year}-${idx}`}
                data-ocid={`assessment.row.${idx + 1}`}
                className="border-b border-gray-50 last:border-0"
              >
                <TableCell className="text-sm font-medium text-gray-800 py-3">
                  {row.term}
                </TableCell>
                <TableCell className="text-sm text-gray-600 py-3">
                  {row.year}
                </TableCell>
                <TableCell className="text-sm text-gray-700 py-3">
                  {row.assessor}
                </TableCell>
                <TableCell className="py-3">
                  <span
                    className={`text-sm font-bold ${getScoreColor(row.score)}`}
                  >
                    {row.score}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <Badge
                    className={
                      row.grade.startsWith("A")
                        ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-100"
                        : row.grade === "B"
                          ? "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100"
                          : row.grade === "C"
                            ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100"
                            : "bg-red-100 text-red-700 border border-red-200 hover:bg-red-100"
                    }
                  >
                    {row.grade}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-500 py-3 max-w-[220px]">
                  <span className="line-clamp-2">{row.remarks}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Personal Details Tab ─────────────────────────────────────────────────────

function PersonalTab({ teacher }: { teacher: Teacher }) {
  const fields = [
    { label: "Date of Birth", value: teacher.dob },
    { label: "Gender", value: teacher.gender },
    { label: "Blood Group", value: teacher.bloodGroup },
    { label: "Qualification", value: teacher.qualification },
    { label: "Specialization", value: teacher.specialization },
    { label: "Emergency Contact", value: teacher.emergencyContact },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {label}
              </span>
              <span className="text-sm text-gray-800 font-medium">
                {value || "—"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
            Address
          </p>
          <p className="text-sm text-gray-700">{teacher.address || "—"}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Professional Details Tab ─────────────────────────────────────────────────

function ProfessionalTab({ teacher }: { teacher: Teacher }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Professional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Department", value: teacher.department },
            { label: "Subject", value: teacher.subject },
            { label: "Designation", value: teacher.designation },
            { label: "Join Date", value: teacher.joinDate },
            { label: "Experience", value: `${teacher.experience} years` },
            {
              label: "Salary",
              value: `₹${teacher.salary.toLocaleString("en-IN")}`,
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {label}
              </span>
              <span className="text-sm text-gray-800 font-medium">
                {value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Assigned Classes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Assigned Classes
        </h3>
        {teacher.assignedClasses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {teacher.assignedClasses.map((cls) => (
              <Badge
                key={cls}
                variant="outline"
                className="text-sm px-3 py-1 border-blue-200 text-blue-700 bg-blue-50"
              >
                {cls}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No classes assigned</p>
        )}
      </div>
    </div>
  );
}

// ─── Attendance Tab ────────────────────────────────────────────────────────────

function TeacherAttendanceTab({ teacher }: { teacher: Teacher }) {
  const monthlyData = getMonthlyAttendance(teacher.id * 37);

  return (
    <div className="space-y-6">
      {/* Ring + summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row items-center gap-6">
        <AttendanceRingLarge pct={teacher.attendancePct} />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Annual Attendance Summary
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Working Days",
                value: 220,
                color: "text-gray-800",
              },
              {
                label: "Days Present",
                value: Math.round((teacher.attendancePct / 100) * 220),
                color: "text-green-700",
              },
              {
                label: "Days Absent",
                value: 220 - Math.round((teacher.attendancePct / 100) * 220),
                color: "text-red-600",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Monthly Attendance (%)
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={monthlyData}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v: number) => [`${v}%`, "Attendance"]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="pct"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              isAnimationActive
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Month-wise Breakdown
          </h3>
        </div>
        <Table data-ocid="teacher-profile.attendance.table">
          <TableHeader>
            <TableRow className="bg-gray-50/40">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Month
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Working Days
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Present
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Absent
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                %
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyData.map((row, idx) => (
              <TableRow
                key={row.month}
                data-ocid={`teacher-profile.attendance.row.${idx + 1}`}
                className="border-b border-gray-50 last:border-0"
              >
                <TableCell className="text-sm font-medium text-gray-800 py-3">
                  {row.month}
                </TableCell>
                <TableCell className="text-sm text-gray-600 py-3">
                  {row.workingDays}
                </TableCell>
                <TableCell className="text-sm text-green-700 font-semibold py-3">
                  {row.present}
                </TableCell>
                <TableCell className="text-sm text-red-600 py-3">
                  {row.absent}
                </TableCell>
                <TableCell className="py-3">
                  <span
                    className={`text-sm font-bold ${
                      row.pct >= 85
                        ? "text-green-700"
                        : row.pct >= 70
                          ? "text-amber-700"
                          : "text-red-600"
                    }`}
                  >
                    {row.pct}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Subjects & Timetable Tab ─────────────────────────────────────────────────

function TimetableTab({ teacher }: { teacher: Teacher }) {
  const timetable = generateTimetable(teacher);

  return (
    <div className="space-y-6">
      {/* Subject details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Subject Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">
              Subject
            </p>
            <p className="text-lg font-bold text-blue-800">{teacher.subject}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">
              Specialization
            </p>
            <p className="text-sm font-bold text-purple-800">
              {teacher.specialization || "—"}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">
              Classes
            </p>
            <p className="text-lg font-bold text-green-800">
              {teacher.assignedClasses.length}
            </p>
          </div>
        </div>
      </div>

      {/* Timetable grid */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Weekly Timetable
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide w-14">
                  Day
                </th>
                {PERIODS.map((p) => (
                  <th
                    key={p}
                    className="text-center py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[90px]"
                  >
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, dayIdx) => (
                <tr
                  key={day}
                  className={dayIdx % 2 === 0 ? "bg-gray-50/50" : "bg-white"}
                >
                  <td className="py-2 pr-4 text-xs font-bold text-gray-600 uppercase tracking-wide">
                    {day}
                  </td>
                  {PERIODS.map((period) => {
                    const cell = timetable[day]?.[period];
                    return (
                      <td key={period} className="py-1 px-1 text-center">
                        {cell ? (
                          <div className="bg-blue-50 border border-blue-100 rounded-md px-2 py-1.5 text-xs font-medium text-blue-800 leading-tight">
                            {cell}
                          </div>
                        ) : (
                          <div className="text-gray-200 text-xs py-1">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          * Timetable is indicative. Actual schedule may vary.
        </p>
      </div>
    </div>
  );
}

// ─── Main TeacherProfilePage ──────────────────────────────────────────────────

export default function TeacherProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id: string };
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

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
          data-ocid="teacher-profile.loading_state"
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

  const teacher: Teacher | undefined = TEACHERS.find(
    (t) => t.id === Number(id),
  );

  function handleExportPDF() {
    if (!teacher) return;
    const columns = ["Field", "Value"];
    const rows: (string | number)[][] = [
      ["Employee ID", teacher.employeeId],
      ["Name", `${teacher.firstName} ${teacher.lastName}`],
      ["Gender", teacher.gender],
      ["Date of Birth", teacher.dob],
      ["Phone", teacher.phone],
      ["Email", teacher.email],
      ["Qualification", teacher.qualification],
      ["Specialization", teacher.specialization],
      ["Subject", teacher.subject],
      ["Department", teacher.department],
      ["Designation", teacher.designation],
      ["Join Date", teacher.joinDate],
      ["Experience", `${teacher.experience} years`],
      ["Salary", `₹${teacher.salary.toLocaleString("en-IN")}`],
      ["Status", teacher.status],
      ["Blood Group", teacher.bloodGroup],
      ["Emergency Contact", teacher.emergencyContact],
      ["Assigned Classes", teacher.assignedClasses.join(", ") || "—"],
      ["Attendance %", `${teacher.attendancePct}%`],
      ["Address", teacher.address],
    ];
    exportToPDF(
      `teacher-${teacher.employeeId}-profile`,
      `Teacher Profile — ${teacher.firstName} ${teacher.lastName}`,
      columns,
      rows,
      `${teacher.employeeId} | ${teacher.designation} | ${teacher.department}`,
    );
  }

  if (!teacher) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar
          role={String(role)}
          userName={userName}
          onLogout={handleLogout}
        />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <div data-ocid="teacher-profile.error_state" className="text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <User className="w-9 h-9 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Teacher Not Found
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              No teacher found with ID {id}.
            </p>
            <Button
              data-ocid="teacher-profile.secondary_button"
              onClick={() => navigate({ to: "/teachers" })}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Teachers
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const initials =
    `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase();
  const deptColor = getDeptColor(teacher.department);

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
            <Button
              data-ocid="teacher-profile.secondary_button"
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/teachers" })}
              className="gap-1.5 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Teachers
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-ocid="teacher-profile.export.button"
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
                  data-ocid="teacher-profile.export.pdf_button"
                  onClick={handleExportPDF}
                  className="gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-red-500" />
                  Export Profile (PDF)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm ${deptColor}`}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {teacher.firstName} {teacher.lastName}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-gray-400">
                    {teacher.employeeId}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0.5 border-blue-200 text-blue-700 bg-blue-50"
                  >
                    {teacher.designation}
                  </Badge>
                  <StatusBadge status={teacher.status} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content area */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* ─── Left: Profile card ─── */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col items-center text-center mb-5">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md mb-3 ${deptColor}`}
                  >
                    {initials}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {teacher.firstName} {teacher.lastName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {teacher.employeeId}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={teacher.status} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                  <Badge
                    variant="outline"
                    className="text-xs border-blue-200 text-blue-700 bg-blue-50"
                  >
                    {teacher.subject}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-purple-200 text-purple-700 bg-purple-50"
                  >
                    {teacher.department}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t border-gray-100">
                  {[
                    {
                      label: "Experience",
                      value: `${teacher.experience}y`,
                      color: "text-blue-700",
                    },
                    {
                      label: "Classes",
                      value: teacher.assignedClasses.length,
                      color: "text-purple-700",
                    },
                    {
                      label: "Attendance",
                      value: `${teacher.attendancePct}%`,
                      color:
                        teacher.attendancePct >= 85
                          ? "text-green-700"
                          : "text-amber-700",
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{teacher.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-xs text-gray-600">
                      {teacher.address}
                    </span>
                  </div>
                  {teacher.emergencyContact && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500">
                        Emergency: {teacher.emergencyContact}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Right: Tabs ─── */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="personal" data-ocid="teacher-profile.panel">
                <TabsList className="mb-4 bg-white border border-gray-100 shadow-sm rounded-xl p-1 flex-wrap h-auto gap-1">
                  <TabsTrigger
                    data-ocid="teacher-profile.tab"
                    value="personal"
                    className="gap-1.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <User className="w-4 h-4" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger
                    data-ocid="teacher-profile.tab"
                    value="professional"
                    className="gap-1.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <Briefcase className="w-4 h-4" />
                    Professional
                  </TabsTrigger>
                  <TabsTrigger
                    data-ocid="teacher-profile.tab"
                    value="attendance"
                    className="gap-1.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Attendance
                  </TabsTrigger>
                  <TabsTrigger
                    data-ocid="teacher-profile.tab"
                    value="timetable"
                    className="gap-1.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <BookOpen className="w-4 h-4" />
                    Timetable
                  </TabsTrigger>
                  <TabsTrigger
                    data-ocid="teacher-profile.tab"
                    value="assessment"
                    className="gap-1.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Assessment
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <PersonalTab teacher={teacher} />
                </TabsContent>

                <TabsContent value="professional">
                  <ProfessionalTab teacher={teacher} />
                </TabsContent>

                <TabsContent value="attendance">
                  <TeacherAttendanceTab teacher={teacher} />
                </TabsContent>

                <TabsContent value="timetable">
                  <TimetableTab teacher={teacher} />
                </TabsContent>

                <TabsContent value="assessment">
                  <AssessmentTab teacher={teacher} role={String(role)} />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
