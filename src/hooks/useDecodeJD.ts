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

      // ── DATA HYDRATION & REPAIR ──
      // This ensures that even if the AI misses a field, the UI never crashes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hydrate = (raw: Record<string, any>): DecodeResult => {
        return {
           ...raw,
           title: raw.title || "Intelligence Report",
           grade: {
             score: raw.grade?.score ?? 0,
             letter: raw.grade?.letter ?? "?",
             summary: raw.grade?.summary || "Intelligence unavailable",
             breakdown: {
                clarity: raw.grade?.breakdown?.clarity ?? 0,
                realistic: raw.grade?.breakdown?.realistic ?? 0,
                compensation: raw.grade?.breakdown?.compensation ?? 0,
                red_flags: raw.grade?.breakdown?.red_flags ?? 0,
                benefits: raw.grade?.breakdown?.benefits ?? 0,
                growth: raw.grade?.breakdown?.growth ?? 0,
                inclusivity: raw.grade?.breakdown?.inclusivity ?? 0,
                readability: raw.grade?.breakdown?.readability ?? 0,
             },
             plain_english_summary: Array.isArray(raw.grade?.plain_english_summary) ? raw.grade.plain_english_summary : []
           },
           skills: Array.isArray(raw.skills) ? raw.skills : [],
           red_flags: Array.isArray(raw.red_flags) ? raw.red_flags : [],
           recruiter_lens: Array.isArray(raw.recruiter_lens) ? raw.recruiter_lens : [],
           requirements: {
             education: Array.isArray(raw.requirements?.education) ? raw.requirements.education : [],
             experience: raw.requirements?.experience ?? "Not specified",
             soft_skills: Array.isArray(raw.requirements?.soft_skills) ? raw.requirements.soft_skills : [],
             agreements: Array.isArray(raw.requirements?.agreements) ? raw.requirements.agreements : []
           },
           logistics: {
              ...raw.logistics,
              salary_range: {
                min: raw.logistics?.salary_range?.min ?? 0,
                max: raw.logistics?.salary_range?.max ?? 0,
                currency: raw.logistics?.salary_range?.currency || "INR",
                estimate: raw.logistics?.salary_range?.estimate ?? true,
                note: raw.logistics?.salary_range?.note || ""
              },
              work_arrangement: {
                remote_friendly: raw.logistics?.work_arrangement?.remote_friendly || "unspecified",
                office_presence: raw.logistics?.work_arrangement?.office_presence || "unspecified",
                flexible_hours: !!raw.logistics?.work_arrangement?.flexible_hours
              },
              responsibility_mix: Array.isArray(raw.logistics?.responsibility_mix) ? raw.logistics.responsibility_mix : [],
              archetype: {
                label: raw.logistics?.archetype?.label || "Generalist",
                description: raw.logistics?.archetype?.description || "",
                primary_focus: raw.logistics?.archetype?.primary_focus || "",
                primary_tool: raw.logistics?.archetype?.primary_tool || "",
                match_score: raw.logistics?.archetype?.match_score ?? 50
              }
           },
           deep_dive: {
             day_in_life: Array.isArray(raw.deep_dive?.day_in_life) ? raw.deep_dive.day_in_life : [],
             health_radar: {
               market_position: raw.deep_dive?.health_radar?.market_position ?? 50,
               tech_innovation: raw.deep_dive?.health_radar?.tech_innovation ?? 50,
               transparency: raw.deep_dive?.health_radar?.transparency ?? 50,
               client_quality: raw.deep_dive?.health_radar?.client_quality ?? 50,
               employee_benefits: raw.deep_dive?.health_radar?.employee_benefits ?? 50
             },
             bias_analysis: {
               inclusivity_score: raw.deep_dive?.bias_analysis?.inclusivity_score ?? 50,
               gender_meter: raw.deep_dive?.bias_analysis?.gender_meter || "neutral",
               age_bias_graph: raw.deep_dive?.bias_analysis?.age_bias_graph ?? 50,
               tonal_map: Array.isArray(raw.deep_dive?.bias_analysis?.tonal_map) ? raw.deep_dive.bias_analysis.tonal_map : []
             },
             culture_radar: {
               innovation: raw.deep_dive?.culture_radar?.innovation ?? 50,
               work_life_balance: raw.deep_dive?.culture_radar?.work_life_balance ?? 50,
               collaboration: raw.deep_dive?.culture_radar?.collaboration ?? 50,
               hierarchy: raw.deep_dive?.culture_radar?.hierarchy ?? 50,
               results_driven: raw.deep_dive?.culture_radar?.results_driven ?? 50,
               stability: raw.deep_dive?.culture_radar?.stability ?? 50
             }
           },
           bonus_pulse: {
             ghost_job_probability: raw.bonus_pulse?.ghost_job_probability ?? 0,
             desperation_meter: raw.bonus_pulse?.desperation_meter ?? 0,
             competition_estimate: raw.bonus_pulse?.competition_estimate ?? 0,
             skill_rarity: raw.bonus_pulse?.skill_rarity ?? 0,
             interview_difficulty: raw.bonus_pulse?.interview_difficulty ?? 0,
             career_growth: {
               trajectory: Array.isArray(raw.bonus_pulse?.career_growth?.trajectory) ? raw.bonus_pulse.career_growth.trajectory : [],
               potential_score: raw.bonus_pulse?.career_growth?.potential_score ?? 50
             },
             tech_stack_popularity: Array.isArray(raw.bonus_pulse?.tech_stack_popularity) ? raw.bonus_pulse.tech_stack_popularity : []
           },
           interview_kit: {
             questions: Array.isArray(raw.interview_kit?.questions) ? raw.interview_kit.questions : [],
             reverse_questions: Array.isArray(raw.interview_kit?.reverse_questions) ? raw.interview_kit.reverse_questions : []
           },
           resume_help: {
             keywords: Array.isArray(raw.resume_help?.keywords) ? raw.resume_help.keywords : [],
             bullets: Array.isArray(raw.resume_help?.bullets) ? raw.resume_help.bullets : []
           },
           winning_strategy: Array.isArray(data.winning_strategy) 
            ? data.winning_strategy.map((ws: { title?: string, description?: string }, idx: number) => 
                typeof ws === 'string' 
                  ? { title: `Strategy ${idx + 1}`, description: ws }
                  : { title: ws?.title || `Strategy ${idx + 1}`, description: ws?.description || '' }
              )
            : []
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
