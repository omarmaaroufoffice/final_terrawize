import React, { useState, useEffect } from 'react';
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
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

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
      <Navigation />
      <div className="content">
        <section className="hero-section">
          <div className="hero-content">
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

        <section className="features-showcase">
          <div className="features-grid">
            <div className="feature-card process">
              <div className="feature-icon">
                <div className="icon-process">
                  <div className="process-steps">
                    <div className="process-step">1</div>
                    <div className="process-arrow">→</div>
                    <div className="process-step">2</div>
                    <div className="process-arrow">→</div>
                    <div className="process-step">3</div>
                  </div>
                </div>
              </div>
              <h3>Quick 3-Step Magic</h3>
              <p>Tell us what you need → Answer a few smart questions → Get perfect matches</p>
            </div>

            <div className="feature-card ai">
              <div className="feature-icon">
                <div className="icon-brain">
                  <div className="brain-waves"></div>
                  <div className="brain-core"></div>
                </div>
              </div>
              <h3>AI-Powered Genius</h3>
              <p>Our smart AI analyzes thousands of options to find your perfect match</p>
            </div>

            <div className="feature-card speed">
              <div className="feature-icon">
                <div className="icon-speed">
                  <div className="speed-lines"></div>
                  <div className="speed-star"></div>
                </div>
              </div>
              <h3>Lightning Fast</h3>
              <p>Get personalized recommendations in seconds, not hours</p>
            </div>

            <div className="feature-card accuracy">
              <div className="feature-icon">
                <div className="icon-target">
                  <div className="target-rings"></div>
                  <div className="target-dot"></div>
                </div>
              </div>
              <h3>Spot-On Accuracy</h3>
              <p>Tailored suggestions that match your exact needs and preferences</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage; 