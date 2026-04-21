import { useState, useEffect } from 'react';
import { Flag, RefreshCw, AlertOctagon } from 'lucide-react';
import { getLocalReviews } from '../data/api';
import ReviewCard from '../components/ReviewCard';
import EmptyState from '../components/EmptyState';

export default function Flagged() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    try {
      const allReviews = getLocalReviews();
      // Show fake reviews as flagged items
      const flagged = allReviews.filter(r => r.status === 'fake' || r.flagged);
      setReviews(flagged);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    if (window.confirm('Are you sure you want to delete all your locally analyzed products and reviews?')) {
      localStorage.removeItem('analyzed_products');
      localStorage.removeItem('analyzed_reviews');
      loadData();
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Flagged Reviews</h1>
          <p>Reviews detected as fake or highly suspicious</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button className="btn btn-outline" onClick={clearData} style={{ color: 'var(--fake)', borderColor: 'var(--fake)' }}>
            Clear All Data
          </button>
          <button className="btn btn-outline" onClick={loadData}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner" />
          <h3 style={{ marginTop: '12px' }}>Loading flagged reviews...</h3>
        </div>
      )}

      {!loading && error && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <AlertOctagon size={32} style={{ color: 'var(--fake)', marginBottom: '12px' }} />
          <h3>Failed to load data</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && reviews.length === 0 && (
        <EmptyState
          icon={<Flag size={28} />}
          title="No flagged reviews found"
          description="When reviews are detected as fake during analysis, they will appear here for further review"
        />
      )}

      {!loading && !error && reviews.length > 0 && (
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef2f2', color: '#dc2626', fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', marginBottom: '16px' }}>
            <Flag size={10} /> {reviews.length} FLAGGED REVIEWS
          </div>
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} showReasons={true} />
          ))}
        </div>
      )}
    </div>
  );
}
