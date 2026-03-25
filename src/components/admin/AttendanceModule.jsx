import { useState, useEffect } from "react";
import api from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Download, Loader2 } from "lucide-react";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";
import { getErrorMessage, getResponseData } from "@/lib/api-helpers";

const AttendanceModule = () => {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState("8");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});

  // Fetch students for selected class/section
  const studentsQuery = useQuery({
    queryKey: ['students', selectedClass, selectedSection],
    queryFn: async () => {
      const res = await api.get(`/students?class=${selectedClass}&section=${selectedSection}`);
      return getResponseData(res);
    }
  });

  // Fetch today's attendance for this class/section
  const attendanceQuery = useQuery({
    queryKey: ['attendance', selectedClass, selectedSection, selectedDate],
    queryFn: async () => {
      const res = await api.get(`/attendance/class/${selectedClass}/${selectedSection}?date=${selectedDate}`);
      return getResponseData(res);
    }
  });

  const students = studentsQuery.data ?? [];
  const existingRecords = attendanceQuery.data ?? [];

  // Initialize attendance state when students or existing records load
  useEffect(() => {
    const init = {};
    students.forEach((s) => {
      const existing = existingRecords.find((r) => r.studentId?._id === s._id);
      init[s._id] = existing?.status || "present";
    });
    setAttendance(init);
  }, [students, existingRecords]);

  const markMutation = useMutation({
    mutationFn: (data) => api.post('/attendance/mark', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance']);
      toast.success("Attendance marked successfully");
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to mark attendance")
  });

  const toggleStatus = (studentId) => {
    setAttendance((prev) => {
      const current = prev[studentId];
      const next = current === "present" ? "absent" : current === "absent" ? "late" : "present";
      return { ...prev, [studentId]: next };
    });
  };

  const submitAttendance = () => {
    const attendanceArray = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status
    }));

    markMutation.mutate({
      attendanceArray,
      date: selectedDate,
      class: selectedClass,
      section: selectedSection
    });
  };

  if (studentsQuery.isLoading || attendanceQuery.isLoading) {
    return <SectionSkeleton label="Loading attendance data..." />;
  }

  if (studentsQuery.isError || attendanceQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(studentsQuery.error || attendanceQuery.error, "Unable to load attendance data.")}
        onRetry={() => {
          studentsQuery.refetch();
          attendanceQuery.refetch();
        }}
      />
    );
  }
  const downloadCSV = () => {
    toast.error("Reporting feature under development with real API");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Attendance</h2>
          <p className="text-sm text-text-muted font-body">Mark and track daily attendance</p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-muted/30 hover:bg-muted/50 text-text-muted hover:text-foreground px-4 py-2 rounded-lg border border-border/30 transition-all text-sm font-body"
        >
          <Download size={16} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-xl border border-border/20">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted px-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg px-3 py-2 text-sm font-body focus:border-gold outline-none transition-all"
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted px-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg px-3 py-2 text-sm font-body focus:border-gold outline-none transition-all"
          >
            {["A", "B", "C", "D"].map((s) => (
              <option key={s} value={s}>
                Section {s}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted px-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg px-3 py-2 text-sm font-body focus:border-gold outline-none transition-all"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={submitAttendance}
            disabled={markMutation.isPending}
            className="w-full btn-gold py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
          >
            {markMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden border border-border/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-border/10">
                <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-bold text-text-muted">Student</th>
                <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-bold text-text-muted">Roll Number</th>
                <th className="py-4 px-6 text-center text-[10px] uppercase tracking-wider font-bold text-text-muted">Status</th>
                <th className="py-4 px-6 text-right text-[10px] uppercase tracking-wider font-bold text-text-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-body font-semibold text-foreground">{s.userId?.name}</td>
                  <td className="py-4 px-6 font-body text-sm text-text-muted">{s.rollNumber}</td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          attendance[s._id] === "present"
                            ? "bg-green-500/20 text-green-500"
                            : attendance[s._id] === "absent"
                            ? "bg-red-500/20 text-red-500"
                            : "bg-yellow-500/20 text-yellow-500"
                        }`}
                      >
                        {attendance[s._id]}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => toggleStatus(s._id)}
                      className="text-[10px] font-bold uppercase text-gold hover:text-gold-hover transition-colors"
                    >
                      Cycle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {students.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No students in this class" description="Try another class-section pair to mark attendance." />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AttendanceModule;
