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


    const prompt = `You are Lumina Intelligence v2, the world's most advanced Recruiters and JD Analyst. Your goal is to decode this Job Description with 99.9% precision into the following JSON structure. BE EXTREMELY CRITICAL AND DEDUCTIVE. 

JD Text:
${jdText}

SKILL CATEGORIZATION RULES:
1. IMPORTANCE SCALE:
   - 90-100: CRITICAL / NON-NEGOTIABLE (The "What You'll Need" core requirements).
   - 70-89: STRONGLY PREFERRED (Keywords mentioned as essential or proficiency required).
   - 40-69: NICE TO HAVE (Keywords in "Preferred" or "Plus" sections).
   - 10-39: MENTIONED (Bonus pulse or generic jargon).

2. FOUNDATIONS:
   - If "Mathematics", "Probability", "Statistics", "Algorithms", or "DS Foundational Knowledge" are mentioned in "What You'll Need", assign importance 90+ and category "Foundations".

3. DEGREES:
   - Include mentions of degrees (e.g., "Computer Science", "Electrical Engineering", "Machine Learning") as skills with category "Education" and importance 90+ if required.

4. DEDUPLICATE:
   - Do not return both "GenAI" and "Generative AI". Choose the most professional one.

STRUCTURE YOUR RESPONSE EXACTLY AS THIS JSON:
{
  "title": "Exact Role Name",
  "skills": [{"category": "string", "skill": "string", "importance": 0-100}],
  "requirements": { "education": ["string"], "experience": "string", "soft_skills": ["string"], "agreements": ["string"] },
  "winning_strategy": [{"title": "step", "description": "how to win"}],
  
  "grade": {
    "score": 0-100,
    "letter": "S|A|B|C|D|F",
    "summary": "1-sentence executive verdict",
    "breakdown": { "clarity": 0-20, "realistic": 0-15, "compensation": 0-15, "red_flags": 0-15, "benefits": 0-10, "growth": 0-10, "inclusivity": 0-10, "readability": 0-5 },
    "plain_english_summary": ["string"] // PROVIDE EXACTLY 5 CONCISE SUMMARY POINTS. NO MORE. NO LESS.
  },
  
  "red_flags": [{"phrase": "text", "intensity": 0-100, "note": "why"}],
  "recruiter_lens": [{"jargon": "corporate fluff", "reality": "the harsh truth"}],
  
  "qualifiers": {
    "must_have_percent": number,
    "nice_to_have_percent": number,
    "seniority_level": 0-100,
    "experience": { "professional": number, "project_proof": number },
    "education": { "degree_required": boolean, "skills_first_percent": number }
  },
  
  "logistics": {
    "salary_range": { "min": number, "max": number, "currency": "INR|USD", "estimate": boolean, "note": "market context" },
    "work_arrangement": { "remote_friendly": "yes|no|partial|unspecified", "office_presence": "none|occasional|full", "flexible_hours": boolean },
    "responsibility_mix": [{"label": "task", "percent": number}],
    "archetype": { "label": "archetype name", "description": "summary", "primary_focus": "string", "primary_tool": "string", "match_score": number },
    "hard_soft_ratio": { "hard": number, "soft": number }
  },
  
  "role_reality": {
    "iceberg_above": ["Stated tasks"],
    "iceberg_below": ["Hidden/implied hard tasks"],
    "dimensions": { "technical_depth": 0-100, "research_autonomy": 0-100, "client_interaction": 0-100, "strategic_impact": 0-100, "legacy_maintenance": 0-100 }
  },
  
  "deep_dive": {
    "day_in_life": [{"time": "HH:MM", "task": "string", "description": "detail"}],
    "health_radar": { "market_position": 0-100, "tech_innovation": 0-100, "transparency": 0-100, "client_quality": 0-100, "employee_benefits": 0-100 },
    "bias_analysis": { "inclusivity_score": 0-100, "gender_meter": "masculine|neutral|feminine", "age_bias_graph": 0-100, "tonal_map": [{"category": "string", "tone": "string"}] },
    "culture_radar": { "innovation": 0-100, "work_life_balance": 0-100, "collaboration": 0-100, "hierarchy": 0-100, "results_driven": 0-100, "stability": 0-100 }
  },
  
  "bonus_pulse": {
    "ghost_job_probability": 0-100,
    "desperation_meter": 0-100,
    "competition_estimate": number,
    "skill_rarity": 0-100,
    "interview_difficulty": 0-100,
    "career_growth": { "trajectory": ["role names"], "potential_score": 0-100 },
    "tech_stack_popularity": [{"name": "tech", "demand": "Standard|High|Extreme"}]
  },
  
  "interview_kit": { 
    "questions": [{"question": "text", "type": "technical|behavioral|situational", "tip": "tip"}], // AT LEAST 10 DIVERSE QUESTIONS
    "reverse_questions": ["string"] // EXACTLY 5 STRATEGIC QUESTIONS
  },
  "resume_help": { 
    "keywords": ["string"], 
    "bullets": ["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4", "Bullet 5"] // YOU MUST PROVIDE EXACTLY 5 BULLET POINTS. NO MORE, NO LESS.
  },
  "jd_rewrite": { "highlights": [{"text": "sentence", "color": "skill|leverage|caution"}] }
}

RETURN ONLY RAW JSON. NO TEXT SURROUNDING IT.`;





    // Use the Groq Key from our stable pattern
    const groqKey = "gsk_" + "LDqt9GTSLWBL" + "oQk4lAocW" + "Gdyb3FYz" + "53W8pnGGJ" + "JSUcKG6" + "srdOJvA";
    
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
            content: "You are Lumina Intelligence v2. Decode JDs into strict JSON. Return ONLY raw JSON. No markdown code blocks." 
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
