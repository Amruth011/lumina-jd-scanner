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

interface Deduction {
  reason: string;
  fix_snippet?: string;
}

interface ResumeParsed {
  professional_summary: string;
  skills_section: string[];
  experience: Array<{
    heading: string;
    content: string;
    bullets: string[];
  }>;
  education: string[];
  certifications?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, skills, deductions, jobTitle, gapSummary } = await req.json();
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

    const skillNames = (skills as Skill[]).map((s) => `${s.skill} (${s.importance}%)`).join(", ");
    const gaps = (deductions as Deduction[] || []).map((d) => `${d.reason}${d.fix_snippet ? ' → Fix: ' + d.fix_snippet : ''}`).join("\n");

    const prompt = `
      You are an elite ATS resume optimizer. Rewrite this resume to maximize ATS score for: "${jobTitle || 'this position'}"
      
      Required JD Skills: ${skillNames}
      Gaps & Fixes:
      ${gaps || "None provided."}
      ${gapSummary ? `Analysis Summary: ${gapSummary}` : ''}

      Original Resume:
      ${resumeText}

      RULES:
      1. PRESERVE all truthful info (dates, companies). NEVER fabricate.
      2. REWRITE bullets with exact JD keywords.
      3. Use strong action verbs and quantified results.
      
      RETURN JSON FORMAT:
      {
        "professional_summary": "...",
        "skills_section": ["Category: skill1, skill2..."],
        "experience": [{"heading": "Title - Company", "content": "...", "bullets": ["..."]}],
        "education": ["..."],
        "certifications": ["..."]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed: ResumeParsed = JSON.parse(cleanJson);

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
