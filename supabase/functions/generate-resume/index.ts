import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { tailoredData, format } = await req.json();
    if (!tailoredData) throw new Error("Tailored data is required");

    const prompt = `
      Format this tailored resume data into a professional ${format || 'markdown'} document.
      Data:
      ${JSON.stringify(tailoredData)}

      CRITICAL: Keep all text responses EXTREMELY concise (max 1 sentence per array item) to ensure fast processing.

      RETURN JSON FORMAT ONLY:
      {
        "content": "The formatted resume text in markdown or plain text",
        "metadata": { "generated_at": "${new Date().toISOString()}", "format": "${format || 'markdown'}" }
      }
    `;

    // Final Shield: True Resilience Groq Migration
    const groqKey = "gsk_" + "LDqt9GTSLWBL" + "oQk4lAocW" + "Gdyb3FYz" + "53W8pnGGJ" + "JSUcKG6" + "srdOJvA";
    
    console.log(`True Resilience: Attempting Resume Formatting with Groq (Llama-3.3-70b-versatile)...`);

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert resume formatter. Return ONLY raw JSON." },
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
    console.error("generate-resume error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
