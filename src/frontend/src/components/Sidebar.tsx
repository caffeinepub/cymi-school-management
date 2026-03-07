import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart2,
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";

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
        label: "Students",
        icon: <GraduationCap className="w-5 h-5" />,
        groupOcid: "sidebar.students_group_toggle",
        children: [
          { label: "All Students", href: "/students" },
          { label: "Add Student", href: "/students" },
          { label: "Attendance" },
        ],
      },
      {
        label: "Teachers",
        icon: <Users className="w-5 h-5" />,
        groupOcid: "sidebar.teachers_group_toggle",
        children: [
          { label: "All Teachers" },
          { label: "Add Teacher" },
          { label: "Assignments" },
        ],
      },
      {
        label: "Academics",
        icon: <BookOpen className="w-5 h-5" />,
        groupOcid: "sidebar.academics_group_toggle",
        children: [
          { label: "Timetable" },
          { label: "Exams" },
          { label: "Results" },
        ],
      },
      {
        label: "Finance",
        icon: <CreditCard className="w-5 h-5" />,
        groupOcid: "sidebar.finance_group_toggle",
        children: [{ label: "Fee Management" }, { label: "Reports" }],
      },
      {
        label: "User Management",
        icon: <Users className="w-5 h-5" />,
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

  const menuItems = getMenuItems(role);

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

              if (hasChildren) {
                return (
                  <div key={item.label}>
                    {/* Group toggle */}
                    {expanded ? (
                      <button
                        type="button"
                        data-ocid={item.groupOcid}
                        onClick={() => toggleGroup(item.label)}
                        className="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left"
                        aria-expanded={isOpen}
                      >
                        <span className="flex-shrink-0 text-white/70">
                          {item.icon}
                        </span>
                        <span className="flex-1 text-sm font-medium text-white/90 truncate">
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
                            className="sidebar-item w-full flex items-center justify-center px-3 py-2.5 rounded-md"
                            aria-label={item.label}
                          >
                            <span className="text-white/70">{item.icon}</span>
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
                          {item.children!.map((child) => (
                            <a
                              key={child.label}
                              href={child.href ?? "#"}
                              className="sidebar-child-item flex items-center py-2 px-3 rounded-md text-sm"
                            >
                              {child.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Leaf item
              return expanded ? (
                <a
                  key={item.label}
                  href={item.href ?? "#"}
                  data-ocid={item.ocid}
                  className="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-md"
                >
                  <span className="flex-shrink-0 text-white/70">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium text-white/90 truncate">
                    {item.label}
                  </span>
                </a>
              ) : (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <a
                      href={item.href ?? "#"}
                      data-ocid={item.ocid}
                      className="sidebar-item flex items-center justify-center px-3 py-2.5 rounded-md"
                      aria-label={item.label}
                    >
                      <span className="text-white/70">{item.icon}</span>
                    </a>
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
