import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { DecodeResult } from "@/types/jd";
import { getCachedDecode, setCachedDecode, clearDecodeCache } from "@/lib/jdCache";

export const useDecodeJD = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<DecodeResult | null>(null);
  const [wasCached, setWasCached] = useState(false);

  const resetResults = () => setResults(null);

  const decodeJD = async (jdText: string, forceRefresh = false) => {
    if (jdText.trim().length < 20) {
      toast.error("Please paste a job description (min 20 characters).");
      return;
    }

    setIsScanning(true);
    setResults(null);
    setWasCached(false);

    try {
      // ── CHECK CACHE FIRST (unless force-refresh) ──
      // If we've already decoded this exact JD text, reuse the cached result.
      // This ensures 100% consistent scores for the same JD + resume combo.
      if (!forceRefresh) {
        const cached = await getCachedDecode(jdText);
        if (cached) {
          setResults(cached);
          setWasCached(true);
          toast.success(`Decoded: ${cached.title} (cached — consistent score)`, { duration: 4000 });
          return;
        }
      }

      // ── CACHE MISS or FORCE REFRESH: Call AI to decode ──
      const { data, error } = await supabase.functions.invoke("decode-jd", {
        body: { jdText },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const result: DecodeResult = {
        title: data.title,
        skills: data.skills,
        requirements: data.requirements || { education: [], experience: "", soft_skills: [], agreements: [] },
        winning_strategy: data.winning_strategy || [],
      };

      // ── STORE IN CACHE ──
      // Next time the same JD is decoded, we'll get the exact same skills
      // → exact same deterministic score
      await setCachedDecode(jdText, result);

      setResults(result);
      setWasCached(false);
      toast.success(`Decoded: ${data.title}${forceRefresh ? " (fresh decode)" : ""}`, { duration: 4000 });
    } catch (err) {
      console.error("Decode JD Error:", err);
      const errorMessage = (err as Error & { context?: { message?: string } })?.context?.message || (err as Error).message || "Unknown error";
      
      if (errorMessage.includes("non-2xx")) {
        toast.error("AI Service Error: The strategy engine is busy or misconfigured. Please check your Supabase logs.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsScanning(false);
    }
  };

  return {
    isScanning,
    results,
    setResults,
    resetResults,
    decodeJD,
    wasCached,
    clearCache: clearDecodeCache,
  };
};
