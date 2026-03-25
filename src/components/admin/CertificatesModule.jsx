import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, Award } from "lucide-react";
import api from "@/config/api";
import { fetchCollection } from "@/lib/api-helpers";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";

const certTypes = ["Transfer Certificate", "Bonafide Certificate", "Character Certificate", "Sports Achievement"];

const CertificatesModule = () => {
  const [certType, setCertType] = useState(certTypes[0]);
  const [studentId, setStudentId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [certDate, setCertDate] = useState(new Date().toISOString().split("T")[0]);

  const studentsQuery = useQuery({
    queryKey: ["students", "certificate-list"],
    queryFn: () => fetchCollection(() => api.get("/students?limit=1000")),
  });

  if (studentsQuery.isLoading) {
    return <SectionSkeleton label="Loading students..." />;
  }

  if (studentsQuery.isError) {
    return <ErrorState message="Unable to load students for certificates." onRetry={studentsQuery.refetch} />;
  }

  const students = studentsQuery.data?.items ?? [];
  const student = students.find((item) => item._id === studentId);

  if (!students.length) {
    return <EmptyState title="No students available" description="Add students before generating certificates." />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display font-bold text-foreground">Certificate Generator</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-body text-text-muted mb-1">Certificate Type</label>
            <select
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
              className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none"
            >
              {certTypes.map((type) => (
                <option key={type} className="bg-card">
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-body text-text-muted mb-1">Student</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none"
            >
              <option value="" className="bg-card">
                Select student
              </option>
              {students.map((item) => (
                <option key={item._id} value={item._id} className="bg-card">
                  {item.userId?.name} - Class {item.class}-{item.section}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-body text-text-muted mb-1">Date</label>
            <input
              type="date"
              value={certDate}
              onChange={(e) => setCertDate(e.target.value)}
              className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-gold/60"
            />
          </div>
          <div>
            <label className="block text-xs font-body text-text-muted mb-1">Purpose</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Higher studies"
              className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-gold/60"
            />
          </div>
          <button onClick={() => window.print()} className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2" disabled={!student}>
            <Printer size={16} /> Print / Download
          </button>
        </div>

        <div className="glass rounded-xl p-8 min-h-[400px] flex flex-col" id="certificate-preview">
          <div className="border-2 border-gold/40 rounded-xl p-8 flex-1 flex flex-col items-center justify-between text-center">
            <div>
              <Award className="text-gold mx-auto mb-3" size={40} />
              <h3 className="text-2xl font-display font-bold text-gradient-gold mb-1">Aethelgard Academy</h3>
              <p className="text-xs text-text-muted font-body">School Management System</p>
            </div>

            <div className="my-8">
              <h4 className="text-xl font-display font-bold text-foreground mb-6">{certType}</h4>
              {student ? (
                <div className="space-y-2 text-sm font-body text-text-muted">
                  <p>
                    This is to certify that <span className="text-foreground font-semibold">{student.userId?.name}</span>,
                  </p>
                  <p>
                    student of <span className="text-foreground font-semibold">Class {student.class}-{student.section}</span>,
                  </p>
                  <p>
                    Roll No. <span className="text-foreground font-semibold">{student.rollNumber}</span>,
                  </p>
                  {purpose ? (
                    <p>
                      has been issued this certificate for the purpose of{" "}
                      <span className="text-foreground font-semibold">{purpose}</span>.
                    </p>
                  ) : null}
                  <p className="mt-4">
                    Date: <span className="text-foreground font-semibold">{certDate}</span>
                  </p>
                </div>
              ) : (
                <p className="text-text-muted/40 font-body text-sm">Select a student to preview</p>
              )}
            </div>

            <div className="w-full flex justify-between items-end">
              <div className="text-center">
                <div className="w-32 border-t border-text-muted/30 mb-1" />
                <p className="text-xs text-text-muted font-body">Class Teacher</p>
              </div>
              <div className="text-center">
                <div className="w-32 border-t border-text-muted/30 mb-1" />
                <p className="text-xs text-text-muted font-body">Principal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatesModule;
