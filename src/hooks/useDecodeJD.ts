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

      // ── DATA HYDRATION & OMNI-RESILIENCE REPAIR ──
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hydrate = (raw: Record<string, any>): DecodeResult => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const safeArr = (arr: any) => Array.isArray(arr) ? arr.filter(Boolean) : [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const safeStr = (v: any) => typeof v === 'object' && v !== null ? Object.values(v).filter(val => typeof val !== 'object').join(' ') : String(v || "");
        
        return {
           ...raw,
           title: safeStr(raw.title || raw.job_title) || "Intelligence Report",
           grade: {
             score: Number(raw.grade?.score || raw.score || raw.total_score) || 0,
             letter: String(raw.grade?.letter || raw.letter || "?"),
             summary: safeStr(raw.grade?.summary || raw.summary) || "Intelligence unavailable",
             breakdown: {
                clarity: Number(raw.grade?.breakdown?.clarity) || 0,
                realistic: Number(raw.grade?.breakdown?.realistic) || 0,
                compensation: Number(raw.grade?.breakdown?.compensation) || 0,
                red_flags: Number(raw.grade?.breakdown?.red_flags) || 0,
                benefits: Number(raw.grade?.breakdown?.benefits) || 0,
                growth: Number(raw.grade?.breakdown?.growth) || 0,
                inclusivity: Number(raw.grade?.breakdown?.inclusivity) || 0,
                readability: Number(raw.grade?.breakdown?.readability) || 0,
             },
             plain_english_summary: safeArr(raw.grade?.plain_english_summary || raw.plain_english_summary)
           },
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           skills: safeArr(raw.skills).map((s: any) => ({
             skill: safeStr(s?.skill || s),
             importance: Number(s?.importance) || 50,
             category: safeStr(s?.category || "Technical")
           })),
           red_flags: safeArr(raw.red_flags),
           recruiter_lens: safeArr(raw.recruiter_lens),
           requirements: {
             education: safeArr(raw.requirements?.education),
             experience: safeStr(raw.requirements?.experience),
             soft_skills: safeArr(raw.requirements?.soft_skills),
             agreements: safeArr(raw.requirements?.agreements)
           },
           logistics: {
              ...raw.logistics,
              salary_range: {
                min: Number(raw.logistics?.salary_range?.min) || 0,
                max: Number(raw.logistics?.salary_range?.max) || 0,
                currency: safeStr(raw.logistics?.salary_range?.currency || "INR"),
                estimate: raw.logistics?.salary_range?.estimate ?? true,
                note: safeStr(raw.logistics?.salary_range?.note)
              },
              work_arrangement: {
                remote_friendly: safeStr(raw.logistics?.work_arrangement?.remote_friendly) || "unspecified",
                office_presence: safeStr(raw.logistics?.work_arrangement?.office_presence) || "unspecified",
                flexible_hours: !!raw.logistics?.work_arrangement?.flexible_hours
              },
              responsibility_mix: safeArr(raw.logistics?.responsibility_mix),
              archetype: {
                label: safeStr(raw.logistics?.archetype?.label) || "Generalist",
                description: safeStr(raw.logistics?.archetype?.description),
                primary_focus: safeStr(raw.logistics?.archetype?.primary_focus),
                primary_tool: safeStr(raw.logistics?.archetype?.primary_tool),
                match_score: Number(raw.logistics?.archetype?.match_score) || 50
              }
           },
           deep_dive: {
             day_in_life: safeArr(raw.deep_dive?.day_in_life),
             health_radar: {
               market_position: Number(raw.deep_dive?.health_radar?.market_position) || 50,
               tech_innovation: Number(raw.deep_dive?.health_radar?.tech_innovation) || 50,
               transparency: Number(raw.deep_dive?.health_radar?.transparency) || 50,
               client_quality: Number(raw.deep_dive?.health_radar?.client_quality) || 50,
               employee_benefits: Number(raw.deep_dive?.health_radar?.employee_benefits) || 50
             },
             bias_analysis: {
               inclusivity_score: Number(raw.deep_dive?.bias_analysis?.inclusivity_score) || 50,
               gender_meter: safeStr(raw.deep_dive?.bias_analysis?.gender_meter) || "neutral",
               age_bias_graph: Number(raw.deep_dive?.bias_analysis?.age_bias_graph) || 50,
               tonal_map: safeArr(raw.deep_dive?.bias_analysis?.tonal_map)
             },
             culture_radar: {
               innovation: Number(raw.deep_dive?.culture_radar?.innovation) || 50,
               work_life_balance: Number(raw.deep_dive?.culture_radar?.work_life_balance) || 50,
               collaboration: Number(raw.deep_dive?.culture_radar?.collaboration) || 50,
               hierarchy: Number(raw.deep_dive?.culture_radar?.hierarchy) || 50,
               results_driven: Number(raw.deep_dive?.culture_radar?.results_driven) || 50,
               stability: Number(raw.deep_dive?.culture_radar?.stability) || 50
             }
           },
           bonus_pulse: {
             ghost_job_probability: Number(raw.bonus_pulse?.ghost_job_probability) || 0,
             desperation_meter: Number(raw.bonus_pulse?.desperation_meter) || 0,
             competition_estimate: Number(raw.bonus_pulse?.competition_estimate) || 0,
             skill_rarity: Number(raw.bonus_pulse?.skill_rarity) || 0,
             interview_difficulty: Number(raw.bonus_pulse?.interview_difficulty) || 0,
             career_growth: {
               trajectory: safeArr(raw.bonus_pulse?.career_growth?.trajectory),
               potential_score: Number(raw.bonus_pulse?.career_growth?.potential_score) || 50
             },
             tech_stack_popularity: safeArr(raw.bonus_pulse?.tech_stack_popularity)
           },
           interview_kit: {
             questions: safeArr(raw.interview_kit?.questions),
             reverse_questions: safeArr(raw.interview_kit?.reverse_questions)
           },
           resume_help: {
             keywords: safeArr(raw.resume_help?.keywords),
             bullets: safeArr(raw.resume_help?.bullets)
           },
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           winning_strategy: safeArr(raw.winning_strategy || raw.strategy).map((ws: any, idx: number) => 
                typeof ws === 'string' 
                  ? { title: `Strategy ${idx + 1}`, description: ws }
                  : { title: safeStr(ws?.title) || `Strategy ${idx + 1}`, description: safeStr(ws?.description) }
           )
        };
      };

      const result: DecodeResult = hydrate(data);

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
