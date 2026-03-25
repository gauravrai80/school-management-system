import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Edit2, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "@/config/api";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";
import { buildSearchParams, fetchCollection, getErrorMessage } from "@/lib/api-helpers";

const emptyTeacher = {
  name: "",
  email: "",
  password: "password123",
  phone: "",
  employeeId: "",
  qualification: "",
  experience: 0,
  salary: 0,
  department: "",
};

const TeachersModule = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTeacher);
  const [classesInput, setClassesInput] = useState("");
  const [subjectsInput, setSubjectsInput] = useState("");

  const teachersQuery = useQuery({
    queryKey: ["teachers", { page }],
    queryFn: () => fetchCollection(() => api.get(`/teachers${buildSearchParams({ page, limit: 10 })}`)),
  });

  const teachers = teachersQuery.data?.items ?? [];
  const pagination = teachersQuery.data?.pagination ?? { total: 0, page: 1, limit: 10 };
  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 10)));

  const invalidateTeachers = () => queryClient.invalidateQueries({ queryKey: ["teachers"] });

  const addMutation = useMutation({
    mutationFn: (payload) => api.post("/teachers", payload),
    onSuccess: () => {
      invalidateTeachers();
      toast.success("Teacher added successfully");
      setModalOpen(false);
      setForm(emptyTeacher);
      setClassesInput("");
      setSubjectsInput("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => api.put(`/teachers/${editing._id}`, payload),
    onSuccess: () => {
      invalidateTeachers();
      toast.success("Teacher updated successfully");
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/teachers/${id}`),
    onSuccess: () => {
      invalidateTeachers();
      toast.success("Teacher deactivated successfully");
    },
  });

  const departments = useMemo(() => ["All", ...new Set(teachers.map((teacher) => teacher.department))].filter(Boolean).sort(), [teachers]);

  const filtered = useMemo(
    () =>
      teachers.filter((teacher) => {
        const name = teacher.userId?.name || "";
        const matchesSearch =
          name.toLowerCase().includes(search.toLowerCase()) ||
          (teacher.employeeId || "").toLowerCase().includes(search.toLowerCase()) ||
          (teacher.subjects || []).some((subject) => subject.toLowerCase().includes(search.toLowerCase()));
        const matchesDepartment = filterDept === "All" || teacher.department === filterDept;
        return matchesSearch && matchesDepartment;
      }),
    [filterDept, search, teachers],
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyTeacher);
    setClassesInput("");
    setSubjectsInput("");
    setModalOpen(true);
  };

  const openEdit = (teacher) => {
    setEditing(teacher);
    setForm({
      name: teacher.userId?.name || "",
      email: teacher.userId?.email || "",
      password: "",
      phone: teacher.userId?.phone || "",
      employeeId: teacher.employeeId || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || 0,
      salary: teacher.salary || 0,
      department: teacher.department || "",
    });
    setClassesInput((teacher.classes || []).join(", "));
    setSubjectsInput((teacher.subjects || []).join(", "));
    setModalOpen(true);
  };

  const handleSave = () => {
    const subjects = subjectsInput.split(",").map((value) => value.trim()).filter(Boolean);
    const classes = classesInput.split(",").map((value) => value.trim()).filter(Boolean);

    if (!form.name || !form.employeeId || !form.department || !subjects.length || !classes.length) {
      toast.error("Complete the required teacher fields before saving.");
      return;
    }

    const payload = {
      employeeId: form.employeeId,
      phone: form.phone,
      subjects,
      classes,
      qualification: form.qualification,
      experience: Number(form.experience) || 0,
      salary: Number(form.salary) || 0,
      department: form.department,
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

  const handleDelete = (teacher) => {
    if (window.confirm(`Deactivate ${teacher.userId?.name}?`)) {
      deleteMutation.mutate(teacher._id);
    }
  };

  if (teachersQuery.isLoading) {
    return <SectionSkeleton label="Loading teachers..." />;
  }

  if (teachersQuery.isError) {
    return <ErrorState message={getErrorMessage(teachersQuery.error, "Unable to load teachers.")} onRetry={teachersQuery.refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-display font-bold text-foreground">Teachers</h2>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 px-5 py-2 text-sm">
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/30 bg-muted/30 px-3 py-2">
          <Search size={16} className="text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, subject, or employee ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-text-muted/50 focus:outline-none"
          />
        </div>
        <select value={filterDept} onChange={(event) => setFilterDept(event.target.value)} className="rounded-lg border border-border/30 bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none">
          {departments.map((department) => (
            <option key={department} value={department} className="bg-card">
              {department === "All" ? "All Departments" : department}
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
                  {["Teacher", "Subjects", "Department", "Qualification", "Experience", "Actions"].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-body font-semibold uppercase tracking-wider text-text-muted">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((teacher) => (
                  <motion.tr key={teacher._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group border-b border-border/10 transition-colors hover:bg-white/5">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
                          {(teacher.userId?.name || "??").split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-body font-semibold text-foreground">{teacher.userId?.name}</div>
                          <div className="text-[10px] text-text-muted">{teacher.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-muted">{(teacher.subjects || []).join(", ")}</td>
                    <td className="px-4 py-4 text-sm text-text-muted">{teacher.department}</td>
                    <td className="px-4 py-4 text-sm text-text-muted">{teacher.qualification}</td>
                    <td className="px-4 py-4 text-sm text-text-muted">{teacher.experience} years</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => openEdit(teacher)} className="rounded-lg p-2 text-gold hover:bg-white/10">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(teacher)} className="rounded-lg p-2 text-red-500 hover:bg-white/10">
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
        <EmptyState title="No teachers found" description="Try a different search or add your first teacher." />
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
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6" onClick={(event) => event.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-display font-bold text-foreground">{editing ? "Edit Teacher" : "Add Teacher"}</h3>
                <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "name", label: "Full Name", span: 2, createOnly: true },
                  { key: "email", label: "Email", type: "email", span: 2, createOnly: true },
                  { key: "password", label: "Password", type: "password", span: 2, createOnly: true },
                  { key: "employeeId", label: "Employee ID" },
                  { key: "department", label: "Department" },
                  { key: "qualification", label: "Qualification" },
                  { key: "experience", label: "Experience (years)", type: "number" },
                  { key: "salary", label: "Salary", type: "number" },
                  { key: "phone", label: "Phone" },
                ]
                  .filter((field) => !field.createOnly || !editing)
                  .map((field) => (
                    <div key={field.key} className={field.span === 2 ? "col-span-2" : ""}>
                      <label className="mb-1 block text-xs font-body text-text-muted">{field.label}</label>
                      <input type={field.type || "text"} value={form[field.key] || ""} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} className="w-full rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:border-gold/60 focus:outline-none" />
                    </div>
                  ))}
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-body text-text-muted">Subjects (comma separated)</label>
                  <input type="text" value={subjectsInput} onChange={(event) => setSubjectsInput(event.target.value)} className="w-full rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:border-gold/60 focus:outline-none" placeholder="Mathematics, Science" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-body text-text-muted">Classes (comma separated)</label>
                  <input type="text" value={classesInput} onChange={(event) => setClassesInput(event.target.value)} className="w-full rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:border-gold/60 focus:outline-none" placeholder="8A, 8B, 9A" />
                </div>
              </div>

              <button onClick={handleSave} disabled={addMutation.isPending || updateMutation.isPending} className="btn-gold mt-6 flex w-full items-center justify-center gap-2 py-3 text-sm">
                {addMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : null}
                {editing ? "Update Teacher" : "Add Teacher"}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default TeachersModule;
