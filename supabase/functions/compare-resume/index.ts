import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Skill {
  skill: string;
  importance: number;
}

interface SkillMatch {
  skill: string;
  match_percent: number;
  verdict: "strong" | "partial" | "missing";
  note: string;
}

interface Deduction {
  reason: string;
  percent: number;
  fix_snippet: string;
}

interface ActionableDirective {
  action: "add" | "delete" | "replace" | "edit";
  description: string;
  reasoning: string;
}

interface CompareParsed {
  overall_match: number;
  skill_matches: SkillMatch[];
  deductions: Deduction[];
  summary: string;
  tailored_resume_snippets: {
    professional_summary: string;
    experience_bullets: string[];
  };
  actionable_directives: ActionableDirective[];
}

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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

    const skillNames = (skills as Skill[]).map((s) => `${s.skill} (importance: ${s.importance}%)`).join(", ");

    const prompt = `
      You are an expert ATS (Applicant Tracking System) consultant. Analyze this resume against the required skills.
      
      Required Skills: ${skillNames}
      Resume:
      ${resumeText}

      SCORING RULES:
      1. Contextual matching - look for synonyms and implied expertise.
      2. Weighted average for the overall score.
      3. For gaps, provide a "fix_snippet" using the user's actual context.

      RETURN JSON FORMAT:
      {
        "overall_match": 0-100,
        "skill_matches": [{"skill": "...", "match_percent": 0-100, "verdict": "strong|partial|missing", "note": "..."}],
        "deductions": [{"reason": "...", "percent": 0, "fix_snippet": "..."}],
        "summary": "...",
        "tailored_resume_snippets": {
          "professional_summary": "...",
          "experience_bullets": ["..."]
        },
        "actionable_directives": [{"action": "add|delete|replace|edit", "description": "...", "reasoning": "..."}]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed: CompareParsed = JSON.parse(cleanJson);

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
