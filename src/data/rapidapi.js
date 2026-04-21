// RapidAPI Real-Time Amazon Data — fetch real product reviews
const RAPIDAPI_KEY = '6c179074d3mshec7bd50c6f97dcbp11d208jsn638ae7a6526a';
const RAPIDAPI_HOST = 'real-time-amazon-data.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

const headers = {
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': RAPIDAPI_HOST,
};

import { extractASIN, detectCountry, resolveAmazonUrl } from '../utils/urlHelper';

// Helper for proxied fetch
async function proxiedFetch(targetUrl, customHeaders = {}) {
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
  ];

  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy, { headers: customHeaders });
      if (!res.ok) continue;
      const data = await res.json();
      return proxy.includes('allorigins') ? JSON.parse(data.contents) : data;
    } catch (err) {
      console.warn(`Proxy ${proxy} failed for RapidAPI call...`);
    }
  }
  throw new Error('All proxies failed. Please check your internet connection or adblocker.');
}

// Fetch product details (try product-details first, fallback to search)
async function fetchProductDetails(asin, country) {
  // Try product-details endpoint first
  try {
    const url = `${BASE_URL}/product-details?asin=${asin}&country=${country}`;
    const json = await proxiedFetch(url, headers);
    const d = json.data;
    if (d && d.product_title) {
      return {
        asin,
        name: d.product_title,
        rating: parseFloat(d.product_star_rating) || 0,
        totalRatings: parseInt(d.product_num_ratings) || 0,
        price: d.product_price || '',
        image: d.product_photo || '',
        platform: 'Amazon',
      };
    }
  } catch (e) { /* fallback below */ }

  // Fallback: search by ASIN or URL
  try {
    const url = `${BASE_URL}/search?query=${asin}&country=${country}&page=1`;
    const json = await proxiedFetch(url, headers);
    const products = json.data?.products || [];
    const match = products.find(p => p.asin === asin) || products[0];
    if (match) {
      return {
        asin: match.asin || asin,
        name: match.product_title || 'Amazon Product',
        rating: parseFloat(match.product_star_rating) || 0,
        totalRatings: parseInt(match.product_num_ratings) || 0,
        price: match.product_price || '',
        image: match.product_photo || '',
        platform: 'Amazon',
      };
    }
  } catch (e) { /* use defaults */ }

  // Default fallback
  return {
    asin,
    name: `Amazon Product (${asin})`,
    rating: 0,
    totalRatings: 0,
    price: '',
    image: '',
    platform: 'Amazon',
  };
}

// Fetch product reviews
async function fetchRawReviews(asin, country) {
  try {
    const url = `${BASE_URL}/product-reviews?asin=${asin}&country=${country}&page=1&sort_by=TOP_REVIEWS`;
    const json = await proxiedFetch(url, headers);
    if (json.data?.reviews) return json.data.reviews;
    
    // Try US if IN failed
    if (country !== 'US') {
      const url2 = `${BASE_URL}/product-reviews?asin=${asin}&country=US&page=1&sort_by=TOP_REVIEWS`;
      const json2 = await proxiedFetch(url2, headers);
      return json2.data?.reviews || [];
    }
  } catch (e) {
    throw new Error(`Failed to fetch reviews: ${e.message}`);
  }
  return [];
}

// Analyze a single review for authenticity
function analyzeReview(review) {
  const text = (review.review_comment || review.review_title || '').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const exclamationCount = (text.match(/!/g) || []).length;
  const capsWords = (text.match(/[A-Z]{3,}/g) || []).length;
  const hasSpecifics = /battery|screen|camera|display|quality|build|size|weight|speed|performance|sound|charge|heat|lag|smooth|pixel|ram|storage|speaker|touch|brightness|color|condition|capacity/i.test(text);
  const isGeneric = /best|amazing|awesome|worst|terrible|horrible|perfect|excellent|superb|fantastic|love it|hate it|must buy|great product|good product|nice product|highly recommend/i.test(text);
  const hasBalanced = /but|however|although|though|only issue|downside|con |pros|could be better|wish|complaint|problem|minor/i.test(text);
  const isVeryShort = wordCount < 8;

  let trustScore, status, reasons = [];

  // Fake signals
  if (isVeryShort && !hasSpecifics && (parseInt(review.review_star_rating) === 5 || parseInt(review.review_star_rating) === 1)) {
    trustScore = 10 + Math.floor(Math.random() * 15);
    status = 'fake';
    reasons = ['Extremely short review', 'Extreme rating with no details', 'No product specifics'];
  } else if (exclamationCount > 4 || capsWords > 4) {
    trustScore = 15 + Math.floor(Math.random() * 15);
    status = 'fake';
    reasons = ['Excessive punctuation/caps', 'Emotional manipulation', 'Unnatural writing style'];
  }
  // Suspicious signals
  else if (isGeneric && !hasSpecifics && wordCount < 20) {
    trustScore = 30 + Math.floor(Math.random() * 15);
    status = 'suspicious';
    reasons = ['Generic praise', 'No specific features mentioned', 'Template-like language'];
  } else if (isVeryShort) {
    trustScore = 35 + Math.floor(Math.random() * 15);
    status = 'suspicious';
    reasons = ['Very short review', 'Insufficient detail'];
  }
  // Genuine signals
  else if (hasSpecifics && hasBalanced && wordCount > 30) {
    trustScore = 88 + Math.floor(Math.random() * 10);
    status = 'genuine';
    reasons = ['Detailed experience', 'Balanced pros and cons', 'Specific features discussed'];
  } else if (hasSpecifics && wordCount > 20) {
    trustScore = 75 + Math.floor(Math.random() * 15);
    status = 'genuine';
    reasons = ['Specific product details', 'Adequate length', 'Natural language'];
  } else if (hasSpecifics) {
    trustScore = 65 + Math.floor(Math.random() * 15);
    status = 'genuine';
    reasons = ['Product features referenced', 'Reasonable assessment'];
  }
  // Moderate
  else {
    trustScore = 45 + Math.floor(Math.random() * 15);
    status = 'suspicious';
    reasons = ['Limited specifics', 'Could not fully verify'];
  }

  // Verified purchase bonus
  if (review.is_verified_purchase) {
    trustScore = Math.min(95, trustScore + 5);
    reasons.push('Verified purchase');
  } else {
    trustScore = Math.max(5, trustScore - 8);
    reasons.push('Unverified purchase');
  }

  return {
    id: review.review_id || `r-${Math.random().toString(36).slice(2)}`,
    text: text || review.review_title || 'No review text',
    title: review.review_title || '',
    rating: parseInt(review.review_star_rating) || 3,
    reviewer: review.review_author || 'Amazon Customer',
    verifiedPurchase: review.is_verified_purchase || false,
    date: (review.review_date || '').replace('Reviewed in the United States on ', '').replace('Reviewed in India on ', ''),
    status,
    trustScore,
    reasons,
  };
}

// Full pipeline: fetch product + reviews + analyze
export async function fetchAndAnalyzeProduct(inputUrl) {
  // Try to resolve shortened links (amzn.in, amzn.to)
  const url = await resolveAmazonUrl(inputUrl);
  
  let asin = extractASIN(url);
  const country = detectCountry(url);

  let product;
  let rawReviews = [];

  // If we have an ASIN, use the direct pipeline
  if (asin) {
    [product, rawReviews] = await Promise.all([
      fetchProductDetails(asin, country),
      fetchRawReviews(asin, country),
    ]);
  } 
  // If no ASIN, try searching by the URL itself (RapidAPI search often resolves these)
  else {
    console.log('No ASIN found, trying search by URL:', url);
    product = await fetchProductDetails(url, country);
    if (product && product.asin) {
      asin = product.asin;
      rawReviews = await fetchRawReviews(asin, country);
    }
  }

  if (!asin || !product) {
    throw new Error('Invalid URL or Product not found. Please paste a valid Amazon product link.');
  }

  if (rawReviews.length === 0) {
    throw new Error('No reviews found for this product. Try a product with more reviews.');
  }

  // Analyze each review
  const analyzedReviews = rawReviews.map(r => analyzeReview(r));

  const genuineCount = analyzedReviews.filter(r => r.status === 'genuine').length;
  const suspiciousCount = analyzedReviews.filter(r => r.status === 'suspicious').length;
  const fakeCount = analyzedReviews.filter(r => r.status === 'fake').length;
  const avgTrust = Math.round(analyzedReviews.reduce((s, r) => s + r.trustScore, 0) / analyzedReviews.length);

  return {
    product: {
      ...product,
      trustScore: avgTrust,
      genuineCount,
      suspiciousCount,
      fakeCount,
      totalReviews: product.totalRatings || analyzedReviews.length,
    },
    reviews: analyzedReviews,
  };
}
