import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { Eye, Printer, Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { STAFF_SALARY_DATA } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;
const MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];
const YEARS = ["2024-25", "2025-26"];

export default function PayslipsPage() {
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
  const [month, setMonth] = useState("April");
  const [year, setYear] = useState("2025-26");
  const [selected, setSelected] = useState<
    (typeof STAFF_SALARY_DATA)[0] | null
  >(null);

  const filtered = useMemo(
    () =>
      STAFF_SALARY_DATA.filter(
        (e) =>
          search === "" ||
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.empId.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  function printPayslip() {
    toast.success("Opening payslip for printing...");
    const s = selected!;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Payslip - ${s.name}</title>
    <style>body{font-family:Arial,sans-serif;padding:20px;} table{width:100%;border-collapse:collapse;} td,th{padding:6px 10px;border:1px solid #ddd;font-size:12px;} .header{text-align:center;margin-bottom:20px;} h2{margin:0;} p{margin:4px 0;color:#666;font-size:12px;}</style></head>
    <body>
    <div class="header"><h2>CYMI Computer Institute</h2><p>Payslip for ${month} ${year}</p></div>
    <table><tr><td><b>Name:</b> ${s.name}</td><td><b>Emp ID:</b> ${s.empId}</td></tr>
    <tr><td><b>Designation:</b> ${s.designation}</td><td><b>Department:</b> ${s.department}</td></tr>
    <tr><td><b>Bank A/C:</b> ${s.bankAccount}</td><td></td></tr></table><br/>
    <table><thead><tr><th>Earnings</th><th>Amount</th><th>Deductions</th><th>Amount</th></tr></thead>
    <tbody>
    <tr><td>Basic Salary</td><td>${fmt(s.basic)}</td><td>Provident Fund</td><td>${fmt(s.pfDeduction)}</td></tr>
    <tr><td>HRA</td><td>${fmt(s.hra)}</td><td>TDS</td><td>${fmt(s.tds)}</td></tr>
    <tr><td>DA</td><td>${fmt(s.da)}</td><td></td><td></td></tr>
    <tr><td>Other Allowances</td><td>${fmt(s.otherAllowances)}</td><td></td><td></td></tr>
    <tr><td><b>Total Earnings</b></td><td><b>${fmt(s.basic + s.hra + s.da + s.otherAllowances)}</b></td><td><b>Total Deductions</b></td><td><b>${fmt(s.pfDeduction + s.tds)}</b></td></tr>
    </tbody></table><br/>
    <table><tr><td><b>Net Pay: ${fmt(s.netPay)}</b></td></tr></table>
    <script>window.onload=function(){window.print();};<\/script></body></html>`;
    const w = window.open("", "_blank_payslip");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Payslips</h1>
            <p className="text-gray-500 text-sm mt-1">
              View and print employee payslips
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Emp ID",
                    "Name",
                    "Designation",
                    "Dept",
                    "Net Pay",
                    "Actions",
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
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">
                      {e.empId}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {e.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {e.designation}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {e.department}
                    </td>
                    <td className="px-4 py-3 font-bold text-green-700">
                      {fmt(e.netPay)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-blue-500"
                          onClick={() => setSelected(e)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payslip — {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="text-sm">
              <div className="text-center mb-4 border-b pb-3">
                <p className="font-bold text-gray-800">
                  CYMI Computer Institute
                </p>
                <p className="text-gray-500 text-xs">
                  Payslip for {month} {year}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div>
                  <span className="text-gray-500">Name:</span>{" "}
                  <span className="font-medium">{selected.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Emp ID:</span>{" "}
                  <span className="font-medium">{selected.empId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Designation:</span>{" "}
                  <span className="font-medium">{selected.designation}</span>
                </div>
                <div>
                  <span className="text-gray-500">Department:</span>{" "}
                  <span className="font-medium">{selected.department}</span>
                </div>
                <div>
                  <span className="text-gray-500">Bank A/C:</span>{" "}
                  <span className="font-medium">{selected.bankAccount}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-700 mb-2 text-xs uppercase">
                    Earnings
                  </p>
                  {[
                    ["Basic Salary", selected.basic],
                    ["HRA", selected.hra],
                    ["DA", selected.da],
                    ["Other Allowances", selected.otherAllowances],
                  ].map(([k, v]) => (
                    <div
                      key={String(k)}
                      className="flex justify-between py-1 border-b border-gray-50 text-xs"
                    >
                      <span className="text-gray-600">{k}</span>
                      <span className="font-medium">{fmt(Number(v))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1 font-bold text-xs">
                    <span>Total</span>
                    <span className="text-green-700">
                      {fmt(
                        selected.basic +
                          selected.hra +
                          selected.da +
                          selected.otherAllowances,
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-2 text-xs uppercase">
                    Deductions
                  </p>
                  {[
                    ["Provident Fund", selected.pfDeduction],
                    ["TDS", selected.tds],
                  ].map(([k, v]) => (
                    <div
                      key={String(k)}
                      className="flex justify-between py-1 border-b border-gray-50 text-xs"
                    >
                      <span className="text-gray-600">{k}</span>
                      <span className="font-medium text-red-600">
                        {fmt(Number(v))}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1 font-bold text-xs">
                    <span>Total</span>
                    <span className="text-red-600">
                      {fmt(selected.pfDeduction + selected.tds)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                <span className="font-bold text-blue-800">Net Pay</span>
                <span className="font-bold text-blue-700 text-xl">
                  {fmt(selected.netPay)}
                </span>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected(null)}
            >
              Close
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={printPayslip}
            >
              <Printer className="w-4 h-4 mr-1" /> Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
