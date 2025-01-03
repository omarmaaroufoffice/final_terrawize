import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import Navigation from './shared/Navigation';
import './rest.css';
import './mediablocas.css';

interface PopularSearch {
  name: string;
  icon: React.ReactNode;
}

interface SearchExample {
  prefix: string;
  icon: React.ReactNode;
  color: string;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const popularSearches: PopularSearch[] = [
    { 
      name: 'Laptops', 
      icon: (
        <div className="custom-icon">
          <div className="icon-laptop">
            <div className="icon-laptop-screen">
              <div className="icon-laptop-glow"></div>
            </div>
            <div className="icon-laptop-base"></div>
            <div className="icon-laptop-keyboard">
              <div className="icon-laptop-key"></div>
              <div className="icon-laptop-key"></div>
              <div className="icon-laptop-key"></div>
            </div>
          </div>
        </div>
      )
    },
    { 
      name: 'Smartphones', 
      icon: (
        <div className="custom-icon">
          <div className="icon-phone">
            <div className="icon-phone-screen">
              <div className="icon-phone-glow"></div>
            </div>
            <div className="icon-phone-button"></div>
            <div className="icon-phone-camera"></div>
          </div>
        </div>
      )
    },
    { 
      name: 'Cameras', 
      icon: (
        <div className="custom-icon">
          <div className="icon-camera">
            <div className="icon-camera-body">
              <div className="icon-camera-lens">
                <div className="icon-camera-aperture"></div>
              </div>
              <div className="icon-camera-flash"></div>
            </div>
            <div className="icon-camera-grip"></div>
          </div>
        </div>
      )
    },
    { 
      name: 'Smart Watches', 
      icon: (
        <div className="custom-icon">
          <div className="icon-watch">
            <div className="icon-watch-face">
              <div className="icon-watch-screen">
                <div className="icon-watch-glow"></div>
              </div>
              <div className="icon-watch-button"></div>
            </div>
            <div className="icon-watch-band-top"></div>
            <div className="icon-watch-band-bottom"></div>
          </div>
        </div>
      )
    }
  ];

  const searchExamples = [
    { 
      prefix: "Recommend me a", 
      icon: (
        <div className="custom-icon">
          <div className="icon-target">
            <div className="icon-target-rings">
              <div className="icon-target-ring"></div>
              <div className="icon-target-ring"></div>
              <div className="icon-target-ring"></div>
            </div>
            <div className="icon-target-lines">
              <div className="icon-target-line"></div>
              <div className="icon-target-line"></div>
            </div>
          </div>
        </div>
      ), 
      color: "blue" 
    },
    { 
      prefix: "Find me the best", 
      icon: (
        <div className="custom-icon">
          <div className="icon-star">
            <div className="icon-star-core">
              <div className="icon-star-point"></div>
              <div className="icon-star-point"></div>
              <div className="icon-star-point"></div>
              <div className="icon-star-point"></div>
              <div className="icon-star-point"></div>
            </div>
            <div className="icon-star-center"></div>
            <div className="icon-star-rays">
              <div className="icon-star-ray"></div>
              <div className="icon-star-ray"></div>
              <div className="icon-star-ray"></div>
              <div className="icon-star-ray"></div>
              <div className="icon-star-ray"></div>
              <div className="icon-star-ray"></div>
            </div>
          </div>
        </div>
      ), 
      color: "gold" 
    },
    { 
      prefix: "I am looking for a", 
      icon: (
        <div className="custom-icon">
          <div className="icon-search">
            <div className="icon-search-circle"></div>
            <div className="icon-search-handle"></div>
            <div className="icon-search-rays">
              <div className="icon-search-ray"></div>
              <div className="icon-search-ray"></div>
              <div className="icon-search-ray"></div>
              <div className="icon-search-ray"></div>
            </div>
          </div>
        </div>
      ), 
      color: "purple" 
    },
    { 
      prefix: "Help me choose a", 
      icon: (
        <div className="custom-icon">
          <div className="icon-bulb">
            <div className="icon-bulb-body">
              <div className="icon-bulb-glow"></div>
            </div>
            <div className="icon-bulb-base"></div>
            <div className="icon-bulb-sparks">
              <div className="icon-bulb-spark"></div>
              <div className="icon-bulb-spark"></div>
              <div className="icon-bulb-spark"></div>
              <div className="icon-bulb-spark"></div>
              <div className="icon-bulb-spark"></div>
            </div>
          </div>
        </div>
      ), 
      color: "green" 
    }
  ];

  const handleExampleClick = (prefix: string) => {
    setSearchQuery(prefix + " ");
    const searchInput = document.querySelector('.search-box input') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      const length = prefix.length + 1;
      searchInput.setSelectionRange(length, length);
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
        console.error('Invalid response format:', response.data);
        setError('Received invalid response format from server. Please try again.');
      }
    } catch (error: any) {
      console.error('Error generating questionnaire:', error);
      if (error?.isAxiosError) {
        if (error.code === 'ERR_NETWORK') {
          setError('Unable to connect to the server. Please try again later.');
        } else {
          const errorMessage = error.response?.data?.error || 'An error occurred. Please try again.';
          console.error('Server error:', errorMessage);
          setError(errorMessage);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopularSearch = async (search: PopularSearch) => {
    setSearchQuery(search.name);
    setIsLoading(true);
    
    try {
      const response = await api.post('/generate-factors', {
        search_query: search.name.trim()
      });

      if (response.data && Array.isArray(response.data.factors) && response.data.factors.length > 0) {
        navigate('/questionnaire', {
          state: {
            searchQuery: search.name.trim(),
            factors: response.data.factors
          }
        });
      } else {
        console.error('Invalid response format:', response.data);
        setError('Received invalid response format from server. Please try again.');
      }
    } catch (error: any) {
      console.error('Error generating questionnaire:', error);
      if (error?.isAxiosError) {
        if (error.code === 'ERR_NETWORK') {
          setError('Unable to connect to the server. Please try again later.');
        } else {
          const errorMessage = error.response?.data?.error || 'An error occurred. Please try again.';
          console.error('Server error:', errorMessage);
          setError(errorMessage);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <Navigation />
      <div className="content">
        <section className="hero-section">
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
                  <span className="search-button-text">Let's find it</span>
                )}
              </button>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            
            <div className="search-examples">
              <div className="examples-grid">
                {searchExamples.map((example, index) => (
                  <button
                    key={index}
                    className={`example-item example-${example.color}`}
                    onClick={() => handleExampleClick(example.prefix)}
                  >
                    <span className="example-text">{example.prefix}...</span>
                  </button>
                ))}
              </div>
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
                    onClick={() => handlePopularSearch(search)}
                  >
                    {search.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage; 