import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import {
  PERFORMANCE_REVIEWS,
  type PerformanceReview,
} from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const PAGE_SIZE = 15;
const STATUS_COLORS: Record<string, string> = {
  Final: "bg-green-100 text-green-700",
  Submitted: "bg-blue-100 text-blue-700",
  Draft: "bg-gray-100 text-gray-600",
};
const SCORE_KEYS: (keyof PerformanceReview)[] = [
  "workQuality",
  "punctuality",
  "teamwork",
  "communication",
];
const SCORE_LABELS = [
  "Work Quality",
  "Punctuality",
  "Teamwork",
  "Communication",
];

export default function HRPerformancePage() {
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

  const [reviews, setReviews] =
    useState<PerformanceReview[]>(PERFORMANCE_REVIEWS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [newReview, setNewReview] = useState({
    empName: "",
    department: "",
    period: "Q1 2025-26",
    rating: "4",
    reviewer: "",
  });

  const filtered = useMemo(
    () =>
      reviews.filter(
        (r) =>
          search === "" ||
          r.empName.toLowerCase().includes(search.toLowerCase()),
      ),
    [reviews, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleAdd() {
    if (!newReview.empName) {
      toast.error("Employee name required");
      return;
    }
    const id = Math.max(...reviews.map((r) => r.id)) + 1;
    setReviews((r) => [
      ...r,
      {
        id,
        empName: newReview.empName,
        department: newReview.department,
        period: newReview.period,
        rating: Number(newReview.rating),
        reviewer: newReview.reviewer,
        status: "Draft",
        workQuality: 75,
        punctuality: 80,
        teamwork: 70,
        communication: 78,
      },
    ]);
    toast.success("Review added");
    setShowAdd(false);
    setNewReview({
      empName: "",
      department: "",
      period: "Q1 2025-26",
      rating: "4",
      reviewer: "",
    });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Performance Reviews
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Employee performance evaluation and ratings
            </p>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Review
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search employee..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {[
                    "Employee",
                    "Dept",
                    "Period",
                    "Rating",
                    ...SCORE_LABELS,
                    "Reviewer",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((r, i) => (
                  <tr
                    key={r.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-3 py-2.5 font-medium text-gray-700 whitespace-nowrap">
                      {r.empName}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs">
                      {r.department}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs">
                      {r.period}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, j) => (
                          <Star
                            key={`star-${r.id}-${j}`}
                            className={`w-3.5 h-3.5 ${j < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </td>
                    {SCORE_KEYS.map((key) => (
                      <td key={key} className="px-3 py-2.5 w-28">
                        <div className="flex items-center gap-1.5">
                          <Progress
                            value={Number(r[key])}
                            className="h-1.5 flex-1"
                          />
                          <span className="text-xs text-gray-500 w-8">
                            {r[key]}%
                          </span>
                        </div>
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-gray-600 text-xs">
                      {r.reviewer}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] ?? ""}`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">{filtered.length} reviews</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="px-3 py-1.5 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Performance Review</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2">
              <Label className="text-xs">Employee Name *</Label>
              <Input
                className="mt-1"
                value={newReview.empName}
                onChange={(e) =>
                  setNewReview((r) => ({ ...r, empName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-xs">Department</Label>
              <Input
                className="mt-1"
                value={newReview.department}
                onChange={(e) =>
                  setNewReview((r) => ({ ...r, department: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-xs">Review Period</Label>
              <Select
                value={newReview.period}
                onValueChange={(v) =>
                  setNewReview((r) => ({ ...r, period: v }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Q1 2025-26",
                    "Q2 2025-26",
                    "Q3 2025-26",
                    "Annual 2024-25",
                  ].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Rating (1-5)</Label>
              <Select
                value={newReview.rating}
                onValueChange={(v) =>
                  setNewReview((r) => ({ ...r, rating: v }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n} Stars
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Reviewer</Label>
              <Input
                className="mt-1"
                value={newReview.reviewer}
                onChange={(e) =>
                  setNewReview((r) => ({ ...r, reviewer: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAdd}
            >
              Add Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
