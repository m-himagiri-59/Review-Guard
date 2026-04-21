import { useState, useEffect } from 'react';
import { BarChart3, Target, AlertOctagon, Package, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import StatCard from '../components/StatCard';
import { computeDashboardStats, getLocalProducts, getLocalReviews } from '../data/api';
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Wait a tiny bit to avoid flickering, or just load directly
      await new Promise(r => setTimeout(r, 100));
      const reviews = getLocalReviews();
      const prods = getLocalProducts();
      
      const computed = computeDashboardStats(reviews, prods);
      setStats(computed);
      setProducts(prods);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Real-time breakdown of review authenticity</p>
        </div>
        <div className="card loading-overlay">
          <div className="loading-spinner" />
          <h3>Loading real-time data...</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fetching from Smart Review API</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Real-time breakdown of review authenticity</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <AlertOctagon size={32} style={{ color: 'var(--fake)', marginBottom: '12px' }} />
          <h3>Failed to load data</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const donutData = {
    labels: ['Genuine', 'Suspicious', 'Fake'],
    datasets: [{
      data: [stats.genuine, stats.suspicious, stats.fake],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 6,
    }],
  };
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 16, usePointStyle: true, pointStyle: 'rect', font: { size: 12 } },
      },
    },
  };

  const barData = {
    labels: stats.ratingDist.labels,
    datasets: [
      { label: 'Genuine', data: stats.ratingDist.genuine, backgroundColor: '#10b981', borderRadius: 3, barPercentage: 0.7 },
      { label: 'Suspicious', data: stats.ratingDist.suspicious, backgroundColor: '#f59e0b', borderRadius: 3, barPercentage: 0.7 },
      { label: 'Fake', data: stats.ratingDist.fake, backgroundColor: '#ef4444', borderRadius: 3, barPercentage: 0.7 },
    ],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { padding: 12, usePointStyle: true, pointStyle: 'rect', font: { size: 11 } },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 }, stepSize: 5 } },
    },
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Real-time breakdown of review authenticity</p>
        </div>
        <button className="btn btn-outline" onClick={loadData} style={{ marginTop: '4px' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="live-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', marginBottom: '16px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} /> LIVE DATA
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          icon={<BarChart3 size={20} />}
          color="blue"
          value={stats.totalAnalyzed}
          label="Total Analyzed"
        />
        <StatCard
          icon={<Target size={20} />}
          color="green"
          value={`${stats.avgTrustScore}/100`}
          label="Avg Trust Score"
        />
        <StatCard
          icon={<AlertOctagon size={20} />}
          color="red"
          value={stats.flagged}
          label="Flagged"
        />
        <StatCard
          icon={<Package size={20} />}
          color="orange"
          value={stats.productsTracked}
          label="Products"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card chart-card">
          <div className="chart-title">Authenticity Distribution</div>
          <div className="chart-subtitle">Genuine vs suspicious vs fake breakdown</div>
          <div className="chart-container" style={{ height: '260px' }}>
            <Doughnut data={donutData} options={donutOptions} />
          </div>
        </div>
        <div className="card chart-card">
          <div className="chart-title">Rating Distribution</div>
          <div className="chart-subtitle">Review authenticity by star rating</div>
          <div className="chart-container" style={{ height: '260px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Recently Analyzed Products */}
      <div className="card recent-products">
        <h3>Recently Analyzed Products ({products.length})</h3>
        {products.map(product => (
          <div key={product.id} className="product-list-item">
            <div className="product-list-info">
              <div className="product-list-name">{product.name}</div>
              <div className="product-list-url">{product.url}</div>
            </div>
            <div className="product-list-stats">
              <span className="genuine-stat">
                {product.genuineCount} <CheckCircle size={13} />
              </span>
              <span className="suspicious-stat">
                {product.suspiciousCount} <AlertTriangle size={13} />
              </span>
              <span className="fake-stat">
                {product.fakeCount} <XCircle size={13} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
