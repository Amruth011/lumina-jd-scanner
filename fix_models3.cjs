const fs = require('fs');
const dirs = ['compare-resume', 'decode-jd', 'generate-bullet', 'generate-resume', 'parse-resume-file', 'tailor-resume'];
for (const dir of dirs) {
  const path = 'supabase/functions/' + dir + '/index.ts';
  if (!fs.existsSync(path)) continue;
  let code = fs.readFileSync(path, 'utf8');
  
  // Replace the faulty 1.5-flash-8b array with just gemini-1.5-flash
  code = code.replace(/const models = \['gemini-1\.5-flash-8b', 'gemini-1\.5-flash'\];/g, "const models = ['gemini-1.5-flash'];");
  
  fs.writeFileSync(path, code);
  console.log('Fixed ' + path);
}
