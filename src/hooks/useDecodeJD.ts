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

      // ── DATA HYDRATION & CASE-AGNOSTIC MAPPING ──
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hydrate = (raw: Record<string, any>): DecodeResult => {
        // Robust case-insensitive and synonym-aware key finder
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const find = (obj: any, target: string): any => {
          if (!obj || typeof obj !== 'object') return undefined;
          const targetLower = target.toLowerCase();
          const keys = Object.keys(obj);
          
          // 1. Direct match
          if (target in obj) return obj[target];
          
          // 2. Case-insensitive match
          const foundKey = keys.find(k => k.toLowerCase() === targetLower);
          if (foundKey) return obj[foundKey];
          
          // 3. Synonym match (handle common AI drift)
          if (targetLower === 'score') {
              const alt = keys.find(k => k.toLowerCase().includes('score') || k.toLowerCase().includes('result'));
              if (alt) return obj[alt];
          }
          return undefined;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const safeArr = (arr: any) => Array.isArray(arr) ? arr.filter(Boolean) : [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const safeStr = (v: any) => typeof v === 'object' && v !== null ? Object.values(v).filter(val => typeof val !== 'object').join(' ') : String(v || "");
        
        const rawGrade = find(raw, 'grade') || {};
        const rawReq = find(raw, 'requirements') || {};
        const rawLog = find(raw, 'logistics') || {};

        return {
           ...raw,
           title: safeStr(find(raw, 'title') || find(raw, 'job_title')) || "Intelligence Report",
           grade: {
             score: Number(find(rawGrade, 'score') || find(raw, 'score') || find(raw, 'total_score')) || 0,
             letter: String(find(rawGrade, 'letter') || find(raw, 'letter') || "?"),
             summary: safeStr(find(rawGrade, 'summary') || find(raw, 'summary')) || "Intelligence unavailable",
             breakdown: {
                clarity: Number(find(rawGrade.breakdown, 'clarity')) || 0,
                realistic: Number(find(rawGrade.breakdown, 'realistic')) || 0,
                compensation: Number(find(rawGrade.breakdown, 'compensation')) || 0,
                red_flags: Number(find(rawGrade.breakdown, 'red_flags')) || 0,
                benefits: Number(find(rawGrade.breakdown, 'benefits')) || 0,
                growth: Number(find(rawGrade.breakdown, 'growth')) || 0,
                inclusivity: Number(find(rawGrade.breakdown, 'inclusivity')) || 0,
                readability: Number(find(rawGrade.breakdown, 'readability')) || 0,
             },
             plain_english_summary: safeArr(find(rawGrade, 'plain_english_summary') || find(raw, 'plain_english_summary'))
           },
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           skills: (safeArr(find(raw, 'skills')) || []).map((s: any) => ({
             skill: safeStr(s?.skill || s),
             importance: Number(s?.importance) || 50,
             category: safeStr(s?.category || "Technical")
           })),
           red_flags: safeArr(find(raw, 'red_flags')),
           recruiter_lens: safeArr(find(raw, 'recruiter_lens')),
           requirements: {
             education: safeArr(find(rawReq, 'education')).map(e => safeStr(e)),
             experience: safeStr(find(rawReq, 'experience')),
             soft_skills: safeArr(find(rawReq, 'soft_skills')).map(s => safeStr(s)),
             agreements: safeArr(find(rawReq, 'agreements')).map(a => safeStr(a))
           },
           logistics: {
              ...rawLog,
              salary_range: {
                min: Number(find(rawLog.salary_range, 'min')) || 0,
                max: Number(find(rawLog.salary_range, 'max')) || 0,
                currency: safeStr(find(rawLog.salary_range, 'currency') || "INR"),
                estimate: rawLog.salary_range?.estimate ?? true,
                note: safeStr(find(rawLog.salary_range, 'note'))
              },
              work_arrangement: {
                remote_friendly: safeStr(find(rawLog.work_arrangement, 'remote_friendly')) || "unspecified",
                office_presence: safeStr(find(rawLog.work_arrangement, 'office_presence')) || "unspecified",
                flexible_hours: !!find(rawLog.work_arrangement, 'flexible_hours')
              },
              responsibility_mix: safeArr(find(rawLog, 'responsibility_mix')),
              archetype: {
                label: safeStr(find(rawLog.archetype, 'label')) || "Generalist",
                description: safeStr(find(rawLog.archetype, 'description')),
                primary_focus: safeStr(find(rawLog.archetype, 'primary_focus')),
                primary_tool: safeStr(find(rawLog.archetype, 'primary_tool')),
                match_score: Number(find(rawLog.archetype, 'match_score')) || 50
              }
           },
           deep_dive: {
             day_in_life: safeArr(find(raw.deep_dive, 'day_in_life')),
             health_radar: {
               market_position: Number(find(raw.deep_dive?.health_radar, 'market_position')) || 50,
               tech_innovation: Number(find(raw.deep_dive?.health_radar, 'tech_innovation')) || 50,
               transparency: Number(find(raw.deep_dive?.health_radar, 'transparency')) || 50,
               client_quality: Number(find(raw.deep_dive?.health_radar, 'client_quality')) || 50,
               employee_benefits: Number(find(raw.deep_dive?.health_radar, 'employee_benefits')) || 50
             },
             bias_analysis: {
               inclusivity_score: Number(find(raw.deep_dive?.bias_analysis, 'inclusivity_score')) || 50,
               gender_meter: safeStr(find(raw.deep_dive?.bias_analysis, 'gender_meter')) || "neutral",
               age_bias_graph: Number(find(raw.deep_dive?.bias_analysis, 'age_bias_graph')) || 50,
               tonal_map: safeArr(find(raw.deep_dive?.bias_analysis, 'tonal_map'))
             },
             culture_radar: {
               innovation: Number(find(raw.deep_dive?.culture_radar, 'innovation')) || 50,
               work_life_balance: Number(find(raw.deep_dive?.culture_radar, 'work_life_balance')) || 50,
               collaboration: Number(find(raw.deep_dive?.culture_radar, 'collaboration')) || 50,
               hierarchy: Number(find(raw.deep_dive?.culture_radar, 'hierarchy')) || 50,
               results_driven: Number(find(raw.deep_dive?.culture_radar, 'results_driven')) || 50,
               stability: Number(find(raw.deep_dive?.culture_radar, 'stability')) || 50
             }
           },
           bonus_pulse: {
             ghost_job_probability: Number(find(raw.bonus_pulse, 'ghost_job_probability')) || 0,
             desperation_meter: Number(find(raw.bonus_pulse, 'desperation_meter')) || 0,
             competition_estimate: Number(find(raw.bonus_pulse, 'competition_estimate')) || 0,
             skill_rarity: Number(find(raw.bonus_pulse, 'skill_rarity')) || 0,
             interview_difficulty: Number(find(raw.bonus_pulse, 'interview_difficulty')) || 0,
             career_growth: {
               trajectory: safeArr(find(raw.bonus_pulse?.career_growth, 'trajectory')),
               potential_score: Number(find(raw.bonus_pulse?.career_growth, 'potential_score')) || 50
             },
             tech_stack_popularity: safeArr(find(raw.bonus_pulse, 'tech_stack_popularity'))
           },
           interview_kit: {
             questions: safeArr(find(raw.interview_kit, 'questions')),
             reverse_questions: safeArr(find(raw.interview_kit, 'reverse_questions'))
           },
           resume_help: {
             keywords: safeArr(find(raw.resume_help, 'keywords')),
             bullets: safeArr(find(raw.resume_help, 'bullets'))
           },
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           winning_strategy: safeArr(find(raw, 'winning_strategy') || find(raw, 'strategy')).map((ws: any, idx: number) => 
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
