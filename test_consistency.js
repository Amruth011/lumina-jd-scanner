// Test script: calls compare-resume 10 times with same resume+JD to check scoring consistency
const SUPABASE_URL = "https://ntwfagszihlrxivimqqc.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50d2ZhZ3N6aWhscnhpdmltcXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMjU5MzMsImV4cCI6MjA4OTkwMTkzM30.JhAL7Q43Vl8-vl6tWMDGBPmwDY-5JFNr2PB1slHa3sg";

const resumeText = `Amruth Kumar M
Bengaluru, Karnataka
AI & Data Science undergraduate specializing in Generative AI, RAG architectures, and Python backend development.
Experience
Data Science Intern at iStudio Feb 2026 - Present
• Developing machine learning models and robust Python-based data preprocessing pipelines to improve training quality.
• Building and evaluating model performance, orchestrating insights through Streamlit dashboards for stakeholders.
Projects
1. Multilingual Document QA System (GenAI & RAG) - Python, RAG, ChromaDB, Easy OCR, Sarvam AI
• Developed a Generative AI application utilizing RAG architecture to execute context-aware bilingual QA on complex unstructured data.
• Applied NLP semantic chunking and normalization to successfully process 346 pages into 687 highly retrievable knowledge chunks.
2. Customer Churn Prediction & Retention ROI System - Python, XGBoost, SHAP, Docker, Streamlit
• Engineered a production-level XGBoost predictive model, achieving an AUC-ROC of 0.9989 and 98.76% accuracy.
Technical Skills
Agentic AI & LLMs: LangChain, OpenAI Assistants API, RAG Pipelines, Prompt Engineering, Multi-Step Reasoning, Embeddings, Model Fine-Tuning
Backend & Cloud DevOps: Python, REST APIs (FastAPI), Docker, CI/CD (GitHub Actions), Azure
Data & System Architecture: SQL, Vector Databases (ChromaDB, Pinecone), AI Safety, AI/ML Fundamentals
Certifications
Salesforce Certified - Agentforce Specialist
AI Engineer for Data Scientists Associate - DataCamp
Oracle Cloud Infrastructure 2025 AI Foundations Associate
Education
B.Tech in Artificial Intelligence and Data Science | REVA University | Bengaluru 2023-2026`;

const skills = [
  { skill: "Python", importance: 95, category: "Languages" },
  { skill: "TypeScript", importance: 80, category: "Languages" },
  { skill: "LangGraph / Mastra / CrewAI (Agentic Frameworks)", importance: 85, category: "Frameworks" },
  { skill: "Vector Databases (FAISS, PGVector, Pinecone, Weaviate)", importance: 75, category: "Databases" },
  { skill: "RAG (Retrieval Augmented Generation)", importance: 90, category: "Other" },
  { skill: "LLMs (OpenAI, Anthropic, Llama, Mistral)", importance: 85, category: "Other" },
  { skill: "Docker", importance: 60, category: "Tools" },
  { skill: "Git & CI/CD", importance: 55, category: "Tools" },
  { skill: "AWS / GCP (Basics)", importance: 50, category: "Cloud" },
  { skill: "Prompt Design & Retrieval Optimization", importance: 70, category: "Other" },
  { skill: "Cybersecurity Interest/Knowledge", importance: 30, category: "Other" },
];

async function runTest(iteration) {
  const start = Date.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/compare-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ANON_KEY}`,
        "apikey": ANON_KEY,
      },
      body: JSON.stringify({ resumeText, skills }),
    });
    const data = await res.json();
    const elapsed = Date.now() - start;
    if (data.error) {
      return { iteration, score: "ERROR", error: data.error, elapsed };
    }
    return {
      iteration,
      score: data.overall_match,
      deductions: data.deductions?.length || 0,
      elapsed,
    };
  } catch (e) {
    return { iteration, score: "FAIL", error: e.message, elapsed: Date.now() - start };
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("CONSISTENCY TEST: Same Resume + JD x 10 runs");
  console.log("=".repeat(60));
  
  const results = [];
  for (let i = 1; i <= 10; i++) {
    process.stdout.write(`Run ${i}/10... `);
    const r = await runTest(i);
    console.log(`Score: ${r.score}% (${r.elapsed}ms)${r.error ? ` ERROR: ${r.error}` : ""}`);
    results.push(r);
    // Small delay between requests
    if (i < 10) await new Promise(r => setTimeout(r, 1500));
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("RESULTS SUMMARY");
  console.log("=".repeat(60));
  
  const scores = results.filter(r => typeof r.score === "number").map(r => r.score);
  if (scores.length === 0) {
    console.log("❌ All runs failed. Check API.");
    return;
  }
  
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const variance = max - min;

  console.log(`Successful runs: ${scores.length}/10`);
  console.log(`Scores: [${scores.join(", ")}]`);
  console.log(`Min: ${min}% | Max: ${max}% | Avg: ${avg}%`);
  console.log(`Variance (max-min): ${variance}%`);
  
  if (variance === 0) {
    console.log("✅ PERFECT CONSISTENCY: Same score every time!");
  } else if (variance <= 3) {
    console.log("⚠️  NEAR-CONSISTENT: Variance within ±3% (acceptable)");
  } else {
    console.log("❌ INCONSISTENT: Variance too high, needs fixing");
  }
}

main();
