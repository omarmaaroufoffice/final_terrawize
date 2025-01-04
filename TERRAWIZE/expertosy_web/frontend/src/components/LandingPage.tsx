import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';
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

const MotionDiv = motion.div;
const MotionButton = motion.button;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchExamples: SearchExample[] = [
    { 
      text: "Recommend me a ...", 
      icon: "⭐", 
      color: "var(--nova-gold)"
    },
    { 
      text: "Find me the best ...", 
      icon: "🔍", 
      color: "var(--starlight-blue)"
    },
    { 
      text: "I am looking for a ...", 
      icon: "🎯", 
      color: "var(--accent-green)"
    },
    { 
      text: "Help me choose a ...", 
      icon: "💡", 
      color: "var(--primary-blue)"
    }
  ];

  const popularSearches: PopularSearch[] = [
    { 
      name: "Laptops", 
      icon: "💻",
      description: "Find your perfect laptop for work or play"
    },
    { 
      name: "Smartphones", 
      icon: "📱",
      description: "Compare the latest mobile devices"
    },
    { 
      name: "Cameras", 
      icon: "📸",
      description: "Capture life's moments with the right camera"
    },
    { 
      name: "Smart Watches", 
      icon: "⌚",
      description: "Stay connected with modern wearables"
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / card.offsetWidth) * 100;
    const y = ((e.clientY - rect.top) / card.offsetHeight) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <div className="landing-page">
      <Navigation />
      
      <div className="landing-content">
        <MotionDiv 
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-content">
            <MotionDiv 
              className="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Expertosy Match
            </MotionDiv>
            <MotionDiv 
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Your AI-Powered Personal Shopping Assistant
            </MotionDiv>
            
            <MotionDiv 
              className={`search-container ${isSearchFocused ? 'focused' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
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
                <MotionButton 
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
                </MotionButton>
              </div>

              <AnimatePresence>
                {error && (
                  <MotionDiv 
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <span className="error-icon">⚠️</span>
                    {error}
                  </MotionDiv>
                )}
              </AnimatePresence>
            </MotionDiv>

            <MotionDiv 
              className="examples-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {searchExamples.map((example, index) => (
                <MotionDiv
                  key={index}
                  className="example-item"
                  style={{ '--highlight-color': example.color } as React.CSSProperties}
                  onClick={() => handleExampleClick(example.text)}
                  onMouseMove={handleMouseMove}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="example-icon">{example.icon}</span>
                  <span className="example-text">{example.text}</span>
                </MotionDiv>
              ))}
            </MotionDiv>

            <MotionDiv 
              className="popular-searches"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <div className="popular-searches-header">
                <span className="popular-searches-icon">⭐</span>
                <h3>Popular Searches</h3>
              </div>
              <div className="tags">
                {popularSearches.map((search, index) => (
                  <MotionButton
                    key={index}
                    className="tag"
                    onClick={() => setSearchQuery(search.name)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="tag-icon">{search.icon}</span>
                    <div className="tag-content">
                      <span className="tag-name">{search.name}</span>
                      <span className="tag-description">{search.description}</span>
                    </div>
                  </MotionButton>
                ))}
              </div>
            </MotionDiv>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
};

export default LandingPage; 