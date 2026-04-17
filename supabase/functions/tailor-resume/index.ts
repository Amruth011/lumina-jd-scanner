import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, skills, jobTitle } = await req.json();
    if (!resumeText) throw new Error("Resume text is required");

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured in Supabase Secrets");

    const skillList = (skills as { skill: string }[] || []).map(s => s.skill).join(", ");
    const prompt = `
      You are an expert resume writer. Tailor this resume for the position of "${jobTitle || 'selected role'}".
      Focus on these keywords: ${skillList}

      Original Resume:
      ${resumeText}

      CRITICAL: Keep all text responses EXTREMELY concise (max 1 sentence per array item) to ensure fast processing.

      RETURN JSON FORMAT ONLY:
      {
        "professional_summary": "Optimized summary...",
        "experience": [
          {
            "company": "...",
            "role": "...",
            "bullets": ["Action bullet with quantified impact..."]
          }
        ],
        "skills_section": ["Categorized skills..."]
      }
    `;

    // Final Shield: True Resilience Fallback Loop
    const models = ['gemini-2.5-flash'];
    let lastError = "";

    for (const modelName of models) {
      try {
        console.log(`True Resilience: Attempting with ${modelName}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
        
        const apiResponse = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt + "\n\nIMPORTANT: Return ONLY raw JSON, do not include any other text." }] }],
          }),
        });

        if (apiResponse.ok) {
          const data = await apiResponse.json();
          const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!resultText) {
            console.warn(`True Resilience: Model ${modelName} returned empty text.`);
            continue;
          }

          // Smart Scraper: Find the first { and last } to bypass any AI chatter
          let resultJson;
          try {
            const firstBrace = resultText.indexOf('{');
            const lastBrace = resultText.lastIndexOf('}');
            if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON object found");
            const jsonText = resultText.substring(firstBrace, lastBrace + 1);
            resultJson = JSON.parse(jsonText);
          } catch (parseErr) {
            console.warn(`True Resilience: Parse error on ${modelName}:`, parseErr.message);
            continue;
          }

          return new Response(JSON.stringify(resultJson), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const errorData = await apiResponse.json().catch(() => ({}));
        lastError = errorData.error?.message || apiResponse.statusText;
        console.warn(`True Resilience: Model ${modelName} failed (Status: ${apiResponse.status}). Error: ${lastError}`);
        
        if (apiResponse.status >= 400 && apiResponse.status < 500 && apiResponse.status !== 429) break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Unknown error";
        console.error(`True Resilience: Exception on ${modelName}:`, lastError);
      }
    }

    throw new Error(`Critical AI Failure (Tailor): All models failed. Last Error: ${lastError}`);
  } catch (err) {
    console.error("tailor-resume error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
