import { useState, useEffect } from 'react';
import { Link2, Search, Star, Trash2, TrendingDown, TrendingUp, RefreshCw, AlertOctagon, Database } from 'lucide-react';
import { fetchSerpApiPrice } from '../data/serpapi';
import { analyzeProductUrl } from '../data/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function PriceTracker() {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('Amazon');
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      let data;
      try {
        // Try real-time SerpAPI first
        data = await fetchSerpApiPrice(url.trim());
      } catch (serpErr) {
        console.warn('SerpAPI failed, trying backend fallback...', serpErr);
        // Fallback to AI backend
        const backendData = await analyzeProductUrl(url.trim());
        
        data = {
          id: `ai-price-${Date.now()}`,
          productName: backendData.product.name,
          productUrl: url.trim(),
          imageUrl: backendData.product.image,
          platform: 'Amazon',
          currentPrice: backendData.product.currentPrice,
          originalPrice: backendData.product.originalPrice,
          lowestPrice: Math.min(...backendData.priceHistory.map(h => h.price)),
          highestPrice: Math.max(...backendData.priceHistory.map(h => h.price)),
          discount: backendData.product.discount,
          rating: backendData.product.rating,
          reviewCount: backendData.product.totalReviews,
          priceHistory: backendData.priceHistory
        };
      }

      // Add fetched product to the front if not already tracked
      setTrackedProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        if (!existingIds.has(data.id)) {
          return [data, ...prev];
        }
        return prev;
      });
      setUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = (id) => {
    setTrackedProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Price Tracker</h1>
        <p>Track price history and fluctuations for any product</p>
      </div>

      {/* Input */}
      <div className="input-section">
        <div className="card">
          <div className="input-label">
            <Link2 size={18} /> Add Product to Track
          </div>
          <div className="input-row">
            <input
              type="text"
              className="url-input"
              placeholder="https://www.amazon.in/dp/B0XXXXXX..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTrack()}
            />
            <button className="btn btn-primary" onClick={handleTrack} disabled={loading}>
              <Search size={18} /> Track Price
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner" />
          <h3 style={{ marginTop: '12px' }}>Loading price data...</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fetching real-time price history</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <AlertOctagon size={32} style={{ color: 'var(--fake)', marginBottom: '12px' }} />
          <h3>Failed to load price data</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{error}</p>
          <button className="btn btn-primary" onClick={handleTrack}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}

      {/* Tracked Products */}
      {!loading && !error && trackedProducts.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Database size={28} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
          <h3>No price history found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Add a product URL above to start tracking prices</p>
        </div>
      )}

      {!loading && !error && trackedProducts.map(product => (
        <ProductPriceCard key={product.id} product={product} onRemove={removeProduct} />
      ))}
    </div>
  );
}

function ProductPriceCard({ product, onRemove }) {
  const history = product.priceHistory;
  const hasHistory = history && history.length > 0;
  const lowest = product.lowestPrice || (hasHistory ? Math.min(...history.map(h => h.price)) : 0);
  const highest = product.highestPrice || (hasHistory ? Math.max(...history.map(h => h.price)) : 0);
  const priceChange = product.originalPrice - product.currentPrice;

  const chartData = hasHistory ? {
    labels: history.map(h => h.date),
    datasets: [{
      data: history.map(h => h.price),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.05)',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: history.map(h => h.label ? '#6366f1' : 'transparent'),
      pointBorderColor: history.map(h => h.label ? '#6366f1' : 'transparent'),
      pointHoverBackgroundColor: '#6366f1',
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const point = history[ctx.dataIndex];
            const label = point?.label ? ` — ${point.label}` : '';
            return `₹${ctx.parsed.y.toLocaleString()}${label}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#94a3b8', maxRotation: 0, maxTicksLimit: 7 },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: {
          font: { size: 10 }, color: '#94a3b8',
          callback: (v) => `₹${(v / 1000).toFixed(0)}k`,
        },
      },
    },
  };

  return (
    <div className="card product-info-card" style={{ marginBottom: '20px' }}>
      <div className="product-header">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.productName}
            style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '8px', background: '#f8f9fa' }}
          />
        ) : (
          <div className="product-image-placeholder">
            <Star size={24} />
          </div>
        )}
        <div className="product-details" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="product-name">{product.productName}</div>
            <button className="delete-btn" onClick={() => onRemove(product.id)}>
              <Trash2 size={16} />
            </button>
          </div>
          <div className="product-meta">
            <span className="trust-badge genuine" style={{ textTransform: 'capitalize' }}>{product.platform}</span>
            <span className="product-rating">
              <Star size={14} fill="#f59e0b" stroke="#f59e0b" /> {product.rating}/5
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {product.reviewCount}
            </span>
          </div>
        </div>
      </div>

      <div className="price-section">
        <div className="price-row">
          <span className="current-price">₹{product.currentPrice?.toLocaleString()}</span>
          <span className="original-price">₹{product.originalPrice?.toLocaleString()}</span>
          {product.discount > 0 && (
            <span className="discount-badge">-{product.discount}% OFF</span>
          )}
        </div>
        {priceChange > 0 && (
          <div className="price-change">
            <TrendingDown size={14} /> ₹{priceChange.toLocaleString()} saved from MRP
          </div>
        )}
        <div className="price-extremes">
          <div className="price-extreme">
            <TrendingDown size={12} style={{ color: 'var(--genuine)' }} /> Lowest: <span>₹{lowest.toLocaleString()}</span>
          </div>
          <div className="price-extreme">
            <TrendingUp size={12} style={{ color: 'var(--fake)' }} /> Highest: <span>₹{highest.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      {hasHistory && chartData && (
        <div style={{ marginTop: '20px' }}>
          <div className="chart-title">Price History</div>
          <div className="chart-container" style={{ height: '220px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
          {/* Price event labels */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {history.filter(h => h.label).map((h, i) => (
              <span key={i} className="reason-tag" style={{ fontSize: '0.7rem' }}>
                {h.date}: {h.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
