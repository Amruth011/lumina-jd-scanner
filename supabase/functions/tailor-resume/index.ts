import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, skills, jobTitle } = await req.json();
    if (!resumeText) throw new Error("Resume text is required");

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured in Supabase Secrets");

    const skillList = (skills as { skill: string }[] || []).map(s => s.skill).join(", ");
    const prompt = `
      You are an expert resume writer. Tailor this resume for the position of "${jobTitle || 'selected role'}".
      Focus on these keywords: ${skillList}

      Original Resume:
      ${resumeText}

      RETURN JSON FORMAT ONLY:
      {
        "professional_summary": "Optimized summary...",
        "experience": [
          {
            "company": "...",
            "role": "...",
            "bullets": ["Action bullet with quantified impact..."]
          }
        ],
        "skills_section": ["Categorized skills..."]
      }
    `;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    
    const apiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message || apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) throw new Error("AI returned an empty response");

    const resultJson = JSON.parse(resultText);

    return new Response(JSON.stringify(resultJson), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("tailor-resume error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
