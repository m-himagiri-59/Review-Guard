export default function LoadingState() {
  return (
    <div className="card loading-overlay">
      <div className="loading-spinner" />
      <h3>AI is analyzing reviews...</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>This may take a few moments</p>
      <div className="loading-steps">
        <div className="loading-step done">
          <span className="step-dot" />
          Fetching product reviews
        </div>
        <div className="loading-step done">
          <span className="step-dot" />
          Processing review text
        </div>
        <div className="loading-step active">
          <span className="step-dot" />
          Running AI authenticity analysis
        </div>
        <div className="loading-step">
          <span className="step-dot" />
          Generating trust scores
        </div>
      </div>
    </div>
  );
}
