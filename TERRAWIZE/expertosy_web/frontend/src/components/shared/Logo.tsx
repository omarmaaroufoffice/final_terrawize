import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="logo-container">
      <div className="logo">
        <div className="logo-symbol">
          <div className="logo-hexagon">
            <div className="logo-inner-glow"></div>
          </div>
          <div className="logo-beam"></div>
          <div className="logo-dots">
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
          </div>
        </div>
        <div className="logo-text">
          <span className="logo-text-main">Expertosy</span>
          <div className="logo-text-separator"></div>
          <span className="logo-text-sub">AI</span>
        </div>
      </div>
    </Link>
  );
};

export default Logo; 