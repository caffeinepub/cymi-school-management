import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";
import { SEED_DATA, type Student } from "../data/students";
import { useCallerUserProfile, useLogout } from "../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";

// ─── Helper Components ────────────────────────────────────────────────────────

function AttendanceBadge({ pct }: { pct: number }) {
  if (pct >= 85) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
        {pct}%
      </span>
    );
  }
  if (pct >= 70) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        {pct}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
      {pct}%
    </span>
  );
}

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

// ─── Form State ───────────────────────────────────────────────────────────────

type FormState = Omit<Student, "id">;

const EMPTY_FORM: FormState = {
  admissionNo: "",
  firstName: "",
  lastName: "",
  grade: 1,
  section: "A",
  gender: "Male",
  dob: "",
  phone: "",
  email: "",
  parentName: "",
  parentPhone: "",
  address: "",
  feeStatus: "Paid",
  attendancePct: 90,
  joinDate: new Date().toISOString().split("T")[0],
};

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: Student | null;
  onSave: (data: FormState) => void;
}

function StudentFormDialog({
  open,
  onClose,
  initial,
  onSave,
}: StudentFormDialogProps) {
  const [form, setForm] = useState<FormState>(
    initial ? { ...initial } : { ...EMPTY_FORM },
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { ...EMPTY_FORM });
      setErrors({});
    }
  }, [open, initial]);

  const set = (key: keyof FormState, val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.admissionNo.trim())
      errs.admissionNo = "Admission number is required";
    if (!form.section) errs.section = "Section is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    onSave(form);
    setSaving(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="students.dialog"
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Student" : "Add New Student"}
          </DialogTitle>
          <DialogDescription>
            {initial
              ? "Update the student's information below."
              : "Fill in the student details to add them to the system."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-2">
          <form
            id="student-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1"
          >
            {/* Admission No */}
            <div className="space-y-1">
              <Label htmlFor="admissionNo">
                Admission No <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="students.input"
                id="admissionNo"
                value={form.admissionNo}
                onChange={(e) => set("admissionNo", e.target.value)}
                placeholder="ADM2024001"
              />
              {errors.admissionNo && (
                <p
                  data-ocid="students.error_state"
                  className="text-xs text-red-600"
                >
                  {errors.admissionNo}
                </p>
              )}
            </div>

            {/* First Name */}
            <div className="space-y-1">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="students.input"
                id="firstName"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                placeholder="Riya"
              />
              {errors.firstName && (
                <p
                  data-ocid="students.error_state"
                  className="text-xs text-red-600"
                >
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="students.input"
                id="lastName"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                placeholder="Sharma"
              />
              {errors.lastName && (
                <p
                  data-ocid="students.error_state"
                  className="text-xs text-red-600"
                >
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Grade */}
            <div className="space-y-1">
              <Label>
                Grade <span className="text-red-500">*</span>
              </Label>
              <Select
                value={String(form.grade)}
                onValueChange={(v) => set("grade", Number(v))}
              >
                <SelectTrigger data-ocid="students.select">
                  <SelectValue placeholder="Select grade" />
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

            {/* Section */}
            <div className="space-y-1">
              <Label>
                Section <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.section}
                onValueChange={(v) => set("section", v)}
              >
                <SelectTrigger data-ocid="students.select">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D"].map((s) => (
                    <SelectItem key={s} value={s}>
                      Section {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.section && (
                <p
                  data-ocid="students.error_state"
                  className="text-xs text-red-600"
                >
                  {errors.section}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => set("gender", v)}
              >
                <SelectTrigger data-ocid="students.select">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DOB */}
            <div className="space-y-1">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                data-ocid="students.input"
                id="dob"
                type="date"
                value={form.dob}
                onChange={(e) => set("dob", e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input
                data-ocid="students.input"
                id="phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="9876543210"
              />
            </div>

            {/* Email */}
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                data-ocid="students.input"
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="student@example.com"
              />
            </div>

            {/* Parent Name */}
            <div className="space-y-1">
              <Label htmlFor="parentName">Parent Name</Label>
              <Input
                data-ocid="students.input"
                id="parentName"
                value={form.parentName}
                onChange={(e) => set("parentName", e.target.value)}
                placeholder="Rajesh Sharma"
              />
            </div>

            {/* Parent Phone */}
            <div className="space-y-1">
              <Label htmlFor="parentPhone">Parent Phone</Label>
              <Input
                data-ocid="students.input"
                id="parentPhone"
                value={form.parentPhone}
                onChange={(e) => set("parentPhone", e.target.value)}
                placeholder="9876543211"
              />
            </div>

            {/* Fee Status */}
            <div className="space-y-1">
              <Label>Fee Status</Label>
              <Select
                value={form.feeStatus}
                onValueChange={(v) => set("feeStatus", v)}
              >
                <SelectTrigger data-ocid="students.select">
                  <SelectValue placeholder="Fee status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Attendance % */}
            <div className="space-y-1">
              <Label htmlFor="attendancePct">Attendance %</Label>
              <Input
                data-ocid="students.input"
                id="attendancePct"
                type="number"
                min={0}
                max={100}
                value={form.attendancePct}
                onChange={(e) => set("attendancePct", Number(e.target.value))}
              />
            </div>

            {/* Join Date */}
            <div className="space-y-1">
              <Label htmlFor="joinDate">Join Date</Label>
              <Input
                data-ocid="students.input"
                id="joinDate"
                type="date"
                value={form.joinDate}
                onChange={(e) => set("joinDate", e.target.value)}
              />
            </div>

            {/* Address */}
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                data-ocid="students.textarea"
                id="address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="123, Main Street, City"
                rows={2}
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="pt-4 gap-2 flex-shrink-0">
          <Button
            data-ocid="students.cancel_button"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="students.submit_button"
            type="submit"
            form="student-form"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initial ? (
              "Update Student"
            ) : (
              "Add Student"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main StudentsPage ────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

export default function StudentsPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  // ── Local state ──
  const [students, setStudents] = useState<Student[]>(() => SEED_DATA);

  // ── Filters ──
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [feeFilter, setFeeFilter] = useState("all");
  const [page, setPage] = useState(1);

  // ── Modals ──
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── Auto-open add dialog from ?action=add ──
  useEffect(() => {
    const action = new URLSearchParams(window.location.search).get("action");
    if (action === "add") {
      setEditTarget(null);
      setAddEditOpen(true);
    }
  }, []);

  // ── Auth redirect ──
  useEffect(() => {
    if (!profileLoading && !profile) {
      navigate({ to: "/login" });
    }
  }, [profile, profileLoading, navigate]);

  async function handleLogout() {
    await logoutMutation.mutateAsync("token");
    navigate({ to: "/login" });
  }

  // ── Filtered & paginated ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      if (q) {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        if (!fullName.includes(q) && !s.admissionNo.toLowerCase().includes(q))
          return false;
      }
      if (gradeFilter !== "all" && String(s.grade) !== gradeFilter)
        return false;
      if (sectionFilter !== "all" && s.section !== sectionFilter) return false;
      if (genderFilter !== "all" && s.gender !== genderFilter) return false;
      if (feeFilter !== "all" && s.feeStatus !== feeFilter) return false;
      return true;
    });
  }, [students, search, gradeFilter, sectionFilter, genderFilter, feeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Reset to page 1 when filters change
  const prevFilters = useRef({
    search,
    gradeFilter,
    sectionFilter,
    genderFilter,
    feeFilter,
  });
  useEffect(() => {
    const prev = prevFilters.current;
    if (
      prev.search !== search ||
      prev.gradeFilter !== gradeFilter ||
      prev.sectionFilter !== sectionFilter ||
      prev.genderFilter !== genderFilter ||
      prev.feeFilter !== feeFilter
    ) {
      setPage(1);
      prevFilters.current = {
        search,
        gradeFilter,
        sectionFilter,
        genderFilter,
        feeFilter,
      };
    }
  }, [search, gradeFilter, sectionFilter, genderFilter, feeFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // ── Actions ──
  function openAdd() {
    setEditTarget(null);
    setAddEditOpen(true);
  }

  function openEdit(s: Student) {
    setEditTarget(s);
    setAddEditOpen(true);
  }

  function openView(s: Student) {
    navigate({ to: "/students/$id", params: { id: String(s.id) } });
  }

  function openDelete(s: Student) {
    setDeleteTarget(s);
    setDeleteOpen(true);
  }

  function handleSave(data: FormState) {
    if (editTarget) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editTarget.id ? { ...data, id: editTarget.id } : s,
        ),
      );
      toast.success(`${data.firstName} ${data.lastName} updated successfully`);
    } else {
      const maxId = students.reduce((m, s) => Math.max(m, s.id), 0);
      setStudents((prev) => [...prev, { ...data, id: maxId + 1 }]);
      toast.success(`${data.firstName} ${data.lastName} added successfully`);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    toast.success(`${deleteTarget.firstName} ${deleteTarget.lastName} deleted`);
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  // ── Export helpers ──
  const EXPORT_COLUMNS = [
    "#",
    "Admission No",
    "Name",
    "Grade",
    "Section",
    "Gender",
    "DOB",
    "Phone",
    "Email",
    "Parent Name",
    "Parent Phone",
    "Fee Status",
    "Attendance %",
    "Join Date",
  ];

  function buildExportRows() {
    return filtered.map((s, i) => ({
      "#": i + 1,
      "Admission No": s.admissionNo,
      Name: `${s.firstName} ${s.lastName}`,
      Grade: s.grade,
      Section: s.section,
      Gender: s.gender,
      DOB: s.dob,
      Phone: s.phone,
      Email: s.email,
      "Parent Name": s.parentName,
      "Parent Phone": s.parentPhone,
      "Fee Status": s.feeStatus,
      "Attendance %": s.attendancePct,
      "Join Date": s.joinDate,
    }));
  }

  function buildPdfRows(): (string | number)[][] {
    return filtered.map((s, i) => [
      i + 1,
      s.admissionNo,
      `${s.firstName} ${s.lastName}`,
      s.grade,
      s.section,
      s.gender,
      s.dob,
      s.phone,
      s.email,
      s.parentName,
      s.parentPhone,
      s.feeStatus,
      `${s.attendancePct}%`,
      s.joinDate,
    ]);
  }

  function handleExportExcel() {
    exportToExcel("students-export", [
      { name: "Students", rows: buildExportRows() },
    ]);
    toast.success("Excel file downloaded");
  }

  function handleExportPDF() {
    exportToPDF(
      "students-export",
      "CYMI — Student Directory",
      EXPORT_COLUMNS,
      buildPdfRows(),
      `Total ${filtered.length} students exported on ${new Date().toLocaleDateString("en-IN")}`,
    );
    toast.success("PDF file downloaded");
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="students.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading students...</p>
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
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Students</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage student records, attendance and fees
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-blue-100">
                <Users className="w-4 h-4" />
                {filtered.length} / {students.length}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-ocid="students.secondary_button"
                    variant="outline"
                    className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    data-ocid="students.export.excel_button"
                    onClick={handleExportExcel}
                    className="gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-ocid="students.export.pdf_button"
                    onClick={handleExportPDF}
                    className="gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                data-ocid="students.primary_button"
                onClick={openAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Student
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white border-b border-gray-100 px-6 py-3 flex-shrink-0"
        >
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                data-ocid="students.search_input"
                placeholder="Search name or admission no..."
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

            {/* Grade filter */}
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger
                data-ocid="students.select"
                className="h-8 text-sm w-[110px]"
              >
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    Grade {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Section filter */}
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger
                data-ocid="students.select"
                className="h-8 text-sm w-[110px]"
              >
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {["A", "B", "C", "D"].map((s) => (
                  <SelectItem key={s} value={s}>
                    Section {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Gender filter */}
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger
                data-ocid="students.select"
                className="h-8 text-sm w-[110px]"
              >
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>

            {/* Fee Status filter */}
            <Select value={feeFilter} onValueChange={setFeeFilter}>
              <SelectTrigger
                data-ocid="students.select"
                className="h-8 text-sm w-[120px]"
              >
                <SelectValue placeholder="Fee Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear all */}
            {(search ||
              gradeFilter !== "all" ||
              sectionFilter !== "all" ||
              genderFilter !== "all" ||
              feeFilter !== "all") && (
              <Button
                data-ocid="students.secondary_button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-gray-500 hover:text-gray-800 gap-1"
                onClick={() => {
                  setSearch("");
                  setGradeFilter("all");
                  setSectionFilter("all");
                  setGenderFilter("all");
                  setFeeFilter("all");
                }}
              >
                <X className="w-3 h-3" />
                Clear
              </Button>
            )}
          </div>
        </motion.div>

        {/* Table area */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table data-ocid="students.table">
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 w-10">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Admission No
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Grade & Section
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Gender
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Parent Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Phone
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Fee Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Attendance
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Join Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11}>
                        <div
                          data-ocid="students.empty_state"
                          className="flex flex-col items-center justify-center py-16 text-center"
                        >
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <Users className="w-7 h-7 text-gray-400" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700">
                            No students found
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Try adjusting your filters or search term
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((s, idx) => {
                      const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
                      const ocidIdx = idx + 1;
                      return (
                        <TableRow
                          key={s.id}
                          data-ocid={`students.row.${ocidIdx}`}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <TableCell className="text-xs text-gray-400 font-mono py-3">
                            {rowNum}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-blue-700 font-semibold py-3 whitespace-nowrap">
                            {s.admissionNo}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 text-xs font-bold">
                                {s.firstName[0]}
                                {s.lastName[0]}
                              </div>
                              <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                                {s.firstName} {s.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-700 font-medium">
                              Gr. {s.grade}
                            </span>
                            <span className="ml-1 text-xs text-gray-400">
                              – {s.section}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-sm text-gray-600 whitespace-nowrap">
                            {s.gender}
                          </TableCell>
                          <TableCell className="py-3 text-sm text-gray-700 whitespace-nowrap">
                            {s.parentName}
                          </TableCell>
                          <TableCell className="py-3 text-sm font-mono text-gray-600 whitespace-nowrap">
                            {s.phone}
                          </TableCell>
                          <TableCell className="py-3">
                            <FeeStatusBadge status={s.feeStatus} />
                          </TableCell>
                          <TableCell className="py-3">
                            <AttendanceBadge pct={s.attendancePct} />
                          </TableCell>
                          <TableCell className="py-3 text-xs text-gray-500 whitespace-nowrap">
                            {s.joinDate}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                data-ocid={`students.secondary_button.${ocidIdx}`}
                                onClick={() => openView(s)}
                                title="View Profile"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                data-ocid={`students.edit_button.${ocidIdx}`}
                                onClick={() => openEdit(s)}
                                title="Edit"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                data-ocid={`students.delete_button.${ocidIdx}`}
                                onClick={() => openDelete(s)}
                                title="Delete"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filtered.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {filtered.length}
                  </span>{" "}
                  students
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    data-ocid="students.pagination_prev"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let p: number;
                    if (totalPages <= 7) {
                      p = i + 1;
                    } else if (page <= 4) {
                      p = i + 1;
                    } else if (page >= totalPages - 3) {
                      p = totalPages - 6 + i;
                    } else {
                      p = page - 3 + i;
                    }
                    return (
                      <Button
                        key={p}
                        data-ocid="students.pagination_next"
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        className={`h-7 w-7 p-0 text-xs ${page === p ? "bg-blue-600 hover:bg-blue-700 border-blue-600" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}

                  <Button
                    data-ocid="students.pagination_next"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <StudentFormDialog
        open={addEditOpen}
        onClose={() => {
          setAddEditOpen(false);
          setEditTarget(null);
        }}
        initial={editTarget}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-ocid="students.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {deleteTarget?.firstName} {deleteTarget?.lastName}
              </strong>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="students.cancel_button"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="students.confirm_button"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
