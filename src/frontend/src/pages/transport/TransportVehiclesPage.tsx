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
  Wrench,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { DRIVERS, VEHICLES, type Vehicle } from "../../data/transportation";
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

function VehicleStatusBadge({ status }: { status: Vehicle["status"] }) {
  if (status === "Active")
    return (
      <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">
        Active
      </Badge>
    );
  if (status === "Maintenance")
    return (
      <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100">
        Maintenance
      </Badge>
    );
  return (
    <Badge className="bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-100">
      Inactive
    </Badge>
  );
}

// ─── Vehicle Form ─────────────────────────────────────────────────────────────

type VehicleFormState = Omit<Vehicle, "id">;

const EMPTY_VEHICLE: VehicleFormState = {
  busNumber: "",
  model: "",
  capacity: 40,
  fuelType: "Diesel",
  regNumber: "",
  driverId: null,
  status: "Active",
  lastService: new Date().toISOString().split("T")[0],
};

function VehicleFormDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Vehicle | null;
  onSave: (data: VehicleFormState) => void;
}) {
  const [form, setForm] = useState<VehicleFormState>(
    initial ? { ...initial } : { ...EMPTY_VEHICLE },
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(initial ? { ...initial } : { ...EMPTY_VEHICLE });
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.busNumber.trim() ||
      !form.model.trim() ||
      !form.regNumber.trim()
    ) {
      toast.error("Bus number, model and registration are required");
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
        data-ocid="vehicles.dialog"
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Vehicle" : "Add New Vehicle"}
          </DialogTitle>
          <DialogDescription>
            {initial
              ? "Update vehicle details below."
              : "Fill in the vehicle details to add to the fleet."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-2">
          <form
            id="vehicle-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1"
          >
            <div className="space-y-1">
              <Label htmlFor="busNumber">
                Bus Number <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="vehicles.input"
                id="busNumber"
                value={form.busNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, busNumber: e.target.value }))
                }
                placeholder="BUS-001"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="model">
                Model <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="vehicles.input"
                id="model"
                value={form.model}
                onChange={(e) =>
                  setForm((p) => ({ ...p, model: e.target.value }))
                }
                placeholder="Tata Starbus 54"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="regNumber">
                Registration No <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="vehicles.input"
                id="regNumber"
                value={form.regNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, regNumber: e.target.value }))
                }
                placeholder="KA01-F-3421"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="capacity">Capacity (Seats)</Label>
              <Input
                data-ocid="vehicles.input"
                id="capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, capacity: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Fuel Type</Label>
              <Select
                value={form.fuelType}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, fuelType: v as Vehicle["fuelType"] }))
                }
              >
                <SelectTrigger data-ocid="vehicles.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="CNG">CNG</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, status: v as Vehicle["status"] }))
                }
              >
                <SelectTrigger data-ocid="vehicles.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Assign Driver</Label>
              <Select
                value={form.driverId === null ? "none" : String(form.driverId)}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    driverId: v === "none" ? null : Number(v),
                  }))
                }
              >
                <SelectTrigger data-ocid="vehicles.select">
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Unassigned —</SelectItem>
                  {DRIVERS.filter((d) => d.status === "Active").map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastService">Last Service Date</Label>
              <Input
                data-ocid="vehicles.input"
                id="lastService"
                type="date"
                value={form.lastService}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lastService: e.target.value }))
                }
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="pt-4 gap-2 flex-shrink-0">
          <Button
            data-ocid="vehicles.cancel_button"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="vehicles.submit_button"
            type="submit"
            form="vehicle-form"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initial ? (
              "Update Vehicle"
            ) : (
              "Add Vehicle"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransportVehiclesPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
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
    return vehicles.filter((v) => {
      if (
        q &&
        !v.busNumber.toLowerCase().includes(q) &&
        !v.model.toLowerCase().includes(q) &&
        !v.regNumber.toLowerCase().includes(q)
      )
        return false;
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      return true;
    });
  }, [vehicles, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: vehicles.length,
      active: vehicles.filter((v) => v.status === "Active").length,
      maintenance: vehicles.filter((v) => v.status === "Maintenance").length,
      inactive: vehicles.filter((v) => v.status === "Inactive").length,
    }),
    [vehicles],
  );

  function getDriverName(driverId: number | null): string {
    if (!driverId) return "— Unassigned —";
    const d = DRIVERS.find((dr) => dr.id === driverId);
    return d ? d.name : "—";
  }

  function handleSave(data: VehicleFormState) {
    if (editTarget) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === editTarget.id ? { ...data, id: editTarget.id } : v,
        ),
      );
      toast.success(`${data.busNumber} updated`);
    } else {
      const maxId = vehicles.reduce((m, v) => Math.max(m, v.id), 0);
      setVehicles((prev) => [...prev, { ...data, id: maxId + 1 }]);
      toast.success(`${data.busNumber} added to fleet`);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setVehicles((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    toast.success(`${deleteTarget.busNumber} removed from fleet`);
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function handleExportExcel() {
    exportToExcel("transport-vehicles", [
      {
        name: "Vehicles",
        rows: filtered.map((v, i) => ({
          "#": i + 1,
          "Bus No": v.busNumber,
          Model: v.model,
          Capacity: v.capacity,
          Fuel: v.fuelType,
          "Reg No": v.regNumber,
          Driver: getDriverName(v.driverId),
          Status: v.status,
          "Last Service": v.lastService,
        })),
      },
    ]);
    toast.success("Excel downloaded");
  }

  function handleExportPDF() {
    exportToPDF(
      "transport-vehicles",
      "CYMI — Vehicle Fleet",
      [
        "#",
        "Bus No",
        "Model",
        "Capacity",
        "Fuel",
        "Reg No",
        "Driver",
        "Status",
        "Last Service",
      ],
      filtered.map((v, i) => [
        i + 1,
        v.busNumber,
        v.model,
        v.capacity,
        v.fuelType,
        v.regNumber,
        getDriverName(v.driverId),
        v.status,
        v.lastService,
      ]),
      `Total ${filtered.length} vehicles | Generated ${new Date().toLocaleDateString("en-IN")}`,
    );
    toast.success("PDF downloaded");
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="vehicles.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading vehicles...</p>
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
                <Bus className="w-5 h-5 text-blue-600" /> Vehicles Management
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage school bus fleet and maintenance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-ocid="vehicles.secondary_button"
                    variant="outline"
                    className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    data-ocid="vehicles.export.excel_button"
                    onClick={handleExportExcel}
                    className="gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />{" "}
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-ocid="vehicles.export.pdf_button"
                    onClick={handleExportPDF}
                    className="gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-red-500" /> Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                data-ocid="vehicles.primary_button"
                onClick={() => {
                  setEditTarget(null);
                  setAddEditOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" /> Add Vehicle
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total Vehicles"
              value={stats.total}
              icon={<Bus className="w-5 h-5" />}
              color="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-100"
              delay={0.05}
            />
            <StatCard
              label="Active"
              value={stats.active}
              icon={<Bus className="w-5 h-5" />}
              color="text-green-600"
              bgColor="bg-green-50"
              borderColor="border-green-100"
              delay={0.1}
            />
            <StatCard
              label="In Maintenance"
              value={stats.maintenance}
              icon={<Wrench className="w-5 h-5" />}
              color="text-amber-600"
              bgColor="bg-amber-50"
              borderColor="border-amber-100"
              delay={0.15}
            />
            <StatCard
              label="Inactive"
              value={stats.inactive}
              icon={<Bus className="w-5 h-5" />}
              color="text-red-500"
              bgColor="bg-red-50"
              borderColor="border-red-100"
              delay={0.2}
            />
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                data-ocid="vehicles.search_input"
                placeholder="Search vehicles..."
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
                data-ocid="vehicles.select"
                className="h-8 text-sm w-[140px]"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
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
              <Table data-ocid="vehicles.table">
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 w-8">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Bus No
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Model
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Capacity
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Fuel
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Assigned Driver
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Reg. No
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Last Service
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10}>
                        <div
                          data-ocid="vehicles.empty_state"
                          className="flex flex-col items-center justify-center py-16 text-center"
                        >
                          <Bus className="w-10 h-10 text-gray-300 mb-3" />
                          <p className="text-sm font-semibold text-gray-600">
                            No vehicles found
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Try adjusting your filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((v, idx) => (
                      <TableRow
                        key={v.id}
                        data-ocid={`vehicles.row.${idx + 1}`}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <TableCell className="text-xs text-gray-400 font-mono py-3">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="py-3 font-mono text-xs text-blue-700 font-semibold whitespace-nowrap">
                          {v.busNumber}
                        </TableCell>
                        <TableCell className="py-3 text-sm font-medium text-gray-800 whitespace-nowrap">
                          {v.model}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-600">
                          {v.capacity} seats
                        </TableCell>
                        <TableCell className="py-3">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.fuelType === "Electric" ? "bg-green-100 text-green-700" : v.fuelType === "CNG" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                          >
                            {v.fuelType}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-700 whitespace-nowrap">
                          {getDriverName(v.driverId)}
                        </TableCell>
                        <TableCell className="py-3 text-xs font-mono text-gray-600 whitespace-nowrap">
                          {v.regNumber}
                        </TableCell>
                        <TableCell className="py-3">
                          <VehicleStatusBadge status={v.status} />
                        </TableCell>
                        <TableCell className="py-3 text-xs text-gray-500 whitespace-nowrap">
                          {v.lastService}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              data-ocid={`vehicles.edit_button.${idx + 1}`}
                              onClick={() => {
                                setEditTarget(v);
                                setAddEditOpen(true);
                              }}
                              title="Edit"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              data-ocid={`vehicles.delete_button.${idx + 1}`}
                              onClick={() => {
                                setDeleteTarget(v);
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

      <VehicleFormDialog
        open={addEditOpen}
        onClose={() => {
          setAddEditOpen(false);
          setEditTarget(null);
        }}
        initial={editTarget}
        onSave={handleSave}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-ocid="vehicles.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{deleteTarget?.busNumber}</strong> ({deleteTarget?.model})
              from the fleet? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="vehicles.cancel_button"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="vehicles.confirm_button"
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
