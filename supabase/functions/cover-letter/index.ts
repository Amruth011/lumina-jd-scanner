import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Lumina AI Cover Letter Engine
 * ============================
 */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { jd, resume, tone } = await req.json();

    const groqKey = Deno.env.get("GROQ_API_KEY")?.trim();
    if (!groqKey) {
      return new Response(JSON.stringify({ error: "Lumina Auth Error: Missing GROQ_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = [
      {
        role: "system",
        content: `You are an elite Silicon Valley Career Strategist.
Your goal is to write a high-impact, ATS-friendly cover letter that perfectly aligns the candidate's resume with the job description.

Tone: ${tone || 'Professional'}
Strategy:
1. Hook the reader immediately with a powerful value proposition.
2. Link specific achievements from the resume to the job requirements.
3. Show domain expertise and cultural fit.
4. Keep it concise (under 350 words).
5. Use standard professional formatting.`
      },
      {
        role: "user",
        content: `Job Description:
${jd}

Candidate's Tailored Resume Data:
${JSON.stringify(resume)}

Write a compelling, ready-to-send cover letter.`
      }
    ];

    const fallbackModels = [
      "llama-3.1-8b-instant",
      "llama-3.3-70b-versatile",
      "mixtral-8x7b-32768"
    ];

    let resultData = null;
    let lastError = "";

    for (const model of fallbackModels) {
      try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: model,
            messages,
            temperature: 0.7,
          }),
        });

        if (groqResponse.ok) {
          resultData = await groqResponse.json();
          break;
        }
        
        lastError = await groqResponse.text();
      } catch (err) {
        lastError = String(err);
      }
    }

    if (!resultData) {
      return new Response(JSON.stringify({ error: "All AI engines exhausted", details: lastError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(resultData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
