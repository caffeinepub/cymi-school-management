import { useNavigate } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Loader2, LogOut, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import {
  useCallerUserProfile,
  useDashboardStats,
  useLogout,
} from "../hooks/useQueries";

export default function DashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("cymi_token");

  // Guard: redirect if no token
  useEffect(() => {
    if (!token) {
      navigate({ to: "/" });
    }
  }, [token, navigate]);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    if (token) {
      try {
        await logoutMutation.mutateAsync(token);
      } catch {
        // ignore logout errors — still clear local state
      }
    }
    localStorage.removeItem("cymi_token");
    localStorage.removeItem("cymi_profile");
    navigate({ to: "/" });
  };

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "Teacher":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Student":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Top Navbar ── */}
      <nav
        className="navbar-cymi flex items-center justify-between px-4 py-2 shadow-md z-10 sticky top-0"
        style={{ minHeight: 56 }}
      >
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/uploads/cymi-1.PNG"
            alt="CYMI Logo"
            className="w-10 h-10 object-contain"
          />
          <span className="text-white font-semibold text-base tracking-wide hidden sm:inline">
            CYMI – Christ Youth Mission Institute
          </span>
          <span className="text-white font-semibold text-sm tracking-wide sm:hidden">
            CYMI
          </span>
        </div>

        {/* Right: User info + Logout */}
        <div className="flex items-center gap-3">
          {profileLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white/70" />
          ) : profile ? (
            <div className="text-right hidden sm:block">
              <div className="text-white text-sm font-semibold leading-tight">
                {profile.firstName} {profile.lastName}
              </div>
              <div className="text-white/70 text-xs">{profile.schoolRole}</div>
            </div>
          ) : null}

          <button
            type="button"
            data-ocid="dashboard.logout_button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Logout"
          >
            {logoutMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {/* Welcome heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {profile?.firstName ?? "User"}!
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-500 text-sm">
              CYMI School Management System
            </span>
            {profile?.schoolRole && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeColor(profile.schoolRole)}`}
              >
                {profile.schoolRole}
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {/* Students Card */}
          <motion.div
            data-ocid="dashboard.stats.students_card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Total Students
              </div>
              {statsLoading ? (
                <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
              ) : (
                <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
                  {stats?.totalStudents?.toString() ?? "0"}
                </div>
              )}
            </div>
          </motion.div>

          {/* Teachers Card */}
          <motion.div
            data-ocid="dashboard.stats.teachers_card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Total Teachers
              </div>
              {statsLoading ? (
                <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
              ) : (
                <div className="text-3xl font-bold text-gray-800 leading-none mt-1">
                  {stats?.totalTeachers?.toString() ?? "0"}
                </div>
              )}
            </div>
          </motion.div>

          {/* System Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                System
              </div>
              <div className="text-sm font-semibold text-gray-700 mt-1 leading-tight">
                CYMI SMS
              </div>
              <div className="text-xs text-gray-400">Active</div>
            </div>
          </motion.div>
        </div>

        {/* ── Dashboard Info Box ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-start gap-4">
            <img
              src="/assets/generated/cymi-logo-transparent.dim_200x200.png"
              alt="CYMI"
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
            />
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                CYMI School Management System – Dashboard
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Welcome to the Christ Youth Mission Institute management portal.
                Use this system to manage student records, teacher assignments,
                and school operations efficiently.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-100">
                  Student Records
                </span>
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium border border-green-100">
                  Teacher Management
                </span>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-full font-medium border border-amber-100">
                  Attendance
                </span>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium border border-purple-100">
                  Reports
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-400">
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
  );
}
