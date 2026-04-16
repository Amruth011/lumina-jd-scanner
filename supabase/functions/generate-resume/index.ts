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

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured in Supabase Secrets");

    const prompt = `
      Format this tailored resume data into a professional ${format || 'markdown'} document.
      Data:
      ${JSON.stringify(tailoredData)}

      RETURN JSON FORMAT ONLY:
      {
        "content": "The formatted resume text in markdown or plain text",
        "metadata": { "generated_at": "...", "format": "..." }
      }
    `;

    // Bulletproof Fallback Loop
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let lastError = "";

    for (const modelName of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
        
        const generationConfig: { responseMimeType?: string } = {};
        if (modelName.includes("1.5")) {
          generationConfig.responseMimeType = "application/json";
        }

        const apiResponse = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig,
          }),
        });

        if (apiResponse.ok) {
          const data = await apiResponse.json();
          const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!resultText) continue;

          const cleanJson = resultText.replace(/```json\n?|\n?```/g, "").trim();
          const resultJson = JSON.parse(cleanJson);
          return new Response(JSON.stringify(resultJson), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const errorData = await apiResponse.json();
        lastError = errorData.error?.message || apiResponse.statusText;
        if (apiResponse.status !== 404 && !lastError.includes("not found")) break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Unknown error";
      }
    }

    throw new Error(`AI Engine (Generate) failed. Last error: ${lastError}`);
  } catch (err) {
    console.error("generate-resume error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
