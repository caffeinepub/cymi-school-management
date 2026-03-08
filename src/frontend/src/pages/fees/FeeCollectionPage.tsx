import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  Printer,
  TrendingUp,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { FEE_STRUCTURES, FEE_STUDENTS } from "../../data/fees";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

// ─── AnimatedCounter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const duration = 1000;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);
  return <>{display}</>;
}

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

type PaymentMethod = "Cash" | "Online" | "Cheque" | "DD";
type Period =
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December"
  | "January"
  | "February"
  | "March"
  | "Annual"
  | "Half-Yearly"
  | "Quarterly";

const PERIODS: Period[] = [
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
  "Annual",
  "Half-Yearly",
  "Quarterly",
];

const FEE_STRUCTURE_OPTIONS = [
  { id: 1, label: "Fees Structure 2020-21 (2020 - 21)" },
  { id: 2, label: "Fees Structure 2021-22 (2021 - 22)" },
  { id: 3, label: "Fees Structure 2022-23 (2022 - 23)" },
  { id: 4, label: "Fees Structure 2023-24 (2023 - 24)" },
  { id: 5, label: "Fees Structure 2024-25 (2024 - 25)" },
  { id: 6, label: "Fees Structure 2025-26 (2025 - 26)" },
];

const CLASS_OPTIONS = [
  "Nursery",
  "LKG",
  "UKG",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

const CONCESSION_CATEGORIES = [
  "None",
  "Staff Ward",
  "Sibling Discount",
  "Merit Scholarship",
  "Sports Quota",
  "Management Quota",
  "Below Poverty Line",
];

interface FeeTableRow {
  feeHeadId: number;
  particular: string;
  period: Period | "";
  feeAmount: number;
  concession: number;
  expected: number;
  amountPaid: string;
}

interface GeneratedReceipt {
  receiptNo: string;
  date: string;
  studentName: string;
  admissionNo: string;
  grade: string;
  section: string;
  feeStructure: string;
  concessionCategory: string;
  rows: FeeTableRow[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  remarks: string;
}

// ─── Receipt Modal ─────────────────────────────────────────────────────────────
function ReceiptModal({
  receipt,
  onClose,
}: { receipt: GeneratedReceipt; onClose: () => void }) {
  function handlePrint() {
    const win = window.open("", "_blank_receipt");
    if (!win) return;
    const rows = receipt.rows
      .filter((r) => Number(r.amountPaid) > 0)
      .map(
        (r) =>
          `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${r.particular}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${r.period}</td>
          <td style="padding:6px 8px;text-align:right;border-bottom:1px solid #e5e7eb;">₹${r.feeAmount.toLocaleString("en-IN")}</td>
          <td style="padding:6px 8px;text-align:right;border-bottom:1px solid #e5e7eb;">${r.concession > 0 ? `₹${r.concession.toLocaleString("en-IN")}` : "0"}</td>
          <td style="padding:6px 8px;text-align:right;border-bottom:1px solid #e5e7eb;">₹${r.expected.toLocaleString("en-IN")}</td>
          <td style="padding:6px 8px;text-align:right;border-bottom:1px solid #e5e7eb;">₹${Number(r.amountPaid).toLocaleString("en-IN")}</td>
        </tr>`,
      )
      .join("");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Receipt ${receipt.receiptNo}</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;max-width:720px;margin:0 auto;}
    h2{color:#1e40af;margin:0;}h4{margin:4px 0;color:#374151;}
    table{width:100%;border-collapse:collapse;margin-top:16px;}
    th{background:#1e40af;color:#fff;padding:8px;text-align:left;font-size:12px;}
    td{font-size:12px;}.total{font-weight:bold;background:#f0f9ff;}
    @media print{@page{margin:14mm;}}</style></head><body>
    <div style="display:flex;align-items:center;gap:12px;border-bottom:2px solid #1e40af;padding-bottom:12px;">
    <img src="/assets/uploads/cymi-1.PNG" width="50" height="50" style="object-fit:contain;"/>
    <div><h2>CYMI Computer Institute</h2><h4>Fee Receipt – ${receipt.feeStructure}</h4></div>
    <div style="margin-left:auto;text-align:right;"><b>${receipt.receiptNo}</b><br/><small>${receipt.date}</small></div></div>
    <div style="margin:16px 0;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;">
    <div><b>Student:</b> ${receipt.studentName}</div>
    <div><b>Class:</b> ${receipt.grade} – ${receipt.section}</div>
    <div><b>Admission No:</b> ${receipt.admissionNo}</div>
    <div><b>Payment Method:</b> ${receipt.paymentMethod}</div>
    ${receipt.concessionCategory !== "None" ? `<div><b>Concession:</b> ${receipt.concessionCategory}</div>` : ""}
    </div>
    <table><thead><tr><th>Particular</th><th>Period</th><th style="text-align:right">Fee Amount</th><th style="text-align:right">Concession</th><th style="text-align:right">Expected</th><th style="text-align:right">Amount Paid</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr class="total"><td colspan="5" style="padding:8px;font-size:13px;">Total Amount Paid</td>
    <td style="padding:8px;text-align:right;font-size:14px;">₹${receipt.totalAmount.toLocaleString("en-IN")}</td></tr></tfoot></table>
    ${receipt.remarks ? `<p style="margin-top:12px;font-size:12px;color:#6b7280;"><b>Remarks:</b> ${receipt.remarks}</p>` : ""}
    <p style="margin-top:24px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px;">
    This is a computer generated receipt. No signature required.</p>
    <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
    </body></html>`);
    win.document.close();
  }

  const paidRows = receipt.rows.filter((r) => Number(r.amountPaid) > 0);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent data-ocid="fee-collection.dialog" className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" /> Receipt Generated
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/uploads/cymi-1.PNG"
                  alt="CYMI"
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <p className="font-bold text-blue-900 text-sm">
                    CYMI Computer Institute
                  </p>
                  <p className="text-xs text-blue-700">
                    {receipt.feeStructure}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs font-bold text-blue-900">
                  {receipt.receiptNo}
                </p>
                <p className="text-xs text-blue-700">{receipt.date}</p>
              </div>
            </div>
            <Separator className="bg-blue-200" />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Student:</span>{" "}
                <span className="font-medium">{receipt.studentName}</span>
              </div>
              <div>
                <span className="text-gray-500">Class:</span>{" "}
                <span className="font-medium">{receipt.grade}</span>
              </div>
              <div>
                <span className="text-gray-500">Adm No:</span>{" "}
                <span className="font-medium font-mono text-xs">
                  {receipt.admissionNo}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Method:</span>{" "}
                <span className="font-medium">{receipt.paymentMethod}</span>
              </div>
              {receipt.concessionCategory !== "None" && (
                <div className="col-span-2">
                  <span className="text-gray-500">Concession:</span>{" "}
                  <span className="font-medium">
                    {receipt.concessionCategory}
                  </span>
                </div>
              )}
            </div>
            <Separator className="bg-blue-200" />
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-blue-200">
                    <th className="pb-1.5 text-left font-semibold">
                      Particular
                    </th>
                    <th className="pb-1.5 text-left font-semibold">Period</th>
                    <th className="pb-1.5 text-right font-semibold">Fee Amt</th>
                    <th className="pb-1.5 text-right font-semibold">
                      Concession
                    </th>
                    <th className="pb-1.5 text-right font-semibold">
                      Expected
                    </th>
                    <th className="pb-1.5 text-right font-semibold">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {paidRows.map((r) => (
                    <tr
                      key={r.feeHeadId}
                      className="border-b border-blue-100 last:border-0"
                    >
                      <td className="py-1.5 text-gray-700">{r.particular}</td>
                      <td className="py-1.5 text-gray-500">{r.period}</td>
                      <td className="py-1.5 text-right">{fmt(r.feeAmount)}</td>
                      <td className="py-1.5 text-right text-green-600">
                        {r.concession > 0 ? fmt(r.concession) : "0"}
                      </td>
                      <td className="py-1.5 text-right">{fmt(r.expected)}</td>
                      <td className="py-1.5 text-right font-semibold text-blue-800">
                        {fmt(Number(r.amountPaid))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-blue-200">
              <span>Total Paid</span>
              <span className="text-blue-900">{fmt(receipt.totalAmount)}</span>
            </div>
          </div>
          <Button
            data-ocid="fee-collection.primary_button"
            onClick={handlePrint}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </Button>
          <Button
            data-ocid="fee-collection.cancel_button"
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FeeCollectionPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  // Form state
  const [selectedStructure, setSelectedStructure] = useState("1");
  const [selectedClass, setSelectedClass] = useState("Nursery");
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [concessionCategory, setConcessionCategory] = useState("None");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [remarks, setRemarks] = useState("");
  const [collecting, setCollecting] = useState(false);
  const [receipt, setReceipt] = useState<GeneratedReceipt | null>(null);

  // Fee table rows — driven by class selection
  const [feeRows, setFeeRows] = useState<FeeTableRow[]>([]);

  useEffect(() => {
    if (!profileLoading && !profile) navigate({ to: "/login" });
  }, [profile, profileLoading, navigate]);

  async function handleLogout() {
    await logoutMutation.mutateAsync("token");
    navigate({ to: "/login" });
  }

  // Students filtered by class
  const classGradeMap: Record<string, number> = {
    Nursery: 0,
    LKG: 0,
    UKG: 0,
    "Grade 1": 1,
    "Grade 2": 2,
    "Grade 3": 3,
    "Grade 4": 4,
    "Grade 5": 5,
    "Grade 6": 6,
    "Grade 7": 7,
    "Grade 8": 8,
    "Grade 9": 9,
    "Grade 10": 10,
    "Grade 11": 11,
    "Grade 12": 12,
  };

  const studentsForClass = useMemo(() => {
    const grade = classGradeMap[selectedClass] ?? 1;
    return FEE_STUDENTS.filter((s) => s.grade === grade).slice(0, 30);
  }, [selectedClass]);

  // When class changes, reset student selection and rebuild fee rows
  useEffect(() => {
    setSelectedAdmissionNo("");
    setSelectedStudentName("");
    const grade = classGradeMap[selectedClass] ?? 1;
    const applicable = FEE_STRUCTURES.filter(
      (f) => f.status === "Active" && f.applicableGrades.includes(grade),
    );
    const concDiscount = concessionCategory !== "None" ? 500 : 0;
    setFeeRows(
      applicable.map((f) => ({
        feeHeadId: f.id,
        particular: f.feeHead,
        period: "" as Period | "",
        feeAmount: f.amount,
        concession: concDiscount,
        expected: Math.max(f.amount - concDiscount, 0),
        amountPaid: "",
      })),
    );
  }, [selectedClass, concessionCategory]);

  // When admission no changes, auto-fill student name
  function handleAdmissionNoChange(admNo: string) {
    setSelectedAdmissionNo(admNo);
    const found = FEE_STUDENTS.find((s) => s.admissionNo === admNo);
    setSelectedStudentName(found ? found.name : "");
  }

  function handleStudentNameChange(name: string) {
    setSelectedStudentName(name);
    const found = FEE_STUDENTS.find((s) => s.name === name);
    setSelectedAdmissionNo(found ? found.admissionNo : "");
  }

  function updateRow(
    idx: number,
    field: keyof FeeTableRow,
    value: string | number,
  ) {
    setFeeRows((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        const updated = { ...r, [field]: value };
        if (field === "concession") {
          updated.concession = Number(value);
          updated.expected = Math.max(r.feeAmount - Number(value), 0);
        }
        return updated;
      }),
    );
  }

  const total = useMemo(
    () => feeRows.reduce((sum, r) => sum + (Number(r.amountPaid) || 0), 0),
    [feeRows],
  );

  async function handleCollect() {
    if (!selectedStudentName || !selectedAdmissionNo) {
      toast.error("Please select a student");
      return;
    }
    const paidRows = feeRows.filter((r) => Number(r.amountPaid) > 0);
    if (paidRows.length === 0) {
      toast.error("Please enter at least one Amount Paid");
      return;
    }
    setCollecting(true);
    await new Promise((r) => setTimeout(r, 600));
    const rcpNo = `RCP-2025-${String(Date.now()).slice(-4)}`;
    const structureLabel =
      FEE_STRUCTURE_OPTIONS.find((s) => s.id === Number(selectedStructure))
        ?.label ?? "";
    setReceipt({
      receiptNo: rcpNo,
      date: paymentDate,
      studentName: selectedStudentName,
      admissionNo: selectedAdmissionNo,
      grade: selectedClass,
      section: "",
      feeStructure: structureLabel,
      concessionCategory,
      rows: feeRows,
      totalAmount: total,
      paymentMethod,
      remarks,
    });
    toast.success(`Receipt ${rcpNo} generated`);
    setCollecting(false);
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div
          data-ocid="fee-collection.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
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
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" /> Fee Collection
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Collect fees and generate receipts
          </p>
        </motion.div>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Today's Collection",
                numTarget: 45200,
                prefix: "₹",
                icon: <CreditCard className="w-5 h-5" />,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
              },
              {
                label: "This Month",
                numTarget: 342000,
                prefix: "₹",
                icon: <TrendingUp className="w-5 h-5" />,
                color: "text-green-600",
                bg: "bg-green-50",
                border: "border-green-100",
              },
              {
                label: "Pending Students",
                numTarget: 87,
                prefix: "",
                icon: <Users className="w-5 h-5" />,
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-100",
              },
              {
                label: "Overdue",
                numTarget: 23,
                prefix: "",
                icon: <AlertCircle className="w-5 h-5" />,
                color: "text-red-600",
                bg: "bg-red-50",
                border: "border-red-100",
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.05 }}
                className={`bg-white rounded-xl border ${s.border} p-4 flex items-center gap-4 shadow-sm`}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}
                >
                  <span className={s.color}>{s.icon}</span>
                </div>
                <div>
                  <p className={`text-xl font-bold ${s.color}`}>
                    {s.prefix}
                    <AnimatedCounter target={s.numTarget} />
                  </p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Monthly target progress */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-semibold text-gray-700">
                  Monthly Collection Target
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  Target: ₹5,00,000 | Collected: ₹3,42,000
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-700">68.4%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-emerald-500 h-3 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "68.4%" }}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">₹0</span>
              <span className="text-xs text-gray-500 font-medium">
                ₹3,42,000 collected of ₹5,00,000 target
              </span>
              <span className="text-xs text-gray-400">₹5L</span>
            </div>
          </motion.div>

          {/* ── Collect Fee Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm"
          >
            {/* Form title */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">
                Collect Fee –{" "}
                {FEE_STRUCTURE_OPTIONS.find(
                  (s) => s.id === Number(selectedStructure),
                )?.label ?? ""}
              </h2>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Row 1: Fee Structure + Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fee-structure"
                    className="text-sm font-medium text-gray-700"
                  >
                    Fee Structure
                  </Label>
                  <Select
                    value={selectedStructure}
                    onValueChange={setSelectedStructure}
                  >
                    <SelectTrigger
                      id="fee-structure"
                      data-ocid="fee-collection.fee_structure.select"
                      className="bg-white border-gray-300"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEE_STRUCTURE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={String(opt.id)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="class-select"
                    className="text-sm font-medium text-gray-700"
                  >
                    Class
                  </Label>
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger
                      id="class-select"
                      data-ocid="fee-collection.class.select"
                      className="bg-white border-gray-300"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Admission No + Student Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="admission-no"
                    className="text-sm font-medium text-gray-700"
                  >
                    Admission No.
                  </Label>
                  <Select
                    value={selectedAdmissionNo}
                    onValueChange={handleAdmissionNoChange}
                  >
                    <SelectTrigger
                      id="admission-no"
                      data-ocid="fee-collection.admission_no.select"
                      className="bg-white border-gray-300"
                    >
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {studentsForClass.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No students in this class
                        </SelectItem>
                      ) : (
                        studentsForClass.map((s) => (
                          <SelectItem key={s.admissionNo} value={s.admissionNo}>
                            {s.admissionNo}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="student-name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Student Name
                  </Label>
                  <Select
                    value={selectedStudentName}
                    onValueChange={handleStudentNameChange}
                  >
                    <SelectTrigger
                      id="student-name"
                      data-ocid="fee-collection.student_name.select"
                      className="bg-white border-gray-300"
                    >
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                    <SelectContent>
                      {studentsForClass.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No students in this class
                        </SelectItem>
                      ) : (
                        studentsForClass.map((s) => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Concession Category */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="concession-cat"
                  className="text-sm font-medium text-gray-700"
                >
                  Concession Category
                </Label>
                <Select
                  value={concessionCategory}
                  onValueChange={setConcessionCategory}
                >
                  <SelectTrigger
                    id="concession-cat"
                    data-ocid="fee-collection.concession.select"
                    className="bg-white border-gray-300 max-w-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONCESSION_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Student badge */}
              <AnimatePresence>
                {selectedStudentName && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {selectedStudentName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-blue-900 text-sm">
                        {selectedStudentName}
                      </p>
                      <p className="text-xs text-blue-600">
                        {selectedAdmissionNo} · {selectedClass}
                      </p>
                    </div>
                    {concessionCategory !== "None" && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                        {concessionCategory}
                      </Badge>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Fee Table ── */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 w-40">
                        Particular
                      </th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-700 w-36">
                        Period
                      </th>
                      <th className="text-right px-3 py-3 font-semibold text-gray-700 w-24">
                        Fee Amount
                      </th>
                      <th className="text-right px-3 py-3 font-semibold text-gray-700 w-24">
                        Concession
                      </th>
                      <th className="text-right px-3 py-3 font-semibold text-gray-700 w-24">
                        Expected
                      </th>
                      <th className="text-right px-3 py-3 font-semibold text-gray-700 w-28">
                        Amount Paid
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-8 text-gray-400 text-sm"
                        >
                          No fee heads found for this class
                        </td>
                      </tr>
                    ) : (
                      feeRows.map((row, idx) => (
                        <tr
                          key={row.feeHeadId}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="px-4 py-2.5 text-gray-800 font-medium text-sm">
                            {row.particular}
                          </td>
                          <td className="px-3 py-2">
                            <Select
                              value={row.period}
                              onValueChange={(v) => updateRow(idx, "period", v)}
                            >
                              <SelectTrigger
                                data-ocid={`fee-collection.period.select.${idx + 1}`}
                                className="h-8 text-xs border-gray-300 bg-white w-32"
                              >
                                <SelectValue placeholder="-- Select F" />
                              </SelectTrigger>
                              <SelectContent>
                                {PERIODS.map((p) => (
                                  <SelectItem key={p} value={p}>
                                    {p}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-700">
                            {row.feeAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-600">
                            {row.concession}
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-600">
                            {row.expected}
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              data-ocid={`fee-collection.amount_paid.input.${idx + 1}`}
                              type="number"
                              min={0}
                              max={row.expected}
                              value={row.amountPaid}
                              onChange={(e) =>
                                updateRow(idx, "amountPaid", e.target.value)
                              }
                              placeholder=""
                              className="h-8 text-xs text-right w-24 border-gray-300 bg-white"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {feeRows.length > 0 && (
                    <tfoot>
                      <tr className="bg-blue-50 border-t border-blue-100">
                        <td
                          colSpan={5}
                          className="px-4 py-3 font-bold text-gray-800 text-sm"
                        >
                          Total Amount Payable
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-blue-700 text-sm">
                          {fmt(total)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Payment details + submit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Payment Method
                  </Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  >
                    <SelectTrigger
                      data-ocid="fee-collection.payment_method.select"
                      className="bg-white border-gray-300"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["Cash", "Online", "Cheque", "DD"] as const).map(
                        (m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Payment Date
                  </Label>
                  <Input
                    data-ocid="fee-collection.payment_date.input"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Remarks (optional)
                  </Label>
                  <Input
                    data-ocid="fee-collection.remarks.input"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any notes..."
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  data-ocid="fee-collection.submit_button"
                  onClick={handleCollect}
                  disabled={collecting || total === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 min-w-48"
                  size="lg"
                >
                  {collecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" /> Collect &amp; Generate
                      Receipt
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {receipt && (
        <ReceiptModal
          receipt={receipt}
          onClose={() => {
            setReceipt(null);
          }}
        />
      )}
    </div>
  );
}
