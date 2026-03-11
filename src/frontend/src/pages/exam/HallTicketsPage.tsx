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

const STUDENTS = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  admNo: `CYMI${String(2024000 + i + 1)}`,
  name: [
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
  ][i],
  class: String((i % 12) + 1),
  section: ["A", "B", "C", "D"][i % 4],
  dob: `${2005 + (i % 5)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
  photo: "",
  examName: ["Unit Test 1", "Mid Term", "Final Exam", "Annual Exam"][i % 4],
  hallNo: `H${String(i + 101)}`,
  seatNo: `S${String(i + 1).padStart(3, "0")}`,
  issued: i % 3 !== 0,
}));

export default function HallTicketsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [students] = useState(STUDENTS);
  const [viewTicket, setViewTicket] = useState<(typeof STUDENTS)[0] | null>(
    null,
  );

  const filtered = students.filter(
    (s) =>
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.admNo.includes(search)) &&
      (filterClass ? s.class === filterClass : true) &&
      (filterExam ? s.examName === filterExam : true),
  );

  const issued = students.filter((s) => s.issued).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hall Tickets</h1>
          <p className="text-sm text-gray-500">
            Generate and manage student hall tickets
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
          <span className="text-sm text-gray-600">Hall Tickets</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Students",
              value: students.length,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Issued",
              value: issued,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Pending",
              value: students.length - issued,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Exam Groups",
              value: 4,
              color: "text-purple-600",
              bg: "bg-purple-50",
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
              data-ocid="hall_tickets.search_input"
              placeholder="Search by name or admission no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <select
              data-ocid="hall_tickets.class.select"
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
              data-ocid="hall_tickets.exam.select"
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
            data-ocid="hall_tickets.print_all_button"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => window.print()}
          >
            Print All
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "#",
                  "Adm. No.",
                  "Student Name",
                  "Class",
                  "Exam",
                  "Hall No.",
                  "Seat No.",
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
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  data-ocid={`hall_tickets.row.${i + 1}`}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.admNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {s.name}
                  </td>
                  <td className="px-4 py-3">
                    Class {s.class}-{s.section}
                  </td>
                  <td className="px-4 py-3">{s.examName}</td>
                  <td className="px-4 py-3">{s.hallNo}</td>
                  <td className="px-4 py-3">{s.seatNo}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${s.issued ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {s.issued ? "Issued" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      data-ocid={`hall_tickets.view_button.${i + 1}`}
                      onClick={() => setViewTicket(s)}
                      className="text-blue-600 hover:text-blue-800 text-xs border border-blue-200 px-2 py-1 rounded"
                    >
                      View Ticket
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-8 text-gray-400"
                    data-ocid="hall_tickets.empty_state"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hall Ticket Modal */}
      <Dialog open={!!viewTicket} onOpenChange={() => setViewTicket(null)}>
        <DialogContent className="max-w-md" data-ocid="hall_tickets.dialog">
          <DialogHeader>
            <DialogTitle>Hall Ticket</DialogTitle>
          </DialogHeader>
          {viewTicket && (
            <div className="border rounded-lg p-4">
              <div className="text-center border-b pb-3 mb-3">
                <p className="font-bold text-lg text-blue-700">
                  CYMI Computer Institute
                </p>
                <p className="text-sm text-gray-600">Hall Ticket</p>
                <p className="text-sm font-medium">
                  {viewTicket.examName} Examination
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Adm. No.:</span>{" "}
                  <span className="font-medium">{viewTicket.admNo}</span>
                </div>
                <div>
                  <span className="text-gray-500">Name:</span>{" "}
                  <span className="font-medium">{viewTicket.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Class:</span>{" "}
                  <span className="font-medium">
                    {viewTicket.class}-{viewTicket.section}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">DOB:</span>{" "}
                  <span className="font-medium">
                    {new Date(viewTicket.dob).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Hall No.:</span>{" "}
                  <span className="font-bold text-blue-700">
                    {viewTicket.hallNo}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Seat No.:</span>{" "}
                  <span className="font-bold text-blue-700">
                    {viewTicket.seatNo}
                  </span>
                </div>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Status:{" "}
                  <span
                    className={`font-medium ${viewTicket.issued ? "text-green-600" : "text-yellow-600"}`}
                  >
                    {viewTicket.issued ? "Issued" : "Pending"}
                  </span>
                </p>
                <p className="text-xs text-gray-400">Principal / Coordinator</p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <Button
              data-ocid="hall_tickets.close_button"
              variant="outline"
              onClick={() => setViewTicket(null)}
            >
              Close
            </Button>
            <Button
              data-ocid="hall_tickets.print_button"
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
