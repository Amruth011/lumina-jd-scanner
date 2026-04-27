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

    const skillNames = (jdSkills as { skill: string }[]).map((s) => s.skill).join(", ");
    const prompt = `
      Compare this resume against the following required skills.
      Required Skills: ${skillNames}

      Resume:
      ${resumeText}

      CRITICAL: Keep all text responses EXTREMELY concise (max 1 sentence per array item) to ensure fast processing.

      RETURN JSON FORMAT ONLY:
      {
        "overall_match": 0-100,
        "summary": "1-sentence executive verdict",
        "skill_matches": [
          { "skill": "Skill Name", "match_percent": 100, "verdict": "strong|missing" }
        ],
        "deductions": [
          { "reason": "Missing skill X", "percent": 5, "fix_snippet": "Add X to your professional history" }
        ],
        "actionable_directives": [
          { "action": "Optimize", "description": "Add metrics to your experience section." }
        ]
      }
    `;

    // Use the Groq Key from Environment Variables
    const groqKey = Deno.env.get("GROQ_API_KEY");
    if (!groqKey) {
      console.error("GROQ_API_KEY is not set in Supabase secrets.");
      throw new Error("Server configuration error: Missing API Key");
    }
    
    const fallbackModels = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "gemma2-9b-it"
    ];

    let resultJson = null;
    let lastError = "";

    for (const model of fallbackModels) {
      try {
        console.log(`True Resilience: Attempting Compare Scan with ${model}...`);
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: "You are an expert resume analyst specializing in high-fidelity gap analysis. Return ONLY raw JSON." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const resultText = data.choices?.[0]?.message?.content;
          if (resultText) {
            const firstBrace = resultText.indexOf('{');
            const lastBrace = resultText.lastIndexOf('}');
            resultJson = JSON.parse(resultText.substring(firstBrace, lastBrace + 1));
            break;
          }
        }

        const errText = await groqResponse.text();
        lastError = `Model ${model} failed: ${errText.substring(0, 100)}`;
        if (groqResponse.status === 429) {
            console.warn(`Rate limit hit for ${model}. Waiting 500ms...`);
            await new Promise(r => setTimeout(r, 500));
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.error(`Model ${model} crash:`, lastError);
      }
    }

    if (!resultJson) throw new Error(`All analysis engines exhausted: ${lastError}`);

    return new Response(JSON.stringify(resultJson), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("compare-resume error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
