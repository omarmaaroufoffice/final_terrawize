import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="logo-container">
      <div className="logo">
        <div className="logo-symbol">
          <div className="logo-star-container">
            <div className="logo-star-outer"></div>
            <div className="logo-star-inner"></div>
            <div className="logo-star-core"></div>
            <div className="logo-rays">
              <div className="logo-ray"></div>
              <div className="logo-ray"></div>
              <div className="logo-ray"></div>
              <div className="logo-ray"></div>
            </div>
            <div className="logo-sparkles">
              <div className="logo-sparkle"></div>
              <div className="logo-sparkle"></div>
              <div className="logo-sparkle"></div>
            </div>
          </div>
        </div>
        <div className="logo-text-group">
          <div className="logo-text-main">
            <span className="logo-text-expertosy">Expertosy</span>
          </div>
          <div className="logo-text-sub">
            <span className="logo-text-ai">AI</span>
            <span className="logo-text-service">recommendation service</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Logo; 