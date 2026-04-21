/**
 * LUMINA JD DECODING ENGINE v2.5
 * Native Deno Strategy (Linter-Safe Version)
 */

// We use globalThis to avoid "red squiggles" in web-based editors
const NativeDeno = (globalThis as unknown as { Deno: { serve: (h: (r: Request) => Response | Promise<Response>) => void; env: { get: (k: string) => string | undefined } } }).Deno;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const JD_SCHEMA = {
  valid: true,
  title: "Role Name",
  skills: [{ category: "string", skill: "string", importance: 0 }],
  requirements: { education: [], experience: "", soft_skills: [], agreements: [] },
  winning_strategy: [{ title: "step", description: "detail" }],
  grade: { score: 0, letter: "S", summary: "", breakdown: {}, plain_english_summary: [] },
  red_flags: [{ phrase: "", intensity: 0, note: "" }],
  recruiter_lens: [{ jargon: "", reality: "" }],
  qualifiers: { must_have_percent: 0, nice_to_have_percent: 0, seniority_level: 0, experience: { professional: 0, project_proof: 0 }, education: { degree_required: false, skills_first_percent: 0 } },
  logistics: { salary_range: { min: 0, max: 0, currency: "INR", estimate: true, note: "" }, work_arrangement: { remote_friendly: "unspecified", office_presence: "none", flexible_hours: false }, responsibility_mix: [], archetype: { label: "", description: "", primary_focus: "", primary_tool: "", match_score: 0 }, hard_soft_ratio: { hard: 0, soft: 0 } },
  role_reality: { iceberg_above: [], iceberg_below: [], dimensions: {} },
  deep_dive: { day_in_life: [], health_radar: {}, bias_analysis: {}, culture_radar: {} },
  bonus_pulse: { ghost_job_probability: 0, desperation_meter: 0, competition_estimate: 0, skill_rarity: 0, interview_difficulty: 0, career_growth: {}, tech_stack_popularity: [] },
  interview_kit: { questions: [], reverse_questions: [] },
  resume_help: { keywords: [], bullets: [] },
  jd_rewrite: { highlights: [] }
};

NativeDeno.serve(async (req: Request) => {
  // ── CORS PREFLIGHT ──
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      } 
    });
  }

  try {
    const body = await req.json().catch(() => {
        throw new Error("Failed to parse request body. Ensure it is valid JSON.");
    });
    
    // ── DIAGNOSTIC PING MODE ──
    if (body?.ping) {
      console.info("Lumina Diagnostic: Native Connectivity Ping Received");
      return new Response(JSON.stringify({ status: "ok", message: "Lumina Engine Status: HEALTHY" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { jdText } = body;
    if (!jdText) throw new Error("Job description input is missing.");

    // ── SECRET SANITIZATION ──
    const rawKey = NativeDeno.env.get("GROQ_API_KEY");
    const groqKey = rawKey?.replace(/[^a-zA-Z0-9_-]/g, '')?.trim();
    
    if (!groqKey || groqKey.length < 10) {
      console.error("GROQ_API_KEY is null or corrupt.");
      throw new Error(`Auth Config Error (Key Length: ${rawKey?.length || 0})`);
    }
    
    console.log(`Lumina Engine [v2.6]: Processing JD (${jdText.length} chars)...`);

    // ── TOKEN SAFETY ──
    // Massive JDs can cause timeouts. Capping to 8k chars for stability.
    const safeJD = jdText.substring(0, 8000); 

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
            content: "You are Lumina Intelligence. Return ONLY raw JSON." 
          },
          { 
            role: "user", 
            content: `JD: ${safeJD}\n\nSCHEMA:\n${JSON.stringify(JD_SCHEMA)}` 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 3500, // Capped to ensure generation finishes within 60s
      }),
    }).catch(e => {
      console.error("Groq Network Error:", e);
      throw new Error(`AI Provider unreachable: ${e.message}`);
    });

    console.log(`Intelligence Status: ${groqResponse.status} ${groqResponse.statusText}`);

    if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error("Groq Failure Body:", errorText);
        throw new Error(`AI Engine Refined Result: ${groqResponse.status} - ${errorText.substring(0, 50)}`);
    }

    const data = await groqResponse.json();
    const resultText = data.choices?.[0]?.message?.content;
    if (!resultText) throw new Error("AI returned empty content");

    let parsed;
    try {
      const firstBrace = resultText.indexOf('{');
      const lastBrace = resultText.lastIndexOf('}');
      const cleanJsonText = resultText.substring(firstBrace, lastBrace + 1);
      parsed = JSON.parse(cleanJsonText);
    } catch (e) {
      console.error("JSON Post-Process Failure. Content:", resultText);
      throw new Error("Intelligence Engine returned malformed content.");
    }
    
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "System Exception";
    console.error("Internal Engine Fault:", errorMsg);
    return new Response(JSON.stringify({ 
        error: `Lumina Engine Fault: ${errorMsg}`,
        details: "Consult logs in Supabase Dashboard -> Edge Functions -> decode-jd"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
