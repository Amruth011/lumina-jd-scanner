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

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured");

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const skillNames = (skills as Skill[]).map((s) => `${s.skill} (importance: ${s.importance}%)`).join(", ");
    
    // ... prompt setup code ...

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to find JSON in AI response:", text);
      throw new Error("AI response was malformed. Please try again.");
    }

    try {
      const parsed: CompareParsed = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Text:", text);
      throw new Error("Failed to parse comparison. The response was not valid JSON.");
    }
  } catch (e) {
    console.error("compare-resume error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
