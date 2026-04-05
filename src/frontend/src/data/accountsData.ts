// ─── Shared demo data for Accounts, Payroll, Payments, Billing, HR modules ──────

export const INDIAN_FIRST_NAMES = [
  "Aarav",
  "Aditi",
  "Akash",
  "Amit",
  "Anil",
  "Anita",
  "Anjali",
  "Arjun",
  "Aryan",
  "Ashok",
  "Bhavna",
  "Deepak",
  "Deepika",
  "Divya",
  "Gaurav",
  "Geeta",
  "Hemant",
  "Isha",
  "Kapil",
  "Kavita",
  "Kiran",
  "Krishna",
  "Lata",
  "Mahesh",
  "Manish",
  "Meena",
  "Mohan",
  "Neeraj",
  "Neha",
  "Nikhil",
  "Pankaj",
  "Pooja",
  "Pradeep",
  "Prakash",
  "Priya",
  "Rahul",
  "Rajesh",
  "Rakesh",
  "Ramesh",
  "Rekha",
  "Rohit",
  "Sachin",
  "Sangeeta",
  "Sanjay",
  "Seema",
  "Shilpa",
  "Shruti",
  "Sunil",
  "Sunita",
  "Vijay",
  "Vikas",
  "Vinod",
  "Yashwant",
  "Zara",
  "Pallavi",
  "Suresh",
  "Kaveri",
  "Naresh",
  "Tanya",
  "Umesh",
];
export const INDIAN_LAST_NAMES = [
  "Sharma",
  "Verma",
  "Gupta",
  "Singh",
  "Patel",
  "Mehta",
  "Joshi",
  "Yadav",
  "Mishra",
  "Tiwari",
  "Pandey",
  "Dubey",
  "Shukla",
  "Srivastava",
  "Agarwal",
  "Banerjee",
  "Chatterjee",
  "Das",
  "Ghosh",
  "Roy",
  "Nair",
  "Menon",
  "Pillai",
  "Iyer",
  "Reddy",
  "Rao",
  "Kumar",
  "Chauhan",
  "Rajput",
  "Thakur",
];
function rnd(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function name() {
  return `${rnd(INDIAN_FIRST_NAMES)} ${rnd(INDIAN_LAST_NAMES)}`;
}

// ─── Accounts Ledger Data ─────────────────────────────────────────────────────
export type LedgerEntry = {
  id: number;
  date: string;
  reference: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

const ACCOUNTS = [
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

let runningBalance = 250000;
export const LEDGER_ENTRIES: LedgerEntry[] = Array.from(
  { length: 45 },
  (_, i) => {
    const isDebit = i % 3 !== 0;
    const amount = Math.floor(Math.random() * 45000) + 5000;
    runningBalance += isDebit ? -amount : amount;
    const d = new Date(2025, Math.floor(i / 4), (i % 28) + 1);
    return {
      id: i + 1,
      date: d.toISOString().split("T")[0],
      reference: `REF-${1000 + i}`,
      accountName: ACCOUNTS[i % ACCOUNTS.length],
      description: isDebit
        ? `Payment for ${ACCOUNTS[i % ACCOUNTS.length]}`
        : `Receipt from ${ACCOUNTS[i % ACCOUNTS.length]}`,
      debit: isDebit ? amount : 0,
      credit: isDebit ? 0 : amount,
      balance: runningBalance,
    };
  },
);

// ─── Journal Entries ──────────────────────────────────────────────────────────
export type JournalEntry = {
  id: number;
  date: string;
  voucherNo: string;
  voucherType: string;
  narration: string;
  totalDebit: number;
  totalCredit: number;
  status: string;
};
const VOUCHER_TYPES = ["Payment", "Receipt", "Contra", "Journal"];
export const JOURNAL_ENTRIES: JournalEntry[] = Array.from(
  { length: 22 },
  (_, i) => {
    const amount = Math.floor(Math.random() * 50000) + 5000;
    const d = new Date(2025, Math.floor(i / 2), (i % 28) + 1);
    return {
      id: i + 1,
      date: d.toISOString().split("T")[0],
      voucherNo: `JV-${2025001 + i}`,
      voucherType: VOUCHER_TYPES[i % 4],
      narration: [
        `Fee collection for Class ${i + 1}`,
        `Salary disbursement - ${["April", "May", "June", "July", "August"][i % 5]}`,
        "Transport charges collected",
        "Library fund transfer",
        "Maintenance work payment",
      ][i % 5],
      totalDebit: amount,
      totalCredit: amount,
      status: i % 5 === 0 ? "Draft" : "Posted",
    };
  },
);

// ─── Staff Salary Data ────────────────────────────────────────────────────────
export type StaffSalary = {
  id: number;
  empId: string;
  name: string;
  designation: string;
  department: string;
  basic: number;
  hra: number;
  da: number;
  otherAllowances: number;
  pfDeduction: number;
  tds: number;
  netPay: number;
  status: string;
  bankAccount: string;
};
const DEPARTMENTS = [
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
const DESIGNATIONS = [
  "Principal",
  "Vice Principal",
  "Senior Teacher",
  "Teacher",
  "Lab Assistant",
  "Librarian",
  "Accountant",
  "Admin Officer",
  "Peon",
  "Security Guard",
];
export const STAFF_SALARY_DATA: StaffSalary[] = Array.from(
  { length: 50 },
  (_, i) => {
    const basic = [
      85000, 75000, 65000, 55000, 45000, 38000, 32000, 28000, 22000, 18000,
    ][i % 10];
    const hra = Math.round(basic * 0.4);
    const da = Math.round(basic * 0.17);
    const other = Math.round(basic * 0.1);
    const pf = Math.round(basic * 0.12);
    const tds = Math.round(basic * 0.05);
    const net = basic + hra + da + other - pf - tds;
    return {
      id: i + 1,
      empId: `EMP${1000 + i}`,
      name: name(),
      designation: DESIGNATIONS[i % 10],
      department: DEPARTMENTS[i % 10],
      basic,
      hra,
      da,
      otherAllowances: other,
      pfDeduction: pf,
      tds,
      netPay: net,
      status: i % 7 === 0 ? "Inactive" : "Active",
      bankAccount: `SBI ${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    };
  },
);

// ─── Payroll Process Data ─────────────────────────────────────────────────────
export type PayrollRecord = {
  id: number;
  empId: string;
  name: string;
  department: string;
  basic: number;
  allowances: number;
  deductions: number;
  netPay: number;
  processStatus: "Pending" | "Processed" | "Paid";
};
export const PAYROLL_RECORDS: PayrollRecord[] = STAFF_SALARY_DATA.map(
  (s, i) => ({
    id: s.id,
    empId: s.empId,
    name: s.name,
    department: s.department,
    basic: s.basic,
    allowances: s.hra + s.da + s.otherAllowances,
    deductions: s.pfDeduction + s.tds,
    netPay: s.netPay,
    processStatus: (["Paid", "Paid", "Processed", "Pending"] as const)[i % 4],
  }),
);

// ─── Payments Received ────────────────────────────────────────────────────────
export type PaymentRecord = {
  id: number;
  date: string;
  refNo: string;
  payerName: string;
  category: string;
  amount: number;
  mode: string;
  status: string;
};
const PAY_CATEGORIES = ["Fee", "Salary", "Vendor", "Other"];
const PAY_MODES = ["Cash", "UPI", "Cheque", "Bank Transfer"];
const PAY_STATUSES = [
  "Confirmed",
  "Confirmed",
  "Confirmed",
  "Pending",
  "Failed",
];
export const PAYMENTS_RECEIVED: PaymentRecord[] = Array.from(
  { length: 60 },
  (_, i) => {
    const d = new Date(2025, i % 12, (i % 28) + 1);
    return {
      id: i + 1,
      date: d.toISOString().split("T")[0],
      refNo: `PAY-${3000 + i}`,
      payerName: name(),
      category: PAY_CATEGORIES[i % 4],
      amount: Math.floor(Math.random() * 50000) + 2000,
      mode: PAY_MODES[i % 4],
      status: PAY_STATUSES[i % 5],
    };
  },
);

// ─── Payments Pending ─────────────────────────────────────────────────────────
export type PendingPayment = {
  id: number;
  date: string;
  refNo: string;
  payerName: string;
  description: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: string;
};
export const PAYMENTS_PENDING: PendingPayment[] = Array.from(
  { length: 30 },
  (_, i) => {
    const due = new Date(2025, Math.floor(i / 3), (i % 28) + 1);
    const days = Math.floor(Math.random() * 60) + 1;
    return {
      id: i + 1,
      date: new Date(2025, Math.floor(i / 3), 1).toISOString().split("T")[0],
      refNo: `PEND-${4000 + i}`,
      payerName: name(),
      description: [
        "Monthly Tuition Fee",
        "Transport Charges",
        "Hostel Charges",
        "Library Fee",
        "Sports Fee",
      ][i % 5],
      amount: Math.floor(Math.random() * 30000) + 3000,
      dueDate: due.toISOString().split("T")[0],
      daysOverdue: days,
      status: "Pending",
    };
  },
);

// ─── Payment Vouchers ─────────────────────────────────────────────────────────
export type PaymentVoucher = {
  id: number;
  voucherNo: string;
  date: string;
  payee: string;
  purpose: string;
  amount: number;
  approvedBy: string;
  status: string;
};
const VOUCHER_STATUSES = ["Approved", "Approved", "Pending", "Rejected"];
export const PAYMENT_VOUCHERS: PaymentVoucher[] = Array.from(
  { length: 25 },
  (_, i) => {
    const d = new Date(2025, i % 8, (i % 28) + 1);
    return {
      id: i + 1,
      voucherNo: `PV-${5000 + i}`,
      date: d.toISOString().split("T")[0],
      payee: name(),
      purpose: [
        "Stationery Purchase",
        "Maintenance Work",
        "Electricity Bill",
        "Water Bill",
        "Lab Equipment",
        "Sports Equipment",
        "Cleaning Supplies",
        "Printing & Stationery",
      ][i % 8],
      amount: Math.floor(Math.random() * 40000) + 5000,
      approvedBy: `Mr. ${rnd(INDIAN_LAST_NAMES)}`,
      status: VOUCHER_STATUSES[i % 4],
    };
  },
);

// ─── Billing Invoices ─────────────────────────────────────────────────────────
export type Invoice = {
  id: number;
  invoiceNo: string;
  recipientName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: string;
};
const INV_STATUSES = ["Paid", "Paid", "Partial", "Unpaid", "Overdue"];
export const BILLING_INVOICES: Invoice[] = Array.from(
  { length: 50 },
  (_, i) => {
    const amount = Math.floor(Math.random() * 60000) + 5000;
    const paidFrac = [1, 1, 0.5, 0, 0][i % 5];
    const paid = Math.round(amount * paidFrac);
    const issue = new Date(2025, i % 10, (i % 28) + 1);
    const due = new Date(issue);
    due.setDate(due.getDate() + 30);
    return {
      id: i + 1,
      invoiceNo: `INV-${6000 + i}`,
      recipientName: name(),
      issueDate: issue.toISOString().split("T")[0],
      dueDate: due.toISOString().split("T")[0],
      amount,
      paid,
      balance: amount - paid,
      status: INV_STATUSES[i % 5],
    };
  },
);

// ─── Recurring Billing Templates ─────────────────────────────────────────────
export type RecurringTemplate = {
  id: number;
  name: string;
  frequency: string;
  amount: number;
  nextRun: string;
  status: "Active" | "Paused";
};
export const RECURRING_TEMPLATES: RecurringTemplate[] = [
  {
    id: 1,
    name: "Monthly Tuition Fee",
    frequency: "Monthly",
    amount: 12500,
    nextRun: "2026-05-01",
    status: "Active",
  },
  {
    id: 2,
    name: "Transport Charges",
    frequency: "Monthly",
    amount: 2500,
    nextRun: "2026-05-01",
    status: "Active",
  },
  {
    id: 3,
    name: "Hostel Fee",
    frequency: "Monthly",
    amount: 8000,
    nextRun: "2026-05-01",
    status: "Active",
  },
  {
    id: 4,
    name: "Library Fee",
    frequency: "Quarterly",
    amount: 1500,
    nextRun: "2026-07-01",
    status: "Active",
  },
  {
    id: 5,
    name: "Sports Fee",
    frequency: "Annually",
    amount: 3000,
    nextRun: "2026-04-01",
    status: "Active",
  },
  {
    id: 6,
    name: "Lab Charges",
    frequency: "Quarterly",
    amount: 2000,
    nextRun: "2026-07-01",
    status: "Paused",
  },
  {
    id: 7,
    name: "Computer Lab Fee",
    frequency: "Monthly",
    amount: 1000,
    nextRun: "2026-05-01",
    status: "Active",
  },
  {
    id: 8,
    name: "Examination Fee",
    frequency: "Quarterly",
    amount: 1800,
    nextRun: "2026-06-01",
    status: "Active",
  },
  {
    id: 9,
    name: "Annual Day Charges",
    frequency: "Annually",
    amount: 2500,
    nextRun: "2027-01-01",
    status: "Paused",
  },
  {
    id: 10,
    name: "Uniform Charges",
    frequency: "Annually",
    amount: 3500,
    nextRun: "2026-04-01",
    status: "Active",
  },
];

// ─── HR Employees ─────────────────────────────────────────────────────────────
export type HREmployee = {
  id: number;
  empId: string;
  name: string;
  department: string;
  designation: string;
  joinDate: string;
  employmentType: string;
  status: string;
  email: string;
};
const EMP_TYPES = ["Permanent", "Permanent", "Contract", "Part-time"];
const EMP_STATUSES = ["Active", "Active", "Active", "On Leave", "Resigned"];
export const HR_EMPLOYEES: HREmployee[] = Array.from({ length: 60 }, (_, i) => {
  const d = new Date(2018 + (i % 7), i % 12, (i % 28) + 1);
  return {
    id: i + 1,
    empId: `EMP${1000 + i}`,
    name: name(),
    department: DEPARTMENTS[i % 10],
    designation: DESIGNATIONS[i % 10],
    joinDate: d.toISOString().split("T")[0],
    employmentType: EMP_TYPES[i % 4],
    status: EMP_STATUSES[i % 5],
    email: `emp${1000 + i}@cymi.edu.in`,
  };
});

// ─── HR Recruitment ───────────────────────────────────────────────────────────
export type JobOpening = {
  id: number;
  position: string;
  department: string;
  openings: number;
  applications: number;
  status: string;
};
export const JOB_OPENINGS: JobOpening[] = [
  {
    id: 1,
    position: "Senior Maths Teacher",
    department: "Mathematics",
    openings: 2,
    applications: 18,
    status: "Open",
  },
  {
    id: 2,
    position: "Science Lab Assistant",
    department: "Science",
    openings: 1,
    applications: 9,
    status: "Open",
  },
  {
    id: 3,
    position: "Hindi Teacher",
    department: "Hindi",
    openings: 1,
    applications: 12,
    status: "Open",
  },
  {
    id: 4,
    position: "Physical Education Coach",
    department: "Physical Education",
    openings: 1,
    applications: 7,
    status: "On Hold",
  },
  {
    id: 5,
    position: "Accountant",
    department: "Accounts",
    openings: 1,
    applications: 15,
    status: "Open",
  },
  {
    id: 6,
    position: "Computer Teacher",
    department: "Computer",
    openings: 2,
    applications: 22,
    status: "Open",
  },
  {
    id: 7,
    position: "Librarian",
    department: "Library",
    openings: 1,
    applications: 6,
    status: "Closed",
  },
  {
    id: 8,
    position: "Admin Officer",
    department: "Administration",
    openings: 1,
    applications: 19,
    status: "Closed",
  },
];
export type Applicant = {
  id: number;
  jobId: number;
  name: string;
  stage: string;
  applied: string;
};
const STAGES = ["Applied", "Shortlisted", "Interviewed", "Offered", "Joined"];
export const APPLICANTS: Applicant[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  jobId: (i % 8) + 1,
  name: name(),
  stage: STAGES[i % 5],
  applied: new Date(2025, 10 + (i % 3), (i % 28) + 1)
    .toISOString()
    .split("T")[0],
}));

// ─── HR Leave Records ─────────────────────────────────────────────────────────
export type LeaveRecord = {
  id: number;
  empName: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: string;
};
const LEAVE_TYPES = ["CL", "SL", "EL", "LWP"];
const LEAVE_STATUSES = ["Approved", "Approved", "Pending", "Rejected"];
export const LEAVE_RECORDS: LeaveRecord[] = Array.from(
  { length: 40 },
  (_, i) => {
    const from = new Date(2025, i % 12, (i % 28) + 1);
    const days = (i % 4) + 1;
    const to = new Date(from);
    to.setDate(to.getDate() + days - 1);
    return {
      id: i + 1,
      empName: name(),
      leaveType: LEAVE_TYPES[i % 4],
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
      days,
      reason: [
        "Personal work",
        "Medical emergency",
        "Family function",
        "Out of town",
        "Health checkup",
      ][i % 5],
      status: LEAVE_STATUSES[i % 4],
    };
  },
);

// ─── HR Performance Reviews ───────────────────────────────────────────────────
export type PerformanceReview = {
  id: number;
  empName: string;
  department: string;
  period: string;
  rating: number;
  reviewer: string;
  status: string;
  workQuality: number;
  punctuality: number;
  teamwork: number;
  communication: number;
};
const REVIEW_STATUSES = ["Final", "Submitted", "Draft"];
export const PERFORMANCE_REVIEWS: PerformanceReview[] = Array.from(
  { length: 30 },
  (_, i) => ({
    id: i + 1,
    empName: name(),
    department: DEPARTMENTS[i % 10],
    period: ["Q1 2025-26", "Q2 2025-26", "Q3 2025-26", "Annual 2024-25"][i % 4],
    rating: Math.floor(Math.random() * 2) + 3,
    reviewer: `Mr. ${rnd(INDIAN_LAST_NAMES)}`,
    status: REVIEW_STATUSES[i % 3],
    workQuality: Math.floor(Math.random() * 30) + 65,
    punctuality: Math.floor(Math.random() * 30) + 65,
    teamwork: Math.floor(Math.random() * 30) + 65,
    communication: Math.floor(Math.random() * 30) + 65,
  }),
);

// ─── HR Documents ─────────────────────────────────────────────────────────────
export type HRDocument = {
  id: number;
  empId: number;
  docName: string;
  docType: string;
  uploadDate: string;
  expiryDate: string;
  status: string;
};
const DOC_TYPES = ["ID", "Certificate", "Contract", "Other"];
const DOC_STATUSES = ["Valid", "Valid", "Expiring Soon", "Expired"];
export const HR_DOCUMENTS: HRDocument[] = HR_EMPLOYEES.slice(0, 8).flatMap(
  (emp, ei) =>
    Array.from({ length: 5 + (ei % 2) }, (_, di) => ({
      id: ei * 6 + di + 1,
      empId: emp.id,
      docName: [
        `Aadhaar Card","PAN Card","10th Certificate","12th Certificate","Degree Certificate","Employment Contract","Relieving Letter`,
        "Experience Certificate",
        "Salary Slip",
        "Joining Letter",
      ][di % 10],
      docType: DOC_TYPES[di % 4],
      uploadDate: new Date(2021 + di, di % 12, 15).toISOString().split("T")[0],
      expiryDate:
        di % 3 === 0
          ? ""
          : new Date(2027 + (di % 3), di % 12, 15).toISOString().split("T")[0],
      status: DOC_STATUSES[di % 4],
    })),
);
