const { createClient } = require('@supabase/supabase-js');

// Create a single supabase client for interacting with your database
const supabase = createClient(
  'https://esjzitabjftwiqjzjttw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzanppdGFiamZ0d2lxanpqdHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzA2NTQsImV4cCI6MjA4OTkwNjY1NH0.rF4FNw2X94XEkl4Vm7XyrnbXF1m1rtyGdV9Wbdh7lXE'
);

async function test() {
  console.log("Invoking decode-jd...");
  const { data, error } = await supabase.functions.invoke("decode-jd", {
    body: { jdText: "Looking for a software engineer with React and Node.js." },
  });
  
  if (error) {
    console.log("Error object:", error);
    console.log("Error message:", error.message);
  } else {
    console.log("Success data:", data);
  }
}

test();
