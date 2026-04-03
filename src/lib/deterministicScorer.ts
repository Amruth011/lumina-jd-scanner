/**
 * Deterministic Resume Scorer v2
 * ===============================
 * Pure client-side scoring engine — 100% consistent, 100% honest.
 * Same resume + same JD skills = EXACT same score, every single time.
 *
 * v2 fixes: Strict word-boundary matching to prevent false positives.
 * Short terms like "R", "Go", "AI", "ML" are matched with word boundaries
 * to avoid matching inside unrelated words.
 */

import type { Skill } from "@/types/jd";

// ── Types ──
export interface DeterministicSkillMatch {
  skill: string;
  match_percent: number;
  verdict: "strong" | "partial" | "missing";
  note: string;
  matched_terms: string[];
}

export interface DeterministicScoreResult {
  overall_match: number;
  skill_matches: DeterministicSkillMatch[];
  deductions: { reason: string; percent: number }[];
}

// ── Synonym / Alias Dictionary ──
// ONLY exact synonyms. No fuzzy matching.
const SYNONYM_MAP: Record<string, string[]> = {
  // Languages
  "javascript": ["js", "ecmascript", "es6"],
  "typescript": ["ts"],
  "python": ["python3"],
  "java": ["jdk", "jre", "j2ee", "openjdk"],
  "c#": ["csharp", "c sharp", ".net", "dotnet", "asp.net"],
  "c++": ["cpp", "cplusplus"],
  "golang": ["go lang"],
  "ruby": [],
  "rust": ["rustlang"],
  "swift": ["swiftui"],
  "kotlin": [],
  "php": [],
  "scala": [],
  "sql": ["tsql", "t-sql", "plsql", "pl/sql"],

  // Frontend Frameworks
  "react": ["reactjs", "react.js"],
  "angular": ["angularjs", "angular.js"],
  "vue": ["vuejs", "vue.js", "vue js"],
  "svelte": ["sveltekit"],
  "next.js": ["nextjs", "next js"],
  "jquery": [],

  // Backend Frameworks
  "node.js": ["nodejs", "node js"],
  "express": ["expressjs", "express.js"],
  "django": ["django rest framework", "drf"],
  "flask": [],
  "spring boot": ["springboot"],
  "spring": ["spring boot", "springboot", "spring framework", "spring mvc"],
  "fastapi": ["fast api"],
  "ruby on rails": ["rails", "ror"],

  // Databases
  "postgresql": ["postgres", "psql"],
  "mysql": ["mariadb"],
  "mongodb": ["mongo", "mongoose"],
  "redis": [],
  "elasticsearch": ["elastic search", "elk"],
  "cassandra": [],
  "dynamodb": ["dynamo db"],
  "sqlite": [],
  "oracle": ["oracle db"],
  "sql server": ["mssql", "ms sql", "microsoft sql"],
  "firebase": ["firestore"],
  "supabase": [],

  // Cloud / DevOps
  "aws": ["amazon web services"],
  "azure": ["microsoft azure", "azure devops"],
  "gcp": ["google cloud", "google cloud platform"],
  "docker": ["dockerfile", "docker compose", "docker-compose", "containerization"],
  "kubernetes": ["k8s", "kubectl", "helm"],
  "terraform": ["terragrunt"],
  "ansible": [],
  "jenkins": ["jenkinsfile"],
  "ci/cd": ["cicd", "continuous integration", "continuous deployment", "continuous delivery", "github actions", "gitlab ci"],
  "linux": ["ubuntu", "centos", "rhel", "debian", "fedora"],
  "git": ["github", "gitlab", "bitbucket"],
  "nginx": [],
  "bash": ["shell scripting", "shell script"],

  // Data / ML / AI
  "machine learning": ["ml"],
  "deep learning": ["dl"],
  "artificial intelligence": ["ai"],
  "tensorflow": ["keras"],
  "pytorch": ["torch"],
  "scikit-learn": ["sklearn", "scikit learn"],
  "pandas": [],
  "numpy": [],
  "nlp": ["natural language processing", "spacy", "nltk", "hugging face", "huggingface"],
  "computer vision": ["opencv", "open cv", "yolo", "image recognition", "object detection"],
  "data science": ["data analysis", "data analytics"],
  "power bi": ["powerbi"],
  "tableau": [],
  "apache spark": ["spark", "pyspark"],
  "hadoop": ["hdfs", "mapreduce", "hive"],
  "etl": ["data pipeline", "data pipelines", "airflow"],
  "llm": ["large language model", "large language models", "langchain"],

  // Tools / Practices
  "agile": ["scrum", "kanban"],
  "rest api": ["restful", "restful api", "restful apis", "rest apis"],
  "graphql": ["apollo graphql"],
  "microservices": ["micro services", "microservice architecture"],
  "unit testing": ["jest", "pytest", "junit", "mocha"],
  "e2e testing": ["cypress", "selenium", "playwright"],
  "figma": ["sketch", "adobe xd"],
  "oauth": ["oauth2", "openid connect", "saml"],
  "jwt": ["json web token"],
  "websocket": ["websockets", "socket.io", "socketio"],
  "rabbitmq": ["message queue", "message broker", "amqp"],
  "kafka": ["apache kafka", "event streaming"],
  "grpc": ["protocol buffers", "protobuf"],
  "jira": [],
  "confluence": [],
};

// Build reverse-lookup: synonym → canonical skill
const REVERSE_SYNONYMS: Record<string, string> = {};
for (const [canonical, synonyms] of Object.entries(SYNONYM_MAP)) {
  for (const syn of synonyms) {
    REVERSE_SYNONYMS[syn.toLowerCase()] = canonical;
  }
}

// ── Text Normalization ──
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Word-boundary match: checks if `term` appears as a standalone word/phrase
 * in `text`, NOT as a substring of a larger word.
 *
 * Examples:
 *   wordBoundaryMatch("ai", "i work with ai tools") → true
 *   wordBoundaryMatch("ai", "email domain") → false
 *   wordBoundaryMatch("r", "i use r for statistics") → true
 *   wordBoundaryMatch("r", "programmer with experience") → false
 */
function wordBoundaryMatch(term: string, text: string): boolean {
  // Escape regex special chars in the term
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Use word boundary for alphanumeric terms, lookaround for special chars
  const pattern = new RegExp(`(?:^|[\\s,;:!?()\\[\\]{}\\/|•·\\-])${escaped}(?:$|[\\s,;:!?()\\[\\]{}\\/|•·\\-])`, "i");
  // Also check start/end of string
  const patternExact = new RegExp(`^${escaped}$`, "i");
  return pattern.test(` ${text} `) || patternExact.test(text.trim());
}

/**
 * Check if a term exists as a standalone token or phrase in the resume.
 * For short terms (≤3 chars), uses strict word-boundary matching.
 * For longer terms, also allows phrase containment with boundary checks.
 */
function termExistsInResume(term: string, resumeNormalized: string): boolean {
  const termLower = term.toLowerCase().trim();
  if (termLower.length === 0) return false;

  // Always use word-boundary matching — prevents false positives
  return wordBoundaryMatch(termLower, resumeNormalized);
}

// ── Skill Matching Logic ──
function matchSkillInResume(
  skillName: string,
  resumeNormalized: string
): { matched: boolean; partial: boolean; matchedTerms: string[] } {
  const matchedTerms: string[] = [];

  // Handle OR skills: "Python OR R OR Julia"
  const orParts = skillName.split(/\s+OR\s+/i);
  if (orParts.length > 1) {
    for (const part of orParts) {
      const result = matchSingleSkill(part.trim(), resumeNormalized);
      if (result.matched) {
        return { matched: true, partial: false, matchedTerms: result.matchedTerms };
      }
      if (result.partial) matchedTerms.push(...result.matchedTerms);
    }
    if (matchedTerms.length > 0) {
      return { matched: true, partial: false, matchedTerms };
    }
    return { matched: false, partial: false, matchedTerms: [] };
  }

  // Handle slash-separated skills: "Python/TypeScript"
  const slashParts = skillName.split(/\//);
  if (slashParts.length > 1 && slashParts.every(p => p.trim().length > 1)) {
    for (const part of slashParts) {
      const result = matchSingleSkill(part.trim(), resumeNormalized);
      if (result.matched) {
        return { matched: true, partial: false, matchedTerms: result.matchedTerms };
      }
      if (result.partial) matchedTerms.push(...result.matchedTerms);
    }
    if (matchedTerms.length > 0) {
      return { matched: true, partial: false, matchedTerms };
    }
    return { matched: false, partial: false, matchedTerms: [] };
  }

  return matchSingleSkill(skillName, resumeNormalized);
}

function matchSingleSkill(
  skill: string,
  resumeNormalized: string
): { matched: boolean; partial: boolean; matchedTerms: string[] } {
  const skillLower = normalizeText(skill);

  // 1. Direct word-boundary match of the skill in resume
  if (termExistsInResume(skillLower, resumeNormalized)) {
    return { matched: true, partial: false, matchedTerms: [skill] };
  }

  // 2. Check EXACT synonyms only (no fuzzy synonym expansion)
  const synonymsToCheck: string[] = [];

  // If this skill is a canonical key in SYNONYM_MAP
  if (SYNONYM_MAP[skillLower]) {
    synonymsToCheck.push(...SYNONYM_MAP[skillLower]);
  }

  // If this skill is itself a known synonym, get canonical + siblings
  if (REVERSE_SYNONYMS[skillLower]) {
    const canonical = REVERSE_SYNONYMS[skillLower];
    synonymsToCheck.push(canonical);
    if (SYNONYM_MAP[canonical]) {
      synonymsToCheck.push(...SYNONYM_MAP[canonical]);
    }
  }

  // Check each synonym with word-boundary matching
  const uniqueSynonyms = [...new Set(synonymsToCheck.map(s => s.toLowerCase()))];
  for (const syn of uniqueSynonyms) {
    if (termExistsInResume(syn, resumeNormalized)) {
      return { matched: true, partial: false, matchedTerms: [syn] };
    }
  }

  // 3. Partial match: For multi-word skills, check if significant words appear
  const skillWords = skillLower.split(/\s+/).filter(w => w.length > 2);
  if (skillWords.length > 1) {
    const partialMatches: string[] = [];
    for (const word of skillWords) {
      if (termExistsInResume(word, resumeNormalized)) {
        partialMatches.push(word);
      }
    }
    // Need majority of words to match for partial credit
    if (partialMatches.length > 0 && partialMatches.length >= Math.ceil(skillWords.length * 0.5)) {
      return { matched: false, partial: true, matchedTerms: partialMatches };
    }
  }

  return { matched: false, partial: false, matchedTerms: [] };
}

// ── Main Scoring Function ──
export function computeDeterministicScore(
  resumeText: string,
  skills: Skill[]
): DeterministicScoreResult {
  if (!resumeText || !skills?.length) {
    return { overall_match: 0, skill_matches: [], deductions: [] };
  }

  const resumeNormalized = normalizeText(resumeText);

  const skillMatches: DeterministicSkillMatch[] = [];
  let totalWeight = 0;
  let weightedSum = 0;

  for (const skill of skills) {
    const result = matchSkillInResume(skill.skill, resumeNormalized);

    let verdict: "strong" | "partial" | "missing";
    let matchPercent: number;
    let note: string;

    if (result.matched) {
      verdict = "strong";
      matchPercent = 100;
      note = `Found in resume: ${result.matchedTerms.join(", ")}`;
    } else if (result.partial) {
      verdict = "partial";
      matchPercent = 50;
      note = `Partial match via: ${result.matchedTerms.join(", ")}. Consider adding explicit mention.`;
    } else {
      verdict = "missing";
      matchPercent = 0;
      note = `Not found in resume. Add "${skill.skill}" explicitly.`;
    }

    const importance = skill.importance || 50;
    totalWeight += importance;
    weightedSum += (matchPercent / 100) * importance;

    skillMatches.push({
      skill: skill.skill,
      match_percent: matchPercent,
      verdict,
      note,
      matched_terms: result.matchedTerms,
    });
  }

  // Compute overall weighted score
  const overallMatch = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

  // Generate deductions from missing/partial skills
  const deductions: { reason: string; percent: number }[] = [];

  for (const sm of skillMatches.filter(s => s.verdict === "missing")) {
    const skillDef = skills.find(s => s.skill === sm.skill);
    const importance = skillDef?.importance || 50;
    const deductionPercent = totalWeight > 0 ? Math.round((importance / totalWeight) * 100) : 0;
    if (deductionPercent > 0) {
      deductions.push({ reason: `Missing: ${sm.skill}`, percent: deductionPercent });
    }
  }

  for (const sm of skillMatches.filter(s => s.verdict === "partial")) {
    const skillDef = skills.find(s => s.skill === sm.skill);
    const importance = skillDef?.importance || 50;
    const deductionPercent = totalWeight > 0 ? Math.round(((importance * 0.5) / totalWeight) * 100) : 0;
    if (deductionPercent > 0) {
      deductions.push({ reason: `Partial match: ${sm.skill} — add explicit mention`, percent: deductionPercent });
    }
  }

  // Sort deductions by severity
  deductions.sort((a, b) => b.percent - a.percent);

  // Normalize deductions to sum exactly to (100 - overallMatch)
  const targetDeduction = 100 - overallMatch;
  const rawTotal = deductions.reduce((sum, d) => sum + d.percent, 0);
  if (rawTotal > 0 && targetDeduction > 0) {
    const scale = targetDeduction / rawTotal;
    for (const d of deductions) {
      d.percent = Math.max(1, Math.round(d.percent * scale));
    }
  }

  return {
    overall_match: overallMatch,
    skill_matches: skillMatches,
    deductions,
  };
}
