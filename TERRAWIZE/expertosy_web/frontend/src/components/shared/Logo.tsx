import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="logo">
      <div className="logo-content">
        <div className="logo-icon">
          <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className="star-outer" d="M20 0L24.4903 15.5097L40 20L24.4903 24.4903L20 40L15.5097 24.4903L0 20L15.5097 15.5097L20 0Z" fill="#4A90E2"/>
            <path className="star-outer" d="M32.8 7.2L22.8 17.2L20 20L17.2 22.8L7.2 32.8L17.2 22.8L20 20L22.8 17.2L32.8 7.2Z" fill="#4A90E2"/>
            <path className="star-outer" d="M7.2 7.2L17.2 17.2L20 20L22.8 22.8L32.8 32.8L22.8 22.8L20 20L17.2 17.2L7.2 7.2Z" fill="#4A90E2"/>
            <path className="star-inner" d="M20 8L22.4721 16.5279L31 20L22.4721 23.4721L20 32L17.5279 23.4721L9 20L17.5279 16.5279L20 8Z" fill="#FFD700"/>
          </svg>
        </div>
        <div className="logo-text-container">
          <span className="logo-text">Expertosy</span>
          <span className="logo-subtitle">AI Recommendation Engine</span>
        </div>
      </div>
    </Link>
  );
};

export default Logo; 