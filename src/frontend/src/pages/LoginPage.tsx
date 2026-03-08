import { useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLogin } from "../hooks/useQueries";

type RoleTab = "SuperAdmin" | "Admin" | "Parent" | "Student";

const ROLE_TABS: { id: RoleTab; label: string; hint: string }[] = [
  {
    id: "SuperAdmin",
    label: "Super Admin",
    hint: "superadmin / superadmin123",
  },
  { id: "Admin", label: "Admin", hint: "admin / admin123" },
  { id: "Parent", label: "Parent", hint: "parent1 / parent123" },
  { id: "Student", label: "Student", hint: "student1 / student123" },
];

const TAB_OCID: Record<RoleTab, string> = {
  SuperAdmin: "login.superadmin_tab",
  Admin: "login.admin_tab",
  Parent: "login.parent_tab",
  Student: "login.student_tab",
};

export default function LoginPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<RoleTab>("SuperAdmin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginMutation = useLogin();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("cymi_token");
    if (token) {
      navigate({ to: "/dashboard" });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please enter username and password.");
      return;
    }

    try {
      const token = await loginMutation.mutateAsync({ username, password });
      if (token) {
        localStorage.setItem("cymi_token", token);
        navigate({ to: "/dashboard" });
      } else {
        setErrorMsg("Invalid username or password.");
      }
    } catch {
      setErrorMsg("An error occurred. Please try again.");
    }
  };

  const isLoading = loginMutation.isPending;
  const activeHint = ROLE_TABS.find((t) => t.id === activeTab)?.hint ?? "";

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top Navbar ── */}
      <nav
        className="navbar-cymi flex items-center px-4 py-2 shadow-md z-10 relative"
        style={{ minHeight: 56 }}
      >
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
      </nav>

      {/* ── Full-page Wallpaper ── */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          backgroundImage:
            "url('/assets/generated/cymi-wallpaper.dim_1920x1080.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay layers */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        {/* ── Page Content — card right-aligned ── */}
        <div className="relative z-10 min-h-full flex items-start justify-end px-4 py-10 sm:px-8 lg:pr-16">
          <div className="w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="bg-white rounded-2xl login-card-shadow overflow-hidden">
                <div className="px-8 pt-8 pb-6">
                  {/* ── School Logo + Welcome Greeting ── */}
                  <div className="flex flex-col items-center mb-6">
                    <img
                      src="/assets/uploads/cymi-1.PNG"
                      alt="CYMI School Logo"
                      className="w-20 h-20 object-contain mb-3"
                    />
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                      Welcome Back!
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Sign in to CYMI School Management
                    </p>
                  </div>

                  {/* ── Role Tabs ── */}
                  <div className="mb-5">
                    <div className="grid grid-cols-4 rounded-xl overflow-hidden border border-gray-200">
                      {ROLE_TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            data-ocid={TAB_OCID[tab.id]}
                            onClick={() => {
                              setActiveTab(tab.id);
                              setErrorMsg(null);
                            }}
                            className={[
                              "py-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400/60 rounded-xl",
                              isActive
                                ? "btn-cymi text-white"
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100",
                            ].join(" ")}
                            aria-pressed={isActive}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Login Form ── */}
                  <form onSubmit={handleSubmit} noValidate autoComplete="on">
                    {/* Username */}
                    <div className="relative mb-4">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        data-ocid="login.input"
                        id="username"
                        type="text"
                        name="username"
                        autoComplete="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition disabled:opacity-60 bg-white"
                      />
                    </div>

                    {/* Password */}
                    <div className="relative mb-4">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        data-ocid="login.password_input"
                        id="password"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition disabled:opacity-60 bg-white"
                      />
                    </div>

                    {/* Error */}
                    {errorMsg && (
                      <div
                        data-ocid="login.error_state"
                        className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs"
                        role="alert"
                        aria-live="polite"
                      >
                        {errorMsg}
                      </div>
                    )}

                    {/* Loading indicator */}
                    {isLoading && (
                      <div
                        data-ocid="login.loading_state"
                        className="mb-3 flex items-center gap-2 text-xs text-gray-500"
                        aria-live="polite"
                      >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Signing in…
                      </div>
                    )}

                    {/* Sign In button — full width */}
                    <div className="mt-2">
                      <button
                        data-ocid="login.submit_button"
                        type="submit"
                        disabled={isLoading}
                        className="btn-cymi w-full py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400/70 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isLoading && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Sign in
                      </button>
                    </div>

                    {/* Forgot Password — right-aligned */}
                    <div className="flex justify-end mt-3">
                      <button
                        data-ocid="login.forgot_password_link"
                        type="button"
                        className="text-xs text-blue-600 hover:underline focus:outline-none"
                        onClick={() => navigate({ to: "/forgot-password" })}
                      >
                        Forgot Password
                      </button>
                    </div>
                  </form>

                  {/* Demo credentials hint for active tab */}
                  <div className="mt-5 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
                    Demo:{" "}
                    <span className="font-medium text-gray-600">
                      {activeHint}
                    </span>
                    <p className="mt-2 text-gray-400 italic text-xs">
                      Empowering education together
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-200 py-2 text-center text-xs text-gray-400">
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
