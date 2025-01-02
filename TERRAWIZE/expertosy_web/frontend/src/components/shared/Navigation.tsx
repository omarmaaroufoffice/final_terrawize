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
              <div className="logo-icon">
                <div className="custom-star">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="logo-glow"></div>
            </div>
            <div className="logo-text-container">
              <span className="logo-text">Expertosy</span>
              <span className="logo-tagline">AI Recomendation Engine</span>
            </div>
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation; 