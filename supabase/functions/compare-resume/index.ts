import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, skills } = await req.json();
    if (!resumeText || !skills?.length) {
      return new Response(JSON.stringify({ error: "Resume text and skills are required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const skillNames = skills.map((s: any) => `${s.skill} (${s.importance}%)`).join(", ");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert resume analyzer. Compare a resume against required JD skills. Estimate match percentage for each skill AND provide specific deductions explaining why the overall match isn't 100%.

CRITICAL RULE — ALTERNATIVE/OR SKILLS:
When a JD lists alternatives separated by "or", "/", "and/or", or similar (e.g. "Python or R", "LangGraph or LangChain", "AWS or Azure or GCP", "React or Angular"), these are INTERCHANGEABLE options — having ANY ONE of them is a FULL MATCH (100% for that skill). Do NOT deduct points for not knowing the other alternatives.
Instead, in the "note" field, acknowledge the match and suggest mentioning the other alternatives to stand out from the competition.
This applies to programming languages, frameworks, libraries, cloud platforms, tools, certifications — ANY skill where the JD presents multiple options as alternatives.

Examples:
- JD says "Python or R" and resume has Python → 100% match, note: "Strong match with Python. Consider also mentioning R to stand out."
- JD says "LangChain or LangGraph" and resume has LangChain → 100% match, note: "LangChain covers this requirement. Adding LangGraph would strengthen your profile."
- JD says "AWS or Azure" and resume has neither → 0% match, verdict: missing.`,
          },
          {
            role: "user",
            content: `Compare this resume against the required skills. Estimate match percentage (0-100) for each skill. Remember: if the JD lists alternatives (connected by "or", "/", etc.), having ANY ONE is a full match — do NOT deduct for missing alternatives. Also provide a list of specific deductions from 100%.

Required Skills: ${skillNames}

Resume:
${resumeText}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_resume_gap",
              description: "Analyze resume skill gaps against JD requirements",
              parameters: {
                type: "object",
                properties: {
                  overall_match: { type: "number", description: "Overall match percentage 0-100" },
                  skill_matches: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skill: { type: "string" },
                        match_percent: { type: "number", description: "How well the resume matches this skill 0-100" },
                        verdict: { type: "string", enum: ["strong", "partial", "missing"] },
                        note: { type: "string", description: "Brief note on the match" },
                      },
                      required: ["skill", "match_percent", "verdict", "note"],
                    },
                  },
                  deductions: {
                    type: "array",
                    description: "List of specific deductions from 100% match score",
                    items: {
                      type: "object",
                      properties: {
                        reason: { type: "string", description: "What's missing, e.g. 'Missing Deep Learning Frameworks'" },
                        percent: { type: "number", description: "Points deducted, e.g. 10" },
                      },
                      required: ["reason", "percent"],
                    },
                  },
                  summary: { type: "string", description: "2-3 sentence gap analysis summary" },
                },
                required: ["overall_match", "skill_matches", "deductions", "summary"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_resume_gap" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let parsed: any;

    if (toolCall?.function?.arguments) {
      parsed = JSON.parse(toolCall.function.arguments);
    } else {
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse AI response");
      parsed = JSON.parse(jsonMatch[0]);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("compare-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
