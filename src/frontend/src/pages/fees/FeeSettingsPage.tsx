import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FeeType {
  id: string;
  name: string;
  amount: number;
}

interface ConcessionCategory {
  id: string;
  name: string;
}

const DEFAULT_FEE_TYPES: FeeType[] = [
  { id: "1", name: "Tuition Fee", amount: 12000 },
  { id: "2", name: "Transport Fee", amount: 3000 },
  { id: "3", name: "Library Fee", amount: 500 },
  { id: "4", name: "Lab Fee", amount: 1000 },
  { id: "5", name: "Sports Fee", amount: 750 },
];

const DEFAULT_CONCESSIONS: ConcessionCategory[] = [
  { id: "1", name: "SC/ST" },
  { id: "2", name: "Staff Ward" },
  { id: "3", name: "Merit" },
];

export default function FeeSettingsPage() {
  const stored = localStorage.getItem("cymi_fee_config");
  const parsedStored = stored ? JSON.parse(stored) : null;

  const [feeTypes, setFeeTypes] = useState<FeeType[]>(
    parsedStored?.feeTypes ?? DEFAULT_FEE_TYPES,
  );
  const [concessions, setConcessions] = useState<ConcessionCategory[]>(
    parsedStored?.concessions ?? DEFAULT_CONCESSIONS,
  );
  const [lateFeePercent, setLateFeePercent] = useState<number>(
    parsedStored?.lateFeePercent ?? 5,
  );
  const [feeDueDay, setFeeDueDay] = useState<number>(
    parsedStored?.feeDueDay ?? 10,
  );
  const [saving, setSaving] = useState(false);

  const addFeeType = () => {
    setFeeTypes((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "New Fee", amount: 0 },
    ]);
  };

  const removeFeeType = (id: string) => {
    setFeeTypes((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFeeType = (id: string, field: keyof FeeType, value: string) => {
    setFeeTypes((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, [field]: field === "amount" ? Number(value) : value }
          : f,
      ),
    );
  };

  const addConcession = () => {
    setConcessions((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "New Category" },
    ]);
  };

  const removeConcession = (id: string) => {
    setConcessions((prev) => prev.filter((c) => c.id !== id));
  };

  const updateConcession = (id: string, name: string) => {
    setConcessions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    localStorage.setItem(
      "cymi_fee_config",
      JSON.stringify({ feeTypes, concessions, lateFeePercent, feeDueDay }),
    );
    setSaving(false);
    toast.success("Fee configuration saved.");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-600" /> Fee Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure fee types, policy, and concession categories.
        </p>
      </div>

      <div className="space-y-5">
        {/* Fee Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" /> Fee Types
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage fee categories and amounts
              </p>
            </div>
            <Button
              size="sm"
              data-ocid="fee_config.add_fee_type.button"
              onClick={addFeeType}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Fee Type
            </Button>
          </div>

          <div className="space-y-2">
            {feeTypes.map((fee, idx) => (
              <div
                key={fee.id}
                data-ocid={`fee_config.fee_type.item.${idx + 1}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <Input
                  data-ocid={`fee_config.fee_name.input.${idx + 1}`}
                  value={fee.name}
                  onChange={(e) =>
                    updateFeeType(fee.id, "name", e.target.value)
                  }
                  className="flex-1 bg-white"
                  placeholder="Fee name"
                />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500 font-medium">₹</span>
                  <Input
                    data-ocid={`fee_config.fee_amount.input.${idx + 1}`}
                    type="number"
                    value={fee.amount}
                    onChange={(e) =>
                      updateFeeType(fee.id, "amount", e.target.value)
                    }
                    className="w-28 bg-white"
                    placeholder="Amount"
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  data-ocid={`fee_config.delete_fee_type.button.${idx + 1}`}
                  onClick={() => removeFeeType(fee.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Late Fee & Due Date */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">
            Fee Policy Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="late-fee">Late Fee Percentage (%)</Label>
              <Input
                id="late-fee"
                data-ocid="fee_config.late_fee.input"
                type="number"
                min={0}
                max={50}
                value={lateFeePercent}
                onChange={(e) => setLateFeePercent(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due-day">Fee Due Date (Day of Month)</Label>
              <Input
                id="due-day"
                data-ocid="fee_config.due_date.input"
                type="number"
                min={1}
                max={28}
                value={feeDueDay}
                onChange={(e) => setFeeDueDay(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Concession Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-800">
                Concession Categories
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Define eligible concession groups
              </p>
            </div>
            <Button
              size="sm"
              data-ocid="fee_config.add_concession.button"
              onClick={addConcession}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Category
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {concessions.map((cat, idx) => (
              <div
                key={cat.id}
                data-ocid={`fee_config.concession.item.${idx + 1}`}
                className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5"
              >
                <Input
                  value={cat.name}
                  onChange={(e) => updateConcession(cat.id, e.target.value)}
                  className="border-0 bg-transparent p-0 h-auto text-sm text-blue-700 font-medium focus-visible:ring-0 w-24"
                />
                <button
                  type="button"
                  data-ocid={`fee_config.delete_concession.button.${idx + 1}`}
                  onClick={() => removeConcession(cat.id)}
                  className="text-blue-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              data-ocid="fee_config.save_button"
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {saving ? "Saving…" : "Save Fee Configuration"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
