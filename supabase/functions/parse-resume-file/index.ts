import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let text = "";

    if (fileName.endsWith(".pdf")) {
      // Use Lovable AI to extract text from PDF content
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

      // Convert to base64 for the AI
      const base64 = btoa(String.fromCharCode(...bytes));

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract ALL text content from this PDF document. Return ONLY the raw text, preserving the structure. Do not add any commentary.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/pdf;base64,${base64}`,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error("AI PDF parse error:", aiResponse.status, errText);
        throw new Error("Failed to parse PDF via AI");
      }

      const aiData = await aiResponse.json();
      text = aiData.choices?.[0]?.message?.content || "";
    } else if (fileName.endsWith(".docx")) {
      // Parse DOCX (it's a ZIP containing XML)
      // We'll use a simple approach: extract text from the XML content
      // DOCX files have word/document.xml with the main content
      
      // Use the AI to extract text from DOCX as well
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

      const base64 = btoa(String.fromCharCode(...bytes));

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract ALL text content from this DOCX document. Return ONLY the raw text, preserving the structure. Do not add any commentary.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error("AI DOCX parse error:", aiResponse.status, errText);
        throw new Error("Failed to parse DOCX via AI");
      }

      const aiData = await aiResponse.json();
      text = aiData.choices?.[0]?.message?.content || "";
    } else {
      // Try reading as plain text
      text = new TextDecoder().decode(bytes);
    }

    if (!text.trim()) {
      throw new Error("Could not extract text from the uploaded file.");
    }

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-resume-file error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
