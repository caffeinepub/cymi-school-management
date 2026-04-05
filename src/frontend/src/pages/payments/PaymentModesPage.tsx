import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import {
  Banknote,
  Building2,
  CreditCard,
  FileText,
  QrCode,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const PAYMENT_MODES = [
  {
    id: "cash",
    name: "Cash",
    icon: Banknote,
    color: "bg-green-50 text-green-600",
    transactions: 142,
    amount: 2840000,
    enabled: true,
    description: "Physical cash transactions",
  },
  {
    id: "cheque",
    name: "Cheque",
    icon: FileText,
    color: "bg-purple-50 text-purple-600",
    transactions: 78,
    amount: 3120000,
    enabled: true,
    description: "Bank cheque payments",
  },
  {
    id: "upi",
    name: "UPI",
    icon: QrCode,
    color: "bg-blue-50 text-blue-600",
    transactions: 312,
    amount: 5680000,
    enabled: true,
    description: "BHIM UPI / Google Pay / PhonePe",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: Building2,
    color: "bg-indigo-50 text-indigo-600",
    transactions: 95,
    amount: 8920000,
    enabled: true,
    description: "NEFT / RTGS / IMPS transfers",
  },
  {
    id: "dd",
    name: "Demand Draft",
    icon: CreditCard,
    color: "bg-amber-50 text-amber-600",
    transactions: 23,
    amount: 920000,
    enabled: false,
    description: "Banker's Demand Draft",
  },
];

const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;

export default function PaymentModesPage() {
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

  const [modes, setModes] = useState(PAYMENT_MODES);

  function toggleMode(id: string) {
    setModes((m) =>
      m.map((mm) => (mm.id === id ? { ...mm, enabled: !mm.enabled } : mm)),
    );
    toast.success("Payment mode setting updated");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Payment Modes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure and manage accepted payment methods
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modes.map((mode, i) => {
            const Icon = mode.icon;
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className={`bg-white rounded-xl border ${mode.enabled ? "border-blue-200" : "border-gray-100"} p-5 shadow-sm hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${mode.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`mode-${mode.id}`}
                      className="text-xs text-gray-500"
                    >
                      {mode.enabled ? "Enabled" : "Disabled"}
                    </Label>
                    <Switch
                      id={`mode-${mode.id}`}
                      checked={mode.enabled}
                      onCheckedChange={() => toggleMode(mode.id)}
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {mode.name}
                </h3>
                <p className="text-xs text-gray-500 mb-4">{mode.description}</p>
                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-xs text-gray-400">Transactions</p>
                    <p className="font-bold text-gray-700">
                      {mode.transactions}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Amount</p>
                    <p className="font-bold text-gray-700 text-sm">
                      {fmt(mode.amount)}
                    </p>
                  </div>
                </div>
                {mode.enabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs"
                    onClick={() =>
                      toast.success(`${mode.name} settings opened`)
                    }
                  >
                    Edit Settings
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
