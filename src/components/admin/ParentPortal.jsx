import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { getResponseData } from "@/lib/api-helpers";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";

const ParentPortal = () => {
  const { user } = useAuth();
  const children = user?.profile?.children || [];
  const [selectedStudentId, setSelectedStudentId] = useState(children[0]?.studentId || "");
  const selectedChild = children.find((child) => child.studentId === selectedStudentId) || children[0];
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const gradesQuery = useQuery({
    queryKey: ["parent-portal", "grades", selectedChild?.studentId],
    queryFn: async () => getResponseData(await api.get(`/grades/student/${selectedChild.studentId}`)),
    enabled: Boolean(selectedChild?.studentId),
  });

  const attendanceQuery = useQuery({
    queryKey: ["parent-portal", "attendance", selectedChild?.studentId, month, year],
    queryFn: async () =>
      getResponseData(await api.get(`/attendance/student/${selectedChild.studentId}?month=${month}&year=${year}`)),
    enabled: Boolean(selectedChild?.studentId),
  });

  const feesQuery = useQuery({
    queryKey: ["parent-portal", "fees", selectedChild?.studentId],
    queryFn: async () => getResponseData(await api.get(`/fees/student/${selectedChild.studentId}`)),
    enabled: Boolean(selectedChild?.studentId),
  });

  const paymentsQuery = useQuery({
    queryKey: ["parent-portal", "payments", selectedChild?.studentId],
    queryFn: async () => getResponseData(await api.get(`/payments/history/${selectedChild.studentId}`)),
    enabled: Boolean(selectedChild?.studentId),
  });

  const homeworkQuery = useQuery({
    queryKey: ["parent-portal", "homework", selectedChild?.class, selectedChild?.section],
    queryFn: async () =>
      getResponseData(await api.get(`/homework?class=${selectedChild.class}&section=${selectedChild.section}`)),
    enabled: Boolean(selectedChild?.class && selectedChild?.section),
  });

  const announcementsQuery = useQuery({
    queryKey: ["parent-portal", "announcements"],
    queryFn: async () => getResponseData(await api.get("/announcements?targetAudience=parents")),
    enabled: Boolean(selectedChild?.studentId),
  });

  const paymentMutation = useMutation({
    mutationFn: async (fee) => {
      const response = await api.post("/payments/create-checkout-session", {
        feeId: fee._id,
        studentId: selectedChild.studentId,
        amount: fee.amount,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      toast.error("Stripe did not return a checkout URL.");
    },
  });

  const isLoading = [gradesQuery, attendanceQuery, feesQuery, paymentsQuery, homeworkQuery, announcementsQuery].some(
    (query) => query.isLoading,
  );

  const isError = [gradesQuery, attendanceQuery, feesQuery, paymentsQuery, homeworkQuery, announcementsQuery].some(
    (query) => query.isError,
  );

  const fees = feesQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];
  const homework = homeworkQuery.data ?? [];
  const announcements = announcementsQuery.data ?? [];
  const attendanceRecords = attendanceQuery.data ?? [];
  const grades = gradesQuery.data ?? [];

  const attendancePercentage = useMemo(() => {
    if (!attendanceRecords.length) {
      return 100;
    }
    const presentDays = attendanceRecords.filter((record) => record.status === "present").length;
    return Math.round((presentDays / attendanceRecords.length) * 100);
  }, [attendanceRecords]);

  const outstandingFee = useMemo(
    () => fees.find((fee) => fee.status !== "paid") || null,
    [fees],
  );

  const totals = useMemo(
    () => ({
      total: fees.reduce((sum, fee) => sum + (fee.amount || 0), 0),
      paid: fees.filter((fee) => fee.status === "paid").reduce((sum, fee) => sum + (fee.amount || 0), 0),
      due: fees.filter((fee) => fee.status !== "paid").reduce((sum, fee) => sum + (fee.amount || 0), 0),
    }),
    [fees],
  );

  const gradeSummary = useMemo(() => {
    const buckets = new Map();
    grades.forEach((grade) => {
      const current = buckets.get(grade.subject) || { marksObtained: 0, totalMarks: 0 };
      current.marksObtained += grade.marksObtained || 0;
      current.totalMarks += grade.totalMarks || 0;
      buckets.set(grade.subject, current);
    });
    return Array.from(buckets.entries()).map(([subject, value]) => ({
      subject,
      score: value.totalMarks ? Math.round((value.marksObtained / value.totalMarks) * 100) : 0,
    }));
  }, [grades]);

  if (!children.length) {
    return (
      <EmptyState
        title="No linked children found"
        description="This parent account does not have any student profiles linked through the backend yet."
      />
    );
  }

  if (isLoading) {
    return <SectionSkeleton label="Loading your parent portal..." />;
  }

  if (isError) {
    const retry = () => {
      gradesQuery.refetch();
      attendanceQuery.refetch();
      feesQuery.refetch();
      paymentsQuery.refetch();
      homeworkQuery.refetch();
      announcementsQuery.refetch();
    };

    return <ErrorState message="Unable to load the parent portal right now." onRetry={retry} />;
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="mb-1 text-2xl font-display font-bold text-foreground">Welcome, {user?.name}</h2>
            <p className="font-body text-text-muted">
              Monitoring {selectedChild?.name} · Class {selectedChild?.class}-{selectedChild?.section}
            </p>
          </div>
          <select
            value={selectedChild?.studentId}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            className="rounded-lg border border-border/30 bg-muted/20 px-3 py-2 text-sm text-foreground"
          >
            {children.map((child) => (
              <option key={child.studentId} value={child.studentId} className="bg-card">
                {child.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-5">
          <p className="text-sm font-display font-bold text-foreground">Attendance</p>
          <p className="mt-3 text-3xl font-display font-bold text-gold">{attendancePercentage}%</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-xl p-5">
          <p className="text-sm font-display font-bold text-foreground">Total Fees</p>
          <p className="mt-3 text-3xl font-display font-bold text-cyan">${totals.total.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-5">
          <p className="text-sm font-display font-bold text-foreground">Amount Paid</p>
          <p className="mt-3 text-3xl font-display font-bold text-green-400">${totals.paid.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-xl p-5">
          <p className="text-sm font-display font-bold text-foreground">Amount Due</p>
          <p className="mt-3 text-3xl font-display font-bold text-red-400">${totals.due.toLocaleString()}</p>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 font-display text-lg font-bold text-foreground">Grades Overview</h3>
          {gradeSummary.length ? (
            <div className="space-y-3">
              {gradeSummary.map((grade) => (
                <div key={grade.subject} className="flex items-center justify-between rounded-lg bg-muted/20 p-3">
                  <span className="font-body text-sm text-foreground">{grade.subject}</span>
                  <span className="font-body text-sm font-semibold text-cyan">{grade.score}%</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No grades yet" description="Grades will appear here once marks are published." />
          )}
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 font-display text-lg font-bold text-foreground">Fee Status</h3>
          <div className="space-y-3">
            {fees.length ? (
              fees.map((fee) => (
                <div key={fee._id} className="flex items-center justify-between rounded-lg bg-muted/20 p-3">
                  <div>
                    <p className="font-body text-sm font-semibold text-foreground capitalize">{fee.feeType}</p>
                    <p className="text-xs font-body text-text-muted">Due {new Date(fee.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                      fee.status === "paid" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {fee.status}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState title="No fee records" description="No fee records were returned for this student." />
            )}
          </div>
          <button
            onClick={() => outstandingFee && paymentMutation.mutate(outstandingFee)}
            disabled={!outstandingFee || paymentMutation.isPending}
            className="btn-gold mt-4 w-full py-3 text-sm disabled:opacity-60"
          >
            {paymentMutation.isPending ? "Redirecting to Stripe..." : outstandingFee ? "Pay Now" : "Nothing Due"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 font-display text-lg font-bold text-foreground">Upcoming Homework</h3>
          {homework.length ? (
            <div className="space-y-3">
              {homework.map((item) => {
                const submitted = (item.submissions || []).some((submission) => submission.studentId === selectedChild.studentId);
                return (
                  <div key={item._id} className="flex items-center justify-between rounded-lg bg-muted/20 p-3">
                    <div>
                      <p className="font-body text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs font-body text-text-muted">
                        {item.subject} · Due {new Date(item.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                        submitted ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {submitted ? "Submitted" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No homework assigned" description="There are no homework items for this class right now." />
          )}
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 font-display text-lg font-bold text-foreground">Payment History</h3>
          {payments.length ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between rounded-lg bg-muted/20 p-3">
                  <div>
                    <p className="font-body text-sm font-semibold text-foreground">${payment.amount.toLocaleString()}</p>
                    <p className="text-xs font-body text-text-muted">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-full bg-cyan/15 px-2 py-1 text-[10px] font-bold uppercase text-cyan">
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No payments yet" description="Completed Stripe payments will appear here." />
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="mb-4 font-display text-lg font-bold text-foreground">School Announcements</h3>
        {announcements.length ? (
          <div className="space-y-3">
            {announcements.slice(0, 4).map((announcement) => (
              <div key={announcement._id} className="rounded-lg bg-muted/20 p-3">
                <p className="font-body text-sm font-semibold text-foreground">{announcement.title}</p>
                <p className="mt-1 text-xs font-body text-text-muted">{announcement.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No announcements" description="Parent-facing school notices will appear here." />
        )}
      </div>
    </div>
  );
};

export default ParentPortal;
