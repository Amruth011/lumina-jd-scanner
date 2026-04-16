import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) throw new Error("No file uploaded.");

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured in Supabase Secrets");

    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Direct fetch call to Gemini Pro (better for file parsing) - Zero-Dependency v1 Stable
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${geminiKey}`;
    
    const apiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { data: base64, mimeType: file.type || "application/pdf" } },
            { text: "Extract ALL text content from this document. Return ONLY the raw text, preserving the structure perfectly. Do not add any commentary." }
          ]
        }]
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(`Gemini API (Pro) Error: ${errorData.error?.message || apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text || !text.trim()) {
      throw new Error("Could not extract text from the uploaded file.");
    }

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("parse-resume-file error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 200, // Return 200 for client diagnostics
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
