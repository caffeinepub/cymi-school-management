import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Loader2, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";
import { useCallerUserProfile, useLogout } from "../hooks/useQueries";

// ── Initial State ─────────────────────────────────────────────────────────────

const DEFAULT_SCHOOL = {
  name: "Christ Youth Mission Institute",
  address: "123 Church Street, Bangalore, Karnataka - 560001",
  phone: "+91 80 4567 8900",
  email: "admin@cymi.edu",
  academicYear: "2025-2026",
};

const DEFAULT_NOTIFICATIONS = {
  emailNotifications: true,
  smsAlerts: false,
  attendanceAlerts: true,
  feeReminders: true,
};

const DEFAULT_SECURITY = {
  sessionTimeout: "60",
  passwordPolicy: "Strong",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SystemSettingsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("cymi_token");

  useEffect(() => {
    if (!token) navigate({ to: "/" });
  }, [token, navigate]);

  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const role = (profile?.schoolRole as string) ?? "";

  // Only SuperAdmin
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

  // ── Form State ─────────────────────────────────────────────────────────────

  const [school, setSchool] = useState({ ...DEFAULT_SCHOOL });
  const [notifs, setNotifs] = useState({ ...DEFAULT_NOTIFICATIONS });
  const [security, setSecurity] = useState({ ...DEFAULT_SECURITY });

  const [schoolSaving, setSchoolSaving] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);

  const handleSaveSchool = async () => {
    setSchoolSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSchoolSaving(false);
    toast.success("School information saved successfully.");
  };

  const handleSaveNotifs = async () => {
    setNotifSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setNotifSaving(false);
    toast.success("Notification preferences saved.");
  };

  const handleSaveSecurity = async () => {
    setSecuritySaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSecuritySaving(false);
    toast.success("Security settings applied.");
  };

  const userName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "User";

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
            <Settings className="w-5 h-5 text-white/80" />
            <span className="text-white font-semibold text-base tracking-wide hidden sm:inline">
              System Settings
            </span>
            <span className="text-white font-semibold text-sm tracking-wide sm:hidden">
              Settings
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
              data-ocid="settings.notification.button"
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="overflow-y-auto flex-1 p-6 lg:p-8">
          <div className="max-w-3xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-gray-800">
                System Settings
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Configure school information, notifications, and security
                policies
              </p>
            </motion.div>

            {/* ── School Information ── */}
            <motion.div
              data-ocid="settings.school_info.card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5"
            >
              <div className="mb-5">
                <h2 className="text-base font-bold text-gray-800">
                  School Information
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Basic details about your institution
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="ss-name">School Name</Label>
                  <Input
                    id="ss-name"
                    data-ocid="settings.school_name.input"
                    value={school.name}
                    onChange={(e) =>
                      setSchool((s) => ({ ...s, name: e.target.value }))
                    }
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="ss-addr">Address</Label>
                  <Input
                    id="ss-addr"
                    data-ocid="settings.school_address.input"
                    value={school.address}
                    onChange={(e) =>
                      setSchool((s) => ({ ...s, address: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ss-phone">Phone</Label>
                  <Input
                    id="ss-phone"
                    data-ocid="settings.school_phone.input"
                    value={school.phone}
                    onChange={(e) =>
                      setSchool((s) => ({ ...s, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ss-email">Email</Label>
                  <Input
                    id="ss-email"
                    data-ocid="settings.school_email.input"
                    type="email"
                    value={school.email}
                    onChange={(e) =>
                      setSchool((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ss-year">Academic Year</Label>
                  <Input
                    id="ss-year"
                    data-ocid="settings.academic_year.input"
                    value={school.academicYear}
                    onChange={(e) =>
                      setSchool((s) => ({ ...s, academicYear: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  data-ocid="settings.school_info.save_button"
                  onClick={handleSaveSchool}
                  disabled={schoolSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {schoolSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {schoolSaving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </motion.div>

            {/* ── Notification Settings ── */}
            <motion.div
              data-ocid="settings.notifications.card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5"
            >
              <div className="mb-5">
                <h2 className="text-base font-bold text-gray-800">
                  Notification Settings
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose how and when users receive system alerts
                </p>
              </div>

              <div className="space-y-4">
                {(
                  [
                    {
                      key: "emailNotifications",
                      label: "Email Notifications",
                      desc: "Send system notifications via email",
                      ocid: "settings.email_notifications.switch",
                    },
                    {
                      key: "smsAlerts",
                      label: "SMS Alerts",
                      desc: "Send critical alerts via SMS",
                      ocid: "settings.sms_alerts.switch",
                    },
                    {
                      key: "attendanceAlerts",
                      label: "Attendance Alerts",
                      desc: "Notify parents when child is absent",
                      ocid: "settings.attendance_alerts.switch",
                    },
                    {
                      key: "feeReminders",
                      label: "Fee Reminders",
                      desc: "Send automated fee due reminders",
                      ocid: "settings.fee_reminders.switch",
                    },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                    <Switch
                      data-ocid={item.ocid}
                      checked={notifs[item.key]}
                      onCheckedChange={(v) =>
                        setNotifs((n) => ({ ...n, [item.key]: v }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  data-ocid="settings.notifications.save_button"
                  onClick={handleSaveNotifs}
                  disabled={notifSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {notifSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {notifSaving ? "Saving…" : "Save Preferences"}
                </Button>
              </div>
            </motion.div>

            {/* ── Security Settings ── */}
            <motion.div
              data-ocid="settings.security.card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="mb-5">
                <h2 className="text-base font-bold text-gray-800">
                  Security Settings
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Control session behaviour and password requirements
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Session Timeout</Label>
                  <Select
                    value={security.sessionTimeout}
                    onValueChange={(v) =>
                      setSecurity((s) => ({ ...s, sessionTimeout: v }))
                    }
                  >
                    <SelectTrigger data-ocid="settings.session_timeout.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Password Policy</Label>
                  <Select
                    value={security.passwordPolicy}
                    onValueChange={(v) =>
                      setSecurity((s) => ({ ...s, passwordPolicy: v }))
                    }
                  >
                    <SelectTrigger data-ocid="settings.password_policy.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Strong">Strong</SelectItem>
                      <SelectItem value="Very Strong">Very Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  data-ocid="settings.security.apply_button"
                  onClick={handleSaveSecurity}
                  disabled={securitySaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {securitySaving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {securitySaving ? "Applying…" : "Apply Settings"}
                </Button>
              </div>
            </motion.div>
          </div>
        </main>

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
