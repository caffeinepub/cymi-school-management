import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useNavigate } from "@tanstack/react-router";
import {
  FileSpreadsheet,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { type HREmployee, HR_EMPLOYEES } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const PAGE_SIZE = 15;
const DEPARTMENTS = [
  "All",
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Studies",
  "Computer",
  "Arts",
  "Physical Education",
  "Administration",
  "Accounts",
];
const EMP_TYPES = ["All", "Permanent", "Contract", "Part-time"];

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  "On Leave": "bg-amber-100 text-amber-700",
  Resigned: "bg-red-100 text-red-700",
};

export default function HREmployeesPage() {
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

  const [data, setData] = useState<HREmployee[]>(HR_EMPLOYEES);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "add" | "edit";
    item: Partial<HREmployee>;
  }>({ open: false, mode: "add", item: {} });

  const filtered = useMemo(
    () =>
      data.filter((e) => {
        const matchS =
          search === "" ||
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.empId.toLowerCase().includes(search.toLowerCase());
        const matchD = dept === "All" || e.department === dept;
        const matchT = type === "All" || e.employmentType === type;
        const matchSt = status === "all" || e.status === status;
        return matchS && matchD && matchT && matchSt;
      }),
    [data, search, dept, type, status],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openAdd() {
    setDialog({
      open: true,
      mode: "add",
      item: {
        status: "Active",
        employmentType: "Permanent",
        department: "Mathematics",
      },
    });
  }
  function openEdit(item: HREmployee) {
    setDialog({ open: true, mode: "edit", item: { ...item } });
  }
  function handleDelete(id: number) {
    setData((d) => d.filter((e) => e.id !== id));
    toast.success("Employee record deleted");
  }
  function handleSave() {
    const item = dialog.item;
    if (!item.name || !item.empId) {
      toast.error("Name and Emp ID required");
      return;
    }
    if (dialog.mode === "add") {
      const newId = Math.max(...data.map((e) => e.id)) + 1;
      setData((d) => [
        ...d,
        { ...item, id: newId, email: `emp${newId}@cymi.edu.in` } as HREmployee,
      ]);
      toast.success("Employee added");
    } else {
      setData((d) =>
        d.map((e) =>
          e.id === item.id ? ({ ...e, ...item } as HREmployee) : e,
        ),
      );
      toast.success("Employee updated");
    }
    setDialog((d) => ({ ...d, open: false }));
  }

  function handleExcel() {
    exportToExcel("hr_employees", [
      {
        name: "Employees",
        rows: filtered.map((e) => ({
          "Emp ID": e.empId,
          Name: e.name,
          Dept: e.department,
          Designation: e.designation,
          "Join Date": e.joinDate,
          Type: e.employmentType,
          Status: e.status,
        })),
      },
    ]);
    toast.success("Exported as Excel");
  }
  function handlePDF() {
    exportToPDF(
      "hr_employees",
      "HR Employees",
      ["Emp ID", "Name", "Dept", "Designation", "Join Date", "Type", "Status"],
      filtered.map((e) => [
        e.empId,
        e.name,
        e.department,
        e.designation,
        e.joinDate,
        e.employmentType,
        e.status,
      ]),
    );
    toast.success("Exported as PDF");
  }

  const f = dialog.item;
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
            <p className="text-gray-500 text-sm mt-1">
              All employee records and employment details
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={handleExcel}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handlePDF}
            >
              <FileText className="w-4 h-4 mr-1" /> PDF
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={openAdd}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Employee
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search name or emp ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={dept}
              onValueChange={(v) => {
                setDept(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMP_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Resigned">Resigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {[
                    "Emp ID",
                    "Name",
                    "Dept",
                    "Designation",
                    "Join Date",
                    "Type",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((e, i) => (
                  <tr
                    key={e.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-3 py-2.5 font-mono text-xs text-blue-600">
                      {e.empId}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-700 whitespace-nowrap">
                      {e.name}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs">
                      {e.department}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs">
                      {e.designation}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{e.joinDate}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className="text-xs">
                        {e.employmentType}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[e.status] ?? ""}`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-blue-500"
                          onClick={() => openEdit(e)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400"
                          onClick={() => handleDelete(e.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">{filtered.length} employees</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="px-3 py-1.5 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      <Dialog
        open={dialog.open}
        onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialog.mode === "add" ? "Add" : "Edit"} Employee
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {[
              { label: "Emp ID *", field: "empId" },
              { label: "Full Name *", field: "name" },
              { label: "Designation", field: "designation" },
              { label: "Join Date", field: "joinDate" },
            ].map(({ label, field }) => (
              <div key={field}>
                <Label className="text-xs">{label}</Label>
                <Input
                  className="mt-1"
                  type={field === "joinDate" ? "date" : "text"}
                  value={String((f as Record<string, unknown>)[field] ?? "")}
                  onChange={(e) =>
                    setDialog((d) => ({
                      ...d,
                      item: { ...d.item, [field]: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
            <div>
              <Label className="text-xs">Department</Label>
              <Select
                value={f.department ?? "Mathematics"}
                onValueChange={(v) =>
                  setDialog((d) => ({
                    ...d,
                    item: { ...d.item, department: v },
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Mathematics",
                    "Science",
                    "English",
                    "Hindi",
                    "Computer",
                    "Arts",
                    "Administration",
                    "Accounts",
                  ].map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Employment Type</Label>
              <Select
                value={f.employmentType ?? "Permanent"}
                onValueChange={(v) =>
                  setDialog((d) => ({
                    ...d,
                    item: { ...d.item, employmentType: v },
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Permanent", "Contract", "Part-time"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select
                value={f.status ?? "Active"}
                onValueChange={(v) =>
                  setDialog((d) => ({ ...d, item: { ...d.item, status: v } }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Active", "On Leave", "Resigned"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialog((d) => ({ ...d, open: false }))}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
