import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart2,
  Bell,
  BookOpen,
  BookOpenCheck,
  Bus,
  CheckCircle2,
  CreditCard,
  Database,
  Download,
  GraduationCap,
  Info,
  Loader2,
  Megaphone,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Sliders,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";
import { useCallerUserProfile, useLogout } from "../hooks/useQueries";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FeeType {
  id: string;
  name: string;
  amount: number;
}

interface ConcessionCategory {
  id: string;
  name: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "Info" | "Warning" | "Alert";
  expiryDate: string;
}

interface BrandingState {
  schoolName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  academicYear: string;
  logoUrl: string;
  schoolType: string;
}

interface ModuleState {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  color: string;
}

interface AcademicState {
  currentYear: string;
  gradingSystem: string;
  passMark: number;
  maxMarks: number;
  workingDays: number;
  attendanceThreshold: number;
  termsPerYear: string;
}

// ── Default Data ──────────────────────────────────────────────────────────────

const DEFAULT_BRANDING: BrandingState = {
  schoolName: "CYMI Computer Institute",
  tagline: "Empowering Minds, Shaping Futures",
  address: "123 Church Street, Bangalore, Karnataka - 560001",
  phone: "+91 80 4567 8900",
  email: "admin@cymi.edu",
  website: "https://cymi.edu",
  academicYear: "2025-2026",
  logoUrl: "/assets/uploads/cymi-1.PNG",
  schoolType: "CBSE",
};

const DEFAULT_MODULES = [
  {
    id: "students",
    name: "Students",
    description: "Student enrollment, profiles, and records",
    icon: <GraduationCap className="w-5 h-5" />,
    enabled: true,
    color: "blue",
  },
  {
    id: "attendance",
    name: "Attendance",
    description: "Daily attendance tracking and reports",
    icon: <CheckCircle2 className="w-5 h-5" />,
    enabled: true,
    color: "green",
  },
  {
    id: "fee_management",
    name: "Fee Management",
    description: "Fee collection, receipts, and payment history",
    icon: <CreditCard className="w-5 h-5" />,
    enabled: true,
    color: "indigo",
  },
  {
    id: "transportation",
    name: "Transportation",
    description: "Routes, vehicles, drivers, and assignments",
    icon: <Bus className="w-5 h-5" />,
    enabled: true,
    color: "orange",
  },
  {
    id: "exam_management",
    name: "Exam Management",
    description: "Exam schedules, hall tickets, and results",
    icon: <BookOpenCheck className="w-5 h-5" />,
    enabled: false,
    color: "purple",
  },
  {
    id: "library",
    name: "Library",
    description: "Book inventory, issue, and return management",
    icon: <BookOpen className="w-5 h-5" />,
    enabled: false,
    color: "amber",
  },
  {
    id: "staff_hr",
    name: "Staff & HR",
    description: "Staff profiles, payroll, and HR records",
    icon: <Users className="w-5 h-5" />,
    enabled: true,
    color: "teal",
  },
  {
    id: "admissions",
    name: "Admissions",
    description: "New student applications and admissions",
    icon: <GraduationCap className="w-5 h-5" />,
    enabled: true,
    color: "pink",
  },
  {
    id: "reports",
    name: "Reports",
    description: "Analytics, exports, and system reports",
    icon: <BarChart2 className="w-5 h-5" />,
    enabled: true,
    color: "cyan",
  },
  {
    id: "sms_notifications",
    name: "SMS & Notifications",
    description: "Automated SMS and push notification services",
    icon: <Bell className="w-5 h-5" />,
    enabled: false,
    color: "red",
  },
];

const MODULE_COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  indigo: "bg-indigo-100 text-indigo-600",
  orange: "bg-orange-100 text-orange-600",
  purple: "bg-purple-100 text-purple-600",
  amber: "bg-amber-100 text-amber-600",
  teal: "bg-teal-100 text-teal-600",
  pink: "bg-pink-100 text-pink-600",
  cyan: "bg-cyan-100 text-cyan-600",
  red: "bg-red-100 text-red-600",
};

const PERMISSION_MODULES = [
  "Students",
  "Attendance",
  "Fee Management",
  "Transportation",
  "Exam Management",
  "Library",
  "Staff & HR",
  "Reports",
];

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  Students: { Admin: true, Teacher: true, Parent: true, Student: false },
  Attendance: { Admin: true, Teacher: true, Parent: true, Student: true },
  "Fee Management": {
    Admin: true,
    Teacher: false,
    Parent: true,
    Student: false,
  },
  Transportation: {
    Admin: true,
    Teacher: false,
    Parent: true,
    Student: true,
  },
  "Exam Management": {
    Admin: true,
    Teacher: true,
    Parent: true,
    Student: true,
  },
  Library: { Admin: true, Teacher: true, Parent: false, Student: true },
  "Staff & HR": { Admin: true, Teacher: false, Parent: false, Student: false },
  Reports: { Admin: true, Teacher: false, Parent: false, Student: false },
};

const DEFAULT_ACADEMICS: AcademicState = {
  currentYear: "2025-2026",
  gradingSystem: "Percentage",
  passMark: 35,
  maxMarks: 100,
  workingDays: 5,
  attendanceThreshold: 75,
  termsPerYear: "3",
};

const DEFAULT_FEE_TYPES: FeeType[] = [
  { id: "1", name: "Tuition Fee", amount: 12000 },
  { id: "2", name: "Transport Fee", amount: 3000 },
  { id: "3", name: "Library Fee", amount: 500 },
  { id: "4", name: "Lab Fee", amount: 1000 },
  { id: "5", name: "Sports Fee", amount: 750 },
];

const DEFAULT_CONCESSIONS: ConcessionCategory[] = [
  { id: "1", name: "SC/ST" },
  { id: "2", name: "Staff Ward" },
  { id: "3", name: "Merit" },
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    title: "Annual Day Celebration",
    message:
      "Annual Day will be celebrated on 25th March 2026. All students must participate in cultural events.",
    type: "Info",
    expiryDate: "2026-03-25",
  },
  {
    id: "2",
    title: "Fee Due Reminder",
    message:
      "Last date for fee payment for Term 2 is 10th March 2026. Late fee will be charged after this date.",
    type: "Warning",
    expiryDate: "2026-03-10",
  },
  {
    id: "3",
    title: "System Maintenance",
    message:
      "System will be under maintenance on Sunday 8th March from 10PM to 2AM. Please save all work before maintenance window.",
    type: "Alert",
    expiryDate: "2026-03-09",
  },
];

const SYSTEM_LOGS = [
  { time: "09:42:15", event: "User login", user: "superadmin" },
  { time: "09:38:02", event: "Student record updated", user: "admin" },
  { time: "09:35:47", event: "Fee collection recorded", user: "admin" },
  { time: "09:30:11", event: "Attendance marked", user: "teacher1" },
  { time: "09:22:08", event: "New student added", user: "admin" },
  { time: "09:15:33", event: "Report generated", user: "superadmin" },
  { time: "08:58:44", event: "Password changed", user: "parent1" },
  { time: "08:47:21", event: "Module settings saved", user: "superadmin" },
  { time: "08:32:56", event: "Transport route updated", user: "admin" },
  { time: "08:15:10", event: "System backup completed", user: "system" },
];

// ── AnimatedCounter ───────────────────────────────────────────────────────────

function AnimatedCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return <>{display.toLocaleString()}</>;
}

// ── Tab: School Branding ──────────────────────────────────────────────────────

function BrandingTab() {
  const stored = localStorage.getItem("cymi_branding");
  const [branding, setBranding] = useState<BrandingState>(
    stored ? JSON.parse(stored) : DEFAULT_BRANDING,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    localStorage.setItem("cymi_branding", JSON.stringify(branding));
    setSaving(false);
    toast.success("Branding settings saved successfully.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-600" /> School Branding &
            Identity
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Customize your school's identity, contact details, and appearance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="brand-name">School Name</Label>
            <Input
              id="brand-name"
              data-ocid="branding.school_name.input"
              value={branding.schoolName}
              onChange={(e) =>
                setBranding((b) => ({ ...b, schoolName: e.target.value }))
              }
              placeholder="Enter school name"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="brand-tagline">Tagline</Label>
            <Input
              id="brand-tagline"
              data-ocid="branding.tagline.input"
              value={branding.tagline}
              onChange={(e) =>
                setBranding((b) => ({ ...b, tagline: e.target.value }))
              }
              placeholder="School tagline or motto"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="brand-address">Address</Label>
            <Textarea
              id="brand-address"
              data-ocid="branding.address.textarea"
              value={branding.address}
              onChange={(e) =>
                setBranding((b) => ({ ...b, address: e.target.value }))
              }
              rows={2}
              placeholder="Full school address"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand-phone">Phone</Label>
            <Input
              id="brand-phone"
              data-ocid="branding.phone.input"
              value={branding.phone}
              onChange={(e) =>
                setBranding((b) => ({ ...b, phone: e.target.value }))
              }
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand-email">Email</Label>
            <Input
              id="brand-email"
              data-ocid="branding.email.input"
              type="email"
              value={branding.email}
              onChange={(e) =>
                setBranding((b) => ({ ...b, email: e.target.value }))
              }
              placeholder="school@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand-website">Website</Label>
            <Input
              id="brand-website"
              data-ocid="branding.website.input"
              value={branding.website}
              onChange={(e) =>
                setBranding((b) => ({ ...b, website: e.target.value }))
              }
              placeholder="https://yourschool.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand-year">Academic Year</Label>
            <Select
              value={branding.academicYear}
              onValueChange={(v) =>
                setBranding((b) => ({ ...b, academicYear: v }))
              }
            >
              <SelectTrigger
                id="brand-year"
                data-ocid="branding.academic_year.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2025-2026">2025-2026</SelectItem>
                <SelectItem value="2026-2027">2026-2027</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand-logo">Logo URL</Label>
            <Input
              id="brand-logo"
              data-ocid="branding.logo_url.input"
              value={branding.logoUrl}
              onChange={(e) =>
                setBranding((b) => ({ ...b, logoUrl: e.target.value }))
              }
              placeholder="/assets/logo.png"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand-type">School Type / Board</Label>
            <Select
              value={branding.schoolType}
              onValueChange={(v) =>
                setBranding((b) => ({ ...b, schoolType: v }))
              }
            >
              <SelectTrigger
                id="brand-type"
                data-ocid="branding.school_type.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CBSE">CBSE</SelectItem>
                <SelectItem value="ICSE">ICSE</SelectItem>
                <SelectItem value="State Board">State Board</SelectItem>
                <SelectItem value="International">International</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview */}
        {branding.logoUrl && (
          <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Preview
            </p>
            <div className="flex items-center gap-3">
              <img
                src={branding.logoUrl}
                alt="Logo preview"
                className="w-12 h-12 object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div>
                <div className="font-bold text-gray-800">
                  {branding.schoolName || "School Name"}
                </div>
                <div className="text-xs text-gray-500">
                  {branding.tagline || "Your tagline here"}
                </div>
                <div className="text-xs text-blue-600 mt-0.5">
                  {branding.schoolType} • {branding.academicYear}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button
            data-ocid="branding.save_button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {saving ? "Saving…" : "Save Branding"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Tab: Module Management ────────────────────────────────────────────────────

function ModulesTab() {
  const stored = localStorage.getItem("cymi_modules");
  const initialModules = stored ? JSON.parse(stored) : DEFAULT_MODULES;
  const [modules, setModules] = useState<ModuleState[]>(
    initialModules.map((m: ModuleState) => ({
      ...m,
      icon: DEFAULT_MODULES.find((dm) => dm.id === m.id)?.icon ?? (
        <Settings className="w-5 h-5" />
      ),
    })),
  );
  const [saving, setSaving] = useState(false);

  const handleToggle = (id: string, val: boolean) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: val } : m)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    const toStore = modules.map(({ icon: _icon, ...rest }) => rest);
    localStorage.setItem("cymi_modules", JSON.stringify(toStore));
    setSaving(false);
    toast.success(
      `Module settings saved. ${modules.filter((m) => m.enabled).length} modules active.`,
    );
  };

  const enabledCount = modules.filter((m) => m.enabled).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" /> Module Management
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {enabledCount} of {modules.length} modules active
            </p>
          </div>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            {enabledCount} Active
          </Badge>
        </div>

        <div className="space-y-3">
          {modules.map((mod, idx) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${MODULE_COLOR_MAP[mod.color] ?? "bg-gray-100 text-gray-600"}`}
              >
                {mod.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-800">
                  {mod.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {mod.description}
                </div>
              </div>
              <Badge
                className={
                  mod.enabled
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-100"
                }
              >
                {mod.enabled ? "Enabled" : "Disabled"}
              </Badge>
              <Switch
                data-ocid={`modules.${mod.id}.switch`}
                checked={mod.enabled}
                onCheckedChange={(v) => handleToggle(mod.id, v)}
                aria-label={`Toggle ${mod.name}`}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            data-ocid="modules.save_button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {saving ? "Saving…" : "Save Module Settings"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Tab: Role Permissions ─────────────────────────────────────────────────────

function PermissionsTab() {
  const stored = localStorage.getItem("cymi_permissions");
  const [permissions, setPermissions] = useState<
    Record<string, Record<string, boolean>>
  >(stored ? JSON.parse(stored) : DEFAULT_PERMISSIONS);
  const [saving, setSaving] = useState(false);

  const roles = ["Admin", "Teacher", "Parent", "Student"];

  const handleToggle = (mod: string, role: string) => {
    setPermissions((prev) => ({
      ...prev,
      [mod]: {
        ...prev[mod],
        [role]: !prev[mod]?.[role],
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    localStorage.setItem("cymi_permissions", JSON.stringify(permissions));
    setSaving(false);
    toast.success("Role permissions saved successfully.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" /> Role Permissions
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Control which roles can access each module
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table data-ocid="permissions.table">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold text-gray-700 min-w-[160px]">
                  Module
                </TableHead>
                {roles.map((role) => (
                  <TableHead
                    key={role}
                    className="font-bold text-gray-700 text-center"
                  >
                    {role}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSION_MODULES.map((mod, idx) => (
                <TableRow
                  key={mod}
                  data-ocid={`permissions.row.${idx + 1}`}
                  className="hover:bg-blue-50/30"
                >
                  <TableCell className="font-medium text-gray-700 text-sm">
                    {mod}
                  </TableCell>
                  {roles.map((role) => (
                    <TableCell key={role} className="text-center">
                      <Checkbox
                        data-ocid={`permissions.${mod.toLowerCase().replace(/\s+/g, "_")}.${role.toLowerCase()}.checkbox`}
                        checked={permissions[mod]?.[role] ?? false}
                        onCheckedChange={() => handleToggle(mod, role)}
                        aria-label={`${role} can access ${mod}`}
                        className="mx-auto"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            data-ocid="permissions.save_button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {saving ? "Saving…" : "Save Permissions"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Tab: Academic Settings ────────────────────────────────────────────────────

function AcademicsTab() {
  const stored = localStorage.getItem("cymi_academics");
  const [academics, setAcademics] = useState<AcademicState>(
    stored ? JSON.parse(stored) : DEFAULT_ACADEMICS,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    localStorage.setItem("cymi_academics", JSON.stringify(academics));
    setSaving(false);
    toast.success("Academic settings saved.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" /> Academic Settings
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure grading, marking, and academic year parameters
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="acad-year">Current Academic Year</Label>
            <Input
              id="acad-year"
              data-ocid="academics.current_year.input"
              value={academics.currentYear}
              onChange={(e) =>
                setAcademics((a) => ({ ...a, currentYear: e.target.value }))
              }
              placeholder="2025-2026"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acad-terms">Terms per Year</Label>
            <Select
              value={academics.termsPerYear}
              onValueChange={(v) =>
                setAcademics((a) => ({ ...a, termsPerYear: v }))
              }
            >
              <SelectTrigger
                id="acad-terms"
                data-ocid="academics.terms_per_year.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Terms</SelectItem>
                <SelectItem value="3">3 Terms</SelectItem>
                <SelectItem value="4">4 Terms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label>Grading System</Label>
            <RadioGroup
              value={academics.gradingSystem}
              onValueChange={(v) =>
                setAcademics((a) => ({ ...a, gradingSystem: v }))
              }
              className="flex gap-6"
            >
              {["Percentage", "GPA", "Letter Grade"].map((g) => (
                <div key={g} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={g}
                    id={`grading-${g}`}
                    data-ocid={`academics.grading_${g.toLowerCase().replace(/\s/g, "_")}.radio`}
                  />
                  <Label htmlFor={`grading-${g}`} className="cursor-pointer">
                    {g}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acad-passmark">Pass Mark Threshold</Label>
            <Input
              id="acad-passmark"
              data-ocid="academics.pass_mark.input"
              type="number"
              min={0}
              max={100}
              value={academics.passMark}
              onChange={(e) =>
                setAcademics((a) => ({
                  ...a,
                  passMark: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acad-maxmarks">Max Marks per Exam</Label>
            <Input
              id="acad-maxmarks"
              data-ocid="academics.max_marks.input"
              type="number"
              min={1}
              value={academics.maxMarks}
              onChange={(e) =>
                setAcademics((a) => ({
                  ...a,
                  maxMarks: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acad-workdays">Working Days per Week</Label>
            <Input
              id="acad-workdays"
              data-ocid="academics.working_days.input"
              type="number"
              min={1}
              max={7}
              value={academics.workingDays}
              onChange={(e) =>
                setAcademics((a) => ({
                  ...a,
                  workingDays: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acad-attendance">
              Attendance Threshold for Pass (%)
            </Label>
            <Input
              id="acad-attendance"
              data-ocid="academics.attendance_threshold.input"
              type="number"
              min={0}
              max={100}
              value={academics.attendanceThreshold}
              onChange={(e) =>
                setAcademics((a) => ({
                  ...a,
                  attendanceThreshold: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            data-ocid="academics.save_button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {saving ? "Saving…" : "Save Academic Settings"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
// ── Tab: Announcements ────────────────────────────────────────────────────────

const ANNOUNCEMENT_COLORS = {
  Info: {
    card: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    icon: <Info className="w-4 h-4 text-blue-500" />,
  },
  Warning: {
    card: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  },
  Alert: {
    card: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700",
    icon: <Bell className="w-4 h-4 text-red-500" />,
  },
};

function AnnouncementsTab() {
  const stored = localStorage.getItem("cymi_announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    stored ? JSON.parse(stored) : DEFAULT_ANNOUNCEMENTS,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "Info" as Announcement["type"],
    expiryDate: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const openAdd = () => {
    setEditingId(null);
    setForm({ title: "", message: "", type: "Info", expiryDate: "" });
    setDialogOpen(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setForm({
      title: ann.title,
      message: ann.message,
      type: ann.type,
      expiryDate: ann.expiryDate,
    });
    setDialogOpen(true);
  };

  const handleSaveAnnouncement = () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required.");
      return;
    }
    let updated: Announcement[];
    if (editingId) {
      updated = announcements.map((a) =>
        a.id === editingId ? { ...a, ...form } : a,
      );
    } else {
      updated = [...announcements, { id: Date.now().toString(), ...form }];
    }
    setAnnouncements(updated);
    localStorage.setItem("cymi_announcements", JSON.stringify(updated));
    setDialogOpen(false);
    toast.success(editingId ? "Announcement updated." : "Announcement added.");
  };

  const handleDelete = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    localStorage.setItem("cymi_announcements", JSON.stringify(updated));
    toast.success("Announcement removed.");
  };

  const isExpired = (date: string) => date < today;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-600" /> Announcements
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage system-wide announcements visible to all users
            </p>
          </div>
          <Button
            data-ocid="announcements.add_button"
            onClick={openAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Announcement
          </Button>
        </div>

        {announcements.length === 0 ? (
          <div
            data-ocid="announcements.empty_state"
            className="text-center py-12 text-gray-400"
          >
            <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((ann, idx) => {
              const colors =
                ANNOUNCEMENT_COLORS[ann.type] ?? ANNOUNCEMENT_COLORS.Info;
              const expired = isExpired(ann.expiryDate);
              return (
                <motion.div
                  key={ann.id}
                  data-ocid={`announcements.item.${idx + 1}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-lg border ${colors.card} ${expired ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 flex-shrink-0">{colors.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-800">
                            {ann.title}
                          </span>
                          <Badge
                            className={`text-xs ${colors.badge} hover:${colors.badge}`}
                          >
                            {ann.type}
                          </Badge>
                          {expired && (
                            <Badge className="text-xs bg-gray-100 text-gray-500 hover:bg-gray-100">
                              Expired
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {ann.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Expires: {ann.expiryDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        data-ocid={`announcements.edit_button.${idx + 1}`}
                        onClick={() => openEdit(ann)}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-ocid={`announcements.delete_button.${idx + 1}`}
                        onClick={() => handleDelete(ann.id)}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="announcements.dialog" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Announcement" : "Add Announcement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ann-title">Title</Label>
              <Input
                id="ann-title"
                data-ocid="announcements.title.input"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Announcement title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ann-message">Message</Label>
              <Textarea
                id="ann-message"
                data-ocid="announcements.message.textarea"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                rows={3}
                placeholder="Announcement details..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ann-type">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      type: v as Announcement["type"],
                    }))
                  }
                >
                  <SelectTrigger
                    id="ann-type"
                    data-ocid="announcements.type.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Info">Info</SelectItem>
                    <SelectItem value="Warning">Warning</SelectItem>
                    <SelectItem value="Alert">Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ann-expiry">Expiry Date</Label>
                <Input
                  id="ann-expiry"
                  data-ocid="announcements.expiry.input"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiryDate: e.target.value }))
                  }
                  min={today}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              data-ocid="announcements.cancel_button"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="announcements.save_button"
              onClick={handleSaveAnnouncement}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {editingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ── Tab: Data & Backup ────────────────────────────────────────────────────────

function DataBackupTab() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const fakeDownload = async (filename: string, label: string) => {
    setDownloading(label);
    await new Promise((r) => setTimeout(r, 1000));
    setDownloading(null);
    toast.success(`${filename} downloaded.`);
  };

  const handleExcelStudents = () =>
    fakeDownload("students_export.xlsx", "students");
  const handleExcelFees = () => fakeDownload("fee_records_export.xlsx", "fees");
  const handleExcelAttendance = () =>
    fakeDownload("attendance_export.xlsx", "attendance");

  const handleJsonBackup = async () => {
    setDownloading("backup");
    await new Promise((r) => setTimeout(r, 1000));
    const data = {
      version: "v18.0",
      exportedAt: new Date().toISOString(),
      students: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `Student ${i + 1}`,
        grade: `Grade ${i + 1}`,
      })),
      feeTypes: DEFAULT_FEE_TYPES,
      concessions: DEFAULT_CONCESSIONS,
      announcements: DEFAULT_ANNOUNCEMENTS,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cymi_full_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(null);
    toast.success("Full backup downloaded.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Export Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" /> Data Export
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Export system data in Excel or JSON format
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              label: "Export All Students (Excel)",
              handler: handleExcelStudents,
              key: "students",
              icon: <GraduationCap className="w-4 h-4" />,
              color: "blue",
            },
            {
              label: "Export Fee Records (Excel)",
              handler: handleExcelFees,
              key: "fees",
              icon: <CreditCard className="w-4 h-4" />,
              color: "green",
            },
            {
              label: "Export Attendance Records (Excel)",
              handler: handleExcelAttendance,
              key: "attendance",
              icon: <CheckCircle2 className="w-4 h-4" />,
              color: "orange",
            },
            {
              label: "Export Full Backup (JSON)",
              handler: handleJsonBackup,
              key: "backup",
              icon: <Database className="w-4 h-4" />,
              color: "purple",
            },
          ].map((item) => (
            <Button
              key={item.key}
              data-ocid={`backup.export_${item.key}.button`}
              variant="outline"
              onClick={item.handler}
              disabled={downloading !== null}
              className="h-14 flex items-center justify-start gap-3 px-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              {downloading === item.key ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
              ) : (
                <span className="flex-shrink-0 text-blue-600">{item.icon}</span>
              )}
              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">
          System Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Version", value: "v18.0" },
            { label: "Platform", value: "ICP Blockchain" },
            { label: "Build", value: "Stable" },
          ].map((info) => (
            <div
              key={info.label}
              className="p-4 bg-gray-50 rounded-lg text-center"
            >
              <div className="text-xs text-gray-500 mb-1">{info.label}</div>
              <div className="font-bold text-gray-800 text-sm">
                {info.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Section */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" /> Danger Zone
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Irreversible actions that affect the entire system
          </p>
        </div>
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
          <div>
            <div className="font-semibold text-sm text-gray-800">
              Reset Demo Data
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Clears all customizations and resets to default demo data
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                data-ocid="backup.reset_demo.open_modal_button"
                variant="destructive"
                size="sm"
              >
                Reset Demo Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="backup.reset_demo.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Demo Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear all custom settings (branding, modules,
                  permissions, fee config) and restore factory defaults. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="backup.reset_demo.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid="backup.reset_demo.confirm_button"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    for (const k of [
                      "cymi_branding",
                      "cymi_modules",
                      "cymi_permissions",
                      "cymi_academics",
                      "cymi_fee_config",
                      "cymi_announcements",
                    ]) {
                      localStorage.removeItem(k);
                    }
                    toast.success("Demo data reset to defaults.");
                  }}
                >
                  Yes, Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.div>
  );
}

// ── Tab: System Health ────────────────────────────────────────────────────────

function SystemHealthTab() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [logs, setLogs] = useState(SYSTEM_LOGS);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
    setRefreshKey((k) => k + 1);
    // Prepend a new log entry
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setLogs((prev) => [
      { time: timeStr, event: "Manual health check", user: "superadmin" },
      ...prev.slice(0, 9),
    ]);
    toast.success("System health refreshed.");
  };

  const statCards = [
    {
      label: "Total Students",
      value: 520,
      icon: <GraduationCap className="w-5 h-5" />,
      color: "blue",
      suffix: "",
    },
    {
      label: "Total Teachers",
      value: 15,
      icon: <Users className="w-5 h-5" />,
      color: "green",
      suffix: "",
    },
    {
      label: "Total Staff",
      value: 12,
      icon: <Users className="w-5 h-5" />,
      color: "orange",
      suffix: "",
    },
    {
      label: "Total Parents",
      value: 48,
      icon: <Users className="w-5 h-5" />,
      color: "purple",
      suffix: "",
    },
    {
      label: "Active Sessions",
      value: 3,
      icon: <Server className="w-5 h-5" />,
      color: "teal",
      suffix: "",
    },
    {
      label: "Modules Active",
      value: 8,
      icon: <Sliders className="w-5 h-5" />,
      color: "indigo",
      suffix: "",
    },
    {
      label: "System Uptime",
      value: 9997,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "green",
      suffix: "%",
      display: "99.97%",
    },
    {
      label: "Storage Used",
      value: 24,
      icon: <Database className="w-5 h-5" />,
      color: "amber",
      suffix: "",
      display: "2.4 GB",
      subLabel: "of 10 GB",
      progress: 24,
    },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    green: "bg-green-50 border-green-100 text-green-600",
    orange: "bg-orange-50 border-orange-100 text-orange-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600",
    teal: "bg-teal-50 border-teal-100 text-teal-600",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
    amber: "bg-amber-50 border-amber-100 text-amber-600",
  };

  const iconColorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
    teal: "bg-teal-100 text-teal-600",
    indigo: "bg-indigo-100 text-indigo-600",
    amber: "bg-amber-100 text-amber-600",
  };

  return (
    <motion.div
      key={refreshKey}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-white rounded-xl shadow-sm border p-4 ${colorMap[card.color] ?? "bg-white border-gray-100"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColorMap[card.color] ?? "bg-gray-100 text-gray-600"}`}
              >
                {card.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {card.display ?? (
                <>
                  <AnimatedCounter target={card.value} />
                  {card.suffix}
                </>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            {card.subLabel && (
              <div className="text-xs text-gray-400">{card.subLabel}</div>
            )}
            {card.progress !== undefined && (
              <Progress value={card.progress} className="h-1.5 mt-2" />
            )}
          </motion.div>
        ))}
      </div>

      {/* System Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" /> System Activity Log
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Recent system events and user actions
            </p>
          </div>
          <Button
            size="sm"
            data-ocid="health.refresh.button"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        <Table data-ocid="health.logs.table">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-bold text-gray-600 w-28">
                Time
              </TableHead>
              <TableHead className="font-bold text-gray-600">Event</TableHead>
              <TableHead className="font-bold text-gray-600 w-36">
                User
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log, idx) => (
              <TableRow
                key={`${log.time}-${idx}`}
                data-ocid={`health.log.row.${idx + 1}`}
                className="hover:bg-gray-50"
              >
                <TableCell className="text-xs font-mono text-gray-500">
                  {log.time}
                </TableCell>
                <TableCell className="text-sm text-gray-700">
                  {log.event}
                </TableCell>
                <TableCell>
                  <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 text-xs font-mono">
                    {log.user}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SuperAdminControlPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("cymi_token");

  useEffect(() => {
    if (!token) navigate({ to: "/" });
  }, [token, navigate]);

  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const role = (profile?.schoolRole as string) ?? "";

  useEffect(() => {
    if (!profileLoading && role && role !== "SuperAdmin") {
      navigate({ to: "/dashboard" });
    }
  }, [role, profileLoading, navigate]);

  const handleLogout = async () => {
    if (token) {
      try {
        await logoutMutation.mutateAsync(token);
      } catch {
        // ignore
      }
    }
    localStorage.removeItem("cymi_token");
    localStorage.removeItem("cymi_profile");
    navigate({ to: "/" });
  };

  const userName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "Super Admin";

  const tabs = [
    {
      id: "branding",
      label: "Branding",
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: "modules",
      label: "Modules",
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      id: "permissions",
      label: "Permissions",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: "academics",
      label: "Academics",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "announcements",
      label: "Announcements",
      icon: <Megaphone className="w-4 h-4" />,
    },
    {
      id: "backup",
      label: "Data & Backup",
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: "health",
      label: "System Health",
      icon: <Server className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-gray-50">
      <Sidebar role={role} userName={userName} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Navbar ── */}
        <nav
          className="navbar-cymi flex items-center justify-between px-4 py-2 shadow-md z-10 flex-shrink-0"
          style={{ minHeight: 56 }}
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-white/80" />
            <span className="text-white font-semibold text-base tracking-wide hidden sm:inline">
              Super Admin Control Center
            </span>
            <span className="text-white font-semibold text-sm tracking-wide sm:hidden">
              Control Center
            </span>
          </div>
          <div className="flex items-center gap-4">
            {profileLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white/70" />
            ) : profile ? (
              <div className="text-right hidden sm:block">
                <div className="text-white text-sm font-semibold leading-tight">
                  {profile.firstName} {profile.lastName}
                </div>
                <div className="text-white/70 text-xs">{role}</div>
              </div>
            ) : null}
            <button
              type="button"
              data-ocid="control_center.notification.button"
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </nav>

        {/* ── Tab Container ── */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs
            defaultValue="branding"
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Tab List */}
            <div className="bg-white border-b border-gray-200 px-4 flex-shrink-0">
              <TabsList className="h-auto p-0 bg-transparent flex gap-0 overflow-x-auto">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    data-ocid={`control_center.${tab.id.replace(/-/g, "_")}.tab`}
                    className="flex items-center gap-1.5 px-3 py-3 text-xs font-medium text-gray-500 border-b-2 border-transparent rounded-none whitespace-nowrap data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent hover:text-gray-700 transition-colors"
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              <div className="max-w-4xl mx-auto w-full">
                <TabsContent
                  value="branding"
                  className="mt-0 focus-visible:ring-0"
                >
                  <BrandingTab />
                </TabsContent>

                <TabsContent
                  value="modules"
                  className="mt-0 focus-visible:ring-0"
                >
                  <ModulesTab />
                </TabsContent>

                <TabsContent
                  value="permissions"
                  className="mt-0 focus-visible:ring-0"
                >
                  <PermissionsTab />
                </TabsContent>

                <TabsContent
                  value="academics"
                  className="mt-0 focus-visible:ring-0"
                >
                  <AcademicsTab />
                </TabsContent>

                <TabsContent
                  value="announcements"
                  className="mt-0 focus-visible:ring-0"
                >
                  <AnnouncementsTab />
                </TabsContent>

                <TabsContent
                  value="backup"
                  className="mt-0 focus-visible:ring-0"
                >
                  <DataBackupTab />
                </TabsContent>

                <TabsContent
                  value="health"
                  className="mt-0 focus-visible:ring-0"
                >
                  <SystemHealthTab />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>

        {/* ── Footer ── */}
        <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-400 flex-shrink-0">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Built with ♥ using caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
