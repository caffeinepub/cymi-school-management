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
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import {
  RECURRING_TEMPLATES,
  type RecurringTemplate,
} from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;

export default function BillingRecurringPage() {
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

  const [templates, setTemplates] =
    useState<RecurringTemplate[]>(RECURRING_TEMPLATES);
  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "add" | "edit";
    item: Partial<RecurringTemplate>;
  }>({ open: false, mode: "add", item: {} });

  function toggleStatus(id: number) {
    setTemplates((t) =>
      t.map((tt) =>
        tt.id === id
          ? { ...tt, status: tt.status === "Active" ? "Paused" : "Active" }
          : tt,
      ),
    );
    toast.success("Template status updated");
  }
  function handleDelete(id: number) {
    setTemplates((t) => t.filter((tt) => tt.id !== id));
    toast.success("Template deleted");
  }
  function openEdit(item: RecurringTemplate) {
    setDialog({ open: true, mode: "edit", item: { ...item } });
  }
  function openAdd() {
    setDialog({
      open: true,
      mode: "add",
      item: { frequency: "Monthly", status: "Active" },
    });
  }
  function handleSave() {
    const item = dialog.item;
    if (!item.name || !item.amount) {
      toast.error("Name and amount are required");
      return;
    }
    if (dialog.mode === "add") {
      const newId = Math.max(...templates.map((t) => t.id)) + 1;
      setTemplates((t) => [
        ...t,
        {
          id: newId,
          name: item.name!,
          frequency: item.frequency ?? "Monthly",
          amount: Number(item.amount),
          nextRun: item.nextRun ?? "",
          status: item.status ?? "Active",
        },
      ]);
      toast.success("Template added");
    } else {
      setTemplates((t) =>
        t.map((tt) =>
          tt.id === item.id ? ({ ...tt, ...item } as RecurringTemplate) : tt,
        ),
      );
      toast.success("Template updated");
    }
    setDialog((d) => ({ ...d, open: false }));
  }

  const f = dialog.item;
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Recurring Billing
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage recurring billing templates and schedules
            </p>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={openAdd}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`bg-white rounded-xl border ${t.status === "Active" ? "border-green-200" : "border-gray-100"} p-5 shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {t.name}
                </h3>
                <Switch
                  checked={t.status === "Active"}
                  onCheckedChange={() => toggleStatus(t.id)}
                />
              </div>
              <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Frequency:</span>
                  <span className="font-medium">{t.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="font-bold text-gray-800">
                    {fmt(t.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Next Run:</span>
                  <span>{t.nextRun}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <Badge
                    className={`text-xs ${t.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                    variant="secondary"
                  >
                    {t.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 border-t border-gray-100 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-7 text-xs text-blue-500"
                  onClick={() => openEdit(t)}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-7 text-xs text-red-400"
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Dialog
        open={dialog.open}
        onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.mode === "add" ? "Add" : "Edit"} Recurring Template
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2">
              <Label className="text-xs">Template Name *</Label>
              <Input
                className="mt-1"
                value={f.name ?? ""}
                onChange={(e) =>
                  setDialog((d) => ({
                    ...d,
                    item: { ...d.item, name: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <Label className="text-xs">Frequency</Label>
              <Select
                value={f.frequency ?? "Monthly"}
                onValueChange={(v) =>
                  setDialog((d) => ({
                    ...d,
                    item: { ...d.item, frequency: v },
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Monthly", "Quarterly", "Annually"].map((fr) => (
                    <SelectItem key={fr} value={fr}>
                      {fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Amount (\u20b9) *</Label>
              <Input
                type="number"
                className="mt-1"
                value={f.amount ?? ""}
                onChange={(e) =>
                  setDialog((d) => ({
                    ...d,
                    item: { ...d.item, amount: Number(e.target.value) },
                  }))
                }
              />
            </div>
            <div>
              <Label className="text-xs">Next Run Date</Label>
              <Input
                type="date"
                className="mt-1"
                value={f.nextRun ?? ""}
                onChange={(e) =>
                  setDialog((d) => ({
                    ...d,
                    item: { ...d.item, nextRun: e.target.value },
                  }))
                }
              />
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
