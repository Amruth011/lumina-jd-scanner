import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface JDSkill {
  category: "Languages" | "Frameworks" | "Tools" | "Databases" | "Cloud" | "Soft Skills" | "Other";
  skill: string;
  importance: number;
}

interface JDParsed {
  title: string;
  skills: JDSkill[];
  requirements: {
    education: string[];
    experience: string;
    soft_skills: string[];
    agreements: string[];
  };
  winning_strategy: Array<{
    title: string;
    description: string;
  }>;
}

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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert recruiter and career strategist. Analyze this job description thoroughly.
      
      JD Text:
      ${jdText}

      INSTRUCTIONS:
      1. TITLE: Extract the company and title (e.g. "Google - Data Scientist"). If not found, infer the best fit.
      2. SKILLS: Extract skills into categories (Languages, Frameworks, Tools, Databases, Cloud, Soft Skills, Other).
      3. STRATEGY: Provide exactly 3 actionable steps to be a top 0.1% candidate for THIS role.
      4. COMPOSITE SKILLS: If the JD says "React or Angular", extract as a single skill: "React OR Angular". Do NOT split them.

      RETURN JSON FORMAT:
      {
        "title": "...",
        "skills": [{"category": "...", "skill": "...", "importance": 100}, ...],
        "requirements": {
          "education": ["..."],
          "experience": "...",
          "soft_skills": ["..."],
          "agreements": ["..."]
        },
        "winning_strategy": [{"title": "...", "description": "..."}]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Robust JSON extraction: look for the first '{' and last '}'
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to find JSON in AI response:", text);
      throw new Error("AI response was malformed. Please try again.");
    }

    try {
      const parsed: JDParsed = JSON.parse(jsonMatch[0]);
      
      // Note: jd_vault insert was removed from here to be handled by the client 
      // to ensure user_id is properly populated and RLS is respected.

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Text:", text);
      throw new Error("Failed to parse AI strategy. The response was not valid JSON.");
    }
  } catch (e) {
    console.error("decode-jd error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    
    // Return a structured error response that the client can display
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: errorMessage.includes("configured") || errorMessage.includes("malformed") ? 400 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
