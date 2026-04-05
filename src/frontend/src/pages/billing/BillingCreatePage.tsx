import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

type LineItem = {
  id: number;
  description: string;
  qty: string;
  unitPrice: string;
  tax: string;
};
const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;

export default function BillingCreatePage() {
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

  const [recipient, setRecipient] = useState("");
  const [recipientType, setRecipientType] = useState("Student");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [discount, setDiscount] = useState("0");
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, description: "", qty: "1", unitPrice: "", tax: "0" },
  ]);

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: (prev[prev.length - 1]?.id ?? 0) + 1,
        description: "",
        qty: "1",
        unitPrice: "",
        tax: "0",
      },
    ]);
  }
  function removeItem(i: number) {
    setItems((items) => items.filter((_, idx) => idx !== i));
  }
  function updateItem(i: number, field: keyof LineItem, val: string) {
    setItems((items) =>
      items.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)),
    );
  }

  const lineAmounts = items.map((item) => {
    const qty = Number.parseFloat(item.qty) || 0;
    const price = Number.parseFloat(item.unitPrice) || 0;
    const tax = Number.parseFloat(item.tax) || 0;
    const base = qty * price;
    return base + (base * tax) / 100;
  });
  const subtotal = lineAmounts.reduce((s, v) => s + v, 0);
  const discountAmount = (subtotal * (Number.parseFloat(discount) || 0)) / 100;
  const grandTotal = subtotal - discountAmount;

  function handleSave(isDraft: boolean) {
    if (!recipient || !issueDate) {
      toast.error("Fill all required fields");
      return;
    }
    toast.success(
      isDraft ? "Invoice saved as draft" : "Invoice generated successfully!",
    );
    if (!isDraft) navigate({ to: "/billing/invoices" });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create Invoice</h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate a new billing invoice
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6"
          >
            <h2 className="font-semibold text-gray-700 mb-4">
              Invoice Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label className="text-xs">Recipient Type</Label>
                <Select value={recipientType} onValueChange={setRecipientType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Vendor">Vendor</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Recipient Name *</Label>
                <Input
                  className="mt-1"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Name..."
                />
              </div>
              <div>
                <Label className="text-xs">Invoice Date *</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Due Date</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <h2 className="font-semibold text-gray-700 mb-3">Line Items</h2>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">
                      Description
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">
                      Unit Price
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">
                      Tax %
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500">
                      Amount
                    </th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr
                      key={item.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-3 py-2 text-gray-400 text-xs">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateItem(i, "description", e.target.value)
                          }
                          placeholder="Description"
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          value={item.qty}
                          onChange={(e) => updateItem(i, "qty", e.target.value)}
                          className="h-8 text-xs w-16"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(i, "unitPrice", e.target.value)
                          }
                          placeholder="0"
                          className="h-8 text-xs w-24"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          value={item.tax}
                          onChange={(e) => updateItem(i, "tax", e.target.value)}
                          placeholder="0"
                          className="h-8 text-xs w-16"
                        />
                      </td>
                      <td className="px-3 py-2 text-xs font-medium text-gray-700">
                        {fmt(lineAmounts[i])}
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(i)}
                          className="h-7 w-7 text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" /> Add Row
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-700 mb-4">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Discount %</span>
                  <Input
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="h-7 text-xs w-20 ml-auto"
                  />
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Discount</span>
                  <span>-{fmt(discountAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-700 border-t pt-2">
                  <span>Grand Total</span>
                  <span className="text-lg">{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-700 mb-3">Preview</h2>
              <div className="text-xs text-gray-600 border border-gray-200 rounded p-3 space-y-1">
                <p className="font-bold text-center text-gray-800">
                  CYMI Computer Institute
                </p>
                <p className="text-center text-gray-500">
                  Invoice {issueDate ? `(${issueDate})` : ""}
                </p>
                <p className="mt-2">
                  <span className="text-gray-400">To:</span> {recipient || "—"}
                </p>
                <p>
                  <span className="text-gray-400">Items:</span>{" "}
                  {items.filter((i) => i.description).length} line items
                </p>
                <p className="font-bold text-blue-700">
                  Total: {fmt(grandTotal)}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSave(true)}
              >
                Save as Draft
              </Button>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleSave(false)}
              >
                Generate Invoice
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
