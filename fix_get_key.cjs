const fs = require('fs');

let code = fs.readFileSync('supabase/functions/decode-jd/index.ts', 'utf8');

// Inject the get_key endpoint
code = code.replace(
  'const { jdText } = await req.json();',
  'const body = await req.json(); const { jdText, action } = body;'
);
code = code.replace(
  'const geminiKey = Deno.env.get("GEMINI_API_KEY");',
  `const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (action === "get_key") {
      return new Response(JSON.stringify({ key: geminiKey }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }`
);

fs.writeFileSync('supabase/functions/decode-jd/index.ts', code);
console.log('Fixed decode-jd to allow key extraction');
