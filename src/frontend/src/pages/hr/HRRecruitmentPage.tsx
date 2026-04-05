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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import {
  APPLICANTS,
  type Applicant,
  JOB_OPENINGS,
  type JobOpening,
} from "../../data/accountsData";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

const STAGES = ["Applied", "Shortlisted", "Interviewed", "Offered", "Joined"];
const STAGE_COLORS: Record<string, string> = {
  Applied: "bg-gray-100 text-gray-600",
  Shortlisted: "bg-blue-100 text-blue-700",
  Interviewed: "bg-purple-100 text-purple-700",
  Offered: "bg-amber-100 text-amber-700",
  Joined: "bg-green-100 text-green-700",
};
const JOB_STATUS_COLORS: Record<string, string> = {
  Open: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-600",
  "On Hold": "bg-amber-100 text-amber-700",
};

export default function HRRecruitmentPage() {
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

  const [jobs, setJobs] = useState<JobOpening[]>(JOB_OPENINGS);
  const [applicants] = useState<Applicant[]>(APPLICANTS);
  const [pipelineJob, setPipelineJob] = useState<JobOpening | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newJob, setNewJob] = useState({
    position: "",
    department: "",
    openings: "1",
  });

  function handleAddJob() {
    if (!newJob.position || !newJob.department) {
      toast.error("Fill all fields");
      return;
    }
    const id = Math.max(...jobs.map((j) => j.id)) + 1;
    setJobs((j) => [
      ...j,
      {
        id,
        position: newJob.position,
        department: newJob.department,
        openings: Number(newJob.openings),
        applications: 0,
        status: "Open",
      },
    ]);
    toast.success("Job opening added");
    setShowAdd(false);
    setNewJob({ position: "", department: "", openings: "1" });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Recruitment</h1>
            <p className="text-gray-500 text-sm mt-1">
              Job openings and applicant pipeline
            </p>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> New Position
          </Button>
        </div>

        {!pipelineJob ? (
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
                      "Position",
                      "Department",
                      "Openings",
                      "Applications",
                      "Status",
                      "Pipeline",
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
                  {jobs.map((j, i) => (
                    <tr
                      key={j.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {j.position}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {j.department}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {j.openings}
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-700">
                        {j.applications}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${JOB_STATUS_COLORS[j.status] ?? ""}`}
                        >
                          {j.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-blue-600"
                          onClick={() => setPipelineJob(j)}
                        >
                          View Pipeline{" "}
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPipelineJob(null)}
              >
                \u2190 Back
              </Button>
              <h2 className="font-semibold text-gray-700">
                {pipelineJob.position} — Pipeline
              </h2>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {STAGES.map((stage) => {
                const stageApps = applicants.filter(
                  (a) => a.jobId === pipelineJob.id && a.stage === stage,
                );
                return (
                  <div
                    key={stage}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div
                      className={`px-3 py-2 rounded-t-xl text-xs font-semibold ${STAGE_COLORS[stage]}`}
                    >
                      {stage} ({stageApps.length})
                    </div>
                    <div className="p-2 space-y-2 min-h-32">
                      {stageApps.length === 0 ? (
                        <p className="text-xs text-gray-300 text-center pt-4">
                          No candidates
                        </p>
                      ) : (
                        stageApps.map((a) => (
                          <div
                            key={a.id}
                            className="bg-gray-50 rounded-lg p-2 text-xs"
                          >
                            <p className="font-medium text-gray-700">
                              {a.name}
                            </p>
                            <p className="text-gray-400">{a.applied}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Position</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2">
              <Label className="text-xs">Position Title *</Label>
              <Input
                className="mt-1"
                value={newJob.position}
                onChange={(e) =>
                  setNewJob((j) => ({ ...j, position: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-xs">Department *</Label>
              <Input
                className="mt-1"
                value={newJob.department}
                onChange={(e) =>
                  setNewJob((j) => ({ ...j, department: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-xs">No. of Openings</Label>
              <Input
                type="number"
                className="mt-1"
                value={newJob.openings}
                onChange={(e) =>
                  setNewJob((j) => ({ ...j, openings: e.target.value }))
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
              onClick={handleAddJob}
            >
              Add Position
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
