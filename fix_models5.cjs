const fs = require('fs');
const dirs = ['compare-resume', 'decode-jd', 'generate-bullet', 'generate-resume', 'parse-resume-file', 'tailor-resume'];
for (const dir of dirs) {
  const path = 'supabase/functions/' + dir + '/index.ts';
  if (!fs.existsSync(path)) continue;
  let code = fs.readFileSync(path, 'utf8');
  
  // Use gemini-2.5-flash since 1.5 is explicitly blocking the user's API Key (404s)
  code = code.replace(/const models = \['gemini-1\.5-flash-latest', 'gemini-1\.5-pro-latest', 'gemini-pro'\];/g, "const models = ['gemini-2.5-flash'];");
  
  fs.writeFileSync(path, code);
  console.log('Fixed ' + path);
}
