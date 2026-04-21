import { useState, useEffect } from 'react';
import { Link2, Search, Star, RefreshCw, AlertOctagon, Database, X, Trash2 } from 'lucide-react';
import { fetchReviews, fetchProducts, saveLocalProduct, getLocalProducts, getLocalReviews } from '../data/api';
import { fetchAndAnalyzeProduct } from '../data/rapidapi';
import ReviewCard from '../components/ReviewCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

export default function Reviews() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('all');

  // Real-time reviewed data
  const [liveReviews, setLiveReviews] = useState([]);
  const [liveProducts, setLiveProducts] = useState([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadLiveData();
  }, []);

  const loadLiveData = async () => {
    setLiveLoading(true);
    setLiveError(null);
    try {
      const products = getLocalProducts();
      const reviews = getLocalReviews();
      setLiveReviews(reviews);
      setLiveProducts(products.slice(0, 5));
    } catch (err) {
      setLiveError(err.message);
    } finally {
      setLiveLoading(false);
    }
  };
  const [analyzeError, setAnalyzeError] = useState(null);

  // Fetch & Analyze with RapidAPI (real Amazon data)
  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setSelectedProduct(null);
    setAnalyzeError(null);

    try {
      let data;
      try {
        // Try RapidAPI first (for real-time detailed reviews)
        data = await fetchAndAnalyzeProduct(url.trim());
      } catch (rapidErr) {
        console.warn('RapidAPI analysis failed, trying backend fallback...', rapidErr);
        // Fallback to our own AI backend
        const backendData = await analyzeProductUrl(url.trim());
        // Map backend data to our expected format
        data = {
          product: {
            ...backendData.product,
            asin: backendData.product.id,
            platform: backendData.product.platform || 'Amazon'
          },
          reviews: backendData.reviews
        };
      }
      
      const formattedProduct = {
        id: data.product.asin || data.product.id || `amz-${Date.now()}`,
        name: data.product.name,
        url: url.trim(),
        platform: data.product.platform || 'Amazon',
        imageUrl: data.product.image || data.product.imageUrl,
        totalReviews: data.product.totalReviews,
        genuineCount: data.product.genuineCount,
        suspiciousCount: data.product.suspiciousCount,
        fakeCount: data.product.fakeCount,
        avgTrustScore: data.product.trustScore,
        createdDate: new Date().toISOString()
      };
      const formattedReviews = data.reviews.map(r => ({
        ...r,
        productId: formattedProduct.id
      }));

      saveLocalProduct(formattedProduct, formattedReviews);

      setResult({ product: data.product, reviews: data.reviews });
      setUrl('');
      loadLiveData();
    } catch (err) {
      setAnalyzeError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show reviews for a selected real product
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setResult(null);
    setFilter('all');
  };

  // Remove a single product from the list
  const removeProduct = (e, productId) => {
    e.stopPropagation();
    setLiveProducts(prev => prev.filter(p => p.id !== productId));
    setLiveReviews(prev => prev.filter(r => r.productId !== productId));
  };

  // Clear all pre-processed data
  const clearAllProducts = () => {
    setLiveProducts([]);
    setLiveReviews([]);
  };

  // Determine which reviews to show
  let displayReviews = [];
  let displayProduct = null;
  let hasDetailedReviews = false;

  if (selectedProduct) {
    displayProduct = selectedProduct;
    displayReviews = liveReviews.filter(r => r.productId === selectedProduct.id);
    hasDetailedReviews = displayReviews.length > 0;
  } else if (result) {
    displayProduct = result.product;
    displayReviews = result.reviews;
    hasDetailedReviews = true;
  }

  const filteredReviews = displayReviews.filter(r =>
    filter === 'all' ? true : r.status === filter
  );

  const counts = displayReviews.length > 0 ? {
    all: displayReviews.length,
    genuine: displayReviews.filter(r => r.status === 'genuine').length,
    suspicious: displayReviews.filter(r => r.status === 'suspicious').length,
    fake: displayReviews.filter(r => r.status === 'fake').length,
  } : {};

  return (
    <div>
      <div className="page-header">
        <h1>Review Analysis</h1>
        <p>Paste a product URL to analyze, or browse real analyzed reviews below</p>
      </div>

      {/* Input Section */}
      <div className="input-section">
        <div className="card">
          <div className="input-label">
            <Link2 size={18} /> Product URL
          </div>
          <div className="input-row">
            <input
              type="text"
              className="url-input"
              placeholder="https://www.amazon.in/dp/B0XXXXXX..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            />
            <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>
              <Search size={18} /> Fetch & Analyze
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && <LoadingState />}

      {/* Analysis Error */}
      {analyzeError && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '30px', marginBottom: '16px' }}>
          <AlertOctagon size={28} style={{ color: 'var(--fake)', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '0.95rem', marginBottom: '6px' }}>Analysis Failed</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{analyzeError}</p>
        </div>
      )}

      {/* Real-time Analyzed Products */}
      {!loading && !result && !selectedProduct && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                Previously Analyzed Products
              </h3>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#059669', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} /> LOCAL
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-outline" onClick={loadLiveData} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
          </div>

          {liveLoading && (
            <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
              <div className="loading-spinner" />
              <p style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading analyzed products...</p>
            </div>
          )}

          {liveError && (
            <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
              <AlertOctagon size={24} style={{ color: 'var(--fake)', marginBottom: '8px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{liveError}</p>
            </div>
          )}

          {!liveLoading && !liveError && liveProducts.length > 0 && (
            <div className="product-browse-grid">
              {liveProducts.map(product => {
                const reviewCount = liveReviews.filter(r => r.productId === product.id).length;
                const hasReviews = reviewCount > 0;
                return (
                  <div
                    key={product.id}
                    className="card product-browse-card"
                    onClick={() => handleSelectProduct(product)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    <button
                      onClick={(e) => removeProduct(e, product.id)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', borderRadius: '4px', transition: 'color 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.color = 'var(--fake)'}
                      onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      title="Remove product"
                    >
                      <X size={14} />
                    </button>
                    <div className="product-browse-name" style={{ paddingRight: '20px' }}>{product.name}</div>
                    <div className="product-meta" style={{ marginTop: '8px' }}>
                      <span className="trust-badge genuine" style={{ textTransform: 'capitalize' }}>
                        {product.platform}
                      </span>
                      {hasReviews ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--primary-bg)', color: 'var(--primary)', padding: '1px 6px', borderRadius: '8px' }}>
                          {reviewCount} detailed reviews
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {product.totalReviews} reviews (summary only)
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--genuine)' }}>✓ {product.genuineCount}</span>
                      <span style={{ color: 'var(--suspicious)' }}>⚠ {product.suspiciousCount}</span>
                      <span style={{ color: 'var(--fake)' }}>✕ {product.fakeCount}</span>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                      Trust Score: <span style={{ color: product.avgTrustScore >= 70 ? 'var(--genuine)' : product.avgTrustScore >= 40 ? 'var(--suspicious)' : 'var(--fake)' }}>
                        {product.avgTrustScore}/100
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!liveLoading && !liveError && liveProducts.length === 0 && (
            <EmptyState
              title="No locally analyzed products"
              description="Paste a product URL above and hit Fetch & Analyze to start detecting fake reviews with AI"
            />
          )}
        </div>
      )}

      {/* Results (real or simulated) */}
      {!loading && (displayReviews.length > 0 || selectedProduct) && (
        <div>
          {/* Back button for live product view */}
          {selectedProduct && (
            <button
              className="btn btn-outline"
              onClick={() => { setSelectedProduct(null); setFilter('all'); }}
              style={{ marginBottom: '12px', fontSize: '0.85rem' }}
            >
              ← Back to Products
            </button>
          )}

          {/* Product Info */}
          <div className="card product-info-card" style={{ marginBottom: '16px' }}>
            <div className="product-header">
              {result?.product?.image ? (
                <img src={result.product.image} alt="" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', background: '#f8f9fa', flexShrink: 0 }} />
              ) : (
                <div className="product-image-placeholder">
                  <Star size={24} />
                </div>
              )}
              <div className="product-details">
                <div className="product-name">
                  {selectedProduct ? selectedProduct.name : result?.product?.name}
                </div>
                <div className="product-meta">
                  <span className="trust-badge genuine" style={{ textTransform: 'capitalize' }}>
                    {selectedProduct ? selectedProduct.platform : result?.product?.platform}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {displayReviews.length} reviews analyzed
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  {(() => {
                    const score = selectedProduct?.avgTrustScore || result?.product?.trustScore || 0;
                    return (
                      <>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Trust Score: {score}/100</span>
                        <span className={`trust-badge ${score >= 70 ? 'genuine' : score >= 40 ? 'suspicious' : 'fake'}`}>
                          {score >= 70 ? 'Trustworthy' : score >= 40 ? 'Moderate' : 'Low Trust'}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            {['all', 'genuine', 'suspicious', 'fake'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="filter-count">{counts[f]}</span>
              </button>
            ))}
          </div>

          {/* Review Cards */}
          {hasDetailedReviews && filteredReviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {/* No detailed reviews message */}
          {selectedProduct && !hasDetailedReviews && (
            <div className="card" style={{ textAlign: 'center', padding: '40px', marginTop: '16px' }}>
              <Database size={28} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Summary Only</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
                This product has {selectedProduct.totalReviews} reviews analyzed but individual review details are not available. The trust score and breakdown above are from the aggregate analysis.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--genuine)', fontWeight: 600 }}>✓ {selectedProduct.genuineCount} Genuine</span>
                <span style={{ color: 'var(--suspicious)', fontWeight: 600 }}>⚠ {selectedProduct.suspiciousCount} Suspicious</span>
                <span style={{ color: 'var(--fake)', fontWeight: 600 }}>✕ {selectedProduct.fakeCount} Fake</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
