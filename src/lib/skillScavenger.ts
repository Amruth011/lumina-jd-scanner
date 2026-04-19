import type { Skill, DecodeResult } from "@/types/jd";

const commonPreferred = [
  // AI & Agentic Stack
  "rag", "langchain", "agentic", "semantic search", "generative ai", "genai", "llm", "google agent",
  // Data Science Libraries
  "pandas", "numpy", "scikit", "scikit-learn", "matplotlib", "seaborn", "tableau", "power bi",
  // Machine Learning Foundations
  "linear regression", "logistic regression", "decision trees", "hypothesis testing", "eda", "data cleaning", "preprocessing",
  // Infrastructure & Cloud (User prefers these in Nice-to-Have)
  "git", "aws", "azure", "gcp", "cloud", "spark", "pyspark", "hadoop", "big data", 
  "docker", "kubernetes", "jenkins", "terraform", "ci/cd", 
  // Database & Modern Stack
  "sql", "nosql", "mongodb", "postgresql", "redis", "kafka", "elastic", "linux", "jira", "agile", 
  "scrum", "devops", "mlops", "tensorflow", "pytorch", "java", 
  "python", "javascript", "typescript", "react", "next.js", "node", "go", "rust"
];

// Skills the user specifically wants in "Nice-to-Have"
const forceNiceToHave = ["git", "aws", "azure", "gcp", "cloud", "spark", "pyspark", "hadoop", "big data"];

export const scavengeSkills = (initialSkills: Skill[], results: DecodeResult | null, rawJd: string): Skill[] => {
  try {
    const identifiedSkills = new Set((initialSkills || []).map(s => s?.skill?.toLowerCase()).filter(Boolean));
    const finalSkills = [...(initialSkills || [])];
    
    const potentialSources = [
      ...(results?.resume_help?.keywords || []),
      ...(results?.resume_help?.bullets || []),
      ...(results?.jd_rewrite?.highlights?.map(h => typeof h === 'string' ? h : h?.text).filter(Boolean) || []),
      ...(rawJd ? [rawJd] : [])
    ].filter(source => typeof source === 'string');

    if (potentialSources.length === 0) return finalSkills;
    
    // ... patterns ...
    const requiredPatterns = ["essential", "required", "must have", "proficiency in", "solid understanding", "foundational knowledge", "must-to-have", "mandatory", "expected"];
    const optionalPatterns = ["optional", "beneficial", "nice to have", "good to have", "preferred", "plus", "advantage", "desired"];

    commonPreferred.forEach(pref => {
      if (!pref) return;
      const prefLower = pref.toLowerCase();
      
      if (identifiedSkills.has(prefLower)) return;

      let isMentioned = false;
      let isHighIntensity = false;
      let isExplicitlyOptional = false;

      potentialSources.forEach(source => {
        const sLower = source.toLowerCase();
        try {
          const wordRegex = new RegExp(`\\b${prefLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          
          if (wordRegex.test(sLower)) {
            isMentioned = true;
            const matchIdx = sLower.indexOf(prefLower);
            const segment = sLower.substring(Math.max(0, matchIdx - 60), Math.min(sLower.length, matchIdx + 60));

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
        
        if (!isForcedNice && !isExplicitlyOptional && isHighIntensity) {
          finalSkills.push({ skill: pref, importance: 90, category: "Technical" });
        } else {
          finalSkills.push({ skill: pref, importance: 50, category: "Preferred" });
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
