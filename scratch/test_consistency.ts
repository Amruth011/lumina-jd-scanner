
import { computeDeterministicScore } from '../src/lib/deterministicScorer';

const resumeText = `
Amruth Kumar M  Bengaluru, Karnataka | +91 9148159827 |   amruth.kumar.portfolio@gmail.com   |   Portfolio   | LinkedIn   |   GitHub  Professional Summary  Data Science undergraduate skilled in statistical modelling, machine learning, and EDA to uncover high-impact business insights. Delivering predictive analytics at iStudio, with exposure to Generative AI.  Experience  Data Science Intern at iStudio   Feb 2026 – Present  • Developing machine learning models for sales forecasting and predictive analytics using Python.  • Building data preprocessing and feature engineering pipelines to improve model training quality.  • Evaluating model performance and communicating insights through Streamlit dashboards to stakeholders.  Projects  1.   Customer Churn Prediction & Retention ROI System  Python, XGBoost, SHAP, Streamlit, Docker |   GitHub   |   Live  • Applied statistical feature engineering and XGBoost modelling to predict customer churn, achieving AUC- ROC 0.9989 and 98.76% accuracy.  • Performed cohort analysis and exploratory data analysis to identify 937 high-risk customers representing ₹47.4L revenue exposure, directly informing business retention strategy.  • Built an interactive Streamlit dashboard with SHAP explainability, enabling non-technical stakeholders to interpret model decisions and simulate ROI outcomes.  2.   Social Media Sentiment Analysis — Distributed PySpark Pipeline  Python, PySpark, Delta Lake, Streamlit, Docker, GitHub Actions |   GitHub   |   Live  • Analysed large-scale social media datasets using distributed PySpark pipelines to uncover sentiment trends and engagement patterns driving business insights.  • Implemented multi-stage data validation to ensure accuracy, completeness, and legitimacy of analytical outputs across the pipeline.  • Designed a dashboard to communicate sentiment insights to technical and non-technical stakeholders.  3.   Multilingual Document QA System  Python, RAG, ChromaDB, Easy OCR, Sarvam AI, Streamlit |   GitHub   |   Live  • Applied NLP techniques including text preprocessing, normalisation, and semantic chunking to process 346  pages of unstructured text into 687 retrievable knowledge chunks.  • Built a Generative AI application using RAG architecture enabling context -aware bilingual QA   —  demonstrating applied GenAI innovation on complex, unstructured datasets.  •   Validated retrieval relevance through iterative testing, ensuring accuracy of AI-generated outputs  Technical Skills  •   Programming:   Python, SQL  •   Statistical Modelling:   EDA, Hypothesis Testing, Cohort Analysis, A/B Testing, Regression Analysis  •   Machine Learning:   Scikit-learn, XGBoost, Feature Engineering, Model Evaluation  •   Data & Big Data:   PySpark, Pandas, NumPy, Delta Lake  •   Tools & Cloud:   Streamlit, Docker, Git, GitHub, MySQL, Azure  Certifications:   IBM Machine Learning & Google Advanced Data Analytics Professional Certificates - Coursera  Education  B.Tech in Artificial Intelligence and Data Science | REVA University | Bengaluru   2023-2026
`;

const skills = [
  { skill: "Data Analysis", importance: 100 },
  { skill: "Data Management", importance: 80 },
  { skill: "Data Modeling", importance: 90 },
  { skill: "Python Programming Language", importance: 100 },
  { skill: "Machine Learning", importance: 100 },
  { skill: "Statistical Modeling", importance: 90 }
];

console.log("--- CONSISTENCY TEST (5 RUNS) ---");

for (let i = 1; i <= 5; i++) {
  const result = computeDeterministicScore(resumeText, skills);
  console.log(`Run ${i}: Score = ${result.overall_match}%`);
  
  // Also check specific matches for the first run
  if (i === 1) {
    console.log("\nMatch Details (Run 1):");
    result.skill_matches.forEach(m => {
      console.log(`- ${m.skill}: ${m.verdict} (${m.match_percent}%)`);
    });
    console.log("\n");
  }
}
