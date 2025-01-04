import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="logo-container">
      <div className="logo">
        <div className="logo-icon">
          <div className="logo-outer-ring"></div>
          <div className="logo-middle-ring"></div>
          <div className="logo-inner-ring"></div>
          <div className="logo-particles"></div>
          <div className="logo-core">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="16" fill="url(#logo-gradient)" />
              <path d="M20 12C23.866 12 27 15.134 27 19C27 22.866 23.866 26 20 26C16.134 26 13 22.866 13 19C13 15.134 16.134 12 20 12ZM20 14C17.2386 14 15 16.2386 15 19C15 21.7614 17.2386 24 20 24C22.7614 24 25 21.7614 25 19C25 16.2386 22.7614 14 20 14Z" fill="white"/>
              <defs>
                <linearGradient id="logo-gradient" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4F46E5"/>
                  <stop offset="1" stopColor="#10B981"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <span className="logo-text">Expertosy</span>
      </div>
    </Link>
  );
};

export default Logo; 