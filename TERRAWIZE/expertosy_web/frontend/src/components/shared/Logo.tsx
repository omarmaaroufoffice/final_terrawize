import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="logo-container">
      <div className="logo">
        <div className="logo-icon">
          <div className="logo-ring"></div>
          <div className="logo-core">
            <div className="logo-glow"></div>
          </div>
          <div className="logo-particles">
            <div className="logo-particle"></div>
            <div className="logo-particle"></div>
            <div className="logo-particle"></div>
          </div>
        </div>
        <div className="logo-text">
          <span className="logo-text-main">Expertosy</span>
          <span className="logo-text-sub">AI</span>
        </div>
      </div>
    </Link>
  );
};

export default Logo; 