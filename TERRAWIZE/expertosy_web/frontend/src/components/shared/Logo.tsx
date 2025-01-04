import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="logo">
      <div className="logo-icon">
        <div className="logo-particles"></div>
        <div className="logo-inner-ring"></div>
        <img src="/logo.png" alt="Expertosy Logo" />
      </div>
      <span className="logo-text">Expertosy</span>
    </Link>
  );
};

export default Logo; 