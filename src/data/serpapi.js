// src/data/serpapi.js

const SERPAPI_KEY = '6ea98fe21911c20dccbf1bd11d86f01cf31b472b8989d594e9677155e994017f';

import { extractASIN, resolveAmazonUrl } from '../utils/urlHelper';

// Extract domain from URL
function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', ''); // e.g., amazon.in or amazon.com
  } catch (e) {
    return 'amazon.com'; // fallback
  }
}

// Generate simulated 30-day price history
function generateSimulatedHistory(currentPrice, oldPrice) {
  const history = [];
  const startPrice = oldPrice && oldPrice > currentPrice ? oldPrice : currentPrice * 1.2; // default to 20% higher if no old price
  const diff = currentPrice - startPrice;
  
  // 30 data points
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Simulate trend: mostly stays at old price, then drops towards current price recently
    let simulatedPrice;
    if (i > 7) {
      // 8-30 days ago: hover around old price
      const fluctuation = (Math.random() - 0.5) * (startPrice * 0.05); // +/- 2.5%
      simulatedPrice = startPrice + fluctuation;
    } else {
      // Last 7 days: transition to current price
      const transitionProgress = (7 - i) / 7;
      const fluctuation = (Math.random() - 0.5) * (currentPrice * 0.02); // +/- 1%
      simulatedPrice = startPrice + (diff * transitionProgress) + fluctuation;
    }
    
    // Ensure final point is exactly current price
    if (i === 0) {
      simulatedPrice = currentPrice;
    }
    
    // Label for significant events
    let label = null;
    if (i === 7) label = 'Price Drop Detected';
    if (i === 29) label = 'Tracking Started';
    if (i === 0) label = 'Current Price';

    history.push({
      date: dateString,
      price: Math.round(simulatedPrice),
      label
    });
  }
  
  return history;
}

export async function fetchSerpApiPrice(inputUrl) {
  // Try to resolve shortened links (amzn.in, amzn.to)
  const url = await resolveAmazonUrl(inputUrl);

  let asin = extractASIN(url);
  const domain = extractDomain(url);
  
  // If we can't find an ASIN, we'll try to use the URL as a search query
  const targetUrl = asin 
    ? `https://serpapi.com/search.json?engine=amazon_product&asin=${asin}&amazon_domain=${domain}&api_key=${SERPAPI_KEY}`
    : `https://serpapi.com/search.json?engine=amazon&q=${encodeURIComponent(url)}&api_key=${SERPAPI_KEY}`;
  
  let data;
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
  ];

  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy);
      if (!res.ok) continue;
      const json = await res.json();
      data = proxy.includes('allorigins') ? JSON.parse(json.contents) : json;
      if (data && !data.error) break;
    } catch (err) {
      console.warn(`Proxy ${proxy} failed, trying next...`);
    }
  }
  
  if (!data) {
    throw new Error('Network error or API limit reached. Please try again in a few minutes.');
  }

  if (data.error) {
    throw new Error(`API Error: ${data.error}`);
  }

  // Handle search results if we didn't have a direct ASIN
  let product = data.product_results || data.product;
  if (!product && data.shopping_results && data.shopping_results.length > 0) {
    product = data.shopping_results[0];
  }
  
  if (!product || (!product.price && !product.extracted_price)) {
    throw new Error('Could not extract price data for this product. It might be out of stock.');
  }

  const currentPrice = product.extracted_price || parseFloat(product.price.replace(/[^0-9.-]+/g,"")) || 0;
  const originalPrice = product.extracted_old_price || 
                       (product.old_price ? parseFloat(product.old_price.replace(/[^0-9.-]+/g,"")) : currentPrice);

  const history = generateSimulatedHistory(currentPrice, originalPrice);
  
  return {
    id: `serp-${asin}`,
    productName: product.title || `Amazon Product (${asin})`,
    productUrl: url,
    imageUrl: product.thumbnail || product.image,
    platform: 'Amazon',
    currentPrice: currentPrice,
    originalPrice: originalPrice,
    lowestPrice: Math.min(...history.map(h => h.price)),
    highestPrice: Math.max(...history.map(h => h.price)),
    discount: product.discount ? parseInt(product.discount.replace(/[^0-9]+/g,"")) : 
              (originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0),
    rating: product.rating || 0,
    reviewCount: product.reviews || 0,
    currency: product.price?.includes('₹') ? 'INR' : 'USD',
    priceHistory: history
  };
}
