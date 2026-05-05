import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { model: requestedModel, messages, temperature, response_format } = await req.json();

    const groqKey = Deno.env.get("GROQ_API_KEY")?.trim();
    if (!groqKey) {
      console.error("Lumina Analyze: GROQ_API_KEY is missing from Deno.env");
      return new Response(JSON.stringify({ error: "Lumina Auth Error: Missing GROQ_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fallbackModels = [
      requestedModel || "llama-3.3-70b-versatile",
      "gemma2-27b-it",
      "llama-3.1-8b-instant",
      "gemma2-9b-it"
    ].filter((v, i, a) => a.indexOf(v) === i);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    let lastError = "";
    let resultData = null;

    for (const model of fallbackModels) {
      try {
        console.log(`Lumina Analyze: Attempting with ${model}...`);
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: model,
            messages,
            temperature: temperature ?? 0.3,
            response_format,
          }),
        });

        if (groqResponse.ok) {
          resultData = await groqResponse.json();
          break;
        }

        const errorData = await groqResponse.json();
        lastError = errorData.error?.message || groqResponse.statusText;
        console.warn(`Lumina Analyze: Model ${model} failed: ${lastError}`);

        if (groqResponse.status === 429) {
          console.log("Lumina Analyze: Rate limit hit. Waiting 1000ms...");
          await sleep(1000);
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!resultData) {
      return new Response(JSON.stringify({ error: `All AI engines exhausted: ${lastError}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(resultData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Lumina Analyze: Fatal error:", error);
    return new Response(JSON.stringify({ error: "Internal server error", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
