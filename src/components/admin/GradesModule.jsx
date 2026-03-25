import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/config/api";
import { toast } from "react-hot-toast";
import { Printer, Loader2, Save, RefreshCw } from "lucide-react";

const examTypes = ["midterm", "final", "unit"];

function calcGrade(pct) {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
}

const GradesModule = () => {
  const queryClient = useQueryClient();
  const [selClass, setSelClass] = useState("8");
  const [selSection, setSelSection] = useState("A");
  const [selExamId, setSelExamId] = useState("");
  const [reportStudent, setReportStudent] = useState(null);
  const [editMarks, setEditMarks] = useState({});

  // Fetch Exams
  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const res = await api.get("/exams");
      return res.data.data;
    },
  });

  // Filter exams for the selected class
  const classExams = useMemo(() => exams.filter((e) => e.class === selClass), [exams, selClass]);

  // Set initial exam if not set
  useEffect(() => {
    if (classExams.length > 0 && !selExamId) {
      setSelExamId(classExams[0]._id);
    }
  }, [classExams, selExamId]);

  // Selected Exam object
  const selectedExam = useMemo(() => classExams.find((e) => e._id === selExamId), [classExams, selExamId]);

  // Fetch Students for the selected class/section
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students", selClass, selSection],
    queryFn: async () => {
      const res = await api.get(`/students?class=${selClass}&section=${selSection}`);
      return res.data.data;
    },
  });

  // Fetch Grades for the selected exam
  const { data: examGrades = [], isLoading: gradesLoading, refetch: refetchGrades } = useQuery({
    queryKey: ["grades", selExamId],
    queryFn: async () => {
      if (!selExamId) return [];
      const res = await api.get(`/grades/exam/${selExamId}`);
      return res.data.data;
    },
    enabled: !!selExamId,
  });

  // Map fetched grades to editMarks state
  useEffect(() => {
    const init = {};
    students.forEach((s) => {
      init[s._id] = {};
      if (selectedExam) {
        selectedExam.subjects.forEach((sub) => {
          const g = examGrades.find((grade) => grade.studentId._id === s._id && grade.subject === sub.name);
          init[s._id][sub.name] = g ? g.marksObtained : 0;
        });
      }
    });
    setEditMarks(init);
  }, [students, examGrades, selectedExam]);

  const saveMutation = useMutation({
    mutationFn: async (gradesArray) => {
      return api.post("/grades", { gradesArray });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["grades", selExamId]);
      toast.success("Grades saved successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save grades");
    },
  });

  const handleSave = () => {
    if (!selectedExam) return;
    const gradesArray = [];
    students.forEach((s) => {
      selectedExam.subjects.forEach((sub) => {
        gradesArray.push({
          studentId: s._id,
          examId: selectedExam._id,
          subject: sub.name,
          marksObtained: editMarks[s._id]?.[sub.name] || 0,
          totalMarks: sub.maxMarks,
        });
      });
    });
    saveMutation.mutate(gradesArray);
  };

  const handlePrint = (studentId) => {
    setReportStudent(studentId);
    setTimeout(() => {
      window.print();
      setReportStudent(null);
    }, 500);
  };

  if (examsLoading || studentsLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  const subjects = selectedExam?.subjects || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold text-foreground">Grades & Report Cards</h2>
        <button onClick={() => refetchGrades()} className="p-2 hover:bg-muted/50 rounded-full transition-colors text-text-muted">
          <RefreshCw size={20} className={gradesLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={selClass}
          onChange={(e) => {
            setSelClass(e.target.value);
            setSelExamId("");
          }}
          className="bg-muted/30 border border-border/30 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
        >
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => (
            <option key={c} value={c} className="bg-card">
              Class {c}
            </option>
          ))}
        </select>
        <select
          value={selSection}
          onChange={(e) => setSelSection(e.target.value)}
          className="bg-muted/30 border border-border/30 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
        >
          {["A", "B", "C", "D"].map((s) => (
            <option key={s} value={s} className="bg-card">
              Section {s}
            </option>
          ))}
        </select>
        <select
          value={selExamId}
          onChange={(e) => setSelExamId(e.target.value)}
          className="bg-muted/30 border border-border/30 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
        >
          <option value="" className="bg-card">Select Exam</option>
          {classExams.map((e) => (
            <option key={e._id} value={e._id} className="bg-card">
              {e.name} ({e.type})
            </option>
          ))}
        </select>
      </div>

      {!selectedExam ? (
        <div className="glass rounded-xl p-10 text-center text-text-muted">
          No exams found for this class. Create an exam in the Exams module first.
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left px-3 py-2 text-xs font-body font-semibold text-text-muted uppercase">Student</th>
                  {subjects.map((s) => (
                    <th key={s.name} className="text-center px-2 py-2 text-xs font-body font-semibold text-text-muted uppercase">
                      {s.name.slice(0, 5)}
                    </th>
                  ))}
                  <th className="text-center px-2 py-2 text-xs font-body font-semibold text-text-muted uppercase">Total</th>
                  <th className="text-center px-2 py-2 text-xs font-body font-semibold text-text-muted uppercase">%</th>
                  <th className="text-center px-2 py-2 text-xs font-body font-semibold text-text-muted uppercase">Grade</th>
                  <th className="text-center px-2 py-2 text-xs font-body font-semibold text-text-muted uppercase">Report</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const marks = editMarks[s._id] || {};
                  const total = Object.values(marks).reduce((a, b) => a + b, 0);
                  const maxTotal = subjects.reduce((a, b) => a + b.maxMarks, 0);
                  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                  return (
                    <tr key={s._id} className="border-b border-border/10">
                      <td className="px-3 py-2 font-body text-sm text-foreground">
                        <div>{s.userId?.name || "N/A"}</div>
                        <div className="text-[10px] text-text-muted">Roll: {s.rollNumber}</div>
                      </td>
                      {subjects.map((sub) => (
                        <td key={sub.name} className="px-1 py-2">
                          <input
                            type="number"
                            min={0}
                            max={sub.maxMarks}
                            value={marks[sub.name] || 0}
                            onChange={(e) =>
                              setEditMarks((prev) => ({
                                ...prev,
                                [s._id]: { ...prev[s._id], [sub.name]: Math.min(sub.maxMarks, Math.max(0, +e.target.value)) },
                              }))
                            }
                            className="w-14 text-center bg-muted/30 border border-border/30 rounded px-1 py-1 text-foreground font-body text-sm focus:outline-none focus:border-gold/60"
                          />
                          <div className="text-[8px] text-center text-text-muted">/{sub.maxMarks}</div>
                        </td>
                      ))}
                      <td className="text-center font-body text-sm text-gold font-semibold">{total}</td>
                      <td className="text-center font-body text-sm text-cyan">{pct.toFixed(1)}%</td>
                      <td className="text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${pct >= 80 ? "bg-green-500/20 text-green-400" : pct >= 60 ? "bg-yellow-500/20 text-yellow-400" : "bg-destructive/20 text-destructive"}`}
                        >
                          {calcGrade(pct)}
                        </span>
                      </td>
                      <td className="text-center">
                        <button onClick={() => handlePrint(s._id)} className="text-cyan hover:text-cyan/80">
                          <Printer size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {students.length === 0 && (
            <div className="text-center py-10 text-text-muted font-body">No students found for this class/section</div>
          )}
        </div>
      )}

      {selectedExam && (
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="btn-gold py-3 px-8 text-sm flex items-center gap-2"
        >
          {saveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Save Grades
        </button>
      )}

      {/* Hidden Report Card Template for Printing */}
      {reportStudent && (
        <div className="fixed inset-0 bg-white text-black z-[9999] p-10 print:block hidden overflow-y-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold uppercase">Lumina Academy</h1>
            <p className="text-sm">Academic Report Card - {selectedExam.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8 border-y py-4">
            <div>
              <p><strong>Student Name:</strong> {students.find(s => s._id === reportStudent)?.userId?.name}</p>
              <p><strong>Roll Number:</strong> {students.find(s => s._id === reportStudent)?.rollNumber}</p>
            </div>
            <div className="text-right">
              <p><strong>Class:</strong> {selClass} - {selSection}</p>
              <p><strong>Academic Year:</strong> 2023-24</p>
            </div>
          </div>
          <table className="w-full border-collapse border border-black mb-8">
            <thead>
              <tr>
                <th className="border border-black p-2 text-left">Subject</th>
                <th className="border border-black p-2 text-center">Marks Obtained</th>
                <th className="border border-black p-2 text-center">Max Marks</th>
                <th className="border border-black p-2 text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {selectedExam.subjects.map(sub => {
                const mark = editMarks[reportStudent]?.[sub.name] || 0;
                const pct = (mark / sub.maxMarks) * 100;
                return (
                  <tr key={sub.name}>
                    <td className="border border-black p-2">{sub.name}</td>
                    <td className="border border-black p-2 text-center">{mark}</td>
                    <td className="border border-black p-2 text-center">{sub.maxMarks}</td>
                    <td className="border border-black p-2 text-center font-bold">{calcGrade(pct)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-black p-2">Total</td>
                <td className="border border-black p-2 text-center">
                  {Object.values(editMarks[reportStudent] || {}).reduce((a, b) => a + b, 0)}
                </td>
                <td className="border border-black p-2 text-center">
                  {selectedExam.subjects.reduce((a, b) => a + b.maxMarks, 0)}
                </td>
                <td className="border border-black p-2 text-center">
                  {calcGrade((Object.values(editMarks[reportStudent] || {}).reduce((a, b) => a + b, 0) / selectedExam.subjects.reduce((a, b) => a + b.maxMarks, 0)) * 100)}
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="flex justify-between mt-20">
            <div className="text-center border-t border-black w-40 pt-2">Class Teacher</div>
            <div className="text-center border-t border-black w-40 pt-2">Principal</div>
          </div>
        </div>
      )}
    </div>
  );
};
export default GradesModule;
