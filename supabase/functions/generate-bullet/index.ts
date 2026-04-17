import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { originalBullet, jdContext, focusKeywords } = await req.json();
    if (!originalBullet) throw new Error("Original bullet point is required");

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured in Supabase Secrets");

    const prompt = `
      You are an expert resume optimizer. Rewrite this resume bullet point to be more high-impact and ATS-friendly.
      Original: ${originalBullet}
      Context: ${jdContext || 'General role'}
      Focus Keywords: ${focusKeywords?.join(", ") || 'Action verbs, impact'}

      RETURN JSON FORMAT ONLY:
      {
        "bullet": "The optimized high-impact bullet point",
        "impact_score": 0-100,
        "changes_made": ["Brief explanation of what was improved"]
      }
    `;

    // Final Shield: True Resilience Fallback Loop
    const models = ['gemini-1.5-flash-8b', 'gemini-1.5-flash'];
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

    throw new Error(`Critical AI Failure (Bullet): All models failed. Last Error: ${lastError}`);
  } catch (err) {
    console.error("generate-bullet error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
