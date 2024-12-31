import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchAnimation, setShowSearchAnimation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger search box animation after component mount
    setTimeout(() => setShowSearchAnimation(true), 500);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    setIsLoading(true);
    try {
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
    { text: 'Laptop', icon: '💻' },
    { text: 'Smartphone', icon: '📱' },
    { text: 'Camera', icon: '📸' },
    { text: 'Headphones', icon: '🎧' },
    { text: 'Smart Watch', icon: '⌚' },
    { text: 'TV', icon: '📺' }
  ];

  return (
    <div className="landing-page">
      <div className="landing-background">
        <div className="gradient-overlay"></div>
        <div className="pattern-overlay"></div>
      </div>

      <div className={`landing-content ${showSearchAnimation ? 'animate-in' : ''}`}>
        <div className="brand-section">
          <div className="logo-container">
            <div className="logo">
              <span className="logo-icon">🎯</span>
            </div>
          </div>
          <h1>Expertosy</h1>
          <h2>AI-Powered Recommendation System</h2>
          <p className="tagline">
            Get expert recommendations for anything, powered by advanced AI
            <span className="highlight">Personalized just for you</span>
          </p>
        </div>
        
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="What would you like recommendations for?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-input"
                  onClick={() => setSearchQuery('')}
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>
            <button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="search-button"
            >
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                <>
                  <span>Get Recommendations</span>
                  <span className="button-icon">→</span>
                </>
              )}
            </button>
          </div>
          
          <div className="search-examples">
            <p>Try searching for:</p>
            <div className="example-tags">
              {popularSearches.map((item, index) => (
                <button 
                  key={index}
                  onClick={() => setSearchQuery(item.text)}
                  className="example-tag"
                >
                  <span className="tag-icon">{item.icon}</span>
                  <span className="tag-text">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="features-section">
          <div className="feature">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🤖</span>
            </div>
            <h3>AI-Powered</h3>
            <p>Advanced algorithms analyze thousands of data points for accurate recommendations</p>
          </div>
          <div className="feature">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">⚡</span>
            </div>
            <h3>Lightning Fast</h3>
            <p>Get instant, personalized suggestions tailored to your preferences</p>
          </div>
          <div className="feature">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🎯</span>
            </div>
            <h3>Precise Results</h3>
            <p>Smart filtering ensures you get exactly what you're looking for</p>
          </div>
        </div>

        <div className="trust-section">
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-icon">🌟</span>
              <div className="trust-text">
                <strong>50,000+</strong>
                <span>Recommendations</span>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">👥</span>
              <div className="trust-text">
                <strong>10,000+</strong>
                <span>Happy Users</span>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">⭐</span>
              <div className="trust-text">
                <strong>4.9/5</strong>
                <span>User Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 