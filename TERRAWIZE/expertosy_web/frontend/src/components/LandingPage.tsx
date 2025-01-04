import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';
import Navigation from './shared/Navigation';
import './LandingPage.css';

interface PopularSearch {
  name: string;
  icon: string;
  description: string;
}

interface SearchExample {
  text: string;
  icon: string;
  color: string;
}

interface ApiResponse {
  factors: string[];
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchExamples: SearchExample[] = [
    { 
      text: "Recommend me a ...", 
      icon: "✨", 
      color: "var(--blue-glow)"
    },
    { 
      text: "Find me the best ...", 
      icon: "🔍", 
      color: "var(--accent-teal)"
    },
    { 
      text: "I am looking for a ...", 
      icon: "🎯", 
      color: "var(--text-primary)"
    },
    { 
      text: "Help me choose a ...", 
      icon: "💡", 
      color: "var(--blue-glow)"
    }
  ];

  const popularSearches: PopularSearch[] = [
    { 
      name: "Laptops", 
      icon: "💻",
      description: "Find the perfect laptop for your needs"
    },
    { 
      name: "Smartphones", 
      icon: "📱",
      description: "Compare the latest flagship phones"
    },
    { 
      name: "Cameras", 
      icon: "📸",
      description: "Discover your ideal photography gear"
    },
    { 
      name: "Smart Watches", 
      icon: "⌚",
      description: "Explore cutting-edge wearable tech"
    }
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
      const response = await api.post<ApiResponse>('/generate-factors', {
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
      
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.div 
            className="hero-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Expertosy Match
            </motion.h1>
            <motion.h2 
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Your AI-Powered Personal Shopping Assistant
            </motion.h2>
          </motion.div>
          
          <motion.div 
            className={`search-container ${isSearchFocused ? 'focused' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="search-box">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="What are you looking to find?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <motion.button 
                className="search-button"
                onClick={handleSearch}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="loading-animation">
                    <div className="loading-ring"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <span className="button-icon">✨</span>
                    Let's find it
                  </>
                )}
              </motion.button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <span className="error-icon">⚠️</span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            className="examples-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {searchExamples.map((example, index) => (
              <motion.button
                key={index}
                className="example-item"
                style={{ '--highlight-color': example.color } as React.CSSProperties}
                onClick={() => handleExampleClick(example.text)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="example-icon">{example.icon}</span>
                <span className="example-text">{example.text}</span>
              </motion.button>
            ))}
          </motion.div>

          <motion.div 
            className="popular-searches"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h2 className="popular-searches-title">Popular Searches</h2>
            <div className="tags-grid">
              <motion.div 
                className="tag-item"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSearchQuery("laptop")}
              >
                <div className="tag-icon">💻</div>
                <div className="tag-content">
                  <h3 className="tag-title">Laptops</h3>
                  <p className="tag-description">Find the perfect laptop for your needs</p>
                </div>
              </motion.div>
              <motion.div 
                className="tag-item"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSearchQuery("smartphone")}
              >
                <div className="tag-icon">📱</div>
                <div className="tag-content">
                  <h3 className="tag-title">Smartphones</h3>
                  <p className="tag-description">Compare the latest flagship phones</p>
                </div>
              </motion.div>
              <motion.div 
                className="tag-item"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSearchQuery("camera")}
              >
                <div className="tag-icon">📸</div>
                <div className="tag-content">
                  <h3 className="tag-title">Cameras</h3>
                  <p className="tag-description">Discover your ideal photography gear</p>
                </div>
              </motion.div>
              <motion.div 
                className="tag-item"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSearchQuery("smartwatch")}
              >
                <div className="tag-icon">⌚</div>
                <div className="tag-content">
                  <h3 className="tag-title">Smart Watches</h3>
                  <p className="tag-description">Explore cutting-edge wearable tech</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage; 