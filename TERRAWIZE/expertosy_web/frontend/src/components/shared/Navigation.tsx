import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';
import logo from '../../assets/logo.svg';

const Navigation: React.FC = () => {
  return (
    <nav className="nav-container">
      <Link to="/" className="nav-logo">
        <img src={logo} alt="Expertosy Logo" />
        <div className="nav-text">
          <span className="nav-logo-text">Expertosy</span>
          <span className="nav-subtitle">AI recommendation service</span>
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