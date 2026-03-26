import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Trash2 } from "lucide-react";

export interface TrackedApplication {
  id: string;
  company: string;
  role: string;
  matchPercent: number;
  status: string;
  addedAt: string;
}

const STORAGE_KEY = "lumina-jd-applications";

const STATUS_OPTIONS = ["Applied", "Interview", "Assessment", "Offer", "Rejected", "Saved"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Interview": return "text-[hsl(var(--skill-core))] bg-[hsl(var(--skill-core)/0.12)]";
    case "Offer": return "text-[hsl(var(--badge-gold))] bg-[hsl(var(--badge-gold)/0.12)]";
    case "Rejected": return "text-destructive bg-destructive/10";
    case "Assessment": return "text-[hsl(var(--skill-supporting))] bg-[hsl(var(--skill-supporting)/0.12)]";
    default: return "text-primary bg-primary/10";
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

  const updateStatus = (id: string, newStatus: string) => {
    const updated = apps.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setApps(updated);
  };

  const removeApp = (id: string) => {
    const updated = apps.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setApps(updated);
  };

  if (apps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12 max-w-6xl mx-auto"
    >
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="pb-2 font-medium">Company</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium text-center">Match</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-center">Added</th>
                <th className="pb-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {apps.map((app) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2.5 font-medium text-foreground">{app.company}</td>
                    <td className="py-2.5 text-muted-foreground">{app.role}</td>
                    <td className="py-2.5 text-center">
                      <span className="text-primary font-semibold">{app.matchPercent}%</span>
                    </td>
                    <td className="py-2.5">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-none cursor-pointer ${getStatusColor(app.status)}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 text-center text-xs text-muted-foreground">
                      {new Date(app.addedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        onClick={() => removeApp(app.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
