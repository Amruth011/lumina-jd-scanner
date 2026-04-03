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

    const skillNames = skills.map((s: any) => `${s.skill} (importance: ${s.importance}%)`).join(", ");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert ATS (Applicant Tracking System) consultant and resume analyzer. Your primary goal is to help candidates pass ATS screening with highly accurate, trustworthy recommendations.

**SCORING RULES — READ CAREFULLY:**
1. For each skill, evaluate the resume CONTEXTUALLY — not just keyword matching. Look for:
   - Direct mentions of the skill
   - Synonyms and equivalent technologies (e.g., "Postgres" = "PostgreSQL", "K8s" = "Kubernetes")
   - Demonstrated usage in project descriptions, even without explicit mention
   - Related experience that implies the skill (e.g., "deployed containerized microservices" implies Docker knowledge)

2. Match percentages per skill:
   - 100 = Explicit mention OR clear demonstrated expertise
   - 70-90 = Strong implicit evidence or synonym match
   - 40-60 = Partial/tangential evidence
   - 0-20 = No evidence found

3. ALTERNATIVE/OR/SLASH SKILLS: "Python or R", "React/Angular", "AWS or GCP" — having ANY ONE = 100% match. Do NOT deduct for missing alternatives.

4. Overall score must be a WEIGHTED AVERAGE of individual skill scores using the importance weights.

5. For EVERY deduction, provide a "fix_snippet" — a ready-to-paste resume bullet using the user's ACTUAL experience context.

6. Provide actionable_directives with specific "this: <old> replace with this: <new>" instructions.`,
          },
          {
            role: "user",
            content: `Analyze this resume against required skills. Be CONTEXTUALLY ACCURATE — don't just do keyword matching. Consider project descriptions, implied skills, and technology ecosystems.

Required Skills (with importance weights): ${skillNames}

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
                  overall_match: { type: "number", description: "Overall weighted match percentage 0-100" },
                  skill_matches: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skill: { type: "string" },
                        match_percent: { type: "number", description: "How well the resume matches this skill 0-100" },
                        verdict: { type: "string", enum: ["strong", "partial", "missing"] },
                        note: { type: "string", description: "Brief explanation of why this score was given" },
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
                        reason: { type: "string" },
                        percent: { type: "number" },
                        fix_snippet: { type: "string", description: "Ready-to-paste resume bullet to fix this gap, using user's actual experience context" },
                      },
                      required: ["reason", "percent", "fix_snippet"],
                    },
                  },
                  summary: { type: "string", description: "2-3 sentence gap analysis summary" },
                  tailored_resume_snippets: {
                    type: "object",
                    properties: {
                      professional_summary: { type: "string", description: "Tailored 2-3 sentence professional summary using JD keywords" },
                      experience_bullets: {
                        type: "array",
                        items: { type: "string" },
                        description: "3-5 quantified, action-oriented bullet points targeting JD gaps"
                      }
                    },
                    required: ["professional_summary", "experience_bullets"]
                  },
                  actionable_directives: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string", enum: ["add", "delete", "replace", "edit"] },
                        description: { type: "string", description: "Exactly what to change, e.g. 'Replace \"Created web apps\" with \"Developed scalable web applications using React and TypeScript\"'" },
                        reasoning: { type: "string" }
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

    // Recalculate overall_match as weighted average from skill_matches for consistency
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

    // Normalize deductions to sum to (100 - overall_match)
    if (parsed.deductions?.length > 0) {
      const targetDeduction = 100 - parsed.overall_match;
      const rawTotal = parsed.deductions.reduce((sum: number, d: any) => sum + d.percent, 0);
      if (rawTotal > 0 && targetDeduction > 0) {
        const scale = targetDeduction / rawTotal;
        for (const d of parsed.deductions) {
          d.percent = Math.max(1, Math.round(d.percent * scale));
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
