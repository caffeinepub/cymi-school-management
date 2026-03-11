import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Studies",
];

function grade(marks: number, max: number) {
  const pct = (marks / max) * 100;
  if (pct >= 90) return { g: "A+", color: "text-green-700 bg-green-100" };
  if (pct >= 75) return { g: "A", color: "text-blue-700 bg-blue-100" };
  if (pct >= 60) return { g: "B", color: "text-yellow-700 bg-yellow-100" };
  if (pct >= 45) return { g: "C", color: "text-orange-700 bg-orange-100" };
  return { g: "F", color: "text-red-700 bg-red-100" };
}

const RESULTS = Array.from({ length: 40 }, (_, i) => {
  const names = [
    "Aarav Sharma",
    "Priya Patel",
    "Rohan Gupta",
    "Sneha Iyer",
    "Arjun Singh",
    "Kavya Nair",
    "Vikram Reddy",
    "Ananya Das",
    "Rahul Joshi",
    "Pooja Mehta",
    "Karan Verma",
    "Riya Shah",
    "Aditya Kumar",
    "Divya Pillai",
    "Nikhil Rao",
    "Shreya Agarwal",
    "Siddharth Bose",
    "Anjali Mishra",
    "Kunal Tiwari",
    "Nisha Choudhary",
    "Amit Pandey",
    "Swati Dubey",
    "Rajesh Yadav",
    "Sunita Wagh",
    "Manoj Patil",
    "Geeta Kapoor",
    "Suresh Nayak",
    "Lalita Desai",
    "Vijay Kulkarni",
    "Rekha Sinha",
    "Ankit Sharma",
    "Pooja Singh",
    "Deepak Gupta",
    "Meena Patel",
    "Ravi Kumar",
    "Sonia Rao",
    "Tarun Mishra",
    "Uma Joshi",
    "Varun Tiwari",
    "Asha Dubey",
  ];
  const marks = SUBJECTS.map(() => 40 + Math.floor(Math.random() * 60));
  const total = marks.reduce((a, b) => a + b, 0);
  return {
    id: i + 1,
    admNo: `CYMI${String(2024000 + i + 1)}`,
    name: names[i] || `Student ${i + 1}`,
    class: String((i % 12) + 1),
    section: ["A", "B", "C", "D"][i % 4],
    examName: ["Unit Test 1", "Mid Term", "Final Exam", "Annual Exam"][i % 4],
    marks,
    total,
    maxTotal: SUBJECTS.length * 100,
    percentage: Math.round((total / (SUBJECTS.length * 100)) * 100),
    rank: i + 1,
    published: i % 4 !== 0,
  };
});

export default function ResultsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [viewResult, setViewResult] = useState<(typeof RESULTS)[0] | null>(
    null,
  );

  const filtered = RESULTS.filter(
    (r) =>
      (r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.admNo.includes(search)) &&
      (filterClass ? r.class === filterClass : true) &&
      (filterExam ? r.examName === filterExam : true),
  );

  const published = RESULTS.filter((r) => r.published).length;
  const avgPct = Math.round(
    RESULTS.reduce((a, r) => a + r.percentage, 0) / RESULTS.length,
  );
  const passCount = RESULTS.filter((r) => r.percentage >= 45).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Exam Results</h1>
          <p className="text-sm text-gray-500">
            View and publish student exam results
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="text-sm text-blue-600 hover:underline"
          >
            Dashboard
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-sm text-gray-600">Results</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Results",
              value: RESULTS.length,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Published",
              value: published,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Average %",
              value: `${avgPct}%`,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            {
              label: "Pass Count",
              value: passCount,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <p className="text-sm text-gray-600">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <Input
              data-ocid="results.search_input"
              placeholder="Search by name or admission no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <select
              data-ocid="results.class.select"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Classes</option>
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
            <select
              data-ocid="results.exam.select"
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Exams</option>
              {["Unit Test 1", "Mid Term", "Final Exam", "Annual Exam"].map(
                (e) => (
                  <option key={e}>{e}</option>
                ),
              )}
            </select>
          </div>
          <Button
            data-ocid="results.export_button"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Export Results
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "Rank",
                  "Adm. No.",
                  "Student Name",
                  "Class",
                  "Exam",
                  "Total",
                  "Percentage",
                  "Grade",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const { g, color } = grade(r.total, r.maxTotal);
                return (
                  <tr
                    key={r.id}
                    data-ocid={`results.row.${i + 1}`}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`font-bold ${r.rank <= 3 ? "text-yellow-600" : "text-gray-600"}`}
                      >
                        #{r.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.admNo}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {r.name}
                    </td>
                    <td className="px-4 py-3">
                      Class {r.class}-{r.section}
                    </td>
                    <td className="px-4 py-3">{r.examName}</td>
                    <td className="px-4 py-3">
                      {r.total}/{r.maxTotal}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${r.percentage}%` }}
                          />
                        </div>
                        <span className="font-medium">{r.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${color}`}
                      >
                        {g}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${r.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {r.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        data-ocid={`results.view_button.${i + 1}`}
                        onClick={() => setViewResult(r)}
                        className="text-blue-600 hover:text-blue-800 text-xs border border-blue-200 px-2 py-1 rounded"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center py-8 text-gray-400"
                    data-ocid="results.empty_state"
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!viewResult} onOpenChange={() => setViewResult(null)}>
        <DialogContent className="max-w-lg" data-ocid="results.dialog">
          <DialogHeader>
            <DialogTitle>Result Card</DialogTitle>
          </DialogHeader>
          {viewResult && (
            <div className="border rounded-lg p-4">
              <div className="text-center border-b pb-3 mb-3">
                <p className="font-bold text-lg text-blue-700">
                  CYMI Computer Institute
                </p>
                <p className="text-sm font-medium">
                  {viewResult.examName} -- Result Card
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Name:</span>{" "}
                  <span className="font-medium">{viewResult.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Adm. No.:</span>{" "}
                  <span className="font-medium">{viewResult.admNo}</span>
                </div>
                <div>
                  <span className="text-gray-500">Class:</span>{" "}
                  <span className="font-medium">
                    {viewResult.class}-{viewResult.section}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Rank:</span>{" "}
                  <span className="font-bold text-blue-700">
                    #{viewResult.rank}
                  </span>
                </div>
              </div>
              <table className="w-full text-sm border mb-3">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left border">Subject</th>
                    <th className="px-3 py-2 text-center border">Marks</th>
                    <th className="px-3 py-2 text-center border">Max</th>
                    <th className="px-3 py-2 text-center border">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBJECTS.map((sub, idx) => {
                    const m = viewResult.marks[idx];
                    const { g, color } = grade(m, 100);
                    return (
                      <tr key={sub} className="border">
                        <td className="px-3 py-1.5 border">{sub}</td>
                        <td className="px-3 py-1.5 text-center border font-medium">
                          {m}
                        </td>
                        <td className="px-3 py-1.5 text-center border text-gray-400">
                          100
                        </td>
                        <td className="px-3 py-1.5 text-center border">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}
                          >
                            {g}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-3 py-2 border">Total</td>
                    <td className="px-3 py-2 text-center border">
                      {viewResult.total}
                    </td>
                    <td className="px-3 py-2 text-center border">
                      {viewResult.maxTotal}
                    </td>
                    <td className="px-3 py-2 text-center border">
                      {viewResult.percentage}%
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  Status:{" "}
                  <span
                    className={
                      viewResult.published
                        ? "text-green-600 font-medium"
                        : "text-gray-500 font-medium"
                    }
                  >
                    {viewResult.published ? "Published" : "Draft"}
                  </span>
                </span>
                <span>Principal / Coordinator</span>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <Button
              data-ocid="results.close_button"
              variant="outline"
              onClick={() => setViewResult(null)}
            >
              Close
            </Button>
            <Button
              data-ocid="results.print_button"
              className="bg-blue-600 text-white"
              onClick={() => window.print()}
            >
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
