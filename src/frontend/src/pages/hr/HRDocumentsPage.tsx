import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { Download, Eye, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { HR_DOCUMENTS, HR_EMPLOYEES } from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const STATUS_COLORS: Record<string, string> = {
  Valid: "bg-green-100 text-green-700",
  "Expiring Soon": "bg-amber-100 text-amber-700",
  Expired: "bg-red-100 text-red-700",
};

export default function HRDocumentsPage() {
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

  const empOptions = HR_EMPLOYEES.slice(0, 8);
  const [selectedEmp, setSelectedEmp] = useState(
    String(empOptions[0]?.id ?? "1"),
  );

  const docs = useMemo(
    () => HR_DOCUMENTS.filter((d) => String(d.empId) === selectedEmp),
    [selectedEmp],
  );
  const emp = empOptions.find((e) => String(e.id) === selectedEmp);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Employee Documents
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage employee document repository
            </p>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => toast.success("Upload dialog opened")}
          >
            <Upload className="w-4 h-4 mr-1" /> Upload Document
          </Button>
        </div>

        <div className="mb-5">
          <Select value={selectedEmp} onValueChange={setSelectedEmp}>
            <SelectTrigger className="w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {empOptions.map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>
                  {e.name} ({e.empId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {emp && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
              {emp.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{emp.name}</p>
              <p className="text-xs text-gray-500">
                {emp.empId} • {emp.department} • {emp.designation}
              </p>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "#",
                    "Document Name",
                    "Type",
                    "Upload Date",
                    "Expiry Date",
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
                {docs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No documents found for this employee
                    </td>
                  </tr>
                ) : (
                  docs.map((d, i) => (
                    <tr
                      key={d.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {d.docName}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {d.docType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {d.uploadDate}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {d.expiryDate || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[d.status] ?? ""}`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-blue-500"
                            onClick={() =>
                              toast.success(`Viewing ${d.docName}`)
                            }
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-green-500"
                            onClick={() =>
                              toast.success(`Downloading ${d.docName}`)
                            }
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
