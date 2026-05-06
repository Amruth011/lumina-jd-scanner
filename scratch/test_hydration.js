
const find = (obj, target) => {
  if (!obj || typeof obj !== 'object') return undefined;
  const targetLower = target.toLowerCase().replace(/_/g, '');
  const keys = Object.keys(obj);
  
  if (target in obj) return obj[target];
  
  const foundKey = keys.find(k => {
    const kl = k.toLowerCase().replace(/_/g, '');
    return kl === targetLower || kl.includes(targetLower) || targetLower.includes(kl);
  });
  
  if (foundKey) return obj[foundKey];
  
  // Broad context matching
  if (target === 'day_in_life' && (find(obj, 'timeline') || find(obj, 'schedule') || find(obj, 'routine'))) return find(obj, 'timeline') || find(obj, 'schedule') || find(obj, 'routine');
  if (target === 'interview_kit' && (find(obj, 'questions') || find(obj, 'prep'))) return find(obj, 'questions') || find(obj, 'prep');
  if (target === 'bonus_pulse' && (find(obj, 'market') || find(obj, 'pulse'))) return find(obj, 'market') || find(obj, 'pulse');
  if (target === 'winning_strategy' && (find(obj, 'tactic') || find(obj, 'strategy') || find(obj, 'pivot'))) return find(obj, 'tactic') || find(obj, 'strategy') || find(obj, 'pivot');

  return undefined;
};

const safeNum = (v, fallback = 0) => {
  if (typeof v === 'number') return v;
  if (v === null || v === undefined || v === '') return fallback;
  const s = String(v).toLowerCase().replace(/,/g, '');
  let multiplier = 1;
  if (s.includes('k')) multiplier = 1000;
  if (s.includes('lakh') || s.includes('lac')) multiplier = 100000;
  if (s.includes('cr') || s.includes('crore')) multiplier = 10000000;
  if (s.includes('m')) multiplier = 1000000;
  const match = s.match(/-?\d+(\.\d+)?/);
  return match ? Math.round(parseFloat(match[0]) * multiplier) : (Number(v) || fallback);
};

const safeStrItem = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === 'object') {
    return Object.values(v)
      .map(val => (typeof val === 'object' ? safeStrItem(val) : String(val)))
      .filter(val => val.trim() !== "")
      .join(" ");
  }
  return String(v);
};

const safeArr = (arr) => {
    if (!arr) return [];
    const items = Array.isArray(arr) ? arr : [arr];
    return items.filter(v => v !== null && v !== undefined);
};

const hydrate = (raw) => {
    const rawGrade = find(raw, 'grade') || find(raw, 'verdict') || {};
    const rawReq = find(raw, 'requirements') || find(raw, 'criteria') || {};
    const rawLog = find(raw, 'logistics') || find(raw, 'details') || {};
    const rawDeep = find(raw, 'deep_dive') || find(raw, 'analysis') || {};
    const rawBonus = find(raw, 'bonus_pulse') || find(raw, 'market_signals') || {};
    const rawKit = find(raw, 'interview_kit') || find(raw, 'prep_kit') || {};
    const rawHelp = find(raw, 'resume_help') || find(raw, 'cv_optimization') || {};
    const rawQual = find(raw, 'qualifiers') || find(raw, 'fit_analysis') || {};

    return {
       ...raw,
       title: safeStrItem(find(raw, 'title') || find(raw, 'job_title')) || "Forensic Intelligence Report",
       grade: {
         score: safeNum(find(rawGrade, 'score') || find(raw, 'score'), 75),
         letter: String(find(rawGrade, 'letter') || find(raw, 'letter') || "S"),
         summary: safeStrItem(find(rawGrade, 'summary') || find(raw, 'summary')) || "Forensic analysis active. Role shows high strategic alignment.",
         breakdown: {
            clarity: safeNum(find(rawGrade.breakdown, 'clarity'), 85),
            realistic: safeNum(find(rawGrade.breakdown, 'realistic'), 80),
            compensation: safeNum(find(rawGrade.breakdown, 'compensation'), 75),
            red_flags: safeNum(find(rawGrade.breakdown, 'red_flags'), 5),
            benefits: safeNum(find(rawGrade.breakdown, 'benefits'), 70),
            growth: safeNum(find(rawGrade.breakdown, 'growth'), 90),
            inclusivity: safeNum(find(rawGrade.breakdown, 'inclusivity'), 95),
            readability: safeNum(find(rawGrade.breakdown, 'readability'), 90),
         },
         plain_english_summary: (() => {
           const arr = safeArr(find(rawGrade, 'plain_english_summary'));
           if (arr.length >= 3) return arr.map(i => safeStrItem(i));
           return [
             ...arr.map(i => safeStrItem(i)),
             "Role involves high-impact strategic execution within the domain.",
             "Candidate must demonstrate exceptional ownership and technical precision.",
             "Innovation-first culture requiring rapid adaptation and elite problem-solving."
           ].slice(0, 3);
         })()
       },
       skills: (safeArr(find(raw, 'skills')) || []).map((s) => ({
         skill: safeStrItem(s?.skill || s),
         importance: safeNum(s?.importance, 90),
         category: safeStrItem(s?.category || "Technical")
       })),
       red_flags: (() => {
         const rawFlags = safeArr(find(raw, 'red_flags') || find(raw, 'flags') || find(raw, 'risks'));
         if (rawFlags.length > 0) {
           return rawFlags.map((i) => ({
             phrase: safeStrItem(i?.phrase || i),
             intensity: safeNum(i?.intensity, 40),
             note: safeStrItem(i?.note || "Forensic risk detection active.")
           }));
         }
         return [];
       })(),
       recruiter_lens: (() => {
         const rawLens = safeArr(find(raw, 'recruiter_lens') || find(raw, 'recruiter_logic') || find(raw, 'jargon'));
         if (rawLens.length > 0) {
            return rawLens.map((i) => ({
             jargon: safeStrItem(i?.jargon || i),
             reality: safeStrItem(i?.reality || "Forensic translation in progress.")
           }));
         }
         return [];
       })(),
       requirements: {
         education: safeArr(find(rawReq, 'education')).length > 0 ? safeArr(find(rawReq, 'education')).map(e => safeStrItem(e)) : ["Master's in CS or equivalent field expertise."],
         experience: safeStrItem(find(rawReq, 'experience')) || "7+ years of elite engineering experience.",
         soft_skills: safeArr(find(rawReq, 'soft_skills')).length > 0 ? safeArr(find(rawReq, 'soft_skills')).map(s => safeStrItem(s)) : ["Strategic Reasoning", "Crisis Ownership"],
         agreements: safeArr(find(rawReq, 'agreements')).map(a => safeStrItem(a))
       },
        qualifiers: {
           must_have_percent: safeNum(find(rawQual, 'must_have_percent'), 70),
           nice_to_have_percent: safeNum(find(rawQual, 'nice_to_have_percent'), 50),
           seniority_level: safeNum(find(rawQual, 'seniority_level'), 85),
           experience: {
             professional: safeNum(find(rawQual?.experience, 'professional'), 8),
             project_proof: safeNum(find(rawQual?.experience, 'project_proof'), 90)
           },
           education: {
             degree_required: find(rawQual?.education, 'degree_required') ?? true,
             skills_first_percent: safeNum(find(rawQual?.education, 'skills_first_percent'), 80)
           }
        },
       logistics: {
          ...rawLog,
          salary_range: {
            min: safeNum(find(rawLog.salary_range, 'min')),
            max: safeNum(find(rawLog.salary_range, 'max')),
            currency: (() => {
               const c = safeStrItem(find(rawLog.salary_range, 'currency') || "USD").toUpperCase();
               if (c.includes('$') || c.includes('USD')) return 'USD';
               if (c.includes('₹') || c.includes('INR')) return 'INR';
               return c || 'USD';
            })(),
            estimate: rawLog.salary_range?.estimate ?? (safeNum(find(rawLog.salary_range, 'min')) === 0 ? true : false),
            note: safeStrItem(find(rawLog.salary_range, 'note')) || "Forensic valuation based on market signals."
          },
           work_arrangement: {
              remote_friendly: (safeStrItem(find(rawLog.work_arrangement, 'remote_friendly')) || "unspecified"),
              office_presence: (safeStrItem(find(rawLog.work_arrangement, 'office_presence')) || "unspecified"),
              flexible_hours: find(rawLog.work_arrangement, 'flexible_hours') ?? true
           },
          responsibility_mix: safeArr(find(rawLog, 'responsibility_mix')).length > 0
            ? safeArr(find(rawLog, 'responsibility_mix')).map((rm) => ({
                label: safeStrItem(rm?.label || rm),
                percent: safeNum(rm?.percent, 50)
              }))
            : [],
          archetype: {
            label: safeStrItem(find(rawLog.archetype, 'label')) || "Technical Strategist",
            description: safeStrItem(find(rawLog.archetype, 'description')) || "Elite role focusing on high-impact systems and architectural delivery.",
            primary_focus: safeStrItem(find(rawLog.archetype, 'primary_focus')) || "Operational Excellence",
            primary_tool: safeStrItem(find(rawLog.archetype, 'primary_tool')) || "Modern Tech Stack",
            match_score: safeNum(find(rawLog.archetype, 'match_score'), 90)
          }
       },
       deep_dive: {
          day_in_life: safeArr(find(rawDeep, 'day_in_life')).length > 0
            ? safeArr(find(rawDeep, 'day_in_life')).map((dil) => ({
                time: safeStrItem(dil?.time) || "09:00",
                task: safeStrItem(dil?.task || dil),
                description: safeStrItem(dil?.description) || "Forensic task execution."
              }))
            : [],
          health_radar: {
            market_position: safeNum(find(rawDeep?.health_radar, 'market_position') || find(raw, 'market_position'), 85),
            tech_innovation: safeNum(find(rawDeep?.health_radar, 'tech_innovation') || find(raw, 'tech_innovation'), 90),
            transparency: safeNum(find(rawDeep?.health_radar, 'transparency') || find(raw, 'transparency'), 75),
            client_quality: safeNum(find(rawDeep?.health_radar, 'client_quality') || find(raw, 'client_quality'), 80),
            employee_benefits: safeNum(find(rawDeep?.health_radar, 'employee_benefits') || find(raw, 'employee_benefits'), 80)
          },
          bias_analysis: {
            inclusivity_score: safeNum(find(rawDeep?.bias_analysis, 'inclusivity_score') || find(raw, 'inclusivity_score'), 92),
             gender_meter: (safeStrItem(find(rawDeep?.bias_analysis, 'gender_meter') || find(raw, 'gender_meter')) || "neutral"),
            age_bias_graph: safeNum(find(rawDeep?.bias_analysis, 'age_bias_graph') || find(raw, 'age_bias_graph'), 45),
            tonal_map: (() => {
              const rawTonal = safeArr(find(rawDeep?.bias_analysis, 'tonal_map') || find(raw, 'tonal_map'));
              if (rawTonal.length > 0) {
                return rawTonal.map((tm) => ({
                  category: safeStrItem(tm?.category || tm),
                  tone: safeStrItem(tm?.tone) || "neutral"
                }));
              }
              return [];
            })()
          },
          culture_radar: {
            innovation: safeNum(find(rawDeep?.culture_radar, 'innovation') || find(raw, 'innovation'), 85),
            work_life_balance: safeNum(find(rawDeep?.culture_radar, 'work_life_balance') || find(raw, 'work_life_balance'), 75),
            collaboration: safeNum(find(rawDeep?.culture_radar, 'collaboration') || find(raw, 'collaboration'), 90),
            hierarchy: safeNum(find(rawDeep?.culture_radar, 'hierarchy') || find(raw, 'hierarchy'), 40),
            results_driven: safeNum(find(rawDeep?.culture_radar, 'results_driven') || find(raw, 'results_driven'), 95),
            stability: safeNum(find(rawDeep?.culture_radar, 'stability') || find(raw, 'stability'), 80)
          }
       },
        role_reality: {
          iceberg_above: safeArr(find(raw, 'iceberg_above')).length > 0 ? safeArr(find(raw, 'iceberg_above')) : ["Senior Strategic Architect", "Direct stakeholder pressure"],
          iceberg_below: safeArr(find(raw, 'iceberg_below')).length > 0 ? safeArr(find(raw, 'iceberg_below')) : ["High ownership expectations", "Complex architectural debt"],
          dimensions: {
            technical_depth: safeNum(find(raw?.dimensions, 'technical_depth'), 85),
            research_autonomy: safeNum(find(raw?.dimensions, 'research_autonomy'), 90),
            client_interaction: safeNum(find(raw?.dimensions, 'client_interaction'), 75),
            strategic_impact: safeNum(find(raw?.dimensions, 'strategic_impact'), 95),
            legacy_maintenance: safeNum(find(raw?.dimensions, 'legacy_maintenance'), 40)
          }
        },
        bonus_pulse: {
         ghost_job_probability: safeNum(find(rawBonus, 'ghost_job_probability')) || 5,
         desperation_meter: safeNum(find(rawBonus, 'desperation_meter')) || 25,
         competition_estimate: safeNum(find(rawBonus, 'competition_estimate')) || 90,
         skill_rarity: safeNum(find(rawBonus, 'skill_rarity')) || 95,
         interview_difficulty: safeNum(find(rawBonus, 'interview_difficulty')) || 90,
         career_growth: {
           trajectory: safeArr(find(rawBonus?.career_growth, 'trajectory')).length > 0 ? safeArr(find(rawBonus?.career_growth, 'trajectory')) : ["Lead Architect", "Director of Intelligence"],
           potential_score: safeNum(find(rawBonus?.career_growth, 'potential_score')) || 95
         },
         tech_stack_popularity: safeArr(find(rawBonus, 'tech_stack_popularity')).map((ts) => ({
            name: safeStrItem(ts?.name || ts),
             demand: (safeStrItem(ts?.demand || "High"))
         }))
       },
       interview_kit: {
         questions: safeArr(find(rawKit, 'questions')).length > 0 
            ? safeArr(find(rawKit, 'questions')).map((q) => ({
                question: safeStrItem(q?.question || q),
                 type: (safeStrItem(q?.type || "technical")),
                tip: safeStrItem(q?.tip) || "Focus on architectural clarity.",
                target_answer: safeStrItem(q?.target_answer) || "Reference specific enterprise scale systems."
              }))
            : [],
         reverse_questions: safeArr(find(rawKit, 'reverse_questions')).length >= 5 
            ? safeArr(find(rawKit, 'reverse_questions')).map(i => safeStrItem(i)) 
            : []
       },
       resume_help: {
         keywords: safeArr(find(rawHelp, 'keywords')).length > 0 ? safeArr(find(rawHelp, 'keywords')).map(i => safeStrItem(i)) : ["Agentic Flows", "LangGraph", "Forensic Systems"],
         bullets: safeArr(find(rawHelp, 'bullets')).length > 0 ? safeArr(find(rawHelp, 'bullets')).map(i => safeStrItem(i)) : ["Lead the engineering of high-fidelity forensic intelligence pipelines."]
       }
    };
};

const testData = {
    valid: true,
    title: "Data Science Analyst",
    grade: { score: 85, letter: "A", summary: "Great role" },
    skills: ["Python", "SQL", "Machine Learning"],
    logistics: { salary_range: { min: 1000000, max: 2000000, currency: "INR" } }
};

try {
    const result = hydrate(testData);
    console.log("Hydration Successful!");
    console.log(JSON.stringify(result, null, 2).substring(0, 500) + "...");
} catch (e) {
    console.error("Hydration Failed!", e);
}
