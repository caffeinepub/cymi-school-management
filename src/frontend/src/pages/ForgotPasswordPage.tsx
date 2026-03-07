import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { motion } from "motion/react";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Top Navbar ── */}
      <nav
        className="navbar-cymi flex items-center px-4 py-2 shadow-md z-10"
        style={{ minHeight: 56 }}
      >
        <button
          type="button"
          className="flex items-center gap-3 focus:outline-none"
          onClick={() => navigate({ to: "/" })}
        >
          <img
            src="/assets/generated/cymi-logo-transparent.dim_200x200.png"
            alt="CYMI Logo"
            className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white/30"
          />
          <span className="text-white font-semibold text-base tracking-wide hidden sm:inline">
            CYMI – Christ Youth Mission Institute
          </span>
          <span className="text-white font-semibold text-sm tracking-wide sm:hidden">
            CYMI
          </span>
        </button>
      </nav>

      {/* ── Content ── */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-lg login-card-shadow p-8 max-w-md w-full text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <Mail className="w-7 h-7 text-blue-500" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Forgot Password?
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Please contact your system administrator to reset your password.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700 mb-6 text-left">
            Reach out to the CYMI IT department or your school administrator for
            assistance with password reset.
          </div>

          <button
            data-ocid="forgotpassword.link"
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="inline-flex items-center gap-2 btn-cymi px-5 py-2 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400/70"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
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
