import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { FileText, ClipboardCheck, GraduationCap, CheckCircle2, Send, Loader2 } from "lucide-react";
import api from "@/config/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const steps = [
  { title: "Apply Online", desc: "Fill out the online application form with required details.", icon: FileText },
  { title: "Review", desc: "Our admissions team will review your application within 3-5 days.", icon: ClipboardCheck },
  { title: "Interview", desc: "Shortlisted candidates will be called for a parent-student interview.", icon: GraduationCap },
  { title: "Admission Update", desc: "The school will contact you with the next steps after reviewing the application.", icon: CheckCircle2 },
];

const Admissions = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const initialForm = {
    studentName: "",
    dateOfBirth: "",
    gender: "male",
    applyingForClass: "1",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    address: "",
  };
  const [form, setForm] = useState(initialForm);

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/admissions', data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Application submitted successfully. No payment is required right now.");
      setForm(initialForm);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to submit application")
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(form);
  };

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <section id="admissions" className="section-padding" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
            <span className="text-gradient-gold">Admissions</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto font-body">
            Begin your journey at Aethelgard Academy.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 relative">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass rounded-xl p-6 text-center relative"
            >
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="text-gold" size={28} />
              </div>
              <div className="text-sm font-body text-cyan font-semibold mb-1">Step {i + 1}</div>
              <h3 className="text-lg font-display font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-text-muted font-body">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Application Form */}
        <div className="max-w-4xl mx-auto glass rounded-2xl p-8 sm:p-12 mb-20">
          <h3 className="text-2xl font-display font-bold text-foreground mb-8 text-center">Online Application Form</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase ml-1">Student Full Name</label>
              <input required value={form.studentName} onChange={e => setField('studentName', e.target.value)} type="text" className="w-full bg-muted/20 border border-border/30 rounded-lg px-4 py-3 text-foreground font-body focus:outline-none focus:border-gold transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase ml-1">Date of Birth</label>
              <input required value={form.dateOfBirth} onChange={e => setField('dateOfBirth', e.target.value)} type="date" className="w-full bg-muted/20 border border-border/30 rounded-lg px-4 py-3 text-foreground font-body focus:outline-none focus:border-gold transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase ml-1">Applying for Class</label>
              <select value={form.applyingForClass} onChange={e => setField('applyingForClass', e.target.value)} className="w-full bg-muted/20 border border-border/30 rounded-lg px-4 py-3 text-foreground font-body focus:outline-none focus:border-gold transition-colors">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase ml-1">Parent/Guardian Name</label>
              <input required value={form.parentName} onChange={e => setField('parentName', e.target.value)} type="text" className="w-full bg-muted/20 border border-border/30 rounded-lg px-4 py-3 text-foreground font-body focus:outline-none focus:border-gold transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase ml-1">Parent Email</label>
              <input required value={form.parentEmail} onChange={e => setField('parentEmail', e.target.value)} type="email" className="w-full bg-muted/20 border border-border/30 rounded-lg px-4 py-3 text-foreground font-body focus:outline-none focus:border-gold transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase ml-1">Parent Phone</label>
              <input required value={form.parentPhone} onChange={e => setField('parentPhone', e.target.value)} type="tel" className="w-full bg-muted/20 border border-border/30 rounded-lg px-4 py-3 text-foreground font-body focus:outline-none focus:border-gold transition-colors" />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase ml-1">Home Address</label>
              <textarea required value={form.address} onChange={e => setField('address', e.target.value)} className="w-full bg-muted/20 border border-border/30 rounded-lg px-4 py-3 text-foreground font-body focus:outline-none focus:border-gold transition-colors h-32" />
            </div>
            <div className="sm:col-span-2 text-center mt-4">
              <button disabled={submitMutation.isPending} type="submit" className="btn-gold px-12 py-4 text-lg font-bold flex items-center justify-center gap-2 mx-auto">
                {submitMutation.isPending ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Submit Application</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Admissions;
