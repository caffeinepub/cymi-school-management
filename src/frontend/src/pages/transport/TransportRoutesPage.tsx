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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  type Stop,
  type Route as TransportRoute,
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

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "Active" | "Inactive" }) {
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

// ─── Route Form ───────────────────────────────────────────────────────────────

type RouteFormState = Omit<TransportRoute, "id">;

const EMPTY_ROUTE: RouteFormState = {
  routeNumber: "",
  routeName: "",
  startPoint: "CYMI School",
  endPoint: "",
  stops: [{ name: "CYMI School", time: "07:00", order: 1 }],
  distanceKm: 0,
  totalStudents: 0,
  status: "Active",
};

function RouteFormDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: TransportRoute | null;
  onSave: (data: RouteFormState) => void;
}) {
  const [form, setForm] = useState<RouteFormState>(
    initial ? { ...initial } : { ...EMPTY_ROUTE },
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { ...EMPTY_ROUTE });
    }
  }, [open, initial]);

  function addStop() {
    setForm((prev) => ({
      ...prev,
      stops: [
        ...prev.stops,
        { name: "", time: "07:00", order: prev.stops.length + 1 },
      ],
    }));
  }

  function removeStop(idx: number) {
    setForm((prev) => ({
      ...prev,
      stops: prev.stops
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, order: i + 1 })),
    }));
  }

  function updateStop(idx: number, field: keyof Stop, value: string | number) {
    setForm((prev) => ({
      ...prev,
      stops: prev.stops.map((s, i) =>
        i === idx ? { ...s, [field]: value } : s,
      ),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.routeNumber.trim() || !form.routeName.trim()) {
      toast.error("Route number and name are required");
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
        data-ocid="routes.dialog"
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Route" : "Add New Route"}</DialogTitle>
          <DialogDescription>
            {initial
              ? "Update route details below."
              : "Fill in the route details to add it to the system."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-2">
          <form
            id="route-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1"
          >
            <div className="space-y-1">
              <Label htmlFor="routeNumber">
                Route Number <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="routes.input"
                id="routeNumber"
                value={form.routeNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, routeNumber: e.target.value }))
                }
                placeholder="ROUTE-01"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="routeName">
                Route Name <span className="text-red-500">*</span>
              </Label>
              <Input
                data-ocid="routes.input"
                id="routeName"
                value={form.routeName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, routeName: e.target.value }))
                }
                placeholder="North City Express"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="startPoint">Start Point</Label>
              <Input
                data-ocid="routes.input"
                id="startPoint"
                value={form.startPoint}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startPoint: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endPoint">End Point</Label>
              <Input
                data-ocid="routes.input"
                id="endPoint"
                value={form.endPoint}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endPoint: e.target.value }))
                }
                placeholder="Rajajinagar"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="distanceKm">Distance (km)</Label>
              <Input
                data-ocid="routes.input"
                id="distanceKm"
                type="number"
                min={0}
                step={0.1}
                value={form.distanceKm}
                onChange={(e) =>
                  setForm((p) => ({ ...p, distanceKm: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, status: v as "Active" | "Inactive" }))
                }
              >
                <SelectTrigger data-ocid="routes.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stops */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label>Stops</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addStop}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Stop
                </Button>
              </div>
              {form.stops.map((stop, idx) => (
                <div key={stop.order} className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400 font-mono w-5">
                    {idx + 1}
                  </span>
                  <Input
                    data-ocid="routes.input"
                    value={stop.name}
                    onChange={(e) => updateStop(idx, "name", e.target.value)}
                    placeholder="Stop name"
                    className="flex-1 h-8 text-sm"
                  />
                  <Input
                    data-ocid="routes.input"
                    type="time"
                    value={stop.time}
                    onChange={(e) => updateStop(idx, "time", e.target.value)}
                    className="w-28 h-8 text-sm"
                  />
                  {form.stops.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStop(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="pt-4 gap-2 flex-shrink-0">
          <Button
            data-ocid="routes.cancel_button"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="routes.submit_button"
            type="submit"
            form="route-form"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initial ? (
              "Update Route"
            ) : (
              "Add Route"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransportRoutesPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const [routes, setRoutes] = useState<TransportRoute[]>(ROUTES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TransportRoute | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransportRoute | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewStopsRoute, setViewStopsRoute] = useState<TransportRoute | null>(
    null,
  );
  const [stopsSheetOpen, setStopsSheetOpen] = useState(false);

  useEffect(() => {
    if (!profileLoading && !profile) navigate({ to: "/login" });
  }, [profile, profileLoading, navigate]);

  async function handleLogout() {
    await logoutMutation.mutateAsync("token");
    navigate({ to: "/login" });
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return routes.filter((r) => {
      if (
        q &&
        !r.routeNumber.toLowerCase().includes(q) &&
        !r.routeName.toLowerCase().includes(q) &&
        !r.startPoint.toLowerCase().includes(q) &&
        !r.endPoint.toLowerCase().includes(q)
      )
        return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });
  }, [routes, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: routes.length,
      active: routes.filter((r) => r.status === "Active").length,
      totalStops: routes.reduce((sum, r) => sum + r.stops.length, 0),
      totalStudents: routes.reduce((sum, r) => sum + r.totalStudents, 0),
    }),
    [routes],
  );

  function handleSave(data: RouteFormState) {
    if (editTarget) {
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === editTarget.id ? { ...data, id: editTarget.id } : r,
        ),
      );
      toast.success(`Route ${data.routeNumber} updated`);
    } else {
      const maxId = routes.reduce((m, r) => Math.max(m, r.id), 0);
      setRoutes((prev) => [...prev, { ...data, id: maxId + 1 }]);
      toast.success(`Route ${data.routeNumber} added`);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setRoutes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    toast.success(`Route ${deleteTarget.routeNumber} deleted`);
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function handleViewStops(r: TransportRoute) {
    setViewStopsRoute(r);
    setStopsSheetOpen(true);
  }

  // ── Export ──
  function handleExportExcel() {
    exportToExcel("transport-routes", [
      {
        name: "Routes",
        rows: filtered.map((r, i) => ({
          "#": i + 1,
          "Route No": r.routeNumber,
          "Route Name": r.routeName,
          Start: r.startPoint,
          End: r.endPoint,
          Stops: r.stops.length,
          "Distance (km)": r.distanceKm,
          Students: r.totalStudents,
          Status: r.status,
        })),
      },
    ]);
    toast.success("Excel downloaded");
  }

  function handleExportPDF() {
    exportToPDF(
      "transport-routes",
      "CYMI — Transportation Routes",
      [
        "#",
        "Route No",
        "Route Name",
        "Start",
        "End",
        "Stops",
        "Distance",
        "Students",
        "Status",
      ],
      filtered.map((r, i) => [
        i + 1,
        r.routeNumber,
        r.routeName,
        r.startPoint,
        r.endPoint,
        r.stops.length,
        `${r.distanceKm} km`,
        r.totalStudents,
        r.status,
      ]),
      `Total ${filtered.length} routes | Generated ${new Date().toLocaleDateString("en-IN")}`,
    );
    toast.success("PDF downloaded");
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="routes.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading routes...</p>
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
                <Route className="w-5 h-5 text-blue-600" />
                Routes Management
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage school bus routes and stops
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-ocid="routes.secondary_button"
                    variant="outline"
                    className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    data-ocid="routes.export.excel_button"
                    onClick={handleExportExcel}
                    className="gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />{" "}
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-ocid="routes.export.pdf_button"
                    onClick={handleExportPDF}
                    className="gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-red-500" /> Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                data-ocid="routes.primary_button"
                onClick={() => {
                  setEditTarget(null);
                  setAddEditOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" /> Add Route
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total Routes"
              value={stats.total}
              icon={<Route className="w-5 h-5" />}
              color="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-100"
              delay={0.05}
            />
            <StatCard
              label="Active Routes"
              value={stats.active}
              icon={<Bus className="w-5 h-5" />}
              color="text-green-600"
              bgColor="bg-green-50"
              borderColor="border-green-100"
              delay={0.1}
            />
            <StatCard
              label="Total Stops"
              value={stats.totalStops}
              icon={<MapPin className="w-5 h-5" />}
              color="text-amber-600"
              bgColor="bg-amber-50"
              borderColor="border-amber-100"
              delay={0.15}
            />
            <StatCard
              label="Students Covered"
              value={stats.totalStudents}
              icon={<Users className="w-5 h-5" />}
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
                data-ocid="routes.search_input"
                placeholder="Search routes..."
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
                data-ocid="routes.select"
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
              <Table data-ocid="routes.table">
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 w-8">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Route No
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Start → End
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Stops
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Distance
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">
                      Students
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
                      <TableCell colSpan={9}>
                        <div
                          data-ocid="routes.empty_state"
                          className="flex flex-col items-center justify-center py-16 text-center"
                        >
                          <Route className="w-10 h-10 text-gray-300 mb-3" />
                          <p className="text-sm font-semibold text-gray-600">
                            No routes found
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r, idx) => (
                      <TableRow
                        key={r.id}
                        data-ocid={`routes.row.${idx + 1}`}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <TableCell className="text-xs text-gray-400 font-mono py-3">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="py-3 font-mono text-xs text-blue-700 font-semibold whitespace-nowrap">
                          {r.routeNumber}
                        </TableCell>
                        <TableCell className="py-3 text-sm font-medium text-gray-800 whitespace-nowrap">
                          {r.routeName}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-600 whitespace-nowrap">
                          <span className="text-gray-500">{r.startPoint}</span>
                          <span className="mx-1.5 text-gray-300">→</span>
                          <span>{r.endPoint}</span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                            <MapPin className="w-3 h-3" /> {r.stops.length}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-600 whitespace-nowrap">
                          {r.distanceKm} km
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                            <Users className="w-3 h-3" /> {r.totalStudents}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <StatusBadge status={r.status} />
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              data-ocid={`routes.secondary_button.${idx + 1}`}
                              onClick={() => handleViewStops(r)}
                              title="View Stops"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <MapPin className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              data-ocid={`routes.edit_button.${idx + 1}`}
                              onClick={() => {
                                setEditTarget(r);
                                setAddEditOpen(true);
                              }}
                              title="Edit"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              data-ocid={`routes.delete_button.${idx + 1}`}
                              onClick={() => {
                                setDeleteTarget(r);
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

      {/* Add/Edit Dialog */}
      <RouteFormDialog
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
        <AlertDialogContent data-ocid="routes.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {deleteTarget?.routeNumber} — {deleteTarget?.routeName}
              </strong>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="routes.cancel_button"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="routes.confirm_button"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Stops Sheet */}
      <Sheet open={stopsSheetOpen} onOpenChange={setStopsSheetOpen}>
        <SheetContent
          data-ocid="routes.sheet"
          className="w-[380px] sm:w-[480px]"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {viewStopsRoute?.routeNumber} — Stops
            </SheetTitle>
            <SheetDescription>
              {viewStopsRoute?.routeName} · {viewStopsRoute?.stops.length} stops
              · {viewStopsRoute?.distanceKm} km
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {viewStopsRoute?.stops
              .sort((a, b) => a.order - b.order)
              .map((stop, idx) => (
                <div key={stop.order} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${idx === 0 ? "bg-blue-600 text-white" : idx === viewStopsRoute.stops.length - 1 ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}
                    >
                      {stop.order}
                    </div>
                    {idx < viewStopsRoute.stops.length - 1 && (
                      <div className="w-0.5 h-6 bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {stop.name}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {stop.time}
                      {idx === 0 && (
                        <span className="ml-2 text-blue-600 font-semibold">
                          Departure
                        </span>
                      )}
                      {idx === viewStopsRoute.stops.length - 1 && (
                        <span className="ml-2 text-green-600 font-semibold">
                          Terminus
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
