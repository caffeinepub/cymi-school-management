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
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Briefcase,
  Download,
  Eye,
  Laptop,
  Plus,
  Scale,
  Shield,
  Umbrella,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import { useCallerUserProfile, useLogout } from "../../hooks/useQueries";

type Policy = {
  id: number;
  title: string;
  description: string;
  iconKey: string;
  lastUpdated: string;
  version: string;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  leave: <BookOpen className="w-6 h-6" />,
  conduct: <Scale className="w-6 h-6" />,
  travel: <Briefcase className="w-6 h-6" />,
  wfh: <Umbrella className="w-6 h-6" />,
  anti: <Shield className="w-6 h-6" />,
  it: <Laptop className="w-6 h-6" />,
};
const ICON_COLORS = [
  "bg-blue-50 text-blue-600",
  "bg-green-50 text-green-600",
  "bg-purple-50 text-purple-600",
  "bg-amber-50 text-amber-600",
  "bg-red-50 text-red-600",
  "bg-indigo-50 text-indigo-600",
];
const ICON_KEYS = Object.keys(ICON_MAP);

const INITIAL_POLICIES: Policy[] = [
  {
    id: 1,
    iconKey: "leave",
    title: "Leave Policy",
    description:
      "Guidelines for applying, approving, and managing employee leaves including CL, SL, EL, and LWP entitlements.",
    lastUpdated: "2025-04-01",
    version: "v3.2",
  },
  {
    id: 2,
    iconKey: "conduct",
    title: "Code of Conduct",
    description:
      "Expected behavior standards, professional ethics, and disciplinary procedures for all employees.",
    lastUpdated: "2025-01-15",
    version: "v2.1",
  },
  {
    id: 3,
    iconKey: "travel",
    title: "Travel Policy",
    description:
      "Guidelines for official travel reimbursement, booking procedures, and per diem allowances.",
    lastUpdated: "2024-11-20",
    version: "v1.5",
  },
  {
    id: 4,
    iconKey: "wfh",
    title: "Work From Home Policy",
    description:
      "Rules and procedures for remote work arrangements, approval process, and performance expectations.",
    lastUpdated: "2025-03-10",
    version: "v1.3",
  },
  {
    id: 5,
    iconKey: "anti",
    title: "Anti-Harassment Policy",
    description:
      "Zero-tolerance policy against workplace harassment, reporting mechanisms, and grievance procedures.",
    lastUpdated: "2025-02-28",
    version: "v2.0",
  },
  {
    id: 6,
    iconKey: "it",
    title: "IT Security Policy",
    description:
      "Guidelines for acceptable use of IT resources, data protection, password policies, and cybersecurity protocols.",
    lastUpdated: "2025-03-25",
    version: "v1.8",
  },
];

export default function HRPoliciesPage() {
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

  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [showAdd, setShowAdd] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ title: "", description: "" });

  function handleAdd() {
    if (!newPolicy.title) {
      toast.error("Title required");
      return;
    }
    const id = Math.max(...policies.map((p) => p.id)) + 1;
    setPolicies((p) => [
      ...p,
      {
        id,
        iconKey: "leave",
        title: newPolicy.title,
        description: newPolicy.description,
        lastUpdated: new Date().toISOString().split("T")[0],
        version: "v1.0",
      },
    ]);
    toast.success("Policy added");
    setShowAdd(false);
    setNewPolicy({ title: "", description: "" });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">HR Policies</h1>
            <p className="text-gray-500 text-sm mt-1">
              Company policies and employee guidelines
            </p>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Policy
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {policies.map((policy, i) => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${ICON_COLORS[i % ICON_COLORS.length]}`}
              >
                {ICON_MAP[ICON_KEYS[i % ICON_KEYS.length]]}
              </div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{policy.title}</h3>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                  {policy.version}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                {policy.description}
              </p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">
                  Updated: {policy.lastUpdated}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-blue-500"
                    onClick={() => toast.success(`Viewing ${policy.title}`)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-green-600"
                    onClick={() => toast.success(`Downloading ${policy.title}`)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Policy Title *</Label>
              <Input
                className="mt-1"
                value={newPolicy.title}
                onChange={(e) =>
                  setNewPolicy((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={newPolicy.description}
                onChange={(e) =>
                  setNewPolicy((p) => ({ ...p, description: e.target.value }))
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
              Add Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
