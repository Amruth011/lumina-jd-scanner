
import { computeDeterministicScore } from '../src/lib/deterministicScorer';

const jdSkills = [
  { skill: "Data Analysis", importance: 100 },
  { skill: "Data Management", importance: 80 },
  { skill: "Data Modeling", importance: 90 },
  { skill: "Python Programming Language", importance: 100 },
  { skill: "Machine Learning", importance: 100 },
  { skill: "Statistical Modeling", importance: 90 }
];

const dataEngineerResume = `
Jane Smith - Data Engineer
Experience:
- Designed and maintained high-throughput ETL pipelines using Apache Spark and Airflow.
- Optimized SQL queries and managed petabyte-scale data in Snowflake and BigQuery.
- Built automated data ingestion systems using Kafka and Python.
Skills: SQL, Python, Apache Spark, Airflow, Hadoop, Snowflake, BigQuery, Kafka, AWS, Docker.
Education: BS in Computer Science.
`;

console.log("--- DATA ENGINEER TEST (DE Resume vs Data Science JD) ---");

const result = computeDeterministicScore(dataEngineerResume, jdSkills);
console.log(`Score = ${result.overall_match}%`);

console.log("\nMatch Details:");
result.skill_matches.forEach(m => {
  console.log(`- ${m.skill}: ${m.verdict} (${m.match_percent}%)`);
});
