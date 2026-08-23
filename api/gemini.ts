// Vercel / Netlify Serverless Edge Function: Isolates GEMINI_API_KEY
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt text' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // If no key is set in environment, notify client to use local fallback
    return res.status(200).json({ 
      status: 'fallback', 
      message: 'GEMINI_API_KEY environment variable not set on server. Using built-in NLP heuristics.' 
    });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const systemInstruction = `You are an expert quantitative trading algorithm compiler. Convert the user's trading strategy hypothesis into structured JSON with fields: name, description, timeframe ('1m'|'5m'|'15m'|'1h'|'1D'), buyRules (array of indicator, comparator, thresholdValue, secondaryIndicator, description), sellRules, stopLossAtrMultiplier (number), takeProfit1Multiplier (number), takeProfit2Multiplier (number), riskRewardTarget (number), fullKellyMultiplier (0.35). Return only valid JSON.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nUser prompt: "${prompt}"` }]
          }
        ]
      })
    });

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (parsed) {
      return res.status(200).json({ strategy: { id: `gemini-${Date.now()}`, ...parsed } });
    }

    return res.status(200).json({ status: 'fallback' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error processing AI prompt' });
  }
}
