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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  BadgePercent,
  CheckCircle,
  Clock,
  Download,
  Edit,
  FileSpreadsheet,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { type Concession, FEE_CONCESSIONS } from "../../data/feeConcessions";
import { FEE_STRUCTURES, FEE_STUDENTS } from "../../data/fees";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const ALL_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const CONCESSION_TYPES = [
  "Merit",
  "Financial Aid",
  "Staff Ward",
  "Sports",
  "Other",
] as const;
const APPROVED_BY_OPTIONS = [
  "Principal",
  "Vice Principal",
  "Admin Head",
  "Management",
  "Finance Head",
];

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

const EMPTY_FORM: Omit<Concession, "id"> = {
  studentId: 1,
  studentName: "",
  admissionNo: "",
  grade: 1,
  section: "A",
  type: "Merit",
  discountType: "Percentage",
  discountValue: 10,
  feeHeads: [],
  validFrom: "",
  validUntil: "",
  approvedBy: "Principal",
  status: "Pending",
  remarks: "",
};

export default function FeeConcessionPage() {
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

  const [concessions, setConcessions] = useState<Concession[]>(FEE_CONCESSIONS);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Concession, "id">>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return concessions.filter((c) => {
      const matchSearch =
        search === "" ||
        c.studentName.toLowerCase().includes(search.toLowerCase());
      const matchGrade =
        filterGrade === "all" || String(c.grade) === filterGrade;
      const matchType = filterType === "all" || c.type === filterType;
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      return matchSearch && matchGrade && matchType && matchStatus;
    });
  }, [concessions, search, filterGrade, filterType, filterStatus]);

  const stats = useMemo(
    () => ({
      total: concessions.length,
      active: concessions.filter((c) => c.status === "Active").length,
      totalAmount: concessions
        .filter((c) => c.status === "Active" && c.discountType === "Fixed")
        .reduce((s, c) => s + c.discountValue, 0),
      pending: concessions.filter((c) => c.status === "Pending").length,
    }),
    [concessions],
  );

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(c: Concession) {
    setEditingId(c.id);
    setForm({ ...c });
    setModalOpen(true);
  }

  function handleStudentChange(id: string) {
    const s = FEE_STUDENTS.find((st) => String(st.id) === id);
    if (s) {
      setForm((prev) => ({
        ...prev,
        studentId: s.id,
        studentName: s.name,
        admissionNo: s.admissionNo,
        grade: s.grade,
      }));
    }
  }

  function handleFeeHeadToggle(name: string) {
    setForm((prev) => ({
      ...prev,
      feeHeads: prev.feeHeads.includes(name)
        ? prev.feeHeads.filter((h) => h !== name)
        : [...prev.feeHeads, name],
    }));
  }

  function handleSave() {
    if (!form.studentName) {
      toast.error("Select a student");
      return;
    }
    if (!form.validFrom || !form.validUntil) {
      toast.error("Set valid dates");
      return;
    }
    if (editingId !== null) {
      setConcessions((prev) =>
        prev.map((c) => (c.id === editingId ? { ...form, id: editingId } : c)),
      );
      toast.success("Concession updated");
    } else {
      const newId = Math.max(...concessions.map((c) => c.id), 0) + 1;
      setConcessions((prev) => [...prev, { ...form, id: newId }]);
      toast.success("Concession added");
    }
    setModalOpen(false);
  }

  function handleDelete(id: number) {
    setConcessions((prev) => prev.filter((c) => c.id !== id));
    toast.success("Concession deleted");
    setDeleteId(null);
  }

  function handleExportExcel() {
    exportToExcel("fee_concessions", [
      {
        name: "Fee Concessions",
        rows: filtered.map((c) => ({
          "#": c.id,
          Student: c.studentName,
          "Admission No": c.admissionNo,
          Class: `${c.grade}-${c.section}`,
          Type: c.type,
          Discount:
            c.discountType === "Percentage"
              ? `${c.discountValue}%`
              : `\u20b9${c.discountValue}`,
          "Approved By": c.approvedBy,
          "Valid Until": c.validUntil,
          Status: c.status,
        })),
      },
    ]);
    toast.success("Excel downloaded");
  }

  function handleExportPDF() {
    exportToPDF(
      "fee_concessions",
      "CYMI \u2014 Fee Concessions",
      ["#", "Student", "Admission No", "Class", "Type", "Discount", "Status"],
      filtered.map((c) => [
        c.id,
        c.studentName,
        c.admissionNo,
        `${c.grade}-${c.section}`,
        c.type,
        c.discountType === "Percentage"
          ? `${c.discountValue}%`
          : `\u20b9${c.discountValue}`,
        c.status,
      ]),
    );
    toast.success("PDF downloaded");
  }

  const statusColors: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-gray-100 text-gray-600",
    Pending: "bg-amber-100 text-amber-700",
  };

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
          className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <BadgePercent className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Fee Concession</h1>
                <p className="text-blue-100 text-sm">
                  Manage student fee concessions &amp; discounts
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={handleExportExcel}
                data-ocid="fee-concession.secondary_button"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={handleExportPDF}
                data-ocid="fee-concession.secondary_button"
              >
                <FileText className="w-4 h-4 mr-1" /> PDF
              </Button>
              <Button
                size="sm"
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"
                onClick={openAdd}
                data-ocid="fee-concession.primary_button"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Concession
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="p-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Concessions"
              value={String(stats.total)}
              icon={<BadgePercent className="w-5 h-5" />}
              color="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-100"
              delay={0}
            />
            <StatCard
              label="Active Concessions"
              value={String(stats.active)}
              icon={<CheckCircle className="w-5 h-5" />}
              color="text-green-600"
              bgColor="bg-green-50"
              borderColor="border-green-100"
              delay={0.05}
            />
            <StatCard
              label="Total Amount Conceded"
              value={`\u20b9${stats.totalAmount.toLocaleString("en-IN")}`}
              icon={<Download className="w-5 h-5" />}
              color="text-purple-600"
              bgColor="bg-purple-50"
              borderColor="border-purple-100"
              delay={0.1}
            />
            <StatCard
              label="Pending Approval"
              value={String(stats.pending)}
              icon={<Clock className="w-5 h-5" />}
              color="text-amber-600"
              bgColor="bg-amber-50"
              borderColor="border-amber-100"
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
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="fee-concession.search_input"
              />
            </div>
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-36" data-ocid="fee-concession.select">
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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40" data-ocid="fee-concession.select">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CONCESSION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36" data-ocid="fee-concession.select">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
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
            <Table data-ocid="fee-concession.table">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-12 text-gray-400"
                      data-ocid="fee-concession.empty_state"
                    >
                      No concessions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c, idx) => (
                    <TableRow
                      key={c.id}
                      className="hover:bg-blue-50/40"
                      data-ocid={`fee-concession.item.${idx + 1}`}
                    >
                      <TableCell className="text-gray-500 text-xs">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">
                        {c.studentName}
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs">
                        {c.admissionNo}
                      </TableCell>
                      <TableCell>
                        {c.grade}-{c.section}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {c.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-blue-700">
                        {c.discountType === "Percentage"
                          ? `${c.discountValue}%`
                          : `\u20b9${c.discountValue.toLocaleString("en-IN")}`}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {c.approvedBy}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {c.validUntil}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusColors[c.status]} border-0 text-xs`}
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                            onClick={() => openEdit(c)}
                            data-ocid={`fee-concession.edit_button.${idx + 1}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-500 hover:bg-red-50"
                            onClick={() => setDeleteId(c.id)}
                            data-ocid={`fee-concession.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </motion.div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="fee-concession.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Concession" : "Add Concession"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Student</Label>
              <Select
                value={String(form.studentId)}
                onValueChange={handleStudentChange}
              >
                <SelectTrigger data-ocid="fee-concession.select">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {FEE_STUDENTS.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} \u2014 Class {s.grade} ({s.admissionNo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Concession Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, type: v as Concession["type"] }))
                }
              >
                <SelectTrigger data-ocid="fee-concession.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONCESSION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Discount Type</Label>
              <Select
                value={form.discountType}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    discountType: v as Concession["discountType"],
                  }))
                }
              >
                <SelectTrigger data-ocid="fee-concession.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Percentage">Percentage (%)</SelectItem>
                  <SelectItem value="Fixed">Fixed Amount (\u20b9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                Discount Value (
                {form.discountType === "Percentage" ? "%" : "\u20b9"})
              </Label>
              <Input
                type="number"
                value={form.discountValue}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    discountValue: Number(e.target.value),
                  }))
                }
                data-ocid="fee-concession.input"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, status: v as Concession["status"] }))
                }
              >
                <SelectTrigger data-ocid="fee-concession.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valid From</Label>
              <Input
                type="date"
                value={form.validFrom}
                onChange={(e) =>
                  setForm((p) => ({ ...p, validFrom: e.target.value }))
                }
                data-ocid="fee-concession.input"
              />
            </div>

            <div>
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={form.validUntil}
                onChange={(e) =>
                  setForm((p) => ({ ...p, validUntil: e.target.value }))
                }
                data-ocid="fee-concession.input"
              />
            </div>

            <div>
              <Label>Approved By</Label>
              <Select
                value={form.approvedBy}
                onValueChange={(v) => setForm((p) => ({ ...p, approvedBy: v }))}
              >
                <SelectTrigger data-ocid="fee-concession.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPROVED_BY_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label className="mb-2 block">Applicable Fee Heads</Label>
              <div className="grid grid-cols-3 gap-2">
                {FEE_STRUCTURES.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`fh-${s.id}`}
                      checked={form.feeHeads.includes(s.feeHead)}
                      onCheckedChange={() => handleFeeHeadToggle(s.feeHead)}
                      data-ocid="fee-concession.checkbox"
                    />
                    <Label
                      htmlFor={`fh-${s.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {s.feeHead}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <Label>Remarks</Label>
              <Textarea
                value={form.remarks ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, remarks: e.target.value }))
                }
                rows={2}
                data-ocid="fee-concession.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              data-ocid="fee-concession.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} data-ocid="fee-concession.save_button">
              Save Concession
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="fee-concession.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Concession?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The concession record will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="fee-concession.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId !== null && handleDelete(deleteId)}
              data-ocid="fee-concession.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
