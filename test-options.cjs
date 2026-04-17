const fetch = require('node-fetch');

async function testOptions() {
  const url = 'https://esjzitabjftwiqjzjttw.supabase.co/functions/v1/decode-jd';
  console.log("Sending OPTIONS request...");
  
  const res = await fetch(url, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://lumina-jd-scanner.vercel.app',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization, content-type',
    }
  });
  
  console.log("Status:", res.status);
  console.log("Headers:");
  for (const [k, v] of res.headers.entries()) {
    console.log(`  ${k}: ${v}`);
  }
}
testOptions();
