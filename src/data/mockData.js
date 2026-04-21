// Mock products with reviews and analysis data
export const products = [
  {
    id: 1,
    name: 'Fire-Boltt Phoenix Smart Watch with Bluetooth Calling 1.3", 120+ Sports Modes, 240 * 240 PX High Res with SpO2, Heart Rate Monitoring & IP67 Rating (Black)',
    url: 'https://amzn.in/d/05ZJbR7U',
    platform: 'Amazon',
    rating: 4.1,
    reviewCount: 1854,
    price: 1499,
    originalPrice: 5999,
    discount: 75,
    image: null,
    trustScore: 62,
    genuineCount: 8,
    suspiciousCount: 10,
    fakeCount: 2,
  },
  {
    id: 2,
    name: 'Apple iPhone 13 (128GB) - Starlight',
    url: 'https://amzn.in/d/03J3Szpf',
    platform: 'Amazon',
    rating: 4.6,
    reviewCount: 24531,
    price: 49999,
    originalPrice: 59900,
    discount: 17,
    image: null,
    trustScore: 88,
    genuineCount: 15,
    suspiciousCount: 4,
    fakeCount: 1,
  },
  {
    id: 3,
    name: 'Redmi 13C (Starshine Green, 4GB RAM, 128GB Storage)',
    url: 'https://amzn.in/d/03J3Szpf',
    platform: 'Amazon',
    rating: 4.0,
    reviewCount: 8762,
    price: 8499,
    originalPrice: 11999,
    discount: 29,
    image: null,
    trustScore: 71,
    genuineCount: 10,
    suspiciousCount: 8,
    fakeCount: 2,
  },
  {
    id: 4,
    name: 'Samsung Galaxy M35 5G (Daybreak Blue, 6GB RAM, 128GB Storage)',
    url: 'https://amzn.in/d/0hynOZzJ',
    platform: 'Amazon',
    rating: 4.2,
    reviewCount: 5431,
    price: 14999,
    originalPrice: 19999,
    discount: 25,
    image: null,
    trustScore: 76,
    genuineCount: 12,
    suspiciousCount: 6,
    fakeCount: 2,
  },
  {
    id: 5,
    name: 'boAt Airdopes 141 Bluetooth TWS Earbuds with 42H Playtime, Low Latency Mode',
    url: 'https://amzn.in/d/0abc1234',
    platform: 'Amazon',
    rating: 3.9,
    reviewCount: 312450,
    price: 999,
    originalPrice: 4490,
    discount: 78,
    image: null,
    trustScore: 55,
    genuineCount: 5,
    suspiciousCount: 12,
    fakeCount: 3,
  },
  {
    id: 6,
    name: 'realme GT 6T 5G (Fluid Silver, 8GB RAM, 128GB Storage)',
    url: 'https://amzn.in/d/0xyz5678',
    platform: 'Amazon',
    rating: 4.3,
    reviewCount: 1854,
    price: 28999,
    originalPrice: 32999,
    discount: 12,
    image: null,
    trustScore: 82,
    genuineCount: 14,
    suspiciousCount: 5,
    fakeCount: 1,
  },
  {
    id: 7,
    name: 'Noise ColorFit Pro 5 Max 1.96" AMOLED Display Smart Watch',
    url: 'https://amzn.in/d/0noi5678',
    platform: 'Flipkart',
    rating: 4.0,
    reviewCount: 2341,
    price: 3499,
    originalPrice: 8999,
    discount: 61,
    image: null,
    trustScore: 59,
    genuineCount: 6,
    suspiciousCount: 11,
    fakeCount: 3,
  },
  {
    id: 8,
    name: 'HP 15s Ryzen 3 5300U 15.6-inch FHD Laptop (8GB RAM, 512GB SSD)',
    url: 'https://amzn.in/d/0hp12345',
    platform: 'Amazon',
    rating: 4.1,
    reviewCount: 4521,
    price: 33990,
    originalPrice: 44457,
    discount: 24,
    image: null,
    trustScore: 84,
    genuineCount: 16,
    suspiciousCount: 3,
    fakeCount: 1,
  },
  {
    id: 9,
    name: 'Mamaearth Vitamin C Daily Glow Face Cream with Vitamin C & Turmeric for Skin Illumination – 80 g',
    url: 'https://www.flipkart.com/mamaearth',
    platform: 'Meesho',
    rating: 3.8,
    reviewCount: 9823,
    price: 349,
    originalPrice: 599,
    discount: 42,
    image: null,
    trustScore: 48,
    genuineCount: 4,
    suspiciousCount: 9,
    fakeCount: 7,
  },
];

// Review templates for generating reviews
const reviewTemplates = {
  genuine: [
    { text: "I've been using this product for 3 months now and it's holding up great. The build quality is solid, and the battery life exceeds expectations. Minor issue with the strap quality but overall worth the price.", rating: 4, reviewer: 'Rahul M.', verifiedPurchase: true, reasons: ['Detailed experience', 'Mentions specific features', 'Balanced feedback', 'Time-based usage'] },
    { text: "Bought this as a gift for my wife. She loves the design and the features are impressive for this price range. Delivery was on time and packaging was good.", rating: 5, reviewer: 'Ankit S.', verifiedPurchase: true, reasons: ['Personal context', 'Specific use case', 'Mentions delivery', 'Natural language'] },
    { text: "Display quality is decent but not the best in this range. Camera performance is average in low light. Good for daily use, won't disappoint if you don't have very high expectations.", rating: 3, reviewer: 'Priya K.', verifiedPurchase: true, reasons: ['Honest criticism', 'Comparative analysis', 'Moderate rating', 'Specific features discussed'] },
    { text: "Third time buying from this brand and they never disappoint. Performance is smooth, no lag or heating issues even after heavy usage. Highly recommend for budget-conscious buyers.", rating: 5, reviewer: 'Deepak R.', verifiedPurchase: true, reasons: ['Repeat customer', 'Specific performance claims', 'Verified purchase', 'Natural tone'] },
    { text: "Product is okay, nothing extraordinary. Does what it says. The customer service was helpful when I had a query about warranty. Average product at an average price.", rating: 3, reviewer: 'Sneha T.', verifiedPurchase: true, reasons: ['Neutral tone', 'Mentions customer service', 'Balanced review', 'Verified purchase'] },
  ],
  suspicious: [
    { text: "Amazing product! Best in class! Must buy for everyone! You won't regret it! 5 stars all the way! Best purchase I ever made!!!!", rating: 5, reviewer: 'Happy Customer', verifiedPurchase: false, reasons: ['Excessive exclamation marks', 'Generic praise', 'No specific details', 'Unverified purchase'] },
    { text: "Good product good quality good price good delivery good packaging. Very happy with purchase. Will buy again. Recommend to all friends and family.", rating: 5, reviewer: 'Buyer123', verifiedPurchase: true, reasons: ['Repetitive language pattern', 'No specific features mentioned', 'Generic username', 'Suspiciously positive'] },
    { text: "I compared with many products and this is THE BEST. No other product can match this quality. If you are thinking, just buy it NOW. Don't waste time looking elsewhere.", rating: 5, reviewer: 'TechExpert99', verifiedPurchase: false, reasons: ['Urgency language', 'Superlative claims', 'No comparative details', 'Pressuring tone'] },
    { text: "Product received. Good. Nice. Recommended. Quality is best. Price is best. Everything is best about this product. No complaints at all.", rating: 5, reviewer: 'User_4829', verifiedPurchase: false, reasons: ['Minimal effort text', 'All superlatives', 'Generated-looking username', 'No substance'] },
    { text: "best product ever seen in my life. changed my life completely. everyone should buy this product immediately. company is great.", rating: 5, reviewer: 'ReviewKing', verifiedPurchase: false, reasons: ['Hyperbolic claims', 'All lowercase', 'Vague praise', 'No product-specific details'] },
  ],
  fake: [
    { text: "DO NOT BUY THIS PRODUCT! It is the worst thing ever made! Broke in 1 day! Company is fraud! Scam! Report this seller immediately! Worst experience of my life!", rating: 1, reviewer: 'AngryBuyer', verifiedPurchase: false, reasons: ['Extreme negativity', 'No specific defect described', 'Unverified purchase', 'Attack on seller reputation'] },
    { text: "This product is absolutely perfect in every single way. I bought 10 of them for my entire family. The technology used is years ahead of competition. Nothing can beat this.", rating: 5, reviewer: 'Shopper_2024', verifiedPurchase: false, reasons: ['Unrealistic purchase quantity', 'Vague tech claims', 'Bot-like pattern', 'Unverified purchase'] },
    { text: "Excellent product with superior quality and craftsmanship. The attention to detail is remarkable. A masterpiece of engineering. Truly a game changer in the industry.", rating: 5, reviewer: 'QualityReviewer', verifiedPurchase: false, reasons: ['Marketing-like language', 'No personal experience', 'Copied text pattern', 'Generic promotional tone'] },
  ],
};

// Generate reviews for a product
export function generateReviewsForProduct(product) {
  const reviews = [];
  let id = 1;

  // Add genuine reviews
  const genuineCount = product.genuineCount;
  for (let i = 0; i < genuineCount; i++) {
    const template = reviewTemplates.genuine[i % reviewTemplates.genuine.length];
    reviews.push({
      id: id++,
      productId: product.id,
      text: template.text,
      rating: template.rating,
      reviewer: template.reviewer,
      verifiedPurchase: template.verifiedPurchase,
      status: 'genuine',
      trustScore: 75 + Math.floor(Math.random() * 20),
      reasons: template.reasons,
      date: getRandomDate(60),
    });
  }

  // Add suspicious reviews
  const suspiciousCount = product.suspiciousCount;
  for (let i = 0; i < suspiciousCount; i++) {
    const template = reviewTemplates.suspicious[i % reviewTemplates.suspicious.length];
    reviews.push({
      id: id++,
      productId: product.id,
      text: template.text,
      rating: template.rating,
      reviewer: template.reviewer,
      verifiedPurchase: template.verifiedPurchase,
      status: 'suspicious',
      trustScore: 30 + Math.floor(Math.random() * 25),
      reasons: template.reasons,
      date: getRandomDate(60),
    });
  }

  // Add fake reviews
  const fakeCount = product.fakeCount;
  for (let i = 0; i < fakeCount; i++) {
    const template = reviewTemplates.fake[i % reviewTemplates.fake.length];
    reviews.push({
      id: id++,
      productId: product.id,
      text: template.text,
      rating: template.rating,
      reviewer: template.reviewer,
      verifiedPurchase: template.verifiedPurchase,
      status: 'fake',
      trustScore: 5 + Math.floor(Math.random() * 20),
      reasons: template.reasons,
      date: getRandomDate(60),
    });
  }

  return reviews;
}

function getRandomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString().split('T')[0];
}

// Price history generator
export function generatePriceHistory(product) {
  const history = [];
  const basePrice = product.originalPrice;
  const currentPrice = product.price;
  const days = 30;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variation = Math.random() * 0.15 - 0.05;
    const dayPrice = Math.round(
      currentPrice + (basePrice - currentPrice) * (i / days) + basePrice * variation
    );
    history.push({
      date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      price: Math.max(Math.round(currentPrice * 0.85), Math.min(basePrice, dayPrice)),
    });
  }
  // Ensure last price is current
  history[history.length - 1].price = currentPrice;
  return history;
}

// Dashboard aggregate stats
export const dashboardStats = {
  totalAnalyzed: 45,
  avgTrustScore: 79,
  flagged: 0,
  productsTracked: products.length,
};

// Get aggregate authenticity distribution
export function getAuthenticityDistribution() {
  let genuine = 0, suspicious = 0, fake = 0;
  products.forEach(p => {
    genuine += p.genuineCount;
    suspicious += p.suspiciousCount;
    fake += p.fakeCount;
  });
  return { genuine, suspicious, fake };
}

// Get rating distribution
export function getRatingDistribution() {
  return {
    labels: ['1★', '2★', '3★', '4★', '5★'],
    genuine: [1, 2, 5, 12, 10],
    suspicious: [0, 1, 2, 8, 12],
    fake: [2, 0, 0, 1, 5],
  };
}
