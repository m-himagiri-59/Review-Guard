import { useState } from 'react';
import { ClipboardEdit } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';

export default function SubmitReview() {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [purchaseStatus, setPurchaseStatus] = useState('verified');
  const [reviewerName, setReviewerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    if (!reviewText.trim()) return;
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      // Simulate AI analysis based on text characteristics
      const text = reviewText.toLowerCase();
      const exclamationCount = (reviewText.match(/!/g) || []).length;
      const wordCount = reviewText.split(/\s+/).length;
      const hasSpecifics = /battery|screen|camera|quality|build|size|weight|color|speed|performance/i.test(reviewText);
      const allCaps = (reviewText.match(/[A-Z]{3,}/g) || []).length;
      const isGeneric = /best|amazing|awesome|worst|terrible|horrible|perfect/i.test(reviewText) && wordCount < 20;

      let trustScore, status, reasons;

      if (isGeneric || exclamationCount > 3 || allCaps > 2) {
        if (exclamationCount > 5 || (allCaps > 3 && !hasSpecifics)) {
          trustScore = 10 + Math.floor(Math.random() * 15);
          status = 'fake';
          reasons = ['Excessive punctuation', 'No specific details', 'Pattern matches known fake templates', 'Extreme sentiment'];
        } else {
          trustScore = 30 + Math.floor(Math.random() * 20);
          status = 'suspicious';
          reasons = ['Generic language', 'Lacks specific product details', 'Repetitive phrasing', 'Unverified pattern'];
        }
      } else if (hasSpecifics && wordCount > 15) {
        trustScore = 75 + Math.floor(Math.random() * 20);
        status = 'genuine';
        reasons = ['Specific features mentioned', 'Balanced feedback', 'Natural language', 'Detailed experience'];
      } else {
        trustScore = 40 + Math.floor(Math.random() * 25);
        status = 'suspicious';
        reasons = ['Short review length', 'Limited detail', 'Could not verify patterns'];
      }

      if (purchaseStatus !== 'verified') {
        trustScore = Math.max(5, trustScore - 15);
        reasons.push('Unverified purchase');
      }

      setResult({
        id: 1,
        text: reviewText,
        rating,
        reviewer: reviewerName || 'Anonymous',
        verifiedPurchase: purchaseStatus === 'verified',
        status,
        trustScore,
        reasons,
        date: new Date().toISOString().split('T')[0],
      });
      setLoading(false);
    }, 1800);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Submit a Review</h1>
        <p>Manually enter a review to check its authenticity</p>
      </div>

      <div className="card submit-form">
        <div className="form-group">
          <label className="form-label">Review Text</label>
          <textarea
            className="form-textarea"
            placeholder="Paste or type the review text here..."
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Star Rating</label>
            <div className="star-input">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  className={s <= rating ? 'active' : ''}
                  onClick={() => setRating(s)}
                  type="button"
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Purchase Status</label>
            <select
              className="form-select"
              value={purchaseStatus}
              onChange={e => setPurchaseStatus(e.target.value)}
            >
              <option value="verified">Verified Purchase</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Reviewer Name <em>(optional)</em></label>
          <input
            type="text"
            className="form-input"
            placeholder="John Doe"
            value={reviewerName}
            onChange={e => setReviewerName(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAnalyze}
          disabled={loading || !reviewText.trim()}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <ClipboardEdit size={18} />
          {loading ? 'Analyzing...' : 'Analyze This Review'}
        </button>
      </div>

      {/* Result */}
      {loading && (
        <div className="card loading-overlay" style={{ marginTop: '20px' }}>
          <div className="loading-spinner" />
          <h3>Analyzing review...</h3>
        </div>
      )}

      {result && !loading && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Analysis Result</h3>
          <ReviewCard review={result} showReasons={true} />
        </div>
      )}
    </div>
  );
}
