
import { computeDeterministicScore } from '../src/lib/deterministicScorer';

const jdSkills = [
  { skill: "Data Analysis", importance: 100 },
  { skill: "Data Management", importance: 80 },
  { skill: "Data Modeling", importance: 90 },
  { skill: "Python Programming Language", importance: 100 },
  { skill: "Machine Learning", importance: 100 },
  { skill: "Statistical Modeling", importance: 90 }
];

const mismatchResume = `
John Doe - Senior Frontend Developer
Experience: 
- Built complex React dashboards with Tailwind CSS.
- Optimized web performance and SEO for high-traffic sites.
- Integrated REST APIs and GraphQL.
Skills: JavaScript, TypeScript, React, Next.js, CSS, HTML, Figma, Git.
Education: BS in Computer Science.
`;

console.log("--- MISMATCH TEST (Frontend Resume vs Data Science JD) ---");

const result = computeDeterministicScore(mismatchResume, jdSkills);
console.log(`Score = ${result.overall_match}%`);

console.log("\nMatch Details:");
result.skill_matches.forEach(m => {
  console.log(`- ${m.skill}: ${m.verdict} (${m.match_percent}%)`);
});
