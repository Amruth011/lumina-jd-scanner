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
    const body = await req.json(); const { jdText, action } = body;
    if (!jdText) throw new Error("JD text is required");

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (action === "get_key") {
      return new Response(JSON.stringify({ key: geminiKey }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured in Supabase Secrets");

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
        "winning_strategy": ["3 actionable tips to win this role"]
      }
    `;

    // Final Shield: True Resilience Fallback Loop
    const models = ['gemini-2.5-flash'];
    const errors = [];
    
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
            errors.push(`${modelName}: returned empty text`);
            continue;
          }

          // Smart Scraper: Find the first { and last } to bypass any AI chatter
          let parsed;
          try {
            const firstBrace = resultText.indexOf('{');
            const lastBrace = resultText.lastIndexOf('}');
            if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON object found");
            const jsonText = resultText.substring(firstBrace, lastBrace + 1);
            parsed = JSON.parse(jsonText);
          } catch (parseErr) {
            errors.push(`${modelName}: Parse error - ${parseErr.message}`);
            continue;
          }
          
          return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const errorData = await apiResponse.json().catch(() => ({}));
        const lastError = errorData.error?.message || apiResponse.statusText;
        errors.push(`${modelName}: Status ${apiResponse.status} - ${lastError}`);
        
        // If it's a 401/403 (Auth), stop immediately. Otherwise, try next model.
        if (apiResponse.status >= 400 && apiResponse.status < 500 && apiResponse.status !== 429) break;
      } catch (err) {
        errors.push(`${modelName}: Exception - ${err instanceof Error ? err.message : "Unknown"}`);
      }
    }

    throw new Error(`Critical AI Failure (Decode): ` + JSON.stringify(errors));
  } catch (e) {
    console.error("decode-jd error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
