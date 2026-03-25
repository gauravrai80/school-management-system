import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Edit2, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "@/config/api";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";
import { buildSearchParams, fetchCollection, getErrorMessage } from "@/lib/api-helpers";

const emptyStudent = {
  name: "",
  email: "",
  password: "password123",
  rollNumber: "",
  class: "",
  section: "",
  dateOfBirth: "",
  gender: "male",
  address: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
};

const StudentsModule = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyStudent);

  const studentsQuery = useQuery({
    queryKey: ["students", { page, filterClass }],
    queryFn: () =>
      fetchCollection(() =>
        api.get(`/students${buildSearchParams({ page, limit: 10, class: filterClass === "All" ? "" : filterClass })}`),
      ),
  });

  const students = studentsQuery.data?.items ?? [];
  const pagination = studentsQuery.data?.pagination ?? { total: 0, page: 1, limit: 10 };

  const invalidateStudents = () => queryClient.invalidateQueries({ queryKey: ["students"] });

  const addMutation = useMutation({
    mutationFn: (payload) => api.post("/students", payload),
    onSuccess: () => {
      invalidateStudents();
      toast.success("Student added successfully");
      setModalOpen(false);
      setForm(emptyStudent);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => api.put(`/students/${editing._id}`, payload),
    onSuccess: () => {
      invalidateStudents();
      toast.success("Student updated successfully");
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/students/${id}`),
    onSuccess: () => {
      invalidateStudents();
      toast.success("Student deactivated successfully");
    },
  });

  const classes = useMemo(() => ["All", ...new Set(students.map((student) => student.class))].filter(Boolean).sort(), [students]);

  const filtered = useMemo(
    () =>
      students.filter((student) => {
        const name = student.userId?.name || "";
        return (
          name.toLowerCase().includes(search.toLowerCase()) ||
          (student.rollNumber || "").toLowerCase().includes(search.toLowerCase()) ||
          (student.parentPhone || "").includes(search)
        );
      }),
    [search, students],
  );

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 10)));

  const openAdd = () => {
    setEditing(null);
    setForm(emptyStudent);
    setModalOpen(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    setForm({
      name: student.userId?.name || "",
      email: student.userId?.email || "",
      password: "",
      rollNumber: student.rollNumber || "",
      class: student.class || "",
      section: student.section || "",
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : "",
      gender: student.gender || "male",
      address: student.address || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      parentEmail: student.parentEmail || "",
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.rollNumber || !form.class || !form.section || !form.dateOfBirth || !form.parentName || !form.parentPhone) {
      toast.error("Please complete the required student fields before saving.");
      return;
    }

    const payload = {
      rollNumber: form.rollNumber,
      class: form.class,
      section: form.section,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      address: form.address,
      parentName: form.parentName,
      parentPhone: form.parentPhone,
      parentEmail: form.parentEmail,
      ...(editing
        ? {}
        : {
            name: form.name,
            email: form.email,
            password: form.password,
          }),
    };

    if (editing) {
      updateMutation.mutate(payload);
    } else {
      addMutation.mutate(payload);
    }
  };

  const handleDelete = (student) => {
    if (window.confirm(`Deactivate ${student.userId?.name}?`)) {
      deleteMutation.mutate(student._id);
    }
  };

  if (studentsQuery.isLoading) {
    return <SectionSkeleton label="Loading students..." />;
  }

  if (studentsQuery.isError) {
    return <ErrorState message={getErrorMessage(studentsQuery.error, "Unable to load students.")} onRetry={studentsQuery.refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-display font-bold text-foreground">Students</h2>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 px-5 py-2 text-sm">
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/30 bg-muted/30 px-3 py-2">
          <Search size={16} className="text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, roll number, or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-text-muted/50 focus:outline-none"
          />
        </div>
        <select
          value={filterClass}
          onChange={(event) => {
            setFilterClass(event.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border/30 bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none"
        >
          {classes.map((studentClass) => (
            <option key={studentClass} value={studentClass} className="bg-card">
              {studentClass === "All" ? "All Classes" : `Class ${studentClass}`}
            </option>
          ))}
        </select>
      </div>

      {filtered.length ? (
        <div className="glass overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  {["Student", "Class", "Roll", "Parent", "Fee Status", "Actions"].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-body font-semibold uppercase tracking-wider text-text-muted">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <motion.tr key={student._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group border-b border-border/10 transition-colors hover:bg-white/5">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
                          {(student.userId?.name || "??")
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-body font-semibold text-foreground">{student.userId?.name}</div>
                          <div className="text-xs text-text-muted">{student.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-muted">
                      {student.class} - {student.section}
                    </td>
                    <td className="px-4 py-4 text-sm text-text-muted">{student.rollNumber}</td>
                    <td className="px-4 py-4 text-sm text-text-muted">
                      <div>{student.parentName}</div>
                      <div className="text-xs">{student.parentPhone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${student.feeStatus === "paid" ? "bg-green-500/20 text-green-500" : student.feeStatus === "partial" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"}`}>
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => openEdit(student)} className="rounded-lg p-2 text-gold hover:bg-white/10">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(student)} className="rounded-lg p-2 text-red-500 hover:bg-white/10">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No students found" description="Try a different search or add your first student." />
      )}

      <div className="flex items-center justify-between rounded-xl border border-border/10 bg-muted/10 px-4 py-3">
        <p className="text-sm text-text-muted">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-lg border border-border/20 px-3 py-2 text-sm text-foreground disabled:opacity-50">
            Previous
          </button>
          <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} className="rounded-lg border border-border/20 px-3 py-2 text-sm text-foreground disabled:opacity-50">
            Next
          </button>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-strong max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6" onClick={(event) => event.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-display font-bold text-foreground">{editing ? "Edit Student" : "Add Student"}</h3>
                <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "name", label: "Full Name", type: "text", span: 2, createOnly: true },
                  { key: "email", label: "Email", type: "email", span: 2, createOnly: true },
                  { key: "password", label: "Password", type: "password", span: 2, createOnly: true },
                  { key: "dateOfBirth", label: "Date of Birth", type: "date" },
                  { key: "rollNumber", label: "Roll Number", type: "text" },
                  { key: "class", label: "Class", type: "text" },
                  { key: "section", label: "Section", type: "text" },
                  { key: "address", label: "Address", type: "text", span: 2 },
                  { key: "parentName", label: "Parent Name", type: "text" },
                  { key: "parentPhone", label: "Parent Phone", type: "tel" },
                  { key: "parentEmail", label: "Parent Email", type: "email", span: 2 },
                ]
                  .filter((field) => !field.createOnly || !editing)
                  .map((field) => (
                    <div key={field.key} className={field.span === 2 ? "col-span-2" : ""}>
                      <label className="mb-1 block text-xs font-body text-text-muted">{field.label}</label>
                      <input type={field.type} value={form[field.key] || ""} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} className="w-full rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:border-gold/60 focus:outline-none" />
                    </div>
                  ))}
                <div>
                  <label className="mb-1 block text-xs font-body text-text-muted">Gender</label>
                  <select value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))} className="w-full rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:outline-none">
                    {["male", "female", "other"].map((gender) => (
                      <option key={gender} value={gender} className="bg-card">
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button onClick={handleSave} disabled={addMutation.isPending || updateMutation.isPending} className="btn-gold mt-6 flex w-full items-center justify-center gap-2 py-3 text-sm">
                {addMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : null}
                {editing ? "Update Student" : "Add Student"}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default StudentsModule;
