import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { getResponseData } from "@/lib/api-helpers";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";

const StudentPortal = () => {
  const { user } = useAuth();
  const profile = user?.profile;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const todayName = now.toLocaleDateString(undefined, { weekday: "short" });

  const gradesQuery = useQuery({
    queryKey: ["student-portal", "grades", profile?.studentId],
    queryFn: async () => getResponseData(await api.get(`/grades/student/${profile.studentId}`)),
    enabled: Boolean(profile?.studentId),
  });

  const attendanceQuery = useQuery({
    queryKey: ["student-portal", "attendance", profile?.studentId, month, year],
    queryFn: async () =>
      getResponseData(await api.get(`/attendance/student/${profile.studentId}?month=${month}&year=${year}`)),
    enabled: Boolean(profile?.studentId),
  });

  const homeworkQuery = useQuery({
    queryKey: ["student-portal", "homework", profile?.class, profile?.section],
    queryFn: async () =>
      getResponseData(await api.get(`/homework?class=${profile.class}&section=${profile.section}`)),
    enabled: Boolean(profile?.class && profile?.section),
  });

  const timetableQuery = useQuery({
    queryKey: ["student-portal", "timetable", profile?.class, profile?.section],
    queryFn: async () => getResponseData(await api.get(`/timetable/${profile.class}/${profile.section}`)),
    enabled: Boolean(profile?.class && profile?.section),
    retry: false,
  });

  const announcementsQuery = useQuery({
    queryKey: ["student-portal", "announcements"],
    queryFn: async () => getResponseData(await api.get("/announcements?targetAudience=students")),
    enabled: Boolean(profile?.studentId),
  });

  const booksQuery = useQuery({
    queryKey: ["student-portal", "books"],
    queryFn: async () => getResponseData(await api.get("/library/books?limit=1000")),
    enabled: Boolean(profile?.studentId),
  });

  const isLoading = [
    gradesQuery,
    attendanceQuery,
    homeworkQuery,
    timetableQuery,
    announcementsQuery,
    booksQuery,
  ].some((query) => query.isLoading);

  const isError = [gradesQuery, attendanceQuery, homeworkQuery, announcementsQuery, booksQuery].some(
    (query) => query.isError,
  );

  const reportCards = gradesQuery.data ?? [];
  const attendanceRecords = attendanceQuery.data ?? [];
  const assignments = homeworkQuery.data ?? [];
  const announcements = announcementsQuery.data ?? [];
  const books = booksQuery.data ?? [];
  const schedule = timetableQuery.data?.schedule ?? [];

  const attendancePercentage = useMemo(() => {
    if (!attendanceRecords.length) {
      return 100;
    }
    const presentDays = attendanceRecords.filter((record) => record.status === "present").length;
    return Math.round((presentDays / attendanceRecords.length) * 100);
  }, [attendanceRecords]);

  const gradeSummary = useMemo(() => {
    const buckets = new Map();
    reportCards.forEach((grade) => {
      const current = buckets.get(grade.subject) || { marksObtained: 0, totalMarks: 0 };
      current.marksObtained += grade.marksObtained || 0;
      current.totalMarks += grade.totalMarks || 0;
      buckets.set(grade.subject, current);
    });
    return Array.from(buckets.entries()).map(([subject, value]) => ({
      subject,
      score: value.totalMarks ? Math.round((value.marksObtained / value.totalMarks) * 100) : 0,
      label: `${value.marksObtained}/${value.totalMarks}`,
    }));
  }, [reportCards]);

  const todayClasses = useMemo(
    () => schedule.filter((entry) => entry.day === todayName).sort((a, b) => a.period - b.period),
    [schedule, todayName],
  );

  const currentBooks = useMemo(
    () =>
      books.flatMap((book) =>
        (book.issuedTo || [])
          .filter((issue) => issue.studentId === profile?.studentId && issue.status === "issued")
          .map((issue) => ({
            ...issue,
            title: book.title,
          })),
      ),
    [books, profile?.studentId],
  );

  if (!profile?.studentId) {
    return (
      <EmptyState
        title="Student profile unavailable"
        description="This account is authenticated, but the backend did not return a linked student profile yet."
      />
    );
  }

  if (isLoading) {
    return <SectionSkeleton label="Loading your student portal..." />;
  }

  if (isError) {
    const retry = () => {
      gradesQuery.refetch();
      attendanceQuery.refetch();
      homeworkQuery.refetch();
      announcementsQuery.refetch();
      booksQuery.refetch();
      timetableQuery.refetch();
    };

    return <ErrorState message="Unable to load the student portal right now." onRetry={retry} />;
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl bg-gradient-to-r from-gold/10 to-cyan/10 p-6">
        <h2 className="mb-1 text-2xl font-display font-bold text-foreground">Welcome back, {user?.name}</h2>
        <p className="font-body text-text-muted">
          Class {profile.class}-{profile.section} · Roll No. {profile.rollNumber}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-5">
          <p className="text-sm font-display font-bold text-foreground">Attendance</p>
          <p className="mt-3 text-3xl font-display font-bold text-gold">{attendancePercentage}%</p>
          <p className="mt-1 text-xs font-body text-text-muted">Based on this month's records</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-xl p-5">
          <p className="text-sm font-display font-bold text-foreground">Assignments</p>
          <p className="mt-3 text-3xl font-display font-bold text-cyan">{assignments.length}</p>
          <p className="mt-1 text-xs font-body text-text-muted">Active homework items</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-5">
          <p className="text-sm font-display font-bold text-foreground">Announcements</p>
          <p className="mt-3 text-3xl font-display font-bold text-gold">{announcements.length}</p>
          <p className="mt-1 text-xs font-body text-text-muted">Relevant notices from school</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-xl p-5">
          <p className="text-sm font-display font-bold text-foreground">Library Books</p>
          <p className="mt-3 text-3xl font-display font-bold text-cyan">{currentBooks.length}</p>
          <p className="mt-1 text-xs font-body text-text-muted">Currently issued to you</p>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 font-display text-lg font-bold text-foreground">Today's Timetable</h3>
          {todayClasses.length ? (
            <div className="space-y-3">
              {todayClasses.map((entry) => (
                <div key={`${entry.day}-${entry.period}`} className="flex items-center justify-between rounded-lg bg-muted/20 p-3">
                  <div>
                    <p className="font-body text-sm font-semibold text-foreground">{entry.subject}</p>
                    <p className="text-xs font-body text-text-muted">{entry.teacherId?.name || "Teacher TBA"}</p>
                  </div>
                  <span className="rounded-full bg-gold/15 px-2 py-1 text-[10px] font-bold uppercase text-gold">
                    Period {entry.period}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No classes today" description="Your timetable has no periods scheduled for today." />
          )}
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 font-display text-lg font-bold text-foreground">Grades Overview</h3>
          {gradeSummary.length ? (
            <div className="space-y-3">
              {gradeSummary.map((grade) => (
                <div key={grade.subject}>
                  <div className="mb-1 flex items-center justify-between text-sm font-body">
                    <span className="text-text-muted">{grade.subject}</span>
                    <span className="font-semibold text-foreground">{grade.label}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                    <div
                      className={`h-full rounded-full ${
                        grade.score >= 80 ? "bg-green-500" : grade.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${grade.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No grades yet" description="Your grades will appear here after teachers submit marks." />
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 font-display text-lg font-bold text-foreground">Assignments Due</h3>
          {assignments.length ? (
            <div className="space-y-3">
              {assignments.map((homework) => {
                const mine = (homework.submissions || []).find((submission) => submission.studentId === profile.studentId);
                return (
                  <div key={homework._id} className="flex items-center justify-between rounded-lg bg-muted/20 p-3">
                    <div>
                      <p className="font-body text-sm font-semibold text-foreground">{homework.title}</p>
                      <p className="text-xs font-body text-text-muted">
                        {homework.subject} · Due {new Date(homework.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                        mine ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {mine ? "Submitted" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No homework assigned" description="You're all caught up for now." />
          )}
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 font-display text-lg font-bold text-foreground">Announcements</h3>
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
            <EmptyState title="No announcements" description="Relevant school notices will appear here." />
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="mb-4 font-display text-lg font-bold text-foreground">My Library Books</h3>
        {currentBooks.length ? (
          <div className="space-y-3">
            {currentBooks.map((book) => (
              <div key={book._id} className="flex items-center justify-between rounded-lg bg-muted/20 p-3">
                <p className="font-body text-sm font-semibold text-foreground">{book.title}</p>
                <p className="text-xs font-body text-text-muted">
                  Due {new Date(book.dueDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No books issued" description="Visit the library to borrow a book." />
        )}
      </div>
    </div>
  );
};

export default StudentPortal;
