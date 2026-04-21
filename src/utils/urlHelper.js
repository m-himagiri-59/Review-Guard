/**
 * Utilities for handling and resolving Amazon URLs
 */

/**
 * Extracts the ASIN (Amazon Standard Identification Number) from various Amazon URL formats
 * @param {string} url The Amazon product URL
 * @returns {string|null} The ASIN or null if not found
 */
export function extractASIN(url) {
  if (!url) return null;
  // Patterns for /dp/ASIN, /product/ASIN, /gp/product/ASIN, /gp/aw/d/ASIN, /product-reviews/ASIN, etc.
  const patterns = [
    /(?:\/dp\/|\/product\/|\/gp\/product\/|\/gp\/aw\/d\/|\/product-reviews\/)([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
    /\/re[af]=.*\b([A-Z0-9]{10})\b/i // matches ASIN in some ref parameters
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Detects the country code from an Amazon URL
 * @param {string} url The Amazon product URL
 * @returns {string} Two-letter country code (e.g., 'IN', 'US')
 */
export function detectCountry(url) {
  if (!url) return 'US';
  if (url.includes('amazon.in') || url.includes('amzn.in')) return 'IN';
  if (url.includes('amazon.co.uk')) return 'GB';
  if (url.includes('amazon.de')) return 'DE';
  if (url.includes('amazon.ca')) return 'CA';
  return 'US';
}

/**
 * Resolves shortened Amazon URLs (amzn.in, amzn.to, a.co) to their full versions
 * or extracts the ASIN directly from the page content.
 */
export async function resolveAmazonUrl(url) {
  const isShortened = /amzn\.(in|to)|a\.co|amzn\.eu|amzn\.asia|am\.zn/.test(url);
  if (!isShortened) return url;

  console.log('Expanding shortened URL:', url);
  
  // Strategy 1: Use unshorten.me via a proxy (highly specialized for this)
  try {
    const unshortenUrl = `https://unshorten.me/json/${encodeURIComponent(url)}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(unshortenUrl)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.resolved_url && data.resolved_url.includes('amazon')) {
        console.log('Expanded via unshorten.me:', data.resolved_url);
        return data.resolved_url;
      }
    }
  } catch (error) {
    console.warn('unshorten.me expansion failed...');
  }

  // Strategy 2: Try AllOrigins (provides final status.url)
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const data = await response.json();
      
      // 1. Check status.url
      if (data.status && data.status.url && data.status.url.includes('/dp/')) {
        return data.status.url;
      }
      
      // 2. Search HTML content for canonical or ASIN
      const content = data.contents || '';
      const asinMatch = content.match(/<link rel="canonical" href="([^"]+)"/) || 
                       content.match(/["']asin["']\s*:\s*["']([A-Z0-9]{10})["']/i) || 
                       content.match(/\/dp\/([A-Z0-9]{10})/i);
      
      if (asinMatch) {
        const result = asinMatch[1];
        if (result.length === 10) {
           const domain = detectCountry(url) === 'IN' ? 'amazon.in' : 'amazon.com';
           return `https://www.${domain}/dp/${result}`;
        }
        return result;
      }
    }
  } catch (error) {
    console.warn('AllOrigins expansion failed...');
  }

  // Strategy 3: Try CORSProxy.io direct content scan
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const content = await response.text();
      // Aggressive ASIN search (Amazon IDs almost always start with B0)
      const asinMatch = content.match(/\/dp\/([A-Z0-9]{10})/i) || 
                       content.match(/["']asin["']\s*:\s*["']([A-Z0-9]{10})["']/i) ||
                       content.match(/\b(B0[A-Z0-9]{8})\b/i);
      
      if (asinMatch) {
        const foundAsin = asinMatch[1];
        console.log('ASIN discovered in CORSProxy content:', foundAsin);
        const domain = detectCountry(url) === 'IN' ? 'amazon.in' : 'amazon.com';
        return `https://www.${domain}/dp/${foundAsin}`;
      }
    }
  } catch (error) {
    console.warn('CORSProxy expansion failed...');
  }

  return url; // Final fallback
}
