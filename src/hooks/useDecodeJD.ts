import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { DecodeResult } from "@/types/jd";
import { getCachedDecode, setCachedDecode, clearDecodeCache } from "@/lib/jdCache";
import { clearResumeAnalysisCache } from "@/lib/resumeAnalysisCache";

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
      // ── CHECK CACHE ──
      if (!forceRefresh) {
        const cached = await getCachedDecode(jdText);
        if (cached && cached.grade) { // Ensure cache has 2.0 data
          setResults(cached);
          setWasCached(true);
          toast.success(`Decoded: ${cached.title}`, { duration: 4000 });
          return;
        }
      }

      // ── CALL TOTAL INTELLIGENCE ENGINE (Supabase Edge Function) ──
      console.log("── LUMINA ENGINE REQUEST INITIATED ──");
      console.log("Payload Length:", jdText.length);
      
      const { data, error } = await supabase.functions.invoke('decode-jd', {
        body: { jdText }
      });

      if (error) throw error;
      if (!data) throw new Error("AI Engine returned empty data");
      if (data.error) throw new Error(data.error);

      // ── JD SIGNAL VALIDATION ──
      if (data.valid === false) {
        toast.error(data.message || "This doesn't appear to be a job description.");
        setIsScanning(false);
        return;
      }

      // Explicit schema validation
      if (!data.grade || !data.skills) {
        console.error("Malformed AI Response:", data);
        throw new Error("Intelligence Engine returned an incomplete scan. Please try again.");
      }

      // Normalize winning strategy if needed (safety check)
      const normalizedWinningStrategy = Array.isArray(data.winning_strategy) 
        ? data.winning_strategy.map((ws: { title?: string, description?: string }, idx: number) => 
            typeof ws === 'string' 
              ? { title: `Strategy ${idx + 1}`, description: ws }
              : { title: ws?.title || `Strategy ${idx + 1}`, description: ws?.description || '' }
          )
        : [];

      const result: DecodeResult = {
        ...data,
        winning_strategy: normalizedWinningStrategy
      };

      // ── STORE IN CACHE ──
      await setCachedDecode(jdText, result);

      // Success: Clear resume analysis cache to ensure fresh start for new JD
      clearResumeAnalysisCache();

      setResults(result);
      setWasCached(false);
      toast.success(`Total Intelligence Active: ${result.title}`, { duration: 4000 });
      
    } catch (err: unknown) {
      const error = err as Record<string, unknown>;
      console.error("── LUMINA ENGINE CRASH DETECTED ──");
      console.dir(err);
      
      let errorMessage = "AI Engine failed. Please try again.";
      let diagnosticDetails = "Check browser console (F12) for the full response stack trace.";
      
      // ── SUPABASE SDK ERROR EXTRACTION ──
      // Some versions of the SDK put the error in context, others in data
      try {
        if (err.context && typeof err.context.json === 'function') {
          const body = await err.context.json();
          if (body.error) errorMessage = body.error;
          if (body.details) diagnosticDetails = body.details;
        } else if (err.status && err.statusText) {
          // If it's a raw response error
          errorMessage = `Server Error (${err.status}): ${err.statusText}`;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } catch (parseErr) {
        console.warn("Failed to parse error body:", parseErr);
        if (err.message) errorMessage = err.message;
      }
      
      toast.error(`${err.status ? `Engine Error (${err.status})` : 'AI Engine Failed'}`, {
        description: diagnosticDetails,
        duration: 8000
      });
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
