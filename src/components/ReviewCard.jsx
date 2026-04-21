import { CheckCircle } from 'lucide-react';

export default function ReviewCard({ review, showReasons = true }) {
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  const scoreClass = review.trustScore >= 70 ? 'high' : review.trustScore >= 40 ? 'medium' : 'low';

  return (
    <div className="card review-card">
      <div className="review-card-header">
        <span className="reviewer-name">{review.reviewer}</span>
        <span className="review-stars">{stars}</span>
        {review.verifiedPurchase && (
          <span className="verified-badge">
            <CheckCircle size={12} /> Verified Purchase
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`trust-badge ${review.status}`}>{review.status}</span>
          <div className={`score-circle ${scoreClass}`}>{review.trustScore}</div>
        </div>
      </div>
      <p className="review-text">{review.text}</p>
      <div className="review-footer">
        <span className="review-date">{review.date}</span>
      </div>
      {showReasons && review.reasons && (
        <div className="review-reasons">
          {review.reasons.map((reason, i) => (
            <span key={i} className="reason-tag">{reason}</span>
          ))}
        </div>
      )}
    </div>
  );
}
