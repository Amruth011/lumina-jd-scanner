import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Trash2, Pencil, Check, X, Loader2, Plus, TrendingUp, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useApplications, type TrackedApplication } from "@/hooks/useApplications";

const STATUS_OPTIONS = ["Saved", "Applied", "Interview", "Assessment", "Offer", "Rejected"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Interview": return "text-[hsl(var(--skill-core))] bg-[hsl(var(--skill-core)/0.12)]";
    case "Offer": return "text-[hsl(var(--badge-gold))] bg-[hsl(var(--badge-gold)/0.12)]";
    case "Rejected": return "text-destructive bg-destructive/10";
    case "Assessment": return "text-[hsl(var(--skill-supporting))] bg-[hsl(var(--skill-supporting)/0.12)]";
    case "Applied": return "text-primary bg-primary/10";
    default: return "text-muted-foreground bg-muted";
  }
};

export const ApplicationTracker = () => {
  const { apps, loading, saveApp, updateApp, removeApp, refresh } = useApplications();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TrackedApplication>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApp, setNewApp] = useState({ company: "", role: "", matchPercent: 0, status: "Applied" });

  const startEdit = (app: TrackedApplication) => {
    setEditingId(app.id);
    setEditForm({ company: app.company, role: app.role, status: app.status, currentMatchPercent: app.currentMatchPercent ?? app.matchPercent });
  };

  const saveEdit = async (id: string) => {
    try {
      await updateApp(id, {
        company: editForm.company,
        role: editForm.role,
        status: editForm.status,
        currentMatchPercent: editForm.currentMatchPercent,
      });
      setEditingId(null);
      refresh();
    } catch {
      toast.error("Failed to update.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleRemove = async (id: string) => {
    try {
      await removeApp(id);
      refresh();
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleManualAdd = async () => {
    if (!newApp.company.trim() || !newApp.role.trim()) {
      toast.error("Company and Role are required.");
      return;
    }
    try {
      await saveApp({
        id: crypto.randomUUID(),
        company: newApp.company,
        role: newApp.role,
        matchPercent: newApp.matchPercent,
        currentMatchPercent: newApp.matchPercent,
        status: newApp.status,
        addedAt: new Date().toISOString(),
      });
      setNewApp({ company: "", role: "", matchPercent: 0, status: "Applied" });
      setShowAddForm(false);
      refresh();
      toast.success("Application added!");
    } catch {
      toast.error("Failed to save. Please sign in first.");
    }
  };

  // Stats
  const totalApps = apps.length;
  const interviewCount = apps.filter(a => a.status === "Interview" || a.status === "Assessment").length;
  const offerCount = apps.filter(a => a.status === "Offer").length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Stats row */}
      {totalApps > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          {[
            { label: "Total Applications", value: totalApps, color: "text-primary" },
            { label: "In Pipeline", value: interviewCount, color: "text-[hsl(var(--skill-core))]" },
            { label: "Offers", value: offerCount, color: "text-[hsl(var(--badge-gold))]" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-strong rounded-xl p-4 text-center glow-border"
            >
              <span className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</span>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6 glow-border"
      >
        <div className="flex items-center gap-2 mb-5">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="p-2 rounded-lg bg-primary/10"
          >
            <Briefcase className="w-5 h-5 text-primary" />
          </motion.div>
          <h3 className="font-display font-semibold text-lg text-foreground">
            My Applications
          </h3>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{apps.length} tracked</span>
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95, y: 0 }}
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all specular-highlight premium-button-glow shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> <span className="tracking-tight">Add Manually</span>
            </motion.button>
          </div>
        </div>

        {/* Manual Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-5 p-4 rounded-xl border border-border bg-muted/30">
                <input
                  placeholder="Company *"
                  value={newApp.company}
                  onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                  className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                />
                <input
                  placeholder="Role *"
                  value={newApp.role}
                  onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                  className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Match %"
                  value={newApp.matchPercent || ""}
                  onChange={(e) => setNewApp({ ...newApp, matchPercent: Number(e.target.value) })}
                  className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                />
                <select
                  value={newApp.status}
                  onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
                  className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                >
                  {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98, y: 0 }}
                    onClick={handleManualAdd}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold bg-accent text-accent-foreground hover:bg-muted transition-all specular-highlight premium-button-glow"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Application
                  </motion.button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && apps.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : apps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            </motion.div>
            <p className="text-sm text-muted-foreground">No applications tracked yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Decode a JD and run a Gap Analysis, then click "Add to Tracker" or use "Add Manually".</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {['Applied', 'Assessment', 'Interview', 'Offer', 'Saved', 'Rejected'].map((status) => {
                const columnApps = apps.filter(a => a.status === status);
                if (columnApps.length === 0) return null;

                return (
                  <motion.div key={status} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${getStatusColor(status)}`}>{status}</h4>
                      <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">{columnApps.length}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <AnimatePresence>
                        {columnApps.map((app) => {
                          const isEditing = editingId === app.id;
                          const currentMatch = app.currentMatchPercent ?? app.matchPercent;
                          const improved = currentMatch > app.matchPercent;

                          return (
                             <motion.div
                              key={app.id}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="bg-background/40 border border-border/80 hover:border-primary/40 rounded-xl p-4 shadow-sm backdrop-blur-sm transition-all group relative"
                            >
                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/80 backdrop-blur-sm p-1 rounded-lg z-10">
                                {isEditing ? (
                                  <>
                                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => saveEdit(app.id)} className="p-1 text-[hsl(var(--skill-core))] hover:bg-muted rounded"><Check className="w-4 h-4" /></motion.button>
                                    <motion.button whileHover={{ scale: 1.1 }} onClick={cancelEdit} className="p-1 text-muted-foreground hover:bg-muted rounded"><X className="w-4 h-4" /></motion.button>
                                  </>
                                ) : (
                                  <>
                                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => startEdit(app)} className="p-1 text-muted-foreground hover:text-primary hover:bg-muted rounded"><Pencil className="w-3.5 h-3.5" /></motion.button>
                                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleRemove(app.id)} className="p-1 text-muted-foreground hover:text-destructive hover:bg-muted rounded"><Trash2 className="w-3.5 h-3.5" /></motion.button>
                                  </>
                                )}
                              </div>

                              <div className="mb-3 pr-16 relative">
                                {isEditing ? (
                                  <input value={editForm.company || ""} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} className="w-full px-2 py-1 text-sm border border-border rounded-md bg-background text-foreground font-semibold mb-1" />
                                ) : (
                                  <h5 className="font-semibold text-foreground truncate text-base mb-0.5">{app.company}</h5>
                                )}
                                {isEditing ? (
                                  <input value={editForm.role || ""} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-2 py-1 text-xs border border-border rounded-md bg-background text-muted-foreground" />
                                ) : (
                                  <p className="text-xs text-muted-foreground truncate">{app.role}</p>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-4">
                                <div className="flex flex-col">
                                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Match</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-semibold">{app.matchPercent}%</span>
                                    {isEditing ? (
                                      <input type="number" min={0} max={100} value={editForm.currentMatchPercent ?? currentMatch} onChange={(e) => setEditForm({ ...editForm, currentMatchPercent: Number(e.target.value) })} className="w-14 px-1 py-0.5 text-xs border border-border rounded bg-background text-center" />
                                    ) : (
                                      currentMatch !== app.matchPercent && (
                                        <>
                                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                          <span className={`text-sm font-bold flex items-center ${improved ? "text-[hsl(var(--skill-core))]" : "text-primary"}`}>
                                            {currentMatch}%
                                            {improved && <TrendingUp className="w-3 h-3 ml-0.5" />}
                                          </span>
                                        </>
                                      )
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] tracking-wider text-muted-foreground/60 mb-1">{new Date(app.addedAt).toLocaleDateString()}</span>
                                  {isEditing && (
                                    <select value={editForm.status || app.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="text-xs font-semibold px-2 py-1 rounded-md border border-border bg-background cursor-pointer mt-1 relative z-20">
                                      {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                                    </select>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};
