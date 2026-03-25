import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock3, Mail, Phone, Search, UserX } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "@/config/api";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";
import { getErrorMessage, getResponseData } from "@/lib/api-helpers";

const statusStyles = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-400/20",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  rejected: "bg-red-500/15 text-red-300 border-red-400/20",
};

const AdmissionsModule = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const admissionsQuery = useQuery({
    queryKey: ["admissions"],
    queryFn: async () => getResponseData(await api.get("/admissions")),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => getResponseData(await api.put(`/admissions/${id}/status`, { status })),
    onSuccess: (_, variables) => {
      toast.success(`Application ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update application status"));
    },
  });

  const admissions = useMemo(() => {
    const list = admissionsQuery.data ?? [];

    return list.filter((application) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        application.studentName?.toLowerCase().includes(query) ||
        application.parentName?.toLowerCase().includes(query) ||
        application.parentEmail?.toLowerCase().includes(query) ||
        application.applyingForClass?.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [admissionsQuery.data, search, statusFilter]);

  if (admissionsQuery.isLoading) {
    return <SectionSkeleton label="Loading admission applications..." />;
  }

  if (admissionsQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(admissionsQuery.error, "Unable to load admission applications.")}
        onRetry={admissionsQuery.refetch}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Admissions</h2>
          <p className="mt-1 text-sm font-body text-text-muted">
            Applications submitted from the public admissions form appear here for admin review.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
          <label className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search applicant or parent"
              className="w-full rounded-lg border border-border/30 bg-muted/20 py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-gold"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-lg border border-border/30 bg-muted/20 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-gold"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {!admissions.length ? (
        <EmptyState
          title="No applications found"
          description="New admission form submissions will show up here for the admin team."
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {admissions.map((application, index) => {
          const isUpdating = statusMutation.isPending && statusMutation.variables?.id === application._id;

          return (
            <motion.div
              key={application._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="glass rounded-xl border border-border/10 p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-display font-bold text-foreground">{application.studentName}</h3>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        statusStyles[application.status] || statusStyles.pending
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-body text-text-muted">
                    Applying for Class {application.applyingForClass}
                  </p>
                </div>

                <div className="rounded-lg bg-white/5 px-3 py-2 text-right">
                  <p className="text-[11px] uppercase tracking-wide text-text-muted">Submitted</p>
                  <p className="text-sm font-body text-foreground">
                    {new Date(application.submittedAt || application.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-text-muted">Parent / Guardian</p>
                  <p className="mt-1 font-body font-semibold text-foreground">{application.parentName}</p>
                </div>

                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-text-muted">Date of Birth</p>
                  <p className="mt-1 font-body font-semibold text-foreground">
                    {new Date(application.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm font-body text-text-muted">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gold" />
                  <span>{application.parentEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-cyan" />
                  <span>{application.parentPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 size={14} className="text-amber-300" />
                  <span>Payment status: {application.paymentStatus || "pending"}</span>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-white/5 p-3">
                <p className="text-xs uppercase tracking-wide text-text-muted">Address</p>
                <p className="mt-1 text-sm font-body text-foreground">{application.address}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => statusMutation.mutate({ id: application._id, status: "approved" })}
                  disabled={isUpdating || application.status === "approved"}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  Approve
                </button>

                <button
                  type="button"
                  onClick={() => statusMutation.mutate({ id: application._id, status: "rejected" })}
                  disabled={isUpdating || application.status === "rejected"}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserX size={16} />
                  Reject
                </button>

                <button
                  type="button"
                  onClick={() => statusMutation.mutate({ id: application._id, status: "pending" })}
                  disabled={isUpdating || application.status === "pending"}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Clock3 size={16} />
                  Mark Pending
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdmissionsModule;
