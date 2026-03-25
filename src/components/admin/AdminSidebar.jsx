import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileUser,
  CalendarCheck,
  BookOpen,
  CreditCard,
  Clock,
  FileText,
  ClipboardList,
  Megaphone,
  Library,
  Bus,
  Award,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  X,
  Home,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const allMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "teacher", "student", "parent"] },
  { id: "students", label: "Students", icon: Users, roles: ["admin"] },
  { id: "teachers", label: "Teachers", icon: GraduationCap, roles: ["admin"] },
  { id: "admissions", label: "Admissions", icon: FileUser, roles: ["admin"] },
  { id: "attendance", label: "Attendance", icon: CalendarCheck, roles: ["admin", "teacher"] },
  { id: "grades", label: "Grades", icon: BookOpen, roles: ["admin", "teacher"] },
  { id: "fees", label: "Fees", icon: CreditCard, roles: ["admin"] },
  { id: "timetable", label: "Timetable", icon: Clock, roles: ["admin", "teacher"] },
  { id: "homework", label: "Homework", icon: FileText, roles: ["admin", "teacher"] },
  { id: "exams", label: "Exams", icon: ClipboardList, roles: ["admin"] },
  { id: "announcements", label: "Announcements", icon: Megaphone, roles: ["admin", "teacher"] },
  { id: "library", label: "Library", icon: Library, roles: ["admin"] },
  { id: "transport", label: "Transport", icon: Bus, roles: ["admin"] },
  { id: "certificates", label: "Certificates", icon: Award, roles: ["admin"] },
  { id: "analytics", label: "Analytics", icon: BarChart3, roles: ["admin"] },
  { id: "settings", label: "Settings", icon: Settings, roles: ["admin"] },
];

const AdminSidebar = ({ currentPage, setPage, collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  const menuItems = allMenuItems.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    logout();
  };

  const handleClick = (id) => {
    setPage(id);
    setMobileOpen(false);
  };

  const roleBadge = {
    admin: { label: "Admin", color: "bg-gold/20 text-gold" },
    teacher: { label: "Teacher", color: "bg-cyan/20 text-cyan" },
    student: { label: "Student", color: "bg-green-500/20 text-green-400" },
    parent: { label: "Parent", color: "bg-purple-500/20 text-purple-400" },
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <div className="flex items-center gap-2">
          {!collapsed && <span className="text-lg font-display font-bold text-gradient-gold">Aethelgard</span>}
        </div>
        <button
          onClick={() => {
            setCollapsed(!collapsed);
            setMobileOpen(false);
          }}
          className="text-text-muted hover:text-foreground transition-colors hidden lg:block"
        >
          <ChevronLeft size={18} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
        <button onClick={() => setMobileOpen(false)} className="text-text-muted lg:hidden">
          <X size={20} />
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-2">
          <span className={`px-2 py-1 rounded-full text-xs font-body font-semibold ${roleBadge[role]?.color || "bg-muted/30 text-foreground"}`}>
            {roleBadge[role]?.label || "User"}
          </span>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menuItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-200 ${
                active ? "bg-gold/15 text-gold" : "text-text-muted hover:text-foreground hover:bg-muted/30"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border/20 space-y-1">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-body text-text-muted hover:text-foreground hover:bg-muted/30 transition-colors"
          title={collapsed ? "Homepage" : undefined}
        >
          <Home size={18} className="flex-shrink-0" />
          {!collapsed && <span>Homepage</span>}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-destructive hover:bg-destructive/10 transition-colors"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 border-r border-border/20 transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
        style={{ background: "#0D1117" }}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute left-0 top-0 h-full w-64 border-r border-border/20"
            style={{ background: "#0D1117" }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
