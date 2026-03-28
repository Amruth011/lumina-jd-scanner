import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jdText } = await req.json();
    if (!jdText || typeof jdText !== "string" || jdText.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Please provide a valid job description (min 20 chars)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            content: `You are an expert recruiter, JD analyst, and career strategist. Extract comprehensive information from job descriptions.

IMPORTANT RULES FOR THE TITLE FIELD:
- Use the EXACT job title as mentioned in the JD (e.g. "Data Scientist", "Senior ML Engineer", "Backend Developer").
- If a company name is mentioned, include it as: "Company Name — Job Title" (e.g. "Google — Data Scientist").
- Do NOT rename or re-interpret the job title based on the skills listed. If the JD says "Data Scientist" but focuses on ML engineering tasks, still use "Data Scientist" as the title.
- Only use the title the employer wrote in the JD.`,
          },
          {
            role: "user",
            content: `Analyze this job description thoroughly. Extract:
1. The exact job title (and company if mentioned) as written in the JD — do NOT infer or rename it
2. All required skills with category and importance (0-100)
3. Critical requirements: education, experience, soft skills, and any agreements/conditions
4. A "Top 0.1% Winning Strategy" — 3 specific, actionable steps to stand out for THIS role

Job Description:
${jdText}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_jd_full",
              description: "Extract skills, requirements, and winning strategy from a job description",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "The EXACT job title from the JD. If company is mentioned, format as 'Company — Job Title'. Never rename or reinterpret the title based on skills." },
                  skills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", enum: ["Languages", "Frameworks", "Tools", "Databases", "Cloud", "Soft Skills", "Other"] },
                        skill: { type: "string" },
                        importance: { type: "number" },
                      },
                      required: ["category", "skill", "importance"],
                    },
                  },
                  requirements: {
                    type: "object",
                    properties: {
                      education: {
                        type: "array",
                        items: { type: "string" },
                        description: "Education requirements like B.Tech, Masters, PhD",
                      },
                      experience: {
                        type: "string",
                        description: "Experience requirement like '3+ years' or '5-8 years'",
                      },
                      soft_skills: {
                        type: "array",
                        items: { type: "string" },
                        description: "Soft skills like Stakeholder Management, Agile, Leadership",
                      },
                      agreements: {
                        type: "array",
                        items: { type: "string" },
                        description: "Any mentions of shifts, relocation, legal terms, NDAs, travel",
                      },
                    },
                    required: ["education", "experience", "soft_skills", "agreements"],
                  },
                  winning_strategy: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Short strategy title" },
                        description: { type: "string", description: "Detailed actionable step" },
                      },
                      required: ["title", "description"],
                    },
                    description: "Exactly 3 actionable steps to be a top 0.1% candidate",
                  },
                },
                required: ["title", "skills", "requirements", "winning_strategy"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_jd_full" } },
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

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("jd_vault").insert({
      title: parsed.title,
      skills_json: parsed.skills,
      raw_text: jdText,
    });

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("decode-jd error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
