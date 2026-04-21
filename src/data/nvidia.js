// NVIDIA NIM API integration for AI-powered review analysis
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'meta/llama-3.3-70b-instruct';

// Store/retrieve API key from localStorage
export function getApiKey() {
  return localStorage.getItem('nvidia_api_key') || '';
}

export function setApiKey(key) {
  localStorage.setItem('nvidia_api_key', key);
}

export function hasApiKey() {
  return !!getApiKey();
}

// Helper: call NVIDIA NIM API
async function callNvidia(prompt, maxTokens = 2000) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NVIDIA API key not set.');

  const response = await fetch(NVIDIA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Invalid API key. Check your NVIDIA API key.');
    if (response.status === 402) throw new Error('API credits exhausted. Add credits at build.nvidia.com.');
    if (response.status === 429) throw new Error('Rate limit exceeded. Wait a moment and try again.');
    throw new Error(`NVIDIA API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Extract JSON from LLM response (handles markdown code blocks)
function extractJSON(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');
  return JSON.parse(jsonMatch[0]);
}

// Analyze a product URL — generates product info + review analysis
export async function analyzeProductUrl(url) {
  const prompt = `You are a product review analysis AI. A user wants to analyze reviews for the product at this URL:

URL: ${url}

Based on the URL, identify the product and generate a realistic analysis. Respond ONLY with valid JSON, no other text:

{
  "product": {
    "name": "Full product name",
    "platform": "Amazon",
    "rating": 4.2,
    "totalReviews": 150,
    "price": 49999,
    "originalPrice": 59999,
    "discount": 17,
    "image": "https://m.media-amazon.com/images/I/..."
  },
  "trustScore": 72,
  "summary": "Overall analysis summary in one sentence",
  "priceHistory": [
    {"date": "Mar 1", "price": 59999},
    {"date": "Mar 10", "price": 54999, "label": "Price Drop"},
    {"date": "Mar 20", "price": 49999, "label": "Current"}
  ],
  "reviews": [
    {
      "id": 1,
      "text": "Actual realistic review text...",
      "rating": 5,
      "reviewer": "Name",
      "verifiedPurchase": true,
      "status": "genuine",
      "trustScore": 85,
      "reasons": ["Specifics"],
      "date": "2025-03-15"
    }
  ]
}

IMPORTANT RULES:
- Generate exactly 8 reviews with a realistic mix: 3-4 genuine, 2-3 suspicious, 1-2 fake
- Each review text should be 2-4 sentences, realistic Indian Amazon style
- PRICE HISTORY: Generate 10-15 realistic price points for the last 30 days
- Dates should be from 2025
- Respond ONLY with JSON.

  const content = await callNvidia(prompt, 2500);
  const parsed = extractJSON(content);

  // Normalize the response
  return {
    product: {
      name: parsed.product?.name || 'Unknown Product',
      platform: parsed.product?.platform || 'Amazon',
      rating: parsed.product?.rating || 4.0,
      totalReviews: parsed.product?.totalReviews || 0,
      trustScore: parsed.trustScore || 50,
      currentPrice: parsed.product?.price || 0,
      originalPrice: parsed.product?.originalPrice || 0,
      discount: parsed.product?.discount || 0,
      image: parsed.product?.image || '',
    },
    summary: parsed.summary || '',
    priceHistory: parsed.priceHistory || [],
    reviews: (parsed.reviews || []).map((r, i) => ({
      id: `ai-${Date.now()}-${i}`,
      text: r.text || '',
      rating: r.rating || 3,
      reviewer: r.reviewer || 'Anonymous',
      verifiedPurchase: r.verifiedPurchase ?? true,
      status: r.status || 'suspicious',
      trustScore: r.trustScore || 50,
      reasons: r.reasons || [],
      date: r.date || new Date().toISOString().split('T')[0],
    })),
  };
}

// Analyze a single review text
export async function analyzeReviewWithAI(reviewText, starRating, verifiedPurchase) {
  const prompt = `You are a review authenticity analyzer. Analyze this product review:

Review: "${reviewText}"
Star Rating: ${starRating}/5
Verified Purchase: ${verifiedPurchase ? 'Yes' : 'No'}

Respond ONLY with valid JSON:
{
  "verdict": "genuine" or "suspicious" or "fake",
  "trust_score": <0-100>,
  "reasons": ["reason1", "reason2", "reason3"],
  "summary": "one sentence explanation"
}`;

  const content = await callNvidia(prompt, 500);
  const parsed = extractJSON(content);

  return {
    status: parsed.verdict || 'suspicious',
    trustScore: Math.min(100, Math.max(0, parsed.trust_score || 50)),
    reasons: parsed.reasons || ['AI analysis completed'],
    summary: parsed.summary || '',
  };
}
