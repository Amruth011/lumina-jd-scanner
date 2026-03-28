import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Trash2, Pencil, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface TrackedApplication {
  id: string;
  company: string;
  role: string;
  matchPercent: number;
  currentMatchPercent?: number;
  status: string;
  addedAt: string;
}

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

export const saveApplication = async (app: TrackedApplication) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("user_applications").insert({
    user_id: user.id,
    company: app.company,
    role: app.role,
    match_percent: app.matchPercent,
    current_match_percent: app.currentMatchPercent ?? app.matchPercent,
    status: app.status,
  });

  if (error) {
    console.error("Save application error:", error);
    throw error;
  }
};

export const ApplicationTracker = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState<TrackedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TrackedApplication>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApp, setNewApp] = useState({ company: "", role: "", matchPercent: 0, status: "Applied" });

  const fetchApps = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("user_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load applications.");
    } else {
      setApps(
        (data || []).map((row: any) => ({
          id: row.id,
          company: row.company,
          role: row.role,
          matchPercent: row.match_percent,
          currentMatchPercent: row.current_match_percent,
          status: row.status,
          addedAt: row.created_at,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
    const handler = () => fetchApps();
    window.addEventListener("tracker-updated", handler);
    return () => window.removeEventListener("tracker-updated", handler);
  }, [user]);

  const startEdit = (app: TrackedApplication) => {
    setEditingId(app.id);
    setEditForm({ company: app.company, role: app.role, status: app.status, currentMatchPercent: app.currentMatchPercent ?? app.matchPercent });
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from("user_applications")
      .update({
        company: editForm.company,
        role: editForm.role,
        status: editForm.status,
        current_match_percent: editForm.currentMatchPercent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update.");
    } else {
      setEditingId(null);
      fetchApps();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("user_applications")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) toast.error("Failed to update status.");
    else fetchApps();
  };

  const removeApp = async (id: string) => {
    const { error } = await supabase
      .from("user_applications")
      .delete()
      .eq("id", id);

    if (error) toast.error("Failed to delete.");
    else fetchApps();
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : apps.length === 0 ? (
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
                            <input value={editForm.company || ""} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} className="w-full px-2 py-1 text-sm border border-border rounded-md bg-background text-foreground" />
                          ) : (
                            <span className="font-medium text-foreground">{app.company}</span>
                          )}
                        </td>
                        <td className="py-2.5">
                          {isEditing ? (
                            <input value={editForm.role || ""} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-2 py-1 text-sm border border-border rounded-md bg-background text-foreground" />
                          ) : (
                            <span className="text-muted-foreground">{app.role}</span>
                          )}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className="text-muted-foreground font-medium">{app.matchPercent}%</span>
                        </td>
                        <td className="py-2.5 text-center">
                          {isEditing ? (
                            <input type="number" min={0} max={100} value={editForm.currentMatchPercent ?? currentMatch} onChange={(e) => setEditForm({ ...editForm, currentMatchPercent: Number(e.target.value) })} className="w-16 px-2 py-1 text-sm border border-border rounded-md bg-background text-foreground text-center" />
                          ) : (
                            <span className={`font-semibold ${improved ? "text-[hsl(var(--skill-core))]" : "text-primary"}`}>
                              {currentMatch}%
                              {improved && <span className="text-[10px] ml-1">↑</span>}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5">
                          {isEditing ? (
                            <select value={editForm.status || app.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="text-xs font-semibold px-2 py-1 rounded-full border border-border bg-background text-foreground cursor-pointer">
                              {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                            </select>
                          ) : (
                            <select value={app.status} onChange={(e) => updateStatus(app.id, e.target.value)} className={`text-xs font-semibold px-2 py-1 rounded-full border-none cursor-pointer ${getStatusColor(app.status)}`}>
                              {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
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
                                <button onClick={() => saveEdit(app.id)} className="text-[hsl(var(--skill-core))] hover:opacity-70 transition-colors"><Check className="w-4 h-4" /></button>
                                <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(app)} className="text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => removeApp(app.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
