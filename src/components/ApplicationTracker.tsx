import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Trash2, Pencil, Check, X, Loader2, Plus, TrendingUp, ArrowRight, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useApplications, type TrackedApplication } from "@/hooks/useApplications";

const STATUS_OPTIONS = ["Saved", "Applied", "Interview", "Assessment", "Offer", "Rejected"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Interview": return "text-accent-blue bg-accent-blue/10 border-accent-blue/20";
    case "Offer": return "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20";
    case "Rejected": return "text-accent-red bg-accent-red/10 border-accent-red/20";
    case "Assessment": return "text-accent-violet bg-accent-violet/10 border-accent-violet/20";
    case "Applied": return "text-accent-amber bg-accent-amber/10 border-accent-amber/20";
    default: return "text-muted-foreground bg-muted border-border/40";
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
      toast.success("Updated successfully.");
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
      toast.success("Removed from tracker.");
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

  const totalApps = apps.length;
  const interviewCount = apps.filter(a => a.status === "Interview" || a.status === "Assessment").length;
  const offerCount = apps.filter(a => a.status === "Offer").length;

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Stats row */}
      {totalApps > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { label: "Total Pipeline", value: totalApps, color: "text-accent-blue" },
            { label: "Interviews", value: interviewCount, color: "text-accent-violet" },
            { label: "Offers Won", value: offerCount, color: "text-accent-emerald" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
              className="premium-card rounded-[40px] p-10 text-center relative overflow-hidden group"
            >
              <div className="relative z-10">
                <span className={`text-6xl md:text-7xl font-display font-black tracking-tighter ${stat.color} block leading-none`}>{stat.value}</span>
                <p className="font-display font-black text-[10px] uppercase tracking-[0.4em] text-muted-foreground/40 mt-6 leading-none group-hover:text-muted-foreground/70 transition-colors">{stat.label}</p>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Briefcase className={`w-32 h-32 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card rounded-[40px] p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-12 flex-wrap gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-accent-blue/5 border border-accent-blue/10 flex items-center justify-center shadow-2xl shadow-accent-blue/10">
              <Briefcase className="w-8 h-8 text-accent-blue" />
            </div>
            <div>
              <h3 className="font-display font-black text-2xl md:text-3xl text-foreground tracking-tighter leading-none mb-2">
                Executive Pipeline
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40">Monitoring {apps.length} Strategic Opportunities</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95, y: 0 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="relative overflow-hidden flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-foreground text-background hover:scale-[1.05] transition-all shadow-2xl shadow-foreground/20"
          >
            <Plus className="w-4 h-4" /> Add Manual Intelligence
          </motion.button>
        </div>

        {/* Manual Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 32 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-6 rounded-2xl border border-accent-blue/10 bg-accent-blue/5 shadow-inner">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent-blue/60 ml-1">Company</span>
                  <input
                    placeholder="e.g. Google"
                    value={newApp.company}
                    onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-border/40 rounded-xl bg-background/60 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/80 focus:ring-2 focus:ring-accent-blue/30 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent-blue/60 ml-1">Role</span>
                  <input
                    placeholder="e.g. Senior Designer"
                    value={newApp.role}
                    onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-border/40 rounded-xl bg-background/60 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/80 focus:ring-2 focus:ring-accent-blue/30 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent-blue/60 ml-1">Match %</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newApp.matchPercent || ""}
                    onChange={(e) => setNewApp({ ...newApp, matchPercent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 text-sm border border-border/40 rounded-xl bg-background/60 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/80 focus:ring-2 focus:ring-accent-blue/30 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent-blue/60 ml-1">Status</span>
                  <select
                    value={newApp.status}
                    onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-border/40 rounded-xl bg-background/60 backdrop-blur-sm text-foreground focus:ring-2 focus:ring-accent-blue/30 focus:outline-none transition-all shadow-sm cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98, y: 0 }}
                    onClick={handleManualAdd}
                    className="relative overflow-hidden flex-1 px-4 py-3 rounded-xl text-xs font-bold bg-accent-blue text-white hover:bg-accent-blue/90 transition-all shadow-lg shadow-accent-blue/10"
                  >
                    <Check className="w-3.5 h-3.5 inline mr-1.5" /> Save
                  </motion.button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-3 rounded-xl text-muted-foreground hover:text-foreground border border-border/60 bg-background/40 transition-all shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && apps.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
          </div>
        ) : apps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/50"
          >
            <motion.div
              animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Briefcase className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            </motion.div>
            <h4 className="font-display font-bold text-lg text-foreground/60 mb-2">No applications yet</h4>
            <p className="max-w-md mx-auto text-sm text-muted-foreground/80 leading-relaxed px-4">
              Your career pipeline is empty. Decode a JD and use the <strong>"Add to Tracker"</strong> feature to start monitoring your professional journey.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {['Interview', 'Assessment', 'Offer', 'Applied', 'Saved', 'Rejected'].map((status) => {
                const columnApps = apps.filter(a => a.status === status);
                if (columnApps.length === 0) return null;

                return (
                  <motion.div key={status} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                      <h4 className={`font-display font-bold text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border shadow-sm ${getStatusColor(status)}`}>{status}</h4>
                      <span className="font-display font-bold text-[9px] text-muted-foreground/60 font-mono tracking-tighter bg-muted/20 px-2.5 py-1 rounded-full uppercase tracking-widest">{columnApps.length} ITEMS</span>
                    </div>
                    
                    <div className="space-y-4">
                      {columnApps.map((app) => {
                        const isEditing = editingId === app.id;
                        const currentMatch = app.currentMatchPercent ?? app.matchPercent;
                        const improved = currentMatch > app.matchPercent;

                        return (
                           <motion.div
                            key={app.id}
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group p-8 rounded-3xl border border-white/5 hover:border-accent-blue/40 transition-all duration-700 hover:shadow-2xl hover:shadow-accent-blue/5 relative"
                          >
                            {/* Actions Overlay */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-20">
                              {isEditing ? (
                                <>
                                  <button onClick={() => saveEdit(app.id)} className="p-2 bg-lumina-teal text-white rounded-xl shadow-lg shadow-teal-500/10 hover:scale-110 transition-transform"><Check className="w-3.5 h-3.5" /></button>
                                  <button onClick={cancelEdit} className="p-2 bg-background/80 text-muted-foreground rounded-xl border border-border/40 hover:scale-110 transition-transform"><X className="w-3.5 h-3.5" /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => startEdit(app)} className="p-2.5 bg-background/50 text-muted-foreground hover:text-accent-blue rounded-xl border border-border/40 hover:shadow-md transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleRemove(app.id)} className="p-2.5 bg-background/50 text-muted-foreground hover:text-accent-red rounded-xl border border-border/40 hover:shadow-md transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                </>
                              )}
                            </div>

                            <div className="mb-5 pr-14">
                              {isEditing ? (
                                <div className="space-y-3">
                                  <input 
                                    value={editForm.company || ""} 
                                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} 
                                    className="w-full px-4 py-2 text-sm border border-border/40 rounded-xl bg-background/60 text-foreground font-bold focus:ring-2 focus:ring-accent-blue/30 focus:outline-none" 
                                  />
                                  <input 
                                    value={editForm.role || ""} 
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} 
                                    className="w-full px-4 py-2 text-xs border border-border/40 rounded-xl bg-background/60 text-muted-foreground focus:ring-2 focus:ring-accent-blue/30 focus:outline-none" 
                                  />
                                </div>
                              ) : (
                                <>
                                  <h5 className="font-display font-bold text-lg text-foreground tracking-tight truncate mb-1">{app.company}</h5>
                                  <p className="text-[13px] text-muted-foreground/80 font-medium truncate">{app.role}</p>
                                </>
                              )}
                            </div>

                            <div className="flex items-end justify-between border-t border-border/10 pt-5 mt-2">
                              <div className="space-y-2">
                                <span className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 block leading-none">Intelligence Match</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-xl font-display font-bold text-foreground tracking-tighter">{app.matchPercent}%</span>
                                  {isEditing ? (
                                    <div className="flex items-center gap-1.5 bg-background/40 px-2 py-1 rounded-lg border border-border/40 shadow-inner">
                                      <ArrowRight className="w-3 h-3 text-muted-foreground/60" />
                                      <input 
                                        type="number" 
                                        min={0} 
                                        max={100} 
                                        value={editForm.currentMatchPercent ?? currentMatch} 
                                        onChange={(e) => setEditForm({ ...editForm, currentMatchPercent: Number(e.target.value) })} 
                                        className="w-10 px-0.5 py-0.5 text-xs text-foreground bg-transparent text-center font-bold focus:outline-none" 
                                      />
                                    </div>
                                  ) : (
                                    currentMatch !== app.matchPercent && (
                                      <div className="flex items-center gap-2">
                                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                                        <span className={`text-xl font-display font-bold flex items-center tracking-tighter ${improved ? "text-accent-emerald" : "text-accent-red"}`}>
                                          {currentMatch}%
                                          {improved && <TrendingUp className="w-3.5 h-3.5 ml-1 drop-shadow-sm" />}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right space-y-3">
                                <div className="flex items-center justify-end gap-1.5 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">
                                  <Calendar className="w-3 h-3 opacity-40" />
                                  {new Date(app.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                {isEditing && (
                                  <select 
                                    value={editForm.status || app.status} 
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} 
                                    className="font-display font-bold text-[9px] uppercase tracking-widest px-3 py-2 rounded-xl border border-border/40 bg-background/60 cursor-pointer shadow-sm focus:ring-2 focus:ring-accent-blue/30 focus:outline-none appearance-none text-center min-w-[100px]"
                                  >
                                    {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                                  </select>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
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
