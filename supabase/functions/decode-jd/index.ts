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

    // Final Shield: True Resilience Fallback Loop
    const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    let lastError = "";
    
    for (const modelName of models) {
      try {
        console.log(`True Resilience: Attempting with ${modelName}...`);
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${geminiKey}`;
        
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
          let parsed: JDParsed;
          try {
            const firstBrace = resultText.indexOf('{');
            const lastBrace = resultText.lastIndexOf('}');
            if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON object found");
            const jsonText = resultText.substring(firstBrace, lastBrace + 1);
            parsed = JSON.parse(jsonText);
          } catch (parseErr) {
            console.warn(`True Resilience: Parse error on ${modelName}:`, parseErr.message);
            continue;
          }
          
          return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const errorData = await apiResponse.json().catch(() => ({}));
        lastError = errorData.error?.message || apiResponse.statusText;
        console.warn(`True Resilience: Model ${modelName} failed (Status: ${apiResponse.status}). Error: ${lastError}`);
        
        // If it's a 401/403 (Auth), stop immediately. Otherwise, try next model.
        if (apiResponse.status === 401 || apiResponse.status === 403) break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Unknown error";
        console.error(`True Resilience: Exception on ${modelName}:`, lastError);
      }
    }

    throw new Error(`Critical AI Failure (Decode): All models failed. Last Error: ${lastError}`);
  } catch (e) {
    console.error("decode-jd error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
