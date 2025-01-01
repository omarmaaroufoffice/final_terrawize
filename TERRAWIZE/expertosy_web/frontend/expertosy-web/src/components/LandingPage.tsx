import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const popularSearches = [
    { name: 'laptop', icon: '💻' },
    { name: 'smartphone', icon: '📱' },
    { name: 'headphones', icon: '🎧' },
    { name: 'camera', icon: '📸' },
    { name: 'smartwatch', icon: '⌚' },
    { name: 'gaming console', icon: '🎮' },
    { name: 'tablet', icon: '📱' },
    { name: 'monitor', icon: '🖥️' },
    { name: 'keyboard', icon: '⌨️' },
    { name: 'mouse', icon: '🖱️' }
  ];

  const features = [
    {
      icon: '🎯',
      title: 'Smart Recommendations',
      description: 'AI-powered suggestions tailored to your unique preferences and needs'
    },
    {
      icon: '🤖',
      title: 'Advanced Analysis',
      description: 'Deep learning algorithms process thousands of data points for accuracy'
    },
    {
      icon: '💡',
      title: 'Intelligent Comparison',
      description: 'Smart feature comparison helps you make informed decisions'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Get instant, personalized recommendations in seconds'
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const rotateFeatures = () => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    };

    window.addEventListener('scroll', handleScroll);
    const featureInterval = setInterval(rotateFeatures, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(featureInterval);
    };
  }, [features.length]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter what you want to find.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/generate-factors', {
        search_query: searchQuery
      });

      navigate('/questionnaire', {
        state: {
          searchQuery,
          factors: response.data.factors
        }
      });
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to start the search. Please try again.');
      setIsLoading(false);
    }
  };

  const handlePopularSearch = (query: string) => {
    setSearchQuery(query);
    handleSearch();
  };

  return (
    <div className="landing-page">
      <div className={`nav-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">Expertosy</span>
          </div>
        </div>
      </div>

      <div className="background-effects">
        <div className="gradient-overlay"></div>
        <div className="pattern-grid"></div>
        <div className="floating-circles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`circle circle-${i + 1}`}></div>
          ))}
        </div>
        <div className="particle-network">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
      </div>

      <div className="content-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="main-title">
              Discover Your
              <span className="highlight"> Perfect Match</span>
              <br />
              with AI-Powered Magic
            </h1>
            
            <p className="subtitle">
              Experience the future of product discovery. Our advanced AI analyzes millions of 
              data points to find exactly what you need, tailored to your preferences.
            </p>

            <div className="search-container">
              <div className="search-box">
                <div className="search-input-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What are you looking to find? (e.g., laptop, smartphone, camera)"
                    className={error ? 'error' : ''}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button 
                  className="search-button"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="loading-animation">
                      <div className="loading-ring"></div>
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="button-text">Find My Perfect Match</span>
                      <span className="button-icon">→</span>
                    </>
                  )}
                </button>
              </div>
              {error && <p className="error-message">{error}</p>}
            </div>

            <div className="popular-searches">
              <h3>Popular Discoveries</h3>
              <div className="tags">
                {popularSearches.map((item, index) => (
                  <button
                    key={index}
                    className="tag"
                    onClick={() => handlePopularSearch(item.name)}
                  >
                    <span className="tag-icon">{item.icon}</span>
                    <span className="tag-text">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="features-section">
          <div className="section-header">
            <h2>Why Choose Us</h2>
            <p>Experience the power of AI-driven recommendations</p>
          </div>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card ${index === activeFeature ? 'active' : ''}`}
              >
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-hover-effect"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="how-it-works">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Three simple steps to find your perfect match</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-content">
                <div className="step-number">1</div>
                <h3>Tell Us What You Need</h3>
                <p>Share your requirements and let our AI understand your needs</p>
              </div>
              <div className="step-illustration">
                <div className="step-icon">🎯</div>
              </div>
            </div>
            <div className="step">
              <div className="step-content">
                <div className="step-number">2</div>
                <h3>Answer Smart Questions</h3>
                <p>Our AI asks targeted questions to understand your preferences</p>
              </div>
              <div className="step-illustration">
                <div className="step-icon">💭</div>
              </div>
            </div>
            <div className="step">
              <div className="step-content">
                <div className="step-number">3</div>
                <h3>Get Perfect Matches</h3>
                <p>Receive personalized recommendations tailored just for you</p>
              </div>
              <div className="step-illustration">
                <div className="step-icon">✨</div>
              </div>
            </div>
          </div>
        </div>

        <div className="trust-section">
          <div className="trust-content">
            <div className="trust-header">
              <h2>Trusted by Thousands</h2>
              <p>Join our growing community of satisfied users</p>
            </div>
            <div className="trust-metrics">
              <div className="metric">
                <div className="metric-value">50k+</div>
                <div className="metric-label">Recommendations</div>
              </div>
              <div className="metric">
                <div className="metric-value">98%</div>
                <div className="metric-label">Satisfaction Rate</div>
              </div>
              <div className="metric">
                <div className="metric-value">10k+</div>
                <div className="metric-label">Happy Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 