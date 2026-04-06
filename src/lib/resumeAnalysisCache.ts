import type { ResumeGapResult, Skill } from "@/types/jd";

const CACHE_STORAGE_KEY = "lumina_resume_analysis_cache";
const MAX_CACHE_ENTRIES = 50;

interface CacheEntry {
  hash: string;
  result: ResumeGapResult;
  timestamp: number;
}

const memoryCache = new Map<string, ResumeGapResult>();

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSkills(skills: Skill[]): string {
  return [...skills]
    .map((skill) => ({
      skill: skill.skill.trim().toLowerCase(),
      category: skill.category.trim().toLowerCase(),
      importance: skill.importance,
    }))
    .sort((a, b) => a.skill.localeCompare(b.skill) || a.category.localeCompare(b.category) || a.importance - b.importance)
    .map((skill) => `${skill.skill}|${skill.category}|${skill.importance}`)
    .join("\n");
}

async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function loadPersistedCache(): CacheEntry[] {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return [];
    const entries: CacheEntry[] = JSON.parse(raw);
    if (!Array.isArray(entries)) return [];
    return entries.filter(
      (entry) => entry?.hash && entry?.result && typeof entry.result.overall_match === "number" && Array.isArray(entry.result.skill_matches)
    );
  } catch {
    return [];
  }
}

function persistCache(entries: CacheEntry[]): void {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(entries.slice(-MAX_CACHE_ENTRIES)));
  } catch {
    // ignore persistence failures
  }
}

async function getCacheKey(resumeText: string, skills: Skill[]): Promise<string> {
  const normalizedResume = normalizeText(resumeText);
  const normalizedSkills = normalizeSkills(skills);
  return hashText(`${normalizedResume}\n---\n${normalizedSkills}`);
}

export async function getCachedResumeAnalysis(resumeText: string, skills: Skill[]): Promise<ResumeGapResult | null> {
  const key = await getCacheKey(resumeText, skills);

  const memoryHit = memoryCache.get(key);
  if (memoryHit) return memoryHit;

  const entries = loadPersistedCache();
  const found = entries.find((entry) => entry.hash === key);
  if (!found) return null;

  memoryCache.set(key, found.result);
  return found.result;
}

export async function setCachedResumeAnalysis(resumeText: string, skills: Skill[], result: ResumeGapResult): Promise<void> {
  const key = await getCacheKey(resumeText, skills);
  memoryCache.set(key, result);

  const entries = loadPersistedCache().filter((entry) => entry.hash !== key);
  entries.push({ hash: key, result, timestamp: Date.now() });
  persistCache(entries);
}
