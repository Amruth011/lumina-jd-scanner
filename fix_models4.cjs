const fs = require('fs');
const dirs = ['compare-resume', 'decode-jd', 'generate-bullet', 'generate-resume', 'parse-resume-file', 'tailor-resume'];
for (const dir of dirs) {
  const path = 'supabase/functions/' + dir + '/index.ts';
  if (!fs.existsSync(path)) continue;
  let code = fs.readFileSync(path, 'utf8');
  
  // Use guaranteed canonical names for AI Studio
  code = code.replace(/const models = \['gemini-1\.5-flash'\];/g, "const models = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-pro'];");
  
  // Add brevity to prompt
  code = code.replace(/RETURN JSON FORMAT ONLY:/g, "CRITICAL: Keep all text responses EXTREMELY concise (max 1 sentence per array item) to ensure fast processing.\n\n      RETURN JSON FORMAT ONLY:");
  
  fs.writeFileSync(path, code);
  console.log('Fixed ' + path);
}
