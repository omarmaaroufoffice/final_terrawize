import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`nav-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-content">
        <Link to="/" className="logo-link">
          <div className="logo">
            <div className="logo-icon-container">
              <span className="logo-icon">⭐</span>
              <div className="logo-glow"></div>
            </div>
            <div className="logo-text-container">
              <span className="logo-text">Expertosy</span>
              <span className="logo-tagline">AI Product Matcher</span>
            </div>
          </div>
        </Link>
        <div className="nav-links">
          {location.pathname !== '/' && (
            <Link to="/" className="nav-link">
              <span className="nav-link-icon">🏠</span>
              Home
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 