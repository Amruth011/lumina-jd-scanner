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

export interface JdGrade {
  score: number;
  letter: string;
  summary: string;
  breakdown: {
    clarity: number;
    realistic: number;
    compensation: number;
    red_flags: number;
    benefits: number;
    growth: number;
  };
}

export interface InterviewQuestion {
  question: string;
  type: "technical" | "behavioral" | "situational";
  target_answer?: string;
}

export interface RoleReality {
  iceberg_above: string[];
  iceberg_below: string[];
  archetype: string;
  dimensions: {
    technical_depth: number;
    research_autonomy: number;
    client_interaction: number;
    strategic_impact: number;
  };
}

export interface DecodeResult {
  title: string;
  skills: Skill[];
  requirements: JdRequirements;
  winning_strategy: WinningStep[];
  // Phase 2: Ultra Insights
  grade?: JdGrade;
  recruiter_lens?: RecruiterInsight[];
  time_distribution?: TimeAllocation[];
  role_reality?: RoleReality;
  interview_prep?: {
    questions: InterviewQuestion[];
    interviewer_questions: string[];
  };
  salary_estimate?: {
    min: number;
    max: number;
    currency: string;
    source_note: string;
  };
  bonus_insights?: {
    ghost_job_probability: number;
    desperation_meter: number;
    skill_rarity: number;
    career_growth: string[];
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
export type VaultItemType = 'professional' | 'project' | 'education' | 'certification';

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

// ── NEW: Tailoring types ──
export interface TailorRequest {
  jd_title: string;
  jd_skills: Skill[];
  company_name?: string;
  vault_items: VaultItem[];
  personal_info: UserProfileWithVault;
}
