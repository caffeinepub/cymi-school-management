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
import { useNavigate } from "@tanstack/react-router";
import {
  Bus,
  Clock,
  Download,
  Edit,
  FileSpreadsheet,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Route,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import {
  ROUTES,
  STUDENT_ASSIGNMENTS,
  type StudentAssignment,
  VEHICLES,
} from "../../data/transportation";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

// ─── Stat Card ────────────────────────────────────────────────────────────────

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
  value: number;
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
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Assignment Form ──────────────────────────────────────────────────────────

type AssignmentFormState = Omit<StudentAssignment, "id">;

const EMPTY_ASSIGNMENT: AssignmentFormState = {
  studentId: 0,
  studentName: "",
  grade: 1,
  section: "A",
  routeId: 1,
  routeName: ROUTES[0].routeName,
  vehicleId: 1,
  busNumber: VEHICLES[0].busNumber,
  pickupPoint: "",
  pickupTime: "07:00",
  dropTime: "14:00",
};

function AssignmentFormDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: StudentAssignment | null;
  onSave: (data: AssignmentFormState) => void;
}) {
  const [form, setForm] = useState<AssignmentFormState>(
    initial ? { ...initial } : { ...EMPTY_ASSIGNMENT },
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(initial ? { ...initial } : { ...EMPTY_ASSIGNMENT });
  }, [open, initial]);

  const selectedRoute = useMemo(
    () => ROUTES.find((r) => r.id === form.routeId),
    [form.routeId],
  );

  function handleRouteChange(routeIdStr: string) {
    const routeId = Number(routeIdStr);
    const route = ROUTES.find((r) => r.id === routeId);
    if (!route) return;
    // Auto-assign vehicle for route (route id maps to vehicle id)
    const vehicle = VEHICLES[routeId - 1] ?? VEHICLES[0];
    setForm((p) => ({
      ...p,
      routeId,
      routeName: route.routeName,
      vehicleId: vehicle.id,
      busNumber: vehicle.busNumber,
      pickupPoint: route.stops[0]?.name ?? "",
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.studentName.trim()) {
      toast.error("Student name is required");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    onSave(form);
    setSaving(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="assignments.dialog"
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Assignment" : "Add Student Assignment"}
          </DialogTitle>
          <DialogDescription>
            {initial
              ? "Update the student's transport assignment."
              : "Assign a student to a route and pickup point."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-2">
          <form
            id="assignment-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1"
          >
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="assignStudentName">
                Student Name <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="assignments.input"
                id="assignStudentName"
                value={form.studentName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, studentName: e.target.value }))
                }
                placeholder="Search or enter student name"
              />
            </div>
            <div className="space-y-1">
              <Label>Grade</Label>
              <Select
                value={String(form.grade)}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, grade: Number(v) }))
                }
              >
                <SelectTrigger data-ocid="assignments.select">
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
            <div className="space-y-1">
              <Label>Section</Label>
              <Select
                value={form.section}
                onValueChange={(v) => setForm((p) => ({ ...p, section: v }))}
              >
                <SelectTrigger data-ocid="assignments.select">
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
            <div className="space-y-1">
              <Label>Route</Label>
              <Select
                value={String(form.routeId)}
                onValueChange={handleRouteChange}
              >
                <SelectTrigger data-ocid="assignments.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROUTES.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.routeNumber} — {r.routeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Bus (Auto-assigned)</Label>
              <Input
                data-ocid="assignments.input"
                value={form.busNumber}
                readOnly
                className="bg-gray-50 text-gray-500"
              />
            </div>
            <div className="space-y-1">
              <Label>Pickup Point</Label>
              <Select
                value={form.pickupPoint}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, pickupPoint: v }))
                }
              >
                <SelectTrigger data-ocid="assignments.select">
                  <SelectValue placeholder="Select stop" />
                </SelectTrigger>
                <SelectContent>
                  {(selectedRoute?.stops ?? []).map((stop) => (
                    <SelectItem key={stop.order} value={stop.name}>
                      {stop.name} ({stop.time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="pickupTime">Pickup Time</Label>
              <Input
                data-ocid="assignments.input"
                id="pickupTime"
                type="time"
                value={form.pickupTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pickupTime: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dropTime">Drop Time</Label>
              <Input
                data-ocid="assignments.input"
                id="dropTime"
                type="time"
                value={form.dropTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dropTime: e.target.value }))
                }
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="pt-4 gap-2 flex-shrink-0">
          <Button
            data-ocid="assignments.cancel_button"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="assignments.submit_button"
            type="submit"
            form="assignment-form"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initial ? (
              "Update Assignment"
            ) : (
              "Add Assignment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

export default function TransportAssignmentsPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const [assignments, setAssignments] =
    useState<StudentAssignment[]>(STUDENT_ASSIGNMENTS);
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StudentAssignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentAssignment | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!profileLoading && !profile) navigate({ to: "/login" });
  }, [profile, profileLoading, navigate]);

  async function handleLogout() {
    await logoutMutation.mutateAsync("token");
    navigate({ to: "/login" });
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assignments.filter((a) => {
      if (q && !a.studentName.toLowerCase().includes(q)) return false;
      if (routeFilter !== "all" && String(a.routeId) !== routeFilter)
        return false;
      if (gradeFilter !== "all" && String(a.grade) !== gradeFilter)
        return false;
      if (sectionFilter !== "all" && a.section !== sectionFilter) return false;
      return true;
    });
  }, [assignments, search, routeFilter, gradeFilter, sectionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const stats = useMemo(() => {
    const routesUsed = new Set(assignments.map((a) => a.routeId)).size;
    return {
      total: assignments.length,
      routesUtilized: routesUsed,
      unassigned: 520 - assignments.length,
    };
  }, [assignments]);

  function handleSave(data: AssignmentFormState) {
    if (editTarget) {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === editTarget.id ? { ...data, id: editTarget.id } : a,
        ),
      );
      toast.success(`${data.studentName}'s assignment updated`);
    } else {
      const maxId = assignments.reduce((m, a) => Math.max(m, a.id), 0);
      setAssignments((prev) => [...prev, { ...data, id: maxId + 1 }]);
      toast.success(`${data.studentName} assigned to ${data.routeName}`);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setAssignments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    toast.success(`${deleteTarget.studentName} unassigned`);
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function handleExportExcel() {
    exportToExcel("transport-assignments", [
      {
        name: "Assignments",
        rows: filtered.map((a, i) => ({
          "#": i + 1,
          Student: a.studentName,
          Grade: a.grade,
          Section: a.section,
          Route: a.routeName,
          Bus: a.busNumber,
          "Pickup Point": a.pickupPoint,
          "Pickup Time": a.pickupTime,
          "Drop Time": a.dropTime,
        })),
      },
    ]);
    toast.success("Excel downloaded");
  }

  function handleExportPDF() {
    exportToPDF(
      "transport-assignments",
      "CYMI — Student Transport Assignments",
      [
        "#",
        "Student",
        "Grade",
        "Section",
        "Route",
        "Bus",
        "Pickup Point",
        "Pickup",
        "Drop",
      ],
      filtered.map((a, i) => [
        i + 1,
        a.studentName,
        a.grade,
        a.section,
        a.routeName,
        a.busNumber,
        a.pickupPoint,
        a.pickupTime,
        a.dropTime,
      ]),
      `Total ${filtered.length} assignments | Generated ${new Date().toLocaleDateString("en-IN")}`,
    );
    toast.success("PDF downloaded");
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="assignments.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading assignments...</p>
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
                <Users className="w-5 h-5 text-blue-600" /> Student Assignments
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage student transport route assignments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-ocid="assignments.secondary_button"
                    variant="outline"
                    className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    data-ocid="assignments.export.excel_button"
                    onClick={handleExportExcel}
                    className="gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />{" "}
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-ocid="assignments.export.pdf_button"
                    onClick={handleExportPDF}
                    className="gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-red-500" /> Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                data-ocid="assignments.primary_button"
                onClick={() => {
                  setEditTarget(null);
                  setAddEditOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" /> Add Assignment
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard
              label="Total Assigned"
              value={stats.total}
              icon={<Users className="w-5 h-5" />}
              color="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-100"
              delay={0.05}
            />
            <StatCard
              label="Routes Utilized"
              value={stats.routesUtilized}
              icon={<Route className="w-5 h-5" />}
              color="text-green-600"
              bgColor="bg-green-50"
              borderColor="border-green-100"
              delay={0.1}
            />
            <StatCard
              label="Unassigned Students"
              value={stats.unassigned}
              icon={<Users className="w-5 h-5" />}
              color="text-amber-600"
              bgColor="bg-amber-50"
              borderColor="border-amber-100"
              delay={0.15}
            />
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                data-ocid="assignments.search_input"
                placeholder="Search student..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
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
            <Select
              value={routeFilter}
              onValueChange={(v) => {
                setRouteFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger
                data-ocid="assignments.select"
                className="h-8 text-sm w-[150px]"
              >
                <SelectValue placeholder="Route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                {ROUTES.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.routeNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={gradeFilter}
              onValueChange={(v) => {
                setGradeFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger
                data-ocid="assignments.select"
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
            <Select
              value={sectionFilter}
              onValueChange={(v) => {
                setSectionFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger
                data-ocid="assignments.select"
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
            {(search ||
              routeFilter !== "all" ||
              gradeFilter !== "all" ||
              sectionFilter !== "all") && (
              <Button
                data-ocid="assignments.secondary_button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-gray-500 hover:text-gray-800 gap-1"
                onClick={() => {
                  setSearch("");
                  setRouteFilter("all");
                  setGradeFilter("all");
                  setSectionFilter("all");
                  setPage(1);
                }}
              >
                <X className="w-3 h-3" /> Clear
              </Button>
            )}
          </div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table data-ocid="assignments.table">
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 w-8">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Student
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Grade & Section
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Route
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Bus
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Pickup Point
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Pickup
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Drop
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <div
                          data-ocid="assignments.empty_state"
                          className="flex flex-col items-center justify-center py-16 text-center"
                        >
                          <Users className="w-10 h-10 text-gray-300 mb-3" />
                          <p className="text-sm font-semibold text-gray-600">
                            No assignments found
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Try adjusting your filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((a, idx) => {
                      const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
                      const ocidIdx = idx + 1;
                      return (
                        <TableRow
                          key={a.id}
                          data-ocid={`assignments.row.${ocidIdx}`}
                          className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <TableCell className="text-xs text-gray-400 font-mono py-3">
                            {rowNum}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 text-xs font-bold">
                                {a.studentName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                              <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                                {a.studentName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-700 font-medium">
                              Gr. {a.grade}
                            </span>
                            <span className="ml-1 text-xs text-gray-400">
                              – {a.section}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                              <Route className="w-3 h-3" /> {a.routeName}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                              <Bus className="w-3 h-3" /> {a.busNumber}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-sm text-gray-600 whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {a.pickupPoint}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-sm font-mono text-gray-600 whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-green-500" />
                              {a.pickupTime}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-sm font-mono text-gray-600 whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-500" />
                              {a.dropTime}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                data-ocid={`assignments.edit_button.${ocidIdx}`}
                                onClick={() => {
                                  setEditTarget(a);
                                  setAddEditOpen(true);
                                }}
                                title="Edit"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                data-ocid={`assignments.delete_button.${ocidIdx}`}
                                onClick={() => {
                                  setDeleteTarget(a);
                                  setDeleteOpen(true);
                                }}
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
            {filtered.length > PAGE_SIZE && (
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
                  assignments
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    data-ocid="assignments.pagination_prev"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ‹
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p =
                      totalPages <= 5
                        ? i + 1
                        : page <= 3
                          ? i + 1
                          : page >= totalPages - 2
                            ? totalPages - 4 + i
                            : page - 2 + i;
                    return (
                      <Button
                        key={p}
                        data-ocid="assignments.pagination_next"
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
                    data-ocid="assignments.pagination_next"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    ›
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <AssignmentFormDialog
        open={addEditOpen}
        onClose={() => {
          setAddEditOpen(false);
          setEditTarget(null);
        }}
        initial={editTarget}
        onSave={handleSave}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-ocid="assignments.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{deleteTarget?.studentName}</strong> from their transport
              route? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="assignments.cancel_button"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="assignments.confirm_button"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
