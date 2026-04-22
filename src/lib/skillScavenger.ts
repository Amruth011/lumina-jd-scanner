import type { Skill, DecodeResult } from "@/types/jd";

const commonPreferred = [
  // AI & Agentic Stack
  "rag", "langchain", "langgraph", "agentic", "semantic search", "generative ai", "genai", "llm", "google agent", "hugging face", "vector databases", "agentic workflows", "kyc",
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
const forceNiceToHave = ["git", "jenkins", "terraform", "jira", "agile", "scrum", "devops"];

const requiredPatterns = [
  "essential", "required", "must have", "proficiency in", "solid understanding", 
  "foundational knowledge", "must-to-have", "mandatory", "expected", "proficiency",
  "paramount", "expert", "hands-on", "proficient", "mastery", "years of experience",
  "strong proficiency", "deep understanding", "accountable for"
];

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
    
    // Divide JD into sections for context-aware weighting (Required vs Optional)
    const sections = rawJd.split('\n');
    const technicalSections = sections.filter(s => 
      /essential|required|must have|technical|qualifications|responsibilities|what you'll need|what you’ll need/i.test(s)
    ).join('\n');
    const optionalSections = sections.filter(s => 
      /preferred|optional|nice to have|plus|beneficial|advantage|desired|familiarity/i.test(s)
    ).join('\n');

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
      let isCoreContext = firstTwentyPercent.includes(prefLower);

      potentialSources.forEach(source => {
        const sLower = source.toLowerCase();
        try {
          const wordRegex = new RegExp(`\\b${prefLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          
          if (wordRegex.test(sLower)) {
            isMentioned = true;

            const inTechnical = technicalSections.toLowerCase().includes(prefLower);
            const inOptional = optionalSections.toLowerCase().includes(prefLower);

            const matchIdx = sLower.indexOf(prefLower);
            const segment = sLower.substring(Math.max(0, matchIdx - 100), Math.min(sLower.length, matchIdx + 100));

            if (optionalPatterns.some(p => segment.includes(p)) || inOptional) {
              isExplicitlyOptional = true;
            } 
            
            if (requiredPatterns.some(p => segment.includes(p)) || inTechnical) {
              isHighIntensity = true;
            }
          }
        } catch (e) { /* ignore */ }
      });

      if (isMentioned) {
        const isForcedNice = forceNiceToHave.includes(prefLower);
        const isFoundation = ["mathematics", "probability", "statistics", "algorithms", "ds foundational knowledge", "python", "sql", "excel"].includes(prefLower);
        const isExpertTech = ["rag", "langchain", "langgraph", "agentic", "generative ai", "llm", "semantic search", "vector database", "kyc", "compliance"].includes(prefLower);
        
        if (!isForcedNice && !isExplicitlyOptional && (isHighIntensity || isFoundation || isExpertTech || isCoreContext)) {
          finalSkills.push({ 
            skill: toTitleCase(pref), 
            importance: isCoreContext ? 98 : 90, 
            category: isExpertTech ? "GenAI" : isFoundation ? "Foundations" : "Technical" 
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
  } catch (e) {
    console.error("Scavenger Fault:", e);
    return initialSkills;
  }
};
