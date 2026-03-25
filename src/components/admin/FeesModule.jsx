import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CreditCard, DollarSign, AlertCircle, Loader2, PencilLine } from "lucide-react";
import api from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { buildSearchParams, fetchCollection, getErrorMessage } from "@/lib/api-helpers";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";

const FeesModule = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingFee, setEditingFee] = useState(null);
  const [payForm, setPayForm] = useState({
    studentId: "",
    feeType: "tuition",
    amount: 0,
    dueDate: new Date().toISOString().split("T")[0],
    academicYear: "2025-2026",
  });

  // Fetch all fees
  const feesQuery = useQuery({
    queryKey: ['fees', page, statusFilter],
    queryFn: () => fetchCollection(() => api.get(`/fees${buildSearchParams({ page, limit: 10, status: statusFilter === "All" ? "" : statusFilter })}`)),
  });

  // Fetch fee summary
  const { data: summary = { totalCollected: 0, totalPending: 0, thisMonth: 0 }, isLoading: loadingSummary } = useQuery({
    queryKey: ['fees', 'summary'],
    queryFn: async () => {
      const res = await api.get('/fees/summary');
      return res.data.data;
    }
  });

  // Fetch students for selection
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await api.get('/students?limit=1000');
      return res.data.data;
    }
  });

  const updateFeeMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/fees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success("Fee updated");
      setEditingFee(null);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update fee")),
  });

  const createFeeMutation = useMutation({
    mutationFn: (data) => api.post('/fees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast.success("Fee record created");
      setModalOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to create fee record"))
  });

  const handleCreateFee = () => {
    if (!payForm.studentId || payForm.amount <= 0) {
      toast.error("Select a student and enter a valid amount");
      return;
    }
    createFeeMutation.mutate(payForm);
  };

  if (feesQuery.isLoading || loadingSummary) {
    return <SectionSkeleton label="Loading fee records..." />;
  }

  if (feesQuery.isError) {
    return <ErrorState message="Unable to load fee records." onRetry={feesQuery.refetch} />;
  }

  const fees = feesQuery.data?.items ?? [];
  const pagination = feesQuery.data?.pagination ?? { page: 1, limit: 10, total: 0 };
  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 10)));

  return (
    <div className="p-6 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Collected",
            value: `$${summary.totalCollected.toLocaleString()}`,
            icon: DollarSign,
            accent: "text-green-400",
          },
          {
            label: "Total Pending",
            value: `$${summary.totalPending.toLocaleString()}`,
            icon: AlertCircle,
            accent: "text-destructive",
          },
          { label: "This Month", value: `$${summary.thisMonth.toLocaleString()}`, icon: CreditCard, accent: "text-gold" },
        ].map((card) => (
          <div key={card.label} className="glass rounded-xl p-5">
            <card.icon className={card.accent} size={22} />
            <div className={`text-2xl font-display font-bold ${card.accent} mt-2`}>{card.value}</div>
            <div className="text-sm text-text-muted font-body">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-3">
          <select value={statusFilter} onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }} className="bg-muted/30 border border-border/30 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none">
            {["All", "paid", "pending", "overdue"].map((status) => (
              <option key={status} value={status} className="bg-card">
                {status === "All" ? "All Statuses" : status}
              </option>
            ))}
          </select>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-gold py-2 px-4 text-sm flex items-center gap-2">
          <Plus size={16} /> Add Fee
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden border border-border/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-border/10">
              <tr>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-text-muted">Student</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-text-muted">Fee Type</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-text-muted">Amount</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-text-muted">Due Date</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-text-muted">Status</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-text-muted text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f._id} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-body font-semibold text-foreground">{f.studentId?.userId?.name || "Unknown"}</div>
                    <div className="text-[10px] text-text-muted">{f.studentId?.rollNumber}</div>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-gold capitalize">{f.feeType}</td>
                  <td className="px-4 py-3 font-body text-sm text-foreground font-bold">${f.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-body text-sm text-text-muted">{new Date(f.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      f.status === 'paid' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditingFee(f)} className="text-gold hover:text-gold-hover">
                      <PencilLine size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!fees.length ? <EmptyState title="No fee records found" description="Create a fee entry to begin tracking collections." /> : null}
      </div>

      <div className="flex items-center justify-between text-sm text-text-muted">
        <span>Page {pagination.page} of {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="glass px-4 py-2 rounded-lg disabled:opacity-50">
            Previous
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="glass px-4 py-2 rounded-lg disabled:opacity-50">
            Next
          </button>
        </div>
      </div>

      {/* Payment modal */}
      <AnimatePresence>
        {editingFee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm"
            onClick={() => setEditingFee(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-foreground">Update Fee</h3>
                <button onClick={() => setEditingFee(null)} className="text-text-muted hover:text-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-text-muted ml-1 font-body mb-1">Status</label>
                  <select value={editingFee.status} onChange={(e) => setEditingFee({ ...editingFee, status: e.target.value })} className="w-full bg-muted/20 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none">
                    {["pending", "paid", "overdue"].map((status) => (
                      <option key={status} value={status} className="bg-card">{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted ml-1 font-body mb-1">Amount</label>
                  <input type="number" value={editingFee.amount} onChange={(e) => setEditingFee({ ...editingFee, amount: Number(e.target.value) })} className="w-full bg-muted/20 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none" />
                </div>
                <button onClick={() => updateFeeMutation.mutate({ id: editingFee._id, data: { status: editingFee.status, amount: editingFee.amount } })} disabled={updateFeeMutation.isPending} className="w-full btn-gold py-3 rounded-xl text-sm font-bold mt-2">
                  {updateFeeMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Save Update"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
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
              className="glass-strong rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-foreground">Record Fee Entry</h3>
                <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-muted ml-1 font-body">Student</label>
                  <select
                    value={payForm.studentId}
                    onChange={(e) => setPayForm({ ...payForm, studentId: e.target.value })}
                    className="w-full bg-muted/20 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                  >
                    <option value="" className="bg-card">Select Student</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id} className="bg-card">
                        {s.userId?.name} (Class {s.class})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-muted ml-1 font-body">Fee Type</label>
                  <select
                    value={payForm.feeType}
                    onChange={(e) => setPayForm({ ...payForm, feeType: e.target.value })}
                    className="w-full bg-muted/20 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                  >
                    <option value="tuition" className="bg-card">Tuition</option>
                    <option value="transport" className="bg-card">Transport</option>
                    <option value="sports" className="bg-card">Sports</option>
                    <option value="library" className="bg-card">Library</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-muted ml-1 font-body">Amount ($)</label>
                  <input
                    type="number"
                    value={payForm.amount}
                    onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
                    className="w-full bg-muted/20 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-muted ml-1 font-body">Due Date</label>
                  <input
                    type="date"
                    value={payForm.dueDate}
                    onChange={(e) => setPayForm({ ...payForm, dueDate: e.target.value })}
                    className="w-full bg-muted/20 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleCreateFee}
                  disabled={createFeeMutation.isPending}
                  className="w-full btn-gold py-3 rounded-xl text-sm font-bold mt-6 flex items-center justify-center gap-2"
                >
                  {createFeeMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Create Record"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeesModule;
