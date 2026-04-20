import type { Skill, DecodeResult } from "@/types/jd";

const commonPreferred = [
  // AI & Agentic Stack
  "rag", "langchain", "agentic", "semantic search", "generative ai", "genai", "llm", "google agent",
  // Data Science & Foundations
  "mathematics", "probability", "statistics", "algorithms", "ds foundational knowledge",
  "pandas", "numpy", "scikit", "scikit-learn", "matplotlib", "seaborn", "tableau", "power bi",
  // Machine Learning Concepts
  "linear regression", "logistic regression", "decision trees", "hypothesis testing", "eda", "data cleaning", "preprocessing",
  // Education & Degrees
  "computer science", "electrical engineering", "electronics", "machine learning degree", "data science degree",
  // Infrastructure & Cloud
  "git", "aws", "azure", "gcp", "cloud", "spark", "pyspark", "hadoop", "big data", 
  "docker", "kubernetes", "jenkins", "terraform", "ci/cd", 
  // Database & Modern Stack
  "sql", "nosql", "mongodb", "postgresql", "redis", "kafka", "elastic", "linux", "jira", "agile", 
  "scrum", "devops", "mlops", "tensorflow", "pytorch", "java", 
  "python", "javascript", "typescript", "react", "next.js", "node", "rust"
];

// generic words that should never be auto-detected unless they are very specific
const blacklist = ["go", "it", "at", "as", "is", "be", "do"];

// Skills the user specifically wants in "Nice-to-Have"
const forceNiceToHave = ["git", "aws", "azure", "gcp", "cloud", "spark", "pyspark", "hadoop", "big data", "docker", "kubernetes", "mlops"];

const toTitleCase = (str: string) => {
  return str.replace(/\b\w/g, l => l.toUpperCase());
};

export const scavengeSkills = (initialSkills: Skill[], results: DecodeResult | null, rawJd: string): Skill[] => {
  try {
    // 1. Initial cleanup: Deduplicate initial skills (case-insensitive)
    const initialMap = new Map<string, Skill>();
    (initialSkills || []).forEach(s => {
      if (!s?.skill) return;
      const lower = s.skill.toLowerCase();
      if (!initialMap.has(lower) || s.importance > (initialMap.get(lower)?.importance || 0)) {
        initialMap.set(lower, s);
      }
    });

    const identifiedSkills = new Set(initialMap.keys());
    const finalSkills = Array.from(initialMap.values());
    
    const potentialSources = [
      ...(results?.resume_help?.keywords || []),
      ...(results?.resume_help?.bullets || []),
      ...(results?.jd_rewrite?.highlights?.map(h => typeof h === 'string' ? h : h?.text).filter(Boolean) || []),
      ...(rawJd ? [rawJd] : [])
    ].filter(source => typeof source === 'string');

    if (potentialSources.length === 0) return finalSkills;
    
    const requiredPatterns = ["essential", "required", "must have", "proficiency in", "solid understanding", "foundational knowledge", "must-to-have", "mandatory", "expected", "proficiency"];
    const optionalPatterns = ["optional", "beneficial", "nice to have", "good to have", "preferred", "plus", "advantage", "desired", "familiarity with", "familiarity"];

    commonPreferred.forEach(pref => {
      if (!pref || blacklist.includes(pref.toLowerCase())) return;
      const prefLower = pref.toLowerCase();
      
      // Check if already identified or overlaps with an identified skill
      // e.g. "Generative AI" covers "GenAI"
      const alreadyCovered = Array.from(identifiedSkills).some(id => 
        id.includes(prefLower) || prefLower.includes(id)
      );
      if (alreadyCovered) return;

      let isMentioned = false;
      let isHighIntensity = false;
      let isExplicitlyOptional = false;

      potentialSources.forEach(source => {
        const sLower = source.toLowerCase();
        try {
          // Use a stricter regex to avoid partial word matches
          const wordRegex = new RegExp(`\\b${prefLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          
          if (wordRegex.test(sLower)) {
            isMentioned = true;
            const matchIdx = sLower.indexOf(prefLower);
            const segment = sLower.substring(Math.max(0, matchIdx - 100), Math.min(sLower.length, matchIdx + 100));

            if (optionalPatterns.some(p => segment.includes(p))) {
              isExplicitlyOptional = true;
            } else if (requiredPatterns.some(p => segment.includes(p))) {
              isHighIntensity = true;
            }
          }
        } catch (e) { /* ignore invalid regex */ }
      });

      if (isMentioned) {
        const isForcedNice = forceNiceToHave.includes(prefLower);
        const isFoundation = ["mathematics", "probability", "statistics", "algorithms", "ds foundational knowledge"].includes(prefLower);
        const isEducation = ["computer science", "electrical engineering", "electronics", "machine learning degree", "data science degree"].includes(prefLower);
        
        // Foundations and Education in "What You'll Need" sections often don't have "required" right next to them
        // but are mentioned in a list. We'll give them higher base importance if they are found.
        if (!isForcedNice && !isExplicitlyOptional && (isHighIntensity || isFoundation || isEducation)) {
          finalSkills.push({ 
            skill: toTitleCase(pref), 
            importance: 90, 
            category: isEducation ? "Education" : isFoundation ? "Foundations" : "Technical" 
          });
        } else {
          finalSkills.push({ 
            skill: toTitleCase(pref), 
            importance: 50, 
            category: "Preferred" 
          });
        }
        identifiedSkills.add(prefLower);
      }
    });

    return finalSkills;
  } catch (err) {
    console.error("Critical error in scavengeSkills:", err);
    return initialSkills || [];
  }
};

