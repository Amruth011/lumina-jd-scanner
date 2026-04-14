import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { jd_title, jd_skills, company_name, vault_items, personal_info, mode, raw_resume_text } = await req.json();

    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";

    if (mode === 'import' && raw_resume_text) {
      prompt = `
        You are an elite data architect and career strategist.
        I have raw text from a resume. I need you to parse it and return it in a structured JSON format suitable for a "Master Experience Vault".
        
        RAW TEXT:
        ${raw_resume_text}

        EXTRACT AND STRUCTURE:
        Parse every Professional Experience, Project, Education, and Certification into the following JSON structure.
        Do not shorten the content yet, keep the full details.

        RETURN JSON FORMAT:
        {
          "experience": [
            {
              "heading": "Title | Organization",
              "content": "Description of the role",
              "bullets": ["Bullet 1", "Bullet 2"]
            }
          ],
          "education": ["..."],
          "certifications": ["..."]
        }
      `;
    } else {
      prompt = `
        You are an elite, senior technical recruiter and talent strategist.
        Your task is to generate a world-class, ATS-optimized resume by "picking and tailoring" content from a user's Master Experience Vault to match a specific Job Description (JD).

        JD Title: ${jd_title}
        JD Keywords: ${jd_skills?.map((s: { skill: string }) => s.skill).join(", ") || "None"}
        Company Name: ${company_name}

        PERSONAL INFO:
        ${JSON.stringify(personal_info)}

        MASTER VAULT ITEMS:
        ${JSON.stringify(vault_items)}

        PROCESS INSTRUCTIONS:
        1. THE TAILORING ENGINE: Select the top 70% most relevant items from the vault. Ignore irrelevant ones.
        2. KEYWORD INFUSION: For each selected item, rewrite the bullets to use the JD keywords. If the user has a matching skill, phrase the bullet point to align with the JD's technical language.
        3. THE QUANTIFIER ASSISTANT: If a bullet point lacks a metric (%, $, time), add a placeholder like "[?] Quantify this: (e.g., Improved X by 20%)" to make it stand out.
        4. CONTEXT-SPECIFIC SUMMARY: Write a professional summary that mentions the specific company name (${company_name}) and explains why the user's specific vault experience makes them a "0.1% candidate" for this role.

        RETURN JSON FORMAT:
        {
          "professional_summary": "...",
          "skills_section": ["Skill A", "Skill B"...],
          "experience": [
            {
              "heading": "Title @ Organization | Period",
              "content": "Specific Location or Team info",
              "bullets": ["Keyword infused bullet...", "Bullet with [?] quantifier..."]
            }
          ],
          "education": ["..."],
          "certifications": ["..."]
        }
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const resultJson = JSON.parse(jsonStr);

    return new Response(JSON.stringify(resultJson), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
