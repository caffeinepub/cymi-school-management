import { Badge } from "@/components/ui/badge";
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

const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const subjects = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Studies",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Geography",
  "Economics",
];
const exams = [
  {
    id: 1,
    name: "Unit Test 1",
    class: "10",
    subject: "Mathematics",
    date: "2026-03-15",
    time: "09:00 AM",
    duration: "2 hrs",
    maxMarks: 50,
    room: "Hall A",
    status: "Upcoming",
  },
  {
    id: 2,
    name: "Unit Test 1",
    class: "10",
    subject: "Science",
    date: "2026-03-17",
    time: "09:00 AM",
    duration: "2 hrs",
    maxMarks: 50,
    room: "Hall B",
    status: "Upcoming",
  },
  {
    id: 3,
    name: "Mid Term",
    class: "9",
    subject: "English",
    date: "2026-03-20",
    time: "10:00 AM",
    duration: "3 hrs",
    maxMarks: 100,
    room: "Hall A",
    status: "Upcoming",
  },
  {
    id: 4,
    name: "Mid Term",
    class: "9",
    subject: "Hindi",
    date: "2026-03-22",
    time: "10:00 AM",
    duration: "3 hrs",
    maxMarks: 100,
    room: "Hall C",
    status: "Upcoming",
  },
  {
    id: 5,
    name: "Unit Test 1",
    class: "8",
    subject: "Mathematics",
    date: "2026-03-18",
    time: "09:00 AM",
    duration: "2 hrs",
    maxMarks: 50,
    room: "Hall B",
    status: "Upcoming",
  },
  {
    id: 6,
    name: "Final Exam",
    class: "12",
    subject: "Physics",
    date: "2026-04-10",
    time: "10:00 AM",
    duration: "3 hrs",
    maxMarks: 100,
    room: "Main Hall",
    status: "Scheduled",
  },
  {
    id: 7,
    name: "Final Exam",
    class: "12",
    subject: "Chemistry",
    date: "2026-04-12",
    time: "10:00 AM",
    duration: "3 hrs",
    maxMarks: 100,
    room: "Main Hall",
    status: "Scheduled",
  },
  {
    id: 8,
    name: "Final Exam",
    class: "12",
    subject: "Mathematics",
    date: "2026-04-14",
    time: "10:00 AM",
    duration: "3 hrs",
    maxMarks: 100,
    room: "Main Hall",
    status: "Scheduled",
  },
  {
    id: 9,
    name: "Unit Test 2",
    class: "11",
    subject: "Economics",
    date: "2026-03-25",
    time: "11:00 AM",
    duration: "2 hrs",
    maxMarks: 50,
    room: "Hall D",
    status: "Upcoming",
  },
  {
    id: 10,
    name: "Mid Term",
    class: "6",
    subject: "Social Studies",
    date: "2026-03-19",
    time: "09:00 AM",
    duration: "2 hrs",
    maxMarks: 80,
    room: "Hall E",
    status: "Upcoming",
  },
  {
    id: 11,
    name: "Annual Exam",
    class: "5",
    subject: "Mathematics",
    date: "2026-04-20",
    time: "09:00 AM",
    duration: "2.5 hrs",
    maxMarks: 100,
    room: "Hall F",
    status: "Scheduled",
  },
  {
    id: 12,
    name: "Annual Exam",
    class: "5",
    subject: "English",
    date: "2026-04-22",
    time: "09:00 AM",
    duration: "2.5 hrs",
    maxMarks: 100,
    room: "Hall F",
    status: "Scheduled",
  },
  {
    id: 13,
    name: "Unit Test 1",
    class: "7",
    subject: "History",
    date: "2026-03-16",
    time: "11:00 AM",
    duration: "1.5 hrs",
    maxMarks: 40,
    room: "Hall G",
    status: "Completed",
  },
  {
    id: 14,
    name: "Unit Test 1",
    class: "7",
    subject: "Geography",
    date: "2026-03-14",
    time: "11:00 AM",
    duration: "1.5 hrs",
    maxMarks: 40,
    room: "Hall G",
    status: "Completed",
  },
  {
    id: 15,
    name: "Practical Exam",
    class: "11",
    subject: "Biology",
    date: "2026-03-28",
    time: "02:00 PM",
    duration: "3 hrs",
    maxMarks: 30,
    room: "Lab 1",
    status: "Upcoming",
  },
];

const statusColor: Record<string, string> = {
  Upcoming: "bg-blue-100 text-blue-700",
  Scheduled: "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function ExamSchedulePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [list, setList] = useState(exams);
  const [form, setForm] = useState({
    name: "",
    class: "",
    subject: "",
    date: "",
    time: "",
    duration: "",
    maxMarks: "",
    room: "",
    status: "Upcoming",
  });
  const [editId, setEditId] = useState<number | null>(null);

  const filtered = list.filter(
    (e) =>
      (e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.subject.toLowerCase().includes(search.toLowerCase())) &&
      (filterClass ? e.class === filterClass : true) &&
      (filterStatus ? e.status === filterStatus : true),
  );

  function openAdd() {
    setForm({
      name: "",
      class: "",
      subject: "",
      date: "",
      time: "",
      duration: "",
      maxMarks: "",
      room: "",
      status: "Upcoming",
    });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(e: (typeof exams)[0]) {
    setForm({
      name: e.name,
      class: e.class,
      subject: e.subject,
      date: e.date,
      time: e.time,
      duration: e.duration,
      maxMarks: String(e.maxMarks),
      room: e.room,
      status: e.status,
    });
    setEditId(e.id);
    setModalOpen(true);
  }
  function handleDelete(id: number) {
    setList((l) => l.filter((e) => e.id !== id));
  }
  function handleSave() {
    if (editId !== null) {
      setList((l) =>
        l.map((e) =>
          e.id === editId
            ? { ...e, ...form, maxMarks: Number(form.maxMarks) }
            : e,
        ),
      );
    } else {
      setList((l) => [
        ...l,
        { id: Date.now(), ...form, maxMarks: Number(form.maxMarks) },
      ]);
    }
    setModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Exam Schedule</h1>
          <p className="text-sm text-gray-500">
            Manage and view all exam schedules
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
          <span className="text-sm text-gray-600">Exam Schedule</span>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Exams",
              value: list.length,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Upcoming",
              value: list.filter((e) => e.status === "Upcoming").length,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Scheduled",
              value: list.filter((e) => e.status === "Scheduled").length,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            {
              label: "Completed",
              value: list.filter((e) => e.status === "Completed").length,
              color: "text-green-600",
              bg: "bg-green-50",
            },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <p className="text-sm text-gray-600">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <Input
              data-ocid="exam_schedule.search_input"
              placeholder="Search exam or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56"
            />
            <select
              data-ocid="exam_schedule.class.select"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
            <select
              data-ocid="exam_schedule.status.select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option>Upcoming</option>
              <option>Scheduled</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
          <Button
            data-ocid="exam_schedule.add_button"
            onClick={openAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            + Add Exam
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "#",
                  "Exam Name",
                  "Class",
                  "Subject",
                  "Date",
                  "Time",
                  "Duration",
                  "Max Marks",
                  "Room",
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
              {filtered.map((e, i) => (
                <tr
                  key={e.id}
                  data-ocid={`exam_schedule.row.${i + 1}`}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {e.name}
                  </td>
                  <td className="px-4 py-3">Class {e.class}</td>
                  <td className="px-4 py-3">{e.subject}</td>
                  <td className="px-4 py-3">
                    {new Date(e.date).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">{e.time}</td>
                  <td className="px-4 py-3">{e.duration}</td>
                  <td className="px-4 py-3">{e.maxMarks}</td>
                  <td className="px-4 py-3">{e.room}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[e.status]}`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        data-ocid={`exam_schedule.edit_button.${i + 1}`}
                        onClick={() => openEdit(e)}
                        className="text-blue-600 hover:text-blue-800 text-xs border border-blue-200 px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        data-ocid={`exam_schedule.delete_button.${i + 1}`}
                        onClick={() => handleDelete(e.id)}
                        className="text-red-600 hover:text-red-800 text-xs border border-red-200 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="text-center py-8 text-gray-400"
                    data-ocid="exam_schedule.empty_state"
                  >
                    No exams found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg" data-ocid="exam_schedule.dialog">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Exam" : "Add Exam"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {(
              [
                ["Exam Name", "name", "text"],
                ["Class", "class", "select-class"],
                ["Subject", "subject", "select-subject"],
                ["Date", "date", "date"],
                ["Time", "time", "time"],
                ["Duration", "duration", "text"],
                ["Max Marks", "maxMarks", "number"],
                ["Room", "room", "text"],
                ["Status", "status", "select-status"],
              ] as [string, keyof typeof form, string][]
            ).map(([label, key, type]) => (
              <div key={key} className="flex flex-col gap-1">
                <label
                  htmlFor={key}
                  className="text-xs font-medium text-gray-600"
                >
                  {label}
                </label>
                {type === "select-class" ? (
                  <select
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className="border rounded px-2 py-1.5 text-sm"
                  >
                    <option value="">Select</option>
                    {classes.map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                ) : type === "select-subject" ? (
                  <select
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className="border rounded px-2 py-1.5 text-sm"
                  >
                    <option value="">Select</option>
                    {subjects.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                ) : type === "select-status" ? (
                  <select
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className="border rounded px-2 py-1.5 text-sm"
                  >
                    <option>Upcoming</option>
                    <option>Scheduled</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                ) : (
                  <Input
                    type={type}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              data-ocid="exam_schedule.cancel_button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="exam_schedule.save_button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
