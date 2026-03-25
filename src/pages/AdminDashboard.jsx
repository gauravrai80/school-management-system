import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopNav from "@/components/admin/AdminTopNav";
import DashboardHome from "@/components/admin/DashboardHome";
import StudentsModule from "@/components/admin/StudentsModule";
import TeachersModule from "@/components/admin/TeachersModule";
import AdmissionsModule from "@/components/admin/AdmissionsModule";
import AttendanceModule from "@/components/admin/AttendanceModule";
import FeesModule from "@/components/admin/FeesModule";
import AnnouncementsModule from "@/components/admin/AnnouncementsModule";
import GradesModule from "@/components/admin/GradesModule";
import TimetableModule from "@/components/admin/TimetableModule";
import HomeworkModule from "@/components/admin/HomeworkModule";
import ExamsModule from "@/components/admin/ExamsModule";
import LibraryModule from "@/components/admin/LibraryModule";
import TransportModule from "@/components/admin/TransportModule";
import CertificatesModule from "@/components/admin/CertificatesModule";
import AnalyticsModule from "@/components/admin/AnalyticsModule";
import SettingsModule from "@/components/admin/SettingsModule";
import ParentPortal from "@/components/admin/ParentPortal";
import StudentPortal from "@/components/admin/StudentPortal";
import TeacherPortal from "@/components/admin/TeacherPortal";
import { useAuth } from "@/context/AuthContext";

const PlaceholderModule = ({ title }) => (
  <div className="flex items-center justify-center h-64 glass rounded-xl">
    <div className="text-center">
      <h2 className="text-2xl font-display font-bold text-foreground mb-2">{title}</h2>
      <p className="text-text-muted font-body text-sm">This module is coming soon.</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { role } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderPage = () => {
    // Role-specific dashboard views
    if (currentPage === "dashboard") {
      switch (role) {
        case "parent":
          return <ParentPortal />;
        case "student":
          return <StudentPortal />;
        case "teacher":
          return <TeacherPortal />;
        default:
          return <DashboardHome setPage={setCurrentPage} />;
      }
    }

    // Admin/teacher modules
    switch (currentPage) {
      case "students":
        return <StudentsModule />;
      case "teachers":
        return <TeachersModule />;
      case "admissions":
        return <AdmissionsModule />;
      case "attendance":
        return <AttendanceModule />;
      case "grades":
        return <GradesModule />;
      case "fees":
        return <FeesModule />;
      case "timetable":
        return <TimetableModule />;
      case "homework":
        return <HomeworkModule />;
      case "exams":
        return <ExamsModule />;
      case "announcements":
        return <AnnouncementsModule />;
      case "library":
        return <LibraryModule />;
      case "transport":
        return <TransportModule />;
      case "certificates":
        return <CertificatesModule />;
      case "analytics":
        return <AnalyticsModule />;
      case "settings":
        return <SettingsModule />;
      default:
        return <DashboardHome setPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#161B22" }}>
      <AdminSidebar
        currentPage={currentPage}
        setPage={setCurrentPage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"}`}>
        <AdminTopNav onHamburger={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6">{renderPage()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
