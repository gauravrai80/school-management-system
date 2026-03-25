import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Teacher", value: "teacher" },
  { label: "Student", value: "student" },
  { label: "Parent", value: "parent" },
];

const AdminLogin = () => {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (role && loggedInUser?.role !== role) {
        throw new Error(`This account is registered as ${loggedInUser?.role}.`);
      }
      toast.success(`Welcome back!`);
      navigate("/admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (cred) => {
    setEmail(cred.email);
    setPassword(cred.pass);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0A0E1A 0%, #161B2D 40%, #0D1117 100%)" }}
    >
      <div
        className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl animate-float"
        style={{ background: "radial-gradient(circle, #FFD700, transparent)", top: "-10%", left: "-10%" }}
      />
      <div
        className="absolute w-96 h-96 rounded-full opacity-15 blur-3xl animate-float"
        style={{
          background: "radial-gradient(circle, #00F5FF, transparent)",
          bottom: "-10%",
          right: "-10%",
          animationDelay: "1.5s",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-gradient-gold mb-2">Aethelgard</h1>
            <p className="text-text-muted font-body text-sm">School Management Portal</p>
          </div>

          {/* Role tabs */}
          <div className="flex rounded-xl overflow-hidden mb-8 border border-border/30">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`flex-1 py-2.5 text-xs font-body font-semibold transition-all duration-300 ${
                  role === r.value
                    ? "bg-gold text-gold-foreground"
                    : "bg-transparent text-text-muted hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted/30 border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-foreground font-body text-sm placeholder:text-text-muted/60 focus:outline-none focus:border-gold/60 transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted/30 border border-border/40 rounded-xl pl-12 pr-4 py-3.5 text-foreground font-body text-sm placeholder:text-text-muted/60 focus:outline-none focus:border-gold/60 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold rounded-xl py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {loading ? "Signing In..." : `Login as ${roles.find((r) => r.value === role)?.label}`}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
