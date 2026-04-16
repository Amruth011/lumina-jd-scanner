import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jdSkills, resumeText } = await req.json();
    if (!jdSkills || !resumeText) throw new Error("JD skills and resume text are required");

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured in Supabase Secrets");

    const skillNames = (jdSkills as { skill: string }[]).map((s) => s.skill).join(", ");
    const prompt = `
      Compare this resume against the following required skills.
      Required Skills: ${skillNames}

      Resume:
      ${resumeText}

      RETURN JSON FORMAT ONLY:
      {
        "overall_score": 0-100,
        "skill_matches": [
          { "skill": "Skill Name", "match": true/false, "explanation": "..." }
        ],
        "missing_skills": ["Skill Name"],
        "resume_highlights": ["Key strengths found..."],
        "improvement_tips": ["Actionable changes..."]
      }
    `;

    // High-Reliability Fallback Loop
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let lastError = "";

    for (const modelName of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${geminiKey}`;
        const apiResponse = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        });

        if (apiResponse.ok) {
          const data = await apiResponse.json();
          const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!resultText) continue;

          const resultJson = JSON.parse(resultText);
          return new Response(JSON.stringify(resultJson), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const errorData = await apiResponse.json();
        lastError = errorData.error?.message || apiResponse.statusText;
        console.warn(`Model ${modelName} in compare-resume failed: ${lastError}`);
        if (apiResponse.status !== 404) break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Unknown error";
      }
    }

    throw new Error(`AI Engine (Compare) failed to find a working model. Last error: ${lastError}`);
  } catch (err) {
    console.error("compare-resume error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
