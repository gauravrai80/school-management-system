import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Edit2, Eye, EyeOff, Loader2, Plus, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "@/config/api";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";
import { getErrorMessage, getResponseData } from "@/lib/api-helpers";

const emptyExam = {
  name: "",
  type: "midterm",
  class: "8",
  startDate: "",
  endDate: "",
  subjects: [],
};

const allSubjects = ["Mathematics", "Science", "English", "History", "Physical Ed"];

const ExamsModule = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyExam);

  const examsQuery = useQuery({
    queryKey: ["exams"],
    queryFn: async () => getResponseData(await api.get("/exams")),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["exams"] });

  const addMutation = useMutation({
    mutationFn: (data) => api.post("/exams", data),
    onSuccess: () => {
      invalidate();
      toast.success("Exam created");
      setModalOpen(false);
      setForm(emptyExam);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/exams/${editing._id}`, data),
    onSuccess: () => {
      invalidate();
      toast.success("Exam updated");
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/exams/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Exam deleted");
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id) => api.put(`/exams/${id}/publish`),
    onSuccess: () => {
      invalidate();
      toast.success("Publish status updated");
    },
  });

  const exams = examsQuery.data ?? [];

  const openAdd = () => {
    setEditing(null);
    setForm(emptyExam);
    setModalOpen(true);
  };

  const openEdit = (exam) => {
    setEditing(exam);
    setForm({
      ...exam,
      type: String(exam.type || "midterm").toLowerCase(),
      subjects: exam.subjects || [],
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.startDate || !form.endDate) {
      toast.error("Name, start date, and end date are required");
      return;
    }

    const payload = {
      ...form,
      type: String(form.type).toLowerCase(),
    };

    if (editing) {
      updateMutation.mutate(payload);
    } else {
      addMutation.mutate(payload);
    }
  };

  const handleDelete = (exam) => {
    if (window.confirm(`Delete ${exam.name}?`)) {
      deleteMutation.mutate(exam._id);
    }
  };

  const toggleSubject = (subjectName) => {
    setForm((previous) => {
      const exists = previous.subjects.find((subject) => subject.name === subjectName);
      if (exists) {
        return {
          ...previous,
          subjects: previous.subjects.filter((subject) => subject.name !== subjectName),
        };
      }

      return {
        ...previous,
        subjects: [
          ...previous.subjects,
          {
            name: subjectName,
            date: previous.startDate || new Date().toISOString().split("T")[0],
            maxMarks: 100,
          },
        ],
      };
    });
  };

  if (examsQuery.isLoading) {
    return <SectionSkeleton label="Loading exam schedule..." />;
  }

  if (examsQuery.isError) {
    return <ErrorState message={getErrorMessage(examsQuery.error, "Unable to load exams.")} onRetry={examsQuery.refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-display font-bold text-foreground">Exam Management</h2>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 px-5 py-2 text-sm">
          <Plus size={16} /> Create Exam
        </button>
      </div>

      {exams.length ? (
        <div className="glass overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  {["Name", "Type", "Class", "Dates", "Subjects", "Published", "Actions"].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-body font-semibold uppercase text-text-muted">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam._id} className="border-b border-border/10 transition-colors hover:bg-white/5">
                    <td className="px-4 py-3 font-body text-sm font-medium text-foreground">{exam.name}</td>
                    <td className="px-4 py-3 font-body text-sm capitalize text-gold">{exam.type}</td>
                    <td className="px-4 py-3 font-body text-sm text-text-muted">Class {exam.class}</td>
                    <td className="px-4 py-3 font-body text-xs text-text-muted">
                      {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-cyan">{exam.subjects?.length || 0} papers</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => publishMutation.mutate(exam._id)}
                        className={`flex items-center gap-1 text-xs font-bold uppercase ${
                          exam.isPublished ? "text-green-500" : "text-text-muted"
                        }`}
                      >
                        {exam.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                        {exam.isPublished ? "Public" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(exam)} className="rounded-lg p-1.5 text-gold transition-colors hover:bg-white/10">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(exam)} className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-white/10">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No exams created" description="Create an exam to start publishing schedules and grades." />
      )}

      <AnimatePresence>
        {modalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-strong w-full max-w-lg rounded-2xl p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-display font-bold text-foreground">
                  {editing ? "Edit Exam" : "Create Exam"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-text-muted">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-body text-text-muted">Exam Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                    className="w-full rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:border-gold/60 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-body text-text-muted">Type</label>
                    <select
                      value={form.type}
                      onChange={(event) => setForm((previous) => ({ ...previous, type: event.target.value }))}
                      className="w-full rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:outline-none"
                    >
                      {["midterm", "final", "unit"].map((type) => (
                        <option key={type} value={type} className="bg-card">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-body text-text-muted">Class</label>
                    <select
                      value={form.class}
                      onChange={(event) => setForm((previous) => ({ ...previous, class: event.target.value }))}
                      className="w-full rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:outline-none"
                    >
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((studentClass) => (
                        <option key={studentClass} value={studentClass} className="bg-card">
                          Class {studentClass}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-body text-text-muted">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) => setForm((previous) => ({ ...previous, startDate: event.target.value }))}
                      className="w-full rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-body text-text-muted">End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(event) => setForm((previous) => ({ ...previous, endDate: event.target.value }))}
                      className="w-full rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-body text-text-muted">Subjects</label>
                  <div className="flex flex-wrap gap-2">
                    {allSubjects.map((subjectName) => {
                      const active = form.subjects.find((subject) => subject.name === subjectName);
                      return (
                        <button
                          key={subjectName}
                          type="button"
                          onClick={() => toggleSubject(subjectName)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-body transition-all ${
                            active
                              ? "border-gold bg-gold/20 text-gold"
                              : "glass border-border/30 text-text-muted hover:border-gold/50"
                          }`}
                        >
                          {subjectName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={addMutation.isPending || updateMutation.isPending}
                className="btn-gold mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
              >
                {addMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : editing ? (
                  "Update Exam"
                ) : (
                  "Create Exam"
                )}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ExamsModule;
