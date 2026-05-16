export interface Skill {
  category: string;
  skill: string;
  importance: number;
}

export interface JdRequirements {
  education: string[];
  experience: string;
  soft_skills: string[];
  agreements: string[];
}

export interface WinningStep {
  title: string;
  description: string;
}

export interface SkillMatch {
  skill: string;
  match_percent: number;
  verdict: "strong" | "partial" | "missing";
  note: string;
}

// ── NEW: Lumina 2.0 Ultra-Intelligence Types ──

export interface RecruiterInsight {
  jargon: string;
  reality: string;
}

export interface TimeAllocation {
  task: string;
  percent: number;
}

// ── NEW: Lumina 2.0 "The Real Deal" Intelligence Types ──

export interface DetailedJdGrade {
  score: number;
  letter: string; // e.g., "C", "A"
  summary: string;
  breakdown: {
    clarity: number;      // /20
    realistic: number;    // /15
    compensation: number; // /15
    red_flags: number;    // /15
    benefits: number;     // /10
    growth: number;       // /10
    inclusivity: number; // /10
    readability: number;  // /5
  };
  plain_english_summary: string[]; // 5 bullet points
}

export interface RedFlag {
  phrase: string;
  intensity: number; // 0-100
  note?: string;
}

export interface QualifierInsights {
  must_have_percent: number;
  nice_to_have_percent: number;
  seniority_level: number; // 0-100 gauge
  experience: {
    professional: number;
    project_proof: number;
  };
  education: {
    degree_required: boolean;
    skills_first_percent: number;
  };
}

export interface WorkLogistics {
  salary_range?: {
    min: number;
    max: number;
    currency: string;
    estimate: boolean;
    note: string;
  };
  work_arrangement: {
    remote_friendly: "yes" | "no" | "partial" | "unspecified";
    office_presence: "none" | "occasional" | "full" | "unspecified";
    flexible_hours: boolean;
  };
  responsibility_mix: { label: string; percent: number }[];
  archetype: {
    label: string;
    description: string;
    primary_focus: string;
    primary_tool: string;
    match_score: number;
  };
  hard_soft_ratio: {
    hard: number; // e.g. 85
    soft: number; // e.g. 15
  };
}

export interface RoleReality {
  iceberg_above: string[];
  iceberg_below: string[];
  dimensions: {
    technical_depth: number;
    research_autonomy: number;
    client_interaction: number;
    strategic_impact: number;
    legacy_maintenance: number;
  };
}

export interface CompanyDeepDive {
  day_in_life: {
    time: string;
    task: string;
    description: string;
  }[];
  health_radar: {
    market_position: number;
    tech_innovation: number;
    transparency: number;
    client_quality: number;
    employee_benefits: number;
  };
  bias_analysis: {
    inclusivity_score: number;
    gender_meter: "masculine" | "neutral" | "feminine";
    age_bias_graph: number; // 0 (younger) to 100 (experienced)
    tonal_map: {
      category: string;
      tone: string;
    }[];
  };
  culture_radar: {
    innovation: number;
    work_life_balance: number;
    collaboration: number;
    hierarchy: number;
    results_driven: number;
    stability: number;
  };
}

export interface BonusPulse {
  ghost_job_probability: number;
  desperation_meter: number;
  competition_estimate: number;
  skill_rarity: number;
  interview_difficulty: number;
  career_growth: {
    trajectory: string[];
    potential_score: number;
  };
  tech_stack_popularity: {
    name: string;
    demand: "Standard" | "High" | "Extreme";
  }[];
}

export interface DecodeResult {
  valid?: boolean;
  title: string;
  skills: Skill[];
  requirements: JdRequirements;
  winning_strategy: WinningStep[];
  // Intelligence Expansion
  grade: DetailedJdGrade;
  red_flags: RedFlag[];
  recruiter_lens: RecruiterInsight[];
  qualifiers: QualifierInsights;
  logistics: WorkLogistics;
  role_reality: RoleReality;
  deep_dive: CompanyDeepDive;
  bonus_pulse: BonusPulse;
  interview_kit: {
    questions: InterviewQuestion[];
    reverse_questions: string[];
  };
  resume_help: {
    keywords: string[];
    bullets: string[];
  };
  jd_rewrite?: {
    highlights: { text: string; color: "skill" | "leverage" | "caution" }[];
  };
}

export interface JdVaultEntry {
  id: string;
  title: string;
  skills_json: Skill[];
  raw_text: string;
  created_at: string;
}

// ── NEW: ATS Resume Generator types ──
export interface GeneratedResumeSection {
  heading: string;
  content: string;
  bullets?: string[];
}

export interface GeneratedResume {
  professional_summary: string;
  skills_section: string[];
  experience: GeneratedResumeSection[];
  education: string[];
  certifications?: string[];
  awards?: string[];
  products?: GeneratedResumeSection[];
  projects?: GeneratedResumeSection[];
  leadership?: GeneratedResumeSection[];
}

// ── NEW: ATS Score Simulator types ──
export interface ATSVerdict {
  pass: boolean;
  score: number;
  keyword_match_rate: number;
  section_completeness: number;
  formatting_score: number;
  reasons: string[];
  tips: string[];
}
// ── NEW: Master Vault types ──
export type VaultItemType = 'professional' | 'project' | 'product' | 'education' | 'certification' | 'leadership' | 'award';

export interface VaultItem {
  id: string;
  user_id: string;
  type: VaultItemType;
  title: string;
  organization: string;
  period: string;
  description: string;
  bullets: string[];
  skills: string[];
  is_quantified?: boolean; // Track if this entry has metrics/numbers
  github_link?: string;
  live_link?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileWithVault {
  id: string;
  email?: string;
  display_name?: string;
  full_name?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string; // Enhanced portfolio support
  website_url?: string;
  summary_master?: string;
  created_at?: string;
}

// ── NEW: Resume Analysis types ──
export interface ResumeDeduction {
  reason: string;
  percent: number;
  fix_snippet?: string;
}

export type Deduction = ResumeDeduction; // Alias for compatibility

export interface ResumeGapResult {
  overall_match: number;
  summary: string;
  deductions: ResumeDeduction[];
  skill_matches?: SkillMatch[];
  tailored_resume_snippets?: string[];
  actionable_directives?: { action: string; description: string }[];
}

export interface InterviewQuestion {
  question: string;
  type: "technical" | "behavioral" | "situational";
  tip: string;
  target_answer?: string;
}

// ── NEW: Tailoring types ──
export interface TailorRequest {
  jd_title: string;
  jd_skills: Skill[];
  company_name?: string;
  vault_items: VaultItem[];
  personal_info: UserProfileWithVault;
}
