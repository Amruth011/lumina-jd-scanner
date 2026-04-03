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
        model: "google/gemini-1.5-pro",
        messages: [
          {
            role: "system",
            content: `You are an expert ATS (Applicant Tracking System) consultant and resume analyzer. Your primary goal is to help candidates pass ATS screening with highly accurate, trustworthy recommendations. You must protect the integrity of the user's career history while optimizing for ATS algorithms.

**When analyzing and recommending changes, build trust:**
1. Focus on exact wording: Recommend replacing current words with precise ATS keywords from the JD without lying.
2. Provide explicit, granular directives on exactly what to add, delete, replace, or edit. Your directives must explicitly state what to replace: e.g., "this: <old text> replace with this: <new text>". YOU MUST ALWAYS PROVIDE "actionable_directives" IN YOUR JSON RESPONSE. IT IS CRITICAL AND MANDATORY.
3. Keep your deductions highly accurate and DETERMINISTIC — the same resume and JD must ALWAYS produce the same score.
4. For EVERY deduction, you MUST also provide a "fix_snippet" — a ready-to-paste resume bullet point or phrase that the user can add to their resume to eliminate that specific gap. This snippet should use the user's actual experience context, not fabricated content.

CRITICAL RULE — ALTERNATIVE/OR/SLASH SKILLS:
When a JD lists alternatives (e.g. "Python or R", "React or Angular", "Python/TypeScript", "AWS/GCP"), having ANY ONE of them is a FULL MATCH (100% for that skill).
Do NOT deduct points for not knowing the other alternatives. If a user has Python, but JD asks for "Python/TypeScript", give them 100% and DO NOT deduct from the total score. Instead, in the "note" field, acknowledge the match. Be exceptionally smart about these equivalencies to ensure trust (never penalize for a missing framework if an OR equivalent is met).

Examples:
- JD says "Python or R" and resume has Python → 100% match, note: "Strong match with Python."
- JD says "Python/TypeScript" and resume has Python → 100% match, note: "Python satisfies the Python/TypeScript requirement."
- JD says "AWS or Azure" and resume has neither → 0% match, verdict: missing.`,
          },
          {
            role: "user",
            content: `Compare this resume against the required skills. Estimate match percentage (0-100) for each skill. Remember the CRITICAL RULE: if the JD lists alternatives (connected by "or", "/", etc.), having ANY ONE is a full match — do NOT deduct for missing alternatives. Provide a list of specific deductions from 100%, and ALWAYS provide actionable directives ("this: [old] replace with this: [new]").

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
                    description: "List of specific deductions from 100% match score. Each MUST include a fix_snippet.",
                    items: {
                      type: "object",
                      properties: {
                        reason: { type: "string", description: "What's missing, e.g. 'Missing Deep Learning Frameworks'" },
                        percent: { type: "number", description: "Points deducted, e.g. 10" },
                        fix_snippet: { type: "string", description: "A ready-to-paste resume bullet or phrase the user can add to fix this gap. Use their ACTUAL experience context, not fabricated content. Example: 'Add to Skills: TypeScript | Add bullet: Built type-safe REST APIs using TypeScript and Express.js'" },
                      },
                      required: ["reason", "percent", "fix_snippet"],
                    },
                  },
                  summary: { type: "string", description: "2-3 sentence gap analysis summary" },
                  tailored_resume_snippets: {
                    type: "object",
                    description: "Tailored resume statements the user can copy/paste directly into their resume to address gaps and highlight matches",
                    properties: {
                      professional_summary: { type: "string", description: "A tailored 2-3 sentence professional summary focusing heavily on the exact JD requirement keywords" },
                      experience_bullets: {
                        type: "array",
                        items: { type: "string" },
                        description: "3 to 5 highly professional, quantified bullet points that the user can copy into their Work Experience section to directly hit the JD requirements and fix the reported gaps. Make them sound extremely impressive and action-oriented."
                      }
                    },
                    required: ["professional_summary", "experience_bullets"]
                  },
                  actionable_directives: {
                    type: "array",
                    description: "Direct, granular instructions on what exactly to change in the submitted resume based on the JD. Give them actionable, trustworthy advice.",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string", enum: ["add", "delete", "replace", "edit"] },
                        description: { type: "string", description: "Exactly what text to change/add/remove. (e.g. 'Replace \"Created web apps\" with \"Developed scalable web applications\"')" },
                        reasoning: { type: "string", description: "Why this helps bypass ATS or improve readability." }
                      },
                      required: ["action", "description", "reasoning"]
                    }
                  }
                },
                required: ["overall_match", "skill_matches", "deductions", "summary", "tailored_resume_snippets", "actionable_directives"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_resume_gap" } },
        temperature: 0,
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

    // ── DETERMINISTIC SCORING ──
    // Override AI's overall_match with a weighted calculation from skill_matches.
    // This ensures the SAME resume + JD ALWAYS produces the EXACT same score.
    if (parsed.skill_matches?.length > 0) {
      let totalWeight = 0;
      let weightedSum = 0;
      for (const sm of parsed.skill_matches) {
        const importance = skills.find((s: any) => s.skill === sm.skill)?.importance || 50;
        totalWeight += importance;
        weightedSum += (sm.match_percent / 100) * importance;
      }
      if (totalWeight > 0) {
        parsed.overall_match = Math.round((weightedSum / totalWeight) * 100);
      }
    }

    // Recalculate deductions from skill matches for consistency
    if (parsed.skill_matches?.length > 0 && parsed.deductions?.length > 0) {
      let deductionTotal = 0;
      for (const d of parsed.deductions) {
        deductionTotal += d.percent;
      }
      // Normalize deductions so they sum to exactly (100 - overall_match)
      const targetDeduction = 100 - parsed.overall_match;
      if (deductionTotal > 0 && targetDeduction > 0) {
        const scale = targetDeduction / deductionTotal;
        for (const d of parsed.deductions) {
          d.percent = Math.round(d.percent * scale);
        }
      }
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
