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

export interface Deduction {
  reason: string;
  percent: number;
}

export interface TailoredSnippet {
  professional_summary: string;
  experience_bullets: string[];
}

export interface ResumeGapResult {
  overall_match: number;
  skill_matches: SkillMatch[];
  deductions: Deduction[];
  summary: string;
  tailored_resume_snippets?: TailoredSnippet;
}

export interface DecodeResult {
  title: string;
  skills: Skill[];
  requirements: JdRequirements;
  winning_strategy: WinningStep[];
}

export interface JdVaultEntry {
  id: string;
  title: string;
  skills_json: Skill[];
  raw_text: string;
  created_at: string;
}
