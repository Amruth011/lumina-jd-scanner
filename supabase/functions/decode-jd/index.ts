import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface JDParsed {
  title: string;
  skills: Array<{ skill: string; importance: number }>;
  requirements: {
    education: string[];
    experience: string;
    soft_skills: string[];
    agreements: string[];
  };
  winning_strategy: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jdText } = await req.json();
    if (!jdText) throw new Error("JD text is required");

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured in Supabase Secrets");

    const prompt = `
      Extract key job details and technical skills from this description.
      Job Description:
      ${jdText}
      
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
        "winning_strategy": ["3 actionable tips to win this role"]
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

          const parsed: JDParsed = JSON.parse(resultText);
          return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const errorData = await apiResponse.json();
        lastError = errorData.error?.message || apiResponse.statusText;
        console.warn(`Model ${modelName} failed: ${lastError}`);
        
        // If it's not a 404, it's a real error (like invalid key), so don't bother retrying others
        if (apiResponse.status !== 404) break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Unknown error";
        console.error(`Retry loop error with ${modelName}:`, err);
      }
    }

    throw new Error(`AI Engine failed to find a working model. Last error: ${lastError}`);
  } catch (e) {
    console.error("decode-jd error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
