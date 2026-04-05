import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { JOURNAL_ENTRIES } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const VOUCHER_TYPES = ["Payment", "Receipt", "Contra", "Journal"];

export default function AccountsJournalPage() {
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

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [voucherType, setVoucherType] = useState("all");
  const [newDate, setNewDate] = useState("");
  const [newType, setNewType] = useState(VOUCHER_TYPES[0]);
  const [newNarration, setNewNarration] = useState("");
  const [rows, setRows] = useState([
    { id: 1, account: "", debit: "", credit: "" },
  ]);

  const filtered = useMemo(
    () =>
      JOURNAL_ENTRIES.filter((e) => {
        const matchS =
          search === "" ||
          e.voucherNo.toLowerCase().includes(search.toLowerCase()) ||
          e.narration.toLowerCase().includes(search.toLowerCase());
        const matchD = dateFilter === "" || e.date.startsWith(dateFilter);
        const matchV = voucherType === "all" || e.voucherType === voucherType;
        return matchS && matchD && matchV;
      }),
    [search, dateFilter, voucherType],
  );

  function addRow() {
    setRows((r) => [
      ...r,
      {
        id: (r[r.length - 1]?.id ?? 0) + 1,
        account: "",
        debit: "",
        credit: "",
      },
    ]);
  }
  function removeRow(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }
  function updateRow(i: number, field: string, val: string) {
    setRows((r) =>
      r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)),
    );
  }
  function handlePost() {
    if (!newDate || !newNarration) {
      toast.error("Please fill date and narration");
      return;
    }
    toast.success(`Journal entry ${newType} posted successfully`);
    setNewDate("");
    setNewNarration("");
    setRows([{ id: 1, account: "", debit: "", credit: "" }]);
  }

  const statusColor = (s: string) =>
    s === "Posted"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Journal Voucher</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage accounting journal entries
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6"
        >
          <h2 className="font-semibold text-gray-700 mb-4">
            New Journal Entry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Voucher Type</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOUCHER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Label className="text-xs">Narration</Label>
              <Textarea
                value={newNarration}
                onChange={(e) => setNewNarration(e.target.value)}
                rows={1}
                className="mt-1"
                placeholder="Journal narration..."
              />
            </div>
          </div>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Account
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Debit (\u20b9)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Credit (\u20b9)
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-3 py-2 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Input
                        value={row.account}
                        onChange={(e) =>
                          updateRow(i, "account", e.target.value)
                        }
                        placeholder="Account name"
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        value={row.debit}
                        onChange={(e) => updateRow(i, "debit", e.target.value)}
                        placeholder="0"
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        value={row.credit}
                        onChange={(e) => updateRow(i, "credit", e.target.value)}
                        placeholder="0"
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(i)}
                        className="h-7 w-7 text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="w-4 h-4 mr-1" /> Add Row
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handlePost}
            >
              Post Journal Entry
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
            <h2 className="font-semibold text-gray-700">
              Posted Journal Entries
            </h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <Input
                type="month"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-36"
              />
              <Select value={voucherType} onValueChange={setVoucherType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {VOUCHER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Date",
                    "Voucher No",
                    "Type",
                    "Narration",
                    "Total Debit",
                    "Total Credit",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr
                    key={e.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-gray-600">{e.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">
                      {e.voucherNo}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {e.voucherType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {e.narration}
                    </td>
                    <td className="px-4 py-3 text-red-600 font-medium">
                      \u20b9{e.totalDebit.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      \u20b9{e.totalCredit.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(e.status)}`}
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
