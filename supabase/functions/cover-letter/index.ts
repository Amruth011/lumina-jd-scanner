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
    const { jd, resume, tone, focus, length } = await req.json();

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
        content: `You are an elite Silicon Valley Career Strategist specializing in "Human-First" candidacy narratives.
Your goal is to write a high-impact, ready-to-send cover letter that is 100% ATS-optimized while sounding completely human and original.

Tone: ${tone || 'Professional'}
Narrative Focus: ${focus || 'Technical Excellence'}
Length Mode: ${length || 'Concise'}

STRICT HUMANIZATION GUIDELINES:
1. NO AI-isms: Avoid words like "delve", "testament", "vibrant", "holistic", "meticulous", "passionate about", "unwavering", "synergy", "realm", "bespoke".
2. NO ROBOTIC STRUCTURES: Avoid the typical "I am writing to express my interest..." or "In conclusion, I am confident...". Start with a punchy, unique hook.
3. VARY SENTENCE DYNAMICS: Mix short, impactful sentences with longer, complex ones. Use active voice.
4. BE SPECIFIC: Never use generic praise for the company. Reference specific technical challenges or industry shifts.

ATS ALIGNMENT STRATEGY:
1. SEMANTIC MIRRORING: Identify the 5 most critical keywords/phrases from the Job Description and weave them naturally into the narrative.
2. METRIC-DRIVEN IMPACT: Quantify achievements using the resume data (e.g., "Increased pipeline efficiency by 40%").
3. PROBLEM-SOLUTION FIT: Frame the candidate's skills as a direct solution to the JD's specific pain points.
4. ${focus === 'Leadership' ? 'Prioritize leadership metrics and strategic oversight.' : focus === 'Cultural' ? 'Highlight mission alignment and team-first philosophy.' : 'Prioritize technical stack proficiency and architectural impact.'}

FORMAT:
- Length: ${length === 'Concise' ? 'Under 250 words, extremely punchy.' : 'Under 450 words, providing more narrative depth and specific examples.'}
- Structure: Salutation, Hook/Problem-Solution, Evidence/Metrics, Call to Action, Professional Sign-off.`
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
