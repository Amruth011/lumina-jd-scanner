import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Trash2, Pencil, Check, X } from "lucide-react";

export interface TrackedApplication {
  id: string;
  company: string;
  role: string;
  matchPercent: number;
  currentMatchPercent?: number;
  status: string;
  addedAt: string;
}

const STORAGE_KEY = "lumina-jd-applications";

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

export const loadApplications = (): TrackedApplication[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveApplication = (app: TrackedApplication) => {
  const apps = loadApplications();
  apps.unshift(app);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
};

export const ApplicationTracker = () => {
  const [apps, setApps] = useState<TrackedApplication[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TrackedApplication>>({});

  useEffect(() => {
    setApps(loadApplications());
    const handler = () => setApps(loadApplications());
    window.addEventListener("storage", handler);
    window.addEventListener("tracker-updated", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("tracker-updated", handler);
    };
  }, []);

  const persist = (updated: TrackedApplication[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setApps(updated);
  };

  const startEdit = (app: TrackedApplication) => {
    setEditingId(app.id);
    setEditForm({ company: app.company, role: app.role, status: app.status, currentMatchPercent: app.currentMatchPercent ?? app.matchPercent });
  };

  const saveEdit = (id: string) => {
    const updated = apps.map((a) =>
      a.id === id ? { ...a, company: editForm.company ?? a.company, role: editForm.role ?? a.role, status: editForm.status ?? a.status, currentMatchPercent: editForm.currentMatchPercent ?? a.currentMatchPercent ?? a.matchPercent } : a
    );
    persist(updated);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const updateStatus = (id: string, newStatus: string) => {
    persist(apps.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
  };

  const removeApp = (id: string) => {
    persist(apps.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="glass-strong rounded-2xl p-6 glow-border">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-lg bg-primary/10">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-lg text-foreground">
            My Applications
          </h3>
          <span className="text-xs text-muted-foreground ml-auto">{apps.length} tracked</span>
        </div>

        {apps.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No applications tracked yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Decode a JD and run a Gap Analysis, then click "Add to Tracker".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="pb-2 font-medium">Company</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium text-center">Initial %</th>
                  <th className="pb-2 font-medium text-center">Current %</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-center">Date</th>
                  <th className="pb-2 w-20"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {apps.map((app) => {
                    const isEditing = editingId === app.id;
                    const currentMatch = app.currentMatchPercent ?? app.matchPercent;
                    const improved = currentMatch > app.matchPercent;

                    return (
                      <motion.tr
                        key={app.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-2.5">
                          {isEditing ? (
                            <input
                              value={editForm.company || ""}
                              onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-border rounded-md bg-background text-foreground"
                            />
                          ) : (
                            <span className="font-medium text-foreground">{app.company}</span>
                          )}
                        </td>
                        <td className="py-2.5">
                          {isEditing ? (
                            <input
                              value={editForm.role || ""}
                              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-border rounded-md bg-background text-foreground"
                            />
                          ) : (
                            <span className="text-muted-foreground">{app.role}</span>
                          )}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className="text-muted-foreground font-medium">{app.matchPercent}%</span>
                        </td>
                        <td className="py-2.5 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={editForm.currentMatchPercent ?? currentMatch}
                              onChange={(e) => setEditForm({ ...editForm, currentMatchPercent: Number(e.target.value) })}
                              className="w-16 px-2 py-1 text-sm border border-border rounded-md bg-background text-foreground text-center"
                            />
                          ) : (
                            <span className={`font-semibold ${improved ? "text-[hsl(var(--skill-core))]" : "text-primary"}`}>
                              {currentMatch}%
                              {improved && <span className="text-[10px] ml-1">↑</span>}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5">
                          {isEditing ? (
                            <select
                              value={editForm.status || app.status}
                              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                              className="text-xs font-semibold px-2 py-1 rounded-full border border-border bg-background text-foreground cursor-pointer"
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <select
                              value={app.status}
                              onChange={(e) => updateStatus(app.id, e.target.value)}
                              className={`text-xs font-semibold px-2 py-1 rounded-full border-none cursor-pointer ${getStatusColor(app.status)}`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="py-2.5 text-center text-xs text-muted-foreground">
                          {new Date(app.addedAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 text-center">
                          <div className="flex items-center gap-1 justify-center">
                            {isEditing ? (
                              <>
                                <button onClick={() => saveEdit(app.id)} className="text-[hsl(var(--skill-core))] hover:opacity-70 transition-colors">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground transition-colors">
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(app)} className="text-muted-foreground hover:text-primary transition-colors">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => removeApp(app.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
