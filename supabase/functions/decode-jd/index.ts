import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface JDParsed {
  title: string;
  skills: Array<{ skill: string; importance: number }>;
  requirements: {
    education: string[];
    experience: string;
    soft_skills: string[];
    agreements: string[];
  };
  winning_strategy: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jdText } = await req.json();
    if (!jdText) throw new Error("JD text is required");

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured in Supabase Secrets");

    const prompt = `
      Extract key job details and technical skills from this description.
      Job Description:
      ${jdText}
      
      RETURN JSON FORMAT ONLY:
      {
        "title": "Job Title",
        "skills": [{"skill": "Skill Name", "importance": 0-100}],
        "requirements": {
          "education": ["Degree"],
          "experience": "Description",
          "soft_skills": ["Skill"],
          "agreements": ["Specific requirement like 'Must have car'"]
        },
        "winning_strategy": ["3 actionable tips to win this role"]
      }
    `;

    // Direct fetch call to Gemini API - Ultra-Stable
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    
    const apiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message || apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) throw new Error("AI returned an empty response");

    const parsed: JDParsed = JSON.parse(resultText);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("decode-jd error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 200, // Return 200 so client can see the JSON error message
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
