import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NativeDeno = (globalThis as unknown as { Deno: { serve: (h: (r: Request) => Response | Promise<Response>) => void; env: { get: (k: string) => string | undefined } } }).Deno;

NativeDeno.serve(async (req) => {
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

    const groqKey = NativeDeno.env.get("GROQ_API_KEY");
    if (!groqKey) {
      throw new Error("Missing GROQ_API_KEY");
    }
    
    const fallbackModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"];
    let lastError = "";
    let resultData = null;

    for (const model of fallbackModels) {
      try {
        console.log(`Lumina Resume: Attempting with ${model}...`);
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: "You are an expert resume formatter. Return ONLY raw JSON." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0,
          }),
        });

        if (groqResponse.ok) {
          resultData = await groqResponse.json();
          break;
        }
        
        const errJson = await groqResponse.json();
        lastError = errJson.error?.message || groqResponse.statusText;
      } catch (err) {
        lastError = String(err);
      }
    }

    if (!resultData) throw new Error(`All engines exhausted: ${lastError}`);

    const resultText = resultData.choices?.[0]?.message?.content;
    if (!resultText) throw new Error("AI returned empty content");

    const firstBrace = resultText.indexOf('{');
    const lastBrace = resultText.lastIndexOf('}');
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
