/**
 * Deterministic Resume Scorer
 * ===========================
 * Pure client-side scoring engine that produces 100% consistent scores.
 * Same resume + same JD skills = EXACT same score, every single time.
 *
 * Algorithm:
 * 1. Tokenize & normalize resume text (lowercase, strip punctuation)
 * 2. For each JD skill, check for matches using:
 *    a. Exact phrase match (highest confidence)
 *    b. Word-boundary token match
 *    c. Synonym/alias expansion (e.g., "JS" → "JavaScript")
 *    d. Acronym expansion (e.g., "ML" → "Machine Learning")
 *    e. OR-skill handling (any one match = full score)
 * 3. Score each skill: strong (100), partial (50), missing (0)
 * 4. Compute weighted overall score using skill importance
 * 5. Generate deductions from missing/partial skills
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
// Maps normalized keys to arrays of equivalent terms.
// A match on ANY synonym counts as a match for the key skill.
const SYNONYM_MAP: Record<string, string[]> = {
  // Languages
  "javascript": ["js", "ecmascript", "es6", "es2015", "es2020", "es2021", "es2022", "es2023", "es2024", "ecma"],
  "typescript": ["ts", "type script"],
  "python": ["py", "cpython", "python3", "python2"],
  "java": ["jdk", "jre", "j2ee", "j2se", "java se", "java ee", "openjdk"],
  "c#": ["csharp", "c sharp", "dotnet", ".net", "asp.net"],
  "c++": ["cpp", "cplusplus", "c plus plus"],
  "golang": ["go lang", "go language", "go programming"],
  "ruby": ["ruby on rails", "ror"],
  "rust": ["rustlang"],
  "swift": ["swiftui"],
  "kotlin": ["kt"],
  "r": ["r programming", "r language", "rstudio", "r studio"],
  "php": ["laravel", "symfony", "codeigniter"],
  "scala": ["apache scala"],
  "perl": ["perl5", "perl6"],
  "sql": ["structured query language", "tsql", "t-sql", "plsql", "pl/sql", "pl sql"],

  // Frontend Frameworks
  "react": ["reactjs", "react.js", "react js", "react native", "react dom"],
  "angular": ["angularjs", "angular.js", "angular js", "ng"],
  "vue": ["vuejs", "vue.js", "vue js", "nuxt", "nuxtjs"],
  "svelte": ["sveltekit", "svelte kit"],
  "next.js": ["nextjs", "next js", "next"],
  "gatsby": ["gatsbyjs"],
  "ember": ["emberjs", "ember.js"],
  "jquery": ["j query"],

  // Backend Frameworks
  "node.js": ["nodejs", "node js", "node", "express", "expressjs", "express.js", "fastify", "koa", "nestjs", "nest.js"],
  "django": ["django rest framework", "drf"],
  "flask": ["flask api"],
  "spring": ["spring boot", "springboot", "spring framework", "spring mvc"],
  "fastapi": ["fast api"],
  "rails": ["ruby on rails", "ror"],

  // Databases
  "postgresql": ["postgres", "psql", "pg"],
  "mysql": ["my sql", "mariadb", "maria db"],
  "mongodb": ["mongo", "mongo db", "mongoose"],
  "redis": ["redis cache", "redis db"],
  "elasticsearch": ["elastic search", "elastic", "es", "elk"],
  "cassandra": ["apache cassandra"],
  "dynamodb": ["dynamo db", "dynamo"],
  "sqlite": ["sq lite"],
  "oracle": ["oracle db", "oracle database", "pl/sql"],
  "sql server": ["mssql", "ms sql", "microsoft sql", "ssms"],
  "neo4j": ["neo 4j", "graph database"],
  "firebase": ["firebase realtime", "firestore", "firebase db"],
  "supabase": ["supa base"],

  // Cloud / DevOps
  "aws": ["amazon web services", "amazon cloud", "ec2", "s3", "lambda", "rds", "cloudfront", "sqs", "sns", "ecs", "eks", "fargate", "sagemaker"],
  "azure": ["microsoft azure", "azure cloud", "azure devops"],
  "gcp": ["google cloud", "google cloud platform", "bigquery", "big query", "cloud run", "cloud functions", "vertex ai"],
  "docker": ["dockerfile", "docker compose", "docker-compose", "containerization", "containers"],
  "kubernetes": ["k8s", "kube", "kubectl", "helm", "openshift"],
  "terraform": ["iac", "infrastructure as code", "terragrunt"],
  "ansible": ["ansible playbook"],
  "jenkins": ["jenkins ci", "jenkinsfile"],
  "ci/cd": ["ci cd", "cicd", "continuous integration", "continuous deployment", "continuous delivery", "github actions", "gitlab ci", "circleci", "travis ci"],
  "linux": ["unix", "ubuntu", "centos", "rhel", "debian", "fedora", "bash", "shell scripting", "shell script"],
  "git": ["github", "gitlab", "bitbucket", "version control", "vcs", "git flow", "gitflow"],
  "nginx": ["apache http", "reverse proxy", "load balancer"],

  // Data / ML / AI
  "machine learning": ["ml", "deep learning", "dl", "artificial intelligence", "ai", "neural network", "neural networks"],
  "tensorflow": ["tf", "keras", "tf.keras"],
  "pytorch": ["torch", "py torch"],
  "scikit-learn": ["sklearn", "scikit learn", "sci-kit learn"],
  "pandas": ["pandas dataframe", "dataframe"],
  "numpy": ["num py", "numerical python"],
  "nlp": ["natural language processing", "text mining", "text analytics", "spacy", "nltk", "hugging face", "huggingface", "transformers"],
  "computer vision": ["cv", "image recognition", "object detection", "opencv", "open cv", "yolo", "image classification"],
  "data science": ["data analysis", "data analytics", "data analyst", "data engineering"],
  "power bi": ["powerbi", "power bi desktop"],
  "tableau": ["tableau desktop", "tableau server"],
  "apache spark": ["spark", "pyspark", "sparksql"],
  "hadoop": ["hdfs", "mapreduce", "map reduce", "hive", "pig"],
  "etl": ["extract transform load", "data pipeline", "data pipelines", "airflow", "apache airflow"],
  "llm": ["large language model", "large language models", "gpt", "chatgpt", "openai", "gemini", "claude", "langchain", "lang chain"],

  // Tools / Practices
  "agile": ["scrum", "kanban", "sprint", "sprints", "jira", "confluence", "agile methodology", "agile methodologies"],
  "rest api": ["restful", "rest apis", "restful api", "restful apis", "api development", "api design"],
  "graphql": ["graph ql", "apollo"],
  "microservices": ["micro services", "microservice architecture", "distributed systems", "service oriented architecture", "soa"],
  "testing": ["unit testing", "integration testing", "e2e testing", "end to end testing", "jest", "pytest", "junit", "mocha", "cypress", "selenium", "playwright", "tdd", "bdd", "test driven development"],
  "figma": ["figma design", "sketch", "adobe xd", "ui/ux", "ui ux"],
  "oauth": ["oauth2", "oauth 2.0", "openid connect", "oidc", "saml", "jwt", "json web token"],
  "websocket": ["websockets", "web socket", "web sockets", "socket.io", "socketio"],
  "rabbitmq": ["rabbit mq", "message queue", "message broker", "amqp"],
  "kafka": ["apache kafka", "event streaming"],
  "grpc": ["g rpc", "protocol buffers", "protobuf"],
};

// Build a reverse-lookup: synonym → canonical skill
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
    .replace(/[^\w\s.#+\-/]/g, " ")  // keep #, +, -, /, .
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): Set<string> {
  const normalized = normalizeText(text);
  const tokens = new Set<string>();
  // Add individual words
  for (const word of normalized.split(/\s+/)) {
    if (word.length > 0) tokens.add(word);
  }
  return tokens;
}

// ── N-gram Generator ──
function generateNgrams(text: string, maxN: number = 4): Set<string> {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter(w => w.length > 0);
  const ngrams = new Set<string>();

  for (let n = 1; n <= Math.min(maxN, words.length); n++) {
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.add(words.slice(i, i + n).join(" "));
    }
  }
  return ngrams;
}

// ── Skill Matching Logic ──
function matchSkillInResume(
  skillName: string,
  resumeNormalized: string,
  resumeNgrams: Set<string>,
  resumeTokens: Set<string>
): { matched: boolean; partial: boolean; matchedTerms: string[] } {
  const matchedTerms: string[] = [];

  // Handle OR skills: "Python OR R OR Julia"
  const orParts = skillName.split(/\s+OR\s+/i);
  if (orParts.length > 1) {
    // Any ONE match = full match
    for (const part of orParts) {
      const result = matchSingleSkill(part.trim(), resumeNormalized, resumeNgrams, resumeTokens);
      if (result.matched) {
        return { matched: true, partial: false, matchedTerms: result.matchedTerms };
      }
      if (result.partial) {
        matchedTerms.push(...result.matchedTerms);
      }
    }
    // If any partial was found across OR alternatives
    if (matchedTerms.length > 0) {
      return { matched: true, partial: false, matchedTerms }; // OR partial still counts as full
    }
    return { matched: false, partial: false, matchedTerms: [] };
  }

  // Handle slash-separated skills: "Python/TypeScript"
  const slashParts = skillName.split(/\//);
  if (slashParts.length > 1 && slashParts.every(p => p.trim().length > 1)) {
    for (const part of slashParts) {
      const result = matchSingleSkill(part.trim(), resumeNormalized, resumeNgrams, resumeTokens);
      if (result.matched) {
        return { matched: true, partial: false, matchedTerms: result.matchedTerms };
      }
      if (result.partial) {
        matchedTerms.push(...result.matchedTerms);
      }
    }
    if (matchedTerms.length > 0) {
      return { matched: true, partial: false, matchedTerms };
    }
    return { matched: false, partial: false, matchedTerms: [] };
  }

  return matchSingleSkill(skillName, resumeNormalized, resumeNgrams, resumeTokens);
}

function matchSingleSkill(
  skill: string,
  resumeNormalized: string,
  resumeNgrams: Set<string>,
  resumeTokens: Set<string>
): { matched: boolean; partial: boolean; matchedTerms: string[] } {
  const skillLower = normalizeText(skill);
  const matchedTerms: string[] = [];

  // 1. Exact phrase match in resume text
  if (resumeNormalized.includes(skillLower)) {
    return { matched: true, partial: false, matchedTerms: [skill] };
  }

  // 2. N-gram match (handles multi-word skills like "machine learning")
  if (resumeNgrams.has(skillLower)) {
    return { matched: true, partial: false, matchedTerms: [skill] };
  }

  // 3. Individual token match (for single-word skills)
  if (skillLower.split(/\s+/).length === 1 && resumeTokens.has(skillLower)) {
    return { matched: true, partial: false, matchedTerms: [skill] };
  }

  // 4. Synonym expansion: check all known synonyms for this skill
  const synonymsToCheck: string[] = [];

  // Check if the skill itself is a canonical key in SYNONYM_MAP
  if (SYNONYM_MAP[skillLower]) {
    synonymsToCheck.push(...SYNONYM_MAP[skillLower]);
  }

  // Check if the skill is a known synonym, get canonical + siblings
  if (REVERSE_SYNONYMS[skillLower]) {
    const canonical = REVERSE_SYNONYMS[skillLower];
    synonymsToCheck.push(canonical);
    if (SYNONYM_MAP[canonical]) {
      synonymsToCheck.push(...SYNONYM_MAP[canonical]);
    }
  }

  // Also check partial synonym matches (e.g., skill "React.js" should match synonym map for "react")
  for (const [canonical, syns] of Object.entries(SYNONYM_MAP)) {
    if (skillLower.includes(canonical) || canonical.includes(skillLower)) {
      synonymsToCheck.push(canonical, ...syns);
    }
    for (const syn of syns) {
      if (skillLower.includes(syn) || syn.includes(skillLower)) {
        synonymsToCheck.push(canonical, ...syns);
        break;
      }
    }
  }

  // Dedupe and check synonyms
  const uniqueSynonyms = [...new Set(synonymsToCheck.map(s => s.toLowerCase()))];
  for (const syn of uniqueSynonyms) {
    if (resumeNormalized.includes(syn) || resumeNgrams.has(syn) || resumeTokens.has(syn)) {
      matchedTerms.push(syn);
    }
  }

  if (matchedTerms.length > 0) {
    return { matched: true, partial: false, matchedTerms };
  }

  // 5. Partial match: check if ANY word of a multi-word skill appears
  const skillWords = skillLower.split(/\s+/).filter(w => w.length > 2); // skip tiny words
  if (skillWords.length > 1) {
    const partialMatches: string[] = [];
    for (const word of skillWords) {
      if (resumeTokens.has(word) || resumeNormalized.includes(word)) {
        partialMatches.push(word);
      }
    }
    // If more than half the words match, it's a partial
    if (partialMatches.length > 0 && partialMatches.length >= skillWords.length * 0.4) {
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
  const resumeTokens = tokenize(resumeText);
  const resumeNgrams = generateNgrams(resumeText, 5);

  const skillMatches: DeterministicSkillMatch[] = [];
  let totalWeight = 0;
  let weightedSum = 0;

  for (const skill of skills) {
    const result = matchSkillInResume(skill.skill, resumeNormalized, resumeNgrams, resumeTokens);

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
  const missingSkills = skillMatches.filter(sm => sm.verdict === "missing");
  const partialSkills = skillMatches.filter(sm => sm.verdict === "partial");

  // Calculate deduction weight per skill
  for (const sm of missingSkills) {
    const skillDef = skills.find(s => s.skill === sm.skill);
    const importance = skillDef?.importance || 50;
    const deductionPercent = totalWeight > 0 ? Math.round((importance / totalWeight) * 100) : 0;
    if (deductionPercent > 0) {
      deductions.push({
        reason: `Missing: ${sm.skill}`,
        percent: deductionPercent,
      });
    }
  }

  for (const sm of partialSkills) {
    const skillDef = skills.find(s => s.skill === sm.skill);
    const importance = skillDef?.importance || 50;
    const deductionPercent = totalWeight > 0 ? Math.round(((importance * 0.5) / totalWeight) * 100) : 0;
    if (deductionPercent > 0) {
      deductions.push({
        reason: `Partial match: ${sm.skill} — add explicit mention`,
        percent: deductionPercent,
      });
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
