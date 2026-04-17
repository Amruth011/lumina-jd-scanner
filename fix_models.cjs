const fs = require('fs');
const dirs = ['compare-resume', 'decode-jd', 'generate-bullet', 'generate-resume', 'parse-resume-file', 'tailor-resume'];
for (const dir of dirs) {
  const path = 'supabase/functions/' + dir + '/index.ts';
  if (!fs.existsSync(path)) continue;
  let code = fs.readFileSync(path, 'utf8');
  
  // Reduce models to 2 fastest to prevent 5s timeout on Supabase free tier
  code = code.replace(/const models = \[.*?\];/g, "const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];");
  
  // Update breaker logic
  code = code.replace(/if \(apiResponse\.status === 401 \|\| apiResponse\.status === 403\) break;/g, 'if (apiResponse.status >= 400 && apiResponse.status < 500 && apiResponse.status !== 429) break;');
  
  fs.writeFileSync(path, code);
  console.log('Fixed ' + path);
}
