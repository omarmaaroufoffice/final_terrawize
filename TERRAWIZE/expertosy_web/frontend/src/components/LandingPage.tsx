import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
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
      <div className="background-effects">
        <div className="constellation-grid" />
        <div className="nebula-overlay" />
      </div>
      
      <section className="hero-section">
        <div className="hero-content">
          <div className="title-container">
            <h1 className="main-title">
              <span className="title-line highlight">Expertosy Match</span>
            </h1>
            <div className="subtitle-container">
              <div className="subtitle-content">
                <div className="subtitle-icon-container">
                  <span className="subtitle-icon">✨</span>
                </div>
                <div className="subtitle-description">
                  Discover your perfect match with precision and clarity, free from sponsored noise
                </div>
              </div>
            </div>
          </div>
          
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
                  <>
                    <span>Begin Journey</span>
                    <span className="button-star">✨</span>
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
          </div>

          <div className="popular-searches">
            <h3>Popular Discoveries</h3>
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
    </div>
  );
};

export default LandingPage; 