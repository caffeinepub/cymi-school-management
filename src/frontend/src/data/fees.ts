// ─── Fee Management Data ──────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export interface FeeStructure {
  id: number;
  feeHead: string;
  applicableGrades: number[];
  amount: number;
  dueDate: string;
  lateFeePerDay: number;
  status: "Active" | "Inactive";
  category: string;
}

export interface FeeTransaction {
  id: number;
  receiptNo: string;
  studentId: number;
  studentName: string;
  admissionNo: string;
  grade: number;
  section: string;
  feeHead: string;
  feeCategory: string;
  amount: number;
  paidAmount: number;
  balance: number;
  discount: number;
  paymentMethod: "Cash" | "Online" | "Cheque" | "DD";
  paymentDate: string;
  status: "Paid" | "Partial" | "Pending" | "Overdue";
  remarks?: string;
}

export interface Receipt {
  id: number;
  receiptNo: string;
  date: string;
  studentName: string;
  admissionNo: string;
  grade: number;
  section: string;
  feeHeads: { name: string; amount: number; discount: number }[];
  totalAmount: number;
  paidAmount: number;
  paymentMethod: "Cash" | "Online" | "Cheque" | "DD";
  remarks?: string;
}

// ── Fee Structure Data ───────────────────────────────────────────────────────

export const FEE_STRUCTURES: FeeStructure[] = [
  {
    id: 1,
    feeHead: "Tuition Fee",
    applicableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    amount: 8500,
    dueDate: "2025-04-10",
    lateFeePerDay: 50,
    status: "Active",
    category: "Academic",
  },
  {
    id: 2,
    feeHead: "Transport Fee",
    applicableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    amount: 2500,
    dueDate: "2025-04-10",
    lateFeePerDay: 25,
    status: "Active",
    category: "Transport",
  },
  {
    id: 3,
    feeHead: "Library Fee",
    applicableGrades: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    amount: 800,
    dueDate: "2025-04-15",
    lateFeePerDay: 10,
    status: "Active",
    category: "Facilities",
  },
  {
    id: 4,
    feeHead: "Lab Fee",
    applicableGrades: [6, 7, 8, 9, 10, 11, 12],
    amount: 1200,
    dueDate: "2025-04-15",
    lateFeePerDay: 15,
    status: "Active",
    category: "Academic",
  },
  {
    id: 5,
    feeHead: "Sports Fee",
    applicableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    amount: 600,
    dueDate: "2025-06-01",
    lateFeePerDay: 5,
    status: "Active",
    category: "Activities",
  },
  {
    id: 6,
    feeHead: "Exam Fee",
    applicableGrades: [9, 10, 11, 12],
    amount: 1500,
    dueDate: "2025-09-01",
    lateFeePerDay: 20,
    status: "Active",
    category: "Academic",
  },
  {
    id: 7,
    feeHead: "Admission Fee",
    applicableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    amount: 5000,
    dueDate: "2025-04-01",
    lateFeePerDay: 100,
    status: "Inactive",
    category: "Admission",
  },
  {
    id: 8,
    feeHead: "Miscellaneous Fee",
    applicableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    amount: 500,
    dueDate: "2025-05-01",
    lateFeePerDay: 5,
    status: "Active",
    category: "Other",
  },
];

// ── Student list for fee collection search ────────────────────────────────────

const INDIAN_NAMES = [
  ["Aarav", "Sharma"],
  ["Priya", "Patel"],
  ["Rohan", "Gupta"],
  ["Neha", "Singh"],
  ["Arjun", "Verma"],
  ["Kavya", "Reddy"],
  ["Rahul", "Nair"],
  ["Pooja", "Iyer"],
  ["Vikram", "Mehta"],
  ["Anjali", "Joshi"],
  ["Suresh", "Kumar"],
  ["Deepa", "Pillai"],
  ["Kiran", "Rao"],
  ["Sunita", "Mishra"],
  ["Aditya", "Bose"],
  ["Meena", "Chauhan"],
  ["Nikhil", "Tiwari"],
  ["Ritu", "Malhotra"],
  ["Sandeep", "Das"],
  ["Priti", "Shah"],
  ["Manish", "Bajaj"],
  ["Shweta", "Kapoor"],
  ["Rajesh", "Sinha"],
  ["Divya", "Pandey"],
  ["Amit", "Chaudhary"],
  ["Nisha", "Bhatt"],
  ["Sanjay", "Yadav"],
  ["Geeta", "Agarwal"],
  ["Hemant", "Saxena"],
  ["Rekha", "Dixit"],
  ["Tarun", "Srivastava"],
  ["Monika", "Tripathi"],
  ["Vivek", "Dubey"],
  ["Lata", "Kulkarni"],
  ["Gaurav", "Shukla"],
  ["Payal", "Bansal"],
  ["Saurabh", "Khatri"],
  ["Rashmi", "Garg"],
  ["Abhishek", "Thakur"],
  ["Pallavi", "Jain"],
  ["Deepak", "Saxena"],
  ["Swati", "Ahuja"],
  ["Manoj", "Gupta"],
  ["Renu", "Sharma"],
  ["Harish", "Patel"],
  ["Sneha", "Singh"],
  ["Ashok", "Verma"],
  ["Usha", "Kumar"],
  ["Nilesh", "Reddy"],
  ["Anita", "Nair"],
];

export const FEE_STUDENTS = INDIAN_NAMES.map(([first, last], i) => ({
  id: i + 1,
  name: `${first} ${last}`,
  admissionNo: `CYMI/2025/${String(i + 1).padStart(4, "0")}`,
  grade: (i % 12) + 1,
  section: ["A", "B", "C", "D"][i % 4],
  outstandingBalance: [0, 2500, 8500, 1200, 0, 15000, 3200][i % 7],
}));

// ── Fee Transactions (200+ entries) ──────────────────────────────────────────

const FEE_HEADS = [
  "Tuition Fee",
  "Transport Fee",
  "Library Fee",
  "Lab Fee",
  "Sports Fee",
  "Exam Fee",
  "Miscellaneous Fee",
];

const PAYMENT_METHODS = ["Cash", "Online", "Cheque", "DD"] as const;
const SECTIONS = ["A", "B", "C", "D"];
const STATUSES = ["Paid", "Partial", "Pending", "Overdue"] as const;

function deterministicRnd(seed: number, min: number, max: number) {
  const s = ((seed * 1664525 + 1013904223) & 0xffffffff) >>> 0;
  return min + (s % (max - min + 1));
}

function dateOffset(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const BASE_DATE = new Date("2025-04-01");

export const FEE_TRANSACTIONS: FeeTransaction[] = Array.from(
  { length: 220 },
  (_, i) => {
    const studentIdx = deterministicRnd(i * 17, 0, INDIAN_NAMES.length - 1);
    const [first, last] = INDIAN_NAMES[studentIdx];
    const grade = ((studentIdx + i) % 12) + 1;
    const section = SECTIONS[(i + studentIdx) % 4];
    const feeHead = FEE_HEADS[(i * 3 + studentIdx) % FEE_HEADS.length];
    const baseAmount = [8500, 2500, 800, 1200, 600, 1500, 500][
      (i * 3 + studentIdx) % 7
    ];
    const status = STATUSES[(i * 7 + studentIdx) % STATUSES.length];
    const paidAmount =
      status === "Paid"
        ? baseAmount
        : status === "Partial"
          ? Math.floor(baseAmount * 0.5)
          : status === "Pending"
            ? 0
            : 0;
    const daysOffset = deterministicRnd(i * 13, 0, 150);

    return {
      id: i + 1,
      receiptNo: `RCP-2025-${String(i + 1001).padStart(4, "0")}`,
      studentId: studentIdx + 1,
      studentName: `${first} ${last}`,
      admissionNo: `CYMI/2025/${String(studentIdx + 1).padStart(4, "0")}`,
      grade,
      section,
      feeHead,
      feeCategory: ["Tuition Fee", "Lab Fee", "Exam Fee"].includes(feeHead)
        ? "Academic"
        : feeHead === "Transport Fee"
          ? "Transport"
          : feeHead === "Library Fee"
            ? "Facilities"
            : feeHead === "Sports Fee"
              ? "Activities"
              : "Other",
      amount: baseAmount,
      paidAmount,
      balance: baseAmount - paidAmount,
      discount: status === "Paid" && deterministicRnd(i, 0, 4) === 0 ? 200 : 0,
      paymentMethod:
        status === "Pending" || status === "Overdue"
          ? "Cash"
          : PAYMENT_METHODS[deterministicRnd(i * 5, 0, 3)],
      paymentDate:
        status === "Pending" || status === "Overdue"
          ? ""
          : dateOffset(BASE_DATE, daysOffset),
      status,
      remarks:
        i % 15 === 0
          ? "Paid after due date"
          : i % 20 === 0
            ? "Special waiver applied"
            : undefined,
    };
  },
);

// ── Receipts (50+ entries) ────────────────────────────────────────────────────

export const FEE_RECEIPTS: Receipt[] = Array.from({ length: 60 }, (_, i) => {
  const studentIdx = deterministicRnd(i * 19, 0, INDIAN_NAMES.length - 1);
  const [first, last] = INDIAN_NAMES[studentIdx];
  const grade = ((studentIdx + i) % 12) + 1;
  const section = SECTIONS[(i + studentIdx) % 4];
  const daysOffset = deterministicRnd(i * 11, 0, 180);
  const method = PAYMENT_METHODS[deterministicRnd(i * 7, 0, 3)];

  const feeCount = deterministicRnd(i * 3, 1, 3);
  const feeHeads = Array.from({ length: feeCount }, (_, fi) => {
    const name = FEE_HEADS[(i + fi * 7) % FEE_HEADS.length];
    return {
      name,
      amount: [8500, 2500, 800, 1200, 600, 1500, 500][(i + fi * 7) % 7],
      discount: fi === 0 && i % 8 === 0 ? 200 : 0,
    };
  });

  const totalAmount = feeHeads.reduce((s, f) => s + f.amount - f.discount, 0);

  return {
    id: i + 1,
    receiptNo: `RCP-2025-${String(i + 2001).padStart(4, "0")}`,
    date: dateOffset(BASE_DATE, daysOffset),
    studentName: `${first} ${last}`,
    admissionNo: `CYMI/2025/${String(studentIdx + 1).padStart(4, "0")}`,
    grade,
    section,
    feeHeads,
    totalAmount,
    paidAmount: totalAmount,
    paymentMethod: method,
    remarks: i % 10 === 0 ? "Annual payment" : undefined,
  };
});

// ── Monthly collection data for charts ────────────────────────────────────────

export const MONTHLY_COLLECTION = [
  { month: "Apr", amount: 3820000, target: 4200000 },
  { month: "May", amount: 4150000, target: 4200000 },
  { month: "Jun", amount: 3640000, target: 4200000 },
  { month: "Jul", amount: 4380000, target: 4200000 },
  { month: "Aug", amount: 3920000, target: 4200000 },
  { month: "Sep", amount: 4510000, target: 4200000 },
  { month: "Oct", amount: 3750000, target: 4200000 },
  { month: "Nov", amount: 4020000, target: 4200000 },
  { month: "Dec", amount: 3880000, target: 4200000 },
  { month: "Jan", amount: 4290000, target: 4200000 },
  { month: "Feb", amount: 3960000, target: 4200000 },
  { month: "Mar", amount: 2700000, target: 4200000 },
];

export const CLASSWISE_FEE_SUMMARY = Array.from({ length: 12 }, (_, i) => {
  const cls = i + 1;
  const students = 38 + ((i * 7) % 10);
  const assessed =
    students *
    (8500 +
      2500 +
      600 +
      500 +
      (cls >= 6 ? 1200 : 0) +
      (cls >= 4 ? 800 : 0) +
      (cls >= 9 ? 1500 : 0));
  const collected = Math.floor(assessed * (0.72 + ((cls * 3) % 15) / 100));
  return {
    class: `Class ${cls}`,
    students,
    assessed,
    collected,
    outstanding: assessed - collected,
    percentage: Math.round((collected / assessed) * 100),
  };
});

export const FEE_BY_CLASS_PIE = CLASSWISE_FEE_SUMMARY.slice(0, 8).map((c) => ({
  name: c.class,
  value: c.collected,
}));

// ── Outstanding dues trend ─────────────────────────────────────────────────────

export const OUTSTANDING_TREND = [
  { month: "Apr", outstanding: 8200000 },
  { month: "May", outstanding: 7450000 },
  { month: "Jun", outstanding: 8900000 },
  { month: "Jul", outstanding: 6200000 },
  { month: "Aug", outstanding: 7100000 },
  { month: "Sep", outstanding: 5800000 },
  { month: "Oct", outstanding: 6900000 },
  { month: "Nov", outstanding: 5600000 },
  { month: "Dec", outstanding: 6400000 },
  { month: "Jan", outstanding: 4900000 },
  { month: "Feb", outstanding: 5300000 },
  { month: "Mar", outstanding: 8750000 },
];
