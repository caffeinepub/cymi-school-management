// Fee Concession and Defaulters data
import { FEE_STRUCTURES, FEE_STUDENTS, FEE_TRANSACTIONS } from "./fees";

export interface Concession {
  id: number;
  studentId: number;
  studentName: string;
  admissionNo: string;
  grade: number;
  section: string;
  type: "Merit" | "Financial Aid" | "Staff Ward" | "Sports" | "Other";
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  feeHeads: string[];
  validFrom: string;
  validUntil: string;
  approvedBy: string;
  status: "Active" | "Inactive" | "Pending";
  remarks?: string;
}

export interface Defaulter {
  id: number;
  studentId: number;
  studentName: string;
  admissionNo: string;
  grade: number;
  section: string;
  feeHead: string;
  amount: number;
  paidAmount: number;
  balance: number;
  overdueDays: number;
  lastPayment: string;
  status: "Overdue" | "Pending";
}

function deterministicRnd(seed: number, min: number, max: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return (min + Math.abs(x - Math.floor(x)) * (max - min + 1)) | 0;
}

const SECTIONS = ["A", "B", "C", "D"];
const CONCESSION_TYPES: Concession["type"][] = [
  "Merit",
  "Financial Aid",
  "Staff Ward",
  "Sports",
  "Other",
];
const APPROVED_BY = [
  "Principal",
  "Vice Principal",
  "Admin Head",
  "Management",
  "Finance Head",
];
const STATUSES: Concession["status"][] = [
  "Active",
  "Active",
  "Active",
  "Pending",
  "Inactive",
];

const VALID_FROMS = [
  "2025-04-01",
  "2025-06-01",
  "2025-07-01",
  "2025-08-01",
  "2025-09-01",
];
const VALID_UNTILS = [
  "2026-03-31",
  "2026-03-31",
  "2025-12-31",
  "2026-03-31",
  "2025-11-30",
];

export const FEE_CONCESSIONS: Concession[] = Array.from(
  { length: 30 },
  (_, i) => {
    const student = FEE_STUDENTS[i % FEE_STUDENTS.length];
    const type =
      CONCESSION_TYPES[deterministicRnd(i * 7, 0, CONCESSION_TYPES.length - 1)];
    const discountType: Concession["discountType"] =
      i % 2 === 0 ? "Percentage" : "Fixed";
    const discountValue =
      discountType === "Percentage"
        ? [10, 15, 20, 25, 50, 75, 100][deterministicRnd(i * 3, 0, 6)]
        : [500, 1000, 1500, 2000, 2500, 3000, 5000][
            deterministicRnd(i * 5, 0, 6)
          ];
    const feeHeadCount = (i % 3) + 1;
    const feeHeads = FEE_STRUCTURES.slice(0, feeHeadCount).map(
      (s) => s.feeHead,
    );
    const validFromIdx = deterministicRnd(i * 11, 0, VALID_FROMS.length - 1);

    return {
      id: i + 1,
      studentId: student.id,
      studentName: student.name,
      admissionNo: student.admissionNo,
      grade: student.grade,
      section: SECTIONS[deterministicRnd(i * 13, 0, 3)],
      type,
      discountType,
      discountValue,
      feeHeads,
      validFrom: VALID_FROMS[validFromIdx],
      validUntil: VALID_UNTILS[validFromIdx],
      approvedBy:
        APPROVED_BY[deterministicRnd(i * 17, 0, APPROVED_BY.length - 1)],
      status: STATUSES[deterministicRnd(i * 19, 0, STATUSES.length - 1)],
      remarks:
        i % 4 === 0
          ? "Approved based on academic performance"
          : i % 4 === 1
            ? "Financial hardship case"
            : undefined,
    };
  },
);

// Derive defaulters from FEE_TRANSACTIONS
export const FEE_DEFAULTERS: Defaulter[] = FEE_TRANSACTIONS.filter(
  (t) => t.status === "Pending" || t.status === "Overdue",
)
  .slice(0, 60)
  .map((t, i) => ({
    id: t.id,
    studentId: t.studentId,
    studentName: t.studentName,
    admissionNo: t.admissionNo,
    grade: t.grade,
    section: t.section,
    feeHead: t.feeHead,
    amount: t.amount,
    paidAmount: t.paidAmount,
    balance: t.balance,
    overdueDays: deterministicRnd(t.id * 3, 1, 90),
    lastPayment: t.paymentDate,
    status:
      t.status === "Overdue" || deterministicRnd(i * 7, 0, 1) === 0
        ? ("Overdue" as const)
        : ("Pending" as const),
  }));
