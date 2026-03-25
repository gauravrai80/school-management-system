import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { getResponseData } from "@/lib/api-helpers";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";

const TeacherPortal = () => {
  const { user } = useAuth();
  const profile = user?.profile;
  const todayName = new Date().toLocaleDateString(undefined, { weekday: "short" });

  const homeworkQuery = useQuery({
    queryKey: ["teacher-portal", "homework", profile?.teacherId],
    queryFn: async () => getResponseData(await api.get(`/homework?teacherId=${profile.teacherId}`)),
    enabled: Boolean(profile?.teacherId),
  });

  const studentsQuery = useQuery({
    queryKey: ["teacher-portal", "students", profile?.classes],
    queryFn: async () => {
      const classPairs = (profile?.classes || []).map((value) => ({
        class: value.slice(0, -1),
        section: value.slice(-1),
      }));

      const responses = await Promise.all(
        classPairs.map(({ class: studentClass, section }) => api.get(`/students?class=${studentClass}&section=${section}&limit=1000`)),
      );

      return responses.flatMap((response) => getResponseData(response) || []);
    },
    enabled: Boolean(profile?.classes?.length),
  });

  const timetableQuery = useQuery({
    queryKey: ["teacher-portal", "timetable", profile?.classes],
    queryFn: async () => {
      const classPairs = (profile?.classes || []).map((value) => ({
        class: value.slice(0, -1),
        section: value.slice(-1),
      }));

      const results = await Promise.all(
        classPairs.map(async ({ class: studentClass, section }) => {
          try {
            const response = await api.get(`/timetable/${studentClass}/${section}`);
            return getResponseData(response);
          } catch (error) {
            return null;
          }
        }),
      );

      return results.filter(Boolean);
    },
    enabled: Boolean(profile?.classes?.length),
    retry: false,
  });

  const announcementsQuery = useQuery({
    queryKey: ["teacher-portal", "announcements"],
    queryFn: async () => getResponseData(await api.get("/announcements?targetAudience=teachers")),
    enabled: Boolean(profile?.teacherId),
  });

  const isLoading = [homeworkQuery, studentsQuery, timetableQuery, announcementsQuery].some((query) => query.isLoading);
  const isError = [homeworkQuery, studentsQuery, announcementsQuery].some((query) => query.isError);

  const assignments = homeworkQuery.data ?? [];
  const students = studentsQuery.data ?? [];
  const announcements = announcementsQuery.data ?? [];
  const timetables = timetableQuery.data ?? [];

  const todaysClasses = useMemo(
    () =>
      timetables.flatMap((timetable) =>
        (timetable.schedule || [])
          .filter((entry) => entry.day === todayName && String(entry.teacherId?._id || entry.teacherId) === profile?.teacherId)
          .map((entry) => ({
            ...entry,
            class: timetable.class,
            section: timetable.section,
          })),
      ),
    [profile?.teacherId, timetables, todayName],
  );

  const studentCountByClass = useMemo(() => {
    const buckets = {};
    students.forEach((student) => {
      const key = `${student.class}-${student.section}`;
      buckets[key] = (buckets[key] || 0) + 1;
    });
    return buckets;
  }, [students]);

  if (!profile?.teacherId) {
    return (
      <EmptyState
        title="Teacher profile unavailable"
        description="This account is authenticated, but the backend did not return a linked teacher profile yet."
      />
    );
  }

  if (isLoading) {
    return <SectionSkeleton label="Loading your teacher portal..." />;
  }

  if (isError) {
    const retry = () => {
      homeworkQuery.refetch();
      studentsQuery.refetch();
      announcementsQuery.refetch();
      timetableQuery.refetch();
    };

    return <ErrorState message="Unable to load the teacher portal right now." onRetry={retry} />;
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl bg-gradient-to-r from-cyan/10 to-gold/10 p-6">
        <h2 className="mb-1 text-2xl font-display font-bold text-foreground">Welcome, {user?.name}</h2>
        <p className="font-body text-text-muted">
          {profile.department} Department · {(profile.subjects || []).join(", ")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-5">
          <p className="text-sm font-display font-bold text-foreground">Today's Classes</p>
          <p className="mt-3 text-3xl font-display font-bold text-gold">{todaysClasses.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-xl p-5">
          <p className="text-sm font-display font-bold text-foreground">My Students</p>
          <p className="mt-3 text-3xl font-display font-bold text-cyan">{students.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-5">
          <p className="text-sm font-display font-bold text-foreground">Assignments Posted</p>
          <p className="mt-3 text-3xl font-display font-bold text-gold">{assignments.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-xl p-5">
          <p className="text-sm font-display font-bold text-foreground">Announcements</p>
          <p className="mt-3 text-3xl font-display font-bold text-cyan">{announcements.length}</p>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 font-display text-lg font-bold text-foreground">Today's Schedule</h3>
          {todaysClasses.length ? (
            <div className="space-y-3">
              {todaysClasses
                .sort((a, b) => a.period - b.period)
                .map((entry) => (
                  <div key={`${entry.class}-${entry.section}-${entry.period}`} className="flex items-center justify-between rounded-lg bg-muted/20 p-3">
                    <div>
                      <p className="font-body text-sm font-semibold text-foreground">
                        Class {entry.class}-{entry.section}
                      </p>
                      <p className="text-xs font-body text-text-muted">{entry.subject}</p>
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
          <h3 className="mb-4 font-display text-lg font-bold text-foreground">Class Coverage</h3>
          {Object.keys(studentCountByClass).length ? (
            <div className="space-y-3">
              {Object.entries(studentCountByClass).map(([classLabel, count]) => (
                <div key={classLabel} className="flex items-center justify-between rounded-lg bg-muted/20 p-3">
                  <p className="font-body text-sm font-semibold text-foreground">{classLabel}</p>
                  <p className="text-xs font-body text-text-muted">{count} students</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No students available" description="No students were returned for your assigned classes." />
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 font-display text-lg font-bold text-foreground">My Assignments</h3>
          {assignments.length ? (
            <div className="space-y-3">
              {assignments.map((homework) => (
                <div key={homework._id} className="rounded-lg bg-muted/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-body text-sm font-semibold text-foreground">{homework.title}</p>
                      <p className="text-xs font-body text-text-muted">
                        Class {homework.class}-{homework.section} · {homework.subject}
                      </p>
                    </div>
                    <span className="text-xs font-body text-text-muted">
                      {homework.submissions?.length || 0} submissions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No assignments posted" description="Create homework to start tracking submissions here." />
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
            <EmptyState title="No announcements" description="Teacher-facing announcements will appear here." />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPortal;
