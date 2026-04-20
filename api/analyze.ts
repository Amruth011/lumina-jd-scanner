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

  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    console.error('SERVER_ERROR: GROQ_API_KEY is missing from environment variables.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { model, messages, temperature, response_format } = req.body;

    console.log(`API_PROXY: Requesting completion for model ${model}`);

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages,
        temperature: temperature ?? 0.3,
        response_format,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      console.error('GROQ_API_ERROR:', errorData);
      return res.status(groqResponse.status).json(errorData);
    }

    const data = await groqResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('PROXY_HANDLER_ERROR:', error);
    return res.status(500).json({ error: 'Internal server error while proxying request' });
  }
}
