const text = `Weaviate, Chroma.
- Experience integrating APIs and automation workflows.
Preferred Skill?
- Experience with AI voice agents, chats or n8n automation platforms.
- Familiarity with AI orchestration and tool-calling agents.
- Strong curiosity for experimenting with new AI technologies.
WHY JOIN INCRUITER?
- Build and lead AI-first recruitment products and agentic AI tools in shaping the future of hiring.
- Work directly with the founders and leadership on product vision and execution.
- Culture that rewards speed, ownership, and innovation.
- Competitive salary and fast-track growth in a scaling startup.
SOUNDS PERFECT FOR YOU: If you find this opportunity a perfect fit for you, share your acknowledgement with us by sending your acknowledgement to the same email.
Email: careers@incruiter.com`;

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://esjzitabjftwiqjzjttw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzanppdGFiamZ0d2lxanpqdHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzA2NTQsImV4cCI6MjA4OTkwNjY1NH0.rF4FNw2X94XEkl4Vm7XyrnbXF1m1rtyGdV9Wbdh7lXE'
);

async function test() {
  const { data, error } = await supabase.functions.invoke("decode-jd", {
    body: { jdText: text },
  });
  console.log("Error:", error?.message);
  console.log("Data:", data);
}
test();
