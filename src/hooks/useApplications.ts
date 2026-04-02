import { useState, useEffect } from "react";
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

export const useApplications = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState<TrackedApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    if (!user) {
      setApps([]);
      setLoading(false);
      return;
    }
    
    // setLoading only if we have no apps yet to avoid flicker during realtime syncing
    if (apps.length === 0) setLoading(true);
    
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

    if (!user) return;

    // Real-time listener for multi-tab / mobile sync
    const channel = supabase
      .channel('user_applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_applications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchApps();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("tracker-updated", handler);
      supabase.removeChannel(channel);
    };
  }, [user]);

  const saveApp = async (app: TrackedApplication) => {
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase.from("user_applications").insert({
      user_id: user.id,
      company: app.company,
      role: app.role,
      match_percent: app.matchPercent,
      current_match_percent: app.currentMatchPercent ?? app.matchPercent,
      status: app.status,
    });
    if (error) throw error;
  };

  const updateApp = async (id: string, updates: Partial<TrackedApplication>) => {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.company) dbUpdates.company = updates.company;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.currentMatchPercent !== undefined) dbUpdates.current_match_percent = updates.currentMatchPercent;

    const { error } = await supabase
      .from("user_applications")
      .update(dbUpdates)
      .eq("id", id);
    if (error) throw error;
  };

  const removeApp = async (id: string) => {
    const { error } = await supabase
      .from("user_applications")
      .delete()
      .eq("id", id);
    if (error) throw error;
  };

  return { apps, loading, saveApp, updateApp, removeApp, refresh: fetchApps };
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
