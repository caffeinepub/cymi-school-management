import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

const allSms = Array.from({ length: 40 }, (_, i) => {
  const groups = [
    "All Students",
    "All Parents",
    "All Teachers",
    "Class 10",
    "Class 12",
    "Class 9",
    "Individual",
    "Class 8",
    "Class 11",
  ];
  const statuses = ["Sent", "Sent", "Sent", "Failed", "Pending"];
  const senders = ["Super Admin", "Admin", "Principal"];
  const messages = [
    "Fees for this month are due. Please pay at the earliest.",
    "Exam schedule has been released. Check the notice board.",
    "School closed tomorrow due to public holiday.",
    "PTM scheduled for next Saturday. Attendance is mandatory.",
    "Result cards distributed. Check the portal for details.",
    "Annual Day celebration on 28th. All students must attend.",
    "Your ward's attendance is below 75%. Please meet the principal.",
    "Library books must be returned by end of this week.",
  ];
  const d = new Date(2026, 2, 11);
  d.setDate(d.getDate() - i);
  return {
    id: i + 1,
    dateTime: `${d.toISOString().slice(0, 10)} ${9 + (i % 8)}:00 AM`,
    sentBy: senders[i % 3],
    group: groups[i % groups.length],
    message: messages[i % messages.length],
    status: statuses[i % statuses.length],
    count: [520, 498, 50, 48, 42, 44, 1, 46, 40][i % 9],
  };
});

const statusColor: Record<string, string> = {
  Sent: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

const PAGE_SIZE = 15;

export default function SmsHistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const filtered = allSms.filter(
    (s) =>
      (s.message.toLowerCase().includes(search.toLowerCase()) ||
        s.group.toLowerCase().includes(search.toLowerCase())) &&
      (filterStatus ? s.status === filterStatus : true),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">SMS History</h1>
            <p className="text-sm text-gray-500">
              Full log of all sent messages
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
          <span className="text-gray-600">SMS / History</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Total Messages",
              value: allSms.length,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Sent",
              value: allSms.filter((s) => s.status === "Sent").length,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Failed / Pending",
              value: allSms.filter((s) => s.status !== "Sent").length,
              color: "text-red-600",
              bg: "bg-red-50",
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
              data-ocid="sms_history.search_input"
              placeholder="Search message or group..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-56"
            />
            <select
              data-ocid="sms_history.status.select"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option>Sent</option>
              <option>Failed</option>
              <option>Pending</option>
            </select>
          </div>
          <button
            type="button"
            data-ocid="sms_history.export_button"
            className="text-sm px-3 py-1.5 border rounded-md text-gray-600 hover:bg-gray-50"
          >
            Export
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "#",
                  "Date/Time",
                  "Sent By",
                  "Recipient Group",
                  "Message",
                  "Status",
                  "Count",
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
              {paged.map((s, i) => (
                <tr
                  key={s.id}
                  data-ocid={`sms_history.row.${i + 1}`}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-500">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {s.dateTime}
                  </td>
                  <td className="px-4 py-3">{s.sentBy}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {s.group}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                    {s.message}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[s.status]}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.count}</td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-gray-400"
                    data-ocid="sms_history.empty_state"
                  >
                    No records found
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
                data-ocid="sms_history.pagination_prev"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded-md text-sm disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                data-ocid="sms_history.pagination_next"
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
