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
import { useNavigate } from "@tanstack/react-router";
import {
  Bus,
  Download,
  Edit,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { DRIVERS, type Driver, VEHICLES } from "../../data/transportation";
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

// ─── Status Badge ─────────────────────────────────────────────────────────────

function DriverStatusBadge({ status }: { status: Driver["status"] }) {
  if (status === "Active")
    return (
      <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">
        Active
      </Badge>
    );
  return (
    <Badge className="bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-100">
      Inactive
    </Badge>
  );
}

// ─── Driver Form ──────────────────────────────────────────────────────────────

type DriverFormState = Omit<Driver, "id">;

const EMPTY_DRIVER: DriverFormState = {
  name: "",
  licenseNumber: "",
  phone: "",
  email: "",
  experience: 1,
  assignedVehicleId: null,
  joiningDate: new Date().toISOString().split("T")[0],
  status: "Active",
};

function DriverFormDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Driver | null;
  onSave: (data: DriverFormState) => void;
}) {
  const [form, setForm] = useState<DriverFormState>(
    initial ? { ...initial } : { ...EMPTY_DRIVER },
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(initial ? { ...initial } : { ...EMPTY_DRIVER });
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.licenseNumber.trim()) {
      toast.error("Name and license number are required");
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
        data-ocid="drivers.dialog"
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Driver" : "Add New Driver"}
          </DialogTitle>
          <DialogDescription>
            {initial
              ? "Update driver details below."
              : "Fill in the driver details to add to the system."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-2">
          <form
            id="driver-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1"
          >
            <div className="space-y-1">
              <Label htmlFor="driverName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="drivers.input"
                id="driverName"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Ramesh Kumar"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="licenseNumber">
                License No <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="drivers.input"
                id="licenseNumber"
                value={form.licenseNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, licenseNumber: e.target.value }))
                }
                placeholder="KA01-20180045"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="driverPhone">Phone</Label>
              <Input
                data-ocid="drivers.input"
                id="driverPhone"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="9845012345"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="driverEmail">Email</Label>
              <Input
                data-ocid="drivers.input"
                id="driverEmail"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="driver@cymi.edu"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="experience">Experience (years)</Label>
              <Input
                data-ocid="drivers.input"
                id="experience"
                type="number"
                min={0}
                value={form.experience}
                onChange={(e) =>
                  setForm((p) => ({ ...p, experience: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="joiningDate">Joining Date</Label>
              <Input
                data-ocid="drivers.input"
                id="joiningDate"
                type="date"
                value={form.joiningDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, joiningDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, status: v as Driver["status"] }))
                }
              >
                <SelectTrigger data-ocid="drivers.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Assigned Vehicle</Label>
              <Select
                value={
                  form.assignedVehicleId === null
                    ? "none"
                    : String(form.assignedVehicleId)
                }
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    assignedVehicleId: v === "none" ? null : Number(v),
                  }))
                }
              >
                <SelectTrigger data-ocid="drivers.select">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Unassigned —</SelectItem>
                  {VEHICLES.filter((v) => v.status !== "Inactive").map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.busNumber} — {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="pt-4 gap-2 flex-shrink-0">
          <Button
            data-ocid="drivers.cancel_button"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="drivers.submit_button"
            type="submit"
            form="driver-form"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initial ? (
              "Update Driver"
            ) : (
              "Add Driver"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransportDriversPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const [drivers, setDrivers] = useState<Driver[]>(DRIVERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Driver | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null);
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
    return drivers.filter((d) => {
      if (
        q &&
        !d.name.toLowerCase().includes(q) &&
        !d.licenseNumber.toLowerCase().includes(q) &&
        !d.phone.includes(q)
      )
        return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      return true;
    });
  }, [drivers, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: drivers.length,
      active: drivers.filter((d) => d.status === "Active").length,
      assigned: drivers.filter((d) => d.assignedVehicleId !== null).length,
      available: drivers.filter(
        (d) => d.status === "Active" && d.assignedVehicleId === null,
      ).length,
    }),
    [drivers],
  );

  function getAssignedBus(vehicleId: number | null): string {
    if (!vehicleId) return "— Unassigned —";
    const v = VEHICLES.find((vv) => vv.id === vehicleId);
    return v ? v.busNumber : "—";
  }

  function handleSave(data: DriverFormState) {
    if (editTarget) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === editTarget.id ? { ...data, id: editTarget.id } : d,
        ),
      );
      toast.success(`${data.name} updated`);
    } else {
      const maxId = drivers.reduce((m, d) => Math.max(m, d.id), 0);
      setDrivers((prev) => [...prev, { ...data, id: maxId + 1 }]);
      toast.success(`${data.name} added`);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setDrivers((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    toast.success(`${deleteTarget.name} removed`);
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function handleExportExcel() {
    exportToExcel("transport-drivers", [
      {
        name: "Drivers",
        rows: filtered.map((d, i) => ({
          "#": i + 1,
          Name: d.name,
          "License No": d.licenseNumber,
          Phone: d.phone,
          Email: d.email,
          "Experience (yrs)": d.experience,
          "Assigned Bus": getAssignedBus(d.assignedVehicleId),
          "Joining Date": d.joiningDate,
          Status: d.status,
        })),
      },
    ]);
    toast.success("Excel downloaded");
  }

  function handleExportPDF() {
    exportToPDF(
      "transport-drivers",
      "CYMI — Driver Directory",
      [
        "#",
        "Name",
        "License No",
        "Phone",
        "Experience",
        "Assigned Bus",
        "Joining Date",
        "Status",
      ],
      filtered.map((d, i) => [
        i + 1,
        d.name,
        d.licenseNumber,
        d.phone,
        `${d.experience} yrs`,
        getAssignedBus(d.assignedVehicleId),
        d.joiningDate,
        d.status,
      ]),
      `Total ${filtered.length} drivers | Generated ${new Date().toLocaleDateString("en-IN")}`,
    );
    toast.success("PDF downloaded");
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="drivers.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading drivers...</p>
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
                <Users className="w-5 h-5 text-blue-600" /> Drivers Management
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage bus drivers and license details
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-ocid="drivers.secondary_button"
                    variant="outline"
                    className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    data-ocid="drivers.export.excel_button"
                    onClick={handleExportExcel}
                    className="gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />{" "}
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-ocid="drivers.export.pdf_button"
                    onClick={handleExportPDF}
                    className="gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-red-500" /> Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                data-ocid="drivers.primary_button"
                onClick={() => {
                  setEditTarget(null);
                  setAddEditOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" /> Add Driver
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total Drivers"
              value={stats.total}
              icon={<Users className="w-5 h-5" />}
              color="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-100"
              delay={0.05}
            />
            <StatCard
              label="Active"
              value={stats.active}
              icon={<UserCheck className="w-5 h-5" />}
              color="text-green-600"
              bgColor="bg-green-50"
              borderColor="border-green-100"
              delay={0.1}
            />
            <StatCard
              label="Assigned to Bus"
              value={stats.assigned}
              icon={<Bus className="w-5 h-5" />}
              color="text-amber-600"
              bgColor="bg-amber-50"
              borderColor="border-amber-100"
              delay={0.15}
            />
            <StatCard
              label="Available"
              value={stats.available}
              icon={<UserCheck className="w-5 h-5" />}
              color="text-purple-600"
              bgColor="bg-purple-50"
              borderColor="border-purple-100"
              delay={0.2}
            />
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                data-ocid="drivers.search_input"
                placeholder="Search drivers..."
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                data-ocid="drivers.select"
                className="h-8 text-sm w-[130px]"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
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
              <Table data-ocid="drivers.table">
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 w-8">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      License No
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Phone
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Experience
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Assigned Bus
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <div
                          data-ocid="drivers.empty_state"
                          className="flex flex-col items-center justify-center py-16 text-center"
                        >
                          <Users className="w-10 h-10 text-gray-300 mb-3" />
                          <p className="text-sm font-semibold text-gray-600">
                            No drivers found
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Try adjusting your filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((d, idx) => (
                      <TableRow
                        key={d.id}
                        data-ocid={`drivers.row.${idx + 1}`}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <TableCell className="text-xs text-gray-400 font-mono py-3">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 text-xs font-bold">
                              {d.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                              {d.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-xs font-mono text-gray-600 whitespace-nowrap">
                          {d.licenseNumber}
                        </TableCell>
                        <TableCell className="py-3 text-sm font-mono text-gray-600 whitespace-nowrap">
                          {d.phone}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-600">
                          {d.experience} yrs
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-700 whitespace-nowrap">
                          {d.assignedVehicleId ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                              <Bus className="w-3 h-3" />{" "}
                              {getAssignedBus(d.assignedVehicleId)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              — Unassigned —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          <DriverStatusBadge status={d.status} />
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              data-ocid={`drivers.edit_button.${idx + 1}`}
                              onClick={() => {
                                setEditTarget(d);
                                setAddEditOpen(true);
                              }}
                              title="Edit"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              data-ocid={`drivers.delete_button.${idx + 1}`}
                              onClick={() => {
                                setDeleteTarget(d);
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>
      </main>

      <DriverFormDialog
        open={addEditOpen}
        onClose={() => {
          setAddEditOpen(false);
          setEditTarget(null);
        }}
        initial={editTarget}
        onSave={handleSave}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-ocid="drivers.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{deleteTarget?.name}</strong> from the system? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="drivers.cancel_button"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="drivers.confirm_button"
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
