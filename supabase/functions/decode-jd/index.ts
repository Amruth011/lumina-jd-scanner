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

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured");

    const prompt = `You are a Tier-1 Executive Recruiter and Data Analyst. Decode the following Job Description into a high-precision strategic intelligence report.
    
    Job Description:
    ${jdText}
    
    Return a valid JSON object matching this structure EXACTLY:
    {
      "title": "Exact Role Title",
      "grade": {
        "score": 0-100,
        "letter": "S|A|B|C|D|F",
        "summary": "1-sentence executive verdict",
        "breakdown": { "clarity": 0-20, "realistic": 0-15, "compensation": 0-15, "red_flags": 0-15, "benefits": 0-10, "growth": 0-10 }
      },
      "skills": [{"category": "string", "skill": "string", "importance": 0-100}],
      "requirements": { "education": ["string"], "experience": "string", "soft_skills": ["string"], "agreements": ["string"] },
      "recruiter_lens": [{"jargon": "corporate phrase", "reality": "what it actually means"}],
      "time_distribution": [{"task": "activity", "percent": 0-100}],
      "role_reality": {
        "iceberg_above": ["Stated tasks"],
        "iceberg_below": ["Hidden/implied tasks"],
        "archetype": "The Creator|The Optimizer|The Fixer|The Researcher",
        "dimensions": { "technical_depth": 0-100, "research_autonomy": 0-100, "client_interaction": 0-100, "strategic_impact": 0-100 }
      },
      "winning_strategy": [{"title": "step", "description": "how to execute"}],
      "interview_prep": {
        "questions": [{"question": "string", "type": "technical|behavioral|situational", "target_answer": "tip"}],
        "interviewer_questions": ["Strategic questions to ask them"]
      },
      "salary_estimate": { "min": number, "max": number, "currency": "INR|USD", "source_note": "market basis" },
      "bonus_insights": {
        "ghost_job_probability": 0-100,
        "desperation_meter": 0-100,
        "skill_rarity": 0-100,
        "career_growth": ["future role names"]
      }
    }
    
    IMPORTANT: Be critical. Deduced hidden meanings. Total percent in time_distribution must be 100. Return raw JSON only.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    
    const apiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, response_mime_type: "application/json" },
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${apiResponse.status} - ${errorData.error?.message || apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error("AI returned empty content");

    let parsed;
    try {
      parsed = JSON.parse(resultText);
    } catch (parseErr) {
      // Fallback: search for JSON block
      const firstBrace = resultText.indexOf('{');
      const lastBrace = resultText.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON found in response");
      parsed = JSON.parse(resultText.substring(firstBrace, lastBrace + 1));
    }
    
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("decode-jd error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 200, // Keep 200 to handle gracefully in frontend
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
