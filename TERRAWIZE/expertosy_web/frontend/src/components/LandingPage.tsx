import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import Navigation from './shared/Navigation';
import './rest.css';

interface PopularSearch {
  name: string;
  icon: string;
}

interface SearchExample {
  text: string;
  icon: string;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const searchExamples: SearchExample[] = [
    { text: "Recommend me a ...", icon: "⭐" },
    { text: "Find me the best ...", icon: "🔍" },
    { text: "I am looking for a ...", icon: "🔎" },
    { text: "Help me choose a ...", icon: "💡" }
  ];

  const popularSearches: PopularSearch[] = [
    { name: "Laptops", icon: "💻" },
    { name: "Smartphones", icon: "📱" },
    { name: "Cameras", icon: "📸" },
    { name: "Smart Watches", icon: "⌚" }
  ];

  const handleExampleClick = (text: string) => {
    setSearchQuery(text.replace("...", ""));
    const searchInput = document.querySelector('.search-box input') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.setSelectionRange(text.indexOf("..."), text.indexOf("..."));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter what you want to find.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/generate-factors', {
        search_query: searchQuery.trim()
      });

      if (response.data && Array.isArray(response.data.factors) && response.data.factors.length > 0) {
        navigate('/questionnaire', {
          state: {
            searchQuery: searchQuery.trim(),
            factors: response.data.factors
          }
        });
      } else {
        setError('Received invalid response format from server. Please try again.');
      }
    } catch (error: any) {
      console.error('Error generating questionnaire:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <Navigation />
      <div className="hero-section">
        <h1 className="hero-title">Expertosy Match</h1>
        <h2 className="hero-subtitle">Find Your Perfect Match with AI-Powered Recommendations</h2>
        
        <div className="search-container">
          <div className="search-box">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="What are you looking to find?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <span>Processing...</span>
                </div>
              ) : (
                "Let's find it"
              )}
            </button>
          </div>

          <div className="location-section">
            <div className="location-option">
              <span>🕒</span>
              <span>Enter location manually</span>
            </div>
            <div className="location-option">
              <span>📍</span>
              <span>Unknown, Unknown, Unknown</span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
        </div>

        <div className="examples-grid">
          {searchExamples.map((example, index) => (
            <button
              key={index}
              className="example-item"
              onClick={() => handleExampleClick(example.text)}
            >
              <span className="example-icon">{example.icon}</span>
              <span className="example-text">{example.text}</span>
            </button>
          ))}
        </div>

        <div className="popular-searches">
          <div className="popular-searches-header">
            <span className="popular-searches-icon">⭐</span>
            <h3>Popular Searches</h3>
          </div>
          <div className="tags">
            {popularSearches.map((search, index) => (
              <button
                key={index}
                className="tag"
                onClick={() => setSearchQuery(search.name)}
              >
                <span className="tag-icon">{search.icon}</span>
                <span>{search.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 