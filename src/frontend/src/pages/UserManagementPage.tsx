import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Bell,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useCallerUserProfile, useLogout } from "../hooks/useQueries";

// ── Types ─────────────────────────────────────────────────────────────────────

type Role = "SuperAdmin" | "Admin" | "Teacher" | "Student" | "Parent";
type Status = "Active" | "Inactive";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: Role;
  status: Status;
  email: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const INITIAL_USERS: User[] = [
  {
    id: 1,
    firstName: "Super",
    lastName: "Admin",
    username: "superadmin",
    role: "SuperAdmin",
    status: "Active",
    email: "superadmin@cymi.edu",
  },
  {
    id: 2,
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    role: "Admin",
    status: "Active",
    email: "admin@cymi.edu",
  },
  {
    id: 3,
    firstName: "Ramesh",
    lastName: "Sharma",
    username: "teacher.sharma",
    role: "Teacher",
    status: "Active",
    email: "r.sharma@cymi.edu",
  },
  {
    id: 4,
    firstName: "Sunita",
    lastName: "Patel",
    username: "teacher.patel",
    role: "Teacher",
    status: "Active",
    email: "s.patel@cymi.edu",
  },
  {
    id: 5,
    firstName: "Alice",
    lastName: "Brown",
    username: "student1",
    role: "Student",
    status: "Active",
    email: "alice.b@cymi.edu",
  },
  {
    id: 6,
    firstName: "Arjun",
    lastName: "Kumar",
    username: "student2",
    role: "Student",
    status: "Active",
    email: "arjun.k@cymi.edu",
  },
  {
    id: 7,
    firstName: "Priya",
    lastName: "Sharma",
    username: "parent1",
    role: "Parent",
    status: "Active",
    email: "priya.s@gmail.com",
  },
  {
    id: 8,
    firstName: "Vikram",
    lastName: "Mehta",
    username: "teacher.mehta",
    role: "Teacher",
    status: "Inactive",
    email: "v.mehta@cymi.edu",
  },
  {
    id: 9,
    firstName: "Meena",
    lastName: "Reddy",
    username: "parent2",
    role: "Parent",
    status: "Active",
    email: "meena.r@gmail.com",
  },
  {
    id: 10,
    firstName: "Dev",
    lastName: "Sharma",
    username: "student3",
    role: "Student",
    status: "Inactive",
    email: "dev.s@cymi.edu",
  },
];

const PAGE_SIZE = 5;

// ── Helpers ───────────────────────────────────────────────────────────────────

function roleBadge(role: Role) {
  const map: Record<Role, string> = {
    SuperAdmin: "bg-indigo-100 text-indigo-700 border-indigo-200",
    Admin: "bg-red-100 text-red-700 border-red-200",
    Teacher: "bg-blue-100 text-blue-700 border-blue-200",
    Student: "bg-green-100 text-green-700 border-green-200",
    Parent: "bg-amber-100 text-amber-700 border-amber-200",
  };
  return map[role];
}

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

// ── Empty Form ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  username: "",
  role: "Student" as Role,
  status: "Active" as Status,
  email: "",
  password: "",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("cymi_token");

  useEffect(() => {
    if (!token) navigate({ to: "/" });
  }, [token, navigate]);

  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const logoutMutation = useLogout();

  const role = (profile?.schoolRole as string) ?? "";

  // Redirect non-admin roles
  useEffect(() => {
    if (!profileLoading && role && role !== "SuperAdmin" && role !== "Admin") {
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

  // ── State ──────────────────────────────────────────────────────────────────

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ── Filtering + Pagination ─────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Reset to first page when filter changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional side-effect on filter change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  // ── Dialog handlers ────────────────────────────────────────────────────────

  const openAddDialog = () => {
    setEditingUser(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  };

  const openEditDialog = (u: User) => {
    setEditingUser(u);
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      role: u.role,
      status: u.status,
      email: u.email,
      password: "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.firstName.trim() || !form.username.trim()) return;
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                username: form.username.trim(),
                role: form.role,
                status: form.status,
                email: form.email.trim(),
              }
            : u,
        ),
      );
    } else {
      const newUser: User = {
        id: Date.now(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim(),
        role: form.role,
        status: form.status,
        email: form.email.trim(),
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
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
            <Users className="w-5 h-5 text-white/80" />
            <span className="text-white font-semibold text-base tracking-wide hidden sm:inline">
              User Management
            </span>
            <span className="text-white font-semibold text-sm tracking-wide sm:hidden">
              Users
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
              data-ocid="user_mgmt.notification.button"
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="overflow-y-auto flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  User Management
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Manage all system users, roles, and permissions
                </p>
              </div>
              <Button
                data-ocid="user_mgmt.add_user.button"
                onClick={openAddDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </motion.div>

            {/* ── Filters ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  data-ocid="user_mgmt.search_input"
                  placeholder="Search by name or username…"
                  className="pl-9 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(v) => setRoleFilter(v)}
              >
                <SelectTrigger
                  data-ocid="user_mgmt.role_filter.select"
                  className="sm:w-44 text-sm"
                >
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "All",
                    "SuperAdmin",
                    "Admin",
                    "Teacher",
                    "Student",
                    "Parent",
                  ].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r === "All" ? "All Roles" : r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* ── Table ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table
                  data-ocid="user_mgmt.users.table"
                  className="w-full text-sm"
                >
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        User
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                        Username
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Role
                      </th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                        Status
                      </th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          data-ocid="user_mgmt.users.empty_state"
                          className="text-center py-16 text-gray-400 text-sm"
                        >
                          No users found matching your search.
                        </td>
                      </tr>
                    ) : (
                      paged.map((u, idx) => (
                        <tr
                          key={u.id}
                          data-ocid={`user_mgmt.users.row.${idx + 1}`}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                                {getInitials(u.firstName, u.lastName)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {u.firstName} {u.lastName}
                                </div>
                                <div className="text-xs text-gray-400 hidden sm:block">
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-600 font-mono text-xs hidden sm:table-cell">
                            {u.username}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant="outline"
                              className={`text-xs font-semibold ${roleBadge(u.role)}`}
                            >
                              {u.role}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                u.status === "Active"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-red-50 text-red-600 border border-red-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${u.status === "Active" ? "bg-green-500" : "bg-red-400"}`}
                              />
                              {u.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                data-ocid={`user_mgmt.users.edit_button.${idx + 1}`}
                                onClick={() => openEditDialog(u)}
                                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                aria-label={`Edit ${u.firstName}`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-ocid={`user_mgmt.users.delete_button.${idx + 1}`}
                                onClick={() => {
                                  setDeleteTarget(u);
                                  setDeleteDialogOpen(true);
                                }}
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                aria-label={`Delete ${u.firstName}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
                  <span className="text-xs text-gray-500">
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                    {filtered.length} users
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      data-ocid="user_mgmt.pagination_prev"
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="text-xs h-8"
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-gray-600 px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      data-ocid="user_mgmt.pagination_next"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="text-xs h-8"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
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

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="user_mgmt.user.dialog"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="um-fname">First Name</Label>
              <Input
                id="um-fname"
                data-ocid="user_mgmt.user.first_name.input"
                placeholder="First name"
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="um-lname">Last Name</Label>
              <Input
                id="um-lname"
                data-ocid="user_mgmt.user.last_name.input"
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="um-username">Username</Label>
              <Input
                id="um-username"
                data-ocid="user_mgmt.user.username.input"
                placeholder="username"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="um-email">Email</Label>
              <Input
                id="um-email"
                data-ocid="user_mgmt.user.email.input"
                type="email"
                placeholder="email@cymi.edu"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, role: v as Role }))
                }
              >
                <SelectTrigger data-ocid="user_mgmt.user.role.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "SuperAdmin",
                      "Admin",
                      "Teacher",
                      "Student",
                      "Parent",
                    ] as Role[]
                  ).map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as Status }))
                }
              >
                <SelectTrigger data-ocid="user_mgmt.user.status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!editingUser && (
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="um-pass">Password</Label>
                <Input
                  id="um-pass"
                  data-ocid="user_mgmt.user.password.input"
                  type="password"
                  placeholder="Set a password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="user_mgmt.user.cancel_button"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="user_mgmt.user.save_button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!form.firstName.trim() || !form.username.trim()}
            >
              {editingUser ? "Save Changes" : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-ocid="user_mgmt.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {deleteTarget?.firstName} {deleteTarget?.lastName}
              </strong>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="user_mgmt.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="user_mgmt.delete.confirm_button"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
