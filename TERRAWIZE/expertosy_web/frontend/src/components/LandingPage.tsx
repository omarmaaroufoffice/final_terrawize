import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import './LandingPage.css';

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
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const popularSearches: PopularSearch[] = [
    { 
      name: 'Laptops', 
      icon: (
        <div className="custom-icon">
          <div className="icon-laptop" />
        </div>
      )
    },
    { 
      name: 'Smartphones', 
      icon: (
        <div className="custom-icon">
          <div className="icon-phone" />
        </div>
      )
    },
    { 
      name: 'Cameras', 
      icon: (
        <div className="custom-icon">
          <div className="icon-camera" />
        </div>
      )
    },
    { 
      name: 'Smart Watches', 
      icon: (
        <div className="custom-icon">
          <div className="icon-watch" />
        </div>
      )
    }
  ];

  const features = [
    {
      icon: (
        <div className="custom-icon">
          <div className="icon-target">
            <div className="icon-target-vertical" />
          </div>
        </div>
      ),
      title: 'Smart Recommendations',
      description: 'AI-powered suggestions tailored to your unique preferences and needs'
    },
    {
      icon: (
        <div className="custom-icon">
          <div className="icon-brain">
            <div className="icon-brain-circles" />
          </div>
        </div>
      ),
      title: 'Advanced Analysis',
      description: 'Deep learning algorithms process thousands of data points for accuracy'
    },
    {
      icon: (
        <div className="custom-icon">
          <div className="icon-compare">
            <div className="icon-compare-lines" />
          </div>
        </div>
      ),
      title: 'Intelligent Comparison',
      description: 'Smart feature comparison helps you make informed decisions'
    },
    {
      icon: (
        <div className="custom-icon">
          <div className="icon-lightning">
            <div className="icon-lightning-bolt" />
          </div>
        </div>
      ),
      title: 'Lightning Fast',
      description: 'Get instant, personalized recommendations in seconds'
    }
  ];

  const searchExamples = [
    { 
      prefix: "Recommend me a", 
      icon: (
        <div className="custom-icon">
          <div className="icon-target">
            <div className="icon-target-vertical" />
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
            <span></span>
            <span></span>
          </div>
        </div>
      ), 
      color: "gold" 
    },
    { 
      prefix: "I am looking for a", 
      icon: (
        <div className="custom-icon">
          <div className="icon-search" />
        </div>
      ), 
      color: "purple" 
    },
    { 
      prefix: "Help me choose a", 
      icon: (
        <div className="custom-icon">
          <div className="icon-bulb" />
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
      // Place cursor at the end
      const length = prefix.length + 1;
      searchInput.setSelectionRange(length, length);
    }
  };

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

  const handleScrollToHowItWorks = () => {
    const howItWorksSection = document.querySelector('.how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
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
            <div className="main-title">
              <span className="gradient-text">Expertosy</span>
              <span className="accent-text">Match</span>
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
                  <span className="search-button-text">Lets find it</span>
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
                    <span className="example-icon">{example.icon}</span>
                    <span className="example-text">
                      <span className="example-prefix">{example.prefix}</span>
                      <span className="example-placeholder">...</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="popular-searches">
              <div className="popular-searches-header">
                <span className="popular-searches-icon">🔥</span>
                <h3>Popular Searches</h3>
              </div>
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
        </div>
      </section>

      <section className="how-it-works">
        <div className="steps">
          <div className="step">
            <div className="step-content">
              <div className="step-number">1</div>
              <h3>Tell Us What You Need</h3>
              <p>Describe your ideal product and let our AI decode your requirements</p>
            </div>
            <div className="step-illustration">
              <div className="step-icon">
                <div className="custom-icon">
                  <div className="icon-input">
                    <div className="icon-input-cursor" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="step">
            <div className="step-content">
              <div className="step-number">2</div>
              <h3>Answer Smart Questions</h3>
              <p>Engage with our AI's personalized questions to refine your perfect match</p>
            </div>
            <div className="step-illustration">
              <div className="step-icon">
                <div className="custom-icon">
                  <div className="icon-questions">
                    <div className="icon-questions-dots" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="step">
            <div className="step-content">
              <div className="step-number">3</div>
              <h3>Get Perfect Matches</h3>
              <p>Discover your ideal products, expertly curated by our AI just for you</p>
            </div>
            <div className="step-illustration">
              <div className="step-icon">
                <div className="custom-icon">
                  <div className="icon-match">
                    <div className="icon-match-check" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
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
      </section>
    </div>
  );
};

export default LandingPage; 