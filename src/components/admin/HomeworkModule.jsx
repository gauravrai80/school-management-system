import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, Check, Clock, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import api from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";
import { getErrorMessage, getResponseData } from "@/lib/api-helpers";

const allSubjects = ["Mathematics", "Science", "English", "History", "Physical Ed"];

const HomeworkModule = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewHw, setViewHw] = useState(null);
  const [form, setForm] = useState({
    class: "8",
    section: "A",
    subject: "Mathematics",
    title: "",
    description: "",
    dueDate: "",
  });

  const today = new Date().toISOString().split("T")[0];

  // Fetch homework
  const { data: homework = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['homework'],
    queryFn: async () => {
      const res = await api.get('/homework');
      return getResponseData(res);
    }
  });

  // Fetch students for viewing submissions
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await api.get('/students?limit=1000');
      return getResponseData(res);
    }
  });

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/homework', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['homework']);
      toast.success("Homework posted");
      setModalOpen(false);
      setForm({ class: "8", section: "A", subject: "Mathematics", title: "", description: "", dueDate: "" });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to post")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/homework/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['homework']);
      toast.success("Homework removed");
    }
  });

  const getStatus = (hw) => {
    const due = new Date(hw.dueDate).toISOString().split("T")[0];
    if (due < today) return "Overdue";
    if (due === today) return "Due Today";
    return "Active";
  };

  const statusBadge = (status) => {
    const colors = {
      Active: "bg-green-500/20 text-green-400",
      "Due Today": "bg-yellow-500/20 text-yellow-400",
      Overdue: "bg-destructive/20 text-destructive",
    };
    const icons = { Active: Check, "Due Today": Clock, Overdue: AlertTriangle };
    const Icon = icons[status] || Check;
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${colors[status]}`}>
        <Icon size={10} /> {status}
      </span>
    );
  };

  const handlePost = () => {
    if (!form.title || !form.dueDate) {
      toast.error("Title and due date required");
      return;
    }
    addMutation.mutate(form);
  };

  const viewingHw = homework.find((h) => h._id === viewHw);

  if (isLoading) {
    return <SectionSkeleton label="Loading assignments..." />;
  }

  if (isError) {
    return <ErrorState message={getErrorMessage(error, "Unable to load assignments.")} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-display font-bold text-foreground">Homework & Assignments</h2>
        <button onClick={() => setModalOpen(true)} className="btn-gold py-2 px-5 text-sm flex items-center gap-2">
          <Plus size={16} /> Post Assignment
        </button>
      </div>

      <div className="space-y-3">
        {homework.map((hw) => (
          <div
            key={hw._id}
            className="glass rounded-xl p-5 border border-border/10 hover:border-gold/30 transition-all group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display font-bold text-foreground">{hw.title}</h3>
                  {statusBadge(getStatus(hw))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted font-body">
                  <span className="text-gold font-bold">Class {hw.class}-{hw.section}</span>
                  <span className="text-cyan">{hw.subject}</span>
                  <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewHw(hw._id)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-foreground transition-all text-xs font-bold uppercase tracking-wider"
                >
                  View Submissions ({hw.submissions?.length || 0})
                </button>
                <button
                  onClick={() => deleteMutation.mutate(hw._id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {homework.length === 0 && (
          <EmptyState title="No assignments posted yet" description="Post an assignment to start tracking submissions." />
        )}
      </div>

      {/* Post modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-foreground">Post Assignment</h3>
                <button onClick={() => setModalOpen(false)} className="text-text-muted">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-body text-text-muted mb-1">Class</label>
                    <select
                      value={form.class}
                      onChange={(e) => setForm({ ...form, class: e.target.value })}
                      className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                    >
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => (
                        <option key={c} value={c} className="bg-card">Class {c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-body text-text-muted mb-1">Section</label>
                    <select
                      value={form.section}
                      onChange={(e) => setForm({ ...form, section: e.target.value })}
                      className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                    >
                      {["A", "B", "C", "D"].map((s) => (
                        <option key={s} value={s} className="bg-card">Section {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                  >
                    {allSubjects.map((s) => (
                      <option key={s} value={s} className="bg-card">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-gold/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-gold/60 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-body text-text-muted mb-1">Due Date</label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-body text-text-muted mb-1">Attachment (name)</label>
                    <input
                      type="text"
                      value={form.fileName}
                      onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                      placeholder="worksheet.pdf"
                      className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-gold/60"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handlePost}
                disabled={addMutation.isPending}
                className="w-full btn-gold py-3 rounded-xl text-sm font-bold mt-6 flex items-center justify-center gap-2"
              >
                {addMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Post Assignment"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submissions Modal */}
      <AnimatePresence>
        {viewHw && viewingHw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <div className="glass-strong rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-foreground">{viewingHw.title}</h3>
                  <p className="text-xs text-text-muted font-body">Submissions for Class {viewingHw.class}-{viewingHw.section}</p>
                </div>
                <button onClick={() => setViewHw(null)} className="text-text-muted hover:text-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-card border-b border-border/10">
                    <tr>
                      <th className="px-4 py-3 text-[10px] uppercase font-bold text-text-muted">Student</th>
                      <th className="px-4 py-3 text-[10px] uppercase font-bold text-text-muted">Status</th>
                      <th className="px-4 py-3 text-[10px] uppercase font-bold text-text-muted">Submitted At</th>
                      <th className="px-4 py-3 text-right text-[10px] uppercase font-bold text-text-muted">File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter(s => s.class === viewingHw.class && s.section === viewingHw.section)
                      .map((student) => {
                        const sub = viewingHw.submissions?.find(s => s.studentId === student._id);
                        return (
                          <tr key={student._id} className="border-b border-border/10 hover:bg-white/5">
                            <td className="px-4 py-3 font-body text-sm text-foreground">{student.userId?.name}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                              }`}>
                                {sub ? "Submitted" : "Pending"}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-body text-xs text-text-muted">
                              {sub ? new Date(sub.submittedAt).toLocaleString() : "-"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {sub?.fileUrl ? (
                                <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="text-gold text-xs font-bold hover:underline">View</a>
                              ) : "-"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeworkModule;
