import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Eye } from "lucide-react";
import api from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";
import { getErrorMessage, getResponseData } from "@/lib/api-helpers";

const emptyAnn = {
  title: "",
  message: "",
  targetAudience: "all",
  targetClass: "",
};

const AnnouncementsModule = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAnn);
  const [preview, setPreview] = useState(null);

  // Fetch announcements
  const { data: announcements = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await api.get('/announcements');
      return getResponseData(res);
    }
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data) => api.post('/announcements', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements']);
      toast.success("Announcement posted");
      setModalOpen(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to post")
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/announcements/${editing._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements']);
      toast.success("Announcement updated");
      setModalOpen(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to update")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements']);
      toast.success("Announcement removed");
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to remove")
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyAnn);
    setModalOpen(true);
  };
  const openEdit = (a) => {
    setEditing(a);
    setForm(a);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.message) {
      toast.error("Title and message are required");
      return;
    }
    if (editing) {
      updateMutation.mutate(form);
    } else {
      addMutation.mutate(form);
    }
  };

  const handleDelete = (a) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      deleteMutation.mutate(a._id);
    }
  };

  const targetColors = {
    all: "bg-gold/20 text-gold",
    class: "bg-cyan/20 text-cyan",
    teachers: "bg-blue-500/20 text-blue-400",
    parents: "bg-purple-500/20 text-purple-400",
    students: "bg-green-500/20 text-green-400",
  };

  if (isLoading) {
    return <SectionSkeleton label="Loading announcements..." />;
  }

  if (isError) {
    return <ErrorState message={getErrorMessage(error, "Unable to load announcements.")} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-display font-bold text-foreground">Announcements</h2>
        <button onClick={openAdd} className="btn-gold py-2 px-5 text-sm flex items-center gap-2">
          <Plus size={16} /> New Announcement
        </button>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <motion.div key={a._id} layout className="glass rounded-xl p-5 border border-border/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display font-bold text-foreground">{a.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${targetColors[a.targetAudience]}`}>
                    {a.targetAudience}
                  </span>
                </div>
                <p className="text-sm text-text-muted font-body mb-2 line-clamp-2">{a.message}</p>
                <p className="text-xs text-text-muted/50 font-body">
                  {new Date(a.createdAt).toLocaleDateString()} · By {a.createdBy?.name || "Admin"}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setPreview(a)} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-gold transition-all">
                  <Eye size={16} />
                </button>
                <button onClick={() => openEdit(a)} className="p-2 hover:bg-white/10 rounded-lg text-cyan">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(a)} className="p-2 hover:bg-white/10 rounded-lg text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {announcements.length === 0 && (
          <EmptyState title="No announcements posted yet" description="Create a notice to share updates with users." />
        )}
      </div>

      {/* Form modal */}
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
              className="glass-strong rounded-2xl p-6 w-full max-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-foreground">
                  {editing ? "Edit Announcement" : "New Announcement"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-gold/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    rows={4}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-gold/60 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                <label className="block text-xs font-body text-text-muted mb-1">Target Audience</label>
                <select
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                >
                  <option value="all" className="bg-card">All</option>
                  <option value="students" className="bg-card">Students</option>
                  <option value="teachers" className="bg-card">Teachers</option>
                  <option value="parents" className="bg-card">Parents</option>
                  <option value="class" className="bg-card">Specific Class</option>
                </select>
              </div>
              {form.targetAudience === "class" && (
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Class</label>
                  <input
                    type="text"
                    placeholder="e.g. 8"
                    value={form.targetClass}
                    onChange={(e) => setForm({ ...form, targetClass: e.target.value })}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                  />
                </div>
              )}
                  <div>
                    <label className="block text-xs font-body text-text-muted mb-1">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-gold/60"
                    />
                  </div>
                </div>
              </div>
              <button onClick={handleSave} className="btn-gold w-full mt-6 py-3 text-sm">
                {editing ? "Update" : "Post Announcement"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-strong rounded-2xl p-6 w-full max-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-body font-semibold ${targetColors[preview.target]}`}>
                  To: {preview.target}
                </span>
                <button onClick={() => setPreview(null)} className="text-text-muted hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">{preview.title}</h3>
              <p className="text-sm text-text-muted font-body mb-4 whitespace-pre-wrap">{preview.message}</p>
              <div className="flex items-center justify-between text-xs text-text-muted/50 font-body">
                <span>By {preview.author}</span>
                <span>{preview.date}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementsModule;
