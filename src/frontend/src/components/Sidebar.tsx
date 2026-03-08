import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  BookOpenCheck,
  Bus,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  Sliders,
  UserCircle,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavChild {
  label: string;
  href?: string;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: NavChild[];
  ocid?: string;
  groupOcid?: string;
}

interface SidebarProps {
  role: string;
  userName: string;
  onLogout: () => void;
}

// ─── Menu Definitions ────────────────────────────────────────────────────────

function getMenuItems(role: string): NavItem[] {
  // role used for conditional SuperAdmin items below
  const isAdminLike = role === "SuperAdmin" || role === "Admin";
  const isParent = role === "Parent";

  if (isAdminLike) {
    return [
      {
        label: "Dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
        href: "/dashboard",
        ocid: "sidebar.dashboard_link",
      },
      {
        label: "SMS",
        icon: <MessageSquare className="w-5 h-5" />,
        href: "/dashboard",
        ocid: "sidebar.sms_link",
      },
      {
        label: "Email",
        icon: <Mail className="w-5 h-5" />,
        href: "/dashboard",
        ocid: "sidebar.email_link",
      },
      {
        label: "Profile",
        icon: <UserCircle className="w-5 h-5" />,
        href: "/dashboard",
        ocid: "sidebar.profile_link",
      },
      {
        label: "Admissions",
        icon: <UserPlus className="w-5 h-5" />,
        groupOcid: "sidebar.admissions_group_toggle",
        children: [
          { label: "All Admissions", href: "/dashboard" },
          { label: "New Admission", href: "/students?action=add" },
          { label: "Admission Reports", href: "/dashboard" },
        ],
      },
      {
        label: "Students",
        icon: <GraduationCap className="w-5 h-5" />,
        groupOcid: "sidebar.students_group_toggle",
        children: [
          { label: "All Students", href: "/students" },
          { label: "Add Student", href: "/students?action=add" },
          { label: "Attendance", href: "/attendance" },
        ],
      },
      {
        label: "Academics",
        icon: <BookOpen className="w-5 h-5" />,
        groupOcid: "sidebar.academics_group_toggle",
        children: [
          { label: "Timetable", href: "/dashboard" },
          { label: "Exams", href: "/dashboard" },
          { label: "Results", href: "/dashboard" },
        ],
      },
      {
        label: "Attendance",
        icon: <CalendarCheck className="w-5 h-5" />,
        href: "/attendance",
        ocid: "sidebar.attendance_link",
      },
      {
        label: "Exam Management",
        icon: <BookOpenCheck className="w-5 h-5" />,
        groupOcid: "sidebar.exam_group_toggle",
        children: [
          { label: "Exam Schedule", href: "/dashboard" },
          { label: "Hall Tickets", href: "/dashboard" },
          { label: "Results", href: "/dashboard" },
        ],
      },
      {
        label: "Fee Management",
        icon: <CreditCard className="w-5 h-5" />,
        groupOcid: "sidebar.finance_group_toggle",
        children: [
          { label: "Fee Settings", href: "/dashboard" },
          { label: "Fee Structure", href: "/fees/structure" },
          { label: "Fee Concession", href: "/dashboard" },
          { label: "Fee Collection", href: "/fees/collection" },
          { label: "Fee Register", href: "/fees/register" },
          { label: "Fee Defaulters", href: "/dashboard" },
          { label: "Fee Receipt History", href: "/fees/history" },
        ],
      },
      {
        label: "Staff",
        icon: <Users className="w-5 h-5" />,
        groupOcid: "sidebar.staff_group_toggle",
        children: [
          { label: "All Staff", href: "/dashboard" },
          { label: "Add Staff", href: "/dashboard" },
          { label: "Staff Attendance", href: "/dashboard" },
          { label: "All Teachers", href: "/dashboard" },
          { label: "Add Teacher", href: "/dashboard" },
          { label: "Teacher Assignments", href: "/dashboard" },
        ],
      },
      {
        label: "Transportation",
        icon: <Bus className="w-5 h-5" />,
        groupOcid: "sidebar.transportation_group_toggle",
        children: [
          { label: "Routes", href: "/transport/routes" },
          { label: "Vehicles", href: "/transport/vehicles" },
          { label: "Drivers", href: "/transport/drivers" },
          { label: "Student Assignment", href: "/transport/assignments" },
          { label: "Reports", href: "/transport/reports" },
        ],
      },
      {
        label: "User Management",
        icon: <Shield className="w-5 h-5" />,
        href: "/user-management",
        ocid: "sidebar.user_management_link",
      },
      {
        label: "Reports",
        icon: <BarChart2 className="w-5 h-5" />,
        href: "/reports",
        ocid: "sidebar.reports_link",
      },
      ...(role === "SuperAdmin"
        ? [
            {
              label: "System Settings",
              icon: <Settings className="w-5 h-5" />,
              href: "/system-settings",
              ocid: "sidebar.system_settings_link",
            } as NavItem,
            {
              label: "Control Center",
              icon: <Sliders className="w-5 h-5" />,
              href: "/superadmin",
              ocid: "sidebar.control_center_link",
            } as NavItem,
          ]
        : [
            {
              label: "Settings",
              icon: <Settings className="w-5 h-5" />,
              href: "/dashboard",
              ocid: "sidebar.settings_link",
            } as NavItem,
          ]),
    ];
  }

  if (isParent) {
    return [
      {
        label: "Dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
        href: "/dashboard",
        ocid: "sidebar.dashboard_link",
      },
      {
        label: "My Child",
        icon: <GraduationCap className="w-5 h-5" />,
        groupOcid: "sidebar.students_group_toggle",
        children: [
          { label: "Profile" },
          { label: "Attendance" },
          { label: "Results" },
        ],
      },
      {
        label: "Fees",
        icon: <CreditCard className="w-5 h-5" />,
        href: "/dashboard",
        ocid: "sidebar.finance_group_toggle",
      },
      {
        label: "Communication",
        icon: <MessageSquare className="w-5 h-5" />,
        href: "/dashboard",
      },
    ];
  }

  // Student
  return [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/dashboard",
      ocid: "sidebar.dashboard_link",
    },
    {
      label: "My Classes",
      icon: <BookOpen className="w-5 h-5" />,
      groupOcid: "sidebar.academics_group_toggle",
      children: [
        { label: "Timetable" },
        { label: "Homework" },
        { label: "Results" },
      ],
    },
    {
      label: "Attendance",
      icon: <CalendarCheck className="w-5 h-5" />,
      href: "/dashboard",
    },
    {
      label: "Library",
      icon: <BookOpenCheck className="w-5 h-5" />,
      href: "/dashboard",
    },
  ];
}

// ─── Sidebar Component ────────────────────────────────────────────────────────

export default function Sidebar({ role, userName, onLogout }: SidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const menuItems = getMenuItems(role);

  // Auto-open group if a child route is active
  // biome-ignore lint/correctness/useExhaustiveDependencies: menuItems is stable (derived from role); re-running on currentPath is intentional
  useEffect(() => {
    for (const item of menuItems) {
      if (item.children) {
        const hasActive = item.children.some(
          (child) =>
            child.href && currentPath.startsWith(child.href.split("?")[0]),
        );
        if (hasActive) {
          setOpenGroups((prev) => {
            if (prev.has(item.label)) return prev;
            const next = new Set(prev);
            next.add(item.label);
            return next;
          });
        }
      }
    }
  }, [currentPath]);

  const toggleGroup = useCallback((label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  function isLeafActive(href: string | undefined) {
    if (!href) return false;
    const cleanHref = href.split("?")[0];
    return currentPath === cleanHref || currentPath.startsWith(`${cleanHref}/`);
  }

  function isGroupActive(children: NavChild[] | undefined) {
    if (!children) return false;
    return children.some((c) => c.href && isLeafActive(c.href));
  }

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className="sidebar-cymi relative flex flex-col h-screen flex-shrink-0 transition-all duration-300 ease-in-out z-20"
        style={{ width: expanded ? 240 : 64 }}
        aria-label="Main navigation"
      >
        {/* ── Top: Logo + Toggle ── */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-white/10 flex-shrink-0">
          {expanded && (
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src="/assets/uploads/cymi-1.PNG"
                alt="CYMI"
                className="w-8 h-8 object-contain flex-shrink-0"
              />
              <span className="text-white font-bold text-sm tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                CYMI
              </span>
            </div>
          )}
          {!expanded && (
            <img
              src="/assets/uploads/cymi-1.PNG"
              alt="CYMI"
              className="w-8 h-8 object-contain mx-auto"
            />
          )}
          <button
            type="button"
            data-ocid="sidebar.toggle_button"
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto flex-shrink-0 p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* ── Scrollable Nav ── */}
        <ScrollArea className="flex-1 min-h-0">
          <nav className="py-2 px-2">
            {menuItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openGroups.has(item.label);
              const groupActive = isGroupActive(item.children);

              if (hasChildren) {
                return (
                  <div key={item.label}>
                    {/* Group toggle */}
                    {expanded ? (
                      <button
                        type="button"
                        data-ocid={item.groupOcid}
                        onClick={() => toggleGroup(item.label)}
                        className={`sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left ${groupActive ? "bg-white/15 border-l-2 border-white/80" : ""}`}
                        aria-expanded={isOpen}
                      >
                        <span
                          className={`flex-shrink-0 ${groupActive ? "text-white" : "text-white/70"}`}
                        >
                          {item.icon}
                        </span>
                        <span
                          className={`flex-1 text-sm truncate ${groupActive ? "text-white font-semibold" : "font-medium text-white/90"}`}
                        >
                          {item.label}
                        </span>
                        <span
                          className="flex-shrink-0 text-white/50 transition-transform duration-200"
                          style={{
                            transform: isOpen
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </span>
                      </button>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            data-ocid={item.groupOcid}
                            onClick={() => {
                              setExpanded(true);
                              toggleGroup(item.label);
                            }}
                            className={`sidebar-item w-full flex items-center justify-center px-3 py-2.5 rounded-md ${groupActive ? "bg-white/15" : ""}`}
                            aria-label={item.label}
                          >
                            <span
                              className={
                                groupActive ? "text-white" : "text-white/70"
                              }
                            >
                              {item.icon}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="sidebar-tooltip"
                        >
                          {item.label}
                          <ChevronRight className="w-3 h-3 inline ml-1 opacity-60" />
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Children accordion */}
                    {expanded && (
                      <div
                        className="overflow-hidden transition-all duration-200 ease-in-out"
                        style={{
                          maxHeight: isOpen
                            ? `${item.children!.length * 44}px`
                            : "0px",
                          opacity: isOpen ? 1 : 0,
                        }}
                      >
                        <div className="ml-4 pl-3 border-l border-white/10 mt-0.5 mb-1">
                          {item.children!.map((child) => {
                            const childActive = isLeafActive(child.href);
                            return (
                              <Link
                                key={child.label}
                                to={child.href ?? "/dashboard"}
                                className={`sidebar-child-item flex items-center py-2 px-3 rounded-md text-sm ${childActive ? "bg-white/20 text-white font-semibold" : ""}`}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              const leafActive = isLeafActive(item.href);

              // Leaf item
              return expanded ? (
                <Link
                  key={item.label}
                  to={item.href ?? "/dashboard"}
                  data-ocid={item.ocid}
                  className={`sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-md ${leafActive ? "bg-white/15 border-l-2 border-white/80 text-white font-semibold" : ""}`}
                >
                  <span
                    className={`flex-shrink-0 ${leafActive ? "text-white" : "text-white/70"}`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`text-sm truncate ${leafActive ? "text-white font-semibold" : "font-medium text-white/90"}`}
                  >
                    {item.label}
                  </span>
                </Link>
              ) : (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href ?? "/dashboard"}
                      data-ocid={item.ocid}
                      className={`sidebar-item flex items-center justify-center px-3 py-2.5 rounded-md ${leafActive ? "bg-white/15" : ""}`}
                      aria-label={item.label}
                    >
                      <span
                        className={leafActive ? "text-white" : "text-white/70"}
                      >
                        {item.icon}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="sidebar-tooltip">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>

        {/* ── Bottom: User + Logout ── */}
        <div
          data-ocid="sidebar.user_panel"
          className="flex-shrink-0 border-t border-white/10 px-2 py-3"
        >
          {expanded ? (
            <div className="flex items-center gap-3 px-2">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-cymi-blue flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ring-2 ring-white/20">
                {initials || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/60 text-xs mb-0.5">
                  Hi, {userName.split(" ")[0]}!
                </div>
                <div className="text-white text-xs font-semibold truncate">
                  {userName}
                </div>
                <div className="text-white/50 text-xs capitalize truncate">
                  {role}
                </div>
              </div>
              <button
                type="button"
                data-ocid="sidebar.logout_button"
                onClick={onLogout}
                title="Logout"
                className="flex-shrink-0 p-1.5 rounded text-white/50 hover:text-white hover:bg-red-500/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  data-ocid="sidebar.logout_button"
                  onClick={onLogout}
                  className="w-full flex items-center justify-center py-2 rounded-md text-white/50 hover:text-white hover:bg-red-500/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="sidebar-tooltip">
                Logout ({userName})
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
