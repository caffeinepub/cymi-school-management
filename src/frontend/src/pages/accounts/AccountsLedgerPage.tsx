import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { LEDGER_ENTRIES } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const PAGE_SIZE = 15;
const fmt = (n: number) =>
  n === 0 ? "" : `\u20b9${n.toLocaleString("en-IN")}`;
const ACCOUNT_TYPES = [
  "All",
  "School Fees A/C",
  "Salary Expense",
  "Transport Income",
  "Stationary Expense",
  "Library Fund",
  "Sports Fund",
  "Maintenance Expense",
  "Canteen Income",
  "Utilities Expense",
  "Miscellaneous Income",
];

export default function AccountsLedgerPage() {
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
  const [acType, setAcType] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      LEDGER_ENTRIES.filter((e) => {
        const matchSearch =
          search === "" ||
          e.accountName.toLowerCase().includes(search.toLowerCase()) ||
          e.reference.toLowerCase().includes(search.toLowerCase());
        const matchType = acType === "All" || e.accountName === acType;
        return matchSearch && matchType;
      }),
    [search, acType],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleExcelExport() {
    exportToExcel("accounts_ledger", [
      {
        name: "Ledger",
        rows: filtered.map((e) => ({
          Date: e.date,
          Reference: e.reference,
          Account: e.accountName,
          Description: e.description,
          Debit: e.debit,
          Credit: e.credit,
          Balance: e.balance,
        })),
      },
    ]);
    toast.success("Ledger exported as Excel");
  }
  function handlePDFExport() {
    exportToPDF(
      "accounts_ledger",
      "Accounts Ledger",
      [
        "Date",
        "Reference",
        "Account",
        "Description",
        "Debit",
        "Credit",
        "Balance",
      ],
      filtered.map((e) => [
        e.date,
        e.reference,
        e.accountName,
        e.description,
        e.debit ? `\u20b9${e.debit.toLocaleString()}` : "-",
        e.credit ? `\u20b9${e.credit.toLocaleString()}` : "-",
        `\u20b9${e.balance.toLocaleString()}`,
      ]),
    );
    toast.success("Ledger exported as PDF");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Accounts Ledger
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Detailed account-wise transaction ledger
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={handleExcelExport}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" /> Export Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handlePDFExport}
            >
              <FileText className="w-4 h-4 mr-1" /> Export PDF
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
                placeholder="Search account or reference..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={acType}
              onValueChange={(v) => {
                setAcType(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {[
                    "#",
                    "Date",
                    "Reference",
                    "Account Name",
                    "Description",
                    "Debit",
                    "Credit",
                    "Balance",
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
                {paginated.map((e, i) => (
                  <tr
                    key={e.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-gray-400 text-xs">{e.id}</td>
                    <td className="px-4 py-3 text-gray-600">{e.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">
                      {e.reference}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {e.accountName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {e.description}
                    </td>
                    <td className="px-4 py-3 text-red-600 font-medium">
                      {fmt(e.debit)}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      {fmt(e.credit)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{`\u20b9${e.balance.toLocaleString("en-IN")}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">{filtered.length} entries</p>
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
    </div>
  );
}
