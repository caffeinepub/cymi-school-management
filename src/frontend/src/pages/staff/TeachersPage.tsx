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
import Sidebar from "../../components/Sidebar";
import {
  DEPARTMENTS,
  DESIGNATIONS,
  SUBJECTS,
  TEACHERS,
  type Teacher,
} from "../../data/teachers";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

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

// ─── Form State ───────────────────────────────────────────────────────────────

type FormState = Omit<Teacher, "id">;

const EMPTY_FORM: FormState = {
  employeeId: "",
  firstName: "",
  lastName: "",
  gender: "Male",
  dob: "",
  phone: "",
  email: "",
  address: "",
  qualification: "",
  specialization: "",
  subject: "",
  designation: "",
  department: "",
  joinDate: new Date().toISOString().split("T")[0],
  experience: 0,
  salary: 0,
  status: "Active",
  bloodGroup: "",
  emergencyContact: "",
  assignedClasses: [],
  attendancePct: 95,
};

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

interface TeacherFormDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: Teacher | null;
  onSave: (data: FormState) => void;
}

function TeacherFormDialog({
  open,
  onClose,
  initial,
  onSave,
}: TeacherFormDialogProps) {
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

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.employeeId.trim()) errs.employeeId = "Employee ID is required";
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.department.trim()) errs.department = "Department is required";
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
        data-ocid="teachers.dialog"
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Teacher" : "Add New Teacher"}
          </DialogTitle>
          <DialogDescription>
            {initial
              ? "Update the teacher's information below."
              : "Fill in the teacher details to add them to the system."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-2">
          <form
            id="teacher-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1"
          >
            {/* Employee ID */}
            <div className="space-y-1">
              <Label htmlFor="employeeId">
                Employee ID <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="teachers.input"
                id="employeeId"
                value={form.employeeId}
                onChange={(e) => set("employeeId", e.target.value)}
                placeholder="TCH001"
              />
              {errors.employeeId && (
                <p
                  data-ocid="teachers.error_state"
                  className="text-xs text-red-600"
                >
                  {errors.employeeId}
                </p>
              )}
            </div>

            {/* First Name */}
            <div className="space-y-1">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="teachers.input"
                id="firstName"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                placeholder="Rajesh"
              />
              {errors.firstName && (
                <p
                  data-ocid="teachers.error_state"
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
                data-ocid="teachers.input"
                id="lastName"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                placeholder="Kumar"
              />
              {errors.lastName && (
                <p
                  data-ocid="teachers.error_state"
                  className="text-xs text-red-600"
                >
                  {errors.lastName}
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
                <SelectTrigger data-ocid="teachers.select">
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
                data-ocid="teachers.input"
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
                data-ocid="teachers.input"
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
                data-ocid="teachers.input"
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="teacher@cymi.edu"
              />
            </div>

            {/* Qualification */}
            <div className="space-y-1">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                data-ocid="teachers.input"
                id="qualification"
                value={form.qualification}
                onChange={(e) => set("qualification", e.target.value)}
                placeholder="M.Sc (Mathematics)"
              />
            </div>

            {/* Specialization */}
            <div className="space-y-1">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                data-ocid="teachers.input"
                id="specialization"
                value={form.specialization}
                onChange={(e) => set("specialization", e.target.value)}
                placeholder="Algebra & Calculus"
              />
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <Label>
                Subject <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.subject}
                onValueChange={(v) => set("subject", v)}
              >
                <SelectTrigger data-ocid="teachers.select">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject && (
                <p
                  data-ocid="teachers.error_state"
                  className="text-xs text-red-600"
                >
                  {errors.subject}
                </p>
              )}
            </div>

            {/* Designation */}
            <div className="space-y-1">
              <Label>Designation</Label>
              <Select
                value={form.designation}
                onValueChange={(v) => set("designation", v)}
              >
                <SelectTrigger data-ocid="teachers.select">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {DESIGNATIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <Label>
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.department}
                onValueChange={(v) => set("department", v)}
              >
                <SelectTrigger data-ocid="teachers.select">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p
                  data-ocid="teachers.error_state"
                  className="text-xs text-red-600"
                >
                  {errors.department}
                </p>
              )}
            </div>

            {/* Join Date */}
            <div className="space-y-1">
              <Label htmlFor="joinDate">Join Date</Label>
              <Input
                data-ocid="teachers.input"
                id="joinDate"
                type="date"
                value={form.joinDate}
                onChange={(e) => set("joinDate", e.target.value)}
              />
            </div>

            {/* Experience */}
            <div className="space-y-1">
              <Label htmlFor="experience">Experience (Years)</Label>
              <Input
                data-ocid="teachers.input"
                id="experience"
                type="number"
                min={0}
                value={form.experience}
                onChange={(e) => set("experience", Number(e.target.value))}
              />
            </div>

            {/* Salary */}
            <div className="space-y-1">
              <Label htmlFor="salary">Salary (₹)</Label>
              <Input
                data-ocid="teachers.input"
                id="salary"
                type="number"
                min={0}
                value={form.salary}
                onChange={(e) => set("salary", Number(e.target.value))}
              />
            </div>

            {/* Blood Group */}
            <div className="space-y-1">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Input
                data-ocid="teachers.input"
                id="bloodGroup"
                value={form.bloodGroup}
                onChange={(e) => set("bloodGroup", e.target.value)}
                placeholder="B+"
              />
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                data-ocid="teachers.input"
                id="emergencyContact"
                value={form.emergencyContact}
                onChange={(e) => set("emergencyContact", e.target.value)}
                placeholder="9876500001"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as Teacher["status"])}
              >
                <SelectTrigger data-ocid="teachers.select">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Attendance % */}
            <div className="space-y-1">
              <Label htmlFor="attendancePct">Attendance %</Label>
              <Input
                data-ocid="teachers.input"
                id="attendancePct"
                type="number"
                min={0}
                max={100}
                value={form.attendancePct}
                onChange={(e) => set("attendancePct", Number(e.target.value))}
              />
            </div>

            {/* Assigned Classes */}
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="assignedClasses">
                Assigned Classes (comma-separated)
              </Label>
              <Input
                data-ocid="teachers.input"
                id="assignedClasses"
                value={form.assignedClasses.join(", ")}
                onChange={(e) =>
                  set(
                    "assignedClasses",
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="9A, 10B, 11C"
              />
            </div>

            {/* Address */}
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                data-ocid="teachers.textarea"
                id="address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="12, MG Road, Pune, Maharashtra"
                rows={2}
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="pt-4 gap-2 flex-shrink-0">
          <Button
            data-ocid="teachers.cancel_button"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="teachers.submit_button"
            type="submit"
            form="teacher-form"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initial ? (
              "Update Teacher"
            ) : (
              "Add Teacher"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main TeachersPage ────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function TeachersPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  // ── Local state ──
  const [teachers, setTeachers] = useState<Teacher[]>(() => TEACHERS);

  // ── Filters ──
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // ── Modals ──
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);
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
    return teachers.filter((t) => {
      if (q) {
        const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
        if (
          !fullName.includes(q) &&
          !t.employeeId.toLowerCase().includes(q) &&
          !t.subject.toLowerCase().includes(q)
        )
          return false;
      }
      if (deptFilter !== "all" && t.department !== deptFilter) return false;
      if (subjectFilter !== "all" && t.subject !== subjectFilter) return false;
      if (genderFilter !== "all" && t.gender !== genderFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      return true;
    });
  }, [teachers, search, deptFilter, subjectFilter, genderFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Reset to page 1 when filters change
  const prevFilters = useRef({
    search,
    deptFilter,
    subjectFilter,
    genderFilter,
    statusFilter,
  });
  useEffect(() => {
    const prev = prevFilters.current;
    if (
      prev.search !== search ||
      prev.deptFilter !== deptFilter ||
      prev.subjectFilter !== subjectFilter ||
      prev.genderFilter !== genderFilter ||
      prev.statusFilter !== statusFilter
    ) {
      setPage(1);
      prevFilters.current = {
        search,
        deptFilter,
        subjectFilter,
        genderFilter,
        statusFilter,
      };
    }
  }, [search, deptFilter, subjectFilter, genderFilter, statusFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // ── Actions ──
  function openAdd() {
    setEditTarget(null);
    setAddEditOpen(true);
  }

  function openEdit(t: Teacher) {
    setEditTarget(t);
    setAddEditOpen(true);
  }

  function openView(t: Teacher) {
    navigate({ to: "/teachers/$id", params: { id: String(t.id) } });
  }

  function openDelete(t: Teacher) {
    setDeleteTarget(t);
    setDeleteOpen(true);
  }

  function handleSave(data: FormState) {
    if (editTarget) {
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === editTarget.id ? { ...data, id: editTarget.id } : t,
        ),
      );
      toast.success(`${data.firstName} ${data.lastName} updated successfully`);
    } else {
      const maxId = teachers.reduce((m, t) => Math.max(m, t.id), 0);
      setTeachers((prev) => [...prev, { ...data, id: maxId + 1 }]);
      toast.success(`${data.firstName} ${data.lastName} added successfully`);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setTeachers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    toast.success(`${deleteTarget.firstName} ${deleteTarget.lastName} deleted`);
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  // ── Export helpers ──
  const EXPORT_COLUMNS = [
    "#",
    "Employee ID",
    "Name",
    "Gender",
    "Subject",
    "Department",
    "Designation",
    "Experience (yrs)",
    "Salary (₹)",
    "Status",
    "Join Date",
    "Phone",
    "Email",
    "Address",
  ];

  function buildExportRows() {
    return filtered.map((t, i) => ({
      "#": i + 1,
      "Employee ID": t.employeeId,
      Name: `${t.firstName} ${t.lastName}`,
      Gender: t.gender,
      Subject: t.subject,
      Department: t.department,
      Designation: t.designation,
      "Experience (yrs)": t.experience,
      "Salary (₹)": t.salary,
      Status: t.status,
      "Join Date": t.joinDate,
      Phone: t.phone,
      Email: t.email,
      Address: t.address,
    }));
  }

  function buildPdfRows(): (string | number)[][] {
    return filtered.map((t, i) => [
      i + 1,
      t.employeeId,
      `${t.firstName} ${t.lastName}`,
      t.gender,
      t.subject,
      t.department,
      t.designation,
      t.experience,
      `₹${t.salary.toLocaleString("en-IN")}`,
      t.status,
      t.joinDate,
      t.phone,
      t.email,
      t.address,
    ]);
  }

  function handleExportExcel() {
    exportToExcel("teachers-export", [
      { name: "Teachers", rows: buildExportRows() },
    ]);
    toast.success("Excel file downloaded");
  }

  function handleExportPDF() {
    exportToPDF(
      "teachers-export",
      "CYMI — Teacher Directory",
      EXPORT_COLUMNS,
      buildPdfRows(),
      `Total ${filtered.length} teachers exported on ${new Date().toLocaleDateString("en-IN")}`,
    );
    toast.success("PDF file downloaded");
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="teachers.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading teachers...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Teachers</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage teacher records, assignments and profiles
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-blue-100">
                <Users className="w-4 h-4" />
                {filtered.length} / {teachers.length}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-ocid="teachers.secondary_button"
                    variant="outline"
                    className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    data-ocid="teachers.export.excel_button"
                    onClick={handleExportExcel}
                    className="gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-ocid="teachers.export.pdf_button"
                    onClick={handleExportPDF}
                    className="gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                data-ocid="teachers.primary_button"
                onClick={openAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Teacher
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
                data-ocid="teachers.search_input"
                placeholder="Search name, ID or subject..."
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

            {/* Department filter */}
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger
                data-ocid="teachers.select"
                className="h-8 text-sm w-[160px]"
              >
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Subject filter */}
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger
                data-ocid="teachers.select"
                className="h-8 text-sm w-[130px]"
              >
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Gender filter */}
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger
                data-ocid="teachers.select"
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

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                data-ocid="teachers.select"
                className="h-8 text-sm w-[120px]"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear all */}
            {(search ||
              deptFilter !== "all" ||
              subjectFilter !== "all" ||
              genderFilter !== "all" ||
              statusFilter !== "all") && (
              <Button
                data-ocid="teachers.secondary_button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-gray-500 hover:text-gray-800 gap-1"
                onClick={() => {
                  setSearch("");
                  setDeptFilter("all");
                  setSubjectFilter("all");
                  setGenderFilter("all");
                  setStatusFilter("all");
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
              <Table data-ocid="teachers.table">
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 w-10">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Employee ID
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Gender
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Subject
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Department
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Designation
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Exp (yrs)
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Classes
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Status
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
                      <TableCell colSpan={12}>
                        <div
                          data-ocid="teachers.empty_state"
                          className="flex flex-col items-center justify-center py-16 text-center"
                        >
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <Users className="w-7 h-7 text-gray-400" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700">
                            No teachers found
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Try adjusting your filters or search term
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((t, idx) => {
                      const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
                      const ocidIdx = idx + 1;
                      return (
                        <TableRow
                          key={t.id}
                          data-ocid={`teachers.row.${ocidIdx}`}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <TableCell className="text-xs text-gray-400 font-mono py-3">
                            {rowNum}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-blue-700 font-semibold py-3 whitespace-nowrap">
                            {t.employeeId}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${getDeptColor(t.department)}`}
                              >
                                {t.firstName[0]}
                                {t.lastName[0]}
                              </div>
                              <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                                {t.firstName} {t.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-sm text-gray-600 whitespace-nowrap">
                            {t.gender}
                          </TableCell>
                          <TableCell className="py-3 text-sm text-gray-700 whitespace-nowrap">
                            {t.subject}
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="text-xs text-gray-600 whitespace-nowrap">
                              {t.department}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="text-xs text-gray-600 whitespace-nowrap">
                              {t.designation}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-sm text-gray-700 font-semibold whitespace-nowrap">
                            {t.experience}
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="text-xs text-gray-500">
                              {t.assignedClasses.length > 0
                                ? t.assignedClasses.slice(0, 2).join(", ") +
                                  (t.assignedClasses.length > 2
                                    ? ` +${t.assignedClasses.length - 2}`
                                    : "")
                                : "—"}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <StatusBadge status={t.status} />
                          </TableCell>
                          <TableCell className="py-3 text-xs text-gray-500 whitespace-nowrap">
                            {t.joinDate}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                data-ocid={`teachers.secondary_button.${ocidIdx}`}
                                onClick={() => openView(t)}
                                title="View Profile"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                data-ocid={`teachers.edit_button.${ocidIdx}`}
                                onClick={() => openEdit(t)}
                                title="Edit"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                data-ocid={`teachers.delete_button.${ocidIdx}`}
                                onClick={() => openDelete(t)}
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
                  teachers
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    data-ocid="teachers.pagination_prev"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

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
                        data-ocid="teachers.pagination_next"
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        className={`h-7 w-7 p-0 text-xs ${
                          page === p
                            ? "bg-blue-600 hover:bg-blue-700 border-blue-600"
                            : ""
                        }`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}

                  <Button
                    data-ocid="teachers.pagination_next"
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
      <TeacherFormDialog
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
        <AlertDialogContent data-ocid="teachers.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
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
              data-ocid="teachers.cancel_button"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="teachers.confirm_button"
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
