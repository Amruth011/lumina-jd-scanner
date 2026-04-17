const text = "A".repeat(3000);
const url = "https://esjzitabjftwiqjzjttw.supabase.co/functions/v1/decode-jd";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzanppdGFiamZ0d2lxanpqdHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzA2NTQsImV4cCI6MjA4OTkwNjY1NH0.rF4FNw2X94XEkl4Vm7XyrnbXF1m1rtyGdV9Wbdh7lXE";

fetch(url, {
  method: "POST",
  headers: {
    "Authorization": "Bearer " + key,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ jdText: text })
})
.then(async (res) => {
  console.log("Status:", res.status);
  console.log("Text:", await res.text());
})
.catch(err => console.error(err));
