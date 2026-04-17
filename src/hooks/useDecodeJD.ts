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
          const normalizedWinningStrategy = Array.isArray(cached.winning_strategy) 
            ? cached.winning_strategy.map((ws: any, idx: number) => 
                typeof ws === 'string' 
                  ? { title: `Strategy ${idx + 1}`, description: ws }
                  : { title: ws?.title || `Strategy ${idx + 1}`, description: ws?.description || '' }
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
      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke("decode-jd", {
          body: { jdText },
        });

        if (edgeError) throw edgeError;
        if (edgeData?.error) throw new Error(edgeData.error);
        data = edgeData;
      } catch (err) {
        console.warn("Edge function timed out or failed, falling back to direct client-side fetch...", err);

        // Fetch Key securely
        const { data: keyData, error: keyError } = await supabase.functions.invoke("decode-jd", {
            body: { jdText: "bypass", action: "get_key" }
        });
        
        if (keyError) throw new Error("Backend proxy entirely unavailable");
        const geminiKey = keyData?.key;
        if (!geminiKey) throw new Error("Could not retrieve API key for direct fallback.");

        const prompt = `Extract key job details and technical skills from this description.
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

        // Direct Fetch Bypassing Supabase Edge Limits with Dual-Path Multi-Model Fallback
        const apiVersions = ["v1beta", "v1"];
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
        let lastAiError = "";
        let resultText = "";

        for (const version of apiVersions) {
          if (resultText) break;
          for (const modelName of models) {
            try {
              console.log(`Direct Fetch: Attempting with ${version}/${modelName}...`);
              const apiResponse = await fetch(`https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${geminiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt + "\n\nIMPORTANT: Return ONLY raw JSON, do not include any other text." }] }],
                }),
              });

              if (!apiResponse.ok) {
                const errorData = await apiResponse.json().catch(() => ({}));
                throw new Error(`AI Error: ${apiResponse.status} - ${errorData.error?.message || apiResponse.statusText}`);
              }
              
              const rawData = await apiResponse.json();
              resultText = rawData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (resultText) {
                console.log(`Direct Fetch: Success with ${version}/${modelName}`);
                break;
              }
            } catch (err) {
              lastAiError = err instanceof Error ? err.message : String(err);
              console.warn(`Direct Fetch: ${version}/${modelName} failed, trying next...`, lastAiError);
              // If it's not a 404, we might want to retry. But 404 is the main trigger for next.
            }
          }
        }

        if (!resultText) throw new Error(`All AI models failed. Last error: ${lastAiError}`);
        
        const firstBrace = resultText.indexOf('{');
        const lastBrace = resultText.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON object found natively");
        
        data = JSON.parse(resultText.substring(firstBrace, lastBrace + 1));
      }

      const result: DecodeResult = {
        title: data.title,
        skills: data.skills,
        requirements: data.requirements || { education: [], experience: "", soft_skills: [], agreements: [] },
        winning_strategy: Array.isArray(data.winning_strategy) 
          ? data.winning_strategy.map((ws: any, idx: number) => 
              typeof ws === 'string' 
                ? { title: `Strategy ${idx + 1}`, description: ws }
                : { title: ws?.title || `Strategy ${idx + 1}`, description: ws?.description || '' }
            )
          : [],
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


