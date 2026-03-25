import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, MapPin, Bus, Loader2 } from "lucide-react";
import api from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const TransportModule = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ routeName: "", stops: "", driverName: "", driverPhone: "", busNumber: "", capacity: 40 });

  // Fetch routes
  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['transport-routes'],
    queryFn: async () => {
      const res = await api.get('/transport');
      return res.data.data;
    }
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data) => api.post('/transport', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['transport-routes']);
      toast.success("Route added");
      setModalOpen(false);
      setForm({ routeName: "", stops: "", driverName: "", driverPhone: "", busNumber: "", capacity: 40 });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to add route")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/transport/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['transport-routes']);
      toast.success("Route removed");
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to remove route")
  });

  const handleAdd = () => {
    if (!form.routeName || !form.driverName) {
      toast.error("Route name and driver required");
      return;
    }
    const finalForm = {
      ...form,
      stops: form.stops
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    };
    addMutation.mutate(finalForm);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-gold" size={40} />
        <p className="text-text-muted font-body">Loading transport routes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-display font-bold text-foreground">Transport</h2>
        <button onClick={() => setModalOpen(true)} className="btn-gold py-2 px-5 text-sm flex items-center gap-2">
          <Plus size={16} /> Add Route
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route) => (
          <div key={route._id} className="glass rounded-xl p-5 border border-border/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Bus size={18} className="text-gold" /> {route.routeName}
              </h3>
              <button
                onClick={() => handleDelete(route._id)}
                className="text-red-500 text-xs hover:underline font-body"
              >
                Remove
              </button>
            </div>
            <div className="space-y-2 text-sm font-body">
              <p className="text-text-muted">
                <span className="text-cyan">Driver:</span> {route.driverName}
              </p>
              <p className="text-text-muted">
                <span className="text-cyan">Bus:</span> {route.busNumber}
              </p>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-gold mt-0.5 flex-shrink-0" />
                <p className="text-text-muted">{route.stops?.join(" → ")}</p>
              </div>
              <p className="text-text-muted">
                <span className="text-cyan">Capacity:</span> {route.studentsAssigned?.length || 0} / {route.capacity}
              </p>
            </div>
          </div>
        ))}
        {routes.length === 0 && (
          <div className="col-span-full py-12 text-center glass rounded-xl">
            <p className="text-text-muted font-body">No transport routes configured.</p>
          </div>
        )}
      </div>

      {/* Map placeholder */}
      <div className="glass rounded-xl overflow-hidden h-64">
        <iframe
          title="transport-map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2433.297703999843!2d0.1181!3d52.2053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDEyJzE5LjEiTiAwwrAwNycwNS4yIkU!5e0!3m2!1sen!2suk!4v1"
          width="100%"
          height="100%"
          style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
          allowFullScreen
          loading="lazy"
        />
      </div>

      <AnimatePresence>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground">Add Route</h3>
                <button onClick={() => setModalOpen(false)} className="text-text-muted">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Route Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Route 42 - Downtown"
                    value={form.routeName}
                    onChange={(e) => setForm({ ...form, routeName: e.target.value })}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-gold/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Stops (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Stop 1, Stop 2, Stop 3"
                    value={form.stops}
                    onChange={(e) => setForm({ ...form, stops: e.target.value })}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-gold/60"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-body text-text-muted mb-1">Driver Name</label>
                    <input
                      type="text"
                      value={form.driverName}
                      onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                      className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-gold/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-body text-text-muted mb-1">Bus Number</label>
                    <input
                      type="text"
                      value={form.busNumber}
                      onChange={(e) => setForm({ ...form, busNumber: e.target.value })}
                      className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-gold/60"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleAdd}
                disabled={addMutation.isPending}
                className="w-full btn-gold py-3 rounded-xl text-sm font-bold mt-6 flex items-center justify-center gap-2"
              >
                {addMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Create Route"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransportModule;
