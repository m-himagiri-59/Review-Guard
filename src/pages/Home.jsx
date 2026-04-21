import { useNavigate } from 'react-router-dom';
import { Search, Shield, TrendingDown, BarChart3, Star, Zap } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        {/* Vignan Logos (Responsive) */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '24px' }}>
          {/* Desktop Logo */}
          <img 
            src="/vignanlogo.png" 
            alt="Vignan's Institute of Information Technology" 
            className="desktop-logo"
            style={{ height: '105px', objectFit: 'contain' }}
          />
          {/* Mobile Logo */}
          <img 
            src="/logo.png" 
            alt="Vignan's Institute of Information Technology Mobile Logo" 
            className="mobile-logo"
            style={{ height: '40px', width: '40px', objectFit: 'contain' }}
          />
        </div>

        <h1>
          Smart Review <span>Monitor</span>
        </h1>
        <p>
          Detect fake, spam, and bot-generated product reviews instantly.
          Paste any product link and get AI-powered authenticity analysis.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={() => navigate('/reviews')}>
            <Search size={18} /> Analyze Reviews
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
            View Dashboard →
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <h2>How It Works</h2>
        <div className="how-steps">
          <div className="card how-step">
            <div className="step-number">01</div>
            <h3>Paste URL</h3>
            <p>Enter any product link from Amazon</p>
          </div>
          <div className="card how-step">
            <div className="step-number">02</div>
            <h3>AI Analyzes</h3>
            <p>Our AI fetches reviews and analyzes each one for authenticity patterns</p>
          </div>
          <div className="card how-step">
            <div className="step-number">03</div>
            <h3>Get Results</h3>
            <p>See every review labeled as Genuine, Suspicious, or Fake with trust scores</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="card feature-card">
            <div className="feature-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
              <Search size={24} />
            </div>
            <h3>Review Analysis</h3>
            <p>AI-powered detection of fake, spam, and bot-generated reviews</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon" style={{ background: 'var(--genuine-bg)', color: 'var(--genuine)' }}>
              <TrendingDown size={24} />
            </div>
            <h3>Price Tracking</h3>
            <p>Monitor price history and fluctuations for any product</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon" style={{ background: 'var(--suspicious-bg)', color: 'var(--suspicious)' }}>
              <BarChart3 size={24} />
            </div>
            <h3>Trust Scoring</h3>
            <p>Each review gets a trust score based on multiple AI signals</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon" style={{ background: 'var(--fake-bg)', color: 'var(--fake)' }}>
              <Zap size={24} />
            </div>
            <h3>Instant Results</h3>
            <p>Get detailed analysis results in seconds, not minutes</p>
          </div>
        </div>
      </section>
    </div>
  );
}
