import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="nav-container">
      <Link to="/" className="nav-logo">
        <img src="/logo.png" alt="Expertosy" />
        <div className="nav-text">
          <div className="nav-logo-text">Expertosy</div>
          <div className="nav-subtitle">AI recommendation service</div>
        </div>
      </Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/questionnaire" className="nav-link">Questionnaire</Link>
      </div>
    </nav>
  );
};

export default Navigation; 