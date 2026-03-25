import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/config/api";
import { toast } from "react-hot-toast";
import { Save, Loader2, Globe, Bell, Shield } from "lucide-react";

const rolePermissions = [
  {
    role: "Admin",
    dashboard: true,
    students: true,
    teachers: true,
    attendance: true,
    grades: true,
    fees: true,
    settings: true,
  },
  {
    role: "Teacher",
    dashboard: true,
    students: false,
    teachers: false,
    attendance: true,
    grades: true,
    fees: false,
    settings: false,
  },
  {
    role: "Student",
    dashboard: true,
    students: false,
    teachers: false,
    attendance: false,
    grades: false,
    fees: false,
    settings: false,
  },
  {
    role: "Parent",
    dashboard: true,
    students: false,
    teachers: false,
    attendance: false,
    grades: false,
    fees: false,
    settings: false,
  },
];

const SettingsModule = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get("/settings");
      return res.data.data;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (updatedSettings) => {
      return api.put("/settings", updatedSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["settings"]);
      toast.success("Settings updated successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update settings");
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-foreground">School Settings</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={18} className="text-gold" />
            <h3 className="font-display font-bold text-foreground">General Information</h3>
          </div>
          {[
            { key: "name", label: "School Name" },
            { key: "address", label: "Address" },
            { key: "phone", label: "Phone" },
            { key: "email", label: "Email" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-body text-text-muted mb-1">{f.label}</label>
              <input
                type="text"
                value={formData[f.key] || ""}
                onChange={(e) => setFormData((s) => ({ ...s, [f.key]: e.target.value }))}
                className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-gold/60"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-body text-text-muted mb-1">Academic Year</label>
            <select
              value={formData.academicYear || "2024-2025"}
              onChange={(e) => setFormData((s) => ({ ...s, academicYear: e.target.value }))}
              className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none"
            >
              {["2024-2025", "2025-2026", "2026-2027"].map((y) => (
                <option key={y} className="bg-card">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-gold" />
              <h3 className="font-display font-bold text-foreground">Global Notifications</h3>
            </div>
            <div className="space-y-3">
              {[
                { key: "smsNotifications", label: "SMS Notifications" },
                { key: "emailNotifications", label: "Email Notifications" },
              ].map((f) => (
                <div key={f.key} className="flex items-center justify-between">
                  <span className="font-body text-sm text-foreground">{f.label}</span>
                  <button
                    onClick={() => setFormData((s) => ({ ...s, [f.key]: !s[f.key] }))}
                    className={`w-12 h-6 rounded-full transition-all ${formData[f.key] ? "bg-gold" : "bg-muted"}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-foreground transition-transform ${formData[f.key] ? "translate-x-6" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            {updateMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save Settings
          </button>
        </div>
      </div>

      {/* Role permissions */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-gold" />
          <h3 className="font-display font-bold text-foreground">Role & Access Control</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                {["Role", "Dashboard", "Students", "Teachers", "Attendance", "Grades", "Fees", "Settings"].map((h) => (
                  <th key={h} className="text-center px-3 py-2 text-xs font-body font-semibold text-text-muted uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rolePermissions.map((rp) => (
                <tr key={rp.role} className="border-b border-border/10">
                  <td className="px-3 py-2 font-body text-sm text-foreground font-semibold text-left">{rp.role}</td>
                  {["dashboard", "students", "teachers", "attendance", "grades", "fees", "settings"].map((perm) => (
                    <td key={perm} className="px-3 py-2 text-center">
                      <span className={`text-sm ${rp[perm] ? "text-green-400" : "text-destructive/50"}`}>
                        {rp[perm] ? "✓" : "✗"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


export default SettingsModule;
