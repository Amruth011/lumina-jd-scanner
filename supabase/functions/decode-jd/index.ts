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
  title: "",
  skills: [{ category: "", skill: "", importance: 0 }],
  requirements: { education: [], experience: "", soft_skills: [], agreements: [] },
  winning_strategy: [{ title: "", description: "" }],
  grade: { 
    score: 0, letter: "S", summary: "", 
    breakdown: { clarity: 0, realistic: 0, compensation: 0, red_flags: 0, benefits: 0, growth: 0, inclusivity: 0, readability: 0 }, 
    plain_english_summary: [] 
  },
  red_flags: [{ phrase: "", intensity: 0, note: "" }],
  recruiter_lens: [{ jargon: "", reality: "" }],
  qualifiers: { must_have_percent: 0, nice_to_have_percent: 0, seniority_level: 0, experience: { professional: 0, project_proof: 0 }, education: { degree_required: false, skills_first_percent: 0 } },
  logistics: { 
    salary_range: { min: 0, max: 0, currency: "INR", estimate: true, note: "" }, 
    work_arrangement: { remote_friendly: "", office_presence: "", flexible_hours: false }, 
    responsibility_mix: [{ label: "", percent: 0 }], 
    archetype: { label: "", description: "", primary_focus: "", primary_tool: "", match_score: 0 },
    hard_soft_ratio: { hard: 0, soft: 0 }
  },
  role_reality: { iceberg_above: [], iceberg_below: [], dimensions: { technical_depth: 0, research_autonomy: 0, client_interaction: 0, strategic_impact: 0, legacy_maintenance: 0 } },
  deep_dive: { 
    day_in_life: [{ time: "09:00", task: "", description: "" }], 
    health_radar: { market_position: 0, tech_innovation: 0, transparency: 0, client_quality: 0, employee_benefits: 0 }, 
    bias_analysis: { inclusivity_score: 0, gender_meter: "neutral", age_bias_graph: 0, tonal_map: [{ category: "", tone: "" }] }, 
    culture_radar: { innovation: 0, work_life_balance: 0, collaboration: 0, hierarchy: 0, results_driven: 0, stability: 0 } 
  },
  bonus_pulse: { ghost_job_probability: 0, desperation_meter: 0, competition_estimate: 0, skill_rarity: 0, interview_difficulty: 0, career_growth: { trajectory: [], potential_score: 0 }, tech_stack_popularity: [{ name: "", demand: "Standard" }] },
  interview_kit: { questions: [{ question: "", type: "technical", tip: "", target_answer: "" }], reverse_questions: [] },
  resume_help: { keywords: [], bullets: [] }
};

NativeDeno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { ...corsHeaders, "Access-Control-Allow-Methods": "POST, OPTIONS", } });
  }

  try {
    const body = await req.json().catch(() => { throw new Error("Failed to parse request body."); });
    const { jdText } = body;
    if (!jdText) throw new Error("Job description input is missing.");

    const rawKey = NativeDeno.env.get("GROQ_API_KEY");
    const groqKey = rawKey?.replace(/[^a-zA-Z0-9_-]/g, '')?.trim();
    if (!groqKey) throw new Error("Auth Config Error: Missing API Key");

    const safeJD = jdText.substring(0, 15000); 
    const fallbackModels = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "gemma2-9b-it"
    ];

    let resultText = "";
    let lastError = "";

    for (const model of fallbackModels) {
        try {
            const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: "You are Lumina Ultra. Analyze the JD and return JSON. IMPORTANT: Use plain strings for 'experience', 'education', 'titles', and 'category' fields. Match the provided SCHEMA keys EXACTLY (including case sensitivity). Do not add new top-level keys. Never return null; use empty placeholders. Return ONLY raw JSON." },
                        { role: "user", content: `JD: ${safeJD}\n\nSCHEMA:\n${JSON.stringify(JD_SCHEMA)}` }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.1,
                    max_tokens: 3500,
                }),
            });

            if (!groqResponse.ok) {
                const status = groqResponse.status;
                const errorBody = await groqResponse.text();
                // Persist the specific error code for the resilience loop
                // We now continue on 400 (model retired) as well to ensure we reach the 8B fallback
                if (status === 429 || status === 400 || status === 404) {
                    lastError = `Model ${model} unavailable (${status})`;
                    continue; 
                }
                throw new Error(`AI Provider Error (${status}): ${errorBody.substring(0, 150)}`);
            }

            const data = await groqResponse.json();
            resultText = data.choices?.[0]?.message?.content;
            if (resultText) break;
        } catch (err: unknown) {
            lastError = err instanceof Error ? err.message : String(err);
            // Continue to next model on any retriable error
            if (lastError.includes("429") || lastError.includes("400") || lastError.includes("404")) continue;
            throw err;
        }
    }

    if (!resultText) throw new Error(`Engines exhausted: ${lastError}`);

    let parsed;
    try {
      const firstBrace = resultText.indexOf('{');
      const lastBrace = resultText.lastIndexOf('}');
      parsed = JSON.parse(resultText.substring(firstBrace, lastBrace + 1));
    } catch (e) {
      throw new Error("Intelligence Engine returned malformed content.");
    }
    
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "System Exception";
    return new Response(JSON.stringify({ error: `Lumina Engine Fault: ${errorMsg}`, details: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
