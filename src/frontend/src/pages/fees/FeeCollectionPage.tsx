import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  Printer,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

// ─── AnimatedCounter (local) ──────────────────────────────────────────────────

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
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return <>{display}</>;
}
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { FEE_STRUCTURES, FEE_STUDENTS } from "../../data/fees";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

type PaymentMethod = "Cash" | "Online" | "Cheque" | "DD";

interface FeeLineItem {
  feeHeadId: number;
  feeHead: string;
  amount: number;
  discount: number;
  selected: boolean;
}

interface GeneratedReceipt {
  receiptNo: string;
  date: string;
  studentName: string;
  admissionNo: string;
  grade: number;
  section: string;
  feeHeads: { name: string; amount: number; discount: number }[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  remarks: string;
}

// ─── Receipt Print Modal ───────────────────────────────────────────────────────
function ReceiptModal({
  receipt,
  onClose,
}: { receipt: GeneratedReceipt; onClose: () => void }) {
  function handlePrint() {
    const win = window.open("", "_blank_receipt");
    if (!win) return;
    const rows = receipt.feeHeads
      .map(
        (f) =>
          `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${f.name}</td>
       <td style="padding:6px 8px;text-align:right;border-bottom:1px solid #e5e7eb;">₹${f.amount.toLocaleString("en-IN")}</td>
       <td style="padding:6px 8px;text-align:right;border-bottom:1px solid #e5e7eb;">${f.discount > 0 ? `₹${f.discount.toLocaleString("en-IN")}` : "—"}</td>
       <td style="padding:6px 8px;text-align:right;border-bottom:1px solid #e5e7eb;">₹${(f.amount - f.discount).toLocaleString("en-IN")}</td></tr>`,
      )
      .join("");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Receipt ${receipt.receiptNo}</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;max-width:600px;margin:0 auto;}
    h2{color:#1e40af;margin:0;}h4{margin:4px 0;color:#374151;}
    table{width:100%;border-collapse:collapse;margin-top:16px;}
    th{background:#1e40af;color:#fff;padding:8px;text-align:left;font-size:12px;}
    td{font-size:12px;} .total{font-weight:bold;background:#f0f9ff;}
    @media print{@page{margin:14mm;}}</style></head><body>
    <div style="display:flex;align-items:center;gap:12px;border-bottom:2px solid #1e40af;padding-bottom:12px;">
    <img src="/assets/uploads/cymi-1.PNG" width="50" height="50" style="object-fit:contain;"/>
    <div><h2>CYMI Computer Institute</h2><h4>Fee Receipt</h4></div>
    <div style="margin-left:auto;text-align:right;"><b>${receipt.receiptNo}</b><br/><small>${receipt.date}</small></div></div>
    <div style="margin:16px 0;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;">
    <div><b>Student:</b> ${receipt.studentName}</div>
    <div><b>Class:</b> ${receipt.grade}-${receipt.section}</div>
    <div><b>Admission No:</b> ${receipt.admissionNo}</div>
    <div><b>Payment Method:</b> ${receipt.paymentMethod}</div></div>
    <table><thead><tr><th>Fee Head</th><th style="text-align:right">Amount</th><th style="text-align:right">Discount</th><th style="text-align:right">Net</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr class="total"><td colspan="3" style="padding:8px;font-size:13px;">Total Amount</td>
    <td style="padding:8px;text-align:right;font-size:14px;">₹${receipt.totalAmount.toLocaleString("en-IN")}</td></tr></tfoot></table>
    ${receipt.remarks ? `<p style="margin-top:12px;font-size:12px;color:#6b7280;"><b>Remarks:</b> ${receipt.remarks}</p>` : ""}
    <p style="margin-top:24px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px;">
    This is a computer generated receipt. No signature required.</p>
    <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
    </body></html>`);
    win.document.close();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent data-ocid="fee-collection.dialog" className="max-w-lg">
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
                  <p className="text-xs text-blue-700">Fee Receipt</p>
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
                <span className="font-medium">
                  {receipt.grade}-{receipt.section}
                </span>
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
            </div>
            <Separator className="bg-blue-200" />
            <div className="space-y-1.5">
              {receipt.feeHeads.map((f) => (
                <div key={f.name} className="flex justify-between text-sm">
                  <span className="text-gray-700">{f.name}</span>
                  <div className="text-right">
                    {f.discount > 0 && (
                      <span className="text-xs text-green-600 mr-2">
                        -{fmt(f.discount)}
                      </span>
                    )}
                    <span className="font-medium">
                      {fmt(f.amount - f.discount)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-blue-200">
                <span>Total Paid</span>
                <span className="text-blue-900">
                  {fmt(receipt.totalAmount)}
                </span>
              </div>
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

  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<
    (typeof FEE_STUDENTS)[0] | null
  >(null);
  const [lineItems, setLineItems] = useState<FeeLineItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [remarks, setRemarks] = useState("");
  const [collecting, setCollecting] = useState(false);
  const [receipt, setReceipt] = useState<GeneratedReceipt | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profileLoading && !profile) navigate({ to: "/login" });
  }, [profile, profileLoading, navigate]);

  async function handleLogout() {
    await logoutMutation.mutateAsync("token");
    navigate({ to: "/login" });
  }

  const searchResults = useMemo(() => {
    if (!search.trim() || search.length < 2) return [];
    const q = search.toLowerCase();
    return FEE_STUDENTS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [search]);

  function selectStudent(s: (typeof FEE_STUDENTS)[0]) {
    setSelectedStudent(s);
    setSearch(s.name);
    setShowDropdown(false);
    // Build line items from active fee structures for this student's grade
    const applicableFees = FEE_STRUCTURES.filter(
      (f) => f.status === "Active" && f.applicableGrades.includes(s.grade),
    );
    setLineItems(
      applicableFees.map((f) => ({
        feeHeadId: f.id,
        feeHead: f.feeHead,
        amount: f.amount,
        discount: 0,
        selected: true,
      })),
    );
  }

  function clearStudent() {
    setSelectedStudent(null);
    setSearch("");
    setLineItems([]);
    setRemarks("");
  }

  const total = useMemo(
    () =>
      lineItems
        .filter((l) => l.selected)
        .reduce((s, l) => s + l.amount - l.discount, 0),
    [lineItems],
  );

  async function handleCollect() {
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }
    const selected = lineItems.filter((l) => l.selected);
    if (selected.length === 0) {
      toast.error("Please select at least one fee head");
      return;
    }
    setCollecting(true);
    await new Promise((r) => setTimeout(r, 600));
    const rcpNo = `RCP-2025-${String(Date.now()).slice(-4)}`;
    setReceipt({
      receiptNo: rcpNo,
      date: paymentDate,
      studentName: selectedStudent.name,
      admissionNo: selectedStudent.admissionNo,
      grade: selectedStudent.grade,
      section: selectedStudent.section,
      feeHeads: selected.map((l) => ({
        name: l.feeHead,
        amount: l.amount,
        discount: l.discount,
      })),
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
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" /> Fee Collection
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Collect fees and generate receipts
            </p>
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* Stats */}
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

          {/* Monthly Collection Target Progress */}
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

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left: Student Search + Collection Form */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5"
            >
              <h2 className="font-semibold text-gray-800">Select Student</h2>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  ref={searchRef}
                  data-ocid="fee-collection.search_input"
                  placeholder="Search by name or admission number..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowDropdown(true);
                    if (!e.target.value) clearStudent();
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="pl-9"
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearStudent}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <AnimatePresence>
                  {showDropdown && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                    >
                      {searchResults.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => selectStudent(s)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                            {s.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {s.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {s.admissionNo} · Class {s.grade}-{s.section}
                            </p>
                          </div>
                          {s.outstandingBalance > 0 && (
                            <span className="ml-auto text-xs font-bold text-red-600">
                              Due: {fmt(s.outstandingBalance)}
                            </span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected Student Card */}
              <AnimatePresence>
                {selectedStudent && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-blue-50 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {selectedStudent.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-blue-900">
                        {selectedStudent.name}
                      </p>
                      <p className="text-sm text-blue-700">
                        {selectedStudent.admissionNo} · Class{" "}
                        {selectedStudent.grade}-{selectedStudent.section}
                      </p>
                    </div>
                    {selectedStudent.outstandingBalance > 0 ? (
                      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                        Due: {fmt(selectedStudent.outstandingBalance)}
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                        No Dues
                      </Badge>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fee Heads */}
              {lineItems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-gray-700">
                    Fee Heads
                  </h3>
                  <div className="space-y-2">
                    {lineItems.map((item, i) => (
                      <div
                        key={item.feeHeadId}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${item.selected ? "border-blue-200 bg-blue-50/50" : "border-gray-100 bg-gray-50"}`}
                      >
                        <Checkbox
                          data-ocid={`fee-collection.checkbox.${i + 1}`}
                          checked={item.selected}
                          onCheckedChange={(v) =>
                            setLineItems((prev) =>
                              prev.map((l, idx) =>
                                idx === i ? { ...l, selected: !!v } : l,
                              ),
                            )
                          }
                        />
                        <span className="flex-1 text-sm font-medium text-gray-700">
                          {item.feeHead}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            ₹
                          </span>
                          <Input
                            data-ocid={`fee-collection.input.${i + 1}`}
                            type="number"
                            min={0}
                            value={item.discount}
                            onChange={(e) =>
                              setLineItems((prev) =>
                                prev.map((l, idx) =>
                                  idx === i
                                    ? {
                                        ...l,
                                        discount: Math.min(
                                          Number(e.target.value),
                                          l.amount,
                                        ),
                                      }
                                    : l,
                                ),
                              )
                            }
                            placeholder="Discount"
                            className="w-24 h-8 text-xs text-right"
                            disabled={!item.selected}
                          />
                          <span className="font-bold text-sm text-gray-900 w-20 text-right whitespace-nowrap">
                            {fmt(item.amount - item.discount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 text-right">
                    Enter discount amount per fee head
                  </div>
                </div>
              )}

              {/* Payment Details */}
              {selectedStudent && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Payment Method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(v) =>
                        setPaymentMethod(v as PaymentMethod)
                      }
                    >
                      <SelectTrigger data-ocid="fee-collection.select">
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
                  <div className="space-y-1">
                    <Label>Payment Date</Label>
                    <Input
                      data-ocid="fee-collection.input"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label>Remarks (optional)</Label>
                    <Textarea
                      data-ocid="fee-collection.textarea"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add any notes..."
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right: Summary */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="lg:col-span-2 space-y-4"
            >
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h2 className="font-semibold text-gray-800">Payment Summary</h2>
                {lineItems.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {lineItems
                        .filter((l) => l.selected)
                        .map((l) => (
                          <div
                            key={l.feeHeadId}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600">{l.feeHead}</span>
                            <span className="font-medium">
                              {fmt(l.amount - l.discount)}
                            </span>
                          </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-blue-700">{fmt(total)}</span>
                    </div>
                    <Button
                      data-ocid="fee-collection.submit_button"
                      onClick={handleCollect}
                      disabled={
                        collecting ||
                        !selectedStudent ||
                        lineItems.filter((l) => l.selected).length === 0
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                      size="lg"
                    >
                      {collecting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" /> Collect &amp;
                          Generate Receipt
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div
                    data-ocid="fee-collection.empty_state"
                    className="flex flex-col items-center py-8 text-center text-gray-400"
                  >
                    <Search className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">
                      Search and select a student to begin fee collection
                    </p>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-amber-800">
                  Quick Tips
                </p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Uncheck fee heads you don't want to collect now</li>
                  <li>• Enter discount amount in the discount field</li>
                  <li>• Receipt will be generated after collection</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {receipt && (
        <ReceiptModal
          receipt={receipt}
          onClose={() => {
            setReceipt(null);
            clearStudent();
          }}
        />
      )}
    </div>
  );
}
