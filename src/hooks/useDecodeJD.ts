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

      // ── DATA HYDRATION & PRECISION MAPPING ──
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hydrate = (raw: Record<string, any>): DecodeResult => {
        // Robust case-insensitive and synonym-aware key finder
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const find = (obj: any, target: string): any => {
          if (!obj || typeof obj !== 'object') return undefined;
          const targetLower = target.toLowerCase();
          const keys = Object.keys(obj);
          
          if (target in obj) return obj[target];
          const foundKey = keys.find(k => k.toLowerCase() === targetLower);
          if (foundKey) return obj[foundKey];
          
          if (targetLower === 'score') {
              const alt = keys.find(k => k.toLowerCase().includes('score') || k.toLowerCase().includes('result'));
              if (alt) return obj[alt];
          }
          return undefined;
        };

        // Precision numeric extractor (strips %, $, , and text)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const safeNum = (v: any, fallback = 0): number => {
          if (typeof v === 'number') return v;
          if (typeof v !== 'string') return v ? Number(v) || fallback : fallback;
          const match = v.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
          return match ? parseFloat(match[0]) : (Number(v) || fallback);
        };

        // Deep-flattening string shield
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const safeStrItem = (v: any): string => {
          if (v === null || v === undefined) return "";
          if (typeof v === 'object') {
            return Object.values(v)
              .map(val => (typeof val === 'object' ? safeStrItem(val) : String(val)))
              .filter(val => val.trim() !== "")
              .join(" ");
          }
          return String(v);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const safeArr = (arr: any) => Array.isArray(arr) ? arr.filter(Boolean) : [];
        
        const rawGrade = find(raw, 'grade') || {};
        const rawReq = find(raw, 'requirements') || {};
        const rawLog = find(raw, 'logistics') || {};

        return {
           ...raw,
           title: safeStrItem(find(raw, 'title') || find(raw, 'job_title')) || "Intelligence Report",
           grade: {
             score: safeNum(find(rawGrade, 'score') || find(raw, 'score') || find(raw, 'total_score')),
             letter: String(find(rawGrade, 'letter') || find(raw, 'letter') || "?"),
             summary: safeStrItem(find(rawGrade, 'summary') || find(raw, 'summary')) || "Intelligence unavailable",
             breakdown: {
                clarity: safeNum(find(rawGrade.breakdown, 'clarity')),
                realistic: safeNum(find(rawGrade.breakdown, 'realistic')),
                compensation: safeNum(find(rawGrade.breakdown, 'compensation')),
                red_flags: safeNum(find(rawGrade.breakdown, 'red_flags')),
                benefits: safeNum(find(rawGrade.breakdown, 'benefits')),
                growth: safeNum(find(rawGrade.breakdown, 'growth')),
                inclusivity: safeNum(find(rawGrade.breakdown, 'inclusivity')),
                readability: safeNum(find(rawGrade.breakdown, 'readability')),
             },
             plain_english_summary: safeArr(find(rawGrade, 'plain_english_summary') || find(raw, 'plain_english_summary')).map(i => safeStrItem(i))
           },
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           skills: (safeArr(find(raw, 'skills')) || []).map((s: any) => ({
             skill: safeStrItem(s?.skill || s),
             importance: safeNum(s?.importance, 50),
             category: safeStrItem(s?.category || "Technical")
           })),
           red_flags: safeArr(find(raw, 'red_flags')).map(i => safeStrItem(i)),
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           recruiter_lens: safeArr(find(raw, 'recruiter_lens')).map((i: any) => ({
              jargon: safeStrItem(i?.jargon || i),
              reality: safeStrItem(i?.reality || "")
           })),
           requirements: {
             education: safeArr(find(rawReq, 'education')).map(e => safeStrItem(e)),
             experience: safeStrItem(find(rawReq, 'experience')),
             soft_skills: safeArr(find(rawReq, 'soft_skills')).map(s => safeStrItem(s)),
             agreements: safeArr(find(rawReq, 'agreements')).map(a => safeStrItem(a))
           },
           logistics: {
              ...rawLog,
              salary_range: {
                min: safeNum(find(rawLog.salary_range, 'min')),
                max: safeNum(find(rawLog.salary_range, 'max')),
                currency: safeStrItem(find(rawLog.salary_range, 'currency') || "INR"),
                estimate: rawLog.salary_range?.estimate ?? true,
                note: safeStrItem(find(rawLog.salary_range, 'note'))
              },
              work_arrangement: {
                remote_friendly: safeStrItem(find(rawLog.work_arrangement, 'remote_friendly')) || "unspecified",
                office_presence: safeStrItem(find(rawLog.work_arrangement, 'office_presence')) || "unspecified",
                flexible_hours: !!find(rawLog.work_arrangement, 'flexible_hours')
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              responsibility_mix: safeArr(find(rawLog, 'responsibility_mix')).map((rm: any) => ({
                label: safeStrItem(rm?.label || rm),
                percent: safeNum(rm?.percent, 50)
              })),
              archetype: {
                label: safeStrItem(find(rawLog.archetype, 'label')) || "Generalist",
                description: safeStrItem(find(rawLog.archetype, 'description')),
                primary_focus: safeStrItem(find(rawLog.archetype, 'primary_focus')),
                primary_tool: safeStrItem(find(rawLog.archetype, 'primary_tool')),
                match_score: safeNum(find(rawLog.archetype, 'match_score'), 50)
              }
           },
           deep_dive: {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             day_in_life: safeArr(find(raw.deep_dive, 'day_in_life')).map((dil: any) => ({
                time: safeStrItem(dil?.time),
                task: safeStrItem(dil?.task || dil),
                description: safeStrItem(dil?.description)
             })),
             health_radar: {
               market_position: safeNum(find(raw.deep_dive?.health_radar, 'market_position'), 50),
               tech_innovation: safeNum(find(raw.deep_dive?.health_radar, 'tech_innovation'), 50),
               transparency: safeNum(find(raw.deep_dive?.health_radar, 'transparency'), 50),
               client_quality: safeNum(find(raw.deep_dive?.health_radar, 'client_quality'), 50),
               employee_benefits: safeNum(find(raw.deep_dive?.health_radar, 'employee_benefits'), 50)
             },
             bias_analysis: {
               inclusivity_score: safeNum(find(raw.deep_dive?.bias_analysis, 'inclusivity_score'), 50),
               gender_meter: safeStrItem(find(raw.deep_dive?.bias_analysis, 'gender_meter')) || "neutral",
               age_bias_graph: safeNum(find(raw.deep_dive?.bias_analysis, 'age_bias_graph'), 50),
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               tonal_map: safeArr(find(raw.deep_dive?.bias_analysis, 'tonal_map')).map((tm: any) => ({
                  category: safeStrItem(tm?.category || tm),
                  tone: safeStrItem(tm?.tone)
               }))
             },
             culture_radar: {
               innovation: safeNum(find(raw.deep_dive?.culture_radar, 'innovation'), 50),
               work_life_balance: safeNum(find(raw.deep_dive?.culture_radar, 'work_life_balance'), 50),
               collaboration: safeNum(find(raw.deep_dive?.culture_radar, 'collaboration'), 50),
               hierarchy: safeNum(find(raw.deep_dive?.culture_radar, 'hierarchy'), 50),
               results_driven: safeNum(find(raw.deep_dive?.culture_radar, 'results_driven'), 50),
               stability: safeNum(find(raw.deep_dive?.culture_radar, 'stability'), 50)
             }
           },
           bonus_pulse: {
             ghost_job_probability: safeNum(find(raw.bonus_pulse, 'ghost_job_probability')),
             desperation_meter: safeNum(find(raw.bonus_pulse, 'desperation_meter')),
             competition_estimate: safeNum(find(raw.bonus_pulse, 'competition_estimate')),
             skill_rarity: safeNum(find(raw.bonus_pulse, 'skill_rarity')),
             interview_difficulty: safeNum(find(raw.bonus_pulse, 'interview_difficulty')),
             career_growth: {
               trajectory: safeArr(find(raw.bonus_pulse?.career_growth, 'trajectory')).map(i => safeStrItem(i)),
               potential_score: safeNum(find(raw.bonus_pulse?.career_growth, 'potential_score'), 50)
             },
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             tech_stack_popularity: safeArr(find(raw.bonus_pulse, 'tech_stack_popularity')).map((ts: any) => ({
                name: safeStrItem(ts?.name || ts),
                demand: safeStrItem(ts?.demand || "Standard")
             }))
           },
           interview_kit: {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             questions: safeArr(find(raw.interview_kit, 'questions')).map((q: any) => ({
                question: safeStrItem(q?.question || q),
                type: safeStrItem(q?.type || "technical"),
                tip: safeStrItem(q?.tip),
                target_answer: safeStrItem(q?.target_answer)
             })),
             reverse_questions: safeArr(find(raw.interview_kit, 'reverse_questions')).map(i => safeStrItem(i))
           },
           resume_help: {
             keywords: safeArr(find(raw.resume_help, 'keywords')).map(i => safeStrItem(i)),
             bullets: safeArr(find(raw.resume_help, 'bullets')).map(i => safeStrItem(i))
           },
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           winning_strategy: safeArr(find(raw, 'winning_strategy') || find(raw, 'strategy')).map((ws: any, idx: number) => 
                typeof ws === 'string' 
                  ? { title: `Strategy ${idx + 1}`, description: ws }
                  : { title: safeStrItem(ws?.title) || `Strategy ${idx + 1}`, description: safeStrItem(ws?.description) }
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      console.error("── LUMINA ENGINE CRASH DETECTED ──");
      console.dir(err);
      
      let errorMessage = "AI Engine failed. Please try again.";
      let diagnosticDetails = "Check browser console (F12) for the full response stack trace.";
      
      try {
        if (error.context && typeof error.context.json === 'function') {
          const body = await error.context.json();
          if (body.error) errorMessage = body.error;
          if (body.details) diagnosticDetails = body.details;
        } else if (error.status && error.statusText) {
          errorMessage = `Server Error (${error.status}): ${error.statusText}`;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } catch (parseErr) {
        console.warn("Failed to parse error body:", parseErr);
        if (error.message) errorMessage = error.message;
      }
      
      toast.error(`${error.status ? `Engine Error (${error.status})` : 'AI Engine Failed'}`, {
        description: diagnosticDetails || errorMessage,
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
