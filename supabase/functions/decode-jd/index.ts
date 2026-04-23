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
    salary_range: { min: 0, max: 0, currency: "", estimate: true, note: "" }, 
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

    const groqKey = NativeDeno.env.get("GROQ_API_KEY")?.trim();
    if (!groqKey) {
        console.error("GROQ_API_KEY is missing from Supabase secrets.");
        throw new Error("Lumina Auth Error: Missing GROQ_API_KEY in Supabase secrets. Please run 'supabase secrets set GROQ_API_KEY=your_key'.");
    }

    const safeJD = jdText.substring(0, 15000); 
    const fallbackModels = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "gemma2-9b-it"
    ];

    let resultText = "";
    let lastError = "";

    // ── NAKED SCHEMA (No Defaults) ──
    const nakedSchema = {
      valid: "boolean", title: "string",
      skills: [{ category: "string", skill: "string", importance: "number (0-100)" }],
      requirements: { education: ["string"], experience: "string", soft_skills: ["string"], agreements: ["string"] },
      grade: { 
        score: "number (0-100)", letter: "string (S,A,B,C,D,F)", summary: "string", 
        breakdown: { clarity: "0-20", realistic: "0-15", compensation: "0-15", red_flags: "0-15", benefits: "0-10", growth: "0-10", inclusivity: "0-10", readability: "0-10" }, 
        plain_english_summary: ["string"] 
      },
      red_flags: [{ phrase: "string", intensity: "number (0-100)", note: "string" }],
      logistics: { 
        salary_range: { min: "number", max: "number", currency: "string", estimate: "boolean", note: "string" }, 
        work_arrangement: { remote_friendly: "yes/no/partial", office_presence: "string", flexible_hours: "boolean" },
        archetype: { label: "string", description: "string", primary_focus: "string", primary_tool: "string", match_score: "0-100" }
      },
      bonus_pulse: { ghost_job_probability: "0-100", desperation_meter: "0-100", skill_rarity: "0-100", interview_difficulty: "0-100" },
      role_reality: { iceberg_above: ["string"], iceberg_below: ["string"] },
      deep_dive: { day_in_life: [{ time: "string", task: "string" }] },
      interview_kit: { 
        questions: [{ question: "string", type: "technical/behavioral", tip: "string", target_answer: "string" }],
        reverse_questions: ["string"]
      },
      resume_help: { keywords: ["string"], bullets: ["string"] }
    };

    for (const model of fallbackModels) {
        try {
            console.log(`Lumina Engine: Activating Forensic Scan with ${model}...`);
            const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: `You are the Lumina Forensic Intelligence Architect. 
Your goal is to deconstruct JDs into hyper-accurate data structures.

MANDATORY RULES:
1. ESTIMATION IS COMPULSORY: Never return 0, null, or empty for scores or salary. If the JD is vague, use your deep knowledge of the market to provide highly probable estimates.
2. CURRENCY: India roles = INR. 
3. VERDICT: The "grade.summary" MUST be a unique, insightful sentence. The "grade.plain_english_summary" MUST contain EXACTLY 5 key insight points.
4. RED FLAGS: You MUST identify EXACTLY 2 red flags in "red_flags". If none exist, identify subtle competitive risks or growth bottlenecks.
5. INTERVIEW KIT: "interview_kit.questions" MUST contain EXACTLY 10 diverse questions. "interview_kit.reverse_questions" MUST contain EXACTLY 5 strategic questions for the candidate to ask.
6. STRATEGIC DEFICIT: "resume_help.keywords" MUST contain EXACTLY 10-12 high-impact ATS keywords extracted from the JD.
7. ICEBERG: The "role_reality" must contain non-obvious truths about working in this domain.

RETURN ONLY RAW JSON.` },
                        { role: "user", content: `ACT ON THIS JD:
###
${safeJD}
###

OUTPUT JSON FORMAT:
${JSON.stringify(nakedSchema)}` }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.3,
                    max_tokens: 4000,
                }),
            });

            if (!groqResponse.ok) {
                const status = groqResponse.status;
                if (status === 429 || status === 400 || status === 404) {
                    lastError = `Model ${model} unavailable (${status})`;
                    continue; 
                }
                const errorBody = await groqResponse.text();
                throw new Error(`AI Provider Error (${status}): ${errorBody.substring(0, 100)}`);
            }

            const data = await groqResponse.json();
            resultText = data.choices?.[0]?.message?.content;
            if (resultText && resultText.trim().startsWith('{')) break;
        } catch (err: unknown) {
            lastError = err instanceof Error ? err.message : String(err);
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
    
    // Merge with original schema to ensure all fields exist for frontend
    const finalResult = { ...JD_SCHEMA, ...parsed };
    
    return new Response(JSON.stringify(finalResult), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "System Exception";
    return new Response(JSON.stringify({ error: `Lumina Engine Fault: ${errorMsg}`, details: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
