import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchAnimation, setShowSearchAnimation] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger search box animation after component mount
    setTimeout(() => setShowSearchAnimation(true), 500);

    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      return;
    }

    setIsLoading(true);
    try {
      // Save to recent searches
      const updatedSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

      // Generate factors
      const factorsResponse = await axios.post('http://localhost:5001/generate-factors', {
        search_query: searchQuery
      });

      // Navigate to questionnaire with factors
      navigate('/questionnaire', { 
        state: { 
          searchQuery, 
          factors: factorsResponse.data.factors 
        } 
      });
    } catch (error) {
      console.error('Error generating factors:', error);
      alert('Failed to generate factors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };

  const popularSearches = [
    { text: 'Laptop', icon: '💻', category: 'Tech' },
    { text: 'Smartphone', icon: '📱', category: 'Tech' },
    { text: 'Camera', icon: '📸', category: 'Tech' },
    { text: 'Headphones', icon: '🎧', category: 'Tech' },
    { text: 'Smart Watch', icon: '⌚', category: 'Tech' },
    { text: 'TV', icon: '📺', category: 'Tech' },
    { text: 'Running Shoes', icon: '👟', category: 'Sports' },
    { text: 'Coffee Maker', icon: '☕', category: 'Home' },
    { text: 'Backpack', icon: '🎒', category: 'Travel' }
  ];

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Intelligence',
      description: 'Our advanced AI analyzes thousands of data points to provide the most accurate recommendations tailored to your needs.'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast Results',
      description: 'Get instant, personalized suggestions in seconds, saving you hours of research and comparison.'
    },
    {
      icon: '🎯',
      title: 'Precise & Accurate',
      description: 'Smart filtering and matching algorithms ensure you get exactly what you\'re looking for, every time.'
    },
    {
      icon: '🔒',
      title: 'Privacy Focused',
      description: 'Your preferences and data are always protected. We never share your information with third parties.'
    }
  ];

  return (
    <div className="landing-page">
      <div className="landing-background">
        <div className="gradient-overlay"></div>
        <div className="pattern-overlay"></div>
        <div className="floating-shapes">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`floating-shape shape-${i + 1}`} />
          ))}
        </div>
      </div>

      <div className={`landing-content ${showSearchAnimation ? 'animate-in' : ''}`}>
        <div className="brand-section">
          <div className="logo-container">
            <div className="logo">
              <span className="logo-icon">🎯</span>
            </div>
          </div>
          <h1>
            <span className="gradient-text">Expertosy</span>
          </h1>
          <h2>AI-Powered Recommendation System</h2>
          <p className="tagline">
            Get expert recommendations for anything
            <span className="highlight">Personalized just for you</span>
          </p>
        </div>
        
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon pulse-animation">🔍</span>
              <input 
                type="text" 
                placeholder="What would you like recommendations for?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="search-input"
                aria-label="Search input"
              />
              {searchQuery && (
                <button 
                  className="clear-input"
                  onClick={() => setSearchQuery('')}
                  type="button"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
              {showTooltip && (
                <div className="search-tooltip">
                  Please enter what you're looking for
                </div>
              )}
            </div>
            <button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="search-button"
              aria-label="Get recommendations"
            >
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                <>
                  <span>Get Smart Recommendations</span>
                  <span className="button-icon">→</span>
                </>
              )}
            </button>
          </div>
          
          <div className="search-examples">
            <div className="recent-searches">
              {recentSearches.length > 0 && (
                <>
                  <p>Recent searches:</p>
                  <div className="recent-tags">
                    {recentSearches.map((search, index) => (
                      <button 
                        key={index}
                        onClick={() => setSearchQuery(search)}
                        className="recent-tag"
                      >
                        <span className="tag-icon">🕒</span>
                        <span className="tag-text">{search}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <p>Popular recommendations:</p>
            <div className="example-tags">
              {popularSearches.map((item, index) => (
                <button 
                  key={index}
                  onClick={() => setSearchQuery(item.text)}
                  className="example-tag"
                  data-category={item.category}
                >
                  <span className="tag-icon">{item.icon}</span>
                  <span className="tag-text">{item.text}</span>
                  <span className="tag-category">{item.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="features-section">
          {features.map((feature, index) => (
            <div key={index} className="feature">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">{feature.icon}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="trust-section">
          <h3 className="section-title">Trusted by Thousands</h3>
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-icon">🌟</span>
              <div className="trust-text">
                <strong className="counter">50,000+</strong>
                <span>Recommendations</span>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">👥</span>
              <div className="trust-text">
                <strong className="counter">10,000+</strong>
                <span>Happy Users</span>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">⭐</span>
              <div className="trust-text">
                <strong className="counter">4.9/5</strong>
                <span>User Rating</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="landing-footer">
          <p>Powered by advanced AI technology</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#about">About Us</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage; 