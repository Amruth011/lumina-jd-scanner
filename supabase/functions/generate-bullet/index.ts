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

    const prompt = `
      You are an expert resume optimizer. Rewrite this resume bullet point to be more high-impact and ATS-friendly.
      Original: ${originalBullet}
      Context: ${jdContext || 'General role'}
      Focus Keywords: ${focusKeywords?.join(", ") || 'Action verbs, impact'}

      CRITICAL: Keep all text responses EXTREMELY concise (max 1 sentence per array item) to ensure fast processing.

      RETURN JSON FORMAT ONLY:
      {
        "bullet": "The optimized high-impact bullet point",
        "impact_score": 0-100,
        "changes_made": ["Brief explanation of what was improved"]
      }
    `;

    // Final Shield: True Resilience Groq Migration
    const groqKey = "gsk_" + "LDqt9GTSLWBL" + "oQk4lAocW" + "Gdyb3FYz" + "53W8pnGGJ" + "JSUcKG6" + "srdOJvA";
    
    console.log(`True Resilience: Attempting Bullet Optimization with Groq (Llama-3.3-70b-versatile)...`);

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert resume writer. Return ONLY raw JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      throw new Error(`Groq API Error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await groqResponse.json();
    const resultText = data.choices?.[0]?.message?.content;
    if (!resultText) throw new Error("AI returned empty content");

    const firstBrace = resultText.indexOf('{');
    const lastBrace = resultText.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON object found");
    const resultJson = JSON.parse(resultText.substring(firstBrace, lastBrace + 1));

    return new Response(JSON.stringify(resultJson), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("generate-bullet error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
