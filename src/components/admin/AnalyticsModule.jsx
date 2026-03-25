import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import api from "@/config/api";
import { Loader2, RefreshCw, TrendingUp, Users, Award, Wallet } from "lucide-react";

const ttStyle = { background: "#161B2D", border: "1px solid #2d3548", borderRadius: 8, color: "#fff" };

const AnalyticsModule = () => {
  const { data: analytics, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await api.get("/analytics");
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  const {
    enrollmentTrend = [],
    classCounts = [],
    gradeDistribution = [],
    feePercent = 0,
    topStudents = [],
  } = analytics || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold text-foreground">Analytics & Insights</h2>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 hover:bg-muted/50 rounded-full transition-colors text-text-muted flex items-center gap-2"
        >
          <span className="text-xs">{isFetching ? "Updating..." : "Refresh"}</span>
          <RefreshCw size={20} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-gold" />
            <h3 className="font-display font-bold text-foreground">Enrollment Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            {enrollmentTrend.length > 0 ? (
              <LineChart data={enrollmentTrend}>
                <XAxis dataKey="year" stroke="#B0B8D1" fontSize={12} />
                <YAxis stroke="#B0B8D1" fontSize={12} />
                <Tooltip contentStyle={ttStyle} />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#FFD700"
                  strokeWidth={2}
                  dot={{ fill: "#FFD700", r: 4 }}
                />
              </LineChart>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted">No trend data available</div>
            )}
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-cyan" />
            <h3 className="font-display font-bold text-foreground">Class-wise Student Count</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            {classCounts.length > 0 ? (
              <BarChart data={classCounts}>
                <XAxis dataKey="cls" stroke="#B0B8D1" fontSize={12} />
                <YAxis stroke="#B0B8D1" fontSize={12} />
                <Tooltip contentStyle={ttStyle} />
                <Bar dataKey="count" fill="#00F5FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted">No class data available</div>
            )}
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-green-400" />
            <h3 className="font-display font-bold text-foreground">Overall Grade Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            {gradeDistribution.length > 0 ? (
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  dataKey="count"
                  nameKey="grade"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ grade, percent }) => `${grade} ${(percent * 100).toFixed(0)}%`}
                >
                  {gradeDistribution.map((e) => (
                    <Cell key={e.grade} fill={e.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={ttStyle} />
              </PieChart>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted">No grade data available</div>
            )}
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={18} className="text-gold" />
            <h3 className="font-display font-bold text-foreground">Fee Collection vs Target</h3>
          </div>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(225 25% 20%)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="8"
                  strokeDasharray={`${feePercent * 2.64} ${264 - feePercent * 2.64}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-bold text-gold">{feePercent}%</span>
                <span className="text-xs text-text-muted font-body">collected</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top students */}
      <div className="glass rounded-xl p-5">
        <h3 className="font-display font-bold text-foreground mb-4">Top 10 Performing Students (Overall)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                {["Rank", "Name", "Class", "Average %"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-body font-semibold text-text-muted uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topStudents.map((s, i) => (
                <tr key={`${s.name}-${i}`} className="border-b border-border/10">
                  <td className="px-4 py-2 font-body text-sm text-gold font-bold">#{i + 1}</td>
                  <td className="px-4 py-2 font-body text-sm text-foreground">{s.name}</td>
                  <td className="px-4 py-2 font-body text-sm text-text-muted">Class {s.class}</td>
                  <td className="px-4 py-2 font-body text-sm text-gold font-semibold">{s.pct}%</td>
                </tr>
              ))}
              {topStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-muted font-body">
                    No grade data available yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


export default AnalyticsModule;
