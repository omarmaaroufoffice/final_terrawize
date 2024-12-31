import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="brand-section">
          <div className="logo-container">
            <div className="logo">
              <span className="logo-icon">🎯</span>
            </div>
          </div>
          <h1>Expertosy</h1>
          <h2>AI-Powered Recommendation System</h2>
          <p className="tagline">Get personalized recommendations for any product or service, powered by advanced AI technology</p>
        </div>
        
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="What would you like recommendations for? (e.g., laptop, camera, vacation)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="search-input"
              />
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
                <>Get Recommendations</>
              )}
            </button>
          </div>
          
          <div className="search-examples">
            <p>Popular searches:</p>
            <div className="example-tags">
              <button onClick={() => setSearchQuery('laptop')}>Laptop</button>
              <button onClick={() => setSearchQuery('smartphone')}>Smartphone</button>
              <button onClick={() => setSearchQuery('camera')}>Camera</button>
              <button onClick={() => setSearchQuery('headphones')}>Headphones</button>
            </div>
          </div>
        </div>

        <div className="features-section">
          <div className="feature">
            <span className="feature-icon">🤖</span>
            <h3>AI-Powered</h3>
            <p>Advanced algorithms for accurate recommendations</p>
          </div>
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <h3>Fast Results</h3>
            <p>Get instant, personalized suggestions</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <h3>Precise</h3>
            <p>Tailored to your specific needs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 