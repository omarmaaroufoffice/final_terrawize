import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const popularSearches = [
    'laptop', 'smartphone', 'headphones', 'camera', 'smartwatch',
    'gaming console', 'tablet', 'monitor', 'keyboard', 'mouse'
  ];

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
      <div className="background-effects">
        <div className="gradient-overlay"></div>
        <div className="pattern-grid"></div>
        <div className="floating-circles">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`circle circle-${i + 1}`}></div>
          ))}
        </div>
      </div>

      <div className="content-container">
        <div className="hero-section">
          <h1 className="main-title">
            Find Your Perfect Match with
            <span className="highlight"> AI-Powered</span> Recommendations
          </h1>
          
          <p className="subtitle">
            Tell us what you're looking for, and we'll guide you to the best choice through
            personalized questions and expert analysis.
          </p>

          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking to find? (e.g., laptop, smartphone, camera)"
                className={error ? 'error' : ''}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                className="search-button"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <>
                    <span className="button-text">Find My Match</span>
                    <span className="button-icon">→</span>
                  </>
                )}
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>

          <div className="popular-searches">
            <h3>Popular Searches</h3>
            <div className="tags">
              {popularSearches.map((query, index) => (
                <button
                  key={index}
                  className="tag"
                  onClick={() => handlePopularSearch(query)}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="features-section">
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Personalized Recommendations</h3>
              <p>Get tailored suggestions based on your specific needs and preferences.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Analysis</h3>
              <p>Advanced algorithms analyze thousands of options to find your perfect match.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Smart Comparison</h3>
              <p>Compare features and trade-offs to make informed decisions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Quick Results</h3>
              <p>Get instant recommendations after answering a few simple questions.</p>
            </div>
          </div>
        </div>

        <div className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Tell Us What You Need</h3>
              <p>Enter what you're looking for, and we'll start the search process.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Answer Questions</h3>
              <p>Respond to personalized questions about your preferences and needs.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Recommendations</h3>
              <p>Receive a curated list of the best matches for your requirements.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 