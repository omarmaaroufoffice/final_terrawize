import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="nav-bar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <div className="logo-outer-glow"></div>
          <div className="logo-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
          </div>
          <div className="logo-inner-ring"></div>
          <img src={logo} alt="Expertosy Logo" />
          <span className="nav-logo-text">Expertosy</span>
        </Link>
        {/* Rest of the navigation content */}
      </div>
    </nav>
  );
};

export default Navigation; 