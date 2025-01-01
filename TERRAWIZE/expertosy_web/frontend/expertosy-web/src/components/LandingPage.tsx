import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LandingPage.css';

interface PopularSearch {
  name: string;
  icon: string;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const popularSearches: PopularSearch[] = [
    { name: 'Laptops', icon: '💻' },
    { name: 'Smartphones', icon: '📱' },
    { name: 'Cameras', icon: '📸' },
    { name: 'Headphones', icon: '🎧' },
    { name: 'Smart Watches', icon: '⌚' }
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

  const handlePopularSearch = (search: PopularSearch) => {
    setSearchQuery(search.name);
    handleSearch();
  };

  return (
    <div className="landing-page">
      <div className="background-effects">
        <div className="constellation-grid" />
        <div className="nebula-overlay" />
        <div className="floating-constellations">
          {[...Array(5)].map((_, index) => (
            <div 
              key={index} 
              className="constellation"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${index * 0.5}s`
              }}
            />
          ))}
        </div>
      </div>
      
      <nav className="nav-header">
        <div className="nav-content">
          <div className="logo">
            <span className="logo-icon">⭐</span>
            <span className="logo-text">Expertosy</span>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="main-title">
            Discover Your Perfect <span className="highlight">Product</span>
          </h1>
          <p className="subtitle">
            Navigate through the stars of possibilities as our AI constellation guides you to your ideal choice
          </p>
          
          <div className="search-container">
            <div className="search-box">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button className="search-button" onClick={handleSearch}>
                <span>Begin Journey</span>
                <span className="button-star">✨</span>
              </button>
            </div>
          </div>

          <div className="popular-searches">
            <h3>Popular Constellations</h3>
            <div className="tags">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  className="tag"
                  onClick={() => handlePopularSearch(search)}
                >
                  <span className="tag-icon">{search.icon}</span>
                  {search.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

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
  );
};

export default LandingPage; 