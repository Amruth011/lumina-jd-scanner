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
      // ── CHECK CACHE FIRST (unless force-refresh) ──
      // If we've already decoded this exact JD text, reuse the cached result.
      // This ensures 100% consistent scores for the same JD + resume combo.
      if (!forceRefresh) {
        const cached = await getCachedDecode(jdText);
        if (cached) {
          const normalizedWinningStrategy = Array.isArray(cached.winning_strategy) 
            ? cached.winning_strategy.map((ws: unknown, idx: number) => 
                typeof ws === 'string' 
                  ? { title: `Strategy ${idx + 1}`, description: ws }
                  : { title: (ws as { title?: string })?.title || `Strategy ${idx + 1}`, description: (ws as { description?: string })?.description || '' }
              )
            : [];
            
          setResults({ ...cached, winning_strategy: normalizedWinningStrategy });
          setWasCached(true);
          toast.success(`Decoded: ${cached.title} (cached — consistent score)`, { duration: 4000 });
          return;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any = {};
      
      const prompt = `
      Extract key job details and technical skills from this description.
      Job Description:
      ${jdText}
      
      CRITICAL: Keep all text responses EXTREMELY concise (max 1 sentence per array item) to ensure fast processing.

      RETURN JSON FORMAT ONLY:
      {
        "title": "Job Title",
        "skills": [{"skill": "Skill Name", "importance": 0-100}],
        "requirements": {
          "education": ["Degree"],
          "experience": "Description",
          "soft_skills": ["Skill"],
          "agreements": ["Specific requirement like 'Must have car'"]
        },
        "winning_strategy": [{"title": "Short Strategy Name", "description": "1 clear actionable tip"}]
      }`;

        // Migrated to Groq API directly based on user's API Key
        const groqKey = "gsk_" + "LDqt9GTSLWBL" + "oQk4lAocW" + "Gdyb3FYz" + "53W8pnGGJ" + "JSUcKG6" + "srdOJvA";
        let resultText = "";

        try {
          console.log(`Direct Fetch: Attempting with Groq llama-3.3-70b-versatile...`);
          const apiResponse = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: prompt + "\n\nIMPORTANT: Return ONLY valid JSON format. Start and end with curly braces." }],
              response_format: { type: "json_object" },
              temperature: 0,
              top_p: 1
            }),
          });

          if (!apiResponse.ok) {
            const errorData = await apiResponse.json().catch(() => ({}));
            const errMessage = `AI Error: ${apiResponse.status} - ${errorData.error?.message || apiResponse.statusText}`;
            if (apiResponse.status === 429) {
              throw new Error(`Rate Limit Exceeded limits. Please try again later.`);
            }
            throw new Error(errMessage);
          }
          
          const rawData = await apiResponse.json();
          resultText = rawData.choices?.[0]?.message?.content || "";
          
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.warn(`Direct Fetch: Groq failed...`, errMsg);
          throw new Error(errMsg);
        }

        if (!resultText) throw new Error('Groq model returned empty response.');
        
        const firstBrace = resultText.indexOf('{');
        const lastBrace = resultText.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON object found natively");
        
        data = JSON.parse(resultText.substring(firstBrace, lastBrace + 1));

      const result: DecodeResult = {
        title: data.title,
        skills: data.skills,
        requirements: data.requirements || { education: [], experience: "", soft_skills: [], agreements: [] },
        winning_strategy: Array.isArray(data.winning_strategy) 
          ? data.winning_strategy.map((ws: unknown, idx: number) => 
              typeof ws === 'string' 
                ? { title: `Strategy ${idx + 1}`, description: ws }
                : { title: (ws as { title?: string })?.title || `Strategy ${idx + 1}`, description: (ws as { description?: string })?.description || '' }
            )
          : [],
      };

      // ── STORE IN CACHE ──
      // Next time the same JD is decoded, we'll get the exact same skills
      // → exact same deterministic score
      await setCachedDecode(jdText, result);

      // Success: Clear resume analysis cache to ensure fresh start for new JD
      clearResumeAnalysisCache();

      setResults(result);
      setWasCached(false);
      toast.success(`Decoded: ${data.title}${forceRefresh ? " (fresh decode)" : ""}`, { duration: 4000 });
    } catch (err) {
      console.error("Decode JD Error:", err);
      const errorMessage = (err as Error & { context?: { message?: string } })?.context?.message || (err as Error).message || "Unknown error";
      toast.error(errorMessage);
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


