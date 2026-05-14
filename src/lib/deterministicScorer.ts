/**
 * Deterministic Resume Scorer v3
 * ===============================
 * Fixes:
 * - Handles parenthetical skill names: "RAG (Retrieval Augmented Generation)"
 * - Handles comma-separated alternatives in parens: "LLMs (OpenAI, Anthropic, Llama)"
 * - Handles hyphenated terms: "LLM-driven" matches "LLM"
 * - Strict word-boundary matching to prevent false positives
 * - 100% deterministic: same input = same output, every time
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
const SYNONYM_MAP: Record<string, string[]> = {
  "javascript": ["js", "ecmascript", "es6"],
  "typescript": ["ts"],
  "python": ["python3"],
  "java": ["jdk", "jre", "j2ee", "openjdk"],
  "c#": ["csharp", "c sharp", ".net", "dotnet", "asp.net"],
  "c++": ["cpp", "cplusplus"],
  "golang": ["go lang"],
  "sql": ["tsql", "t-sql", "plsql", "pl/sql"],
  "react": ["reactjs", "react.js"],
  "angular": ["angularjs", "angular.js"],
  "vue": ["vuejs", "vue.js"],
  "next.js": ["nextjs"],
  "node.js": ["nodejs"],
  "express": ["expressjs", "express.js"],
  "django": ["django rest framework", "drf"],
  "spring boot": ["springboot"],
  "spring": ["spring boot", "springboot", "spring framework"],
  "fastapi": ["fast api"],
  "ruby on rails": ["rails", "ror"],
  "postgresql": ["postgres", "psql"],
  "mysql": ["mariadb"],
  "mongodb": ["mongo", "mongoose"],
  "elasticsearch": ["elastic search", "elk"],
  "dynamodb": ["dynamo db"],
  "sql server": ["mssql", "ms sql"],
  "firebase": ["firestore"],
  "aws": ["amazon web services"],
  "azure": ["microsoft azure", "azure devops"],
  "gcp": ["google cloud", "google cloud platform"],
  "docker": ["dockerfile", "docker compose", "docker-compose", "containerization"],
  "kubernetes": ["k8s", "kubectl", "helm"],
  "terraform": ["terragrunt"],
  "ci/cd": ["cicd", "continuous integration", "continuous deployment", "continuous delivery", "github actions", "gitlab ci"],
  "linux": ["ubuntu", "centos", "rhel", "debian", "fedora"],
  "git": ["github", "gitlab", "bitbucket"],
  "bash": ["shell scripting", "shell script"],
  "machine learning": ["ml"],
  "deep learning": ["dl"],
  "artificial intelligence": ["ai"],
  "tensorflow": ["keras"],
  "pytorch": ["torch"],
  "scikit-learn": ["sklearn", "scikit learn"],
  "nlp": ["natural language processing", "spacy", "nltk", "hugging face", "huggingface"],
  "computer vision": ["opencv", "open cv", "yolo", "image recognition"],
  "data science": ["data analysis", "data analytics"],
  "power bi": ["powerbi"],
  "apache spark": ["spark", "pyspark"],
  "hadoop": ["hdfs", "mapreduce", "hive"],
  "etl": ["data pipeline", "data pipelines", "airflow"],
  "llm": ["llms", "large language model", "large language models"],
  "rag": ["retrieval augmented generation"],
  "agile": ["scrum", "kanban"],
  "rest api": ["restful", "restful api", "rest apis"],
  "graphql": ["apollo graphql"],
  "microservices": ["micro services"],
  "unit testing": ["jest", "pytest", "junit", "mocha"],
  "e2e testing": ["cypress", "selenium", "playwright"],
  "figma": ["sketch", "adobe xd"],
  "oauth": ["oauth2", "openid connect"],
  "jwt": ["json web token"],
  "websocket": ["websockets", "socket.io"],
  "kafka": ["apache kafka"],
  "grpc": ["protocol buffers", "protobuf"],
  "prompt engineering": ["prompt design", "prompt optimization", "prompt engineering"],
  "agentic ai": ["ai agents", "ai agent", "agentic workflows", "agentic systems", "agentic", "ai architecture", "multi-agent", "ai-led", "automation workflows"],
  "multi-step": ["multi step", "multi-step tasks", "complex workflows"],
  "semantic search": ["vector search", "similarity search", "neural search"],
  "langchain": ["lang chain", "lc"],
  "langgraph": ["lang graph", "lg"],
  "openai": ["openai api", "gpt", "chatgpt", "gpt-4", "gpt-3.5"],
  "anthropic": ["claude", "claude-3", "claude-2"],
  "pinecone": ["vector db"],
  "weaviate": ["vector database"],
  "faiss": ["vector index"],
  "pgvector": ["postgres vector"],
  "chromadb": ["chroma db", "chroma"],
  "embeddings": ["embedding", "word vectors"],
  "vector database": ["vector databases", "vector db", "vector dbs"],
  "ai researcher": ["ai research", "ml researcher", "ai scientist"],
  "ai agent builder": ["ai agent developer", "agent builder", "ai automation", "agentic dev"],
  "autogen": ["auto gen", "microsoft autogen"],
  "crewai": ["crew ai"],
  "mastra": [],
  "statistical modeling": ["statistical modelling", "statistics", "statistical analysis", "regression analysis", "hypothesis testing", "bayesian", "frequentist", "statistical methods"],
  "analytical skills": ["analytical", "data analysis", "analysis", "eda", "exploratory data analysis", "insights", "analytical thinking"],
  "problem-solving skills": ["problem solving", "problem-solving", "troubleshooting", "debugging", "solutioning", "critical thinking"],
  "collaboration": ["collaborative", "teamwork", "cross-functional", "stakeholders", "team player", "worked with", "coordinate"],
  "mentorship": ["mentor", "mentoring", "coaching", "guiding", "junior", "guidance", "leadership"],
  "strategic thinking": ["strategy", "strategic", "roadmap", "vision", "direction", "planning", "business objectives"],
  "mathematics": ["math", "maths", "mathematical", "linear algebra", "calculus", "quantitative", "numerical"],
  "statistics": ["statistical", "probability", "distribution", "regression", "hypothesis", "cohort analysis", "a/b testing"],
  "r": ["r programming", "rstudio", "tidyverse", "ggplot", "dplyr"],
  "data analysis": ["data analytics", "eda", "exploratory data analysis", "data science", "data insights", "cohort analysis"],
  "cybersecurity": ["cyber security", "infosec", "information security", "pentest", "penetration testing"],
};

// Build reverse-lookup
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
    .replace(/[()[\]{}]/g, " ")  // strip brackets/parens
    .replace(/[,;:!?•·]/g, " ")  // strip punctuation (keep hyphens, dots, slashes, #, +)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Word-boundary match: checks if `term` appears as a standalone word/phrase.
 * "ai" matches in "work with ai tools" but NOT in "email" or "plain".
 * "llm" matches in "llm-driven" (hyphens act as word boundaries).
 * "rag" matches in "rag architecture" but NOT in "storage".
 */
function wordBoundaryMatch(term: string, text: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Word boundaries: start/end of string, whitespace, hyphens, slashes, dots, commas
  const boundary = `(?:^|[\\s\\-/.,;:!?()\\[\\]{}|•·])`;
  const boundaryEnd = `(?:$|[\\s\\-/.,;:!?()\\[\\]{}|•·])`;
  const pattern = new RegExp(`${boundary}${escaped}${boundaryEnd}`, "i");
  // Pad text with spaces so boundaries work at start/end
  return pattern.test(` ${text} `);
}

/**
 * Check if a term exists in the resume with word-boundary matching.
 */
function termExistsInResume(term: string, resumeNormalized: string): boolean {
  const termLower = term.toLowerCase().trim();
  if (termLower.length === 0) return false;
  return wordBoundaryMatch(termLower, resumeNormalized);
}

/**
 * Parse skill names with parenthetical content:
 * "RAG (Retrieval Augmented Generation)" → primary: "RAG", alternatives: ["Retrieval Augmented Generation"]
 * "LLMs (OpenAI, Anthropic, Llama, Mistral)" → primary: "LLMs", alternatives: ["OpenAI", "Anthropic", "Llama", "Mistral"]
 * "Vector Databases (FAISS, PGVector)" → primary: "Vector Databases", alternatives: ["FAISS", "PGVector"]
 * "Python" → primary: "Python", alternatives: []
 */
function parseSkillName(skillName: string): { primary: string; alternatives: string[] } {
  // Match patterns like: "RAG (Retrieval Augmented Generation) Systems"
  // or "LLMs (OpenAI, Anthropic, Llama, Mistral)"
  const parenMatch = skillName.match(/^(.+?)\s*\((.+)\)(.*)$/);
  if (parenMatch) {
    const beforeParen = parenMatch[1].trim();
    const inside = parenMatch[2].trim();
    const afterParen = parenMatch[3].trim();
    
    // Primary is the text before parens (+ any text after parens)
    // e.g., "RAG" + "Systems" → check "RAG", "RAG Systems"
    const alternatives: string[] = [];
    
    // Add the primary WITHOUT the suffix
    const primary = beforeParen;
    
    // Add primary WITH suffix as an alternative if suffix exists
    if (afterParen.length > 0) {
      alternatives.push(`${beforeParen} ${afterParen}`);
    }
    
    // Add items inside parens
    if (inside.includes(",")) {
      const items = inside.split(",").map(s => s.trim()).filter(s => s.length > 0);
      alternatives.push(...items);
    } else {
      alternatives.push(inside);
    }
    
    return { primary, alternatives };
  }
  return { primary: skillName.trim(), alternatives: [] };
}

// ── Core Skill Matching ──
function matchSkillInResume(
  skillName: string,
  resumeNormalized: string
): { matched: boolean; partial: boolean; matchedTerms: string[] } {

  // 1. Handle OR-separated skills: "Python OR R"
  const orParts = skillName.split(/\s+OR\s+/i);
  if (orParts.length > 1) {
    for (const part of orParts) {
      const result = matchSingleSkillWithParens(part.trim(), resumeNormalized);
      if (result.matched) return { matched: true, partial: false, matchedTerms: result.matchedTerms };
    }
    return { matched: false, partial: false, matchedTerms: [] };
  }

  // 2. Handle slash-separated skills: "AWS / GCP" or "Python/TypeScript"
  //    But skip known compound terms like "CI/CD", "UI/UX"
  const knownSlashTerms = ["ci/cd", "ui/ux", "n/a"];
  const skillLowerTrimmed = skillName.toLowerCase().trim();
  if (!knownSlashTerms.includes(skillLowerTrimmed)) {
    const slashParts = skillName.split(/\s*\/\s*/);
    if (slashParts.length > 1 && slashParts.every(p => p.trim().length > 1)) {
      // Check each part individually
      for (const part of slashParts) {
        const result = matchSingleSkillWithParens(part.trim(), resumeNormalized);
        if (result.matched) return { matched: true, partial: false, matchedTerms: result.matchedTerms };
      }
      // Also try the whole thing and each part via synonym
      const wholeResult = matchSingleSkillWithParens(skillName, resumeNormalized);
      if (wholeResult.matched || wholeResult.partial) return wholeResult;
      return { matched: false, partial: false, matchedTerms: [] };
    }
  }

  // 3. Special handling for CI/CD - also check synonym directly
  if (skillLowerTrimmed === "ci/cd") {
    // Check "ci/cd" as-is, "cicd", and synonyms
    if (termExistsInResume("ci/cd", resumeNormalized) ||
        termExistsInResume("cicd", resumeNormalized) ||
        termExistsInResume("ci cd", resumeNormalized) ||
        termExistsInResume("continuous integration", resumeNormalized) ||
        termExistsInResume("continuous deployment", resumeNormalized) ||
        termExistsInResume("continuous delivery", resumeNormalized) ||
        termExistsInResume("github actions", resumeNormalized) ||
        termExistsInResume("gitlab ci", resumeNormalized)) {
      return { matched: true, partial: false, matchedTerms: ["CI/CD"] };
    }
  }

  return matchSingleSkillWithParens(skillName, resumeNormalized);
}

/**
 * Match a single skill, handling parenthetical content.
 * Checks primary term first, then alternatives in parens.
 */
function matchSingleSkillWithParens(
  skill: string,
  resumeNormalized: string
): { matched: boolean; partial: boolean; matchedTerms: string[] } {
  const { primary, alternatives } = parseSkillName(skill);

  // Check the primary term
  const primaryResult = matchTerm(primary, resumeNormalized);
  if (primaryResult.matched) {
    return { matched: true, partial: false, matchedTerms: primaryResult.matchedTerms };
  }

  // Check each alternative (items inside parentheses)
  for (const alt of alternatives) {
    const altResult = matchTerm(alt, resumeNormalized);
    if (altResult.matched) {
      return { matched: true, partial: false, matchedTerms: altResult.matchedTerms };
    }
  }

  // If primary had a partial match, return that
  if (primaryResult.partial) {
    return { matched: false, partial: true, matchedTerms: primaryResult.matchedTerms };
  }

  // Check if any alternative had a partial match
  for (const alt of alternatives) {
    const altResult = matchTerm(alt, resumeNormalized);
    if (altResult.partial) {
      return { matched: false, partial: true, matchedTerms: altResult.matchedTerms };
    }
  }

  return { matched: false, partial: false, matchedTerms: [] };
}

/**
 * Match a single term (no parens) against the resume.
 * Uses: direct match → synonym match → partial word match
 */
function matchTerm(
  term: string,
  resumeNormalized: string
): { matched: boolean; partial: boolean; matchedTerms: string[] } {
  const termNormalized = normalizeText(term);
  if (termNormalized.length === 0) return { matched: false, partial: false, matchedTerms: [] };

  // 1. Direct word-boundary match
  if (termExistsInResume(termNormalized, resumeNormalized)) {
    return { matched: true, partial: false, matchedTerms: [term] };
  }

  // 2. Check synonyms (exact lookup only — no fuzzy matching)
  const synonymsToCheck = getSynonyms(termNormalized);
  for (const syn of synonymsToCheck) {
    if (termExistsInResume(syn, resumeNormalized)) {
      return { matched: true, partial: false, matchedTerms: [syn] };
    }
  }

  // 3. Partial match: for multi-word terms, check if significant words appear
  const termWords = termNormalized.split(/\s+/).filter(w => w.length > 2);
  if (termWords.length > 1) {
    const matched: string[] = [];
    for (const word of termWords) {
      if (termExistsInResume(word, resumeNormalized)) {
        matched.push(word);
      }
    }
    if (matched.length > 0 && matched.length >= Math.ceil(termWords.length * 0.5)) {
      return { matched: false, partial: true, matchedTerms: matched };
    }
  }

  return { matched: false, partial: false, matchedTerms: [] };
}

/**
 * Get all synonyms for a term (exact lookup only).
 */
function getSynonyms(termLower: string): string[] {
  const result: string[] = [];

  // Check if term is a canonical key
  if (SYNONYM_MAP[termLower]) {
    result.push(...SYNONYM_MAP[termLower]);
  }

  // Check if term is a known synonym → get canonical + siblings
  if (REVERSE_SYNONYMS[termLower]) {
    const canonical = REVERSE_SYNONYMS[termLower];
    result.push(canonical);
    if (SYNONYM_MAP[canonical]) {
      result.push(...SYNONYM_MAP[canonical]);
    }
  }

  return [...new Set(result.map(s => s.toLowerCase()))];
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

  const overallMatch = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

  // Generate deductions
  const deductions: { reason: string; percent: number }[] = [];

  for (const sm of skillMatches.filter(s => s.verdict === "missing")) {
    const importance = skills.find(s => s.skill === sm.skill)?.importance || 50;
    const dp = totalWeight > 0 ? Math.round((importance / totalWeight) * 100) : 0;
    if (dp > 0) deductions.push({ reason: `Missing: ${sm.skill}`, percent: dp });
  }

  for (const sm of skillMatches.filter(s => s.verdict === "partial")) {
    const importance = skills.find(s => s.skill === sm.skill)?.importance || 50;
    const dp = totalWeight > 0 ? Math.round(((importance * 0.5) / totalWeight) * 100) : 0;
    if (dp > 0) deductions.push({ reason: `Partial match: ${sm.skill} — add explicit mention`, percent: dp });
  }

  deductions.sort((a, b) => b.percent - a.percent);

  const targetDeduction = 100 - overallMatch;
  const rawTotal = deductions.reduce((sum, d) => sum + d.percent, 0);
  if (rawTotal > 0 && targetDeduction > 0) {
    const scale = targetDeduction / rawTotal;
    for (const d of deductions) {
      d.percent = Math.max(1, Math.round(d.percent * scale));
    }
  }

  return { overall_match: overallMatch, skill_matches: skillMatches, deductions };
}
