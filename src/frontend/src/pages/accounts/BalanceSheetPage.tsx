import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;

const ASSETS = [
  {
    category: "Fixed Assets",
    items: [
      { name: "Land & Building", amount: 12500000 },
      { name: "Furniture & Fixtures", amount: 850000 },
      { name: "Computer & Equipment", amount: 620000 },
      { name: "Vehicles", amount: 1450000 },
      { name: "Library Books", amount: 280000 },
    ],
  },
  {
    category: "Current Assets",
    items: [
      { name: "Cash in Hand", amount: 125000 },
      { name: "Cash at Bank", amount: 2340000 },
      { name: "Fee Receivables", amount: 485000 },
      { name: "Prepaid Expenses", amount: 68000 },
      { name: "Stock (Stationery)", amount: 42000 },
    ],
  },
];

const LIABILITIES = [
  {
    category: "Equity & Reserves",
    items: [
      { name: "Corpus Fund", amount: 10000000 },
      { name: "General Reserve", amount: 3500000 },
      { name: "Surplus (Current Year)", amount: 2120000 },
    ],
  },
  {
    category: "Long-Term Liabilities",
    items: [
      { name: "Term Loan (Building)", amount: 1500000 },
      { name: "Security Deposits", amount: 380000 },
    ],
  },
  {
    category: "Current Liabilities",
    items: [
      { name: "Salary Payable", amount: 387500 },
      { name: "Advance Fees Received", amount: 220000 },
      { name: "Outstanding Expenses", amount: 57500 },
      { name: "TDS Payable", amount: 45000 },
    ],
  },
];

function sumItems(items: { amount: number }[]) {
  return items.reduce((s, i) => s + i.amount, 0);
}

export default function BalanceSheetPage() {
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

  const totalAssets = ASSETS.reduce((s, c) => s + sumItems(c.items), 0);
  const totalLiabilities = LIABILITIES.reduce(
    (s, c) => s + sumItems(c.items),
    0,
  );

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Balance Sheet</h1>
            <p className="text-gray-500 text-sm mt-1">As of 31st March 2026</p>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              CYMI Computer Institute
            </h2>
            <p className="text-gray-500 text-sm">
              Balance Sheet as at 31st March 2026
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assets Column */}
            <div>
              <div className="bg-blue-600 text-white text-center font-semibold py-2 rounded-t-lg">
                ASSETS
              </div>
              {ASSETS.map((cat) => (
                <div key={cat.category} className="mb-4">
                  <div className="bg-blue-50 px-4 py-2 font-semibold text-blue-700 text-sm border-l-4 border-blue-400">
                    {cat.category}
                  </div>
                  {cat.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between px-4 py-2 border-b border-gray-100 text-sm"
                    >
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-medium text-gray-800">
                        {fmt(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-2 bg-gray-50 text-sm font-semibold">
                    <span className="text-gray-700">{cat.category} Total</span>
                    <span className="text-blue-700">
                      {fmt(sumItems(cat.items))}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 bg-blue-600 text-white font-bold text-sm rounded-b-lg">
                <span>Total Assets</span>
                <span>{fmt(totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities Column */}
            <div>
              <div className="bg-green-600 text-white text-center font-semibold py-2 rounded-t-lg">
                LIABILITIES & EQUITY
              </div>
              {LIABILITIES.map((cat) => (
                <div key={cat.category} className="mb-4">
                  <div className="bg-green-50 px-4 py-2 font-semibold text-green-700 text-sm border-l-4 border-green-400">
                    {cat.category}
                  </div>
                  {cat.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between px-4 py-2 border-b border-gray-100 text-sm"
                    >
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-medium text-gray-800">
                        {fmt(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-2 bg-gray-50 text-sm font-semibold">
                    <span className="text-gray-700">{cat.category} Total</span>
                    <span className="text-green-700">
                      {fmt(sumItems(cat.items))}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 bg-green-600 text-white font-bold text-sm rounded-b-lg">
                <span>Total Liabilities & Equity</span>
                <span>{fmt(totalLiabilities)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-indigo-50 rounded-lg flex justify-between items-center">
            <span className="font-bold text-indigo-800">
              Net Worth (Total Assets - Total Liabilities)
            </span>
            <span className="font-bold text-indigo-700 text-xl">
              {fmt(totalAssets - totalLiabilities)}
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
