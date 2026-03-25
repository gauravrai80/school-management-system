import { useState, useMemo } from "react";
import api from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Printer, X, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];
const subjectColors = {
  Mathematics: "bg-gold/20 text-gold border-gold/30",
  Science: "bg-cyan/20 text-cyan border-cyan/30",
  English: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  History: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Physical Ed": "bg-green-500/20 text-green-400 border-green-500/30",
};

const allSubjects = ["Mathematics", "Science", "English", "History", "Physical Ed"];

const TimetableModule = () => {
  const queryClient = useQueryClient();
  const [selClass, setSelClass] = useState("8");
  const [selSection, setSelSection] = useState("A");
  const [editCell, setEditCell] = useState(null);
  const [cellSubject, setCellSubject] = useState("");
  const [cellTeacher, setCellTeacher] = useState("");
  const [cellRoom, setCellRoom] = useState("");

  // Fetch teachers
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await api.get('/teachers?limit=100');
      return res.data.data;
    }
  });

  // Fetch timetable
  const { data: timetable = null, isLoading } = useQuery({
    queryKey: ['timetable', selClass, selSection],
    queryFn: async () => {
      try {
        const res = await api.get(`/timetable/${selClass}/${selSection}`);
        return res.data.data;
      } catch (err) {
        if (err.response?.status === 404) return { schedule: [] };
        throw err;
      }
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data) => api.post('/timetable', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['timetable']);
      toast.success("Timetable updated");
      setEditCell(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to save")
  });

  const getCell = (day, period) => {
    return timetable?.schedule?.find(s => s.day === day && s.period === period) || null;
  };

  const openEdit = (day, period) => {
    const cell = getCell(day, period);
    setCellSubject(cell?.subject || "");
    setCellTeacher(cell?.teacherId?._id || "");
    setCellRoom(cell?.room || "");
    setEditCell({ day, period });
  };

  const saveCell = () => {
    if (!editCell) return;
    
    const newSchedule = [...(timetable?.schedule || [])];
    const cellIndex = newSchedule.findIndex(s => s.day === editCell.day && s.period === editCell.period);
    
    if (cellSubject) {
      const newCell = { 
        day: editCell.day, 
        period: editCell.period, 
        subject: cellSubject, 
        teacherId: cellTeacher,
        room: cellRoom 
      };
      if (cellIndex !== -1) newSchedule[cellIndex] = newCell;
      else newSchedule.push(newCell);
    } else if (cellIndex !== -1) {
      newSchedule.splice(cellIndex, 1);
    }

    saveMutation.mutate({
      class: selClass,
      section: selSection,
      schedule: newSchedule
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-gold" size={40} />
        <p className="text-text-muted font-body">Loading timetable...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-display font-bold text-foreground">Timetable Builder</h2>
        <button onClick={() => window.print()} className="btn-cyan-outline py-2 px-5 text-sm flex items-center gap-2">
          <Printer size={16} /> Print
        </button>
      </div>

      <div className="flex gap-3">
        <select
          value={selClass}
          onChange={(e) => setSelClass(e.target.value)}
          className="bg-muted/30 border border-border/30 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
        >
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => (
            <option key={c} value={c} className="bg-card">Class {c}</option>
          ))}
        </select>
        <select
          value={selSection}
          onChange={(e) => setSelSection(e.target.value)}
          className="bg-muted/30 border border-border/30 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
        >
          {["A", "B", "C", "D"].map((s) => (
            <option key={s} value={s} className="bg-card">Section {s}</option>
          ))}
        </select>
      </div>

      <div className="glass rounded-xl overflow-hidden border border-border/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-border/10">
                <th className="px-3 py-4 text-[10px] font-bold text-text-muted uppercase w-16 text-center">Day</th>
                {periods.map((p) => (
                  <th key={p} className="px-3 py-4 text-[10px] font-bold text-text-muted uppercase text-center min-w-[120px]">
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day} className="border-b border-border/10 last:border-0">
                  <td className="px-3 py-4 text-xs font-bold text-gold bg-white/5 text-center">{day}</td>
                  {periods.map((p) => {
                    const cell = getCell(day, p);
                    const teacher = cell ? teachers.find(t => t._id === (cell.teacherId?._id || cell.teacherId)) : null;
                    return (
                      <td
                        key={`${day}-${p}`}
                        onClick={() => openEdit(day, p)}
                        className="px-2 py-2 cursor-pointer hover:bg-white/5 transition-colors group relative"
                      >
                        {cell ? (
                          <div
                            className={`p-2 rounded-lg border text-[10px] font-body text-center shadow-sm ${
                              subjectColors[cell.subject] || "bg-muted/30 text-text-muted border-border/30"
                            }`}
                          >
                            <div className="font-bold uppercase tracking-tight">{cell.subject}</div>
                            <div className="opacity-70 mt-0.5 truncate">
                              {teacher?.userId?.name || "TBA"}
                            </div>
                            {cell.room && <div className="text-[8px] opacity-50 mt-0.5">Room {cell.room}</div>}
                          </div>
                        ) : (
                          <div className="h-12 border border-dashed border-border/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={14} className="text-text-muted" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editCell && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setEditCell(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-sm space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-foreground">
                  Edit: {editCell.day} - Period {editCell.period}
                </h3>
                <button onClick={() => setEditCell(null)} className="text-text-muted">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Subject</label>
                  <select
                    value={cellSubject}
                    onChange={(e) => setCellSubject(e.target.value)}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                  >
                    <option value="" className="bg-card">None / Free Period</option>
                    {allSubjects.map((s) => (
                      <option key={s} value={s} className="bg-card">{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Teacher</label>
                  <select
                    value={cellTeacher}
                    onChange={(e) => setCellTeacher(e.target.value)}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                  >
                    <option value="" className="bg-card">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id} className="bg-card">{t.userId?.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Room No.</label>
                  <input
                    type="text"
                    placeholder="e.g. 101"
                    value={cellRoom}
                    onChange={(e) => setCellRoom(e.target.value)}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={saveCell}
                disabled={saveMutation.isPending}
                className="w-full btn-gold py-3 rounded-xl text-sm font-bold mt-2 flex items-center justify-center gap-2"
              >
                {saveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Save Cell"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimetableModule;
