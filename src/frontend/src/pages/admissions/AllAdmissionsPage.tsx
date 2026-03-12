import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useState } from "react";

const names = [
  "Aarav Sharma",
  "Ananya Singh",
  "Arjun Patel",
  "Diya Gupta",
  "Ishaan Verma",
  "Kavya Nair",
  "Lakshmi Reddy",
  "Mohit Kumar",
  "Neha Joshi",
  "Priya Mehta",
  "Rahul Yadav",
  "Riya Agarwal",
  "Rohan Mishra",
  "Sakshi Tiwari",
  "Siddharth Bose",
  "Sneha Pillai",
  "Tanvi Desai",
  "Varun Iyer",
  "Vivek Pandey",
  "Zara Khan",
  "Aditya Chaudhary",
  "Aliya Banerjee",
  "Amit Shah",
  "Anjali Rao",
  "Arun Nambiar",
  "Bhavna Patil",
  "Chetan Saxena",
  "Deepika Shetty",
  "Farhan Qureshi",
  "Gaurav Tomar",
  "Harini Suresh",
  "Harsh Kapoor",
  "Hrithik Malhotra",
  "Isha Trivedi",
  "Jayesh Bhatt",
  "Kiran Menon",
  "Kriti Dubey",
  "Manish Garg",
  "Meena Rajan",
  "Nikhil Awasthi",
  "Nisha Kulkarni",
  "Om Prakash",
  "Pallavi Sinha",
  "Parth Solanki",
  "Pooja Mathur",
  "Raj Choudhary",
  "Rhea Fernandes",
  "Rishabh Tripathi",
  "Sameer Ali",
  "Tanya Ghosh",
];

const guardians = [
  "Suresh Sharma",
  "Ramesh Singh",
  "Vikas Patel",
  "Ajay Gupta",
  "Dinesh Verma",
  "Sunil Nair",
  "Murali Reddy",
  "Ashok Kumar",
  "Pradeep Joshi",
  "Rajesh Mehta",
  "Vijay Yadav",
  "Sanjeev Agarwal",
  "Mohan Mishra",
  "Kishore Tiwari",
  "Bhushan Bose",
  "Girish Pillai",
  "Hemant Desai",
  "Ravi Iyer",
  "Rakesh Pandey",
  "Aziz Khan",
  "Pramod Chaudhary",
  "Imran Banerjee",
  "Manoj Shah",
  "Naresh Rao",
  "Sridhar Nambiar",
  "Yogesh Patil",
  "Vivek Saxena",
  "Ramakant Shetty",
  "Asif Qureshi",
  "Mahesh Tomar",
  "Balaji Suresh",
  "Kamal Kapoor",
  "Nitin Malhotra",
  "Piyush Trivedi",
  "Haresh Bhatt",
  "Babu Menon",
  "Suresh Dubey",
  "Lalit Garg",
  "Rajan Rajan",
  "Ramesh Awasthi",
  "Gopal Kulkarni",
  "Durga Prakash",
  "Santosh Sinha",
  "Kartik Solanki",
  "Dilip Mathur",
  "Sanjay Choudhary",
  "Anthony Fernandes",
  "Mukesh Tripathi",
  "Wahid Ali",
  "Binod Ghosh",
];

const statuses = [
  "Pending",
  "Approved",
  "Rejected",
  "Pending",
  "Approved",
  "Approved",
  "Pending",
  "Rejected",
  "Approved",
  "Pending",
];

const admissions = names.map((name, i) => ({
  id: i + 1,
  appNo: `ADM2026${String(i + 1).padStart(3, "0")}`,
  name,
  classApplied: `Class ${(i % 12) + 1}`,
  guardian: guardians[i],
  phone: `98${String(10000000 + i * 7654321).slice(0, 8)}`,
  dateApplied: new Date(2026, 1, i + 1).toISOString().slice(0, 10),
  status: statuses[i % statuses.length],
}));

const statusColor: Record<string, string> = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
};

const PAGE_SIZE = 20;

export default function AllAdmissionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState(admissions);

  const filtered = list.filter(
    (a) =>
      (a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.appNo.toLowerCase().includes(search.toLowerCase())) &&
      (filterStatus ? a.status === filterStatus : true) &&
      (filterClass ? a.classApplied === filterClass : true),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleApprove(id: number) {
    setList((l) =>
      l.map((a) => (a.id === id ? { ...a, status: "Approved" } : a)),
    );
  }
  function handleReject(id: number) {
    setList((l) =>
      l.map((a) => (a.id === id ? { ...a, status: "Rejected" } : a)),
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserPlus className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">All Admissions</h1>
            <p className="text-sm text-gray-500">
              Manage all student admission applications
            </p>
          </div>
        </div>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="text-blue-600 hover:underline"
          >
            Dashboard
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Admissions</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Total Applications",
              value: list.length,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Approved",
              value: list.filter((a) => a.status === "Approved").length,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Pending",
              value: list.filter((a) => a.status === "Pending").length,
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
              data-ocid="admissions_all.search_input"
              placeholder="Search name or app no..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-56"
            />
            <select
              data-ocid="admissions_all.status.select"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
            <select
              data-ocid="admissions_all.class.select"
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Classes</option>
              {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(
                (c) => (
                  <option key={c}>{c}</option>
                ),
              )}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="admissions_all.export_button"
              className="text-sm px-3 py-1.5 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              Export
            </button>
            <Button
              data-ocid="admissions_all.add_button"
              onClick={() => navigate({ to: "/admissions/new" })}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + New Admission
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "App No",
                  "Student Name",
                  "Class Applied",
                  "Guardian Name",
                  "Phone",
                  "Date Applied",
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
              {paged.map((a, i) => (
                <tr
                  key={a.id}
                  data-ocid={`admissions_all.row.${i + 1}`}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-blue-600 font-mono text-xs">
                    {a.appNo}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {a.name}
                  </td>
                  <td className="px-4 py-3">{a.classApplied}</td>
                  <td className="px-4 py-3 text-gray-600">{a.guardian}</td>
                  <td className="px-4 py-3 text-gray-600">{a.phone}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(a.dateApplied).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {a.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            data-ocid={`admissions_all.edit_button.${i + 1}`}
                            onClick={() => handleApprove(a.id)}
                            className="text-green-600 hover:text-green-800 text-xs border border-green-200 px-2 py-1 rounded"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            data-ocid={`admissions_all.delete_button.${i + 1}`}
                            onClick={() => handleReject(a.id)}
                            className="text-red-600 hover:text-red-800 text-xs border border-red-200 px-2 py-1 rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {a.status !== "Pending" && (
                        <span className="text-xs text-gray-400 italic">
                          Done
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-gray-400"
                    data-ocid="admissions_all.empty_state"
                  >
                    No admissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="admissions_all.pagination_prev"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded-md text-sm disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                data-ocid="admissions_all.pagination_next"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded-md text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
