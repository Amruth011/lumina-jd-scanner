import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { gapReason, resumeContext, jobTitle } = await req.json();
    if (!gapReason) {
      return new Response(JSON.stringify({ error: "Gap reason is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

    const prompt = `
      You are an expert resume writer. Generate a single, powerful resume bullet point that directly addresses this skill gap.
      
      Gap to fix: "${gapReason}"
      Job title: "${jobTitle || 'Professional'}"
      Context: "${resumeContext?.slice(0, 500) || ''}"

      RULES:
      1. Start with a strong action verb.
      2. Include quantified results (%, $, or numbers).
      3. Focus on impact, not just duties.
      4. Max 2 lines.

      Return ONLY the bullet point text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const bullet = response.text().trim();

    return new Response(JSON.stringify({ bullet }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-bullet error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
