import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Proxy API for Groq
 * =================
 * This serverless function securely holds the GROQ_API_KEY and proxies
 * requests from the frontend to the Groq API. This prevents the key
 * from being exposed to users in the browser.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Basic Security: Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Load API Key from Environment
  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    console.error('SERVER_ERROR: GROQ_API_KEY is missing from environment variables.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Multi-Model Fallback List
   * ========================
   * 1. Primary: Requested or Llama 3.3 70B (Intelligence)
   * 2. Secondary: Gemma 2 27B (Stability/Rate Limits)
   * 3. Tertiary: Llama 3.1 8B (Speed)
   * 4. Base: Gemma 2 9B (Ultra-fast)
   */
  const fallbackModels = [
    req.body.model || 'llama-3.3-70b-versatile',
    'gemma2-27b-it',
    'llama-3.1-8b-instant',
    'gemma2-9b-it'
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError = "";
  let resultData = null;

  try {
    const { messages, temperature, response_format } = req.body;

    for (const model of fallbackModels) {
      try {
        console.log(`API_PROXY: Attempting with ${model}...`);
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages,
            temperature: temperature ?? 0.3,
            response_format,
          }),
        });

        if (groqResponse.ok) {
          resultData = await groqResponse.json();
          break;
        }

        const errorData = await groqResponse.json();
        lastError = errorData.error?.message || groqResponse.statusText;
        console.warn(`API_PROXY: ${model} failed:`, lastError);

        if (groqResponse.status === 429) {
          console.log("API_PROXY: Rate limit hit. Waiting 1000ms...");
          await sleep(1000);
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.error(`API_PROXY: ${model} crash:`, lastError);
      }
    }

    if (!resultData) {
      return res.status(500).json({ error: `All AI engines exhausted: ${lastError}` });
    }

    return res.status(200).json(resultData);
  } catch (error) {
    console.error('PROXY_HANDLER_ERROR:', error);
    return res.status(500).json({ error: 'Internal server error while proxying request' });
  }
}
