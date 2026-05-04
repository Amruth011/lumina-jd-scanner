import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useUsage = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState({
    scansUsed: 0,
    scansTotal: 50,
    tailorsUsed: 0,
    tailorsTotal: 25,
    loading: true
  });

  const fetchUsage = async () => {
    if (!user) return;
    
    setUsage(prev => ({ ...prev, loading: true }));
    
    try {
      const [scansRes, tailorsRes] = await Promise.all([
        supabase.from("jd_vault").select("*", { count: 'exact', head: true }).eq("user_id", user.id),
        supabase.from("generated_resumes").select("*", { count: 'exact', head: true }).eq("user_id", user.id)
      ]);

      setUsage({
        scansUsed: scansRes.count || 0,
        scansTotal: 50,
        tailorsUsed: tailorsRes.count || 0,
        tailorsTotal: 25,
        loading: false
      });
    } catch (error) {
      console.error("Error fetching usage:", error);
      setUsage(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [user]);

  return { ...usage, refreshUsage: fetchUsage };
};
