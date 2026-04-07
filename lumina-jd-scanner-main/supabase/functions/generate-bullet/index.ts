import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert resume writer specializing in ATS optimization. Generate a single, powerful resume bullet point that directly addresses a specific skill gap. The bullet must:
1. Start with a strong action verb
2. Include quantified results (%, $, numbers)
3. Incorporate exact keywords from the gap reason
4. Sound authentic and professional — not generic
5. Be 1-2 lines maximum
Return ONLY the bullet point text, nothing else.`,
          },
          {
            role: "user",
            content: `Gap to fix: "${gapReason}"
Job title: "${jobTitle || 'Professional'}"
Resume context: "${resumeContext?.slice(0, 500) || 'Not provided'}"

Generate one powerful, ATS-optimized bullet point that would eliminate this gap.`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const bullet = aiData.choices?.[0]?.message?.content?.trim() || "";

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
