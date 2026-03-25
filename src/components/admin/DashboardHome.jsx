import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  UserPlus,
  ClipboardCheck,
  FileBarChart,
  Send,
} from "lucide-react";
import { useQueries, useQuery } from "@tanstack/react-query";
import api from "@/config/api";
import { fetchCollection, getResponseData } from "@/lib/api-helpers";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Legend, ChartTooltip);

const chartColors = ["#FFD700", "#00F5FF", "#4ADE80", "#FB7185", "#A78BFA"];
const axisColor = "#B0B8D1";

const DashboardHome = ({ setPage }) => {
  const [studentsQuery, teachersQuery, feeSummaryQuery, attendanceQuery, announcementsQuery, examsQuery] = useQueries({
    queries: [
      {
        queryKey: ["students", "dashboard-count"],
        queryFn: () => fetchCollection(() => api.get("/students?limit=1")),
      },
      {
        queryKey: ["teachers", "dashboard-count"],
        queryFn: () => fetchCollection(() => api.get("/teachers?limit=1")),
      },
      {
        queryKey: ["fees", "summary", "dashboard"],
        queryFn: async () => getResponseData(await api.get("/fees/summary")),
      },
      {
        queryKey: ["attendance", "report", "week"],
        queryFn: async () => getResponseData(await api.get("/attendance/report")),
      },
      {
        queryKey: ["announcements", "dashboard"],
        queryFn: async () => getResponseData(await api.get("/announcements")),
      },
      {
        queryKey: ["exams", "dashboard"],
        queryFn: async () => getResponseData(await api.get("/exams")),
      },
    ],
  });

  const latestExamId = useMemo(() => {
    const exams = examsQuery.data ?? [];
    if (!exams.length) return "";

    return [...exams].sort((a, b) => new Date(b.startDate || b.createdAt || 0) - new Date(a.startDate || a.createdAt || 0))[0]?._id;
  }, [examsQuery.data]);

  const latestGradesQuery = useQuery({
    queryKey: ["grades", "exam", latestExamId, "dashboard"],
    queryFn: async () => getResponseData(await api.get(`/grades/exam/${latestExamId}`)),
    enabled: Boolean(latestExamId),
  });

  const queries = [studentsQuery, teachersQuery, feeSummaryQuery, attendanceQuery, announcementsQuery, examsQuery];
  const isLoading = queries.some((query) => query.isLoading);
  const hasError = queries.some((query) => query.isError);

  const refetchAll = () => {
    queries.forEach((query) => query.refetch());
    latestGradesQuery.refetch();
  };

  const attendanceByDay = useMemo(() => {
    const records = attendanceQuery.data ?? [];
    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return {
        day: date.toLocaleDateString(undefined, { weekday: "short" }),
        iso: date.toISOString().slice(0, 10),
        present: 0,
      };
    });

    records.forEach((record) => {
      const iso = new Date(record.date).toISOString().slice(0, 10);
      const bucket = last7Days.find((item) => item.iso === iso);
      if (bucket && record.status === "present") {
        bucket.present += 1;
      }
    });

    return last7Days;
  }, [attendanceQuery.data]);

  const monthlyFees = useMemo(() => {
    const summary = feeSummaryQuery.data ?? {};
    return [
      { month: "Collected", amount: summary.totalCollected || 0 },
      { month: "Pending", amount: summary.totalPending || 0 },
      { month: "This Month", amount: summary.thisMonth || 0 },
    ];
  }, [feeSummaryQuery.data]);

  const gradeDistribution = useMemo(() => {
    const grades = latestGradesQuery.data ?? [];
    const buckets = grades.reduce((accumulator, grade) => {
      const percentage = grade.totalMarks ? (grade.marksObtained / grade.totalMarks) * 100 : 0;
      const label = percentage >= 90 ? "A" : percentage >= 80 ? "B" : percentage >= 70 ? "C" : percentage >= 60 ? "D" : "F";
      accumulator[label] = (accumulator[label] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(buckets).map(([name, value], index) => ({
      name,
      value,
      color: chartColors[index % chartColors.length],
    }));
  }, [latestGradesQuery.data]);

  const attendanceChartData = {
    labels: attendanceByDay.map((item) => item.day),
    datasets: [
      {
        label: "Present",
        data: attendanceByDay.map((item) => item.present),
        backgroundColor: "#FFD700",
        borderRadius: 8,
      },
    ],
  };

  const feeChartData = {
    labels: monthlyFees.map((item) => item.month),
    datasets: [
      {
        label: "Amount",
        data: monthlyFees.map((item) => item.amount),
        borderColor: "#00F5FF",
        backgroundColor: "rgba(0,245,255,0.18)",
        pointBackgroundColor: "#00F5FF",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const gradesChartData = {
    labels: gradeDistribution.map((item) => item.name),
    datasets: [
      {
        data: gradeDistribution.map((item) => item.value),
        backgroundColor: gradeDistribution.map((item) => item.color),
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: axisColor },
      },
    },
    scales: {
      x: {
        ticks: { color: axisColor },
        grid: { color: "rgba(176,184,209,0.1)" },
      },
      y: {
        ticks: { color: axisColor },
        grid: { color: "rgba(176,184,209,0.1)" },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: axisColor },
      },
    },
    cutout: "68%",
  };

  const statCards = [
    {
      label: "Total Students",
      value: studentsQuery.data?.pagination?.total || 0,
      icon: Users,
      accent: "from-gold/20 to-gold/5",
      text: "text-gold",
    },
    {
      label: "Total Teachers",
      value: teachersQuery.data?.pagination?.total || 0,
      icon: GraduationCap,
      accent: "from-cyan/20 to-cyan/5",
      text: "text-cyan",
    },
    {
      label: "Total Fees",
      value: `$${(feeSummaryQuery.data?.totalCollected || 0).toLocaleString()}`,
      icon: BookOpen,
      accent: "from-gold/20 to-gold/5",
      text: "text-gold",
    },
    {
      label: "Attendance This Week",
      value: attendanceByDay.reduce((sum, item) => sum + item.present, 0),
      icon: Calendar,
      accent: "from-cyan/20 to-cyan/5",
      text: "text-cyan",
    },
  ];

  const quickActions = [
    { label: "Add Student", icon: UserPlus, page: "students" },
    { label: "Mark Attendance", icon: ClipboardCheck, page: "attendance" },
    { label: "Generate Report", icon: FileBarChart, page: "analytics" },
    { label: "Send Notice", icon: Send, page: "announcements" },
  ];

  if (isLoading) {
    return <SectionSkeleton label="Loading dashboard overview..." />;
  }

  if (hasError) {
    return <ErrorState message="Unable to load dashboard data." onRetry={refetchAll} />;
  }

  const announcements = (announcementsQuery.data ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`glass rounded-xl bg-gradient-to-br p-5 ${card.accent}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <card.icon className={card.text} size={24} />
            </div>
            <div className={`text-2xl font-display font-bold ${card.text}`}>{card.value}</div>
            <div className="text-sm font-body text-text-muted">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass rounded-xl p-5">
          <h3 className="mb-4 font-display font-bold text-foreground">Weekly Attendance</h3>
          <div className="h-[220px]">
            <Bar data={attendanceChartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass rounded-xl p-5">
          <h3 className="mb-4 font-display font-bold text-foreground">Fee Collection Summary</h3>
          <div className="h-[220px]">
            <Line data={feeChartData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-5 lg:col-span-2">
          <h3 className="mb-4 font-display font-bold text-foreground">Recent Announcements</h3>
          {announcements.length ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="flex items-start gap-3 border-b border-border/10 pb-3 last:border-0">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                    <Send size={14} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-body font-medium text-foreground">{announcement.title}</p>
                    <p className="mt-0.5 text-xs font-body text-text-muted">{(announcement.message || "").slice(0, 100)}</p>
                    <p className="mt-1 text-[10px] font-body text-text-muted/60">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No announcements yet" description="Post a notice to surface it here for your team." />
          )}
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 font-display font-bold text-foreground">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setPage(action.page)}
                className="group flex flex-col items-center justify-center rounded-xl border border-border/10 bg-white/5 p-4 transition-all hover:bg-white/10"
              >
                <action.icon className="mb-2 text-gold transition-transform group-hover:scale-110" size={20} />
                <span className="text-center text-[10px] font-bold uppercase tracking-wider text-text-muted group-hover:text-foreground">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-5">
            <h4 className="mb-3 font-display font-bold text-foreground">Grade Distribution</h4>
            {gradeDistribution.length ? (
              <div className="h-[220px]">
                <Doughnut data={gradesChartData} options={doughnutOptions} />
              </div>
            ) : (
              <p className="text-sm font-body text-text-muted">Grade distribution will appear after exam scores are submitted.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
