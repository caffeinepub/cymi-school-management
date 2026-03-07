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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
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
import { Switch } from "@/components/ui/switch";
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
  DollarSign,
  Download,
  Edit,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Search,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { FEE_STRUCTURES, type FeeStructure } from "../../data/fees";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const ALL_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

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
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Fee Form Dialog ──────────────────────────────────────────────────────────
type FeeFormState = Omit<FeeStructure, "id">;
const EMPTY_FEE: FeeFormState = {
  feeHead: "",
  applicableGrades: ALL_GRADES,
  amount: 0,
  dueDate: "",
  lateFeePerDay: 0,
  status: "Active",
  category: "Academic",
};

function FeeFormDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: FeeStructure | null;
  onSave: (data: FeeFormState) => void;
}) {
  const [form, setForm] = useState<FeeFormState>(
    initial ? { ...initial } : { ...EMPTY_FEE },
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(initial ? { ...initial } : { ...EMPTY_FEE });
  }, [open, initial]);

  function toggleGrade(g: number) {
    setForm((prev) => ({
      ...prev,
      applicableGrades: prev.applicableGrades.includes(g)
        ? prev.applicableGrades.filter((x) => x !== g)
        : [...prev.applicableGrades, g].sort((a, b) => a - b),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.feeHead.trim()) {
      toast.error("Fee Head name is required");
      return;
    }
    if (form.amount <= 0) {
      toast.error("Amount must be greater than 0");
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
        data-ocid="fee-structure.dialog"
        className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Fee Head" : "Add New Fee Head"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-2">
          <form
            id="fee-structure-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-4 p-1"
          >
            <div className="col-span-2 space-y-1">
              <Label>
                Fee Head Name <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="fee-structure.input"
                value={form.feeHead}
                onChange={(e) =>
                  setForm((p) => ({ ...p, feeHead: e.target.value }))
                }
                placeholder="e.g. Tuition Fee"
              />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger data-ocid="fee-structure.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Academic",
                    "Transport",
                    "Facilities",
                    "Activities",
                    "Admission",
                    "Other",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>
                Amount (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="fee-structure.input"
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Input
                data-ocid="fee-structure.input"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Late Fee / Day (₹)</Label>
              <Input
                data-ocid="fee-structure.input"
                type="number"
                min={0}
                value={form.lateFeePerDay}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    lateFeePerDay: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label>Applicable Grades</Label>
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, applicableGrades: ALL_GRADES }))
                  }
                  className="text-xs text-blue-600 hover:underline"
                >
                  Select All
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {ALL_GRADES.map((g) => (
                  <div key={g} className="flex items-center gap-1.5">
                    <Checkbox
                      checked={form.applicableGrades.includes(g)}
                      onCheckedChange={() => toggleGrade(g)}
                      data-ocid="fee-structure.checkbox"
                      id={`grade-${g}`}
                    />
                    <label
                      htmlFor={`grade-${g}`}
                      className="text-sm cursor-pointer"
                    >
                      Cl {g}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <Switch
                checked={form.status === "Active"}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, status: v ? "Active" : "Inactive" }))
                }
                data-ocid="fee-structure.switch"
              />
              <Label>{form.status}</Label>
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="pt-4 gap-2">
          <Button
            data-ocid="fee-structure.cancel_button"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="fee-structure.submit_button"
            type="submit"
            form="fee-structure-form"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initial ? (
              "Update Fee Head"
            ) : (
              "Add Fee Head"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FeeStructurePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const [fees, setFees] = useState<FeeStructure[]>(FEE_STRUCTURES);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FeeStructure | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeeStructure | null>(null);
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
    return fees.filter((f) => {
      if (
        q &&
        !f.feeHead.toLowerCase().includes(q) &&
        !f.category.toLowerCase().includes(q)
      )
        return false;
      if (
        gradeFilter !== "all" &&
        !f.applicableGrades.includes(Number(gradeFilter))
      )
        return false;
      if (typeFilter !== "all" && f.category !== typeFilter) return false;
      return true;
    });
  }, [fees, search, gradeFilter, typeFilter]);

  const stats = useMemo(
    () => ({
      total: fees.length,
      active: fees.filter((f) => f.status === "Active").length,
      avgFee: Math.round(
        fees
          .filter((f) => f.status === "Active")
          .reduce((s, f) => s + f.amount, 0) /
          Math.max(1, fees.filter((f) => f.status === "Active").length),
      ),
      annualTarget: fees
        .filter((f) => f.status === "Active")
        .reduce((s, f) => s + f.amount * 520, 0),
    }),
    [fees],
  );

  function handleSave(data: FeeFormState) {
    if (editTarget) {
      setFees((prev) =>
        prev.map((f) =>
          f.id === editTarget.id ? { ...data, id: editTarget.id } : f,
        ),
      );
      toast.success(`${data.feeHead} updated`);
    } else {
      const maxId = fees.reduce((m, f) => Math.max(m, f.id), 0);
      setFees((prev) => [...prev, { ...data, id: maxId + 1 }]);
      toast.success(`${data.feeHead} added`);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setFees((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    toast.success(`${deleteTarget.feeHead} deleted`);
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function handleExportExcel() {
    exportToExcel("fee-structure", [
      {
        name: "Fee Structure",
        rows: filtered.map((f, i) => ({
          "#": i + 1,
          "Fee Head": f.feeHead,
          Category: f.category,
          "Applicable Grades": f.applicableGrades.join(", "),
          "Amount (₹)": f.amount,
          "Due Date": f.dueDate,
          "Late Fee/Day (₹)": f.lateFeePerDay,
          Status: f.status,
        })),
      },
    ]);
    toast.success("Excel downloaded");
  }

  function handleExportPDF() {
    exportToPDF(
      "fee-structure",
      "CYMI — Fee Structure",
      [
        "#",
        "Fee Head",
        "Category",
        "Grades",
        "Amount",
        "Due Date",
        "Late Fee/Day",
        "Status",
      ],
      filtered.map((f, i) => [
        i + 1,
        f.feeHead,
        f.category,
        f.applicableGrades.join(","),
        fmt(f.amount),
        f.dueDate,
        `₹${f.lateFeePerDay}`,
        f.status,
      ]),
      `${filtered.length} fee heads | Generated ${new Date().toLocaleDateString("en-IN")}`,
    );
    toast.success("PDF downloaded");
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="fee-structure.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading fee structure...</p>
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
                <DollarSign className="w-5 h-5 text-blue-600" /> Fee Structure
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage fee heads, amounts and applicability
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-ocid="fee-structure.secondary_button"
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    data-ocid="fee-structure.export.excel_button"
                    onClick={handleExportExcel}
                    className="gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />{" "}
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-ocid="fee-structure.export.pdf_button"
                    onClick={handleExportPDF}
                    className="gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-red-500" /> Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                data-ocid="fee-structure.primary_button"
                onClick={() => {
                  setEditTarget(null);
                  setAddEditOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" /> Add Fee Head
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total Fee Heads"
              value={String(stats.total)}
              icon={<DollarSign className="w-5 h-5" />}
              color="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-100"
              delay={0.05}
            />
            <StatCard
              label="Active Heads"
              value={String(stats.active)}
              icon={<Target className="w-5 h-5" />}
              color="text-green-600"
              bgColor="bg-green-50"
              borderColor="border-green-100"
              delay={0.1}
            />
            <StatCard
              label="Average Fee"
              value={fmt(stats.avgFee)}
              icon={<DollarSign className="w-5 h-5" />}
              color="text-amber-600"
              bgColor="bg-amber-50"
              borderColor="border-amber-100"
              delay={0.15}
            />
            <StatCard
              label="Annual Collection Target"
              value={`₹${(stats.annualTarget / 10000000).toFixed(1)}Cr`}
              icon={<Target className="w-5 h-5" />}
              color="text-purple-600"
              bgColor="bg-purple-50"
              borderColor="border-purple-100"
              delay={0.2}
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                data-ocid="fee-structure.search_input"
                placeholder="Search fee heads..."
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
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger
                data-ocid="fee-structure.select"
                className="h-8 text-sm w-[120px]"
              >
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {ALL_GRADES.map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    Class {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger
                data-ocid="fee-structure.select"
                className="h-8 text-sm w-[130px]"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {[
                  "Academic",
                  "Transport",
                  "Facilities",
                  "Activities",
                  "Admission",
                  "Other",
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table data-ocid="fee-structure.table">
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-100">
                    {[
                      "#",
                      "Fee Head",
                      "Category",
                      "Applicable Grades",
                      "Amount",
                      "Due Date",
                      "Late Fee/Day",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <TableHead
                        key={h}
                        className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3"
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <div
                          data-ocid="fee-structure.empty_state"
                          className="flex flex-col items-center py-14 text-center"
                        >
                          <DollarSign className="w-10 h-10 text-gray-300 mb-3" />
                          <p className="text-sm font-semibold text-gray-600">
                            No fee heads found
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Try adjusting your filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((f, idx) => (
                      <TableRow
                        key={f.id}
                        data-ocid={`fee-structure.row.${idx + 1}`}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <TableCell className="text-xs text-gray-400 font-mono py-3">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="py-3 font-semibold text-sm text-gray-800 whitespace-nowrap">
                          {f.feeHead}
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            {f.category}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-xs text-gray-600 max-w-[160px]">
                          {f.applicableGrades.length === 12
                            ? "All Classes"
                            : f.applicableGrades
                                .map((g) => `Cl ${g}`)
                                .join(", ")}
                        </TableCell>
                        <TableCell className="py-3 font-bold text-sm text-gray-900 whitespace-nowrap">
                          {fmt(f.amount)}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-600 whitespace-nowrap">
                          {f.dueDate || "—"}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-600 whitespace-nowrap">
                          {f.lateFeePerDay > 0
                            ? `₹${f.lateFeePerDay}/day`
                            : "—"}
                        </TableCell>
                        <TableCell className="py-3">
                          {f.status === "Active" ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              data-ocid={`fee-structure.edit_button.${idx + 1}`}
                              onClick={() => {
                                setEditTarget(f);
                                setAddEditOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              data-ocid={`fee-structure.delete_button.${idx + 1}`}
                              onClick={() => {
                                setDeleteTarget(f);
                                setDeleteOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>
      </main>

      <FeeFormDialog
        open={addEditOpen}
        onClose={() => {
          setAddEditOpen(false);
          setEditTarget(null);
        }}
        initial={editTarget}
        onSave={handleSave}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-ocid="fee-structure.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Head</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.feeHead}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="fee-structure.cancel_button"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="fee-structure.confirm_button"
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
