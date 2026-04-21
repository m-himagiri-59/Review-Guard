// API service to fetch real-time data from the Smart Review backend
const APP_ID = '69b927accf05f909d77d403d';
const BASE_URL = `https://smart-review.base44.app/api/apps/${APP_ID}`;

// --- Local Storage Sync Helpers ---
export function getLocalProducts() {
  try { return JSON.parse(localStorage.getItem('analyzed_products')) || []; } 
  catch (e) { return []; }
}

export function saveLocalProduct(product, reviews) {
  let products = getLocalProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  if (existingIndex >= 0) {
    products.splice(existingIndex, 1);
  }
  products.unshift(product);
  
  // Keep only the 5 most recently analyzed products locally
  if (products.length > 5) {
    products = products.slice(0, 5);
  }
  
  localStorage.setItem('analyzed_products', JSON.stringify(products));

  const validProductIds = new Set(products.map(p => p.id));

  const currentReviews = getLocalReviews();
  const newReviews = [...reviews, ...currentReviews];
  const unique = Array.from(new Map(newReviews.map(r => [r.id, r])).values());
  
  // Clean up reviews belonging to products that were dropped
  const filteredReviews = unique.filter(r => validProductIds.has(r.productId));
  
  localStorage.setItem('analyzed_reviews', JSON.stringify(filteredReviews));
}

export function getLocalReviews() {
  try { return JSON.parse(localStorage.getItem('analyzed_reviews')) || []; } 
  catch (e) { return []; }
}

export async function fetchReviews(limit = 200) {
  const res = await fetch(`${BASE_URL}/entities/Review?sort=-created_date&limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch reviews: ${res.status}`);
  const data = await res.json();
  const remoteReviews = data.map(r => ({
    id: r.id,
    text: r.review_text,
    rating: r.star_rating,
    reviewer: r.reviewer_name,
    verifiedPurchase: r.verified_purchase,
    status: r.verdict, // genuine | suspicious | fake
    trustScore: r.trust_score,
    reasons: r.reasons ? r.reasons.split(/[,.;]/).map(s => s.trim()).filter(Boolean) : [],
    date: r.review_date,
    productId: r.product_id,
    flagged: r.flagged,
  }));
  return [...getLocalReviews(), ...remoteReviews];
}

export async function fetchProducts(limit = 50) {
  const res = await fetch(`${BASE_URL}/entities/AnalyzedProduct?sort=-created_date&limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  const data = await res.json();
  const remoteProducts = data.map(p => ({
    id: p.id,
    name: p.product_name,
    url: p.url,
    platform: p.platform || 'other',
    imageUrl: p.image_url,
    totalReviews: p.total_reviews,
    genuineCount: p.genuine_count,
    suspiciousCount: p.suspicious_count,
    fakeCount: p.fake_count,
    avgTrustScore: p.avg_trust_score,
    createdDate: p.created_date,
  }));
  return [...getLocalProducts(), ...remoteProducts];
}

export async function fetchPriceHistory(limit = 30) {
  const res = await fetch(`${BASE_URL}/entities/PriceHistory?sort=-created_date&limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch price history: ${res.status}`);
  const data = await res.json();
  return data.map(p => ({
    id: p.id,
    productName: p.product_name,
    productUrl: p.product_url,
    imageUrl: p.image_url,
    platform: p.platform,
    currentPrice: p.current_price,
    originalPrice: p.original_price,
    lowestPrice: p.lowest_price,
    highestPrice: p.highest_price,
    discount: p.discount_percent,
    rating: p.rating,
    reviewCount: p.review_count,
    currency: p.currency,
    priceHistory: (p.price_history || []).map(h => ({
      date: h.date,
      price: h.price,
      label: h.label,
    })),
  }));
}

// Analyze a URL via the InvokeLLM endpoint
export async function analyzeProductUrl(url) {
  const res = await fetch(`${BASE_URL}/integration-endpoints/Core/InvokeLLM`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    if (res.status === 402) throw new Error('Analysis quota exceeded. Try again later.');
    throw new Error(`Analysis failed: ${res.status}`);
  }
  return res.json();
}

// Analyze a manually submitted review
export async function analyzeReviewText(reviewText, rating, verifiedPurchase) {
  const res = await fetch(`${BASE_URL}/integration-endpoints/Core/InvokeLLM`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewText, rating, verifiedPurchase }),
  });
  if (!res.ok) {
    if (res.status === 402) throw new Error('Analysis quota exceeded. Try again later.');
    throw new Error(`Analysis failed: ${res.status}`);
  }
  return res.json();
}

// Helper to compute dashboard stats from real data
export function computeDashboardStats(reviews, products) {
  const totalAnalyzed = reviews.length;
  const avgTrustScore = totalAnalyzed > 0
    ? Math.round(reviews.reduce((sum, r) => sum + r.trustScore, 0) / totalAnalyzed)
    : 0;
  const flagged = reviews.filter(r => r.flagged).length;
  const productsTracked = products.length;

  const genuine = reviews.filter(r => r.status === 'genuine').length;
  const suspicious = reviews.filter(r => r.status === 'suspicious').length;
  const fake = reviews.filter(r => r.status === 'fake').length;

  // Rating distribution
  const ratingBuckets = [1, 2, 3, 4, 5];
  const ratingDist = {
    labels: ratingBuckets.map(r => `${r}★`),
    genuine: ratingBuckets.map(r =>
      reviews.filter(rv => Math.round(rv.rating) === r && rv.status === 'genuine').length
    ),
    suspicious: ratingBuckets.map(r =>
      reviews.filter(rv => Math.round(rv.rating) === r && rv.status === 'suspicious').length
    ),
    fake: ratingBuckets.map(r =>
      reviews.filter(rv => Math.round(rv.rating) === r && rv.status === 'fake').length
    ),
  };

  return {
    totalAnalyzed,
    avgTrustScore,
    flagged,
    productsTracked,
    genuine,
    suspicious,
    fake,
    ratingDist,
  };
}
