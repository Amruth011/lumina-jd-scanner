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
  fix_snippet?: string;
}

export interface TailoredSnippet {
  professional_summary: string;
  experience_bullets: string[];
}

export interface ActionableDirective {
  action: "add" | "delete" | "replace" | "edit";
  description: string;
  reasoning: string;
}

export interface ResumeGapResult {
  overall_match: number;
  skill_matches: SkillMatch[];
  deductions: Deduction[];
  summary: string;
  tailored_resume_snippets?: TailoredSnippet;
  actionable_directives?: ActionableDirective[];
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
  full_name?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string; // Enhanced portfolio support
  website_url?: string;
  summary_master?: string;
}

// ── NEW: Tailoring types ──
export interface TailorRequest {
  jd_title: string;
  jd_skills: Skill[];
  company_name?: string;
  vault_items: VaultItem[];
  personal_info: UserProfileWithVault;
}
