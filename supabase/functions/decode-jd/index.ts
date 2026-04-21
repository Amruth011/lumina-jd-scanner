import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jdText } = await req.json();
    if (!jdText) throw new Error("JD text is required");

    const prompt = `Lumina Intelligence v2, decode this JD with 99.9% precision. 
JD: ${jdText}

RULES:
1. Skills: [90+: Critical, 70-89: Preferred, 40-69: Plus, 10-39: Mentioned]. Include Foundations (90+) and Degrees (90+).
2. Format: Return ONLY raw JSON. No surrounding text.

JSON STRUCTURE:
{
  "valid": true,
  "title": "Role Name",
  "skills": [{"category": "string", "skill": "string", "importance": 0-100}],
  "requirements": { "education": ["string"], "experience": "string", "soft_skills": ["string"], "agreements": ["string"] },
  "winning_strategy": [{"title": "step", "description": "detail"}],
  "grade": { "score": 0-100, "letter": "S|A|B|C|D|F", "summary": "sentence", "breakdown": { "clarity": 0-20, "realistic": 0-15, "compensation": 0-15, "red_flags": 0-15, "benefits": 0-10, "growth": 0-10, "inclusivity": 0-10, "readability": 0-5 }, "plain_english_summary": ["5 concise points"] },
  "red_flags": [{"phrase": "text", "intensity": 0-100, "note": "why"}],
  "recruiter_lens": [{"jargon": "corporate fluff", "reality": "the harsh truth"}],
  "qualifiers": { "must_have_percent": number, "nice_to_have_percent": number, "seniority_level": 0-100, "experience": { "professional": number, "project_proof": number }, "education": { "degree_required": boolean, "skills_first_percent": number } },
  "logistics": { "salary_range": { "min": number, "max": number, "currency": "INR|USD", "estimate": boolean, "note": "context" }, "work_arrangement": { "remote_friendly": "yes|no|partial|unspecified", "office_presence": "none|occasional|full", "flexible_hours": boolean }, "responsibility_mix": [{"label": "task", "percent": number}], "archetype": { "label": "name", "description": "summary", "primary_focus": "string", "primary_tool": "string", "match_score": number }, "hard_soft_ratio": { "hard": number, "soft": number } },
  "role_reality": { "iceberg_above": ["Stated"], "iceberg_below": ["Implied"], "dimensions": { "technical_depth": 0-100, "research_autonomy": 0-100, "client_interaction": 0-100, "strategic_impact": 0-100, "legacy_maintenance": 0-100 } },
  "deep_dive": { "day_in_life": [{"time": "HH:MM", "task": "string", "description": "detail"}], "health_radar": { "market_position": 0-100, "tech_innovation": 0-100, "transparency": 0-100, "client_quality": 0-100, "employee_benefits": 0-100 }, "bias_analysis": { "inclusivity_score": 0-100, "gender_meter": "masculine|neutral|feminine", "age_bias_graph": 0-100, "tonal_map": [{"category": "string", "tone": "string"}] }, "culture_radar": { "innovation": 0-100, "work_life_balance": 0-100, "collaboration": 0-100, "hierarchy": 0-100, "results_driven": 0-100, "stability": 0-100 } },
  "bonus_pulse": { "ghost_job_probability": 0-100, "desperation_meter": 0-100, "competition_estimate": number, "skill_rarity": 0-100, "interview_difficulty": 0-100, "career_growth": { "trajectory": ["role names"], "potential_score": 0-100 }, "tech_stack_popularity": [{"name": "tech", "demand": "Standard|High|Extreme"}] },
  "interview_kit": { "questions": [{"question": "text", "type": "technical|behavioral|situational", "tip": "tip"}], "reverse_questions": ["5 strategic questions"] },
  "resume_help": { "keywords": ["string"], "bullets": ["5 tailored bullets"] },
  "jd_rewrite": { "highlights": [{"text": "sentence", "color": "skill|leverage|caution"}] }
}`;

    // Use the Groq Key from Environment Variables
    const groqKey = Deno.env.get("GROQ_API_KEY");
    if (!groqKey) {
      console.error("GROQ_API_KEY is not set in Supabase secrets.");
      throw new Error("Server configuration error: Missing API Key");
    }
    
    console.log(`Decoding Intelligence: Starting Groq Scan (Llama-3.3-70b-versatile)...`);

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: "You are Lumina Intelligence v2. Determine if the input is a genuine job description. A valid JD must contain at least 2 of: job title, skills, responsibilities, company context, or experience requirements. If invalid, return { \"valid\": false, \"error\": \"NOT_A_JD\", \"message\": \"This doesn't appear to be a job description. Please paste a real JD to decode.\" }. If valid, include { \"valid\": true } and decode details. Return ONLY raw JSON." 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!groqResponse.ok) {
        const errorData = await groqResponse.json();
        throw new Error(`Groq API Error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await groqResponse.json();
    const resultText = data.choices?.[0]?.message?.content;
    if (!resultText) throw new Error("AI returned empty content");

    console.log(`Decoding Intelligence: Cleaning Groq Response Segment...`);
    const firstBrace = resultText.indexOf('{');
    const lastBrace = resultText.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      console.error("Malformed AI Response (No JSON found):", resultText);
      throw new Error("Intelligence Engine returned invalid formatting. Please try again.");
    }
    
    const cleanJsonText = resultText.substring(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(cleanJsonText);
    
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("decode-jd error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 400, // Correctly report failure to Supabase client
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
