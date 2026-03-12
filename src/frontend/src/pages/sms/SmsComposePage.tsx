import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";

const templates = [
  {
    label: "Fee Reminder",
    text: "Dear Parent, fees for this month are due. Please pay at the earliest to avoid late charges.",
  },
  {
    label: "Holiday Notice",
    text: "The school will remain closed on [date] due to [reason]. Classes will resume on [next date].",
  },
  {
    label: "Exam Alert",
    text: "Exams begin on [date]. Please ensure your ward is prepared and carries their hall ticket.",
  },
  {
    label: "PTM Invite",
    text: "Parent-Teacher Meeting is scheduled on [date] at [time]. Your presence is requested.",
  },
];

const sentHistory = [
  {
    id: 1,
    date: "2026-03-10",
    group: "All Students",
    message: "Fees for March are due. Please pay at the earliest.",
    status: "Sent",
    count: 520,
  },
  {
    id: 2,
    date: "2026-03-08",
    group: "Class 10",
    message: "Board exam schedule has been released. Check the notice board.",
    status: "Sent",
    count: 48,
  },
  {
    id: 3,
    date: "2026-03-05",
    group: "All Teachers",
    message: "Staff meeting scheduled for 10 March at 11 AM.",
    status: "Sent",
    count: 50,
  },
  {
    id: 4,
    date: "2026-03-01",
    group: "All Parents",
    message: "School will remain closed on 5 March for Holi.",
    status: "Sent",
    count: 498,
  },
  {
    id: 5,
    date: "2026-02-28",
    group: "Class 12",
    message: "Practical exams begin from 3 March. Carry hall tickets.",
    status: "Failed",
    count: 42,
  },
  {
    id: 6,
    date: "2026-02-25",
    group: "Individual",
    message: "Your ward's attendance is below 75%. Please meet the principal.",
    status: "Sent",
    count: 1,
  },
  {
    id: 7,
    date: "2026-02-20",
    group: "All Students",
    message: "Annual Day celebration on 28 February. All students must attend.",
    status: "Sent",
    count: 520,
  },
  {
    id: 8,
    date: "2026-02-15",
    group: "Class 9",
    message: "Result cards will be distributed on 20 February.",
    status: "Pending",
    count: 44,
  },
  {
    id: 9,
    date: "2026-02-10",
    group: "All Parents",
    message: "PTM scheduled for 15 February from 9 AM to 1 PM.",
    status: "Sent",
    count: 498,
  },
  {
    id: 10,
    date: "2026-02-05",
    group: "All Teachers",
    message: "Please submit lesson plans for Q4 by 8 February.",
    status: "Sent",
    count: 50,
  },
  {
    id: 11,
    date: "2026-01-30",
    group: "Class 11",
    message:
      "Chemistry lab practical test on 2 February. Attendance mandatory.",
    status: "Sent",
    count: 40,
  },
  {
    id: 12,
    date: "2026-01-25",
    group: "Individual",
    message: "Fee receipt for January has been generated. Check the portal.",
    status: "Sent",
    count: 1,
  },
  {
    id: 13,
    date: "2026-01-20",
    group: "All Students",
    message: "Republic Day programme on 26 January. Dress code: white.",
    status: "Sent",
    count: 520,
  },
  {
    id: 14,
    date: "2026-01-15",
    group: "Class 8",
    message: "Unit test 2 schedule is now available. Check the notice board.",
    status: "Failed",
    count: 46,
  },
  {
    id: 15,
    date: "2026-01-10",
    group: "All Parents",
    message: "New academic calendar for 2026 has been uploaded to the portal.",
    status: "Sent",
    count: 498,
  },
];

const statusColor: Record<string, string> = {
  Sent: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

export default function SmsComposePage() {
  const navigate = useNavigate();
  const [recipientType, setRecipientType] = useState("All Students");
  const [selectedClass, setSelectedClass] = useState("1");
  const [individualPhone, setIndividualPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setMessage("");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">SMS Management</h1>
            <p className="text-sm text-gray-500">
              Compose and send SMS to students, parents, and staff
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
          <span className="text-gray-600">SMS / Compose</span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Compose SMS</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="recipient_group"
                  className="text-xs font-medium text-gray-600 block mb-1"
                >
                  Recipient Group
                </label>
                <select
                  id="recipient_group"
                  data-ocid="sms_compose.recipient.select"
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm w-full"
                >
                  <option>All Students</option>
                  <option>All Parents</option>
                  <option>All Teachers</option>
                  <option>Class-wise</option>
                  <option>Individual</option>
                </select>
              </div>

              {recipientType === "Class-wise" && (
                <div>
                  <label
                    htmlFor="class_select"
                    className="text-xs font-medium text-gray-600 block mb-1"
                  >
                    Select Class
                  </label>
                  <select
                    id="class_select"
                    data-ocid="sms_compose.class.select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm w-full"
                  >
                    {[
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "10",
                      "11",
                      "12",
                    ].map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {recipientType === "Individual" && (
                <div>
                  <label
                    htmlFor="individual_phone"
                    className="text-xs font-medium text-gray-600 block mb-1"
                  >
                    Phone Number
                  </label>
                  <Input
                    id="individual_phone"
                    data-ocid="sms_compose.phone.input"
                    placeholder="Enter phone number"
                    value={individualPhone}
                    onChange={(e) => setIndividualPhone(e.target.value)}
                  />
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-gray-600 block mb-1">
                  Message Templates
                </p>
                <div className="flex flex-wrap gap-2">
                  {templates.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      data-ocid="sms_compose.template.button"
                      onClick={() => setMessage(t.text)}
                      className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="sms_message"
                  className="text-xs font-medium text-gray-600 block mb-1"
                >
                  Message{" "}
                  <span
                    className={
                      message.length > 160 ? "text-red-500" : "text-gray-400"
                    }
                  >
                    {message.length}/160
                  </span>
                </label>
                <textarea
                  id="sms_message"
                  data-ocid="sms_compose.message.textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={160}
                  placeholder="Type your message here..."
                  className="border rounded-md px-3 py-2 text-sm w-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {sent && (
                <div
                  data-ocid="sms_compose.success_state"
                  className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-sm text-green-700"
                >
                  SMS sent successfully!
                </div>
              )}

              <Button
                data-ocid="sms_compose.send_button"
                onClick={handleSend}
                disabled={!message.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 justify-center"
              >
                <Send className="w-4 h-4" /> Send SMS
              </Button>
            </div>
          </div>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                Recent Sent Messages
              </h2>
              <button
                type="button"
                data-ocid="sms_compose.export_button"
                className="text-sm px-3 py-1.5 border rounded-md text-gray-600 hover:bg-gray-50"
              >
                Export
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[
                    "Date",
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
                {sentHistory.map((s, i) => (
                  <tr
                    key={s.id}
                    data-ocid={`sms_compose.row.${i + 1}`}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(s.date).toLocaleDateString("en-IN")}
                    </td>
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
