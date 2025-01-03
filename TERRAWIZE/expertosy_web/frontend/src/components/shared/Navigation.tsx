import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🤖</span>
          <div className="logo-text">
            <span className="logo-name">Expertosy</span>
            <span className="logo-subtitle">AI recommendation service</span>
          </div>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/questionnaire" className="nav-link">Questionnaire</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 