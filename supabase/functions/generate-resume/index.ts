import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, skills, deductions, jobTitle } = await req.json();
    if (!resumeText || !skills?.length) {
      return new Response(JSON.stringify({ error: "Resume text and skills are required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const skillNames = skills.map((s: any) => s.skill).join(", ");
    const gaps = (deductions || []).map((d: any) => d.reason).join("; ");

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
            content: `You are an elite resume writer and ATS optimization expert. Your job is to rewrite a candidate's resume to perfectly match a specific job description.

RULES:
1. PRESERVE all truthful information — company names, dates, education, certifications
2. REWRITE bullet points using exact keywords from the JD requirements
3. ADD a new professional summary that directly targets this specific role
4. REORGANIZE skills section to lead with the most important JD skills
5. Use strong action verbs and quantified achievements
6. Every bullet must pass ATS keyword scanning
7. Keep the resume professional, single-column, clean — no gimmicks
8. Output must be structured JSON`,
          },
          {
            role: "user",
            content: `Rewrite this resume to perfectly target the role: "${jobTitle || 'this position'}"

Required JD Skills: ${skillNames}
Identified Gaps: ${gaps}

Original Resume:
${resumeText}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_ats_resume",
              description: "Generate an ATS-optimized resume",
              parameters: {
                type: "object",
                properties: {
                  professional_summary: {
                    type: "string",
                    description: "A 3-4 sentence professional summary targeting the exact JD requirements and keywords",
                  },
                  skills_section: {
                    type: "array",
                    items: { type: "string" },
                    description: "Skills organized by JD priority. Group as: 'Category: skill1, skill2, skill3'",
                  },
                  experience: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        heading: { type: "string", description: "Job title — Company Name (Start Date – End Date)" },
                        content: { type: "string", description: "Brief role description" },
                        bullets: {
                          type: "array",
                          items: { type: "string" },
                          description: "3-5 ATS-optimized bullet points with quantified results",
                        },
                      },
                      required: ["heading", "content", "bullets"],
                    },
                  },
                  education: {
                    type: "array",
                    items: { type: "string" },
                    description: "Education entries preserved from original resume",
                  },
                  certifications: {
                    type: "array",
                    items: { type: "string" },
                    description: "Certifications if any exist in the original resume",
                  },
                },
                required: ["professional_summary", "skills_section", "experience", "education"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_ats_resume" } },
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
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
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
    console.error("generate-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
