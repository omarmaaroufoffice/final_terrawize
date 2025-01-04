import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="logo">
      <div className="logo-icon">
        <div className="logo-outer-ring"></div>
        <div className="logo-middle-ring"></div>
        <div className="logo-inner-ring"></div>
        <div className="logo-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
        </div>
        <div className="logo-glow"></div>
        <img src="/logo.png" alt="Expertosy Logo" className="logo-image" />
      </div>
      <span className="logo-text">Expertosy</span>
    </Link>
  );
};

export default Logo; 