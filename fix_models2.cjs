const fs = require('fs');
const dirs = ['compare-resume', 'decode-jd', 'generate-bullet', 'generate-resume', 'parse-resume-file', 'tailor-resume'];
for (const dir of dirs) {
  const path = 'supabase/functions/' + dir + '/index.ts';
  if (!fs.existsSync(path)) continue;
  let code = fs.readFileSync(path, 'utf8');
  
  // Use gemini-1.5-flash-8b for ultra-fast response to beat the 5s timeout
  code = code.replace(/const models = \['gemini-2\.5-flash', 'gemini-2\.0-flash'\];/g, "const models = ['gemini-1.5-flash-8b', 'gemini-1.5-flash'];");
  
  fs.writeFileSync(path, code);
  console.log('Fixed ' + path);
}
